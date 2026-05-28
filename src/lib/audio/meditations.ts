export interface Meditation {
  id: string;
  title: string;
  category: "cura" | "sono" | "foco" | "energia";
  duration: number;
  audioUrl: string;
  description?: string;
}

const meditations: Meditation[] = [
  // Cura
  {
    id: "cura-harmonizacao",
    title: "Harmonização Energética",
    category: "cura",
    duration: 600,
    audioUrl: "/audio/meditations/cura-harmonizacao.mp3",
    description: "Restaura o equilíbrio dos chakras através de frequencies restaurativas.",
  },
  {
    id: "cura-autocompas",
    title: "Autocompaixão",
    category: "cura",
    duration: 480,
    audioUrl: "/audio/meditations/cura-autocompas.mp3",
    description: "Desenvolve amor-próprio e aceitação através de visualização guiada.",
  },
  {
    id: "cura-libera trauma",
    title: "Liberação de Trauma",
    category: "cura",
    duration: 720,
    audioUrl: "/audio/meditations/cura-libera-trauma.mp3",
    description: " Facilita o processamento emocional e libertação de memórias dolorosas.",
  },
  {
    id: "cura-reiki",
    title: "Reiki Guiado",
    category: "cura",
    duration: 540,
    audioUrl: "/audio/meditations/cura-reiki.mp3",
    description: " Canaliza energia curativa com símbolos sagrados de cura.",
  },

  // Sono
  {
    id: "sono-profundidade",
    title: "Descida à Profundidade",
    category: "sono",
    duration: 1200,
    audioUrl: "/audio/meditations/sono-profundidade.mp3",
    description: " Mergulho profundo no relaxamento para noite de sono restauradora.",
  },
  {
    id: "sono-ondas delta",
    title: "Ondas Delta",
    category: "sono",
    duration: 900,
    audioUrl: "/audio/meditations/sono-ondas-delta.mp3",
    description: " Sintetiza ondas cerebrais delta para sono profundo.",
  },
  {
    id: "sono-joshua",
    title: "Joshuá no Espaço",
    category: "sono",
    duration: 1080,
    audioUrl: "/audio/meditations/sono-joshua.mp3",
    description: " jornada celestial guiada para paz interior noturna.",
  },
  {
    id: "sono-mandalha",
    title: "Mandala de Relaxamento",
    category: "sono",
    duration: 780,
    audioUrl: "/audio/meditations/sono-mandalha.mp3",
    description: " Visualização de mandala colorido para acalmar a mente.",
  },

  // Foco
  {
    id: "foco-claridade",
    title: "Clareza Mental",
    category: "foco",
    duration: 300,
    audioUrl: "/audio/meditations/foco-claridade.mp3",
    description: " Aumenta concentração e clareza mental para tarefas importantes.",
  },
  {
    id: "foco-intencao",
    title: "Intenção do Dia",
    category: "foco",
    duration: 420,
    audioUrl: "/audio/meditations/foco-intencao.mp3",
    description: " Define intenção clara para o dia com foco renovado.",
  },
  {
    id: "foco-flow",
    title: "Estado de Flow",
    category: "foco",
    duration: 360,
    audioUrl: "/audio/meditations/foco-flow.mp3",
    description: " Acessa o estado de fluxo criativo e produtividade.",
  },
  {
    id: "foco-visualiza",
    title: "Visualização Criativa",
    category: "foco",
    duration: 480,
    audioUrl: "/audio/meditations/foco-visualiza.mp3",
    description: " Treina visualização para manifestar objetivos.",
  },

  // Energia
  {
    id: "energia-manha",
    title: "Despertar Matinal",
    category: "energia",
    duration: 300,
    audioUrl: "/audio/meditations/energia-manha.mp3",
    description: " Ativa energia vital e motivação para o dia.",
  },
  {
    id: "energia-solar",
    title: "Chakra Solar",
    category: "energia",
    duration: 420,
    audioUrl: "/audio/meditations/energia-solar.mp3",
    description: " Fortalece o chakra manipura para poder pessoal.",
  },
  {
    id: "energia-vital",
    title: "Prana Vital",
    category: "energia",
    duration: 360,
    audioUrl: "/audio/meditations/energia-vital.mp3",
    description: " Aumenta o fluxo de prana através de respiração energizante.",
  },
  {
    id: "energia-protecao",
    title: "Escudo Energético",
    category: "energia",
    duration: 480,
    audioUrl: "/audio/meditations/energia-protecao.mp3",
    description: " Cria campo de proteção contra energias negativas.",
  },
];

export function getMeditations(): Meditation[] {
  return meditations;
}

export function getMeditationById(id: string): Meditation | undefined {
  return meditations.find((m) => m.id === id);
}