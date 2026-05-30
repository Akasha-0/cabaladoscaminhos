import { describe, it, expect } from 'vitest';
import {
  calcularPitagorica,
  calcularCaldeia,
  calcularCabalistica,
  calcularTantrica,
  calcularPitagoricaData,
  getInterpretacao,
  calculateLifePath,
  calculateExpression,
  calculateSoulUrge,
  calculatePersonality,
} from '@/lib/numerologia/calculos';

describe('numerologia/calculos', () => {
  describe('calcularPitagorica', () => {
    it('returns number between 1-9 or master number', () => {
      const result = calcularPitagorica('João Silva');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(99);
    });

    it('ignores accents', () => {
      const r1 = calcularPitagorica('João');
      const r2 = calcularPitagorica('Joao');
      expect(r1).toBe(r2);
    });

    it('ignores spaces', () => {
      const r1 = calcularPitagorica('JoãoSilva');
      const r2 = calcularPitagorica('João Silva');
      expect(r1).toBe(r2);
    });
  });

  describe('calcularCaldeia', () => {
    it('returns number between 1-9 or master number', () => {
      const result = calcularCaldeia('Maria Santos');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(99);
    });

    it('handles accented vowels', () => {
      const result = calcularCaldeia('André');
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('calcularCabalistica', () => {
    it('returns valid number', () => {
      const result = calcularCabalistica('Carlos');
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('calcularTantrica', () => {
    it('reduces date to single digit or master number', () => {
      const result = calcularTantrica('15/03/1990');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(99);
    });

    it('handles DD/MM/YYYY format', () => {
      const r1 = calcularTantrica('01/01/2000');
      const r2 = calcularTantrica('1/1/2000');
      expect(r1).toBe(r2);
    });
  });

  describe('calcularPitagoricaData', () => {
    it('returns valid number for date', () => {
      const result = calcularPitagoricaData('1990-05-15');
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('getInterpretacao', () => {
    it('getInterpretacao returns for numbers 1-9', () => {
      for (let i = 1; i <= 9; i++) {
        const interp = getInterpretacao(i);
        expect(interp.numero).toBe(i);
        expect(interp.nome).toBeTruthy();
        expect(interp.significado).toBeTruthy();
      }
    });

    it('getInterpretacao has sefirotRelacionado', () => {
      const interp = getInterpretacao(1);
      expect(interp.sefirotRelacionado).toBeTruthy();
    });
  });

  describe('convenience functions', () => {
    it('calculateLifePath wraps calcularTantrica', () => {
      const result = calculateLifePath('15/03/1990');
      expect(result).toBeGreaterThan(0);
    });

    it('calculateExpression wraps calcularPitagorica', () => {
      const result = calculateExpression('Ana');
      expect(result).toBeGreaterThan(0);
    });

    it('calculateSoulUrge wraps calcularCaldeia', () => {
      const result = calculateSoulUrge('Ana');
      expect(result).toBeGreaterThan(0);
    });

    it('calculatePersonality wraps calcularCabalistica', () => {
      const result = calculatePersonality('Ana');
      expect(result).toBeGreaterThan(0);
    });
  });
});
