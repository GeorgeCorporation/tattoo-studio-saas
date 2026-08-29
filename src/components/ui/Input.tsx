import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { campoBase, campoBorda, campoBordaErro, classesCampo, mensagemErro, rotulo } from "@/components/ui/field-styles";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label: string;
  /** Texto fixo à esquerda do campo, como "R$". */
  prefix?: ReactNode;
  error?: string;
  /** Classes extras do campo. Use com parcimônia; o padrão cobre o caso comum. */
  inputClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, prefix, error, inputClassName, id, ...props },
  ref,
) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idErro = `${idCampo}-erro`;
  const temErro = Boolean(error);

  return (
    <div>
      <label className={rotulo} htmlFor={idCampo}>
        {label}
      </label>

      {prefix ? (
        // Com prefixo, a moldura e o foco ficam no invólucro; o campo em si
        // some visualmente para os dois lerem como um controle só.
        <div
          className={[
            "flex overflow-hidden rounded-xl border bg-surface transition",
            "focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30",
            temErro ? campoBordaErro : campoBorda,
          ].join(" ")}
        >
          <span className="border-r border-white/10 px-4 py-3 text-zinc-400">{prefix}</span>
          <input
            {...props}
            ref={ref}
            aria-describedby={temErro ? idErro : undefined}
            aria-invalid={temErro || undefined}
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-white outline-none"
            id={idCampo}
          />
        </div>
      ) : (
        <input
          {...props}
          ref={ref}
          aria-describedby={temErro ? idErro : undefined}
          aria-invalid={temErro || undefined}
          className={classesCampo(temErro, inputClassName)}
          id={idCampo}
        />
      )}

      {error ? (
        <span className={mensagemErro} id={idErro} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
});

// Reexporta para quem precisa montar um campo fora do padrão sem perder o foco.
export { campoBase, classesCampo };
