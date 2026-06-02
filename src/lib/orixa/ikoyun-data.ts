// @ts-nocheck
// SKIP_LINT

/**
 * Ikoyun Data Module
 * Spiritual data for Ikoyun, the guardian of ancestral secrets and wisdom
 */

export interface IkoyunData {
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
  greeting: string;
  numero: number;
  simbolo: string;
  significance: string;
  description: string;
}

export interface AncestralPrinciple {
  name: string;
  description: string;
  application: string;
}

export interface SpiritualGuidance {
  name: string;
  description: string;
  practice: string;
}

export interface PathOfIkoyun {
  name: string;
  description: string;
  attributes: string[];
}

const IKOYUN_DATA: IkoyunData = {
  name: "Ikoyun",
  orisha: "Ikoyun",
  path: "Guardião dos Segredos Ancestrais",
  colors: ["dourado", "prata", "branco", "marrom"],
  dayOfWeek: "domingo",
  offerings: ["coco", "mel", "flores brancas", "velas douradas", "ervas sagradas", "inabo"],
  attributes: [
    "ancestralidade",
    "sabedoria",
    "proteção",
    "tradição",
    "segredos",
    "conecção divina",
    "mistério",
    "transmissão"
  ],
  syncPath: "ancestral",
  element: "espírito ancestral",
  modality: "mysterious",
  sacredObjects: [
    "pá batê",
    "búzios",
    "alabê",
    "opô",
    "efa",
    "okê",
    "sacred vessels"
  ],
  invocationPhrases: [
    "Ikoyun, abre a mente para a sabedoria",
    "Ikoyun, Protege-me com o escudo dos ancestrais",
    "Ikoyun, conecta-me aos orixás"
  ],
  domains: [
    "ancestralidade",
    "sabedoria oculta",
    "tradição oral",
    "proteção espiritual",
    "conecção divina",
    "segredos sagrados"
  ],
  greeting: "E ku itoju!",
  numero: 8,
  simbolo: "🔮",
  significance: "Guardião dos segredos ancestrais, sabedoria oculta, conexão com os orixás",
  description:
    "Ikoyun é o guardião dos segredos ancestrais e da sabedoria oculta. Representa a conexão profunda com os orixás e a tradição oral sagrada. Simboliza proteção, transmissão de conhecimento ancestral e abertura de caminhos espirituais."
};

const ancestralPrinciples: AncestralPrinciple[] = [
  {
    name: "Ancestralidade",
    description: "A honra aos ancestrais e a conexão com a sabedoria dos tempos",
    application: "honrar os antepassados em todas as práticas"
  },
  {
    name: "Tradição",
    description: "A preservação da tradição oral sagrada",
    application: "manter a purity of ancient teachings"
  },
  {
    name: "Proteção Ancestral",
    description: "O escudo espiritual contra energias negativas",
    application: "invocar Ikoyun para proteção em momentos de perigo"
  },
  {
    name: "Sabedoria Oculta",
    description: "O conhecimento dos segredos divinos",
    application: "meditar sobre os mistérios do universo"
  },
  {
    name: "Conexão Divina",
    description: "A ponte entre o terrenal e o espiritual",
    application: "abrir canais de comunicação com os orixás"
  }
];

const spiritualGuidance: SpiritualGuidance[] = [
  {
    name: "Guia dos Segredos",
    description: "Orientação para revelado de conhecimentos ocultos",
    practice: "oração em silêncio profundo ao amanhecer"
  },
  {
    name: "Guardião da Tradição",
    description: "Proteção e preservação dos ensinamentos sagrados",
    practice: "ritual de oferendas aos ancestrais"
  },
  {
    name: "Abridor de Caminhos Espirituais",
    description: "A开门 de portais de conexão divina",
    practice: "cerimônia de开门 com elementos sagrados"
  }
];

const pathsOfIkoyun: PathOfIkoyun[] = [
  {
    name: "Guardião",
    description: "Ikoyun como protetor dos segredos sagrados",
    attributes: ["proteção", "sigilo", "força espiritual"]
  },
  {
    name: "Sábio",
    description: "Ikoyun como transmissor da sabedoria oculta",
    attributes: ["conhecimento", "discernimento", "iluminação"]
  },
  {
    name: "Conector",
    description: "Ikoyun como ponte entre os mundos",
    attributes: ["comunicação", "mediunidade", "equilíbrio"]
  },
  {
    name: "Tradiutor",
    description: "Ikoyun como preservation of ancient teachings",
    attributes: ["tradição", "memória", "transmissão"]
  }
];

export function getData(): IkoyunData {
  return IKOYUN_DATA;
}

function getDataById(id: string): IkoyunData | undefined {
  return id === 'ikoyun' ? IKOYUN_DATA : undefined;
}

function getAncestralPrinciples(): AncestralPrinciple[] {
  return ancestralPrinciples;
}

function getSpiritualGuidance(): SpiritualGuidance[] {
  return spiritualGuidance;
}

function getPathsOfIkoyun(): PathOfIkoyun[] {
  return pathsOfIkoyun;
}

function getSacredObjects(): string[] {
  return IKOYUN_DATA.sacredObjects;
}

function getInvocationPhrases(): string[] {
  return IKOYUN_DATA.invocationPhrases;
}

function getDomains(): string[] {
  return IKOYUN_DATA.domains;
}

function getIkoyunByElement(element: string): IkoyunData | undefined {
  return IKOYUN_DATA.element.toLowerCase().includes(element.toLowerCase()) ? IKOYUN_DATA : undefined;
}

function getIkoyunByDay(day: string): IkoyunData | undefined {
  return IKOYUN_DATA.dayOfWeek.toLowerCase().includes(day.toLowerCase()) ? IKOYUN_DATA : undefined;
}
