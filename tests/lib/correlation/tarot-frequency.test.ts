/**
 * Tests for Tarot-Frequency Spiritual Correlation Module
 * Validates the mapping between Tarot Major Arcana cards and Solfeggio frequencies
 */

import { describe, it, expect } from 'vitest';
import {
  getTarotFrequency,
  getFrequencyTarot,
  getAllTarotFrequencies,
  getAllArcanos,
  getAllFrequencies,
  getArcanoByNumber,
  getFrequencyByNumber,
  getFrequencyByArcano,
  getElementByNumber,
  getChakraByNumber,
  getTarotsByElement,
  getTarotsByFrequency,
  getTarotsByChakra,
  hasTarotFrequency,
  getNumeroByArcano,
  getMappingByFrequency,
  getTarotsByOrixa,
  getTarotsBySephirah,
  TAROT_FREQUENCY_MAP,
  TODOS_ARCANOS_MAIORES,
  SOLFEGGIO_FREQUENCIES,
  type TarotFrequencyMapping,
} from '@/lib/correlation/tarot-frequency';

describe('TarotFrequency Correlation Module', () => {
  // ─── getTarotFrequency: valid numbers ────────────────────────────────────────

  describe('getTarotFrequency', () => {
    it('returns mapping for card 0 (O Louco)', () => {
      const result = getTarotFrequency(0);
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Louco');
      expect(result?.frequencia).toBe(417);
      expect(result?.elemento).toBe('Ar');
      expect(result?.chakra).toBe(5);
    });

    it('returns mapping for card 1 (O Mago)', () => {
      const result = getTarotFrequency(1);
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Mago');
      expect(result?.frequencia).toBe(396);
      expect(result?.elemento).toBe('Ar');
    });

    it('returns mapping for card 21 (O Mundo)', () => {
      const result = getTarotFrequency(21);
      expect(result).not.toBeNull();
      expect(result?.arcano).toBe('O Mundo');
      expect(result?.frequencia).toBe(963);
      expect(result?.elemento).toBe('Terra');
      expect(result?.chakra).toBe(7);
    });

    it('returns null for out-of-range numbers', () => {
      expect(getTarotFrequency(-1)).toBeNull();
      expect(getTarotFrequency(22)).toBeNull();
      expect(getTarotFrequency(100)).toBeNull();
    });

    it('returns null for non-integer numbers', () => {
      expect(getTarotFrequency(1.5)).toBeNull();
    });
  });

  // ─── getFrequencyTarot: arcano lookups ───────────────────────────────────────

  describe('getFrequencyTarot', () => {
    it('returns mapping for "O Sol"', () => {
      const result = getFrequencyTarot('O Sol');
      expect(result).not.toBeNull();
      expect(result?.numero_carta).toBe(19);
      expect(result?.frequencia).toBe(852);
    });

    it('returns mapping for "A Lua"', () => {
      const result = getFrequencyTarot('A Lua');
      expect(result).not.toBeNull();
      expect(result?.numero_carta).toBe(18);
      expect(result?.frequencia).toBe(417);
    });

    it('handles case variations', () => {
      expect(getFrequencyTarot('o sol')?.numero_carta).toBe(19);
      expect(getFrequencyTarot('A LUA')?.numero_carta).toBe(18);
      expect(getFrequencyTarot('O MUNDO')?.numero_carta).toBe(21);
    });

    it('trims whitespace', () => {
      expect(getFrequencyTarot('  O Sol  ')?.numero_carta).toBe(19);
    });

    it('returns null for unknown arcano', () => {
      expect(getFrequencyTarot('Invalid Arcano')).toBeNull();
      expect(getFrequencyTarot('')).toBeNull();
    });
  });

  // ─── getAllTarotFrequencies ──────────────────────────────────────────────────

  describe('getAllTarotFrequencies', () => {
    it('returns array of all 22 mappings', () => {
      const result = getAllTarotFrequencies();
      expect(result).toHaveLength(22);
    });

    it('returns mappings sorted by card number', () => {
      const result = getAllTarotFrequencies();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].numero_carta).toBeGreaterThan(result[i - 1].numero_carta);
      }
    });

    it('contains first and last arcano', () => {
      const result = getAllTarotFrequencies();
      const first = result[0];
      const last = result[result.length - 1];
      expect(first.arcano).toBe('O Louco');
      expect(last.arcano).toBe('O Mundo');
    });
  });

  // ─── getAllArcanos ───────────────────────────────────────────────────────────

  describe('getAllArcanos', () => {
    it('returns array with 22 arcano names', () => {
      const result = getAllArcanos();
      expect(result).toHaveLength(22);
    });

    it('contains all expected arcano names', () => {
      const result = getAllArcanos();
      expect(result).toContain('O Louco');
      expect(result).toContain('O Mago');
      expect(result).toContain('A Imperatriz');
      expect(result).toContain('O Sol');
      expect(result).toContain('O Mundo');
    });
  });

  // ─── getAllFrequencies ───────────────────────────────────────────────────────

  describe('getAllFrequencies', () => {
    it('returns array of unique frequencies', () => {
      const result = getAllFrequencies();
      const unique = new Set(result);
      expect(result.length).toBe(unique.size);
    });

    it('returns frequencies sorted in ascending order', () => {
      const result = getAllFrequencies();
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThan(result[i - 1]);
      }
    });

    it('contains the standard Solfeggio frequencies', () => {
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

  // ─── getArcanoByNumber ───────────────────────────────────────────────────────

  describe('getArcanoByNumber', () => {
    it('returns arcano name for valid card numbers', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
      expect(getArcanoByNumber(1)).toBe('O Mago');
      expect(getArcanoByNumber(10)).toBe('A Roda da Fortuna');
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('returns null for invalid card numbers', () => {
      expect(getArcanoByNumber(-1)).toBeNull();
      expect(getArcanoByNumber(22)).toBeNull();
    });
  });

  // ─── getFrequencyByNumber ────────────────────────────────────────────────────

  describe('getFrequencyByNumber', () => {
    it('returns frequency for valid card numbers', () => {
      expect(getFrequencyByNumber(0)).toBe(417);
      expect(getFrequencyByNumber(1)).toBe(396);
      expect(getFrequencyByNumber(21)).toBe(963);
    });

    it('returns null for invalid card numbers', () => {
      expect(getFrequencyByNumber(-1)).toBeNull();
      expect(getFrequencyByNumber(22)).toBeNull();
    });
  });

  // ─── getFrequencyByArcano ────────────────────────────────────────────────────

  describe('getFrequencyByArcano', () => {
    it('returns frequency for valid arcano names', () => {
      expect(getFrequencyByArcano('O Sol')).toBe(852);
      expect(getFrequencyByArcano('A Imperatriz')).toBe(528);
      expect(getFrequencyByArcano('O Louco')).toBe(417);
    });

    it('returns null for unknown arcano', () => {
      expect(getFrequencyByArcano('Invalid')).toBeNull();
    });
  });

  // ─── getElementByNumber ───────────────────────────────────────────────────────

  describe('getElementByNumber', () => {
    it('returns element for valid card numbers', () => {
      expect(getElementByNumber(0)).toBe('Ar');
      expect(getElementByNumber(3)).toBe('Terra');
      expect(getElementByNumber(4)).toBe('Fogo');
    });

    it('returns null for invalid card numbers', () => {
      expect(getElementByNumber(-1)).toBeNull();
      expect(getElementByNumber(22)).toBeNull();
    });
  });

  // ─── getChakraByNumber ───────────────────────────────────────────────────────

  describe('getChakraByNumber', () => {
    it('returns chakra number for valid card numbers', () => {
      expect(getChakraByNumber(0)).toBe(5);
      expect(getChakraByNumber(2)).toBe(6);
      expect(getChakraByNumber(21)).toBe(7);
    });

    it('returns null for invalid card numbers', () => {
      expect(getChakraByNumber(-1)).toBeNull();
      expect(getChakraByNumber(22)).toBeNull();
    });
  });

  // ─── getTarotsByElement ───────────────────────────────────────────────────────

  describe('getTarotsByElement', () => {
    it('returns tarot cards for Fogo element', () => {
      const result = getTarotsByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.elemento).toBe('Fogo');
      });
    });

    it('returns tarot cards for Água element', () => {
      const result = getTarotsByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.elemento).toBe('Água');
      });
    });

    it('returns tarot cards for Ar element', () => {
      const result = getTarotsByElement('Ar');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.elemento).toBe('Ar');
      });
    });

    it('returns tarot cards for Terra element', () => {
      const result = getTarotsByElement('Terra');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.elemento).toBe('Terra');
      });
    });

    it('handles case-insensitive element names', () => {
      const result = getTarotsByElement('FOGO');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown element', () => {
      expect(getTarotsByElement('Unknown')).toHaveLength(0);
    });
  });

  // ─── getTarotsByFrequency ─────────────────────────────────────────────────────

  describe('getTarotsByFrequency', () => {
    it('returns tarot cards for frequency 528', () => {
      const result = getTarotsByFrequency(528);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.frequencia).toBe(528);
      });
    });

    it('returns empty array for unused frequency', () => {
      expect(getTarotsByFrequency(1000)).toHaveLength(0);
    });
  });

  // ─── getTarotsByChakra ───────────────────────────────────────────────────────

  describe('getTarotsByChakra', () => {
    it('returns tarot cards for chakra 4 (Anahata)', () => {
      const result = getTarotsByChakra(4);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.chakra).toBe(4);
      });
    });

    it('returns empty array for unused chakra', () => {
      expect(getTarotsByChakra(8)).toHaveLength(0);
    });
  });

  // ─── hasTarotFrequency ────────────────────────────────────────────────────────

  describe('hasTarotFrequency', () => {
    it('returns true for valid card numbers', () => {
      expect(hasTarotFrequency(0)).toBe(true);
      expect(hasTarotFrequency(10)).toBe(true);
      expect(hasTarotFrequency(21)).toBe(true);
    });

    it('returns false for invalid card numbers', () => {
      expect(hasTarotFrequency(-1)).toBe(false);
      expect(hasTarotFrequency(22)).toBe(false);
      expect(hasTarotFrequency(100)).toBe(false);
    });
  });

  // ─── getNumeroByArcano ────────────────────────────────────────────────────────

  describe('getNumeroByArcano', () => {
    it('returns card number for valid arcano names', () => {
      expect(getNumeroByArcano('O Sol')).toBe(19);
      expect(getNumeroByArcano('A Lua')).toBe(18);
      expect(getNumeroByArcano('O Mago')).toBe(1);
    });

    it('returns null for unknown arcano', () => {
      expect(getNumeroByArcano('Invalid')).toBeNull();
    });
  });

  // ─── getMappingByFrequency ────────────────────────────────────────────────────

  describe('getMappingByFrequency', () => {
    it('returns first mapping for a used frequency', () => {
      const result = getMappingByFrequency(528);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(528);
    });

    it('returns null for unused frequency', () => {
      expect(getMappingByFrequency(1000)).toBeNull();
    });
  });

  // ─── getTarotsByOrixa ────────────────────────────────────────────────────────

  describe('getTarotsByOrixa', () => {
    it('returns tarot cards for Oxalá', () => {
      const result = getTarotsByOrixa('Oxalá');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.orixa).toBe('Oxalá');
      });
    });

    it('returns tarot cards for Xangô', () => {
      const result = getTarotsByOrixa('Xangô');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.orixa).toBe('Xangô');
      });
    });

    it('handles case-insensitive matching', () => {
      const result = getTarotsByOrixa('XANGÔ');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown Orixá', () => {
      expect(getTarotsByOrixa('Unknown')).toHaveLength(0);
    });
  });

  // ─── getTarotsBySephirah ─────────────────────────────────────────────────────

  describe('getTarotsBySephirah', () => {
    it('returns tarot cards for Beth', () => {
      const result = getTarotsBySephirah('Beth');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.sephirah).toBe('Beth');
      });
    });

    it('returns tarot cards for Gimel', () => {
      const result = getTarotsBySephirah('Gimel');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.sephirah).toBe('Gimel');
      });
    });

    it('handles case-insensitive matching', () => {
      const result = getTarotsBySephirah('BETH');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown Sephirah', () => {
      expect(getTarotsBySephirah('Unknown')).toHaveLength(0);
    });
  });

  // ─── TAROT_FREQUENCY_MAP constant ───────────────────────────────────────────

  describe('TAROT_FREQUENCY_MAP', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(TAROT_FREQUENCY_MAP)).toBe(true);
    });

    it('contains all 22 card numbers', () => {
      for (let i = 0; i <= 21; i++) {
        expect(TAROT_FREQUENCY_MAP[i]).toBeDefined();
      }
    });

    it('has correct structure for each mapping', () => {
      Object.values(TAROT_FREQUENCY_MAP).forEach((mapping) => {
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('frequencia');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('chakra');
        expect(mapping).toHaveProperty('chakra_nome');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('propriedades_healing');
        expect(Array.isArray(mapping.propriedades_healing)).toBe(true);
      });
    });

    it('contains expected frequencies for known arcano', () => {
      expect(TAROT_FREQUENCY_MAP[1].frequencia).toBe(396);
      expect(TAROT_FREQUENCY_MAP[19].frequencia).toBe(852);
    });
  });

  // ─── TODOS_ARCANOS_MAIORES constant ─────────────────────────────────────────

  describe('TODOS_ARCANOS_MAIORES', () => {
    it('contains 22 card numbers', () => {
      expect(TODOS_ARCANOS_MAIORES).toHaveLength(22);
    });

    it('contains numbers 0-21', () => {
      expect(TODOS_ARCANOS_MAIORES[0]).toBe(0);
      expect(TODOS_ARCANOS_MAIORES[21]).toBe(21);
    });

    it('is sorted in ascending order', () => {
      for (let i = 1; i < TODOS_ARCANOS_MAIORES.length; i++) {
        expect(TODOS_ARCANOS_MAIORES[i]).toBeGreaterThan(TODOS_ARCANOS_MAIORES[i - 1]);
      }
    });

    it('is a frozen array', () => {
      expect(Object.isFrozen(TODOS_ARCANOS_MAIORES)).toBe(true);
    });
  });

  // ─── SOLFEGGIO_FREQUENCIES constant ─────────────────────────────────────────

  describe('SOLFEGGIO_FREQUENCIES', () => {
    it('contains the 7 standard Solfeggio frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES).toHaveLength(7);
      expect(SOLFEGGIO_FREQUENCIES).toContain(396);
      expect(SOLFEGGIO_FREQUENCIES).toContain(417);
      expect(SOLFEGGIO_FREQUENCIES).toContain(528);
      expect(SOLFEGGIO_FREQUENCIES).toContain(639);
      expect(SOLFEGGIO_FREQUENCIES).toContain(741);
      expect(SOLFEGGIO_FREQUENCIES).toContain(852);
      expect(SOLFEGGIO_FREQUENCIES).toContain(963);
    });

    it('is sorted in ascending order', () => {
      for (let i = 1; i < SOLFEGGIO_FREQUENCIES.length; i++) {
        expect(SOLFEGGIO_FREQUENCIES[i]).toBeGreaterThan(SOLFEGGIO_FREQUENCIES[i - 1]);
      }
    });

    it('is a frozen array', () => {
      expect(Object.isFrozen(SOLFEGGIO_FREQUENCIES)).toBe(true);
    });
  });

  // ─── Type exports ────────────────────────────────────────────────────────────

  describe('Type exports', () => {
    it('exports TarotFrequencyMapping type', () => {
      const mapping: TarotFrequencyMapping = {
        numero_carta: 0,
        arcano: 'Test',
        frequencia: 417,
        elemento: 'Ar',
        chakra: 5,
        chakra_nome: 'Test',
        significado_espiritual: 'Test',
        propriedades_healing: ['Test'],
      };
      expect(mapping.numero_carta).toBe(0);
    });
  });

  // ─── Default export ───────────────────────────────────────────────────────────

  describe('Default export', () => {
    it('exports all functions and constants', async () => {
      const module = await import('@/lib/correlation/tarot-frequency');
      const defaultExport = module.default;
      
      expect(defaultExport.getTarotFrequency).toBeDefined();
      expect(defaultExport.getFrequencyTarot).toBeDefined();
      expect(defaultExport.getAllTarotFrequencies).toBeDefined();
      expect(defaultExport.TAROT_FREQUENCY_MAP).toBeDefined();
      expect(defaultExport.TODOS_ARCANOS_MAIORES).toBeDefined();
      expect(defaultExport.SOLFEGGIO_FREQUENCIES).toBeDefined();
    });
  });

  // ─── Spiritual correlation consistency ─────────────────────────────────────

  describe('Spiritual correlation consistency', () => {
    it('O Louco (0) has frequency 417 for transformation', () => {
      const result = getTarotFrequency(0);
      expect(result?.frequencia).toBe(417);
      expect(result?.significado_espiritual.toLowerCase()).toContain('libertação');
    });

    it('O Mago (1) has frequency 396 for power', () => {
      const result = getTarotFrequency(1);
      expect(result?.frequencia).toBe(396);
      expect(result?.significado_espiritual.toLowerCase()).toContain('vontade');
    });

    it('A Imperatriz (3) has frequency 528 for love/creation', () => {
      const result = getTarotFrequency(3);
      expect(result?.frequencia).toBe(528);
      expect(result?.significado_espiritual.toLowerCase()).toContain('abundância');
    });

    it('O Sol (19) has frequency 852 for vitality', () => {
      const result = getTarotFrequency(19);
      expect(result?.frequencia).toBe(852);
      expect(result?.significado_espiritual.toLowerCase()).toContain('alegria');
    });

    it('O Mundo (21) has frequency 963 for completion', () => {
      const result = getTarotFrequency(21);
      expect(result?.frequencia).toBe(963);
      expect(result?.significado_espiritual.toLowerCase()).toContain('completude');
    });

    it('All arcano with Orixá mapping have valid frequency', () => {
      const mappings = getAllTarotFrequencies();
      mappings.forEach((mapping) => {
        if (mapping.orixa) {
          expect(mapping.frequencia).toBeDefined();
          expect(SOLFEGGIO_FREQUENCIES).toContain(mapping.frequencia);
        }
      });
    });

    it('All arcano with Sephirah mapping have valid frequency', () => {
      const mappings = getAllTarotFrequencies();
      mappings.forEach((mapping) => {
        if (mapping.sephirah) {
          expect(mapping.frequencia).toBeDefined();
          expect(SOLFEGGIO_FREQUENCIES).toContain(mapping.frequencia);
        }
      });
    });
  });

  // ─── Chakra distribution ─────────────────────────────────────────────────────

  describe('Chakra distribution', () => {
    it('all 22 cards have valid chakra numbers (1-7)', () => {
      const mappings = getAllTarotFrequencies();
      mappings.forEach((mapping) => {
        expect(mapping.chakra).toBeGreaterThanOrEqual(1);
        expect(mapping.chakra).toBeLessThanOrEqual(7);
      });
    });

    it('crown chakra (7) is used for spiritual completion cards', () => {
      const result = getTarotsByChakra(7);
      expect(result.length).toBeGreaterThan(0);
      // O Julgamento (20) and O Mundo (21) are associated with Sahasrara
      const hasJudgment = result.some(m => m.numero_carta === 20);
      const hasWorld = result.some(m => m.numero_carta === 21);
      expect(hasJudgment || hasWorld).toBe(true);
    });
  });
});