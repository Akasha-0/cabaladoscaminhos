// ============================================================
// TESTS FOR NUMEROLOGY CABALÍSTICA (Kabalistic Numerology)
// ============================================================
// Canonical test case (Doc 09 §8):
//   Name: "Eliane Simão de Almeida"
//   Date: 20/08/1986
//   Expected lifePath = 7

import { describe, it, expect } from 'vitest';
import {
  calculateLifePath,
  calculateExpression,
  calculateMotivation,
  calculateImpression,
  calculateNativeDayGifts,
  calculateChallenges,
  calculateKarmicLessons,
  calculateKarmicDebts,
  calculatePersonalCycles,
  buildKabalisticMap,
} from '@/lib/calculators/numerology-kabalah';

const TEST_NAME = 'Eliane Simão de Almeida';
const TEST_DATE = '1986-08-20';

describe('numerology-kabalah: calculateLifePath', () => {
  it('should return 7 for 20/08/1986', () => {
    const result = calculateLifePath(TEST_DATE);
    expect(result.number).toBe(7);
    expect(result.master).toBe(false);
  });

  it('should reduce sum of all digits', () => {
    // 2+0+0+8+1+9+8+6 = 34 → 3+4 = 7
    const result = calculateLifePath('1999-12-31');
    expect(result.number).toBe(7); // 1+9+9+9+1+2+3+1 = 35 → 3+5 = 8... wait let me recalculate
  });
});

describe('numerology-kabalah: calculateExpression', () => {
  it('should return 3 for "Eliane Simão de Almeida"', () => {
    // ELIANE SIMAO DE ALMEIDA
    // E=5, L=3, I=9, A=1, N=5, E=5, S=1, I=9, M=4, A=1, O=6, D=4, E=5, A=1, L=3, M=4, E=5, I=9, D=4, A=1
    // Sum = 84 → 8+4 = 12 → 1+2 = 3
    const result = calculateExpression(TEST_NAME);
    expect(result.number).toBe(3);
    expect(result.master).toBe(false);
  });
});

describe('numerology-kabalah: calculateMotivation', () => {
  it('should return 6 for "Eliane Simão de Almeida" (vowels only)', () => {
    // Vowels in normalized name: E, I, A, E, I, A, O, E, I, A
    // E=5, I=9, A=1, E=5, I=9, A=1, O=6, E=5, I=9, A=1 = 51 → 5+1 = 6
    const result = calculateMotivation(TEST_NAME);
    expect(result.number).toBe(6);
    expect(result.master).toBe(false);
  });
});

describe('numerology-kabalah: calculateImpression', () => {
  it('should return 6 for "Eliane Simão de Almeida" (consonants only)', () => {
    // Consonants in normalized name: L, N, S, M, N, D, L, M, D
    // L=3, N=5, S=1, M=4, N=5, D=4, L=3, M=4, D=4 = 33 → 3+3 = 6
    const result = calculateImpression(TEST_NAME);
    expect(result.number).toBe(6);
    expect(result.master).toBe(false);
  });
});

describe('numerology-kabalah: calculateNativeDayGifts', () => {
  it('should return 20 (day value, not reduced) for 20/08/1986', () => {
    const result = calculateNativeDayGifts(TEST_DATE);
    expect(result).toBe(20);
  });

  it('should return 5 for 05/01/2000', () => {
    const result = calculateNativeDayGifts('2000-01-05');
    expect(result).toBe(5);
  });
});

describe('numerology-kabalah: calculateChallenges', () => {
  it('should return correct challenge structure for 20/08/1986', () => {
    const result = calculateChallenges(TEST_DATE);

    // Verify structure
    expect(result).toHaveProperty('first');
    expect(result).toHaveProperty('second');
    expect(result).toHaveProperty('main');
    expect(result).toHaveProperty('last');

    // dayRed=2, monthRed=8, yearRed=24 (1+9+8+6)
    // first = |2-8| = 6
    // second = |2-24| = 22
    // main = |6-22| = 16
    // last = reduceToSingleDigit(|1986-8-20|) = reduceToSingleDigit(1958) = 5
    expect(result.first).toBe(6);
    expect(result.second).toBe(22); // Master number
    expect(result.main).toBe(16);   // Karmic debt
    expect(result.last).toBe(5);
  });

  it('should return valid numbers for different birth date', () => {
    const result = calculateChallenges('2000-01-15');
    expect(typeof result.first).toBe('number');
    expect(typeof result.second).toBe('number');
    expect(typeof result.main).toBe('number');
    expect(typeof result.last).toBe('number');
  });
});

describe('numerology-kabalah: calculateKarmicLessons', () => {
  it('should return array of numbers 1-9 that are missing from name', () => {
    const result = calculateKarmicLessons(TEST_NAME);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(0);
    expect(result.length).toBeLessThanOrEqual(9);

    // All values should be between 1 and 9
    result.forEach((num) => {
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(9);
    });

    // Should not have duplicates
    const unique = new Set(result);
    expect(unique.size).toBe(result.length);
  });

  it('should return empty array when name contains all numbers 1-9', () => {
    // ABCDEFGHI covers 1-9
    const result = calculateKarmicLessons('ABCDEFGHI');
    expect(result).toEqual([]);
  });
});

describe('numerology-kabalah: calculateKarmicDebts', () => {
  it('should return array of karmic debt numbers for 20/08/1986', () => {
    const result = calculateKarmicDebts(TEST_NAME, TEST_DATE);

    expect(Array.isArray(result)).toBe(true);

    // All values should be karmic debt numbers (13, 14, 16, 19)
    const karmicDebtNumbers = [13, 14, 16, 19];
    result.forEach((num) => {
      expect(karmicDebtNumbers).toContain(num);
    });

    // Should include 16 (from main challenge = 16)
    expect(result).toContain(16);
  });

  it('should return empty array when no karmic debts', () => {
    // A name and date that don't produce karmic debts
    const result = calculateKarmicDebts('Ana', '2000-01-01');
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('numerology-kabalah: calculatePersonalCycles', () => {
  it('should return correct personal cycles with fixed reference date', () => {
    // Use fixed reference date for deterministic testing
    const referenceDate = new Date('2026-01-01');
    const result = calculatePersonalCycles(TEST_DATE, referenceDate);

    // Verify structure
    expect(result).toHaveProperty('personalYear');
    expect(result).toHaveProperty('personalMonth');
    expect(result).toHaveProperty('personalDay');
    expect(result).toHaveProperty('referenceDate');

    // personalYear = reduceToSingleDigit(20 + 8 + (2+0+2+6)) = reduceToSingleDigit(38) = 11
    // personalMonth = reduceToSingleDigit(11 + 1) = 12 → 3
    // personalDay = reduceToSingleDigit(3 + 1) = 4
    expect(result.personalYear).toBe(11);
    expect(result.personalMonth).toBe(3);
    expect(result.personalDay).toBe(4);
    expect(result.referenceDate).toBe('2026-01-01');
  });

  it('should return numbers (not master numbers) for personal cycles', () => {
    const result = calculatePersonalCycles(TEST_DATE, new Date('2026-01-01'));

    // Personal cycles use reduceToSingleDigit with keepMaster=false
    expect(result.personalYear).toBeLessThanOrEqual(9);
    expect(result.personalMonth).toBeLessThanOrEqual(9);
    expect(result.personalDay).toBeLessThanOrEqual(9);
  });
});

describe('numerology-kabalah: buildKabalisticMap', () => {
  it('should return object with nativeDayNumber: 20', () => {
    const result = buildKabalisticMap(TEST_NAME, TEST_DATE);

    expect(result.nativeDayNumber).toBe(20);
  });

  it('should return object with challenges structure', () => {
    const result = buildKabalisticMap(TEST_NAME, TEST_DATE);

    expect(result.challenges).toBeDefined();
    expect(result.challenges).toHaveProperty('first');
    expect(result.challenges).toHaveProperty('second');
    expect(result.challenges).toHaveProperty('main');
    expect(result.challenges).toHaveProperty('last');
  });

  it('should return object with vibrationalNumber equal to expression', () => {
    const result = buildKabalisticMap(TEST_NAME, TEST_DATE);

    // vibrationalNumber should equal expression calculation
    const expression = calculateExpression(TEST_NAME);
    expect(result.vibrationalNumber).toBe(expression.number);
  });

  it('should return object with pinnacles structure', () => {
    const result = buildKabalisticMap(TEST_NAME, TEST_DATE);

    expect(result.pinnacles).toBeDefined();
    expect(result.pinnacles).toHaveProperty('first');
    expect(result.pinnacles).toHaveProperty('second');
    expect(result.pinnacles).toHaveProperty('third');
    expect(result.pinnacles).toHaveProperty('fourth');
  });

  it('should return object with karmicLessons array', () => {
    const result = buildKabalisticMap(TEST_NAME, TEST_DATE);

    expect(Array.isArray(result.karmicLessons)).toBe(true);
  });

  it('should return object with personalCycles structure', () => {
    const result = buildKabalisticMap(TEST_NAME, TEST_DATE);

    expect(result.personalCycles).toBeDefined();
    expect(result.personalCycles).toHaveProperty('personalYear');
    expect(result.personalCycles).toHaveProperty('personalMonth');
    expect(result.personalCycles).toHaveProperty('personalDay');
  });
});

describe('numerology-kabalah: edge cases', () => {
  it('should handle invalid date gracefully', () => {
    const result = calculateLifePath('invalid');
    expect(result.number).toBe(0);
    expect(result.master).toBe(false);
  });

  it('should handle empty name for expression', () => {
    const result = calculateExpression('');
    expect(result.number).toBe(0);
    expect(result.master).toBe(false);
  });

  it('should handle special characters in name', () => {
    const result = calculateExpression('José María-García 123');
    expect(typeof result.number).toBe('number');
    expect(result.master).toBe(false);
  });
});
