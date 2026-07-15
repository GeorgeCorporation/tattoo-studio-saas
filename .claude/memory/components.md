---
name: components
description: Todos os componentes React — layouts, páginas, modais, shared
metadata:
  type: project
---

# Components

## Visão Geral

Componentes organizados em `src/components/` (layout, shared, ui) + páginas em `src/pages/`. Sem biblioteca de componentes base. Estilização manual com Tailwind CSS.

## Estrutura

### Layout (`src/components/layout/`)

| Componente | Função |
|-----------|--------|
| `DashboardLayout.tsx` | Sidebar + header + `<Outlet />`. Layout principal para rotas autenticadas |
| `Sidebar.tsx` | Navegação lateral com itens dinâmicos por role. Sem `useMemo` |
| `PrivateRoute.tsx` | Guard de autenticação/autorização |

### Shared (`src/components/shared/`)

| Componente | Função |
|-----------|--------|
| `AppErrorBoundary.tsx` | Error boundary global, captura erros não tratados |

### UI (`src/components/ui/`)

**VAZIO** — pasta preparada para componentes base (Input, Button, Select, Modal). Nada implementado.

### Páginas (`src/pages/`)

17 páginas organizadas por módulo. Cada módulo pode conter página + modal + subcomponentes.

| Módulo | Arquivos |
|--------|---------|
| agenda/ | AgendaPage, AppointmentCard, NewAppointmentModal |
| artist/ | ArtistPanelPage |
| artists/ | ArtistsPage, ArtistModal, ArtistProfile |
| auth/ | Login, Register, AuthCallback |
| clients/ | ClientsPage, ClientModal, ClientProfile |
| dashboard/ | Dashboard, Settings |
| deliveries/ | DeliveriesPage, DeliveryModal |
| financial/ | FinancialPage, PaymentModal, CommissionRuleModal |
| gallery/ | GalleryPage, UploadModal |
| landing/ | LandingPage |
| legal/ | PrivacyPolicy |
| onboarding/ | OnboardingPage |
| public/ | StudioPage, ArtistPage, BookingPage, ClientDeliveryPage, NotFoundPage, ArtistActivationPage |
| services/ | ServicesPage |

## Padrões Observados

- Componentes de página: export nomeado (exceto LandingPage que usa default)
- Modais: componentes separados do arquivo de página (ex: `ArtistModal.tsx`)
- Layout: DashboardLayout recebe `<Outlet />` do React Router
- Error boundary: global, não por página

## Limitações

- **Sem componentes base** — Inputs, botões, selects, modais estilizados manualmente em cada página
- **Cores hardcoded** — classes `bg-[#0f0f0f]`, `text-[#E8650A]` repetidas ~40 arquivos
- **`window.setTimeout` como delay** — em `ArtistModal.tsx` para navegação pós-criação (frágil)
- **Sidebar sem `useMemo`** — itens recalculados em toda renderização
- **Zero testes de componente** — apenas `ArtistModal.test.tsx` existe
- **Modais montam/desmontam** toda estrutura ao abrir/fechar (sem memoização)
- **Barril files vazios** — `src/components/ui/index.ts` (0 exports)

## Recomendações

- Criar Input, Button, Select, Modal em `src/components/ui/`
- Substituir `window.setTimeout` por callback direto
- Adicionar `useMemo` nos itens de sidebar
- Adicionar testes para modais principais
