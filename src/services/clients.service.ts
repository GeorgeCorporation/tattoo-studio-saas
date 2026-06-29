import { supabase } from "@/lib/supabase";

export type ClientListItem = {
  id: string;
  studio_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  instagram: string | null;
  notes: string | null;
  appointments_count?: number;
};

export type ClientAppointment = {
  id: string;
  date: string;
  time: string;
  status: string;
  total_price: number | null;
  notes: string | null;
  description: string | null;
  services: { name: string } | null;
  tattoo_artists: { name: string } | null;
};

export type ClientFormData = {
  studioId: string;
  name: string;
  phone?: string;
  instagram?: string;
  email?: string;
  notes?: string;
};

function mapClient(row: ClientListItem & { appointments?: { id: string }[] }) {
  return {
    ...row,
    appointments_count: row.appointments?.length ?? 0,
  };
}

export async function getClients(studioId: string, search = "") {
  let query = supabase
    .from("clients")
    .select("id, studio_id, name, phone, email, instagram, notes, appointments(id)")
    .eq("studio_id", studioId)
    .order("name", { ascending: true });

  const term = search.trim();
  if (term) {
    query = query.or(`name.ilike.%${term}%,phone.ilike.%${term}%`);
  }

  const { data, error } = await query.returns<(ClientListItem & { appointments?: { id: string }[] })[]>();

  if (error) throw error;
  return (data ?? []).map(mapClient);
}

export async function getClientById(id: string) {
  const { data, error } = await supabase
    .from("clients")
    .select("id, studio_id, name, phone, email, instagram, notes")
    .eq("id", id)
    .maybeSingle<ClientListItem>();

  if (error) throw error;
  return data;
}

export async function getClientAppointments(clientId: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select("id, date, time, status, total_price, notes, description, services(name), tattoo_artists(name)")
    .eq("client_id", clientId)
    .order("date", { ascending: false })
    .order("time", { ascending: false })
    .returns<ClientAppointment[]>();

  if (error) throw error;
  return data ?? [];
}

export async function createClient(data: ClientFormData) {
  const { error } = await supabase.from("clients").insert({
    studio_id: data.studioId,
    name: data.name,
    phone: data.phone || null,
    instagram: data.instagram || null,
    email: data.email || null,
    notes: data.notes || null,
  });

  if (error) throw error;
}

export async function updateClient(id: string, data: Omit<ClientFormData, "studioId">) {
  const { error } = await supabase
    .from("clients")
    .update({
      name: data.name,
      phone: data.phone || null,
      instagram: data.instagram || null,
      email: data.email || null,
      notes: data.notes || null,
    })
    .eq("id", id);

  if (error) throw error;
}
