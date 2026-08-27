import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockModeKey = "inkora:mock-mode";
const studioKey = "inkora:mock-studio";

async function carregarComAmbiente(opcoes: { dev: boolean; useMock?: string; query?: string }) {
  vi.resetModules();
  vi.stubEnv("DEV", opcoes.dev);
  vi.stubEnv("VITE_USE_MOCK", opcoes.useMock ?? "false");
  window.history.replaceState({}, "", `/${opcoes.query ?? ""}`);
  return import("@/lib/mockMode");
}

describe("ativacao do mock por URL", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("liga o mock com ?mock=1 em desenvolvimento", async () => {
    const { isMockMode } = await carregarComAmbiente({ dev: true, query: "?mock=1" });
    expect(isMockMode).toBe(true);
    expect(window.localStorage.getItem(mockModeKey)).toBe("true");
  });

  it("ignora ?mock=1 em producao", async () => {
    const { isMockMode } = await carregarComAmbiente({ dev: false, query: "?mock=1" });
    expect(isMockMode).toBe(false);
    expect(window.localStorage.getItem(mockModeKey)).toBeNull();
  });

  it("descarta em producao um estado de mock deixado para tras", async () => {
    window.localStorage.setItem(mockModeKey, "true");
    window.localStorage.setItem(studioKey, JSON.stringify({ id: "mock-studio-1" }));

    const { isMockMode } = await carregarComAmbiente({ dev: false });

    expect(isMockMode).toBe(false);
    expect(window.localStorage.getItem(mockModeKey)).toBeNull();
    expect(window.localStorage.getItem(studioKey)).toBeNull();
  });

  it("respeita VITE_USE_MOCK em producao, para build de demonstracao", async () => {
    const { isMockMode } = await carregarComAmbiente({ dev: false, useMock: "true" });
    expect(isMockMode).toBe(true);
  });

  it("mantem o mock ligado entre navegacoes em desenvolvimento", async () => {
    window.localStorage.setItem(mockModeKey, "true");
    const { isMockMode } = await carregarComAmbiente({ dev: true });
    expect(isMockMode).toBe(true);
  });

  it("desliga o mock com ?mock=0 em desenvolvimento", async () => {
    window.localStorage.setItem(mockModeKey, "true");
    window.localStorage.setItem(studioKey, JSON.stringify({ id: "mock-studio-1" }));

    const { isMockMode } = await carregarComAmbiente({ dev: true, query: "?mock=0" });

    expect(isMockMode).toBe(false);
    expect(window.localStorage.getItem(studioKey)).toBeNull();
  });
});
