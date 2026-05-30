import { describe, it, expect } from 'vitest';
import {
  getTarotSephirot,
  getTarotSephirah,
  getSephirotTarot,
  getAllTarotSephiroth,
  getAllArcanos,
  hasTarotSephirot,
  getSephirotByPath,
  getArcanoByNumber,
  getSephirahByNumber,
  getArcanoBySephirah,
  getAllSephiroth,
  TAROT_SEPHIROT_MAPPINGS,
  type TarotSephirot,
} from '@/lib/correlation/tarot-sephirot';

describe('tarot-sephirot', () => {
  // ─── getTarotSephirot: valid arcanos ─────────────────────────────────────────

  describe('getTarotSephirot', () => {
    it('returns mapping for O Louco', () => {
      const result = getTarotSephirot('O Louco');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Louco');
      expect(result?.sephirah).toBe('Kether');
      expect(result?.numero_carta).toBe(0);
      expect(result?.numero_caminho).toBe(1);
      expect(result?.elemento).toBe('Éter');
    });

    it('returns mapping for O Mago', () => {
      const result = getTarotSephirot('O Mago');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Mago');
      expect(result?.sephirah).toBe('Chokmah');
      expect(result?.numero_carta).toBe(1);
      expect(result?.numero_caminho).toBe(2);
      expect(result?.elemento).toBe('Água');
    });

    it('returns mapping for A Alta Sacerdotisa', () => {
      const result = getTarotSephirot('A Alta Sacerdotisa');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('A Alta Sacerdotisa');
      expect(result?.sephirah).toBe('Binah');
      expect(result?.numero_carta).toBe(2);
      expect(result?.numero_caminho).toBe(3);
      expect(result?.elemento).toBe('Terra');
    });

    it('returns mapping for A Imperatriz', () => {
      const result = getTarotSephirot('A Imperatriz');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('A Imperatriz');
      expect(result?.sephirah).toBe('Chesed');
      expect(result?.numero_carta).toBe(3);
      expect(result?.numero_caminho).toBe(4);
    });

    it('returns mapping for O Imperador', () => {
      const result = getTarotSephirot('O Imperador');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Imperador');
      expect(result?.sephirah).toBe('Geburah');
      expect(result?.numero_carta).toBe(4);
      expect(result?.numero_caminho).toBe(5);
    });

    it('returns mapping for O Hierofante', () => {
      const result = getTarotSephirot('O Hierofante');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Hierofante');
      expect(result?.sephirah).toBe('Tiphereth');
      expect(result?.numero_carta).toBe(5);
      expect(result?.numero_caminho).toBe(6);
    });

    it('returns mapping for Os Enamorados', () => {
      const result = getTarotSephirot('Os Enamorados');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('Os Enamorados');
      expect(result?.sephirah).toBe('Netzach');
      expect(result?.numero_carta).toBe(6);
      expect(result?.numero_caminho).toBe(7);
    });

    it('returns mapping for O Carro', () => {
      const result = getTarotSephirot('O Carro');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Carro');
      expect(result?.sephirah).toBe('Hod');
      expect(result?.numero_carta).toBe(7);
      expect(result?.numero_caminho).toBe(8);
    });

    it('returns mapping for A Justiça', () => {
      const result = getTarotSephirot('A Justiça');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('A Justiça');
      expect(result?.sephirah).toBe('Yesod');
      expect(result?.numero_carta).toBe(8);
      expect(result?.numero_caminho).toBe(9);
    });

    it('returns mapping for O Eremita', () => {
      const result = getTarotSephirot('O Eremita');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Eremita');
      expect(result?.sephirah).toBe('Malkuth');
      expect(result?.numero_carta).toBe(9);
      expect(result?.numero_caminho).toBe(10);
    });

    it('returns null for non-existent arcano', () => {
      expect(getTarotSephirot('NonExistent')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getTarotSephirot('')).toBeNull();
    });

    it('returns null for undefined', () => {
      expect(getTarotSephirot(undefined as unknown as string)).toBeNull();
    });
  });

  // ─── getTarotSephirah (alias) ────────────────────────────────────────────────

  describe('getTarotSephirah', () => {
    it('returns mapping for O Louco', () => {
      const result = getTarotSephirah('O Louco');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Louco');
      expect(result?.sephirah).toBe('Kether');
    });

    it('returns mapping for O Mago', () => {
      const result = getTarotSephirah('O Mago');
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Mago');
      expect(result?.sephirah).toBe('Chokmah');
    });

    it('aliases return same as getTarotSephirot', () => {
      expect(getTarotSephirah('A Torre')).toEqual(getTarotSephirot('A Torre'));
      expect(getTarotSephirah('A Estrela')).toEqual(getTarotSephirot('A Estrela'));
      expect(getTarotSephirah('O Sol')).toEqual(getTarotSephirot('O Sol'));
    });
  });

  // ─── getSephirotTarot ────────────────────────────────────────────────────────

  describe('getSephirotTarot', () => {
    it('returns mapping for Kether', () => {
      const result = getSephirotTarot('Kether');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Kether');
      expect(result?.arcano).toBe('O Louco');
      expect(result?.numero_carta).toBe(0);
    });

    it('returns mapping for Chokmah', () => {
      const result = getSephirotTarot('Chokmah');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Chokmah');
      expect(result?.arcano).toBe('O Mago');
      expect(result?.numero_carta).toBe(1);
    });

    it('returns mapping for Binah', () => {
      const result = getSephirotTarot('Binah');
      expect(result).not.toBeNull();
      expect(result?.sephirah).toBe('Binah');
      expect(result?.arcano).toBe('A Alta Sacerdotisa');
      expect(result?.numero_carta).toBe(2);
    });

    it('returns null for non-existent Sephirah', () => {
      expect(getSephirotTarot('NonExistent')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getSephirotTarot('')).toBeNull();
    });
  });

  // ─── getAllTarotSephiroth ─────────────────────────────────────────────────────

  describe('getAllTarotSephiroth', () => {
    it('returns array of all mappings', () => {
      const result = getAllTarotSephiroth();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(22);
    });

    it('returns all 22 Major Arcana cards', () => {
      const result = getAllTarotSephiroth();
      const arcanoNames = result.map(m => m.arcano);
      expect(arcanoNames).toContain('O Louco');
      expect(arcanoNames).toContain('A Torre');
      expect(arcanoNames).toContain('O Mundo');
    });

    it('mappings are sorted by card number', () => {
      const result = getAllTarotSephiroth();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].numero_carta).toBeLessThanOrEqual(result[i + 1].numero_carta);
      }
    });

    it('each mapping has required properties', () => {
      const result = getAllTarotSephiroth();
      for (const mapping of result) {
        expect(mapping.arcano).toBeDefined();
        expect(mapping.numero_carta).toBeDefined();
        expect(mapping.sephirah).toBeDefined();
        expect(mapping.numero_caminho).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
      }
    });
  });

  // ─── getAllArcanos ────────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns array of all arcano names', () => {
      const result = getAllArcanos();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(22);
    });

    it('contains all expected arcano names', () => {
      const result = getAllArcanos();
      expect(result).toContain('O Louco');
      expect(result).toContain('O Mago');
      expect(result).toContain('A Alta Sacerdotisa');
      expect(result).toContain('A Torre');
      expect(result).toContain('O Sol');
      expect(result).toContain('O Mundo');
    });
  });

  // ─── getAllSephiroth ─────────────────────────────────────────────────────────

  describe('getAllSephiroth', () => {
    it('returns unique Sephiroth names', () => {
      const result = getAllSephiroth();
      expect(Array.isArray(result)).toBe(true);
      // All 10 Sephiroth are referenced in the 22 cards
      expect(result.length).toBe(10);
    });

    it('contains all expected Sephiroth', () => {
      const result = getAllSephiroth();
      expect(result).toContain('Kether');
      expect(result).toContain('Chokmah');
      expect(result).toContain('Binah');
      expect(result).toContain('Chesed');
      expect(result).toContain('Geburah');
      expect(result).toContain('Tiphereth');
      expect(result).toContain('Netzach');
      expect(result).toContain('Hod');
      expect(result).toContain('Yesod');
      expect(result).toContain('Malkuth');
    });
  });

  // ─── hasTarotSephirot ────────────────────────────────────────────────────────

  describe('hasTarotSephirot', () => {
    it('returns true for O Louco', () => {
      expect(hasTarotSephirot('O Louco')).toBe(true);
    });

    it('returns true for A Torre', () => {
      expect(hasTarotSephirot('A Torre')).toBe(true);
    });

    it('returns true for O Mundo', () => {
      expect(hasTarotSephirot('O Mundo')).toBe(true);
    });

    it('returns false for non-existent arcano', () => {
      expect(hasTarotSephirot('NonExistent')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(hasTarotSephirot('')).toBe(false);
    });
  });

  // ─── getSephirotByPath ───────────────────────────────────────────────────────

  describe('getSephirotByPath', () => {
    it('returns mapping for path 1 (O Louco)', () => {
      const result = getSephirotByPath(1);
      expect(result).not.toBeNull();
      expect(result?.numero_caminho).toBe(1);
      expect(result?.arcano).toBe('O Louco');
    });

    it('returns mapping for path 17 (A Torre)', () => {
      const result = getSephirotByPath(17);
      expect(result).not.toBeNull();
      expect(result?.numero_caminho).toBe(17);
      expect(result?.arcano).toBe('A Torre');
    });

    it('returns mapping for path 22 (O Mundo)', () => {
      const result = getSephirotByPath(22);
      expect(result).not.toBeNull();
      expect(result?.numero_caminho).toBe(22);
      expect(result?.arcano).toBe('O Mundo');
    });

    it('returns null for invalid path', () => {
      expect(getSephirotByPath(0)).toBeNull();
      expect(getSephirotByPath(23)).toBeNull();
    });
  });

  // ─── getArcanoByNumber ────────────────────────────────────────────────────────

  describe('getArcanoByNumber', () => {
    it('returns O Louco for card 0', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
    });

    it('returns O Mago for card 1', () => {
      expect(getArcanoByNumber(1)).toBe('O Mago');
    });

    it('returns A Torre for card 16', () => {
      expect(getArcanoByNumber(16)).toBe('A Torre');
    });

    it('returns O Mundo for card 21', () => {
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('returns null for invalid card number', () => {
      expect(getArcanoByNumber(-1)).toBeNull();
      expect(getArcanoByNumber(22)).toBeNull();
    });
  });

  // ─── getSephirahByNumber ─────────────────────────────────────────────────────

  describe('getSephirahByNumber', () => {
    it('returns Kether for card 0', () => {
      expect(getSephirahByNumber(0)).toBe('Kether');
    });

    it('returns Chokmah for card 1', () => {
      expect(getSephirahByNumber(1)).toBe('Chokmah');
    });

    it('returns Binah for card 2', () => {
      expect(getSephirahByNumber(2)).toBe('Binah');
    });

    it('returns null for invalid card number', () => {
      expect(getSephirahByNumber(-1)).toBeNull();
      expect(getSephirahByNumber(22)).toBeNull();
    });
  });

  // ─── getArcanoBySephirah ─────────────────────────────────────────────────────

  describe('getArcanoBySephirah', () => {
    it('returns O Louco for Kether', () => {
      expect(getArcanoBySephirah('Kether')).toBe('O Louco');
    });

    it('returns O Mago for Chokmah', () => {
      expect(getArcanoBySephirah('Chokmah')).toBe('O Mago');
    });

    it('returns A Alta Sacerdotisa for Binah', () => {
      expect(getArcanoBySephirah('Binah')).toBe('A Alta Sacerdotisa');
    });

    it('returns null for non-existent Sephirah', () => {
      expect(getArcanoBySephirah('NonExistent')).toBeNull();
    });
  });

  // ─── TAROT_SEPHIROT_MAPPINGS constant ───────────────────────────────────────

  describe('TAROT_SEPHIROT_MAPPINGS', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(TAROT_SEPHIROT_MAPPINGS)).toBe(true);
    });

    it('contains all 22 Major Arcana cards', () => {
      expect(Object.keys(TAROT_SEPHIROT_MAPPINGS).length).toBe(22);
    });

    it('keys match arcano names', () => {
      for (const key of Object.keys(TAROT_SEPHIROT_MAPPINGS)) {
        expect(TAROT_SEPHIROT_MAPPINGS[key].arcano).toBe(key);
      }
    });

    it('card numbers range from 0 to 21', () => {
      for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
        expect(mapping.numero_carta).toBeGreaterThanOrEqual(0);
        expect(mapping.numero_carta).toBeLessThanOrEqual(21);
      }
    });

    it('path numbers range from 1 to 22', () => {
      for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
        expect(mapping.numero_caminho).toBeGreaterThanOrEqual(1);
        expect(mapping.numero_caminho).toBeLessThanOrEqual(22);
      }
    });
  });

  // ─── Interface completeness ─────────────────────────────────────────────────

  describe('TarotSephirot interface completeness', () => {
    it('all mappings have arcano property', () => {
      for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
        expect(typeof mapping.arcano).toBe('string');
        expect(mapping.arcano.length).toBeGreaterThan(0);
      }
    });

    it('all mappings have numero_carta property', () => {
      for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
        expect(typeof mapping.numero_carta).toBe('number');
      }
    });

    it('all mappings have sephirah property', () => {
      for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
        expect(typeof mapping.sephirah).toBe('string');
        expect(mapping.sephirah.length).toBeGreaterThan(0);
      }
    });

    it('all mappings have numero_caminho property', () => {
      for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
        expect(typeof mapping.numero_caminho).toBe('number');
      }
    });

    it('all mappings have elemento property', () => {
      for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
        expect(typeof mapping.elemento).toBe('string');
        expect(mapping.elemento.length).toBeGreaterThan(0);
      }
    });

    it('all mappings have significado_espiritual property', () => {
      for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
        expect(typeof mapping.significado_espiritual).toBe('string');
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── Tarot card distribution ─────────────────────────────────────────────────

  describe('Tarot card distribution', () => {
    it('cards cover all card numbers 0-21', () => {
      const cardNumbers = Object.values(TAROT_SEPHIROT_MAPPINGS)
        .map(m => m.numero_carta)
        .sort((a, b) => a - b);
      expect(cardNumbers).toEqual([...Array(22).keys()]);
    });

    it('paths cover all path numbers 1-22', () => {
      const pathNumbers = Object.values(TAROT_SEPHIROT_MAPPINGS)
        .map(m => m.numero_caminho)
        .sort((a, b) => a - b);
      expect(pathNumbers).toEqual([...Array(22).keys()].map(n => n + 1));
    });

    it('has valid elemental mappings', () => {
      const validElements = ['Fogo', 'Água', 'Terra', 'Ar', 'Éter'];
      for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
        expect(validElements).toContain(mapping.elemento);
      }
    });

    it('has valid Sephirah references', () => {
      const validSephiroth = [
        'Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah',
        'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
      ];
      for (const mapping of Object.values(TAROT_SEPHIROT_MAPPINGS)) {
        expect(validSephiroth).toContain(mapping.sephirah);
      }
    });
  });
});