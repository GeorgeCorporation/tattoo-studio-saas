---
name: services
description: Camada de dados — ~20 services, padrões, responsabilidades, dependências
metadata:
  type: project
---

# Services

## Visão Geral

Camada de dados em `src/services/`. Funções que chamam Supabase e retornam dados tipados. Única camada que importa `supabase` de `@/lib/supabase`. Sem ORM, sem repository pattern.

## Todos os Serviços

| Arquivo | Responsabilidade | Tamanho |
|---------|-----------------|---------|
| `access.service.ts` | Resolver role do usuário (manager/artist) | Pequeno |
| `agenda.service.ts` | CRUD appointments por data, artista | Médio |
| `artist-invites.service.ts` | Gerenciar convites (create, resend, revoke) | Pequeno |
| `artists.service.ts` | CRUD tatuadores + invites + gallery + photos + upload | **440 linhas** |
| `booking.service.ts` | Fluxo booking público (3 etapas + validações) | Médio |
| `clients.service.ts` | CRUD clientes | Médio |
| `dashboard.service.ts` | 6 queries para dashboard | Médio |
| `deliveries.service.ts` | CRUD entregas + fotos | Médio |
| `financial.service.ts` | Pagamentos + comissões + regras + resumo | **Grande** |
| `gallery.service.ts` | CRUD galeria + upload | Médio |
| `onboarding.service.ts` | Criação studio + working_hours + logo + artistas + serviços | **Grande** |
| `public.service.ts` | Dados públicos (studio/artista por slug) | Pequeno |
| `reminders.service.ts` | CRUD lembretes (incompleto, sem integração WhatsApp) | Pequeno |
| `services.service.ts` | CRUD serviços | Pequeno |
| `storage.service.ts` | Upload/download + validação (tipo, tamanho, extensão) | Médio |
| `studio-brand.service.ts` | Marca do estúdio | Pequeno |

## Padrão de Código

```typescript
import { supabase } from "@/lib/supabase";
import type { Tipo } from "@/types";

export async function getItems(studioId: string): Promise<Tipo[]> {
  const { data, error } = await supabase
    .from("tabela")
    .select("col1, col2")
    .eq("studio_id", studioId)
    .returns<Tipo[]>();

  if (error) throw error;
  return data ?? [];
}
```

## Padrões Observados

- Import do cliente Supabase: `import { supabase } from "@/lib/supabase"`
- Retorno tipado: `returns<Tipo[]>()`
- Error handling: `if (error) throw error` (deixa o hook tratar)
- Nomenclatura: `getItems`, `createItem`, `updateItem`, `deleteItem`
- Parâmetros: `studioId` como primeiro parâmetro quando aplicável

## Código Duplicado

- `slugify()` em `artists.service.ts` e `onboarding.service.ts` — idênticas, deveriam estar em `src/lib/slugs.ts`
- `deleteStorageFile` similar em vários services — deveria estar em `storage.service.ts`
- Padrão `validateUploadFile` + `createStoragePath` + upload + `getPublicUrl` repetido

## Limitações

- `artists.service.ts` (440 linhas) — CRUD + invites + gallery + photos + upload
- `onboarding.service.ts` — orquestra 5+ entidades sem rollback transacional
- `financial.service.ts` — cálculo de comissão complexo sem testes extensivos
- `reminders.service.ts` — existe mas sem integração real com WhatsApp API
- **Sem paginação** — getClients, getAppointments sem limit/offset
- **Sem timeout** — apenas login tem `withTimeout()`
- **Queries sem cache** — refeitas em toda navegação

## Recomendações

- Extrair `slugify()` para `src/lib/slugs.ts`
- Fatorar `artists.service.ts` em módulos menores
- Adicionar paginação em listas de clients e appointments
- Adicionar timeout wrapper reutilizável
- Finalizar integração de lembretes (reminders.service.ts)
