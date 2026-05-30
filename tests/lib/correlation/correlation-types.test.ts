import { describe, it, expect } from 'vitest';
import {
  ODU_TAROT_CORRELATIONS,
  getOduCorrelations,
  type OduCorrelation,
} from '@/lib/correlation/correlation-types';

describe('correlation/correlation-types', () => {
  describe('ODU_TAROT_CORRELATIONS constant', () => {
    it('has 21 entries for odu numbers 1-21', () => {
      expect(Object.keys(ODU_TAROT_CORRELATIONS)).toHaveLength(21);
    });

    it('maps odu 1 to O Mago', () => {
      expect(ODU_TAROT_CORRELATIONS[1]).toBe('O Mago');
    });

    it('maps odu 21 to O Mundo', () => {
      expect(ODU_TAROT_CORRELATIONS[21]).toBe('O Mundo');
    });

    it('contains expected Major Arcana cards', () => {
      expect(ODU_TAROT_CORRELATIONS[1]).toBe('O Mago');
      expect(ODU_TAROT_CORRELATIONS[7]).toBe('O Carro');
      expect(ODU_TAROT_CORRELATIONS[19]).toBe('O Sol');
    });
  });

  describe('getOduCorrelations', () => {
    it('returns correlation for valid odu number', () => {
      const result = getOduCorrelations(1);
      expect(result.tarot).toBe('O Mago');
      expect(result.arcanoNumber).toBe(1);
    });

    it('returns arcanoNumber matching input', () => {
      const result = getOduCorrelations(10);
      expect(result.arcanoNumber).toBe(10);
    });

    it('returns Desconhecido for invalid odu number', () => {
      const result = getOduCorrelations(99);
      expect(result.tarot).toBe('Desconhecido');
    });

    it('returns OduCorrelation interface shape', () => {
      const result = getOduCorrelations(5);
      expect(result).toHaveProperty('tarot');
      expect(result).toHaveProperty('arcanoNumber');
      expect(result).toHaveProperty('orixas');
      expect(result).toHaveProperty('elementos');
      expect(result).toHaveProperty('affirmation');
    });

    it('returns arrays for orixas and elementos', () => {
      const result = getOduCorrelations(1);
      expect(Array.isArray(result.orixas)).toBe(true);
      expect(Array.isArray(result.elementos)).toBe(true);
    });

    it('returns string for affirmation', () => {
      const result = getOduCorrelations(1);
      expect(typeof result.affirmation).toBe('string');
    });

    it('handles boundary odu numbers', () => {
      const resultMin = getOduCorrelations(1);
      expect(resultMin.tarot).toBe('O Mago');
      const resultMax = getOduCorrelations(21);
      expect(resultMax.tarot).toBe('O Mundo');
    });

    it('returns same orixas array for all odus', () => {
      const result = getOduCorrelations(5);
      expect(result.orixas).toEqual(['Oxalá']);
    });

    it('returns same elementos array for all odus', () => {
      const result = getOduCorrelations(5);
      expect(result.elementos).toEqual(['Ar']);
    });
  });
});
