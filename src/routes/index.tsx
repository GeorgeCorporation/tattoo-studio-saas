import { createBrowserRouter, Outlet, RouterProvider, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PrivateRoute } from "@/components/layout/PrivateRoute";
import { AuthCallback } from "@/pages/auth/AuthCallback";
import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register";
import { AgendaPage } from "@/pages/agenda/AgendaPage";
import { Settings } from "@/pages/dashboard/Settings";
import { ArtistProfile as DashboardArtistProfile } from "@/pages/artists/ArtistProfile";
import { ArtistsPage } from "@/pages/artists/ArtistsPage";
import { ClientProfile } from "@/pages/clients/ClientProfile";
import { ClientsPage } from "@/pages/clients/ClientsPage";
import { Dashboard } from "@/pages/dashboard/Dashboard";
import { DeliveriesPage } from "@/pages/deliveries/DeliveriesPage";
import { ArtistPage } from "@/pages/public/ArtistPage";
import { BookingPage } from "@/pages/public/BookingPage";
import { ClientDeliveryPage } from "@/pages/public/ClientDeliveryPage";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { StudioPage } from "@/pages/public/StudioPage";
import { FinancialPage } from "@/pages/financial/FinancialPage";
import { GalleryPage } from "@/pages/gallery/GalleryPage";
import LandingPage from "@/pages/landing/LandingPage";
import { PrivacyPolicy } from "@/pages/legal/PrivacyPolicy";
import { OnboardingPage } from "@/pages/onboarding/OnboardingPage";
import { ServicesPage } from "@/pages/services/ServicesPage";

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
      <Outlet />
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
        element: <PrivateRoute />,
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
        path: "/entrega/:token",
        element: <ClientDeliveryPage />,
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
