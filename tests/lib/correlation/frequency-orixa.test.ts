import { describe, it, expect } from 'vitest';
import {
  getFrequencyOrixa,
  getOrixaFrequency,
  getFrequenciesByOrixa,
  getFrequenciesByElement,
  getFrequenciesByDay,
  getHealingByFrequency,
  getElementByFrequency,
  getColorByFrequency,
  getChakraByFrequency,
  getSephirahByFrequency,
  getOrayoByFrequency,
  getAllOrixas,
  getAllFrequencyOrixas,
  getAllElements,
  getAllDays,
  FREQUENCY_ORIXA_MAP,
  SOLFEGGIO_FREQUENCIES,
} from '@/lib/correlation/frequency-orixa';

describe('FrequencyOrixa Correlation', () => {
  describe('getFrequencyOrixa', () => {
    it('should return mapping for 396 Hz (Oxalufã)', () => {
      const result = getFrequencyOrixa(396);
      expect(result).not.toBeNull();
      expect(result?.orixa).toBe('Oxalufã');
      expect(result?.orixa_secundario).toBe('Omulu');
      expect(result?.elemento).toBe('Terra');
      expect(result?.cor).toBe('Branco');
      expect(result?.chakra).toBe('1º Básico (Muladhara)');
      expect(result?.sephirah).toBe('Malchut (Reino)');
    });

    it('should return mapping for 417 Hz (Oxum)', () => {
      const result = getFrequencyOrixa(417);
      expect(result).not.toBeNull();
      expect(result?.orixa).toBe('Oxum');
      expect(result?.orixa_secundario).toBe('Iemanjá');
      expect(result?.elemento).toBe('Água');
      expect(result?.cor).toBe('Amarelo-dourado');
      expect(result?.chakra).toBe('2º Sacro (Svadhisthana)');
      expect(result?.sephirah).toBe('Yesod (Fundação)');
    });

    it('should return mapping for 528 Hz (Xangô)', () => {
      const result = getFrequencyOrixa(528);
      expect(result).not.toBeNull();
      expect(result?.orixa).toBe('Xangô');
      expect(result?.orixa_secundario).toBe('Logun Ede');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.cor).toBe('Vermelho');
      expect(result?.chakra).toBe('3º Plexo Solar (Manipura)');
      expect(result?.sephirah).toBe('Netzach (Vitória)');
    });

    it('should return mapping for 639 Hz (Oxóssi)', () => {
      const result = getFrequencyOrixa(639);
      expect(result).not.toBeNull();
      expect(result?.orixa).toBe('Oxóssi');
      expect(result?.orixa_secundario).toBe('Nanã Buruquá');
      expect(result?.elemento).toBe('Ar');
      expect(result?.cor).toBe('Verde');
      expect(result?.chakra).toBe('4º Cardíaco (Anahata)');
      expect(result?.sephirah).toBe('Tiferet (Beleza/Harmonia)');
    });

    it('should return mapping for 741 Hz (Iansã)', () => {
      const result = getFrequencyOrixa(741);
      expect(result).not.toBeNull();
      expect(result?.orixa).toBe('Iansã');
      expect(result?.orixa_secundario).toBe('Obá');
      expect(result?.elemento).toBe('Ar');
      expect(result?.cor).toBe('Laranja');
      expect(result?.chakra).toBe('5º Laríngeo (Vishuddha)');
      expect(result?.sephirah).toBe('Gevurah (Julgamento/Fortaleza)');
    });

    it('should return mapping for 852 Hz (Oxumaré)', () => {
      const result = getFrequencyOrixa(852);
      expect(result).not.toBeNull();
      expect(result?.orixa).toBe('Oxumaré');
      expect(result?.orixa_secundario).toBe('Ossaim');
      expect(result?.elemento).toBe('Éter');
      expect(result?.cor).toBe('Arco-íris');
      expect(result?.chakra).toBe('6º Frontal (Ajna)');
      expect(result?.sephirah).toBe('Chokmah (Sabedoria)');
    });

    it('should return mapping for 963 Hz (Ori)', () => {
      const result = getFrequencyOrixa(963);
      expect(result).not.toBeNull();
      expect(result?.orixa).toBe('Ori');
      expect(result?.orixa_secundario).toBe('Olokun');
      expect(result?.elemento).toBe('Éter');
      expect(result?.cor).toBe('Branco-dourado');
      expect(result?.chakra).toBe('7º Coronário (Sahasrara)');
      expect(result?.sephirah).toBe('Kether (Coroa)');
    });

    it('should return null for non-Solfeggio frequencies', () => {
      expect(getFrequencyOrixa(440)).toBeNull();
      expect(getFrequencyOrixa(100)).toBeNull();
      expect(getFrequencyOrixa(1000)).toBeNull();
    });

    it('should have aplicacao_healing field for each frequency', () => {
      SOLFEGGIO_FREQUENCIES.forEach((freq) => {
        const result = getFrequencyOrixa(freq);
        expect(result?.aplicacao_healing).toBeDefined();
        expect(result?.aplicacao_healing.fisico.length).toBeGreaterThan(0);
        expect(result?.aplicacao_healing.emocional.length).toBeGreaterThan(0);
        expect(result?.aplicacao_healing.mental_espiritual.length).toBeGreaterThan(0);
        expect(result?.aplicacao_healing.pratica_recomendada.length).toBeGreaterThan(0);
      });
    });

    it('should have ferramenta_ritual for each frequency', () => {
      SOLFEGGIO_FREQUENCIES.forEach((freq) => {
        const result = getFrequencyOrixa(freq);
        expect(result?.ferramenta_ritual).toBeDefined();
        expect(result?.ferramenta_ritual.length).toBeGreaterThan(0);
      });
    });

    it('should have oracao_yoruba for each frequency', () => {
      SOLFEGGIO_FREQUENCIES.forEach((freq) => {
        const result = getFrequencyOrixa(freq);
        expect(result?.oracao_yoruba).toBeDefined();
        expect(result?.oracao_yoruba.length).toBeGreaterThan(0);
      });
    });
  });

  describe('FREQUENCY_ORIXA_MAP', () => {
    it('should have exactly 7 entries', () => {
      expect(Object.keys(FREQUENCY_ORIXA_MAP).length).toBe(7);
    });

    it('should contain all Solfeggio frequencies', () => {
      SOLFEGGIO_FREQUENCIES.forEach((freq) => {
        expect(FREQUENCY_ORIXA_MAP[freq]).toBeDefined();
      });
    });

    it('should have frequencies in ascending order', () => {
      const frequencies = Object.keys(FREQUENCY_ORIXA_MAP).map(Number).sort((a, b) => a - b);
      expect(frequencies).toEqual([396, 417, 528, 639, 741, 852, 963]);
    });

    it('should have unique Orixás for each frequency', () => {
      const orixas = Object.values(FREQUENCY_ORIXA_MAP).map((m) => m.orixa);
      const uniqueOrixas = [...new Set(orixas)];
      expect(uniqueOrixas.length).toBe(7);
    });
  });

  describe('getOrixaFrequency', () => {
    it('should return correct Orixá names for all frequencies', () => {
      expect(getOrixaFrequency(396)).toBe('Oxalufã');
      expect(getOrixaFrequency(417)).toBe('Oxum');
      expect(getOrixaFrequency(528)).toBe('Xangô');
      expect(getOrixaFrequency(639)).toBe('Oxóssi');
      expect(getOrixaFrequency(741)).toBe('Iansã');
      expect(getOrixaFrequency(852)).toBe('Oxumaré');
      expect(getOrixaFrequency(963)).toBe('Ori');
    });

    it('should return null for invalid frequencies', () => {
      expect(getOrixaFrequency(500)).toBeNull();
      expect(getOrixaFrequency(0)).toBeNull();
    });
  });

  describe('getFrequenciesByOrixa', () => {
    it('should return frequencies for Oxalufã', () => {
      const result = getFrequenciesByOrixa('Oxalufã');
      expect(result).toHaveLength(1);
      expect(result[0].frequencia).toBe(396);
    });

    it('should return frequencies for Oxum', () => {
      const result = getFrequenciesByOrixa('Oxum');
      expect(result).toHaveLength(1);
      expect(result[0].frequencia).toBe(417);
    });

    it('should return frequencies for Xangô', () => {
      const result = getFrequenciesByOrixa('Xangô');
      expect(result).toHaveLength(1);
      expect(result[0].frequencia).toBe(528);
    });

    it('should be case-insensitive', () => {
      const result1 = getFrequenciesByOrixa('OXUM');
      const result2 = getFrequenciesByOrixa('oxum');
      expect(result1).toHaveLength(1);
      expect(result2).toHaveLength(1);
      expect(result1[0].frequencia).toBe(result2[0].frequencia);
    });

    it('should return frequencies for secondary Orixá', () => {
      const result = getFrequenciesByOrixa('Iemanjá');
      expect(result).toHaveLength(1);
      expect(result[0].frequencia).toBe(417);
    });

    it('should return empty array for unknown Orixá', () => {
      expect(getFrequenciesByOrixa('UnknownOrixa')).toHaveLength(0);
    });
  });

  describe('getFrequenciesByElement', () => {
    it('should return frequencies for Terra', () => {
      const result = getFrequenciesByElement('Terra');
      expect(result).toHaveLength(1);
      expect(result[0].frequencia).toBe(396);
    });

    it('should return frequencies for Água', () => {
      const result = getFrequenciesByElement('Água');
      expect(result).toHaveLength(1);
      expect(result[0].frequencia).toBe(417);
    });

    it('should return frequencies for Fogo', () => {
      const result = getFrequenciesByElement('Fogo');
      expect(result).toHaveLength(1);
      expect(result[0].frequencia).toBe(528);
    });

    it('should return frequencies for Ar (should include 639 and 741)', () => {
      const result = getFrequenciesByElement('Ar');
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.some((r) => r.frequencia === 639)).toBe(true);
      expect(result.some((r) => r.frequencia === 741)).toBe(true);
    });

    it('should return frequencies for Éter', () => {
      const result = getFrequenciesByElement('Éter');
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.some((r) => r.frequencia === 852)).toBe(true);
      expect(result.some((r) => r.frequencia === 963)).toBe(true);
    });

    it('should be case-insensitive', () => {
      const result1 = getFrequenciesByElement('FOGO');
      const result2 = getFrequenciesByElement('fogo');
      expect(result1.length).toBe(result2.length);
    });

    it('should return empty array for unknown element', () => {
      expect(getFrequenciesByElement('UnknownElement')).toHaveLength(0);
    });
  });

  describe('getFrequenciesByDay', () => {
    it('should return frequencies for Segunda-feira', () => {
      const result = getFrequenciesByDay('Segunda-feira');
      expect(result).toHaveLength(1);
      expect(result[0].frequencia).toBe(396);
    });

    it('should be case-insensitive', () => {
      const result = getFrequenciesByDay('SEGUNDA-FEIRA');
      expect(result).toHaveLength(1);
    });

    it('should return empty array for invalid day', () => {
      expect(getFrequenciesByDay('Friday')).toHaveLength(0);
    });
  });

  describe('getElementByFrequency', () => {
    it('should return correct elements for all frequencies', () => {
      expect(getElementByFrequency(396)).toBe('Terra');
      expect(getElementByFrequency(417)).toBe('Água');
      expect(getElementByFrequency(528)).toBe('Fogo');
      expect(getElementByFrequency(639)).toBe('Ar');
      expect(getElementByFrequency(741)).toBe('Ar');
      expect(getElementByFrequency(852)).toBe('Éter');
      expect(getElementByFrequency(963)).toBe('Éter');
    });

    it('should return null for invalid frequencies', () => {
      expect(getElementByFrequency(500)).toBeNull();
    });
  });

  describe('getHealingByFrequency', () => {
    it('should return healing application for 396 Hz', () => {
      const result = getHealingByFrequency(396);
      expect(result).not.toBeNull();
      expect(result?.fisico).toContain('sistema imunológico');
      expect(result?.emocional).toContain('medos');
    });

    it('should return healing application for 528 Hz', () => {
      const result = getHealingByFrequency(528);
      expect(result).not.toBeNull();
      expect(result?.fisico).toContain('metabolismo');
      expect(result?.emocional.toLowerCase()).toContain('transforma');
    });

    it('should return null for invalid frequencies', () => {
      expect(getHealingByFrequency(0)).toBeNull();
    });
  });

  describe('getColorByFrequency', () => {
    it('should return correct colors for all frequencies', () => {
      expect(getColorByFrequency(396)).toBe('Branco');
      expect(getColorByFrequency(417)).toBe('Amarelo-dourado');
      expect(getColorByFrequency(528)).toBe('Vermelho');
      expect(getColorByFrequency(639)).toBe('Verde');
      expect(getColorByFrequency(741)).toBe('Laranja');
      expect(getColorByFrequency(852)).toBe('Arco-íris');
      expect(getColorByFrequency(963)).toBe('Branco-dourado');
    });

    it('should return null for invalid frequencies', () => {
      expect(getColorByFrequency(100)).toBeNull();
    });
  });

  describe('getChakraByFrequency', () => {
    it('should return correct chakras for all frequencies', () => {
      expect(getChakraByFrequency(396)).toBe('1º Básico (Muladhara)');
      expect(getChakraByFrequency(417)).toBe('2º Sacro (Svadhisthana)');
      expect(getChakraByFrequency(528)).toBe('3º Plexo Solar (Manipura)');
      expect(getChakraByFrequency(639)).toBe('4º Cardíaco (Anahata)');
      expect(getChakraByFrequency(741)).toBe('5º Laríngeo (Vishuddha)');
      expect(getChakraByFrequency(852)).toBe('6º Frontal (Ajna)');
      expect(getChakraByFrequency(963)).toBe('7º Coronário (Sahasrara)');
    });

    it('should return null for invalid frequencies', () => {
      expect(getChakraByFrequency(999)).toBeNull();
    });
  });

  describe('getSephirahByFrequency', () => {
    it('should return correct sephirot for all frequencies', () => {
      expect(getSephirahByFrequency(396)).toBe('Malchut (Reino)');
      expect(getSephirahByFrequency(417)).toBe('Yesod (Fundação)');
      expect(getSephirahByFrequency(528)).toBe('Netzach (Vitória)');
      expect(getSephirahByFrequency(639)).toBe('Tiferet (Beleza/Harmonia)');
      expect(getSephirahByFrequency(741)).toBe('Gevurah (Julgamento/Fortaleza)');
      expect(getSephirahByFrequency(852)).toBe('Chokmah (Sabedoria)');
      expect(getSephirahByFrequency(963)).toBe('Kether (Coroa)');
    });

    it('should return null for invalid frequencies', () => {
      expect(getSephirahByFrequency(1)).toBeNull();
    });
  });

  describe('getOrayoByFrequency', () => {
    it('should return Yoruba prayer for all frequencies', () => {
      SOLFEGGIO_FREQUENCIES.forEach((freq) => {
        const result = getOrayoByFrequency(freq);
        expect(result).not.toBeNull();
        expect(result?.length).toBeGreaterThan(0);
      });
    });

    it('should return null for invalid frequencies', () => {
      expect(getOrayoByFrequency(0)).toBeNull();
    });
  });

  describe('getAllOrixas', () => {
    it('should return array of Orixá names', () => {
      const result = getAllOrixas();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include primary and secondary Orixás', () => {
      const result = getAllOrixas();
      expect(result).toContain('Oxalufã');
      expect(result).toContain('Omulu');
      expect(result).toContain('Oxum');
      expect(result).toContain('Iemanjá');
    });

    it('should return sorted array', () => {
      const result = getAllOrixas();
      const sorted = [...result].sort();
      expect(result).toEqual(sorted);
    });
  });

  describe('getAllFrequencyOrixas', () => {
    it('should return all frequency-Orixá mappings', () => {
      const result = getAllFrequencyOrixas();
      expect(result).toHaveLength(7);
    });

    it('should return array with all required fields', () => {
      const result = getAllFrequencyOrixas();
      result.forEach((mapping) => {
        expect(mapping.frequencia).toBeDefined();
        expect(mapping.orixa).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.aplicacao_healing).toBeDefined();
      });
    });
  });

  describe('getAllElements', () => {
    it('should return array of unique elements', () => {
      const result = getAllElements();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('Terra');
      expect(result).toContain('Água');
      expect(result).toContain('Fogo');
      expect(result).toContain('Ar');
      expect(result).toContain('Éter');
    });

    it('should return sorted array', () => {
      const result = getAllElements();
      const sorted = [...result].sort();
      expect(result).toEqual(sorted);
    });
  });

  describe('getAllDays', () => {
    it('should return array of days', () => {
      const result = getAllDays();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should contain valid day names', () => {
      const result = getAllDays();
      expect(result.some((d) => d.includes('Segunda'))).toBe(true);
      expect(result.some((d) => d.includes('Terça'))).toBe(true);
      expect(result.some((d) => d.includes('Quarta'))).toBe(true);
    });
  });
});
