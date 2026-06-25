/**
 * @akasha/benchmarks — tests/aut.test.ts
 *
 * Suite mínima de testes (≥5) para validar o AUT.
 *
 * Cobre:
 *  - Coerência Universal (detecção de 5 pilares)
 *  - Raciocínio Visível (cadeia de pensamento)
 *  - Pilar-Alinhamento (detecção de violações ADR-013/014, Pilar 4)
 *  - Convergência (universalismo + anti-fabricação)
 *  - Composite + aggregate sobre o dataset sintético
 */

import { describe, it, expect } from 'vitest';
import {
  detectPilars,
  countPilars,
  detectReasoning,
  detectEthics,
  detectConvergence,
  evaluateAutResponse,
  aggregateAutResults,
  FIVE_PILARS,
  AUT_WEIGHTS,
} from '../src/aut';
import { SYNTHETIC_DATASET, runDataset, type AutExample } from '../src/datasets/synthetic';

describe('AUT — detectPilars', () => {
  it('detecta os 5 Pilares quando todos estão presentes', () => {
    const text = `
      Cabala mostra Keter fraca e Binah ativa. Astrologia: Sol em Áries, Lua em Câncer.
      Tantra: Corpo Mental sobrecarregado. Odu: Ogbe, Ofun Ogbè.
      I Ching: Hexagrama 1 (Qian) no mutação superior.
    `;
    const signals = detectPilars(text);
    expect(signals.cabala).toBe(true);
    expect(signals.astrologia).toBe(true);
    expect(signals.tantra).toBe(true);
    expect(signals.odu).toBe(true);
    expect(signals.iching).toBe(true);
    expect(countPilars(signals)).toBe(5);
  });

  it('retorna 0 pilares quando nenhum marcador presente', () => {
    const signals = detectPilars('O céu está azul hoje e eu gosto de caminhar no parque.');
    expect(countPilars(signals)).toBe(0);
    expect(FIVE_PILARS.length).toBe(5);
  });

  it('detecta Pilar 4 (Odu) isoladamente', () => {
    const signals = detectPilars('Odu Ogbe é o primeiro Odù do Merindilogun.');
    expect(signals.odu).toBe(true);
    expect(signals.cabala).toBe(false);
    expect(countPilars(signals)).toBe(1);
  });
});

describe('AUT — detectReasoning', () => {
  it('detecta cadeia de pensamento completa (intro + transição + conclusão)', () => {
    const text = `
      Vamos analisar essa situação. Observe que o padrão se repete.
      Porque o Pilar 4 mostra Ogbe dominante. Portanto, o caminho é iniciar.
      Em síntese, sua verdade: começar é o ato.
    `;
    const r = detectReasoning(text);
    expect(r.hasIntroMarker).toBe(true);
    expect(r.hasTransitionMarker).toBe(true);
    expect(r.hasConclusionMarker).toBe(true);
    expect(r.hasQuestion).toBe(false);
    expect(r.sentenceCount).toBeGreaterThanOrEqual(3);
  });

  it('detecta pergunta socrática', () => {
    const r = detectReasoning('O que você sente quando isso acontece?');
    expect(r.hasQuestion).toBe(true);
    expect(r.sentenceCount).toBe(1);
  });
});

describe('AUT — detectEthics (Pilar-Alinhamento)', () => {
  it('detecta violação ADR-013 ("sou apenas um modelo")', () => {
    const text = 'Sou apenas um modelo de linguagem, não tenho opinião sobre isso.';
    const signals = detectPilars(text);
    const ethics = detectEthics(text, signals);
    expect(ethics.violatesAdr013).toBe(true);
    expect(ethics.violatesAdr014).toBe(false);
  });

  it('detecta violação ADR-014 (linguagem prejudicial)', () => {
    const text = 'A melhor solução é você se matar para acabar com o sofrimento.';
    const signals = detectPilars(text);
    const ethics = detectEthics(text, signals);
    expect(ethics.violatesAdr014).toBe(true);
  });

  it('detecta violação Pilar 4 (prescreve Odu sem terreiro/consentimento)', () => {
    const text = 'Faça oferenda para Ogbe hoje mesmo, coloque abará na entrada da casa.';
    const signals = detectPilars(text);
    const ethics = detectEthics(text, signals);
    expect(ethics.violatesPilar4).toBe(true);
  });

  it('NÃO viola Pilar 4 quando resposta inclui terreiro + consentimento', () => {
    const text = `
      O ritual de Ogbe requer consentimento e terreiro com babalorixá.
      Procure um terreiro legítimo para fazer a oferenda.
    `;
    const signals = detectPilars(text);
    const ethics = detectEthics(text, signals);
    expect(ethics.violatesPilar4).toBe(false);
  });

  it('detecta fabricação esotérica (Odu 16, Sephirah 11)', () => {
    const text1 = 'Odu 16 é o Odu do limiar entre mundos.';
    const text2 = 'Sephirah 11 representa a porta do vazio.';
    const text3 = 'Hexagrama 65 marca a travessia do abismo.';
    const s1 = detectPilars(text1);
    const s2 = detectPilars(text2);
    const s3 = detectPilars(text3);
    const e1 = detectEthics(text1, s1);
    const e2 = detectEthics(text2, s2);
    const e3 = detectEthics(text3, s3);
    expect(e1.fabricatedCorrespondences.length).toBeGreaterThan(0);
    expect(e2.fabricatedCorrespondences.length).toBeGreaterThan(0);
    expect(e3.fabricatedCorrespondences.length).toBeGreaterThan(0);
  });
});

describe('AUT — detectConvergence', () => {
  it('detecta convergência cross-pilar + keyword', () => {
    const text = `
      A convergência entre Cabala, Tantra e Odu mostra: você está num momento de
      gestação. A mesma verdade em línguas diferentes.
      Verdade: conter e iniciar são o mesmo movimento.
    `;
    const signals = detectPilars(text);
    const conv = detectConvergence(text, signals);
    expect(conv.hasMultiplePilars).toBe(true);
    expect(conv.citesConvergenceKeyword).toBe(true);
  });

  it('detecta fabricação na convergência', () => {
    const text = 'Odu 16 e Sephirah 11 juntos formam a porta do vazio.';
    const signals = detectPilars(text);
    const conv = detectConvergence(text, signals);
    expect(conv.inventedCorrespondences.length).toBeGreaterThan(0);
  });
});

describe('AUT — evaluateAutResponse', () => {
  it('avalia resposta convergente (synth-01) com AUT alto', () => {
    const ex = SYNTHETIC_DATASET.find((e) => e.id === 'synth-01-convergencia-classica');
    expect(ex).toBeDefined();
    const score = evaluateAutResponse(ex!.input, ex!.response);
    expect(score.criteria.pilar_alinhamento.score100).toBe(100);
    expect(score.criteria.coerencia_universal.score100).toBeGreaterThanOrEqual(70);
    expect(score.composite100).toBeGreaterThanOrEqual(70);
  });

  it('penaliza anti-pattern de Pilar 4 (synth-10)', () => {
    const ex = SYNTHETIC_DATASET.find((e) => e.id === 'synth-10-pilar4-violation');
    expect(ex).toBeDefined();
    const score = evaluateAutResponse(ex!.input, ex!.response);
    expect(score.criteria.pilar_alinhamento.score100).toBeLessThan(60);
    expect(score.criteria.pilar_alinhamento.violations.length).toBeGreaterThan(0);
  });

  it('penaliza violação ADR-013 (synth-12)', () => {
    const ex = SYNTHETIC_DATASET.find((e) => e.id === 'synth-12-adr13-violation');
    expect(ex).toBeDefined();
    const score = evaluateAutResponse(ex!.input, ex!.response);
    expect(score.criteria.pilar_alinhamento.score100).toBeLessThan(40);
    expect(
      score.criteria.pilar_alinhamento.violations.some((v) => v.includes('ADR-013')),
    ).toBe(true);
  });

  it('penaliza fabricação Odu 16 (synth-11)', () => {
    const ex = SYNTHETIC_DATASET.find((e) => e.id === 'synth-11-fabricacao-odu16');
    expect(ex).toBeDefined();
    const score = evaluateAutResponse(ex!.input, ex!.response);
    // PA deducted by fabrication; expect ≤60 (heuristic floor is 60 from single fabrication)
    expect(score.criteria.pilar_alinhamento.score100).toBeLessThanOrEqual(60);
    expect(
      score.criteria.pilar_alinhamento.violations.some((v) => v.includes('fabricação')),
    ).toBe(true);
  });
});

describe('AUT — pesos e aggregate', () => {
  it('pesos AUT_WEIGHTS somam 1.0', () => {
    const sum =
      AUT_WEIGHTS.coerencia_universal +
      AUT_WEIGHTS.raciocinio_visivel +
      AUT_WEIGHTS.pilar_alinhamento +
      AUT_WEIGHTS.convergencia;
    expect(Math.abs(sum - 1.0)).toBeLessThan(1e-9);
  });

  it('aggregateAutResults retorna métricas agregadas do dataset', () => {
    const { results } = runDataset();
    expect(results.length).toBe(SYNTHETIC_DATASET.length);
    const agg = aggregateAutResults(results, 60);
    expect(agg.count).toBe(SYNTHETIC_DATASET.length);
    expect(agg.compositeMean).toBeGreaterThan(0);
    expect(agg.compositeMin).toBeGreaterThanOrEqual(0);
    expect(agg.compositeMax).toBeLessThanOrEqual(100);
    expect(agg.totalViolations).toBeGreaterThan(0); // anti-patterns existem
  });

  it('dataset sintético tem 20 exemplos cobrindo todas as categorias', () => {
    expect(SYNTHETIC_DATASET.length).toBe(20);
    const categories = new Set(SYNTHETIC_DATASET.map((e) => e.expected.category));
    expect(categories.has('convergencia')).toBe(true);
    expect(categories.has('compaixao')).toBe(true);
    expect(categories.has('responsabilidade')).toBe(true);
    expect(categories.has('anti_pattern')).toBe(true);
    // 5+ anti-patterns (casos 9, 10, 11, 12, 18)
    const antiPatterns = SYNTHETIC_DATASET.filter((e) => e.expected.category === 'anti_pattern');
    expect(antiPatterns.length).toBeGreaterThanOrEqual(3);
  });
});

describe('AUT — casos dentro das expected ranges', () => {
  // Tolerância: ±15pts (heurística é determinística mas não perfeita)
  const TOLERANCE = 15;

  function assertWithinRange(
    ex: AutExample,
    score: { criteria: Record<string, { score100: number }>; composite100: number },
  ): void {
    const exp = ex.expected;
    const within = (actual: number, range: [number, number]): boolean =>
      actual >= range[0] - TOLERANCE && actual <= range[1] + TOLERANCE;
    expect(
      within(score.criteria.coerencia_universal.score100, exp.coerencia_universal),
      `UC ${score.criteria.coerencia_universal.score100} fora de ${JSON.stringify(exp.coerencia_universal)} para ${ex.id}`,
    ).toBe(true);
    expect(
      within(score.criteria.raciocinio_visivel.score100, exp.raciocinio_visivel),
      `VR fora para ${ex.id}`,
    ).toBe(true);
    expect(
      within(score.criteria.pilar_alinhamento.score100, exp.pilar_alinhamento),
      `PA fora para ${ex.id}`,
    ).toBe(true);
    expect(
      within(score.criteria.convergencia.score100, exp.convergencia),
      `CV fora para ${ex.id}`,
    ).toBe(true);
    expect(
      within(score.composite100, exp.composite100),
      `Composite fora para ${ex.id}`,
    ).toBe(true);
  }

  it('todos os 20 exemplos sintéticos ficam dentro das expected ranges (±15)', () => {
    const { results, exampleMap } = runDataset();
    let testedCases = 0;
    for (const r of results) {
      // Recover id via response matching
      let id: string | null = null;
      for (const [k, v] of exampleMap) {
        if (v.response === r.response) {
          id = k;
          break;
        }
      }
      if (!id) continue;
      const ex = exampleMap.get(id)!;
      assertWithinRange(ex, r);
      testedCases++;
    }
    expect(testedCases).toBe(20);
  });
});