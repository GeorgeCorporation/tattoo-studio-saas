import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  /** Classes extras de posicionamento, como margens. Não usar para cor. */
  buttonClassName?: string;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition " +
  "outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60";

const porVariante: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-hover",
  secondary: "border border-white/10 bg-surface text-white hover:bg-white/5",
  ghost: "text-white hover:bg-white/5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", fullWidth, buttonClassName, type = "button", ...props },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      className={[base, porVariante[variant], fullWidth ? "w-full" : "", buttonClassName]
        .filter(Boolean)
        .join(" ")}
      type={type}
    />
  );
});
