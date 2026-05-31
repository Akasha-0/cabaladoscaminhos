import { describe, it, expect } from 'vitest';
import {
  getTarotTarot, getRelatedArcano, getAllTarotPaths, getAllArcanos, hasTarotTarot,
  getArcanoByNumber, getRelatedByNumber, getArcanosByPathType, getAllPathTypes,
  getPathNumber, getPathType, getSpiritualMeaning, getArcanosByPathNumber,
  TAROT_TAROT_MAPPINGS, MAJOR_ARCANA_NAMES, PATH_TYPES, type TarotTarotMapping,
} from '@/lib/correlation/tarot-tarot';

describe('tarot-tarot', () => {
  describe('getTarotTarot', () => {
    it('returns mapping for O Sol', () => {
      const result = getTarotTarot('O Sol');
      expect(result).toBeDefined();
      expect(result?.numero_caminho).toBe(19);
      expect(result?.related_arcano).toBe('O Julgamento');
      expect(result?.related_numero).toBe(20);
      expect(result?.path_type).toBe('adjacent_path');
    });

    it('returns mapping for A Lua', () => {
      const result = getTarotTarot('A Lua');
      expect(result).toBeDefined();
      expect(result?.numero_caminho).toBe(18);
      expect(result?.related_arcano).toBe('O Sol');
    });

    it('returns mapping for O Louco', () => {
      const result = getTarotTarot('O Louco');
      expect(result).toBeDefined();
      expect(result?.numero_caminho).toBe(0);
      expect(result?.related_arcano).toBe('O Mago');
      expect(result?.path_type).toBe('progression');
    });

    it('returns mapping for A Imperatriz', () => {
      const result = getTarotTarot('A Imperatriz');
      expect(result).toBeDefined();
      expect(result?.path_type).toBe('same_sephirot');
      expect(result?.related_arcano).toBe('O Imperador');
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
    });
  });

  describe('getRelatedArcano', () => {
    it('returns related arcano for O Sol', () => {
      expect(getRelatedArcano('O Sol')).toBe('O Julgamento');
    });

    it('returns related arcano for A Estrela', () => {
      expect(getRelatedArcano('A Estrela')).toBe('A Lua');
    });

    it('returns null for unknown arcano', () => {
      expect(getRelatedArcano('inexistente')).toBeNull();
    });
  });

  describe('getAllTarotPaths', () => {
    it('returns all 22 mappings', () => {
      expect(getAllTarotPaths()).toHaveLength(22);
    });

    it('returns mappings in order by path number', () => {
      const paths = getAllTarotPaths();
      for (let i = 0; i < paths.length - 1; i++) {
        expect(paths[i].numero_caminho).toBeLessThan(paths[i + 1].numero_caminho);
      }
    });

    it('path numbers range from 0 to 21', () => {
      const paths = getAllTarotPaths();
      expect(paths[0].numero_caminho).toBe(0);
      expect(paths[21].numero_caminho).toBe(21);
    });
  });

  describe('getAllArcanos', () => {
    it('returns array with all 22 arcano names', () => {
      expect(getAllArcanos()).toHaveLength(22);
    });

    it('first arcano is O Louco', () => {
      expect(getAllArcanos()[0]).toBe('O Louco');
    });

    it('last arcano is O Mundo', () => {
      expect(getAllArcanos()[21]).toBe('O Mundo');
    });
  });

  describe('hasTarotTarot', () => {
    it('returns true for existing arcano', () => {
      expect(hasTarotTarot('O Sol')).toBe(true);
    });

    it('returns false for unknown arcano', () => {
      expect(hasTarotTarot('inexistente')).toBe(false);
    });
  });

  describe('getArcanoByNumber', () => {
    it('returns arcano for number 0', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
    });

    it('returns arcano for number 19', () => {
      expect(getArcanoByNumber(19)).toBe('O Sol');
    });

    it('returns null for invalid number', () => {
      expect(getArcanoByNumber(22)).toBeNull();
    });
  });

  describe('getRelatedByNumber', () => {
    it('returns related arcano for number 0', () => {
      expect(getRelatedByNumber(0)).toBe('O Mago');
    });
  });

  describe('getArcanosByPathType', () => {
    it('returns arcano mappings for adjacent_path', () => {
      const paths = getArcanosByPathType('adjacent_path');
      expect(paths.length).toBeGreaterThan(0);
      paths.forEach((m) => expect(m.path_type).toBe('adjacent_path'));
    });

    it('returns arcano mappings for progression', () => {
      const paths = getArcanosByPathType('progression');
      expect(paths.length).toBe(2);
    });
  });

  describe('getAllPathTypes', () => {
    it('returns all path types', () => {
      const types = getAllPathTypes();
      expect(types).toContain('same_sephirot');
      expect(types).toContain('adjacent_path');
      expect(types).toContain('progression');
    });
  });

  describe('getPathNumber', () => {
    it('returns path number for O Sol', () => {
      expect(getPathNumber('O Sol')).toBe(19);
    });

    it('returns null for unknown arcano', () => {
      expect(getPathNumber('inexistente')).toBeNull();
    });
  });

  describe('getPathType', () => {
    it('returns path type for O Sol', () => {
      expect(getPathType('O Sol')).toBe('adjacent_path');
    });

    it('returns path type for O Louco', () => {
      expect(getPathType('O Louco')).toBe('progression');
    });
  });

  describe('getSpiritualMeaning', () => {
    it('returns spiritual meaning for O Sol', () => {
      const meaning = getSpiritualMeaning('O Sol');
      expect(meaning).toBeDefined();
      expect(meaning?.length).toBeGreaterThan(0);
    });
  });

  describe('getArcanosByPathNumber', () => {
    it('returns mapping for valid path number', () => {
      const paths = getArcanosByPathNumber(0);
      expect(paths.length).toBe(1);
      expect(paths[0].arcano).toBe('O Louco');
    });

    it('returns empty array for invalid path number', () => {
      expect(getArcanosByPathNumber(99)).toHaveLength(0);
    });
  });

  describe('MAJOR_ARCANA_NAMES', () => {
    it('contains all 22 arcano names', () => {
      expect(MAJOR_ARCANA_NAMES).toHaveLength(22);
    });
  });

  describe('PATH_TYPES', () => {
    it('contains 3 path types', () => {
      expect(PATH_TYPES).toHaveLength(3);
    });
  });

  describe('TAROT_TAROT_MAPPINGS', () => {
    it('contains all 22 major arcana', () => {
      expect(Object.keys(TAROT_TAROT_MAPPINGS)).toHaveLength(22);
    });

    it('has O Louco at path 0', () => {
      expect(TAROT_TAROT_MAPPINGS['O Louco'].numero_caminho).toBe(0);
    });

    it('has O Mundo at path 21', () => {
      expect(TAROT_TAROT_MAPPINGS['O Mundo'].numero_caminho).toBe(21);
    });
  });

  describe('Journey completion', () => {
    it('O Louco connects to O Mago', () => {
      const louco = getTarotTarot('O Louco');
      expect(louco?.related_arcano).toBe('O Mago');
      expect(louco?.path_type).toBe('progression');
    });

    it('O Mundo connects to O Louco', () => {
      const mundo = getTarotTarot('O Mundo');
      expect(mundo?.related_arcano).toBe('O Louco');
      expect(mundo?.path_type).toBe('progression');
    });
  });
});
