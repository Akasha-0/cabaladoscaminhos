/**
 * @akasha/core-iching — Testes para práticas de cromoterapia
 */

import { describe, it, expect } from 'vitest';
import { CROMOTERAPIA_PRACTICES } from './practices-cromoterapia';
import type { IntegrativePractice } from './types';

describe('practices-cromoterapia', () => {
  describe('CROMOTERAPIA_PRACTICES', () => {
    it('should export a non-empty array', () => {
      expect(Array.isArray(CROMOTERAPIA_PRACTICES)).toBe(true);
      expect(CROMOTERAPIA_PRACTICES.length).toBeGreaterThan(0);
    });

    it('should have valid IntegrativePractice structure', () => {
      const practice = CROMOTERAPIA_PRACTICES[0];
      
      expect(practice).toHaveProperty('id');
      expect(practice).toHaveProperty('name');
      expect(practice).toHaveProperty('tradition', 'Cromoterapia');
      expect(practice).toHaveProperty('category', 'cromoterapia');
      expect(practice).toHaveProperty('associations');
      expect(practice).toHaveProperty('lifeAreas');
      expect(practice).toHaveProperty('howTo');
      expect(practice).toHaveProperty('frequency');
      expect(practice).toHaveProperty('isSafe');
    });

    it('should have correct color associations', () => {
      const colors = CROMOTERAPIA_PRACTICES.map(p => p.associations.color);
      
      expect(colors).toContain('amarelo');
      expect(colors).toContain('azul');
      expect(colors).toContain('verde');
      expect(colors).toContain('vermelho');
    });

    it('should have valid hexagrams in range 1-64', () => {
      const allHexagrams = CROMOTERAPIA_PRACTICES.flatMap(
        p => p.associations.hexagrams ?? []
      );
      
      allHexagrams.forEach(hex => {
        expect(hex).toBeGreaterThanOrEqual(1);
        expect(hex).toBeLessThanOrEqual(64);
      });
    });

    it('should have valid chakra numbers (1-7)', () => {
      const chakras = CROMOTERAPIA_PRACTICES.map(
        p => p.associations.chakra
      ).filter((c): c is number => c !== undefined);
      
      chakras.forEach(chakra => {
        expect(chakra).toBeGreaterThanOrEqual(1);
        expect(chakra).toBeLessThanOrEqual(7);
      });
    });

    // Edge case: empty array scenario
    it('should contain practices with non-empty lifeAreas', () => {
      CROMOTERAPIA_PRACTICES.forEach(practice => {
        expect(practice.lifeAreas.length).toBeGreaterThan(0);
      });
    });

    // Edge case: safety validation
    it('should have all practices marked as safe', () => {
      const unsafePractices = CROMOTERAPIA_PRACTICES.filter(p => !p.isSafe);
      expect(unsafePractices).toHaveLength(0);
    });

    // Edge case: unique IDs
    it('should have unique practice IDs', () => {
      const ids = CROMOTERAPIA_PRACTICES.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
