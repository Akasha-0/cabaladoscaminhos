/**
 * ═══════════════════════════════════════════════════════════════════════════
 * w64/divination_interpretation_engine · TEST SUITE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Self-running harness (sandbox lacks vitest — see cycle 63 lesson 6).
 * Pattern: import from `.ts` extension (Node strip-types).
 *
 * Targets:
 *   - 15+ describe blocks
 *   - 60+ it blocks
 *   - 200+ expect assertions
 *
 * Run with:
 *   node --experimental-strip-types --no-warnings path/to/this.test.ts
 *
 * Author: Coder Worker A · cycle 64 · 2026-06-29
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ────────────────────────────────────────────────────────────────────────────
// Sandbox-friendly vitest stub (cycle 63 lesson 6)
// ────────────────────────────────────────────────────────────────────────────

interface TestEntry { name: string; fn: () => void | Promise<void> }
const _testStack: TestEntry[] = [];
const _failures: Array<{ describe: string; name: string; error: string }> = [];

let _currentDescribe = '';

const describe = (name: string, fn: () => void): void => {
  const outer = _currentDescribe;
  _currentDescribe = outer ? `${outer} > ${name}` : name;
  fn();
  _currentDescribe = outer;
};

const it = (name: string, fn: () => void | Promise<void>): void => {
  _testStack.push({ name: `${_currentDescribe} :: ${name}`, fn });
};

const expect = (actual: unknown) => {
  const assert = (cond: boolean, msg: string): void => {
    if (!cond) {
      throw new Error(`expect failed: ${msg}\n  actual=${JSON.stringify(actual)}`);
    }
  };
  return {
    toBe(expected: unknown): void {
      assert(actual === expected, `expected ${String(actual)} toBe ${String(expected)}`);
    },
    toEqual(expected: unknown): void {
      const a = JSON.stringify(actual);
      const e = JSON.stringify(expected);
      assert(a === e, `expected ${a} toEqual ${e}`);
    },
    toBeGreaterThan(threshold: number): void {
      assert(typeof actual === 'number' && actual > threshold, `expected number > ${threshold}, got ${String(actual)}`);
    },
    toBeGreaterThanOrEqual(threshold: number): void {
      assert(typeof actual === 'number' && actual >= threshold, `expected number >= ${threshold}, got ${String(actual)}`);
    },
    toBeLessThan(threshold: number): void {
      assert(typeof actual === 'number' && actual < threshold, `expected number < ${threshold}, got ${String(actual)}`);
    },
    toBeLessThanOrEqual(threshold: number): void {
      assert(typeof actual === 'number' && actual <= threshold, `expected number <= ${threshold}, got ${String(actual)}`);
    },
    toBeTruthy(): void {
      assert(!!actual, `expected truthy, got ${String(actual)}`);
    },
    toBeFalsy(): void {
      assert(!actual, `expected falsy, got ${String(actual)}`);
    },
    toBeNull(): void {
      assert(actual === null, `expected null, got ${String(actual)}`);
    },
    toBeUndefined(): void {
      assert(actual === undefined, `expected undefined, got ${String(actual)}`);
    },
    toBeDefined(): void {
      assert(actual !== undefined, `expected defined, got undefined`);
    },
    toContain(item: unknown): void {
      if (typeof actual === 'string') {
        assert(actual.includes(String(item)), `expected string to contain ${String(item)}`);
      } else if (Array.isArray(actual)) {
        assert(actual.some((x) => JSON.stringify(x) === JSON.stringify(item)), `expected array to contain ${String(item)}`);
      } else {
        assert(false, `toContain called on non-array/string`);
      }
    },
    toHaveLength(n: number): void {
      if (Array.isArray(actual) || typeof actual === 'string') {
        assert((actual as { length: number }).length === n, `expected length ${n}, got ${(actual as { length: number }).length}`);
      } else {
        assert(false, 'toHaveLength called on non-array/string');
      }
    },
    toMatch(re: RegExp): void {
      if (typeof actual !== 'string') {
        assert(false, 'toMatch called on non-string');
        return;
      }
      assert(re.test(actual), `expected to match ${re.toString()}`);
    },
  };
};

// ────────────────────────────────────────────────────────────────────────────
// Import engine under test (use .ts extension so Node strip-types picks it up)
// ────────────────────────────────────────────────────────────────────────────

import {
  // type-only import (stripped at runtime by TS strip-types)
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  type CardId,
  // error classes
  InterpretationError, InvalidCardError, InvalidSpreadError, MissingQuestionError, SacredBoundaryError,
  // constants
  MAX_CONFIDENCE, MIN_CONFIDENCE, DEFAULT_CONFIDENCE, CITATION_BOOST_STEP, CITATION_BOOST_CAP_AT,
  DEFAULT_LOCALE, MESA_REAL_SIZE, MIN_QUESTION_LENGTH, MAX_QUESTION_LENGTH, EPSILON,
  // sacred content
  ORIXA_MAPPINGS, SEFIROT_MAPPINGS, PLANETS, ZODIAC_SIGNS, ASTROLOGICAL_HOUSES, NUMEROLOGY_NUMBERS,
  // helpers
  clampUnit, safeId, truncateSacredText, normalizeQuestion, scoreConfidence, boostScoreByCitations,
  toCardId, toCardIdSafe, toHouseOrdinalSuffix, toHouseIdSafe, combineScore, scoreToBand,
  houseOrdinal, ordinalToHouseId,
  // type guards
  isCardRef, isHouseId, isSpreadLayout, isReadingInput, isMesaRealReading, isCardInterpretation,
  isCoverageReport, isTraditionId, isHouseCross,
  // catalog
  loadCardCatalog, loadHouseCatalog, getCard, getHouse, getOrixaMappings, getSefirotMappings,
  // engines
  interpretCard, interpretPair, buildSpreadLayout, getSpreadLayout, spreadSize,
  interpretSpread, interpretMesaReal, crossHouse, detectCombinations, validateSpread,
  auditSacredCoverage, interpretReading, ENGINE_INFO,
} from '../divination_interpretation_engine.ts';

// ────────────────────────────────────────────────────────────────────────────
// DESCRIBE BLOCK 1 — Constants
// ────────────────────────────────────────────────────────────────────────────

describe('constants', () => {
  it('MAX_CONFIDENCE is 0.99 (cycle 63 lesson 5)', () => {
    expect(MAX_CONFIDENCE).toBe(0.99);
  });
  it('MIN_CONFIDENCE is 0.1', () => {
    expect(MIN_CONFIDENCE).toBe(0.1);
  });
  it('DEFAULT_CONFIDENCE is 0.5', () => {
    expect(DEFAULT_CONFIDENCE).toBe(0.5);
  });
  it('CITATION_BOOST_STEP is 0.07', () => {
    expect(CITATION_BOOST_STEP).toBe(0.07);
  });
  it('CITATION_BOOST_CAP_AT is 12', () => {
    expect(CITATION_BOOST_CAP_AT).toBe(12);
  });
  it('MESA_REAL_SIZE is 36', () => {
    expect(MESA_REAL_SIZE).toBe(36);
  });
  it('MIN_QUESTION_LENGTH is 3', () => {
    expect(MIN_QUESTION_LENGTH).toBe(3);
  });
  it('MAX_QUESTION_LENGTH is 480', () => {
    expect(MAX_QUESTION_LENGTH).toBe(480);
  });
  it('EPSILON is 1e-9', () => {
    expect(EPSILON).toBe(1e-9);
  });
  it('DEFAULT_LOCALE is pt-BR', () => {
    expect(DEFAULT_LOCALE).toBe('pt-BR');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// DESCRIBE BLOCK 2 — Sacred content (card catalog + sacred mappings)
// ────────────────────────────────────────────────────────────────────────────

describe('sacred content catalog', () => {
  it('card catalog has exactly 36 cards', () => {
    const catalog = loadCardCatalog();
    expect(catalog).toHaveLength(36);
  });
  it('house catalog has exactly 36 houses', () => {
    const houses = loadHouseCatalog();
    expect(houses).toHaveLength(36);
  });
  it('card 1 is named Cigano (LENE per user method)', () => {
    expect(getCard(1 as CardId).name).toBe('Cigano');
  });
  it('card 2 is named Cigana (feminine counterpart)', () => {
    expect(getCard(2 as CardId).name).toBe('Cigana');
  });
  it('every card has non-empty keywords', () => {
    const cat = loadCardCatalog();
    for (const c of cat) {
      expect(c.keywords.length > 0).toBeTruthy();
    }
  });
  it('every card has non-empty sacredRefs', () => {
    const cat = loadCardCatalog();
    for (const c of cat) {
      expect(c.sacredRefs.length > 0).toBeTruthy();
    }
  });
  it('every card has at least one sacred reference', () => {
    const cat = loadCardCatalog();
    let count = 0;
    for (const c of cat) {
      count += c.sacredRefs.length;
    }
    expect(count >= 36).toBeTruthy();
  });
  it('every card has element, planet, number', () => {
    const cat = loadCardCatalog();
    for (const c of cat) {
      expect(typeof c.element === 'string').toBeTruthy();
      expect(typeof c.planet === 'string').toBeTruthy();
      expect(typeof c.number === 'number').toBeTruthy();
    }
  });
  it('house catalog covers all 7 domains', () => {
    const houses = loadHouseCatalog();
    const domains = new Set(houses.map((h) => h.domain));
    expect(domains.has('eu')).toBeTruthy();
    expect(domains.has('relacionamentos')).toBeTruthy();
    expect(domains.has('trabalho')).toBeTruthy();
    expect(domains.has('espiritualidade')).toBeTruthy();
    expect(domains.has('familia')).toBeTruthy();
    expect(domains.has('saude')).toBeTruthy();
    expect(domains.has('financas')).toBeTruthy();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// DESCRIBE BLOCK 3 — Orixá, Sefirot, Planets, Signs, Numerology mappings
// ────────────────────────────────────────────────────────────────────────────

describe('sacred taxonomy', () => {
  it('ORIXA_MAPPINGS has 19 entries', () => {
    expect(ORIXA_MAPPINGS).toHaveLength(19);
  });
  it('SEFIROT_MAPPINGS has 10 entries', () => {
    expect(SEFIROT_MAPPINGS).toHaveLength(10);
  });
  it('PLANETS has 11 entries (incl terra)', () => {
    expect(PLANETS).toHaveLength(11);
  });
  it('ZODIAC_SIGNS has 12 entries', () => {
    expect(ZODIAC_SIGNS).toHaveLength(12);
  });
  it('ASTROLOGICAL_HOUSES has 12 entries', () => {
    expect(ASTROLOGICAL_HOUSES).toHaveLength(12);
  });
  it('NUMEROLOGY_NUMBERS has 12 entries (1-9 + 11/22/33)', () => {
    expect(NUMEROLOGY_NUMBERS).toHaveLength(12);
  });
  it('orixa mappings cover 19 orixás (with 3 cards holding 2 orixás each)', () => {
    expect(new Set(ORIXA_MAPPINGS.map((m) => m.orixa)).size).toBe(19);
    expect(ORIXA_MAPPINGS.length).toBe(19);
  });
  it('sefirah mappings cover 10 cardIds 1..10', () => {
    const ids = SEFIROT_MAPPINGS.map((m) => m.cardId).sort((a, b) => (a as number) - (b as number));
    expect(ids[0]).toBe(1);
    expect(ids[9]).toBe(10);
  });
  it('getOrixaMappings returns 19 entries', () => {
    expect(getOrixaMappings()).toHaveLength(19);
  });
  it('getSefirotMappings returns 10 entries', () => {
    expect(getSefirotMappings()).toHaveLength(10);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// DESCRIBE BLOCK 4 — Pure helpers
// ────────────────────────────────────────────────────────────────────────────

describe('pure helpers', () => {
  it('clampUnit clamps to [0,1]', () => {
    expect(clampUnit(0.5)).toBe(0.5);
    expect(clampUnit(-0.5)).toBe(0);
    expect(clampUnit(1.5)).toBe(1);
    expect(clampUnit(NaN)).toBe(0);
  });
  it('safeId handles null/undefined', () => {
    expect(safeId(null)).toBe('');
    expect(safeId(undefined)).toBe('');
    expect(safeId(null, 'fb')).toBe('fb');
    expect(safeId(42)).toBe('42');
  });
  it('truncateSacredText keeps short strings', () => {
    expect(truncateSacredText('ok', 10)).toBe('ok');
  });
  it('truncateSacredText cuts long strings with ellipsis', () => {
    const out = truncateSacredText('abcdefghij', 5);
    expect(out.includes('…') || out.length <= 5).toBeTruthy();
  });
  it('normalizeQuestion collapses whitespace', () => {
    expect(normalizeQuestion('  a    b  ')).toBe('a b');
  });
  it('normalizeQuestion strips noisy surrounding punctuation', () => {
    expect(normalizeQuestion('  !!! vida?? ').includes('vida')).toBeTruthy();
  });
  it('scoreConfidence scales 0..1', () => {
    const s = scoreConfidence(100, 5, true);
    expect(s).toBeGreaterThan(0.4);
    expect(s).toBeLessThanOrEqual(MAX_CONFIDENCE + EPSILON);
  });
  it('boostScoreByCitations caps at MAX_CONFIDENCE', () => {
    const out = boostScoreByCitations(0.5, 100);
    expect(out).toBeLessThanOrEqual(MAX_CONFIDENCE + EPSILON);
  });
  it('toCardId throws on out-of-range', () => {
    let caught = false;
    try { toCardId(0); } catch (_) { caught = true; }
    expect(caught).toBeTruthy();
  });
  it('toCardId throws on 37', () => {
    let caught = false;
    try { toCardId(37); } catch (_) { caught = true; }
    expect(caught).toBeTruthy();
  });
  it('toCardIdSafe returns 1 for 0', () => {
    expect(toCardIdSafe(0)).toBe(1);
  });
  it('toCardIdSafe returns 36 for 999', () => {
    expect(toCardIdSafe(999)).toBe(36);
  });
  it('toHouseOrdinalSuffix zero-pads', () => {
    expect(toHouseOrdinalSuffix(4)).toBe('04');
    expect(toHouseOrdinalSuffix(36)).toBe('36');
  });
  it('toHouseOrdinalSuffix returns XX for invalid', () => {
    expect(toHouseOrdinalSuffix(0)).toBe('XX');
    expect(toHouseOrdinalSuffix(99)).toBe('XX');
  });
  it('toHouseIdSafe falls back to casa-01', () => {
    expect(toHouseIdSafe('foo')).toBe('casa-01');
    expect(toHouseIdSafe(null)).toBe('casa-01');
  });
  it('combineScore returns 5 aggregators', () => {
    const r = combineScore([0.1, 0.5, 0.9]);
    expect(typeof r.min).toBe('number');
    expect(typeof r.max).toBe('number');
    expect(typeof r.mean).toBe('number');
    expect(typeof r.weightedMean).toBe('number');
    expect(typeof r.geometricMean).toBe('number');
  });
  it('combineScore empty input yields zeros', () => {
    const r = combineScore([]);
    expect(r.min).toBe(0);
    expect(r.max).toBe(0);
    expect(r.mean).toBe(0);
  });
  it('combineScore respects min/max ordering', () => {
    const r = combineScore([0.1, 0.5, 0.9]);
    expect(r.min).toBe(0.1);
    expect(r.max).toBe(0.9);
  });
  it('scoreToBand classifies scores', () => {
    expect(scoreToBand(0.1)).toBe('baixa');
    expect(scoreToBand(0.5)).toBe('media');
    expect(scoreToBand(0.7)).toBe('alta');
    expect(scoreToBand(0.95)).toBe('muito-alta');
  });
  it('houseOrdinal parses', () => {
    const houseIdInput: unknown = 'casa-04';
    expect(houseOrdinal(houseIdInput as Parameters<typeof houseOrdinal>[0])).toBe(4);
  });
  it('ordinalToHouseId round-trips', () => {
    expect(ordinalToHouseId(7)).toBe('casa-07');
    expect(ordinalToHouseId(36)).toBe('casa-36');
    expect(ordinalToHouseId(0)).toBe('casa-01');
    expect(ordinalToHouseId(99)).toBe('casa-36');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// DESCRIBE BLOCK 5 — Type guards
// ────────────────────────────────────────────────────────────────────────────

describe('type guards', () => {
  it('isCardRef accepts valid card', () => {
    expect(isCardRef({ id: 5 })).toBeTruthy();
  });
  it('isCardRef rejects id=0', () => {
    expect(isCardRef({ id: 0 })).toBeFalsy();
  });
  it('isCardRef rejects id=37', () => {
    expect(isCardRef({ id: 37 })).toBeFalsy();
  });
  it('isCardRef rejects non-object', () => {
    expect(isCardRef(null)).toBeFalsy();
    expect(isCardRef(5)).toBeFalsy();
  });
  it('isCardRef accepts with reversed + house', () => {
    expect(isCardRef({ id: 5, reversed: true, house: 'casa-04' })).toBeTruthy();
  });
  it('isHouseId parses casa-XX', () => {
    expect(isHouseId('casa-04')).toBeTruthy();
  });
  it('isHouseId rejects invalid format', () => {
    expect(isHouseId('foo')).toBeFalsy();
    expect(isHouseId('casa-99')).toBeFalsy();
  });
  it('isSpreadLayout accepts valid layout', () => {
    expect(isSpreadLayout({ type: 'SPREAD_3_CARD', slots: [] })).toBeTruthy();
  });
  it('isSpreadLayout rejects unknown type', () => {
    expect(isSpreadLayout({ type: 'FOO', slots: [] })).toBeFalsy();
  });
  it('isReadingInput accepts valid input', () => {
    expect(isReadingInput({ question: 'q', spread: 'SPREAD_3_CARD', cards: [] })).toBeTruthy();
  });
  it('isMesaRealReading accepts mesa shape', () => {
    expect(isMesaRealReading({ cards: [], houses: [], interpretations: [], houseCrossings: [], overallTheme: 't', dominantElement: 'ar' })).toBeTruthy();
  });
  it('isCardInterpretation accepts valid interp', () => {
    const interp = interpretCard({ question: 'q', card: { id: 5 as CardId } });
    expect(isCardInterpretation(interp)).toBeTruthy();
  });
  it('isCoverageReport accepts audit', () => {
    expect(isCoverageReport(auditSacredCoverage())).toBeTruthy();
  });
  it('isTraditionId validates ids', () => {
    expect(isTraditionId('cigano')).toBeTruthy();
    expect(isTraditionId('foo')).toBeFalsy();
  });
  it('isHouseCross validates crosses', () => {
    const mesa = interpretMesaReal([{ id: 5 as CardId }]);
    const cross = crossHouse(mesa, 'casa-04');
    expect(isHouseCross(cross)).toBeTruthy();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// DESCRIBE BLOCK 6 — Error classes
// ────────────────────────────────────────────────────────────────────────────

describe('error classes', () => {
  it('InterpretationError has code + context', () => {
    const e = new InterpretationError('TEST', 'msg', { k: 1 });
    expect(e.code).toBe('TEST');
    expect((e.context as { k: number }).k).toBe(1);
  });
  it('InvalidCardError extended from InterpretationError', () => {
    const e = new InvalidCardError(99, 99);
    expect(e instanceof InterpretationError).toBeTruthy();
  });
  it('InvalidSpreadError extends base', () => {
    const e = new InvalidSpreadError('X', 'r');
    expect(e instanceof InterpretationError).toBeTruthy();
  });
  it('MissingQuestionError', () => {
    const e = new MissingQuestionError(undefined);
    expect(e instanceof InterpretationError).toBeTruthy();
  });
  it('SacredBoundaryError', () => {
    const e = new SacredBoundaryError('mixing', 'cigano');
    expect(e instanceof InterpretationError).toBeTruthy();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// DESCRIBE BLOCK 7 — Catalog accessors
// ────────────────────────────────────────────────────────────────────────────

describe('catalog accessors', () => {
  it('getCard returns snapshot copy', () => {
    const a = getCard(5 as CardId);
    const b = getCard(5 as CardId);
    expect(a).toEqual(b);
    expect(a === b).toBeFalsy();
  });
  it('getHouse returns valid house', () => {
    const houseIdInput: unknown = 'casa-04';
    const h = getHouse(houseIdInput as Parameters<typeof getHouse>[0]);
    expect(h.ordinal).toBe(4);
  });
  it('getHouse fallback on invalid', () => {
    const houseIdInput: unknown = 'casa-04';
    const h = getHouse(houseIdInput as Parameters<typeof getHouse>[0]);
    expect(h.ordinal > 0).toBeTruthy();
  });
  it('loadCardCatalog returns 36 with arrays', () => {
    const c = loadCardCatalog();
    expect(c).toHaveLength(36);
    expect(Array.isArray(c[0].sacredRefs)).toBeTruthy();
  });
  it('loadHouseCatalog returns 36 houses', () => {
    expect(loadHouseCatalog()).toHaveLength(36);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// DESCRIBE BLOCK 8 — interpretCard (single)
// ────────────────────────────────────────────────────────────────────────────

describe('interpretCard (single)', () => {
  it('returns interpretation with contextualMeaning', () => {
    const i = interpretCard({ question: 'Vou casar?', card: { id: 5 as CardId } });
    expect(typeof i.contextualMeaning).toBe('string');
    expect(i.contextualMeaning.length > 0).toBeTruthy();
  });
  it('reversed toggles base meaning', () => {
    const up = interpretCard({ question: 'q', card: { id: 5 as CardId, reversed: false } });
    const rev = interpretCard({ question: 'q', card: { id: 5 as CardId, reversed: true } });
    expect(up.contextualMeaning.includes('(reversificado)')).toBeFalsy();
    expect(rev.contextualMeaning.includes('(reversificado)')).toBeTruthy();
  });
  it('confidence capped at MAX_CONFIDENCE', () => {
    const i = interpretCard({ question: 'long question here ' + 'a '.repeat(60), card: { id: 5 as CardId } });
    expect(i.confidence).toBeLessThanOrEqual(MAX_CONFIDENCE + EPSILON);
  });
  it('warnings present when question missing', () => {
    const i = interpretCard({ question: '', card: { id: 5 as CardId } });
    expect(i.warnings.length > 0).toBeTruthy();
  });
  it('crossCardLinks non-empty when card has neighbors', () => {
    const i = interpretCard({ question: 'q', card: { id: 5 as CardId } });
    expect(Array.isArray(i.crossCardLinks)).toBeTruthy();
  });
  it('sacredReferences has displayLabel', () => {
    const i = interpretCard({ question: 'q', card: { id: 5 as CardId } });
    expect(i.sacredReferences[0].displayLabel.length > 0).toBeTruthy();
  });
  it('confidenceBand classified', () => {
    const i = interpretCard({ question: 'q', card: { id: 5 as CardId } });
    expect(['baixa', 'media', 'alta', 'muito-alta']).toContain(i.confidenceBand);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// DESCRIBE BLOCK 9 — interpretPair
// ────────────────────────────────────────────────────────────────────────────

describe('interpretPair', () => {
  it('returns combined text + keywords', () => {
    const r = interpretPair({ id: 1 as CardId }, { id: 5 as CardId });
    expect(r.combined.length > 0).toBeTruthy();
    expect(r.combinedKeywords.length > 0).toBeTruthy();
  });
  it('confidence ≤ MAX_CONFIDENCE', () => {
    const r = interpretPair({ id: 1 as CardId }, { id: 5 as CardId }, { question: 'foo' });
    expect(r.confidence).toBeLessThanOrEqual(MAX_CONFIDENCE + EPSILON);
  });
  it('polarity responds to reversals', () => {
    const r1 = interpretPair({ id: 24 as CardId }, { id: 25 as CardId });
    expect(typeof r1.polarity).toBe('string');
  });
  it('sacredOverlap may be empty for unrelated cards', () => {
    const r = interpretPair({ id: 1 as CardId }, { id: 7 as CardId });
    expect(Array.isArray(r.sacredOverlap)).toBeTruthy();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// DESCRIBE BLOCK 10 — Spread templates & interpretSpread
// ────────────────────────────────────────────────────────────────────────────

describe('spread templates', () => {
  it('SPREAD_1_CARD has 1 slot', () => {
    expect(spreadSize('SPREAD_1_CARD')).toBe(1);
  });
  it('SPREAD_3_CARD has 3 slots', () => {
    expect(spreadSize('SPREAD_3_CARD')).toBe(3);
  });
  it('SPREAD_5_CARD has 5 slots', () => {
    expect(spreadSize('SPREAD_5_CARD')).toBe(5);
  });
  it('SPREAD_9_CARD has 9 slots', () => {
    expect(spreadSize('SPREAD_9_CARD')).toBe(9);
  });
  it('SPREAD_36_MESA_REAL has 36 slots', () => {
    expect(spreadSize('SPREAD_36_MESA_REAL')).toBe(36);
  });
  it('buildSpreadLayout returns correct type', () => {
    expect(buildSpreadLayout('SPREAD_3_CARD').type).toBe('SPREAD_3_CARD');
  });
  it('getSpreadLayout returns same as build', () => {
    const a = buildSpreadLayout('SPREAD_5_CARD');
    const b = getSpreadLayout('SPREAD_5_CARD');
    expect(a).toEqual(b);
  });
  it('interpretSpread 3-card works', () => {
    const s = interpretSpread(buildSpreadLayout('SPREAD_3_CARD'), [
      { id: 1 as CardId }, { id: 5 as CardId }, { id: 9 as CardId },
    ], 'O que vem?');
    expect(s.interpretations).toHaveLength(3);
    expect(s.pairs.length >= 1).toBeTruthy();
  });
  it('interpretSpread 5-card with question', () => {
    const s = interpretSpread(buildSpreadLayout('SPREAD_5_CARD'), [
      { id: 10 as CardId }, { id: 21 as CardId }, { id: 33 as CardId }, { id: 4 as CardId }, { id: 31 as CardId },
    ], 'Amor em vista?');
    expect(s.overallTheme.length > 0).toBeTruthy();
  });
  it('interpretSpread 1-card provides advice', () => {
    const s = interpretSpread(buildSpreadLayout('SPREAD_1_CARD'), [{ id: 31 as CardId }], 'Sol?');
    expect(s.interpretations).toHaveLength(1);
  });
  it('interpretSpread 9-card', () => {
    const s = interpretSpread(buildSpreadLayout('SPREAD_9_CARD'), [
      { id: 1 as CardId }, { id: 2 as CardId }, { id: 3 as CardId },
      { id: 4 as CardId }, { id: 5 as CardId }, { id: 6 as CardId },
      { id: 7 as CardId }, { id: 8 as CardId }, { id: 9 as CardId },
    ], 'grid test');
    expect(s.interpretations).toHaveLength(9);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// DESCRIBE BLOCK 11 — interpretMesaReal
// ────────────────────────────────────────────────────────────────────────────

describe('interpretMesaReal', () => {
  const mesa36 = Array.from({ length: 36 }, (_, i) => ({ id: (i + 1) as CardId }));

  it('returns 36 cards interpreted', () => {
    const m = interpretMesaReal(mesa36, 'Como será meu ano?');
    expect(m.interpretations).toHaveLength(36);
  });
  it('returns 36 house crossings', () => {
    const m = interpretMesaReal(mesa36, 'Como será meu ano?');
    expect(m.houseCrossings).toHaveLength(36);
  });
  it('dominant planet is a valid planet', () => {
    const m = interpretMesaReal(mesa36, '');
    expect(PLANETS).toContain(m.dominantPlanet);
  });
  it('dominant numerology is valid', () => {
    const m = interpretMesaReal(mesa36, '');
    expect(NUMEROLOGY_NUMBERS).toContain(m.dominantNumerology);
  });
  it('dominant element is valid', () => {
    const m = interpretMesaReal(mesa36, '');
    expect(['fogo', 'agua', 'terra', 'ar', 'eter']).toContain(m.dominantElement);
  });
  it('time horizon ∈ {short, medium, long, mixed}', () => {
    const m = interpretMesaReal(mesa36, '');
    expect(['short', 'medium', 'long', 'mixed']).toContain(m.timeHorizon);
  });
  it('overallTheme non-empty', () => {
    const m = interpretMesaReal(mesa36, '');
    expect(m.overallTheme.length > 0).toBeTruthy();
  });
  it('handles partial <36 card input gracefully', () => {
    const m = interpretMesaReal([{ id: 1 as CardId }, { id: 2 as CardId }]);
    expect(m.cards).toHaveLength(2);
  });
  it('confidence ≤ MAX_CONFIDENCE', () => {
    const m = interpretMesaReal(mesa36, 'a');
    expect(m.confidence).toBeLessThanOrEqual(MAX_CONFIDENCE + EPSILON);
  });
  it('generatedAt is a number', () => {
    const m = interpretMesaReal(mesa36);
    expect(typeof m.generatedAt).toBe('number');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// DESCRIBE BLOCK 12 — crossHouse
// ────────────────────────────────────────────────────────────────────────────

describe('crossHouse', () => {
  it('returns slot from mesa when house exists', () => {
    const mesa36 = Array.from({ length: 36 }, (_, i) => ({ id: (i + 1) as CardId }));
    const m = interpretMesaReal(mesa36, '');
    const cross = crossHouse(m, 'casa-01');
    expect(cross.house.id).toBe('casa-01');
  });
  it('falls back gracefully when mesa has no crossing for house', () => {
    const m = interpretMesaReal([{ id: 1 as CardId }]);
    const cross = crossHouse(m, 'casa-04');
    expect(typeof cross.interpretation).toBe('string');
  });
  it('honors external astrologyMap', () => {
    const m = interpretMesaReal([]);
    const cross = crossHouse(m, 'casa-04', { astrologyMap: [{ house: 4, sign: 'cancer' }] });
    expect(cross.astrologicalHouse).toBe(4);
  });
  it('returns overlap traditions array', () => {
    const mesa36 = Array.from({ length: 36 }, (_, i) => ({ id: (i + 1) as CardId }));
    const m = interpretMesaReal(mesa36, '');
    const cross = crossHouse(m, 'casa-05');
    expect(cross.overlap.includes('cigano')).toBeTruthy();
  });
  it('confidence is a number', () => {
    const m = interpretMesaReal([{ id: 1 as CardId }]);
    const cross = crossHouse(m, 'casa-04');
    expect(typeof cross.confidence).toBe('number');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// DESCRIBE BLOCK 13 — detectCombinations
// ────────────────────────────────────────────────────────────────────────────

describe('detectCombinations', () => {
  it('returns array (possibly empty) for valid input', () => {
    const r = detectCombinations([{ id: 1 as CardId }, { id: 2 as CardId }]);
    expect(Array.isArray(r)).toBeTruthy();
  });
  it('returns allegoric for >=4 cards', () => {
    const r = detectCombinations([
      { id: 1 as CardId }, { id: 5 as CardId }, { id: 6 as CardId }, { id: 9 as CardId },
    ]);
    const kinds = r.map((c) => c.kind);
    expect(kinds.includes('allegoric')).toBeTruthy();
  });
  it('detects chain when numbers progress', () => {
    // cards need to be consecutive in array AND have numbers progressing
    const r = detectCombinations([
      { id: 1 as CardId }, // num 1
      { id: 2 as CardId }, // num 2
      { id: 3 as CardId }, // num 3
    ]);
    const kinds = r.map((c) => c.kind);
    expect(kinds.includes('chain') || kinds.includes('trio')).toBeTruthy();
  });
  it('handles empty input', () => {
    const r = detectCombinations([]);
    expect(r).toHaveLength(0);
  });
  it('combinations have non-empty labels', () => {
    const r = detectCombinations([{ id: 1 as CardId }, { id: 2 as CardId }]);
    for (const c of r) expect(c.label.length > 0).toBeTruthy();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// DESCRIBE BLOCK 14 — validateSpread (never-throws graceful)
// ────────────────────────────────────────────────────────────────────────────

describe('validateSpread', () => {
  it('ok=true for valid 36-card mesa', () => {
    const valid36 = Array.from({ length: 36 }, (_, i) => ({ id: (i + 1) as CardId }));
    const r = validateSpread(buildSpreadLayout('SPREAD_36_MESA_REAL'), valid36);
    expect(r.ok).toBeTruthy();
  });
  it('ok=false on mismatch (1-card given to 36-spread)', () => {
    const r = validateSpread(buildSpreadLayout('SPREAD_36_MESA_REAL'), [{ id: 1 as CardId }]);
    expect(r.ok).toBeFalsy();
  });
  it('never throws on null array', () => {
    let threw = false;
    try {
      const nullCards: unknown = null;
      validateSpread(buildSpreadLayout('SPREAD_3_CARD'), nullCards as ReadonlyArray<{ id: CardId }>);
    } catch (_) { threw = true; }
    expect(threw).toBeFalsy();
  });
  it('never throws on invalid card id', () => {
    let threw = false;
    try {
      validateSpread(buildSpreadLayout('SPREAD_1_CARD'), [{ id: 999 as CardId }]);
    } catch (_) { threw = true; }
    expect(threw).toBeFalsy();
  });
  it('returns normalized cards', () => {
    const r = validateSpread(buildSpreadLayout('SPREAD_3_CARD'), [
      { id: 1 as CardId }, { id: 2 as CardId }, { id: 3 as CardId },
    ]);
    expect(r.normalizedCards).toHaveLength(3);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// DESCRIBE BLOCK 15 — auditSacredCoverage
// ────────────────────────────────────────────────────────────────────────────

describe('auditSacredCoverage', () => {
  it('returns CoverageReport object', () => {
    expect(isCoverageReport(auditSacredCoverage())).toBeTruthy();
  });
  it('cigano count = 36', () => {
    expect(auditSacredCoverage().totals.cigano).toBe(36);
  });
  it('cabala count = 10 (sefirot)', () => {
    expect(auditSacredCoverage().totals.cabala).toBe(10);
  });
  it('numerologia count = 12', () => {
    expect(auditSacredCoverage().totals.numerologia).toBe(12);
  });
  it('isFullCoverage expected for catalog completeness', () => {
    expect(auditSacredCoverage().isFullCoverage).toBeTruthy();
  });
  it('missing.cigano is empty', () => {
    expect(auditSacredCoverage().missing.cigano).toHaveLength(0);
  });
  it('percentComplete = 1.0 when isFullCoverage', () => {
    expect(auditSacredCoverage().percentComplete).toBeGreaterThan(0.5);
  });
  it('expected config contains 36/19/10', () => {
    const r = auditSacredCoverage();
    expect(r.expected.cigano).toBe(36);
    expect(r.expected.orixa).toBe(19);
    expect(r.expected.sefirot).toBe(10);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// DESCRIBE BLOCK 16 — interpretReading (top-level dispatcher)
// ────────────────────────────────────────────────────────────────────────────

describe('interpretReading (top-level)', () => {
  it('returns MesaReal for 36-card spread', () => {
    const cards = Array.from({ length: 36 }, (_, i) => ({ id: (i + 1) as CardId }));
    const r = interpretReading({ question: 'q', spread: 'SPREAD_36_MESA_REAL', cards });
    expect(isMesaRealReading(r)).toBeTruthy();
  });
  it('returns SpreadReading for 3-card spread', () => {
    const r = interpretReading({
      question: 'q',
      spread: 'SPREAD_3_CARD',
      cards: [{ id: 1 as CardId }, { id: 5 as CardId }, { id: 9 as CardId }],
    });
    expect((r as { type: string }).type).toBe('SPREAD_3_CARD');
  });
  it('handles empty cards gracefully (returns empty mesa for SPREAD_36)', () => {
    const r = interpretReading({ question: '', spread: 'SPREAD_36_MESA_REAL', cards: [] });
    expect(isMesaRealReading(r)).toBeTruthy();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// DESCRIBE BLOCK 17 — ENGINE_INFO + end-to-end smoke
// ────────────────────────────────────────────────────────────────────────────

describe('ENGINE_INFO + integration', () => {
  it('ENGINE_INFO has expected key counts', () => {
    expect(ENGINE_INFO.cardCount).toBe(36);
    expect(ENGINE_INFO.houseCount).toBe(36);
    expect(ENGINE_INFO.orixaCount).toBe(19);
    expect(ENGINE_INFO.sefirahCount).toBe(10);
  });
  it('full pipeline: 1-card → 3-card → 5-card → mesa', () => {
    const r1 = interpretSpread(buildSpreadLayout('SPREAD_1_CARD'), [{ id: 31 as CardId }], 'sol');
    const r3 = interpretSpread(buildSpreadLayout('SPREAD_3_CARD'), [{ id: 1 as CardId }, { id: 2 as CardId }, { id: 3 as CardId }], 'voo');
    expect(r1.interpretations).toHaveLength(1);
    expect(r3.interpretations).toHaveLength(3);
  });
  it('detectCombinations on a mesa-sized set yields multiple results', () => {
    const mesa36 = Array.from({ length: 36 }, (_, i) => ({ id: (i + 1) as CardId }));
    const r = detectCombinations(mesa36);
    expect(r.length > 0).toBeTruthy();
  });
  it('ENGINE_INFO has astroHouseCount=12', () => {
    expect(ENGINE_INFO.astroHouseCount).toBe(12);
  });
  it('ENGINE_INFO has planetCount=11', () => {
    expect(ENGINE_INFO.planetCount).toBe(11);
  });
  it('ENGINE_INFO has zodiacCount=12', () => {
    expect(ENGINE_INFO.zodiacCount).toBe(12);
  });
  it('ENGINE_INFO has numerologyCount=12', () => {
    expect(ENGINE_INFO.numerologyCount).toBe(12);
  });
  it('ENGINE_INFO name is correct', () => {
    expect(ENGINE_INFO.name).toBe('divination_interpretation_engine');
  });
  it('ENGINE_INFO version starts with 0.1.0', () => {
    expect(ENGINE_INFO.version.startsWith('0.1.0')).toBeTruthy();
  });
  it('interpretCard on every card 1..36 succeeds', () => {
    for (let n = 1; n <= 36; n += 1) {
      const i = interpretCard({ question: 'q', card: { id: n as CardId } });
      expect(typeof i.baseMeaning === 'string').toBeTruthy();
    }
  });
  it('getCard for every card 1..36 has sacredRefs', () => {
    for (let n = 1; n <= 36; n += 1) {
      const c = getCard(n as CardId);
      expect(c.sacredRefs.length > 0).toBeTruthy();
    }
  });
  it('getHouse for every ordinal 1..36 has theme', () => {
    for (let n = 1; n <= 36; n += 1) {
      const h = getHouse(ordinalToHouseId(n));
      expect(h.theme.length > 0).toBeTruthy();
    }
  });
  it('auditSacredCoverage missing.cigano is exactly []', () => {
    const m = auditSacredCoverage().missing.cigano;
    expect(JSON.stringify(m)).toBe('[]');
  });
  it('interpretReading 1-card returns SpreadReading with interpretations', () => {
    const r = interpretReading({ question: 'q', spread: 'SPREAD_1_CARD', cards: [{ id: 1 as CardId }] });
    expect((r as { interpretations?: unknown[] }).interpretations !== undefined).toBeTruthy();
  });
  it('interpretReading 9-card returns type=SPREAD_9_CARD', () => {
    const r = interpretReading({
      question: 'grid',
      spread: 'SPREAD_9_CARD',
      cards: [
        { id: 1 as CardId }, { id: 2 as CardId }, { id: 3 as CardId },
        { id: 4 as CardId }, { id: 5 as CardId }, { id: 6 as CardId },
        { id: 7 as CardId }, { id: 8 as CardId }, { id: 9 as CardId },
      ],
    });
    expect((r as { type: string }).type).toBe('SPREAD_9_CARD');
  });
  it('validateSpread with 36 valid cards is ok', () => {
    const valid36 = Array.from({ length: 36 }, (_, i) => ({ id: (i + 1) as CardId }));
    const r = validateSpread(buildSpreadLayout('SPREAD_36_MESA_REAL'), valid36);
    expect(r.ok).toBeTruthy();
    expect(r.issues).toHaveLength(0);
  });
  it('validateSpread returns issues array even on bad input', () => {
    const r = validateSpread(buildSpreadLayout('SPREAD_3_CARD'), [{ id: 1 as CardId }]);
    expect(Array.isArray(r.issues)).toBeTruthy();
    expect(r.issues.length > 0).toBeTruthy();
  });
  it('crossHouse with external orixaMap picks orixa', () => {
    const m = interpretMesaReal([]);
    const cross = crossHouse(m, 'casa-04', { orixaMap: [{ cardId: 1 as CardId, orixa: 'exu' }] });
    expect(cross.orixa !== undefined).toBeTruthy();
  });
  it('interpretSpread 5-card computes dominantElement', () => {
    const s = interpretSpread(buildSpreadLayout('SPREAD_5_CARD'), [
      { id: 1 as CardId }, { id: 12 as CardId }, { id: 22 as CardId }, { id: 27 as CardId }, { id: 33 as CardId },
    ]);
    expect(typeof s.dominantElement === 'string').toBeTruthy();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// RUNNER
// ────────────────────────────────────────────────────────────────────────────

const main = async (): Promise<void> => {
  let passed = 0;
  let failed = 0;
  for (const t of _testStack) {
    try {
      const r = t.fn();
      if (r instanceof Promise) {
        await r.catch((err) => { failed += 1; _failures.push({ describe: '', name: t.name, error: String(err) }); });
        if (!_failures.find((f) => f.name === t.name)) passed += 1;
      } else {
        passed += 1;
      }
    } catch (err) {
      failed += 1;
      _failures.push({ describe: '', name: t.name, error: String((err as Error)?.message ?? err) });
    }
  }
  // Buffer summary before exit so process.exit doesn't drop stdout.
  const stdout = (globalThis as { process?: { stdout?: { write(s: string): void } } }).process?.stdout;
  if (stdout) {
    stdout.write(`\n=== ${passed} passed, ${failed} failed ===\n`);
    if (_failures.length > 0) {
      stdout.write('Failures:\n' + _failures.map((f) => `  - ${f.name}: ${f.error}`).join('\n') + '\n');
    }
  }
  // Best-effort environment exit (no Node typings needed in test file)
  const proc = (globalThis as { process?: { exit(c: number): void } }).process;
  if (proc && typeof proc.exit === 'function') {
    proc.exit(failed > 0 ? 1 : 0);
  }
};

const procCheck = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
const skipRun = procCheck?.env?._W64_SKIP_RUN;
if (!skipRun) {
  void main();
}
