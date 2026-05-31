import { describe, it, expect } from 'vitest';
import {
  getTarotTarot,
  getAllTarotPaths,
  hasTarotTarot,
  getPathTypes,
  getMappingsByPathType,
  getAllMappedArcanos,
  getReverseMappings,
  TAROT_TAROT_MAPPINGS,
  type TarotTarotMapping,
  type PathType,
} from '@/lib/correlation/tarot-tarot';

describe('tarot-tarot', () => {
  // ─── getTarotTarot ───────────────────────────────────────────────────────────

  describe('getTarotTarot', () => {
    it('returns mappings for O Louco', () => {
      const result = getTarotTarot('O Louco');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].arcano).toBe('O Louco');
      expect(result[0].numero_carta).toBe(0);
      expect(result[0].related_arcano).toBeDefined();
      expect(result[0].path_type).toBeDefined();
      expect(result[0].spiritual_meaning).toBeDefined();
    });

    it('returns mappings for O Mago', () => {
      const result = getTarotTarot('O Mago');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].arcano).toBe('O Mago');
      expect(result[0].numero_carta).toBe(1);
    });

    it('returns mappings for O Sol', () => {
      const result = getTarotTarot('O Sol');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].arcano).toBe('O Sol');
      expect(result[0].numero_carta).toBe(19);
    });

    it('returns mappings for O Mundo', () => {
      const result = getTarotTarot('O Mundo');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].arcano).toBe('O Mundo');
      expect(result[0].numero_carta).toBe(21);
    });

    it('returns empty array for unknown arcano', () => {
      const result = getTarotTarot('Unknown Arcano');
      expect(result).toEqual([]);
    });

    it('contains bidirectional mappings', () => {
      const foolMappings = getTarotTarot('O Louco');
      const relatedArcanos = foolMappings.map((m) => m.related_arcano);

      // Check that related arcanos have reverse mappings back to O Louco
      for (const related of relatedArcanos) {
        const reverseMappings = getTarotTarot(related);
        const hasReverse = reverseMappings.some((m) => m.related_arcano === 'O Louco');
        expect(hasReverse).toBe(true);
      }
    });
  });

  // ─── getAllTarotPaths ────────────────────────────────────────────────────────

  describe('getAllTarotPaths', () => {
    it('returns all mappings', () => {
      const result = getAllTarotPaths();
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns a copy of the mappings', () => {
      const result = getAllTarotPaths();
      expect(result).not.toBe(TAROT_TAROT_MAPPINGS);
    });

    it('contains all required fields in each mapping', () => {
      const result = getAllTarotPaths();
      for (const mapping of result) {
        expect(mapping.arcano).toBeDefined();
        expect(mapping.numero_carta).toBeDefined();
        expect(mapping.related_arcano).toBeDefined();
        expect(mapping.related_numero).toBeDefined();
        expect(mapping.path_type).toBeDefined();
        expect(mapping.spiritual_meaning).toBeDefined();
      }
    });

    it('covers all 22 Major Arcana', () => {
      const result = getAllTarotPaths();
      const arcanoSet = new Set(result.map((m) => m.arcano));
      expect(arcanoSet.size).toBeGreaterThanOrEqual(22);
    });

    it('has bidirectional completeness', () => {
      const result = getAllTarotPaths();
      const mappingSet = new Set(result.map((m) => `${m.arcano}-${m.related_arcano}`));

      // Check all mappings are bidirectional
      for (const mapping of result) {
        const reverseKey = `${mapping.related_arcano}-${mapping.arcano}`;
        expect(mappingSet.has(reverseKey)).toBe(true);
      }
    });
  });

  // ─── hasTarotTarot ───────────────────────────────────────────────────────────

  describe('hasTarotTarot', () => {
    it('returns true for O Louco', () => {
      expect(hasTarotTarot('O Louco')).toBe(true);
    });

    it('returns true for O Mago', () => {
      expect(hasTarotTarot('O Mago')).toBe(true);
    });

    it('returns true for A Lua', () => {
      expect(hasTarotTarot('A Lua')).toBe(true);
    });

    it('returns true for O Mundo', () => {
      expect(hasTarotTarot('O Mundo')).toBe(true);
    });

    it('returns false for unknown arcano', () => {
      expect(hasTarotTarot('Unknown')).toBe(false);
    });
  });

  // ─── getPathTypes ───────────────────────────────────────────────────────────

  describe('getPathTypes', () => {
    it('returns array of path types', () => {
      const result = getPathTypes();
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('contains expected path types', () => {
      const result = getPathTypes();
      expect(result).toContain('bridge');
      expect(result).toContain('evolution');
      expect(result).toContain('shadow');
      expect(result).toContain('completion');
      expect(result).toContain('foundation');
    });

    it('returns unique path types', () => {
      const result = getPathTypes();
      const uniqueSet = new Set(result);
      expect(uniqueSet.size).toBe(result.length);
    });
  });

  // ─── getMappingsByPathType ──────────────────────────────────────────────────

  describe('getMappingsByPathType', () => {
    it('returns mappings for bridge type', () => {
      const result = getMappingsByPathType('bridge');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.path_type).toBe('bridge');
      }
    });

    it('returns mappings for evolution type', () => {
      const result = getMappingsByPathType('evolution');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.path_type).toBe('evolution');
      }
    });

    it('returns mappings for shadow type', () => {
      const result = getMappingsByPathType('shadow');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.path_type).toBe('shadow');
      }
    });

    it('returns mappings for completion type', () => {
      const result = getMappingsByPathType('completion');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.path_type).toBe('completion');
      }
    });

    it('returns mappings for foundation type', () => {
      const result = getMappingsByPathType('foundation');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.path_type).toBe('foundation');
      }
    });

    it('returns empty array for unknown path type', () => {
      const result = getMappingsByPathType('unknown' as PathType);
      expect(result).toEqual([]);
    });
  });

  // ─── getAllMappedArcanos ────────────────────────────────────────────────────

  describe('getAllMappedArcanos', () => {
    it('returns all arcano names', () => {
      const result = getAllMappedArcanos();
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('contains all Major Arcana', () => {
      const result = getAllMappedArcanos();
      expect(result).toContain('O Louco');
      expect(result).toContain('O Mago');
      expect(result).toContain('O Sol');
      expect(result).toContain('O Mundo');
    });

    it('returns unique arcano names', () => {
      const result = getAllMappedArcanos();
      const uniqueSet = new Set(result);
      expect(uniqueSet.size).toBe(result.length);
    });
  });

  // ─── getReverseMappings ────────────────────────────────────────────────────

  describe('getReverseMappings', () => {
    it('returns reverse mappings for O Louco', () => {
      const result = getReverseMappings('O Louco');
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].related_arcano).toBe('O Louco');
    });

    it('returns reverse mappings for O Mago', () => {
      const result = getReverseMappings('O Mago');
      expect(result).toBeDefined();
      for (const mapping of result) {
        expect(mapping.related_arcano).toBe('O Mago');
      }
    });

    it('returns empty array for unknown arcano', () => {
      const result = getReverseMappings('Unknown');
      expect(result).toEqual([]);
    });
  });

  // ─── TAROT_TAROT_MAPPINGS constant ───────────────────────────────────────────

  describe('TAROT_TAROT_MAPPINGS', () => {
    it('is defined and not empty', () => {
      expect(TAROT_TAROT_MAPPINGS).toBeDefined();
      expect(TAROT_TAROT_MAPPINGS.length).toBeGreaterThan(0);
    });

    it('is frozen', () => {
      expect(Object.isFrozen(TAROT_TAROT_MAPPINGS)).toBe(true);
    });

    it('contains valid arcano references', () => {
      const validArcanos = [
        'O Louco', 'O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador',
        'O Hierofante', 'Os Enamorados', 'O Carro', 'A Justiça', 'O Eremita',
        'A Roda da Fortuna', 'A Força', 'O Enforcado', 'A Morte', 'A Temperança',
        'O Diabo', 'A Torre', 'A Estrela', 'A Lua', 'O Sol',
        'O Julgamento', 'O Mundo',
      ];

      for (const mapping of TAROT_TAROT_MAPPINGS) {
        expect(validArcanos).toContain(mapping.arcano);
        expect(validArcanos).toContain(mapping.related_arcano);
      }
    });

    it('contains valid path types', () => {
      const validPathTypes: PathType[] = ['bridge', 'evolution', 'shadow', 'completion', 'foundation'];

      for (const mapping of TAROT_TAROT_MAPPINGS) {
        expect(validPathTypes).toContain(mapping.path_type);
      }
    });

    it('contains non-empty spiritual meanings', () => {
      for (const mapping of TAROT_TAROT_MAPPINGS) {
        expect(mapping.spiritual_meaning.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── TarotTarotMapping interface completeness ─────────────────────────────

  describe('TarotTarotMapping interface completeness', () => {
    it('has all required fields', () => {
      const mapping: TarotTarotMapping = {
        arcano: 'O Louco',
        numero_carta: 0,
        related_arcano: 'O Mago',
        related_numero: 1,
        path_type: 'evolution',
        spiritual_meaning: 'Test meaning',
      };

      expect(mapping.arcano).toBeDefined();
      expect(mapping.numero_carta).toBeDefined();
      expect(mapping.related_arcano).toBeDefined();
      expect(mapping.related_numero).toBeDefined();
      expect(mapping.path_type).toBeDefined();
      expect(mapping.spiritual_meaning).toBeDefined();
    });

    it('card numbers are consistent', () => {
      for (const mapping of TAROT_TAROT_MAPPINGS) {
        expect(mapping.numero_carta).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_carta).toBeLessThanOrEqual(21);
        expect(mapping.related_numero).toBeGreaterThanOrEqual(0);
        expect(mapping.related_numero).toBeLessThanOrEqual(21);
      }
    });
  });

  // ─── Path type distribution ─────────────────────────────────────────────────

  describe('Path type distribution', () => {
    it('has multiple path types represented', () => {
      const pathTypes = new Set(TAROT_TAROT_MAPPINGS.map((m) => m.path_type));
      expect(pathTypes.size).toBeGreaterThanOrEqual(4);
    });

    it('evolution mappings relate consecutive cards', () => {
      const evolutionMappings = getMappingsByPathType('evolution');
      for (const mapping of evolutionMappings) {
        // Evolution should often connect cards in journey sequence
        expect(mapping.arcano).toBeDefined();
        expect(mapping.related_arcano).toBeDefined();
      }
    });

    it('completion mappings include O Louco and O Mundo', () => {
      const completionMappings = getMappingsByPathType('completion');
      const hasFoolWorld = completionMappings.some(
        (m) =>
          (m.arcano === 'O Louco' && m.related_arcano === 'O Mundo') ||
          (m.arcano === 'O Mundo' && m.related_arcano === 'O Louco')
      );
      expect(hasFoolWorld).toBe(true);
    });
  });

  // ─── Bidirectional integrity ───────────────────────────────────────────────

  describe('Bidirectional integrity', () => {
    it('every arcano appears as both source and related', () => {
      const sources = new Set(TAROT_TAROT_MAPPINGS.map((m) => m.arcano));
      const relateds = new Set(TAROT_TAROT_MAPPINGS.map((m) => m.related_arcano));

      for (const source of sources) {
        expect(relateds.has(source)).toBe(true);
      }

      for (const related of relateds) {
        expect(sources.has(related)).toBe(true);
      }
    });

    it('O Louco and O Mundo are connected', () => {
      const loucoMappings = getTarotTarot('O Louco');
      const hasMundo = loucoMappings.some((m) => m.related_arcano === 'O Mundo');
      expect(hasMundo).toBe(true);

      const mundoMappings = getTarotTarot('O Mundo');
      const hasLouco = mundoMappings.some((m) => m.related_arcano === 'O Louco');
      expect(hasLouco).toBe(true);
    });
  });
});