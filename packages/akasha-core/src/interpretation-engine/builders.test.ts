/**
 * @akasha/core — Interpretation Engine builders tests
 *
 * Cobre as 3 funções exportadas por builders.ts:
 *   - baseInterpretation: constrói os campos compartilhados (nivel/codigo/dado)
 *   - buildInterpretation: monta AreaInterpretation completa a partir de NumeroContent
 *   - buildFallback: gera interpretação genérica para números fora do catálogo
 */

import { describe, it, expect } from 'vitest';
import { baseInterpretation, buildInterpretation, buildFallback } from './builders';
import type { NumeroContent } from './types';
import type { AkashaLevel, LifeArea } from '@akasha/types';

// ─── Fixtures ──────────────────────────────────────────────────────────────

const makeNivelContent = () => ({
  tituloPool: 'O Visionário',
  significado: 'Você enxerga além do véu',
  padrao: 'Idealizar antes de agir',
  aplicacao: {
    carreira: 'Conecta-se a missões de longo prazo',
    saude: 'Tende a negligenciar o corpo',
  } as Partial<Record<LifeArea, string>>,
  acaoPratica: {
    amplificar: ['Meditar 10min'],
    evitar: ['Ficar em telas à noite'],
    ritual: 'Banho de ervas ao pôr do sol',
  },
  afirmacao: 'Eu canalizo visão com presença.',
});

const makeNumeroContent = (overrides: Partial<NumeroContent> = {}): NumeroContent => ({
  arquetipoAkasha: 'O Visionário',
  mandato: 'Ver para além e aterrar o que vê.',
  levels: {
    shadow: makeNivelContent(),
    gift: makeNivelContent(),
    siddhi: makeNivelContent(),
  },
  ...overrides,
});

// ─── Testes: baseInterpretation ─────────────────────────────────────────────

describe('baseInterpretation', () => {
  it('retorna os 3 campos compartilhados (nivel/codigo/dado) para número simples', () => {
    const base = baseInterpretation(7, false, 'gift');
    expect(base.nivel).toBe('gift');
    expect(base.codigo).toBe('vida-7-gift');
    expect(base.dado).toBe('Seu Número de Vida é 7.');
  });

  it('anexa sufixo "(Master N)" no campo dado quando isMaster=true', () => {
    const base = baseInterpretation(11, true, 'siddhi');
    expect(base.codigo).toBe('vida-11-siddhi');
    expect(base.dado).toBe('Seu Número de Vida é 11 (Master 11).');
  });

  it('edge case: aceita o boundary 22 (último master number) sem quebrar o formato', () => {
    const base = baseInterpretation(22, true, 'shadow');
    expect(base.codigo).toBe('vida-22-shadow');
    expect(base.dado).toContain('(Master 22)');
    expect(base.nivel).toBe('shadow');
  });
});

// ─── Testes: buildInterpretation ────────────────────────────────────────────

describe('buildInterpretation', () => {
  it('monta AreaInterpretation completa a partir do nível do NumeroContent', () => {
    const content = makeNumeroContent();
    const result = buildInterpretation(11, true, content, 'gift');

    expect(result.area).toBe('proposito');
    expect(result.nivel).toBe('gift');
    expect(result.codigo).toBe('vida-11-gift');
    expect(result.tituloPool).toBe('O Visionário');
    expect(result.significado).toBe('Você enxerga além do véu');
    expect(result.padrao).toBe('Idealizar antes de agir');
    expect(result.afirmacao).toBe('Eu canalizo visão com presença.');
    expect(result.aplicacao.carreira).toBe('Conecta-se a missões de longo prazo');
    expect(result.aplicacao.saude).toBe('Tende a negligenciar o corpo');
  });

  it('seleciona o nível correto em buildInterpretation — shadow ≠ gift ≠ siddhi', () => {
    const content = makeNumeroContent({
      levels: {
        shadow: { ...makeNivelContent(), tituloPool: 'O Iludido' },
        gift: { ...makeNivelContent(), tituloPool: 'O Visionário' },
        siddhi: { ...makeNivelContent(), tituloPool: 'O Iluminado' },
      },
    });

    const shadow = buildInterpretation(7, false, content, 'shadow');
    const gift = buildInterpretation(7, false, content, 'gift');
    const siddhi = buildInterpretation(7, false, content, 'siddhi');

    expect(shadow.tituloPool).toBe('O Iludido');
    expect(gift.tituloPool).toBe('O Visionário');
    expect(siddhi.tituloPool).toBe('O Iluminado');
    expect(shadow.nivel).toBe('shadow');
    expect(gift.nivel).toBe('gift');
    expect(siddhi.nivel).toBe('siddhi');
  });

  it('edge case: aplicacao vazia {} é preservada (nível sem áreas preenchidas)', () => {
    const content: NumeroContent = {
      ...makeNumeroContent(),
      levels: {
        shadow: { ...makeNivelContent(), aplicacao: {} },
        gift: makeNivelContent(),
        siddhi: makeNivelContent(),
      },
    };

    const result = buildInterpretation(3, false, content, 'shadow');
    expect(result.aplicacao).toEqual({});
    // Outros campos preservados
    expect(result.afirmacao).toBe('Eu canalizo visão com presença.');
  });
});

// ─── Testes: buildFallback ─────────────────────────────────────────────────

describe('buildFallback', () => {
  it('gera AreaInterpretation genérica com area=proposito e nivel correto', () => {
    const fb = buildFallback(13, 'gift');

    expect(fb.area).toBe('proposito');
    expect(fb.nivel).toBe('gift');
    expect(fb.codigo).toBe('vida-13-gift');
    expect(fb.dado).toBe('Seu Número de Vida é 13.');
    expect(fb.tituloPool.length).toBeGreaterThan(0);
    // O título do fallback é temático por nível (ex: "O Dom do Número")
    expect(typeof fb.tituloPool).toBe('string');
  });

  it('campo aplicacao do fallback sempre contém a chave proposito (não outras áreas)', () => {
    const fb = buildFallback(0, 'siddhi');
    expect(fb.aplicacao.proposito).toBeDefined();
    expect(fb.aplicacao.proposito).toContain('0');
    expect(fb.aplicacao.carreira).toBeUndefined();
    expect(fb.aplicacao.financas).toBeUndefined();
  });

  it('edge case: número negativo produz estrutura válida (boundary inferior)', () => {
    const fb = buildFallback(-1, 'shadow');
    expect(fb.area).toBe('proposito');
    expect(fb.nivel).toBe('shadow');
    expect(fb.codigo).toBe('vida--1-shadow');
    expect(fb.dado).toBe('Seu Número de Vida é -1.');
    expect(fb.afirmacao.length).toBeGreaterThan(0);
    expect(fb.significado.length).toBeGreaterThan(0);
  });
});
