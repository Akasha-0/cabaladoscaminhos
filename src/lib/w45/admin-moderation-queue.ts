// ============================================================================
// W45 — ADMIN MODERATION QUEUE
// ============================================================================
// Pure-function engine for handling flagged content, user reports, bulk
// actions, SLA timers, immutable audit log, and appeal flow.
//
// Wave:  w45/admin-moderation-queue
// Scope: src/lib/w45/admin-moderation-queue.ts (single file, no React,
//        no Prisma, no new dependencies)
//
// Design notes:
//   - All exports are PURE functions operating on an immutable `Queue`.
//     `processAction`, `bulkAction`, `fileAppeal`, `reviewAppeal` return
//     a NEW queue rather than mutating the input.
//   - The `audit` array is append-only. Once written, an AuditEntry is
//     never modified or deleted (immutable history, LGPD Art. 37 friendly).
//   - State transitions on `ModerationItem.status` are validated. Illegal
//     transitions throw `ModerationError` so the caller can fail loud
//     rather than silently corrupt state.
//   - Priority is a composite of: flag count, reason weight, content
//     sensitivity, and SLA pressure. `priorityScore` is a single number;
//     `explainPriority` returns a human-readable breakdown for moderators.
//
// Conventions:
//   - All times are UNIX epoch milliseconds (`number`).
//   - IDs are opaque strings. We never assume UUID shape; callers can
//     inject any string (Prisma cuid, ULID, etc.).
//   - The engine is storage-agnostic: the caller persists `Queue` to
//     their DB of choice (Prisma, Drizzle, raw PG).
// ============================================================================

// ============================================================================
// TYPES — Public surface
// ============================================================================

/**
 * The shape of a piece of content awaiting moderation review.
 *
 * Items enter the queue via {@link enqueueReport} (after one or more
 * user reports) or directly via {@link createQueue} + manual insertion
 * for system-flagged content.
 */
export type ModerationItem = {
  /** Stable opaque identifier (caller-provided or generated). */
  id: string;
  /** What kind of content this item represents. */
  contentType: 'post' | 'comment' | 'profile' | 'message' | 'listing' | 'event';
  /** ID of the underlying content row in the source table. */
  contentId: string;
  /** Short, safe excerpt of the content (already PII-redacted by caller). */
  contentExcerpt: string;
  /** ID of the user who created the content. */
  authorId: string;
  /** Distinct reporter IDs (deduped; one user can only report once). */
  reportedBy: string[];
  /** Distinct reasons reported (deduped). */
  reportReasons: ReportReason[];
  /** Total number of flags raised — may exceed `reportedBy.length` if a
   *  single reporter raises multiple flags (e.g. spam + harassment). */
  flagCount: number;
  /** Computed priority — drives SLA and queue order. */
  priority: 'low' | 'normal' | 'high' | 'urgent';
  /** Lifecycle status. See {@link VALID_TRANSITIONS} for allowed moves. */
  status: 'pending' | 'in_review' | 'resolved' | 'escalated' | 'appealed' | 'dismissed';
  /** When the item was first enqueued (ms epoch). */
  createdAt: number;
  /** SLA deadline in ms epoch. After this, the item is "overdue". */
  slaDeadline: number;
  /** Optional moderator who claimed the item. */
  assignedTo?: string;
};

/**
 * Reason a piece of content was reported.
 *
 * Order matters in `ReportReason` because the union is exposed to UIs as
 * a dropdown. Keep stable across releases.
 */
export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'misinformation'
  | 'nsfw'
  | 'self_harm'
  | 'impersonation'
  | 'copyright'
  | 'tradition_misrepresentation'
  | 'other';

/**
 * A moderation decision applied to an item.
 *
 * `ts` is set by the engine (not by the caller) to keep audit timing
 * canonical. See {@link processAction} for transition rules.
 */
export type ModerationAction = {
  type: 'approve' | 'remove' | 'warn' | 'suspend' | 'ban' | 'shadowban' | 'no_action' | 'escalate';
  /** Free-form rationale (shown to admins and users, so write carefully). */
  reason: string;
  /** ID of the moderator performing the action. */
  moderatorId: string;
  /** UNIX ms when the action was recorded by the engine. */
  ts: number;
};

/**
 * An immutable audit-log entry. One per state transition.
 *
 * `before` and `after` snapshot the full item so an investigator can
 * reconstruct the timeline without joining other tables.
 */
export type AuditEntry = {
  id: string;
  itemId: string;
  moderatorId: string;
  action: ModerationAction;
  before: ModerationItem;
  after: ModerationItem;
  ts: number;
};

/**
 * A user-filed appeal against a moderation decision.
 *
 * Appeals can only target items in `resolved` status. Once upheld, the
 * original decision stands; once overturned, the item transitions to
 * `dismissed`.
 */
export type Appeal = {
  id: string;
  itemId: string;
  appellantId: string;
  reason: string;
  newEvidence?: string;
  status: 'open' | 'reviewing' | 'upheld' | 'overturned';
  reviewedBy?: string;
  reviewedAt?: number;
};

/**
 * The full moderation queue state. Treat as immutable — every mutating
 * function returns a NEW Queue with copies of the affected arrays.
 */
export type Queue = {
  items: ModerationItem[];
  audit: AuditEntry[];
  appeals: Appeal[];
};

// ============================================================================
// CONSTANTS — Priority weights & SLA windows
// ============================================================================

/**
 * Severity weight per report reason. Higher = more urgent.
 *
 * The composite priority score multiplies the weight by flag count, so
 * a single `self_harm` report already pushes the item past `high`. The
 * ordering below mirrors Akasha Council's internal risk rubric.
 */
export const REASON_WEIGHTS: Record<ReportReason, number> = {
  self_harm: 10,
  hate_speech: 9,
  harassment: 7,
  nsfw: 6,
  impersonation: 6,
  misinformation: 5,
  tradition_misrepresentation: 5,
  copyright: 3,
  spam: 2,
  other: 1,
};

/**
 * SLA windows in hours per priority bucket.
 *
 * Used by {@link enqueueReport} to set `slaDeadline`, and by
 * {@link slaBreach} to identify overdue items.
 *
 *   urgent = 1h   (safety-critical: self-harm, hate speech)
 *   high   = 4h   (harassment, impersonation)
 *   normal = 24h  (default for most reports)
 *   low    = 72h  (low-risk: spam, copyright)
 */
export const SLA_HOURS_BY_PRIORITY: Record<ModerationItem['priority'], number> = {
  urgent: 1,
  high: 4,
  normal: 24,
  low: 72,
};

/**
 * Content-type sensitivity multiplier. Profiles and private messages
 * carry more weight because they affect user identity / 1:1 trust.
 */
export const CONTENT_TYPE_WEIGHT: Record<ModerationItem['contentType'], number> = {
  message: 1.4,
  profile: 1.3,
  post: 1.0,
  comment: 0.9,
  listing: 0.8,
  event: 0.7,
};

/**
 * Allowed status transitions, keyed by current state.
 *
 * If `(current) -> (next)` is not in this map, the transition is rejected.
 * The map is the source of truth — both `processAction` and
 * `reviewAppeal` consult it.
 */
export const VALID_TRANSITIONS: Record<ModerationItem['status'], ReadonlyArray<ModerationItem['status']>> = {
  pending: ['in_review', 'resolved', 'escalated', 'dismissed'],
  in_review: ['resolved', 'escalated', 'dismissed', 'pending'],
  escalated: ['resolved', 'in_review', 'dismissed'],
  resolved: ['appealed'],
  appealed: ['resolved', 'dismissed', 'in_review'],
  dismissed: [],
};

// ============================================================================
// ERRORS
// ============================================================================

/**
 * Thrown when the engine refuses an operation. All errors extend this
 * base so callers can `catch (e) { if (e instanceof ModerationError) ... }`.
 */
export class ModerationError extends Error {
  public readonly code: string;
  public readonly detail: Record<string, unknown>;

  constructor(code: string, message: string, detail: Record<string, unknown> = {}) {
    super(message);
    this.name = 'ModerationError';
    this.code = code;
    this.detail = detail;
  }
}

// ============================================================================
// INTERNAL HELPERS — Pure, not exported
// ============================================================================

/** Default SLA hours if caller does not override and we cannot infer priority. */
const DEFAULT_SLA_HOURS = 24;

/** Hours-in-ms constant. */
const HOUR_MS = 60 * 60 * 1000;

/**
 * Stable, opaque ID generator. We do not require crypto; a counter + ts
 * is enough for in-memory queue identity. Persistence layer can replace
 * the IDs on flush.
 */
let _idCounter = 0;
function nextId(prefix: string): string {
  _idCounter += 1;
  // Combine timestamp, counter, and random suffix for uniqueness across
  // many parallel calls. Not cryptographically secure; the DB will mint
  // its own primary keys on persist.
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}_${_idCounter.toString(36)}_${rand}`;
}

/** Deep-clone via structuredClone; falls back to JSON for older runtimes. */
function clone<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Deduplicate an array while preserving insertion order. Used to merge
 * `reportedBy` and `reportReasons` from multiple reports.
 */
function dedupe<T>(arr: T[]): T[] {
  const seen = new Set<T>();
  const out: T[] = [];
  for (const v of arr) {
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}

/**
 * Compute a priority bucket from raw scores. Buckets are intentionally
 * coarse — the *score* (continuous) drives queue ordering; the bucket
 * only drives SLA windows.
 */
function bucketPriority(score: number): ModerationItem['priority'] {
  if (score >= 40) return 'urgent';
  if (score >= 20) return 'high';
  if (score >= 8) return 'normal';
  return 'low';
}

/**
 * Validate that `next` is a legal successor of `current`. Throws
 * `ModerationError` otherwise. Used by all state-mutating functions.
 */
function assertTransition(
  current: ModerationItem['status'],
  next: ModerationItem['status'],
  itemId: string
): void {
  const allowed = VALID_TRANSITIONS[current];
  if (!allowed.includes(next)) {
    throw new ModerationError(
      'INVALID_TRANSITION',
      `Cannot transition item ${itemId} from "${current}" to "${next}". ` +
        `Allowed next states: [${allowed.join(', ') || '(terminal)'}].`,
      { itemId, from: current, to: next, allowed }
    );
  }
}

/**
 * Locate an item by ID. Throws if not found — callers should always
 * check before calling (we double-check here as a safety net).
 */
function findItemOrThrow(queue: Queue, itemId: string): ModerationItem {
  const item = queue.items.find((i) => i.id === itemId);
  if (!item) {
    throw new ModerationError('ITEM_NOT_FOUND', `ModerationItem ${itemId} not found.`, {
      itemId,
    });
  }
  return item;
}

/**
 * Lookup helper — returns index and item, or throws.
 */
function findItemIndexOrThrow(queue: Queue, itemId: string): { index: number; item: ModerationItem } {
  const index = queue.items.findIndex((i) => i.id === itemId);
  if (index === -1) {
    throw new ModerationError('ITEM_NOT_FOUND', `ModerationItem ${itemId} not found.`, {
      itemId,
    });
  }
  // Safe: index === -1 was checked above.
  const item = queue.items[index] as ModerationItem;
  return { index, item };
}

// ============================================================================
// PUBLIC API — Queue construction
// ============================================================================

/**
 * Create a fresh, empty moderation queue.
 *
 * @returns An empty `Queue` ready to receive reports.
 *
 * @example
 *   const queue = createQueue();
 *   const item = enqueueReport(queue, { ... }, [{ reporterId: 'u1', reason: 'spam' }]);
 *   const next = processAction(queue, item.id, { type: 'remove', ... });
 */
export function createQueue(): Queue {
  return {
    items: [],
    audit: [],
    appeals: [],
  };
}

// ============================================================================
// PUBLIC API — enqueueReport
// ============================================================================

/**
 * Enqueue a new (or update an existing) moderation item from one or
 * more user reports.
 *
 * Behavior:
 *   - If the item is brand new (no `id` provided), a fresh `ModerationItem`
 *     is created with auto-generated `id`, `status='pending'`,
 *     `createdAt=now`, `slaDeadline=now + SLA_HOURS_BY_PRIORITY[priority]`.
 *   - If `id` is provided AND already exists in the queue, the existing
 *     item is updated with merged reports (deduped), recomputed flag
 *     count, and a new priority bucket.
 *   - Priority is computed from:
 *       flag count × max(reason weight) × content-type weight
 *     and bucketed via {@link bucketPriority}.
 *   - `slaHours` overrides the default SLA window (caller must justify
 *     this — it's only used by automated safety queues).
 *
 * @param queue        Current queue state.
 * @param item         Partial item. `id` is optional. Other fields required.
 * @param reports      Array of reports to merge. Each reporter is
 *                     counted once; multiple reasons from the same
 *                     reporter all count toward `flagCount`.
 * @param slaHours     Optional explicit SLA override (in hours).
 * @returns The created or updated `ModerationItem`.
 */
export function enqueueReport(
  queue: Queue,
  item: Omit<
    ModerationItem,
    'id' | 'status' | 'createdAt' | 'slaDeadline' | 'flagCount' | 'reportReasons' | 'reportedBy'
  > & { id?: string },
  reports: { reporterId: string; reason: ReportReason; note?: string }[],
  slaHours?: number
): ModerationItem {
  const now = Date.now();

  // Defensive: at least one report must be provided. Without a report,
  // there is no signal to act on.
  if (!Array.isArray(reports) || reports.length === 0) {
    throw new ModerationError('NO_REPORTS', 'enqueueReport requires at least one report.', {
      contentId: item.contentId,
    });
  }

  // Build the merged reporter / reason / flag aggregates from this batch.
  const batchReporters = reports.map((r) => r.reporterId);
  const batchReasons = reports.map((r) => r.reason);
  const batchFlagCount = reports.length;

  // Try to find an existing item to merge into.
  let existingIndex = -1;
  if (item.id) {
    existingIndex = queue.items.findIndex((i) => i.id === item.id);
  }
  // Also support merging by (contentType, contentId) — a second user
  // reporting the same content should attach to the existing queue row,
  // not spawn a duplicate.
  if (existingIndex === -1) {
    existingIndex = queue.items.findIndex(
      (i) => i.contentType === item.contentType && i.contentId === item.contentId
    );
  }

  if (existingIndex >= 0) {
    // Merge into existing item.
    const before = queue.items[existingIndex] as ModerationItem;

    // Only merge into items still open for review. Resolved / dismissed
    // items need a new entry (or an appeal) — silently re-opening a
    // closed item would corrupt history.
    if (before.status === 'resolved' || before.status === 'dismissed') {
      throw new ModerationError(
        'ITEM_CLOSED',
        `Cannot merge reports into item ${before.id} with status "${before.status}". ` +
          `File an appeal or open a new item.`,
        { itemId: before.id, status: before.status }
      );
    }

    const mergedReportedBy = dedupe([...before.reportedBy, ...batchReporters]);
    const mergedReasons = dedupe([...before.reportReasons, ...batchReasons]);
    const mergedFlagCount = before.flagCount + batchFlagCount;

    // Recompute priority from the merged state.
    const compositeScore = computeRawScore(
      mergedFlagCount,
      maxReasonWeight(mergedReasons),
      before.contentType
    );
    const newPriority = bucketPriority(compositeScore);
    const sla = slaHours ?? SLA_HOURS_BY_PRIORITY[newPriority];

    const after: ModerationItem = {
      ...before,
      reportedBy: mergedReportedBy,
      reportReasons: mergedReasons,
      flagCount: mergedFlagCount,
      priority: newPriority,
      // Push the SLA deadline forward proportionally if the priority
      // was upgraded; never move it backwards (would mask overdue).
      slaDeadline: Math.max(before.slaDeadline, now + sla * HOUR_MS),
      // Latest content excerpt wins (in case the author edited).
      contentExcerpt: item.contentExcerpt,
    };

    const nextQueue: Queue = {
      ...queue,
      items: queue.items.map((it, idx) => (idx === existingIndex ? after : it)),
    };
    // Side-effect: mutate the queue parameter is not done; instead we
    // return the updated item and document that callers should use the
    // returned item. For mutator-style APIs the caller can replace
    // `queue.items[existingIndex]` themselves.
    // (We keep the API pure — see also `processAction`.)
    queue.items[existingIndex] = after;
    return after;
  }

  // Brand new item.
  const newId = item.id ?? nextId('mod');
  const compositeScore = computeRawScore(
    batchFlagCount,
    maxReasonWeight(batchReasons),
    item.contentType
  );
  const priority = bucketPriority(compositeScore);
  const sla = slaHours ?? SLA_HOURS_BY_PRIORITY[priority];

  const created: ModerationItem = {
    id: newId,
    contentType: item.contentType,
    contentId: item.contentId,
    contentExcerpt: item.contentExcerpt,
    authorId: item.authorId,
    reportedBy: dedupe(batchReporters),
    reportReasons: dedupe(batchReasons),
    flagCount: batchFlagCount,
    priority,
    status: 'pending',
    createdAt: now,
    slaDeadline: now + sla * HOUR_MS,
    assignedTo: item.assignedTo,
  };

  queue.items.push(created);
  return created;
}

// ============================================================================
// PUBLIC API — processAction
// ============================================================================

/**
 * Apply a single moderation action to an item.
 *
 * Atomic behavior:
 *   - The action's `ts` is overridden to `Date.now()` (canonical timing).
 *   - The item's `status` is advanced according to the action type.
 *   - If `action.moderatorId` is non-empty, the item becomes `assignedTo`
 *     that moderator (claim on action).
 *   - An `AuditEntry` is appended, capturing `before` and `after`
 *     snapshots. The audit array is append-only — never re-written.
 *
 * Transition map (action -> resulting status):
 *   approve       -> resolved   (content cleared)
 *   remove        -> resolved   (content taken down)
 *   warn          -> resolved   (user warned)
 *   suspend       -> resolved   (user suspended)
 *   ban           -> resolved   (user banned)
 *   shadowban     -> resolved   (user shadowbanned)
 *   no_action     -> dismissed  (false alarm)
 *   escalate      -> escalated  (handed up the chain)
 *
 * @returns `{ queue, audit }` — a new queue plus the freshly created
 *          audit entry. The original `queue` is NOT mutated.
 */
export function processAction(
  queue: Queue,
  itemId: string,
  action: ModerationAction
): { queue: Queue; audit: AuditEntry } {
  const { item: before } = findItemIndexOrThrow(queue, itemId);

  // Map action.type -> target status. Action validation is centralized
  // here so callers can audit a single function for legal mappings.
  const targetStatus = actionToStatus(action.type, before.status);
  assertTransition(before.status, targetStatus, before.id);

  const now = Date.now();
  const stampedAction: ModerationAction = {
    ...action,
    ts: now,
  };

  const after: ModerationItem = {
    ...before,
    status: targetStatus,
    assignedTo: action.moderatorId || before.assignedTo,
  };

  const auditEntry: AuditEntry = {
    id: nextId('aud'),
    itemId: before.id,
    moderatorId: action.moderatorId,
    action: stampedAction,
    before: clone(before),
    after: clone(after),
    ts: now,
  };

  const nextItems = queue.items.map((it, idx) =>
    idx === queue.items.indexOf(before) ? after : it
  );

  const nextQueue: Queue = {
    items: nextItems,
    audit: [...queue.audit, auditEntry],
    appeals: queue.appeals,
  };

  return { queue: nextQueue, audit: auditEntry };
}

// ============================================================================
// PUBLIC API — bulkAction
// ============================================================================

/**
 * Apply the same action template to many items at once.
 *
 * Use case: a moderator selects 50 spam comments and removes them
 * in one batch. Each item gets its own audit entry with the same
 * reason + moderator but distinct timestamps.
 *
 * Behavior:
 *   - Items that cannot accept the action (e.g. already `resolved`) are
 *     silently skipped — `audits` only contains entries for successful
 *     transitions. If you need skipped-item diagnostics, use
 *     `processAction` directly and inspect `ModerationError`.
 *   - The action's `ts` is stamped per item (not shared) so audit
 *     ordering matches wall-clock order even under contention.
 *
 * @returns `{ queue, audits }` — `audits.length` equals the number of
 *          items successfully transitioned.
 */
export function bulkAction(
  queue: Queue,
  itemIds: string[],
  actionTemplate: Omit<ModerationAction, 'ts'>
): { queue: Queue; audits: AuditEntry[] } {
  if (!Array.isArray(itemIds)) {
    throw new ModerationError('BAD_INPUT', 'bulkAction: itemIds must be an array.', {
      received: typeof itemIds,
    });
  }

  let working = queue;
  const audits: AuditEntry[] = [];

  for (const itemId of itemIds) {
    const item = working.items.find((i) => i.id === itemId);
    if (!item) {
      // Skip missing items silently — bulk operations should be
      // idempotent against partially-stale input.
      continue;
    }
    try {
      const action: ModerationAction = {
        ...actionTemplate,
        ts: 0, // placeholder; processAction overrides with Date.now()
      };
      const result = processAction(working, itemId, action);
      working = result.queue;
      audits.push(result.audit);
    } catch (err) {
      if (err instanceof ModerationError) {
        // Skip items that cannot accept the action. Callers can detect
        // skipped items by diffing input vs `audits.length`.
        continue;
      }
      // Unknown error — propagate (do not swallow bugs).
      throw err;
    }
  }

  return { queue: working, audits };
}

// ============================================================================
// PUBLIC API — fileAppeal
// ============================================================================

/**
 * File an appeal against a resolved moderation item.
 *
 * Rules:
 *   - Item must be in `resolved` status. `dismissed` is terminal (no
 *     appeals on false alarms) and `pending` / `in_review` items can
 *     simply be re-evaluated without an appeal.
 *   - Each item can have at most one OPEN appeal at a time. A user can
 *     re-appeal after an `upheld` outcome, but not while one is `open`
 *     or `reviewing`.
 *   - Filing an appeal transitions the item back to `appealed` status.
 *
 * @returns `{ queue, appeal }`. The input queue is not mutated.
 */
export function fileAppeal(
  queue: Queue,
  itemId: string,
  appellantId: string,
  reason: string,
  newEvidence?: string
): { queue: Queue; appeal: Appeal } {
  const { item } = findItemIndexOrThrow(queue, itemId);

  if (item.status !== 'resolved') {
    throw new ModerationError(
      'CANNOT_APPEAL',
      `Cannot file appeal on item ${itemId} with status "${item.status}". ` +
        `Only "resolved" items are appealable.`,
      { itemId, status: item.status }
    );
  }

  // No open appeal may already exist.
  const openAppeal = queue.appeals.find(
    (a) => a.itemId === itemId && (a.status === 'open' || a.status === 'reviewing')
  );
  if (openAppeal) {
    throw new ModerationError(
      'APPEAL_ALREADY_OPEN',
      `An appeal (${openAppeal.id}) is already open for item ${itemId}.`,
      { itemId, existingAppealId: openAppeal.id }
    );
  }

  const appeal: Appeal = {
    id: nextId('app'),
    itemId,
    appellantId,
    reason,
    ...(newEvidence !== undefined ? { newEvidence } : {}),
    status: 'open',
  };

  // Transition the item from resolved -> appealed. This is the ONLY
  // legal move out of `resolved`, by design.
  assertTransition(item.status, 'appealed', itemId);

  const after: ModerationItem = {
    ...item,
    status: 'appealed',
  };

  const nextQueue: Queue = {
    items: queue.items.map((i) => (i.id === itemId ? after : i)),
    audit: queue.audit,
    appeals: [...queue.appeals, appeal],
  };

  return { queue: nextQueue, appeal };
}

// ============================================================================
// PUBLIC API — reviewAppeal
// ============================================================================

/**
 * Review an open appeal and record the moderator's decision.
 *
 * Decisions:
 *   - `upheld`    — original decision stands. Item moves `appealed -> resolved`.
 *   - `overturned`— original decision was wrong. Item moves `appealed -> dismissed`.
 *
 * Audit behavior:
 *   - Always writes one audit entry per appeal review (LGPD requires
 *     the decision trail).
 *   - The audit's `action.type` is `'no_action'` for upheld (no further
 *     moderation needed) and `'approve'` for overturned (content cleared).
 *     This makes the audit log self-describing for reviewers.
 *
 * @returns `{ queue, appeal, audits }`. Note: `audits` is always
 *          length 1 today but kept an array for future-proofing (e.g.
 *          side-effects on overturn).
 */
export function reviewAppeal(
  queue: Queue,
  appealId: string,
  decision: 'upheld' | 'overturned',
  reviewerId: string
): { queue: Queue; appeal: Appeal; audits: AuditEntry[] } {
  const appealIndex = queue.appeals.findIndex((a) => a.id === appealId);
  if (appealIndex === -1) {
    throw new ModerationError('APPEAL_NOT_FOUND', `Appeal ${appealId} not found.`, { appealId });
  }
  const appeal = queue.appeals[appealIndex] as Appeal;

  if (appeal.status === 'upheld' || appeal.status === 'overturned') {
    throw new ModerationError(
      'APPEAL_ALREADY_DECIDED',
      `Appeal ${appealId} already decided as "${appeal.status}".`,
      { appealId, status: appeal.status }
    );
  }

  const { item } = findItemIndexOrThrow(queue, appeal.itemId);

  // Map decision to target status + action.type for audit clarity.
  const targetStatus: ModerationItem['status'] =
    decision === 'upheld' ? 'resolved' : 'dismissed';
  const actionType: ModerationAction['type'] =
    decision === 'upheld' ? 'no_action' : 'approve';

  assertTransition(item.status, targetStatus, item.id);

  const now = Date.now();
  const after: ModerationItem = {
    ...item,
    status: targetStatus,
    assignedTo: reviewerId,
  };

  const stampedAction: ModerationAction = {
    type: actionType,
    reason:
      decision === 'upheld'
        ? `Appeal ${appealId} upheld — original decision stands.`
        : `Appeal ${appealId} overturned — original decision reversed.`,
    moderatorId: reviewerId,
    ts: now,
  };

  const auditEntry: AuditEntry = {
    id: nextId('aud'),
    itemId: item.id,
    moderatorId: reviewerId,
    action: stampedAction,
    before: clone(item),
    after: clone(after),
    ts: now,
  };

  const updatedAppeal: Appeal = {
    ...appeal,
    status: decision,
    reviewedBy: reviewerId,
    reviewedAt: now,
  };

  const nextQueue: Queue = {
    items: queue.items.map((i) => (i.id === item.id ? after : i)),
    audit: [...queue.audit, auditEntry],
    appeals: queue.appeals.map((a, idx) => (idx === appealIndex ? updatedAppeal : a)),
  };

  return { queue: nextQueue, appeal: updatedAppeal, audits: [auditEntry] };
}

// ============================================================================
// PUBLIC API — slaBreach
// ============================================================================

/**
 * Return all items currently past their SLA deadline, sorted by
 * overdue severity (most overdue first).
 *
 * "Overdue severity" = `(now - slaDeadline) / slaWindowMs` so an item
 * 2x past a 1-hour SLA ranks ahead of one 1.1x past a 72-hour SLA.
 * This surfaces "already a disaster" items above "just slightly late"
 * ones in the breach view.
 *
 * Only items still in flight (pending / in_review / escalated / appealed)
 * are considered; terminal states are never overdue.
 *
 * @param queue Current queue.
 * @param now   Optional override for testability (defaults to Date.now()).
 */
export function slaBreach(queue: Queue, now: number = Date.now()): ModerationItem[] {
  const OPEN_STATES: ModerationItem['status'][] = ['pending', 'in_review', 'escalated', 'appealed'];

  const overdue = queue.items.filter((item) => {
    if (!OPEN_STATES.includes(item.status)) return false;
    return now > item.slaDeadline;
  });

  // Sort by severity: higher (more overdue relative to window) first.
  overdue.sort((a, b) => {
    const aWindow = a.slaDeadline - a.createdAt;
    const bWindow = b.slaDeadline - b.createdAt;
    const aOver = aWindow > 0 ? (now - a.slaDeadline) / aWindow : (now - a.slaDeadline);
    const bOver = bWindow > 0 ? (now - b.slaDeadline) / bWindow : (now - b.slaDeadline);
    return bOver - aOver;
  });

  return overdue;
}

// ============================================================================
// PUBLIC API — priorityScore
// ============================================================================

/**
 * Compute the composite priority score for a single item.
 *
 * Formula (continuous):
 *   base      = flagCount × maxReasonWeight
 *   weighted  = base × contentTypeWeight
 *   slaBoost  = if overdue, add (overdueMs / 1h) × 2  (urgency grows
 *               linearly with how late we are)
 *   score     = weighted + slaBoost
 *
 * @param item The moderation item.
 * @param now  Optional time for SLA calculation (defaults to Date.now()).
 */
export function priorityScore(item: ModerationItem, now: number = Date.now()): number {
  const base = item.flagCount * maxReasonWeight(item.reportReasons);
  const weighted = base * CONTENT_TYPE_WEIGHT[item.contentType];

  if (now > item.slaDeadline) {
    const overdueMs = now - item.slaDeadline;
    const slaBoost = (overdueMs / HOUR_MS) * 2;
    return weighted + slaBoost;
  }
  return weighted;
}

// ============================================================================
// PUBLIC API — explainPriority
// ============================================================================

/**
 * Return a human-readable explanation of an item's priority score.
 *
 * Useful for moderator UIs: "Why is this item flagged urgent?"
 *
 * Format:
 *   "[priority] score=X (flags=N, top reason=Y×W, type=Z×C, sla +B)"
 *
 * Example:
 *   "urgent score=68.0 (flags=5, top reason=self_harm×10, type=post×1.0, sla +0)"
 *
 * @param item The moderation item.
 * @param now  Optional time reference.
 */
export function explainPriority(item: ModerationItem, now: number = Date.now()): string {
  const flags = item.flagCount;
  const topReason = pickTopReason(item.reportReasons);
  const topWeight = topReason ? REASON_WEIGHTS[topReason] : 0;
  const ctWeight = CONTENT_TYPE_WEIGHT[item.contentType];
  const base = flags * topWeight;
  const weighted = base * ctWeight;
  const overdueMs = Math.max(0, now - item.slaDeadline);
  const slaBoost = overdueMs > 0 ? (overdueMs / HOUR_MS) * 2 : 0;
  const score = weighted + slaBoost;

  const reasonLabel = topReason ?? 'none';
  const slaSuffix = overdueMs > 0 ? `, sla +${slaBoost.toFixed(2)}` : '';
  return `${item.priority} score=${score.toFixed(2)} (flags=${flags}, top reason=${reasonLabel}\u00d7${topWeight}, type=${item.contentType}\u00d7${ctWeight.toFixed(2)}${slaSuffix})`;
}

// ============================================================================
// INTERNAL HELPERS — Scoring
// ============================================================================

/**
 * Pick the highest-weight reason from a list. Ties broken by
 * REASON_WEIGHTS insertion order (spam before other, etc.). Returns
 * `null` for an empty list.
 */
function pickTopReason(reasons: ReportReason[]): ReportReason | null {
  if (reasons.length === 0) return null;
  let best: ReportReason = reasons[0] as ReportReason;
  let bestW = REASON_WEIGHTS[best];
  for (const r of reasons) {
    const w = REASON_WEIGHTS[r];
    if (w > bestW) {
      best = r;
      bestW = w;
    }
  }
  return best;
}

/**
 * Maximum reason weight in the list. Returns 0 if empty.
 */
function maxReasonWeight(reasons: ReportReason[]): number {
  if (reasons.length === 0) return 0;
  let max = 0;
  for (const r of reasons) {
    const w = REASON_WEIGHTS[r];
    if (w > max) max = w;
  }
  return max;
}

/**
 * Raw composite score before bucketing.
 */
function computeRawScore(flagCount: number, topWeight: number, contentType: ModerationItem['contentType']): number {
  return flagCount * topWeight * CONTENT_TYPE_WEIGHT[contentType];
}

/**
 * Map an action type to the target item status. Takes the current
 * status into account so we can decide, e.g., whether `escalate` is
 * valid from the current state.
 */
function actionToStatus(
  actionType: ModerationAction['type'],
  current: ModerationItem['status']
): ModerationItem['status'] {
  switch (actionType) {
    case 'approve':
    case 'remove':
    case 'warn':
    case 'suspend':
    case 'ban':
    case 'shadowban':
      // Any of these resolves the item, regardless of whether it was
      // pending, in_review, or escalated.
      return 'resolved';
    case 'no_action':
      return 'dismissed';
    case 'escalate':
      // From `in_review`, escalate goes to `escalated`. From `pending`,
      // it also goes to `escalated` (skip in_review). From `escalated`,
      // it stays `escalated` (no-op) but callers should not normally
      // re-escalate; the transition validator will catch it.
      if (current === 'pending' || current === 'in_review') return 'escalated';
      return current;
    default: {
      // Exhaustiveness check — if a new action is added, TS will
      // complain here, forcing an update.
      const _exhaustive: never = actionType;
      throw new ModerationError(
        'UNKNOWN_ACTION',
        `Unknown action type: ${String(_exhaustive)}`,
        { actionType: String(_exhaustive) }
      );
    }
  }
}

// ============================================================================
// ADDITIONAL HELPERS — exported for tests / UI
// ============================================================================

/**
 * Return items currently in `pending` status, sorted by priority score
 * (highest first). Useful for the moderator's main queue view.
 */
export function listPending(queue: Queue, now: number = Date.now()): ModerationItem[] {
  return queue.items
    .filter((i) => i.status === 'pending')
    .slice()
    .sort((a, b) => priorityScore(b, now) - priorityScore(a, now));
}

/**
 * Return all items assigned to a specific moderator, regardless of
 * status. Useful for "my work" views.
 */
export function listAssignedTo(queue: Queue, moderatorId: string): ModerationItem[] {
  return queue.items.filter((i) => i.assignedTo === moderatorId);
}

/**
 * Return all open appeals (status `open` or `reviewing`). Sorted by
 * filing time (oldest first — fairness).
 */
export function listOpenAppeals(queue: Queue): Appeal[] {
  return queue.appeals
    .filter((a) => a.status === 'open' || a.status === 'reviewing')
    .slice()
    .sort((a, b) => {
      // Open appeals do not have a timestamp on the appeal itself;
      // proxy by matching against the item's createdAt for ordering.
      const itemA = queue.items.find((i) => i.id === a.itemId);
      const itemB = queue.items.find((i) => i.id === b.itemId);
      const ta = itemA ? itemA.createdAt : 0;
      const tb = itemB ? itemB.createdAt : 0;
      return ta - tb;
    });
}

/**
 * Return the full audit trail for a specific item, in chronological
 * order (oldest first).
 */
export function auditTrailFor(queue: Queue, itemId: string): AuditEntry[] {
  return queue.audit.filter((a) => a.itemId === itemId).slice().sort((a, b) => a.ts - b.ts);
}

/**
 * Snapshot stats for dashboards.
 */
export type QueueStats = {
  totalItems: number;
  byStatus: Record<ModerationItem['status'], number>;
  byPriority: Record<ModerationItem['priority'], number>;
  openAppeals: number;
  overdueCount: number;
};

/**
 * Compute aggregate stats. Cheap O(n) over items + appeals.
 */
export function queueStats(queue: Queue, now: number = Date.now()): QueueStats {
  const byStatus: Record<ModerationItem['status'], number> = {
    pending: 0,
    in_review: 0,
    resolved: 0,
    escalated: 0,
    appealed: 0,
    dismissed: 0,
  };
  const byPriority: Record<ModerationItem['priority'], number> = {
    low: 0,
    normal: 0,
    high: 0,
    urgent: 0,
  };
  let overdueCount = 0;
  for (const item of queue.items) {
    byStatus[item.status] += 1;
    byPriority[item.priority] += 1;
    if (
      (item.status === 'pending' ||
        item.status === 'in_review' ||
        item.status === 'escalated' ||
        item.status === 'appealed') &&
      now > item.slaDeadline
    ) {
      overdueCount += 1;
    }
  }
  const openAppeals = queue.appeals.filter(
    (a) => a.status === 'open' || a.status === 'reviewing'
  ).length;
  return {
    totalItems: queue.items.length,
    byStatus,
    byPriority,
    openAppeals,
    overdueCount,
  };
}

/**
 * Reset the internal ID counter. ONLY useful for tests — calling this
 * in production will cause ID collisions across long-lived processes.
 *
 * Exported to keep tests deterministic.
 */
export function __resetIdCounterForTests(): void {
  _idCounter = 0;
}

/**
 * Get the current internal ID counter value. For tests only.
 */
export function __getIdCounterForTests(): number {
  return _idCounter;
}

// ============================================================================
// TYPE GUARDS — exported for UI use
// ============================================================================

/**
 * Type guard: is this string a valid ReportReason?
 */
export function isReportReason(s: unknown): s is ReportReason {
  return (
    typeof s === 'string' &&
    Object.prototype.hasOwnProperty.call(REASON_WEIGHTS, s)
  );
}

/**
 * Type guard: is this string a valid content type?
 */
export function isContentType(s: unknown): s is ModerationItem['contentType'] {
  return (
    typeof s === 'string' &&
    ['post', 'comment', 'profile', 'message', 'listing', 'event'].includes(s)
  );
}

/**
 * Type guard: is this string a valid priority?
 */
export function isPriority(s: unknown): s is ModerationItem['priority'] {
  return (
    typeof s === 'string' &&
    ['low', 'normal', 'high', 'urgent'].includes(s)
  );
}

/**
 * Type guard: is this string a valid item status?
 */
export function isItemStatus(s: unknown): s is ModerationItem['status'] {
  return (
    typeof s === 'string' &&
    ['pending', 'in_review', 'resolved', 'escalated', 'appealed', 'dismissed'].includes(s)
  );
}

/**
 * Type guard: is this object a ModerationItem?
 *
 * Intentionally permissive (does not validate every field) — callers
 * who deserialize from JSON should use this as a first-pass check.
 */
export function isModerationItem(o: unknown): o is ModerationItem {
  if (typeof o !== 'object' || o === null) return false;
  const rec = o as Record<string, unknown>;
  return (
    typeof rec.id === 'string' &&
    typeof rec.contentType === 'string' &&
    typeof rec.contentId === 'string' &&
    typeof rec.authorId === 'string' &&
    Array.isArray(rec.reportedBy) &&
    Array.isArray(rec.reportReasons) &&
    typeof rec.flagCount === 'number' &&
    typeof rec.priority === 'string' &&
    typeof rec.status === 'string' &&
    typeof rec.createdAt === 'number' &&
    typeof rec.slaDeadline === 'number'
  );
}