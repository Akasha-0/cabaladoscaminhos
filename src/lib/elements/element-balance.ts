/**
 * Element balance module
 * Provides balance calculation utilities for elemental analysis
 */

/**
 * Balance status levels
 */
export type BalanceStatus = 'excess' | 'deficient' | 'balanced';

/**
 * Element types
 */
export type Element = 'fogo' | 'terra' | 'ar' | 'agua';

/**
 * Element counts structure
 */
export interface ElementCounts {
  fogo: number;
  terra: number;
  ar: number;
  agua: number;
}

/**
 * Element balance result
 */
export interface BalanceResult {
  counts: ElementCounts;
  total: number;
  status: Record<Element, BalanceStatus>;
  dominant: Element | null;
  deficient: Element | null;
  isBalanced: boolean;
  score: number;
}

/**
 * Input data for balance calculation
 */
export interface BalanceInput {
  fogo?: number;
  terra?: number;
  ar?: number;
  agua?: number;
}

/**
 * Element weights for balance scoring
 */
const ELEMENT_WEIGHTS: Record<Element, number> = {
  fogo: 1,
  terra: 1,
  ar: 1,
  agua: 1,
};

/**
 * Balanced threshold (percentage)
 */
const BALANCED_THRESHOLD = 15;

/**
 * Calculate element balance
 * @param input - Element counts or percentages
 * @returns Balance calculation result
 */
export function calculateBalance(input: BalanceInput | ElementCounts): BalanceResult {
  const counts: ElementCounts = {
    fogo: input.fogo ?? 0,
    terra: input.terra ?? 0,
    ar: input.ar ?? 0,
    agua: input.agua ?? 0,
  };

  const total = counts.fogo + counts.terra + counts.ar + counts.agua;

  if (total === 0) {
    return {
      counts,
      total: 0,
      status: {
        fogo: 'balanced',
        terra: 'balanced',
        ar: 'balanced',
        agua: 'balanced',
      },
      dominant: null,
      deficient: null,
      isBalanced: true,
      score: 0,
    };
  }

  const ratios = {
    fogo: (counts.fogo / total) * 100,
    terra: (counts.terra / total) * 100,
    ar: (counts.ar / total) * 100,
    agua: (counts.agua / total) * 100,
  };

  const idealRatio = 100 / 4;

  const status: Record<Element, BalanceStatus> = {
    fogo: ratios.fogo > idealRatio + BALANCED_THRESHOLD ? 'excess' : 
          ratios.fogo < idealRatio - BALANCED_THRESHOLD ? 'deficient' : 'balanced',
    terra: ratios.terra > idealRatio + BALANCED_THRESHOLD ? 'excess' : 
           ratios.terra < idealRatio - BALANCED_THRESHOLD ? 'deficient' : 'balanced',
    ar: ratios.ar > idealRatio + BALANCED_THRESHOLD ? 'excess' : 
        ratios.ar < idealRatio - BALANCED_THRESHOLD ? 'deficient' : 'balanced',
    agua: ratios.agua > idealRatio + BALANCED_THRESHOLD ? 'excess' : 
          ratios.agua < idealRatio - BALANCED_THRESHOLD ? 'deficient' : 'balanced',
  };

  const elements: Element[] = ['fogo', 'terra', 'ar', 'agua'];
  let dominant: Element | null = null;
  let deficient: Element | null = null;
  let maxRatio = 0;
  let minRatio = 100;

  elements.forEach((el) => {
    if (ratios[el] > maxRatio) {
      maxRatio = ratios[el];
      dominant = el;
    }
    if (ratios[el] < minRatio) {
      minRatio = ratios[el];
      deficient = el;
    }
  });

  const deviations = elements.map((el) => {
    const deviation = Math.abs(ratios[el] - idealRatio);
    return deviation * ELEMENT_WEIGHTS[el];
  });
  const avgDeviation = deviations.reduce((a, b) => a + b, 0) / elements.length;
  const score = Math.max(0, 100 - avgDeviation);

  const isBalanced = Object.values(status).every((s) => s === 'balanced');

  return {
    counts,
    total,
    status,
    dominant,
    deficient,
    isBalanced,
    score,
  };
}