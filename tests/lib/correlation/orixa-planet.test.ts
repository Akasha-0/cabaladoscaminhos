/**
 * Orixá-Planet Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getOrixaPlanet,
  getPlanetOrixa,
  getAllOrixaPlanets,
  type OrixaPlanet,
  type PlanetType,
  type ElementType,
} from '@/lib/correlation/orixa-planet';

describe('Orixá-Planet Correlation', () => {
  describe('getOrixaPlanet', () => {
    it('should return Oxalá mapping with Sol as regent planet', () => {
      const result = getOrixaPlanet('Oxalá');
      expect(result).toBeDefined();
      expect(result?.planeta_regente).toBe('Sol');
      expect(result?.elemento_conexao).toBe('éter');
      expect(result?.significado_espiritual).toContain('Criador supremo');
    });

    it('should return Iemanjá mapping with Lua as regent planet', () => {
      const result = getOrixaPlanet('Iemanjá');
      expect(result).toBeDefined();
      expect(result?.planeta_regente).toBe('Lua');
      expect(result?.elemento_conexao).toBe('água');
      expect(result?.significado_espiritual).toContain('Mãe das águas');
    });

    it('should return Oxum with Vênus as regent planet', () => {
      const result = getOrixaPlanet('Oxum');
      expect(result).toBeDefined();
      expect(result?.planeta_regente).toBe('Vênus');
      expect(result?.elemento_conexao).toBe('água');
      expect(result?.significado_espiritual).toContain('ouro');
    });

    it('should return Ogum with Marte as regent planet', () => {
      const result = getOrixaPlanet('Ogum');
      expect(result).toBeDefined();
      expect(result?.planeta_regente).toBe('Marte');
      expect(result?.elemento_conexao).toBe('terra');
      expect(result?.significado_espiritual).toContain('batalhas');
    });

    it('should return Oxóssi with Júpiter as regent planet', () => {
      const result = getOrixaPlanet('Oxóssi');
      expect(result).toBeDefined();
      expect(result?.planeta_regente).toBe('Júpiter');
      expect(result?.elemento_conexao).toBe('terra');
      expect(result?.significado_espiritual).toContain('Caçador');
    });

    it('should return Xangô with Sol as regent planet', () => {
      const result = getOrixaPlanet('Xangô');
      expect(result).toBeDefined();
      expect(result?.planeta_regente).toBe('Sol');
      expect(result?.elemento_conexao).toBe('fogo');
      expect(result?.significado_espiritual).toContain('trovão');
    });

    it('should return Iansã with Urano as regent planet', () => {
      const result = getOrixaPlanet('Iansã');
      expect(result).toBeDefined();
      expect(result?.planeta_regente).toBe('Urano');
      expect(result?.elemento_conexao).toBe('fogo');
      expect(result?.significado_espiritual).toContain('ventos');
    });

    it('should return Omolu with Saturno as regent planet', () => {
      const result = getOrixaPlanet('Omolu');
      expect(result).toBeDefined();
      expect(result?.planeta_regente).toBe('Saturno');
      expect(result?.elemento_conexao).toBe('terra');
      expect(result?.significado_espiritual).toContain('doenças');
    });

    it('should return Nanã with Saturno as regent planet', () => {
      const result = getOrixaPlanet('Nanã');
      expect(result).toBeDefined();
      expect(result?.planeta_regente).toBe('Saturno');
      expect(result?.elemento_conexao).toBe('água');
      expect(result?.significado_espiritual).toContain('anciã');
    });

    it('should be case-insensitive', () => {
      const lower = getOrixaPlanet('oxalá');
      const upper = getOrixaPlanet('OXALÁ');
      const mixed = getOrixaPlanet('OxAlá');
      expect(lower?.planeta_regente).toBe('Sol');
      expect(upper?.planeta_regente).toBe('Sol');
      expect(mixed?.planeta_regente).toBe('Sol');
    });

    it('should return undefined for unknown Orixá', () => {
      const result = getOrixaPlanet('NonExistent');
      expect(result).toBeUndefined();
    });

    it('should include all required properties in returned object', () => {
      const result = getOrixaPlanet('Oxalá');
      expect(result).toHaveProperty('orixa');
      expect(result).toHaveProperty('planeta_regente');
      expect(result).toHaveProperty('elemento_conexao');
      expect(result).toHaveProperty('significado_espiritual');
    });

    it('should handle trimmed input', () => {
      const result = getOrixaPlanet('  Oxalá  ');
      expect(result?.planeta_regente).toBe('Sol');
    });
  });

  describe('getAllOrixaPlanets', () => {
    it('should return all Orixá-planet mappings', () => {
      const result = getAllOrixaPlanets();
      expect(result).toHaveLength(9);
    });

    it('should return array with all expected Orixás', () => {
      const result = getAllOrixaPlanets();
      const orixaNames = result.map(r => r.orixa);
      expect(orixaNames).toContain('Oxalá');
      expect(orixaNames).toContain('Iemanjá');
      expect(orixaNames).toContain('Oxum');
      expect(orixaNames).toContain('Ogum');
      expect(orixaNames).toContain('Oxóssi');
      expect(orixaNames).toContain('Xangô');
      expect(orixaNames).toContain('Iansã');
      expect(orixaNames).toContain('Omolu');
      expect(orixaNames).toContain('Nanã');
    });

    it('should return all planets represented', () => {
      const result = getAllOrixaPlanets();
      const planets = new Set(result.map(r => r.planeta_regente));
      expect(planets.size).toBeGreaterThan(0);
    });

    it('should include all required properties for each entry', () => {
      const result = getAllOrixaPlanets();
      for (const entry of result) {
        expect(entry.orixa).toBeDefined();
        expect(entry.planeta_regente).toBeDefined();
        expect(entry.elemento_conexao).toBeDefined();
        expect(entry.significado_espiritual).toBeDefined();
      }
    });
  });

  describe('getPlanetOrixa', () => {
    it('should return Sol associated with multiple Orixás', () => {
      const result = getPlanetOrixa();
      expect(result['Sol']).toContain('Oxalá');
      expect(result['Sol']).toContain('Xangô');
    });

    it('should return Lua associated with Iemanjá', () => {
      const result = getPlanetOrixa();
      expect(result['Lua']).toContain('Iemanjá');
    });

    it('should return Vênus associated with Oxum', () => {
      const result = getPlanetOrixa();
      expect(result['Vênus']).toContain('Oxum');
    });

    it('should return Marte associated with Ogum', () => {
      const result = getPlanetOrixa();
      expect(result['Marte']).toContain('Ogum');
    });

    it('should return Júpiter associated with Oxóssi', () => {
      const result = getPlanetOrixa();
      expect(result['Júpiter']).toContain('Oxóssi');
    });

    it('should return Urano associated with Iansã', () => {
      const result = getPlanetOrixa();
      expect(result['Urano']).toContain('Iansã');
    });

    it('should return Saturno associated with multiple Orixás', () => {
      const result = getPlanetOrixa();
      expect(result['Saturno']).toContain('Omolu');
      expect(result['Saturno']).toContain('Nanã');
    });

    it('should return an object with all keys being valid PlanetType', () => {
      const result = getPlanetOrixa();
      const validPlanets: PlanetType[] = [
        'Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte',
        'Júpiter', 'Saturno', 'Urano', 'Netuno', 'Plutão'
      ];
      for (const key of Object.keys(result)) {
        expect(validPlanets).toContain(key);
      }
    });
  });

  describe('Planet correlation consistency', () => {
    it('should maintain bidirectional consistency between getOrixaPlanet and getPlanetOrixa', () => {
      const planetOrixa = getPlanetOrixa();
      for (const [planet, orixas] of Object.entries(planetOrixa)) {
        for (const orixa of orixas) {
          const orixaPlanet = getOrixaPlanet(orixa);
          expect(orixaPlanet?.planeta_regente).toBe(planet);
        }
      }
    });

    it('should have same count in getAllOrixaPlanets and sum of getPlanetOrixa', () => {
      const allPlanets = getAllOrixaPlanets();
      const planetOrixa = getPlanetOrixa();
      const totalFromPlanetMap = Object.values(planetOrixa).reduce(
        (sum, orixas) => sum + orixas.length, 0
      );
      expect(totalFromPlanetMap).toBe(allPlanets.length);
    });
  });
});