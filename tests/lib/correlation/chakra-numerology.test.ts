/**
 * Chakra-Numerology Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getChakraNumerology,
  getNumerologyChakra,
  getAllChakraNumerology,
} from '@/lib/correlation/chakra-numerology';
import type { ChakraNumerology } from '@/lib/correlation/chakra-numerology';

describe('Chakra-Numerology Correlation', () => {
  describe('getChakraNumerology', () => {
    it('should return correct mapping for Muladhara (Root Chakra)', () => {
      const result = getChakraNumerology('Muladhara');
      expect(result.chakra).toBe('Muladhara');
      expect(result.chakra_numero).toBe(1);
      expect(result.chakra_posicao).toBe('1º Chakra - Raiz');
      expect(result.numeros).toContain(1);
      expect(result.numeros).toContain(10);
      expect(result.elemento).toBe('Terra');
      expect(result.significado_espiritual).toContain('terra');
    });

    it('should return correct mapping for Svadhisthana (Sacral Chakra)', () => {
      const result = getChakraNumerology('Svadhisthana');
      expect(result.chakra).toBe('Svadhisthana');
      expect(result.chakra_numero).toBe(2);
      expect(result.chakra_posicao).toBe('2º Chakra - Sacral');
      expect(result.numeros).toContain(2);
      expect(result.elemento).toBe('Água');
      expect(result.significado_espiritual).toContain('criatividade');
    });

    it('should return correct mapping for Manipura (Solar Plexus Chakra)', () => {
      const result = getChakraNumerology('Manipura');
      expect(result.chakra).toBe('Manipura');
      expect(result.chakra_numero).toBe(3);
      expect(result.chakra_posicao).toBe('3º Chakra - Plexo Solar');
      expect(result.numeros).toContain(3);
      expect(result.numeros).toContain(4);
      expect(result.numeros).toContain(12);
      expect(result.elemento).toBe('Fogo');
      expect(result.significado_espiritual).toContain('poder');
    });

    it('should return correct mapping for Anahata (Heart Chakra)', () => {
      const result = getChakraNumerology('Anahata');
      expect(result.chakra).toBe('Anahata');
      expect(result.chakra_numero).toBe(4);
      expect(result.chakra_posicao).toBe('4º Chakra - Cardíaco');
      expect(result.numeros).toContain(5);
      expect(result.numeros).toContain(6);
      expect(result.elemento).toBe('Ar');
      expect(result.significado_espiritual).toContain('amor');
    });

    it('should return correct mapping for Vishuddha (Throat Chakra)', () => {
      const result = getChakraNumerology('Vishuddha');
      expect(result.chakra).toBe('Vishuddha');
      expect(result.chakra_numero).toBe(5);
      expect(result.chakra_posicao).toBe('5º Chakra - Laríngeo');
      expect(result.numeros).toContain(8);
      expect(result.elemento).toBe('Éter');
      expect(result.significado_espiritual).toContain('comunicação');
    });

    it('should return correct mapping for Ajna (Third Eye Chakra)', () => {
      const result = getChakraNumerology('Ajna');
      expect(result.chakra).toBe('Ajna');
      expect(result.chakra_numero).toBe(6);
      expect(result.chakra_posicao).toBe('6º Chakra - Frontal');
      expect(result.numeros).toContain(7);
      expect(result.numeros).toContain(11);
      expect(result.elemento).toBe('Éter');
      expect(result.significado_espiritual).toContain('intuição');
    });

    it('should return correct mapping for Sahasrara (Crown Chakra)', () => {
      const result = getChakraNumerology('Sahasrara');
      expect(result.chakra).toBe('Sahasrara');
      expect(result.chakra_numero).toBe(7);
      expect(result.chakra_posicao).toBe('7º Chakra - Coronário');
      expect(result.numeros).toContain(9);
      expect(result.numeros).toContain(13);
      expect(result.elemento).toBe('Éter');
      expect(result.significado_espiritual).toContain('iluminação');
    });

    it('should accept lowercase chakra names', () => {
      const result = getChakraNumerology('muladhara');
      expect(result.chakra).toBe('Muladhara');
    });

    it('should accept alternative chakra names', () => {
      const result = getChakraNumerology('raiz');
      expect(result.chakra).toBe('Muladhara');
    });

    it('should accept position-based chakra names', () => {
      const result = getChakraNumerology('1º Básico');
      expect(result.chakra).toBe('Muladhara');
    });

    it('should throw error for unknown chakra', () => {
      expect(() => getChakraNumerology('UnknownChakra')).toThrow('Chakra não reconhecido');
    });

    it('should throw error for empty string', () => {
      expect(() => getChakraNumerology('')).toThrow('Chakra não reconhecido');
    });
  });

  describe('getNumerologyChakra', () => {
    it('should return numbers for Muladhara', () => {
      const result = getNumerologyChakra('Muladhara');
      expect(result).toEqual([1, 10]);
    });

    it('should return numbers for Svadhisthana', () => {
      const result = getNumerologyChakra('Svadhisthana');
      expect(result).toEqual([2]);
    });

    it('should return numbers for Manipura', () => {
      const result = getNumerologyChakra('Manipura');
      expect(result).toEqual([3, 4, 12]);
    });

    it('should return numbers for Anahata', () => {
      const result = getNumerologyChakra('Anahata');
      expect(result).toEqual([5, 6]);
    });

    it('should return numbers for Vishuddha', () => {
      const result = getNumerologyChakra('Vishuddha');
      expect(result).toEqual([8]);
    });

    it('should return numbers for Ajna', () => {
      const result = getNumerologyChakra('Ajna');
      expect(result).toEqual([7, 11]);
    });

    it('should return numbers for Sahasrara', () => {
      const result = getNumerologyChakra('Sahasrara');
      expect(result).toEqual([9, 13]);
    });

    it('should throw error for unknown chakra', () => {
      expect(() => getNumerologyChakra('InvalidChakra')).toThrow('Chakra não reconhecido');
    });
  });

  describe('getAllChakraNumerology', () => {
    it('should return all 7 main chakras', () => {
      const result = getAllChakraNumerology();
      expect(result).toHaveLength(7);
    });

    it('should return chakras sorted by chakra_numero', () => {
      const result = getAllChakraNumerology();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].chakra_numero).toBeGreaterThan(result[i - 1].chakra_numero);
      }
    });

    it('should include all chakra names', () => {
      const result = getAllChakraNumerology();
      const chakraNames = result.map((r) => r.chakra);
      expect(chakraNames).toContain('Muladhara');
      expect(chakraNames).toContain('Svadhisthana');
      expect(chakraNames).toContain('Manipura');
      expect(chakraNames).toContain('Anahata');
      expect(chakraNames).toContain('Vishuddha');
      expect(chakraNames).toContain('Ajna');
      expect(chakraNames).toContain('Sahasrara');
    });

    it('should include all elements', () => {
      const result = getAllChakraNumerology();
      const elementos = result.map((r) => r.elemento);
      expect(elementos).toContain('Terra');
      expect(elementos).toContain('Água');
      expect(elementos).toContain('Fogo');
      expect(elementos).toContain('Ar');
      expect(elementos).toContain('Éter');
    });

    it('should include chakra_posicao for each chakra', () => {
      const result = getAllChakraNumerology();
      result.forEach((r) => {
        expect(r.chakra_posicao).toBeDefined();
        expect(r.chakra_posicao.length).toBeGreaterThan(0);
      });
    });

    it('should include significado_espiritual for each chakra', () => {
      const result = getAllChakraNumerology();
      result.forEach((r) => {
        expect(r.significado_espiritual).toBeDefined();
        expect(r.significado_espiritual.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Interface completeness', () => {
    it('should have all required fields in ChakraNumerology interface', () => {
      const result = getChakraNumerology('Muladhara');
      
      expect(result).toHaveProperty('chakra_numero');
      expect(result).toHaveProperty('chakra');
      expect(result).toHaveProperty('chakra_posicao');
      expect(result).toHaveProperty('numeros');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('significado_espiritual');
    });

    it('should have numeros as array of numbers', () => {
      const result = getChakraNumerology('Ajna');
      expect(Array.isArray(result.numeros)).toBe(true);
      result.numeros.forEach((n) => {
        expect(typeof n).toBe('number');
      });
    });

    it('should have chakra_numero as positive integer', () => {
      const result = getAllChakraNumerology();
      result.forEach((r) => {
        expect(Number.isInteger(r.chakra_numero)).toBe(true);
        expect(r.chakra_numero).toBeGreaterThan(0);
      });
    });
  });
});
