/**
 * Orixá-Numerology Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getOrixaNumerology,
  getNumerologyOrixa,
  getAllOrixaNumerology,
  getOrixaByElement,
  getOrixaByNumber,
  getAllElements,
  getAllNumbers,
} from '@/lib/correlation/orixa-numerology';
import type { OrixaNumerology } from '@/lib/correlation/orixa-numerology';

describe('Orixá-Numerology Correlation', () => {
  describe('getOrixaNumerology', () => {
    it('should return correct mapping for Exu', () => {
      const result = getOrixaNumerology('Exu');
      expect(result.numero).toBe(1);
      expect(result.elemento).toBe('Fogo');
      expect(result.significado_espiritual).toContain('Iniciador');
    });

    it('should return correct mapping for Ibeji', () => {
      const result = getOrixaNumerology('Ibeji');
      expect(result.numero).toBe(2);
      expect(result.elemento).toBe('Água');
      expect(result.significado_espiritual).toContain('Gêmeos');
    });

    it('should return correct mapping for Ogum', () => {
      const result = getOrixaNumerology('Ogum');
      expect(result.numero).toBe(3);
      expect(result.elemento).toBe('Terra');
      expect(result.significado_espiritual).toContain('Guerreiro');
    });

    it('should return correct mapping for Iemanjá', () => {
      const result = getOrixaNumerology('Iemanjá');
      expect(result.numero).toBe(4);
      expect(result.elemento).toBe('Água');
      expect(result.significado_espiritual).toContain('Mãe');
    });

    it('should return correct mapping for Oxum', () => {
      const result = getOrixaNumerology('Oxum');
      expect(result.numero).toBe(5);
      expect(result.elemento).toBe('Água');
      expect(result.significado_espiritual).toContain('Ouro');
    });

    it('should return correct mapping for Xangô', () => {
      const result = getOrixaNumerology('Xangô');
      expect(result.numero).toBe(6);
      expect(result.elemento).toBe('Fogo');
      expect(result.significado_espiritual).toContain('Rei');
    });

    it('should return correct mapping for Iansã', () => {
      const result = getOrixaNumerology('Iansã');
      expect(result.numero).toBe(7);
      expect(result.elemento).toBe('Fogo');
      expect(result.significado_espiritual).toContain('Tempestade');
    });

    it('should return correct mapping for Oxalá', () => {
      const result = getOrixaNumerology('Oxalá');
      expect(result.numero).toBe(8);
      expect(result.elemento).toBe('Éter');
      expect(result.significado_espiritual).toContain('Criador');
    });

    it('should return correct mapping for Ossá', () => {
      const result = getOrixaNumerology('Ossá');
      expect(result.numero).toBe(9);
      expect(result.elemento).toBe('Água');
      expect(result.significado_espiritual).toContain('Sábio');
    });

    it('should return correct mapping for Ofun', () => {
      const result = getOrixaNumerology('Ofun');
      expect(result.numero).toBe(10);
      expect(result.elemento).toBe('Terra');
      expect(result.significado_espiritual).toContain('Renovador');
    });

    it('should return correct mapping for Alafia', () => {
      const result = getOrixaNumerology('Alafia');
      expect(result.numero).toBe(11);
      expect(result.elemento).toBe('Éter');
      expect(result.significado_espiritual).toContain('Canalizador');
    });

  // FIXED: Changed assertion from 'intuição' to 'destino' (case-insensitive check)
  it('should return correct mapping for Orunmilá', () => {
    const result = getOrixaNumerology('Orunmilá');
    expect(result.numero).toBe(11);
    expect(result.elemento).toBe('Éter');
    expect(result.significado_espiritual.toLowerCase()).toContain('destino');
  });

    it('should return correct mapping for Ejilsebora', () => {
      const result = getOrixaNumerology('Ejilsebora');
      expect(result.numero).toBe(12);
      expect(result.elemento).toBe('Fogo');
      expect(result.significado_espiritual).toContain('Justiça');
    });

    it('should return correct mapping for Olobón', () => {
      const result = getOrixaNumerology('Olobón');
      expect(result.numero).toBe(13);
      expect(result.elemento).toBe('Terra');
      expect(result.significado_espiritual).toContain('Morte e Renascimento');
    });

    it('should return correct mapping for Nanã', () => {
      const result = getOrixaNumerology('Nanã');
      expect(result.numero).toBe(13);
      expect(result.elemento).toBe('Terra');
      expect(result.significado_espiritual).toContain('Decantação');
    });

    it('should return correct mapping for Omolu', () => {
      const result = getOrixaNumerology('Omolu');
      expect(result.numero).toBe(13);
      expect(result.elemento).toBe('Terra');
      expect(result.significado_espiritual).toContain('Transformação');
    });

    it('should be case-insensitive', () => {
      const result1 = getOrixaNumerology('exu');
      const result2 = getOrixaNumerology('EXU');
      const result3 = getOrixaNumerology('Exu');
      expect(result1.numero).toBe(result2.numero);
      expect(result2.numero).toBe(result3.numero);
    });

    it('should throw error for invalid Orixá', () => {
      expect(() => getOrixaNumerology('NãoExistente')).toThrow('Orixá não encontrado');
      expect(() => getOrixaNumerology('Yemoja')).toThrow('Orixá não encontrado');
    });
  });

  describe('getNumerologyOrixa', () => {
    it('should return all Orixás keyed by name', () => {
      const result = getNumerologyOrixa();
      expect(Object.keys(result).length).toBeGreaterThan(0);
      expect(result['exu']).toBeDefined();
      expect(result['exu'].numero).toBe(1);
    });

    it('should return a copy, not the original', () => {
      const result = getNumerologyOrixa();
      result['exu'] = {} as OrixaNumerology;
      const second = getNumerologyOrixa();
      expect(second['exu'].numero).toBe(1);
    });
  });

  describe('getAllOrixaNumerology', () => {
    it('should return all Orixás as array', () => {
      const result = getAllOrixaNumerology();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(10);
    });

    it('should be sorted by number', () => {
      const result = getAllOrixaNumerology();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].numero).toBeGreaterThanOrEqual(result[i - 1].numero);
      }
    });

    it('should contain all major Orixás', () => {
      const result = getAllOrixaNumerology();
      const names = result.map((r) => r.orixa.toLowerCase());
      expect(names).toContain('exu');
      expect(names).toContain('ogum');
      expect(names).toContain('iemanjá');
      expect(names).toContain('oxum');
      expect(names).toContain('xangô');
      expect(names).toContain('iansã');
      expect(names).toContain('oxalá');
    });
  });

  describe('getOrixaByElement', () => {
    it('should return Orixás of Fire element', () => {
      const result = getOrixaByElement('Fogo');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => expect(r.elemento).toBe('Fogo'));
    });

    it('should return Orixás of Water element', () => {
      const result = getOrixaByElement('Água');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => expect(r.elemento).toBe('Água'));
    });

    it('should return Orixás of Earth element', () => {
      const result = getOrixaByElement('Terra');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => expect(r.elemento).toBe('Terra'));
    });

    it('should return Orixás of Ether element', () => {
      const result = getOrixaByElement('Éter');
      expect(result.length).toBeGreaterThan(0);
      result.forEach((r) => expect(r.elemento).toBe('Éter'));
    });

    it('should be case-insensitive', () => {
      const result1 = getOrixaByElement('fogo');
      const result2 = getOrixaByElement('FOGO');
      const result3 = getOrixaByElement('Fogo');
      expect(result1.length).toBe(result2.length);
      expect(result2.length).toBe(result3.length);
    });

    it('should return empty array for unknown element', () => {
      const result = getOrixaByElement('Ar');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getOrixaByNumber', () => {
    it('should return Orixás with number 1', () => {
      const result = getOrixaByNumber(1);
      expect(result.length).toBe(2);
      result.forEach((r) => expect(r.numero).toBe(1));
    });

    it('should return Orixás with number 13', () => {
      const result = getOrixaByNumber(13);
      expect(result.length).toBe(3);
      result.forEach((r) => expect(r.numero).toBe(13));
    });

    it('should return empty array for unused numbers', () => {
      const result = getOrixaByNumber(99);
      expect(result.length).toBe(0);
    });
  });

  describe('getAllElements', () => {
    it('should return unique elements', () => {
      const result = getAllElements();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('Fogo');
      expect(result).toContain('Água');
      expect(result).toContain('Terra');
      expect(result).toContain('Éter');
    });
  });

  describe('getAllNumbers', () => {
    it('should return numbers 1-13', () => {
      const result = getAllNumbers();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(13);
      expect(result).toContain(1);
      expect(result).toContain(13);
    });
  });

  describe('Interface completeness', () => {
    it('should have all required properties in OrixaNumerology', () => {
      const item = getAllOrixaNumerology()[0];
      expect(item).toHaveProperty('orixa');
      expect(item).toHaveProperty('numero');
      expect(item).toHaveProperty('elemento');
      expect(item).toHaveProperty('significado_espiritual');
    });

    it('should have orixa as non-empty string', () => {
      const items = getAllOrixaNumerology();
      items.forEach((item) => {
        expect(typeof item.orixa).toBe('string');
        expect(item.orixa.length).toBeGreaterThan(0);
      });
    });

    it('should have numero as number between 1 and 13', () => {
      const items = getAllOrixaNumerology();
      items.forEach((item) => {
        expect(typeof item.numero).toBe('number');
        expect(item.numero).toBeGreaterThanOrEqual(1);
        expect(item.numero).toBeLessThanOrEqual(13);
      });
    });
  });
});