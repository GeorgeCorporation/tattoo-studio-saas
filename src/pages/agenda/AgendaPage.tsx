import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUserStudio } from "@/services/dashboard.service";
import {
  getAppointmentsByDate,
  updateAppointmentStatus,
  type AgendaAppointment,
  type AgendaAppointmentStatus,
} from "@/services/agenda.service";
import { AppointmentCard } from "@/pages/agenda/AppointmentCard";
import { NewAppointmentModal } from "@/pages/agenda/NewAppointmentModal";

function toDateInput(date: Date) {
  return date.toISOString().split("T")[0];
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);
}

export function AgendaPage() {
  const { user } = useAuth();
  const [studioId, setStudioId] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<AgendaAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const selectedDateInput = useMemo(() => toDateInput(selectedDate), [selectedDate]);
  const formattedDate = useMemo(() => formatLongDate(selectedDate), [selectedDate]);

  const loadAppointments = useCallback(async () => {
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
      setAppointments(await getAppointmentsByDate(studio.id, selectedDateInput));
    } catch {
      setError("Nao foi possivel carregar agenda.");
    } finally {
      setLoading(false);
    }
  }, [selectedDateInput, user]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  function changeDay(days: number) {
    setSelectedDate((current) => {
      const next = new Date(current);
      next.setDate(current.getDate() + days);
      return next;
    });
  }

  async function handleStatusChange(id: string, status: AgendaAppointmentStatus) {
    await updateAppointmentStatus(id, status);
    await loadAppointments();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Agenda</h1>
          <p className="mt-2 text-sm capitalize text-zinc-400">{formattedDate}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-medium"
            onClick={() => changeDay(-1)}
            type="button"
          >
            <ChevronLeft size={18} />
            Anterior
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-medium"
            onClick={() => changeDay(1)}
            type="button"
          >
            Proximo
            <ChevronRight size={18} />
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-[#E8650A] px-3 py-2 text-sm font-semibold"
            onClick={() => setModalOpen(true)}
            type="button"
          >
            <Plus size={18} />
            Novo
          </button>
        </div>
      </div>

      <input
        className="w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-4 py-3 sm:max-w-xs"
        type="date"
        value={selectedDateInput}
        onChange={(event) => setSelectedDate(new Date(`${event.target.value}T12:00:00`))}
      />

      {error ? <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p> : null}

      <div className="space-y-4">
        {loading ? <p className="text-sm text-zinc-400">Carregando agenda...</p> : null}

        {!loading &&
          appointments.map((appointment) => (
            <AppointmentCard
              appointment={appointment}
              key={appointment.id}
              onStatusChange={handleStatusChange}
            />
          ))}

        {!loading && !appointments.length ? (
          <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-8 text-center text-zinc-400">
            Nenhum agendamento neste dia.
          </div>
        ) : null}
      </div>

      {studioId ? (
        <NewAppointmentModal
          defaultDate={selectedDateInput}
          onClose={() => setModalOpen(false)}
          onCreated={loadAppointments}
          open={modalOpen}
          studioId={studioId}
        />
      ) : null}
    </section>
  );
}
