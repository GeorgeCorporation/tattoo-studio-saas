import { supabase } from "@/lib/supabase";

export type PublicStudio = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  instagram: string | null;
  whatsapp: string | null;
  website: string | null;
};

export type PublicArtist = {
  id: string;
  studio_id: string;
  name: string;
  slug: string;
  photo_url: string | null;
  specialty: string | null;
  bio: string | null;
  instagram: string | null;
  whatsapp: string | null;
  is_active: boolean;
};

export type PublicGalleryItem = {
  id: string;
  studio_id: string;
  artist_id: string | null;
  url: string;
  type: string;
};

export async function getStudioBySlug(slug: string) {
  const { data, error } = await supabase
    .from("studios")
    .select(
      "id, name, slug, logo_url, description, address, city, state, instagram, whatsapp, website",
    )
    .eq("slug", slug)
    .maybeSingle<PublicStudio>();

  if (error) throw error;
  return data;
}

export async function getArtistBySlug(studioId: string, artistSlug: string) {
  const { data, error } = await supabase
    .from("tattoo_artists")
    .select("id, studio_id, name, slug, photo_url, specialty, bio, instagram, whatsapp, is_active")
    .eq("studio_id", studioId)
    .eq("slug", artistSlug)
    .eq("is_active", true)
    .maybeSingle<PublicArtist>();

  if (error) throw error;
  return data;
}

export async function getStudioArtists(studioId: string) {
  const { data, error } = await supabase
    .from("tattoo_artists")
    .select("id, studio_id, name, slug, photo_url, specialty, bio, instagram, whatsapp, is_active")
    .eq("studio_id", studioId)
    .eq("is_active", true)
    .order("name", { ascending: true })
    .returns<PublicArtist[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getStudioGallery(studioId: string) {
  const { data, error } = await supabase
    .from("gallery")
    .select("id, studio_id, artist_id, url, type")
    .eq("studio_id", studioId)
    .order("created_at", { ascending: false })
    .returns<PublicGalleryItem[]>();

  if (error) throw error;
  return data ?? [];
}

export async function getArtistGallery(artistId: string) {
  const { data, error } = await supabase
    .from("gallery")
    .select("id, studio_id, artist_id, url, type")
    .eq("artist_id", artistId)
    .order("created_at", { ascending: false })
    .returns<PublicGalleryItem[]>();

  if (error) throw error;
  return data ?? [];
}
