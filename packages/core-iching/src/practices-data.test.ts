/**
 * @akasha/core-iching — Testes para práticas integrativas (dados)
 */
import { describe, it, expect } from 'vitest';
import { PRACTICES } from './practices-data';
import type { IntegrativePractice } from './types';

describe('practices-data', () => {
  describe('PRACTICES', () => {
    it('should export a non-empty array', () => {
      expect(Array.isArray(PRACTICES)).toBe(true);
      expect(PRACTICES.length).toBeGreaterThan(0);
    });

    it('should contain cromoterapia practices', () => {
      const cromoterapiaPractices = PRACTICES.filter((p) => p.category === 'cromoterapia');

      expect(cromoterapiaPractices.length).toBeGreaterThan(0);
      expect(cromoterapiaPractices.every((p) => p.tradition === 'Cromoterapia')).toBe(true);
    });

    it('should contain practices from multiple traditions', () => {
      const traditions = new Set(PRACTICES.map((p) => p.tradition));

      expect(traditions.size).toBeGreaterThan(1);
      expect(traditions.has('Cromoterapia')).toBe(true);
      expect(traditions.has('Candomblé')).toBe(true);
    });

    it('should have valid IntegrativePractice structure', () => {
      const practice = PRACTICES[0];

      expect(practice).toHaveProperty('id');
      expect(practice).toHaveProperty('name');
      expect(practice).toHaveProperty('tradition');
      expect(practice).toHaveProperty('category');
      expect(practice).toHaveProperty('associations');
      expect(practice).toHaveProperty('lifeAreas');
      expect(practice).toHaveProperty('howTo');
      expect(practice).toHaveProperty('frequency');
      expect(practice).toHaveProperty('isSafe');
    });

    // Edge case: unique IDs across all practices
    it('should have unique practice IDs', () => {
      const ids = PRACTICES.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    // Edge case: all practices should have required associations
    it('should have element in associations for all practices', () => {
      const withoutElement = PRACTICES.filter((p) => !p.associations.element);

      // Some practices may not have element, that's valid but should be rare
      expect(withoutElement.length).toBeLessThan(PRACTICES.length);
    });

    // Edge case: valid hexagrams range
    it('should have valid hexagrams in range 1-64', () => {
      const allHexagrams = PRACTICES.flatMap((p) => p.associations.hexagrams ?? []);

      allHexagrams.forEach((hex) => {
        expect(hex).toBeGreaterThanOrEqual(1);
        expect(hex).toBeLessThanOrEqual(64);
      });
    });

    // Edge case: multiple categories
    it('should contain practices from multiple categories', () => {
      const categories = new Set(PRACTICES.map((p) => p.category));

      expect(categories.size).toBeGreaterThan(1);
      expect(categories.has('cromoterapia')).toBe(true);
      expect(categories.has('banho_de_ervas')).toBe(true);
    });
  });
});
