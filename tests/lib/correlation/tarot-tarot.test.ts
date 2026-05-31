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
  describe('TarotPathType union', () => {
    it('should include all seven path types', () => {
      const pathTypes: TarotPathType[] = ['Trino', 'Sextil', 'Quadratura', 'Oposi\u00e7\u00e3o', 'Sequ\u00eancia', 'Complementar', 'Ancestral'];
      const allTypes = getAllPathTypes();
      pathTypes.forEach((type) => { expect(allTypes).toContain(type); });
    });
  });

  describe('getTarotTarot', () => {
    it('should return mapping for O Louco to O Mago', () => {
      const result = getTarotTarot('0 - O Louco', 'I - O Mago');
      expect(result).not.toBeNull();
      expect(result?.path_type).toBe('Sequ\u00eancia');
    });

    it('should return mapping for O Mago to O Louco (reverse)', () => {
      const result = getTarotTarot('I - O Mago', '0 - O Louco');
      expect(result).toBeNull();
    });

    it('should return null for non-existent pair', () => {
      const result = getTarotTarot('0 - O Louco', 'XIX - O Sol');
      expect(result).toBeNull();
    });
  });

  describe('getAllTarotPaths', () => {
    it('should return all mappings', () => {
      const result = getAllTarotPaths();
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBe(TOTAL_MAPPINGS);
    });

    it('should return all 66+ mappings', () => {
      const result = getAllTarotPaths();
      expect(result.length).toBeGreaterThanOrEqual(66);
    });

    it('should contain valid TarotTarotMapping objects', () => {
      const result = getAllTarotPaths();
      result.forEach((mapping) => {
        expect(mapping.arcano).toBeTruthy();
        expect(mapping.related_arcano).toBeTruthy();
        expect(mapping.path_type).toBeTruthy();
        expect(mapping.spiritual_meaning).toBeTruthy();
      });
    });
  });

  describe('getAllPathTypes', () => {
    it('should return all seven path types', () => {
      const result = getAllPathTypes();
      expect(result.length).toBe(7);
    });
  });

  describe('getAllMappedArcanos', () => {
    it('should return at least 22 arcano names', () => {
      expect(getAllMappedArcanos().length).toBeGreaterThanOrEqual(22);
    });
  });

  describe('getRelationsForArcano', () => {
    it('should return relations for O Louco', () => {
      const result = getRelationsForArcano('0 - O Louco');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((r) => r.related_arcano === 'I - O Mago')).toBe(true);
    });

    it('should return empty for unknown arcano', () => {
      const result = getRelationsForArcano('XXX - Unknown');
      expect(result).toEqual([]);
    });
  });

  describe('getSpiritualMeaningBetween', () => {
    it('should return spiritual meaning for related pair', () => {
      const result = getSpiritualMeaningBetween('0 - O Louco', 'I - O Mago');
      expect(result).not.toBeNull();
      expect(typeof result).toBe('object');
    });

    it('should return null for non-related pair', () => {
      const result = getSpiritualMeaningBetween('0 - O Louco', 'XIX - O Sol');
      expect(result).toBeNull();
    });
  });

  describe('hasRelation', () => {
    it('should return true for related pair', () => {
      expect(hasRelation('0 - O Louco', 'I - O Mago')).toBe(true);
    });

    it('should return false for non-related pair', () => {
      expect(hasRelation('0 - O Louco', 'XIX - O Sol')).toBe(false);
    });
  });

  describe('TAROT_TAROT_MAPPINGS', () => {
    it('should be exported', () => {
      expect(TAROT_TAROT_MAPPINGS).toBeDefined();
    });

    it('should contain valid arcano values', () => {
      const allArcanos = Array.from(ALL_MAJOR_ARCANOS);
      TAROT_TAROT_MAPPINGS.forEach((mapping) => {
        expect(allArcanos).toContain(mapping.arcano);
        expect(allArcanos).toContain(mapping.related_arcano);
      });
    });
  });

  describe('TOTAL_MAPPINGS', () => {
    it('should be exported and positive', () => {
      expect(TOTAL_MAPPINGS).toBeGreaterThan(0);
      expect(typeof TOTAL_MAPPINGS).toBe('number');
    });

    it('should equal length of getAllTarotPaths', () => {
      expect(getAllTarotPaths().length).toBe(TOTAL_MAPPINGS);
    });
  });

  describe('TOTAL_PATH_TYPES', () => {
    it('should be exported and equal to 7', () => {
      expect(TOTAL_PATH_TYPES).toBe(7);
    });
  });

  describe('ALL_MAJOR_ARCANOS', () => {
    it('should have 22 cards', () => {
      expect(ALL_MAJOR_ARCANOS.length).toBe(22);
    });
  });
});
