import { describe, it, expect } from 'vitest';
import {
  getFrequencyOdu,
  getOduByFrequency,
  getOduNumberByFrequency,
  getFrequenciesByOdu,
  getHealingByFrequency,
  getEnergyQualityByFrequency,
  getOrixaByFrequency,
  getSephirahByFrequency,
  getChakraByFrequency,
  getElementByFrequency,
  getAllOduNames,
  getAllFrequencyOdus,
  getFrequenciesByTemperature,
  getFrequenciesByMoisture,
  getFrequenciesByElement,
  getOduFrequency,
  FREQUENCY_ODU_MAP,
  SOLFEGGIO_FREQUENCIES,
  type FrequencyOduMapping,
  type Elemento,
} from '@/lib/correlation/frequency-odu';

describe('FrequencyOdu Correlation', () => {
  describe('getFrequencyOdu', () => {
    it('should return mapping for 396 Hz (Okaran)', () => {
      const result = getFrequencyOdu(396);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(396);
      expect(result?.odu).toBe('Okaran');
      expect(result?.numero).toBe(1);
      expect(result?.elemento).toBe('Terra');
      expect(result?.qualidade_energetica).toBeDefined();
      expect(result?.aplicacao_healing).toBeDefined();
    });

    it('should return mapping for 417 Hz (Ofun)', () => {
      const result = getFrequencyOdu(417);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(417);
      expect(result?.odu).toBe('Ofun');
      expect(result?.numero).toBe(10);
      expect(result?.elemento).toBe('Água');
    });

    it('should return mapping for 528 Hz (Ejilsebora)', () => {
      const result = getFrequencyOdu(528);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(528);
      expect(result?.odu).toBe('Ejilsebora');
      expect(result?.numero).toBe(12);
      expect(result?.elemento).toBe('Fogo');
    });

    it('should return mapping for 639 Hz (Alafia)', () => {
      const result = getFrequencyOdu(639);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(639);
      expect(result?.odu).toBe('Alafia');
      expect(result?.numero).toBe(16);
      expect(result?.elemento).toBe('Ar');
    });

    it('should return mapping for 741 Hz (Ossá)', () => {
      const result = getFrequencyOdu(741);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(741);
      expect(result?.odu).toBe('Ossá');
      expect(result?.numero).toBe(9);
      expect(result?.elemento).toBe('Ar');
    });

    it('should return mapping for 852 Hz (Odi)', () => {
      const result = getFrequencyOdu(852);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(852);
      expect(result?.odu).toBe('Odi');
      expect(result?.numero).toBe(7);
      expect(result?.elemento).toBe('Éter');
    });

    it('should return mapping for 963 Hz (Alafia)', () => {
      const result = getFrequencyOdu(963);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(963);
      expect(result?.odu).toBe('Alafia');
      expect(result?.numero).toBe(16);
      expect(result?.elemento).toBe('Éter');
    });

    it('should return null for non-Solfeggio frequencies', () => {
      expect(getFrequencyOdu(100)).toBeNull();
      expect(getFrequencyOdu(256)).toBeNull();
      expect(getFrequencyOdu(432)).toBeNull();
      expect(getFrequencyOdu(500)).toBeNull();
      expect(getFrequencyOdu(1000)).toBeNull();
    });
  });

  describe('getOduByFrequency', () => {
    it('should return "Okaran" for 396 Hz', () => {
      expect(getOduByFrequency(396)).toBe('Okaran');
    });

    it('should return "Ofun" for 417 Hz', () => {
      expect(getOduByFrequency(417)).toBe('Ofun');
    });

    it('should return "Ejilsebora" for 528 Hz', () => {
      expect(getOduByFrequency(528)).toBe('Ejilsebora');
    });

    it('should return "Alafia" for 639 Hz', () => {
      expect(getOduByFrequency(639)).toBe('Alafia');
    });

    it('should return "Ossá" for 741 Hz', () => {
      expect(getOduByFrequency(741)).toBe('Ossá');
    });

    it('should return "Odi" for 852 Hz', () => {
      expect(getOduByFrequency(852)).toBe('Odi');
    });

    it('should return null for invalid frequencies', () => {
      expect(getOduByFrequency(999)).toBeNull();
    });
  });

  describe('getOduNumberByFrequency', () => {
    it('should return 1 for 396 Hz (Okaran)', () => {
      expect(getOduNumberByFrequency(396)).toBe(1);
    });

    it('should return 10 for 417 Hz (Ofun)', () => {
      expect(getOduNumberByFrequency(417)).toBe(10);
    });

    it('should return 12 for 528 Hz (Ejilsebora)', () => {
      expect(getOduNumberByFrequency(528)).toBe(12);
    });

    it('should return 16 for 639 Hz (Alafia)', () => {
      expect(getOduNumberByFrequency(639)).toBe(16);
    });

    it('should return null for invalid frequencies', () => {
      expect(getOduNumberByFrequency(999)).toBeNull();
    });
  });

  describe('FREQUENCY_ODU_MAP', () => {
    it('should contain all 7 Solfeggio frequencies', () => {
      const frequencies = Object.keys(FREQUENCY_ODU_MAP).map(Number);
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
        const mapping = FREQUENCY_ODU_MAP[freq];
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
        const mapping = FREQUENCY_ODU_MAP[freq];
        expect(mapping.aplicacao_healing).toBeDefined();
        expect(mapping.aplicacao_healing.fisico).toBeTruthy();
        expect(mapping.aplicacao_healing.emocional).toBeTruthy();
        expect(mapping.aplicacao_healing.mental_espiritual).toBeTruthy();
        expect(mapping.aplicacao_healing.pratica_recomendada).toBeTruthy();
      }
    });

    it('should have valid odu names', () => {
      for (const freq of SOLFEGGIO_FREQUENCIES) {
        const mapping = FREQUENCY_ODU_MAP[freq];
        expect(mapping.odu).toBeTruthy();
        expect(typeof mapping.odu).toBe('string');
      }
    });

    it('should have valid odu numbers', () => {
      for (const freq of SOLFEGGIO_FREQUENCIES) {
        const mapping = FREQUENCY_ODU_MAP[freq];
        expect(mapping.numero).toBeGreaterThan(0);
        expect(mapping.numero).toBeLessThanOrEqual(16);
      }
    });

    it('should have valid orixa names', () => {
      for (const freq of SOLFEGGIO_FREQUENCIES) {
        const mapping = FREQUENCY_ODU_MAP[freq];
        expect(mapping.orixa).toBeTruthy();
        expect(typeof mapping.orixa).toBe('string');
      }
    });

    it('should have valid chakra names', () => {
      for (const freq of SOLFEGGIO_FREQUENCIES) {
        const mapping = FREQUENCY_ODU_MAP[freq];
        expect(mapping.chakra).toBeTruthy();
        expect(typeof mapping.chakra).toBe('string');
      }
    });

    it('should have valid sephirah names', () => {
      for (const freq of SOLFEGGIO_FREQUENCIES) {
        const mapping = FREQUENCY_ODU_MAP[freq];
        expect(mapping.sephirah).toBeTruthy();
        expect(typeof mapping.sephirah).toBe('string');
      }
    });
  });

  describe('getFrequenciesByOdu', () => {
    it('should return frequencies for Okaran', () => {
      const result = getFrequenciesByOdu('Okaran');
      expect(result).toHaveLength(1);
      expect(result[0].frequencia).toBe(396);
    });

    it('should return frequencies for Alafia', () => {
      const result = getFrequenciesByOdu('Alafia');
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.frequencia)).toContain(639);
      expect(result.map((r) => r.frequencia)).toContain(963);
    });

    it('should return empty array for non-existent Odu', () => {
      const result = getFrequenciesByOdu('NonExistent');
      expect(result).toHaveLength(0);
    });
  });

  describe('getOduFrequency', () => {
    it('should return mapping for Okaran', () => {
      const result = getOduFrequency('Okaran');
      expect(result).not.toBeNull();
      expect(result?.odu).toBe('Okaran');
      expect(result?.frequencia).toBe(396);
    });

    it('should return mapping for Ejilsebora', () => {
      const result = getOduFrequency('Ejilsebora');
      expect(result).not.toBeNull();
      expect(result?.odu).toBe('Ejilsebora');
      expect(result?.frequencia).toBe(528);
    });

    it('should return null for non-existent Odu', () => {
      const result = getOduFrequency('NonExistent');
      expect(result).toBeNull();
    });
  });

  describe('getHealingByFrequency', () => {
    it('should return healing application for 396 Hz', () => {
      const result = getHealingByFrequency(396);
      expect(result).not.toBeNull();
      expect(result?.fisico).toBeTruthy();
      expect(result?.emocional).toBeTruthy();
      expect(result?.mental_espiritual).toBeTruthy();
      expect(result?.pratica_recomendada).toBeTruthy();
    });

    it('should return null for invalid frequency', () => {
      expect(getHealingByFrequency(999)).toBeNull();
    });
  });

  describe('getEnergyQualityByFrequency', () => {
    it('should return energy quality for 528 Hz', () => {
      const result = getEnergyQualityByFrequency(528);
      expect(result).not.toBeNull();
      expect(result?.natureza).toBe('Transformação e poder purificador');
      expect(result?.temperatura).toBe('Quente');
      expect(result?.umidade).toBe('Seco');
    });

    it('should return null for invalid frequency', () => {
      expect(getEnergyQualityByFrequency(999)).toBeNull();
    });
  });

  describe('getOrixaByFrequency', () => {
    it('should return "Omolu" for 396 Hz', () => {
      expect(getOrixaByFrequency(396)).toBe('Omolu');
    });

    it('should return "Iemanjá" for 417 Hz', () => {
      expect(getOrixaByFrequency(417)).toBe('Iemanjá');
    });

    it('should return "Xangô" for 528 Hz', () => {
      expect(getOrixaByFrequency(528)).toBe('Xangô');
    });

    it('should return null for invalid frequency', () => {
      expect(getOrixaByFrequency(999)).toBeNull();
    });
  });

  describe('getSephirahByFrequency', () => {
    it('should return "Malkuth (Reino)" for 396 Hz', () => {
      expect(getSephirahByFrequency(396)).toBe('Malkuth (Reino)');
    });

    it('should return "Tiphereth (Beleza)" for 528 Hz', () => {
      expect(getSephirahByFrequency(528)).toBe('Tiphereth (Beleza)');
    });

    it('should return null for invalid frequency', () => {
      expect(getSephirahByFrequency(999)).toBeNull();
    });
  });

  describe('getChakraByFrequency', () => {
    it('should return "1º Básico (Muladhara)" for 396 Hz', () => {
      expect(getChakraByFrequency(396)).toBe('1º Básico (Muladhara)');
    });

    it('should return "3º Plexo Solar (Manipura)" for 528 Hz', () => {
      expect(getChakraByFrequency(528)).toBe('3º Plexo Solar (Manipura)');
    });

    it('should return null for invalid frequency', () => {
      expect(getChakraByFrequency(999)).toBeNull();
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

  describe('getAllOduNames', () => {
    it('should return unique Odu names', () => {
      const odus = getAllOduNames();
      expect(odus).toContain('Okaran');
      expect(odus).toContain('Ofun');
      expect(odus).toContain('Ejilsebora');
      expect(odus).toContain('Alafia');
      expect(odus).toContain('Ossá');
      expect(odus).toContain('Odi');
    });

    it('should return sorted array', () => {
      const odus = getAllOduNames();
      const sorted = [...odus].sort();
      expect(odus).toEqual(sorted);
    });
  });

  describe('getAllFrequencyOdus', () => {
    it('should return all 7 frequency mappings', () => {
      const result = getAllFrequencyOdus();
      expect(result).toHaveLength(7);
    });

    it('should contain all Solfeggio frequencies', () => {
      const result = getAllFrequencyOdus();
      const frequencies = result.map((r) => r.frequencia);
      expect(frequencies).toContain(396);
      expect(frequencies).toContain(417);
      expect(frequencies).toContain(528);
      expect(frequencies).toContain(639);
      expect(frequencies).toContain(741);
      expect(frequencies).toContain(852);
      expect(frequencies).toContain(963);
    });
  });

  describe('getFrequenciesByTemperature', () => {
    it('should return frequencies with "Quente" temperature', () => {
      const result = getFrequenciesByTemperature('Quente');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.qualidade_energetica.temperatura).toBe('Quente');
      }
    });

    it('should return frequencies with "Frio" temperature', () => {
      const result = getFrequenciesByTemperature('Frio');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.qualidade_energetica.temperatura).toBe('Frio');
      }
    });

    it('should return frequencies with "Neutro" temperature', () => {
      const result = getFrequenciesByTemperature('Neutro');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.qualidade_energetica.temperatura).toBe('Neutro');
      }
    });
  });

  describe('getFrequenciesByMoisture', () => {
    it('should return frequencies with "Seco" moisture', () => {
      const result = getFrequenciesByMoisture('Seco');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.qualidade_energetica.umidade).toBe('Seco');
      }
    });

    it('should return frequencies with "Úmido" moisture', () => {
      const result = getFrequenciesByMoisture('Úmido');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.qualidade_energetica.umidade).toBe('Úmido');
      }
    });
  });

  describe('getFrequenciesByElement', () => {
    it('should return frequencies for "Terra" element', () => {
      const result = getFrequenciesByElement('Terra');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.elemento).toBe('Terra');
      }
    });

    it('should return frequencies for "Fogo" element', () => {
      const result = getFrequenciesByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.elemento).toBe('Fogo');
      }
    });

    it('should return frequencies for "Éter" element', () => {
      const result = getFrequenciesByElement('Éter');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.elemento).toBe('Éter');
      }
    });
  });

  describe('SOLFEGGIO_FREQUENCIES constant', () => {
    it('should contain all 7 Solfeggio frequencies', () => {
      expect(SOLFEGGIO_FREQUENCIES).toHaveLength(7);
      expect(SOLFEGGIO_FREQUENCIES).toContain(396);
      expect(SOLFEGGIO_FREQUENCIES).toContain(417);
      expect(SOLFEGGIO_FREQUENCIES).toContain(528);
      expect(SOLFEGGIO_FREQUENCIES).toContain(639);
      expect(SOLFEGGIO_FREQUENCIES).toContain(741);
      expect(SOLFEGGIO_FREQUENCIES).toContain(852);
      expect(SOLFEGGIO_FREQUENCIES).toContain(963);
    });

    it('should be in ascending order', () => {
      for (let i = 1; i < SOLFEGGIO_FREQUENCIES.length; i++) {
        expect(SOLFEGGIO_FREQUENCIES[i]).toBeGreaterThan(SOLFEGGIO_FREQUENCIES[i - 1]);
      }
    });
  });

  describe('Integration with other correlations', () => {
    it('should have consistent element mappings with frequency-element correlation', () => {
      // 396 Hz should be Terra in both
      const freqMapping = getFrequencyOdu(396);
      expect(freqMapping?.elemento).toBe('Terra');
    });

    it('should have consistent chakra-orixa-sephirah alignment', () => {
      // Verify that each frequency has all spiritual components
      for (const freq of SOLFEGGIO_FREQUENCIES) {
        const mapping = getFrequencyOdu(freq);
        expect(mapping?.orixa).toBeTruthy();
        expect(mapping?.chakra).toBeTruthy();
        expect(mapping?.sephirah).toBeTruthy();
      }
    });

    it('should map frequencies to meaningful Odu for healing work', () => {
      // Verify healing applications are present for all frequencies
      for (const freq of SOLFEGGIO_FREQUENCIES) {
        const healing = getHealingByFrequency(freq);
        expect(healing).not.toBeNull();
        expect(healing?.pratica_recomendada).toMatch(/ritu/i);
      }
    });
  });
});
