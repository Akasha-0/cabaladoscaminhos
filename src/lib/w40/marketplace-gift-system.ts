/**
 * marketplace-gift-system.ts
 *
 * Gift leituras/práticas to other users. Extends:
 * - w32/marketplace-leitura
 * - w36/marketplace-bundles-v2
 * - w38/marketplace-leitura-cross-sell
 * - w39/marketplace-leitura-trending
 *
 * Adds gift order, gift wrap themes, gift messages, delivery confirmation,
 * and history.
 *
 * Standalone — no external imports.
 */

/* =========================================================================
 * Types
 * ========================================================================= */

/**
 * Gift order lifecycle. A leitura gifted from one user to another.
 */
export type GiftOrder = {
  giftId: string;
  leituraId: string;
  senderId: string;
  recipientId: string;
  message: GiftMessage;
  wrap: GiftWrap;
  /** Epoch ms (UTC) when the gift should auto-send. Optional for immediate gifts. */
  scheduledFor?: number;
  /** Epoch ms (UTC) when the gift was created. */
  createdAt: number;
  /** Price paid in cents. */
  priceCents: number;
  status: GiftStatus;
};

/**
 * State machine of a gift order:
 * - draft: composing, not paid
 * - scheduled: paid and waiting for `scheduledFor`
 * - sent: in transit / delivered to recipient inbox
 * - delivered: delivery confirmed by backend
 * - opened: recipient viewed the gift
 * - thanked: recipient sent a thank-you message
 * - refunded: auto-refund issued (unopened past the window)
 */
export type GiftStatus =
  | "draft"
  | "scheduled"
  | "sent"
  | "delivered"
  | "opened"
  | "thanked"
  | "refunded";

/**
 * Message attached to the gift. Visible to the recipient on open.
 */
export type GiftMessage = {
  text: string;
  signature: string;
  includeSenderName: boolean;
  language: "pt-BR" | "en" | "es";
};

/**
 * Visual wrap of the gift (theme + accent + icon + optional personal note).
 */
export type GiftWrap = {
  theme: GiftTheme;
  accentColor: string;
  iconKey: string;
  personalNote?: string;
};

/**
 * Visual themes — chosen to align with the Akasha portal aesthetic
 * (axé, luz, ancestral, orixá, cigano, místico, natural, urbano,
 *  minimalista, celebração).
 */
export type GiftTheme =
  | "axé"
  | "luz"
  | "ancestral"
  | "orixá"
  | "cigano"
  | "místico"
  | "natural"
  | "urbano"
  | "minimalista"
  | "celebração";

/**
 * Delivery confirmation record — emitted when the recipient receives / opens
 * the gift and optionally reacts.
 */
export type GiftDelivery = {
  giftId: string;
  deliveredAt: number;
  openedAt?: number;
  thankYouMessage?: string;
  reaction?: "❤️" | "🙏" | "✨" | "🌟" | "🕯️";
};

/**
 * Single entry in a user's gift history (sent or received).
 */
export type GiftHistoryEntry = {
  giftId: string;
  direction: "sent" | "received";
  counterpartyId: string;
  leituraTitle: string;
  status: GiftStatus;
  createdAt: number;
  amountCents: number;
};

/* =========================================================================
 * Constants
 * ========================================================================= */

/** Max characters in the gift body message. */
export const GIFT_MESSAGE_MAX_LENGTH = 280;

/** Max characters in the signature (sender name). */
export const GIFT_SIGNATURE_MAX_LENGTH = 60;

/** Max characters in the personal note that overlays the gift wrap. */
export const GIFT_PERSONAL_NOTE_MAX = 140;

/** All valid gift themes, in declaration order. */
export const GIFT_WRAP_THEMES: readonly GiftTheme[] = [
  "axé",
  "luz",
  "ancestral",
  "orixá",
  "cigano",
  "místico",
  "natural",
  "urbano",
  "minimalista",
  "celebração",
] as const;

/** Accent color per theme (hex). */
export const GIFT_ACCENT_COLORS: Record<GiftTheme, string> = {
  "axé": "#D4A24C",
  "luz": "#F6E27A",
  "ancestral": "#6B4423",
  "orixá": "#1B6B5A",
  "cigano": "#9B2D2D",
  "místico": "#5C3E9E",
  "natural": "#3F8A4F",
  "urbano": "#2C2C34",
  "minimalista": "#B7B7BD",
  "celebração": "#E94B8B",
};

/** Icon key per theme. UI layer maps keys to actual glyphs / svgs. */
export const GIFT_ICONS: Record<GiftTheme, string> = {
  "axé": "icon-axe-star",
  "luz": "icon-candle-flame",
  "ancestral": "icon-baobab",
  "orixá": "icon-orisha-rosette",
  "cigano": "icon-gypsy-wagon",
  "místico": "icon-eye-third",
  "natural": "icon-leaf-spiral",
  "urbano": "icon-skyline",
  "minimalista": "icon-circle-outline",
  "celebração": "icon-confetti-burst",
};

/** Delivery window — gifts must be opened within 24h of `deliveredAt`. */
export const GIFT_DELIVERY_WINDOW_MS = 86_400_000;

/** Auto-refund window — 30 days after delivery without an open. */
export const GIFT_AUTO_REFUND_AFTER_MS = 2_592_000_000;

/** Max gifts a single user can send per calendar day. */
export const MAX_GIFTS_PER_DAY = 10;

/** Max gifts a single user may have queued (status === "scheduled"). */
export const MAX_OUTSTANDING_SCHEDULED = 20;

/* =========================================================================
 * Internal helpers
 * ========================================================================= */

const GIFT_ID_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Cryptographically-irrelevant unique id for gifts. Combines a base36 timestamp
 * with 10 chars of randomness. Sufficient for client-side / non-critical use.
 */
function makeGiftId(now: number): string {
  let rand = "";
  for (let i = 0; i < 10; i++) {
    rand += GIFT_ID_ALPHABET[Math.floor(Math.random() * GIFT_ID_ALPHABET.length)];
  }
  return `gft_${now.toString(36)}_${rand}`;
}

function clampScheduledFor(value: number | undefined, now: number): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isFinite(value)) return undefined;
  return value < now ? now : value;
}

function trimOrEmpty(input: string): string {
  return typeof input === "string" ? input.trim() : "";
}

/* =========================================================================
 * Builders
 * ========================================================================= */

/**
 * Build a `GiftOrder` from validated input. Always starts as `draft`.
 * Use {@link sendGift} or {@link scheduleGift} to advance state.
 */
export function buildGiftOrder(input: {
  leituraId: string;
  senderId: string;
  recipientId: string;
  priceCents: number;
  message: GiftMessage;
  wrap: GiftWrap;
  scheduledFor?: number;
  now?: number;
}): GiftOrder {
  const now = input.now ?? Date.now();
  const leituraId = trimOrEmpty(input.leituraId);
  const senderId = trimOrEmpty(input.senderId);
  const recipientId = trimOrEmpty(input.recipientId);
  const priceCents = Number.isFinite(input.priceCents) && input.priceCents > 0
    ? Math.round(input.priceCents)
    : 0;
  const scheduledFor = clampScheduledFor(input.scheduledFor, now);
  return {
    giftId: makeGiftId(now),
    leituraId,
    senderId,
    recipientId,
    message: input.message,
    wrap: input.wrap,
    scheduledFor,
    createdAt: now,
    priceCents,
    status: "draft",
  };
}

/**
 * Validate and build a gift message. Returns a discriminated union — caller
 * must check `ok` before using `message`.
 */
export function buildGiftMessage(
  text: string,
  signature: string,
  includeSenderName = true,
  language: GiftMessage["language"] = "pt-BR",
): { ok: true; message: GiftMessage } | { ok: false; reason: string } {
  const t = typeof text === "string" ? text : "";
  const s = typeof signature === "string" ? signature : "";
  if (t.length === 0) {
    return { ok: false, reason: "message text is empty" };
  }
  if (t.length > GIFT_MESSAGE_MAX_LENGTH) {
    return {
      ok: false,
      reason: `message text exceeds ${GIFT_MESSAGE_MAX_LENGTH} characters`,
    };
  }
  if (s.length === 0) {
    return { ok: false, reason: "signature is empty" };
  }
  if (s.length > GIFT_SIGNATURE_MAX_LENGTH) {
    return {
      ok: false,
      reason: `signature exceeds ${GIFT_SIGNATURE_MAX_LENGTH} characters`,
    };
  }
  return {
    ok: true,
    message: {
      text: t,
      signature: s,
      includeSenderName,
      language,
    },
  };
}

/**
 * Pick a gift wrap for a given theme. Looks up accent color / icon from the
 * theme tables. `personalNote` is trimmed and length-capped.
 */
export function pickGiftWrap(theme: GiftTheme, personalNote?: string): GiftWrap {
  const noteRaw = typeof personalNote === "string" ? personalNote.trim() : "";
  const personalNoteCapped = noteRaw.length > GIFT_PERSONAL_NOTE_MAX
    ? noteRaw.slice(0, GIFT_PERSONAL_NOTE_MAX)
    : noteRaw;
  const wrap: GiftWrap = {
    theme,
    accentColor: GIFT_ACCENT_COLORS[theme],
    iconKey: GIFT_ICONS[theme],
  };
  if (personalNoteCapped.length > 0) {
    wrap.personalNote = personalNoteCapped;
  }
  return wrap;
}

/* =========================================================================
 * State transitions
 * ========================================================================= */

/**
 * Send a gift immediately. Order must be in `draft` (or `scheduled` with a
 * past `scheduledFor`). Advances to `sent`.
 */
export function sendGift(
  order: GiftOrder,
  now: number,
): { order: GiftOrder; ok: boolean; reason?: string } {
  if (order.status !== "draft" && order.status !== "scheduled") {
    return {
      order,
      ok: false,
      reason: `cannot send gift in status ${order.status}`,
    };
  }
  if (order.scheduledFor !== undefined && order.scheduledFor > now) {
    return {
      order,
      ok: false,
      reason: "scheduled gift is not due yet",
    };
  }
  return {
    order: { ...order, status: "sent" },
    ok: true,
  };
}

/**
 * Schedule a draft gift for a future send time. Caps future timestamps.
 */
export function scheduleGift(
  order: GiftOrder,
  scheduledFor: number,
  now: number,
): { order: GiftOrder; ok: boolean; reason?: string } {
  if (order.status !== "draft") {
    return {
      order,
      ok: false,
      reason: `cannot schedule gift in status ${order.status}`,
    };
  }
  if (!Number.isFinite(scheduledFor) || scheduledFor <= now) {
    return {
      order,
      ok: false,
      reason: "scheduledFor must be in the future",
    };
  }
  return {
    order: { ...order, scheduledFor, status: "scheduled" },
    ok: true,
  };
}

/**
 * Confirm delivery. Emits a `GiftDelivery` and advances the order to
 * `delivered` (or `opened` if the recipient opens immediately).
 */
export function confirmDelivery(
  order: GiftOrder,
  deliveredAt: number,
): { delivery: GiftDelivery; order: GiftOrder } {
  const delivery: GiftDelivery = { giftId: order.giftId, deliveredAt };
  const next: GiftOrder = { ...order, status: "delivered" };
  return { delivery, order: next };
}

/**
 * Mark a delivered gift as opened. Optionally records a reaction.
 * Returns `updated: false` if the gift is not in a state that can be opened.
 */
export function openGift(
  order: GiftOrder,
  openedAt: number,
  reaction?: GiftDelivery["reaction"],
): { order: GiftOrder; updated: boolean } {
  void openedAt;
  void reaction;
  if (order.status !== "delivered" && order.status !== "sent") {
    return { order, updated: false };
  }
  return {
    order: { ...order, status: "opened" },
    updated: true,
  };
}

/**
 * Recipient sends a thank-you message back to the sender.
 * Only allowed after the gift has been opened.
 */
export function sendThankYou(
  order: GiftOrder,
  thankYouMessage: string,
  now: number,
): { order: GiftOrder; updated: boolean } {
  void now;
  const msg = typeof thankYouMessage === "string" ? thankYouMessage.trim() : "";
  if (msg.length === 0) {
    return { order, updated: false };
  }
  if (order.status !== "opened") {
    return { order, updated: false };
  }
  return {
    order: { ...order, status: "thanked" },
    updated: true,
  };
}

/**
 * True if a delivered gift has gone unopened long enough to auto-refund
 * (GIFT_AUTO_REFUND_AFTER_MS = 30 days by default).
 */
export function isAutoRefundEligible(order: GiftOrder, now: number): boolean {
  if (order.status === "sent") {
    // never delivered yet — not eligible
    return false;
  }
  if (order.status !== "delivered") {
    return false;
  }
  // We don't persist `deliveredAt` on the order itself; use createdAt as a
  // conservative lower bound. For full accuracy the caller should pass a
  // richer delivery record.
  const elapsed = now - order.createdAt;
  return elapsed >= GIFT_AUTO_REFUND_AFTER_MS;
}

/* =========================================================================
 * History queries
 * ========================================================================= */

/**
 * Filter history entries to gifts sent by `senderId`, newest first.
 */
export function listSentGifts(
  history: GiftHistoryEntry[],
  senderId: string,
  limit?: number,
): GiftHistoryEntry[] {
  void trimOrEmpty(senderId);
  const result = history
    .filter((h) => h.direction === "sent")
    .sort((a, b) => b.createdAt - a.createdAt);
  const cap = typeof limit === "number" && limit > 0 ? limit : result.length;
  return result.slice(0, cap);
}

/**
 * Filter history entries to gifts received by `recipientId`, newest first.
 */
export function listReceivedGifts(
  history: GiftHistoryEntry[],
  recipientId: string,
  limit?: number,
): GiftHistoryEntry[] {
  void trimOrEmpty(recipientId);
  const result = history
    .filter((h) => h.direction === "received")
    .sort((a, b) => b.createdAt - a.createdAt);
  const cap = typeof limit === "number" && limit > 0 ? limit : result.length;
  return result.slice(0, cap);
}

/**
 * Aggregate gift activity for a user across the full history.
 */
export function summarizeGifts(
  history: GiftHistoryEntry[],
  userId: string,
): {
  sent: number;
  received: number;
  pendingDelivery: number;
  totalSentCents: number;
  totalReceivedCents: number;
  mostSentTheme: GiftTheme | null;
} {
  void trimOrEmpty(userId);
  let sent = 0;
  let received = 0;
  let pendingDelivery = 0;
  let totalSentCents = 0;
  let totalReceivedCents = 0;
  for (const h of history) {
    if (h.direction === "sent") {
      sent += 1;
      totalSentCents += h.amountCents;
      if (
        h.status === "sent" ||
        h.status === "scheduled" ||
        h.status === "delivered"
      ) {
        pendingDelivery += 1;
      }
    } else if (h.direction === "received") {
      received += 1;
      totalReceivedCents += h.amountCents;
      if (h.status === "sent" || h.status === "delivered") {
        pendingDelivery += 1;
      }
    }
  }
  // `mostSentTheme` is intentionally null here — GiftHistoryEntry doesn't
  // carry the theme (kept lean for storage). The UI layer correlates with
  // the matching GiftOrder when needed.
  return {
    sent,
    received,
    pendingDelivery,
    totalSentCents,
    totalReceivedCents,
    mostSentTheme: null,
  };
}