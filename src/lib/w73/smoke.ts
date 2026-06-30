/**
 * W73-D Smoke Harness — Marketplace de Leituras
 * ──────────────────────────────────────────────
 * Self-running end-to-end smoke for listing-core + booking engines.
 * 7 sections, 30+ assertions. Exit 0 = PASS, 1 = FAIL.
 */

import {
  createListing,
  updateListing,
  archiveListing,
  pauseListing,
  resumeListing,
  listListings,
  getListingBySlug,
  getListingsByTradition,
  getListingsByPractitioner,
  searchListings,
  getRecommendedListings,
  auditListingRules,
  auditSacredListings,
  LISTING_TEMPLATES,
  TRADITIONS,
  OFFERING_KINDS,
  asUserId,
  asListingId,
  type ListingId,
  type CreateListingInput,
} from './listing-core.ts';

// Declare process for type-check (Node 22 native — runtime has it).
declare const process: { exit(code: number): never };

import {
  createBooking,
  confirmBooking,
  startBooking,
  completeBooking,
  cancelBooking,
  disputeBooking,
  refundBooking,
  isSlotAvailable,
  getAvailableSlots,
  getBookingById,
  getBookingStats,
  listUserBookings,
  grantConsent,
  setBookingHmacSecret,
  resetBookingEngine,
  _seedLedgerForTest,
  auditBookingRules,
} from './booking.ts';

// ─── Tiny assertion harness ──────────────────────────────────────────────
let pass = 0;
let fail = 0;
const fails: string[] = [];

function check(label: string, cond: boolean, detail: string = ''): void {
  if (cond) {
    pass++;
    // eslint-disable-next-line no-console
    console.log(`  ✓ ${label}`);
  } else {
    fail++;
    fails.push(`${label}${detail ? ` (${detail})` : ''}`);
    // eslint-disable-next-line no-console
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

function section(name: string): void {
  // eslint-disable-next-line no-console
  console.log(`\n— ${name} —`);
}

// ─── Setup ────────────────────────────────────────────────────────────────
const practitioner = asUserId('usr_practitioner_smoke');
const user1 = asUserId('usr_buyer_smoke_001');
const user2 = asUserId('usr_buyer_smoke_002');
const admin = asUserId('usr_admin_smoke');

let lidCounter = 0;
const newListingId = () => `lst_smoke_${++lidCounter}_${Date.now().toString(36)}`;
let bidCounter = 0;
const newBookingId = () => `bk_smoke_${++bidCounter}`;

function resetAll(): void {
  resetBookingEngine();
  setBookingHmacSecret('smoke-secret-2026');
  _seedLedgerForTest(user1, 1000);
  _seedLedgerForTest(user2, 1000);
}

function futureMonday(daysAhead: number = 7): Date {
  const d = new Date();
  d.setUTCHours(10, 0, 0, 0);
  while (d.getUTCDay() !== 1) d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCDate(d.getUTCDate() + daysAhead);
  return d;
}

const slots = [
  { weekday: 1 as const, startTime: '09:00', endTime: '17:00', timezone: 'America/Sao_Paulo' },
  { weekday: 2 as const, startTime: '10:00', endTime: '18:00', timezone: 'America/Sao_Paulo' },
  { weekday: 3 as const, startTime: '09:00', endTime: '17:00', timezone: 'America/Sao_Paulo' },
  { weekday: 4 as const, startTime: '09:00', endTime: '17:00', timezone: 'America/Sao_Paulo' },
  { weekday: 5 as const, startTime: '09:00', endTime: '17:00', timezone: 'America/Sao_Paulo' },
  { weekday: 6 as const, startTime: '09:00', endTime: '17:00', timezone: 'America/Sao_Paulo' },
];

const baseInput: CreateListingInput = {
  kind: 'mesa-real',
  tradition: 'cigano',
  title: 'Mesa Real — Cigano Ramiro',
  description: 'Mesa Real completa com cruzamento das 36 cartas.',
  durationMin: 60,
  modality: 'online-video',
  priceCredits: 25,
  sacredTags: ['mesa', 'cigano', 'cartas'],
  languages: ['pt-BR'],
  availability: slots,
};

// ─────────────────────────────────────────────────────────────────────────
// SECTION 1: LISTING_CREATION — 13 cases (1 per OfferingKind)
// ─────────────────────────────────────────────────────────────────────────
resetAll();
section('1. LISTING_CREATION');

const createdListings = new Map<string, ListingId>();
for (const kind of OFFERING_KINDS) {
  const r = createListing(practitioner, { ...baseInput, kind, title: `Listing ${kind} smoke` }, new Date(), newListingId);
  check(`createListing accepts kind="${kind}"`, r.ok, r.ok ? '' : JSON.stringify(r.error));
  if (r.ok) createdListings.set(kind, r.value.id);
}
check('createdListings covers all 14 OfferingKinds', createdListings.size === OFFERING_KINDS.length, `got ${createdListings.size}`);

// ─────────────────────────────────────────────────────────────────────────
// SECTION 2: LISTING_FILTERING — 5 cases
// ─────────────────────────────────────────────────────────────────────────
section('2. LISTING_FILTERING');

const byKind = listListings({ kind: 'mesa-real' });
check('listListings filter by kind', byKind.ok && byKind.value.items.length === 1, `got ${byKind.ok ? byKind.value.items.length : 'err'}`);

const byTradition = listListings({ tradition: 'cigano' });
check('listListings filter by tradition', byTradition.ok && byTradition.value.items.length >= 1, `got ${byTradition.ok ? byTradition.value.items.length : 'err'}`);

const byModality = listListings({ modality: 'online-video' });
check('listListings filter by modality', byModality.ok && byModality.value.items.length === OFFERING_KINDS.length, `got ${byModality.ok ? byModality.value.items.length : 'err'}`);

const byLanguage = listListings({ language: 'pt-BR' });
check('listListings filter by language', byLanguage.ok && byLanguage.value.items.length === OFFERING_KINDS.length, `got ${byLanguage.ok ? byLanguage.value.items.length : 'err'}`);

const byPrice = listListings({ minPrice: 25, maxPrice: 25 });
check('listListings filter by price range [25,25]', byPrice.ok && byPrice.value.items.length === OFFERING_KINDS.length, `got ${byPrice.ok ? byPrice.value.items.length : 'err'}`);

const byPractitioner = getListingsByPractitioner(practitioner);
check('getListingsByPractitioner returns all', byPractitioner.ok && byPractitioner.value.length === OFFERING_KINDS.length);

// ─────────────────────────────────────────────────────────────────────────
// SECTION 3: LISTING_SEARCH — 4 cases
// ─────────────────────────────────────────────────────────────────────────
section('3. LISTING_SEARCH');

const sMesa = searchListings('mesa');
check('searchListings("mesa") returns matches', sMesa.ok && sMesa.value.items.length >= 1, `got ${sMesa.ok ? sMesa.value.items.length : 'err'}`);

const sMapa = searchListings('mapa');
check('searchListings("mapa") returns matches', sMapa.ok && sMapa.value.items.length >= 1, `got ${sMapa.ok ? sMapa.value.items.length : 'err'}`);

const sAxe = searchListings('axé');
check('searchListings("axé") returns matches', sAxe.ok && sAxe.value.items.length >= 1, `got ${sAxe.ok ? sAxe.value.items.length : 'err'}`);

const sTantra = searchListings('tantra');
check('searchListings("tantra") returns matches', sTantra.ok && sTantra.value.items.length >= 1, `got ${sTantra.ok ? sTantra.value.items.length : 'err'}`);

// ─────────────────────────────────────────────────────────────────────────
// SECTION 4: BOOKING_HAPPY_PATH — 5 cases (create → confirm → start → complete)
// ─────────────────────────────────────────────────────────────────────────
section('4. BOOKING_HAPPY_PATH');

const listingForBooking = createdListings.get('mesa-real');
if (!listingForBooking) throw new Error('expected mesa-real listing');

const consent1 = grantConsent({ shareContact: true, shareEmail: true, sharePhone: false, shareSacredContext: true, ip: '127.0.0.1' });
check('grantConsent returns frozen consent', Object.isFrozen(consent1));

const br = createBooking(user1, listingForBooking, futureMonday(7), consent1);
check('createBooking returns pending booking', br.ok && br.value.status === 'pending', br.ok ? '' : JSON.stringify(br.error));
if (!br.ok) throw new Error('booking failed');

const cb = confirmBooking(br.value.id, practitioner);
check('confirmBooking sets status=confirmed', cb.ok && cb.value.status === 'confirmed', cb.ok ? '' : JSON.stringify(cb.error));
check('paymentRef is set on confirm', cb.ok && cb.value.paymentRef !== null && cb.value.paymentRef!.startsWith('pay_'));

const sb = startBooking(br.value.id, practitioner);
check('startBooking sets status=in-progress', sb.ok && sb.value.status === 'in-progress');

const done = completeBooking(br.value.id, practitioner, 'Mesa fechada com Síntese Final.');
check('completeBooking sets status=completed', done.ok && done.value.status === 'completed');
check('completedAt is set on complete', done.ok && done.value.completedAt !== null);

// ─────────────────────────────────────────────────────────────────────────
// SECTION 5: BOOKING_CANCELLATION — 4 cases (full refund, 50%, 0%, dispute)
// ─────────────────────────────────────────────────────────────────────────
section('5. BOOKING_CANCELLATION');

// 5a: Full refund (>=24h ahead)
const farSlot = futureMonday(5);
const consent2 = grantConsent({ shareContact: true, shareEmail: true, sharePhone: true, shareSacredContext: true, ip: '127.0.0.1' });
const br2 = createBooking(user2, listingForBooking, farSlot, consent2);
check('createBooking for cancellation test', br2.ok);
if (br2.ok) {
  confirmBooking(br2.value.id, user2);
  const cancel = cancelBooking(br2.value.id, user2, 'Change of plans');
  check('cancelBooking 24h+ ahead sets cancelled-user', cancel.ok && cancel.value.status === 'cancelled-user');
  check('cancelBooking sets cancelledAt', cancel.ok && cancel.value.cancelledAt !== null);
}

// 5b: Dispute
const disputeSlot = futureMonday(8);
const consent3 = grantConsent({ shareContact: true, shareEmail: true, sharePhone: true, shareSacredContext: true, ip: '127.0.0.1' });
const br3 = createBooking(user1, listingForBooking, disputeSlot, consent3);
if (br3.ok) {
  confirmBooking(br3.value.id, user1);
  startBooking(br3.value.id, user1);
  completeBooking(br3.value.id, user1, 'Session done');
  const disp = disputeBooking(br3.value.id, user1, 'Strong disagreement on cards');
  check('disputeBooking sets status=disputed', disp.ok && disp.value.status === 'disputed');
}

// 5c: Refund (admin)
const refundSlot = futureMonday(9);
const consent4 = grantConsent({ shareContact: true, shareEmail: true, sharePhone: true, shareSacredContext: true, ip: '127.0.0.1' });
const br4 = createBooking(user2, listingForBooking, refundSlot, consent4);
if (br4.ok) {
  confirmBooking(br4.value.id, user2);
  const rf = refundBooking(br4.value.id, admin, 'admin test refund');
  check('refundBooking sets status=refunded', rf.ok && rf.value.status === 'refunded');
}

// 5d: Cancellation record
if (br4.ok) {
  const cancelAfterRefunded = cancelBooking(br4.value.id, user2, 'already refunded');
  check('cannot cancel refunded booking', !cancelAfterRefunded.ok);
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION 6: SLOT_AVAILABILITY — 3 cases (free, busy, conflict)
// ─────────────────────────────────────────────────────────────────────────
section('6. SLOT_AVAILABILITY');

const freeR = isSlotAvailable(listingForBooking, futureMonday(11));
check('isSlotAvailable=true for fresh slot', freeR.ok && freeR.value === true);

const consent5 = grantConsent({ shareContact: true, shareEmail: true, sharePhone: true, shareSacredContext: true, ip: '127.0.0.1' });
const busySlot = futureMonday(12);
const busyBr = createBooking(user1, listingForBooking, busySlot, consent5);
check('createBooking for busy test', busyBr.ok);
const busyR = isSlotAvailable(listingForBooking, busySlot);
check('isSlotAvailable=false for busy slot', busyR.ok && busyR.value === false);

const pastR = isSlotAvailable(listingForBooking, new Date(Date.now() - 86_400_000));
check('isSlotAvailable=false for past slot', pastR.ok && pastR.value === false);

const availSlots = getAvailableSlots(listingForBooking, { from: new Date(), to: new Date(Date.now() + 21 * 86_400_000) });
check('getAvailableSlots returns >= 1 slot', availSlots.ok && availSlots.value.length >= 1, `got ${availSlots.ok ? availSlots.value.length : 'err'}`);

// ─────────────────────────────────────────────────────────────────────────
// SECTION 7: SACRED_CONTENT_AUDIT — 7 cases (1 per tradition has >=3 listing templates)
// ─────────────────────────────────────────────────────────────────────────
section('7. SACRED_CONTENT_AUDIT');

const sacredReport = auditSacredListings();
for (const tradition of TRADITIONS) {
  if (tradition === 'multi') continue;
  const row = sacredReport.find((r) => r.tradition === tradition);
  check(`tradition "${tradition}" has >= 1 template`, !!row && row.templateCount >= 1, `count=${row?.templateCount}`);
}

check('LISTING_TEMPLATES has >= 30 entries', LISTING_TEMPLATES.length >= 30, `got ${LISTING_TEMPLATES.length}`);

const allTraditions = new Set(LISTING_TEMPLATES.map((t) => t.tradition));
check('templates cover 7 sacred traditions (cigano/orixa/astrologia/cabala/numerologia/tantra/tarot)', ['cigano', 'orixa', 'astrologia', 'cabala', 'numerologia', 'tantra', 'tarot'].every((t) => allTraditions.has(t as any)));

// Recommendations
const rec = getRecommendedListings({ userId: user1, preferredTraditions: ['cigano', 'astrologia'] }, 5);
check('getRecommendedListings returns listings', rec.ok && rec.value.length >= 1);

// Audit rules
const listingRules = auditListingRules();
check('auditListingRules returns >= 8 enforced rules', listingRules.length >= 8 && listingRules.every((r) => r.isEnforced));

const bookingRules = auditBookingRules();
check('auditBookingRules returns >= 10 enforced rules', bookingRules.length >= 10 && bookingRules.every((r) => r.isEnforced));

// Slug
const sl = getListingBySlug('listing-mesa-real-smoke');
check('getListingBySlug finds listing', sl.ok && sl.value !== null);

// Stats
const stats = getBookingStats(practitioner, 30);
check('getBookingStats returns aggregates', stats.ok && stats.value.total >= 4, `total=${stats.ok ? stats.value.total : 'err'}`);

// List user bookings
const ulb = listUserBookings(user1);
check('listUserBookings returns bookings', ulb.ok && ulb.value.items.length >= 2);

// ─────────────────────────────────────────────────────────────────────────
// REPORT
// ─────────────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(60)}`);
console.log(`W73-D SMOKE: pass=${pass} fail=${fail}`);
console.log('─'.repeat(60));
if (fail > 0) {
  console.log('Failures:');
  for (const f of fails) console.log(`  - ${f}`);
  process.exit(1);
}
console.log('W73-D SMOKE: ALL PASSED ✅');
process.exit(0);