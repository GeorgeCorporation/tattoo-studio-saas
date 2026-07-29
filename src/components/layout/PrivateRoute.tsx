import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAccess } from "@/hooks/useAccess";
import type { UserRole } from "@/lib/access-control";
import { logger } from "@/lib/logger";
import type { AccessContext } from "@/services/access.service";

export type PrivateRouteOutletContext = {
  access: AccessContext | null;
  refreshAccess: () => Promise<AccessContext | null>;
};

type PrivateRouteProps = {
  requireStudio?: boolean;
  requiredRole?: UserRole | UserRole[];
};

export function PrivateRoute({ requireStudio = true, requiredRole }: PrivateRouteProps) {
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const { access, loading: accessLoading, error, hasRequiredRole, refreshAccess } = useAccess({ user, authLoading, requiredRole });

  useEffect(() => {
    logger.info("ONBOARDING_TRACE private-route.state", {
      pathname: location.pathname,
      requireStudio,
      requiredRole: requiredRole ?? null,
      authLoading,
      hasUser: Boolean(user),
      accessLoading,
      studioId: access?.studioId ?? null,
      hasError: Boolean(error),
      hasRequiredRole,
    });
  }, [access?.studioId, accessLoading, authLoading, error, hasRequiredRole, location.pathname, requireStudio, requiredRole, user]);

  if (authLoading || (user && accessLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-sm text-zinc-300">
        Carregando...
      </div>
    );
  }

  if (!user) {
    logger.info("ONBOARDING_TRACE private-route.redirect-login", { pathname: location.pathname });
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-white">
        <section className="w-full max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-6 text-center">
          <h1 className="text-2xl font-semibold">Não foi possível abrir esta área</h1>
          <p className="mt-3 text-sm text-zinc-400">{error}</p>
          <button
            className="mt-6 rounded-xl bg-[#E8650A] px-5 py-3 font-semibold"
            onClick={() => window.location.reload()}
            type="button"
          >
            Tentar novamente
          </button>
        </section>
      </main>
    );
  }

  if (requireStudio && !access?.studioId) {
    logger.info("ONBOARDING_TRACE private-route.redirect-onboarding", {
      pathname: location.pathname,
      accessLoading,
    });
    return <Navigate replace to="/onboarding" />;
  }

  if (!requireStudio && access?.role === "artist" && location.pathname === "/onboarding") {
    logger.info("ONBOARDING_TRACE private-route.redirect-artist", { pathname: location.pathname });
    return <Navigate replace to="/painel" />;
  }

  if (requiredRole && !hasRequiredRole) {
    logger.info("ONBOARDING_TRACE private-route.redirect-role", {
      pathname: location.pathname,
      role: access?.role ?? null,
    });
    return <Navigate replace to={access?.role === "artist" ? "/painel" : "/dashboard"} />;
  }

  return <Outlet context={{ access, refreshAccess } satisfies PrivateRouteOutletContext} />;
}
