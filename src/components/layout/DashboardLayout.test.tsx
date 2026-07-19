import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

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
  })),
}));

vi.mock("@/hooks/useAccess", () => ({
  useAccess: mocks.useAccess,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ signOut: vi.fn() }),
}));

describe("DashboardLayout", () => {
  it("reutiliza um único acesso e mostra o branding no desktop e mobile", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route element={<p>Conteúdo</p>} path="/dashboard" />
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
