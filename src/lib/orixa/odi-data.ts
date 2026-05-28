// @ts-nocheck

/**
 * Odi Data Module
 * Comprehensive spiritual data for Odi
 */

export interface OdiData {
  nome: string;
  nomePortugues: string;
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
    positivo: string;
    negativo: string;
  };
  qualidade: string;
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
}

export const ODI_DATA: OdiData = {
  nome: 'Odi',
  nomePortugues: 'Destino',
  categoria: 'Orixá',
  caminho: '8',
  elementos: ['Água', 'Terra'],
  meses: ['Janeiro', 'Maio'],
  dias: ['Segunda-feira'],
  orixasRelacionados: ['Orunmila', 'Oxum', 'Iemanjá'],
花草: ['Alfazema', 'Violeta'],
  ebós: ['Água de cheiro', 'Fumo branco', 'Milho'],
  quizilas: ['Não mentir', 'Não enganar os outros'],
  mensagens: [
    'O destino está em suas mãos',
    'Cada escolha molda seu caminho',
    'A verdade liberta e protege',
    'Siga sua intuição com sabedoria',
    'O destino favorece os persistentes',
  ],
  significado: {
    positivo: 'Destino, sorte, intuição, sabedoria, proteção',
    negativo: 'Engano, traição, má sorte, fracasso',
  },
  qualidade: 'Misterioso e profundo',
  regencia: 'Destino e intuição',
  cores: ['Roxo', 'Violeta', 'Branco'],
  pedras: ['Ametista', 'Turmalina negra', 'Quartzo'],
  alimentos: ['Milho', 'Fumo branco', 'Água de cheiro'],
  numSagrado: [8, 17, 26],
  planeta: 'Netuno',
  chakra: '6º - Ajna',
  sefirot: ['Binah', 'Hod'],
  tarot: ['O Eremita', 'A Roda da Fortuna'],
  direcao: 'Norte',
时辰: 'Meia-noite',
};

export function getData(): OdiData {
  return ODI_DATA;
}

export function getOdiByType(type: keyof OdiData): OdiData[keyof OdiData] | OdiData {
  if (type === 'all') {
    return ODI_DATA;
  }
  return ODI_DATA[type] as OdiData[keyof OdiData];
}

export function getMensagens(): string[] {
  return ODI_DATA.mensagens;
}

export function getQuizilas(): string[] {
  return ODI_DATA.quizilas;
}

export function getEbós(): string[] {
  return ODI_DATA.ebós;
}

export function getCores(): string[] {
  return ODI_DATA.cores;
}

export function getPedras(): string[] {
  return ODI_DATA.pedras;
}

export function getAlimentos(): string[] {
  return ODI_DATA.alimentos;
}

export function getNumSagrado(): number[] {
  return ODI_DATA.numSagrado;
}
