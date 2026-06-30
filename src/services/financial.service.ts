import type { PaymentMethod, PaymentType } from "@/lib/appointment-domain";
import { supabase } from "@/lib/supabase";

export type { PaymentMethod, PaymentType };

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
    clients: { name: string } | null;
    tattoo_artists: { name: string } | null;
    services: { name: string } | null;
  } | null;
};

export type FinancialAppointmentOption = {
  id: string;
  date: string;
  time: string;
  clients: { name: string } | null;
  tattoo_artists: { name: string } | null;
  services: { name: string } | null;
};

export type CreatePaymentData = {
  studioId: string;
  appointmentId: string;
  type: PaymentType;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
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

export async function getPaymentsByMonth(studioId: string, year: number, month: number) {
  const { start, end } = monthRange(year, month);

  const { data, error } = await supabase
    .from("payments")
    .select(
      "id, amount, type, method, paid_at, created_at, appointments(id, date, clients(name), tattoo_artists(name), services(name))",
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

  const [{ data: payments, error: paymentsError }, { data: cancelled, error: cancelledError }] =
    await Promise.all([
      supabase
        .from("payments")
        .select("amount, type")
        .eq("studio_id", studioId)
        .gte("paid_at", start)
        .lt("paid_at", end),
      supabase
        .from("appointments")
        .select("id")
        .eq("studio_id", studioId)
        .eq("status", "cancelled")
        .gte("date", startDate)
        .lt("date", endDate),
    ]);

  if (paymentsError) throw paymentsError;
  if (cancelledError) throw cancelledError;

  const monthRevenue = payments?.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0) ?? 0;
  const signalTotal =
    payments
      ?.filter((payment) => payment.type === "signal")
      .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0) ?? 0;
  const finalTotal =
    payments
      ?.filter((payment) => payment.type === "final")
      .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0) ?? 0;

  return {
    monthRevenue,
    signalTotal,
    finalTotal,
    cancelledCount: cancelled?.length ?? 0,
  };
}

export async function createPayment(data: CreatePaymentData) {
  const { error } = await supabase.from("payments").insert({
    studio_id: data.studioId,
    appointment_id: data.appointmentId,
    amount: data.amount,
    type: data.type,
    method: data.method,
    paid_at: data.paidAt,
  });

  if (error) throw error;
}

export async function getAppointmentsForPayment(studioId: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select("id, date, time, clients(name), tattoo_artists(name), services(name)")
    .eq("studio_id", studioId)
    .order("date", { ascending: false })
    .order("time", { ascending: false })
    .limit(50)
    .returns<FinancialAppointmentOption[]>();

  if (error) throw error;
  return data ?? [];
}
