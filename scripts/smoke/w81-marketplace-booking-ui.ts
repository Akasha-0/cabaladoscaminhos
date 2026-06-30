/**
 * w81-marketplace-booking-ui.ts — SMOKE HARNESS
 *
 * Cycle 81 · Worker C · session 414735472226387
 *
 * Inline end-to-end checks: ≥ 30 assertions covering
 *  - pricing, slots, LGPD, order lifecycle, checkout reducer, audit
 *  - all runnable via `node --experimental-strip-types w81-marketplace-booking-ui.ts`.
 *
 * Mirrors the production engine logic without depending on a test runner.
 * Self-running: prints PASS/FAIL counts at exit, returns non-zero on failure.
 */

declare const process: { exit(code: number): never };

import {
  initialCheckoutState,
  advanceCheckout,
  pricingEngine,
  validatePricing,
  generateSlotCalendar,
  assertSlotAvailable,
  buildLgpdConsentRequest,
  validateLgpdConsent,
  makeConsentMap,
  createOrderDraft,
  holdOrderEscrow,
  confirmOrder,
  cancelOrder,
  completeOrder,
  refundOrder,
  resetOrderStoreForTests,
  canCheckout,
  auditMarketplaceBooking,
  buildSampleCatalog,
  findSacredTag,
  composeSacredMultiplier,
  reputationDiscount,
  clampCents,
  isServiceType,
  isTier,
  isPaymentMethod,
  OFFERING_CATEGORIES,
  SERVICE_TYPES,
  TIERS,
  TIER_BASE_CENTS,
  LGPD_POLICY_VERSION,
  LGPD_REQUIRED_SCOPES,
  ALL_SACRED_TAGS,
  SACRED_AUDIT_FLOOR,
  SERVICE_DEFAULTS,
  W81_C_VERSION,
  listingId,
  slotId,
  userId,
  escrowId,
  orderId,
  priceCents,
  type ServiceListing,
  type ServiceListingId,
  type SlotId,
  type UserId,
  type PaymentMethod,
} from '../../src/lib/w81/marketplace-booking-engine.ts';

let passes = 0;
let fails = 0;

function check(label: string, cond: boolean): void {
  if (cond) {
    passes++;
    console.log(`  \u2713 ${label}`);
  } else {
    fails++;
    console.log(`  \u2717 ${label}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Format helpers (locale-stable, no Intl needed)
// ─────────────────────────────────────────────────────────────────────────

function formatBRL(cents: number): string {
  const reais = Math.floor(cents / 100);
  const frac = String(cents % 100).padStart(2, '0');
  const reaisStr = String(reais).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${reaisStr},${frac}`;
}

// ─────────────────────────────────────────────────────────────────────────
// Section 1 — Branded factories
// ─────────────────────────────────────────────────────────────────────────

console.log('W81-C Marketplace Booking UI \u2014 Smoke Harness\n');

check('listingId("lst_demo_ok") valid', /^lst_/.test(listingId('lst_demo_ok_xyz1234')));
let threw = false;
try { listingId('bad'); } catch { threw = true; }
check('listingId("bad") throws', threw);
threw = false;
try { slotId('slt_a'); } catch { threw = true; }
check('slotId("slt_a") throws', threw);
threw = false;
try { priceCents(-1); } catch { threw = true; }
check('priceCents(-1) throws', threw);
threw = false;
try { priceCents(10.5); } catch { threw = true; }
check('priceCents(10.5) throws (float cents)', threw);
check('userId("usr_demo_w81") valid', /^usr_/.test(userId('usr_demo_w81_xxxxxxxxxxx')));
check('orderId("ord_demo") valid', /^ord_/.test(orderId('ord_demo_xyz1234567890123')));
check('escrowId("esc_demo") valid', /^esc_/.test(escrowId('esc_demo_xyz1234567890123')));

// ─────────────────────────────────────────────────────────────────────────
// Section 2 — Type guards
// ─────────────────────────────────────────────────────────────────────────

check('isServiceType("LEITURA_CIGANO") === true', isServiceType('LEITURA_CIGANO'));
check('isServiceType("INVALID") === false', !isServiceType('INVALID'));
check('isTier("MASTER") === true', isTier('MASTER'));
check('isTier("ULTRA") === false', !isTier('ULTRA'));
check('isPaymentMethod("PIX") === true', isPaymentMethod('PIX'));
check('isPaymentMethod("APPLE_PAY") === false', !isPaymentMethod('APPLE_PAY'));

// ─────────────────────────────────────────────────────────────────────────
// Section 3 — Pricing
// ─────────────────────────────────────────────────────────────────────────

const priceBasic = pricingEngine({
  serviceType: 'LEITURA_CIGANO',
  tier: 'BASIC',
  sacredTags: [],
});
check('pricingEngine BASIC LEITURA_CIGANO = 3000 cents', priceBasic.finalCents === 3000);
check('validatePricing BASIC ok', validatePricing(priceBasic).ok);

const priceMaster = pricingEngine({
  serviceType: 'MESA_REAL',
  tier: 'MASTER',
  sacredTags: ['Casa 1', 'Casa 7', 'Casa 4', 'Casa 10'],
  sellerReputation: 5.0,
});
check('MESA_REAL MASTER finalCents in range',
  priceMaster.finalCents >= SERVICE_DEFAULTS.MESA_REAL.minCents &&
  priceMaster.finalCents <= SERVICE_DEFAULTS.MESA_REAL.maxCents);
check('MESA_REAL MASTER sacredMultiplier > 1.0', priceMaster.sacredMultiplier > 1.0);
check('MESA_REAL MASTER reputationDiscount > 0', priceMaster.reputationDiscount > 0);
check('validatePricing MASTER ok', validatePricing(priceMaster).ok);

check('reputationDiscount(0) === 0', reputationDiscount(0) === 0);
check('reputationDiscount(5.0) === 0.10', reputationDiscount(5.0) === 0.10);
check('reputationDiscount(7) capped to 0.10', reputationDiscount(7) === 0.10);

const comp1 = composeSacredMultiplier(['Exu']);
check('composeSacredMultiplier([Exu]) ~ 1.20', Math.abs(comp1.multiplier - 1.20) < 0.001);
const comp2 = composeSacredMultiplier(['Exu', 'Pomba-Gira']);
check('composeSacredMultiplier([Exu, Pomba-Gira]) ~ 1.38',
  Math.abs(comp2.multiplier - 1.38) < 0.001);

check('findSacredTag("Exu") present', findSacredTag('Exu') !== null);
check('findSacredTag("Nonexistent") null', findSacredTag('Nonexistent') === null);

check('clampCents(1000, MESA_REAL) clamps to minCents',
  clampCents(1000, 'MESA_REAL') === SERVICE_DEFAULTS.MESA_REAL.minCents);
check('clampCents(200000, MESA_REAL) clamps to maxCents',
  clampCents(200000, 'MESA_REAL') === SERVICE_DEFAULTS.MESA_REAL.maxCents);

// ─────────────────────────────────────────────────────────────────────────
// Section 4 — Slot calendar
// ─────────────────────────────────────────────────────────────────────────

const cal14 = generateSlotCalendar({
  listingId: 'lst_smoke00000000000000000000000000' as ServiceListingId,
  durationMinutes: 60,
  startDate: new Date('2026-07-01T00:00:00Z'),
  days: 14,
});
check('14 days * 5 slots = 70', cal14.length === 70);
for (const s of cal14) {
  check(`slot ${s.slotId} has booked <= capacity`, s.booked <= s.capacity);
  break; // just one structural check
}
const someSlot = cal14[0];
if (someSlot) {
  const v = assertSlotAvailable(cal14, someSlot.slotId);
  check('assertSlotAvailable valid slot ok', v.ok);
}
check('assertSlotAvailable unknown slot fails',
  !assertSlotAvailable(cal14, 'slt_unknown_xxxxxxxxxxxxxxxxxxxxxxxxx' as SlotId).ok);

// ─────────────────────────────────────────────────────────────────────────
// Section 5 — LGPD consent
// ─────────────────────────────────────────────────────────────────────────

check('LGPD_POLICY_VERSION semver-ish', /^v\d+\.\d+\.\d+-w\d+$/.test(LGPD_POLICY_VERSION));
check('LGPD_REQUIRED_SCOPES length = 2', LGPD_REQUIRED_SCOPES.length === 2);
const consent = buildLgpdConsentRequest(
  'usr_buyer000000000000000000000000000000' as UserId,
  true,
  true,
);
check('buildLgpdConsentRequest: all scopes false initially',
  !consent.scopes.personal_data && !consent.scopes.payment_data);
check('validateLgpdConsent(null) fails', !validateLgpdConsent(null).ok);

const goodConsent = Object.freeze({
  ...consent,
  scopes: Object.freeze({ ...consent.scopes, personal_data: true, payment_data: true }),
});
check('validateLgpdConsent with required scopes ok', validateLgpdConsent(goodConsent).ok);

const m = makeConsentMap({ personal_data: true, payment_data: true });
check('makeConsentMap respects true values',
  m.personal_data === true && m.payment_data === true && m.sacred_preference === false);

// ─────────────────────────────────────────────────────────────────────────
// Section 6 — Order lifecycle
// ─────────────────────────────────────────────────────────────────────────

resetOrderStoreForTests();
const cat = buildSampleCatalog('usr_seller00000000000000000000000' as UserId);
const listing = cat[0] as ServiceListing;
const draft = createOrderDraft({
  listing,
  slotId: cal14[0]?.slotId ?? ('slt_x_20260701_0900' as SlotId),
  buyerId: 'usr_buyer000000000000000000000000000000' as UserId,
});
check('createOrderDraft: status=DRAFT', draft.status === 'DRAFT');
const held = holdOrderEscrow({ orderId: draft.orderId, amountCents: priceBasic.finalCents });
check('holdOrderEscrow: status=HELD, escrowId present', held.status === 'HELD' && held.escrowId !== null);
const confirmed = confirmOrder({
  orderId: held.orderId,
  paymentMethod: 'PIX',
  consentVersion: LGPD_POLICY_VERSION,
});
check('confirmOrder PIX: status=CONFIRMED + paymentMethod', confirmed.status === 'CONFIRMED' && confirmed.paymentMethod === 'PIX');
const completed = completeOrder(confirmed.orderId);
check('completeOrder: status=COMPLETED', completed.status === 'COMPLETED');

// Try a different path: DRAFT → cancel
const draft2 = createOrderDraft({
  listing,
  slotId: cal14[1]?.slotId ?? ('slt_y_20260701_1100' as SlotId),
  buyerId: 'usr_buyer000000000000000000000000000000' as UserId,
});
const cancelled = cancelOrder(draft2.orderId, 'USER_CANCELLED');
check('cancelOrder: status=CANCELLED + USER_CANCELLED reason',
  cancelled.status === 'CANCELLED' && cancelled.failureReason === 'USER_CANCELLED');

// Try a refund path
const draft3 = createOrderDraft({
  listing,
  slotId: cal14[2]?.slotId ?? ('slt_z_20260701_1400' as SlotId),
  buyerId: 'usr_buyer000000000000000000000000000000' as UserId,
});
const held3 = holdOrderEscrow({ orderId: draft3.orderId, amountCents: priceBasic.finalCents });
const conf3 = confirmOrder({
  orderId: held3.orderId,
  paymentMethod: 'CREDIT_CARD',
  consentVersion: LGPD_POLICY_VERSION,
});
const ref3 = refundOrder(conf3.orderId, 'CHARGEBACK');
check('refundOrder: status=REFUNDED', ref3.status === 'REFUNDED');

// ─────────────────────────────────────────────────────────────────────────
// Section 7 — Checkout state machine
// ─────────────────────────────────────────────────────────────────────────

const listing2 = cat[1] as ServiceListing;
let s: ReturnType<typeof initialCheckoutState> = initialCheckoutState();
check('initialCheckoutState step=PICK_SERVICE', s.step === 'PICK_SERVICE');
s = advanceCheckout(s, { type: 'SELECT_LISTING', listingId: listing2.listingId });
check('SELECT_LISTING \u2192 PICK_SLOT', s.step === 'PICK_SLOT');
s = advanceCheckout(s, { type: 'SELECT_SLOT', slotId: cal14[3]?.slotId ?? ('slt_w_20260701_1600' as SlotId) });
check('SELECT_SLOT \u2192 REVIEW', s.step === 'REVIEW');
s = advanceCheckout(s, { type: 'GO_TO_CONSENT' });
check('GO_TO_CONSENT \u2192 CONSENT, consent initialized', s.step === 'CONSENT' && s.consent !== null);
s = advanceCheckout(s, {
  type: 'SET_CONSENT',
  consent: makeConsentMap({ personal_data: true, payment_data: true }),
});
check('SET_CONSENT stashes map without advancing',
  s.step === 'CONSENT' && s.consent?.personal_data === true);
check('canCheckout after required consent = true', canCheckout(s));
s = advanceCheckout(s, { type: 'SUBMIT_CONSENT', consent: s.consent! });
check('SUBMIT_CONSENT \u2192 PAYMENT', s.step === 'PAYMENT');
s = advanceCheckout(s, { type: 'SELECT_PAYMENT', paymentMethod: 'PIX' });
check('SELECT_PAYMENT \u2192 CONFIRMED + method', s.step === 'CONFIRMED' && s.paymentMethod === 'PIX');
s = advanceCheckout(s, { type: 'RESET' });
check('RESET \u2192 PICK_SERVICE', s.step === 'PICK_SERVICE');

// ─────────────────────────────────────────────────────────────────────────
// Section 8 — Audit
// ─────────────────────────────────────────────────────────────────────────

const r = auditMarketplaceBooking(cat);
check('auditMarketplaceBooking.totalListings = 32', r.totalListings === 32);
check('auditMarketplaceBooking.isFullCoverage = true', r.isFullCoverage === true);
check('auditMarketplaceBooking.totalSlotsGenerated = 70', r.totalSlotsGenerated === 70);
for (const t of ['CIGANO', 'ORIXAS', 'CHAKRAS', 'SEFIROT', 'HOUSES'] as const) {
  check(`sacredCoverage.${t} >= floor`,
    r.sacredCoverage[t] >= SACRED_AUDIT_FLOOR[t]);
}

// ─────────────────────────────────────────────────────────────────────────
// Section 9 — Constants + catalog + version
// ─────────────────────────────────────────────────────────────────────────

check('OFFERING_CATEGORIES length = 7', OFFERING_CATEGORIES.length === 7);
check('SERVICE_TYPES length = 8', SERVICE_TYPES.length === 8);
check('TIERS length = 4', TIERS.length === 4);
check('ALL_SACRED_TAGS length > 50', ALL_SACRED_TAGS.length > 50);
check('buildSampleCatalog length = 32', cat.length === 32);
check('W81_C_VERSION = 1.0.0', W81_C_VERSION === '1.0.0');

// ─────────────────────────────────────────────────────────────────────────
// Section 10 — Formatters sanity
// ─────────────────────────────────────────────────────────────────────────

check('formatBRL(0) = R$ 0,00', formatBRL(0) === 'R$ 0,00');
check('formatBRL(99) = R$ 0,99', formatBRL(99) === 'R$ 0,99');
check('formatBRL(11000) = R$ 110,00', formatBRL(11000) === 'R$ 110,00');
check('formatBRL(1100000) = R$ 11.000,00', formatBRL(1100000) === 'R$ 11.000,00');

// ─────────────────────────────────────────────────────────────────────────
// Exit
// ─────────────────────────────────────────────────────────────────────────

console.log('');
console.log(`  SMOKE RESULT: ${passes} PASS · ${fails} FAIL · ${passes + fails} total`);

if (fails > 0) {
  process.exit(1);
}
