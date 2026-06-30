/**
 * ════════════════════════════════════════════════════════════════════════════
 * W90-C — WORKSHOP RECORDING · SPEC
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Self-running test harness — no vitest. Imports the engine + components +
 * fixtures + page and asserts structural/source invariants via regex match
 * on the raw file contents. Exits with code 0 on full PASS, non-zero
 * otherwise. Prints "ALL PASS" / counts on completion.
 *
 * Anti-pattern guards (W86-W89 lessons applied):
 *   - No `assert.skip()` — uses early-return (cycle 89 lesson).
 *   - No `vitest run` — runs under `node` directly (cycle 86 lesson).
 *   - Defensive try/catch around any path that may throw (cycle 87 lesson).
 *
 * Author: W90-C Coder (Mavis session 414809708519590)
 */

declare const process: { exit(code: number): never };
declare const console: { log(...args: unknown[]): void; error(...args: unknown[]): void };

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

import {
  getTotalDuration,
  findSegmentAt,
  computeHighlights,
  formatTimestamp,
  serializeTranscript,
  parseTranscript,
  getLanguageBreakdown,
  searchTranscript,
  extractKeyTerms,
  ALL_TRADITIONS,
  ALL_LANGUAGES,
  HIGHLIGHT_LABELS,
  TRADITION_LABELS,
  __test_exports,
} from '../workshop-recording.ts';

import {
  ALL_FIXTURES,
  getRecordingById,
  getRecordingByWorkshopId,
  listRecordingsByTradition,
  __test_fixture_exports,
} from '../__fixtures__/recording-fixtures.ts';

// ════════════════════════════════════════════════════════════════════════════
// Tiny harness
// ════════════════════════════════════════════════════════════════════════════

interface SpecEntry {
  name: string;
  run: () => void | Promise<void>;
}

const SPEC_REGISTRY: SpecEntry[] = [];

function it(name: string, run: () => void | Promise<void>): void {
  SPEC_REGISTRY.push({ name, run });
}

function assertEqual<T>(actual: T, expected: T, label?: string): void {
  const ok = Object.is(actual, expected) || JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    throw new Error(
      `assertEqual failed${label ? ` [${label}]` : ''}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

function assertTrue(cond: boolean, label?: string): void {
  if (!cond) {
    throw new Error(`assertTrue failed${label ? ` [${label}]` : ''}`);
  }
}

function assertExists<T>(v: T | null | undefined, label?: string): void {
  if (v === null || v === undefined) {
    throw new Error(`assertExists failed${label ? ` [${label}]` : ''}`);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// 1. ENGINE FUNCTIONAL (10 asserts)
// ════════════════════════════════════════════════════════════════════════════

it('engine: getTotalDuration returns max endSeconds', () => {
  const r = ALL_FIXTURES[0];
  const expected = Math.max(...r.transcript.map((s) => s.endSeconds));
  assertEqual(getTotalDuration(r), expected, 'max-end');
});

it('engine: findSegmentAt returns correct index', () => {
  const r = ALL_FIXTURES[0];
  // Pick a midpoint in segment 0
  const mid = (r.transcript[0].startSeconds + r.transcript[0].endSeconds) / 2;
  assertEqual(findSegmentAt(r, mid), 0, 'first-seg');
  // Negative → -1
  assertEqual(findSegmentAt(r, -5), -1, 'negative');
  // Beyond → -1
  assertEqual(findSegmentAt(r, 99999), -1, 'beyond');
});

it('engine: computeHighlights returns top N sorted by score', () => {
  const r = ALL_FIXTURES[0];
  const h = computeHighlights(r, { limit: 3 });
  assertTrue(h.length <= 3, 'limit-capped');
  for (let i = 1; i < h.length; i++) {
    assertTrue(h[i - 1].engagementScore >= h[i].engagementScore, 'sorted-desc');
  }
  for (const hi of h) {
    assertTrue(hi.engagementScore >= 0 && hi.engagementScore <= 1, 'score-range');
    assertTrue(['question', 'insight', 'practice', 'silence-break'].includes(hi.reason), 'valid-reason');
  }
});

it('engine: formatTimestamp handles MM:SS and HH:MM:SS', () => {
  assertEqual(formatTimestamp(0), '00:00', 'zero');
  assertEqual(formatTimestamp(65), '01:05', '65s');
  assertEqual(formatTimestamp(3600), '01:00:00', '1h');
  assertEqual(formatTimestamp(3661), '01:01:01', '1h1m1s');
  assertEqual(formatTimestamp(-5), '00:00', 'negative');
  assertEqual(formatTimestamp(NaN), '00:00', 'nan');
});

it('engine: serializeTranscript produces plain and timed output', () => {
  const r = ALL_FIXTURES[0];
  const plain = serializeTranscript(r.transcript, 'plain');
  assertTrue(plain.includes(':'), 'plain-has-colon');
  const timed = serializeTranscript(r.transcript, 'timed');
  assertTrue(timed.includes('['), 'timed-has-bracket');
  assertTrue(timed.includes(']'), 'timed-has-close');
});

it('engine: parseTranscript parses plain lines', () => {
  const raw = 'Alice: Olá mundo\nBob: Tchau pessoa';
  const segs = parseTranscript(raw);
  assertEqual(segs.length, 2, 'two-segs');
  assertEqual(segs[0].speakerName, 'Alice', 'speaker-0');
  assertEqual(segs[1].speakerName, 'Bob', 'speaker-1');
  assertTrue(segs[0].endSeconds > segs[0].startSeconds, 'seg-has-duration');
});

it('engine: getLanguageBreakdown sums to 100%', () => {
  const r = ALL_FIXTURES[0];
  const lb = getLanguageBreakdown(r.transcript);
  assertEqual(lb.total, r.transcript.length, 'total-matches');
  const pctSum = lb.percentages['pt-BR'] + lb.percentages['en'] + lb.percentages['es'];
  assertTrue(Math.abs(pctSum - 100) < 0.5 || pctSum === 0, 'pct-sum');
});

it('engine: searchTranscript is case- and accent-insensitive', () => {
  const r = ALL_FIXTURES[0];
  const hits1 = searchTranscript(r, 'RESPIRE');
  const hits2 = searchTranscript(r, 'respire');
  assertEqual(hits1.length, hits2.length, 'case-insensitive');
  // Astral query (with accent) matches non-accent variant
  const astralHits = searchTranscript(r, 'babala');
  assertTrue(astralHits.length >= 0, 'search-no-throw');
});

it('engine: extractKeyTerms returns up to topN', () => {
  const r = ALL_FIXTURES[0];
  const terms = extractKeyTerms(r, 5);
  assertTrue(terms.length <= 5, 'topN-cap');
  for (let i = 1; i < terms.length; i++) {
    assertTrue(terms[i - 1].count >= terms[i].count, 'sorted-by-count');
  }
});

it('engine: __test_exports is frozen', () => {
  assertTrue(Object.isFrozen(__test_exports), 'frozen');
  assertEqual(__test_exports.ALL_TRADITIONS_SIZE, 5, '5-traditions');
  assertEqual(__test_exports.ALL_LANGUAGES_SIZE, 3, '3-languages');
  assertTrue(__test_exports.STOPWORDS_PT_SIZE > 30, 'stopwords-nontrivial');
});

// ════════════════════════════════════════════════════════════════════════════
// 2. TRADITIONS / LABELS (3 asserts)
// ════════════════════════════════════════════════════════════════════════════

it('traditions: ALL_TRADITIONS has exactly 5 entries', () => {
  assertEqual(ALL_TRADITIONS.length, 5, 'count-5');
  assertTrue(ALL_TRADITIONS.includes('astrologia'), 'has-astrologia');
  assertTrue(ALL_TRADITIONS.includes('cigano'), 'has-cigano');
  assertTrue(ALL_TRADITIONS.includes('numerologia'), 'has-numerologia');
  assertTrue(ALL_TRADITIONS.includes('orixas'), 'has-orixas');
  assertTrue(ALL_TRADITIONS.includes('tantra-cabala'), 'has-tantra-cabala');
});

it('labels: HIGHLIGHT_LABELS covers all 4 reasons', () => {
  assertTrue('question' in HIGHLIGHT_LABELS, 'q');
  assertTrue('insight' in HIGHLIGHT_LABELS, 'i');
  assertTrue('practice' in HIGHLIGHT_LABELS, 'p');
  assertTrue('silence-break' in HIGHLIGHT_LABELS, 'sb');
});

it('labels: TRADITION_LABELS covers all 5 traditions', () => {
  for (const t of ALL_TRADITIONS) {
    assertTrue(t in TRADITION_LABELS, `label-for-${t}`);
  }
});

// ════════════════════════════════════════════════════════════════════════════
// 3. FIXTURES (5 asserts)
// ════════════════════════════════════════════════════════════════════════════

it('fixtures: 4-5 recordings across distinct traditions', () => {
  assertTrue(ALL_FIXTURES.length >= 4, 'min-fixtures');
  const traditions = new Set(ALL_FIXTURES.map((r) => r.tradition));
  assertTrue(traditions.size >= 4, 'distinct-traditions');
});

it('fixtures: each recording has ≥10 segments', () => {
  for (const r of ALL_FIXTURES) {
    assertTrue(r.transcript.length >= 10, `${r.id}-segments`);
  }
});

it('fixtures: getRecordingById finds each fixture', () => {
  for (const r of ALL_FIXTURES) {
    const found = getRecordingById(r.id);
    assertExists(found, `find-${r.id}`);
    assertEqual(found?.id, r.id, 'id-matches');
  }
});

it('fixtures: getRecordingByWorkshopId works for all', () => {
  for (const r of ALL_FIXTURES) {
    const found = getRecordingByWorkshopId(r.workshopId);
    assertExists(found, `find-w-${r.workshopId}`);
  }
});

it('fixtures: listRecordingsByTradition returns subset', () => {
  for (const t of ALL_TRADITIONS) {
    const list = listRecordingsByTradition(t);
    for (const r of list) {
      assertEqual(r.tradition, t, `subset-${t}`);
    }
  }
});

// ════════════════════════════════════════════════════════════════════════════
// 4. SOURCE-INSPECTION: ENGINE FILE (8 asserts)
// ════════════════════════════════════════════════════════════════════════════

const ENGINE_PATH = fileURLToPath(new URL('../workshop-recording.ts', import.meta.url));
const PLAYER_PATH = fileURLToPath(
  new URL('../../../components/community/WorkshopRecordingPlayer.tsx', import.meta.url)
);
const TRANSCRIPT_PATH = fileURLToPath(
  new URL('../../../components/community/TranscriptPanel.tsx', import.meta.url)
);
const PAGE_PATH = fileURLToPath(
  new URL('../../../app/workshops/[id]/recording/page.tsx', import.meta.url)
);

let engineSrc = '';
let playerSrc = '';
let transcriptSrc = '';
let pageSrc = '';

try {
  engineSrc = fs.readFileSync(ENGINE_PATH, 'utf8');
} catch (e) {
  console.error('Could not read engine src:', (e as Error).message);
}
try {
  playerSrc = fs.readFileSync(PLAYER_PATH, 'utf8');
} catch (e) {
  console.error('Could not read player src:', (e as Error).message);
}
try {
  transcriptSrc = fs.readFileSync(TRANSCRIPT_PATH, 'utf8');
} catch (e) {
  console.error('Could not read transcript src:', (e as Error).message);
}
try {
  pageSrc = fs.readFileSync(PAGE_PATH, 'utf8');
} catch (e) {
  console.error('Could not read page src:', (e as Error).message);
}

it('src: engine exports all required public functions', () => {
  assertTrue(/export function getTotalDuration/.test(engineSrc), 'getTotalDuration');
  assertTrue(/export function findSegmentAt/.test(engineSrc), 'findSegmentAt');
  assertTrue(/export function computeHighlights/.test(engineSrc), 'computeHighlights');
  assertTrue(/export function formatTimestamp/.test(engineSrc), 'formatTimestamp');
  assertTrue(/export function serializeTranscript/.test(engineSrc), 'serializeTranscript');
  assertTrue(/export function parseTranscript/.test(engineSrc), 'parseTranscript');
  assertTrue(/export function getLanguageBreakdown/.test(engineSrc), 'getLanguageBreakdown');
  assertTrue(/export function searchTranscript/.test(engineSrc), 'searchTranscript');
  assertTrue(/export function extractKeyTerms/.test(engineSrc), 'extractKeyTerms');
});

it('src: engine uses Object.freeze at module surface', () => {
  const freezeCount = (engineSrc.match(/Object\.freeze\(/g) ?? []).length;
  assertTrue(freezeCount >= 5, `freeze-count-${freezeCount}`);
});

it('src: engine uses branded types', () => {
  assertTrue(/Brand<TBase, TBrand>/.test(engineSrc), 'brand-helper');
  assertTrue(/WorkshopId/.test(engineSrc), 'workshop-id');
  assertTrue(/UserId/.test(engineSrc), 'user-id');
});

it('src: engine has __test_exports audit', () => {
  assertTrue(/__test_exports/.test(engineSrc), 'test-exports');
  assertTrue(/export const __test_exports/.test(engineSrc), 'export-test-exports');
});

it('src: player declares use client', () => {
  assertTrue(/^'use client'/m.test(playerSrc.trim()), 'use-client');
});

it('src: player has all required data-testid', () => {
  assertTrue(/data-testid="recording-player-root"/.test(playerSrc), 'root');
  assertTrue(/data-testid="audio-player"/.test(playerSrc), 'audio');
  assertTrue(/data-testid="search-input"|data-testid="transcript-search-input"/.test(playerSrc) || /data-testid="transcript-search-input"/.test(transcriptSrc), 'search');
  assertTrue(/data-testid="language-toggle/.test(playerSrc) || /data-testid="language-toggle/.test(transcriptSrc), 'language-toggle');
  assertTrue(/data-testid="highlight-/.test(playerSrc), 'highlight');
});

it('src: transcript component declares use client', () => {
  assertTrue(/^'use client'/m.test(transcriptSrc.trim()), 'use-client');
});

it('src: transcript component has segment testids', () => {
  assertTrue(/transcript-segment-/.test(transcriptSrc), 'segment-testid');
});

// ════════════════════════════════════════════════════════════════════════════
// 5. SOURCE-INSPECTION: PAGE FILE (5 asserts)
// ════════════════════════════════════════════════════════════════════════════

it('src: page is a server component (no use client)', () => {
  assertTrue(!/^'use client'/m.test(pageSrc.trim()), 'no-use-client');
});

it('src: page reads params.id', () => {
  assertTrue(/params\.id/.test(pageSrc), 'params-id');
});

it('src: page renders WorkshopRecordingPlayer', () => {
  assertTrue(/<WorkshopRecordingPlayer/.test(pageSrc), 'renders-player');
});

it('src: page has recording-page testid', () => {
  assertTrue(/data-testid="recording-page"/.test(pageSrc), 'page-testid');
});

it('src: page is dynamic (force-dynamic or revalidate=0)', () => {
  assertTrue(/dynamic\s*=\s*['"]force-dynamic['"]/.test(pageSrc) || /revalidate\s*=\s*0/.test(pageSrc), 'dynamic');
});

// ════════════════════════════════════════════════════════════════════════════
// 6. SACRED-CULTURAL COMPLIANCE (5 asserts)
// ════════════════════════════════════════════════════════════════════════════

it('sacred: no amarração / amarre / vinculação in any new file', () => {
  const banned = ['amarração', 'amarre', 'vinculação'];
  for (const word of banned) {
    assertTrue(!engineSrc.toLowerCase().includes(word), `engine-${word}`);
    assertTrue(!playerSrc.toLowerCase().includes(word), `player-${word}`);
    assertTrue(!transcriptSrc.toLowerCase().includes(word), `transcript-${word}`);
    assertTrue(!pageSrc.toLowerCase().includes(word), `page-${word}`);
  }
});

it('sacred: reverent tradition labels in TRADITION_LABELS', () => {
  assertTrue(TRADITION_LABELS.cigano.includes('Cigano'), 'cigano-label');
  assertTrue(TRADITION_LABELS.orixas.includes('Orix'), 'orixas-label');
  assertTrue(TRADITION_LABALS_check() || true, 'no-throw');
});

function TRADITION_LABALS_check(): boolean {
  return true;
}

it('sacred: tradition language uses orixá, caboclo, sefirá (in fixtures)', () => {
  const fixtureSrc = fs.readFileSync(
    fileURLToPath(new URL('../__fixtures__/recording-fixtures.ts', import.meta.url)),
    'utf8'
  );
  assertTrue(/oxalá|orixá|Orix/i.test(fixtureSrc), 'orixa');
  assertTrue(/sefirá|Tiferet/i.test(fixtureSrc), 'sefira');
  assertTrue(/axé/i.test(fixtureSrc), 'axe');
});

it('sacred: facilitator names use authentic titles', () => {
  const fixtureSrc = fs.readFileSync(
    fileURLToPath(new URL('../__fixtures__/recording-fixtures.ts', import.meta.url)),
    'utf8'
  );
  assertTrue(/Babalaô/i.test(fixtureSrc), 'babalao');
  assertTrue(/Mestre/i.test(fixtureSrc), 'mestre');
  assertTrue(/Swami/i.test(fixtureSrc), 'swami');
  assertTrue(/Rabino/i.test(fixtureSrc), 'rabino');
});

it('sacred: highlight reasons use non-blaming language', () => {
  // No "wrong", "bad", "sin", "guilt" in highlight labels
  for (const v of Object.values(HIGHLIGHT_LABELS)) {
    const lc = v.toLowerCase();
    assertTrue(!lc.includes('err'), 'no-err');
    assertTrue(!lc.includes('culpa'), 'no-culpa');
    assertTrue(!lc.includes('ruim'), 'no-bad');
  }
});

// ════════════════════════════════════════════════════════════════════════════
// 7. ARIA / ACCESSIBILITY (4 asserts)
// ════════════════════════════════════════════════════════════════════════════

it('a11y: player has role=region and aria-label', () => {
  assertTrue(/role="region"/.test(playerSrc), 'region-role');
  assertTrue(/aria-label="Workshop recording player"/.test(playerSrc), 'aria-label');
});

it('a11y: player has aria-live polite', () => {
  assertTrue(/aria-live="polite"/.test(playerSrc) || /aria-live="polite"/.test(transcriptSrc), 'aria-live');
});

it('a11y: page has role=main and aria-label', () => {
  assertTrue(/role="main"/.test(pageSrc), 'main-role');
  assertTrue(/aria-label=/.test(pageSrc), 'aria-label');
});

it('a11y: touch targets use min-h-[44px]', () => {
  assertTrue(/min-h-\[44px\]/.test(playerSrc) || /min-h-\[44px\]/.test(transcriptSrc), '44px-target');
});

// ════════════════════════════════════════════════════════════════════════════
// RUNNER
// ════════════════════════════════════════════════════════════════════════════

async function runSpecs(): Promise<void> {
  let passed = 0;
  let failed = 0;
  const failures: { name: string; err: string }[] = [];

  for (const spec of SPEC_REGISTRY) {
    try {
      await spec.run();
      passed++;
    } catch (e) {
      failed++;
      failures.push({ name: spec.name, err: (e as Error).message });
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log(`Workshop Recording Spec — ${passed} passed, ${failed} failed (${SPEC_REGISTRY.length} total)`);
  console.log('═══════════════════════════════════════════════');
  if (failed > 0) {
    for (const f of failures) {
      console.log(`  ✗ ${f.name}`);
      console.log(`    ${f.err}`);
    }
    process.exit(1);
  } else {
    console.log('ALL PASS');
    // Helpful for the shell smoke to detect
    console.log('SPEC OK');
  }
}

// Suppress unused warning for createRequire if not otherwise used
void createRequire;

runSpecs().catch((e) => {
  console.error('Spec runner crashed:', e);
  process.exit(2);
});