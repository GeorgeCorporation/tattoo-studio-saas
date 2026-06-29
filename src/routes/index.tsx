import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PrivateRoute } from "@/components/layout/PrivateRoute";
import { AuthCallback } from "@/pages/auth/AuthCallback";
import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register";
import { AgendaPage } from "@/pages/agenda/AgendaPage";
import { ArtistProfile as DashboardArtistProfile } from "@/pages/artists/ArtistProfile";
import { ArtistsPage } from "@/pages/artists/ArtistsPage";
import { ClientProfile } from "@/pages/clients/ClientProfile";
import { ClientsPage } from "@/pages/clients/ClientsPage";
import { Dashboard } from "@/pages/dashboard/Dashboard";
import { ArtistPage } from "@/pages/public/ArtistPage";
import { BookingPage } from "@/pages/public/BookingPage";
import { StudioPage } from "@/pages/public/StudioPage";

function EmptyRoute() {
  return null;
}

function EmptyPanel({ title }: { title: string }) {
  return (
    <section>
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-zinc-400">Tela em construcao.</p>
    </section>
  );
}

function Onboarding() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 text-white">
      <h1 className="text-2xl font-semibold">Onboarding</h1>
    </main>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <EmptyRoute />,
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
        element: <Onboarding />,
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
            element: <EmptyPanel title="Servicos" />,
          },
          {
            path: "/galeria",
            element: <EmptyPanel title="Galeria" />,
          },
          {
            path: "/financeiro",
            element: <EmptyPanel title="Financeiro" />,
          },
          {
            path: "/configuracoes",
            element: <EmptyPanel title="Configuracoes" />,
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
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
