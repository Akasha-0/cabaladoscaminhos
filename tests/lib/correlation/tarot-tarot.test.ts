import { describe, it, expect } from 'vitest';
import {
  getTarotTarot,
  getAllTarotPaths,
  getAllPathTypes,
  getAllMappedArcanos,
  getRelationsForArcano,
  getRelationsByPathType,
  getPathTypeBetween,
  getSpiritualMeaningBetween,
  hasRelation,
  getArcanoByNumber,
  ALL_MAJOR_ARCANOS,
  TAROT_TAROT_MAPPINGS,
  TOTAL_MAPPINGS,
  TOTAL_PATH_TYPES,
} from '@/lib/correlation/tarot-tarot';
import type { TarotPathType } from '@/lib/correlation/tarot-tarot';

describe('Tarot-Tarot Correlation', () => {
  describe('TAROT_TAROT_MAPPINGS', () => {
    it('has correct total count', () => {
      expect(TOTAL_MAPPINGS).toBe(62);
      expect(TAROT_TAROT_MAPPINGS.length).toBe(62);
    });

    it('has 7 path types', () => {
      expect(TOTAL_PATH_TYPES).toBe(7);
    });

    it('mappings have required fields', () => {
      for (const mapping of TAROT_TAROT_MAPPINGS) {
        expect(mapping.arcano).toBeDefined();
        expect(mapping.related_arcano).toBeDefined();
        expect(mapping.path_type).toBeDefined();
        expect(mapping.spiritual_meaning).toBeDefined();
      });
    });
  });

  describe('getTarotTarot', () => {
    it('returns mappings for O Louco', () => {
      const result = getTarotTarot('O Louco');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns mappings for O Mago', () => {
      const result = getTarotTarot('O Mago');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown arcano', () => {
      const result = getTarotTarot('Unknown Arcano');
      expect(result).toEqual([]);
    });
  });

  describe('getAllTarotPaths', () => {
    it('returns all mappings', () => {
      const result = getAllTarotPaths();
      expect(result).toBeDefined();
      expect(result.length).toBe(62);
    });
  });

  describe('getAllPathTypes', () => {
    it('returns array of path types', () => {
      const result = getAllPathTypes();
      expect(result).toBeDefined();
      expect(result.length).toBe(7);
    });

    it('contains expected path types', () => {
      const result = getAllPathTypes();
      expect(result).toContain('Sequ\u00eancia');
      expect(result).toContain('Complementar');
      expect(result).toContain('Ancestral');
    });
  });

  describe('getAllMappedArcanos', () => {
    it('contains O Louco', () => {
      expect(getAllMappedArcanos()).toContain('O Louco');
    });

    it('contains O Mundo', () => {
      expect(getAllMappedArcanos()).toContain('O Mundo');
    });
  });

  describe('getRelationsForArcano', () => {
    it('returns relations for O Louco', () => {
      const result = getRelationsForArcano('O Louco');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getRelationsByPathType', () => {
    it('returns mappings for Sequ\u00eancia type', () => {
      const result = getRelationsByPathType('Sequ\u00eancia' as TarotPathType);
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getPathTypeBetween', () => {
    it('returns path type for related pair', () => {
      const result = getPathTypeBetween('O Louco', 'O Mago');
      expect(result).toBeTruthy();
    });

    it('returns path type for reverse pair', () => {
      const result = getPathTypeBetween('O Mago', 'O Louco');
      expect(result).toBeTruthy();
    });
  });

  describe('getSpiritualMeaningBetween', () => {
    it('returns spiritual meaning for related pair', () => {
      const result = getSpiritualMeaningBetween('O Louco', 'O Mago');
      expect(result).toBeTruthy();
    });
  });

  describe('hasRelation', () => {
    it('returns true for related pair', () => {
      expect(hasRelation('O Louco', 'O Mago')).toBe(true);
    });

    it('returns true for reverse pair', () => {
      expect(hasRelation('O Mago', 'O Louco')).toBe(true);
    });
  });

  describe('getArcanoByNumber', () => {
    it('returns O Louco for 0', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
    });

    it('returns O Mundo for 21', () => {
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });
  });

  describe('ALL_MAJOR_ARCANOS', () => {
    it('has 22 cards', () => {
      expect(ALL_MAJOR_ARCANOS.length).toBe(22);
    });
  });
});
