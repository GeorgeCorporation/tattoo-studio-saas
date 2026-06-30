import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    storage: {
      from: vi.fn(),
    },
  },
}));

import {
  buildHourlySlots,
  getDayOfWeekFromDateInput,
  isFutureDate,
  normalizeTime,
  toDateInputValue,
} from "@/services/booking.service";

describe("booking.service", () => {
  it("gera horarios de 1h dentro do expediente", () => {
    expect(buildHourlySlots("09:00", "12:00")).toEqual(["09:00", "10:00", "11:00"]);
  });

  it("nao gera horario quando expediente esta fechado ou invalido", () => {
    expect(buildHourlySlots(null, null)).toEqual([]);
    expect(buildHourlySlots("18:00", "09:00")).toEqual([]);
  });

  it("calcula dia da semana usando a data do formulario", () => {
    expect(getDayOfWeekFromDateInput("2026-06-28")).toBe(0);
    expect(getDayOfWeekFromDateInput("2026-06-29")).toBe(1);
  });

  it("normaliza horario vindo do banco", () => {
    expect(normalizeTime("09:00:00")).toBe("09:00");
  });

  it("detecta data futura sem depender de UTC", () => {
    const today = toDateInputValue(new Date());
    expect(isFutureDate(today)).toBe(false);
  });
});
