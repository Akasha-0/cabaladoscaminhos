/**
 * ════════════════════════════════════════════════════════════════════════════
 * W87-C — THREAD COMPONENT SPEC (source-inspection)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Per W86-B precedent: source-inspection spec for 'use client' components.
 * Avoids a full vitest+jsdom render layer — instead reads the source file
 * and asserts that mandatory contracts (ARIA roles, data-testid, LGPD gate,
 * mention parser export) are present in EITHER literal-JSX (`testid="..."`)
 * OR expression-JSX (`testid={cond ? 'a' : 'b'}`) form.
 *
 * Run: npx vitest run src/components/comments/Thread.spec.tsx
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const cwd = process.cwd();
const threadSrc = readFileSync(
  resolve(cwd, 'src/components/comments/Thread.tsx'),
  'utf8',
);
const composerSrc = readFileSync(
  resolve(cwd, 'src/components/comments/Composer.tsx'),
  'utf8',
);
const helpersSrc = readFileSync(
  resolve(cwd, 'src/components/comments/helpers.tsx'),
  'utf8',
);

/**
 * Match a data-testid regardless of form: literal ("..."), expression
 * ({...}), or in either file. The minimal contract is that the string
 * 'comment-root-form' appears AS A DELIMITED LITERAL somewhere in src.
 */
function hasTestId(src: string, literal: string): boolean {
  // Form A: data-testid="literal"
  if (src.includes(`data-testid="${literal}"`)) return true;
  // Form B: data-testid={'literal'} or {'literal' : 'literal'} etc.
  if (src.includes(`'${literal}'`)) return true;
  if (src.includes(`"${literal}"`)) return true;
  return false;
}

describe('Thread ARIA + data-testid contracts', () => {
  it('exposes role="list" on the thread root', () => {
    expect(threadSrc).toMatch(/role="list"/);
  });

  it('exposes role="listitem" on each comment bubble', () => {
    expect(threadSrc).toMatch(/role="listitem"/);
    expect(threadSrc).toMatch(/data-testid="comment-bubble"/);
  });

  it('exposes data-testid="thread-list"', () => {
    expect(threadSrc).toMatch(/data-testid="thread-list"/);
  });

  it('exposes data-testid for "comment-root-form" (root composer)', () => {
    expect(hasTestId(composerSrc, 'comment-root-form')).toBe(true);
  });

  it('exposes data-testid for "reply-form" (inline replies)', () => {
    expect(hasTestId(composerSrc, 'reply-form')).toBe(true);
  });

  it('exposes data-testid="mention-dropdown"', () => {
    expect(composerSrc).toMatch(/data-testid="mention-dropdown"/);
    expect(composerSrc).toMatch(/role="listbox"/);
  });

  it('exposes data-testid="lgpd-consent" on the consent checkbox', () => {
    expect(composerSrc).toMatch(/data-testid="lgpd-consent"/);
    expect(composerSrc).toMatch(/required/);
  });

  it('exposes aria-expanded on the reply toggle button', () => {
    expect(threadSrc).toMatch(/aria-expanded/);
    expect(threadSrc).toMatch(/aria-controls/);
  });

  it('Renders role="alert" on errors for SR announcement', () => {
    expect(threadSrc).toMatch(/role="alert"/);
  });
});

describe('Thread mobile-first / a11y', () => {
  it('STYLES (helpers) exports textarea with 16px font-size (mobile-friendly)', () => {
    expect(helpersSrc).toMatch(/fontSize:\s*16/);
  });

  it('STYLES (helpers) exports buttons with min 44×44 touch targets', () => {
    expect(helpersSrc).toMatch(/minHeight:\s*44/);
    expect(helpersSrc).toMatch(/minWidth:\s*44/);
  });

  it('Thread and Composer reference STYLES.btn / STYLES.primaryBtn', () => {
    expect(threadSrc).toMatch(/STYLES\.btn/);
    expect(composerSrc).toMatch(/STYLES\.primaryBtn/);
  });
});

describe('Helpers exports', () => {
  it('exports detectMentionTrigger as a named function', () => {
    expect(helpersSrc).toMatch(/export function detectMentionTrigger/);
  });

  it('exports applyHandleInsertion as a named function', () => {
    expect(helpersSrc).toMatch(/export function applyHandleInsertion/);
  });

  it('exports caretAfterInsertion as a named function', () => {
    expect(helpersSrc).toMatch(/export function caretAfterInsertion/);
  });

  it('exports renderBodyWithMentions which produces <a data-mention>', () => {
    expect(helpersSrc).toMatch(/data-mention/);
    expect(helpersSrc).toMatch(/export function renderBodyWithMentions/);
  });

  it('exports STYLES with required mobile-first tokens', () => {
    expect(helpersSrc).toMatch(/export const STYLES/);
    expect(helpersSrc).toMatch(/minHeight:\s*44/);
  });
});

describe('Thread delegates form UI to Composer (no duplication)', () => {
  it('Thread does NOT redeclare the form/dropdown/lgpd testids', () => {
    // The extraction guarantees one source of truth.
    expect(threadSrc).not.toMatch(/data-testid="comment-root-form"/);
    expect(threadSrc).not.toMatch(/data-testid="reply-form"/);
    expect(threadSrc).not.toMatch(/data-testid="mention-dropdown"/);
    expect(threadSrc).not.toMatch(/data-testid="lgpd-consent"/);
  });

  it('Thread imports Composer rather than redefining it', () => {
    expect(threadSrc).toMatch(/from '\.\/Composer'/);
  });
});
