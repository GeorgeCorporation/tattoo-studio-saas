type ErrorLike = {
  code?: string;
  message?: string;
  status?: number;
};

const supabaseCodeMessages: Record<string, string> = {
  "23505": "Este registro já existe. Confira os dados e tente novamente.",
  "42501": "Você não tem permissão para fazer esta ação.",
  PGRST116: "Registro não encontrado.",
};

function isErrorLike(error: unknown): error is ErrorLike {
  return Boolean(error && typeof error === "object");
}

export function getFriendlyErrorMessage(error: unknown, fallback = "Não foi possível concluir a ação.") {
  if (!isErrorLike(error)) return fallback;

  if (error.code && supabaseCodeMessages[error.code]) {
    return supabaseCodeMessages[error.code];
  }

  if (error.status === 401) return "Sessão expirada. Entre novamente.";
  if (error.status === 403) return "Você não tem permissão para acessar estes dados.";
  if (error.status === 404) return "Registro não encontrado.";

  const message = error.message?.toLowerCase() ?? "";

  if (message.includes("failed to fetch") || message.includes("network")) {
    return "Falha de conexão. Verifique sua internet e tente novamente.";
  }

  if (message.includes("jwt") || message.includes("session")) {
    return "Sessão expirada. Entre novamente.";
  }

  if (message.includes("duplicate")) {
    return supabaseCodeMessages["23505"];
  }

  if (message.includes("permission") || message.includes("row-level security")) {
    return supabaseCodeMessages["42501"];
  }

  return fallback;
}
