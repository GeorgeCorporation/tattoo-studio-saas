---
name: hooks
description: Hooks customizados — useAuth, useAccess, useDashboard, useArtist
metadata:
  type: project
---

# Hooks

## Visão Geral

4 hooks customizados em `src/hooks/`. Camada intermediária entre páginas e services. Encapsulam estado + efeitos colaterais. Sem store global.

## Hooks

### useAuth

**Arquivo:** `src/hooks/useAuth.ts`
**Estado retornado:** `{ user, loading, error, signIn, signUp, signOut }`

Funcionamento:
- Mantém estado do usuário autenticado via `supabase.auth.getSession()` e `onAuthStateChange`
- `signIn(email, password)` → valida rate limit → `supabase.auth.signInWithPassword` → resolve studio/onboarding
- `signUp(fullName, email, password)` → `supabase.auth.signUp` com redirectTo
- `signOut()` → `supabase.auth.signOut()`
- Usado por: `PrivateRoute`, páginas de auth

### useAccess

**Arquivo:** `src/hooks/useAccess.ts`
**Estado retornado:** `{ studio, role, access, loading, error }`

Funcionamento:
- Escuta mudanças no user (useAuth)
- `getCurrentUserAccess(user.id, user.email)` do `access.service.ts`
- Resolve role: manager (dono do studio) vs artist (tatuador convidado)

### useDashboard

**Arquivo:** `src/hooks/useDashboard.ts`
**Estado retornado:** `{ setupStatus, summary, todayAppointments, weekAppointments, revenue, clients, nextAppointments, loading }`

Funcionamento:
- 6 queries simultâneas: setup status, summary cards, today, week, revenue, clients
- Usado por: `Dashboard.tsx`

### useArtist

**Arquivo:** `src/hooks/useArtist.ts`
**Estado retornado:** `{ artist, loading, error }`

Funcionamento:
- Busca artista por ID ou por slug
- Hook monolítico: perfil + galeria + appointments + invites
- Usado por: `ArtistProfile`, `ArtistPage`

## Padrões Observados

- Hooks retornam `{ data, loading, error, actions }` (quando aplicável)
- Hooks chamam services, nunca Supabase diretamente
- useAuth e useAccess são hooks globais (usados em PrivateRoute)
- useDashboard e useArtist são hooks de página específica

## Limitações

- **0 testes de hook** — nenhum dos 4 hooks tem teste
- **useArtist monolítico** — perfil + galeria + appointments + invites em 1 hook
- **useDashboard carrega tudo de uma vez** — 6 queries sem estado de loading granular
- **Sem cache** — cada montagem refaz todas as queries
- **Sem abort controller** — hooks não cancelam queries ao desmontar

## Recomendações

- Escrever testes para useAuth e useAccess (críticos)
- Quebrar useArtist em hooks menores ou usar composição
- Adicionar estados de loading granular no useDashboard
- Adicionar abort controller para cancelar queries em desmontagem
- Considerar React Query para cache e deduplicação
