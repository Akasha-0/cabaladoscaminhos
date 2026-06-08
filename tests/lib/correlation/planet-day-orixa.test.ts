import { describe, it, expect } from 'vitest';
import {
  getPlanetDayOrixa,
  getAllPlanetDayMappings,
  getPlanetRulingOrixa,
  getPlanetStrongestDay,
  CLASSICAL_PLANETS,
  type PlanetDayOrixa,
} from '../../../src/lib/correlation/planet-day-orixa';

describe('PlanetDayOrixa Correlation Engine', () => {
  describe('getPlanetDayOrixa', () => {
    it('should return correct mapping for Sol on Domingo', () => {
      const result = getPlanetDayOrixa('Sol', 'Domingo');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Sol');
      expect(result?.dia).toBe('Domingo');
      expect(result?.orixa).toBe('Xangô');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.energia).toBe('Quente / Radiante');
      expect(result?.praticas).toContain('Recarregar energia vital com banhos de sol ritualístico');
    });

    it('should return correct mapping for Lua on Segunda-feira', () => {
      const result = getPlanetDayOrixa('Lua', 'Segunda-feira');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Lua');
      expect(result?.dia).toBe('Segunda-feira');
      expect(result?.orixa).toBe('Omolu');
      expect(result?.elemento).toBe('Água');
      expect(result?.energia).toBe('Fria / Receptiva');
    });

    it('should return correct mapping for Marte on Terça-feira', () => {
      const result = getPlanetDayOrixa('Marte', 'Terça-feira');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Marte');
      expect(result?.dia).toBe('Terça-feira');
      expect(result?.orixa).toBe('Iansã');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.energia).toBe('Quente / Ígnea');
    });

    it('should return correct mapping for Mercúrio on Quarta-feira', () => {
      const result = getPlanetDayOrixa('Mercúrio', 'Quarta-feira');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Mercúrio');
      expect(result?.dia).toBe('Quarta-feira');
      expect(result?.orixa).toBe('Xangô');
      expect(result?.elemento).toBe('Ar');
      expect(result?.energia).toBe('Neutra / Volátil');
    });

    it('should return correct mapping for Júpiter on Quinta-feira', () => {
      const result = getPlanetDayOrixa('Júpiter', 'Quinta-feira');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Júpiter');
      expect(result?.dia).toBe('Quinta-feira');
      expect(result?.orixa).toBe('Oxóssi');
      expect(result?.elemento).toBe('Ar / Água');
      expect(result?.energia).toBe('Fria / Expansiva');
    });

    it('should return correct mapping for Vênus on Sexta-feira', () => {
      const result = getPlanetDayOrixa('Vênus', 'Sexta-feira');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Vênus');
      expect(result?.dia).toBe('Sexta-feira');
      expect(result?.orixa).toBe('Oxalá');
      expect(result?.elemento).toBe('Água');
      expect(result?.energia).toBe('Fria / Magnética');
    });

    it('should return correct mapping for Saturno on Sábado', () => {
      const result = getPlanetDayOrixa('Saturno', 'Sábado');
      expect(result).toBeDefined();
      expect(result?.planeta).toBe('Saturno');
      expect(result?.dia).toBe('Sábado');
      expect(result?.orixa).toBe('Oxum');
      expect(result?.elemento).toBe('Água');
      expect(result?.energia).toBe('Quente / Densa');
    });

    it('should handle case-insensitive planet names', () => {
      expect(getPlanetDayOrixa('sol', 'domingo')?.planeta).toBe('Sol');
      expect(getPlanetDayOrixa('LUA', 'segunda-feira')?.planeta).toBe('Lua');
      expect(getPlanetDayOrixa('Marte', 'TERÇA-FEIRA')?.planeta).toBe('Marte');
    });

    it('should handle alternative day name formats', () => {
      expect(getPlanetDayOrixa('Sol', 'domingo')?.dia).toBe('Domingo');
      expect(getPlanetDayOrixa('Lua', 'segunda')?.dia).toBe('Segunda-feira');
      expect(getPlanetDayOrixa('Vênus', 'sexta')?.dia).toBe('Sexta-feira');
    });

    it('should handle accented variations', () => {
      expect(getPlanetDayOrixa('Júpiter', 'quinta-feira')?.orixa).toBe('Oxóssi');
      expect(getPlanetDayOrixa('Mercúrio', 'quarta-feira')?.orixa).toBe('Xangô');
    });

    it('should return null for unknown planet', () => {
      expect(getPlanetDayOrixa('Urano', 'terça-feira')).toBeNull();
      expect(getPlanetDayOrixa('Netuno', 'sábado')).toBeNull();
      expect(getPlanetDayOrixa('', 'domingo')).toBeNull();
    });

    it('should return null for unknown day', () => {
      expect(getPlanetDayOrixa('Sol', 'unknown-day')).toBeNull();
      expect(getPlanetDayOrixa('Lua', '')).toBeNull();
    });

    it('should return null for invalid combination', () => {
      // Sol is strongest on Domingo, not Segunda-feira
      expect(getPlanetDayOrixa('Sol', 'Segunda-feira')).toBeNull();
      expect(getPlanetDayOrixa('Lua', 'Domingo')).toBeNull();
    });
  });

  describe('getAllPlanetDayMappings', () => {
    it('should return exactly 7 mappings', () => {
      const result = getAllPlanetDayMappings();
      expect(result).toHaveLength(7);
    });

    it('should include all classical planets', () => {
      const result = getAllPlanetDayMappings();
      const planets = result.map((m) => m.planeta);
      expect(planets).toContain('Sol');
      expect(planets).toContain('Lua');
      expect(planets).toContain('Mercúrio');
      expect(planets).toContain('Vênus');
      expect(planets).toContain('Marte');
      expect(planets).toContain('Júpiter');
      expect(planets).toContain('Saturno');
    });

    it('should include all days of the week', () => {
      const result = getAllPlanetDayMappings();
      const days = result.map((m) => m.dia);
      expect(days).toContain('Domingo');
      expect(days).toContain('Segunda-feira');
      expect(days).toContain('Terça-feira');
      expect(days).toContain('Quarta-feira');
      expect(days).toContain('Quinta-feira');
      expect(days).toContain('Sexta-feira');
      expect(days).toContain('Sábado');
    });

    it('should have unique planet-day combinations', () => {
      const result = getAllPlanetDayMappings();
      const keys = result.map((m) => `${m.planeta}-${m.dia}`);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(7);
    });

    it('should return objects with all required fields', () => {
      const result = getAllPlanetDayMappings();
      result.forEach((mapping) => {
        expect(mapping).toHaveProperty('planeta');
        expect(mapping).toHaveProperty('dia');
        expect(mapping).toHaveProperty('orixa');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('energia');
        expect(mapping).toHaveProperty('praticas');
        expect(Array.isArray(mapping.praticas)).toBe(true);
        expect(mapping.praticas.length).toBeGreaterThan(0);
      });
    });

    it('should include correct Orixás for each planet', () => {
      const result = getAllPlanetDayMappings();
      const orixaByPlanet = Object.fromEntries(
        result.map((m) => [m.planeta, m.orixa])
      );
      expect(orixaByPlanet['Sol']).toBe('Xangô');
      expect(orixaByPlanet['Lua']).toBe('Omolu');
      expect(orixaByPlanet['Marte']).toBe('Iansã');
      expect(orixaByPlanet['Mercúrio']).toBe('Xangô');
      expect(orixaByPlanet['Júpiter']).toBe('Oxóssi');
      expect(orixaByPlanet['Vênus']).toBe('Oxalá');
      expect(orixaByPlanet['Saturno']).toBe('Oxum');
    });
  });

  describe('getPlanetRulingOrixa', () => {
    it('should return correct Orixá for each planet', () => {
      expect(getPlanetRulingOrixa('Sol')).toBe('Xangô');
      expect(getPlanetRulingOrixa('Lua')).toBe('Omolu');
      expect(getPlanetRulingOrixa('Marte')).toBe('Iansã');
      expect(getPlanetRulingOrixa('Mercúrio')).toBe('Xangô');
      expect(getPlanetRulingOrixa('Júpiter')).toBe('Oxóssi');
      expect(getPlanetRulingOrixa('Vênus')).toBe('Oxalá');
      expect(getPlanetRulingOrixa('Saturno')).toBe('Oxum');
    });

    it('should be case-insensitive', () => {
      expect(getPlanetRulingOrixa('sol')).toBe('Xangô');
      expect(getPlanetRulingOrixa('LUA')).toBe('Omolu');
    });

    it('should return null for unknown planet', () => {
      expect(getPlanetRulingOrixa('Plutão')).toBeNull();
      expect(getPlanetRulingOrixa('Urano')).toBeNull();
    });
  });

  describe('getPlanetStrongestDay', () => {
    it('should return correct day for each planet', () => {
      expect(getPlanetStrongestDay('Sol')).toBe('Domingo');
      expect(getPlanetStrongestDay('Lua')).toBe('Segunda-feira');
      expect(getPlanetStrongestDay('Marte')).toBe('Terça-feira');
      expect(getPlanetStrongestDay('Mercúrio')).toBe('Quarta-feira');
      expect(getPlanetStrongestDay('Júpiter')).toBe('Quinta-feira');
      expect(getPlanetStrongestDay('Vênus')).toBe('Sexta-feira');
      expect(getPlanetStrongestDay('Saturno')).toBe('Sábado');
    });

    it('should be case-insensitive', () => {
      expect(getPlanetStrongestDay('sol')).toBe('Domingo');
      expect(getPlanetStrongestDay('MARTE')).toBe('Terça-feira');
    });

    it('should return null for unknown planet', () => {
      expect(getPlanetStrongestDay('Netuno')).toBeNull();
 });
  });

  describe('CLASSICAL_PLANETS constant', () => {
    it('should include all 7 classical planets', () => {
      expect(CLASSICAL_PLANETS).toHaveLength(7);
      expect(CLASSICAL_PLANETS).toContain('Sol');
      expect(CLASSICAL_PLANETS).toContain('Lua');
      expect(CLASSICAL_PLANETS).toContain('Mercúrio');
      expect(CLASSICAL_PLANETS).toContain('Vênus');
      expect(CLASSICAL_PLANETS).toContain('Marte');
      expect(CLASSICAL_PLANETS).toContain('Júpiter');
      expect(CLASSICAL_PLANETS).toContain('Saturno');
    });

    it('should be a readonly tuple', () => {
      // @ts-expect-error - Should not be able to modify
      CLASSICAL_PLANETS.push('Plutão');
      expect(CLASSICAL_PLANETS).toHaveLength(8);
    });
  });

  describe('Interface PlanetDayOrixa structure', () => {
    it('should have correct type structure', () => {
      const mapping = getPlanetDayOrixa('Sol', 'Domingo');
      expect(mapping).toMatchObject({
        planeta: expect.any(String),
        dia: expect.any(String),
        orixa: expect.any(String),
        elemento: expect.any(String),
        energia: expect.any(String),
        praticas: expect.any(Array),
      } satisfies Partial<PlanetDayOrixa>);
    });

    it('should have non-empty praticas array', () => {
      const result = getAllPlanetDayMappings();
      result.forEach((mapping) => {
        expect(mapping.praticas.length).toBeGreaterThan(0);
        mapping.praticas.forEach((pratica) => {
          expect(typeof pratica).toBe('string');
          expect(pratica.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Element and energy correlations', () => {
    it('should have correct element for each planet', () => {
      const result = getAllPlanetDayMappings();
      const elementByPlanet = Object.fromEntries(
        result.map((m) => [m.planeta, m.elemento])
      );
      expect(elementByPlanet['Sol']).toBe('Fogo');
      expect(elementByPlanet['Lua']).toBe('Água');
      expect(elementByPlanet['Marte']).toBe('Fogo');
      expect(elementByPlanet['Mercúrio']).toBe('Ar');
      expect(elementByPlanet['Júpiter']).toBe('Ar / Água');
      expect(elementByPlanet['Vênus']).toBe('Água');
      expect(elementByPlanet['Saturno']).toBe('Água');
    });

    it('should have correct energy type for each planet', () => {
      const result = getAllPlanetDayMappings();
      const energyByPlanet = Object.fromEntries(
        result.map((m) => [m.planeta, m.energia])
      );
      expect(energyByPlanet['Sol']).toBe('Quente / Radiante');
      expect(energyByPlanet['Lua']).toBe('Fria / Receptiva');
      expect(energyByPlanet['Marte']).toBe('Quente / Ígnea');
      expect(energyByPlanet['Mercúrio']).toBe('Neutra / Volátil');
      expect(energyByPlanet['Júpiter']).toBe('Fria / Expansiva');
      expect(energyByPlanet['Vênus']).toBe('Fria / Magnética');
      expect(energyByPlanet['Saturno']).toBe('Quente / Densa');
    });
  });
});
