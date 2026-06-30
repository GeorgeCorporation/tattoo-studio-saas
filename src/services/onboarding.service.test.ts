import { describe, expect, it } from "vitest";
import { makeDefaultWorkingHours, slugify } from "@/services/onboarding.service";

describe("onboarding.service", () => {
  it("gera slug limpo sem acentos e espacos", () => {
    expect(slugify("Estudio Sao Jorge Tattoo!")).toBe("estudio-sao-jorge-tattoo");
  });

  it("cria horarios padrao para os 7 dias", () => {
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
});
