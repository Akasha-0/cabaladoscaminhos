/**
 * Unit Tests for @akasha/core-odus odu-birth module
 *
 * Covers:
 * - calculateBirthOdu() — happy path and invalid-format edge case
 *
 * Algorithm (YYYYMMDD all 8 digits):
 *   1991-12-04 → 1+9+9+1+1+2+0+4 = 27 → 2+7 = 9  → Odu 9 (Ossá)
 *   1986-03-15 → 1+9+8+6+0+3+1+5 = 33 → 3+3 = 6  → Odu 6 (Obará)
 */

import { describe, it, expect } from 'vitest';
import { calculateBirthOdu } from '@akasha/core-odus';

describe('calculateBirthOdu', () => {
  // ─── HAPPY PATH ────────────────────────────────────────────────────────────

  describe('happy path', () => {
    it('computes odu 9 for 1991-12-04 (digit sum 27 → 2+7=9)', () => {
      const result = calculateBirthOdu('1991-12-04');
      expect(result.oduNumber).toBe(9);
      expect(result.oduName).toBe('Ossá');
    });

    it('computes odu 6 for 1986-03-15 (digit sum 33 → 3+3=6)', () => {
      const result = calculateBirthOdu('1986-03-15');
      expect(result.oduNumber).toBe(6);
      expect(result.oduName).toBe('Obará');
    });

    it('includes orixaRegency as an array', () => {
      const result = calculateBirthOdu('1991-12-04');
      expect(Array.isArray(result.orixaRegency)).toBe(true);
      expect(result.orixaRegency.length).toBeGreaterThan(0);
    });

    it('includes elementalForce string', () => {
      const result = calculateBirthOdu('1991-12-04');
      expect(typeof result.elementalForce).toBe('string');
      expect(result.elementalForce.length).toBeGreaterThan(0);
    });

    it('includes lifeLesson string', () => {
      const result = calculateBirthOdu('1991-12-04');
      expect(typeof result.lifeLesson).toBe('string');
      expect(result.lifeLesson.length).toBeGreaterThan(0);
    });

    it('returns provisional flag set to true', () => {
      const result = calculateBirthOdu('1991-12-04');
      expect(result.provisional).toBe(true);
    });

    it('produces consistent results for the same date', () => {
      const a = calculateBirthOdu('1986-03-15');
      const b = calculateBirthOdu('1986-03-15');
      expect(a.oduNumber).toBe(b.oduNumber);
      expect(a.oduName).toBe(b.oduName);
    });

    it('produces odu within 1-16 range for various dates', () => {
      const dates = [
        '1970-01-01',
        '2000-06-15',
        '2010-12-31',
        '1995-07-20',
        '1988-04-10',
      ];
      for (const date of dates) {
        const result = calculateBirthOdu(date);
        expect(result.oduNumber).toBeGreaterThanOrEqual(1);
        expect(result.oduNumber).toBeLessThanOrEqual(16);
      }
    });
  });

  // ─── EDGE CASES ────────────────────────────────────────────────────────────

  describe('invalid format edge case', () => {
    it('returns default OduBirth when birthDate format is invalid', () => {
      const result = calculateBirthOdu('not-a-date');
      expect(result.oduNumber).toBe(1);
      expect(result.oduName).toBe('Ogbe');
      expect(result.orixaRegency).toEqual(['Oxalá']);
      expect(result.elementalForce).toBe('Luz, criação, autoridade divina');
      expect(result.lifeLesson).toBe('Cultivar a paciência e honrar a criação.');
      expect(result.provisional).toBe(true);
    });

    it('returns default OduBirth for empty string', () => {
      const result = calculateBirthOdu('');
      expect(result.oduNumber).toBe(1);
      expect(result.oduName).toBe('Ogbe');
    });

    it('returns default OduBirth for partial date string', () => {
      const result = calculateBirthOdu('1991-12');
      expect(result.oduNumber).toBe(1);
      expect(result.oduName).toBe('Ogbe');
    });
  });
});
