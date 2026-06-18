/**
 * Unit Tests for @akasha/core-odus calculos module
 *
 * Tested functions:
 * - calcularOduNascimento(dataNascimento)
 * - getQuizilasPorOdu(oduNumero)
 * - getPreceitosPorOdu(oduNumero)
 * - getEbósPorOdu(oduNumero)
 */

import { describe, it, expect } from 'vitest';
import {
  calcularOduNascimento,
  getQuizilasPorOdu,
  getPreceitosPorOdu,
  getEbósPorOdu,
} from '@akasha/core-odus';

describe('calcularOduNascimento', () => {
  // Happy path — birth date 1991-12-04
  // 1+9+9+1+1+2+0+4 = 27 → 2+7 = 9 (Odu 9/Ossá)
  it('1991-12-04 yields principal Odu 9 (Ossá)', () => {
    const result = calcularOduNascimento('1991-12-04');
    expect(result.principal.numero).toBe(9);
    expect(result.principal.nome).toBe('Ossá');
    expect(result.secundario).not.toBeNull();
  });

  // Edge case — birth date 1986-03-15
  // 1+9+8+6+0+3+1+5 = 33 → 3+3 = 6 (Odu 6/Obará)
  it('1986-03-15 yields principal Odu 6 (Obará)', () => {
    const result = calcularOduNascimento('1986-03-15');
    expect(result.principal.numero).toBe(6);
    expect(result.principal.nome).toBe('Obará');
    expect(result.secundario).not.toBeNull();
  });
});

describe('getQuizilasPorOdu', () => {
  it('Odu 1 (Okaran) returns non-empty quizilas array', () => {
    const quizilas = getQuizilasPorOdu(1);
    expect(Array.isArray(quizilas)).toBe(true);
    expect(quizilas.length).toBeGreaterThan(0);
    expect(quizilas).toContain('Carne de porco');
  });

  // Edge case — invalid Odu number returns empty array
  it('invalid Odu number 99 returns empty array', () => {
    const quizilas = getQuizilasPorOdu(99);
    expect(Array.isArray(quizilas)).toBe(true);
    expect(quizilas).toHaveLength(0);
  });
});

describe('getPreceitosPorOdu', () => {
  it('Odu 6 (Obará) returns non-empty preceitos array', () => {
    const preceitos = getPreceitosPorOdu(6);
    expect(Array.isArray(preceitos)).toBe(true);
    expect(preceitos.length).toBeGreaterThan(0);
    expect(preceitos).toContain('Ser generoso');
  });

  // Edge case — invalid Odu number returns empty array
  it('invalid Odu number 0 returns empty array', () => {
    const preceitos = getPreceitosPorOdu(0);
    expect(Array.isArray(preceitos)).toBe(true);
    expect(preceitos).toHaveLength(0);
  });
});

describe('getEbósPorOdu', () => {
  it('Odu 16 (Alafia) returns non-empty ebós array', () => {
    const ebós = getEbósPorOdu(16);
    expect(Array.isArray(ebós)).toBe(true);
    expect(ebós.length).toBeGreaterThan(0);
    expect(ebós[0]).toContain('Ebó de Agradecimento');
  });

  // Edge case — invalid Odu number returns empty array
  it('invalid Odu number -1 returns empty array', () => {
    const ebós = getEbósPorOdu(-1);
    expect(Array.isArray(ebós)).toBe(true);
    expect(ebós).toHaveLength(0);
  });
});
