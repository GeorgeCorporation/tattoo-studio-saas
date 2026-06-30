import { Component, type ErrorInfo, type ReactNode } from "react";
import { logger } from "@/lib/logger";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error("Erro inesperado no app", error, { componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-white">
          <section className="max-w-md rounded-xl border border-white/10 bg-[#1a1a1a] p-6 text-center">
            <p className="text-2xl font-semibold">Algo saiu do esperado</p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Recarregue a pagina. Se continuar, tente sair e entrar novamente.
            </p>
            <button
              className="mt-6 rounded-xl bg-[#E8650A] px-5 py-3 font-semibold"
              onClick={() => window.location.reload()}
              type="button"
            >
              Recarregar
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
