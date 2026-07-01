import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { supabase } from "@/lib/supabase";

type PrivateRouteProps = {
  requireStudio?: boolean;
};

function withTimeout<T>(promise: PromiseLike<T>, ms: number, message: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

export function PrivateRoute({ requireStudio = true }: PrivateRouteProps) {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [checkingStudio, setCheckingStudio] = useState(requireStudio);
  const [hasStudio, setHasStudio] = useState(false);
  const [routeError, setRouteError] = useState("");

  useEffect(() => {
    if (!requireStudio || !user) {
      setCheckingStudio(false);
      return;
    }

    let isMounted = true;
    const userId = user.id;

    async function checkStudio() {
      setCheckingStudio(true);
      setRouteError("");

      try {
        const { data, error } = await withTimeout(
          supabase
            .from("studios")
            .select("id")
            .eq("user_id", userId)
            .limit(1),
          8000,
          "Tempo limite ao verificar estúdio.",
        );

        if (!isMounted) return;

        if (error) {
          logger.error("Falha ao verificar estúdio na rota privada", error, { userId });
          setRouteError(getFriendlyErrorMessage(error, "Não foi possível verificar seu estúdio."));
          setHasStudio(false);
          return;
        }

        setHasStudio(Boolean(data?.length));
      } catch (caughtError) {
        if (!isMounted) return;
        logger.error("Falha ao verificar estúdio na rota privada", caughtError, { userId });
        setRouteError(getFriendlyErrorMessage(caughtError, "Não foi possível verificar seu estúdio."));
        setHasStudio(false);
      } finally {
        if (isMounted) setCheckingStudio(false);
      }
    }

    checkStudio();

    return () => {
      isMounted = false;
    };
  }, [requireStudio, user]);

  if (loading || checkingStudio) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-sm text-zinc-300">
        Carregando...
      </div>
    );
  }

  if (routeError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-white">
        <section className="w-full max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-6 text-center">
          <h1 className="text-2xl font-semibold">Não foi possível abrir o painel</h1>
          <p className="mt-3 text-sm text-zinc-400">{routeError}</p>
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

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (requireStudio && !hasStudio) {
    return <Navigate replace to="/onboarding" />;
  }

  return <Outlet />;
}
