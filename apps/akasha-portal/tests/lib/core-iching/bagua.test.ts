/**
 * @akasha/core-iching — Testes do Bagua (8 trigramas)
 * v0.0.5 Fase 1 — T2.6 (≥ 30 testes no total, ≥ 8 aqui)
 */
import { describe, it, expect } from 'vitest';
import { TRIGRAMS, getTrigram, getTrigramByLines } from '@akasha/core-iching';

describe('Bagua — 8 trigramas (Fu Xi / King Wen)', () => {
  it('existem exatamente 8 trigramas com ids 1-8', () => {
    expect(Object.keys(TRIGRAMS).map(Number).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  // 1 teste por trigrama (8 testes): verifica id, chineseName, name, nameEn, glyph, nature, element, family
  it('trigrama 1 — Qián (Céu) — yang puro', () => {
    const t = TRIGRAMS[1];
    expect(t).toMatchObject({
      id: 1, chineseName: 'Qian', name: 'Céu', nameEn: 'Heaven', glyph: '☰',
      nature: 'yang', element: 'metal', family: 'pai',
    });
    expect(t.lines).toEqual([true, true, true]);
  });

  it('trigrama 2 — Kun (Terra) — yin puro', () => {
    const t = TRIGRAMS[2];
    expect(t).toMatchObject({
      id: 2, chineseName: 'Kun', name: 'Terra', nameEn: 'Earth', glyph: '☷',
      nature: 'yin', element: 'earth', family: 'mae',
    });
    expect(t.lines).toEqual([false, false, false]);
  });

  it('trigrama 3 — Kan (Água) — yin central', () => {
    const t = TRIGRAMS[3];
    expect(t).toMatchObject({
      id: 3, chineseName: 'Kan', name: 'Água', nameEn: 'Water', glyph: '☵',
      nature: 'yin', element: 'water', family: 'filho',
    });
    expect(t.lines).toEqual([false, true, false]);
  });

  it('trigrama 4 — Li (Fogo) — yang central', () => {
    const t = TRIGRAMS[4];
    expect(t).toMatchObject({
      id: 4, chineseName: 'Li', name: 'Fogo', nameEn: 'Fire', glyph: '☲',
      nature: 'yang', element: 'fire', family: 'filha',
    });
    expect(t.lines).toEqual([true, false, true]);
  });

  it('trigrama 5 — Zhen (Trovão) — yang ascendente', () => {
    const t = TRIGRAMS[5];
    expect(t).toMatchObject({
      id: 5, chineseName: 'Zhen', name: 'Trovão', nameEn: 'Thunder', glyph: '☳',
      nature: 'yang', element: 'wood', family: 'filho',
    });
    expect(t.lines).toEqual([false, false, true]);
  });

  it('trigrama 6 — Gen (Montanha) — yang descendente', () => {
    const t = TRIGRAMS[6];
    expect(t).toMatchObject({
      id: 6, chineseName: 'Gen', name: 'Montanha', nameEn: 'Mountain', glyph: '☶',
      nature: 'yang', element: 'earth', family: 'filho',
    });
    expect(t.lines).toEqual([true, false, false]);
  });

  it('trigrama 7 — Xun (Vento) — yin descendente', () => {
    const t = TRIGRAMS[7];
    expect(t).toMatchObject({
      id: 7, chineseName: 'Xun', name: 'Vento', nameEn: 'Wind', glyph: '☴',
      nature: 'yin', element: 'wood', family: 'filha',
    });
    expect(t.lines).toEqual([true, true, false]);
  });

  it('trigrama 8 — Dui (Lago) — yin ascendente', () => {
    const t = TRIGRAMS[8];
    expect(t).toMatchObject({
      id: 8, chineseName: 'Dui', name: 'Lago', nameEn: 'Lake', glyph: '☱',
      nature: 'yin', element: 'metal', family: 'filha',
    });
    expect(t.lines).toEqual([false, true, true]);
  });

  it('getTrigram(id) retorna o trigrama correto', () => {
    for (let id = 1 as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; id <= 8; id++) {
      expect(getTrigram(id).id).toBe(id);
    }
  });

  it('getTrigramByLines retorna o id correto para as 8 combinações (de baixo para cima)', () => {
    // linhas[0] = linha 1 (mais baixa), linhas[2] = linha 3 (mais alta)
    expect(getTrigramByLines(true, true, true)).toBe(1);   // ☰
    expect(getTrigramByLines(false, false, false)).toBe(2); // ☷
    expect(getTrigramByLines(false, true, false)).toBe(3);  // ☵
    expect(getTrigramByLines(true, false, true)).toBe(4);   // ☲
    expect(getTrigramByLines(false, false, true)).toBe(5);  // ☳
    expect(getTrigramByLines(true, false, false)).toBe(6);  // ☶
    expect(getTrigramByLines(true, true, false)).toBe(7);   // ☴
    expect(getTrigramByLines(false, true, true)).toBe(8);   // ☱
  });
});
