import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PrivateRoute } from "@/components/layout/PrivateRoute";
import { ArtistPanelPage } from "@/pages/artist/ArtistPanelPage";
import { ClientsPage } from "@/pages/clients/ClientsPage";
import { Dashboard } from "@/pages/dashboard/Dashboard";
import { FinancialPage } from "@/pages/financial/FinancialPage";

const mocks = vi.hoisted(() => ({
  getCurrentUserAccess: vi.fn(),
  getCurrentUserStudio: vi.fn(),
  user: { id: "user-1" },
  useAccess: vi.fn(),
}));

vi.mock("@/hooks/useAccess", () => ({
  useAccess: mocks.useAccess,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: mocks.user, loading: false, signOut: vi.fn() }),
}));

vi.mock("@/services/access.service", () => ({
  getCurrentUserAccess: mocks.getCurrentUserAccess,
}));

vi.mock("@/services/dashboard.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/dashboard.service")>();

  return {
    ...actual,
    getCurrentUserStudio: (userId: string) => {
      mocks.getCurrentUserStudio(userId);
      return actual.getCurrentUserStudio(userId);
    },
    getMonthRevenue: vi.fn().mockResolvedValue(0),
    getNextAppointments: vi.fn().mockResolvedValue([]),
    getSetupStatus: vi.fn().mockResolvedValue({
      hasLogo: true,
      artistsCount: 1,
      servicesCount: 1,
      galleryCount: 1,
      appointmentsCount: 1,
    }),
    getTodayAppointments: vi.fn().mockResolvedValue(0),
    getTotalClients: vi.fn().mockResolvedValue(0),
    getWeekAppointments: vi.fn().mockResolvedValue(0),
    updateAppointmentStatus: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("@/services/artists.service", () => ({
  getArtistNextAppointments: vi.fn().mockResolvedValue([]),
  getArtists: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/services/clients.service", () => ({
  createClient: vi.fn(),
  getClients: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/services/financial.service", () => ({
  getArtistCommissionSummaries: vi.fn().mockResolvedValue([]),
  getClientSourceLabel: vi.fn(),
  getCommissionRules: vi.fn().mockResolvedValue([]),
  getMonthSummary: vi.fn().mockResolvedValue({
    monthRevenue: 0,
    signalTotal: 0,
    finalTotal: 0,
    cancelledCount: 0,
    totalCommission: 0,
    cappedCommissionCount: 0,
    studioNetRevenue: 0,
  }),
  getPaymentsByMonth: vi.fn().mockResolvedValue([]),
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
  const result = accessResult(role);
  mocks.useAccess.mockReturnValue(result);
  mocks.getCurrentUserAccess.mockResolvedValue(result.access);

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

function expectNoRepeatedAccessResolution() {
  expect(mocks.useAccess).toHaveBeenCalledTimes(1);
  expect(mocks.getCurrentUserStudio).not.toHaveBeenCalled();
  expect(mocks.getCurrentUserAccess).not.toHaveBeenCalled();
}

describe("DashboardLayout", () => {
  beforeEach(() => {
    mocks.getCurrentUserAccess.mockReset();
    mocks.getCurrentUserStudio.mockClear();
    mocks.useAccess.mockReset();
  });

  it("usa o acesso da árvore ao carregar a página de clientes", async () => {
    renderAuthenticatedPage("/clientes", "manager", <ClientsPage />);

    expect(await screen.findByText("Nenhum cliente encontrado para esta busca.")).toBeInTheDocument();
    expectNoRepeatedAccessResolution();
    expect(screen.getAllByAltText("Logo do estúdio Ideal Tattoo").length).toBeGreaterThanOrEqual(2);
  });

  it("usa o acesso da árvore ao carregar a página financeira", async () => {
    renderAuthenticatedPage("/financeiro", "manager", <FinancialPage />);

    expect(await screen.findByText("Nenhum pagamento registrado neste período.")).toBeInTheDocument();
    expectNoRepeatedAccessResolution();
  });

  it("deriva o estúdio do acesso da árvore ao carregar o dashboard", async () => {
    renderAuthenticatedPage("/dashboard", "manager", <Dashboard />);

    expect(await screen.findByRole("heading", { name: "Visão geral" })).toBeInTheDocument();
    expectNoRepeatedAccessResolution();
  });

  it("mantém uma única resolução na árvore real do painel do artista", () => {
    renderAuthenticatedPage("/painel", "artist", <ArtistPanelPage />);

    expectNoRepeatedAccessResolution();
    expect(screen.getByText("Carregando painel...")).toBeInTheDocument();
  });
});
