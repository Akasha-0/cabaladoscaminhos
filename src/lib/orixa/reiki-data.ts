// @ts-nocheck
// SKIP_LINT

/**
 * Reiki Data Module
 * Spiritual data for Reiki, the sacred art of universal life force energy healing
 * Reiki represents divine healing energy, spiritual balance, and cosmic well-being
 */

/**
 * Main Reiki Data Interface
 */
export interface ReikiData {
  id: string;
  name: string;
  namePortuguese: string;
  origin: string;
  foundation: {
    founder: string;
    year: number;
    location: string;
    transmission: string;
  };
  philosophy: string;
  principles: string[];
  energyType: string;
  healingDimensions: string[];
  domains: string[];
  sacredObjects: string[];
  symbols: {
    name: string;
    meaning: string;
    usage: string;
  }[];
  attunementDegrees: {
    level: number;
    name: string;
    description: string;
    practices: string[];
  }[];
  handPositions: {
    area: string;
    description: string;
    duration: string;
  }[];
  healingTechniques: {
    name: string;
    description: string;
    application: string;
  }[];
  sacredTimes: string[];
  associatedOrixas: string[];
  elements: string[];
  affirmation: string;
  meditation: string;
  invocationPhrases: string[];
  dayOfWeek: string;
  element: string;
  colors: string[];
  numbers: number[];
  phrases: {
    power: string;
    emotional: string;
    mental: string;
    spiritual: string;
  };
  protocols: {
    beforeSession: string[];
    duringSession: string[];
    afterSession: string[];
  };
}

/**
 * Main Reiki Data
 */
const REIKI_DATA: ReikiData = {
  id: "reiki",
  name: "Reiki",
  namePortuguese: "Reiki",
  origin: "Japão",
  foundation: {
    founder: "Mikao Usui",
    year: 1922,
    location: "Quioto, Japão",
    transmission: "Linha Mikao Usui → Hawayo Takata →Linhas Ocidentais e Orientais",
  },
  philosophy:
    "Reiki é um sistema de cura natural que canaliza a energia vital universal através das mãos, promovendo equilíbrio físico, emocional, mental e espiritual. Baseia-se na crença de que todos possuímos uma capacidade inata de cura através do toque sagrado e da conexão com a energia cósmica.",
  principles: [
    "Só por hoje, não se preocupe",
    "Só por hoje, não se irrite",
    "Só por hoje, seja grato",
    "Só por hoje, seja honesto consigo mesmo",
    "Só por hoje, seja gentil com todos os seres",
    "A energia flui onde a intenção vai",
    "O toque sagrado conecta com o divino",
    "A cura acontece quando corpo, mente e espírito estão em harmonia",
  ],
  energyType: "Energia Vital Universal (Ki/Chi/Prana)",
  healingDimensions: [
    "Físico",
    "Emocional",
    "Mental",
    "Espiritual",
    "Energético",
    "Chacras",
    "Campos Áuricos",
  ],
  domains: [
    "Cura pelo toque",
    "Canalização de energia",
    "Equilíbrio dos chakras",
    "Harmonização de campos áuricos",
    "Alívio de dores",
    "Redução de estresse",
    "Promoção de relaxamento profundo",
    "Aceleração da recuperação",
    "Liberação de bloqueios emocionais",
    "Conexão espiritual",
  ],
  sacredObjects: [
    "Cristais de quartzo",
    "Pêndulo de cura",
    "Símbolos sagrados (shier)}",
    "Prancha de símbolos",
    "Pebraneiras",
    " incensos sagrados",
    "Água ritualizada",
    "Pedras de Cura",
  ],
  symbols: [
    {
      name: "Cho Ku Rei",
      meaning: "Poder Universal",
      usage: "Amplificação de energia, ativação de pontos",
    },
    {
      name: "Sei He Ki",
      meaning: "Harmonia emocional e mental",
      usage: "Equilíbrio emocional, cura de traumas",
    },
    {
      name: "Hon Sha Ze Sho Nen",
      meaning: "Conexãopast life)",
      usage: "Healing de causas raiz, conexões cósmicas",
    },
    {
      name: "Dai Ko Myo",
      meaning: "Iluminação Espiritual",
      usage: "Abertura espiritual, maestria interior",
    },
  ],
  attunementDegrees: [
    {
      level: 1,
      name: "Reiki Nivel I (Shoden)",
      description:
        "Iniciação à cura pelo toque. O praticante aprende a canalizar energia através das mãos e a utilizá-la para autocura e cura básica de outros.",
      practices: [
        "Canalização de energia básica",
        "Posicionamento de mãos para autocura",
        "Posicionamento de mãos para cura em outros",
        "Meditação de conexão com Ki",
        "Habilidade de sentir a energia",
      ],
    },
    {
      level: 2,
      name: "Reiki Nivel II (Okuden)",
      description:
        "Amplificação da energia através dos símbolos sagrados. O praticante aprende a utilizar os símbolos de poder, emocional e mental para cura à distância.",
      practices: [
        "Uso do símbolo Cho Ku Rei",
        "Uso do símbolo Sei He Ki",
        "Uso do símbolo Hon Sha Ze Sho Nen",
        "Cura à distância",
        "Envio de energia para pessoas ausentes",
        "Canalização de energia temporal",
      ],
    },
    {
      level: 3,
      name: "Reiki Nivel III (Shinpiden)",
      description:
        "Aprofundamento espiritual e conexão com a maestria. O praticante desenvolve uma relação mais profunda com a energia e aprende o símbolo Dai Ko Myo.",
      practices: [
        "Uso do símbolo Dai Ko Myo",
        "Meditação profunda",
        "Conexão com linha de transmissão",
        "Desenvolvimento de intuição",
        "Prática de cura avançada",
        "Sintonização com mestres ascendidos",
      ],
    },
    {
      level: 4,
      name: "Reiki Mestre/Profess)",
      description:
        "Maestria completa e capacidade de iniciar outros. O praticante assume a responsabilidade de transmitir a linhagem de Reiki.",
      practices: [
        "Iniciação de novos praticantes",
        "Transmissão da linhagem",
        "Ensino de técnicas avançadas",
        "Criação de protocolos personalizados",
        "Liderança espiritual",
        "Comunhão com a energia cósmica",
      ],
    },
  ],
  handPositions: [
    {
      area: "Cabeça (coroa)",
      description: "Mãos sobre o topo da cabeça para equilibrar energia espiritual",
      duration: "3-5 minutos",
    },
    {
      area: "Terceiro Olho",
      description: "Mãos sobre o centro da testa para abrir percepção intuitiva",
      duration: "3-5 minutos",
    },
    {
      area: "Olhos",
      description: "Toque suave sobre os olhos para harmonizar visão interior",
      duration: "2-3 minutos",
    },
    {
      area: "Orelhas",
      description: "Mãos cobrindo as orelhas para equilibrar audição espiritual",
      duration: "2-3 minutos",
    },
    {
      area: "Boca/Queixo",
      description: "Toque suave na região do queixo para harmonizar expressão",
      duration: "2-3 minutos",
    },
    {
      area: "Nuca",
      description: "Mãos na nuca para proteção e clareza mental",
      duration: "3-5 minutos",
    },
    {
      area: "Ombros",
      description: "Mãos sobre os ombros para libertar tensões",
      duration: "3-5 minutos",
    },
    {
      area: "Coração",
      description: "Mãos sobre o coração para cura emocional",
      duration: "5-7 minutos",
    },
    {
      area: "Pulmões",
      description: "Mãos sobre os pulmões para respiração sagrada",
      duration: "3-5 minutos",
    },
    {
      area: "Estômago",
      description: "Mãos sobre o estômago para digestão energética",
      duration: "3-5 minutos",
    },
    {
      area: "Fígado",
      description: "Mãos sobre o fígado para desintoxicação",
      duration: "3-5 minutos",
    },
    {
      area: "Rins",
      description: "Mãos sobre os rins para vitalidade e medo",
      duration: "3-5 minutos",
    },
    {
      area: "Abdômen inferior",
      description: "Mãos sobre o baixo ventre para energia primal",
      duration: "3-5 minutos",
    },
    {
      area: "Pelve",
      description: "Mãos sobre a pelve para equilíbrio básico",
      duration: "3-5 minutos",
    },
    {
      area: "Joelhos",
      description: "Mãos sobre os joelhos para flexibilidade",
      duration: "3-5 minutos",
    },
    {
      area: "Pés",
      description: "Mãos sob os pés para conexão com a terra",
      duration: "5-7 minutos",
    },
  ],
  healingTechniques: [
    {
      name: "Cura em Posições de Mãos",
      description:
        "Técnica clássica de Reiki onde as mãos são posicionadas em pontos específicos do corpo para canalizar energia curativa.",
      application: "Autocura e cura em outras pessoas",
    },
    {
      name: "Cura à Distância",
      description:
        "Envio de energia Reiki através do espaço e tempo utilizando o símbolo Hon Sha Ze Sho Nen.",
      application: "Pessoas ausentes, situações passadas ou futuras",
    },
    {
      name: "Meditação Gassho",
      description:
        "Meditação de conexão com a energia através da junção das mãos em oração.",
      application: "Centramento, conexão espiritual, gratidão",
    },
    {
      name: "Byosen Reikan Ho",
      description:
        "Varredura energética do corpo para detectar e curar bloqueios.",
      application: "Identificação de áreas que precisam de cura",
    },
    {
      name: "Koki Ho",
      description:
        "Cura por fricção energética utilizando Cho Ku Rei para amplificar a energia.",
      application: "Pontos específicos, chakras, áreas de dor",
    },
    {
      name: "Hatsurei Ko",
      description:
        "Técnica de canalização de energia em posição sentada ou em pé.",
      application: "Autocura, proteção, amplificação",
    },
    {
      name: "Cura com Cristais",
      description:
        "Integração de cristais com Reiki para amplificar a cura.",
      application: "Chakras, campos áuricos, intenção específica",
    },
    {
      name: "Cura Neliri",
      description:
        "Cura ocular para problemas de visão e percepção.",
      application: "Olhos, terceiro olho, percepção",
    },
  ],
  sacredTimes: [
    "Manhã cedo (alvorada)",
    "Lua Cheia",
    "Equinócio",
    "Solstício",
    "Dias de cura específica",
    "Momento de gratidão",
    "Antes de dormir",
  ],
  associatedOrixas: ["Oxum", "Oxalá", "Iemanjá", "Ogum"],
  elements: ["Energia", "Luz", "Fogo", "Água", "Ar", "Terra"],
  affirmation:
    "A energia vital universal flui através de mim com amor, luz e poder curativo. Eu sou um canal de paz, harmonia e cura infinita.",
  meditation:
    "Sente-se em silêncio. Deixe suas mãos se reunirem em Gassho. Respire profundamente e sinta a energia universal entrando pelo topo de sua cabeça. Permita que ela flua através de você como um rio de luz dourada, preenchendo cada célula, cada órgão, cada emoção. Sinta-se um com o universo.",
  invocationPhrases: [
    "Que a energia vital universal me preencha",
    "Eu sou um canal de cura pura",
    "Que esta energia traga paz e harmonia",
    "O poder está em mim",
    "Gratidão pela energia que flui",
  ],
  dayOfWeek: "Segunda-feira",
  element: "Energia Vital Universal",
  colors: ["Dourado", "Branco", "Verde", "Rosa", "Azul Claro", "Roxo"],
  numbers: [3, 5, 7, 21, 100],
  phrases: {
    power: "Cho Ku Rei - O poder do universo está em minhas mãos",
    emotional: "Sei He Ki - Que a harmonia emocional me goberne",
    mental: "Hon Sha Ze Sho Nen - Conexão com a sabedoria cósmica",
    spiritual: "Dai Ko Myo - Que a luz divina me ilumine",
  },
  protocols: {
    beforeSession: [
      "Desconectar-se de preocupações",
      "Tomar água energizada",
      "Fazer uma prece de agradecimento",
      "Centrar-se através de respiração",
      "Lembrar os princípios de Reiki",
    ],
    duringSession: [
      "Manter intenção pura de cura",
      "Permitir que a energia flua naturalmente",
      "Confiar na sabedoria da energia",
      "Manter coração aberto",
      "Não forçar, apenas permitir",
    ],
    afterSession: [
      "Agradecer pela sessão de cura",
      "Beber água energizada",
      "Registrar experiências e insights",
      "Descansar adequadamente",
      "Permitir que o corpo processe a cura",
    ],
  },
};

/**
 * Get all Reiki data
 */
export function getData(): ReikiData {
  return REIKI_DATA;
}

/**
 * Get Reiki data by ID
 */
export function getDataById(id: string): ReikiData | undefined {
  return id === "reiki" ? REIKI_DATA : undefined;
}

/**
 * Get symbols
 */
export function getSymbols(): ReikiData["symbols"] {
  return REIKI_DATA.symbols;
}

/**
 * Get attunement degrees
 */
export function getAttunementDegrees(): ReikiData["attunementDegrees"] {
  return REIKI_DATA.attunementDegrees;
}

/**
 * Get hand positions
 */
export function getHandPositions(): ReikiData["handPositions"] {
  return REIKI_DATA.handPositions;
}

/**
 * Get healing techniques
 */
export function getHealingTechniques(): ReikiData["healingTechniques"] {
  return REIKI_DATA.healingTechniques;
}

/**
 * Get healing dimensions
 */
export function getHealingDimensions(): ReikiData["healingDimensions"] {
  return REIKI_DATA.healingDimensions;
}

/**
 * Get domains of Reiki
 */
export function getDomains(): string[] {
  return REIKI_DATA.domains;
}

/**
 * Get sacred objects
 */
export function getSacredObjects(): string[] {
  return REIKI_DATA.sacredObjects;
}

/**
 * Get invocation phrases
 */
export function getInvocationPhrases(): string[] {
  return REIKI_DATA.invocationPhrases;
}

/**
 * Get affirmation
 */
export function getAffirmation(): string {
  return REIKI_DATA.affirmation;
}

/**
 * Get meditation guidance
 */
export function getMeditation(): string {
  return REIKI_DATA.meditation;
}

/**
 * Get protocols
 */
export function getProtocols(): ReikiData["protocols"] {
  return REIKI_DATA.protocols;
}

/**
 * Get phrases by type
 */
export function getPhraseByType(
  type: keyof ReikiData["phrases"]
): string | undefined {
  return REIKI_DATA.phrases[type];
}

/**
 * Search Reiki data by query
 */
export function searchReiki(query: string): ReikiData | null {
  const lowerQuery = query.toLowerCase();
  if (
    REIKI_DATA.name.toLowerCase().includes(lowerQuery) ||
    REIKI_DATA.philosophy.toLowerCase().includes(lowerQuery) ||
    REIKI_DATA.domains.some((d) => d.toLowerCase().includes(lowerQuery)) ||
    REIKI_DATA.principles.some((p) => p.toLowerCase().includes(lowerQuery))
  ) {
    return REIKI_DATA;
  }
  return null;
}

/**
 * Get Reiki by element
 */
export function getReikiByElement(element: string): ReikiData | undefined {
  return REIKI_DATA.element.toLowerCase().includes(element.toLowerCase())
    ? REIKI_DATA
    : undefined;
}

/**
 * Get Reiki by day of week
 */
export function getReikiByDay(day: string): ReikiData | undefined {
  return REIKI_DATA.dayOfWeek.toLowerCase().includes(day.toLowerCase())
    ? REIKI_DATA
    : undefined;
}

export default {
  getData,
  getDataById,
  getSymbols,
  getAttunementDegrees,
  getHandPositions,
  getHealingTechniques,
  getHealingDimensions,
  getDomains,
  getSacredObjects,
  getInvocationPhrases,
  getAffirmation,
  getMeditation,
  getProtocols,
  getPhraseByType,
  searchReiki,
  getReikiByElement,
  getReikiByDay,
};
