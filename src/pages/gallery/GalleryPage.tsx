import { Filter, ImageIcon, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { UploadModal } from "@/pages/gallery/UploadModal";
import { getArtists, type Artist } from "@/services/artists.service";
import { getCurrentUserStudio } from "@/services/dashboard.service";
import { deletePhoto, getGallery, type GalleryPhoto } from "@/services/gallery.service";

export function GalleryPage() {
  const { user } = useAuth();
  const [studioId, setStudioId] = useState("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [artistFilter, setArtistFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadGallery = useCallback(
    async (nextStudioId?: string) => {
      const activeStudioId = nextStudioId || studioId;
      if (!activeStudioId) return;

      setPhotos(await getGallery(activeStudioId, artistFilter || undefined));
    },
    [artistFilter, studioId],
  );

  const loadInitialData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      const studio = await getCurrentUserStudio(user.id);
      if (!studio) {
        setError("Estúdio não encontrado.");
        return;
      }

      setStudioId(studio.id);
      const [artistList, gallery] = await Promise.all([getArtists(studio.id), getGallery(studio.id)]);
      setArtists(artistList);
      setPhotos(gallery);
    } catch (caughtError) {
      logger.error("Falha ao carregar galeria", caughtError);
      setError(getFriendlyErrorMessage(caughtError, "Não foi possível carregar a galeria."));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (studioId) {
      loadGallery();
    }
  }, [artistFilter, loadGallery, studioId]);

  async function handleDelete(photo: GalleryPhoto) {
    const confirmed = window.confirm("Remover esta foto da galeria?");
    if (!confirmed) return;

    try {
      await deletePhoto(photo.id, photo.url);
      await loadGallery();
    } catch (caughtError) {
      logger.error("Falha ao remover foto da galeria", caughtError, { photoId: photo.id });
      setError(getFriendlyErrorMessage(caughtError, "Não foi possível remover a foto."));
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Galeria</h1>
          <p className="mt-2 text-sm text-zinc-400">Organize o portfólio público do estúdio e valorize o trabalho de cada tatuador.</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8650A] px-4 py-3 font-semibold"
          onClick={() => setModalOpen(true)}
          type="button"
        >
          <Plus size={18} />
          Adicionar fotos
        </button>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-zinc-200" htmlFor="artist-filter">
          <Filter size={16} />
          Filtrar por tatuador
        </label>
        <select
          className="mt-3 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none focus:border-[#E8650A] sm:max-w-sm"
          id="artist-filter"
          onChange={(event) => setArtistFilter(event.target.value)}
          value={artistFilter}
        >
          <option value="">Todos os tatuadores</option>
          {artists.map((artist) => (
            <option key={artist.id} value={artist.id}>
              {artist.name}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p> : null}
      {loading ? <p className="text-sm text-zinc-400">Carregando galeria...</p> : null}

      {!loading && photos.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {photos.map((photo) => (
            <article className="group relative aspect-square overflow-hidden rounded-xl bg-[#1a1a1a]" key={photo.id}>
              <button className="h-full w-full" onClick={() => setLightboxUrl(photo.url)} type="button">
                <img alt="Foto da galeria" className="h-full w-full object-cover transition group-hover:scale-105" src={photo.url} />
              </button>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-xs text-zinc-200 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                {photo.tattoo_artists?.name || "Estúdio"}
              </div>
              <button
                className="absolute right-2 top-2 rounded-full bg-red-500/90 p-2 text-white opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100"
                onClick={() => handleDelete(photo)}
                title="Remover foto"
                type="button"
              >
                <Trash2 size={16} />
              </button>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && !photos.length ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-white/10 bg-[#1a1a1a] p-8 text-center">
          <ImageIcon className="text-zinc-500" size={38} />
          <h2 className="mt-4 text-lg font-semibold">Sua galeria ainda está vazia</h2>
          <p className="mt-2 text-sm text-zinc-400">Envie imagens para fortalecer sua página pública e o portfólio dos artistas.</p>
        </div>
      ) : null}

      <UploadModal
        artists={artists}
        onClose={() => setModalOpen(false)}
        onUploaded={loadGallery}
        open={modalOpen}
        studioId={studioId}
      />

      {lightboxUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white" onClick={() => setLightboxUrl("")} type="button">
            <X size={20} />
          </button>
          <img alt="Foto ampliada" className="max-h-[88vh] max-w-full rounded-xl object-contain" src={lightboxUrl} />
        </div>
      ) : null}
    </section>
  );
}
