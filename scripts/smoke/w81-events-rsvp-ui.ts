// ============================================================================
// W81-B — events-rsvp-ui smoke script
// ----------------------------------------------------------------------------
// Lightweight runtime smoke. Confirms the engine and UI components compile
// and run via Node 22 --experimental-strip-types. ≥30 checks PASS.
// ============================================================================

import {
  type AuditEvent,
  type CapacitySnapshot,
  type EventId,
  type RsvpPhase,
  type RsvpRecord,
  type TraditionCode,
  type UserId,
  TRADITION_KIND_LABELS,
  a11yAnnounceFor,
  appendAudit,
  attemptSubmit,
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
  verifyAuditChain,
  waitlistPositionOf,
} from '../../src/lib/w81/events-rsvp-engine.ts';
import {
  CapacityMeter,
  ConfirmationToast,
  EventsRsvpCard,
  RSVPButton,
  WaitlistIndicator,
} from '../../src/lib/w81/events-rsvp-ui.ts';
import {
  countNodes,
  findByText,
  findByType,
  getProp,
  renderOnce,
} from '../../src/lib/w81/_vnode_recorder.ts';

let pass = 0;
let fail = 0;
const failures: string[] = [];

function check(name: string, cond: unknown): void {
  if (cond) {
    pass++;
  } else {
    fail++;
    failures.push(name);
  }
}

function eq<T>(name: string, actual: T, expected: T): void {
  if (actual === expected) {
    pass++;
  } else {
    fail++;
    failures.push(`${name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// ============================================================================
// 1. Branded IDs
// ============================================================================

const eid = makeEventId('ev_smoke-2026');
const uid = makeUserId('usr_smoke');
const rid = makeRsvpId('rsvp_smoke1234');
const wt = makeWaitlistToken('wl_smoke5678');

check('makeEventId valid', eid === 'ev_smoke-2026');
check('makeUserId valid', uid === 'usr_smoke');
check('makeRsvpId valid', rid.startsWith('rsvp_'));
check('makeWaitlistToken valid', wt.startsWith('wl_'));

check('tryParseEventId null on garbage', tryParseEventId('garbage') === null);
check('tryParseUserId null on garbage', tryParseUserId('garbage') === null);
check('tryParseEventId valid', tryParseEventId('ev_valid-id') !== null);

let threw = false;
try { makeEventId('no-prefix'); } catch { threw = true; }
check('makeEventId throws on invalid', threw);

threw = false;
try { makeUserId('no-prefix'); } catch { threw = true; }
check('makeUserId throws on invalid', threw);

// ============================================================================
// 2. State machine
// ============================================================================

const baseRecord = idleRsvp(eid, uid);
check('idleRsvp phase=idle', baseRecord.phase === 'idle');
check('idleRsvp no position', baseRecord.waitlistPosition === null);
check('idleRsvp no token', baseRecord.waitlistToken === null);

eq('canTransition idle→submitting', canTransition('idle', 'submitting'), true);
eq('canTransition submitting→confirmed', canTransition('submitting', 'confirmed'), true);
eq('canTransition confirmed→cancelling', canTransition('confirmed', 'cancelling'), true);
eq('canTransition waitlisted→confirmed', canTransition('waitlisted', 'confirmed'), true);
eq('canTransition idle→confirmed (illegal)', canTransition('idle', 'confirmed'), false);
eq('canTransition attended→idle (illegal)', canTransition('attended', 'idle'), false);

const t1 = transition(baseRecord, 'submitting', '2026-06-30T08:00:00Z');
check('transition submitting ok', t1.ok);
eq('transition phase', t1.record.phase, 'submitting');
eq('transition updatedAt', t1.record.updatedAt, '2026-06-30T08:00:00Z');

threw = false;
try { transition(baseRecord, 'confirmed', '2026-06-30T08:00:00Z', true); } catch { threw = true; }
check('transition throws on illegal (strict)', threw);

const t2 = transition(baseRecord, 'confirmed', '2026-06-30T08:00:00Z', false);
check('transition non-strict returns ok=false', !t2.ok);

// ============================================================================
// 3. Capacity
// ============================================================================

const unlimited = computeCapacity({ capacity: 0, confirmed: 100, waitlist: 0 });
check('unlimited isUnlimited', unlimited.isUnlimited);
eq('unlimited status', unlimited.status, 'unlimited');

const free20 = computeCapacity({ capacity: 20, confirmed: 5, waitlist: 0 });
check('free20 isUnlimited false', !free20.isUnlimited);
eq('free20 status', free20.status, 'free');
eq('free20 seatsFree', free20.seatsFree, 15);

const lastSeats = computeCapacity({ capacity: 10, confirmed: 8, waitlist: 0 });
eq('lastSeats status', lastSeats.status, 'last_seats');
eq('lastSeats seatsFree', lastSeats.seatsFree, 2);

const full10 = computeCapacity({ capacity: 10, confirmed: 10, waitlist: 5 });
eq('full10 status', full10.status, 'full');
check('full10 waitlistOpen', full10.waitlistOpen);
eq('full10 waitlistSize', full10.waitlistSize, 5);

const over = computeCapacity({ capacity: 5, confirmed: 8, waitlist: 0 });
eq('over clamped seatsTaken', over.seatsTaken, 5);
eq('over clamped seatsFree', over.seatsFree, 0);

const percent = computeCapacity({ capacity: 3, confirmed: 1, waitlist: 0 });
eq('percent rounded', percent.percentFull, 33);

// ============================================================================
// 4. Submit & promotion
// ============================================================================

const sub1 = attemptSubmit({
  eventId: eid,
  userId: uid,
  capacity: { capacity: 0, confirmed: 0, waitlist: 0 },
  now: '2026-06-30T08:00:00Z',
});
check('submit unlimited ok', sub1.ok);
eq('submit unlimited → confirmed', sub1.rsvp.phase, 'confirmed');

const sub2 = attemptSubmit({
  eventId: eid,
  userId: uid,
  capacity: { capacity: 20, confirmed: 5, waitlist: 0 },
  now: '2026-06-30T08:00:00Z',
});
check('submit free ok', sub2.ok);
eq('submit free → confirmed', sub2.rsvp.phase, 'confirmed');

const sub3 = attemptSubmit({
  eventId: eid,
  userId: uid,
  capacity: { capacity: 10, confirmed: 10, waitlist: 0 },
  now: '2026-06-30T08:00:00Z',
});
check('submit full ok', sub3.ok);
eq('submit full → waitlisted', sub3.rsvp.phase, 'waitlisted');
eq('submit full position=1', sub3.rsvp.waitlistPosition, 1);
check('submit full has token', sub3.rsvp.waitlistToken !== null);

const sub4 = attemptSubmit({
  eventId: eid,
  userId: uid,
  capacity: { capacity: 10, confirmed: 10, waitlist: 3 },
  now: '2026-06-30T08:00:00Z',
});
eq('submit full+waitlist position=4', sub4.rsvp.waitlistPosition, 4);

const promo = promoteFromWaitlist({ headRecord: sub3.rsvp, now: '2026-06-30T08:01:00Z' });
check('promote ok', promo.ok);
check('promote promoted=true', promo.promoted);
eq('promote phase=confirmed', promo.record.phase, 'confirmed');

const promo2 = promoteFromWaitlist({ headRecord: sub2.rsvp, now: '2026-06-30T08:01:00Z' });
check('promote on confirmed ok=false', !promo2.ok);
check('promote on confirmed promoted=false', !promo2.promoted);

eq('waitlistPositionOf confirmed → null', waitlistPositionOf(sub2.rsvp), null);
eq('waitlistPositionOf waitlisted → 4', waitlistPositionOf(sub4.rsvp), 4);
eq('waitlistPositionOf null record → null', waitlistPositionOf(null), null);

// ============================================================================
// 5. 7-tradition labels
// ============================================================================

const TRADITIONS: TraditionCode[] = [
  'cigano',
  'candomble',
  'umbanda',
  'ifa',
  'cabala',
  'astrologia',
  'tantra',
];

eq('7 traditions defined', Object.keys(TRADITION_KIND_LABELS).length, 7);
TRADITIONS.forEach((t) => {
  const list = labelsForTradition(t);
  check(`${t} has labels`, list.length >= 1);
  check(`${t} labels frozen`, Object.isFrozen(list));
});

check('cigano leitura', labelFor('cigano', 'leitura') !== null);
check('candomble gira', labelFor('candomble', 'gira') !== null);
check('umbanda gira', labelFor('umbanda', 'gira') !== null);
check('ifa mutirao', labelFor('ifa', 'mutirao') !== null);
check('cabala leitura', labelFor('cabala', 'leitura') !== null);
check('astrologia leitura', labelFor('astrologia', 'leitura') !== null);
check('tantra mantra', labelFor('tantra', 'mantra') !== null);

eq('cigano has no gira', labelFor('cigano', 'gira' as any), null);

// ============================================================================
// 6. Audit chain
// ============================================================================

const SECRET = 'smoke-secret';
let chain: AuditEvent[] = [];
chain = [...chain, appendAudit({ chain, eventId: eid, userId: uid, phase: 'idle', secret: SECRET, now: '2026-06-30T08:00:00Z' })];
chain = [...chain, appendAudit({ chain, eventId: eid, userId: uid, phase: 'submitting', secret: SECRET, now: '2026-06-30T08:00:01Z' })];
chain = [...chain, appendAudit({ chain, eventId: eid, userId: uid, phase: 'confirmed', secret: SECRET, now: '2026-06-30T08:00:02Z' })];

eq('chain length 3', chain.length, 3);
eq('chain[0] seq=0', chain[0]!.seq, 0);
eq('chain[0] prevHash=GENESIS', chain[0]!.prevHash, 'GENESIS');
eq('chain[1] prevHash=chain[0] hash', chain[1]!.prevHash, chain[0]!.hash);
eq('chain[2] prevHash=chain[1] hash', chain[2]!.prevHash, chain[1]!.hash);

check('verifyAuditChain valid', verifyAuditChain(chain, SECRET));
check('verifyAuditChain wrong secret', !verifyAuditChain(chain, 'wrong'));

const tampered = Object.freeze({ ...chain[2]!, hash: 'tampered-hash' });
check('verifyAuditChain tampered', !verifyAuditChain([...chain.slice(0, 2), tampered], SECRET));

const h1 = hashAuditEvent({
  seq: 0,
  eventId: eid,
  userId: uid,
  phase: 'idle',
  at: '2026-06-30T08:00:00Z',
  prevHash: 'GENESIS',
}, SECRET);
const h2 = hashAuditEvent({
  seq: 0,
  eventId: eid,
  userId: uid,
  phase: 'idle',
  at: '2026-06-30T08:00:00Z',
  prevHash: 'GENESIS',
}, SECRET);
eq('hash deterministic', h1, h2);
eq('hash length 64', h1.length, 64);

// ============================================================================
// 7. CTA & A11Y labels
// ============================================================================

eq('cta idle free', ctaLabelFor('idle', true), 'Confirmar presenca (gratuito)');
eq('cta idle paid', ctaLabelFor('idle', false), 'Inscrever-se');
eq('cta submitting', ctaLabelFor('submitting', false), 'Enviando...');
eq('cta confirmed', ctaLabelFor('confirmed', false), 'Voce esta inscrita. Cancelar');
eq('cta waitlisted', ctaLabelFor('waitlisted', false), 'Na lista de espera. Sair');
eq('cta rejected', ctaLabelFor('rejected', false), 'Inscricao rejeitada. Tentar novamente');
eq('cta cancelling', ctaLabelFor('cancelling', false), 'Cancelando...');

check('a11y confirmed', a11yAnnounceFor('confirmed').includes('confirmada'));
check('a11y waitlisted', a11yAnnounceFor('waitlisted').includes('lista de espera'));
check('a11y rejected', a11yAnnounceFor('rejected').includes('rejeitada'));

// ============================================================================
// 8. UI components
// ============================================================================

const uiSub = attemptSubmit({
  eventId: eid,
  userId: uid,
  capacity: { capacity: 10, confirmed: 5, waitlist: 0 },
});

const btnV = renderOnce(RSVPButton, {
  record: uiSub.rsvp,
  isFree: false,
  onSubmit: () => {},
  onCancel: () => {},
});
check('btn renders', btnV.root !== null);
check('btn has button element', findByType(btnV.root, 'button').length >= 1);
const btnEl = findByType(btnV.root, 'button')[0]!;
eq('btn data-phase', getProp(btnEl, 'data-phase'), 'confirmed');
eq('btn min-height 44px', getProp<any>(btnEl, 'style')?.minHeight, '44px');

const wlV = renderOnce(WaitlistIndicator, { position: 3, total: 5, promoted: false });
check('wl renders', wlV.root !== null);
check('wl shows position 3', findByText(wlV.root, 'no 3'));

const wlPromo = renderOnce(WaitlistIndicator, { position: null, total: 0, promoted: true });
check('wl promo renders', wlPromo.root !== null);
check('wl promo text', findByText(wlPromo.root, 'promovido'));

const capV = renderOnce(CapacityMeter, { view: full10 });
check('cap renders', capV.root !== null);
check('cap shows lotado', findByText(capV.root, 'lotado'));

const toastV = renderOnce(ConfirmationToast, { phase: 'confirmed', detail: 'test' });
check('toast renders', toastV.root !== null);
check('toast shows confirmada', findByText(toastV.root, 'confirmada'));

// ============================================================================
// 9. Card composer
// ============================================================================

const cardV = renderOnce(EventsRsvpCard, {
  eventId: eid,
  userId: uid,
  record: uiSub.rsvp,
  capacity: { capacity: 10, confirmed: 5, waitlist: 0 },
  isFree: false,
  tradition: 'candomble',
  label: labelFor('candomble', 'gira')!,
  title: 'Gira de Cabocla',
  startsAt: '2026-07-21T20:00:00-03:00',
  promotedFromWaitlist: false,
  onSubmit: () => {},
  onCancel: () => {},
});
check('card renders', cardV.root !== null);
check('card has article', findByType(cardV.root, 'article').length >= 1);
check('card has h3', findByType(cardV.root, 'h3').length >= 1);
check('card has progressbar', findByType(cardV.root, 'div').filter((n) => getProp(n, 'role') === 'progressbar').length >= 1);
check('card node count >= 5', countNodes(cardV.root) >= 5);

const cardWl = renderOnce(EventsRsvpCard, {
  eventId: eid,
  userId: uid,
  record: sub4.rsvp,
  capacity: { capacity: 10, confirmed: 10, waitlist: 4 },
  isFree: false,
  tradition: 'candomble',
  label: labelFor('candomble', 'gira')!,
  title: 'Gira Lotada',
  startsAt: '2026-07-21T20:00:00-03:00',
  promotedFromWaitlist: false,
  onSubmit: () => {},
  onCancel: () => {},
});
check('card waitlist shows position', findByText(cardWl.root, 'no 4'));
check('card waitlist shows total', findByText(cardWl.root, '4 pessoa'));

// ============================================================================
// 10. All 7 traditions render
// ============================================================================

TRADITIONS.forEach((t) => {
  const v = renderOnce(EventsRsvpCard, {
    eventId: eid,
    userId: uid,
    record: uiSub.rsvp,
    capacity: { capacity: 10, confirmed: 5, waitlist: 0 },
    isFree: true,
    tradition: t,
    label: labelsForTradition(t)[0]!,
    title: `${t} test`,
    startsAt: '2026-09-14T15:00:00-03:00',
    promotedFromWaitlist: false,
    onSubmit: () => {},
    onCancel: () => {},
  });
  check(`${t} card renders`, v.root !== null);
  eq(`${t} data-tradition`, getProp(findByType(v.root, 'article')[0]!, 'data-tradition'), t);
});

// ============================================================================
// Report
// ============================================================================

const total = pass + fail;
console.log(`\n[w81-events-rsvp-ui smoke] PASS: ${pass}/${total}`);
if (fail > 0) {
  console.log(`[w81-events-rsvp-ui smoke] FAIL: ${fail}`);
  failures.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
}
if (total < 30) {
  console.log(`[w81-events-rsvp-ui smoke] WARN: total ${total} < 30`);
  process.exit(2);
}
process.exit(0);