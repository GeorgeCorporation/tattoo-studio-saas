type ErrorLike = {
  code?: string;
  message?: string;
  status?: number;
};

const supabaseCodeMessages: Record<string, string> = {
  "23505": "Este registro ja existe. Confira os dados e tente novamente.",
  "42501": "Voce nao tem permissao para fazer esta acao.",
  PGRST116: "Registro nao encontrado.",
};

function isErrorLike(error: unknown): error is ErrorLike {
  return Boolean(error && typeof error === "object");
}

export function getFriendlyErrorMessage(error: unknown, fallback = "Nao foi possivel concluir a acao.") {
  if (!isErrorLike(error)) return fallback;

  if (error.code && supabaseCodeMessages[error.code]) {
    return supabaseCodeMessages[error.code];
  }

  if (error.status === 401) return "Sessao expirada. Entre novamente.";
  if (error.status === 403) return "Voce nao tem permissao para acessar estes dados.";
  if (error.status === 404) return "Registro nao encontrado.";

  const message = error.message?.toLowerCase() ?? "";

  if (message.includes("failed to fetch") || message.includes("network")) {
    return "Falha de conexao. Verifique sua internet e tente novamente.";
  }

  if (message.includes("jwt") || message.includes("session")) {
    return "Sessao expirada. Entre novamente.";
  }

  if (message.includes("duplicate")) {
    return supabaseCodeMessages["23505"];
  }

  if (message.includes("permission") || message.includes("row-level security")) {
    return supabaseCodeMessages["42501"];
  }

  return fallback;
}
