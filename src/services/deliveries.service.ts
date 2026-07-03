import { supabase } from "@/lib/supabase";
import { createStoragePath, getStoragePathFromPublicUrl, validateUploadFile } from "@/services/storage.service";

export type DeliveryClient = {
  id: string;
  name: string;
  phone: string | null;
};

export type DeliveryPhoto = {
  id: string;
  delivery_id: string;
  studio_id: string;
  url: string;
  file_name: string | null;
  created_at: string;
};

export type ClientDelivery = {
  id: string;
  studio_id: string;
  client_id: string;
  appointment_id: string | null;
  token: string;
  title: string;
  message: string | null;
  expires_at: string | null;
  created_at: string;
  clients: { name: string; phone: string | null } | null;
  client_delivery_photos: DeliveryPhoto[];
};

export type PublicDelivery = {
  id: string;
  title: string;
  message: string | null;
  studio: {
    name: string;
    logo_url: string | null;
    whatsapp: string | null;
  };
  client: {
    name: string;
  };
  photos: Array<{
    id: string;
    url: string;
    file_name: string | null;
  }>;
};

export type CreateDeliveryData = {
  studioId: string;
  clientId: string;
  appointmentId?: string;
  title: string;
  message?: string;
};

export async function getDeliveryClients(studioId: string) {
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, phone")
    .eq("studio_id", studioId)
    .order("name", { ascending: true })
    .returns<DeliveryClient[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getDeliveries(studioId: string) {
  const { data, error } = await supabase
    .from("client_deliveries")
    .select("*, clients(name, phone), client_delivery_photos(*)")
    .eq("studio_id", studioId)
    .order("created_at", { ascending: false })
    .returns<ClientDelivery[]>();

  if (error) throw error;
  return data ?? [];
}

export async function createDelivery(data: CreateDeliveryData) {
  const { data: delivery, error } = await supabase
    .from("client_deliveries")
    .insert({
      studio_id: data.studioId,
      client_id: data.clientId,
      appointment_id: data.appointmentId || null,
      title: data.title,
      message: data.message || null,
    })
    .select("*")
    .single<ClientDelivery>();

  if (error) throw error;
  return delivery;
}

export async function uploadDeliveryPhoto(file: File, studioId: string, deliveryId: string) {
  validateUploadFile(file);
  const path = createStoragePath(studioId, file.name, [deliveryId]);

  const { error: uploadError } = await supabase.storage.from("client-deliveries").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadError) throw uploadError;

  const { data: publicUrl } = supabase.storage.from("client-deliveries").getPublicUrl(path);

  const { data, error } = await supabase
    .from("client_delivery_photos")
    .insert({
      delivery_id: deliveryId,
      studio_id: studioId,
      url: publicUrl.publicUrl,
      file_name: file.name,
    })
    .select("*")
    .single<DeliveryPhoto>();

  if (error) throw error;
  return data;
}

export async function deleteDeliveryPhoto(id: string, url: string) {
  const path = getStoragePathFromPublicUrl(url, "client-deliveries");

  if (path) {
    const { error: storageError } = await supabase.storage.from("client-deliveries").remove([path]);
    if (storageError) throw storageError;
  }

  const { error } = await supabase.from("client_delivery_photos").delete().eq("id", id);
  if (error) throw error;
}

export async function getPublicDeliveryByToken(token: string) {
  const { data, error } = await supabase.rpc("get_client_delivery_by_token", {
    p_token: token,
  });

  if (error) throw error;
  return data as PublicDelivery | null;
}
