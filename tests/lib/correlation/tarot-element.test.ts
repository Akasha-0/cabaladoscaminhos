/**
 * Tests for Tarot-Element Spiritual Correlation Module
 * Validates the mapping between Tarot Major Arcana cards and elements
 */

import { describe, it, expect } from 'vitest';
import {
  getNumerologyTarot,
  getTarotNumerology,
  getAllNumerologyTarots,
  hasNumerologyTarot,
  getMappingByArcano,
  getNumerologyByElement,
  getNumerologyByOrixa,
  getNumerologyBySephirah,
  getNumerologyByChakra,
  NUMEROLOGIA_ARCANO_MAP,
  type NumerologyTarotMapping,
} from '@/lib/correlation/numerology-tarot';

describe('numerology-tarot', () => {
  // ─── getNumerologyTarot: valid numbers ──────────────────────────────────────

  describe('getNumerologyTarot', () => {
    it('returns mapping for number 1', () => {
      const result = getNumerologyTarot(1);
      expect(result).toBeDefined();
      expect(result.numero).toBe(1);
      expect(result.arcano).toBe('O Mago');
    });

    it('returns mapping for number 9', () => {
      const result = getNumerologyTarot(9);
      expect(result).toBeDefined();
      expect(result.numero).toBe(9);
      expect(result.arcano).toBe('O Eremita');
    });
  });
});
