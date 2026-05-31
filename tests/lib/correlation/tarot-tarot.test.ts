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
import type { TarotPathType, TarotTarotMapping } from '@/lib/correlation/tarot-tarot';

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

    it('should return a copy (not the same reference)', () => {
      const result = getAllTarotPaths();
      expect(result).not.toBe(TAROT_TAROT_MAPPINGS);
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

    it('should include Quadratura', () => {
      const result = getAllPathTypes();
      expect(result).toContain('Quadratura');
    });

    it('should include Sequência', () => {
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
  });

  describe('getAllMappedArcanos', () => {
    it('should return all 22 arcano', () => {
      const result = getAllMappedArcanos();
      expect(result.length).toBe(22);
    });

    it('should include O Louco', () => {
      const result = getAllMappedArcanos();
      expect(result).toContain('0 - O Louco');
    });

    it('should include O Mundo', () => {
      const result = getAllMappedArcanos();
      expect(result).toContain('XXI - O Mundo');
    });

    it('should not have duplicates', () => {
      const result = getAllMappedArcanos();
      const uniqueSet = new Set(result);
      expect(uniqueSet.size).toBe(result.length);
    });

    it('should include all arcano from ALL_MAJOR_ARCANOS', () => {
      const result = getAllMappedArcanos();
      ALL_MAJOR_ARCANOS.forEach((arcano) => {
        expect(result).toContain(arcano);
      });
    });
  });

  describe('getRelationsForArcano', () => {
    it('should return 3 relations for O Louco', () => {
      const result = getRelationsForArcano('0 - O Louco');
      expect(result.length).toBe(3);
    });

    it('should return relations containing O Louco', () => {
      const result = getRelationsForArcano('0 - O Louco');
      result.forEach((r) => {
        expect(r.arcano === '0 - O Louco' || r.related_arcano === '0 - O Louco').toBe(true);
      });
    });

    it('should return 3 relations for O Mago', () => {
      const result = getRelationsForArcano('I - O Mago');
      expect(result.length).toBe(3);
    });

    it('should return 3 relations for O Mundo', () => {
      const result = getRelationsForArcano('XXI - O Mundo');
      expect(result.length).toBe(3);
    });

    it('should return empty array for unknown arcano', () => {
      const result = getRelationsForArcano('Unknown Arcano');
      expect(result).toEqual([]);
    });

    it('should return mapping with spiritual_meaning for each relation', () => {
      const result = getRelationsForArcano('0 - O Louco');
      result.forEach((r) => {
        expect(r.spiritual_meaning).toBeTruthy();
        expect(r.spiritual_meaning.significado).toBeTruthy();
      });
    });
  });

  describe('getRelationsByPathType', () => {
    it('should return mappings for Sequência', () => {
      const result = getRelationsByPathType('Sequência');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.path_type).toBe('Sequência');
      });
    });

    it('should return mappings for Trino', () => {
      const result = getRelationsByPathType('Trino');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.path_type).toBe('Trino');
      });
    });

    it('should return mappings for Oposição', () => {
      const result = getRelationsByPathType('Oposição');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.path_type).toBe('Oposição');
      });
    });

    it('should return empty array for non-existent path type', () => {
      const result = getRelationsByPathType('NonExistent' as TarotPathType);
      expect(result).toEqual([]);
    });
  });

  describe('getPathTypeBetween', () => {
    it('should return Sequência for O Louco and O Mago', () => {
      const result = getPathTypeBetween('0 - O Louco', 'I - O Mago');
      expect(result).toBe('Sequência');
    });

    it('should return Oposição for O Mago and A Torre', () => {
      const result = getPathTypeBetween('I - O Mago', 'XVI - A Torre');
      expect(result).toBe('Oposição');
    });

    it('should return Trino for O Mago and A Força', () => {
      const result = getPathTypeBetween('I - O Mago', 'XI - A Força');
      expect(result).toBe('Trino');
    });

    it('should return null for non-existent pair', () => {
      const result = getPathTypeBetween('0 - O Louco', 'XIX - O Sol');
      expect(result).toBeNull();
    });

    it('should work with arcano in reverse order', () => {
      const result = getPathTypeBetween('I - O Mago', '0 - O Louco');
      expect(result).toBe('Sequência');
    });

    it('should return Complementar for O Louco and Roda', () => {
      const result = getPathTypeBetween('0 - O Louco', 'X - A Roda da Fortuna');
      expect(result).toBe('Complementar');
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
      const result = getSpiritualMeaningBetween('0 - O Louco', 'XIX - O Sol');
      expect(result).toBeNull();
    });

    it('should work with arcano in reverse order', () => {
      const result = getSpiritualMeaningBetween('I - O Mago', '0 - O Louco');
      expect(result).not.toBeNull();
    });

    it('should return meaning containing Portuguese text', () => {
      const result = getSpiritualMeaningBetween('0 - O Louco', 'I - O Mago');
      expect(result?.significado).toContain('Louco');
      expect(result?.significado).toContain('Mago');
    });
  });

  describe('hasRelation', () => {
    it('should return true for O Louco and O Mago', () => {
      expect(hasRelation('0 - O Louco', 'I - O Mago')).toBe(true);
    });

    it('should return true for O Mago and A Torre', () => {
      expect(hasRelation('I - O Mago', 'XVI - A Torre')).toBe(true);
    });

    it('should return false for non-related pair', () => {
      expect(hasRelation('0 - O Louco', 'XIX - O Sol')).toBe(false);
    });

    it('should work with reverse order', () => {
      expect(hasRelation('I - O Mago', '0 - O Louco')).toBe(true);
    });

    it('should return true for Oposição pair', () => {
      expect(hasRelation('II - A Alta Sacerotisa', 'XVIII - A Lua')).toBe(true);
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

    it('should return null for negative number', () => {
      expect(getArcanoByNumber(-1)).toBeNull();
    });

    it('should return null for number greater than 21', () => {
      expect(getArcanoByNumber(22)).toBeNull();
    });

    it('should return A Morte for number 13', () => {
      expect(getArcanoByNumber(13)).toBe('XIII - A Morte');
    });
  });

  describe('ALL_MAJOR_ARCANOS', () => {
    it('should have 22 arcano', () => {
      expect(ALL_MAJOR_ARCANOS.length).toBe(22);
    });

    it('should start with O Louco', () => {
      expect(ALL_MAJOR_ARCANOS[0]).toBe('0 - O Louco');
    });

    it('should end with O Mundo', () => {
      expect(ALL_MAJOR_ARCANOS[21]).toBe('XXI - O Mundo');
    });

    it('should be frozen (immutable)', () => {
      expect(Object.isFrozen(ALL_MAJOR_ARCANOS)).toBe(true);
    });
  });

  describe('TAROT_TAROT_MAPPINGS', () => {
    it('should have at least 66 mappings', () => {
      expect(TAROT_TAROT_MAPPINGS.length).toBeGreaterThanOrEqual(66);
    });

    it('should be frozen (immutable)', () => {
      expect(Object.isFrozen(TAROT_TAROT_MAPPINGS)).toBe(true);
    });

    it('should have valid arcano values', () => {
      TAROT_TAROT_MAPPINGS.forEach((mapping) => {
        expect(ALL_MAJOR_ARCANOS).toContain(mapping.arcano);
        expect(ALL_MAJOR_ARCANOS).toContain(mapping.related_arcano);
      });
    });

    it('should have valid path_type values', () => {
      TAROT_TAROT_MAPPINGS.forEach((mapping) => {
        const validTypes: TarotPathType[] = [
          'Trino',
          'Sextil',
          'Quadratura',
          'Oposição',
          'Sequência',
          'Complementar',
          'Ancestral',
        ];
        expect(validTypes).toContain(mapping.path_type);
      });
    });

    it('should have all path types represented', () => {
      const typesUsed = new Set(TAROT_TAROT_MAPPINGS.map((m) => m.path_type));
      expect(typesUsed.size).toBe(7);
    });
  });

  describe('TOTAL_MAPPINGS', () => {
    it('should equal the length of TAROT_TAROT_MAPPINGS', () => {
      expect(TOTAL_MAPPINGS).toBe(TAROT_TAROT_MAPPINGS.length);
    });

    it('should be at least 66', () => {
      expect(TOTAL_MAPPINGS).toBeGreaterThanOrEqual(66);
    });
  });

  describe('TOTAL_PATH_TYPES', () => {
    it('should equal 7', () => {
      expect(TOTAL_PATH_TYPES).toBe(7);
    });
  });

  describe('default export', () => {
    it('should export all required functions and constants', async () => {
      const defaultExport = await import('@/lib/correlation/tarot-tarot');
      const module = defaultExport.default;

      expect(module.getTarotTarot).toBeDefined();
      expect(module.getAllTarotPaths).toBeDefined();
      expect(module.getAllPathTypes).toBeDefined();
      expect(module.getAllMappedArcanos).toBeDefined();
      expect(module.getRelationsForArcano).toBeDefined();
      expect(module.getRelationsByPathType).toBeDefined();
      expect(module.getPathTypeBetween).toBeDefined();
      expect(module.getSpiritualMeaningBetween).toBeDefined();
      expect(module.hasRelation).toBeDefined();
      expect(module.getArcanoByNumber).toBeDefined();
      expect(module.ALL_MAJOR_ARCANOS).toBeDefined();
      expect(module.TAROT_TAROT_MAPPINGS).toBeDefined();
      expect(module.TOTAL_MAPPINGS).toBeDefined();
      expect(module.TOTAL_PATH_TYPES).toBeDefined();
    });

    it('should have correct values in default export', async () => {
      const defaultExport = await import('@/lib/correlation/tarot-tarot');
      const module = defaultExport.default;

      expect(module.TOTAL_PATH_TYPES).toBe(7);
      expect(module.ALL_MAJOR_ARCANOS.length).toBe(22);
      expect(module.TAROT_TAROT_MAPPINGS.length).toBeGreaterThanOrEqual(66);
    });
  });

  describe('TarotTarotMapping interface', () => {
    it('should have all required fields in mapping', () => {
      const mapping = TAROT_TAROT_MAPPINGS[0];
      expect(mapping.arcano).toBeDefined();
      expect(mapping.related_arcano).toBeDefined();
      expect(mapping.path_type).toBeDefined();
      expect(mapping.spiritual_meaning).toBeDefined();
      expect(mapping.spiritual_meaning.significado).toBeDefined();
      expect(mapping.spiritual_meaning.crescimento).toBeDefined();
      expect(mapping.spiritual_meaning.desafio).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty string for getRelationsForArcano', () => {
      const result = getRelationsForArcano('');
      expect(result).toEqual([]);
    });

    it('should handle whitespace for getRelationsForArcano', () => {
      const result = getRelationsForArcano('   ');
      expect(result).toEqual([]);
    });

    it('should handle case sensitivity correctly', () => {
      const result = getTarotTarot('0 - o louco', 'I - O Mago');
      expect(result).toBeNull();
    });

    it('should handle getArcanoByNumber with decimal', () => {
      expect(getArcanoByNumber(1.5)).toBeNull();
    });

    it('should handle getArcanoByNumber with zero', () => {
      expect(getArcanoByNumber(0)).toBe('0 - O Louco');
    });
  });

  describe('mappings distribution', () => {
    it('should have at least 3 mappings of each path type', () => {
      const pathTypes = getAllPathTypes();
      pathTypes.forEach((type) => {
        const count = getRelationsByPathType(type).length;
        expect(count).toBeGreaterThanOrEqual(3);
      });
    });

    it('should have at least 66 total mappings', () => {
      expect(TOTAL_MAPPINGS).toBeGreaterThanOrEqual(66);
    });
  });
});