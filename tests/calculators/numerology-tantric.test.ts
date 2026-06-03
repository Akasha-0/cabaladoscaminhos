// ============================================================
// TESTS FOR NUMEROLOGIA TÂNTRICA (Tantric Numerology)
// ============================================================
// Canonical test case (Doc 09 §8):
//   Name: "Eliane Simão de Almeida"
//   Date: 20/08/1986
//   Expected:
//     - soul = 2 (20 → 2+0 = 2)
//     - karma = 8 (08)
//     - divineGift = 5 (1986 → 86 → 8+6=14 → 1+4=5)
//     - destiny = 6 (1+9+8+6=24 → 2+4=6)
//     - tantricPath = 7 (20+8+1986=2014 → 2+0+1+4=7)

import { describe, it, expect } from 'vitest';
import {
  calculateSoul,
  calculateKarma,
  calculateDivineGift,
  calculateDestiny,
  calculateTantricPath,
  buildTantricMap,
} from '@/lib/calculators/numerology-tantric';

const TEST_DATE = '1986-08-20';

describe('numerology-tantric: calculateSoul', () => {
  it('should return 2 for 20/08/1986 (day 20 → 2+0 = 2)', () => {
    const result = calculateSoul(TEST_DATE);
    expect(result).toBe(2);
  });

  it('should return reduced day for different dates', () => {
    // Day 15 → 1+5 = 6
    expect(calculateSoul('2000-01-15')).toBe(6);
    // Day 9 → 9 (already single digit)
    expect(calculateSoul('2000-01-09')).toBe(9);
    // Day 28 → 2+8 = 10 (not reduced further since 10 <= 11)
    expect(calculateSoul('2000-01-28')).toBe(10);
  });

  it('should handle two-digit day correctly', () => {
    // Day 11 → 11 (master number, stays as 11 since <= 11)
    expect(calculateSoul('2000-01-11')).toBe(11);
    // Day 22 → 22 (master number, stays as 22 since <= 11 is false but 22 > 11, so reduces)
    // Wait, 22 > 11 so it reduces: 2+2 = 4
    expect(calculateSoul('2000-01-22')).toBe(4);
  });
});

describe('numerology-tantric: calculateKarma', () => {
  it('should return 8 for 20/08/1986 (month 08)', () => {
    const result = calculateKarma(TEST_DATE);
    expect(result).toBe(8);
  });

  it('should return month value directly when ≤11', () => {
    expect(calculateKarma('2000-01-15')).toBe(1);
    expect(calculateKarma('2000-11-15')).toBe(11); // 11 is valid in tantric
  });

  it('should reduce month when > 11', () => {
    // Month 12 → 1+2 = 3
    expect(calculateKarma('2000-12-15')).toBe(3);
  });
});

describe('numerology-tantric: calculateDivineGift', () => {
  it('should return 5 for 20/08/1986 (1986 → 86 → 8+6=14 → 1+4=5)', () => {
    const result = calculateDivineGift(TEST_DATE);
    expect(result).toBe(5);
  });

  it('should use last two digits of year', () => {
    // Year 2000 → 00 → 0 → reduceTantric(0) → 1 (since 0 <= 0)
    expect(calculateDivineGift('2000-01-15')).toBe(1);
    // Year 1999 → 99 → 9+9=18 → 1+8=9
    expect(calculateDivineGift('1999-01-15')).toBe(9);
    // Year 2025 → 25 → 2+5=7
    expect(calculateDivineGift('2025-01-15')).toBe(7);
  });

  it('should handle years correctly', () => {
    // Year 1911 → 11 → reduceTantric(11) → 11 (since 11 <= 11)
    expect(calculateDivineGift('1911-01-15')).toBe(11);
    // Year 1922 → 22 → 2+2 = 4 (since 22 > 11)
    expect(calculateDivineGift('1922-01-15')).toBe(4);
  });
});

describe('numerology-tantric: calculateDestiny', () => {
  it('should return 6 for 20/08/1986 (1+9+8+6=24 → 2+4=6)', () => {
    const result = calculateDestiny(TEST_DATE);
    expect(result).toBe(6);
  });

  it('should sum all four digits of year', () => {
    // 2000 → 2+0+0+0 = 2
    expect(calculateDestiny('2000-01-15')).toBe(2);
    // 1999 → 1+9+9+9 = 28 → 2+8 = 10 (not reduced since 10 <= 11)
    expect(calculateDestiny('1999-01-15')).toBe(10);
  });

  it('should handle year correctly', () => {
    // 1992 → 1+9+9+2 = 21 → 2+1 = 3
    expect(calculateDestiny('1992-01-15')).toBe(3);
  });
});

describe('numerology-tantric: calculateTantricPath', () => {
  it('should return 7 for 20/08/1986 (20+8+1986=2014 → 2+0+1+4=7)', () => {
    const result = calculateTantricPath(TEST_DATE);
    expect(result).toBe(7);
  });

  it('should sum day + month + full year', () => {
    // 15 + 1 + 2000 = 2016 → 2+0+1+6 = 9
    expect(calculateTantricPath('2000-01-15')).toBe(9);
    // 1 + 1 + 2000 = 2002 → 2+0+0+2 = 4
    expect(calculateTantricPath('2000-01-01')).toBe(4);
  });

  it('should handle larger sums correctly', () => {
    // 31 + 12 + 2000 = 2043 → 2+0+4+3 = 9
    expect(calculateTantricPath('2000-12-31')).toBe(9);
  });
});

describe('numerology-tantric: buildTantricMap', () => {
  it('should return object with soul: 2', () => {
    const result = buildTantricMap(TEST_DATE);
    expect(result.soul).toBe(2);
  });

  it('should return object with karma: 8', () => {
    const result = buildTantricMap(TEST_DATE);
    expect(result.karma).toBe(8);
  });

  it('should return object with divineGift: 5', () => {
    const result = buildTantricMap(TEST_DATE);
    expect(result.divineGift).toBe(5);
  });

  it('should return object with destiny: 6', () => {
    const result = buildTantricMap(TEST_DATE);
    expect(result.destiny).toBe(6);
  });

  it('should return object with tantricPath: 7', () => {
    const result = buildTantricMap(TEST_DATE);
    expect(result.tantricPath).toBe(7);
  });

  it('should return all tantric numbers matching individual functions', () => {
    const result = buildTantricMap(TEST_DATE);

    expect(result.soul).toBe(calculateSoul(TEST_DATE));
    expect(result.karma).toBe(calculateKarma(TEST_DATE));
    expect(result.divineGift).toBe(calculateDivineGift(TEST_DATE));
    expect(result.destiny).toBe(calculateDestiny(TEST_DATE));
    expect(result.tantricPath).toBe(calculateTantricPath(TEST_DATE));
  });

  it('should return soulBody matching soul value', () => {
    const result = buildTantricMap(TEST_DATE);
    expect(result.soulBody).toBe(result.soul);
  });

  it('should return karmaBody matching karma value', () => {
    const result = buildTantricMap(TEST_DATE);
    expect(result.karmaBody).toBe(result.karma);
  });

  it('should return divineGiftBody matching divineGift value', () => {
    const result = buildTantricMap(TEST_DATE);
    expect(result.divineGiftBody).toBe(result.divineGift);
  });

  it('should include tantricBodies object', () => {
    const result = buildTantricMap(TEST_DATE);
    expect(result.tantricBodies).toBeDefined();
    expect(typeof result.tantricBodies).toBe('object');
  });

  it('should include bodies object with 5 tantric bodies', () => {
    const result = buildTantricMap(TEST_DATE);
    expect(result.bodies).toBeDefined();
    expect(typeof result.bodies).toBe('object');
    const bodies = result.bodies!;
    expect(bodies.fisico).toBeDefined();
    expect(bodies.fisico.number).toBeGreaterThan(0);
    expect(typeof bodies.fisico.description).toBe('string');
    expect(Array.isArray(bodies.fisico.qualities)).toBe(true);
    expect(bodies.pranic).toBeDefined();
    expect(bodies.emocional).toBeDefined();
    expect(bodies.mental).toBeDefined();
    expect(bodies.espiritual).toBeDefined();
  });
  it('should have soulDescription as non-empty string', () => {
    const result = buildTantricMap(TEST_DATE);
    expect(typeof result.soulDescription).toBe('string');
    expect(result.soulDescription!.length).toBeGreaterThan(0);
  });
  it('should have karmaDescription as non-empty string', () => {
    const result = buildTantricMap(TEST_DATE);
    expect(typeof result.karmaDescription).toBe('string');
    expect(result.karmaDescription!.length).toBeGreaterThan(0);
  });
  it('should have divineGiftDescription as non-empty string', () => {
    const result = buildTantricMap(TEST_DATE);
    expect(typeof result.divineGiftDescription).toBe('string');
    expect(result.divineGiftDescription!.length).toBeGreaterThan(0);
  });
});

describe('numerology-tantric: canonical case (Doc 09 §8)', () => {
  it('should match all expected values for 20/08/1986', () => {
    expect(calculateSoul(TEST_DATE)).toBe(2);
    expect(calculateKarma(TEST_DATE)).toBe(8);
    expect(calculateDivineGift(TEST_DATE)).toBe(5);
    expect(calculateDestiny(TEST_DATE)).toBe(6);
    expect(calculateTantricPath(TEST_DATE)).toBe(7);
  });
});

describe('numerology-tantric: edge cases', () => {
  it('should handle invalid date gracefully', () => {
    const result = calculateSoul('invalid');
    expect(result).toBe(1); // Returns 1 for invalid date
  });

  it('should handle empty date gracefully', () => {
    expect(calculateSoul('')).toBe(1);
    expect(calculateKarma('')).toBe(1);
    expect(calculateDivineGift('')).toBe(1);
    expect(calculateDestiny('')).toBe(1);
    expect(calculateTantricPath('')).toBe(1);
  });

  it('should handle year 2000 correctly', () => {
    // Year 2000 has many zeros
    expect(calculateDestiny('2000-01-01')).toBe(2);
    // 00 → reduceTantric(0) → 1 (since 0 <= 0)
    expect(calculateDivineGift('2000-01-01')).toBe(1);
    expect(calculateTantricPath('2000-01-01')).toBe(4);
  });

  it('should handle year 1999 correctly', () => {
    // Year 1999 has high digit sum
    // 1999 → 1+9+9+9 = 28 → reduceTantric(28) → 2+8 = 10
    expect(calculateDestiny('1999-12-31')).toBe(10);
    // 99 → 9+9 = 18 → 1+8 = 9
    expect(calculateDivineGift('1999-12-31')).toBe(9);
  });
});
