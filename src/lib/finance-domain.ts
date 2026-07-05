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

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function isClientSource(value: string): value is ClientSource {
  return clientSources.includes(value as ClientSource);
}

export function normalizeClientSource(value: string | null | undefined): ClientSource {
  return value === "studio_referral" ? "studio_referral" : "artist_client";
}

export function calculateCommissionBreakdown(
  input: CalculateCommissionBreakdownInput,
): CommissionBreakdown {
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
