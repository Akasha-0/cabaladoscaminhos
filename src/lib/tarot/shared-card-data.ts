// ============================================================
// SHARED TAROT CARD DATA - CABALA DOS CAMINHOS
// ============================================================
// Shared tarot card definitions and helper functions
// used across tarot routes and related components.
//
// Clone group: 92587013 (72 lines, 3 instances)
// Files: tarot/cards, tarot/consulta, tarot/reading routes
// ============================================================
export interface TarotCardBase {
  id: number;
  name: string;
  arcana: 'major' | 'minor';
  suit?: string;
  number?: number;
  element?: string;
  astro?: string;
  upright: string[];
  reversed: string[];
}

export interface TarotCardNumerology {
  cardId: number;
  numerology: {
    singleDigit: number;
    isMasterNumber: boolean;
    masterNumbers: number[];
    element: string;
    associatedChakra: number;
    vibrationalEnergy: number;
  };
}

// ─── Numerology Utilities ─────────────────────────────────────────────────────

/**
 * Reduce a number to a single digit (1-9)
 */
export function reduceToSingleDigit(n: number): number {
  while (n > 9) {
    n = String(n).split('').reduce((sum, d) => sum + parseInt(d, 10), 0);
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
    1: 'Fire', 2: 'Water', 3: 'Air', 4: 'Earth',
    5: 'Fire', 6: 'Water', 7: 'Air', 8: 'Earth', 9: 'Spirit'
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
    Spirit: ['transcendence', 'divinity', 'unity', 'enlightenment']
  };
  return keywordMap[element] || ['spiritual connection', 'integration'];
}

// ─── Card Validation ──────────────────────────────────────────────────────────

export function isValidCardId(id: number): boolean {
  return Number.isInteger(id) && id >= 0 && id <= 77;
}

export function getArcanaFromId(id: number): 'major' | 'minor' {
  return id <= 21 ? 'major' : 'minor';
}

export function calculateCardNumerology(cardId: number): TarotCardNumerology {
  const singleDigit = reduceToSingleDigit(cardId);
  const masterNumbers = getMasterNumbers(cardId);
  const element = getNumerologyElement(cardId);
  const chakra = getNumerologyChakra(cardId);

  return {
    cardId,
    numerology: {
      singleDigit,
      isMasterNumber: masterNumbers.length > 0,
      masterNumbers,
      element,
      associatedChakra: chakra,
      vibrationalEnergy: cardId * 9,
    },
  };
}
