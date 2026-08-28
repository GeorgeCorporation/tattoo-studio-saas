import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

describe("Input", () => {
  it("associa o rótulo ao campo", () => {
    render(<Input label="Nome" />);
    expect(screen.getByLabelText("Nome")).toBeInTheDocument();
  });

  it("sempre declara estilo de foco visível", () => {
    render(<Input label="Nome" />);
    // O defeito que motivou o componente: 105 campos do app não tinham
    // nenhuma indicação de foco, deixando quem navega por teclado sem saber
    // onde está.
    expect(screen.getByLabelText("Nome").className).toMatch(/focus:border-brand/);
  });

  it("aceita digitação e propaga a mudança", async () => {
    const onChange = vi.fn();
    render(<Input label="Nome" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText("Nome"), "Ana");

    expect(onChange).toHaveBeenCalled();
  });

  it("mostra o prefixo sem quebrar a associação do rótulo", () => {
    render(<Input label="Preço inicial" prefix="R$" type="number" />);

    expect(screen.getByText("R$")).toBeInTheDocument();
    expect(screen.getByLabelText("Preço inicial")).toHaveAttribute("type", "number");
  });

  it("anuncia o erro e marca o campo como inválido", () => {
    render(<Input label="Nome" error="Nome é obrigatório" />);

    const campo = screen.getByLabelText("Nome");
    expect(campo).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Nome é obrigatório");
  });

  it("não marca como inválido quando não há erro", () => {
    render(<Input label="Nome" />);
    expect(screen.getByLabelText("Nome")).not.toHaveAttribute("aria-invalid", "true");
  });

  it("repassa atributos nativos", () => {
    render(<Input label="Idade" max="99" min="1" required type="number" />);

    const campo = screen.getByLabelText("Idade");
    expect(campo).toBeRequired();
    expect(campo).toHaveAttribute("min", "1");
    expect(campo).toHaveAttribute("max", "99");
  });
});

describe("Textarea", () => {
  it("associa o rótulo e declara foco visível", () => {
    render(<Textarea label="Descrição" />);

    const campo = screen.getByLabelText("Descrição");
    expect(campo.tagName).toBe("TEXTAREA");
    expect(campo.className).toMatch(/focus:border-brand/);
  });

  it("anuncia o erro", () => {
    render(<Textarea label="Descrição" error="Muito longa" />);

    expect(screen.getByLabelText("Descrição")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Muito longa");
  });
});
