import { CalendarPlus, Check, Copy, ExternalLink, Image, Palette, Scissors, Settings, X } from "lucide-react";
import { Link } from "react-router-dom";
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
  const { studio, summary, nextAppointments, setupStatus, loading, error, setAppointmentStatus } = useDashboard();

  const cards = [
    { label: "Agendamentos hoje", value: summary.todayAppointments },
    { label: "Agendamentos da semana", value: summary.weekAppointments },
    { label: "Receita do mes", value: currency.format(summary.monthRevenue) },
    { label: "Total de clientes", value: summary.totalClients },
  ];

  const setupItems = [
    {
      label: "Cadastrar primeiro tatuador",
      done: Boolean(setupStatus && setupStatus.artistsCount > 0),
      href: "/tatuadores",
      icon: Scissors,
      action: "Abrir tatuadores",
    },
    {
      label: "Cadastrar primeiro servico",
      done: Boolean(setupStatus && setupStatus.servicesCount > 0),
      href: "/servicos",
      icon: Palette,
      action: "Abrir servicos",
    },
    {
      label: "Adicionar logo do estudio",
      done: Boolean(setupStatus?.hasLogo),
      href: "/configuracoes",
      icon: Settings,
      action: "Editar logo",
    },
    {
      label: "Adicionar fotos na galeria",
      done: Boolean(setupStatus && setupStatus.galleryCount > 0),
      href: "/galeria",
      icon: Image,
      action: "Abrir galeria",
    },
    {
      label: "Copiar link publico do estudio",
      done: Boolean(studio?.slug),
      href: studio?.slug ? `/${studio.slug}` : "/configuracoes",
      icon: ExternalLink,
      action: "Ver pagina",
    },
    {
      label: "Fazer primeiro agendamento",
      done: Boolean(setupStatus && setupStatus.appointmentsCount > 0),
      href: "/agenda",
      icon: CalendarPlus,
      action: "Abrir agenda",
    },
  ];

  const completedSetupItems = setupItems.filter((item) => item.done).length;
  const publicLink = studio?.slug ? `${window.location.origin}/${studio.slug}` : "";

  async function copyPublicLink() {
    if (!publicLink) return;
    await navigator.clipboard.writeText(publicLink);
  }

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

      <section className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Primeiros passos</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {completedSetupItems} de {setupItems.length} concluidos para deixar seu estudio pronto.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-zinc-200 disabled:opacity-50"
              disabled={!publicLink}
              onClick={copyPublicLink}
              type="button"
            >
              <Copy size={16} />
              Copiar link publico
            </button>
            {studio?.slug ? (
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8650A] px-4 py-3 text-sm font-semibold"
                to={`/${studio.slug}`}
              >
                <ExternalLink size={16} />
                Ver pagina publica
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#E8650A] transition-all"
            style={{ width: `${Math.round((completedSetupItems / setupItems.length) * 100)}%` }}
          />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {setupItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#0f0f0f] p-4 transition hover:border-[#E8650A]/60"
                key={item.label}
                to={item.href}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={[
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      item.done ? "bg-green-500/15 text-green-300" : "bg-[#E8650A]/15 text-[#E8650A]",
                    ].join(" ")}
                  >
                    {item.done ? <Check size={18} /> : <Icon size={18} />}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.label}</p>
                    <p className="mt-1 text-xs text-zinc-500">{item.done ? "Concluido" : item.action}</p>
                  </div>
                </div>
                <ExternalLink className="shrink-0 text-zinc-600" size={16} />
              </Link>
            );
          })}
        </div>
      </section>

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
