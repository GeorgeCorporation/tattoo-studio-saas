import { Edit, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { getCurrentUserStudio } from "@/services/dashboard.service";
import {
  createService,
  getServices,
  toggleServiceStatus,
  updateService,
  type ServiceFormData,
  type StudioService,
} from "@/services/services.service";
import { ServiceModal } from "@/pages/services/ServiceModal";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const categoryStyles: Record<string, string> = {
  "Fine Line": "bg-pink-500/15 text-pink-300",
  "Black Work": "bg-zinc-500/20 text-zinc-200",
  Realismo: "bg-blue-500/15 text-blue-300",
  "Old School": "bg-red-500/15 text-red-300",
  "New School": "bg-purple-500/15 text-purple-300",
  Colorido: "bg-green-500/15 text-green-300",
  Fechamento: "bg-orange-500/15 text-orange-300",
  Piercing: "bg-cyan-500/15 text-cyan-300",
  Outro: "bg-white/10 text-zinc-300",
};

export function ServicesPage() {
  const { user } = useAuth();
  const [studioId, setStudioId] = useState("");
  const [services, setServices] = useState<StudioService[]>([]);
  const [selectedService, setSelectedService] = useState<StudioService | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadServices = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      const studio = await getCurrentUserStudio(user.id);
      if (!studio) {
        setError("Estúdio não encontrado.");
        return;
      }

      setStudioId(studio.id);
      setServices(await getServices(studio.id));
    } catch (caughtError) {
      logger.error("Falha ao carregar serviços", caughtError);
      setError(getFriendlyErrorMessage(caughtError, "Não foi possível carregar serviços."));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  function openCreateModal() {
    setSelectedService(null);
    setModalOpen(true);
  }

  function openEditModal(service: StudioService) {
    setSelectedService(service);
    setModalOpen(true);
  }

  async function handleSave(data: ServiceFormData) {
    try {
      if (selectedService) {
        await updateService(selectedService.id, data);
      } else {
        await createService(data);
      }

      await loadServices();
    } catch (caughtError) {
      logger.error("Falha ao salvar serviço", caughtError, { serviceId: selectedService?.id });
      setError(getFriendlyErrorMessage(caughtError, "Não foi possível salvar o serviço."));
      throw caughtError;
    }
  }

  async function handleToggle(service: StudioService) {
    try {
      await toggleServiceStatus(service.id, !service.is_active);
      await loadServices();
    } catch (caughtError) {
      logger.error("Falha ao alternar status do serviço", caughtError, { serviceId: service.id });
      setError(getFriendlyErrorMessage(caughtError, "Não foi possível atualizar o serviço."));
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Serviços</h1>
          <p className="mt-2 text-sm text-zinc-400">Catálogo de serviços do estúdio.</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8650A] px-4 py-3 font-semibold"
          onClick={openCreateModal}
          type="button"
        >
          <Plus size={18} />
          Adicionar serviço
        </button>
      </div>

      {error ? <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p> : null}
      {loading ? <p className="text-sm text-zinc-400">Carregando serviços...</p> : null}

      <div className="grid gap-3">
        {!loading &&
          services.map((service) => (
            <article className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4" key={service.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{service.name}</h2>
                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        categoryStyles[service.category ?? "Outro"] ?? categoryStyles.Outro,
                      ].join(" ")}
                    >
                      {service.category ?? "Outro"}
                    </span>
                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-xs font-semibold",
                        service.is_active ? "bg-green-500/15 text-green-300" : "bg-zinc-500/15 text-zinc-300",
                      ].join(" ")}
                    >
                      {service.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                    {service.description || "Sem descrição."}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-300">
                    <span>
                      Inicial: {service.starting_price ? currency.format(Number(service.starting_price)) : "-"}
                    </span>
                    <span>Duração: {service.avg_duration_minutes ?? "-"} min</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold"
                    onClick={() => openEditModal(service)}
                    type="button"
                  >
                    <Edit size={16} />
                    Editar
                  </button>
                  <button
                    className="rounded-xl bg-[#E8650A] px-4 py-3 text-sm font-semibold"
                    onClick={() => handleToggle(service)}
                    type="button"
                  >
                    {service.is_active ? "Desativar" : "Ativar"}
                  </button>
                </div>
              </div>
            </article>
          ))}

        {!loading && !services.length ? (
          <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-8 text-center text-zinc-400">
            Nenhum serviço cadastrado.
          </div>
        ) : null}
      </div>

      <ServiceModal
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        open={modalOpen}
        service={selectedService}
        studioId={studioId}
      />
    </section>
  );
}
