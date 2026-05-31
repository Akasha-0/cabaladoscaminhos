/**
 * Tarot-Tarot Correlation Tests
 */

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
  TOTAL_MAPPINGS,
  TOTAL_PATH_TYPES,
  ALL_MAJOR_ARCANOS,
  TarotPathType,
} from '@/lib/correlation/tarot-tarot';

describe('Tarot-Tarot Correlation', () => {
  describe('TarotPathType union', () => {
    it('should include all path types', () => {
      const allTypes = getAllPathTypes();
      expect(allTypes.length).toBeGreaterThan(0);
    });
  });

  describe('getTarotTarot', () => {
    it('should return mappings for O Louco', () => {
      const result = getTarotTarot('O Louco');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown arcano', () => {
      const result = getTarotTarot('Unknown Arcano');
      expect(result).toEqual([]);
    });
  });

  describe('getAllTarotPaths', () => {
    it('should return all mappings', () => {
      const result = getAllTarotPaths();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return mappings with required properties', () => {
      const result = getAllTarotPaths();
      expect(result[0]).toHaveProperty('arcano');
      expect(result[0]).toHaveProperty('related_arcano');
      expect(result[0]).toHaveProperty('path_type');
    });
  });

  describe('getAllPathTypes', () => {
    it('should return path types', () => {
      const result = getAllPathTypes();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toBeTruthy();
    });
  });

  describe('getAllMappedArcanos', () => {
    it('should return arcano names', () => {
      const result = getAllMappedArcanos();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getRelationsForArcano', () => {
    it('should return relations for O Louco', () => {
      expect(getRelationsForArcano('O Louco').length).toBeGreaterThan(0);
    });

    it('should return empty for unknown arcano', () => {
      expect(getRelationsForArcano('Unknown Arcano')).toEqual([]);
    });
  });

  describe('getRelationsByPathType', () => {
    it('should return relations for tree_path type', () => {
      const result = getRelationsByPathType('tree_path');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return relations for sequential type', () => {
      const result = getRelationsByPathType('sequential');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getPathTypeBetween', () => {
    it('should return path type for O Louco and O Mago', () => {
      const result = getPathTypeBetween('O Louco', 'O Mago');
      expect(result).toBeTruthy();
    });

    it('should return null for non-existent pair', () => {
      expect(getPathTypeBetween('O Louco', 'O Sol')).toBeNull();
    });

    it('should work in reverse order', () => {
      const result = getPathTypeBetween('O Mago', 'O Louco');
      expect(result).toBeTruthy();
    });
  });

  describe('getSpiritualMeaningBetween', () => {
    it('should return spiritual meaning for O Louco and O Mago', () => {
      const result = getSpiritualMeaningBetween('O Louco', 'O Mago');
      expect(result).toBeTruthy();
    });

    it('should return null for non-existent pair', () => {
      expect(getSpiritualMeaningBetween('O Louco', 'O Sol')).toBeNull();
    });
  });

  describe('hasRelation', () => {
    it('should return true for related pair', () => {
      expect(hasRelation('O Louco', 'O Mago')).toBe(true);
    });

    it('should return false for non-related pair', () => {
      expect(hasRelation('O Louco', 'O Sol')).toBe(false);
    });
  });

  describe('getArcanoByNumber', () => {
    it('should return O Louco for number 0', () => {
      expect(getArcanoByNumber(0)).toBe('0 - O Louco');
    });

    it('should return O Mundo for number 21', () => {
      expect(getArcanoByNumber(21)).toBe('XXI - O Mundo');
    });

    it('should return null for out of range number', () => {
      expect(getArcanoByNumber(-1)).toBeNull();
      expect(getArcanoByNumber(22)).toBeNull();
    });
  });

  describe('TAROT_TAROT_MAPPINGS', () => {
    it('should be exported', () => {
      expect(TAROT_TAROT_MAPPINGS).toBeDefined();
    });

    it('should have valid arcano values', () => {
      TAROT_TAROT_MAPPINGS.forEach((mapping) => {
        expect(typeof mapping.arcano).toBe('string');
        expect(typeof mapping.related_arcano).toBe('string');
      });
    });

    it('should have spiritual_meaning', () => {
      TAROT_TAROT_MAPPINGS.forEach((mapping) => {
        expect(typeof mapping.spiritual_meaning).toBe('string');
      });
    });
  });

  describe('TOTAL_MAPPINGS', () => {
    it('should be exported and positive', () => {
      expect(TOTAL_MAPPINGS).toBeDefined();
      expect(TOTAL_MAPPINGS).toBeGreaterThan(0);
    });

    it('should equal length of getAllTarotPaths', () => {
      expect(TOTAL_MAPPINGS).toBe(getAllTarotPaths().length);
    });
  });

  describe('TOTAL_PATH_TYPES', () => {
    it('should be exported and positive', () => {
      expect(TOTAL_PATH_TYPES).toBeDefined();
      expect(TOTAL_PATH_TYPES).toBeGreaterThan(0);
    });
  });

  describe('ALL_MAJOR_ARCANOS', () => {
    it('should have 22 cards', () => {
      expect(ALL_MAJOR_ARCANOS.length).toBe(22);
    });

    it('should start with O Louco', () => {
      expect(ALL_MAJOR_ARCANOS[0]).toBe('0 - O Louco');
    });

    it('should end with O Mundo', () => {
      expect(ALL_MAJOR_ARCANOS[21]).toBe('XXI - O Mundo');
    });
  });

  describe('default export', () => {
    it('should be exported', () => {
      const m = require('@/lib/correlation/tarot-tarot');
      expect(m.getTarotTarot).toBeDefined();
      expect(m.getAllTarotPaths).toBeDefined();
      expect(m.getAllPathTypes).toBeDefined();
    });
  });
});