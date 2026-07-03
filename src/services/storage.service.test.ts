import { describe, expect, it, vi } from "vitest";
import {
  createBookingReferencePath,
  createStoragePath,
  getStoragePathFromPublicUrl,
  safeFileName,
  validateUploadFile,
} from "@/services/storage.service";

const fixedUuid = "00000000-0000-4000-8000-000000000000";

function mockRandomUuid() {
  return vi.spyOn(crypto, "randomUUID").mockReturnValue(fixedUuid as `${string}-${string}-${string}-${string}-${string}`);
}

describe("storage.service", () => {
  it("remove acentos e caracteres inseguros do nome do arquivo", () => {
    expect(safeFileName("logo São João @2026.png")).toBe("logo_Sao_Joao__2026.png");
  });

  it("cria path padrão com studioId na primeira pasta e nome não adivinhável", () => {
    const uuidSpy = mockRandomUuid();

    expect(createStoragePath("studio-1", "foto capa.png")).toBe(`${fixedUuid}.png`.replace(/^/, "studio-1/"));

    uuidSpy.mockRestore();
  });

  it("cria path de artista com artistId depois do studioId", () => {
    const uuidSpy = mockRandomUuid();

    expect(createStoragePath("studio-1", "perfil.jpg", ["artist-1"])).toBe(`studio-1/artist-1/${fixedUuid}.jpg`);

    uuidSpy.mockRestore();
  });

  it("cria path de referência com appointmentId", () => {
    const uuidSpy = mockRandomUuid();

    expect(createBookingReferencePath("studio-1", "appointment-1", "ref 01.jpeg")).toBe(
      `studio-1/appointment-1/${fixedUuid}.jpeg`,
    );

    uuidSpy.mockRestore();
  });

  it("bloqueia uploads inseguros", () => {
    const file = new File(["<svg></svg>"], "icone.svg", { type: "image/svg+xml" });

    expect(() => validateUploadFile(file)).toThrow("Tipo de arquivo não permitido");
  });

  it("bloqueia uploads acima de 5MB", () => {
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "foto.png", { type: "image/png" });

    expect(() => validateUploadFile(file)).toThrow("Arquivo muito grande");
  });

  it("aceita imagem permitida", () => {
    const file = new File(["ok"], "foto.webp", { type: "image/webp" });

    expect(() => validateUploadFile(file)).not.toThrow();
  });

  it("extrai path da url pública do bucket", () => {
    const url = "https://project.supabase.co/storage/v1/object/public/gallery/studio-1/foto.png";

    expect(getStoragePathFromPublicUrl(url, "gallery")).toBe("studio-1/foto.png");
  });
});
