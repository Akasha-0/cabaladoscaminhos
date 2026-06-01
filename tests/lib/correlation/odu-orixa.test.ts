/**
 * Odu Ifá - Orixá Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getOduOrixa,
  getOrixaOdu,
  getAllOduOrixas,
  getAllOduNumbers,
  getAllOduNames,
  getAllOrixaNames,
  getOrixasByElement,
  hasOduOrixa,
  getOduElement,
  getOduPraticasEspirituais,
  getOduSimbolismo,
  getOduOrixaName,
  ODU_ORIXA_MAPPINGS,
  type OduOrixa,
} from '@/lib/correlation/odu-orixa';

describe('Odu-Orixá Correlation', () => {
  // ─── getOduOrixa by number ────────────────────────────────────────────────

  describe('getOduOrixa by number', () => {
    it('should return correct mapping for Odu 1 (Okaran) → Oxalá', () => {
      const result = getOduOrixa(1);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(1);
      expect(result!.odu.nome).toBe('Okaran');
      expect(result!.orixa.nome).toBe('Oxalá');
      expect(result!.elemento).toBe('éter');
    });

    it('should return correct mapping for Odu 2 (Ejiokô) → Oxum', () => {
      const result = getOduOrixa(2);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(2);
      expect(result!.odu.nome).toBe('Ejiokô');
      expect(result!.orixa.nome).toBe('Oxum');
      expect(result!.elemento).toBe('água');
    });

    it('should return correct mapping for Odu 3 (Etaogundá) → Iemanjá', () => {
      const result = getOduOrixa(3);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(3);
      expect(result!.odu.nome).toBe('Etaogundá');
      expect(result!.orixa.nome).toBe('Iemanjá');
      expect(result!.elemento).toBe('fogo');
    });

    it('should return correct mapping for Odu 4 (Irosun) → Oxum', () => {
      const result = getOduOrixa(4);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(4);
      expect(result!.odu.nome).toBe('Irosun');
      expect(result!.orixa.nome).toBe('Oxum');
      expect(result!.elemento).toBe('água');
    });

    it('should return correct mapping for Odu 5 (Oxé) → Ogum', () => {
      const result = getOduOrixa(5);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(5);
      expect(result!.odu.nome).toBe('Oxé');
      expect(result!.orixa.nome).toBe('Ogum');
      expect(result!.elemento).toBe('fogo');
    });

    it('should return correct mapping for Odu 6 (Obará) → Oxalá', () => {
      const result = getOduOrixa(6);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(6);
      expect(result!.odu.nome).toBe('Obará');
      expect(result!.orixa.nome).toBe('Oxalá');
      expect(result!.elemento).toBe('terra');
    });

    it('should return correct mapping for Odu 7 (Odi) → Iemanjá', () => {
      const result = getOduOrixa(7);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(7);
      expect(result!.odu.nome).toBe('Odi');
      expect(result!.orixa.nome).toBe('Iemanjá');
      expect(result!.elemento).toBe('água');
    });

    it('should return correct mapping for Odu 8 (Ejionlá) → Logun Ede', () => {
      const result = getOduOrixa(8);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(8);
      expect(result!.odu.nome).toBe('Ejionlá');
      expect(result!.orixa.nome).toBe('Logun Ede');
      expect(result!.elemento).toBe('água');
    });

    it('should return correct mapping for Odu 9 (Oshe) → Iemanjá', () => {
      const result = getOduOrixa(9);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(9);
      expect(result!.odu.nome).toBe('Oshe');
      expect(result!.orixa.nome).toBe('Iemanjá');
      expect(result!.elemento).toBe('água');
    });

    it('should return correct mapping for Odu 10 (Ofun) → Oxalá', () => {
      const result = getOduOrixa(10);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(10);
      expect(result!.odu.nome).toBe('Ofun');
      expect(result!.orixa.nome).toBe('Oxalá');
      expect(result!.elemento).toBe('éter');
    });

    it('should return correct mapping for Odu 11 (Eyonla) → Nanã Buruku', () => {
      const result = getOduOrixa(11);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(11);
      expect(result!.odu.nome).toBe('Eyonla');
      expect(result!.orixa.nome).toBe('Nanã Buruku');
      expect(result!.elemento).toBe('terra');
    });

    it('should return correct mapping for Odu 12 (Merinla) → Nanã Buruku', () => {
      const result = getOduOrixa(12);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(12);
      expect(result!.odu.nome).toBe('Merinla');
      expect(result!.orixa.nome).toBe('Nanã Buruku');
      expect(result!.elemento).toBe('terra');
    });

    it('should return correct mapping for Odu 13 (Mero) → Oxum', () => {
      const result = getOduOrixa(13);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(13);
      expect(result!.odu.nome).toBe('Mero');
      expect(result!.orixa.nome).toBe('Oxum');
      expect(result!.elemento).toBe('água');
    });

    it('should return correct mapping for Odu 14 (Jinza) → Ogum', () => {
      const result = getOduOrixa(14);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(14);
      expect(result!.odu.nome).toBe('Jinza');
      expect(result!.orixa.nome).toBe('Ogum');
      expect(result!.elemento).toBe('fogo');
    });

    it('should return correct mapping for Odu 15 (Jotagbe) → Oxalá', () => {
      const result = getOduOrixa(15);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(15);
      expect(result!.odu.nome).toBe('Jotagbe');
      expect(result!.orixa.nome).toBe('Oxalá');
      expect(result!.elemento).toBe('éter');
    });

    it('should return correct mapping for Odu 16 (Otura) → Nanã Buruku', () => {
      const result = getOduOrixa(16);
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(16);
      expect(result!.odu.nome).toBe('Otura');
      expect(result!.orixa.nome).toBe('Nanã Buruku');
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
      expect(result!.odu.numero).toBe(1);
      expect(result!.orixa.nome).toBe('Oxalá');
    });

    it('should find Odu by Yoruba name', () => {
      const result = getOduOrixa('Okànràn');
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(1);
      expect(result!.orixa.nome).toBe('Oxalá');
    });

    it('should be case insensitive', () => {
      const result = getOduOrixa('okaran');
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(1);
    });

    it('should trim whitespace', () => {
      const result = getOduOrixa('  Okaran  ');
      expect(result).not.toBeNull();
      expect(result!.odu.numero).toBe(1);
    });

    it('should return null for unknown Odu name', () => {
      expect(getOduOrixa('UnknownOdu')).toBeNull();
    });
  });

  // ─── getOrixaOdu ──────────────────────────────────────────────────────────

  describe('getOrixaOdu', () => {
    it('should return reverse mapping with Orixás', () => {
      const result = getOrixaOdu();
      expect(result).toBeDefined();
      expect(Object.keys(result).length).toBeGreaterThan(0);
    });

    it('should include Oxalá with multiple Odus', () => {
      const result = getOrixaOdu();
      expect(result['Oxalá']).toBeDefined();
      expect(result['Oxalá']).toContain(1); // Okaran
      expect(result['Oxalá']).toContain(6); // Obará
      expect(result['Oxalá']).toContain(10); // Ofun
      expect(result['Oxalá']).toContain(15); // Jotagbe
    });

    it('should include Iemanjá with multiple Odus', () => {
      const result = getOrixaOdu();
      expect(result['Iemanjá']).toBeDefined();
      expect(result['Iemanjá']).toContain(3); // Etaogundá
      expect(result['Iemanjá']).toContain(7); // Odi
      expect(result['Iemanjá']).toContain(9); // Oshe
    });

    it('should include Oxum with multiple Odus', () => {
      const result = getOrixaOdu();
      expect(result['Oxum']).toBeDefined();
      expect(result['Oxum']).toContain(2); // Ejiokô
      expect(result['Oxum']).toContain(4); // Irosun
      expect(result['Oxum']).toContain(13); // Mero
    });

    it('should include Nanã Buruku', () => {
      const result = getOrixaOdu();
      expect(result['Nanã Buruku']).toBeDefined();
      expect(result['Nanã Buruku']).toContain(11); // Eyonla
      expect(result['Nanã Buruku']).toContain(12); // Merinla
      expect(result['Nanã Buruku']).toContain(16); // Otura
    });

    it('should include Ogum', () => {
      const result = getOrixaOdu();
      expect(result['Ogum']).toBeDefined();
      expect(result['Ogum']).toContain(5); // Oxé
      expect(result['Ogum']).toContain(14); // Jinza
    });

    it('should include Logun Ede', () => {
      const result = getOrixaOdu();
      expect(result['Logun Ede']).toBeDefined();
      expect(result['Logun Ede']).toContain(8); // Ejionlá
    });
  });

  // ─── getAllOduOrixas ─────────────────────────────────────────────────────

  describe('getAllOduOrixas', () => {
    it('should return all 16 Odu-Orixá mappings', () => {
      const result = getAllOduOrixas();
      expect(result).toHaveLength(16);
    });

    it('should return sorted by Odu number', () => {
      const result = getAllOduOrixas();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].odu.numero).toBeLessThan(result[i + 1].odu.numero);
      }
    });

    it('should include all required properties', () => {
      const result = getAllOduOrixas();
      for (const mapping of result) {
        expect(mapping.odu).toBeDefined();
        expect(mapping.odu.numero).toBeDefined();
        expect(mapping.odu.nome).toBeDefined();
        expect(mapping.orixa).toBeDefined();
        expect(mapping.orixa.nome).toBeDefined();
        expect(mapping.elemento).toBeDefined();
        expect(mapping.conexao_espiritual).toBeDefined();
        expect(mapping.praticas_espirituais).toBeDefined();
        expect(mapping.simbolismo).toBeDefined();
      }
    });
  });

  // ─── getAllOduNumbers ─────────────────────────────────────────────────────

  describe('getAllOduNumbers', () => {
    it('should return numbers 1-16', () => {
      const result = getAllOduNumbers();
      expect(result).toHaveLength(16);
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    });

    it('should be sorted', () => {
      const result = getAllOduNumbers();
      const sorted = [...result].sort((a, b) => a - b);
      expect(result).toEqual(sorted);
    });
  });

  // ─── getAllOduNames ────────────────────────────────────────────────────────

  describe('getAllOduNames', () => {
    it('should return 16 Odu names', () => {
      const result = getAllOduNames();
      expect(result).toHaveLength(16);
    });

    it('should include all Merindilogun names', () => {
      const result = getAllOduNames();
      expect(result).toContain('Okaran');
      expect(result).toContain('Ejiokô');
      expect(result).toContain('Etaogundá');
      expect(result).toContain('Irosun');
      expect(result).toContain('Oxé');
      expect(result).toContain('Obará');
      expect(result).toContain('Odi');
      expect(result).toContain('Ejionlá');
      expect(result).toContain('Oshe');
      expect(result).toContain('Ofun');
      expect(result).toContain('Eyonla');
      expect(result).toContain('Merinla');
      expect(result).toContain('Mero');
      expect(result).toContain('Jinza');
      expect(result).toContain('Jotagbe');
      expect(result).toContain('Otura');
    });
  });

  // ─── getAllOrixaNames ─────────────────────────────────────────────────────

  describe('getAllOrixaNames', () => {
    it('should return unique Orixá names', () => {
      const result = getAllOrixaNames();
      expect(result.length).toBeGreaterThan(0);
      // All names should be unique
      const uniqueSet = new Set(result);
      expect(uniqueSet.size).toBe(result.length);
    });

    it('should include primary Orixás', () => {
      const result = getAllOrixaNames();
      expect(result).toContain('Oxalá');
      expect(result).toContain('Iemanjá');
      expect(result).toContain('Oxum');
      expect(result).toContain('Ogum');
      expect(result).toContain('Nanã Buruku');
      expect(result).toContain('Logun Ede');
    });
  });

  // ─── getOrixasByElement ──────────────────────────────────────────────────

  describe('getOrixasByElement', () => {
    it('should return Odus for fogo element', () => {
      const result = getOrixasByElement('fogo');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.elemento).toBe('fogo');
      }
    });

    it('should return Odus for água element', () => {
      const result = getOrixasByElement('água');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.elemento).toBe('água');
      }
    });

    it('should return Odus for terra element', () => {
      const result = getOrixasByElement('terra');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.elemento).toBe('terra');
      }
    });

    it('should return Odus for éter element', () => {
      const result = getOrixasByElement('éter');
      expect(result.length).toBeGreaterThan(0);
      for (const mapping of result) {
        expect(mapping.elemento).toBe('éter');
      }
    });
  });

  // ─── hasOduOrixa ─────────────────────────────────────────────────────────

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
    });
  });

  // ─── getOduElement ──────────────────────────────────────────────────────

  describe('getOduElement', () => {
    it('should return element for valid Odu numbers', () => {
      expect(getOduElement(1)).toBe('éter');
      expect(getOduElement(2)).toBe('água');
      expect(getOduElement(3)).toBe('fogo');
      expect(getOduElement(6)).toBe('terra');
    });

    it('should return null for invalid Odu numbers', () => {
      expect(getOduElement(0)).toBeNull();
      expect(getOduElement(17)).toBeNull();
    });
  });

  // ─── getOduPraticasEspirituais ───────────────────────────────────────────

  describe('getOduPraticasEspirituais', () => {
    it('should return practices for valid Odu numbers', () => {
      const result = getOduPraticasEspirituais(1);
      expect(result).not.toBeNull();
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should return null for invalid Odu numbers', () => {
      expect(getOduPraticasEspirituais(0)).toBeNull();
      expect(getOduPraticasEspirituais(17)).toBeNull();
    });

    it('should return array of string practices', () => {
      const result = getOduPraticasEspirituais(1);
      expect(Array.isArray(result)).toBe(true);
      for (const practice of result!) {
        expect(typeof practice).toBe('string');
      }
    });
  });

  // ─── getOduSimbolismo ────────────────────────────────────────────────────

  describe('getOduSimbolismo', () => {
    it('should return symbols for valid Odu numbers', () => {
      const result = getOduSimbolismo(1);
      expect(result).not.toBeNull();
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should return null for invalid Odu numbers', () => {
      expect(getOduSimbolismo(0)).toBeNull();
      expect(getOduSimbolismo(17)).toBeNull();
    });

    it('should return array of string symbols', () => {
      const result = getOduSimbolismo(1);
      expect(Array.isArray(result)).toBe(true);
      for (const symbol of result!) {
        expect(typeof symbol).toBe('string');
      }
    });
  });

  // ─── getOduOrixaName ─────────────────────────────────────────────────────

  describe('getOduOrixaName', () => {
    it('should return Orixá name for valid Odu numbers', () => {
      expect(getOduOrixaName(1)).toBe('Oxalá');
      expect(getOduOrixaName(2)).toBe('Oxum');
      expect(getOduOrixaName(3)).toBe('Iemanjá');
      expect(getOduOrixaName(5)).toBe('Ogum');
    });

    it('should return null for invalid Odu numbers', () => {
      expect(getOduOrixaName(0)).toBeNull();
      expect(getOduOrixaName(17)).toBeNull();
    });
  });

  // ─── ODU_ORIXA_MAPPINGS constant ─────────────────────────────────────────

  describe('ODU_ORIXA_MAPPINGS', () => {
    it('should have 16 entries', () => {
      expect(Object.keys(ODU_ORIXA_MAPPINGS).length).toBe(16);
    });

    it('should be frozen', () => {
      expect(Object.isFrozen(ODU_ORIXA_MAPPINGS)).toBe(true);
    });

    it('should contain all expected Orixás', () => {
      const orixas = new Set(Object.values(ODU_ORIXA_MAPPINGS).map((m) => m.orixa.nome));
      expect(orixas.has('Oxalá')).toBe(true);
      expect(orixas.has('Iemanjá')).toBe(true);
      expect(orixas.has('Oxum')).toBe(true);
      expect(orixas.has('Ogum')).toBe(true);
      expect(orixas.has('Nanã Buruku')).toBe(true);
      expect(orixas.has('Logun Ede')).toBe(true);
    });
  });

  // ─── Type validation ─────────────────────────────────────────────────────

  describe('OduOrixa interface validation', () => {
    it('should have correct structure for all mappings', () => {
      for (const mapping of Object.values(ODU_ORIXA_MAPPINGS)) {
        expect(mapping.odu.numero).toBeGreaterThanOrEqual(1);
        expect(mapping.odu.numero).toBeLessThanOrEqual(16);
        expect(typeof mapping.odu.nome).toBe('string');
        expect(typeof mapping.orixa.nome).toBe('string');
        expect(['fogo', 'água', 'ar', 'terra', 'éter']).toContain(mapping.elemento);
        expect(typeof mapping.conexao_espiritual).toBe('string');
        expect(Array.isArray(mapping.praticas_espirituais)).toBe(true);
        expect(Array.isArray(mapping.simbolismo)).toBe(true);
      }
    });

    it('should have non-empty spiritual practices', () => {
      for (const mapping of Object.values(ODU_ORIXA_MAPPINGS)) {
        expect(mapping.praticas_espirituais.length).toBeGreaterThan(0);
      }
    });

    it('should have non-empty symbolism', () => {
      for (const mapping of Object.values(ODU_ORIXA_MAPPINGS)) {
        expect(mapping.simbolismo.length).toBeGreaterThan(0);
      }
    });
  });

  // ─── Default export ─────────────────────────────────────────────────────

  describe('Default export', () => {
    it('should export all required functions', async () => {
      const mod = await import('@/lib/correlation/odu-orixa');
      const defaultExport = mod.default;
      
      expect(defaultExport.getOduOrixa).toBeDefined();
      expect(defaultExport.getOrixaOdu).toBeDefined();
      expect(defaultExport.getAllOduOrixas).toBeDefined();
      expect(defaultExport.ODU_ORIXA_MAPPINGS).toBeDefined();
    });
  });
});