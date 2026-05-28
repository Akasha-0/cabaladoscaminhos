// @ts-nocheck
// Nada data for inner sound practice

export interface NadaData {
  id: string;
  name: string;
  frequency: number;
  chandra: string;
  bija: string;
  solfeggio: number;
  element: string;
  chakra: string;
  direction: string;
  quality: string;
  function: string;
}

export const NADA_DATASET: NadaData[] = [
  {
    id: 'nada-001',
    name: 'Anahata',
    frequency: 136.1,
    chandra: ' Я ',
    bija: 'YAM',
    solfeggio: 639,
    element: 'Ar',
    chakra: '4º Cardíaco',
    direction: 'Sul',
    quality: 'Harmonia',
    function: 'Abre o centro do coração, dissolvendo bloqueios emocionais e conectando à vibrational universal.',
  },
  {
    id: 'nada-002',
    name: 'Manipura',
    frequency: 144.0,
    chandra: ' ड़ ',
    bija: 'RAM',
    solfeggio: 528,
    element: 'Fogo',
    chakra: '3º Plexo Solar',
    direction: 'Oeste',
    quality: 'Transformação',
    function: 'Ativa a força de vontade, quebra medos e manifesta a luz interior do proposito.',
  },
  {
    id: 'nada-003',
    name: 'Muladhara',
    frequency: 72.0,
    chandra: ' लं ',
    bija: 'LAM',
    solfeggio: 396,
    element: 'Terra',
    chakra: '1º Básico',
    direction: 'Norte',
    quality: 'Ancoramento',
    function: 'Dissolve medos de sobrevivência, ancora a consciência na materia e firma a intenção.',
  },
  {
    id: 'nada-004',
    name: 'Svadhisthana',
    frequency: 96.0,
    chandra: ' वं ',
    bija: 'VAM',
    solfeggio: 417,
    element: 'Água',
    chakra: '2º Sacro',
    direction: 'Oeste',
    quality: 'Fluidez',
    function: 'Transmuta traumas do passado, libera a criatividade adormecida e restaura a fluidez vital.',
  },
  {
    id: 'nada-005',
    name: 'Vishuddha',
    frequency: 108.0,
    chandra: ' हं ',
    bija: 'HAM',
    solfeggio: 741,
    element: 'Ar',
    chakra: '5º Laríngeo',
    direction: 'Leste',
    quality: 'Expressão',
    function: 'Purifica a palavra falada, abre o canal da verdade e ativa o poder do som sagrado.',
  },
  {
    id: 'nada-006',
    name: 'Ajna',
    frequency: 120.0,
    chandra: ' ओं ',
    bija: 'OM',
    solfeggio: 852,
    element: 'Éter',
    chakra: '6º Frontal',
    direction: 'Leste',
    quality: 'Visão',
    function: 'Desperta a intuição profunda, dissolve ilusões e abre o terceiro olho à visão direta.',
  },
  {
    id: 'nada-007',
    name: 'Sahasrara',
    frequency: 144.0,
    chandra: ' ऋ ',
    bija: 'AUM',
    solfeggio: 963,
    element: 'Quintessência',
    chakra: '7º Coronário',
    direction: 'Centro',
    quality: 'Unicidade',
    function: 'Conecta diretamente à Fonte, dissolve o ego limitado e restaura a consciência una.',
  },
];

export function getData(): NadaData[] {
  return [...NADA_DATASET];
}
