#!/usr/bin/env node --experimental-strip-types --no-warnings
/**
 * reputation-engine.spec.ts — self-running assertion harness
 *
 * Run: `node --experimental-strip-types --no-warnings src/lib/engines/reputation-engine.spec.ts`
 *
 * Exits with code 0 on PASS, code 1 on FAIL. No test runner.
 */

import {
  EVENT_TYPES,
  TRADICOES,
  TRADICAO_LABELS,
  TRADICAO_WEIGHTS,
  ZERO_HASH,
  asLedgerEntryId,
  asReputationHash,
  asUsuarioId,
  type LedgerEntry,
  type ReputationEvent,
} from './reputation-engine/index.ts';
import { sha256Hex } from './reputation-engine/reputation-ledger.ts';
import {
  normalizeTradicao,
  weightedDeltaFor,
  resolveMultiplier,
  highestWeightEventFor,
} from './reputation-engine/reputation-events.ts';
import {
  appendEvent,
  appendEvents,
  validateChain,
  getEntry,
  getEntriesByUsuario,
  getEntriesByTradicao,
  ledgerLength,
  scoreForUsuario,
  totalScore,
  EMPTY_LEDGER,
  canonicalizeEntry,
  computeEntryHash,
} from './reputation-engine/reputation-ledger.ts';

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
      failures.push(
        `${msg} | threw but message did not include "${expectedSub}": ${msg2}`,
      );
    }
  }
}

// ===========================================================================
// Helpers
// ===========================================================================

function makeEvent(over: Partial<ReputationEvent> = {}): ReputationEvent {
  return {
    id: asLedgerEntryId(`evt-${Math.random().toString(36).slice(2, 10)}`),
    usuarioId: asUsuarioId('user:alice'),
    eventType: 'helpful_answer',
    baseDelta: 10,
    tradicao: 'cigano',
    occurredAt: '2026-06-30T09:00:00.000Z',
    note: 'helped a newcomer with the cigano spread',
    ...over,
  };
}

// ===========================================================================
// 1. SHA-256 known vectors (FIPS-180-4)
// ===========================================================================

assertEq(sha256Hex(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'sha256(empt) NIST vector');
assertEq(sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', 'sha256(abc) NIST vector');
assertEq(sha256Hex('The quick brown fox jumps over the lazy dog'), 'd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592', 'sha256(fox) vector');
assertEq(sha256Hex('The quick brown fox jumps over the lazy dog.'), 'ef537f25c895bfa782526529a9b63d97aa631564d5d789c2b765448c8635fb6c', 'sha256(fox.) vector');
assertEq(sha256Hex('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'), '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1', 'sha256(56-byte) NIST vector');

// ===========================================================================
// 2. SHA-256 sensitivity (different input -> different hash)
// ===========================================================================

assert(sha256Hex('hello') !== sha256Hex('Hello'), 'sha256 case-sensitive');
assert(sha256Hex('hello') !== sha256Hex('hello '), 'sha256 space-sensitive');
assert(sha256Hex('a') !== sha256Hex('b'), 'sha256 single-char diff');
assertEq(sha256Hex('hello').length, 64, 'sha256 returns 64-char hex');

// ===========================================================================
// 3. ZERO_HASH constant
// ===========================================================================

assertEq(ZERO_HASH, '0'.repeat(64), 'ZERO_HASH is 64 zeros');
assertEq(ZERO_HASH.length, 64, 'ZERO_HASH length');
assert(ZERO_HASH === asReputationHash('0'.repeat(64)), 'ZERO_HASH round-trip');

// ===========================================================================
// 4. Weight matrix invariants
// ===========================================================================

assertEq(TRADICOES.length, 7, '7 tradições');
assertEq(EVENT_TYPES.length, 7, '7 event types');
for (const t of TRADICOES) {
  for (const e of EVENT_TYPES) {
    const w = TRADICAO_WEIGHTS[t][e];
    assert(typeof w === 'number' && w > 0, `weight > 0 for ${t}.${e}`);
    assert(w >= 0.5 && w <= 2.0, `weight in [0.5, 2.0] for ${t}.${e} (got ${w})`);
  }
}
assert(Object.isFrozen(TRADICAO_WEIGHTS), 'TRADICAO_WEIGHTS frozen');
for (const t of TRADICOES) {
  assert(Object.isFrozen(TRADICAO_WEIGHTS[t]), `TRADICAO_WEIGHTS.${t} frozen`);
}
assertEq(TRADICAO_LABELS.candomble, 'Candomblé', 'label candomble');
assertEq(TRADICAO_LABELS.cigano, 'Cigano', 'label cigano');

// ===========================================================================
// 5. normalizeTradicao
// ===========================================================================

assertEq(normalizeTradicao('Candomblé'), 'candomble', 'normalize Candomblé');
assertEq(normalizeTradicao('CANDOMBLÉ'), 'candomble', 'normalize ALL CAPS CANDOMBLÉ');
assertEq(normalizeTradicao('candomble'), 'candomble', 'normalize already-lowercase');
assertEq(normalizeTradicao('  cigano '), 'cigano', 'normalize whitespace');
assertEq(normalizeTradicao('Umbanda'), 'umbanda', 'normalize Umbanda');
assertEq(normalizeTradicao('IFÁ'), 'ifa', 'normalize IFÁ');
assertEq(normalizeTradicao('Astrologia'), 'astrologia', 'normalize Astrologia');
assertEq(normalizeTradicao('Tantra'), 'tantra', 'normalize Tantra');
assertEq(normalizeTradicao('Cabala'), 'cabala', 'normalize Cabala');
assertThrows(() => normalizeTradicao('budismo'), 'Tradição inválida', 'normalize rejects budismo');
assertThrows(() => normalizeTradicao(''), 'Tradição inválida', 'normalize rejects empty');
assertThrows(() => normalizeTradicao('  '), 'Tradição inválida', 'normalize rejects whitespace');

// ===========================================================================
// 6. resolveMultiplier + weightedDeltaFor
// ===========================================================================

const m = resolveMultiplier('Cigano', 'helpful_answer');
assertEq(m.tradicao, 'cigano', 'resolveMultiplier tradicao normalized');
assertEq(m.multiplier, 1.1, 'resolveMultiplier helpful_answer × cigano = 1.1');

const wd = weightedDeltaFor('ritual_share', 10, 'candomble');
assertEq(wd.tradicao, 'candomble', 'weightedDeltaFor tradicao');
assertEq(wd.eventType, 'ritual_share', 'weightedDeltaFor eventType');
assertEq(wd.baseDelta, 10, 'weightedDeltaFor baseDelta');
assertEq(wd.multiplier, 1.6, 'weightedDeltaFor multiplier candomble.ritual_share');
assertEq(wd.weightedDelta, 16, 'weightedDeltaFor weighted = 10 * 1.6');

const wdAstrology = weightedDeltaFor('helpful_answer', 5, 'astrologia');
assertEq(wdAstrology.weightedDelta, 7, 'weightedDeltaFor astrologia 5 * 1.4 = 7');

const wdTantra = weightedDeltaFor('mentorship_offer', 10, 'tantra');
assertEq(wdTantra.multiplier, 1.6, 'tantra mentorship_offer = 1.6');

assertThrows(() => weightedDeltaFor('helpful_answer', NaN, 'cigano'), 'baseDelta must be finite', 'weightedDeltaFor rejects NaN');

// ===========================================================================
// 7. highestWeightEventFor
// ===========================================================================

const bestCig = highestWeightEventFor('cigano');
assertEq(bestCig.tradicao, 'cigano', 'highestWeightEventFor cigano tradicao');
// cigano has TWO events tied at 1.4 (ritual_share, feedback_given); first-iterated wins
assertEq(bestCig.multiplier, 1.4, 'highestWeightEventFor cigano multiplier');
assert(
  bestCig.eventType === 'ritual_share' || bestCig.eventType === 'feedback_given',
  'highestWeightEventFor cigano is one of the tied 1.4 events',
);

const bestCabala = highestWeightEventFor('cabala');
assertEq(bestCabala.eventType, 'code_contribution', 'highestWeightEventFor cabala = code_contribution');

// ===========================================================================
// 8. canonicalizeEntry determinism
// ===========================================================================

const canon = canonicalizeEntry({
  id: asLedgerEntryId('e1'),
  usuarioId: asUsuarioId('u1'),
  eventType: 'helpful_answer',
  baseDelta: 5,
  tradicao: 'cigano',
  occurredAt: '2026-06-30T09:00:00.000Z',
  note: 'hi',
  seq: 1,
});
assert(canon.includes('rpe|v1'), 'canonical has version');
assert(canon.includes('cigano'), 'canonical has tradicao');
assert(canon.includes('e1'), 'canonical has id');
assert(canon.includes('|hi|'), 'canonical has note');

// Determinism — calling twice gives same string
const canon2 = canonicalizeEntry({
  id: asLedgerEntryId('e1'),
  usuarioId: asUsuarioId('u1'),
  eventType: 'helpful_answer',
  baseDelta: 5,
  tradicao: 'cigano',
  occurredAt: '2026-06-30T09:00:00.000Z',
  note: 'hi',
  seq: 1,
});
assertEq(canon, canon2, 'canonicalizeEntry deterministic');

// Different seq -> different canonical
const canon3 = canonicalizeEntry({
  id: asLedgerEntryId('e1'),
  usuarioId: asUsuarioId('u1'),
  eventType: 'helpful_answer',
  baseDelta: 5,
  tradicao: 'cigano',
  occurredAt: '2026-06-30T09:00:00.000Z',
  note: 'hi',
  seq: 2,
});
assert(canon !== canon3, 'canonical seq-sensitive');

// ===========================================================================
// 9. computeEntryHash basic
// ===========================================================================

const h1 = computeEntryHash(ZERO_HASH, {
  id: asLedgerEntryId('a'),
  usuarioId: asUsuarioId('u'),
  eventType: 'helpful_answer',
  baseDelta: 1,
  tradicao: 'cigano',
  occurredAt: '2026-01-01T00:00:00.000Z',
  note: '',
  seq: 1,
});
assertEq(h1.length, 64, 'computeEntryHash 64-char');
assert(/^[0-9a-f]{64}$/.test(h1), 'computeEntryHash lowercase hex');

// ===========================================================================
// 10. appendEvent happy path
// ===========================================================================

let ledger = EMPTY_LEDGER;
const e1 = makeEvent({ id: asLedgerEntryId('e1') });
const r1 = appendEvent(ledger, e1);
ledger = r1.ledger;
assertEq(ledger.length, 1, 'after first append length=1');
assertEq(r1.entry.seq, 1, 'genesis seq=1');
assertEq(r1.entry.prevHash, ZERO_HASH, 'genesis prevHash=ZERO_HASH');
assert(r1.entry.hash !== ZERO_HASH, 'genesis hash != ZERO_HASH');
assertEq(r1.entry.tradicao, 'cigano', 'entry tradicao normalized');
assertEq(r1.entry.baseDelta, 10, 'entry baseDelta preserved');
assertEq(r1.entry.eventType, 'helpful_answer', 'entry eventType preserved');
assert(Object.isFrozen(r1.entry), 'entry frozen');
assert(Object.isFrozen(r1.ledger), 'ledger frozen');

// Append a second
const e2 = makeEvent({
  id: asLedgerEntryId('e2'),
  eventType: 'ritual_share',
  baseDelta: 5,
  tradicao: 'candomble',
});
const r2 = appendEvent(ledger, e2);
ledger = r2.ledger;
assertEq(ledger.length, 2, 'after second append length=2');
assertEq(r2.entry.seq, 2, 'second entry seq=2');
assertEq(r2.entry.prevHash, r1.entry.hash, 'second entry prevHash=first hash');
assert(r2.entry.hash !== r1.entry.hash, 'second entry hash distinct from first');

// ===========================================================================
// 11. appendEvent rejects duplicate id
// ===========================================================================

const dup = makeEvent({ id: asLedgerEntryId('e1') }); // same as e1
assertThrows(() => appendEvent(ledger, dup), 'Duplicate LedgerEntryId', 'duplicate id rejected');

// ===========================================================================
// 12. appendEvent rejects invalid eventType
// ===========================================================================

const badEventType = makeEvent({
  id: asLedgerEntryId('e-bad'),
  eventType: 'fortune_telling' as unknown as ReputationEvent['eventType'],
});
assertThrows(() => appendEvent(ledger, badEventType), 'Unknown eventType', 'invalid eventType rejected');

// ===========================================================================
// 13. appendEvent rejects bad ISO date
// ===========================================================================

const badDate = makeEvent({
  id: asLedgerEntryId('e-date'),
  occurredAt: 'yesterday',
});
assertThrows(() => appendEvent(ledger, badDate), 'ISO-8601', 'bad ISO date rejected');

// ===========================================================================
// 14. appendEvent rejects unknown tradição
// ===========================================================================

const badTrad = makeEvent({
  id: asLedgerEntryId('e-trad'),
  tradicao: 'wicca' as unknown as ReputationEvent['tradicao'],
});
assertThrows(() => appendEvent(ledger, badTrad), 'Tradição inválida', 'unknown tradição rejected');

// ===========================================================================
// 15. appendEvent rejects NaN baseDelta
// ===========================================================================

const badDelta = makeEvent({
  id: asLedgerEntryId('e-delta'),
  baseDelta: NaN,
});
assertThrows(() => appendEvent(ledger, badDelta), 'baseDelta must be finite', 'NaN baseDelta rejected');

// ===========================================================================
// 16. appendEvent rejects oversized note
// ===========================================================================

const longNote = makeEvent({
  id: asLedgerEntryId('e-note'),
  note: 'x'.repeat(513),
});
assertThrows(() => appendEvent(ledger, longNote), '<= 512', 'long note rejected');

// ===========================================================================
// 17. validateChain empty
// ===========================================================================

const report0 = validateChain(EMPTY_LEDGER);
assert(report0.ok, 'empty chain ok');
assertEq(report0.length, 0, 'empty chain length=0');
assertEq(report0.errors.length, 0, 'empty chain no errors');

// ===========================================================================
// 18. validateChain valid populated ledger
// ===========================================================================

const report2 = validateChain(ledger);
assert(report2.ok, 'valid chain ok');
assertEq(report2.length, 2, 'valid chain length=2');
assertEq(report2.errors.length, 0, 'valid chain no errors');

// ===========================================================================
// 19. validateChain detects hash tamper
// ===========================================================================

// Build a tampered ledger — mutate hash on entry 2
const tamperedHash: LedgerEntry = {
  ...r2.entry,
  hash: 'deadbeef'.padEnd(64, '0') as LedgerEntry['hash'],
};
const tamperedHashLedger = Object.freeze([r1.entry, tamperedHash]) as typeof ledger;
const report3 = validateChain(tamperedHashLedger);
assert(!report3.ok, 'tampered-hash chain NOT ok');
assert(report3.errors.some((e) => e.includes('hash mismatch')), 'reports hash mismatch');

// ===========================================================================
// 20. validateChain detects prevHash tamper
// ===========================================================================

const tamperedPrev: LedgerEntry = {
  ...r2.entry,
  prevHash: 'cafebabe'.padEnd(64, '0') as LedgerEntry['prevHash'],
};
const tamperedPrevLedger = Object.freeze([r1.entry, tamperedPrev]) as typeof ledger;
const report4 = validateChain(tamperedPrevLedger);
assert(!report4.ok, 'tampered-prevHash chain NOT ok');
assert(report4.errors.some((e) => e.includes('prevHash mismatch')), 'reports prevHash mismatch');

// ===========================================================================
// 21. validateChain detects seq tamper
// ===========================================================================

const tamperedSeq: LedgerEntry = { ...r2.entry, seq: 99 };
const tamperedSeqLedger = Object.freeze([r1.entry, tamperedSeq]) as typeof ledger;
const report5 = validateChain(tamperedSeqLedger);
assert(!report5.ok, 'tampered-seq chain NOT ok');
assert(report5.errors.some((e) => e.includes('seq mismatch')), 'reports seq mismatch');

// ===========================================================================
// 22. validateChain detects note tamper
// ===========================================================================

const tamperedNote: LedgerEntry = { ...r2.entry, note: 'forged note' };
const tamperedNoteLedger = Object.freeze([r1.entry, tamperedNote]) as typeof ledger;
const report6 = validateChain(tamperedNoteLedger);
assert(!report6.ok, 'tampered-note chain NOT ok');
assert(report6.errors.some((e) => e.includes('hash mismatch')), 'reports hash mismatch on note tamper');

// ===========================================================================
// 23. validateChain detects baseDelta tamper
// ===========================================================================

const tamperedDelta: LedgerEntry = { ...r2.entry, baseDelta: 999 };
const tamperedDeltaLedger = Object.freeze([r1.entry, tamperedDelta]) as typeof ledger;
const report7 = validateChain(tamperedDeltaLedger);
assert(!report7.ok, 'tampered-delta chain NOT ok');

// ===========================================================================
// 24. append doesn't mutate prior ledger
// ===========================================================================

const beforeLen = ledger.length;
const beforeHash = ledger[ledger.length - 1]!.hash;
const r3 = appendEvent(ledger, makeEvent({ id: asLedgerEntryId('e3') }));
assertEq(ledger.length, beforeLen, 'original ledger length unchanged after append');
assertEq(ledger[ledger.length - 1]!.hash, beforeHash, 'original last hash unchanged');
assertEq(r3.ledger.length, beforeLen + 1, 'new ledger length = before + 1');

// ===========================================================================
// 25. appendEvents batch
// ===========================================================================

const batch = [
  makeEvent({ id: asLedgerEntryId('b1') }),
  makeEvent({ id: asLedgerEntryId('b2') }),
  makeEvent({ id: asLedgerEntryId('b3') }),
];
const batchResult = appendEvents(EMPTY_LEDGER, batch);
assertEq(batchResult.ledger.length, 3, 'batch length=3');
assertEq(batchResult.entries.length, 3, 'batch entries=3');
const repBatch = validateChain(batchResult.ledger);
assert(repBatch.ok, 'batch chain valid');

// ===========================================================================
// 26. appendEvents atomicity (one bad -> all fail)
// ===========================================================================

const mixed = [
  makeEvent({ id: asLedgerEntryId('m1') }),
  makeEvent({ id: asLedgerEntryId('m2'), occurredAt: 'bad' }),
  makeEvent({ id: asLedgerEntryId('m3') }),
];
assertThrows(() => appendEvents(EMPTY_LEDGER, mixed), 'ISO-8601', 'batch rejects on bad event');

// ===========================================================================
// 27. scoreForUsuario
// ===========================================================================

const scoreLedger = appendEvents(EMPTY_LEDGER, [
  makeEvent({ id: asLedgerEntryId('s1'), usuarioId: asUsuarioId('u:alice'), baseDelta: 10, eventType: 'helpful_answer', tradicao: 'cigano' }),
  makeEvent({ id: asLedgerEntryId('s2'), usuarioId: asUsuarioId('u:alice'), baseDelta: 5, eventType: 'ritual_share', tradicao: 'candomble' }),
  makeEvent({ id: asLedgerEntryId('s3'), usuarioId: asUsuarioId('u:bob'), baseDelta: 100, eventType: 'helpful_answer', tradicao: 'astrologia' }),
]).ledger;

const aliceScore = scoreForUsuario(scoreLedger, asUsuarioId('u:alice'));
// alice: 10 * 1.1 (cigano.helpful_answer) + 5 * 1.6 (candomble.ritual_share) = 11 + 8 = 19
assertEq(aliceScore, 19, 'alice score = 10*1.1 + 5*1.6 = 19');

const bobScore = scoreForUsuario(scoreLedger, asUsuarioId('u:bob'));
// bob: 100 * 1.4 (astrologia.helpful_answer) = 140
assertEq(bobScore, 140, 'bob score = 100*1.4 = 140');

const ghostScore = scoreForUsuario(scoreLedger, asUsuarioId('u:nobody'));
assertEq(ghostScore, 0, 'unknown user score=0');

// ===========================================================================
// 28. totalScore
// ===========================================================================

assertEq(totalScore(scoreLedger), 159, 'totalScore = 19 + 140 = 159');

// ===========================================================================
// 29. ledgerLength
// ===========================================================================

assertEq(ledgerLength(EMPTY_LEDGER), 0, 'ledgerLength empty=0');
assertEq(ledgerLength(scoreLedger), 3, 'ledgerLength 3=3');

// ===========================================================================
// 30. getEntry
// ===========================================================================

const got = getEntry(scoreLedger, asLedgerEntryId('s2'));
assert(!!got, 'getEntry finds entry');
assertEq(got?.eventType, 'ritual_share', 'getEntry eventType');
const missing = getEntry(scoreLedger, asLedgerEntryId('nope'));
assertEq(missing, undefined, 'getEntry missing returns undefined');

// ===========================================================================
// 31. getEntriesByUsuario
// ===========================================================================

const aliceEntries = getEntriesByUsuario(scoreLedger, asUsuarioId('u:alice'));
assertEq(aliceEntries.length, 2, 'alice entries=2');
assert(Object.isFrozen(aliceEntries), 'alice entries frozen');

// ===========================================================================
// 32. getEntriesByTradicao (NFD normalized lookup)
// ===========================================================================

const candombleEntries = getEntriesByTradicao(scoreLedger, 'CANDOMBLÉ');
assertEq(candombleEntries.length, 1, 'candomble entries=1 (NFD lookup)');
assertEq(candombleEntries[0]?.eventType, 'ritual_share', 'candomble entry eventType');

// ===========================================================================
// 33. Idempotency check — same event twice -> same hash
// ===========================================================================

const idemEvent = makeEvent({
  id: asLedgerEntryId('idem-1'),
  usuarioId: asUsuarioId('u:idem'),
  eventType: 'feedback_given',
  baseDelta: 3,
  tradicao: 'cigano',
  occurredAt: '2026-06-30T10:00:00.000Z',
  note: 'thanks for the spread',
});
const idemL1 = appendEvent(EMPTY_LEDGER, idemEvent).entry;
const idemL2 = appendEvent(EMPTY_LEDGER, idemEvent).entry;
assertEq(idemL1.hash, idemL2.hash, 'same event -> same hash (idempotent)');
assertEq(idemL1.seq, idemL2.seq, 'same event -> same seq');

// ===========================================================================
// 34. AppendEvents rejection of duplicate id within batch
// ===========================================================================

const dupBatch = [
  makeEvent({ id: asLedgerEntryId('dup') }),
  makeEvent({ id: asLedgerEntryId('dup') }),
];
assertThrows(() => appendEvents(EMPTY_LEDGER, dupBatch), 'Duplicate', 'batch rejects intra-batch duplicate');

// ===========================================================================
// 35. AppendEvents rejection of id collision with existing ledger
// ===========================================================================

assertThrows(
  () => appendEvents(scoreLedger, [makeEvent({ id: asLedgerEntryId('s1') })]),
  'Duplicate',
  'batch rejects collision with existing ledger',
);

// ===========================================================================
// 36. Brand type guards (smoke)
// ===========================================================================

// These should not throw at runtime
const okId = asLedgerEntryId('valid-id_123');
assertEq(okId, 'valid-id_123', 'asLedgerEntryId accepts valid');
assertThrows(() => asLedgerEntryId('has space'), 'Invalid LedgerEntryId', 'asLedgerEntryId rejects space');
assertThrows(() => asLedgerEntryId(''), 'Invalid LedgerEntryId', 'asLedgerEntryId rejects empty');

const okHash = asReputationHash('a'.repeat(64));
assertEq(okHash, 'a'.repeat(64), 'asReputationHash accepts 64-char hex');
assertThrows(() => asReputationHash('tooshort'), 'Invalid ReputationHash', 'asReputationHash rejects short');

const okUser = asUsuarioId('user:42');
assertEq(okUser, 'user:42', 'asUsuarioId accepts');

// ===========================================================================
// 37. Multiple tradição coverage
// ===========================================================================

// 7 tradições each get an entry; ensure no errors
const sevenTradicoes = TRADICOES.map((t, i) =>
  makeEvent({
    id: asLedgerEntryId(`t-${i}`),
    tradicao: t,
    usuarioId: asUsuarioId(`u:${t}`),
  }),
);
const sevenLedger = appendEvents(EMPTY_LEDGER, sevenTradicoes).ledger;
assertEq(sevenLedger.length, 7, '7 tradição entries');
const sevenReport = validateChain(sevenLedger);
assert(sevenReport.ok, '7-entry chain valid');

// ===========================================================================
// 38. Re-append same id -> throws AND original ledger untouched
// ===========================================================================

let chain2 = appendEvent(EMPTY_LEDGER, makeEvent({ id: asLedgerEntryId('q1') })).ledger;
const q1LenBefore = chain2.length;
assertThrows(() => appendEvent(chain2, makeEvent({ id: asLedgerEntryId('q1') })), 'Duplicate', 're-append throws');
assertEq(chain2.length, q1LenBefore, 'ledger untouched on re-append throw');

// ===========================================================================
// 39. Score across multiple tradições
// ===========================================================================

const multiScoreLedger = appendEvents(EMPTY_LEDGER, [
  makeEvent({ id: asLedgerEntryId('ms1'), usuarioId: asUsuarioId('u:multi'), baseDelta: 10, eventType: 'helpful_answer', tradicao: 'cigano' }),
  makeEvent({ id: asLedgerEntryId('ms2'), usuarioId: asUsuarioId('u:multi'), baseDelta: 10, eventType: 'ritual_share', tradicao: 'candomble' }),
  makeEvent({ id: asLedgerEntryId('ms3'), usuarioId: asUsuarioId('u:multi'), baseDelta: 10, eventType: 'code_contribution', tradicao: 'cabala' }),
]).ledger;
// 10 * 1.1 + 10 * 1.6 + 10 * 1.6 = 11 + 16 + 16 = 43
assertEq(scoreForUsuario(multiScoreLedger, asUsuarioId('u:multi')), 43, 'multi-tradição score');

// ===========================================================================
// 40. Event chain prevHash linkage (structural)
// ===========================================================================

let linkCheck = EMPTY_LEDGER;
let prevLink: typeof ZERO_HASH = ZERO_HASH;
const linkEvents = ['la', 'lb', 'lc', 'ld'].map((id) =>
  makeEvent({ id: asLedgerEntryId(id) }),
);
for (const evt of linkEvents) {
  const r = appendEvent(linkCheck, evt);
  linkCheck = r.ledger;
  assertEq(r.entry.prevHash, prevLink, `prevHash linkage for ${evt.id}`);
  prevLink = r.entry.hash;
}
assertEq(linkCheck.length, 4, '4-entry chain');
assert(validateChain(linkCheck).ok, '4-entry chain valid');

// ===========================================================================
// 41. Note trim in canonical
// ===========================================================================

const canonTrim = canonicalizeEntry({
  id: asLedgerEntryId('t'),
  usuarioId: asUsuarioId('u'),
  eventType: 'helpful_answer',
  baseDelta: 1,
  tradicao: 'cigano',
  occurredAt: '2026-01-01T00:00:00.000Z',
  note: '  hello world  ',
  seq: 1,
});
assert(canonTrim.includes('|hello world|'), 'note trimmed in canonical');

// ===========================================================================
// 42. Mutating frozen ledger at runtime
// ===========================================================================

const threwOnPush = (() => {
  try {
    // Cast away readonly via unknown; runtime Object.freeze must reject.
    (ledger as unknown as LedgerEntry[]).push(r1.entry);
    return false;
  } catch {
    return true;
  }
})();
assert(threwOnPush || ledger.length === beforeLen, 'frozen ledger rejects push (or preserved)');

// ===========================================================================
// Output
// ===========================================================================

const total = pass + fail;
const lines: string[] = [];
lines.push('='.repeat(60));
lines.push(`reputation-engine.spec.ts — ${pass}/${total} PASSED${fail > 0 ? ` (${fail} FAILED)` : ''}`);
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