import { CalendarPlus, Check, Copy, ExternalLink, Image, Palette, Scissors, Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { copyTextToClipboard } from "@/lib/clipboard";
import { useDashboard } from "@/hooks/useDashboard";
import { getAppointmentStatusClass, getAppointmentStatusLabel } from "@/lib/appointment-domain";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function Dashboard() {
  const { studio, summary, nextAppointments, setupStatus, loading, error, setAppointmentStatus } = useDashboard();
  const [copyFeedback, setCopyFeedback] = useState("");

  const cards = [
    { label: "Agendamentos de hoje", value: summary.todayAppointments },
    { label: "Agendamentos da semana", value: summary.weekAppointments },
    { label: "Receita do mês", value: currency.format(summary.monthRevenue) },
    { label: "Clientes cadastrados", value: summary.totalClients },
  ];

  const setupItems = [
    {
      label: "Cadastrar primeiro tatuador",
      done: Boolean(setupStatus && setupStatus.artistsCount > 0),
      href: "/tatuadores",
      icon: Scissors,
      action: "Abrir módulo de tatuadores",
    },
    {
      label: "Cadastrar primeiro serviço",
      done: Boolean(setupStatus && setupStatus.servicesCount > 0),
      href: "/servicos",
      icon: Palette,
      action: "Abrir catálogo de serviços",
    },
    {
      label: "Adicionar logo do estúdio",
      done: Boolean(setupStatus?.hasLogo),
      href: "/configuracoes",
      icon: Settings,
      action: "Personalizar identidade visual",
    },
    {
      label: "Publicar fotos na galeria",
      done: Boolean(setupStatus && setupStatus.galleryCount > 0),
      href: "/galeria",
      icon: Image,
      action: "Enviar primeiras imagens",
    },
    {
      label: "Validar link público do estúdio",
      done: Boolean(studio?.slug),
      href: studio?.slug ? `/${studio.slug}` : "/configuracoes",
      icon: ExternalLink,
      action: "Abrir página pública",
    },
    {
      label: "Registrar primeiro agendamento",
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
    const copied = await copyTextToClipboard(publicLink);
    setCopyFeedback(copied ? "Link copiado." : "Nao consegui copiar. Copie manualmente.");
  }

  useEffect(() => {
    if (!copyFeedback) return;
    const timer = window.setTimeout(() => setCopyFeedback(""), 3000);
    return () => window.clearTimeout(timer);
  }, [copyFeedback]);

  if (loading) {
    return <p className="text-sm text-zinc-400">Carregando visão geral do estúdio...</p>;
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Visão geral</h1>
        <p className="mt-2 text-sm text-zinc-400">Acompanhe operação, faturamento e próximos atendimentos em um só lugar.</p>
      </div>

      {error ? <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p> : null}

      <section className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Checklist de ativação</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {completedSetupItems} de {setupItems.length} concluídos para deixar seu estúdio pronto para divulgar e vender.
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
              Copiar link público
            </button>
            {studio?.slug ? (
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8650A] px-4 py-3 text-sm font-semibold"
                to={`/${studio.slug}`}
              >
                <ExternalLink size={16} />
                Abrir página pública
              </Link>
            ) : null}
          </div>
        </div>
        {copyFeedback ? <p className="mt-3 text-sm text-zinc-400">{copyFeedback}</p> : null}

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
                    <p className="mt-1 text-xs text-zinc-500">{item.done ? "Concluído" : item.action}</p>
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
            <h2 className="text-xl font-semibold">Próximos atendimentos</h2>
            <p className="mt-1 text-sm text-zinc-400">Os 5 compromissos mais próximos para você agir rápido.</p>
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
                <th className="px-5 py-3 font-medium">Serviço</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Ações</th>
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
                        getAppointmentStatusClass(appointment.status),
                      ].join(" ")}
                    >
                      {getAppointmentStatusLabel(appointment.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        className="inline-flex size-9 items-center justify-center rounded-lg bg-green-500/15 text-green-300"
                        onClick={() => setAppointmentStatus(appointment.id, "confirmed")}
                        title="Confirmar agendamento"
                        type="button"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        className="inline-flex size-9 items-center justify-center rounded-lg bg-red-500/15 text-red-300"
                        onClick={() => setAppointmentStatus(appointment.id, "cancelled")}
                        title="Cancelar agendamento"
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
                    Nenhum agendamento próximo encontrado.
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
