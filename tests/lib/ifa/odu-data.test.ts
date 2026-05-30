import { describe, it, expect } from 'vitest';
import { getOdus, getOduByNumero, getOduByNome, getAllQuizilas, getAllEbós, getAllOrixas } from '@/lib/ifa/odu-data';

describe('ifa/odu-data', () => {
  const odus = getOdus();

  it('has 16 Odus (Merindilogun)', () => {
    expect(odus.length).toBe(16);
  });

  it('each Odu has required fields', () => {
    for (const o of odus) {
      expect(o.numero).toBeGreaterThan(0);
      expect(o.nome).toBeTruthy();
      expect(o.significado).toBeTruthy();
      expect(o.elementos).toBeTruthy();
      expect(Array.isArray(o.orixas)).toBe(true);
      expect(o.orixas.length).toBeGreaterThan(0);
      expect(Array.isArray(o.quizilas)).toBe(true);
      expect(o.preceitos).toBeTruthy();
      expect(o.ebo).toBeTruthy();
    }
  });

  it('each Odu has quizilas', () => {
    for (const o of odus) {
      expect(o.quizilas.length).toBeGreaterThan(0);
    }
  });

  it('Odus numbered 1-16', () => {
    const nums = odus.map(o => o.numero).sort((a, b) => a - b);
    expect(nums).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  });

  it('getOduByNumero finds each Odu', () => {
    for (let i = 1; i <= 16; i++) {
      expect(getOduByNumero(i)).toBeDefined();
    }
  });

  it('getOduByNumero returns undefined for invalid number', () => {
    expect(getOduByNumero(99)).toBeUndefined();
  });

  it('getOduByNome finds by name', () => {
    const o = getOduByNome('Odi');
    expect(o?.numero).toBe(7);
  });

  it('getOduByNome is case-insensitive', () => {
    const o = getOduByNome('odi');
    expect(o?.numero).toBe(7);
  });

  it('getOduByNome returns undefined for unknown name', () => {
    expect(getOduByNome('Unknown')).toBeUndefined();
  });

  it('getAllQuizilas returns non-empty array', () => {
    const quizilas = getAllQuizilas();
    expect(quizilas.length).toBeGreaterThan(0);
  });

  it('getAllEbós returns non-empty array', () => {
    const ebos = getAllEbós();
    expect(ebos.length).toBe(16);
  });

  it('getAllOrixas returns non-empty array', () => {
    const orixas = getAllOrixas();
    expect(orixas.length).toBeGreaterThan(0);
  });

  it('Odus have quizilas that are prohibitions', () => {
    const allQuizilas = getAllQuizilas();
    expect(allQuizilas.length).toBeGreaterThan(16);
  });
});
