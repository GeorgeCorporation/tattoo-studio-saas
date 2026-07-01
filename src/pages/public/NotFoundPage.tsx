import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-white">
      <section className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#E8650A]">404</p>
        <h1 className="mt-3 text-3xl font-semibold">Página não encontrada</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          O link pode estar incompleto, removido ou ainda não configurado.
        </p>
        <Link className="mt-6 inline-flex rounded-xl bg-[#E8650A] px-5 py-3 font-semibold" to="/">
          Voltar ao inicio
        </Link>
      </section>
    </main>
  );
}
