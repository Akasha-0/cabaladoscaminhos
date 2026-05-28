// @ts-nocheck
// SKIP_LINT

/**
 * Ikate Data Module
 * Spiritual data for Ikate, the orixá of hunting, forests, and wild wisdom
 */

export interface IkateData {
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

export interface HuntingAspect {
  name: string;
  description: string;
  energy: string;
}

export interface ForestGift {
  name: string;
  description: string;
  application: string;
}

export interface PathOfIkate {
  name: string;
  description: string;
  attributes: string[];
}

const IKATE_DATA: IkateData = {
  name: "Ikate",
  orisha: "Ikate",
  path: "Senhor da Caça e do Mato",
  colors: ["verde", "preto", "marrom"],
  dayOfWeek: "terça-feira",
  offerings: ["quiabo", "melancia", "dende", "fava", "cogumelos", "ervas do mato"],
  attributes: [
    "caça",
    "mato",
    "floresta",
    "sabedoria selvagem",
    "força física",
    "persistência",
    "determinação",
    "sobrevivência",
    "conhecimento da terra"
  ],
  syncPath: "caça",
  element: "terra e floresta",
  modality: "active",
  sacredObjects: [
    "arco",
    "flecha",
    "faca de caça",
    "penas",
    "couro",
    "ervas do mato",
    "raízes"
  ],
  invocationPhrases: [
    "Ikate, me dá sabedoria do mato",
    "Ikate, guia minha caça",
    "Ikate, abre os caminhos da floresta"
  ],
  domains: [
    "caça",
    "floresta",
    "mato",
    "sobrevivência",
    "natureza",
    "conhecimento ancestral",
    " Herbs of the wild"
  ]
};

const huntingAspects: HuntingAspect[] = [
  {
    name: "Ikate Olodo",
    description: "O caçador silencioso que caminha sem ser visto",
    energy: "sigilo"
  },
  {
    name: "Ikate Onã",
    description: "O caçador vitorioso que sempre alcança sua presa",
    energy: "perseverança"
  },
  {
    name: "Ikate Obukoy",
    description: "O senhor do mato e das matas深处的 sabedorias",
    energy: "conhecimento"
  },
  {
    name: "Ikate Lailai",
    description: "O caçador das ervas e plantas medicinais",
    energy: "cura"
  }
];

const forestGifts: ForestGift[] = [
  {
    name: "Sabedoria do Mato",
    description: "Conhecimento das plantas, animais e caminhos da floresta",
    application: "invocar Ikate para encontrar respostas na natureza"
  },
  {
    name: "Força do Caçador",
    description: "A capacidade de perseguir e alcançar objetivos",
    application: "pedir a Ikate para dar força na perseguição de metas"
  },
  {
    name: "Sobrevivência",
    description: "O dom de sobreviver em qualquer ambiente",
    application: "buscar a proteção de Ikate em tempos difíceis"
  },
  {
    name: "Conexão com a Terra",
    description: "A ligação profunda com o planeta e seus ciclos",
    application: "oferecer a Ikate树叶 e plantas da terra"
  }
];

const pathsOfIkate: PathOfIkate[] = [
  {
    name: "Caçador",
    description: "Ikate como guia da caça e busca de objetivos",
    attributes: ["persistência", "foco", "determinação"]
  },
  {
    name: "Guardião da Floresta",
    description: "Ikate como protetor da natureza e dos animais",
    attributes: ["sabedoria", "respeito", "equilíbrio"]
  },
  {
    name: "Guerreiro do Mato",
    description: "Ikate como combatente feroz das batalhas da vida",
    attributes: ["força", "coragem", "estratégia"]
  },
  {
    name: "Curandeiro Selvagem",
    description: "Ikate como mestre das ervas e curas naturais",
    attributes: ["conhecimento", "intuição", "compaixão"]
  }
];

export function getData(): IkateData {
  return IKATE_DATA;
}

export function getDataById(id: string): IkateData | undefined {
  return id === 'ikate' ? IKATE_DATA : undefined;
}

export function getHuntingAspects(): HuntingAspect[] {
  return huntingAspects;
}

export function getForestGifts(): ForestGift[] {
  return forestGifts;
}

export function getPaths(): PathOfIkate[] {
  return pathsOfIkate;
}

export function getSacredObjects(): string[] {
  return IKATE_DATA.sacredObjects;
}

export function getInvocationPhrases(): string[] {
  return IKATE_DATA.invocationPhrases;
}

export function getDomains(): string[] {
  return IKATE_DATA.domains;
}

export function getIkateByElement(element: string): IkateData | undefined {
  return IKATE_DATA.element.toLowerCase().includes(element.toLowerCase()) ? IKATE_DATA : undefined;
}

export function getIkateByDay(day: string): IkateData | undefined {
  return IKATE_DATA.dayOfWeek.toLowerCase().includes(day.toLowerCase()) ? IKATE_DATA : undefined;
}