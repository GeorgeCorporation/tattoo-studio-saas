import { supabase } from "@/lib/supabase";
import { assertPublicSlug } from "@/lib/slugs";
import type { Database } from "@/types/database.types";
import { createStoragePath, getStoragePathFromPublicUrl, validateUploadFile } from "@/services/storage.service";

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

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
    .select("id, studio_id, name, slug, photo_url, specialty, bio, instagram, whatsapp, access_email, auth_user_id, is_active")
    .eq("studio_id", studioId)
    .order("name", { ascending: true })
    .returns<Artist[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getArtistById(id: string) {
  const { data, error } = await supabase
    .from("tattoo_artists")
    .select(
      "id, studio_id, name, slug, photo_url, specialty, bio, instagram, whatsapp, access_email, auth_user_id, is_active, studios(slug, name)",
    )
    .eq("id", id)
    .maybeSingle<Artist>();

  if (error) throw error;
  return data;
}

export async function createArtist(data: ArtistFormData) {
  const slug = await ensureUniqueSlug(data.studioId, data.slug || data.name);

  const { data: artist, error } = await supabase
    .from("tattoo_artists")
    .insert({
      studio_id: data.studioId,
      name: data.name,
      slug,
      specialty: data.specialty || null,
      bio: data.bio || null,
      instagram: data.instagram || null,
      whatsapp: data.whatsapp || null,
      access_email: data.accessEmail || null,
      photo_url: data.photoUrl || null,
      is_active: true,
    })
    .select("id")
    .single<{ id: string }>();

  if (error) throw error;
  return artist;
}

export async function updateArtist(id: string, data: Partial<ArtistFormData>) {
  let slug = data.slug;
  if (data.studioId && data.slug) {
    slug = await ensureUniqueSlug(data.studioId, data.slug, id);
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
