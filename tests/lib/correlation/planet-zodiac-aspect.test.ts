import { describe, it, expect } from 'vitest';
import {
  getPlanetZodiacAspect,
  getPlanetZodiacAspectByPlanet,
  getPlanetZodiacAspectBySign,
  getPlanetZodiacAspectByAspect,
  getByDignidade,
  getByElemento,
  getByAspectNature,
  getPlanetDignity,
  getPlanetInSign,
  getAllPlanets,
  getAllSigns,
  getAllAspects,
  getSignElement,
  getSignQuality,
  getTotalMappings,
  hasPlanetZodiacAspect,
} from '@/lib/correlation/planet-zodiac-aspect';

describe('correlation/planet-zodiac-aspect', () => {
  describe('getPlanetZodiacAspect', () => {
    it('returns mapping for Sol in Leão with conjunção', () => {
      const mapping = getPlanetZodiacAspect('Sol', 'Leão', 'conjunção');
      expect(mapping).toBeDefined();
      expect(mapping?.planeta).toBe('Sol');
      expect(mapping?.signo).toBe('Leão');
      expect(mapping?.aspecto).toBe('conjunção');
      expect(mapping?.dignidade).toBe('domicilio');
      expect(mapping?.elemento).toBe('fogo');
      expect(mapping?.qualidade).toBe('fixed');
    });

    it('returns mapping for Lua in Touro with trino', () => {
      const mapping = getPlanetZodiacAspect('Lua', 'Touro', 'trino');
      expect(mapping).toBeDefined();
      expect(mapping?.planeta).toBe('Lua');
      expect(mapping?.signo).toBe('Touro');
      expect(mapping?.aspecto).toBe('trino');
      expect(mapping?.dignidade).toBe('exaltação');
      expect(mapping?.elemento).toBe('terra');
    });

    it('returns mapping for Marte in Áries with oposição', () => {
      const mapping = getPlanetZodiacAspect('Marte', 'Áries', 'oposição');
      expect(mapping).toBeDefined();
      expect(mapping?.planeta).toBe('Marte');
      expect(mapping?.signo).toBe('Áries');
      expect(mapping?.aspecto).toBe('oposição');
      expect(mapping?.dignidade).toBe('domicilio');
      expect(mapping?.natureza_aspecto).toBe('tensional');
    });

    it('returns null for unknown planet', () => {
      expect(getPlanetZodiacAspect('Unknown', 'Leão', 'conjunção')).toBeNull();
    });

    it('returns null for unknown sign', () => {
      expect(getPlanetZodiacAspect('Sol', 'Unknown', 'conjunção')).toBeNull();
    });

    it('returns null for unknown aspect', () => {
      expect(getPlanetZodiacAspect('Sol', 'Leão', 'unknown')).toBeNull();
    });

    it('includes spiritual interpretation', () => {
      const mapping = getPlanetZodiacAspect('Júpiter', 'Sagitário', 'trino');
      expect(mapping?.interpretação).toBeTruthy();
      expect(mapping?.significado_espiritual).toBeTruthy();
    });

    it('includes aspect symbol', () => {
      const mapping = getPlanetZodiacAspect('Saturno', 'Capricórnio', 'conjunção');
      expect(mapping?.símbolo_aspecto).toBe('☌');
    });
  });

  describe('getByDignidade', () => {
    it('returns mappings for domicilio dignity', () => {
      const mappings = getByDignidade('domicilio');
      expect(mappings.length).toBeGreaterThan(0);
      for (const m of mappings) {
        expect(m.dignidade).toBe('domicilio');
      }
    });

    it('returns mappings for exaltação dignity', () => {
      const mappings = getByDignidade('exaltação');
      expect(mappings.length).toBeGreaterThan(0);
      for (const m of mappings) {
        expect(m.dignidade).toBe('exaltação');
      }
    });

    it('returns mappings for queda dignity', () => {
      const mappings = getByDignidade('queda');
      expect(mappings.length).toBeGreaterThan(0);
      for (const m of mappings) {
        expect(m.dignidade).toBe('queda');
      }
    });

    it('returns mappings for exilio dignity', () => {
      const mappings = getByDignidade('exilio');
      expect(mappings.length).toBeGreaterThan(0);
      for (const m of mappings) {
        expect(m.dignidade).toBe('exilio');
      }
    });

    it('returns mappings for nenhuma dignity', () => {
      const mappings = getByDignidade('nenhuma');
      expect(mappings.length).toBeGreaterThan(0);
      for (const m of mappings) {
        expect(m.dignidade).toBe('nenhuma');
      }
    });
  });

  describe('getByElemento', () => {
    it('returns fogo element mappings', () => {
      const mappings = getByElemento('fogo');
      expect(mappings.length).toBeGreaterThan(0);
      for (const m of mappings) {
        expect(m.elemento).toBe('fogo');
      }
    });

    it('returns terra element mappings', () => {
      const mappings = getByElemento('terra');
      expect(mappings.length).toBeGreaterThan(0);
      for (const m of mappings) {
        expect(m.elemento).toBe('terra');
      }
    });

    it('returns ar element mappings', () => {
      const mappings = getByElemento('ar');
      expect(mappings.length).toBeGreaterThan(0);
      for (const m of mappings) {
        expect(m.elemento).toBe('ar');
      }
    });

    it('returns água element mappings', () => {
      const mappings = getByElemento('água');
      expect(mappings.length).toBeGreaterThan(0);
      for (const m of mappings) {
        expect(m.elemento).toBe('água');
      }
    });
  });

  describe('getByAspectNature', () => {
    it('returns harmonioso aspect mappings', () => {
      const mappings = getByAspectNature('harmonioso');
      expect(mappings.length).toBeGreaterThan(0);
      for (const m of mappings) {
        expect(m.natureza_aspecto).toBe('harmonioso');
      }
    });

    it('returns tensional aspect mappings', () => {
      const mappings = getByAspectNature('tensional');
      expect(mappings.length).toBeGreaterThan(0);
      for (const m of mappings) {
        expect(m.natureza_aspecto).toBe('tensional');
      }
    });

    it('returns neutro aspect mappings', () => {
      const mappings = getByAspectNature('neutro');
      expect(mappings.length).toBeGreaterThan(0);
      for (const m of mappings) {
        expect(m.natureza_aspecto).toBe('neutro');
      }
    });
  });

  describe('getPlanetZodiacAspectByPlanet', () => {
    it('returns all mappings for Sol', () => {
      const mappings = getPlanetZodiacAspectByPlanet('Sol');
      expect(mappings.length).toBe(60); // 12 signs × 5 aspects
      expect(mappings.every(m => m.planeta === 'Sol')).toBe(true);
    });

    it('returns empty for unknown planet', () => {
      const mappings = getPlanetZodiacAspectByPlanet('Unknown');
      expect(mappings.length).toBe(0);
    });
  });

  describe('getPlanetZodiacAspectBySign', () => {
    it('returns all mappings for Leão', () => {
      const mappings = getPlanetZodiacAspectBySign('Leão');
      expect(mappings.length).toBe(35); // 7 planets × 5 aspects
      expect(mappings.every(m => m.signo === 'Leão')).toBe(true);
    });

    it('returns empty for unknown sign', () => {
      const mappings = getPlanetZodiacAspectBySign('Unknown');
      expect(mappings.length).toBe(0);
    });
  });

  describe('getPlanetZodiacAspectByAspect', () => {
    it('returns all mappings for trino', () => {
      const mappings = getPlanetZodiacAspectByAspect('trino');
      expect(mappings.length).toBe(84); // 7 planets × 12 signs
      expect(mappings.every(m => m.aspecto === 'trino')).toBe(true);
    });

    it('returns all mappings for conjunção', () => {
      const mappings = getPlanetZodiacAspectByAspect('conjunção');
      expect(mappings.length).toBe(84);
      expect(mappings.every(m => m.aspecto === 'conjunção')).toBe(true);
    });

    it('returns all mappings for quadratura', () => {
      const mappings = getPlanetZodiacAspectByAspect('quadratura');
      expect(mappings.length).toBe(84);
      expect(mappings.every(m => m.aspecto === 'quadratura')).toBe(true);
    });

    it('returns all mappings for sextil', () => {
      const mappings = getPlanetZodiacAspectByAspect('sextil');
      expect(mappings.length).toBe(84);
      expect(mappings.every(m => m.aspecto === 'sextil')).toBe(true);
    });

    it('returns all mappings for oposição', () => {
      const mappings = getPlanetZodiacAspectByAspect('oposição');
      expect(mappings.length).toBe(84);
      expect(mappings.every(m => m.aspecto === 'oposição')).toBe(true);
    });
  });

  describe('getPlanetDignity', () => {
    it('returns dignity info for all planets', () => {
      const dignities = getPlanetDignity();
      expect(Object.keys(dignities).length).toBe(28); // 7 planets × 4 dignity types

      expect(dignities['Sol_domicilio']).toEqual({ tipo: 'domicilio', signo: 'Leão' });
      expect(dignities['Lua_exaltação']).toEqual({ tipo: 'exaltação', signo: 'Touro' });
      expect(dignities['Marte_domicilio']).toEqual({ tipo: 'domicilio', signo: 'Áries' });
      expect(dignities['Saturno_exilio']).toEqual({ tipo: 'exilio', signo: 'Câncer' });
    });
  });

  describe('getPlanetInSign', () => {
    it('returns domicilio for Sol in Leão', () => {
      expect(getPlanetInSign('Sol', 'Leão')).toBe('domicilio');
    });

    it('returns exaltação for Lua in Touro', () => {
      expect(getPlanetInSign('Lua', 'Touro')).toBe('exaltação');
    });

    it('returns queda for Marte in Câncer', () => {
      expect(getPlanetInSign('Marte', 'Câncer')).toBe('queda');
    });

    it('returns null for neutral position', () => {
      expect(getPlanetInSign('Sol', 'Gêmeos')).toBeNull();
    });

    it('returns null for unknown planet', () => {
      expect(getPlanetInSign('Unknown', 'Leão')).toBeNull();
    });
  });

  describe('getAllPlanets', () => {
    it('returns all 7 classical planets', () => {
      const planets = getAllPlanets();
      expect(planets).toContain('Sol');
      expect(planets).toContain('Lua');
      expect(planets).toContain('Mercúrio');
      expect(planets).toContain('Vênus');
      expect(planets).toContain('Marte');
      expect(planets).toContain('Júpiter');
      expect(planets).toContain('Saturno');
      expect(planets.length).toBe(7);
    });
  });

  describe('getAllSigns', () => {
    it('returns all 12 zodiac signs', () => {
      const signs = getAllSigns();
      expect(signs).toContain('Áries');
      expect(signs).toContain('Touro');
      expect(signs).toContain('Gêmeos');
      expect(signs).toContain('Câncer');
      expect(signs).toContain('Leão');
      expect(signs).toContain('Virgem');
      expect(signs).toContain('Libra');
      expect(signs).toContain('Escorpião');
      expect(signs).toContain('Sagitário');
      expect(signs).toContain('Capricórnio');
      expect(signs).toContain('Aquário');
      expect(signs).toContain('Peixes');
      expect(signs.length).toBe(12);
    });
  });

  describe('getAllAspects', () => {
    it('returns all 5 classical aspects', () => {
      const aspects = getAllAspects();
      expect(aspects).toContain('conjunção');
      expect(aspects).toContain('sextil');
      expect(aspects).toContain('quadratura');
      expect(aspects).toContain('trino');
      expect(aspects).toContain('oposição');
      expect(aspects.length).toBe(5);
    });
  });

  describe('getSignElement', () => {
    it('returns fogo for fire signs', () => {
      expect(getSignElement('Áries')).toBe('fogo');
      expect(getSignElement('Leão')).toBe('fogo');
      expect(getSignElement('Sagitário')).toBe('fogo');
    });

    it('returns terra for earth signs', () => {
      expect(getSignElement('Touro')).toBe('terra');
      expect(getSignElement('Virgem')).toBe('terra');
      expect(getSignElement('Capricórnio')).toBe('terra');
    });

    it('returns ar for air signs', () => {
      expect(getSignElement('Gêmeos')).toBe('ar');
      expect(getSignElement('Libra')).toBe('ar');
      expect(getSignElement('Aquário')).toBe('ar');
    });

    it('returns água for water signs', () => {
      expect(getSignElement('Câncer')).toBe('água');
      expect(getSignElement('Escorpião')).toBe('água');
      expect(getSignElement('Peixes')).toBe('água');
    });

    it('returns null for unknown sign', () => {
      expect(getSignElement('Unknown')).toBeNull();
    });
  });

  describe('getSignQuality', () => {
    it('returns cardinal for cardinal signs', () => {
      expect(getSignQuality('Áries')).toBe('cardinal');
      expect(getSignQuality('Câncer')).toBe('cardinal');
      expect(getSignQuality('Libra')).toBe('cardinal');
      expect(getSignQuality('Capricórnio')).toBe('cardinal');
    });

    it('returns fixed for fixed signs', () => {
      expect(getSignQuality('Leão')).toBe('fixed');
      expect(getSignQuality('Escorpião')).toBe('fixed');
      expect(getSignQuality('Touro')).toBe('fixed');
      expect(getSignQuality('Aquário')).toBe('fixed');
    });

    it('returns mutable for mutable signs', () => {
      expect(getSignQuality('Gêmeos')).toBe('mutable');
      expect(getSignQuality('Virgem')).toBe('mutable');
      expect(getSignQuality('Sagitário')).toBe('mutable');
      expect(getSignQuality('Peixes')).toBe('mutable');
    });

    it('returns null for unknown sign', () => {
      expect(getSignQuality('Unknown')).toBeNull();
    });
  });

  describe('getTotalMappings', () => {
    it('returns total count of 420 mappings', () => {
      expect(getTotalMappings()).toBe(420); // 7 planets × 12 signs × 5 aspects
    });
  });

  describe('hasPlanetZodiacAspect', () => {
    it('returns true for valid combinations', () => {
      expect(hasPlanetZodiacAspect('Sol', 'Leão', 'trino')).toBe(true);
      expect(hasPlanetZodiacAspect('Lua', 'Câncer', 'conjunção')).toBe(true);
      expect(hasPlanetZodiacAspect('Saturno', 'Aquário', 'oposição')).toBe(true);
    });

    it('returns false for invalid combinations', () => {
      expect(hasPlanetZodiacAspect('Unknown', 'Leão', 'trino')).toBe(false);
      expect(hasPlanetZodiacAspect('Sol', 'Unknown', 'trino')).toBe(false);
      expect(hasPlanetZodiacAspect('Sol', 'Leão', 'unknown')).toBe(false);
    });
  });

  describe('quality mapping integrity', () => {
    const planets = getAllPlanets();
    const signs = getAllSigns();

    for (const planeta of planets) {
      for (const signo of signs) {
        it(`${planeta} in ${signo} has valid quality`, () => {
          const mappings = getPlanetZodiacAspectByPlanet(planeta).filter(m => m.signo === signo);
          expect(mappings.length).toBe(5); // 5 aspects per planet-sign combo
          for (const m of mappings) {
            expect(['cardinal', 'fixed', 'mutable']).toContain(m.qualidade);
          }
        });
      }
    }
  });
});