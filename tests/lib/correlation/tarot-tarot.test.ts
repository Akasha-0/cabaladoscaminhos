import { describe, it, expect } from 'vitest';
import {
  getTarotTarot,
  getAllTarotPaths,
  getPathTypes,
  getMappingsByPathType,
  getAllMappedArcanos,
  getAllArcanoRelations,
  getReverseMappings,
  hasTarotTarot,
  getRelationsByNumber,
  getArcanoByNumber,
  getPathTypeBetween,
  getSpiritualMeaningBetween,
  hasRelation,
  TAROT_TAROT_MAPPINGS,
  PathType,
  TarotTarotMapping,
} from '@/lib/correlation/tarot-tarot';

describe('Tarot-Tarot Correlation', () => {
  describe('getTarotTarot', () => {
    it('should return mappings for O Louco', () => {
      const result = getTarotTarot('O Louco');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].arcano).toBe('O Louco');
    });

    it('should return empty array for unknown arcano', () => {
      const result = getTarotTarot('NonExistent');
      expect(result).toEqual([]);
    });

    it('should return bidirectional mappings', () => {
      const result = getTarotTarot('O Louco');
      result.forEach((m) => {
        expect(m.arcano).toBe('O Louco');
      });
    });
  });

  describe('getAllTarotPaths', () => {
    it('should return all mappings', () => {
      const result = getAllTarotPaths();
      expect(result.length).toBeGreaterThan(20);
    });
  });

  describe('getPathTypes', () => {
    it('should return all path types', () => {
      const result = getPathTypes();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getMappingsByPathType', () => {
    it('should return mappings for a path type', () => {
      const result = getMappingsByPathType('Sequencia');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.path_type).toBe('Sequencia');
      });
    });

    it('should return mappings for Ancestral type', () => {
      const result = getMappingsByPathType('Ancestral');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => {
        expect(r.path_type).toBe('Ancestral');
      });
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

  describe('getAllArcanoRelations', () => {
    it('should return relations for O Louco', () => {
      const result = getAllArcanoRelations('O Louco');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return relations for O Mundo', () => {
      const result = getAllArcanoRelations('O Mundo');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty for non-existent arcano', () => {
      const result = getAllArcanoRelations('NonExistent');
      expect(result).toEqual([]);
    });
  });

  describe('getReverseMappings', () => {
    it('should return reverse mappings for O Louco', () => {
      const result = getReverseMappings('O Louco');
      result.forEach((m) => {
        expect(m.related_arcano).toBe('O Louco');
      });
    });
  });

  describe('hasTarotTarot', () => {
    it('should return true for related arcano', () => {
      const result = hasTarotTarot('O Louco');
      expect(result).toBe(true);
    });

    it('should return false for non-related arcano', () => {
      const result = hasTarotTarot('NonExistent');
      expect(result).toBe(false);
    });
  });

  describe('getRelationsByNumber', () => {
    it('should return relations for card number 0', () => {
      const result = getRelationsByNumber(0);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return relations for card number 21', () => {
      const result = getRelationsByNumber(21);
      expect(result.length).toBeGreaterThan(0);
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

  describe('getPathTypeBetween', () => {
    it('should return path type for related pair', () => {
      const result = getPathTypeBetween('0 - O Louco', 'I - O Mago');
      expect(result).toBeTruthy();
    });
  });

  describe('getSpiritualMeaningBetween', () => {
    it('should return meaning for related pair', () => {
      const result = getSpiritualMeaningBetween('0 - O Louco', 'I - O Mago');
      expect(result).toBeTruthy();
      expect(result?.significado).toBeTruthy();
    });
  });

  describe('hasRelation', () => {
    it('should return true for related pair', () => {
      const result = hasRelation('0 - O Louco', 'I - O Mago');
      expect(result).toBe(true);
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

    it('should have valid spiritual meanings', () => {
      TAROT_TAROT_MAPPINGS.forEach((mapping) => {
        expect(mapping.spiritual_meaning).toBeTruthy();
      });
    });

    it('should have valid path types', () => {
      const validPathTypes = getPathTypes();
      TAROT_TAROT_MAPPINGS.forEach((mapping) => {
        expect(validPathTypes).toContain(mapping.path_type);
      });
    });
  });

  describe('TarotTarotMapping interface', () => {
    it('should have correct structure for first mapping', () => {
      const mapping = getAllTarotPaths()[0];
      expect(mapping.arcano).toBeTruthy();
      expect(mapping.related_arcano).toBeTruthy();
      expect(mapping.path_type).toBeTruthy();
      expect(mapping.numero_carta).toBeDefined();
      expect(mapping.related_numero).toBeDefined();
      expect(mapping.spiritual_meaning).toBeTruthy();
    });
  });
});
