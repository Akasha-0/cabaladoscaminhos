import { describe, it, expect } from 'vitest';
import {
  getTarotFrequency,
  getFrequencyTarot,
  getAllTarotFrequencies,
  getAllArcanos,
  hasTarotFrequency,
  getArcanoByNumber,
  getFrequencyByNumber,
  getArcanosByFrequency,
  getAllFrequencies,
  getChakraByArcano,
  getElementByArcano,
  SOLFEGGIO_FREQUENCIES,
  TAROT_FREQUENCY_MAPPINGS,
  type TarotFrequencyMapping,
} from '@/lib/correlation/tarot-frequency';

describe('tarot-frequency', () => {
  // ─── getTarotFrequency ───────────────────────────────────────────────────────

  describe('getTarotFrequency', () => {
    it('returns mapping for O Sol', () => {
      const result = getTarotFrequency('O Sol');
      expect(result).toBeDefined();
      expect(result?.frequencia).toBe(963);
      expect(result?.numero_carta).toBe(19);
      expect(result?.elemento).toBe('Fogo');
      expect(result?.significado_espiritual).toBeDefined();
      expect(result?.chakra).toBeDefined();
      expect(result?.chakra_numero).toBe(7);
    });

    it('returns mapping for A Lua', () => {
      const result = getTarotFrequency('A Lua');
      expect(result).toBeDefined();
      expect(result?.frequencia).toBe(852);
      expect(result?.numero_carta).toBe(18);
      expect(result?.elemento).toBe('Água');
      expect(result?.chakra_numero).toBe(6);
    });

    it('returns mapping for O Louco', () => {
      const result = getTarotFrequency('O Louco');
      expect(result).toBeDefined();
      expect(result?.frequencia).toBe(396);
      expect(result?.numero_carta).toBe(0);
      expect(result?.elemento).toBe('Terra');
      expect(result?.chakra_numero).toBe(1);
    });

    it('returns mapping for O Mago', () => {
      const result = getTarotFrequency('O Mago');
      expect(result).toBeDefined();
      expect(result?.frequencia).toBe(417);
      expect(result?.numero_carta).toBe(1);
      expect(result?.elemento).toBe('Ar');
      expect(result?.chakra_numero).toBe(2);
    });

    it('returns mapping for A Sacerdotisa', () => {
      const result = getTarotFrequency('A Sacerdotisa');
      expect(result).toBeDefined();
      expect(result?.frequencia).toBe(528);
      expect(result?.numero_carta).toBe(2);
      expect(result?.elemento).toBe('Água');
      expect(result?.chakra_numero).toBe(3);
    });

    it('returns mapping for A Imperatriz', () => {
      const result = getTarotFrequency('A Imperatriz');
      expect(result).toBeDefined();
      expect(result?.frequencia).toBe(639);
      expect(result?.numero_carta).toBe(3);
      expect(result?.elemento).toBe('Terra');
      expect(result?.chakra_numero).toBe(4);
    });

    it('returns mapping for A Estrela', () => {
      const result = getTarotFrequency('A Estrela');
      expect(result).toBeDefined();
      expect(result?.frequencia).toBe(852);
      expect(result?.numero_carta).toBe(17);
      expect(result?.elemento).toBe('Ar');
      expect(result?.chakra_numero).toBe(6);
    });

    it('returns mapping for O Mundo', () => {
      const result = getTarotFrequency('O Mundo');
      expect(result).toBeDefined();
      expect(result?.frequencia).toBe(963);
      expect(result?.numero_carta).toBe(21);
      expect(result?.elemento).toBe('Terra');
      expect(result?.chakra_numero).toBe(7);
    });

    it('returns null for unknown arcano', () => {
      expect(getTarotFrequency('inexistente')).toBeNull();
      expect(getTarotFrequency('Carta Inválida')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getTarotFrequency('')).toBeNull();
    });
  });

  // ─── getFrequencyTarot ──────────────────────────────────────────────────────

  describe('getFrequencyTarot', () => {
    it('returns arcano for 963 Hz', () => {
      expect(getFrequencyTarot(963)).toBe('O Sol');
    });

    it('returns arcano for 852 Hz', () => {
      // First arcano with 852 Hz in mapping
      expect(getFrequencyTarot(852)).toBe('A Estrela');
    });

    it('returns arcano for 741 Hz', () => {
      expect(getFrequencyTarot(741)).toBe('O Hierofante');
    });

    it('returns arcano for 639 Hz', () => {
      expect(getFrequencyTarot(639)).toBe('A Imperatriz');
    });

    it('returns arcano for 528 Hz', () => {
      expect(getFrequencyTarot(528)).toBe('A Sacerdotisa');
    });

    it('returns arcano for 417 Hz', () => {
      expect(getFrequencyTarot(417)).toBe('O Mago');
    });

    it('returns arcano for 396 Hz', () => {
      expect(getFrequencyTarot(396)).toBe('O Louco');
    });

    it('returns null for non-Solfeggio frequency', () => {
      expect(getFrequencyTarot(440)).toBeNull();
      expect(getFrequencyTarot(1000)).toBeNull();
      expect(getFrequencyTarot(0)).toBeNull();
      expect(getFrequencyTarot(-1)).toBeNull();
    });
  });

  // ─── getAllTarotFrequencies ─────────────────────────────────────────────────

  describe('getAllTarotFrequencies', () => {
    it('returns array of all mappings', () => {
      const result = getAllTarotFrequencies();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(22);
    });

    it('returns mappings sorted by card number', () => {
      const result = getAllTarotFrequencies();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].numero_carta).toBeGreaterThanOrEqual(result[i - 1].numero_carta);
      }
    });

    it('includes first and last arcano correctly', () => {
      const result = getAllTarotFrequencies();
      expect(result[0].arcano).toBe('O Louco');
      expect(result[0].numero_carta).toBe(0);
      expect(result[result.length - 1].arcano).toBe('O Mundo');
      expect(result[result.length - 1].numero_carta).toBe(21);
    });

    it('all mappings have required properties', () => {
      const result = getAllTarotFrequencies();
      result.forEach((mapping) => {
        expect(mapping.arcano).toBeDefined();
        expect(typeof mapping.numero_carta).toBe('number');
        expect(typeof mapping.frequencia).toBe('number');
        expect(mapping.elemento).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.chakra).toBeDefined();
        expect(typeof mapping.chakra_numero).toBe('number');
      });
    });
  });

  // ─── getAllArcanos ──────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns array of arcano names', () => {
      const result = getAllArcanos();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(22);
    });

    it('returns arcanos sorted by card number', () => {
      const result = getAllArcanos();
      const mappings = getAllTarotFrequencies();
      for (let i = 0; i < result.length; i++) {
        expect(result[i]).toBe(mappings[i].arcano);
      }
    });

    it('includes O Louco as first', () => {
      const result = getAllArcanos();
      expect(result[0]).toBe('O Louco');
    });

    it('includes O Mundo as last', () => {
      const result = getAllArcanos();
      expect(result[result.length - 1]).toBe('O Mundo');
    });
  });

  // ─── hasTarotFrequency ─────────────────────────────────────────────────────

  describe('hasTarotFrequency', () => {
    it('returns true for existing arcanos', () => {
      expect(hasTarotFrequency('O Sol')).toBe(true);
      expect(hasTarotFrequency('A Lua')).toBe(true);
      expect(hasTarotFrequency('O Louco')).toBe(true);
      expect(hasTarotFrequency('O Mago')).toBe(true);
      expect(hasTarotFrequency('A Imperatriz')).toBe(true);
    });

    it('returns false for non-existing arcanos', () => {
      expect(hasTarotFrequency('inexistente')).toBe(false);
      expect(hasTarotFrequency('')).toBe(false);
      expect(hasTarotFrequency('Minor Arcana')).toBe(false);
    });
  });

  // ─── getArcanoByNumber ─────────────────────────────────────────────────────

  describe('getArcanoByNumber', () => {
    it('returns arcano for valid card numbers', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
      expect(getArcanoByNumber(1)).toBe('O Mago');
      expect(getArcanoByNumber(2)).toBe('A Sacerdotisa');
      expect(getArcanoByNumber(3)).toBe('A Imperatriz');
      expect(getArcanoByNumber(19)).toBe('O Sol');
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('returns null for invalid card numbers', () => {
      expect(getArcanoByNumber(-1)).toBeNull();
      expect(getArcanoByNumber(22)).toBeNull();
      expect(getArcanoByNumber(100)).toBeNull();
    });
  });

  // ─── getFrequencyByNumber ────────────────────────────────────────────────────

  describe('getFrequencyByNumber', () => {
    it('returns frequency for valid card numbers', () => {
      expect(getFrequencyByNumber(0)).toBe(396);
      expect(getFrequencyByNumber(1)).toBe(417);
      expect(getFrequencyByNumber(2)).toBe(528);
      expect(getFrequencyByNumber(19)).toBe(963);
      expect(getFrequencyByNumber(21)).toBe(963);
    });

    it('returns null for invalid card numbers', () => {
      expect(getFrequencyByNumber(-1)).toBeNull();
      expect(getFrequencyByNumber(22)).toBeNull();
      expect(getFrequencyByNumber(100)).toBeNull();
    });
  });

  // ─── getArcanosByFrequency ───────────────────────────────────────────────────

  describe('getArcanosByFrequency', () => {
    it('returns arcanos for 396 Hz', () => {
      const result = getArcanosByFrequency(396);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((m) => m.arcano === 'O Louco')).toBe(true);
    });

    it('returns arcanos for 417 Hz', () => {
      const result = getArcanosByFrequency(417);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((m) => m.arcano === 'O Mago')).toBe(true);
    });

    it('returns arcanos for 528 Hz', () => {
      const result = getArcanosByFrequency(528);
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for non-Solfeggio frequency', () => {
      expect(getArcanosByFrequency(440)).toEqual([]);
      expect(getArcanosByFrequency(0)).toEqual([]);
      expect(getArcanosByFrequency(1000)).toEqual([]);
    });
  });

  // ─── getAllFrequencies ────────────────────────────────────────────────────

  describe('getAllFrequencies', () => {
    it('returns array of all Solfeggio frequencies', () => {
      const result = getAllFrequencies();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7);
    });

    it('contains all standard Solfeggio frequencies', () => {
      const result = getAllFrequencies();
      expect(result).toContain(396);
      expect(result).toContain(417);
      expect(result).toContain(528);
      expect(result).toContain(639);
      expect(result).toContain(741);
      expect(result).toContain(852);
      expect(result).toContain(963);
    });
  });

  // ─── getChakraByArcano ─────────────────────────────────────────────────────

  describe('getChakraByArcano', () => {
    it('returns chakra number for existing arcano', () => {
      expect(getChakraByArcano('O Sol')).toBe(7);
      expect(getChakraByArcano('A Lua')).toBe(6);
      expect(getChakraByArcano('A Estrela')).toBe(6);
      expect(getChakraByArcano('O Louco')).toBe(1);
    });

    it('returns null for non-existing arcano', () => {
      expect(getChakraByArcano('inexistente')).toBeNull();
      expect(getChakraByArcano('')).toBeNull();
    });
  });

  // ─── getElementByArcano ─────────────────────────────────────────────────────

  describe('getElementByArcano', () => {
    it('returns element for existing arcano', () => {
      expect(getElementByArcano('O Sol')).toBe('Fogo');
      expect(getElementByArcano('A Lua')).toBe('Água');
      expect(getElementByArcano('O Mago')).toBe('Ar');
      expect(getElementByArcano('O Louco')).toBe('Terra');
    });

    it('returns null for non-existing arcano', () => {
      expect(getElementByArcano('inexistente')).toBeNull();
      expect(getElementByArcano('')).toBeNull();
    });
  });

  // ─── SOLFEGGIO_FREQUENCIES constant ─────────────────────────────────────────

  describe('SOLFEGGIO_FREQUENCIES', () => {
    it('contains 7 frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES.length).toBe(7);
    });

    it('contains frequencies in ascending order', () => {
      for (let i = 1; i < SOLFEGGIO_FREQUENCIES.length; i++) {
        expect(SOLFEGGIO_FREQUENCIES[i]).toBeGreaterThan(SOLFEGGIO_FREQUENCIES[i - 1]);
      }
    });

    it('has expected values', () => {
      expect(SOLFEGGIO_FREQUENCIES[0]).toBe(396);
      expect(SOLFEGGIO_FREQUENCIES[6]).toBe(963);
    });
  });

  // ─── TAROT_FREQUENCY_MAPPINGS constant ──────────────────────────────────────

  describe('TAROT_FREQUENCY_MAPPINGS', () => {
    it('is defined', () => {
      expect(TAROT_FREQUENCY_MAPPINGS).toBeDefined();
    });

    it('has 22 arcano entries', () => {
      expect(Object.keys(TAROT_FREQUENCY_MAPPINGS).length).toBe(22);
    });

    it('all entries are frozen objects', () => {
      Object.values(TAROT_FREQUENCY_MAPPINGS).forEach((mapping) => {
        expect(Object.isFrozen(mapping)).toBe(true);
      });
    });

    it('all frequencies are valid Solfeggio frequencies', () => {
      const validFrequencies = [396, 417, 528, 639, 741, 852, 963];
      Object.values(TAROT_FREQUENCY_MAPPINGS).forEach((mapping) => {
        expect(validFrequencies).toContain(mapping.frequencia);
      });
    });

    it('card numbers are unique and sequential from 0 to 21', () => {
      const numbers = Object.values(TAROT_FREQUENCY_MAPPINGS).map((m) => m.numero_carta);
      const sortedNumbers = [...numbers].sort((a, b) => a - b);
      for (let i = 0; i <= 21; i++) {
        expect(sortedNumbers).toContain(i);
      }
    });
  });

  // ─── TarotFrequencyMapping interface completeness ─────────────────────────

  describe('TarotFrequencyMapping interface completeness', () => {
    it('all mappings have required fields', () => {
      const mappings = Object.values(TAROT_FREQUENCY_MAPPINGS);
      mappings.forEach((mapping) => {
        expect(typeof mapping.arcano).toBe('string');
        expect(typeof mapping.numero_carta).toBe('number');
        expect(typeof mapping.frequencia).toBe('number');
        expect(typeof mapping.elemento).toBe('string');
        expect(typeof mapping.significado_espiritual).toBe('string');
        expect(typeof mapping.chakra).toBe('string');
        expect(typeof mapping.chakra_numero).toBe('number');
      });
    });

    it('chakra_numero is between 1 and 7', () => {
      const mappings = Object.values(TAROT_FREQUENCY_MAPPINGS);
      mappings.forEach((mapping) => {
        expect(mapping.chakra_numero).toBeGreaterThanOrEqual(1);
        expect(mapping.chakra_numero).toBeLessThanOrEqual(7);
      });
    });
  });

  // ─── Chakra distribution ───────────────────────────────────────────────────

  describe('Chakra distribution', () => {
    it('all 7 chakras are represented', () => {
      const chakraNumbers = new Set(
        Object.values(TAROT_FREQUENCY_MAPPINGS).map((m) => m.chakra_numero)
      );
      for (let i = 1; i <= 7; i++) {
        expect(chakraNumbers.has(i)).toBe(true);
      }
    });

    it('higher frequencies correspond to higher chakras', () => {
      // Root frequencies (396, 417) should map to lower chakras (1, 2)
      // Crown frequencies (852, 963) should map to higher chakras (6, 7)
      const sol = getTarotFrequency('O Sol');
      expect(sol?.chakra_numero).toBe(7);
      expect(sol?.frequencia).toBe(963);

      const mundo = getTarotFrequency('O Mundo');
      expect(mundo?.chakra_numero).toBe(7);
      expect(mundo?.frequencia).toBe(963);

      const louco = getTarotFrequency('O Louco');
      expect(louco?.chakra_numero).toBe(1);
      expect(louco?.frequencia).toBe(396);
    });
  });

  // ─── Element-Arcano consistency ─────────────────────────────────────────────

  describe('Element-Arcano consistency', () => {
    it('major arcano with sun symbolism has fire element', () => {
      const sol = getTarotFrequency('O Sol');
      expect(sol?.elemento).toBe('Fogo');
    });

    it('major arcano with moon symbolism has water element', () => {
      const lua = getTarotFrequency('A Lua');
      expect(lua?.elemento).toBe('Água');
    });

    it('major arcano with earth symbolism has earth element', () => {
      const imperatriz = getTarotFrequency('A Imperatriz');
      expect(imperatriz?.elemento).toBe('Terra');
    });

    it('major arcano with air/mental symbolism has air element', () => {
      const mago = getTarotFrequency('O Mago');
      expect(mago?.elemento).toBe('Ar');
    });
  });
});