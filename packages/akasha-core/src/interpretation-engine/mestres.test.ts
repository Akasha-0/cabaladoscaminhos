/**
 * @akasha/core — Interpretation Engine: Master Numbers content tests
 *
 * Cobre o catálogo MESTRES_CONTENT exportado por mestres.ts:
 *   - Confere os 3 master numbers canônicos (11, 22, 33) com arquetipo + mandato
 *   - Garante que cada número tem 3 níveis (shadow/gift/siddhi) bem formados
 *   - Garante que a chave do Record bate com MASTER_NUMBERS (fonte da verdade)
 *   - Edge case: chaves fora do conjunto canônico (ex: 0, 1, 99) não existem
 */

import { describe, it, expect } from 'vitest';
import { MESTRES_CONTENT } from './mestres';
import { MASTER_NUMBERS } from '../interpretation-engine';
import type { NumeroLevel } from './types';

const MESTRES_NIVEIS: NumeroLevel[] = ['shadow', 'gift', 'siddhi'];

// ─── Testes: estrutura do catálogo ─────────────────────────────────────────

describe('MESTRES_CONTENT', () => {
  it('contém exatamente os 3 master numbers canônicos (11, 22, 33)', () => {
    const chaves = Object.keys(MESTRES_CONTENT)
      .map((k) => Number(k))
      .sort((a, b) => a - b);

    expect(chaves).toEqual([11, 22, 33]);
    expect(MESTRES_CONTENT[11]).toBeDefined();
    expect(MESTRES_CONTENT[22]).toBeDefined();
    expect(MESTRES_CONTENT[33]).toBeDefined();
  });

  it('cada número-mestre tem arquetipoAkasha e mandato não-vazios', () => {
    for (const numero of [11, 22, 33] as const) {
      const entry = MESTRES_CONTENT[numero];

      expect(typeof entry.arquetipoAkasha).toBe('string');
      expect(entry.arquetipoAkasha.length).toBeGreaterThan(0);
      expect(typeof entry.mandato).toBe('string');
      expect(entry.mandato.length).toBeGreaterThan(0);
    }
  });

  it('cada número-mestre tem os 3 níveis (shadow/gift/siddhi) com titulo + significado + padrao + afirmacao', () => {
    for (const numero of [11, 22, 33] as const) {
      const entry = MESTRES_CONTENT[numero];
      expect(entry.levels).toBeDefined();

      for (const nivel of MESTRES_NIVEIS) {
        const nivelContent = entry.levels[nivel];
        expect(nivelContent, `número ${numero} nível ${nivel} ausente`).toBeDefined();

        expect(typeof nivelContent.tituloPool).toBe('string');
        expect(nivelContent.tituloPool.length).toBeGreaterThan(0);

        expect(typeof nivelContent.significado).toBe('string');
        expect(nivelContent.significado.length).toBeGreaterThan(0);

        expect(typeof nivelContent.padrao).toBe('string');
        expect(nivelContent.padrao.length).toBeGreaterThan(0);

        expect(typeof nivelContent.afirmacao).toBe('string');
        expect(nivelContent.afirmacao.length).toBeGreaterThan(0);

        expect(typeof nivelContent.aplicacao).toBe('object');
        expect(nivelContent.aplicacao).not.toBeNull();
      }
    }
  });

  it('as chaves do Record são exatamente o conjunto MASTER_NUMBERS', () => {
    // Edge case: garante que MESTRES_CONTENT e MASTER_NUMBERS não divergem
    // (ex: alguém adiciona 44 ao Set mas esquece de materializar o conteúdo)
    const chaves = new Set(
      Object.keys(MESTRES_CONTENT).map((k) => Number(k))
    );

    expect(chaves.size).toBe(MASTER_NUMBERS.size);
    for (const m of MASTER_NUMBERS) {
      expect(chaves.has(m), `MASTER_NUMBERS tem ${m} mas MESTRES_CONTENT não`).toBe(
        true
      );
    }
  });

  it('edge case: números fora do catálogo de mestres (0, 1, 7, 13, 99) não estão presentes', () => {
    expect(MESTRES_CONTENT[0]).toBeUndefined();
    expect(MESTRES_CONTENT[1]).toBeUndefined();
    expect(MESTRES_CONTENT[7]).toBeUndefined();
    expect(MESTRES_CONTENT[13]).toBeUndefined();
    expect(MESTRES_CONTENT[99]).toBeUndefined();
  });
});
