/**
 * Unit Tests for @akasha/core-odus draw module
 *
 * Tested functions:
 * - getOpe(id)
 * - getAllOdu()
 * - getOduNome(numero)
 * - drawOdu(options?)
 * - drawMultipleOdu(count)
 * - getOduByNumber(numero)
 */

import { describe, it, expect } from 'vitest';
import {
  getOpe,
  getAllOdu,
  getOduNome,
  drawOdu,
  drawMultipleOdu,
  getOduByNumber,
} from '@akasha/core-odus';

describe('getOpe', () => {
  it('getOpe(1) returns Ope named Ogbe', () => {
    const ope = getOpe(1);
    expect(ope.id).toBe(1);
    expect(ope.nome).toBe('Ogbe');
    expect(ope.linhas).toEqual([true, true, true]);
  });

  // Edge case — out-of-range id falls back to opes[0] (Ogbe)
  it('getOpe(999) returns fallback Ope (Ogbe)', () => {
    const ope = getOpe(999);
    expect(ope.id).toBe(1);
    expect(ope.nome).toBe('Ogbe');
  });
});

describe('getAllOdu', () => {
  it('returns exactly 16 Odu objects', () => {
    const odus = getAllOdu();
    expect(odus).toHaveLength(16);
  });

  it('each Odu has required fields: numero, nome, opeCima, opeBaixo, elementos, orixaRegente', () => {
    const odus = getAllOdu();
    odus.forEach((odu) => {
      expect(odu.numero).toBeGreaterThan(0);
      expect(odu.numero).toBeLessThanOrEqual(16);
      expect(typeof odu.nome).toBe('string');
      expect(odu.nome.length).toBeGreaterThan(0);
      expect(odu.opeCima).toBeDefined();
      expect(odu.opeBaixo).toBeDefined();
      expect(typeof odu.elementos).toBe('string');
      expect(typeof odu.orixaRegente).toBe('string');
    });
  });
});

describe('getOduNome', () => {
  it('getOduNome(1) returns Okaran', () => {
    expect(getOduNome(1)).toBe('Okaran');
  });

  it('getOduNome(16) returns Alafia', () => {
    expect(getOduNome(16)).toBe('Alafia');
  });

  // Edge case — out-of-range number returns 'Desconhecido'
  it('getOduNome(0) returns Desconhecido', () => {
    expect(getOduNome(0)).toBe('Desconhecido');
  });

  it('getOduNome(17) returns Desconhecido', () => {
    expect(getOduNome(17)).toBe('Desconhecido');
  });
});

describe('drawOdu', () => {
  it('drawOdu with birth-date method returns valid DrawResult', () => {
    // 1991-12-04 → 1+9+9+1+1+2+0+4 = 27 → 2+7 = 9 (Odu 9/Ossá)
    const result = drawOdu({ method: 'birth-date', dataNascimento: '1991-12-04' });
    expect(result.odu.numero).toBe(9);
    expect(result.odu.nome).toBe('Ossa');
    expect(result.opeCima).toBeDefined();
    expect(result.opeBaixo).toBeDefined();
    expect(result.linhasCima).toBeDefined();
    expect(result.linhasBaixo).toBeDefined();
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('drawOdu with random method returns DrawResult with odu in range 1-16', () => {
    const result = drawOdu({ method: 'random' });
    expect(result.odu.numero).toBeGreaterThanOrEqual(1);
    expect(result.odu.numero).toBeLessThanOrEqual(16);
    expect(result.odu.nome).toBeTruthy();
  });

  // Edge case — no options uses random method
  it('drawOdu with no options defaults to random draw', () => {
    const result = drawOdu();
    expect(result.odu.numero).toBeGreaterThanOrEqual(1);
    expect(result.odu.numero).toBeLessThanOrEqual(16);
  });
});

describe('drawMultipleOdu', () => {
  it('drawMultipleOdu(3) returns array of 3 DrawResults', () => {
    const results = drawMultipleOdu(3);
    expect(results).toHaveLength(3);
    results.forEach((r) => {
      expect(r.odu.numero).toBeGreaterThanOrEqual(1);
      expect(r.odu.numero).toBeLessThanOrEqual(16);
    });
  });

  // Edge case — count of 0 returns empty array
  it('drawMultipleOdu(0) returns empty array', () => {
    const results = drawMultipleOdu(0);
    expect(results).toHaveLength(0);
  });
});

describe('getOduByNumber', () => {
  it('getOduByNumber(8) returns Odu with nome EjiOnile', () => {
    const odu = getOduByNumber(8);
    expect(odu).not.toBeNull();
    expect(odu!.numero).toBe(8);
    expect(odu!.nome).toBe('EjiOnile');
  });

  // Edge case — out-of-range number returns null
  it('getOduByNumber(20) returns null', () => {
    expect(getOduByNumber(20)).toBeNull();
  });

  it('getOduByNumber(0) returns null', () => {
    expect(getOduByNumber(0)).toBeNull();
  });
});
