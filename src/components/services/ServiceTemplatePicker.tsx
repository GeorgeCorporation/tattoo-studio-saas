import { SERVICE_TEMPLATES, type ServiceTemplate } from "@/lib/service-templates";

type ServiceTemplatePickerProps = {
  onSelect: (template: ServiceTemplate | null) => void;
  hasCustomizedFields: boolean;
  selectedTemplateId?: string | null;
  templates?: readonly ServiceTemplate[];
  confirmReplace?: () => boolean;
};

function confirmTemplateReplacement() {
  return window.confirm("Os dados personalizados de nome, duração e descrição serão substituídos. Deseja continuar?");
}

export function ServiceTemplatePicker({
  onSelect,
  hasCustomizedFields,
  selectedTemplateId = null,
  templates = SERVICE_TEMPLATES,
  confirmReplace = confirmTemplateReplacement,
}: ServiceTemplatePickerProps) {
  function selectTemplate(template: ServiceTemplate | null) {
    if (hasCustomizedFields && !confirmReplace()) return;
    onSelect(template);
  }

  return (
    <section aria-labelledby="service-template-picker-title" className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-white" id="service-template-picker-title">
          Como deseja começar?
        </h3>
        <p className="mt-1 text-xs text-zinc-400">Escolha uma sugestão ou preencha o serviço do zero.</p>
      </div>

      <div className="grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        <button
          aria-pressed={selectedTemplateId === null}
          className={[
            "rounded-xl border p-3 text-left transition",
            selectedTemplateId === null
              ? "border-[#E8650A] bg-[#E8650A]/10"
              : "border-white/10 bg-[#0f0f0f] hover:border-white/25",
          ].join(" ")}
          onClick={() => selectTemplate(null)}
          type="button"
        >
          <span className="block text-sm font-semibold">Começar do zero</span>
          <span className="mt-1 block text-xs text-zinc-400">Preencha os dados manualmente.</span>
        </button>

        {templates.map((template) => {
          const selected = selectedTemplateId === template.id;

          return (
            <button
              aria-pressed={selected}
              className={[
                "rounded-xl border p-3 text-left transition",
                selected ? "border-[#E8650A] bg-[#E8650A]/10" : "border-white/10 bg-[#0f0f0f] hover:border-white/25",
              ].join(" ")}
              key={template.id}
              onClick={() => selectTemplate(template)}
              type="button"
            >
              <span className="block text-sm font-semibold">{template.name}</span>
              <span className="mt-1 block text-xs text-zinc-400">Duração sugerida: {template.durationMinutes} min</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
