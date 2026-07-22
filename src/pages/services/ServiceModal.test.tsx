import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ServiceModal } from "@/pages/services/ServiceModal";

describe("ServiceModal", () => {
  it("não renderiza o campo Categoria", () => {
    render(
      <ServiceModal
        onClose={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
        open
        studioId="studio-1"
      />,
    );

    expect(screen.queryByText("Categoria")).not.toBeInTheDocument();
  });
});
