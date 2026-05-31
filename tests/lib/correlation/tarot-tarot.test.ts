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
  TAROT_TAROT_MAPPINGS,
  ALL_MAJOR_ARCANOS,
  TOTAL_MAPPINGS,
  TOTAL_PATH_TYPES,
} from '@/lib/correlation/tarot-tarot';

describe('Tarot-Tarot Correlation', () => {
  describe('getTarotTarot', () => {
    it('should return mappings for O Louco', () => {
      const result = getTarotTarot('O Louco');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown arcano', () => {
      const result = getTarotTarot('NonExistent');
      expect(result).toEqual([]);
    });
  });

  describe('getAllTarotPaths', () => {
    it('should return all mappings', () => {
      const result = getAllTarotPaths();
      expect(result.length).toBeGreaterThan(20);
    });
  });

  describe('getAllPathTypes', () => {
    it('should return all path types', () => {
      const result = getAllPathTypes();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getAllMappedArcanos', () => {
    it('should return all mapped arcano names', () => {
      const result = getAllMappedArcanos();
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('O Louco');
      expect(result).toContain('O Mundo');
    });
  });

  describe('getRelationsForArcano', () => {
    it('should return relations for O Louco', () => {
      const result = getRelationsForArcano('O Louco');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty for non-existent arcano', () => {
      const result = getRelationsForArcano('NonExistent');
      expect(result).toEqual([]);
    });
  });

  describe('getRelationsByPathType', () => {
    it('should return relations for sequential type', () => {
      const result = getRelationsByPathType('sequential');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return relations for tree_path type', () => {
      const result = getRelationsByPathType('tree_path');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getPathTypeBetween', () => {
    it('should return path type for related pair', () => {
      const result = getPathTypeBetween('O Louco', 'O Mago');
      expect(result).toBeTruthy();
    });
  });

  describe('getSpiritualMeaningBetween', () => {
    it('should return meaning for related pair', () => {
      const result = getSpiritualMeaningBetween('O Louco', 'O Mago');
      expect(result).toBeTruthy();
    });
  });

  describe('hasRelation', () => {
    it('should return true for related pair', () => {
      const result = hasRelation('O Louco', 'O Mago');
      expect(result).toBe(true);
    });
  });

  describe('getArcanoByNumber', () => {
    it('should return arcano for valid number', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('should return null for invalid number', () => {
      expect(getArcanoByNumber(-1)).toBeNull();
      expect(getArcanoByNumber(22)).toBeNull();
    });
  });

  describe('TAROT_TAROT_MAPPINGS', () => {
    it('should have valid mappings', () => {
      expect(TAROT_TAROT_MAPPINGS.length).toBeGreaterThan(0);
    });

    it('should have valid arcano values', () => {
      TAROT_TAROT_MAPPINGS.forEach((mapping) => {
        expect(mapping.arcano).toBeTruthy();
        expect(mapping.related_arcano).toBeTruthy();
      });
    });

    it('should have valid path types', () => {
      TAROT_TAROT_MAPPINGS.forEach((mapping) => {
        expect(['sequential', 'tree_path', 'archetypal']).toContain(mapping.path_type);
      });
    });
  });

  describe('TOTAL_MAPPINGS and TOTAL_PATH_TYPES', () => {
    it('should have correct total values', () => {
      expect(TOTAL_MAPPINGS).toBe(TAROT_TAROT_MAPPINGS.length);
      expect(TOTAL_PATH_TYPES).toBe(getAllPathTypes().length);
    });
  });
});
