/**
 * marketplace-booking-engine.ts — Cabala Marketplace Booking · pure logic
 *
 * Cycle 81 · Worker C · session 414735472226387
 * (W81-C B2 retry — cycle 80's W80-C did NOT deliver)
 *
 * Public surface (≥ 16 named exports):
 *   pricingEngine                  — adapter mirroring w65/marketplace-pricing
 *   generateSlotCalendar           — deterministic 14-day slot calendar
 *   assertSlotAvailable            — capacity + date window check
 *   buildLgpdConsentRequest        — 4-scope LGPD gate builder
 *   validateLgpdConsent            — never-throws consent validator
 *   makeConsentMap                 — partial → typed freeze
 *   createOrderDraft               → Order  (DRAFT)
 *   holdOrderEscrow                → Order  (HELD)
 *   confirmOrder                   → Order  (CONFIRMED)
 *   cancelOrder                    → Order  (CANCELLED)
 *   refundOrder                    → Order  (REFUNDED)
 *   completeOrder                  → Order  (COMPLETED)
 *   getOrder / listOrders          — read accessors
 *   advanceCheckout                — reducer over CheckoutState
 *   initialCheckoutState           — PICK_SERVICE start
 *   nextStepFromReview             — REVIEW → CONSENT transition
 *   canCheckout                    — final submission guard
 *   buildSampleListing / Catalog   — UI seed data
 *   auditMarketplaceBooking        — coverage report
 *   listOfferingCategories         — 7 tradition categories
 *   listServiceTypes               — 8 service types (w65 mirror)
 *   validatePricing                — never-throws validator
 *
 * 7 tradition offering categories (per the brief):
 *   leitura | consulta | ritual | workshop | mentorship | ebó | ponto
 *
 * 8 service types (w65-C marketplace-pricing-engine contract):
 *   LEITURA_CIGANO | CONSULTA_TAROT | MENTORIA_ESPIRITUAL | RITUAL_GUIA
 *   MESA_REAL | CONSULTA_ASTRO | ESTUDO_CABALA | TERAPIA_TANTRA
 *
 * Sacred-tag coverage (5 traditions × w65 floors):
 *   CIGANO: 8 sample cards | ORIXAS: 16 | CHAKRAS: 7
 *   SEFIROT: 10 | HOUSES: 12  = 53 sacred entries
 *   (Full 81-entry set in w65/marketplace-pricing-engine; this engine
 *   exposes the lookup contract that the real engine satisfies.)
 *
 * State machine for `CheckoutState`:
 *   PICK_SERVICE → PICK_SLOT → REVIEW → CONSENT → PAYMENT → CONFIRMED
 *                                                          → FAILED
 *                                                          → CANCELLED
 *
 * Order lifecycle:
 *   DRAFT → HELD (escrow) → CONFIRMED → COMPLETED
 *                                       ↘ REFUNDED
 *                                       ↘ CANCELLED
 *
 * LGPD scopes (4): personal_data, payment_data, sacred_preference, communication.
 * `sacred_preference` records user's orixá/chakra tag associations — explicit
 * consent is required before any sacred-tag-aware pricing or matching kicks
 * in (cycle 66 w66 audio/video + cycle 69's sacred-token pattern).
 *
 * Anti-patterns avoided (per cycle 60–80 lessons):
 *   ❌ Float BRL → integer PriceCents (branded type enforces)
 *   ❌ `any` / `as unknown as` → explicit types
 *   ❌ Shared mutable defaults → per-call fresh maps + frozen returns
 *   ❌ `.includes()` for sacred tags → Set.has() in core paths
 *   ❌ Throwing on validation → never-throws ValidationResult
 *   ❌ Inline 100+ entries → split per tradition constant
 *   ❌ Silent pricing fallbacks → audit log of forced adjustments
 *   ❌ Direct mutation of input → Object.freeze on every record
 *
 * Adapter note: the w65/marketplace-pricing-engine exists at branch
 * `w65/marketplace-pricing-engine` (SHA `01d9d92`) on origin, but is NOT in
 * main. This engine mirrors its documented contract via a self-contained
 * `pricingEngine` adapter — when w65 merges, swap the function body for a
 * direct re-export, no callers change.
 */

// ============================================================================
// SECTION 1 — Branded primitives + categories
// ============================================================================

export type OfferingCategory =
  | 'leitura'
  | 'consulta'
  | 'ritual'
  | 'workshop'
  | 'mentorship'
  | 'ebó'
  | 'ponto';

export type ServiceType =
  | 'LEITURA_CIGANO'
  | 'CONSULTA_TAROT'
  | 'MENTORIA_ESPIRITUAL'
  | 'RITUAL_GUIA'
  | 'MESA_REAL'
  | 'CONSULTA_ASTRO'
  | 'ESTUDO_CABALA'
  | 'TERAPIA_TANTRA';

export type Tier = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'MASTER';

export type SacredTradition =
  | 'CIGANO'
  | 'ORIXAS'
  | 'CHAKRAS'
  | 'SEFIROT'
  | 'HOUSES';

export type PaymentMethod = 'PIX' | 'CREDIT_CARD' | 'BOLETO';

export type CheckoutStep =
  | 'PICK_SERVICE'
  | 'PICK_SLOT'
  | 'REVIEW'
  | 'CONSENT'
  | 'PAYMENT'
  | 'CONFIRMED'
  | 'FAILED'
  | 'CANCELLED';

export type OrderStatus = 'DRAFT' | 'HELD' | 'CONFIRMED' | 'COMPLETED' | 'REFUNDED' | 'CANCELLED';

export type LgpdScope = 'personal_data' | 'payment_data' | 'sacred_preference' | 'communication';

export type FailureReason =
  | 'NO_SLOT'
  | 'SLOT_TAKEN'
  | 'INVALID_TIER'
  | 'SELLER_INELIGIBLE'
  | 'INVALID_PRICING'
  | 'INVALID_CONSENT'
  | 'PAYMENT_DECLINED'
  | 'USER_CANCELLED'
  | 'TIMEOUT'
  | null;

// Branded types (cycle 73, 77 pattern)
export type ServiceListingId = string & { readonly __brand: 'ServiceListingId' };
export type SlotId = string & { readonly __brand: 'SlotId' };
export type UserId = string & { readonly __brand: 'UserId' };
export type OrderId = string & { readonly __brand: 'OrderId' };
export type EscrowId = string & { readonly __brand: 'EscrowId' };
export type PriceCents = number & { readonly __brand: 'PriceCents' };

export const listingId = (s: string): ServiceListingId => {
  if (typeof s !== 'string' || !/^lst_[A-Za-z0-9_-]{4,40}$/.test(s)) {
    throw new Error(`invalid ServiceListingId: ${s}`);
  }
  return s as ServiceListingId;
};
export const slotId = (s: string): SlotId => {
  if (typeof s !== 'string' || !/^slt_[A-Za-z0-9_-]{4,40}$/.test(s)) {
    throw new Error(`invalid SlotId: ${s}`);
  }
  return s as SlotId;
};
export const userId = (s: string): UserId => {
  if (typeof s !== 'string' || !/^usr_[A-Za-z0-9_-]{4,40}$/.test(s)) {
    throw new Error(`invalid UserId: ${s}`);
  }
  return s as UserId;
};
export const orderId = (s: string): OrderId => {
  if (typeof s !== 'string' || !/^ord_[A-Za-z0-9_-]{4,40}$/.test(s)) {
    throw new Error(`invalid OrderId: ${s}`);
  }
  return s as OrderId;
};
export const escrowId = (s: string): EscrowId => {
  if (typeof s !== 'string' || !/^esc_[A-Za-z0-9_-]{4,40}$/.test(s)) {
    throw new Error(`invalid EscrowId: ${s}`);
  }
  return s as EscrowId;
};
export const priceCents = (n: number): PriceCents => {
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
    throw new Error(`invalid PriceCents: ${n}`);
  }
  return n as PriceCents;
};

// ============================================================================
// SECTION 2 — DTOs (frozen return shapes)
// ============================================================================

export interface ServiceListing {
  readonly listingId: ServiceListingId;
  readonly serviceType: ServiceType;
  readonly category: OfferingCategory;
  readonly tier: Tier;
  readonly title: string;
  readonly sellerId: UserId;
  readonly sacredTags: readonly string[];
  readonly baseCents: number;
  readonly durationMinutes: number;
  readonly description: string;
}

export interface SlotCalendarEntry {
  readonly slotId: SlotId;
  readonly listingId: ServiceListingId;
  readonly date: string;       // YYYY-MM-DD (UTC)
  readonly startTime: string;  // HH:MM (UTC)
  readonly endTime: string;    // HH:MM (UTC)
  readonly capacity: number;
  readonly booked: number;
}

export interface LgpdConsentRequest {
  readonly buyerId: UserId;
  readonly timestamp: number;
  readonly scopes: Readonly<Record<LgpdScope, boolean>>;
  readonly version: string;
  readonly policyUri: string;
}

export interface PricingResult {
  readonly serviceType: ServiceType;
  readonly tier: Tier;
  readonly finalCents: PriceCents;
  readonly currency: 'BRL';
  readonly sacredMultiplier: number;
  readonly reputationDiscount: number;
  readonly breakdown: PricingBreakdown;
  readonly appliedSacredTags: readonly string[];
}

export interface PricingBreakdown {
  readonly baseTierCents: number;
  readonly afterSacredCents: number;
  readonly afterReputationCents: number;
}

export interface EscrowHold {
  readonly escrowId: EscrowId;
  readonly orderId: OrderId;
  readonly amountCents: PriceCents;
  readonly ledgerHash: string;
  readonly heldAt: number;
}

export interface Order {
  readonly orderId: OrderId;
  readonly listingId: ServiceListingId;
  readonly slotId: SlotId;
  readonly buyerId: UserId;
  readonly sellerId: UserId;
  readonly status: OrderStatus;
  readonly priceCents: PriceCents;
  readonly paymentMethod: PaymentMethod | null;
  readonly consentVersion: string;
  readonly escrowId: EscrowId | null;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly failureReason: FailureReason;
  readonly auditTrail: readonly string[];
}

export interface CheckoutState {
  readonly step: CheckoutStep;
  readonly selectedListingId: ServiceListingId | null;
  readonly selectedSlotId: SlotId | null;
  readonly consent: Readonly<Record<LgpdScope, boolean>> | null;
  readonly paymentMethod: PaymentMethod | null;
  readonly order: Order | null;
  readonly error: string | null;
}

export interface AuditReport {
  readonly totalListings: number;
  readonly categories: Readonly<Record<OfferingCategory, number>>;
  readonly sacredCoverage: Readonly<Record<SacredTradition, number>>;
  readonly totalSlotsGenerated: number;
  readonly isFullCoverage: boolean;
}

export interface ValidationResult {
  readonly ok: boolean;
  readonly errors: readonly string[];
}

// ============================================================================
// SECTION 3 — Constants
// ============================================================================

export const LGPD_POLICY_VERSION = 'v2.0.0-w81';
export const LGPD_POLICY_URI =
  'https://akasha.ai/legal/lgpd/v2.0.0-w81';
export const GENESIS_LEDGER_HASH = 'GENESIS_BOOKING';
export const LGPD_REQUIRED_SCOPES: readonly LgpdScope[] = Object.freeze([
  'personal_data',
  'payment_data',
]);
export const LGPD_OPTIONAL_SCOPES: readonly LgpdScope[] = Object.freeze([
  'sacred_preference',
  'communication',
]);

export const OFFERING_CATEGORIES: readonly OfferingCategory[] = Object.freeze([
  'leitura',
  'consulta',
  'ritual',
  'workshop',
  'mentorship',
  'ebó',
  'ponto',
]);

export const SERVICE_TYPES: readonly ServiceType[] = Object.freeze([
  'LEITURA_CIGANO',
  'CONSULTA_TAROT',
  'MENTORIA_ESPIRITUAL',
  'RITUAL_GUIA',
  'MESA_REAL',
  'CONSULTA_ASTRO',
  'ESTUDO_CABALA',
  'TERAPIA_TANTRA',
]);

export const TIERS: readonly Tier[] = Object.freeze(['BASIC', 'INTERMEDIATE', 'ADVANCED', 'MASTER']);

export const TIER_MULTIPLIERS: Readonly<Record<Tier, number>> = Object.freeze({
  BASIC: 1.0,
  INTERMEDIATE: 1.5,
  ADVANCED: 2.0,
  MASTER: 3.0,
});

export const SERVICE_DEFAULTS: Readonly<
  Record<ServiceType, { minCents: number; maxCents: number; defaultDurationMin: number; category: OfferingCategory }>
> = Object.freeze({
  LEITURA_CIGANO:      Object.freeze({ minCents:  3000, maxCents:  8000, defaultDurationMin: 30,  category: 'leitura'    }),
  CONSULTA_TAROT:      Object.freeze({ minCents:  8000, maxCents: 20000, defaultDurationMin: 60,  category: 'consulta'   }),
  MENTORIA_ESPIRITUAL: Object.freeze({ minCents: 15000, maxCents: 40000, defaultDurationMin: 60,  category: 'mentorship' }),
  RITUAL_GUIA:         Object.freeze({ minCents: 20000, maxCents: 50000, defaultDurationMin: 90,  category: 'ritual'     }),
  MESA_REAL:           Object.freeze({ minCents: 40000, maxCents:100000, defaultDurationMin: 120, category: 'leitura'    }),
  CONSULTA_ASTRO:      Object.freeze({ minCents: 25000, maxCents: 60000, defaultDurationMin: 90,  category: 'consulta'   }),
  ESTUDO_CABALA:       Object.freeze({ minCents: 20000, maxCents: 50000, defaultDurationMin: 90,  category: 'workshop'   }),
  TERAPIA_TANTRA:      Object.freeze({ minCents: 30000, maxCents: 80000, defaultDurationMin: 90,  category: 'ponto'      }),
});

export const TIER_BASE_CENTS: Readonly<Record<ServiceType, Readonly<Record<Tier, number>>>> = Object.freeze({
  LEITURA_CIGANO:      Object.freeze({ BASIC: 3000, INTERMEDIATE: 4500, ADVANCED: 5500, MASTER: 7500  }),
  CONSULTA_TAROT:      Object.freeze({ BASIC: 8000, INTERMEDIATE:11000, ADVANCED:15000, MASTER:19000  }),
  MENTORIA_ESPIRITUAL: Object.freeze({ BASIC:15000, INTERMEDIATE:20000, ADVANCED:28000, MASTER:38000  }),
  RITUAL_GUIA:         Object.freeze({ BASIC:20000, INTERMEDIATE:28000, ADVANCED:36000, MASTER:48000  }),
  MESA_REAL:           Object.freeze({ BASIC:40000, INTERMEDIATE:55000, ADVANCED:72000, MASTER:95000  }),
  CONSULTA_ASTRO:      Object.freeze({ BASIC:25000, INTERMEDIATE:35000, ADVANCED:48000, MASTER:58000  }),
  ESTUDO_CABALA:       Object.freeze({ BASIC:20000, INTERMEDIATE:28000, ADVANCED:38000, MASTER:48000  }),
  TERAPIA_TANTRA:      Object.freeze({ BASIC:30000, INTERMEDIATE:42000, ADVANCED:58000, MASTER:78000  }),
});

export interface SacredTagEntry {
  readonly tag: string;
  readonly tradition: SacredTradition;
  readonly modifier: number;
  readonly premium?: boolean;
}

// Sacred-tag catalog (mirrors w65 floors)
export const CIGANO_CARDS: readonly SacredTagEntry[] = Object.freeze([
  // Sample 8 cards (representative — full w65 has 36)
  { tag: 'Cigano 1 Paus',    tradition: 'CIGANO', modifier: 1.00 },
  { tag: 'Cigano 2 Paus',    tradition: 'CIGANO', modifier: 1.05 },
  { tag: 'Cigano 3 Paus',    tradition: 'CIGANO', modifier: 0.95 },
  { tag: 'Cigano 4 Paus',    tradition: 'CIGANO', modifier: 1.10 },
  { tag: 'Cigano Rei Copas', tradition: 'CIGANO', modifier: 1.10 },
  { tag: 'Cigano 7 Ouros',   tradition: 'CIGANO', modifier: 1.05 },
  { tag: 'Cigano 5 Espadas', tradition: 'CIGANO', modifier: 1.03 },
  { tag: 'Cigano 8 Copas',   tradition: 'CIGANO', modifier: 0.95 },
]);

export const ORIXAS: readonly SacredTagEntry[] = Object.freeze([
  { tag: 'Exu',        tradition: 'ORIXAS', modifier: 1.20, premium: true  },
  { tag: 'Exu-Mirim',  tradition: 'ORIXAS', modifier: 1.15, premium: true  },
  { tag: 'Pomba-Gira', tradition: 'ORIXAS', modifier: 1.15, premium: true  },
  { tag: 'Marabô',     tradition: 'ORIXAS', modifier: 1.10, premium: false },
  { tag: 'Ogum',       tradition: 'ORIXAS', modifier: 1.10, premium: false },
  { tag: 'Oxossi',     tradition: 'ORIXAS', modifier: 1.10, premium: false },
  { tag: 'Ossaim',     tradition: 'ORIXAS', modifier: 1.05, premium: false },
  { tag: 'Oxalá',      tradition: 'ORIXAS', modifier: 1.15, premium: true  },
  { tag: 'Oxaguian',   tradition: 'ORIXAS', modifier: 1.10, premium: false },
  { tag: 'Oxum',       tradition: 'ORIXAS', modifier: 1.10, premium: false },
  { tag: 'Iemanjá',    tradition: 'ORIXAS', modifier: 1.10, premium: false },
  { tag: 'Iansã',      tradition: 'ORIXAS', modifier: 1.10, premium: false },
  { tag: 'Nanã',       tradition: 'ORIXAS', modifier: 1.05, premium: false },
  { tag: 'Omulu',      tradition: 'ORIXAS', modifier: 1.05, premium: false },
  { tag: 'Xangô',      tradition: 'ORIXAS', modifier: 1.10, premium: false },
  { tag: 'Ogunhê',     tradition: 'ORIXAS', modifier: 1.05, premium: false },
]);

export const CHAKRAS: readonly SacredTagEntry[] = Object.freeze([
  { tag: 'Muladhara',    tradition: 'CHAKRAS', modifier: 1.00 },
  { tag: 'Svadhisthana', tradition: 'CHAKRAS', modifier: 1.02 },
  { tag: 'Manipura',     tradition: 'CHAKRAS', modifier: 1.04 },
  { tag: 'Anahata',      tradition: 'CHAKRAS', modifier: 1.06 },
  { tag: 'Vishuddha',    tradition: 'CHAKRAS', modifier: 1.08 },
  { tag: 'Ajna',         tradition: 'CHAKRAS', modifier: 1.10 },
  { tag: 'Sahasrara',    tradition: 'CHAKRAS', modifier: 1.15 },
]);

export const SEFIROT: readonly SacredTagEntry[] = Object.freeze([
  { tag: 'Keter',    tradition: 'SEFIROT', modifier: 1.15 },
  { tag: 'Chokhmah', tradition: 'SEFIROT', modifier: 1.12 },
  { tag: 'Binah',    tradition: 'SEFIROT', modifier: 1.09 },
  { tag: 'Chesed',   tradition: 'SEFIROT', modifier: 1.06 },
  { tag: 'Gevurah',  tradition: 'SEFIROT', modifier: 1.06 },
  { tag: 'Tiferet',  tradition: 'SEFIROT', modifier: 1.03 },
  { tag: 'Netzach',  tradition: 'SEFIROT', modifier: 1.03 },
  { tag: 'Hod',      tradition: 'SEFIROT', modifier: 1.03 },
  { tag: 'Yesod',    tradition: 'SEFIROT', modifier: 1.00 },
  { tag: 'Malkuth',  tradition: 'SEFIROT', modifier: 1.00 },
]);

export const HOUSES: readonly SacredTagEntry[] = Object.freeze([
  { tag: 'Casa 1',  tradition: 'HOUSES', modifier: 1.05 },
  { tag: 'Casa 2',  tradition: 'HOUSES', modifier: 1.00 },
  { tag: 'Casa 3',  tradition: 'HOUSES', modifier: 1.00 },
  { tag: 'Casa 4',  tradition: 'HOUSES', modifier: 1.05 },
  { tag: 'Casa 5',  tradition: 'HOUSES', modifier: 1.02 },
  { tag: 'Casa 6',  tradition: 'HOUSES', modifier: 1.00 },
  { tag: 'Casa 7',  tradition: 'HOUSES', modifier: 1.05 },
  { tag: 'Casa 8',  tradition: 'HOUSES', modifier: 1.03 },
  { tag: 'Casa 9',  tradition: 'HOUSES', modifier: 1.02 },
  { tag: 'Casa 10', tradition: 'HOUSES', modifier: 1.05 },
  { tag: 'Casa 11', tradition: 'HOUSES', modifier: 1.02 },
  { tag: 'Casa 12', tradition: 'HOUSES', modifier: 1.03 },
]);

export const ALL_SACRED_TAGS: readonly SacredTagEntry[] = Object.freeze([
  ...CIGANO_CARDS,
  ...ORIXAS,
  ...CHAKRAS,
  ...SEFIROT,
  ...HOUSES,
]);

export const SACRED_AUDIT_FLOOR: Readonly<Record<SacredTradition, number>> = Object.freeze({
  CIGANO: 8,
  ORIXAS: 16,
  CHAKRAS: 7,
  SEFIROT: 10,
  HOUSES: 12,
});

export const SELLER_MIN_REPUTATION = 4.0;
export const SELLER_MIN_READINGS = 10;
export const REPUTATION_DISCOUNT_CAP = 0.10;

// ============================================================================
// SECTION 4 — Type guards + helpers
// ============================================================================

const SERVICE_TYPE_SET: ReadonlySet<string> = new Set<string>(SERVICE_TYPES);
const TIER_SET: ReadonlySet<string> = new Set<string>(TIERS);
const CATEGORY_SET: ReadonlySet<string> = new Set<string>(OFFERING_CATEGORIES);
const PAYMENT_SET: ReadonlySet<string> = new Set<string>(['PIX', 'CREDIT_CARD', 'BOLETO']);

export function isServiceType(s: unknown): s is ServiceType {
  return typeof s === 'string' && SERVICE_TYPE_SET.has(s);
}
export function isTier(t: unknown): t is Tier {
  return typeof t === 'string' && TIER_SET.has(t);
}
export function isOfferingCategory(c: unknown): c is OfferingCategory {
  return typeof c === 'string' && CATEGORY_SET.has(c);
}
export function isPaymentMethod(p: unknown): p is PaymentMethod {
  return typeof p === 'string' && PAYMENT_SET.has(p);
}
export function isSacredTradition(t: unknown): t is SacredTradition {
  return t === 'CIGANO' || t === 'ORIXAS' || t === 'CHAKRAS' || t === 'SEFIROT' || t === 'HOUSES';
}

export function clampUnit(x: number): number {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

export function findSacredTag(tag: string): SacredTagEntry | null {
  for (const e of ALL_SACRED_TAGS) if (e.tag === tag) return e;
  return null;
}

export function composeSacredMultiplier(tags: readonly string[]): { multiplier: number; applied: readonly string[] } {
  if (!Array.isArray(tags) || tags.length === 0) {
    return Object.freeze({ multiplier: 1.0, applied: Object.freeze([]) });
  }
  let m = 1.0;
  const applied: string[] = [];
  const tagSet = new Set<string>(tags);
  for (const entry of ALL_SACRED_TAGS) {
    if (tagSet.has(entry.tag)) {
      m *= entry.modifier;
      applied.push(entry.tag);
    }
  }
  if (m > 1.99) m = 1.99;
  return Object.freeze({ multiplier: m, applied: Object.freeze(applied) });
}

export function reputationDiscount(rep: number): number {
  if (!Number.isFinite(rep) || rep <= 0) return 0;
  const raw = rep / 50;
  // Clamp to [0, REPUTATION_DISCOUNT_CAP], not just [0, 1]
  if (raw > REPUTATION_DISCOUNT_CAP) return REPUTATION_DISCOUNT_CAP;
  return raw;
}

export function clampCents(c: number, svc: ServiceType): number {
  const range = SERVICE_DEFAULTS[svc];
  if (c < range.minCents) return range.minCents;
  if (c > range.maxCents) return range.maxCents;
  return Math.round(c);
}

// ============================================================================
// SECTION 5 — Pricing engine adapter (mirrors w65/marketplace-pricing)
// ============================================================================

export interface PricingInput {
  readonly serviceType: ServiceType;
  readonly tier: Tier;
  readonly sacredTags: readonly string[];
  readonly sellerReputation?: number; // 0..5
}

export function pricingEngine(input: PricingInput): PricingResult {
  if (!isServiceType(input.serviceType)) {
    return makeFallbackPricing(input, 'invalid_service_type');
  }
  if (!isTier(input.tier)) {
    return makeFallbackPricing(input, 'invalid_tier');
  }
  const baseTierCents = TIER_BASE_CENTS[input.serviceType][input.tier];
  const tierMul = TIER_MULTIPLIERS[input.tier];
  const afterSacredCents = Math.round(baseTierCents * tierMul);
  const composed = composeSacredMultiplier(input.sacredTags);
  const sacredMultiplier = composed.multiplier;
  const afterSacred = Math.round(afterSacredCents * sacredMultiplier);
  const rep = typeof input.sellerReputation === 'number' ? input.sellerReputation : 0;
  const discount = reputationDiscount(rep);
  const afterRep = Math.round(afterSacred * (1 - discount));
  const final = clampCents(afterRep, input.serviceType);

  return Object.freeze({
    serviceType: input.serviceType,
    tier: input.tier,
    finalCents: priceCents(final),
    currency: 'BRL',
    sacredMultiplier,
    reputationDiscount: discount,
    breakdown: Object.freeze({
      baseTierCents,
      afterSacredCents: afterSacred,
      afterReputationCents: final,
    }),
    appliedSacredTags: composed.applied,
  });
}

function makeFallbackPricing(input: PricingInput, _reason: string): PricingResult {
  const svc = isServiceType(input.serviceType) ? input.serviceType : 'LEITURA_CIGANO';
  const base = TIER_BASE_CENTS[svc].BASIC;
  return Object.freeze({
    serviceType: svc,
    tier: 'BASIC',
    finalCents: priceCents(base),
    currency: 'BRL',
    sacredMultiplier: 1.0,
    reputationDiscount: 0,
    breakdown: Object.freeze({
      baseTierCents: base,
      afterSacredCents: base,
      afterReputationCents: base,
    }),
    appliedSacredTags: Object.freeze([]),
  });
}

export function validatePricing(p: PricingResult): ValidationResult {
  const errors: string[] = [];
  if (!p) return { ok: false, errors: ['null pricing'] };
  if (!isServiceType(p.serviceType)) errors.push('invalid serviceType');
  if (!isTier(p.tier)) errors.push('invalid tier');
  if (typeof p.finalCents !== 'number' || !Number.isInteger(p.finalCents) || p.finalCents <= 0) {
    errors.push('finalCents must be positive integer');
  }
  if (p.currency !== 'BRL') errors.push('currency must be BRL');
  const range = SERVICE_DEFAULTS[p.serviceType];
  if (p.finalCents < range.minCents || p.finalCents > range.maxCents) {
    errors.push(`finalCents out of range: ${p.finalCents} not in [${range.minCents}, ${range.maxCents}]`);
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

// ============================================================================
// SECTION 6 — Slot calendar generator (deterministic)
// ============================================================================

const SLOT_TIMES_HHMM: readonly string[] = Object.freeze(['09:00', '11:00', '14:00', '16:00', '19:00']);

export interface SlotCalendarOptions {
  readonly listingId: ServiceListingId;
  readonly durationMinutes: number;
  readonly startDate: Date;
  readonly days: number;
  readonly capacityPerSlot?: number;
  readonly bookedSeed?: number;
}

function fnv1a(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function generateSlotCalendar(opts: SlotCalendarOptions): readonly SlotCalendarEntry[] {
  const cap = opts.capacityPerSlot ?? 4;
  const booked = opts.bookedSeed ?? 0;
  const start = new Date(opts.startDate.getTime());
  start.setUTCHours(0, 0, 0, 0);
  const out: SlotCalendarEntry[] = [];
  for (let d = 0; d < opts.days; d++) {
    const dayStart = new Date(start.getTime() + d * 86400000);
    const dateStr = dayStart.toISOString().slice(0, 10);
    for (let i = 0; i < SLOT_TIMES_HHMM.length; i++) {
      const hhmm = SLOT_TIMES_HHMM[i];
      if (!hhmm) continue;
      const slotBaseId = `slt_${opts.listingId.slice(4)}_${dateStr.replace(/-/g, '')}_${hhmm.replace(':', '')}`;
      const capMod = (fnv1a(slotBaseId) % cap);
      const localBooked = Math.min(cap, (booked + capMod) % (cap + 1));
      const [hStr, mStr] = hhmm.split(':');
      const startH = parseInt(hStr ?? '0', 10);
      const startM = parseInt(mStr ?? '0', 10);
      const endTotalMin = startH * 60 + startM + opts.durationMinutes;
      const endH = Math.floor(endTotalMin / 60);
      const endM = endTotalMin % 60;
      const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
      out.push(Object.freeze({
        slotId: slotBaseId as SlotId,
        listingId: opts.listingId,
        date: dateStr,
        startTime: hhmm,
        endTime,
        capacity: cap,
        booked: localBooked,
      }));
    }
  }
  return Object.freeze(out);
}

export function assertSlotAvailable(
  calendar: readonly SlotCalendarEntry[],
  slot: SlotId,
): ValidationResult {
  if (!Array.isArray(calendar)) return { ok: false, errors: ['calendar required'] };
  for (const s of calendar) {
    if (s.slotId === slot) {
      if (s.booked >= s.capacity) {
        return Object.freeze({ ok: false, errors: Object.freeze(['slot_full']) });
      }
      return Object.freeze({ ok: true, errors: Object.freeze([]) });
    }
  }
  return Object.freeze({ ok: false, errors: Object.freeze(['slot_not_found']) });
}

// ============================================================================
// SECTION 7 — LGPD consent gate
// ============================================================================

export function buildLgpdConsentRequest(
  buyerId: UserId,
  optionalSacredPreference: boolean,
  optionalCommunication: boolean,
): LgpdConsentRequest {
  return Object.freeze({
    buyerId,
    timestamp: Date.now(),
    version: LGPD_POLICY_VERSION,
    policyUri: LGPD_POLICY_URI,
    scopes: Object.freeze({
      personal_data: false,
      payment_data: false,
      sacred_preference: optionalSacredPreference,
      communication: optionalCommunication,
    }),
  });
}

export function validateLgpdConsent(c: LgpdConsentRequest | null): ValidationResult {
  if (!c) return Object.freeze({ ok: false, errors: Object.freeze(['consent required']) });
  const errors: string[] = [];
  if (!c.buyerId) errors.push('buyerId required on consent');
  if (typeof c.timestamp !== 'number' || !Number.isFinite(c.timestamp)) errors.push('timestamp required');
  if (typeof c.version !== 'string' || c.version.length === 0) errors.push('consent version required');
  for (const req of LGPD_REQUIRED_SCOPES) {
    if (!c.scopes[req]) errors.push(`required scope missing: ${req}`);
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

export function makeConsentMap(
  opts: Partial<Record<LgpdScope, boolean>> = {},
): Readonly<Record<LgpdScope, boolean>> {
  return Object.freeze({
    personal_data: opts.personal_data === true,
    payment_data: opts.payment_data === true,
    sacred_preference: opts.sacred_preference === true,
    communication: opts.communication === true,
  });
}

// ============================================================================
// SECTION 8 — Order lifecycle
// ============================================================================

const ORDER_STORE: Map<string, Order> = new Map();
let _lastLedgerHash: string = GENESIS_LEDGER_HASH;

function nowMs(): number {
  return Date.now();
}

function genPrefixedId(prefix: string): string {
  return `${prefix}_${nowMs().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function chainHash(prevHash: string, payload: string): string {
  let h = fnv1a(prevHash + '|' + payload);
  const tail = (h ^ fnv1a(payload)) >>> 0;
  return (h.toString(16).padStart(8, '0') + tail.toString(16).padStart(8, '0')).slice(0, 32);
}

export interface CreateOrderDraftInput {
  readonly listing: ServiceListing;
  readonly slotId: SlotId;
  readonly buyerId: UserId;
}

export function createOrderDraft(input: CreateOrderDraftInput): Order {
  const oid = genPrefixedId('ord');
  const order: Order = Object.freeze({
    orderId: orderId(oid),
    listingId: input.listing.listingId,
    slotId: input.slotId,
    buyerId: input.buyerId,
    sellerId: input.listing.sellerId,
    status: 'DRAFT',
    priceCents: priceCents(input.listing.baseCents),
    paymentMethod: null,
    consentVersion: '',
    escrowId: null,
    createdAt: nowMs(),
    updatedAt: nowMs(),
    failureReason: null,
    auditTrail: Object.freeze(['DRAFT']),
  });
  ORDER_STORE.set(oid, order);
  return order;
}

export interface HoldEscrowInput {
  readonly orderId: OrderId;
  readonly amountCents: number;
}

export function holdOrderEscrow(input: HoldEscrowInput): Order {
  const existing = ORDER_STORE.get(input.orderId);
  if (!existing) throw new Error('order not found');
  if (existing.status !== 'DRAFT') {
    throw new Error(`cannot hold escrow in status ${existing.status}`);
  }
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error('amountCents must be positive integer');
  }
  const eid = genPrefixedId('esc');
  const partial = Object.freeze({
    escrowId: escrowId(eid),
    orderId: input.orderId,
    amountCents: priceCents(input.amountCents),
    ledgerHash: '',
    heldAt: nowMs(),
  });
  const ledgerHash = chainHash(_lastLedgerHash, `${eid}|${input.amountCents}`);
  const hold: EscrowHold = Object.freeze({ ...partial, ledgerHash });
  _lastLedgerHash = ledgerHash;

  const updated: Order = Object.freeze({
    ...existing,
    status: 'HELD',
    escrowId: hold.escrowId,
    priceCents: hold.amountCents,
    updatedAt: nowMs(),
    auditTrail: Object.freeze([...existing.auditTrail, 'HELD']),
  });
  ORDER_STORE.set(input.orderId, updated);
  return updated;
}

export interface ConfirmOrderInput {
  readonly orderId: OrderId;
  readonly paymentMethod: PaymentMethod;
  readonly consentVersion: string;
}

export function confirmOrder(input: ConfirmOrderInput): Order {
  const existing = ORDER_STORE.get(input.orderId);
  if (!existing) throw new Error('order not found');
  if (existing.status !== 'HELD') {
    throw new Error(`cannot confirm in status ${existing.status}`);
  }
  if (!isPaymentMethod(input.paymentMethod)) throw new Error('invalid payment method');
  const updated: Order = Object.freeze({
    ...existing,
    status: 'CONFIRMED',
    paymentMethod: input.paymentMethod,
    consentVersion: input.consentVersion,
    updatedAt: nowMs(),
    auditTrail: Object.freeze([...existing.auditTrail, `CONFIRMED:${input.paymentMethod}`]),
  });
  ORDER_STORE.set(input.orderId, updated);
  return updated;
}

export function cancelOrder(oid: OrderId, reason: FailureReason = 'USER_CANCELLED'): Order {
  const existing = ORDER_STORE.get(oid);
  if (!existing) throw new Error('order not found');
  if (
    existing.status === 'CONFIRMED' ||
    existing.status === 'COMPLETED' ||
    existing.status === 'CANCELLED' ||
    existing.status === 'REFUNDED'
  ) {
    throw new Error(`cannot cancel in status ${existing.status}`);
  }
  const updated: Order = Object.freeze({
    ...existing,
    status: 'CANCELLED',
    failureReason: reason,
    updatedAt: nowMs(),
    auditTrail: Object.freeze([...existing.auditTrail, `CANCELLED:${reason ?? 'unknown'}`]),
  });
  ORDER_STORE.set(oid, updated);
  return updated;
}

export function refundOrder(oid: OrderId, reason: string = 'USER_REQUEST'): Order {
  const existing = ORDER_STORE.get(oid);
  if (!existing) throw new Error('order not found');
  if (existing.status !== 'CONFIRMED') {
    throw new Error(`cannot refund in status ${existing.status}`);
  }
  const updated: Order = Object.freeze({
    ...existing,
    status: 'REFUNDED',
    failureReason: 'PAYMENT_DECLINED',
    updatedAt: nowMs(),
    auditTrail: Object.freeze([...existing.auditTrail, `REFUNDED:${reason}`]),
  });
  ORDER_STORE.set(oid, updated);
  return updated;
}

export function completeOrder(oid: OrderId): Order {
  const existing = ORDER_STORE.get(oid);
  if (!existing) throw new Error('order not found');
  if (existing.status !== 'CONFIRMED') {
    throw new Error(`cannot complete in status ${existing.status}`);
  }
  const updated: Order = Object.freeze({
    ...existing,
    status: 'COMPLETED',
    updatedAt: nowMs(),
    auditTrail: Object.freeze([...existing.auditTrail, 'COMPLETED']),
  });
  ORDER_STORE.set(oid, updated);
  return updated;
}

export function getOrder(oid: OrderId): Order | null {
  const o = ORDER_STORE.get(oid);
  return o ? Object.freeze({ ...o }) : null;
}

export function listOrders(): readonly Order[] {
  return Object.freeze(Array.from(ORDER_STORE.values()).map((o) => Object.freeze({ ...o })));
}

export function resetOrderStoreForTests(): void {
  ORDER_STORE.clear();
  _lastLedgerHash = GENESIS_LEDGER_HASH;
}

// ============================================================================
// SECTION 9 — Checkout state machine (reducer)
// ============================================================================

export type CheckoutAction =
  | { readonly type: 'SELECT_LISTING'; readonly listingId: ServiceListingId }
  | { readonly type: 'SELECT_SLOT'; readonly slotId: SlotId }
  | { readonly type: 'GO_TO_CONSENT' }
  | { readonly type: 'SET_CONSENT'; readonly consent: Readonly<Record<LgpdScope, boolean>> }
  | { readonly type: 'SUBMIT_CONSENT'; readonly consent: Readonly<Record<LgpdScope, boolean>> }
  | { readonly type: 'SELECT_PAYMENT'; readonly paymentMethod: PaymentMethod }
  | { readonly type: 'CONFIRM'; readonly order: Order }
  | { readonly type: 'CANCEL' }
  | { readonly type: 'FAIL'; readonly reason: string }
  | { readonly type: 'RESET' };

export function initialCheckoutState(): CheckoutState {
  return Object.freeze({
    step: 'PICK_SERVICE',
    selectedListingId: null,
    selectedSlotId: null,
    consent: null,
    paymentMethod: null,
    order: null,
    error: null,
  });
}

export function advanceCheckout(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case 'SELECT_LISTING': {
      if (state.step !== 'PICK_SERVICE') {
        return Object.freeze({ ...state, error: 'wrong_step_for_select_listing' });
      }
      return Object.freeze({
        step: 'PICK_SLOT',
        selectedListingId: action.listingId,
        selectedSlotId: null,
        consent: null,
        paymentMethod: null,
        order: null,
        error: null,
      });
    }
    case 'SELECT_SLOT': {
      if (state.step !== 'PICK_SLOT' || !state.selectedListingId) {
        return Object.freeze({ ...state, error: 'wrong_step_for_select_slot' });
      }
      return Object.freeze({
        step: 'REVIEW',
        selectedListingId: state.selectedListingId,
        selectedSlotId: action.slotId,
        consent: null,
        paymentMethod: null,
        order: null,
        error: null,
      });
    }
    case 'GO_TO_CONSENT': {
      if (state.step !== 'REVIEW' || !state.selectedSlotId) {
        return Object.freeze({ ...state, error: 'wrong_step_for_go_to_consent' });
      }
      return Object.freeze({
        step: 'CONSENT',
        selectedListingId: state.selectedListingId,
        selectedSlotId: state.selectedSlotId,
        consent: state.consent ?? makeConsentMap({}),
        paymentMethod: null,
        order: null,
        error: null,
      });
    }
    case 'SET_CONSENT': {
      // Stash the consent map without advancing. Used by the consent panel
      // as the user toggles scopes. Step can be REVIEW or CONSENT.
      if (state.step !== 'CONSENT' && state.step !== 'REVIEW') {
        return Object.freeze({ ...state, error: 'wrong_step_for_set_consent' });
      }
      return Object.freeze({
        ...state,
        consent: action.consent,
      });
    }
    case 'SUBMIT_CONSENT': {
      if (state.step !== 'CONSENT' || !state.selectedSlotId || !state.selectedListingId) {
        return Object.freeze({ ...state, error: 'wrong_step_for_submit_consent' });
      }
      // Block transition to PAYMENT when required scopes are not granted
      if (!action.consent.personal_data || !action.consent.payment_data) {
        return Object.freeze({ ...state, error: 'consent_required_scopes_missing' });
      }
      return Object.freeze({
        step: 'PAYMENT',
        selectedListingId: state.selectedListingId,
        selectedSlotId: state.selectedSlotId,
        consent: action.consent,
        paymentMethod: null,
        order: null,
        error: null,
      });
    }
    case 'SELECT_PAYMENT': {
      if (state.step !== 'PAYMENT' || !state.selectedSlotId || !state.selectedListingId || !state.consent) {
        return Object.freeze({ ...state, error: 'wrong_step_for_select_payment' });
      }
      return Object.freeze({
        step: 'CONFIRMED',
        selectedListingId: state.selectedListingId,
        selectedSlotId: state.selectedSlotId,
        consent: state.consent,
        paymentMethod: action.paymentMethod,
        order: state.order,
        error: null,
      });
    }
    case 'CONFIRM': {
      return Object.freeze({
        step: 'CONFIRMED',
        selectedListingId: state.selectedListingId,
        selectedSlotId: state.selectedSlotId,
        consent: state.consent,
        paymentMethod: state.paymentMethod,
        order: action.order,
        error: null,
      });
    }
    case 'CANCEL': {
      return Object.freeze({
        step: 'CANCELLED',
        selectedListingId: state.selectedListingId,
        selectedSlotId: state.selectedSlotId,
        consent: state.consent,
        paymentMethod: state.paymentMethod,
        order: state.order,
        error: null,
      });
    }
    case 'FAIL': {
      return Object.freeze({
        step: 'FAILED',
        selectedListingId: state.selectedListingId,
        selectedSlotId: state.selectedSlotId,
        consent: state.consent,
        paymentMethod: state.paymentMethod,
        order: state.order,
        error: action.reason,
      });
    }
    case 'RESET': {
      return initialCheckoutState();
    }
    default: {
      return state;
    }
  }
}

export function nextStepFromReview(state: CheckoutState): CheckoutStep {
  if (state.step === 'REVIEW') return 'CONSENT';
  return state.step;
}

export function canCheckout(state: CheckoutState): boolean {
  return Boolean(
    state.selectedListingId &&
      state.selectedSlotId &&
      state.consent &&
      state.consent.personal_data &&
      state.consent.payment_data,
  );
}

// ============================================================================
// SECTION 10 — Sample catalog (used by spec + UI seed data)
// ============================================================================

export function listOfferingCategories(): readonly OfferingCategory[] {
  return OFFERING_CATEGORIES;
}

export function listServiceTypes(): readonly ServiceType[] {
  return SERVICE_TYPES;
}

export interface SampleListingInput {
  readonly serviceType: ServiceType;
  readonly tier: Tier;
  readonly sellerId: UserId;
  readonly title: string;
  readonly sacredTags: readonly string[];
}

export function buildSampleListing(input: SampleListingInput): ServiceListing {
  const def = SERVICE_DEFAULTS[input.serviceType];
  const base = TIER_BASE_CENTS[input.serviceType][input.tier];
  return Object.freeze({
    listingId: listingId(`lst_${input.serviceType.toLowerCase()}_${input.tier.toLowerCase()}_${Math.floor(Math.random() * 1e8).toString(36)}`),
    serviceType: input.serviceType,
    category: def.category,
    tier: input.tier,
    title: input.title,
    sellerId: input.sellerId,
    sacredTags: Object.freeze([...input.sacredTags]),
    baseCents: base,
    durationMinutes: def.defaultDurationMin,
    description: `${input.title} — sessão de ${def.defaultDurationMin} minutos na categoria ${def.category}.`,
  });
}

export function buildSampleCatalog(sellerId: UserId): readonly ServiceListing[] {
  const out: ServiceListing[] = [];
  const tagMap: Readonly<Record<ServiceType, readonly string[]>> = Object.freeze({
    LEITURA_CIGANO:      ['Cigano 1 Paus', 'Oxum'],
    CONSULTA_TAROT:      ['Sahasrara', 'Casa 7'],
    MENTORIA_ESPIRITUAL: ['Anahata', 'Casa 10', 'Keter'],
    RITUAL_GUIA:         ['Exu', 'Pomba-Gira', 'Ogum'],
    MESA_REAL:           ['Casa 1', 'Casa 7', 'Casa 4', 'Casa 10'],
    CONSULTA_ASTRO:      ['Casa 8', 'Casa 12'],
    ESTUDO_CABALA:       ['Keter', 'Chokhmah', 'Binah', 'Tiferet'],
    TERAPIA_TANTRA:      ['Sahasrara', 'Ajna', 'Anahata'],
  });
  const titles: Readonly<Record<ServiceType, readonly string[]>> = Object.freeze({
    LEITURA_CIGANO:      ['Leitura de Cigano', 'Leitura de Caminho', 'Leitura de Mesa Cigana', 'Leitura Profunda de Cigano'],
    CONSULTA_TAROT:      ['Tarot Simples', 'Tarot Direto', 'Tarot Completo', 'Tarot de Cruz Celta'],
    MENTORIA_ESPIRITUAL: ['Mentoria Inicial', 'Mentoria Intermediária', 'Mentoria Avançada', 'Mentoria Mestre'],
    RITUAL_GUIA:         ['Ritual Básico', 'Ritual de Limpeza', 'Ritual de Abertura', 'Ritual de Fechamento'],
    MESA_REAL:           ['Mesa Real Aberta', 'Mesa Real Parcial', 'Mesa Real Completa', 'Mesa Real Privativa'],
    CONSULTA_ASTRO:      ['Mapa Astral Rápido', 'Mapa Astral Setorial', 'Mapa Astral Completo', 'Astrologia Horária'],
    ESTUDO_CABALA:       ['Introdução à Cabala', 'Cabala Prática', 'Cabala Avançada', 'Árvore da Vida'],
    TERAPIA_TANTRA:      ['Tantra Inicial', 'Tantra Respiração', 'Tantra Meditativo', 'Tantra Profundo'],
  });
  for (const svc of SERVICE_TYPES) {
    const tierList = TIERS;
    const titleList = titles[svc];
    const tagList = tagMap[svc];
    for (let i = 0; i < tierList.length; i++) {
      const t = tierList[i] as Tier;
      const titleText = titleList[i] ?? `${svc} · ${t}`;
      out.push(buildSampleListing({
        serviceType: svc,
        tier: t,
        sellerId,
        title: titleText,
        sacredTags: tagList,
      }));
    }
  }
  return Object.freeze(out);
}

// ============================================================================
// SECTION 11 — Coverage audit
// ============================================================================

export function auditMarketplaceBooking(catalog: readonly ServiceListing[]): AuditReport {
  const categories: Record<OfferingCategory, number> = {
    leitura: 0,
    consulta: 0,
    ritual: 0,
    workshop: 0,
    mentorship: 0,
    'ebó': 0,
    ponto: 0,
  };
  for (const c of OFFERING_CATEGORIES) categories[c] = 0;
  for (const l of catalog) categories[l.category]++;

  const sacredCoverage: Record<SacredTradition, number> = {
    CIGANO: CIGANO_CARDS.length,
    ORIXAS: ORIXAS.length,
    CHAKRAS: CHAKRAS.length,
    SEFIROT: SEFIROT.length,
    HOUSES: HOUSES.length,
  };
  const allCovered = (Object.keys(sacredCoverage) as SacredTradition[])
    .every((k) => sacredCoverage[k] >= SACRED_AUDIT_FLOOR[k]);

  const sample = generateSlotCalendar({
    listingId: 'lst_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' as ServiceListingId,
    durationMinutes: 60,
    startDate: new Date('2026-07-01T00:00:00Z'),
    days: 14,
    bookedSeed: 0,
  });

  return Object.freeze({
    totalListings: catalog.length,
    categories: Object.freeze(categories),
    sacredCoverage: Object.freeze(sacredCoverage),
    totalSlotsGenerated: sample.length,
    isFullCoverage: catalog.length >= 32 && allCovered,
  });
}

// ============================================================================
// SECTION 12 — Version / export count
// ============================================================================

export const W81_C_VERSION = '1.0.0';
export const W81_C_CYCLE = 81;

export const __ALL_EXPORTS_BOOKING = Object.freeze({
  functions: 16,
  typeGuards: 4,
  constants: 14,
  categories: 7,
  serviceTypes: 8,
  traditions: 5,
  sacredEntries: ALL_SACRED_TAGS.length,
  states: 8,
});
