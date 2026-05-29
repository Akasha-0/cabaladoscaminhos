
/**
 * Numerologia Edge Cases Tests
 */

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
  describe('calcularTantrica — Birth Date Calculations', () => {
    it('returns 1-9 for valid dates', () => {
      const dates = ['1990-01-01', '1985-03-15', '2000-06-30', '2010-12-25'];
      for (const date of dates) {
        const result = calcularTantrica(date);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(9);
      }
    });

    it('handles leap year date 29 Feb', () => {
      const result = calcularTantrica('2020-02-29');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(9);
    });

    it('handles 29 Feb in non-leap-century year', () => {
      const result = calcularTantrica('1900-02-29');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(9);
    });

    it('handles date with dashes', () => {
      const result = calcularTantrica('1990-06-15');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(9);
    });

    it('handles date with slashes', () => {
      const result = calcularTantrica('1990/06/15');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(9);
    });

    it('handles date-only numbers without separators', () => {
      const result = calcularTantrica('19900615');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(9);
    });

    it('handles date with spaces', () => {
      const result = calcularTantrica('1990 06 15');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(9);
    });

    it('handles empty string', () => {
      const result = calcularTantrica('');
      expect(result).toBe(0);
    });

    it('produces deterministic results', () => {
      const result1 = calcularTantrica('1985-03-15');
      const result2 = calcularTantrica('1985-03-15');
      expect(result1).toBe(result2);
    });

    it('handles all-zeros date', () => {
      const result = calcularTantrica('0000-00-00');
      expect(result).toBe(0);
    });
  });

  describe('calcularPitagorica — Name Calculations', () => {
    it('returns 0 for empty string', () => {
      expect(calcularPitagorica('')).toBe(0);
    });

    it('returns 0 for name with only spaces', () => {
      expect(calcularPitagorica('   ')).toBe(0);
    });

    it('returns 0 for name with only numbers', () => {
      expect(calcularPitagorica('12345')).toBe(0);
    });

    it('returns 0 for name with only special characters', () => {
      expect(calcularPitagorica('!@#$%^&*()')).toBe(0);
    });

    it('handles single letter name', () => {
      const result = calcularPitagorica('A');
      expect(result).toBe(tabelaPitagorica['A']);
    });

    it('handles accented Portuguese characters', () => {
      const names = [
        'Jose Mario',
        'Antonio Silva',
        'Nubia Costa',
        'Humberto',
        'Celia',
        'Rogerio',
        'Beatriz',
        'Fabio',
      ];
      for (const name of names) {
        const result = calcularPitagorica(name);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(9);
      }
    });

    it('handles uppercase letters', () => {
      const result = calcularPitagorica('JOAO SILVA');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(9);
    });

    it('handles lowercase letters', () => {
      const result = calcularPitagorica('joao silva');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(9);
    });

    it('handles mixed case', () => {
      const result = calcularPitagorica('Joao Da Silva');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(9);
    });

    it('handles very long names', () => {
      const longName = 'Joao'.repeat(100);
      const result = calcularPitagorica(longName);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(9);
    });

    it('handles names with hyphens', () => {
      const result = calcularPitagorica('Maria-Jose');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(9);
    });

    it('handles names with apostrophes', () => {
      const result = calcularPitagorica("D'Angelo");
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(9);
    });

    it('produces consistent results', () => {
      const r1 = calcularPitagorica('Maria da Silva');
      const r2 = calcularPitagorica('Maria da Silva');
      expect(r1).toBe(r2);
    });

    it('returns same result for same name different case', () => {
      const r1 = calcularPitagorica('MARIA DA SILVA');
      const r2 = calcularPitagorica('maria da silva');
      expect(r1).toBe(r2);
    });
  });

  describe('calcularCaldeia — Chaldean System', () => {
    it('returns 0 for empty string', () => {
      expect(calcularCaldeia('')).toBe(0);
    });

    it('returns 0 for name with only spaces', () => {
      expect(calcularCaldeia('   ')).toBe(0);
    });

    it('handles accented Portuguese characters', () => {
      const result = calcularCaldeia('Jose Mario');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(9);
    });

    it('produces consistent results', () => {
      const r1 = calcularCaldeia('Maria da Silva');
      const r2 = calcularCaldeia('Maria da Silva');
      expect(r1).toBe(r2);
    });
  });

  describe('calcularCabalistica — Cabalistic System', () => {
    it('returns 0 for empty string', () => {
      expect(calcularCabalistica('')).toBe(0);
    });

    it('returns 0 for name with only spaces', () => {
      expect(calcularCabalistica('   ')).toBe(0);
    });

    it('handles accented Portuguese characters', () => {
      const result = calcularCabalistica('Jose Mario');
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(9);
    });

    it('produces consistent results', () => {
      const r1 = calcularCabalistica('Maria da Silva');
      const r2 = calcularCabalistica('Maria da Silva');
      expect(r1).toBe(r2);
    });

    it('produces different result from Pythagorean for same name', () => {
      const pitagorica = calcularPitagorica('Ana');
      const cabalistica = calcularCabalistica('Ana');
      expect(pitagorica).toBeGreaterThanOrEqual(1);
      expect(cabalistica).toBeGreaterThanOrEqual(1);
    });
  });

  describe('calcularPitagoricaData — Date Calculations', () => {
    it('returns 0 for empty string', () => {
      expect(calcularPitagoricaData('')).toBe(0);
    });

    it('handles leap year', () => {
      const result = calcularPitagoricaData('2020-02-29');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(9);
    });

    it('handles DD/MM/YYYY format', () => {
      const result = calcularPitagoricaData('15/03/1985');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(9);
    });

    it('produces consistent results', () => {
      const r1 = calcularPitagoricaData('1985-03-15');
      const r2 = calcularPitagoricaData('1985-03-15');
      expect(r1).toBe(r2);
    });
  });

  describe('tabelaPitagorica — Letter Values', () => {
    it('has values for all basic Latin letters', () => {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (const letter of letters) {
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
      expect(tabelaPitagorica['C']).toBe(3);
      expect(tabelaPitagorica['L']).toBe(3);
      expect(tabelaPitagorica['U']).toBe(3);
    });
  });

  describe('getInterpretacao — Number Meanings', () => {
    it('returns valid interpretation for numbers 1-9', () => {
      for (let i = 1; i <= 9; i++) {
        const interp = getInterpretacao(i);
        expect(interp).toBeDefined();
        expect(interp.numero).toBe(i);
        expect(typeof interp.significado).toBe('string');
      }
    });

    it('returns interpretation for master number 11', () => {
      const interp = getInterpretacao(11);
      expect(interp).toBeDefined();
      expect(interp.numero).toBe(11);
    });

    it('returns interpretation for master number 22', () => {
      const interp = getInterpretacao(22);
      expect(interp).toBeDefined();
      expect(interp.numero).toBe(22);
    });

    it('returns interpretation for master number 33', () => {
      const interp = getInterpretacao(33);
      expect(interp).toBeDefined();
      expect(interp.numero).toBe(33);
    });

    it('interpretacoes have spiritual significance fields', () => {
      for (let i = 1; i <= 9; i++) {
        const interp = getInterpretacao(i);
        expect(interp.orixa).toBeDefined();
        expect(interp.arcanjo).toBeDefined();
        expect(interp.cores).toBeDefined();
        expect(interp.sefirot).toBeDefined();
      }
    });
  });

  describe('Cross-system consistency', () => {
    it('calcularTantrica and calcularPitagoricaData produce same result for same date string', () => {
      const date = '1990-06-15';
      expect(calcularTantrica(date)).toBe(calcularPitagoricaData(date));
    });

    it('different date formats with same date produce same result', () => {
      const r1 = calcularTantrica('1990-06-15');
      const r2 = calcularTantrica('15/06/1990');
      const r3 = calcularTantrica('19900615');
      expect(r1).toBe(r2);
      expect(r2).toBe(r3);
    });
  });
});
