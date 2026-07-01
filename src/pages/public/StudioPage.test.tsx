import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudioPage } from "@/pages/public/StudioPage";
import { getStudioArtists, getStudioBySlug, getStudioGallery } from "@/services/public.service";

vi.mock("@/services/public.service", () => ({
  getStudioArtists: vi.fn(),
  getStudioBySlug: vi.fn(),
  getStudioGallery: vi.fn(),
}));

const mockGetStudioBySlug = vi.mocked(getStudioBySlug);
const mockGetStudioArtists = vi.mocked(getStudioArtists);
const mockGetStudioGallery = vi.mocked(getStudioGallery);

function renderStudioPage(path = "/ideal-tattoo") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<StudioPage />} path="/:slug" />
      </Routes>
    </MemoryRouter>,
  );
}

describe("StudioPage", () => {
  beforeEach(() => {
    mockGetStudioBySlug.mockReset();
    mockGetStudioArtists.mockReset();
    mockGetStudioGallery.mockReset();
  });

  it("renderiza estúdio mesmo sem tatuadores e galeria", async () => {
    mockGetStudioBySlug.mockResolvedValue({
      id: "studio-1",
      name: "Ideal Tattoo",
      slug: "ideal-tattoo",
      logo_url: null,
      description: null,
      address: null,
      city: "São Paulo",
      state: "SP",
      instagram: null,
      whatsapp: "11999999999",
      website: null,
    });
    mockGetStudioArtists.mockResolvedValue([]);
    mockGetStudioGallery.mockResolvedValue([]);

    renderStudioPage();

    await waitFor(() => expect(screen.getByRole("heading", { name: "Ideal Tattoo" })).toBeInTheDocument());

    expect(screen.getByText("0 profissionais")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Agendar agora" })).toHaveAttribute("href", "/ideal-tattoo/agendar");
    expect(screen.getByText("São Paulo - SP")).toBeInTheDocument();
  });

  it("mostra 404 quando estúdio não existe", async () => {
    mockGetStudioBySlug.mockResolvedValue(null);

    renderStudioPage("/nao-existe");

    await waitFor(() => expect(screen.getByText("Estúdio não encontrado.")).toBeInTheDocument());
  });
});
