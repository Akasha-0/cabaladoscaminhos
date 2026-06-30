// ============================================================================
// W81-B — events-rsvp-ui spec harness (self-running)
// ----------------------------------------------------------------------------
// Asserts on:
//   1. Engine: branded IDs, state machine, capacity, waitlist, audit chain
//   2. UI components: rendered vnode trees, ARIA attributes, accessibility
//   3. 7-tradition labels
//   4. End-to-end RSVP flow simulation
//
// Harness style (cycle 80 lessons):
//   - No external test framework (vitest/jest) — self-running with describe/it
//   - Module-level state for beforeEach cleanup
//   - Asserts via simple `if (!ok) throw` for fail-fast
//   - Async queue drained at end
// ============================================================================

import {
  type AuditEvent,
  type CapacitySnapshot,
  type EventId,
  type RsvpPhase,
  type RsvpRecord,
  type TraditionCode,
  type UserId,
  appendAudit,
  attemptSubmit,
  a11yAnnounceFor,
  canTransition,
  computeCapacity,
  ctaLabelFor,
  hashAuditEvent,
  idleRsvp,
  labelFor,
  labelsForTradition,
  makeEventId,
  makeRsvpId,
  makeUserId,
  makeWaitlistToken,
  promoteFromWaitlist,
  transition,
  tryParseEventId,
  tryParseUserId,
  TRADITION_KIND_LABELS,
  verifyAuditChain,
  waitlistPositionOf,
} from './events-rsvp-engine.ts';
import type { ReactElement } from './react-types.ts';
import {
  CapacityMeter,
  ConfirmationToast,
  EventsRsvpCard,
  RSVPButton,
  WaitlistIndicator,
} from './events-rsvp-ui.ts';
import {
  countNodes,
  createElement,
  findByText,
  findByType,
  getProp,
  renderOnce,
  walkAll,
} from './_vnode_recorder.ts';

// ============================================================================
// Self-running harness
// ============================================================================

let passCount = 0;
let failCount = 0;
const failures: string[] = [];

function it(name: string, fn: () => void | Promise<void>): void {
  try {
    const r = fn();
    if (r instanceof Promise) {
      r.then(
        () => {
          passCount++;
        },
        (e) => {
          failCount++;
          failures.push(`[${name}] ${e?.message ?? e}`);
        },
      );
    } else {
      passCount++;
    }
  } catch (e: any) {
    failCount++;
    failures.push(`[${name}] ${e?.message ?? e}`);
  }
}

function describe(name: string, fn: () => void): void {
  // No-op grouping — just run the body
  fn();
}

function assert(cond: unknown, msg: string): void {
  if (!cond) throw new Error(msg);
}

function assertEq<T>(actual: T, expected: T, msg: string): void {
  if (actual !== expected) {
    throw new Error(`${msg} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// ============================================================================
// 1. Branded types
// ============================================================================

describe('branded IDs', () => {
  it('makeEventId accepts valid prefix', () => {
    const id = makeEventId('ev_arvore-da-vida');
    assertEq(id, 'ev_arvore-da-vida' as EventId, 'eventId round-trip');
  });

  it('makeEventId rejects invalid prefix', () => {
    let threw = false;
    try {
      makeEventId('not-a-valid-id');
    } catch {
      threw = true;
    }
    assert(threw, 'expected throw on invalid EventId');
  });

  it('makeUserId accepts valid prefix', () => {
    const id = makeUserId('usr_hermes-123');
    assert(id === ('usr_hermes-123' as UserId), 'userId round-trip');
  });

  it('makeUserId rejects invalid prefix', () => {
    let threw = false;
    try {
      makeUserId('bad-id');
    } catch {
      threw = true;
    }
    assert(threw, 'expected throw on invalid UserId');
  });

  it('makeRsvpId accepts valid prefix', () => {
    const id = makeRsvpId('rsvp_abc123');
    assert(id.startsWith('rsvp_'), 'rsvp prefix');
  });

  it('makeRsvpId rejects invalid prefix', () => {
    let threw = false;
    try {
      makeRsvpId('not-prefix');
    } catch {
      threw = true;
    }
    assert(threw, 'expected throw');
  });

  it('makeWaitlistToken accepts valid prefix', () => {
    const t = makeWaitlistToken('wl_xyz123');
    assert(t.startsWith('wl_'), 'waitlist prefix');
  });

  it('tryParseEventId returns null on invalid', () => {
    assertEq(tryParseEventId('garbage'), null, 'tryParse returns null');
  });

  it('tryParseEventId returns branded on valid', () => {
    const r = tryParseEventId('ev_cigano-gira-2026');
    assert(r !== null, 'valid id parsed');
    assertEq(r, 'ev_cigano-gira-2026' as EventId, 'branded type preserved');
  });

  it('tryParseUserId returns null on invalid', () => {
    assertEq(tryParseUserId('no-prefix'), null, 'null on invalid');
  });

  it('tryParseUserId returns branded on valid', () => {
    const r = tryParseUserId('usr_test');
    assert(r !== null, 'valid userId parsed');
  });
});

// ============================================================================
// 2. State machine
// ============================================================================

describe('RSVP state machine', () => {
  const eid = makeEventId('ev_test_state');
  const uid = makeUserId('usr_test');

  it('canTransition idle → submitting', () => {
    assert(canTransition('idle', 'submitting'), 'idle→submitting');
  });

  it('canTransition submitting → confirmed', () => {
    assert(canTransition('submitting', 'confirmed'), 'submitting→confirmed');
  });

  it('canTransition submitting → waitlisted', () => {
    assert(canTransition('submitting', 'waitlisted'), 'submitting→waitlisted');
  });

  it('canTransition submitting → rejected', () => {
    assert(canTransition('submitting', 'rejected'), 'submitting→rejected');
  });

  it('canTransition confirmed → cancelling', () => {
    assert(canTransition('confirmed', 'cancelling'), 'confirmed→cancelling');
  });

  it('canTransition waitlisted → confirmed (promotion)', () => {
    assert(canTransition('waitlisted', 'confirmed'), 'waitlisted→confirmed');
  });

  it('rejects illegal idle → confirmed', () => {
    assert(!canTransition('idle', 'confirmed'), 'illegal idle→confirmed');
  });

  it('rejects illegal attended → idle', () => {
    assert(!canTransition('attended', 'idle'), 'terminal state has no exits');
  });

  it('rejects illegal no_show → anything', () => {
    assert(!canTransition('no_show', 'idle'), 'no_show is terminal');
  });

  it('transition returns new record with updated phase', () => {
    const r = idleRsvp(eid, uid);
    const out = transition(r, 'submitting', '2026-06-30T08:00:00Z');
    assert(out.ok, 'ok=true');
    assertEq(out.record.phase, 'submitting', 'phase updated');
    assertEq(out.record.updatedAt, '2026-06-30T08:00:00Z', 'updatedAt set');
  });

  it('transition throws on illegal in strict mode', () => {
    const r = idleRsvp(eid, uid);
    let threw = false;
    try {
      transition(r, 'confirmed', '2026-06-30T08:00:00Z', true);
    } catch {
      threw = true;
    }
    assert(threw, 'strict throws');
  });

  it('transition returns ok=false in non-strict mode', () => {
    const r = idleRsvp(eid, uid);
    const out = transition(r, 'confirmed', '2026-06-30T08:00:00Z', false);
    assert(!out.ok, 'ok=false');
    assert(out.error !== undefined, 'error populated');
  });
});

// ============================================================================
// 3. Capacity arithmetic
// ============================================================================

describe('capacity arithmetic', () => {
  it('unlimited capacity returns isUnlimited=true', () => {
    const v = computeCapacity({ capacity: 0, confirmed: 50, waitlist: 0 });
    assert(v.isUnlimited, 'isUnlimited');
    assertEq(v.status, 'unlimited', 'status=unlimited');
    assert(v.seatsFree === Number.POSITIVE_INFINITY, 'infinity seats');
  });

  it('free capacity returns status=free when seats available', () => {
    const v = computeCapacity({ capacity: 20, confirmed: 5, waitlist: 0 });
    assert(!v.isUnlimited, 'not unlimited');
    assertEq(v.status, 'free', 'status=free');
    assertEq(v.seatsFree, 15, '15 free seats');
    assertEq(v.percentFull, 25, '25% full');
  });

  it('last_seats when 3 or fewer remain', () => {
    const v = computeCapacity({ capacity: 10, confirmed: 8, waitlist: 0 });
    assertEq(v.status, 'last_seats', 'last_seats');
    assertEq(v.seatsFree, 2, '2 free');
  });

  it('full when confirmed >= capacity', () => {
    const v = computeCapacity({ capacity: 10, confirmed: 10, waitlist: 2 });
    assertEq(v.status, 'full', 'full');
    assertEq(v.seatsFree, 0, '0 free');
    assert(v.waitlistOpen, 'waitlist open');
    assertEq(v.waitlistSize, 2, 'waitlist size=2');
  });

  it('clamps seatsTaken at capacity (over-counted)', () => {
    const v = computeCapacity({ capacity: 5, confirmed: 8, waitlist: 0 });
    assertEq(v.seatsTaken, 5, 'clamped to capacity');
    assertEq(v.seatsFree, 0, '0 free');
  });

  it('percentFull rounded', () => {
    const v = computeCapacity({ capacity: 3, confirmed: 1, waitlist: 0 });
    assertEq(v.percentFull, 33, '33%');
  });

  it('view is frozen', () => {
    const v = computeCapacity({ capacity: 5, confirmed: 1, waitlist: 0 });
    assert(Object.isFrozen(v), 'capacity view frozen');
  });
});

// ============================================================================
// 4. Submit & waitlist
// ============================================================================

describe('submit & waitlist promotion', () => {
  const eid = makeEventId('ev_gira-set2026');
  const uid = makeUserId('usr_consulente');
  const NOW = '2026-06-30T08:00:00Z';

  it('attemptSubmit on unlimited → confirmed', () => {
    const out = attemptSubmit({
      eventId: eid,
      userId: uid,
      capacity: { capacity: 0, confirmed: 0, waitlist: 0 },
      now: NOW,
    });
    assert(out.ok, 'ok');
    assertEq(out.rsvp.phase, 'confirmed', 'phase=confirmed');
  });

  it('attemptSubmit on free capacity → confirmed', () => {
    const out = attemptSubmit({
      eventId: eid,
      userId: uid,
      capacity: { capacity: 20, confirmed: 5, waitlist: 0 },
      now: NOW,
    });
    assert(out.ok, 'ok');
    assertEq(out.rsvp.phase, 'confirmed', 'phase=confirmed');
  });

  it('attemptSubmit on full capacity → waitlisted with position 1', () => {
    const out = attemptSubmit({
      eventId: eid,
      userId: uid,
      capacity: { capacity: 10, confirmed: 10, waitlist: 0 },
      now: NOW,
    });
    assert(out.ok, 'ok');
    assertEq(out.rsvp.phase, 'waitlisted', 'waitlisted');
    assertEq(out.rsvp.waitlistPosition, 1, 'position 1');
    assert(out.rsvp.waitlistToken !== null, 'token issued');
  });

  it('attemptSubmit on full capacity with existing waitlist → position N+1', () => {
    const out = attemptSubmit({
      eventId: eid,
      userId: uid,
      capacity: { capacity: 10, confirmed: 10, waitlist: 3 },
      now: NOW,
    });
    assertEq(out.rsvp.waitlistPosition, 4, 'position 4');
  });

  it('promoteFromWaitlist moves head to confirmed', () => {
    const sub = attemptSubmit({
      eventId: eid,
      userId: uid,
      capacity: { capacity: 10, confirmed: 10, waitlist: 0 },
      now: NOW,
    });
    const promo = promoteFromWaitlist({ headRecord: sub.rsvp, now: NOW });
    assert(promo.ok, 'ok');
    assert(promo.promoted, 'promoted=true');
    assertEq(promo.record.phase, 'confirmed', 'phase=confirmed');
    assertEq(promo.record.waitlistPosition, null, 'position cleared');
  });

  it('promoteFromWaitlist on confirmed returns not-promoted', () => {
    const sub = attemptSubmit({
      eventId: eid,
      userId: uid,
      capacity: { capacity: 10, confirmed: 5, waitlist: 0 },
      now: NOW,
    });
    const promo = promoteFromWaitlist({ headRecord: sub.rsvp, now: NOW });
    assert(!promo.ok, 'ok=false');
    assert(!promo.promoted, 'promoted=false');
  });

  it('waitlistPositionOf returns null for non-waitlisted', () => {
    const sub = attemptSubmit({
      eventId: eid,
      userId: uid,
      capacity: { capacity: 10, confirmed: 5, waitlist: 0 },
      now: NOW,
    });
    assertEq(waitlistPositionOf(sub.rsvp), null, 'null for confirmed');
  });

  it('waitlistPositionOf returns position for waitlisted', () => {
    const sub = attemptSubmit({
      eventId: eid,
      userId: uid,
      capacity: { capacity: 10, confirmed: 10, waitlist: 2 },
      now: NOW,
    });
    assertEq(waitlistPositionOf(sub.rsvp), 3, 'position 3');
  });

  it('idleRsvp returns idle record', () => {
    const r = idleRsvp(eid, uid);
    assertEq(r.phase, 'idle', 'phase=idle');
    assert(r.id.startsWith('rsvp_'), 'id has rsvp_ prefix');
    assertEq(r.waitlistPosition, null, 'no position');
    assertEq(r.waitlistToken, null, 'no token');
  });
});

// ============================================================================
// 5. 7-tradition labels
// ============================================================================

describe('tradition labels', () => {
  const TRADITIONS: TraditionCode[] = [
    'cigano',
    'candomble',
    'umbanda',
    'ifa',
    'cabala',
    'astrologia',
    'tantra',
  ];

  it('has 7 traditions defined', () => {
    assertEq(TRADITIONS.length, 7, '7 traditions');
    assertEq(Object.keys(TRADITION_KIND_LABELS).length, 7, '7 in labels map');
  });

  TRADITIONS.forEach((t) => {
    it(`${t} has at least one label`, () => {
      const list = labelsForTradition(t);
      assert(list.length >= 1, `at least 1 label for ${t}`);
      list.forEach((l) => {
        if (l === null) throw new Error('label is null');
        assertEq(typeof l.label, 'string', 'label is string');
        assertEq(typeof l.description, 'string', 'description is string');
        assertEq(typeof l.iconHint, 'string', 'iconHint is string');
      });
    });
  });

  it('labelFor returns null on unknown kind', () => {
    assertEq(labelFor('cigano', 'gira' as any), null, 'cigano has no gira');
  });

  it('labelFor returns label on known combination', () => {
    const l = labelFor('candomble', 'gira');
    assert(l !== null, 'candomble gira found');
    if (l === null) throw new Error('unreachable');
    assertEq(l.kind, 'gira', 'kind=gira');
  });

  it('labelFor candomble → ponto', () => {
    const l = labelFor('candomble', 'ponto');
    assert(l !== null, 'ponto found');
  });

  it('labelFor ifa -> mutirao', () => {
    const l = labelFor('ifa', 'mutirao');
    assert(l !== null, 'mutirao found');
    if (l === null) throw new Error('unreachable');
    assertEq(l.kind, 'mutirao', 'kind=mutirao');
  });

  it('labelFor tantra → mantra', () => {
    const l = labelFor('tantra', 'mantra');
    assert(l !== null, 'mantra found');
  });

  it('labelFor cabala → leitura', () => {
    const l = labelFor('cabala', 'leitura');
    assert(l !== null, 'leitura found');
  });

  it('labelFor astrologia → leitura', () => {
    const l = labelFor('astrologia', 'leitura');
    assert(l !== null, 'leitura found');
  });

  it('labelFor umbanda → gira', () => {
    const l = labelFor('umbanda', 'gira');
    assert(l !== null, 'gira found');
  });

  it('TRADITION_KIND_LABELS is frozen', () => {
    assert(Object.isFrozen(TRADITION_KIND_LABELS), 'labels frozen');
  });
});

// ============================================================================
// 6. Audit chain (HMAC-SHA-256)
// ============================================================================

describe('audit chain HMAC', () => {
  const eid = makeEventId('ev_audit');
  const uid = makeUserId('usr_audit');
  const SECRET = 'super-secret-w81-b';

  it('first hash starts from GENESIS', () => {
    const ev = appendAudit({
      chain: [],
      eventId: eid,
      userId: uid,
      phase: 'idle',
      secret: SECRET,
    });
    assertEq(ev.seq, 0, 'seq=0');
    assertEq(ev.prevHash, 'GENESIS', 'prevHash=GENESIS');
    assertEq(ev.hash.length, 64, 'sha256 hex = 64 chars');
  });

  it('chains link to previous hash', () => {
    let chain: AuditEvent[] = [];
    chain = [...chain, appendAudit({ chain, eventId: eid, userId: uid, phase: 'idle', secret: SECRET })];
    chain = [...chain, appendAudit({ chain, eventId: eid, userId: uid, phase: 'submitting', secret: SECRET })];
    chain = [...chain, appendAudit({ chain, eventId: eid, userId: uid, phase: 'confirmed', secret: SECRET })];
    assertEq(chain.length, 3, '3 events');
    assertEq(chain[1]!.prevHash, chain[0]!.hash, 'chain[1] prev = chain[0] hash');
    assertEq(chain[2]!.prevHash, chain[1]!.hash, 'chain[2] prev = chain[1] hash');
  });

  it('verifyAuditChain validates valid chain', () => {
    let chain: AuditEvent[] = [];
    chain = [...chain, appendAudit({ chain, eventId: eid, userId: uid, phase: 'idle', secret: SECRET })];
    chain = [...chain, appendAudit({ chain, eventId: eid, userId: uid, phase: 'confirmed', secret: SECRET })];
    assert(verifyAuditChain(chain, SECRET), 'valid chain verified');
  });

  it('verifyAuditChain rejects tampered hash', () => {
    let chain: AuditEvent[] = [];
    chain = [...chain, appendAudit({ chain, eventId: eid, userId: uid, phase: 'idle', secret: SECRET })];
    const ev2 = appendAudit({ chain, eventId: eid, userId: uid, phase: 'confirmed', secret: SECRET });
    const tampered = Object.freeze({ ...ev2, hash: 'deadbeef' });
    chain = [...chain, tampered];
    assert(!verifyAuditChain(chain, SECRET), 'tampered rejected');
  });

  it('verifyAuditChain rejects wrong secret', () => {
    let chain: AuditEvent[] = [];
    chain = [...chain, appendAudit({ chain, eventId: eid, userId: uid, phase: 'idle', secret: SECRET })];
    assert(!verifyAuditChain(chain, 'wrong-secret'), 'wrong secret rejected');
  });

  it('hashAuditEvent deterministic', () => {
    const partial = {
      seq: 0,
      eventId: eid,
      userId: uid,
      phase: 'idle' as RsvpPhase,
      at: '2026-06-30T08:00:00Z',
      prevHash: 'GENESIS',
    };
    const h1 = hashAuditEvent(partial, SECRET);
    const h2 = hashAuditEvent(partial, SECRET);
    assertEq(h1, h2, 'deterministic');
  });
});

// ============================================================================
// 7. CTA & A11Y labels
// ============================================================================

describe('CTA & A11Y labels', () => {
  it('ctaLabelFor idle free → confirmar presenca', () => {
    assertEq(ctaLabelFor('idle', true), 'Confirmar presenca (gratuito)', 'idle free');
  });

  it('ctaLabelFor idle paid → inscrever-se', () => {
    assertEq(ctaLabelFor('idle', false), 'Inscrever-se', 'idle paid');
  });

  it('ctaLabelFor submitting → enviando', () => {
    assertEq(ctaLabelFor('submitting', false), 'Enviando...', 'submitting');
  });

  it('ctaLabelFor confirmed → cancelar', () => {
    assertEq(ctaLabelFor('confirmed', false), 'Voce esta inscrita. Cancelar', 'confirmed');
  });

  it('ctaLabelFor waitlisted → sair', () => {
    assertEq(ctaLabelFor('waitlisted', false), 'Na lista de espera. Sair', 'waitlisted');
  });

  it('a11yAnnounceFor confirmed → announcement', () => {
    const msg = a11yAnnounceFor('confirmed');
    assert(msg.includes('confirmada'), 'announces confirmation');
  });

  it('a11yAnnounceFor waitlisted → announcement', () => {
    const msg = a11yAnnounceFor('waitlisted');
    assert(msg.includes('lista de espera'), 'announces waitlist');
  });

  it('a11yAnnounceFor rejected → announcement', () => {
    const msg = a11yAnnounceFor('rejected');
    assert(msg.includes('rejeitada'), 'announces rejection');
  });
});

// ============================================================================
// 8. UI components (vnode assertions)
// ============================================================================

describe('RSVPButton component', () => {
  const eid = makeEventId('ev_btn');
  const uid = makeUserId('usr_btn');

  it('renders idle phase with primary CTA', () => {
    const r = idleRsvp(eid, uid);
    const v = renderOnce(RSVPButton, {
      record: r,
      isFree: true,
      onSubmit: () => {},
      onCancel: () => {},
    });
    assert(v.root !== null, 'rendered');
    const btns = findByType(v.root, 'button');
    assert(btns.length >= 1, 'has button');
    const btn = btns[0]!;
    assertEq(getProp(btn, 'data-phase'), 'idle', 'data-phase=idle');
    assertEq(getProp(btn, 'data-testid'), 'rsvp-button', 'testid');
  });

  it('renders submitting with aria-busy=true', () => {
    const r = { ...idleRsvp(eid, uid), phase: 'submitting' as RsvpPhase };
    const v = renderOnce(RSVPButton, {
      record: r,
      isFree: false,
      onSubmit: () => {},
      onCancel: () => {},
    });
    const btn = findByType(v.root, 'button')[0]!;
    assertEq(getProp(btn, 'aria-busy'), true, 'aria-busy');
    assertEq(getProp(btn, 'data-phase'), 'submitting', 'phase=submitting');
  });

  it('renders confirmed with aria-disabled false (clickable to cancel)', () => {
    const r = { ...idleRsvp(eid, uid), phase: 'confirmed' as RsvpPhase };
    const v = renderOnce(RSVPButton, {
      record: r,
      isFree: false,
      onSubmit: () => {},
      onCancel: () => {},
    });
    const btn = findByType(v.root, 'button')[0]!;
    assertEq(getProp(btn, 'data-phase'), 'confirmed', 'phase=confirmed');
  });

  it('respects disabled prop', () => {
    const r = idleRsvp(eid, uid);
    const v = renderOnce(RSVPButton, {
      record: r,
      isFree: true,
      disabled: true,
      onSubmit: () => {},
      onCancel: () => {},
    });
    const btn = findByType(v.root, 'button')[0]!;
    assertEq(getProp(btn, 'disabled'), true, 'disabled=true');
  });

  it('button has 44px min height', () => {
    const r = idleRsvp(eid, uid);
    const v = renderOnce(RSVPButton, {
      record: r,
      isFree: true,
      onSubmit: () => {},
      onCancel: () => {},
    });
    const btn = findByType(v.root, 'button')[0]!;
    const style = getProp<any>(btn, 'style') ?? {};
    assertEq(style.minHeight, '44px', '44px touch target');
  });

  it('invokes onSubmit when clicked in idle phase', () => {
    let called = false;
    const r = idleRsvp(eid, uid);
    renderOnce(RSVPButton, {
      record: r,
      isFree: true,
      onSubmit: () => {
        called = true;
      },
      onCancel: () => {},
    });
    const btn = findByType(renderOnce(RSVPButton, {
      record: r,
      isFree: true,
      onSubmit: () => {
        called = true;
      },
      onCancel: () => {},
    }).root, 'button')[0]!;
    const onClick = getProp<() => void>(btn, 'onClick');
    assert(onClick !== undefined, 'onClick handler set');
    onClick!();
    assert(called, 'onSubmit called');
  });
});

describe('WaitlistIndicator component', () => {
  it('returns null when not on waitlist', () => {
    const v = renderOnce(WaitlistIndicator, { position: null, total: 0, promoted: false });
    assert(v.root === null, 'null when not waiting');
  });

  it('shows position 1 as "proximo"', () => {
    const v = renderOnce(WaitlistIndicator, { position: 1, total: 1, promoted: false });
    assert(v.root !== null, 'rendered');
    assert(findByText(v.root, 'proximo'), 'shows "proximo"');
    assert(findByText(v.root, '1 pessoa'), 'shows total');
  });

  it('shows position N as "no N"', () => {
    const v = renderOnce(WaitlistIndicator, { position: 5, total: 5, promoted: false });
    assert(v.root !== null, 'rendered');
    assert(findByText(v.root, 'no 5'), 'shows position');
  });

  it('shows promoted banner when promoted=true', () => {
    const v = renderOnce(WaitlistIndicator, { position: null, total: 0, promoted: true });
    assert(v.root !== null, 'rendered');
    assert(findByText(v.root, 'promovido'), 'promotion text');
  });

  it('aria-live=polite', () => {
    const v = renderOnce(WaitlistIndicator, { position: 1, total: 1, promoted: false });
    const node = findByType(v.root, 'div')[0]!;
    assertEq(getProp(node, 'aria-live'), 'polite', 'live region');
  });
});

describe('CapacityMeter component', () => {
  it('renders unlimited view', () => {
    const view = computeCapacity({ capacity: 0, confirmed: 100, waitlist: 0 });
    const v = renderOnce(CapacityMeter, { view });
    assert(v.root !== null, 'rendered');
    assert(findByText(v.root, 'ilimitadas'), 'unlimited label');
    assertEq(getProp(findByType(v.root, 'div')[0]!, 'data-status'), 'unlimited', 'data-status');
  });

  it('renders full view', () => {
    const view = computeCapacity({ capacity: 10, confirmed: 10, waitlist: 3 });
    const v = renderOnce(CapacityMeter, { view });
    assert(findByText(v.root, 'lotado'), 'full label');
    assertEq(getProp(findByType(v.root, 'div')[0]!, 'data-status'), 'full', 'status=full');
  });

  it('renders last_seats warning', () => {
    const view = computeCapacity({ capacity: 10, confirmed: 8, waitlist: 0 });
    const v = renderOnce(CapacityMeter, { view });
    assert(findByText(v.root, 'Ultimas 2'), 'last seats text');
  });

  it('has progressbar role with aria-valuenow', () => {
    const view = computeCapacity({ capacity: 10, confirmed: 5, waitlist: 0 });
    const v = renderOnce(CapacityMeter, { view });
    const progress = findByType(v.root, 'div').filter(
      (n) => getProp(n, 'role') === 'progressbar',
    );
    assert(progress.length >= 1, 'has progressbar');
    assertEq(getProp(progress[0]!, 'aria-valuenow'), 5, 'aria-valuenow=5');
    assertEq(getProp(progress[0]!, 'aria-valuemax'), 10, 'aria-valuemax=10');
  });

  it('labelId wires aria-labelledby', () => {
    const view = computeCapacity({ capacity: 10, confirmed: 5, waitlist: 0 });
    const v = renderOnce(CapacityMeter, { view, labelId: 'test-label-1' });
    const meter = findByType(v.root, 'div')[0]!;
    assertEq(getProp(meter, 'aria-labelledby'), 'test-label-1', 'labelledby');
  });
});

describe('ConfirmationToast component', () => {
  it('renders confirmed toast', () => {
    const v = renderOnce(ConfirmationToast, { phase: 'confirmed' });
    assert(v.root !== null, 'rendered');
    assert(findByText(v.root, 'confirmada'), 'has confirmation');
    assertEq(getProp(findByType(v.root, 'div')[0]!, 'aria-live'), 'polite', 'live region');
  });

  it('renders waitlisted toast', () => {
    const v = renderOnce(ConfirmationToast, { phase: 'waitlisted' });
    assert(findByText(v.root, 'lista de espera'), 'has waitlist text');
  });

  it('off-screen for non-announce phases (idle)', () => {
    const v = renderOnce(ConfirmationToast, { phase: 'idle' });
    assert(v.root !== null, 'rendered (hidden)');
    assertEq(getProp(findByType(v.root, 'div')[0]!, 'aria-live'), 'polite', 'still polite');
  });

  it('renders detail when provided', () => {
    const v = renderOnce(ConfirmationToast, {
      phase: 'confirmed',
      detail: 'RSVP-abc',
    });
    assert(findByText(v.root, 'RSVP-abc'), 'detail shown');
  });
});

// ============================================================================
// 9. Full composer (EventsRsvpCard)
// ============================================================================

describe('EventsRsvpCard composer', () => {
  const eid = makeEventId('ev_card');
  const uid = makeUserId('usr_card');
  const NOW = '2026-06-30T08:00:00Z';

  it('renders article with data-testid and labels', () => {
    const sub = attemptSubmit({
      eventId: eid,
      userId: uid,
      capacity: { capacity: 20, confirmed: 5, waitlist: 0 },
      now: NOW,
    });
    const v = renderOnce(EventsRsvpCard, {
      eventId: eid,
      userId: uid,
      record: sub.rsvp,
      capacity: { capacity: 20, confirmed: 5, waitlist: 0 },
      isFree: true,
      tradition: 'cigano',
      label: labelFor('cigano', 'leitura')!,
      title: 'Leitura de Cartas — Junho',
      startsAt: '2026-09-14T15:00:00-03:00',
      promotedFromWaitlist: false,
      onSubmit: () => {},
      onCancel: () => {},
    });
    assert(v.root !== null, 'rendered');
    assertEq(getProp(findByType(v.root, 'article')[0]!, 'data-testid'), 'events-rsvp-card', 'card testid');
    assertEq(getProp(findByType(v.root, 'article')[0]!, 'data-tradition'), 'cigano', 'tradition attr');
    assertEq(getProp(findByType(v.root, 'article')[0]!, 'data-event-id'), eid, 'eventId attr');
  });

  it('shows waitlist indicator when waitlisted', () => {
    const sub = attemptSubmit({
      eventId: eid,
      userId: uid,
      capacity: { capacity: 10, confirmed: 10, waitlist: 3 },
      now: NOW,
    });
    const v = renderOnce(EventsRsvpCard, {
      eventId: eid,
      userId: uid,
      record: sub.rsvp,
      capacity: { capacity: 10, confirmed: 10, waitlist: 3 },
      isFree: false,
      tradition: 'candomble',
      label: labelFor('candomble', 'gira')!,
      title: 'Gira de Cabocla Jurema',
      startsAt: '2026-07-21T20:00:00-03:00',
      promotedFromWaitlist: false,
      onSubmit: () => {},
      onCancel: () => {},
    });
    assert(v.root !== null, 'rendered');
    assert(findByText(v.root, 'lista de espera'), 'waitlist text');
    assert(findByText(v.root, 'no 4'), 'position 4');
  });

  it('shows promotion banner when promotedFromWaitlist=true', () => {
    const sub = attemptSubmit({
      eventId: eid,
      userId: uid,
      capacity: { capacity: 10, confirmed: 9, waitlist: 1 },
      now: NOW,
    });
    const v = renderOnce(EventsRsvpCard, {
      eventId: eid,
      userId: uid,
      record: sub.rsvp,
      capacity: { capacity: 10, confirmed: 9, waitlist: 1 },
      isFree: false,
      tradition: 'ifa',
      label: labelFor('ifa', 'mutirao')!,
      title: 'Mutirão de Ifá',
      startsAt: '2026-08-09T10:00:00-03:00',
      promotedFromWaitlist: true,
      onSubmit: () => {},
      onCancel: () => {},
    });
    assert(findByText(v.root, 'promovido'), 'promotion banner');
  });

  it('renders all 7 traditions without crashing', () => {
    const TRADITIONS: TraditionCode[] = [
      'cigano',
      'candomble',
      'umbanda',
      'ifa',
      'cabala',
      'astrologia',
      'tantra',
    ];
    TRADITIONS.forEach((t) => {
      const labels = labelsForTradition(t);
      const sub = attemptSubmit({
        eventId: eid,
        userId: uid,
        capacity: { capacity: 10, confirmed: 5, waitlist: 0 },
        now: NOW,
      });
      const v = renderOnce(EventsRsvpCard, {
        eventId: eid,
        userId: uid,
        record: sub.rsvp,
        capacity: { capacity: 10, confirmed: 5, waitlist: 0 },
        isFree: true,
        tradition: t,
        label: labels[0]!,
        title: `${t} event`,
        startsAt: '2026-09-14T15:00:00-03:00',
        promotedFromWaitlist: false,
        onSubmit: () => {},
        onCancel: () => {},
      });
      assert(v.root !== null, `${t} renders`);
      assertEq(getProp(findByType(v.root, 'article')[0]!, 'data-tradition'), t, `${t} tradition attr`);
    });
  });

  it('total node count >= 5 (header + meter + button + toast + card)', () => {
    const sub = attemptSubmit({
      eventId: eid,
      userId: uid,
      capacity: { capacity: 10, confirmed: 5, waitlist: 0 },
      now: NOW,
    });
    const v = renderOnce(EventsRsvpCard, {
      eventId: eid,
      userId: uid,
      record: sub.rsvp,
      capacity: { capacity: 10, confirmed: 5, waitlist: 0 },
      isFree: false,
      tradition: 'tantra',
      label: labelFor('tantra', 'mantra')!,
      title: 'Mantra',
      startsAt: '2026-08-23T16:00:00-03:00',
      promotedFromWaitlist: false,
      onSubmit: () => {},
      onCancel: () => {},
    });
    const n = countNodes(v.root);
    assert(n >= 5, `expected ≥5 nodes, got ${n}`);
  });
});

// ============================================================================
// 10. End-to-end RSVP lifecycle simulation
// ============================================================================

describe('end-to-end RSVP lifecycle', () => {
  const eid = makeEventId('ev_e2e');
  const uid = makeUserId('usr_e2e');
  const SECRET = 'e2e-secret';

  it('lifecycle: idle → submit → confirmed → cancel → idle', () => {
    let chain: AuditEvent[] = [];
    let record = idleRsvp(eid, uid);
    record = { ...record, phase: 'submitting' };
    chain = [...chain, appendAudit({ chain, eventId: eid, userId: uid, phase: 'submitting', secret: SECRET })];

    const out = attemptSubmit({
      eventId: eid,
      userId: uid,
      capacity: { capacity: 20, confirmed: 5, waitlist: 0 },
    });
    assert(out.ok, 'submit ok');
    record = out.rsvp;
    chain = [...chain, appendAudit({ chain, eventId: eid, userId: uid, phase: 'confirmed', secret: SECRET })];

    // Cancel
    const cancel = transition(record, 'cancelling', '2026-06-30T09:00:00Z');
    assert(cancel.ok, 'cancel ok');
    chain = [...chain, appendAudit({ chain, eventId: eid, userId: uid, phase: 'cancelling', secret: SECRET })];
    const done = transition(cancel.record, 'idle', '2026-06-30T09:00:01Z');
    assert(done.ok, 'back to idle');
    chain = [...chain, appendAudit({ chain, eventId: eid, userId: uid, phase: 'idle', secret: SECRET })];

    assert(verifyAuditChain(chain, SECRET), 'chain valid');
    assertEq(done.record.phase, 'idle', 'final phase idle');
  });

  it('lifecycle: submit on full → waitlisted → promotion → confirmed', () => {
    let record: RsvpRecord;
    const sub = attemptSubmit({
      eventId: eid,
      userId: uid,
      capacity: { capacity: 10, confirmed: 10, waitlist: 0 },
    });
    record = sub.rsvp;
    assertEq(record.phase, 'waitlisted', 'waitlisted');
    assertEq(record.waitlistPosition, 1, 'position 1');

    const promo = promoteFromWaitlist({ headRecord: record });
    assert(promo.promoted, 'promoted');
    assertEq(promo.record.phase, 'confirmed', 'now confirmed');
    assertEq(promo.record.waitlistPosition, null, 'position cleared');
  });

  it('rejected path: submitting → rejected → idle → submitting → confirmed', () => {
    const draft = { ...idleRsvp(eid, uid), phase: 'submitting' as RsvpPhase };
    const rej = transition(draft, 'rejected', '2026-06-30T08:00:00Z');
    assert(rej.ok, 'to rejected');
    assertEq(rej.record.phase, 'rejected', 'rejected');
    const back = transition(rej.record, 'idle', '2026-06-30T08:00:01Z');
    assert(back.ok, 'back to idle');
    assertEq(back.record.phase, 'idle', 'idle again');
    const resubmit = transition(back.record, 'submitting', '2026-06-30T08:00:02Z');
    assert(resubmit.ok, 'resubmit');
    const final = transition(resubmit.record, 'confirmed', '2026-06-30T08:00:03Z');
    assert(final.ok, 'confirmed');
  });
});

// ============================================================================
// Report
// ============================================================================

(async () => {
  // Wait one microtick for any pending async
  await Promise.resolve();
  await Promise.resolve();

  const total = passCount + failCount;
  console.log(`\n[events-rsvp-ui.spec] PASS: ${passCount}/${total}`);
  if (failCount > 0) {
    console.log(`[events-rsvp-ui.spec] FAIL: ${failCount}`);
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exit(1);
  }
  if (total < 60) {
    console.log(`[events-rsvp-ui.spec] WARN: total ${total} < 60`);
    process.exit(2);
  }
  process.exit(0);
})();