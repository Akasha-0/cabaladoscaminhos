import { describe, it, expect } from 'vitest';
import {
  getTarotNumerology,
  getAllTarotNumerology,
  TAROT_NUMEROLOGY_MAPPINGS,
  type TarotNumerologyMapping,
} from '@/lib/correlation/tarot-numerology';

describe('tarot-numerology', () => {
  describe('getTarotNumerology', () => {
    it('returns mapping for valid arcano', () => {
      const result = getTarotNumerology('O Louco');
      expect(result).toBeDefined();
      expect(result?.numero_carta).toBe(0);
    });

    it('returns null for invalid arcano', () => {
      const result = getTarotNumerology('Invalid');
      expect(result).toBeNull();
    });
  });

  describe('getAllTarotNumerology', () => {
    it('returns array of mappings', () => {
      const result = getAllTarotNumerology();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
