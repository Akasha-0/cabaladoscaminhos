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
        'Trino', 'Sextil', 'Quadratura', 'Oposi\u00e7\u00e3o',
        'Sequ\u00eancia', 'Complementar', 'Ancestral',
      ];
      pathTypes.forEach((type) => {
        expect(getAllPathTypes()).toContain(type);
      });
    });
  });

  describe('getTarotTarot', () => {
    it('should return mapping for O Louco to O Mago', () => {
      const result = getTarotTarot('0 - O Louco', 'I - O Mago');
      expect(result).not.toBeNull();
      expect(result?.path_type).toBe('Sequ\u00eancia');
    });

    it('should return null for non-existent pair', () => {
      expect(getTarotTarot('0 - O Louco', 'VII - O Carro')).toBeNull();
    });

    it('should return mapping for Oposi\u00e7\u00e3o type', () => {
      const result = getTarotTarot('I - O Mago', 'XVI - A Torre');
      expect(result).not.toBeNull();
      expect(result?.path_type).toBe('Oposi\u00e7\u00e3o');
    });
  });

  describe('getAllTarotPaths', () => {
    it('should return all mappings', () => {
      expect(getAllTarotPaths().length).toBeGreaterThan(0);
    });

    it('should return at least 66 mappings', () => {
      expect(getAllTarotPaths().length).toBeGreaterThanOrEqual(66);
    });
  });

  describe('getAllPathTypes', () => {
    it('should return all seven path types', () => {
      expect(getAllPathTypes().length).toBe(7);
    });
  });

  describe('getAllMappedArcanos', () => {
    it('should return at least 22 arcano names', () => {
      expect(getAllMappedArcanos().length).toBeGreaterThanOrEqual(22);
    });
  });

  describe('getRelationsForArcano', () => {
    it('should return relations for O Louco', () => {
      expect(getRelationsForArcano('0 - O Louco').length).toBeGreaterThan(0);
    });
  });

  describe('getRelationsByPathType', () => {
    it('should return relations for Sequ\u00eancia type', () => {
      expect(getRelationsByPathType('Sequ\u00eancia').length).toBeGreaterThan(0);
    });
  });

  describe('getPathTypeBetween', () => {
    it('should return Sequ\u00eancia for O Louco and O Mago', () => {
      expect(getPathTypeBetween('0 - O Louco', 'I - O Mago')).toBe('Sequ\u00eancia');
    });

    it('should return null for non-existent pair', () => {
      expect(getPathTypeBetween('0 - O Louco', 'VII - O Carro')).toBeNull();
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
    it('should have valid arcano values', () => {
      TAROT_TAROT_MAPPINGS.forEach((mapping) => {
        expect(ALL_MAJOR_ARCANOS).toContain(mapping.arcano);
        expect(ALL_MAJOR_ARCANOS).toContain(mapping.related_arcano);
      });
    });
  });

  describe('TOTAL_MAPPINGS', () => {
    it('should be positive', () => {
      expect(TOTAL_MAPPINGS).toBeGreaterThan(0);
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
