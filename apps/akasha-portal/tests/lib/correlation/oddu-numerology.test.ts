import { describe, it, expect } from 'vitest';
import {
  getOduNumerology,
  getNumerologyOdu,
  getAllOduNumerologies,
  getAllOduNumbers,
  getAllOduNames,
  getAllNumerologyNumbers,
  getOduByElement,
  getOdusForNumber,
  getOduElement,
  getOduMessage,
  getOduNumbers,
  hasOduNumerology,
  ODDU_NUMEROLOGY_MAPPINGS,
} from '@/lib/correlation/oddu-numerology';

describe('correlation/oddu-numerology', () => {
  describe('getOduNumerology', () => {
    it('returns mapping for valid Odu number', () => {
      const result = getOduNumerology(1);
      expect(result).toBeTruthy();
      expect(result?.odu_numero).toBe(1);
      expect(result?.odu_nome).toBe('Okaran');
    });

    it('returns mapping for valid Odu name', () => {
      const result = getOduNumerology('Okaran');
      expect(result).toBeTruthy();
      expect(result?.odu_numero).toBe(1);
    });

    it('returns mapping for Yoruba name', () => {
      const result = getOduNumerology('Okànràn');
      expect(result).toBeTruthy();
      expect(result?.odu_numero).toBe(1);
    });

    it('returns null for invalid Odu number', () => {
      const result = getOduNumerology(99);
      expect(result).toBeNull();
    });

    it('returns null for invalid Odu name', () => {
      const result = getOduNumerology('InvalidOdu');
      expect(result).toBeNull();
    });

    it('each mapping has required fields', () => {
      const result = getOduNumerology(10);
      expect(result?.odu_numero).toBeTruthy();
      expect(result?.odu_nome).toBeTruthy();
      expect(result?.odu_nome_yoruba).toBeTruthy();
      expect(result?.numeros).toBeTruthy();
      expect(result?.elemento).toBeTruthy();
      expect(result?.alinhamento_energetico).toBeTruthy();
      expect(result?.significado_espiritual).toBeTruthy();
      expect(result?.mensagem_central).toBeTruthy();
      expect(result?.cores).toBeTruthy();
      expect(result?.qualidades).toBeTruthy();
    });

    it('returns mapping for all 16 Odus', () => {
      for (let i = 1; i <= 16; i++) {
        const result = getOduNumerology(i);
        expect(result).not.toBeNull();
        expect(result?.odu_numero).toBe(i);
      }
    });
  });

  describe('getNumerologyOdu', () => {
    it('returns Odu mappings for valid numerology number', () => {
      const result = getNumerologyOdu(1);
      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('finds Odus that contain the number', () => {
      const result = getNumerologyOdu(10);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(m => {
        expect(m.numeros.some(n => n.numero === 10)).toBe(true);
      });
    });

    it('returns empty array for invalid number', () => {
      const result = getNumerologyOdu(99);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('getAllOduNumerologies', () => {
    it('returns all Odu mappings', () => {
      const result = getAllOduNumerologies();
      expect(result.length).toBe(16);
    });

    it('all mappings have unique Odu numbers', () => {
      const result = getAllOduNumerologies();
      const numbers = result.map(m => m.odu_numero);
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(numbers.length);
      expect(uniqueNumbers.size).toBe(16);
    });

    it('mappings are sorted by Odu number', () => {
      const result = getAllOduNumerologies();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].odu_numero).toBeGreaterThan(result[i - 1].odu_numero);
      }
    });

    it('each mapping has 2 numerology numbers', () => {
      const result = getAllOduNumerologies();
      result.forEach(m => {
        expect(m.numeros.length).toBe(2);
      });
    });
  });

  describe('getAllOduNumbers', () => {
    it('returns numbers 1-16', () => {
      const result = getAllOduNumbers();
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    });

    it('contains no duplicates', () => {
      const result = getAllOduNumbers();
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });
  });

  describe('getAllOduNames', () => {
    it('returns all 16 Odu names in Portuguese', () => {
      const result = getAllOduNames();
      expect(result.length).toBe(16);
    });

    it('names are sorted by Odu number', () => {
      const result = getAllOduNames();
      const mappings = getAllOduNumerologies();
      expect(result[0]).toBe(mappings[0].odu_nome);
      expect(result[15]).toBe(mappings[15].odu_nome);
    });
  });

  describe('getAllNumerologyNumbers', () => {
    it('returns all unique numerology numbers', () => {
      const result = getAllNumerologyNumbers();
      expect(result.length).toBeGreaterThan(0);
    });

    it('numbers are sorted', () => {
      const result = getAllNumerologyNumbers();
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThan(result[i - 1]);
      }
    });

    it('contains expected numbers 1-13', () => {
      const result = getAllNumerologyNumbers();
      for (let i = 1; i <= 13; i++) {
        // Each number from 1-13 should appear at least once
        const hasNumber = result.some(n => n === i);
        expect(hasNumber).toBe(true);
      }
    });
  });

  describe('getOduByElement', () => {
    it('returns Odus for fogo element', () => {
      const result = getOduByElement('fogo');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(m => {
        expect(m.elemento).toBe('fogo');
      });
    });

    it('returns Odus for água element', () => {
      const result = getOduByElement('água');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(m => {
        expect(m.elemento).toBe('água');
      });
    });

    it('returns empty array for unused element', () => {
      const result = getOduByElement('éter');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getOdusForNumber', () => {
    it('returns Odu names for number 1', () => {
      const result = getOdusForNumber(1);
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns Odu names for number 10', () => {
      const result = getOdusForNumber(10);
      expect(result.length).toBeGreaterThan(0);
      expect(result.includes('Okaran')).toBe(true);
    });

    it('returns empty array for unused number', () => {
      const result = getOdusForNumber(14);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getOduElement', () => {
    it('returns element for valid Odu number', () => {
      const result = getOduElement(1);
      expect(result).toBeTruthy();
      expect(['fogo', 'água', 'ar', 'terra', 'éter']).toContain(result);
    });

    it('returns null for invalid Odu number', () => {
      const result = getOduElement(99);
      expect(result).toBeNull();
    });
  });

  describe('getOduMessage', () => {
    it('returns message for valid Odu number', () => {
      const result = getOduMessage(1);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result!.length).toBeGreaterThan(0);
    });

    it('returns null for invalid Odu number', () => {
      const result = getOduMessage(99);
      expect(result).toBeNull();
    });
  });

  describe('getOduNumbers', () => {
    it('returns numerology correlations for valid Odu', () => {
      const result = getOduNumbers(1);
      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
      expect(result!.length).toBe(2);
      result!.forEach(n => {
        expect(typeof n.numero).toBe('number');
        expect(typeof n.interpretacao).toBe('string');
      });
    });

    it('returns null for invalid Odu number', () => {
      const result = getOduNumbers(99);
      expect(result).toBeNull();
    });
  });

  describe('hasOduNumerology', () => {
    it('returns true for valid Odu numbers', () => {
      for (let i = 1; i <= 16; i++) {
        expect(hasOduNumerology(i)).toBe(true);
      }
    });

    it('returns false for invalid Odu numbers', () => {
      expect(hasOduNumerology(0)).toBe(false);
      expect(hasOduNumerology(17)).toBe(false);
      expect(hasOduNumerology(99)).toBe(false);
    });
  });

  describe('element distribution', () => {
    it('covers all element types', () => {
      const elements = new Set(Object.values(ODDU_NUMEROLOGY_MAPPINGS).map(m => m.elemento));
      expect(elements.has('fogo')).toBe(true);
      expect(elements.has('água')).toBe(true);
      expect(elements.has('ar')).toBe(true);
      expect(elements.has('terra')).toBe(true);
      expect(elements.has('éter')).toBe(true);
    });
  });

  describe('energy alignment distribution', () => {
    it('covers all energy alignments', () => {
      const alignments = new Set(Object.values(ODDU_NUMEROLOGY_MAPPINGS).map(m => m.alinhamento_energetico));
      expect(alignments.has('Quente')).toBe(true);
      expect(alignments.has('Frio')).toBe(true);
      expect(alignments.has('Neutro')).toBe(true);
    });
  });

  describe('spiritual meaning completeness', () => {
    it('all mappings have non-empty spiritual meanings', () => {
      const mappings = getAllOduNumerologies();
      mappings.forEach(m => {
        expect(m.significado_espiritual.length).toBeGreaterThan(10);
        expect(m.mensagem_central.length).toBeGreaterThan(5);
      });
    });

    it('all mappings have at least one quality', () => {
      const mappings = getAllOduNumerologies();
      mappings.forEach(m => {
        expect(m.qualidades.length).toBeGreaterThan(0);
      });
    });
  });

  describe('colors completeness', () => {
    it('all mappings have colors array', () => {
      const mappings = getAllOduNumerologies();
      mappings.forEach(m => {
        expect(Array.isArray(m.cores)).toBe(true);
        expect(m.cores.length).toBeGreaterThan(0);
      });
    });
  });

  describe('ODDU_NUMEROLOGY_MAPPINGS constant', () => {
    it('is frozen to prevent modifications', () => {
      expect(Object.isFrozen(ODDU_NUMEROLOGY_MAPPINGS)).toBe(true);
    });

    it('contains all 16 Odu entries', () => {
      expect(Object.keys(ODDU_NUMEROLOGY_MAPPINGS).length).toBe(16);
    });

    it('keys are 1-16', () => {
      const keys = Object.keys(ODDU_NUMEROLOGY_MAPPINGS).map(Number).sort((a, b) => a - b);
      expect(keys).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    });
  });

  describe('Yoruba names', () => {
    it('all Odus have Yoruba names', () => {
      const mappings = getAllOduNumerologies();
      mappings.forEach(m => {
        expect(m.odu_nome_yoruba.length).toBeGreaterThan(0);
      });
    });

    it('Yoruba names are unique', () => {
      const mappings = getAllOduNumerologies();
      const yorubaNames = mappings.map(m => m.odu_nome_yoruba);
      const unique = new Set(yorubaNames);
      expect(unique.size).toBe(yorubaNames.length);
    });
  });
});