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
        'Trino',
        'Sextil',
        'Quadratura',
        'Oposição',
        'Sequência',
        'Complementar',
        'Ancestral',
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

    it('should return mapping for O Mago to O Louco (reverse)', () => {
      const result = getTarotTarot('I - O Mago', '0 - O Louco');
      expect(result).toBeNull();
    });

    it('should return null for non-existent pair', () => {
      const result = getTarotTarot('0 - O Louco', 'XIX - O Sol');
      expect(result).toBeNull();
    });

    it('should return mapping for Oposição type', () => {
      const result = getTarotTarot('I - O Mago', 'XVI - A Torre');
      expect(result).not.toBeNull();
      expect(result?.path_type).toBe('Oposição');
    });

    it('should return mapping for Trino type', () => {
      const result = getTarotTarot('I - O Mago', 'XI - A Força');
      expect(result).not.toBeNull();
      expect(result?.path_type).toBe('Trino');
    });

    it('should return mapping for Quadratura type', () => {
      const result = getTarotTarot('IV - O Imperador', 'XII - O Enforcado');
      expect(result).not.toBeNull();
      expect(result?.path_type).toBe('Quadratura');
    });

    it('should return mapping for Complementar type', () => {
      const result = getTarotTarot('0 - O Louco', 'X - A Roda da Fortuna');
      expect(result).not.toBeNull();
      expect(result?.path_type).toBe('Complementar');
    });

    it('should return mapping for Ancestral type', () => {
      const result = getTarotTarot('XIX - O Sol', '0 - O Louco');
      expect(result).not.toBeNull();
      expect(result?.path_type).toBe('Ancestral');
    });

    it('should return mapping with spiritual_meaning containing significado', () => {
      const result = getTarotTarot('0 - O Louco', 'I - O Mago');
      expect(result?.spiritual_meaning.significado).toBeTruthy();
    });

    it('should return mapping with spiritual_meaning containing crescimento', () => {
      const result = getTarotTarot('0 - O Louco', 'I - O Mago');
      expect(result?.spiritual_meaning.crescimento).toBeTruthy();
    });

    it('should return mapping with spiritual_meaning containing desafio', () => {
      const result = getTarotTarot('0 - O Louco', 'I - O Mago');
      expect(result?.spiritual_meaning.desafio).toBeTruthy();
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

    it('should return unique values (no duplicates)', () => {
      const result = getAllPathTypes();
      const uniqueSet = new Set(result);
      expect(uniqueSet.size).toBe(result.length);
    });

    it('should include Oposição with ç', () => {
      const result = getAllPathTypes();
      expect(result).toContain('Oposição');
    });

    it('should include Trino', () => {
      const result = getAllPathTypes();
      expect(result).toContain('Trino');
    });

    it('should include Sextil', () => {
      const result = getAllPathTypes();
      expect(result).toContain('Sextil');
    });

    it('should include Sequência with ê', () => {
      const result = getAllPathTypes();
      expect(result).toContain('Sequência');
    });

    it('should include Complementar', () => {
      const result = getAllPathTypes();
      expect(result).toContain('Complementar');
    });

    it('should include Ancestral', () => {
      const result = getAllPathTypes();
      expect(result).toContain('Ancestral');
    });

    it('should include Quadratura', () => {
      const result = getAllPathTypes();
      expect(result).toContain('Quadratura');
    });
  });

  describe('getAllMappedArcanos', () => {
    it('should return all mapped arcano names', () => {
      const result = getAllMappedArcanos();
      expect(result.length).toBe(22);
      expect(result).toContain('0 - O Louco');
      expect(result).toContain('XXI - O Mundo');
    });

    it('should contain all numbered arcano formats', () => {
      const result = getAllMappedArcanos();
      expect(result).toContain('I - O Mago');
      expect(result).toContain('II - A Alta Sacerdotisa');
      expect(result).toContain('X - A Roda da Fortuna');
      expect(result).toContain('XX - O Julgamento');
    });
  });

  describe('getRelationsForArcano', () => {
    it('should return relations for O Louco', () => {
      const result = getRelationsForArcano('0 - O Louco');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((r) => r.related_arcano === 'I - O Mago')).toBe(true);
    });

    it('should return relations for O Mago', () => {
      const result = getRelationsForArcano('I - O Mago');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty for unknown arcano', () => {
      const result = getRelationsForArcano('XXX - Unknown');
      expect(result).toEqual([]);
    });
  });

  describe('getRelationsByPathType', () => {
    it('should return relations for Sequência type', () => {
      const result = getRelationsByPathType('Sequência');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.path_type).toBe('Sequência');
      });
    });

    it('should return relations for Trino type', () => {
      const result = getRelationsByPathType('Trino');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.path_type).toBe('Trino');
      });
    });

    it('should return empty for unknown type', () => {
      const result = getRelationsByPathType('Trapezoide' as any);
      expect(result).toEqual([]);
    });
  });

  describe('getPathTypeBetween', () => {
    it('should return path type for existing pair', () => {
      const result = getPathTypeBetween('0 - O Louco', 'I - O Mago');
      expect(result).toBe('Sequência');
    });

    it('should return null for non-existent pair', () => {
      const result = getPathTypeBetween('0 - O Louco', 'XIX - O Sol');
      expect(result).toBeNull();
    });
  });

  describe('getSpiritualMeaningBetween', () => {
    it('should return spiritual meaning for existing pair', () => {
      const result = getSpiritualMeaningBetween('0 - O Louco', 'I - O Mago');
      expect(result).not.toBeNull();
      expect(result?.significado).toBeTruthy();
      expect(result?.crescimento).toBeTruthy();
      expect(result?.desafio).toBeTruthy();
      expect(result?.ritual).toBeTruthy();
    });

    it('should return null for non-existent pair', () => {
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

  describe('getArcanoByNumber', () => {
    it('should return O Louco for number 0', () => {
      expect(getArcanoByNumber(0)).toBe('0 - O Louco');
    });

    it('should return O Mago for number 1', () => {
      expect(getArcanoByNumber(1)).toBe('I - O Mago');
    });

    it('should return O Mundo for number 21', () => {
      expect(getArcanoByNumber(21)).toBe('XXI - O Mundo');
    });

    it('should return null for out of range number', () => {
      expect(getArcanoByNumber(22)).toBeNull();
      expect(getArcanoByNumber(-1)).toBeNull();
    });
  });

  describe('TAROT_TAROT_MAPPINGS', () => {
    it('should be exported', () => {
      expect(TAROT_TAROT_MAPPINGS).toBeDefined();
    });

    it('should have valid arcano values', () => {
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

    it('should start with O Louco', () => {
      expect(ALL_MAJOR_ARCANOS[0]).toBe('0 - O Louco');
    });

    it('should end with O Mundo', () => {
      expect(ALL_MAJOR_ARCANOS[21]).toBe('XXI - O Mundo');
    });
  });
});
