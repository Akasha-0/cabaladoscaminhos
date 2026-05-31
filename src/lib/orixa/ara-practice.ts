 
 

/**
 * Ara Practice Module
 * Spiritual practice attunement for Ara, Orixá of patience, silence, and meditative stillness
 */

export interface AraPractice {
  name: string;
  type: string;
  description: string;
  frequency: string;
  offerings: string[];
  prohibited: string[];
  ceremonies: string[];
}

export const ORIXAS = {
  ARA: 'Ara',
} as const;

export const araPractice: AraPractice = {
  name: 'Ara',
  type: 'Orixá da paciência',
  description: 'Senhor do silêncio interior, da paciência sagrada e da contemplação meditativa. Ara ensina que na quietude da mente encontramos a verdadeira sabedoria. É o orixá que governa o domínio de si mesmo e a serenidade diante das tempestades da vida.',
  frequency: 'Dias de lua cheia e momentos de necessidade de calma',
  offerings: [
    'Água cristalina',
    'Flores brancas',
    'Incenso de almíscar',
    'Coco fresco',
    'Canela',
    'Azeite de dendê suave',
    'Pão fresco',
    'Velas brancas',
  ],
  prohibited: [
    'Apressar resultados sem esforço adequado',
    'Falar demais em momentos de silêncio recomendados',
    'Perturbar a paz de outros',
    'Ignorar a necessidade de descanso contemplativo',
  ],
  ceremonies: [
    'Meditação sagrada em silêncio',
    'Oferecimento de água fresca ao amanhecer',
    'Ritual de respiração consciente',
    'Lavagem das mãos antes da prática',
  ],
};

/**
 * Performs Ara meditative practice
 */
export function performPractice(): AraPractice {
  return { ...araPractice };
}
