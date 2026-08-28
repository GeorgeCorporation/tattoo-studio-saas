/**
 * Estilo único de campo de formulário.
 *
 * Existe porque o app tinha 105 elementos de campo sem nenhuma indicação de
 * foco contra 18 com — quem navega por teclado não conseguia ver onde estava.
 * O anel de foco faz parte da base, não é opcional por chamada.
 */
export const campoBase =
  "w-full rounded-xl border bg-surface px-4 py-3 text-white outline-none transition " +
  "placeholder:text-zinc-500 focus:border-brand focus:ring-2 focus:ring-brand/30 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export const campoBorda = "border-white/10";
export const campoBordaErro = "border-red-500/70";

export const rotulo = "mb-2 block text-sm font-medium";

export const mensagemErro = "mt-2 block text-sm text-red-400";

export function classesCampo(temErro: boolean, extra?: string) {
  return [campoBase, temErro ? campoBordaErro : campoBorda, extra].filter(Boolean).join(" ");
}
