import { describe, it, expect } from 'vitest';
import {
  getFrequencyPlanet,
  getPlanetByFrequency,
  getFrequenciesByPlanet,
  getHealingByFrequency,
  getAstrologicalQualityByFrequency,
  getElementByFrequency,
  getChakraByFrequency,
  getOrixaByFrequency,
  getSephirahByFrequency,
  getAllPlanets,
  getAllFrequencyPlanets,
  getFrequenciesByElement,
  getPlanetFrequency,
  FREQUENCY_PLANET_MAP,
  SOLFEGGIO_FREQUENCIES,
  type FrequencyPlanetMapping,
  type Planeta,
} from '@/lib/correlation/frequency-planet';

describe('FrequencyPlanet Correlation', () => {
  describe('getFrequencyPlanet', () => {
    it('should return mapping for frequency 396', () => {
      const mapping = getFrequencyPlanet(396);
      expect(mapping).not.toBeNull();
      expect(mapping?.planeta).toBe('Saturno');
      expect(mapping?.elemento).toBe('Terra');
    });

    it('should return mapping for frequency 528', () => {
      const mapping = getFrequencyPlanet(528);
      expect(mapping).not.toBeNull();
      expect(mapping?.planeta).toBe('Sol');
      expect(mapping?.elemento).toBe('Fogo');
    });

    it('should return mapping for frequency 963', () => {
      const mapping = getFrequencyPlanet(963);
      expect(mapping).not.toBeNull();
      expect(mapping?.planeta).toBe('Urano');
      expect(mapping?.elemento).toBe('Éter');
    });

    it('should return null for invalid frequency', () => {
      expect(getFrequencyPlanet(100)).toBeNull();
      expect(getFrequencyPlanet(0)).toBeNull();
      expect(getFrequencyPlanet(-100)).toBeNull();
    });
  });

  describe('getPlanetByFrequency', () => {
    it('should return planet name for valid frequency', () => {
      expect(getPlanetByFrequency(396)).toBe('Saturno');
      expect(getPlanetByFrequency(528)).toBe('Sol');
      expect(getPlanetByFrequency(741)).toBe('Mercúrio');
      expect(getPlanetByFrequency(852)).toBe('Júpiter');
      expect(getPlanetByFrequency(963)).toBe('Urano');
    });

    it('should return null for invalid frequency', () => {
      expect(getPlanetByFrequency(999)).toBeNull();
      expect(getPlanetByFrequency(1000)).toBeNull();
    });
  });

  describe('FREQUENCY_PLANET_MAP', () => {
    it('should contain all 7 Solfeggio frequencies', () => {
      const frequencies = Object.keys(FREQUENCY_PLANET_MAP).map(Number);
      expect(frequencies).toHaveLength(7);
      expect(frequencies).toContain(396);
      expect(frequencies).toContain(417);
      expect(frequencies).toContain(528);
      expect(frequencies).toContain(639);
      expect(frequencies).toContain(741);
      expect(frequencies).toContain(852);
      expect(frequencies).toContain(963);
    });

    it('should have correct planet mappings', () => {
      expect(FREQUENCY_PLANET_MAP[396]?.planeta).toBe('Saturno');
      expect(FREQUENCY_PLANET_MAP[417]?.planeta).toBe('Netuno');
      expect(FREQUENCY_PLANET_MAP[528]?.planeta).toBe('Sol');
      expect(FREQUENCY_PLANET_MAP[639]?.planeta).toBe('Vênus');
      expect(FREQUENCY_PLANET_MAP[741]?.planeta).toBe('Mercúrio');
      expect(FREQUENCY_PLANET_MAP[852]?.planeta).toBe('Júpiter');
      expect(FREQUENCY_PLANET_MAP[963]?.planeta).toBe('Urano');
    });

    it('should have valid healing properties', () => {
      Object.values(FREQUENCY_PLANET_MAP).forEach((mapping) => {
        expect(mapping.propriedades_healing).toBeDefined();
        expect(mapping.propriedades_healing.fisico).toBeDefined();
        expect(mapping.propriedades_healing.emocional).toBeDefined();
        expect(mapping.propriedades_healing.mental_espiritual).toBeDefined();
        expect(mapping.propriedades_healing.pratica_recomendada).toBeDefined();
      });
    });

    it('should have valid astrological qualities', () => {
      Object.values(FREQUENCY_PLANET_MAP).forEach((mapping) => {
        expect(mapping.qualidade_astrologica).toBeDefined();
        expect(mapping.qualidade_astrologica.natureza).toBeDefined();
        expect(mapping.qualidade_astrologica.assinatura_energetica).toBeDefined();
        expect(mapping.qualidade_astrologica.dominio).toBeDefined();
      });
    });

    it('should have valid element associations', () => {
      const validElements = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      Object.values(FREQUENCY_PLANET_MAP).forEach((mapping) => {
        expect(validElements).toContain(mapping.elemento);
      });
    });
  });

  describe('getFrequenciesByPlanet', () => {
    it('should return frequencies for existing planet', () => {
      const saturnMappings = getFrequenciesByPlanet('Saturno');
      expect(saturnMappings).toHaveLength(1);
      expect(saturnMappings[0]?.frequencia).toBe(396);

      const sunMappings = getFrequenciesByPlanet('Sol');
      expect(sunMappings).toHaveLength(1);
      expect(sunMappings[0]?.frequencia).toBe(528);
    });

    it('should be case-insensitive', () => {
      const mappings1 = getFrequenciesByPlanet('saturno');
      const mappings2 = getFrequenciesByPlanet('SATURNO');
      expect(mappings1).toHaveLength(1);
      expect(mappings2).toHaveLength(1);
      expect(mappings1[0]?.frequencia).toBe(mappings2[0]?.frequencia);
    });

    it('should return empty array for non-existing planet', () => {
      expect(getFrequenciesByPlanet('Plutão')).toHaveLength(0);
      expect(getFrequenciesByPlanet('Marte')).toHaveLength(0);
    });
  });

  describe('getHealingByFrequency', () => {
    it('should return healing properties for valid frequency', () => {
      const healing = getHealingByFrequency(528);
      expect(healing).not.toBeNull();
      expect(healing?.fisico).toContain('regeneração');
      expect(healing?.emocional).toContain('amor');
      expect(healing?.mental_espiritual).toContain('criatividade');
    });

    it('should return null for invalid frequency', () => {
      expect(getHealingByFrequency(999)).toBeNull();
    });
  });

  describe('getAstrologicalQualityByFrequency', () => {
    it('should return astrological quality for valid frequency', () => {
      const quality = getAstrologicalQualityByFrequency(639);
      expect(quality).not.toBeNull();
      expect(quality?.natureza).toBeDefined();
      expect(quality?.assinatura_energetica).toBeDefined();
      expect(quality?.dominio).toBeDefined();
    });

    it('should return null for invalid frequency', () => {
      expect(getAstrologicalQualityByFrequency(0)).toBeNull();
    });
  });

  describe('getElementByFrequency', () => {
    it('should return element for valid frequency', () => {
      expect(getElementByFrequency(396)).toBe('Terra');
      expect(getElementByFrequency(528)).toBe('Fogo');
      expect(getElementByFrequency(963)).toBe('Éter');
    });

    it('should return null for invalid frequency', () => {
      expect(getElementByFrequency(1000)).toBeNull();
    });
  });

  describe('getChakraByFrequency', () => {
    it('should return chakra for valid frequency', () => {
      expect(getChakraByFrequency(396)).toBe('1º Básico (Muladhara)');
      expect(getChakraByFrequency(528)).toBe('3º Plexo Solar (Manipura)');
      expect(getChakraByFrequency(963)).toBe('7º Coronário (Sahasrara)');
    });

    it('should return null for invalid frequency', () => {
      expect(getChakraByFrequency(0)).toBeNull();
    });
  });

  describe('getOrixaByFrequency', () => {
    it('should return orixá for valid frequency', () => {
      expect(getOrixaByFrequency(396)).toBe('Oxalufã / Obaluayê');
      expect(getOrixaByFrequency(528)).toBe('Xangô / Logun Ede');
    });

    it('should return null for invalid frequency', () => {
      expect(getOrixaByFrequency(999)).toBeNull();
    });
  });

  describe('getSephirahByFrequency', () => {
    it('should return sephirah for valid frequency', () => {
      expect(getSephirahByFrequency(396)).toBe('Malchut (Reino)');
      expect(getSephirahByFrequency(963)).toBe('Kether (Coroa)');
    });

    it('should return null for invalid frequency', () => {
      expect(getSephirahByFrequency(0)).toBeNull();
    });
  });

  describe('getAllPlanets', () => {
    it('should return all unique planets', () => {
      const planets = getAllPlanets();
      expect(planets).toContain('Saturno');
      expect(planets).toContain('Netuno');
      expect(planets).toContain('Sol');
      expect(planets).toContain('Vênus');
      expect(planets).toContain('Mercúrio');
      expect(planets).toContain('Júpiter');
      expect(planets).toContain('Urano');
      expect(planets).toHaveLength(7);
    });
  });

  describe('getAllFrequencyPlanets', () => {
    it('should return all mappings', () => {
      const allMappings = getAllFrequencyPlanets();
      expect(allMappings).toHaveLength(7);
    });

    it('should contain all expected properties', () => {
      const allMappings = getAllFrequencyPlanets();
      allMappings.forEach((mapping) => {
        expect(mapping.frequencia).toBeDefined();
        expect(mapping.planeta).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.propriedades_healing).toBeDefined();
        expect(mapping.qualidade_astrologica).toBeDefined();
        expect(mapping.chakra).toBeDefined();
        expect(mapping.orixa).toBeDefined();
        expect(mapping.sephirah).toBeDefined();
      });
    });
  });

  describe('getFrequenciesByElement', () => {
    it('should return frequencies for Éter element', () => {
      const etherMappings = getFrequenciesByElement('Éter');
      expect(etherMappings).toHaveLength(2);
      expect(etherMappings.map((m) => m.frequencia)).toContain(852);
      expect(etherMappings.map((m) => m.frequencia)).toContain(963);
    });

    it('should be case-insensitive', () => {
      const mappings1 = getFrequenciesByElement('fogo');
      const mappings2 = getFrequenciesByElement('FOGO');
      expect(mappings1).toHaveLength(mappings2.length);
    });

    it('should return empty array for non-existing element', () => {
      expect(getFrequenciesByElement('Plasma')).toHaveLength(0);
    });
  });

  describe('getPlanetFrequency', () => {
    it('should return frequency for existing planet', () => {
      expect(getPlanetFrequency('Sol')).toBe(528);
      expect(getPlanetFrequency('Saturno')).toBe(396);
      expect(getPlanetFrequency('Júpiter')).toBe(852);
      expect(getPlanetFrequency('Urano')).toBe(963);
    });

    it('should be case-insensitive', () => {
      expect(getPlanetFrequency('sol')).toBe(528);
      expect(getPlanetFrequency('SOL')).toBe(528);
    });

    it('should return null for non-existing planet', () => {
      expect(getPlanetFrequency('Marte')).toBeNull();
      expect(getPlanetFrequency('Plutão')).toBeNull();
    });
  });

  describe('SOLFEGGIO_FREQUENCIES constant', () => {
    it('should contain all 7 frequencies in ascending order', () => {
      expect(SOLFEGGIO_FREQUENCIES).toEqual([396, 417, 528, 639, 741, 852, 963]);
    });
  });

  describe('Integration with other correlations', () => {
    it('should be consistent with frequency-element correlations', () => {
      // Frequency 528 should map to Fogo in both correlations
      const frequencyPlanet = getFrequencyPlanet(528);
      expect(frequencyPlanet?.elemento).toBe('Fogo');
    });

    it('should have consistent chakra mapping with frequency-chakra system', () => {
      // Frequency 963 should map to 7º Coronário (Sahasrara)
      const mapping = getFrequencyPlanet(963);
      expect(mapping?.chakra).toBe('7º Coronário (Sahasrara)');
    });

    it('should have consistent orixá mapping with frequency-orixa system', () => {
      // Frequency 528 should map to Xangô
      const mapping = getFrequencyPlanet(528);
      expect(mapping?.orixa).toBe('Xangô / Logun Ede');
    });
  });
});