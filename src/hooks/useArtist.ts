import { useCallback, useEffect, useState } from "react";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import {
  addArtistPhoto,
  deleteArtistPhoto,
  deleteStorageFile,
  getArtistById,
  getArtistGallery,
  getArtistNextAppointments,
  toggleArtistStatus,
  updateArtist,
  uploadArtistPhoto,
  type Artist,
  type ArtistGalleryPhoto,
  type ArtistNextAppointment,
} from "@/services/artists.service";

export function useArtist(artistId?: string) {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [gallery, setGallery] = useState<ArtistGalleryPhoto[]>([]);
  const [appointments, setAppointments] = useState<ArtistNextAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadArtist = useCallback(async () => {
    if (!artistId) return;

    try {
      setLoading(true);
      setError("");
      const foundArtist = await getArtistById(artistId);
      setArtist(foundArtist);

      if (foundArtist) {
        const [foundGallery, foundAppointments] = await Promise.all([
          getArtistGallery(foundArtist.id),
          getArtistNextAppointments(foundArtist.id, 5),
        ]);
        setGallery(foundGallery);
        setAppointments(foundAppointments);
      }
    } catch (caughtError) {
      logger.error("Falha ao carregar perfil do tatuador", caughtError, { artistId });
      setError(getFriendlyErrorMessage(caughtError, "Nao foi possivel carregar tatuador."));
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    loadArtist();
  }, [loadArtist]);

  async function saveArtist(data: {
    name: string;
    slug: string;
    specialty?: string;
    bio?: string;
    instagram?: string;
    whatsapp?: string;
  }) {
    if (!artist) return;
    await updateArtist(artist.id, { ...data, studioId: artist.studio_id });
    await loadArtist();
  }

  async function uploadPhoto(file: File) {
    if (!artist) return;
    if (artist.photo_url) await deleteStorageFile(artist.photo_url, "artists");
    const photoUrl = await uploadArtistPhoto(file, artist.studio_id, artist.id);
    await updateArtist(artist.id, { photoUrl });
    await loadArtist();
  }

  async function addPhoto(files: File[]) {
    if (!artist) return;
    await Promise.all(files.map((file) => addArtistPhoto(file, artist.studio_id, artist.id)));
    await loadArtist();
  }

  async function deletePhoto(photo: ArtistGalleryPhoto) {
    await deleteArtistPhoto(photo.id, photo.url);
    await loadArtist();
  }

  async function toggleStatus(isActive: boolean) {
    if (!artist) return;
    await toggleArtistStatus(artist.id, isActive);
    await loadArtist();
  }

  return {
    artist,
    gallery,
    appointments,
    loading,
    error,
    updateArtist: saveArtist,
    uploadPhoto,
    addPhoto,
    deletePhoto,
    toggleStatus,
  };
}
