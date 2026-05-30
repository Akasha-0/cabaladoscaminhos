import { describe, it, expect } from 'vitest';
import {
  getFrequencySephirot,
  getSephirotByFrequency,
  getSephirotFrequency,
  getFrequenciesBySephirah,
  getPathByFrequency,
  getElementByFrequency,
  getSpiritualApplicationByFrequency,
  getSephirotCharacteristicsByFrequency,
  getChakraByFrequency,
  getOrixaByFrequency,
  getAllSephiroth,
  getAllFrequencySephiroth,
  getFrequenciesByElement,
  getFrequenciesByPath,
  FREQUENCY_SEPHIROT_MAP,
  SOLFEGGIO_SEPHIROT_FREQUENCIES,
  type FrequencySephirotMapping,
  type Sephirah,
} from '@/lib/correlation/frequency-sephirot';

describe('FrequencySephirot Correlation', () => {
  describe('getFrequencySephirot', () => {
    it('should return mapping for 396 Hz (Malchut)', () => {
      const result = getFrequencySephirot(396);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(396);
      expect(result?.sephirah).toBe('Malchut');
      expect(result?.caminho).toBe(32);
      expect(result?.elemento).toBe('Terra');
    });

    it('should return mapping for 417 Hz (Yesod)', () => {
      const result = getFrequencySephirot(417);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(417);
      expect(result?.sephirah).toBe('Yesod');
      expect(result?.caminho).toBe(31);
    });

    it('should return mapping for 528 Hz (Tiferet)', () => {
      const result = getFrequencySephirot(528);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(528);
      expect(result?.sephirah).toBe('Tiferet');
      expect(result?.elemento).toBe('Fogo');
    });

    it('should return mapping for 639 Hz (Netzach)', () => {
      const result = getFrequencySephirot(639);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(639);
      expect(result?.sephirah).toBe('Netzach');
      expect(result?.caminho).toBe(28);
    });

    it('should return mapping for 741 Hz (Hod)', () => {
      const result = getFrequencySephirot(741);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(741);
      expect(result?.sephirah).toBe('Hod');
      expect(result?.caminho).toBe(29);
    });

    it('should return mapping for 852 Hz (Chokmah)', () => {
      const result = getFrequencySephirot(852);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(852);
      expect(result?.sephirah).toBe('Chokmah');
      expect(result?.caminho).toBe(13);
      expect(result?.elemento).toBe('Éter');
    });

    it('should return mapping for 963 Hz (Kether)', () => {
      const result = getFrequencySephirot(963);
      expect(result).not.toBeNull();
      expect(result?.frequencia).toBe(963);
      expect(result?.sephirah).toBe('Kether');
      expect(result?.caminho).toBe(1);
    });

    it('should return null for non-Solfeggio frequencies', () => {
      expect(getFrequencySephirot(100)).toBeNull();
      expect(getFrequencySephirot(256)).toBeNull();
      expect(getFrequencySephirot(432)).toBeNull();
      expect(getFrequencySephirot(500)).toBeNull();
      expect(getFrequencySephirot(1000)).toBeNull();
    });
  });

  describe('getSephirotByFrequency', () => {
    it('should return "Malchut" for 396 Hz', () => {
      expect(getSephirotByFrequency(396)).toBe('Malchut');
    });

    it('should return "Yesod" for 417 Hz', () => {
      expect(getSephirotByFrequency(417)).toBe('Yesod');
    });

    it('should return "Tiferet" for 528 Hz', () => {
      expect(getSephirotByFrequency(528)).toBe('Tiferet');
    });

    it('should return "Netzach" for 639 Hz', () => {
      expect(getSephirotByFrequency(639)).toBe('Netzach');
    });

    it('should return "Hod" for 741 Hz', () => {
      expect(getSephirotByFrequency(741)).toBe('Hod');
    });

    it('should return "Chokmah" for 852 Hz', () => {
      expect(getSephirotByFrequency(852)).toBe('Chokmah');
    });
  });
  describe('getSephirotFrequency', () => {
    it('should return 963 for Kether', () => {
      expect(getSephirotFrequency('Kether')).toBe(963);
    });
    it('should return 852 for Chokmah', () => {
      expect(getSephirotFrequency('Chokmah')).toBe(852);
    });
    it('should return 528 for Tiferet', () => {
      expect(getSephirotFrequency('Tiferet')).toBe(528);
    });
    it('should return 396 for Malchut', () => {
      expect(getSephirotFrequency('Malchut')).toBe(396);
    });
    it('should return null for invalid Sephirah', () => {
      expect(getSephirotFrequency('Invalid')).toBeNull();
    });
    it('should be case-insensitive', () => {
      expect(getSephirotFrequency('kether')).toBe(963);
      expect(getSephirotFrequency('KETHER')).toBe(963);
    });
  });
  describe('getFrequenciesBySephirah', () => {
    it('should return frequencies for Kether', () => {
      const results = getFrequenciesBySephirah('Kether');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].sephirah).toBe('Kether');
    });
    it('should return frequencies for Chokmah', () => {
      const results = getFrequenciesBySephirah('Chokmah');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].sephirah).toBe('Chokmah');
    });
    it('should return frequencies for Malchut', () => {
      const results = getFrequenciesBySephirah('Malchut');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].sephirah).toBe('Malchut');
    });
    it('should be case-insensitive', () => {
      const upper = getFrequenciesBySephirah('KETHER');
      const lower = getFrequenciesBySephirah('kether');
      expect(upper.length).toBe(lower.length);
    });
  });
  describe('getPathByFrequency', () => {
    it('should return 32 for 396 Hz (Malchut)', () => {
      expect(getPathByFrequency(396)).toBe(32);
    });
    it('should return 31 for 417 Hz (Yesod)', () => {
      expect(getPathByFrequency(417)).toBe(31);
    });
    it('should return 1 for 963 Hz (Kether)', () => {
      expect(getPathByFrequency(963)).toBe(1);
    });
    it('should return null for invalid frequencies', () => {
      expect(getPathByFrequency(999)).toBeNull();
    });
  });
  describe('FREQUENCY_SEPHIROT_MAP', () => {
  describe('FREQUENCY_SEPHIROT_MAP', () => {
    it('should contain all 7 Solfeggio frequencies', () => {
      const frequencies = Object.keys(FREQUENCY_SEPHIROT_MAP).map(Number);
      expect(frequencies).toHaveLength(7);
      expect(frequencies).toContain(396);
      expect(frequencies).toContain(417);
      expect(frequencies).toContain(528);
      expect(frequencies).toContain(639);
      expect(frequencies).toContain(741);
      expect(frequencies).toContain(852);
      expect(frequencies).toContain(963);
    });

    it('should have valid path numbers for each frequency', () => {
      for (const freq of SOLFEGGIO_SEPHIROT_FREQUENCIES) {
        const mapping = FREQUENCY_SEPHIROT_MAP[freq];
        expect(mapping.caminho).toBeGreaterThan(0);
        expect(mapping.caminho).toBeLessThanOrEqual(32);
      }
    });

    it('should have valid element for each frequency', () => {
      const validElements = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      for (const freq of SOLFEGGIO_SEPHIROT_FREQUENCIES) {
        const mapping = FREQUENCY_SEPHIROT_MAP[freq];
        expect(validElements).toContain(mapping.elemento);
      }
    });

    it('should have caracteristicas for each frequency', () => {
      for (const freq of SOLFEGGIO_SEPHIROT_FREQUENCIES) {
        const mapping = FREQUENCY_SEPHIROT_MAP[freq];
        expect(mapping.caracteristicas).toBeDefined();
        expect(mapping.caracteristicas.nome_divino).toBeDefined();
        expect(mapping.caracteristicas.arcanjo).toBeDefined();
      }
    });

    it('should have aplicacao_espiritual for each frequency', () => {
      for (const freq of SOLFEGGIO_SEPHIROT_FREQUENCIES) {
        const mapping = FREQUENCY_SEPHIROT_MAP[freq];
        expect(mapping.aplicacao_espiritual).toBeDefined();
        expect(mapping.aplicacao_espiritual.foco_primario).toBeDefined();
        expect(mapping.aplicacao_espiritual.meditacao).toBeDefined();
        expect(mapping.aplicacao_espiritual.afiliacao).toBeDefined();
      }
    });
  });
  });

  describe('getFrequenciesBySephirah', () => {
    it('should return frequencies for Kether', () => {
      const results = getFrequenciesBySephirah('Kether');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].sephirah).toBe('Kether');
    });

    it('should return frequencies for Chokmah', () => {
      const results = getFrequenciesBySephirah('Chokmah');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].sephirah).toBe('Chokmah');
    });

    it('should return frequencies for Malchut', () => {
      const results = getFrequenciesBySephirah('Malchut');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].sephirah).toBe('Malchut');
    });

    it('should be case-insensitive', () => {
      const upper = getFrequenciesBySephirah('KETHER');
      const lower = getFrequenciesBySephirah('kether');
      expect(upper.length).toBe(lower.length);
    });
  });

  describe('getPathByFrequency', () => {
    it('should return 32 for 396 Hz (Malchut)', () => {
      expect(getPathByFrequency(396)).toBe(32);
    });

    it('should return 31 for 417 Hz (Yesod)', () => {
      expect(getPathByFrequency(417)).toBe(31);
    });

    it('should return 1 for 963 Hz (Kether)', () => {
      expect(getPathByFrequency(963)).toBe(1);
    });

    it('should return null for invalid frequencies', () => {
      expect(getPathByFrequency(999)).toBeNull();
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

  describe('getSpiritualApplicationByFrequency', () => {
    it('should return spiritual application for 963 Hz', () => {
      const result = getSpiritualApplicationByFrequency(963);
      expect(result).not.toBeNull();
      expect(result?.foco_primario).toContain('Conexão direta');
      expect(result?.meditacao).toBeDefined();
      expect(result?.afiliacao).toBeDefined();
    });

    it('should return null for invalid frequencies', () => {
      expect(getSpiritualApplicationByFrequency(999)).toBeNull();
    });
  });

  describe('getSephirotCharacteristicsByFrequency', () => {
    it('should return characteristics for 528 Hz', () => {
      const result = getSephirotCharacteristicsByFrequency(528);
      expect(result).not.toBeNull();
      expect(result?.nome_divino).toBe('Elohim');
      expect(result?.arcanjo).toBe('Michael');
    });

    it('should return null for invalid frequencies', () => {
      expect(getSephirotCharacteristicsByFrequency(999)).toBeNull();
    });
  });

  describe('getChakraByFrequency', () => {
    it('should return "1º Básico (Muladhara)" for 396 Hz', () => {
      expect(getChakraByFrequency(396)).toBe('1º Básico (Muladhara)');
    });

    it('should return "7º Coronário (Sahasrara)" for 963 Hz', () => {
      expect(getChakraByFrequency(963)).toBe('7º Coronário (Sahasrara)');
    });
  });

  describe('getOrixaByFrequency', () => {
    it('should return "Oxalufã" for 396 Hz', () => {
      expect(getOrixaByFrequency(396)).toBe('Oxalufã');
    });

    it('should return "Olokun" for 963 Hz', () => {
      expect(getOrixaByFrequency(963)).toBe('Olokun');
    });
  });

  describe('getAllSephiroth', () => {
    it('should return unique Sephirot names', () => {
      const sephiroth = getAllSephiroth();
      expect(sephiroth.length).toBeGreaterThan(0);
      expect(sephiroth).toContain('Kether');
      expect(sephiroth).toContain('Malchut');
    });
  });

  describe('getAllFrequencySephiroth', () => {
    it('should return all frequency mappings', () => {
      const all = getAllFrequencySephiroth();
      expect(all).toHaveLength(7);
    });

    it('should include all required properties', () => {
      const all = getAllFrequencySephiroth();
      for (const mapping of all) {
        expect(mapping.frequencia).toBeDefined();
        expect(mapping.sephirah).toBeDefined();
        expect(mapping.caminho).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.caracteristicas).toBeDefined();
        expect(mapping.aplicacao_espiritual).toBeDefined();
      }
    });
  });

  describe('getFrequenciesByElement', () => {
    it('should return frequencies for Terra', () => {
      const results = getFrequenciesByElement('Terra');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].elemento).toBe('Terra');
    });

    it('should return frequencies for Éter', () => {
      const results = getFrequenciesByElement('Éter');
      expect(results.length).toBe(2);
      results.forEach((r) => expect(r.elemento).toBe('Éter'));
    });

    it('should be case-insensitive', () => {
      const upper = getFrequenciesByElement('TERRA');
      const lower = getFrequenciesByElement('terra');
      expect(upper.length).toBe(lower.length);
    });
  });

  describe('getFrequenciesByPath', () => {
    it('should return frequencies for path 1', () => {
      const results = getFrequenciesByPath(1);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].caminho).toBe(1);
    });

    it('should return frequencies for path 32', () => {
      const results = getFrequenciesByPath(32);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].caminho).toBe(32);
    });
  });

  describe('SOLFEGGIO_SEPHIROT_FREQUENCIES constant', () => {
    it('should have all 7 frequencies', () => {
      expect(SOLFEGGIO_SEPHIROT_FREQUENCIES).toHaveLength(7);
    });

    it('should be in ascending order', () => {
      for (let i = 1; i < SOLFEGGIO_SEPHIROT_FREQUENCIES.length; i++) {
        expect(SOLFEGGIO_SEPHIROT_FREQUENCIES[i]).toBeGreaterThan(
          SOLFEGGIO_SEPHIROT_FREQUENCIES[i - 1]
        );
      }
    });
  });
});