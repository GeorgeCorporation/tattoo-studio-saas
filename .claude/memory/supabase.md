---
name: supabase
description: Configuração e uso do Supabase — client, RLS, storage, RPC functions, auth
metadata:
  type: project
---

# Supabase

## Visão Geral

Supabase é o backend completo: PostgreSQL, Auth, Storage, RLS. Comunicação via SDK JS tipado. Sem REST APIs próprias.

## Client (`src/lib/supabase.ts`)

- Singleton do `createClient<Database>(supabaseUrl, supabaseAnonKey)`
- Tipado com `Database` type de `src/types/database.types.ts` (gerado via `npm run db:types`)
- Importado por todos os services: `import { supabase } from "@/lib/supabase"`

## RLS Policies

14 tabelas com RLS ativo. Manager = `auth.uid()` = `studios.user_id`. Artist = via `current_user_artist_id(p_studio_id)`.

| Tabela | SELECT Público | CRUD Manager | SELECT Artist | INSERT Público |
|--------|---------------|-------------|--------------|---------------|
| studios | anon + auth | user_id | — | — |
| working_hours | anon | via studio | — | — |
| tattoo_artists | is_active | via studio | próprio + UPDATE | — |
| artist_access_invites | ❌ | via studio | — | — |
| services | is_active | via studio | — | — |
| clients | ❌ | via studio | via fn | anon (se studio existe) |
| appointments | ❌ | via studio | próprios + UPDATE | anon (com validações) |
| payments | ❌ | via studio | via appt | — |
| gallery | anon | via studio | — | — |
| reviews | anon | via studio | — | — |

**Validações de INSERT público em appointments:**
- Status deve ser 'pending'
- Date > hoje
- Artista deve existir e estar ativo
- Serviço deve existir e estar ativo

## Funções RPC (12)

| Função | Grants | Propósito |
|--------|--------|-----------|
| get_booked_appointment_times | anon, auth | Horários ocupados de um artista |
| update_public_appointment_notes | anon, auth | Atualiza notas de appt (<30min) |
| current_user_artist_id | auth | ID do artista logado |
| get_artist_invite_by_token | anon, auth | Busca convite com dados do studio |
| accept_artist_invite | auth | Fluxo completo de aceite de convite |
| current_user_is_artist_for_appointment | auth | Verifica se user é artista do appt |
| current_user_can_view_client | auth | Verifica se user tem appts com cliente |
| current_user_can_view_delivery | auth | Verifica se user é artista da entrega |
| get_client_delivery_by_token | anon, auth | Dados da entrega via token |
| storage_path_part | anon, auth | Extrai parte do path do storage |
| user_owns_storage_studio | anon, auth | Valida ownership do path |
| valid_public_booking_reference_path | anon, auth | Valida path de upload público |

## Storage Buckets (5)

| Bucket | SELECT | INSERT/DELETE |
|--------|--------|--------------|
| artists | público | auth + ownership validation |
| gallery | público | auth + ownership validation |
| logos | público | auth + ownership validation |
| booking-references | público | auth + path validation |
| client-deliveries | público | auth + ownership validation |

**Validação de Upload:** tipos JPEG/PNG/WebP/GIF, max 5MB, extensões proibidas (.exe, .sh, etc.)

## Auth

- Provedor: Supabase Auth (email/senha)
- Refresh token automático via SDK
- Rate limit client-side: 5 tentativas, 15 min bloqueio (localStorage)
- Convite com token UUID expira em 7 dias

## Limitações

- **Anon key commitada** — pública por design, mas se RLS falhar, dados expostos
- **Supabase free tier:** 2GB banco, 1GB storage, 50k usuários
- **Storage sem CDN otimizado** para imagens
- **Rate limit server-side** não configurado explicitamente
- **Logs de segurança apenas em DEV** (console.warn)

## Padrões de Query

```typescript
// SELECT com join
supabase.from("tabela").select("col1, relacao(col2)").eq("studio_id", id)

// INSERT com retorno
supabase.from("tabela").insert({...}).select("id").single()

// RPC
supabase.rpc("function_name", { param1: "valor" })

// Storage upload
supabase.storage.from("bucket").upload(path, file, { cacheControl: "3600", upsert: false })
```

## Recomendações

- Migrar schema SQL para `supabase/migrations/` versionadas
- Configurar timeout wrapper para queries
- Adicionar rate limit server-side no Supabase
- Revisar RLS policies de INSERT público em clients e appointments
- Segregar ambientes dev/prod no Supabase
