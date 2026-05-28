// @ts-nocheck
// Harmony calculation - spiritual resonance between entities

/**
 * Represents the vibrational frequency between two spiritual entities.
 * Higher scores indicate stronger resonance and compatibility.
 */
export interface HarmonyInput {
  entityA: string;
  entityB: string;
}

export interface HarmonyResult {
  score: number;
  level: HarmonyLevel;
  aspects: HarmonyAspect[];
  interpretation: string;
}

export type HarmonyLevel = 'perfect' | 'high' | 'moderate' | 'low';

export interface HarmonyAspect {
  name: string;
  score: number;
  contribution: number;
}

/**
 * Calculate the harmonic resonance between two entities.
 * Based on vibrational frequency matching and sacred numeric principles.
 */
export function calculate(input: HarmonyInput | string): HarmonyResult {
  const entityA = typeof input === 'string' ? input : input.entityA;
  const entityB = typeof input === 'string' ? '' : input.entityB;

  if (!entityA || !entityB) {
    return {
      score: 0,
      level: 'low',
      aspects: [],
      interpretation: 'Insufficient data for harmony calculation',
    };
  }

  const score = computeHarmonyScore(entityA, entityB);
  const aspects = computeAspects(entityA, entityB);
  const level = getHarmonyLevel(score);
  const interpretation = generateInterpretation(score, entityA, entityB);

  return { score, level, aspects, interpretation };
}

/**
 * Compute the primary harmony score based on sacred numeric principles.
 * Returns a value from 0 to 100.
 */
function computeHarmonyScore(a: string, b: string): number {
  const charSumA = sumCharacterCodes(a);
  const charSumB = sumCharacterCodes(b);

  const rawScore = Math.abs(charSumA - charSumB);
  const normalizedScore = Math.min(100, rawScore % 100);

  // Apply resonance multiplier based on digital root compatibility
  const rootA = digitalRoot(charSumA);
  const rootB = digitalRoot(charSumB);
  const resonance = getResonance(rootA, rootB);

  return Math.round(normalizedScore * resonance);
}

/**
 * Compute individual harmonic aspects.
 */
function computeAspects(a: string, b: string): HarmonyAspect[] {
  const vibrationMatch = computeVibrationMatch(a, b);
  const rhythmicHarmony = computeRhythmicHarmony(a, b);
  const elementalSynergy = computeElementalSynergy(a, b);

  return [
    { name: 'Vibration', score: vibrationMatch.score, contribution: 0.4 },
    { name: 'Rhythm', score: rhythmicHarmony.score, contribution: 0.3 },
    { name: 'Elemental', score: elementalSynergy.score, contribution: 0.3 },
  ];
}

/**
 * Calculate vibration matching between two entities.
 */
function computeVibrationMatch(a: string, b: string): { score: number } {
  const codesA = getCharacterCodes(a);
  const codesB = getCharacterCodes(b);

  if (codesA.length === 0 || codesB.length === 0) {
    return { score: 0 };
  }

  const avgA = codesA.reduce((s, c) => s + c, 0) / codesA.length;
  const avgB = codesB.reduce((s, c) => s + c, 0) / codesB.length;

  const diff = Math.abs(avgA - avgB);
  const maxDiff = 100;
  const similarity = Math.max(0, 100 - (diff / maxDiff) * 100);

  return { score: Math.round(similarity) };
}

/**
 * Calculate rhythmic harmony based on character length patterns.
 */
function computeRhythmicHarmony(a: string, b: string): { score: number } {
  const lenA = a.length;
  const lenB = b.length;

  if (lenA === 0 || lenB === 0) {
    return { score: 0 };
  }

  const gcd = greatestCommonDivisor(lenA, lenB);
  const lcm = (lenA * lenB) / gcd;

  // Rhythm score based on how well lengths relate
  const rhythmicRelation = gcd / Math.min(lenA, lenB);
  const cycleHarmony = 100 - ((lcm - Math.max(lenA, lenB)) / lcm) * 100;

  return { score: Math.round((rhythmicRelation * 50 + cycleHarmony * 50)) };
}

/**
 * Calculate elemental synergy based on numeric properties.
 */
function computeElementalSynergy(a: string, b: string): { score: number } {
  const rootA = digitalRoot(sumCharacterCodes(a));
  const rootB = digitalRoot(sumCharacterCodes(b));

  const elementalA = rootA % 4;
  const elementalB = rootB % 4;

  // Elements cycle: 0=water, 1=fire, 2=air, 3=earth
  const distance = Math.abs(elementalA - elementalB);
  const compatible = distance === 0 || distance === 2;

  return { score: compatible ? 85 : 50 };
}

/**
 * Get harmony level classification based on score.
 */
function getHarmonyLevel(score: number): HarmonyLevel {
  if (score >= 85) return 'perfect';
  if (score >= 65) return 'high';
  if (score >= 40) return 'moderate';
  return 'low';
}

/**
 * Generate human-readable interpretation of harmony result.
 */
function generateInterpretation(score: number, entityA: string, entityB: string): string {
  const truncationLimit = 20;
  const shortA = entityA.length > truncationLimit
    ? entityA.substring(0, truncationLimit) + '...'
    : entityA;
  const shortB = entityB.length > truncationLimit
    ? entityB.substring(0, truncationLimit) + '...'
    : entityB;

  if (score >= 85) {
    return `Perfect resonance between ${shortA} and ${shortB}. These energies flow in complete harmony.`;
  }
  if (score >= 65) {
    return `Strong harmony between ${shortA} and ${shortB}. Natural synchronicity exists.`;
  }
  if (score >= 40) {
    return `Moderate resonance between ${shortA} and ${shortB}. Some aspects require attention.`;
  }
  return `Limited harmony between ${shortA} and ${shortB}. Consider balancing activities.`;
}

/**
 * Helper: sum of all character codes in a string.
 */
function sumCharacterCodes(str: string): number {
  return str.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

/**
 * Helper: array of all character codes in a string.
 */
function getCharacterCodes(str: string): number[] {
  return str.split('').map(char => char.charCodeAt(0));
}

/**
 * Helper: digital root (reduces to single digit, master numbers preserved).
 */
function digitalRoot(n: number): number {
  if (n === 0) return 0;
  const sum = n.toString().split('').reduce((s, d) => s + parseInt(d, 10), 0);
  return sum <= 9 ? sum : digitalRoot(sum);
}

/**
 * Helper: greatest common divisor.
 */
function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? a : greatestCommonDivisor(b, a % b);
}

/**
 * Helper: resonance multiplier based on digital root compatibility.
 * Master numbers (11, 22, 33) have special resonance properties.
 */
function getResonance(rootA: number, rootB: number): number {
  const masterNumbers = [11, 22, 33];

  // Same root is always resonant
  if (rootA === rootB) return 1.0;

  // Master numbers create special resonance
  if (masterNumbers.includes(rootA) || masterNumbers.includes(rootB)) {
    return 0.95;
  }

  // Complementary roots (e.g., 1 and 9, 2 and 8)
  if (rootA + rootB === 10) return 0.9;

  // Adjacent roots
  if (Math.abs(rootA - rootB) === 1) return 0.85;

  // General case
  return 0.75;
}

export default calculate;
