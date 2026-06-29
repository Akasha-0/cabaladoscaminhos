/**
 * Comment Moderation Appeals Flow (Wave 34)
 *
 * Pure TypeScript — no runtime imports from app code. Composes with the
 * w32 moderation UI layer (viewmodels + state machine + helpers) by feeding
 * it structured `AppealRequest` records to render.
 *
 * Lifecycle: submit → pending → (approved | denied | expired | withdrawn)
 * Window:  APPEAL_WINDOW_HOURS (24h) from comment moderation.
 * Cap:     MAX_APPEALS_PER_COMMENT (3) per moderated comment.
 * Levels:  0 peer → 1 senior → 2 admin → 3 council reserve.
 */

export type AppealStatus =
  | "pending"
  | "approved"
  | "denied"
  | "expired"
  | "withdrawn";

export type AppealReason =
  | "false_positive"
  | "context_missing"
  | "selective_application"
  | "policy_clarification"
  | "other";

export type EscalationLevel = 0 | 1 | 2 | 3;

export const APPEAL_WINDOW_HOURS = 24;
export const MAX_APPEALS_PER_COMMENT = 3;
export const ESCALATION_LEVELS = 3; // peer(0), senior(1), admin(2); 3 = council
export const APPEAL_WINDOW_MS = APPEAL_WINDOW_HOURS * 60 * 60 * 1000;
export const MAX_CUSTOM_REASON_LENGTH = 500;

export interface ModeratedComment {
  id: string;
  authorId: string;
  moderatorId: string;
  moderatedAt: number; // epoch ms
  reason: string;
}

export interface AppealRequest {
  id: string;
  commentId: string;
  appellantId: string;
  moderatorId: string;
  reason: AppealReason;
  customReason?: string;
  status: AppealStatus;
  submittedAt: number; // epoch ms
  decidedAt?: number;
  decisionNote?: string;
  escalationLevel: EscalationLevel;
}

export interface AppealDecision {
  requestId: string;
  decision: "approved" | "denied";
  decidedBy: string;
  decisionNote: string;
  decidedAt: number;
}

export interface AppealQueue {
  level0: AppealRequest[];
  level1: AppealRequest[];
  level2: AppealRequest[];
  level3: AppealRequest[];
}

export interface AppealSummary {
  total: number;
  pending: number;
  approved: number;
  denied: number;
  expired: number;
  withdrawn: number;
  averageResolutionMs: number | null;
  byReason: Record<AppealReason, number>;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/* ID generation ----------------------------------------------------------- */

/** `ap_<base36 ms>_<base36 random>` — sortable, non-cryptographic, UI-safe. */
export function generateAppealId(now: number = Date.now()): string {
  const ts = now.toString(36);
  const rand = Math.floor(Math.random() * 0xffffffff)
    .toString(36)
    .padStart(7, "0");
  return `ap_${ts}_${rand}`;
}

/* Validation -------------------------------------------------------------- */

const ALLOWED_REASONS: AppealReason[] = [
  "false_positive",
  "context_missing",
  "selective_application",
  "policy_clarification",
  "other",
];

export function validateAppealReason(
  reason: AppealReason,
  customReason?: string
): ValidationResult {
  if (!ALLOWED_REASONS.includes(reason)) {
    return { valid: false, error: `unknown_reason:${reason}` };
  }
  if (reason === "other") {
    if (!customReason || customReason.trim().length < 10) {
      return { valid: false, error: "custom_reason_required_min_10_chars" };
    }
  }
  if (customReason && customReason.length > MAX_CUSTOM_REASON_LENGTH) {
    return {
      valid: false,
      error: `custom_reason_too_long:${customReason.length}>${MAX_CUSTOM_REASON_LENGTH}`,
    };
  }
  return { valid: true };
}

/* Eligibility ------------------------------------------------------------- */

/** Eligible iff (within window) AND (filed < MAX_APPEALS_PER_COMMENT). */
export function isAppealEligible(
  comment: ModeratedComment,
  existingAppeals: AppealRequest[],
  now: number
): boolean {
  if (now - comment.moderatedAt > APPEAL_WINDOW_MS) return false;
  const filed = existingAppeals.filter((a) => a.commentId === comment.id).length;
  return filed < MAX_APPEALS_PER_COMMENT;
}

/* Escalation -------------------------------------------------------------- */

/**
 * 0 = first peer-level review
 * 1 = senior moderator (after first denial)
 * 2 = admin (after second denial)
 * 3 = council reserve (after third denial — final word)
 */
export function calculateEscalationLevel(
  appealCount: number,
  denialCount: number
): EscalationLevel {
  const fromDenials = Math.min(denialCount, ESCALATION_LEVELS);
  const fromCount = Math.max(0, appealCount - 1);
  const level = Math.min(ESCALATION_LEVELS, fromDenials + fromCount);
  if (level <= 0) return 0;
  if (level >= 3) return 3;
  return level as 1 | 2;
}

/** Auto-escalate when the same comment bounces back after denial. */
export function shouldAutoEscalate(
  appeal: AppealRequest,
  attemptCount: number
): boolean {
  if (appeal.status !== "pending") return false;
  return attemptCount >= 2;
}

/* State transitions ------------------------------------------------------- */

export function submitAppeal(
  comment: ModeratedComment,
  appellantId: string,
  reason: AppealReason,
  customReason: string | undefined,
  existingAppeals: AppealRequest[],
  now: number
): AppealRequest {
  if (now - comment.moderatedAt > APPEAL_WINDOW_MS) {
    throw new Error(
      `appeal_window_closed:${Math.round((now - comment.moderatedAt) / 3600000)}h`
    );
  }
  const filed = existingAppeals.filter((a) => a.commentId === comment.id);
  if (filed.length >= MAX_APPEALS_PER_COMMENT) {
    throw new Error(`max_appeals_reached:${filed.length}`);
  }
  const v = validateAppealReason(reason, customReason);
  if (!v.valid) throw new Error(v.error ?? "invalid_reason");

  const denialCount = filed.filter((a) => a.status === "denied").length;
  const appealCount = filed.length + 1;
  const escalationLevel = calculateEscalationLevel(appealCount, denialCount);

  return {
    id: generateAppealId(now),
    commentId: comment.id,
    appellantId,
    moderatorId: comment.moderatorId,
    reason,
    customReason: reason === "other" ? customReason?.trim() : undefined,
    status: "pending",
    submittedAt: now,
    escalationLevel,
  };
}

export function decideAppeal(
  request: AppealRequest,
  decision: "approved" | "denied",
  decidedBy: string,
  note: string,
  now: number
): { request: AppealRequest; decision: AppealDecision } {
  if (request.status !== "pending") {
    throw new Error(`cannot_decide_non_pending:${request.status}`);
  }
  const trimmed = (note ?? "").trim();
  if (trimmed.length < 5) {
    throw new Error("decision_note_required_min_5_chars");
  }
  const decisionRecord: AppealDecision = {
    requestId: request.id,
    decision,
    decidedBy,
    decisionNote: trimmed,
    decidedAt: now,
  };
  const updated: AppealRequest = {
    ...request,
    status: decision,
    decidedAt: now,
    decisionNote: trimmed,
  };
  return { request: updated, decision: decisionRecord };
}

export function withdrawAppeal(
  request: AppealRequest,
  now: number
): AppealRequest {
  if (request.status !== "pending") {
    throw new Error(`cannot_withdraw_non_pending:${request.status}`);
  }
  return {
    ...request,
    status: "withdrawn",
    decidedAt: now,
    decisionNote: "withdrawn_by_appellant",
  };
}

/* Queue ------------------------------------------------------------------- */

export function buildAppealQueue(appeals: AppealRequest[]): AppealQueue {
  const queue: AppealQueue = { level0: [], level1: [], level2: [], level3: [] };
  for (const a of appeals) {
    if (a.status !== "pending") continue;
    (queue[`level${a.escalationLevel}` as keyof AppealQueue] as AppealRequest[]).push(a);
  }
  // higher levels first, then by submission time
  for (const k of ["level3", "level2", "level1", "level0"] as const) {
    queue[k].sort((a, b) => a.submittedAt - b.submittedAt);
  }
  return queue;
}

/** Pop the next pending appeal from the highest non-empty escalation level. */
export function processNextInQueue<T>(
  queue: AppealQueue,
  processor: (appeal: AppealRequest) => T
): { processed: T | null; remaining: AppealQueue } {
  const remaining: AppealQueue = {
    level0: [...queue.level0],
    level1: [...queue.level1],
    level2: [...queue.level2],
    level3: [...queue.level3],
  };
  for (const k of ["level3", "level2", "level1", "level0"] as const) {
    const next = remaining[k].shift();
    if (next) return { processed: processor(next), remaining };
  }
  return { processed: null, remaining };
}

/* Summary ----------------------------------------------------------------- */

export function summarizeAppeals(appeals: AppealRequest[]): AppealSummary {
  const summary: AppealSummary = {
    total: appeals.length,
    pending: 0,
    approved: 0,
    denied: 0,
    expired: 0,
    withdrawn: 0,
    averageResolutionMs: null,
    byReason: {
      false_positive: 0,
      context_missing: 0,
      selective_application: 0,
      policy_clarification: 0,
      other: 0,
    },
  };
  let total = 0;
  let count = 0;
  for (const a of appeals) {
    summary[a.status] += 1;
    summary.byReason[a.reason] += 1;
    if (typeof a.decidedAt === "number") {
      total += a.decidedAt - a.submittedAt;
      count += 1;
    }
  }
  summary.averageResolutionMs = count > 0 ? Math.round(total / count) : null;
  return summary;
}