/**
 * Unit Tests for @akasha/core-odus comparison module
 *
 * Covers:
 * - compareOduNumbers() — happy path and edge cases
 */

import { describe, it, expect } from 'vitest';
import { compareOduNumbers } from '@akasha/core-odus';

describe('compareOduNumbers', () => {
  // ─── HAPPY PATH ────────────────────────────────────────────────────────────

  describe('happy path', () => {
    it('returns sameOdu=true when both numbers are identical (odu 1)', () => {
      const result = compareOduNumbers(1, 1);
      expect(result.sameOdu).toBe(true);
      // Score is 0.95 — max achievable (quizilaScore is capped at 0.1, not 0.15)
      expect(result.score).toBeCloseTo(0.95);
      expect(result.recommendation).toContain('Okaran');
    });

    it('returns sameOdu=true when both numbers are identical (odu 9)', () => {
      const result = compareOduNumbers(9, 9);
      expect(result.sameOdu).toBe(true);
      expect(result.score).toBeCloseTo(0.95);
    });

    it('returns sameOdu=false when numbers differ', () => {
      const result = compareOduNumbers(1, 2);
      expect(result.sameOdu).toBe(false);
      expect(result.score).toBeLessThan(1);
      expect(result.score).toBeGreaterThan(0);
    });

    it('returns a recommendation string for different odus', () => {
      const result = compareOduNumbers(1, 2);
      expect(typeof result.recommendation).toBe('string');
      expect(result.recommendation.length).toBeGreaterThan(0);
    });

    it('returns score within [0,1] range for any valid pair', () => {
      const result = compareOduNumbers(1, 16);
      expect(result.sameOdu).toBe(false);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('returns alta compatibility recommendation for same odu', () => {
      const result = compareOduNumbers(1, 1);
      expect(result.recommendation).toContain('alta compatibilidade');
    });
  });

  // ─── EDGE CASES ───────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('returns out-of-range error when numeroA is below 1', () => {
      const result = compareOduNumbers(0, 5);
      expect(result.sameOdu).toBe(false);
      expect(result.score).toBe(0);
      expect(result.recommendation).toBe('Odu fora do alcance válido (1-16).');
    });

    it('returns out-of-range error when numeroB is above 16', () => {
      const result = compareOduNumbers(3, 17);
      expect(result.sameOdu).toBe(false);
      expect(result.score).toBe(0);
      expect(result.recommendation).toBe('Odu fora do alcance válido (1-16).');
    });

    it('returns out-of-range error when both numbers are out of range', () => {
      const result = compareOduNumbers(99, 100);
      expect(result.sameOdu).toBe(false);
      expect(result.score).toBe(0);
      expect(result.recommendation).toBe('Odu fora do alcance válido (1-16).');
    });

    it('handles boundary value 16 correctly', () => {
      const result = compareOduNumbers(16, 16);
      expect(result.sameOdu).toBe(true);
      expect(result.score).toBeCloseTo(0.95);
    });

    it('returns out-of-range error when numero is 0', () => {
      const result = compareOduNumbers(0, 1);
      expect(result.recommendation).toBe('Odu fora do alcance válido (1-16).');
    });
  });
});
