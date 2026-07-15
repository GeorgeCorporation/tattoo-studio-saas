---
name: backend
description: Backend via Supabase — PostgreSQL, RLS, RPC functions, services layer
metadata:
  type: project
---

# Backend

## Visão Geral

Não existe servidor próprio. Backend é inteiramente Supabase: PostgreSQL + Auth + Storage + RLS. Comunicação direta via Supabase JS SDK tipado.

## Funcionamento

- **Database:** PostgreSQL gerenciado pelo Supabase
- **Schema:** `public` com 14 tabelas
- **Auth:** Supabase Auth (email/senha), refresh automático
- **Storage:** 5 buckets públicos com RLS para upload
- **RLS:** Row-Level Security como única barreira de autorização no banco
- **RPC:** 12 funções PostgreSQL para operações complexas

## Services Layer (`src/services/`)

Camada de dados do frontend. Cada service corresponde a um módulo:

| Service | Responsabilidade |
|---------|-----------------|
| access.service.ts | Resolver role do usuário (manager/artist) |
| agenda.service.ts | CRUD appointments por data/artista |
| artist-invites.service.ts | Gerenciar convites de tatuador |
| artists.service.ts | CRUD tatuadores + invites + gallery (440 linhas) |
| booking.service.ts | Fluxo público de agendamento (3 etapas) |
| clients.service.ts | CRUD clientes |
| dashboard.service.ts | Dados do dashboard (6 queries) |
| deliveries.service.ts | CRUD entregas de fotos |
| financial.service.ts | Pagamentos + comissões + relatórios |
| gallery.service.ts | CRUD galeria de fotos |
| onboarding.service.ts | Criação de estúdio (5+ entidades) |
| public.service.ts | Dados públicos (estúdio, artista por slug) |
| reminders.service.ts | Lembretes de agendamento (incompleto) |
| services.service.ts | CRUD serviços |
| storage.service.ts | Upload/download arquivos com validação |
| studio-brand.service.ts | Marca do estúdio |

## Padrão de Código em Services

```typescript
import { supabase } from "@/lib/supabase";

export async function getItems(studioId: string) {
  const { data, error } = await supabase
    .from("tabela")
    .select("col1, col2")
    .eq("studio_id", studioId)
    .returns<Tipo[]>();

  if (error) throw error;
  return data;
}
```

## Dependências

- `@supabase/supabase-js` ^2.50.0
- PostgreSQL (gerenciado)
- Funções RPC para operações que exigem lógica server-side

## Limitações

- **Sem migrations versionadas** — schema em `src/lib/database.sql` (1346 linhas)
- **Sem REST APIs próprias** — tudo via Supabase JS SDK
- **Sem timeout em queries** — apenas login tem proteção
- **Sem paginação** — getClients, getAppointmentsByDate sem limit/offset
- **`onboarding.service.ts` sem rollback transacional** — estado inconsistente em falha
- **`artists.service.ts` grande demais** — 440 linhas, múltiplas responsabilidades
- **`financial.service.ts` denso** — cálculo de comissão, regras, relatórios

## Recomendações

- Criar migrations versionadas em `supabase/migrations/`
- Adicionar timeout wrapper reutilizável para queries
- Implementar paginação em listas de clients e appointments
- Extrair `slugify()` para `src/lib/slugs.ts`
- Fatorar `artists.service.ts` em CRUD + invites + gallery
- Fatorar `onboarding.service.ts` com rollback transacional
