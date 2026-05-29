// @ts-nocheck
// SKIP_LINT

/**
 * Caminhos Data Module
 * Spiritual data for the sacred caminhos (paths) of Umbanda and Candomblé
 */

export interface CaminhoData {
  name: string;
  orixa: string;
  description: string;
  path: string;
  colors: string[];
  dayOfWeek: string;
  offerings: string[];
  attributes: string[];
  element: string;
  sacredObjects: string[];
  invocationPhrases: string[];
  domains: string[];
}

export interface PathAspect {
  name: string;
  description: string;
  energy: string;
}

export interface PathOpening {
  name: string;
  description: string;
  application: string;
}

const CAMINHOS_DATA: CaminhoData = {
  name: "Caminhos",
  orixa: "Elegua",
  description: "Os caminhos sagrados são as rotas espirituais que orientam a jornada da alma, определяющие o destino e abrindo ou fechando possibilidades na vida dos seres.",
  path: "Abertura de Caminhos",
  colors: ["Vermelho", "Preto"],
  dayOfWeek: "segunda-feira",
  offerings: ["coco", "palha", "dinheiro", "velas vermelhas", "mel"],
  attributes: [
    "abertura",
    "proteção",
    "orientação",
    "decisão",
    "transição",
    "destino"
  ],
  element: "terra",
  sacredObjects: [
    "chave",
    "corrente",
    "moeda",
    "cruz",
    "pedra vermelha"
  ],
  invocationPhrases: [
    "Elegua, abre meu caminho",
    "Caminhos, mostrem a direção",
    "Elegua, remove os obstáculos"
  ],
  domains: [
    "encruzilhadas",
    "decisões",
    "viagem",
    "transição",
    "destino",
    "abertura de portas"
  ]
};

const pathAspects: PathAspect[] = [
  {
    name: "Caminho Aberto",
    description: "Quando os caminhos estão abertos, as oportunidades fluem naturalmente e as portas se apresentam.",
    energy: "luz"
  },
  {
    name: "Caminho Fechado",
    description: "Bloqueios e obstáculos que indicam necessidade de transformação ou trabalho espiritual.",
    energy: "sombra"
  },
  {
    name: "Encruzilhada",
    description: "Momento de decisão crucial onde múltiplos destinos se cruzam.",
    energy: "transição"
  }
];

const pathOpenings: PathOpening[] = [
  {
    name: "Abertura de Caminho",
    description: "Ritual para abrir novos caminhos quando obstáculos parecem intransponíveis.",
    application: "Quando enfrentar portas fechadas na vida"
  },
  {
    name: "Proteção de Caminho",
    description: "Trabalho para proteger os caminhos abertos de interferências negativas.",
    application: "Manutenção da sorte e prosperidade"
  },
  {
    name: "Desbloqueio",
    description: "Remoção de bloqueios espirituais que impedem o progresso.",
    application: "Remoção de amarras e maldições"
  }
];

export function getData(): CaminhoData {
  return CAMINHOS_DATA;
}

export function getDataById(id: string): CaminhoData | undefined {
  return id === 'caminhos' ? CAMINHOS_DATA : undefined;
}

export function getPathAspects(): PathAspect[] {
  return pathAspects;
}

export function getPathOpenings(): PathOpening[] {
  return pathOpenings;
}

export function getSacredObjects(): string[] {
  return CAMINHOS_DATA.sacredObjects;
}

export function getInvocationPhrases(): string[] {
  return CAMINHOS_DATA.invocationPhrases;
}

export function getDomains(): string[] {
  return CAMINHOS_DATA.domains;
}

export function getCaminhosByElement(element: string): CaminhoData | undefined {
  return CAMINHOS_DATA.element.toLowerCase().includes(element.toLowerCase()) ? CAMINHOS_DATA : undefined;
}

export function getCaminhosByDay(day: string): CaminhoData | undefined {
  return CAMINHOS_DATA.dayOfWeek.toLowerCase().includes(day.toLowerCase()) ? CAMINHOS_DATA : undefined;
}