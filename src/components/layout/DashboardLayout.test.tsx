import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PrivateRoute } from "@/components/layout/PrivateRoute";

const mocks = vi.hoisted(() => ({
  useAccess: vi.fn(() => ({
    access: {
      studioId: "studio-1",
      studioName: "Ideal Tattoo",
      studioSlug: "ideal-tattoo",
      studioLogoUrl: "https://cdn.test/ideal.png",
      role: "manager" as const,
      artistId: null,
      isOwner: true,
    },
    loading: false,
    error: "",
    hasRequiredRole: true,
  })),
}));

vi.mock("@/hooks/useAccess", () => ({
  useAccess: mocks.useAccess,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" }, loading: false, signOut: vi.fn() }),
}));

describe("DashboardLayout", () => {
  it("carrega o acesso uma vez na árvore real e mostra o branding no desktop e mobile", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<PrivateRoute requiredRole="manager" />}>
            <Route element={<DashboardLayout />}>
              <Route element={<p>Conteúdo</p>} path="/dashboard" />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(mocks.useAccess).toHaveBeenCalledTimes(1);
    expect(screen.getAllByAltText("Logo do estúdio Ideal Tattoo").length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByText("Inkora")).not.toBeInTheDocument();
    expect(screen.queryByText("Studio SaaS")).not.toBeInTheDocument();
  });
});
