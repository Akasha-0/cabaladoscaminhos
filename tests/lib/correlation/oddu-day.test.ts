/**
 * Odú Ifá - Day Correlation Tests
 * Tests for Odú Ifá to days of the week mappings
 */

import { describe, it, expect } from 'vitest';
import {
  getOduDay,
  getDayOdu,
  getAllOduDays,
  getAllDaysWithOdus,
  getAllOduNumbers,
  getAllOduNames,
  getOduDaysByElement,
  hasOduDay,
  hasDayOdu,
  getPrimaryDayForOdu,
  getOduElement,
  type OduDay,
  type ElementType,
} from '@/lib/correlation/oddu-day';

describe('Odú Ifá - Day Correlation', () => {
  // ─── getOduDay by number ──────────────────────────────────────────────────

  describe('getOduDay by number', () => {
    it('should return mappings for Odu 1 (Okaran) → Segunda-feira, Domingo', () => {
      const result = getOduDay(1);
      expect(result).toHaveLength(2);
      expect(result[0].odu_numero).toBe(1);
      expect(result[0].odu_nome).toBe('Okaran');
      expect(result[0].dia).toBe('Segunda-feira');
      expect(result[0].elemento).toBe('éter');
      expect(result[1].dia).toBe('Domingo');
    });

    it('should return mapping for Odu 2 (Ejiokô) → Sábado', () => {
      const result = getOduDay(2);
      expect(result).toHaveLength(1);
      expect(result[0].odu_numero).toBe(2);
      expect(result[0].odu_nome).toBe('Ejiokô');
      expect(result[0].dia).toBe('Sábado');
      expect(result[0].elemento).toBe('água');
    });

    it('should return mappings for Odu 3 (Etaogundá) → Segunda-feira, Domingo', () => {
      const result = getOduDay(3);
      expect(result).toHaveLength(2);
      expect(result[0].odu_numero).toBe(3);
      expect(result[0].odu_nome).toBe('Etaogundá');
      expect(result[1].dia).toBe('Domingo');
    });

    it('should return mapping for Odu 4 (Irosun) → Sábado', () => {
      const result = getOduDay(4);
      expect(result).toHaveLength(1);
      expect(result[0].odu_numero).toBe(4);
      expect(result[0].odu_nome).toBe('Irosun');
      expect(result[0].dia).toBe('Sábado');
    });

    it('should return mapping for Odu 5 (Oxé) → Terça-feira', () => {
      const result = getOduDay(5);
      expect(result).toHaveLength(1);
      expect(result[0].odu_numero).toBe(5);
      expect(result[0].odu_nome).toBe('Oxé');
      expect(result[0].dia).toBe('Terça-feira');
      expect(result[0].elemento).toBe('fogo');
    });

    it('should return mappings for Odu 6 (Obará) → Segunda-feira, Domingo', () => {
      const result = getOduDay(6);
      expect(result).toHaveLength(2);
      expect(result[0].odu_numero).toBe(6);
      expect(result[0].odu_nome).toBe('Obará');
      expect(result[0].elemento).toBe('terra');
    });

    it('should return mappings for Odu 7 (Odi) → Segunda-feira, Domingo', () => {
      const result = getOduDay(7);
      expect(result).toHaveLength(2);
      expect(result[0].odu_numero).toBe(7);
      expect(result[0].odu_nome).toBe('Odi');
      expect(result[0].elemento).toBe('água');
    });

    it('should return mapping for Odu 8 (Ejionlá) → Sábado', () => {
      const result = getOduDay(8);
      expect(result).toHaveLength(1);
      expect(result[0].odu_numero).toBe(8);
      expect(result[0].odu_nome).toBe('Ejionlá');
      expect(result[0].dia).toBe('Sábado');
    });

    it('should return mappings for Odu 9 (Oshe) → Segunda-feira, Domingo', () => {
      const result = getOduDay(9);
      expect(result).toHaveLength(2);
      expect(result[0].odu_numero).toBe(9);
      expect(result[0].odu_nome).toBe('Oshe');
    });

    it('should return mappings for Odu 10 (Ofun) → Segunda-feira, Domingo', () => {
      const result = getOduDay(10);
      expect(result).toHaveLength(2);
      expect(result[0].odu_numero).toBe(10);
      expect(result[0].odu_nome).toBe('Ofun');
      expect(result[0].elemento).toBe('éter');
    });

    it('should return mapping for Odu 11 (Eyonla) → Terça-feira', () => {
      const result = getOduDay(11);
      expect(result).toHaveLength(1);
      expect(result[0].odu_numero).toBe(11);
      expect(result[0].odu_nome).toBe('Eyonla');
      expect(result[0].dia).toBe('Terça-feira');
      expect(result[0].elemento).toBe('terra');
    });

    it('should return mapping for Odu 12 (Merinla) → Terça-feira', () => {
      const result = getOduDay(12);
      expect(result).toHaveLength(1);
      expect(result[0].odu_numero).toBe(12);
      expect(result[0].odu_nome).toBe('Merinla');
      expect(result[0].dia).toBe('Terça-feira');
    });

    it('should return mapping for Odu 13 (Mero) → Sábado', () => {
      const result = getOduDay(13);
      expect(result).toHaveLength(1);
      expect(result[0].odu_numero).toBe(13);
      expect(result[0].odu_nome).toBe('Mero');
      expect(result[0].dia).toBe('Sábado');
      expect(result[0].elemento).toBe('água');
    });

    it('should return mapping for Odu 14 (Jinza) → Terça-feira', () => {
      const result = getOduDay(14);
      expect(result).toHaveLength(1);
      expect(result[0].odu_numero).toBe(14);
      expect(result[0].odu_nome).toBe('Jinza');
      expect(result[0].dia).toBe('Terça-feira');
      expect(result[0].elemento).toBe('fogo');
    });

    it('should return mappings for Odu 15 (Jotagbe) → Segunda-feira, Domingo', () => {
      const result = getOduDay(15);
      expect(result).toHaveLength(2);
      expect(result[0].odu_numero).toBe(15);
      expect(result[0].odu_nome).toBe('Jotagbe');
    });

    it('should return mappings for Odu 16 (Otura) → Terça-feira, Segunda-feira', () => {
      const result = getOduDay(16);
      expect(result).toHaveLength(2);
      expect(result[0].odu_numero).toBe(16);
      expect(result[0].odu_nome).toBe('Otura');
      expect(result[0].elemento).toBe('terra');
    });

    it('should return empty array for invalid Odu number', () => {
      const result = getOduDay(99);
      expect(result).toHaveLength(0);
    });

    it('should return empty array for Odu number 0', () => {
      const result = getOduDay(0);
      expect(result).toHaveLength(0);
    });
  });

  // ─── getOduDay by name ────────────────────────────────────────────────────

  describe('getOduDay by name', () => {
    it('should return mappings for Odu name "Okaran"', () => {
      const result = getOduDay('Okaran');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].odu_nome).toBe('Okaran');
    });

    it('should return mappings for Odu name "Ejiokô"', () => {
      const result = getOduDay('Ejiokô');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].odu_nome).toBe('Ejiokô');
    });

    it('should be case-insensitive', () => {
      const result = getOduDay('okaran');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].odu_nome).toBe('Okaran');
    });

    it('should return empty array for unknown Odu name', () => {
      const result = getOduDay('UnknownOdu');
      expect(result).toHaveLength(0);
    });

    it('should return empty array for empty string', () => {
      const result = getOduDay('');
      expect(result).toHaveLength(0);
    });
  });

  // ─── getDayOdu ────────────────────────────────────────────────────────────

  describe('getDayOdu', () => {
    it('should return Odus for Segunda-feira', () => {
      const result = getDayOdu('Segunda-feira');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.dia === 'Segunda-feira')).toBe(true);
    });

    it('should return Odus for Terça-feira', () => {
      const result = getDayOdu('Terça-feira');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.dia === 'Terça-feira')).toBe(true);
    });

    it('should return Odus for Quarta-feira', () => {
      const result = getDayOdu('Quarta-feira');
      expect(result).toHaveLength(0); // No Odus mapped to Wednesday
    });

    it('should return Odus for Quinta-feira', () => {
      const result = getDayOdu('Quinta-feira');
      expect(result).toHaveLength(0); // No Odus mapped to Thursday
    });

    it('should return Odus for Sexta-feira', () => {
      const result = getDayOdu('Sexta-feira');
      expect(result).toHaveLength(0); // No Odus mapped to Friday
    });

    it('should return Odus for Sábado', () => {
      const result = getDayOdu('Sábado');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.dia === 'Sábado')).toBe(true);
    });

    it('should return Odus for Domingo', () => {
      const result = getDayOdu('Domingo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.dia === 'Domingo')).toBe(true);
    });

    it('should return empty array for unknown day', () => {
      const result = getDayOdu('UnknownDay');
      expect(result).toHaveLength(0);
    });

    it('should return empty array for empty string', () => {
      const result = getDayOdu('');
      expect(result).toHaveLength(0);
    });
  });

  // ─── getAllOduDays ────────────────────────────────────────────────────────

  describe('getAllOduDays', () => {
    it('should return all Odu-Day mappings', () => {
      const result = getAllOduDays();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should contain all 16 Odus', () => {
      const result = getAllOduDays();
      const oduNumbers = new Set(result.map((m) => m.odu_numero));
      expect(oduNumbers.size).toBe(16);
    });

    it('should have 24 total mappings (some Odus have multiple days)', () => {
      const result = getAllOduDays();
      expect(result.length).toBe(24);
    });

    it('should include all required interface properties', () => {
      const result = getAllOduDays();
      const mapping = result[0];
      expect(mapping).toHaveProperty('odu_numero');
      expect(mapping).toHaveProperty('odu_nome');
      expect(mapping).toHaveProperty('odu_nome_yoruba');
      expect(mapping).toHaveProperty('dia');
      expect(mapping).toHaveProperty('elemento');
      expect(mapping).toHaveProperty('significado_espiritual');
    });
  });

  // ─── getAllOduNumbers ─────────────────────────────────────────────────────

  describe('getAllOduNumbers', () => {
    it('should return array of Odu numbers', () => {
      const result = getAllOduNumbers();
      expect(result).toContain(1);
      expect(result).toContain(16);
    });

    it('should return sorted numbers 1-16', () => {
      const result = getAllOduNumbers();
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    });

    it('should have exactly 16 numbers', () => {
      const result = getAllOduNumbers();
      expect(result).toHaveLength(16);
    });
  });

  // ─── getAllOduNames ───────────────────────────────────────────────────────

  describe('getAllOduNames', () => {
    it('should return all 16 unique Odu names', () => {
      const result = getAllOduNames();
      expect(result).toHaveLength(16);
    });

    it('should include key Odu names', () => {
      const result = getAllOduNames();
      expect(result).toContain('Okaran');
      expect(result).toContain('Ejiokô');
      expect(result).toContain('Otura');
    });

    it('should not have duplicates', () => {
      const result = getAllOduNames();
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });
  });

  // ─── getAllDaysWithOdus ───────────────────────────────────────────────────

  describe('getAllDaysWithOdus', () => {
    it('should return days that have Odu mappings', () => {
      const result = getAllDaysWithOdus();
      expect(result).toContain('Segunda-feira');
      expect(result).toContain('Terça-feira');
      expect(result).toContain('Sábado');
      expect(result).toContain('Domingo');
    });

    it('should not include days without mappings', () => {
      const result = getAllDaysWithOdus();
      expect(result).not.toContain('Quarta-feira');
      expect(result).not.toContain('Quinta-feira');
      expect(result).not.toContain('Sexta-feira');
    });

    it('should return 4 days with Odu mappings', () => {
      const result = getAllDaysWithOdus();
      expect(result).toHaveLength(4);
    });
  });

  // ─── getOduDaysByElement ──────────────────────────────────────────────────

  describe('getOduDaysByElement', () => {
    it('should return Odus for element fogo', () => {
      const result = getOduDaysByElement('fogo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.elemento === 'fogo')).toBe(true);
    });

    it('should return Odus for element água', () => {
      const result = getOduDaysByElement('água');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.elemento === 'água')).toBe(true);
    });

    it('should return Odus for element terra', () => {
      const result = getOduDaysByElement('terra');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.elemento === 'terra')).toBe(true);
    });

    it('should return Odus for element éter', () => {
      const result = getOduDaysByElement('éter');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.elemento === 'éter')).toBe(true);
    });

    it('should return Odus for element ar', () => {
      const result = getOduDaysByElement('ar');
      expect(result.length).toBe(0); // No Odus have 'ar' element
    });
  });

  // ─── hasOduDay ────────────────────────────────────────────────────────────

  describe('hasOduDay', () => {
    it('should return true for valid Odu numbers', () => {
      expect(hasOduDay(1)).toBe(true);
      expect(hasOduDay(8)).toBe(true);
      expect(hasOduDay(16)).toBe(true);
    });

    it('should return false for invalid Odu numbers', () => {
      expect(hasOduDay(0)).toBe(false);
      expect(hasOduDay(17)).toBe(false);
      expect(hasOduDay(99)).toBe(false);
    });
  });

  // ─── hasDayOdu ────────────────────────────────────────────────────────────

  describe('hasDayOdu', () => {
    it('should return true for days with mappings', () => {
      expect(hasDayOdu('Segunda-feira')).toBe(true);
      expect(hasDayOdu('Terça-feira')).toBe(true);
      expect(hasDayOdu('Sábado')).toBe(true);
      expect(hasDayOdu('Domingo')).toBe(true);
    });

    it('should return false for days without mappings', () => {
      expect(hasDayOdu('Quarta-feira')).toBe(false);
      expect(hasDayOdu('Quinta-feira')).toBe(false);
      expect(hasDayOdu('Sexta-feira')).toBe(false);
    });

    it('should return false for unknown day', () => {
      expect(hasDayOdu('UnknownDay')).toBe(false);
    });
  });

  // ─── getPrimaryDayForOdu ─────────────────────────────────────────────────

  describe('getPrimaryDayForOdu', () => {
    it('should return primary day for Odu 1', () => {
      expect(getPrimaryDayForOdu(1)).toBe('Segunda-feira');
    });

    it('should return primary day for Odu 2', () => {
      expect(getPrimaryDayForOdu(2)).toBe('Sábado');
    });

    it('should return primary day for Odu 5', () => {
      expect(getPrimaryDayForOdu(5)).toBe('Terça-feira');
    });

    it('should return null for invalid Odu', () => {
      expect(getPrimaryDayForOdu(99)).toBeNull();
    });
  });

  // ─── getOduElement ────────────────────────────────────────────────────────

  describe('getOduElement', () => {
    it('should return element for Odu 1', () => {
      expect(getOduElement(1)).toBe('éter');
    });

    it('should return element for Odu 2', () => {
      expect(getOduElement(2)).toBe('água');
    });

    it('should return element for Odu 5', () => {
      expect(getOduElement(5)).toBe('fogo');
    });

    it('should return element for Odu 6', () => {
      expect(getOduElement(6)).toBe('terra');
    });

    it('should return null for invalid Odu', () => {
      expect(getOduElement(99)).toBeNull();
    });
  });

  // ─── Spiritual Meaning Validation ────────────────────────────────────────

  describe('Spiritual Meaning Validation', () => {
    it('should have spiritual meaning for all mappings', () => {
      const allMappings = getAllOduDays();
      for (const mapping of allMappings) {
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
      }
    });

    it('should have Yoruba names for all Odus', () => {
      const allMappings = getAllOduDays();
      for (const mapping of allMappings) {
        expect(mapping.odu_nome_yoruba).toBeDefined();
        expect(mapping.odu_nome_yoruba.length).toBeGreaterThan(0);
      }
    });

    it('should have valid element values', () => {
      const validElements: ElementType[] = ['fogo', 'água', 'ar', 'terra', 'éter'];
      const allMappings = getAllOduDays();
      for (const mapping of allMappings) {
        expect(validElements).toContain(mapping.elemento);
      }
    });
  });

  // ─── Type Exports ────────────────────────────────────────────────────────

  describe('Type exports', () => {
    it('should export OduDay interface', () => {
      const mapping: OduDay = {
        odu_numero: 1,
        odu_nome: 'Okaran',
        odu_nome_yoruba: 'Okànràn',
        dia: 'Segunda-feira',
        elemento: 'éter',
        significado_espiritual: 'Teste',
      };
      expect(mapping.odu_numero).toBe(1);
    });

    it('should export ElementType', () => {
      const element: ElementType = 'água';
      expect(element).toBe('água');
    });
  });
});
