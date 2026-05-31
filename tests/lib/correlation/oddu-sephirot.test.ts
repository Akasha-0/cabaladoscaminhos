/**
 * Oddu-Ifá Cabala Sephirot Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getOduSephirot,
  getSephirotOdu,
  getAllOduSephiroths,
  getAllOdduNumbers,
  getAllOdduNames,
  getAllSephirotNames,
  getOdduByElement,
  getOdduBySephirah,
  hasOdduSephirot,
  getOdduElement,
  getOdduMessage,
  getSephirotByOdduNumber,
  ODDU_SEPHIROT_MAPPINGS,
  type OdduSephirot,
  type ElementType,
} from '@/lib/correlation/oddu-sephirot';

describe('Oddu-Sephirot Correlation', () => {
  describe('getOduSephirot by number', () => {
    it('returns Okaran (1) mapping with Malkuth', () => {
      const result = getOduSephirot(1);
      expect(result).not.toBeNull();
      expect(result!.oddu_numero).toBe(1);
      expect(result!.oddu_nome).toBe('Okaran');
      expect(result!.sephirah).toBe('Malkuth');
      expect(result!.elemento).toBe('éter');
    });

    it('returns Irosun (4) mapping with Chesed', () => {
      const result = getOduSephirot(4);
      expect(result).not.toBeNull();
      expect(result!.oddu_numero).toBe(4);
      expect(result!.sephirah).toBe('Chesed');
    });

    it('returns Oxé (5) mapping with Tiphereth', () => {
      const result = getOduSephirot(5);
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Tiphereth');
    });

    it('returns Alafia (16) mapping with Kether', () => {
      const result = getOduSephirot(16);
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Kether');
    });

    it('returns null for number outside 1-16', () => {
      expect(getOduSephirot(0)).toBeNull();
      expect(getOduSephirot(17)).toBeNull();
    });
  });

  describe('getOduSephirot by name', () => {
    it('returns Okaran mapping by name', () => {
      const result = getOduSephirot('Okaran');
      expect(result).not.toBeNull();
      expect(result!.oddu_numero).toBe(1);
    });

    it('is case-insensitive', () => {
      expect(getOduSephirot('okaran')?.oddu_numero).toBe(1);
      expect(getOduSephirot('OKARAN')?.oddu_numero).toBe(1);
    });

    it('returns null for unknown name', () => {
      expect(getOduSephirot('Unknown')).toBeNull();
    });
  });

  describe('getAllOduSephiroths', () => {
    it('returns all 16 mappings', () => {
      expect(getAllOduSephiroths()).toHaveLength(16);
    });

    it('returns sorted by number', () => {
      const result = getAllOduSephiroths();
      expect(result[0].oddu_numero).toBe(1);
      expect(result[15].oddu_numero).toBe(16);
    });
  });

  describe('getAllOdduNumbers', () => {
    it('returns array of 16 numbers', () => {
      expect(getAllOdduNumbers()).toHaveLength(16);
    });

    it('contains all numbers 1-16', () => {
      const result = getAllOdduNumbers();
      for (let i = 1; i <= 16; i++) expect(result).toContain(i);
    });
  });

  describe('getAllOdduNames', () => {
    it('returns array of 16 names', () => {
      expect(getAllOdduNames()).toHaveLength(16);
    });

    it('contains key Oddu names', () => {
      const result = getAllOdduNames();
      expect(result).toContain('Okaran');
      expect(result).toContain('Alafia');
    });
  });

  describe('getSephirotOdu', () => {
    it('returns reverse mapping', () => {
      const result = getSephirotOdu();
      expect(result).toHaveProperty('Malkuth');
      expect(result['Malkuth']).toEqual({ oddu_numero: 1, oddu_nome: 'Okaran' });
    });

    it('maps Kether to Alafia', () => {
      const result = getSephirotOdu();
      expect(result['Kether']).toEqual({ oddu_numero: 16, oddu_nome: 'Alafia' });
    });
  });

  describe('getAllSephirotNames', () => {
    it('returns deduplicated array', () => {
      const result = getAllSephirotNames();
      expect(new Set(result).size).toBe(result.length);
    });

    it('contains core Sephiroth names', () => {
      const result = getAllSephirotNames();
      expect(result).toContain('Malkuth');
      expect(result).toContain('Kether');
      expect(result).toContain('Tiphereth');
    });
  });

  describe('getOdduByElement', () => {
    it('returns Oddu for fogo', () => {
      const result = getOdduByElement('fogo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(m => m.elemento === 'fogo')).toBe(true);
    });

    it('returns Oddu for água', () => {
      const result = getOdduByElement('água');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getOdduBySephirah', () => {
    it('returns Oddu mapped to Malkuth', () => {
      const result = getOdduBySephirah('Malkuth');
      expect(result.length).toBeGreaterThan(0);
    });

    it('is case-insensitive', () => {
      const r1 = getOdduBySephirah('malkuth');
      const r2 = getOdduBySephirah('MALKUTH');
      expect(r1).toEqual(r2);
    });
  });

  describe('hasOdduSephirot', () => {
    it('returns true for valid numbers', () => {
      expect(hasOdduSephirot(1)).toBe(true);
      expect(hasOdduSephirot(16)).toBe(true);
    });

    it('returns false for invalid numbers', () => {
      expect(hasOdduSephirot(0)).toBe(false);
      expect(hasOdduSephirot(17)).toBe(false);
    });
  });

  describe('getOdduElement', () => {
    it('returns elemento for valid number', () => {
      expect(getOdduElement(1)).toBe('éter');
      expect(getOdduElement(5)).toBe('fogo');
    });

    it('returns null for invalid number', () => {
      expect(getOdduElement(0)).toBeNull();
    });
  });

  describe('getOdduMessage', () => {
    it('returns spiritual message', () => {
      const msg = getOdduMessage(1);
      expect(msg).not.toBeNull();
      expect(typeof msg).toBe('string');
    });

    it('returns null for invalid number', () => {
      expect(getOdduMessage(0)).toBeNull();
    });
  });

  describe('getSephirotByOdduNumber', () => {
    it('returns Sephirah name', () => {
      expect(getSephirotByOdduNumber(1)).toBe('Malkuth');
      expect(getSephirotByOdduNumber(16)).toBe('Kether');
    });

    it('returns null for invalid number', () => {
      expect(getSephirotByOdduNumber(0)).toBeNull();
    });
  });

  describe('ODDU_SEPHIROT_MAPPINGS constant', () => {
    it('is frozen', () => {
      expect(Object.isFrozen(ODDU_SEPHIROT_MAPPINGS)).toBe(true);
    });

    it('has 16 entries', () => {
      expect(Object.keys(ODDU_SEPHIROT_MAPPINGS)).toHaveLength(16);
    });

    it('each entry has required fields', () => {
      for (let i = 1; i <= 16; i++) {
        const entry = ODDU_SEPHIROT_MAPPINGS[i];
        expect(entry.oddu_numero).toBe(i);
        expect(entry.oddu_nome).toBeDefined();
        expect(entry.sephirah).toBeDefined();
        expect(entry.elemento).toBeDefined();
        expect(entry.conexoes_caminho).toBeDefined();
        expect(entry.dia_semana).toBeDefined();
      }
    });
  });

  describe('Type exports', () => {
    it('exports OdduSephirot interface', () => {
      const mapping: OdduSephirot = {
        oddu_numero: 1,
        oddu_nome: 'Test',
        sephirah: 'Malkuth',
        elemento: 'éter',
        significado_espiritual: 'Test',
        conexoes_caminho: { numero_caminho: 21, letra_hebraica: 'ת', posicao: 'Base', sephirot_relacionadas: ['Kether'] },
        dia_semana: 'Segunda-feira',
      };
      expect(mapping.oddu_numero).toBe(1);
    });

    it('exports ElementType type', () => {
      const el: ElementType = 'fogo';
      expect(el).toBe('fogo');
    });
  });

  describe('default export', () => {
    it('exports required functions', () => {
      const mod = require('@/lib/correlation/oddu-sephirot').default;
      expect(mod.getOduSephirot).toBeDefined();
      expect(mod.getSephirotOdu).toBeDefined();
      expect(mod.getAllOduSephiroths).toBeDefined();
    });
  });
});
