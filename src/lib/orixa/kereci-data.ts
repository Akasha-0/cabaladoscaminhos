 
// @ts-nocheck
// SKIP_LINT

/**
 * Kereci Data Module
 * Spiritual data for Kereci, the orixá of secrets, hidden knowledge, and mystical transformation
 */

export interface KereciData {
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

export interface SecretAspect {
  name: string;
  description: string;
  energy: string;
}

export interface TransformationGift {
  name: string;
  description: string;
  application: string;
}

export interface PathOfKereci {
  name: string;
  description: string;
  attributes: string[];
}

const KERECI_DATA: KereciData = {
  id: "kereci",
  name: "Kereci",
  namePortuguese: "Kereci",
  path: "Senhor dos Segredos",
  element: "escuridão",
  colors: ["preto", "roxo", "índigo"],
  dayOfWeek: "terça-feira",
  numbersSacred: [7, 13, 21],
  greeting: "Kereci Odó",
  archetype: "O Guardião do Conhecimento Proibido",
  qualities: [
    "sabedoria oculta",
    "mistério",
    "transformação",
    "segredos",
    "intuição profunda",
    "conhecimento escondido",
    "proteção esotérica",
    "magia"
  ],
  challenges: [
    "manipulação",
    "segredos que machucam",
    "obscuridade",
    "conhecimento perigoso"
  ],
  rulingPlanet: "Saturno",
  sacredAnimals: ["coruja", "morcego", "serpente negra"],
  plants: ["mandrágora", "beladona", "noite-negra"],
  offerings: ["vinho tinto", "pétalas negras", "velas roxas", "moedas antigas", "espelhos"],
  chants: [
    "Kereci Odó, guardião dos segredos",
    "Abre-me as portas do conhecimento oculto",
    "Kereci, transforma minha escuridão em sabedoria"
  ],
  symbols: ["espelho", "chave", "olho oculto", "serpente", "lua nova"],
  mythology:
    "Kereci é o orixá que guarda os segredos do universo. Nasceu da primeira escuridão antes da luz e Holds all forbidden knowledge. É ele quem revela verdades ocultas aos que são dignos, mas esconde sabedoria dos indignos.",
  spiritualLesson:
    "Os segredos mais poderosos não estão na luz, mas na escuridão. Aqueles que buscam conhecimento devem primeiro confrontar seus próprios medo.",
  affirmation: "Eu abraço os mistérios que me transformam e me iluminam",
  meditation:
    "Sento-me na escuridão. Kereci me mostra os segredos que preciso conhecer. A sabedoria oculta flui através de mim."
};

const secretAspects: SecretAspect[] = [
  {
    name: "Kereci Onã",
    description: "O segredo revelado",
    energy: "transparência"
  },
  {
    name: "Kereci Axé",
    description: "O guardião do poder",
    energy: "proteção mística"
  },
  {
    name: "Kereci Oxó",
    description: "O transformador",
    energy: "metamorfose"
  }
];

const transformationGifts: TransformationGift[] = [
  {
    name: "Visão Interior",
    description: "Capacidade de ver além do visível",
    application: "mediunidade e intuição"
  },
  {
    name: "Palavras de Poder",
    description: "Dominío sobre palavras ocultas",
    application: "magia e ritual"
  },
  {
    name: "Caminho das Sombras",
    description: "Andar entre a luz e a escuridão",
    application: "equilíbrio espiritual"
  }
];

const pathsOfKereci: PathOfKereci[] = [
  {
    name: "Guardião dos Segredos",
    description: "Mantém e protege conhecimento oculto",
    attributes: ["discrição", "sabedoria", "mistério"]
  },
  {
    name: "Mestre das Transformações",
    description: "Transforma escuridão em luz interior",
    attributes: ["transmutação", "cura", "renovação"]
  },
  {
    name: "Portador da Verdade",
    description: "Revela verdades ocultas no tempo certo",
    attributes: ["justiça", "timing", "discernimento"]
  }
];

export function getData(): KereciData {
  return KERECI_DATA;
}

function getDataById(id: string): KereciData | undefined {
  return id === "kereci" ? KERECI_DATA : undefined;
}

function getSecretAspects(): SecretAspect[] {
  return secretAspects;
}

function getTransformationGifts(): TransformationGift[] {
  return transformationGifts;
}

function getPaths(): PathOfKereci[] {
  return pathsOfKereci;
}

function getSacredObjects(): string[] {
  return ["espelho", "chave antiga", "velas pretas", "espelhos quebrados"];
}

function getInvocationPhrases(): string[] {
  return KERECI_DATA.chants;
}

function getDomains(): string[] {
  return ["segredos", "magia", "transformação", "conhecimento oculto", "mistérios"];
}

function getKereciByElement(element: string): KereciData | undefined {
  return KERECI_DATA.element.toLowerCase().includes(element.toLowerCase()) ? KERECI_DATA : undefined;
}

function getKereciByDay(day: string): KereciData | undefined {
  return KERECI_DATA.dayOfWeek.toLowerCase().includes(day.toLowerCase()) ? KERECI_DATA : undefined;
}