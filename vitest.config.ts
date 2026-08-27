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
    // Worktrees do Git contêm uma cópia inteira do projeto. Sem esta exclusão o
    // Vitest roda a suíte duplicada e estoura os workers.
    exclude: [...configDefaults.exclude, "**/.worktrees/**"],
  },
});
