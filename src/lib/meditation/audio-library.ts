// Audio library - pre-recorded audio files for meditation sessions
// @ts-nocheck

import type { MeditationCategory } from "./types";

export interface AudioFile {
  id: string;
  title: string;
  category: MeditationCategory;
  duration: number; // seconds
  filename: string;
  description?: string;
  tags?: string[];
}

const audioFiles: AudioFile[] = [
  // Cura
  {
    id: "audio-cura-001",
    title: "Respiração Curativa",
    category: "cura",
    duration: 600,
    filename: "cura-respiracao-curativa.mp3",
    description: "Guia respiratório para ativação do sistema de cura natural.",
    tags: ["respiracao", "relaxamento", "iniciante"],
  },
  {
    id: "audio-cura-002",
    title: "Visualização do Branco",
    category: "cura",
    duration: 900,
    filename: "cura-visualizacao-branco.mp3",
    description: "Luz branca purificadora restaurando corpo e mente.",
    tags: ["visualizacao", "luz", "purificacao"],
  },
  {
    id: "audio-cura-003",
    title: "Abraço da Terra",
    category: "cura",
    duration: 720,
    filename: "cura-abraco-terra.mp3",
    description: "Conexão com a energia restauradora da Terra.",
    tags: ["terra", "grounding", "estabilidade"],
  },
  {
    id: "audio-cura-004",
    title: "Água Purificadora",
    category: "cura",
    duration: 480,
    filename: "cura-agua-purificadora.mp3",
    description: "Visualização de águas cristalinas lavando tensões.",
    tags: ["agua", "purificacao", "fluidez"],
  },
  {
    id: "audio-cura-005",
    title: "Cura do Coração",
    category: "cura",
    duration: 840,
    filename: "cura-coracao.mp3",
    description: "Liberação de feridas emocionais com compaixão.",
    tags: ["coracao", "emocoes", "compassao"],
  },

  // Sono
  {
    id: "audio-sono-001",
    title: "Noite Estrelada",
    category: "sono",
    duration: 1800,
    filename: "sono-noite-estrelada.mp3",
    description: "Contagem regressiva e soltar de pensamentos para adormecer.",
    tags: ["estrelas", "contagem", "adormecer"],
  },
  {
    id: "audio-sono-002",
    title: "Chuva Suave",
    category: "sono",
    duration: 2700,
    filename: "sono-chuva-suave.mp3",
    description: "Sons de chuva suave para relaxamento profundo.",
    tags: ["chuva", "natureza", "relaxamento"],
  },
  {
    id: "audio-sono-003",
    title: "Voo Noturno",
    category: "sono",
    duration: 1500,
    filename: "sono-voo-noturno.mp3",
    description: "Travessia serena pelo campo visual noturno.",
    tags: ["voo", "liberdade", "noturno"],
  },
  {
    id: "audio-sono-004",
    title: "Desligar a Mente",
    category: "sono",
    duration: 1200,
    filename: "sono-desligar-mente.mp3",
    description: "Técnica para silenciar o diálogo interno.",
    tags: ["silencio", "mente", "relaxamento"],
  },
  {
    id: "audio-sono-005",
    title: "Descida ao Sono",
    category: "sono",
    duration: 2400,
    filename: "sono-descida.mp3",
    description: "Descida gradual em ondas de relaxamento até o sono.",
    tags: ["ondas", "transicao", "sono"],
  },

  // Foco
  {
    id: "audio-foco-001",
    title: "Clareza Matinal",
    category: "foco",
    duration: 300,
    filename: "foco-claridade-matinal.mp3",
    description: "Despertar focado e energizado para o dia.",
    tags: ["manha", "energia", "produtividade"],
  },
  {
    id: "audio-foco-002",
    title: "Túnel de Foco",
    category: "foco",
    duration: 600,
    filename: "foco-tunel.mp3",
    description: "Focalização laser em uma única intenção.",
    tags: ["intencao", "concentracao", "claridade"],
  },
  {
    id: "audio-foco-003",
    title: "Pomodoro Meditativo",
    category: "foco",
    duration: 1500,
    filename: "foco-pomodoro.mp3",
    description: "Ciclos de foco intenso com pausas conscientes.",
    tags: ["pomodoro", "ciclos", "trabalho"],
  },
  {
    id: "audio-foco-004",
    title: "Presença Plena",
    category: "foco",
    duration: 420,
    filename: "foco-presenca.mp3",
    description: "Ancoragem no momento presente.",
    tags: ["presenca", "mindfulness", "agora"],
  },
  {
    id: "audio-foco-005",
    title: "Decisões Conscientes",
    category: "foco",
    duration: 540,
    filename: "foco-decisoes.mp3",
    description: " clareza para escolhas importantes.",
    tags: ["decisoes", "sabedoria", "escolha"],
  },

  // Energia
  {
    id: "audio-energia-001",
    title: "Despertar Solar",
    category: "energia",
    duration: 360,
    filename: "energia-despertar-solar.mp3",
    description: "Ativação da energia vital com visualização solar.",
    tags: ["sol", "vitalidade", "manha"],
  },
  {
    id: "audio-energia-002",
    title: "Corrente Ascendente",
    category: "energia",
    duration: 480,
    filename: "energia-corrente-ascendente.mp3",
    description: "Levantamento de energia kundalini para expansão.",
    tags: ["kundalini", "ascendente", "expansao"],
  },
  {
    id: "audio-energia-003",
    title: "Vulcão Interior",
    category: "energia",
    duration: 540,
    filename: "energia-vulcao.mp3",
    description: "Liberação de energia criativa reprimida.",
    tags: ["vulcao", "criatividade", "libertacao"],
  },
  {
    id: "audio-energia-004",
    title: "Respirações Explosivas",
    category: "energia",
    duration: 420,
    filename: "energia-respiracoes-explosivas.mp3",
    description: "Pranayamas ativadores de energia.",
    tags: ["pranayama", "ativacao", "energia"],
  },
  {
    id: "audio-energia-005",
    title: "Campo de Força",
    category: "energia",
    duration: 600,
    filename: "energia-campo-forca.mp3",
    description: "Construção de aura protetora energizada.",
    tags: ["aura", "protecao", "campo"],
  },

  // Sagrado
  {
    id: "audio-sagrado-001",
    title: "Sagrado Silêncio",
    category: "sagrado",
    duration: 1200,
    filename: "sagrado-silencio.mp3",
    description: "Mergulho no vazio sagrado onde tudo surge.",
    tags: ["silencio", "vazio", "contemplacao"],
  },
  {
    id: "audio-sagrado-002",
    title: "Invocação da Luz",
    category: "sagrado",
    duration: 900,
    filename: "sagrado-invocacao-luz.mp3",
    description: "Chamada consciente à luz superior.",
    tags: ["luz", "invocacao", "elevacao"],
  },
  {
    id: "audio-sagrado-003",
    title: "Mantra Fundamental",
    category: "sagrado",
    duration: 1080,
    filename: "sagrado-mantra.mp3",
    description: "Repetição sagrada para elevação de consciência.",
    tags: ["mantra", "repeticao", "vibracao"],
  },
  {
    id: "audio-sagrado-004",
    title: "Portais Dimensionais",
    category: "sagrado",
    duration: 1500,
    filename: "sagrado-portais.mp3",
    description: "Abertura consciente para outras dimensões.",
    tags: ["portais", "dimensoes", "expansao"],
  },
  {
    id: "audio-sagrado-005",
    title: "Comunhão Divina",
    category: "sagrado",
    duration: 1800,
    filename: "sagrado-comunhao.mp3",
    description: "Sessão profunda de conexão com o divino.",
    tags: ["divino", "conexao", "comunhao"],
  },
];

/**
 * Get the complete audio library
 */
export function getAudioLibrary(): AudioFile[] {
  return audioFiles;
}

/**
 * Get audio files by category
 */
export function getAudioByCategory(category: MeditationCategory): AudioFile[] {
  return audioFiles.filter((audio) => audio.category === category);
}

/**
 * Get a single audio file by ID
 */
export function getAudioById(id: string): AudioFile | undefined {
  return audioFiles.find((audio) => audio.id === id);
}

/**
 * Search audio files by title or description
 */
export function searchAudioLibrary(query: string): AudioFile[] {
  const lower = query.toLowerCase();
  return audioFiles.filter(
    (audio) =>
      audio.title.toLowerCase().includes(lower) ||
      audio.description?.toLowerCase().includes(lower) ||
      audio.tags?.some((tag) => tag.toLowerCase().includes(lower))
  );
}

/**
 * Get audio library statistics
 */
export function getAudioLibraryStats(): {
  total: number;
  byCategory: Record<MeditationCategory, number>;
  totalDuration: number;
} {
  const byCategory: Record<MeditationCategory, number> = {
    cura: 0,
    sono: 0,
    foco: 0,
    energia: 0,
    sagrado: 0,
  };

  let totalDuration = 0;

  audioFiles.forEach((audio) => {
    byCategory[audio.category]++;
    totalDuration += audio.duration;
  });

  return {
    total: audioFiles.length,
    byCategory,
    totalDuration,
  };
}