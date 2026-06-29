import { supabase } from "@/lib/supabase";

export type DashboardStudio = {
  id: string;
  name: string;
};

export type DashboardAppointment = {
  id: string;
  date: string;
  time: string;
  status: string;
  clients: { name: string } | null;
  tattoo_artists: { name: string } | null;
  services: { name: string } | null;
};

export async function getCurrentUserStudio(userId: string) {
  const { data, error } = await supabase
    .from("studios")
    .select("id, name")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle<DashboardStudio>();

  if (error) throw error;
  return data;
}

export async function getTodayAppointments(studioId: string) {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("appointments")
    .select("id")
    .eq("studio_id", studioId)
    .eq("date", today);

  if (error) throw error;
  return data?.length ?? 0;
}

export async function getWeekAppointments(studioId: string) {
  const start = new Date();
  const end = new Date();
  end.setDate(start.getDate() + 7);

  const { data, error } = await supabase
    .from("appointments")
    .select("id")
    .eq("studio_id", studioId)
    .gte("date", start.toISOString().split("T")[0])
    .lte("date", end.toISOString().split("T")[0]);

  if (error) throw error;
  return data?.length ?? 0;
}

export async function getMonthRevenue(studioId: string) {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("payments")
    .select("amount")
    .eq("studio_id", studioId)
    .gte("created_at", start.toISOString());

  if (error) throw error;
  return data?.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0) ?? 0;
}

export async function getTotalClients(studioId: string) {
  const { count, error } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true })
    .eq("studio_id", studioId);

  if (error) throw error;
  return count ?? 0;
}

export async function getNextAppointments(studioId: string, limit: number) {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, date, time, status, clients(name), tattoo_artists(name), services(name)",
    )
    .eq("studio_id", studioId)
    .gte("date", today)
    .order("date", { ascending: true })
    .order("time", { ascending: true })
    .limit(limit)
    .returns<DashboardAppointment[]>();

  if (error) throw error;
  return data ?? [];
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId);

  if (error) throw error;
}
