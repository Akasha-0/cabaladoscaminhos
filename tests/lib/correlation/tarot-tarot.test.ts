import { describe, it, expect } from 'vitest';
import {
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
  type TarotPathType,
} from '@/lib/correlation/tarot-tarot';

describe('Tarot-Tarot Correlation', () => {
  describe('TAROT_TAROT_MAPPINGS', () => {
    it('is defined and not empty', () => {
      expect(TAROT_TAROT_MAPPINGS).toBeDefined();
      expect(TAROT_TAROT_MAPPINGS.length).toBeGreaterThan(0);
    });

    it('has correct count', () => {
      expect(TOTAL_MAPPINGS).toBe(TAROT_TAROT_MAPPINGS.length);
    });

    it('has 7 path types', () => {
      expect(TOTAL_PATH_TYPES).toBe(7);
    });

    it('mappings have required fields', () => {
      for (const mapping of TAROT_TAROT_MAPPINGS) {
        expect(mapping.arcano).toBeDefined();
        expect(mapping.arcano_numero).toBeDefined();
        expect(mapping.related_arcano).toBeDefined();
        expect(mapping.related_numero).toBeDefined();
        expect(mapping.path_type).toBeDefined();
        expect(mapping.significado).toBeDefined();
        expect(mapping.crescimento).toBeDefined();
        expect(mapping.desafio).toBeDefined();
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

  describe('getAllTarotPaths', () => {
    it('returns all mappings', () => {
      const result = getAllTarotPaths();
      expect(result).toBeDefined();
      expect(result.length).toBe(TAROT_TAROT_MAPPINGS.length);
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
      expect(result).toContain('Sequencia');
      expect(result).toContain('Trino');
    });
  });

  describe('getAllMappedArcanos', () => {
    it('returns all arcano names', () => {
      const result = getAllMappedArcanos();
      expect(result).toBeDefined();
      expect(result.length).toBe(22);
    });

    it('contains 0 - O Louco', () => {
      expect(getAllMappedArcanos()).toContain('0 - O Louco');
    });

    it('contains XXI - O Mundo', () => {
      expect(getAllMappedArcanos()).toContain('XXI - O Mundo');
    });
  });

  describe('getRelationsForArcano', () => {
    it('returns relations for 0 - O Louco', () => {
      const result = getRelationsForArcano('0 - O Louco');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty for unknown arcano', () => {
      const result = getRelationsForArcano('Unknown');
      expect(result).toEqual([]);
    });
  });

  describe('getRelationsByPathType', () => {
    it('returns mappings for Sequencia type', () => {
      const result = getRelationsByPathType('Sequencia');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown path type', () => {
      const result = getRelationsByPathType('unknown' as TarotPathType);
      expect(result).toEqual([]);
    });
  });

  describe('getPathTypeBetween', () => {
    it('returns path type for related pair', () => {
      const result = getPathTypeBetween('0 - O Louco', 'I - O Mago');
      expect(result).toBeTruthy();
    });

    it('returns path type for reverse pair', () => {
      const result = getPathTypeBetween('I - O Mago', '0 - O Louco');
      expect(result).toBeTruthy();
    });

    it('returns null for non-related pair', () => {
      const result = getPathTypeBetween('0 - O Louco', 'A Morte');
      expect(result).toBeNull();
    });
  });

  describe('getSpiritualMeaningBetween', () => {
    it('returns spiritual meaning for related pair', () => {
      const result = getSpiritualMeaningBetween('0 - O Louco', 'I - O Mago');
      expect(result).toBeTruthy();
      expect(result?.significado).toBe('Iniciacao');
    });

    it('returns null for non-related pair', () => {
      const result = getSpiritualMeaningBetween('0 - O Louco', 'A Morte');
      expect(result).toBeNull();
    });
  });

  describe('hasRelation', () => {
    it('returns true for related pair', () => {
      expect(hasRelation('0 - O Louco', 'I - O Mago')).toBe(true);
    });

    it('returns true for reverse pair', () => {
      expect(hasRelation('I - O Mago', '0 - O Louco')).toBe(true);
    });

    it('returns false for non-related pair', () => {
      expect(hasRelation('0 - O Louco', 'A Morte')).toBe(false);
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
        arcano: '0 - O Louco',
        arcano_numero: 0,
        arcano_romano: '0',
        related_arcano: 'I - O Mago',
        related_numero: 1,
        related_romano: 'I',
        path_type: 'Sequencia',
        significado: 'Iniciacao',
        crescimento: 'Despertar',
        desafio: 'Confiar',
      };

      expect(mapping.arcano).toBeDefined();
      expect(mapping.arcano_numero).toBeDefined();
      expect(mapping.related_arcano).toBeDefined();
      expect(mapping.related_numero).toBeDefined();
      expect(mapping.path_type).toBeDefined();
      expect(mapping.significado).toBeDefined();
      expect(mapping.crescimento).toBeDefined();
      expect(mapping.desafio).toBeDefined();
    });
  });
});