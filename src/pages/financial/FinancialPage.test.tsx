import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FinancialPage, runFinancialRetry } from "@/pages/financial/FinancialPage";

const mocks = vi.hoisted(() => ({
  retrySummary: vi.fn(),
}));

vi.mock("@/hooks/useDashboardAccess", () => ({
  useDashboardAccess: () => ({
    studioId: "studio-1",
    role: "manager",
    artistId: null,
  }),
}));

vi.mock("@/hooks/useFinancialDashboard", () => ({
  useFinancialDashboard: () => ({
    payments: { data: [], loading: false, error: "" },
    summary: {
      data: {
        monthRevenue: 0,
        signalTotal: 0,
        finalTotal: 0,
        cancelledCount: 0,
        totalCommission: 0,
        cappedCommissionCount: 0,
        studioNetRevenue: 0,
      },
      loading: false,
      error: "Resumo indisponível.",
    },
    commissions: { data: [], loading: false, error: "" },
    manager: { data: { rules: [], artists: [] }, loading: false, error: "" },
    retryPayments: vi.fn(),
    retrySummary: mocks.retrySummary,
    retryCommissions: vi.fn(),
    retryManager: vi.fn(),
    refresh: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe("FinancialPage", () => {
  it("absorve uma nova falha de retry já representada no estado da seção", async () => {
    mocks.retrySummary.mockRejectedValueOnce(new Error("still down"));

    render(<FinancialPage />);
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    await waitFor(() => expect(mocks.retrySummary).toHaveBeenCalledTimes(1));
    await expect(runFinancialRetry(() => Promise.reject(new Error("still down")))).resolves.toBeUndefined();
  });
});
