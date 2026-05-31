import { describe, it, expect } from 'vitest';
import {
  getZodiacPlanet,
  getPlanetZodiac,
  getAllZodiacPlanets,
  getPlanetaFromSigno,
  getElementoFromSigno,
  getSignificadoSpiritual,
  getQualidadeCosmica,
  getLicaoEspiritual,
  getEnergiaManifestacao,
  getSignosByPlaneta,
  getSignosByElement,
  getSombraFromSigno,
  getAllSigns,
  getZodiacPlanetBySigno,
  isPlanetaMultiplo,
  getPlanetasMultiplos,
  ZODIAC_PLANET_MAP,
  TODOS_PLANETAS,
  TODOS_SIGNOS,
  type ZodiacPlanetMapping,
  type SignoZodiac,
  type Planeta,
} from '@/lib/correlation/zodiac-planet';

describe('ZodiacPlanet Correlation', () => {
  describe('Core Exports', () => {
    it('should export all required functions', () => {
      expect(typeof getZodiacPlanet).toBe('function');
      expect(typeof getPlanetZodiac).toBe('function');
      expect(typeof getAllZodiacPlanets).toBe('function');
    });

// Type exports are compile-time only, verify the types are usable
    // by checking that exported values exist
    it('should export type definitions', () => {
      expect(typeof ZODIAC_PLANET_MAP).toBe('object');
      const mapping = ZODIAC_PLANET_MAP['Áries'];
      expect(typeof mapping).toBe('object');
      expect(typeof mapping.signo).toBe('string');
      expect(typeof mapping.planeta).toBe('string');
      expect(typeof mapping.elemento).toBe('string');
    });
    });

    it('should export constants', () => {
      expect(Array.isArray(TODOS_PLANETAS)).toBe(true);
      expect(Array.isArray(TODOS_SIGNOS)).toBe(true);
      expect(typeof ZODIAC_PLANET_MAP).toBe('object');
    });
  });

  describe('getZodiacPlanet', () => {
    it('should return mapping for valid sign names', () => {
      const result = getZodiacPlanet('Áries');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Áries');
      expect(result?.planeta).toBe('Marte');
      expect(result?.elemento).toBe('Fogo');
    });

    it('should return mapping for lowercase input', () => {
      const result = getZodiacPlanet('aries');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Áries');
    });

    it('should return mapping for uppercase input', () => {
      const result = getZodiacPlanet('LEÃO');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Leão');
    });

    it('should handle accented characters', () => {
      const result = getZodiacPlanet('Escorpião');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Escorpião');
    });

    it('should return null for invalid sign', () => {
      expect(getZodiacPlanet('InvalidSign')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(getZodiacPlanet('')).toBeNull();
    });

    it('should return null for whitespace only', () => {
      expect(getZodiacPlanet('   ')).toBeNull();
    });

    it('should return null for null input', () => {
      expect(getZodiacPlanet(null as unknown as string)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(getZodiacPlanet(undefined as unknown as string)).toBeNull();
    });

    it('should handle common alternatives', () => {
      expect(getZodiacPlanet('Cancro')?.signo).toBe('Câncer');
      expect(getZodiacPlanet('Balança')?.signo).toBe('Libra');
    });
  });

  describe('getPlanetZodiac', () => {
    it('should return sign for valid planet', () => {
      expect(getPlanetZodiac('Sol')).toBe('Leão');
      expect(getPlanetZodiac('Lua')).toBe('Câncer');
      expect(getPlanetZodiac('Marte')).toBe('Áries');
    });

    it('should return sign for lowercase planet', () => {
      expect(getPlanetZodiac('sol')).toBe('Leão');
      expect(getPlanetZodiac('marte')).toBe('Áries');
    });

    it('should return sign for uppercase planet', () => {
      expect(getPlanetZodiac('SOL')).toBe('Leão');
    });

    it('should return null for invalid planet', () => {
      expect(getPlanetZodiac('InvalidPlanet')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(getPlanetZodiac('')).toBeNull();
    });
  });

  describe('getAllZodiacPlanets', () => {
    it('should return array with all 12 mappings', () => {
      const result = getAllZodiacPlanets();
      expect(result).toHaveLength(12);
    });

    it('should return all unique signs', () => {
      const result = getAllZodiacPlanets();
      const signs = result.map((m) => m.signo);
      const uniqueSigns = [...new Set(signs)];
      expect(uniqueSigns).toHaveLength(12);
    });

    it('should have valid structure for each mapping', () => {
      const result = getAllZodiacPlanets();
      result.forEach((mapping) => {
        expect(mapping).toHaveProperty('signo');
        expect(mapping).toHaveProperty('planeta');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('significado_spiritual');
        expect(mapping).toHaveProperty('energia_manifestacao');
      });
    });

    it('should not return modified array', () => {
      const result1 = getAllZodiacPlanets();
      const result2 = getAllZodiacPlanets();
      expect(result1).not.toBe(result2);
    });
  });

  describe('getPlanetaFromSigno', () => {
    it('should return planet for valid sign', () => {
      expect(getPlanetaFromSigno('Áries')).toBe('Marte');
      expect(getPlanetaFromSigno('Touro')).toBe('Vénus');
      expect(getPlanetaFromSigno('Leão')).toBe('Sol');
      expect(getPlanetaFromSigno('Escorpião')).toBe('Plutão');
    });

    it('should return null for invalid sign', () => {
      expect(getPlanetaFromSigno('Invalid')).toBeNull();
    });
  });

  describe('getElementoFromSigno', () => {
    it('should return element for valid sign', () => {
      expect(getElementoFromSigno('Áries')).toBe('Fogo');
      expect(getElementoFromSigno('Touro')).toBe('Terra');
      expect(getElementoFromSigno('Gémeos')).toBe('Ar');
      expect(getElementoFromSigno('Câncer')).toBe('Água');
    });

    it('should return null for invalid sign', () => {
      expect(getElementoFromSigno('Invalid')).toBeNull();
    });
  });

  describe('getSignificadoSpiritual', () => {
    it('should return spiritual meaning for valid sign', () => {
      const result = getSignificadoSpiritual('Áries');
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('descricao');
      expect(result).toHaveProperty('qualidade_cosmica');
      expect(result).toHaveProperty('lição_espiritual');
    });

    it('should return null for invalid sign', () => {
      expect(getSignificadoSpiritual('Invalid')).toBeNull();
    });
  });

  describe('getQualidadeCosmica', () => {
    it('should return cosmic quality for valid sign', () => {
      const result = getQualidadeCosmica('Áries');
      expect(typeof result).toBe('string');
      expect(result?.length).toBeGreaterThan(0);
    });

    it('should return null for invalid sign', () => {
      expect(getQualidadeCosmica('Invalid')).toBeNull();
    });
  });

  describe('getLicaoEspiritual', () => {
    it('should return spiritual lesson for valid sign', () => {
      const result = getLicaoEspiritual('Áries');
      expect(typeof result).toBe('string');
      expect(result?.length).toBeGreaterThan(0);
    });

    it('should return null for invalid sign', () => {
      expect(getLicaoEspiritual('Invalid')).toBeNull();
    });
  });

  describe('getEnergiaManifestacao', () => {
    it('should return energy manifest for valid sign', () => {
      const result = getEnergiaManifestacao('Áries');
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('foco');
      expect(result).toHaveProperty('força');
      expect(result).toHaveProperty('sombra');
    });

    it('should return null for invalid sign', () => {
      expect(getEnergiaManifestacao('Invalid')).toBeNull();
    });
  });

  describe('getSignosByPlaneta', () => {
    it('should return signs for valid planet', () => {
      const result = getSignosByPlaneta('Mercúrio');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].planeta).toBe('Mercúrio');
    });

    it('should return empty array for invalid planet', () => {
      expect(getSignosByPlaneta('Invalid')).toEqual([]);
    });

    it('should handle planet name variations', () => {
      expect(getSignosByPlaneta('sol').length).toBeGreaterThan(0);
      expect(getSignosByPlaneta('SOL').length).toBeGreaterThan(0);
    });
  });

  describe('getSignosByElement', () => {
    it('should return signs for Fire element', () => {
      const result = getSignosByElement('Fogo');
      expect(result.length).toBe(3);
      result.forEach((mapping) => {
        expect(mapping.elemento).toBe('Fogo');
      });
    });

    it('should return signs for Earth element', () => {
      const result = getSignosByElement('Terra');
      expect(result.length).toBe(3);
      result.forEach((mapping) => {
        expect(mapping.elemento).toBe('Terra');
      });
    });

    it('should return signs for Air element', () => {
      const result = getSignosByElement('Ar');
      expect(result.length).toBe(3);
      result.forEach((mapping) => {
        expect(mapping.elemento).toBe('Ar');
      });
    });

    it('should return signs for Water element', () => {
      const result = getSignosByElement('Água');
      expect(result.length).toBe(3);
      result.forEach((mapping) => {
        expect(mapping.elemento).toBe('Água');
      });
    });

    it('should return empty array for invalid element', () => {
      expect(getSignosByElement('Invalid')).toEqual([]);
    });
  });

  describe('getSombraFromSigno', () => {
    it('should return shadow energy for valid sign', () => {
      const result = getSombraFromSigno('Áries');
      expect(typeof result).toBe('string');
      expect(result?.length).toBeGreaterThan(0);
    });

    it('should return null for invalid sign', () => {
      expect(getSombraFromSigno('Invalid')).toBeNull();
    });
  });

  describe('getAllSigns', () => {
    it('should return array with all 12 signs', () => {
      const result = getAllSigns();
      expect(result).toHaveLength(12);
    });

    it('should return array of SignoZodiac type', () => {
      const result = getAllSigns();
      expect(result).toContain('Áries');
      expect(result).toContain('Peixes');
    });
  });

  describe('getZodiacPlanetBySigno', () => {
    it('should behave like getZodiacPlanet', () => {
      const result = getZodiacPlanetBySigno('Áries');
      expect(result).not.toBeNull();
      expect(result?.signo).toBe('Áries');
    });
  });

  describe('isPlanetaMultiplo', () => {
    it('should return true for Mercúrio (rules 2 signs)', () => {
      expect(isPlanetaMultiplo('Mercúrio')).toBe(true);
    });

    it('should return false for Sol (rules 1 sign)', () => {
      expect(isPlanetaMultiplo('Sol')).toBe(false);
    });

    it('should return false for invalid planet', () => {
      expect(isPlanetaMultiplo('Invalid')).toBe(false);
    });
  });

  describe('getPlanetasMultiplos', () => {
    it('should return planets that rule multiple signs', () => {
      const result = getPlanetasMultiplos();
      expect(result).toContain('Mercúrio');
    });

    it('should not include planets that rule single sign', () => {
      const result = getPlanetasMultiplos();
      expect(result).not.toContain('Sol');
      expect(result).not.toContain('Lua');
      expect(result).not.toContain('Marte');
    });
  });

  describe('ZODIAC_PLANET_MAP', () => {
    it('should have all 12 signs', () => {
      const signs = Object.keys(ZODIAC_PLANET_MAP);
      expect(signs).toHaveLength(12);
    });

    it('should be frozen', () => {
      expect(Object.isFrozen(ZODIAC_PLANET_MAP)).toBe(true);
    });

    it('should have valid planet values', () => {
      const planetValues = Object.values(ZODIAC_PLANET_MAP).map((m) => m.planeta);
      const expectedPlanets: Planeta[] = [
        'Sol', 'Lua', 'Mercúrio', 'Vénus', 'Marte',
        'Júpiter', 'Saturno', 'Urano', 'Neptuno', 'Plutão',
      ];
      planetValues.forEach((planet) => {
        expect(expectedPlanets).toContain(planet);
      });
    });

    it('should have valid element values', () => {
      const elementValues = Object.values(ZODIAC_PLANET_MAP).map((m) => m.elemento);
      const validElements = ['Fogo', 'Terra', 'Ar', 'Água'];
      elementValues.forEach((element) => {
        expect(validElements).toContain(element);
      });
    });

    it('should distribute elements evenly (3 per element)', () => {
      const counts: Record<string, number> = {};
      Object.values(ZODIAC_PLANET_MAP).forEach((m) => {
        counts[m.elemento] = (counts[m.elemento] || 0) + 1;
      });
      expect(counts['Fogo']).toBe(3);
      expect(counts['Terra']).toBe(3);
      expect(counts['Ar']).toBe(3);
      expect(counts['Água']).toBe(3);
    });
  });

  describe('TODOS_PLANETAS', () => {
    it('should contain all 10 planets', () => {
      expect(TODOS_PLANETAS).toHaveLength(10);
    });

    it('should contain classical planets', () => {
      expect(TODOS_PLANETAS).toContain('Sol');
      expect(TODOS_PLANETAS).toContain('Lua');
      expect(TODOS_PLANETAS).toContain('Mercúrio');
      expect(TODOS_PLANETAS).toContain('Vénus');
      expect(TODOS_PLANETAS).toContain('Marte');
      expect(TODOS_PLANETAS).toContain('Júpiter');
      expect(TODOS_PLANETAS).toContain('Saturno');
    });

    it('should contain modern planets', () => {
      expect(TODOS_PLANETAS).toContain('Urano');
      expect(TODOS_PLANETAS).toContain('Neptuno');
      expect(TODOS_PLANETAS).toContain('Plutão');
    });

    it('should be readonly', () => {
      expect(Object.isFrozen(TODOS_PLANETAS)).toBe(true);
    });
  });

  describe('TODOS_SIGNOS', () => {
    it('should contain all 12 signs', () => {
      expect(TODOS_SIGNOS).toHaveLength(12);
    });

    it('should contain each element signs', () => {
      expect(TODOS_SIGNOS).toContain('Áries');
      expect(TODOS_SIGNOS).toContain('Touro');
      expect(TODOS_SIGNOS).toContain('Gémeos');
      expect(TODOS_SIGNOS).toContain('Câncer');
      expect(TODOS_SIGNOS).toContain('Leão');
      expect(TODOS_SIGNOS).toContain('Virgem');
      expect(TODOS_SIGNOS).toContain('Libra');
      expect(TODOS_SIGNOS).toContain('Escorpião');
      expect(TODOS_SIGNOS).toContain('Sagitário');
      expect(TODOS_SIGNOS).toContain('Capricórnio');
      expect(TODOS_SIGNOS).toContain('Aquário');
      expect(TODOS_SIGNOS).toContain('Peixes');
    });

    it('should be readonly', () => {
      expect(Object.isFrozen(TODOS_SIGNOS)).toBe(true);
    });
  });

  describe('Spiritual Correlations', () => {
    it('should have meaningful descriptions', () => {
      getAllZodiacPlanets().forEach((mapping) => {
        expect(mapping.significado_spiritual.descricao.length).toBeGreaterThan(10);
      });
    });

    it('should have cosmic qualities', () => {
      getAllZodiacPlanets().forEach((mapping) => {
        expect(mapping.significado_spiritual.qualidade_cosmica.length).toBeGreaterThan(0);
      });
    });

    it('should have spiritual lessons', () => {
      getAllZodiacPlanets().forEach((mapping) => {
        expect(mapping.significado_spiritual.lição_espiritual.length).toBeGreaterThan(10);
      });
    });

    it('should have focus descriptions', () => {
      getAllZodiacPlanets().forEach((mapping) => {
        expect(mapping.energia_manifestacao.foco.length).toBeGreaterThan(0);
      });
    });

    it('should have strength descriptions', () => {
      getAllZodiacPlanets().forEach((mapping) => {
        expect(mapping.energia_manifestacao.força.length).toBeGreaterThan(0);
      });
    });

    it('should have shadow descriptions', () => {
      getAllZodiacPlanets().forEach((mapping) => {
        expect(mapping.energia_manifestacao.sombra.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Default Export', () => {
    it('should export all functions', async () => {
      const module = await import('@/lib/correlation/zodiac-planet');
      const defaultExport = module.default;

      expect(typeof defaultExport.getZodiacPlanet).toBe('function');
      expect(typeof defaultExport.getPlanetZodiac).toBe('function');
      expect(typeof defaultExport.getAllZodiacPlanets).toBe('function');
      expect(typeof defaultExport.getPlanetaFromSigno).toBe('function');
      expect(typeof defaultExport.getElementoFromSigno).toBe('function');
      expect(typeof defaultExport.getSignificadoSpiritual).toBe('function');
      expect(typeof defaultExport.getQualidadeCosmica).toBe('function');
      expect(typeof defaultExport.getLicaoEspiritual).toBe('function');
      expect(typeof defaultExport.getEnergiaManifestacao).toBe('function');
      expect(typeof defaultExport.getSignosByPlaneta).toBe('function');
      expect(typeof defaultExport.getSignosByElement).toBe('function');
      expect(typeof defaultExport.getSombraFromSigno).toBe('function');
      expect(typeof defaultExport.getAllSigns).toBe('function');
      expect(typeof defaultExport.getZodiacPlanetBySigno).toBe('function');
      expect(typeof defaultExport.isPlanetaMultiplo).toBe('function');
      expect(typeof defaultExport.getPlanetasMultiplos).toBe('function');
    });

    it('should export constants', async () => {
      const module = await import('@/lib/correlation/zodiac-planet');
      const defaultExport = module.default;

      expect(Array.isArray(defaultExport.TODOS_PLANETAS)).toBe(true);
      expect(Array.isArray(defaultExport.TODOS_SIGNOS)).toBe(true);
      expect(typeof defaultExport.ZODIAC_PLANET_MAP).toBe('object');
    });
  });
});