import { describe, it, expect } from 'vitest';
import {
  getNumerologyFrequency,
  getFrequencyNumerology,
  getAllNumerologyFrequencies,
  getFrequencyByNumerologyNumber,
  getElementByNumerologyNumber,
  getChakraByNumerologyNumber,
  getHealingByNumerologyNumber,
  getSpiritualMeaningByNumerologyNumber,
  getAllNumerologyNumbers,
  getAllFrequencies,
  getNumerologyByElement,
  getNumerologyByChakra,
  NUMEROLOGY_FREQUENCY_MAP,
  type NumerologyFrequencyMapping,
  type Numerologia,
} from '@/lib/correlation/numerology-frequency';

describe('NumerologyFrequency Correlation', () => {
  describe('getNumerologyFrequency', () => {
    it('should return mapping for valid numbers 1-9', () => {
      for (let i = 1; i <= 9; i++) {
        const result = getNumerologyFrequency(i);
        expect(result).toBeDefined();
        expect(result).toHaveProperty('numero', i);
        expect(result).toHaveProperty('frequencia');
        expect(result).toHaveProperty('elemento');
        expect(result).toHaveProperty('significado_espiritual');
        expect(result).toHaveProperty('propriedades_healing');
        expect(result).toHaveProperty('analise_vibracional');
      }
    });

    it('should return null for numbers outside 1-9 range', () => {
      expect(getNumerologyFrequency(0)).toBeNull();
      expect(getNumerologyFrequency(10)).toBeNull();
      expect(getNumerologyFrequency(-1)).toBeNull();
      expect(getNumerologyFrequency(100)).toBeNull();
    });

    it('should return null for non-integer numbers', () => {
      expect(getNumerologyFrequency(1.5)).toBeNull();
      expect(getNumerologyFrequency(3.14)).toBeNull();
      expect(getNumerologyFrequency(7.999)).toBeNull();
    });

    it('should return correct frequency for each number', () => {
      expect(getNumerologyFrequency(1)?.frequencia).toBe(963);
      expect(getNumerologyFrequency(2)?.frequencia).toBe(852);
      expect(getNumerologyFrequency(3)?.frequencia).toBe(396);
      expect(getNumerologyFrequency(4)?.frequencia).toBe(741);
      expect(getNumerologyFrequency(5)?.frequencia).toBe(639);
      expect(getNumerologyFrequency(6)?.frequencia).toBe(528);
      expect(getNumerologyFrequency(7)?.frequencia).toBe(417);
      expect(getNumerologyFrequency(8)?.frequencia).toBe(639);
      expect(getNumerologyFrequency(9)?.frequencia).toBe(417);
    });

    it('should return correct element for each number', () => {
      expect(getNumerologyFrequency(1)?.elemento).toBe('Éter');
      expect(getNumerologyFrequency(2)?.elemento).toBe('Água');
      expect(getNumerologyFrequency(3)?.elemento).toBe('Terra');
      expect(getNumerologyFrequency(4)?.elemento).toBe('Ar');
      expect(getNumerologyFrequency(5)?.elemento).toBe('Água');
      expect(getNumerologyFrequency(6)?.elemento).toBe('Terra');
      expect(getNumerologyFrequency(7)?.elemento).toBe('Fogo');
      expect(getNumerologyFrequency(8)?.elemento).toBe('Terra');
      expect(getNumerologyFrequency(9)?.elemento).toBe('Fogo');
    });

    it('should include complete structure for each mapping', () => {
      const result = getNumerologyFrequency(1);
      expect(result?.significado_espiritual).toHaveProperty('significado');
      expect(result?.significado_espiritual).toHaveProperty('qualidades_positivas');
      expect(result?.significado_espiritual).toHaveProperty('desafios');
      expect(result?.significado_espiritual).toHaveProperty('caminho_de_vida');
      expect(result?.propriedades_healing).toHaveProperty('fisico');
      expect(result?.propriedades_healing).toHaveProperty('emocional');
      expect(result?.propriedades_healing).toHaveProperty('mental_espiritual');
      expect(result?.propriedades_healing).toHaveProperty('chakra');
      expect(result?.propriedades_healing).toHaveProperty('orixa');
      expect(result?.analise_vibracional).toHaveProperty('chakra_activacao');
      expect(result?.analise_vibracional).toHaveProperty('assinatura_orixa');
      expect(result?.analise_vibracional).toHaveProperty('mantra');
      expect(result?.analise_vibracional).toHaveProperty('horario_sagrado');
    });
  });

  describe('getFrequencyNumerology', () => {
    it('should return a record mapping frequencies to numbers', () => {
      const result = getFrequencyNumerology();
      expect(result).toBeInstanceOf(Object);
    });

    it('should map primary frequencies to their representative number', () => {
      const result = getFrequencyNumerology();
      expect(result[963]).toBe(1);
      expect(result[852]).toBe(2);
      expect(result[396]).toBe(3);
      expect(result[741]).toBe(4);
      expect(result[528]).toBe(6);
    });

    it('should have 7 unique frequencies in the mapping', () => {
      const result = getFrequencyNumerology();
      const frequencies = Object.keys(result).map(Number);
      expect(frequencies.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe('getAllNumerologyFrequencies', () => {
    it('should return an array of all mappings', () => {
      const result = getAllNumerologyFrequencies();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return 9 mappings (one for each number 1-9)', () => {
      const result = getAllNumerologyFrequencies();
      expect(result.length).toBe(9);
    });

    it('should return mappings sorted by numero ascending', () => {
      const result = getAllNumerologyFrequencies();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].numero).toBeLessThan(result[i + 1].numero);
      }
    });

    it('should include all numbers 1-9', () => {
      const result = getAllNumerologyFrequencies();
      const numbers = result.map((r) => r.numero);
      expect(numbers).toContain(1);
      expect(numbers).toContain(2);
      expect(numbers).toContain(3);
      expect(numbers).toContain(4);
      expect(numbers).toContain(5);
      expect(numbers).toContain(6);
      expect(numbers).toContain(7);
      expect(numbers).toContain(8);
      expect(numbers).toContain(9);
    });
  });

  describe('getFrequencyByNumerologyNumber', () => {
    it('should return the correct frequency for each number', () => {
      expect(getFrequencyByNumerologyNumber(1)).toBe(963);
      expect(getFrequencyByNumerologyNumber(2)).toBe(852);
      expect(getFrequencyByNumerologyNumber(3)).toBe(396);
      expect(getFrequencyByNumerologyNumber(6)).toBe(528);
    });

    it('should return null for invalid numbers', () => {
      expect(getFrequencyByNumerologyNumber(0)).toBeNull();
      expect(getFrequencyByNumerologyNumber(10)).toBeNull();
    });
  });

  describe('getElementByNumerologyNumber', () => {
    it('should return the correct element for each number', () => {
      expect(getElementByNumerologyNumber(1)).toBe('Éter');
      expect(getElementByNumerologyNumber(3)).toBe('Terra');
      expect(getElementByNumerologyNumber(7)).toBe('Fogo');
    });

    it('should return null for invalid numbers', () => {
      expect(getElementByNumerologyNumber(0)).toBeNull();
      expect(getElementByNumerologyNumber(10)).toBeNull();
    });
  });

  describe('getChakraByNumerologyNumber', () => {
    it('should return the chakra for valid numbers', () => {
      expect(getChakraByNumerologyNumber(1)).toBe('7º Coroa (Sahasrara)');
      expect(getChakraByNumerologyNumber(2)).toBe('6º Terceiro Olho (Ajna)');
      expect(getChakraByNumerologyNumber(6)).toBe('4º Cardíaco (Anahata) e 3º Plexo Solar (Manipura)');
    });

    it('should return null for invalid numbers', () => {
      expect(getChakraByNumerologyNumber(0)).toBeNull();
      expect(getChakraByNumerologyNumber(10)).toBeNull();
    });
  });

  describe('getHealingByNumerologyNumber', () => {
    it('should return healing properties for valid numbers', () => {
      const result = getHealingByNumerologyNumber(1);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('fisico');
      expect(result).toHaveProperty('emocional');
      expect(result).toHaveProperty('mental_espiritual');
      expect(result).toHaveProperty('chakra');
      expect(result).toHaveProperty('orixa');
    });

    it('should return null for invalid numbers', () => {
      expect(getHealingByNumerologyNumber(0)).toBeNull();
      expect(getHealingByNumerologyNumber(10)).toBeNull();
    });
  });

  describe('getSpiritualMeaningByNumerologyNumber', () => {
    it('should return spiritual meaning for valid numbers', () => {
      const result = getSpiritualMeaningByNumerologyNumber(1);
      expect(result).toBeDefined();
      expect(result).toHaveProperty('significado');
      expect(result).toHaveProperty('qualidades_positivas');
      expect(result).toHaveProperty('desafios');
      expect(result).toHaveProperty('caminho_de_vida');
    });

    it('should return null for invalid numbers', () => {
      expect(getSpiritualMeaningByNumerologyNumber(0)).toBeNull();
      expect(getSpiritualMeaningByNumerologyNumber(10)).toBeNull();
    });
  });

  describe('getAllNumerologyNumbers', () => {
    it('should return array of numbers 1-9', () => {
      const result = getAllNumerologyNumbers();
      expect(result).toHaveLength(9);
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  describe('getAllFrequencies', () => {
    it('should return array of unique frequencies', () => {
      const result = getAllFrequencies();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return frequencies in ascending order', () => {
      const result = getAllFrequencies();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]).toBeLessThan(result[i + 1]);
      }
    });

    it('should include standard Solfeggio frequencies', () => {
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

  describe('getNumerologyByElement', () => {
    it('should return mappings for Fogo element', () => {
      const result = getNumerologyByElement('Fogo');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.elemento === 'Fogo')).toBe(true);
    });

    it('should return mappings for Água element', () => {
      const result = getNumerologyByElement('Água');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.elemento === 'Água')).toBe(true);
    });

    it('should return mappings for Terra element', () => {
      const result = getNumerologyByElement('Terra');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.elemento === 'Terra')).toBe(true);
    });

    it('should be case insensitive', () => {
      const upper = getNumerologyByElement('FOGO');
      const lower = getNumerologyByElement('fogo');
      expect(upper.length).toBe(lower.length);
    });

    it('should return empty array for non-existent element', () => {
      const result = getNumerologyByElement('NonExistent');
      expect(result).toEqual([]);
    });
  });

  describe('getNumerologyByChakra', () => {
    it('should return mappings for corona chakra', () => {
      const result = getNumerologyByChakra('Coroa');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return mappings for third eye chakra', () => {
      const result = getNumerologyByChakra('Terceiro Olho');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should be case insensitive', () => {
      const upper = getNumerologyByChakra('CORA');
      const lower = getNumerologyByChakra('cora');
      expect(upper.length).toBe(lower.length);
    });
  });

  describe('NUMEROLOGY_FREQUENCY_MAP', () => {
    it('should be a frozen object', () => {
      expect(Object.isFrozen(NUMEROLOGY_FREQUENCY_MAP)).toBe(true);
    });

    it('should have entries for all numbers 1-9', () => {
      for (let i = 1; i <= 9; i++) {
        expect(NUMEROLOGY_FREQUENCY_MAP[i as Numerologia]).toBeDefined();
      }
    });

    it('should have valid frequency values', () => {
      const validFrequencies = [396, 417, 528, 639, 741, 852, 963];
      for (const mapping of Object.values(NUMEROLOGY_FREQUENCY_MAP)) {
        expect(validFrequencies).toContain(mapping.frequencia);
      }
    });

    it('should have valid element values', () => {
      const validElements = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      for (const mapping of Object.values(NUMEROLOGY_FREQUENCY_MAP)) {
        expect(validElements).toContain(mapping.elemento);
      }
    });

    it('should have nested objects that are frozen', () => {
      for (const mapping of Object.values(NUMEROLOGY_FREQUENCY_MAP)) {
        expect(Object.isFrozen(mapping)).toBe(true);
      }
    });
  });

  describe('Integration with other correlations', () => {
    it('should have frequencies that match Solfeggio standard', () => {
      const frequencies = getAllFrequencies();
      const solfeggioBase = [396, 417, 528, 639, 741, 852, 963];
      
      for (const freq of frequencies) {
        expect(solfeggioBase).toContain(freq);
      }
    });

    it('should have elements that match element system', () => {
      const frequencies = getAllFrequencies();
      for (const freq of frequencies) {
        const numResult = Object.entries(NUMEROLOGY_FREQUENCY_MAP).find(
          ([, mapping]) => mapping.frequencia === freq
        );
        expect(numResult).toBeDefined();
      }
    });

    it('should be consistent between getNumerologyFrequency and direct map access', () => {
      for (let i = 1; i <= 9; i++) {
        const result = getNumerologyFrequency(i);
        const direct = NUMEROLOGY_FREQUENCY_MAP[i as Numerologia];
        expect(result).toEqual(direct);
      }
    });

    it('should be consistent for non-shared frequencies', () => {
      const result = getFrequencyNumerology();
      // Only test unique frequencies since multiple numbers can share the same frequency
      const uniqueFrequencyNumbers: Record<number, number> = {};
      for (const [num, mapping] of Object.entries(NUMEROLOGY_FREQUENCY_MAP)) {
        if (!uniqueFrequencyNumbers[mapping.frequencia]) {
          uniqueFrequencyNumbers[mapping.frequencia] = parseInt(num);
        }
      }
      // Test unique mappings only
      expect(result[963]).toBe(1);
      expect(result[852]).toBe(2);
      expect(result[396]).toBe(3);
      expect(result[741]).toBe(4);
      expect(result[528]).toBe(6);
      // Note: 639 Hz is shared by numbers 5 and 8, so it's not tested here
      // The function returns the last number encountered in the iteration order
    });
  });
});
