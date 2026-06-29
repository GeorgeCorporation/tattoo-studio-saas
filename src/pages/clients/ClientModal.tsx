import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import type { ClientListItem } from "@/services/clients.service";

type ClientModalProps = {
  open: boolean;
  client?: ClientListItem | null;
  onClose: () => void;
  onSave: (data: {
    name: string;
    phone?: string;
    instagram?: string;
    email?: string;
    notes?: string;
  }) => Promise<void>;
};

export function ClientModal({ open, client, onClose, onSave }: ClientModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setName(client?.name ?? "");
    setPhone(client?.phone ?? "");
    setInstagram(client?.instagram ?? "");
    setEmail(client?.email ?? "");
    setNotes(client?.notes ?? "");
    setError("");
  }, [client, open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nome e obrigatorio.");
      return;
    }

    try {
      setSaving(true);
      await onSave({ name, phone, instagram, email, notes });
      onClose();
    } catch {
      setError("Nao foi possivel salvar cliente.");
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
            <h2 className="text-xl font-semibold">{client ? "Editar cliente" : "Novo cliente"}</h2>
            <p className="mt-1 text-sm text-zinc-400">Dados principais do cliente.</p>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium">WhatsApp</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium">Instagram</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                value={instagram}
                onChange={(event) => setInstagram(event.target.value)}
              />
            </label>
          </div>

          <label>
            <span className="mb-2 block text-sm font-medium">Email</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">Observacoes</span>
            <textarea
              className="min-h-28 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
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
