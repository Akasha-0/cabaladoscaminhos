import { describe, it, expect } from 'vitest';
import {
  calcularTantrica,
  calcularPitagorica,
  calcularCaldeia,
  calcularCabalistica,
  calcularPitagoricaData,
  tabelaPitagorica,
  getInterpretacao,
} from '@/lib/numerologia/calculos';

describe('Numerologia Edge Cases', () => {
  describe('calcularTantrica', () => {
    it('returns a number for valid dates', () => {
      const dates = ['1990-01-01','1985-03-15','2000-06-30','2010-12-25'];
      for (const date of dates) {
        const result = calcularTantrica(date);
        expect(typeof result).toBe('number');
      }
    });
    it('handles leap year date 29 Feb', () => {
      expect(typeof calcularTantrica('2020-02-29')).toBe('number');
    });
    it('handles date with dashes', () => {
      expect(typeof calcularTantrica('1990-06-15')).toBe('number');
    });
    it('handles date with slashes', () => {
      expect(typeof calcularTantrica('1990/06/15')).toBe('number');
    });
    it('handles empty string', () => {
      expect(calcularTantrica('')).toBe(0);
    });
    it('produces deterministic results', () => {
      expect(calcularTantrica('1985-03-15')).toBe(calcularTantrica('1985-03-15'));
    });
    it('handles all-zeros date', () => {
      expect(calcularTantrica('0000-00-00')).toBe(0);
    });
  });

  describe('calcularPitagorica', () => {
    it('returns 0 for empty string', () => {
      expect(calcularPitagorica('')).toBe(0);
    });
    it('returns 0 for name with only spaces', () => {
      expect(calcularPitagorica('   ')).toBe(0);
    });
    it('returns 0 for name with only numbers', () => {
      expect(calcularPitagorica('12345')).toBe(0);
    });
    it('handles single letter name', () => {
      expect(calcularPitagorica('A')).toBe(tabelaPitagorica['A']);
    });
    it('handles Portuguese names', () => {
      const names = ['Jose Mario','Antonio Silva','Nubia Costa','Humberto','Celia','Rogerio','Beatriz','Fabio'];
      for (const name of names) {
        const result = calcularPitagorica(name);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(33);
      }
    });
    it('handles uppercase letters', () => {
      expect(calcularPitagorica('JOAO SILVA')).toBe(calcularPitagorica('joao silva'));
    });
    it('handles mixed case', () => {
      expect(typeof calcularPitagorica('Joao Da Silva')).toBe('number');
    });
    it('handles very long names', () => {
      expect(typeof calcularPitagorica('Joao'.repeat(100))).toBe('number');
    });
    it('handles names with hyphens', () => {
      expect(typeof calcularPitagorica('Maria-Jose')).toBe('number');
    });
    it('handles names with apostrophes', () => {
      expect(typeof calcularPitagorica("D'Angelo")).toBe('number');
    });
    it('produces consistent results', () => {
      expect(calcularPitagorica('Maria da Silva')).toBe(calcularPitagorica('Maria da Silva'));
    });
  });

  describe('calcularCaldeia', () => {
    it('returns 0 for empty string', () => {
      expect(calcularCaldeia('')).toBe(0);
    });
    it('returns 0 for name with only spaces', () => {
      expect(calcularCaldeia('   ')).toBe(0);
    });
    it('handles Portuguese names', () => {
      const result = calcularCaldeia('Jose Mario');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(33);
    });
    it('produces consistent results', () => {
      expect(calcularCaldeia('Maria da Silva')).toBe(calcularCaldeia('Maria da Silva'));
    });
  });

  describe('calcularCabalistica', () => {
    it('returns 0 for empty string', () => {
      expect(calcularCabalistica('')).toBe(0);
    });
    it('returns 0 for name with only spaces', () => {
      expect(calcularCabalistica('   ')).toBe(0);
    });
    it('handles Portuguese names', () => {
      const result = calcularCabalistica('Jose Mario');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(33);
    });
    it('produces consistent results', () => {
      expect(calcularCabalistica('Maria da Silva')).toBe(calcularCabalistica('Maria da Silva'));
    });
  });

  describe('calcularPitagoricaData', () => {
    it('returns 0 for empty string', () => {
      expect(calcularPitagoricaData('')).toBe(0);
    });
    it('handles leap year', () => {
      expect(typeof calcularPitagoricaData('2020-02-29')).toBe('number');
    });
    it('handles DD/MM/YYYY format', () => {
      expect(typeof calcularPitagoricaData('15/03/1985')).toBe('number');
    });
    it('produces consistent results', () => {
      expect(calcularPitagoricaData('1985-03-15')).toBe(calcularPitagoricaData('1985-03-15'));
    });
  });

  describe('tabelaPitagorica', () => {
    it('has values for all basic Latin letters', () => {
      for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
        expect(tabelaPitagorica[letter]).toBeGreaterThan(0);
      }
    });
    it('assigns cycle 1-9 repeating values', () => {
      expect(tabelaPitagorica['A']).toBe(1);
      expect(tabelaPitagorica['J']).toBe(1);
      expect(tabelaPitagorica['S']).toBe(1);
      expect(tabelaPitagorica['B']).toBe(2);
      expect(tabelaPitagorica['K']).toBe(2);
      expect(tabelaPitagorica['T']).toBe(2);
    });
  });

  describe('getInterpretacao', () => {
    it('returns valid interpretation for numbers 1-9', () => {
      for (let i = 1; i <= 9; i++) {
        const interp = getInterpretacao(i);
        expect(interp).toBeDefined();
        expect(interp.numero).toBe(i);
        expect(typeof interp.significado).toBe('string');
      }
    });
    it('returns interpretation for master number 11', () => {
      expect(getInterpretacao(11).numero).toBe(11);
    });
    it('returns interpretation for master number 22', () => {
      expect(getInterpretacao(22).numero).toBe(22);
    });
    it('returns interpretation for master number 33', () => {
      expect(getInterpretacao(33).numero).toBe(33);
    });
    it('interpretations have correct fields', () => {
      const interp = getInterpretacao(1);
      expect(interp).toHaveProperty('numero');
      expect(interp).toHaveProperty('nome');
      expect(interp).toHaveProperty('significado');
      expect(interp).toHaveProperty('forca');
      expect(interp).toHaveProperty('sefirotRelacionado');
    });
  });

  describe('Cross-system consistency', () => {
    it('calcularTantrica and calcularPitagoricaData produce same result for same date string', () => {
      expect(calcularTantrica('1990-06-15')).toBe(calcularPitagoricaData('1990-06-15'));
    });
    it('different date formats with same date produce same result', () => {
      expect(calcularTantrica('1990-06-15')).toBe(calcularTantrica('15/06/1990'));
    });
  });
});
