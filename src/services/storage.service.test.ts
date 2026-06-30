import { describe, expect, it, vi } from "vitest";
import {
  createBookingReferencePath,
  createStoragePath,
  getStoragePathFromPublicUrl,
  safeFileName,
} from "@/services/storage.service";

describe("storage.service", () => {
  it("remove acentos e caracteres inseguros do nome do arquivo", () => {
    expect(safeFileName("logo São João @2026.png")).toBe("logo_Sao_Joao__2026.png");
  });

  it("cria path padrao com studioId na primeira pasta", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-30T12:00:00Z"));

    expect(createStoragePath("studio-1", "foto capa.png")).toBe("studio-1/1782820800000_foto_capa.png");

    vi.useRealTimers();
  });

  it("cria path de artista com artistId depois do studioId", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-30T12:00:00Z"));

    expect(createStoragePath("studio-1", "perfil.jpg", ["artist-1"])).toBe(
      "studio-1/artist-1/1782820800000_perfil.jpg",
    );

    vi.useRealTimers();
  });

  it("cria path de referencia com appointmentId", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-30T12:00:00Z"));

    expect(createBookingReferencePath("studio-1", "appointment-1", "ref 01.jpeg")).toBe(
      "studio-1/appointment-1/1782820800000_ref_01.jpeg",
    );

    vi.useRealTimers();
  });

  it("extrai path da url publica do bucket", () => {
    const url =
      "https://project.supabase.co/storage/v1/object/public/gallery/studio-1/1782820800000_foto.png";

    expect(getStoragePathFromPublicUrl(url, "gallery")).toBe("studio-1/1782820800000_foto.png");
  });
});
