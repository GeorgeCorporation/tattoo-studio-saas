import type { PaymentMethod, PaymentType } from "@/lib/appointment-domain";
import { calculateCommissionBreakdown, clientSourceLabels, normalizeClientSource, type ClientSource } from "@/lib/finance-domain";
import { supabase } from "@/lib/supabase";

export type { PaymentMethod, PaymentType, ClientSource };

export type FinancialPayment = {
  id: string;
  amount: number;
  type: PaymentType | null;
  method: PaymentMethod | null;
  paid_at: string | null;
  created_at: string;
  appointments: {
    id: string;
    date: string;
    client_source: string;
    clients: { name: string } | null;
    tattoo_artists: { id: string; name: string } | null;
    services: { name: string } | null;
  } | null;
  payment_commissions: Array<{
    id: string;
    percentage: number;
    commission_amount: number;
    raw_commission_amount: number;
    cap_applied: boolean;
    cap_consumed_amount: number;
    client_source: ClientSource;
  }>;
};

export type FinancialAppointmentOption = {
  id: string;
  date: string;
  time: string;
  client_source: string;
  clients: { name: string } | null;
  tattoo_artists: { id: string; name: string } | null;
  services: { name: string } | null;
};

export type CommissionRule = {
  id: string;
  studio_id: string;
  artist_id: string;
  is_active: boolean;
  percentage: number;
  cap_enabled: boolean;
  monthly_cap: number | null;
  starts_at: string;
  notes: string | null;
  tattoo_artists?: { name: string } | null;
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

export type CreatePaymentData = {
  studioId: string;
  appointmentId: string;
  type: PaymentType;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
};

export type UpsertCommissionRuleData = {
  id?: string;
  studioId: string;
  artistId: string;
  isActive: boolean;
  percentage: number;
  capEnabled: boolean;
  monthlyCap: number | null;
  startsAt: string;
  notes?: string;
};

function monthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

async function getActiveCommissionRule(studioId: string, artistId: string, paidAtDate: string) {
  const { data, error } = await supabase
    .from("artist_commission_rules")
    .select("id, studio_id, artist_id, is_active, percentage, cap_enabled, monthly_cap, starts_at, notes")
    .eq("studio_id", studioId)
    .eq("artist_id", artistId)
    .eq("is_active", true)
    .lte("starts_at", paidAtDate)
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle<CommissionRule>();

  if (error) throw error;
  return data;
}

async function getConsumedCapAmount(studioId: string, artistId: string, paidAtIso: string) {
  const paidAt = new Date(paidAtIso);
  const { start, end } = monthRange(paidAt.getUTCFullYear(), paidAt.getUTCMonth() + 1);

  const { data, error } = await supabase
    .from("payment_commissions")
    .select("cap_consumed_amount, payments!inner(paid_at)")
    .eq("studio_id", studioId)
    .eq("artist_id", artistId)
    .eq("client_source", "artist_client")
    .gte("payments.paid_at", start)
    .lt("payments.paid_at", end);

  if (error) throw error;

  return (data ?? []).reduce((sum, row) => sum + Number(row.cap_consumed_amount ?? 0), 0);
}

async function createPaymentCommissionLedger(data: {
  studioId: string;
  paymentId: string;
  appointmentId: string;
  artistId: string;
  clientSource: ClientSource;
  amount: number;
  paidAt: string;
}) {
  const activeRule = await getActiveCommissionRule(data.studioId, data.artistId, data.paidAt.slice(0, 10));
  const consumedCapAmount = await getConsumedCapAmount(data.studioId, data.artistId, data.paidAt);

  const breakdown = calculateCommissionBreakdown({
    amount: data.amount,
    percentage: Number(activeRule?.percentage ?? 0),
    clientSource: data.clientSource,
    capEnabled: Boolean(activeRule?.cap_enabled),
    monthlyCap: activeRule?.monthly_cap ?? null,
    consumedCapAmount,
  });

  const { error } = await supabase.from("payment_commissions").insert({
    studio_id: data.studioId,
    payment_id: data.paymentId,
    appointment_id: data.appointmentId,
    artist_id: data.artistId,
    rule_id: activeRule?.id ?? null,
    client_source: data.clientSource,
    base_amount: data.amount,
    percentage: Number(activeRule?.percentage ?? 0),
    raw_commission_amount: breakdown.rawCommissionAmount,
    commission_amount: breakdown.commissionAmount,
    cap_consumed_amount: breakdown.capConsumedAmount,
    cap_applied: breakdown.capApplied,
  });

  if (error) throw error;
}

export async function getPaymentsByMonth(studioId: string, year: number, month: number) {
  const { start, end } = monthRange(year, month);

  const { data, error } = await supabase
    .from("payments")
    .select(
      "id, amount, type, method, paid_at, created_at, appointments(id, date, client_source, clients(name), tattoo_artists(id, name), services(name)), payment_commissions(id, percentage, commission_amount, raw_commission_amount, cap_applied, cap_consumed_amount, client_source)",
    )
    .eq("studio_id", studioId)
    .gte("paid_at", start)
    .lt("paid_at", end)
    .order("paid_at", { ascending: false })
    .returns<FinancialPayment[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getMonthSummary(studioId: string, year: number, month: number) {
  const { start, end, startDate, endDate } = monthRange(year, month);

  const [
    { data: payments, error: paymentsError },
    { data: cancelled, error: cancelledError },
    { data: commissions, error: commissionsError },
  ] = await Promise.all([
    supabase.from("payments").select("amount, type").eq("studio_id", studioId).gte("paid_at", start).lt("paid_at", end),
    supabase
      .from("appointments")
      .select("id")
      .eq("studio_id", studioId)
      .eq("status", "cancelled")
      .gte("date", startDate)
      .lt("date", endDate),
    supabase
      .from("payment_commissions")
      .select("commission_amount, cap_applied")
      .eq("studio_id", studioId)
      .gte("created_at", start)
      .lt("created_at", end),
  ]);

  if (paymentsError) throw paymentsError;
  if (cancelledError) throw cancelledError;
  if (commissionsError) throw commissionsError;

  const monthRevenue = payments?.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0) ?? 0;
  const signalTotal =
    payments?.filter((payment) => payment.type === "signal").reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0) ?? 0;
  const finalTotal =
    payments?.filter((payment) => payment.type === "final").reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0) ?? 0;
  const totalCommission =
    commissions?.reduce((sum, item) => sum + Number(item.commission_amount ?? 0), 0) ?? 0;
  const cappedCommissionCount = commissions?.filter((item) => item.cap_applied).length ?? 0;

  return {
    monthRevenue,
    signalTotal,
    finalTotal,
    cancelledCount: cancelled?.length ?? 0,
    totalCommission,
    cappedCommissionCount,
    studioNetRevenue: monthRevenue - totalCommission,
  };
}

export async function getAppointmentsForPayment(studioId: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select("id, date, time, client_source, clients(name), tattoo_artists(id, name), services(name)")
    .eq("studio_id", studioId)
    .order("date", { ascending: false })
    .order("time", { ascending: false })
    .limit(50)
    .returns<FinancialAppointmentOption[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getCommissionRules(studioId: string) {
  const { data, error } = await supabase
    .from("artist_commission_rules")
    .select("id, studio_id, artist_id, is_active, percentage, cap_enabled, monthly_cap, starts_at, notes, tattoo_artists(name)")
    .eq("studio_id", studioId)
    .order("starts_at", { ascending: false })
    .returns<CommissionRule[]>();

  if (error) throw error;
  return data ?? [];
}

export async function upsertCommissionRule(data: UpsertCommissionRuleData) {
  const payload = {
    studio_id: data.studioId,
    artist_id: data.artistId,
    is_active: data.isActive,
    percentage: data.percentage,
    cap_enabled: data.capEnabled,
    monthly_cap: data.capEnabled ? data.monthlyCap : null,
    starts_at: data.startsAt,
    notes: data.notes?.trim() || null,
  };

  if (data.id) {
    const { error } = await supabase.from("artist_commission_rules").update(payload).eq("id", data.id);
    if (error) throw error;
    return data.id;
  }

  const { data: created, error } = await supabase
    .from("artist_commission_rules")
    .insert(payload)
    .select("id")
    .single<{ id: string }>();

  if (error) throw error;
  return created.id;
}

export async function getArtistCommissionSummaries(studioId: string, year: number, month: number) {
  const payments = await getPaymentsByMonth(studioId, year, month);
  const rules = await getCommissionRules(studioId);
  const activeRuleByArtist = new Map<string, CommissionRule>();

  for (const rule of rules) {
    if (rule.is_active && !activeRuleByArtist.has(rule.artist_id)) {
      activeRuleByArtist.set(rule.artist_id, rule);
    }
  }

  const byArtist = new Map<string, ArtistCommissionSummary>();

  for (const payment of payments) {
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

    existing.monthlyRevenue += Number(payment.amount ?? 0);

    for (const commission of payment.payment_commissions ?? []) {
      if (normalizeClientSource(commission.client_source) === "studio_referral") {
        existing.studioReferralCommission += Number(commission.commission_amount ?? 0);
      } else {
        existing.ownClientCommission += Number(commission.commission_amount ?? 0);
        existing.capConsumed += Number(commission.cap_consumed_amount ?? 0);
      }

      existing.totalCommission += Number(commission.commission_amount ?? 0);
      existing.capReached ||= Boolean(commission.cap_applied) || Boolean(existing.capValue && existing.capConsumed >= existing.capValue);
    }

    byArtist.set(artist.id, existing);
  }

  return Array.from(byArtist.values()).sort((left, right) => right.totalCommission - left.totalCommission);
}

export async function createPayment(data: CreatePaymentData) {
  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .select("id, artist_id, client_source")
    .eq("id", data.appointmentId)
    .eq("studio_id", data.studioId)
    .single<{ id: string; artist_id: string | null; client_source: string }>();

  if (appointmentError) throw appointmentError;

  const { data: createdPayment, error } = await supabase
    .from("payments")
    .insert({
      studio_id: data.studioId,
      appointment_id: data.appointmentId,
      amount: data.amount,
      type: data.type,
      method: data.method,
      paid_at: data.paidAt,
    })
    .select("id")
    .single<{ id: string }>();

  if (error) throw error;

  if (appointment.artist_id) {
    try {
      await createPaymentCommissionLedger({
        studioId: data.studioId,
        paymentId: createdPayment.id,
        appointmentId: data.appointmentId,
        artistId: appointment.artist_id,
        clientSource: normalizeClientSource(appointment.client_source),
        amount: data.amount,
        paidAt: data.paidAt,
      });
    } catch (commissionError) {
      await supabase.from("payments").delete().eq("id", createdPayment.id);
      throw commissionError;
    }
  }

  return createdPayment.id;
}

export function getClientSourceLabel(source: string | null | undefined) {
  return clientSourceLabels[normalizeClientSource(source)];
}
