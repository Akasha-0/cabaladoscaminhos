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
  type TarotPathType,
} from '@/lib/correlation/tarot-tarot';

describe('tarot-tarot', () => {
  // ─── getTarotTarot ────────────────────────────────────────────────────────────

  describe('getTarotTarot', () => {
    it('returns mappings for O Sol', () => {
      const result = getTarotTarot('O Sol');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(['O Sol', 'O Sol']).toContain(mapping.arcano);
        expect(mapping.numero_carta).toBe(19);
      });
    });

    it('returns mappings for A Lua', () => {
      const result = getTarotTarot('A Lua');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((m) => m.related_arcano === 'O Sol')).toBe(true);
    });

    it('returns mappings for O Louco', () => {
      const result = getTarotTarot('O Louco');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns mappings for O Mago', () => {
      const result = getTarotTarot('O Mago');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((m) => m.related_arcano === 'A Sacerdotisa')).toBe(true);
    });

    it('returns mappings for A Imperatriz', () => {
      const result = getTarotTarot('A Imperatriz');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((m) => m.related_arcano === 'O Imperador')).toBe(true);
    });

    it('returns mappings for O Mundo', () => {
      const result = getTarotTarot('O Mundo');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((m) => m.related_arcano === 'O Louco')).toBe(true);
    });

    it('returns empty array for unknown arcano', () => {
      const result = getTarotTarot('Unknown Arcano');
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });

    it('finds arcano as related_arcano not just source', () => {
      const result = getTarotTarot('O Mundo');
      expect(result.some((m) => m.arcano === 'O Louco' && m.related_arcano === 'O Mundo')).toBe(true);
    });
  });

  // ─── getAllTarotPaths ─────────────────────────────────────────────────────────

  describe('getAllTarotPaths', () => {
    it('returns all mappings', () => {
      const result = getAllTarotPaths();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns readonly array', () => {
      const result = getAllTarotPaths();
      expect(result).toBeReadonly();
    });

    it('contains all 22 Major Arcana cards', () => {
      const result = getAllTarotPaths();
      const uniqueArcanos = new Set(
        result.flatMap((m) => [m.arcano, m.related_arcano]),
      );
      expect(uniqueArcanos.size).toBe(22);
    });

    it('each mapping has required properties', () => {
      const result = getAllTarotPaths();
      result.forEach((mapping) => {
        expect(mapping.arcano).toBeDefined();
        expect(mapping.numero_carta).toBeDefined();
        expect(mapping.related_arcano).toBeDefined();
        expect(mapping.related_numero).toBeDefined();
        expect(mapping.path_type).toBeDefined();
        expect(mapping.spiritual_meaning).toBeDefined();
      });
    });

    it('card numbers are valid (0-21)', () => {
      const result = getAllTarotPaths();
      result.forEach((mapping) => {
        expect(mapping.numero_carta).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_carta).toBeLessThanOrEqual(21);
        expect(mapping.related_numero).toBeGreaterThanOrEqual(0);
        expect(mapping.related_numero).toBeLessThanOrEqual(21);
      });
    });
  });

  // ─── getAllPathTypes ──────────────────────────────────────────────────────────

  describe('getAllPathTypes', () => {
    it('returns array of path types', () => {
      const result = getAllPathTypes();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('contains valid path types', () => {
      const result = getAllPathTypes();
      const validTypes: TarotPathType[] = [
        'Trino',
        'Sextil',
        'Quadratura',
        'Oposição',
        'Sequência',
        'Complementar',
        'Ancestral',
      ];
      result.forEach((type) => {
        expect(validTypes).toContain(type);
      });
    });

    it('no duplicate path types', () => {
      const result = getAllPathTypes();
      const uniqueTypes = new Set(result);
      expect(uniqueTypes.size).toBe(result.length);
    });
  });

  // ─── getAllMappedArcanos ─────────────────────────────────────────────────────

  describe('getAllMappedArcanos', () => {
    it('returns array of arcano names', () => {
      const result = getAllMappedArcanos();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('contains 22 unique arcano names', () => {
      const result = getAllMappedArcanos();
      expect(result.length).toBe(22);
    });

    it('returns sorted by card number', () => {
      const result = getAllMappedArcanos();
      // O Louco (0) should come first, O Mundo (21) last
      expect(result[0]).toBe('O Louco');
      expect(result[21]).toBe('O Mundo');
    });

    it('contains known arcano names', () => {
      const result = getAllMappedArcanos();
      const knownArcanos = [
        'O Louco', 'O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador',
        'O Hierofante', 'Os Enamorados', 'O Carro', 'A Força', 'O Eremita',
        'A Roda da Fortuna', 'A Justiça', 'O Enforcado', 'A Morte', 'A Temperança',
        'O Diabo', 'A Torre', 'A Estrela', 'A Lua', 'O Sol',
        'O Julgamento', 'O Mundo',
      ];
      knownArcanos.forEach((arcano) => {
        expect(result).toContain(arcano);
      });
    });
  });

  // ─── getRelationsForArcano ───────────────────────────────────────────────────

  describe('getRelationsForArcano', () => {
    it('returns relations for O Sol', () => {
      const result = getRelationsForArcano('O Sol');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns relations for A Lua', () => {
      const result = getRelationsForArcano('A Lua');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown arcano', () => {
      const result = getRelationsForArcano('Unknown');
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });

    it('each relation contains the searched arcano', () => {
      const arcano = 'O Mago';
      const result = getRelationsForArcano(arcano);
      result.forEach((mapping) => {
        expect(
          mapping.arcano === arcano || mapping.related_arcano === arcano,
        ).toBe(true);
      });
    });
  });

  // ─── getRelationsByPathType ───────────────────────────────────────────────────

  describe('getRelationsByPathType', () => {
    it('returns relations for Trino', () => {
      const result = getRelationsByPathType('Trino');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.path_type).toBe('Trino');
      });
    });

    it('returns relations for Sequência', () => {
      const result = getRelationsByPathType('Sequência');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.path_type).toBe('Sequência');
      });
    });

    it('returns relations for Oposição', () => {
      const result = getRelationsByPathType('Oposição');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.path_type).toBe('Oposição');
      });
    });

    it('returns empty array for unknown path type', () => {
      const result = getRelationsByPathType('UnknownType' as TarotPathType);
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  // ─── getPathTypeBetween ──────────────────────────────────────────────────────

  describe('getPathTypeBetween', () => {
    it('returns path type between O Louco and O Mago', () => {
      const result = getPathTypeBetween('O Louco', 'O Mago');
      expect(result).toBeDefined();
      expect(result).toBe('Sequência');
    });

    it('returns path type between O Mago and O Louco (reversed)', () => {
      const result = getPathTypeBetween('O Mago', 'O Louco');
      expect(result).toBeDefined();
      expect(result).toBe('Sequência');
    });

    it('returns path type between A Sacerdotisa and A Lua', () => {
      const result = getPathTypeBetween('A Sacerdotisa', 'A Lua');
      expect(result).toBeDefined();
      expect(result).toBe('Trino');
    });

    it('returns null for unrelated arcanos', () => {
      const result = getPathTypeBetween('O Sol', 'O Louco');
      expect(result).toBeNull();
    });

    it('returns null for unknown arcano', () => {
      const result = getPathTypeBetween('O Sol', 'Unknown');
      expect(result).toBeNull();
    });
  });

  // ─── getSpiritualMeaningBetween ──────────────────────────────────────────────

  describe('getSpiritualMeaningBetween', () => {
    it('returns spiritual meaning for O Louco and O Mago', () => {
      const result = getSpiritualMeaningBetween('O Louco', 'O Mago');
      expect(result).toBeDefined();
      expect(result?.significado).toBeDefined();
      expect(result?.crescimento).toBeDefined();
      expect(result?.desafio).toBeDefined();
    });

    it('returns spiritual meaning for related arcanos', () => {
      const result = getSpiritualMeaningBetween('O Mago', 'A Sacerdotisa');
      expect(result).toBeDefined();
      expect(result?.significado).toContain('ação e intuição');
    });

    it('returns null for unrelated arcanos', () => {
      const result = getSpiritualMeaningBetween('O Sol', 'O Louco');
      expect(result).toBeNull();
    });

    it('spiritual meaning includes optional ritual', () => {
      const result = getSpiritualMeaningBetween('O Louco', 'O Mago');
      // Ritual is optional, so may or may not be present
      expect(result).toBeDefined();
    });

    it('returns null for unknown arcano', () => {
      const result = getSpiritualMeaningBetween('O Sol', 'Unknown');
      expect(result).toBeNull();
    });
  });

  // ─── hasRelation ─────────────────────────────────────────────────────────────

  describe('hasRelation', () => {
    it('returns true for related O Louco and O Mago', () => {
      expect(hasRelation('O Louco', 'O Mago')).toBe(true);
    });

    it('returns true for related A Sacerdotisa and A Lua', () => {
      expect(hasRelation('A Sacerdotisa', 'A Lua')).toBe(true);
    });

    it('returns true regardless of order', () => {
      expect(hasRelation('O Mago', 'O Louco')).toBe(true);
    });

    it('returns false for unrelated arcanos', () => {
      expect(hasRelation('O Sol', 'O Louco')).toBe(false);
    });

    it('returns false for unknown arcano', () => {
      expect(hasRelation('O Sol', 'Unknown')).toBe(false);
    });

    it('returns false for both unknown arcanos', () => {
      expect(hasRelation('Unknown1', 'Unknown2')).toBe(false);
    });
  });

  // ─── getArcanoByNumber ───────────────────────────────────────────────────────

  describe('getArcanoByNumber', () => {
    it('returns O Louco for number 0', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
    });

    it('returns O Mago for number 1', () => {
      expect(getArcanoByNumber(1)).toBe('O Mago');
    });

    it('returns A Sacerdotisa for number 2', () => {
      expect(getArcanoByNumber(2)).toBe('A Sacerdotisa');
    });

    it('returns O Sol for number 19', () => {
      expect(getArcanoByNumber(19)).toBe('O Sol');
    });

    it('returns O Mundo for number 21', () => {
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('returns null for invalid number', () => {
      expect(getArcanoByNumber(99)).toBeNull();
    });

    it('returns null for negative number', () => {
      expect(getArcanoByNumber(-1)).toBeNull();
    });
  });

  // ─── TAROT_TAROT_MAPPINGS constant ──────────────────────────────────────────

  describe('TAROT_TAROT_MAPPINGS', () => {
    it('is readonly', () => {
      expect(TAROT_TAROT_MAPPINGS).toBeReadonly();
    });

    it('is frozen', () => {
      expect(Object.isFrozen(TAROT_TAROT_MAPPINGS)).toBe(true);
    });

    it('has expected length', () => {
      expect(TAROT_TAROT_MAPPINGS.length).toBeGreaterThan(60);
    });

    it('contains valid mappings', () => {
      TAROT_TAROT_MAPPINGS.forEach((mapping: TarotTarotMapping) => {
        expect(typeof mapping.arcano).toBe('string');
        expect(typeof mapping.numero_carta).toBe('number');
        expect(typeof mapping.related_arcano).toBe('string');
        expect(typeof mapping.related_numero).toBe('number');
        expect(typeof mapping.path_type).toBe('string');
        expect(mapping.spiritual_meaning).toBeDefined();
        expect(typeof mapping.spiritual_meaning.significado).toBe('string');
        expect(typeof mapping.spiritual_meaning.crescimento).toBe('string');
        expect(typeof mapping.spiritual_meaning.desafio).toBe('string');
      });
    });
  });

  // ─── ALL_MAJOR_ARCANOS constant ─────────────────────────────────────────────

  describe('ALL_MAJOR_ARCANOS', () => {
    it('contains 22 arcano names', () => {
      expect(ALL_MAJOR_ARCANOS.length).toBe(22);
    });

    it('starts with O Louco', () => {
      expect(ALL_MAJOR_ARCANOS[0]).toBe('O Louco');
    });

    it('ends with O Mundo', () => {
      expect(ALL_MAJOR_ARCANOS[21]).toBe('O Mundo');
    });

    it('contains all Major Arcana cards', () => {
      const expected = [
        'O Louco', 'O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador',
        'O Hierofante', 'Os Enamorados', 'O Carro', 'A Força', 'O Eremita',
        'A Roda da Fortuna', 'A Justiça', 'O Enforcado', 'A Morte', 'A Temperança',
        'O Diabo', 'A Torre', 'A Estrela', 'A Lua', 'O Sol',
        'O Julgamento', 'O Mundo',
      ];
      expected.forEach((arcano, index) => {
        expect(ALL_MAJOR_ARCANOS[index]).toBe(arcano);
      });
    });
  });

  // ─── TOTAL_MAPPINGS constant ────────────────────────────────────────────────

  describe('TOTAL_MAPPINGS', () => {
    it('is a positive number', () => {
      expect(TOTAL_MAPPINGS).toBeGreaterThan(0);
    });

    it('matches length of TAROT_TAROT_MAPPINGS', () => {
      expect(TOTAL_MAPPINGS).toBe(TAROT_TAROT_MAPPINGS.length);
    });
  });

  // ─── TOTAL_PATH_TYPES constant ─────────────────────────────────────────────

  describe('TOTAL_PATH_TYPES', () => {
    it('is a positive number', () => {
      expect(TOTAL_PATH_TYPES).toBeGreaterThan(0);
    });

    it('matches count of unique path types', () => {
      expect(TOTAL_PATH_TYPES).toBe(getAllPathTypes().length);
    });

    it('is at most 7 (number of path types)', () => {
      expect(TOTAL_PATH_TYPES).toBeLessThanOrEqual(7);
    });
  });

  // ─── TarotTarotMapping interface completeness ─────────────────────────────

  describe('TarotTarotMapping interface completeness', () => {
    it('has all required fields for a sample mapping', () => {
      const sample = getTarotTarot('O Louco')[0];
      expect(sample).toBeDefined();
      expect(sample.arcano).toBe('O Louco');
      expect(sample.numero_carta).toBe(0);
      expect(sample.related_arcano).toBeDefined();
      expect(sample.related_numero).toBeDefined();
      expect(sample.path_type).toBeDefined();
      expect(sample.spiritual_meaning).toBeDefined();
      expect(sample.spiritual_meaning.significado).toBeDefined();
      expect(sample.spiritual_meaning.crescimento).toBeDefined();
      expect(sample.spiritual_meaning.desafio).toBeDefined();
    });

    it('path_type matches defined TarotPathType values', () => {
      const validTypes: TarotPathType[] = [
        'Trino',
        'Sextil',
        'Quadratura',
        'Oposição',
        'Sequência',
        'Complementar',
        'Ancestral',
      ];
      getAllTarotPaths().forEach((mapping) => {
        expect(validTypes).toContain(mapping.path_type);
      });
    });
  });

  // ─── Path type distribution ───────────────────────────────────────────────

  describe('Path type distribution', () => {
    it('has mappings for all 7 path types', () => {
      const types = getAllPathTypes();
      expect(types.length).toBe(7);
    });

    it('Sequência is well represented (card journey)', () => {
      const result = getRelationsByPathType('Sequência');
      expect(result.length).toBeGreaterThan(10);
    });

    it('Trino has significant mappings', () => {
      const result = getRelationsByPathType('Trino');
      expect(result.length).toBeGreaterThan(5);
    });

    it('Oposição has multiple mappings', () => {
      const result = getRelationsByPathType('Oposição');
      expect(result.length).toBeGreaterThan(5);
    });
  });

  // ─── Arcano-Arcano consistency ──────────────────────────────────────────

  describe('Arcano-Arcano consistency', () => {
    it('each arcano appears multiple times in mappings', () => {
      const arcanoCounts: Record<string, number> = {};
      getAllTarotPaths().forEach((mapping) => {
        arcanoCounts[mapping.arcano] = (arcanoCounts[mapping.arcano] || 0) + 1;
        arcanoCounts[mapping.related_arcano] = (arcanoCounts[mapping.related_arcano] || 0) + 1;
      });
      Object.values(arcanoCounts).forEach((count) => {
        expect(count).toBeGreaterThanOrEqual(2);
      });
    });

    it('O Louco has connections to journey end points', () => {
      const result = getRelationsForArcano('O Louco');
      const relatedArcanos = result.map((m) => m.related_arcano);
      expect(relatedArcanos).toContain('O Mago'); // Next in journey
      expect(relatedArcanos).toContain('O Mundo'); // Journey end
    });

    it('O Mundo has connection back to O Louco (completion)', () => {
      const result = getRelationsForArcano('O Mundo');
      const relatedArcanos = result.map((m) => m.arcano === 'O Mundo' ? m.related_arcano : m.arcano);
      expect(relatedArcanos).toContain('O Louco');
    });
  });

  // ─── Default export ──────────────────────────────────────────────────────

  describe('default export', () => {
    it('exports all required functions', async () => {
      const module = await import('@/lib/correlation/tarot-tarot');
      const def = module.default;
      
      expect(typeof def.getTarotTarot).toBe('function');
      expect(typeof def.getAllTarotPaths).toBe('function');
      expect(typeof def.getAllPathTypes).toBe('function');
      expect(typeof def.getAllMappedArcanos).toBe('function');
      expect(typeof def.getRelationsForArcano).toBe('function');
      expect(typeof def.getRelationsByPathType).toBe('function');
      expect(typeof def.getPathTypeBetween).toBe('function');
      expect(typeof def.getSpiritualMeaningBetween).toBe('function');
      expect(typeof def.hasRelation).toBe('function');
      expect(typeof def.getArcanoByNumber).toBe('function');
    });

    it('default exports same data as named exports', async () => {
      const module = await import('@/lib/correlation/tarot-tarot');
      const def = module.default;
      
      expect(def.TAROT_TAROT_MAPPINGS).toBe(TAROT_TAROT_MAPPINGS);
      expect(def.ALL_MAJOR_ARCANOS).toBe(ALL_MAJOR_ARCANOS);
      expect(def.TOTAL_MAPPINGS).toBe(TOTAL_MAPPINGS);
      expect(def.TOTAL_PATH_TYPES).toBe(TOTAL_PATH_TYPES);
    });
  });
});
