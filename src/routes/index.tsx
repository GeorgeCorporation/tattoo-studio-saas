import { createBrowserRouter, RouterProvider } from "react-router-dom";
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
import { ArtistPage } from "@/pages/public/ArtistPage";
import { BookingPage } from "@/pages/public/BookingPage";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { StudioPage } from "@/pages/public/StudioPage";
import { FinancialPage } from "@/pages/financial/FinancialPage";
import { GalleryPage } from "@/pages/gallery/GalleryPage";
import LandingPage from "@/pages/landing/LandingPage";
import { OnboardingPage } from "@/pages/onboarding/OnboardingPage";
import { ServicesPage } from "@/pages/services/ServicesPage";

const router = createBrowserRouter([
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
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
