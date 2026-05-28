// Ritual types

export type RitualCategory =
  | "protection"
  | "prosperity"
  | "love"
  | "healing"
  | "clarity"
  | "transformation"
  | "manifestation"
  | "release";

export interface RitualTypeDefinition {
  category: RitualCategory;
  label: string;
  description: string;
}

const types: RitualTypeDefinition[] = [
  {
    category: "protection",
    label: "Proteção",
    description: "Rituais para criar escudos energeticos, afastar influencias negativas e purificar o espaco sagrado.",
  },
  {
    category: "prosperity",
    label: "Prosperidade",
    description: "Praticas para atrair abundancia, oportunidades e prosperidade em todas as areas da vida.",
  },
  {
    category: "love",
    label: "Amor",
    description: "Rituais para fortalecer relacionamentos, autoamor, conexoes afetivas e curacao emocional.",
  },
  {
    category: "healing",
    label: "Cura",
    description: "Praticas para curacao fisica, emocional, espiritual e liberacao de bloqueios energeticos.",
  },
  {
    category: "clarity",
    label: "Clareza",
    description: "Rituais para ampliar a visao spiritual, intuicao e conexao com a sabedoria interior.",
  },
  {
    category: "transformation",
    label: "Transformacao",
    description: "Praticas para mudancas profundas, renovacao interior e evolucao da consciencia.",
  },
  {
    category: "manifestation",
    label: "Manifestacao",
    description: "Rituais para materializar intencos, concretizar desejos e alinhar com propositos.",
  },
  {
    category: "release",
    label: "Liberacao",
    description: "Praticas para soltar o que nao serve mais, perdoar, libertar-se e encontrar paz.",
  },
];

export function getTypes(): RitualTypeDefinition[] {
  return types;
}

export function getCategories(): RitualCategory[] {
  return [
    "protection",
    "prosperity",
    "love",
    "healing",
    "clarity",
    "transformation",
    "manifestation",
    "release",
  ];
}
