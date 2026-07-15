import { useCallback, useEffect, useState } from "react";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import {
  addArtistPhoto,
  buildArtistActivationLink,
  deleteArtistPhoto,
  deleteStorageFile,
  getArtistById,
  getArtistGallery,
  getArtistNextAppointments,
  getArtistAccessStatus,
  revokeArtistAccessInvite,
  upsertArtistAccessInvite,
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
      setError(getFriendlyErrorMessage(caughtError, "Não foi possível carregar tatuador."));
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
    accessEmail?: string;
  }) {
    if (!artist) return;
    const { accessEmail, ...profileData } = data;
    await updateArtist(artist.id, { ...profileData, studioId: artist.studio_id });
    if (data.accessEmail !== undefined) {
      const email = data.accessEmail?.trim();
      if (email) {
        await upsertArtistAccessInvite({
          artistId: artist.id,
          studioId: artist.studio_id,
          email,
        });
      } else {
        await revokeArtistAccessInvite(artist.id);
      }
    }
    await loadArtist();
  }

  async function refreshAccessInvite(nextEmail?: string) {
    if (!artist) return;
    const email = nextEmail?.trim() || artist.artist_access_invites?.[0]?.email || artist.access_email;
    const invite = email
      ? await upsertArtistAccessInvite({
          artistId: artist.id,
          studioId: artist.studio_id,
          email,
        })
      : null;
    await loadArtist();
    return invite;
  }

  async function removeAccessInvite() {
    if (!artist) return;
    await revokeArtistAccessInvite(artist.id);
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
    accessStatus: artist ? getArtistAccessStatus(artist) : "",
    activationLink: artist?.artist_access_invites?.[0]?.token
      ? buildArtistActivationLink(artist.artist_access_invites[0].token)
      : "",
    refreshAccessInvite,
    removeAccessInvite,
  };
}
