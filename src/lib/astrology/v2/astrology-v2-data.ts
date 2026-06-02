// @ts-nocheck
/**
 * Astrology v2 data
 * Comprehensive data for the new astrology system
 */

export interface SignoData {
  nome: string;
  simbolo: string;
  elemento: string;
  qualidade: string;
  regente: string;
  exaltação: string;
  queda: string;
  cor: string;
  pedra: string;
  dia: string;
  modo: string;
  polaridade: 'positivo' | 'negativo' | 'neutro';
 跨度: number;
 戾: string;
}

export interface PlanetaData {
  nome: string;
  simbolo: string;
  elemento: string;
  qualidade: string;
  regencia: string[];
  exaltação: string | null;
  queda: string | null;
  cor: string;
  pedra: string;
  dia: string;
  velocidade: string;
  orbita: string;
  natureza: 'benéfico' | 'maléfico' | 'neutro';
  símboloUnicode: string;
}

export interface ElementoData {
  nome: string;
  simbolo: string;
  signos: string[];
  qualidades: string[];
  cor: string;
  naturaleza: string;
}

export interface AspectoData {
  nome: string;
  simbolo: string;
  graus: number;
  orbina: string;
  naturaleza: 'harmônico' | 'desarmonico' | 'neutro';
}

export interface CasaData {
  numero: number;
  nome: string;
  abreviacao: string;
  regente: string;
  elemento: string;
  polaridade: string;
 关键词: string[];
}

export const SIGNOS_DATA: Record<string, SignoData> = {
  aries: {
    nome: 'Áries',
    simbolo: '♈',
    elemento: 'Fogo',
    qualidade: 'Cardinal',
    regente: 'Marte',
    exaltação: 'Sol',
    queda: 'Vênus',
    cor: '#FF6B6B',
    pedra: 'Diamante',
    dia: 'Terça-feira',
    modo: 'Assertivo',
    polaridade: 'positivo',
    跨度: '21/03 - 19/04',
    戾: 'Pioneiro, corajoso, competitivo',
  },
  touro: {
    nome: 'Touro',
    simbolo: '♉',
    elemento: 'Terra',
    qualidade: 'Fixo',
    regente: 'Vênus',
    exaltação: 'Lua',
    queda: 'Plutão',
    cor: '#4ECDC4',
    pedra: 'Esmeralda',
    dia: 'Sexta-feira',
    modo: 'Estável',
    polaridade: 'negativo',
    跨度: '20/04 - 20/05',
    戾: 'Prático, persistente, confiável',
  },
  gemeos: {
    nome: 'Gêmeos',
    simbolo: '♊',
    elemento: 'Ar',
    qualidade: 'Mutável',
    regente: 'Mercúrio',
    exaltação: 'Quiron',
    queda: 'Júpiter',
    cor: '#FFE66D',
    pedra: 'Ágata',
    dia: 'Quarta-feira',
    modo: 'Versátil',
    polaridade: 'positivo',
    跨度: '21/05 - 20/06',
    戾: 'Curioso, comunicativo, adaptável',
  },
  cancer: {
    nome: 'Câncer',
    simbolo: '♋',
    elemento: 'Água',
    qualidade: 'Cardinal',
    regente: 'Lua',
    exaltação: 'Júpiter',
    queda: 'Saturno',
    cor: '#95E1D3',
    pedra: 'Pérola',
    dia: 'Segunda-feira',
    modo: 'Nutridor',
    polaridade: 'negativo',
    跨度: '21/06 - 22/07',
    戾: 'Emocional, protetor, intuitivo',
  },
  leao: {
    nome: 'Leão',
    simbolo: '♌',
    elemento: 'Fogo',
    qualidade: 'Fixo',
    regente: 'Sol',
    exaltação: 'Nenhum',
    queda: 'Nenhum',
    cor: '#FFD93D',
    pedra: 'Âmbar',
    dia: 'Domingo',
    modo: 'Radiante',
    polaridade: 'positivo',
    跨度: '23/07 - 22/08',
    戾: 'Criativo, generoso, magnânimo',
  },
  virgem: {
    nome: 'Virgem',
    simbolo: '♍',
    elemento: 'Terra',
    qualidade: 'Mutável',
    regente: 'Mercúrio',
    exaltação: 'Mercúrio',
    queda: 'Vênus',
    cor: '#6BCB77',
    pedra: 'Sardônica',
    dia: 'Quarta-feira',
    modo: 'Analítico',
    polaridade: 'negativo',
    跨度: '23/08 - 22/09',
    戾: 'Analítico, detailhado, 服务导向',
  },
  libra: {
    nome: 'Libra',
    simbolo: '♎',
    elemento: 'Ar',
    qualidade: 'Cardinal',
    regente: 'Vênus',
    exaltação: 'Saturno',
    queda: 'Sol',
    cor: '#DDA0DD',
    pedra: 'Opala',
    dia: 'Sexta-feira',
    modo: 'Diplomático',
    polaridade: 'positivo',
    跨度: '23/09 - 22/10',
    戾: 'Diplomático, justo, encantador',
  },
  escorpio: {
    nome: 'Escorpião',
    simbolo: '♏',
    elemento: 'Água',
    qualidade: 'Fixo',
    regente: 'Plutão',
    exaltação: 'Urano',
    queda: 'Lua',
    cor: '#8B0000',
    pedra: 'Topázio',
    dia: 'Terça-feira',
    modo: 'Transformador',
    polaridade: 'negativo',
    跨度: '23/10 - 21/11',
    戾: 'Passionado, determinado, mystério',
  },
  sagitario: {
    nome: 'Sagitário',
    simbolo: '♐',
    elemento: 'Fogo',
    qualidade: 'Mutável',
    regente: 'Júpiter',
    exaltação: 'Netuno',
    queda: 'Mercúrio',
    cor: '#9B59B6',
    pedra: 'Turquesa',
    dia: 'Quinta-feira',
    modo: 'Explorador',
    polaridade: 'positivo',
    跨度: '22/11 - 21/12',
    戾: 'Otimista, aventureiro, filosófico',
  },
  capricornio: {
    nome: 'Capricórnio',
    simbolo: '♑',
    elemento: 'Terra',
    qualidade: 'Cardinal',
    regente: 'Saturno',
    exaltação: 'Marte',
    queda: 'Júpiter',
    cor: '#2C3E50',
    pedra: 'Garnet',
    dia: 'Sábado',
    modo: 'Amibioso',
    polaridade: 'negativo',
    跨度: '22/12 - 19/01',
    戾: 'Disciplinado, responsável, pragmático',
  },
  aquario: {
    nome: 'Aquário',
    simbolo: '♒',
    elemento: 'Ar',
    qualidade: 'Fixo',
    regente: 'Urano',
    exaltação: 'Nenhum',
    queda: 'Nenhum',
    cor: '#3498DB',
    pedra: 'Amethyst',
    dia: 'Sábado',
    modo: 'Humanitário',
    polaridade: 'positivo',
    跨度: '20/01 - 18/02',
    戾: 'Independente, inovador, visionário',
  },
  peixes: {
    nome: 'Peixes',
    simbolo: '♓',
    elemento: 'Água',
    qualidade: 'Mutável',
    regente: 'Netuno',
    exaltação: 'Vênus',
    queda: 'Mercúrio',
    cor: '#1ABC9C',
    pedra: 'Água-marinha',
    dia: 'Quinta-feira',
    modo: 'Compassivo',
    polaridade: 'negativo',
    跨度: '19/02 - 20/03',
    戾: 'Intuitivo, compassivo, sonhador',
  },
};

const PLANETAS_DATA: Record<string, PlanetaData> = {
  sol: {
    nome: 'Sol',
    simbolo: '☉',
    elemento: 'Fogo',
    qualidade: 'Cardinal',
    regencia: ['leao'],
    exaltação: 'aries',
    queda: null,
    cor: '#FFD700',
    pedra: 'Diamante',
    dia: 'Domingo',
    velocidade: '~1 grau/dia',
    orbita: '1 ano',
    natureza: 'benéfico',
    símboloUnicode: '☉',
  },
  lua: {
    nome: 'Lua',
    simbolo: '☽',
    elemento: 'Água',
    qualidade: 'Cardinal',
    regencia: ['cancer'],
    exaltação: 'touro',
    queda: 'escorpião',
    cor: '#C0C0C0',
    pedra: 'Pérola',
    dia: 'Segunda-feira',
    velocidade: '~13 graus/dia',
    orbita: '27.5 dias',
    natureza: 'benéfico',
    símboloUnicode: '☽',
  },
  mercurio: {
    nome: 'Mercúrio',
    simbolo: '☿',
    elemento: 'Terra',
    qualidade: 'Neutro',
    regencia: ['gemeos', 'virgem'],
    exaltação: 'virgem',
    queda: 'peixes',
    cor: '#C9C9C9',
    pedra: 'Ágata',
    dia: 'Quarta-feira',
    velocidade: '~4 graus/dia',
    orbita: '88 dias',
    natureza: 'neutro',
    símboloUnicode: '☿',
  },
  venus: {
    nome: 'Vênus',
    simbolo: '♀',
    elemento: 'Terra',
    qualidade: 'Neutro',
    regencia: ['touro', 'libra'],
    exaltação: 'peixes',
    queda: 'aries',
    cor: '#E6B800',
    pedra: 'Esmeralda',
    dia: 'Sexta-feira',
    velocidade: '~1.2 graus/dia',
    orbita: '225 dias',
    natureza: 'benéfico',
    símboloUnicode: '♀',
  },
  marte: {
    nome: 'Marte',
    simbolo: '♂',
    elemento: 'Fogo',
    qualidade: 'Cardinal',
    regencia: ['aries'],
    exaltação: 'capricornio',
    queda: 'cancer',
    cor: '#FF4500',
    pedra: 'Rubi',
    dia: 'Terça-feira',
    velocidade: '~0.5 graus/dia',
    orbita: '687 dias',
    natureza: 'maléfico',
    símboloUnicode: '♂',
  },
  jupiter: {
    nome: 'Júpiter',
    simbolo: '♃',
    elemento: 'Fogo',
    qualidade: 'Mutável',
    regencia: ['sagitario'],
    exaltação: 'cancer',
    queda: 'capricornio',
    cor: '#FF8C00',
    pedra: 'Safira',
    dia: 'Quinta-feira',
    velocidade: '~0.08 graus/dia',
    orbita: '12 anos',
    natureza: 'benéfico',
    símboloUnicode: '♃',
  },
  saturno: {
    nome: 'Saturno',
    simbolo: '♄',
    elemento: 'Terra',
    qualidade: 'Cardinal',
    regencia: ['capricornio'],
    exaltação: 'libra',
    queda: 'aries',
    cor: '#696969',
    pedra: 'Ônix',
    dia: 'Sábado',
    velocidade: '~0.03 graus/dia',
    orbita: '29.5 anos',
    natureza: 'maléfico',
    símboloUnicode: '♄',
  },
  urano: {
    nome: 'Urano',
    simbolo: '♅',
    elemento: 'Ar',
    qualidade: 'Fixo',
    regencia: ['aquario'],
    exaltação: 'escorpião',
    queda: null,
    cor: '#40E0D0',
    pedra: 'Alexandrita',
    dia: 'Sábado',
    velocidade: '~0.01 graus/dia',
    orbita: '84 anos',
    natureza: 'neutro',
    símboloUnicode: '♅',
  },
  netuno: {
    nome: 'Netuno',
    simbolo: '♆',
    elemento: 'Água',
    qualidade: 'Mutável',
    regencia: ['peixes'],
    exaltação: 'sagitario',
    queda: null,
    cor: '#4169E1',
    pedra: 'Água-marinha',
    dia: 'Quinta-feira',
    velocidade: '~0.006 graus/dia',
    orbita: '165 anos',
    natureza: 'neutro',
    símboloUnicode: '♆',
  },
  plutao: {
    nome: 'Plutão',
    simbolo: '♇',
    elemento: 'Água',
    qualidade: 'Fixo',
    regencia: ['escorpião'],
    exaltação: null,
    queda: 'touro',
    cor: '#800080',
    pedra: 'Jade',
    dia: 'Terça-feira',
    velocidade: '~0.004 graus/dia',
    orbita: '248 anos',
    natureza: 'maléfico',
    símboloUnicode: '♇',
  },
  node_norte: {
    nome: 'Nodo Norte',
    simbolo: '☊',
    elemento: 'Água',
    qualidade: 'Neutro',
    regencia: [],
    exaltação: null,
    queda: null,
    cor: '#C0C0C0',
    pedra: 'Lunarita',
    dia: 'Dinâmica',
    velocidade: '~19 anos',
    orbita: '18.6 anos',
    natureza: 'neutro',
    símboloUnicode: '☊',
  },
  node_sul: {
    nome: 'Nodo Sul',
    simbolo: '☋',
    elemento: 'Água',
    qualidade: 'Neutro',
    regencia: [],
    exaltação: null,
    queda: null,
    cor: '#808080',
    pedra: 'Obsidiana',
    dia: 'Dinâmica',
    velocidade: '~19 anos',
    orbita: '18.6 anos',
    natureza: 'neutro',
    símboloUnicode: '☋',
  },
};

const ELEMENTOS_DATA: Record<string, ElementoData> = {
  fogo: {
    nome: 'Fogo',
    simbolo: '🜂',
    signos: ['aries', 'leao', 'sagitario'],
    qualidades: ['Cardinal', 'Fixo', 'Mutável'],
    cor: '#FF4500',
    naturaleza: 'Energético, inspirador, espontâneo',
  },
  terra: {
    nome: 'Terra',
    simbolo: '🜃',
    signos: ['touro', 'virgem', 'capricornio'],
    qualidades: ['Fixo', 'Mutável', 'Cardinal'],
    cor: '#8B4513',
    naturaleza: 'Prático, estável, materialista',
  },
  ar: {
    nome: 'Ar',
    simbolo: 'Air',
    signos: ['gemeos', 'libra', 'aquario'],
    qualidades: ['Mutável', 'Cardinal', 'Fixo'],
    cor: '#87CEEB',
    naturaleza: 'Intelectual, social, idealista',
  },
  água: {
    nome: 'Água',
    simbolo: '🜄',
    signos: ['cancer', 'escorpião', 'peixes'],
    qualidades: ['Cardinal', 'Fixo', 'Mutável'],
    cor: '#1E90FF',
    naturaleza: 'Emocional, intuitivo, حساس',
  },
};

const ASPECTOS_DATA: Record<string, AspectoData> = {
  conjuncao: {
    nome: 'Conjunção',
    simbolo: '☌',
    graus: 0,
    orbina: '±8°',
    naturaleza: 'neutro',
  },
  oposicao: {
    nome: 'Oposição',
    simbolo: '☍',
    graus: 180,
    orbina: '±8°',
    naturaleza: 'desarmonico',
  },
  quadratura: {
    nome: 'Quadratura',
    simbolo: '□',
    graus: 90,
    orbina: '±6°',
    naturaleza: 'desarmonico',
  },
  trino: {
    nome: 'Trino',
    simbolo: '△',
    graus: 120,
    orbina: '±6°',
    naturaleza: 'harmônico',
  },
  sextil: {
    nome: 'Sextil',
    simbolo: '✶',
    graus: 60,
    orbina: '±4°',
    naturaleza: 'harmônico',
  },
  semi_sextil: {
    nome: 'Semisextil',
    simbolo: '⚺',
    graus: 30,
    orbina: '±2°',
    naturaleza: 'neutro',
  },
  semi_quadratura: {
    nome: 'Semiquadratura',
    simbolo: '⚼',
    graus: 45,
    orbina: '±2°',
    naturaleza: 'desarmonico',
  },
  quintil: {
    nome: 'Quintil',
    simbolo: '⌀',
    graus: 72,
    orbina: '±2°',
    naturaleza: 'neutro',
  },
  biquintil: {
    nome: 'Biquintil',
    simbolo: '⚻',
    graus: 144,
    orbina: '±2°',
    naturaleza: 'neutro',
  },
};

const CASAS_DATA: Record<number, CasaData> = {
  1: {
    numero: 1,
    nome: 'Casa I - Ascendente',
    abreviacao: 'I',
    regente: 'Marte',
    elemento: 'Fogo',
    polaridade: 'positivo',
    关键词: ['Eu sou', 'identidade', 'aparência', 'início'],
  },
  2: {
    numero: 2,
    nome: 'Casa II - Recursos',
    abreviacao: 'II',
    regente: 'Vênus',
    elemento: 'Terra',
    polaridade: 'negativo',
    关键词: ['Eu tenho', 'valores', 'finanças', 'possessões'],
  },
  3: {
    numero: 3,
    nome: 'Casa III - Comunicação',
    abreviacao: 'III',
    regente: 'Mercúrio',
    elemento: 'Ar',
    polaridade: 'positivo',
    关键词: ['Eu penso', 'irmãos', 'comunicação', 'aprendizado'],
  },
  4: {
    numero: 4,
    nome: 'Casa IV - Fundamentos',
    abreviacao: 'IV',
    regente: 'Lua',
    elemento: 'Água',
    polaridade: 'negativo',
    关键词: ['Eu sinto', 'lar', 'família', 'raízes'],
  },
  5: {
    numero: 5,
    nome: 'Casa V - Criação',
    abreviacao: 'V',
    regente: 'Sol',
    elemento: 'Fogo',
    polaridade: 'positivo',
    关键词: ['Eu crio', 'filhos', 'arte', 'romance'],
  },
  6: {
    numero: 6,
    nome: 'Casa VI - Serviço',
    abreviacao: 'VI',
    regente: 'Mercúrio',
    elemento: 'Terra',
    polaridade: 'negativo',
    关键词: ['Eu sirvo', 'trabalho', 'saúde', 'rotina'],
  },
  7: {
    numero: 7,
    nome: 'Casa VII - Parcerias',
    abreviacao: 'VII',
    regente: 'Vênus',
    elemento: 'Ar',
    polaridade: 'positivo',
    关键词: ['Eu relaciono', 'casamento', 'parceiros', 'contratos'],
  },
  8: {
    numero: 8,
    nome: 'Casa VIII - Transformação',
    abreviacao: 'VIII',
    regente: 'Plutão',
    elemento: 'Água',
    polaridade: 'negativo',
    关键词: ['Eu transformation', 'recursos compartilhados', 'mistérios', 'morte'],
  },
  9: {
    numero: 9,
    nome: 'Casa IX - Sabedoria',
    abreviacao: 'IX',
    regente: 'Júpiter',
    elemento: 'Fogo',
    polaridade: 'positivo',
    关键词: ['Eu busco', 'filosofia', 'viagens', 'espiritualidade'],
  },
  10: {
    numero: 10,
    nome: 'Casa X - Propósito',
    abreviacao: 'X',
    regente: 'Saturno',
    elemento: 'Terra',
    polaridade: 'negativo',
    关键词: ['Eu alcanso', 'carreira', 'status', 'reputação'],
  },
  11: {
    numero: 11,
    nome: 'Casa XI - Esperanças',
    abreviacao: 'XI',
    regente: 'Urano',
    elemento: 'Ar',
    polaridade: 'positivo',
    关键词: ['Eu espero', 'amigos', 'grupos', 'aspirations'],
  },
  12: {
    numero: 12,
    nome: 'Casa XII - Iluminação',
    abreviacao: 'XII',
    regente: 'Netuno',
    elemento: 'Água',
    polaridade: 'negativo',
    关键词: ['Eu sacrifico', 'carma', 'prisões', 'inconsciente'],
  },
};
export interface AstrologyV2Data {
  signos: Record<string, SignoData>;
  planetas: Record<string, PlanetaData>;
  elementos: Record<string, ElementoData>;
  aspectos: Record<string, AspectoData>;
  casas: Record<number, CasaData>;
}

function getData(): AstrologyV2Data {
  return {
    signos: SIGNOS_DATA,
    planetas: PLANETAS_DATA,
    elementos: ELEMENTOS_DATA,
    aspectos: ASPECTOS_DATA,
    casas: CASAS_DATA,
  };
}

export default getData;