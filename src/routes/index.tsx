import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PrivateRoute } from "@/components/layout/PrivateRoute";
import { AuthCallback } from "@/pages/auth/AuthCallback";
import { Login } from "@/pages/auth/Login";
import { Register } from "@/pages/auth/Register";
import { ArtistPage } from "@/pages/public/ArtistPage";
import { StudioPage } from "@/pages/public/StudioPage";

function EmptyRoute() {
  return null;
}

function Dashboard() {
  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 text-white">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
    </main>
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
        path: "/dashboard",
        element: <Dashboard />,
      },
    ],
  },
  {
    path: "/:slug",
    element: <StudioPage />,
  },
  {
    path: "/:slug/:artistSlug",
    element: <ArtistPage />,
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
