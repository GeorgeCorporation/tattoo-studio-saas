import { describe, expect, it } from "vitest";
import { validateServiceInput } from "@/lib/service-domain";

const validInput = {
  name: "Fine line",
  durationMinutes: 30,
};

describe("service-domain", () => {
  it.each([29, 30.5, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejeita duração inválida: %s",
    (durationMinutes) => {
      expect(validateServiceInput({ ...validInput, durationMinutes })).toContain("duração");
    },
  );

  it("aceita duração inteira mínima de 30 minutos", () => {
    expect(validateServiceInput(validInput)).toBe("");
  });

  it("aceita preço inicial vazio", () => {
    expect(validateServiceInput({ ...validInput, startingPrice: null })).toBe("");
  });

  it("rejeita preço inicial negativo", () => {
    expect(validateServiceInput({ ...validInput, startingPrice: -0.01 })).toContain("preço");
  });
});
