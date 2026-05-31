/**
 * Tarot-Frequency Correlation Tests
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

describe('Tarot-Frequency Correlation', () => {
  describe('getTarotFrequency', () => {
    it('should return mapping for card 0 (O Louco) with 417 Hz frequency', () => {
      const result = getTarotFrequency(0);

      expect(result).toBeDefined();
      expect(result?.numero_carta).toBe(0);
      expect(result?.arcano).toBe('O Louco');
      expect(result?.frequencia).toBe(417);
      expect(result?.elemento).toBe('Ar');
      expect(result?.chakra).toBe(5);
      expect(result?.orixa).toBe('Eshu');
      expect(result?.sephirah).toBe('Aleph');
    });

    it('should return mapping for card 1 (O Mago) with 396 Hz frequency', () => {
      const result = getTarotFrequency(1);

      expect(result).toBeDefined();
      expect(result?.numero_carta).toBe(1);
      expect(result?.arcano).toBe('O Mago');
      expect(result?.frequencia).toBe(396);
      expect(result?.elemento).toBe('Ar');
    });

    it('should return mapping for card 21 (O Mundo) with 963 Hz frequency', () => {
      const result = getTarotFrequency(21);

      expect(result).toBeDefined();
      expect(result?.numero_carta).toBe(21);
      expect(result?.arcano).toBe('O Mundo');
      expect(result?.frequencia).toBe(963);
    });

    it('should return null for card number outside 0-21 range', () => {
      expect(getTarotFrequency(-1)).toBeNull();
      expect(getTarotFrequency(22)).toBeNull();
    });

    it('should return null for non-existent card numbers', () => {
      expect(getTarotFrequency(999)).toBeNull();
    });

    it('should include all required properties in returned object', () => {
      const result = getTarotFrequency(0);

      expect(result).toHaveProperty('numero_carta');
      expect(result).toHaveProperty('arcano');
      expect(result).toHaveProperty('frequencia');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('chakra');
      expect(result).toHaveProperty('chakra_nome');
      expect(result).toHaveProperty('significado_espiritual');
      expect(result).toHaveProperty('propriedades_healing');
      expect(Array.isArray(result?.propriedades_healing)).toBe(true);
    });
  });

  describe('getFrequencyTarot', () => {
    it('should return mapping for "O Sol" arcano', () => {
      const result = getFrequencyTarot('O Sol');

      expect(result).toBeDefined();
      expect(result?.arcano).toBe('O Sol');
      expect(result?.frequencia).toBe(528);
    });

    it('should return mapping for "A Lua" arcano', () => {
      const result = getFrequencyTarot('A Lua');

      expect(result).toBeDefined();
      expect(result?.arcano).toBe('A Lua');
      expect(result?.frequencia).toBe(417);
    });

    it('should be case-insensitive', () => {
      const result1 = getFrequencyTarot('o sol');
      const result2 = getFrequencyTarot('O SOL');
      const result3 = getFrequencyTarot('O Sol');

      expect(result1?.arcano).toBe(result3?.arcano);
      expect(result2?.arcano).toBe(result3?.arcano);
    });

    it('should return null for unknown arcano', () => {
      expect(getFrequencyTarot('Unknown Arcano')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(getFrequencyTarot('')).toBeNull();
    });
  });

  describe('getAllTarotFrequencies', () => {
    it('should return all 22 Major Arcana mappings', () => {
      const result = getAllTarotFrequencies();

      expect(result).toHaveLength(22);
    });

    it('should return mappings sorted by card number', () => {
      const result = getAllTarotFrequencies();

      for (let i = 1; i < result.length; i++) {
        expect(result[i].numero_carta).toBeGreaterThan(result[i - 1].numero_carta);
      }
    });

    it('should include all properties for each mapping', () => {
      const result = getAllTarotFrequencies();

      result.forEach((mapping) => {
        expect(mapping).toHaveProperty('numero_carta');
        expect(mapping).toHaveProperty('arcano');
        expect(mapping).toHaveProperty('frequencia');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('chakra');
        expect(mapping).toHaveProperty('chakra_nome');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('propriedades_healing');
      });
    });
  });

  describe('getAllArcanos', () => {
    it('should return array with 22 arcano names', () => {
      const result = getAllArcanos();

      expect(result).toHaveLength(22);
    });

    it('should return arcano names sorted by card number', () => {
      const result = getAllArcanos();

      expect(result[0]).toBe('O Louco');
      expect(result[1]).toBe('O Mago');
    });

    it('should contain "O Sol" and "A Lua"', () => {
      const result = getAllArcanos();

      expect(result).toContain('O Sol');
      expect(result).toContain('A Lua');
      expect(result).toContain('O Mundo');
      expect(result).toContain('A Sacerdotisa');
    });
  });

  describe('getAllFrequencies', () => {
    it('should return unique Solfeggio frequencies', () => {
      const result = getAllFrequencies();

      // Should have 7 unique Solfeggio frequencies: 396, 417, 528, 639, 741, 852, 963
      expect(result.length).toBeLessThanOrEqual(7);
    });

    it('should contain standard Solfeggio frequencies', () => {
      const result = getAllFrequencies();

      expect(result).toContain(396);
      expect(result).toContain(417);
      expect(result).toContain(528);
      expect(result).toContain(639);
      expect(result).toContain(741);
      expect(result).toContain(852);
      expect(result).toContain(963);
    });

    it('should not contain duplicate frequencies', () => {
      const result = getAllFrequencies();
      const unique = new Set(result);

      expect(unique.size).toBe(result.length);
    });
  });

  describe('getArcanoByNumber', () => {
    it('should return arcano name for card 0', () => {
      const result = getArcanoByNumber(0);
      expect(result).toBe('O Louco');
    });

    it('should return arcano name for card 21', () => {
      const result = getArcanoByNumber(21);
      expect(result).toBe('O Mundo');
    });

    it('should return null for invalid card numbers', () => {
      expect(getArcanoByNumber(99)).toBeNull();
      expect(getArcanoByNumber(-1)).toBeNull();
    });
  });

  describe('getFrequencyByNumber', () => {
    it('should return frequency for card 0', () => {
      const result = getFrequencyByNumber(0);
      expect(result).toBe(417);
    });

    it('should return frequency for card 3 (A Imperatriz)', () => {
      const result = getFrequencyByNumber(3);
      expect(result).toBe(528);
    });

    it('should return null for invalid card numbers', () => {
      expect(getFrequencyByNumber(99)).toBeNull();
      expect(getFrequencyByNumber(-1)).toBeNull();
    });
  });

  describe('getFrequencyByArcano', () => {
    it('should return frequency for "O Sol"', () => {
      const result = getFrequencyByArcano('O Sol');
      expect(result).toBe(528);
    });

    it('should return null for unknown arcano', () => {
      expect(getFrequencyByArcano('Unknown')).toBeNull();
    });
  });

  describe('getElementByNumber', () => {
    it('should return element for card 0 (O Louco - Ar)', () => {
      const result = getElementByNumber(0);
      expect(result).toBe('Ar');
    });

    it('should return element for card 4 (O Imperador - Fogo)', () => {
      const result = getElementByNumber(4);
      expect(result).toBe('Fogo');
    });

    it('should return null for invalid card numbers', () => {
      expect(getElementByNumber(99)).toBeNull();
    });
  });

  describe('getChakraByNumber', () => {
    it('should return chakra for card 0', () => {
      const result = getChakraByNumber(0);
      expect(result).toBe(5);
    });

    it('should return chakra for card 2 (A Sacerdotisa)', () => {
      const result = getChakraByNumber(2);
      expect(result).toBe(6);
    });

    it('should return null for invalid card numbers', () => {
      expect(getChakraByNumber(99)).toBeNull();
    });
  });

  describe('getTarotsByElement', () => {
    it('should return tarot cards mapped to Fogo element', () => {
      const result = getTarotsByElement('Fogo');

      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.elemento).toBe('Fogo');
      });
    });

    it('should return tarot cards mapped to Água element', () => {
      const result = getTarotsByElement('Água');

      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.elemento).toBe('Água');
      });
    });

    it('should return empty array for unknown element', () => {
      const result = getTarotsByElement('UnknownElement');
      expect(result).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      const result = getTarotsByElement('');
      expect(result).toEqual([]);
    });
  });

  describe('getTarotsByFrequency', () => {
    it('should return tarot cards mapped to 528 Hz frequency', () => {
      const result = getTarotsByFrequency(528);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.frequencia).toBe(528);
      });
    });

    it('should return tarot cards mapped to 396 Hz frequency', () => {
      const result = getTarotsByFrequency(396);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.frequencia).toBe(396);
      });
    });

    it('should return empty array for frequency not in mapping', () => {
      const result = getTarotsByFrequency(999);
      expect(result).toEqual([]);
    });
  });

  describe('getTarotsByChakra', () => {
    it('should return tarot cards mapped to chakra 5', () => {
      const result = getTarotsByChakra(5);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.chakra).toBe(5);
      });
    });

    it('should return tarot cards mapped to chakra 7', () => {
      const result = getTarotsByChakra(7);

      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.chakra).toBe(7);
      });
    });

    it('should return empty array for invalid chakra numbers', () => {
      expect(getTarotsByChakra(0)).toEqual([]);
      expect(getTarotsByChakra(8)).toEqual([]);
    });
  });

  describe('hasTarotFrequency', () => {
    it('should return true for valid card numbers 0-21', () => {
      expect(hasTarotFrequency(0)).toBe(true);
      expect(hasTarotFrequency(10)).toBe(true);
      expect(hasTarotFrequency(21)).toBe(true);
    });

    it('should return false for card numbers outside 0-21 range', () => {
      expect(hasTarotFrequency(-1)).toBe(false);
      expect(hasTarotFrequency(22)).toBe(false);
      expect(hasTarotFrequency(99)).toBe(false);
    });
  });

  describe('getNumeroByArcano', () => {
    it('should return card number for "O Louco"', () => {
      const result = getNumeroByArcano('O Louco');
      expect(result).toBe(0);
    });

    it('should return card number for "O Sol"', () => {
      const result = getNumeroByArcano('O Sol');
      expect(result).toBe(19);
    });

    it('should return null for unknown arcano', () => {
      expect(getNumeroByArcano('Unknown Arcano')).toBeNull();
    });

    it('should be case-insensitive', () => {
      expect(getNumeroByArcano('o sol')).toBe(getNumeroByArcano('O Sol'));
    });
  });

  describe('getMappingByFrequency', () => {
    it('should return mapping for 528 Hz frequency', () => {
      const result = getMappingByFrequency(528);

      expect(result).toBeDefined();
      expect(result?.frequencia).toBe(528);
    });

    it('should return null for frequency not in mapping', () => {
      expect(getMappingByFrequency(999)).toBeNull();
    });
  });

  describe('getTarotsByOrixa', () => {
    it('should return tarot cards associated with Eshu', () => {
      const result = getTarotsByOrixa('Eshu');

      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.orixa).toBe('Eshu');
      });
    });

    it('should return tarot cards associated with Oxum', () => {
      const result = getTarotsByOrixa('Oxum');

      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.orixa).toBe('Oxum');
      });
    });

    it('should be case-insensitive', () => {
      const result = getTarotsByOrixa('eshu');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown Orixá', () => {
      const result = getTarotsByOrixa('UnknownOrixa');
      expect(result).toEqual([]);
    });
  });

  describe('getTarotsBySephirah', () => {
    it('should return tarot cards associated with Aleph', () => {
      const result = getTarotsBySephirah('Aleph');

      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.sephirah).toBe('Aleph');
      });
    });

    it('should return tarot cards associated with Beth', () => {
      const result = getTarotsBySephirah('Beth');

      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.sephirah).toBe('Beth');
      });
    });

    it('should be case-insensitive', () => {
      const result = getTarotsBySephirah('aleph');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array for unknown Sephirah', () => {
      const result = getTarotsBySephirah('UnknownSephirah');
      expect(result).toEqual([]);
    });
  });

  describe('TAROT_FREQUENCY_MAP constant', () => {
    it('should have 22 entries for all Major Arcana cards', () => {
      expect(Object.keys(TAROT_FREQUENCY_MAP).length).toBe(22);
    });

    it('should have keys from 0 to 21', () => {
      const keys = Object.keys(TAROT_FREQUENCY_MAP).map(Number).sort((a, b) => a - b);

      expect(keys[0]).toBe(0);
      expect(keys[keys.length - 1]).toBe(21);
    });

    it('should be frozen to prevent modifications', () => {
      expect(Object.isFrozen(TAROT_FREQUENCY_MAP)).toBe(true);
    });
  });

  describe('TODOS_ARCANOS_MAIORES constant', () => {
    it('should contain 22 card numbers', () => {
      expect(TODOS_ARCANOS_MAIORES).toHaveLength(22);
    });

    it('should be sorted from 0 to 21', () => {
      for (let i = 1; i < TODOS_ARCANOS_MAIORES.length; i++) {
        expect(TODOS_ARCANOS_MAIORES[i]).toBeGreaterThan(TODOS_ARCANOS_MAIORES[i - 1]);
      }
    });

    it('should start with 0 and end with 21', () => {
      expect(TODOS_ARCANOS_MAIORES[0]).toBe(0);
      expect(TODOS_ARCANOS_MAIORES[21]).toBe(21);
    });

    it('should be frozen', () => {
      expect(Object.isFrozen(TODOS_ARCANOS_MAIORES)).toBe(true);
    });
  });

  describe('SOLFEGGIO_FREQUENCIES constant', () => {
    it('should contain all 7 standard Solfeggio frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES).toContain(396);
      expect(SOLFEGGIO_FREQUENCIES).toContain(417);
      expect(SOLFEGGIO_FREQUENCIES).toContain(528);
      expect(SOLFEGGIO_FREQUENCIES).toContain(639);
      expect(SOLFEGGIO_FREQUENCIES).toContain(741);
      expect(SOLFEGGIO_FREQUENCIES).toContain(852);
      expect(SOLFEGGIO_FREQUENCIES).toContain(963);
    });

    it('should have exactly 7 frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES).toHaveLength(7);
    });

    it('should be frozen', () => {
      expect(Object.isFrozen(SOLFEGGIO_FREQUENCIES)).toBe(true);
    });
  });

  describe('TarotFrequencyMapping interface completeness', () => {
    it('should have consistent data structure across all cards', () => {
      const mappings = getAllTarotFrequencies();

      mappings.forEach((mapping) => {
        expect(typeof mapping.numero_carta).toBe('number');
        expect(typeof mapping.arcano).toBe('string');
        expect(typeof mapping.frequencia).toBe('number');
        expect(typeof mapping.elemento).toBe('string');
        expect(typeof mapping.chakra).toBe('number');
        expect(typeof mapping.chakra_nome).toBe('string');
        expect(typeof mapping.significado_espiritual).toBe('string');
        expect(Array.isArray(mapping.propriedades_healing)).toBe(true);
      });
    });

    it('should have valid chakra numbers (1-7) for all cards', () => {
      const mappings = getAllTarotFrequencies();

      mappings.forEach((mapping) => {
        expect(mapping.chakra).toBeGreaterThanOrEqual(1);
        expect(mapping.chakra).toBeLessThanOrEqual(7);
      });
    });

    it('should have valid frequencies from Solfeggio set', () => {
      const mappings = getAllTarotFrequencies();

      mappings.forEach((mapping) => {
        expect(SOLFEGGIO_FREQUENCIES).toContain(mapping.frequencia);
      });
    });
  });

  describe('Frequency correlation consistency', () => {
    it('should have consistent frequency between getTarotFrequency and getFrequencyByNumber', () => {
      for (let i = 0; i <= 21; i++) {
        const byNumber = getTarotFrequency(i);
        const byFreq = getMappingByFrequency(byNumber!.frequencia);

        expect(byNumber?.frequencia).toBe(byFreq?.frequencia);
      }
    });

    it('should have consistent arcano between getFrequencyTarot and getArcanoByNumber', () => {
      for (let i = 0; i <= 21; i++) {
        const arcano = getArcanoByNumber(i);
        const mapping = getFrequencyTarot(arcano!);

        expect(mapping?.numero_carta).toBe(i);
      }
    });
  });
});