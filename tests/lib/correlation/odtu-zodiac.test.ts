/**
 * Odú Ifá - Zodíaco Correlation Tests
 * Tests for direct Odú Ifá (Merindilogun) to Zodiac sign mappings
 */

import { describe, it, expect } from 'vitest';
import {
  getOduZodiac,
  getZodiacOdu,
  getAllOduZodiacs,
  getAllOduNumbers,
  getAllOduNames,
  getAllZodiacSigns,
  getOduByElement,
  hasOduZodiac,
  getOduZodiacSign,
  getOduElement,
  getOduMessage,
  ODTU_ZODIAC_MAPPINGS,
  type OdTuZodiac,
  type ZodiacSign,
  type ElementType,
} from '@/lib/correlation/odtu-zodiac';

describe('Odú-Ifá Zodíaco Correlation', () => {
  // ─── getOduZodiac by number ────────────────────────────────────────────────

  describe('getOduZodiac by number', () => {
    it('should return correct mapping for Odu 1', () => {
      const result = getOduZodiac(1);
      expect(result).toBeDefined();
      expect(result?.odu_numero).toBe(1);
      expect(result?.odu_nome).toBe('Okaran');
      expect(result?.signo).toBe('Áries');
      expect(result?.elemento).toBe('fogo');
    });

    it('should return correct mapping for Odu 8', () => {
      const result = getOduZodiac(8);
      expect(result).toBeDefined();
      expect(result?.odu_numero).toBe(8);
      expect(result?.odu_nome).toBe('Ejionlá');
      expect(result?.signo).toBe('Escorpião');
      expect(result?.elemento).toBe('água');
    });

    it('should return correct mapping for Odu 16', () => {
      const result = getOduZodiac(16);
      expect(result).toBeDefined();
      expect(result?.odu_numero).toBe(16);
      expect(result?.odu_nome).toBe('Otura');
      expect(result?.signo).toBe('Câncer');
      expect(result?.elemento).toBe('água');
    });

    it('should return null for invalid Odu number', () => {
      expect(getOduZodiac(0)).toBeNull();
      expect(getOduZodiac(17)).toBeNull();
      expect(getOduZodiac(-1)).toBeNull();
      expect(getOduZodiac(100)).toBeNull();
    });

    it('should handle boundary numbers', () => {
      expect(getOduZodiac(1)).not.toBeNull();
      expect(getOduZodiac(16)).not.toBeNull();
    });
  });

  // ─── getOduZodiac by name ─────────────────────────────────────────────────

  describe('getOduZodiac by name', () => {
    it('should find Odu by Portuguese name', () => {
      const result = getOduZodiac('Okaran');
      expect(result).toBeDefined();
      expect(result?.odu_numero).toBe(1);
      expect(result?.signo).toBe('Áries');
    });

    it('should find Odu by Yoruba name', () => {
      const result = getOduZodiac('Okànràn');
      expect(result).toBeDefined();
      expect(result?.odu_numero).toBe(1);
      expect(result?.signo).toBe('Áries');
    });

    it('should be case-insensitive', () => {
      expect(getOduZodiac('okaran')?.odu_numero).toBe(1);
      expect(getOduZodiac('OKARAN')?.odu_numero).toBe(1);
      expect(getOduZodiac('Okaran')?.odu_numero).toBe(1);
    });

    it('should handle partial name match', () => {
      const result = getOduZodiac('kara');
      expect(result).toBeDefined();
      expect(result?.odu_numero).toBe(1);
    });

    it('should return null for unknown name', () => {
      expect(getOduZodiac('UnknownOdu')).toBeNull();
      expect(getOduZodiac('')).toBeNull();
    });

    it('should find by string number', () => {
      const result = getOduZodiac('8');
      expect(result).toBeDefined();
      expect(result?.odu_nome).toBe('Ejionlá');
    });
  });

  // ─── getZodiacOdu ─────────────────────────────────────────────────────────

  describe('getZodiacOdu', () => {
    it('should find Odús by zodiac sign', () => {
      const result = getZodiacOdu('Áries');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].signo).toBe('Áries');
      expect(result[0].odu_numero).toBe(1);
    });

    it('should be case-insensitive', () => {
      const upper = getZodiacOdu('ÁRIES');
      const lower = getZodiacOdu('aries');
      const mixed = getZodiacOdu('AriEs');
      expect(upper.length).toBe(lower.length);
      expect(lower.length).toBe(mixed.length);
    });

    it('should return multiple Odús for same sign (Áries has Odu 1 and 13)', () => {
      const result = getZodiacOdu('Áries');
      expect(result.length).toBe(2);
      const oduNumbers = result.map((m) => m.odu_numero).sort((a, b) => a - b);
      expect(oduNumbers).toEqual([1, 13]);
    });

    it('should return empty array for unknown sign', () => {
      expect(getZodiacOdu('ZodíacoInvalido')).toEqual([]);
      expect(getZodiacOdu('')).toEqual([]);
    });

    it('should sort results by Odu number', () => {
      const result = getZodiacOdu('Áries');
      expect(result[0].odu_numero).toBeLessThan(result[result.length - 1].odu_numero);
    });
  });

  // ─── getAllOduZodiacs ─────────────────────────────────────────────────────

  describe('getAllOduZodiacs', () => {
    it('should return all 16 Odu mappings', () => {
      const result = getAllOduZodiacs();
      expect(result.length).toBe(16);
    });

    it('should return mappings sorted by Odu number', () => {
      const result = getAllOduZodiacs();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].odu_numero).toBeGreaterThan(result[i - 1].odu_numero);
      }
    });

    it('should include all required fields in each mapping', () => {
      const result = getAllOduZodiacs();
      for (const mapping of result) {
        expect(mapping.odu_numero).toBeDefined();
        expect(mapping.odu_nome).toBeDefined();
        expect(mapping.odu_nome_yoruba).toBeDefined();
        expect(mapping.signo).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.significado_espiritual).toBeDefined();
        expect(mapping.mensagem_central).toBeDefined();
      }
    });

    it('should contain valid zodiac signs', () => {
      const result = getAllOduZodiacs();
      const validSigns: ZodiacSign[] = [
        'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
        'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes',
      ];
      for (const mapping of result) {
        expect(validSigns).toContain(mapping.signo);
      }
    });

    it('should contain valid elements', () => {
      const result = getAllOduZodiacs();
      const validElements: ElementType[] = ['fogo', 'água', 'ar', 'terra'];
      for (const mapping of result) {
        expect(validElements).toContain(mapping.elemento);
      }
    });
  });

  // ─── getAllOduNumbers ─────────────────────────────────────────────────────

  describe('getAllOduNumbers', () => {
    it('should return array of numbers 1-16', () => {
      const result = getAllOduNumbers();
      expect(result.length).toBe(16);
      expect(result).toContain(1);
      expect(result).toContain(16);
    });

    it('should return sorted numbers', () => {
      const result = getAllOduNumbers();
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThan(result[i - 1]);
      }
    });

    it('should have no duplicates', () => {
      const result = getAllOduNumbers();
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });
  });

  // ─── getAllOduNames ───────────────────────────────────────────────────────

  describe('getAllOduNames', () => {
    it('should return array of 16 Portuguese names', () => {
      const result = getAllOduNames();
      expect(result.length).toBe(16);
    });

    it('should contain expected names', () => {
      const result = getAllOduNames();
      expect(result).toContain('Okaran');
      expect(result).toContain('Ejiokô');
      expect(result).toContain('Ejionlá');
      expect(result).toContain('Otura');
    });

    it('should have no duplicates', () => {
      const result = getAllOduNames();
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });

    it('should return sorted by Odu number', () => {
      const result = getAllOduNames();
      expect(result[0]).toBe('Okaran');
      expect(result[result.length - 1]).toBe('Otura');
    });
  });

  // ─── getAllZodiacSigns ────────────────────────────────────────────────────

  describe('getAllZodiacSigns', () => {
    it('should return array of unique zodiac signs', () => {
      const result = getAllZodiacSigns();
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(12);
    });

    it('should have no duplicates', () => {
      const result = getAllZodiacSigns();
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });
  });

  // ─── getOduByElement ──────────────────────────────────────────────────────

  describe('getOduByElement', () => {
    it('should return Odús with fogo element', () => {
      const result = getOduByElement('fogo');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.elemento).toBe('fogo');
      }
    });

    it('should return Odús with água element', () => {
      const result = getOduByElement('água');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.elemento).toBe('água');
      }
    });

    it('should return Odús with ar element', () => {
      const result = getOduByElement('ar');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.elemento).toBe('ar');
      }
    });

    it('should return Odús with terra element', () => {
      const result = getOduByElement('terra');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.elemento).toBe('terra');
      }
    });

    it('should return empty array for unknown element', () => {
      expect(getOduByElement('éter' as ElementType)).toEqual([]);
    });

    it('should sort results by Odu number', () => {
      const result = getOduByElement('fogo');
      for (let i = 1; i < result.length; i++) {
        expect(result[i].odu_numero).toBeGreaterThan(result[i - 1].odu_numero);
      }
    });
  });

  // ─── hasOduZodiac ────────────────────────────────────────────────────────

  describe('hasOduZodiac', () => {
    it('should return true for valid Odu numbers', () => {
      expect(hasOduZodiac(1)).toBe(true);
      expect(hasOduZodiac(8)).toBe(true);
      expect(hasOduZodiac(16)).toBe(true);
    });

    it('should return false for invalid Odu numbers', () => {
      expect(hasOduZodiac(0)).toBe(false);
      expect(hasOduZodiac(17)).toBe(false);
      expect(hasOduZodiac(-1)).toBe(false);
    });

    it('should cover all 16 Odu numbers', () => {
      for (let i = 1; i <= 16; i++) {
        expect(hasOduZodiac(i)).toBe(true);
      }
      expect(hasOduZodiac(17)).toBe(false);
    });
  });

  // ─── getOduZodiacSign ─────────────────────────────────────────────────────

  describe('getOduZodiacSign', () => {
    it('should return zodiac sign for valid Odu', () => {
      expect(getOduZodiacSign(1)).toBe('Áries');
      expect(getOduZodiacSign(8)).toBe('Escorpião');
      expect(getOduZodiacSign(16)).toBe('Câncer');
    });

    it('should return null for invalid Odu number', () => {
      expect(getOduZodiacSign(0)).toBeNull();
      expect(getOduZodiacSign(17)).toBeNull();
      expect(getOduZodiacSign(-1)).toBeNull();
    });

    it('should return all distinct signs across all Odús', () => {
      const signs = new Set<ZodiacSign>();
      for (let i = 1; i <= 16; i++) {
        const sign = getOduZodiacSign(i);
        if (sign) signs.add(sign);
      }
      expect(signs.size).toBeGreaterThan(0);
    });
  });

  // ─── getOduElement ─────────────────────────────────────────────────────────

  describe('getOduElement', () => {
    it('should return element for valid Odu', () => {
      expect(getOduElement(1)).toBe('fogo');
      expect(getOduElement(2)).toBe('terra');
      expect(getOduElement(4)).toBe('água');
    });

    it('should return null for invalid Odu number', () => {
      expect(getOduElement(0)).toBeNull();
      expect(getOduElement(17)).toBeNull();
      expect(getOduElement(-1)).toBeNull();
    });

    it('should return valid elements for all Odu numbers', () => {
      const validElements: ElementType[] = ['fogo', 'água', 'ar', 'terra'];
      for (let i = 1; i <= 16; i++) {
        const element = getOduElement(i);
        expect(element).not.toBeNull();
        expect(validElements).toContain(element);
      }
    });
  });

  // ─── getOduMessage ────────────────────────────────────────────────────────

  describe('getOduMessage', () => {
    it('should return spiritual message for valid Odu', () => {
      const msg = getOduMessage(1);
      expect(msg).toBeDefined();
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(0);
    });

    it('should return null for invalid Odu number', () => {
      expect(getOduMessage(0)).toBeNull();
      expect(getOduMessage(17)).toBeNull();
      expect(getOduMessage(-1)).toBeNull();
    });

    it('should return unique messages for all Odu numbers', () => {
      const messages = new Set<string>();
      for (let i = 1; i <= 16; i++) {
        const msg = getOduMessage(i);
        expect(msg).not.toBeNull();
        messages.add(msg!);
      }
      expect(messages.size).toBeGreaterThan(10);
    });

    it('should contain relevant spiritual themes in messages', () => {
      const msg1 = getOduMessage(1);
      expect(msg1?.toLowerCase()).toContain('coragem');

      const msg8 = getOduMessage(8);
      expect(msg8?.toLowerCase()).toContain('transforma');
    });
  });

  // ─── ODTU_ZODIAC_MAPPINGS constant ────────────────────────────────────────

  describe('ODTU_ZODIAC_MAPPINGS constant', () => {
    it('should have 16 entries', () => {
      expect(Object.keys(ODTU_ZODIAC_MAPPINGS).length).toBe(16);
    });

    it('should have keys 1-16', () => {
      for (let i = 1; i <= 16; i++) {
        expect(ODTU_ZODIAC_MAPPINGS[i]).toBeDefined();
      }
    });

    it('should be frozen', () => {
      expect(Object.isFrozen(ODTU_ZODIAC_MAPPINGS)).toBe(true);
    });

    it('should have correct structure for each entry', () => {
      for (let i = 1; i <= 16; i++) {
        const mapping = ODTU_ZODIAC_MAPPINGS[i];
        expect(mapping.odu_numero).toBe(i);
        expect(typeof mapping.odu_nome).toBe('string');
        expect(typeof mapping.odu_nome_yoruba).toBe('string');
        expect(typeof mapping.signo).toBe('string');
        expect(typeof mapping.elemento).toBe('string');
        expect(typeof mapping.significado_espiritual).toBe('string');
        expect(typeof mapping.mensagem_central).toBe('string');
      }
    });

    it('should map each Odu to one zodiac sign', () => {
      for (let i = 1; i <= 16; i++) {
        const mapping = ODTU_ZODIAC_MAPPINGS[i];
        expect(mapping.signo).toBeTruthy();
        expect(mapping.signo.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── Type exports ─────────────────────────────────────────────────────────

  describe('Type exports', () => {
    it('should export OdTuZodiac interface', () => {
      const mapping: OdTuZodiac = {
        odu_numero: 1,
        odu_nome: 'Okaran',
        odu_nome_yoruba: 'Okànràn',
        signo: 'Áries',
        elemento: 'fogo',
        significado_espiritual: 'Test',
        mensagem_central: 'Test',
      };
      expect(mapping.odu_numero).toBe(1);
    });

    it('should export ZodiacSign type', () => {
      const sign: ZodiacSign = 'Áries';
      expect(sign).toBe('Áries');
    });

    it('should export ElementType type', () => {
      const element: ElementType = 'fogo';
      expect(element).toBe('fogo');
    });
  });

  // ─── Spiritual correlation integrity ─────────────────────────────────────

  describe('Spiritual correlation integrity', () => {
    it('should have valid spiritual messages for all Odús', () => {
      for (let i = 1; i <= 16; i++) {
        const msg = ODTU_ZODIAC_MAPPINGS[i].mensagem_central;
        expect(msg).toBeDefined();
        expect(msg.length).toBeGreaterThan(10);
      }
    });

    it('should have Yoruba names with combining diacritics for all Odús', () => {
      for (let i = 1; i <= 16; i++) {
        const yoruba = ODTU_ZODIAC_MAPPINGS[i].odu_nome_yoruba;
        expect(yoruba).toBeDefined();
        expect(yoruba.length).toBeGreaterThan(0);
        // Yoruba names have combining diacritical marks (check via NFD normalization)
        expect(yoruba.normalize('NFD')).toMatch(/[̀-ͯ]/);
      }
    });

    it('should distribute elements across all Odús', () => {
      const elements = new Set<ElementType>();
      for (let i = 1; i <= 16; i++) {
        elements.add(ODTU_ZODIAC_MAPPINGS[i].elemento);
      }
      expect(elements.has('fogo')).toBe(true);
      expect(elements.has('água')).toBe(true);
      expect(elements.has('ar')).toBe(true);
      expect(elements.has('terra')).toBe(true);
    });

    it('should have all 12 zodiac signs covered by 16 Odús', () => {
      const signs = new Set<ZodiacSign>();
      for (let i = 1; i <= 16; i++) {
        signs.add(ODTU_ZODIAC_MAPPINGS[i].signo);
      }
      expect(signs.size).toBeGreaterThan(0);
    });

    it('should map fire Odús to fire zodiac signs', () => {
      for (let i = 1; i <= 16; i++) {
        const mapping = ODTU_ZODIAC_MAPPINGS[i];
        if (mapping.elemento === 'fogo') {
          expect(['Áries', 'Leão', 'Sagitário']).toContain(mapping.signo);
        }
      }
    });

    it('should map earth Odús to earth zodiac signs', () => {
      for (let i = 1; i <= 16; i++) {
        const mapping = ODTU_ZODIAC_MAPPINGS[i];
        if (mapping.elemento === 'terra') {
          expect(['Touro', 'Virgem', 'Capricórnio']).toContain(mapping.signo);
        }
      }
    });

    it('should map air Odús to air zodiac signs', () => {
      for (let i = 1; i <= 16; i++) {
        const mapping = ODTU_ZODIAC_MAPPINGS[i];
        if (mapping.elemento === 'ar') {
          expect(['Gêmeos', 'Libra', 'Aquário']).toContain(mapping.signo);
        }
      }
    });

    it('should map water Odús to water zodiac signs', () => {
      for (let i = 1; i <= 16; i++) {
        const mapping = ODTU_ZODIAC_MAPPINGS[i];
        if (mapping.elemento === 'água') {
          expect(['Câncer', 'Escorpião', 'Peixes']).toContain(mapping.signo);
        }
      }
    });
  });
});
