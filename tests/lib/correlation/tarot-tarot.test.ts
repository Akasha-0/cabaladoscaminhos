import { describe, it, expect } from 'vitest';
import { getTarotTarot, getAllTarotPaths, getAllPathTypes, getPathsByType, hasPath, TAROT_TAROT_MAPPINGS } from '@/lib/correlation/tarot-tarot';

describe('tarot-tarot', () => {
  describe('getTarotTarot', () => {
    it('returns mapping for O Louco', () => {
      const r = getTarotTarot('O Louco');
      expect(r).toBeDefined();
      expect(r?.arcano).toBe('O Louco');
      expect(r?.numero_carta).toBe(0);
      expect(r?.related_arcano).toBe('O Mago');
    });
    it('returns mapping for O Sol', () => {
      const r = getTarotTarot('O Sol');
      expect(r).toBeDefined();
      expect(r?.numero_carta).toBe(19);
    });
    it('returns null for unknown', () => {
      expect(getTarotTarot('x')).toBeNull();
    });
  });

  describe('getAllTarotPaths', () => {
    it('returns sorted array', () => {
      const r = getAllTarotPaths();
      expect(Array.isArray(r)).toBe(true);
      expect(r.length).toBe(22);
    });
  });

  describe('getAllPathTypes', () => {
    it('returns path types', () => {
      const r = getAllPathTypes();
      expect(r).toContain('diagonal');
      expect(r).toContain('horizontal');
      expect(r).toContain('vertical');
    });
  });

  describe('getPathsByType', () => {
    it('returns diagonal paths', () => {
      expect(getPathsByType('diagonal').length).toBeGreaterThan(0);
    });
    it('returns horizontal paths', () => {
      expect(getPathsByType('horizontal').length).toBeGreaterThan(5);
    });
    it('returns vertical paths', () => {
      expect(getPathsByType('vertical').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('hasPath', () => {
    it('finds O Louco -> O Mago', () => {
      expect(hasPath('O Louco', 'O Mago')).toBe(true);
    });
    it('finds reverse', () => {
      expect(hasPath('O Mago', 'O Louco')).toBe(true);
    });
    it('returns false for non-existent', () => {
      expect(hasPath('O Louco', 'O Mundo')).toBe(false);
    });
  });

  describe('TAROT_TAROT_MAPPINGS', () => {
    it('is frozen', () => {
      expect(Object.isFrozen(TAROT_TAROT_MAPPINGS)).toBe(true);
    });
    it('has 22 entries', () => {
      expect(Object.keys(TAROT_TAROT_MAPPINGS).length).toBe(22);
    });
  });
});
