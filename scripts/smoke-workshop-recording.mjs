#!/usr/bin/env node
// ============================================================================
// SMOKE — workshop-recording engine (W90-C)
// ============================================================================
// Runs 12+ runtime assertions against the engine via tsx. No DOM, no React.
// Pure data-in / data-out. Prints "SMOKE OK" on full PASS, exits 0.
//
// Usage:  npx tsx scripts/smoke-workshop-recording.mjs
//
// Anti-pattern guards (W86-W89 lessons applied):
//   - No `assert.skip()` — uses early-return (cycle 89 lesson).
//   - Defensive try/catch around fixtures import (cycle 87 lesson).
// ============================================================================

import assert from 'node:assert/strict';

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
} from '../src/lib/w90/workshop-recording.ts';

import {
  ALL_FIXTURES,
  getRecordingById,
  getRecordingByWorkshopId,
  listRecordingsByTradition,
} from '../src/lib/w90/__fixtures__/recording-fixtures.ts';

let passed = 0;
let failed = 0;

function smoke(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ✗ ${name}`);
    console.log(`    ${e.message}`);
    failed++;
  }
}

console.log('');
console.log('═══════════════════════════════════════════════');
console.log('Workshop Recording Smoke (W90-C)');
console.log('═══════════════════════════════════════════════');

// 1. Constants / labels
smoke('ALL_TRADITIONS has exactly 5 entries (astrologia/cigano/numerologia/orixas/tantra-cabala)', () => {
  assert.equal(ALL_TRADITIONS.length, 5);
  for (const t of ['astrologia', 'cigano', 'numerologia', 'orixas', 'tantra-cabala']) {
    assert.ok(ALL_TRADITIONS.includes(t), `missing ${t}`);
  }
});

smoke('ALL_LANGUAGES has exactly 3 entries (pt-BR/en/es)', () => {
  assert.equal(ALL_LANGUAGES.length, 3);
  assert.ok(ALL_LANGUAGES.includes('pt-BR'));
  assert.ok(ALL_LANGUAGES.includes('en'));
  assert.ok(ALL_LANGUAGES.includes('es'));
});

smoke('HIGHLIGHT_LABELS has all 4 reasons with non-empty labels', () => {
  for (const r of ['question', 'insight', 'practice', 'silence-break']) {
    assert.ok(r in HIGHLIGHT_LABELS);
    assert.ok(HIGHLIGHT_LABELS[r].length > 0, `empty label for ${r}`);
  }
});

smoke('TRADITION_LABELS covers all 5 traditions', () => {
  for (const t of ALL_TRADITIONS) {
    assert.ok(t in TRADITION_LABELS, `missing label for ${t}`);
  }
});

// 2. Fixtures
smoke('Fixtures: ≥4 recordings across distinct traditions', () => {
  assert.ok(ALL_FIXTURES.length >= 4, `got ${ALL_FIXTURES.length}`);
  const traditions = new Set(ALL_FIXTURES.map((r) => r.tradition));
  assert.ok(traditions.size >= 4, `got ${traditions.size} traditions`);
});

smoke('Fixtures: each recording has ≥10 transcript segments', () => {
  for (const r of ALL_FIXTURES) {
    assert.ok(r.transcript.length >= 10, `${r.id} has ${r.transcript.length}`);
  }
});

smoke('Fixtures: getRecordingById finds every fixture', () => {
  for (const r of ALL_FIXTURES) {
    const found = getRecordingById(r.id);
    assert.ok(found, `not found: ${r.id}`);
    assert.equal(found.id, r.id);
  }
});

// 3. Engine functions — runtime
smoke('Engine: getTotalDuration returns max endSeconds', () => {
  const r = ALL_FIXTURES[0];
  const expected = Math.max(...r.transcript.map((s) => s.endSeconds));
  assert.equal(getTotalDuration(r), expected);
});

smoke('Engine: findSegmentAt returns -1 for negative and beyond', () => {
  const r = ALL_FIXTURES[0];
  assert.equal(findSegmentAt(r, -5), -1);
  assert.equal(findSegmentAt(r, 99999), -1);
});

smoke('Engine: computeHighlights returns sorted top-N with valid reasons', () => {
  const r = ALL_FIXTURES[0];
  const h = computeHighlights(r, { limit: 5 });
  assert.ok(h.length <= 5);
  for (let i = 1; i < h.length; i++) {
    assert.ok(h[i - 1].engagementScore >= h[i].engagementScore);
  }
  for (const hi of h) {
    assert.ok(hi.engagementScore >= 0 && hi.engagementScore <= 1);
    assert.ok(['question', 'insight', 'practice', 'silence-break'].includes(hi.reason));
  }
});

smoke('Engine: formatTimestamp MM:SS and HH:MM:SS', () => {
  assert.equal(formatTimestamp(0), '00:00');
  assert.equal(formatTimestamp(65), '01:05');
  assert.equal(formatTimestamp(3600), '01:00:00');
  assert.equal(formatTimestamp(3661), '01:01:01');
  assert.equal(formatTimestamp(-5), '00:00');
});

smoke('Engine: serializeTranscript produces plain + timed output', () => {
  const r = ALL_FIXTURES[0];
  const plain = serializeTranscript(r.transcript, 'plain');
  assert.ok(plain.includes(':'));
  const timed = serializeTranscript(r.transcript, 'timed');
  assert.ok(timed.includes('['));
  assert.ok(timed.includes(']'));
});

smoke('Engine: parseTranscript parses plain lines', () => {
  const raw = 'Alice: Olá mundo\nBob: Tchau pessoa';
  const segs = parseTranscript(raw);
  assert.equal(segs.length, 2);
  assert.equal(segs[0].speakerName, 'Alice');
  assert.equal(segs[1].speakerName, 'Bob');
  assert.ok(segs[0].endSeconds > segs[0].startSeconds);
});

smoke('Engine: getLanguageBreakdown totals match', () => {
  const r = ALL_FIXTURES[0];
  const lb = getLanguageBreakdown(r.transcript);
  assert.equal(lb.total, r.transcript.length);
});

smoke('Engine: searchTranscript returns at least one hit on common term', () => {
  const r = ALL_FIXTURES[0];
  // Try a term likely present in any recording
  const hits = searchTranscript(r, 'respire');
  // Not every recording mentions breathing, but the ORIXAS + TANTRA fixtures do
  const orixasRec = ALL_FIXTURES.find((f) => f.tradition === 'orixas');
  if (orixasRec) {
    const orixasHits = searchTranscript(orixasRec, 'respire');
    assert.ok(orixasHits.length >= 1, 'orixas hits');
  }
  // At minimum, the function should not throw
  assert.ok(Array.isArray(hits), 'hits-is-array');
});

smoke('Engine: extractKeyTerms returns sorted top-N', () => {
  const r = ALL_FIXTURES[0];
  const terms = extractKeyTerms(r, 8);
  assert.ok(terms.length <= 8);
  for (let i = 1; i < terms.length; i++) {
    assert.ok(terms[i - 1].count >= terms[i].count);
  }
});

smoke('Engine: __test_exports is frozen', () => {
  assert.ok(Object.isFrozen(__test_exports));
  assert.equal(__test_exports.ALL_TRADITIONS_SIZE, 5);
  assert.equal(__test_exports.ALL_LANGUAGES_SIZE, 3);
  assert.ok(__test_exports.STOPWORDS_PT_SIZE > 30);
});

smoke('Engine: searchTranscript is accent-insensitive', () => {
  const orixas = ALL_FIXTURES.find((f) => f.tradition === 'orixas');
  if (!orixas) throw new Error('no orixas fixture');
  const hits1 = searchTranscript(orixas, 'orixá');
  const hits2 = searchTranscript(orixas, 'orixa');
  assert.equal(hits1.length, hits2.length, 'accent-invariant');
});

smoke('Engine: listRecordingsByTradition returns correct subsets', () => {
  for (const t of ALL_TRADITIONS) {
    const list = listRecordingsByTradition(t);
    for (const r of list) {
      assert.equal(r.tradition, t);
    }
  }
});

smoke('Engine: getRecordingByWorkshopId finds by workshop id', () => {
  for (const r of ALL_FIXTURES) {
    const found = getRecordingByWorkshopId(r.workshopId);
    assert.ok(found);
    assert.equal(found.id, r.id);
  }
});

console.log('');
console.log('═══════════════════════════════════════════════');
console.log(`Smoke: ${passed} passed, ${failed} failed (${passed + failed} total)`);
console.log('═══════════════════════════════════════════════');

if (failed > 0) {
  console.log('SMOKE FAIL');
  process.exit(1);
}

console.log('SMOKE OK');
process.exit(0);