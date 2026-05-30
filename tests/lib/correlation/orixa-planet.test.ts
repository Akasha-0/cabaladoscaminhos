/**
 * Orixá-Planet Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getOrixaPlanet,
  getPlanetOrixa,
  getAllOrixaPlanets,
  getAllOrixas,
  hasOrixaPlanet,
  getOrixasByElement,
  getOrixasByPlanet,
  type OrixaPlanetMapping,
} from '@/lib/correlation/orixa-planet';

describe('Orixá-Planet Correlation', () => {
  describe('getOrixaPlanet', () => {
    it('should return Xangô mapping with Sol as regent planet', () => {
      const result = getOrixaPlanet('Xangô');
      expect(result).toBeDefined();
      expect(result?.planet).toBe('Sol');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.significado_espiritual).toContain('Justiça');
    });

    it('should return Iemanjá mapping with Lua as regent planet', () => {
      const result = getOrixaPlanet('Iemanjá');
      expect(result).toBeDefined();
      expect(result?.planet).toBe('Lua');
      expect(result?.elemento).toBe('Água');
      expect(result?.significado_espiritual).toContain('Maternidade');
    });

    it('should return Oxum with Vênus as regent planet', () => {
      const result = getOrixaPlanet('Oxum');
      expect(result).toBeDefined();
      expect(result?.planet).toBe('Vênus');
      expect(result?.elemento).toBe('Água');
      expect(result?.significado_espiritual).toContain('Amor');
    });

    it('should return Ogum with Marte as regent planet', () => {
      const result = getOrixaPlanet('Ogum');
      expect(result).toBeDefined();
      expect(result?.planet).toBe('Marte');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.significado_espiritual).toContain('Guerra');
    });

    it('should return Oxóssi with Júpiter as regent planet', () => {
      const result = getOrixaPlanet('Oxóssi');
      expect(result).toBeDefined();
      expect(result?.planet).toBe('Júpiter');
      expect(result?.elemento).toBe('Terra / Fogo');
      expect(result?.significado_espiritual).toContain('Caça');
    });

    it('should return Iansã with Marte as regent planet', () => {
      const result = getOrixaPlanet('Iansã');
      expect(result).toBeDefined();
      expect(result?.planet).toBe('Marte');
      expect(result?.elemento).toBe('Ar / Fogo');
      expect(result?.significado_espiritual).toContain('Tempestades');
    });

    it('should return Omolu with Saturno as regent planet', () => {
      const result = getOrixaPlanet('Omolu');
      expect(result).toBeDefined();
      expect(result?.planet).toBe('Saturno');
      expect(result?.elemento).toBe('Terra');
      expect(result?.significado_espiritual).toContain('cura');
    });

    it('should return Nanã with Saturno as regent planet', () => {
      const result = getOrixaPlanet('Nanã');
      expect(result).toBeDefined();
      expect(result?.planet).toBe('Saturno');
      expect(result?.elemento).toBe('Terra / Água');
      expect(result?.significado_espiritual).toContain('Velhice');
    });

    it('should be case-insensitive', () => {
      const lower = getOrixaPlanet('xangô');
      const upper = getOrixaPlanet('XANGÔ');
      const mixed = getOrixaPlanet('XaNgô');
      expect(lower?.planet).toBe('Sol');
      expect(upper?.planet).toBe('Sol');
      expect(mixed?.planet).toBe('Sol');
    });

    it('should return null for unknown Orixá', () => {
      const result = getOrixaPlanet('NonExistent');
      expect(result).toBeNull();
    });

    it('should include all required properties in returned object', () => {
      const result = getOrixaPlanet('Oxalá') || getOrixaPlanet('Xangô');
      expect(result).toHaveProperty('orixa');
      expect(result).toHaveProperty('planet');
      expect(result).toHaveProperty('dia');
      expect(result).toHaveProperty('cores');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('qualidade_energetica');
      expect(result).toHaveProperty('significado_espiritual');
    });
  });

  describe('getPlanetOrixa', () => {
    it('should return Xangô when searching for Sol', () => {
      const result = getPlanetOrixa('Sol');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Xangô');
    });

    it('should return Iemanjá when searching for Lua', () => {
      const result = getPlanetOrixa('Lua');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Iemanjá');
    });

    it('should return Oxum when searching for Vênus', () => {
      const result = getPlanetOrixa('Vênus');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxum');
    });

    it('should return Ogum when searching for Marte', () => {
      const result = getPlanetOrixa('Marte');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Ogum');
    });

    it('should be case-insensitive', () => {
      const result = getPlanetOrixa('sol');
      expect(result?.orixa).toBe('Xangô');
    });

    it('should return null for unknown planet', () => {
      const result = getPlanetOrixa('UnknownPlanet');
      expect(result).toBeNull();
    });
  });

  describe('getAllOrixaPlanets', () => {
    it('should return array of all Orixá-planet mappings', () => {
      const result = getAllOrixaPlanets();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include all expected Orixás', () => {
      const result = getAllOrixaPlanets();
      const orixaNames = result.map(r => r.orixa);
      expect(orixaNames).toContain('Xangô');
      expect(orixaNames).toContain('Iemanjá');
      expect(orixaNames).toContain('Ogum');
      expect(orixaNames).toContain('Oxum');
      expect(orixaNames).toContain('Oxóssi');
      expect(orixaNames).toContain('Omolu');
      expect(orixaNames).toContain('Nanã');
      expect(orixaNames).toContain('Iansã');
    });

    it('should include all required properties for each entry', () => {
      const result = getAllOrixaPlanets();
      for (const entry of result) {
        expect(entry.orixa).toBeDefined();
        expect(entry.planet).toBeDefined();
        expect(entry.dia).toBeDefined();
        expect(entry.cores).toBeDefined();
        expect(Array.isArray(entry.cores)).toBe(true);
        expect(entry.elemento).toBeDefined();
        expect(entry.qualidade_energetica).toBeDefined();
        expect(entry.significado_espiritual).toBeDefined();
      }
    });

    it('should return frozen objects', () => {
      const result = getAllOrixaPlanets();
      for (const entry of result) {
        expect(Object.isFrozen(entry)).toBe(true);
      }
    });
  });

  describe('getAllOrixas', () => {
    it('should return array of all Orixá names', () => {
      const result = getAllOrixas();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return same count as getAllOrixaPlanets', () => {
      const allOrixas = getAllOrixas();
      const allMappings = getAllOrixaPlanets();
      expect(allOrixas.length).toBe(allMappings.length);
    });
  });

  describe('hasOrixaPlanet', () => {
    it('should return true for existing Orixá', () => {
      expect(hasOrixaPlanet('Xangô')).toBe(true);
      expect(hasOrixaPlanet('Iemanjá')).toBe(true);
      expect(hasOrixaPlanet('Ogum')).toBe(true);
    });

    it('should return false for non-existing Orixá', () => {
      expect(hasOrixaPlanet('NonExistent')).toBe(false);
    });

    it('should be case-sensitive for direct key lookup', () => {
      // Uses direct object key lookup, so exact match required
      expect(hasOrixaPlanet('xangô')).toBe(false);
      expect(hasOrixaPlanet('Xangô')).toBe(true);
    });
  });

  describe('getOrixasByElement', () => {
    it('should return Orixás with Fogo element', () => {
      const result = getOrixasByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.orixa === 'Xangô' || r.orixa === 'Ogum')).toBe(true);
    });

    it('should return Orixás with Água element', () => {
      const result = getOrixasByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.orixa === 'Iemanjá' || r.orixa === 'Oxum')).toBe(true);
    });

    it('should be case-insensitive', () => {
      const upper = getOrixasByElement('FOGO');
      const lower = getOrixasByElement('fogo');
      expect(upper.length).toBe(lower.length);
    });
  });

  describe('getOrixasByPlanet', () => {
    it('should return Orixás ruled by Sol', () => {
      const result = getOrixasByPlanet('Sol');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.orixa === 'Xangô')).toBe(true);
    });

    it('should return Orixás ruled by Marte', () => {
      const result = getOrixasByPlanet('Marte');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.orixa === 'Ogum' || r.orixa === 'Iansã')).toBe(true);
    });

    it('should return Orixás ruled by Saturno', () => {
      const result = getOrixasByPlanet('Saturno');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(r => r.orixa === 'Omolu' || r.orixa === 'Nanã')).toBe(true);
    });

    it('should be case-insensitive', () => {
      const upper = getOrixasByPlanet('SOL');
      const lower = getOrixasByPlanet('sol');
      expect(upper.length).toBe(lower.length);
    });
  });
  describe('Planet correlation consistency', () => {
    it('should maintain bidirectional consistency between getOrixaPlanet and getPlanetOrixa', () => {
      const allMappings = getAllOrixaPlanets();
      for (const mapping of allMappings) {
        const orixaLookup = getOrixaPlanet(mapping.orixa);
        // getPlanetOrixa returns first match; verify orixa lookup matches
        expect(orixaLookup?.orixa).toBe(mapping.orixa);
        expect(orixaLookup?.planet).toBe(mapping.planet);
      }
      // Verify bidirectional: planet lookup returns valid orixá for that planet
      for (const mapping of allMappings) {
        const planetLookup = getPlanetOrixa(mapping.planet);
        // Only verify if there's a single orixá for that planet
        const orixasForPlanet = getOrixasByPlanet(mapping.planet);
        if (orixasForPlanet.length === 1) {
          expect(planetLookup?.orixa).toBe(mapping.orixa);
        }
      }
    });

    it('should have Sol associated with Xangô as per traditional mapping', () => {
      const xango = getOrixaPlanet('Xangô');
      const sol = getPlanetOrixa('Sol');
      expect(xango?.planet).toBe('Sol');
      expect(sol?.orixa).toBe('Xangô');
    });

    it('should have Saturno associated with Omolu and Nanã', () => {
      const omolu = getOrixaPlanet('Omolu');
      const nana = getOrixaPlanet('Nanã');
      expect(omolu?.planet).toBe('Saturno');
      expect(nana?.planet).toBe('Saturno');
    });
  });
});