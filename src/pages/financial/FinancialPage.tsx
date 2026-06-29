import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUserStudio } from "@/services/dashboard.service";
import {
  getMonthSummary,
  getPaymentsByMonth,
  type FinancialPayment,
} from "@/services/financial.service";
import { PaymentModal } from "@/pages/financial/PaymentModal";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Marco",
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

const methodLabels: Record<string, string> = {
  pix: "PIX",
  cash: "Dinheiro",
  card: "Cartao",
};

const typeLabels: Record<string, string> = {
  signal: "Sinal",
  final: "Final",
};

export function FinancialPage() {
  const { user } = useAuth();
  const now = new Date();
  const [studioId, setStudioId] = useState("");
  const [year] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [payments, setPayments] = useState<FinancialPayment[]>([]);
  const [summary, setSummary] = useState({
    monthRevenue: 0,
    signalTotal: 0,
    finalTotal: 0,
    cancelledCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");

  const loadFinancial = useCallback(async () => {
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
      const [foundPayments, foundSummary] = await Promise.all([
        getPaymentsByMonth(studio.id, year, month),
        getMonthSummary(studio.id, year, month),
      ]);

      setPayments(foundPayments);
      setSummary(foundSummary);
    } catch {
      setError("Nao foi possivel carregar financeiro.");
    } finally {
      setLoading(false);
    }
  }, [month, user, year]);

  useEffect(() => {
    loadFinancial();
  }, [loadFinancial]);

  const periodTotal = useMemo(
    () => payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0),
    [payments],
  );

  const cards = [
    { label: "Receita do mes atual", value: currency.format(summary.monthRevenue) },
    { label: "Sinais recebidos", value: currency.format(summary.signalTotal) },
    { label: "Pagamentos finais", value: currency.format(summary.finalTotal) },
    { label: "Cancelados no mes", value: summary.cancelledCount },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Financeiro</h1>
          <p className="mt-2 text-sm text-zinc-400">Recebimentos, sinais e pagamentos finais.</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E8650A] px-4 py-3 font-semibold"
          onClick={() => setModalOpen(true)}
          type="button"
        >
          <Plus size={18} />
          Registrar pagamento
        </button>
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
          Mes
          <select
            className="mt-2 block w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 sm:w-56"
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
          >
            {monthNames.map((name, index) => (
              <option key={name} value={index + 1}>
                {name} {year}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-zinc-400">
          Total periodo: <span className="font-semibold text-white">{currency.format(periodTotal)}</span>
        </p>
      </div>

      {error ? <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-300">{error}</p> : null}
      {loading ? <p className="text-sm text-zinc-400">Carregando financeiro...</p> : null}

      <section className="rounded-xl border border-white/10 bg-[#1a1a1a]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-zinc-400">
              <tr className="border-b border-white/10">
                <th className="px-5 py-3 font-medium">Data</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Tatuador</th>
                <th className="px-5 py-3 font-medium">Servico</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">Valor</th>
                <th className="px-5 py-3 font-medium">Metodo</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr className="border-b border-white/5 last:border-0" key={payment.id}>
                  <td className="px-5 py-4">{payment.paid_at?.slice(0, 10) ?? payment.created_at.slice(0, 10)}</td>
                  <td className="px-5 py-4">{payment.appointments?.clients?.name ?? "-"}</td>
                  <td className="px-5 py-4">{payment.appointments?.tattoo_artists?.name ?? "-"}</td>
                  <td className="px-5 py-4">{payment.appointments?.services?.name ?? "-"}</td>
                  <td className="px-5 py-4">{typeLabels[payment.type ?? ""] ?? "-"}</td>
                  <td className="px-5 py-4 font-semibold">{currency.format(Number(payment.amount ?? 0))}</td>
                  <td className="px-5 py-4">{methodLabels[payment.method ?? ""] ?? "-"}</td>
                </tr>
              ))}
              {!loading && !payments.length ? (
                <tr>
                  <td className="px-5 py-8 text-center text-zinc-500" colSpan={7}>
                    Nenhum pagamento neste periodo.
                  </td>
                </tr>
              ) : null}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10">
                <td className="px-5 py-4 font-semibold" colSpan={5}>
                  Total do periodo
                </td>
                <td className="px-5 py-4 font-semibold">{currency.format(periodTotal)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <PaymentModal
        onClose={() => setModalOpen(false)}
        onCreated={loadFinancial}
        open={modalOpen}
        studioId={studioId}
      />
    </section>
  );
}
