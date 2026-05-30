/**
 * Numerology-Odú Ifá Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getNumerologyOdu,
  getOduNumerology,
  getAllNumerologyOdus,
  getAllOduNames,
  hasNumerologyOdu,
  getNumerologyEnergy,
  getNumerologyElement,
  NUMEROLOGY_ODU_MAPPINGS,
  type NumerologyOduMapping,
} from '@/lib/correlation/numerology-odu';

describe('Numerology-Odu Correlation', () => {
  // ─── getNumerologyOdu: numbers 1-13 ─────────────────────────────────────────────

  describe('getNumerologyOdu', () => {
    it('should return correct mapping for number 1 (Ofun)', () => {
      const result = getNumerologyOdu(1);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(1);
      expect(result!.odu.nome).toBe('Ofun');
      expect(result!.odu.numero).toBe(10);
      expect(result!.alinhamento_energetico).toBe('Quente');
      expect(result!.elemento).toBe('Fogo');
    });

    it('should return correct mapping for number 2 (Ogbe)', () => {
      const result = getNumerologyOdu(2);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(2);
      expect(result!.odu.nome).toBe('Ogbe');
      expect(result!.odu.numero).toBe(1);
      expect(result!.alinhamento_energetico).toBe('Neutra');
      expect(result!.elemento).toBe('Água');
    });

    it('should return correct mapping for number 3 (Etaogundá)', () => {
      const result = getNumerologyOdu(3);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(3);
      expect(result!.odu.nome).toBe('Etaogundá');
      expect(result!.odu.numero).toBe(3);
      expect(result!.alinhamento_energetico).toBe('Quente');
      expect(result!.elemento).toBe('Fogo');
    });

    it('should return correct mapping for number 4 (Irosun)', () => {
      const result = getNumerologyOdu(4);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(4);
      expect(result!.odu.nome).toBe('Irosun');
      expect(result!.odu.numero).toBe(4);
      expect(result!.alinhamento_energetico).toBe('Fria');
      expect(result!.elemento).toBe('Água');
    });

    it('should return correct mapping for number 5 (Oxé)', () => {
      const result = getNumerologyOdu(5);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(5);
      expect(result!.odu.nome).toBe('Oxé');
      expect(result!.odu.numero).toBe(5);
      expect(result!.alinhamento_energetico).toBe('Neutra');
      expect(result!.elemento).toBe('Terra');
    });

    it('should return correct mapping for number 6 (Obará)', () => {
      const result = getNumerologyOdu(6);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(6);
      expect(result!.odu.nome).toBe('Obará');
      expect(result!.odu.numero).toBe(6);
      expect(result!.alinhamento_energetico).toBe('Neutra');
      expect(result!.elemento).toBe('Terra');
    });

    it('should return correct mapping for number 7 (Odi)', () => {
      const result = getNumerologyOdu(7);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(7);
      expect(result!.odu.nome).toBe('Odi');
      expect(result!.odu.numero).toBe(7);
      expect(result!.alinhamento_energetico).toBe('Fria');
      expect(result!.elemento).toBe('Água');
    });

    it('should return correct mapping for number 8 (Ijonse)', () => {
      const result = getNumerologyOdu(8);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(8);
      expect(result!.odu.nome).toBe('Ijonse');
      expect(result!.odu.numero).toBe(8);
      expect(result!.alinhamento_energetico).toBe('Neutra');
      expect(result!.elemento).toBe('Terra');
    });

    it('should return correct mapping for number 9 (Se)', () => {
      const result = getNumerologyOdu(9);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(9);
      expect(result!.odu.nome).toBe('Se');
      expect(result!.odu.numero).toBe(9);
      expect(result!.alinhamento_energetico).toBe('Quente');
      expect(result!.elemento).toBe('Fogo');
    });

    it('should return correct mapping for number 10 (Ofun)', () => {
      const result = getNumerologyOdu(10);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(10);
      expect(result!.odu.nome).toBe('Ofun');
      expect(result!.odu.numero).toBe(10);
      expect(result!.alinhamento_energetico).toBe('Quente');
      expect(result!.elemento).toBe('Fogo');
    });

    it('should return correct mapping for number 11 (Nanã)', () => {
      const result = getNumerologyOdu(11);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(11);
      expect(result!.odu.nome).toBe('Nanã');
      expect(result!.odu.numero).toBe(11);
      expect(result!.alinhamento_energetico).toBe('Fria');
      expect(result!.elemento).toBe('Água');
    });

    it('should return correct mapping for number 12 (Ejilsebora)', () => {
      const result = getNumerologyOdu(12);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(12);
      expect(result!.odu.nome).toBe('Ejilsebora');
      expect(result!.odu.numero).toBe(12);
      expect(result!.alinhamento_energetico).toBe('Neutra');
      expect(result!.elemento).toBe('Ar');
    });

    it('should return correct mapping for number 13 (Olobón)', () => {
      const result = getNumerologyOdu(13);
      expect(result).not.toBeNull();
      expect(result!.numero).toBe(13);
      expect(result!.odu.nome).toBe('Olobón');
      expect(result!.odu.numero).toBe(13);
      expect(result!.alinhamento_energetico).toBe('Quente');
      expect(result!.elemento).toBe('Fogo');
    });

    it('should return null for number 0', () => {
      const result = getNumerologyOdu(0);
      expect(result).toBeNull();
    });

    it('should return null for negative numbers', () => {
      expect(getNumerologyOdu(-1)).toBeNull();
      expect(getNumerologyOdu(-5)).toBeNull();
    });

    it('should return null for numbers greater than 13', () => {
      expect(getNumerologyOdu(14)).toBeNull();
      expect(getNumerologyOdu(100)).toBeNull();
    });
  });

  // ─── getOduNumerology: reverse lookup ─────────────────────────────────────────

  describe('getOduNumerology', () => {
    it('should return numerology mappings for Odu number 10', () => {
      const result = getOduNumerology(10);
      expect(result).not.toBeNull();
      expect(result!.length).toBeGreaterThanOrEqual(1);
      expect(result![0].odu.numero).toBe(10);
    });

    it('should return numerology mappings for Odu number 1 (Ogbe)', () => {
      const result = getOduNumerology(1);
      expect(result).not.toBeNull();
      expect(result!.some((m) => m.odu.nome === 'Ogbe')).toBe(true);
    });

    it('should return null for unmapped Odu numbers', () => {
      expect(getOduNumerology(14)).toBeNull();
      expect(getOduNumerology(15)).toBeNull();
      expect(getOduNumerology(16)).toBeNull();
    });
  });

  // ─── getAllNumerologyOdus ─────────────────────────────────────────────────────

  describe('getAllNumerologyOdus', () => {
    it('should return all 13 mappings', () => {
      const result = getAllNumerologyOdus();
      expect(result).toHaveLength(13);
    });

    it('should return mappings sorted by numero', () => {
      const result = getAllNumerologyOdus();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].numero).toBeLessThan(result[i + 1].numero);
      }
    });

    it('should contain all numbers from 1 to 13', () => {
      const result = getAllNumerologyOdus();
      const numeros = result.map((r) => r.numero);
      for (let i = 1; i <= 13; i++) {
        expect(numeros).toContain(i);
      }
    });

    it('should contain all required fields in each mapping', () => {
      const result = getAllNumerologyOdus();
      result.forEach((mapping) => {
        expect(mapping).toHaveProperty('numero');
        expect(mapping).toHaveProperty('odu');
        expect(mapping.odu).toHaveProperty('numero');
        expect(mapping.odu).toHaveProperty('nome');
        expect(mapping.odu).toHaveProperty('nomeingles');
        expect(mapping).toHaveProperty('significado_espiritual');
        expect(mapping).toHaveProperty('alinhamento_energetico');
        expect(mapping).toHaveProperty('elemento');
        expect(mapping).toHaveProperty('interpretacao');
      });
    });
  });

  // ─── getAllOduNames ─────────────────────────────────────────────────────────────

  describe('getAllOduNames', () => {
    it('should return unique Odu names', () => {
      const result = getAllOduNames();
      const uniqueNames = new Set(result);
      expect(result.length).toBe(uniqueNames.size);
    });

    it('should contain key Odu names', () => {
      const result = getAllOduNames();
      expect(result).toContain('Ogbe');
      expect(result).toContain('Irosun');
      expect(result).toContain('Oxé');
      expect(result).toContain('Olobón');
    });
  });

  // ─── hasNumerologyOdu ──────────────────────────────────────────────────────────

  describe('hasNumerologyOdu', () => {
    it('should return true for valid numbers 1-13', () => {
      for (let i = 1; i <= 13; i++) {
        expect(hasNumerologyOdu(i)).toBe(true);
      }
    });

    it('should return false for numbers outside 1-13', () => {
      expect(hasNumerologyOdu(0)).toBe(false);
      expect(hasNumerologyOdu(-1)).toBe(false);
      expect(hasNumerologyOdu(14)).toBe(false);
      expect(hasNumerologyOdu(100)).toBe(false);
    });
  });

  // ─── getNumerologyEnergy ──────────────────────────────────────────────────────

  describe('getNumerologyEnergy', () => {
    it('should return energy alignment for valid numbers', () => {
      expect(getNumerologyEnergy(1)).toBe('Quente');
      expect(getNumerologyEnergy(2)).toBe('Neutra');
      expect(getNumerologyEnergy(4)).toBe('Fria');
      expect(getNumerologyEnergy(7)).toBe('Fria');
      expect(getNumerologyEnergy(11)).toBe('Fria');
      expect(getNumerologyEnergy(13)).toBe('Quente');
    });

    it('should return null for invalid numbers', () => {
      expect(getNumerologyEnergy(0)).toBeNull();
      expect(getNumerologyEnergy(14)).toBeNull();
    });
  });

  // ─── getNumerologyElement ──────────────────────────────────────────────────────

  describe('getNumerologyElement', () => {
    it('should return element for valid numbers', () => {
      expect(getNumerologyElement(1)).toBe('Fogo');
      expect(getNumerologyElement(2)).toBe('Água');
      expect(getNumerologyElement(5)).toBe('Terra');
      expect(getNumerologyElement(12)).toBe('Ar');
    });

    it('should return null for invalid numbers', () => {
      expect(getNumerologyElement(0)).toBeNull();
      expect(getNumerologyElement(14)).toBeNull();
    });
  });

  // ─── NUMEROLOGY_ODU_MAPPINGS constant ──────────────────────────────────────────

  describe('NUMEROLOGY_ODU_MAPPINGS', () => {
    it('should have 13 entries', () => {
      expect(Object.keys(NUMEROLOGY_ODU_MAPPINGS)).toHaveLength(13);
    });

    it('should have keys 1-13', () => {
      for (let i = 1; i <= 13; i++) {
        expect(NUMEROLOGY_ODU_MAPPINGS[i]).toBeDefined();
      }
    });

    it('should be frozen', () => {
      expect(Object.isFrozen(NUMEROLOGY_ODU_MAPPINGS)).toBe(true);
    });

    it('should have valid Odu names in Portuguese', () => {
      Object.values(NUMEROLOGY_ODU_MAPPINGS).forEach((mapping) => {
        expect(typeof mapping.odu.nome).toBe('string');
        expect(mapping.odu.nome.length).toBeGreaterThan(0);
      });
    });

    it('should have valid energy alignments', () => {
      const validEnergies = ['Quente', 'Fria', 'Neutra'];
      Object.values(NUMEROLOGY_ODU_MAPPINGS).forEach((mapping) => {
        expect(validEnergies).toContain(mapping.alinhamento_energetico);
      });
    });
  });

  // ─── Interface completeness ──────────────────────────────────────────────────

  describe('NumerologyOduMapping interface completeness', () => {
    it('should have all required interface fields', () => {
      const mapping = getNumerologyOdu(1)!;
      expect(mapping).toHaveProperty('numero');
      expect(mapping).toHaveProperty('odu');
      expect(mapping.odu).toHaveProperty('numero');
      expect(mapping.odu).toHaveProperty('nome');
      expect(mapping.odu).toHaveProperty('nomeingles');
      expect(mapping).toHaveProperty('significado_espiritual');
      expect(mapping).toHaveProperty('alinhamento_energetico');
      expect(mapping).toHaveProperty('elemento');
      expect(mapping).toHaveProperty('interpretacao');
    });

    it('should have non-empty spiritual meaning for all numbers', () => {
      const allMappings = getAllNumerologyOdus();
      allMappings.forEach((mapping) => {
        expect(mapping.significado_espiritual.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty interpretation for all numbers', () => {
      const allMappings = getAllNumerologyOdus();
      allMappings.forEach((mapping) => {
        expect(mapping.interpretacao.length).toBeGreaterThan(0);
      });
    });
  });

  // ─── Default export ───────────────────────────────────────────────────────────
  describe('default export', () => {
    it('should export getNumerologyOdu', async () => {
      const numerologyOduModule = await import('@/lib/correlation/numerology-odu');
      expect(typeof numerologyOduModule.default.getNumerologyOdu).toBe('function');
    });
    it('should export getOduNumerology', async () => {
      const numerologyOduModule = await import('@/lib/correlation/numerology-odu');
      expect(typeof numerologyOduModule.default.getOduNumerology).toBe('function');
    });
    it('should export getAllNumerologyOdus', async () => {
      const numerologyOduModule = await import('@/lib/correlation/numerology-odu');
      expect(typeof numerologyOduModule.default.getAllNumerologyOdus).toBe('function');
    });
    it('should export NUMEROLOGY_ODU_MAPPINGS', async () => {
      const numerologyOduModule = await import('@/lib/correlation/numerology-odu');
      expect(numerologyOduModule.default.NUMEROLOGY_ODU_MAPPINGS).toBeDefined();
    });
  });
});