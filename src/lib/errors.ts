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

export function getFriendlyAuthErrorMessage(error: unknown, fallback = "Não foi possível concluir a autenticação.") {
  if (!isErrorLike(error)) return fallback;

  const message = error.message?.toLowerCase() ?? "";

  if (message.includes("user already registered") || message.includes("already registered")) {
    return "Este email já está cadastrado. Clique em Entrar para acessar sua conta.";
  }

  if (message.includes("invalid login credentials")) {
    return "Email ou senha incorretos. Confira os dados e tente novamente.";
  }

  if (message.includes("email not confirmed")) {
    return "Email ainda não confirmado. Abra seu email e clique no link de confirmação.";
  }

  if (message.includes("email rate limit exceeded") || message.includes("rate limit")) {
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
  }

  if (message.includes("password") && message.includes("weak")) {
    return "Senha fraca. Use pelo menos 8 caracteres e evite senhas muito simples.";
  }

  if (message.includes("signup disabled")) {
    return "Cadastro temporariamente indisponível. Tente novamente mais tarde.";
  }

  return getFriendlyErrorMessage(error, fallback);
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

  if (message.includes("tempo limite")) {
    return "Supabase demorou para responder. Pode ser instabilidade temporária. Recarregue ou tente novamente em alguns minutos.";
  }

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
