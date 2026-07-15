---
name: security
description: Segurança em 3 camadas — RLS, PrivateRoute, access service, logs, vulnerabilidades
metadata:
  type: project
---

# Security

## Visão Geral

Segurança em 3 camadas: PrivateRoute (frontend) → Access Service (lógica) → RLS Policies (banco). RLS é a única barreira real. Logs de segurança em DEV.

## 3 Camadas de Proteção

```
1. PrivateRoute — redirect se não autenticado ou role errado
   → Proteção visual apenas (não elimina acesso via API Supabase)

2. Access Service — resolve owner (manager) vs member (artist)
   → Informacional para o frontend

3. RLS Policies — auth.uid() vs studios.user_id
   → ÚNICA camada que realmente protege dados
```

## Rate Limit de Login

- Client-side: 5 tentativas, 15 min bloqueio (localStorage)
- `registrarFalhaLogin()` em `Login.tsx`
- Não substitui proteção server-side

## Convite de Tatuador

- Token UUID gerado via `gen_random_uuid()`
- Expira em 7 dias
- Status: pending → accepted/expired/revoked
- Aceite apenas se email corresponde ao convite
- Partial unique index: 1 convite ativo por artista

## Logs de Segurança

`src/lib/security-logger.ts` — `logSeguranca(evento, dados)`:
- Eventos: LOGIN_FALHA, LOGIN_SUCESSO, ACESSO_NEGADO, UPLOAD_BLOQUEADO, SLUG_RESERVADO_TENTADO
- Dados sensíveis sanitizados
- Apenas em DEV (console.warn)

## Armazenamento de Dados Sensíveis

- `access_email` em texto plano em `tattoo_artists` e `artist_access_invites` (apenas email)
- Senhas gerenciadas pelo Supabase Auth (hash automático)
- Chave anon key pública por design (vai no bundle)

## Storage Security

- 5 buckets com SELECT público
- INSERT/DELETE autenticado com validação de ownership
- Funções RPC: `user_owns_storage_studio`, `valid_public_booking_reference_path`
- Validação de upload: tipos permitidos, max 5MB, extensões proibidas

## Validações

| Validação | Local | O que verifica |
|-----------|-------|---------------|
| Upload de arquivo | storage.service.ts | Tipo, tamanho, extensão |
| Slug | slugs.ts + DB | Regex + reservados |
| Email de convite | artists.service.ts | Conflito antes de upsert |
| Transição de status | appointment-domain.ts | pending→confirmed→completed |
| Booking entity | booking.service.ts | Artista + serviço ativos |
| Booking conflict | booking.service.ts + unique index | Horário não ocupado |

## RLS Policies (Resumo por Tabela)

- Manager = `auth.uid()` = `studios.user_id`
- Artist = via `current_user_artist_id(p_studio_id)`
- Tabelas com INSERT público: `clients`, `appointments` (com validações)
- Tabelas com SELECT público: studios, working_hours, tattoo_artists (is_active), services (is_active), gallery, reviews

## Vulnerabilidades Conhecidas

1. **Mock mode via `?mock=1`** — qualquer usuário ativa (dados reais protegidos por RLS)
2. **INSERT público** — anon key permite criar dados em clients/appointments (validações mínimas)
3. **Senha sem complexidade** — só >= 8 caracteres
4. **Sem validação de email** — `normalizeAccessEmail` só trim + lowercase
5. **Storage público** — URLs acessíveis sem auth (correto para uso, mas requer atenção)
6. **`.env.production` commitado** — mesmas chaves de dev
7. **Logs apenas em DEV** — produção sem rastreamento de segurança
8. **DDoS potential** — criação em massa de bookings via anon key

## Recomendações

- Revisar RLS policies de INSERT público (rate limit + validação adicional)
- Adicionar validação de complexidade de senha
- Segregar ambientes Supabase dev/prod
- Implementar rate limit server-side
- Adicionar produção de logs de segurança
- Validar formato de email (regex) em `normalizeAccessEmail`
