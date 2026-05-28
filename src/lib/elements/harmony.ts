/**
 * Element Harmony — Kabbalistic element compatibility system
 *
 * Each element pair has a resonance value:
 *   > 0  = harmonious
 *   = 0  = neutral
 *   < 0  = dissonant
 *
 * Elements: Water (0), Fire (1), Air (2), Earth (3)
 */

export type Element = 'water' | 'fire' | 'air' | 'earth';

const ELEMENT_INDEX: Record<Element, number> = {
  water: 0,
  fire: 1,
  air: 2,
  earth: 3,
};

/** Resonance matrix — rows = recipient, cols = contributor */
const HARMONY_MATRIX: number[][] = [
  /*          water fire air earth */
  /* water */ [1.0, -1.0, 0.5, 0.3],
  /* fire   */ [-1.0, 1.0, -0.5, -0.3],
  /* air    */ [0.5, -0.5, 1.0, 0.4],
  /* earth  */ [0.3, -0.3, 0.4, 1.0],
];

/** Human-readable labels for each element pair quality */
export type HarmonyQuality = 'resonant' | 'neutral' | 'dissonant';

export interface HarmonyResult {
  score: number;
  quality: HarmonyQuality;
  dominant: Element;
  supporting: Element;
}

/**
 * Calculate the harmony score between two elements.
 * Returns a value in [-1, 1] where:
 *   > 0.15  → resonant
 *   < -0.15 → dissonant
 *   else    → neutral
 */
export function calculateHarmony(a: Element, b: Element): HarmonyResult {
  const dominant = ELEMENT_INDEX[a] >= ELEMENT_INDEX[b] ? a : b;
  const supporting = dominant === a ? b : a;

  const score = HARMONY_MATRIX[ELEMENT_INDEX[dominant]]?.[ELEMENT_INDEX[supporting]] ?? 0;

  let quality: HarmonyQuality;
  if (score > 0.15) {
    quality = 'resonant';
  } else if (score < -0.15) {
    quality = 'dissonant';
  } else {
    quality = 'neutral';
  }

  return { score, quality, dominant, supporting };
}

/** All valid element pairs with their pre-computed results */
export const ELEMENT_HARMONIES: HarmonyResult[] = [
  calculateHarmony('water', 'fire'),
  calculateHarmony('water', 'air'),
  calculateHarmony('water', 'earth'),
  calculateHarmony('fire', 'air'),
  calculateHarmony('fire', 'earth'),
  calculateHarmony('air', 'earth'),
];
