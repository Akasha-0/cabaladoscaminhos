// ============================================================
// SHARED TAROT NUMEROLOGY UTILITIES - CABALA DOS CAMINHOS
// ============================================================
// Numerology utilities for tarot cards used in tarot routes.
// The canonical TarotCard interface lives in `lib/tarot/cards.ts`.
// Only `getElementKeywords` is actively used by tarot/cards/route.ts.
// ============================================================
// ─── Numerology Utilities ─────────────────────────────────────────────────────

/**
 * Reduce a number to a single digit (1-9)
 */
export function reduceToSingleDigit(n: number): number {
  while (n > 9) {
    n = String(n)
      .split('')
      .reduce((sum, d) => sum + parseInt(d, 10), 0);
  }
  return n;
}

/**
 * Check if number is a master number (11, 22, 33)
 */
export function getMasterNumbers(n: number): number[] {
  const masters = [11, 22, 33];
  return masters.filter((m) => n % m === 0 || n === m);
}

/**
 * Get element based on card number
 */
export function getNumerologyElement(id: number): string {
  const elementMap: Record<number, string> = {
    1: 'Fire',
    2: 'Water',
    3: 'Air',
    4: 'Earth',
    5: 'Fire',
    6: 'Water',
    7: 'Air',
    8: 'Earth',
    9: 'Spirit',
  };
  const digit = reduceToSingleDigit(id);
  return elementMap[digit] || 'Spirit';
}

/**
 * Get associated chakra based on card number
 */
export function getNumerologyChakra(id: number): number {
  const digit = reduceToSingleDigit(id);
  return digit;
}

/**
 * Get element keywords
 */
export function getElementKeywords(element: string): string[] {
  const keywordMap: Record<string, string[]> = {
    Fire: ['passion', 'energy', 'willpower', 'courage'],
    Water: ['emotion', 'intuition', 'healing', 'purification'],
    Air: ['intellect', 'communication', 'freedom', 'thought'],
    Earth: ['stability', 'practicality', 'growth', 'prosperity'],
    Spirit: ['transcendence', 'divinity', 'unity', 'enlightenment'],
  };
  return keywordMap[element] || ['spiritual connection', 'integration'];
}
