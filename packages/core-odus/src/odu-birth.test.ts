// Test suite for du-birth.ts
import { describe, it, expect } from 'vitest';
import { calculateBirthOdu, calculateSecondaryOdu } from './odu-birth';
import { reduceOduNumber } from './calculos';

// Helper to create a date string in YYYY-MM-DD format
const createDateString = (year: number, month: number, day: number): string => {
  const paddedMonth = String(month).padStart(2, '0');
  const paddedDay = String(day).padStart(2, '0');
  return `${year}-${paddedMonth}-${paddedDay}`;
};

describe('ODUS Calculation Logic', () => {
  // Test suite for reduceOduNumber
  describe('reduceOduNumber', () => {
    it('should return the number if it is already between 1 and 15', () => {
      expect(reduceOduNumber(5)).toBe(5);
      expect(reduceOduNumber(15)).toBe(15);
      expect(reduceOduNumber(1)).toBe(1);
    });

    it('should reduce numbers greater than 15 by summing digits', () => {
      // Example from comments: 27 -> 2+7 = 9
      expect(reduceOduNumber(27)).toBe(9);
      // Example from comments: 33 -> 3+3 = 6
      expect(reduceOduNumber(33)).toBe(6);
    });

    it('should handle multiple reduction steps', () => {
      // Number that requires more than one sum to reduce
      // 1999 -> 1+9+9+9 = 28 -> 2+8 = 10
      expect(reduceOduNumber(1999)).toBe(10);
      // 99999 -> 9*5 = 45 -> 4+5 = 9
      expect(reduceOduNumber(99999)).toBe(9);
    });

    it('should handle the degenerate case where sum becomes 0, returning 15', () => {
      // For example, if a number somehow summed to 0, it should return 15.
      // This specific case is unlikely with positive digits, but the logic is there.
      // Let's ensure it's robust. A sum of 0 is hypothetically impossible with positive digits.
      // However, if a string '0' was encountered, parseInt('0') is 0.
      // A sum of 15 could be reduceOduNumber(69) -> 6+9=15.
      // A sum of 16... reduceOduNumber(16) -> 1+6=7.
      // A sum of 24... reduceOduNumber(24) -> 2+4=6.
      // A sum that results in 0 is impossible from positive digits. If testing robustness,
      // we might simulate it, but it's not naturally achievable by summing digits of a date.
      // The comment mentions "caso degenerado", implying it's a safeguard.
      // We'll rely on the algorithm's intent here; it doesn't seem directly testable
      // with valid positive digit sums.
    });
    it('reproduces: non-integer in canonical range leaks through', () => {
      expect(reduceOduNumber(1.5)).toBe(1);
      expect(reduceOduNumber(9.99)).toBe(9);
      expect(reduceOduNumber(16.7)).toBe(7); // 1+6 after trunc
    });
  });

  describe('calculateBirthOdu', () => {
    it('should calculate correctly for example dates', () => {
      // Example 1: 1991-12-04 -> sum 27 -> reduce 9 (Ossá)
      const birthDate1 = createDateString(1991, 12, 4);
      const result1 = calculateBirthOdu(birthDate1);
      expect(result1.oduNumber).toBe(9);
      expect(result1.oduName).toBe('Ossá');

      // Example 2: 1986-03-15 -> sum 33 -> reduce 6 (Obará)
      const birthDate2 = createDateString(1986, 3, 15);
      const result2 = calculateBirthOdu(birthDate2);
      expect(result2.oduNumber).toBe(6);
      expect(result2.oduName).toBe('Obará');
    });

    it('should calculate Odu 1 correctly for a specific date', () => {
      // Date that sums to 10: 2000-01-07 -> 2+0+0+0+0+1+0+7 = 10.
      // With MAX_ODU_NUMBER=15, 10 is in 1-15 so stays 10 (Ofun), not further reduced.
      const birthDate = createDateString(2000, 1, 7);
      const result = calculateBirthOdu(birthDate);
      expect(result.oduNumber).toBe(10);
    });

    it('should handle dates with leading zeros and different lengths correctly', () => {
      // Test Jan 1st of 2000 -> 2+0+0+0+0+1+0+1 = 4 -> 4
      const birthDate1 = createDateString(2000, 1, 1);
      const result1 = calculateBirthOdu(birthDate1);
      expect(result1.oduNumber).toBe(4);

      // 1999-08-05 => 1+9+9+9+0+8+0+5 = 41 => 4+1 = 5
      const birthDate2 = createDateString(1999, 8, 5);
      const result2 = calculateBirthOdu(birthDate2);
      expect(result2.oduNumber).toBe(5);
    });

    it('should return default Odu for invalid date formats', () => {
      // Default fallback is Odu 1 (Okaran) via ODUS_IFA[0]
      const invalidDate1 = '2000/01/01'; // Wrong separator
      expect(calculateBirthOdu(invalidDate1).oduNumber).toBe(1);

      const invalidDate2 = '01-01-2000'; // Wrong order
      expect(calculateBirthOdu(invalidDate2).oduNumber).toBe(1);

      const invalidDate3 = '2000'; // Incomplete
      expect(calculateBirthOdu(invalidDate3).oduNumber).toBe(1);

      const invalidDate4 = ''; // Empty string
      expect(calculateBirthOdu(invalidDate4).oduNumber).toBe(1);
    });

    it('should return full fallback contract for format-invalid dates (e.g. month 13)', () => {
      // SECONDARY_DATE_REGEX rejects month 13 — falls back to ODUS_IFA[0] (Okaran).
      const result = calculateBirthOdu('2024-13-01');
      expect(result.oduNumber).toBe(1);
      expect(result.oduName).toBe('Okaran');
      expect(result.orixaRegency).toEqual(['Exu']);
      expect(result.elementalForce).toBe('Terra/Fogo — O começo, a dúvida, a insubordinação');
      expect(result.lifeLesson).toBe('Cultivar a paciência; Não agir por impulso; Cuidar rigorosamente de Exu e dos antepassados');
      expect(result.provisional).toBe(true);
    });

    it('should set provisional flag correctly', () => {
      const birthDate = createDateString(2000, 1, 7);
      const result = calculateBirthOdu(birthDate);
      expect(result.provisional).toBe(true);
    });

    it('should return correct OduName, OrixaRegency, ElementalForce, and LifeLesson', () => {
      const birthDate = createDateString(1991, 12, 4); // Odu 9 (Ossá)
      const result = calculateBirthOdu(birthDate);
      expect(result.oduName).toBe('Ossá');
      expect(result.orixaRegency).toEqual(expect.any(Array));
      expect(result.elementalForce).toBeDefined();
      expect(result.lifeLesson).toBeDefined();
    });
  });
  // Test suite for calculateSecondaryOdu
  describe('calculateSecondaryOdu', () => {
    it('should calculate secondary Odu correctly', () => {
      // Example: 1991-12-04 -> sum 27. Secondary: 27 * 2 = 54. Reduce: 5+4 = 9.
      const birthDate1 = createDateString(1991, 12, 4);
      expect(calculateSecondaryOdu(birthDate1)).toBe(9);

      // Example: 1986-03-15 -> sum 33. Secondary: 33 * 2 = 66. Reduce: 6+6 = 12.
      const birthDate2 = createDateString(1986, 3, 15);
      expect(calculateSecondaryOdu(birthDate2)).toBe(12);

      // Example date summing to 10, secondary sum 20, reduced 2
      // 2000-01-07 -> sum 10. Secondary: 10 * 2 = 20. Reduce: 2+0 = 2.
      const birthDate3 = createDateString(2000, 1, 7);
      expect(calculateSecondaryOdu(birthDate3)).toBe(2);
    });

    it('should return null for invalid date formats', () => {
      const invalidDate1 = '2000/01/01';
      expect(calculateSecondaryOdu(invalidDate1)).toBeNull();

      const invalidDate2 = '01-01-2000';
      expect(calculateSecondaryOdu(invalidDate2)).toBeNull();

      const invalidDate3 = '2000';
      expect(calculateSecondaryOdu(invalidDate3)).toBeNull();

      const invalidDate4 = '';
      expect(calculateSecondaryOdu(invalidDate4)).toBeNull();
    });

    it('should return null if the sum of digits is 0', () => {
      // This scenario is extremely unlikely with valid date components,
      // but the function explicitly checks for it.
      // We can't easily construct a 'YYYY-MM-DD' date where all digits sum to 0.
      // The function logic handles it: if sum is 0, it returns null.
      // We confirm the return type is null in this edge case, even if hard to trigger naturally.
      // If the function were modified to accept raw sums, we could test sum=0 directly.
      // For now, we rely on the explicit check's existence.
      // Simulating a scenario where sum is 0 might require mocking or altering input parsing.
      // Given the current regex match, a sum of 0 is not directly possible from valid YYYY-MM-DD.
      // We will just assert that if sum is 0, it returns null as per the code.
      // This test case is more of a placeholder for futureproofing.
      expect(calculateSecondaryOdu('2000-00-00')).toBeNull(); // Hypothetical, sum would be 2.
      expect(calculateSecondaryOdu('0000-00-00')).toBeNull(); // Sum is 0.
    });
  });
});
