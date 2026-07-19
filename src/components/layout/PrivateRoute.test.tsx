import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrivateRoute } from "@/components/layout/PrivateRoute";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useAccess: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/hooks/useAccess", () => ({
  useAccess: mocks.useAccess,
}));

function accessResult(role: "manager" | "artist") {
  return {
    access: {
      studioId: "studio-1",
      studioName: "Ideal Tattoo",
      studioSlug: "ideal-tattoo",
      studioLogoUrl: null,
      role,
      artistId: role === "artist" ? "artist-1" : null,
      isOwner: role === "manager",
    },
    loading: false,
    error: "",
    hasRequiredRole: true,
  };
}

function renderOnboardingRoute() {
  return render(
    <MemoryRouter initialEntries={["/onboarding"]}>
      <Routes>
        <Route element={<PrivateRoute requireStudio={false} />}>
          <Route element={<p>Onboarding permitido</p>} path="/onboarding" />
        </Route>
        <Route element={<p>Painel do artista</p>} path="/painel" />
        <Route element={<p>Login</p>} path="/login" />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PrivateRoute", () => {
  beforeEach(() => {
    mocks.useAuth.mockReturnValue({ user: { id: "user-1" }, loading: false });
    mocks.useAccess.mockReturnValue(accessResult("manager"));
  });

  it("permite que um manager com estúdio retome o onboarding", () => {
    renderOnboardingRoute();

    expect(screen.getByText("Onboarding permitido")).toBeInTheDocument();
  });

  it("redireciona um artista que tenta abrir o onboarding", () => {
    mocks.useAccess.mockReturnValue(accessResult("artist"));

    renderOnboardingRoute();

    expect(screen.getByText("Painel do artista")).toBeInTheDocument();
    expect(screen.queryByText("Onboarding permitido")).not.toBeInTheDocument();
  });

  it("redireciona um usuário não autenticado para o login", () => {
    mocks.useAuth.mockReturnValue({ user: null, loading: false });

    renderOnboardingRoute();

    expect(screen.getByText("Login")).toBeInTheDocument();
  });
});
