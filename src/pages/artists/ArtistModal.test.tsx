import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ArtistModal } from "@/pages/artists/ArtistModal";

const mocks = vi.hoisted(() => {
  const createArtist = vi.fn();
  const uploadArtistPhoto = vi.fn();
  const updateArtist = vi.fn();
  const logger = {
    warn: vi.fn(),
    error: vi.fn(),
  };
  return { createArtist, uploadArtistPhoto, updateArtist, logger };
});

vi.mock("@/services/artists.service", () => ({
  createArtist: mocks.createArtist,
  uploadArtistPhoto: mocks.uploadArtistPhoto,
  updateArtist: mocks.updateArtist,
  slugify: (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
}));

vi.mock("@/lib/errors", () => ({
  getFriendlyErrorMessage: (error: unknown, fallback: string) =>
    error instanceof Error && error.message ? error.message : fallback,
}));

vi.mock("@/lib/logger", () => ({
  logger: mocks.logger,
}));

describe("ArtistModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("salva tatuador mesmo se foto falhar", async () => {
    mocks.createArtist.mockResolvedValue({ id: "artist-1" });
    mocks.uploadArtistPhoto.mockRejectedValue(new Error("falha no upload"));

    const onCreated = vi.fn();

    render(<ArtistModal open studioId="studio-1" onClose={vi.fn()} onCreated={onCreated} />);

    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Jason Tattoo" } });
    fireEvent.change(screen.getByPlaceholderText("tatuador@exemplo.com"), { target: { value: "jason@inkora.app" } });
    fireEvent.change(screen.getByLabelText("Foto"), {
      target: { files: [new File(["img"], "foto.png", { type: "image/png" })] },
    });
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => expect(screen.getByText("Tatuador salvo. Foto pode ser enviada depois.")).toBeInTheDocument());
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith("artist-1"));
    expect(mocks.createArtist).toHaveBeenCalledTimes(1);
    expect(mocks.uploadArtistPhoto).toHaveBeenCalledTimes(1);
  });

  it("salva perfil e avisa quando e-mail sera configurado depois", async () => {
    mocks.createArtist.mockResolvedValue({
      id: "artist-1",
      accessWarning: "Tatuador salvo. Link de acesso pode ser gerado depois no perfil.",
    });
    const onCreated = vi.fn();

    render(<ArtistModal open studioId="studio-1" onClose={vi.fn()} onCreated={onCreated} />);

    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Jason Tattoo" } });
    fireEvent.change(screen.getByPlaceholderText("tatuador@exemplo.com"), { target: { value: "jason@inkora.app" } });
    fireEvent.click(screen.getByRole("button", { name: /salvar/i }));

    expect(await screen.findByText("Tatuador salvo. Link de acesso pode ser gerado depois no perfil.")).toBeInTheDocument();
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith("artist-1"));
  });
});
