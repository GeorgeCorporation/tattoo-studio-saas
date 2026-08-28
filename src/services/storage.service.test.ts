import { describe, expect, it, vi } from "vitest";
import {
  createBookingReferencePath,
  createStoragePath,
  getStoragePathFromPublicUrl,
  getStoragePathFromUrl,
  VALIDADE_PADRAO_URL_ASSINADA,
  validadeAssinaturaAte,
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

describe("urls assinadas de bucket privado", () => {
  const base = "https://project.supabase.co";

  it("extrai path de url assinada, ignorando o token", () => {
    const url = `${base}/storage/v1/object/sign/client-deliveries/studio-1/entrega-1/foto.png?token=abc.def.ghi`;

    expect(getStoragePathFromUrl(url, "client-deliveries")).toBe("studio-1/entrega-1/foto.png");
  });

  it("continua extraindo path de url publica antiga", () => {
    const url = `${base}/storage/v1/object/public/client-deliveries/studio-1/entrega-1/foto.png`;

    expect(getStoragePathFromUrl(url, "client-deliveries")).toBe("studio-1/entrega-1/foto.png");
  });

  it("devolve null para url de outro bucket", () => {
    const url = `${base}/storage/v1/object/sign/gallery/studio-1/foto.png?token=abc`;

    expect(getStoragePathFromUrl(url, "client-deliveries")).toBeNull();
  });

  it("usa a validade padrao quando a entrega nao expira", () => {
    expect(validadeAssinaturaAte(null)).toBe(VALIDADE_PADRAO_URL_ASSINADA);
    expect(validadeAssinaturaAte(undefined)).toBe(VALIDADE_PADRAO_URL_ASSINADA);
  });

  it("usa a validade padrao quando a data e invalida", () => {
    expect(validadeAssinaturaAte("nao e data")).toBe(VALIDADE_PADRAO_URL_ASSINADA);
  });

  it("encurta a assinatura para acompanhar a expiracao da entrega", () => {
    const agora = Date.parse("2026-08-27T00:00:00.000Z");
    const emTresDias = "2026-08-30T00:00:00.000Z";

    expect(validadeAssinaturaAte(emTresDias, agora)).toBe(60 * 60 * 24 * 3);
  });

  it("nao assina por mais que o padrao, mesmo com expiracao distante", () => {
    const agora = Date.parse("2026-08-27T00:00:00.000Z");

    expect(validadeAssinaturaAte("2040-01-01T00:00:00.000Z", agora)).toBe(VALIDADE_PADRAO_URL_ASSINADA);
  });

  it("garante ao menos uma hora quando a entrega ja expirou", () => {
    const agora = Date.parse("2026-08-27T00:00:00.000Z");

    expect(validadeAssinaturaAte("2026-08-01T00:00:00.000Z", agora)).toBe(60 * 60);
  });
});
