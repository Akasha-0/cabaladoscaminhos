/**
 * Numerology compatibility scores
 * Calculates match percentages between two numerology charts
 */

export interface CompatibilityResult {
  score: number;         // 0-100
  percentage: number;   // 0-100
  category: 'low' | 'medium' | 'high' | 'perfect';
  breakdown: {
    lifePath: number;
    expression: number;
    soulUrge: number;
    personality: number;
  };
}

interface NumerologyNumbers {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
}

/**
 * Calculate compatibility score between two numerology charts
 * @param chartA - First person's numerology numbers
 * @param chartB - Second person's numerology numbers
 * @returns CompatibilityResult with score, percentage, category, and breakdown
 */
export function calculateScore(chartA: NumerologyNumbers, chartB: NumerologyNumbers): CompatibilityResult {
  const breakdown = {
    lifePath: calculateNumberCompatibility(chartA.lifePath, chartB.lifePath),
    expression: calculateNumberCompatibility(chartA.expression, chartB.expression),
    soulUrge: calculateNumberCompatibility(chartA.soulUrge, chartB.soulUrge),
    personality: calculateNumberCompatibility(chartA.personality, chartB.personality),
  };

  // Weighted average: life path is most important
  const score = Math.round(
    breakdown.lifePath * 0.35 +
    breakdown.expression * 0.30 +
    breakdown.soulUrge * 0.20 +
    breakdown.personality * 0.15
  );

  return {
    score,
    percentage: score,
    category: getCategory(score),
    breakdown,
  };
}

function calculateNumberCompatibility(numA: number, numB: number): number {
  // Perfect match
  if (numA === numB) return 100;

  // Complementary numbers (Master numbers considered)
  const masterNumbers = [11, 22, 33];
  const complementaryMap: Record<number, number[]> = {
    1: [1, 8, 9],
    2: [2, 4, 6],
    3: [3, 6, 9],
    4: [4, 2, 8],
    5: [5, 7],
    6: [6, 2, 3],
    7: [5, 7],
    8: [1, 4, 8],
    9: [1, 3, 9],
    11: [11, 22, 33],
    22: [11, 22, 33],
    33: [11, 22, 33],
  };

  const reducedA = reduceNumber(numA);
  const reducedB = reduceNumber(numB);

  // Check for complementary numbers
  const compsA = complementaryMap[reducedA] || [reducedA];
  const compsB = complementaryMap[reducedB] || [reducedB];
  
  if (compsA.includes(reducedB) || compsB.includes(reducedA)) {
    return 85;
  }

  // Pythagorean compatibility table
  const difference = Math.abs(reducedA - reducedB);
  
  switch (difference) {
    case 0: return 100;
    case 1: return 75;
    case 2: return 60;
    case 3: return 45;
    case 4: return 35;
    case 5: return 25;
    default: return 15;
  }
}

function reduceNumber(num: number): number {
  if (num <= 9) return num;
  return num % 9 || 9;
}

function getCategory(score: number): 'low' | 'medium' | 'high' | 'perfect' {
  if (score >= 90) return 'perfect';
  if (score >= 70) return 'high';
  if (score >= 45) return 'medium';
  return 'low';
}

/**
 * Get match percentage string
 * @param score - Compatibility score (0-100)
 * @returns Formatted percentage string
 */
export function getMatchPercentage(score: number): string {
  return `${Math.min(100, Math.max(0, score))}%`;
}

/**
 * Get compatibility description
 * @param result - CompatibilityResult
 * @returns Human-readable description
 */
export function getCompatibilityLabel(result: CompatibilityResult): string {
  switch (result.category) {
    case 'perfect':
      return 'Soulmate connection';
    case 'high':
      return 'Strong harmony';
    case 'medium':
      return 'Moderate compatibility';
    case 'low':
      return 'Growth opportunity';
  }
}