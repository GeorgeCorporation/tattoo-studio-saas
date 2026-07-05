import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  createAppointment,
  getAgendaArtists,
  getAgendaClients,
  getAgendaServices,
  type AgendaOption,
} from "@/services/agenda.service";

type NewAppointmentModalProps = {
  open: boolean;
  studioId: string;
  defaultDate: string;
  onClose: () => void;
  onCreated: () => void;
};

const times = Array.from({ length: 11 }, (_, index) => `${String(index + 9).padStart(2, "0")}:00`);

export function NewAppointmentModal({
  open,
  studioId,
  defaultDate,
  onClose,
  onCreated,
}: NewAppointmentModalProps) {
  const [clients, setClients] = useState<AgendaOption[]>([]);
  const [artists, setArtists] = useState<AgendaOption[]>([]);
  const [services, setServices] = useState<AgendaOption[]>([]);
  const [clientId, setClientId] = useState("");
  const [artistId, setArtistId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("09:00");
  const [clientSource, setClientSource] = useState<"artist_client" | "studio_referral">("artist_client");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    async function loadOptions() {
      const [foundClients, foundArtists, foundServices] = await Promise.all([
        getAgendaClients(studioId),
        getAgendaArtists(studioId),
        getAgendaServices(studioId),
      ]);

      setClients(foundClients);
      setArtists(foundArtists);
      setServices(foundServices);
      setClientId(foundClients[0]?.id ?? "");
      setArtistId(foundArtists[0]?.id ?? "");
      setServiceId(foundServices[0]?.id ?? "");
      setDate(defaultDate);
      setClientSource("artist_client");
    }

    loadOptions();
  }, [defaultDate, open, studioId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!clientId || !artistId || !serviceId || !date || !time || !description) {
      setError("Preencha todos os campos.");
      return;
    }

    try {
      setSaving(true);
      await createAppointment({
        studioId,
        clientId,
        artistId,
        serviceId,
        date,
        time,
        description,
        clientSource,
      });
      onCreated();
      onClose();
    } catch {
      setError("Não foi possível criar agendamento.");
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
            <h2 className="text-xl font-semibold">Novo agendamento</h2>
            <p className="mt-1 text-sm text-zinc-400">Crie um horário manualmente.</p>
          </div>
          <button className="rounded-lg p-2 hover:bg-white/5" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </header>

        <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium">Cliente</span>
              <select
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>

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
          </div>

          <label>
            <span className="mb-2 block text-sm font-medium">Serviço</span>
            <select
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium">Origem do cliente</span>
              <select
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                value={clientSource}
                onChange={(event) => setClientSource(event.target.value as "artist_client" | "studio_referral")}
              >
                <option value="artist_client">Cliente do tatuador</option>
                <option value="studio_referral">Indicação do estúdio</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium">Data</span>
              <input
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium">Horário</span>
              <select
                className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
                value={time}
                onChange={(event) => setTime(event.target.value)}
              >
                {times.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span className="mb-2 block text-sm font-medium">Descrição</span>
            <textarea
              className="min-h-28 w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            className="rounded-xl bg-[#E8650A] px-4 py-3 font-semibold disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            {saving ? "Salvando..." : "Criar agendamento"}
          </button>
        </form>
      </section>
    </div>
  );
}
