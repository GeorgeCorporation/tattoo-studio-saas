import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { ServiceTemplatePicker } from "@/components/services/ServiceTemplatePicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { validateServiceInput } from "@/lib/service-domain";
import type { ServiceTemplate } from "@/lib/service-templates";
import type { ServiceFormData, StudioService } from "@/services/services.service";

type ServiceModalProps = {
  open: boolean;
  service?: StudioService | null;
  studioId: string;
  onClose: () => void;
  onSave: (data: ServiceFormData) => Promise<void>;
};

export function ServiceModal({ open, service, studioId, onClose, onSave }: ServiceModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [avgDurationMinutes, setAvgDurationMinutes] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateFieldsCustomized, setTemplateFieldsCustomized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setName(service?.name ?? "");
    setDescription(service?.description ?? "");
    setStartingPrice(service?.starting_price?.toString() ?? "");
    setAvgDurationMinutes(service?.avg_duration_minutes?.toString() ?? "");
    setSelectedTemplateId(null);
    setTemplateFieldsCustomized(false);
    setError("");
  }, [open, service]);

  function handleTemplateSelect(template: ServiceTemplate | null) {
    setSelectedTemplateId(template?.id ?? null);
    setName(template?.name ?? "");
    setDescription(template?.description ?? "");
    setAvgDurationMinutes(template ? String(template.durationMinutes) : "");
    setTemplateFieldsCustomized(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const input = {
      name,
      description,
      startingPrice: startingPrice === "" ? null : Number(startingPrice),
      durationMinutes: Number(avgDurationMinutes),
    };
    const validationError = validateServiceInput(input);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      await onSave({
        studioId,
        ...input,
      });
      onClose();
    } catch {
      setError("Não foi possível salvar serviço.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <section className="max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-xl border border-white/10 bg-[#1a1a1a] text-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="text-xl font-semibold">{service ? "Editar serviço" : "Adicionar serviço"}</h2>
            <p className="mt-1 text-sm text-zinc-400">Dados do serviço oferecido.</p>
          </div>
          <button className="rounded-lg p-2 hover:bg-white/5" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </header>

        <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
          {!service ? (
            <ServiceTemplatePicker
              hasCustomizedFields={templateFieldsCustomized}
              onSelect={handleTemplateSelect}
              selectedTemplateId={selectedTemplateId}
            />
          ) : null}

          <Input
            label="Nome"
            required
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setTemplateFieldsCustomized(true);
            }}
          />

          <Textarea
            label="Descrição"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setTemplateFieldsCustomized(true);
            }}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Preco inicial"
              min="0"
              prefix="R$"
              step="0.01"
              type="number"
              value={startingPrice}
              onChange={(event) => setStartingPrice(event.target.value)}
            />

            <Input
              label="Duracao media em minutos"
              min="30"
              step="1"
              type="number"
              value={avgDurationMinutes}
              onChange={(event) => {
                setAvgDurationMinutes(event.target.value);
                setTemplateFieldsCustomized(true);
              }}
            />
          </div>

          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          <Button disabled={saving} type="submit">
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </section>
    </div>
  );
}
