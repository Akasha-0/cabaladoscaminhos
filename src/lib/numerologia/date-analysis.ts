/**
 * Date analysis module for numerological calculations
 */

/**
 * Analyzes a date and extracts numerological components
 */
export function analyzeDate(date: Date | string | number): {
  day: number;
  month: number;
  year: number;
  dayOfMonth: number;
  dayOfWeek: number;
  dayReduced: number;
  monthReduced: number;
  yearReduced: number;
} {
  const d = date instanceof Date ? date : new Date(date);

  if (isNaN(d.getTime())) {
    throw new Error('Invalid date provided');
  }

  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  return {
    day,
    month,
    year,
    dayOfMonth: day,
    dayOfWeek: d.getDay(),
    dayReduced: reduceNumber(day),
    monthReduced: reduceNumber(month),
    yearReduced: reduceNumber(year),
  };
}

/**
 * Reduces a number to a single digit (unless it's a master number)
 */
function reduceNumber(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n)
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }
  return n;
}