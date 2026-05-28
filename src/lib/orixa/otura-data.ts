/**
 * Otura Orixá Data
 * Orixá associated with the Odu Otura - Divine Alignment, Peace, and Faith
 */

export interface OturaOrixaData {
  id: string;
  name: string;
  nameYoruba: string;
  namePt: string;
  nameEn: string;
  odu: string;
  description: string;
  attributes: string[];
  offerings: string[];
  sacredFrequency: string;
  colors: string[];
  dayOfWeek: string;
  affirmation: string;
}

export const oturaOrixaData: OturaOrixaData = {
  id: 'orixa-otura',
  name: 'Otura',
  nameYoruba: 'Òtúrá',
  namePt: 'Otura - O Alinhamento Divino',
  nameEn: 'Otura - Divine Alignment',
  odu: 'Otura (Odu 12)',
  description:
    'Otura é o Orixá do Alinhamento Divino, da paz interior e da fé segura. Representa o estado de descanso na vontade divina sem ansiedade, onde a fé não é um salto mas uma confiança estabelecida. Otura é a recompensa para aqueles que caminharam pela dificuldade com integridade, que seguiram as prescrições recebidas, que não abandonaram o caminho mesmo quando parecia impossível.',
  attributes: [
    'Paz interior',
    'Fé estabelecida',
    'Confiança divina',
    'Surrender ao sagrado',
    'Calma espiritual',
    'Aceitação',
    'Sabedoria do coração',
    'Discernimento',
  ],
  offerings: ['Água cristalina', 'Velas brancas', 'Flor de laranjeira', 'Mel', 'Coco ralado', 'Alecrim'],
  sacredFrequency: '432 Hz (Harmonização)',
  colors: ['#9932CC', '#FFFFFF', '#F5F5F5'],
  dayOfWeek: 'Quarta-feira',
  affirmation: 'Eu descanso na vontade divina. Minha fé é confiança estabelecida. Tudo serve ao meu crescimento espiritual.',
};

export function getData(): OturaOrixaData {
  return oturaOrixaData;
}

export default getData;