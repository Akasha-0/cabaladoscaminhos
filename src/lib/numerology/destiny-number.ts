// @ts-nocheck
// Destiny Number - date-based numerology calculation

export interface DestinyResult {
  destiny: number;
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
 * Pythagorean table for date calculation
 * Each digit maps to its numerological value

/**
 * Calculates the Destiny Number from a birth date
 * Destiny Number reveals the path you'll follow in this lifetime
 * 
 * @param birthDate - Date in format YYYY-MM-DD or DD/MM/YYYY or similar
 * @returns Destiny result with number and interpretation
 */
export function calculateDestiny(birthDate: string): DestinyResult {
  // Sum all digits in the date
  const total = extractDigits(birthDate).reduce((sum, digit) => sum + digit, 0);
  
  // Reduce to base number (master numbers preserved)
  const destiny = reduceToBase(total);
  
  // Get interpretation based on destiny number
  const interpretation = getDestinyInterpretation(destiny);
  
  return { destiny, interpretation };
}

/**
 * Returns the interpretation for a destiny number
 */
function getDestinyInterpretation(destiny: number): string {
  const interpretations: Record<number, string> = {
    1: 'Independent, pioneering, leadership, originality',
    2: 'Cooperative, diplomatic, partnership, balance',
    3: 'Creative, expressive, social, artistic',
    4: 'Practical, hardworking, stability, foundation',
    5: 'Freedom-loving, adventurous, versatile, change',
    6: 'Responsible, caring, harmony, family',
    7: 'Analytical, spiritual, introspective, wisdom',
    8: 'Ambitious, material success, power, authority',
    9: 'Compassionate, humanitarian, global consciousness',
    11: 'Intuitive, spiritual insight, illumination (Master Number)',
    22: 'Master builder, large-scale achievements (Master Number)',
    33: 'Master teacher, spiritual upliftment (Master Number)',
  };
  
  return interpretations[destiny] || `Destiny Number ${destiny}`;
}

export default calculateDestiny;