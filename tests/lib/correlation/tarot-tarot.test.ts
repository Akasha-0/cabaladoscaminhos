/**
 * Tarot-Tarot Correlation Tests
 * Tests for Major Arcana to Major Arcana spiritual mappings
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
} from '@/lib/correlation/tarot-tarot';

describe('Tarot-Tarot Correlation', () => {
  describe('getTarotTarot', () => {
    it('should return mappings for O Louco', () => {
      const result = getTarotTarot('O Louco');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return mappings for O Mago', () => {
      const result = getTarotTarot('O Mago');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty for unknown arcano', () => {
      const result = getTarotTarot('Unknown');
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
      expect(result[0]).toHaveProperty('spiritual_meaning');
      expect(result[0]).toHaveProperty('energy_flow');
    });

    it('should have more than 20 mappings', () => {
      expect(getAllTarotPaths().length).toBeGreaterThan(20);
    });
  });

  describe('getAllPathTypes', () => {
    it('should return path types', () => {
      const result = getAllPathTypes();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should contain tree_path', () => {
      expect(getAllPathTypes()).toContain('tree_path');
    });

    it('should contain sequential', () => {
      expect(getAllPathTypes()).toContain('sequential');
    });
  });

  describe('getAllMappedArcanos', () => {
    it('should return arcano names', () => {
      const result = getAllMappedArcanos();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include O Louco', () => {
      expect(getAllMappedArcanos()).toContain('O Louco');
    });

    it('should include O Mago', () => {
      expect(getAllMappedArcanos()).toContain('O Mago');
    });
  });

  describe('getRelationsForArcano', () => {
    it('should return relations for O Louco', () => {
      expect(getRelationsForArcano('O Louco').length).toBeGreaterThan(0);
    });

    it('should return empty for unknown arcano', () => {
      expect(getRelationsForArcano('Unknown')).toEqual([]);
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

    it('should have spiritual_meaning as string', () => {
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

  describe('Completeness', () => {
    it('should have spiritual_meaning for all mappings', () => {
      getAllTarotPaths().forEach((mapping) => {
        expect(mapping.spiritual_meaning.length).toBeGreaterThan(0);
      });
    });

    it('should have bidirectional energy flow for all mappings', () => {
      getAllTarotPaths().forEach((mapping) => {
        expect(mapping.energy_flow).toBe('bidirectional');
      });
    });
  });
});
