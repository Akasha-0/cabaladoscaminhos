// @ts-nocheck

/**
 * Odara Data Module
 * Spiritual data for Odara - Harmony and Beauty Orixá
 */

export interface OdaraData {
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
  herbs: string[];
  harmonyElements: string[];
  guidance: string;
  numSagrado: number[];
  planeta: string;
  chakra: string;
  sefirot: string[];
  tarot: string[];
  direcao: string;
  periodo: string;
}

export const ODARA_DATA: OdaraData = {
  nome: 'Odara',
  nomePortugues: 'O Dara - O Belo',
  categoria: 'Odu de Harmonia',
  caminho: 'Caminho da Beleza e Equilíbrio',
  elementos: ['Água', 'Terra'],
  meses: ['maio', 'junho', 'setembro'],
  dias: ['sexta-feira', 'domingo'],
  orixasRelacionados: ['Oxum', 'Iemanjá', 'Oxalá'],
  flores: ['rosa', 'gardênia', 'flor de lotus'],
  ebós: ['água de cheiro', 'pétalas de rosa', 'perfume floral'],
  quizilas: ['não usar violência', 'não ser vaidoso de forma egoísta', 'não desrespeitar a natureza'],
  mensagens: [
    'A harmonia é a base de toda existência',
    'A verdadeira beleza vem do equilíbrio interior',
    'Cada um é reflexo da perfeição divina',
  ],
  significado: {
    espiritual: 'Odu da harmonia, beleza e equilíbrio entre opostos',
    material: 'associado a relacionamentos, arte e bem-estar',
    emocional: 'paz interior, aceitação e autocuidado',
  },
  qualidade: 'Harmonizadora e Estética',
  regencia: 'Oxum e Iemanjá',
  cores: ['dourado', 'rosa', 'azul claro'],
  pedras: ['quartzo rosa', 'turquesa', 'pedra da lua'],
  alimentos: ['doces', 'frutas tropicais', 'mel'],
  herbs: ['lavanda', 'camomila', 'rosa mosqueta'],
  harmonyElements: ['equilíbrio', 'beleza', 'paz', 'harmonia', 'arte'],
  guidance: 'Odara ensina que a harmonia verdadeira vem do equilíbrio entre dar e receber, entre ação e contemplação.',
  numSagrado: [6, 12, 24],
  planeta: 'Vênus',
  chakra: '4º Chakra (Coração)',
  sefirot: ['Tiferet', 'Chesed'],
  tarot: ['The Empress', 'The Lovers'],
  direcao: 'Sul',
  periodo: 'Entardecer',
};

export function getData(): OdaraData {
  return ODARA_DATA;
}

export function getMensagens(): string[] {
  return ODARA_DATA.mensagens;
}

export function getQuizilas(): string[] {
  return ODARA_DATA.quizilas;
}

export function getEbós(): string[] {
  return ODARA_DATA.ebós;
}

export function getCores(): string[] {
  return ODARA_DATA.cores;
}

export function getPedras(): string[] {
  return ODARA_DATA.pedras;
}

export function getHarmonyElements(): string[] {
  return ODARA_DATA.harmonyElements;
}