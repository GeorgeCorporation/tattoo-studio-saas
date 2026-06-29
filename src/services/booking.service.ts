import { supabase } from "@/lib/supabase";

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

  if (error) throw error;
  return appointment;
}

export async function uploadReference(file: File, studioId: string) {
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${studioId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("booking-references").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("booking-references").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadReferencePhotos(studioId: string, files: File[]) {
  return Promise.all(files.slice(0, 3).map((file) => uploadReference(file, studioId)));
}
