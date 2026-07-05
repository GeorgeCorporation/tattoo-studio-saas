import { supabase } from "@/lib/supabase";
import { getMockStudio, isMockMode, saveMockStudio } from "@/lib/mockMode";
import { assertPublicSlug, isReservedSlug } from "@/lib/slugs";
import { replaceStudioLogo } from "@/services/studio-brand.service";
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
  logo_url?: string | null;
  description?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
};

export type OnboardingValidationData = Partial<OnboardingStudioData> & {
  firstArtist?: Partial<OnboardingFirstArtistData>;
  firstArtists?: Partial<OnboardingFirstArtistData>[];
  firstService?: Partial<OnboardingFirstServiceData>;
  firstServices?: Partial<OnboardingFirstServiceData>[];
  activateBooking?: boolean;
};

export type OnboardingSnapshotArtist = {
  id: string;
  name: string;
  slug: string;
  specialty: string | null;
  instagram: string | null;
  whatsapp: string | null;
  photo_url: string | null;
};

export type OnboardingSnapshotService = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  starting_price: number | null;
  avg_duration_minutes: number | null;
};

export type OnboardingSnapshot = {
  studio: UserStudio | null;
  workingHours: OnboardingWorkingHour[];
  artists: OnboardingSnapshotArtist[];
  services: OnboardingSnapshotService[];
};

export type OnboardingProgress = {
  hasStudio: boolean;
  hasRequiredStudioData: boolean;
  hasWorkingHours: boolean;
  hasLogo: boolean;
  artistsCount: number;
  servicesCount: number;
  isBookingReady: boolean;
  canFinish: boolean;
  nextStep: number;
};

type ArtistInsertPayload = {
  studio_id: string;
  name: string;
  slug: string;
  specialty: string | null;
  instagram: string | null;
  whatsapp: string | null;
  is_active: boolean;
};

type ServiceInsertPayload = {
  studio_id: string;
  name: string;
  category: string;
  description: string | null;
  starting_price: number | null;
  avg_duration_minutes: number | null;
  is_active: boolean;
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

  if (step === 4 && data.activateBooking !== false) {
    const hasArtist = Boolean(data.firstArtist?.name?.trim() || data.firstArtists?.some((artist) => artist.name?.trim()));
    const hasService = Boolean(data.firstService?.name?.trim() || data.firstServices?.some((service) => service.name?.trim()));

    if (!hasArtist || !hasService) {
      return "Para ativar a agenda pública agora, informe pelo menos um tatuador e um serviço. Ou desmarque a opção para fazer depois.";
    }
  }

  return "";
}

function normalizeInstagram(value?: string | null) {
  const normalized = value?.replace("@", "").trim();
  return normalized ? `@${normalized}` : null;
}

function normalizeDigits(value?: string | null) {
  const normalized = value?.replace(/\D/g, "") ?? "";
  return normalized || null;
}

function normalizeText(value?: string | null) {
  const normalized = value?.trim();
  return normalized || null;
}

function normalizePrice(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeDuration(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function findArtistMatch(artists: OnboardingSnapshotArtist[], artist: OnboardingFirstArtistData) {
  const candidateSlug = slugify(artist.slug || artist.name);
  const candidateName = artist.name.trim().toLowerCase();

  return artists.find((item) => item.slug === candidateSlug || item.name.trim().toLowerCase() === candidateName) ?? null;
}

function findServiceMatch(services: OnboardingSnapshotService[], service: OnboardingFirstServiceData) {
  const candidateName = service.name.trim().toLowerCase();
  return services.find((item) => item.name.trim().toLowerCase() === candidateName) ?? null;
}

export async function getUserStudio(userId: string) {
  if (isMockMode) return getMockStudio();

  const { data, error } = await supabase
    .from("studios")
    .select("id, name, slug, logo_url, description, whatsapp, instagram, website, address, city, state")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle<UserStudio>();

  if (error) throw error;
  return data;
}

export async function getOnboardingSnapshot(userId: string): Promise<OnboardingSnapshot> {
  const studio = await getUserStudio(userId);

  if (!studio || isMockMode) {
    return {
      studio,
      workingHours: [],
      artists: [],
      services: [],
    };
  }

  const [hoursResult, artistsResult, servicesResult] = await Promise.all([
    supabase
      .from("working_hours")
      .select("day_of_week, open_time, close_time, is_open")
      .eq("studio_id", studio.id)
      .order("day_of_week", { ascending: true })
      .returns<OnboardingWorkingHour[]>(),
    supabase
      .from("tattoo_artists")
      .select("id, name, slug, specialty, instagram, whatsapp, photo_url")
      .eq("studio_id", studio.id)
      .order("created_at", { ascending: true })
      .returns<OnboardingSnapshotArtist[]>(),
    supabase
      .from("services")
      .select("id, name, category, description, starting_price, avg_duration_minutes")
      .eq("studio_id", studio.id)
      .order("name", { ascending: true })
      .returns<OnboardingSnapshotService[]>(),
  ]);

  if (hoursResult.error) throw hoursResult.error;
  if (artistsResult.error) throw artistsResult.error;
  if (servicesResult.error) throw servicesResult.error;

  return {
    studio,
    workingHours: hoursResult.data ?? [],
    artists: artistsResult.data ?? [],
    services: servicesResult.data ?? [],
  };
}

export function getOnboardingProgress(snapshot: OnboardingSnapshot, activateBooking = true): OnboardingProgress {
  const studio = snapshot.studio;
  const hasStudio = Boolean(studio?.id);
  const hasRequiredStudioData = Boolean(studio?.name?.trim() && studio?.slug?.trim() && studio?.whatsapp?.trim() && studio?.city?.trim() && studio?.state?.trim());
  const uniqueDays = new Set(snapshot.workingHours.map((hour) => hour.day_of_week));
  const hasWorkingHours = uniqueDays.size === 7;
  const hasLogo = Boolean(studio?.logo_url);
  const artistsCount = snapshot.artists.length;
  const servicesCount = snapshot.services.length;
  const isBookingReady = artistsCount > 0 && servicesCount > 0;
  const canFinish = hasStudio && hasRequiredStudioData && hasWorkingHours && (!activateBooking || isBookingReady);

  let nextStep: number;
  if (!hasStudio || !studio?.name?.trim() || !studio?.slug?.trim()) nextStep = 1;
  else if (!studio?.whatsapp?.trim() || !studio?.city?.trim() || !studio?.state?.trim()) nextStep = 2;
  else if (!hasWorkingHours) nextStep = 3;
  else if (activateBooking && !isBookingReady) nextStep = 4;
  else nextStep = 5;

  return {
    hasStudio,
    hasRequiredStudioData,
    hasWorkingHours,
    hasLogo,
    artistsCount,
    servicesCount,
    isBookingReady,
    canFinish,
    nextStep,
  };
}

export async function ensureUniqueStudioSlug(slug: string, ignoreStudioId?: string) {
  const base = slugify(slug) || "estudio";
  assertPublicSlug(base);
  if (isMockMode) return base;

  let nextSlug = base;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase.from("studios").select("id").eq("slug", nextSlug).limit(1);

    if (error) throw error;

    if (!data?.length) return nextSlug;
    if (ignoreStudioId && data.every((item) => item.id === ignoreStudioId)) return nextSlug;

    nextSlug = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function ensureUniqueArtistSlug(studioId: string, slug: string, ignoreArtistId?: string) {
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
    if (ignoreArtistId && data.every((item) => item.id === ignoreArtistId)) return nextSlug;

    nextSlug = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function uploadStudioLogo(file: File, studioId: string) {
  if (isMockMode) return URL.createObjectURL(file);

  const { logoUrl } = await replaceStudioLogo({
    studioId,
    file,
    previousLogoUrl: null,
  });

  return logoUrl;
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

async function upsertStudio(data: OnboardingStudioData, existingStudio: UserStudio | null) {
  const desiredSlug = data.slug || data.name;
  const slug = await ensureUniqueStudioSlug(desiredSlug, existingStudio?.id);
  const payload = {
    user_id: data.userId,
    name: data.name.trim(),
    slug,
    description: normalizeText(data.description),
    whatsapp: normalizeDigits(data.whatsapp),
    instagram: normalizeInstagram(data.instagram),
    website: normalizeText(data.website),
    address: normalizeText(data.address),
    city: data.city.trim(),
    state: data.state.trim(),
  };

  if (existingStudio) {
    const { data: studio, error } = await supabase
      .from("studios")
      .update(payload)
      .eq("id", existingStudio.id)
      .select("id, name, slug, logo_url, description, whatsapp, instagram, website, address, city, state")
      .single<UserStudio>();

    if (error) {
      throw new Error("Não foi possível salvar os dados do estúdio.");
    }

    return studio;
  }

  const { data: studio, error } = await supabase
    .from("studios")
    .insert(payload)
    .select("id, name, slug, logo_url, description, whatsapp, instagram, website, address, city, state")
    .single<UserStudio>();

  if (error) {
    throw new Error("Não foi possível salvar os dados do estúdio.");
  }

  return studio;
}

async function syncWorkingHours(studioId: string, workingHours?: OnboardingWorkingHour[]) {
  const nextHours = workingHours?.length ? workingHours : buildDefaultWorkingHours();
  const { data: existingHours, error: fetchError } = await supabase
    .from("working_hours")
    .select("id, day_of_week")
    .eq("studio_id", studioId)
    .returns<Array<{ id: string; day_of_week: number }>>();

  if (fetchError) {
    throw new Error("O estúdio foi criado, mas os horários não puderam ser carregados.");
  }

  const existingMap = new Map((existingHours ?? []).map((hour) => [hour.day_of_week, hour.id]));

  for (const hour of nextHours) {
    const payload = {
      studio_id: studioId,
      day_of_week: hour.day_of_week,
      open_time: hour.is_open ? hour.open_time : null,
      close_time: hour.is_open ? hour.close_time : null,
      is_open: hour.is_open,
    };
    const existingId = existingMap.get(hour.day_of_week);

    if (existingId) {
      const { error } = await supabase.from("working_hours").update(payload).eq("id", existingId);
      if (error) throw new Error("O estúdio foi criado, mas os horários não puderam ser salvos.");
    } else {
      const { error } = await supabase.from("working_hours").insert(payload);
      if (error) throw new Error("O estúdio foi criado, mas os horários não puderam ser salvos.");
    }
  }
}

async function syncInitialArtists(studioId: string, artists: OnboardingFirstArtistData[]) {
  if (!artists.length) return;

  const { data: existingArtists, error: fetchError } = await supabase
    .from("tattoo_artists")
    .select("id, name, slug, photo_url")
    .eq("studio_id", studioId)
    .returns<Array<{ id: string; name: string; slug: string; photo_url: string | null }>>();

  if (fetchError) {
    throw new Error("O estúdio foi salvo, mas os tatuadores iniciais não puderam ser carregados.");
  }

  const currentArtists = existingArtists ?? [];

  for (const firstArtist of artists.filter((artist) => artist.name?.trim())) {
    const existingArtist = findArtistMatch(
      currentArtists.map((artist) => ({
        id: artist.id,
        name: artist.name,
        slug: artist.slug,
        specialty: null,
        instagram: null,
        whatsapp: null,
        photo_url: artist.photo_url,
      })),
      firstArtist,
    );
    const artistSlug = await ensureUniqueArtistSlug(studioId, firstArtist.slug || firstArtist.name, existingArtist?.id);
    const payload: ArtistInsertPayload = {
      studio_id: studioId,
      name: firstArtist.name.trim(),
      slug: artistSlug,
      specialty: normalizeText(firstArtist.specialty),
      instagram: normalizeInstagram(firstArtist.instagram),
      whatsapp: normalizeDigits(firstArtist.whatsapp),
      is_active: true,
    };

    let artistId = existingArtist?.id ?? "";
    let previousPhotoUrl = existingArtist?.photo_url ?? null;

    if (existingArtist) {
      const { error } = await supabase.from("tattoo_artists").update(payload).eq("id", existingArtist.id);
      if (error) throw new Error("O estúdio foi salvo, mas os tatuadores iniciais não foram concluídos.");
      artistId = existingArtist.id;
    } else {
      const { data, error } = await supabase
        .from("tattoo_artists")
        .insert(payload)
        .select("id, photo_url")
        .single<{ id: string; photo_url: string | null }>();

      if (error) throw new Error("O estúdio foi salvo, mas os tatuadores iniciais não foram concluídos.");
      artistId = data.id;
      previousPhotoUrl = data.photo_url;
      currentArtists.push({
        id: data.id,
        name: payload.name,
        slug: payload.slug,
        photo_url: data.photo_url,
      });
    }

    if (firstArtist.photoFile) {
      const photoUrl = await uploadFirstArtistPhoto(firstArtist.photoFile, studioId, artistId);
      const { error } = await supabase.from("tattoo_artists").update({ photo_url: photoUrl }).eq("id", artistId);
      if (error) throw new Error("O estúdio foi salvo, mas a foto do tatuador não pôde ser concluída.");

      const artistToUpdate = currentArtists.find((item) => item.id === artistId);
      if (artistToUpdate) artistToUpdate.photo_url = photoUrl;
      void previousPhotoUrl;
    }
  }
}

async function syncInitialServices(studioId: string, services: OnboardingFirstServiceData[]) {
  if (!services.length) return;

  const { data: existingServices, error: fetchError } = await supabase
    .from("services")
    .select("id, name")
    .eq("studio_id", studioId)
    .returns<Array<{ id: string; name: string }>>();

  if (fetchError) {
    throw new Error("O estúdio foi salvo, mas os serviços iniciais não puderam ser carregados.");
  }

  const currentServices: OnboardingSnapshotService[] = (existingServices ?? []).map((service) => ({
    id: service.id,
    name: service.name,
    category: null,
    description: null,
    starting_price: null,
    avg_duration_minutes: null,
  }));

  for (const firstService of services.filter((service) => service.name?.trim())) {
    const existingService = findServiceMatch(currentServices, firstService);
    const payload: ServiceInsertPayload = {
      studio_id: studioId,
      name: firstService.name.trim(),
      category: firstService.category || "Outro",
      description: normalizeText(firstService.description),
      starting_price: normalizePrice(firstService.starting_price),
      avg_duration_minutes: normalizeDuration(firstService.avg_duration_minutes),
      is_active: true,
    };

    if (existingService) {
      const { error } = await supabase.from("services").update(payload).eq("id", existingService.id);
      if (error) throw new Error("O estúdio foi salvo, mas os serviços iniciais não foram concluídos.");
    } else {
      const { data, error } = await supabase.from("services").insert(payload).select("id").single<{ id: string }>();
      if (error) throw new Error("O estúdio foi salvo, mas os serviços iniciais não foram concluídos.");
      currentServices.push({
        id: data.id,
        name: payload.name,
        category: payload.category,
        description: payload.description,
        starting_price: payload.starting_price,
        avg_duration_minutes: payload.avg_duration_minutes,
      });
    }
  }
}

export async function createStudioOnboarding(data: OnboardingStudioData) {
  if (isMockMode) {
    const existingStudio = getMockStudio();
    const studio = {
      id: existingStudio?.id ?? "mock-studio-1",
      name: data.name.trim(),
      slug: slugify(data.slug || data.name) || "estudio-teste",
    };
    saveMockStudio(studio);
    return studio;
  }

  const snapshot = await getOnboardingSnapshot(data.userId);
  const studio = await upsertStudio(data, snapshot.studio);

  await syncWorkingHours(studio.id, data.workingHours);

  if (data.logoFile) {
    try {
      await replaceStudioLogo({
        studioId: studio.id,
        file: data.logoFile,
        previousLogoUrl: snapshot.studio?.logo_url ?? null,
      });
    } catch {
      throw new Error("O estúdio foi salvo, mas a logo não pôde ser enviada agora.");
    }
  }

  const artistsToCreate = data.firstArtists?.length ? data.firstArtists : data.firstArtist ? [data.firstArtist] : [];
  if (artistsToCreate.length) {
    await syncInitialArtists(studio.id, artistsToCreate);
  }

  const servicesToCreate = data.firstServices?.length ? data.firstServices : data.firstService ? [data.firstService] : [];
  if (servicesToCreate.length) {
    await syncInitialServices(studio.id, servicesToCreate);
  }

  return {
    id: studio.id,
    name: studio.name,
    slug: studio.slug,
  };
}
