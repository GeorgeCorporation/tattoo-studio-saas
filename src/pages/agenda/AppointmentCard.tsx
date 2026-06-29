import { ChevronDown, ChevronUp, Check, CircleCheck, Phone, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { AgendaAppointment, AgendaAppointmentStatus } from "@/services/agenda.service";

type AppointmentCardProps = {
  appointment: AgendaAppointment;
  onStatusChange: (id: string, status: AgendaAppointmentStatus) => void;
};

const statusStyles: Record<AgendaAppointmentStatus, string> = {
  pending: "bg-yellow-500/15 text-yellow-300",
  confirmed: "bg-green-500/15 text-green-300",
  cancelled: "bg-red-500/15 text-red-300",
  completed: "bg-zinc-500/15 text-zinc-300",
};

const statusLabels: Record<AgendaAppointmentStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Finalizado",
};

function referenceLinks(notes?: string | null) {
  if (!notes?.includes("Referencias:")) return [];

  return notes
    .replace("Referencias:", "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AppointmentCard({ appointment, onStatusChange }: AppointmentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const photos = useMemo(() => referenceLinks(appointment.notes), [appointment.notes]);
  const phone = appointment.clients?.phone?.replace(/\D/g, "");
  const phoneUrl = phone ? `https://wa.me/55${phone}` : null;

  return (
    <article className="rounded-xl border border-white/10 bg-[#1a1a1a] p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xl font-semibold">{appointment.time.slice(0, 5)}</p>
            <span
              className={[
                "rounded-full px-2.5 py-1 text-xs font-semibold",
                statusStyles[appointment.status] ?? statusStyles.pending,
              ].join(" ")}
            >
              {statusLabels[appointment.status] ?? appointment.status}
            </span>
          </div>

          <p className="mt-3 font-semibold">{appointment.clients?.name ?? "Cliente sem nome"}</p>
          {phoneUrl ? (
            <a className="mt-1 inline-flex items-center gap-2 text-sm text-[#E8650A]" href={phoneUrl}>
              <Phone size={14} />
              {appointment.clients?.phone}
            </a>
          ) : null}

          <div className="mt-3 grid gap-1 text-sm text-zinc-400 sm:grid-cols-2">
            <p>Tatuador: {appointment.tattoo_artists?.name ?? "-"}</p>
            <p>Servico: {appointment.services?.name ?? "-"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-green-500/15 px-3 py-2 text-sm font-medium text-green-300"
            onClick={() => onStatusChange(appointment.id, "confirmed")}
            type="button"
          >
            <Check size={16} />
            Confirmar
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-red-500/15 px-3 py-2 text-sm font-medium text-red-300"
            onClick={() => onStatusChange(appointment.id, "cancelled")}
            type="button"
          >
            <X size={16} />
            Cancelar
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-500/15 px-3 py-2 text-sm font-medium text-zinc-300"
            onClick={() => onStatusChange(appointment.id, "completed")}
            type="button"
          >
            <CircleCheck size={16} />
            Finalizar
          </button>
        </div>
      </div>

      <button
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-300"
        onClick={() => setExpanded((value) => !value)}
        type="button"
      >
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        Descricao e referencias
      </button>

      {expanded ? (
        <div className="mt-4 rounded-xl bg-[#0f0f0f] p-4">
          <p className="text-sm leading-6 text-zinc-300">
            {appointment.description || "Sem descricao informada."}
          </p>

          {photos.length ? (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                <a href={photo} key={photo} rel="noreferrer" target="_blank">
                  <img className="aspect-square rounded-lg object-cover" src={photo} alt="" />
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-zinc-500">Sem fotos de referencia.</p>
          )}
        </div>
      ) : null}
    </article>
  );
}
