# Sprint 01 - Bug 001: cadastro bloqueado ao abrir onboarding

## Causa

O Supabase Auth cria o usuário corretamente. A falha ocorre na primeira resolução de acesso após o redirecionamento para `/onboarding`.

`useAccess` chama `getCurrentUserAccess`. A consulta do estúdio do usuário não falha, mas a consulta seguinte para `public.tattoo_artists` usa `auth_user_id` e `access_email`. O banco remoto não possuía essas colunas nem a tabela `public.artist_access_invites`.

Evidências obtidas no endpoint REST do projeto:

```text
GET /rest/v1/studios?select=id&limit=1
HTTP 200

GET /rest/v1/tattoo_artists?select=id,auth_user_id,access_email&limit=1
HTTP 400
column tattoo_artists.auth_user_id does not exist

GET /rest/v1/artist_access_invites?select=id&limit=1
HTTP 404
Could not find the table 'public.artist_access_invites' in the schema cache
```

Não existe tabela `profiles` nem trigger de criação de profile neste produto. Isso não é a causa: o modelo de manager usa `studios.user_id`, criado somente ao concluir onboarding. Antes disso, o acesso esperado é `null`, não erro.

## Arquivos alterados

- `supabase/config.toml`
- `supabase/migrations/20260714153000_add_artist_access_schema.sql`
- `src/services/access.service.ts`
- `src/hooks/useAccess.ts`
- `src/services/dashboard.service.ts`
- `src/hooks/useDashboard.ts`
- `src/pages/auth/AuthCallback.tsx`
- `src/pages/agenda/AgendaPage.tsx`
- `src/pages/artists/ArtistsPage.tsx`
- `src/pages/clients/ClientsPage.tsx`
- `src/pages/deliveries/DeliveriesPage.tsx`
- `src/pages/financial/FinancialPage.tsx`
- `src/pages/gallery/GalleryPage.tsx`
- `src/pages/services/ServicesPage.tsx`

## Correção realizada

1. Criada migration versionada para alinhar o banco remoto ao código de acesso:
   - adiciona `tattoo_artists.access_email`;
   - adiciona `tattoo_artists.auth_user_id` com FK para `auth.users`;
   - cria índices únicos parciais para os vínculos de identidade;
   - cria `artist_access_invites` e sua policy RLS para managers;
   - cria as RPCs de consulta e aceite de convite;
   - cria `current_user_artist_id` baseado exclusivamente em `auth_user_id`.
2. Removido fallback de autorização por e-mail em `getCurrentUserAccess`.
   - Um artista agora só recebe acesso após a RPC `accept_artist_invite` gravar seu `auth_user_id`.
   - Isso elimina acesso implícito por coincidência de e-mail e torna convite/RPC a única transição de identidade.
3. Registrado `project_id` do Supabase em `supabase/config.toml`, permitindo aplicar migrations via CLI quando houver credencial administrativa.

## Status de aplicação

A correção está versionada no repositório, mas ainda não foi aplicada ao banco remoto. O ambiente local não possui `SUPABASE_ACCESS_TOKEN` nem uma sessão autenticada no Supabase CLI; por isso, `supabase db push --linked` não pode ser executado daqui.

Enquanto a migration não for aplicada, o banco remoto continuará retornando `42703` para `tattoo_artists.auth_user_id` e o onboarding seguirá bloqueado. A aplicação da migration não exige alteração manual de usuários Auth existentes.

## Como reproduzir

1. Usar banco que contém `studios` e `tattoo_artists`, mas não possui `tattoo_artists.auth_user_id`, `tattoo_artists.access_email` ou `artist_access_invites`.
2. Criar conta por `/cadastro` e autenticar.
3. Sistema redireciona para `/onboarding`.
4. `PrivateRoute` monta `useAccess`.
5. `getCurrentUserAccess` consulta `tattoo_artists.auth_user_id`.
6. PostgREST retorna erro `42703`; `useAccess` exibe “Não foi possível carregar o acesso da conta.”

## Como validar

1. Autenticar no Supabase CLI:

```bash
npx supabase login
```

2. Aplicar a migration ao projeto configurado:

```bash
npx supabase db push --linked
```

3. Confirmar schema remoto:

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'tattoo_artists'
  and column_name in ('auth_user_id', 'access_email');

select to_regclass('public.artist_access_invites');
```

4. Criar uma nova conta e concluir login/callback.
5. Confirmar abertura de `/onboarding` sem erro de acesso.
6. Concluir onboarding; confirmar criação de `studios.user_id = auth.uid()` e redirecionamento para `/dashboard`.
7. Criar artista com convite, cadastrar o e-mail convidado e abrir o link de ativação. Confirmar que a RPC grava `tattoo_artists.auth_user_id` e libera somente `/painel`.

## Validação executada

```text
npm run typecheck
PASS

npm run test -- src/services/access.service.test.ts src/services/onboarding.service.test.ts src/services/onboarding.flow.test.ts src/pages/onboarding/OnboardingPage.test.tsx
4 arquivos, 16 testes aprovados
```

`npm run lint` ainda falha por cinco problemas já existentes em `useArtist.ts`, `ArtistModal.tsx`, `ArtistActivationPage.tsx` e `artists.service.ts`. O erro introduzido durante esta correção em `dashboard.service.ts` foi removido; `npm run typecheck` está limpo.
