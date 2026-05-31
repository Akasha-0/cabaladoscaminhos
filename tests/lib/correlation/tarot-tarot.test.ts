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

describe('Tarot-Tarot Correlation', () => {
  describe('TAROT_TAROT_MAPPINGS', () => {
    it('is defined', () => {
      expect(TAROT_TAROT_MAPPINGS).toBeDefined();
    });

    it('has correct total count', () => {
      expect(TOTAL_MAPPINGS).toBe(TAROT_TAROT_MAPPINGS.length);
    });

    it('has required fields', () => {
      for (const mapping of TAROT_TAROT_MAPPINGS) {
        expect(mapping.arcano).toBeDefined();
        expect(mapping.related_arcano).toBeDefined();
        expect(mapping.path_type).toBeDefined();
        expect(mapping.spiritual_meaning).toBeDefined();
      }
    });
  });

  describe('getTarotTarot', () => {
    it('returns mapping for related pair', () => {
      const result = getTarotTarot('0 - O Louco', 'I - O Mago');
      expect(result).not.toBeNull();
      expect(result?.path_type).toBeTruthy();
    });

    it('returns null for non-related pair', () => {
      const result = getTarotTarot('0 - O Louco', 'XIX - O Sol');
      expect(result).toBeNull();
    });
  });

  describe('getAllTarotPaths', () => {
    it('returns all mappings', () => {
      const result = getAllTarotPaths();
      expect(result).toBeDefined();
      expect(result.length).toBe(TOTAL_MAPPINGS);
    });
  });

  describe('getAllPathTypes', () => {
    it('returns array of path types', () => {
      const result = getAllPathTypes();
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getAllMappedArcanos', () => {
    it('returns all mapped arcano names', () => {
      const result = getAllMappedArcanos();
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getRelationsForArcano', () => {
    it('returns relations for arcano', () => {
      const result = getRelationsForArcano('O Louco');
      expect(result).toBeDefined();
    });
  });

  describe('getRelationsByPathType', () => {
    it('returns relations by type', () => {
      const result = getRelationsByPathType('Sequência' as any);
      expect(result).toBeDefined();
    });
  });

  describe('getPathTypeBetween', () => {
    it('returns path type for related pair', () => {
      const result = getPathTypeBetween('0 - O Louco', 'I - O Mago');
      expect(result).toBeTruthy();
    });
  });

  describe('getSpiritualMeaningBetween', () => {
    it('returns spiritual meaning for related pair', () => {
      const result = getSpiritualMeaningBetween('0 - O Louco', 'I - O Mago');
      expect(result).toBeTruthy();
    });
  });

  describe('hasRelation', () => {
    it('returns true for related pair', () => {
      expect(hasRelation('0 - O Louco', 'I - O Mago')).toBe(true);
    });
  });

  describe('getArcanoByNumber', () => {
    it('returns arcano for number 0', () => {
      expect(getArcanoByNumber(0)).toBeTruthy();
    });
  });

  describe('ALL_MAJOR_ARCANOS', () => {
    it('has 22 cards', () => {
      expect(ALL_MAJOR_ARCANOS.length).toBe(22);
    });
  });
});
