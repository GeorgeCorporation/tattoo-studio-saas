import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

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

    const { data, error: signInError } = await signIn({ email, password });

    if (signInError || !data.user) {
      setError(signInError?.message ?? "Não foi possível entrar.");
      setLoading(false);
      return;
    }

    const { data: studios, error: studioError } = await supabase
      .from("studios")
      .select("id")
      .eq("user_id", data.user.id)
      .limit(1);

    setLoading(false);

    if (studioError || !studios?.length) {
      navigate("/onboarding", { replace: true });
      return;
    }

    navigate("/dashboard", { replace: true });
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
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-[#E8650A] focus:ring-2 focus:ring-[#E8650A]/30"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-200">Senha</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-[#E8650A] focus:ring-2 focus:ring-[#E8650A]/30"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            className="w-full rounded-xl bg-[#E8650A] px-4 py-3 font-semibold text-white transition hover:bg-[#ff781c] disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={loading}
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
