# CLAUDE.md — Inkora Tattoo Studio SaaS

## Perfil do Projeto

- **Nome:** Inkora
- **Tipo:** SaaS para estúdios de tatuagem
- **Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Supabase + Cloudflare Pages
- **Node:** 22.x (ver .nvmrc)
- **Package manager:** npm

## Comandos Essenciais

```bash
npm run dev        # servidor de desenvolvimento
npm run build      # build de produção (typecheck + bundle)
npm run test       # rodar testes
npm run typecheck  # checagem de tipos
npm run lint       # ESLint
npm run format     # Prettier
npm run check      # pipeline completa (typecheck + lint + test + build)
```

## Estrutura

- **src/pages/** — páginas organizadas por módulo
- **src/services/** — camada de dados (chamadas Supabase)
- **src/hooks/** — hooks customizados (useAuth, useAccess, useDashboard, useArtist)
- **src/lib/** — domínio puro, utilitários, cliente Supabase
- **src/components/layout/** — layouts, sidebar, guards de rota
- **src/types/** — tipos TypeScript do banco e domínio

## Regras

1. Não adicionar dependências sem discussão prévia
2. Manter camadas: Page → Hook → Service → Supabase
3. Testar domínio puro (lib/) antes de integração
4. RLS policies são a única barreira de segurança no banco
5. Cores devem usar variáveis Tailwind, nunca hardcoded
6. Toda query ao Supabase precisa de tratamento de erro
7. Componentes de UI (Input, Button, Modal) devem ficar em components/ui/
8. Barrel files vazios não devem existir
9. Arquivos SQL não pertencem a src/lib/ — usar supabase/migrations/
10. Toda página pública com slug precisa validar slug reservado

## Arquivos de Referência

- [docs/PROJECT_ANALYSIS.md](docs/PROJECT_ANALYSIS.md) — análise completa do projeto
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — arquitetura do sistema
- [docs/ROADMAP.md](docs/ROADMAP.md) — roadmap de evolução
- [docs/DECISIONS.md](docs/DECISIONS.md) — decisões técnicas registradas
- [docs/PROJECT_RULES.md](docs/PROJECT_RULES.md) — regras do projeto
