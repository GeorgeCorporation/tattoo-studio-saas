import { supabase } from "@/lib/supabase";
import { assertAppointmentStatus, type AppointmentStatus } from "@/lib/appointment-domain";
import {
  getAppointmentDuration,
  hasAppointmentConflict,
  isPastDate,
  isWithinWorkingHours,
} from "@/lib/scheduling-domain";
import { findWorkingHourForDate } from "@/lib/working-hours";
import type { UserRole } from "@/lib/access-control";
import type { OnboardingWorkingHour } from "@/services/onboarding.service";

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

export type AgendaServiceOption = AgendaOption & {
  starting_price: number | null;
  avg_duration_minutes: number | null;
};

export type AgendaWorkingHour = OnboardingWorkingHour;

type AgendaScheduledAppointment = {
  time: string;
  services: { avg_duration_minutes: number | null } | null;
};

export class AgendaAvailabilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgendaAvailabilityError";
  }
}

export class AgendaWorkingHoursOverrideRequiredError extends AgendaAvailabilityError {
  constructor() {
    super("O horário está fora do expediente do estúdio. Deseja continuar mesmo assim?");
    this.name = "AgendaWorkingHoursOverrideRequiredError";
  }
}

export type CreateAgendaAppointmentData = {
  studioId: string;
  clientId: string;
  artistId: string;
  serviceId: string;
  date: string;
  time: string;
  description: string;
  clientSource: "artist_client" | "studio_referral";
  role: UserRole;
  durationMinutes: number | null;
  workingHours: AgendaWorkingHour[];
  allowOutsideWorkingHours?: boolean;
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
  if (isPastDate(data.date)) {
    throw new AgendaAvailabilityError("Não é possível agendar em uma data passada.");
  }

  const { data: scheduledAppointments, error: scheduleError } = await supabase
    .from("appointments")
    .select("time, services(avg_duration_minutes)")
    .eq("studio_id", data.studioId)
    .eq("artist_id", data.artistId)
    .eq("date", data.date)
    .in("status", ["pending", "confirmed"])
    .returns<AgendaScheduledAppointment[]>();

  if (scheduleError) throw scheduleError;

  const hasConflict = hasAppointmentConflict(
    data.time,
    data.durationMinutes,
    (scheduledAppointments ?? []).map((appointment) => ({
      time: appointment.time,
      durationMinutes: appointment.services?.avg_duration_minutes,
    })),
  );

  if (hasConflict) {
    throw new AgendaAvailabilityError("Esse horário entra em conflito com outro agendamento.");
  }

  const workingHour = findWorkingHourForDate(data.workingHours, data.date);
  const isWithinHours =
    workingHour != null &&
    isWithinWorkingHours(data.time, getAppointmentDuration(data.durationMinutes), workingHour);

  if (!isWithinHours) {
    if (data.role !== "manager") {
      throw new AgendaAvailabilityError("Esse horário está fora do expediente do estúdio.");
    }

    if (!data.allowOutsideWorkingHours) {
      throw new AgendaWorkingHoursOverrideRequiredError();
    }
  }

  const { error } = await supabase.from("appointments").insert({
    studio_id: data.studioId,
    client_id: data.clientId,
    artist_id: data.artistId,
    service_id: data.serviceId,
    date: data.date,
    time: data.time,
    client_source: data.clientSource,
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
    .select("id, name, starting_price, avg_duration_minutes")
    .eq("studio_id", studioId)
    .eq("is_active", true)
    .order("name", { ascending: true })
    .returns<AgendaServiceOption[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getAgendaWorkingHours(studioId: string) {
  const { data, error } = await supabase
    .from("working_hours")
    .select("day_of_week, open_time, close_time, is_open")
    .eq("studio_id", studioId)
    .order("day_of_week", { ascending: true })
    .returns<AgendaWorkingHour[]>();

  if (error) throw error;
  return data ?? [];
}
