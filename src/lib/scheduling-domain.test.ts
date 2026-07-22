import { describe, expect, it } from "vitest";
import {
  intervalsOverlap,
  isWithinWorkingHours,
  timeToMinutes,
} from "@/lib/scheduling-domain";

describe("scheduling-domain", () => {
  it("converte horário para minutos", () => {
    expect(timeToMinutes("09:30:00")).toBe(570);
  });

  it("identifica conflito entre 09:00 + 120 e 10:00 + 60", () => {
    expect(intervalsOverlap(540, 120, 600, 60)).toBe(true);
  });

  it("aceita intervalos adjacentes", () => {
    expect(intervalsOverlap(540, 60, 600, 60)).toBe(false);
  });

  it("rejeita intervalo que termina após o fechamento", () => {
    expect(
      isWithinWorkingHours("17:00", 120, {
        day_of_week: 1,
        is_open: true,
        open_time: "09:00",
        close_time: "18:00",
      }),
    ).toBe(false);
  });

  it("aceita intervalo inteiramente dentro do expediente", () => {
    expect(
      isWithinWorkingHours("16:00", 120, {
        day_of_week: 1,
        is_open: true,
        open_time: "09:00",
        close_time: "18:00",
      }),
    ).toBe(true);
  });
});
