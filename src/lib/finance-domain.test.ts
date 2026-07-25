import { describe, expect, it } from "vitest";
import {
  buildArtistCommissionSummaries,
  buildMonthSummary,
  calculateCommissionBreakdown,
  clientSourceLabels,
  getFinanceMonthRange,
  type FinancePaymentSnapshot,
} from "@/lib/finance-domain";
import { getSidebarItemsForRole } from "@/lib/access-control";

describe("finance-domain", () => {
  const julyPayment: FinancePaymentSnapshot = {
    amount: 500,
    type: "signal",
    paid_at: "2026-07-10T12:00:00.000Z",
    created_at: "2026-08-01T12:00:00.000Z",
    appointments: {
      tattoo_artists: { id: "artist-1", name: "Ana" },
    },
    payment_commissions: [
      {
        commission_amount: 50,
        cap_applied: false,
        cap_consumed_amount: 50,
        client_source: "artist_client",
      },
    ],
  };

  it("aplica porcentagem normal abaixo do teto para cliente do tatuador", () => {
    const result = calculateCommissionBreakdown({
      amount: 500,
      percentage: 10,
      clientSource: "artist_client",
      capEnabled: true,
      monthlyCap: 1000,
      consumedCapAmount: 200,
    });

    expect(result.rawCommissionAmount).toBe(50);
    expect(result.commissionAmount).toBe(50);
    expect(result.capConsumedAmount).toBe(50);
    expect(result.capApplied).toBe(false);
  });

  it("trava a comissão no valor restante do teto para cliente do tatuador", () => {
    const result = calculateCommissionBreakdown({
      amount: 500,
      percentage: 10,
      clientSource: "artist_client",
      capEnabled: true,
      monthlyCap: 220,
      consumedCapAmount: 200,
    });

    expect(result.rawCommissionAmount).toBe(50);
    expect(result.commissionAmount).toBe(20);
    expect(result.capConsumedAmount).toBe(20);
    expect(result.capApplied).toBe(true);
  });

  it("zera a comissão de cliente do tatuador quando o teto mensal já foi atingido", () => {
    const result = calculateCommissionBreakdown({
      amount: 500,
      percentage: 10,
      clientSource: "artist_client",
      capEnabled: true,
      monthlyCap: 200,
      consumedCapAmount: 200,
    });

    expect(result.rawCommissionAmount).toBe(50);
    expect(result.commissionAmount).toBe(0);
    expect(result.capConsumedAmount).toBe(0);
    expect(result.capApplied).toBe(true);
  });

  it("mantém a comissão da indicação do estúdio mesmo após teto atingido", () => {
    const result = calculateCommissionBreakdown({
      amount: 500,
      percentage: 10,
      clientSource: "studio_referral",
      capEnabled: true,
      monthlyCap: 200,
      consumedCapAmount: 200,
    });

    expect(result.rawCommissionAmount).toBe(50);
    expect(result.commissionAmount).toBe(50);
    expect(result.capConsumedAmount).toBe(0);
    expect(result.capApplied).toBe(false);
  });

  it("retorna labels em português para as origens do cliente", () => {
    expect(clientSourceLabels.artist_client).toBe("Cliente do tatuador");
    expect(clientSourceLabels.studio_referral).toBe("Indicação do estúdio");
  });

  it("deriva o resumo do snapshot de pagamentos pela competência de paid_at", () => {
    const augustPaymentCreatedInJuly: FinancePaymentSnapshot = {
      ...julyPayment,
      amount: 300,
      type: "final",
      paid_at: "2026-08-02T12:00:00.000Z",
      created_at: "2026-07-20T12:00:00.000Z",
      payment_commissions: [
        {
          commission_amount: 30,
          cap_applied: true,
          cap_consumed_amount: 30,
          client_source: "artist_client",
        },
      ],
    };

    expect(buildMonthSummary([julyPayment, augustPaymentCreatedInJuly], 4, 2026, 7)).toEqual({
      monthRevenue: 500,
      signalTotal: 500,
      finalTotal: 0,
      cancelledCount: 4,
      totalCommission: 50,
      cappedCommissionCount: 0,
      studioNetRevenue: 450,
    });
  });

  it("deriva comissões por artista do mesmo snapshot e ignora created_at", () => {
    const summaries = buildArtistCommissionSummaries(
      [
        julyPayment,
        {
          ...julyPayment,
          amount: 1000,
          paid_at: "2026-08-03T12:00:00.000Z",
          created_at: "2026-07-03T12:00:00.000Z",
        },
      ],
      [
        {
          artist_id: "artist-1",
          is_active: true,
          cap_enabled: true,
          monthly_cap: 1000,
          starts_at: "2026-01-01",
        },
      ],
      2026,
      7,
    );

    expect(summaries).toEqual([
      {
        artist_id: "artist-1",
        artist_name: "Ana",
        monthlyRevenue: 500,
        ownClientCommission: 50,
        studioReferralCommission: 0,
        totalCommission: 50,
        capValue: 1000,
        capConsumed: 50,
        capReached: false,
      },
    ]);
  });

  it("usa a mesma janela UTC nas bordas do mês financeiro", () => {
    const { start, end } = getFinanceMonthRange(2026, 7);
    const at = (timestamp: number, amount: number): FinancePaymentSnapshot => ({
      ...julyPayment,
      amount,
      paid_at: new Date(timestamp).toISOString(),
      payment_commissions: [],
    });

    const summary = buildMonthSummary(
      [
        at(Date.parse(start) - 1, 100),
        at(Date.parse(start), 200),
        at(Date.parse(end) - 1, 300),
        at(Date.parse(end), 400),
      ],
      0,
      2026,
      7,
    );

    expect(summary.monthRevenue).toBe(500);
  });

  it("ignora regra futura ao resumir um mês histórico", () => {
    const summaries = buildArtistCommissionSummaries(
      [julyPayment],
      [
        {
          artist_id: "artist-1",
          is_active: true,
          cap_enabled: true,
          monthly_cap: 5000,
          starts_at: "2026-10-01",
        },
        {
          artist_id: "artist-1",
          is_active: true,
          cap_enabled: true,
          monthly_cap: 1000,
          starts_at: "2026-01-01",
        },
      ],
      2026,
      7,
    );

    expect(summaries[0]?.capValue).toBe(1000);
  });

  it("mostra menu reduzido para tatuador", () => {
    const items = getSidebarItemsForRole("artist");

    expect(items.map((item) => item.href)).toEqual([
      "/painel",
      "/painel/agenda",
      "/painel/clientes",
      "/painel/entregas",
      "/painel/financeiro",
    ]);
  });
});
