/**
 * ════════════════════════════════════════════════════════════════════════════
 * W87-C — PARSER SPEC (22+ asserts)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Vitest-runnable spec for parseMentions + sanitizeBody.
 *
 * Run: npx vitest run src/engine/comments/parser.spec.ts
 */

import { describe, it, expect } from 'vitest';

import { parseMentions, sanitizeBody, normalizeHandle } from './parser';
import { asUserId } from './types';

describe('parseMentions', () => {
  const handles = new Set(['ana', 'bia', 'carla', 'dora', 'ester']);

  it('returns [] for empty body', () => {
    expect(parseMentions('', handles).length).toBe(0);
  });

  it('returns [] for empty knownHandles', () => {
    expect(parseMentions('hi @ana', new Set()).length).toBe(0);
  });

  it('detects a single @ana at start', () => {
    const m = parseMentions('@ana oi', handles);
    expect(m.length).toBe(1);
    expect(m[0]?.handle).toBe('@ana');
    expect(m[0]?.userId).toBe(asUserId('ana'));
    expect(m[0]?.start).toBe(0);
    expect(m[0]?.end).toBe(4);
  });

  it('detects a single @ana after whitespace', () => {
    const m = parseMentions('oi @ana', handles);
    expect(m.length).toBe(1);
    expect(m[0]?.start).toBe(3);
  });

  it('detects @Ana case-insensitively but preserves display case', () => {
    const m = parseMentions('oi @Ana', handles);
    expect(m.length).toBe(1);
    expect(m[0]?.handle).toBe('@Ana');
    expect(m[0]?.userId).toBe(asUserId('ana'));
  });

  it('ignores handles not in knownHandles', () => {
    expect(parseMentions('oi @ghost', handles).length).toBe(0);
  });

  it('ignores @ inside URLs (no leading whitespace)', () => {
    expect(parseMentions('see https://x.com/@notme', handles).length).toBe(0);
  });

  it('detects multiple mentions', () => {
    const m = parseMentions('@ana chamou @bia e @carla', handles);
    expect(m.length).toBe(3);
    expect(m[0]?.handle).toBe('@ana');
    expect(m[1]?.handle).toBe('@bia');
    expect(m[2]?.handle).toBe('@carla');
  });

  it('handles up to MAX_MENTIONS_PER_COMMENT (10) then truncates', () => {
    const many = new Set(
      Array.from({ length: 20 }, (_, i) => `u${i}`),
    );
    const body = Array.from({ length: 20 }, (_, i) => `@u${i}`).join(' ');
    const m = parseMentions(body, many);
    expect(m.length).toBe(10);
  });

  it('start/end offsets are inclusive of @ and end-exclusive', () => {
    const m = parseMentions('abc @bia xyz', handles);
    expect(m[0]?.start).toBe(4);
    expect(m[0]?.end).toBe(8);
  });

  it('results are sorted by start offset', () => {
    const m = parseMentions('@carla and @ana and @bia', handles);
    expect(m[0]?.start).toBe(0);
    expect(m[1]?.start).toBe(11);
    expect(m[2]?.start).toBe(20);
  });
});

describe('sanitizeBody', () => {
  it('returns empty string for empty input', () => {
    expect(sanitizeBody('')).toBe('');
  });

  it('returns trimmed empty for whitespace-only input', () => {
    expect(sanitizeBody('   ')).toBe('');
  });

  it('strips <script> blocks', () => {
    const out = sanitizeBody('hi <script>alert(1)</script>bye');
    expect(out).not.toMatch(/script/i);
    expect(out).toContain('hi');
    expect(out).toContain('bye');
  });

  it('strips multi-line <script> with attributes', () => {
    const xs =
      '<script type="text/javascript">\n      evil();\n    </script>safe';
    const out = sanitizeBody(xs);
    expect(out.includes('safe')).toBe(true);
    expect(out.includes('evil')).toBe(false);
  });

  it('strips inline event handlers (onclick, onload, onerror)', () => {
    expect(sanitizeBody('<a onclick="x">y</a>')).not.toMatch(/onclick/i);
    expect(sanitizeBody('<img onload="y">')).not.toMatch(/onload/i);
    expect(sanitizeBody('<img onerror="evil">')).not.toMatch(/onerror/i);
  });

  it('strips javascript: URIs (case-insensitive)', () => {
    expect(sanitizeBody('click javascript:alert(1)')).not.toMatch(/javascript/i);
    expect(sanitizeBody('click JAVASCRIPT:alert(1)')).not.toMatch(/JAVASCRIPT/i);
  });

  it('strips data:text/html URIs', () => {
    const out = sanitizeBody('open data:text/html,<script>1</script>');
    expect(out).not.toMatch(/data:text\/html/i);
  });

  it('strips <iframe> blocks', () => {
    const out = sanitizeBody('<iframe src="evil.com"></iframe>safe');
    expect(out).toBe('safe');
  });

  it('strips <embed> self-closing tags', () => {
    const out = sanitizeBody('<embed src="x">safe');
    expect(out).toBe('safe');
  });

  it('preserves accented Brazilian characters', () => {
    const input = 'Olá, axé para vocês';
    expect(sanitizeBody(input)).toBe(input);
  });

  it('preserves sacred Candomblé / Orixá / Caboclo terms verbatim', () => {
    const body =
      'Orixá Oxalá, Caboclo da Praia, Candomblé e Ifá — tudo junto. Axé!';
    expect(sanitizeBody(body)).toBe(body);
  });

  it('preserves Cabala + Sefirá terms', () => {
    const input = 'Keter é a Sefirá da coroa';
    expect(sanitizeBody(input)).toBe(input);
  });

  it('is idempotent (running twice = running once)', () => {
    const x = sanitizeBody('<script>x</script>hi');
    expect(sanitizeBody(x)).toBe(x);
  });
});

describe('normalizeHandle', () => {
  it('lowercases + strips leading @', () => {
    expect(normalizeHandle('@Ana')).toBe('ana');
    expect(normalizeHandle('Ana')).toBe('ana');
    expect(normalizeHandle('  @ANA  ')).toBe('ana');
  });
});
