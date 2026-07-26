export type ServiceTemplate = Readonly<{
  id: string;
  name: string;
  durationMinutes: number;
  description?: string;
}>;

export const SERVICE_TEMPLATES: readonly ServiceTemplate[] = [
  {
    id: "fine-line",
    name: "Fine Line",
    durationMinutes: 90,
    description: "Tatuagem com linhas finas, delicadas e detalhes precisos.",
  },
  {
    id: "blackwork",
    name: "Blackwork",
    durationMinutes: 180,
    description: "Tatuagem desenvolvida predominantemente com tinta preta e áreas de alto contraste.",
  },
  {
    id: "old-school",
    name: "Old School",
    durationMinutes: 180,
    description: "Tatuagem com traços marcados, composição clássica e cores sólidas.",
  },
  {
    id: "realismo",
    name: "Realismo",
    durationMinutes: 240,
    description: "Tatuagem focada em profundidade, luz, sombra e reprodução detalhada da referência.",
  },
  {
    id: "aquarela",
    name: "Aquarela",
    durationMinutes: 240,
    description: "Tatuagem com transições de cor e efeitos visuais inspirados em pintura aquarelada.",
  },
  {
    id: "cover-up",
    name: "Cover Up",
    durationMinutes: 240,
    description: "Projeto desenvolvido para cobrir ou transformar uma tatuagem existente.",
  },
  {
    id: "fechamento",
    name: "Fechamento",
    durationMinutes: 300,
    description: "Sessão destinada à composição ou continuidade de uma área extensa do corpo.",
  },
  {
    id: "lettering",
    name: "Lettering",
    durationMinutes: 90,
    description: "Tatuagem de palavras, frases ou letras com desenho tipográfico personalizado.",
  },
  {
    id: "minimalista",
    name: "Minimalista",
    durationMinutes: 60,
    description: "Tatuagem de composição simples, poucos elementos e acabamento limpo.",
  },
  {
    id: "tribal",
    name: "Tribal",
    durationMinutes: 180,
    description: "Tatuagem composta por formas marcadas, padrões e linhas de alto contraste.",
  },
];
