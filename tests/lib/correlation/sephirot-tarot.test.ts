import { describe, it, expect } from 'vitest';
import {
  getSephirahTarot,
  getSephirotTarot,
  getTarotSephirah,
  getTarotSephirot,
  getAllSephirahTarots,
  getAllSephirotTarots,
  getAllSephiroth,
  hasSephirahTarot,
  getSephirahByPath,
  getArcanoByNumber,
  getSephirahByNumber,
  SEPHIROT_TAROT_MAPPINGS,
  type SephirahTarot,
} from '@/lib/correlation/sephirot-tarot';

describe('sephirot-tarot', () => {
  // ─── getSephirahTarot: valid Sephiroth ───────────────────────────────────────

  describe('getSephirahTarot', () => {
    it('returns mapping for Kether', () => {
      const result = getSephirahTarot('Kether');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Kether');
      expect(result?.arcano).toBe('O Louco');
      expect(result?.numero_carta).toBe(0);
      expect(result?.numero_caminho).toBe(1);
    });

    it('returns mapping for Chokmah', () => {
      const result = getSephirahTarot('Chokmah');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Chokmah');
      expect(result?.arcano).toBe('O Mago');
      expect(result?.numero_carta).toBe(1);
      expect(result?.numero_caminho).toBe(2);
    });

    it('returns mapping for Binah', () => {
      const result = getSephirahTarot('Binah');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Binah');
      expect(result?.arcano).toBe('A Alta Sacerdotisa');
      expect(result?.numero_carta).toBe(2);
      expect(result?.numero_caminho).toBe(3);
    });

    it('returns mapping for Chesed', () => {
      const result = getSephirahTarot('Chesed');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Chesed');
      expect(result?.arcano).toBe('O Imperador');
      expect(result?.numero_carta).toBe(4);
      expect(result?.numero_caminho).toBe(4);
    });

    it('returns mapping for Geburah', () => {
      const result = getSephirahTarot('Geburah');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Geburah');
      expect(result?.arcano).toBe('A Imperatriz');
      expect(result?.numero_carta).toBe(3);
      expect(result?.numero_caminho).toBe(5);
    });

    it('returns mapping for Tiphereth', () => {
      const result = getSephirahTarot('Tiphereth');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Tiphereth');
      expect(result?.arcano).toBe('O Hierofante');
      expect(result?.numero_carta).toBe(5);
      expect(result?.numero_caminho).toBe(6);
    });

    it('returns mapping for Netzach', () => {
      const result = getSephirahTarot('Netzach');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Netzach');
      expect(result?.arcano).toBe('Os Enamorados');
      expect(result?.numero_carta).toBe(6);
      expect(result?.numero_caminho).toBe(7);
    });

    it('returns mapping for Hod', () => {
      const result = getSephirahTarot('Hod');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Hod');
      expect(result?.arcano).toBe('O Carro');
      expect(result?.numero_carta).toBe(7);
      expect(result?.numero_caminho).toBe(8);
    });

    it('returns mapping for Yesod', () => {
      const result = getSephirahTarot('Yesod');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Yesod');
      expect(result?.arcano).toBe('A Justiça');
      expect(result?.numero_carta).toBe(8);
      expect(result?.numero_caminho).toBe(9);
    });

    it('returns mapping for Malkuth', () => {
      const result = getSephirahTarot('Malkuth');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Malkuth');
      expect(result?.arcano).toBe('O Eremita');
      expect(result?.numero_carta).toBe(9);
      expect(result?.numero_caminho).toBe(10);
    });

    it('returns null for non-existent Sephirah', () => {
      expect(getSephirahTarot('NonExistent')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getSephirahTarot('')).toBeNull();
    });

    it('returns null for undefined', () => {
      expect(getSephirahTarot(undefined as unknown as string)).toBeNull();
    });
  });
  // ─── getSephirotTarot (alias) ───────────────────────────────────────────────
  describe('getSephirotTarot', () => {
    it('returns mapping for Kether', () => {
      const result = getSephirotTarot('Kether');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Kether');
      expect(result?.arcano).toBe('O Louco');
    });
    it('returns mapping for Chokmah', () => {
      const result = getSephirotTarot('Chokmah');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Chokmah');
    });
    it('returns null for non-existent Sephirah', () => {
      expect(getSephirotTarot('NonExistent')).toBeNull();
    });
    it('returns null for empty string', () => {
      expect(getSephirotTarot('')).toBeNull();
    });
    it('produces same result as getSephirahTarot', () => {
      const allSephiroth = ['Kether', 'Chokmah', 'Binah', 'Geburah', 'Chesed', 'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth'];
      allSephiroth.forEach(sephirah => {
        expect(getSephirotTarot(sephirah)).toEqual(getSephirahTarot(sephirah));
      });
    });
  });

  // ─── getTarotSephirah ───────────────────────────────────────────────────────

  describe('getTarotSephirah', () => {
    it('returns Kether for "O Louco"', () => {
      expect(getTarotSephirah('O Louco')).toBe('Kether');
    });

    it('returns Chokmah for "O Mago"', () => {
      expect(getTarotSephirah('O Mago')).toBe('Chokmah');
    });

    it('returns Binah for "A Alta Sacerdotisa"', () => {
      expect(getTarotSephirah('A Alta Sacerdotisa')).toBe('Binah');
    });

    it('returns Geburah for "A Imperatriz"', () => {
      expect(getTarotSephirah('A Imperatriz')).toBe('Geburah');
    });

    it('returns Chesed for "O Imperador"', () => {
      expect(getTarotSephirah('O Imperador')).toBe('Chesed');
    });

    it('returns Tiphereth for "O Hierofante"', () => {
      expect(getTarotSephirah('O Hierofante')).toBe('Tiphereth');
    });

    it('returns Netzach for "Os Enamorados"', () => {
      expect(getTarotSephirah('Os Enamorados')).toBe('Netzach');
    });

    it('returns Hod for "O Carro"', () => {
      expect(getTarotSephirah('O Carro')).toBe('Hod');
    });

    it('returns Yesod for "A Justiça"', () => {
      expect(getTarotSephirah('A Justiça')).toBe('Yesod');
    });

    it('returns Malkuth for "O Eremita"', () => {
      expect(getTarotSephirah('O Eremita')).toBe('Malkuth');
    });

    it('returns null for non-existent arcano', () => {
      expect(getTarotSephirah('O Sol')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getTarotSephirah('')).toBeNull();
    });
  });

  // ─── getAllSephirahTarots ───────────────────────────────────────────────────

  describe('getAllSephirahTarots', () => {
    it('returns all 10 Sephirah-Tarot mappings', () => {
      const results = getAllSephirahTarots();
      expect(results).toHaveLength(10);
    });

    it('returns array of SephirahTarot objects', () => {
      const results = getAllSephirahTarots();
      results.forEach(mapping => {
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('numero_caminho');
        expect(mapping).toHaveProperty('significado_espiritual');
      });
    });

    it('contains all expected Sephiroth', () => {
      const results = getAllSephirahTarots();
      const sephiroth = results.map(r => r.sephirah);
      const expected = [
        'Kether', 'Chokmah', 'Binah', 'Geburah', 'Chesed',
        'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth',
      ];
      expected.forEach(s => {
        expect(sephiroth).toContain(s);
      });
    });

    it('each mapping has valid spiritual meaning', () => {
      const results = getAllSephirahTarots();
      results.forEach(mapping => {
        expect(typeof mapping.significado_espiritual).toBe('string');
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
      });
    });
  });

  // ─── getAllSephiroth ─────────────────────────────────────────────────────────

  describe('getAllSephiroth', () => {
    it('returns array of 10 Sephirah names', () => {
      const results = getAllSephiroth();
      expect(results).toHaveLength(10);
    });

    it('contains Kether, Chokmah, Binah, Chesed, Geburah, Tiphereth, Netzach, Hod, Yesod, Malkuth', () => {
      const results = getAllSephiroth();
      expect(results).toContain('Kether');
      expect(results).toContain('Chokmah');
      expect(results).toContain('Binah');
      expect(results).toContain('Chesed');
      expect(results).toContain('Geburah');
      expect(results).toContain('Tiphereth');
      expect(results).toContain('Netzach');
      expect(results).toContain('Hod');
      expect(results).toContain('Yesod');
      expect(results).toContain('Malkuth');
    });

    it('returns array of strings', () => {
      const results = getAllSephiroth();
      results.forEach(s => {
        expect(typeof s).toBe('string');
      });
    });
  });

  // ─── hasSephirahTarot ───────────────────────────────────────────────────────

  describe('hasSephirahTarot', () => {
    it('returns true for Kether', () => {
      expect(hasSephirahTarot('Kether')).toBe(true);
    });

    it('returns true for Chokmah', () => {
      expect(hasSephirahTarot('Chokmah')).toBe(true);
    });

    it('returns true for Binah', () => {
      expect(hasSephirahTarot('Binah')).toBe(true);
    });

    it('returns true for Chesed', () => {
      expect(hasSephirahTarot('Chesed')).toBe(true);
    });

    it('returns true for Geburah', () => {
      expect(hasSephirahTarot('Geburah')).toBe(true);
    });

    it('returns true for Tiphereth', () => {
      expect(hasSephirahTarot('Tiphereth')).toBe(true);
    });

    it('returns true for Netzach', () => {
      expect(hasSephirahTarot('Netzach')).toBe(true);
    });

    it('returns true for Hod', () => {
      expect(hasSephirahTarot('Hod')).toBe(true);
    });

    it('returns true for Yesod', () => {
      expect(hasSephirahTarot('Yesod')).toBe(true);
    });

    it('returns true for Malkuth', () => {
      expect(hasSephirahTarot('Malkuth')).toBe(true);
    });

    it('returns false for non-existent Sephirah', () => {
      expect(hasSephirahTarot('NonExistent')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasSephirahTarot('')).toBe(false);
    });

    it('is case-sensitive', () => {
      expect(hasSephirahTarot('kether')).toBe(false);
      expect(hasSephirahTarot('KETHER')).toBe(false);
    });
  });

  // ─── getSephirahByPath ─────────────────────────────────────────────────────

  describe('getSephirahByPath', () => {
    it('returns Kether for path 1', () => {
      const result = getSephirahByPath(1);
      expect(result?.sephirah).toBe('Kether');
    });

    it('returns Chokmah for path 2', () => {
      const result = getSephirahByPath(2);
      expect(result?.sephirah).toBe('Chokmah');
    });

    it('returns Binah for path 3', () => {
      const result = getSephirahByPath(3);
      expect(result?.sephirah).toBe('Binah');
    });

    it('returns Chesed for path 4', () => {
      const result = getSephirahByPath(4);
      expect(result?.sephirah).toBe('Chesed');
    });

    it('returns Geburah for path 5', () => {
      const result = getSephirahByPath(5);
      expect(result?.sephirah).toBe('Geburah');
    });

    it('returns Tiphereth for path 6', () => {
      const result = getSephirahByPath(6);
      expect(result?.sephirah).toBe('Tiphereth');
    });

    it('returns Netzach for path 7', () => {
      const result = getSephirahByPath(7);
      expect(result?.sephirah).toBe('Netzach');
    });

    it('returns Hod for path 8', () => {
      const result = getSephirahByPath(8);
      expect(result?.sephirah).toBe('Hod');
    });

    it('returns Yesod for path 9', () => {
      const result = getSephirahByPath(9);
      expect(result?.sephirah).toBe('Yesod');
    });

    it('returns Malkuth for path 10', () => {
      const result = getSephirahByPath(10);
      expect(result?.sephirah).toBe('Malkuth');
    });

    it('returns null for path outside range', () => {
      expect(getSephirahByPath(0)).toBeNull();
      expect(getSephirahByPath(11)).toBeNull();
      expect(getSephirahByPath(-1)).toBeNull();
    });
  });

  // ─── getArcanoByNumber ──────────────────────────────────────────────────────

  describe('getArcanoByNumber', () => {
    it('returns "O Louco" for card number 0', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
    });

    it('returns "O Mago" for card number 1', () => {
      expect(getArcanoByNumber(1)).toBe('O Mago');
    });

    it('returns "A Alta Sacerdotisa" for card number 2', () => {
      expect(getArcanoByNumber(2)).toBe('A Alta Sacerdotisa');
    });

    it('returns "A Imperatriz" for card number 3', () => {
      expect(getArcanoByNumber(3)).toBe('A Imperatriz');
    });

    it('returns "O Imperador" for card number 4', () => {
      expect(getArcanoByNumber(4)).toBe('O Imperador');
    });

    it('returns "O Hierofante" for card number 5', () => {
      expect(getArcanoByNumber(5)).toBe('O Hierofante');
    });

    it('returns "Os Enamorados" for card number 6', () => {
      expect(getArcanoByNumber(6)).toBe('Os Enamorados');
    });

    it('returns "O Carro" for card number 7', () => {
      expect(getArcanoByNumber(7)).toBe('O Carro');
    });

    it('returns "A Justiça" for card number 8', () => {
      expect(getArcanoByNumber(8)).toBe('A Justiça');
    });

    it('returns "O Eremita" for card number 9', () => {
      expect(getArcanoByNumber(9)).toBe('O Eremita');
    });

    it('returns null for card number outside 0-9 range', () => {
      expect(getArcanoByNumber(10)).toBeNull();
      expect(getArcanoByNumber(21)).toBeNull();
      expect(getArcanoByNumber(-1)).toBeNull();
    });
  });

  // ─── getSephirahByNumber ───────────────────────────────────────────────────

  describe('getSephirahByNumber', () => {
    it('returns "Kether" for card number 0', () => {
      expect(getSephirahByNumber(0)).toBe('Kether');
    });

    it('returns "Chokmah" for card number 1', () => {
      expect(getSephirahByNumber(1)).toBe('Chokmah');
    });

    it('returns "Binah" for card number 2', () => {
      expect(getSephirahByNumber(2)).toBe('Binah');
    });

    it('returns "Geburah" for card number 3', () => {
      expect(getSephirahByNumber(3)).toBe('Geburah');
    });

    it('returns "Chesed" for card number 4', () => {
      expect(getSephirahByNumber(4)).toBe('Chesed');
    });

    it('returns null for card numbers not mapped (10-21)', () => {
      expect(getSephirahByNumber(10)).toBeNull();
      expect(getSephirahByNumber(21)).toBeNull();
    });
  });

  // ─── SEPHIROT_TAROT_MAPPINGS constant ──────────────────────────────────────

  describe('SEPHIROT_TAROT_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(SEPHIROT_TAROT_MAPPINGS)).toBe(true);
    });

    it('has 10 Sephiroth keys', () => {
      const keys = Object.keys(SEPHIROT_TAROT_MAPPINGS);
      expect(keys).toHaveLength(10);
    });

    it('each mapping value is also frozen', () => {
      Object.values(SEPHIROT_TAROT_MAPPINGS).forEach(mapping => {
        expect(Object.isFrozen(mapping)).toBe(true);
      });
    });

    it('all mappings have complete data', () => {
      Object.values(SEPHIROT_TAROT_MAPPINGS).forEach(mapping => {
        expect(mapping.sephirah).toBeTruthy();
        expect(mapping.arcano).toBeTruthy();
        expect(typeof mapping.numero_carta).toBe('number');
        expect(typeof mapping.numero_caminho).toBe('number');
        expect(mapping.significado_espiritual).toBeTruthy();
      });
    });
  });

  // ─── Interface completeness ────────────────────────────────────────────────

  describe('SephirahTarot interface completeness', () => {
    it('has all required fields for Kether', () => {
      const result = getSephirahTarot('Kether');
      if (result) {
        expect(result).toHaveProperty('sephirah');
        expect(result).toHaveProperty('arcano');
        expect(result).toHaveProperty('numero_carta');
        expect(result).toHaveProperty('numero_caminho');
        expect(result).toHaveProperty('significado_espiritual');
      }
    });

    it('satisfies SephirahTarot type', () => {
      const mapping: SephirahTarot = SEPHIROT_TAROT_MAPPINGS['Kether'];
      expect(mapping.sephirah).toBe('Kether');
      expect(mapping.arcano).toBe('O Louco');
    });
  });

  // ─── Tarot card distribution ───────────────────────────────────────────────

  describe('Tarot card distribution', () => {
    it('covers card numbers 0-9 only', () => {
      const mappings = getAllSephirahTarots();
      const cardNumbers = mappings.map(m => m.numero_carta).sort((a, b) => a - b);
      expect(cardNumbers).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('covers path numbers 1-10 only', () => {
      const mappings = getAllSephirahTarots();
      const pathNumbers = mappings.map(m => m.numero_caminho).sort((a, b) => a - b);
      expect(pathNumbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('each arcano is unique', () => {
      const mappings = getAllSephirahTarots();
      const arcanoSet = new Set(mappings.map(m => m.arcano));
      expect(arcanoSet.size).toBe(10);
    });
  });
});