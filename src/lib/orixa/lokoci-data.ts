/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
// SKIP_LINT

/**
 * Lokoci Data Module
 * Spiritual data for Lokoci, the orixá of transformation, crossroads, and duality
 */

export interface LokociData {
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

export interface TransformationAspect {
  name: string;
  description: string;
  energy: string;
}

export interface CrossroadPath {
  name: string;
  description: string;
  attributes: string[];
}

export interface DualityForm {
  name: string;
  description: string;
  nature: string;
}

const LOKOCI_DATA: LokociData = {
  name: "Lokoci",
  orisha: "Lokoci",
  path: "Senhor das Encruzilhadas",
  colors: ["preto", "branco", "vermelho"],
  dayOfWeek: "terça-feira",
  offerings: ["dinheiro", "gafanhoto", "farinha", "akara", "obí", "alcool", "vela"],
  attributes: [
    "transformação",
    "mudança",
    "limiar",
    "decisão",
    "dualidade",
    "iniciação",
    "mistério",
    "encruzilhada",
    "passagem"
  ],
  syncPath: "transformação",
  element: "liminal",
  modality: "transformative",
  sacredObjects: [
    "encruzilhada",
    "faca",
    "espelho",
    "cobra",
    "gafanhoto",
    "dinheiro",
    "pena"
  ],
  invocationPhrases: [
    "Lokoci, abre minha encruzilhada",
    "Lokoci, transforma meu destino",
    "Lokoci, guia-me na passagem"
  ],
  domains: [
    "transformação",
    "encruzilhadas",
    "dualidade",
    "iniciação",
    "morte e renascimento",
    "decisões",
    "passagem",
    "mistério"
  ]
};

const transformationAspects: TransformationAspect[] = [
  {
    name: "Lokoci Akpã",
    description: "O Lokoci do renascimento, aquele que transforma através da morte",
    energy: "renascimento"
  },
  {
    name: "Lokoci Onã",
    description: "O Lokoci das encruzilhadas, senhor dos caminhos",
    energy: "decisão"
  },
  {
    name: "Lokoci Odara",
    description: "O Lokoci da abundância oculta nas transformações",
    energy: "abundância"
  },
  {
    name: "Lokoci Osogbó",
    description: "O Lokoci protetor nas passagens perigosas",
    energy: "proteção"
  }
];

const crossroadPaths: CrossroadPath[] = [
  {
    name: "Caminho da Transformação",
    description: "A via do renascimento através da destruição criadora",
    attributes: ["morte", "renascimento", "metamorfose"]
  },
  {
    name: "Caminho da Dualidade",
    description: "A via da integração dos opostos",
    attributes: ["luz", "sombra", "equilíbrio"]
  },
  {
    name: "Caminho da Encruzilhada",
    description: "A via das escolhas definidoras de destino",
    attributes: ["decisão", "destino", "liberdade"]
  },
  {
    name: "Caminho da Passagem",
    description: "A via da iniciação e transformação sagrada",
    attributes: ["iniciação", "rito", "transformação"]
  }
];

const dualityForms: DualityForm[] = [
  {
    name: "Lokoci Ejin",
    description: "A forma masculina, senhor da ação transformadora",
    nature: "yang"
  },
  {
    name: "Lokoci Efa",
    description: "A forma feminina, senhora da receptividade transformadora",
    nature: "yin"
  }
];

export function getData(): LokociData {
  return LOKOCI_DATA;
}

export function getDataById(id: string): LokociData | undefined {
  return id === 'lokoci' ? LOKOCI_DATA : undefined;
}

export function getTransformationAspects(): TransformationAspect[] {
  return transformationAspects;
}

export function getCrossroadPaths(): CrossroadPath[] {
  return crossroadPaths;
}

export function getDualityForms(): DualityForm[] {
  return dualityForms;
}

export function getSacredObjects(): string[] {
  return LOKOCI_DATA.sacredObjects;
}

export function getInvocationPhrases(): string[] {
  return LOKOCI_DATA.invocationPhrases;
}

export function getDomains(): string[] {
  return LOKOCI_DATA.domains;
}

export function getLokociByElement(element: string): LokociData | undefined {
  return LOKOCI_DATA.element.toLowerCase().includes(element.toLowerCase()) ? LOKOCI_DATA : undefined;
}

export function getLokociByDay(day: string): LokociData | undefined {
  return LOKOCI_DATA.dayOfWeek.toLowerCase().includes(day.toLowerCase()) ? LOKOCI_DATA : undefined;
}