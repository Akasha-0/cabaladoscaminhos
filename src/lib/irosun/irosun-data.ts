/**
 * Irosun (Odú 4) - Dados do sistema Cabala dos Caminhos
 * O aviso, o sangue que corre nas veias, a visão espiritual. Olhar para o futuro.
 */

export interface IrosunData {
  odun: number;
  nome: string;
  significado: string;
  elementos: string[];
  orixas: string[];
  quizilas: string[];
  preceptos: string[];
  tipoEbo: string;
  chakra: string[];
  planeta: string[];
  tarot: string;
  sephirah: string;
}

export const irosunData: IrosunData = {
  odun: 4,
  nome: 'Irosun',
  significado: 'O aviso, o sangue que corre nas veias, a visão espiritual. Olhar para o futuro.',
  elementos: ['Fogo', 'Terra'],
  orixas: ['Iemanjá', 'Oxóssi', 'Egum'],
  quizilas: [
    'Olhar para buracos vazios',
    'Usar roupas muito vermelhas em momentos de crise',
    'Mentira'
  ],
  preceptos: [
    'Desenvolver a intuição',
    'Não ignorar avisos e sonhos',
    'Cuidar da saúde do sangue e dos olhos'
  ],
  tipoEbo: 'Ebó de Proteção',
  chakra: ['3º Plexo Solar'],
  planeta: ['Sol', 'Mercúrio'],
  tarot: 'O Imperador',
  sephirah: 'Chesed para Geburah (Equilíbrio da Lei)'
};

export function getData(): IrosunData {
  return irosunData;
}