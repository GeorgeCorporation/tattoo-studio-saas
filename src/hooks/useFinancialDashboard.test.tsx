import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFinancialDashboard } from "@/hooks/useFinancialDashboard";
import { CommissionRuleModal } from "@/pages/financial/CommissionRuleModal";
import { PaymentModal } from "@/pages/financial/PaymentModal";

const mocks = vi.hoisted(() => ({
  createPayment: vi.fn(),
  getAppointmentsForPayment: vi.fn(),
  getArtists: vi.fn(),
  getCancelledAppointmentsCount: vi.fn(),
  getCommissionRules: vi.fn(),
  getPaymentsByMonth: vi.fn(),
  loggerError: vi.fn(),
  upsertCommissionRule: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    error: mocks.loggerError,
  },
}));

vi.mock("@/services/artists.service", () => ({
  getArtists: mocks.getArtists,
}));

vi.mock("@/services/financial.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/financial.service")>();
  return {
    ...actual,
    createPayment: mocks.createPayment,
    getAppointmentsForPayment: mocks.getAppointmentsForPayment,
    getCancelledAppointmentsCount: mocks.getCancelledAppointmentsCount,
    getCommissionRules: mocks.getCommissionRules,
    getPaymentsByMonth: mocks.getPaymentsByMonth,
    upsertCommissionRule: mocks.upsertCommissionRule,
  };
});

const payment = {
  id: "payment-1",
  amount: 500,
  type: "signal" as const,
  method: "pix" as const,
  paid_at: "2026-07-10T12:00:00.000Z",
  created_at: "2026-07-10T12:00:00.000Z",
  appointments: {
    id: "appointment-1",
    date: "2026-07-10",
    client_source: "artist_client",
    clients: { name: "Cliente" },
    tattoo_artists: { id: "artist-1", name: "Ana" },
    services: { name: "Fine line" },
  },
  payment_commissions: [
    {
      id: "commission-1",
      percentage: 10,
      commission_amount: 50,
      raw_commission_amount: 50,
      cap_applied: false,
      cap_consumed_amount: 50,
      client_source: "artist_client" as const,
    },
  ],
};

const rule = {
  id: "rule-1",
  studio_id: "studio-1",
  artist_id: "artist-1",
  is_active: true,
  percentage: 10,
  cap_enabled: true,
  monthly_cap: 1000,
  starts_at: "2026-01-01",
  notes: null,
  tattoo_artists: { name: "Ana" },
};

function FinancialHarness({ month = 7, isManager = true }: { month?: number; isManager?: boolean }) {
  const dashboard = useFinancialDashboard({
    studioId: "studio-1",
    year: 2026,
    month,
    isManager,
  });

  return (
    <div>
      <p data-testid="payments">{dashboard.payments.data.map((item) => item.id).join(",")}</p>
      <p data-testid="payments-error">{dashboard.payments.error}</p>
      <p data-testid="summary">{dashboard.summary.data.monthRevenue}</p>
      <p data-testid="summary-error">{dashboard.summary.error}</p>
      <p data-testid="rules">{dashboard.manager.data.rules.map((item) => item.id).join(",")}</p>
      <p data-testid="commissions">{dashboard.commissions.data.map((item) => item.artist_id).join(",")}</p>
      <p data-testid="manager-error">{dashboard.manager.error}</p>
      <button onClick={() => void dashboard.retrySummary()} type="button">
        retry summary
      </button>
    </div>
  );
}

describe("useFinancialDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPaymentsByMonth.mockResolvedValue([payment]);
    mocks.getCancelledAppointmentsCount.mockResolvedValue(1);
    mocks.getCommissionRules.mockResolvedValue([rule]);
    mocks.getArtists.mockResolvedValue([{ id: "artist-1", name: "Ana" }]);
    mocks.getAppointmentsForPayment.mockResolvedValue([
      {
        id: "appointment-1",
        date: "2026-07-10",
        time: "10:00:00",
        client_source: "artist_client",
        clients: { name: "Cliente" },
        tattoo_artists: { id: "artist-1", name: "Ana" },
        services: { name: "Fine line" },
      },
    ]);
    mocks.createPayment.mockResolvedValue("payment-new");
    mocks.upsertCommissionRule.mockResolvedValue("rule-new");
  });

  it("preserva o histórico quando o resumo falha", async () => {
    mocks.getCancelledAppointmentsCount.mockRejectedValueOnce({ code: "SUMMARY_DOWN", status: 503 });

    render(<FinancialHarness />);

    await waitFor(() => expect(screen.getByTestId("payments")).toHaveTextContent("payment-1"));
    expect(screen.getByTestId("summary-error")).not.toHaveTextContent(/^$/);
  });

  it("preserva regras carregadas quando o histórico falha", async () => {
    mocks.getPaymentsByMonth.mockRejectedValueOnce({ code: "PAYMENTS_DOWN", status: 500 });

    render(<FinancialHarness />);

    await waitFor(() => expect(screen.getByTestId("rules")).toHaveTextContent("rule-1"));
    expect(screen.getByTestId("payments-error")).not.toHaveTextContent(/^$/);
  });

  it("refaz apenas o resumo sem reler o histórico", async () => {
    mocks.getCancelledAppointmentsCount
      .mockRejectedValueOnce({ code: "SUMMARY_DOWN", status: 503 })
      .mockResolvedValueOnce(2);

    render(<FinancialHarness />);
    await waitFor(() => expect(screen.getByTestId("summary-error")).not.toHaveTextContent(/^$/));

    fireEvent.click(screen.getByRole("button", { name: "retry summary" }));

    await waitFor(() => expect(screen.getByTestId("summary")).toHaveTextContent("500"));
    expect(mocks.getPaymentsByMonth).toHaveBeenCalledTimes(1);
    expect(mocks.getCancelledAppointmentsCount).toHaveBeenCalledTimes(2);
  });

  it("registra contexto técnico da seção sem dados pessoais", async () => {
    mocks.getCancelledAppointmentsCount.mockRejectedValueOnce({
      code: "PGRST116",
      status: 406,
      message: "Cliente Ana, ana@example.com",
    });

    render(<FinancialHarness />);
    await waitFor(() => expect(mocks.loggerError.mock.calls.some((call) => call[2]?.section === "summary")).toBe(true));

    const summaryLog = mocks.loggerError.mock.calls.find((call) => call[2]?.section === "summary");
    expect(summaryLog).toBeDefined();
    expect(summaryLog?.[1]).toBeUndefined();
    expect(summaryLog?.[2]).toMatchObject({
      section: "summary",
      code: "PGRST116",
      status: 406,
      year: 2026,
      month: 7,
      studioId: "studio-1",
    });
    expect(JSON.stringify(summaryLog)).not.toMatch(/Ana|ana@example\.com|message/);
  });

  it("compartilha pagamentos e regras sem consultas duplicadas no ciclo", async () => {
    render(<FinancialHarness />);

    await waitFor(() => expect(screen.getByTestId("summary")).toHaveTextContent("500"));
    expect(mocks.getPaymentsByMonth).toHaveBeenCalledTimes(1);
    expect(mocks.getCommissionRules).toHaveBeenCalledTimes(1);
  });

  it("ignora respostas atrasadas do mês anterior", async () => {
    let resolveJuly!: (value: (typeof payment)[]) => void;
    const julyPayments = new Promise<(typeof payment)[]>((resolve) => {
      resolveJuly = resolve;
    });
    const augustPayment = {
      ...payment,
      id: "payment-august",
      amount: 800,
      paid_at: "2026-08-10T12:00:00.000Z",
    };
    mocks.getPaymentsByMonth.mockImplementation((_studioId, _year, requestedMonth) =>
      requestedMonth === 7 ? julyPayments : Promise.resolve([augustPayment]),
    );

    const { rerender } = render(<FinancialHarness month={7} />);
    rerender(<FinancialHarness month={8} />);

    await waitFor(() => expect(screen.getByTestId("payments")).toHaveTextContent("payment-august"));
    expect(screen.getByTestId("summary")).toHaveTextContent("800");

    await act(async () => resolveJuly([payment]));

    await waitFor(() => expect(screen.getByTestId("payments")).toHaveTextContent("payment-august"));
    expect(screen.getByTestId("summary")).toHaveTextContent("800");
  });

  it("limpa os dados do escopo anterior quando a carga adiada do novo mês falha", async () => {
    let rejectAugustPayments!: (reason?: unknown) => void;
    const augustPayments = new Promise<(typeof payment)[]>((_, reject) => {
      rejectAugustPayments = reject;
    });
    mocks.getPaymentsByMonth.mockImplementation((_studioId, _year, requestedMonth) =>
      requestedMonth === 7 ? Promise.resolve([payment]) : augustPayments,
    );

    const { rerender } = render(<FinancialHarness month={7} />);
    await waitFor(() => expect(screen.getByTestId("payments")).toHaveTextContent("payment-1"));

    rerender(<FinancialHarness month={8} />);
    expect(screen.getByTestId("payments")).toHaveTextContent(/^$/);
    expect(screen.getByTestId("summary")).toHaveTextContent("0");
    expect(screen.getByTestId("commissions")).toHaveTextContent(/^$/);

    await act(async () => rejectAugustPayments({ code: "PAYMENTS_DOWN", status: 503 }));

    await waitFor(() => expect(screen.getByTestId("payments-error")).not.toHaveTextContent(/^$/));
    expect(screen.getByTestId("payments")).toHaveTextContent(/^$/);
    expect(screen.getByTestId("summary")).toHaveTextContent("0");
    expect(screen.getByTestId("commissions")).toHaveTextContent(/^$/);
  });

  it("carrega comissões no modo artista sem buscar a lista gerencial de artistas", async () => {
    render(<FinancialHarness isManager={false} />);

    await waitFor(() => expect(screen.getByTestId("commissions")).toHaveTextContent("artist-1"));
    expect(mocks.getArtists).not.toHaveBeenCalled();
    expect(mocks.getCommissionRules).toHaveBeenCalledTimes(1);
  });
});

describe("refresh dos modais financeiros", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAppointmentsForPayment.mockResolvedValue([
      {
        id: "appointment-1",
        date: "2026-07-10",
        time: "10:00:00",
        client_source: "artist_client",
        clients: { name: "Cliente" },
        tattoo_artists: { id: "artist-1", name: "Ana" },
        services: { name: "Fine line" },
      },
    ]);
    mocks.createPayment.mockResolvedValue("payment-new");
    mocks.upsertCommissionRule.mockResolvedValue("rule-new");
  });

  it("aguarda o refresh antes de fechar o modal de pagamento", async () => {
    let finishRefresh!: () => void;
    const onCreated = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishRefresh = resolve;
        }),
    );
    const onClose = vi.fn();

    render(<PaymentModal onClose={onClose} onCreated={onCreated} open studioId="studio-1" />);

    await screen.findByRole("option", { name: /Cliente/ });
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "500" } });
    fireEvent.submit(screen.getByRole("button", { name: "Registrar pagamento" }).closest("form")!);

    await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));
    expect(onClose).not.toHaveBeenCalled();

    await act(async () => finishRefresh());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("mantém o pagamento gravado e mostra aviso específico quando o refresh falha", async () => {
    const onClose = vi.fn();
    const onCreated = vi.fn().mockRejectedValue(new Error("refresh down"));

    render(<PaymentModal onClose={onClose} onCreated={onCreated} open studioId="studio-1" />);

    await screen.findByRole("option", { name: /Cliente/ });
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "500" } });
    fireEvent.submit(screen.getByRole("button", { name: "Registrar pagamento" }).closest("form")!);

    expect(await screen.findByText(/pagamento foi registrado, mas não foi possível atualizar/i)).toBeInTheDocument();
    expect(mocks.createPayment).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByText("Não foi possível registrar pagamento.")).not.toBeInTheDocument();
  });

  it("aguarda o refresh antes de fechar o modal de regra", async () => {
    let finishRefresh!: () => void;
    const onSaved = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishRefresh = resolve;
        }),
    );
    const onClose = vi.fn();

    render(
      <CommissionRuleModal
        artists={[{ id: "artist-1", name: "Ana" } as never]}
        onClose={onClose}
        onSaved={onSaved}
        open
        studioId="studio-1"
      />,
    );
    fireEvent.submit(screen.getByRole("button", { name: "Salvar regra" }).closest("form")!);

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(onClose).not.toHaveBeenCalled();

    await act(async () => finishRefresh());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("mantém a regra salva e mostra aviso específico quando o refresh falha", async () => {
    const onClose = vi.fn();
    const onSaved = vi.fn().mockRejectedValue(new Error("refresh down"));

    render(
      <CommissionRuleModal
        artists={[{ id: "artist-1", name: "Ana" } as never]}
        onClose={onClose}
        onSaved={onSaved}
        open
        studioId="studio-1"
      />,
    );
    fireEvent.submit(screen.getByRole("button", { name: "Salvar regra" }).closest("form")!);

    expect(await screen.findByText(/regra foi salva, mas não foi possível atualizar/i)).toBeInTheDocument();
    expect(mocks.upsertCommissionRule).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByText("Não foi possível salvar regra de comissão.")).not.toBeInTheDocument();
  });
});
