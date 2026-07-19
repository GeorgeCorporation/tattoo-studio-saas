import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { Sidebar } from "@/components/layout/Sidebar";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ signOut: vi.fn() }),
}));

describe("Sidebar", () => {
  it("mostra logo e nome do estúdio sem branding institucional", () => {
    render(
      <MemoryRouter>
        <Sidebar role="manager" showMobileButton={false} studioLogoUrl="https://cdn.test/ideal.png" studioName="Ideal Tattoo" />
      </MemoryRouter>,
    );

    expect(screen.getByAltText("Logo do estúdio Ideal Tattoo")).toHaveAttribute("src", "https://cdn.test/ideal.png");
    expect(screen.getAllByText("Ideal Tattoo").length).toBeGreaterThan(0);
    expect(screen.queryByText("Inkora")).not.toBeInTheDocument();
    expect(screen.queryByText("Studio SaaS")).not.toBeInTheDocument();
  });

  it("usa iniciais quando o estúdio não tem logo", () => {
    render(
      <MemoryRouter>
        <Sidebar role="manager" showMobileButton={false} studioName="Ideal Tattoo" />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Identidade visual do estúdio Ideal Tattoo")).toHaveTextContent("IT");
  });
});
