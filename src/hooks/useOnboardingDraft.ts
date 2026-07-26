import { useCallback, useMemo } from "react";

const DRAFT_KEY_PREFIX = "tattoo:onboarding:draft:v3:user:";

export function getOnboardingDraftStorageKey(userId: string) {
  return `${DRAFT_KEY_PREFIX}${encodeURIComponent(userId)}`;
}

export function useOnboardingDraft<T extends object>(userId: string | undefined) {
  const storageKey = useMemo(() => (userId ? getOnboardingDraftStorageKey(userId) : null), [userId]);

  const restore = useCallback((): Partial<T> => {
    if (!storageKey) return {};

    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as Partial<T>) : {};
    } catch {
      return {};
    }
  }, [storageKey]);

  const save = useCallback(
    (draft: T) => {
      if (!storageKey) return;

      try {
        localStorage.setItem(storageKey, JSON.stringify(draft));
      } catch {
        // The onboarding remains usable if browser storage is unavailable.
      }
    },
    [storageKey],
  );

  const clear = useCallback(() => {
    if (!storageKey) return;

    try {
      localStorage.removeItem(storageKey);
    } catch {
      // The studio was already created; failure to clear a local draft is non-blocking.
    }
  }, [storageKey]);

  return { clear, isReady: Boolean(storageKey), restore, save };
}
