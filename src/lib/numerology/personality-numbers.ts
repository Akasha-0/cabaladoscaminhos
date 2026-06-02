// fallow-ignore-file unused-file
// @ts-nocheck
// Personality Numbers - Consonant-based numerology calculation

export interface PersonalityNumbersResult {
  personalityNumber: number;
  expression: string;
  traits: string[];
  strength: string[];
  weakness: string[];
}

/**
 * Pythagorean chart for consonants
 */
const PYTHAGOREAN_CHART: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
  Ç: 3, Ñ: 5,
};

/**
 * Extended vowels including accented characters
 */
const VOWELS = 'AEIOUÁÉÍÓÚÃẼĨÕŨYÀÈÌÒÙÂÊÎÔÛ';

/**
 * Normalize character to base form for lookup
 */
function normalizeChar(char: string): string {
  const normalized = char
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
  return normalized;
}

/**
 * Check if character is a vowel
 */
function isVowel(char: string): boolean {
  return VOWELS.includes(normalizeChar(char));
}

/**
 * Get Pythagorean value for consonant
 */
function getConsonantValue(char: string): number {
  const normalized = normalizeChar(char);
  return PYTHAGOREAN_CHART[normalized] ?? 0;
}

/**
 * Sum all digits of a number
 */
function sumDigits(num: number): number {
  return String(num).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
}

/**
 * Reduce number to single digit or master number (11, 22, 33)
 */
function reduceToSingleDigit(num: number): number {
  while (num > 9 && ![11, 22, 33].includes(num)) {
    num = sumDigits(num);
  }
  return num;
}

/**
 * Extract consonants from a name
 */
function extractConsonants(name: string): string[] {
  return name
    .split('')
    .filter(char => /[A-Za-zÀ-ÿ]/.test(char) && !isVowel(char));
}

/**
 * Calculate Personality Number from a name
 * Personality Number represents how others perceive you
 * based on the consonants in your name
 */
export function calculatePersonality(fullName: string): PersonalityNumbersResult {
  const name = fullName.trim().toUpperCase();

  if (!name) {
    return {
      personalityNumber: 0,
      expression: 'No name provided',
      traits: [],
      strength: [],
      weakness: [],
    };
  }

  const consonants = extractConsonants(name);

  let total = 0;
  for (const char of consonants) {
    total += getConsonantValue(char);
  }

  const personalityNumber = reduceToSingleDigit(total);

  return {
    personalityNumber,
    expression: getPersonalityExpression(personalityNumber),
    traits: getPersonalityTraits(personalityNumber),
    strength: getPersonalityStrengths(personalityNumber),
    weakness: getPersonalityWeaknesses(personalityNumber),
  };
}

/**
 * Get personality number expression/label
 */
function getPersonalityExpression(num: number): string {
  const expressions: Record<number, string> = {
    1: 'The Independent',
    2: 'The Peacemaker',
    3: 'The Creative',
    4: 'The Builder',
    5: 'The自由人',
    6: 'The Nurturer',
    7: 'The Analyst',
    8: 'The Achiever',
    9: 'The Humanitarian',
    11: 'The Visionary',
    22: 'The Master Builder',
    33: 'The Master Teacher',
  };
  return expressions[num] ?? 'Unknown';
}

/**
 * Get personality traits for a number
 */
function getPersonalityTraits(num: number): string[] {
  const traits: Record<number, string[]> = {
    1: ['Ambitious', 'Self-reliant', 'Determined', 'Pioneering', 'Independent'],
    2: ['Cooperative', 'Diplomatic', 'Sensitive', 'Intuitive', 'Compassionate'],
    3: ['Expressive', 'Social', 'Artistic', 'Optimistic', 'Communicative'],
    4: ['Practical', 'Reliable', 'Organized', 'Patient', 'Systematic'],
    5: ['Adventurous', 'Versatile', 'Freedom-loving', 'Enthusiastic', 'Versatile'],
    6: ['Responsibility', 'Family-oriented', 'Harmonious', 'Caring', 'Nurturing'],
    7: ['Analytical', 'Spiritual', 'Intellectual', 'Reserved', 'Seeking truth'],
    8: ['Authoritative', 'Goal-oriented', 'Abundance-minded', 'Efficient', 'Confident'],
    9: ['Compassionate', 'Humanitarian', 'Wise', 'Idealistic', 'Generous'],
    11: ['Intuitive', 'Inspirational', 'Idealistic', 'Sensitive', 'Spiritual'],
    22: ['Visionary', 'Practical', 'Builder', 'Transformative', 'Responsible'],
    33: ['Compassionate', 'Healing', 'Selfless', 'Inspiring', 'Enlightened'],
  };
  return traits[num] ?? [];
}

/**
 * Get strength areas for a personality number
 */
function getPersonalityStrengths(num: number): string[] {
  const strengths: Record<number, string[]> = {
    1: ['Leadership', 'Innovation', 'Self-confidence'],
    2: ['Partnership', 'Mediation', 'Emotional intelligence'],
    3: ['Creativity', 'Communication', 'Joy'],
    4: ['Reliability', 'Focus', 'Dedication'],
    5: ['Adaptability', 'Versatility', 'Freedom'],
    6: ['Harmony', 'Responsibility', 'Support'],
    7: ['Wisdom', 'Analysis', 'Spirituality'],
    8: ['Ambition', 'Efficiency', 'Abundance'],
    9: ['Compassion', 'Global awareness', 'Service'],
    11: ['Intuition', 'Inspiration', 'Vision'],
    22: ['Mastery', 'Transformation', 'Manifestation'],
    33: ['Healing', 'Selflessness', 'Divine love'],
  };
  return strengths[num] ?? [];
}

/**
 * Get weakness areas for a personality number
 */
function getPersonalityWeaknesses(num: number): string[] {
  const weaknesses: Record<number, string[]> = {
    1: ['Impatience', 'Stubbornness', 'Self-centeredness'],
    2: ['Indecision', 'Oversensitivity', 'Dependency'],
    3: ['Superficiality', 'Scattered energy', 'Moodiness'],
    4: ['Rigidity', 'Inflexibility', 'Stubbornness'],
    5: ['Restlessness', 'Impulsiveness', 'Inconsistency'],
    6: ['Worry', 'Self-sacrifice', 'Clinging'],
    7: ['Detachment', 'Critical nature', 'Isolation'],
    8: ['Materialism', 'Domination', 'Work addiction'],
    9: ['Scattered energy', 'Impatience', 'Idealism'],
    11: ['Overwhelm', 'Nervous tension', 'Perfectionism'],
    22: ['Overwhelm', 'Self-righteousness', 'Burnout'],
    33: ['Martyrdom', 'Self-neglect', 'Impossible ideals'],
  };
  return weaknesses[num] ?? [];
}

export default calculatePersonality;