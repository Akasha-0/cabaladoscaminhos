/**
 * narrative-generator.ts — Test coverage
 *
 * Tests the F-226 Akasha Narrative Synthesis module.
 * Verifies:
 * - generateAreaNarrativeFull: builds the 4-pillar narrative + synthesis
 * - generateAllAreaNarratives: returns record keyed by life area
 * - generateSynthesisParagraph: composes full synthesis with typeName
 * - Edge cases: null inputs across all 4 pillars, boundary life paths (master numbers)
 */

import { describe, it, expect } from 'vitest';
import type { KabalisticMap, AstrologyMap, TantricMap, OduBirth } from '@akasha/types';
import type { AkashicHologram } from '@/lib/domain/mapa/hologram-aggregator';
import {
  LIFE_AREA_LABELS,
  generateAreaNarrativeFull,
  generateAllAreaNarratives,
  generateSynthesisParagraph,
} from './narrative-generator';

// ─── Test fixtures ──────────────────────────────────────────────────────

function makeKabalisticMap(overrides: Partial<KabalisticMap> = {}): KabalisticMap {
  return {
    lifePath: 3,
    ...overrides,
  } as KabalisticMap;
}

function makeAstrologyMap(overrides: Partial<AstrologyMap> = {}): AstrologyMap {
  return {
    planets: [
      { planet: 'Sol', sign: 'Leão', degree: 15, house: 1 },
      { planet: 'Lua', sign: 'Câncer', degree: 22, house: 4 },
    ],
    houses: [],
    ascendant: 'Leão',
    midheaven: 'Áries',
    lunarPhase: 'cheia',
    elementalChart: { fire: 5, earth: 2, air: 1, water: 2 },
    modality: { cardinal: 3, fixed: 5, mutable: 2 },
    quality: { individual: 3, relational: 1, transform: 1, social: 1, traditional: 1 },
    dominantPlanet: 'Sol',
    signRuler: 'Sol',
    houseRuler: 'Sol',
    ...overrides,
  } as AstrologyMap;
}

function makeTantricMap(overrides: Partial<TantricMap> = {}): TantricMap {
  return {
    soul: 5,
    ...overrides,
  } as TantricMap;
}

function makeOduBirth(overrides: Partial<OduBirth> = {}): OduBirth {
  return {
    oduName: 'Ogbe',
    elementalForce: 'fogo',
    lifeLesson: 'Iniciar com propósito',
    orixaRegency: ['Ogun'],
    ...overrides,
  } as OduBirth;
}

// ─── generateAreaNarrativeFull ──────────────────────────────────────────

describe('generateAreaNarrativeFull', () => {
  it('returns complete narrative with all 4 pillars + integration', () => {
    const result = generateAreaNarrativeFull(
      'vitalidadeEnergia',
      makeKabalisticMap(),
      makeAstrologyMap(),
      makeTantricMap(),
      makeOduBirth(),
      null,
    );

    expect(result.cabalaNarrative).toBeTruthy();
    expect(typeof result.cabalaNarrative).toBe('string');
    expect(result.astrologiaNarrative).toBeTruthy();
    expect(result.tantraNarrative).toBeTruthy();
    expect(result.oduNarrative).toBeTruthy();
    expect(result.integratedNarrative).toBeTruthy();
    expect(result.practicalExample).toBeTruthy();
    expect(result.sourceLabel).toContain('CV');
  });

  it('handles null inputs across all 4 pillars (empty/edge case)', () => {
    const result = generateAreaNarrativeFull(
      'desafiosSombras',
      null,
      null,
      null,
      null,
      null,
    );

    // All blocks must be present (fallback strings), no crash on nulls
    expect(result.cabalaNarrative).toBeTruthy();
    expect(result.astrologiaNarrative).toBeTruthy();
    expect(result.tantraNarrative).toBeTruthy();
    expect(result.oduNarrative).toBeTruthy();
    expect(result.integratedNarrative).toBeTruthy();
    expect(result.practicalExample).toBeTruthy();
    // sourceLabel should fall back when no pillar data exists
    expect(result.sourceLabel).toBeTruthy();
  });

  it('handles master number life path 11 (boundary condition)', () => {
    const result = generateAreaNarrativeFull(
      'missaoDestino',
      makeKabalisticMap({ lifePath: 11 }),
      makeAstrologyMap(),
      makeTantricMap(),
      makeOduBirth(),
      null,
    );
    // Master number 11 should produce narrative — at minimum non-empty
    expect(result.cabalaNarrative).toBeTruthy();
    expect(result.cabalaNarrative.length).toBeGreaterThan(10);
  });
});

// ─── generateAllAreaNarratives ──────────────────────────────────────────

describe('generateAllAreaNarratives', () => {
  it('returns a record with one entry per LIFE_AREA_LABELS key', () => {
    const result = generateAllAreaNarratives(
      makeKabalisticMap(),
      makeAstrologyMap(),
      makeTantricMap(),
      makeOduBirth(),
      null,
    );
    const labelKeys = Object.keys(LIFE_AREA_LABELS);
    expect(Object.keys(result).sort()).toEqual(labelKeys.sort());
    expect(labelKeys.length).toBeGreaterThan(0);

    // Each entry must have a populated integrated narrative
    for (const area of labelKeys) {
      expect(result[area].integratedNarrative).toBeTruthy();
      expect(result[area].practicalExample).toBeTruthy();
    }
  });

  it('handles all null inputs and still returns all 6 areas (edge case)', () => {
    const result = generateAllAreaNarratives(null, null, null, null, null);
    const labelKeys = Object.keys(LIFE_AREA_LABELS);
    expect(Object.keys(result).sort()).toEqual(labelKeys.sort());
    for (const area of labelKeys) {
      expect(result[area]).toBeDefined();
      // Empty/fallback narratives are still strings
      expect(typeof result[area].cabalaNarrative).toBe('string');
    }
  });
});

// ─── generateSynthesisParagraph ─────────────────────────────────────────

describe('generateSynthesisParagraph', () => {
  it('includes typeName opening and pillar references', () => {
    const result = generateSynthesisParagraph(
      makeKabalisticMap({ lifePath: 3 }),
      makeAstrologyMap(),
      makeTantricMap({ soul: 5 }),
      makeOduBirth(),
      'O Catalisador',
    );

    expect(result).toContain('Catalisador');
    // Synthesis should be substantial
    expect(result.length).toBeGreaterThan(50);
  });

  it('produces a generic opening when typeName is unknown (edge case)', () => {
    const result = generateSynthesisParagraph(
      makeKabalisticMap(),
      makeAstrologyMap(),
      makeTantricMap(),
      makeOduBirth(),
      'Tipo Desconhecido XYZ',
    );

    // Falls back to "Seu Tipo Akasha é ..."
    expect(result).toContain('Tipo Desconhecido XYZ');
    expect(result.length).toBeGreaterThan(0);
  });

  it('omits typeName clause when not provided', () => {
    const result = generateSynthesisParagraph(
      makeKabalisticMap(),
      makeAstrologyMap(),
      makeTantricMap(),
      makeOduBirth(),
    );

    // No "Tipo Akasha" should be present in this case
    expect(result).not.toContain('Tipo Akasha');
    expect(typeof result).toBe('string');
  });

  it('handles fully null inputs and still returns a string (edge case)', () => {
    const result = generateSynthesisParagraph(null, null, null, null);
    expect(typeof result).toBe('string');
    expect(result).toBeDefined();
  });
});

// ─── LIFE_AREA_LABELS export ─────────────────────────────────────────────

describe('LIFE_AREA_LABELS', () => {
  it('exposes the 6 standard life areas', () => {
    expect(LIFE_AREA_LABELS.vitalidadeEnergia).toBeTruthy();
    expect(LIFE_AREA_LABELS.conexoesAmor).toBeTruthy();
    expect(LIFE_AREA_LABELS.carreiraProsperidade).toBeTruthy();
    expect(LIFE_AREA_LABELS.oriCabecaQuizilas).toBeTruthy();
    expect(LIFE_AREA_LABELS.missaoDestino).toBeTruthy();
    expect(LIFE_AREA_LABELS.desafiosSombras).toBeTruthy();
    expect(Object.keys(LIFE_AREA_LABELS)).toHaveLength(6);
  });
});
