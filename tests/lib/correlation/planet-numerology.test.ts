import { describe, it, expect } from 'vitest';
/**
 * Planet-Numerology Correlation Tests
 */

import {
  getPlanetNumerology,
  getNumerologyPlanet,
  getAllPlanetNumerologies,
} from '@/lib/correlation/planet-numerology';

describe('Planet-Numerology Correlation', () => {
  describe('getPlanetNumerology', () => {
    it('should return Sol mapping with number 1 (Yang/Expressivo)', () => {
      const result = getPlanetNumerology('Sol');
      expect(result).toBeDefined();
      expect(result!.planeta).toBe('Sol');
      expect(result!.numero).toBe(1);
      expect(result!.elemento).toBe('Fogo');
      expect(result!.qualidade_numerologica).toBe('Yang (Expressivo)');
      expect(result!.area_vida).toBe('Identidade e Propósito');
    });

    it('should return Lua mapping with number 2 (Yin/Receptivo)', () => {
      const result = getPlanetNumerology('Lua');
      expect(result).toBeDefined();
      expect(result!.planeta).toBe('Lua');
      expect(result!.numero).toBe(2);
      expect(result!.elemento).toBe('Água');
      expect(result!.qualidade_numerologica).toBe('Yin (Receptivo)');
      expect(result!.area_vida).toBe('Emocionalidade e Intuição');
    });

    it('should return Marte mapping with number 9 (Yang/Expressivo)', () => {
      const result = getPlanetNumerology('Marte');
      expect(result).toBeDefined();
      expect(result!.planeta).toBe('Marte');
      expect(result!.numero).toBe(9);
      expect(result!.elemento).toBe('Fogo');
      expect(result!.qualidade_numerologica).toBe('Yang (Expressivo)');
      expect(result!.area_vida).toBe('Ação e Transformação');
    });

    it('should return Mercurio mapping with number 5 (Neutro/Equilibrado)', () => {
      const result = getPlanetNumerology('Mercúrio');
      expect(result).toBeDefined();
      expect(result!.planeta).toBe('Mercúrio');
      expect(result!.numero).toBe(5);
      expect(result!.elemento).toBe('Ar');
      expect(result!.qualidade_numerologica).toBe('Neutro (Equilibrado)');
      expect(result!.area_vida).toBe('Comunicação e Mente');
    });

    it('should return Jupiter mapping with number 3 (Yang/Expressivo)', () => {
      const result = getPlanetNumerology('Júpiter');
      expect(result).toBeDefined();
      expect(result!.planeta).toBe('Júpiter');
      expect(result!.numero).toBe(3);
      expect(result!.elemento).toBe('Fogo');
      expect(result!.qualidade_numerologica).toBe('Yang (Expressivo)');
      expect(result!.area_vida).toBe('Abundância e Conhecimento');
    });

    it('should return Venus mapping with number 6 (Yin/Receptivo)', () => {
      const result = getPlanetNumerology('Vênus');
      expect(result).toBeDefined();
      expect(result!.planeta).toBe('Vênus');
      expect(result!.numero).toBe(6);
      expect(result!.elemento).toBe('Água');
      expect(result!.qualidade_numerologica).toBe('Yin (Receptivo)');
      expect(result!.area_vida).toBe('Amor e Harmonia');
    });

    it('should return Saturno mapping with number 8 (Yin/Receptivo)', () => {
      const result = getPlanetNumerology('Saturno');
      expect(result).toBeDefined();
      expect(result!.planeta).toBe('Saturno');
      expect(result!.numero).toBe(8);
      expect(result!.elemento).toBe('Terra');
      expect(result!.qualidade_numerologica).toBe('Yin (Receptivo)');
      expect(result!.area_vida).toBe('Disciplina e Realização');
    });

    it('should be case-insensitive', () => {
      expect(getPlanetNumerology('sol')?.numero).toBe(1);
      expect(getPlanetNumerology('LUA')?.numero).toBe(2);
      expect(getPlanetNumerology('MarTe')?.numero).toBe(9);
    });

    it('should accept accented variations', () => {
      expect(getPlanetNumerology('Mercúrio')?.numero).toBe(5);
      expect(getPlanetNumerology('Júpiter')?.numero).toBe(3);
      expect(getPlanetNumerology('Vênus')?.numero).toBe(6);
    });

    it('should return undefined for unknown planet', () => {
      expect(getPlanetNumerology('Netuno')).toBeUndefined();
      expect(getPlanetNumerology('Plutão')).toBeUndefined();
      expect(getPlanetNumerology('Urano')).toBeUndefined();
    });

    it('should include all required properties in returned object', () => {
      const result = getPlanetNumerology('Sol');
      expect(result).toHaveProperty('planeta');
      expect(result).toHaveProperty('numero');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('significado_espiritual');
      expect(result).toHaveProperty('qualidade_numerologica');
      expect(result).toHaveProperty('area_vida');
    });

    it('should include spiritual meaning description', () => {
      const result = getPlanetNumerology('Sol');
      expect(result!.significado_espiritual).toContain('Iniciação');
      expect(result!.significado_espiritual).toContain('propósito divino');
    });
  });

  describe('getNumerologyPlanet', () => {
    it('should return all planets grouped by numerology number', () => {
      const result = getNumerologyPlanet();
      expect(Object.keys(result)).toHaveLength(7); // 7 unique numbers
    });

    it('should map number 1 to Sol', () => {
      const result = getNumerologyPlanet();
      expect(result[1]).toContain('Sol');
    });

    it('should map number 2 to Lua', () => {
      const result = getNumerologyPlanet();
      expect(result[2]).toContain('Lua');
    });

    it('should map number 3 to Jupiter', () => {
      const result = getNumerologyPlanet();
      expect(result[3]).toContain('Júpiter');
    });

    it('should map number 5 to Mercurio', () => {
      const result = getNumerologyPlanet();
      expect(result[5]).toContain('Mercúrio');
    });

    it('should map number 6 to Venus', () => {
      const result = getNumerologyPlanet();
      expect(result[6]).toContain('Vênus');
    });

    it('should map number 8 to Saturno', () => {
      const result = getNumerologyPlanet();
      expect(result[8]).toContain('Saturno');
    });

    it('should map number 9 to Marte', () => {
      const result = getNumerologyPlanet();
      expect(result[9]).toContain('Marte');
    });

    it('should return arrays, not strings', () => {
      const result = getNumerologyPlanet();
      for (const planets of Object.values(result)) {
        expect(Array.isArray(planets)).toBe(true);
      }
    });
  });

  describe('getAllPlanetNumerologies', () => {
      expect(result).toHaveLength(7);
    });

    it('should include all expected planets', () => {
      const result = getAllPlanetNumerology();
      const planetNames = result.map(r => r.planeta);
      expect(planetNames).toContain('Sol');
      expect(planetNames).toContain('Lua');
      expect(planetNames).toContain('Marte');
      expect(planetNames).toContain('Mercúrio');
      expect(planetNames).toContain('Júpiter');
      expect(planetNames).toContain('Vênus');
      expect(planetNames).toContain('Saturno');
    });

    it('should return array of objects with all required properties', () => {
      const result = getAllPlanetNumerology();
      for (const mapping of result) {
        expect(mapping).toHaveProperty('planeta');
        expect(mapping).toHaveProperty('numero');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('qualidade_numerologica');
        expect(mapping).toHaveProperty('area_vida');
      }
    });

    it('should not modify the original data', () => {
      const result = getAllPlanetNumerology();
      const originalLength = result.length;
      result.push({} as any);
      expect(getAllPlanetNumerology()).toHaveLength(originalLength);
    });
  });

  describe('Element consistency with planet-chakra', () => {
    it('should have Sol with Fogo element', () => {
      const result = getPlanetNumerology('Sol');
      expect(result!.elemento).toBe('Fogo');
    });

    it('should have Lua with Água element', () => {
      const result = getPlanetNumerology('Lua');
      expect(result!.elemento).toBe('Água');
    });

    it('should have Marte with Fogo element', () => {
      const result = getPlanetNumerology('Marte');
      expect(result!.elemento).toBe('Fogo');
    });

    it('should have Mercurio with Ar element', () => {
      const result = getPlanetNumerology('Mercúrio');
      expect(result!.elemento).toBe('Ar');
    });

    it('should have Jupiter with Fogo element', () => {
      const result = getPlanetNumerology('Júpiter');
      expect(result!.elemento).toBe('Fogo');
    });

    it('should have Venus with Água element', () => {
      const result = getPlanetNumerology('Vênus');
      expect(result!.elemento).toBe('Água');
    });

    it('should have Saturno with Terra element', () => {
      const result = getPlanetNumerology('Saturno');
      expect(result!.elemento).toBe('Terra');
    });
  });

  describe('Numerology quality classification', () => {
    it('should classify Yang planets: Sol, Marte, Jupiter', () => {
      const yangPlanets = ['Sol', 'Marte', 'Júpiter'];
      for (const planet of yangPlanets) {
        const result = getPlanetNumerology(planet);
        expect(result!.qualidade_numerologica).toBe('Yang (Expressivo)');
      }
    });

    it('should classify Yin planets: Lua, Venus, Saturno', () => {
      const yinPlanets = ['Lua', 'Vênus', 'Saturno'];
      for (const planet of yinPlanets) {
        const result = getPlanetNumerology(planet);
        expect(result!.qualidade_numerologica).toBe('Yin (Receptivo)');
      }
    });

    it('should classify Neutro planet: Mercurio', () => {
      const result = getPlanetNumerology('Mercúrio');
      expect(result!.qualidade_numerologica).toBe('Neutro (Equilibrado)');
    });
  });

  describe('Life area assignments', () => {
    it('should assign correct life areas to each planet', () => {
      expect(getPlanetNumerology('Sol')!.area_vida).toBe('Identidade e Propósito');
      expect(getPlanetNumerology('Lua')!.area_vida).toBe('Emocionalidade e Intuição');
      expect(getPlanetNumerology('Marte')!.area_vida).toBe('Ação e Transformação');
      expect(getPlanetNumerology('Mercúrio')!.area_vida).toBe('Comunicação e Mente');
      expect(getPlanetNumerology('Júpiter')!.area_vida).toBe('Abundância e Conhecimento');
      expect(getPlanetNumerology('Vênus')!.area_vida).toBe('Amor e Harmonia');
      expect(getPlanetNumerology('Saturno')!.area_vida).toBe('Disciplina e Realização');
    });
  });
});
