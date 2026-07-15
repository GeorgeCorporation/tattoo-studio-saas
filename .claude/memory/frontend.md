---
name: frontend
description: Tudo sobre o frontend React — Vite, Tailwind, páginas, componentes, estilos
metadata:
  type: project
---

# Frontend

## Visão Geral

React 18 SPA com Vite como bundler. Tailwind CSS para estilos. Zero dependências de UI framework. Dark mode como único tema.

## Funcionamento

- **Entry point:** `index.html` → `src/main.tsx` → `React.StrictMode` → `AppErrorBoundary` → `AppRoutes` (RouterProvider)
- **Build:** Vite com plugin React. Alias `@` → `./src`
- **TypeScript:** strict mode habilitado, target ES2020, moduleResolution Bundler

## Páginas (17)

| Módulo | Páginas |
|--------|---------|
| aganda/ | AgendaPage, AppointmentCard, NewAppointmentModal |
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

## Componentes

- **layout/**: DashboardLayout (sidebar + header + outlet), Sidebar (itens por role), PrivateRoute (guard)
- **shared/**: AppErrorBoundary (error boundary global)
- **ui/**: VAZIO — pasta preparada para Input, Button, Select, Modal

## Estilização

- Tailwind config: content array apenas, `extend: {}` vazio
- Tema: dark mode (`#0f0f0f` fundo, `#E8650A` laranja, `#1a1a1a` bordas)
- Cores hardcoded em ~40 arquivos — sem variáveis de tema
- Estilos de input/button repetidos: `w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3`

## Dependências Frontend

- react, react-dom, react-router-dom, lucide-react, @supabase/supabase-js

## Limitações

- **Zero lazy loading** — todo código (incluindo onboarding, booking, financial) vai no bundle inicial
- **Zero React.lazy()/Suspense**
- **Sem cache de dados** — cada navegação refaz queries
- **Sem mutations otimistas** — toda ação espera round-trip
- **Componentes base não existem** — estilização manual em cada página
- **Paleta de cores não centralizada** — nenhum uso de `tailwind.config.ts extend`
- **Imagens sem lazy loading** — `<img loading="lazy">` não usado
- **Inputs sem debounce** — estado atualizado a cada caractere
- **Sidebar sem useMemo** — itens recalculados em toda renderização

## Padrões Observados

- Arrow function components com export nomeado
- `import { supabase } from "@/lib/supabase"` em services
- `import { getFriendlyErrorMessage } from "@/lib/errors"` para mensagens de erro
- `import { logSeguranca } from "@/lib/security-logger"` para eventos de segurança

## Recomendações

- Implementar React.lazy() para todas as páginas (code splitting)
- Adicionar React Query ou cache manual para queries frequentes
- Criar componentes Input, Button, Select, Modal em `src/components/ui/`
- Centralizar paleta de cores no `tailwind.config.ts` `theme.extend.colors`
- Adicionar useCallback nos handlers de onChange
- Usar loading="lazy" em imagens de galeria
