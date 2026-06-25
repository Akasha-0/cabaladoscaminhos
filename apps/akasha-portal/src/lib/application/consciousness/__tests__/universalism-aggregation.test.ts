/**
 * Tests — consciousness/universalism-aggregation.ts (Wave 28.7)
 *
 * Coverage (lesson N+24 — tests co-located):
 *   1. extractPilarBreakdown — shape 1 (objeto direto)
 *   2. extractPilarBreakdown — shape 2 (items array)
 *   3. extractPilarBreakdown — shape inválido → defaults
 *   4. dominantPilar — único dominante → esse pilar
 *   5. dominantPilar — empate → 'cross'
 *   6. dominantPilar — todos zero → 'cross'
 *   7. computeConvergenceClusters — 6 entries sempre, agregação correta
 *   8. computeConvergenceClusters — jobs sem insights ignorados
 *   9. computeFeedbackTrends — ratio correto, zeros onde vazio
 *  10. computeFeedbackTrends — fora da janela ignorado
 *  11. computeTopInsights — ordenação por insightsGenerated → papers → date
 *  12. computeTopInsights — só SUCCESS com insightsGenerated > 0
 *  13. computeTopInsights — limit respeitado
 *  14. computePilarDistribution — soma breakdowns
 *  15. computePilarDistribution — sempre 6 entries
 *  16. computeTopPapersCited — ordenação, filter papers=0, limit
 *  17. determinístico — mesma input → mesma output
 *  18. inputs vazios — todos retornam shape válido
 */

import { describe, it, expect } from 'vitest';

import {
  computeConvergenceClusters,
  computeFeedbackTrends,
  computePilarDistribution,
  computeTopInsights,
  computeTopPapersCited,
  DEFAULT_PILAR_BREAKDOWN,
  dominantPilar,
  extractPilarBreakdown,
  PILAR_KEYS,
  type FeedbackEventLite,
  type InsightJobLite,
} from '../universalism-aggregation';

// ─── Fixtures ────────────────────────────────────────────────────────────

const job = (
  id: string,
  startedAt: Date,
  insights: number,
  papers: number,
  windowSpec: unknown = null,
  status = 'SUCCESS'
): InsightJobLite => ({
  id,
  startedAt,
  status,
  insightsGenerated: insights,
  papersCited: papers,
  windowSpec,
});

const evt = (
  rating: number,
  createdAt: Date,
  targetType = 'DISCOVERY'
): FeedbackEventLite => ({ rating, targetType, createdAt });

// ─── extractPilarBreakdown ───────────────────────────────────────────────

describe('extractPilarBreakdown', () => {
  it('shape 1: objeto direto { pilarBreakdown: { cabala: 2 } }', () => {
    const out = extractPilarBreakdown({
      pilarBreakdown: { cabala: 2, astrologia: 1 },
    });
    expect(out.cabala).toBe(2);
    expect(out.astrologia).toBe(1);
    expect(out.tantra).toBe(0);
    expect(out.iching).toBe(0);
  });

  it('shape 2: items array [{ pilar, count }]', () => {
    const out = extractPilarBreakdown({
      items: [
        { pilar: 'cabala', count: 3 },
        { pilar: 'tantra', count: 1 },
      ],
    });
    expect(out.cabala).toBe(3);
    expect(out.tantra).toBe(1);
    expect(out.astrologia).toBe(0);
  });

  it('shape inválido → defaults (todos zero)', () => {
    expect(extractPilarBreakdown(null)).toEqual(DEFAULT_PILAR_BREAKDOWN);
    expect(extractPilarBreakdown(undefined)).toEqual(DEFAULT_PILAR_BREAKDOWN);
    expect(extractPilarBreakdown('lixo')).toEqual(DEFAULT_PILAR_BREAKDOWN);
    expect(extractPilarBreakdown(42)).toEqual(DEFAULT_PILAR_BREAKDOWN);
    expect(extractPilarBreakdown({})).toEqual(DEFAULT_PILAR_BREAKDOWN);
    expect(extractPilarBreakdown({ items: 'não-array' })).toEqual(
      DEFAULT_PILAR_BREAKDOWN
    );
  });

  it('ignora chaves desconhecidas em pilarBreakdown', () => {
    const out = extractPilarBreakdown({
      pilarBreakdown: { cabala: 1, foo: 999, bar: 'baz' },
    });
    expect(out.cabala).toBe(1);
    expect((out as Record<string, unknown>).foo).toBeUndefined();
  });

  it('clampa valores negativos para zero', () => {
    const out = extractPilarBreakdown({
      pilarBreakdown: { cabala: -5, astrologia: 2 },
    });
    expect(out.cabala).toBe(0);
    expect(out.astrologia).toBe(2);
  });
});

// ─── dominantPilar ───────────────────────────────────────────────────────

describe('dominantPilar', () => {
  it('único dominante', () => {
    expect(
      dominantPilar({ cabala: 3, astrologia: 1, tantra: 0, odu: 0, iching: 0, cross: 0 })
    ).toBe('cabala');
  });

  it('empate no topo → cross', () => {
    expect(
      dominantPilar({ cabala: 2, astrologia: 2, tantra: 0, odu: 0, iching: 0, cross: 0 })
    ).toBe('cross');
  });

  it('todos zero → cross', () => {
    expect(dominantPilar(DEFAULT_PILAR_BREAKDOWN)).toBe('cross');
  });

  it('3-way tie → cross', () => {
    expect(
      dominantPilar({ cabala: 1, astrologia: 1, tantra: 1, odu: 0, iching: 0, cross: 0 })
    ).toBe('cross');
  });
});

// ─── computeConvergenceClusters ──────────────────────────────────────────

describe('computeConvergenceClusters', () => {
  it('sempre retorna 6 clusters (5 Pilares + cross)', () => {
    const out = computeConvergenceClusters([]);
    expect(out).toHaveLength(6);
    expect(out.map((c) => c.pilar)).toEqual([...PILAR_KEYS]);
  });

  it('agrega corretamente por pilar-dominante', () => {
    const jobs = [
      job('j1', new Date('2026-06-20T10:00:00Z'), 3, 5, {
        pilarBreakdown: { cabala: 3, astrologia: 0, tantra: 0, odu: 0, iching: 0 },
      }),
      job('j2', new Date('2026-06-21T10:00:00Z'), 2, 4, {
        pilarBreakdown: { cabala: 1, astrologia: 2, tantra: 0, odu: 0, iching: 0 },
      }),
      // j2 tem astrologia dominante (2 > 1)
      job('j3', new Date('2026-06-22T10:00:00Z'), 5, 10, {
        pilarBreakdown: { cabala: 2, astrologia: 2, tantra: 0, odu: 0, iching: 0 },
      }),
      // j3: empate cabala=astrologia=2 → cross
    ];
    const out = computeConvergenceClusters(jobs);
    expect(out.find((c) => c.pilar === 'cabala')).toMatchObject({
      count: 3,
      jobCount: 1,
    });
    expect(out.find((c) => c.pilar === 'astrologia')).toMatchObject({
      count: 2,
      jobCount: 1,
    });
    expect(out.find((c) => c.pilar === 'cross')).toMatchObject({
      count: 5,
      jobCount: 1,
    });
  });

  it('ignora jobs com insightsGenerated = 0', () => {
    const jobs = [
      job('j1', new Date('2026-06-20'), 0, 5, {
        pilarBreakdown: { cabala: 5 },
      }),
      job('j2', new Date('2026-06-21'), 2, 1, {
        pilarBreakdown: { cabala: 2 },
      }),
    ];
    const out = computeConvergenceClusters(jobs);
    expect(out.find((c) => c.pilar === 'cabala')?.count).toBe(2);
  });

  it('avgPapersPerInsight = papersTotal / count', () => {
    const jobs = [
      job('j1', new Date('2026-06-20'), 4, 8, {
        pilarBreakdown: { cabala: 4 },
      }),
    ];
    const out = computeConvergenceClusters(jobs);
    expect(out.find((c) => c.pilar === 'cabala')?.avgPapersPerInsight).toBe(2);
  });

  it('avgPapersPerInsight = 0 quando count = 0', () => {
    const out = computeConvergenceClusters([]);
    for (const c of out) {
      expect(c.avgPapersPerInsight).toBe(0);
    }
  });
});

// ─── computeFeedbackTrends ───────────────────────────────────────────────

describe('computeFeedbackTrends', () => {
  it('retorna sempre `days` entries', () => {
    expect(computeFeedbackTrends([], 30)).toHaveLength(30);
    expect(computeFeedbackTrends([], 7)).toHaveLength(7);
  });

  it('conta up (rating ≥ 4) vs down (rating ≤ 2), ignora neutro (3)', () => {
    const today = new Date();
    const events = [
      evt(5, today),
      evt(4, today),
      evt(1, today),
      evt(3, today), // neutro
      evt(2, today),
    ];
    const out = computeFeedbackTrends(events, 1);
    const lastDay = out[out.length - 1];
    expect(lastDay.upCount).toBe(2);
    expect(lastDay.downCount).toBe(2);
    expect(lastDay.ratio).toBe(0.5);
  });

  it('ratio = 0 quando sem votos', () => {
    const today = new Date();
    const events = [evt(3, today)]; // neutro não conta
    const out = computeFeedbackTrends(events, 1);
    expect(out[out.length - 1].ratio).toBe(0);
  });

  it('ignora eventos fora da janela', () => {
    const tooOld = new Date(Date.now() - 100 * 86400000);
    const recent = new Date(Date.now() - 5 * 86400000);
    const events = [
      evt(5, tooOld), // > 30 dias
      evt(5, recent), // dentro
    ];
    const out = computeFeedbackTrends(events, 30);
    // nenhum evento mapeado no today, mas o recent mapeado em -5d
    const totalUp = out.reduce((s, d) => s + d.upCount, 0);
    expect(totalUp).toBe(1);
  });
});

// ─── computeTopInsights ──────────────────────────────────────────────────

describe('computeTopInsights', () => {
  it('ordenação: insightsGenerated desc → papersCited desc → date desc', () => {
    const older = new Date('2026-06-10');
    const newer = new Date('2026-06-20');
    const jobs = [
      job('a', older, 5, 1, null),
      job('b', newer, 5, 10, null), // mesmo insights, mais papers
      job('c', newer, 10, 0, null), // mais insights
    ];
    const out = computeTopInsights(jobs);
    expect(out[0].id).toBe('c'); // 10 insights
    expect(out[1].id).toBe('b'); // 5 insights + 10 papers > 1 paper
    expect(out[2].id).toBe('a');
  });

  it('só SUCCESS com insightsGenerated > 0', () => {
    const jobs = [
      job('running', new Date(), 3, 1, null, 'RUNNING'),
      job('failed', new Date(), 3, 1, null, 'FAILED'),
      job('zero', new Date(), 0, 5, null),
      job('ok', new Date(), 1, 0, null),
    ];
    const out = computeTopInsights(jobs);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('ok');
  });

  it('limit respeitado', () => {
    const jobs = Array.from({ length: 30 }, (_, i) =>
      job(`j${i}`, new Date(Date.now() - i * 86400000), 30 - i, 0)
    );
    expect(computeTopInsights(jobs)).toHaveLength(10);
    expect(computeTopInsights(jobs, 3)).toHaveLength(3);
  });

  it('shape de output: id, headline, truth, confidence, tags, generatedAt', () => {
    const jobs = [job('x', new Date('2026-06-20'), 1, 0)];
    const out = computeTopInsights(jobs);
    expect(out[0]).toHaveProperty('id');
    expect(out[0]).toHaveProperty('headline');
    expect(out[0]).toHaveProperty('truth');
    expect(out[0]).toHaveProperty('confidence');
    expect(out[0]).toHaveProperty('tags');
    expect(out[0]).toHaveProperty('generatedAt');
    expect(out[0].tags).toContain('cross-pilar');
    expect(typeof out[0].confidence).toBe('number');
  });

  it('confidence alto quando papersCited > 0', () => {
    const withPapers = computeTopInsights([
      job('p', new Date(), 1, 5, null),
    ]);
    expect(withPapers[0].confidence).toBe(0.7);
    const noPapers = computeTopInsights([
      job('n', new Date(), 1, 0, null),
    ]);
    expect(noPapers[0].confidence).toBe(0.4);
  });
});

// ─── computePilarDistribution ────────────────────────────────────────────

describe('computePilarDistribution', () => {
  it('sempre 6 entries', () => {
    expect(computePilarDistribution([])).toHaveLength(6);
  });

  it('agrega discoveries POR pilar (um job pode contribuir a vários)', () => {
    const jobs = [
      job('j1', new Date('2026-06-20'), 5, 3, {
        pilarBreakdown: { cabala: 3, astrologia: 2, tantra: 0, odu: 0, iching: 0 },
      }),
      job('j2', new Date('2026-06-21'), 4, 7, {
        pilarBreakdown: { cabala: 1, astrologia: 1, tantra: 2, odu: 0, iching: 0 },
      }),
    ];
    const out = computePilarDistribution(jobs);
    expect(out.find((d) => d.pilar === 'cabala')?.discoveries).toBe(4); // 3+1
    expect(out.find((d) => d.pilar === 'astrologia')?.discoveries).toBe(3); // 2+1
    expect(out.find((d) => d.pilar === 'tantra')?.discoveries).toBe(2);
    expect(out.find((d) => d.pilar === 'odu')?.discoveries).toBe(0);
  });

  it('papersCited atribuído ao pilar-dominante apenas', () => {
    const jobs = [
      job('j1', new Date(), 4, 10, {
        pilarBreakdown: { cabala: 4, astrologia: 0, tantra: 0, odu: 0, iching: 0 },
      }),
    ];
    const out = computePilarDistribution(jobs);
    expect(out.find((d) => d.pilar === 'cabala')?.papersCited).toBe(10);
    expect(out.find((d) => d.pilar === 'astrologia')?.papersCited).toBe(0);
  });

  it('ignora jobs com insightsGenerated = 0', () => {
    const jobs = [
      job('zero', new Date(), 0, 5, {
        pilarBreakdown: { cabala: 5 },
      }),
    ];
    const out = computePilarDistribution(jobs);
    expect(out.find((d) => d.pilar === 'cabala')?.discoveries).toBe(0);
  });
});

// ─── computeTopPapersCited ──────────────────────────────────────────────

describe('computeTopPapersCited', () => {
  it('ordenação papersCited desc → date desc', () => {
    const older = new Date('2026-06-10');
    const newer = new Date('2026-06-20');
    const jobs = [
      job('a', older, 0, 5),
      job('b', newer, 0, 10), // mais papers
      job('c', newer, 0, 10), // mesmo papers, mesmo date
      job('d', newer, 0, 1),
    ];
    const out = computeTopPapersCited(jobs);
    expect(out[0].papersCited).toBe(10);
    expect(out[1].papersCited).toBe(10);
    expect(out[3].papersCited).toBe(1);
  });

  it('ignora jobs com papersCited = 0', () => {
    const jobs = [
      job('zero', new Date(), 1, 0),
      job('one', new Date(), 1, 1),
    ];
    const out = computeTopPapersCited(jobs);
    expect(out).toHaveLength(1);
    expect(out[0].jobId).toBe('one');
  });

  it('limit respeitado', () => {
    const jobs = Array.from({ length: 20 }, (_, i) =>
      job(`j${i}`, new Date(Date.now() - i * 86400000), 1, 20 - i)
    );
    expect(computeTopPapersCited(jobs)).toHaveLength(10);
  });
});

// ─── Determinismo ────────────────────────────────────────────────────────

describe('determinismo', () => {
  it('computeConvergenceClusters é determinístico', () => {
    const jobs = [
      job('a', new Date('2026-06-20'), 1, 1, { pilarBreakdown: { cabala: 1 } }),
      job('b', new Date('2026-06-21'), 2, 2, { pilarBreakdown: { astrologia: 2 } }),
    ];
    const r1 = computeConvergenceClusters(jobs);
    const r2 = computeConvergenceClusters(jobs);
    expect(r1).toEqual(r2);
  });

  it('computeTopInsights é determinístico', () => {
    const jobs = [
      job('a', new Date('2026-06-20'), 3, 1, null),
      job('b', new Date('2026-06-21'), 3, 1, null),
    ];
    const r1 = computeTopInsights(jobs);
    const r2 = computeTopInsights(jobs);
    expect(r1).toEqual(r2);
  });
});

// ─── Inputs vazios ──────────────────────────────────────────────────────

describe('inputs vazios', () => {
  it('todos os helpers retornam shape válido para []', () => {
    expect(computeConvergenceClusters([])).toHaveLength(6);
    expect(computeFeedbackTrends([])).toHaveLength(30);
    expect(computeTopInsights([])).toEqual([]);
    expect(computePilarDistribution([])).toHaveLength(6);
    expect(computeTopPapersCited([])).toEqual([]);
  });
});
