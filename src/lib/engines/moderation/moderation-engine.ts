/**
 * ════════════════════════════════════════════════════════════════════════════
 * W84-C — COMMENTS MODERATION · ENGINE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 84 · 2026-06-30
 * Author: W84-C Coder (Mavis orchestrator session 414756900012156)
 *
 * The moderation engine wraps the W83-C comments engine. It maintains a
 * reports store and provides:
 *
 *   submitReport(commentId, reporterId, reason, note?) → Report
 *   decide(reportId, moderatorId, action, note?)       → Report
 *   batchDecide(reportIds, moderatorId, action, note?) → ReadonlyArray<Report>
 *   getQueue(filter, page)                             → QueuePage
 *   getAuditLog(filter)                                → ReadonlyArray<AuditEntry>
 *   getModeratorStats(moderatorId)                     → ModeratorStats
 *
 * Sample data: 12 reports across 5 comments + 3 moderators, covering all
 * 8 report reasons and all 7 sacred tradições.
 *
 * All mutations are append-only audit-logged. The reports store is a Map
 * keyed by ReportId — but the audit log is the source of truth for history.
 */

import {
  REPORT_REASONS,
  REPORT_REASON_LABELS,
  REPORT_REASON_DEFAULT_ACTION,
  REPORT_REASON_SEVERITY,
  requiresNote,
  isReportReason,
  type ReportReason,
} from './report-reasons.ts';
import {
  canTransition,
  transition,
  shouldAutoFlag,
  isReportStatus,
  isTerminal,
  type ReportStatus,
} from './moderation-state.ts';
import {
  appendAudit,
  getAuditLog,
  validateChain,
  _resetAuditForTests,
  type ReportId,
  type ModeratorId,
  type ActorId,
  type ModerationAuditEntry,
  type ChainValidationResult,
} from './audit-logger.ts';
import {
  SAMPLE_REPORTS,
  SAMPLE_COMMENTS,
  SAMPLE_MODERATORS,
  SAMPLE_REASON_COVERAGE,
  SAMPLE_TRADITION_COVERAGE,
} from './sample-data.ts';

// Re-export report-reasons and state helpers for convenience.
export {
  REPORT_REASONS,
  REPORT_REASON_LABELS,
  REPORT_REASON_DEFAULT_ACTION,
  REPORT_REASON_SEVERITY,
  requiresNote,
  isReportReason,
  type ReportReason,
} from './report-reasons.ts';
export {
  REPORT_STATUSES,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_COLORS,
  canTransition,
  transition,
  shouldAutoFlag,
  isReportStatus,
  isTerminal,
  type ReportStatus,
} from './moderation-state.ts';
export {
  getAuditLog,
  validateChain,
  _resetAuditForTests,
  type ModerationAuditEntry,
  type ChainValidationResult,
} from './audit-logger.ts';
export {
  SAMPLE_REPORTS,
  SAMPLE_COMMENTS,
  SAMPLE_MODERATORS,
  SAMPLE_REASON_COVERAGE,
  SAMPLE_TRADITION_COVERAGE,
} from './sample-data.ts';

// ════════════════════════════════════════════
// BRANDED TYPES
// ════════════════════════════════════════════

declare const __commentIdBrand: unique symbol;
export type CommentId = string & { readonly [__commentIdBrand]: 'CommentId' };

declare const __reporterIdBrand: unique symbol;
export type ReporterId = string & { readonly [__reporterIdBrand]: 'ReporterId' };

declare const __traditionBrand: unique symbol;
export type Tradicao = string & { readonly [__traditionBrand]: 'Tradicao' };

// Re-export branded types from audit-logger for convenience
export type { ReportId, ModeratorId } from './audit-logger.ts';

// ════════════════════════════════════════════
// SACRED TRADIÇÕES (must match W83-C sample set)
// ════════════════════════════════════════════

export const TRADICOES: ReadonlyArray<Tradicao> = Object.freeze([
  t('Cigano'),
  t('Candomblé'),
  t('Umbanda'),
  t('Ifá'),
  t('Cabala'),
  t('Astrologia'),
  t('Tantra'),
]);

export const TRADICAO_LABELS: Readonly<Record<Tradicao, string>> = Object.freeze({
  [t('Cigano')]: 'Cigano (Lenormand)',
  [t('Candomblé')]: 'Candomblé',
  [t('Umbanda')]: 'Umbanda',
  [t('Ifá')]: 'Ifá',
  [t('Cabala')]: 'Cabala',
  [t('Astrologia')]: 'Astrologia',
  [t('Tantra')]: 'Tantra',
});

export function isTradicao(s: string): s is Tradicao {
  return TRADICOES.some((tr) => (tr as string) === s);
}

// ════════════════════════════════════════════
// MODELS
// ════════════════════════════════════════════

export interface Comment {
  readonly id: CommentId;
  readonly authorId: string;
  readonly authorName: string;
  readonly tradicao: Tradicao;
  readonly text: string;
  readonly createdAt: string;
}

export interface Moderator {
  readonly id: ModeratorId;
  readonly name: string;
  readonly role: 'admin' | 'senior-mod' | 'mod';
  readonly permissions: ReadonlyArray<'approve' | 'deny' | 'escalate' | 'auto-flag' | 'batch-decide'>;
}

export interface Report {
  readonly id: ReportId;
  readonly commentId: CommentId;
  readonly reporterId: ReporterId;
  readonly reason: ReportReason;
  readonly note: string | null;
  readonly status: ReportStatus;
  readonly assignedModeratorId: ModeratorId | null;
  readonly decidedBy: ModeratorId | null;
  readonly decidedAt: string | null;
  readonly decisionNote: string | null;
  readonly createdAt: string;
}

export interface QueueFilter {
  readonly status?: ReportStatus | 'all' | 'open';
  readonly reason?: ReportReason | 'all';
  readonly tradicao?: Tradicao | 'all';
  readonly assignedModeratorId?: ModeratorId | 'all' | 'unassigned';
  readonly search?: string;
}

export interface QueuePage {
  readonly entries: ReadonlyArray<{
    readonly report: Report;
    readonly comment: Comment | null;
    readonly reporterName: string;
    readonly ageMinutes: number;
  }>;
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
}

export interface ModeratorStats {
  readonly moderatorId: ModeratorId;
  readonly decided: number;
  readonly approved: number;
  readonly denied: number;
  readonly escalated: number;
  readonly batchOps: number;
  readonly avgDecisionSeconds: number;
}

export type ModerationAction = 'approve' | 'deny' | 'escalate' | 'auto-flag';

// ════════════════════════════════════════════
// REPORTS STORE
// ════════════════════════════════════════════

const REPORTS_STORE: Map<ReportId, Report> = new Map();
let _seq = 0;
function nextReportId(): ReportId {
  _seq++;
  return ('rep-' + _seq.toString(36).padStart(4, '0')) as ReportId;
}

function _loadSampleData(): void {
  for (const r of SAMPLE_REPORTS) {
    REPORTS_STORE.set(r.id, r);
  }
  // Mirror the initial reports as audit entries so the chain starts populated
  for (const r of SAMPLE_REPORTS) {
    appendAudit({
      actorId: r.reporterId as unknown as ActorId,
      action: 'submit-report',
      reportId: r.id,
      before: null,
      after: r.status,
      reason: r.reason,
      note: r.note,
      meta: Object.freeze({
        commentId: r.commentId,
        tradicao: SAMPLE_COMMENTS.find((c) => c.id === r.commentId)?.tradicao ?? null,
      }),
    });
  }
}

_loadSampleData();

// ════════════════════════════════════════════
// PUBLIC API
// ════════════════════════════════════════════

export function submitReport(
  commentId: CommentId,
  reporterId: ReporterId,
  reason: ReportReason | string,
  note?: string,
): Report {
  const reasonTyped = isReportReason(reason) ? reason : ('other' as ReportReason);
  const id = nextReportId();
  const initialStatus: ReportStatus = shouldAutoFlag(
    SAMPLE_COMMENTS.find((c) => c.id === commentId)?.text ?? '',
    reasonTyped,
  )
    ? 'auto-flagged'
    : 'pending';
  const report: Report = Object.freeze({
    id,
    commentId,
    reporterId,
    reason: reasonTyped,
    note: note ?? null,
    status: initialStatus,
    assignedModeratorId: null,
    decidedBy: null,
    decidedAt: null,
    decisionNote: null,
    createdAt: new Date(0).toISOString(),
  });
  REPORTS_STORE.set(id, report);
  appendAudit({
    actorId: reporterId as unknown as ActorId,
    action: initialStatus === 'auto-flagged' ? 'auto-flag' : 'submit-report',
    reportId: id,
    before: null,
    after: initialStatus,
    reason: reasonTyped,
    note: note ?? null,
    meta: Object.freeze({ commentId }),
  });
  return report;
}

export function getReport(id: ReportId): Report | null {
  return REPORTS_STORE.get(id) ?? null;
}

export interface DecideArgs {
  readonly reportId: ReportId;
  readonly moderatorId: ModeratorId;
  readonly action: ModerationAction;
  readonly note?: string;
}

export function decide(args: DecideArgs): Report {
  const existing = REPORTS_STORE.get(args.reportId);
  if (!existing) {
    throw new Error(`Report ${args.reportId} not found`);
  }
  const moderator = SAMPLE_MODERATORS.find((m) => m.id === args.moderatorId);
  if (!moderator) {
    throw new Error(`Moderator ${args.moderatorId} not found`);
  }
  if (!moderator.permissions.includes(args.action)) {
    throw new Error(
      `Moderator ${moderator.name} lacks permission for action ${args.action}`,
    );
  }
  const targetStatus: ReportStatus =
    args.action === 'approve'
      ? 'approved'
      : args.action === 'deny'
        ? 'denied'
        : args.action === 'escalate'
          ? 'escalated'
          : 'auto-flagged';
  if (requiresNote(existing.reason) && (!args.note || args.note.trim() === '')) {
    throw new Error(
      `Reason "${existing.reason}" requires a moderator note for resolution`,
    );
  }
  if (!canTransition(existing.status, targetStatus)) {
    throw new Error(
      `Cannot transition report ${args.reportId} from ${existing.status} to ${targetStatus}`,
    );
  }
  transition(existing.status, targetStatus); // validates
  const updated: Report = Object.freeze({
    ...existing,
    status: targetStatus,
    assignedModeratorId: args.moderatorId,
    decidedBy: args.moderatorId,
    decidedAt: new Date(0).toISOString(),
    decisionNote: args.note ?? null,
  });
  REPORTS_STORE.set(args.reportId, updated);
  appendAudit({
    actorId: args.moderatorId as unknown as ActorId,
    action: 'transition',
    reportId: args.reportId,
    before: existing.status,
    after: targetStatus,
    reason: existing.reason,
    note: args.note ?? null,
    meta: Object.freeze({ commentId: existing.commentId }),
  });
  return updated;
}

export interface BatchDecideArgs {
  readonly reportIds: ReadonlyArray<ReportId>;
  readonly moderatorId: ModeratorId;
  readonly action: ModerationAction;
  readonly note?: string;
}

export interface BatchDecideResult {
  readonly results: ReadonlyArray<{
    readonly reportId: ReportId;
    readonly ok: boolean;
    readonly error: string | null;
    readonly report: Report | null;
  }>;
  readonly succeeded: number;
  readonly failed: number;
}

export function batchDecide(args: BatchDecideArgs): BatchDecideResult {
  const moderator = SAMPLE_MODERATORS.find((m) => m.id === args.moderatorId);
  if (!moderator) {
    throw new Error(`Moderator ${args.moderatorId} not found`);
  }
  if (!moderator.permissions.includes('batch-decide')) {
    throw new Error(`Moderator ${moderator.name} lacks permission for batch-decide`);
  }
  const results: Array<{
    reportId: ReportId;
    ok: boolean;
    error: string | null;
    report: Report | null;
  }> = [];
  let succeeded = 0;
  let failed = 0;
  for (const id of args.reportIds) {
    try {
      const updated = decide({
        reportId: id,
        moderatorId: args.moderatorId,
        action: args.action,
        note: args.note,
      });
      results.push({ reportId: id, ok: true, error: null, report: updated });
      succeeded++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({ reportId: id, ok: false, error: msg, report: null });
      failed++;
    }
  }
  // Single audit entry summarizing the batch (atomicity trail)
  appendAudit({
    actorId: args.moderatorId as unknown as ActorId,
    action: 'batch-decide',
    reportId: ('batch-' + Date.now().toString(36)) as ReportId,
    before: null,
    after: null,
    reason: null,
    note: args.note ?? null,
    meta: Object.freeze({
      action: args.action,
      succeeded,
      failed,
      reportIds: Object.freeze(args.reportIds.slice()),
    }),
  });
  return Object.freeze({
    results: Object.freeze(results),
    succeeded,
    failed,
  });
}

export function getQueue(filter: QueueFilter, page = 1, pageSize = 20): QueuePage {
  const list = Array.from(REPORTS_STORE.values());
  const filtered = list.filter((r) => matchesFilter(r, filter));
  filtered.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const start = (page - 1) * pageSize;
  const slice = filtered.slice(start, start + pageSize);
  const entries = slice.map((r) => ({
    report: r,
    comment: SAMPLE_COMMENTS.find((c) => c.id === r.commentId) ?? null,
    reporterName: 'user-' + r.reporterId.slice(-6),
    ageMinutes: Math.floor((Date.now() - new Date(r.createdAt).getTime()) / 60000),
  }));
  return Object.freeze({
    entries: Object.freeze(entries),
    total: filtered.length,
    page,
    pageSize,
    hasMore: start + pageSize < filtered.length,
  });
}

function matchesFilter(r: Report, filter: QueueFilter): boolean {
  if (filter.status && filter.status !== 'all') {
    if (filter.status === 'open') {
      if (r.status === 'approved' || r.status === 'denied') return false;
    } else if (r.status !== filter.status) {
      return false;
    }
  }
  if (filter.reason && filter.reason !== 'all' && r.reason !== filter.reason) return false;
  if (filter.tradicao && filter.tradicao !== 'all') {
    const comment = SAMPLE_COMMENTS.find((c) => c.id === r.commentId);
    if (!comment || comment.tradicao !== filter.tradicao) return false;
  }
  if (filter.assignedModeratorId && filter.assignedModeratorId !== 'all') {
    if (filter.assignedModeratorId === 'unassigned') {
      if (r.assignedModeratorId !== null) return false;
    } else if (r.assignedModeratorId !== filter.assignedModeratorId) {
      return false;
    }
  }
  if (filter.search && filter.search.trim() !== '') {
    const q = filter.search.toLowerCase();
    const comment = SAMPLE_COMMENTS.find((c) => c.id === r.commentId);
    const text = (comment?.text ?? '') + ' ' + (r.note ?? '');
    if (!text.toLowerCase().includes(q)) return false;
  }
  return true;
}

export function getModeratorStats(moderatorId: ModeratorId): ModeratorStats {
  const audit = getAuditLog();
  let decided = 0;
  let approved = 0;
  let denied = 0;
  let escalated = 0;
  let batchOps = 0;
  let totalDecisionMs = 0;
  let decisionCount = 0;
  for (const e of audit) {
    if ((e.actorId as unknown as string) !== (moderatorId as unknown as string)) continue;
    if (e.action === 'transition') {
      decided++;
      if (e.after === 'approved') approved++;
      if (e.after === 'denied') denied++;
      if (e.after === 'escalated') escalated++;
      const t = new Date(e.ts).getTime();
      if (!Number.isNaN(t)) {
        totalDecisionMs += t;
        decisionCount++;
      }
    }
    if (e.action === 'batch-decide') {
      batchOps++;
    }
  }
  const avgDecisionSeconds =
    decisionCount > 0 ? Math.floor(totalDecisionMs / decisionCount / 1000) : 0;
  return Object.freeze({
    moderatorId,
    decided,
    approved,
    denied,
    escalated,
    batchOps,
    avgDecisionSeconds,
  });
}

/** Reset all in-memory state. Tests only. */
export function _resetForTests(): void {
  REPORTS_STORE.clear();
  _seq = 0;
  _resetAuditForTests();
  _loadSampleData();
}

function t(s: string): Tradicao {
  return s as Tradicao;
}

// Version constants (mirror W75-A pattern)
export const W84_C_VERSION = '1.0.0' as const;
export const W84_C_CYCLE = 84 as const;
export const W84_C_REASON_COUNT = 8 as const;
export const W84_C_TRADITION_COUNT = 7 as const;
export const W84_C_SAMPLE_REPORT_COUNT = 12 as const;
export const W84_C_SAMPLE_COMMENT_COUNT = 7 as const;
export const W84_C_SAMPLE_MODERATOR_COUNT = 3 as const;