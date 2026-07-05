import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Artist } from "@/services/artists.service";
import { upsertCommissionRule, type CommissionRule } from "@/services/financial.service";

type CommissionRuleModalProps = {
  open: boolean;
  studioId: string;
  artists: Artist[];
  rule?: CommissionRule | null;
  onClose: () => void;
  onSaved: () => void;
};

export function CommissionRuleModal({
  open,
  studioId,
  artists,
  rule,
  onClose,
  onSaved,
}: CommissionRuleModalProps) {
  const [artistId, setArtistId] = useState("");
  const [percentage, setPercentage] = useState("30");
  const [capEnabled, setCapEnabled] = useState(true);
  const [monthlyCap, setMonthlyCap] = useState("1000");
  const [startsAt, setStartsAt] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setArtistId(rule?.artist_id ?? artists[0]?.id ?? "");
    setPercentage(String(rule?.percentage ?? 30));
    setCapEnabled(rule?.cap_enabled ?? true);
    setMonthlyCap(rule?.monthly_cap ? String(rule.monthly_cap) : "1000");
    setStartsAt(rule?.starts_at?.slice(0, 10) ?? new Date().toISOString().split("T")[0]);
    setNotes(rule?.notes ?? "");
    setIsActive(rule?.is_active ?? true);
    setError("");
  }, [artists, open, rule]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!artistId) {
      setError("Selecione tatuador.");
      return;
    }

    try {
      setSaving(true);
      await upsertCommissionRule({
        id: rule?.id,
        studioId,
        artistId,
        isActive,
        percentage: Number(percentage),
        capEnabled,
        monthlyCap: capEnabled ? Number(monthlyCap || 0) : null,
        startsAt,
        notes,
      });
      onSaved();
      onClose();
    } catch {
      setError("Não foi possível salvar regra de comissão.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <section className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#1a1a1a] text-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="text-xl font-semibold">{rule ? "Editar regra de comissão" : "Nova regra de comissão"}</h2>
            <p className="mt-1 text-sm text-zinc-400">Defina percentual, teto mensal e início da regra.</p>
          </div>
          <button className="rounded-lg p-2 hover:bg-white/5" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </header>

        <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium">Tatuador</span>
              <select
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                value={artistId}
                onChange={(event) => setArtistId(event.target.value)}
              >
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium">Data de início</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                type="date"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium">Percentual (%)</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                min="0"
                step="0.01"
                type="number"
                value={percentage}
                onChange={(event) => setPercentage(event.target.value)}
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-medium">Teto mensal (R$)</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 disabled:opacity-50"
                disabled={!capEnabled}
                min="0"
                step="0.01"
                type="number"
                value={monthlyCap}
                onChange={(event) => setMonthlyCap(event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3">
              <input checked={capEnabled} onChange={(event) => setCapEnabled(event.target.checked)} type="checkbox" />
              <span className="text-sm font-medium">Usar teto mensal</span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3">
              <input checked={isActive} onChange={(event) => setIsActive(event.target.checked)} type="checkbox" />
              <span className="text-sm font-medium">Regra ativa</span>
            </label>
          </div>

          <label>
            <span className="mb-2 block text-sm font-medium">Observação</span>
            <textarea
              className="min-h-24 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button className="rounded-xl bg-[#E8650A] px-4 py-3 font-semibold disabled:opacity-60" disabled={saving} type="submit">
            {saving ? "Salvando..." : "Salvar regra"}
          </button>
        </form>
      </section>
    </div>
  );
}
