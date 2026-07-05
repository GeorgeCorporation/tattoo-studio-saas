import { Edit, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccess } from "@/hooks/useAccess";
import { useAuth } from "@/hooks/useAuth";
import { paymentMethodLabels, paymentTypeLabels } from "@/lib/appointment-domain";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { CommissionRuleModal } from "@/pages/financial/CommissionRuleModal";
import { PaymentModal } from "@/pages/financial/PaymentModal";
import { getArtists, type Artist } from "@/services/artists.service";
import { getCurrentUserStudio } from "@/services/dashboard.service";
import {
  getArtistCommissionSummaries,
  getClientSourceLabel,
  getCommissionRules,
  getMonthSummary,
  getPaymentsByMonth,
  type CommissionRule,
  type FinancialPayment,
} from "@/services/financial.service";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function FinancialPage() {
  const { user } = useAuth();
  const { access } = useAccess();
  const isManager = access?.role === "manager";
  const now = new Date();
  const [studioId, setStudioId] = useState("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [year] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [payments, setPayments] = useState<FinancialPayment[]>([]);
  const [artistSummaries, setArtistSummaries] = useState<Awaited<ReturnType<typeof getArtistCommissionSummaries>>>([]);
  const [summary, setSummary] = useState({
    monthRevenue: 0,
    signalTotal: 0,
    finalTotal: 0,
    cancelledCount: 0,
    totalCommission: 0,
    cappedCommissionCount: 0,
    studioNetRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<CommissionRule | null>(null);
  const [error, setError] = useState("");

  const loadFinancial = useCallback(async () => {
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

      const [foundPayments, foundSummary, foundArtistSummaries, foundRules, foundArtists] = await Promise.all([
        getPaymentsByMonth(studio.id, year, month),
        getMonthSummary(studio.id, year, month),
        getArtistCommissionSummaries(studio.id, year, month),
        isManager ? getCommissionRules(studio.id) : Promise.resolve([]),
        isManager ? getArtists(studio.id) : Promise.resolve([]),
      ]);

      setPayments(foundPayments);
      setSummary(foundSummary);
      setArtistSummaries(foundArtistSummaries);
      setRules(foundRules);
      setArtists(foundArtists);
    } catch (caughtError) {
      logger.error("Falha ao carregar financeiro", caughtError, { year, month });
      setError(getFriendlyErrorMessage(caughtError, "Não foi possível carregar o financeiro."));
    } finally {
      setLoading(false);
    }
  }, [isManager, month, user, year]);

  useEffect(() => {
    loadFinancial();
  }, [loadFinancial]);

  const periodTotal = useMemo(
    () => payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0),
    [payments],
  );

  const ownArtistSummary = useMemo(
    () => artistSummaries.find((item) => item.artist_id === access?.artistId) ?? null,
    [access?.artistId, artistSummaries],
  );

  const cards = isManager
    ? [
        { label: "Receita do mês", value: currency.format(summary.monthRevenue) },
        { label: "Sinais recebidos", value: currency.format(summary.signalTotal) },
        { label: "Comissões do mês", value: currency.format(summary.totalCommission) },
        { label: "Líquido do estúdio", value: currency.format(summary.studioNetRevenue) },
      ]
    : [
        { label: "Receita do mês", value: currency.format(ownArtistSummary?.monthlyRevenue ?? 0) },
        { label: "Comissão do mês", value: currency.format(ownArtistSummary?.totalCommission ?? 0) },
        { label: "Clientes próprios", value: currency.format(ownArtistSummary?.ownClientCommission ?? 0) },
        { label: "Indicação do estúdio", value: currency.format(ownArtistSummary?.studioReferralCommission ?? 0) },
      ];

  function openCreateRule() {
    setSelectedRule(null);
    setRuleModalOpen(true);
  }

  function openEditRule(rule: CommissionRule) {
    setSelectedRule(rule);
    setRuleModalOpen(true);
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{isManager ? "Financeiro" : "Meus ganhos"}</h1>
          <p className="mt-2 text-sm text-zinc-400">
            {isManager
              ? "Acompanhe entradas, repasses e resultado líquido do estúdio."
              : "Veja seus pagamentos, sua comissão e o avanço do teto mensal."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isManager ? (
            <>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 font-semibold"
                onClick={openCreateRule}
                type="button"
              >
                <Edit size={18} />
                Regras de comissão
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8650A] px-4 py-3 font-semibold"
                onClick={() => setPaymentModalOpen(true)}
                type="button"
              >
                <Plus size={18} />
                Registrar pagamento
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5" key={card.label}>
            <p className="text-sm text-zinc-400">{card.label}</p>
            <p className="mt-3 text-2xl font-semibold">{card.value}</p>
          </article>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-[#1a1a1a] p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="text-sm font-medium">
          Mês
          <select
            className="mt-2 block w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 sm:w-56"
            onChange={(event) => setMonth(Number(event.target.value))}
            value={month}
          >
            {monthNames.map((name, index) => (
              <option key={name} value={index + 1}>
                {name} {year}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-zinc-400">
          Total do período: <span className="font-semibold text-white">{currency.format(periodTotal)}</span>
        </p>
      </div>

      {ownArtistSummary && !isManager ? (
        <section className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
          <h2 className="text-xl font-semibold">Teto mensal</h2>
          <p className="mt-2 text-sm text-zinc-400">
            {ownArtistSummary.capValue
              ? `${currency.format(ownArtistSummary.capConsumed)} de ${currency.format(ownArtistSummary.capValue)} consumidos.`
              : "Sem teto configurado para sua regra atual."}
          </p>
          {ownArtistSummary.capReached ? (
            <span className="mt-4 inline-flex rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-semibold text-yellow-300">
              Teto atingido neste mês
            </span>
          ) : null}
        </section>
      ) : null}

      {isManager ? (
        <section className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Comissões por tatuador</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Percentual, teto e repasse calculado com base nos pagamentos recebidos.
              </p>
            </div>
            <button className="rounded-xl bg-[#E8650A] px-4 py-3 text-sm font-semibold" onClick={openCreateRule} type="button">
              Nova regra
            </button>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {artistSummaries.map((artistSummary) => (
              <article className="rounded-xl border border-white/10 bg-[#0f0f0f] p-4" key={artistSummary.artist_id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{artistSummary.artist_name}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      Faturado: {currency.format(artistSummary.monthlyRevenue)}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-300">
                    Comissão: {currency.format(artistSummary.totalCommission)}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
                  <p>Clientes próprios: {currency.format(artistSummary.ownClientCommission)}</p>
                  <p>Indicação do estúdio: {currency.format(artistSummary.studioReferralCommission)}</p>
                  <p>Teto: {artistSummary.capValue ? currency.format(artistSummary.capValue) : "Sem teto"}</p>
                  <p>Consumido: {currency.format(artistSummary.capConsumed)}</p>
                </div>

                {artistSummary.capReached ? (
                  <p className="mt-3 text-xs font-semibold text-yellow-300">Teto mensal atingido.</p>
                ) : null}
              </article>
            ))}

            {!artistSummaries.length ? (
              <div className="rounded-xl border border-white/10 bg-[#0f0f0f] p-5 text-sm text-zinc-500">
                Nenhuma comissão calculada neste mês.
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {isManager && rules.length ? (
        <section className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5">
          <h2 className="text-xl font-semibold">Regras cadastradas</h2>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {rules.map((rule) => (
              <article className="rounded-xl border border-white/10 bg-[#0f0f0f] p-4" key={rule.id}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{rule.tattoo_artists?.name ?? "Tatuador"}</p>
                    <p className="mt-1 text-sm text-zinc-500">Início: {rule.starts_at.slice(0, 10)}</p>
                  </div>
                  <button className="rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold" onClick={() => openEditRule(rule)} type="button">
                    Editar
                  </button>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
                  <p>Percentual: {rule.percentage}%</p>
                  <p>Teto: {rule.cap_enabled ? currency.format(rule.monthly_cap ?? 0) : "Sem teto"}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {error ? <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p> : null}
      {loading ? <p className="text-sm text-zinc-400">Carregando financeiro...</p> : null}

      <section className="rounded-xl border border-white/10 bg-[#1a1a1a]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="text-zinc-400">
              <tr className="border-b border-white/10">
                <th className="px-5 py-3 font-medium">Data</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Tatuador</th>
                <th className="px-5 py-3 font-medium">Origem</th>
                <th className="px-5 py-3 font-medium">Serviço</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">Valor</th>
                <th className="px-5 py-3 font-medium">Método</th>
                <th className="px-5 py-3 font-medium">Comissão</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const commission = payment.payment_commissions?.[0];

                return (
                  <tr className="border-b border-white/5 last:border-0" key={payment.id}>
                    <td className="px-5 py-4">{payment.paid_at?.slice(0, 10) ?? payment.created_at.slice(0, 10)}</td>
                    <td className="px-5 py-4">{payment.appointments?.clients?.name ?? "-"}</td>
                    <td className="px-5 py-4">{payment.appointments?.tattoo_artists?.name ?? "-"}</td>
                    <td className="px-5 py-4">{getClientSourceLabel(payment.appointments?.client_source)}</td>
                    <td className="px-5 py-4">{payment.appointments?.services?.name ?? "-"}</td>
                    <td className="px-5 py-4">{payment.type ? paymentTypeLabels[payment.type] : "-"}</td>
                    <td className="px-5 py-4 font-semibold">{currency.format(Number(payment.amount ?? 0))}</td>
                    <td className="px-5 py-4">{payment.method ? paymentMethodLabels[payment.method] : "-"}</td>
                    <td className="px-5 py-4">
                      {commission ? (
                        <div className="space-y-1">
                          <p className="font-semibold">{currency.format(Number(commission.commission_amount ?? 0))}</p>
                          <p className="text-xs text-zinc-500">
                            {commission.percentage}% {commission.cap_applied ? "com teto" : ""}
                          </p>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })}

              {!loading && !payments.length ? (
                <tr>
                  <td className="px-5 py-8 text-center text-zinc-500" colSpan={9}>
                    Nenhum pagamento registrado neste período.
                  </td>
                </tr>
              ) : null}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10">
                <td className="px-5 py-4 font-semibold" colSpan={6}>
                  Total do período
                </td>
                <td className="px-5 py-4 font-semibold">{currency.format(periodTotal)}</td>
                <td />
                <td className="px-5 py-4 font-semibold">{currency.format(summary.totalCommission)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <PaymentModal onClose={() => setPaymentModalOpen(false)} onCreated={loadFinancial} open={paymentModalOpen} studioId={studioId} />

      <CommissionRuleModal
        artists={artists}
        onClose={() => setRuleModalOpen(false)}
        onSaved={loadFinancial}
        open={ruleModalOpen}
        rule={selectedRule}
        studioId={studioId}
      />
    </section>
  );
}
