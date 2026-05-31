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
  ALL_MAJOR_ARCANOS,
  TAROT_TAROT_MAPPINGS,
  TOTAL_MAPPINGS,
  TOTAL_PATH_TYPES,
  type TarotTarotMapping,
  type PathType,
} from '@/lib/correlation/tarot-tarot';

describe('Tarot-Tarot Correlation', () => {
  describe('TAROT_TAROT_MAPPINGS', () => {
    it('is defined and not empty', () => {
      expect(TAROT_TAROT_MAPPINGS).toBeDefined();
      expect(TAROT_TAROT_MAPPINGS.length).toBeGreaterThan(0);
    });

    it('has correct total count', () => {
      expect(TOTAL_MAPPINGS).toBe(62);
      expect(TAROT_TAROT_MAPPINGS.length).toBe(62);
    });

    it('has 5 path types', () => {
      expect(TOTAL_PATH_TYPES).toBe(5);
    });

    it('mappings have required fields', () => {
      for (const mapping of TAROT_TAROT_MAPPINGS) {
        expect(mapping.arcano).toBeDefined();
        expect(mapping.numero_carta).toBeDefined();
        expect(mapping.related_arcano).toBeDefined();
        expect(mapping.related_numero).toBeDefined();
        expect(mapping.path_type).toBeDefined();
        expect(mapping.spiritual_meaning).toBeDefined();
        expect(mapping.energy_flow).toBe('bidirectional');
      }
    });
  });

  describe('ALL_MAJOR_ARCANOS', () => {
    it('contains all 22 Major Arcana', () => {
      expect(ALL_MAJOR_ARCANOS.length).toBe(22);
    });

    it('starts with O Louco', () => {
      expect(ALL_MAJOR_ARCANOS[0]).toBe('0 - O Louco');
    });

    it('ends with O Mundo', () => {
      expect(ALL_MAJOR_ARCANOS[21]).toBe('XXI - O Mundo');
    });
  });

  describe('getTarotTarot', () => {
    it('returns mapping for valid pair', () => {
      const result = getTarotTarot('O Louco', 'O Mago');
      expect(result).not.toBeNull();
      expect(result?.path_type).toBe('tree_path');
    });

    it('returns null for invalid pair', () => {
      const result = getTarotTarot('O Louco', 'O Sol');
      expect(result).toBeNull();
    });

    it('handles case insensitivity', () => {
      const result = getTarotTarot('O LOUCO', 'O MAGO');
      expect(result).not.toBeNull();
    });

    it('handles whitespace variations', () => {
      const result = getTarotTarot('  O Louco  ', '  O Mago  ');
      expect(result).not.toBeNull();
    });
  });

  describe('getAllTarotPaths', () => {
    it('returns all mappings', () => {
      const result = getAllTarotPaths();
      expect(result.length).toBe(TOTAL_MAPPINGS);
    });

    it('returns readonly array', () => {
      const result = getAllTarotPaths();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getAllPathTypes', () => {
    it('returns 5 path types', () => {
      const result = getAllPathTypes();
      expect(result.length).toBe(5);
    });

    it('contains all expected path types', () => {
      const result = getAllPathTypes();
      expect(result).toContain('tree_path');
      expect(result).toContain('elemental');
      expect(result).toContain('numerological');
      expect(result).toContain('archetypal');
      expect(result).toContain('sequential');
    });
  });

  describe('getAllMappedArcanos', () => {
    it('returns non-empty array', () => {
      const result = getAllMappedArcanos();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getRelationsForArcano', () => {
    it('returns relations for O Louco', () => {
      const result = getRelationsForArcano('O Louco');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown arcano', () => {
      const result = getRelationsForArcano('Unknown Arcano');
      expect(result).toEqual([]);
    });
  });

  describe('getRelationsByPathType', () => {
    it('returns mappings for tree_path', () => {
      const result = getRelationsByPathType('tree_path');
      expect(result.length).toBeGreaterThan(0);
    });

    it('all results have correct path type', () => {
      const result = getRelationsByPathType('tree_path');
      result.forEach((mapping) => {
        expect(mapping.path_type).toBe('tree_path');
      });
    });
  });

  describe('getPathTypeBetween', () => {
    it('returns path type for related arcano', () => {
      const result = getPathTypeBetween('O Louco', 'O Mago');
      expect(result).toBe('tree_path');
    });

    it('returns null for unrelated arcano', () => {
      const result = getPathTypeBetween('O Louco', 'O Sol');
      expect(result).toBeNull();
    });
  });

  describe('getSpiritualMeaningBetween', () => {
    it('returns meaning for related arcano', () => {
      const result = getSpiritualMeaningBetween('O Louco', 'O Mago');
      expect(result).not.toBeNull();
      expect(typeof result).toBe('string');
    });

    it('returns null for unrelated arcano', () => {
      const result = getSpiritualMeaningBetween('O Louco', 'O Sol');
      expect(result).toBeNull();
    });
  });

  describe('hasRelation', () => {
    it('returns true for related arcano', () => {
      expect(hasRelation('O Louco', 'O Mago')).toBe(true);
    });

    it('returns false for unrelated arcano', () => {
      expect(hasRelation('O Louco', 'O Sol')).toBe(false);
    });

    it('works bidirectionally', () => {
      expect(hasRelation('O Mago', 'O Louco')).toBe(true);
    });
  });

  describe('getArcanoByNumber', () => {
    it('returns arcano for valid number', () => {
      expect(getArcanoByNumber(0)).toBe('0 - O Louco');
      expect(getArcanoByNumber(1)).toBe('I - O Mago');
      expect(getArcanoByNumber(21)).toBe('XXI - O Mundo');
    });

    it('returns null for invalid number', () => {
      expect(getArcanoByNumber(-1)).toBeNull();
      expect(getArcanoByNumber(22)).toBeNull();
      expect(getArcanoByNumber(99)).toBeNull();
    });
  });

  describe('TarotTarotMapping interface', () => {
    it('has all required fields', () => {
      const mapping: TarotTarotMapping = {
        arcano: 'O Louco',
        numero_carta: 0,
        related_arcano: 'O Mago',
        related_numero: 1,
        path_type: 'tree_path',
        spiritual_meaning: 'Test meaning',
        energy_flow: 'bidirectional',
      };

      expect(mapping.arcano).toBeDefined();
      expect(mapping.numero_carta).toBeDefined();
      expect(mapping.related_arcano).toBeDefined();
      expect(mapping.related_numero).toBeDefined();
      expect(mapping.path_type).toBeDefined();
      expect(mapping.spiritual_meaning).toBeDefined();
      expect(mapping.energy_flow).toBeDefined();
    });
  });
});
