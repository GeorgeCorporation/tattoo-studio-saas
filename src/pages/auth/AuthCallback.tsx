import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getUserStudio } from "@/services/onboarding.service";

export function AuthCallback() {
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(window.location.hash.slice(1)), []);
  const errorDescription = params.get("error_description");

  useEffect(() => {
    if (errorDescription) return;

    supabase.auth.getSession().then(async ({ data }) => {
      const user = data.session?.user;

      if (user) {
        const studio = await getUserStudio(user.id);
        navigate(studio ? "/dashboard" : "/onboarding", { replace: true });
        return;
      }

      navigate("/login", { replace: true });
    });
  }, [errorDescription, navigate]);

  if (errorDescription) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 py-10 text-white">
        <section className="w-full max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-6 text-center shadow-2xl shadow-black/30 sm:p-8">
          <p className="text-2xl font-semibold tracking-wide text-white">Ideal Tattoo</p>
          <p className="mt-4 text-sm text-red-400">{errorDescription}</p>
          <p className="mt-3 text-sm text-zinc-400">
            Crie a conta novamente ou use o email de confirmacao mais recente.
          </p>
          <Link
            className="mt-6 inline-flex w-full justify-center rounded-xl bg-[#E8650A] px-4 py-3 font-semibold text-white transition hover:bg-[#ff781c]"
            to="/cadastro"
          >
            Voltar ao cadastro
          </Link>
        </section>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-sm text-zinc-300">
      Confirmando email...
    </div>
  );
}
