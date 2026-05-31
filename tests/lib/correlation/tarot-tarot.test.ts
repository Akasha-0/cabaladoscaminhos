import { describe, it, expect } from 'vitest';
import {
  getTarotTarot,
  getAllTarotPaths,
  getAllPathTypes,
  getPathsByType,
  getArcanoRelations,
  hasPath,
  getAllArcanos,
  TAROT_TAROT_MAPPINGS,
  type TarotTarotMapping,
} from '@/lib/correlation/tarot-tarot';

describe('tarot-tarot', () => {
  // ─── getTarotTarot ─────────────────────────────────────────────────────────

  describe('getTarotTarot', () => {
    it('returns mapping for O Louco', () => {
      const result = getTarotTarot('O Louco');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Louco');
      expect(result?.numero_carta).toBe(0);
      expect(result?.related_arcano).toBe('O Mago');
      expect(result?.path_type).toBe('diagonal');
      expect(result?.spiritual_meaning).toBeDefined();
    });

    it('returns mapping for O Sol', () => {
      const result = getTarotTarot('O Sol');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Sol');
      expect(result?.numero_carta).toBe(19);
      expect(result?.related_arcano).toBe('O Julgamento');
    });

    it('returns mapping for A Lua', () => {
      const result = getTarotTarot('A Lua');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('A Lua');
      expect(result?.numero_carta).toBe(18);
      expect(result?.related_arcano).toBe('O Sol');
    });

    it('returns mapping for O Mago', () => {
      const result = getTarotTarot('O Mago');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Mago');
      expect(result?.numero_carta).toBe(1);
      expect(result?.related_arcano).toBe('A Sacerdotisa');
    });

    it('returns mapping for A Imperatriz', () => {
      const result = getTarotTarot('A Imperatriz');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('A Imperatriz');
      expect(result?.numero_carta).toBe(3);
      expect(result?.related_arcano).toBe('O Imperador');
    });

    it('returns mapping for A Estrela', () => {
      const result = getTarotTarot('A Estrela');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('A Estrela');
      expect(result?.numero_carta).toBe(17);
      expect(result?.related_arcano).toBe('A Lua');
    });

    it('returns mapping for O Mundo', () => {
      const result = getTarotTarot('O Mundo');
      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Mundo');
      expect(result?.numero_carta).toBe(21);
      expect(result?.related_arcano).toBe('O Louco');
    });

    it('returns null for unknown arcano', () => {
      expect(getTarotTarot('inexistente')).toBeNull();
      expect(getTarotTarot('Carta Inválida')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getTarotTarot('')).toBeNull();
    });
  });

  // ─── getAllTarotPaths ───────────────────────────────────────────────────────

  describe('getAllTarotPaths', () => {
    it('returns array of all mappings', () => {
      const result = getAllTarotPaths();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns mappings sorted by card number', () => {
      const result = getAllTarotPaths();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].numero_carta).toBeGreaterThanOrEqual(result[i - 1].numero_carta);
      }
    });

    it('includes first arcano correctly', () => {
      const result = getAllTarotPaths();
      expect(result[0].arcano).toBe('O Louco');
      expect(result[0].numero_carta).toBe(0);
    });

    it('all mappings have required properties', () => {
      const result = getAllTarotPaths();
      result.forEach((mapping) => {
        expect(mapping.arcano).toBeDefined();
        expect(typeof mapping.numero_carta).toBe('number');
        expect(mapping.related_arcano).toBeDefined();
        expect(typeof mapping.related_numero).toBe('number');
        expect(mapping.path_type).toBeDefined();
        expect(mapping.spiritual_meaning).toBeDefined();
      });
    });

    it('each arcano in result has consistent card number', () => {
      const result = getAllTarotPaths();
      result.forEach((mapping) => {
        expect(mapping.numero_carta).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_carta).toBeLessThanOrEqual(21);
        expect(mapping.related_numero).toBeGreaterThanOrEqual(0);
        expect(mapping.related_numero).toBeLessThanOrEqual(21);
      });
    });
  });

  // ─── getAllPathTypes ────────────────────────────────────────────────────────

  describe('getAllPathTypes', () => {
    it('returns array of unique path types', () => {
      const result = getAllPathTypes();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('includes diagonal path type', () => {
      const result = getAllPathTypes();
      expect(result).toContain('diagonal');
    });

    it('includes horizontal path type', () => {
      const result = getAllPathTypes();
      expect(result).toContain('horizontal');
    });

    it('returns no duplicates', () => {
      const result = getAllPathTypes();
      const unique = [...new Set(result)];
      expect(result.length).toBe(unique.length);
    });
  });

  // ─── getPathsByType ─────────────────────────────────────────────────────────

  describe('getPathsByType', () => {
    it('returns paths with diagonal type', () => {
      const result = getPathsByType('diagonal');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.path_type).toBe('diagonal');
      });
    });

    it('returns paths with horizontal type', () => {
      const result = getPathsByType('horizontal');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.path_type).toBe('horizontal');
      });
    });

    it('returns paths with vertical type', () => {
      const result = getPathsByType('vertical');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.path_type).toBe('vertical');
      });
    });

    it('returns empty array for invalid type', () => {
      const result = getPathsByType('invalid');
      expect(result).toEqual([]);
    });
  });

  // ─── getArcanoRelations ─────────────────────────────────────────────────────

  describe('getArcanoRelations', () => {
    it('returns all relations for O Louco', () => {
      const result = getArcanoRelations('O Louco');
      expect(result.length).toBeGreaterThan(0);
      const allRelated = result.some(
        (m) => m.arcano === 'O Louco' || m.related_arcano === 'O Louco'
      );
      expect(allRelated).toBe(true);
    });

    it('returns all relations for O Sol', () => {
      const result = getArcanoRelations('O Sol');
      expect(result.length).toBeGreaterThan(0);
      const allRelated = result.some(
        (m) => m.arcano === 'O Sol' || m.related_arcano === 'O Sol'
      );
      expect(allRelated).toBe(true);
    });

    it('returns empty array for unknown arcano', () => {
      const result = getArcanoRelations('inexistente');
      expect(result).toEqual([]);
    });
  });

  // ─── hasPath ────────────────────────────────────────────────────────────────

  describe('hasPath', () => {
    it('returns true for existing path O Louco -> O Mago', () => {
      expect(hasPath('O Louco', 'O Mago')).toBe(true);
    });

    it('returns true for existing path O Sol -> O Julgamento', () => {
      expect(hasPath('O Sol', 'O Julgamento')).toBe(true);
    });

    it('returns true for reverse direction', () => {
      expect(hasPath('O Mago', 'O Louco')).toBe(true);
    });

    it('returns false for non-existing path', () => {
      expect(hasPath('O Imperador', 'A Morte')).toBe(false);
    });

    it('returns false for unknown arcanos', () => {
      expect(hasPath('inexistente', 'O Sol')).toBe(false);
      expect(hasPath('O Sol', 'inexistente')).toBe(false);
    });

    it('returns false for empty strings', () => {
      expect(hasPath('', 'O Sol')).toBe(false);
      expect(hasPath('O Sol', '')).toBe(false);
    });
  });

  // ─── getAllArcanos ──────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns array of arcano names', () => {
      const result = getAllArcanos();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns names sorted by card number', () => {
      const result = getAllArcanos();
      for (let i = 1; i < result.length; i++) {
        const prev = TAROT_TAROT_MAPPINGS[result[i - 1]];
        const curr = TAROT_TAROT_MAPPINGS[result[i]];
        if (prev && curr) {
          expect(curr.numero_carta).toBeGreaterThanOrEqual(prev.numero_carta);
        }
      }
    });

    it('includes O Louco first', () => {
      const result = getAllArcanos();
      expect(result[0]).toBe('O Louco');
    });

    it('no duplicates', () => {
      const result = getAllArcanos();
      const unique = [...new Set(result)];
      expect(result.length).toBe(unique.length);
    });
  });

  // ─── TAROT_TAROT_MAPPINGS constant ──────────────────────────────────────────

  describe('TAROT_TAROT_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(TAROT_TAROT_MAPPINGS)).toBe(true);
    });

    it('has 22 mapping entries', () => {
      expect(Object.keys(TAROT_TAROT_MAPPINGS).length).toBe(22);
    });

    it('all inner mappings are frozen', () => {
      Object.values(TAROT_TAROT_MAPPINGS).forEach((mapping) => {
        expect(Object.isFrozen(mapping)).toBe(true);
      });
    });
  });

  // ─── TarotTarotMapping interface completeness ─────────────────────────────

  describe('TarotTarotMapping interface completeness', () => {
    it('all mappings have arcano property', () => {
      Object.values(TAROT_TAROT_MAPPINGS).forEach((mapping) => {
        expect(mapping.arcano).toBeDefined();
        expect(typeof mapping.arcano).toBe('string');
      });
    });

    it('all mappings have numero_carta property', () => {
      Object.values(TAROT_TAROT_MAPPINGS).forEach((mapping) => {
        expect(typeof mapping.numero_carta).toBe('number');
        expect(mapping.numero_carta).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_carta).toBeLessThanOrEqual(21);
      });
    });

    it('all mappings have related_arcano property', () => {
      Object.values(TAROT_TAROT_MAPPINGS).forEach((mapping) => {
        expect(mapping.related_arcano).toBeDefined();
        expect(typeof mapping.related_arcano).toBe('string');
      });
    });

    it('all mappings have related_numero property', () => {
      Object.values(TAROT_TAROT_MAPPINGS).forEach((mapping) => {
        expect(typeof mapping.related_numero).toBe('number');
        expect(mapping.related_numero).toBeGreaterThanOrEqual(0);
        expect(mapping.related_numero).toBeLessThanOrEqual(21);
      });
    });

    it('all mappings have valid path_type', () => {
      const validTypes = ['diagonal', 'horizontal', 'vertical', 'adjacent'];
      Object.values(TAROT_TAROT_MAPPINGS).forEach((mapping) => {
        expect(validTypes).toContain(mapping.path_type);
      });
    });

    it('all mappings have spiritual_meaning property', () => {
      Object.values(TAROT_TAROT_MAPPINGS).forEach((mapping) => {
        expect(mapping.spiritual_meaning).toBeDefined();
        expect(typeof mapping.spiritual_meaning).toBe('string');
        expect(mapping.spiritual_meaning.length).toBeGreaterThan(0);
      });
    });
  });

  // ─── Tarot-Tarot path consistency ───────────────────────────────────────────

  describe('Tarot-Tarot path consistency', () => {
    it('O Louco connects to O Mago', () => {
      const result = getTarotTarot('O Louco');
      expect(result?.related_arcano).toBe('O Mago');
    });

    it('O Mundo connects back to O Louco (cycle completion)', () => {
      const result = getTarotTarot('O Mundo');
      expect(result?.related_arcano).toBe('O Louco');
    });

    it('sequential cards connect to their neighbors', () => {
      expect(hasPath('O Mago', 'A Sacerdotisa')).toBe(true);
      expect(hasPath('A Imperatriz', 'O Imperador')).toBe(true);
      expect(hasPath('A Justica', 'O Eremita')).toBe(true);
    });
  });

  // ─── Path type distribution ────────────────────────────────────────────────

  describe('Path type distribution', () => {
    it('has multiple diagonal paths', () => {
      const diagonal = getPathsByType('diagonal');
      expect(diagonal.length).toBeGreaterThan(0);
    });

    it('has multiple horizontal paths', () => {
      const horizontal = getPathsByType('horizontal');
      expect(horizontal.length).toBeGreaterThan(5);
    });

    it('has at least one vertical path', () => {
      const vertical = getPathsByType('vertical');
      expect(vertical.length).toBeGreaterThanOrEqual(1);
    });

    it('card numbers are consistent with arcano names', () => {
      const cardMap: Record<number, string> = {
        0: 'O Louco',
        1: 'O Mago',
        2: 'A Sacerdotisa',
        3: 'A Imperatriz',
        4: 'O Imperador',
        5: 'O Hierofante',
        6: 'Os Enamorados',
        7: 'O Carro',
        8: 'A Justica',
        9: 'O Eremita',
        10: 'A Roda da Fortuna',
        11: 'A Forca',
        12: 'O Enforcado',
        13: 'A Morte',
        14: 'A Temperanca',
        15: 'O Diabo',
        16: 'A Torre',
        17: 'A Estrela',
        18: 'A Lua',
        19: 'O Sol',
        20: 'O Julgamento',
        21: 'O Mundo',
      };

      Object.values(TAROT_TAROT_MAPPINGS).forEach((mapping) => {
        const expectedName = cardMap[mapping.numero_carta];
        if (expectedName) {
          expect(mapping.arcano).toBe(expectedName);
        }
      });
    });
  });
});
