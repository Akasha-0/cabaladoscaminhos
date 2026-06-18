// ============================================================
// NUMEROLOGY CORE — Pure math helpers for personal cycles
// ============================================================
// These functions are pure and have no side effects.
// ============================================================

/**
 * Reduces a number to a single digit (1-9) or preserves master numbers (11, 22, 33).
 * @param num - The number to reduce
 * @param keepMaster - Whether to preserve master numbers (default true)
 */
export function reduce(num: number, keepMaster = true): number {
  if (keepMaster && (num === 11 || num === 22 || num === 33)) return num;
  if (num < 10) return num;
  let sum = 0;
  while (num > 0) {
    sum += num % 10;
    num = Math.floor(num / 10);
  }
  return reduce(sum, keepMaster);
}

/**
 * Sums all digits of a number.
 */
export function sumDigits(num: number): number {
  return String(num)
    .split('')
    .reduce((sum, d) => sum + parseInt(d, 10), 0);
}

/**
 * Calculates age in years between birth date and target date.
 */
export function ageInYears(birthDate: Date, targetDate: Date): number {
  let age = targetDate.getFullYear() - birthDate.getFullYear();
  const m = targetDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && targetDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
