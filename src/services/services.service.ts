import { supabase } from "@/lib/supabase";
import type { ServiceDraftInput } from "@/lib/service-domain";

export type StudioService = {
  id: string;
  studio_id: string;
  name: string;
  description: string | null;
  starting_price: number | null;
  avg_duration_minutes: number | null;
  is_active: boolean;
};

export type ServiceFormData = ServiceDraftInput & {
  studioId: string;
};

export async function getServices(studioId: string) {
  const { data, error } = await supabase
    .from("services")
    .select("id, studio_id, name, description, starting_price, avg_duration_minutes, is_active")
    .eq("studio_id", studioId)
    .order("name", { ascending: true })
    .returns<StudioService[]>();

  if (error) throw error;
  return data ?? [];
}

export async function createService(data: ServiceFormData) {
  const { error } = await supabase.from("services").insert({
    studio_id: data.studioId,
    name: data.name.trim(),
    description: data.description?.trim() || null,
    starting_price: data.startingPrice ?? null,
    avg_duration_minutes: data.durationMinutes,
    is_active: true,
  });

  if (error) throw error;
}

export async function updateService(id: string, data: Omit<ServiceFormData, "studioId">) {
  const { error } = await supabase
    .from("services")
    .update({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      starting_price: data.startingPrice ?? null,
      avg_duration_minutes: data.durationMinutes,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function toggleServiceStatus(id: string, isActive: boolean) {
  const { error } = await supabase.from("services").update({ is_active: isActive }).eq("id", id);

  if (error) throw error;
}
