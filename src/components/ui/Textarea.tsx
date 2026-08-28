import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { classesCampo, mensagemErro, rotulo } from "@/components/ui/field-styles";

export type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
  label: string;
  error?: string;
  /** Classes extras do campo, tipicamente a altura mínima. */
  textareaClassName?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, textareaClassName = "min-h-28", id, ...props },
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

      <textarea
        {...props}
        ref={ref}
        aria-describedby={temErro ? idErro : undefined}
        aria-invalid={temErro || undefined}
        className={classesCampo(temErro, textareaClassName)}
        id={idCampo}
      />

      {error ? (
        <span className={mensagemErro} id={idErro} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
});
