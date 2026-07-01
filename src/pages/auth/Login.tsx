import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getFriendlyAuthErrorMessage, getFriendlyErrorMessage } from "@/lib/errors";
import { supabase } from "@/lib/supabase";

function withTimeout<T>(promise: PromiseLike<T>, ms: number, message: string) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
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
    setLoading(true);

    try {
      const { data, error: signInError } = await signIn({ email, password });

      if (signInError || !data.user) {
        setError(getFriendlyAuthErrorMessage(signInError, "Não foi possível entrar."));
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
          <p className="text-2xl font-semibold tracking-wide text-white">Ideal Tattoo</p>
          <p className="mt-2 text-sm text-zinc-400">Entre para gerenciar seu estúdio</p>
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
