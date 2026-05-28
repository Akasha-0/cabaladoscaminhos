export interface PlanetaInfo {
  nome: string;
  simbolo: string;
  signoRegente: string;
  elemento: string;
  qualidade: string;
  exaltação: string;
  queda: string;
  periodo: string;
  velocidade: string;
  descricaoBreve: string;
}

export const SIGNOS_SIMBOLOS: Record<string, string> = {
  aries: '♈',
  touro: '♉',
  gemeos: '♊',
  cancer: '♋',
  leao: '♌',
  virgem: '♍',
  libra: '♎',
  escorpio: '♏',
  sagitario: '♐',
  capricornio: '♑',
  aquario: '♒',
  peixes: '♓',
};

export const PLANETAS: Record<string, PlanetaInfo> = {
  sol: {
    nome: 'Sol',
    simbolo: '☉',
    signoRegente: 'Leão',
    elemento: 'Fogo',
    qualidade: 'Fixo',
    exaltação: 'Áries',
    queda: 'Balança',
    periodo: '~1 mês por signo',
    velocidade: '~1°/dia',
    descricaoBreve: 'Vitalidade, propósito, ego',
  },
  lua: {
    nome: 'Lua',
    simbolo: '☽',
    signoRegente: 'Câncer',
    elemento: 'Água',
    qualidade: 'Cardinal',
    exaltação: 'Touro',
    queda: 'Escorpião',
    periodo: '~2.5 dias por signo',
    velocidade: '~13°/dia',
    descricaoBreve: 'Emoções, intuição, inconsciente',
  },
  mercurio: {
    nome: 'Mercúrio',
    simbolo: '☿',
    signoRegente: 'Gêmeos/Virgem',
    elemento: 'Ar',
    qualidade: 'Mutável',
    exaltação: 'Virgem',
    queda: 'Peixes',
    periodo: '~3 semanas por signo',
    velocidade: '~4°/dia',
    descricaoBreve: 'Comunicação, intelecção, comércio',
  },
  venus: {
    nome: 'Vênus',
    simbolo: '♀',
    signoRegente: 'Touro/Libra',
    elemento: 'Terra/Ar',
    qualidade: 'Fixo',
    exaltação: 'Peixes',
    queda: 'Virgem',
    periodo: '~3 semanas por signo',
    velocidade: '~1°/dia',
    descricaoBreve: 'Amor, beleza, valores',
  },
  marte: {
    nome: 'Marte',
    simbolo: '♂',
    signoRegente: 'Áries',
    elemento: 'Fogo',
    qualidade: 'Cardinal',
    exaltação: 'Capricórnio',
    queda: 'Câncer',
    periodo: '~2 meses por signo',
    velocidade: '~0.5°/dia',
    descricaoBreve: 'Energia, ação, desejo',
  },
  jupiter: {
    nome: 'Júpiter',
    simbolo: '♃',
    signoRegente: 'Sagitário',
    elemento: 'Fogo',
    qualidade: 'Mutável',
    exaltação: 'Câncer',
    queda: 'Capricórnio',
    periodo: '~1 ano por signo',
    velocidade: '~0.2°/dia',
    descricaoBreve: 'Expansão, sabedoria, abundância',
  },
  saturno: {
    nome: 'Saturno',
    simbolo: '♄',
    signoRegente: 'Capricórnio',
    elemento: 'Terra',
    qualidade: 'Cardinal',
    exaltação: 'Libra',
    queda: 'Áries',
    periodo: '~2.5 anos por signo',
    velocidade: '~0.1°/dia',
    descricaoBreve: 'Estrutura, limitação, tempo',
  },
  urano: {
    nome: 'Urano',
    simbolo: '♅',
    signoRegente: 'Aquário',
    elemento: 'Ar',
    qualidade: 'Fixo',
    exaltação: 'Escorpião',
    queda: 'Touro',
    periodo: '~7 anos por signo',
    velocidade: '~0.01°/dia',
    descricaoBreve: 'Revolução, inovação, libertação',
  },
  netuno: {
    nome: 'Netuno',
    simbolo: '♆',
    signoRegente: 'Peixes',
    elemento: 'Água',
    qualidade: 'Mutável',
    exaltação: 'Câncer',
    queda: 'Capricórnio',
    periodo: '~14 anos por signo',
    velocidade: '~0.01°/dia',
    descricaoBreve: 'Transcendência, intuição, ilusão',
  },
  plutao: {
    nome: 'Plutão',
    simbolo: '♇',
    signoRegente: 'Escorpião',
    elemento: 'Água',
    qualidade: 'Fixo',
    exaltação: 'Áries',
    queda: 'Balança',
    periodo: '~20 anos por signo',
    velocidade: '~0.01°/dia',
    descricaoBreve: 'Transformação, poder, regeneração',
  },
};

export const PLANETAS_LISTA = [
  'sol',
  'lua',
  'mercurio',
  'venus',
  'marte',
  'jupiter',
  'saturno',
  'urano',
  'netuno',
  'plutao',
] as const;

export type PlanetaKey = (typeof PLANETAS_LISTA)[number];
