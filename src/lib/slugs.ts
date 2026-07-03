import { logSeguranca } from "@/lib/security-logger";

export const SLUGS_RESERVADOS = [
  "admin",
  "api",
  "login",
  "cadastro",
  "dashboard",
  "onboarding",
  "configuracoes",
  "agenda",
  "clientes",
  "tatuadores",
  "servicos",
  "financeiro",
  "galeria",
  "auth",
  "public",
  "static",
  "assets",
  "images",
  "favicon",
  "entrega",
  "entregas",
];

export function isValidPublicSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug);
}

export function isReservedSlug(slug: string) {
  return SLUGS_RESERVADOS.includes(slug);
}

export function assertPublicSlug(slug: string) {
  if (!isValidPublicSlug(slug)) {
    throw new Error("Slug inválido. Use apenas letras minúsculas, números e hífens.");
  }

  if (isReservedSlug(slug)) {
    logSeguranca("SLUG_RESERVADO_TENTADO", { slug });
    throw new Error("Este link público é reservado pelo sistema. Escolha outro.");
  }
}
