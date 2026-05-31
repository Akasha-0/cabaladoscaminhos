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
      expect(result?.day).toBe('Sexta-feira');
      expect(result?.element).toBe('éter');
    });

    it('should return Iemanjá mapping with Saturday as sacred day', () => {
      const result = getOrixaDay('Iemanjá');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Iemanjá');
      expect(result?.day).toBe('Sábado');
      expect(result?.element).toBe('água');
    });

    it('should return Oxum mapping with Saturday as sacred day', () => {
      const result = getOrixaDay('Oxum');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxum');
      expect(result?.day).toBe('Sábado');
      expect(result?.element).toBe('água');
    });

    it('should return Ogum mapping with Tuesday as sacred day', () => {
      const result = getOrixaDay('Ogum');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Ogum');
      expect(result?.day).toBe('Terça-feira');
      expect(result?.element).toBe('terra');
    });

    it('should return Oxóssi mapping with Thursday as sacred day', () => {
      const result = getOrixaDay('Oxóssi');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxóssi');
      expect(result?.day).toBe('Quinta-feira');
      expect(result?.element).toBe('terra');
    });

    it('should return Xangô mapping with Wednesday as sacred day', () => {
      const result = getOrixaDay('Xangô');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Xangô');
      expect(result?.day).toBe('Quarta-feira');
      expect(result?.element).toBe('fogo');
    });

    it('should return Iansã mapping with Tuesday as sacred day', () => {
      const result = getOrixaDay('Iansã');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Iansã');
      expect(result?.day).toBe('Terça-feira');
      expect(result?.element).toBe('fogo');
    });

    it('should return Omolu mapping with Monday as sacred day', () => {
      const result = getOrixaDay('Omolu');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Omolu');
      expect(result?.day).toBe('Segunda-feira');
      expect(result?.element).toBe('terra');
    });

    it('should return Nanã mapping with Tuesday as sacred day', () => {
      const result = getOrixaDay('Nanã');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Nanã');
      expect(result?.day).toBe('Terça-feira');
      expect(result?.element).toBe('água');
    });

    it('should be case-insensitive', () => {
      const upper = getOrixaDay('OXALÁ');
      const lower = getOrixaDay('oxalá');
      const mixed = getOrixaDay('Oxalá');
      
      expect(upper).toEqual(lower);
      expect(lower).toEqual(mixed);
    });

    it('should return undefined for unknown Orixá', () => {
      const result = getOrixaDay('Exu');
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const result = getOrixaDay('');
      expect(result).toBeUndefined();
    });

    it('should include all required properties in returned object', () => {
      const result = getOrixaDay('Oxalá');
      expect(result).toHaveProperty('orixa');
      expect(result).toHaveProperty('day');
      expect(result).toHaveProperty('element');
      expect(result).toHaveProperty('spiritual_meaning');
      expect(result).toHaveProperty('energy');
    });

    it('should have valid element values', () => {
      const validElements = ['fogo', 'água', 'ar', 'terra', 'éter'];
      const allDays = getAllOrixaDays();
      
      allDays.forEach(day => {
        expect(validElements).toContain(day.element);
      });
    });

    it('should have non-empty spiritual meaning', () => {
      const allDays = getAllOrixaDays();
      
      allDays.forEach(day => {
        expect(day.spiritual_meaning.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getDayOrixa', () => {
    it('should return Oxalá for Sexta-feira', () => {
      const result = getDayOrixa('Sexta-feira');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxalá');
      expect(result?.day).toBe('Sexta-feira');
    });

    it('should return Iemanjá for Sábado', () => {
      const result = getDayOrixa('Sábado');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Iemanjá');
    });

    it('should return Ogum for Terça-feira', () => {
      const result = getDayOrixa('Terça-feira');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Ogum');
    });

    it('should return Xangô for Quarta-feira', () => {
      const result = getDayOrixa('Quarta-feira');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Xangô');
    });

    it('should return Oxóssi for Quinta-feira', () => {
      const result = getDayOrixa('Quinta-feira');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Oxóssi');
    });

    it('should return Omolu for Segunda-feira', () => {
      const result = getDayOrixa('Segunda-feira');
      expect(result).toBeDefined();
      expect(result?.orixa).toBe('Omolu');
    });

    it('should be case-insensitive', () => {
      const upper = getDayOrixa('SEXTA-FEIRA');
      const lower = getDayOrixa('sexta-feira');
      
      expect(upper).toEqual(lower);
    });

    it('should return undefined for invalid day', () => {
      const result = getDayOrixa('Quinta-feira');
      expect(result?.orixa).not.toBe('Oxalá');
    });
  });

  describe('getAllOrixaDays', () => {
    it('should return all 9 Orixá-day mappings', () => {
      const all = getAllOrixaDays();
      expect(all.length).toBe(9);
    });

    it('should contain all major Orixás', () => {
      const all = getAllOrixaDays();
      const orixas = all.map(d => d.orixa);
      
      expect(orixas).toContain('Oxalá');
      expect(orixas).toContain('Iemanjá');
      expect(orixas).toContain('Ogum');
      expect(orixas).toContain('Xangô');
      expect(orixas).toContain('Iansã');
    });

    it('should have valid elements for all entries', () => {
      const validElements = ['fogo', 'água', 'ar', 'terra', 'éter'];
      const all = getAllOrixaDays();
      
      all.forEach(day => {
        expect(validElements).toContain(day.element);
      });
    });

    it('should have unique spiritual meanings', () => {
      const all = getAllOrixaDays();
      const meanings = all.map(d => d.spiritual_meaning);
      const unique = new Set(meanings);
      
      expect(unique.size).toBe(meanings.length);
    });
  });

  describe('Energy consistency', () => {
    it('should have valid energy values', () => {
      const validEnergies = ['yang', 'yin', 'balanced'];
      const all = getAllOrixaDays();
      
      all.forEach(day => {
        expect(validEnergies).toContain(day.energy);
      });
    });

    it('should have yang energy for fire elements', () => {
      const fireOrixas = getAllOrixaDays().filter(d => d.element === 'fogo');
      
      fireOrixas.forEach(orixa => {
        expect(orixa.energy).toBe('yang');
      });
    });

    it('should have yin energy for water elements', () => {
      const waterOrixas = getAllOrixaDays().filter(d => d.element === 'água');
      
      waterOrixas.forEach(orixa => {
        expect(orixa.energy).toBe('yin');
      });
    });
  });

  describe('Day and Element consistency', () => {
    it('should align with orixa-element.ts day mappings', () => {
      const orixaElementMap: Record<string, string> = {
        'Oxalá': 'Sexta-feira',
        'Iemanjá': 'Sábado',
        'Ogum': 'Terça-feira',
        'Oxóssi': 'Quinta-feira',
        'Xangô': 'Quarta-feira',
        'Iansã': 'Terça-feira',
        'Omolu': 'Segunda-feira',
        'Nanã': 'Terça-feira'
      };

      Object.entries(orixaElementMap).forEach(([orixa, expectedDay]) => {
        const result = getOrixaDay(orixa);
        expect(result?.day).toBe(expectedDay);
      });
    });
  });
});