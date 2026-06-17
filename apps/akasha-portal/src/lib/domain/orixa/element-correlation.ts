/**
 * ════════════════════════════════════════════════════════════════════════════
 * ELEMENT CORRELATION HELPERS — HyperCorrelationEngine
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Pure functions for element correlation across traditions:
 * - Numerology elements
 * - Zodiac elements
 * - Cross-tradition correlation strength
 *
 * Version: 1.0.0
 * Extracted from: HyperCorrelationEngine.ts
 */
// ════════════════════════════════════════════════════════════════════════════
// IMPORTS
// ════════════════════════════════════════════════════════════════════════════
import { getOrixa } from './types';

// ════════════════════════════════════════════════════════════════════════════
// CORRELATION MATRICES (shared with HyperCorrelationEngine)
// ════════════════════════════════════════════════════════════════════════════

const ELEMENT_PLANETS: Record<string, string[]> = {
  Fogo: ['Sol', 'Marte', 'Júpiter'],
  Água: ['Lua', 'Netuno', 'Plutão'],
  Terra: ['Venus', 'Saturno', 'Mercury'],
  Ar: ['Mercury', 'Júpiter', 'Urano'],
  Éter: ['Netuno', 'Plutão'],
};

// ════════════════════════════════════════════════════════════════════════════
// ELEMENT MAPPING FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Get element from zodiac sign
 */
export function getElementFromSigno(signo: string): string {
  const map: Record<string, string> = {
    aries: 'Fogo',
    touro: 'Terra',
    gemeos: 'Ar',
    cancer: 'Água',
    leao: 'Fogo',
    virgem: 'Terra',
    libra: 'Ar',
    escorpiao: 'Água',
    sagitario: 'Fogo',
    capricornio: 'Terra',
    aquario: 'Ar',
    peixes: 'Água',
  };
  return map[signo.toLowerCase()] ?? 'Ar';
}

/**
 * Get element from numerology number
 */
export function getElementFromNumber(num: number): string {
  const base = num % 9 || 9;
  if (base === 1 || base === 9) return 'Fogo';
  if (base === 2 || base === 8) return 'Água';
  if (base === 3 || base === 7) return 'Terra';
  if (base === 4 || base === 6) return 'Ar';
  return 'Éter';
}

// ════════════════════════════════════════════════════════════════════════════
// CORRELATION STRENGTH CALCULATION
// ════════════════════════════════════════════════════════════════════════════

/**
 * Calculate correlation strength between two entities across traditions
 */
export function calculateCorrelationStrength(
  tradition1: string,
  entity1: string,
  tradition2: string,
  entity2: string
): number {
  // Base correlation strength
  let strength = 0.5;

  // Element matching increases strength
  const elem1 = getElement(entity1) || '';
  const elem2 = getElement(entity2) || '';
  if (elem1 && elem2 && elem1 === elem2) {
    strength += 0.3;
  }

  // Direct known correlations
  const knownCorrelations: Array<[string, string, number]> = [
    ['oxum', 'venus', 0.95],
    ['ogum', 'marte', 0.95],
    ['iemanja', 'lua', 0.95],
    ['oxala', 'sol', 0.95],
    ['xango', 'jupiter', 0.9],
  ];

  for (const [orixa, planeta, corr] of knownCorrelations) {
    if (
      (entity1.toLowerCase().includes(orixa) && entity2.toLowerCase().includes(planeta)) ||
      (entity1.toLowerCase().includes(planeta) && entity2.toLowerCase().includes(orixa))
    ) {
      strength = Math.max(strength, corr);
    }
  }

  return Math.min(strength, 1.0);
}

// ════════════════════════════════════════════════════════════════════════════
// ELEMENT EXTRACTION
// ════════════════════════════════════════════════════════════════════════════

/**
 * Get element from any entity (Orixá, planet, etc.)
 */
export function getElement(entity: string): string | null {
  // Try Orixá
  const orixa = getOrixa(entity);
  if (orixa) return orixa.elemento;

  // Try planet
  for (const [element, planets] of Object.entries(ELEMENT_PLANETS)) {
    if (planets.some((p) => entity.toLowerCase().includes(p.toLowerCase()))) {
      return element;
    }
  }

  return null;
}
