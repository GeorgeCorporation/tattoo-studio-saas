import { describe, expect, it } from "vitest";
import { getFriendlyErrorMessage } from "@/lib/errors";

describe("getFriendlyErrorMessage", () => {
  it("traduz erro de registro duplicado", () => {
    expect(getFriendlyErrorMessage({ code: "23505" })).toBe(
      "Este registro ja existe. Confira os dados e tente novamente.",
    );
  });

  it("traduz erro de permissao", () => {
    expect(getFriendlyErrorMessage({ code: "42501" })).toBe("Voce nao tem permissao para fazer esta acao.");
  });

  it("traduz erro de rede", () => {
    expect(getFriendlyErrorMessage(new Error("Failed to fetch"))).toBe(
      "Falha de conexao. Verifique sua internet e tente novamente.",
    );
  });

  it("usa fallback para erro desconhecido", () => {
    expect(getFriendlyErrorMessage({}, "Erro customizado.")).toBe("Erro customizado.");
  });
});
