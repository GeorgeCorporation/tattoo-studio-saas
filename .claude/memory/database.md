---
name: database
description: Schema completo do banco de dados — 14 tabelas, índices, constraints, relacionamentos
metadata:
  type: project
---

# Database

## Visão Geral

PostgreSQL gerenciado pelo Supabase. Schema `public`. 14 tabelas com UUID como PK. Timestamps `created_at` com `default now()`. Todas as tabelas têm `studio_id` como FK — isolamento lógico por estúdio.

## Tabelas

### studios
| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | uuid | PK, gen_random_uuid() |
| user_id | uuid | FK auth.users(id) ON DELETE CASCADE |
| name | text | NOT NULL |
| slug | text | UNIQUE NOT NULL, regex ^[a-z0-9-]+$ |
| logo_url | text | |
| description | text | |
| address | text | |
| city | text | |
| state | text | |
| instagram | text | |
| whatsapp | text | |
| website | text | |
| created_at | timestamptz | default now() |

**Guardrails:** slug_format_check (regex), slug_reserved_check (24 palavras reservadas)

### working_hours
| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | uuid | PK |
| studio_id | uuid | FK studios(id) ON DELETE CASCADE |
| day_of_week | int | CHECK 0-6 |
| open_time | time | |
| close_time | time | |
| is_open | boolean | default true |

### tattoo_artists
| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | uuid | PK |
| studio_id | uuid | FK studios(id) ON DELETE CASCADE |
| name | text | NOT NULL |
| slug | text | UNIQUE(studio_id, slug) |
| photo_url | text | |
| specialty | text | |
| bio | text | |
| instagram | text | |
| whatsapp | text | |
| access_email | text | |
| auth_user_id | uuid | FK auth.users(id) ON DELETE SET NULL |
| is_active | boolean | default true |

**Partial unique indexes:** auth_user_id WHERE NOT NULL, access_email WHERE NOT NULL

### artist_access_invites
| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | uuid | PK |
| studio_id | uuid | FK ON DELETE CASCADE |
| artist_id | uuid | FK tattoo_artists(id) ON DELETE CASCADE, UNIQUE |
| email | text | NOT NULL |
| token | uuid | UNIQUE, default gen_random_uuid() |
| status | text | CHECK pending/accepted/expired/revoked |
| expires_at | timestamptz | default now() + 7 days |

### artist_commission_rules
| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | uuid | PK |
| studio_id | uuid | FK ON DELETE CASCADE |
| artist_id | uuid | FK ON DELETE CASCADE |
| percentage | numeric | NOT NULL, CHECK >= 0 |
| cap_enabled | boolean | default false |
| monthly_cap | numeric | CHECK >= 0 |
| starts_at | date | default current_date |

### services
| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | uuid | PK |
| studio_id | uuid | FK ON DELETE CASCADE |
| name | text | NOT NULL |
| starting_price | numeric | |
| avg_duration_minutes | int | |
| category | text | |
| is_active | boolean | default true |

### clients
| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | uuid | PK |
| studio_id | uuid | FK ON DELETE CASCADE |
| name | text | NOT NULL |
| phone | text | |
| email | text | |
| instagram | text | |
| notes | text | |

**Sem UNIQUE em email ou phone** — mesmo cliente pode ser cadastrado múltiplas vezes.

### appointments
| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | uuid | PK |
| studio_id | uuid | FK ON DELETE CASCADE |
| artist_id | uuid | FK ON DELETE SET NULL |
| client_id | uuid | FK ON DELETE SET NULL |
| service_id | uuid | FK ON DELETE SET NULL |
| date | date | NOT NULL |
| time | time | NOT NULL |
| status | text | CHECK pending/confirmed/cancelled/completed |
| signal_paid | numeric | CHECK >= 0 |
| total_price | numeric | CHECK >= 0 |
| description | text | |
| notes | text | |
| client_source | text | CHECK artist_client/studio_referral |

**Partial unique index:** `appointments_active_slot_unique_idx` on (studio_id, artist_id, date, time) WHERE status IN ('pending','confirmed') — previne dupla reserva

### payments
| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | uuid | PK |
| studio_id | uuid | FK ON DELETE CASCADE |
| appointment_id | uuid | FK ON DELETE SET NULL |
| amount | numeric | NOT NULL, CHECK > 0 |
| type | text | CHECK signal/final/extra |
| method | text | CHECK pix/cash/card |

### payment_commissions
| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | uuid | PK |
| payment_id | uuid | FK ON DELETE CASCADE, UNIQUE (1:1) |
| base_amount | numeric | CHECK >= 0 |
| percentage | numeric | CHECK >= 0 |
| commission_amount | numeric | CHECK >= 0 |
| cap_consumed_amount | numeric | CHECK >= 0 |
| cap_applied | boolean | default false |

### gallery
| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | uuid | PK |
| studio_id | uuid | FK ON DELETE CASCADE |
| artist_id | uuid | FK ON DELETE SET NULL |
| url | text | NOT NULL |
| type | text | default 'photo' |

### reviews
| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | uuid | PK |
| studio_id | uuid | FK ON DELETE CASCADE |
| client_name | text | |
| rating | int | CHECK 1-5 |
| comment | text | |

### appointment_reminders
| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | uuid | PK |
| appointment_id | uuid | FK ON DELETE CASCADE |
| channel | text | CHECK whatsapp |
| scheduled_for | timestamptz | NOT NULL |
| status | text | CHECK pending/sent/failed/cancelled |

**Index:** `appointment_reminders_due_idx` on (status, scheduled_for)

### client_deliveries
| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | uuid | PK |
| client_id | uuid | FK ON DELETE CASCADE |
| token | uuid | UNIQUE, gen_random_uuid() |
| title | text | default 'Fotos da sua tatuagem' |

### client_delivery_photos
| Coluna | Tipo | Restrições |
|--------|------|------------|
| id | uuid | PK |
| delivery_id | uuid | FK ON DELETE CASCADE |
| studio_id | uuid | FK ON DELETE CASCADE |
| url | text | NOT NULL |

## Índices (27 total)

Destaques: appointments_active_slot_unique_idx, tattoo_artists_auth_user_id_unique_idx, tattoo_artists_access_email_unique_idx, appointment_reminders_due_idx, tattoo_artists_slug_studio_idx

## Problemas Identificados

1. **Sem migrations versionadas** — schema em src/lib/database.sql, sem histórico/rollback
2. **access_email sem UNIQUE direta** — partial unique index via trigger (race condition possível)
3. **clients sem UNIQUE em email/phone** — cliente pode ser cadastrado múltiplas vezes
4. **user_id em studios sem índice explícito** — consultas frequentes por user_id
5. **INSERT público permitido via RLS** — clients e appointments aceitam INSERT anon com validações mínimas
