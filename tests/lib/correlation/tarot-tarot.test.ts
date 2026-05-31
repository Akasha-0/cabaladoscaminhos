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
      expect(TOTAL_MAPPINGS).toBe(39);
      expect(TAROT_TAROT_MAPPINGS.length).toBe(39);
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
      expect(result.length).toBe(39);
    });

    it('returns same reference', () => {
      const result = getAllTarotPaths();
      expect(result).toBe(TAROT_TAROT_MAPPINGS);
    });
  });

  describe('getAllPathTypes', () => {
    it('returns array of path types', () => {
      const result = getAllPathTypes();
      expect(result).toBeDefined();
      expect(result.length).toBe(5);
    });

    it('contains expected path types', () => {
      const result = getAllPathTypes();
      expect(result).toContain('tree_path');
      expect(result).toContain('sequential');
    });
  });

  describe('getAllMappedArcanos', () => {
    it('returns all arcano names', () => {
      const result = getAllMappedArcanos();
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

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

    it('returns empty array for unknown arcano', () => {
      const result = getRelationsForArcano('Unknown');
      expect(result).toEqual([]);
    });
  });

  describe('getRelationsByPathType', () => {
    it('returns mappings for tree_path type', () => {
      const result = getRelationsByPathType('tree_path');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown path type', () => {
      const result = getRelationsByPathType('unknown' as PathType);
      expect(result).toEqual([]);
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

    it('returns null for non-related pair', () => {
      const result = getPathTypeBetween('O Louco', 'A Morte');
      expect(result).toBeNull();
    });
  });

  describe('getSpiritualMeaningBetween', () => {
    it('returns spiritual meaning for related pair', () => {
      const result = getSpiritualMeaningBetween('O Louco', 'O Mago');
      expect(result).toBeTruthy();
      expect(typeof result === 'string').toBe(true);
    });

    it('returns null for non-related pair', () => {
      const result = getSpiritualMeaningBetween('O Louco', 'A Morte');
      expect(result).toBeNull();
    });
  });

  describe('hasRelation', () => {
    it('returns true for related pair', () => {
      expect(hasRelation('O Louco', 'O Mago')).toBe(true);
    });

    it('returns true for reverse pair', () => {
      expect(hasRelation('O Mago', 'O Louco')).toBe(true);
    });

    it('returns false for non-related pair', () => {
      expect(hasRelation('O Louco', 'A Morte')).toBe(false);
    });
  });

  describe('getArcanoByNumber', () => {
    it('returns arcano for card 0', () => {
      expect(getArcanoByNumber(0)).toBe('0 - O Louco');
    });

    it('returns arcano for card 21', () => {
      expect(getArcanoByNumber(21)).toBe('XXI - O Mundo');
    });

    it('returns null for invalid number', () => {
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
        path_type: 'sequential',
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
