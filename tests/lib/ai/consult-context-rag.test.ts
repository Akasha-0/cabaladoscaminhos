// ============================================================
// RAG-CLOSED CONSULT SYSTEM TESTS
// AD-19.4 Invariant 6 / Doc 12 §5
// ============================================================
// Verifies that the consult engine never hallucinates and
// uses ONLY data from the reading's matrixData.
// ============================================================

import { describe, it, expect } from 'vitest';
import { buildConsultSystemPrompt, buildConsultContext } from '@/lib/ai/dossier/consult-context';
import { routeQuestion } from '@/lib/ai/theme-router';
import type { ClientMaps } from '@/lib/ai/dossier/oracle-prompt-builder';

// ============================================================
// TEST 1: buildConsultSystemPrompt never asks for external knowledge
// AD-19.4 Invariant 6 / Doc 12 §5 — anti-alucination constraints
// ============================================================

describe('buildConsultSystemPrompt — anti-alucination constraints', () => {
  it('contains EXCLUSIVAMENTE constraint anchoring to provided context', () => {
    const prompt = buildConsultSystemPrompt();
    expect(prompt.toLowerCase()).toContain('exclusivamente');
  });

  it('contains "nunca invente" or "não invente" anti-fabrication clause', () => {
    const prompt = buildConsultSystemPrompt().toLowerCase();
    const hasConstraint = prompt.includes('nunca invente') || prompt.includes('não invente');
    expect(hasConstraint).toBe(true);
  });

  it('contains "contexto fornecido" or equivalent grounding reference', () => {
    const prompt = buildConsultSystemPrompt().toLowerCase();
    const hasGrounding =
      prompt.includes('contexto fornecido') || prompt.includes('contexto');
    expect(hasGrounding).toBe(true);
  });
});

// ============================================================
// TEST 2: buildConsultContext only uses houses from matrixData
// Doc 12 §5 — drawnHouses and natalOnlyHouses separation
// ============================================================

/** Minimal ClientMaps needed by buildConsultContext — only astrologyMap.chart
 *  is required by normalizeBirthChart; other maps are unused here. */
function makeClientMaps(): ClientMaps {
  return {
    fullName: 'Test Consulente',
    birthDate: '1990-01-01',
    astrologyMap: {
      chart: { planeta: {}, casas: [], ascendente: 'aries' },
    },
  };
}

describe('buildConsultContext — matrixData boundary enforcement', () => {
  it('drawnHouses contains ONLY houses present in matrixData', () => {
    const mockMatrix: Record<string, { carta: number; odu: number }> = {
      '24': { carta: 24, odu: 5 },
      '34': { carta: 34, odu: 8 },
      '1': { carta: 1, odu: 1 },
    };

    // "amor" routes to house 24 (primary) + 25/29 (secondary)
    // Only 24 is in matrixData → drawnHouses must contain ONLY house 24
    const context = buildConsultContext(
      'sobre meu amor',
      makeClientMaps(),
      mockMatrix
    );

    const drawnHouseNumbers = context.drawnHouses.map((h) => h.casa_numero);

    // All drawn houses must be in matrixData keys
    for (const h of drawnHouseNumbers) {
      expect(mockMatrix[String(h)]).toBeDefined();
    }

    // House 24 must be present (it is in matrixData)
    expect(drawnHouseNumbers).toContain(24);
    // Houses 25/29 are secondary from amor taxonomy but NOT in matrixData
    // → they should be in natalOnlyHouses, NOT in drawnHouses
    expect(drawnHouseNumbers).not.toContain(25);
    expect(drawnHouseNumbers).not.toContain(29);
  });

  it('natalOnlyHouses contains only houses NOT in matrixData', () => {
    const mockMatrix: Record<string, { carta: number; odu: number }> = {
      '24': { carta: 24, odu: 5 },
      '34': { carta: 34, odu: 8 },
      '1': { carta: 1, odu: 1 },
    };

    // "dinheiro" routes to house 34 (primary, IS in matrixData)
    // + 15/2 (secondary, NOT in matrixData)
    const context = buildConsultContext(
      'sobre dinheiro e finanças',
      makeClientMaps(),
      mockMatrix
    );

    const drawnNums = context.drawnHouses.map((h) => h.casa_numero);

    // House 34 is in matrixData → must be in drawnHouses, NOT natalOnlyHouses
    expect(drawnNums).toContain(34);
    expect(context.natalOnlyHouses).not.toContain(34);

    // Houses 15 and 2 are NOT in matrixData → must be in natalOnlyHouses
    expect(context.natalOnlyHouses).toContain(15);
    expect(context.natalOnlyHouses).toContain(2);
  });
});

// ============================================================
// TEST 3: Excerpt only includes houses from matrixData
// Doc 12 §5 — dossierExcerpt filtering
// ============================================================

describe('buildConsultContext — dossierExcerpt isolation', () => {
  it('dossierExcerpt contains routed houses that have interpretations in report', () => {
    const mockMatrix: Record<string, { carta: number; odu: number }> = {
      '24': { carta: 24, odu: 5 },
      '34': { carta: 34, odu: 8 },
      '1': { carta: 1, odu: 1 },
    };

    const mockReport = {
      houses: {
        '24': { interpretation: 'Casa 24 texto...', houseName: 'O Coração' },
        '34': { interpretation: 'Casa 34 texto...', houseName: 'Os Peixes' },
      },
    };

    // "dinheiro e finanças" → dinero theme → houses [2, 15, 34]
    // Only house 34 is in BOTH matrixData AND has an interpretation → appears
    // Houses 2 and 15 are routed but have no interpretation → absent from excerpt
    const context = buildConsultContext(
      'sobre dinheiro e finanças',
      makeClientMaps(),
      mockMatrix,
      mockReport.houses
    );

    // House 34 is routed and has interpretation → present
    expect(context.dossierExcerpt).toContain('Casa 34');
    expect(context.dossierExcerpt).toContain('Os Peixes');

    // House 24 is NOT in routing (dinheiro routes to 34+15+2) → absent from excerpt
    expect(context.dossierExcerpt).not.toContain('Casa 24');
  });

  it('dossierExcerpt does NOT contain houses absent from report', () => {
    const mockMatrix: Record<string, { carta: number; odu: number }> = {
      '24': { carta: 24, odu: 5 },
      '34': { carta: 34, odu: 8 },
      '1': { carta: 1, odu: 1 },
    };

    // Report has houses 24 and 34, but NOT house 1
    const mockReport = {
      houses: {
        '24': { interpretation: 'Casa 24 texto...', houseName: 'O Coração' },
        '34': { interpretation: 'Casa 34 texto...', houseName: 'Os Peixes' },
      },
    };

    // "amor" routes to 24 + 25/29. House 24 is in report → appears.
    // Houses 25/29 are NOT in report → no excerpt for them.
    const context = buildConsultContext(
      'sobre meu amor',
      makeClientMaps(),
      mockMatrix,
      mockReport.houses
    );

    expect(context.dossierExcerpt).toContain('Casa 24');
    expect(context.dossierExcerpt).not.toContain('Casa 25');
    expect(context.dossierExcerpt).not.toContain('Casa 29');
  });
});

// ============================================================
// TEST 4: routeQuestion is deterministic
// Doc 12 §4 — same input always produces identical output
// ============================================================

describe('routeQuestion — deterministic behavior', () => {
  it('returns identical themes and houses for "amor" across multiple calls', () => {
    const filledHouses = [1, 7, 24, 34, 36];

    const call1 = routeQuestion('amor', filledHouses);
    const call2 = routeQuestion('amor', filledHouses);

    // Determinism: identical input → identical output across all fields
    expect(call1.themes).toEqual(call2.themes);
    expect(call1.houses).toEqual(call2.houses);
    expect(call1.natalAspects).toEqual(call2.natalAspects);

    // "amor" is deterministic: always resolves to 'amor' theme with house 24
    expect(call1.themes).toEqual(['amor']);
    expect(call1.houses).toContain(24);
  });
});

// ============================================================
// TEST 5: Unknown question falls back to "geral"
// Doc 12 §4 — fallback behavior for non-matching questions
// ============================================================

describe('routeQuestion — fallback to geral for unknown questions', () => {
  it('falls back to theme "geral" for nonsense question', () => {
    const filledHouses = [1, 24, 34, 36];
    const nonsense = 'xyz gibberish qwerty asdfhjkl';

    const result = routeQuestion(nonsense, filledHouses);

    expect(result.themes).toContain('geral');
    expect(result.themes).toHaveLength(1);
  });

  it('falls back to geral and returns filledHouses when no keyword matches', () => {
    const filledHouses = [1, 24, 34, 36];

    // Completely unrelated string
    const result = routeQuestion('kdfjghsdkjfghsdkjfhg', filledHouses);

    expect(result.themes).toContain('geral');
    // geral fallback uses the filled houses from the reading
    expect(result.houses).toEqual([1, 24, 34, 36]);
  });

  it('returns empty houses array when filledHouses is empty and no match', () => {
    const result = routeQuestion('xyz nonsense', []);

    expect(result.themes).toContain('geral');
    expect(result.houses).toEqual([]);
  });
});
