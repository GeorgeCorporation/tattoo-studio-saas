---
name: authentication
description: Fluxo completo de autenticação — login, registro, sessão, rate limit, callback
metadata:
  type: project
---

# Authentication

## Visão Geral

Supabase Auth com email/senha. Sem OAuth social, sem magic link, sem SSO. Sessão gerenciada automaticamente pelo Supabase JS SDK (refresh token automático).

## Funcionamento

### Registro (`/cadastro` → `Register.tsx`)

1. Formulário: nome completo, email, senha (>= 8 caracteres)
2. `signUp({fullName, email, password})` → `supabase.auth.signUp()` com `redirectTo: /auth/callback`
3. Email de confirmação enviado pelo Supabase
4. Navega para `/onboarding` (antes da confirmação)

### Login (`/login` → `Login.tsx`)

1. Formulário: email + senha
2. Rate limit check: 5 tentativas em 15 minutos (localStorage)
3. `supabase.auth.signInWithPassword({email, password})`
4. Sucesso: `getCurrentUserAccess()` → se tem studio → `/dashboard`; senão → `/onboarding`
5. Falha: incrementa contador de falhas, log de segurança ("LOGIN_FALHA")
6. Bloqueio: se >= 5 falhas em 15 min, bloqueia formulário

### Auth Callback (`/auth/callback` → `AuthCallback.tsx`)

1. Lê query params: `error_description`, `invite_token`
2. Se `invite_token`: `acceptArtistInvite(token, user.email)` → `/painel`
3. Senão: `getCurrentUserAccess(user.id, user.email)` → redireciona conforme role

### Logout

`signOut()` → `supabase.auth.signOut()` → redireciona para `/login`

### Artista Convite (`/ativar-tatuador/:token`)

1. `getArtistInviteByToken(token)` (RPC pública)
2. Estados: pending, expired, accepted, revoked
3. Toggle "Criar conta" / "Entrar"
4. Se signup: cria conta → login → `acceptArtistInvite(token, email)` → `/painel`
5. Se signin: login → `acceptArtistInvite(token, email)` → `/painel`

## Padrões Observados

- `import { supabase } from "@/lib/supabase"` para chamadas auth
- `import { logSeguranca } from "@/lib/security-logger"` para eventos de segurança
- `import { getFriendlyAuthErrorMessage } from "@/lib/errors"` para mensagens de erro
- `registrarFalhaLogin()` / `limparBloqueioLogin()` em `Login.tsx`

## Limitações

- **Senha sem requisitos de complexidade** — só >= 8 caracteres (sem maiúscula, número, especial)
- **Rate limit client-side apenas** — não substitui proteção server-side
- **Sem tratamento de sessão expirada** — sem interceptador para 401 nas queries
- **Sem validação de email real** — `normalizeAccessEmail` só trim + lowercase
- **Sem OAuth** — apenas email/senha

## Riscos

- Rate limit client-side pode ser burlado (localStorage)
- Se Supabase Auth ficar indisponível, app inteiro para
- `auth/callback` processa tokens sem assinatura (confia no Supabase)

## Recomendações

- Adicionar validação de complexidade de senha no frontend
- Implementar interceptador de sessão expirada nas queries
- Adicionar validação de formato de email (regex)
- Considerar OAuth (Google/Instagram) para expansão
