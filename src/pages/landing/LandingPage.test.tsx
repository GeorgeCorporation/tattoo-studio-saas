import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LandingPage from "@/pages/landing/LandingPage";

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

describe("LandingPage", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  it("renderiza a chamada principal e link de cadastro", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Seu estudio.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /comecar agora/i })).toHaveAttribute("href", "/cadastro");
  });
});
