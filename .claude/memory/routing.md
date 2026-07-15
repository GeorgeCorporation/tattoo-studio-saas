---
name: routing
description: Estrutura de rotas — públicas, privadas, gestão de slugs, SPA fallback
metadata:
  type: project
---

# Routing

## Visão Geral

React Router DOM 6.28 com `createBrowserRouter`. Roteador único em `src/routes/index.tsx`. SPA com fallback para Cloudflare Pages.

## Funcionamento

Arquivo: `src/routes/index.tsx` — `createBrowserRouter([...])` com `RouteShell` (ScrollToTop + Outlet).

### Estrutura

```
RouteShell (ScrollToTop + Outlet)
├── / → LandingPage (público)
├── /login, /cadastro, /auth/callback, /privacidade (público)
├── [PrivateRoute requireStudio=false]
│   └── /onboarding → OnboardingPage
├── [PrivateRoute requiredRole="manager"]
│   └── [DashboardLayout]
│       ├── /dashboard → Dashboard
│       ├── /agenda → AgendaPage
│       ├── /tatuadores → ArtistsPage
│       └── ... (11 rotas manager)
├── [PrivateRoute requiredRole="artist"]
│   └── [DashboardLayout]
│       ├── /painel → ArtistPanelPage
│       └── ... (6 rotas artist)
├── /entrega/:token → ClientDeliveryPage
├── /ativar-tatuador/:token → ArtistActivationPage
├── /:slug → StudioPage
├── /:slug/agendar → BookingPage
├── /:slug/:artistSlug → ArtistPage
├── /:slug/:artistSlug/agendar → BookingPage
└── * → NotFoundPage
```

### Slugs Reservados (24 palavras)

```typescript
["admin", "api", "login", "cadastro", "dashboard", "onboarding",
 "configuracoes", "agenda", "clientes", "tatuadores", "servicos",
 "financeiro", "galeria", "auth", "public", "static", "assets",
 "images", "favicon", "entrega", "entregas", "painel",
 "privacidade", "ativar-tatuador"]
```

Validados em `src/lib/slugs.ts` (`assertPublicSlug`) e no banco (`studios_slug_reserved_check`).

### ScrollToTop

Componente `RouteShell` usa `useEffect` para scroll to top em cada navegação. Ignora se `location.hash` existe.

## SPA Fallback

Cloudflare Pages configurado com `not_found_handling: "single-page-application"` em `wrangler.jsonc`. Qualquer rota não encontrada no servidor serve o `index.html`.

## Padrões Observados

- Rotas públicas vs privadas claramente separadas
- Layout compartilhado via `DashboardLayout` para rotas autenticadas
- Guard de rota via `PrivateRoute` wrapping
- Slugs validados em 2 lugares: app (`slugs.ts`) e banco (constraint)

## Limitações

- **Zero lazy loading** — todas as páginas importadas estaticamente
- **Rotas aninhadas complexas** — manager e artist compartilham alguns componentes via path diferente
- **Sem breadcrumbs** — navegação apenas via sidebar
- **Sem scroll restoration** personalizado — ScrollToTop genérico

## Recomendações

- Implementar `React.lazy()` para todas as páginas com `<Suspense>` fallback
- Adicionar loading states nas transições de rota
- Considerar scroll restoration mais inteligente (manter posição ao voltar)
