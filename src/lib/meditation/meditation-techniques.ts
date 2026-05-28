// Meditation techniques

export interface MeditationTechnique {
  id: string;
  name: string;
  description: string;
  duration: number; // seconds
  difficulty: "iniciante" | "intermediario" | "avancado";
  category: "respiracao" | "visualizacao" | "mantra" | "body-scan" | "mindfulness" | "transcendental";
  benefits: string[];
  instructions: string[];
}

const techniques: MeditationTechnique[] = [
  {
    id: "resp-profunda",
    name: "Respiração Profunda",
    description: "Técnica fundamental de respiração diafragmática para relaxamento e centração.",
    duration: 300,
    difficulty: "iniciante",
    category: "respiracao",
    benefits: ["Reduz ansiedade", "Diminui frequência cardíaca", "Melhora concentração"],
    instructions: [
      "Sente-se confortavelmente com a coluna ereta",
      "Coloque uma mão no peito e outra no abdômen",
      "Inspire profundamente pelo nariz por 4 segundos",
      "Segure o ar por 4 segundos",
      "Expire lentamente pela boca por 6 segundos",
      "Repita o ciclo mantendo consciência da respiração",
    ],
  },
  {
    id: "scan-corp",
    name: "Varredura Corporal",
    description: "Técnica de Body Scan para consciência corporal e libertação de tensões.",
    duration: 600,
    difficulty: "iniciante",
    category: "body-scan",
    benefits: ["Liberta tensões acumuladas", "Aumenta consciência corporal", "Promove relaxamento profundo"],
    instructions: [
      "Deite-se em uma posição confortável",
      "Feche os olhos e respire profundamente",
      "Comece a atenção no topo da cabeça",
      "Mova gradualmente a consciência pelo corpo",
      "Observe sensações sem julgamento",
      "Permaneça alguns segundos em cada região",
    ],
  },
  {
    id: "mantra-om",
    name: "Mantra Om",
    description: "Vibração do som sagrado Om para harmonização energética.",
    duration: 480,
    difficulty: "iniciante",
    category: "mantra",
    benefits: ["Harmoniza Chakras", "Calma a mente", "Energiza o corpo sutil"],
    instructions: [
      "Sente-se em posição de lótus ou com os pés no chão",
      "Feche os olhos e concentre-se no terceiro olho",
      "Inspire profundamente",
      "Na expiração, cante 'Om' de forma prolongada",
      "Sinta a vibração ressoar no corpo",
      "Permita que o som se dissolva naturalmente",
    ],
  },
  {
    id: "visualizacao-cura",
    name: "Visualização de Cura",
    description: "Imaginação guiada para cura emocional e renovação celular.",
    duration: 900,
    difficulty: "intermediario",
    category: "visualizacao",
    benefits: ["Acelera processo de cura", "Renova células", "Libera memórias emocionais"],
    instructions: [
      "Respire profundamente entrando em estado relaxado",
      "Visualize uma luz dourada acima da cabeça",
      "Permita que a luz penetre lentamente pelo corpo",
      "Observe áreas de tensão ou escuridão sendo iluminadas",
      "Permita que a luz cure e renove cada célula",
      "Integre a energia de cura em todo o ser",
    ],
  },
  {
    id: "mindfulness-respiracao",
    name: "Mindfulness de Respiração",
    description: "Prática de atenção plena focada na respiração natural.",
    duration: 600,
    difficulty: "iniciante",
    category: "mindfulness",
    benefits: ["Aumenta presença", "Reduz ruminância mental", "Desenvolve concentração"],
    instructions: [
      "Sente-se confortavelmente mantendo a coluna ereta",
      "Observe a respiração natural sem modificá-la",
      "Note as sensações da inspiração e expiração",
      "Quando a mente divagar, gentilmente retorne ao foco",
      "Permaneça como testemunha da respiração",
      "Abrace cada momento com consciência plena",
    ],
  },
  {
    id: "transcendental-silencio",
    name: "Silêncio Transcendental",
    description: "Técnica de meditação em silêncio profundo para acesso à consciência pura.",
    duration: 1200,
    difficulty: "avancado",
    category: "transcendental",
    benefits: ["Acessa estados expandidos de consciência", "Promove clareza mental", "Reduz estresse profundo"],
    instructions: [
      "Encontre um ambiente absolutamente silencioso",
      "Sente-se em postura meditativa estável",
      "Feche os olhos e relaxe profundamente",
      "Permita que todo esforço mental cesse",
      "Descanse na consciência silenciosa",
      "Retorne gradualmente ao estado ordinário",
    ],
  },
  {
    id: "resp-quadrada",
    name: "Respiração Quadrada",
    description: "Respiração em quatro tempos para equilíbrio e foco.",
    duration: 300,
    difficulty: "iniciante",
    category: "respiracao",
    benefits: ["Equilibra sistema nervoso", "Melhora foco", "Reduz estresse agudo"],
    instructions: [
      "Inspire contando até 4",
      "Segure o ar contando até 4",
      "Expire contando até 4",
      "Segure o pulmão vazio contando até 4",
      "Mantenha o ritmo constante",
      "Pratique por pelo menos 5 minutos",
    ],
  },
  {
    id: "visualizacao-cristal",
    name: "Cristal de Luz",
    description: "Visualização de energia cristalina para purificação e proteção.",
    duration: 720,
    difficulty: "intermediario",
    category: "visualizacao",
    benefits: ["Purifica campo energético", "Cria proteção", "Eleva frequência vibratória"],
    instructions: [
      "Entre em estado meditativo profundo",
      "Visualize um cristal puro e radiante",
      "Permita que o cristal absorva impurezas do seu campo",
      "Observe a luz se intensificar a cada ciclo",
      "Sinta-se envolvido pela energia purificada",
      "Torne-se um com a luz cristalina",
    ],
  },
];

export function getTechniques(): MeditationTechnique[] {
  return techniques;
}

export function getTechniqueById(id: string): MeditationTechnique | undefined {
  return techniques.find((t) => t.id === id);
}

export function getTechniquesByCategory(category: MeditationTechnique["category"]): MeditationTechnique[] {
  return techniques.filter((t) => t.category === category);
}

export function getTechniquesByDifficulty(difficulty: MeditationTechnique["difficulty"]): MeditationTechnique[] {
  return techniques.filter((t) => t.difficulty === difficulty);
}