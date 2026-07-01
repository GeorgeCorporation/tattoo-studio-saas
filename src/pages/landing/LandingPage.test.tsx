import { fireEvent, render, screen } from "@testing-library/react";
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
    window.scrollTo = vi.fn();
  });

  it("renderiza a chamada principal e link de cadastro", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Seu estúdio.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /começar agora/i })).toHaveAttribute("href", "/cadastro");
  });

  it("rola para como funciona ao clicar no botão", () => {
    const scrollIntoView = vi.fn();
    vi.spyOn(document, "getElementById").mockReturnValue({ scrollIntoView } as unknown as HTMLElement);

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /ver como funciona/i }));

    expect(document.getElementById).toHaveBeenCalledWith("como-funciona");
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
  });

  it("logo volta para o início da página", () => {
    render(
      <MemoryRouter initialEntries={["/#como-funciona"]}>
        <LandingPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: /ideal tattoo/i })[0]);

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    expect(window.location.pathname).toBe("/");
  });
});
