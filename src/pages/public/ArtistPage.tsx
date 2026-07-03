import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { logger } from "@/lib/logger";
import {
  getArtistBySlug,
  getArtistGallery,
  getStudioBySlug,
  type PublicArtist,
  type PublicGalleryItem,
  type PublicStudio,
} from "@/services/public.service";

function whatsappUrl(phone?: string | null) {
  const digits = phone?.replace(/\D/g, "");
  if (!digits) return null;

  return `https://wa.me/55${digits}?text=Ol%C3%A1%2C%20quero%20agendar`;
}

function instagramUrl(username?: string | null) {
  if (!username) return null;
  return `https://instagram.com/${username.replace("@", "")}`;
}

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-white">
      <section className="max-w-md text-center">
        <p className="text-3xl font-semibold">404</p>
        <p className="mt-3 text-zinc-400">Tatuador não encontrado.</p>
        <Link className="mt-6 inline-flex rounded-xl bg-[#E8650A] px-5 py-3 font-semibold" to="/">
          Voltar
        </Link>
      </section>
    </main>
  );
}

export function ArtistPage() {
  const { slug, artistSlug } = useParams();
  const [studio, setStudio] = useState<PublicStudio | null>(null);
  const [artist, setArtist] = useState<PublicArtist | null>(null);
  const [gallery, setGallery] = useState<PublicGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug || !artistSlug) return;
    const studioSlug = slug;
    const currentArtistSlug = artistSlug;

    async function loadArtist() {
      try {
        setLoading(true);
        const foundStudio = await getStudioBySlug(studioSlug);

        if (!foundStudio) {
          setNotFound(true);
          return;
        }

        const foundArtist = await getArtistBySlug(foundStudio.id, currentArtistSlug);

        if (!foundArtist) {
          setNotFound(true);
          return;
        }

        const foundGallery = await getArtistGallery(foundArtist.id);

        setStudio(foundStudio);
        setArtist(foundArtist);
        setGallery(foundGallery);
      } catch (caughtError) {
        logger.error("Falha ao carregar página pública do tatuador", caughtError, {
          slug: studioSlug,
          artistSlug: currentArtistSlug,
        });
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadArtist();
  }, [slug, artistSlug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] text-zinc-300">
        Carregando...
      </div>
    );
  }

  if (notFound || !studio || !artist) return <NotFound />;

  const whatsApp = whatsappUrl(artist.whatsapp ?? studio.whatsapp);
  const instagram = instagramUrl(artist.instagram);

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <Link className="text-sm font-medium text-[#E8650A]" to={`/${studio.slug}`}>
          Voltar para {studio.name}
        </Link>

        <header className="grid gap-6 border-b border-white/10 pb-8 md:grid-cols-[220px_1fr] md:items-end">
          <div className="aspect-square overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a]">
            {artist.photo_url ? (
              <img className="size-full object-cover" src={artist.photo_url} alt={artist.name} />
            ) : null}
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#E8650A]">
              {artist.specialty ?? "Tatuador"}
            </p>
            <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{artist.name}</h1>
            {artist.bio ? <p className="mt-4 max-w-2xl leading-7 text-zinc-300">{artist.bio}</p> : null}

            <div className="mt-6 flex flex-wrap gap-3">
              {instagram ? (
                <a className="rounded-xl border border-white/10 px-4 py-3 font-medium text-zinc-200" href={instagram}>
                  Instagram
                </a>
              ) : null}
              {whatsApp ? (
                <a className="rounded-xl border border-white/10 px-4 py-3 font-medium text-zinc-200" href={whatsApp}>
                  WhatsApp
                </a>
              ) : null}
              <Link
                className="rounded-xl bg-[#E8650A] px-4 py-3 font-semibold text-white"
                to={`/${studio.slug}/${artist.slug}/agendar`}
              >
                Agendar com {artist.name}
              </Link>
            </div>
          </div>
        </header>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Galeria</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map((item) => (
              <img
                className="aspect-square rounded-xl border border-white/10 object-cover"
                key={item.id}
                src={item.url}
                alt=""
              />
            ))}
          </div>
          {gallery.length === 0 ? (
            <p className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5 text-sm text-zinc-400">
              Este portfólio ainda está sendo preparado.
            </p>
          ) : null}
        </section>
      </section>
    </main>
  );
}
