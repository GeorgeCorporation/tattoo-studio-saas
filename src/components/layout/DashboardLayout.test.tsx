import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PrivateRoute } from "@/components/layout/PrivateRoute";
import { ArtistPanelPage } from "@/pages/artist/ArtistPanelPage";
import { ClientsPage } from "@/pages/clients/ClientsPage";

const mocks = vi.hoisted(() => ({
  useAccess: vi.fn(),
}));

vi.mock("@/hooks/useAccess", () => ({
  useAccess: mocks.useAccess,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-1" }, loading: false, signOut: vi.fn() }),
}));

vi.mock("@/services/artists.service", () => ({
  getArtistNextAppointments: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/services/clients.service", () => ({
  createClient: vi.fn(),
  getClients: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/services/dashboard.service", () => ({
  getCurrentUserStudio: vi.fn().mockResolvedValue({ id: "studio-1" }),
}));

vi.mock("@/services/financial.service", () => ({
  getArtistCommissionSummaries: vi.fn().mockResolvedValue([]),
  getMonthSummary: vi.fn().mockResolvedValue({ monthRevenue: 0 }),
}));

function accessResult(role: "manager" | "artist") {
  return {
    access: {
      studioId: "studio-1",
      studioName: "Ideal Tattoo",
      studioSlug: "ideal-tattoo",
      studioLogoUrl: "https://cdn.test/ideal.png",
      role,
      artistId: role === "artist" ? "artist-1" : null,
      isOwner: role === "manager",
    },
    loading: false,
    error: "",
    hasRequiredRole: true,
  };
}

function renderAuthenticatedPage(path: string, role: "manager" | "artist", element: ReactNode) {
  mocks.useAccess.mockReturnValue(accessResult(role));

  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<PrivateRoute requiredRole={role} />}>
          <Route element={<DashboardLayout />}>
            <Route element={element} path={path} />
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("DashboardLayout", () => {
  beforeEach(() => {
    mocks.useAccess.mockReset();
  });

  it("carrega o acesso uma vez na árvore real de uma página de gestor", () => {
    renderAuthenticatedPage("/clientes", "manager", <ClientsPage />);

    expect(mocks.useAccess).toHaveBeenCalledTimes(1);
    expect(screen.getAllByAltText("Logo do estúdio Ideal Tattoo").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("heading", { name: "Clientes" })).toBeInTheDocument();
  });

  it("carrega o acesso uma vez na árvore real do painel do artista", () => {
    renderAuthenticatedPage("/painel", "artist", <ArtistPanelPage />);

    expect(mocks.useAccess).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Carregando painel...")).toBeInTheDocument();
  });
});
