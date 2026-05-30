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
    it('should return correct mapping for number 1 (Muladhara/Raiz)', () => {
      const result = getNumerologyChakra(1);
      expect(result.numero).toBe(1);
      expect(result.chakra).toBe('Muladhara');
      expect(result.chakra_posicao).toBe('1º Chakra - Raiz');
      expect(result.energia_significado).toContain('Força de vontade');
      expect(result.pratica_espiritual).toContain('Aterramento');
    });

    it('should return correct mapping for number 2 (Svadhisthana/Sacral)', () => {
      const result = getNumerologyChakra(2);
      expect(result.numero).toBe(2);
      expect(result.chakra).toBe('Svadhisthana');
      expect(result.chakra_posicao).toBe('2º Chakra - Sacral');
      expect(result.energia_significado).toContain('Receptividade');
      expect(result.pratica_espiritual).toContain('fluidez');
    });

    it('should return correct mapping for number 3 (Manipura/Plexo Solar)', () => {
      const result = getNumerologyChakra(3);
      expect(result.numero).toBe(3);
      expect(result.chakra).toBe('Manipura');
      expect(result.chakra_posicao).toBe('3º Chakra - Plexo Solar');
      expect(result.energia_significado).toContain('Criatividade');
      expect(result.pratica_espiritual).toContain('Quebra de medos');
    });

    it('should return correct mapping for number 4 (Manipura/Plexo Solar)', () => {
      const result = getNumerologyChakra(4);
      expect(result.numero).toBe(4);
      expect(result.chakra).toBe('Manipura');
      expect(result.chakra_posicao).toBe('3º Chakra - Plexo Solar');
      expect(result.energia_significado).toContain('Estabilidade');
      expect(result.pratica_espiritual).toContain('disciplina');
    });

    it('should return correct mapping for number 5 (Anahata/Cardíaco)', () => {
      const result = getNumerologyChakra(5);
      expect(result.numero).toBe(5);
      expect(result.chakra).toBe('Anahata');
      expect(result.chakra_posicao).toBe('4º Chakra - Cardíaco');
      expect(result.energia_significado).toContain('Liberdade');
      expect(result.pratica_espiritual).toContain('afeto');
    });

    it('should return correct mapping for number 6 (Anahata/Cardíaco)', () => {
      const result = getNumerologyChakra(6);
      expect(result.numero).toBe(6);
      expect(result.chakra).toBe('Anahata');
      expect(result.chakra_posicao).toBe('4º Chakra - Cardíaco');
      expect(result.energia_significado).toContain('Harmonia');
      expect(result.pratica_espiritual).toContain('Cura emocional');
    });

    it('should return correct mapping for number 7 (Ajna/Frontal)', () => {
      const result = getNumerologyChakra(7);
      expect(result.numero).toBe(7);
      expect(result.chakra).toBe('Ajna');
      expect(result.chakra_posicao).toBe('6º Chakra - Frontal');
      expect(result.energia_significado).toContain('Introspecção');
      expect(result.pratica_espiritual).toContain('intuição');
    });

    it('should return correct mapping for number 8 (Vishuddha/Laríngeo)', () => {
      const result = getNumerologyChakra(8);
      expect(result.numero).toBe(8);
      expect(result.chakra).toBe('Vishuddha');
      expect(result.chakra_posicao).toBe('5º Chakra - Laríngeo');
      expect(result.energia_significado).toContain('Resiliência');
      expect(result.pratica_espiritual).toContain('comunicação');
    });

    it('should return correct mapping for number 9 (Sahasrara/Coronário)', () => {
      const result = getNumerologyChakra(9);
      expect(result.numero).toBe(9);
      expect(result.chakra).toBe('Sahasrara');
      expect(result.chakra_posicao).toBe('7º Chakra - Coronário');
      expect(result.energia_significado).toContain('Humanitarismo');
      expect(result.pratica_espiritual).toContain('silêncio');
    });

    it('should return correct mapping for number 10 (Muladhara/Raiz)', () => {
      const result = getNumerologyChakra(10);
      expect(result.numero).toBe(10);
      expect(result.chakra).toBe('Muladhara');
      expect(result.chakra_posicao).toBe('1º Chakra - Raiz');
      expect(result.energia_significado).toContain('Renovação');
      expect(result.pratica_espiritual).toContain('transformação');
    });

    it('should return correct mapping for number 11 (Ajna/Frontal - Master Number)', () => {
      const result = getNumerologyChakra(11);
      expect(result.numero).toBe(11);
      expect(result.chakra).toBe('Ajna');
      expect(result.chakra_posicao).toBe('6º Chakra - Frontal');
      expect(result.energia_significado).toContain('Intuição espiritual');
      expect(result.pratica_espiritual).toContain('percepção sutil');
    });

    it('should return correct mapping for number 12 (Manipura/Plexo Solar)', () => {
      const result = getNumerologyChakra(12);
      expect(result.numero).toBe(12);
      expect(result.chakra).toBe('Manipura');
      expect(result.chakra_posicao).toBe('3º Chakra - Plexo Solar');
      expect(result.energia_significado).toContain('Justiça divina');
      expect(result.pratica_espiritual).toContain('Purificação');
    });

    it('should return correct mapping for number 13 (Sahasrara/Coronário)', () => {
      const result = getNumerologyChakra(13);
      expect(result.numero).toBe(13);
      expect(result.chakra).toBe('Sahasrara');
      expect(result.chakra_posicao).toBe('7º Chakra - Coronário');
      expect(result.energia_significado).toContain('Transformação profunda');
      expect(result.pratica_espiritual).toContain('Morte e renascimento');
    });
    it('should throw error for number 0', () => {
      expect(() => getNumerologyChakra(0)).toThrow('Número fora do intervalo válido');
    });

    it('should throw error for negative numbers', () => {
      expect(() => getNumerologyChakra(-1)).toThrow('Número fora do intervalo válido');
    });

    it('should throw error for number greater than 13', () => {
      expect(() => getNumerologyChakra(14)).toThrow('Número fora do intervalo válido');
    });

    it('should throw error for very large numbers', () => {
      expect(() => getNumerologyChakra(100)).toThrow('Número fora do intervalo válido');
    });
  });

  describe('getChakraNumerology', () => {
    it('should return numbers 1 and 10 for Muladhara', () => {
      const result = getChakraNumerology('Muladhara');
      expect(result).toHaveLength(2);
      expect(result.map((nc) => nc.numero)).toContain(1);
      expect(result.map((nc) => nc.numero)).toContain(10);
    });

    it('should return numbers 3, 4, and 12 for Manipura', () => {
      const result = getChakraNumerology('Manipura');
      expect(result).toHaveLength(3);
      expect(result.map((nc) => nc.numero)).toContain(3);
      expect(result.map((nc) => nc.numero)).toContain(4);
      expect(result.map((nc) => nc.numero)).toContain(12);
    });

    it('should return numbers 5 and 6 for Anahata', () => {
      const result = getChakraNumerology('Anahata');
      expect(result).toHaveLength(2);
      expect(result.map((nc) => nc.numero)).toContain(5);
      expect(result.map((nc) => nc.numero)).toContain(6);
    });

    it('should return numbers 7 and 11 for Ajna', () => {
      const result = getChakraNumerology('Ajna');
      expect(result).toHaveLength(2);
      expect(result.map((nc) => nc.numero)).toContain(7);
      expect(result.map((nc) => nc.numero)).toContain(11);
    });

    it('should return numbers 9 and 13 for Sahasrara', () => {
      const result = getChakraNumerology('Sahasrara');
      expect(result).toHaveLength(2);
      expect(result.map((nc) => nc.numero)).toContain(9);
      expect(result.map((nc) => nc.numero)).toContain(13);
    });

    it('should return number 2 for Svadhisthana', () => {
      const result = getChakraNumerology('Svadhisthana');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(2);
    });

    it('should return number 8 for Vishuddha', () => {
      const result = getChakraNumerology('Vishuddha');
      expect(result).toHaveLength(1);
      expect(result[0].numero).toBe(8);
    });

    it('should normalize chakra name variations', () => {
      const byPosicao = getChakraNumerology('4º Cardíaco');
      const byName = getChakraNumerology('Anahata');
      expect(byPosicao).toHaveLength(byName.length);
    });

    it('should be case-insensitive', () => {
      const upper = getChakraNumerology('MULADHARA');
      const lower = getChakraNumerology('muladhara');
      expect(upper).toHaveLength(lower.length);
    });
  });

  describe('getAllNumerologyChakras', () => {
    it('should return all 13 numbers', () => {
      const result = getAllNumerologyChakras();
      expect(result).toHaveLength(13);
    });

    it('should return numbers sorted from 1 to 13', () => {
      const result = getAllNumerologyChakras();
      for (let i = 0; i < result.length; i++) {
        expect(result[i].numero).toBe(i + 1);
      }
    });

    it('should contain all 7 chakras across the mappings', () => {
      const result = getAllNumerologyChakras();
      const chakras = new Set(result.map((nc) => nc.chakra));
      expect(chakras).toContain('Muladhara');
      expect(chakras).toContain('Svadhisthana');
      expect(chakras).toContain('Manipura');
      expect(chakras).toContain('Anahata');
      expect(chakras).toContain('Vishuddha');
      expect(chakras).toContain('Ajna');
      expect(chakras).toContain('Sahasrara');
    });

    it('should have all entries with valid energia_significado', () => {
      const result = getAllNumerologyChakras();
      result.forEach((nc) => {
        expect(nc.energia_significado).toBeDefined();
        expect(nc.energia_significado.length).toBeGreaterThan(0);
      });
    });

    it('should have all entries with valid pratica_espiritual', () => {
      const result = getAllNumerologyChakras();
      result.forEach((nc) => {
        expect(nc.pratica_espiritual).toBeDefined();
        expect(nc.pratica_espiritual.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Interface completeness', () => {
    it('should have all required properties in NumerologyChakra interface', () => {
      const result = getNumerologyChakra(1);
      expect(result).toHaveProperty('numero');
      expect(result).toHaveProperty('chakra');
      expect(result).toHaveProperty('chakra_posicao');
      expect(result).toHaveProperty('energia_significado');
      expect(result).toHaveProperty('pratica_espiritual');
    });

    it('should return NumerologyChakra type for all numbers', () => {
      for (let i = 1; i <= 13; i++) {
        const result = getNumerologyChakra(i);
        expect(result.numero).toBe(i);
        expect(typeof result.chakra).toBe('string');
        expect(typeof result.energia_significado).toBe('string');
        expect(typeof result.pratica_espiritual).toBe('string');
      }
    });
  });
});
