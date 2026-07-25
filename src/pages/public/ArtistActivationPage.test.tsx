import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ArtistActivationPage } from "@/pages/public/ArtistActivationPage";

const mocks = vi.hoisted(() => ({
  acceptArtistInvite: vi.fn(),
  getArtistInviteByToken: vi.fn(),
  getSession: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      signInWithPassword: mocks.signInWithPassword,
      signUp: mocks.signUp,
    },
  },
}));

vi.mock("@/services/artist-invites.service", () => ({
  acceptArtistInvite: mocks.acceptArtistInvite,
  getArtistInviteByToken: mocks.getArtistInviteByToken,
}));

function renderActivationPage() {
  return render(
    <MemoryRouter initialEntries={["/ativar-tatuador/invite-token"]}>
      <Routes>
        <Route element={<ArtistActivationPage />} path="/ativar-tatuador/:token" />
      </Routes>
    </MemoryRouter>,
  );
}

async function finishInitialInviteLoad() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("ArtistActivationPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-25T12:00:00.000Z"));
    vi.clearAllMocks();
    mocks.getArtistInviteByToken.mockResolvedValue({
      id: "invite-1",
      studio_id: "studio-1",
      artist_id: "artist-1",
      email: "ana@example.com",
      token: "invite-token",
      status: "pending",
      expires_at: "2026-07-25T12:01:00.000Z",
      accepted_at: null,
      created_at: "2026-07-25T11:00:00.000Z",
      studio: { id: "studio-1", name: "Ideal Tattoo", slug: "ideal-tattoo", logo_url: null },
      artist: { id: "artist-1", name: "Ana", slug: "ana", specialty: null },
    });
    mocks.getSession.mockResolvedValue({ data: { session: null } });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("bloqueia a cria\u00e7\u00e3o de conta quando o convite expira depois de aberto", async () => {
    renderActivationPage();

    await finishInitialInviteLoad();
    expect(screen.getByDisplayValue("ana@example.com")).toBeInTheDocument();
    vi.setSystemTime(new Date("2026-07-25T12:02:00.000Z"));

    const passwordInputs = screen.getAllByDisplayValue("");
    fireEvent.change(passwordInputs[0], { target: { value: "senha-segura" } });
    fireEvent.change(passwordInputs[1], { target: { value: "senha-segura" } });
    fireEvent.click(screen.getByRole("button", { name: "Criar conta e ativar" }));

    expect(screen.getByText("Seu convite expirou.")).toBeInTheDocument();
    expect(mocks.signUp).not.toHaveBeenCalled();
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
    expect(mocks.acceptArtistInvite).not.toHaveBeenCalled();
  });

  it("revalida a expira\u00e7\u00e3o antes de ativar uma sess\u00e3o j\u00e1 existente", async () => {
    let resolveSession!: (value: { data: { session: { user: { email: string } } } }) => void;
    mocks.getSession.mockReturnValue(
      new Promise((resolve) => {
        resolveSession = resolve;
      }),
    );

    renderActivationPage();
    await finishInitialInviteLoad();
    expect(screen.getByDisplayValue("ana@example.com")).toBeInTheDocument();
    vi.setSystemTime(new Date("2026-07-25T12:02:00.000Z"));

    await act(async () => resolveSession({ data: { session: { user: { email: "ana@example.com" } } } }));

    expect(screen.getByText("Seu convite expirou.")).toBeInTheDocument();
    expect(mocks.acceptArtistInvite).not.toHaveBeenCalled();
  });
});
