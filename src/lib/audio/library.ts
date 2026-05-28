export interface Meditation {
  id: string;
  title: string;
  category: "cura" | "sono" | "foco" | "energia";
  duration: number; // seconds
  audioUrl: string;
  description?: string;
}

const meditations: Meditation[] = [
  // Cura
  {
    id: "cura-001",
    title: "Respiração Reparadora",
    category: "cura",
    duration: 600,
    audioUrl: "/audio/cura/respiracao-reparadora.mp3",
    description: "Reduz stress e ativa o sistema nervoso parassimpático.",
  },
  {
    id: "cura-002",
    title: "Campo de Healing",
    category: "cura",
    duration: 900,
    audioUrl: "/audio/cura/campo-healing.mp3",
    description: "Canaliza energia restauradora para o corpo e mente.",
  },
  {
    id: "cura-003",
    title: "Liberação Emocional",
    category: "cura",
    duration: 720,
    audioUrl: "/audio/cura/liberacao-emocional.mp3",
    description: "Dissolve bloqueios emocionais com técnicas de visualização.",
  },

  // Sono
  {
    id: "sono-001",
    title: "Noite de Paz Profunda",
    category: "sono",
    duration: 1800,
    audioUrl: "/audio/sono/noite-paz-profunda.mp3",
    description: "Prepare o corpo para um sono restaurador e profundo.",
  },
  {
    id: "sono-002",
    title: "Desligar a Mente",
    category: "sono",
    duration: 1200,
    audioUrl: "/audio/sono/desligar-mente.mp3",
    description: "Guia para silenciar pensamentos e relaxar completamente.",
  },
  {
    id: "sono-003",
    title: "Travesseiro de Nuvens",
    category: "sono",
    duration: 1500,
    audioUrl: "/audio/sono/travesseiro-nuvens.mp3",
    description: "Meditação suave para adormecer com facilidade.",
  },

  // Foco
  {
    id: "foco-001",
    title: "Clareza Mental",
    category: "foco",
    duration: 480,
    audioUrl: "/audio/foco/clareza-mental.mp3",
    description: "Aguça a concentração antes de tarefas importantes.",
  },
  {
    id: "foco-002",
    title: "Estado de Flow",
    category: "foco",
    duration: 600,
    audioUrl: "/audio/foco/estado-flow.mp3",
    description: "Atinge o estado de imersão total em suas atividades.",
  },
  {
    id: "foco-003",
    title: "Produtividade Sagrada",
    category: "foco",
    duration: 900,
    audioUrl: "/audio/foco/produtividade-sagrada.mp3",
    description: "Transforma o trabalho em prática espiritual.",
  },

  // Energia
  {
    id: "energia-001",
    title: "Despertar Interior",
    category: "energia",
    duration: 300,
    audioUrl: "/audio/energia/despertar-interior.mp3",
    description: "Ativa vitalidade e renovação matinal.",
  },
  {
    id: "energia-002",
    title: "Chakra Raiz",
    category: "energia",
    duration: 600,
    audioUrl: "/audio/energia/chakra-raiz.mp3",
    description: "Fortalece a conexão com a energia terrestrial e força vital.",
  },
  {
    id: "energia-003",
    title: " Explosão de Vitalidade",
    category: "energia",
    duration: 480,
    audioUrl: "/audio/energia/explosao-vitalidade.mp3",
    description: "Recarrega as baterias em minutos com energia pura.",
  },
];

export function getMeditations(): Meditation[] {
  return meditations;
}

export function getMeditationById(id: string): Meditation | undefined {
  return meditations.find((m) => m.id === id);
}