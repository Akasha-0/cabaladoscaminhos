// fallow-ignore-file unused-file
/**
 * Life Path Number Calculator
 * Calculates the Life Path number from a birth date following
 * Pythagorean numerology principles.
 */

/**
 * Reduces a number to a single digit or master number (11, 22, 33).
 */
function reduceToSingleDigit(num: number): number {
  if (num <= 0) return num;

  // Master numbers are preserved
  if (num === 11 || num === 22 || num === 33) return num;

  if (num < 10) return num;

  const sum = String(num).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  return reduceToSingleDigit(sum);
}

/**
 * Adds all digits of a number together.
 */
function sumDigits(num: number): number {
  return String(num).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
}

/**
 * Calculates the Life Path number from a birth date.
 *
 * @param birthDate - Date object representing the birth date
 * @returns The Life Path number (1-9, 11, 22, or 33)
 */
export function calculate(birthDate: Date): number {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1; // getMonth() is 0-indexed
  const year = birthDate.getFullYear();

  // Sum all components first
  const total = sumDigits(day) + sumDigits(month) + sumDigits(year);

  // Reduce to single digit or master number
  return reduceToSingleDigit(total);
}
