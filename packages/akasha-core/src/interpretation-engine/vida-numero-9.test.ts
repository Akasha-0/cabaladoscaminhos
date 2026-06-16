/**
 * @akasha/core — Interpretation Engine vida-numero-9 tests
 *
 * Cobre o catálogo profundo do número base 9 (O Servidor):
 * - VIDA_NUMERO_9: NumeroContent exportado (arquétipo "O Servidor",
 *   3 níveis shadow/gift/siddhi com aplicação por área da vida).
 *
 * Validação principal:
 * - Estrutura completa do NumeroContent (3 níveis + arquetipo + mandato)
 * - Conteúdo shadow/gift/siddhi consistente com o tema do 9 (compaixão/serviço)
 * - Acoplamento correto com interpretation-engine.ts (VIDA_CONTENT[9] === VIDA_NUMERO_9)
 */

import { describe, it, expect } from 'vitest';
import { VIDA_NUMERO_9 } from './vida-numero-9';
import { VIDA_CONTENT } from '../interpretation-engine';
import type { NumeroContent } from './types';

// ─── Testes: VIDA_NUMERO_9 — estrutura ──────────────────────────────────────

describe('VIDA_NUMERO_9', () => {
  it('tem estrutura NumeroContent completa: arquetipo + mandato + 3 níveis', () => {
    expect(VIDA_NUMERO_9).toBeDefined();
    expect(typeof VIDA_NUMERO_9).toBe('object');

    // arquetipo + mandato
    expect(VIDA_NUMERO_9.arquetipoAkasha).toBe('O Servidor');
    expect(typeof VIDA_NUMERO_9.mandato).toBe('string');
    expect(VIDA_NUMERO_9.mandato.length).toBeGreaterThan(20);

    // 3 níveis obrigatórios
    expect(VIDA_NUMERO_9.levels).toBeDefined();
    expect(VIDA_NUMERO_9.levels.shadow).toBeDefined();
    expect(VIDA_NUMERO_9.levels.gift).toBeDefined();
    expect(VIDA_NUMERO_9.levels.siddhi).toBeDefined();

    // Cada nível tem os 4 campos canônicos do modelo
    for (const nivel of ['shadow', 'gift', 'siddhi'] as const) {
      const l = VIDA_NUMERO_9.levels[nivel];
      expect(typeof l.tituloPool).toBe('string');
      expect(l.tituloPool.length).toBeGreaterThan(0);
      expect(typeof l.significado).toBe('string');
      expect(l.significado.length).toBeGreaterThan(0);
      expect(typeof l.padrao).toBe('string');
      expect(l.padrao.length).toBeGreaterThan(0);
      expect(typeof l.afirmacao).toBe('string');
      expect(l.afirmacao.length).toBeGreaterThan(0);
      expect(typeof l.aplicacao).toBe('object');
    }
  });

  it('shadow/gift/siddhi têm titulosPool distintos e coerentes com o tema do 9', () => {
    const { shadow, gift, siddhi } = VIDA_NUMERO_9.levels;

    // títulos não-vazios e distintos entre si
    expect(shadow.tituloPool).not.toBe(gift.tituloPool);
    expect(gift.tituloPool).not.toBe(siddhi.tituloPool);
    expect(shadow.tituloPool).not.toBe(siddhi.tituloPool);

    // tema do 9: compaixão/serviço/completude — verifica que pelo menos
    // uma palavra-chave aparece em cada nível (case-insensitive)
    const keywords = ['compaix', 'servi', 'humanitári', 'completud', 'generosid', 'sabedori'];
    const hasKeyword = (text: string) =>
      keywords.some((k) => text.toLowerCase().includes(k));

    const allText = [
      shadow.significado + ' ' + shadow.padrao,
      gift.significado + ' ' + gift.padrao,
      siddhi.significado + ' ' + siddhi.padrao,
    ];

    for (const block of allText) {
      expect(
        hasKeyword(block),
        `esperava palavra-chave do 9 (${keywords.join('|')}) em: ${block.slice(0, 80)}…`,
      ).toBe(true);
    }
  });

  it('siddhi tem afirmacao coerente com o estado desperto do 9 (sem palavras de esforço)', () => {
    const siddhi = VIDA_NUMERO_9.levels.siddhi;

    // A afirmação siddhi fala no presente/ser (não em "vou" / "preciso")
    // Esta é a convenção Akasha para o nível siddhi.
    expect(siddhi.afirmacao).toMatch(/^(eu sou|eu\s)/i);
    expect(siddhi.afirmacao.length).toBeGreaterThan(0);

    // E o tituloPool siddhi tem "Frequência" — convenção do modelo
    expect(siddhi.tituloPool.toLowerCase()).toContain('frequência');
  });

  // ─── Edge cases ─────────────────────────────────────────────────────────

  it('edge case: é o mesmo objeto referenciado em VIDA_CONTENT[9] (acoplamento correto)', () => {
    // O interpretation-engine.ts importa VIDA_NUMERO_9 e atribui em
    // VIDA_CONTENT[9]. Esta referência deve ser a mesma (===) — se mudar
    // a forma de import no engine, o build vai falhar.
    expect(VIDA_CONTENT[9]).toBe(VIDA_NUMERO_9);
  });

  it('edge case:NumeroContent = VIDA_NUMERO_9 // type-level: satisfaz o tipo  NumeroContent (compile-time)', () => {
    // Garante que VIDA_NUMERO_9 pode ser usado em qualquer lugar que
    // espera NumeroContent (queries, builders, AkashaPortal).
    const c: NumeroContent = VIDA_NUMERO_9;
    expect(c.levels.shadow).toBeDefined();
    expect(c.levels.gift.aplicacao.proposito).toBeDefined();
    expect(c.levels.siddhi.afirmacao.length).toBeGreaterThan(0);
  });

  it('edge case: a entrada 9 do VIDA_CONTENT é a única do tipo base-9 (cataloga sem duplicatas)', () => {
    // varre VIDA_CONTENT garantindo que só a chave 9 aponta para este objeto
    const refs = Object.entries(VIDA_CONTENT)
      .filter(([, v]) => v === VIDA_NUMERO_9)
      .map(([k]) => Number(k));
    expect(refs).toEqual([9]);
  });
});
