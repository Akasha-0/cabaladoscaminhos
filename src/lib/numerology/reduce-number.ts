/**
 * Numerology shared utilities for reducing numbers to base digits.
 */

/**
 * Sums all digits in a number.
 */
export function sumDigits(num: number): number {
  const str = String(num);
  const sum = str.split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  return sum;
}

/**
 * Reduces a number to its base digit (1–9) or master number (11, 22, 33).
 */
export function reduceToBase(num: number): number {
  while (num > 9 && ![11, 22, 33].includes(num)) {
    num = sumDigits(num);
  }
  return num;
}
