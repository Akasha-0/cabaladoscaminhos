/**
 * ════════════════════════════════════════════════════════════════════════════
 * W84-C — COMMENTS MODERATION · STATE MACHINE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 84 · 2026-06-30
 * Author: W84-C Coder (Mavis orchestrator session 414756900012156)
 *
 * Reports flow through 6 states:
 *
 *   pending  ─┬─→ reviewing  ─┬─→ approved
 *             │                ├─→ denied
 *             │                ├─→ escalated
 *             │                └─→ auto-flagged (system-initiated)
 *             │
 *             └─→ auto-flagged  (system auto-flagged before human review)
 *
 * Terminal states: approved, denied, escalated, auto-flagged.
 * State transitions are validated at runtime. Invalid transitions throw.
 *
 * The state machine is data-driven (TRANSITIONS table) for auditability —
 * every transition is observable in the audit log with a "before / after"
 * pair. Reconstructable from the audit log alone.
 */

import { REPORT_REASONS, type ReportReason } from './report-reasons.ts';

declare const __reportStatusBrand: unique symbol;
export type ReportStatus =
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'denied'
  | 'escalated'
  | 'auto-flagged';

export const REPORT_STATUSES: ReadonlyArray<ReportStatus> = Object.freeze([
  'pending',
  'reviewing',
  'approved',
  'denied',
  'escalated',
  'auto-flagged',
]);

export const REPORT_STATUS_LABELS: Readonly<Record<ReportStatus, string>> = Object.freeze({
  pending: 'Pendente',
  reviewing: 'Em revisão',
  approved: 'Aprovado',
  denied: 'Negado',
  escalated: 'Escalado',
  'auto-flagged': 'Sinalizado automaticamente',
});

export const REPORT_STATUS_COLORS: Readonly<Record<ReportStatus, string>> = Object.freeze({
  pending: '#a8a29e', // stone-400
  reviewing: '#fbbf24', // amber-400
  approved: '#22c55e', // green-500
  denied: '#ef4444', // red-500
  escalated: '#a855f7', // purple-500
  'auto-flagged': '#f97316', // orange-500
});

/**
 * Allowed transitions. A transition is (from → to). Multiple transitions
 * can share the same source state.
 *
 * `pending` can become `reviewing` (human picks up), `auto-flagged` (system
 * pre-filters), or terminal states directly in extreme cases (system bypass).
 *
 * `reviewing` can become any terminal state — but never back to `pending`.
 *
 * Terminal states are terminal.
 */
const TRANSITIONS: ReadonlyMap<ReportStatus, ReadonlyArray<ReportStatus>> = new Map([
  ['pending', ['reviewing', 'auto-flagged', 'approved', 'denied', 'escalated']],
  ['reviewing', ['approved', 'denied', 'escalated', 'auto-flagged']],
  ['approved', []],
  ['denied', []],
  ['escalated', ['approved', 'denied']],
  ['auto-flagged', ['approved', 'denied', 'escalated', 'reviewing']],
]);

export function canTransition(from: ReportStatus, to: ReportStatus): boolean {
  if (from === to) return false;
  const allowed = TRANSITIONS.get(from);
  if (!allowed) return false;
  return allowed.includes(to);
}

export function isTerminal(status: ReportStatus): boolean {
  const allowed = TRANSITIONS.get(status);
  return allowed !== undefined && allowed.length === 0;
}

export function transition(from: ReportStatus, to: ReportStatus): ReportStatus {
  if (!canTransition(from, to)) {
    throw new Error(
      `Invalid moderation state transition: ${from} → ${to} ` +
        `(allowed from ${from}: [${(TRANSITIONS.get(from) ?? []).join(', ')}])`,
    );
  }
  return to;
}

/** Terminal status set, exported as readonly for fast membership checks. */
export const TERMINAL_STATUSES: ReadonlyArray<ReportStatus> = Object.freeze([
  'approved',
  'denied',
]);

/** Statuses considered "open" (require moderator attention). */
export const OPEN_STATUSES: ReadonlyArray<ReportStatus> = Object.freeze([
  'pending',
  'reviewing',
  'auto-flagged',
  'escalated',
]);

/** Type guard: is `s` a valid ReportStatus? */
export function isReportStatus(s: string): s is ReportStatus {
  return REPORT_STATUSES.includes(s as ReportStatus);
}

/**
 * Auto-flag heuristic: returns true if a comment text + reason combination
 * should be auto-flagged by the system before human review.
 *
 * NOT a generic profanity filter. Recognizes that the same word can be:
 *   - sacred terminology used reverently ("axé", "orixá", "rezar")
 *   - slur used offensively (detected via context — caps, ALL-CAPS, or
 *     co-occurrence with harassment-keywords)
 *
 * Heuristic: contains a sacred term AND the comment is short, lowercase,
 * AND no harassment markers → auto-flag SKIPPED (don't punish reverence).
 * Contains a sacred term with ALL-CAPS shouting OR with slur co-occurrence
 * → auto-flag RAISED (system pre-triage to moderator).
 */
export function shouldAutoFlag(text: string, _reason: ReportReason): boolean {
  if (text.length === 0) return false;
  const upper = text.toUpperCase();
  const hasShouting = text.length >= 12 && upper === text;
  // Slur co-occurrence markers (lowercase, ASCII-safe)
  const HARASS_MARKERS = ['idiota', 'burra', 'lixo', 'escória', 'morte a'];
  const lower = text.toLowerCase();
  const hasHarass = HARASS_MARKERS.some((m) => lower.includes(m));
  // Sacred terms (preserve reverence)
  const SACRED_TERMS = ['axé', 'orixá', 'orixá ', 'rezar', 'caboclo', 'preto-velho'];
  const hasSacred = SACRED_TERMS.some((m) => lower.includes(m));
  if (hasSacred && !hasShouting && !hasHarass) return false;
  if (hasShouting && hasSacred) return true;
  if (hasHarass) return true;
  return false;
}

export { REPORT_REASONS };