import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingPage } from "@/pages/onboarding/OnboardingPage";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  createStudioOnboarding: vi.fn(),
  getOnboardingSnapshot: vi.fn(),
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
    getOnboardingSnapshot: mocks.getOnboardingSnapshot,
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

async function fillIdentity() {
  await screen.findByText("Identidade do estúdio");
  fireEvent.change(screen.getByLabelText("Nome do estúdio"), { target: { value: "Estúdio São Jorge" } });
  fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));
}

async function fillContact() {
  await screen.findByText("Contato e localização");
  fireEvent.change(screen.getByLabelText("WhatsApp"), { target: { value: "11999999999" } });
  fireEvent.change(screen.getByLabelText("Estado"), { target: { value: "SP" } });
  fireEvent.change(screen.getByLabelText("Cidade"), { target: { value: "São Paulo" } });
  fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));
}

describe("OnboardingPage", () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.navigate.mockClear();
    mocks.createStudioOnboarding.mockReset();
    mocks.getOnboardingSnapshot.mockReset();
    mocks.createStudioOnboarding.mockResolvedValue({ id: "studio-1", name: "Inkora", slug: "inkora" });
    mocks.getOnboardingSnapshot.mockResolvedValue({
      studio: null,
      workingHours: [],
      artists: [],
      services: [],
    });
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("gera slug automaticamente pelo nome do estúdio", async () => {
    renderPage();

    await screen.findByText("Identidade do estúdio");
    fireEvent.change(screen.getByLabelText("Nome do estúdio"), { target: { value: "Estúdio São Jorge" } });

    expect(screen.getByDisplayValue("estudio-sao-jorge")).toBeInTheDocument();
  });

  it("bloqueia avanço com WhatsApp inválido", async () => {
    renderPage();

    await fillIdentity();
    fireEvent.change(screen.getByLabelText("WhatsApp"), { target: { value: "1199" } });
    fireEvent.change(screen.getByLabelText("Estado"), { target: { value: "SP" } });
    fireEvent.change(screen.getByLabelText("Cidade"), { target: { value: "São Paulo" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));

    expect(screen.getByText(/WhatsApp válido/i)).toBeInTheDocument();
  });

  it("permite digitar cidade manualmente", async () => {
    renderPage();

    await fillIdentity();
    fireEvent.change(screen.getByLabelText("Estado"), { target: { value: "RN" } });
    fireEvent.click(screen.getByRole("button", { name: /digitar cidade manualmente/i }));
    fireEvent.change(screen.getByPlaceholderText("Digite sua cidade"), { target: { value: "Cidade Teste" } });

    expect(screen.getByDisplayValue("Cidade Teste")).toBeInTheDocument();
  });

  it("redireciona para o dashboard quando o setup já está concluído", async () => {
    mocks.getOnboardingSnapshot.mockResolvedValueOnce({
      studio: {
        id: "studio-1",
        name: "Inkora",
        slug: "inkora",
        whatsapp: "11999999999",
        city: "São Paulo",
        state: "SP",
        logo_url: "https://cdn.test/logo.png",
      },
      workingHours: Array.from({ length: 7 }, (_, day) => ({
        day_of_week: day,
        open_time: day === 0 ? null : "09:00",
        close_time: day === 0 ? null : "18:00",
        is_open: day !== 0,
      })),
      artists: [{ id: "artist-1", name: "George", slug: "george", specialty: null, instagram: null, whatsapp: null, photo_url: null }],
      services: [{ id: "service-1", name: "Tatuagem", category: "Outro", description: null, starting_price: null, avg_duration_minutes: 120 }],
    });

    renderPage();

    await waitFor(() => expect(mocks.navigate).toHaveBeenCalledWith("/dashboard", { replace: true }));
  });

  it("envia dados completos e redireciona para dashboard", async () => {
    renderPage();

    await fillIdentity();
    await fillContact();

    await screen.findByRole("heading", { name: "Funcionamento" });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));

    fireEvent.change(screen.getByLabelText("Nome do tatuador"), { target: { value: "George Tattoo" } });
    fireEvent.change(screen.getByLabelText("Nome do serviço"), { target: { value: "Tatuagem pequena" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));
    fireEvent.click(screen.getByRole("button", { name: /ativar meu estúdio/i }));

    await waitFor(() => expect(mocks.createStudioOnboarding).toHaveBeenCalled());
    expect(mocks.createStudioOnboarding.mock.calls[0][0]).toMatchObject({
      userId: "user-1",
      name: "Estúdio São Jorge",
      whatsapp: "11999999999",
      firstArtists: [{ name: "George Tattoo" }],
      firstServices: [{ name: "Tatuagem pequena" }],
    });
    expect(mocks.navigate).toHaveBeenCalledWith("/dashboard", { replace: true });
  });

  it("permite deixar tatuadores e serviços para depois quando agenda pública está desligada", async () => {
    renderPage();

    await fillIdentity();
    await fillContact();

    await screen.findByRole("heading", { name: "Funcionamento" });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));
    fireEvent.click(screen.getByLabelText(/ativar agenda pública agora/i));
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));
    fireEvent.click(screen.getByRole("button", { name: /ativar meu estúdio/i }));

    await waitFor(() => expect(mocks.createStudioOnboarding).toHaveBeenCalled());
    expect(mocks.createStudioOnboarding.mock.calls[0][0]).toMatchObject({
      firstArtists: [],
      firstServices: [],
    });
  });

  it("mostra ação clara quando salvar falha", async () => {
    mocks.createStudioOnboarding.mockRejectedValueOnce(new Error("network"));
    renderPage();

    await fillIdentity();
    await fillContact();

    await screen.findByRole("heading", { name: "Funcionamento" });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));
    fireEvent.click(screen.getByLabelText(/ativar agenda pública agora/i));
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));
    fireEvent.click(screen.getByRole("button", { name: /ativar meu estúdio/i }));

    expect(await screen.findByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ir para login/i })).toBeInTheDocument();
  });
});
