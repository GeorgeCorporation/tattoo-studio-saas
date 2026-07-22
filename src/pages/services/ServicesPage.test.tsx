import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServices: vi.fn(),
}));

vi.mock("@/hooks/useDashboardAccess", () => ({
  useDashboardAccess: () => ({ studioId: "studio-1" }),
}));

vi.mock("@/services/services.service", () => ({
  createService: vi.fn(),
  getServices: mocks.getServices,
  toggleServiceStatus: vi.fn(),
  updateService: vi.fn(),
}));

import { ServicesPage } from "@/pages/services/ServicesPage";

describe("ServicesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exibe preço inicial zero corretamente", async () => {
    mocks.getServices.mockResolvedValue([
      {
        id: "service-1",
        studio_id: "studio-1",
        name: "Tatuagem minimalista",
        description: null,
        starting_price: 0,
        avg_duration_minutes: 30,
        is_active: true,
      },
    ]);

    render(<ServicesPage />);

    expect(await screen.findByText(/Inicial:\s*R\$\s*0,00/)).toBeInTheDocument();
  });
});
