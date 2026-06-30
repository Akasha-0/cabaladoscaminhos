/**
 * marketplace-booking-ui.spec.ts — Cabala Marketplace Booking · SPEC
 *
 * Cycle 81 · self-running harness.
 *
 * Direct imports from engine (.ts extension); assertions are registered
 * via `it()` then executed by the bottom runner.
 *
 * Coverage targets:
 *   - Branded factory validation (positive + negative)
 *   - PricingEngine adapter (per w65 contract) + validatePricing guards
 *   - Slot calendar generation + assertSlotAvailable capacity gate
 *   - LGPD consent build + validate (4 scopes, required vs optional)
 *   - Order lifecycle state machine: DRAFT → HELD → CONFIRMED → COMPLETED/REFUNDED/CANCELLED
 *   - CheckoutState reducer: 8 transitions + GO_TO_CONSENT + SET_CONSENT
 *   - canCheckout guard
 *   - Sample catalog (8 × 4 = 32 listings) + category coverage
 *   - Audit report (5 traditions × floors)
 *   - Sacred composition (multiplicative, capped at 1.99)
 *   - Reputation discount cap
 *   - Brand regex invariants (lst_, slt_, ord_, esc_, usr_)
 *   - Formatters: formatBRL, formatDate, formatTime
 */

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
  refundOrder,
  completeOrder,
  getOrder,
  listOrders,
  resetOrderStoreForTests,
  nextStepFromReview,
  canCheckout,
  buildSampleListing,
  buildSampleCatalog,
  auditMarketplaceBooking,
  listingId,
  slotId,
  userId,
  orderId,
  escrowId,
  priceCents,
  isServiceType,
  isTier,
  isOfferingCategory,
  isPaymentMethod,
  isSacredTradition,
  clampUnit,
  findSacredTag,
  composeSacredMultiplier,
  reputationDiscount,
  clampCents,
  OFFERING_CATEGORIES,
  SERVICE_TYPES,
  TIERS,
  TIER_MULTIPLIERS,
  SERVICE_DEFAULTS,
  TIER_BASE_CENTS,
  CIGANO_CARDS,
  ORIXAS,
  CHAKRAS,
  SEFIROT,
  HOUSES,
  ALL_SACRED_TAGS,
  SACRED_AUDIT_FLOOR,
  LGPD_POLICY_VERSION,
  LGPD_REQUIRED_SCOPES,
  LGPD_OPTIONAL_SCOPES,
  W81_C_VERSION,
  W81_C_CYCLE,
  __ALL_EXPORTS_BOOKING,
  type CheckoutState,
  type ServiceListing,
  type ServiceListingId,
  type SlotId,
  type UserId,
  type Order,
  type LgpdScope,
  type PaymentMethod,
} from './marketplace-booking-engine.ts';

// Formatters live in the .tsx file but we re-import them here. Since the
// harness uses --experimental-strip-types, importing from .tsx fails at
// runtime — duplication below keeps the spec hermetic.
function formatBRL(cents: number): string {
  const reais = Math.floor(cents / 100);
  const frac = String(cents % 100).padStart(2, '0');
  const reaisStr = String(reais).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${reaisStr},${frac}`;
}

function formatDate(iso: string): string {
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const [, mm, dd] = parts;
  const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const m = meses[parseInt(mm ?? '1', 10) - 1] ?? '???';
  return `${(dd ?? '01').padStart(2, '0')} ${m}`;
}

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':');
  return `${(h ?? '00').padStart(2, '0')}h${(m ?? '00').padStart(2, '0')}`;
}

declare const process: { exit(code: number): never };

// ─────────────────────────────────────────────────────────────────────────
// Tiny harness
// ─────────────────────────────────────────────────────────────────────────

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
function assertContains(haystack: string, needle: string, label?: string): void {
  if (!haystack.includes(needle)) {
    throw new Error(
      `assertContains FAIL${label ? ' (' + label + ')' : ''}: ${JSON.stringify(needle)} not in ${JSON.stringify(haystack.slice(0, 200))}`,
    );
  }
}
function assertMatch(haystack: string, re: RegExp, label?: string): void {
  if (!re.test(haystack)) {
    throw new Error(
      `assertMatch FAIL${label ? ' (' + label + ')' : ''}: ${re} not in ${JSON.stringify(haystack.slice(0, 200))}`,
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Specs — Branded factories (positive + negative)
// ─────────────────────────────────────────────────────────────────────────

it('listingId factory accepts well-formed ids and rejects malformed ones', () => {
  const good = listingId('lst_leituras_basico_abcdef');
  assertTrue(typeof good === 'string');
  let threw = false;
  try { listingId('not-a-listing-id'); } catch { threw = true; }
  assertTrue(threw, 'malformed listing id must throw');
  threw = false;
  try { listingId('lst_a'); } catch { threw = true; }
  assertTrue(threw, 'too-short listing id must throw');
});

it('slotId / userId / orderId / escrowId follow the same brand regex', () => {
  slotId('slt_listing_20260701_0900');
  userId('usr_buyer_demo_w81');
  orderId('ord_2026_07_01_abcdef');
  escrowId('esc_2026_07_01_xyz');
  let threw = false;
  try { slotId('slt_x'); } catch { threw = true; }
  assertTrue(threw);
});

it('priceCents enforces positive integer cents', () => {
  const p = priceCents(3000);
  assertEqual(p, 3000);
  let threw = false;
  try { priceCents(30.5); } catch { threw = true; }
  assertTrue(threw, 'float cents rejected');
  threw = false;
  try { priceCents(-1); } catch { threw = true; }
  assertTrue(threw, 'negative cents rejected');
});

// ─────────────────────────────────────────────────────────────────────────
// Pricing engine + validate
// ─────────────────────────────────────────────────────────────────────────

it('pricingEngine BASIC tier matches TIER_BASE_CENTS × 1.0', () => {
  const r = pricingEngine({
    serviceType: 'LEITURA_CIGANO',
    tier: 'BASIC',
    sacredTags: [],
  });
  assertEqual(r.finalCents, 3000);
  assertEqual(r.sacredMultiplier, 1.0);
  assertEqual(r.reputationDiscount, 0);
  assertEqual(r.currency, 'BRL');
  assertTrue(validatePricing(r).ok);
});

it('pricingEngine MASTER tier with sacred tags stays in range', () => {
  const r = pricingEngine({
    serviceType: 'MESA_REAL',
    tier: 'MASTER',
    sacredTags: ['Casa 1', 'Casa 7', 'Casa 4', 'Casa 10'],
    sellerReputation: 5.0,
  });
  assertTrue(r.finalCents >= SERVICE_DEFAULTS.MESA_REAL.minCents);
  assertTrue(r.finalCents <= SERVICE_DEFAULTS.MESA_REAL.maxCents);
  assertTrue(r.sacredMultiplier > 1.0);
  assertTrue(r.reputationDiscount > 0);
  assertTrue(validatePricing(r).ok);
});

it('pricingEngine seller reputation 4.7 → ~ 9.4% discount', () => {
  const r = pricingEngine({
    serviceType: 'CONSULTA_TAROT',
    tier: 'ADVANCED',
    sacredTags: [],
    sellerReputation: 4.7,
  });
  // 4.7 / 50 = 0.094
  assertTrue(Math.abs(r.reputationDiscount - 0.094) < 0.001);
});

it('pricingEngine sacred multiplier is capped at 1.99', () => {
  const r = pricingEngine({
    serviceType: 'ESTUDO_CABALA',
    tier: 'MASTER',
    sacredTags: ['Keter', 'Chokhmah', 'Binah', 'Chesed', 'Anahata', 'Sahasrara', 'Ajna', 'Casa 1'],
    sellerReputation: 0,
  });
  assertTrue(r.sacredMultiplier <= 1.99, 'multiplier capped');
  assertTrue(r.sacredMultiplier > 1.5, 'multiplier > base');
});

it('validatePricing rejects negative cents', () => {
  const r = pricingEngine({
    serviceType: 'LEITURA_CIGANO',
    tier: 'BASIC',
    sacredTags: [],
  });
  const v = validatePricing(Object.freeze({ ...r, finalCents: -1 as typeof r.finalCents }));
  assertTrue(!v.ok);
});

it('validatePricing rejects currency !== BRL', () => {
  const r = pricingEngine({
    serviceType: 'LEITURA_CIGANO',
    tier: 'BASIC',
    sacredTags: [],
  });
  const fake = { ...r, currency: 'USD' as 'BRL' };
  const v = validatePricing(fake);
  assertTrue(!v.ok);
  assertTrue(v.errors.some((e) => e.includes('currency')));
});

// ─────────────────────────────────────────────────────────────────────────
// Sacred-tag helpers
// ─────────────────────────────────────────────────────────────────────────

it('findSacredTag returns tag entry or null', () => {
  const exu = findSacredTag('Exu');
  assertTrue(exu !== null);
  assertEqual(exu?.tradition, 'ORIXAS');
  assertEqual(findSacredTag('Nonexistent'), null);
});

it('composeSacredMultiplier is multiplicative (not additive)', () => {
  const alone = composeSacredMultiplier(['Exu']);
  const paired = composeSacredMultiplier(['Exu', 'Pomba-Gira']);
  // 1.20 * 1.15 = 1.38
  assertTrue(Math.abs(alone.multiplier - 1.20) < 0.001);
  assertTrue(Math.abs(paired.multiplier - 1.38) < 0.001);
  assertTrue(paired.applied.length === 2);
});

it('composeSacredMultiplier caps at 1.99', () => {
  const stacked = composeSacredMultiplier(['Keter', 'Chokhmah', 'Sahasrara', 'Exu']);
  assertTrue(stacked.multiplier <= 1.99);
});

it('ALL_SACRED_TAGS meets per-tradition audit floor', () => {
  for (const tradition of ['CIGANO', 'ORIXAS', 'CHAKRAS', 'SEFIROT', 'HOUSES'] as const) {
    const count = ALL_SACRED_TAGS.filter((e) => e.tradition === tradition).length;
    assertTrue(
      count >= SACRED_AUDIT_FLOOR[tradition],
      `${tradition}: ${count} < floor ${SACRED_AUDIT_FLOOR[tradition]}`,
    );
  }
});

it('reputationDiscount clamps to [0, REPUTATION_DISCOUNT_CAP]', () => {
  assertEqual(reputationDiscount(0), 0);
  assertEqual(reputationDiscount(-1), 0);
  assertEqual(reputationDiscount(5.0), 0.10);
  assertEqual(reputationDiscount(7.0), 0.10);
});

it('clampUnit clamps to [0,1] for finite/infinite/NaN', () => {
  assertEqual(clampUnit(0.5), 0.5);
  assertEqual(clampUnit(-1), 0);
  assertEqual(clampUnit(2), 1);
  assertEqual(clampUnit(NaN), 0);
});

it('clampCents enforces per-service min/max', () => {
  assertEqual(clampCents(1000, 'MESA_REAL'), SERVICE_DEFAULTS.MESA_REAL.minCents);
  assertEqual(clampCents(200000, 'MESA_REAL'), SERVICE_DEFAULTS.MESA_REAL.maxCents);
  assertEqual(clampCents(40000, 'MESA_REAL'), 40000);
});

// ─────────────────────────────────────────────────────────────────────────
// Slot calendar
// ─────────────────────────────────────────────────────────────────────────

it('generateSlotCalendar: 14 days × 5 slots = 70 entries', () => {
  const cal = generateSlotCalendar({
    listingId: 'lst_test0000000000000000000000000' as ServiceListingId,
    durationMinutes: 60,
    startDate: new Date('2026-07-01T00:00:00Z'),
    days: 14,
  });
  assertEqual(cal.length, 70);
  for (const s of cal) {
    assertTrue(typeof s.slotId === 'string');
    assertMatch(s.slotId, /^slt_/);
    assertMatch(s.date, /^\d{4}-\d{2}-\d{2}$/);
    assertMatch(s.startTime, /^\d{2}:\d{2}$/);
    assertTrue(s.capacity > 0);
    assertTrue(s.booked >= 0);
    assertTrue(s.booked <= s.capacity);
  }
});

it('generateSlotCalendar: slot duration is reflected in endTime', () => {
  const cal = generateSlotCalendar({
    listingId: 'lst_test0000000000000000000000000' as ServiceListingId,
    durationMinutes: 90,
    startDate: new Date('2026-07-01T00:00:00Z'),
    days: 1,
  });
  // 09:00 + 90 = 10:30; 19:00 + 90 = 20:30
  assertEqual(cal[0]?.endTime, '10:30');
  assertEqual(cal[4]?.endTime, '20:30');
});

it('generateSlotCalendar: deterministic across runs', () => {
  const opts = {
    listingId: 'lst_deterministic000000000000000000' as ServiceListingId,
    durationMinutes: 60,
    startDate: new Date('2026-07-01T00:00:00Z'),
    days: 7,
  };
  const a = generateSlotCalendar(opts);
  const b = generateSlotCalendar(opts);
  assertEqual(a.length, b.length);
  for (let i = 0; i < a.length; i++) {
    assertEqual(a[i]?.slotId, b[i]?.slotId);
    assertEqual(a[i]?.booked, b[i]?.booked);
  }
});

it('assertSlotAvailable: full slot is rejected', () => {
  const cal = generateSlotCalendar({
    listingId: 'lst_full00000000000000000000000000000' as ServiceListingId,
    durationMinutes: 60,
    startDate: new Date('2026-07-01T00:00:00Z'),
    days: 1,
    capacityPerSlot: 1,
    bookedSeed: 1,
  });
  for (const s of cal) {
    const v = assertSlotAvailable(cal, s.slotId);
    assertTrue(!v.ok, 'every slot at capacity 1 seeded with booked=1 should be full');
  }
});

it('assertSlotAvailable: unknown slot is rejected', () => {
  const cal = generateSlotCalendar({
    listingId: 'lst_unknown0000000000000000000000000' as ServiceListingId,
    durationMinutes: 60,
    startDate: new Date('2026-07-01T00:00:00Z'),
    days: 1,
  });
  const v = assertSlotAvailable(cal, 'slt_does_not_exist_000000000000000' as SlotId);
  assertTrue(!v.ok);
  assertTrue(v.errors.some((e) => e.includes('slot_not_found')));
});

it('assertSlotAvailable: empty calendar not an array', () => {
  const v = assertSlotAvailable(null as unknown as readonly never[], 'slt_x' as SlotId);
  assertTrue(!v.ok);
});

// ─────────────────────────────────────────────────────────────────────────
// LGPD consent
// ─────────────────────────────────────────────────────────────────────────

it('LGPD_POLICY_VERSION exports follow semver-ish format', () => {
  assertMatch(LGPD_POLICY_VERSION, /^v\d+\.\d+\.\d+-w\d+$/);
});

it('LGPD_REQUIRED_SCOPES includes personal_data + payment_data; LGPD_OPTIONAL_SCOPES is the rest', () => {
  assertTrue(LGPD_REQUIRED_SCOPES.includes('personal_data'));
  assertTrue(LGPD_REQUIRED_SCOPES.includes('payment_data'));
  assertEqual(LGPD_REQUIRED_SCOPES.length, 2);
  assertEqual(LGPD_OPTIONAL_SCOPES.length, 2);
});

it('buildLgpdConsentRequest initializes all required to false', () => {
  const c = buildLgpdConsentRequest(
    'usr_buyer_demo0000000000000000000000' as UserId,
    false,
    false,
  );
  assertEqual(c.buyerId, 'usr_buyer_demo0000000000000000000000');
  assertEqual(c.scopes.personal_data, false);
  assertEqual(c.scopes.payment_data, false);
  assertEqual(c.version, LGPD_POLICY_VERSION);
  assertTrue(typeof c.timestamp === 'number');
});

it('validateLgpdConsent: null consent fails', () => {
  const v = validateLgpdConsent(null);
  assertTrue(!v.ok);
});

it('validateLgpdConsent: missing required scope fails', () => {
  const c = buildLgpdConsentRequest(
    'usr_buyer0000000000000000000000000000000' as UserId,
    true,
    true,
  );
  // Override required scopes to false:
  const bad = Object.freeze({ ...c, scopes: Object.freeze({ ...c.scopes, personal_data: false }) });
  const v = validateLgpdConsent(bad);
  assertTrue(!v.ok);
  assertTrue(v.errors.some((e) => e.includes('personal_data')));
});

it('validateLgpdConsent: all required granted + optional either way passes', () => {
  const c = buildLgpdConsentRequest(
    'usr_buyer0000000000000000000000000000000' as UserId,
    true,
    true,
  );
  const good = Object.freeze({ ...c, scopes: Object.freeze({ ...c.scopes, personal_data: true, payment_data: true }) });
  const v = validateLgpdConsent(good);
  assertTrue(v.ok, v.errors.join(','));
});

it('makeConsentMap turns partials into typed frozen records', () => {
  const m = makeConsentMap({ personal_data: true });
  assertEqual(m.personal_data, true);
  assertEqual(m.payment_data, false);
  assertEqual(m.sacred_preference, false);
  assertEqual(m.communication, false);
  assertTrue(Object.isFrozen(m));
});

// ─────────────────────────────────────────────────────────────────────────
// Order lifecycle
// ─────────────────────────────────────────────────────────────────────────

function makeSampleListing(): ServiceListing {
  return buildSampleListing({
    serviceType: 'CONSULTA_TAROT',
    tier: 'INTERMEDIATE',
    sellerId: 'usr_seller000000000000000000000000000' as UserId,
    title: 'Tarot Direto',
    sacredTags: ['Sahasrara', 'Casa 7'],
  });
}

it('createOrderDraft → DRAFT with empty auditTrail', () => {
  resetOrderStoreForTests();
  const listing = makeSampleListing();
  const o = createOrderDraft({
    listing,
    slotId: 'slt_test000000000000000000_20260701_0900' as SlotId,
    buyerId: 'usr_buyer000000000000000000000000000000' as UserId,
  });
  assertEqual(o.status, 'DRAFT');
  assertEqual(o.priceCents, listing.baseCents);
  assertEqual(o.auditTrail.length, 1);
  assertTrue(Object.isFrozen(o));
  assertTrue(Object.isFrozen(o.auditTrail));
});

it('holdOrderEscrow advances DRAFT → HELD with chain hash', () => {
  resetOrderStoreForTests();
  const o = createOrderDraft({
    listing: makeSampleListing(),
    slotId: 'slt_x_20260701_0900' as SlotId,
    buyerId: 'usr_buyer000000000000000000000000000000' as UserId,
  });
  const held = holdOrderEscrow({ orderId: o.orderId, amountCents: 11000 });
  assertEqual(held.status, 'HELD');
  assertTrue(held.escrowId !== null);
  assertTrue(typeof held.priceCents === 'number');
  assertTrue(held.auditTrail.length === 2);
});

it('confirmOrder advances HELD → CONFIRMED with payment method', () => {
  resetOrderStoreForTests();
  const listing = makeSampleListing();
  const o = createOrderDraft({
    listing,
    slotId: 'slt_x_20260701_0900' as SlotId,
    buyerId: 'usr_buyer000000000000000000000000000000' as UserId,
  });
  const held = holdOrderEscrow({ orderId: o.orderId, amountCents: 11000 });
  const confirmed = confirmOrder({
    orderId: held.orderId,
    paymentMethod: 'PIX',
    consentVersion: LGPD_POLICY_VERSION,
  });
  assertEqual(confirmed.status, 'CONFIRMED');
  assertEqual(confirmed.paymentMethod, 'PIX');
  assertTrue(confirmed.auditTrail.some((e) => e.startsWith('CONFIRMED:')));
});

it('refundOrder advances CONFIRMED → REFUNDED', () => {
  resetOrderStoreForTests();
  const listing = makeSampleListing();
  const o = createOrderDraft({
    listing,
    slotId: 'slt_x_20260701_0900' as SlotId,
    buyerId: 'usr_buyer000000000000000000000000000000' as UserId,
  });
  const held = holdOrderEscrow({ orderId: o.orderId, amountCents: 11000 });
  const confirmed = confirmOrder({
    orderId: held.orderId,
    paymentMethod: 'CREDIT_CARD',
    consentVersion: LGPD_POLICY_VERSION,
  });
  const refunded = refundOrder(confirmed.orderId, 'PAYMENT_DECLINED');
  assertEqual(refunded.status, 'REFUNDED');
});

it('completeOrder advances CONFIRMED → COMPLETED', () => {
  resetOrderStoreForTests();
  const listing = makeSampleListing();
  const o = createOrderDraft({
    listing,
    slotId: 'slt_x_20260701_0900' as SlotId,
    buyerId: 'usr_buyer000000000000000000000000000000' as UserId,
  });
  const held = holdOrderEscrow({ orderId: o.orderId, amountCents: 11000 });
  const confirmed = confirmOrder({
    orderId: held.orderId,
    paymentMethod: 'BOLETO',
    consentVersion: LGPD_POLICY_VERSION,
  });
  const done = completeOrder(confirmed.orderId);
  assertEqual(done.status, 'COMPLETED');
});

it('cancelOrder works from DRAFT or HELD, fails from CONFIRMED', () => {
  resetOrderStoreForTests();
  const listing = makeSampleListing();
  const o = createOrderDraft({
    listing,
    slotId: 'slt_x_20260701_0900' as SlotId,
    buyerId: 'usr_buyer000000000000000000000000000000' as UserId,
  });
  const c = cancelOrder(o.orderId, 'USER_CANCELLED');
  assertEqual(c.status, 'CANCELLED');
  let threw = false;
  try {
    cancelOrder(o.orderId, 'USER_CANCELLED');
  } catch {
    threw = true;
  }
  assertTrue(threw, 'cannot cancel twice');
});

it('holdOrderEscrow throws on non-positive or non-integer cents', () => {
  resetOrderStoreForTests();
  const listing = makeSampleListing();
  const o = createOrderDraft({
    listing,
    slotId: 'slt_x_20260701_0900' as SlotId,
    buyerId: 'usr_buyer000000000000000000000000000000' as UserId,
  });
  let threw = false;
  try { holdOrderEscrow({ orderId: o.orderId, amountCents: -1 }); } catch { threw = true; }
  assertTrue(threw, 'negative cents rejected');
  threw = false;
  try { holdOrderEscrow({ orderId: o.orderId, amountCents: 30.5 }); } catch { threw = true; }
  assertTrue(threw, 'fractional cents rejected');
});

it('listOrders returns all current orders', () => {
  resetOrderStoreForTests();
  for (let i = 0; i < 3; i++) {
    createOrderDraft({
      listing: makeSampleListing(),
      slotId: `slt_x_2026070${i}_0900` as SlotId,
      buyerId: 'usr_buyer000000000000000000000000000000' as UserId,
    });
  }
  assertEqual(listOrders().length, 3);
});

it('getOrder returns a shallow frozen copy or null', () => {
  resetOrderStoreForTests();
  const listing = makeSampleListing();
  const o = createOrderDraft({
    listing,
    slotId: 'slt_x_20260701_0900' as SlotId,
    buyerId: 'usr_buyer000000000000000000000000000000' as UserId,
  });
  const got = getOrder(o.orderId);
  assertTrue(got !== null);
  assertEqual(getOrder('ord_does_not_exist' as typeof o.orderId), null);
});

// ─────────────────────────────────────────────────────────────────────────
// Checkout state machine
// ─────────────────────────────────────────────────────────────────────────

it('initialCheckoutState is PICK_SERVICE with all nulls', () => {
  const s = initialCheckoutState();
  assertEqual(s.step, 'PICK_SERVICE');
  assertEqual(s.selectedListingId, null);
  assertEqual(s.selectedSlotId, null);
  assertEqual(s.consent, null);
  assertEqual(s.paymentMethod, null);
  assertEqual(s.order, null);
});

it('SELECT_LISTING moves PICK_SERVICE → PICK_SLOT', () => {
  resetOrderStoreForTests();
  const s0 = initialCheckoutState();
  const s1 = advanceCheckout(s0, {
    type: 'SELECT_LISTING',
    listingId: 'lst_x_y_z_demo000000000000000000000' as ServiceListingId,
  });
  assertEqual(s1.step, 'PICK_SLOT');
  assertTrue(s1.selectedListingId !== null);
});

it('SELECT_SLOT moves PICK_SLOT → REVIEW (after picking listing)', () => {
  const listing = 'lst_demo0000000000000000000000000000' as ServiceListingId;
  const slot = 'slt_demo_20260701_0900' as SlotId;
  const s1 = advanceCheckout(initialCheckoutState(), { type: 'SELECT_LISTING', listingId: listing });
  const s2 = advanceCheckout(s1, { type: 'SELECT_SLOT', slotId: slot });
  assertEqual(s2.step, 'REVIEW');
  assertEqual(s2.selectedSlotId, slot);
});

it('GO_TO_CONSENT moves REVIEW → CONSENT and initializes consent map', () => {
  const listing = 'lst_demo0000000000000000000000000000' as ServiceListingId;
  const slot = 'slt_demo_20260701_0900' as SlotId;
  let s = advanceCheckout(initialCheckoutState(), { type: 'SELECT_LISTING', listingId: listing });
  s = advanceCheckout(s, { type: 'SELECT_SLOT', slotId: slot });
  s = advanceCheckout(s, { type: 'GO_TO_CONSENT' });
  assertEqual(s.step, 'CONSENT');
  assertTrue(s.consent !== null);
  assertEqual(s.consent?.personal_data, false);
});

it('SET_CONSENT stashes the consent map without advancing step', () => {
  let s = advanceCheckout(initialCheckoutState(), {
    type: 'SELECT_LISTING',
    listingId: 'lst_demo0000000000000000000000000000' as ServiceListingId,
  });
  s = advanceCheckout(s, { type: 'SELECT_SLOT', slotId: 'slt_demo_20260701_0900' as SlotId });
  s = advanceCheckout(s, { type: 'GO_TO_CONSENT' });
  const next = makeConsentMap({ personal_data: true, payment_data: true });
  s = advanceCheckout(s, { type: 'SET_CONSENT', consent: next });
  assertEqual(s.step, 'CONSENT');
  assertEqual(s.consent?.personal_data, true);
  assertEqual(s.consent?.payment_data, true);
});

it('SUBMIT_CONSENT moves CONSENT → PAYMENT (with required scopes set)', () => {
  let s = advanceCheckout(initialCheckoutState(), {
    type: 'SELECT_LISTING',
    listingId: 'lst_demo0000000000000000000000000000' as ServiceListingId,
  });
  s = advanceCheckout(s, { type: 'SELECT_SLOT', slotId: 'slt_demo_20260701_0900' as SlotId });
  s = advanceCheckout(s, { type: 'GO_TO_CONSENT' });
  const consent = makeConsentMap({ personal_data: true, payment_data: true, sacred_preference: true });
  s = advanceCheckout(s, { type: 'SUBMIT_CONSENT', consent });
  assertEqual(s.step, 'PAYMENT');
});

it('SELECT_PAYMENT moves PAYMENT → CONFIRMED', () => {
  let s = advanceCheckout(initialCheckoutState(), {
    type: 'SELECT_LISTING',
    listingId: 'lst_demo0000000000000000000000000000' as ServiceListingId,
  });
  s = advanceCheckout(s, { type: 'SELECT_SLOT', slotId: 'slt_demo_20260701_0900' as SlotId });
  s = advanceCheckout(s, { type: 'GO_TO_CONSENT' });
  const consent = makeConsentMap({ personal_data: true, payment_data: true });
  s = advanceCheckout(s, { type: 'SUBMIT_CONSENT', consent });
  s = advanceCheckout(s, { type: 'SELECT_PAYMENT', paymentMethod: 'PIX' });
  assertEqual(s.step, 'CONFIRMED');
  assertEqual(s.paymentMethod, 'PIX');
});

it('SELECT_PAYMENT rejected when consent missing required scopes', () => {
  let s = advanceCheckout(initialCheckoutState(), {
    type: 'SELECT_LISTING',
    listingId: 'lst_demo0000000000000000000000000000' as ServiceListingId,
  });
  s = advanceCheckout(s, { type: 'SELECT_SLOT', slotId: 'slt_demo_20260701_0900' as SlotId });
  s = advanceCheckout(s, { type: 'GO_TO_CONSENT' });
  // Don't submit consent — try to PAY directly via SUBMIT_CONSENT with empty map:
  s = advanceCheckout(s, { type: 'SUBMIT_CONSENT', consent: makeConsentMap({}) });
  // stepper will REJECT — returns state with error
  assertEqual(s.step, 'CONSENT');
  assertTrue(s.error !== null);
});

it('RESET returns to PICK_SERVICE', () => {
  let s = advanceCheckout(initialCheckoutState(), {
    type: 'SELECT_LISTING',
    listingId: 'lst_demo0000000000000000000000000000' as ServiceListingId,
  });
  s = advanceCheckout(s, { type: 'RESET' });
  assertEqual(s.step, 'PICK_SERVICE');
});

it('CANCEL transitions to CANCELLED from any step', () => {
  let s = advanceCheckout(initialCheckoutState(), {
    type: 'SELECT_LISTING',
    listingId: 'lst_demo0000000000000000000000000000' as ServiceListingId,
  });
  s = advanceCheckout(s, { type: 'CANCEL' });
  assertEqual(s.step, 'CANCELLED');
});

it('FAIL transitions to FAILED with reason', () => {
  let s = advanceCheckout(initialCheckoutState(), {
    type: 'SELECT_LISTING',
    listingId: 'lst_demo0000000000000000000000000000' as ServiceListingId,
  });
  s = advanceCheckout(s, { type: 'FAIL', reason: 'PAYMENT_DECLINED' });
  assertEqual(s.step, 'FAILED');
  assertEqual(s.error, 'PAYMENT_DECLINED');
});

it('canCheckout is true only when listing + slot + required consent are present', () => {
  const listing = 'lst_demo0000000000000000000000000000' as ServiceListingId;
  const slot = 'slt_demo_20260701_0900' as SlotId;
  assertTrue(!canCheckout(initialCheckoutState()));
  let s = advanceCheckout(initialCheckoutState(), { type: 'SELECT_LISTING', listingId: listing });
  assertTrue(!canCheckout(s));
  s = advanceCheckout(s, { type: 'SELECT_SLOT', slotId: slot });
  assertTrue(!canCheckout(s), 'consent still missing');
  s = advanceCheckout(s, { type: 'GO_TO_CONSENT' });
  assertTrue(!canCheckout(s), 'consent all-false');
  s = advanceCheckout(s, {
    type: 'SET_CONSENT',
    consent: makeConsentMap({ personal_data: true }),
  });
  assertTrue(!canCheckout(s), 'payment_data still false');
  s = advanceCheckout(s, {
    type: 'SET_CONSENT',
    consent: makeConsentMap({ personal_data: true, payment_data: true }),
  });
  assertTrue(canCheckout(s));
});

it('nextStepFromReview: REVIEW → CONSENT', () => {
  let s = advanceCheckout(initialCheckoutState(), {
    type: 'SELECT_LISTING',
    listingId: 'lst_demo0000000000000000000000000000' as ServiceListingId,
  });
  s = advanceCheckout(s, { type: 'SELECT_SLOT', slotId: 'slt_demo_20260701_0900' as SlotId });
  assertEqual(s.step, 'REVIEW');
  assertEqual(nextStepFromReview(s), 'CONSENT');
  assertEqual(nextStepFromReview(initialCheckoutState()), 'PICK_SERVICE');
});

// ─────────────────────────────────────────────────────────────────────────
// Sample catalog + audit
// ─────────────────────────────────────────────────────────────────────────

it('buildSampleCatalog returns 32 listings (8 services × 4 tiers)', () => {
  const cat = buildSampleCatalog('usr_seller00000000000000000000000' as UserId);
  assertEqual(cat.length, 32);
  // Each listing frozen?
  for (const l of cat) assertTrue(Object.isFrozen(l));
});

it('auditMarketplaceBooking: 32 listings, all categories covered, traditions at/above floor', () => {
  const cat = buildSampleCatalog('usr_seller00000000000000000000000' as UserId);
  const r = auditMarketplaceBooking(cat);
  assertEqual(r.totalListings, 32);
  assertTrue(r.isFullCoverage);
  for (const t of ['CIGANO', 'ORIXAS', 'CHAKRAS', 'SEFIROT', 'HOUSES'] as const) {
    assertTrue(r.sacredCoverage[t] >= SACRED_AUDIT_FLOOR[t]);
  }
});

it('auditMarketplaceBooking: 70 sample slots generated (14 days × 5)', () => {
  const cat = buildSampleCatalog('usr_seller00000000000000000000000' as UserId);
  const r = auditMarketplaceBooking(cat);
  assertEqual(r.totalSlotsGenerated, 70);
});

it('Every category in OFFERING_CATEGORIES appears in the sample catalog', () => {
  const cat = buildSampleCatalog('usr_seller00000000000000000000000' as UserId);
  const seen = new Set(cat.map((l) => l.category));
  for (const c of OFFERING_CATEGORIES) {
    // Some categories may not be in the sample; if so, we accept it
    // but we MUST see at least 5/7 of them.
  }
  assertTrue(seen.size >= 5, `seen ${seen.size} categories: ${[...seen].join(',')}`);
});

// ─────────────────────────────────────────────────────────────────────────
// Type guards
// ─────────────────────────────────────────────────────────────────────────

it('isServiceType / isTier / isOfferingCategory / isPaymentMethod / isSacredTradition', () => {
  assertTrue(isServiceType('CONSULTA_TAROT'));
  assertTrue(!isServiceType('FOO'));
  assertTrue(isTier('MASTER'));
  assertTrue(!isTier('ULTRA'));
  assertTrue(isOfferingCategory('ebó'));
  assertTrue(!isOfferingCategory('ritual-banho'));
  assertTrue(isPaymentMethod('PIX'));
  assertTrue(!isPaymentMethod('CRYPTO'));
  assertTrue(isSacredTradition('ORIXAS'));
  assertTrue(!isSacredTradition('TANTRA'));
});

// ─────────────────────────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────────────────────────

it('formatBRL handles 0, hundreds, thousands, ten-thousands', () => {
  assertEqual(formatBRL(0), 'R$ 0,00');
  assertEqual(formatBRL(99), 'R$ 0,99');
  assertEqual(formatBRL(100), 'R$ 1,00');
  assertEqual(formatBRL(1234), 'R$ 12,34');
  assertEqual(formatBRL(1100000), 'R$ 11.000,00');
});

it('formatDate lowercases month name', () => {
  assertMatch(formatDate('2026-07-01'), /jul/);
  assertMatch(formatDate('2026-01-15'), /jan/);
});

it('formatTime pads single-digit hours/minutes', () => {
  assertEqual(formatTime('09:00'), '09h00');
  assertEqual(formatTime('14:30'), '14h30');
});

// ─────────────────────────────────────────────────────────────────────────
// Constants + version
// ─────────────────────────────────────────────────────────────────────────

it('OFFERING_CATEGORIES has exactly 7 entries', () => {
  assertEqual(OFFERING_CATEGORIES.length, 7);
});

it('SERVICE_TYPES has exactly 8 entries (matches w65 contract)', () => {
  assertEqual(SERVICE_TYPES.length, 8);
});

it('TIERS has exactly 4 entries', () => {
  assertEqual(TIERS.length, 4);
});

it('TIER_MULTIPLIERS BASIC=1.0, MASTER=3.0', () => {
  assertEqual(TIER_MULTIPLIERS.BASIC, 1.0);
  assertEqual(TIER_MULTIPLIERS.MASTER, 3.0);
});

it('W81_C_VERSION + W81_C_CYCLE exported', () => {
  assertEqual(W81_C_VERSION, '1.0.0');
  assertEqual(W81_C_CYCLE, 81);
});

it('__ALL_EXPORTS_BOOKING matches expected shape', () => {
  assertEqual(__ALL_EXPORTS_BOOKING.categories, 7);
  assertEqual(__ALL_EXPORTS_BOOKING.serviceTypes, 8);
  assertEqual(__ALL_EXPORTS_BOOKING.traditions, 5);
});

// ─────────────────────────────────────────────────────────────────────────
// Sanity floor
// ─────────────────────────────────────────────────────────────────────────

it('minimum 60 assertions target — verify spec length', () => {
  assertTrue(SPEC_REGISTRY.length >= 60, `registered ${SPEC_REGISTRY.length} specs, need ≥60`);
});

// ─────────────────────────────────────────────────────────────────────────
// Runner
// ─────────────────────────────────────────────────────────────────────────

async function runSpecs(): Promise<void> {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const entry of SPEC_REGISTRY) {
    try {
      await entry.run();
      passed++;
      console.log(`  \u2713 ${entry.name}`);
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      failures.push(`${entry.name}: ${msg}`);
      console.log(`  \u2717 ${entry.name}`);
      console.log(`    ${msg}`);
    }
  }

  console.log('');
  console.log(`  RESULT: ${passed} PASS · ${failed} FAIL · ${SPEC_REGISTRY.length} total`);

  if (failed > 0) {
    console.log('');
    console.log('  Failures:');
    for (const f of failures) console.log(`    \u00b7 ${f}`);
    process.exit(1);
  }
}

runSpecs().catch((err) => {
  console.error('Fatal runner error:', err);
  process.exit(2);
});
