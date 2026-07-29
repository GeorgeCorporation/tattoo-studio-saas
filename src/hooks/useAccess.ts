import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { UserRole } from "@/lib/access-control";
import { getCurrentUserAccess, type AccessContext } from "@/services/access.service";

type UseAccessOptions = {
  user: User | null;
  authLoading: boolean;
  requiredRole?: UserRole | UserRole[];
};

function roleAllowed(role: UserRole, requiredRole?: UserRole | UserRole[]) {
  if (!requiredRole) return true;
  return Array.isArray(requiredRole) ? requiredRole.includes(role) : role === requiredRole;
}

export function useAccess({ user, authLoading, requiredRole }: UseAccessOptions) {
  const [access, setAccess] = useState<AccessContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAccess = useCallback(async (): Promise<AccessContext | null> => {
    if (!user) {
      logger.info("ONBOARDING_TRACE access.skip.no-user");
      setAccess(null);
      setLoading(false);
      return null;
    }

    try {
      logger.info("ONBOARDING_TRACE access.start", { userId: user.id });
      setLoading(true);
      setError("");

      const resolvedAccess = await getCurrentUserAccess(user.id);
      logger.info("ONBOARDING_TRACE access.resolved", {
        hasAccess: Boolean(resolvedAccess),
        studioId: resolvedAccess?.studioId ?? null,
        role: resolvedAccess?.role ?? null,
      });
      setAccess(resolvedAccess);
      return resolvedAccess;
    } catch (caughtError) {
      logger.error("Falha ao carregar acesso do usuário", caughtError, { userId: user.id });
      setError(getFriendlyErrorMessage(caughtError, "Não foi possível carregar o acesso da conta."));
      setAccess(null);
      return null;
    } finally {
      logger.info("ONBOARDING_TRACE access.finished", { userId: user.id });
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void loadAccess();
  }, [authLoading, loadAccess]);

  return {
    access,
    loading: authLoading || loading,
    error,
    hasStudioAccess: Boolean(access?.studioId),
    hasRequiredRole: access ? roleAllowed(access.role, requiredRole) : false,
    refreshAccess: loadAccess,
  };
}
