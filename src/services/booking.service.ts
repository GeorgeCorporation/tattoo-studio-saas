import { supabase } from "@/lib/supabase";
import { createBookingReferencePath } from "@/services/storage.service";

export type BookingService = {
  id: string;
  studio_id: string;
  name: string;
  description: string | null;
  starting_price: number | null;
  avg_duration_minutes: number | null;
  category: string | null;
  is_active: boolean;
};

export type WorkingHour = {
  id: string;
  studio_id: string;
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_open: boolean;
};

export type CreateClientData = {
  studioId: string;
  name: string;
  phone: string;
  email?: string;
  instagram?: string;
  notes?: string;
};

export type CreateAppointmentData = {
  studioId: string;
  artistId: string;
  clientId: string;
  serviceId: string;
  date: string;
  time: string;
  description: string;
  notes?: string;
};

export class BookingAvailabilityError extends Error {
  constructor(message = "Esse horário acabou de ficar indisponível. Escolha outro horário.") {
    super(message);
    this.name = "BookingAvailabilityError";
  }
}

export function normalizeTime(value: string) {
  return value.slice(0, 5);
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getMinimumBookingDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toDateInputValue(date);
}

export function isFutureDate(date: string) {
  return date > toDateInputValue(new Date());
}

export function getDayOfWeekFromDateInput(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
}

function timeToMinutes(value: string) {
  const [hours, minutes] = normalizeTime(value).split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function buildHourlySlots(openTime: string | null, closeTime: string | null) {
  if (!openTime || !closeTime) return [];

  const openMinutes = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);

  if (closeMinutes <= openMinutes) return [];

  const slots: string[] = [];

  for (let minutes = openMinutes; minutes + 60 <= closeMinutes; minutes += 60) {
    slots.push(minutesToTime(minutes));
  }

  return slots;
}

export async function getServicesByStudio(studioId: string) {
  const { data, error } = await supabase
    .from("services")
    .select(
      "id, studio_id, name, description, starting_price, avg_duration_minutes, category, is_active",
    )
    .eq("studio_id", studioId)
    .eq("is_active", true)
    .order("name", { ascending: true })
    .returns<BookingService[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getWorkingHourByDate(studioId: string, date: string) {
  const dayOfWeek = getDayOfWeekFromDateInput(date);

  const { data, error } = await supabase
    .from("working_hours")
    .select("id, studio_id, day_of_week, open_time, close_time, is_open")
    .eq("studio_id", studioId)
    .eq("day_of_week", dayOfWeek)
    .maybeSingle<WorkingHour>();

  if (error) throw error;
  return data;
}

export async function getBookedTimes(studioId: string, artistId: string, date: string) {
  const { data, error } = await supabase.rpc("get_booked_appointment_times", {
    p_studio_id: studioId,
    p_artist_id: artistId,
    p_date: date,
  });

  if (error) throw error;

  return new Set((data ?? []).map((item) => normalizeTime(item.booked_time)));
}

export async function getAvailableTimeSlots(studioId: string, artistId: string, date: string) {
  if (!studioId || !artistId || !date || !isFutureDate(date)) return [];

  const workingHour = await getWorkingHourByDate(studioId, date);

  if (!workingHour?.is_open) return [];

  const allSlots = buildHourlySlots(workingHour.open_time, workingHour.close_time);
  const bookedTimes = await getBookedTimes(studioId, artistId, date);

  return allSlots.filter((slot) => !bookedTimes.has(slot));
}

export async function createClient(data: CreateClientData) {
  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      studio_id: data.studioId,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      instagram: data.instagram || null,
      notes: data.notes || null,
    })
    .select("id")
    .single<{ id: string }>();

  if (error) throw error;
  return client;
}

export async function createAppointment(data: CreateAppointmentData) {
  const availableSlots = await getAvailableTimeSlots(data.studioId, data.artistId, data.date);

  if (!availableSlots.includes(normalizeTime(data.time))) {
    throw new BookingAvailabilityError();
  }

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      studio_id: data.studioId,
      artist_id: data.artistId,
      client_id: data.clientId,
      service_id: data.serviceId,
      date: data.date,
      time: data.time,
      status: "pending",
      description: data.description,
      notes: data.notes || null,
    })
    .select("id")
    .single<{ id: string }>();

  if (error) {
    if (error.code === "23505") throw new BookingAvailabilityError();

    throw error;
  }

  return appointment;
}

export async function updateAppointmentNotes(appointmentId: string, notes: string) {
  const { error } = await supabase.rpc("update_public_appointment_notes", {
    p_appointment_id: appointmentId,
    p_notes: notes,
  });

  if (error) throw error;
}

export async function uploadReference(file: File, studioId: string, appointmentId: string) {
  const path = createBookingReferencePath(studioId, appointmentId, file.name);

  const { error } = await supabase.storage.from("booking-references").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("booking-references").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadReferencePhotos(studioId: string, appointmentId: string, files: File[]) {
  return Promise.all(files.slice(0, 3).map((file) => uploadReference(file, studioId, appointmentId)));
}
