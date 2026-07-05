import { describe, expect, it } from "vitest";
import {
  calculateCommissionBreakdown,
  clientSourceLabels,
} from "@/lib/finance-domain";
import { getSidebarItemsForRole } from "@/lib/access-control";

describe("finance-domain", () => {
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
