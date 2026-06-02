import type { Planeta, Signo } from '../tipos';

export interface PlanetaInfo {
  nome: string;
  simbolo: string;
  elemento: string;
  qualidade: string;
  regencia: string;
  exaltação: string;
  queda: string;
  cor: string;
  pedra: string;
  dia: string;
  velocidade: string;
  orbita: string;
  natureza: 'benéfico' | 'maléfico' | 'neutro';
}

export const PLANETAS_DATA: Record<Planeta, PlanetaInfo> = {
  sol: {
    nome: 'Sol',
    simbolo: '☉',
    elemento: 'Fogo',
    qualidade: 'Fixo',
    regencia: 'Leão',
    exaltação: 'Áries',
    queda: 'Libra',
    cor: '#FFD700',
    pedra: 'Heliodoro, Ouro',
    dia: 'Domingo',
    velocidade: '~1°/dia',
    orbita: '365 dias',
    natureza: 'benéfico',
  },
  lua: {
    nome: 'Lua',
    simbolo: '☽',
    elemento: 'Água',
    qualidade: 'Cardinal',
    regencia: 'Câncer',
    exaltação: 'Touro',
    queda: 'Escorpião',
    cor: '#C0C0C0',
    pedra: 'Pérola, Selenita',
    dia: 'Segunda',
    velocidade: '~13°/dia',
    orbita: '27 dias',
    natureza: 'neutro',
  },
  mercurio: {
    nome: 'Mercúrio',
    simbolo: '☿',
    elemento: 'Ar',
    qualidade: 'Mutável',
    regencia: 'Gêmeos/Virgem',
    exaltação: 'Virgem',
    queda: 'Peixes',
    cor: '#90EE90',
    pedra: 'Ágata, Crisocola',
    dia: 'Quarta',
    velocidade: '~1°/dia',
    orbita: '88 dias',
    natureza: 'neutro',
  },
  venus: {
    nome: 'Vênus',
    simbolo: '♀',
    elemento: 'Terra',
    qualidade: 'Fixo',
    regencia: 'Touro/Libra',
    exaltação: 'Peixes',
    queda: 'Virgem',
    cor: '#FFB6C1',
    pedra: 'Turquesa, Madrepérola',
    dia: 'Sexta',
    velocidade: '~1°/dia',
    orbita: '225 dias',
    natureza: 'benéfico',
  },
  marte: {
    nome: 'Marte',
    simbolo: '♂',
    elemento: 'Fogo',
    qualidade: 'Cardinal',
    regencia: 'Áries/Escorpião',
    exaltação: 'Capricórnio',
    queda: 'Câncer',
    cor: '#FF4500',
    pedra: 'Diamante, Hematita',
    dia: 'Terça',
    velocidade: '~0.5°/dia',
    orbita: '687 dias',
    natureza: 'maléfico',
  },
  jupiter: {
    nome: 'Júpiter',
    simbolo: '♃',
    elemento: 'Fogo',
    qualidade: 'Mutável',
    regencia: 'Sagitário/Peixes',
    exaltação: 'Câncer',
    queda: 'Capricórnio',
    cor: '#FFA500',
    pedra: 'Topázio, Ametista',
    dia: 'Quinta',
    velocidade: '~0.08°/dia',
    orbita: '12 anos',
    natureza: 'benéfico',
  },
  saturno: {
    nome: 'Saturno',
    simbolo: '♄',
    elemento: 'Terra',
    qualidade: 'Fixo',
    regencia: 'Capricórnio/Aquário',
    exaltação: 'Libra',
    queda: 'Áries',
    cor: '#4B0082',
    pedra: 'Ônix, Turmalina',
    dia: 'Sábado',
    velocidade: '~0.03°/dia',
    orbita: '29 anos',
    natureza: 'maléfico',
  },
  urano: {
    nome: 'Urano',
    simbolo: '⛢',
    elemento: 'Ar',
    qualidade: 'Fixo',
    regencia: 'Aquário',
    exaltação: 'Escorpião',
    queda: 'Touro',
    cor: '#00CED1',
    pedra: 'Água-marinha, Fenicuita',
    dia: 'Sábado',
    velocidade: '~0.01°/dia',
    orbita: '84 anos',
    natureza: 'neutro',
  },
  netuno: {
    nome: 'Netuno',
    simbolo: '♆',
    elemento: 'Água',
    qualidade: 'Mutável',
    regencia: 'Peixes',
    exaltação: 'Leão',
    queda: 'Aquário',
    cor: '#4169E1',
    pedra: 'Água-marinha, Turquesa',
    dia: 'Segunda',
    velocidade: '~0.006°/dia',
    orbita: '165 anos',
    natureza: 'neutro',
  },
  plutao: {
    nome: 'Plutão',
    simbolo: '♇',
    elemento: 'Água',
    qualidade: 'Fixo',
    regencia: 'Escorpião',
    exaltação: 'Áries',
    queda: 'Libra',
    cor: '#8B0000',
    pedra: 'Obsidiana, Turmalina negra',
    dia: 'Terça',
    velocidade: '~0.004°/dia',
    orbita: '248 anos',
    natureza: 'neutro',
  },
  node_norte: {
    nome: 'Nodo Norte',
    simbolo: '☊',
    elemento: 'Ar',
    qualidade: 'Mutável',
    regencia: '',
    exaltação: '',
    queda: '',
    cor: '#C0C0C0',
    pedra: 'Cristal de quartzo',
    dia: '',
    velocidade: 'retrogrado',
    orbita: '18.6 anos',
    natureza: 'neutro',
  },
  node_sul: {
    nome: 'Nodo Sul',
    simbolo: '☋',
    elemento: 'Ar',
    qualidade: 'Mutável',
    regencia: '',
    exaltação: '',
    queda: '',
    cor: '#808080',
    pedra: 'Obsidiana',
    dia: '',
    velocidade: 'retrogrado',
    orbita: '18.6 anos',
    natureza: 'neutro',
  },
  quiron: {
    nome: 'Quiron',
    simbolo: '⚷',
    elemento: 'Água',
    qualidade: 'Mutável',
    regencia: '',
    exaltação: '',
    queda: '',
    cor: '#9370DB',
    pedra: 'Citrino',
    dia: '',
    velocidade: 'variável',
    orbita: '50 anos',
    natureza: 'neutro',
  },
};

export type ForçaPlaneta = 'exaltado' | 'domicílio' | 'neutro' | 'detrimento' | 'queda';

const SIGNOS_EXALTAÇÃO: Record<Planeta, Signo | null> = {
  sol: 'aries',
  lua: 'touro',
  mercurio: 'virgem',
  venus: 'peixes',
  marte: 'capricornio',
  jupiter: 'cancer',
  saturno: 'libra',
  urano: 'escorpio',
  netuno: 'leao',
  plutao: 'aries',
  node_norte: null,
  node_sul: null,
  quiron: null,
};

const SIGNOS_DOMICÍLIO: Record<Planeta, Signo[]> = {
  sol: ['leao'],
  lua: ['cancer'],
  mercurio: ['gemeos', 'virgem'],
  venus: ['touro', 'libra'],
  marte: ['aries', 'escorpio'],
  jupiter: ['sagitario', 'peixes'],
  saturno: ['capricornio', 'aquario'],
  urano: ['aquario'],
  netuno: ['peixes'],
  plutao: ['escorpio'],
  node_norte: [],
  node_sul: [],
  quiron: [],
};

const SIGNOS_QUEDA: Record<Planeta, Signo | null> = {
  sol: 'libra',
  lua: 'escorpio',
  mercurio: 'peixes',
  venus: 'virgem',
  marte: 'cancer',
  jupiter: 'capricornio',
  saturno: 'aries',
  urano: 'touro',
  netuno: 'aquario',
  plutao: 'libra',
  node_norte: null,
  node_sul: null,
  quiron: null,
};

const SIGNOS_DETRIMENTO: Record<Planeta, Signo[]> = {
  sol: ['aquario'],
  lua: ['capricornio'],
  mercurio: ['peixes', 'sagitario'],
  venus: ['aries', 'escorpio'],
  marte: ['libra', 'touro'],
  jupiter: ['gemeos', 'virgem'],
  saturno: ['cancer', 'leao'],
  urano: ['touro'],
  netuno: ['virgem'],
  plutao: ['touro'],
  node_norte: [],
  node_sul: [],
  quiron: [],
};

export function getForçaPlaneta(planeta: Planeta, signo: Signo): ForçaPlaneta {
  if (SIGNOS_EXALTAÇÃO[planeta] === signo) return 'exaltado';
  if (SIGNOS_DOMICÍLIO[planeta].includes(signo)) return 'domicílio';
  if (SIGNOS_QUEDA[planeta] === signo) return 'queda';
  if (SIGNOS_DETRIMENTO[planeta].includes(signo)) return 'detrimento';
  return 'neutro';
}

export function getCorForça(força: ForçaPlaneta): string {
  switch (força) {
    case 'exaltado':
      return '#22C55E';
    case 'domicílio':
      return '#3B82F6';
    case 'neutro':
      return '#94A3B8';
    case 'queda':
      return '#F59E0B';
    case 'detrimento':
      return '#EF4444';
  }
}

export function getLabelForça(força: ForçaPlaneta): string {
  switch (força) {
    case 'exaltado':
      return 'Exaltado';
    case 'domicílio':
      return 'Domicílio';
    case 'neutro':
      return 'Neutro';
    case 'queda':
      return 'Queda';
    case 'detrimento':
      return 'Detrimento';
  }
}