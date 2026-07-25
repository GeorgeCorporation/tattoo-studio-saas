export const clientSources = ["artist_client", "studio_referral"] as const;
export type ClientSource = (typeof clientSources)[number];

export const clientSourceLabels: Record<ClientSource, string> = {
  artist_client: "Cliente do tatuador",
  studio_referral: "Indicação do estúdio",
};

export type CalculateCommissionBreakdownInput = {
  amount: number;
  percentage: number;
  clientSource: ClientSource;
  capEnabled: boolean;
  monthlyCap: number | null;
  consumedCapAmount: number;
};

export type CommissionBreakdown = {
  rawCommissionAmount: number;
  commissionAmount: number;
  capConsumedAmount: number;
  capApplied: boolean;
};

export type FinancePaymentSnapshot = {
  amount: number;
  type: "signal" | "final" | "extra" | null;
  paid_at: string | null;
  created_at: string;
  appointments: {
    tattoo_artists: { id: string; name: string } | null;
  } | null;
  payment_commissions: Array<{
    commission_amount: number;
    cap_applied: boolean;
    cap_consumed_amount: number;
    client_source: ClientSource;
  }>;
};

export type FinanceCommissionRuleSnapshot = {
  artist_id: string;
  is_active: boolean;
  monthly_cap: number | null;
};

export type MonthSummary = {
  monthRevenue: number;
  signalTotal: number;
  finalTotal: number;
  cancelledCount: number;
  totalCommission: number;
  cappedCommissionCount: number;
  studioNetRevenue: number;
};

export type ArtistCommissionSummary = {
  artist_id: string;
  artist_name: string;
  monthlyRevenue: number;
  ownClientCommission: number;
  studioReferralCommission: number;
  totalCommission: number;
  capValue: number | null;
  capConsumed: number;
  capReached: boolean;
};

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isPaidInMonth(payment: FinancePaymentSnapshot, year: number, month: number) {
  if (!payment.paid_at) return false;
  const paidAt = new Date(payment.paid_at);
  return paidAt.getUTCFullYear() === year && paidAt.getUTCMonth() + 1 === month;
}

export function isClientSource(value: string): value is ClientSource {
  return clientSources.includes(value as ClientSource);
}

export function normalizeClientSource(value: string | null | undefined): ClientSource {
  return value === "studio_referral" ? "studio_referral" : "artist_client";
}

export function calculateCommissionBreakdown(input: CalculateCommissionBreakdownInput): CommissionBreakdown {
  const safeAmount = Math.max(0, Number(input.amount || 0));
  const safePercentage = Math.max(0, Number(input.percentage || 0));
  const rawCommissionAmount = roundCurrency((safeAmount * safePercentage) / 100);

  if (input.clientSource === "studio_referral") {
    return {
      rawCommissionAmount,
      commissionAmount: rawCommissionAmount,
      capConsumedAmount: 0,
      capApplied: false,
    };
  }

  if (!input.capEnabled || input.monthlyCap === null) {
    return {
      rawCommissionAmount,
      commissionAmount: rawCommissionAmount,
      capConsumedAmount: rawCommissionAmount,
      capApplied: false,
    };
  }

  const remainingCap = Math.max(0, roundCurrency(input.monthlyCap - input.consumedCapAmount));
  const commissionAmount = roundCurrency(Math.min(rawCommissionAmount, remainingCap));

  return {
    rawCommissionAmount,
    commissionAmount,
    capConsumedAmount: commissionAmount,
    capApplied: commissionAmount < rawCommissionAmount,
  };
}

export function buildMonthSummary(
  payments: FinancePaymentSnapshot[],
  cancelledCount: number,
  year: number,
  month: number,
): MonthSummary {
  let monthRevenue = 0;
  let signalTotal = 0;
  let finalTotal = 0;
  let totalCommission = 0;
  let cappedCommissionCount = 0;

  for (const payment of payments) {
    if (!isPaidInMonth(payment, year, month)) continue;

    const amount = Number(payment.amount ?? 0);
    monthRevenue += amount;
    if (payment.type === "signal") signalTotal += amount;
    if (payment.type === "final") finalTotal += amount;

    for (const commission of payment.payment_commissions ?? []) {
      totalCommission += Number(commission.commission_amount ?? 0);
      if (commission.cap_applied) cappedCommissionCount += 1;
    }
  }

  return {
    monthRevenue: roundCurrency(monthRevenue),
    signalTotal: roundCurrency(signalTotal),
    finalTotal: roundCurrency(finalTotal),
    cancelledCount,
    totalCommission: roundCurrency(totalCommission),
    cappedCommissionCount,
    studioNetRevenue: roundCurrency(monthRevenue - totalCommission),
  };
}

export function buildArtistCommissionSummaries(
  payments: FinancePaymentSnapshot[],
  rules: FinanceCommissionRuleSnapshot[],
  year: number,
  month: number,
): ArtistCommissionSummary[] {
  const activeRuleByArtist = new Map<string, FinanceCommissionRuleSnapshot>();
  for (const rule of rules) {
    if (rule.is_active && !activeRuleByArtist.has(rule.artist_id)) {
      activeRuleByArtist.set(rule.artist_id, rule);
    }
  }

  const byArtist = new Map<string, ArtistCommissionSummary>();
  for (const payment of payments) {
    if (!isPaidInMonth(payment, year, month)) continue;
    const artist = payment.appointments?.tattoo_artists;
    if (!artist) continue;

    const existing = byArtist.get(artist.id) ?? {
      artist_id: artist.id,
      artist_name: artist.name,
      monthlyRevenue: 0,
      ownClientCommission: 0,
      studioReferralCommission: 0,
      totalCommission: 0,
      capValue: activeRuleByArtist.get(artist.id)?.monthly_cap ?? null,
      capConsumed: 0,
      capReached: false,
    };

    existing.monthlyRevenue = roundCurrency(existing.monthlyRevenue + Number(payment.amount ?? 0));
    for (const commission of payment.payment_commissions ?? []) {
      const amount = Number(commission.commission_amount ?? 0);
      if (normalizeClientSource(commission.client_source) === "studio_referral") {
        existing.studioReferralCommission = roundCurrency(existing.studioReferralCommission + amount);
      } else {
        existing.ownClientCommission = roundCurrency(existing.ownClientCommission + amount);
        existing.capConsumed = roundCurrency(existing.capConsumed + Number(commission.cap_consumed_amount ?? 0));
      }

      existing.totalCommission = roundCurrency(existing.totalCommission + amount);
      existing.capReached ||=
        Boolean(commission.cap_applied) || (existing.capValue !== null && existing.capConsumed >= existing.capValue);
    }

    byArtist.set(artist.id, existing);
  }

  return Array.from(byArtist.values()).sort((left, right) => right.totalCommission - left.totalCommission);
}
