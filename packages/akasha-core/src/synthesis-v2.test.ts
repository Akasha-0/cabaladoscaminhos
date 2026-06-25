/**
 * synthesis-v2.test.ts — Tests for Wave 16.5 Synthesis Engine 2.0 (POC).
 *
 * Coverage:
 *  - Happy path com 1 Pilar
 *  - Happy path com 5 Pilares (cenário v1 baseline)
 *  - Happy path com 7 Pilares (v2 baseline com Human Design + Gene Keys)
 *  - Happy path com 10 Pilares (limite do union atual)
 *  - Priorização (primary é o de maior peso)
 *  - Conflict detection (declared)
 *  - Conflict detection (polarity heuristic)
 *  - Conflitos declarados não duplicam conflitos heurísticos
 *  - Pilares com peso 0 são tratados como ausentes
 *  - synthesizeV2FromRecord com nulls
 *  - Validação (empty array, weight inválido, pilar inválido, etc.)
 *  - Citações estruturadas para o Mentor LLM
 *  - extractSymbol (helper privado testado indiretamente via citations)
 */
import { describe, expect, it } from 'vitest';
import {
  synthesizeV2,
  synthesizeV2FromRecord,
  PILARES,
  PILAR_LABELS,
  SynthesisV2Error,
  type Pilar,
  type PilarInsight,
} from './synthesis-v2';

function makeInsight(overrides: Partial<PilarInsight> & Pick<PilarInsight, 'pilar'>): PilarInsight {
  return {
    weight: 1.0,
    summary: `Summary for ${overrides.pilar}`,
    recommendation: `Recommendation for ${overrides.pilar}`,
    ...overrides,
  };
}

describe('synthesizeV2 — happy path', () => {
  it('handles a single pilar correctly', () => {
    const result = synthesizeV2([makeInsight({ pilar: 'cabala', weight: 1.0 })]);
    expect(result.primary.pilar).toBe('cabala');
    expect(result.primary.rank).toBe(1);
    expect(result.secondary).toHaveLength(0);
    expect(result.conflicts).toHaveLength(0);
    expect(result.integration.activePilarCount).toBe(1);
    expect(result.integration.absentPilarCount).toBe(PILARES.length - 1);
    expect(result.metadata.totalWeight).toBe(1.0);
    expect(result.metadata.absentPilares).toEqual(
      expect.arrayContaining(['astrologia', 'tantra', 'iching', 'humandesign', 'genekeys']),
    );
  });

  it('handles 5 pilares (v1 baseline scenario)', () => {
    const result = synthesizeV2([
      makeInsight({ pilar: 'cabala', weight: 0.9 }),
      makeInsight({ pilar: 'astrologia', weight: 0.7 }),
      makeInsight({ pilar: 'tantra', weight: 0.6 }),
      makeInsight({ pilar: 'odus', weight: 0.5 }),
      makeInsight({ pilar: 'iching', weight: 0.4 }),
    ]);
    expect(result.primary.pilar).toBe('cabala');
    expect(result.secondary.map((s) => s.pilar)).toEqual([
      'astrologia',
      'tantra',
      'odus',
      'iching',
    ]);
    expect(result.conflicts).toHaveLength(0);
    expect(result.integration.activePilarCount).toBe(5);
    expect(result.integration.aggregatedSummary).toContain('Cabala');
    expect(result.integration.aggregatedSummary).toContain('I Ching');
  });

  it('handles 7 pilares (v2 baseline: 5 + Human Design + Gene Keys)', () => {
    const result = synthesizeV2([
      makeInsight({ pilar: 'cabala', weight: 0.8 }),
      makeInsight({ pilar: 'astrologia', weight: 0.7 }),
      makeInsight({ pilar: 'tantra', weight: 0.5 }),
      makeInsight({ pilar: 'odus', weight: 0.5 }),
      makeInsight({ pilar: 'iching', weight: 0.6 }),
      makeInsight({ pilar: 'humandesign', weight: 0.9 }),
      makeInsight({ pilar: 'genekeys', weight: 0.85 }),
    ]);
    expect(result.primary.pilar).toBe('humandesign');
    expect(result.secondary[0]?.pilar).toBe('genekeys');
    expect(result.secondary).toHaveLength(6);
    expect(result.integration.activePilarCount).toBe(7);
  });

  it('handles all 10 pilares (full union)', () => {
    const result = synthesizeV2(
      PILARES.map((p, i) =>
        makeInsight({ pilar: p, weight: (PILARES.length - i) / PILARES.length }),
      ),
    );
    expect(result.primary.pilar).toBe(PILARES[0]); // cabala has highest weight
    expect(result.secondary).toHaveLength(9);
    expect(result.integration.absentPilarCount).toBe(0);
    expect(result.metadata.absentPilares).toEqual([]);
  });
});

describe('synthesizeV2 — prioritization', () => {
  it('primary is always the highest-weight pilar', () => {
    const result = synthesizeV2([
      makeInsight({ pilar: 'iching', weight: 0.2 }),
      makeInsight({ pilar: 'cabala', weight: 0.95 }),
      makeInsight({ pilar: 'tantra', weight: 0.5 }),
    ]);
    expect(result.primary.pilar).toBe('cabala');
  });

  it('tie-breaker: equal weights keep input order via stable sort', () => {
    const result = synthesizeV2([
      makeInsight({ pilar: 'iching', weight: 0.5 }),
      makeInsight({ pilar: 'cabala', weight: 0.5 }),
    ]);
    // Same weight — both rank, primary is whichever comes first in input
    expect(result.primary.pilar).toBe('iching');
    expect(result.secondary[0]?.pilar).toBe('cabala');
  });

  it('secondary excludes primary and keeps rank order', () => {
    const result = synthesizeV2([
      makeInsight({ pilar: 'cabala', weight: 0.9, summary: 'A' }),
      makeInsight({ pilar: 'iching', weight: 0.7, summary: 'B' }),
      makeInsight({ pilar: 'tantra', weight: 0.5, summary: 'C' }),
    ]);
    expect(result.primary.insight.summary).toBe('A');
    expect(result.secondary[0]?.rank).toBe(2);
    expect(result.secondary[0]?.insight.summary).toBe('B');
    expect(result.secondary[1]?.rank).toBe(3);
    expect(result.secondary[1]?.insight.summary).toBe('C');
  });
});

describe('synthesizeV2 — conflict detection', () => {
  it('detects declared conflicts via conflictWith', () => {
    const result = synthesizeV2([
      makeInsight({
        pilar: 'cabala',
        weight: 0.8,
        conflictWith: ['tantra'],
      }),
      makeInsight({ pilar: 'tantra', weight: 0.6 }),
    ]);
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0]?.kind).toBe('declared');
    expect(result.conflicts[0]?.pilares).toEqual(['cabala', 'tantra']);
    expect(result.conflicts[0]?.description).toContain('Cabala');
    expect(result.conflicts[0]?.description).toContain('Tantra');
  });

  it('detects polarity-based conflicts (expansive vs contractive)', () => {
    const result = synthesizeV2([
      makeInsight({
        pilar: 'astrologia',
        weight: 0.7,
        polarity: 'expansive',
        recommendation: 'Avançar e tomar a iniciativa',
      }),
      makeInsight({
        pilar: 'tantra',
        weight: 0.5,
        polarity: 'contractive',
        recommendation: 'Recolher-se e esperar o momento certo',
      }),
    ]);
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0]?.kind).toBe('polarity');
    expect(result.conflicts[0]?.pilares).toEqual(['astrologia', 'tantra']);
  });

  it('does NOT flag conflict when both polarities agree', () => {
    const result = synthesizeV2([
      makeInsight({ pilar: 'astrologia', weight: 0.7, polarity: 'expansive' }),
      makeInsight({ pilar: 'tantra', weight: 0.5, polarity: 'expansive' }),
    ]);
    expect(result.conflicts).toHaveLength(0);
  });

  it('does NOT flag conflict when one polarity is neutral', () => {
    const result = synthesizeV2([
      makeInsight({ pilar: 'astrologia', weight: 0.7, polarity: 'expansive' }),
      makeInsight({ pilar: 'tantra', weight: 0.5, polarity: 'neutral' }),
    ]);
    expect(result.conflicts).toHaveLength(0);
  });

  it('declared conflicts do not duplicate polarity conflicts', () => {
    const result = synthesizeV2([
      makeInsight({
        pilar: 'cabala',
        weight: 0.8,
        polarity: 'expansive',
        conflictWith: ['tantra'],
      }),
      makeInsight({
        pilar: 'tantra',
        weight: 0.6,
        polarity: 'contractive',
      }),
    ]);
    // Should be exactly 1 conflict (declared wins; polarity skipped to avoid dup)
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0]?.kind).toBe('declared');
  });

  it('does NOT infer conflict when neither declared nor opposite-polarity', () => {
    const result = synthesizeV2([
      makeInsight({ pilar: 'cabala', weight: 0.8 }),
      makeInsight({ pilar: 'tantra', weight: 0.6 }),
    ]);
    expect(result.conflicts).toHaveLength(0);
  });

  it('treats declared conflicts with absent pilares as non-conflict', () => {
    const result = synthesizeV2([
      makeInsight({
        pilar: 'cabala',
        weight: 0.8,
        conflictWith: ['tantra'], // tantra is NOT in the input
      }),
    ]);
    // tantra is absent → no real conflict to surface
    expect(result.conflicts).toHaveLength(0);
  });
});

describe('synthesizeV2 — missing/absent pillars', () => {
  it('pillars with weight 0 are treated as absent', () => {
    const result = synthesizeV2([
      makeInsight({ pilar: 'cabala', weight: 0.8 }),
      makeInsight({ pilar: 'iching', weight: 0.0, summary: 'should be absent' }),
    ]);
    expect(result.integration.activePilarCount).toBe(1);
    expect(result.integration.absentPilarCount).toBe(PILARES.length - 1);
    expect(result.metadata.absentPilares).toContain('iching');
  });

  it('absentPilares lists every Pilar not contributing', () => {
    const result = synthesizeV2([
      makeInsight({ pilar: 'cabala', weight: 1.0 }),
      makeInsight({ pilar: 'astrologia', weight: 0.5 }),
    ]);
    expect(result.metadata.absentPilares).toHaveLength(PILARES.length - 2);
    expect(result.metadata.absentPilares).toContain('tantra');
    expect(result.metadata.absentPilares).toContain('odus');
    expect(result.metadata.absentPilares).toContain('iching');
    expect(result.metadata.absentPilares).toContain('humandesign');
    expect(result.metadata.absentPilares).toContain('genekeys');
  });
});

describe('synthesizeV2 — integration skeleton', () => {
  it('aggregatedSummary uses Portuguese labels and joins with " | "', () => {
    const result = synthesizeV2([
      makeInsight({ pilar: 'cabala', weight: 0.9, summary: 'LP 7' }),
      makeInsight({ pilar: 'iching', weight: 0.7, summary: 'Hex 1' }),
    ]);
    expect(result.integration.aggregatedSummary).toBe('Cabala: LP 7 | I Ching: Hex 1');
  });

  it('rankedRecommendations preserve ranking order', () => {
    const result = synthesizeV2([
      makeInsight({ pilar: 'iching', weight: 0.3, recommendation: 'low' }),
      makeInsight({ pilar: 'cabala', weight: 0.9, recommendation: 'high' }),
    ]);
    expect(result.integration.rankedRecommendations[0]).toBe('Cabala → high');
    expect(result.integration.rankedRecommendations[1]).toBe('I Ching → low');
  });

  it('citations include symbol extracted from summary', () => {
    const result = synthesizeV2([
      makeInsight({
        pilar: 'cabala',
        weight: 0.9,
        summary: 'Life Path 7 — investigador espiritual',
      }),
      makeInsight({
        pilar: 'iching',
        weight: 0.7,
        summary: 'Hexagrama 26 — Grande Domínio',
      }),
    ]);
    const cabalaCitation = result.integration.citations.find(
      (c) => c.pilar === 'cabala',
    );
    expect(cabalaCitation?.symbol).toBe('Life Path 7');
    const ichingCitation = result.integration.citations.find(
      (c) => c.pilar === 'iching',
    );
    expect(ichingCitation?.symbol).toBe('Hexagrama 26');
  });

  it('citations include label and weight', () => {
    const result = synthesizeV2([
      makeInsight({ pilar: 'cabala', weight: 0.75 }),
    ]);
    expect(result.integration.citations[0]).toEqual({
      pilar: 'cabala',
      label: 'Cabala',
      symbol: undefined,
      weight: 0.75,
    });
  });
});

describe('synthesizeV2 — validation errors', () => {
  it('throws on empty array', () => {
    expect(() => synthesizeV2([])).toThrow(SynthesisV2Error);
    expect(() => synthesizeV2([])).toThrow(/at least 1 PilarInsight/);
  });

  it('throws on invalid weight (negative)', () => {
    expect(() =>
      synthesizeV2([makeInsight({ pilar: 'cabala', weight: -0.1 })]),
    ).toThrow(/weight/);
  });

  it('throws on invalid weight (above 1)', () => {
    expect(() =>
      synthesizeV2([makeInsight({ pilar: 'cabala', weight: 1.5 })]),
    ).toThrow(/weight/);
  });

  it('throws on invalid pilar identifier', () => {
    expect(() =>
      synthesizeV2([
        makeInsight({ pilar: 'invalid-pilar' as unknown as Pilar }),
      ]),
    ).toThrow(/pilar is invalid/);
  });

  it('throws on empty summary', () => {
    expect(() =>
      synthesizeV2([
        makeInsight({ pilar: 'cabala', summary: '' }),
      ]),
    ).toThrow(/summary/);
  });

  it('throws on empty recommendation', () => {
    expect(() =>
      synthesizeV2([
        makeInsight({ pilar: 'cabala', recommendation: '' }),
      ]),
    ).toThrow(/recommendation/);
  });

  it('throws on invalid polarity value', () => {
    expect(() =>
      synthesizeV2([
        makeInsight({
          pilar: 'cabala',
          polarity: 'sideways' as unknown as PilarInsight['polarity'],
        }),
      ]),
    ).toThrow(/polarity/);
  });

  it('throws on invalid conflictWith (not an array)', () => {
    expect(() =>
      synthesizeV2([
        makeInsight({
          pilar: 'cabala',
          conflictWith: 'tantra' as unknown as Pilar[],
        }),
      ]),
    ).toThrow(/conflictWith/);
  });

  it('throws on invalid conflictWith (contains invalid pilar)', () => {
    expect(() =>
      synthesizeV2([
        makeInsight({
          pilar: 'cabala',
          conflictWith: ['invalid-pilar' as unknown as Pilar],
        }),
      ]),
    ).toThrow(/conflictWith/);
  });
});

describe('synthesizeV2FromRecord — record-shape convenience', () => {
  it('accepts a partial record with nulls and only includes present insights', () => {
    const result = synthesizeV2FromRecord({
      cabala: makeInsight({ pilar: 'cabala', weight: 0.8 }),
      astrologia: null,
      tantra: makeInsight({ pilar: 'tantra', weight: 0.5 }),
      odus: null,
      iching: null,
      humandesign: null,
      genekeys: null,
    });
    expect(result.integration.activePilarCount).toBe(2);
    expect(result.primary.pilar).toBe('cabala');
  });

  it('preserves the pilar from the record key over the insight.pilar', () => {
    // Defensive: even if the caller passes a wrong pilar field, the
    // record key is authoritative.
    const result = synthesizeV2FromRecord({
      cabala: makeInsight({ pilar: 'tantra', weight: 0.9 }), // mislabeled
    });
    expect(result.primary.pilar).toBe('cabala'); // record key wins
  });

  it('throws if all entries are null', () => {
    expect(() =>
      synthesizeV2FromRecord({
        cabala: null,
        iching: null,
      }),
    ).toThrow(SynthesisV2Error);
  });
});

describe('synthesizeV2 — Human Design + Gene Keys integration scenario', () => {
  // Cenário representativo do Wave 16: como Wave 16.1 (HD) e 16.2 (GK)
  // vão plugar no engine v2. O Pilar 6 (HD) emite PilarInsight tipado;
  // o Pilar 7 (GK) também. Eles entram como entries do array — o engine
  // v2 não precisa saber que vêm de packages separados.
  it('integrates Human Design (Pilar 6) + Gene Keys (Pilar 7) as first-class pilares', () => {
    const result = synthesizeV2([
      makeInsight({
        pilar: 'cabala',
        weight: 0.7,
        summary: 'Life Path 5 — buscador de liberdade',
        recommendation: 'Permitir variedade de experiências',
        frequency: 'gift',
      }),
      makeInsight({
        pilar: 'humandesign',
        weight: 0.85,
        summary: 'Generator 2/4 — resposta sacral',
        recommendation: 'Esperar o chamado antes de agir',
        frequency: 'gift',
        polarity: 'contractive',
      }),
      makeInsight({
        pilar: 'genekeys',
        weight: 0.8,
        summary: 'Gene Key 25: Sombra Prisão → Dom Aceitação → Siddhi Universalidade',
        recommendation: 'Curar a prisão interna pelo cultivo de aceitação incondicional',
        frequency: 'shadow',
        polarity: 'expansive',
      }),
    ]);
    // HD has highest weight
    expect(result.primary.pilar).toBe('humandesign');
    // GK is second
    expect(result.secondary[0]?.pilar).toBe('genekeys');
    // Cabala third
    expect(result.secondary[1]?.pilar).toBe('cabala');
    // Conflict: HD contractive vs GK expansive → polarity conflict
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts[0]?.kind).toBe('polarity');
    expect(result.conflicts[0]?.pilares).toEqual(['humandesign', 'genekeys']);
  });
});

describe('PILARES & PILAR_LABELS — public constants', () => {
  it('PILARES includes all current pillars', () => {
    expect(PILARES).toContain('cabala');
    expect(PILARES).toContain('astrologia');
    expect(PILARES).toContain('tantra');
    expect(PILARES).toContain('odus');
    expect(PILARES).toContain('iching');
    expect(PILARES).toContain('humandesign');
    expect(PILARES).toContain('genekeys');
  });

  it('PILAR_LABELS has an entry for every Pilar', () => {
    for (const p of PILARES) {
      expect(PILAR_LABELS[p]).toBeTruthy();
      expect(typeof PILAR_LABELS[p]).toBe('string');
    }
  });

  it('labels are in Portuguese (BR)', () => {
    expect(PILAR_LABELS.cabala).toBe('Cabala');
    expect(PILAR_LABELS.astrologia).toBe('Astrologia');
    expect(PILAR_LABELS.tantra).toBe('Tantra');
    expect(PILAR_LABELS.humandesign).toBe('Human Design');
    expect(PILAR_LABELS.genekeys).toBe('Gene Keys');
  });
});
