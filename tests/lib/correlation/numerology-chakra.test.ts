/**
 * Numerology-Chakra Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getNumerologyChakra,
  getChakraNumerology,
  getAllNumerologyChakras,
} from '@/lib/correlation/numerology-chakra';
import type { NumerologyChakra } from '@/lib/correlation/numerology-chakra';

describe('Numerology-Chakra Correlation', () => {
  describe('getNumerologyChakra', () => {
    it('should return correct mapping for number 1 - Muladhara', () => {
      const result = getNumerologyChakra(1);
      expect(result.numero).toBe(1);
      expect(result.chakra).toBe('Muladhara');
      expect(result.chakra_posicao).toBe('1º - Raiz');
      expect(result.elemento).toBe('Terra');
      expect(result.significado_espiritual).toContain('individualidade');
    });

    it('should return correct mapping for number 2 - Svadhisthana', () => {
      const result = getNumerologyChakra(2);
      expect(result.numero).toBe(2);
      expect(result.chakra).toBe('Svadhisthana');
      expect(result.chakra_posicao).toBe('2º - Sacral');
      expect(result.significado_espiritual.toLowerCase()).toContain('parcerias');
    });

    it('should return correct mapping for number 3 - Manipura', () => {
      const result = getNumerologyChakra(3);
      expect(result.numero).toBe(3);
      expect(result.chakra).toBe('Manipura');
      expect(result.chakra_posicao).toBe('3º - Plexo Solar');
      expect(result.significado_espiritual.toLowerCase()).toContain('expressão criativa');
    });

    it('should return correct mapping for number 4 - Manipura', () => {
      const result = getNumerologyChakra(4);
      expect(result.numero).toBe(4);
      expect(result.chakra).toBe('Manipura');
      expect(result.chakra_posicao).toBe('3º - Plexo Solar');
      expect(result.significado_espiritual.toLowerCase()).toContain('estrutura');
    });

    it('should return correct mapping for number 5 - Anahata', () => {
      const result = getNumerologyChakra(5);
      expect(result.numero).toBe(5);
      expect(result.chakra).toBe('Anahata');
      expect(result.chakra_posicao).toBe('4º - Cardíaco');
      expect(result.significado_espiritual.toLowerCase()).toContain('liberdade');
    });

    it('should return correct mapping for number 6 - Anahata', () => {
      const result = getNumerologyChakra(6);
      expect(result.numero).toBe(6);
      expect(result.chakra).toBe('Anahata');
      expect(result.chakra_posicao).toBe('4º - Cardíaco');
      expect(result.significado_espiritual.toLowerCase()).toContain('amor');
    });

    it('should return correct mapping for number 7 - Ajna', () => {
      const result = getNumerologyChakra(7);
      expect(result.numero).toBe(7);
      expect(result.chakra).toBe('Ajna');
      expect(result.chakra_posicao).toBe('6º - Frontal');
      expect(result.significado_espiritual.toLowerCase()).toContain('reflexão');
    });

    it('should return correct mapping for number 8 - Vishuddha', () => {
      const result = getNumerologyChakra(8);
      expect(result.numero).toBe(8);
      expect(result.chakra).toBe('Vishuddha');
      expect(result.chakra_posicao).toBe('5º - Laríngeo');
      expect(result.elemento).toBe('Éter');
      expect(result.significado_espiritual).toContain('poder');
    });

    it('should return correct mapping for number 9 - Sahasrara', () => {
      const result = getNumerologyChakra(9);
      expect(result.numero).toBe(9);
      expect(result.chakra).toBe('Sahasrara');
      expect(result.chakra_posicao).toBe('7º - Coronário');
      expect(result.significado_espiritual.toLowerCase()).toContain('completude');
    });

    it('should return correct mapping for number 10 - Muladhara', () => {
      const result = getNumerologyChakra(10);
      expect(result.numero).toBe(10);
      expect(result.chakra).toBe('Muladhara');
      expect(result.chakra_posicao).toBe('1º - Raiz');
      expect(result.elemento).toBe('Terra');
      expect(result.significado_espiritual).toContain('transformação');
    });

    it('should return correct mapping for number 11 - Ajna', () => {
      const result = getNumerologyChakra(11);
      expect(result.numero).toBe(11);
      expect(result.chakra).toBe('Ajna');
      expect(result.chakra_posicao).toBe('6º - Frontal');
      expect(result.significado_espiritual.toLowerCase()).toContain('canalização');
    });

    it('should return correct mapping for number 12 - Manipura', () => {
      const result = getNumerologyChakra(12);
      expect(result.numero).toBe(12);
      expect(result.chakra).toBe('Manipura');
      expect(result.chakra_posicao).toBe('3º - Plexo Solar');
      expect(result.significado_espiritual.toLowerCase()).toContain('serviço');
    });

    it('should return correct mapping for number 13 - Sahasrara', () => {
      const result = getNumerologyChakra(13);
      expect(result.numero).toBe(13);
      expect(result.chakra).toBe('Sahasrara');
      expect(result.chakra_posicao).toBe('7º - Coronário');
      expect(result.significado_espiritual.toLowerCase()).toContain('transformação profunda');
    });

    it('should throw error for number 0', () => {
      expect(() => getNumerologyChakra(0)).toThrow('não reconhecido');
    });

    it('should throw error for negative numbers', () => {
      expect(() => getNumerologyChakra(-1)).toThrow('não reconhecido');
    });

    it('should throw error for numbers greater than 13', () => {
      expect(() => getNumerologyChakra(14)).toThrow('não reconhecido');
    });
  });

  describe('getChakraNumerology', () => {
    it('should return all numbers for Muladhara', () => {
      const result = getChakraNumerology('Muladhara');
      expect(result.length).toBe(2);
      expect(result.map(r => r.numero)).toContain(1);
      expect(result.map(r => r.numero)).toContain(10);
      expect(result.every(r => r.chakra === 'Muladhara')).toBe(true);
    });

    it('should return all numbers for Svadhisthana', () => {
      const result = getChakraNumerology('Svadhisthana');
      expect(result.length).toBe(1);
      expect(result[0].numero).toBe(2);
      expect(result[0].chakra).toBe('Svadhisthana');
    });

    it('should return all numbers for Manipura', () => {
      const result = getChakraNumerology('Manipura');
      expect(result.length).toBe(3);
      expect(result.map(r => r.numero)).toContain(3);
      expect(result.map(r => r.numero)).toContain(4);
      expect(result.map(r => r.numero)).toContain(12);
    });

    it('should return all numbers for Anahata', () => {
      const result = getChakraNumerology('Anahata');
      expect(result.length).toBe(2);
      expect(result.map(r => r.numero)).toContain(5);
      expect(result.map(r => r.numero)).toContain(6);
    });

    it('should return all numbers for Vishuddha', () => {
      const result = getChakraNumerology('Vishuddha');
      expect(result.length).toBe(1);
      expect(result[0].numero).toBe(8);
    });

    it('should return all numbers for Ajna', () => {
      const result = getChakraNumerology('Ajna');
      expect(result.length).toBe(2);
      expect(result.map(r => r.numero)).toContain(7);
      expect(result.map(r => r.numero)).toContain(11);
    });

    it('should return all numbers for Sahasrara', () => {
      const result = getChakraNumerology('Sahasrara');
      expect(result.length).toBe(2);
      expect(result.map(r => r.numero)).toContain(9);
      expect(result.map(r => r.numero)).toContain(13);
    });

    it('should accept lowercase chakra names', () => {
      const result = getChakraNumerology('muladhara');
      expect(result.length).toBe(2);
      expect(result.every(r => r.chakra === 'Muladhara')).toBe(true);
    });

    it('should accept Portuguese alternatives', () => {
      const result = getChakraNumerology('raiz');
      expect(result.length).toBe(2);
      expect(result.every(r => r.chakra === 'Muladhara')).toBe(true);
    });

    it('should accept position-based chakra names', () => {
      const result = getChakraNumerology('1º');
      expect(result.length).toBe(2);
      expect(result.every(r => r.chakra === 'Muladhara')).toBe(true);
    });

    it('should return empty array for unknown chakra', () => {
      const result = getChakraNumerology('UnknownChakra');
      expect(result).toEqual([]);
    });
  });

  describe('getAllNumerologyChakras', () => {
    it('should return all 13 numerology mappings', () => {
      const result = getAllNumerologyChakras();
      expect(result.length).toBe(13);
    });

    it('should return sorted by numero ascending', () => {
      const result = getAllNumerologyChakras();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].numero).toBeGreaterThan(result[i - 1].numero);
      }
    });

    it('should contain all seven chakras', () => {
      const result = getAllNumerologyChakras();
      const chakras = new Set(result.map(r => r.chakra));
      expect(chakras.size).toBe(7);
      expect(chakras.has('Muladhara')).toBe(true);
      expect(chakras.has('Svadhisthana')).toBe(true);
      expect(chakras.has('Manipura')).toBe(true);
      expect(chakras.has('Anahata')).toBe(true);
      expect(chakras.has('Vishuddha')).toBe(true);
      expect(chakras.has('Ajna')).toBe(true);
      expect(chakras.has('Sahasrara')).toBe(true);
    });

    it('should contain all five elements', () => {
      const result = getAllNumerologyChakras();
      const elementos = new Set(result.map(r => r.elemento));
      expect(elementos.has('Terra')).toBe(true);
      expect(elementos.has('Água')).toBe(true);
      expect(elementos.has('Fogo')).toBe(true);
      expect(elementos.has('Ar')).toBe(true);
      expect(elementos.has('Éter')).toBe(true);
    });
  });

  describe('Interface completeness', () => {
    it('should have all required fields in NumerologyChakra interface', () => {
      const result = getNumerologyChakra(1);
      expect(result).toHaveProperty('numero');
      expect(result).toHaveProperty('chakra');
      expect(result).toHaveProperty('chakra_posicao');
      expect(result).toHaveProperty('elemento');
      expect(result).toHaveProperty('significado_espiritual');
    });

    it('should return consistent chakra positions for each number', () => {
      const chakraPositions = [
        { num: 1, pos: '1º - Raiz' },
        { num: 2, pos: '2º - Sacral' },
        { num: 3, pos: '3º - Plexo Solar' },
        { num: 4, pos: '3º - Plexo Solar' },
        { num: 5, pos: '4º - Cardíaco' },
        { num: 6, pos: '4º - Cardíaco' },
        { num: 7, pos: '6º - Frontal' },
        { num: 8, pos: '5º - Laríngeo' },
        { num: 9, pos: '7º - Coronário' },
        { num: 10, pos: '1º - Raiz' },
        { num: 11, pos: '6º - Frontal' },
        { num: 12, pos: '3º - Plexo Solar' },
        { num: 13, pos: '7º - Coronário' },
      ];

      chakraPositions.forEach(({ num, pos }) => {
        const result = getNumerologyChakra(num);
        expect(result.chakra_posicao).toBe(pos);
      });
    });
  });

  describe('Element distribution', () => {
    it('should have correct element distribution', () => {
      const result = getAllNumerologyChakras();
      const byElement = result.reduce((acc, r) => {
        acc[r.elemento] = (acc[r.elemento] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Terra: 1, 10 (2 numbers)
      expect(byElement['Terra']).toBe(2);
      // Água: 2 (1 number)
      expect(byElement['Água']).toBe(1);
      // Fogo: 3, 4, 12 (3 numbers)
      expect(byElement['Fogo']).toBe(3);
      // Ar: 5, 6 (2 numbers)
      expect(byElement['Ar']).toBe(2);
      // Éter: 7, 8, 9, 11, 13 (5 numbers)
      expect(byElement['Éter']).toBe(5);
    });
  });
});