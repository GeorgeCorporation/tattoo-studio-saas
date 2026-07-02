import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingPage } from "@/pages/onboarding/OnboardingPage";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  createStudioOnboarding: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  };
});

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "george@test.com" },
    loading: false,
  }),
}));

vi.mock("@/services/onboarding.service", async () => {
  const actual = await vi.importActual<typeof import("@/services/onboarding.service")>("@/services/onboarding.service");
  return {
    ...actual,
    getUserStudio: vi.fn(() => Promise.resolve(null)),
    createStudioOnboarding: mocks.createStudioOnboarding,
  };
});

function renderPage() {
  return render(
    <MemoryRouter>
      <OnboardingPage />
    </MemoryRouter>,
  );
}

describe("OnboardingPage", () => {
  beforeEach(() => {
    mocks.navigate.mockClear();
    mocks.createStudioOnboarding.mockReset();
    mocks.createStudioOnboarding.mockResolvedValue({ id: "studio-1", name: "Ideal Tattoo", slug: "ideal-tattoo" });
    window.scrollTo = vi.fn();
  });

  it("gera slug automaticamente pelo nome do estúdio", async () => {
    renderPage();

    await screen.findByText("Identidade do estúdio");
    fireEvent.change(screen.getByLabelText("Nome do estúdio"), { target: { value: "Estúdio São Jorge" } });

    expect(screen.getByDisplayValue("estudio-sao-jorge")).toBeInTheDocument();
  });

  it("bloqueia avanço com WhatsApp inválido", async () => {
    renderPage();

    await screen.findByText("Identidade do estúdio");
    fireEvent.change(screen.getByLabelText("Nome do estúdio"), { target: { value: "Ideal Tattoo" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));

    await screen.findByText("Contato e localização");
    fireEvent.change(screen.getByLabelText("WhatsApp"), { target: { value: "1199" } });
    fireEvent.change(screen.getByLabelText("Estado"), { target: { value: "SP" } });
    fireEvent.change(screen.getByLabelText("Cidade"), { target: { value: "São Paulo" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));

    expect(screen.getByText(/WhatsApp válido/i)).toBeInTheDocument();
  });

  it("envia dados completos e redireciona para dashboard", async () => {
    renderPage();

    await screen.findByText("Identidade do estúdio");
    fireEvent.change(screen.getByLabelText("Nome do estúdio"), { target: { value: "Ideal Tattoo" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));

    fireEvent.change(screen.getByLabelText("WhatsApp"), { target: { value: "11999999999" } });
    fireEvent.change(screen.getByLabelText("Estado"), { target: { value: "SP" } });
    fireEvent.change(screen.getByLabelText("Cidade"), { target: { value: "São Paulo" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));

    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));

    fireEvent.change(screen.getByLabelText("Nome do tatuador"), { target: { value: "George Tattoo" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));

    fireEvent.change(screen.getByLabelText("Nome do serviço"), { target: { value: "Tatuagem pequena" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));

    fireEvent.click(screen.getByRole("button", { name: /ativar meu estúdio/i }));

    await waitFor(() => expect(mocks.createStudioOnboarding).toHaveBeenCalled());
    expect(mocks.createStudioOnboarding.mock.calls[0][0]).toMatchObject({
      userId: "user-1",
      name: "Ideal Tattoo",
      whatsapp: "11999999999",
      firstArtist: { name: "George Tattoo" },
      firstService: { name: "Tatuagem pequena" },
    });
    expect(mocks.navigate).toHaveBeenCalledWith("/dashboard", { replace: true });
  });
});
