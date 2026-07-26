import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ServiceTemplatePicker } from "@/components/services/ServiceTemplatePicker";
import type { ServiceTemplate } from "@/lib/service-templates";

describe("ServiceTemplatePicker", () => {
  it("emits the selected template suggestion", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<ServiceTemplatePicker hasCustomizedFields={false} onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: /fine line.*90 min/i }));

    expect(onSelect).toHaveBeenCalledWith({
      id: "fine-line",
      name: "Fine Line",
      durationMinutes: 90,
      description: "Tatuagem com linhas finas, delicadas e detalhes precisos.",
    });
  });

  it("renders additional models without changing the component logic", () => {
    const expandedCatalog: readonly ServiceTemplate[] = [
      {
        id: "piercing",
        name: "Piercing",
        durationMinutes: 30,
        description: "Aplicação de piercing com avaliação profissional.",
      },
    ];

    render(
      <ServiceTemplatePicker
        hasCustomizedFields={false}
        onSelect={vi.fn()}
        templates={expandedCatalog}
      />,
    );

    expect(screen.getByRole("button", { name: /piercing.*30 min/i })).toBeInTheDocument();
  });

  it("asks before replacing customized fields", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const confirmReplace = vi.fn(() => false);

    render(
      <ServiceTemplatePicker
        confirmReplace={confirmReplace}
        hasCustomizedFields
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: /blackwork.*180 min/i }));

    expect(confirmReplace).toHaveBeenCalledOnce();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("replaces customized fields after confirmation and reflects the selected model", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const confirmReplace = vi.fn(() => true);

    const { rerender } = render(
      <ServiceTemplatePicker
        confirmReplace={confirmReplace}
        hasCustomizedFields
        onSelect={onSelect}
      />,
    );

    const blackwork = screen.getByRole("button", { name: /blackwork.*180 min/i });
    await user.click(blackwork);

    expect(confirmReplace).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "blackwork" }));

    rerender(
      <ServiceTemplatePicker
        hasCustomizedFields={false}
        onSelect={onSelect}
        selectedTemplateId="blackwork"
      />,
    );
    expect(screen.getByRole("button", { name: /blackwork.*180 min/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("supports starting without a model", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<ServiceTemplatePicker hasCustomizedFields={false} onSelect={onSelect} selectedTemplateId="fine-line" />);

    await user.click(screen.getByRole("button", { name: /começar do zero/i }));

    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
