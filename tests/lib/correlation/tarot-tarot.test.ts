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
      const pathTypes: TarotPathType[] = [
        'Trino', 'Sextil', 'Quadratura', 'Oposição',
        'Sequência', 'Complementar', 'Ancestral',
      ];
      const allTypes = getAllPathTypes();
      pathTypes.forEach((type) => {
        expect(allTypes).toContain(type);
      });
    });
  });

  describe('getTarotTarot', () => {
    it('should return mapping for O Louco to O Mago', () => {
      const result = getTarotTarot('0 - O Louco', 'I - O Mago');
      expect(result).not.toBeNull();
      expect(result?.path_type).toBe('Sequência');
    });

    it('should return null for reverse direction', () => {
      expect(getTarotTarot('I - O Mago', '0 - O Louco')).toBeNull();
    });

    it('should return null for non-existent pair', () => {
      expect(getTarotTarot('0 - O Louco', 'VII - O Carro')).toBeNull();
    });

    it('should return mapping for Oposição type', () => {
      const result = getTarotTarot('I - O Mago', 'XVI - A Torre');
      expect(result).not.toBeNull();
      expect(result?.path_type).toBe('Oposição');
    });

    it('should return mapping for Complementar type', () => {
      const result = getTarotTarot('0 - O Louco', 'X - A Roda da Fortuna');
      expect(result).not.toBeNull();
      expect(result?.path_type).toBe('Complementar');
    });

    it('should return mapping for Ancestral type', () => {
      const result = getTarotTarot('0 - O Louco', 'XXI - O Mundo');
      expect(result).not.toBeNull();
      expect(result?.path_type).toBe('Ancestral');
    });
  });

  describe('getAllTarotPaths', () => {
    it('should return all mappings', () => {
      expect(getAllTarotPaths().length).toBeGreaterThan(0);
    });

    it('should return at least 64 mappings', () => {
      expect(getAllTarotPaths().length).toBeGreaterThanOrEqual(64);
    });
  });

  describe('getAllPathTypes', () => {
    it('should return all seven path types', () => {
      expect(getAllPathTypes().length).toBe(7);
    });

    it('should include Oposição with ç', () => {
      expect(getAllPathTypes()).toContain('Oposição');
    });
  });

  describe('getAllMappedArcanos', () => {
    it('should return at least 22 arcano names', () => {
      expect(getAllMappedArcanos().length).toBeGreaterThanOrEqual(22);
    });

    it('should contain all Major Arcana', () => {
      getAllMappedArcanos().forEach((arcano) => {
        expect(ALL_MAJOR_ARCANOS).toContain(arcano);
      });
    });
  });

  describe('getRelationsForArcano', () => {
    it('should return relations for O Louco', () => {
      expect(getRelationsForArcano('0 - O Louco').length).toBeGreaterThan(0);
    });

    it('should return empty for unknown arcano', () => {
      expect(getRelationsForArcano('Unknown Arcano')).toEqual([]);
    });
  });

  describe('getRelationsByPathType', () => {
    it('should return relations for Sequência type', () => {
      expect(getRelationsByPathType('Sequência').length).toBeGreaterThan(0);
    });

    it('should return relations for Trino type', () => {
      expect(getRelationsByPathType('Trino').length).toBeGreaterThan(0);
    });

    it('should return empty for unknown type', () => {
      expect(getRelationsByPathType('Unknown' as TarotPathType)).toEqual([]);
    });
  });

  describe('getPathTypeBetween', () => {
    it('should return Sequência for O Louco and O Mago', () => {
      expect(getPathTypeBetween('0 - O Louco', 'I - O Mago')).toBe('Sequência');
    });

    it('should return null for non-existent pair', () => {
      expect(getPathTypeBetween('0 - O Louco', 'VII - O Carro')).toBeNull();
    });

    it('should work in reverse order', () => {
      expect(getPathTypeBetween('I - O Mago', '0 - O Louco')).toBe('Sequência');
    });
  });

  describe('getSpiritualMeaningBetween', () => {
    it('should return spiritual meaning for O Louco and O Mago', () => {
      const result = getSpiritualMeaningBetween('0 - O Louco', 'I - O Mago');
      expect(result).not.toBeNull();
      expect(result?.significado).toBeTruthy();
      expect(result?.crescimento).toBeTruthy();
      expect(result?.desafio).toBeTruthy();
    });

    it('should return null for non-existent pair', () => {
      expect(getSpiritualMeaningBetween('0 - O Louco', 'VII - O Carro')).toBeNull();
    });
  });

  describe('hasRelation', () => {
    it('should return true for related pair', () => {
      expect(hasRelation('0 - O Louco', 'I - O Mago')).toBe(true);
    });

    it('should return false for non-related pair', () => {
      expect(hasRelation('0 - O Louco', 'VII - O Carro')).toBe(false);
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
        expect(ALL_MAJOR_ARCANOS).toContain(mapping.arcano);
        expect(ALL_MAJOR_ARCANOS).toContain(mapping.related_arcano);
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
    it('should be exported and equal to 7', () => {
      expect(TOTAL_PATH_TYPES).toBe(7);
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
    it('should export all required functions', async () => {
      const { default: m } = await import('@/lib/correlation/tarot-tarot');
      expect(m.getTarotTarot).toBeDefined();
      expect(m.getAllTarotPaths).toBeDefined();
      expect(m.getAllPathTypes).toBeDefined();
      expect(m.getAllMappedArcanos).toBeDefined();
      expect(m.getRelationsForArcano).toBeDefined();
      expect(m.getRelationsByPathType).toBeDefined();
      expect(m.getPathTypeBetween).toBeDefined();
      expect(m.getSpiritualMeaningBetween).toBeDefined();
      expect(m.hasRelation).toBeDefined();
      expect(m.getArcanoByNumber).toBeDefined();
      expect(m.ALL_MAJOR_ARCANOS).toBeDefined();
      expect(m.TAROT_TAROT_MAPPINGS).toBeDefined();
      expect(m.TOTAL_MAPPINGS).toBeDefined();
      expect(m.TOTAL_PATH_TYPES).toBeDefined();
    });
  });
});
