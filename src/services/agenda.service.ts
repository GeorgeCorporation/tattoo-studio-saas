import { supabase } from "@/lib/supabase";
import { assertAppointmentStatus, type AppointmentStatus } from "@/lib/appointment-domain";

export type AgendaAppointmentStatus = AppointmentStatus;

export type AgendaAppointment = {
  id: string;
  date: string;
  time: string;
  status: AgendaAppointmentStatus;
  description: string | null;
  notes: string | null;
  clients: { id: string; name: string; phone: string | null } | null;
  tattoo_artists: { id: string; name: string } | null;
  services: { id: string; name: string } | null;
};

export type AgendaOption = {
  id: string;
  name: string;
};

export type CreateAgendaAppointmentData = {
  studioId: string;
  clientId: string;
  artistId: string;
  serviceId: string;
  date: string;
  time: string;
  description: string;
};

export async function getAppointmentsByDate(studioId: string, date: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, date, time, status, description, notes, clients(id, name, phone), tattoo_artists(id, name), services(id, name)",
    )
    .eq("studio_id", studioId)
    .eq("date", date)
    .order("time", { ascending: true })
    .returns<AgendaAppointment[]>();

  if (error) throw error;
  return data ?? [];
}

export async function updateAppointmentStatus(id: string, status: AgendaAppointmentStatus) {
  assertAppointmentStatus(status);

  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);

  if (error) throw error;
}

export async function createAppointment(data: CreateAgendaAppointmentData) {
  const { error } = await supabase.from("appointments").insert({
    studio_id: data.studioId,
    client_id: data.clientId,
    artist_id: data.artistId,
    service_id: data.serviceId,
    date: data.date,
    time: data.time,
    status: "pending",
    description: data.description,
  });

  if (error) throw error;
}

export async function getAgendaClients(studioId: string) {
  const { data, error } = await supabase
    .from("clients")
    .select("id, name")
    .eq("studio_id", studioId)
    .order("name", { ascending: true })
    .returns<AgendaOption[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getAgendaArtists(studioId: string) {
  const { data, error } = await supabase
    .from("tattoo_artists")
    .select("id, name")
    .eq("studio_id", studioId)
    .eq("is_active", true)
    .order("name", { ascending: true })
    .returns<AgendaOption[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getAgendaServices(studioId: string) {
  const { data, error } = await supabase
    .from("services")
    .select("id, name")
    .eq("studio_id", studioId)
    .eq("is_active", true)
    .order("name", { ascending: true })
    .returns<AgendaOption[]>();

  if (error) throw error;
  return data ?? [];
}
