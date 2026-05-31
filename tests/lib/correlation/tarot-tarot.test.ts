import { describe, it, expect } from 'vitest';
import {
  getTarotTarot,
  getRelatedArcano,
  getAllTarotPaths,
  getAllArcanos,
  hasTarotTarot,
  getArcanoByNumber,
  getRelatedByNumber,
  getArcanosByPathType,
  getAllPathTypes,
  getPathNumber,
  getPathType,
  getSpiritualMeaning,
  getArcanosByPathNumber,
  TAROT_TAROT_MAPPINGS,
  MAJOR_ARCANA_NAMES,
  PATH_TYPES,
  getSpiritualMeaning,
  type TarotTarotMapping,
} from '@/lib/correlation/tarot-tarot';

describe('tarot-tarot', () => {
  // ─── getTarotTarot ───────────────────────────────────────────────────────

  describe('getTarotTarot', () => {
    it('returns mapping for O Sol', () => {
      const result = getTarotTarot('O Sol');
      expect(result).toBeDefined();
      expect(result?.numero_caminho).toBe(19);
      expect(result?.related_arcano).toBe('O Julgamento');
      expect(result?.related_numero).toBe(20);
      expect(result?.path_type).toBe('adjacent_path');
      expect(result?.spiritual_meaning).toBeDefined();
    });

    it('returns mapping for A Lua', () => {
      const result = getTarotTarot('A Lua');
      expect(result).toBeDefined();
      expect(result?.numero_caminho).toBe(18);
      expect(result?.related_arcano).toBe('O Sol');
      expect(result?.related_numero).toBe(19);
      expect(result?.path_type).toBe('adjacent_path');
    });

    it('returns mapping for O Louco', () => {
      const result = getTarotTarot('O Louco');
      expect(result).toBeDefined();
      expect(result?.numero_caminho).toBe(0);
      expect(result?.related_arcano).toBe('O Mago');
      expect(result?.related_numero).toBe(1);
      expect(result?.path_type).toBe('progression');
    });

    it('returns mapping for O Mago', () => {
      const result = getTarotTarot('O Mago');
      expect(result).toBeDefined();
      expect(result?.numero_caminho).toBe(1);
      expect(result?.related_arcano).toBe('A Sacerdotisa');
      expect(result?.related_numero).toBe(2);
      expect(result?.path_type).toBe('adjacent_path');
    });

    it('returns mapping for A Sacerdotisa', () => {
      const result = getTarotTarot('A Sacerdotisa');
      expect(result).toBeDefined();
      expect(result?.numero_caminho).toBe(2);
      expect(result?.related_arcano).toBe('A Imperatriz');
      expect(result?.related_numero).toBe(3);
      expect(result?.path_type).toBe('adjacent_path');
    });

    it('returns mapping for A Imperatriz', () => {
      const result = getTarotTarot('A Imperatriz');
      expect(result).toBeDefined();
      expect(result?.numero_caminho).toBe(3);
      expect(result?.related_arcano).toBe('O Imperador');
      expect(result?.related_numero).toBe(4);
      expect(result?.path_type).toBe('same_sephirot');
    });

    it('returns mapping for O Mundo', () => {
      const result = getTarotTarot('O Mundo');
      expect(result).toBeDefined();
      expect(result?.numero_caminho).toBe(21);
      expect(result?.related_arcano).toBe('O Louco');
      expect(result?.path_type).toBe('progression');
    });

    it('returns null for unknown arcano', () => {
      expect(getTarotTarot('inexistente')).toBeNull();
      expect(getTarotTarot('Carta Inválida')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getTarotTarot('')).toBeNull();
    });
  });

  // ─── getRelatedArcano ──────────────────────────────────────────────────────

  describe('getRelatedArcano', () => {
    it('returns related arcano for O Sol', () => {
      expect(getRelatedArcano('O Sol')).toBe('O Julgamento');
    });

    it('returns related arcano for A Estrela', () => {
      expect(getRelatedArcano('A Estrela')).toBe('A Lua');
    });

    it('returns related arcano for A Torre', () => {
      expect(getRelatedArcano('A Torre')).toBe('A Estrela');
    });

    it('returns related arcano for O Mundo', () => {
      expect(getRelatedArcano('O Mundo')).toBe('O Louco');
    });

    it('returns null for unknown arcano', () => {
      expect(getRelatedArcano('inexistente')).toBeNull();
    });
  });

  // ─── getAllTarotPaths ─────────────────────────────────────────────────

  describe('getAllTarotPaths', () => {
    it('returns all 22 mappings', () => {
      const paths = getAllTarotPaths();
      expect(paths).toHaveLength(22);
    });

    it('returns mappings in order by path number', () => {
      const paths = getAllTarotPaths();
      for (let i = 0; i < paths.length - 1; i++) {
        expect(paths[i].numero_caminho).toBeLessThan(paths[i + 1].numero_caminho);
      }
    });

    it('each mapping has required properties', () => {
      const paths = getAllTarotPaths();
      paths.forEach((mapping) => {
        expect(mapping.arcano).toBeDefined();
        expect(mapping.numero_caminho).toBeDefined();
        expect(mapping.related_arcano).ltoBeDefined();
        expect(mapping.related_numero).toBeDefined();
        expect(mapping.path_type).toBeDefined();
        expect(mapping.spiritual_meaning).toBeDefined();
      });
    });

    it('path numbers range from 0 to 21', () => {
      const paths = getAllTarotPaths();
      expect(paths[0].numero_caminho).toBe(0);
      expect(paths[paths.length - 1].numero_caminho).toBe(21);
    });

    it('all arcanos in mapping are from MAJOR_ARCANA_NAMES', () => {
      const paths = getAllTarotPaths();
      paths.forEach((mapping) => {
        expect(MAJOR_ARCANA_NAMES).toContain(mapping.arcano);
        expect(MAJOR_ARCANA_NAMES).toContain(mapping.related_arcano);
      });
    });
  });

  // ─── getAllArcanos ──────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns array with all 22 arcano names', () => {
      const arcanos = getAllArcanos();
      expect(arcanos).toHaveLength(22);
    });

    it('returns arcano names in order', () => {
      const arcanos = getAllArcanos();
      expect(arcanos[0]).toBe('O Louco');
      expect(arcanos[21]).toBe('O Mundo');
    });

    it('first arcano is O Louco', () => {
      expect(getAllArcanos()[0]).toBe('O Louco');
    });

    it('last arcano is O Mundo', () => {
      expect(getAllArcanos()[21]).toBe('O Mundo');
    });
  });

  // ─── hasTarotTarot ─────────────────────────────────────────────────────

  describe('hasTarotTarot', () => {
    it('returns true for existing arcano', () => {
      expect(hasTarotTarot('O Sol')).toBe(true);
      expect(hasTarotTarot('A Lua')).toBe(true);
      expect(hasTarotTarot('O Louco')).toBe(true);
    });

    it('returns false for unknown arcano', () => {
      expect(hasTarotTarot('inexistente')).toBe(false);
      expect(hasTarotTarot('Carta Inválida')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasTarotTarot('')).toBe(false);
    });
  });

  // ─── getArcanoByNumber ─────────────────────────────────────────────────────

  describe('getArcanoByNumber', () => {
    it('returns arcano for number 0', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
    });

    it('returns arcano for number 19', () => {
      expect(getArcanoByNumber(19)).toBe('O Sol');
    });

    it('returns arcano for number 21', () => {
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('returns null for invalid number', () => {
      expect(getArcanoByNumber(22)).toBeNull();
      expect(getArcanoByNumber(-1)).toBeNull();
    });
  });

  // ─── getRelatedByNumber ────────────────────────────────────────────────────

  describe('getRelatedByNumber', () => {
    it('returns related arcano for number 0', () => {
      expect(getRelatedByNumber(0)).toBe('O Mago');
    });

    it('returns related arcano for number 19', () => {
      expect(getRelatedByNumber(19)).toBe('O Julgamento');
    });

    it('returns null for invalid number', () => {
      expect(getRelatedByNumber(22)).toBeNull();
      expect(getRelatedByNumber(-1)).toBeNull();
    });
  });

  // ─── getArcanosByPathType ───────────────────────────────────────────────────

  describe('getArcanosByPathType', () => {
    it('returns arcano mappings for adjacent_path', () => {
      const paths = getArcanosByPathType('adjacent_path');
      expect(paths.length).toBeGreaterThan(0);
      paths.forEach((mapping) => {
        expect(mapping.path_type).toBe('adjacent_path');
      });
    });

    it('returns arcano mappings for progression', () => {
      const paths = getArcanosByPathType('progression');
      expect(paths.length).toBe(2); // O Louco and O Mundo
      paths.forEach((mapping) => {
        expect(mapping.path_type).toBe('progression');
      });
    });

    it('returns arcano mappings for same_sephirot', () => {
      const paths = getArcanosByPathType('same_sephirot');
      expect(paths.length).toBeGreaterThan(0);
      paths.forEach((mapping) => {
        expect(mapping.path_type).toBe('same_sephirot');
      });
    });
  });

  // ─── getAllPathTypes ────────────────────────────────────────────────────

  describe('getAllPathTypes', () => {
    it('returns all path types', () => {
      const types = getAllPathTypes();
      expect(types).toContain('same_sephirot');
      expect(types).toContain('adjacent_path');
      expect(types).toContain('progression');
    });

    it('returns exactly 3 path types', () => {
      expect(getAllPathTypes()).toHaveLength(3);
    });
  });

  // ─── getPathNumber ─────────────────────────────────────────────────────

  describe('getPathNumber', () => {
    it('returns path number for O Sol', () => {
      expect(getPathNumber('O Sol')).toBe(19);
    });

    it('returns path number for A Lua', () => {
      expect(getPathNumber('A Lua')).toBe(18);
    });

    it('returns path number for O Louco', () => {
      expect(getPathNumber('O Louco')).toBe(0);
    });

    it('returns path number for O Mundo', () => {
      expect(getPathNumber('O Mundo')).toBe(21);
    });

    it('returns null for unknown arcano', () => {
      expect(getPathNumber('inexistente')).toBeNull();
    });
  });

  // ─── getPathType ─────────────────────────────────────────────────────

  describe('getPathType', () => {
    it('returns path type for O Sol', () => {
      expect(getPathType('O Sol')).toBe('adjacent_path');
    });

    it('returns path type for O Louco', () => {
      expect(getPathType('O Louco')).toBe('progression');
    });

    it('returns path type for A Imperatriz', () => {
      expect(getPathType('A Imperatriz')).toBe('same_sephirot');
    });

    it('returns null for unknown arcano', () => {
      expect(getPathType('inexistente')).toBeNull();
    });
  });

  // ─── getSpiritualMeaning ─────────────────────────────────────────────────────

  describe('getSpiritualMeaning', () => {
    it('returns spiritual meaning for O Sol', () => {
      const meaning = getSpiritualMeaning('O Sol');
      expect(meaning).toBeDefined();
      expect(meaning?.length).toBeGreaterThan(0);
    });

    it('returns spiritual meaning for A Lua', () => {
      const meaning = getSpiritualMeaning('A Lua');
      expect(meaning).toBeDefined();
      expect(meaning?.length).toBeGreaterThan(0);
    });

    it('returns spiritual meaning for O Mundo', () => {
      const meaning = getSpiritualMeaning('O Mundo');
      expect(meaning).toBeDefined();
      expect(meaning?.length).toBeGreaterThan(0);
    });

    it('returns null for unknown arcano', () => {
      expect(getSpiritualMeaning('inexistente')).toBeNull();
    });
  });

  // ─── getArcanosByPathNumber ────────────────────────────────────────────────────

  describe('getArcanosByPathNumber', () => {
    it('returns mapping for valid path number', () => {
      const paths = getArcanosByPathNumber(0);
      expect(paths.length).toBe(1);
      expect(paths[0].arcano).toBe('O Louco');
    });

    it('returns empty array for invalid path number', () => {
      const paths = getArcanosByPathNumber(99);
      expect(paths).toHaveLength(0);
    });
  });

  // ─── MAJOR_ARCANA_NAMES constant ─────────────────────────────────────────

  describe('MAJOR_ARCANA_NAMES', () => {
    it('contains all 22 arcano names', () => {
      expect(MAJOR_ARCANA_NAMES).toHaveLength(22);
    });

    it('starts with O Louco', () => {
      expect(MAJOR_ARCANA_NAMES[0]).toBe('O Louco');
    });

    it('ends with O Mundo', () => {
      expect(MAJOR_ARCANA_NAMES[21]).toBe('O Mundo');
    });

    it('includes key arcano names', () => {
      expect(MAJOR_ARCANA_NAMES).toContain('O Sol');
      expect(MAJOR_ARCANA_NAMES).toContain('A Lua');
      expect(MAJOR_ARCANA_NAMES).toContain('A Estrela');
    });
  });

  // ─── PATH_TYPES constant ─────────────────────────────────────────────

  describe('PATH_TYPES', () => {
    it('contains 3 path types', () => {
      expect(PATH_TYPES).toHaveLength(3);
    });

    it('includes all required path types', () => {
      expect(PATH_TYPES).toContain('same_sephirot');
      expect(PATH_TYPES).toContain('adjacent_path');
      expect(PATH_TYPES).toContain('progression');
    });
  });

  // ─── TAROT_TAROT_MAPPINGS constant ─────────────────────────────────────

  describe('TAROT_TAROT_MAPPINGS', () => {
    it('contains all 22 major arcana', () => {
      expect(Object.keys(TAROT_TAROT_MAPPINGS)).toHaveLength(22);
    });

    it('each arcano has valid related arcano', () => {
      Object.values(TAROT_TAROT_MAPPINGS).forEach((mapping) => {
        expect(mapping.related_arcano).toBeDefined();
        expect(mapping.related_numero).toBeGreaterThanOrEqual(0);
        expect(mapping.related_numero).toBeLessThanOrEqual(21);
      });
    });

    it('has O Louco as starting arcano', () => {
      expect(TAROT_TAROT_MAPPINGS['O Louco']).toBeDefined();
      expect(TAROT_TAROT_MAPPINGS['O Louco'].numero_caminho).toBe(0);
    });

    it('has O Mundo as ending arcano', () => {
      expect(TAROT_TAROT_MAPPINGS['O Mundo']).toBeDefined();
      expect(TAROT_TAROT_MAPPINGS['O Mundo'].numero_caminho).toBe(21);
    });

    it('each path_type is valid', () => {
      Object.values(TAROT_TAROT_MAPPINGS).forEach((mapping) => {
        expect(PATH_TYPES).toContain(mapping.path_type);
      });
    });
  });

  // ─── TarotTarotMapping interface completeness ─────────────────────────

  describe('TarotTarotMapping interface completeness', () => {
    it('requires arcano field', () => {
      const mapping = getTarotTarot('O Sol');
      expect(mapping?.arcano).toBeDefined();
    });

    it('requires numero_caminho field', () => {
      const mapping = getTarotTarot('O Sol');
      expect(mapping?.numero_caminho).toBeDefined();
      expect(typeof mapping?.numero_caminho).toBe('number');
    });

    it('requires related_arcano field', () => {
      const mapping = getTarotTarot('O Sol');
      expect(mapping?.related_arcano).toBeDefined();
    });

    it('requires related_numero field', () => {
      const mapping = getTarotTarot('O Sol');
      expect(mapping?.related_numero).toBeDefined();
      expect(typeof mapping?.related_numero).toBe('number');
    });

    it('requires path_type field', () => {
      const mapping = getTarotTarot('O Sol');
      expect(mapping?.path_type).toBeDefined();
    });

    it('requires spiritual_meaning field', () => {
      const mapping = getTarotTarot('O Sol');
      expect(mapping?.spiritual_meaning).toBeDefined();
    });
  });

  // ─── Path type distribution ───────────────────────────────────────────────────

  describe('Path type distribution', () => {
    it('adjacent_path is the most common path type', () => {
      const adjacentPaths = getArcanosByPathType('adjacent_path');
      expect(adjacentPaths.length).toBeGreaterThan(
        getArcanosByPathType('progression').length
      );
      expect(adjacentPaths.length).toBeGreaterThan(
        getArcanosByPathType('same_sephirot').length
      );
    });

    it('progression only for O Louco and O Mundo', () => {
      const progressionPaths = getArcanosByPathType('progression');
      expect(progressionPaths.length).toBe(2);
      const arcanoNames = progressionPaths.map((p) => p.arcano);
      expect(arcanoNames).toContain('O Louco');
      expect(arcanoNames).toContain('O Mundo');
    });
  });

  // ─── Adjacent path continuity ─────────────────────────────────────────────

  describe('Adjacent path continuity', () => {
    it('consecutive arcanos are connected via adjacent_path', () => {
      const consecutiveArcanos = [
        ['O Mago', 'A Sacerdotisa'],
        ['A Sacerdotisa', 'A Imperatriz'],
        ['O Hierofante', 'Os Enamorados'],
        ['A Morte', 'A Temperanca'],
      ];

      consecutiveArcanos.forEach(([arcano1, arcano2]) => {
        const mapping1 = getTarotTarot(arcano1);
        expect(mapping1?.path_type).toBe('adjacent_path');
        expect(mapping1?.related_arcano).toBe(arcano2);
      });
    });
  });

  // ─── Journey completion ─────────────────────────────────────────────

  describe('Journey completion', () => {
    it('O Louco connects to O Mago (start of journey)', () => {
      const louco = getTarotTarot('O Louco');
      expect(louco?.related_arcano).toBe('O Mago');
      expect(louco?.path_type).toBe('progression');
    });

    it('O Mundo connects to O Louco (completion returns to beginning)', () => {
      const mundo = getTarotTarot('O Mundo');
      expect(mundo?.related_arcano).toBe('O Louco');
      expect(mundo?.path_type).toBe('progression');
    });
  });
});
