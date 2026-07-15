---
name: project
description: Perfil completo do projeto Inkora — stack, versões, comandos, estrutura de diretórios
metadata:
  type: project
---

# Project

## Visão Geral

Inkora é um SaaS para estúdios de tatuagem. Permite criar perfil profissional com página pública, gerenciar agenda, clientes, tatuadores, serviços, financeiro (comissões), galeria, entregas de fotos.

## Stack

| Categoria | Tecnologia | Versão |
|-----------|-----------|--------|
| Framework Frontend | React | 18.3.1 |
| Linguagem | TypeScript | 5.7.2 |
| Build Tool | Vite | 6.0.3 |
| Estilização | Tailwind CSS | 3.4.16 |
| Roteamento | React Router DOM | 6.28.0 |
| Ícones | Lucide React | 0.468.0 |
| Backend/BaaS | Supabase | ^2.50.0 |
| Banco de Dados | PostgreSQL (Supabase) | — |
| Storage | Supabase Storage | — |
| Deploy | Cloudflare Pages | — |
| CI/CD | GitHub Actions | — |
| Test Runner | Vitest | 4.1.9 |
| Testes UI | Testing Library | — |
| Lint | ESLint (flat config) | 10.6.0 |
| Formatter | Prettier | 3.9.4 |
| Runtime | Node.js | 22.x |

## Dependências de Produção (5)

- react, react-dom, react-router-dom, @supabase/supabase-js, lucide-react

## Scripts Essenciais

```bash
npm run dev       # servidor desenvolvimento
npm run build     # build produção (tsc -b && vite build)
npm run test      # vitest run
npm run typecheck # tsc --noEmit
npm run lint      # eslint .
npm run format    # prettier --write .
npm run check     # typecheck + lint + test + build
npm run db:types  # gerar tipos Supabase
```

## Estrutura de Diretórios

```
src/
├── assets/        # SVGs (logo, mark)
├── components/
│   ├── layout/    # DashboardLayout, Sidebar, PrivateRoute
│   ├── shared/    # AppErrorBoundary
│   └── ui/        # VAZIO — componentes base não criados
├── hooks/         # useAuth, useAccess, useDashboard, useArtist
├── lib/           # domínio puro, cliente Supabase, logger, slugs, errors
├── pages/         # 17 páginas organizadas por módulo
├── routes/        # createBrowserRouter único
├── services/      # ~20 services com chamadas Supabase
├── styles/        # global.css
├── test/          # setup.ts
└── types/         # database.types.ts
```

## Funcionamento

- **Manager (dono):** acesso completo a 9 módulos
- **Artist (tatuador):** acesso restrito a 5 módulos
- **Público:** landing page, páginas de estúdio, booking, entregas

## Limitações

- Sem store global (Context/Redux/Zustand)
- Sem cache de queries (React Query/SWR)
- Sem lazy loading (zero React.lazy())
- Sem SSR (SPA 100% client-side)
- Sem migrations versionadas
- Sem componente library própria
- Cores hardcoded (~40 arquivos com bg-[#0f0f0f])

## Riscos

- Bundle inicial inchado (sem code splitting)
- Queries repetidas sem cache entre navegações
- Dependência total de Supabase (vendor lock-in leve)
- Anon key exposta no repositório
