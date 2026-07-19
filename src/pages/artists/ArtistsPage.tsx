import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDashboardAccess } from "@/hooks/useDashboardAccess";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { ArtistModal } from "@/pages/artists/ArtistModal";
import { getArtistAccessStatus, getArtists, toggleArtistStatus, type Artist } from "@/services/artists.service";

export function ArtistsPage() {
  const navigate = useNavigate();
  const studioId = useDashboardAccess()?.studioId ?? "";
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const loadArtists = useCallback(async () => {
    if (!studioId) return;

    try {
      setLoading(true);
      setError("");
      setArtists(await getArtists(studioId));
    } catch (caughtError) {
      logger.error("Falha ao carregar tatuadores", caughtError);
      setError(getFriendlyErrorMessage(caughtError, "Não foi possível carregar tatuadores."));
    } finally {
      setLoading(false);
    }
  }, [studioId]);

  useEffect(() => {
    loadArtists();
  }, [loadArtists]);

  async function handleToggle(artist: Artist) {
    if (artist.is_active && !window.confirm("Desativar este tatuador?")) return;
    try {
      await toggleArtistStatus(artist.id, !artist.is_active);
      await loadArtists();
    } catch (caughtError) {
      logger.error("Falha ao alternar status do tatuador", caughtError, { artistId: artist.id });
      setError(getFriendlyErrorMessage(caughtError, "Não foi possível atualizar o tatuador."));
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Tatuadores</h1>
          <p className="mt-2 text-sm text-zinc-400">Equipe, perfis publicos e portfolio.</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8650A] px-4 py-3 font-semibold"
          onClick={() => setModalOpen(true)}
          type="button"
        >
          <Plus size={18} />
          Adicionar tatuador
        </button>
      </div>

      {error ? <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p> : null}
      {loading ? <p className="text-sm text-zinc-400">Carregando tatuadores...</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {artists.map((artist) => (
          <article className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4" key={artist.id}>
            <div className="flex items-center gap-4">
              <div className="flex size-20 items-center justify-center overflow-hidden rounded-xl bg-[#E8650A]">
                {artist.photo_url ? (
                  <img className="size-full object-cover" src={artist.photo_url} alt={artist.name} />
                ) : (
                  <span className="text-2xl font-semibold">{artist.name[0]}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold">{artist.name}</p>
                <p className="mt-1 text-sm text-zinc-400">{artist.specialty ?? "Sem especialidade"}</p>
                <span
                  className={[
                    "mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                    artist.is_active ? "bg-green-500/15 text-green-300" : "bg-zinc-500/15 text-zinc-300",
                  ].join(" ")}
                >
                  {artist.is_active ? "Ativo" : "Inativo"}
                </span>
                <p className="mt-2 text-xs text-zinc-500">{getArtistAccessStatus(artist)}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Link
                className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-semibold"
                to={`/dashboard/tatuadores/${artist.id}`}
              >
                Ver perfil
              </Link>
              <button
                className="rounded-xl bg-[#E8650A] px-4 py-3 text-sm font-semibold"
                onClick={() => handleToggle(artist)}
                type="button"
              >
                {artist.is_active ? "Desativar" : "Ativar"}
              </button>
            </div>
          </article>
        ))}
      </div>

      {!loading && !artists.length ? (
        <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-8 text-center text-zinc-400">
          Nenhum tatuador cadastrado.
        </div>
      ) : null}

      <ArtistModal
        onClose={() => setModalOpen(false)}
        onCreated={(artistId) => navigate(`/dashboard/tatuadores/${artistId}`)}
        open={modalOpen}
        studioId={studioId}
      />
    </section>
  );
}
