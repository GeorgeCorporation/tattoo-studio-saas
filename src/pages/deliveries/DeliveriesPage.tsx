import { Copy, Download, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { copyTextToClipboard } from "@/lib/clipboard";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUserStudio } from "@/services/dashboard.service";
import {
  getDeliveries,
  getDeliveryClients,
  type ClientDelivery,
  type DeliveryClient,
} from "@/services/deliveries.service";
import { DeliveryModal } from "@/pages/deliveries/DeliveryModal";

export function DeliveriesPage() {
  const { user } = useAuth();
  const [studioId, setStudioId] = useState("");
  const [clients, setClients] = useState<DeliveryClient[]>([]);
  const [deliveries, setDeliveries] = useState<ClientDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");

  const loadDeliveries = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      const studio = await getCurrentUserStudio(user.id, user.email);
      if (!studio) {
        setError("Estúdio não encontrado.");
        return;
      }

      setStudioId(studio.id);
      const [foundClients, foundDeliveries] = await Promise.all([
        getDeliveryClients(studio.id),
        getDeliveries(studio.id),
      ]);
      setClients(foundClients);
      setDeliveries(foundDeliveries);
    } catch {
      setError("Não foi possível carregar entregas.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDeliveries();
  }, [loadDeliveries]);

  const origin = useMemo(() => window.location.origin, []);

  async function copyLink(token: string) {
    const copied = await copyTextToClipboard(`${origin}/entrega/${token}`);
    setCopyFeedback(copied ? "Link copiado." : "Nao consegui copiar. Copie manualmente.");
  }

  useEffect(() => {
    if (!copyFeedback) return;
    const timer = window.setTimeout(() => setCopyFeedback(""), 3000);
    return () => window.clearTimeout(timer);
  }, [copyFeedback]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Entregas de fotos</h1>
          <p className="mt-2 text-sm text-zinc-400">Suba fotos finais e envie link para cliente baixar.</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8650A] px-4 py-3 font-semibold disabled:opacity-50"
          disabled={!clients.length}
          onClick={() => setModalOpen(true)}
          type="button"
        >
          <Plus size={18} />
          Nova entrega
        </button>
      </div>

      {error ? <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p> : null}
      {copyFeedback ? <p className="rounded-xl bg-white/5 p-4 text-sm text-zinc-300">{copyFeedback}</p> : null}
      {loading ? <p className="text-sm text-zinc-400">Carregando entregas...</p> : null}

      {!loading && !clients.length ? (
        <p className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5 text-sm text-zinc-400">
          Cadastre um cliente antes de criar entrega.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {deliveries.map((delivery) => {
          const link = `${origin}/entrega/${delivery.token}`;

          return (
            <article className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5" key={delivery.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{delivery.title}</h2>
                  <p className="mt-1 text-sm text-zinc-400">{delivery.clients?.name ?? "Cliente"}</p>
                  <p className="mt-2 break-all text-xs text-zinc-500">{link}</p>
                </div>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold"
                  onClick={() => copyLink(delivery.token)}
                  type="button"
                >
                  <Copy size={16} />
                  Copiar link
                </button>
              </div>

              {delivery.message ? <p className="mt-4 text-sm text-zinc-300">{delivery.message}</p> : null}

              {delivery.client_delivery_photos.length ? (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {delivery.client_delivery_photos.slice(0, 10).map((photo) => (
                    <a className="group relative aspect-square overflow-hidden rounded-xl bg-black" href={photo.url} key={photo.id}>
                      <img alt={photo.file_name ?? ""} className="h-full w-full object-cover" src={photo.url} />
                      <span className="absolute inset-0 hidden items-center justify-center bg-black/50 text-white group-hover:flex">
                        <Download size={18} />
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-zinc-500">Sem fotos.</p>
              )}
            </article>
          );
        })}
      </div>

      {!loading && clients.length > 0 && !deliveries.length ? (
        <p className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5 text-sm text-zinc-400">
          Nenhuma entrega criada ainda.
        </p>
      ) : null}

      <DeliveryModal
        clients={clients}
        onClose={() => setModalOpen(false)}
        onCreated={loadDeliveries}
        open={modalOpen}
        studioId={studioId}
      />
    </section>
  );
}
