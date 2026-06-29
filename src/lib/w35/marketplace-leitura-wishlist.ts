/**
 * marketplace-leitura-wishlist.ts
 *
 * Cycle 35 — Marketplace Leitura Wishlist + Price-Drop Alerts.
 *
 * Composes with:
 *   - src/lib/w31/marketplace-leitura.ts        (leitura listing core)
 *   - src/lib/w32/marketplace-reviews.ts        (ratings + reviews)
 *   - src/lib/w34/marketplace-leitura-discovery.ts (discovery feeds)
 *   - src/lib/w33/marketplace-checkout.ts       (cart + pricing)
 *
 * Pure TypeScript: no runtime imports from app code, no I/O, no DOM. All
 * timestamps are caller-supplied (`now`) so the module is deterministic
 * under test. Each public helper returns a fresh value or a fresh array.
 *
 * Responsibilities:
 *   1. Wishlist — add / remove / move-to-cart primitives with status
 *      (saved, purchased, archived).
 *   2. Price-drop alerts — when a leitura's price drops below the user's
 *      saved max, emit an alert. Cooldown prevents alert spam.
 *   3. Restock alerts — when an out-of-stock leitura comes back, emit.
 *   4. Recommendations — suggest leituras from the wishlist that are
 *      similar to items the user has reviewed positively.
 *   5. Summary — totals (saved, archived, alerts pending, last drop).
 */

// ---------- TYPES ----------------------------------------------------------

export type WishlistStatus = "saved" | "purchased" | "archived";

export type AlertKind = "price_drop" | "restock" | "review_milestone" | "new_format";

export interface WishlistItem {
  id: string;             // unique per (user, leitura)
  userId: string;
  leituraId: string;
  savedPriceCents: number;
  savedAt: number;
  notifyOnPriceDrop: boolean;
  notifyOnRestock: boolean;
  maxPriceCents: number;  // user-set ceiling
  status: WishlistStatus;
  movedToCartAt?: number;
  purchasedAt?: number;
  archivedAt?: number;
  tags: string[];
}

export interface LeituraSnapshot {
  leituraId: string;
  title: string;
  currentPriceCents: number;
  inStock: boolean;
  averageRating: number; // 0..5
  formats: ("video" | "audio" | "text" | "live")[];
}

export interface PriceAlert {
  id: string;
  userId: string;
  leituraId: string;
  kind: AlertKind;
  previousPriceCents: number;
  newPriceCents: number;
  triggeredAt: number;
  consumed: boolean;
  message: string;
}

export interface RestockAlert {
  id: string;
  userId: string;
  leituraId: string;
  triggeredAt: number;
  consumed: boolean;
}

export interface AlertCooldown {
  perItemHours: number;       // default 24
  globalPerUserHours: number; // default 1
}

export interface RecommendationScore {
  leituraId: string;
  score: number;       // 0..1
  reason: string;
}

export interface WishlistSummary {
  total: number;
  saved: number;
  purchased: number;
  archived: number;
  alertsPending: number;
  totalSavingsCents: number;
  lastDropAt: number | null;
  lastDropLeituraId: string | null;
}

// ---------- CONSTANTS -----------------------------------------------------

export const DEFAULT_ALERT_COOLDOWN: AlertCooldown = {
  perItemHours: 24,
  globalPerUserHours: 1,
};

export const PRICE_DROP_MIN_PCT = 0.05; // 5% drop minimum to count
export const PRICE_DROP_MIN_CENTS = 100; // R$1.00 minimum
export const MAX_WISHLIST_TAGS = 8;
export const MAX_TAG_LENGTH = 24;
export const RECOMMENDATION_LIMIT = 10;
export const MAX_PRICE_CENTS = 10_000_000; // R$100k sanity cap
export const MS_PER_HOUR = 60 * 60 * 1000;

// ---------- BUILDERS -----------------------------------------------------

export function buildWishlistItem(input: {
  id: string;
  userId: string;
  leituraId: string;
  currentPriceCents: number;
  maxPriceCents: number;
  now: number;
  tags?: string[];
  notifyOnPriceDrop?: boolean;
  notifyOnRestock?: boolean;
}): WishlistItem {
  return {
    id: input.id,
    userId: input.userId,
    leituraId: input.leituraId,
    savedPriceCents: input.currentPriceCents,
    savedAt: input.now,
    notifyOnPriceDrop: input.notifyOnPriceDrop ?? true,
    notifyOnRestock: input.notifyOnRestock ?? true,
    maxPriceCents: input.maxPriceCents,
    status: "saved",
    tags: sanitizeTags(input.tags ?? []),
  };
}

export function sanitizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of tags) {
    if (typeof t !== "string") continue;
    const trimmed = t.trim().slice(0, MAX_TAG_LENGTH);
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
    if (out.length >= MAX_WISHLIST_TAGS) break;
  }
  return out;
}

// ---------- CRUD ---------------------------------------------------------

export function addToWishlist(
  items: WishlistItem[],
  userId: string,
  leituraId: string,
  currentPriceCents: number,
  now: number,
  tags: string[] = []
): WishlistItem[] {
  const exists = items.find(
    (i) => i.userId === userId && i.leituraId === leituraId && i.status === "saved"
  );
  if (exists) return items;
  const newItem = buildWishlistItem({
    id: `${userId}::${leituraId}`,
    userId,
    leituraId,
    currentPriceCents,
    maxPriceCents: currentPriceCents,
    now,
    tags,
  });
  return [...items, newItem];
}

export function removeFromWishlist(
  items: WishlistItem[],
  userId: string,
  leituraId: string
): WishlistItem[] {
  return items.filter(
    (i) => !(i.userId === userId && i.leituraId === leituraId)
  );
}

export function archiveWishlistItem(
  items: WishlistItem[],
  userId: string,
  leituraId: string,
  now: number
): WishlistItem[] {
  return items.map((i) =>
    i.userId === userId && i.leituraId === leituraId
      ? { ...i, status: "archived", archivedAt: now }
      : i
  );
}

export function markPurchased(
  items: WishlistItem[],
  userId: string,
  leituraId: string,
  now: number
): WishlistItem[] {
  return items.map((i) =>
    i.userId === userId && i.leituraId === leituraId
      ? { ...i, status: "purchased", purchasedAt: now }
      : i
  );
}

export function moveToCart(
  items: WishlistItem[],
  userId: string,
  leituraId: string,
  now: number
): WishlistItem[] {
  return items.map((i) =>
    i.userId === userId && i.leituraId === leituraId
      ? { ...i, status: "archived", movedToCartAt: now }
      : i
  );
}

export function findWishlistItem(
  items: WishlistItem[],
  userId: string,
  leituraId: string
): WishlistItem | null {
  return (
    items.find(
      (i) => i.userId === userId && i.leituraId === leituraId && i.status === "saved"
    ) ?? null
  );
}

export function listSaved(
  items: WishlistItem[],
  userId: string
): WishlistItem[] {
  return items.filter((i) => i.userId === userId && i.status === "saved");
}

// ---------- PRICE-DROP + ALERTS ------------------------------------------

export interface PriceDropResult {
  newAlert: PriceAlert | null;
  cooldownActive: boolean;
  pctDrop: number;
  centsDrop: number;
}

export function evaluatePriceDrop(
  item: WishlistItem,
  leitura: LeituraSnapshot,
  now: number,
  recentAlerts: PriceAlert[],
  cooldown: AlertCooldown = DEFAULT_ALERT_COOLDOWN
): PriceDropResult {
  if (!item.notifyOnPriceDrop) {
    return { newAlert: null, cooldownActive: false, pctDrop: 0, centsDrop: 0 };
  }
  const prev = item.savedPriceCents;
  const next = leitura.currentPriceCents;
  if (next >= prev) {
    return { newAlert: null, cooldownActive: false, pctDrop: 0, centsDrop: 0 };
  }
  const centsDrop = prev - next;
  const pctDrop = centsDrop / prev;
  if (pctDrop < PRICE_DROP_MIN_PCT || centsDrop < PRICE_DROP_MIN_CENTS) {
    return { newAlert: null, cooldownActive: false, pctDrop, centsDrop };
  }
  // Check cooldown — recent alert on same leitura within perItemHours
  const perItemCutoff = now - cooldown.perItemHours * MS_PER_HOUR;
  const globalCutoff = now - cooldown.globalPerUserHours * MS_PER_HOUR;
  let lastGlobal: PriceAlert | null = null;
  for (const a of recentAlerts) {
    if (a.userId !== item.userId) continue;
    if (a.triggeredAt < globalCutoff) continue;
    if (a.consumed) continue;
    if (!lastGlobal || a.triggeredAt > lastGlobal.triggeredAt) {
      lastGlobal = a;
    }
  }
  const perItem = recentAlerts.find(
    (a) =>
      a.userId === item.userId &&
      a.leituraId === item.leituraId &&
      a.kind === "price_drop" &&
      a.triggeredAt >= perItemCutoff
  );
  if (perItem || lastGlobal) {
    return { newAlert: null, cooldownActive: true, pctDrop, centsDrop };
  }
  const alert: PriceAlert = {
    id: `${item.userId}::${item.leituraId}::${now}::drop`,
    userId: item.userId,
    leituraId: item.leituraId,
    kind: "price_drop",
    previousPriceCents: prev,
    newPriceCents: next,
    triggeredAt: now,
    consumed: false,
    message: `Preço caiu ${(pctDrop * 100).toFixed(0)}% — R$${(
      next / 100
    ).toFixed(2)} (era R$${(prev / 100).toFixed(2)})`,
  };
  return { newAlert: alert, cooldownActive: false, pctDrop, centsDrop };
}

export function evaluateRestock(
  item: WishlistItem,
  leitura: LeituraSnapshot,
  now: number,
  previousInStock: boolean,
  recentAlerts: RestockAlert[]
): RestockAlert | null {
  if (!item.notifyOnRestock) return null;
  if (previousInStock || !leitura.inStock) return null;
  const dedup = recentAlerts.find(
    (a) =>
      a.userId === item.userId &&
      a.leituraId === item.leituraId &&
      now - a.triggeredAt < 24 * MS_PER_HOUR
  );
  if (dedup) return null;
  return {
    id: `${item.userId}::${item.leituraId}::${now}::restock`,
    userId: item.userId,
    leituraId: item.leituraId,
    triggeredAt: now,
    consumed: false,
  };
}

// ---------- RECOMMENDATIONS ---------------------------------------------

export function recommendFromWishlist(
  items: WishlistItem[],
  userId: string,
  candidates: LeituraSnapshot[],
  reviewedLeituraIds: string[],
  now: number
): RecommendationScore[] {
  const saved = listSaved(items, userId);
  const savedIds = new Set(saved.map((i) => i.leituraId));
  const recentSaved = saved
    .filter((i) => now - i.savedAt < 90 * 24 * MS_PER_HOUR)
    .map((i) => i.tags)
    .flat();
  const reviewedSet = new Set(reviewedLeituraIds);
  const scores: RecommendationScore[] = [];
  for (const c of candidates) {
    if (savedIds.has(c.leituraId)) continue;
    if (!c.inStock) continue;
    let score = 0;
    let reason = "discovery";
    const tagMatches = (c as unknown as { tags?: string[] }).tags;
    if (Array.isArray(tagMatches)) {
      for (const t of tagMatches) {
        if (recentSaved.includes(t)) score += 0.3;
      }
    }
    if (c.averageRating >= 4.5) {
      score += 0.2;
      reason = "highly rated";
    }
    if (reviewedSet.has(c.leituraId)) {
      score += 0.25;
      reason = "similar to your reviews";
    }
    if (c.formats.length > 1) {
      score += 0.05;
    }
    if (score > 0) scores.push({ leituraId: c.leituraId, score: round2(Math.min(1, score)), reason });
  }
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, RECOMMENDATION_LIMIT);
}

// ---------- SUMMARY -----------------------------------------------------

export function summarizeWishlist(
  items: WishlistItem[],
  userId: string,
  alerts: PriceAlert[]
): WishlistSummary {
  const userItems = items.filter((i) => i.userId === userId);
  const userAlerts = alerts.filter((a) => a.userId === userId && !a.consumed);
  let totalSavings = 0;
  let lastDropAt: number | null = null;
  let lastDropLeituraId: string | null = null;
  for (const a of userAlerts) {
    if (a.kind !== "price_drop") continue;
    const saving = a.previousPriceCents - a.newPriceCents;
    if (saving > 0) totalSavings += saving;
    if (lastDropAt === null || a.triggeredAt > lastDropAt) {
      lastDropAt = a.triggeredAt;
      lastDropLeituraId = a.leituraId;
    }
  }
  return {
    total: userItems.length,
    saved: userItems.filter((i) => i.status === "saved").length,
    purchased: userItems.filter((i) => i.status === "purchased").length,
    archived: userItems.filter((i) => i.status === "archived").length,
    alertsPending: userAlerts.length,
    totalSavingsCents: totalSavings,
    lastDropAt,
    lastDropLeituraId,
  };
}

// ---------- INTERNAL -----------------------------------------------------

function round2(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}
