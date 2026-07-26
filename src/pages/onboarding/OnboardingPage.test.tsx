import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getOnboardingDraftStorageKey } from "@/hooks/useOnboardingDraft";
import { OnboardingPage } from "@/pages/onboarding/OnboardingPage";

const onboardingDraftKey = getOnboardingDraftStorageKey("user-1");

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

function getMondayWorkingHourInputs() {
  const [openTime, closeTime] = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="time"]'));

  if (!openTime || !closeTime) throw new Error("Monday working-hour inputs were not found.");

  return { openTime, closeTime };
}

describe("OnboardingPage", () => {
  it("preserves a customized opening time in state", async () => {
    renderPage();

    await fillIdentity();
    await fillContact();
    await screen.findByRole("heading", { name: "Funcionamento" });

    const { openTime } = getMondayWorkingHourInputs();
    fireEvent.change(openTime, { target: { value: "10:30" } });

    expect(openTime).toHaveValue("10:30");
  });

  it("preserves a customized closing time in state and submission payload", async () => {
    renderPage();

    await fillIdentity();
    await fillContact();
    await screen.findByRole("heading", { name: "Funcionamento" });

    const { closeTime } = getMondayWorkingHourInputs();
    fireEvent.change(closeTime, { target: { value: "20:30" } });

    expect(closeTime).toHaveValue("20:30");

    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));
    fireEvent.change(await screen.findByLabelText("Nome do tatuador"), { target: { value: "George Tattoo" } });
    fireEvent.change(screen.getByLabelText(/Nome do servi/i), { target: { value: "Tatuagem pequena" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));
    fireEvent.click(screen.getByRole("button", { name: /ativar meu est/i }));

    await waitFor(() => expect(mocks.createStudioOnboarding).toHaveBeenCalled());
    expect(mocks.createStudioOnboarding.mock.calls[0][0].workingHours).toEqual(
      expect.arrayContaining([{ day_of_week: 1, is_open: true, open_time: "09:00", close_time: "20:30" }]),
    );
    expect(localStorage.getItem(onboardingDraftKey)).toBeNull();
  });

  it("prevents continuing when opening is equal to closing", async () => {
    renderPage();

    await fillIdentity();
    await fillContact();
    await screen.findByRole("heading", { name: "Funcionamento" });

    const { openTime } = getMondayWorkingHourInputs();
    fireEvent.change(openTime, { target: { value: "18:00" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));

    expect(screen.getByText(/abertura precisa ser antes do fechamento/i)).toBeInTheDocument();
  });

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

  it("permite exatamente 200 caracteres visuais e limita o excedente", async () => {
    renderPage();

    await screen.findByText("Identidade do estúdio");
    const description = screen.getByLabelText(/Descrição/);
    const exactLimit = "🎨".repeat(200);

    fireEvent.change(description, { target: { value: exactLimit } });

    expect(description).toHaveValue(exactLimit);
    expect(screen.getByText("200/200")).toBeInTheDocument();

    fireEvent.change(description, { target: { value: `${exactLimit}🎨` } });

    expect(description).toHaveValue(exactLimit);
    expect(screen.getByText("200/200")).toBeInTheDocument();
  });

  it("normaliza uma descrição acima do limite restaurada do localStorage", async () => {
    const exactLimit = "🎨".repeat(200);
    localStorage.setItem(onboardingDraftKey, JSON.stringify({ description: `${exactLimit}🎨` }));

    renderPage();

    const description = await screen.findByLabelText(/Descrição/);
    expect(description).toHaveValue(exactLimit);
    expect(screen.getByText("200/200")).toBeInTheDocument();
  });

  it("normaliza uma descrição acima do limite restaurada de snapshot parcial", async () => {
    const exactLimit = "🎨".repeat(200);
    mocks.getOnboardingSnapshot.mockResolvedValueOnce({
      studio: {
        id: "studio-1",
        name: "",
        slug: "",
        description: `${exactLimit}🎨`,
        whatsapp: "",
        city: "",
        state: "",
        logo_url: null,
      },
      workingHours: [],
      artists: [],
      services: [],
    });

    renderPage();

    const description = await screen.findByLabelText(/Descrição/);
    await waitFor(() => expect(description).toHaveValue(exactLimit));
    expect(screen.getByText("200/200")).toBeInTheDocument();
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
      services: [{ id: "service-1", name: "Tatuagem", description: null, starting_price: null, avg_duration_minutes: 120 }],
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

  it("preserva preço zero reidratado na prévia e no payload", async () => {
    mocks.getOnboardingSnapshot.mockResolvedValueOnce({
      studio: {
        id: "studio-1",
        name: "Inkora",
        slug: "inkora",
        whatsapp: "11999999999",
        city: "São Paulo",
        state: "SP",
        logo_url: null,
      },
      workingHours: Array.from({ length: 7 }, (_, day) => ({
        day_of_week: day,
        open_time: day === 0 ? null : "09:00",
        close_time: day === 0 ? null : "18:00",
        is_open: day !== 0,
      })),
      artists: [],
      services: [{ id: "service-1", name: "Tatuagem zero", description: null, starting_price: 0, avg_duration_minutes: 120 }],
    });

    renderPage();

    await screen.findByText("Tatuagem zero");
    expect(screen.getByText(/120 min\s*• A partir de R\$ 0/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Nome do tatuador"), { target: { value: "George Tattoo" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));
    fireEvent.click(screen.getByRole("button", { name: /ativar meu estúdio/i }));

    await waitFor(() => expect(mocks.createStudioOnboarding).toHaveBeenCalled());
    expect(mocks.createStudioOnboarding.mock.calls[0][0].firstServices).toEqual([
      expect.objectContaining({ name: "Tatuagem zero", starting_price: 0 }),
    ]);
  });

  it("mostra somente os campos essenciais do serviço inicial", async () => {
    renderPage();

    await fillIdentity();
    await fillContact();
    await screen.findByRole("heading", { name: "Funcionamento" });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));

    expect(screen.getByLabelText("Nome do serviço")).toBeInTheDocument();
    expect(screen.getByLabelText("Duração média em minutos")).toHaveAttribute("step", "1");
    expect(screen.getByLabelText("Preço inicial (opcional)")).toBeInTheDocument();
    expect(screen.getByLabelText("Descrição do serviço (opcional)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /fine line.*90 min/i })).toBeInTheDocument();
    expect(screen.queryByLabelText("Categoria")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Orçamento" })).not.toBeInTheDocument();
  });

  it("aplica um modelo editável ao serviço inicial e envia os valores personalizados", async () => {
    renderPage();

    await fillIdentity();
    await fillContact();
    await screen.findByRole("heading", { name: "Funcionamento" });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));

    fireEvent.change(screen.getByLabelText("Preço inicial (opcional)"), { target: { value: "250" } });
    fireEvent.click(screen.getByRole("button", { name: /fine line.*90 min/i }));

    expect(screen.getByLabelText("Nome do serviço")).toHaveValue("Fine Line");
    expect(screen.getByLabelText("Duração média em minutos")).toHaveValue(90);
    expect(screen.getByLabelText("Descrição do serviço (opcional)")).toHaveValue(
      "Tatuagem com linhas finas, delicadas e detalhes precisos.",
    );
    expect(screen.getByLabelText("Preço inicial (opcional)")).toHaveValue(250);

    fireEvent.change(screen.getByLabelText("Nome do serviço"), { target: { value: "Fine Line personalizada" } });
    fireEvent.change(screen.getByLabelText("Duração média em minutos"), { target: { value: "120" } });
    fireEvent.change(screen.getByLabelText("Descrição do serviço (opcional)"), {
      target: { value: "Descrição definida pelo estúdio." },
    });
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem(onboardingDraftKey) ?? "{}")).toMatchObject({
        serviceDescription: "Descrição definida pelo estúdio.",
      }),
    );
    fireEvent.change(screen.getByLabelText("Nome do tatuador"), { target: { value: "George Tattoo" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));
    fireEvent.click(screen.getByRole("button", { name: /ativar meu estúdio/i }));

    await waitFor(() => expect(mocks.createStudioOnboarding).toHaveBeenCalled());
    expect(mocks.createStudioOnboarding.mock.calls[0][0].firstServices).toEqual([
      expect.objectContaining({
        name: "Fine Line personalizada",
        description: "Descrição definida pelo estúdio.",
        avg_duration_minutes: 120,
        starting_price: 250,
      }),
    ]);
  });

  it("protege uma duração personalizada restaurada antes de aplicar outro modelo", async () => {
    localStorage.setItem(onboardingDraftKey, JSON.stringify({ durationMinutes: "75" }));
    const confirmReplace = vi.spyOn(window, "confirm").mockReturnValue(false);

    renderPage();

    await fillIdentity();
    await fillContact();
    await screen.findByRole("heading", { name: "Funcionamento" });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));
    fireEvent.click(screen.getByRole("button", { name: /fine line.*90 min/i }));

    expect(confirmReplace).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("Duração média em minutos")).toHaveValue(75);
    confirmReplace.mockRestore();
  });

  it("rejeita duração fracionária ao adicionar um serviço", async () => {
    renderPage();

    await fillIdentity();
    await fillContact();
    await screen.findByRole("heading", { name: "Funcionamento" });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));

    fireEvent.change(screen.getByLabelText("Nome do serviço"), { target: { value: "Fine Line" } });
    fireEvent.change(screen.getByLabelText("Duração média em minutos"), { target: { value: "30.5" } });
    fireEvent.click(screen.getByRole("button", { name: /adicionar outro serviço/i }));

    expect(screen.getByText(/duração média válida/i)).toBeInTheDocument();
  });

  it("rejeita preço inicial negativo na validação do onboarding", async () => {
    renderPage();

    await fillIdentity();
    await fillContact();
    await screen.findByRole("heading", { name: "Funcionamento" });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));

    fireEvent.change(screen.getByLabelText("Nome do serviço"), { target: { value: "Fine Line" } });
    fireEvent.change(screen.getByLabelText("Preço inicial (opcional)"), { target: { value: "-1" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar e continuar/i }));

    expect(screen.getByText(/preço inicial válido/i)).toBeInTheDocument();
    expect(mocks.createStudioOnboarding).not.toHaveBeenCalled();
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
