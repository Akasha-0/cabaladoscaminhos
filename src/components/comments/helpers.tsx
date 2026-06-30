/**
 * ════════════════════════════════════════════════════════════════════════════
 * W87-C — Thread UI helpers (presentation-only, no engine logic)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Small presentational helpers used by the Thread component:
 *   - formatTimeAgo: pt-BR "xmin atrás"
 *   - renderBodyWithMentions: body with @handle highlighted as <a href>
 *   - detectMentionTrigger: walks backward from caret to find an active @-token
 *   - STYLES: shared mobile-first inline-style tokens (44×44 touch targets,
 *     a11y-compliant focus-friendly borders, accent for current).
 */

import React from 'react';

// ────────────────────────────────────────────────────────────────────────────
// Shared style tokens (mobile-first, 44×44 touch targets, a11y-friendly)
// ────────────────────────────────────────────────────────────────────────────

export const STYLES = {
  thread: { listStyle: 'none', margin: 0, padding: '12px 0' } as const,
  bubble: {
    border: '1px solid rgba(127,127,127,0.25)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    background: 'rgba(255,255,255,0.04)',
  } as const,
  reply: {
    marginLeft: 24,
    borderLeft: '2px solid rgba(127,127,127,0.2)',
    paddingLeft: 12,
    marginBottom: 10,
  } as const,
  textarea: {
    width: '100%',
    minHeight: 72,
    padding: 8,
    fontSize: 16,
    borderRadius: 8,
    border: '1px solid rgba(127,127,127,0.4)',
    boxSizing: 'border-box' as const,
  } as const,
  btn: {
    minHeight: 44,
    minWidth: 44,
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid rgba(127,127,127,0.5)',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
  } as const,
  primaryBtn: {
    minHeight: 44,
    minWidth: 44,
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid rgba(127,200,127,0.8)',
    background: 'rgba(127,200,127,0.16)',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  } as const,
  dropdown: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 10,
    marginTop: 4,
    maxHeight: 180,
    overflowY: 'auto' as const,
    background: 'rgba(30,30,30,0.95)',
    border: '1px solid rgba(127,127,127,0.5)',
    borderRadius: 8,
    listStyle: 'none',
    padding: 4,
  } as const,
  mentionRow: {
    padding: '8px 10px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    minHeight: 36,
  } as const,
  consentBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 0',
    fontSize: 13,
    color: 'rgba(220,220,220,0.85)',
  } as const,
  errorBox: {
    padding: '8px 10px',
    borderRadius: 6,
    background: 'rgba(255,80,80,0.12)',
    border: '1px solid rgba(255,80,80,0.4)',
    color: '#ffb0b0',
    marginBottom: 8,
    fontSize: 13,
  } as const,
} as const;

// ────────────────────────────────────────────────────────────────────────────
// Time formatting — pt-BR relative
// ────────────────────────────────────────────────────────────────────────────

export function formatTimeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));
  if (diffSec < 60) return `${diffSec}s atrás`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}min atrás`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atrás`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d atrás`;
}

// ────────────────────────────────────────────────────────────────────────────
// Body render — highlight @handle as <a href="/profile/handle">
// ────────────────────────────────────────────────────────────────────────────

export function renderBodyWithMentions(body: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /(^|\s)@([A-Za-z0-9_.-]{1,30})/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(body)) !== null) {
    const lead = m[1] ?? '';
    const handle = m[2] ?? '';
    const atOffset = m.index + lead.length;
    if (atOffset > last) parts.push(body.slice(last, atOffset));
    parts.push(
      React.createElement(
        'a',
        {
          key: `m${key++}`,
          href: `/profile/${handle.toLowerCase()}`,
          'data-mention': handle.toLowerCase(),
          style: { color: '#7cd1ff', textDecoration: 'underline' },
        },
        `@${handle}`,
      ),
    );
    last = atOffset + 1 + handle.length;
  }
  if (last < body.length) parts.push(body.slice(last));
  return React.createElement(React.Fragment, null, ...parts);
}

// ────────────────────────────────────────────────────────────────────────────
// Mention trigger detection — pure, exported for the spec
// ────────────────────────────────────────────────────────────────────────────

export interface MentionTrigger {
  /** Term typed after `@` (may be empty). */
  readonly term: string;
  /** Offset of the `@` character. */
  readonly start: number;
}

/**
 * Detect an active `@mention` trigger at `caret`. Walks backward from the
 * caret; the trigger ends at the first whitespace OR start-of-string-after-`@`.
 *
 * @returns the trigger if active, null otherwise.
 */
export function detectMentionTrigger(
  body: string,
  caret: number,
): MentionTrigger | null {
  let i = caret - 1;
  while (i >= 0) {
    const ch = body[i];
    if (ch === '@') {
      const prev = i > 0 ? body[i - 1] : '';
      if (i === 0 || (prev && /\s/.test(prev))) {
        return { term: body.slice(i + 1, caret), start: i };
      }
      return null;
    }
    if (ch && /\s/.test(ch)) return null;
    i -= 1;
  }
  return null;
}

/**
 * Insert a handle into `body` at a given trigger — returns the new string.
 * Pure — does NOT mutate state. Used for both keystroke-driven insertion in
 * the component AND for direct invocation in tests.
 */
export function applyHandleInsertion(
  body: string,
  trigger: MentionTrigger,
  handle: string,
): string {
  const before = body.slice(0, trigger.start + 1);
  const after = body.slice(trigger.start + 1 + trigger.term.length);
  return `${before}${handle} ${after}`;
}

/** Compute the caret offset after a handle insertion (for `setSelectionRange`). */
export function caretAfterInsertion(
  trigger: MentionTrigger,
  handle: string,
): number {
  return trigger.start + 1 + handle.length + 1; // 1 for `@`, 1 for trailing space
}
