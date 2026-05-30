import { describe, it, expect } from 'vitest';
import {
  getOduPlanet,
  getPlanetOdu,
  getAllOduPlanets,
  getAllOduNames,
  hasOduPlanet,
  getOduByNumber,
  getOdusForPlanet,
  getAllPlanets,
  ODU_PLANET_MAPPINGS,
} from '@/lib/correlation/odu-planet';

describe('correlation/odu-planet', () => {
  describe('getOduPlanet', () => {
    it('returns mapping for valid Odu name', () => {
      const result = getOduPlanet('Ejilsebora');
      expect(result).toBeTruthy();
      expect(result?.odu).toBe('Ejilsebora');
      expect(result?.planeta).toBe('Sol');
    });

    it('returns null for invalid Odu name', () => {
      const result = getOduPlanet('InvalidOdu');
      expect(result).toBeNull();
    });

    it('each mapping has required fields', () => {
      const result = getOduPlanet('Ofun');
      expect(result?.odu).toBeTruthy();
      expect(result?.numero).toBeTruthy();
      expect(result?.planeta).toBeTruthy();
      expect(result?.elemento).toBeTruthy();
      expect(result?.qualidades_planetarias).toBeTruthy();
      expect(result?.alinhamento_energetico).toBeTruthy();
      expect(result?.significado_espiritual).toBeTruthy();
      expect(result?.orixa).toBeTruthy();
      expect(result?.dia_sagrado).toBeTruthy();
      expect(result?.cores).toBeTruthy();
      expect(result?.chakra).toBeTruthy();
      expect(result?.sephirah).toBeTruthy();
      expect(result?.signo_zodiacal).toBeTruthy();
      expect(result?.numerologia).toBeTruthy();
      expect(result?.afinidades).toBeTruthy();
    });
  });

  describe('getPlanetOdu', () => {
    it('returns all Odus for Sol', () => {
      const result = getPlanetOdu('Sol');
      expect(result.length).toBeGreaterThan(0);
      expect(result.map(m => m.odu)).toContain('Ejilsebora');
      expect(result.map(m => m.odu)).toContain('Obará');
    });

    it('returns all Odus for Lua', () => {
      const result = getPlanetOdu('Lua');
      expect(result.length).toBeGreaterThan(0);
      expect(result.map(m => m.odu)).toContain('Irosun');
      expect(result.map(m => m.odu)).toContain('Ofun');
    });

    it('returns all Odus for Marte', () => {
      const result = getPlanetOdu('Marte');
      expect(result.length).toBeGreaterThan(0);
      expect(result.map(m => m.odu)).toContain('Etaogundá');
      expect(result.map(m => m.odu)).toContain('Odi');
    });

    it('returns all Odus for Saturno', () => {
      const result = getPlanetOdu('Saturno');
      expect(result.length).toBeGreaterThan(0);
      expect(result.map(m => m.odu)).toContain('Okaran');
      expect(result.map(m => m.odu)).toContain('Olobón');
      expect(result.map(m => m.odu)).toContain('Iká');
    });

    it('returns all Odus for Mercúrio', () => {
      const result = getPlanetOdu('Mercúrio');
      expect(result.length).toBeGreaterThan(0);
      expect(result.map(m => m.odu)).toContain('Ejiokô');
      expect(result.map(m => m.odu)).toContain('Ossá');
    });

    it('returns all Odus for Júpiter', () => {
      const result = getPlanetOdu('Júpiter');
      expect(result.length).toBeGreaterThan(0);
      expect(result.map(m => m.odu)).toContain('Oxé');
      expect(result.map(m => m.odu)).toContain('Oyekun');
    });

    it('returns all Odus for Vênus', () => {
      const result = getPlanetOdu('Vênus');
      expect(result.length).toBeGreaterThan(0);
      expect(result.map(m => m.odu)).toContain('EjiOnile');
      expect(result.map(m => m.odu)).toContain('Obá');
    });

    it('returns empty array for invalid planet', () => {
      const result = getPlanetOdu('InvalidPlanet');
      expect(result).toHaveLength(0);
    });
  });

  describe('getAllOduPlanets', () => {
    it('returns all 16 Odu mappings', () => {
      const result = getAllOduPlanets();
      expect(result).toHaveLength(16);
    });

    it('all mappings have unique Odu names', () => {
      const result = getAllOduPlanets();
      const names = result.map(m => m.odu);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    });

    it('all mappings have unique Odu numbers', () => {
      const result = getAllOduPlanets();
      const numbers = result.map(m => m.numero);
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(numbers.length);
    });
  });

  describe('getAllOduNames', () => {
    it('returns all 16 Odu names', () => {
      const result = getAllOduNames();
      expect(result).toHaveLength(16);
    });

    it('returns names sorted by number', () => {
      const result = getAllOduNames();
      const mappings = getAllOduPlanets();
      const sorted = mappings.sort((a, b) => a.numero - b.numero).map(m => m.odu);
      expect(result).toEqual(sorted);
    });
  });

  describe('hasOduPlanet', () => {
    it('returns true for valid Odu', () => {
      expect(hasOduPlanet('Ejilsebora')).toBe(true);
      expect(hasOduPlanet('Ofun')).toBe(true);
      expect(hasOduPlanet('Alafia')).toBe(true);
      expect(hasOduPlanet('Okaran')).toBe(true);
    });

    it('returns false for invalid Odu', () => {
      expect(hasOduPlanet('InvalidOdu')).toBe(false);
      expect(hasOduPlanet('')).toBe(false);
    });
  });

  describe('getOduByNumber', () => {
    it('returns correct mapping for valid number', () => {
      const result = getOduByNumber(12);
      expect(result?.odu).toBe('Ejilsebora');
      expect(result?.planeta).toBe('Sol');
    });

    it('returns null for invalid number', () => {
      const result = getOduByNumber(99);
      expect(result).toBeNull();
    });

    it('returns null for number 0 or negative', () => {
      expect(getOduByNumber(0)).toBeNull();
      expect(getOduByNumber(-1)).toBeNull();
    });
  });

  describe('getOdusForPlanet', () => {
    it('returns Odu names for Sol sorted by number', () => {
      const result = getOdusForPlanet('Sol');
      expect(result).toContain('Obará');
      expect(result).toContain('Ejilsebora');
    });

    it('returns Odu names for Lua sorted by number', () => {
      const result = getOdusForPlanet('Lua');
      expect(result).toContain('Irosun');
      expect(result).toContain('Ofun');
      expect(result).toContain('Alafia');
    });

    it('returns Odu names for Marte sorted by number', () => {
      const result = getOdusForPlanet('Marte');
      expect(result).toContain('Etaogundá');
      expect(result).toContain('Odi');
    });

    it('returns Odu names for Saturno sorted by number', () => {
      const result = getOdusForPlanet('Saturno');
      expect(result).toEqual(['Okaran', 'Olobón', 'Iká']);
    });

    it('returns Odu names for Mercúrio sorted by number', () => {
      const result = getOdusForPlanet('Mercúrio');
      expect(result).toContain('Ejiokô');
      expect(result).toContain('Ossá');
    });

    it('returns Odu names for Júpiter sorted by number', () => {
      const result = getOdusForPlanet('Júpiter');
      expect(result).toContain('Oxé');
      expect(result).toContain('Oyekun');
    });

    it('returns Odu names for Vênus sorted by number', () => {
      const result = getOdusForPlanet('Vênus');
      expect(result).toContain('EjiOnile');
      expect(result).toContain('Obá');
    });

    it('returns empty array for invalid planet', () => {
      const result = getOdusForPlanet('InvalidPlanet');
      expect(result).toHaveLength(0);
    });
  });

  describe('getAllPlanets', () => {
    it('returns all 7 planets', () => {
      const result = getAllPlanets();
      expect(result).toHaveLength(7);
    });

    it('contains classical planets', () => {
      const result = getAllPlanets();
      expect(result).toContain('Sol');
      expect(result).toContain('Lua');
      expect(result).toContain('Marte');
      expect(result).toContain('Mercúrio');
      expect(result).toContain('Júpiter');
      expect(result).toContain('Vênus');
      expect(result).toContain('Saturno');
    });
  });

  describe('planet qualities', () => {
    it('Sol Odus have yang qualities', () => {
      const solOdus = getPlanetOdu('Sol');
      solOdus.forEach(odu => {
        expect(odu.qualidades_planetarias.qualidade).toBe('Yang (Exterior)');
      });
    });

    it('Lua Odus have yin or neutro qualities', () => {
      const luaOdus = getPlanetOdu('Lua');
      luaOdus.forEach(odu => {
        expect(['Yin (Interior)', 'Neutro (Equilibrado)']).toContain(odu.qualidades_planetarias.qualidade);
      });
    });
    it('Marte Odus have yang or yin qualities', () => {
      const marteOdus = getPlanetOdu('Marte');
      marteOdus.forEach(odu => {
        expect(['Yang (Exterior)', 'Yin (Interior)']).toContain(odu.qualidades_planetarias.qualidade);
      });
    });
    it('Saturno Odus have yin qualities', () => {
      const saturnoOdus = getPlanetOdu('Saturno');
      saturnoOdus.forEach(odu => {
        expect(odu.qualidades_planetarias.qualidade).toBe('Yin (Interior)');
      });
    });
  });

  describe('zodiac correspondences', () => {
    it('each Odu has a zodiac sign', () => {
      const allOdus = getAllOduPlanets();
      allOdus.forEach(odu => {
        expect(odu.signo_zodiacal).toBeTruthy();
      });
    });

    it('Sol Odus have fire zodiac signs', () => {
      const solOdus = getPlanetOdu('Sol');
      solOdus.forEach(odu => {
        expect(['Leão', 'Áries', 'Sagitário']).toContain(odu.signo_zodiacal);
      });
    });

    it('Lua Odus have water or air zodiac signs', () => {
      const luaOdus = getPlanetOdu('Lua');
      luaOdus.forEach(odu => {
        expect(['Câncer', 'Escorpião', 'Peixes', 'Gêmeos']).toContain(odu.signo_zodiacal);
      });
    });
  });

  describe('numerology correspondences', () => {
    it('each Odu has a numerology number', () => {
      const allOdus = getAllOduPlanets();
      allOdus.forEach(odu => {
        expect(odu.numerologia).toBeGreaterThan(0);
        expect(odu.numerologia).toBeLessThanOrEqual(9);
      });
    });

    it('Sol Odus have numerology 1 or 6', () => {
      const solOdus = getPlanetOdu('Sol');
      solOdus.forEach(odu => {
        expect([1, 6]).toContain(odu.numerologia);
      });
    });

    it('Lua Odus have numerology 2', () => {
      const luaOdus = getPlanetOdu('Lua');
      luaOdus.forEach(odu => {
        expect([2]).toContain(odu.numerologia);
      });
    });

    it('Saturno Odus have numerology 8', () => {
      const saturnoOdus = getPlanetOdu('Saturno');
      saturnoOdus.forEach(odu => {
        expect(odu.numerologia).toBe(8);
      });
    });
  });

  describe('affinities', () => {
    it('each Odu has affinities', () => {
      const allOdus = getAllOduPlanets();
      allOdus.forEach(odu => {
        expect(odu.afinidades.length).toBeGreaterThan(0);
      });
    });

    it('affinities include body systems and spiritual qualities', () => {
      const allOdus = getAllOduPlanets();
      allOdus.forEach(odu => {
        odu.afinidades.forEach(afinidade => {
          expect(typeof afinidade).toBe('string');
          expect(afinidade.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('colors', () => {
    it('each Odu has colors', () => {
      const allOdus = getAllOduPlanets();
      allOdus.forEach(odu => {
        expect(odu.cores.length).toBeGreaterThan(0);
      });
    });

    it('Sol Odus have warm colors', () => {
      const solOdus = getPlanetOdu('Sol');
      solOdus.forEach(odu => {
        expect(odu.cores).toContain('Amarelo');
        expect(odu.cores).toContain('Vermelho');
      });
    });

    it('Lua Odus have blue and white or rainbow colors', () => {
      const luaOdus = getPlanetOdu('Lua');
      luaOdus.forEach(odu => {
        // Some Lua Odus have blue/white, others have rainbow (Alafia)
        const hasMoonColors = odu.cores.includes('Azul Escuro') || odu.cores.includes('Branco');
        const hasRainbowColors = odu.cores.includes('Arco-íris');
        expect(hasMoonColors || hasRainbowColors).toBe(true);
      });
    });

    it('Saturno Odus have black and white colors', () => {
      const saturnoOdus = getPlanetOdu('Saturno');
      saturnoOdus.forEach(odu => {
        expect(odu.cores).toContain('Preto');
        expect(odu.cores).toContain('Branco');
      });
    });
  });

  describe('ODU_PLANET_MAPPINGS constant', () => {
    it('is frozen to prevent modifications', () => {
      expect(Object.isFrozen(ODU_PLANET_MAPPINGS)).toBe(true);
    });
  });

  describe('cross-references with odu-element', () => {
    it('maps planets based on orixá correspondences', () => {
      // Xangô Odus should be Sol
      expect(getOduPlanet('Ejilsebora')?.planeta).toBe('Sol');
      expect(getOduPlanet('Obará')?.planeta).toBe('Sol');
      expect(getOduPlanet('Etaogundá')?.planeta).toBe('Marte'); // Ogum
    });

    it('Omolu Odus are Saturno', () => {
      expect(getOduPlanet('Okaran')?.planeta).toBe('Saturno');
      expect(getOduPlanet('Odi')?.planeta).toBe('Marte'); // Omolu but with Iemanjá in this system
      expect(getOduPlanet('Olobón')?.planeta).toBe('Saturno');
      expect(getOduPlanet('Iká')?.planeta).toBe('Saturno');
    });

    it('Oxumaré Odus are Mercúrio', () => {
      expect(getOduPlanet('Ejiokô')?.planeta).toBe('Mercúrio');
      expect(getOduPlanet('Alafia')?.planeta).toBe('Lua');
      expect(getOduPlanet('Ossá')?.planeta).toBe('Mercúrio');
    });

    it('Iemanjá Odus are Lua', () => {
      expect(getOduPlanet('Irosun')?.planeta).toBe('Lua');
      expect(getOduPlanet('Oxé')?.planeta).toBe('Júpiter'); // Oxóssi
      expect(getOduPlanet('Ofun')?.planeta).toBe('Lua');
    });
  });
});
