export type EventoSeguranca =
  | "LOGIN_SUCESSO"
  | "LOGIN_FALHA"
  | "LOGIN_BLOQUEADO"
  | "LOGOUT"
  | "TENTATIVA_ACESSO_NEGADO"
  | "UPLOAD_BLOQUEADO"
  | "SLUG_RESERVADO_TENTADO";

function sanitizeDetails(detalhes?: Record<string, unknown>) {
  if (!detalhes) return undefined;

  return Object.fromEntries(
    Object.entries(detalhes).filter(([key]) => !/token|senha|password|jwt|secret|key/i.test(key)),
  );
}

export function logSeguranca(evento: EventoSeguranca, detalhes?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.warn("[SEGURANCA]", evento, sanitizeDetails(detalhes));
  }
}
