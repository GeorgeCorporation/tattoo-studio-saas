import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(currentDir, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    css: true,
    // Credenciais falsas e fixas para a suíte.
    //
    // Sem isto, `supabase.ts` chama createClient(undefined, undefined) no
    // carregamento do módulo e estoura com "supabaseUrl is required" em
    // qualquer ambiente sem `.env` — que é o caso do CI, já que o arquivo é
    // gitignored. Era o motivo de o job de testes falhar desde julho.
    //
    // Também torna a suíte hermética: antes, os testes herdavam o `.env` da
    // máquina e um teste mal isolado podia alcançar o Supabase de produção.
    env: {
      VITE_SUPABASE_URL: "http://localhost:54321",
      VITE_SUPABASE_ANON_KEY: "chave-anon-de-teste",
      VITE_USE_MOCK: "false",
    },
    // Worktrees do Git contêm uma cópia inteira do projeto. Sem esta exclusão o
    // Vitest roda a suíte duplicada e estoura os workers.
    exclude: [...configDefaults.exclude, "**/.worktrees/**"],
    coverage: {
      // Piso, não meta. Fixado logo abaixo da medição de 27/08/2026
      // (71,17 / 61,41 / 68,54 / 74,92) para travar regressão sem quebrar o CI
      // por variação de arredondamento. Subir junto com a cobertura real.
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 67,
        lines: 74,
      },
    },
  },
});
