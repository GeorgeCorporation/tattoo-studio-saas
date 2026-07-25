import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  calls: [] as Array<{ table: string; method: string; args: unknown[] }>,
  payments: [] as unknown[],
  rules: [] as unknown[],
  cancelled: [] as unknown[],
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn((table: string) => {
      const dataForTable = () => {
        if (table === "payments") return mocks.payments;
        if (table === "artist_commission_rules") return mocks.rules;
        if (table === "appointments") return mocks.cancelled;
        return [];
      };
      const builder = {
        select: vi.fn((...args: unknown[]) => {
          mocks.calls.push({ table, method: "select", args });
          return builder;
        }),
        eq: vi.fn((...args: unknown[]) => {
          mocks.calls.push({ table, method: "eq", args });
          return builder;
        }),
        gte: vi.fn((...args: unknown[]) => {
          mocks.calls.push({ table, method: "gte", args });
          return builder;
        }),
        lt: vi.fn((...args: unknown[]) => {
          mocks.calls.push({ table, method: "lt", args });
          return builder;
        }),
        order: vi.fn((...args: unknown[]) => {
          mocks.calls.push({ table, method: "order", args });
          return builder;
        }),
        returns: vi.fn(() => Promise.resolve({ data: dataForTable(), error: null })),
        then: (resolve: (value: { data: unknown[]; error: null }) => unknown, reject: (reason: unknown) => unknown) =>
          Promise.resolve({ data: dataForTable(), error: null }).then(resolve, reject),
      };

      return builder;
    }),
  },
}));

import { getArtistCommissionSummaries, getMonthSummary } from "@/services/financial.service";
import { getFinanceMonthRange } from "@/lib/finance-domain";

const payment = {
  id: "payment-1",
  amount: 500,
  type: "signal",
  method: "pix",
  paid_at: "2026-07-10T12:00:00.000Z",
  created_at: "2026-08-01T12:00:00.000Z",
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
      client_source: "artist_client",
    },
  ],
};

describe("financial.service", () => {
  beforeEach(() => {
    mocks.calls.length = 0;
    mocks.payments = [payment];
    mocks.cancelled = [{ id: "cancelled-1" }];
    mocks.rules = [
      {
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
      },
    ];
  });

  it("calcula o resumo com uma leitura de pagamentos e sem consulta separada de comissões", async () => {
    await expect(getMonthSummary("studio-1", 2026, 7)).resolves.toMatchObject({
      monthRevenue: 500,
      totalCommission: 50,
      cancelledCount: 1,
    });

    expect(mocks.calls.filter((call) => call.table === "payments" && call.method === "select")).toHaveLength(1);
    expect(mocks.calls.some((call) => call.table === "payment_commissions")).toBe(false);
  });

  it("usa paid_at como competência mensal das leituras financeiras", async () => {
    await getMonthSummary("studio-1", 2026, 7);
    await getArtistCommissionSummaries("studio-1", 2026, 7);

    const rangeColumns = mocks.calls
      .filter((call) => call.method === "gte" || call.method === "lt")
      .map((call) => call.args[0]);

    expect(rangeColumns).toContain("paid_at");
    expect(rangeColumns).not.toContain("created_at");
  });

  it("consulta pagamentos com a mesma janela UTC usada pelo domínio", async () => {
    await getMonthSummary("studio-1", 2026, 7);

    const { start, end } = getFinanceMonthRange(2026, 7);
    expect(mocks.calls).toContainEqual({
      table: "payments",
      method: "gte",
      args: ["paid_at", start],
    });
    expect(mocks.calls).toContainEqual({
      table: "payments",
      method: "lt",
      args: ["paid_at", end],
    });
  });
});
