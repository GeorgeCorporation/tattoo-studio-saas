---
name: coding-style
description: Padrões de código — nomenclatura, imports, tipos, organização, boas práticas
metadata:
  type: project
---

# Coding Style

## Visão Geral

Projeto segue TypeScript strict mode, React 18 com hooks, Prettier com printWidth 120, ESLint com regras recommended. Padrões observados no código existente.

## Nomenclatura

| Item | Padrão | Exemplo |
|------|--------|---------|
| Arquivos de página | PascalCase + module | `Login.tsx`, `ArtistsPage.tsx` |
| Arquivos de serviço | camelCase + .service | `artists.service.ts` |
| Arquivos de hook | camelCase + use prefix | `useAuth.ts` |
| Arquivos de lib | kebab-case | `access-control.ts` |
| Arquivos de tipo | kebab-case + .types | `database.types.ts` |
| Componentes | PascalCase | `PrivateRoute` |
| Funções | camelCase | `getCurrentUserAccess` |
| Constantes | UPPER_SNAKE | `SLUGS_RESERVADOS` |
| Tipos/Interfaces | PascalCase | `UserRole`, `SidebarItemDefinition` |

## Imports

Ordem observada:
1. React / bibliotecas externas
2. Componentes
3. Hooks
4. Services / lib
5. Tipos
6. Assets / estilos

```typescript
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { Studio } from "@/types";
```

## Tipos

- Tipos de banco: `src/types/database.types.ts` (gerado via `npm run db:types`)
- Tipos de domínio: `src/lib/access-control.ts` (UserRole, SidebarItemDefinition)
- `returns<T>()` usado em todas as queries Supabase

## Organização de Arquivos

- 1 componente por arquivo (export nomeado)
- Hook + types + constantes no mesmo arquivo (quando pequeno)
- Serviço agrupa funções relacionadas ao mesmo módulo

## Tratamento de Erros

```typescript
// Padrão em services
if (error) throw error;

// Padrão em páginas (varia por página)
const { data } = await getSomething();
// ou try/catch com setError

// Mensagens amigáveis
import { getFriendlyErrorMessage } from "@/lib/errors";
const message = getFriendlyErrorMessage(error);
```

## Padrões Específicos do Projeto

- **Cores:** sempre usar classes Tailwind, nunca cores hardcoded (regra 5)
- **Camadas:** Page chama Hook, Hook chama Service, Service chama Supabase (regra 2)
- **Testes:** domínio puro primeiro, depois integração (regra 3)
- **Segurança:** confiar no RLS, não no frontend (regra 4)

## ESLint Config Atual

- Base: `@eslint/js` recommended + `typescript-eslint` recommended
- `@typescript-eslint/no-explicit-any`: **off** (permite any — débito técnico)
- `react-refresh/only-export-components`: off
- Múltiplas regras `react-hooks` desligadas
- Ignora: dist, node_modules, coverage, *.config.*

## Prettier Config

- printWidth: 120, tabWidth: 2, semi: true
- singleQuote: false (aspas duplas)
- trailingComma: all

## Limitações

- **`any` liberado** — perde segurança de tipo (deve ser reativado)
- **Regras react-hooks desligadas** — pode deixar passar bugs de hooks
- **Sem barrel files consistentes** — alguns existem vazios, outros não existem
- **Sem script de lint:fix dedicado** — format cuida de prettier, lint só reporta

## Recomendações

- Reativar `@typescript-eslint/no-explicit-any` com exceções
- Reativar regras react-hooks (exhaustive-deps, rules-of-hooks)
- Remover barrel files vazios (`src/components/ui/index.ts`, `src/pages/index.ts`, etc.)
- Adicionar script `lint:fix` para auto-fix
