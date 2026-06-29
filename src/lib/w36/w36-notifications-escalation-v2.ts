/**
 * w36/notifications-escalation-v2.ts
 *
 * PATCH of w36/notifications-escalation.ts (cycle 36 audit fix #4).
 *
 * **Bug fixed (Verifier cycle 36 audit, non-blocking nit):**
 *   - `identifyStaleReason(notification, now)` declared `now: number` and
 *     then immediately did `void now; return null;` at the end. The function
 *     name implies a time-based decision, but the body was purely stateful
 *     and ignored `now` entirely. The `void now;` was a band-aid to silence
 *     unused-parameter warnings.
 *   - v2 makes the function honor its time-based name: it now uses `now`
 *     to compare against `STALE_THRESHOLDS[reason]`. A notification in the
 *     "unread" / "unanswered" / "unactioned" / etc. state is only considered
 *     stale if its age (in minutes) has crossed the threshold for that
 *     reason. Fresh-but-unread notifications correctly return `null`.
 *
 * **Compatibility:** the function returns `null` for fresh-but-unread
 * notifications where v1 returned `"unread"`. This is the intended behavior
 * change — callers that simply escalate on any non-null return will get
 * fewer escalations, which is correct.
 *
 * Pure TS, no runtime imports. Safe to import from server / edge / tests.
 *
 * Composes (same as v1):
 *   - w29/notifications-webpush (raw push delivery)
 *   - w35/notifications-digest-mode (digest bundling + quiet hours)
 *   - w32/push-prefs-ui (per-channel user preferences)
 *   - w34/comments-moderation-appeals (priority + SLA)
 */

// ============================================================================
// TYPES
// ============================================================================

export type NotificationCategory =
  | "social" // likes, follows, mentions
  | "comment" // replies, threads
  | "mentorship" // session, action item
  | "marketplace" // purchase, gift, leitura
  | "moderation" // appeal, warning, suspension
  | "system" // account, security
  | "promo"; // promotional

export type NotificationPriority = "low" | "normal" | "high" | "urgent";

export type StaleReason =
  | "unread"
  | "unanswered"
  | "unactioned"
  | "appeal-pending"
  | "session-soon"
  | "purchase-pending";

export type EscalationChannel = "in-app" | "email" | "push" | "sms" | "phone";

export type EscalationStep = {
  afterMinutes: number; // minutes since original send
  channel: EscalationChannel;
  reason: string;
  template: string;
  requireOnline: boolean;
};

export type EscalationPolicy = {
  category: NotificationCategory;
  priority: NotificationPriority;
  maxSteps: number;
  steps: EscalationStep[];
  stopOnAction: boolean;
  stopOnAck: boolean;
  coolDownMinutes: number;
};

export type Notification = {
  id: string;
  userId: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  body: string;
  createdAt: number;
  firstDeliveredAt: number | null;
  readAt: number | null;
  actedAt: number | null; // any action: reply, click, accept
  ackedAt: number | null; // explicit dismiss
  lastEscalatedAt: number | null;
  escalationStep: number; // 0 = original, 1+ = escalated
  channel: EscalationChannel;
  policy: EscalationPolicy;
  meta: Record<string, string | number>;
};

export type EscalationDecision = {
  notificationId: string;
  shouldEscalate: boolean;
  nextStep: number;
  channel: EscalationChannel;
  reason: string;
  scheduledFor: number; // epoch ms
};

export type EscalationBatchResult = {
  processedAt: number;
  totalConsidered: number;
  escalated: number;
  held: number;
  stopped: number;
  decisions: EscalationDecision[];
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEFAULT_ESCALATION_POLICIES: Record<
  NotificationCategory,
  EscalationPolicy
> = {
  social: {
    category: "social",
    priority: "low",
    maxSteps: 1,
    stopOnAction: true,
    stopOnAck: true,
    coolDownMinutes: 60,
    steps: [
      {
        afterMinutes: 240, // 4 hours
        channel: "in-app",
        reason: "reminder",
        template: "social.reminder",
        requireOnline: false,
      },
    ],
  },
  comment: {
    category: "comment",
    priority: "normal",
    maxSteps: 2,
    stopOnAction: true,
    stopOnAck: true,
    coolDownMinutes: 30,
    steps: [
      {
        afterMinutes: 60,
        channel: "in-app",
        reason: "replied-thread",
        template: "comment.thread-reminder",
        requireOnline: false,
      },
      {
        afterMinutes: 360, // 6 hours
        channel: "push",
        reason: "still-unread",
        template: "comment.unread-push",
        requireOnline: true,
      },
    ],
  },
  mentorship: {
    category: "mentorship",
    priority: "high",
    maxSteps: 3,
    stopOnAction: true,
    stopOnAck: true,
    coolDownMinutes: 15,
    steps: [
      {
        afterMinutes: 15,
        channel: "in-app",
        reason: "session-soon",
        template: "mentorship.session-soon",
        requireOnline: false,
      },
      {
        afterMinutes: 60,
        channel: "push",
        reason: "missed-action-item",
        template: "mentorship.action-item-due",
        requireOnline: true,
      },
      {
        afterMinutes: 1440, // 24h
        channel: "email",
        reason: "unack-action-item",
        template: "mentorship.action-item-overdue",
        requireOnline: false,
      },
    ],
  },
  marketplace: {
    category: "marketplace",
    priority: "normal",
    maxSteps: 2,
    stopOnAction: true,
    stopOnAck: true,
    coolDownMinutes: 60,
    steps: [
      {
        afterMinutes: 120,
        channel: "email",
        reason: "purchase-pending",
        template: "marketplace.checkout-reminder",
        requireOnline: false,
      },
      {
        afterMinutes: 720, // 12h
        channel: "push",
        reason: "leitura-soon",
        template: "marketplace.leitura-starting",
        requireOnline: true,
      },
    ],
  },
  moderation: {
    category: "moderation",
    priority: "urgent",
    maxSteps: 3,
    stopOnAction: false, // mods shouldn't stop escalation on user action
    stopOnAck: true,
    coolDownMinutes: 30,
    steps: [
      {
        afterMinutes: 30,
        channel: "push",
        reason: "appeal-pending",
        template: "moderation.appeal-pending",
        requireOnline: false,
      },
      {
        afterMinutes: 180,
        channel: "email",
        reason: "appeal-pending-escalation",
        template: "moderation.appeal-escalation",
        requireOnline: false,
      },
      {
        afterMinutes: 720,
        channel: "sms",
        reason: "final-warning",
        template: "moderation.final-warning",
        requireOnline: false,
      },
    ],
  },
  system: {
    category: "system",
    priority: "urgent",
    maxSteps: 2,
    stopOnAction: true,
    stopOnAck: false,
    coolDownMinutes: 5,
    steps: [
      {
        afterMinutes: 5,
        channel: "push",
        reason: "security-alert",
        template: "system.security",
        requireOnline: false,
      },
      {
        afterMinutes: 30,
        channel: "email",
        reason: "security-alert-fallback",
        template: "system.security-fallback",
        requireOnline: false,
      },
    ],
  },
  promo: {
    category: "promo",
    priority: "low",
    maxSteps: 1,
    stopOnAction: true,
    stopOnAck: true,
    coolDownMinutes: 1440,
    steps: [
      {
        afterMinutes: 4320, // 3 days
        channel: "email",
        reason: "promo-reminder",
        template: "promo.weekly-digest",
        requireOnline: false,
      },
    ],
  },
};

export const STALE_THRESHOLDS: Record<StaleReason, number> = {
  unread: 60,
  unanswered: 240,
  unactioned: 120,
  "appeal-pending": 60,
  "session-soon": 15,
  "purchase-pending": 90,
};

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Determine why a notification is considered stale.
 *
 * v2 fix: now honors its time-based name. Each candidate reason is checked
 * against `STALE_THRESHOLDS[reason]` (in minutes) — only cross-threshold
 * notifications are considered stale. Fresh-but-unread notifications return
 * `null` instead of `"unread"`.
 */
export function identifyStaleReason(
  notification: Notification,
  now: number,
): StaleReason | null {
  const ageMs = Math.max(0, now - notification.createdAt);
  const ageMin = Math.floor(ageMs / (60 * 1000));

  // Urgent priority bypasses age threshold — always considered stale
  // if not yet acted on / read.
  if (notification.policy.priority === "urgent") {
    if (notification.actedAt === null) return "unactioned";
    if (notification.readAt === null) return "unread";
  }
  if (notification.category === "comment" && notification.actedAt === null) {
    return ageMin >= STALE_THRESHOLDS.unanswered ? "unanswered" : null;
  }
  if (notification.category === "mentorship" && notification.actedAt === null) {
    return ageMin >= STALE_THRESHOLDS["session-soon"] ? "session-soon" : null;
  }
  if (
    notification.category === "marketplace" &&
    notification.actedAt === null
  ) {
    return ageMin >= STALE_THRESHOLDS["purchase-pending"]
      ? "purchase-pending"
      : null;
  }
  if (
    notification.category === "moderation" &&
    notification.actedAt === null
  ) {
    return ageMin >= STALE_THRESHOLDS["appeal-pending"] ? "appeal-pending" : null;
  }
  if (notification.readAt === null && notification.actedAt === null) {
    return ageMin >= STALE_THRESHOLDS.unread ? "unread" : null;
  }
  if (notification.actedAt === null) {
    return ageMin >= STALE_THRESHOLDS.unactioned ? "unactioned" : null;
  }
  return null;
}

/**
 * Compute how many minutes have passed since the notification was created.
 */
export function ageMinutes(notification: Notification, now: number): number {
  return Math.floor((now - notification.createdAt) / (60 * 1000));
}

/**
 * Compute the next escalation step for a stale notification.
 */
export function computeNextStep(
  notification: Notification,
  now: number,
): EscalationDecision {
  const reason = identifyStaleReason(notification, now);
  const policy = notification.policy;
  const nextStep = notification.escalationStep + 1;

  // Stop conditions
  if (notification.ackedAt !== null && policy.stopOnAck) {
    return {
      notificationId: notification.id,
      shouldEscalate: false,
      nextStep: notification.escalationStep,
      channel: notification.channel,
      reason: "acked",
      scheduledFor: now,
    };
  }
  if (notification.actedAt !== null && policy.stopOnAction) {
    return {
      notificationId: notification.id,
      shouldEscalate: false,
      nextStep: notification.escalationStep,
      channel: notification.channel,
      reason: "acted",
      scheduledFor: now,
    };
  }
  if (nextStep > policy.maxSteps) {
    return {
      notificationId: notification.id,
      shouldEscalate: false,
      nextStep: notification.escalationStep,
      channel: notification.channel,
      reason: "max-steps-reached",
      scheduledFor: now,
    };
  }
  if (reason === null) {
    return {
      notificationId: notification.id,
      shouldEscalate: false,
      nextStep: notification.escalationStep,
      channel: notification.channel,
      reason: "not-stale",
      scheduledFor: now,
    };
  }

  const step = policy.steps[nextStep - 1];
  if (!step) {
    return {
      notificationId: notification.id,
      shouldEscalate: false,
      nextStep: notification.escalationStep,
      channel: notification.channel,
      reason: "no-step-configured",
      scheduledFor: now,
    };
  }
  const minutes = ageMinutes(notification, now);
  if (minutes < step.afterMinutes) {
    return {
      notificationId: notification.id,
      shouldEscalate: false,
      nextStep: notification.escalationStep,
      channel: step.channel,
      reason: "too-soon",
      scheduledFor:
        notification.createdAt + step.afterMinutes * 60 * 1000,
    };
  }

  // Cooldown check
  if (notification.lastEscalatedAt !== null) {
    const elapsedMin =
      (now - notification.lastEscalatedAt) / (60 * 1000);
    if (elapsedMin < policy.coolDownMinutes) {
      return {
        notificationId: notification.id,
        shouldEscalate: false,
        nextStep: notification.escalationStep,
        channel: step.channel,
        reason: "cooldown",
        scheduledFor:
          notification.lastEscalatedAt + policy.coolDownMinutes * 60 * 1000,
      };
    }
  }

  return {
    notificationId: notification.id,
    shouldEscalate: true,
    nextStep,
    channel: step.channel,
    reason: step.reason,
    scheduledFor: now,
  };
}

/**
 * Process a batch of notifications and return escalation decisions.
 */
export function processEscalationBatch(
  notifications: Notification[],
  now: number,
): EscalationBatchResult {
  let escalated = 0;
  let held = 0;
  let stopped = 0;
  const decisions: EscalationDecision[] = [];

  for (const n of notifications) {
    const decision = computeNextStep(n, now);
    decisions.push(decision);
    if (decision.shouldEscalate) escalated++;
    else if (
      decision.reason === "acted" ||
      decision.reason === "acked" ||
      decision.reason === "max-steps-reached"
    )
      stopped++;
    else held++;
  }

  return {
    processedAt: now,
    totalConsidered: notifications.length,
    escalated,
    held,
    stopped,
    decisions,
  };
}

/**
 * Apply escalation decisions to a notification (returns updated copy).
 */
export function applyEscalation(
  notification: Notification,
  decision: EscalationDecision,
  now: number,
): Notification {
  if (!decision.shouldEscalate) return notification;
  return {
    ...notification,
    channel: decision.channel,
    escalationStep: decision.nextStep,
    lastEscalatedAt: now,
  };
}

/**
 * Pick the policy for a category, optionally overriding priority.
 */
export function pickPolicy(
  category: NotificationCategory,
  priorityOverride?: NotificationPriority,
): EscalationPolicy {
  const base = DEFAULT_ESCALATION_POLICIES[category];
  if (priorityOverride === undefined) return base;
  return { ...base, priority: priorityOverride };
}

/**
 * Find notifications eligible for escalation at a given moment.
 */
export function findEscalationCandidates(
  notifications: Notification[],
  now: number,
): Notification[] {
  return notifications.filter((n) => {
    const decision = computeNextStep(n, now);
    return decision.shouldEscalate || decision.reason === "cooldown";
  });
}

/**
 * Compute the "next wakeup" — when the next escalation would fire if not
 * for cooldown or max-steps.
 */
export function computeNextWakeup(
  notification: Notification,
  now: number,
): number | null {
  const decision = computeNextStep(notification, now);
  if (decision.shouldEscalate) return decision.scheduledFor;
  if (decision.scheduledFor > now) return decision.scheduledFor;
  return null;
}

/**
 * Summarize the escalation pipeline for observability.
 */
export function summarizeEscalation(result: EscalationBatchResult): {
  total: number;
  escalated: number;
  held: number;
  stopped: number;
  byReason: Record<string, number>;
} {
  const byReason: Record<string, number> = {};
  for (const d of result.decisions) {
    byReason[d.reason] = (byReason[d.reason] ?? 0) + 1;
  }
  return {
    total: result.totalConsidered,
    escalated: result.escalated,
    held: result.held,
    stopped: result.stopped,
    byReason,
  };
}

/**
 * Validate an escalation policy.
 */
export function validateEscalationPolicy(
  policy: EscalationPolicy,
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (policy.steps.length === 0) {
    errors.push("policy must have at least one step");
  }
  if (policy.maxSteps < policy.steps.length) {
    errors.push("maxSteps must be >= steps.length");
  }
  if (policy.coolDownMinutes < 0) {
    errors.push("coolDownMinutes must be >= 0");
  }
  for (let i = 0; i < policy.steps.length; i++) {
    if (policy.steps[i].afterMinutes <= 0) {
      errors.push(`steps[${i}].afterMinutes must be > 0`);
    }
  }
  return { ok: errors.length === 0, errors };
}
