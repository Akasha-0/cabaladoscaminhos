import { describe, it, expect } from 'vitest';
import {
  getTarotSephirot,
  getSephirotTarot,
  getAllTarotSephiroths,
  getAllArcanos,
  hasTarotSephirot,
  getArcanoByNumber,
  getSephirotByNumber,
  getArcanosBySephirah,
  getAllSephiroth,
  TAROT_SEPHIROT_MAPPINGS,
  SEPHIROTH_NAMES,
  type TarotSephirotMapping,
} from '@/lib/correlation/tarot-sephirot';

describe('tarot-sephirot', () => {
  // ─── getTarotSephirot: valid arcanos ─────────────────────────────────────────

  describe('getTarotSephirot', () => {
    it('returns Kether for O Louco', () => {
      const result = getTarotSephirot('O Louco');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Kether');
      expect(result!.numero_carta).toBe(0);
      expect(result!.hebrew).toBe('כתר');
      expect(result!.enName).toBe('Crown');
    });

    it('returns Chokmah for O Mago', () => {
      const result = getTarotSephirot('O Mago');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Chokmah');
      expect(result!.numero_carta).toBe(1);
      expect(result!.hebrew).toBe('חכמה');
    });

    it('returns Binah for A Alta Sacerdotisa', () => {
      const result = getTarotSephirot('A Alta Sacerdotisa');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Binah');
      expect(result!.numero_carta).toBe(2);
      expect(result!.hebrew).toBe('בינה');
    });

    it('returns Gevurah for A Imperatriz', () => {
      const result = getTarotSephirot('A Imperatriz');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Gevurah');
      expect(result!.numero_carta).toBe(3);
    });

    it('returns Chesed for O Imperador', () => {
      const result = getTarotSephirot('O Imperador');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Chesed');
      expect(result!.numero_carta).toBe(4);
    });

    it('returns Tiphereth for O Hierofante', () => {
      const result = getTarotSephirot('O Hierofante');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Tiphereth');
      expect(result!.numero_carta).toBe(5);
    });

    it('returns Netzach for Os Enamorados', () => {
      const result = getTarotSephirot('Os Enamorados');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Netzach');
      expect(result!.numero_carta).toBe(6);
    });

    it('returns Hod for O Carro', () => {
      const result = getTarotSephirot('O Carro');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Hod');
      expect(result!.numero_carta).toBe(7);
    });

    it('returns Yesod for A Justiça', () => {
      const result = getTarotSephirot('A Justiça');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Yesod');
      expect(result!.numero_carta).toBe(8);
    });

    it('returns Malkuth for O Eremita', () => {
      const result = getTarotSephirot('O Eremita');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Malkuth');
      expect(result!.numero_carta).toBe(9);
    });

    it('returns Tiphereth for O Sol', () => {
      const result = getTarotSephirot('O Sol');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Tiphereth');
      expect(result!.numero_carta).toBe(19);
    });

    it('returns Kether for O Mundo', () => {
      const result = getTarotSephirot('O Mundo');
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Kether');
      expect(result!.numero_carta).toBe(21);
    });
  });

  // ─── getTarotSephirot: invalid arcano ───────────────────────────────────────

  describe('getTarotSephirot: invalid arcano', () => {
    it('returns null for non-existent arcano', () => {
      expect(getTarotSephirot('Não Existe')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getTarotSephirot('')).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(getTarotSephirot('O Louco Incorreto')).toBeNull();
    });

    it('is case-sensitive for exact match', () => {
      expect(getTarotSephirot('o louco')).toBeNull();
      expect(getTarotSephirot('O LOUCO')).toBeNull();
    });
  });

  // ─── getSephirotTarot ───────────────────────────────────────────────────────

  describe('getSephirotTarot', () => {
    it('returns O Louco for Kether', () => {
      expect(getSephirotTarot('Kether')).toBe('O Louco');
    });

    it('returns O Mago for Chokmah', () => {
      expect(getSephirotTarot('Chokmah')).toBe('O Mago');
    });

    it('returns A Alta Sacerdotisa for Binah', () => {
      expect(getSephirotTarot('Binah')).toBe('A Alta Sacerdotisa');
    });

    it('returns A Imperatriz for Gevurah', () => {
      expect(getSephirotTarot('Gevurah')).toBe('A Imperatriz');
    });

    it('returns O Imperador for Chesed', () => {
      expect(getSephirotTarot('Chesed')).toBe('O Imperador');
    });

    it('returns O Hierofante for Tiphereth', () => {
      expect(getSephirotTarot('Tiphereth')).toBe('O Hierofante');
    });

    it('returns Os Enamorados for Netzach', () => {
      expect(getSephirotTarot('Netzach')).toBe('Os Enamorados');
    });

    it('returns O Carro for Hod', () => {
      expect(getSephirotTarot('Hod')).toBe('O Carro');
    });

    it('returns A Justiça for Yesod', () => {
      expect(getSephirotTarot('Yesod')).toBe('A Justiça');
    });

    it('returns O Eremita for Malkuth', () => {
      expect(getSephirotTarot('Malkuth')).toBe('O Eremita');
    });

    it('is case-insensitive', () => {
      expect(getSephirotTarot('kether')).toBe('O Louco');
      expect(getSephirotTarot('KETHER')).toBe('O Louco');
      expect(getSephirotTarot('Chokmah')).toBe('O Mago');
    });

    it('returns null for non-existent sephirah', () => {
      expect(getSephirotTarot('Não Existe')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getSephirotTarot('')).toBeNull();
    });
  });

  // ─── getAllTarotSephiroths ──────────────────────────────────────────────────

  describe('getAllTarotSephiroths', () => {
    it('returns all 22 mappings', () => {
      const results = getAllTarotSephiroths();
      expect(results).toHaveLength(22);
    });

    it('returns mappings sorted by card number', () => {
      const results = getAllTarotSephiroths();
      for (let i = 1; i < results.length; i++) {
        expect(results[i].numero_carta).toBeGreaterThanOrEqual(
          results[i - 1].numero_carta
        );
      }
    });

    it('includes O Louco as first (numero 0)', () => {
      const results = getAllTarotSephiroths();
      expect(results[0].arcano).toBe('O Louco');
      expect(results[0].numero_carta).toBe(0);
    });

    it('includes O Mundo as last (numero 21)', () => {
      const results = getAllTarotSephiroths();
      expect(results[results.length - 1].arcano).toBe('O Mundo');
      expect(results[results.length - 1].numero_carta).toBe(21);
    });

    it('each mapping has required properties', () => {
      const results = getAllTarotSephiroths();
      for (const mapping of results) {
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('numero_caminho');
        expect(mapping).toHaveProperty('hebrew');
        expect(mapping).toHaveProperty('enName');
        expect(mapping).toHaveProperty('significado_espiritual');
      }
    });

    it('returned array is new instance each call', () => {
      const results1 = getAllTarotSephiroths();
      const results2 = getAllTarotSephiroths();
      expect(results1).not.toBe(results2);
    });
  });

  // ─── getAllArcanos ───────────────────────────────────────────────────────────

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

  // ─── hasTarotSephirot ───────────────────────────────────────────────────────

  describe('hasTarotSephirot', () => {
    it('returns true for existing arcano', () => {
      expect(hasTarotSephirot('O Louco')).toBe(true);
      expect(hasTarotSephirot('O Mago')).toBe(true);
      expect(hasTarotSephirot('A Alta Sacerdotisa')).toBe(true);
    });

    it('returns false for non-existing arcano', () => {
      expect(hasTarotSephirot('Não Existe')).toBe(false);
      expect(hasTarotSephirot('')).toBe(false);
    });

    it('is case-sensitive', () => {
      expect(hasTarotSephirot('o louco')).toBe(false);
      expect(hasTarotSephirot('O LOUCO')).toBe(false);
    });
  });

  // ─── getArcanoByNumber ──────────────────────────────────────────────────────

  describe('getArcanoByNumber', () => {
    it('returns O Louco for number 0', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
    });

    it('returns O Mago for number 1', () => {
      expect(getArcanoByNumber(1)).toBe('O Mago');
    });

    it('returns O Mundo for number 21', () => {
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('returns A Lua for number 18', () => {
      expect(getArcanoByNumber(18)).toBe('A Lua');
    });

    it('returns null for out-of-range number', () => {
      expect(getArcanoByNumber(-1)).toBeNull();
      expect(getArcanoByNumber(22)).toBeNull();
      expect(getArcanoByNumber(100)).toBeNull();
    });
  });

  // ─── getSephirotByNumber ────────────────────────────────────────────────────

  describe('getSephirotByNumber', () => {
    it('returns Kether for number 0', () => {
      expect(getSephirotByNumber(0)).toBe('Kether');
    });

    it('returns Chokmah for number 1', () => {
      expect(getSephirotByNumber(1)).toBe('Chokmah');
    });

    it('returns Tiphereth for number 19', () => {
      expect(getSephirotByNumber(19)).toBe('Tiphereth');
    });

    it('returns null for out-of-range number', () => {
      expect(getSephirotByNumber(-1)).toBeNull();
      expect(getSephirotByNumber(22)).toBeNull();
    });
  });

  // ─── getArcanosBySephirah ───────────────────────────────────────────────────

  describe('getArcanosBySephirah', () => {
    it('returns multiple arcanos for Tiphereth', () => {
      const results = getArcanosBySephirah('Tiphereth');
      expect(results.length).toBeGreaterThan(1);
      expect(results.map((r) => r.arcano)).toContain('O Hierofante');
      expect(results.map((r) => r.arcano)).toContain('O Sol');
    });

    it('returns single arcano for Netzach', () => {
      const results = getArcanosBySephirah('Netzach');
      expect(results).toHaveLength(1);
      expect(results[0].arcano).toBe('Os Enamorados');
    });

    it('returns single arcano for Gevurah', () => {
      const results = getArcanosBySephirah('Gevurah');
      expect(results.length).toBeGreaterThan(1);
      expect(results.map((r) => r.arcano)).toContain('A Imperatriz');
    });

    it('is case-insensitive', () => {
      const results1 = getArcanosBySephirah('Tiphereth');
      const results2 = getArcanosBySephirah('tiphereth');
      expect(results1).toEqual(results2);
    });

    it('returns empty array for non-existent sephirah', () => {
      const results = getArcanosBySephirah('Não Existe');
      expect(results).toHaveLength(0);
    });
  });

  // ─── getAllSephiroth ────────────────────────────────────────────────────────

  describe('getAllSephiroth', () => {
    it('returns all 10 sephiroth names', () => {
      const results = getAllSephiroth();
      expect(results).toHaveLength(10);
    });

    it('returns sephiroth in correct order', () => {
      const results = getAllSephiroth();
      expect(results[0]).toBe('Kether');
      expect(results[9]).toBe('Malkuth');
    });

    it('includes all expected sephiroth names', () => {
      const results = getAllSephiroth();
      expect(results).toContain('Kether');
      expect(results).toContain('Chokmah');
      expect(results).toContain('Binah');
      expect(results).toContain('Chesed');
      expect(results).toContain('Gevurah');
      expect(results).toContain('Tiphereth');
      expect(results).toContain('Netzach');
      expect(results).toContain('Hod');
      expect(results).toContain('Yesod');
      expect(results).toContain('Malkuth');
    });

    it('returned array is new instance each call', () => {
      const results1 = getAllSephiroth();
      const results2 = getAllSephiroth();
      expect(results1).not.toBe(results2);
    });
  });

  // ─── TAROT_SEPHIROT_MAPPINGS constant ───────────────────────────────────────

  describe('TAROT_SEPHIROT_MAPPINGS', () => {
    it('has 22 entries', () => {
      expect(Object.keys(TAROT_SEPHIROT_MAPPINGS)).toHaveLength(22);
    });

    it('has O Louco as key', () => {
      expect('O Louco' in TAROT_SEPHIROT_MAPPINGS).toBe(true);
    });

    it('has O Mundo as key', () => {
      expect('O Mundo' in TAROT_SEPHIROT_MAPPINGS).toBe(true);
    });

    it('each mapping is frozen', () => {
      const mapping = TAROT_SEPHIROT_MAPPINGS['O Louco'];
      expect(Object.isFrozen(mapping)).toBe(true);
    });

    it('constant is frozen', () => {
      expect(Object.isFrozen(TAROT_SEPHIROT_MAPPINGS)).toBe(true);
    });
  });

  // ─── SEPHIROTH_NAMES constant ───────────────────────────────────────────────

  describe('SEPHIROTH_NAMES', () => {
    it('has 10 entries', () => {
      expect(SEPHIROTH_NAMES).toHaveLength(10);
    });

    it('starts with Kether', () => {
      expect(SEPHIROTH_NAMES[0]).toBe('Kether');
    });

    it('ends with Malkuth', () => {
      expect(SEPHIROTH_NAMES[9]).toBe('Malkuth');
    });

    it('constant is frozen', () => {
      expect(Object.isFrozen(SEPHIROTH_NAMES)).toBe(true);
    });
  });

  // ─── Interface completeness ────────────────────────────────────────────────

  describe('TarotSephirotMapping interface completeness', () => {
    it('mapping includes arcano property', () => {
      const mapping = getTarotSephirot('O Louco');
      expect(mapping!.arcano).toBeDefined();
    });

    it('mapping includes numero_carta property', () => {
      const mapping = getTarotSephirot('O Louco');
      expect(mapping!.numero_carta).toBeDefined();
      expect(typeof mapping!.numero_carta).toBe('number');
    });

    it('mapping includes sephirah property', () => {
      const mapping = getTarotSephirot('O Louco');
      expect(mapping!.sephirah).toBeDefined();
    });

    it('mapping includes numero_caminho property', () => {
      const mapping = getTarotSephirot('O Louco');
      expect(mapping!.numero_caminho).toBeDefined();
    });

    it('mapping includes hebrew property', () => {
      const mapping = getTarotSephirot('O Louco');
      expect(mapping!.hebrew).toBeDefined();
    });

    it('mapping includes enName property', () => {
      const mapping = getTarotSephirot('O Louco');
      expect(mapping!.enName).toBeDefined();
    });

    it('mapping includes significado_espiritual property', () => {
      const mapping = getTarotSephirot('O Louco');
      expect(mapping!.significado_espiritual).toBeDefined();
      expect(mapping!.significado_espiritual.length).toBeGreaterThan(0);
    });
  });

  // ─── Tarot card distribution ───────────────────────────────────────────────

  describe('Tarot card distribution across Sephiroth', () => {
    it('all 22 Major Arcana cards are mapped', () => {
      for (let i = 0; i <= 21; i++) {
        const arcano = getArcanoByNumber(i);
        expect(arcano).not.toBeNull();
      }
    });

    it('Kether maps to 2 cards: O Louco and O Mundo', () => {
      const ketherCards = getArcanosBySephirah('Kether');
      expect(ketherCards.length).toBe(2);
      const arcanoNames = ketherCards.map((c) => c.arcano);
      expect(arcanoNames).toContain('O Louco');
      expect(arcanoNames).toContain('O Mundo');
    });

    it('Tiphereth maps to multiple cards', () => {
      const tipherethCards = getArcanosBySephirah('Tiphereth');
      expect(tipherethCards.length).toBeGreaterThan(1);
    });

    it('each mapping has valid path number (1-10)', () => {
      const mappings = getAllTarotSephiroths();
      for (const mapping of mappings) {
        expect(mapping.numero_caminho).toBeGreaterThanOrEqual(1);
        expect(mapping.numero_caminho).toBeLessThanOrEqual(10);
      }
    });
  });
});