// @ts-nocheck
// SKIP_LINT

/**
 * Okanle Practice Module
 * Spiritual practice for Okanle orixá
 */

export interface OkanlePractice {
  name: string;
  type: string;
  description: string;
  frequency: string;
  offerings: string[];
  prohibited: string[];
  ceremonies: string[];
}

export const ORIXAS = {
  OKANLE: 'Okanle',
} as const;

export const okanlePractice: OkanlePractice = {
  name: 'Okanle',
  type: 'Orixá do Caminho e das Passadas',
  description: 'Okanle é o orixá que caminha ao lado do practitioner, abençoando cada passo da jornada espiritual. Conhecido como o guide das estradas e protector dos Traveler, conduz aqueles que buscam sua orientação pelos caminhos corretos da vida.',
  frequency: 'Segundas e sextas-feiras',
  offerings: [
    'Pão',
    'Farinha de mandioca',
    'Água de coco',
    'Velhas moedas',
    'Sapatos velhos',
    'Pérolas',
    'Algodão',
    ' lenços brancos',
  ],
  prohibited: [
    'Parar sem propósito em encruzilhadas',
    'Ignorar os sinais do caminho',
    'Viajar sem gratidão',
    'Usar calçados rasgados em rituais',
  ],
  ceremonies: [
    'Passos de Okanle',
    'Saudação ao viajante',
    'Oferecimento de chemin',
    'Proteção da estrada',
  ],
};

/**
 * Performs Okanle practice ritual
 */
export function performPractice(): OkanlePractice {
  return { ...okanlePractice };
}
