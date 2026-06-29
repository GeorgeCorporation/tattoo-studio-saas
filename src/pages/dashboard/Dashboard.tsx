import { Check, X } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const statusClasses: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-300",
  confirmed: "bg-green-500/15 text-green-300",
  completed: "bg-blue-500/15 text-blue-300",
  cancelled: "bg-red-500/15 text-red-300",
};

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Pendente",
    confirmed: "Confirmado",
    completed: "Concluido",
    cancelled: "Cancelado",
  };

  return labels[status] ?? status;
}

export function Dashboard() {
  const { summary, nextAppointments, loading, error, setAppointmentStatus } = useDashboard();

  const cards = [
    { label: "Agendamentos hoje", value: summary.todayAppointments },
    { label: "Agendamentos da semana", value: summary.weekAppointments },
    { label: "Receita do mes", value: currency.format(summary.monthRevenue) },
    { label: "Total de clientes", value: summary.totalClients },
  ];

  if (loading) {
    return <p className="text-sm text-zinc-400">Carregando dashboard...</p>;
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-400">Resumo do estudio e proximos agendamentos.</p>
      </div>

      {error ? <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5" key={card.label}>
            <p className="text-sm text-zinc-400">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold">{card.value}</p>
          </article>
        ))}
      </div>

      <section className="rounded-xl border border-white/10 bg-[#1a1a1a]">
        <div className="flex flex-col gap-2 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Proximos agendamentos</h2>
            <p className="mt-1 text-sm text-zinc-400">Ultimos 5 horarios na agenda.</p>
          </div>
          <button className="rounded-xl bg-[#E8650A] px-4 py-2 text-sm font-semibold" type="button">
            Novo agendamento
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-zinc-400">
              <tr className="border-b border-white/10">
                <th className="px-5 py-3 font-medium">Hora</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Tatuador</th>
                <th className="px-5 py-3 font-medium">Servico</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {nextAppointments.map((appointment) => (
                <tr className="border-b border-white/5 last:border-0" key={appointment.id}>
                  <td className="px-5 py-4">
                    <span className="font-medium">{appointment.time.slice(0, 5)}</span>
                    <span className="ml-2 text-zinc-500">{appointment.date}</span>
                  </td>
                  <td className="px-5 py-4">{appointment.clients?.name ?? "-"}</td>
                  <td className="px-5 py-4">{appointment.tattoo_artists?.name ?? "-"}</td>
                  <td className="px-5 py-4">{appointment.services?.name ?? "-"}</td>
                  <td className="px-5 py-4">
                    <span
                      className={[
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                        statusClasses[appointment.status] ?? "bg-zinc-500/15 text-zinc-300",
                      ].join(" ")}
                    >
                      {statusLabel(appointment.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        className="inline-flex size-9 items-center justify-center rounded-lg bg-green-500/15 text-green-300"
                        onClick={() => setAppointmentStatus(appointment.id, "confirmed")}
                        type="button"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        className="inline-flex size-9 items-center justify-center rounded-lg bg-red-500/15 text-red-300"
                        onClick={() => setAppointmentStatus(appointment.id, "cancelled")}
                        type="button"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!nextAppointments.length ? (
                <tr>
                  <td className="px-5 py-8 text-center text-zinc-500" colSpan={6}>
                    Nenhum agendamento encontrado.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
