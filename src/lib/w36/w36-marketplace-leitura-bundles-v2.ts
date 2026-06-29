/**
 * w36/marketplace-leitura-bundles-v2.ts
 *
 * PATCH of w36/marketplace-leitura-bundles.ts (cycle 36 audit fix #6).
 *
 * **Bug fixed (Verifier cycle 36 audit, non-blocking nit):**
 *   - Original `buildGroupBundle` computed `perPersonCents =
 *     Math.round(pricing.finalPriceCents / slots)` but never used it. The
 *     dead variable was silenced with `void perPersonCents;` after a
 *     `return` statement — making the line unreachable. The accompanying
 *     comment ("available for downstream split logic") was misleading
 *     because no consumer could access the value: the function had already
 *     returned.
 *   - v2 surfaces per-person pricing as a real, first-class field on the
 *     returned `Bundle`. The new optional `perPersonCents: number | null`
 *     field is populated for `type: "group"` bundles (where it is meaningful)
 *     and is `null` for self / gift / subscription bundles. Downstream split
 *     logic, checkout UI, and receipt rendering can now read it directly
 *     from the bundle object.
 *
 * **Compatibility:** additive change. Existing consumers that don't read
 * `perPersonCents` are unaffected. The dead `void perPersonCents;` line and
 * its misleading comment are removed.
 *
 * Pure TS, no runtime imports. Safe to import from server / edge / tests.
 *
 * Composes (same as v1):
 *   - w31/marketplace-leitura (single leitura listing + checkout)
 *   - w35/marketplace-leitura-wishlist (save-for-later + alerts)
 *   - w34/marketplace-leitura-discovery (carousels, filters, sort)
 *   - w32/marketplace-reviews (review aggregation)
 *   - w33/marketplace-checkout (cart + payment intent)
 */

// ============================================================================
// TYPES
// ============================================================================

export type BundleType =
  | "self-journey" // buyer consumes all sessions
  | "gift" // bundle is gifted to another user
  | "group" // multiple recipients share sessions
  | "subscription"; // recurring monthly leitura pack

export type LeituraRef = {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  basePriceCents: number;
  durationMinutes: number;
  tradition: string;
  rating: number; // 0-5
  reviewCount: number;
};

export type BundleDiscountTier = {
  minItems: number;
  discountPct: number; // 0-100
  label: string;
};

export type GiftRecipient = {
  userId: string | null; // null = scheduled / pending
  email: string | null;
  displayName: string;
  deliveryAt: number | null; // epoch ms (null = immediate)
  personalMessage: string;
  scheduled: boolean;
};

export type GroupShare = {
  totalSlots: number;
  filledSlots: number;
  recipients: { userId: string; displayName: string; joinedAt: number }[];
  allowJoin: boolean;
  expiresAt: number;
};

export type SubscriptionTerms = {
  intervalDays: number; // 30 = monthly
  leiturasPerCycle: number;
  rolloverUnused: boolean;
  maxRolloverCycles: number;
  cancelAtCycleEnd: boolean;
};

export type Bundle = {
  id: string;
  type: BundleType;
  title: string;
  description: string;
  leituras: LeituraRef[];
  basePriceCents: number; // sum of individual prices
  discountPct: number; // 0-100
  finalPriceCents: number;
  savings: number; // basePriceCents - finalPriceCents
  /**
   * v2 NEW: per-person price in cents. Populated for `type: "group"` bundles
   * (the meaningful case — used by checkout split logic and receipt
   * rendering). `null` for self / gift / subscription bundles where the
   * concept does not apply.
   */
  perPersonCents: number | null;
  recipient: GiftRecipient | null;
  groupShare: GroupShare | null;
  subscription: SubscriptionTerms | null;
  createdAt: number;
  expiresAt: number | null;
  maxRedemptions: number | null;
  redemptions: number;
  ownerId: string;
};

export type BundleConfig = {
  discountTiers: BundleDiscountTier[];
  giftWrappingFeeCents: number;
  groupShareMinSlots: number;
  groupShareMaxSlots: number;
  subscriptionMinIntervalDays: number;
  giftMaxScheduledDays: number;
  defaultBundleValidityDays: number;
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEFAULT_DISCOUNT_TIERS: BundleDiscountTier[] = [
  { minItems: 2, discountPct: 5, label: "Casal" },
  { minItems: 3, discountPct: 10, label: "Tríade" },
  { minItems: 5, discountPct: 15, label: "Círculo" },
  { minItems: 8, discountPct: 20, label: "Mandala" },
  { minItems: 12, discountPct: 25, label: "Constelação" },
];

export const DEFAULT_BUNDLE_CONFIG: BundleConfig = {
  discountTiers: DEFAULT_DISCOUNT_TIERS,
  giftWrappingFeeCents: 500, // R$ 5,00
  groupShareMinSlots: 2,
  groupShareMaxSlots: 20,
  subscriptionMinIntervalDays: 30,
  giftMaxScheduledDays: 365,
  defaultBundleValidityDays: 365,
};

export const SUBSCRIPTION_INTERVAL_DAYS = {
  monthly: 30,
  quarterly: 90,
  semiAnnual: 180,
  annual: 365,
} as const;

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Compute the total base price of a bundle (sum of individual leituras).
 */
export function computeBasePrice(leituras: LeituraRef[]): number {
  return leituras.reduce((sum, l) => sum + l.basePriceCents, 0);
}

/**
 * Pick the applicable discount tier for a given number of items.
 */
export function pickDiscountTier(
  itemCount: number,
  tiers: BundleDiscountTier[] = DEFAULT_DISCOUNT_TIERS,
): BundleDiscountTier | null {
  const sorted = [...tiers].sort((a, b) => b.minItems - a.minItems);
  for (const t of sorted) {
    if (itemCount >= t.minItems) return t;
  }
  return null;
}

/**
 * Compute discount percentage for a bundle size.
 */
export function computeBundleDiscount(
  itemCount: number,
  tiers: BundleDiscountTier[] = DEFAULT_DISCOUNT_TIERS,
): number {
  const tier = pickDiscountTier(itemCount, tiers);
  return tier ? tier.discountPct : 0;
}

/**
 * Compute the final price of a bundle.
 */
export function computeBundlePrice(
  leituras: LeituraRef[],
  config: Partial<BundleConfig> = {},
  extras: { giftWrap: boolean; expedited: boolean } = {
    giftWrap: false,
    expedited: false,
  },
): {
  basePriceCents: number;
  discountPct: number;
  discountCents: number;
  extrasCents: number;
  finalPriceCents: number;
} {
  const cfg = { ...DEFAULT_BUNDLE_CONFIG, ...config };
  const basePriceCents = computeBasePrice(leituras);
  const discountPct = computeBundleDiscount(leituras.length, cfg.discountTiers);
  const discountCents = Math.round((basePriceCents * discountPct) / 100);
  let extrasCents = 0;
  if (extras.giftWrap) extrasCents += cfg.giftWrappingFeeCents;
  if (extras.expedited) extrasCents += 2000; // R$ 20,00
  const finalPriceCents = basePriceCents - discountCents + extrasCents;
  return {
    basePriceCents,
    discountPct,
    discountCents,
    extrasCents,
    finalPriceCents,
  };
}

/**
 * Build a self-journey bundle for the buyer.
 */
export function buildSelfBundle(
  ownerId: string,
  leituras: LeituraRef[],
  now: number,
  config: Partial<BundleConfig> = {},
): Bundle {
  const pricing = computeBundlePrice(leituras, config);
  return {
    id: `bundle-self-${now}-${ownerId.slice(0, 6)}`,
    type: "self-journey",
    title: `Jornada pessoal (${leituras.length} leituras)`,
    description: `Pacote de ${leituras.length} leituras para consumo pessoal.`,
    leituras,
    basePriceCents: pricing.basePriceCents,
    discountPct: pricing.discountPct,
    finalPriceCents: pricing.finalPriceCents,
    savings: pricing.basePriceCents - pricing.finalPriceCents,
    perPersonCents: null, // v2 NEW: not meaningful for self-journey bundles
    recipient: null,
    groupShare: null,
    subscription: null,
    createdAt: now,
    expiresAt: now + DEFAULT_BUNDLE_CONFIG.defaultBundleValidityDays * 24 * 3600 * 1000,
    maxRedemptions: 1,
    redemptions: 0,
    ownerId,
  };
}

/**
 * Build a gift bundle.
 */
export function buildGiftBundle(
  ownerId: string,
  leituras: LeituraRef[],
  recipient: GiftRecipient,
  now: number,
  config: Partial<BundleConfig> = {},
): Bundle {
  const cfg = { ...DEFAULT_BUNDLE_CONFIG, ...config };
  const pricing = computeBundlePrice(leituras, config, { giftWrap: true, expedited: false });
  return {
    id: `bundle-gift-${now}-${ownerId.slice(0, 6)}`,
    type: "gift",
    title: `Presente: ${leituras.length} leituras para ${recipient.displayName}`,
    description: recipient.personalMessage || "Com carinho da sua jornada.",
    leituras,
    basePriceCents: pricing.basePriceCents,
    discountPct: pricing.discountPct,
    finalPriceCents: pricing.finalPriceCents,
    savings: pricing.basePriceCents - pricing.finalPriceCents,
    perPersonCents: null, // v2 NEW: not meaningful for gift bundles
    recipient,
    groupShare: null,
    subscription: null,
    createdAt: now,
    expiresAt:
      recipient.deliveryAt !== null
        ? recipient.deliveryAt + cfg.defaultBundleValidityDays * 24 * 3600 * 1000
        : now + cfg.defaultBundleValidityDays * 24 * 3600 * 1000,
    maxRedemptions: 1,
    redemptions: 0,
    ownerId,
  };
}

/**
 * Build a group share bundle.
 */
export function buildGroupBundle(
  ownerId: string,
  leituras: LeituraRef[],
  slots: number,
  now: number,
  config: Partial<BundleConfig> = {},
): Bundle {
  const cfg = { ...DEFAULT_BUNDLE_CONFIG, ...config };
  if (slots < cfg.groupShareMinSlots || slots > cfg.groupShareMaxSlots) {
    throw new Error(
      `slots must be between ${cfg.groupShareMinSlots} and ${cfg.groupShareMaxSlots}`,
    );
  }
  const pricing = computeBundlePrice(leituras, config);
  // v2 fix: per-person cents is now a real, first-class field on the
  // returned Bundle. The dead `void perPersonCents;` + misleading comment
  // are removed; the value flows through to consumers via the return shape.
  const perPersonCents = Math.round(pricing.finalPriceCents / slots);
  return {
    id: `bundle-group-${now}-${ownerId.slice(0, 6)}`,
    type: "group",
    title: `Grupo: ${leituras.length} leituras para ${slots} pessoas`,
    description: `Compartilhe ${leituras.length} leituras com até ${slots} pessoas.`,
    leituras,
    basePriceCents: pricing.basePriceCents,
    discountPct: pricing.discountPct,
    finalPriceCents: pricing.finalPriceCents,
    savings: pricing.basePriceCents - pricing.finalPriceCents,
    perPersonCents,
    recipient: null,
    groupShare: {
      totalSlots: slots,
      filledSlots: 1, // owner
      recipients: [
        { userId: ownerId, displayName: "organizador", joinedAt: now },
      ],
      allowJoin: true,
      expiresAt: now + 30 * 24 * 3600 * 1000,
    },
    subscription: null,
    createdAt: now,
    expiresAt: now + 30 * 24 * 3600 * 1000,
    maxRedemptions: slots,
    redemptions: 1,
    ownerId,
  };
}

/**
 * Build a subscription bundle.
 */
export function buildSubscriptionBundle(
  ownerId: string,
  leituras: LeituraRef[],
  intervalDays: number,
  leiturasPerCycle: number,
  now: number,
  config: Partial<BundleConfig> = {},
): Bundle {
  const cfg = { ...DEFAULT_BUNDLE_CONFIG, ...config };
  if (intervalDays < cfg.subscriptionMinIntervalDays) {
    throw new Error(
      `intervalDays must be >= ${cfg.subscriptionMinIntervalDays}`,
    );
  }
  const pricing = computeBundlePrice(leituras, config);
  return {
    id: `bundle-sub-${now}-${ownerId.slice(0, 6)}`,
    type: "subscription",
    title: `Assinatura: ${leiturasPerCycle} leituras a cada ${intervalDays} dias`,
    description: `Renovação automática de ${leiturasPerCycle} leituras por ciclo.`,
    leituras,
    basePriceCents: pricing.basePriceCents,
    discountPct: pricing.discountPct,
    finalPriceCents: pricing.finalPriceCents,
    savings: pricing.basePriceCents - pricing.finalPriceCents,
    perPersonCents: null, // v2 NEW: not meaningful for subscription bundles
    recipient: null,
    groupShare: null,
    subscription: {
      intervalDays,
      leiturasPerCycle,
      rolloverUnused: true,
      maxRolloverCycles: 2,
      cancelAtCycleEnd: true,
    },
    createdAt: now,
    expiresAt: null,
    maxRedemptions: null,
    redemptions: 0,
    ownerId,
  };
}

/**
 * Validate a bundle.
 */
export function validateBundle(
  bundle: Bundle,
  config: Partial<BundleConfig> = {},
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const cfg = { ...DEFAULT_BUNDLE_CONFIG, ...config };
  if (bundle.leituras.length === 0) {
    errors.push("bundle must have at least 1 leitura");
  }
  if (bundle.leituras.length > 50) {
    errors.push("bundle cannot have more than 50 leituras");
  }
  if (bundle.discountPct < 0 || bundle.discountPct > 50) {
    errors.push("discountPct must be 0-50");
  }
  if (bundle.finalPriceCents < 0) {
    errors.push("finalPriceCents must be >= 0");
  }
  if (bundle.type === "gift" && !bundle.recipient) {
    errors.push("gift bundle must have a recipient");
  }
  if (bundle.type === "group") {
    if (!bundle.groupShare) errors.push("group bundle must have groupShare");
    else if (
      bundle.groupShare.totalSlots < cfg.groupShareMinSlots ||
      bundle.groupShare.totalSlots > cfg.groupShareMaxSlots
    ) {
      errors.push("groupShare.totalSlots out of range");
    }
  }
  if (bundle.type === "subscription" && !bundle.subscription) {
    errors.push("subscription bundle must have subscription terms");
  }
  return { ok: errors.length === 0, errors };
}

/**
 * Compute average rating of a bundle from its leituras.
 */
export function computeBundleRating(bundle: Bundle): {
  average: number;
  totalReviews: number;
} {
  let weighted = 0;
  let totalReviews = 0;
  for (const l of bundle.leituras) {
    weighted += l.rating * l.reviewCount;
    totalReviews += l.reviewCount;
  }
  const average = totalReviews > 0 ? weighted / totalReviews : 0;
  return { average: Math.round(average * 100) / 100, totalReviews };
}

/**
 * Check if a bundle is redeemable at a given moment.
 */
export function isBundleRedeemable(bundle: Bundle, now: number): {
  redeemable: boolean;
  reason: string | null;
} {
  if (bundle.expiresAt !== null && now > bundle.expiresAt) {
    return { redeemable: false, reason: "expired" };
  }
  if (
    bundle.maxRedemptions !== null &&
    bundle.redemptions >= bundle.maxRedemptions
  ) {
    return { redeemable: false, reason: "max-redemptions-reached" };
  }
  if (bundle.type === "gift" && bundle.recipient?.scheduled) {
    if (
      bundle.recipient.deliveryAt !== null &&
      now < bundle.recipient.deliveryAt
    ) {
      return { redeemable: false, reason: "scheduled-for-future" };
    }
  }
  return { redeemable: true, reason: null };
}

/**
 * Summarize a bundle for display.
 */
export function summarizeBundle(bundle: Bundle): {
  type: string;
  itemCount: number;
  original: string;
  final: string;
  savings: string;
  rating: string;
} {
  const rating = computeBundleRating(bundle);
  return {
    type: bundle.type,
    itemCount: bundle.leituras.length,
    original: formatCents(bundle.basePriceCents),
    final: formatCents(bundle.finalPriceCents),
    savings: formatCents(bundle.savings),
    rating:
      rating.totalReviews > 0
        ? `${rating.average.toFixed(1)}★ (${rating.totalReviews})`
        : "sem avaliações",
  };
}

/**
 * Format cents as BRL string.
 */
export function formatCents(cents: number): string {
  const reais = cents / 100;
  return `R$ ${reais.toFixed(2).replace(".", ",")}`;
}
