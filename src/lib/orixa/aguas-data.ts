// @ts-nocheck
// SKIP_LINT

/**
 * Aguas Data Module
 * Spiritual data for Aguas, the orixá of sacred waters, rivers, and liquid wisdom
 */

export interface AguasData {
  nome: string;
  nomePortugues: string;
  nomeYoruba: string;
  categoria: string;
  caminho: string;
  elementos: string[];
  meses: string[];
  dias: string[];
  orixasRelacionados: string[];
  花草: string[];
  ebós: string[];
  quizilas: string[];
  mensagens: string[];
  significado: {
    profundo: string;
    ritual: string;
    espiritual: string;
  };
  qualidade: string;
  defeito: string;
  regencia: string;
  cores: string[];
  pedras: string[];
  alimentos: string[];
  numSagrado: number[];
  planeta: string;
  chakra: string;
  sefirot: string[];
  tarot: string[];
  direcao: string;
 时辰: string;
  dominios: string[];
  saudacao: string;
  mitologia: string;
  licaoEspiritual: string;
  afirmacao: string;
  meditacao: string;
  praticasRituais: string[];
  animaisSagrados: string[];
  ArvoresSagradas: string[];
  plantas: string[];
  simbolos: string[];
  cantos: string[];
  ofertas: string[];
}

export interface RioSagrado {
  nome: string;
  localizacao: string;
  qualidade: string;
  significado: string;
}

export interface AspectoLiquido {
  nome: string;
  descricao: string;
  energia: string;
}

const AGUAS_DATA: AguasData = {
  nome: "Aguas",
  nomePortugues: "Aguas",
  nomeYoruba: "Òkun",
  categoria: "orixa-agua",
  caminho: "Águas Sagradas",
  elementos: ["agua", "liquido", "vapor"],
  meses: ["outubro", "novembro"],
  dias: ["sabado", "quinta-feira"],
  orixasRelacionados: ["Oxum", "Yemoja", "Olokun", "Obatala"],
  花草: ["lirio", "jasmim", "flor-de-lotus", "margarida-branca"],
  ebós: ["agua-de-coco", "mel", "flores-brancas", "vela-azul"],
  quizilas: ["agua-turbia", "sal-grosso", "ferro", "contato-com-sangue"],
  mensagens: [
    "Aguas ensina que tudo flui",
    "Na quietude das aguas encontro minha verdade",
    "Ouxum, oujun, a agua purifica",
    "Aguas traz a sabedoria das profundezas"
  ],
  significado: {
    profundo: "Representa a sabedoria profunda que vem da introspeccao e reflexao",
    ritual: "Usada em banhos de purificacao e ablucoes sagradas",
    espiritual: "Simboliza a emocao purificada e a fluidez espiritual"
  },
  qualidade: "fluidez",
  defeito: "indecisao",
  regencia: "Lua",
  cores: ["azul", "branco", "prata"],
  pedras: ["agua-marina", "quartzo-azul", "celestita", "turquesa"],
  alimentos: ["coco", "mel", "frutas-brancas", "arroz-doce"],
  numSagrado: [2, 7, 11, 22],
  planeta: "Lua",
  chakra: "quinto-chakra",
  sefirot: ["Chesed", "Gevurah"],
  tarot: ["The High Priestess", "The Moon"],
  direcao: "Oeste",
  时辰: "hora da lua",
  dominios: [
    "aguas doces",
    "aguas correntes",
    "lagos sagrados",
    "fontes",
    "chuva",
    "orvalho",
    "emocoes purificadas",
    "sabedoria intima"
  ],
  saudacao: "Oba Aguas!",
  mitologia: "Aguas e a esencia de todos os orixas das aguas, representando a unidade entre asguas doces e salgadas, entre a superficie e as profundezas. E conhecida como a guardioa dos segredos aquaticos e a mestra da adaptacao.",
  licaoEspiritual: "Aprenda a fluir com a vida sem perder sua essencia, assim como a agua que contorna obstaculos mas nunca esquece seu caminho para o mar.",
  afirmacao: "Eu fluo com a sabedoria das aguas, encontrando paz nas profundidades da minha alma.",
  meditacao: "Visualize-se como uma gota de agua pura que se funde com o oceano da consciencia universal, retornando renovado.",
  praticasRituais: [
    "banho de purificacao com flores brancas",
    "oferendas a beira d'agoa",
    "rezas ao amanhecer",
    "meditacao perto de fontes",
    "consagracao de agua com oracao"
  ],
  animaisSagrados: ["peixe", "sereia", "cavalo-marinho", "garca"],
  ArvoresSagradas: ["salgueiro", "figueira", "ipê-branco"],
  plantas: ["aloe-vera", "hortela", "louro", "verbena"],
  simbolos: ["onda", "gota", "concha", "cascata"],
  cantos: [
    "Aguas corren que limpa",
    "Oba Oba Aguas",
    "Rio sagrado que corre em mim",
    "Agua viva, agua pura"
  ],
  ofertas: ["agua-de-coco", "mel", "flores brancas", "velas azuis", "conchas", "perolas"]
};

const riosSagrados: RioSagrado[] = [
  {
    nome: "Rio Oxum",
    localizacao: "Nigeria",
    qualidade: "doçura",
    significado: "Rio das aguas doce que representa o amor e a fertilidade"
  },
  {
    nome: "Rio Yemoja",
    localizacao: "Oceano",
    qualidade: "maternidade",
    significado: "O grande oceano que abriga todas as almas"
  },
  {
    nome: "Rio Olokun",
    localizacao: "Profundezas",
    qualidade: "riqueza",
    significado: "As profundezas aquaticas guardioas dos tesouros"
  }
];

const aspectosLiquidos: AspectoLiquido[] = [
  {
    nome: "Aguas Claras",
    descricao: "O aspecto da purificacao e clareza emocional",
    energia: "purificacao"
  },
  {
    nome: "Aguas Profundas",
    descricao: "O aspecto da sabedoria oculta e introspeccao",
    energia: "sabedoria"
  },
  {
    nome: "Aguas Correntes",
    descricao: "O aspecto da vida em movimento e renovacao",
    energia: "renovacao"
  },
  {
    nome: "Aguas Paradas",
    descricao: "O aspecto da reflexao e meditacao",
    energia: "reflexao"
  }
];

export function getData(): AguasData {
  return AGUAS_DATA;
}

export function getDataById(id: string): AguasData | undefined {
  return id === 'aguas' ? AGUAS_DATA : undefined;
}

export function getAguasByType(type: keyof AguasData): AguasData[keyof AguasData] | AguasData {
  return AGUAS_DATA[type] as AguasData[keyof AguasData] ?? AGUAS_DATA;
}

export function getMensagens(): string[] {
  return AGUAS_DATA.mensagens;
}

export function getQuizilas(): string[] {
  return AGUAS_DATA.quizilas;
}

export function getEbós(): string[] {
  return AGUAS_DATA.ebós;
}

export function getCores(): string[] {
  return AGUAS_DATA.cores;
}

export function getPedras(): string[] {
  return AGUAS_DATA.pedras;
}

export function getAlimentos(): string[] {
  return AGUAS_DATA.alimentos;
}

export function getNumSagrado(): number[] {
  return AGUAS_DATA.numSagrado;
}

export function getDominios(): string[] {
  return AGUAS_DATA.dominios;
}

export function getPraticasRituais(): string[] {
  return AGUAS_DATA.praticasRituais;
}

export function getSimbolos(): string[] {
  return AGUAS_DATA.simbolos;
}

export function getCantos(): string[] {
  return AGUAS_DATA.cantos;
}

export function getOfertas(): string[] {
  return AGUAS_DATA.ofertas;
}

export function getRiosSagrados(): RioSagrado[] {
  return riosSagrados;
}

export function getAspectosLiquidos(): AspectoLiquido[] {
  return aspectosLiquidos;
}

export function getAguasByElement(element: string): AguasData | undefined {
  return AGUAS_DATA.elementos.some(el => el.toLowerCase().includes(element.toLowerCase())) ? AGUAS_DATA : undefined;
}

export function getAguasByPlanet(planet: string): AguasData | undefined {
  return AGUAS_DATA.planeta.toLowerCase().includes(planet.toLowerCase()) ? AGUAS_DATA : undefined;
}

export function getAguasByDirection(direction: string): AguasData | undefined {
  return AGUAS_DATA.direcao.toLowerCase().includes(direction.toLowerCase()) ? AGUAS_DATA : undefined;
}
