/**
 * Unit Tests for @akasha/core-cabala calculos module
 *
 * Tested functions:
 * - isMasterNumber(n)
 * - somarDigitos(numero)
 * - calcularPitagorica(nome)
 * - calcularCaldeia(nome)
 * - calcularCabalistica(nome)
 * - calcularTantrica(dataNascimento)
 * - calcularPitagoricaData(data)
 * - getInterpretacao(numero)
 */

import { describe, it, expect } from 'vitest';
import {
  isMasterNumber,
  somarDigitos,
  calcularPitagorica,
  calcularCaldeia,
  calcularCabalistica,
  calcularTantrica,
  calcularPitagoricaData,
  getInterpretacao,
  interpretacoesNumerologia,
} from '../../../packages/core-cabala/src/calculos';

describe('isMasterNumber', () => {
  it('returns true for 11', () => {
    expect(isMasterNumber(11)).toBe(true);
  });

  it('returns true for 22', () => {
    expect(isMasterNumber(22)).toBe(true);
  });

  it('returns true for 33', () => {
    expect(isMasterNumber(33)).toBe(true);
  });

  // Edge case — not a master number
  it('returns false for 9', () => {
    expect(isMasterNumber(9)).toBe(false);
  });

  it('returns false for 44 (double-digit non-master)', () => {
    expect(isMasterNumber(44)).toBe(false);
  });

  it('returns false for 0', () => {
    expect(isMasterNumber(0)).toBe(false);
  });
});

describe('somarDigitos', () => {
  // Happy path — single digit passes through unchanged
  it('single digit 7 returns 7', () => {
    expect(somarDigitos(7)).toBe(7);
  });

  // Happy path — master number 11 preserved
  it('master number 11 returns 11', () => {
    expect(somarDigitos(11)).toBe(11);
  });

  // Happy path — master number 22 preserved
  it('master number 22 returns 22', () => {
    expect(somarDigitos(22)).toBe(22);
  });

  // Happy path — master number 33 preserved
  it('master number 33 returns 33', () => {
    expect(somarDigitos(33)).toBe(33);
  });

  // Happy path — two-digit reduction
  it('44 reduces to 8 (4+4)', () => {
    expect(somarDigitos(44)).toBe(8);
  });

  it('27 reduces to 9 (2+7)', () => {
    expect(somarDigitos(27)).toBe(9);
  });

  it('10 reduces to 1 (1+0)', () => {
    expect(somarDigitos(10)).toBe(1);
  });

  // Edge case — multi-digit reduction
  it('99 reduces to 9 (9+9=18 → 1+8=9)', () => {
    expect(somarDigitos(99)).toBe(9);
  });

  it('100 reduces to 1 (1+0+0=1)', () => {
    expect(somarDigitos(100)).toBe(1);
  });
});

describe('calcularPitagorica', () => {
  // tabelaPitagorica: A=1,B=2,C=3,...,Z=8 (S=1,T=2,...)
  it("'MARIA' → 4+1+9+9+1=24 → 2+4=6", () => {
    expect(calcularPitagorica('MARIA')).toBe(6);
  });

  it("'CARLOS' → 3+1+9+3+6+1=23 → 2+3=5", () => {
    expect(calcularPitagorica('CARLOS')).toBe(5);
  });

  it("'ABC' → 1+2+3=6", () => {
    expect(calcularPitagorica('ABC')).toBe(6);
  });

  // Edge case — empty string
  it("'' returns 0 (no letters)", () => {
    expect(calcularPitagorica('')).toBe(0);
  });

  // Edge case — non-letter characters stripped
  it("'JOAO123' strips digits → J(1)+O(6)+A(1)+O(6)=14 → 1+4=5", () => {
    expect(calcularPitagorica('JOAO123')).toBe(5);
  });

  // Edge case — accented letters normalized
  it("'JOSE' (without accent) → 1+6+1+5=13 → 1+3=4", () => {
    expect(calcularPitagorica('JOSE')).toBe(4);
  });

  it("'ANDRÉ' → A+N+D+R+E = 1+5+4+9+5=24 → 2+4=6", () => {
    expect(calcularPitagorica('ANDRÉ')).toBe(6);
  });
});

describe('calcularCaldeia', () => {
  // tabelaCaldeia: A=1,B=2,C=3,D=4,E=5,F=8,G=3,H=5,I=1,J=1,K=2,L=3,M=4,N=5,O=7,P=8,Q=1,R=2,S=3,T=4,U=6,V=6,W=6,X=5,Y=1,Z=7
  it("'MARIA' → M(4)+A(1)+R(2)+I(1)+A(1)=9", () => {
    expect(calcularCaldeia('MARIA')).toBe(9);
  });

  it("'TANTRA' → 4+1+5+4+2+1=17 → 1+7=8", () => {
    expect(calcularCaldeia('TANTRA')).toBe(8);
  });

  it("'ABC' → 1+2+3=6", () => {
    expect(calcularCaldeia('ABC')).toBe(6);
  });

  // Edge case — empty string
  it("'' returns 0 (no letters)", () => {
    expect(calcularCaldeia('')).toBe(0);
  });

  // Edge case — accented letters normalized
  it("'JOSÉ' → J+O+S+É = 1+7+3+5=16 → 1+6=7", () => {
    expect(calcularCaldeia('JOSÉ')).toBe(7);
  });
});

describe('calcularCabalistica', () => {
  // tabelaCabalistica: A=1,B=2,C=3,D=4,E=5,F=8,G=3,H=5,I=1,J=1,K=2,L=30,M=40,N=50,O=70,P=80,Q=100,R=200,S=300,T=400,U=6,V=700,W=900,X=60,Y=10,Z=700
  it("'MARIA' → M(40)+A(1)+R(200)+I(1)+A(1)=243 → 2+4+3=9", () => {
    expect(calcularCabalistica('MARIA')).toBe(9);
  });

  it("'PEDRO' → P(80)+E(5)+D(4)+R(200)+O(70)=359 → 3+5+9=17 → 1+7=8", () => {
    expect(calcularCabalistica('PEDRO')).toBe(8);
  });

  it("'ABC' → 1+2+3=6", () => {
    expect(calcularCabalistica('ABC')).toBe(6);
  });

  // Edge case — empty string
  it("'' returns 0 (no letters)", () => {
    expect(calcularCabalistica('')).toBe(0);
  });

  // Edge case — L=30, R=200 are high-value letters
  it("'LAR' → L(30)+A(1)+R(200)=231 → 2+3+1=6", () => {
    expect(calcularCabalistica('LAR')).toBe(6);
  });
});

describe('calcularTantrica', () => {
  // Extracts all digits from date string, sums them, then reduces
  it("'20/08/1986' → 2+0+0+8+1+9+8+6=34 → 3+4=7", () => {
    expect(calcularTantrica('20/08/1986')).toBe(7);
  });

  it("'15/03/1990' → 1+5+0+3+1+9+9+0=28 → 2+8=10 → 1+0=1", () => {
    expect(calcularTantrica('15/03/1990')).toBe(1);
  });

  // Edge case — no digits returns 0
  it("'a/b/c' → no digits → 0", () => {
    expect(calcularTantrica('a/b/c')).toBe(0);
  });

  // Edge case — YYYY-MM-DD format
  it("'2000-01-01' → digits 2+0+0+0+0+1+0+1=4", () => {
    expect(calcularTantrica('2000-01-01')).toBe(4);
  });
});

describe('calcularPitagoricaData', () => {
  // Identical algorithm to calcularTantrica (extracts digits then reduces)
  it("'20/08/1986' → 2+0+0+8+1+9+8+6=34 → 3+4=7", () => {
    expect(calcularPitagoricaData('20/08/1986')).toBe(7);
  });

  it("'01/01/2000' → 0+1+0+1+2+0+0+0=4", () => {
    expect(calcularPitagoricaData('01/01/2000')).toBe(4);
  });

  // Edge case — empty string
  it("'' → no digits → 0", () => {
    expect(calcularPitagoricaData('')).toBe(0);
  });

  // Edge case — DD/MM/YYYY with zeros
  it("'00/00/0000' → 0", () => {
    expect(calcularPitagoricaData('00/00/0000')).toBe(0);
  });
});

describe('getInterpretacao', () => {
  // Happy path — all defined numbers return their interpretation
  it('1 returns Sol interpretation', () => {
    const result = getInterpretacao(1);
    expect(result.numero).toBe(1);
    expect(result.nome).toBe('O Sol');
  });

  it('5 returns Mercúrio interpretation', () => {
    const result = getInterpretacao(5);
    expect(result.numero).toBe(5);
    expect(result.nome).toBe('Mercúrio');
  });

  it('9 returns Marte interpretation', () => {
    const result = getInterpretacao(9);
    expect(result.numero).toBe(9);
    expect(result.nome).toBe('Marte');
  });

  it('11 returns master number interpretation', () => {
    const result = getInterpretacao(11);
    expect(result.numero).toBe(11);
    expect(result.nome).toBe('A Inspiração');
  });

  it('22 returns master number interpretation', () => {
    const result = getInterpretacao(22);
    expect(result.numero).toBe(22);
    expect(result.nome).toBe('O Mestre Construtor');
  });

  it('33 returns master number interpretation', () => {
    const result = getInterpretacao(33);
    expect(result.numero).toBe(33);
    expect(result.nome).toBe('O Mestre Elevado');
  });

  // Edge case — undefined number returns fallback
  it('0 returns fallback "Energia Desconhecida"', () => {
    const result = getInterpretacao(0);
    expect(result.nome).toBe('Energia Desconhecida');
  });

  it('100 returns fallback "Energia Desconhecida"', () => {
    const result = getInterpretacao(100);
    expect(result.nome).toBe('Energia Desconhecida');
  });
});

describe('interpretacoesNumerologia', () => {
  // Sanity check the data structure
  it('contains keys 1-9 and master numbers 11, 22, 33', () => {
    const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
    keys.forEach((k) => {
      expect(interpretacoesNumerologia).toHaveProperty(String(k));
      expect(interpretacoesNumerologia[k].numero).toBe(k);
    });
  });

  it('each entry has required fields', () => {
    const entry = interpretacoesNumerologia[1];
    expect(entry).toHaveProperty('numero');
    expect(entry).toHaveProperty('nome');
    expect(entry).toHaveProperty('significado');
    expect(entry).toHaveProperty('forca');
    expect(entry).toHaveProperty('desafio');
    expect(entry).toHaveProperty('sefirotRelacionado');
  });
});
