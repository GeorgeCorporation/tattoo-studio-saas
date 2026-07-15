import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { UserRole } from "@/lib/access-control";
import { getCurrentUserAccess, type AccessContext } from "@/services/access.service";

type UseAccessOptions = {
  requiredRole?: UserRole | UserRole[];
};

function roleAllowed(role: UserRole, requiredRole?: UserRole | UserRole[]) {
  if (!requiredRole) return true;
  return Array.isArray(requiredRole) ? requiredRole.includes(role) : role === requiredRole;
}

export function useAccess(options: UseAccessOptions = {}) {
  const { user, loading: authLoading } = useAuth();
  const [access, setAccess] = useState<AccessContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAccess = useCallback(async () => {
    if (!user) {
      setAccess(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const resolvedAccess = await getCurrentUserAccess(user.id);
      setAccess(resolvedAccess);
    } catch (caughtError) {
      logger.error("Falha ao carregar acesso do usuário", caughtError, { userId: user.id });
      setError(getFriendlyErrorMessage(caughtError, "Não foi possível carregar o acesso da conta."));
      setAccess(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    loadAccess();
  }, [authLoading, loadAccess]);

  return {
    access,
    loading: authLoading || loading,
    error,
    hasStudioAccess: Boolean(access?.studioId),
    hasRequiredRole: access ? roleAllowed(access.role, options.requiredRole) : false,
    refreshAccess: loadAccess,
  };
}
