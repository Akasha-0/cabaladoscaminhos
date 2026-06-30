/**
 * ════════════════════════════════════════════════════════════════════════════
 * W84-C — COMMENTS MODERATION · REPORT REASONS CATALOG
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 84 · 2026-06-30
 * Author: W84-C Coder (Mavis orchestrator session 414756900012156)
 *
 * 8 standard report reasons for the comments moderation queue. Each reason
 * carries a Portuguese label, a severity tier (1 = soft, 3 = must-act), and
 * a default action hint that moderators can override per report.
 *
 * SACRED-CULTURAL NOTE: "tradition-misrepresentation" is NOT a slur filter.
 * Disrespecting a Cigano Ramiro reading by mistaking it for Mãe Iyá's orixá
 * protocol is a cross-cultural protocol violation, not harassment. The
 * auto-flag heuristic (engine-side) must distinguish sacred terminology used
 * reverently from the same words used as slurs.
 *
 * The 8 reasons are intentionally heterogeneous:
 *   - spam              (low severity, automated handling OK)
 *   - harassment        (high severity, requires human review)
 *   - hate-speech       (max severity, auto-flag + escalation)
 *   - misinformation    (medium severity, fact-check flow)
 *   - lgpd-violation    (high severity, LGPD audit trail REQUIRED)
 *   - tradition-misrepresentation (medium severity, cross-cultural protocol)
 *   - off-topic         (low severity, silent removal OK)
 *   - other             (catch-all, requires moderator note)
 */

declare const __reportReasonBrand: unique symbol;
export type ReportReason = string & { readonly [__reportReasonBrand]: 'ReportReason' };

export const REPORT_REASONS: ReadonlyArray<ReportReason> = Object.freeze([
  r('spam'),
  r('harassment'),
  r('hate-speech'),
  r('misinformation'),
  r('lgpd-violation'),
  r('tradition-misrepresentation'),
  r('off-topic'),
  r('other'),
]);

export const REPORT_REASON_LABELS: Readonly<Record<ReportReason, string>> = Object.freeze({
  [r('spam')]: 'Spam / promoção',
  [r('harassment')]: 'Assédio ou ataque pessoal',
  [r('hate-speech')]: 'Discurso de ódio',
  [r('misinformation')]: 'Informação falsa ou perigosa',
  [r('lgpd-violation')]: 'Violação de LGPD / dados pessoais',
  [r('tradition-misrepresentation')]: 'Deturpação de tradição',
  [r('off-topic')]: 'Fora do tema da discussão',
  [r('other')]: 'Outro (requer nota)',
});

/**
 * Severity tier: 1 = soft (auto-decide), 2 = medium (moderator queue),
 * 3 = high (must escalate to admin + audit log).
 */
export const REPORT_REASON_SEVERITY: Readonly<Record<ReportReason, 1 | 2 | 3>> = Object.freeze({
  [r('spam')]: 1,
  [r('harassment')]: 2,
  [r('hate-speech')]: 3,
  [r('misinformation')]: 2,
  [r('lgpd-violation')]: 3,
  [r('tradition-misrepresentation')]: 2,
  [r('off-topic')]: 1,
  [r('other')]: 2,
});

/**
 * Default action hint. Moderators can override per-report. The hints map the
 * reason to the most likely correct action based on community-standards
 * patterns observed in similar apps.
 */
export const REPORT_REASON_DEFAULT_ACTION: Readonly<
  Record<ReportReason, 'auto-flag' | 'approve' | 'deny' | 'escalate'>
> = Object.freeze({
  [r('spam')]: 'deny',
  [r('harassment')]: 'deny',
  [r('hate-speech')]: 'escalate',
  [r('misinformation')]: 'escalate',
  [r('lgpd-violation')]: 'escalate',
  [r('tradition-misrepresentation')]: 'deny',
  [r('off-topic')]: 'deny',
  [r('other')]: 'approve',
});

/** True if this reason requires a moderator note on resolution. */
export function requiresNote(reason: ReportReason): boolean {
  return reason === r('other') || reason === r('lgpd-violation');
}

/** Type guard: is `s` a valid ReportReason? */
export function isReportReason(s: string): s is ReportReason {
  return REPORT_REASONS.some((rr) => (rr as string) === s);
}

function r(s: string): ReportReason {
  return s as ReportReason;
}

export const REASON_COUNT = 8 as const;