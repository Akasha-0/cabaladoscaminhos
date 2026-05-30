/**
 * Planet-Day Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getPlanetDay,
  getDayPlanet,
  getAllPlanets,
  getPlanetsByElemento,
  getAllPlanetDays,
  getPlanetSpiritualMeaning,
  getElementByPlanet,
  getPlanetSymbol,
  getPlanetPractices,
  getPlanetHours,
  getPlanetProperties,
  type Planet,
  type PlanetDay,
} from '@/lib/correlation/planet-day';

describe('Planet-Day Correlation', () => {
  describe('getPlanetDay', () => {
    it('should return Sunday (Domingo) mapping for Sol', () => {
      const result = getPlanetDay('Sol');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Domingo');
      expect(result?.planeta).toBe('Sol');
      expect(result?.elemento).toBe('fogo');
    });

    it('should return Monday (Segunda-feira) mapping for Lua', () => {
      const result = getPlanetDay('Lua');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Segunda-feira');
      expect(result?.planeta).toBe('Lua');
      expect(result?.elemento).toBe('água');
    });

    it('should return Tuesday (Terça-feira) mapping for Marte', () => {
      const result = getPlanetDay('Marte');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Terça-feira');
      expect(result?.planeta).toBe('Marte');
      expect(result?.elemento).toBe('fogo');
    });

    it('should return Wednesday (Quarta-feira) mapping for Mercúrio', () => {
      const result = getPlanetDay('Mercúrio');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Quarta-feira');
      expect(result?.planeta).toBe('Mercúrio');
      expect(result?.elemento).toBe('ar');
    });

    it('should return Thursday (Quinta-feira) mapping for Júpiter', () => {
      const result = getPlanetDay('Júpiter');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Quinta-feira');
      expect(result?.planeta).toBe('Júpiter');
      expect(result?.elemento).toBe('fogo');
    });

    it('should return Friday (Sexta-feira) mapping for Vênus', () => {
      const result = getPlanetDay('Vênus');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Sexta-feira');
      expect(result?.planeta).toBe('Vênus');
      expect(result?.elemento).toBe('terra');
    });

    it('should return Saturday (Sábado) mapping for Saturno', () => {
      const result = getPlanetDay('Saturno');
      expect(result).toBeDefined();
      expect(result?.dia).toBe('Sábado');
      expect(result?.planeta).toBe('Saturno');
      expect(result?.elemento).toBe('terra');
    });

    it('should return undefined for invalid planet', () => {
      const result = getPlanetDay('Plutão');
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const result = getPlanetDay('');
      expect(result).toBeUndefined();
    });

    it('should include all required interface properties', () => {
      const result = getPlanetDay('Sol');
      expect(result).toHaveProperty('planeta');
      expect(result).toHaveProperty('dia');
      expect(result).toHaveProperty('indice');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('qualidade');
      expect(result).toHaveProperty('cor');
      expect(result).toHaveProperty('direcao');
      expect(result).toHaveProperty('estacao');
      expect(result).toHaveProperty('chakra');
      expect(result).toHaveProperty('simbolo');
      expect(result).toHaveProperty('propriedades');
      expect(result).toHaveProperty('mystere');
      expect(result).toHaveProperty('significado_espiritual');
      expect(result).toHaveProperty('praticas_espirituais');
      expect(result).toHaveProperty('horas_planetarias');
    });

    it('should have valid element values (fogo, água, ar, terra)', () => {
      const planets = ['Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno'];
      const validElements = ['fogo', 'água', 'ar', 'terra'];
      planets.forEach(planet => {
        const result = getPlanetDay(planet);
        expect(result?.elemento).toBeOneOf(validElements);
      });
    });

    it('should have valid quality values (cardinal, fixed, mutable)', () => {
      const planets = ['Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno'];
      const validQualities = ['cardinal', 'fixed', 'mutable'];
      planets.forEach(planet => {
        const result = getPlanetDay(planet);
        expect(result?.qualidade).toBeOneOf(validQualities);
      });
    });

    it('should have properties with forca, palavras_chave, and desafios', () => {
      const result = getPlanetDay('Sol');
      expect(result?.propriedades).toHaveProperty('forca');
      expect(result?.propriedades).toHaveProperty('palavras_chave');
      expect(result?.propriedades).toHaveProperty('desafios');
      expect(result?.propriedades.palavras_chave).toBeInstanceOf(Array);
      expect(result?.propriedades.desafios).toBeInstanceOf(Array);
    });

    it('should have horas_planetarias with proper structure', () => {
      const result = getPlanetDay('Sol');
      expect(result?.horas_planetarias).toHaveProperty('primeira_hora');
      expect(result?.horas_planetarias).toHaveProperty('ultima_hora');
      expect(result?.horas_planetarias).toHaveProperty('horas_favoraveis');
      expect(result?.horas_planetarias).toHaveProperty('horas_desfavoraveis');
      expect(result?.horas_planetarias.horas_favoraveis).toBeInstanceOf(Array);
      expect(result?.horas_planetarias.horas_desfavoraveis).toBeInstanceOf(Array);
    });
  });

  describe('getDayPlanet', () => {
    it('should return Sol for Domingo', () => {
      const result = getDayPlanet('Domingo');
      expect(result).toBe('Sol');
    });

    it('should return Lua for Segunda-feira', () => {
      const result = getDayPlanet('Segunda-feira');
      expect(result).toBe('Lua');
    });

    it('should return Marte for Terça-feira', () => {
      const result = getDayPlanet('Terça-feira');
      expect(result).toBe('Marte');
    });

    it('should return Mercúrio for Quarta-feira', () => {
      const result = getDayPlanet('Quarta-feira');
      expect(result).toBe('Mercúrio');
    });

    it('should return Júpiter for Quinta-feira', () => {
      const result = getDayPlanet('Quinta-feira');
      expect(result).toBe('Júpiter');
    });

    it('should return Vênus for Sexta-feira', () => {
      const result = getDayPlanet('Sexta-feira');
      expect(result).toBe('Vênus');
    });

    it('should return Saturno for Sábado', () => {
      const result = getDayPlanet('Sábado');
      expect(result).toBe('Saturno');
    });

    it('should return undefined for invalid day', () => {
      const result = getDayPlanet('Dia inexistente');
      expect(result).toBeUndefined();
    });
  });

  describe('getAllPlanets', () => {
    it('should return all 7 planets', () => {
      const result = getAllPlanets();
      expect(result).toHaveLength(7);
      expect(result).toContain('Sol');
      expect(result).toContain('Lua');
      expect(result).toContain('Marte');
      expect(result).toContain('Mercúrio');
      expect(result).toContain('Júpiter');
      expect(result).toContain('Vênus');
      expect(result).toContain('Saturno');
    });

    it('should return array of Planet type', () => {
      const result = getAllPlanets();
      expect(result).toBeInstanceOf(Array);
      result.forEach(p => {
        expect(['Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno']).toContain(p);
      });
    });
  });

  describe('getPlanetsByElemento', () => {
    it('should return Sol, Marte, Júpiter for fogo', () => {
      const result = getPlanetsByElemento('fogo');
      expect(result).toContain('Sol');
      expect(result).toContain('Marte');
      expect(result).toContain('Júpiter');
    });

    it('should return Lua for água', () => {
      const result = getPlanetsByElemento('água');
      expect(result).toContain('Lua');
    });

    it('should return Mercúrio for ar', () => {
      const result = getPlanetsByElemento('ar');
      expect(result).toContain('Mercúrio');
    });

    it('should return Vênus, Saturno for terra', () => {
      const result = getPlanetsByElemento('terra');
      expect(result).toContain('Vênus');
      expect(result).toContain('Saturno');
    });

    it('should return empty array for invalid element', () => {
      const result = getPlanetsByElemento('éter');
      expect(result).toHaveLength(0);
    });
  });

  describe('getAllPlanetDays', () => {
    it('should return all 7 planet-day mappings', () => {
      const result = getAllPlanetDays();
      expect(result).toHaveLength(7);
    });

    it('should return array of PlanetDay objects', () => {
      const result = getAllPlanetDays();
      result.forEach(planetDay => {
        expect(planetDay).toHaveProperty('planeta');
        expect(planetDay).toHaveProperty('dia');
        expect(planetDay).toHaveProperty('elemento');
        expect(planetDay).toHaveProperty('significado_espiritual');
      });
    });

    it('should contain each day of the week exactly once', () => {
      const result = getAllPlanetDays();
      const days = result.map(r => r.dia);
      expect(days).toContain('Domingo');
      expect(days).toContain('Segunda-feira');
      expect(days).toContain('Terça-feira');
      expect(days).toContain('Quarta-feira');
      expect(days).toContain('Quinta-feira');
      expect(days).toContain('Sexta-feira');
      expect(days).toContain('Sábado');
    });
  });

  describe('getPlanetSpiritualMeaning', () => {
    it('should return spiritual meaning for Sol', () => {
      const result = getPlanetSpiritualMeaning('Sol');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should return undefined for invalid planet', () => {
      const result = getPlanetSpiritualMeaning('Netuno');
      expect(result).toBeUndefined();
    });
  });

  describe('getElementByPlanet', () => {
    it('should return fogo for Sol', () => {
      const result = getElementByPlanet('Sol');
      expect(result).toBe('fogo');
    });

    it('should return água for Lua', () => {
      const result = getElementByPlanet('Lua');
      expect(result).toBe('água');
    });

    it('should return undefined for invalid planet', () => {
      const result = getElementByPlanet('Plutão');
      expect(result).toBeUndefined();
    });
  });

  describe('getPlanetSymbol', () => {
    it('should return symbol for Sol', () => {
      const result = getPlanetSymbol('Sol');
      expect(result).toBe('☉');
    });

    it('should return symbol for Lua', () => {
      const result = getPlanetSymbol('Lua');
      expect(result).toBe('☽');
    });

    it('should return undefined for invalid planet', () => {
      const result = getPlanetSymbol('Urano');
      expect(result).toBeUndefined();
    });
  });

  describe('getPlanetPractices', () => {
    it('should return practices for Sol', () => {
      const result = getPlanetPractices('Sol');
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should return undefined for invalid planet', () => {
      const result = getPlanetPractices('Netuno');
      expect(result).toBeUndefined();
    });
  });

  describe('getPlanetHours', () => {
    it('should return planetary hours for Sol', () => {
      const result = getPlanetHours('Sol');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('primeira_hora');
      expect(result).toHaveProperty('ultima_hora');
      expect(result).toHaveProperty('horas_favoraveis');
      expect(result).toHaveProperty('horas_desfavoraveis');
    });

    it('should return undefined for invalid planet', () => {
      const result = getPlanetHours('Plutão');
      expect(result).toBeUndefined();
    });
  });

  describe('getPlanetProperties', () => {
    it('should return properties for Sol', () => {
      const result = getPlanetProperties('Sol');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('forca');
      expect(result).toHaveProperty('palavras_chave');
      expect(result).toHaveProperty('desafios');
    });

    it('should return undefined for invalid planet', () => {
      const result = getPlanetProperties('Netuno');
      expect(result).toBeUndefined();
    });
  });
});