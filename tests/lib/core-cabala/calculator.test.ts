/**
 * Unit Tests for @akasha/core-cabala calculator module
 *
 * Tested functions (imported from source):
 * - calcularPitagorica(name)
 * - calcularCaldeia(name)
 * - calcularCabalistica(name)
 * - calcularTantrica(date)
 * - calcularPitagoricaData(date)
 * - calculateLifePath(date)  — vida path
 * - calculateExpression(name) — expressao path
 * - calculateMotivation(name) — motivacao path
 * - calculateImpression(name)— impressao path
 * - getInterpretacao(numero)
 *
 * Note: calculator.ts's `methods` object and `interpret` helper are private.
 * The calculator integration is tested via the calculos and numerology-kabalah
 * helpers that calculator.ts wraps.
 */

import { describe, it, expect } from 'vitest';
import {
  calcularPitagorica,
  calcularCaldeia,
  calcularCabalistica,
  calcularTantrica,
  calcularPitagoricaData,
  getInterpretacao,
  interpretacoesNumerologia,
} from '../../../packages/core-cabala/src/calculos';
import {
  calculateLifePath,
  calculateExpression,
  calculateMotivation,
  calculateImpression,
} from '../../../packages/core-cabala/src/numerology-kabalah';

// ─── Pitagórica ───────────────────────────────────────────────────────────────

describe('calcularPitagorica', () => {
  // tabelaPitagorica: A=1,B=2,...,I=9,J=1,K=2,...,S=1,T=2,...,Z=8
  it("'MARIA' → M(4)+A(1)+R(9)+I(9)+A(1)=24 → 2+4=6", () => {
    expect(calcularPitagorica('MARIA')).toBe(6);
  });

  it("'CARLOS' → C(3)+A(1)+R(9)+L(3)+O(6)+S(1)=23 → 2+3=5", () => {
    expect(calcularPitagorica('CARLOS')).toBe(5);
  });

  // Edge case — empty string
  it("'' → 0", () => {
    expect(calcularPitagorica('')).toBe(0);
  });
});

// ─── Caldeia ─────────────────────────────────────────────────────────────────

describe('calcularCaldeia', () => {
  // tabelaCaldeia: A=1,B=2,C=3,D=4,E=5,F=8,G=3,H=5,I=1,J=1,K=2,L=3,M=4,N=5,O=7,P=8,Q=1,R=2,S=3,T=4,U=6,V=6,W=6,X=5,Y=1,Z=7
  it("'MARIA' → M(4)+A(1)+R(2)+I(1)+A(1)=9", () => {
    expect(calcularCaldeia('MARIA')).toBe(9);
  });

  it("'TANTRA' → T(4)+A(1)+N(5)+T(4)+R(2)+A(1)=17 → 1+7=8", () => {
    expect(calcularCaldeia('TANTRA')).toBe(8);
  });

  // Edge case — empty string
  it("'' → 0", () => {
    expect(calcularCaldeia('')).toBe(0);
  });
});

// ─── Cabalística ─────────────────────────────────────────────────────────────

describe('calcularCabalistica', () => {
  // tabelaCabalistica: A=1,B=2,C=3,D=4,E=5,F=8,G=3,H=5,I=1,J=1,K=2,L=30,M=40,N=50,O=70,P=80,Q=100,R=200,S=300,T=400,U=6,V=700,W=900,X=60,Y=10,Z=700
  it("'MARIA' → M(40)+A(1)+R(200)+I(1)+A(1)=243 → 2+4+3=9", () => {
    expect(calcularCabalistica('MARIA')).toBe(9);
  });

  it("'PEDRO' → P(80)+E(5)+D(4)+R(200)+O(70)=359 → 3+5+9=17 → 1+7=8", () => {
    expect(calcularCabalistica('PEDRO')).toBe(8);
  });

  // Edge case — empty string
  it("'' → 0", () => {
    expect(calcularCabalistica('')).toBe(0);
  });

  // Edge case — high-value letters L(30), R(200), S(300)
  it("'LAR' → L(30)+A(1)+R(200)=231 → 2+3+1=6", () => {
    expect(calcularCabalistica('LAR')).toBe(6);
  });
});

// ─── Tantrica ─────────────────────────────────────────────────────────────────

describe('calcularTantrica', () => {
  // Extracts all digits from date, sums, then reduces preserving masters
  it("'20/08/1986' → 2+0+0+8+1+9+8+6=34 → 3+4=7", () => {
    expect(calcularTantrica('20/08/1986')).toBe(7);
  });

  it("'15/03/1990' → 1+5+0+3+1+9+9+0=28 → 2+8=10 → 1+0=1", () => {
    expect(calcularTantrica('15/03/1990')).toBe(1);
  });

  // Edge case — no digits → 0
  it("'a/b/c' → 0", () => {
    expect(calcularTantrica('a/b/c')).toBe(0);
  });
});

// ─── Pitagorica Data (destino) ───────────────────────────────────────────────

describe('calcularPitagoricaData', () => {
  // Same algorithm as calcularTantrica
  it("'20/08/1986' → 2+0+0+8+1+9+8+6=34 → 3+4=7", () => {
    expect(calcularPitagoricaData('20/08/1986')).toBe(7);
  });

  it("'01/01/2000' → 0+1+0+1+2+0+0+0=4", () => {
    expect(calcularPitagoricaData('01/01/2000')).toBe(4);
  });

  // Edge case — empty string
  it("'' → 0", () => {
    expect(calcularPitagoricaData('')).toBe(0);
  });
});

// ─── calculateLifePath (vida) ─────────────────────────────────────────────────

describe('calculateLifePath (vida path — date digit reduction)', () => {
  // Uses YYYY-MM-DD format, sums all digits, reduces with master preservation
  it("'1986-08-20' → 2+0+0+8+1+9+8+6=34 → 3+4=7", () => {
    const result = calculateLifePath('1986-08-20');
    expect(result.number).toBe(7);
    expect(result.master).toBe(false);
  });

  it("'2000-01-01' → 0+1+0+1+2+0+0+0=4", () => {
    const result = calculateLifePath('2000-01-01');
    expect(result.number).toBe(4);
    expect(result.master).toBe(false);
  });

  // Edge case — non-master (sum results in single digit, not 11/22/33)
  it("'2001-11-11' → 2+0+0+1+1+1+1+1=7, non-master", () => {
    const result = calculateLifePath('2001-11-11');
    expect(result.number).toBe(7);
    expect(result.master).toBe(false);
  });
});

// ─── calculateExpression (expressao) ─────────────────────────────────────────

describe('calculateExpression (expressao path — all letters)', () => {
  // Sum of all letter values, then reduce
  it("'MARIA' → M(4)+A(1)+R(9)+I(9)+A(1)=24 → 2+4=6", () => {
    const result = calculateExpression('MARIA');
    expect(result.number).toBe(6);
    expect(result.master).toBe(false);
  });

  it("'ABC' → 1+2+3=6", () => {
    const result = calculateExpression('ABC');
    expect(result.number).toBe(6);
    expect(result.master).toBe(false);
  });

  // Edge case — name yielding non-master single digit
  it("'AAAA' → 1+1+1+1=4 → 4 (not master)", () => {
    const result = calculateExpression('AAAA');
    expect(result.number).toBe(4);
    expect(result.master).toBe(false);
  });
});

// ─── calculateMotivation (motivacao — vowels only) ────────────────────────────

describe('calculateMotivation (motivacao path — vowels only)', () => {
  // Sum of vowel letter values only (A,E,I,O,U)
  it("'MARIA' → A(1)+I(9)+A(1) = 11 → 11 (master preserved)", () => {
    const result = calculateMotivation('MARIA');
    expect(result.number).toBe(11);
    expect(result.master).toBe(true);
  });

  it("'CARLOS' → A(1)+O(6) = 7", () => {
    const result = calculateMotivation('CARLOS');
    expect(result.number).toBe(7);
    expect(result.master).toBe(false);
  });

  // Edge case — no vowels in name
  it("'DRY' → no vowels → 0", () => {
    const result = calculateMotivation('DRY');
    expect(result.number).toBe(0);
    expect(result.master).toBe(false);
  });
});

// ─── calculateImpression (impressao — consonants only) ────────────────────────

describe('calculateImpression (impressao path — consonants only)', () => {
  // Sum of consonant letter values only
  it("'MARIA' → M(4)+R(9) = 13 → 1+3=4", () => {
    const result = calculateImpression('MARIA');
    expect(result.number).toBe(4);
    expect(result.master).toBe(false);
  });

  it("'DRY' → D(4)+R(9)+Y(7) = 20 → 2+0=2", () => {
    const result = calculateImpression('DRY');
    expect(result.number).toBe(2);
    expect(result.master).toBe(false);
  });

  // Edge case — name with only vowels (no consonants)
  it("'AEIOU' → no consonants → 0", () => {
    const result = calculateImpression('AEIOU');
    expect(result.number).toBe(0);
    expect(result.master).toBe(false);
  });
});

// ─── getInterpretacao ────────────────────────────────────────────────────────

describe('getInterpretacao', () => {
  it('1 → O Sol', () => {
    expect(getInterpretacao(1).nome).toBe('O Sol');
  });

  it('5 → Mercúrio', () => {
    expect(getInterpretacao(5).nome).toBe('Mercúrio');
  });

  it('11 → A Inspiração (master)', () => {
    expect(getInterpretacao(11).nome).toBe('A Inspiração');
  });

  it('22 → O Mestre Construtor (master)', () => {
    expect(getInterpretacao(22).nome).toBe('O Mestre Construtor');
  });

  it('33 → O Mestre Elevado (master)', () => {
    expect(getInterpretacao(33).nome).toBe('O Mestre Elevado');
  });

  // Edge case — unknown number falls back
  it('100 → Energia Desconhecida (fallback)', () => {
    expect(getInterpretacao(100).nome).toBe('Energia Desconhecida');
  });
});

// ─── interpretacoesNumerologia structure ──────────────────────────────────────

describe('interpretacoesNumerologia', () => {
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
