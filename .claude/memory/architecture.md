---
name: architecture
description: Padrão arquitetural em camadas com dependência unidirecional
metadata:
  type: project
---

# Architecture

## Visão Geral

Arquitetura em camadas com dependência unidirecional. 4 dependências de produção, sem framework CSS, sem store global, sem SSR, sem ORM. Projetada para simplicidade e facilidade de manutenção.

## Diagrama de Camadas

```
Pages (UI/UX)
   ↓ chamam
Hooks (estado + efeitos)
   ↓ chamam
Services (dados + Supabase)
   ↓ chamam
Supabase Client (singleton)
   ↓
Supabase (PostgreSQL + Auth + Storage + RLS)
```

## Funcionamento

1. **Pages** (`src/pages/`) — componentes React organizados por módulo. Cada página importa hooks, nunca services ou supabase diretamente.
2. **Hooks** (`src/hooks/`) — encapsulam estado (useState, useReducer) + efeitos colaterais (useEffect). Importam services para buscar/dados. Retornam `{ data, loading, error, actions }`.
3. **Services** (`src/services/`) — funções que chamam Supabase e retornam dados tipados. Única camada que importa `supabase` de `@/lib/supabase`. Cada service é responsável por um módulo.
4. **Supabase Client** (`src/lib/supabase.ts`) — singleton do cliente Supabase JS com tipagem `Database`.
5. **Domain Logic** (`src/lib/`) — código puro sem dependência React ou Supabase. Testável isoladamente.
6. **Access Control** (`src/lib/access-control.ts`) — definição de roles (manager/artist), sidebar items por role.

## Padrões Utilizados

- **UUID como PK** — `gen_random_uuid()` em todas as tabelas
- **RLS como única barreira de segurança no banco** — policies por tabela com auth.uid()
- **Funções RPC** — 12 funções PostgreSQL para operações complexas
- **Error handling com mensagens amigáveis** — `getFriendlyErrorMessage` em `src/lib/errors.ts`
- **Security logging** — `logSeguranca` em DEV para eventos críticos

## Padrões NÃO Utilizados

- ❌ Context API / Redux / Zustand
- ❌ React Query / SWR
- ❌ ORM (Prisma, Drizzle)
- ❌ Repository Pattern
- ❌ SSR / SSG
- ❌ Injeção de dependência

## Dependências Entre Módulos

- `src/lib/` não depende de `src/hooks/`, `src/services/`, `src/pages/`
- `src/services/` só depende de `src/lib/supabase.ts` e tipos
- `src/hooks/` depende de `src/services/` e React
- `src/pages/` depende de `src/hooks/` e componentes

## Limitações

- **Uso de `any` liberado** — `@typescript-eslint/no-explicit-any: off` no ESLint
- **Sem timeout em queries** — apenas login tem `withTimeout()`
- **Sem tratamento de erro uniforme** — cada página faz try/catch próprio
- **`window.setTimeout` como delay** — em ArtistModal para navegação pós-criação

## Recomendações

- Reativar `no-explicit-any` no ESLint com exceções pontuais
- Criar hook ou utilitário para tratamento de erro uniforme
- Adicionar timeout wrapper reutilizável para queries Supabase
- Mover `slugify()` duplicado de services para `src/lib/slugs.ts`
