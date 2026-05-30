import { describe, it, expect } from 'vitest';
import { getData } from '@/lib/chakra/v4/chakra-v4-data';

describe('chakra/v4-data', () => {
  describe('getData', () => {
    it('returns array of 7 chakras', () => {
      const chakras = getData();
      expect(chakras).toHaveLength(7);
    });

    it('each chakra has v4 features', () => {
      const chakras = getData();
      for (const chakra of chakras) {
        expect(chakra.v4Features).toBeDefined();
        expect(chakra.v4Features.energyFlow).toBeDefined();
        expect(chakra.v4Features.meditationStages).toBeDefined();
        expect(chakra.v4Features.sacredGeometry).toBeDefined();
      }
    });

    it('first chakra is Muladhara (root) - v4', () => {
      const root = getData()[0];
      expect(root.name).toBe('Muladhara');
      expect(root.element).toBe('Terra');
      expect(root.color).toBe('Vermelho');
      expect(root.id).toBe('root');
    });

    it('seventh chakra is Sahasrara (crown) - v4', () => {
      const crown = getData()[6];
      expect(crown.name).toBe('Sahasrara');
      expect(crown.sequence).toBe(7);
    });

    it('each chakra has yantras for meditation', () => {
      const chakras = getData();
      for (const chakra of chakras) {
        expect(Array.isArray(chakra.v4Features.yantras)).toBe(true);
        expect(chakra.v4Features.yantras.length).toBeGreaterThan(0);
      }
    });

    it('each chakra has healing techniques', () => {
      const chakras = getData();
      for (const chakra of chakras) {
        expect(Array.isArray(chakra.v4Features.healingTechniques)).toBe(true);
      }
    });

    it('each chakra has counterBalance', () => {
      const chakras = getData();
      for (const chakra of chakras) {
        expect(typeof chakra.v4Features.counterBalance).toBe('string');
      }
    });
  });

  describe('chakra sequence integrity', () => {
    it('sequence numbers are 1-7', () => {
      const chakras = getData();
      const sequences = chakras.map(c => c.sequence).sort((a, b) => a - b);
      expect(sequences).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it('sequence index matches sequence-1', () => {
      const chakras = getData();
      chakras.forEach((chakra, i) => {
        expect(chakra.sequence).toBe(i + 1);
      });
    });
  });

  describe('chakra v4Features - energy flow', () => {
    it('each chakra has energyFlow array', () => {
      const chakras = getData();
      for (const chakra of chakras) {
        expect(Array.isArray(chakra.v4Features.energyFlow)).toBe(true);
        expect(chakra.v4Features.energyFlow.length).toBeGreaterThan(0);
      }
    });
  });

  describe('chakra v4 - element progression', () => {
    it('first chakra is Terra, last is not Terra', () => {
      const root = getData()[0];
      const crown = getData()[6];
      expect(root.element).toBe('Terra');
      expect(crown.element).not.toBe('Terra');
    });
  });
});
