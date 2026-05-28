/**
 * Oyeku Meji Practice — Odu of wealth, destiny, and sacred duality
 */

export interface PracticeResult {
  orixa: string;
  odu: string;
  message: string;
  guidance: string[];
}

const ORIXAS = [
  'Oyeku', 'Olodumare', 'Orunmila', 'Ogun',
  'Oxossi', 'Obatala', 'Yemoja', 'Shango'
];

const ODUS = [
  'Ogbe', 'Oyeku', 'Iwori', 'Odi', 'Irosun',
  'Ogunda', 'Osa', 'Iworin', 'Obara', 'Okanle'
];

/**
 * Performs the Oyeku Meji practice — a divination ritual
 * representing the sacred union of wealth and duality,
 * where hidden treasures are revealed through balanced transformation.
 */
export function performPractice(): PracticeResult {
  const orixaIndex = Math.floor(Math.random() * ORIXAS.length);
  const oduIndex = Math.floor(Math.random() * ODUS.length);

  const orixa = ORIXAS[orixaIndex];
  const odu = ODUS[oduIndex];

  return {
    orixa,
    odu,
    message: `${orixa} reveals through ${odu} that true wealth is balance.`,
    guidance: [
      'Seek abundance without attachment — riches flow to those who work with purpose.',
      'Honor the duality within; shadow and light together form the complete self.',
      'Guard your treasures wisely, but share your wisdom freely.',
      'Destiny is not fixed — it is shaped through sacred action and humility.',
      'The hidden becomes manifest when you align with divine will.'
    ]
  };
}