#!/usr/bin/env node --experimental-strip-types --no-warnings
/**
 * reputation-engine smoke — minimal end-to-end probe
 *
 * Run: `node --experimental-strip-types --no-warnings scripts/smoke/reputation-engine.ts`
 *
 * Exits with code 0 on PASS, code 1 on FAIL.
 */
import {
  EVENT_TYPES,
  TRADICOES,
  TRADICAO_LABELS,
  ZERO_HASH,
  appendEvent,
  appendEvents,
  canonicalizeEntry,
  computeEntryHash,
  getEntriesByTradicao,
  getEntriesByUsuario,
  getEntry,
  highestWeightEventFor,
  ledgerLength,
  normalizeTradicao,
  resolveMultiplier,
  scoreForUsuario,
  totalScore,
  validateChain,
  weightedDeltaFor,
  EMPTY_LEDGER,
  asLedgerEntryId,
  asUsuarioId,
  type ReputationEvent,
} from '../../src/lib/engines/reputation-engine/index.ts';

// ===========================================================================
// Mini test runner
// ===========================================================================

let pass = 0;
let fail = 0;
const failures: string[] = [];

function assert(cond: unknown, msg: string): void {
  if (cond) {
    pass++;
  } else {
    fail++;
    failures.push(msg);
  }
}

function assertEq<T>(actual: T, expected: T, msg: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    pass++;
  } else {
    fail++;
    failures.push(`${msg} | expected=${e} actual=${a}`);
  }
}

function assertThrows(fn: () => unknown, expectedSub: string, msg: string): void {
  try {
    fn();
    fail++;
    failures.push(`${msg} | did not throw`);
  } catch (e) {
    const msg2 = e instanceof Error ? e.message : String(e);
    if (msg2.includes(expectedSub)) {
      pass++;
    } else {
      fail++;
      failures.push(`${msg} | threw but message did not include "${expectedSub}": ${msg2}`);
    }
  }
}

// ===========================================================================
// Helpers
// ===========================================================================

let eventCounter = 0;
function makeEvent(over: Partial<ReputationEvent> = {}): ReputationEvent {
  eventCounter += 1;
  return {
    id: asLedgerEntryId(`smoke-${eventCounter.toString().padStart(4, '0')}`),
    usuarioId: asUsuarioId('user:smoke'),
    eventType: 'helpful_answer',
    baseDelta: 10,
    tradicao: 'cigano',
    occurredAt: '2026-06-30T09:00:00.000Z',
    note: 'smoke test event',
    ...over,
  };
}

// ===========================================================================
// 1. Boot — ledger empty
// ===========================================================================

assertEq(ledgerLength(EMPTY_LEDGER), 0, '[1] empty ledger length=0');
assertEq(validateChain(EMPTY_LEDGER).ok, true, '[2] empty chain valid');
assertEq(validateChain(EMPTY_LEDGER).errors.length, 0, '[3] empty chain no errors');

// ===========================================================================
// 2. Genesis append
// ===========================================================================

const genesis = appendEvent(EMPTY_LEDGER, makeEvent({ id: asLedgerEntryId('g-001') }));
assertEq(genesis.entry.seq, 1, '[4] genesis seq=1');
assertEq(genesis.entry.prevHash, ZERO_HASH, '[5] genesis prevHash=ZERO_HASH');
assertEq(genesis.ledger.length, 1, '[6] genesis ledger length=1');

// ===========================================================================
// 3. Multi-event append chain
// ===========================================================================

const events = [
  makeEvent({ id: asLedgerEntryId('s-001'), eventType: 'helpful_answer', tradicao: 'cigano', baseDelta: 10 }),
  makeEvent({ id: asLedgerEntryId('s-002'), eventType: 'ritual_share', tradicao: 'candomble', baseDelta: 5 }),
  makeEvent({ id: asLedgerEntryId('s-003'), eventType: 'mentorship_offer', tradicao: 'tantra', baseDelta: 8 }),
  makeEvent({ id: asLedgerEntryId('s-004'), eventType: 'feedback_given', tradicao: 'cigano', baseDelta: 2 }),
];
const built = appendEvents(EMPTY_LEDGER, events);
assertEq(built.ledger.length, 4, '[7] 4-event chain length=4');
assertEq(built.entries[0]?.seq, 1, '[8] first seq=1');
assertEq(built.entries[3]?.seq, 4, '[9] last seq=4');
assertEq(built.entries[1]?.prevHash, built.entries[0]?.hash, '[10] chain linkage e2.prev=e1.hash');
assertEq(built.entries[3]?.prevHash, built.entries[2]?.hash, '[11] chain linkage e4.prev=e3.hash');

// ===========================================================================
// 4. validateChain passes
// ===========================================================================

const report = validateChain(built.ledger);
assertEq(report.ok, true, '[12] 4-event chain reports ok');
assertEq(report.errors.length, 0, '[13] 4-event chain no errors');

// ===========================================================================
// 5. Score accumulation
// ===========================================================================

// Use alice's events only
const aliceEvents = [
  makeEvent({ id: asLedgerEntryId('a-001'), usuarioId: asUsuarioId('u:alice'), baseDelta: 10, eventType: 'helpful_answer', tradicao: 'cigano' }),
  makeEvent({ id: asLedgerEntryId('a-002'), usuarioId: asUsuarioId('u:alice'), baseDelta: 5, eventType: 'ritual_share', tradicao: 'candomble' }),
  makeEvent({ id: asLedgerEntryId('a-003'), usuarioId: asUsuarioId('u:alice'), baseDelta: 8, eventType: 'mentorship_offer', tradicao: 'tantra' }),
];
const aliceLedger = appendEvents(EMPTY_LEDGER, aliceEvents).ledger;
// 10*1.1 + 5*1.6 + 8*1.6 = 11 + 8 + 12.8 = 31.8
assertEq(scoreForUsuario(aliceLedger, asUsuarioId('u:alice')), 31.8, '[14] alice score = 31.8');
assertEq(totalScore(aliceLedger), 31.8, '[15] totalScore = alice score');

// ===========================================================================
// 6. Replay protection (duplicate id rejected)
// ===========================================================================

const replayed = makeEvent({ id: asLedgerEntryId('a-001') });
assertThrows(() => appendEvent(aliceLedger, replayed), 'Duplicate', '[16] replay rejected');

// ===========================================================================
// 7. NFD normalization
// ===========================================================================

assertEq(normalizeTradicao('CANDOMBLÉ'), 'candomble', '[17] NFD CANDOMBLÉ -> candomble');
assertEq(normalizeTradicao('Ifá'), 'ifa', '[18] NFD Ifá -> ifa');

// ===========================================================================
// 8. Weight matrix sanity
// ===========================================================================

assertEq(TRADICOES.length, 7, '[19] 7 tradições');
assertEq(EVENT_TYPES.length, 7, '[20] 7 event types');

// ===========================================================================
// Output
// ===========================================================================

const total = pass + fail;
const lines: string[] = [];
lines.push('='.repeat(60));
lines.push(`reputation-engine smoke — ${pass}/${total} PASSED${fail > 0 ? ` (${fail} FAILED)` : ''}`);
lines.push('='.repeat(60));
if (fail > 0) {
  lines.push('FAILURES:');
  for (const f of failures) {
    lines.push('  - ' + f);
  }
  process.stderr.write(lines.join('\n') + '\n');
  process.exit(1);
} else {
  process.stdout.write(lines.join('\n') + '\n');
  process.exit(0);
}