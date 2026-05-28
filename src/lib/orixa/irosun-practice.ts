/**
 * Irosun Practice — Orixá divination and spiritual grounding ritual
 */

export interface PracticeResult {
  orixa: string;
  sign: string;
  message: string;
}

const ORIXAS = [
  'Oxum', 'Ogum', 'Iemanjá', 'Xangô', 'Oxalá', 'Ibeji',
  'Nanã', 'Oxumaré', 'Logun-Edé', 'Omulu', 'Obá', 'Oxóssi'
];

const SIGNS = [
  'Ara', 'Eyo', 'Ile', 'Oko', 'Oru', 'Ibin',
  'Eja', 'Osi', 'Ale', 'Ori', 'Owo', 'Inu'
];

/**
 * Performs the Irosun practice — a divination ritual
 * that consults the orixás for guidance and spiritual alignment.
 */
export function performPractice(): PracticeResult {
  const orixaIndex = Math.floor(Math.random() * ORIXAS.length);
  const signIndex = Math.floor(Math.random() * SIGNS.length);

  const orixa = ORIXAS[orixaIndex];
  const sign = SIGNS[signIndex];

  return {
    orixa,
    sign,
    message: `${sign} — ${orixa} watches over your path.`
  };
}