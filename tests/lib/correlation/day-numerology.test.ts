/**
 * Day-Numerology Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getDayNumerology,
  getNumerologyByDay,
  getNumerologyDay,
  getNumerologyDays,
  getAllDayNumerology,
  getDaySpiritualMeaning,
  getNumerologyProperties,
  getDaysByNumero,
  getDayNumerologyPractices,
} from '@/lib/correlation/day-numerology';
describe('Day-Numerology Correlation', () => {
  describe('getDayNumerology', () => {
    it('should return Sunday (Domingo) mapping with number 1', () => {
      const result = getDayNumerology('Domingo');
      expect(result).toBeDefined();
      expect(result?.numero).toBe(1);
      expect(result?.planeta).toBe('Sol');
      expect(result?.elemento).toBe('fogo');
    });

    it('should return Monday (Segunda-feira) mapping with number 2', () => {
      const result = getDayNumerology('Segunda-feira');
      expect(result).toBeDefined();
      expect(result?.numero).toBe(2);
      expect(result?.planeta).toBe('Lua');
      expect(result?.elemento).toBe('água');
    });

    it('should return Tuesday (Terça-feira) mapping with number 9', () => {
      const result = getDayNumerology('Terça-feira');
      expect(result).toBeDefined();
      expect(result?.numero).toBe(9);
      expect(result?.planeta).toBe('Marte');
      expect(result?.elemento).toBe('fogo');
    });

    it('should return Wednesday (Quarta-feira) mapping with number 5', () => {
      const result = getDayNumerology('Quarta-feira');
      expect(result).toBeDefined();
      expect(result?.numero).toBe(5);
      expect(result?.planeta).toBe('Mercúrio');
      expect(result?.elemento).toBe('ar');
    });

    it('should return Thursday (Quinta-feira) mapping with number 3', () => {
      const result = getDayNumerology('Quinta-feira');
      expect(result).toBeDefined();
      expect(result?.numero).toBe(3);
      expect(result?.planeta).toBe('Júpiter');
      expect(result?.elemento).toBe('fogo');
    });

    it('should return Friday (Sexta-feira) mapping with number 6', () => {
      const result = getDayNumerology('Sexta-feira');
      expect(result).toBeDefined();
      expect(result?.numero).toBe(6);
      expect(result?.planeta).toBe('Vênus');
      expect(result?.elemento).toBe('terra');
    });

    it('should return Saturday (Sábado) mapping with number 8', () => {
      const result = getDayNumerology('Sábado');
      expect(result).toBeDefined();
      expect(result?.numero).toBe(8);
      expect(result?.planeta).toBe('Saturno');
      expect(result?.elemento).toBe('terra');
    });

    it('should return undefined for invalid day', () => {
      const result = getDayNumerology('InvalidDay');
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const result = getDayNumerology('');
      expect(result).toBeUndefined();
    });

    it('should include all required interface properties', () => {
      const result = getDayNumerology('Domingo');
      expect(result).toHaveProperty('dia');
      expect(result).toHaveProperty('indice');
      expect(result).toHaveProperty('numero');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('planeta');
      expect(result).toHaveProperty('significado_espiritual');
      expect(result).toHaveProperty('significado_numerologico');
      expect(result).toHaveProperty('palavras_chave');
      expect(result).toHaveProperty('qualidade');
      expect(result).toHaveProperty('praticas_espirituais');
      expect(result).toHaveProperty('chakra');
      expect(result).toHaveProperty('cor');
    });

    it('should have valid day indices (0-6)', () => {
      const allDays = getAllDayNumerology();
      allDays.forEach(day => {
        expect(day.indice).toBeGreaterThanOrEqual(0);
        expect(day.indice).toBeLessThanOrEqual(6);
      });
    });

    it('should have valid numerology numbers (1-9)', () => {
      const allDays = getAllDayNumerology();
      allDays.forEach(day => {
        expect(day.numero).toBeGreaterThanOrEqual(1);
        expect(day.numero).toBeLessThanOrEqual(9);
      });
    });

    it('should have palavras_chave as non-empty array', () => {
      const allDays = getAllDayNumerology();
      allDays.forEach(day => {
        expect(Array.isArray(day.palavras_chave)).toBe(true);
        expect(day.palavras_chave.length).toBeGreaterThan(0);
      });
    });

    it('should have praticas_espirituais as non-empty array', () => {
      const allDays = getAllDayNumerology();
      allDays.forEach(day => {
        expect(Array.isArray(day.praticas_espirituais)).toBe(true);
        expect(day.praticas_espirituais.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getNumerologyByDay', () => {
    it('should return correct number for each day', () => {
      expect(getNumerologyByDay('Domingo')).toBe(1);
      expect(getNumerologyByDay('Segunda-feira')).toBe(2);
      expect(getNumerologyByDay('Terça-feira')).toBe(9);
      expect(getNumerologyByDay('Quarta-feira')).toBe(5);
      expect(getNumerologyByDay('Quinta-feira')).toBe(3);
      expect(getNumerologyByDay('Sexta-feira')).toBe(6);
      expect(getNumerologyByDay('Sábado')).toBe(8);
    });
    it('should return undefined for invalid day', () => {
      expect(getNumerologyByDay('InvalidDay')).toBeUndefined();
    });
  });
  describe('getNumerologyDay', () => {
    it('should return correct number for each day (alias for getNumerologyByDay)', () => {
      expect(getNumerologyDay('Domingo')).toBe(1);
      expect(getNumerologyDay('Segunda-feira')).toBe(2);
      expect(getNumerologyDay('Terça-feira')).toBe(9);
      expect(getNumerologyDay('Quarta-feira')).toBe(5);
      expect(getNumerologyDay('Quinta-feira')).toBe(3);
      expect(getNumerologyDay('Sexta-feira')).toBe(6);
      expect(getNumerologyDay('Sábado')).toBe(8);
    });
    it('should return undefined for invalid day', () => {
      expect(getNumerologyDay('InvalidDay')).toBeUndefined();
    });
    it('should return undefined for empty string', () => {
      expect(getNumerologyDay('')).toBeUndefined();
    });
  });
  describe('getNumerologyDays', () => {
    it('should return array of all day names', () => {
      const days = getNumerologyDays();
      expect(Array.isArray(days)).toBe(true);
      expect(days.length).toBe(7);
      expect(days).toContain('Domingo');
      expect(days).toContain('Segunda-feira');
      expect(days).toContain('Terça-feira');
      expect(days).toContain('Quarta-feira');
      expect(days).toContain('Quinta-feira');
      expect(days).toContain('Sexta-feira');
      expect(days).toContain('Sábado');
    });
  });

  describe('getAllDayNumerology', () => {
    it('should return array of all DayNumerology objects', () => {
      const allDays = getAllDayNumerology();
      expect(Array.isArray(allDays)).toBe(true);
      expect(allDays.length).toBe(7);
    });

    it('should have unique indices', () => {
      const allDays = getAllDayNumerology();
      const indices = allDays.map(d => d.indice);
      const uniqueIndices = new Set(indices);
      expect(uniqueIndices.size).toBe(7);
    });
  });

  describe('getDaySpiritualMeaning', () => {
    it('should return spiritual meaning for valid days', () => {
      const meaning = getDaySpiritualMeaning('Domingo');
      expect(typeof meaning).toBe('string');
      expect(meaning!.length).toBeGreaterThan(0);
    });

    it('should return undefined for invalid day', () => {
      expect(getDaySpiritualMeaning('InvalidDay')).toBeUndefined();
    });
  });

  describe('getNumerologyProperties', () => {
    it('should return correct properties for each day', () => {
      const result = getNumerologyProperties('Domingo');
      expect(result).toEqual({
        numero: 1,
        elemento: 'fogo',
        planeta: 'Sol',
      });
    });

    it('should return undefined for invalid day', () => {
      expect(getNumerologyProperties('InvalidDay')).toBeUndefined();
    });
  });

  describe('getDaysByNumero', () => {
    it('should return correct days for each number', () => {
      expect(getDaysByNumero(1)).toContain('Domingo');
      expect(getDaysByNumero(2)).toContain('Segunda-feira');
      expect(getDaysByNumero(9)).toContain('Terça-feira');
      expect(getDaysByNumero(5)).toContain('Quarta-feira');
      expect(getDaysByNumero(3)).toContain('Quinta-feira');
      expect(getDaysByNumero(6)).toContain('Sexta-feira');
      expect(getDaysByNumero(8)).toContain('Sábado');
    });

    it('should return empty array for non-existent number', () => {
      expect(getDaysByNumero(7)).toEqual([]);
    });
  });

  describe('getDayNumerologyPractices', () => {
    it('should return practices for valid days', () => {
      const practices = getDayNumerologyPractices('Domingo');
      expect(Array.isArray(practices)).toBe(true);
      expect(practices!.length).toBeGreaterThan(0);
    });

    it('should return undefined for invalid day', () => {
      expect(getDayNumerologyPractices('InvalidDay')).toBeUndefined();
    });
  });
});