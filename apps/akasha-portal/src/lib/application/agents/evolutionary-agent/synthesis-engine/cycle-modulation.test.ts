/**
 * synthesis-engine/cycle-modulation.test.ts
 *
 * Test coverage for deriveCycleModulation:
 * - Year 1 alignment: missaoDestino, oriCabecaQuizilas, carreiraProsperidade get score 80
 * - Unknown year (not in map): all areas fall back to score 40
 * - Boundary: always returns exactly 6 area entries
 */

import { describe, it, expect } from 'vitest';
import { deriveCycleModulation } from './cycle-modulation';
import type { PersonalCycleSnapshot } from '@/lib/application/agents/personal-cycle-engine';

// ─── Fixture ────────────────────────────────────────────────────────────────────

function makeSnapshot(yearNum: number): PersonalCycleSnapshot {
  return {
    birthDate: '1990-05-15',
    currentDate: '2026-06-15',
    age: 36,
    lifePath: 11,
    personalDay: { number: 5, energy: 'change', keywords: [], theme: '' },
    personalMonth: { number: 6, theme: '' },
    personalYear: { number: yearNum, theme: `Ano pessoal ${yearNum}` },
    universalYear: { year: 2026, theme: '' },
    pinnacles: [{ number: 1, keyQuestion: '?' }],
    currentPinnacle: { number: 1, keyQuestion: '?' },
    challenges: [],
    karmicLessons: [],
    maturity: { number: 5 },
    synthesis: '',
    overallEnergy: 75,
  };
}

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('deriveCycleModulation', () => {
  it('year 1: aligned areas get score 80, others get 40', () => {
    const result = deriveCycleModulation(makeSnapshot(1));

    expect(result).toHaveLength(6);

    const areaMap = Object.fromEntries(result.map((r) => [r.area, r]));

    // Aligned areas → score 80, suggestedBoost 'increase'
    expect(areaMap['missaoDestino'].alignmentScore).toBe(80);
    expect(areaMap['missaoDestino'].suggestedBoost).toBe('increase');
    expect(areaMap['oriCabecaQuizilas'].alignmentScore).toBe(80);
    expect(areaMap['oriCabecaQuizilas'].suggestedBoost).toBe('increase');
    expect(areaMap['carreiraProsperidade'].alignmentScore).toBe(80);
    expect(areaMap['carreiraProsperidade'].suggestedBoost).toBe('increase');

    // Non-aligned areas → score 40, suggestedBoost 'decrease'
    expect(areaMap['vitalidadeEnergia'].alignmentScore).toBe(40);
    expect(areaMap['vitalidadeEnergia'].suggestedBoost).toBe('decrease');
    expect(areaMap['conexoesAmor'].alignmentScore).toBe(40);
    expect(areaMap['desafiosSombras'].alignmentScore).toBe(40);
  });

  it('unknown year (not in alignment map): all areas fall back to score 40', () => {
    // Year 10 is not in YEAR_AREA_ALIGNMENT
    const result = deriveCycleModulation(makeSnapshot(10));

    expect(result).toHaveLength(6);

    for (const r of result) {
      expect(r.alignmentScore).toBe(40);
      expect(r.suggestedBoost).toBe('decrease');
    }

    // rationale should mention the fallback message
    const first = result[0];
    expect(first.rationale).toContain('outras áreas');
  });

  it('always returns exactly 6 area entries regardless of year number', () => {
    const years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 22, 33, 99];

    for (const y of years) {
      const result = deriveCycleModulation(makeSnapshot(y));
      expect(result).toHaveLength(6);

      const areas = result.map((r) => r.area);
      const expected = [
        'vitalidadeEnergia',
        'conexoesAmor',
        'carreiraProsperidade',
        'oriCabecaQuizilas',
        'missaoDestino',
        'desafiosSombras',
      ];
      expect(areas).toEqual(expected);
    }
  });

  it('year 11 (master number): missaoDestino and oriCabecaQuizilas aligned, rest not', () => {
    const result = deriveCycleModulation(makeSnapshot(11));

    expect(result).toHaveLength(6);

    const areaMap = Object.fromEntries(result.map((r) => [r.area, r]));

    // Year 11 aligned: missaoDestino, oriCabecaQuizilas
    expect(areaMap['missaoDestino'].alignmentScore).toBe(80);
    expect(areaMap['missaoDestino'].suggestedBoost).toBe('increase');
    expect(areaMap['oriCabecaQuizilas'].alignmentScore).toBe(80);
    expect(areaMap['oriCabecaQuizilas'].suggestedBoost).toBe('increase');

    // Non-aligned: 40, decrease
    expect(areaMap['vitalidadeEnergia'].alignmentScore).toBe(40);
    expect(areaMap['conexoesAmor'].alignmentScore).toBe(40);
    expect(areaMap['carreiraProsperidade'].alignmentScore).toBe(40);
    expect(areaMap['desafiosSombras'].alignmentScore).toBe(40);

    // rationale for aligned contains "favorece"
    expect(areaMap['missaoDestino'].rationale).toContain('favorece');
    // rationale for non-aligned contains "outras áreas"
    expect(areaMap['vitalidadeEnergia'].rationale).toContain('outras áreas');
  });
});
