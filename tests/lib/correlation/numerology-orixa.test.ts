/**
 * Numerology-Orixá Correlation Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getNumerologyOrixa,
  getOrixaNumerology,
  getAllNumerologyOrixas,
  getNumerologyByElement,
  getNumerologyByOrixa,
  getNumerologyByDay,
} from '@/lib/correlation/numerology-orixa';
import type { NumerologyOrixa } from '@/lib/correlation/numerology-orixa';

describe('Numerology-Orixá Correlation', () => {
  describe('getNumerologyOrixa', () => {
    it('should return correct mapping for number 1 (Exu)', () => {
      const result = getNumerologyOrixa(1);
      expect(result.numero).toBe(1);
      expect(result.orixa).toBe('Exu / Okaran');
      expect(result.significado_espiritual).toContain('Iniciador');
      expect(result.pratica_ritualistica).toContain('vela');
      expect(result.elemento).toBe('Fogo');
      expect(result.dia_semana).toBe('Segunda-feira');
      expect(result.ofertas).toContain('dendê');
      expect(result.cores).toContain('preto');
    });

    it('should return correct mapping for number 2 (Ibeji)', () => {
      const result = getNumerologyOrixa(2);
      expect(result.numero).toBe(2);
      expect(result.orixa).toBe('Ibeji / Ejiokô');
      expect(result.significado_espiritual).toContain('dualidade');
      expect(result.elemento).toBe('Água');
      expect(result.dia_semana).toBe('Terça-feira');
      expect(result.ofertas).toContain('mel');
      expect(result.cores).toContain('azul');
    });

    it('should return correct mapping for number 3 (Ogum)', () => {
      const result = getNumerologyOrixa(3);
      expect(result.numero).toBe(3);
      expect(result.orixa).toBe('Ogum / Etaogundá');
      expect(result.significado_espiritual).toContain('Guerreiro');
      expect(result.elemento).toBe('Terra');
      expect(result.dia_semana).toBe('Terça-feira');
      expect(result.ofertas).toContain('dendê');
      expect(result.cores).toContain('vermelho');
    });

    it('should return correct mapping for number 4 (Iemanjá)', () => {
      const result = getNumerologyOrixa(4);
      expect(result.numero).toBe(4);
      expect(result.orixa).toBe('Iemanjá / Irosun');
      expect(result.significado_espiritual).toContain('Mãe');
      expect(result.elemento).toBe('Água');
      expect(result.dia_semana).toBe('Sábado');
      expect(result.ofertas).toContain('flores brancas');
      expect(result.cores).toContain('azul');
    });

    it('should return correct mapping for number 5 (Oxum)', () => {
      const result = getNumerologyOrixa(5);
      expect(result.numero).toBe(5);
      expect(result.orixa).toBe('Oxum / Oxé');
      expect(result.significado_espiritual).toContain('Amada');
      expect(result.elemento).toBe('Água');
      expect(result.dia_semana).toBe('Sexta-feira');
      expect(result.ofertas).toContain('mel');
      expect(result.cores).toContain('dourado');
    });

    it('should return correct mapping for number 6 (Xangô)', () => {
      const result = getNumerologyOrixa(6);
      expect(result.numero).toBe(6);
      expect(result.orixa).toBe('Xangô / Obará');
      expect(result.significado_espiritual).toContain('Rei');
      expect(result.elemento).toBe('Fogo');
      expect(result.dia_semana).toBe('Quarta-feira');
      expect(result.ofertas).toContain('inhame');
      expect(result.cores).toContain('vermelho');
    });

    it('should return correct mapping for number 7 (Iansã)', () => {
      const result = getNumerologyOrixa(7);
      expect(result.numero).toBe(7);
      expect(result.orixa).toBe('Iansã / Odi');
      expect(result.significado_espiritual).toContain('Tempestade');
      expect(result.elemento).toBe('Fogo');
      expect(result.dia_semana).toBe('Quarta-feira');
      expect(result.ofertas).toContain('pimenta');
      expect(result.cores).toContain('vermelho');
    });

    it('should return correct mapping for number 8 (Oxalá)', () => {
      const result = getNumerologyOrixa(8);
      expect(result.numero).toBe(8);
      expect(result.orixa).toBe('Oxalá / EjiOníle');
      expect(result.significado_espiritual).toContain('Criador');
      expect(result.elemento).toBe('Éter');
      expect(result.dia_semana).toBe('Sexta-feira');
      expect(result.ofertas).toContain('fumo branco');
      expect(result.cores).toContain('branco');
    });

    it('should return correct mapping for number 9 (Ossá)', () => {
      const result = getNumerologyOrixa(9);
      expect(result.numero).toBe(9);
      expect(result.orixa).toBe('Ossá');
      expect(result.significado_espiritual).toContain('Sábio');
      expect(result.elemento).toBe('Água');
      expect(result.dia_semana).toBe('Domingo');
      expect(result.ofertas).toContain('9 moedas');
      expect(result.cores).toContain('azul');
    });

    it('should return correct mapping for number 10 (Oxalá/Ofun)', () => {
      const result = getNumerologyOrixa(10);
      expect(result.numero).toBe(10);
      expect(result.orixa).toBe('Oxalá / Ofun');
      expect(result.significado_espiritual).toContain('Renovador');
      expect(result.elemento).toBe('Terra');
      expect(result.dia_semana).toBe('Domingo');
      expect(result.ofertas).toContain('fumo branco');
      expect(result.cores).toContain('branco');
    });

    it('should return correct mapping for number 11 (Alafia/Orunmilá)', () => {
      const result = getNumerologyOrixa(11);
      expect(result.numero).toBe(11);
      expect(result.orixa).toBe('Alafia / Orunmilá');
      expect(result.significado_espiritual).toContain('Canalizador');
      expect(result.elemento).toBe('Éter');
      expect(result.dia_semana).toBe('Domingo');
      expect(result.ofertas).toContain('kola');
      expect(result.cores).toContain('branco');
    });

    it('should return correct mapping for number 12 (Ejilsebora)', () => {
      const result = getNumerologyOrixa(12);
      expect(result.numero).toBe(12);
      expect(result.orixa).toBe('Xangô / Ejilsebora');
      expect(result.significado_espiritual).toContain('Justiça');
      expect(result.elemento).toBe('Fogo');
      expect(result.dia_semana).toBe('Quarta-feira');
      expect(result.ofertas).toContain('12 moedas');
      expect(result.cores).toContain('vermelho');
    });

    it('should return correct mapping for number 13 (Olobón)', () => {
      const result = getNumerologyOrixa(13);
      expect(result.numero).toBe(13);
      expect(result.orixa).toBe('Nanã / Omolu / Olobón');
      expect(result.significado_espiritual).toContain('Evolução');
      expect(result.elemento).toBe('Terra');
    it('should return1 mapping for Ossá', () => {
with
    it('should return 1 mapping for Ossá', () => {
      expect(result.cores).toContain('roxo');
    });

    it('should throw error for number 0', () => {
      expect(() => getNumerologyOrixa(0)).toThrow('Número fora do intervalo válido');
    });

    it('should throw error for negative numbers', () => {
      expect(() => getNumerologyOrixa(-1)).toThrow('Número fora do intervalo válido');
    });

    it('should throw error for number greater than 13', () => {
      expect(() => getNumerologyOrixa(14)).toThrow('Número fora do intervalo válido');
    });

    it('should throw error for very large numbers', () => {
      expect(() => getNumerologyOrixa(100)).toThrow('Número fora do intervalo válido');
    });
  });

  describe('getOrixaNumerology', () => {
    it('should return a record with all 13 numbers', () => {
      const result = getOrixaNumerology();
      expect(Object.keys(result).length).toBe(13);
    });

    it('should return record with number keys', () => {
      const result = getOrixaNumerology();
      expect(result[1]).toBeDefined();
      expect(result[2]).toBeDefined();
      expect(result[13]).toBeDefined();
    });

    it('should return NumerologyOrixa objects as values', () => {
      const result = getOrixaNumerology();
      expect(result[1].numero).toBe(1);
      expect(result[1].orixa).toBe('Exu / Okaran');
    });
  });

  describe('getAllNumerologyOrixas', () => {
    it('should return array with 13 items', () => {
      const result = getAllNumerologyOrixas();
      expect(result.length).toBe(13);
    });

    it('should return sorted by numero', () => {
      const result = getAllNumerologyOrixas();
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].numero).toBeLessThan(result[i + 1].numero);
      }
    });

    it('should contain all required fields', () => {
      const result = getAllNumerologyOrixas();
      const first = result[0];
      expect(first).toHaveProperty('numero');
      expect(first).toHaveProperty('orixa');
      expect(first).toHaveProperty('significado_espiritual');
      expect(first).toHaveProperty('pratica_ritualistica');
      expect(first).toHaveProperty('elemento');
      expect(first).toHaveProperty('dia_semana');
      expect(first).toHaveProperty('ofertas');
      expect(first).toHaveProperty('cores');
    });
  });

  describe('getNumerologyByElement', () => {
    it('should return 4 numbers for Fogo element', () => {
      const result = getNumerologyByElement('Fogo');
      expect(result.length).toBe(4);
      expect(result.every((r) => r.elemento === 'Fogo')).toBe(true);
    });

    it('should return 4 numbers for Água element', () => {
      const result = getNumerologyByElement('Água');
      expect(result.length).toBe(4);
      expect(result.every((r) => r.elemento === 'Água')).toBe(true);
    });

    it('should return 3 numbers for Terra element', () => {
      const result = getNumerologyByElement('Terra');
      expect(result.length).toBe(3);
      expect(result.every((r) => r.elemento === 'Terra')).toBe(true);
    });

    it('should return 2 numbers for Éter element', () => {
      const result = getNumerologyByElement('Éter');
      expect(result.length).toBe(2);
      expect(result.every((r) => r.elemento === 'Éter')).toBe(true);
    });

    it('should be case-insensitive', () => {
      const result = getNumerologyByElement('FOGO');
      expect(result.length).toBe(4);
    });
  });

  describe('getNumerologyByOrixa', () => {
    it('should return 2 mappings for Oxalá', () => {
      const result = getNumerologyByOrixa('Oxalá');
      expect(result.length).toBe(2);
    });

    it('should return 2 mappings for Xangô', () => {
      const result = getNumerologyByOrixa('Xangô');
      expect(result.length).toBe(2);
    });

    it('should return1 mapping for Ossá', () => {
      const result = getNumerologyByOrixa('Ossá');
      expect(result.length).toBe(1);
    });

    it('should be case-insensitive', () => {
      const result = getNumerologyByOrixa('EXU');
      expect(result.length).toBe(1);
    });
  });

  describe('getNumerologyByDay', () => {
    it('should return 3 mappings for Quarta-feira', () => {
      const result = getNumerologyByDay('Quarta-feira');
      expect(result.length).toBe(3);
    });

    it('should return 3 mappings for Domingo', () => {
      const result = getNumerologyByDay('Domingo');
      expect(result.length).toBe(3);
    });

    it('should return 2 mappings for Segunda-feira', () => {
      const result = getNumerologyByDay('Segunda-feira');
      expect(result.length).toBe(2);
    });

    it('should be case-insensitive', () => {
      const result = getNumerologyByDay('QUARTA-FEIRA');
      expect(result.length).toBe(3);
    });
  });

  describe('Interface completeness', () => {
    it('should have all required fields in NumerologyOrixa interface', () => {
      const item = getNumerologyOrixa(1) as NumerologyOrixa;
      expect(typeof item.numero).toBe('number');
      expect(typeof item.orixa).toBe('string');
      expect(typeof item.significado_espiritual).toBe('string');
      expect(typeof item.pratica_ritualistica).toBe('string');
      expect(typeof item.elemento).toBe('string');
      expect(typeof item.dia_semana).toBe('string');
      expect(Array.isArray(item.ofertas)).toBe(true);
      expect(Array.isArray(item.cores)).toBe(true);
    });

    it('should have offerings and colors as non-empty arrays', () => {
      const result = getAllNumerologyOrixas();
      result.forEach((item) => {
        expect(item.ofertas.length).toBeGreaterThan(0);
        expect(item.cores.length).toBeGreaterThan(0);
      });
    });
  });
});
