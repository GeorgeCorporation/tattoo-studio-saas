import { Plus, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUserStudio } from "@/services/dashboard.service";
import { ClientModal } from "@/pages/clients/ClientModal";
import {
  createClient,
  getClients,
  type ClientFormData,
  type ClientListItem,
} from "@/services/clients.service";

function phoneUrl(phone?: string | null) {
  const digits = phone?.replace(/\D/g, "");
  return digits ? `https://wa.me/55${digits}` : null;
}

export function ClientsPage() {
  const { user } = useAuth();
  const [studioId, setStudioId] = useState("");
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const loadClients = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError("");

      const studio = await getCurrentUserStudio(user.id);
      if (!studio) {
        setError("Estudio nao encontrado.");
        return;
      }

      setStudioId(studio.id);
      setClients(await getClients(studio.id, search));
    } catch {
      setError("Nao foi possivel carregar clientes.");
    } finally {
      setLoading(false);
    }
  }, [search, user]);

  useEffect(() => {
    const timeout = window.setTimeout(loadClients, 250);
    return () => window.clearTimeout(timeout);
  }, [loadClients]);

  async function handleCreate(data: Omit<ClientFormData, "studioId">) {
    await createClient({ ...data, studioId });
    await loadClients();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Clientes</h1>
          <p className="mt-2 text-sm text-zinc-400">Lista completa de clientes do estudio.</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8650A] px-4 py-3 font-semibold"
          onClick={() => setModalOpen(true)}
          type="button"
        >
          <Plus size={18} />
          Novo cliente
        </button>
      </div>

      <label className="relative block">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input
          className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] py-3 pl-11 pr-4 text-white outline-none focus:border-[#E8650A]"
          placeholder="Buscar por nome ou WhatsApp"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>

      {error ? <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p> : null}

      <div className="grid gap-3">
        {loading ? <p className="text-sm text-zinc-400">Carregando clientes...</p> : null}

        {!loading &&
          clients.map((client) => {
            const whatsApp = phoneUrl(client.phone);

            return (
              <Link
                className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4 transition hover:border-[#E8650A]/70"
                key={client.id}
                to={`/clientes/${client.id}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{client.name}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-zinc-400">
                      {whatsApp ? (
                        <a className="text-[#E8650A]" href={whatsApp} onClick={(event) => event.stopPropagation()}>
                          {client.phone}
                        </a>
                      ) : (
                        <span>Sem WhatsApp</span>
                      )}
                      <span>{client.instagram || "Sem Instagram"}</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-zinc-300">
                    {client.appointments_count ?? 0} agendamentos
                  </span>
                </div>
              </Link>
            );
          })}

        {!loading && !clients.length ? (
          <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-8 text-center text-zinc-400">
            Nenhum cliente encontrado.
          </div>
        ) : null}
      </div>

      <ClientModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleCreate} />
    </section>
  );
}
