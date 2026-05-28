 
// @ts-nocheck
// SKIP_LINT

/**
 * Ogum Data Module
 * Spiritual data for Ogum, the orixá of iron, war, technology, and civilization
 */

export interface OgumData {
  name: string;
  orisha: string;
  path: string;
  colors: string[];
  dayOfWeek: string;
  offerings: string[];
  attributes: string[];
  syncPath: string;
  element: string;
  modality: string;
  sacredObjects: string[];
  invocationPhrases: string[];
  domains: string[];
}

export interface WarriorAspect {
  name: string;
  description: string;
  energy: string;
}

export interface CivilizationGift {
  name: string;
  description: string;
  application: string;
}

export interface PathOfOgum {
  name: string;
  description: string;
  attributes: string[];
}

const OGUM_DATA: OgumData = {
  name: "Ogum",
  orisha: "Ogum",
  path: "Guerreiro das Estradas",
  colors: ["vermelho", "preto", "azul", "verde"],
  dayOfWeek: "terça-feira",
  offerings: ["espada", "ferro", "alfinetes", "faca", "melancia", "quiabo", "dende"],
  attributes: [
    "força",
    "coragem",
    "determinação",
    "vitória",
    "conquista",
    "proteção",
    "trabalho",
    "civilização",
    "tecnologia"
  ],
  syncPath: "força",
  element: "ferro",
  modality: "active",
  sacredObjects: [
    "espada",
    "facão",
    "alicate",
    "martelo",
    "enxada",
    "ferro em geral",
    "alfinetes"
  ],
  invocationPhrases: [
    "Ogum, me dá força",
    "Ogum, abre meu caminho",
    "Ogum, me protege na batalha"
  ],
  domains: [
    "guerra",
    "ferro",
    "estradas",
    "tecnologia",
    "medicina",
    "caça",
    "agricultura",
    "civilização"
  ]
};

const warriorAspects: WarriorAspect[] = [
  {
    name: "Ogum Onã",
    description: "O guerreiro vitorioso que abre todos os caminhos",
    energy: "conquista"
  },
  {
    name: "Ogum Sapatá",
    description: "O Ogum das estradas e caminhos, protector de viajantes",
    energy: "proteção"
  },
  {
    name: "Ogum Romê",
    description: "O ferreiro, senhor do ferro e das ferramentas",
    energy: "criação"
  },
  {
    name: "Ogum Lailai",
    description: "O médico guerreiro, senhor das enfermarias",
    energy: "cura"
  },
  {
    name: "Ogum Onirê",
    description: "O Ogum das agriculturas e lavouras",
    energy: "prosperidade"
  },
  {
    name: "Ogum Maê",
    description: "O caçador, senhor das matas e caçadas",
    energy: "busca"
  },
  {
    name: "Ogum Megê",
    description: "O Ogum das águas, pescador e guardião das correntes",
    energy: "fluidez"
  }
];

const civilizationGifts: CivilizationGift[] = [
  {
    name: "Arte do Ferro",
    description: "Conhecimento das ferramentas de ferro que transformam o mundo",
    application: "usar ferramentas de ferro com respeito e intenção"
  },
  {
    name: "Estradas e Caminhos",
    description: "A capacidade de abrir caminhos e superar obstáculos",
    application: "pedir a Ogum para abrir caminhos bloqueados"
  },
  {
    name: "Força do Guerreiro",
    description: "A coragem para enfrentar qualquer batalha",
    application: "invocar Ogum em momentos de desafio"
  },
  {
    name: "Proteção Militar",
    description: "A defesa contra inimigos e perigos",
    application: "carregar um pedaço de ferro consagrado"
  },
  {
    name: "Vitória na Conquista",
    description: "O dom de conquistar e vencer",
    application: "oferecer a Ogum antes de qualquer empreitada"
  }
];

const pathsOfOgum: PathOfOgum[] = [
  {
    name: "Guerreiro",
    description: "Ogum como protetor e vencedor de batalhas",
    attributes: ["força", "coragem", "vitória"]
  },
  {
    name: "Ferreiro",
    description: "Ogum como senhor das artes do ferro",
    attributes: ["criação", "trabalho", "arte"]
  },
  {
    name: "Caminheiro",
    description: "Ogum como abertura de caminhos",
    attributes: ["estradas", "viagens", "proteção"]
  },
  {
    name: "Médico",
    description: "Ogum como curandeiro e senhor das enfermarias",
    attributes: ["cura", "saúde", "proteção"]
  },
  {
    name: "Agricultor",
    description: "Ogum como senhor das lavouras",
    attributes: ["terra", "plantio", "colheita"]
  }
];

export function getData(): OgumData {
  return OGUM_DATA;
}

export function getDataById(id: string): OgumData | undefined {
  return id === 'ogum' ? OGUM_DATA : undefined;
}

export function getWarriorAspects(): WarriorAspect[] {
  return warriorAspects;
}

export function getCivilizationGifts(): CivilizationGift[] {
  return civilizationGifts;
}

export function getPaths(): PathOfOgum[] {
  return pathsOfOgum;
}

export function getSacredObjects(): string[] {
  return OGUM_DATA.sacredObjects;
}

export function getInvocationPhrases(): string[] {
  return OGUM_DATA.invocationPhrases;
}

export function getDomains(): string[] {
  return OGUM_DATA.domains;
}

export function getOgumByElement(element: string): OgumData | undefined {
  return OGUM_DATA.element.toLowerCase().includes(element.toLowerCase()) ? OGUM_DATA : undefined;
}

export function getOgumByDay(day: string): OgumData | undefined {
  return OGUM_DATA.dayOfWeek.toLowerCase().includes(day.toLowerCase()) ? OGUM_DATA : undefined;
}