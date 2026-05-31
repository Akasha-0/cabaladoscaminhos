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

describe('TarotFrequency Correlation', () => {
  describe('getTarotFrequency', () => {
    it('should return mapping for card number 0 (O Louco)', () => {
      const result = getTarotFrequency(0);
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(0);
      expect(result!.arcano).toBe('O Louco');
      expect(result!.frequencia).toBe(417);
      expect(result!.elemento).toBe('Ar');
      expect(result!.chakra).toBe(5);
    });

    it('should return mapping for card number 1 (O Mago)', () => {
      const result = getTarotFrequency(1);
      expect(result).not.toBeNull();
      expect(result!.arcano).toBe('O Mago');
      expect(result!.frequencia).toBe(396);
      expect(result!.elemento).toBe('Ar');
    });

    it('should return mapping for card number 19 (O Sol)', () => {
      const result = getTarotFrequency(19);
      expect(result).not.toBeNull();
      expect(result!.arcano).toBe('O Sol');
    });

    it('should return mapping for card number 21 (O Mundo)', () => {
      const result = getTarotFrequency(21);
      expect(result).not.toBeNull();
      expect(result!.arcano).toBe('O Mundo');
    });

    it('should return null for invalid card numbers', () => {
      expect(getTarotFrequency(-1)).toBeNull();
      expect(getTarotFrequency(22)).toBeNull();
      expect(getTarotFrequency(100)).toBeNull();
    });

    it('should have significance and healing properties for each card', () => {
      for (let i = 0; i <= 21; i++) {
        const result = getTarotFrequency(i);
        expect(result).not.toBeNull();
        expect(result!.significado_espiritual).toBeDefined();
        expect(result!.significado_espiritual.length).toBeGreaterThan(0);
        expect(result!.propriedades_healing).toBeDefined();
        expect(result!.propriedades_healing.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getFrequencyTarot', () => {
    it('should return mapping for O Louco', () => {
      const result = getFrequencyTarot('O Louco');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(0);
      expect(result!.frequencia).toBe(417);
    });

    it('should return mapping for O Mago', () => {
      const result = getFrequencyTarot('O Mago');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(1);
      expect(result!.frequencia).toBe(396);
    });

    it('should return mapping for O Sol', () => {
      const result = getFrequencyTarot('O Sol');
      expect(result).not.toBeNull();
      expect(result!.frequencia).toBe(963);
    });

    it('should return mapping for O Mundo', () => {
      const result = getFrequencyTarot('O Mundo');
      expect(result).not.toBeNull();
      expect(result!.numero_carta).toBe(21);
    });

    it('should return null for non-existent arcano', () => {
      expect(getFrequencyTarot('invalid')).toBeNull();
      expect(getFrequencyTarot('')).toBeNull();
      expect(getFrequencyTarot('Não existe')).toBeNull();
    });

    it('should be case-insensitive', () => {
      const result = getFrequencyTarot('O LOUCO');
      expect(result).not.toBeNull();
      expect(result!.arcano).toBe('O Louco');
    });
  });

  describe('TAROT_FREQUENCY_MAP', () => {
    it('should have exactly 22 entries for Major Arcana', () => {
      expect(Object.keys(TAROT_FREQUENCY_MAP).length).toBe(22);
    });

    it('should contain all card numbers 0-21', () => {
      for (let i = 0; i <= 21; i++) {
        expect(TAROT_FREQUENCY_MAP[i]).toBeDefined();
      }
    });

    it('should have valid card numbers matching their keys', () => {
      for (const key of Object.keys(TAROT_FREQUENCY_MAP)) {
        const num = Number(key);
        expect(TAROT_FREQUENCY_MAP[num].numero_carta).toBe(num);
      }
    });

    it('should have valid frequencies in all mappings', () => {
      Object.values(TAROT_FREQUENCY_MAP).forEach((mapping) => {
        expect(SOLFEGGIO_FREQUENCIES).toContain(mapping.frequencia);
      });
    });

    it('should have valid chakra numbers (1-7) in all mappings', () => {
      Object.values(TAROT_FREQUENCY_MAP).forEach((mapping) => {
        expect(mapping.chakra).toBeGreaterThanOrEqual(1);
        expect(mapping.chakra).toBeLessThanOrEqual(7);
      });
    });

    it('should have valid elements in all mappings', () => {
      const validElements = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      Object.values(TAROT_FREQUENCY_MAP).forEach((mapping) => {
        expect(validElements).toContain(mapping.elemento);
      });
    });

    it('should have unique arcano names for each card number', () => {
      const names = Object.values(TAROT_FREQUENCY_MAP).map((m) => m.arcano);
      const unique = new Set(names);
      expect(unique.size).toBe(names.length);
    });
  });

  describe('getAllTarotFrequencies', () => {
    it('should return array of 22 mappings', () => {
      const result = getAllTarotFrequencies();
      expect(result.length).toBe(22);
    });

    it('should return mappings sorted by card number', () => {
      const result = getAllTarotFrequencies();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].numero_carta).toBeLessThan(result[i + 1].numero_carta);
      }
    });

    it('should return mappings with all required properties', () => {
      const result = getAllTarotFrequencies();
      result.forEach((mapping) => {
        expect(mapping.numero_carta).toBeDefined();
        expect(mapping.arcano).toBeDefined();
        expect(mapping.frequencia).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.chakra).toBeDefined();
        expect(mapping.chakra_nome).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.propriedades_healing).toBeDefined();
      });
    });
  });

  describe('getAllArcanos', () => {
    it('should return all 22 arcano names', () => {
      const result = getAllArcanos();
      expect(result.length).toBe(22);
    });

    it('should return arcano names sorted by card number', () => {
      const result = getAllArcanos();
      expect(result[0]).toBe('O Louco');
      expect(result[1]).toBe('O Mago');
    });

    it('should include O Sol and O Mundo', () => {
      const result = getAllArcanos();
      expect(result).toContain('O Sol');
      expect(result).toContain('O Mundo');
    });
  });

  describe('getAllFrequencies', () => {
    it('should return all 7 Solfeggio frequencies', () => {
      const result = getAllFrequencies();
      expect(result.length).toBe(7);
    });

    it('should contain all Solfeggio frequencies', () => {
      const result = getAllFrequencies();
      SOLFEGGIO_FREQUENCIES.forEach((freq) => {
        expect(result).toContain(freq);
      });
    });
  });

  describe('getArcanoByNumber', () => {
    it('should return O Louco for number 0', () => {
      expect(getArcanoByNumber(0)).toBe('O Louco');
    });

    it('should return O Mago for number 1', () => {
      expect(getArcanoByNumber(1)).toBe('O Mago');
    });

    it('should return A Sacerdotisa for number 2', () => {
      expect(getArcanoByNumber(2)).toBe('A Sacerdotisa');
    });

    it('should return O Sol for number 19', () => {
      expect(getArcanoByNumber(19)).toBe('O Sol');
    });

    it('should return O Mundo for number 21', () => {
      expect(getArcanoByNumber(21)).toBe('O Mundo');
    });

    it('should return null for invalid card numbers', () => {
      expect(getArcanoByNumber(-1)).toBeNull();
      expect(getArcanoByNumber(22)).toBeNull();
      expect(getArcanoByNumber(100)).toBeNull();
    });
  });

  describe('getFrequencyByNumber', () => {
    it('should return 417 for card number 0', () => {
      expect(getFrequencyByNumber(0)).toBe(417);
    });

    it('should return 396 for card number 1', () => {
      expect(getFrequencyByNumber(1)).toBe(396);
    });

    it('should return 528 for card number 2', () => {
      expect(getFrequencyByNumber(2)).toBe(528);
    });

    it('should return 963 for card number 19', () => {
      expect(getFrequencyByNumber(19)).toBe(963);
    });

    it('should return null for invalid card numbers', () => {
      expect(getFrequencyByNumber(-1)).toBeNull();
      expect(getFrequencyByNumber(22)).toBeNull();
      expect(getFrequencyByNumber(100)).toBeNull();
    });
  });

  describe('getFrequencyByArcano', () => {
    it('should return 417 for O Louco', () => {
      expect(getFrequencyByArcano('O Louco')).toBe(417);
    });

    it('should return 396 for O Mago', () => {
      expect(getFrequencyByArcano('O Mago')).toBe(396);
    });

    it('should return 528 for A Sacerdotisa', () => {
      expect(getFrequencyByArcano('A Sacerdotisa')).toBe(528);
    });

    it('should return 963 for O Sol', () => {
      expect(getFrequencyByArcano('O Sol')).toBe(963);
    });

    it('should return null for non-existent arcano', () => {
      expect(getFrequencyByArcano('invalid')).toBeNull();
      expect(getFrequencyByArcano('')).toBeNull();
    });

    it('should be case-insensitive', () => {
      expect(getFrequencyByArcano('O LOUCO')).toBe(417);
      expect(getFrequencyByArcano('o louco')).toBe(417);
    });
  });

  describe('getElementByNumber', () => {
    it('should return Ar for card number 0', () => {
      expect(getElementByNumber(0)).toBe('Ar');
    });

    it('should return Água for card number 2', () => {
      expect(getElementByNumber(2)).toBe('Água');
    });

    it('should return null for invalid card numbers', () => {
      expect(getElementByNumber(-1)).toBeNull();
      expect(getElementByNumber(22)).toBeNull();
    });
  });

  describe('getChakraByNumber', () => {
    it('should return 5 for card number 0', () => {
      expect(getChakraByNumber(0)).toBe(5);
    });

    it('should return 6 for card number 2', () => {
      expect(getChakraByNumber(2)).toBe(6);
    });

    it('should return null for invalid card numbers', () => {
      expect(getChakraByNumber(-1)).toBeNull();
      expect(getChakraByNumber(22)).toBeNull();
    });
  });

  describe('getTarotsByElement', () => {
    it('should return tarot cards for Ar element', () => {
      const result = getTarotsByElement('Ar');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.elemento).toBe('Ar');
      });
    });

    it('should return tarot cards for Água element', () => {
      const result = getTarotsByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.elemento).toBe('Água');
      });
    });

    it('should return tarot cards for Fogo element', () => {
      const result = getTarotsByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.elemento).toBe('Fogo');
      });
    });

    it('should return tarot cards for Terra element', () => {
      const result = getTarotsByElement('Terra');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.elemento).toBe('Terra');
      });
    });

    it('should return tarot cards for Éter element', () => {
      const result = getTarotsByElement('Éter');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.elemento).toBe('Éter');
      });
    });

    it('should return empty array for invalid element', () => {
      expect(getTarotsByElement('invalid')).toEqual([]);
      expect(getTarotsByElement('')).toEqual([]);
    });

    it('should be case-insensitive', () => {
      const result = getTarotsByElement('ÁGUA');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getTarotsByFrequency', () => {
    it('should return tarot cards for 396 Hz', () => {
      const result = getTarotsByFrequency(396);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.frequencia).toBe(396);
      });
    });

    it('should return tarot cards for 528 Hz', () => {
      const result = getTarotsByFrequency(528);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.frequencia).toBe(528);
      });
    });

    it('should return tarot cards for 963 Hz', () => {
      const result = getTarotsByFrequency(963);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((mapping) => {
        expect(mapping.frequencia).toBe(963);
      });
    });

    it('should return empty array for non-Solfeggio frequency', () => {
      expect(getTarotsByFrequency(440)).toEqual([]);
      expect(getTarotsByFrequency(0)).toEqual([]);
      expect(getTarotsByFrequency(1000)).toEqual([]);
    });
  });

  describe('getTarotsByChakra', () => {
    it('should return tarot cards for chakra 1', () => {
      const result = getTarotsByChakra(1);
      result.forEach((mapping) => {
        expect(mapping.chakra).toBe(1);
      });
    });

    it('should return tarot cards for chakra 7', () => {
      const result = getTarotsByChakra(7);
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
      for (let i = 0; i <= 21; i++) {
        expect(hasTarotFrequency(i)).toBe(true);
      }
    });

    it('should return false for invalid card numbers', () => {
      expect(hasTarotFrequency(-1)).toBe(false);
      expect(hasTarotFrequency(22)).toBe(false);
      expect(hasTarotFrequency(100)).toBe(false);
    });
  });

  describe('getNumeroByArcano', () => {
    it('should return 0 for O Louco', () => {
      expect(getNumeroByArcano('O Louco')).toBe(0);
    });

    it('should return 19 for O Sol', () => {
      expect(getNumeroByArcano('O Sol')).toBe(19);
    });

    it('should return 21 for O Mundo', () => {
      expect(getNumeroByArcano('O Mundo')).toBe(21);
    });

    it('should return null for non-existent arcano', () => {
      expect(getNumeroByArcano('invalid')).toBeNull();
      expect(getNumeroByArcano('')).toBeNull();
    });

    it('should be case-insensitive', () => {
      expect(getNumeroByArcano('O LOUCO')).toBe(0);
    });
  });

  describe('getMappingByFrequency', () => {
    it('should return a mapping for 396 Hz', () => {
      const result = getMappingByFrequency(396);
      expect(result).not.toBeNull();
      expect(result!.frequencia).toBe(396);
    });

    it('should return a mapping for 528 Hz', () => {
      const result = getMappingByFrequency(528);
      expect(result).not.toBeNull();
      expect(result!.frequencia).toBe(528);
    });

    it('should return null for non-Solfeggio frequency', () => {
      expect(getMappingByFrequency(440)).toBeNull();
      expect(getMappingByFrequency(0)).toBeNull();
    });
  });

  describe('getTarotsByOrixa', () => {
    it('should return tarot cards for Oxum', () => {
      const result = getTarotsByOrixa('Oxum');
      result.forEach((mapping) => {
        expect(mapping.orixa).toBe('Oxum');
      });
    });

    it('should return tarot cards for Oxalá', () => {
      const result = getTarotsByOrixa('Oxalá');
      result.forEach((mapping) => {
        expect(mapping.orixa).toBe('Oxalá');
      });
    });

    it('should return empty array for non-existent orixá', () => {
      expect(getTarotsByOrixa('invalid')).toEqual([]);
      expect(getTarotsByOrixa('')).toEqual([]);
    });

    it('should be case-insensitive', () => {
      const result = getTarotsByOrixa('OXUM');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getTarotsBySephirah', () => {
    it('should return tarot cards for Beth', () => {
      const result = getTarotsBySephirah('Beth');
      result.forEach((mapping) => {
        expect(mapping.sephirah).toBe('Beth');
      });
    });

    it('should return empty array for non-existent sephirah', () => {
      expect(getTarotsBySephirah('invalid')).toEqual([]);
      expect(getTarotsBySephirah('')).toEqual([]);
    });

    it('should be case-insensitive', () => {
      const result = getTarotsBySephirah('ALEPH');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('TODOS_ARCANOS_MAIORES', () => {
    it('should contain all 22 card numbers', () => {
      expect(TODOS_ARCANOS_MAIORES.length).toBe(22);
    });

    it('should be sorted ascending', () => {
      for (let i = 0; i < TODOS_ARCANOS_MAIORES.length - 1; i++) {
        expect(TODOS_ARCANOS_MAIORES[i]).toBeLessThan(TODOS_ARCANOS_MAIORES[i + 1]);
      }
    });

    it('should start with 0 and end with 21', () => {
      expect(TODOS_ARCANOS_MAIORES[0]).toBe(0);
      expect(TODOS_ARCANOS_MAIORES[21]).toBe(21);
    });
  });

  describe('SOLFEGGIO_FREQUENCIES', () => {
    it('should contain exactly 7 frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES.length).toBe(7);
    });

    it('should contain all standard Solfeggio frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES).toContain(396);
      expect(SOLFEGGIO_FREQUENCIES).toContain(417);
      expect(SOLFEGGIO_FREQUENCIES).toContain(528);
      expect(SOLFEGGIO_FREQUENCIES).toContain(639);
      expect(SOLFEGGIO_FREQUENCIES).toContain(741);
      expect(SOLFEGGIO_FREQUENCIES).toContain(852);
      expect(SOLFEGGIO_FREQUENCIES).toContain(963);
    });
  });

  describe('Type exports', () => {
    it('should export TarotFrequencyMapping type', () => {
      const mapping: TarotFrequencyMapping = {
        numero_carta: 0,
        arcano: 'O Louco',
        frequencia: 417,
        elemento: 'Ar',
        chakra: 5,
        chakra_nome: 'Vishuddha (Garganta)',
        significado_espiritual: 'Libertação',
        propriedades_healing: ['Facilita mudanças'],
        orixa: 'Eshu',
        sephirah: 'Aleph',
      };
      expect(mapping.numero_carta).toBe(0);
      expect(mapping.arcano).toBe('O Louco');
    });
  });
});
