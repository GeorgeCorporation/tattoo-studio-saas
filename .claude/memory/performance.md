---
name: performance
description: Performance — bundle, queries, lazy loading ausente, renderização, gargalos
metadata:
  type: project
---

# Performance

## Visão Geral

Performance é o maior gap técnico do projeto. Zero code splitting, zero cache, zero lazy loading. Bundle inicial inclui todo o código.

## Bundle

- **Code splitting:** ❌ Zero — nenhum `React.lazy()`
- **Bundle inicial inclui:** todas as 17 páginas, todos os modais, todas as páginas públicas
- **Estimativa:** 200-400KB JS (gzipped ~60-100KB) para funcionalidade básica

## Queries Repetidas

| Query | Chamada em | Problema |
|-------|-----------|---------|
| `getCurrentUserStudio()` | Login, useDashboard, useAccess | 3+ chamadas na inicialização |
| `getArtists(studioId)` | ArtistsPage, ArtistModal, AgendaPage | Sem cache entre páginas |
| `getClients(studioId)` | ClientsPage, ClientModal, AgendaPage | Repetida ao navegar |
| `getSetupStatus(studioId)` | Dashboard | Chamada em toda visita |

## Gargalos de Renderização

1. **AgendaPage** — carrega appointments do dia sem paginação
2. **FinancialPage** — pagamentos + comissões + resumo + regras em queries separadas
3. **Dashboard** — 6+ queries simultâneas sem estado de loading granular
4. **Sidebar** — itens recalculados em toda renderização (sem `useMemo`)
5. **Inputs** — múltiplos `onChange` sem debounce

## Lazy Loading

**Totalmente ausente:**
- ❌ `React.lazy()` para páginas
- ❌ `<Suspense>` para fallbacks
- ❌ `loading="lazy"` em imagens
- ❌ IntersectionObserver para lazy loading de imagens

## Cache

**Totalmente ausente:**
- ❌ React Query / TanStack Query / SWR
- ❌ Cache manual em memória
- ❌ Stale-while-revalidate
- ❌ Prefetching de dados

## Otimizações Ausentes

- ❌ Mutations otimistas — toda ação espera round-trip
- ❌ `useMemo`/`useCallback` — sidebar, handlers de onChange
- ❌ Debounce em inputs de busca
- ❌ Paginação em listas (clients, appointments)
- ❌ Timeout em queries (exceto login)

## Limitações de Infraestrutura

- Supabase free tier: 2GB banco, 1GB storage
- Storage sem CDN otimizado para imagens
- Sem monitoramento de performance

## Recomendações

### Imediatas (Alto Impacto)

1. React.lazy() em todas as páginas + Suspense
2. Adicionar timeout wrapper para queries Supabase
3. Debounce em inputs de busca
4. useMemo nos itens de sidebar

### Médio Prazo

5. React Query para cache + deduplicação de queries
6. Paginação em clients e appointments
7. loading="lazy" em imagens de galeria
8. Mutations otimistas para ações frequentes

### Longo Prazo

9. Performance budget (limitar tamanho do bundle)
10. Monitoramento real (não só console.warn)
11. Service worker para cache offline
12. Image CDN (Cloudflare Images ou Supabase Image Transformation)
