import { describe, it, expect } from 'vitest';
import {
  getMoonFrequency,
  getFrequencyMoon,
  getAllMoonFrequencies,
  getElementByMoon,
  getHealingByMoon,
  getOrixaByMoon,
  getChakraByMoon,
  getPolarityByMoon,
  getVibrationByMoon,
  getAvailableFrequencies,
  getAvailablePhases,
  getMoonsByFrequency,
  getMoonsByElement,
  getMoonsByOrixa,
  MOON_FREQUENCY_MAP,
  type MoonFrequencyMapping,
  type FaseLua,
  type Elemento,
} from '@/lib/correlation/moon-frequency';

describe('Moon-Frequency Correlation', () => {
  describe('getMoonFrequency', () => {
    it('should return mapping for lua-nova', () => {
      const result = getMoonFrequency('lua-nova');
      expect(result).not.toBeNull();
      expect(result?.fase).toBe('lua-nova');
      expect(result?.frequencia).toBe(396);
      expect(result?.elemento).toBe('Terra');
    });

    it('should return mapping for lua-crescente', () => {
      const result = getMoonFrequency('lua-crescente');
      expect(result).not.toBeNull();
      expect(result?.fase).toBe('lua-crescente');
      expect(result?.frequencia).toBe(417);
      expect(result?.elemento).toBe('Água');
    });

    it('should return mapping for quarto-crescente', () => {
      const result = getMoonFrequency('quarto-crescente');
      expect(result).not.toBeNull();
      expect(result?.fase).toBe('quarto-crescente');
      expect(result?.frequencia).toBe(528);
      expect(result?.elemento).toBe('Fogo');
    });

    it('should return mapping for lua-cheia', () => {
      const result = getMoonFrequency('lua-cheia');
      expect(result).not.toBeNull();
      expect(result?.fase).toBe('lua-cheia');
      expect(result?.frequencia).toBe(639);
      expect(result?.elemento).toBe('Ar');
    });

    it('should return mapping for quarto-minguante', () => {
      const result = getMoonFrequency('quarto-minguante');
      expect(result).not.toBeNull();
      expect(result?.fase).toBe('quarto-minguante');
      expect(result?.frequencia).toBe(741);
      expect(result?.elemento).toBe('Ar');
    });

    it('should return mapping for lua-minguante', () => {
      const result = getMoonFrequency('lua-minguante');
      expect(result).not.toBeNull();
      expect(result?.fase).toBe('lua-minguante');
      expect(result?.frequencia).toBe(852);
      expect(result?.elemento).toBe('Éter');
    });

    it('should return mapping for quarto-descrescente', () => {
      const result = getMoonFrequency('quarto-descrescente');
      expect(result).not.toBeNull();
      expect(result?.fase).toBe('quarto-descrescente');
      expect(result?.frequencia).toBe(963);
      expect(result?.elemento).toBe('Éter');
    });

    it('should return mapping for lua-velha', () => {
      const result = getMoonFrequency('lua-velha');
      expect(result).not.toBeNull();
      expect(result?.fase).toBe('lua-velha');
      expect(result?.frequencia).toBe(963);
      expect(result?.elemento).toBe('Éter');
    });

    it('should return null for unknown phase', () => {
      expect(getMoonFrequency('unknown-phase')).toBeNull();
    });

    it('should handle case-insensitive input', () => {
      const result = getMoonFrequency('LUA-NOVA');
      expect(result).not.toBeNull();
      expect(result?.fase).toBe('lua-nova');
    });

    it('should handle phase with spaces', () => {
      const result = getMoonFrequency(' lua-cheia ');
      expect(result).not.toBeNull();
      expect(result?.fase).toBe('lua-cheia');
    });

    it('should include healing properties', () => {
      const result = getMoonFrequency('lua-cheia');
      expect(result?.propriedades_healing).toBeDefined();
      expect(result?.propriedades_healing.fisico).toBeDefined();
      expect(result?.propriedades_healing.emocional).toBeDefined();
      expect(result?.propriedades_healing.mental_espiritual).toBeDefined();
      expect(result?.propriedades_healing.pratica_recomendada).toBeDefined();
    });

    it('should include Orixá regente', () => {
      const result = getMoonFrequency('lua-cheia');
      expect(result?.orixa_regente).toBe('Oxalá');
    });

    it('should include chakra', () => {
      const result = getMoonFrequency('lua-cheia');
      expect(result?.chakra).toBe('4º Cardíaco (Anahata)');
    });
  });

  describe('getFrequencyMoon', () => {
    it('should return frequency for lua-nova', () => {
      expect(getFrequencyMoon('lua-nova')).toBe(396);
    });

    it('should return frequency for lua-crescente', () => {
      expect(getFrequencyMoon('lua-crescente')).toBe(417);
    });

    it('should return frequency for quarto-crescente', () => {
      expect(getFrequencyMoon('quarto-crescente')).toBe(528);
    });

    it('should return frequency for lua-cheia', () => {
      expect(getFrequencyMoon('lua-cheia')).toBe(639);
    });

    it('should return frequency for quarto-minguante', () => {
      expect(getFrequencyMoon('quarto-minguante')).toBe(741);
    });

    it('should return frequency for lua-minguante', () => {
      expect(getFrequencyMoon('lua-minguante')).toBe(852);
    });

    it('should return frequency for quarto-descrescente', () => {
      expect(getFrequencyMoon('quarto-descrescente')).toBe(963);
    });

    it('should return frequency for lua-velha', () => {
      expect(getFrequencyMoon('lua-velha')).toBe(963);
    });

    it('should return null for unknown phase', () => {
      expect(getFrequencyMoon('unknown')).toBeNull();
    });
  });

  describe('getAllMoonFrequencies', () => {
    it('should return array of all mappings', () => {
      const result = getAllMoonFrequencies();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(8);
    });

    it('should include all moon phases', () => {
      const result = getAllMoonFrequencies();
      const fases = result.map((m) => m.fase);
      expect(fases).toContain('lua-nova');
      expect(fases).toContain('lua-crescente');
      expect(fases).toContain('quarto-crescente');
      expect(fases).toContain('lua-cheia');
      expect(fases).toContain('quarto-minguante');
      expect(fases).toContain('lua-minguante');
      expect(fases).toContain('quarto-descrescente');
      expect(fases).toContain('lua-velha');
    });

    it('should contain valid Solfeggio frequencies', () => {
      const result = getAllMoonFrequencies();
      const frequencies = result.map((m) => m.frequencia);
      const validFrequencies = [396, 417, 528, 639, 741, 852, 963];
      frequencies.forEach((freq) => {
        expect(validFrequencies).toContain(freq);
      });
    });
  });

  describe('getElementByMoon', () => {
    it('should return Terra for lua-nova', () => {
      expect(getElementByMoon('lua-nova')).toBe('Terra');
    });

    it('should return Água for lua-crescente', () => {
      expect(getElementByMoon('lua-crescente')).toBe('Água');
    });

    it('should return Fogo for quarto-crescente', () => {
      expect(getElementByMoon('quarto-crescente')).toBe('Fogo');
    });

    it('should return Ar for lua-cheia', () => {
      expect(getElementByMoon('lua-cheia')).toBe('Ar');
    });

    it('should return Éter for lua-minguante', () => {
      expect(getElementByMoon('lua-minguante')).toBe('Éter');
    });

    it('should return null for unknown phase', () => {
      expect(getElementByMoon('unknown')).toBeNull();
    });
  });

  describe('getHealingByMoon', () => {
    it('should return healing properties for lua-cheia', () => {
      const result = getHealingByMoon('lua-cheia');
      expect(result).not.toBeNull();
      expect(result?.fisico).toBe('Equilibra sistema hormonal, harmoniza metabolism e regula ciclos');
      expect(result?.emocional).toContain('amor');
    });

    it('should return null for unknown phase', () => {
      expect(getHealingByMoon('unknown')).toBeNull();
    });
  });

  describe('getOrixaByMoon', () => {
    it('should return Exu for lua-nova', () => {
      expect(getOrixaByMoon('lua-nova')).toBe('Exu');
    });

    it('should return Oxalá for lua-cheia', () => {
      expect(getOrixaByMoon('lua-cheia')).toBe('Oxalá');
    });

    it('should return Omolu for lua-minguante', () => {
      expect(getOrixaByMoon('lua-minguante')).toBe('Omolu');
    });

    it('should return null for unknown phase', () => {
      expect(getOrixaByMoon('unknown')).toBeNull();
    });
  });

  describe('getChakraByMoon', () => {
    it('should return first chakra for lua-nova', () => {
      expect(getChakraByMoon('lua-nova')).toBe('1º Básico (Muladhara)');
    });

    it('should return heart chakra for lua-cheia', () => {
      expect(getChakraByMoon('lua-cheia')).toBe('4º Cardíaco (Anahata)');
    });

    it('should return crown chakra for lua-velha', () => {
      expect(getChakraByMoon('lua-velha')).toBe('7º Coronário (Sahasrara)');
    });

    it('should return null for unknown phase', () => {
      expect(getChakraByMoon('unknown')).toBeNull();
    });
  });

  describe('getPolarityByMoon', () => {
    it('should return Yin for lua-nova', () => {
      expect(getPolarityByMoon('lua-nova')).toBe('Yin');
    });

    it('should return Yang for lua-crescente', () => {
      expect(getPolarityByMoon('lua-crescente')).toBe('Yang');
    });

    it('should return Equilibrado for lua-cheia', () => {
      expect(getPolarityByMoon('lua-cheia')).toBe('Equilibrado');
    });

    it('should return null for unknown phase', () => {
      expect(getPolarityByMoon('unknown')).toBeNull();
    });
  });

  describe('getVibrationByMoon', () => {
    it('should return vibration for lua-nova', () => {
      expect(getVibrationByMoon('lua-nova')).toBe('Semente - potencial adormecido');
    });

    it('should return vibration for lua-cheia', () => {
      expect(getVibrationByMoon('lua-cheia')).toBe('Oceano - plenitude absoluta');
    });

    it('should return null for unknown phase', () => {
      expect(getVibrationByMoon('unknown')).toBeNull();
    });
  });

  describe('getAvailableFrequencies', () => {
    it('should return array of frequencies', () => {
      const result = getAvailableFrequencies();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return sorted frequencies', () => {
      const result = getAvailableFrequencies();
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThan(result[i - 1]);
      }
    });

    it('should include all Solfeggio frequencies used', () => {
      const result = getAvailableFrequencies();
      expect(result).toContain(396);
      expect(result).toContain(417);
      expect(result).toContain(528);
      expect(result).toContain(639);
      expect(result).toContain(741);
      expect(result).toContain(852);
      expect(result).toContain(963);
    });
  });

  describe('getAvailablePhases', () => {
    it('should return array of phase identifiers', () => {
      const result = getAvailablePhases();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(8);
    });

    it('should include all moon phases', () => {
      const result = getAvailablePhases();
      expect(result).toContain('lua-nova');
      expect(result).toContain('lua-crescente');
      expect(result).toContain('quarto-crescente');
      expect(result).toContain('lua-cheia');
      expect(result).toContain('quarto-minguante');
      expect(result).toContain('lua-minguante');
      expect(result).toContain('quarto-descrescente');
      expect(result).toContain('lua-velha');
    });
  });

  describe('getMoonsByFrequency', () => {
    it('should return phases for 396 Hz', () => {
      const result = getMoonsByFrequency(396);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].frequencia).toBe(396);
    });

    it('should return phases for 528 Hz', () => {
      const result = getMoonsByFrequency(528);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].fase).toBe('quarto-crescente');
    });

    it('should return phases for 963 Hz', () => {
      const result = getMoonsByFrequency(963);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((m) => m.fase === 'lua-velha')).toBe(true);
    });

    it('should return empty array for unknown frequency', () => {
      const result = getMoonsByFrequency(100);
      expect(result).toEqual([]);
    });
  });

  describe('getMoonsByElement', () => {
    it('should return phases for Terra element', () => {
      const result = getMoonsByElement('Terra');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].elemento).toBe('Terra');
    });

    it('should return phases for Água element', () => {
      const result = getMoonsByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].fase).toBe('lua-crescente');
    });

    it('should return phases for Éter element', () => {
      const result = getMoonsByElement('Éter');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.elemento === 'Éter')).toBe(true);
    });

    it('should return empty array for unknown element', () => {
      const result = getMoonsByElement('Unknown');
      expect(result).toEqual([]);
    });
  });

  describe('getMoonsByOrixa', () => {
    it('should return phases for Oxalá', () => {
      const result = getMoonsByOrixa('Oxalá');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].fase).toBe('lua-cheia');
    });

    it('should return phases for Exu', () => {
      const result = getMoonsByOrixa('Exu');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].fase).toBe('lua-nova');
    });

    it('should return empty array for unknown Orixá', () => {
      const result = getMoonsByOrixa('Unknown');
      expect(result).toEqual([]);
    });
  });

  describe('MOON_FREQUENCY_MAP structure', () => {
    it('should have all 8 moon phases', () => {
      const fases: FaseLua[] = [
        'lua-nova',
        'lua-crescente',
        'quarto-crescente',
        'lua-cheia',
        'quarto-minguante',
        'lua-minguante',
        'quarto-descrescente',
        'lua-velha',
      ];
      fases.forEach((fase) => {
        expect(MOON_FREQUENCY_MAP[fase]).toBeDefined();
      });
    });

    it('should have valid frequency values', () => {
      const validFrequencies = [396, 417, 528, 639, 741, 852, 963];
      Object.values(MOON_FREQUENCY_MAP).forEach((mapping) => {
        expect(validFrequencies).toContain(mapping.frequencia);
      });
    });

    it('should have valid element values', () => {
      const validElements: Elemento[] = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      Object.values(MOON_FREQUENCY_MAP).forEach((mapping) => {
        expect(validElements).toContain(mapping.elemento);
      });
    });

    it('should have healing properties for all phases', () => {
      Object.values(MOON_FREQUENCY_MAP).forEach((mapping) => {
        expect(mapping.propriedades_healing).toBeDefined();
        expect(mapping.propriedades_healing.fisico).toBeDefined();
        expect(mapping.propriedades_healing.emocional).toBeDefined();
        expect(mapping.propriedades_healing.mental_espiritual).toBeDefined();
        expect(mapping.propriedades_healing.pratica_recomendada).toBeDefined();
      });
    });

    it('should have polarities in valid range', () => {
      const validPolarities: ('Yang' | 'Yin' | 'Equilibrado')[] = ['Yang', 'Yin', 'Equilibrado'];
      Object.values(MOON_FREQUENCY_MAP).forEach((mapping) => {
        expect(validPolarities).toContain(mapping.qualidade_lunar.polaridade);
      });
    });
  });
});