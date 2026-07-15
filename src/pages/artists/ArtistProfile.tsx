import { Camera, Copy, Trash2, Upload, X } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { copyTextToClipboard } from "@/lib/clipboard";
import { useArtist } from "@/hooks/useArtist";

const specialtySuggestions = ["Fine line", "Blackwork", "Old school", "Realismo", "Anime", "Aquarela", "Minimalista"];

function statusClass(status: string) {
  if (status === "confirmed") return "bg-green-500/15 text-green-300";
  return "bg-yellow-500/15 text-yellow-300";
}

function accessStatusClass(status: string) {
  if (status === "Acesso ativo") return "bg-green-500/15 text-green-300";
  if (status === "Convite pendente") return "bg-yellow-500/15 text-yellow-300";
  if (status === "Convite expirado") return "bg-red-500/15 text-red-300";
  if (status === "Convite revogado") return "bg-zinc-500/15 text-zinc-300";
  return "bg-zinc-500/15 text-zinc-300";
}

export function ArtistProfile() {
  const { artistId } = useParams();
  const {
    artist,
    gallery,
    appointments,
    loading,
    error,
    updateArtist,
    uploadPhoto,
    addPhoto,
    deletePhoto,
    toggleStatus,
    accessStatus,
    activationLink,
    refreshAccessInvite,
    removeAccessInvite,
  } =
    useArtist(artistId);
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [accessEmail, setAccessEmail] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState("");

  useEffect(() => {
    if (!artist) return;
    setName(artist.name);
    setSpecialty(artist.specialty ?? "");
    setBio(artist.bio ?? "");
    setInstagram(artist.instagram ?? "");
    setWhatsapp(artist.whatsapp ?? "");
    setAccessEmail(artist.artist_access_invites?.[0]?.email ?? artist.access_email ?? "");
    setSlug(artist.slug);
  }, [artist]);

  const publicLink = useMemo(() => {
    if (!artist?.studios?.slug) return "";
    return `${window.location.origin}/${artist.studios.slug}/${artist.slug}`;
  }, [artist]);

  async function handleSave(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!artist) return;

    try {
      setSaving(true);
      await updateArtist({ name, slug, specialty, bio, instagram, whatsapp, accessEmail });
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadPhoto(file);
  }

  async function handleGalleryUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    await addPhoto(files);
  }

  async function handleDeletePhoto(photoId: string, url: string) {
    if (!window.confirm("Deletar esta foto?")) return;
    await deletePhoto({ id: photoId, url, artist_id: artist?.id ?? null, studio_id: artist?.studio_id ?? "", type: "photo" });
  }

  async function handleToggle() {
    if (!artist) return;
    if (artist.is_active && !window.confirm("Desativar este tatuador?")) return;
    await toggleStatus(!artist.is_active);
  }

  async function copyPublicLink() {
    if (!publicLink) return;
    const copied = await copyTextToClipboard(publicLink);
    setCopyFeedback(copied ? "Link copiado." : "Nao consegui copiar. Copie manualmente.");
  }

  async function copyActivationLink() {
    if (!activationLink) return;
    const copied = await copyTextToClipboard(activationLink);
    setCopyFeedback(copied ? "Link de ativacao copiado." : "Nao consegui copiar. Copie manualmente.");
  }

  async function handleRefreshInvite() {
    await refreshAccessInvite(accessEmail);
  }

  async function handleRemoveAccess() {
    if (!window.confirm("Remover acesso deste tatuador?")) return;
    await removeAccessInvite();
  }

  useEffect(() => {
    if (!copyFeedback) return;
    const timer = window.setTimeout(() => setCopyFeedback(""), 3000);
    return () => window.clearTimeout(timer);
  }, [copyFeedback]);

  if (loading) return <p className="text-sm text-zinc-400">Carregando tatuador...</p>;
  if (!artist) return <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">Tatuador não encontrado.</p>;

  return (
    <section className="space-y-6">
      <Link className="text-sm font-medium text-[#E8650A]" to="/tatuadores">
        Voltar para tatuadores
      </Link>

      {error ? <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p> : null}

      <section className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative size-[120px] overflow-hidden rounded-xl bg-[#E8650A]">
              {artist.photo_url ? (
                <img className="size-full object-cover" src={artist.photo_url} alt={artist.name} />
              ) : (
                <div className="flex size-full items-center justify-center text-4xl font-semibold">{artist.name[0]}</div>
              )}
              <label className="absolute inset-x-0 bottom-0 flex cursor-pointer items-center justify-center gap-2 bg-black/70 py-2 text-xs font-semibold">
                <Camera size={14} />
                Trocar foto
                <input accept="image/*" className="hidden" onChange={handlePhotoChange} type="file" />
              </label>
            </div>

            <div className="grid gap-3">
              <input
                className="rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-2xl font-semibold"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <input
                className="rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-sm text-zinc-300"
                value={specialty}
                onChange={(event) => setSpecialty(event.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  className={[
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    artist.is_active ? "bg-green-500/15 text-green-300" : "bg-zinc-500/15 text-zinc-300",
                  ].join(" ")}
                  onClick={handleToggle}
                  type="button"
                >
                  {artist.is_active ? "Ativo" : "Inativo"}
                </button>
                <span className={["rounded-full px-3 py-1 text-xs font-semibold", accessStatusClass(accessStatus)].join(" ")}>
                  {accessStatus}
                </span>
                {publicLink ? (
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300"
                    onClick={copyPublicLink}
                    type="button"
                  >
                    <Copy size={13} />
                    Copiar link
                  </button>
                ) : null}
                {accessEmail || activationLink ? (
                  <>
                    {activationLink ? (
                      <button
                        className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300"
                        onClick={copyActivationLink}
                        type="button"
                      >
                        <Copy size={13} />
                        Copiar link de ativacao
                      </button>
                    ) : null}
                    <button
                      className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300"
                      onClick={handleRefreshInvite}
                      type="button"
                    >
                      Gerar novo link
                    </button>
                    <button
                      className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-200"
                      onClick={handleRemoveAccess}
                      type="button"
                    >
                      Remover acesso
                    </button>
                  </>
                ) : null}
              </div>
              {copyFeedback ? <p className="text-xs text-zinc-400">{copyFeedback}</p> : null}
            </div>
          </div>

          <button
            className="rounded-xl bg-[#E8650A] px-4 py-3 font-semibold disabled:opacity-60"
            disabled={saving}
            onClick={() => handleSave()}
            type="button"
          >
            {saving ? "Salvando..." : "Salvar alteracoes"}
          </button>
        </div>
      </section>

      <form className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5" onSubmit={handleSave}>
        <h2 className="text-xl font-semibold">Dados pessoais</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-medium">Nome</span>
            <input className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Especialidade</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
              list="artist-profile-specialty-suggestions"
              onChange={(event) => setSpecialty(event.target.value)}
              placeholder="Ex: Fine line, realismo, blackwork"
              value={specialty}
            />
            <datalist id="artist-profile-specialty-suggestions">
              {specialtySuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">Instagram</span>
            <input className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3" value={instagram} onChange={(event) => setInstagram(event.target.value)} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">WhatsApp</span>
            <input className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium">E-mail para ativacao do tatuador</span>
            <input className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3" type="email" value={accessEmail} onChange={(event) => setAccessEmail(event.target.value)} />
            <p className="mt-2 text-xs text-zinc-500">
              Sistema gera link de ativacao. Tatuador cria proprio acesso ao abrir convite.
            </p>
          </label>
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-medium">Slug</span>
            <input className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3" value={slug} onChange={(event) => setSlug(event.target.value)} />
            <p className="mt-2 text-xs text-yellow-300">Ao editar o slug, o link publico vai mudar.</p>
          </label>
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-medium">Biografia</span>
            <textarea className="min-h-32 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3" value={bio} onChange={(event) => setBio(event.target.value)} />
          </label>
        </div>
        <button className="mt-5 rounded-xl bg-[#E8650A] px-4 py-3 font-semibold" type="submit">
          Salvar dados
        </button>
      </form>

      <section className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold">Portfolio / Galeria</h2>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#E8650A] px-4 py-3 text-sm font-semibold">
            <Upload size={16} />
            Adicionar fotos
            <input accept="image/*" className="hidden" multiple onChange={handleGalleryUpload} type="file" />
          </label>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
          {gallery.map((photo) => (
            <div className="group relative overflow-hidden rounded-xl" key={photo.id}>
              <button className="block w-full" onClick={() => setLightbox(photo.url)} type="button">
                <img className="aspect-square w-full object-cover" src={photo.url} alt="" />
              </button>
              <button
                className="absolute right-2 top-2 hidden rounded-lg bg-red-500 p-2 text-white group-hover:block"
                onClick={() => handleDeletePhoto(photo.id, photo.url)}
                type="button"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Proximos agendamentos</h2>
          <Link className="text-sm font-medium text-[#E8650A]" to="/agenda">
            Ver todos
          </Link>
        </div>
        <div className="mt-4 divide-y divide-white/10">
          {appointments.map((appointment) => (
            <article className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between" key={appointment.id}>
              <div>
                <p className="font-semibold">
                  {appointment.date} as {appointment.time.slice(0, 5)}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {appointment.clients?.name ?? "Cliente"} - {appointment.services?.name ?? "Serviço"}
                </p>
              </div>
              <span className={["w-fit rounded-full px-3 py-1 text-xs font-semibold", statusClass(appointment.status)].join(" ")}>
                {appointment.status}
              </span>
            </article>
          ))}
          {!appointments.length ? <p className="py-5 text-sm text-zinc-500">Sem proximos agendamentos.</p> : null}
        </div>
      </section>

      {lightbox ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button className="absolute right-4 top-4 rounded-lg bg-white/10 p-2" onClick={() => setLightbox(null)} type="button">
            <X size={22} />
          </button>
          <img className="max-h-[90vh] max-w-full rounded-xl object-contain" src={lightbox} alt="" />
        </div>
      ) : null}
    </section>
  );
}
