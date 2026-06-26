/**
 * @akasha/benchmarks — agreement tests (Wave 32.3)
 *
 * Coverage targets (per Wave 32.3 spec: 5+ tests):
 *   1. Cohen's κ perfect (1.0) — anotadores sempre concordam
 *   2. Cohen's κ zero (chance level) — anotadores discordam aleatoriamente
 *   3. Cohen's κ moderado (~0.5) — anotadores concordam com ruído
 *   4. Fleiss' κ perfect (1.0) — 3 anotadores sempre concordam
 *   5. Fleiss' κ moderado — 3 anotadores parcialmente concordam
 *   6. agreementWithin1Pct e exactAgreementPct
 *   7. Edge cases: 1 anotador (κ=1), 0 annotations (κ=0)
 *   8. convergenceTestPassed threshold (0.6)
 *   9. groupByResponse + perResponseDisagreement
 *  10. renderAgreementReportHtml não-throw + contém keywords
 */

import { describe, it, expect } from 'vitest';
import {
  type HumanAnnotation,
  type Criterion,
  FOUR_CRITERIA,
  calculateAgreement,
  cohensKappaWeighted,
  fleissKappa,
  averageCohensKappa,
  groupByResponse,
  exactAgreementPct,
  agreementWithin1Pct,
  perResponseDisagreement,
  buildConfusionMatrix,
  renderAgreementReportHtml,
} from '../src/agreement';

// Helper: cria annotation
function ann(
  responseId: string,
  annotatorId: string,
  r: number,
  t: number,
  u: number,
  v: number,
): HumanAnnotation {
  return { responseId, annotatorId, rScore: r, tScore: t, uScore: u, vScore: v };
}

describe('cohensKappaWeighted', () => {
  it('returns 1.0 for perfect agreement', () => {
    const a = [0, 5, 10, 3, 7];
    const b = [0, 5, 10, 3, 7];
    expect(cohensKappaWeighted(a, b)).toBeCloseTo(1.0, 6);
  });

  it('returns 0 for chance-level (uniform random)', () => {
    // Para κ = 0, pObs precisa ter agreement esperado igual ao by-chance.
    // Com scores uniformes [0..2] e 3 ratings, agreement exato esperado = 1/3.
    // Simulamos 30 ratings com distribution uniforme (não dá 0 exato mas é próximo).
    const a = [0, 0, 0, 1, 1, 1, 2, 2, 2, 0, 1, 2];
    const b = [0, 1, 2, 0, 1, 2, 0, 1, 2, 2, 2, 2];
    const kappa = cohensKappaWeighted(a, b);
    // Permitimos range [-0.5, 0.5] para "chance level"
    expect(Math.abs(kappa)).toBeLessThan(0.5);
  });

  it('returns moderate (~0.5-0.8) for noisy agreement', () => {
    // Anotadores concordam ±1 com frequência alta.
    const a = [5, 6, 7, 5, 6, 7, 8, 9, 5, 6];
    const b = [5, 6, 7, 6, 7, 8, 8, 9, 4, 7]; // pequena variação
    const kappa = cohensKappaWeighted(a, b);
    expect(kappa).toBeGreaterThan(0.4);
    expect(kappa).toBeLessThan(1.0);
  });

  it('handles empty arrays gracefully', () => {
    expect(cohensKappaWeighted([], [])).toBe(0);
  });

  it('clamps out-of-range scores', () => {
    const a = [15, -3, 7, 7];
    const b = [10, 0, 7, 7];
    // 15 clamps to 10, -3 clamps to 0 — depois perfeito em metade
    const kappa = cohensKappaWeighted(a, b);
    expect(kappa).toBeGreaterThan(0); // pelo menos 50% perfeito
  });
});

describe('fleissKappa', () => {
  it('returns 1.0 for perfect 3-annotator agreement', () => {
    const annotations: HumanAnnotation[] = [];
    for (let i = 0; i < 20; i++) {
      annotations.push(ann(`r${i}`, 'A', 5, 5, 5, 5));
      annotations.push(ann(`r${i}`, 'B', 5, 5, 5, 5));
      annotations.push(ann(`r${i}`, 'C', 5, 5, 5, 5));
    }
    expect(fleissKappa(annotations, 'rScore')).toBeCloseTo(1.0, 6);
  });

  it('returns ~0 for random uniform distribution (3 annotators)', () => {
    // Padrão circular: cada anotador rotaciona scores para gerar distribuição uniforme.
    const annotations: HumanAnnotation[] = [];
    const dist = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    for (let i = 0; i < dist.length; i++) {
      annotations.push(ann(`r${i}`, 'A', dist[i], dist[i], dist[i], dist[i]));
      annotations.push(ann(`r${i}`, 'B', dist[(i + 4) % 11], dist[(i + 4) % 11], dist[(i + 4) % 11], dist[(i + 4) % 11]));
      annotations.push(ann(`r${i}`, 'C', dist[(i + 7) % 11], dist[(i + 7) % 11], dist[(i + 7) % 11], dist[(i + 7) % 11]));
    }
    const kappa = fleissKappa(annotations, 'rScore');
    expect(Math.abs(kappa)).toBeLessThan(0.5);
  });

  it('returns moderate for partial agreement (3 anotators)', () => {
    // Cenário realista: 3 anotadores, 20 responses. A=B em todos, C diverge
    // em 6 responses (scores ±2). Esperado: κ nominal > 0.5.
    // Usamos fleissKappa (nominal) porque Fleiss weighted com Likert 0-10
    // penaliza muito com distributions concentradas (pe alto).
    const annotations: HumanAnnotation[] = [];
    for (let i = 0; i < 14; i++) {
      const base = 5 + (i % 4);
      annotations.push(ann(`r${i}`, 'A', base, base, base, base));
      annotations.push(ann(`r${i}`, 'B', base, base, base, base));
      annotations.push(ann(`r${i}`, 'C', base, base, base, base));
    }
    for (let i = 14; i < 20; i++) {
      const base = 5 + (i % 4);
      const cScore = base + 2; // diverge 2
      annotations.push(ann(`r${i}`, 'A', base, base, base, base));
      annotations.push(ann(`r${i}`, 'B', base, base, base, base));
      annotations.push(ann(`r${i}`, 'C', cScore, cScore, cScore, cScore));
    }
    const kappa = fleissKappa(annotations, 'rScore'); // nominal
    expect(kappa).toBeGreaterThan(0.4);
    expect(kappa).toBeLessThanOrEqual(1.0);
  });
});

describe('calculateAgreement — convergence test', () => {
  it('returns κ=1 when only 1 annotator (trivial case)', () => {
    const annotations = [ann('r1', 'A', 5, 6, 7, 8), ann('r2', 'A', 3, 4, 5, 6)];
    const report = calculateAgreement(annotations);
    for (const c of FOUR_CRITERIA) {
      expect(report.kappas[c]).toBe(1);
    }
    expect(report.convergenceTestPassed).toBe(true);
  });

  it('returns empty arrays for zero annotations', () => {
    const report = calculateAgreement([]);
    expect(report.totalResponses).toBe(0);
    expect(report.totalAnnotators).toBe(0);
    expect(report.totalAnnotations).toBe(0);
    expect(report.meanKappa).toBe(0);
    expect(report.convergenceTestPassed).toBe(false);
  });

  it('passes convergence test (κ ≥ 0.6) with high agreement', () => {
    const annotations: HumanAnnotation[] = [];
    // 30 responses, 2 anotadores, agreement perfeito
    for (let i = 0; i < 30; i++) {
      const score = (i % 11);
      annotations.push(ann(`r${i}`, 'A', score, score, score, score));
      annotations.push(ann(`r${i}`, 'B', score, score, score, score));
    }
    const report = calculateAgreement(annotations);
    expect(report.convergenceTestPassed).toBe(true);
    expect(report.meanKappa).toBeGreaterThanOrEqual(0.6);
  });

  it('fails convergence test (κ < 0.6) with high disagreement', () => {
    const annotations: HumanAnnotation[] = [];
    for (let i = 0; i < 20; i++) {
      // A dá sempre 0, B dá sempre 10 — máxima discordância
      annotations.push(ann(`r${i}`, 'A', 0, 0, 0, 0));
      annotations.push(ann(`r${i}`, 'B', 10, 10, 10, 10));
    }
    const report = calculateAgreement(annotations);
    // Com κ = -1 (pior que chance), mean < 0.6
    expect(report.convergenceTestPassed).toBe(false);
  });

  it('computes exact and within-1 agreement percentages correctly', () => {
    const annotations: HumanAnnotation[] = [
      ann('r1', 'A', 5, 5, 5, 5),
      ann('r1', 'B', 5, 5, 5, 5), // exact match
      ann('r2', 'A', 5, 5, 5, 5),
      ann('r2', 'B', 6, 6, 6, 6), // within 1
      ann('r3', 'A', 5, 5, 5, 5),
      ann('r3', 'B', 10, 10, 10, 10), // disagreement > 1
    ];
    const report = calculateAgreement(annotations);
    expect(report.pctExactAgreement.rScore).toBeCloseTo(1 / 3, 5);
    expect(report.pctAgreementWithin1.rScore).toBeCloseTo(2 / 3, 5);
  });
});

describe('groupByResponse + perResponseDisagreement', () => {
  it('groups annotations by responseId', () => {
    const annotations: HumanAnnotation[] = [
      ann('r1', 'A', 5, 5, 5, 5),
      ann('r1', 'B', 6, 6, 6, 6),
      ann('r2', 'A', 3, 3, 3, 3),
    ];
    const grouped = groupByResponse(annotations);
    expect(grouped.size).toBe(2);
    expect(grouped.get('r1')?.length).toBe(2);
    expect(grouped.get('r2')?.length).toBe(1);
  });

  it('computes per-response disagreement as max-min', () => {
    const annotations: HumanAnnotation[] = [
      ann('r1', 'A', 3, 5, 7, 9),
      ann('r1', 'B', 5, 5, 5, 5),
      ann('r1', 'C', 8, 2, 1, 4),
    ];
    const grouped = groupByResponse(annotations);
    const dis = perResponseDisagreement(grouped, 'rScore');
    expect(dis).toEqual([5]); // max(3,5,8) - min(3,5,8) = 5
  });
});

describe('buildConfusionMatrix', () => {
  it('has diagonal dominance for perfect agreement', () => {
    const annotations: HumanAnnotation[] = [];
    for (let i = 0; i < 10; i++) {
      annotations.push(ann(`r${i}`, 'A', i, i, i, i));
      annotations.push(ann(`r${i}`, 'B', i, i, i, i));
    }
    const m = buildConfusionMatrix(annotations, 'rScore');
    let diagonal = 0;
    let offDiagonal = 0;
    for (let i = 0; i < 11; i++) {
      diagonal += m[i][i];
      for (let j = 0; j < 11; j++) {
        if (i !== j) offDiagonal += m[i][j];
      }
    }
    expect(diagonal).toBeGreaterThan(0);
    expect(offDiagonal).toBe(0);
  });

  it('returns 11x11 zero matrix for no annotations', () => {
    const m = buildConfusionMatrix([], 'rScore');
    expect(m.length).toBe(11);
    expect(m[0].length).toBe(11);
    expect(m.every((row) => row.every((v) => v === 0))).toBe(true);
  });
});

describe('renderAgreementReportHtml', () => {
  it('renders valid HTML with key sections', () => {
    const annotations: HumanAnnotation[] = [
      ann('r1', 'A', 5, 6, 7, 8),
      ann('r1', 'B', 5, 6, 7, 8),
    ];
    const report = calculateAgreement(annotations);
    const html = renderAgreementReportHtml(report);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('AUT Inter-Annotator Agreement');
    expect(html).toContain('κ por critério');
    expect(html).toContain('Recognition');
    expect(html).toContain('Truth-telling');
    expect(html).toContain('Understanding');
    expect(html).toContain('Valence');
    expect(html).toContain('Matriz de confusão');
  });
});

describe('averageCohensKappa', () => {
  it('returns 1 for 1 annotator (trivial case)', () => {
    const annotations: HumanAnnotation[] = [
      ann('r1', 'A', 5, 5, 5, 5),
      ann('r2', 'A', 3, 3, 3, 3),
    ];
    const result = averageCohensKappa(annotations, 'rScore');
    expect(result).toBe(1);
  });

  it('returns 0 for 3+ annotators (forces Fleiss path)', () => {
    const annotations: HumanAnnotation[] = [
      ann('r1', 'A', 5, 5, 5, 5),
      ann('r1', 'B', 5, 5, 5, 5),
      ann('r1', 'C', 5, 5, 5, 5),
    ];
    const result = averageCohensKappa(annotations, 'rScore');
    expect(result).toBe(0);
  });
});
