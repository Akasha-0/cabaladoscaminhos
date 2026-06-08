/**
 * Orixá-Planet Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getOrixaPlanet,
  getAllOrixas,
  getPlanetOrixa,
  getAllOrixaPlanets,
} from '@/lib/correlation/orixa-planet';

describe('Orixá-Planet Correlation', () => {
  describe('getOrixaPlanet', () => {
    it('should return Oxalá mapping with Sol as planet', () => {
      const result = getOrixaPlanet('Oxalá');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Sol');
      expect(result?.orixa).toBe('Oxalá');
    });

    it('should return Iemanjá mapping with Lua as planet', () => {
      const result = getOrixaPlanet('Iemanjá');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Lua');
      expect(result?.elemento).toBe('água');
    });

    it('should return Oxum with Vênus as planet', () => {
      const result = getOrixaPlanet('Oxum');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Vênus');
      expect(result?.elemento).toBe('água');
    });

    it('should return Ogum with Marte as planet', () => {
      const result = getOrixaPlanet('Ogum');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Marte');
      expect(result?.elemento).toBe('terra');
    });

    it('should return Oxóssi with Júpiter as planet', () => {
      const result = getOrixaPlanet('Oxóssi');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Júpiter');
      expect(result?.elemento).toBe('terra');
    });

    it('should return Xangô with Sol as planet', () => {
      const result = getOrixaPlanet('Xangô');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Sol');
      expect(result?.elemento).toBe('fogo');
    });

    it('should return Iansã with Urano as planet', () => {
      const result = getOrixaPlanet('Iansã');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Urano');
      expect(result?.elemento).toBe('fogo');
    });

    it('should return Omolu with Saturno as planet', () => {
      const result = getOrixaPlanet('Omolu');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Saturno');
      expect(result?.elemento).toBe('terra');
    });

    it('should return Nanã with Saturno as planet', () => {
      const result = getOrixaPlanet('Nanã');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Saturno');
      expect(result?.elemento).toBe('água');
    });

    it('should be case-insensitive', () => {
      const result1 = getOrixaPlanet('OXALÁ');
      const result2 = getOrixaPlanet('oxalá');
      const result3 = getOrixaPlanet('Oxalá');
      expect(result1?.planeta).toBe('Sol');
      expect(result2?.planeta).toBe('Sol');
      expect(result3?.planeta).toBe('Sol');
    });

    it('should return undefined for unknown Orixá', () => {
      const result = getOrixaPlanet('Exu');
      expect(result).toBeUndefined();
    });

    it('should include all required properties in returned object', () => {
      const result = getOrixaPlanet('Oxalá');
      expect(result).toHaveProperty('orixa');
      expect(result).toHaveProperty('planeta');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('significado_espiritual');
    });

    it('should return Oxalá with éter element and Júpiter secondary', () => {
      const result = getOrixaPlanet('Oxalá');
      expect(result?.elemento).toBe('éter');
      expect(result?.planeta_secundario).toBe('Júpiter');
    });

    it('should return Iemanjá with water spiritual meaning about nurturing', () => {
      const result = getOrixaPlanet('Iemanjá');
      expect(result?.significado_espiritual).toContain('Mãe das águas');
    });

    it('should return Xangô with fire spiritual meaning about justice', () => {
      const result = getOrixaPlanet('Xangô');
      expect(result?.significado_espiritual).toContain('justiça');
    });

    it('should handle whitespace in input', () => {
      const result = getOrixaPlanet('  Oxalá  ');
      expect(result?.planeta).toBe('Sol');
    });
  });

  describe('getAllOrixas', () => {
    it('should return all Orixá names', () => {
      const result = getAllOrixas();
      expect(result).toContain('Oxalá');
      expect(result).toContain('Iemanjá');
      expect(result).toContain('Oxum');
      expect(result).toContain('Ogum');
      expect(result).toContain('Oxóssi');
      expect(result).toContain('Xangô');
      expect(result).toContain('Iansã');
      expect(result).toContain('Omolu');
      expect(result).toContain('Nanã');
    });

    it('should return array with 9 elements', () => {
      const result = getAllOrixas();
      expect(result).toHaveLength(9);
    });
  });

  describe('getPlanetOrixa', () => {
    it('should return Orixás for Sol (Oxalá and Xangô)', () => {
      const result = getPlanetOrixa('Sol');
      expect(result.length).toBeGreaterThanOrEqual(2);
      const orixas = result.map(r => r.orixa);
      expect(orixas).toContain('Oxalá');
      expect(orixas).toContain('Xangô');
    });

    it('should return Orixás for Saturno (Omolu and Nanã)', () => {
      const result = getPlanetOrixa('Saturno');
      expect(result.length).toBeGreaterThanOrEqual(2);
      const orixas = result.map(r => r.orixa);
      expect(orixas).toContain('Omolu');
      expect(orixas).toContain('Nanã');
    });

    it('should return single Orixá for unique planet mappings', () => {
      const result = getPlanetOrixa('Vênus');
      expect(result).toHaveLength(1);
      expect(result[0].orixa).toBe('Oxum');
    });

    it('should return single Orixá for Júpiter (Oxóssi)', () => {
      const result = getPlanetOrixa('Júpiter');
      expect(result).toHaveLength(1);
      expect(result[0].orixa).toBe('Oxóssi');
    });

    it('should be case-insensitive', () => {
      const result1 = getPlanetOrixa('SOL');
      const result2 = getPlanetOrixa('sol');
      expect(result1.length).toBe(result2.length);
    });

    it('should return empty array for unknown planet', () => {
      const result = getPlanetOrixa('Plutão');
      expect(result).toHaveLength(0);
    });
  });

  describe('Planet correlation consistency', () => {
    it('should have consistent element assignments', () => {
      const oxala = getOrixaPlanet('Oxalá');
      expect(oxala?.elemento).toBe('éter');
      
      const iemanjá = getOrixaPlanet('Iemanjá');
      expect(iemanjá?.elemento).toBe('água');
      
      const xango = getOrixaPlanet('Xangô');
      expect(xango?.elemento).toBe('fogo');
    });

    it('should have consistent spiritual meanings for all Orixás', () => {
      const all = getAllOrixaPlanets();
      for (const entry of all) {
        expect(entry.significado_espiritual.length).toBeGreaterThan(50);
      }
    });

    it('should have consistent secondary planet assignments', () => {
      const ogum = getOrixaPlanet('Ogum');
      expect(ogum?.planeta_secundario).toBe('Plutão');
      
      const iansã = getOrixaPlanet('Iansã');
      expect(iansã?.planeta_secundario).toBe('Plutão');
    });
  });

  describe('getAllOrixaPlanets', () => {
    it('should return all Orixá-planet mappings', () => {
      const result = getAllOrixaPlanets();
      expect(result).toHaveLength(9);
    });

    it('should return array with all required properties', () => {
      const result = getAllOrixaPlanets();
      for (const entry of result) {
        expect(entry).toHaveProperty('orixa');
        expect(entry).toHaveProperty('planeta');
        expect(entry).toHaveProperty('elemento');
        expect(entry).toHaveProperty('significado_espiritual');
      }
    });

    it('should include all 9 Orixás with unique planets', () => {
      const result = getAllOrixaPlanets();
      const planets = result.map(r => r.planeta);
      const uniquePlanets = [...new Set(planets)];
      expect(uniquePlanets.length).toBeGreaterThanOrEqual(7);
    });
  });
});
