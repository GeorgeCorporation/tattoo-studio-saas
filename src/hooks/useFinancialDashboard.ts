import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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

type FinancialSection = "payments" | "summary" | "commissions" | "manager";

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
  const scopeKey = `${studioId}:${year}:${month}:${isManager ? "manager" : "artist"}`;
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
  const activeScope = useRef(scopeKey);
  const refreshRequest = useRef(0);
  const sectionRequests = useRef<Record<FinancialSection, number>>({
    payments: 0,
    summary: 0,
    commissions: 0,
    manager: 0,
  });

  useLayoutEffect(() => {
    activeScope.current = scopeKey;
    refreshRequest.current += 1;
    sectionRequests.current.payments += 1;
    sectionRequests.current.summary += 1;
    sectionRequests.current.commissions += 1;
    sectionRequests.current.manager += 1;
    paymentsSnapshot.current = undefined;
    rulesSnapshot.current = undefined;
    cancelledCountSnapshot.current = undefined;

    return () => {
      if (activeScope.current === scopeKey) activeScope.current = "";
      refreshRequest.current += 1;
      sectionRequests.current.payments += 1;
      sectionRequests.current.summary += 1;
      sectionRequests.current.commissions += 1;
      sectionRequests.current.manager += 1;
    };
  }, [scopeKey]);

  const beginSectionRequest = useCallback(
    (section: FinancialSection) => {
      const request = ++sectionRequests.current[section];
      return { request, scope: scopeKey };
    },
    [scopeKey],
  );

  const isCurrentSectionRequest = useCallback(
    (section: FinancialSection, guard: { request: number; scope: string }) =>
      activeScope.current === guard.scope && sectionRequests.current[section] === guard.request,
    [],
  );

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
      const guard = beginSectionRequest("payments");
      setPayments((current) => ({ ...current, loading: true, error: "" }));
      try {
        const data = await (source ?? getPaymentsByMonth(studioId, year, month));
        if (!isCurrentSectionRequest("payments", guard)) return data;
        paymentsSnapshot.current = data;
        setPayments({ data, loading: false, error: "" });
        return data;
      } catch (error) {
        if (!isCurrentSectionRequest("payments", guard)) throw error;
        logSectionError("payments", error);
        setPayments((current) => ({
          ...current,
          loading: false,
          error: getFriendlyErrorMessage(error, "Não foi possível carregar o histórico de pagamentos."),
        }));
        throw error;
      }
    },
    [beginSectionRequest, isCurrentSectionRequest, logSectionError, month, studioId, year],
  );

  const loadSummarySection = useCallback(
    async (sources?: { payments?: Promise<FinancialPayment[]>; cancelledCount?: Promise<number> }) => {
      const guard = beginSectionRequest("summary");
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
        if (!isCurrentSectionRequest("summary", guard)) {
          return buildMonthSummary(foundPayments, cancelledCount, year, month);
        }
        cancelledCountSnapshot.current = cancelledCount;
        const data = buildMonthSummary(foundPayments, cancelledCount, year, month);
        setSummary({ data, loading: false, error: "" });
        return data;
      } catch (error) {
        if (!isCurrentSectionRequest("summary", guard)) throw error;
        logSectionError("summary", error);
        setSummary((current) => ({
          ...current,
          loading: false,
          error: getFriendlyErrorMessage(error, "Não foi possível carregar o resumo financeiro."),
        }));
        throw error;
      }
    },
    [beginSectionRequest, isCurrentSectionRequest, logSectionError, month, studioId, year],
  );

  const loadCommissionsSection = useCallback(
    async (sources?: { payments?: Promise<FinancialPayment[]>; rules?: Promise<CommissionRule[]> }) => {
      const guard = beginSectionRequest("commissions");
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
        if (!isCurrentSectionRequest("commissions", guard)) {
          return buildArtistCommissionSummaries(foundPayments, rules, year, month);
        }
        if (!isManager) rulesSnapshot.current = rules;
        const data = buildArtistCommissionSummaries(foundPayments, rules, year, month);
        setCommissions({ data, loading: false, error: "" });
        return data;
      } catch (error) {
        if (!isCurrentSectionRequest("commissions", guard)) throw error;
        logSectionError("commissions", error);
        setCommissions((current) => ({
          ...current,
          loading: false,
          error: getFriendlyErrorMessage(error, "Não foi possível carregar as comissões por artista."),
        }));
        throw error;
      }
    },
    [beginSectionRequest, isCurrentSectionRequest, isManager, logSectionError, month, studioId, year],
  );

  const loadManagerSection = useCallback(
    async (sources?: { rules?: Promise<CommissionRule[]>; artists?: Promise<Artist[]> }) => {
      const guard = beginSectionRequest("manager");
      if (!isManager) {
        const data = { rules: [], artists: [] };
        if (isCurrentSectionRequest("manager", guard)) {
          setManager({ data, loading: false, error: "" });
        }
        return data;
      }

      setManager((current) => ({ ...current, loading: true, error: "" }));
      try {
        const [rules, artists] = await Promise.all([
          sources?.rules ?? getCommissionRules(studioId),
          sources?.artists ?? getArtists(studioId),
        ]);
        if (!isCurrentSectionRequest("manager", guard)) return { rules, artists };
        rulesSnapshot.current = rules;
        const data = { rules, artists };
        setManager({ data, loading: false, error: "" });
        return data;
      } catch (error) {
        if (!isCurrentSectionRequest("manager", guard)) throw error;
        logSectionError("manager", error);
        setManager((current) => ({
          ...current,
          loading: false,
          error: getFriendlyErrorMessage(error, "Não foi possível carregar regras e artistas."),
        }));
        throw error;
      }
    },
    [beginSectionRequest, isCurrentSectionRequest, isManager, logSectionError, studioId],
  );

  const refresh = useCallback(async () => {
    if (!studioId) return;
    const refreshGuard = ++refreshRequest.current;
    const refreshScope = scopeKey;

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

    if (activeScope.current !== refreshScope || refreshRequest.current !== refreshGuard) return;
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
    scopeKey,
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
