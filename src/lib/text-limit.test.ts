import { afterEach, describe, expect, it, vi } from "vitest";
import { countVisualCharacters, limitVisualCharacters } from "@/lib/text-limit";

describe("text-limit", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("conta texto simples, emoji e acento combinado como caracteres visuais", () => {
    expect(countVisualCharacters("a".repeat(200))).toBe(200);
    expect(countVisualCharacters("🎨".repeat(200))).toBe(200);
    expect(countVisualCharacters("e\u0301".repeat(200))).toBe(200);
  });

  it("limita sem cortar o caractere visual", () => {
    const value = `${"🎨".repeat(200)}fim`;

    expect(limitVisualCharacters(value, 200)).toBe("🎨".repeat(200));
    expect(countVisualCharacters(limitVisualCharacters(value, 200))).toBe(200);
  });

  it("mantém funcionamento básico quando Intl.Segmenter não existe", async () => {
    vi.stubGlobal("Intl", {} as typeof Intl);
    vi.resetModules();
    const fallbackModule = await import("@/lib/text-limit");

    expect(fallbackModule.countVisualCharacters("abc")).toBe(3);
    expect(fallbackModule.limitVisualCharacters("abcd", 3)).toBe("abc");
  });
});
