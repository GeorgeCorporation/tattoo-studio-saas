import { assertAppointmentStatus, type AppointmentStatus } from "@/lib/appointment-domain";
import { getMockDashboardStudio, getMockSetupStatus, isMockMode, mockUser } from "@/lib/mockMode";
import { supabase } from "@/lib/supabase";
import { getCurrentUserAccess } from "@/services/access.service";

export type DashboardStudio = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
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

export type DashboardSetupStatus = {
  hasLogo: boolean;
  artistsCount: number;
  servicesCount: number;
  galleryCount: number;
  appointmentsCount: number;
};

export async function getCurrentUserStudio(userId: string) {
  if (isMockMode && userId === mockUser.id) return getMockDashboardStudio();

  const access = await getCurrentUserAccess(userId);
  if (!access) return null;

  return {
    id: access.studioId,
    name: access.studioName,
    slug: access.studioSlug,
    logo_url: access.studioLogoUrl,
  } satisfies DashboardStudio;
}

export async function getSetupStatus(studioId: string) {
  if (isMockMode) return getMockSetupStatus();

  const [artists, services, gallery, appointments, studio] = await Promise.all([
    supabase.from("tattoo_artists").select("id", { count: "exact", head: true }).eq("studio_id", studioId),
    supabase.from("services").select("id", { count: "exact", head: true }).eq("studio_id", studioId),
    supabase.from("gallery").select("id", { count: "exact", head: true }).eq("studio_id", studioId),
    supabase.from("appointments").select("id", { count: "exact", head: true }).eq("studio_id", studioId),
    supabase.from("studios").select("logo_url").eq("id", studioId).maybeSingle<{ logo_url: string | null }>(),
  ]);

  const error = artists.error || services.error || gallery.error || appointments.error || studio.error;
  if (error) throw error;

  return {
    hasLogo: Boolean(studio.data?.logo_url),
    artistsCount: artists.count ?? 0,
    servicesCount: services.count ?? 0,
    galleryCount: gallery.count ?? 0,
    appointmentsCount: appointments.count ?? 0,
  } satisfies DashboardSetupStatus;
}

export async function getTodayAppointments(studioId: string) {
  if (isMockMode) return 0;

  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase.from("appointments").select("id").eq("studio_id", studioId).eq("date", today);
  if (error) throw error;
  return data?.length ?? 0;
}

export async function getWeekAppointments(studioId: string) {
  if (isMockMode) return 0;

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
  if (isMockMode) return 0;

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
  if (isMockMode) return 0;

  const { count, error } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true })
    .eq("studio_id", studioId);

  if (error) throw error;
  return count ?? 0;
}

export async function getNextAppointments(studioId: string, limit: number) {
  if (isMockMode) return [];

  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("appointments")
    .select("id, date, time, status, clients(name), tattoo_artists(name), services(name)")
    .eq("studio_id", studioId)
    .gte("date", today)
    .order("date", { ascending: true })
    .order("time", { ascending: true })
    .limit(limit)
    .returns<DashboardAppointment[]>();

  if (error) throw error;
  return data ?? [];
}

export async function updateAppointmentStatus(appointmentId: string, status: AppointmentStatus) {
  assertAppointmentStatus(status);
  if (isMockMode) return;

  const { error } = await supabase.from("appointments").update({ status }).eq("id", appointmentId);
  if (error) throw error;
}
