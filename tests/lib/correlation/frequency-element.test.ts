import { describe, it, expect } from 'vitest';
import {
  getFrequencyElement,
  getElementByFrequency,
  getFrequenciesByElement,
  getHealingByFrequency,
  getEnergyQualityByFrequency,
  getOrixaByFrequency,
  getSephirahByFrequency,
  getChakraByFrequency,
  getAllElements,
  getAllFrequencyElements,
  getFrequenciesByTemperature,
  getFrequenciesByMoisture,
  FREQUENCY_ELEMENT_MAP,
  SOLFEGGIO_FREQUENCIES,
  type FrequencyElementMapping,
  type Elemento,
} from '@/lib/correlation/frequency-element';

describe('FrequencyElement Correlation', () => {
  describe('getFrequencyElement', () => {
    it('should return mapping for 396 Hz (Terra)', () => {
      const result = getFrequencyElement(396);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(396);
      expect(result?.elemento).toBe('Terra');
      expect(result?.qualidade_energetica).toBeDefined();
      expect(result?.aplicacao_healing).toBeDefined();
    });

    it('should return mapping for 417 Hz (Água)', () => {
      const result = getFrequencyElement(417);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(417);
      expect(result?.elemento).toBe('Água');
    });

    it('should return mapping for 528 Hz (Fogo)', () => {
      const result = getFrequencyElement(528);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(528);
      expect(result?.elemento).toBe('Fogo');
    });

    it('should return mapping for 639 Hz (Ar)', () => {
      const result = getFrequencyElement(639);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(639);
      expect(result?.elemento).toBe('Ar');
    });

    it('should return mapping for 741 Hz (Ar)', () => {
      const result = getFrequencyElement(741);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(741);
      expect(result?.elemento).toBe('Ar');
    });

    it('should return mapping for 852 Hz (Éter)', () => {
      const result = getFrequencyElement(852);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(852);
      expect(result?.elemento).toBe('Éter');
    });

    it('should return mapping for 963 Hz (Éter)', () => {
      const result = getFrequencyElement(963);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(963);
      expect(result?.elemento).toBe('Éter');
    });

    it('should return null for non-Solfeggio frequencies', () => {
      expect(getFrequencyElement(100)).toBeNull();
      expect(getFrequencyElement(256)).toBeNull();
      expect(getFrequencyElement(432)).toBeNull();
      expect(getFrequencyElement(500)).toBeNull();
      expect(getFrequencyElement(1000)).toBeNull();
    });
  });

  describe('getElementByFrequency', () => {
    it('should return "Terra" for 396 Hz', () => {
      expect(getElementByFrequency(396)).toBe('Terra');
    });

    it('should return "Água" for 417 Hz', () => {
      expect(getElementByFrequency(417)).toBe('Água');
    });

    it('should return "Fogo" for 528 Hz', () => {
      expect(getElementByFrequency(528)).toBe('Fogo');
    });

    it('should return "Ar" for 639 Hz', () => {
      expect(getElementByFrequency(639)).toBe('Ar');
    });

    it('should return "Éter" for 963 Hz', () => {
      expect(getElementByFrequency(963)).toBe('Éter');
    });

    it('should return null for invalid frequencies', () => {
      expect(getElementByFrequency(999)).toBeNull();
    });
  });

  describe('FREQUENCY_ELEMENT_MAP', () => {
    it('should contain all 7 Solfeggio frequencies', () => {
      const frequencies = Object.keys(FREQUENCY_ELEMENT_MAP).map(Number);
      expect(frequencies).toHaveLength(7);
      expect(frequencies).toContain(396);
      expect(frequencies).toContain(417);
      expect(frequencies).toContain(528);
      expect(frequencies).toContain(639);
      expect(frequencies).toContain(741);
      expect(frequencies).toContain(852);
      expect(frequencies).toContain(963);
    });

    it('should have qualidade_energetica for each frequency', () => {
      for (const freq of SOLFEGGIO_FREQUENCIES) {
        const mapping = FREQUENCY_ELEMENT_MAP[freq];
        expect(mapping.qualidade_energetica).toBeDefined();
        expect(mapping.qualidade_energetica.natureza).toBeTruthy();
        expect(mapping.qualidade_energetica.temperatura).toBeTruthy();
        expect(mapping.qualidade_energetica.umidade).toBeTruthy();
        expect(mapping.qualidade_energetica.acao_primaria).toBeTruthy();
        expect(mapping.qualidade_energetica.fluxo_energetico).toBeTruthy();
      }
    });

    it('should have aplicacao_healing for each frequency', () => {
      for (const freq of SOLFEGGIO_FREQUENCIES) {
        const mapping = FREQUENCY_ELEMENT_MAP[freq];
        expect(mapping.aplicacao_healing).toBeDefined();
        expect(mapping.aplicacao_healing.fisico).toBeTruthy();
        expect(mapping.aplicacao_healing.emocional).toBeTruthy();
        expect(mapping.aplicacao_healing.mental_espiritual).toBeTruthy();
        expect(mapping.aplicacao_healing.pratica_recomendada).toBeTruthy();
      }
    });

    it('should have orixa for each frequency', () => {
      for (const freq of SOLFEGGIO_FREQUENCIES) {
        const mapping = FREQUENCY_ELEMENT_MAP[freq];
        expect(mapping.orixa).toBeTruthy();
      }
    });

    it('should have sephirah for each frequency', () => {
      for (const freq of SOLFEGGIO_FREQUENCIES) {
        const mapping = FREQUENCY_ELEMENT_MAP[freq];
        expect(mapping.sephirah).toBeTruthy();
      }
    });

    it('should have chakra for each frequency', () => {
      for (const freq of SOLFEGGIO_FREQUENCIES) {
        const mapping = FREQUENCY_ELEMENT_MAP[freq];
        expect(mapping.chakra).toBeTruthy();
      }
    });
  });

  describe('getFrequenciesByElement', () => {
    it('should return frequencies for Terra element', () => {
      const result = getFrequenciesByElement('Terra');
      expect(result).toHaveLength(1);
      expect(result[0].frequencia).toBe(396);
    });

    it('should return frequencies for Água element', () => {
      const result = getFrequenciesByElement('Água');
      expect(result).toHaveLength(1);
      expect(result[0].frequencia).toBe(417);
    });

    it('should return frequencies for Fogo element', () => {
      const result = getFrequenciesByElement('Fogo');
      expect(result).toHaveLength(1);
      expect(result[0].frequencia).toBe(528);
    });

    it('should return frequencies for Ar element', () => {
      const result = getFrequenciesByElement('Ar');
      expect(result).toHaveLength(2);
      expect(result.map(r => r.frequencia)).toContain(639);
      expect(result.map(r => r.frequencia)).toContain(741);
    });

    it('should return frequencies for Éter element', () => {
      const result = getFrequenciesByElement('Éter');
      expect(result).toHaveLength(2);
      expect(result.map(r => r.frequencia)).toContain(852);
      expect(result.map(r => r.frequencia)).toContain(963);
    });

    it('should be case insensitive', () => {
      expect(getFrequenciesByElement('fogo')).toHaveLength(1);
      expect(getFrequenciesByElement('FOGO')).toHaveLength(1);
      expect(getFrequenciesByElement('terra')).toHaveLength(1);
    });
  });

  describe('getHealingByFrequency', () => {
    it('should return healing applications for 528 Hz', () => {
      const result = getHealingByFrequency(528);
      expect(result).not.toBeNull();
      expect(result?.fisico).toContain('metabolismo');
      expect(result?.emocional).toContain('amor');
      expect(result?.pratica_recomendada).toContain('intention');
    });

    it('should return null for invalid frequency', () => {
      expect(getHealingByFrequency(999)).toBeNull();
    });
  });

  describe('getEnergyQualityByFrequency', () => {
    it('should return energy quality for 396 Hz', () => {
      const result = getEnergyQualityByFrequency(396);
      expect(result).not.toBeNull();
      expect(result?.temperatura).toBe('Frio');
      expect(result?.umidade).toBe('Seco');
      expect(result?.natureza).toContain('Ancoramento');
    });

    it('should return null for invalid frequency', () => {
      expect(getEnergyQualityByFrequency(999)).toBeNull();
    });
  });

  describe('getOrixaByFrequency', () => {
    it('should return Orixá for 396 Hz (Oxalufã/Obaluayê)', () => {
      const result = getOrixaByFrequency(396);
      expect(result).toBe('Oxalufã / Obaluayê');
    });

    it('should return Orixá for 528 Hz (Xangô)', () => {
      const result = getOrixaByFrequency(528);
      expect(result).toBe('Xangô / Logun Ede');
    });

    it('should return null for invalid frequency', () => {
      expect(getOrixaByFrequency(999)).toBeNull();
    });
  });

  describe('getSephirahByFrequency', () => {
    it('should return Sephirah for 963 Hz (Kether)', () => {
      const result = getSephirahByFrequency(963);
      expect(result).toBe('Kether (Coroa)');
    });

    it('should return null for invalid frequency', () => {
      expect(getSephirahByFrequency(999)).toBeNull();
    });
  });

  describe('getChakraByFrequency', () => {
    it('should return chakra for 528 Hz (Manipura)', () => {
      const result = getChakraByFrequency(528);
      expect(result).toBe('3º Plexo Solar (Manipura)');
    });

    it('should return null for invalid frequency', () => {
      expect(getChakraByFrequency(999)).toBeNull();
    });
  });

  describe('getAllElements', () => {
    it('should return all unique elements', () => {
      const elements = getAllElements();
      expect(elements).toContain('Terra');
      expect(elements).toContain('Água');
      expect(elements).toContain('Fogo');
      expect(elements).toContain('Ar');
      expect(elements).toContain('Éter');
    });
  });

  describe('getAllFrequencyElements', () => {
    it('should return all 7 frequency-element mappings', () => {
      const result = getAllFrequencyElements();
      expect(result).toHaveLength(7);
    });

    it('should return array with all required properties', () => {
      const result = getAllFrequencyElements();
      const first = result[0];
      expect(first.frequencia).toBeDefined();
      expect(first.elemento).toBeDefined();
      expect(first.qualidade_energetica).toBeDefined();
      expect(first.aplicacao_healing).toBeDefined();
      expect(first.chakra).toBeDefined();
      expect(first.orixa).toBeDefined();
      expect(first.sephirah).toBeDefined();
    });
  });

  describe('getFrequenciesByTemperature', () => {
    it('should return frequencies with Quente temperature', () => {
      const result = getFrequenciesByTemperature('Quente');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => r.qualidade_energetica.temperatura === 'Quente')).toBe(true);
    });

    it('should return frequencies with Frio temperature', () => {
      const result = getFrequenciesByTemperature('Frio');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => r.qualidade_energetica.temperatura === 'Frio')).toBe(true);
    });
  });

  describe('getFrequenciesByMoisture', () => {
    it('should return frequencies with Seco moisture', () => {
      const result = getFrequenciesByMoisture('Seco');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => r.qualidade_energetica.umidade === 'Seco')).toBe(true);
    });

    it('should return frequencies with Úmido moisture', () => {
      const result = getFrequenciesByMoisture('Úmido');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(r => r.qualidade_energetica.umidade === 'Úmido')).toBe(true);
    });
  });

  describe('SOLFEGGIO_FREQUENCIES constant', () => {
    it('should contain all 7 frequencies in order', () => {
      expect(SOLFEGGIO_FREQUENCIES).toEqual([396, 417, 528, 639, 741, 852, 963]);
    });
  });

  describe('Integration with other correlations', () => {
    it('should have consistent chakra mapping with frequency-chakra', () => {
      const freq396 = getFrequencyElement(396);
      expect(freq396?.chakra).toContain('Muladhara');
    });

    it('should have Éter element for highest frequencies (852, 963)', () => {
      expect(getElementByFrequency(852)).toBe('Éter');
      expect(getElementByFrequency(963)).toBe('Éter');
    });

    it('should have Terras element for lowest frequency (396)', () => {
      expect(getElementByFrequency(396)).toBe('Terra');
    });
  });
});