/**
 * Orixá-Day Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getOrixaDay,
  getDayOrixa,
  getAllOrixaDays,
} from '@/lib/correlation/orixa-day';

describe('Orixá-Day Correlation', () => {
  describe('getOrixaDay', () => {
    it('should return Oxalá mapping with Friday as sacred day', () => {
      const result = getOrixaDay('Oxalá');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxalá');
      expect(result?.dia_da_semana).toBe('Sexta-feira');
      expect(result?.elemento).toBe('éter');
      expect(result?.cor).toContain('Branco');
    });

    it('should return Iemanjá mapping with Saturday as sacred day', () => {
      const result = getOrixaDay('Iemanjá');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Iemanjá');
      expect(result?.dia_da_semana).toBe('Sábado');
      expect(result?.elemento).toBe('água');
      expect(result?.cor).toContain('Azul');
    });

    it('should return Oxum mapping with Saturday as sacred day', () => {
      const result = getOrixaDay('Oxum');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxum');
      expect(result?.dia_da_semana).toBe('Sábado');
      expect(result?.elemento).toBe('água');
      expect(result?.cor).toContain('Rosa');
    });

    it('should return Ogum mapping with Tuesday as sacred day', () => {
      const result = getOrixaDay('Ogum');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Ogum');
      expect(result?.dia_da_semana).toBe('Terça-feira');
      expect(result?.elemento).toBe('terra');
    });

    it('should return Oxóssi mapping with Thursday as sacred day', () => {
      const result = getOrixaDay('Oxóssi');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxóssi');
      expect(result?.dia_da_semana).toBe('Quinta-feira');
      expect(result?.elemento).toBe('terra');
      expect(result?.cor).toContain('Verde');
    });

    it('should return Xangô mapping with Wednesday as sacred day', () => {
      const result = getOrixaDay('Xangô');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Xangô');
      expect(result?.dia_da_semana).toBe('Quarta-feira');
      expect(result?.elemento).toBe('fogo');
      expect(result?.cor).toContain('Amarelo');
    });

    it('should return Iansã mapping with Tuesday as sacred day', () => {
      const result = getOrixaDay('Iansã');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Iansã');
      expect(result?.dia_da_semana).toBe('Terça-feira');
      expect(result?.elemento).toBe('fogo');
    });

    it('should return Omolu mapping with Monday as sacred day', () => {
      const result = getOrixaDay('Omolu');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Omolu');
      expect(result?.dia_da_semana).toBe('Segunda-feira');
      expect(result?.elemento).toBe('terra');
    });

    it('should return Nanã mapping with Tuesday as sacred day', () => {
      const result = getOrixaDay('Nanã');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Nanã');
      expect(result?.dia_da_semana).toBe('Terça-feira');
      expect(result?.elemento).toBe('água');
    });

    it('should return Exu mapping with Monday as sacred day', () => {
      const result = getOrixaDay('Exu');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Exu');
      expect(result?.dia_da_semana).toBe('Segunda-feira');
      expect(result?.elemento).toBe('fogo');
    });

    it('should be case-insensitive', () => {
      const upperResult = getOrixaDay('OXALÁ');
      const lowerResult = getOrixaDay('oxalá');
      const mixedResult = getOrixaDay('OxAlá');

      expect(upperResult).toBeDefined();
      expect(lowerResult).toBeDefined();
      expect(mixedResult).toBeDefined();
      expect(upperResult?.orixa).toBe('Oxalá');
      expect(lowerResult?.orixa).toBe('Oxalá');
      expect(mixedResult?.orixa).toBe('Oxalá');
    });

    it('should return undefined for unknown Orixá', () => {
      const result = getOrixaDay('Desconhecido');
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const result = getOrixaDay('');
      expect(result).toBeUndefined();
    });

    it('should include all required properties in returned object', () => {
      const result = getOrixaDay('Oxalá');
      expect(result).toHaveProperty('orixa');
      expect(result).toHaveProperty('dia_da_semana');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('cor');
      expect(result).toHaveProperty('praticas_rituais');
    });

    it('should have valid element values', () => {
      const allDays = getAllOrixaDays();
      const validElements = ['fogo', 'água', 'ar', 'terra', 'éter'];
      
      allDays.forEach(day => {
        expect(validElements).toContain(day.elemento);
      });
    });

    it('should have non-empty ritual practices array', () => {
      const result = getOrixaDay('Xangô');
      expect(result?.praticas_rituais).toBeDefined();
      expect(Array.isArray(result?.praticas_rituais)).toBe(true);
      expect(result?.praticas_rituais.length).toBeGreaterThan(0);
    });
  });

  describe('getDayOrixa', () => {
    it('should return all Orixá-day mappings as object', () => {
      const result = getDayOrixa();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(Object.keys(result).length).toBeGreaterThan(0);
    });

    it('should include Oxalá mapping', () => {
      const result = getDayOrixa();
      expect(result['Oxalá']).toBeDefined();
      expect(result['Oxalá'].dia_da_semana).toBe('Sexta-feira');
    });

    it('should return a copy of the original map', () => {
      const result = getDayOrixa();
      result['Test'] = {} as any;
      const secondResult = getDayOrixa();
      expect(secondResult['Test']).toBeUndefined();
    });
  });

  describe('getAllOrixaDays', () => {
    it('should return array of all Orixá-day entries', () => {
      const result = getAllOrixaDays();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have correct count of Orixás', () => {
      const result = getAllOrixaDays();
      expect(result.length).toBe(10);
    });

    it('should include all main Orixás', () => {
      const result = getAllOrixaDays();
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
      expect(orixaNames).toContain('Exu');
    });

    it('should have unique Orixá names', () => {
      const result = getAllOrixaDays();
      const orixaNames = result.map(r => r.orixa);
      const uniqueNames = new Set(orixaNames);
      expect(uniqueNames.size).toBe(orixaNames.length);
    });

    it('should have correct day assignments', () => {
      const result = getAllOrixaDays();
      const oxala = result.find(r => r.orixa === 'Oxalá');
      expect(oxala?.dia_da_semana).toBe('Sexta-feira');
      
      const iemanja = result.find(r => r.orixa === 'Iemanjá');
      expect(iemanja?.dia_da_semana).toBe('Sábado');
    });
  });

  describe('Ritual practices consistency', () => {
    it('should have ritual practices for all Orixás', () => {
      const result = getAllOrixaDays();
      result.forEach(day => {
        expect(day.praticas_rituais).toBeDefined();
        expect(day.praticas_rituais.length).toBeGreaterThan(0);
      });
    });

    it('should have valid ritual practice descriptions', () => {
      const result = getAllOrixaDays();
      result.forEach(day => {
        day.praticas_rituais.forEach(practice => {
          expect(typeof practice).toBe('string');
          expect(practice.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Day and Element consistency', () => {
    it('should have consistent element mappings with day-orixa.ts', () => {
      const oxala = getOrixaDay('Oxalá');
      expect(oxala?.elemento).toBe('éter');
      
      const xango = getOrixaDay('Xangô');
      expect(xango?.elemento).toBe('fogo');
      
      const iemanja = getOrixaDay('Iemanjá');
      expect(iemanja?.elemento).toBe('água');
    });

    it('should have Sunday as a day in the mapping for Sol/Xangô', () => {
      const result = getAllOrixaDays();
      const dias = result.map(r => r.dia_da_semana);
      
      expect(dias).toContain('Domingo');
      expect(dias).toContain('Segunda-feira');
      expect(dias).toContain('Terça-feira');
      expect(dias).toContain('Quarta-feira');
      expect(dias).toContain('Quinta-feira');
      expect(dias).toContain('Sexta-feira');
      expect(dias).toContain('Sábado');
    });
  });
});
