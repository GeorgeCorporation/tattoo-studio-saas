import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("applies a template while preserving the price entered by the user", async () => {
    const user = userEvent.setup();

    render(
      <ServiceModal
        onClose={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
        open
        studioId="studio-1"
      />,
    );

    await user.type(screen.getByLabelText(/preco inicial/i), "250");
    await user.click(screen.getByRole("button", { name: /fine line.*90 min/i }));

    expect(screen.getByLabelText("Nome")).toHaveValue("Fine Line");
    expect(screen.getByLabelText(/duracao media em minutos/i)).toHaveValue(90);
    expect(screen.getByLabelText("Descrição")).toHaveValue(
      "Tatuagem com linhas finas, delicadas e detalhes precisos.",
    );
    expect(screen.getByLabelText(/preco inicial/i)).toHaveValue(250);
  });

  it("allows every suggested field to be edited before saving", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(<ServiceModal onClose={vi.fn()} onSave={onSave} open studioId="studio-1" />);

    await user.click(screen.getByRole("button", { name: /minimalista.*60 min/i }));
    await user.clear(screen.getByLabelText("Nome"));
    await user.type(screen.getByLabelText("Nome"), "Minimalista personalizada");
    await user.clear(screen.getByLabelText(/duracao media em minutos/i));
    await user.type(screen.getByLabelText(/duracao media em minutos/i), "120");
    await user.clear(screen.getByLabelText("Descrição"));
    await user.type(screen.getByLabelText("Descrição"), "Descrição definida pelo estúdio.");
    await user.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        studioId: "studio-1",
        name: "Minimalista personalizada",
        durationMinutes: 120,
        description: "Descrição definida pelo estúdio.",
        startingPrice: null,
      }),
    );
  });

  it("does not show the template library while editing an existing service", () => {
    render(
      <ServiceModal
        onClose={vi.fn()}
        onSave={vi.fn().mockResolvedValue(undefined)}
        open
        service={{
          id: "service-1",
          studio_id: "studio-1",
          name: "Fine Line",
          description: "Descrição existente",
          starting_price: 200,
          avg_duration_minutes: 90,
          is_active: true,
        }}
        studioId="studio-1"
      />,
    );

    expect(screen.queryByText("Como deseja começar?")).not.toBeInTheDocument();
  });
});
