// fallow-ignore-file unused-file
// @ts-nocheck
// Personality Number - consonant-based numerology calculation

export interface PersonalityResult {
  personality: number;
  interpretation: string;
}

// Pythagorean chart for consonants
const pythagoreanChart: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
  Ç: 3, Ñ: 5,
};

// Extended vowels including acute/grave accents
const VOWELS_EXTENDED = 'AEIOUÁÉÍÓÚÃẼĨÕŨYÀÈÌÒÙÂÊÎÔÛ';

function isVowel(char: string): boolean {
  const upper = char.toUpperCase();
  return VOWELS_EXTENDED.includes(upper);
}

function getConsonantValue(char: string): number {
  const upper = char.toUpperCase();
  // Y is treated as consonant unless it's a vowel sound
  if (upper === 'Y') return 7;
  return pythagoreanChart[upper] ?? 0;
}

function sumDigits(num: number): number {
  const str = String(num);
  const sum = str.split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  return sum;
}

function reduceToBase(num: number): number {
  while (num > 9 && ![11, 22, 33].includes(num)) {
    num = sumDigits(num);
  }
  return num;
}

/**
 * Extracts consonants from a name for personality calculation
 */
function extractConsonants(name: string): string[] {
  const consonants: string[] = [];
  for (const char of name) {
    if (/[A-Za-z]/.test(char) && !isVowel(char)) {
      consonants.push(char);
    }
  }
  return consonants;
}

/**
 * Calculates the Personality Number from a name
 * Personality Number reveals how others perceive you externally
 * It is derived solely from the consonant letters in your name
 * 
 * @param fullName - Full name to analyze
 * @returns Personality result with number and interpretation
 */
export function calculatePersonality(fullName: string): PersonalityResult {
  // Extract only consonants
  const consonants = extractConsonants(fullName);
  
  // Sum the numerological values of consonants
  const total = consonants.reduce((sum, char) => {
    return sum + getConsonantValue(char);
  }, 0);
  
  // Reduce to base number (master numbers preserved)
  const personality = reduceToBase(total);
  
  // Get interpretation based on personality number
  const interpretation = getPersonalityInterpretation(personality);
  
  return { personality, interpretation };
}

/**
 * Returns the interpretation for a personality number
 */
function getPersonalityInterpretation(personality: number): string {
  const interpretations: Record<number, string> = {
    1: 'You project confidence, leadership, and independence. Others see you as determined and self-assured.',
    2: 'You project harmony, cooperation, and diplomacy. Others see you as approachable and nurturing.',
    3: 'You project creativity, joy, and social charm. Others see you as expressive and inspiring.',
    4: 'You project stability, reliability, and practicality. Others see you as grounded and trustworthy.',
    5: 'You project freedom, adventure, and versatility. Others see you as dynamic and stimulating.',
    6: 'You project responsibility, care, and domestic harmony. Others see you as protective and family-oriented.',
    7: 'You project wisdom, introspection, and analytical depth. Others see you as mysterious and spiritual.',
    8: 'You project ambition, authority, and material mastery. Others see you as powerful and business-minded.',
    9: 'You project compassion, humanitarianism, and global awareness. Others see you as generous and wise.',
    11: 'You project intuitive insight and spiritual illumination. As a Master Number, others perceive you as highly sensitive and visionary.',
    22: 'You project masterful vision and practical builder energy. As a Master Number, others perceive you as capable of grand achievements.',
    33: 'You project unconditional love and spiritual teaching. As a Master Number, others perceive you as a source of inspiration and healing.',
  };
  
  return interpretations[personality] || `Personality Number ${personality}`;
}

export default calculatePersonality;