/**
 * @akasha/core-iching — Testes dos 64 hexagramas (King Wen)
 * v0.0.5 Fase 1 — T2.6
 */
import { describe, it, expect } from 'vitest';
import { HEXAGRAMS, getHexagram, getAllHexagrams } from '@akasha/core-iching';

describe('Hexagramas — King Wen 1-64', () => {
  it('existem exatamente 64 hexagramas (1-64)', () => {
    const ids = Object.keys(HEXAGRAMS).map(Number).sort((a, b) => a - b);
    expect(ids).toEqual(Array.from({ length: 64 }, (_, i) => i + 1));
  });

  it('getAllHexagrams() retorna 64 em ordem King Wen', () => {
    const all = getAllHexagrams();
    expect(all).toHaveLength(64);
    for (let i = 0; i < 64; i++) {
      expect(all[i].number).toBe(i + 1);
    }
  });

  it('hexagrama 1 — Qián (Céu sobre Céu) tem 6 linhas yang', () => {
    const h = getHexagram(1);
    expect(h).toMatchObject({
      number: 1, chineseName: 'Qian', name: 'O Criativo', nameEn: 'The Creative',
      character: '乾', upperTrigram: 1, lowerTrigram: 1,
    });
    expect(h.lines).toEqual([true, true, true, true, true, true]);
    expect(h.tradition).toContain('I-Ching');
    expect(h.judgment).toBeTruthy();
    expect(h.image).toBeTruthy();
    expect(h.aspects.length).toBeGreaterThan(0);
  });

  it('hexagrama 2 — Kun (Terra sobre Terra) tem 6 linhas yin', () => {
    const h = getHexagram(2);
    expect(h.number).toBe(2);
    expect(h.upperTrigram).toBe(2);
    expect(h.lowerTrigram).toBe(2);
    expect(h.lines).toEqual([false, false, false, false, false, false]);
  });

  it('hexagrama 3 — Zhun (Trovão sobre Água) tem trigrama 5/3', () => {
    const h = getHexagram(3);
    expect(h.upperTrigram).toBe(5);
    expect(h.lowerTrigram).toBe(3);
  });

  it('hexagrama 29 — Kan (Água sobre Água) tem trigrama 3/3', () => {
    const h = getHexagram(29);
    expect(h.upperTrigram).toBe(3);
    expect(h.lowerTrigram).toBe(3);
  });

  it('hexagrama 64 — Wei Ji (Fogo sobre Água) tem trigrama 4/3', () => {
    const h = getHexagram(64);
    expect(h.upperTrigram).toBe(4);
    expect(h.lowerTrigram).toBe(3);
  });

  it('getHexagram(0) lança RangeError', () => {
    expect(() => getHexagram(0)).toThrow(RangeError);
  });

  it('getHexagram(65) lança RangeError', () => {
    expect(() => getHexagram(65)).toThrow(RangeError);
  });

  it('getHexagram(-1) lança RangeError', () => {
    expect(() => getHexagram(-1)).toThrow(RangeError);
  });

  it('getHexagram(1.5) lança RangeError (não-inteiro)', () => {
    expect(() => getHexagram(1.5)).toThrow(RangeError);
  });
});
