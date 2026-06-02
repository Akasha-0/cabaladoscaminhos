 
// @ts-nocheck
// SKIP_LINT

/**
 * Xapa Data Module
 * Spiritual data for Xapa, the orixá of manifestation, transformation, and creative power
 */

export interface XapaData {
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
}

export interface ManifestationAspect {
  name: string;
  description: string;
  energy: string;
}

export interface CreativeGift {
  name: string;
  description: string;
  application: string;
}

export interface PathOfXapa {
  name: string;
  description: string;
  attributes: string[];
}

const XAPA_DATA: XapaData = {
  id: "xapa",
  name: "Xapa",
  namePortuguese: "Senhora da Manifestação",
  path: "Olorixá",
  element: "Manifestação",
  colors: ["#FFD700", "#FF8C00", "#4B0082"],
  dayOfWeek: "Domingo",
  numbersSacred: [8, 13, 21],
  greeting: "Alê!",
  archetype: "A Manifestadora",
  qualities: [
    "Manifestação",
    "Transformação",
    "Criatividade",
    "Abundância",
    "Poder pessoal",
    "Clareza de intenção"
  ],
  challenges: ["Imobilismo", "Procrastinação criativa", "Medo de assumir poder"],
  rulingPlanet: "Sol",
  sacredAnimals: ["Fênix", "Cobra"],
  plants: ["Lótus", "Girassol", "Salvia dourada"],
  offerings: [
    "Azeite de dendê",
    "Mel",
    "Ouro em pó",
    "Incenso de sálvia",
    "Flores douradas"
  ],
  chants: ["Alê", "Xapa Epo", "Oba"],
  symbols: ["Círculo de criação", "Chave de ouro", "Espiral"],
  mythology:
    "Xapa é a orixá que detém a chave da manifestação material. Seu poder transforma pensamentos em realidade, trazendo à luz aquilo que antes era apenas potencial invisível.",
  spiritualLesson: "A manifestação consciente começa com a clareza da intenção",
  affirmation:
    "Eu Manifesta com poder e clareza, transformando minha visão em realidade tangível",
  meditation:
    "Visualize um espiral dourado emanando de seu centro, expandindo sua capacidade de criar realidade"
};

const manifestationAspects: ManifestationAspect[] = [
  {
    name: "Xapa Alá",
    description: "A essência que transforma o etéreo em tangível",
    energy: "criação"
  },
  {
    name: "Xapa Oxum",
    description: "A manifestação através da beleza e da abundância",
    energy: "prosperidade"
  },
  {
    name: "Xapa Obatalá",
    description: "A criação pura que traz forma ao vazio",
    energy: "ordenação"
  }
];

const creativeGifts: CreativeGift[] = [
  {
    name: "Chave da Manifestação",
    description: "Capacidade de materializar desejos com clareza e propósito",
    application: "Práticas de visualização criativa e ritual de manifestação"
  },
  {
    name: "Poder de Transformação",
    description: "Habilidade de transformar circumstances através da intenção focada",
    application: "Trabalho com affirmation e deckanização"
  },
  {
    name: "Clareza Intencional",
    description: "Dom de perceber com precisão o que se deseja criar",
    application: "Journaling criativo e definição de intenções"
  }
];

const pathsOfXapa: PathOfXapa[] = [
  {
    name: "Caminho da Manifestação",
    description: "Utiliza a energia de Xapa para criar realidade de forma consciente",
    attributes: ["Visualização", "Intenção clara", "Ritual", "Gratidão"]
  },
  {
    name: "Caminho da Transformação",
    description: "Transforma pensamentos e sentimentos em ações concretas",
    attributes: ["Disciplina", "Foco", "Determinação", "Paciência"
    ]
  },
  {
    name: "Caminho da Abundância",
    description: "Alinha-se com a frequência da prosperidade e da criação",
    attributes: ["Generosidade", "Abertura", "Confiança", "Recebimento"]
  }
];

export function getData(): XapaData {
  return XAPA_DATA;
}

function getDataById(id: string): XapaData | undefined {
  return id === 'xapa' ? XAPA_DATA : undefined;
}

function getManifestationAspects(): ManifestationAspect[] {
  return manifestationAspects;
}

function getCreativeGifts(): CreativeGift[] {
  return creativeGifts;
}

function getPaths(): PathOfXapa[] {
  return pathsOfXapa;
}

function getSacredObjects(): string[] {
  return ["Círculo de criação", "Chave de ouro", "Espiral", "Espelho", "Cristal"];
}

function getInvocationPhrases(): string[] {
  return [
    "Xapa, abre meu caminho de manifestação",
    "Xapa, transforma minha intenção em realidade",
    "Xapa, concede-me o poder da criação consciente"
  ];
}

function getDomains(): string[] {
  return XAPA_DATA.qualities;
}

function getXapaByElement(element: string): XapaData | undefined {
  return XAPA_DATA.element.toLowerCase().includes(element.toLowerCase())
    ? XAPA_DATA
    : undefined;
}

function getXapaByDay(day: string): XapaData | undefined {
  return XAPA_DATA.dayOfWeek.toLowerCase().includes(day.toLowerCase())
    ? XAPA_DATA
    : undefined;
}