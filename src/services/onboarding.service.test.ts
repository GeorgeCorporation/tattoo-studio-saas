import { describe, expect, it } from "vitest";
import {
  buildDefaultWorkingHours,
  makeDefaultWorkingHours,
  slugify,
  validateOnboardingStep,
} from "@/services/onboarding.service";

describe("onboarding.service", () => {
  it("gera slug limpo sem acentos e espaços", () => {
    expect(slugify("Estúdio São Jorge Tattoo!")).toBe("estudio-sao-jorge-tattoo");
  });

  it("cria horários padrão para os 7 dias", () => {
    const hours = makeDefaultWorkingHours("studio-1");

    expect(hours).toHaveLength(7);
    expect(hours[0]).toMatchObject({
      studio_id: "studio-1",
      day_of_week: 0,
      is_open: false,
      open_time: null,
      close_time: null,
    });
    expect(hours[1]).toMatchObject({
      studio_id: "studio-1",
      day_of_week: 1,
      is_open: true,
      open_time: "09:00",
      close_time: "18:00",
    });
  });

  it("valida campos obrigatórios do onboarding", () => {
    expect(validateOnboardingStep(1, { name: "", slug: "" })).toContain("nome");
    expect(validateOnboardingStep(2, { whatsapp: "1199", city: "São Paulo", state: "SP" })).toContain("WhatsApp");
    expect(validateOnboardingStep(4, { firstArtist: { name: "" } })).toContain("tatuador");
    expect(validateOnboardingStep(5, { firstService: { name: "" } })).toContain("serviço");
  });

  it("bloqueia horário aberto com fechamento antes da abertura", () => {
    const hours = buildDefaultWorkingHours();
    hours[1] = { ...hours[1], open_time: "18:00", close_time: "09:00" };

    expect(validateOnboardingStep(3, { workingHours: hours })).toContain("horários");
  });
});
