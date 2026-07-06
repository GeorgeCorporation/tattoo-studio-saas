import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { inkoraLogo } from "@/assets";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { getMockStudio, isMockMode } from "@/lib/mockMode";
import { supabase } from "@/lib/supabase";
import { acceptArtistInvite } from "@/services/artist-invites.service";
import { getCurrentUserAccess } from "@/services/access.service";

export function AuthCallback() {
  const navigate = useNavigate();
  const params = useMemo(() => {
    const url = new URL(window.location.href);
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));

    const merged = new URLSearchParams(url.search);
    hashParams.forEach((value, key) => merged.set(key, value));
    return merged;
  }, []);
  const errorDescription = params.get("error_description");
  const inviteToken = params.get("invite_token");
  const [callbackError, setCallbackError] = useState("");

  useEffect(() => {
    if (errorDescription) return;

    let isMounted = true;

    if (isMockMode) {
      navigate(getMockStudio() ? "/dashboard" : "/onboarding", { replace: true });
      return () => {
        isMounted = false;
      };
    }

    supabase.auth.getSession().then(async ({ data }) => {
      try {
        const user = data.session?.user;

        if (user) {
          if (inviteToken) {
            if (!user.email) {
              throw new Error("Este e-mail nao corresponde ao convite.");
            }
            await acceptArtistInvite(inviteToken, user.email);
            if (isMounted) {
              navigate("/painel", { replace: true });
            }
            return;
          }

          const access = await getCurrentUserAccess(user.id, user.email);
          if (isMounted) {
            navigate(access ? (access.role === "artist" ? "/painel" : "/dashboard") : "/onboarding", {
              replace: true,
            });
          }
          return;
        }

        if (isMounted) navigate("/login", { replace: true });
      } catch (caughtError) {
        logger.error("Falha ao confirmar email", caughtError);
        if (isMounted) {
          setCallbackError(getFriendlyErrorMessage(caughtError, "Não foi possível confirmar seu acesso."));
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [errorDescription, inviteToken, navigate]);

  if (errorDescription) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 py-10 text-white">
        <section className="w-full max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-6 text-center shadow-2xl shadow-black/30 sm:p-8">
          <img alt="Inkora" className="mx-auto h-12 w-auto" src={inkoraLogo} />
          <p className="mt-4 text-sm text-red-400">{errorDescription}</p>
          <p className="mt-3 text-sm text-zinc-400">
            Crie a conta novamente ou use o email de confirmação mais recente.
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

  if (callbackError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 py-10 text-white">
        <section className="w-full max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-6 text-center shadow-2xl shadow-black/30 sm:p-8">
          <img alt="Inkora" className="mx-auto h-12 w-auto" src={inkoraLogo} />
          <p className="mt-4 text-sm text-red-400">{callbackError}</p>
          <Link
            className="mt-6 inline-flex w-full justify-center rounded-xl bg-[#E8650A] px-4 py-3 font-semibold text-white transition hover:bg-[#ff781c]"
            to="/login"
          >
            Voltar ao login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-sm text-zinc-300">
      Confirmando acesso...
    </div>
  );
}
