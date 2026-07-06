import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const remove = vi.fn();
  const upload = vi.fn();
  const getPublicUrl = vi.fn();
  const update = vi.fn();
  const from = vi.fn();
  return { remove, upload, getPublicUrl, update, from };
});

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: mocks.from,
    storage: {
      from: vi.fn(() => ({ remove: mocks.remove, upload: mocks.upload, getPublicUrl: mocks.getPublicUrl })),
    },
  },
}));

vi.mock("@/services/storage.service", () => ({
  createStoragePath: vi.fn(() => "studio-1/logo.png"),
  getStoragePathFromPublicUrl: vi.fn(() => "studio-1/logo-antiga.png"),
  validateUploadFile: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

import { replaceStudioLogo } from "@/services/studio-brand.service";

describe("studio-brand.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("salva nova logo e remove antiga depois", async () => {
    mocks.upload.mockResolvedValue({ error: null });
    mocks.update.mockResolvedValue({ error: null });
    mocks.getPublicUrl.mockReturnValue({ data: { publicUrl: "https://cdn/logo-nova.png" } });
    mocks.from.mockReturnValue({
      update: (...args: unknown[]) => ({
        eq: vi.fn().mockResolvedValue(mocks.update(...args)),
      }),
    });

    const result = await replaceStudioLogo({
      studioId: "studio-1",
      file: new File(["x"], "logo.png", { type: "image/png" }),
      previousLogoUrl: "https://project.supabase.co/storage/v1/object/public/logos/studio-1/logo-antiga.png",
    });

    expect(mocks.upload).toHaveBeenCalledWith("studio-1/logo.png", expect.any(File), expect.any(Object));
    expect(mocks.update).toHaveBeenCalledWith({ logo_url: "https://cdn/logo-nova.png" });
    expect(mocks.remove).toHaveBeenCalledWith(["studio-1/logo-antiga.png"]);
    expect(result.logoUrl).toBe("https://cdn/logo-nova.png");
  });

  it("não apaga nova logo se update falhar", async () => {
    mocks.upload.mockResolvedValue({ error: null });
    mocks.update.mockResolvedValue({ error: { message: "fail" } });
    mocks.getPublicUrl.mockReturnValue({ data: { publicUrl: "https://cdn/logo-nova.png" } });
    mocks.from.mockReturnValue({
      update: (...args: unknown[]) => ({
        eq: vi.fn().mockResolvedValue(mocks.update(...args)),
      }),
    });

    await expect(
      replaceStudioLogo({
        studioId: "studio-1",
        file: new File(["x"], "logo.png", { type: "image/png" }),
      }),
    ).rejects.toThrow("A nova logo foi enviada, mas não conseguimos salvar no estúdio.");

    expect(mocks.remove).toHaveBeenCalledWith(["studio-1/logo.png"]);
  });
});
