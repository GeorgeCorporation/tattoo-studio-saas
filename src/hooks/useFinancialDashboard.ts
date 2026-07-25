import { useCallback, useEffect, useRef, useState } from "react";
import { getArtists, type Artist } from "@/services/artists.service";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { buildArtistCommissionSummaries, buildMonthSummary, type MonthSummary } from "@/lib/finance-domain";
import { logger } from "@/lib/logger";
import {
  getCancelledAppointmentsCount,
  getCommissionRules,
  getPaymentsByMonth,
  type ArtistCommissionSummary,
  type CommissionRule,
  type FinancialPayment,
} from "@/services/financial.service";

export type FinancialSectionState<T> = {
  data: T;
  loading: boolean;
  error: string;
};

type FinancialManagerData = {
  rules: CommissionRule[];
  artists: Artist[];
};

type UseFinancialDashboardOptions = {
  studioId: string;
  year: number;
  month: number;
  isManager: boolean;
};

const emptySummary: MonthSummary = {
  monthRevenue: 0,
  signalTotal: 0,
  finalTotal: 0,
  cancelledCount: 0,
  totalCommission: 0,
  cappedCommissionCount: 0,
  studioNetRevenue: 0,
};

function technicalErrorContext(error: unknown) {
  if (!error || typeof error !== "object") return {};
  const record = error as Record<string, unknown>;
  return {
    ...(typeof record.code === "string" || typeof record.code === "number" ? { code: record.code } : {}),
    ...(typeof record.status === "string" || typeof record.status === "number" ? { status: record.status } : {}),
  };
}

export function useFinancialDashboard({ studioId, year, month, isManager }: UseFinancialDashboardOptions) {
  const [payments, setPayments] = useState<FinancialSectionState<FinancialPayment[]>>({
    data: [],
    loading: true,
    error: "",
  });
  const [summary, setSummary] = useState<FinancialSectionState<MonthSummary>>({
    data: emptySummary,
    loading: true,
    error: "",
  });
  const [commissions, setCommissions] = useState<FinancialSectionState<ArtistCommissionSummary[]>>({
    data: [],
    loading: true,
    error: "",
  });
  const [manager, setManager] = useState<FinancialSectionState<FinancialManagerData>>({
    data: { rules: [], artists: [] },
    loading: isManager,
    error: "",
  });

  const paymentsSnapshot = useRef<FinancialPayment[]>();
  const rulesSnapshot = useRef<CommissionRule[]>();
  const cancelledCountSnapshot = useRef<number>();

  const logSectionError = useCallback(
    (section: "payments" | "summary" | "commissions" | "manager", error: unknown) => {
      logger.error("Falha ao carregar seção financeira", undefined, {
        section,
        ...technicalErrorContext(error),
        year,
        month,
        studioId,
      });
    },
    [month, studioId, year],
  );

  const loadPaymentsSection = useCallback(
    async (source?: Promise<FinancialPayment[]>) => {
      setPayments((current) => ({ ...current, loading: true, error: "" }));
      try {
        const data = await (source ?? getPaymentsByMonth(studioId, year, month));
        paymentsSnapshot.current = data;
        setPayments({ data, loading: false, error: "" });
        return data;
      } catch (error) {
        logSectionError("payments", error);
        setPayments((current) => ({
          ...current,
          loading: false,
          error: getFriendlyErrorMessage(error, "Não foi possível carregar o histórico de pagamentos."),
        }));
        throw error;
      }
    },
    [logSectionError, month, studioId, year],
  );

  const loadSummarySection = useCallback(
    async (sources?: { payments?: Promise<FinancialPayment[]>; cancelledCount?: Promise<number> }) => {
      setSummary((current) => ({ ...current, loading: true, error: "" }));
      try {
        const paymentSource =
          sources?.payments ??
          (paymentsSnapshot.current
            ? Promise.resolve(paymentsSnapshot.current)
            : getPaymentsByMonth(studioId, year, month));
        const cancelledSource =
          sources?.cancelledCount ??
          (cancelledCountSnapshot.current !== undefined
            ? Promise.resolve(cancelledCountSnapshot.current)
            : getCancelledAppointmentsCount(studioId, year, month));
        const [foundPayments, cancelledCount] = await Promise.all([paymentSource, cancelledSource]);
        paymentsSnapshot.current = foundPayments;
        cancelledCountSnapshot.current = cancelledCount;
        const data = buildMonthSummary(foundPayments, cancelledCount, year, month);
        setSummary({ data, loading: false, error: "" });
        return data;
      } catch (error) {
        logSectionError("summary", error);
        setSummary((current) => ({
          ...current,
          loading: false,
          error: getFriendlyErrorMessage(error, "Não foi possível carregar o resumo financeiro."),
        }));
        throw error;
      }
    },
    [logSectionError, month, studioId, year],
  );

  const loadCommissionsSection = useCallback(
    async (sources?: { payments?: Promise<FinancialPayment[]>; rules?: Promise<CommissionRule[]> }) => {
      setCommissions((current) => ({ ...current, loading: true, error: "" }));
      try {
        const paymentSource =
          sources?.payments ??
          (paymentsSnapshot.current
            ? Promise.resolve(paymentsSnapshot.current)
            : getPaymentsByMonth(studioId, year, month));
        const ruleSource =
          sources?.rules ??
          (rulesSnapshot.current ? Promise.resolve(rulesSnapshot.current) : getCommissionRules(studioId));
        const [foundPayments, rules] = await Promise.all([paymentSource, ruleSource]);
        paymentsSnapshot.current = foundPayments;
        rulesSnapshot.current = rules;
        const data = buildArtistCommissionSummaries(foundPayments, rules, year, month);
        setCommissions({ data, loading: false, error: "" });
        return data;
      } catch (error) {
        logSectionError("commissions", error);
        setCommissions((current) => ({
          ...current,
          loading: false,
          error: getFriendlyErrorMessage(error, "Não foi possível carregar as comissões por artista."),
        }));
        throw error;
      }
    },
    [logSectionError, month, studioId, year],
  );

  const loadManagerSection = useCallback(
    async (sources?: { rules?: Promise<CommissionRule[]>; artists?: Promise<Artist[]> }) => {
      if (!isManager) {
        const data = { rules: [], artists: [] };
        setManager({ data, loading: false, error: "" });
        return data;
      }

      setManager((current) => ({ ...current, loading: true, error: "" }));
      try {
        const [rules, artists] = await Promise.all([
          sources?.rules ?? getCommissionRules(studioId),
          sources?.artists ?? getArtists(studioId),
        ]);
        rulesSnapshot.current = rules;
        const data = { rules, artists };
        setManager({ data, loading: false, error: "" });
        return data;
      } catch (error) {
        logSectionError("manager", error);
        setManager((current) => ({
          ...current,
          loading: false,
          error: getFriendlyErrorMessage(error, "Não foi possível carregar regras e artistas."),
        }));
        throw error;
      }
    },
    [isManager, logSectionError, studioId],
  );

  const refresh = useCallback(async () => {
    if (!studioId) return;

    paymentsSnapshot.current = undefined;
    rulesSnapshot.current = undefined;
    cancelledCountSnapshot.current = undefined;

    const paymentsPromise = getPaymentsByMonth(studioId, year, month);
    const cancelledPromise = getCancelledAppointmentsCount(studioId, year, month);
    const rulesPromise = getCommissionRules(studioId);
    const artistsPromise = isManager ? getArtists(studioId) : Promise.resolve([]);

    const results = await Promise.allSettled([
      loadPaymentsSection(paymentsPromise),
      loadSummarySection({
        payments: paymentsPromise,
        cancelledCount: cancelledPromise,
      }),
      loadCommissionsSection({
        payments: paymentsPromise,
        rules: rulesPromise,
      }),
      loadManagerSection({
        rules: rulesPromise,
        artists: artistsPromise,
      }),
    ]);

    if (results.some((result) => result.status === "rejected")) {
      throw new Error("Uma ou mais seções financeiras não puderam ser atualizadas.");
    }
  }, [
    isManager,
    loadCommissionsSection,
    loadManagerSection,
    loadPaymentsSection,
    loadSummarySection,
    month,
    studioId,
    year,
  ]);

  useEffect(() => {
    void refresh().catch(() => undefined);
  }, [refresh]);

  return {
    payments,
    summary,
    commissions,
    manager,
    retryPayments: loadPaymentsSection,
    retrySummary: loadSummarySection,
    retryCommissions: loadCommissionsSection,
    retryManager: loadManagerSection,
    refresh,
  };
}
