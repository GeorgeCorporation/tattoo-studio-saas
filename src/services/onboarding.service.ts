import { supabase } from "@/lib/supabase";

export type OnboardingStudioData = {
  userId: string;
  name: string;
  slug: string;
  description?: string;
  whatsapp: string;
  instagram?: string;
  website?: string;
  address?: string;
  city: string;
  state: string;
};

export type UserStudio = {
  id: string;
  name: string;
  slug: string;
};

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function makeDefaultWorkingHours(studioId: string) {
  return Array.from({ length: 7 }, (_, day) => ({
    studio_id: studioId,
    day_of_week: day,
    open_time: day === 0 ? null : "09:00",
    close_time: day === 0 ? null : "18:00",
    is_open: day !== 0,
  }));
}

export async function getUserStudio(userId: string) {
  const { data, error } = await supabase
    .from("studios")
    .select("id, name, slug")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle<UserStudio>();

  if (error) throw error;
  return data;
}

export async function ensureUniqueStudioSlug(slug: string) {
  const base = slugify(slug) || "estudio";
  let nextSlug = base;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("studios")
      .select("id")
      .eq("slug", nextSlug)
      .limit(1);

    if (error) throw error;
    if (!data?.length) return nextSlug;

    nextSlug = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function createStudioOnboarding(data: OnboardingStudioData) {
  const existingStudio = await getUserStudio(data.userId);
  if (existingStudio) return existingStudio;

  const slug = await ensureUniqueStudioSlug(data.slug || data.name);

  const { data: studio, error: studioError } = await supabase
    .from("studios")
    .insert({
      user_id: data.userId,
      name: data.name.trim(),
      slug,
      description: data.description?.trim() || null,
      whatsapp: data.whatsapp,
      instagram: data.instagram ? `@${data.instagram.replace("@", "")}` : null,
      website: data.website?.trim() || null,
      address: data.address?.trim() || null,
      city: data.city.trim(),
      state: data.state,
    })
    .select("id, name, slug")
    .single<UserStudio>();

  if (studioError) throw studioError;

  const { error: hoursError } = await supabase.from("working_hours").insert(makeDefaultWorkingHours(studio.id));
  if (hoursError) throw hoursError;

  return studio;
}
