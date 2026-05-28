/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
// SKIP_LINT

/**
 * Otin Data Module
 * Spiritual data for Otin, the orixá of patience, endurance, and inner strength
 */

export interface OtinData {
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

export interface EnduranceAspect {
  name: string;
  description: string;
  energy: string;
}

export interface InnerStrengthGift {
  name: string;
  description: string;
  application: string;
}

export interface PathOfOtin {
  name: string;
  description: string;
  attributes: string[];
}

const OTIN_DATA: OtinData = {
  name: "Otin",
  orisha: "Otin",
  path: "Força Interior",
  colors: ["branco", "dourado"],
  dayOfWeek: "sexta-feira",
  offerings: ["milho", "água de cheiro", "flores brancas", "coco", "mel"],
  attributes: [
    "paciência",
    "resistência",
    "fortaleza interior",
    "perseverança",
    "equilíbrio",
    "tranquilidade",
    "sabedoria interior",
    "meditação"
  ],
  syncPath: "resistência",
  element: "terra",
  modality: "passive",
  sacredObjects: [
    "maraca",
    "cabaça",
    "pena branca",
    "coco",
    "pedra lisa",
    "tecido branco"
  ],
  invocationPhrases: [
    "Otin, me dá paciência",
    "Otin, fortalece meu espírito",
    "Otin, guia minha meditação"
  ],
  domains: [
    "paciência",
    "resistência",
    "meditação",
    "sabedoria",
    "equilíbrio",
    "paz interior",
    "força interior",
    "tranquilidade"
  ]
};

const enduranceAspects: EnduranceAspect[] = [
  {
    name: "Otin Alagoa",
    description: "A face paciente de Otin, aquele que espera o momento certo",
    energy: "contemplativa"
  },
  {
    name: "Otin Oxe",
    description: "A face resoluta de Otin, aquele que não desiste jamais",
    energy: "determinada"
  },
  {
    name: "Otin Ara",
    description: "A face serena de Otin, aquele que encontra paz em tudo",
    energy: "serena"
  }
];

const innerStrengthGifts: InnerStrengthGift[] = [
  {
    name: "Presente da Paciência",
    description: "Capacidade de aguardar sem ansiedade, confiando no tempo",
    application: "Momentos de incerteza e espera"
  },
  {
    name: "Força Interior",
    description: "Poder silencioso que sustenta nas dificuldades",
    application: "Provas e desafios da vida"
  },
  {
    name: "Sabedoria Contemplativa",
    description: "Compreensão profunda que vem da reflexão silenciosa",
    application: "Decisões importantes"
  },
  {
    name: "Equilíbrio Emocional",
    description: "Harmonia entre ação e repouso, esforço e aceitação",
    application: "Vida cotidiana"
  }
];

const pathsOfOtin: PathOfOtin[] = [
  {
    name: "Caminho da Paciência",
    description: "A via de Otin que ensina a aguardar o momento propício",
    attributes: ["tolerância", "espera ativa", "confiança"]
  },
  {
    name: "Caminho da Resistência",
    description: "A via de Otin que fortalece para suportar as adversidades",
    attributes: ["persistência", "coragem silenciosa", "resiliência"]
  },
  {
    name: "Caminho da Paz Interior",
    description: "A via de Otin que cultiva a tranquilidade no espírito",
    attributes: ["meditação", "serenidade", "sabedoria"]
  }
];

export function getData(): OtinData {
  return OTIN_DATA;
}

export function getDataById(id: string): OtinData | undefined {
  return id === 'otin' ? OTIN_DATA : undefined;
}

export function getEnduranceAspects(): EnduranceAspect[] {
  return enduranceAspects;
}

export function getInnerStrengthGifts(): InnerStrengthGift[] {
  return innerStrengthGifts;
}

export function getPaths(): PathOfOtin[] {
  return pathsOfOtin;
}

export function getSacredObjects(): string[] {
  return OTIN_DATA.sacredObjects;
}

export function getInvocationPhrases(): string[] {
  return OTIN_DATA.invocationPhrases;
}

export function getDomains(): string[] {
  return OTIN_DATA.domains;
}

export function getOtinByElement(element: string): OtinData | undefined {
  return OTIN_DATA.element.toLowerCase().includes(element.toLowerCase()) ? OTIN_DATA : undefined;
}

export function getOtinByDay(day: string): OtinData | undefined {
  return OTIN_DATA.dayOfWeek.toLowerCase().includes(day.toLowerCase()) ? OTIN_DATA : undefined;
}
