/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
// SKIP_LINT

/**
 * Io Data Module
 * Spiritual data for Io, the orixá of communication, exchange, and divine connection
 */

export interface IoData {
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

export interface CommunicationAspect {
  name: string;
  description: string;
  energy: string;
}

export interface ExchangeGift {
  name: string;
  description: string;
  application: string;
}

export interface PathOfIo {
  name: string;
  description: string;
  attributes: string[];
}

const IO_DATA: IoData = {
  name: "Io",
  orisha: "Io",
  path: "Mediador Divino",
  colors: ["branco", "cinza"],
  dayOfWeek: "quinta-feira",
  offerings: ["espelho", "papel", "tinta", "pedra-pomes", "café", "coco"],
  attributes: [
    "comunicação",
    "interpretação",
    "medição",
    "conexão",
    "diálogo",
    "tradução",
    "escrita",
    "sabedoria oral"
  ],
  syncPath: "comunicação",
  element: "ar",
  modality: "receptive",
  sacredObjects: [
    "espelho",
    "livro",
    "pena",
    "tinta",
    "papel",
    "pedra-pomes",
    "sino"
  ],
  invocationPhrases: [
    "Io, abre minha voz",
    "Io, traduz minha intenção",
    "Io, conecta-me ao divino"
  ],
  domains: [
    "comunicação",
    "interpretação",
    "oráculos",
    "escrita",
    "medição temporal",
    "conexão espiritual",
    "diálogos sagrados"
  ]
};

const communicationAspects: CommunicationAspect[] = [
  {
    name: "Io Alá",
    description: "O mensageiro que traduz a vontade divina para os mortais",
    energy: "interpretação"
  },
  {
    name: "Io Odó",
    description: "O orixá das palavras e da escritura sagrada",
    energy: "escrita"
  },
  {
    name: "Io Paró",
    description: "O Io das parcerias e acordos celestiais",
    energy: "aliança"
  },
  {
    name: "Io Ilé",
    description: "O guardião das portas e janelas da percepção",
    energy: "abertura"
  },
  {
    name: "Io Onã",
    description: "O Io que abre todos os canais de comunicação",
    energy: "fluxo"
  },
  {
    name: "Io Boró",
    description: "O formador de pontes entre mundos",
    energy: "conexão"
  }
];

const exchangeGifts: ExchangeGift[] = [
  {
    name: "Voz Sagrada",
    description: "A capacidade de articular verdades divinas",
    application: "invocar Io antes de rituais de comunicação"
  },
  {
    name: "Escrita Profética",
    description: "O dom de registrar revelações celestiais",
    application: "manter um diário espiritual"
  },
  {
    name: "Tradução dos Mundos",
    description: "A habilidade de compreender sinais entre planos",
    application: "pedir a Io para traduzir mensagens"
  },
  {
    name: "Escuta Atenta",
    description: "A atenção aos sussurros divinos",
    application: "meditar em silêncio com Io"
  },
  {
    name: "Conexão Celestial",
    description: "O enlace entre o humano e o divino",
    application: "usar espelho como portal de comunicação"
  }
];

const pathsOfIo: PathOfIo[] = [
  {
    name: "Mensageiro",
    description: "Io como aquele que traduz e transmite",
    attributes: ["comunicação", "interpretação", "voz"]
  },
  {
    name: "Escritor",
    description: "Io como senhor da escritura sagrada",
    attributes: ["escrita", "registro", "memória"]
  },
  {
    name: "Mediador",
    description: "Io como ponte entre mundos",
    attributes: ["conexão", "aliança", "acordo"]
  },
  {
    name: "Oráculo",
    description: "Io como revelador de verdades ocultas",
    attributes: ["revelação", "visão", "sabedoria"]
  },
  {
    name: "Guardião de Portas",
    description: "Io como abridor de canais e janelas",
    attributes: ["abertura", "fluxo", "portal"]
  }
];

export function getData(): IoData {
  return IO_DATA;
}

export function getDataById(id: string): IoData | undefined {
  return id === 'io' ? IO_DATA : undefined;
}

export function getCommunicationAspects(): CommunicationAspect[] {
  return communicationAspects;
}

export function getExchangeGifts(): ExchangeGift[] {
  return exchangeGifts;
}

export function getPaths(): PathOfIo[] {
  return pathsOfIo;
}

export function getSacredObjects(): string[] {
  return IO_DATA.sacredObjects;
}

export function getInvocationPhrases(): string[] {
  return IO_DATA.invocationPhrases;
}

export function getDomains(): string[] {
  return IO_DATA.domains;
}

export function getIoByElement(element: string): IoData | undefined {
  return IO_DATA.element.toLowerCase().includes(element.toLowerCase()) ? IO_DATA : undefined;
}

export function getIoByDay(day: string): IoData | undefined {
  return IO_DATA.dayOfWeek.toLowerCase().includes(day.toLowerCase()) ? IO_DATA : undefined;
}