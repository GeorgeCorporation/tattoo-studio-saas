import { createBrowserRouter, Outlet, RouterProvider, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect, type ComponentType } from "react";
import LandingPage from "@/pages/landing/LandingPage";
import { NotFoundPage } from "@/pages/public/NotFoundPage";

/**
 * Carrega sob demanda um módulo que exporta o componente com nome, e não como
 * default. `React.lazy` só aceita default, então o nome é reempacotado aqui.
 *
 * Serve apenas para componentes sem props — a inferência de props não atravessa
 * o genérico. Os dois layouts, que recebem props, usam `lazy` na forma direta.
 */
function carregarNomeado<M, K extends keyof M>(importar: () => Promise<M>, nome: K) {
  return lazy(async () => {
    const modulo = await importar();
    return { default: modulo[nome] as ComponentType };
  });
}

// Só a landing e o 404 vêm no bundle inicial. Todo o resto é carregado quando a
// rota é visitada, para que quem chega na página pública de um estúdio não baixe
// o painel autenticado inteiro.
//
// Os dois layouts também são adiados de propósito: eles alcançam `useAuth` e,
// por ele, o cliente Supabase. Mantê-los no grafo inicial arrastava ~55 kB
// comprimidos de SDK para dentro do primeiro carregamento da landing.
const PrivateRoute = lazy(async () => {
  const { PrivateRoute: Componente } = await import("@/components/layout/PrivateRoute");
  return { default: Componente };
});

const DashboardLayout = lazy(async () => {
  const { DashboardLayout: Componente } = await import("@/components/layout/DashboardLayout");
  return { default: Componente };
});

const AuthCallback = carregarNomeado(() => import("@/pages/auth/AuthCallback"), "AuthCallback");
const Login = carregarNomeado(() => import("@/pages/auth/Login"), "Login");
const Register = carregarNomeado(() => import("@/pages/auth/Register"), "Register");
const PrivacyPolicy = carregarNomeado(() => import("@/pages/legal/PrivacyPolicy"), "PrivacyPolicy");
const OnboardingPage = carregarNomeado(() => import("@/pages/onboarding/OnboardingPage"), "OnboardingPage");

const Dashboard = carregarNomeado(() => import("@/pages/dashboard/Dashboard"), "Dashboard");
const Settings = carregarNomeado(() => import("@/pages/dashboard/Settings"), "Settings");
const AgendaPage = carregarNomeado(() => import("@/pages/agenda/AgendaPage"), "AgendaPage");
const ClientsPage = carregarNomeado(() => import("@/pages/clients/ClientsPage"), "ClientsPage");
const ClientProfile = carregarNomeado(() => import("@/pages/clients/ClientProfile"), "ClientProfile");
const ArtistsPage = carregarNomeado(() => import("@/pages/artists/ArtistsPage"), "ArtistsPage");
const DashboardArtistProfile = carregarNomeado(() => import("@/pages/artists/ArtistProfile"), "ArtistProfile");
const ServicesPage = carregarNomeado(() => import("@/pages/services/ServicesPage"), "ServicesPage");
const GalleryPage = carregarNomeado(() => import("@/pages/gallery/GalleryPage"), "GalleryPage");
const DeliveriesPage = carregarNomeado(() => import("@/pages/deliveries/DeliveriesPage"), "DeliveriesPage");
const FinancialPage = carregarNomeado(() => import("@/pages/financial/FinancialPage"), "FinancialPage");
const ArtistPanelPage = carregarNomeado(() => import("@/pages/artist/ArtistPanelPage"), "ArtistPanelPage");

const StudioPage = carregarNomeado(() => import("@/pages/public/StudioPage"), "StudioPage");
const ArtistPage = carregarNomeado(() => import("@/pages/public/ArtistPage"), "ArtistPage");
const BookingPage = carregarNomeado(() => import("@/pages/public/BookingPage"), "BookingPage");
const ClientDeliveryPage = carregarNomeado(() => import("@/pages/public/ClientDeliveryPage"), "ClientDeliveryPage");
const ArtistActivationPage = carregarNomeado(() => import("@/pages/public/ArtistActivationPage"), "ArtistActivationPage");

/** Mesma tela de espera que o PrivateRoute usa, para a troca de rota não piscar. */
function CarregandoRota() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4 text-sm text-zinc-300">
      Carregando...
    </div>
  );
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) return;
    window.scrollTo({ top: 0, left: 0 });
  }, [location.pathname, location.search, location.hash]);

  return null;
}

function RouteShell() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<CarregandoRota />}>
        <Outlet />
      </Suspense>
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <RouteShell />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/cadastro",
        element: <Register />,
      },
      {
        path: "/auth/callback",
        element: <AuthCallback />,
      },
      {
        path: "/privacidade",
        element: <PrivacyPolicy />,
      },
      {
        element: <PrivateRoute requireStudio={false} />,
        children: [
          {
            path: "/onboarding",
            element: <OnboardingPage />,
          },
        ],
      },
      {
        element: <PrivateRoute requiredRole="manager" />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              {
                path: "/dashboard",
                element: <Dashboard />,
              },
              {
                path: "/agenda",
                element: <AgendaPage />,
              },
              {
                path: "/clientes",
                element: <ClientsPage />,
              },
              {
                path: "/clientes/:clientId",
                element: <ClientProfile />,
              },
              {
                path: "/tatuadores",
                element: <ArtistsPage />,
              },
              {
                path: "/dashboard/tatuadores/:artistId",
                element: <DashboardArtistProfile />,
              },
              {
                path: "/servicos",
                element: <ServicesPage />,
              },
              {
                path: "/galeria",
                element: <GalleryPage />,
              },
              {
                path: "/entregas",
                element: <DeliveriesPage />,
              },
              {
                path: "/financeiro",
                element: <FinancialPage />,
              },
              {
                path: "/configuracoes",
                element: <Settings />,
              },
            ],
          },
        ],
      },
      {
        element: <PrivateRoute requiredRole="artist" />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              {
                path: "/painel",
                element: <ArtistPanelPage />,
              },
              {
                path: "/painel/agenda",
                element: <AgendaPage />,
              },
              {
                path: "/painel/clientes",
                element: <ClientsPage />,
              },
              {
                path: "/painel/clientes/:clientId",
                element: <ClientProfile />,
              },
              {
                path: "/painel/entregas",
                element: <DeliveriesPage />,
              },
              {
                path: "/painel/financeiro",
                element: <FinancialPage />,
              },
            ],
          },
        ],
      },
      {
        path: "/entrega/:token",
        element: <ClientDeliveryPage />,
      },
      {
        path: "/ativar-tatuador/:token",
        element: <ArtistActivationPage />,
      },
      {
        path: "/:slug",
        element: <StudioPage />,
      },
      {
        path: "/:slug/agendar",
        element: <BookingPage />,
      },
      {
        path: "/:slug/:artistSlug/agendar",
        element: <BookingPage />,
      },
      {
        path: "/:slug/:artistSlug",
        element: <ArtistPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
