import { describe, it, expect } from 'vitest';
import {
  getMoonOdu,
  getOduMoon,
  getAllMoonOdus,
  getAvailablePhases,
  getSecondaryOdu,
  getOduElement,
  getOrixaMoon,
  getRitualMoon,
  getSpiritualMeaning,
  getMoonByOdu,
  getMoonByOrixa,
  getMoonByElement,
  MOON_ODU_MAPPINGS,
  type MoonOduMapping,
  type OduCorrespondence,
} from '@/lib/correlation/moon-odu';

describe('correlation/moon-odu', () => {
  describe('getMoonOdu', () => {
    it('returns mapping for lua-nova', () => {
      const result = getMoonOdu('lua-nova');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('lua-nova');
      expect(result?.nome_fase).toBe('Lua Nova');
    });

    it('returns mapping for lua-crescente', () => {
      const result = getMoonOdu('lua-crescente');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('lua-crescente');
      expect(result?.nome_fase).toBe('Lua Crescente');
    });

    it('returns mapping for quarto-crescente', () => {
      const result = getMoonOdu('quarto-crescente');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('quarto-crescente');
    });

    it('returns mapping for lua-cheia', () => {
      const result = getMoonOdu('lua-cheia');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('lua-cheia');
      expect(result?.nome_fase).toBe('Lua Cheia');
    });

    it('returns mapping for quarto-minguante', () => {
      const result = getMoonOdu('quarto-minguante');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('quarto-minguante');
    });

    it('returns mapping for lua-minguante', () => {
      const result = getMoonOdu('lua-minguante');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('lua-minguante');
      expect(result?.nome_fase).toBe('Lua Minguante');
    });

    it('returns mapping for quarto-descrescente', () => {
      const result = getMoonOdu('quarto-descrescente');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('quarto-descrescente');
    });

    it('returns mapping for lua-velha', () => {
      const result = getMoonOdu('lua-velha');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('lua-velha');
      expect(result?.nome_fase).toBe('Lua Velha');
    });

    it('returns null for invalid phase', () => {
      const result = getMoonOdu('invalid-phase');
      expect(result).toBeNull();
    });

    it('handles case-insensitive input', () => {
      const result = getMoonOdu('LUA-CHEIA');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('lua-cheia');
    });

    it('handles phase with extra whitespace', () => {
      const result = getMoonOdu('  lua-cheia  ');
      expect(result).toBeDefined();
      expect(result?.fase).toBe('lua-cheia');
    });

    it('each mapping has required fields', () => {
      const phases = getAvailablePhases();
      phases.forEach(fase => {
        const mapping = getMoonOdu(fase);
        expect(mapping).toBeDefined();
        expect(mapping?.fase).toBe(fase);
        expect(mapping?.nome_fase).toBeDefined();
        expect(mapping?.odu_primario).toBeDefined();
        expect(mapping?.odu_secundario).toBeDefined();
        expect(mapping?.elemento).toBeDefined();
        expect(mapping?.polaridade).toBeDefined();
        expect(mapping?.significado_espiritual).toBeDefined();
        expect(mapping?.orixa).toBeDefined();
        expect(mapping?.ritual).toBeDefined();
        expect(mapping?.praticas).toBeDefined();
        expect(Array.isArray(mapping?.praticas)).toBe(true);
        expect(mapping?.cores).toBeDefined();
        expect(Array.isArray(mapping?.cores)).toBe(true);
      });
    });
  });

  describe('getOduMoon', () => {
    it('returns primary Odu for lua-cheia', () => {
      const result = getOduMoon('lua-cheia');
      expect(result).toBeDefined();
      expect(result?.odu).toBe('Ofun');
      expect(result?.numero).toBe(10);
      expect(result?.elemento).toBe('Água');
    });

    it('returns primary Odu for lua-nova', () => {
      const result = getOduMoon('lua-nova');
      expect(result).toBeDefined();
      expect(result?.odu).toBe('Okaran');
      expect(result?.numero).toBe(1);
    });

    it('returns primary Odu for quarto-crescente', () => {
      const result = getOduMoon('quarto-crescente');
      expect(result).toBeDefined();
      expect(result?.odu).toBe('Ejilsebora');
      expect(result?.numero).toBe(12);
    });

    it('returns primary Odu for lua-velha', () => {
      const result = getOduMoon('lua-velha');
      expect(result).toBeDefined();
      expect(result?.odu).toBe('Olobón');
      expect(result?.numero).toBe(13);
    });

    it('returns null for invalid phase', () => {
      const result = getOduMoon('invalid');
      expect(result).toBeNull();
    });
  });

  describe('getSecondaryOdu', () => {
    it('returns secondary Odu for lua-nova', () => {
      const result = getSecondaryOdu('lua-nova');
      expect(result).toBeDefined();
      expect(result?.odu).toBe('Alafia');
      expect(result?.numero).toBe(16);
    });

    it('returns secondary Odu for lua-cheia', () => {
      const result = getSecondaryOdu('lua-cheia');
      expect(result).toBeDefined();
      expect(result?.odu).toBe('Obará');
      expect(result?.numero).toBe(6);
    });

    it('returns null for invalid phase', () => {
      const result = getSecondaryOdu('invalid');
      expect(result).toBeNull();
    });
  });

  describe('getOduElement', () => {
    it('returns element for lua-cheia', () => {
      const result = getOduElement('lua-cheia');
      expect(result).toBe('Água');
    });

    it('returns element for lua-nova', () => {
      const result = getOduElement('lua-nova');
      expect(result).toBe('Terra');
    });

    it('returns element for quarto-crescente', () => {
      const result = getOduElement('quarto-crescente');
      expect(result).toBe('Fogo');
    });

    it('returns null for invalid phase', () => {
      const result = getOduElement('invalid');
      expect(result).toBeNull();
    });
  });

  describe('getOrixaMoon', () => {
    it('returns Orixá for lua-cheia', () => {
      const result = getOrixaMoon('lua-cheia');
      expect(result).toBe('Oxalá');
    });

    it('returns Orixá for lua-nova', () => {
      const result = getOrixaMoon('lua-nova');
      expect(result).toBe('Omolu');
    });

    it('returns Orixá for quarto-crescente', () => {
      const result = getOrixaMoon('quarto-crescente');
      expect(result).toBe('Ogum');
    });

    it('returns null for invalid phase', () => {
      const result = getOrixaMoon('invalid');
      expect(result).toBeNull();
    });
  });

  describe('getRitualMoon', () => {
    it('returns ritual for lua-cheia', () => {
      const result = getRitualMoon('lua-cheia');
      expect(result).toBeDefined();
      expect(result?.tipo).toBe('Alta Magia');
      expect(result?.descricao).toBeDefined();
    });

    it('returns ritual for lua-nova', () => {
      const result = getRitualMoon('lua-nova');
      expect(result).toBeDefined();
      expect(result?.tipo).toBe('Plântula de Intenção');
    });

    it('returns null for invalid phase', () => {
      const result = getRitualMoon('invalid');
      expect(result).toBeNull();
    });
  });

  describe('getSpiritualMeaning', () => {
    it('returns spiritual meaning for lua-cheia', () => {
      const result = getSpiritualMeaning('lua-cheia');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result!.length).toBeGreaterThan(10);
    });

    it('returns spiritual meaning for lua-nova', () => {
      const result = getSpiritualMeaning('lua-nova');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('returns null for invalid phase', () => {
      const result = getSpiritualMeaning('invalid');
      expect(result).toBeNull();
    });
  });

  describe('getAllMoonOdus', () => {
    it('returns array of all mappings', () => {
      const result = getAllMoonOdus();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(8);
    });

    it('contains all lunar phases', () => {
      const result = getAllMoonOdus();
      const phases = result.map(m => m.fase);
      expect(phases).toContain('lua-nova');
      expect(phases).toContain('lua-crescente');
      expect(phases).toContain('lua-cheia');
      expect(phases).toContain('lua-minguante');
      expect(phases).toContain('lua-velha');
    });

    it('each mapping has valid Odu structure', () => {
      const result = getAllMoonOdus();
      result.forEach(mapping => {
        expect(mapping.odu_primario.odu).toBeDefined();
        expect(mapping.odu_primario.numero).toBeGreaterThan(0);
        expect(mapping.odu_primario.numero).toBeLessThanOrEqual(16);
        expect(mapping.odu_primario.elemento).toBeDefined();
        expect(mapping.odu_secundario.odu).toBeDefined();
        expect(mapping.odu_secundario.numero).toBeGreaterThan(0);
      });
    });
  });

  describe('getAvailablePhases', () => {
    it('returns array of all phases', () => {
      const result = getAvailablePhases();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(8);
    });

    it('contains all expected phases', () => {
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

  describe('getMoonByOdu', () => {
    it('returns mappings for Okaran', () => {
      const result = getMoonByOdu('Okaran');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(mapping => {
        const hasOkaran =
          mapping.odu_primario.odu === 'Okaran' ||
          mapping.odu_secundario.odu === 'Okaran';
        expect(hasOkaran).toBe(true);
      });
    });

    it('returns mappings for Ofun', () => {
      const result = getMoonByOdu('Ofun');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown Odu', () => {
      const result = getMoonByOdu('UnknownOdu');
      expect(result).toEqual([]);
    });
  });

  describe('getMoonByOrixa', () => {
    it('returns mappings for Omolu', () => {
      const result = getMoonByOrixa('Omolu');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(mapping => {
        expect(mapping.orixa).toBe('Omolu');
      });
    });

    it('returns mappings for Oxalá', () => {
      const result = getMoonByOrixa('Oxalá');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown Orixá', () => {
      const result = getMoonByOrixa('UnknownOrixa');
      expect(result).toEqual([]);
    });
  });

  describe('getMoonByElement', () => {
    it('returns mappings for Água element', () => {
      const result = getMoonByElement('Água');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns mappings for Terra element', () => {
      const result = getMoonByElement('Terra');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns mappings for Fogo element', () => {
      const result = getMoonByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown element', () => {
      const result = getMoonByElement('UnknownElement');
      expect(result).toEqual([]);
    });
  });

  describe('MOON_ODU_MAPPINGS structure', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(MOON_ODU_MAPPINGS)).toBe(true);
    });

    it('contains all 8 lunar phases', () => {
      const phases = Object.keys(MOON_ODU_MAPPINGS);
      expect(phases.length).toBe(8);
    });

    it('each mapping has valid polarity values', () => {
      const validPolarities = ['Yang', 'Yin', 'Equilibrado'];
      Object.values(MOON_ODU_MAPPINGS).forEach(mapping => {
        expect(validPolarities).toContain(mapping.polaridade);
      });
    });

    it('each mapping has valid elements', () => {
      const validElements = ['Fogo', 'Água', 'Ar', 'Terra', 'Éter'];
      Object.values(MOON_ODU_MAPPINGS).forEach(mapping => {
        expect(validElements).toContain(mapping.elemento);
      });
    });

    it('each mapping has arrays with content', () => {
      Object.values(MOON_ODU_MAPPINGS).forEach(mapping => {
        expect(mapping.praticas.length).toBeGreaterThan(0);
        expect(mapping.cores.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Odu correspondence integrity', () => {
    it('all primary Odu numbers are valid', () => {
      Object.values(MOON_ODU_MAPPINGS).forEach(mapping => {
        expect(mapping.odu_primario.numero).toBeGreaterThanOrEqual(1);
        expect(mapping.odu_primario.numero).toBeLessThanOrEqual(16);
      });
    });

    it('all secondary Odu numbers are valid', () => {
      Object.values(MOON_ODU_MAPPINGS).forEach(mapping => {
        expect(mapping.odu_secundario.numero).toBeGreaterThanOrEqual(1);
        expect(mapping.odu_secundario.numero).toBeLessThanOrEqual(16);
      });
    });

    it('Odu elements match the mapping elements', () => {
      Object.values(MOON_ODU_MAPPINGS).forEach(mapping => {
        // Primary Odu element should relate to the mapping element
        // Allow Air elements for Terra mappings (Alafia in lua-nova)
        const validCombinations: Record<string, string[]> = {
          'Água': ['Água'],
          'Terra': ['Terra', 'Ar'],
          'Fogo': ['Fogo'],
          'Éter': ['Éter', 'Água', 'Terra'],
        };
        const expected = validCombinations[mapping.elemento] || [mapping.elemento];
        expect(expected).toContain(mapping.odu_primario.elemento);
      });
    });
  });

  describe('spiritual meaning content', () => {
    it('all spiritual meanings mention Odu names', () => {
      Object.values(MOON_ODU_MAPPINGS).forEach(mapping => {
        expect(mapping.significado_espiritual).toContain(mapping.odu_primario.odu);
      });
    });

    it('all spiritual meanings mention Orixá', () => {
      Object.values(MOON_ODU_MAPPINGS).forEach(mapping => {
        expect(mapping.significado_espiritual).toContain(mapping.orixa);
      });
    });

    it('all spiritual meanings are substantive', () => {
      Object.values(MOON_ODU_MAPPINGS).forEach(mapping => {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(50);
      });
    });
  });
});
