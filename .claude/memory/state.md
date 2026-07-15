---
name: state
description: Gerenciamento de estado — local apenas, sem store global
metadata:
  type: project
---

# State

## Visão Geral

Zero state management global. Estado mantido localmente nos componentes e hooks via `useState`/`useReducer`. Sem Context API, Redux, Zustand.

## Funcionamento

### Estado Local em Hooks

Cada hook mantém seu próprio estado:

```typescript
// Padrão típico
const [data, setData] = useState<T | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### Estado em Páginas

Páginas usam hooks para obter dados. Estado de UI local (modais abertos, formulários) é `useState` dentro da página.

```typescript
// Padrão típico em página
const [isModalOpen, setIsModalOpen] = useState(false);
const { data, loading, error } = useSomeHook();
```

### Sidebar

Estado da sidebar (items por role) calculado diretamente na renderização sem `useMemo`. Sidebar expandida/recolhida é estado local.

### Onboarding

5 etapas com estado local + rascunho em localStorage:

```typescript
// localStorage key
const DRAFT_KEY = "tattoo:onboarding:draft:v2";
// Snapshot salvo a cada mudança de etapa
localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
```

### Mock Mode

Estado booleano ativado por query param: `?mock=1`. Verificado em `src/lib/mockMode.ts`.

## Padrões Observados

- Hook → service: dados fluem unidirecionalmente
- Página → hook: página consome estado do hook
- Sem prop drilling significativo (hooks resolvem)
- Sem estado compartilhado entre páginas (cada página refaz queries)

## Limitações

- **Sem cache de queries** — navegar para página A, voltar para página B, refaz todas as queries
- **Sem mutations otimistas** — toda ação espera round-trip do Supabase
- **Sem estado global** — informação como "estúdio atual" e "role" precisam ser resolvidas em cada hook
- **Sem deduplicação** — mesmo hook usado em 2 componentes faz 2 chamadas
- **Sem persistência** — apenas onboarding salva rascunho (localStorage)

## Recomendações

- Adicionar React Query ou TanStack Query para cache + deduplicação
- Implementar mutations otimistas para ações frequentes (criar appointment, atualizar status)
- Considerar Context API para dados de sessão (user, studio, role) que são usados globalmente
- Implementar stale-while-revalidate para queries de dashboard
