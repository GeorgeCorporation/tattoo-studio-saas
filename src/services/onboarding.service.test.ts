import { describe, expect, it } from "vitest";
import {
  buildDefaultWorkingHours,
  getOnboardingProgress,
  makeDefaultWorkingHours,
  slugify,
  validateOnboardingStep,
} from "@/services/onboarding.service";

describe("onboarding.service", () => {
  const completeSnapshot = (duration: number | null) => ({
    studio: {
      id: "studio-1",
      name: "Inkora",
      slug: "inkora",
      whatsapp: "11999999999",
      city: "São Paulo",
      state: "SP",
      logo_url: null,
      description: null,
      instagram: null,
      website: null,
      address: null,
    },
    workingHours: buildDefaultWorkingHours(),
    artists: [{ id: "artist-1", name: "Ana", slug: "ana", specialty: null, instagram: null, whatsapp: null, photo_url: null }],
    services: [{ id: "service-1", name: "Fine Line", category: null, description: null, starting_price: null, avg_duration_minutes: duration }],
  });

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
    expect(validateOnboardingStep(4, { firstArtist: { name: "" }, firstService: { name: "" } })).toContain("tatuador");
    expect(validateOnboardingStep(4, { firstArtist: { name: "Ana" }, firstService: { name: "" } })).toContain("serviço");
    expect(
      validateOnboardingStep(4, {
        activateBooking: false,
        firstArtist: { name: "" },
        firstService: { name: "" },
      }),
    ).toBe("");
  });

  it("bloqueia horário aberto com fechamento antes da abertura", () => {
    const hours = buildDefaultWorkingHours();
    hours[1] = { ...hours[1], open_time: "18:00", close_time: "09:00" };

    expect(validateOnboardingStep(3, { workingHours: hours })).toContain("horários");
  });

  it("exige duração válida quando um serviço é informado", () => {
    expect(
      validateOnboardingStep(4, {
        activateBooking: true,
        firstArtists: [{ name: "Ana" }],
        firstServices: [{ name: "Fine Line", avg_duration_minutes: null }],
      }),
    ).toContain("duração");

    expect(
      validateOnboardingStep(4, {
        activateBooking: true,
        firstArtists: [{ name: "Ana" }],
        firstServices: [{ name: "Fine Line", avg_duration_minutes: 120 }],
      }),
    ).toBe("");
  });

  it.each([29, 30.5, Number.NaN, Number.POSITIVE_INFINITY])("rejeita a duração inválida %s no domínio", (duration) => {
    expect(
      validateOnboardingStep(4, {
        activateBooking: true,
        firstArtists: [{ name: "Ana" }],
        firstServices: [{ name: "Fine Line", avg_duration_minutes: duration }],
      }),
    ).toContain("duração");
  });

  it("aceita a duração inteira mínima de 30 minutos", () => {
    expect(
      validateOnboardingStep(4, {
        activateBooking: true,
        firstArtists: [{ name: "Ana" }],
        firstServices: [{ name: "Fine Line", avg_duration_minutes: 30 }],
      }),
    ).toBe("");
  });

  it("rejeita serviço nomeado com duração inválida mesmo com agenda pública desligada", () => {
    expect(
      validateOnboardingStep(4, {
        activateBooking: false,
        firstArtists: [],
        firstServices: [{ name: "Fine Line", avg_duration_minutes: 30.5 }],
      }),
    ).toContain("duração");
  });

  it.each([null, 29, 30.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "não considera o snapshot pronto com duração %s",
    (duration) => {
      const progress = getOnboardingProgress(completeSnapshot(duration));

      expect(progress.isBookingReady).toBe(false);
      expect(progress.canFinish).toBe(false);
      expect(progress.nextStep).toBe(4);
    },
  );

  it.each([30, 120])("considera o snapshot pronto com duração inteira válida %s", (duration) => {
    const progress = getOnboardingProgress(completeSnapshot(duration));

    expect(progress.isBookingReady).toBe(true);
    expect(progress.canFinish).toBe(true);
    expect(progress.nextStep).toBe(5);
  });

  it("permite concluir sem serviço quando a agenda pública está desligada", () => {
    expect(
      validateOnboardingStep(4, {
        activateBooking: false,
        firstArtists: [],
        firstServices: [],
      }),
    ).toBe("");
  });
});
