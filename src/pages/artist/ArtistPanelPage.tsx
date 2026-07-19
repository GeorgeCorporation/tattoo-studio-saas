import { useEffect, useState } from "react";
import { useDashboardAccess } from "@/hooks/useDashboardAccess";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { getArtistNextAppointments } from "@/services/artists.service";
import { getClients } from "@/services/clients.service";
import { getArtistCommissionSummaries, getMonthSummary } from "@/services/financial.service";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type PanelState = {
  nextAppointmentsCount: number;
  clientsCount: number;
  monthRevenue: number;
  totalCommission: number;
  ownClientCommission: number;
  studioReferralCommission: number;
  capValue: number | null;
  capConsumed: number;
  capReached: boolean;
};

export function ArtistPanelPage() {
  const access = useDashboardAccess();
  const [state, setState] = useState<PanelState>({
    nextAppointmentsCount: 0,
    clientsCount: 0,
    monthRevenue: 0,
    totalCommission: 0,
    ownClientCommission: 0,
    studioReferralCommission: 0,
    capValue: null,
    capConsumed: 0,
    capReached: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPanel() {
      if (!access?.studioId || !access.artistId) return;

      try {
        setLoading(true);
        setError("");

        const now = new Date();
        const [appointments, clients, monthSummary, commissionRows] = await Promise.all([
          getArtistNextAppointments(access.artistId, 5),
          getClients(access.studioId),
          getMonthSummary(access.studioId, now.getFullYear(), now.getMonth() + 1),
          getArtistCommissionSummaries(access.studioId, now.getFullYear(), now.getMonth() + 1),
        ]);

        const ownSummary = commissionRows.find((item) => item.artist_id === access.artistId);

        setState({
          nextAppointmentsCount: appointments.length,
          clientsCount: clients.length,
          monthRevenue: ownSummary?.monthlyRevenue ?? 0,
          totalCommission: ownSummary?.totalCommission ?? 0,
          ownClientCommission: ownSummary?.ownClientCommission ?? 0,
          studioReferralCommission: ownSummary?.studioReferralCommission ?? 0,
          capValue: ownSummary?.capValue ?? null,
          capConsumed: ownSummary?.capConsumed ?? 0,
          capReached: ownSummary?.capReached ?? false,
        });

        if (!ownSummary && monthSummary.monthRevenue === 0) {
          setState((current) => ({ ...current, monthRevenue: 0 }));
        }
      } catch (caughtError) {
        setError(getFriendlyErrorMessage(caughtError, "Não foi possível carregar seu painel."));
      } finally {
        setLoading(false);
      }
    }

    loadPanel();
  }, [access]);

  if (loading) return <p className="text-sm text-zinc-400">Carregando painel...</p>;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Meu painel</h1>
        <p className="mt-2 text-sm text-zinc-400">Acompanhe sua agenda, seus clientes e sua comissão do mês.</p>
      </div>

      {error ? <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
          <p className="text-sm text-zinc-400">Próximos atendimentos</p>
          <p className="mt-3 text-3xl font-semibold">{state.nextAppointmentsCount}</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
          <p className="text-sm text-zinc-400">Clientes vinculados</p>
          <p className="mt-3 text-3xl font-semibold">{state.clientsCount}</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
          <p className="text-sm text-zinc-400">Faturamento do mês</p>
          <p className="mt-3 text-3xl font-semibold">{currency.format(state.monthRevenue)}</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
          <p className="text-sm text-zinc-400">Comissão do mês</p>
          <p className="mt-3 text-3xl font-semibold">{currency.format(state.totalCommission)}</p>
        </article>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
          <p className="text-sm text-zinc-400">Clientes próprios</p>
          <p className="mt-3 text-2xl font-semibold">{currency.format(state.ownClientCommission)}</p>
          <p className="mt-2 text-xs text-zinc-500">Comissão sujeita ao teto mensal.</p>
        </article>

        <article className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
          <p className="text-sm text-zinc-400">Indicação do estúdio</p>
          <p className="mt-3 text-2xl font-semibold">{currency.format(state.studioReferralCommission)}</p>
          <p className="mt-2 text-xs text-zinc-500">Continua contando mesmo após teto.</p>
        </article>

        <article className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
          <p className="text-sm text-zinc-400">Teto do mês</p>
          <p className="mt-3 text-2xl font-semibold">
            {state.capValue ? currency.format(state.capConsumed) : "Sem teto"}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            {state.capValue
              ? `${currency.format(state.capConsumed)} de ${currency.format(state.capValue)}`
              : "Gestor não configurou limite mensal."}
          </p>
          {state.capReached ? (
            <span className="mt-3 inline-flex rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-semibold text-yellow-300">
              Teto atingido
            </span>
          ) : null}
        </article>
      </section>
    </section>
  );
}
