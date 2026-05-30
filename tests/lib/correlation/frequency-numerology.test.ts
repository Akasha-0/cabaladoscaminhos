import { describe, it, expect } from 'vitest';
import {
  getFrequencyNumerology,
  getNumerologyByFrequency,
  getFrequencyByNumerology,
  getElementByFrequency,
  getHealingByFrequency,
  getVibrationalAnalysis,
  getNumerologyMeaning,
  getAllNumerologyNumbers,
  getAllFrequencyNumerology,
  getFrequenciesByElement,
  FREQUENCY_NUMEROLOGY_MAP,
  SOLFEGGIO_FREQUENCIES,
  type FrequencyNumerologyMapping,
  type Numerologia,
} from '@/lib/correlation/frequency-numerology';

describe('FrequencyNumerology Correlation', () => {
  describe('getFrequencyNumerology', () => {
    it('should return the mapping for frequency 396', () => {
      const result = getFrequencyNumerology(396);
      expect(result).toBeDefined();
      expect(result?.frequencia).toBe(396);
      expect(result?.numerologia).toBe(3);
    });

    it('should return the mapping for frequency 528', () => {
      const result = getFrequencyNumerology(528);
      expect(result).toBeDefined();
      expect(result?.frequencia).toBe(528);
      expect(result?.numerologia).toBe(9);
    });

    it('should return the mapping for frequency 963', () => {
      const result = getFrequencyNumerology(963);
      expect(result).toBeDefined();
      expect(result?.frequencia).toBe(963);
      expect(result?.numerologia).toBe(9);
    });

    it('should return null for unknown frequency', () => {
      const result = getFrequencyNumerology(100);
      expect(result).toBeNull();
    });

    it('should return null for negative frequency', () => {
      const result = getFrequencyNumerology(-396);
      expect(result).toBeNull();
    });
  });

  describe('getNumerologyByFrequency', () => {
    it('should return numerology 3 for frequency 396', () => {
      const result = getNumerologyByFrequency(396);
      expect(result).toBe(3);
    });

    it('should return numerology 9 for frequency 528', () => {
      const result = getNumerologyByFrequency(528);
      expect(result).toBe(9);
    });

    it('should return numerology 6 for frequency 852', () => {
      const result = getNumerologyByFrequency(852);
      expect(result).toBe(6);
    });

    it('should return null for unknown frequency', () => {
      const result = getNumerologyByFrequency(999);
      expect(result).toBeNull();
    });
  });

  describe('getFrequencyByNumerology', () => {
    it('should return frequencies with numerology 3', () => {
      const results = getFrequencyByNumerology(3);
      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => expect(r.numerologia).toBe(3));
    });

    it('should return frequencies with numerology 9', () => {
      const results = getFrequencyByNumerology(9);
      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => expect(r.numerologia).toBe(9));
    });

    it('should return frequencies with numerology 6', () => {
      const results = getFrequencyByNumerology(6);
      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => expect(r.numerologia).toBe(6));
    });

    it('should return empty array for unknown numerology', () => {
      const results = getFrequencyByNumerology(1);
      expect(results).toEqual([]);
    });
  });

  describe('getElementByFrequency', () => {
    it('should return Terra for frequency 396', () => {
      const result = getElementByFrequency(396);
      expect(result).toBe('Terra');
    });

    it('should return Água for frequency 417', () => {
      const result = getElementByFrequency(417);
      expect(result).toBe('Água');
    });

    it('should return Fogo for frequency 528', () => {
      const result = getElementByFrequency(528);
      expect(result).toBe('Fogo');
    });

    it('should return Éter for frequency 963', () => {
      const result = getElementByFrequency(963);
      expect(result).toBe('Éter');
    });

    it('should return null for unknown frequency', () => {
      const result = getElementByFrequency(100);
      expect(result).toBeNull();
    });
  });

  describe('getHealingByFrequency', () => {
    it('should return healing properties for frequency 528', () => {
      const result = getHealingByFrequency(528);
      expect(result).toBeDefined();
      expect(result?.fisico).toBeDefined();
      expect(result?.emocional).toBeDefined();
      expect(result?.mental_espiritual).toBeDefined();
      expect(result?.chakra).toBe('3º Plexo Solar (Manipura)');
      expect(result?.orixa).toBe('Xangô / Logun Ede');
    });

    it('should return null for unknown frequency', () => {
      const result = getHealingByFrequency(100);
      expect(result).toBeNull();
    });
  });

  describe('getVibrationalAnalysis', () => {
    it('should return vibrational analysis for frequency 528', () => {
      const result = getVibrationalAnalysis(528);
      expect(result).toBeDefined();
      expect(result?.chakra_activacao).toBeDefined();
      expect(result?.assinatura_orixa).toBeDefined();
      expect(result?.mantra).toBeDefined();
      expect(result?.horario_sagrado).toBeDefined();
    });

    it('should return null for unknown frequency', () => {
      const result = getVibrationalAnalysis(100);
      expect(result).toBeNull();
    });
  });

  describe('getNumerologyMeaning', () => {
    it('should return numerology meaning for frequency 528', () => {
      const result = getNumerologyMeaning(528);
      expect(result).toBeDefined();
      expect(result?.significado).toBe('Iluminação, compaixão e realização divina');
      expect(result?.qualidades_positivas).toBeDefined();
      expect(result?.desafios).toBeDefined();
      expect(result?.caminho_de_vida).toBeDefined();
    });

    it('should return null for unknown frequency', () => {
      const result = getNumerologyMeaning(100);
      expect(result).toBeNull();
    });
  });

  describe('FREQUENCY_NUMEROLOGY_MAP', () => {
    it('should contain all 7 Solfeggio frequencies', () => {
      expect(Object.keys(FREQUENCY_NUMEROLOGY_MAP).length).toBe(7);
    });

    it('should have correct structure for each mapping', () => {
      Object.values(FREQUENCY_NUMEROLOGY_MAP).forEach((mapping) => {
        expect(mapping).toHaveProperty('frequencia');
        expect(mapping).toHaveProperty('numerologia');
        expect(mapping).toHaveProperty('significado_numerologico');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('propriedades_healing');
        expect(mapping).toHaveProperty('analise_vibracional');
      });
    });

    it('should have valid numerology numbers (1-9)', () => {
      Object.values(FREQUENCY_NUMEROLOGY_MAP).forEach((mapping) => {
        expect(mapping.numerologia).toBeGreaterThanOrEqual(1);
        expect(mapping.numerologia).toBeLessThanOrEqual(9);
      });
    });

    it('should have valid elements', () => {
      const validElements = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      Object.values(FREQUENCY_NUMEROLOGY_MAP).forEach((mapping) => {
        expect(validElements).toContain(mapping.elemento);
      });
    });
  });

  describe('getAllNumerologyNumbers', () => {
    it('should return unique numerology numbers sorted', () => {
      const result = getAllNumerologyNumbers();
      expect(result.length).toBeGreaterThan(0);
      // Check that result is sorted
      const sorted = [...result].sort((a, b) => a - b);
      expect(result).toEqual(sorted);
    });

    it('should return only numbers within 1-9 range', () => {
      const result = getAllNumerologyNumbers();
      result.forEach((num) => {
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(9);
      });
    });
  });

  describe('getAllFrequencyNumerology', () => {
    it('should return all mappings', () => {
      const result = getAllFrequencyNumerology();
      expect(result.length).toBe(7);
    });

    it('should return copies, not references', () => {
      const result = getAllFrequencyNumerology();
      // Modifying result should not affect original
      result[0].numerologia = 99 as Numerologia;
      const original = getFrequencyNumerology(396);
      expect(original?.numerologia).toBe(3);
    });
  });

  describe('getFrequenciesByElement', () => {
    it('should return frequencies for Terra', () => {
      const results = getFrequenciesByElement('Terra');
      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => expect(r.elemento).toBe('Terra'));
    });

    it('should return frequencies for Água', () => {
      const results = getFrequenciesByElement('Água');
      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => expect(r.elemento).toBe('Água'));
    });

    it('should return frequencies for Éter', () => {
      const results = getFrequenciesByElement('Éter');
      expect(results.length).toBe(2); // 852 and 963
      results.forEach((r) => expect(r.elemento).toBe('Éter'));
    });

    it('should return empty array for unknown element', () => {
      const results = getFrequenciesByElement('Unknown');
      expect(results).toEqual([]);
    });
  });

  describe('SOLFEGGIO_FREQUENCIES constant', () => {
    it('should contain all 7 frequencies in ascending order', () => {
      expect(SOLFEGGIO_FREQUENCIES).toEqual([396, 417, 528, 639, 741, 852, 963]);
    });

    it('should have correct length', () => {
      expect(SOLFEGGIO_FREQUENCIES.length).toBe(7);
    });
  });

  describe('Integration with other correlations', () => {
    it('should be compatible with frequency-element correlation', () => {
      const freq528 = getFrequencyNumerology(528);
      expect(freq528?.elemento).toBe('Fogo');
      expect(freq528?.propriedades_healing.chakra).toBe('3º Plexo Solar (Manipura)');
    });

    it('should have chakra mappings that align with element', () => {
      const freq396 = getFrequencyNumerology(396);
      expect(freq396?.elemento).toBe('Terra');
      expect(freq396?.propriedades_healing.chakra).toContain('Básico');
    });

    it('should have orixá mappings that align with element', () => {
      const freq417 = getFrequencyNumerology(417);
      expect(freq417?.elemento).toBe('Água');
      expect(freq417?.propriedades_healing.orixa).toBe('Oxum / Iemanjá');
    });
  });
});