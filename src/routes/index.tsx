import { createBrowserRouter, RouterProvider } from "react-router-dom";

function EmptyRoute() {
  return null;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <EmptyRoute />,
  },
  {
    path: "/login",
    element: <EmptyRoute />,
  },
  {
    path: "/cadastro",
    element: <EmptyRoute />,
  },
  {
    path: "/onboarding",
    element: <EmptyRoute />,
  },
  {
    path: "/dashboard",
    element: <EmptyRoute />,
  },
  {
    path: "/:slug",
    element: <EmptyRoute />,
  },
  {
    path: "/:slug/:artistSlug",
    element: <EmptyRoute />,
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
