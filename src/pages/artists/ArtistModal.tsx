import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { createArtist, slugify, updateArtist, uploadArtistPhoto } from "@/services/artists.service";

type ArtistModalProps = {
  open: boolean;
  studioId: string;
  onClose: () => void;
  onCreated: (artistId: string) => void;
};

const specialties = ["Fine line", "Blackwork", "Old school", "Realismo", "Anime", "Aquarela", "Minimalista"];

export function ArtistModal({ open, studioId, onClose, onCreated }: ArtistModalProps) {
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState(specialties[0]);
  const [instagram, setInstagram] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [accessEmail, setAccessEmail] = useState("");
  const [slug, setSlug] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setName("");
    setSpecialty(specialties[0]);
    setInstagram("");
    setWhatsapp("");
    setAccessEmail("");
    setSlug("");
    setPhoto(null);
    setError("");
  }, [open]);

  useEffect(() => {
    setSlug(slugify(name));
  }, [name]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nome e obrigatorio.");
      return;
    }

    try {
      setSaving(true);
      const artist = await createArtist({ studioId, name, slug, specialty, instagram, whatsapp, accessEmail });

      if (photo) {
        const photoUrl = await uploadArtistPhoto(photo, studioId, artist.id);
        await updateArtist(artist.id, { photoUrl });
      }

      onCreated(artist.id);
    } catch {
      setError("Não foi possível criar tatuador.");
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
            <p className="mt-1 text-sm text-zinc-400">Crie perfil do profissional.</p>
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
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">Especialidade</span>
            <select
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
            >
              {specialties.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium">Instagram</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                value={instagram}
                onChange={(event) => setInstagram(event.target.value)}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium">WhatsApp</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
              />
            </label>
          </div>

          <label>
            <span className="mb-2 block text-sm font-medium">E-mail de acesso do tatuador</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
              placeholder="tatuador@exemplo.com"
              type="email"
              value={accessEmail}
              onChange={(event) => setAccessEmail(event.target.value)}
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">Slug</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">Foto</span>
            <input
              accept="image/*"
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
              onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
              type="file"
            />
          </label>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

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
