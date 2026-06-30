// ============================================================================
// SMOKE — W80-B events-rsvp-ui (Cycle 80)
// ----------------------------------------------------------------------------
// W80-B · 2026-06-30
// Smoke runtime that verifies:
//   1. Module loads under node --experimental-strip-types
//   2. Public API surface (helpers + component) exists
//   3. 7-tradition coverage is complete
//   4. All 3 RSVP states (going/maybe/declined) covered
//   5. Capacity display variants covered
//
// Sync runtime — no test runner. Mirrors W79-B smoke shape.
// ============================================================================

import { performance } from 'node:perf_hooks';

const results: string[] = [];
let totalChecks = 0;
let passedChecks = 0;

function check(label: string, cond: boolean): void {
  totalChecks += 1;
  if (cond) passedChecks += 1;
  else results.push(`FAIL: ${label}`);
}

async function main(): Promise<void> {
  const t0 = performance.now();

  // ── 1. module loads ──
  const helpers = await import('../../src/components/events/RSVPForm.helpers.ts');
  check('1.1 helpers exports TRADITION_LABEL', typeof helpers.TRADITION_LABEL === 'object');
  check('1.2 helpers exports TRADITION_IDS', Array.isArray(helpers.TRADITION_IDS));
  check('1.3 helpers exports EVENT_TYPE_LABEL', typeof helpers.EVENT_TYPE_LABEL === 'object');
  check('1.4 helpers exports RSVP_STATE_LABEL', typeof helpers.RSVP_STATE_LABEL === 'object');
  check('1.5 helpers exports RSVP_STATE_LABEL_ACTIVE', typeof helpers.RSVP_STATE_LABEL_ACTIVE === 'object');
  check('1.6 helpers exports isTradition', typeof helpers.isTradition === 'function');
  check('1.7 helpers exports isEventType', typeof helpers.isEventType === 'function');
  check('1.8 helpers exports traditionLabel', typeof helpers.traditionLabel === 'function');
  check('1.9 helpers exports eventTypeLabel', typeof helpers.eventTypeLabel === 'function');
  check('1.10 helpers exports buildCapacityDisplay', typeof helpers.buildCapacityDisplay === 'function');
  check('1.11 helpers exports deriveRsvpTransition', typeof helpers.deriveRsvpTransition === 'function');
  check('1.12 helpers exports buildRsvpAnnouncement', typeof helpers.buildRsvpAnnouncement === 'function');
  check('1.13 helpers exports getButtonAvailability', typeof helpers.getButtonAvailability === 'function');
  check('1.14 helpers exports defaultRsvpState', typeof helpers.defaultRsvpState === 'function');

  const comp = await import('../../src/components/events/RSVPForm.ts');
  check('1.15 component exports RSVPForm', typeof comp.RSVPForm === 'function');

  // ── 2. 7-tradition coverage ──
  const traditions = helpers.TRADITION_IDS;
  check('2.1 TRADITION_IDS length = 7', traditions.length === 7);
  for (const t of traditions) {
    check(`2.2 tradition ${t} has label`, typeof helpers.TRADITION_LABEL[t] === 'string');
    check(`2.3 isTradition(${t}) = ${t}`, helpers.isTradition(t) === t);
  }
  check('2.4 TRADITION_LABEL frozen', Object.isFrozen(helpers.TRADITION_LABEL));

  // ── 3. 4 event types ──
  const types: ReadonlyArray<string> = ['workshop', 'ritual', 'study-circle', 'meditation'];
  for (const t of types) {
    check(`3.1 eventType ${t} recognized`, helpers.isEventType(t) === t);
    check(`3.2 eventType ${t} has label`, typeof helpers.EVENT_TYPE_LABEL[t as 'workshop'] === 'string');
  }

  // ── 4. RSVP states ──
  const states: ReadonlyArray<Exclude<typeof helpers.defaultRsvpState extends () => infer R ? R : never, null>> = ['going', 'maybe', 'declined'];
  for (const s of states) {
    check(`4.1 RSVP_STATE_LABEL.${s} exists`, typeof helpers.RSVP_STATE_LABEL[s] === 'string');
    check(`4.2 RSVP_STATE_LABEL_ACTIVE.${s} exists`, typeof helpers.RSVP_STATE_LABEL_ACTIVE[s] === 'string');
    const t = helpers.deriveRsvpTransition(null, s);
    check(`4.3 transition null → ${s} ok`, !('error' in t));
  }

  // ── 5. Capacity variants ──
  const unlimited = helpers.buildCapacityDisplay(50, 0);
  check('5.1 capacity unlimited has null remaining', unlimited.remaining === null);
  const empty = helpers.buildCapacityDisplay(0, 20);
  check('5.2 capacity empty has 20 remaining', empty.remaining === 20);
  const partial = helpers.buildCapacityDisplay(14, 20);
  check('5.3 capacity partial not full', partial.isFull === false);
  const full = helpers.buildCapacityDisplay(20, 20);
  check('5.4 capacity full isFull=true', full.isFull === true);

  // ── 6. Availability logic ──
  const cap = helpers.buildCapacityDisplay(20, 20);
  check('6.1 going + full → waitlist_required', helpers.getButtonAvailability(null, 'going', cap, false) === 'waitlist_required');
  check('6.2 maybe + full → available', helpers.getButtonAvailability(null, 'maybe', cap, false) === 'available');
  check('6.3 declined + closed → event_closed', helpers.getButtonAvailability(null, 'declined', helpers.buildCapacityDisplay(5, 20), true) === 'event_closed');

  // ── 7. Transition rules ──
  const t1 = helpers.deriveRsvpTransition('going', 'declined');
  check('7.1 going → declined requiresConfirm', !('error' in t1) && t1.requiresConfirm === true);
  const t2 = helpers.deriveRsvpTransition('maybe', 'going');
  check('7.2 maybe → going no confirm', !('error' in t2) && t2.requiresConfirm === false);
  const t3 = helpers.deriveRsvpTransition('going', 'going');
  check('7.3 going → going is NOOP', !('error' in t3) && t3.willMutate === false);

  // ── Report ──
  const elapsed = (performance.now() - t0).toFixed(2);
  // eslint-disable-next-line no-console
  console.log(`[smoke/w80-b-events-rsvp] ${passedChecks}/${totalChecks} checks passed (${elapsed} ms)`);
  if (results.length > 0) {
    // eslint-disable-next-line no-console
    console.error('\nFAILURES:\n' + results.join('\n'));
    process.exit(1);
  }
}

void main();
