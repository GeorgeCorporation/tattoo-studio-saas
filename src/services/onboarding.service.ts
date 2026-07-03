import { supabase } from "@/lib/supabase";
import { getMockStudio, isMockMode, saveMockStudio } from "@/lib/mockMode";
import { assertPublicSlug, isReservedSlug } from "@/lib/slugs";
import { createStoragePath, validateUploadFile } from "@/services/storage.service";

export type OnboardingWorkingHour = {
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_open: boolean;
};

export type OnboardingFirstArtistData = {
  name: string;
  slug?: string;
  specialty?: string;
  instagram?: string;
  whatsapp?: string;
  photoFile?: File | null;
};

export type OnboardingFirstServiceData = {
  name: string;
  category?: string;
  description?: string;
  starting_price?: number | null;
  avg_duration_minutes?: number | null;
};

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
  logoFile?: File | null;
  workingHours?: OnboardingWorkingHour[];
  firstArtist?: OnboardingFirstArtistData;
  firstArtists?: OnboardingFirstArtistData[];
  firstService?: OnboardingFirstServiceData;
  firstServices?: OnboardingFirstServiceData[];
};

export type UserStudio = {
  id: string;
  name: string;
  slug: string;
};

export type OnboardingValidationData = Partial<OnboardingStudioData> & {
  firstArtist?: Partial<OnboardingFirstArtistData>;
  firstArtists?: Partial<OnboardingFirstArtistData>[];
  firstService?: Partial<OnboardingFirstServiceData>;
  firstServices?: Partial<OnboardingFirstServiceData>[];
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

export function buildDefaultWorkingHours(): OnboardingWorkingHour[] {
  return Array.from({ length: 7 }, (_, day) => ({
    day_of_week: day,
    open_time: day === 0 ? null : "09:00",
    close_time: day === 0 ? null : "18:00",
    is_open: day !== 0,
  }));
}

export function makeDefaultWorkingHours(studioId: string) {
  return buildDefaultWorkingHours().map((hour) => ({
    studio_id: studioId,
    ...hour,
  }));
}

export function validateOnboardingStep(step: number, data: OnboardingValidationData) {
  if (step === 1) {
    if (!data.name?.trim()) return "Informe o nome do estúdio.";
    const slug = slugify(data.slug || data.name);
    if (!slug) return "Defina um link público válido para seu estúdio.";
    if (isReservedSlug(slug)) return "Este link público é reservado pelo sistema. Escolha outro.";
  }

  if (step === 2) {
    if (!/^\d{11}$/.test(data.whatsapp ?? "")) {
      return "Informe um WhatsApp válido com 11 números. Ex: 11999999999.";
    }

    if (!data.city?.trim() || !data.state) {
      return "Preencha cidade e estado para continuar.";
    }
  }

  if (step === 3) {
    const invalidHour = data.workingHours?.find(
      (hour) => hour.is_open && (!hour.open_time || !hour.close_time || hour.open_time >= hour.close_time),
    );

    if (invalidHour) return "Confira os horários: abertura precisa ser antes do fechamento.";
  }

  if (step === 4 && !data.firstArtist?.name?.trim() && !data.firstArtists?.some((artist) => artist.name?.trim())) {
    return "Informe pelo menos um tatuador.";
  }

  if (step === 5 && !data.firstService?.name?.trim() && !data.firstServices?.some((service) => service.name?.trim())) {
    return "Informe pelo menos um serviço inicial.";
  }

  return "";
}

export async function getUserStudio(userId: string) {
  if (isMockMode) return getMockStudio();

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
  assertPublicSlug(base);
  if (isMockMode) return base;

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

export async function ensureUniqueArtistSlug(studioId: string, slug: string) {
  const base = slugify(slug) || "tatuador";
  assertPublicSlug(base);
  if (isMockMode) return base;

  let nextSlug = base;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("tattoo_artists")
      .select("id")
      .eq("studio_id", studioId)
      .eq("slug", nextSlug)
      .limit(1);

    if (error) throw error;
    if (!data?.length) return nextSlug;

    nextSlug = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function uploadStudioLogo(file: File, studioId: string) {
  if (isMockMode) return URL.createObjectURL(file);

  validateUploadFile(file);
  const path = createStoragePath(studioId, file.name);

  const { error } = await supabase.storage.from("logos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("logos").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadFirstArtistPhoto(file: File, studioId: string, artistId: string) {
  if (isMockMode) return URL.createObjectURL(file);

  validateUploadFile(file);
  const path = createStoragePath(studioId, file.name, [artistId]);

  const { error } = await supabase.storage.from("artists").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from("artists").getPublicUrl(path);
  return data.publicUrl;
}

export async function createStudioOnboarding(data: OnboardingStudioData) {
  if (isMockMode) {
    const existingStudio = getMockStudio();
    if (existingStudio) return existingStudio;

    const studio = {
      id: "mock-studio-1",
      name: data.name.trim(),
      slug: slugify(data.slug || data.name) || "estudio-teste",
    };

    saveMockStudio(studio);
    return studio;
  }

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

  const hours = (data.workingHours?.length ? data.workingHours : buildDefaultWorkingHours()).map((hour) => ({
    studio_id: studio.id,
    day_of_week: hour.day_of_week,
    open_time: hour.is_open ? hour.open_time : null,
    close_time: hour.is_open ? hour.close_time : null,
    is_open: hour.is_open,
  }));

  const { error: hoursError } = await supabase.from("working_hours").insert(hours);
  if (hoursError) throw hoursError;

  if (data.logoFile) {
    const logoUrl = await uploadStudioLogo(data.logoFile, studio.id);
    const { error } = await supabase.from("studios").update({ logo_url: logoUrl }).eq("id", studio.id);
    if (error) throw error;
  }

  const artistsToCreate = data.firstArtists?.length ? data.firstArtists : data.firstArtist ? [data.firstArtist] : [];

  for (const firstArtist of artistsToCreate.filter((artist) => artist.name?.trim())) {
    const artistSlug = await ensureUniqueArtistSlug(studio.id, firstArtist.slug || firstArtist.name);

    const { data: artist, error: artistError } = await supabase
      .from("tattoo_artists")
      .insert({
        studio_id: studio.id,
        name: firstArtist.name.trim(),
        slug: artistSlug,
        specialty: firstArtist.specialty?.trim() || null,
        instagram: firstArtist.instagram ? `@${firstArtist.instagram.replace("@", "")}` : null,
        whatsapp: firstArtist.whatsapp?.replace(/\D/g, "") || null,
        is_active: true,
      })
      .select("id")
      .single<{ id: string }>();

    if (artistError) throw artistError;

    if (firstArtist.photoFile) {
      const photoUrl = await uploadFirstArtistPhoto(firstArtist.photoFile, studio.id, artist.id);
      const { error } = await supabase.from("tattoo_artists").update({ photo_url: photoUrl }).eq("id", artist.id);
      if (error) throw error;
    }
  }

  const servicesToCreate = data.firstServices?.length ? data.firstServices : data.firstService ? [data.firstService] : [];

  for (const firstService of servicesToCreate.filter((service) => service.name?.trim())) {
    const { error: serviceError } = await supabase.from("services").insert({
      studio_id: studio.id,
      name: firstService.name.trim(),
      category: firstService.category || "Outro",
      description: firstService.description?.trim() || null,
      starting_price: firstService.starting_price ?? null,
      avg_duration_minutes: firstService.avg_duration_minutes ?? null,
      is_active: true,
    });

    if (serviceError) throw serviceError;
  }

  return studio;
}
