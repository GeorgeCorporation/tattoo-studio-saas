import { describe, expect, it } from "vitest";
import type { OnboardingWorkingHour } from "@/services/onboarding.service";
import { updateWorkingHourField, validateWorkingHours } from "@/lib/working-hours";

const openHour: OnboardingWorkingHour = {
  day_of_week: 1,
  is_open: true,
  open_time: "09:00",
  close_time: "18:00",
};

describe("working-hours", () => {
  it("preserva a nova abertura ao editar o horário", () => {
    expect(updateWorkingHourField(openHour, "open_time", "10:00")).toMatchObject({
      open_time: "10:00",
      close_time: "18:00",
      is_open: true,
    });
  });

  it("preserva o novo fechamento ao editar o horário", () => {
    expect(updateWorkingHourField(openHour, "close_time", "20:00")).toMatchObject({
      open_time: "09:00",
      close_time: "20:00",
      is_open: true,
    });
  });

  it("limpa os horários ao fechar o dia", () => {
    expect(updateWorkingHourField(openHour, "is_open", false)).toMatchObject({
      is_open: false,
      open_time: null,
      close_time: null,
    });
  });

  it("aceita expediente aberto com abertura anterior ao fechamento", () => {
    expect(validateWorkingHours([openHour])).toBe("");
  });

  it("rejeita expediente aberto sem horários válidos", () => {
    expect(validateWorkingHours([{ ...openHour, open_time: "18:00", close_time: "09:00" }])).toContain("abertura");
  });

  it("rejeita abertura igual ao fechamento em formatos de tempo mistos", () => {
    expect(validateWorkingHours([{ ...openHour, open_time: "09:00", close_time: "09:00:00" }])).toContain("abertura");
  });
});
