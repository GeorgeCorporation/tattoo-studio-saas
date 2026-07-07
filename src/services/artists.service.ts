import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { assertPublicSlug } from "@/lib/slugs";
import type { Database } from "@/types/database.types";
import { createStoragePath, getStoragePathFromPublicUrl, validateUploadFile } from "@/services/storage.service";

export type ArtistAccessInviteStatus = "pending" | "accepted" | "expired" | "revoked";

export type ArtistAccessInvite = {
  id: string;
  studio_id: string;
  artist_id: string;
  email: string;
  token: string;
  status: ArtistAccessInviteStatus;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at?: string;
};

export type Artist = {
  id: string;
  studio_id: string;
  name: string;
  slug: string;
  photo_url: string | null;
  specialty: string | null;
  bio: string | null;
  instagram: string | null;
  whatsapp: string | null;
  access_email: string | null;
  auth_user_id?: string | null;
  is_active: boolean;
  studios?: { slug: string; name: string } | null;
  artist_access_invites?: ArtistAccessInvite[] | null;
};

export type ArtistGalleryPhoto = {
  id: string;
  studio_id: string;
  artist_id: string | null;
  url: string;
  type: string;
};

export type ArtistNextAppointment = {
  id: string;
  date: string;
  time: string;
  status: string;
  clients: { name: string } | null;
  services: { name: string } | null;
};

export type ArtistFormData = {
  studioId: string;
  name: string;
  slug: string;
  specialty?: string;
  bio?: string;
  instagram?: string;
  whatsapp?: string;
  accessEmail?: string;
  photoUrl?: string;
};

type ArtistCreateResult = {
  id: string;
  accessWarning?: string;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function assertArtistAccessEmailAvailable(email: string, ignoreArtistId?: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return;

  let query = supabase.from("tattoo_artists").select("id").eq("access_email", normalizedEmail).limit(1);
  if (ignoreArtistId) query = query.neq("id", ignoreArtistId);

  const { data, error } = await query.maybeSingle<{ id: string }>();
  if (error) throw error;
  if (data) {
    throw new Error("Este e-mail já está em uso por outro tatuador.");
  }
}

function normalizeAccessEmail(email?: string) {
  const normalizedEmail = email?.trim().toLowerCase() ?? "";
  return normalizedEmail || null;
}

function isAccessEmailConflict(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { code?: string; message?: string; details?: string; hint?: string };
  const text = `${maybeError.message ?? ""} ${maybeError.details ?? ""} ${maybeError.hint ?? ""}`.toLowerCase();
  return (
    maybeError.code === "23505" &&
    (text.includes("access_email") ||
      text.includes("artist_access_invites") ||
      text.includes("email") ||
      text.includes("duplicate"))
  );
}

async function ensureUniqueSlug(studioId: string, slug: string, ignoreArtistId?: string) {
  const base = slugify(slug) || "tatuador";
  assertPublicSlug(base);
  let nextSlug = base;
  let suffix = 2;

  while (true) {
    let query = supabase
      .from("tattoo_artists")
      .select("id")
      .eq("studio_id", studioId)
      .eq("slug", nextSlug)
      .limit(1);

    if (ignoreArtistId) query = query.neq("id", ignoreArtistId);

    const { data, error } = await query;
    if (error) throw error;
    if (!data?.length) return nextSlug;

    nextSlug = `${base}-${suffix}`;
    suffix += 1;
  }
}

export { slugify };

export async function getArtists(studioId: string) {
  const { data, error } = await supabase
    .from("tattoo_artists")
    .select(
      "id, studio_id, name, slug, photo_url, specialty, bio, instagram, whatsapp, access_email, auth_user_id, is_active",
    )
    .eq("studio_id", studioId)
    .order("name", { ascending: true })
    .returns<Artist[]>();

  if (error) throw error;

  const artists = data ?? [];
  if (!artists.length) return artists;

  const { data: invites, error: invitesError } = await supabase
    .from("artist_access_invites")
    .select("id, studio_id, artist_id, email, token, status, expires_at, accepted_at, created_at, updated_at")
    .eq("studio_id", studioId)
    .returns<ArtistAccessInvite[]>();

  if (invitesError) {
    logger.warn("Convites de tatuadores nao carregados", { studioId, error: invitesError.message });
    return artists.map((artist) => ({ ...artist, artist_access_invites: [] }));
  }

  const invitesByArtistId = new Map<string, ArtistAccessInvite[]>();
  for (const invite of invites ?? []) {
    const current = invitesByArtistId.get(invite.artist_id) ?? [];
    current.push(invite);
    invitesByArtistId.set(invite.artist_id, current);
  }

  return artists.map((artist) => ({
    ...artist,
    artist_access_invites: invitesByArtistId.get(artist.id) ?? [],
  }));
}

export async function getArtistById(id: string) {
  const { data, error } = await supabase
    .from("tattoo_artists")
    .select(
      "id, studio_id, name, slug, photo_url, specialty, bio, instagram, whatsapp, access_email, auth_user_id, is_active, studios(slug, name), artist_access_invites(id, studio_id, artist_id, email, token, status, expires_at, accepted_at, created_at, updated_at)",
    )
    .eq("id", id)
    .maybeSingle<Artist>();

  if (error) throw error;
  return data;
}

async function insertArtist(data: ArtistFormData, slug: string, accessEmail: string | null) {
  return supabase
    .from("tattoo_artists")
    .insert({
      studio_id: data.studioId,
      name: data.name,
      slug,
      specialty: data.specialty || null,
      bio: data.bio || null,
      instagram: data.instagram || null,
      whatsapp: data.whatsapp || null,
      access_email: accessEmail,
      photo_url: data.photoUrl || null,
      is_active: true,
    })
    .select("id")
    .single<{ id: string }>();
}

export async function createArtist(data: ArtistFormData): Promise<ArtistCreateResult> {
  const slug = await ensureUniqueSlug(data.studioId, data.slug || data.name);
  let accessEmail = normalizeAccessEmail(data.accessEmail);
  let accessWarning: string | undefined;

  if (accessEmail) {
    try {
      await assertArtistAccessEmailAvailable(accessEmail);
    } catch (error) {
      logger.warn("Validacao de e-mail do tatuador falhou", { studioId: data.studioId });
      accessEmail = null;
      accessWarning = "Tatuador salvo. E-mail de ativacao pode ser ajustado depois.";
    }
  }

  let { data: artist, error } = await insertArtist(data, slug, accessEmail);

  if (error && accessEmail && isAccessEmailConflict(error)) {
    logger.warn("E-mail de acesso duplicado. Criando tatuador sem e-mail.", { studioId: data.studioId });
    accessEmail = null;
    accessWarning = "Tatuador salvo sem e-mail de ativacao. Ajuste o acesso depois.";
    const retry = await insertArtist(data, slug, null);
    artist = retry.data;
    error = retry.error;
  }

  if (error) throw error;
  if (!artist?.id) throw new Error("Nao foi possivel criar tatuador.");

  if (accessEmail) {
    try {
      await upsertArtistAccessInvite({
        artistId: artist.id,
        studioId: data.studioId,
        email: accessEmail,
      });
    } catch (error) {
      logger.warn("Convite do tatuador nao criado", { studioId: data.studioId, artistId: artist.id });
      accessWarning = "Tatuador salvo. Link de ativacao pode ser gerado depois.";
    }
  }

  return { ...artist, accessWarning };
}

export async function updateArtist(id: string, data: Partial<ArtistFormData>) {
  let slug = data.slug;
  if (data.studioId && data.slug) {
    slug = await ensureUniqueSlug(data.studioId, data.slug, id);
  }

  if (data.accessEmail?.trim()) {
    await assertArtistAccessEmailAvailable(data.accessEmail, id);
  }

  const payload: Database["public"]["Tables"]["tattoo_artists"]["Update"] = {};

  if (data.name !== undefined) payload.name = data.name;
  if (slug !== undefined) payload.slug = slug;
  if (data.specialty !== undefined) payload.specialty = data.specialty || null;
  if (data.bio !== undefined) payload.bio = data.bio || null;
  if (data.instagram !== undefined) payload.instagram = data.instagram || null;
  if (data.whatsapp !== undefined) payload.whatsapp = data.whatsapp || null;
  if (data.accessEmail !== undefined) payload.access_email = data.accessEmail || null;
  if (data.photoUrl !== undefined) payload.photo_url = data.photoUrl;

  const { error } = await supabase
    .from("tattoo_artists")
    .update(payload)
    .eq("id", id);

  if (error) throw error;
}

export async function getArtistAccessInvite(artistId: string) {
  const { data, error } = await supabase
    .from("artist_access_invites")
    .select("id, studio_id, artist_id, email, token, status, expires_at, accepted_at, created_at, updated_at")
    .eq("artist_id", artistId)
    .maybeSingle<ArtistAccessInvite>();

  if (error) throw error;
  return data;
}

export async function upsertArtistAccessInvite({
  artistId,
  studioId,
  email,
}: {
  artistId: string;
  studioId: string;
  email: string;
}) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("artist_access_invites")
    .upsert(
      {
        artist_id: artistId,
        studio_id: studioId,
        email: email.trim().toLowerCase(),
        token,
        status: "pending",
        expires_at: expiresAt,
        accepted_at: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "artist_id" },
    )
    .select("id, studio_id, artist_id, email, token, status, expires_at, accepted_at, created_at, updated_at")
    .single<ArtistAccessInvite>();

  if (error) throw error;
  return data;
}

export async function revokeArtistAccessInvite(artistId: string) {
  const { error } = await supabase
    .from("artist_access_invites")
    .update({
      status: "revoked",
      updated_at: new Date().toISOString(),
    })
    .eq("artist_id", artistId);

  if (error) throw error;
}

export function buildArtistActivationLink(token: string) {
  if (typeof window === "undefined") return `/ativar-tatuador/${token}`;
  return `${window.location.origin}/ativar-tatuador/${token}`;
}

export function getArtistAccessStatus(artist: Artist) {
  const invite = artist.artist_access_invites?.[0] ?? null;

  if (artist.auth_user_id) return "Acesso ativo";
  if (!invite && artist.access_email) return "Convite pendente";
  if (!invite) return "Sem acesso";
  if (invite.status === "accepted") return "Acesso ativo";
  if (invite.status === "expired") return "Convite expirado";
  if (invite.status === "revoked") return "Convite revogado";
  return "Convite pendente";
}

export async function toggleArtistStatus(id: string, isActive: boolean) {
  const { error } = await supabase.from("tattoo_artists").update({ is_active: isActive }).eq("id", id);
  if (error) throw error;
}

export async function deleteStorageFile(url: string, bucket: "artists" | "gallery") {
  const path = getStoragePathFromPublicUrl(url, bucket);
  if (!path) return;

  await supabase.storage.from(bucket).remove([path]);
}

export async function uploadArtistPhoto(file: File, studioId: string, artistId: string) {
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

export async function getArtistGallery(artistId: string) {
  const { data, error } = await supabase
    .from("gallery")
    .select("id, studio_id, artist_id, url, type")
    .eq("artist_id", artistId)
    .order("created_at", { ascending: false })
    .returns<ArtistGalleryPhoto[]>();

  if (error) throw error;
  return data ?? [];
}

export async function addArtistPhoto(file: File, studioId: string, artistId: string) {
  validateUploadFile(file);
  const path = createStoragePath(studioId, file.name);

  const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("gallery").getPublicUrl(path);

  const { error } = await supabase.from("gallery").insert({
    studio_id: studioId,
    artist_id: artistId,
    url: data.publicUrl,
    type: "photo",
  });

  if (error) throw error;
  return data.publicUrl;
}

export async function deleteArtistPhoto(id: string, url: string) {
  await deleteStorageFile(url, "gallery");
  const { error } = await supabase.from("gallery").delete().eq("id", id);
  if (error) throw error;
}

export async function getArtistNextAppointments(artistId: string, limit: number) {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("appointments")
    .select("id, date, time, status, clients(name), services(name)")
    .eq("artist_id", artistId)
    .in("status", ["pending", "confirmed"])
    .gte("date", today)
    .order("date", { ascending: true })
    .order("time", { ascending: true })
    .limit(limit)
    .returns<ArtistNextAppointment[]>();

  if (error) throw error;
  return data ?? [];
}
