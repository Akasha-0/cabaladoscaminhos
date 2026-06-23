import { describe, it, expect } from 'vitest';
import {
  PINNACLE_THEMES,
  CHALLENGE_DESCRIPTIONS,
  KARMIC_LESSON_DESCRIPTIONS,
  MATURITY_THEMES,
  type PinnacleEntry,
  type ChallengeEntry,
  type KarmicLessonEntry,
  type MaturityEntry,
} from './personal-cycle';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isNonEmptyString = (val: unknown): val is string =>
  typeof val === 'string' && val.trim().length > 0;

const isNonEmptyStringArray = (val: unknown): val is string[] =>
  Array.isArray(val) && val.length > 0 && val.every(isNonEmptyString);

// PT_BR accented-character / common-word regex — no /g flag
// Covers editorial-prose fields (description, fonte, etc.) across all tables.
const PT_BR_RE =
  /[áéíóúãõçàèìòùâêîôû]|\b(de|e|um|uma|o|a|os|as|no|na|nos|nas|para|com|que|qual|por|mais|mas|ou|seu|seus|sua|suas|este|esta|estes|estas|esse|essa|esses|essas|isso|aquilo|não|sim|menos|muito|pouco|bem|mau|mesmo|todo|vários|outro|proximo|desde|contra|entre|sobre|sob|dentro|fora|antes|depois|portanto|assim|então|pois|porque|quando|onde|como|acerca)\b/i;

const HAS_PT_BR = (s: string) => PT_BR_RE.test(s);

// ─── PINNACLE_THEMES ─────────────────────────────────────────────────────────

describe('PINNACLE_THEMES', () => {
  const keys = Object.keys(PINNACLE_THEMES).map(Number).sort((a, b) => a - b);

  it('has exactly 9 entries with keys 1–9', () => {
    expect(keys).toHaveLength(9);
    expect(keys).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it.each(keys)('entry %i has a non-empty theme', (k) => {
    const entry = PINNACLE_THEMES[k]!;
    expect(entry.theme, `PINNACLE_THEMES[${k}].theme`).toBeTypeOf('string');
    expect(isNonEmptyString(entry.theme), `PINNACLE_THEMES[${k}].theme`).toBe(true);
  });

  it.each(keys)('entry %i opportunities is a non-empty string array', (k) => {
    const entry = PINNACLE_THEMES[k]!;
    expect(Array.isArray(entry.opportunities)).toBe(true);
    expect(isNonEmptyStringArray(entry.opportunities), `PINNACLE_THEMES[${k}].opportunities`).toBe(true);
  });

  it.each(keys)('entry %i opportunities items are non-empty strings', (k) => {
    const entry = PINNACLE_THEMES[k]!;
    entry.opportunities.forEach((item, i) => {
      expect(
        isNonEmptyString(item),
        `PINNACLE_THEMES[${k}].opportunities[${i}]`,
      ).toBe(true);
    });
  });

  it.each(keys)('entry %i challenges is a non-empty string array', (k) => {
    const entry = PINNACLE_THEMES[k]!;
    expect(Array.isArray(entry.challenges)).toBe(true);
    expect(isNonEmptyStringArray(entry.challenges), `PINNACLE_THEMES[${k}].challenges`).toBe(true);
  });

  it.each(keys)('entry %i challenges items are non-empty strings', (k) => {
    const entry = PINNACLE_THEMES[k]!;
    entry.challenges.forEach((item, i) => {
      expect(
        isNonEmptyString(item),
        `PINNACLE_THEMES[${k}].challenges[${i}]`,
      ).toBe(true);
    });
  });

  it.each(keys)('entry %i has a non-empty fonte', (k) => {
    const entry = PINNACLE_THEMES[k]!;
    expect(entry.fonte, `PINNACLE_THEMES[${k}].fonte`).toBeTypeOf('string');
    expect(isNonEmptyString(entry.fonte), `PINNACLE_THEMES[${k}].fonte`).toBe(true);
  });

  it.each(keys)('entry %i matches PinnacleEntry interface shape', (k) => {
    const entry = PINNACLE_THEMES[k] as PinnacleEntry;
    expect(entry.theme).toBeTypeOf('string');
    expect(entry.fonte).toBeTypeOf('string');
  });

  // spot-check
  it('PINNACLE_THEMES[1] opportunities array is truthy and non-empty', () => {
    expect(PINNACLE_THEMES[1]?.opportunities).toBeTruthy();
    expect(PINNACLE_THEMES[1]!.opportunities.length).toBeGreaterThan(0);
  });
});

// ─── CHALLENGE_DESCRIPTIONS ──────────────────────────────────────────────────

describe('CHALLENGE_DESCRIPTIONS', () => {
  const keys = Object.keys(CHALLENGE_DESCRIPTIONS).map(Number).sort((a, b) => a - b);

  it('has exactly 10 entries with keys 0–9', () => {
    expect(keys).toHaveLength(10);
    expect(keys).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it.each(keys)('entry %i has a non-empty description', (k) => {
    const entry = CHALLENGE_DESCRIPTIONS[k]!;
    expect(entry.description, `CHALLENGE_DESCRIPTIONS[${k}].description`).toBeTypeOf('string');
    expect(isNonEmptyString(entry.description), `CHALLENGE_DESCRIPTIONS[${k}].description`).toBe(true);
  });

  it.each(keys)('entry %i description contains PT_BR content', (k) => {
    expect(HAS_PT_BR(CHALLENGE_DESCRIPTIONS[k]!.description)).toBe(true);
  });

  it.each(keys)('entry %i has a non-empty howToOvercome', (k) => {
    const entry = CHALLENGE_DESCRIPTIONS[k]!;
    expect(entry.howToOvercome, `CHALLENGE_DESCRIPTIONS[${k}].howToOvercome`).toBeTypeOf('string');
    expect(isNonEmptyString(entry.howToOvercome), `CHALLENGE_DESCRIPTIONS[${k}].howToOvercome`).toBe(true);
  });

  it.each(keys)('entry %i has a non-empty lifeArea', (k) => {
    const entry = CHALLENGE_DESCRIPTIONS[k]!;
    expect(entry.lifeArea, `CHALLENGE_DESCRIPTIONS[${k}].lifeArea`).toBeTypeOf('string');
    expect(isNonEmptyString(entry.lifeArea), `CHALLENGE_DESCRIPTIONS[${k}].lifeArea`).toBe(true);
  });

  it.each(keys)('entry %i has a non-empty fonte', (k) => {
    const entry = CHALLENGE_DESCRIPTIONS[k]!;
    expect(entry.fonte, `CHALLENGE_DESCRIPTIONS[${k}].fonte`).toBeTypeOf('string');
    expect(isNonEmptyString(entry.fonte), `CHALLENGE_DESCRIPTIONS[${k}].fonte`).toBe(true);
  });

  it.each(keys)('entry %i matches ChallengeEntry interface shape', (k) => {
    const entry = CHALLENGE_DESCRIPTIONS[k] as ChallengeEntry;
    expect(entry.description).toBeTypeOf('string');
    expect(entry.howToOvercome).toBeTypeOf('string');
    expect(entry.lifeArea).toBeTypeOf('string');
    expect(entry.fonte).toBeTypeOf('string');
  });
});

// ─── KARMIC_LESSON_DESCRIPTIONS ──────────────────────────────────────────────

describe('KARMIC_LESSON_DESCRIPTIONS', () => {
  const keys = Object.keys(KARMIC_LESSON_DESCRIPTIONS).map(Number).sort((a, b) => a - b);

  it('has exactly 9 entries with keys 1–9', () => {
    expect(keys).toHaveLength(9);
    expect(keys).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it.each(keys)('entry %i has a non-empty description', (k) => {
    const entry = KARMIC_LESSON_DESCRIPTIONS[k]!;
    expect(entry.description, `KARMIC_LESSON_DESCRIPTIONS[${k}].description`).toBeTypeOf('string');
    expect(isNonEmptyString(entry.description), `KARMIC_LESSON_DESCRIPTIONS[${k}].description`).toBe(true);
  });

  it.each(keys)('entry %i description contains PT_BR content', (k) => {
    expect(HAS_PT_BR(KARMIC_LESSON_DESCRIPTIONS[k]!.description)).toBe(true);
  });

  it.each(keys)('entry %i has a non-empty howToLearn', (k) => {
    const entry = KARMIC_LESSON_DESCRIPTIONS[k]!;
    expect(entry.howToLearn, `KARMIC_LESSON_DESCRIPTIONS[${k}].howToLearn`).toBeTypeOf('string');
    expect(isNonEmptyString(entry.howToLearn), `KARMIC_LESSON_DESCRIPTIONS[${k}].howToLearn`).toBe(true);
  });

  it.each(keys)('entry %i has a non-empty lifeArea', (k) => {
    const entry = KARMIC_LESSON_DESCRIPTIONS[k]!;
    expect(entry.lifeArea, `KARMIC_LESSON_DESCRIPTIONS[${k}].lifeArea`).toBeTypeOf('string');
    expect(isNonEmptyString(entry.lifeArea), `KARMIC_LESSON_DESCRIPTIONS[${k}].lifeArea`).toBe(true);
  });

  it.each(keys)('entry %i has a non-empty fonte', (k) => {
    const entry = KARMIC_LESSON_DESCRIPTIONS[k]!;
    expect(entry.fonte, `KARMIC_LESSON_DESCRIPTIONS[${k}].fonte`).toBeTypeOf('string');
    expect(isNonEmptyString(entry.fonte), `KARMIC_LESSON_DESCRIPTIONS[${k}].fonte`).toBe(true);
  });

  it.each(keys)('entry %i matches KarmicLessonEntry interface shape', (k) => {
    const entry = KARMIC_LESSON_DESCRIPTIONS[k] as KarmicLessonEntry;
    expect(entry.description).toBeTypeOf('string');
    expect(entry.howToLearn).toBeTypeOf('string');
    expect(entry.lifeArea).toBeTypeOf('string');
    expect(entry.fonte).toBeTypeOf('string');
  });
});

// ─── MATURITY_THEMES ─────────────────────────────────────────────────────────

describe('MATURITY_THEMES', () => {
  const keys = Object.keys(MATURITY_THEMES).map(Number).sort((a, b) => a - b);

  it('has exactly 12 entries: keys 1–9 plus master numbers 11, 22, 33', () => {
    expect(keys).toHaveLength(12);
    expect(keys).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33]);
  });

  it('contains master numbers 11, 22, 33', () => {
    expect(keys).toContain(11);
    expect(keys).toContain(22);
    expect(keys).toContain(33);
  });

  it('does NOT contain 10', () => {
    expect(keys).not.toContain(10);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33])('entry %i has a non-empty theme', (k) => {
    const entry = MATURITY_THEMES[k]!;
    expect(entry.theme, `MATURITY_THEMES[${k}].theme`).toBeTypeOf('string');
    expect(isNonEmptyString(entry.theme), `MATURITY_THEMES[${k}].theme`).toBe(true);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33])('entry %i has a non-empty description', (k) => {
    const entry = MATURITY_THEMES[k]!;
    expect(entry.description, `MATURITY_THEMES[${k}].description`).toBeTypeOf('string');
    expect(isNonEmptyString(entry.description), `MATURITY_THEMES[${k}].description`).toBe(true);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33])('entry %i gifts is a non-empty string array', (k) => {
    const entry = MATURITY_THEMES[k]!;
    expect(Array.isArray(entry.gifts)).toBe(true);
    expect(isNonEmptyStringArray(entry.gifts), `MATURITY_THEMES[${k}].gifts`).toBe(true);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33])('entry %i gifts items are non-empty strings', (k) => {
    const entry = MATURITY_THEMES[k]!;
    entry.gifts.forEach((item, i) => {
      expect(
        isNonEmptyString(item),
        `MATURITY_THEMES[${k}].gifts[${i}]`,
      ).toBe(true);
    });
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33])('entry %i challenges is a non-empty string array', (k) => {
    const entry = MATURITY_THEMES[k]!;
    expect(Array.isArray(entry.challenges)).toBe(true);
    expect(isNonEmptyStringArray(entry.challenges), `MATURITY_THEMES[${k}].challenges`).toBe(true);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33])('entry %i challenges items are non-empty strings', (k) => {
    const entry = MATURITY_THEMES[k]!;
    entry.challenges.forEach((item, i) => {
      expect(
        isNonEmptyString(item),
        `MATURITY_THEMES[${k}].challenges[${i}]`,
      ).toBe(true);
    });
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33])('entry %i has a non-empty fonte', (k) => {
    const entry = MATURITY_THEMES[k]!;
    expect(entry.fonte, `MATURITY_THEMES[${k}].fonte`).toBeTypeOf('string');
    expect(isNonEmptyString(entry.fonte), `MATURITY_THEMES[${k}].fonte`).toBe(true);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33])('entry %i matches MaturityEntry interface shape', (k) => {
    const entry = MATURITY_THEMES[k] as MaturityEntry;
    expect(entry.theme).toBeTypeOf('string');
    expect(entry.description).toBeTypeOf('string');
    expect(entry.fonte).toBeTypeOf('string');
  });

  // spot-checks
  it('MATURITY_THEMES[33] is truthy (master number)', () => {
    expect(MATURITY_THEMES[33]).toBeTruthy();
  });

  it('MATURITY_THEMES[33] has the expected master-teacher theme', () => {
    expect(MATURITY_THEMES[33]!.theme).toBe('Mestre curador');
  });

  it('MATURITY_THEMES[11] gifts array is non-empty', () => {
    expect(MATURITY_THEMES[11]!.gifts.length).toBeGreaterThan(0);
  });

  it('MATURITY_THEMES[22] has the master-builder theme', () => {
    expect(MATURITY_THEMES[22]!.theme).toBe('Construtor mestre');
  });
});
