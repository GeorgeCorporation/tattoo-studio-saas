import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

type PrivateRouteProps = {
  requireStudio?: boolean;
};

export function PrivateRoute({ requireStudio = true }: PrivateRouteProps) {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [checkingStudio, setCheckingStudio] = useState(requireStudio);
  const [hasStudio, setHasStudio] = useState(false);

  useEffect(() => {
    if (!requireStudio || !user) {
      setCheckingStudio(false);
      return;
    }

    let isMounted = true;
    const userId = user.id;

    async function checkStudio() {
      setCheckingStudio(true);

      const { data, error } = await supabase
        .from("studios")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

      if (!isMounted) return;

      setHasStudio(!error && Boolean(data?.length));
      setCheckingStudio(false);
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

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireStudio && !hasStudio) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
