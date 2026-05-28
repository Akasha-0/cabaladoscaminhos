// Meditation types

export type MeditationCategory = "cura" | "sono" | "foco" | "energia" | "sagrado";

export interface MeditationPhase {
  name: string;
  duration: number; // seconds
  script: string;
  guidance: string;
}

export interface Meditation {
  id: string;
  title: string;
  category: MeditationCategory;
  duration: number; // seconds
  phases: MeditationPhase[];
  description?: string;
  tags?: string[];
}

export interface MeditationSeries {
  id: string;
  name: string;
  duration: number;
  description: string;
  benefits: string[];
}

export type MeditationCategories = MeditationCategory[];

export interface MeditationTypeDefinition {
  category: MeditationCategory;
  label: string;
  description: string;
}

const types: MeditationTypeDefinition[] = [
  {
    category: "cura",
    label: "Cura",
    description: "Meditações focadas em autocuidado, recuperação emocional e renovação interior.",
  },
  {
    category: "sono",
    label: "Sono",
    description: "Práticas para relaxamento profundo e preparo para um sono restaurador.",
  },
  {
    category: "foco",
    label: "Foco",
    description: "Exercícios para concentração, clareza mental e produtividade consciente.",
  },
  {
    category: "energia",
    label: "Energia",
    description: "Ativações para despertar vitalidade, motivação e expansão de consciência.",
  },
  {
    category: "sagrado",
    label: "Sagrado",
    description: "Conexão com o transcendente, práticas devocionais e elevação espiritual.",
  },
];

export function getTypes(): MeditationTypeDefinition[] {
  return types;
}

export function getCategories(): MeditationCategories {
  return ["cura", "sono", "foco", "energia", "sagrado"];
}
