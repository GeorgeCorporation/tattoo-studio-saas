import { logSeguranca } from "@/lib/security-logger";

export type PublicBucket = "artists" | "booking-references" | "client-deliveries" | "gallery" | "logos";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const EXTENSOES_BLOQUEADAS = [".svg", ".exe", ".sh", ".php", ".js", ".html", ".htm", ".xml", ".py", ".rb"];
const TAMANHO_MAXIMO = 5 * 1024 * 1024;

export function safeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "_");
}

export function validateUploadFile(file: File) {
  const lowerName = file.name.toLowerCase();
  const blockedExtension = EXTENSOES_BLOQUEADAS.find((extension) => lowerName.endsWith(extension));

  if (blockedExtension || !TIPOS_PERMITIDOS.includes(file.type)) {
    logSeguranca("UPLOAD_BLOQUEADO", { type: file.type, extension: blockedExtension ?? "desconhecida" });
    throw new Error("Tipo de arquivo não permitido. Envie JPG, PNG, WebP ou GIF.");
  }

  if (file.size > TAMANHO_MAXIMO) {
    logSeguranca("UPLOAD_BLOQUEADO", { type: file.type, size: file.size });
    throw new Error("Arquivo muito grande. Máximo 5MB.");
  }
}

function safeExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
}

function randomFileName(originalName: string) {
  const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${id}.${safeExtension(originalName)}`;
}

export function createStoragePath(studioId: string, fileName: string, parts: string[] = []) {
  const cleanParts = [studioId, ...parts].filter(Boolean);
  return `${cleanParts.join("/")}/${randomFileName(fileName)}`;
}

export function createBookingReferencePath(studioId: string, appointmentId: string, fileName: string) {
  return createStoragePath(studioId, fileName, [appointmentId]);
}

export function getStoragePathFromPublicUrl(url: string, bucket: PublicBucket) {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const [, path] = url.split(marker);
  return path ? decodeURIComponent(path) : null;
}

/**
 * Extrai o path tanto de URL pública quanto de URL assinada.
 *
 * Necessário porque os buckets privados passaram a guardar URL assinada, mas
 * os registros criados antes dessa mudança ainda guardam URL pública. As duas
 * formas precisam continuar sendo apagáveis.
 */
export function getStoragePathFromUrl(url: string, bucket: PublicBucket) {
  const doPublico = getStoragePathFromPublicUrl(url, bucket);
  if (doPublico) return doPublico;

  const marcadorAssinado = `/storage/v1/object/sign/${bucket}/`;
  const [, resto] = url.split(marcadorAssinado);
  if (!resto) return null;

  const [caminho] = resto.split("?");
  return caminho ? decodeURIComponent(caminho) : null;
}

/** Um ano. Entrega de cliente é material que a pessoa volta para rever. */
export const VALIDADE_PADRAO_URL_ASSINADA = 60 * 60 * 24 * 365;

/**
 * Segundos entre agora e `expiresAt`, limitado ao padrão e nunca menor que uma
 * hora — assinar com validade já vencida geraria link morto no ato.
 */
export function validadeAssinaturaAte(expiresAt: string | null | undefined, agora = Date.now()) {
  if (!expiresAt) return VALIDADE_PADRAO_URL_ASSINADA;

  const alvo = Date.parse(expiresAt);
  if (Number.isNaN(alvo)) return VALIDADE_PADRAO_URL_ASSINADA;

  const segundos = Math.floor((alvo - agora) / 1000);
  return Math.min(VALIDADE_PADRAO_URL_ASSINADA, Math.max(60 * 60, segundos));
}
