/**
 * Odú Ifá - Chakra Correlation Tests
 * Tests for direct Odú Ifá to Chakra mappings
 */

import { describe, it, expect } from 'vitest';
import {
  getOduChakra,
  getChakraOdu,
  getAllOduChakras,
  getAllOduNumbers,
  getAllOduNames,
  getAllChakraNames,
  getOduByElement,
  getOduByChakra,
  hasOduChakra,
  getOduElement,
  getOduChakraName,
  getOduMessage,
  ODDU_CHAKRA_MAPPINGS,
  type OduChakraMapping,
  type OduElementoType,
} from '@/lib/correlation/oddu-chakra';

describe('Odú-Ifá Chakra Correlation', () => {
  // ─── getOduChakra by number ────────────────────────────────────────────────

  describe('getOduChakra by number', () => {
    it('should return correct mapping for Odu 1 (Okaran) → Ajna', () => {
      const result = getOduChakra(1);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(1);
      expect(result!.odu_nome).toBe('Okaran');
      expect(result!.chakra).toBe('Ajna');
      expect(result!.elemento).toBe('éter');
    });

    it('should return correct mapping for Odu 2 (Ejiokô) → Svadhisthana', () => {
      const result = getOduChakra(2);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(2);
      expect(result!.odu_nome).toBe('Ejiokô');
      expect(result!.chakra).toBe('Svadhisthana');
      expect(result!.elemento).toBe('água');
    });

    it('should return correct mapping for Odu 3 (Etaogundá) → Manipura', () => {
      const result = getOduChakra(3);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(3);
      expect(result!.odu_nome).toBe('Etaogundá');
      expect(result!.chakra).toBe('Manipura');
      expect(result!.elemento).toBe('fogo');
    });

    it('should return correct mapping for Odu 4 (Irosun) → Ajna', () => {
      const result = getOduChakra(4);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(4);
      expect(result!.odu_nome).toBe('Irosun');
      expect(result!.chakra).toBe('Ajna');
      expect(result!.elemento).toBe('água');
    });

    it('should return correct mapping for Odu 5 (Oxé) → Muladhara', () => {
      const result = getOduChakra(5);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(5);
      expect(result!.odu_nome).toBe('Oxé');
      expect(result!.chakra).toBe('Muladhara');
      expect(result!.elemento).toBe('fogo');
    });

    it('should return correct mapping for Odu 6 (Obará) → Anahata', () => {
      const result = getOduChakra(6);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(6);
      expect(result!.odu_nome).toBe('Obará');
      expect(result!.chakra).toBe('Anahata');
      expect(result!.elemento).toBe('terra');
    });

    it('should return correct mapping for Odu 7 (Odi) → Manipura', () => {
      const result = getOduChakra(7);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(7);
      expect(result!.odu_nome).toBe('Odi');
      expect(result!.chakra).toBe('Manipura');
      expect(result!.elemento).toBe('água');
    });

    it('should return correct mapping for Odu 8 (Osí) → Sahasrara', () => {
      const result = getOduChakra(8);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(8);
      expect(result!.odu_nome).toBe('Osí');
      expect(result!.chakra).toBe('Sahasrara');
      expect(result!.elemento).toBe('éter');
    });

    it('should return correct mapping for Odu 9 (Iuní) → Ajna', () => {
      const result = getOduChakra(9);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(9);
      expect(result!.odu_nome).toBe('Iuní');
      expect(result!.chakra).toBe('Ajna');
      expect(result!.elemento).toBe('ar');
    });

    it('should return correct mapping for Odu 10 (Owonrin) → Muladhara', () => {
      const result = getOduChakra(10);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(10);
      expect(result!.odu_nome).toBe('Owonrin');
      expect(result!.chakra).toBe('Muladhara');
      expect(result!.elemento).toBe('terra');
    });

    it('should return correct mapping for Odu 11 (Ejila) → Vishuddha', () => {
      const result = getOduChakra(11);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(11);
      expect(result!.odu_nome).toBe('Ejila');
      expect(result!.chakra).toBe('Vishuddha');
      expect(result!.elemento).toBe('éter');
    });

    it('should return correct mapping for Odu 12 (Logumí) → Svadhisthana', () => {
      const result = getOduChakra(12);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(12);
      expect(result!.odu_nome).toBe('Logumí');
      expect(result!.chakra).toBe('Svadhisthana');
      expect(result!.elemento).toBe('água');
    });

    it('should return correct mapping for Odu 13 (Odí) → Anahata', () => {
      const result = getOduChakra(13);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(13);
      expect(result!.odu_nome).toBe('Odí');
      expect(result!.chakra).toBe('Anahata');
      expect(result!.elemento).toBe('fogo');
    });

    it('should return correct mapping for Odu 14 (Bejí) → Manipura', () => {
      const result = getOduChakra(14);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(14);
      expect(result!.odu_nome).toBe('Bejí');
      expect(result!.chakra).toBe('Manipura');
      expect(result!.elemento).toBe('fogo');
    });

    it('should return correct mapping for Odu 15 (Ibí) → Svadhisthana', () => {
      const result = getOduChakra(15);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(15);
      expect(result!.odu_nome).toBe('Ibí');
      expect(result!.chakra).toBe('Svadhisthana');
      expect(result!.elemento).toBe('água');
    });

    it('should return correct mapping for Odu 16 (Okandí) → Muladhara', () => {
      const result = getOduChakra(16);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(16);
      expect(result!.odu_nome).toBe('Okandí');
      expect(result!.chakra).toBe('Muladhara');
      expect(result!.elemento).toBe('éter');
    });

    it('should return null for invalid Odu number', () => {
      expect(getOduChakra(0)).toBeNull();
      expect(getOduChakra(17)).toBeNull();
      expect(getOduChakra(-1)).toBeNull();
    });
  });

  // ─── getOduChakra by name ─────────────────────────────────────────────────

  describe('getOduChakra by name', () => {
    it('should find Odu by Portuguese name', () => {
      const result = getOduChakra('Okaran');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(1);
      expect(result!.chakra).toBe('Ajna');
    });

    it('should find Odu by Yoruba name', () => {
      const result = getOduChakra('Okànràn');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(1);
      expect(result!.chakra).toBe('Ajna');
    });

    it('should be case-insensitive', () => {
      const result = getOduChakra('okaran');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(1);
    });

    it('should handle whitespace variations', () => {
      const result = getOduChakra('  Okaran  ');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(1);
    });

    it('should return null for unknown Odu name', () => {
      expect(getOduChakra('UnknownOdu')).toBeNull();
    });
  });

  // ─── getChakraOdu ─────────────────────────────────────────────────────────

  describe('getChakraOdu', () => {
    it('should find all Odús for Ajna chakra', () => {
      const result = getChakraOdu('Ajna');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.chakra === 'Ajna')).toBe(true);
    });

    it('should find Odús by chakra number description', () => {
      const result = getChakraOdu('6º Terceiro Olho');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].chakra).toBe('Ajna');
    });

    it('should return empty array for unknown chakra', () => {
      const result = getChakraOdu('UnknownChakra');
      expect(result).toEqual([]);
    });
  });

  // ─── getAllOduChakras ─────────────────────────────────────────────────────

  describe('getAllOduChakras', () => {
    it('should return all 16 Odu mappings', () => {
      const result = getAllOduChakras();
      expect(result).toHaveLength(16);
    });

    it('should be sorted by Odu number', () => {
      const result = getAllOduChakras();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].odu_numero).toBeLessThan(result[i + 1].odu_numero);
      }
    });

    it('should contain all required fields for each mapping', () => {
      const result = getAllOduChakras();
      for (const mapping of result) {
        expect(mapping).toHaveProperty('odu_numero');
        expect(mapping).toHaveProperty('odu_nome');
        expect(mapping).toHaveProperty('chakra');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('mensagem_central');
        expect(mapping).toHaveProperty('cores');
        expect(mapping).toHaveProperty('qualidades');
      }
    });
  });

  // ─── getAllOduNumbers ──────────────────────────────────────────────────────

  describe('getAllOduNumbers', () => {
    it('should return array of 16 numbers', () => {
      const result = getAllOduNumbers();
      expect(result).toHaveLength(16);
    });

    it('should contain numbers 1-16', () => {
      const result = getAllOduNumbers();
      expect(result).toContain(1);
      expect(result).toContain(16);
    });

    it('should be sorted in ascending order', () => {
      const result = getAllOduNumbers();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]).toBeLessThan(result[i + 1]);
      }
    });
  });

  // ─── getAllOduNames ───────────────────────────────────────────────────────

  describe('getAllOduNames', () => {
    it('should return array of 16 Odu names', () => {
      const result = getAllOduNames();
      expect(result).toHaveLength(16);
    });

    it('should include all known Odu names', () => {
      const result = getAllOduNames();
      expect(result).toContain('Okaran');
      expect(result).toContain('Ejiokô');
      expect(result).toContain('Okandí');
    });
  });

  // ─── getAllChakraNames ────────────────────────────────────────────────────

  describe('getAllChakraNames', () => {
    it('should return unique Chakra names', () => {
      const result = getAllChakraNames();
      // Should have fewer than 16 since multiple Odús map to same chakras
      expect(result.length).toBeLessThanOrEqual(7);
    });

    it('should include all 7 main chakras', () => {
      const result = getAllChakraNames();
      expect(result).toContain('Muladhara');
      expect(result).toContain('Svadhisthana');
      expect(result).toContain('Manipura');
      expect(result).toContain('Anahata');
      expect(result).toContain('Vishuddha');
      expect(result).toContain('Ajna');
      expect(result).toContain('Sahasrara');
    });
  });

  // ─── getOduByElement ─────────────────────────────────────────────────────

  describe('getOduByElement', () => {
    it('should return Odús for fire element', () => {
      const result = getOduByElement('fogo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.elemento === 'fogo')).toBe(true);
    });

    it('should return Odús for water element', () => {
      const result = getOduByElement('água');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.elemento === 'água')).toBe(true);
    });

    it('should return empty array for unknown element', () => {
      const result = getOduByElement('unknown' as OduElementoType);
      expect(result).toEqual([]);
    });
  });

  // ─── getOduByChakra ──────────────────────────────────────────────────────

  describe('getOduByChakra', () => {
    it('should return Odús for Ajna chakra', () => {
      const result = getOduByChakra('Ajna');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((r) => r.chakra === 'Ajna')).toBe(true);
    });

    it('should return empty array for unknown chakra', () => {
      const result = getOduByChakra('UnknownChakra');
      expect(result).toEqual([]);
    });
  });

  // ─── hasOduChakra ──────────────────────────────────────────────────────────

  describe('hasOduChakra', () => {
    it('should return true for valid Odu numbers', () => {
      expect(hasOduChakra(1)).toBe(true);
      expect(hasOduChakra(8)).toBe(true);
      expect(hasOduChakra(16)).toBe(true);
    });

    it('should return false for invalid Odu numbers', () => {
      expect(hasOduChakra(0)).toBe(false);
      expect(hasOduChakra(17)).toBe(false);
      expect(hasOduChakra(-1)).toBe(false);
    });
  });

  // ─── getOduElement ────────────────────────────────────────────────────────

  describe('getOduElement', () => {
    it('should return element for valid Odu number', () => {
      expect(getOduElement(1)).toBe('éter');
      expect(getOduElement(2)).toBe('água');
      expect(getOduElement(3)).toBe('fogo');
    });

    it('should return null for invalid Odu number', () => {
      expect(getOduElement(99)).toBeNull();
    });
  });

  // ─── getOduChakraName ─────────────────────────────────────────────────────

  describe('getOduChakraName', () => {
    it('should return Chakra name for valid Odu number', () => {
      expect(getOduChakraName(1)).toBe('Ajna');
      expect(getOduChakraName(2)).toBe('Svadhisthana');
      expect(getOduChakraName(8)).toBe('Sahasrara');
    });

    it('should return null for invalid Odu number', () => {
      expect(getOduChakraName(99)).toBeNull();
    });
  });

  // ─── getOduMessage ─────────────────────────────────────────────────────────

  describe('getOduMessage', () => {
    it('should return message for valid Odu number', () => {
      const message = getOduMessage(1);
      expect(message).not.toBeNull();
      expect(typeof message).toBe('string');
      expect(message!.length).toBeGreaterThan(0);
    });

    it('should return null for invalid Odu number', () => {
      expect(getOduMessage(99)).toBeNull();
    });
  });

  // ─── ODDU_CHAKRA_MAPPINGS constant ─────────────────────────────────────────

  describe('ODDU_CHAKRA_MAPPINGS constant', () => {
    it('should have exactly 16 entries', () => {
      expect(Object.keys(ODDU_CHAKRA_MAPPINGS)).toHaveLength(16);
    });

    it('should have keys 1-16', () => {
      const keys = Object.keys(ODDU_CHAKRA_MAPPINGS).map(Number);
      for (let i = 1; i <= 16; i++) {
        expect(keys).toContain(i);
      }
    });

    it('should be frozen to prevent modifications', () => {
      expect(Object.isFrozen(ODDU_CHAKRA_MAPPINGS)).toBe(true);
    });

    it('should have proper structure for each entry', () => {
      for (const [num, mapping] of Object.entries(ODDU_CHAKRA_MAPPINGS)) {
        expect(mapping.odu_numero).toBe(Number(num));
        expect(mapping.odu_nome).toBeTruthy();
        expect(mapping.odu_nome_yoruba).toBeTruthy();
        expect(mapping.chakra).toBeTruthy();
        expect(mapping.chakra_numero).toBeTruthy();
        expect(mapping.elemento).toBeTruthy();
        expect(mapping.chakra_elemento).toBeTruthy();
        expect(mapping.significado_espiritual).toBeTruthy();
        expect(mapping.mensagem_central).toBeTruthy();
        expect(Array.isArray(mapping.cores)).toBe(true);
        expect(Array.isArray(mapping.qualidades)).toBe(true);
      }
    });
  });

  // ─── Type exports ─────────────────────────────────────────────────────────

  describe('Type exports', () => {
    it('should export OduChakraMapping interface', () => {
      const mapping: OduChakraMapping = {
        odu_numero: 1,
        odu_nome: 'Okaran',
        odu_nome_yoruba: 'Okànràn',
        chakra: 'Ajna',
        chakra_numero: '6º Terceiro Olho',
        elemento: 'éter',
        chakra_elemento: 'Éter',
        significado_espiritual: 'Test',
        mensagem_central: 'Test',
        cores: ['branco'],
        qualidades: ['intuição'],
      };
      expect(mapping.odu_numero).toBe(1);
    });

    it('should export OduElementoType type', () => {
      const element: OduElementoType = 'fogo';
      expect(element).toBe('fogo');
    });
  });

  // ─── Integration: Odu-Chakra relationships ──────────────────────────────

  describe('Odu-Chakra relationships', () => {
    it('should have multiple Odús mapped to Ajna (Third Eye)', () => {
      const ajnaOdus = getChakraOdu('Ajna');
      expect(ajnaOdus.length).toBeGreaterThan(1);
      expect(ajnaOdus.map((o) => o.odu_numero)).toContain(1);
      expect(ajnaOdus.map((o) => o.odu_numero)).toContain(4);
    });

    it('should have multiple Odús mapped to Svadhisthana (Sacral)', () => {
      const sacralOdus = getChakraOdu('Svadhisthana');
      expect(sacralOdus.length).toBeGreaterThan(1);
    });

    it('should have multiple Odús mapped to Manipura (Solar)', () => {
      const solarOdus = getChakraOdu('Manipura');
      expect(solarOdus.length).toBeGreaterThan(1);
    });

    it('should have multiple Odús mapped to Muladhara (Root)', () => {
      const rootOdus = getChakraOdu('Muladhara');
      expect(rootOdus.length).toBeGreaterThan(1);
    });

    it('should have exactly one Odu mapped to Sahasrara (Crown)', () => {
      const crownOdus = getChakraOdu('Sahasrara');
      expect(crownOdus).toHaveLength(1);
      expect(crownOdus[0].odu_numero).toBe(8);
    });

    it('should have exactly one Odu mapped to Vishuddha (Throat)', () => {
      const throatOdus = getChakraOdu('Vishuddha');
      expect(throatOdus).toHaveLength(1);
      expect(throatOdus[0].odu_numero).toBe(11);
    });
  });

  // ─── Default export ──────────────────────────────────────────────────────

  describe('Default export', () => {
    it('should export all required functions', async () => {
      const defaultExport = (await import('@/lib/correlation/oddu-chakra')).default;
      expect(defaultExport.getOduChakra).toBeDefined();
      expect(defaultExport.getChakraOdu).toBeDefined();
      expect(defaultExport.getAllOduChakras).toBeDefined();
    });
  });
});