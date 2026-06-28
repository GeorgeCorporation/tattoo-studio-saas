import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas nao conferem.");
      return;
    }

    setLoading(true);

    const { error: signUpError } = await signUp({ fullName, email, password });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    navigate("/onboarding", { replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-6 shadow-2xl shadow-black/30 sm:p-8">
        <div className="mb-8 text-center">
          <p className="text-2xl font-semibold tracking-wide text-white">Ideal Tattoo</p>
          <p className="mt-2 text-sm text-zinc-400">Crie sua conta gratis</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-200">Nome completo</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-[#E8650A] focus:ring-2 focus:ring-[#E8650A]/30"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              required
            />
          </label>

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
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-200">Confirmar senha</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition focus:border-[#E8650A] focus:ring-2 focus:ring-[#E8650A]/30"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            className="w-full rounded-xl bg-[#E8650A] px-4 py-3 font-semibold text-white transition hover:bg-[#ff781c] disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={loading}
          >
            {loading ? "Criando..." : "Criar conta gratis"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Ja tem conta?{" "}
          <Link className="font-medium text-[#E8650A] hover:text-[#ff9a4f]" to="/login">
            Entrar
          </Link>
        </p>
      </section>
    </main>
  );
}
