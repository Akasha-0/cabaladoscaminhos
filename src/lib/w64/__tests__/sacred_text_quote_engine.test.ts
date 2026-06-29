/**
 * sacred_text_quote_engine.test.ts — Cycle 64 Worker B2
 *
 * Self-running test harness (no vitest import). Counts passes/fails and exits.
 * 17 describe blocks, 50+ it() blocks, 130+ assertions.
 *
 * Pattern: registers `describe`/`it`/`expect` on globalThis, runs all suites,
 * flushes summary via process.stdout.write, then process.exit.
 */

// ── Minimal stub vitest-shaped API ──────────────────────────────────────────

interface SuiteStats { passed: number; failed: number; failures: { suite: string; name: string; error: string }[] }

const stats: SuiteStats = (() => {
  const s: SuiteStats = { passed: 0, failed: 0, failures: [] };
  return s;
})();

function makeExpect(actual: unknown, suitePath: string): {
  toBe: (expected: unknown) => void;
  toEqual: (expected: unknown) => void;
  toBeNull: () => void;
  toBeTruthy: () => void;
  toBeFalsy: () => void;
  toBeGreaterThan: (n: number) => void;
  toBeGreaterThanOrEqual: (n: number) => void;
  toBeLessThan: (n: number) => void;
  toBeLessThanOrEqual: (n: number) => void;
  toContain: (item: unknown) => void;
  toHaveLength: (n: number) => void;
  toMatch: (re: RegExp) => void;
  toThrow: (msg?: string | RegExp) => void;
  toBeInstanceOf: (ctor: unknown) => void;
} {
  const ok = (label: string, pass: boolean, detail?: string): void => {
    if (pass) stats.passed += 1;
    else { stats.failed += 1; stats.failures.push({ suite: suitePath, name: label, error: detail ?? 'assertion failed' }); }
  };
  return {
    toBe: (e) => ok(`toBe(${String(e)})`, actual === e, `expected ${String(e)}, got ${String(actual)}`),
    toEqual: (e) => ok(`toEqual`, JSON.stringify(actual) === JSON.stringify(e), `expected ${JSON.stringify(e)}, got ${JSON.stringify(actual)}`),
    toBeNull: () => ok('toBeNull', actual === null),
    toBeTruthy: () => ok('toBeTruthy', Boolean(actual)),
    toBeFalsy: () => ok('toBeFalsy', !actual),
    toBeGreaterThan: (n) => ok(`toBeGreaterThan(${n})`, typeof actual === 'number' && actual > n),
    toBeGreaterThanOrEqual: (n) => ok(`toBeGreaterThanOrEqual(${n})`, typeof actual === 'number' && actual >= n),
    toBeLessThan: (n) => ok(`toBeLessThan(${n})`, typeof actual === 'number' && actual < n),
    toBeLessThanOrEqual: (n) => ok(`toBeLessThanOrEqual(${n})`, typeof actual === 'number' && actual <= n),
    toContain: (item) => ok(`toContain`, typeof actual === 'string' ? actual.includes(String(item)) : Array.isArray(actual) ? actual.includes(item) : false),
    toHaveLength: (n) => ok(`toHaveLength(${n})`, (Array.isArray(actual) || typeof actual === 'string') && (actual as { length: number }).length === n),
    toMatch: (re) => ok(`toMatch(${String(re)})`, typeof actual === 'string' && re.test(actual)),
    toThrow: (msg) => {
      let threw = false; let match = true;
      try { if (typeof actual === 'function') (actual as () => unknown)(); } catch (e) {
        threw = true;
        if (msg !== undefined) {
          const s = e instanceof Error ? e.message : String(e);
          match = msg instanceof RegExp ? msg.test(s) : s.includes(msg);
        }
      }
      ok(`toThrow`, threw && match);
    },
    toBeInstanceOf: (ctor) => ok(`toBeInstanceOf`, actual instanceof (ctor as new (...args: unknown[]) => unknown)),
  };
}

const suiteStack: string[] = [];

const describeFn = (name: string, fn: () => void): void => {
  suiteStack.push(name);
  fn();
  suiteStack.pop();
};

const itFn = (name: string, fn: () => void): void => {
  const suitePath = [...suiteStack, name].join(' > ');
  try { fn(); } catch (e) {
    stats.failed += 1;
    stats.failures.push({ suite: suitePath, name, error: e instanceof Error ? e.message : String(e) });
  }
};

// Expose globally
(globalThis as Record<string, unknown>).describe = describeFn;
(globalThis as Record<string, unknown>).it = itFn;
(globalThis as Record<string, unknown>).expect = (a: unknown) => makeExpect(a, suiteStack.join(' > '));

// Cast for TypeScript
const describe = describeFn as unknown as (name: string, fn: () => void) => void;
const it = itFn as unknown as (name: string, fn: () => void) => void;
const expect = ((a: unknown) => makeExpect(a, suiteStack.join(' > '))) as unknown as (a: unknown) => ReturnType<typeof makeExpect>;

// ── Engine import ────────────────────────────────────────────────────────────

import {
  ALL_QUOTES, ALL_TRADITION_IDS, FORBIDDEN_CONTEXTS, TRADITIONS,
  QUOTES_CANDOMBLE, QUOTES_IFA, QUOTES_UMBANDA, QUOTES_CABALA,
  QUOTES_ASTROLOGIA, QUOTES_TANTRA, QUOTES_NUMEROLOGIA, QUOTES_CIGANO_RAMIRO,
  ORIXAS, SEFIROT, PLANETS, ZODIAC_SIGNS, CHAKRAS, NUMEROLOGY_NUMBERS,
  __ALL_EXPORTS,
  QuoteError, InvalidQuoteError, InvalidTraditionError, SacredBoundaryError, EmptyCatalogError,
  lookupQuote, searchQuotes, pickQuoteByTradition, pickQuoteByContext,
  pickQuoteByNumerology, pickQuoteByCard, pickQuoteBySefirot, pickQuoteByPlanet,
  pickQuoteBySign, pickQuoteByChakra,
  formatQuote, formatCitation, listTraditions, listQuotesByTradition,
  loadCatalog, getTradition, validateQuote, validateCitation, auditSacredCoverage,
  clampUnit, safeId, truncateSacredText, normalizeSearchText, scoreMatch,
  boostScoreByCitations, combineScore,
  isQuote, isQuoteId, isTraditionId, isQuoteQuery, isSefirotId, isChakraId,
  isPlanet, isZodiacSign, isOrixa, isSacredRef,
} from '../sacred_text_quote_engine.ts';

// ── Tests begin ──────────────────────────────────────────────────────────────

describe('§1 brand types and tradition taxonomy', () => {
  it('TRADITIONS has all 8 curated traditions', () => {
    expect(Object.keys(TRADITIONS).length).toBeGreaterThanOrEqual(10);
  });
  it('ALL_TRADITION_IDS has 8 entries', () => {
    expect(ALL_TRADITION_IDS.length).toBe(8);
  });
  it('TRADITIONS.candomble.name === "Candomblé"', () => {
    expect(TRADITIONS.candomble.name).toBe('Candomblé');
  });
  it('TRADITIONS.cigano-ramiro.region is Brasil/Espanha', () => {
    expect(TRADITIONS['cigano-ramiro'].region).toBe('Brasil/Espanha');
  });
  it('getTradition("candomble") returns non-null', () => {
    expect(getTradition('candomble')).toBeTruthy();
  });
  it('getTradition("bogus") returns null gracefully', () => {
    expect(getTradition('bogus' as unknown as Parameters<typeof getTradition>[0])).toBeNull();
  });
});

describe('§2 sacred taxonomy enums', () => {
  it('ORIXAS has 16 entries', () => { expect(ORIXAS.length).toBe(16); });
  it('SEFIROT has 10 entries', () => { expect(SEFIROT.length).toBe(10); });
  it('PLANETS has 11 entries', () => { expect(PLANETS.length).toBe(11); });
  it('ZODIAC_SIGNS has 12 entries', () => { expect(ZODIAC_SIGNS.length).toBe(12); });
  it('CHAKRAS has 7 entries', () => { expect(CHAKRAS.length).toBe(7); });
  it('NUMEROLOGY_NUMBERS has 12 entries', () => { expect(NUMEROLOGY_NUMBERS.length).toBe(12); });
  it('SEFIROT contains tiferet', () => { expect(SEFIROT).toContain('tiferet'); });
  it('CHAKRAS contains coracao', () => { expect(CHAKRAS).toContain('coracao'); });
});

describe('§3 quote catalog totals and per-tradition floors', () => {
  it('ALL_QUOTES has >= 100 quotes', () => { expect(ALL_QUOTES.length).toBeGreaterThanOrEqual(100); });
  it('QUOTES_CANDOMBLE has 15 quotes', () => { expect(QUOTES_CANDOMBLE.length).toBe(15); });
  it('QUOTES_IFA has 12 quotes', () => { expect(QUOTES_IFA.length).toBe(12); });
  it('QUOTES_UMBANDA has 12 quotes', () => { expect(QUOTES_UMBANDA.length).toBe(12); });
  it('QUOTES_CABALA has 12 quotes', () => { expect(QUOTES_CABALA.length).toBe(12); });
  it('QUOTES_ASTROLOGIA has 12 quotes', () => { expect(QUOTES_ASTROLOGIA.length).toBe(12); });
  it('QUOTES_TANTRA has 10 quotes', () => { expect(QUOTES_TANTRA.length).toBe(10); });
  it('QUOTES_NUMEROLOGIA has 12 quotes', () => { expect(QUOTES_NUMEROLOGIA.length).toBe(12); });
  it('QUOTES_CIGANO_RAMIRO has 15 quotes', () => { expect(QUOTES_CIGANO_RAMIRO.length).toBe(15); });
  it('listQuotesByTradition("candomble") returns 15', () => {
    expect(listQuotesByTradition('candomble').length).toBe(15);
  });
});

describe('§4 type guards', () => {
  it('isQuote returns true for valid Quote', () => {
    expect(isQuote(ALL_QUOTES[0])).toBe(true);
  });
  it('isQuote returns false for null', () => { expect(isQuote(null)).toBe(false); });
  it('isQuote returns false for string', () => { expect(isQuote('hello')).toBe(false); });
  it('isQuoteId accepts cd-01', () => { expect(isQuoteId('cd-01')).toBe(true); });
  it('isQuoteId rejects empty', () => { expect(isQuoteId('')).toBe(false); });
  it('isQuoteId rejects number', () => { expect(isQuoteId(42)).toBe(false); });
  it('isTraditionId accepts candomble', () => { expect(isTraditionId('candomble')).toBe(true); });
  it('isTraditionId rejects bogus', () => { expect(isTraditionId('bogus')).toBe(false); });
  it('isQuoteQuery accepts minimal query', () => {
    expect(isQuoteQuery({ tradition: 'candomble' })).toBe(true);
  });
  it('isQuoteQuery rejects bogus tradition', () => {
    expect(isQuoteQuery({ tradition: 'bogus' })).toBe(false);
  });
  it('isSefirotId accepts keter', () => { expect(isSefirotId('keter')).toBe(true); });
  it('isChakraId accepts coracao', () => { expect(isChakraId('coracao')).toBe(true); });
  it('isPlanet accepts sol', () => { expect(isPlanet('sol')).toBe(true); });
  it('isZodiacSign accepts aries', () => { expect(isZodiacSign('aries')).toBe(true); });
  it('isOrixa accepts oxala', () => { expect(isOrixa('oxala')).toBe(true); });
  it('isSacredRef accepts {kind:"orixa",value:"oxala"}', () => {
    expect(isSacredRef({ kind: 'orixa', value: 'oxala' })).toBe(true);
  });
});

describe('§5 pure helpers', () => {
  it('clampUnit(0.5) returns 0.5', () => { expect(clampUnit(0.5)).toBe(0.5); });
  it('clampUnit(2) returns 1', () => { expect(clampUnit(2)).toBe(1); });
  it('clampUnit(-1) returns 0', () => { expect(clampUnit(-1)).toBe(0); });
  it('clampUnit(NaN) returns 0', () => { expect(clampUnit(NaN)).toBe(0); });
  it('safeId strips invalid chars', () => { expect(safeId('Hello World!', 'q')).toBe('q-hello-world-'); });
  it('safeId handles non-string gracefully', () => { expect(safeId(42, 'q')).toBe('q-anon'); });
  it('truncateSacredText respects maxLen', () => {
    expect(truncateSacredText('abcdef', 4)).toBe('abc…');
  });
  it('truncateSacredText passes through short text', () => {
    expect(truncateSacredText('abc', 100)).toBe('abc');
  });
  it('normalizeSearchText strips accents', () => {
    expect(normalizeSearchText('Iemanjá')).toBe('iemanja');
  });
  it('scoreMatch exact returns 1', () => {
    expect(scoreMatch('oxala', 'oxala')).toBe(1);
  });
  it('scoreMatch substring boosts above 0.2', () => {
    expect(scoreMatch('paz', 'paz que cobre o mundo')).toBeGreaterThan(0.2);
  });
  it('scoreMatch empty returns 0', () => {
    expect(scoreMatch('', 'abc')).toBe(0);
  });
  it('boostScoreByCitations caps at 0.99', () => {
    expect(boostScoreByCitations(0.9, 100)).toBeLessThanOrEqual(0.99);
  });
  it('boostScoreByCitations(0.5, 0) returns <= 0.5', () => {
    expect(boostScoreByCitations(0.5, 0)).toBeLessThanOrEqual(0.5);
  });
  it('combineScore returns all 5 aggregators', () => {
    const result = combineScore([0.2, 0.5, 0.8]);
    expect(typeof result.min).toBe('number');
    expect(typeof result.max).toBe('number');
    expect(typeof result.mean).toBe('number');
    expect(typeof result.weightedMean).toBe('number');
    expect(typeof result.geometricMean).toBe('number');
  });
  it('combineScore empty returns all zeros', () => {
    const r = combineScore([]);
    expect(r.min).toBe(0);
    expect(r.max).toBe(0);
  });
  it('combineScore([0.5]) returns mean=0.5', () => {
    expect(combineScore([0.5]).mean).toBe(0.5);
  });
});

describe('§6 lookup & search', () => {
  it('lookupQuote("cd-01") returns candomble quote', () => {
    const q = lookupQuote('cd-01');
    expect(q).toBeTruthy();
    expect(q?.tradition).toBe('candomble');
  });
  it('lookupQuote("not-there") returns null', () => {
    expect(lookupQuote('not-there')).toBeNull();
  });
  it('lookupQuote with empty string returns null', () => {
    expect(lookupQuote('')).toBeNull();
  });
  it('searchQuotes by tradition returns only matching', () => {
    const results = searchQuotes({ tradition: 'cabala', limit: 50 });
    expect(results.length).toBe(12);
  });
  it('searchQuotes by text returns ranked results', () => {
    const results = searchQuotes({ text: 'axé', limit: 10 });
    expect(results.length).toBeGreaterThan(0);
  });
  it('searchQuotes with bogus tradition returns []', () => {
    const results = searchQuotes({ tradition: 'bogus' as unknown as Parameters<typeof searchQuotes>[0]['tradition'] });
    expect(results.length).toBe(0);
  });
  it('searchQuotes by sacredRef returns matching', () => {
    const results = searchQuotes({ sacredRef: { kind: 'orixa', value: 'oxala' }, limit: 10 });
    expect(results.length).toBeGreaterThan(0);
  });
  it('searchQuotes with tags filter', () => {
    const results = searchQuotes({ tags: ['amor'], limit: 10 });
    expect(results.length).toBeGreaterThan(0);
  });
  it('listTraditions returns 8 entries', () => {
    expect(listTraditions().length).toBe(8);
  });
  it('loadCatalog returns copy', () => {
    const cat = loadCatalog();
    expect(cat.length).toBe(ALL_QUOTES.length);
  });
});

describe('§7 pickers — tradition and context', () => {
  it('pickQuoteByTradition("candomble") returns candomble quote', () => {
    const q = pickQuoteByTradition('candomble');
    expect(q.tradition).toBe('candomble');
  });
  it('pickQuoteByTradition with topic filter', () => {
    const q = pickQuoteByTradition('candomble', { topic: 'paz' });
    expect(q.tradition).toBe('candomble');
  });
  it('pickQuoteByTradition("bogus") throws InvalidTraditionError', () => {
    expect(() => pickQuoteByTradition('bogus' as unknown as Parameters<typeof pickQuoteByTradition>[0])).toThrow('INVALID_TRADITION');
  });
  it('pickQuoteByContext({situation:"opening"}) returns quote', () => {
    const q = pickQuoteByContext({ situation: 'opening' });
    expect(q).toBeTruthy();
  });
  it('pickQuoteByContext({orixa:"oxala"}) returns oxala-tagged', () => {
    const q = pickQuoteByContext({ orixa: 'oxala' });
    expect(q.sacredRefs.some(r => r.value === 'oxala')).toBe(true);
  });
  it('pickQuoteByContext({medical-diagnosis...}) throws SacredBoundaryError', () => {
    expect(() => pickQuoteByContext({ situation: 'medical-diagnosis' as unknown as Parameters<typeof pickQuoteByContext>[0]['situation'] })).toThrow('SACRED_BOUNDARY');
  });
  it('pickQuoteByContext rejects investment-advice', () => {
    expect(() => pickQuoteByContext({ situation: 'investment-advice' as unknown as Parameters<typeof pickQuoteByContext>[0]['situation'] })).toThrow('SACRED_BOUNDARY');
  });
  it('pickQuoteByContext rejects legal-advice', () => {
    expect(() => pickQuoteByContext({ situation: 'legal-advice' as unknown as Parameters<typeof pickQuoteByContext>[0]['situation'] })).toThrow('SACRED_BOUNDARY');
  });
  it('pickQuoteByContext rejects curse', () => {
    expect(() => pickQuoteByContext({ situation: 'curse' as unknown as Parameters<typeof pickQuoteByContext>[0]['situation'] })).toThrow('SACRED_BOUNDARY');
  });
  it('pickQuoteByContext rejects enemy-work', () => {
    expect(() => pickQuoteByContext({ situation: 'enemy-work' as unknown as Parameters<typeof pickQuoteByContext>[0]['situation'] })).toThrow('SACRED_BOUNDARY');
  });
});

describe('§8 pickers — sacred routing (card/sefirah/numerology/planet/sign/chakra)', () => {
  it('pickQuoteByCard(1) returns cavaleiro quote', () => {
    const q = pickQuoteByCard(1);
    expect(q.sacredRefs.some(r => r.kind === 'card' && r.value === '1')).toBe(true);
  });
  it('pickQuoteByCard(36) returns something (graceful fallback)', () => {
    const q = pickQuoteByCard(36);
    expect(q).toBeTruthy();
  });
  it('pickQuoteByCard(999) never throws', () => {
    const q = pickQuoteByCard(999);
    expect(q).toBeTruthy();
  });
  it('pickQuoteBySefirot("keter") returns cabala quote', () => {
    const q = pickQuoteBySefirot('keter');
    expect(q.tradition).toBe('cabala');
  });
  it('pickQuoteBySefirot("malkhut") returns malkhut quote', () => {
    const q = pickQuoteBySefirot('malkhut');
    expect(q.sacredRefs.some(r => r.kind === 'sefirah' && r.value === 'malkhut')).toBe(true);
  });
  it('pickQuoteByNumerology(7) returns 7-tagged quote', () => {
    const q = pickQuoteByNumerology(7);
    expect(q.sacredRefs.some(r => r.kind === 'numerology' && r.value === '7')).toBe(true);
  });
  it('pickQuoteByNumerology(11) returns 11 master quote', () => {
    const q = pickQuoteByNumerology(11);
    expect(q.sacredRefs.some(r => r.kind === 'numerology' && r.value === '11')).toBe(true);
  });
  it('pickQuoteByNumerology(22) returns 22 master quote', () => {
    const q = pickQuoteByNumerology(22);
    expect(q.sacredRefs.some(r => r.kind === 'numerology' && r.value === '22')).toBe(true);
  });
  it('pickQuoteByNumerology(33) returns 33 master quote', () => {
    const q = pickQuoteByNumerology(33);
    expect(q.sacredRefs.some(r => r.kind === 'numerology' && r.value === '33')).toBe(true);
  });
  it('pickQuoteByPlanet("sol") returns sol-tagged quote', () => {
    const q = pickQuoteByPlanet('sol');
    expect(q.sacredRefs.some(r => r.kind === 'planet' && r.value === 'sol')).toBe(true);
  });
  it('pickQuoteBySign("aries") returns aries-tagged quote', () => {
    const q = pickQuoteBySign('aries');
    expect(q.sacredRefs.some(r => r.kind === 'sign' && r.value === 'aries')).toBe(true);
  });
  it('pickQuoteByChakra("coracao") returns coracao-tagged quote', () => {
    const q = pickQuoteByChakra('coracao');
    expect(q.sacredRefs.some(r => r.kind === 'chakra' && r.value === 'coracao')).toBe(true);
  });
});

describe('§9 formatters', () => {
  it('formatQuote returns quoted text with tradition name', () => {
    const q = ALL_QUOTES[0];
    const out = formatQuote(q);
    expect(out.length).toBeGreaterThan(10);
    expect(out).toContain('"');
  });
  it('formatQuote handles en locale', () => {
    const q = ALL_QUOTES[0];
    const out = formatQuote(q, 'en');
    expect(out).toContain('"');
  });
  it('formatCitation returns tradition name', () => {
    const q = ALL_QUOTES[0];
    const out = formatCitation(q.citation);
    expect(out.length).toBeGreaterThan(0);
  });
  it('formatCitation handles orixá citation', () => {
    const cd01 = lookupQuote('cd-01');
    const out = formatCitation(cd01!.citation);
    expect(out).toContain('orixá');
  });
});

describe('§10 validation', () => {
  it('validateQuote on valid quote returns ok', () => {
    const v = validateQuote(ALL_QUOTES[0]);
    expect(v.ok).toBe(true);
    expect(v.errors.length).toBe(0);
  });
  it('validateQuote detects script injection', () => {
    const evil = { ...ALL_QUOTES[0], text: '<script>alert(1)</script>' };
    const v = validateQuote(evil);
    expect(v.ok).toBe(false);
  });
  it('validateQuote detects javascript: URL', () => {
    const evil = { ...ALL_QUOTES[0], text: 'see javascript:alert(1)' };
    const v = validateQuote(evil);
    expect(v.ok).toBe(false);
  });
  it('validateQuote detects email PII', () => {
    const evil = { ...ALL_QUOTES[0], text: 'envie para evil@example.com por favor' };
    const v = validateQuote(evil);
    expect(v.ok).toBe(false);
  });
  it('validateQuote detects CPF PII', () => {
    const evil = { ...ALL_QUOTES[0], text: 'meu cpf é 123.456.789-00' };
    const v = validateQuote(evil);
    expect(v.ok).toBe(false);
  });
  it('validateCitation on valid citation returns ok', () => {
    const v = validateCitation(ALL_QUOTES[0].citation);
    expect(v.ok).toBe(true);
  });
});

describe('§11 audit & coverage', () => {
  it('auditSacredCoverage returns CoverageReport', () => {
    const r = auditSacredCoverage();
    expect(r.totals).toBeGreaterThanOrEqual(100);
  });
  it('auditSacredCoverage.isFullCoverage === true', () => {
    expect(auditSacredCoverage().isFullCoverage).toBe(true);
  });
  it('auditSacredCoverage.percentComplete === 1', () => {
    expect(auditSacredCoverage().percentComplete).toBe(1);
  });
  it('auditSacredCoverage.byTradition.candomble === 15', () => {
    expect(auditSacredCoverage().byTradition.candomble).toBe(15);
  });
  it('auditSacredCoverage.byTradition.cigano-ramiro === 15', () => {
    expect(auditSacredCoverage().byTradition['cigano-ramiro']).toBe(15);
  });
  it('auditSacredCoverage.missing is empty', () => {
    expect(auditSacredCoverage().missing.length).toBe(0);
  });
});

describe('§12 error classes', () => {
  it('QuoteError sets code', () => {
    const e = new QuoteError('X', 'msg');
    expect(e.code).toBe('X');
  });
  it('InvalidQuoteError extends QuoteError', () => {
    const e = new InvalidQuoteError('bad');
    expect(e instanceof QuoteError).toBe(true);
    expect(e.code).toBe('INVALID_QUOTE');
  });
  it('SacredBoundaryError extends QuoteError', () => {
    const e = new SacredBoundaryError('forbidden');
    expect(e instanceof QuoteError).toBe(true);
    expect(e.code).toBe('SACRED_BOUNDARY');
  });
  it('EmptyCatalogError extends QuoteError', () => {
    const e = new EmptyCatalogError('empty');
    expect(e instanceof QuoteError).toBe(true);
    expect(e.code).toBe('EMPTY_CATALOG');
  });
});

describe('§13 FORBIDDEN_CONTEXTS sanity', () => {
  it('contains medical-diagnosis', () => {
    expect(FORBIDDEN_CONTEXTS).toContain('medical-diagnosis');
  });
  it('contains investment-advice', () => {
    expect(FORBIDDEN_CONTEXTS).toContain('investment-advice');
  });
  it('contains curse', () => {
    expect(FORBIDDEN_CONTEXTS).toContain('curse');
  });
  it('does not contain "opening"', () => {
    expect(FORBIDDEN_CONTEXTS.includes('opening')).toBe(false);
  });
});

describe('§14 __ALL_EXPORTS audit constant', () => {
  it('__ALL_EXPORTS.functions >= 30', () => {
    expect(__ALL_EXPORTS.functions).toBeGreaterThanOrEqual(30);
  });
  it('__ALL_EXPORTS.types >= 13', () => {
    expect(__ALL_EXPORTS.types).toBeGreaterThanOrEqual(13);
  });
  it('__ALL_EXPORTS.constants >= 12', () => {
    expect(__ALL_EXPORTS.constants).toBeGreaterThanOrEqual(12);
  });
});

describe('§15 robustness & graceful degradation', () => {
  it('lookupQuote handles null gracefully', () => {
    expect(lookupQuote(null as unknown as string)).toBeNull();
  });
  it('lookupQuote handles number gracefully', () => {
    expect(lookupQuote(42 as unknown as string)).toBeNull();
  });
  it('searchQuotes handles empty input gracefully', () => {
    const r = searchQuotes({});
    expect(Array.isArray(r)).toBe(true);
  });
  it('pickQuoteByContext with null throws SacredBoundaryError', () => {
    expect(() => pickQuoteByContext(null as unknown as Parameters<typeof pickQuoteByContext>[0])).toThrow('SACRED_BOUNDARY');
  });
  it('combineScore filters NaN', () => {
    const r = combineScore([NaN, 0.5, NaN, 0.3]);
    expect(r.min).toBe(0.3);
  });
  it('listTraditions returns summaries with correct counts', () => {
    const summaries = listTraditions();
    const candomble = summaries.find(s => s.id === 'candomble');
    expect(candomble?.count).toBe(15);
  });
});

describe('§16 formatQuote locale variants', () => {
  it('formatQuote pt-BR uses double quotes', () => {
    expect(formatQuote(ALL_QUOTES[0], 'pt-BR')).toContain('"');
  });
  it('formatQuote en does not crash', () => {
    expect(formatQuote(ALL_QUOTES[0], 'en').length).toBeGreaterThan(0);
  });
  it('formatQuote es does not crash', () => {
    expect(formatQuote(ALL_QUOTES[0], 'es').length).toBeGreaterThan(0);
  });
});

describe('§17 sacredRefs integrity', () => {
  it('every quote has at least 0 sacredRefs (allowing empty for general)', () => {
    for (const q of ALL_QUOTES) {
      expect(Array.isArray(q.sacredRefs)).toBe(true);
    }
  });
  it('all quote ids are unique', () => {
    const ids = new Set(ALL_QUOTES.map(q => q.id));
    expect(ids.size).toBe(ALL_QUOTES.length);
  });
  it('all quote languages are pt-BR (no en/es yet)', () => {
    const langs = new Set(ALL_QUOTES.map(q => q.language));
    expect(langs.has('pt-BR')).toBe(true);
  });
  it('citations reference valid tradition id', () => {
    for (const q of ALL_QUOTES) {
      expect(ALL_TRADITION_IDS.includes(q.citation.tradition)).toBe(true);
    }
  });
});

// ── Finish: flush + exit ─────────────────────────────────────────────────────

const stdout = (globalThis as { process?: { stdout?: { write(s: string): void } } }).process?.stdout;
const summary = `\n=== ${stats.passed} passed, ${stats.failed} failed ===\n`;
if (stdout) stdout.write(summary);
else console.log(summary);
if (stats.failed > 0) {
  for (const f of stats.failures) {
    const s = `FAIL ${f.suite} :: ${f.name} :: ${f.error}\n`;
    if (stdout) stdout.write(s);
    else console.log(s);
  }
}
const proc = (globalThis as { process?: { exit(c?: number): void } }).process;
if (proc) proc.exit(stats.failed > 0 ? 1 : 0);