// @ts-nocheck

/**
 * Odi Data Module
 * Comprehensive spiritual data for Odi (Odu 7)
 */

export interface OdiData {
  nome: string;
  nomePortugues: string;
  numero: number;
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
  nomePortugues: 'O Poço Profundo',
  numero: 7,
  caminho: '7',
  elementos: ['Terra', 'Água'],
  meses: ['Outubro'],
  dias: ['Segunda-feira'],
  orixasRelacionados: ['Omolu', 'Oxumaré', 'Exu'],
花草: ['Pau-brasil', 'Babosa'],
  ebós: ['Pipoca para Omolu', 'Banhos de lama ou argila', 'Defumações pesadas com resinas'],
  quizilas: ['Dormir no escuro absoluto se estiver com medo', 'Comer carne de caça', 'Persistir no erro'],
  mensagens: [
    'A teimosia pode ser sua maior aliada ou sua pior inimiga',
    'Olhe para dentro antes de olhar para fora',
    'O renascimento está próximo',
    'Evite cavar feridas passadas',
    'A escuridão guarda segredos preciosos'
  ],
  significado: {
    positivo: 'Teimosia positiva, renascimento, sabedoria oculta, resiliência',
    negativo: 'Teimosia negativa, persistência no erro, medo do escuro'
  },
  qualidade: 'Profundo e transformador',
  regencia: 'Omolu, Oxumaré, Exu',
  cores: ['Preto', 'Marrom', 'Verde escuro'],
  pedras: ['Ônix', 'Obsidiana', 'Turmalina negra'],
  alimentos: ['Pipoca', 'Raízes', 'Terras medicinais'],
  numSagrado: [7, 14, 21],
  planeta: 'Saturno',
  chakra: '1º - Raiz',
  sefirot: ['Yesod', 'Malkuth'],
  tarot: ['O Mundo', 'A Lua'],
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