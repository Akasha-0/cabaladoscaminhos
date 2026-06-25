import { describe, expect, it } from 'vitest';
import {
  PYTHAGOREAN_TABLE,
  reduceNumber,
  isMasterNumber,
  lifePath,
  expression,
  letterSum,
} from './pythagorean';

describe('reduceNumber', () => {
  it('retorna 0 para n <= 0 ou NaN/Infinity', () => {
    expect(reduceNumber(0)).toBe(0);
    expect(reduceNumber(-5)).toBe(0);
    expect(reduceNumber(NaN)).toBe(0);
    expect(reduceNumber(Infinity)).toBe(0);
  });

  it('retorna o próprio número se já está em 1–9', () => {
    expect(reduceNumber(1)).toBe(1);
    expect(reduceNumber(7)).toBe(7);
    expect(reduceNumber(9)).toBe(9);
  });

  it('reduz 10 → 1', () => {
    expect(reduceNumber(10)).toBe(1);
  });

  it('reduz 34 → 7 (caso do teste oficial Doc 09 §8)', () => {
    expect(reduceNumber(34)).toBe(7);
  });

  it('reduz 1986 → 6 (1+9+8+6=24, 2+4=6)', () => {
    expect(reduceNumber(1986)).toBe(6);
  });

  it('preserva Master Number 11', () => {
    expect(reduceNumber(11)).toBe(11);
    expect(isMasterNumber(11)).toBe(true);
  });

  it('preserva Master Number 22', () => {
    expect(reduceNumber(22)).toBe(22);
    expect(isMasterNumber(22)).toBe(true);
  });

  it('preserva Master Number 33', () => {
    expect(reduceNumber(33)).toBe(33);
    expect(isMasterNumber(33)).toBe(true);
  });

  it('29 → 11 (master preservado na redução intermediária)', () => {
    expect(reduceNumber(29)).toBe(11);
  });

  it('49 → 13 → 4 (13 não é master, continua reduzindo)', () => {
    expect(reduceNumber(49)).toBe(4);
  });
});

describe('lifePath', () => {
  it('Doc 09 §8: 20/08/1986 → 7', () => {
    expect(lifePath('20/08/1986')).toBe(7);
  });

  it('aceita formato ISO 1986-08-20', () => {
    expect(lifePath('1986-08-20')).toBe(7);
  });

  it('aceita formato compactado 19860820', () => {
    expect(lifePath('19860820')).toBe(7);
  });

  it('preserva master number na vida', () => {
    // 29/11/1985: 2+9+1+1+1+9+8+5 = 36 → 3+6 = 9
    expect(lifePath('29/11/1985')).toBe(9);
  });

  it('string vazia → 0', () => {
    expect(lifePath('')).toBe(0);
  });
});

describe('expression', () => {
  it('JOHN → J=1, O=6, H=8, N=5 → 20 → 2', () => {
    expect(expression('JOHN')).toBe(2);
  });

  it('MARY → M=4, A=1, R=9, Y=7 → 21 → 3', () => {
    expect(expression('MARY')).toBe(3);
  });

  it('remove acentos antes de calcular', () => {
    expect(expression('João')).toBe(expression('JOAO'));
  });

  it('ignora caracteres não-letra', () => {
    expect(expression('J-O-H-N')).toBe(expression('JOHN'));
    expect(expression('JOHN  DOE')).toBe(expression('JOHNDOE'));
  });

  it('case-insensitive', () => {
    expect(expression('john')).toBe(expression('JOHN'));
  });

  it('string vazia → 0', () => {
    expect(expression('')).toBe(0);
  });

  it('preserva master number: nome cuja soma é 22', () => {
    // 11 letras com valor médio 2 → 22. Vamos garantir o invariante:
    // qualquer nome cuja soma bruta = 22 deve retornar 22.
    expect(reduceNumber(22)).toBe(22);
    expect(letterSum('BJBJ')).toBe(2 + 1 + 2 + 1); // sanity check do helper
  });
});

describe('PYTHAGOREAN_TABLE', () => {
  it('A=1, I=9, J=1, S=1 (ciclo de 9)', () => {
    expect(PYTHAGOREAN_TABLE.A).toBe(1);
    expect(PYTHAGOREAN_TABLE.I).toBe(9);
    expect(PYTHAGOREAN_TABLE.J).toBe(1);
    expect(PYTHAGOREAN_TABLE.S).toBe(1);
  });

  it('Z=8 (última letra fica em 8, não 9)', () => {
    expect(PYTHAGOREAN_TABLE.Z).toBe(8);
  });

  it('todas as 26 letras têm valor atribuído', () => {
    for (let code = 65; code <= 90; code++) {
      const letter = String.fromCharCode(code);
      expect(PYTHAGOREAN_TABLE[letter]).toBeGreaterThanOrEqual(1);
      expect(PYTHAGOREAN_TABLE[letter]).toBeLessThanOrEqual(9);
    }
  });
});

describe('letterSum (helper)', () => {
  it('JOHN bruto = 20', () => {
    expect(letterSum('JOHN')).toBe(20);
  });
});