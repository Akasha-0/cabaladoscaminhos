/**
 * Oyeku Practice — Odu of Mystery, endings, and spiritual transformation
 */

export interface PracticeResult {
  orixa: string;
  sign: string;
  message: string;
  guidance: string[];
}

const ORIXAS = [
  'Omolu', 'Oxumaré', 'Iemanjá', 'Oxalá',
  'Nanã', 'Oxóssi', 'Ogum', 'Exu'
];

const SIGNS = [
  'Eji', 'Ota', 'Ika', 'Ogunda', 'Osi', 'Irosun',
  'Owonrin', 'Obara', 'Odi', 'Eji-Onile', 'Ikoyun', 'Ofun'
];

/**
 * Performs the Oyeku practice — a divination ritual
 * representing endings, rebirth, and the hidden forces
 * that shape destiny from the shadows.
 */
export function performPractice(): PracticeResult {
  const orixaIndex = Math.floor(Math.random() * ORIXAS.length);
  const signIndex = Math.floor(Math.random() * SIGNS.length);

  const orixa = ORIXAS[orixaIndex];
  const sign = SIGNS[signIndex];

  return {
    orixa,
    sign,
    message: `${sign} — ${orixa} governs the mysteries of transformation.`,
    guidance: [
      'Honor what must end; do not cling to what has already left.',
      'Descend inward — the answers you seek are within, not without.',
      'Practice silence; in stillness, truth surfaces louder than words.',
      'Trust the unseen; what is hidden protects as much as it reveals.',
      'Transformation requires surrender; fight less, release more.'
    ]
  };
}