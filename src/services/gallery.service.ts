import { supabase } from "@/lib/supabase";
import { createStoragePath, getStoragePathFromPublicUrl } from "@/services/storage.service";

export type GalleryPhoto = {
  id: string;
  studio_id: string;
  artist_id: string | null;
  url: string;
  type: string;
  created_at: string;
  tattoo_artists: { name: string } | null;
};

export async function getGallery(studioId: string, artistId?: string) {
  let query = supabase
    .from("gallery")
    .select("id, studio_id, artist_id, url, type, created_at, tattoo_artists(name)")
    .eq("studio_id", studioId)
    .order("created_at", { ascending: false });

  if (artistId) {
    query = query.eq("artist_id", artistId);
  }

  const { data, error } = await query.returns<GalleryPhoto[]>();

  if (error) throw error;
  return data ?? [];
}

export async function uploadPhoto(file: File, studioId: string, artistId?: string) {
  const path = createStoragePath(studioId, file.name);

  const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadError) throw uploadError;

  const { data: publicUrl } = supabase.storage.from("gallery").getPublicUrl(path);

  const { data, error } = await supabase
    .from("gallery")
    .insert({
      studio_id: studioId,
      artist_id: artistId || null,
      url: publicUrl.publicUrl,
      type: "photo",
    })
    .select("id, studio_id, artist_id, url, type, created_at, tattoo_artists(name)")
    .single<GalleryPhoto>();

  if (error) throw error;
  return data;
}

export async function deletePhoto(id: string, url: string) {
  const path = getStoragePathFromPublicUrl(url, "gallery");

  if (path) {
    const { error: storageError } = await supabase.storage.from("gallery").remove([path]);
    if (storageError) throw storageError;
  }

  const { error } = await supabase.from("gallery").delete().eq("id", id);
  if (error) throw error;
}
