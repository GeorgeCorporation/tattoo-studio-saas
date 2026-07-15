---
name: deployment
description: Deploy e CI/CD — Cloudflare Pages, GitHub Actions, wrangler
metadata:
  type: project
---

# Deployment

## Visão Geral

Deploy no Cloudflare Pages via GitHub Actions. CI completo com 5 jobs paralelos. Wrangler configurado para SPA fallback e observability.

## Cloudflare Pages

**Arquivo:** `wrangler.jsonc`

```json
{
  "name": "tattoo-studio-saas",
  "compatibility_date": "2026-06-28",
  "observability": { "enabled": true },
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  },
  "flags": ["nodejs_compat"],
  "vars": {
    "VITE_SUPABASE_URL": "@vite-supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@vite-supabase-anon-key"
  }
}
```

- **Build output:** `./dist` (gerado por `npm run build`)
- **SPA fallback:** todas as rotas servem `index.html`
- **Observability:** habilitado para monitoramento de erros
- **Node.js compatibility:** `nodejs_compat` flag

## CI/CD (GitHub Actions)

**Arquivo:** `.github/workflows/ci.yml`

- **Trigger:** push/PR para `main`
- **Runner:** ubuntu-latest, Node 22
- **5 jobs paralelos:**
  1. `typecheck` — `tsc --noEmit`
  2. `lint` — `eslint .`
  3. `test` — `vitest run` com cobertura
  4. `build` — `tsc -b && vite build`
  5. `audit` — `npm audit` (severidade high+)

## Pipeline de Build

1. `npm ci` — instala dependências (limpas)
2. `tsc -b && vite build` — typecheck + bundle
3. Cloudflare Pages deploy — via GitHub integration (não via wrangler CLI)

## Variáveis de Ambiente no Deploy

- `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` definidas no wrangler.jsonc
- Valores referenciam secrets do Cloudflare: `@vite-supabase-url`, `@vite-supabase-anon-key`

## Limitações

- **Sem preview deployments** — PRs não geram URLs de preview
- **Sem staging environment** — apenas produção
- **Sem rollback automatizado** — reverter requer deploy manual de commit anterior
- **Sem teste de integração pós-deploy** — smoke test ausente
- **`npm audit` faila em high+** — pode bloquear deploy por vulnerabilidades não relacionadas

## Recomendações

- Adicionar preview deployments para PRs (Cloudflare Pages suporta)
- Criar staging environment para testes antes de produção
- Adicionar smoke test pós-deploy (curl para verificar se SPA carrega)
- Substituir npm audit por análise mais seletiva (apenas vulnerabilidades do runtime)
