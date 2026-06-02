 
// @ts-nocheck
// SKIP_LINT

/**
 * Rogga Data Module
 * Spiritual data for Rogga, orixá of transformation, rhythm, and ancestral power
 */

export interface RoggaData {
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

export interface TransformAspect {
  name: string;
  description: string;
  energy: string;
}

export interface AncestralGift {
  name: string;
  description: string;
  application: string;
}

export interface PathOfRogga {
  name: string;
  description: string;
  attributes: string[];
}

const ROGGA_DATA: RoggaData = {
  name: "Rogga",
  orisha: "Rogga",
  path: "Mestre das Transformações",
  colors: ["roxo", "dourado"],
  dayOfWeek: "terça-feira",
  offerings: ["mel", "coco", "cera", "velas roxas", "flores roxas", "dindim"],
  attributes: [
    "transformação",
    "ritmo",
    "poder ancestral",
    "libertação",
    "equilíbrio",
    "sabedoria",
    "ação",
    "mobilidade",
    "fluidez"
  ],
  syncPath: "ritmo",
  element: "transformação",
  modality: "active",
  sacredObjects: [
    "dindim",
    "cabaça",
    "maracas",
    "chocalho",
    "borracha",
    "elementos de ritmo"
  ],
  invocationPhrases: [
    "Rogga, me transforma",
    "Rogga, liberta minha essência",
    "Rogga, equilibra meu ser"
  ],
  domains: [
    "transformação",
    "ritmo",
    "poder ancestral",
    "libertação",
    "equilíbrio",
    "sabedoria",
    "ação",
    "mobilidade"
  ]
};

const transformAspects: TransformAspect[] = [
  {
    name: "Rogga Onã",
    description: "O mestre das transformações absolutas",
    energy: "mudança"
  },
  {
    name: "Rogga Sapatá",
    description: "O Rogga dos caminhos interditos e libertações",
    energy: "libertação"
  },
  {
    name: "Rogga Romê",
    description: "O guardião do ritmo ancestral",
    energy: "ritmo"
  },
  {
    name: "Rogga Lailai",
    description: "O	transformador das águas profundas",
    energy: "fluidez"
  },
  {
    name: "Rogga Onirê",
    description: "O Rogga das sabedorias ancestrais",
    energy: "sabedoria"
  }
];

const ancestralGifts: AncestralGift[] = [
  {
    name: "Arte da Transformação",
    description: "Conhecimento das mudanças que transformam a alma",
    application: "usar o ritmo de Rogga para transformar momentos"
  },
  {
    name: "Libertação Ancestral",
    description: "A capacidade de libertar-se de padrões antigos",
    application: "pedir a Rogga para quebrar correntes"
  },
  {
    name: "Ritmo do Poder",
    description: "A conexão com o poder dos ancestrais",
    application: "invocar Rogga através do ritmo e dança"
  },
  {
    name: "Equilíbrio da Essência",
    description: "A defesa do equilíbrio interior",
    application: "carregar elementos de Rogga consagrados"
  },
  {
    name: "Sabedoria das Eras",
    description: "O dom de compreender as eras passadas",
    application: "oferecer a Rogga antes de decisões importantes"
  }
];

const pathsOfRogga: PathOfRogga[] = [
  {
    name: "Transformador",
    description: "Rogga como mestre das mudanças",
    attributes: ["transformação", "mudança", "evolução"]
  },
  {
    name: "Ritmista",
    description: "Rogga como senhor dos ritmos ancestrais",
    attributes: ["ritmo", "dança", "movimento"]
  },
  {
    name: "Libertador",
    description: "Rogga como abertura de prisões invisíveis",
    attributes: ["libertação", "ação", "mobilidade"]
  },
  {
    name: "Equilibrista",
    description: "Rogga como guardião do equilíbrio",
    attributes: ["equilíbrio", "sabedoria", "paz"]
  },
  {
    name: "Ancestre",
    description: "Rogga como sabedoria dos que vieram antes",
    attributes: ["ancestralidade", "tradição", "conhecimento"]
  }
];

export function getData(): RoggaData {
  return ROGGA_DATA;
}

function getDataById(id: string): RoggaData | undefined {
  return id === 'rogga' ? ROGGA_DATA : undefined;
}

function getTransformAspects(): TransformAspect[] {
  return transformAspects;
}

function getAncestralGifts(): AncestralGift[] {
  return ancestralGifts;
}

function getPaths(): PathOfRogga[] {
  return pathsOfRogga;
}

function getSacredObjects(): string[] {
  return ROGGA_DATA.sacredObjects;
}

function getInvocationPhrases(): string[] {
  return ROGGA_DATA.invocationPhrases;
}

function getDomains(): string[] {
  return ROGGA_DATA.domains;
}

function getRoggaByElement(element: string): RoggaData | undefined {
  return ROGGA_DATA.element.toLowerCase().includes(element.toLowerCase()) ? ROGGA_DATA : undefined;
}

function getRoggaByDay(day: string): RoggaData | undefined {
  return ROGGA_DATA.dayOfWeek.toLowerCase().includes(day.toLowerCase()) ? ROGGA_DATA : undefined;
}