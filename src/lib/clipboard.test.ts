import { beforeEach, describe, expect, it, vi } from "vitest";
import { copyTextToClipboard } from "@/lib/clipboard";

describe("copyTextToClipboard", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("copia com navigator.clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    await expect(copyTextToClipboard("link")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("link");
  });

  it("usa fallback quando clipboard bloqueia", async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("blocked")) } });
    Object.defineProperty(document, "execCommand", { value: vi.fn().mockReturnValue(true), configurable: true });
    const execCommand = vi.spyOn(document, "execCommand");

    await expect(copyTextToClipboard("link")).resolves.toBe(true);
    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("retorna false sem texto", async () => {
    await expect(copyTextToClipboard("")).resolves.toBe(false);
  });
});
