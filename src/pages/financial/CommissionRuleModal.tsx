import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { Artist } from "@/services/artists.service";
import { upsertCommissionRule, type CommissionRule } from "@/services/financial.service";

type CommissionRuleModalProps = {
  open: boolean;
  studioId: string;
  artists: Artist[];
  rule?: CommissionRule | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

export function CommissionRuleModal({ open, studioId, artists, rule, onClose, onSaved }: CommissionRuleModalProps) {
  const [artistId, setArtistId] = useState("");
  const [percentage, setPercentage] = useState("30");
  const [capEnabled, setCapEnabled] = useState(true);
  const [monthlyCap, setMonthlyCap] = useState("1000");
  const [startsAt, setStartsAt] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
    setSaved(false);
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
      setSaved(true);

      try {
        await onSaved();
        onClose();
      } catch {
        setError("A regra foi salva, mas não foi possível atualizar o financeiro. Feche e tente atualizar novamente.");
      }
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
            <p className="mt-1 text-sm text-zinc-400">
              Defina percentual, teto mensal e início da regra. O teto limita quanto o tatuador paga de comissão no
              mês; indicações do estúdio continuam pagando mesmo após o teto.
            </p>
          </div>
          <button className="rounded-lg p-2 hover:bg-white/5" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </header>

        <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Tatuador" value={artistId} onChange={(event) => setArtistId(event.target.value)}>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </Select>

            <Input
              label="Data de início"
              type="date"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Percentual (%)"
              min="0"
              step="0.01"
              type="number"
              value={percentage}
              onChange={(event) => setPercentage(event.target.value)}
            />

            <Input
              disabled={!capEnabled}
              label="Teto mensal de comissão (R$)"
              min="0"
              prefix="R$"
              step="0.01"
              type="number"
              value={monthlyCap}
              onChange={(event) => setMonthlyCap(event.target.value)}
            />
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

          <Textarea
            label="Observação"
            textareaClassName="min-h-24"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />

          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          <Button disabled={saving || saved} type="submit">
            {saving ? "Salvando..." : saved ? "Regra salva" : "Salvar regra"}
          </Button>
        </form>
      </section>
    </div>
  );
}
