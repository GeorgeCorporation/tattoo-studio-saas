import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import type { ServiceFormData, StudioService } from "@/services/services.service";

type ServiceModalProps = {
  open: boolean;
  service?: StudioService | null;
  studioId: string;
  onClose: () => void;
  onSave: (data: ServiceFormData) => Promise<void>;
};

export const serviceCategories = [
  "Fine Line",
  "Black Work",
  "Realismo",
  "Old School",
  "New School",
  "Colorido",
  "Fechamento",
  "Piercing",
  "Outro",
];

export function ServiceModal({ open, service, studioId, onClose, onSave }: ServiceModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(serviceCategories[0]);
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [avgDurationMinutes, setAvgDurationMinutes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setName(service?.name ?? "");
    setCategory(service?.category ?? serviceCategories[0]);
    setDescription(service?.description ?? "");
    setStartingPrice(service?.starting_price?.toString() ?? "");
    setAvgDurationMinutes(service?.avg_duration_minutes?.toString() ?? "");
    setError("");
  }, [open, service]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nome e obrigatorio.");
      return;
    }

    try {
      setSaving(true);
      await onSave({
        studioId,
        name,
        category,
        description,
        startingPrice: startingPrice ? Number(startingPrice) : undefined,
        avgDurationMinutes: avgDurationMinutes ? Number(avgDurationMinutes) : undefined,
      });
      onClose();
    } catch {
      setError("Nao foi possivel salvar servico.");
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
            <h2 className="text-xl font-semibold">{service ? "Editar servico" : "Adicionar servico"}</h2>
            <p className="mt-1 text-sm text-zinc-400">Dados do servico oferecido.</p>
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
            <span className="mb-2 block text-sm font-medium">Categoria</span>
            <select
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {serviceCategories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium">Descricao</span>
            <textarea
              className="min-h-28 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium">Preco inicial</span>
              <div className="flex rounded-xl border border-white/10 bg-[#0f0f0f]">
                <span className="border-r border-white/10 px-4 py-3 text-zinc-400">R$</span>
                <input
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none"
                  min="0"
                  step="0.01"
                  type="number"
                  value={startingPrice}
                  onChange={(event) => setStartingPrice(event.target.value)}
                />
              </div>
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium">Duracao media em minutos</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                min="0"
                type="number"
                value={avgDurationMinutes}
                onChange={(event) => setAvgDurationMinutes(event.target.value)}
              />
            </label>
          </div>

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
