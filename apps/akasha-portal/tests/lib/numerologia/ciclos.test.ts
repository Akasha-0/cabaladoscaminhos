import { describe, it, expect } from 'vitest';
import { calcularAnoPessoal, calcularMesPessoal, calcularDiaPessoal, getCiclosTemporais } from '@/lib/numerologia/ciclos';

describe('numerologia/ciclos', () => {
  describe('calcularAnoPessoal', () => {
    it('returns valid year cycle', () => {
      const result = calcularAnoPessoal('15/03/1990');
      expect(result.numero).toBeGreaterThanOrEqual(1);
      expect(result.numero).toBeLessThanOrEqual(33);
    });

    it('returns object with descricao field', () => {
      const result = calcularAnoPessoal('15/03/1990');
      expect(result.descricao).toBeDefined();
    });
  });

  describe('calcularMesPessoal', () => {
    it('returns valid month cycle', () => {
      const result = calcularMesPessoal(5);
      expect(result.numero).toBeGreaterThanOrEqual(1);
      expect(result.numero).toBeLessThanOrEqual(33);
    });
  });

  describe('calcularDiaPessoal', () => {
    it('returns valid day cycle', () => {
      const result = calcularDiaPessoal('15/03/1990', 5);
      expect(result.numero).toBeGreaterThanOrEqual(1);
      expect(result.numero).toBeLessThanOrEqual(33);
    });
  });

  describe('getCiclosTemporais', () => {
    it('returns all three cycles', () => {
      const ciclos = getCiclosTemporais('15/03/1990');
      expect(ciclos.anoPessoal).toBeGreaterThanOrEqual(1);
      expect(ciclos.mesPessoal).toBeGreaterThanOrEqual(1);
      expect(ciclos.diaPessoal).toBeGreaterThanOrEqual(1);
    });

    it('each cycle is valid numerology number', () => {
      const ciclos = getCiclosTemporais('15/03/1990');
      expect(ciclos.anoPessoal).toBeLessThanOrEqual(33);
      expect(ciclos.mesPessoal).toBeLessThanOrEqual(33);
      expect(ciclos.diaPessoal).toBeLessThanOrEqual(33);
    });
  });
});
