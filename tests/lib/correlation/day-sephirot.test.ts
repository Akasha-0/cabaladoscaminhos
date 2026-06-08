/**
 * Day-Sephirot Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getDaySephirot,
  getSephirotByDay,
  getSephirotDay,
  getAllDays,
  getAllDaySephiroth,
  getDaysBySephirah,
  getElementByDay,
  getPathByDay,
  getDayPractices,
  getDayMystere,
} from '@/lib/correlation/day-sephirot';

describe('Day-Sephirot Correlation', () => {
  describe('getDaySephirot', () => {
    it('should return Sunday (Domingo) mapping with Tiphereth', () => {
      const result = getDaySephirot('Domingo');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Tiphereth');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(6);
      expect(result?.planeta).toBe('Sol');
      expect(result?.signo).toBe('Leão');
    });

    it('should return Monday (Segunda-feira) mapping with Yesod', () => {
      const result = getDaySephirot('Segunda-feira');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Yesod');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(9);
      expect(result?.planeta).toBe('Lua');
      expect(result?.signo).toBe('Câncer');
    });

    it('should return Tuesday (Terça-feira) mapping with Geburah', () => {
      const result = getDaySephirot('Terça-feira');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Geburah');
      expect(result?.elemento).toBe('Fogo');
      expect(result?.numero_caminho).toBe(5);
      expect(result?.planeta).toBe('Marte');
      expect(result?.signo).toBe('Áries');
    });

    it('should return Wednesday (Quarta-feira) mapping with Hod', () => {
      const result = getDaySephirot('Quarta-feira');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Hod');
      expect(result?.elemento).toBe('Ar');
      expect(result?.numero_caminho).toBe(8);
      expect(result?.planeta).toBe('Mercúrio');
      expect(result?.signo).toBe('Gêmeos');
    });

    it('should return Thursday (Quinta-feira) mapping with Chesed', () => {
      const result = getDaySephirot('Quinta-feira');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Chesed');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(4);
      expect(result?.planeta).toBe('Júpiter');
      expect(result?.signo).toBe('Sagitário');
    });

    it('should return Friday (Sexta-feira) mapping with Netzach', () => {
      const result = getDaySephirot('Sexta-feira');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Netzach');
      expect(result?.elemento).toBe('Água');
      expect(result?.numero_caminho).toBe(7);
      expect(result?.planeta).toBe('Vênus');
      expect(result?.signo).toBe('Touro');
    });

    it('should return Saturday (Sábado) mapping with Malkuth', () => {
      const result = getDaySephirot('Sábado');
      expect(result).toBeDefined();
      expect(result?.sephirah).toBe('Malkuth');
      expect(result?.elemento).toBe('Terra');
      expect(result?.numero_caminho).toBe(10);
      expect(result?.planeta).toBe('Saturno');
      expect(result?.signo).toBe('Capricórnio');
    });

    it('should return undefined for invalid day', () => {
      const result = getDaySephirot('InvalidDay');
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const result = getDaySephirot('');
      expect(result).toBeUndefined();
    });

    it('should include all required interface properties', () => {
      const result = getDaySephirot('Domingo');
      expect(result).toHaveProperty('dia');
      expect(result).toHaveProperty('indice');
      expect(result).toHaveProperty('sephirah');
      expect(result).toHaveProperty('nome_hebraico');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('numero_caminho');
      expect(result).toHaveProperty('planeta');
      expect(result).toHaveProperty('signo');
      expect(result).toHaveProperty('energia_espiritual');
      expect(result).toHaveProperty('cor');
      expect(result).toHaveProperty('mystere');
      expect(result).toHaveProperty('praticas_espirituais');
    });

    it('should have valid path numbers (4-10)', () => {
      const allDays = getAllDaySephiroth();
      allDays.forEach((day) => {
        expect(day.numero_caminho).toBeGreaterThanOrEqual(4);
        expect(day.numero_caminho).toBeLessThanOrEqual(10);
      });
    });

    it('should have valid day indices (0-6)', () => {
      const allDays = getAllDaySephiroth();
      allDays.forEach((day) => {
        expect(day.indice).toBeGreaterThanOrEqual(0);
        expect(day.indice).toBeLessThanOrEqual(6);
      });
    });

    it('should have mystere and praticas_espirituais', () => {
      const result = getDaySephirot('Domingo');
      expect(result?.mystere).toBeDefined();
      expect(result?.mystere.length).toBeGreaterThan(0);
      expect(result?.praticas_espirituais).toBeDefined();
      expect(result?.praticas_espirituais.length).toBeGreaterThan(0);
    });
  });

  describe('getSephirotByDay / getSephirotDay', () => {
    it('should return Tiphereth for Domingo', () => {
      expect(getSephirotByDay('Domingo')).toBe('Tiphereth');
      expect(getSephirotDay('Domingo')).toBe('Tiphereth');
    });

    it('should return Yesod for Segunda-feira', () => {
      expect(getSephirotByDay('Segunda-feira')).toBe('Yesod');
      expect(getSephirotDay('Segunda-feira')).toBe('Yesod');
    });

    it('should return Geburah for Terça-feira', () => {
      expect(getSephirotByDay('Terça-feira')).toBe('Geburah');
      expect(getSephirotDay('Terça-feira')).toBe('Geburah');
    });

    it('should return Hod for Quarta-feira', () => {
      expect(getSephirotByDay('Quarta-feira')).toBe('Hod');
      expect(getSephirotDay('Quarta-feira')).toBe('Hod');
    });

    it('should return Chesed for Quinta-feira', () => {
      expect(getSephirotByDay('Quinta-feira')).toBe('Chesed');
      expect(getSephirotDay('Quinta-feira')).toBe('Chesed');
    });

    it('should return Netzach for Sexta-feira', () => {
      expect(getSephirotByDay('Sexta-feira')).toBe('Netzach');
      expect(getSephirotDay('Sexta-feira')).toBe('Netzach');
    });

    it('should return Malkuth for Sábado', () => {
      expect(getSephirotByDay('Sábado')).toBe('Malkuth');
      expect(getSephirotDay('Sábado')).toBe('Malkuth');
    });

    it('should return undefined for invalid day', () => {
      expect(getSephirotByDay('InvalidDay')).toBeUndefined();
      expect(getSephirotDay('InvalidDay')).toBeUndefined();
    });
  });

  describe('getAllDays', () => {
    it('should return all 7 days of the week', () => {
      const days = getAllDays();
      expect(days).toHaveLength(7);
    });

    it('should include all Portuguese day names', () => {
      const days = getAllDays();
      expect(days).toContain('Domingo');
      expect(days).toContain('Segunda-feira');
      expect(days).toContain('Terça-feira');
      expect(days).toContain('Quarta-feira');
      expect(days).toContain('Quinta-feira');
      expect(days).toContain('Sexta-feira');
      expect(days).toContain('Sábado');
    });
  });

  describe('getAllDaySephiroth', () => {
    it('should return all 7 day-sephirot mappings', () => {
      const allMappings = getAllDaySephiroth();
      expect(allMappings).toHaveLength(7);
    });

    it('should return DaySephirot objects with all required properties', () => {
      const allMappings = getAllDaySephiroth();
      allMappings.forEach((mapping) => {
        expect(mapping).toHaveProperty('dia');
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('numero_caminho');
      });
    });
  });

  describe('getDaysBySephirah', () => {
    it('should return Domingo for Tiphereth', () => {
      const days = getDaysBySephirah('Tiphereth');
      expect(days).toContain('Domingo');
    });

    it('should return Segunda-feira for Yesod', () => {
      const days = getDaysBySephirah('Yesod');
      expect(days).toContain('Segunda-feira');
    });

    it('should return Terça-feira for Geburah', () => {
      const days = getDaysBySephirah('Geburah');
      expect(days).toContain('Terça-feira');
    });

    it('should return Quarta-feira for Hod', () => {
      const days = getDaysBySephirah('Hod');
      expect(days).toContain('Quarta-feira');
    });

    it('should return Quinta-feira for Chesed', () => {
      const days = getDaysBySephirah('Chesed');
      expect(days).toContain('Quinta-feira');
    });

    it('should return Sexta-feira for Netzach', () => {
      const days = getDaysBySephirah('Netzach');
      expect(days).toContain('Sexta-feira');
    });

    it('should return Sábado for Malkuth', () => {
      const days = getDaysBySephirah('Malkuth');
      expect(days).toContain('Sábado');
    });

    it('should return empty array for non-existent Sephirah', () => {
      const days = getDaysBySephirah('Kether');
      expect(days).toEqual([]);
    });
  });

  describe('getElementByDay', () => {
    it('should return Fogo for Domingo', () => {
      expect(getElementByDay('Domingo')).toBe('Fogo');
    });

    it('should return Água for Segunda-feira', () => {
      expect(getElementByDay('Segunda-feira')).toBe('Água');
    });

    it('should return Fogo for Terça-feira', () => {
      expect(getElementByDay('Terça-feira')).toBe('Fogo');
    });

    it('should return Ar for Quarta-feira', () => {
      expect(getElementByDay('Quarta-feira')).toBe('Ar');
    });

    it('should return Água for Quinta-feira', () => {
      expect(getElementByDay('Quinta-feira')).toBe('Água');
    });

    it('should return Água for Sexta-feira', () => {
      expect(getElementByDay('Sexta-feira')).toBe('Água');
    });

    it('should return Terra for Sábado', () => {
      expect(getElementByDay('Sábado')).toBe('Terra');
    });

    it('should return undefined for invalid day', () => {
      expect(getElementByDay('InvalidDay')).toBeUndefined();
    });
  });

  describe('getPathByDay', () => {
    it('should return 6 for Domingo (Tiphereth)', () => {
      expect(getPathByDay('Domingo')).toBe(6);
    });

    it('should return 9 for Segunda-feira (Yesod)', () => {
      expect(getPathByDay('Segunda-feira')).toBe(9);
    });

    it('should return 5 for Terça-feira (Geburah)', () => {
      expect(getPathByDay('Terça-feira')).toBe(5);
    });

    it('should return 8 for Quarta-feira (Hod)', () => {
      expect(getPathByDay('Quarta-feira')).toBe(8);
    });

    it('should return 4 for Quinta-feira (Chesed)', () => {
      expect(getPathByDay('Quinta-feira')).toBe(4);
    });

    it('should return 7 for Sexta-feira (Netzach)', () => {
      expect(getPathByDay('Sexta-feira')).toBe(7);
    });

    it('should return 10 for Sábado (Malkuth)', () => {
      expect(getPathByDay('Sábado')).toBe(10);
    });

    it('should return undefined for invalid day', () => {
      expect(getPathByDay('InvalidDay')).toBeUndefined();
    });
  });

  describe('getDayPractices', () => {
    it('should return practices for Domingo', () => {
      const practices = getDayPractices('Domingo');
      expect(practices).toBeDefined();
      expect(practices?.length).toBeGreaterThan(0);
    });

    it('should return practices for all days', () => {
      const days = getAllDays();
      days.forEach((day) => {
        const practices = getDayPractices(day);
        expect(practices).toBeDefined();
        expect(practices?.length).toBeGreaterThan(0);
      });
    });

    it('should return undefined for invalid day', () => {
      expect(getDayPractices('InvalidDay')).toBeUndefined();
    });
  });

  describe('getDayMystere', () => {
    it('should return mystere for Domingo', () => {
      const mystere = getDayMystere('Domingo');
      expect(mystere).toBeDefined();
      expect(mystere?.length).toBeGreaterThan(0);
    });

    it('should return mystere for all days', () => {
      const days = getAllDays();
      days.forEach((day) => {
        const mystere = getDayMystere(day);
        expect(mystere).toBeDefined();
        expect(mystere?.length).toBeGreaterThan(0);
      });
    });

    it('should return undefined for invalid day', () => {
      expect(getDayMystere('InvalidDay')).toBeUndefined();
    });
  });
});
