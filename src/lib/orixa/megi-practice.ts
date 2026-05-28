/**
 * Megi Practice — Odu of knowledge, fire, and inner illumination
 */

export interface PracticeResult {
  orixa: string;
  sign: string;
  message: string;
  guidance: string[];
}

const ORIXAS = [
  'Oxumaré', 'Omolu', 'Oxalá', 'Nanã',
  'Iemanjá', 'Ogum', 'Oxóssi', 'Exu'
];

const SIGNS = [
  'Eji', 'Ota', 'Ika', 'Ogunda', 'Osi', 'Irosun',
  'Owonrin', 'Obara', 'Odi', 'Eji-Onile', 'Ikoyun', 'Ofun'
];

/**
 * Performs the Megi practice — a divination ritual
 * representing knowledge, inner fire, and the
 * illumination that reveals truth and purpose.
 */
export function performPractice(): PracticeResult {
  const orixaIndex = Math.floor(Math.random() * ORIXAS.length);
  const signIndex = Math.floor(Math.random() * SIGNS.length);

  const orixa = ORIXAS[orixaIndex];
  const sign = SIGNS[signIndex];

  return {
    orixa,
    sign,
    message: `${sign} — ${orixa} ignites the flame of understanding within.`,
    guidance: [
      'Seek knowledge with humility; wisdom requires an open mind.',
      'The fire within burns away illusion; let it illuminate, not consume.',
      'Share what you learn; knowledge multiplied grows, hoarded it dims.',
      'Trust the spark of insight; even small flames dispel deep darkness.',
      'Pursue truth with patience; revelation comes in its own season.'
    ]
  };
}