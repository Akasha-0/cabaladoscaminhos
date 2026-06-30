/**
 * ════════════════════════════════════════════════════════════════════════════
 * W76-B — REPUTATION UNIVERSALIST · SPEC
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Self-running test harness — no vitest required. ≥40 assertions covering:
 *   - Branded factories + format enforcement
 *   - 7 traditions whitelist (≥30 sacred terms)
 *   - 5 domains + per-domain decay tuning (lambda + windowDays + maxWeight)
 *   - awardReputation: all anti-gating paths (self-award, rate limit, weight, opt-out, audit)
 *   - Time-weighted decay: monotonic, slower lambda ⇒ higher score
 *   - Universalism gates: no global ranking, per-domain leaderboards, per-tradition filter
 *   - Tradition-elder veto: requires 2 elders, audited, opt-out enforced on approval
 *   - Audit log: append-only, frozen entries
 */

declare const process: { exit(code: number): never };
import {
  awardReputation,
  decideRemoval,
  decayWeight,
  decaysSlowerThan,
  elderCount,
  exportAudit,
  getRemovalRequest,
  getReputation,
  isElder,
  isOptedOut,
  listElders,
  listRemovalRequests,
  listTopContributors,
  listTopContributorsGlobal,
  optIn,
  optOut,
  registerElder,
  requestRemoval,
  scoreWithDecay,
  userId,
  eventId,
  removalRequestId,
  _resetForTests,
  DOMAIN_METADATA,
  REPUTATION_DOMAINS,
  SACRED_TRADITIONS,
  SACRED_TERM_WHITELIST,
  ReputationError,
  type ReputationEvent,
  type UserId,
  type EventId,
  type RemovalRequestId,
} from './reputation-universalist.ts';

interface SpecEntry {
  name: string;
  run: () => void | Promise<void>;
}
const SPEC_REGISTRY: SpecEntry[] = [];

function it(name: string, run: () => void | Promise<void>): void {
  SPEC_REGISTRY.push({ name, run: () => run() });
}

function assertEqual<T>(actual: T, expected: T, label?: string): void {
  const ok = Object.is(actual, expected) || JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    throw new Error(
      `assertEqual FAIL${label ? ' (' + label + ')' : ''}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

function assertTrue(v: unknown, label?: string): void {
  if (!v) throw new Error(`assertTrue FAIL${label ? ' (' + label + ')' : ''}: ${String(v)}`);
}

function assertCloseTo(actual: number, expected: number, precision = 3, label?: string): void {
  const diff = Math.abs(actual - expected);
  const tol = Math.pow(10, -precision) / 2;
  if (diff > tol) {
    throw new Error(
      `assertCloseTo FAIL${label ? ' (' + label + ')' : ''}: expected ${expected}±${tol}, got ${actual} (diff=${diff})`,
    );
  }
}

function assertThrows(fn: () => unknown, codeRegex: RegExp, label?: string): void {
  let err: Error | null = null;
  try {
    fn();
  } catch (e) {
    err = e as Error;
  }
  if (!err) throw new Error(`assertThrows FAIL${label ? ' (' + label + ')' : ''}: expected throw, got none`);
  if (!codeRegex.test(err.message + ' ' + (err as ReputationError).code)) {
    throw new Error(
      `assertThrows FAIL${label ? ' (' + label + ')' : ''}: message "${err.message}" code "${(err as ReputationError).code}" did not match ${codeRegex}`,
    );
  }
}

const U = {
  alice: userId('u_alice'),
  bob: userId('u_bob'),
  carol: userId('u_carol'),
  dan: userId('u_dan'),
  elder1: userId('u_elder_oxala'),
  elder2: userId('u_elder_ogum'),
  elderCig: userId('u_elder_cigano'),
  elderCig2: userId('u_elder_cigano_b'),
  target: userId('u_target_offender'),
};

function fixedDate(): Date {
  return new Date('2026-06-30T12:00:00.000Z');
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 1 — Branded factories
// ════════════════════════════════════════════════════════════════════════════

it('userId accepts u_ prefixed ids', () => {
  assertEqual(userId('u_alice'), 'u_alice' as UserId);
});

it('userId rejects empty / malformed', () => {
  assertThrows(() => userId(''), /empty|invalid/);
  assertThrows(() => userId('alice'), /invalid/);
  assertThrows(() => userId('u_a'), /invalid/);
});

it('eventId + removalRequestId validate prefixes', () => {
  assertEqual(eventId('e_xyz'), 'e_xyz' as EventId);
  assertEqual(removalRequestId('r_xyz'), 'r_xyz' as RemovalRequestId);
  assertThrows(() => eventId('bad'), /invalid/);
  assertThrows(() => removalRequestId('bad'), /invalid/);
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 2 — Sacred coverage (7 traditions + ≥30 terms)
// ════════════════════════════════════════════════════════════════════════════

it('SACRED_TRADITIONS contains exactly 7 traditions', () => {
  assertEqual(SACRED_TRADITIONS.length, 7);
});

it('SACRED_TRADITIONS covers Candomblé/Umbanda/Ifá/Cabala/Astrologia/Tantra/Cigano', () => {
  const expected = ['Candomblé', 'Umbanda', 'Ifá', 'Cabala', 'Astrologia', 'Tantra', 'Cigano'];
  for (const t of expected) {
    assertTrue(SACRED_TRADITIONS.includes(t as any), `tradition ${t} present`);
  }
});

it('SACRED_TERM_WHITELIST has ≥30 terms with correct accents', () => {
  assertTrue(SACRED_TERM_WHITELIST.length >= 30, `count=${SACRED_TERM_WHITELIST.length}`);
  for (const required of ['Orixá', 'Babalorixá', 'Yalorixá', 'Oxalá', 'Iansã', 'Oxum', 'Exu', 'Ogum',
    'Caboclo', 'Preto-Velho', 'Pomba-Gira', 'Ifá', 'Orunmila',
    'Sephirot', 'Kether', 'Chokmah', 'Binah', 'Tiferet',
    'Ascendente', 'Lilith', 'Meio-do-Céu', 'Nodo Lunar',
    'Bodhisattva', 'Mantra', 'Kundalini', 'Cigano', 'Tarô']) {
    assertTrue(SACRED_TERM_WHITELIST.includes(required), `${required} in whitelist`);
  }
});

it('REPUTATION_DOMAINS has 5 entries', () => {
  assertEqual(REPUTATION_DOMAINS.length, 5);
  for (const d of ['contributions', 'mentorship', 'ritual-knowledge', 'peer-help', 'sacred-content-quality']) {
    assertTrue(REPUTATION_DOMAINS.includes(d as any), `domain ${d}`);
  }
});

it('DOMAIN_METADATA tuning: ritual-knowledge decays slowest, peer-help fastest', () => {
  const rk = DOMAIN_METADATA.find((m) => m.domain === 'ritual-knowledge')!;
  const ph = DOMAIN_METADATA.find((m) => m.domain === 'peer-help')!;
  assertTrue(decaysSlowerThan(rk.lambda, ph.lambda), 'ritual-knowledge lambda < peer-help lambda');
  assertTrue(rk.maxWeight > ph.maxWeight, 'ritual-knowledge maxWeight > peer-help maxWeight');
  for (const m of DOMAIN_METADATA) {
    assertTrue(m.lambda >= 0, `${m.domain} lambda ≥ 0`);
    assertTrue(m.windowDays === 365, `${m.domain} window is 365 days`);
  }
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 3 — awardReputation happy path + anti-gating
// ════════════════════════════════════════════════════════════════════════════

it('awardReputation applies event and appends to audit', () => {
  _resetForTests();
  const r = awardReputation({
    recipient: U.alice, fromPeer: U.bob, domain: 'contributions',
    tradition: 'Candomblé', weight: 10, occurredAt: '2026-06-30T11:00:00.000Z',
  });
  assertEqual(r.applied, true);
  const audit = exportAudit();
  assertTrue(audit.length >= 1);
  const last = audit[audit.length - 1] as any;
  assertEqual(last.kind, 'award-applied');
  assertEqual(last.recipient, U.alice);
});

it('awardReputation blocks self-award with SELF_AWARD', () => {
  _resetForTests();
  assertThrows(
    () => awardReputation({
      recipient: U.alice, fromPeer: U.alice, domain: 'contributions',
      tradition: 'Candomblé', weight: 10,
    }),
    /SELF_AWARD/,
  );
});

it('awardReputation enforces max 5 events/peer/day with RATE_LIMIT', () => {
  _resetForTests();
  const peers = [U.bob, U.carol, U.dan];
  for (let i = 0; i < 5; i++) {
    const r = awardReputation({
      recipient: U.alice, fromPeer: U.bob, domain: 'peer-help',
      tradition: 'Cabala', weight: 1, occurredAt: '2026-06-30T10:00:00.000Z',
    });
    assertEqual(r.applied, true);
  }
  // 6th attempt same peer same day → throws RATE_LIMIT
  assertThrows(
    () => awardReputation({
      recipient: U.alice, fromPeer: U.bob, domain: 'peer-help',
      tradition: 'Cabala', weight: 1, occurredAt: '2026-06-30T15:00:00.000Z',
    }),
    /RATE_LIMIT/,
  );
  void peers;
});

it('awardReputation rejects unknown tradition with UNKNOWN_TRADITION', () => {
  _resetForTests();
  assertThrows(
    () => awardReputation({
      recipient: U.alice, fromPeer: U.bob, domain: 'contributions',
      tradition: 'Wicca' as any, weight: 5,
    }),
    /UNKNOWN_TRADITION/,
  );
});

it('awardReputation rejects invalid weight (zero / over max)', () => {
  _resetForTests();
  assertThrows(
    () => awardReputation({
      recipient: U.alice, fromPeer: U.bob, domain: 'peer-help',
      tradition: 'Cabala', weight: 0,
    }),
    /INVALID_WEIGHT/,
  );
  assertThrows(
    () => awardReputation({
      recipient: U.alice, fromPeer: U.bob, domain: 'peer-help',
      tradition: 'Cabala', weight: 999,
    }),
    /INVALID_WEIGHT/,
  );
});

it('awardReputation honors opt-out (applied=false, reason=OPT_OUT)', () => {
  _resetForTests();
  optOut(U.alice, 'contributions');
  const r = awardReputation({
    recipient: U.alice, fromPeer: U.bob, domain: 'contributions',
    tradition: 'Cigano', weight: 5,
  });
  assertEqual(r.applied, false);
  assertEqual(r.reason, 'OPT_OUT');
  // optIn restores
  optIn(U.alice, 'contributions');
  const r2 = awardReputation({
    recipient: U.alice, fromPeer: U.bob, domain: 'contributions',
    tradition: 'Cigano', weight: 5,
  });
  assertEqual(r2.applied, true);
});

it('isOptedOut flips with optOut / optIn', () => {
  _resetForTests();
  assertEqual(isOptedOut(U.alice, 'mentorship'), false);
  optOut(U.alice, 'mentorship');
  assertEqual(isOptedOut(U.alice, 'mentorship'), true);
  optIn(U.alice, 'mentorship');
  assertEqual(isOptedOut(U.alice, 'mentorship'), false);
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 4 — Time-weighted decay math
// ════════════════════════════════════════════════════════════════════════════

it('decayWeight at age 0 equals weight', () => {
  assertCloseTo(decayWeight(10, 0, 0.003), 10);
});

it('decayWeight is monotonically non-increasing in age', () => {
  const a = decayWeight(10, 30, 0.003);
  const b = decayWeight(10, 90, 0.003);
  const c = decayWeight(10, 365, 0.003);
  assertTrue(a > b && b > c, `a=${a} > b=${b} > c=${c}`);
});

it('decayWeight: smaller lambda ⇒ slower decay ⇒ higher score at same age', () => {
  const slow = decayWeight(10, 180, 0.001);
  const fast = decayWeight(10, 180, 0.005);
  assertTrue(slow > fast, `slow=${slow} > fast=${fast}`);
});

it('decayWeight rejects negative inputs', () => {
  assertThrows(() => decayWeight(-1, 0, 0.001), /INVALID_WEIGHT/);
  assertThrows(() => decayWeight(1, -1, 0.001), /INVALID_WEIGHT/);
  assertThrows(() => decayWeight(1, 1, -0.001), /INVALID_WEIGHT/);
});

it('scoreWithDecay sums events inside window', () => {
  const events: ReputationEvent[] = [
    Object.freeze({
      eventId: eventId("e_aaa"),
      recipient: U.alice, fromPeer: U.bob, domain: 'contributions',
      tradition: 'Candomblé', weight: 10,
      occurredAt: '2026-06-29T12:00:00.000Z',
    }),
    Object.freeze({
      eventId: eventId("e_bbb"),
      recipient: U.alice, fromPeer: U.carol, domain: 'contributions',
      tradition: 'Candomblé', weight: 20,
      occurredAt: '2025-01-01T12:00:00.000Z',
    }),
  ];
  const s = scoreWithDecay(events, 0.003, 365, fixedDate());
  // First event ~1 day old: ~10 * exp(-0.003) ≈ 9.97
  // Second event is >365 days old: excluded
  assertCloseTo(s, 9.97, 2);
});

it('scoreWithDecay rejects bad lambda / windowDays', () => {
  assertThrows(() => scoreWithDecay([], -0.001, 365, fixedDate()), /INVALID_WEIGHT/);
  assertThrows(() => scoreWithDecay([], 0.001, 0, fixedDate()), /INVALID_WEIGHT/);
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 5 — Universalism: per-domain leaderboards, per-tradition filter
// ════════════════════════════════════════════════════════════════════════════

it('getReputation returns 0 for unknown user (no self-fabrication)', () => {
  _resetForTests();
  const score = getReputation(U.alice, 'contributions', fixedDate());
  assertEqual(score.score, 0);
  assertEqual(score.eventCount, 0);
  assertEqual(score.traditionsContributed.length, 0);
});

it('getReputation sums multi-domain events for same user independently', () => {
  _resetForTests();
  awardReputation({ recipient: U.alice, fromPeer: U.bob, domain: 'contributions', tradition: 'Candomblé', weight: 10, occurredAt: '2026-06-29T12:00:00.000Z' });
  awardReputation({ recipient: U.alice, fromPeer: U.bob, domain: 'mentorship', tradition: 'Ifá', weight: 30, occurredAt: '2026-06-29T12:00:00.000Z' });
  const c = getReputation(U.alice, 'contributions', fixedDate());
  const m = getReputation(U.alice, 'mentorship', fixedDate());
  assertTrue(c.score > 0);
  assertTrue(m.score > c.score, `mentorship ${m.score} > contributions ${c.score} (higher weight)`);
  assertTrue(c.traditionsContributed.includes('Candomblé'));
  assertTrue(m.traditionsContributed.includes('Ifá'));
});

it('listTopContributors filters by tradition tag (universalism)', () => {
  _resetForTests();
  awardReputation({ recipient: U.alice, fromPeer: U.bob, domain: 'contributions', tradition: 'Candomblé', weight: 10, occurredAt: '2026-06-29T12:00:00.000Z' });
  awardReputation({ recipient: U.alice, fromPeer: U.carol, domain: 'contributions', tradition: 'Cabala', weight: 15, occurredAt: '2026-06-29T12:00:00.000Z' });
  awardReputation({ recipient: U.dan, fromPeer: U.bob, domain: 'contributions', tradition: 'Candomblé', weight: 5, occurredAt: '2026-06-29T12:00:00.000Z' });
  const candombleList = listTopContributors('Candomblé', 'contributions', 10, fixedDate());
  const cabalaList = listTopContributors('Cabala', 'contributions', 10, fixedDate());
  assertEqual(candombleList.length, 2);
  assertEqual(cabalaList.length, 1);
  assertEqual(cabalaList[0]!.userId, U.alice);
  // Top by score in Candomblé: alice (10) > dan (5)
  assertEqual(candombleList[0]!.userId, U.alice);
  assertTrue(candombleList[0]!.score > candombleList[1]!.score);
});

it('listTopContributorsGlobal is forbidden (universalism hard rule)', () => {
  _resetForTests();
  assertThrows(() => listTopContributorsGlobal(), /Global ranking forbidden/);
});

it('listTopContributors respects opt-out (no score shown)', () => {
  _resetForTests();
  awardReputation({ recipient: U.alice, fromPeer: U.bob, domain: 'contributions', tradition: 'Tantra', weight: 10, occurredAt: '2026-06-29T12:00:00.000Z' });
  optOut(U.alice, 'contributions');
  const list = listTopContributors('Tantra', 'contributions', 10, fixedDate());
  assertEqual(list.length, 0);
});

it('listTopContributors limits to positive limit', () => {
  _resetForTests();
  awardReputation({ recipient: U.alice, fromPeer: U.bob, domain: 'contributions', tradition: 'Astrologia', weight: 10, occurredAt: '2026-06-29T12:00:00.000Z' });
  assertThrows(() => listTopContributors('Astrologia', 'contributions', 0, fixedDate()), /INVALID_WEIGHT/);
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 6 — Tradition-elder veto
// ════════════════════════════════════════════════════════════════════════════

it('registerElder adds to elder pool', () => {
  _resetForTests();
  registerElder(U.elder1, 'Candomblé', '2026-01-01T00:00:00.000Z');
  registerElder(U.elder2, 'Candomblé', '2026-01-01T00:00:00.000Z');
  registerElder(U.elderCig, 'Cigano', '2026-01-01T00:00:00.000Z');
  assertEqual(elderCount('Candomblé'), 2);
  assertEqual(elderCount('Cigano'), 1);
  assertEqual(elderCount('Ifá'), 0);
  assertTrue(isElder(U.elder1, 'Candomblé'));
  assertTrue(!isElder(U.elder1, 'Cigano'));
});

it('listElders filters by tradition (or returns all)', () => {
  _resetForTests();
  registerElder(U.elder1, 'Candomblé', '2026-01-01T00:00:00.000Z');
  registerElder(U.elderCig, 'Cigano', '2026-01-01T00:00:00.000Z');
  assertEqual(listElders().length, 2);
  assertEqual(listElders('Cigano').length, 1);
  assertEqual(listElders('Candomblé').length, 1);
});

it('requestRemoval requires TWO elders from same tradition', () => {
  _resetForTests();
  registerElder(U.elder1, 'Candomblé', '2026-01-01T00:00:00.000Z');
  registerElder(U.elder2, 'Candomblé', '2026-01-01T00:00:00.000Z');
  // Missing cosigner → VETO_REQUIRES_TWO_ELDERS
  assertThrows(
    () => requestRemoval({
      targetUserId: U.target, tradition: 'Candomblé',
      reason: 'mock', requestedBy: U.elder1,
    }),
    /VETO_REQUIRES_TWO_ELDERS/,
  );
});

it('requestRemoval rejects when requester is not an elder', () => {
  _resetForTests();
  registerElder(U.elder2, 'Candomblé', '2026-01-01T00:00:00.000Z');
  assertThrows(
    () => requestRemoval({
      targetUserId: U.target, tradition: 'Candomblé',
      reason: 'mock', requestedBy: U.alice, cosignedBy: U.elder2,
    }),
    /VETO_NOT_ELDERS/,
  );
});

it('requestRemoval rejects when cosigner is not an elder of same tradition', () => {
  _resetForTests();
  registerElder(U.elder1, 'Candomblé', '2026-01-01T00:00:00.000Z');
  registerElder(U.elderCig, 'Cigano', '2026-01-01T00:00:00.000Z');
  assertThrows(
    () => requestRemoval({
      targetUserId: U.target, tradition: 'Candomblé',
      reason: 'mock', requestedBy: U.elder1, cosignedBy: U.elderCig,
    }),
    /VETO_NOT_ELDERS/,
  );
});

it('requestRemoval rejects self-cosign', () => {
  _resetForTests();
  registerElder(U.elder1, 'Candomblé', '2026-01-01T00:00:00.000Z');
  assertThrows(
    () => requestRemoval({
      targetUserId: U.target, tradition: 'Candomblé',
      reason: 'mock', requestedBy: U.elder1, cosignedBy: U.elder1,
    }),
    /VETO_REQUIRES_TWO_ELDERS/,
  );
});

it('requestRemoval succeeds with two elders and is pending', () => {
  _resetForTests();
  registerElder(U.elder1, 'Candomblé', '2026-01-01T00:00:00.000Z');
  registerElder(U.elder2, 'Candomblé', '2026-01-01T00:00:00.000Z');
  const req = requestRemoval({
    targetUserId: U.target, tradition: 'Candomblé',
    reason: 'tradition ethics violation', requestedBy: U.elder1, cosignedBy: U.elder2,
    now: '2026-06-30T10:00:00.000Z',
  });
  assertEqual(req.status, 'pending');
  assertEqual(req.decidedAt, null);
  assertTrue(req.auditNote.includes('pending review'));
});

it('decideRemoval approves and forces opt-out in ritual-knowledge', () => {
  _resetForTests();
  registerElder(U.elder1, 'Candomblé', '2026-01-01T00:00:00.000Z');
  registerElder(U.elder2, 'Candomblé', '2026-01-01T00:00:00.000Z');
  // Give target some ritual-knowledge first
  awardReputation({ recipient: U.target, fromPeer: U.alice, domain: 'ritual-knowledge', tradition: 'Candomblé', weight: 30, occurredAt: '2026-06-29T12:00:00.000Z' });
  const req = requestRemoval({
    targetUserId: U.target, tradition: 'Candomblé',
    reason: 'ethics', requestedBy: U.elder1, cosignedBy: U.elder2,
    now: '2026-06-30T10:00:00.000Z',
  });
  const decided = decideRemoval(req.requestId, 'approved', U.elder1, '2026-06-30T11:00:00.000Z');
  assertEqual(decided.status, 'approved');
  assertTrue(isOptedOut(U.target, 'ritual-knowledge'));
  // Score in ritual-knowledge is now 0 (opted out)
  const score = getReputation(U.target, 'ritual-knowledge', fixedDate());
  assertEqual(score.score, 0);
});

it('decideRemoval rejects when request already decided', () => {
  _resetForTests();
  registerElder(U.elder1, 'Candomblé', '2026-01-01T00:00:00.000Z');
  registerElder(U.elder2, 'Candomblé', '2026-01-01T00:00:00.000Z');
  const req = requestRemoval({
    targetUserId: U.target, tradition: 'Candomblé',
    reason: 'ethics', requestedBy: U.elder1, cosignedBy: U.elder2,
  });
  decideRemoval(req.requestId, 'approved', U.elder1, '2026-06-30T11:00:00.000Z');
  assertThrows(
    () => decideRemoval(req.requestId, 'rejected', U.elder2, '2026-06-30T12:00:00.000Z'),
    /ALREADY_DECIDED/,
  );
});

it('decideRemoval requires decider to be elder of same tradition', () => {
  _resetForTests();
  registerElder(U.elder1, 'Candomblé', '2026-01-01T00:00:00.000Z');
  registerElder(U.elder2, 'Candomblé', '2026-01-01T00:00:00.000Z');
  registerElder(U.elderCig, 'Cigano', '2026-01-01T00:00:00.000Z');
  const req = requestRemoval({
    targetUserId: U.target, tradition: 'Candomblé',
    reason: 'ethics', requestedBy: U.elder1, cosignedBy: U.elder2,
  });
  assertThrows(
    () => decideRemoval(req.requestId, 'approved', U.elderCig, '2026-06-30T11:00:00.000Z'),
    /VETO_NOT_ELDERS/,
  );
});

it('listRemovalRequests + getRemovalRequest round-trip', () => {
  _resetForTests();
  registerElder(U.elder1, 'Candomblé', '2026-01-01T00:00:00.000Z');
  registerElder(U.elder2, 'Candomblé', '2026-01-01T00:00:00.000Z');
  const req = requestRemoval({
    targetUserId: U.target, tradition: 'Candomblé',
    reason: 'ethics', requestedBy: U.elder1, cosignedBy: U.elder2,
  });
  assertEqual(listRemovalRequests().length, 1);
  const got = getRemovalRequest(req.requestId);
  assertTrue(got !== null);
  assertEqual(got!.requestId, req.requestId);
  assertEqual(getRemovalRequest(removalRequestId('r_does_not_exist')), null);
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 7 — Audit log immutability
// ════════════════════════════════════════════════════════════════════════════

it('exportAudit returns frozen entries (cannot mutate audit log)', () => {
  _resetForTests();
  awardReputation({ recipient: U.alice, fromPeer: U.bob, domain: 'contributions', tradition: 'Candomblé', weight: 5 });
  const audit = exportAudit();
  assertTrue(audit.length >= 1);
  const last = audit[audit.length - 1] as any;
  let threw = false;
  try { (last as any).kind = 'tampered'; } catch { threw = true; }
  assertTrue(threw, 'frozen entry throws on mutation');
});

it('exportAudit is frozen array (cannot push to it)', () => {
  _resetForTests();
  const audit = exportAudit();
  let threw = false;
  try { (audit as any).push({ fake: true }); } catch { threw = true; }
  assertTrue(threw, 'frozen array rejects push');
});

// ════════════════════════════════════════════════════════════════════════════
// SECTION 8 — Universalism invariant: 7 traditions always present
// ════════════════════════════════════════════════════════════════════════════

it('all 7 traditions can be the tag on a reputation event (no tradition dropped)', () => {
  _resetForTests();
  const peers = [U.alice, U.bob, U.carol, U.dan, U.elder1, U.elder2, U.elderCig];
  let i = 0;
  for (const t of ['Candomblé', 'Umbanda', 'Ifá', 'Cabala', 'Astrologia', 'Tantra', 'Cigano'] as const) {
    const recipient = peers[i % peers.length]!;
    const fromPeer = peers[(i + 1) % peers.length]!;
    const r = awardReputation({
      recipient, fromPeer, domain: 'sacred-content-quality',
      tradition: t, weight: 5, occurredAt: '2026-06-29T12:00:00.000Z',
    });
    assertEqual(r.applied, true);
    i += 1;
  }
  // Each tradition's leaderboard should have at least 1 contributor
  for (const t of ['Candomblé', 'Umbanda', 'Ifá', 'Cabala', 'Astrologia', 'Tantra', 'Cigano'] as const) {
    const list = listTopContributors(t, 'sacred-content-quality', 10, fixedDate());
    assertTrue(list.length >= 1, `tradition ${t} has contributors`);
  }
});

// ════════════════════════════════════════════════════════════════════════════
// RUNNER
// ════════════════════════════════════════════════════════════════════════════

async function runAll(): Promise<void> {
  let pass = 0;
  let fail = 0;
  const errors: { name: string; message: string }[] = [];
  for (const e of SPEC_REGISTRY) {
    try {
      await e.run();
      pass += 1;
      console.log(`  ✓ ${e.name}`);
    } catch (err) {
      fail += 1;
      const m = err instanceof Error ? err.message : String(err);
      errors.push({ name: e.name, message: m });
      console.log(`  ✗ ${e.name}\n      ${m}`);
    }
  }
  console.log(`\nW76-B Reputation Universalist — Spec Summary: ${pass} passed, ${fail} failed (${SPEC_REGISTRY.length} total)`);
  if (fail > 0) {
    console.log('\nFailures:');
    for (const e of errors) console.log(`  - ${e.name}: ${e.message}`);
    process.exit(1);
  }
  process.exit(0);
}

runAll().catch((err) => {
  console.error('Runner crashed:', err);
  process.exit(2);
});
