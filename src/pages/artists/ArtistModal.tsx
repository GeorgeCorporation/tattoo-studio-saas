import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { createArtist, slugify, updateArtist, uploadArtistPhoto } from "@/services/artists.service";

type ArtistModalProps = {
  open: boolean;
  studioId: string;
  onClose: () => void;
  onCreated: (artistId: string) => void;
};

const specialtySuggestions = ["Fine line", "Blackwork", "Old school", "Realismo", "Anime", "Aquarela", "Minimalista"];

export function ArtistModal({ open, studioId, onClose, onCreated }: ArtistModalProps) {
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [accessEmail, setAccessEmail] = useState("");
  const [slug, setSlug] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function clearMessages() {
    if (error) setError("");
    if (notice) setNotice("");
  }

  useEffect(() => {
    if (!open) return;
    setName("");
    setSpecialty("");
    setInstagram("");
    setWhatsapp("");
    setAccessEmail("");
    setSlug("");
    setPhoto(null);
    setError("");
    setNotice("");
  }, [open]);

  useEffect(() => {
    setSlug(slugify(name));
  }, [name]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!name.trim()) {
      setError("Nome e obrigatorio.");
      return;
    }

    try {
      setSaving(true);
      const artist = await createArtist({ studioId, name, slug, specialty, instagram, whatsapp, accessEmail });

      if (photo) {
        try {
          const photoUrl = await uploadArtistPhoto(photo, studioId, artist.id);
          await updateArtist(artist.id, { photoUrl });
        } catch (caughtError) {
          logger.warn("Foto do tatuador nao enviada", { studioId, artistId: artist.id });
          setNotice(artist.accessWarning ?? "Tatuador salvo. Foto pode ser enviada depois.");
          window.setTimeout(() => onCreated(artist.id), 900);
          return;
        }
      }

      if (artist.accessWarning) {
        setNotice(artist.accessWarning);
        window.setTimeout(() => onCreated(artist.id), 900);
        return;
      }

      onCreated(artist.id);
    } catch (caughtError) {
      logger.error("Falha ao criar tatuador", caughtError, { studioId });
      const friendlyError = getFriendlyErrorMessage(caughtError, "Nao foi possivel criar tatuador.");
      setError(friendlyError);
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <section className="w-full max-w-xl rounded-xl border border-white/10 bg-[#1a1a1a] text-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="text-xl font-semibold">Adicionar tatuador</h2>
            <p className="mt-1 text-sm text-zinc-400">Crie o perfil do profissional.</p>
          </div>
          <button className="rounded-lg p-2 hover:bg-white/5" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </header>

        <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
          <label>
            <span className="mb-2 block text-sm font-medium">Nome</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
              onChange={(event) => {
                setName(event.target.value);
                clearMessages();
              }}
              required
              value={name}
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">Especialidade</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
              list="artist-specialty-suggestions"
              onChange={(event) => {
                setSpecialty(event.target.value);
                clearMessages();
              }}
              placeholder="Ex: Fine line, realismo, blackwork"
              value={specialty}
            />
            <datalist id="artist-specialty-suggestions">
              {specialtySuggestions.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium">Instagram</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                onChange={(event) => {
                  setInstagram(event.target.value);
                  clearMessages();
                }}
                value={instagram}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium">WhatsApp</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                onChange={(event) => {
                  setWhatsapp(event.target.value);
                  clearMessages();
                }}
                value={whatsapp}
              />
            </label>
          </div>

          <label>
            <span className="mb-2 block text-sm font-medium">E-mail para ativacao do tatuador</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
              onChange={(event) => {
                setAccessEmail(event.target.value);
                clearMessages();
              }}
              placeholder="tatuador@exemplo.com"
              type="email"
              value={accessEmail}
            />
            <p className="mt-2 text-xs text-zinc-500">
              Sistema gera link de ativacao para tatuador criar proprio acesso.
            </p>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">Slug</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
              onChange={(event) => {
                setSlug(event.target.value);
                clearMessages();
              }}
              value={slug}
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">Foto</span>
            <input
              accept="image/*"
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
              onChange={(event) => {
                setPhoto(event.target.files?.[0] ?? null);
                clearMessages();
              }}
              type="file"
            />
          </label>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          {notice ? <p className="text-sm text-yellow-300">{notice}</p> : null}

          <button
            className="rounded-xl bg-[#E8650A] px-4 py-3 font-semibold disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </form>
      </section>
    </div>
  );
}
