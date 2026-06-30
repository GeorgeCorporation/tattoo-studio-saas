type LogContext = Record<string, unknown>;

function formatContext(context?: LogContext) {
  return context && Object.keys(context).length ? context : undefined;
}

export const logger = {
  info(message: string, context?: LogContext) {
    if (import.meta.env.DEV) {
      console.info(`[info] ${message}`, formatContext(context) ?? "");
    }
  },

  warn(message: string, context?: LogContext) {
    if (import.meta.env.DEV) {
      console.warn(`[warn] ${message}`, formatContext(context) ?? "");
    }
  },

  error(message: string, error?: unknown, context?: LogContext) {
    if (import.meta.env.DEV) {
      console.error(`[error] ${message}`, error, formatContext(context) ?? "");
      return;
    }

    console.error(`[error] ${message}`);
  },
};
