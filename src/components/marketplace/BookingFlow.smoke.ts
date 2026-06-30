/**
 * ════════════════════════════════════════════════════════════════════════════
 * W80-C — MARKETPLACE BOOKING FLOW · SMOKE HARNESS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Inline checks for quick verification without the full spec runner.
 * ≥15 inline assertions covering: offering count, slot generation, pricing,
 * LGPD consent, state machine transitions, HMAC chain integrity.
 *
 * Run with: node --experimental-strip-types BookingFlow.smoke.ts
 */

// @ts-ignore
import {
  listOfferings,
  generateSlots,
  priceService,
  issueConsentToken,
  isConsentValid,
  createBookingDraft,
  attachConsent,
  transitionToPayment,
  markPaymentSucceeded,
  markConfirmed,
  cancelBooking,
  appendAudit,
  exportAuditLedger,
  resetAuditLedgerForTests,
  validatePricing,
  canTransition,
  formatBRL,
  SACRED_TRADITIONS,
  TRADITION_LABELS,
  MIN_TOUCH_TARGET_PX,
  W80_C_VERSION,
  W80_C_CYCLE,
  W80_C_TRADITIONS_COVERED,
  universalistId,
} from './marketplace-engine-contract.ts';

declare const process: { exit(code: number): never };

let passes = 0;
let fails = 0;

function check(label: string, cond: boolean): void {
  if (cond) {
    passes++;
    console.log(`  ✓ ${label}`);
  } else {
    fails++;
    console.log(`  ✗ ${label}`);
  }
}

console.log('W80-C Marketplace Booking Flow — Smoke Harness\n');

// ════════════════════════════════════════════════════════════════════════════
// Inline checks
// ════════════════════════════════════════════════════════════════════════════

resetAuditLedgerForTests();

// Version + constants
check('W80_C_VERSION = 1.0.0', W80_C_VERSION === '1.0.0');
check('W80_C_CYCLE = 80', W80_C_CYCLE === 80);
check('W80_C_TRADITIONS_COVERED = 7', W80_C_TRADITIONS_COVERED === 7);
check('MIN_TOUCH_TARGET_PX = 44', MIN_TOUCH_TARGET_PX === 44);
check('7 sacred traditions', SACRED_TRADITIONS.length === 7);
check('LEITURA_CIGANO label = Leitura de Cigano', TRADITION_LABELS.LEITURA_CIGANO === 'Leitura de Cigano');

// Offering list
const offerings = listOfferings();
check('21 offerings total', offerings.length === 21);
check('all offerings cover 7 traditions', new Set(offerings.map((o) => o.tradition)).size === 7);
check('offerings are frozen', offerings.every((o) => Object.isFrozen(o)));
const eligibleCount = offerings.filter((o) => o.isSellerEligible).length;
check('at least 10 eligible offerings', eligibleCount >= 10);

// Slot generation
const firstEligible = offerings.find((o) => o.isSellerEligible)!;
const slots = generateSlots({
  universalistId: firstEligible.universalistId,
  offeringId: firstEligible.id,
  durationMin: firstEligible.durationMin,
  now: '2026-07-01T00:00:00.000Z',
});
check('42 slots generated (14 days × 3)', slots.length === 42);
check('some slots AVAILABLE', slots.some((s) => s.status === 'AVAILABLE'));
check('all slots have offeringId', slots.every((s) => s.offeringId === firstEligible.id));

// Pricing
const quote = priceService({ offering: firstEligible, seekerId: universalistId('seeker_smoke_w80') });
check('priceService ok', quote.ok);
if (quote.ok) {
  check('quote total > 0', quote.value.totalBRLCents > 0);
  check('HMAC chain hash 64-hex', /^[a-f0-9]{64}$/.test(quote.value.chainHash));
  check('fee + net + tax = total', quote.value.platformFeeBRLCents + quote.value.netToSellerBRLCents + quote.value.taxBRLCents === quote.value.totalBRLCents);
}

// LGPD consent
const consent = issueConsentToken({
  scopes: ['pii_capture', 'payment_processing'],
  ipRedacted: 'a'.repeat(8),
  userAgentHash: 'b'.repeat(8),
  now: '2026-07-01T00:00:00.000Z',
});
check('LGPD consent issued', consent.token.startsWith('cns_'));
check('consent is frozen', Object.isFrozen(consent));
check('isConsentValid true', isConsentValid(consent, ['pii_capture', 'payment_processing']));

// State machine
check('DRAFT → AWAITING_CONSENT legal', canTransition('DRAFT', 'AWAITING_CONSENT'));
check('RELEASED → CANCELLED illegal', !canTransition('RELEASED', 'CANCELLED'));

// End-to-end flow
const availSlot = slots.find((s) => s.status === 'AVAILABLE')!;
const draft = createBookingDraft({ offering: firstEligible, slot: availSlot, seekerId: universalistId('seeker_e2e'), now: '2026-07-01T00:00:00.000Z' });
check('createBookingDraft ok', draft.ok);
if (draft.ok) {
  const ac = attachConsent(draft.value, consent, '2026-07-01T00:00:00.000Z');
  check('attachConsent ok', ac.ok);
  if (ac.ok) {
    const tp = transitionToPayment(ac.value, '2026-07-01T00:00:00.000Z');
    check('transitionToPayment ok', tp.ok);
    if (tp.ok) {
      const ps = markPaymentSucceeded(tp.value, '2026-07-01T00:00:00.000Z');
      check('markPaymentSucceeded ok', ps.ok);
      if (ps.ok) {
        const cf = markConfirmed(ps.value, '2026-07-01T00:00:00.000Z');
        check('markConfirmed ok', cf.ok);
      }
    }
  }
}

// Cancel flow
const draft2 = createBookingDraft({ offering: firstEligible, slot: availSlot, seekerId: universalistId('seeker_cancel'), now: '2026-07-01T00:00:00.000Z' });
if (draft2.ok) {
  const cb = cancelBooking(draft2.value, '2026-07-01T00:00:00.000Z');
  check('cancelBooking ok', cb.ok);
}

// Audit chain
const o = offerings[0]!;
const s = slots[0]!;
const dr = createBookingDraft({ offering: o, slot: s, seekerId: universalistId('seeker_audit'), now: '2026-07-01T00:00:00.000Z' });
if (dr.ok) {
  appendAudit(dr.value, 'DRAFT', 'DRAFT', '2026-07-01T00:00:00.000Z');
  const log = exportAuditLedger();
  check('audit ledger has entries', log.length >= 1);
  check('audit entries frozen', log.every((e) => Object.isFrozen(e)));
}

// formatBRL
check('formatBRL R$ 100,00', /R\$\s*100,00/.test(formatBRL(10000 as never)));
check('formatBRL R$ 1.234,56', /R\$\s*1\.234,56/.test(formatBRL(123456 as never)));

// validatePricing
check('validatePricing eligible ok', validatePricing(firstEligible).ok);
const ineligible = offerings.find((o) => !o.isSellerEligible);
if (ineligible) {
  check('validatePricing ineligible fails', !validatePricing(ineligible).ok);
}

// ════════════════════════════════════════════════════════════════════════════
// Result
// ════════════════════════════════════════════════════════════════════════════

console.log('');
console.log(`  RESULT: ${passes} PASS · ${fails} FAIL · ${passes + fails} total`);
if (fails > 0) process.exit(1);
