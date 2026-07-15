---
name: authorization
description: Controle de acesso — Manager vs Artist, PrivateRoute, Access Service, sidebar por role
metadata:
  type: project
---

# Authorization

## Visão Geral

Dois papéis de usuário: **manager** (dono do estúdio) e **artist** (tatuador convidado). Três camadas de proteção: frontend (PrivateRoute), lógica (Access Service), banco (RLS).

## Funcionamento

### Roles

```typescript
export const userRoles = ["manager", "artist"] as const;
export type UserRole = (typeof userRoles)[number];
```

Definido em `src/lib/access-control.ts`. Manager tem 9 módulos na sidebar, artist tem 5.

### PrivateRoute (guarda)

`src/components/layout/PrivateRoute.tsx`:
1. `useAuth()` loading? → spinner
2. Sem user? → redirect `/login`
3. Erro de acesso? → tela de erro + "Tentar novamente"
4. Sem studio? → redirect `/onboarding` (se `requireStudio` é true)
5. Tem studio mas role errado? → redirect conforme role atual
6. OK → renderiza filhos (Outlet)

Props: `requiredRole?: "manager" | "artist"`, `requireStudio?: boolean`

### Access Service

`src/services/access.service.ts` → `getCurrentUserAccess(userId, email)`:
1. Busca studio onde `user_id = userId` → se achar, role = "manager"
2. Senão busca tattoo_artists onde `auth_user_id = userId` → se achar, role = "artist"
3. Retorna `{ studio, role, access: "owner" | "member" | "none" }`

### Sidebar por Role

`src/lib/access-control.ts`: `getSidebarItemsForRole(role)` retorna lista de `SidebarItemDefinition[]`.

**Manager:** Dashboard, Agenda, Clientes, Tatuadores, Serviços, Galeria, Entregas, Financeiro, Configurações
**Artist:** Painel, Agenda, Clientes, Entregas, Financeiro

### 3 Camadas de Proteção

```
1. PrivateRoute — redireciona visualmente (proteção UX)
2. Access Service — resolve role informacionalmente  
3. RLS Policies — única barreira real no banco (auth.uid())
```

## Padrões Observados

- `<PrivateRoute requiredRole="manager" />` no router
- `useAccess()` hook para obter role atual
- `getCurrentUserAccess()` apenas informacional (não substitui RLS)
- Todas as queries confiam em RLS para proteção real

## Limitações

- **Apenas 2 roles** — sem suporte a roles customizados (recepcionista, admin)
- **Manager = dono do estúdio** — sem delegação de acesso admin para outros usuários
- **Sem permissões granulares** — role define acesso a módulos inteiros, não a ações específicas
- **Sem suporte a múltiplos estúdios** — login assume 1 studio por usuário
- **Sidebar recria itens sem `useMemo`** — toda renderização recalcula

## Recomendações

- Adicionar suporte a roles customizados (ex: receptionist com acesso apenas a agenda/clientes)
- Permitir delegação de admin do estúdio para múltiplos usuários
- Usar `useMemo` nos itens de sidebar
