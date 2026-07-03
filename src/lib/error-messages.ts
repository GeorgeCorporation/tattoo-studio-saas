import { getFriendlyAuthErrorMessage, getFriendlyErrorMessage } from "@/lib/errors";

export function getErrorMessage(error: unknown, fallback?: string) {
  return getFriendlyErrorMessage(error, fallback);
}

export function getAuthErrorMessage(error: unknown, fallback?: string) {
  return getFriendlyAuthErrorMessage(error, fallback);
}
