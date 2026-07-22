export type ServiceDraftInput = {
  name: string;
  description?: string;
  startingPrice?: number | null;
  durationMinutes: number;
};

export function validateServiceInput(input: ServiceDraftInput): string {
  if (!input.name.trim()) return "Nome é obrigatório.";

  if (!Number.isFinite(input.durationMinutes) || !Number.isInteger(input.durationMinutes) || input.durationMinutes < 30) {
    return "Informe uma duração média válida de pelo menos 30 minutos.";
  }

  if (input.startingPrice != null && (!Number.isFinite(input.startingPrice) || input.startingPrice < 0)) {
    return "Informe um preço inicial válido.";
  }

  return "";
}
