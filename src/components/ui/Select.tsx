import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { classesCampo, mensagemErro, rotulo } from "@/components/ui/field-styles";

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & {
  label: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, id, children, ...props },
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

      <select
        {...props}
        ref={ref}
        aria-describedby={temErro ? idErro : undefined}
        aria-invalid={temErro || undefined}
        className={classesCampo(temErro)}
        id={idCampo}
      >
        {children}
      </select>

      {error ? (
        <span className={mensagemErro} id={idErro} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
});
