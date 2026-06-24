import { camadaVazia } from '../camadas/_helpers';
/**
 * Integration tests — @akasha/tratamento Synthesis Engine
 *
 * Cobre:
 *   1. sintetizar() retorna 7 camadas
 *   2. Cada camada tem titulo, conteudo (não-vazio) e fontes
 *   3. CadeiaPensamento populada
 *   4. Output em PT-BR
 *   5. Sem termos religiosos-cult / proprietários (Human Design, etc.)
 *   6. Graceful degradation (corpus ausente → camada null)
 *
 * Executa contra o corpus real em `packages/tratamento/src/textos/`.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  sintetizar,
  carregarCorpus,
  limparCacheCorpus,
  ENGINE_VERSION,
  DISCLAIMER_TERAPEUTICO,
  type PilarInput,
  type Corpus,
} from '../index';

// ─── Fixtures ────────────────────────────────────────────────────────────────

/** PilarInput "completo" — usa Ogbe (1) por ter preceitos + quisilas + oriquente. */
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
    pilar6: { tipo: 'Manifestador', estrategia: 'Informar', autoridade: 'Emocional' },
    pilar7: { estagioAtual: 'dom' },
    intencao: 'Quero mais energia no trabalho e melhorar minha saúde do sono.',
    sinais_clinicos: ['mal', '3+ vezes'],
  };
}

/** PilarInput mínimo (sem Pilares 1-7, só intenção). */
function pilarInputMinimo(): PilarInput {
  return {
    cabala: null,
    astrologia: null,
    tantrica: null,
    odu: null,
    iching: null,
    pilar6: null,
    pilar7: null,
    intencao: '',
  };
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  // Garante que cada teste começa com corpus fresco (não usar cache do anterior).
  limparCacheCorpus();
});

// ─── Testes ──────────────────────────────────────────────────────────────────

describe('Wave 5 — Synthesis Engine (@akasha/tratamento)', () => {
  it('Test 1: sintetizar() retorna 7 camadas', () => {
    const out = sintetizar(pilarInputCompleto());

    expect(out.camadas).toBeDefined();
    expect(Object.keys(out.camadas)).toHaveLength(7);
    expect(out.camadas['camada-1-diagnostico']).toBeDefined();
    expect(out.camadas['camada-2-praticas-imediatas']).toBeDefined();
    expect(out.camadas['camada-3-tratamento-por-area']).toBeDefined();
    expect(out.camadas['camada-4-quisilas']).toBeDefined();
    expect(out.camadas['camada-5-alinhamento-energetico']).toBeDefined();
    expect(out.camadas['camada-6-psicanalise']).toBeDefined();
    expect(out.camadas['camada-7-coaching']).toBeDefined();
  });

  it('Test 2: cada camada tem titulo, conteudo (não-vazio) e fontes', () => {
    const out = sintetizar(pilarInputCompleto());

    for (const [id, camada] of Object.entries(out.camadas)) {
      expect(camada.id, `id da camada ${id}`).toBeTruthy();
      expect(camada.titulo, `titulo da camada ${id}`).toBeTruthy();
      expect(typeof camada.titulo).toBe('string');
      // Conteudo pode ser null em graceful degradation, mas com input
      // completo esperamos conteúdo não-vazio.
      if (camada.conteudo !== null) {
        expect(camada.conteudo.length, `conteudo da camada ${id}`).toBeGreaterThan(0);
      }
      expect(Array.isArray(camada.fontes), `fontes da camada ${id}`).toBe(true);
      // requires_professional_review é boolean.
      expect(typeof camada.requires_professional_review).toBe('boolean');
    }

    // Com input completo, todas devem ter conteúdo não-vazio.
    for (const [id, camada] of Object.entries(out.camadas)) {
      expect(camada.conteudo, `conteudo vazio em ${id}`).not.toBeNull();
      expect(camada.fontes.length, `sem fontes em ${id}`).toBeGreaterThan(0);
    }
  });

  it('Test 3: CadeiaPensamento é populada', () => {
    const out = sintetizar(pilarInputCompleto());

    expect(Array.isArray(out.cadeia_pensamento)).toBe(true);
    expect(out.cadeia_pensamento.length).toBeGreaterThan(0);

    // Cada passo deve ter step (1-based) + descricao + fontes_usadas.
    for (let i = 0; i < out.cadeia_pensamento.length; i++) {
      const passo = out.cadeia_pensamento[i];
      expect(passo.step, `step no índice ${i}`).toBe(i + 1);
      expect(typeof passo.descricao).toBe('string');
      expect(passo.descricao.length).toBeGreaterThan(0);
      expect(Array.isArray(passo.fontes_usadas)).toBe(true);
    }

    // Deve referenciar pelo menos uma fonte do corpus nas camadas geradas.
    const totalFontes = Object.values(out.camadas).flatMap((c) => c.fontes);
    expect(totalFontes.length).toBeGreaterThan(0);
  });

  it('Test 4: output é PT-BR', () => {
    const out = sintetizar(pilarInputCompleto());

    // Verifica campos textuais em PT-BR:
    // - contém palavras comuns PT-BR (de, da, do, em, com, para)
    // - contém acentuação PT-BR (á, é, í, ó, ú, ã, õ, ç)
    const textos: string[] = [];
    for (const camada of Object.values(out.camadas)) {
      if (camada.titulo) textos.push(camada.titulo);
      if (camada.conteudo) textos.push(camada.conteudo);
      for (const f of camada.fontes) {
        if (f.conteudo) textos.push(f.conteudo);
      }
    }
    for (const passo of out.cadeia_pensamento) {
      textos.push(passo.descricao);
    }

    // Pelo menos 50% dos textos devem ter acentuação PT-BR.
    const comAcento = textos.filter((t) => /[áéíóúãõçÁÉÍÓÚÃÕÇ]/.test(t));
    expect(comAcento.length / Math.max(textos.length, 1)).toBeGreaterThan(0.5);

    // Disclaimer é integralmente PT-BR.
    expect(out.disclaimer).toMatch(/[áéíóúãõçÁÉÍÓÚÃÕÇ]/);

    // Pelo menos um texto contém palavras funcionais PT-BR.
    const todoTexto = textos.join(' ');
    expect(todoTexto).toMatch(/\b(de|da|do|em|com|para|por|ou)\b/);
  });

  it('Test 5: sem termos religiosos-cult ou proprietários', () => {
    const out = sintetizar(pilarInputCompleto());

    const termosProibidos = [
      // Proprietários (ADR 0002 guardrails)
      'Human Design',
      'Gene Keys',
      'BodyGraph',
      'Body Graph',
      // Cult/religious absolutist
      'salvação',
      'iluminado',
      'escolhido',
      'iniciado supremo',
      'graça divina',
      'mestre ascendido',
    ];

    for (const camada of Object.values(out.camadas)) {
      if (camada.conteudo) {
        for (const termo of termosProibidos) {
          expect(
            camada.conteudo.toLowerCase().includes(termo.toLowerCase()),
            `Termo proibido "${termo}" em camada ${camada.id}: ${camada.conteudo}`
          ).toBe(false);
        }
      }
      for (const f of camada.fontes) {
        for (const termo of termosProibidos) {
          expect(
            f.conteudo.toLowerCase().includes(termo.toLowerCase()),
            `Termo proibido "${termo}" em fonte ${f.id}`
          ).toBe(false);
        }
      }
    }

    for (const passo of out.cadeia_pensamento) {
      for (const termo of termosProibidos) {
        expect(
          passo.descricao.toLowerCase().includes(termo.toLowerCase()),
          `Termo proibido "${termo}" em passo ${passo.step}`
        ).toBe(false);
      }
    }
  });

  it('Test 6: graceful degradation — corpus ausente para um Odu → camada null', () => {
    // Um PilarInput cujo Odu NÃO existe no corpus deve produzir camada
    // com conteudo=null e fontes=[] (graceful). Usamos um Odu fictício
    // "Ogbe (999)" que não está no corpus.
    const inputSemOduConhecido: PilarInput = {
      cabala: { life_path: 99, expression: 99, motivation: 99, impression: 99 },
      astrologia: null,
      tantrica: null,
      odu: {
        odu_principal: 'Ogbe (999)', // não existe no corpus
        odu_secundario: null,
        elemento: 'Fogo+Ar',
        orixa: 'Oxalá',
      },
      iching: null,
      pilar6: null,
      pilar7: null,
      intencao: '',
      sinais_clinicos: [],
    };

    const out = sintetizar(inputSemOduConhecido);

    // Shape completo: 7 camadas presentes.
    expect(Object.keys(out.camadas)).toHaveLength(7);

    // Pelo menos 1 camada deve ter conteudo=null (graceful degradation).
    const camadasVazias = Object.values(out.camadas).filter(
      (c) => c.conteudo === null && c.fontes.length === 0
    );
    expect(camadasVazias.length).toBeGreaterThan(0);

    // Versão + disclaimer sempre presentes (shape completo preservado).
    expect(out.versao).toBe(ENGINE_VERSION);
    expect(out.disclaimer).toBe(DISCLAIMER_TERAPEUTICO);
  });

  it('Test 6d: corpus path inexistente → carrega Corpus vazio (não falha)', () => {
    // Validar que carregarCorpus não quebra em ambiente sem corpus
    // (instalação incompleta, CI runner, etc).
    limparCacheCorpus();
    const corpusVazio = carregarCorpus('/path/inexistente/qualquer');
    expect(corpusVazio).toBeInstanceOf(Map);
    expect(corpusVazio.size).toBe(0);

    // Helpers produzem Camada vazia com corpus vazio.
    // camadaVazia já importado no topo
    const v = camadaVazia('camada-1-diagnostico', 'Diagnóstico');
    expect(v.conteudo).toBeNull();
    expect(v.fontes).toEqual([]);

    // Reset cache para não afetar outros testes.
    limparCacheCorpus();
  });

  it('Test 6b: maxFrases limita o tamanho do conteudo', () => {
    const out = sintetizar(pilarInputCompleto(), { maxFrases: 1 });

    for (const camada of Object.values(out.camadas)) {
      if (camada.conteudo) {
        // 1 frase = no máximo 1 sentença terminada em .!? ou fim.
        const frases = camada.conteudo.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) ?? [camada.conteudo];
        expect(frases.length, `camada ${camada.id} com maxFrases=1`).toBeLessThanOrEqual(2);
      }
    }
  });

  it('Test 6c: pilarInput mínimo retorna shape completo sem falhar', () => {
    // Sem dados pilares, o motor ainda deve retornar o shape com 7 camadas.
    const out = sintetizar(pilarInputMinimo());
    expect(Object.keys(out.camadas)).toHaveLength(7);
    // Versão + disclaimer sempre presentes.
    expect(out.versao).toBe(ENGINE_VERSION);
    expect(out.disclaimer).toBeTruthy();
  });
});
