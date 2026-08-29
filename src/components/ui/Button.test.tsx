import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("é do tipo button por padrão, para não submeter formulário sem querer", () => {
    render(<Button>Salvar</Button>);
    expect(screen.getByRole("button", { name: "Salvar" })).toHaveAttribute("type", "button");
  });

  it("aceita virar submit quando o formulário precisa", () => {
    render(<Button type="submit">Salvar</Button>);
    expect(screen.getByRole("button", { name: "Salvar" })).toHaveAttribute("type", "submit");
  });

  it("declara foco visível em todas as variantes", () => {
    render(
      <>
        <Button variant="primary">Primário</Button>
        <Button variant="secondary">Secundário</Button>
        <Button variant="ghost">Fantasma</Button>
      </>,
    );

    for (const nome of ["Primário", "Secundário", "Fantasma"]) {
      expect(screen.getByRole("button", { name: nome }).className).toMatch(/focus-visible:ring-2/);
    }
  });

  it("dispara o clique", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Salvar</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("não dispara quando desabilitado", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Salvar
      </Button>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onClick).not.toHaveBeenCalled();
  });
});
