import { describe, expect, it } from "vitest";
import { SLUGS_RESERVADOS, assertPublicSlug, isReservedSlug, isValidPublicSlug } from "@/lib/slugs";

describe("isValidPublicSlug", () => {
  it("aceita letras minusculas, numeros e hifens", () => {
    expect(isValidPublicSlug("estudio-tinta-9")).toBe(true);
  });

  it("rejeita maiuscula, espaco e caractere acentuado", () => {
    expect(isValidPublicSlug("Estudio")).toBe(false);
    expect(isValidPublicSlug("estudio tinta")).toBe(false);
    expect(isValidPublicSlug("tatuagém")).toBe(false);
  });

  it("rejeita barra e contrabarra usadas em redirecionamento", () => {
    expect(isValidPublicSlug("estudio/agendar")).toBe(false);
    expect(isValidPublicSlug("\\\\evil.com")).toBe(false);
    expect(isValidPublicSlug("estudio\\evil")).toBe(false);
  });

  it("rejeita slug vazio", () => {
    expect(isValidPublicSlug("")).toBe(false);
  });

  it("nao aceita quebra de linha contornando a ancora", () => {
    expect(isValidPublicSlug("estudio\nadmin")).toBe(false);
  });
});

describe("isReservedSlug", () => {
  it.each(["admin", "dashboard", "entrega", "painel", "privacidade", "ativar-tatuador"])(
    "reserva %s",
    (slug) => {
      expect(isReservedSlug(slug)).toBe(true);
    },
  );

  it("libera nome comum de estudio", () => {
    expect(isReservedSlug("inkora-tattoo")).toBe(false);
  });

  it("mantem todo slug reservado dentro do formato publico valido", () => {
    for (const slug of SLUGS_RESERVADOS) {
      expect(isValidPublicSlug(slug)).toBe(true);
    }
  });
});

describe("assertPublicSlug", () => {
  it("passa em slug valido e livre", () => {
    expect(() => assertPublicSlug("estudio-tinta")).not.toThrow();
  });

  it("recusa formato invalido antes de checar reserva", () => {
    expect(() => assertPublicSlug("Estudio Tinta")).toThrow(/Slug inválido/);
  });

  it("recusa slug reservado", () => {
    expect(() => assertPublicSlug("dashboard")).toThrow(/reservado/);
  });
});
