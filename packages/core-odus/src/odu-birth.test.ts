// Test suite for du-birth.ts
import { describe, it, expect } from 'vitest';
import { calculateBirthOdu } from './odu-birth';

// Helper to create a date string in YYYY-MM-DD format
const createDateString = (year: number, month: number, day: number): string => {
  const paddedMonth = String(month).padStart(2, '0');
  const paddedDay = String(day).padStart(2, '0');
  return `${year}-${paddedMonth}-${paddedDay}`;
};

describe('ODUS Calculation Logic', () => {
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
});
