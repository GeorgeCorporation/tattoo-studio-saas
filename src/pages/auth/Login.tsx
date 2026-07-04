import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { inkoraLogo } from "@/assets";
import { useAuth } from "@/hooks/useAuth";
import { getFriendlyAuthErrorMessage, getFriendlyErrorMessage } from "@/lib/errors";
import { getMockStudio, isMockMode } from "@/lib/mockMode";
import { logSeguranca } from "@/lib/security-logger";
import { supabase } from "@/lib/supabase";

const MAX_TENTATIVAS = 5;
const BLOQUEIO_MINUTOS = 15;
const LOGIN_TENTATIVAS_KEY = "login_tentativas";
const LOGIN_BLOQUEADO_ATE_KEY = "login_bloqueado_ate";

function withTimeout<T>(promise: PromiseLike<T>, ms: number, message: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

function getLoginTentativas() {
  return Number(window.localStorage.getItem(LOGIN_TENTATIVAS_KEY) ?? "0");
}

function getBloqueioRestanteMinutos() {
  const bloqueadoAte = window.localStorage.getItem(LOGIN_BLOQUEADO_ATE_KEY);
  if (!bloqueadoAte) return 0;

  const restante = new Date(bloqueadoAte).getTime() - Date.now();
  return restante > 0 ? Math.ceil(restante / 60000) : 0;
}

function registrarFalhaLogin() {
  const tentativas = getLoginTentativas() + 1;
  window.localStorage.setItem(LOGIN_TENTATIVAS_KEY, String(tentativas));
  logSeguranca("LOGIN_FALHA", { tentativa: tentativas });

  if (tentativas >= MAX_TENTATIVAS) {
    const bloqueadoAte = new Date(Date.now() + BLOQUEIO_MINUTOS * 60000).toISOString();
    window.localStorage.setItem(LOGIN_BLOQUEADO_ATE_KEY, bloqueadoAte);
    logSeguranca("LOGIN_BLOQUEADO", { tentativas });
  }

  return tentativas;
}

function limparBloqueioLogin() {
  window.localStorage.removeItem(LOGIN_TENTATIVAS_KEY);
  window.localStorage.removeItem(LOGIN_BLOQUEADO_ATE_KEY);
}

export function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const bloqueioRestante = getBloqueioRestanteMinutos();
    if (bloqueioRestante > 0) {
      logSeguranca("LOGIN_BLOQUEADO", { minutos: bloqueioRestante });
      setError(`Muitas tentativas. Aguarde ${bloqueioRestante} minuto(s) e tente novamente.`);
      return;
    }

    setLoading(true);

    try {
      const { data, error: signInError } = await signIn({ email, password });

      if (signInError || !data.user) {
        const tentativas = registrarFalhaLogin();
        if (tentativas >= MAX_TENTATIVAS) {
          setError(`Muitas tentativas. Aguarde ${BLOQUEIO_MINUTOS} minutos e tente novamente.`);
          return;
        }
        setError(getFriendlyAuthErrorMessage(signInError, "Não foi possível entrar."));
        return;
      }

      limparBloqueioLogin();
      logSeguranca("LOGIN_SUCESSO");

      if (isMockMode) {
        navigate(getMockStudio() ? "/dashboard" : "/onboarding", { replace: true });
        return;
      }

      const { data: studios, error: studioError } = await withTimeout(
        supabase
          .from("studios")
          .select("id")
          .eq("user_id", data.user.id)
          .limit(1),
        8000,
        "Tempo limite ao verificar estúdio.",
      );

      if (studioError || !studios?.length) {
        navigate("/onboarding", { replace: true });
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (caughtError) {
      setError(getFriendlyErrorMessage(caughtError, "Não foi possível verificar sua conta agora."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="mb-8 text-center">
          <img alt="Inkora" className="mx-auto h-12 w-auto" src={inkoraLogo} />
          <p className="mt-3 text-sm text-zinc-400">Entre para gerenciar seu estúdio com uma plataforma profissional.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-200">Email</span>
            <input
              autoComplete="email"
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-[#E8650A] focus:ring-2 focus:ring-[#E8650A]/30"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-200">Senha</span>
            <input
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-[#E8650A] focus:ring-2 focus:ring-[#E8650A]/30"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            className="w-full rounded-xl bg-[#E8650A] px-4 py-3 font-semibold text-white transition hover:bg-[#ff781c] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
            type="submit"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Ainda não tem conta?{" "}
          <Link className="font-medium text-[#E8650A] hover:text-[#ff9a4f]" to="/cadastro">
            Criar conta
          </Link>
        </p>
      </section>
    </main>
  );
}
