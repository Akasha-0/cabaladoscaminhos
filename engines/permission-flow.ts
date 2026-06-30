/**
 * W71-B: Permission state machine + UX heuristics.
 *
 * Manages:
 *  - Detection of browser support (Notification API + Service Worker + PushManager)
 *  - UX cooldown rules (don't re-prompt within 7 days, max 3 dismissals)
 *  - Per-user persistent state (in-memory; production uses Prisma)
 *  - PushContext — decides WHICH notifications a user wants based on their
 *    spiritual-tradition interests (≥3 of 7 sacred traditions required to
 *    receive achievement/community/moderation alerts).
 */

import { auditServiceWorkerSupport } from './service-worker-registration.ts';

// ───────────────────────────────────────────────────────────────────────────
// Sacred traditions
// ───────────────────────────────────────────────────────────────────────────

export const SACRED_TRADITIONS = [
  'cigano',
  'orixas',
  'astrologia',
  'cabala',
  'numerologia',
  'tarot',
  'tantra',
] as const;

export type SacredTradition = (typeof SACRED_TRADITIONS)[number];

// Lookaround regex for sacred tradition boundary detection (cycle 60-70 lesson)
export const TRADITION_BOUNDARY_REGEX = new RegExp(
  `\\b(?:${SACRED_TRADITIONS.join('|')})\\b`,
  'i',
);

// ───────────────────────────────────────────────────────────────────────────
// Permission state
// ───────────────────────────────────────────────────────────────────────────

export type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

/**
 * Detect the current browser push support and permission state.
 *
 *  - 'unsupported' — missing Notification API or Service Worker
 *  - 'granted'     — Notification.permission === 'granted'
 *  - 'denied'      — Notification.permission === 'denied'
 *  - 'default'     — otherwise (initial state)
 */
export function getPermissionState(): PermissionState {
  const audit = auditServiceWorkerSupport();
  if (!audit.hasNavigatorServiceWorker || !audit.hasNotification) {
    return 'unsupported';
  }
  return audit.permission;
}

// ───────────────────────────────────────────────────────────────────────────
// UX cooldown
// ───────────────────────────────────────────────────────────────────────────

export const PROMPT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const MAX_DISMISSALS = 3;

export interface PromptHistory {
  /** Last time the prompt was shown (epoch ms) */
  lastPromptAt?: number;
  /** Last time the user dismissed the prompt (epoch ms) */
  dismissedAt?: number;
  /** Total dismissals so far */
  dismissedCount: number;
}

const historyStore: Map<string, PromptHistory> = new Map();

/** Clear all prompt history. Test-only. */
export function clearAllPromptHistory(): void {
  historyStore.clear();
}

/**
 * Decide whether to show the permission prompt right now.
 *
 * Rules:
 *  - 'unsupported' environments never show the prompt
 *  - After 3 dismissals, never re-prompt (permanent block)
 *  - After a recent prompt (< 7 days), don't re-prompt
 *  - Otherwise, OK to prompt
 */
export function shouldShowPermissionPrompt(
  userId: string,
  context?: { dismissedAt?: number; dismissedCount?: number; lastPromptAt?: number },
): boolean {
  if (typeof userId !== 'string' || userId.length === 0) {
    throw new TypeError('shouldShowPermissionPrompt: userId required');
  }
  if (getPermissionState() === 'unsupported') return false;
  if (getPermissionState() === 'denied') return false;
  if (getPermissionState() === 'granted') return false;

  const persisted = historyStore.get(userId) ?? { dismissedCount: 0 };
  const merged: PromptHistory = {
    lastPromptAt: context?.lastPromptAt ?? persisted.lastPromptAt,
    dismissedAt: context?.dismissedAt ?? persisted.dismissedAt,
    dismissedCount: context?.dismissedCount ?? persisted.dismissedCount,
  };

  if (merged.dismissedCount >= MAX_DISMISSALS) return false;

  if (merged.lastPromptAt && Date.now() - merged.lastPromptAt < PROMPT_COOLDOWN_MS) {
    return false;
  }
  return true;
}

/**
 * Record the user's response to the permission prompt.
 *
 *  - 'granted'  — resets dismissedCount, stores lastPromptAt
 *  - 'denied'   — stores dismissedAt + increments dismissedCount (capped at MAX_DISMISSALS)
 *  - 'dismissed' — same as denied but uses 'dismissed' label for analytics
 */
export function recordPromptResponse(
  userId: string,
  response: 'granted' | 'denied' | 'dismissed',
): void {
  if (typeof userId !== 'string' || userId.length === 0) {
    throw new TypeError('recordPromptResponse: userId required');
  }
  if (response !== 'granted' && response !== 'denied' && response !== 'dismissed') {
    throw new TypeError(`recordPromptResponse: invalid response "${response}"`);
  }

  const now = Date.now();
  const existing = historyStore.get(userId) ?? { dismissedCount: 0 };

  if (response === 'granted') {
    historyStore.set(userId, {
      ...existing,
      lastPromptAt: now,
      dismissedAt: undefined,
      dismissedCount: 0,
    });
    return;
  }

  // 'denied' or 'dismissed'
  const nextCount = Math.min(MAX_DISMISSALS, existing.dismissedCount + 1);
  historyStore.set(userId, {
    ...existing,
    lastPromptAt: now,
    dismissedAt: now,
    dismissedCount: nextCount,
  });
}

/**
 * Return structured cooldown info for the UI layer.
 */
export function getPromptCooldown(userId: string): {
  canPrompt: boolean;
  cooldownMs: number;
  reason: string;
} {
  if (typeof userId !== 'string' || userId.length === 0) {
    throw new TypeError('getPromptCooldown: userId required');
  }

  const state = getPermissionState();
  if (state === 'unsupported') {
    return { canPrompt: false, cooldownMs: 0, reason: 'browser_unsupported' };
  }
  if (state === 'denied') {
    return { canPrompt: false, cooldownMs: 0, reason: 'permission_denied' };
  }
  if (state === 'granted') {
    return { canPrompt: false, cooldownMs: 0, reason: 'already_granted' };
  }

  const persisted = historyStore.get(userId);
  if (!persisted) {
    return { canPrompt: true, cooldownMs: 0, reason: 'first_time' };
  }

  if (persisted.dismissedCount >= MAX_DISMISSALS) {
    return { canPrompt: false, cooldownMs: 0, reason: 'max_dismissals_reached' };
  }

  if (persisted.lastPromptAt) {
    const elapsed = Date.now() - persisted.lastPromptAt;
    const remaining = PROMPT_COOLDOWN_MS - elapsed;
    if (remaining > 0) {
      return { canPrompt: false, cooldownMs: remaining, reason: 'within_cooldown' };
    }
  }

  return { canPrompt: true, cooldownMs: 0, reason: 'ready' };
}

// ───────────────────────────────────────────────────────────────────────────
// PushContext — sacred-anchored notification routing
// ───────────────────────────────────────────────────────────────────────────

export interface PushContext {
  userId: string;
  /** Sacred traditions the user follows (≥3 of 7 to enable sacred alerts) */
  traditions: string[];
  /** Consecutive days with activity */
  streakDays: number;
  /** Total achievements unlocked */
  achievementsUnlocked: number;
  /** Active community circle memberships */
  communityMemberships: number;
}

export const SACRED_TRADITION_MIN = 3;
export const SACRED_TRADITION_MAX = SACRED_TRADITIONS.length;

export type NotificationCategory =
  | 'achievement'
  | 'community'
  | 'moderation'
  | 'streak'
  | 'tradition'
  | 'mention'
  | 'system';

export interface NotificationDecision {
  category: NotificationCategory;
  shouldSend: boolean;
  reason: string;
}

/**
 * Decide whether a notification category should be sent given the user's context.
 *
 * Sacred coverage rule: ≥3 of 7 traditions must be present before achievement,
 * community, or moderation alerts are allowed.
 */
export function decideNotification(
  ctx: PushContext,
  category: NotificationCategory,
): NotificationDecision {
  if (!ctx || typeof ctx.userId !== 'string' || ctx.userId.length === 0) {
    throw new TypeError('decideNotification: invalid context');
  }

  const validTraditions = ctx.traditions.filter((t) => isSacredTradition(t));
  const sacredCount = validTraditions.length;
  const meetsSacredMinimum = sacredCount >= SACRED_TRADITION_MIN;

  switch (category) {
    case 'achievement':
      if (!meetsSacredMinimum) {
        return {
          category,
          shouldSend: false,
          reason: `need ≥${SACRED_TRADITION_MIN} sacred traditions (have ${sacredCount})`,
        };
      }
      return { category, shouldSend: true, reason: 'sacred_interest_confirmed' };

    case 'community':
      if (ctx.communityMemberships === 0) {
        return { category, shouldSend: false, reason: 'no_community_memberships' };
      }
      if (!meetsSacredMinimum) {
        return {
          category,
          shouldSend: false,
          reason: `need ≥${SACRED_TRADITION_MIN} sacred traditions (have ${sacredCount})`,
        };
      }
      return { category, shouldSend: true, reason: 'community_member_with_sacred_interest' };

    case 'moderation':
      if (!meetsSacredMinimum) {
        return {
          category,
          shouldSend: false,
          reason: `need ≥${SACRED_TRADITION_MIN} sacred traditions (have ${sacredCount})`,
        };
      }
      return { category, shouldSend: true, reason: 'sacred_interest_confirmed' };

    case 'streak':
      if (ctx.streakDays < 3) {
        return { category, shouldSend: false, reason: 'streak_too_short' };
      }
      return { category, shouldSend: true, reason: 'streak_active' };

    case 'tradition':
      // Tradition-specific alerts only require ≥1 sacred tradition
      if (sacredCount < 1) {
        return { category, shouldSend: false, reason: 'no_sacred_tradition' };
      }
      return { category, shouldSend: true, reason: 'tradition_follower' };

    case 'mention':
      // Always send mentions — direct user-to-user signal
      return { category, shouldSend: true, reason: 'direct_mention' };

    case 'system':
      return { category, shouldSend: true, reason: 'system_alert' };

    default:
      return { category, shouldSend: false, reason: 'unknown_category' };
  }
}

/**
 * Validate that a string is one of the 7 sacred traditions.
 */
export function isSacredTradition(s: string): s is SacredTradition {
  return (SACRED_TRADITIONS as readonly string[]).includes(s);
}

/**
 * Normalize a list of traditions — drop non-sacred entries, dedupe, lowercase.
 */
export function normalizeTraditions(input: string[]): SacredTradition[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<SacredTradition>();
  const out: SacredTradition[] = [];
  for (const raw of input) {
    if (typeof raw !== 'string') continue;
    const norm = raw.toLowerCase().trim();
    if (!isSacredTradition(norm)) continue;
    if (seen.has(norm)) continue;
    seen.add(norm);
    out.push(norm);
  }
  return out;
}

/**
 * Sacred coverage audit — returns the count + missing list.
 */
export function auditSacredCoverage(traditions: string[]): {
  count: number;
  missing: SacredTradition[];
  meetsMinimum: boolean;
} {
  const valid = normalizeTraditions(traditions);
  const missing = SACRED_TRADITIONS.filter((t) => !valid.includes(t));
  return {
    count: valid.length,
    missing,
    meetsMinimum: valid.length >= SACRED_TRADITION_MIN,
  };
}

// ───────────────────────────────────────────────────────────────────────────
// Audit helpers
// ───────────────────────────────────────────────────────────────────────────

/**
 * Audit the prompt history store. For tests + ops dashboards.
 */
export function auditPromptHistory(): {
  totalUsers: number;
  perUser: Array<{ userId: string; dismissedCount: number; lastPromptAt?: number }>;
} {
  const perUser: Array<{ userId: string; dismissedCount: number; lastPromptAt?: number }> = [];
  for (const [userId, h] of historyStore) {
    perUser.push({
      userId,
      dismissedCount: h.dismissedCount,
      ...(h.lastPromptAt !== undefined ? { lastPromptAt: h.lastPromptAt } : {}),
    });
  }
  return {
    totalUsers: historyStore.size,
    perUser: perUser.sort((a, b) => b.dismissedCount - a.dismissedCount),
  };
}