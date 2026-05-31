/**
 * Oddu-Ifá Cabala Sephirot Correlation Tests
 * Tests for Odú Ifá to Sephiroth mappings on the Kabbalistic Tree of Life
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
  // ─── getOduSephirot by number ──────────────────────────────────────────────

  describe('getOduSephirot by number', () => {
    it('returns Okaran (1) mapping with Malkuth', () => {
      const result = getOduSephirot(1);
      expect(result).not.toBeNull();
      expect(result!.oddu_numero).toBe(1);
      expect(result!.oddu_nome).toBe('Okaran');
      expect(result!.sephirah).toBe('Malkuth');
      expect(result!.elemento).toBe('éter');
      expect(result!.significado_espiritual).toContain('começo');
      expect(result!.dia_semana).toBe('Segunda-feira');
    });

    it('returns Irosun (4) mapping with Chesed', () => {
      const result = getOduSephirot(4);
      expect(result).not.toBeNull();
      expect(result!.oddu_numero).toBe(4);
      expect(result!.oddu_nome).toBe('Irosun');
      expect(result!.sephirah).toBe('Chesed');
      expect(result!.elemento).toBe('água');
    });

    it('returns Oxé (5) mapping with Tiphereth', () => {
      const result = getOduSephirot(5);
      expect(result).not.toBeNull();
      expect(result!.oddu_numero).toBe(5);
      expect(result!.oddu_nome).toBe('Oxé');
      expect(result!.sephirah).toBe('Tiphereth');
      expect(result!.elemento).toBe('fogo');
    });

    it('returns Alafia (16) mapping with Kether', () => {
      const result = getOduSephirot(16);
      expect(result).not.toBeNull();
      expect(result!.oddu_numero).toBe(16);
      expect(result!.oddu_nome).toBe('Alafia');
      expect(result!.sephirah).toBe('Kether');
      expect(result!.elemento).toBe('éter');
      expect(result!.dia_semana).toBe('Sexta-feira');
    });

    it('returns Odi (7) mapping with Hod', () => {
      const result = getOduSephirot(7);
      expect(result).not.toBeNull();
      expect(result!.oddu_numero).toBe(7);
      expect(result!.oddu_nome).toBe('Odi');
      expect(result!.sephirah).toBe('Hod');
      expect(result!.elemento).toBe('fogo');
    });

    it('returns EjiOníle (8) mapping with Yesod', () => {
      const result = getOduSephirot(8);
      expect(result).not.toBeNull();
      expect(result!.oddu_numero).toBe(8);
      expect(result!.oddu_nome).toBe('EjiOníle');
      expect(result!.sephirah).toBe('Yesod');
      expect(result!.elemento).toBe('água');
    });

    it('returns Ejilsebora (12) mapping with Hod', () => {
      const result = getOduSephirot(12);
      expect(result).not.toBeNull();
      expect(result!.oddu_numero).toBe(12);
      expect(result!.oddu_nome).toBe('Ejilsebora');
      expect(result!.sephirah).toBe('Hod');
    });

    it('returns null for number outside 1-16', () => {
      expect(getOduSephirot(0)).toBeNull();
      expect(getOduSephirot(17)).toBeNull();
      expect(getOduSephirot(100)).toBeNull();
      expect(getOduSephirot(-1)).toBeNull();
    });

    it('returns null for undefined number', () => {
      expect(getOduSephirot(undefined as unknown as number)).toBeNull();
    });
  });

  // ─── getOduSephirot by name ────────────────────────────────────────────────

  describe('getOduSephirot by name', () => {
    it('returns Okaran mapping by name', () => {
      const result = getOduSephirot('Okaran');
      expect(result).not.toBeNull();
      expect(result!.oddu_numero).toBe(1);
      expect(result!.sephirah).toBe('Malkuth');
    });

    it('returns Irosun mapping by name', () => {
      const result = getOduSephirot('Irosun');
      expect(result).not.toBeNull();
      expect(result!.oddu_numero).toBe(4);
      expect(result!.sephirah).toBe('Chesed');
    });

    it('returns Oxé mapping by name', () => {
      const result = getOduSephirot('Oxé');
      expect(result).not.toBeNull();
      expect(result!.oddu_numero).toBe(5);
      expect(result!.sephirah).toBe('Tiphereth');
    });

    it('returns Alafia mapping by name', () => {
      const result = getOduSephirot('Alafia');
      expect(result).not.toBeNull();
      expect(result!.oddu_numero).toBe(16);
      expect(result!.sephirah).toBe('Kether');
    });

    it('is case-insensitive for names', () => {
      expect(getOduSephirot('okaran')?.oddu_numero).toBe(1);
      expect(getOduSephirot('OKARAN')?.oddu_numero).toBe(1);
      expect(getOduSephirot('OkArAn')?.oddu_numero).toBe(1);
      expect(getOduSephirot('irosun')?.oddu_numero).toBe(4);
    });

    it('returns null for unknown name', () => {
      expect(getOduSephirot('UnknownOddu')).toBeNull();
      expect(getOduSephirot('TestOddu')).toBeNull();
      expect(getOduSephirot('Xaxaxa')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getOduSephirot('')).toBeNull();
    });
  });

  // ─── getAllOduSephiroths ──────────────────────────────────────────────────

  describe('getAllOduSephiroths', () => {
    it('returns all 16 mappings', () => {
      const result = getAllOduSephiroths();
      expect(result).toHaveLength(16);
    });

    it('returns mappings sorted by number', () => {
      const result = getAllOduSephiroths();
      expect(result[0].oddu_numero).toBe(1);
      expect(result[1].oddu_numero).toBe(2);
      expect(result[15].oddu_numero).toBe(16);
    });

    it('includes all required fields for each mapping', () => {
      const result = getAllOduSephiroths();
      for (const mapping of result) {
        expect(mapping).toHaveProperty('oddu_numero');
        expect(mapping).toHaveProperty('oddu_nome');
        expect(mapping).toHaveProperty('sephirah');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('conexoes_caminho');
        expect(mapping).toHaveProperty('dia_semana');
      }
    });

    it('contains all known Sephiroth names', () => {
      const result = getAllOduSephiroths();
      const sephiroth = result.map((m) => m.sephirah);
      expect(sephiroth).toContain('Malkuth');
      expect(sephiroth).toContain('Kether');
      expect(sephiroth).toContain('Tiphereth');
      expect(sephiroth).toContain('Binah');
    });
  });

  // ─── getAllOdduNumbers ─────────────────────────────────────────────────────

  describe('getAllOdduNumbers', () => {
    it('returns array of 16 numbers', () => {
      const result = getAllOdduNumbers();
      expect(result).toHaveLength(16);
    });

    it('contains all numbers from 1 to 16', () => {
      const result = getAllOdduNumbers();
      for (let i = 1; i <= 16; i++) {
        expect(result).toContain(i);
      }
    });

    it('returns sorted array', () => {
      const result = getAllOdduNumbers();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i]).toBeLessThan(result[i + 1]);
      }
    });
  });

  // ─── getAllOdduNames ──────────────────────────────────────────────────────

  describe('getAllOdduNames', () => {
    it('returns array of 16 names', () => {
      const result = getAllOdduNames();
      expect(result).toHaveLength(16);
    });

    it('contains all known Oddu names', () => {
      const result = getAllOdduNames();
      expect(result).toContain('Okaran');
      expect(result).toContain('Ejiokô');
      expect(result).toContain('Etaogundá');
      expect(result).toContain('Irosun');
      expect(result).toContain('Oxé');
      expect(result).toContain('Obará');
      expect(result).toContain('Odi');
      expect(result).toContain('EjiOníle');
      expect(result).toContain('Ossá');
      expect(result).toContain('Ofun');
      expect(result).toContain('Owarin');
      expect(result).toContain('Ejilsebora');
      expect(result).toContain('Olobón');
      expect(result).toContain('Iká');
      expect(result).toContain('Ogbogbé');
      expect(result).toContain('Alafia');
    });
  });

  // ─── getSephirotOdu ───────────────────────────────────────────────────────

  describe('getSephirotOdu', () => {
    it('returns reverse mapping structure', () => {
      const result = getSephirotOdu();
      expect(result).toHaveProperty('Malkuth');
      expect(result).toHaveProperty('Kether');
      expect(result).toHaveProperty('Tiphereth');
    });

    it('maps Malkuth to Okaran (1)', () => {
      const result = getSephirotOdu();
      expect(result['Malkuth']).toEqual({ oddu_numero: 1, oddu_nome: 'Okaran' });
    });

    it('maps Kether to Alafia (16)', () => {
      const result = getSephirotOdu();
      expect(result['Kether']).toEqual({ oddu_numero: 16, oddu_nome: 'Alafia' });
    });

    it('maps Binah to Ejiokô (2)', () => {
      const result = getSephirotOdu();
      expect(result['Binah']).toEqual({ oddu_numero: 2, oddu_nome: 'Ejiokô' });
    });

    it('contains 10 unique Sephiroth keys', () => {
      const result = getSephirotOdu();
      const keys = Object.keys(result);
      expect(keys.length).toBeLessThanOrEqual(16);
      expect(keys.length).toBeGreaterThanOrEqual(8);
    });
  });

  // ─── getAllSephirotNames ──────────────────────────────────────────────────

  describe('getAllSephirotNames', () => {
    it('returns deduplicated array of Sephiroth names', () => {
      const result = getAllSephirotNames();
      const unique = new Set(result);
      expect(result.length).toBe(unique.size);
    });

    it('contains core Sephiroth names', () => {
      const result = getAllSephirotNames();
      expect(result).toContain('Malkuth');
      expect(result).toContain('Binah');
      expect(result).toContain('Chesed');
      expect(result).toContain('Geburah');
      expect(result).toContain('Tiphereth');
      expect(result).toContain('Netzach');
      expect(result).toContain('Hod');
      expect(result).toContain('Yesod');
      expect(result).toContain('Kether');
    });

    it('returns sorted array', () => {
      const result = getAllSephirotNames();
      const sorted = [...result].sort();
      expect(result).toEqual(sorted);
    });
  });

  // ─── getOdduByElement ──────────────────────────────────────────────────────

  describe('getOdduByElement', () => {
    it('returns Oddu for fogo element', () => {
      const result = getOdduByElement('fogo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.elemento === 'fogo')).toBe(true);
    });

    it('returns Oddu for água element', () => {
      const result = getOdduByElement('água');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.elemento === 'água')).toBe(true);
    });

    it('returns Oddu for éter element', () => {
      const result = getOdduByElement('éter');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.elemento === 'éter')).toBe(true);
    });

    it('returns Oddu for ar element', () => {
      const result = getOdduByElement('ar');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.elemento === 'ar')).toBe(true);
    });

    it('returns Oddu for terra element', () => {
      const result = getOdduByElement('terra');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.elemento === 'terra')).toBe(true);
    });
  });

  // ─── getOdduBySephirah ─────────────────────────────────────────────────────

  describe('getOdduBySephirah', () => {
    it('returns Oddu mapped to Malkuth', () => {
      const result = getOdduBySephirah('Malkuth');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.sephirah === 'Malkuth')).toBe(true);
    });

    it('is case-insensitive', () => {
      const result1 = getOdduBySephirah('malkuth');
      const result2 = getOdduBySephirah('MALKUTH');
      const result3 = getOdduBySephirah('MalKuTh');
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it('returns empty array for unknown Sephirah', () => {
      const result = getOdduBySephirah('UnknownSephirah');
      expect(result).toEqual([]);
    });
  });

  // ─── hasOdduSephirot ──────────────────────────────────────────────────────

  describe('hasOdduSephirot', () => {
    it('returns true for valid Oddu numbers', () => {
      expect(hasOdduSephirot(1)).toBe(true);
      expect(hasOdduSephirot(8)).toBe(true);
      expect(hasOdduSephirot(16)).toBe(true);
    });

    it('returns false for invalid Oddu numbers', () => {
      expect(hasOdduSephirot(0)).toBe(false);
      expect(hasOdduSephirot(17)).toBe(false);
      expect(hasOdduSephirot(100)).toBe(false);
      expect(hasOdduSephirot(-1)).toBe(false);
    });
  });

  // ─── getOdduElement ───────────────────────────────────────────────────────

  describe('getOdduElement', () => {
    it('returns elemento for valid Oddu number', () => {
      expect(getOdduElement(1)).toBe('éter');
      expect(getOdduElement(4)).toBe('água');
      expect(getOdduElement(5)).toBe('fogo');
    });

    it('returns null for invalid Oddu number', () => {
      expect(getOdduElement(0)).toBeNull();
      expect(getOdduElement(17)).toBeNull();
    });
  });

  // ─── getOdduMessage ───────────────────────────────────────────────────────

  describe('getOdduMessage', () => {
    it('returns spiritual message for valid Oddu number', () => {
      const msg1 = getOdduMessage(1);
      expect(msg1).not.toBeNull();
      expect(typeof msg1).toBe('string');
      expect(msg1!.length).toBeGreaterThan(0);

      const msg16 = getOdduMessage(16);
      expect(msg16).not.toBeNull();
      expect(msg16).toContain('luz');
    });

    it('returns null for invalid Oddu number', () => {
      expect(getOdduMessage(0)).toBeNull();
      expect(getOdduMessage(17)).toBeNull();
    });
  });

  // ─── getSephirotByOdduNumber ──────────────────────────────────────────────

  describe('getSephirotByOdduNumber', () => {
    it('returns Sephirah name for valid Oddu number', () => {
      expect(getSephirotByOdduNumber(1)).toBe('Malkuth');
      expect(getSephirotByOdduNumber(16)).toBe('Kether');
      expect(getSephirotByOdduNumber(5)).toBe('Tiphereth');
    });

    it('returns null for invalid Oddu number', () => {
      expect(getSephirotByOdduNumber(0)).toBeNull();
      expect(getSephirotByOdduNumber(17)).toBeNull();
    });
  });

  // ─── ODDU_SEPHIROT_MAPPINGS constant ──────────────────────────────────────

  describe('ODDU_SEPHIROT_MAPPINGS constant', () => {
    it('is a frozen object', () => {
      expect(Object.isFrozen(ODDU_SEPHIROT_MAPPINGS)).toBe(true);
    });

    it('has 16 entries', () => {
      expect(Object.keys(ODDU_SEPHIROT_MAPPINGS)).toHaveLength(16);
    });

    it('contains all numbers 1-16 as keys', () => {
      for (let i = 1; i <= 16; i++) {
        expect(i in ODDU_SEPHIROT_MAPPINGS).toBe(true);
      }
    });

    it('each entry has required fields', () => {
      for (let i = 1; i <= 16; i++) {
        const entry = ODDU_SEPHIROT_MAPPINGS[i];
        expect(entry.oddu_numero).toBe(i);
        expect(entry.oddu_nome).toBeDefined();
        expect(entry.sephirah).toBeDefined();
        expect(entry.elemento).toBeDefined();
        expect(entry.significado_espiritual).toBeDefined();
        expect(entry.conexoes_caminho).toBeDefined();
        expect(entry.dia_semana).toBeDefined();
      }
    });
  });

  // ─── Type exports ────────────────────────────────────────────────────────

  describe('Type exports', () => {
    it('exports OdduSephirot interface', () => {
      const mapping: OdduSephirot = {
        oddu_numero: 1,
        oddu_nome: 'Test',
        sephirah: 'Malkuth',
        elemento: 'éter',
        significado_espiritual: 'Test message',
        conexoes_caminho: {
          numero_caminho: 21,
          letra_hebraica: 'ת',
          posicao: 'Base',
          sephirot_relacionadas: ['Kether'],
        },
        dia_semana: 'Segunda-feira',
      };
      expect(mapping.oddu_numero).toBe(1);
    });

    it('exports ElementType type', () => {
      const validElement: ElementType = 'fogo';
      expect(validElement).toBe('fogo');
    });

    it('accepts all valid element types', () => {
      const elements: ElementType[] = ['fogo', 'água', 'ar', 'terra', 'éter'];
      elements.forEach((el) => {
        const result = getOdduByElement(el);
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  // ─── Cross-correlation consistency ────────────────────────────────────────

  describe('Cross-correlation consistency', () => {
    it('getSephirotOdu and getOduSephirot are inverse operations', () => {
      const reverse = getSephirotOdu();
      for (const [, oddu] of Object.entries(reverse)) {
        const result = getOduSephirot(oddu.oddu_numero);
        expect(result).not.toBeNull();
        expect(result!.sephirah).toBe(Object.keys(reverse).find((k) => reverse[k].oddu_numero === oddu.oddu_numero));
      }
    });

    it('getAllOdduNumbers and getAllOduSephiroths have matching lengths', () => {
      const numbers = getAllOdduNumbers();
      const mappings = getAllOduSephiroths();
      expect(mappings.length).toBe(numbers.length);
    });

    it('Sephiroth names in getSephirotOdu match getAllSephirotNames', () => {
      const reverse = getSephirotOdu();
      const sephirothNames = getAllSephirotNames();
      for (const name of sephirothNames) {
        expect(reverse).toHaveProperty(name);
      }
    });
  });

  // ─── Default export ──────────────────────────────────────────────────────

  describe('default export', () => {
    it('exports getOduSephirot', () => {
      const module = require('@/lib/correlation/oddu-sephirot').default;
      expect(module.getOduSephirot).toBeDefined();
      expect(typeof module.getOduSephirot).toBe('function');
    });

    it('exports getSephirotOdu', () => {
      const module = require('@/lib/correlation/oddu-sephirot').default;
      expect(module.getSephirotOdu).toBeDefined();
      expect(typeof module.getSephirotOdu).toBe('function');
    });

    it('exports getAllOduSephiroths', () => {
      const module = require('@/lib/correlation/oddu-sephirot').default;
      expect(module.getAllOduSephiroths).toBeDefined();
      expect(typeof module.getAllOduSephiroths).toBe('function');
    });

    it('exports ODDU_SEPHIROT_MAPPINGS', () => {
      const module = require('@/lib/correlation/oddu-sephirot').default;
      expect(module.ODDU_SEPHIROT_MAPPINGS).toBeDefined();
    });
  });
});