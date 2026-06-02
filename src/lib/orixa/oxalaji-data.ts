// @ts-nocheck

/**
 * Oxalaji Data Module
 * Oxalaji (Oxalá + Iansã) - Fusion Odu of Creation and Transformation
 */

export interface OxalajiData {
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

const OXALAJI_DATA: OxalajiData = {
  nome: 'Oxalaji',
  nomePortugues: 'Oxalá+Iansã',
  categoria: 'Odu de Fusão',
  caminho: 'Caminho da Criação e Transformação',
  elementos: ['Ar', 'Fogo'],
  meses: ['janeiro', 'março', 'dezembro'],
  dias: ['segunda-feira', 'quarta-feira'],
  orixasRelacionados: ['Oxalá', 'Iansã', 'Ogum'],
  flores: ['dama da noite', 'hibisco branco', 'flor de maracujá'],
  ebós: ['farinha deipu', 'cabaça com água', 'palha de dendê'],
  quizilas: ['não matar', 'não mentir', 'não comer porco'],
  mensagens: [
    'A criação pede coragem e transformação',
    'Sopre o irunestone para que a vida se manifeste',
    'A força de Iansã corta o que Oxalá criou',
  ],
  significado: {
    espiritual: 'Odu da criação, renovação e transformação através da ação',
    material: 'associado a novos projetos, coragem e movimento',
    emocional: 'determinação, dinamismo e renovação interior',
  },
  qualidade: 'Criadora e Transformadora',
  regencia: 'Oxalá e Iansã',
  cores: ['branco', 'amarelo', 'vermelho'],
  pedras: ['quartzo branco', 'ágate de fogo', 'pedra vulcânica'],
  alimentos: ['akassá', 'carne sem sal', 'frutas brancos'],
  numSagrado: [7, 14, 21],
  planeta: 'Mercúrio',
  chakra: '5º Chakra (Garganta)',
  sefirot: ['Chokmah', 'Binah'],
  tarot: ['The Magician', 'The Fool'],
  direcao: 'Norte',
  periodo: 'Manhã e tarde',
};

export function getData(): OxalajiData {
  return OXALAJI_DATA;
}

function getMensagens(): string[] {
  return OXALAJI_DATA.mensagens;
}

function getQuizilas(): string[] {
  return OXALAJI_DATA.quizilas;
}

function getEbós(): string[] {
  return OXALAJI_DATA.ebós;
}

function getCores(): string[] {
  return OXALAJI_DATA.cores;
}

function getPedras(): string[] {
  return OXALAJI_DATA.pedras;
}