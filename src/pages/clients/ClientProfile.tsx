import { ArrowLeft, CalendarPlus, Edit, Phone } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ClientModal } from "@/pages/clients/ClientModal";
import {
  getClientAppointments,
  getClientById,
  updateClient,
  type ClientAppointment,
  type ClientListItem,
} from "@/services/clients.service";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function phoneUrl(phone?: string | null) {
  const digits = phone?.replace(/\D/g, "");
  return digits ? `https://wa.me/55${digits}` : null;
}

function referencesFromNotes(notes?: string | null) {
  if (!notes?.includes("Referencias:")) return [];
  return notes
    .replace("Referencias:", "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ClientProfile() {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const [client, setClient] = useState<ClientListItem | null>(null);
  const [appointments, setAppointments] = useState<ClientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    if (!clientId) return;

    try {
      setLoading(true);
      setError("");
      const [foundClient, foundAppointments] = await Promise.all([
        getClientById(clientId),
        getClientAppointments(clientId),
      ]);

      setClient(foundClient);
      setAppointments(foundAppointments);
    } catch {
      setError("Nao foi possivel carregar cliente.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const allReferences = useMemo(
    () => appointments.flatMap((appointment) => referencesFromNotes(appointment.notes)),
    [appointments],
  );

  async function handleUpdate(data: {
    name: string;
    phone?: string;
    instagram?: string;
    email?: string;
    notes?: string;
  }) {
    if (!client) return;
    await updateClient(client.id, data);
    await loadProfile();
  }

  if (loading) return <p className="text-sm text-zinc-400">Carregando cliente...</p>;

  if (!client) {
    return (
      <section className="rounded-xl border border-white/10 bg-[#1a1a1a] p-8 text-center">
        <p className="text-lg font-semibold">Cliente nao encontrado.</p>
        <button className="mt-4 rounded-xl bg-[#E8650A] px-4 py-3 font-semibold" onClick={() => navigate("/clientes")}>
          Voltar
        </button>
      </section>
    );
  }

  const whatsApp = phoneUrl(client.phone);

  return (
    <section className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm font-medium text-[#E8650A]" to="/clientes">
        <ArrowLeft size={16} />
        Voltar para clientes
      </Link>

      {error ? <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p> : null}

      <header className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">{client.name}</h1>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-zinc-300">
              {whatsApp ? (
                <a className="inline-flex items-center gap-2 text-[#E8650A]" href={whatsApp}>
                  <Phone size={15} />
                  {client.phone}
                </a>
              ) : null}
              <span>{client.instagram || "Sem Instagram"}</span>
              <span>{client.email || "Sem email"}</span>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400">
              {client.notes || "Sem observacoes."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold"
              onClick={() => setModalOpen(true)}
              type="button"
            >
              <Edit size={16} />
              Editar cliente
            </button>
            <Link
              className="inline-flex items-center gap-2 rounded-xl bg-[#E8650A] px-4 py-3 text-sm font-semibold"
              to="/agenda"
            >
              <CalendarPlus size={16} />
              Novo agendamento
            </Link>
          </div>
        </div>
      </header>

      <section className="rounded-xl border border-white/10 bg-[#1a1a1a]">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-xl font-semibold">Historico de agendamentos</h2>
        </div>
        <div className="divide-y divide-white/10">
          {appointments.map((appointment) => (
            <article className="p-5" key={appointment.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">
                    {appointment.date} as {appointment.time.slice(0, 5)}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {appointment.services?.name ?? "Servico"} com {appointment.tattoo_artists?.name ?? "Tatuador"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="rounded-full bg-white/5 px-3 py-1 text-zinc-300">{appointment.status}</span>
                  <span className="rounded-full bg-[#E8650A]/15 px-3 py-1 text-[#ff9a4f]">
                    {currency.format(Number(appointment.total_price ?? 0))}
                  </span>
                </div>
              </div>
              {appointment.description ? (
                <p className="mt-3 text-sm leading-6 text-zinc-400">{appointment.description}</p>
              ) : null}
            </article>
          ))}

          {!appointments.length ? <p className="p-5 text-sm text-zinc-500">Sem agendamentos.</p> : null}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
        <h2 className="text-xl font-semibold">Fotos de referencia</h2>
        {allReferences.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {allReferences.map((photo) => (
              <a href={photo} key={photo} rel="noreferrer" target="_blank">
                <img className="aspect-square rounded-xl object-cover" src={photo} alt="" />
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">Sem fotos de referencia.</p>
        )}
      </section>

      <ClientModal client={client} open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleUpdate} />
    </section>
  );
}
