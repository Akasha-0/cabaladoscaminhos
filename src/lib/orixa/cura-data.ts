// @ts-nocheck
// SKIP_LINT

/**
 * Cura Data Module
 * Spiritual data for Cura, the sacred art of healing and spiritual care
 * Cura represents compassion, restoration, and divine healing energy
 */

/**
 * Main Cura Data Interface
 */
export interface CuraData {
  id: string;
  name: string;
  namePortuguese: string;
  path: string;
  element: string;
  colors: string[];
  dayOfWeek: string;
  numbersSacred: number[];
  greeting: string;
  archetype: string;
  qualities: string[];
  challenges: string[];
  rulingPlanet: string;
  sacredAnimals: string[];
  plants: string[];
  offerings: string[];
  chants: string[];
  symbols: string[];
  mythology: string;
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
  domains: string[];
  healingDimensions: {
    spiritual: boolean;
    emotional: boolean;
    physical: boolean;
    mental: boolean;
    energetic: boolean;
  };
  sacredObjects: string[];
  invocationPhrases: string[];
}

/**
 * Healing Practice Interface
 */
export interface HealingPractice {
  name: string;
  type: string;
  description: string;
  duration: string;
  offerings: string[];
  steps: string[];
  contraindications: string[];
}

/**
 * Sacred Herb Interface
 */
export interface SacredHerb {
  name: string;
  namePortuguese: string;
  uses: string[];
  preparation: string;
  contraindications: string[];
  element: string;
}

/**
 * Healing Ritual Interface
 */
export interface HealingRitual {
  type: string;
  description: string;
  duration: string;
  offerings: string[];
  steps: string[];
  purpose: string;
}

/**
 * Main Cura Data
 */
const CURA_DATA: CuraData = {
  id: "cura",
  name: "Cura",
  namePortuguese: "Cura Divina",
  path: "Arte Sagrada da Cura",
  element: "Luz e Compaixão",
  colors: ["Branco", "Dourado", "Verde"],
  dayOfWeek: "Domingo",
  numbersSacred: [3, 7, 9, 12],
  greeting: "Que a cura te abençoe",
  archetype: "O Curandeiro Compassivo",
  qualities: [
    "Compaixão",
    "Restauração",
    "Luz",
    "Equilíbrio",
    "Paz",
    "Renovação",
    " Misericórdia"
  ],
  challenges: [
    "Exaustão",
    "Autonegligência",
    "Dificuldade em receber",
    "Sobrecarga emocional"
  ],
  rulingPlanet: "Sol",
  sacredAnimals: ["Borboleta", "Colomba", "Cisne"],
  plants: ["Aloe Vera", "Calêndula", "Camomila", "Lavanda"],
  offerings: ["Flores brancas", "Mel", "Azeite", "Água cristalina", "Velas douradas"],
  chants: ["Cura divina", "Luz restauradora", "Paz e equilíbrio", "Compaixão"],
  symbols: ["Mãos em cura", "Luz solar", "Coração radiante", "Cruz de cura"],
  mythology:
    "Cura é a essência divina da restauração e compaixão. Não é um orixá específico, mas sim a energia sagrada que flui através de todos os orixás quando buscam trazer equilíbrio e bem-estar. Cura representa o poder do universo de regenerar, sanar e transformar. Cada orixá possui uma facet da cura - Oxum pela beleza e harmonia interior, Omolu pela transformação da doença em saúde, Ossaim pelas ervas medicinais. Cura é a síntese de todas estas forças restauradoras.",
  spiritualLesson:
    "A verdadeira cura vem da compaixão por si mesmo e pelos outros. Não podemos dar o que não temos - primeiro devemos aceitar a cura em nós mesmos para poder compartilhar com o mundo.",
  affirmation:
    "Eu sou canal de luz curativa. A compaixão flui através de mim, restaurando equilíbrio e paz onde quer que eu vá.",
  meditation:
    "Visualize uma luz dourada e branca envolvendo seu corpo. Sinta o calor reconfortante penetrando cada célula, restaurando, renovando e trazendo paz. Permita que esta energia flua livremente, curando passado, presente e futuro.",
  domains: [
    "Cura espiritual",
    "Cura emocional",
    "Cura física",
    "Cura energética",
    "Restauração",
    "Compassão",
    "Equilíbrio",
    "Renovação"
  ],
  healingDimensions: {
    spiritual: true,
    emotional: true,
    physical: true,
    mental: true,
    energetic: true
  },
  sacredObjects: [
    "Velas brancas e douradas",
    "Água sagrada",
    "Óleo de unção",
    "Flores brancas",
    "Cristais de quartzo",
    "Mel"
  ],
  invocationPhrases: [
    "Que a luz da cura me envolva",
    "Cura minha essência com compaixão",
    "Que a paz retorne ao meu ser",
    "Sou canal de restauração divina"
  ]
};

/**
 * Healing Practices
 */
const healingPractices: HealingPractice[] = [
  {
    name: "Ritual de Cura com Luz",
    type: "Luz Divina",
    description: "Prática de cura usando luz solar concentrada e visualização",
    duration: "20-30 minutos",
    offerings: ["Velas douradas", "Flores brancas", "Água de roseira"],
    steps: [
      "Encontre um espaço tranquilo com luz natural",
      "Acenda velas douradas e brancas",
      "Sente-se em posição confortável",
      "Feche os olhos e respire profundamente",
      "Visualize luz dourada entrando pelo topo da cabeça",
      "Sinta a luz preenchendo cada parte do corpo",
      "Permita que a luz dissolva qualquer tensão ou dor",
      "Agradeça pela cura recebida"
    ],
    contraindications: ["Não realizar em jejum prolongado", "Pessoas fotosensíveis devem usar óculos"]
  },
  {
    name: "Ritual de Unção com Óleo",
    type: "Unção Sagrada",
    description: "Ritual de cura usando azeite consagrado e imposição de mãos",
    duration: "15-20 minutos",
    offerings: ["Azeite de oliva", "Ervas sagradas", "Velas brancas"],
    steps: [
      "Consagre o azeite com orações e intenção",
      "Aqueça levemente o azeite entre as mãos",
      "Aplique suavemente na testa, coração e palmas",
      "Coloque as mãos sobre as áreas que precisam de cura",
      "Visualize energia curativa fluindo através das mãos",
      "Repita mantras de cura",
      "Descanse em silêncio por alguns minutos"
    ],
    contraindications: ["Alergia a azeite ou ervas", "Pele sensibilizada"]
  },
  {
    name: "Banho de Cura",
    type: "Água Sagrada",
    description: "Ritual de limpeza e cura usando ervas e água abençoada",
    duration: "30-45 minutos",
    offerings: ["Ervas de cura", "Flores brancas", "Sal grosso", "Água de fonte"],
    steps: [
      "Prepare um banho morno com ervas sagradas",
      "Adicione flores brancas e sal grosso",
      "Entre na banheira com intenção de cura",
      "Visualize a água absorvendo energias densas",
      "Faça orações de restauração",
      "Permaneça submerso por 15-20 minutos",
      "Saia da água lentamente, imaginando uma nova pele luminosa"
    ],
    contraindications: ["Gestantes devem consultar especialista", "Não misturar com produtos químicos"]
  }
];

/**
 * Sacred Herbs for Healing
 */
const sacredHerbs: SacredHerb[] = [
  {
    name: "Aloe Vera",
    namePortuguese: "Babosa",
    uses: ["Cura de queimaduras", "Hidratação espiritual", "Proteção energética", "Regeneração celular"],
    preparation: "Gel para uso externo, suco para uso interno, unguento",
    contraindications: ["Gestantes não devem consumir internamente", "Não usar em feridas abertas sem orientação"],
    element: "Luz e Água"
  },
  {
    name: "Calendula",
    namePortuguese: "Calêndula",
    uses: ["Cura de feridas", "Inflamação", "Purificação do sangue", "Harmonização emocional"],
    preparation: "Chá, pomada, compressa, banho",
    contraindications: ["Alergia a margaridas", "Pode interagir com medicamentos"],
    element: "Sol"
  },
  {
    name: "Chamomile",
    namePortuguese: "Camomila",
    uses: ["Calmante espiritual", "Cura emocional", "Sono reparador", "Digestão"],
    preparation: "Chá, compressa, inalação",
    contraindications: ["Alergia a asteráceas", "Pode potencializar sedativos"],
    element: "Água"
  },
  {
    name: "Lavender",
    namePortuguese: "Lavanda",
    uses: ["Equilíbrio emocional", "Cura energética", "Purificação", "Meditação"],
    preparation: "Óleo essencial, chá, defumação, banhos",
    contraindications: ["Sensibilidade a óleos essenciais", "Não usar puro na pele"],
    element: "Ar"
  }
];

/**
 * Healing Rituals
 */
const healingRituals: HealingRitual[] = [
  {
    type: "Cura do Campo Energético",
    description: "Ritual para limpar e fortalecer o campo áurico",
    duration: "1 hora",
    offerings: ["Sal grosso", "Água de rio", "Velas brancas", "Flores"],
    steps: [
      "Prepare o espaço com defumação de ervas purificadoras",
      "Desenhe um círculo de sal ao redor do praticante",
      "Acenda as velas brancas nos quatro pontos cardeais",
      "Sente-se no centro do círculo",
      "Respire profundamente e entre em estado meditativo",
      "Visualize uma rede de luz envolvendo seu campo energético",
      "Identifique e libere energias densas",
      "Restaure as áreas afetadas com luz dourada",
      "Agradeça e encerre o ritual"
    ],
    purpose: "Limpeza e fortalecimento do campo áurico"
  },
  {
    type: "Cura das Águas Internas",
    description: "Ritual para curar questões emocionais através da água",
    duration: "45 minutos",
    offerings: ["Água de nascente", "Flores aquáticas", "Velas flutuantes", "Ervas de água"],
    steps: [
      "Encontre um local perto de água (rio, mar, lago)",
      "Coloque água de nascente em uma vasilha sagrada",
      "Adicione flores e ervas aquáticas",
      "Acenda velas flutuantes na água",
      "Mergulhe as mãos na água e faça preces",
      "Visualize suas emoções fluindo como água pura",
      "Libere mágoas e dores na correnteza",
      "Agradeça à água por sua capacidade de cura"
    ],
    purpose: "Liberação emocional e cura do coração"
  },
  {
    type: "Ritual de Bênção da Boca",
    description: "Ritual para curar a palavra e restaurar a comunicação sagrada",
    duration: "30 minutos",
    offerings: ["Mel", "Água com mel", "Flores brancas", "Velas douradas"],
    steps: [
      "Unja os lábios com mel abençoado",
      "Beba água com mel lentamente",
      "Recite orações de bênção da palavra",
      "Visualize sua voz como instrumento de cura",
      "Prometa usar suas palavras com compaixão",
      "Agradeça pela capacidade de se expressar"
    ],
    purpose: "Sagrar a comunicação e curar palavras passadas"
  }
];

/**
 * Get all Cura data
 */
export function getData(): CuraData {
  return CURA_DATA;
}

/**
 * Get Cura data by ID
 */
export function getDataById(id: string): CuraData | undefined {
  return id === "cura" ? CURA_DATA : undefined;
}

/**
 * Get healing practices
 */
export function getHealingPractices(): HealingPractice[] {
  return healingPractices;
}

/**
 * Get sacred herbs
 */
export function getSacredHerbs(): SacredHerb[] {
  return sacredHerbs;
}

/**
 * Get healing rituals
 */
export function getHealingRituals(): HealingRitual[] {
  return healingRituals;
}

/**
 * Get healing dimensions
 */
export function getHealingDimensions(): CuraData["healingDimensions"] {
  return CURA_DATA.healingDimensions;
}

/**
 * Get domains of Cura
 */
export function getDomains(): string[] {
  return CURA_DATA.domains;
}

/**
 * Get sacred objects
 */
export function getSacredObjects(): string[] {
  return CURA_DATA.sacredObjects;
}

/**
 * Get invocation phrases
 */
export function getInvocationPhrases(): string[] {
  return CURA_DATA.invocationPhrases;
}

/**
 * Get affirmation
 */
export function getAffirmation(): string {
  return CURA_DATA.affirmation;
}

/**
 * Get meditation guidance
 */
export function getMeditation(): string {
  return CURA_DATA.meditation;
}

/**
 * Search Cura data by query
 */
export function searchCura(query: string): CuraData | null {
  const lowerQuery = query.toLowerCase();
  
  if (CURA_DATA.id.toLowerCase().includes(lowerQuery)) return CURA_DATA;
  if (CURA_DATA.name.toLowerCase().includes(lowerQuery)) return CURA_DATA;
  if (CURA_DATA.path.toLowerCase().includes(lowerQuery)) return CURA_DATA;
  if (CURA_DATA.element.toLowerCase().includes(lowerQuery)) return CURA_DATA;
  if (CURA_DATA.qualities.some(q => q.toLowerCase().includes(lowerQuery))) return CURA_DATA;
  if (CURA_DATA.domains.some(d => d.toLowerCase().includes(lowerQuery))) return CURA_DATA;
  
  return null;
}

/**
 * Get Cura by element
 */
export function getCuraByElement(element: string): CuraData | undefined {
  return CURA_DATA.element.toLowerCase().includes(element.toLowerCase()) ? CURA_DATA : undefined;
}

/**
 * Get Cura by day of week
 */
export function getCuraByDay(day: string): CuraData | undefined {
  return CURA_DATA.dayOfWeek.toLowerCase().includes(day.toLowerCase()) ? CURA_DATA : undefined;
}

export default {
  getData,
  getDataById,
  getHealingPractices,
  getSacredHerbs,
  getHealingRituals,
  getHealingDimensions,
  getDomains,
  getSacredObjects,
  getInvocationPhrases,
  getAffirmation,
  getMeditation,
  searchCura,
  getCuraByElement,
  getCuraByDay
};
