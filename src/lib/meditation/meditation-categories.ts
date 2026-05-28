export type MeditationCategoryId = "cura" | "sono" | "foco" | "energia" | "sagrado";

export interface MeditationCategory {
  id: MeditationCategoryId;
  name: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  benefits: string[];
}

const categories: MeditationCategory[] = [
  {
    id: "cura",
    name: "cura",
    label: "Cura",
    description: "Meditações focadas em autocuidado, recuperação emocional e renovação interior.",
    icon: "heart",
    color: "#e91e63",
    benefits: [
      "Recuperação emocional",
      "Autocuidado profundo",
      "Renovação interior",
      "Redução de ansiedade",
      "Harmonização energética",
    ],
  },
  {
    id: "sono",
    name: "sono",
    label: "Sono",
    description: "Práticas para relaxamento profundo e preparo para um sono restaurador.",
    icon: "moon",
    color: "#3f51b5",
    benefits: [
      "Relaxamento profundo",
      "Sono restaurador",
      "Redução de insônia",
      "Calma mental",
      "Preparo para descanso",
    ],
  },
  {
    id: "foco",
    name: "foco",
    label: "Foco",
    description: "Exercícios para concentração, clareza mental e produtividade consciente.",
    icon: "target",
    color: "#2196f3",
    benefits: [
      "Concentração aprimorada",
      "Clareza mental",
      "Produtividade consciente",
      "Foco sustentado",
      "Tomada de decisão",
    ],
  },
  {
    id: "energia",
    name: "energia",
    label: "Energia",
    description: "Ativações para despertar vitalidade, motivação e expansão de consciência.",
    icon: "zap",
    color: "#ff9800",
    benefits: [
      "Despertar vitalidade",
      "Motivação renovada",
      "Expansão de consciência",
      "Ativação do potencial",
      "Energia positivada",
    ],
  },
  {
    id: "sagrado",
    name: "sagrado",
    label: "Sagrado",
    description: "Conexão com o transcendente, práticas devocionais e elevação espiritual.",
    icon: "star",
    color: "#9c27b0",
    benefits: [
      "Conexão transcendente",
      "Práticas devocionais",
      "Elevação espiritual",
      "Sintonização superior",
      "Caminho iluminado",
    ],
  },
];

export function getCategories(): MeditationCategory[] {
  return [...categories];
}

export function getCategoryById(id: string): MeditationCategory | undefined {
  return categories.find((c) => c.id === id);
}