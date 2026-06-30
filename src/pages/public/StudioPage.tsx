import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { logger } from "@/lib/logger";
import {
  getStudioArtists,
  getStudioBySlug,
  getStudioGallery,
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
        <p className="mt-3 text-zinc-400">Estudio nao encontrado.</p>
        <Link className="mt-6 inline-flex rounded-xl bg-[#E8650A] px-5 py-3 font-semibold" to="/">
          Voltar
        </Link>
      </section>
    </main>
  );
}

export function StudioPage() {
  const { slug } = useParams();
  const [studio, setStudio] = useState<PublicStudio | null>(null);
  const [artists, setArtists] = useState<PublicArtist[]>([]);
  const [gallery, setGallery] = useState<PublicGalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const studioSlug = slug;

    async function loadStudio() {
      try {
        setLoading(true);
        const foundStudio = await getStudioBySlug(studioSlug);

        if (!foundStudio) {
          setNotFound(true);
          return;
        }

        const [foundArtists, foundGallery] = await Promise.all([
          getStudioArtists(foundStudio.id),
          getStudioGallery(foundStudio.id),
        ]);

        setStudio(foundStudio);
        setArtists(foundArtists);
        setGallery(foundGallery);
      } catch (caughtError) {
        logger.error("Falha ao carregar pagina publica do estudio", caughtError, { slug: studioSlug });
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadStudio();
  }, [slug]);

  const address = useMemo(() => {
    if (!studio) return "";
    return [studio.address, studio.city, studio.state].filter(Boolean).join(" - ");
  }, [studio]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] text-zinc-300">
        Carregando...
      </div>
    );
  }

  if (notFound || !studio) return <NotFound />;

  const whatsApp = whatsappUrl(studio.whatsapp);
  const instagram = instagramUrl(studio.instagram);

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex size-24 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a]">
              {studio.logo_url ? (
                <img className="size-full object-cover" src={studio.logo_url} alt={studio.name} />
              ) : (
                <span className="text-3xl font-semibold text-[#E8650A]">{studio.name[0]}</span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-semibold sm:text-5xl">{studio.name}</h1>
              {studio.description ? (
                <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-300">{studio.description}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {instagram ? (
              <a className="rounded-xl border border-white/10 px-4 py-3 font-medium text-zinc-200" href={instagram}>
                Instagram
              </a>
            ) : null}
            {whatsApp ? (
              <Link className="rounded-xl bg-[#E8650A] px-4 py-3 font-semibold text-white" to={`/${studio.slug}/agendar`}>
                Agendar agora
              </Link>
            ) : (
              <button className="rounded-xl bg-[#E8650A] px-4 py-3 font-semibold text-white">Agendar agora</button>
            )}
          </div>
        </header>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold">Tatuadores</h2>
            <span className="text-sm text-zinc-500">{artists.length} profissionais</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((artist) => (
              <Link
                className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4 transition hover:border-[#E8650A]/70"
                key={artist.id}
                to={`/${studio.slug}/${artist.slug}`}
              >
                <div className="flex items-center gap-4">
                  <div className="size-16 overflow-hidden rounded-xl bg-[#0f0f0f]">
                    {artist.photo_url ? (
                      <img className="size-full object-cover" src={artist.photo_url} alt={artist.name} />
                    ) : null}
                  </div>
                  <div>
                    <p className="font-semibold">{artist.name}</p>
                    <p className="mt-1 text-sm text-zinc-400">{artist.specialty ?? "Tattoo artist"}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Galeria</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.map((item) => (
              <img
                className="aspect-square rounded-xl border border-white/10 object-cover"
                key={item.id}
                src={item.url}
                alt=""
              />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
          <h2 className="text-xl font-semibold">Localizacao</h2>
          <p className="mt-2 text-zinc-300">{address || "Endereco ainda nao informado."}</p>
          {whatsApp ? (
            <a className="mt-5 inline-flex rounded-xl border border-white/10 px-5 py-3 font-semibold" href={whatsApp}>
              WhatsApp
            </a>
          ) : null}
        </section>
      </section>
    </main>
  );
}
