import { describe, it, expect } from 'vitest';
import {
  getTarotTarot,
  getAllTarotPaths,
  getAllPathTypes,
  getAllMappedArcanos,
  hasRelation,
  getArcanoByNumber,
  ALL_MAJOR_ARCANOS,
  TAROT_TAROT_MAPPINGS,
  TOTAL_MAPPINGS,
  TOTAL_PATH_TYPES,
} from '@/lib/correlation/tarot-tarot';

describe('tarot-tarot', () => {
  describe('constants', () => {
    it('exports ALL_MAJOR_ARCANOS with 22 cards', () => {
      expect(ALL_MAJOR_ARCANOS).toBeDefined();
      expect(Array.isArray(ALL_MAJOR_ARCANOS)).toBe(true);
      expect(ALL_MAJOR_ARCANOS.length).toBe(22);
    });

    it('has correct first and last arcano', () => {
      expect(ALL_MAJOR_ARCANOS[0]).toBe('0 - O Louco');
      expect(ALL_MAJOR_ARCANOS[21]).toBe('XXI - O Mundo');
    });

    it('exports TOTAL_MAPPINGS', () => {
      expect(TOTAL_MAPPINGS).toBe(22);
    });

    it('exports TOTAL_PATH_TYPES', () => {
      expect(TOTAL_PATH_TYPES).toBe(2);
    });

    it('TAROT_TAROT_MAPPINGS length matches TOTAL_MAPPINGS', () => {
      expect(TAROT_TAROT_MAPPINGS.length).toBe(TOTAL_MAPPINGS);
    });
  });

  describe('getTarotTarot', () => {
    it('returns array of mappings for O Louco', () => {
      const result = getTarotTarot('0 - O Louco');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown arcano', () => {
      const result = getTarotTarot('inexistente');
      expect(result).toEqual([]);
    });

    it('mappings have required fields', () => {
      const result = getTarotTarot('0 - O Louco');
      result.forEach((m) => {
        expect(m.arcano).toBeDefined();
        expect(m.related_arcano).toBeDefined();
        expect(m.path_type).toBeDefined();
        expect(m.spiritual_meaning).toBeDefined();
      });
    });
  });

  describe('getAllTarotPaths', () => {
    it('returns array of all mappings', () => {
      const result = getAllTarotPaths();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(TOTAL_MAPPINGS);
    });
  });

  describe('getAllPathTypes', () => {
    it('returns array of path types', () => {
      const result = getAllPathTypes();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(TOTAL_PATH_TYPES);
    });

    it('contains expected path types', () => {
      const result = getAllPathTypes();
      expect(result).toContain('Sequência');
      expect(result).toContain('Ancestral');
    });
  });

  describe('getAllMappedArcanos', () => {
    it('returns array of unique arcanos', () => {
      const result = getAllMappedArcanos();
      expect(Array.isArray(result)).toBe(true);
    });

    it('contains O Louco and O Mundo', () => {
      const result = getAllMappedArcanos();
      expect(result).toContain('0 - O Louco');
      expect(result).toContain('XXI - O Mundo');
    });
  });

  describe('hasRelation', () => {
    it('returns true for O Louco and O Mago', () => {
      expect(hasRelation('0 - O Louco', 'I - O Mago')).toBe(true);
    });

    it('returns true regardless of order', () => {
      expect(hasRelation('I - O Mago', '0 - O Louco')).toBe(true);
    });

    it('returns false for non-related arcanos', () => {
      expect(hasRelation('0 - O Louco', 'XIX - O Sol')).toBe(false);
    });

    it('returns false for unknown arcanos', () => {
      expect(hasRelation('inexistente', '0 - O Louco')).toBe(false);
    });
  });

  describe('getArcanoByNumber', () => {
    it('returns O Louco for 0', () => {
      expect(getArcanoByNumber(0)).toBe('0 - O Louco');
    });

    it('returns O Mago for 1', () => {
      expect(getArcanoByNumber(1)).toBe('I - O Mago');
    });

    it('returns O Mundo for 21', () => {
      expect(getArcanoByNumber(21)).toBe('XXI - O Mundo');
    });

    it('returns null for invalid numbers', () => {
      expect(getArcanoByNumber(-1)).toBeNull();
      expect(getArcanoByNumber(22)).toBeNull();
    });
  });
});
