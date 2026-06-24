/**
 * Wave 7.4 — Front A.1 — Testes de detecção de padrões emocionais.
 *
 * Cobre:
 *   1. Conflito parental (palavras: pai, mãe, familia)
 *   2. Ansiedade (palavras: ansiedade, medo, pânico)
 *   3. Múltiplos padrões detectados (intenção + respostas)
 *   4. Regressão: sem respostas → sem metadata.padroes
 *   5. detector isolado (detectarPadroesEmocionais)
 *
 * Executa contra o corpus real em `packages/tratamento/src/textos/`.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  sintetizar,
  limparCacheCorpus,
  type PilarInput,
  type RespostaPergunta,
} from '../index';
import { detectarPadroesEmocionais } from '../camadas/_helpers';

// ─── Fixtures ────────────────────────────────────────────────────────────────

/** PilarInput "completo" — Ogbe (1) por ter preceitos + quisilas + oriquente. */
function pilarInputCompleto(): PilarInput {
  return {
    cabala: { life_path: 1, expression: 1, motivation: 1, impression: 1 },
    astrologia: { sol_signo: 'aries', lua_signo: 'touro', lua_fase: 'nova', asc_signo: 'leao' },
    tantrica: { corpo_predominante: 1, trigemeo: 'fisico' },
    odu: {
      odu_principal: 'Ogbe (1)',
      odu_secundario: null,
      elemento: 'Fogo+Ar',
      orixa: 'Oxalá',
    },
    iching: { hexagrama_natal: 1, hexagrama_dia: 1 },
    pilar6: { tipo: 'iniciador_aberto', estrategia: 'Informar', autoridade: 'Emocional' },
    pilar7: { estagioAtual: 'dom' },
    intencao: 'Quero mais energia no trabalho e melhorar minha saúde do sono.',
    sinais_clinicos: ['mal', '3+ vezes'],
  };
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  limparCacheCorpus();
});

// ─── Testes ──────────────────────────────────────────────────────────────────

describe('Wave 7.4 — Front A.1 — Padrões emocionais em respostasPerguntas', () => {
  it('test_padroes_conflito_parental: respostas com "mãe" + "pai" → metadata.padroes inclui "conflito parental"', () => {
    const respostas: RespostaPergunta[] = [
      { pergunta_id: 'q1', resposta: 'Minha mãe sempre controlou minhas escolhas.' },
      { pergunta_id: 'q2', resposta: 'Meu pai nunca me ouviu quando eu era criança.' },
    ];

    const out = sintetizar({ ...pilarInputCompleto(), respostas });

    const diag = out.camadas['camada-1-diagnostico'];
    expect(diag).toBeDefined();
    expect(diag.metadata).toBeDefined();
    const padroes = (diag.metadata as { padroes?: unknown }).padroes;
    expect(Array.isArray(padroes)).toBe(true);
    expect(padroes as string[]).toContain('conflito parental');

    // Cadeia de pensamento registra o passo de detecção.
    const passoDeteccao = out.cadeia_pensamento.find((p) =>
      p.descricao.includes('padrões emocionais')
    );
    expect(passoDeteccao).toBeDefined();
    expect(passoDeteccao!.descricao).toContain('conflito parental');
  });

  it('test_padroes_ansiedade: respostas com "ansiedade" + "medo" → metadata.padroes inclui "ansiedade"', () => {
    const respostas: RespostaPergunta[] = [
      { pergunta_id: 'q3', resposta: 'Sinto ansiedade constante no trabalho.' },
      { pergunta_id: 'q4', resposta: 'Tenho medo de não dar conta das demandas.' },
    ];

    const out = sintetizar({ ...pilarInputCompleto(), respostas });

    const diag = out.camadas['camada-1-diagnostico'];
    const padroes = (diag.metadata as { padroes?: string[] }).padroes;
    expect(padroes).toBeDefined();
    expect(padroes).toContain('ansiedade');
  });

  it('test_padroes_multiplos: respostas + intenção cobrem 4 padrões simultâneos', () => {
    const respostas: RespostaPergunta[] = [
      { pergunta_id: 'q1', resposta: 'Conflito com minha mãe e meu pai me marca.' },
      { pergunta_id: 'q5', resposta: 'Meu parceiro e eu estamos em crise no casamento.' },
      { pergunta_id: 'q6', resposta: 'Tenho crises de ansiedade e medo de falhar.' },
      { pergunta_id: 'q7', resposta: 'Meu chefe me pressiona e o trabalho está insuportável.' },
    ];

    const out = sintetizar({
      ...pilarInputCompleto(),
      respostas,
      intencao: 'Preciso encontrar um propósito de vida, saber quem sou.',
    });

    const diag = out.camadas['camada-1-diagnostico'];
    const padroes = ((diag.metadata as { padroes?: string[] }).padroes ?? [])
      .slice()
      .sort();
    expect(padroes).toContain('conflito parental');
    expect(padroes).toContain('ansiedade');
    expect(padroes).toContain('relacionamento');
    expect(padroes).toContain('trabalho');
    expect(padroes).toContain('identidade');
    // Sem duplicatas.
    expect(new Set(padroes).size).toBe(padroes.length);
  });

  it('test_sem_respostas: input sem `respostas` e intenção sem gatilhos → metadata.padroes ausente ou vazio (regressão)', () => {
    const out = sintetizar({
      ...pilarInputCompleto(),
      intencao: 'Apenas um teste genérico sem gatilhos emocionais.',
      // respostas: undefined (deliberadamente)
    });

    const diag = out.camadas['camada-1-diagnostico'];
    // Sem respostas nem gatilhos → metadata ausente OU padroes vazio.
    if (diag.metadata) {
      const padroes = (diag.metadata as { padroes?: unknown }).padroes;
      if (padroes !== undefined) {
        expect(Array.isArray(padroes)).toBe(true);
        expect((padroes as unknown[]).length).toBe(0);
      }
    }

    // Camada 1 continua com shape completo (id, titulo, fontes, requires_professional_review).
    expect(diag.id).toBe('camada-1-diagnostico');
    expect(typeof diag.titulo).toBe('string');
    expect(Array.isArray(diag.fontes)).toBe(true);
    expect(typeof diag.requires_professional_review).toBe('boolean');
  });

  it('test_detector_isolado: detectarPadroesEmocionais funciona unitariamente', () => {
    // 1) Conflito parental puro
    expect(detectarPadroesEmocionais(
      [{ resposta: 'mãe e pai ausentes' }],
      undefined
    )).toEqual(['conflito parental']);

    // 2) Ansiedade pura
    expect(detectarPadroesEmocionais(
      [{ resposta: 'Sinto pânico e medo constantes.' }],
      undefined
    )).toEqual(['ansiedade']);

    // 3) Múltiplos via respostas + intenção (deduplicado)
    const det = detectarPadroesEmocionais(
      [
        { resposta: 'crise com parceiro' },
        { resposta: 'trabalho insuportável' },
      ],
      'quero entender quem sou'
    );
    expect(det).toContain('relacionamento');
    expect(det).toContain('trabalho');
    expect(det).toContain('identidade');
    expect(new Set(det).size).toBe(det.length);

    // 4) Entrada vazia → []
    expect(detectarPadroesEmocionais(undefined, undefined)).toEqual([]);
    expect(detectarPadroesEmocionais([], '')).toEqual([]);

    // 5) Texto sem gatilhos → []
    expect(detectarPadroesEmocionais(
      [{ resposta: 'apenas um comentário neutro sem gatilhos emocionais' }],
      'intenção genérica'
    )).toEqual([]);
  });

  it('test_palavras_normalizadas: match funciona com/sem acento (PT-BR)', () => {
    // "pânico" → após NFD+strip vira "panico" → match.
    const out = sintetizar({
      ...pilarInputCompleto(),
      respostas: [{ pergunta_id: 'q1', resposta: 'pânico constante' }],
    });
    const padroes = (out.camadas['camada-1-diagnostico'].metadata as { padroes?: string[] })
      ?.padroes;
    expect(padroes).toContain('ansiedade');
  });
});
