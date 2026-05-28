// @ts-nocheck
// Life Path Number - date-based numerology calculation

export interface LifePathResult {
  lifePath: number;
  interpretation: string;
}

/**
 * Sums all digits in a number, reducing to single digit or master number
 */
function sumDigits(num: number): number {
  const str = String(num);
  const sum = str.split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  return sum;
}

/**
 * Reduces a number to its base digit (1-9) or master number (11, 22, 33)
 */
function reduceToBase(num: number): number {
  while (num > 9 && ![11, 22, 33].includes(num)) {
    num = sumDigits(num);
  }
  return num;
}

/**
 * Extracts all digits from a date string for numerology calculation
 */
function extractDigits(date: string): number[] {
  const digits: number[] = [];
  for (const char of date) {
    if (char >= '0' && char <= '9') {
      digits.push(parseInt(char, 10));
    }
  }
  return digits;
}

/**
 * Calculates the Life Path Number from a birth date
 * Life Path reveals your purpose and the journey you're meant to follow
 * 
 * @param birthDate - Date in format YYYY-MM-DD or DD/MM/YYYY or similar
 * @returns Life path result with number and interpretation
 */
export function calculateLifePath(birthDate: string): LifePathResult {
  // Extract all digits from the birth date
  const digits = extractDigits(birthDate);
  
  // Sum all digits
  const total = digits.reduce((sum, digit) => sum + digit, 0);
  
  // Reduce to base number (master numbers preserved)
  const lifePath = reduceToBase(total);
  
  // Get interpretation based on life path number
  const interpretation = getLifePathInterpretation(lifePath);
  
  return { lifePath, interpretation };
}

/**
 * Returns the interpretation for a life path number
 */
function getLifePathInterpretation(lifePath: number): string {
  const interpretations: Record<number, string> = {
    1: 'Your path leads you to independence, leadership, and pioneering spirit. You are meant to forge new trails and lead others.',
    2: 'Your path centers on partnership, cooperation, and diplomacy. You are meant to build bridges and foster harmony.',
    3: 'Your path is one of creativity, expression, and social connection. You are meant to inspire through art and communication.',
    4: 'Your path demands practicality, discipline, and hard work. You are meant to build lasting foundations.',
    5: 'Your path embraces freedom, adventure, and versatility. You are meant to experience life to its fullest.',
    6: 'Your path centers on responsibility, nurturing, and harmony. You are meant to care for home and community.',
    7: 'Your path calls you to introspection, analysis, and spiritual depth. You are meant to seek hidden wisdom.',
    8: 'Your path is marked by ambition, authority, and material mastery. You are meant to achieve worldly success.',
    9: 'Your path leads to compassion, humanitarianism, and global consciousness. You are meant to serve humanity.',
    11: 'Your path carries the weight of intuitive insight and spiritual illumination. As a Master Number, you have exceptional potential.',
    22: 'Your path is that of the Master Builder, capable of manifesting grand visions into reality. As a Master Number, you hold great power.',
    33: 'Your path embodies the Master Teacher, devoted to spiritual upliftment. As a Master Number, you inspire through unconditional love.',
  };
  
  return interpretations[lifePath] || `Life Path ${lifePath}`;
}

export default calculateLifePath;