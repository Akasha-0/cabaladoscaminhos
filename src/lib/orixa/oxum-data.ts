// @ts-nocheck

/**
 * Oxum Data Module
 * Comprehensive spiritual data for Oxum
 */

export interface OxumData {
  nome: string;
  nomePortugues: string;
  categoria: string;
  caminho: string;
  elementos: string[];
  meses: string[];
  dias: string[];
  orixasRelacionados: string[];
  flores: string[];
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
  periodo: string;
}

const OXUM_DATA: OxumData = {
  nome: 'Oxum',
  nomePortugues: 'Abundância',
  categoria: 'Orixá Feminino',
  caminho: '7',
  elementos: ['Água'],
  meses: ['Outubro', 'Fevereiro'],
  dias: ['Sexta-feira'],
  orixasRelacionados: ['Iemanjá', 'Nanã', 'Orunmila'],
  flores: ['Rosa', 'Cravo branco'],
  ebós: ['Água de flor', 'Perfume de rosa', 'Fumo branco'],
  quizilas: ['Não comer carne vermelha', 'Não consumir bebidas alcoólicas'],
  mensagens: [
    'A abundância é seu direito divino',
    'Você merece prosperidade em todas as áreas',
    'Deixe fluir a energia da riqueza',
    'Honre sua essência sagrada',
    'A beleza interior ilumina o caminho',
  ],
  significado: {
    positivo: 'Prosperidade, amor, fertilidade, beleza, abundância',
    negativo: 'Inveja, cobiça, desperdício, vaidade excessiva',
  },
  qualidade: 'Doce e acolhedora',
  regencia: 'Riqueza e amor',
  cores: ['Rosa', 'Dourado', 'Rosa-ouro'],
  pedras: ['Quartzo rosa', 'Água marinha', 'Coral'],
  alimentos: ['Mel', 'Frutas doces', 'Amendoim doce'],
  numSagrado: [2, 7, 15, 22],
  planeta: 'Vénus',
  chakra: '4º - Cardíaco',
  sefirot: ['Chesed', 'Hod'],
  tarot: ['A Imperadora', 'O Mundo'],
  direcao: 'Oeste',
  periodo: 'Nascente',
};

export function getData(): OxumData {
  return OXUM_DATA;
}

function getOxumByType(type: keyof OxumData): OxumData[keyof OxumData] | OxumData {
  if (type === 'all') {
    return OXUM_DATA;
  }
  return OXUM_DATA[type] as OxumData[keyof OxumData];
}

function getMensagens(): string[] {
  return OXUM_DATA.mensagens;
}

function getQuizilas(): string[] {
  return OXUM_DATA.quizilas;
}

function getEbós(): string[] {
  return OXUM_DATA.ebós;
}

function getCores(): string[] {
  return OXUM_DATA.cores;
}

function getPedras(): string[] {
  return OXUM_DATA.pedras;
}

function getAlimentos(): string[] {
  return OXUM_DATA.alimentos;
}

function getNumSagrado(): number[] {
  return OXUM_DATA.numSagrado;
}