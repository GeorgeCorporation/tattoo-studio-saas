# Análise Completa do Projeto: Inkora — Tattoo Studio SaaS

> **Data:** 2026-07-12
> **Versão analisada:** 0.1.0
> **Propósito:** Relatório técnico completo da base de código, arquitetura, banco de dados, qualidade, segurança e recomendações.

---

## Índice

1. [Stack Tecnológica](#1-stack-tecnológica)
2. [Estrutura do Projeto](#2-estrutura-do-projeto)
3. [Fluxo da Aplicação](#3-fluxo-da-aplicação)
4. [Banco de Dados](#4-banco-de-dados)
5. [Qualidade do Código](#5-qualidade-do-código)
6. [Arquitetura](#6-arquitetura)
7. [Performance](#7-performance)
8. [Segurança](#8-segurança)
9. [Escalabilidade](#9-escalabilidade)
10. [Organização — Pendências](#10-organização--pendências)
11. [TODO List Priorizada](#11-todo-list-priorizada)
12. [Resumo Executivo](#12-resumo-executivo)

---

## 1. Stack Tecnológica

### 1.1 Tabela Geral

| Categoria | Tecnologia | Versão |
|---|---|---|
| **Framework Frontend** | React | 18.3.1 |
| **Linguagem** | TypeScript | 5.7.2 |
| **Build Tool** | Vite | 6.0.3 |
| **Estilização** | Tailwind CSS | 3.4.16 |
| **Roteamento** | React Router DOM | 6.28.0 |
| **Ícones** | Lucide React | 0.468.0 |
| **Backend/BaaS** | Supabase (client lib) | ^2.50.0 |
| **ORM** | Nenhum (queries diretas via Supabase JS SDK) | — |
| **Autenticação** | Supabase Auth (email/senha) | — |
| **Banco de Dados** | PostgreSQL (gerenciado pelo Supabase) | — |
| **Storage** | Supabase Storage (5 buckets públicos) | — |
| **Deploy** | Cloudflare Pages (via Wrangler) | — |
| **CI/CD** | GitHub Actions | — |
| **Test Runner** | Vitest | 4.1.9 |
| **Testes UI** | Testing Library (React + Jest DOM + User Event) | — |
| **Cobertura** | @vitest/coverage-v8 | 4.1.9 |
| **Lint** | ESLint (flat config) | 10.6.0 |
| **Formatter** | Prettier | 3.9.4 |
| **Gerenciador de Pacotes** | npm | >=10 |
| **Runtime** | Node.js | 22.x (22.16.0 via .nvmrc) |
| **Supabase CLI** | supabase | ^2.109.0 |

### 1.2 Dependências de Produção

| Pacote | Versão | Propósito |
|---|---|---|
| `@supabase/supabase-js` | ^2.50.0 | Cliente Supabase (banco, auth, storage) |
| `lucide-react` | ^0.468.0 | Biblioteca de ícones SVG |
| `react` | ^18.3.1 | UI framework |
| `react-dom` | ^18.3.1 | Renderizador React para DOM |
| `react-router-dom` | ^6.28.0 | Roteamento SPA |

**Total: 4 dependências de produção.** Stack minimalista e intencional.

### 1.3 Dependências de Desenvolvimento

| Pacote | Versão | Propósito |
|---|---|---|
| `@eslint/js` | ^10.0.1 | Regras base ESLint |
| `@testing-library/jest-dom` | ^6.9.1 | Matchers DOM para testes |
| `@testing-library/react` | ^16.3.2 | Renderização de componentes em testes |
| `@testing-library/user-event` | ^14.6.1 | Simulação de eventos do usuário |
| `@types/node` | ^22.10.0 | Tipos Node.js |
| `@types/react` | ^18.3.12 | Tipos React |
| `@types/react-dom` | ^18.3.1 | Tipos React DOM |
| `@vitejs/plugin-react` | ^4.3.4 | Plugin React para Vite |
| `@vitest/coverage-v8` | ^4.1.9 | Cobertura de testes |
| `autoprefixer` | ^10.4.20 | Prefixos CSS para browsers |
| `eslint` | ^10.6.0 | Linter |
| `eslint-plugin-react-hooks` | ^7.1.1 | Regras de React Hooks |
| `eslint-plugin-react-refresh` | ^0.5.3 | Regras de HMR/React Refresh |
| `globals` | ^17.7.0 | Globals para ESLint |
| `jsdom` | ^29.1.1 | Ambiente DOM para testes |
| `postcss` | ^8.4.49 | Processador CSS |
| `prettier` | ^3.9.4 | Formatador de código |
| `supabase` | ^2.109.0 | CLI Supabase (geração de tipos) |
| `tailwindcss` | ^3.4.16 | Framework CSS utility-first |
| `typescript` | ^5.7.2 | TypeScript compiler |
| `typescript-eslint` | ^8.62.1 | ESLint para TypeScript |
| `vite` | ^6.0.3 | Build tool / dev server |
| `vitest` | ^4.1.9 | Test runner |

### 1.4 Scripts

| Script | Comando | Descrição |
|---|---|---|
| `dev` | `vite` | Servidor de desenvolvimento |
| `build` | `tsc -b && vite build` | Build produção (typecheck + bundle) |
| `preview` | `vite preview` | Preview do build local |
| `typecheck` | `tsc --noEmit` | Checagem de tipos |
| `lint` | `eslint .` | Lint em todo projeto |
| `format` | `prettier --write .` | Formatação com Prettier |
| `check` | `typecheck + lint + test + build` | Pipeline completa de verificação |
| `db:types` | `node scripts/generate-supabase-types.mjs` | Gerar tipos TS do schema Supabase |
| `test` | `vitest run` | Rodar testes |
| `test:coverage` | `vitest run --coverage` | Testes com cobertura |

### 1.5 TypeScript Config

- **Target:** `ES2020`
- **Lib:** `DOM`, `DOM.Iterable`, `ES2020`
- **Strict mode:** habilitado
- **Module:** `ESNext` com `moduleResolution: "Bundler"`
- **JSX:** `react-jsx`
- **Paths alias:** `@/*` mapeado para `src/*`
- **noEmit:** `true` (Vite faz o bundle)

### 1.6 Vite Config

- Plugin: `@vitejs/plugin-react`
- Alias: `@` → `./src`
- Environment: jsdom para testes
- Globals: `true`
- Setup: `src/test/setup.ts`

### 1.7 Tailwind / PostCSS

- Config minimalista: `content: ['./index.html', './src/**/*.{ts,tsx}']`
- **Theme `extend: {}` vazio** — nenhuma customização de cores ou tokens
- Plugins: nenhum
- PostCSS: tailwindcss + autoprefixer

### 1.8 Lint e Formatação

**ESLint (flat config):**
- Base: `@eslint/js` recommended + `typescript-eslint` recommended
- Ignora: dist, node_modules, coverage, *.config.*
- `@typescript-eslint/no-explicit-any`: **off** (permite `any`)
- `react-refresh/only-export-components`: off
- Múltiplas regras `react-hooks` desligadas

**Prettier:**
- printWidth: 120, tabWidth: 2, semi: true
- singleQuote: false (aspas duplas)
- trailingComma: all

### 1.9 Cloudflare (Wrangler)

- **Name:** `tattoo-studio-saas`
- **Compatibility date:** 2026-06-28
- **Observability:** habilitado
- **Assets:** `./dist` com `not_found_handling: "single-page-application"` (SPA fallback)
- **Flags:** `nodejs_compat`
- **Vars:** `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` definidas

### 1.10 CI/CD (GitHub Actions)

- Trigger: push/PR para `main`
- 5 jobs paralelos em `ubuntu-latest` com Node 22:
  - `typecheck` (tsc --noEmit)
  - `lint` (eslint .)
  - `test` (vitest run com cobertura)
  - `build` (tsc -b && vite build)
  - `audit` (npm audit, severidade high+)

### 1.11 Variáveis de Ambiente

| Variável | Presente em `.env` | Presente em `.env.production` | Uso |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Sim | Sim | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Sim | Sim | Chave anônima Supabase |
| `VITE_USE_MOCK` | Não | Não | Ativa modo mock (default false) |
| `SUPABASE_PROJECT_ID` | Não | Não | ID do projeto (apenas no .env.example) |

**Nota:** `.env` e `.env.production` contêm as mesmas chaves reais. Ambos estão commitados. `.gitignore` ignora apenas `.env` exato (sem curinga).

---

## 2. Estrutura do Projeto

### 2.1 Mapa Completo de Diretórios

```
tattoo-studio-saas/
├── .github/
│   └── workflows/
│       └── ci.yml
├── .claude/
├── docs/
│   ├── TECHNICAL_BASE.md
│   └── superpowers/
├── public/
│   └── favicon.svg
├── scripts/
│   ├── generate-supabase-types.mjs
│   └── generate-brazil-cities.mjs
├── src/
│   ├── assets/
│   │   ├── brand/
│   │   │   ├── inkora-logo.svg
│   │   │   └── inkora-mark.svg
│   │   └── index.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── PrivateRoute.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── shared/
│   │   │   └── AppErrorBoundary.tsx
│   │   ├── ui/
│   │   │   └── index.ts          (VAZIO - apenas barrel)
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useAccess.ts
│   │   ├── useArtist.ts
│   │   ├── useAuth.ts
│   │   ├── useDashboard.ts
│   │   └── index.ts
│   ├── index.ts                  (VAZIO)
│   ├── lib/
│   │   ├── access-control.ts
│   │   ├── appointment-domain.ts
│   │   ├── appointment-domain.test.ts
│   │   ├── brazil-cities.json
│   │   ├── clipboard.ts
│   │   ├── clipboard.test.ts
│   │   ├── database.sql          (1346 linhas - schema completo)
│   │   ├── error-messages.ts
│   │   ├── errors.ts
│   │   ├── errors.test.ts
│   │   ├── finance-domain.ts
│   │   ├── finance-domain.test.ts
│   │   ├── logger.ts
│   │   ├── mockMode.ts
│   │   ├── rls-policies.sql      (454 linhas - somente RLS)
│   │   ├── security-logger.ts
│   │   ├── slugs.ts
│   │   └── supabase.ts
│   ├── main.tsx                  (Entry point)
│   ├── pages/
│   │   ├── agenda/
│   │   │   ├── AgendaPage.tsx
│   │   │   ├── AppointmentCard.tsx
│   │   │   └── NewAppointmentModal.tsx
│   │   ├── artist/
│   │   │   └── ArtistPanelPage.tsx
│   │   ├── artists/
│   │   │   ├── ArtistModal.tsx
│   │   │   ├── ArtistModal.test.tsx
│   │   │   ├── ArtistProfile.tsx
│   │   │   └── ArtistsPage.tsx
│   │   ├── auth/
│   │   │   ├── AuthCallback.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── clients/
│   │   │   ├── ClientModal.tsx
│   │   │   ├── ClientProfile.tsx
│   │   │   └── ClientsPage.tsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   └── Settings.tsx
│   │   ├── deliveries/
│   │   │   ├── DeliveriesPage.tsx
│   │   │   └── DeliveryModal.tsx
│   │   ├── financial/
│   │   │   ├── CommissionRuleModal.tsx
│   │   │   ├── FinancialPage.tsx
│   │   │   └── PaymentModal.tsx
│   │   ├── gallery/
│   │   │   ├── GalleryPage.tsx
│   │   │   └── UploadModal.tsx
│   │   ├── landing/
│   │   │   └── LandingPage.tsx
│   │   ├── legal/
│   │   │   └── PrivacyPolicy.tsx
│   │   ├── onboarding/
│   │   │   └── OnboardingPage.tsx
│   │   ├── public/
│   │   │   ├── ArtistActivationPage.tsx
│   │   │   ├── ArtistPage.tsx
│   │   │   ├── BookingPage.tsx
│   │   │   ├── ClientDeliveryPage.tsx
│   │   │   ├── NotFoundPage.tsx
│   │   │   └── StudioPage.tsx
│   │   └── index.ts             (VAZIO)
│   ├── routes/
│   │   └── index.tsx
│   ├── services/
│   │   ├── access.service.ts
│   │   ├── access.service.test.ts
│   │   ├── agenda.service.ts
│   │   ├── artist-invites.service.ts
│   │   ├── artists.service.ts
│   │   ├── booking.service.ts
│   │   ├── booking.service.test.ts
│   │   ├── booking.flow.test.ts
│   │   ├── clients.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── deliveries.service.ts
│   │   ├── financial.service.ts
│   │   ├── gallery.service.ts
│   │   ├── onboarding.service.ts
│   │   ├── onboarding.service.test.ts
│   │   ├── onboarding.flow.test.ts
│   │   ├── public.service.ts
│   │   ├── reminders.service.ts
│   │   ├── services.service.ts
│   │   ├── storage.service.ts
│   │   ├── storage.service.test.ts
│   │   ├── studio-brand.service.ts
│   │   └── studio-brand.service.test.ts
│   ├── styles/
│   │   ├── global.css
│   │   └── index.ts             (VAZIO)
│   ├── test/
│   │   └── setup.ts
│   ├── types/
│   │   ├── database.types.ts
│   │   └── index.ts
│   └── vite-env.d.ts
├── .env
├── .env.example
├── .env.production
├── .gitignore
├── .nvmrc
├── .prettierignore
├── .prettierrc
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
└── wrangler.jsonc
```

### 2.2 Contagem de Arquivos por Tipo

| Extensão | Quantidade | Uso |
|---|---|---|
| `.tsx` | 42 | Componentes React (páginas, modais, layouts) |
| `.ts` | 50 | Lógica (hooks, services, lib, tipos, testes) |
| `.css` | 1 | Estilos globais |
| `.json` | 3 | Config + cidades brasileiras |
| `.svg` | 2 | Logos |
| `.sql` | 2 | Schema + RLS do banco |
| Total `src/` | ~103 | |

### 2.3 Responsabilidades dos Diretórios

| Diretório | Responsabilidade |
|---|---|
| `src/components/layout/` | Componentes estruturais de layout (sidebar, dashboard wrapper, route guard) |
| `src/components/shared/` | Componentes compartilhados entre páginas (error boundary) |
| `src/components/ui/` | **VAZIO** — pasta preparada para futuros componentes base (Input, Button, Modal) |
| `src/hooks/` | Hooks customizados que encapsulam estado + efeitos + chamadas a services |
| `src/lib/` | Domínio puro (sem dependência React), utilitários, logger, schemas SQL, cliente Supabase |
| `src/pages/` | Páginas da aplicação organizadas por módulo (auth, dashboard, agenda, artists, etc.) |
| `src/routes/` | Configuração única de roteamento (createBrowserRouter) |
| `src/services/` | Camada de dados — funções que chamam Supabase e retornam dados tipados |
| `src/styles/` | Estilos globais (Tailwind directives + tema base) |
| `src/test/` | Setup do ambiente de teste |
| `src/types/` | Tipos TypeScript gerados do Supabase + tipos de domínio |
| `src/assets/` | Assets estáticos (SVGs) |
| `scripts/` | Scripts Node auxiliares (geração de tipos, dados IBGE) |

### 2.4 Padrão Arquitetural

**Camadas com dependência unidirecional:**

```
Pages (UI/UX)
   ↓ chamam
Hooks (estado + efeitos colaterais)
   ↓ chamam
Services (lógica de dados + chamadas Supabase)
   ↓ chamam
Supabase Client (lib/supabase.ts)
   ↓
Supabase (PostgreSQL + Auth + Storage + RLS)
```

- **Domain logic** em `src/lib/` (appointment-domain.ts, finance-domain.ts) é código puro, sem dependência de React ou Supabase — testável isoladamente.
- **Core services** em `src/lib/` (supabase.ts, logger.ts, slugs.ts, errors.ts) são utilitários base.
- **Feature services** em `src/services/` são específicos de cada módulo.

**Padrões não utilizados:**
- ❌ Context API / Redux / Zustand — nenhum estado global
- ❌ React Query / SWR — nenhum cache de dados
- ❌ Injeção de dependência — services chamam `supabase` diretamente (singleton)
- ❌ Padrão Repository — chamadas Supabase estão nos services, não abstraídas

### 2.5 Separacão Frontend/Backend

| Aspecto | Frontend | Backend |
|---|---|---|
| **Código** | React SPA (100% client-side) | Inexistente como servidor próprio |
| **Renderização** | Client-side apenas | N/A |
| **Lógica de dados** | Chamadas Supabase via SDK JS | PostgreSQL + RPC functions + RLS |
| **Autenticação** | UI + SDK | Supabase Auth |
| **Storage** | Upload/download via SDK | Supabase Storage + RLS |
| **Deploy** | Cloudflare Pages (assets estáticos) | Supabase gerenciado |

---

## 3. Fluxo da Aplicação

### 3.1 Ponto de Entrada

```
index.html
  → <script type="module" src="/src/main.tsx">
    → main.tsx
      → React.StrictMode
        → AppErrorBoundary
          → <AppRoutes />
            → RouterProvider (createBrowserRouter)
```

Não existe `src/App.tsx`. O roteador `createBrowserRouter` é o componente raiz.

### 3.2 Roteamento Completo

**Structure:**
```
RouteShell (ScrollToTop + Outlet)
├── /                          → LandingPage
├── /login                     → Login
├── /cadastro                  → Register
├── /auth/callback             → AuthCallback
├── /privacidade               → PrivacyPolicy
│
├── [PrivateRoute requireStudio=false]
│   └── /onboarding            → OnboardingPage
│
├── [PrivateRoute requiredRole="manager"]
│   └── DashboardLayout
│       ├── /dashboard              → Dashboard
│       ├── /agenda                 → AgendaPage
│       ├── /clientes               → ClientsPage
│       ├── /clientes/:clientId     → ClientProfile
│       ├── /tatuadores             → ArtistsPage
│       ├── /dashboard/tatuadores/:artistId → ArtistProfile
│       ├── /servicos               → ServicesPage
│       ├── /galeria                → GalleryPage
│       ├── /entregas               → DeliveriesPage
│       ├── /financeiro             → FinancialPage
│       └── /configuracoes          → Settings
│
├── [PrivateRoute requiredRole="artist"]
│   └── DashboardLayout
│       ├── /painel                 → ArtistPanelPage
│       ├── /painel/agenda          → AgendaPage
│       ├── /painel/clientes        → ClientsPage
│       ├── /painel/clientes/:id    → ClientProfile
│       ├── /painel/entregas        → DeliveriesPage
│       └── /painel/financeiro      → FinancialPage
│
├── /entrega/:token              → ClientDeliveryPage
├── /ativar-tatuador/:token      → ArtistActivationPage
├── /:slug                       → StudioPage
├── /:slug/agendar               → BookingPage
├── /:slug/:artistSlug           → ArtistPage
├── /:slug/:artistSlug/agendar   → BookingPage
└── *                            → NotFoundPage
```

### 3.3 Fluxo de Autenticação

**Registro:**
```
/cadastro → Register.tsx
  → signUp({fullName, email, password})
    → supabase.auth.signUp() com redirectTo /auth/callback
    → Navega para /onboarding
```

**Login:**
```
/login → Login.tsx
  → signIn({email, password})
    → Rate limit check (5 tentativas, 15 min bloqueio, localStorage)
    → supabase.auth.signInWithPassword()
    → Se erro: registrarFalhaLogin() + logSeguranca("LOGIN_FALHA")
    → Se sucesso: limparBloqueioLogin() + logSeguranca("LOGIN_SUCESSO")
      → Modo mock: navigate("/dashboard" ou "/onboarding")
      → Produção: query studios WHERE user_id
        → Se tem studio: navigate("/dashboard")
        → Se não: navigate("/onboarding")
```

**Auth Callback (pós-confirmação de email):**
```
/auth/callback → AuthCallback.tsx
  → Lê URL params (error_description, invite_token)
  → Se invite_token:
    → acceptArtistInvite(token, user.email)
    → navigate("/painel")
  → Se não:
    → getCurrentUserAccess(user.id, user.email)
      → role === "manager": navigate("/dashboard")
      → role === "artist": navigate("/painel")
      → sem acesso: navigate("/onboarding")
```

**Ativação de Tatuador via Convite:**
```
/ativar-tatuador/:token → ArtistActivationPage.tsx
  → getArtistInviteByToken(token) (RPC)
  → Estados: pending, expired, accepted, revoked
  → Toggle "Criar conta" / "Entrar"
  → Se signup: cria conta → login → acceptArtistInvite → /painel
  → Se signin: login → acceptArtistInvite → /painel
```

**PrivateRoute (guarda de autenticação/autorização):**
```
PrivateRoute:
  → useAuth() loading? → spinner
  → Sem user? → redirect /login
  → Erro de acesso? → tela de erro + "Tentar novamente"
  → Sem studio? → redirect /onboarding
  → Tem studio mas no onboarding? → redirect dashboard/painel
  → Role mismatch? → redirect conforme role atual
  → OK → renderiza filhos (Outlet)
```

### 3.4 Fluxo de Booking (Agendamento Público)

```
/:slug → StudioPage.tsx
  → getStudioBySlug(slug)
  → "Agendar" → /slug/agendar

/:slug/agendar → BookingPage.tsx
  Step 1: Selecionar tatuador, serviço, data e horário
    → getServicesByStudio(studioId)
    → getWorkingHourByDate(studioId, date)
    → getBookedTimes(studioId, artistId, date) (RPC)
    → getAvailableTimeSlots() (calcula slots de 1h)
  Step 2: Dados do cliente + descrição + fotos (max 3)
    → createClient({name, phone, email, instagram})
    → validateBookingEntities() (artista + serviço ativos)
    → createAppointment(data) com verificação de conflito
    → uploadReferencePhotos(studioId, appointmentId, files)
  Step 3: Confirmação com link WhatsApp
    → buildWhatsAppMessage()
```

### 3.5 Fluxo de Onboarding

```
/onboarding → OnboardingPage.tsx

5 etapas (validadas sequencialmente):
  1. Identidade → nome do estúdio, slug, descrição
  2. Contato → email, WhatsApp, Instagram, website, endereço, cidade, estado
  3. Funcionamento → horários (7 dias, toggle aberto/fechado)
  4. Equipe e Serviços → tatuadores + serviços iniciais
  5. Revisão → confirma dados

No submit:
  → createStudioOnboarding(data):
    1. Cria/atualiza studios
    2. Sincroniza working_hours (limpa e recria)
    3. Upload da logo
    4. Cria/atualiza tatuadores + fotos
    5. Cria/atualiza serviços
  → navigate("/dashboard")

Rascunho salvo em localStorage("tattoo:onboarding:draft:v2")
```

### 3.6 Fluxo do Dashboard

```
/dashboard → Dashboard.tsx
  → useDashboard()
    → dashboard.service.getCurrentUserStudio()
    → dashboard.service.getSetupStatus()
    → dashboard.service.getTodayAppointments()
    → dashboard.service.getWeekAppointments()
    → dashboard.service.getMonthRevenue()
    → dashboard.service.getTotalClients()
    → dashboard.service.getNextAppointments(limit=5)

  Renderiza:
  → Checklist de ativação (6 itens)
  → Barra de progresso (%)
  → Cards de resumo (hoje, semana, receita mês, clientes)
  → Tabela próximos atendimentos
  → Link público copiável
```

### 3.7 Comunicação com Supabase

**Todos os services usam o mesmo padrão:**

```typescript
import { supabase } from "@/lib/supabase";

// SELECT
const { data, error } = await supabase
  .from("tabela")
  .select("col1, col2, relacao(col3)")
  .eq("studio_id", studioId)
  .order("name")
  .returns<Tipo[]>();

// INSERT
const { data, error } = await supabase
  .from("tabela")
  .insert({ col1: "valor" })
  .select("id")
  .single();

// UPDATE
const { error } = await supabase
  .from("tabela")
  .update({ col1: "novo" })
  .eq("id", id);

// RPC
const { data, error } = await supabase
  .rpc("function_name", { param1: "valor" });

// Storage
const { error } = await supabase.storage
  .from("bucket")
  .upload(path, file, { cacheControl: "3600", upsert: false });

// Auth
const { data, error } = await supabase.auth.signInWithPassword({
  email, password
});
```

**Não há REST APIs próprias.** Toda comunicação é direta via cliente Supabase JS tipado com `Database`.

### 3.8 Comunicação com Cloudflare

- **Deploy apenas.** Cloudflare serve os assets estáticos via Pages.
- **Imagens** são servidas diretamente do Supabase Storage, não passam por otimização do Cloudflare.
- **SPA fallback** configurado no wrangler.jsonc (`not_found_handling: "single-page-application"`).
- **Observability** habilitado para monitoramento de erros no runtime Cloudflare.

---

## 4. Banco de Dados

### 4.1 Visão Geral

- **Plataforma:** Supabase (PostgreSQL gerenciado)
- **Schema:** `public` (14 tabelas)
- **Migrations:** ❌ **Não existem.** Schema em arquivos SQL soltos em `src/lib/`
- **Chaves primárias:** UUID (`gen_random_uuid()`)
- **Soft delete:** Não implementado (delete físico)
- **Timestamps:** `created_at` com `default now()` em todas as tabelas

### 4.2 Tabelas

#### 4.2.1 `studios`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `user_id` | `uuid` | FK `auth.users(id)` ON DELETE CASCADE |
| `name` | `text` | NOT NULL |
| `slug` | `text` | **UNIQUE NOT NULL** |
| `logo_url` | `text` | |
| `description` | `text` | |
| `address` | `text` | |
| `city` | `text` | |
| `state` | `text` | |
| `instagram` | `text` | |
| `whatsapp` | `text` | |
| `website` | `text` | |
| `created_at` | `timestamptz` | default `now()` |

**Guardrails:**
- `studios_slug_format_check`: slug deve seguir regex `^[a-z0-9-]+$`
- `studios_slug_reserved_check`: slug não pode ser palavra reservada (admin, api, login, cadastro, dashboard, onboarding, etc. — 24 palavras)

#### 4.2.2 `working_hours`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | `uuid` | PK |
| `studio_id` | `uuid` | FK `studios(id)` ON DELETE CASCADE |
| `day_of_week` | `int` | CHECK (0-6) |
| `open_time` | `time` | |
| `close_time` | `time` | |
| `is_open` | `boolean` | default true |

#### 4.2.3 `tattoo_artists`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | `uuid` | PK |
| `studio_id` | `uuid` | FK `studios(id)` ON DELETE CASCADE |
| `name` | `text` | NOT NULL |
| `slug` | `text` | NOT NULL, UNIQUE(studio_id, slug) |
| `photo_url` | `text` | |
| `specialty` | `text` | |
| `bio` | `text` | |
| `instagram` | `text` | |
| `whatsapp` | `text` | |
| `access_email` | `text` | **Sem UNIQUE constraint** |
| `auth_user_id` | `uuid` | FK `auth.users(id)` ON DELETE SET NULL |
| `is_active` | `boolean` | default true |
| `created_at` | `timestamptz` | default `now()` |

**Guardrails:**
- `tattoo_artists_slug_format_check`: regex `^[a-z0-9-]+$`
- **Partial unique index:** `tattoo_artists_auth_user_id_unique_idx` WHERE `auth_user_id IS NOT NULL`
- **Partial unique index:** `tattoo_artists_access_email_unique_idx` WHERE `access_email IS NOT NULL`

#### 4.2.4 `artist_access_invites`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | `uuid` | PK |
| `studio_id` | `uuid` | FK `studios(id)` ON DELETE CASCADE |
| `artist_id` | `uuid` | FK `tattoo_artists(id)` ON DELETE CASCADE, **UNIQUE** |
| `email` | `text` | NOT NULL |
| `token` | `uuid` | **UNIQUE**, default `gen_random_uuid()` |
| `status` | `text` | default 'pending', CHECK (pending/accepted/expired/revoked) |
| `expires_at` | `timestamptz` | default `now() + 7 days` |
| `accepted_at` | `timestamptz` | |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()` |

#### 4.2.5 `artist_commission_rules`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | `uuid` | PK |
| `studio_id` | `uuid` | FK `studios(id)` ON DELETE CASCADE |
| `artist_id` | `uuid` | FK `tattoo_artists(id)` ON DELETE CASCADE |
| `is_active` | `boolean` | default true |
| `percentage` | `numeric` | NOT NULL, CHECK ≥ 0 |
| `cap_enabled` | `boolean` | default false |
| `monthly_cap` | `numeric` | CHECK ≥ 0 |
| `starts_at` | `date` | default `current_date` |
| `notes` | `text` | |
| `created_at` | `timestamptz` | default `now()` |

#### 4.2.6 `services`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | `uuid` | PK |
| `studio_id` | `uuid` | FK `studios(id)` ON DELETE CASCADE |
| `name` | `text` | NOT NULL |
| `description` | `text` | |
| `starting_price` | `numeric` | |
| `avg_duration_minutes` | `int` | |
| `category` | `text` | |
| `is_active` | `boolean` | default true |

#### 4.2.7 `clients`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | `uuid` | PK |
| `studio_id` | `uuid` | FK `studios(id)` ON DELETE CASCADE |
| `name` | `text` | NOT NULL |
| `phone` | `text` | |
| `email` | `text` | |
| `instagram` | `text` | |
| `notes` | `text` | |
| `created_at` | `timestamptz` | default `now()` |

#### 4.2.8 `appointments`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | `uuid` | PK |
| `studio_id` | `uuid` | FK `studios(id)` ON DELETE CASCADE |
| `artist_id` | `uuid` | FK `tattoo_artists(id)` ON DELETE SET NULL |
| `client_id` | `uuid` | FK `clients(id)` ON DELETE SET NULL |
| `service_id` | `uuid` | FK `services(id)` ON DELETE SET NULL |
| `date` | `date` | NOT NULL |
| `time` | `time` | NOT NULL |
| `client_source` | `text` | default 'artist_client', CHECK (artist_client/studio_referral) |
| `status` | `text` | default 'pending', CHECK (pending/confirmed/cancelled/completed) |
| `description` | `text` | |
| `signal_paid` | `numeric` | default 0, CHECK ≥ 0 |
| `total_price` | `numeric` | CHECK ≥ 0 |
| `notes` | `text` | |
| `created_at` | `timestamptz` | default `now()` |

**Índice crítico:**
- `appointments_active_slot_unique_idx` — UNIQUE partial index on (studio_id, artist_id, date, time) WHERE status IN ('pending', 'confirmed'). **Previne duplicação de horários ativos.**

#### 4.2.9 `payments`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | `uuid` | PK |
| `studio_id` | `uuid` | FK `studios(id)` ON DELETE CASCADE |
| `appointment_id` | `uuid` | FK `appointments(id)` ON DELETE SET NULL |
| `amount` | `numeric` | NOT NULL, CHECK > 0 |
| `type` | `text` | CHECK (signal/final/extra) |
| `method` | `text` | CHECK (pix/cash/card) |
| `paid_at` | `timestamptz` | |
| `created_at` | `timestamptz` | default `now()` |

#### 4.2.10 `payment_commissions`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | `uuid` | PK |
| `studio_id` | `uuid` | FK `studios(id)` ON DELETE CASCADE |
| `payment_id` | `uuid` | FK `payments(id)` ON DELETE CASCADE, **UNIQUE** |
| `appointment_id` | `uuid` | FK `appointments(id)` ON DELETE SET NULL |
| `artist_id` | `uuid` | FK `tattoo_artists(id)` ON DELETE SET NULL |
| `rule_id` | `uuid` | FK `artist_commission_rules(id)` ON DELETE SET NULL |
| `client_source` | `text` | default 'artist_client' |
| `base_amount` | `numeric` | default 0, CHECK ≥ 0 |
| `percentage` | `numeric` | default 0, CHECK ≥ 0 |
| `raw_commission_amount` | `numeric` | default 0, CHECK ≥ 0 |
| `commission_amount` | `numeric` | default 0, CHECK ≥ 0 |
| `cap_consumed_amount` | `numeric` | default 0, CHECK ≥ 0 |
| `cap_applied` | `boolean` | default false |
| `created_at` | `timestamptz` | default `now()` |

#### 4.2.11 `gallery`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | `uuid` | PK |
| `studio_id` | `uuid` | FK `studios(id)` ON DELETE CASCADE |
| `artist_id` | `uuid` | FK `tattoo_artists(id)` ON DELETE SET NULL |
| `url` | `text` | NOT NULL |
| `type` | `text` | default 'photo' |
| `created_at` | `timestamptz` | default `now()` |

#### 4.2.12 `reviews`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | `uuid` | PK |
| `studio_id` | `uuid` | FK `studios(id)` ON DELETE CASCADE |
| `client_name` | `text` | |
| `rating` | `int` | CHECK (1-5) |
| `comment` | `text` | |
| `created_at` | `timestamptz` | default `now()` |

#### 4.2.13 `appointment_reminders`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | `uuid` | PK |
| `studio_id` | `uuid` | FK `studios(id)` ON DELETE CASCADE |
| `appointment_id` | `uuid` | FK `appointments(id)` ON DELETE CASCADE |
| `channel` | `text` | default 'whatsapp', CHECK (whatsapp) |
| `scheduled_for` | `timestamptz` | NOT NULL |
| `status` | `text` | default 'pending', CHECK (pending/sent/failed/cancelled) |
| `sent_at` | `timestamptz` | |
| `error_message` | `text` | |
| `created_at` | `timestamptz` | default `now()` |

**Índice:** `appointment_reminders_due_idx` on (status, scheduled_for)

#### 4.2.14 `client_deliveries`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | `uuid` | PK |
| `studio_id` | `uuid` | FK `studios(id)` ON DELETE CASCADE |
| `client_id` | `uuid` | FK `clients(id)` ON DELETE CASCADE |
| `appointment_id` | `uuid` | FK `appointments(id)` ON DELETE SET NULL |
| `token` | `uuid` | **UNIQUE**, default `gen_random_uuid()` |
| `title` | `text` | default 'Fotos da sua tatuagem' |
| `message` | `text` | |
| `expires_at` | `timestamptz` | |
| `created_at` | `timestamptz` | default `now()` |

### `client_delivery_photos`

| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | `uuid` | PK |
| `delivery_id` | `uuid` | FK `client_deliveries(id)` ON DELETE CASCADE |
| `studio_id` | `uuid` | FK `studios(id)` ON DELETE CASCADE |
| `url` | `text` | NOT NULL |
| `file_name` | `text` | |
| `created_at` | `timestamptz` | default `now()` |

### 4.3 Relacionamentos

```
studios (user_id → auth.users)
  ├── working_hours (studio_id)
  ├── tattoo_artists (studio_id)
  │     ├── artist_access_invites (artist_id) [1:1 via UNIQUE]
  │     ├── artist_commission_rules (artist_id)
  │     ├── gallery (artist_id, nullable)
  │     └── appointments (artist_id, nullable)
  ├── services (studio_id)
  ├── clients (studio_id)
  │     └── client_deliveries (client_id)
  │           └── client_delivery_photos (delivery_id)
  ├── appointments (studio_id)
  │     ├── artist_id → tattoo_artists
  │     ├── client_id → clients
  │     ├── service_id → services
  │     ├── payments (appointment_id)
  │     │     └── payment_commissions (payment_id) [1:1 via UNIQUE]
  │     └── appointment_reminders (appointment_id)
  ├── gallery (studio_id)
  └── reviews (studio_id)
```

**Pontos de atenção:**
- Todas as tabelas têm `studio_id` como FK para `studios(id)` — locigal por estúdio
- `payment_commissions.payment_id` é UNIQUE → 1 comissão por pagamento
- `artist_access_invites.artist_id` é UNIQUE → 1 convite ativo por artista
- `tattoo_artists.auth_user_id` sem UNIQUE direta, mas com partial unique index
- `clients` sem UNIQUE em email ou phone — um mesmo cliente pode ser cadastrado múltiplas vezes

### 4.4 Índices (27 no total)

Destaques:

| Índice | Tabela | Colunas | Propósito |
|---|---|---|---|
| `appointments_active_slot_unique_idx` | appointments | (studio_id, artist_id, date, time) WHERE status IN ('pending','confirmed') | Previne dupla reserva |
| `tattoo_artists_auth_user_id_unique_idx` | tattoo_artists | auth_user_id WHERE NOT NULL | 1 conta por artista |
| `tattoo_artists_access_email_unique_idx` | tattoo_artists | access_email WHERE NOT NULL | 1 email por artista |
| `appointment_reminders_due_idx` | appointment_reminders | (status, scheduled_for) | Busca lembretes pendentes |
| `tattoo_artists_slug_studio_idx` | tattoo_artists | (studio_id, slug) | Slug único por estúdio |

### 4.5 Funções RPC (12 funções)

| Função | Grants | Propósito |
|---|---|---|
| `get_booked_appointment_times(p_studio_id, p_artist_id, p_date)` | anon, authenticated | Horários já agendados de um artista |
| `update_public_appointment_notes(p_appointment_id, p_notes)` | anon, authenticated | Atualiza notas de appt criado há <30min |
| `current_user_artist_id(p_studio_id)` | authenticated | ID do artista logado |
| `get_artist_invite_by_token(p_token)` | anon, authenticated | Busca convite com dados do studio |
| `accept_artist_invite(p_token, p_email)` | authenticated | Fluxo completo de aceite de convite |
| `current_user_is_artist_for_appointment(p_studio_id, p_artist_id)` | authenticated | Verifica se user é o artista do appt |
| `current_user_can_view_client(p_studio_id, p_client_id)` | authenticated | Verifica se user tem appts com o cliente |
| `current_user_can_view_delivery(p_studio_id, p_appointment_id)` | authenticated | Verifica se user é artista da entrega |
| `get_client_delivery_by_token(p_token)` | anon, authenticated | Dados completos da entrega via token |
| `storage_path_part(object_name, part_index)` | anon, authenticated | Extrai parte do path do storage |
| `user_owns_storage_studio(object_name)` | anon, authenticated | Valida ownership do path de storage |
| `valid_public_booking_reference_path(object_name)` | anon, authenticated | Valida path de upload booking-references |

### 4.6 RLS Policies (Row-Level Security)

**Resumo por tabela:**

| Tabela | SELECT Público | CRUD Manager | SELECT Artist | INSERT Público |
|---|---|---|---|---|
| `studios` | ✅ anon + auth | ✅ (user_id) | — | — |
| `working_hours` | ✅ | ✅ (via studio) | — | — |
| `tattoo_artists` | ✅ (is_active) | ✅ (via studio) | ✅ próprio + UPDATE | — |
| `artist_access_invites` | ❌ | ✅ (via studio) | — | — |
| `artist_commission_rules` | ❌ | ✅ (via studio) | ✅ próprias | — |
| `services` | ✅ (is_active) | ✅ (via studio) | — | — |
| `clients` | ❌ | ✅ (via studio) | ✅ (via fn) | ✅ (anon, se studio existe) |
| `appointments` | ❌ | ✅ (via studio) | ✅ próprios + UPDATE | ✅ (com validações) |
| `payments` | ❌ | ✅ (via studio) | ✅ (via appt) | — |
| `payment_commissions` | ❌ | ✅ (via studio) | ✅ próprias | — |
| `gallery` | ✅ | ✅ (via studio) | — | — |
| `reviews` | ✅ | ✅ (via studio) | — | — |
| `appointment_reminders` | ❌ | ✅ (via studio) | — | — |
| `client_deliveries` | ❌ | ✅ (via studio) | ✅ (via fn) | — |
| `client_delivery_photos` | ❌ | ✅ (via studio) | ✅ (via delivery) | — |

**Validações de INSERT público em `appointments`:**
- Status deve ser 'pending'
- Date > hoje
- Artista deve existir e estar ativo
- Serviço deve existir e estar ativo

**Políticas de ownership:**
Manager = `auth.uid()` = `studios.user_id`
Artist = via `current_user_artist_id(p_studio_id)`

### 4.7 Storage Buckets (5 buckets públicos)

| Bucket | Propósito | Políticas |
|---|---|---|
| `artists` | Fotos de perfil dos artistas | SELECT público, INSERT autenticado (ownership validation), DELETE autenticado |
| `gallery` | Fotos da galeria do estúdio | SELECT público, INSERT autenticado, DELETE autenticado |
| `logos` | Logos dos estúdios | SELECT público, INSERT autenticado, DELETE autenticado |
| `booking-references` | Fotos de referência para agendamentos | SELECT público, INSERT autenticado, DELETE autenticado |
| `client-deliveries` | Fotos para entrega a clientes | SELECT público, INSERT autenticado, DELETE autenticado |

Todas as políticas de INSERT/DELETE usam `user_owns_storage_studio(object_name)` para validar ownership.

### 4.8 Possíveis Problemas no Banco

1. **Sem migrations versionadas** — `database.sql` e `rls-policies.sql` estão em `src/lib/` como arquivos soltos. Sem histórico de mudanças, sem rollback, sem ambiente controlado.
2. **`access_email` sem UNIQUE constraint** — `tattoo_artists.access_email` tem partial unique index via trigger mas sem UNIQUE direta. Duplicatas podem ocorrer em race conditions.
3. **`clients` sem UNIQUE em email/phone** — Cliente pode ser cadastrado múltiplas vezes, dificultando matching.
4. **RLS em `clients` e `appointments` com INSERT anon** — Depende de validações em nível de aplicação. Se alguém chamar a API Supabase diretamente com uma anon key, as policies permitem inserção com validações mínimas.
5. **`user_id` em `studios` sem índice explícito** — Consultas por `user_id` são frequentes (login, acesso). Pode ser coberto pelo PK, mas vale verificar.

---

## 5. Qualidade do Código

### 5.1 Código Duplicado

| O quê | Onde | Descrição |
|---|---|---|
| `slugify()` | [artists.service.ts](../src/services/artists.service.ts:73) e [onboarding.service.ts](../src/services/onboarding.service.ts) | Funções idênticas para normalizar slugs |
| Lista de slugs reservados | [slugs.ts](../src/lib/slugs.ts) e [database.sql](../src/lib/database.sql) | Redundante, mas intencional (validação app + banco) |
| Estilos de input/button | Espalhado em ~40 arquivos | `w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3` repetido dezenas de vezes |

### 5.2 Arquivos Mortos / Sem Propósito

| Arquivo | Problema |
|---|---|
| `src/components/ui/index.ts` | Pasta `ui/` vazia — barrel export sem nada para exportar |
| `src/pages/index.ts` | Barrel export vazio (0 exports) |
| `src/styles/index.ts` | Barrel export vazio (0 exports) |
| `src/index.ts` | Arquivo vazio na raiz de `src/` |
| `src/lib/error-messages.ts` | Re-export de `errors.ts`, possivelmente não utilizado diretamente |

### 5.3 Funções Repetidas

- `slugify`: duplicado em 2 services — deveria estar em `src/lib/slugs.ts`
- `deleteStorageFile`: similar em `artists.service.ts` e `gallery.service.ts` — poderia estar em `storage.service.ts`
- Padrão de `validateUploadFile` + `createStoragePath` + upload + `getPublicUrl` se repete em múltiplos services

### 5.4 Imports Desnecessários

- `logger` importado em vários componentes/páginas para uso esporádico (ex: ArtistModal importa logger para 2 chamadas de `warn`)
- Alguns componentes importam `useEffect` sem usar

### 5.5 Dependências Antigas / Passíveis de Upgrade

| Dependência | Versão Atual | Última | Risco do Upgrade |
|---|---|---|---|
| React | 18.3.1 | 19.x | Moderado (mudanças em refs, contexto, hydration) |
| Tailwind CSS | 3.4.16 | 4.x | Alto (configuração completamente diferente) |
| React Router | 6.28.0 | 7.x | Moderado |
| ESLint plugins | v7-10 | — | Baixo |

### 5.6 Problemas de Organização

1. **Arquivos SQL em `src/lib/`** — Database schema e RLS policies não são "lib". Deveriam estar em `supabase/migrations/`.
2. **Pasta `src/components/ui/` vazia** — Preparada para componente library mas nunca preenchida.
3. **Barrel files vazios** — 4 arquivos com zero exports, adicionam ruído.
4. **`onboarding.service.ts` com lógica demais** — Orquestra criação de studio + working_hours + logo + artistas + serviços. Mais de 300 linhas.
5. **`financial.service.ts` denso** — Contém cálculo de comissão, regras, resumo mensal — muita responsabilidade.

---

## 6. Arquitetura

### 6.1 Pontos Fortes

1. **Simplicidade proposital.** 4 dependências de produção. Sem frameworks CSS, sem store global, sem SSR, sem ORM. Fácil de entender e manter.

2. **Camadas limpas.** Pages → Hooks → Services → Supabase. Separação clara de responsabilidades com dependência unidirecional.

3. **Domain logic isolada.** `appointment-domain.ts` e `finance-domain.ts` contêm lógica de negócio pura (zero dependência de React ou Supabase), testáveis isoladamente.

4. **RLS bem pensado.** Segurança no banco, não confia no cliente. Funções helper reutilizáveis para validação de ownership.

5. **Onboarding robusto.** 5 etapas com validação, snapshot para retomada, rascunho em localStorage.

6. **Booking com tratamento de concorrência.** Valida dupla (consulta + insert) com `BookingAvailabilityError` específico.

7. **CI completo.** 5 jobs paralelos com typecheck, lint, test, build, audit.

8. **Tratamento de slugs.** Validação no frontend (`slugs.ts`) + constraint no banco (regex + reserved list) + uniqueness check em nível de aplicação.

9. **Rate limit de login.** Implementação client-side com localStorage (5 tentativas, 15 min).

10. **Security logger.** Eventos de segurança registrados em DEV com sanitização de dados sensíveis.

### 6.2 Pontos Fracos

1. **Nenhum teste de hook.** `useAuth`, `useDashboard`, `useArtist`, `useAccess` — 0 testes. São os componentes mais críticos.

2. **Nenhum cache de queries.** Toda navegação refaz as mesmas queries. `getArtists(studioId)` é chamada múltiplas vezes sem cache.

3. **`any` liberado no ESLint.** `@typescript-eslint/no-explicit-any: off` remove segurança de tipo.

4. **Sem lazy loading.** Zero uses de `React.lazy()`. Todo o código (incluindo onboarding, booking, financial) vai no bundle inicial.

5. **Sem mutations otimistas.** Nenhuma atualização de UI antecipa resposta do servidor. Toda ação espera round-trip.

6. **Cores hardcoded.** `#E8650A`, `#0f0f0f`, `#1a1a1a` espalhados em ~40 arquivos. Nenhuma variável de tema Tailwind.

7. **Tratamento de erro não uniforme.** Cada página faz seu próprio try/catch com estilos diferentes de exibição.

8. **`window.setTimeout` como "delay".** Usado em ArtistModal para navegação após criação — padrão frágil e propenso a race conditions.

9. **Queries sem timeout.** `withTimeout()` só existe no login. Demais queries podem travar a UI indefinidamente.

10. **Links públicos sem validação de "owner".** Qualquer pessoa com uma anon key pode criar clientes e agendamentos via RLS, desde que respeite as validações. DDoS potential.

### 6.3 Riscos Técnicos

1. **Migrations não versionadas.** Schema SQL solto em `src/lib/database.sql`. Sem controle de versão, sem rollback, sem histórico. Qualquer alteração manual no console Supabase não é rastreável.

2. **Chave anon key no repositório.** Embora anon key seja "pública" por design (vai para o bundle), commits em um repositório público expõem a chave. Se alguma RLS policy estiver mal configurada, dados ficam expostos.

3. **Mock mode via query param.** `?mock=1` ativa o modo mock no frontend sem autenticação. Dados reais ainda são protegidos por RLS, mas a UI exibe dados falsos.

4. **Storage público.** Todos os 5 buckets são públicos. Qualquer URL de upload é acessível sem autenticação. O RLS impede upload não autorizado, mas a leitura é aberta.

5. **Ambiente `.env.production` commitado.** As mesmas chaves de desenvolvimento estão no arquivo de produção. Sem segregação de ambientes.

### 6.4 Gargalos

1. **`getArtists` faz 2 queries em série.** Primeiro busca artistas, depois busca invites. Em estúdios com 50+ artistas, latência dobra.

2. **Dashboard carrega tudo de uma vez.** 6 queries simultâneas (setup status, summary, today appointments, week appointments, revenue, clients, next appointments).

3. **Sem paginação.** `getClients` sem `limit`/`offset`. `getAppointmentsByDate` sem limite. Crescimento ilimitado.

4. **Sidebar renderizada sem `useMemo`.** Itens de navegação recalculados em toda renderização.

5. **Múltiplos `onChange` sem debounce.** Inputs de busca e formulário disparam estado a cada caractere.

### 6.5 Dívida Técnica

1. **Componentes base não existem.** Inputs, botões, modais, selects são estilizados manualmente em cada página. Padrões de `w-full rounded-xl border border-white/10 bg-[#0f0f0f]` repetidos dezenas de vezes.

2. **Paleta de cores não centralizada.** Nenhum uso de `tailwind.config.ts` `extend`. Cores hardcoded dificultam manutenção de tema.

3. **Barrel files sem propósito.** Pelo menos 3 arquivos index.ts deveriam ser removidos.

4. **`onboarding.service.ts` monolítico.** Função `createStudioOnboarding` orquestra criação de 5+ entidades sem transação ou rollback.

5. **`artists.service.ts` grande.** 440 linhas com CRUD, invites, gallery, photos, upload — múltiplas responsabilidades.

6. **Módulo de lembretes incompleto.** `reminders.service.ts` existe e cria lembretes com status, mas não há integração real com WhatsApp API ou serviço de envio.

---

## 7. Performance

### 7.1 Bundle Size

- **Code splitting:** ❌ Ausente. Nenhum uso de `React.lazy()` ou `Suspense`.
- **Bundle inicial inclui:** Landing page, Login, Register, AuthCallback, Dashboard, Agenda, Artists, Clients, Financial, Gallery, Settings, Onboarding (5 etapas), Booking (3 etapas), todos os modais, todas as páginas públicas.
- **Estimativa:** 200-400KB JS (gzipped ~60-100KB) para funcionalidade básica.

### 7.2 Queries Repetidas

| Query | Chamada em | Problema |
|---|---|---|
| `getCurrentUserStudio()` | Login, useDashboard, useAccess | 3+ chamadas na inicialização |
| `getArtists(studioId)` | ArtistsPage, ArtistModal, AgendaPage | Sem cache entre páginas |
| `getClients(studioId)` | ClientsPage, ClientModal, AgendaPage | Repetida ao navegar |
| `getSetupStatus(studioId)` | Dashboard | Chamada em toda visita ao dashboard |

### 7.3 Renderizações Desnecessárias

- Inputs sem `useCallback` nos handlers de onChange
- Sidebar recria itens de navegação a cada render
- Dashboard recarrega todos os dados ao mudar de aba e voltar
- Modais montam/desmontam toda estrutura ao abrir/fechar (OK para uso normal, mas sem memoização)

### 7.4 Lazy Loading

**Totalmente ausente:**

- ❌ `React.lazy()` para páginas
- ❌ `<Suspense>` para fallbacks de carregamento
- ❌ `loading="lazy"` em imagens de galeria
- ❌ IntersectionObserver para lazy loading de imagens

### 7.5 Cache

**Totalmente ausente:**

- ❌ React Query / SWR / TanStack Query
- ❌ Cache manual em memória
- ❌ Stale-while-revalidate
- ❌ Prefetching de dados

### 7.6 Gargalos de Renderização

1. **AgendaPage** — Carrega appointments do dia inteiro sem paginação. Para estúdios com 50+ agendamentos/dia, a lista pode crescer.
2. **FinancialPage** — Carrega pagamentos do mês + comissões + resumo + regras em queries separadas.
3. **Dashboard** — 6+ queries simultâneas. Algumas poderiam ser agregadas em uma única RPC.

---

## 8. Segurança

### 8.1 Exposição de Secrets

| Item | Status | Risco |
|---|---|---|
| `VITE_SUPABASE_URL` no `.env` commitado | ✅ Exposto | Baixo — URL pública |
| `VITE_SUPABASE_ANON_KEY` no `.env` commitado | ✅ Exposto | Médio — se RLS falhar |
| `.env.production` com mesmas chaves | ✅ Commitado | Médio |
| `wrangler.jsonc` com vars de produção | ✅ Commitado | Baixo — anon key é pública |

**Nota:** A anon key do Supabase é projetada para ser pública (vai para o bundle do navegador). O risco real depende da corretude das RLS policies.

### 8.2 Autenticação

| Aspecto | Status | Observação |
|---|---|---|
| Login com email/senha | ✅ Supabase Auth | |
| Refresh token automático | ✅ Gerenciado pelo Supabase JS | |
| Rate limit client-side | ✅ 5 tentativas, 15 min bloqueio | localStorage (não substitui server-side) |
| Rate limit server-side | ❌ Não implementado | Supabase tem proteção própria, mas não configurada explicitamente |
| Convite com token UUID | ✅ Expira em 7 dias | |
| Logs de segurança | ✅ Login, acesso negado, upload bloqueado | Apenas em DEV (console.warn) |
| Validação de email no convite | ✅ Aceita apenas email correspondente | |
| Proteção contra brute-force | ✅ Bloqueio local | |

### 8.3 Autorização (3 camadas)

```
1. Frontend: PrivateRoute + requiredRole
   → Redireciona se role não autorizado
   → Proteção visual (não elimina acesso via API)

2. Service layer: getCurrentUserAccess()
   → Resolve owner (manager) vs member (artist)
   → Apenas informacional para o frontend

3. Database: RLS Policies
   → Única camada que realmente protege os dados
   → auth.uid() vs studios.user_id
   → Funções helper (current_user_artist_id, etc.)
```

**RLS está bem implementada.** O banco não confia no cliente.

### 8.4 Validações

| Validação | Local | O que verifica |
|---|---|---|
| Upload de arquivo | [storage.service.ts](../src/services/storage.service.ts) | Tipo (JPEG/PNG/WebP/GIF), tamanho (max 5MB), extensões proibidas (.exe, .sh, etc.) |
| Slug | [slugs.ts](../src/lib/slugs.ts) + DB | Regex `^[a-z0-9-]+$`, lista de reservados |
| Email de convite | [artists.service.ts](../src/services/artists.service.ts) | Verificação de conflito antes de upsert |
| Transição de status | [appointment-domain.ts](../src/lib/appointment-domain.ts) | pending→confirmed→completed, com validação de estados permitidos |
| Booking entity | [booking.service.ts](../src/services/booking.service.ts) | Artista ativo + Serviço ativo |
| Booking conflict | [booking.service.ts](../src/services/booking.service.ts) | Horário não ocupado + índice unique |

### 8.5 Variáveis de Ambiente

- Padrão Vite correto: variáveis com prefixo `VITE_` expostas no bundle
- `VITE_USE_MOCK=false` não está definido em `.env` — se configurado em produção, ativa modo mock
- `SUPABASE_PROJECT_ID` não é usado em runtime, apenas em scripts de geração de tipos

### 8.6 Vulnerabilidades Potenciais

1. **Mock mode via query param `?mock=1`** — Qualquer usuário pode ativar o modo mock no frontend. Dados reais protegidos por RLS, mas a interface não autenticada pode confundir.

2. **`access_email` em texto plano** — Armazenado em `tattoo_artists` e `artist_access_invites`. Sem criptografia, mas é apenas email (não senha).

3. **Inserção pública em `clients` e `appointments`** — Depende apenas de RLS policies. Um atacante com anon key pode criar dados, respeitando as validações (appointment precisa de date > hoje, artista ativo, serviço ativo).

4. **Senha sem requisitos de complexidade** — Register.tsx só valida >= 8 caracteres. Sem regras de maiúscula, número, caractere especial.

5. **Storage buckets públicos** — Qualquer URL de arquivo no Supabase Storage é acessível sem autenticação. RLS protege upload/deleção, mas leitura é pública. Correto para o caso de uso (fotos de perfil, galeria), mas requer atenção.

6. **Sem validação de email real** — `normalizeAccessEmail` só faz trim + lowercase. Sem verificação de formato de email.

---

## 9. Escalabilidade

### 9.1 O Projeto Suporta Crescimento?

**Parcialmente, com limitações.**

**Banco de Dados:**
- ✅ PostgreSQL escala bem verticalmente
- ✅ Índices existentes cobrem queries principais
- ✅ RLS com funções helper reutilizáveis
- ❌ Sem paginação em queries de cliente/appointment
- ❌ Partial unique indexes podem ter performance degradada em tabelas muito grandes

**Frontend:**
- ❌ Sem lazy loading — bundle cresce linearmente com features
- ❌ Sem cache — cada navegação refaz queries
- ✅ Arquitetura modular facilita code splitting futuro

**Infraestrutura:**
- ✅ Cloudflare Pages escala automaticamente
- ❌ Supabase free tier: 2GB banco, 1GB storage, 50k usuários
- ❌ Storage sem CDN otimizado para imagens

### 9.2 Onde Pode Quebrar

| Cenário | Impacto | Quando |
|---|---|---|
| 50k+ appointments | Queries sem paginação ficam lentas | Médio prazo |
| 100+ artistas por estúdio | 2 queries em série + join JS no lado cliente | Médio prazo |
| Upload concorrente (20+ fotos) | Rate limits do Supabase Storage | Imediato |
| RLS em tabelas com milhões de linhas | Performance de policy evaluation degrada | Longo prazo |
| Múltiplos estúdios por usuário | Fluxo de login assume 1 studio | Não suportado |
| Booking concorrente (2 usuários, mesmo horário) | Tratamento de conflito existe mas não cobre 100% | Imediato (baixa probabilidade) |

### 9.3 Módulos que Precisam Refatoração

1. **[artists.service.ts](../src/services/artists.service.ts) — 440 linhas**
   - Extrair: gallery operations, invites management, photo upload
   - Responsabilidades: CRUD + invites + gallery + photos + upload + status

2. **[financial.service.ts](../src/services/financial.service.ts)** 
   - Cálculo de comissão com lógica de cap mensal
   - Precisa de testes unitários extensivos

3. **[useArtist.ts](../src/hooks/useArtist.ts)**
   - Hook monolítico: perfil + galeria + appointments + invites
   - Separar em hooks menores ou usar composição

4. **[onboarding.service.ts](../src/services/onboarding.service.ts)**
   - Orquestra criação de 5+ entidades
   - Rollback incompleto: se upload de logo falha após criar studio, estado fica inconsistente

5. **[Dashboard.tsx](../src/pages/dashboard/Dashboard.tsx)**
   - 6+ queries simultâneas sem estado de loading granular
   - Agregar em uma RPC ou usar cache

---

## 10. Organização — Pendências

| Item | Prioridade | Ação |
|---|---|---|
| `src/lib/database.sql` movido para `supabase/migrations/` | Média | Schema não é "lib" — criar migrations versionadas |
| `src/components/ui/` populado | Média | Criar componentes Input, Button, Select, Modal |
| Cores hardcoded → theme Tailwind | Alta | Centralizar no `tailwind.config.ts` |
| `slugify` extraído para lib | Média | Remover duplicação em 2 services |
| Testes de hooks (useAuth, useAccess, etc.) | Alta | Cobertura crítica ausente |
| Barrel files vazios removidos | Baixa | 4 arquivos removidos |
| `src/pages/` organizado por módulo | OK | Já está bom |
| Serviços > 300 linhas extraídos | Média | artists.service (440 linhas), onboarding.service |
| `any` liberado no ESLint | Média | Reativar com exceções pontuais |
| Tratamento de erro padronizado | Média | Hook ou utilitário uniforme |
| `window.setTimeout` como delay removido | Baixa | Substituir por callback direto |
| `useArtist` quebrado em hooks menores | Média | Composição de hooks |

---

## 11. TODO List Priorizada

### 🔴 CRÍTICO

| # | Tarefa | Impacto | Arquivos Envolvidos |
|---|---|---|---|
| 1 | Migrations versionadas para Supabase | Perda de rastreabilidade do schema | `src/lib/database.sql`, `src/lib/rls-policies.sql` → `supabase/migrations/` |
| 2 | Timeout em queries Supabase | UI pode travar se Supabase lento | Todos os services + hooks |
| 3 | Paginação em clientes e agendamentos | Problema de performance em estúdios grandes | `clients.service.ts`, `agenda.service.ts`, `dashboard.service.ts` |
| 4 | RLS audit em tabelas com INSERT público | Risco de abuso (criação em massa) | Policies de `clients` e `appointments` |

### 🟠 ALTO

| # | Tarefa | Impacto | Arquivos Envolvidos |
|---|---|---|---|
| 5 | Code splitting com React.lazy() | Bundle inicial inchado | `src/routes/index.tsx` + todas as páginas |
| 6 | Componentes base UI (Input, Button, Select, Modal) | Duplicação massiva de estilos | `src/components/ui/` + todas as páginas |
| 7 | Testes para hooks (useAuth, useAccess, useDashboard, useArtist) | 0 cobertura nos hooks principais | `src/hooks/` |
| 8 | Cache de queries (React Query ou similar) | Queries repetidas em navegação | `src/services/`, `src/hooks/` |
| 9 | Paleta de cores no Tailwind config | Cores hardcoded em ~40 arquivos | `tailwind.config.ts` + todos os componentes |

### 🟡 MÉDIO

| # | Tarefa | Impacto | Arquivos Envolvidos |
|---|---|---|---|
| 10 | `slugify` extraído para `src/lib/slugs.ts` | Código duplicado | `artists.service.ts`, `onboarding.service.ts` |
| 11 | `artists.service.ts` fatorado (gallery, invites, CRUD) | Arquivo grande (440 linhas) | `src/services/artists.service.ts` |
| 12 | `useArtist` quebrado em hooks menores | Hook monolítico | `src/hooks/useArtist.ts` |
| 13 | Barrel files vazios removidos | Ruído no projeto | `src/pages/index.ts`, `src/styles/index.ts`, `src/index.ts` |
| 14 | Onboarding com rollback transacional | Estado inconsistente em falha | `src/services/onboarding.service.ts` |
| 15 | Tratamento de erro padronizado | Estilos de erro diferentes por página | `src/lib/errors.ts` + todas as páginas |
| 16 | Reativar `no-explicit-any` no ESLint | Perda de segurança de tipo | `eslint.config.js` + vários arquivos |

### 🟢 BAIXO

| # | Tarefa | Impacto | Arquivos Envolvidos |
|---|---|---|---|
| 17 | Upgrade React 19 | Versão desatualizada | `package.json` |
| 18 | Upgrade Tailwind v4 | Versão desatualizada (mudança radical) | `package.json`, `tailwind.config.ts` |
| 19 | `window.setTimeout` removido | Padrão frágil | `ArtistModal.tsx` |
| 20 | Testes de componente para modais | Cobertura baixa | `ArtistModal.test.tsx` + demais modais |
| 21 | Notificações/lembretes reais (API WhatsApp) | Módulo incompleto | `reminders.service.ts` |

---

## 12. Resumo Executivo

### Como o Projeto Funciona

**Inkora** é um SaaS para estúdios de tatuagem. A aplicação permite que um estúdio crie seu perfil profissional com página pública (`/:slug`), gerencie agenda, clientes, tatuadores, serviços, financeiro (com sistema de comissões), galeria de fotos e entregas de imagens para clientes.

**Arquitetura:** React 18 SPA → Supabase (PostgreSQL + Auth + Storage) → Cloudflare Pages.

**Stack minimalista:** 4 dependências de produção (React, React DOM, React Router, Supabase JS, Lucide).

**Dois papéis de usuário:**
- **Manager (dono):** Acesso completo a 9 módulos (Dashboard, Agenda, Clientes, Tatuadores, Serviços, Galeria, Entregas, Financeiro, Configurações)
- **Artist (tatuador convidado):** Acesso restrito a 5 módulos (Painel, Agenda, Clientes, Entregas, Financeiro)

**Segurança em 3 camadas:** PrivateRoute (frontend) → Access Service (lógica) → RLS Policies (banco).

### Em que Estágio Está

**Entre MVP e produto funcional.** O núcleo do produto está completo e operacional. Os módulos essenciais (cadastro, onboarding, agenda, clientes, tatuadores, serviços, galeria, financeiro, entregas) existem e funcionam.

O código tem boa arquitetura e separação de responsabilidades, mas carece de maturidade em:
- Testes automatizados (apenas serviços e domínio puro)
- Performance (sem code splitting, sem cache)
- Componentização (estilos duplicados manualmente)
- Processo de banco de dados (sem migrations)

### Partes Prontas

- ✅ Cadastro/auth completo com rate limit local
- ✅ Onboarding em 5 etapas com rascunho em localStorage
- ✅ Página pública do estúdio com agendamento
- ✅ Agenda com gerenciamento de status
- ✅ CRUD de clientes, tatuadores, serviços
- ✅ Galeria com upload e deleção
- ✅ Financeiro com comissões e cálculo de cap mensal
- ✅ Entregas de fotos para clientes
- ✅ Role-based access control (manager/artist) no frontend e banco
- ✅ 12 funções RPC no PostgreSQL
- ✅ 14 tabelas com RLS policies
- ✅ 5 buckets de storage com validação de ownership
- ✅ CI/CD com GitHub Actions + Cloudflare Pages
- ✅ Modo mock para desenvolvimento sem Supabase
- ✅ Domain logic testável (appointment, finance)

### Partes que Faltam

- ❌ **Testes de hooks** — 0 cobertura nos 4 hooks principais
- ❌ **Testes de página** — apenas 1 teste de componente (ArtistModal)
- ❌ **Lazy loading / code splitting** — zero
- ❌ **Cache de queries** — zero (React Query, SWR, ou manual)
- ❌ **Componentes UI base** — inputs, botões, modais, selects estilizados manualmente em cada página
- ❌ **Tema Tailwind configurado** — cores hardcoded em 40+ arquivos
- ❌ **Migrations versionadas** — schema SQL solto em `src/lib/`
- ❌ **Notificações/lembretes reais** — `reminders.service` existe mas sem integração com API de WhatsApp
- ❌ **Tratamento de erro uniforme** — cada página faz try/catch próprio
- ❌ **Página de serviços** — menu existe na sidebar mas funcionalidade básica (CRUD apenas)
- ❌ **Multi-idioma** — tudo em português, sem estrutura de i18n
- ❌ **Tema claro** — apenas dark mode
- ❌ **Timeout em queries** — apenas login tem proteção contra travamento

### Plano de Evolução

**Fase 1 — Qualidade (2-3 sprints):**
1. Migrations versionadas para Supabase
2. Testes nos 4 hooks principais
3. Cache de queries (React Query ou similar)
4. Lazy loading nas páginas
5. Componentes base UI (Input, Button, Modal)

**Fase 2 — Produto (3-4 sprints):**
1. Lembretes WhatsApp (via API externa)
2. Relatórios financeiros avançados
3. Avaliações de clientes
4. Página de serviços com apresentação pública
5. Múltiplas fotos por agendamento (antes/depois)

**Fase 3 — Escala (2-3 sprints):**
1. Paginação em listas grandes
2. Cache e otimização de queries
3. Suporte a múltiplos estúdios por usuário
4. Integração Stripe/PIX para pagamentos online
5. Tema claro + escuro

**Fase 4 — Maturidade (contínuo):**
1. Testes E2E
2. i18n (internacionalização)
3. Performance budget
4. Monitoramento real (não só console.warn)
5. Documentação de arquitetura e onboarding para devs
