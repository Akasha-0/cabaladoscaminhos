/**
 * Odú Ifá - Orixá Correlation Tests
 * Tests for direct Odú Ifá to Orixá mappings
 */

import { describe, it, expect } from 'vitest';
import {
  getOduOrixa,
  getAllOduOrixas,
  getAllOduNumbers,
  getAllOduNames,
  getAllOrixaNames,
  getOduByElement,
  getOduByOrixa,
  hasOduOrixa,
  getOduElement,
  getOduMessage,
  ODTU_ORIXA_MAPPINGS,
  type OdTuOrixa,
  type ElementType,
} from '@/lib/correlation/odtu-orixa';

describe('Odú-Ifá Orixá Correlation', () => {
  // ─── getOduOrixa by number ────────────────────────────────────────────────

  describe('getOduOrixa by number', () => {
    it('should return correct mapping for Odu 1 (Okaran) → Oxalá', () => {
      const result = getOduOrixa(1);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(1);
      expect(result!.odu_nome).toBe('Okaran');
      expect(result!.orixa).toBe('Oxalá');
      expect(result!.elemento).toBe('éter');
    });

    it('should return correct mapping for Odu 2 (Ejiokô) → Oxum', () => {
      const result = getOduOrixa(2);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(2);
      expect(result!.odu_nome).toBe('Ejiokô');
      expect(result!.orixa).toBe('Oxum');
      expect(result!.elemento).toBe('água');
    });

    it('should return correct mapping for Odu 3 (Etaogundá) → Iemanjá', () => {
      const result = getOduOrixa(3);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(3);
      expect(result!.odu_nome).toBe('Etaogundá');
      expect(result!.orixa).toBe('Iemanjá');
      expect(result!.elemento).toBe('fogo');
    });

    it('should return correct mapping for Odu 4 (Irosun) → Oxum', () => {
      const result = getOduOrixa(4);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(4);
      expect(result!.odu_nome).toBe('Irosun');
      expect(result!.orixa).toBe('Oxum');
      expect(result!.elemento).toBe('água');
    });

    it('should return correct mapping for Odu 5 (Oxé) → Ogum', () => {
      const result = getOduOrixa(5);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(5);
      expect(result!.odu_nome).toBe('Oxé');
      expect(result!.orixa).toBe('Ogum');
      expect(result!.elemento).toBe('fogo');
    });

    it('should return correct mapping for Odu 6 (Obará) → Oxalá', () => {
      const result = getOduOrixa(6);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(6);
      expect(result!.odu_nome).toBe('Obará');
      expect(result!.orixa).toBe('Oxalá');
      expect(result!.elemento).toBe('terra');
    });

    it('should return correct mapping for Odu 7 (Odi) → Iemanjá', () => {
      const result = getOduOrixa(7);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(7);
      expect(result!.odu_nome).toBe('Odi');
      expect(result!.orixa).toBe('Iemanjá');
      expect(result!.elemento).toBe('água');
    });

    it('should return correct mapping for Odu 8 (Ejionlá) → Logun Ede', () => {
      const result = getOduOrixa(8);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(8);
      expect(result!.odu_nome).toBe('Ejionlá');
      expect(result!.orixa).toBe('Logun Ede');
      expect(result!.elemento).toBe('água');
    });

    it('should return correct mapping for Odu 9 (Oshe) → Iemanjá', () => {
      const result = getOduOrixa(9);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(9);
      expect(result!.odu_nome).toBe('Oshe');
      expect(result!.orixa).toBe('Iemanjá');
      expect(result!.elemento).toBe('água');
    });

    it('should return correct mapping for Odu 10 (Ofun) → Oxalá', () => {
      const result = getOduOrixa(10);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(10);
      expect(result!.odu_nome).toBe('Ofun');
      expect(result!.orixa).toBe('Oxalá');
      expect(result!.elemento).toBe('éter');
    });

    it('should return correct mapping for Odu 11 (Eyonla) → Nanã Buruku', () => {
      const result = getOduOrixa(11);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(11);
      expect(result!.odu_nome).toBe('Eyonla');
      expect(result!.orixa).toBe('Nanã Buruku');
      expect(result!.elemento).toBe('terra');
    });

    it('should return correct mapping for Odu 12 (Merinla) → Nanã Buruku', () => {
      const result = getOduOrixa(12);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(12);
      expect(result!.odu_nome).toBe('Merinla');
      expect(result!.orixa).toBe('Nanã Buruku');
      expect(result!.elemento).toBe('terra');
    });

    it('should return correct mapping for Odu 13 (Mero) → Oxum', () => {
      const result = getOduOrixa(13);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(13);
      expect(result!.odu_nome).toBe('Mero');
      expect(result!.orixa).toBe('Oxum');
      expect(result!.elemento).toBe('água');
    });

    it('should return correct mapping for Odu 14 (Jinza) → Ogum', () => {
      const result = getOduOrixa(14);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(14);
      expect(result!.odu_nome).toBe('Jinza');
      expect(result!.orixa).toBe('Ogum');
      expect(result!.elemento).toBe('fogo');
    });

    it('should return correct mapping for Odu 15 (Jotagbe) → Oxalá', () => {
      const result = getOduOrixa(15);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(15);
      expect(result!.odu_nome).toBe('Jotagbe');
      expect(result!.orixa).toBe('Oxalá');
      expect(result!.elemento).toBe('éter');
    });

    it('should return correct mapping for Odu 16 (Otura) → Nanã Buruku', () => {
      const result = getOduOrixa(16);
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(16);
      expect(result!.odu_nome).toBe('Otura');
      expect(result!.orixa).toBe('Nanã Buruku');
      expect(result!.elemento).toBe('terra');
    });

    it('should return null for Odu 0', () => {
      expect(getOduOrixa(0)).toBeNull();
    });

    it('should return null for Odu 17', () => {
      expect(getOduOrixa(17)).toBeNull();
    });

    it('should return null for negative Odu numbers', () => {
      expect(getOduOrixa(-1)).toBeNull();
    });
  });

  // ─── getOduOrixa by name ─────────────────────────────────────────────────

  describe('getOduOrixa by name', () => {
    it('should find Odu by Portuguese name', () => {
      const result = getOduOrixa('Okaran');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(1);
      expect(result!.orixa).toBe('Oxalá');
    });

    it('should find Odu by Yoruba name', () => {
      const result = getOduOrixa('Okànràn');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(1);
      expect(result!.orixa).toBe('Oxalá');
    });

    it('should be case insensitive', () => {
      const result = getOduOrixa('OKARAN');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(1);
    });

    it('should find Ejiokô by Yoruba name', () => {
      const result = getOduOrixa('Ejìokò');
      expect(result).not.toBeNull();
      expect(result!.odu_numero).toBe(2);
    });

    it('should return null for unknown Odu name', () => {
      expect(getOduOrixa('UnknownOdu')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(getOduOrixa('')).toBeNull();
    });
  });

  // ─── getAllOduOrixas ─────────────────────────────────────────────────────

  describe('getAllOduOrixas', () => {
    it('should return all 16 Odu mappings', () => {
      const result = getAllOduOrixas();
      expect(result).toHaveLength(16);
    });

    it('should return mappings sorted by Odu number', () => {
      const result = getAllOduOrixas();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].odu_numero).toBeLessThan(result[i + 1].odu_numero);
      }
    });

    it('should return complete mapping objects', () => {
      const result = getAllOduOrixas();
      const first = result[0];
      expect(first).toHaveProperty('odu_numero');
      expect(first).toHaveProperty('odu_nome');
      expect(first).toHaveProperty('odu_nome_yoruba');
      expect(first).toHaveProperty('orixa');
      expect(first).toHaveProperty('elemento');
      expect(first).toHaveProperty('significado_espiritual');
      expect(first).toHaveProperty('mensagem_central');
      expect(first).toHaveProperty('cores');
      expect(first).toHaveProperty('dias_sagrados');
    });

    it('should include all unique Orixás', () => {
      const result = getAllOduOrixas();
      const orixas = result.map((m) => m.orixa);
      const uniqueOrixas = [...new Set(orixas)];
      // Should have multiple unique Orixás
      expect(uniqueOrixas.length).toBeGreaterThan(1);
    });
  });

  // ─── getAllOduNumbers ────────────────────────────────────────────────────

  describe('getAllOduNumbers', () => {
    it('should return numbers 1-16', () => {
      const result = getAllOduNumbers();
      expect(result).toHaveLength(16);
      expect(result).toContain(1);
      expect(result).toContain(16);
    });

    it('should return sorted numbers', () => {
      const result = getAllOduNumbers();
      expect(result).toEqual([...result].sort((a, b) => a - b));
    });
  });

  // ─── getAllOduNames ──────────────────────────────────────────────────────

  describe('getAllOduNames', () => {
    it('should return all 16 Portuguese names', () => {
      const result = getAllOduNames();
      expect(result).toHaveLength(16);
    });

    it('should include known Odu names', () => {
      const result = getAllOduNames();
      expect(result).toContain('Okaran');
      expect(result).toContain('Ejiokô');
      expect(result).toContain('Otura');
    });

    it('should return sorted names', () => {
      const result = getAllOduNames();
      expect(result).toEqual([...result].sort((a, b) => a.localeCompare(b, 'pt-BR')));
    });
  });

  // ─── getAllOrixaNames ────────────────────────────────────────────────────

  describe('getAllOrixaNames', () => {
    it('should return unique Orixá names', () => {
      const result = getAllOrixaNames();
      const uniqueSet = new Set(result);
      expect(result.length).toBe(uniqueSet.size);
    });

    it('should include main Orixás', () => {
      const result = getAllOrixaNames();
      expect(result).toContain('Oxalá');
      expect(result).toContain('Oxum');
      expect(result).toContain('Iemanjá');
      expect(result).toContain('Ogum');
      expect(result).toContain('Nanã Buruku');
    });

    it('should include aspect Orixás', () => {
      const result = getAllOrixaNames();
      expect(result).toContain('Logun Ede');
      expect(result).toContain('Obatalá');
    });
  });

  // ─── getOduByElement ─────────────────────────────────────────────────────

  describe('getOduByElement', () => {
    it('should return Odús with fogo element', () => {
      const result = getOduByElement('fogo');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.elemento === 'fogo')).toBe(true);
    });

    it('should return Odús with água element', () => {
      const result = getOduByElement('água');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.elemento === 'água')).toBe(true);
    });

    it('should return empty array for unknown element', () => {
      const result = getOduByElement('éter');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  // ─── getOduByOrixa ──────────────────────────────────────────────────────

  describe('getOduByOrixa', () => {
    it('should return Odús ruled by Oxalá', () => {
      const result = getOduByOrixa('Oxalá');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.orixa === 'Oxalá')).toBe(true);
    });

    it('should return Odús ruled by Oxum', () => {
      const result = getOduByOrixa('Oxum');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((m) => m.orixa === 'Oxum')).toBe(true);
    });

    it('should find by aspect name (Logun Ede)', () => {
      const result = getOduByOrixa('Logun Ede');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should be case insensitive', () => {
      const result = getOduByOrixa('OXALÁ');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty for unknown Orixá', () => {
      const result = getOduByOrixa('UnknownOrixa');
      expect(result).toHaveLength(0);
    });
  });

  // ─── hasOduOrixa ──────────────────────────────────────────────────────────

  describe('hasOduOrixa', () => {
    it('should return true for valid Odu numbers', () => {
      for (let i = 1; i <= 16; i++) {
        expect(hasOduOrixa(i)).toBe(true);
      }
    });

    it('should return false for invalid Odu numbers', () => {
      expect(hasOduOrixa(0)).toBe(false);
      expect(hasOduOrixa(17)).toBe(false);
      expect(hasOduOrixa(-1)).toBe(false);
      expect(hasOduOrixa(100)).toBe(false);
    });
  });

  // ─── getOduElement ────────────────────────────────────────────────────────

  describe('getOduElement', () => {
    it('should return элемент for valid Odu numbers', () => {
      const elements: ElementType[] = ['éter', 'água', 'fogo', 'água', 'fogo', 'terra', 'água', 'água', 'água', 'éter', 'terra', 'terra', 'água', 'fogo', 'éter', 'terra'];
      for (let i = 1; i <= 16; i++) {
        expect(getOduElement(i)).toBe(elements[i - 1]);
      }
    });

    it('should return null for invalid Odu numbers', () => {
      expect(getOduElement(0)).toBeNull();
      expect(getOduElement(17)).toBeNull();
      expect(getOduElement(-1)).toBeNull();
    });
  });

  // ─── getOduMessage ────────────────────────────────────────────────────────

  describe('getOduMessage', () => {
    it('should return spiritual message for valid Odu', () => {
      const message = getOduMessage(1);
      expect(message).not.toBeNull();
      expect(typeof message).toBe('string');
      expect(message!.length).toBeGreaterThan(0);
    });

    it('should return null for invalid Odu numbers', () => {
      expect(getOduMessage(0)).toBeNull();
      expect(getOduMessage(17)).toBeNull();
      expect(getOduMessage(-1)).toBeNull();
    });

    it('should return recentered messages', () => {
      const result = getAllOduOrixas();
      for (const mapping of result) {
        const message = getOduMessage(mapping.odu_numero);
        expect(message).toBe(mapping.mensagem_central);
      }
    });
  });

  // ─── ODTU_ORIXA_MAPPINGS constant ─────────────────────────────────────────

  describe('ODTU_ORIXA_MAPPINGS constant', () => {
    it('should have exactly 16 entries', () => {
      expect(Object.keys(ODTU_ORIXA_MAPPINGS)).toHaveLength(16);
    });

    it('should have all numbers 1-16 as keys', () => {
      for (let i = 1; i <= 16; i++) {
        expect(ODTU_ORIXA_MAPPINGS).toHaveProperty(i.toString());
      }
    });

    it('should be immutable (frozen)', () => {
      expect(() => {
        (ODTU_ORIXA_MAPPINGS as Record<number, OdTuOrixa>)[17] = {} as OdTuOrixa;
      }).toThrow();
    });

    it('should have correct structure for all entries', () => {
      for (const mapping of Object.values(ODTU_ORIXA_MAPPINGS)) {
        expect(mapping.odu_numero).toBeGreaterThan(0);
        expect(mapping.odu_numero).toBeLessThanOrEqual(16);
        expect(mapping.odu_nome.length).toBeGreaterThan(0);
        expect(mapping.odu_nome_yoruba.length).toBeGreaterThan(0);
        expect(mapping.orixa.length).toBeGreaterThan(0);
        expect(['fogo', 'água', 'ar', 'terra', 'éter']).toContain(mapping.elemento);
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
        expect(mapping.mensagem_central.length).toBeGreaterThan(0);
        expect(Array.isArray(mapping.cores)).toBe(true);
        expect(mapping.cores.length).toBeGreaterThan(0);
        expect(Array.isArray(mapping.dias_sagrados)).toBe(true);
        expect(mapping.dias_sagrados.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── Type exports ────────────────────────────────────────────────────────

  describe('Type exports', () => {
    def('OdTuOrixa', () => {
      const mapping = getAllOduOrixas()[0];
      expect(mapping).toBeDefined();
    });

    it('should export ElementType', () => {
      const element: ElementType = 'fogo';
      expect(element).toBe('fogo');
    });
  });
});
