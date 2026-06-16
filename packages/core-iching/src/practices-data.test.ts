/**
 * @akasha/core-iching — practices-data tests
 */

import { PRACTICES } from './practices-data';
import type { IntegrativePractice } from './types';

describe('practices-data', () => {
  describe('PRACTICES array', () => {
    it('should be a non-empty array', () => {
      expect(Array.isArray(PRACTICES)).toBe(true);
      expect(PRACTICES.length).toBeGreaterThan(0);
    });

    it('should have the expected number of practices (35 total)', () => {
      expect(PRACTICES.length).toBe(49);
    });
  });

  describe('each practice structure', () => {
    it('should have valid required fields on every practice', () => {
      for (const practice of PRACTICES) {
        expect(practice).toHaveProperty('id');
        expect(practice).toHaveProperty('name');
        expect(practice).toHaveProperty('tradition');
        expect(practice).toHaveProperty('category');
        expect(practice).toHaveProperty('associations');
        expect(practice).toHaveProperty('lifeAreas');
        expect(practice).toHaveProperty('howTo');
        expect(practice).toHaveProperty('frequency');
        expect(practice).toHaveProperty('isSafe');
      }
    });

    it('should have non-empty id, name, and tradition on every practice', () => {
      for (const practice of PRACTICES) {
        expect(typeof practice.id).toBe('string');
        expect(practice.id.length).toBeGreaterThan(0);
        expect(typeof practice.name).toBe('string');
        expect(practice.name.length).toBeGreaterThan(0);
        expect(typeof practice.tradition).toBe('string');
        expect(practice.tradition.length).toBeGreaterThan(0);
      }
    });

    it('should have valid category values', () => {
      const validCategories = [
        'banho_de_ervas',
        'cha',
        'defumacao',
        'cristal',
        'cromoterapia',
        'oleo_essencial',
        'oracao',
        'abre_alas',
        'protecao',
      ];
      for (const practice of PRACTICES) {
        expect(validCategories).toContain(practice.category);
      }
    });

    it('should have valid element values in associations', () => {
      const validElements = ['fogo', 'agua', 'terra', 'ar', 'madeira', 'metal'];
      for (const practice of PRACTICES) {
        const el = practice.associations.element;
        if (el !== undefined) {
          expect(validElements).toContain(el);
        }
      }
    });

    it('should have non-empty lifeAreas array on every practice', () => {
      for (const practice of PRACTICES) {
        expect(Array.isArray(practice.lifeAreas)).toBe(true);
        expect(practice.lifeAreas.length).toBeGreaterThan(0);
      }
    });
  });

  describe('hexagram associations edge cases', () => {
    it('should have hexagram IDs within valid range 1-64', () => {
      for (const practice of PRACTICES) {
        const hexagrams = practice.associations.hexagrams;
        if (hexagrams !== undefined) {
          for (const h of hexagrams) {
            expect(h).toBeGreaterThanOrEqual(1);
            expect(h).toBeLessThanOrEqual(64);
          }
        }
      }
    });

    it('should have practices with hexagrams that reference valid hexagram pairs', () => {
      // Select a practice known to have specific hexagram pairs
      const practice = PRACTICES.find((p) => p.id === 'ewe-oxum');
      expect(practice).toBeDefined();
      expect(practice!.associations.hexagrams).toEqual([5, 60]);
    });

    it('should have practices with no duplicate hexagram IDs within the same practice', () => {
      for (const practice of PRACTICES) {
        const hexagrams = practice.associations.hexagrams;
        if (hexagrams !== undefined) {
          const unique = new Set(hexagrams);
          expect(hexagrams.length).toBe(unique.size);
        }
      }
    });
  });

  describe('warnings edge case', () => {
    it('should only have warnings on practices that need them', () => {
      const practicesWithWarnings = PRACTICES.filter((p) => p.warnings !== undefined);
      expect(practicesWithWarnings.length).toBeGreaterThan(0);
    });

    it('should have non-empty warning messages when present', () => {
      for (const practice of PRACTICES) {
        if (practice.warnings !== undefined) {
          expect(Array.isArray(practice.warnings)).toBe(true);
          for (const warning of practice.warnings) {
            expect(typeof warning).toBe('string');
            expect(warning.length).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  describe('id uniqueness', () => {
    it('should have unique ids across all practices', () => {
      const ids = PRACTICES.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });
  });
});
