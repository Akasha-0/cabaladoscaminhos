
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
    });

    it('returns Irosun (4) mapping with Chesed', () => {
      const result = getOduSephirot(4);
      expect(result).not.toBeNull();
      expect(result!.sephirah).toBe('Chesed');
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
      expect(getOduSephirot('Okaran')?.oddu_numero).toBe(1);
    });

    it('is case-insensitive', () => {
      expect(getOduSephirot('okaran')?.oddu_numero).toBe(1);
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

    it('contains core Sephiroth names', () => {
      const sephiroth = getAllOduSephiroths().map(m => m.sephirah);
      expect(sephiroth).toContain('Malkuth');
      expect(sephiroth).toContain('Kether');
    });
  });

  describe('getAllOdduNumbers', () => {
    it('returns array of 16 numbers', () => {
      expect(getAllOdduNumbers()).toHaveLength(16);
    });
  });

  describe('getSephirotOdu', () => {
    it('maps Malkuth to Okaran (1)', () => {
      expect(getSephirotOdu()['Malkuth']).toEqual({ oddu_numero: 1, oddu_nome: 'Okaran' });
    });

    it('maps Kether to Alafia (16)', () => {
      expect(getSephirotOdu()['Kether']).toEqual({ oddu_numero: 16, oddu_nome: 'Alafia' });
    });
  });

  describe('getOdduByElement', () => {
    it('returns Oddu for fogo', () => {
      const result = getOdduByElement('fogo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(m => m.elemento === 'fogo')).toBe(true);
    });
  });

  describe('hasOdduSephirot', () => {
    it('returns true for valid numbers', () => {
      expect(hasOdduSephirot(1)).toBe(true);
      expect(hasOdduSephirot(16)).toBe(true);
    });

    it('returns false for invalid numbers', () => {
      expect(hasOdduSephirot(0)).toBe(false);
    });
  });

  describe('getSephirotByOdduNumber', () => {
    it('returns Sephirah name', () => {
      expect(getSephirotByOdduNumber(1)).toBe('Malkuth');
      expect(getSephirotByOdduNumber(16)).toBe('Kether');
    });
  });

  describe('ODDU_SEPHIROT_MAPPINGS constant', () => {
    it('is frozen', () => {
      expect(Object.isFrozen(ODDU_SEPHIROT_MAPPINGS)).toBe(true);
    });

    it('has 16 entries', () => {
      expect(Object.keys(ODDU_SEPHIROT_MAPPINGS)).toHaveLength(16);
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
  });

  describe('default export', () => {
    it('exports ODDU_SEPHIROT_MAPPINGS', () => {
      expect(ODDU_SEPHIROT_MAPPINGS).toBeDefined();
    });
  });
});
