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
  getArcanosByPathNumber,
  TAROT_TAROT_MAPPINGS,
  MAJOR_ARCANA_NAMES,
  PATH_TYPES,
  type TarotTarotMapping,
} from '@/lib/correlation/tarot-tarot';

describe('tarot-tarot', () => {
  // ─── getTarotTarot: valid arcanos ─────────────────────────────────────────────

  describe('getTarotTarot', () => {
    it('returns O Mago mapping for O Louco', () => {
      const result = getTarotTarot('O Louco');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('O Mago');
      expect(result!.numero_carta).toBe(0);
      expect(result!.numero_caminho).toBe(11);
      expect(result!.path_type).toBe('progression');
    });

    it('returns A Alta Sacerdotisa mapping for O Mago', () => {
      const result = getTarotTarot('O Mago');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('A Alta Sacerdotisa');
      expect(result!.numero_carta).toBe(1);
      expect(result!.numero_caminho).toBe(12);
      expect(result!.path_type).toBe('adjacent_path');
    });

    it('returns A Imperatriz mapping for A Alta Sacerdotisa', () => {
      const result = getTarotTarot('A Alta Sacerdotisa');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('A Imperatriz');
      expect(result!.numero_carta).toBe(2);
    });

    it('returns O Imperador mapping for A Imperatriz', () => {
      const result = getTarotTarot('A Imperatriz');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('O Imperador');
      expect(result!.numero_carta).toBe(3);
      expect(result!.path_type).toBe('adjacent_path');
    });

    it('returns O Hierofante mapping for O Imperador', () => {
      const result = getTarotTarot('O Imperador');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('O Hierofante');
      expect(result!.numero_carta).toBe(4);
      expect(result!.path_type).toBe('progression');
    });

    it('returns Os Enamorados mapping for O Hierofante', () => {
      const result = getTarotTarot('O Hierofante');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('Os Enamorados');
      expect(result!.numero_carta).toBe(5);
      expect(result!.path_type).toBe('adjacent_path');
    });

    it('returns O Carro mapping for Os Enamorados', () => {
      const result = getTarotTarot('Os Enamorados');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('O Carro');
      expect(result!.numero_carta).toBe(6);
      expect(result!.path_type).toBe('progression');
    });

    it('returns A Justiça mapping for O Carro', () => {
      const result = getTarotTarot('O Carro');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('A Justiça');
      expect(result!.numero_carta).toBe(7);
      expect(result!.path_type).toBe('adjacent_path');
    });

    it('returns O Eremita mapping for A Justiça', () => {
      const result = getTarotTarot('A Justiça');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('O Eremita');
      expect(result!.numero_carta).toBe(8);
      expect(result!.path_type).toBe('progression');
    });

    it('returns A Roda da Fortuna mapping for O Eremita', () => {
      const result = getTarotTarot('O Eremita');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('A Roda da Fortuna');
      expect(result!.numero_carta).toBe(9);
      expect(result!.path_type).toBe('adjacent_path');
    });

    it('returns A Força mapping for A Roda da Fortuna', () => {
      const result = getTarotTarot('A Roda da Fortuna');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('A Força');
      expect(result!.numero_carta).toBe(10);
      expect(result!.path_type).toBe('progression');
    });

    it('returns O Enforcado mapping for A Força', () => {
      const result = getTarotTarot('A Força');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('O Enforcado');
      expect(result!.numero_carta).toBe(11);
      expect(result!.path_type).toBe('adjacent_path');
    });

    it('returns A Morte mapping for O Enforcado', () => {
      const result = getTarotTarot('O Enforcado');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('A Morte');
      expect(result!.numero_carta).toBe(12);
      expect(result!.path_type).toBe('progression');
    });

    it('returns A Temperança mapping for A Morte', () => {
      const result = getTarotTarot('A Morte');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('A Temperança');
      expect(result!.numero_carta).toBe(13);
      expect(result!.path_type).toBe('adjacent_path');
    });

    it('returns O Diabo mapping for A Temperança', () => {
      const result = getTarotTarot('A Temperança');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('O Diabo');
      expect(result!.numero_carta).toBe(14);
      expect(result!.path_type).toBe('progression');
    });

    it('returns A Torre mapping for O Diabo', () => {
      const result = getTarotTarot('O Diabo');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('A Torre');
      expect(result!.numero_carta).toBe(15);
      expect(result!.path_type).toBe('adjacent_path');
    });

    it('returns A Estrela mapping for A Torre', () => {
      const result = getTarotTarot('A Torre');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('A Estrela');
      expect(result!.numero_carta).toBe(16);
      expect(result!.path_type).toBe('progression');
    });

    it('returns A Lua mapping for A Estrela', () => {
      const result = getTarotTarot('A Estrela');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('A Lua');
      expect(result!.numero_carta).toBe(17);
      expect(result!.path_type).toBe('adjacent_path');
    });

    it('returns O Sol mapping for A Lua', () => {
      const result = getTarotTarot('A Lua');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('O Sol');
      expect(result!.numero_carta).toBe(18);
      expect(result!.path_type).toBe('progression');
    });

    it('returns O Julgamento mapping for O Sol', () => {
      const result = getTarotTarot('O Sol');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('O Julgamento');
      expect(result!.numero_carta).toBe(19);
      expect(result!.path_type).toBe('adjacent_path');
    });

    it('returns O Mundo mapping for O Julgamento', () => {
      const result = getTarotTarot('O Julgamento');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('O Mundo');
      expect(result!.numero_carta).toBe(20);
      expect(result!.path_type).toBe('progression');
    });

    it('returns O Louco mapping for O Mundo (same_sephirot)', () => {
      const result = getTarotTarot('O Mundo');
      expect(result).not.toBeNull();
      expect(result!.related_arcano).toBe('O Louco');
      expect(result!.numero_carta).toBe(21);
      expect(result!.numero_caminho).toBe(32);
      expect(result!.path_type).toBe('same_sephirot');
    });
  });

  // ─── getTarotTarot: invalid arcano ────────────────────────────────────────────

  describe('getTarotTarot: invalid arcano', () => {
    it('returns null for non-existent arcano', () => {
      expect(getTarotTarot('Não Existe')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getTarotTarot('')).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(getTarotTarot('O Louco Incorreto')).toBeNull();
    });

    it('is case-sensitive for exact match', () => {
      expect(getTarotTarot('o louco')).toBeNull();
      expect(getTarotTarot('O LOUCO')).toBeNull();
    });
  });

  // ─── getRelatedArcano ─────────────────────────────────────────────────────────

  describe('getRelatedArcano', () => {
    it('returns O Mago for O Louco', () => {
      expect(getRelatedArcano('O Louco')).toBe('O Mago');
    });

    it('returns A Alta Sacerdotisa for O Mago', () => {
      expect(getRelatedArcano('O Mago')).toBe('A Alta Sacerdotisa');
    });

    it('returns O Mundo for O Julgamento', () => {
      expect(getRelatedArcano('O Julgamento')).toBe('O Mundo');
    });

    it('returns O Louco for O Mundo', () => {
      expect(getRelatedArcano('O Mundo')).toBe('O Louco');
    });

    it('returns null for non-existent arcano', () => {
      expect(getRelatedArcano('Não Existe')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getRelatedArcano('')).toBeNull();
    });
  });

  // ─── getAllTarotPaths ─────────────────────────────────────────────────────────

  describe('getAllTarotPaths', () => {
    it('returns all 22 mappings', () => {
      const results = getAllTarotPaths();
      expect(results).toHaveLength(22);
    });

    it('returns mappings sorted by card number', () => {
      const results = getAllTarotPaths();
      for (let i = 1; i < results.length; i++) {
        expect(results[i].numero_carta).toBeGreaterThanOrEqual(
          results[i - 1].numero_carta
        );
      }
    });

    it('includes O Louco as first (numero 0)', () => {
      const results = getAllTarotPaths();
      expect(results[0].arcano).toBe('O Louco');
      expect(results[0].numero_carta).toBe(0);
    });

    it('includes O Mundo as last (numero 21)', () => {
      const results = getAllTarotPaths();
      expect(results[results.length - 1].arcano).toBe('O Mundo');
      expect(results[results.length - 1].numero_carta).toBe(21);
    });

    it('each mapping has required properties', () => {
      const results = getAllTarotPaths();
      for (const mapping of results) {
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('related_arcano');
        expect(mapping).toHaveProperty('related_numero');
        expect(mapping).toHaveProperty('numero_caminho');
        expect(mapping).toHaveProperty('path_type');
        expect(mapping).toHaveProperty('spiritual_meaning');
      }
    });

    it('returned array is new instance each call', () => {
      const results1 = getAllTarotPaths();
      const results2 = getAllTarotPaths();
      expect(results1).not.toBe(results2);
    });
  });

  // ─── getAllArcanos ─────────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns all 22 arcano names', () => {
      const results = getAllArcanos();
      expect(results).toHaveLength(22);
    });

    it('returns arcano names sorted by card number', () => {
      const results = getAllArcanos();
      expect(results[0]).toBe('O Louco');
      expect(results[21]).toBe('O Mundo');
    });

    it('first arcano is O Louco', () => {
      const results = getAllArcanos();
      expect(results[0]).toBe('O Louco');
    });

    it('last arcano is O Mundo', () => {
      const results = getAllArcanos();
      expect(results[results.length - 1]).toBe('O Mundo');
    });
  });

  // ─── hasTarotTarot ─────────────────────────────────────────────────────────────

  describe('hasTarotTarot', () => {
    it('returns true for O Louco', () => {
      expect(hasTarotTarot('O Louco')).toBe(true);
    });

    it('returns true for O Mago', () => {
      expect(hasTarotTarot('O Mago')).toBe(true);
    });

    it('returns true for O Mundo', () => {
      expect(hasTarotTarot('O Mundo')).toBe(true);
    });

    it('returns false for non-existent arcano', () => {
      expect(hasTarotTarot('Não Existe')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasTarotTarot('')).toBe(false);
    });

    it('is case-sensitive', () => {
      expect(hasTarotTarot('o louco')).toBe(false);
      expect(hasTarotTarot('O LOUCO')).toBe(false);
    });
  });

  // ─── getArcanoByNumber ─────────────────────────────────────────────────────────

  describe('getArcanoByNumber', () => {
    it('returns O Louco for numero 0', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
    });

    it('returns O Mago for numero 1', () => {
      expect(getArcanoByNumber(1)).toBe('O Mago');
    });

    it('returns O Sol for numero 19', () => {
      expect(getArcanoByNumber(19)).toBe('O Sol');
    });

    it('returns O Mundo for numero 21', () => {
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('returns null for out of range number', () => {
      expect(getArcanoByNumber(22)).toBeNull();
      expect(getArcanoByNumber(-1)).toBeNull();
    });
  });

  // ─── getRelatedByNumber ────────────────────────────────────────────────────────

  describe('getRelatedByNumber', () => {
    it('returns O Mago for numero 0', () => {
      expect(getRelatedByNumber(0)).toBe('O Mago');
    });

    it('returns A Alta Sacerdotisa for numero 1', () => {
      expect(getRelatedByNumber(1)).toBe('A Alta Sacerdotisa');
    });

    it('returns O Louco for numero 21', () => {
      expect(getRelatedByNumber(21)).toBe('O Louco');
    });

    it('returns null for out of range number', () => {
      expect(getRelatedByNumber(22)).toBeNull();
      expect(getRelatedByNumber(-1)).toBeNull();
    });
  });

  // ─── getArcanosByPathType ─────────────────────────────────────────────────────

  describe('getArcanosByPathType', () => {
    it('returns all same_sephirot mappings', () => {
      const results = getArcanosByPathType('same_sephirot');
      expect(results.length).toBeGreaterThan(0);
      for (const mapping of results) {
        expect(mapping.path_type).toBe('same_sephirot');
      }
    });

    it('returns all adjacent_path mappings', () => {
      const results = getArcanosByPathType('adjacent_path');
      expect(results.length).toBeGreaterThan(0);
      for (const mapping of results) {
        expect(mapping.path_type).toBe('adjacent_path');
      }
    });

    it('returns all progression mappings', () => {
      const results = getArcanosByPathType('progression');
      expect(results.length).toBeGreaterThan(0);
      for (const mapping of results) {
        expect(mapping.path_type).toBe('progression');
      }
    });

    it('returns results sorted by card number', () => {
      const results = getArcanosByPathType('progression');
      for (let i = 1; i < results.length; i++) {
        expect(results[i].numero_carta).toBeGreaterThanOrEqual(
          results[i - 1].numero_carta
        );
      }
    });
  });

  // ─── getAllPathTypes ──────────────────────────────────────────────────────────

  describe('getAllPathTypes', () => {
    it('returns all 3 path types', () => {
      const results = getAllPathTypes();
      expect(results).toHaveLength(3);
    });

    it('includes same_sephirot', () => {
      expect(getAllPathTypes()).toContain('same_sephirot');
    });

    it('includes adjacent_path', () => {
      expect(getAllPathTypes()).toContain('adjacent_path');
    });

    it('includes progression', () => {
      expect(getAllPathTypes()).toContain('progression');
    });

    it('returns new instance each call', () => {
      const results1 = getAllPathTypes();
      const results2 = getAllPathTypes();
      expect(results1).not.toBe(results2);
    });
  });

  // ─── getPathNumber ────────────────────────────────────────────────────────────

  describe('getPathNumber', () => {
    it('returns 11 for O Louco', () => {
      expect(getPathNumber('O Louco')).toBe(11);
    });

    it('returns 32 for O Mundo', () => {
      expect(getPathNumber('O Mundo')).toBe(32);
    });

    it('returns null for non-existent arcano', () => {
      expect(getPathNumber('Não Existe')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getPathNumber('')).toBeNull();
    });
  });

  // ─── getPathType ──────────────────────────────────────────────────────────────

  describe('getPathType', () => {
    it('returns progression for O Louco', () => {
      expect(getPathType('O Louco')).toBe('progression');
    });

    it('returns same_sephirot for O Mundo', () => {
      expect(getPathType('O Mundo')).toBe('same_sephirot');
    });

    it('returns adjacent_path for A Imperatriz', () => {
      expect(getPathType('A Imperatriz')).toBe('adjacent_path');
    });

    it('returns null for non-existent arcano', () => {
      expect(getPathType('Não Existe')).toBeNull();
    });
  });

  // ─── getArcanosByPathNumber ───────────────────────────────────────────────────

  describe('getArcanosByPathNumber', () => {
    it('returns mapping for path 11', () => {
      const results = getArcanosByPathNumber(11);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].numero_caminho).toBe(11);
    });

    it('returns mapping for path 32', () => {
      const results = getArcanosByPathNumber(32);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].numero_caminho).toBe(32);
    });

    it('returns empty array for non-existent path', () => {
      const results = getArcanosByPathNumber(99);
      expect(results).toHaveLength(0);
    });
  });

  // ─── TAROT_TAROT_MAPPINGS constant ────────────────────────────────────────────

  describe('TAROT_TAROT_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(TAROT_TAROT_MAPPINGS)).toBe(true);
    });

    it('has 22 entries', () => {
      expect(Object.keys(TAROT_TAROT_MAPPINGS)).toHaveLength(22);
    });

    it('each entry is frozen', () => {
      for (const mapping of Object.values(TAROT_TAROT_MAPPINGS)) {
        expect(Object.isFrozen(mapping)).toBe(true);
      }
    });

    it('contains all Major Arcana names', () => {
      for (const name of MAJOR_ARCANA_NAMES) {
        expect(name in TAROT_TAROT_MAPPINGS).toBe(true);
      }
    });

    it('path numbers range from 11 to 32', () => {
      const pathNumbers = Object.values(TAROT_TAROT_MAPPINGS).map(
        (m) => m.numero_caminho
      );
      expect(Math.min(...pathNumbers)).toBe(11);
      expect(Math.max(...pathNumbers)).toBe(32);
    });
  });

  // ─── MAJOR_ARCANA_NAMES constant ─────────────────────────────────────────────

  describe('MAJOR_ARCANA_NAMES', () => {
    it('is a frozen array', () => {
      expect(Object.isFrozen(MAJOR_ARCANA_NAMES)).toBe(true);
    });

    it('has 22 entries', () => {
      expect(MAJOR_ARCANA_NAMES).toHaveLength(22);
    });

    it('starts with O Louco', () => {
      expect(MAJOR_ARCANA_NAMES[0]).toBe('O Louco');
    });

    it('ends with O Mundo', () => {
      expect(MAJOR_ARCANA_NAMES[21]).toBe('O Mundo');
    });
  });

  // ─── PATH_TYPES constant ──────────────────────────────────────────────────────

  describe('PATH_TYPES', () => {
    it('is a frozen array', () => {
      expect(Object.isFrozen(PATH_TYPES)).toBe(true);
    });

    it('has 3 path types', () => {
      expect(PATH_TYPES).toHaveLength(3);
    });

    it('contains all path type strings', () => {
      expect(PATH_TYPES).toContain('same_sephirot');
      expect(PATH_TYPES).toContain('adjacent_path');
      expect(PATH_TYPES).toContain('progression');
    });
  });

  // ─── TarotTarotMapping interface completeness ───────────────────────────────

  describe('TarotTarotMapping interface completeness', () => {
    it('O Louco mapping has all required fields', () => {
      const mapping = getTarotTarot('O Louco');
      expect(mapping).toHaveProperty('arcano');
      expect(mapping).toHaveProperty('numero_carta');
      expect(mapping).toHaveProperty('related_arcano');
      expect(mapping).toHaveProperty('related_numero');
      expect(mapping).toHaveProperty('numero_caminho');
      expect(mapping).toHaveProperty('path_type');
      expect(mapping).toHaveProperty('spiritual_meaning');
    });

    it('O Mundo mapping has all required fields', () => {
      const mapping = getTarotTarot('O Mundo');
      expect(mapping).toHaveProperty('arcano');
      expect(mapping).toHaveProperty('numero_carta');
      expect(mapping).toHaveProperty('related_arcano');
      expect(mapping).toHaveProperty('related_numero');
      expect(mapping).toHaveProperty('numero_caminho');
      expect(mapping).toHaveProperty('path_type');
      expect(mapping).toHaveProperty('spiritual_meaning');
    });

    it('all mappings have non-empty spiritual_meaning', () => {
      const mappings = getAllTarotPaths();
      for (const mapping of mappings) {
        expect(mapping.spiritual_meaning.length).toBeGreaterThan(0);
      }
    });

    it('all mappings have valid path_type values', () => {
      const mappings = getAllTarotPaths();
      const validTypes = ['same_sephirot', 'adjacent_path', 'progression'];
      for (const mapping of mappings) {
        expect(validTypes).toContain(mapping.path_type);
      }
    });

    it('card numbers are unique in mappings', () => {
      const numbers = getAllTarotPaths().map((m) => m.numero_carta);
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(22);
    });

    it('related card numbers are within 0-21 range', () => {
      const mappings = getAllTarotPaths();
      for (const mapping of mappings) {
        expect(mapping.related_numero).toBeGreaterThanOrEqual(0);
        expect(mapping.related_numero).toBeLessThanOrEqual(21);
      }
    });
  });

  // ─── Path number sequence ────────────────────────────────────────────────────

  describe('Path number sequence', () => {
    it('paths form a continuous sequence from 11 to 32', () => {
      const paths = getAllTarotPaths()
        .map((m) => m.numero_caminho)
        .sort((a, b) => a - b);
      for (let i = 0; i < paths.length; i++) {
        expect(paths[i]).toBe(11 + i);
      }
    });

    it('each arcano has a path number that maps to its position in journey', () => {
      const mappings = getAllTarotPaths();
      for (const mapping of mappings) {
        expect(mapping.numero_caminho).toBeGreaterThanOrEqual(11);
        expect(mapping.numero_caminho).toBeLessThanOrEqual(32);
      }
    });
  });

  // ─── Circular journey completeness ───────────────────────────────────────────

  describe('Circular journey completeness', () => {
    it('O Mundo connects back to O Louco', () => {
      const mundoMapping = getTarotTarot('O Mundo');
      expect(mundoMapping?.related_arcano).toBe('O Louco');
      expect(mundoMapping?.path_type).toBe('same_sephirot');
    });

    it('O Louco is the only same_sephirot connection', () => {
      const sameSepherotMappings = getArcanosByPathType('same_sephirot');
      expect(sameSepherotMappings).toHaveLength(1);
      expect(sameSepherotMappings[0].arcano).toBe('O Mundo');
    });
  });
});
