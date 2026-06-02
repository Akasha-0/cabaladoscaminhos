// @ts-nocheck

/**
 * Iote Data Module
 * Spiritual data for Iote (Iyáwó/Terceiro Dia)
 * Odu associated with births, children, and motherhood under Iemanjá
 */

export interface IoteData {
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
    espiritual: string;
    material: string;
    emocional: string;
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

const IOTE_DATA: IoteData = {
  nome: 'Iote',
  nomePortugues: 'Iyáwó ou Terceiro Dia',
  categoria: 'Odu Menor',
  caminho: 'Caminho da Fertilidade e Maternidade',
  elementos: ['Água'],
  meses: ['janeiro', 'fevereiro', 'outubro'],
  dias: ['segunda-feira', 'terça-feira'],
  orixasRelacionados: ['Iemanjá', 'Oxum', 'Nanã'],
  flores: ['narciso', 'flor de laranjeira', 'gérbera branca'],
  ebós: ['água de cheiro', 'farinha de mandioca', 'coco ralado'],
  quizilas: ['não comer frutos do mar', 'não praticar magia', 'não usar vermelho'],
  mensagens: [
    'A fertilidade é um dom sagrado que deve ser honrado',
    'Mães são pontes entre o céu e a terra',
    'O terceiro dia traz bênçãos para novos inícios',
  ],
  significado: {
    espiritual: 'Odu da maternidade, proteção infantil e bênçãos de fertilidade',
    material: 'associado a partos, crianças e proteção familiar',
    emocional: 'acolhimento, ternura e cuidado maternal',
  },
  qualidade: 'Maternal e Protetora',
  regencia: 'Iemanjá',
  cores: ['azul claro', 'branco', 'prata'],
  pedras: ['quartzo rosa', 'madrepérola', 'pedra da lua'],
  alimentos: ['frutas tropicais', 'coco fresco', 'pipoca'],
  numSagrado: [3, 9, 27],
  planeta: 'Lua',
  chakra: '4º Chakra (Coração)',
  sefirot: ['Chesed', 'Gevurah'],
  tarot: ['The Moon', 'The Star'],
  direcao: 'Leste',
  periodo: 'Madrugada e noite',
};

export function getData(): IoteData {
  return IOTE_DATA;
}

function getMensagens(): string[] {
  return IOTE_DATA.mensagens;
}

function getQuizilas(): string[] {
  return IOTE_DATA.quizilas;
}

function getEbós(): string[] {
  return IOTE_DATA.ebós;
}

function getCores(): string[] {
  return IOTE_DATA.cores;
}

function getPedras(): string[] {
  return IOTE_DATA.pedras;
}