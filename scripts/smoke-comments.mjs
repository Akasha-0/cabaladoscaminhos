#!/usr/bin/env node
/**
 * ════════════════════════════════════════════════════════════════════════════
 * W87-C — COMMENTS THREAD SMOKE HARNESS
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Node-runnable smoke checks. Imports the engine directly via tsx — runs
 * WITHOUT a test framework so it survives sandbox resets (cycle 71 lesson).
 *
 *  13 invariants covering: CRUD, LGPD, mentions, sanitize, max depth,
 *                          thread grouping, sacred-term preservation,
 *                          ARIA contracts (via source-inspection).
 *
 * Run: node scripts/smoke-comments.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { createCommentsEngine, validateLgpd } from '../src/engine/comments/factory.ts';
import {
  CommentError,
  ERROR_CODES,
  asCommentId,
  asPostId,
  asUserId,
} from '../src/engine/comments/types.ts';
import {
  createInMemoryCommentsAdapter,
  SAMPLE_POST_ID_1,
} from '../src/engine/comments/adapter-memory.ts';
import { parseMentions, sanitizeBody } from '../src/engine/comments/parser.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

let pass = 0;
let fail = 0;
const failures = [];

function assertEq(actual, expected, label) {
  if (Object.is(actual, expected)) {
    pass++;
    console.log(`  ✓ ${label}`);
  } else {
    fail++;
    const msg = `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
    failures.push(msg);
    console.log(`  ✗ ${msg}`);
  }
}

function assertTrue(cond, label) {
  if (cond) {
    pass++;
    console.log(`  ✓ ${label}`);
  } else {
    fail++;
    const msg = `${label}: expected truthy, got ${JSON.stringify(cond)}`;
    failures.push(msg);
    console.log(`  ✗ ${msg}`);
  }
}

async function asyncAssert(label, fn) {
  try {
    const ok = await fn();
    if (ok) {
      pass++;
      console.log(`  ✓ ${label}`);
    } else {
      fail++;
      const msg = `${label}: async condition failed`;
      failures.push(msg);
      console.log(`  ✗ ${msg}`);
    }
  } catch (err) {
    fail++;
    const msg = `${label}: threw ${err && err.message ? err.message : err}`;
    failures.push(msg);
    console.log(`  ✗ ${msg}`);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Begin checks
// ────────────────────────────────────────────────────────────────────────────

console.log('═══ W87-C — comments-thread smoke harness ═══\n');

// 1. LGPD gate
console.log('[1] LGPD gate');
let caught = null;
try { validateLgpd(false); } catch (e) { caught = e; }
assertTrue(caught && caught.code === ERROR_CODES.LGPD_CONSENT_REQUIRED, 'validateLgpd(false) throws LGPD_CONSENT_REQUIRED');

// 2. CRUD basics
console.log('\n[2] addComment CRUD');

const adapter = createInMemoryCommentsAdapter();
const engine = createCommentsEngine(adapter, () => new Set(['ana', 'bia', 'carla']));

await asyncAssert('addComment raíz persists with status=visible', async () => {
  const c = await engine.addComment(asPostId('p_smoke'), asUserId('u_smoke'), 'oi @ana', null, true);
  return c && c.status === 'visible' && c.parentId === null;
});

await asyncAssert('addComment stores LGPD=false rejection as CommentError LGPD', async () => {
  let err = null;
  try {
    await engine.addComment(asPostId('p_smoke'), asUserId('u_smoke'), 'oi', null, false);
  } catch (e) { err = e; }
  return err && err.code === ERROR_CODES.LGPD_CONSENT_REQUIRED;
});

// 3. Mentions + sanitize
console.log('\n[3] parser');
assertEq(parseMentions('oi @ana @bia', new Set(['ana', 'bia'])).length, 2, 'parser: 2 mentions found');
assertEq(parseMentions('oi @ghost', new Set(['ana'])).length, 0, 'parser: unknown handle ignored');
assertTrue(!/script/i.test(sanitizeBody('oi <script>evil()</script>')), 'parser: <script> removed');
assertTrue(!/javascript/i.test(sanitizeBody('a javascript:1')), 'parser: javascript: URI removed');
assertTrue(sanitizeBody('Axé pra vocês').includes('Axé'), 'parser: sacred term preserved');

// 4. Max depth
console.log('\n[4] max depth enforcement');
await asyncAssert('reply of reply is rejected with MAX_DEPTH', async () => {
  const root = await engine.addComment(asPostId('p_md'), asUserId('u_a'), 'raiz', null, true);
  const r1 = await engine.addComment(asPostId('p_md'), asUserId('u_b'), 'r1', asCommentId(root.id), true);
  let err = null;
  try {
    await engine.addComment(asPostId('p_md'), asUserId('u_c'), 'r2', asCommentId(r1.id), true);
  } catch (e) { err = e; }
  return err && err.code === ERROR_CODES.MAX_DEPTH_EXCEEDED;
});

// 5. Edit + delete
console.log('\n[5] edit + soft delete');
await asyncAssert('editComment updates body and sets editedAt', async () => {
  const c = await engine.addComment(asPostId('p_ed'), asUserId('u_e'), 'original', null, true);
  const e = await engine.editComment(asCommentId(c.id), 'corrigido @ana');
  return e.body === 'corrigido @ana' && e.editedAt && e.mentions.length === 1;
});

await asyncAssert('deleteComment cascades + sets body empty', async () => {
  const root = await engine.addComment(asPostId('p_cd'), asUserId('u_a'), 'r', null, true);
  await engine.addComment(asPostId('p_cd'), asUserId('u_b'), 'reply', asCommentId(root.id), true);
  const d = await engine.deleteComment(asCommentId(root.id));
  const t = await engine.listThread(asPostId('p_cd'), asUserId('u_a'));
  return d.status === 'deleted' && d.body === '' && t.length === 0;
});

// 6. listThread grouping
console.log('\n[6] listThread');
await asyncAssert('listThread groups replies by parentId (1 root + 3 replies)', async () => {
  const t = await engine.listThread(asPostId(SAMPLE_POST_ID_1), asUserId('u_viewer'));
  return t.length === 1 && t[0].replies.length === 3;
});

// 7. ARIA contracts (source-inspection)
console.log('\n[7] ARIA contracts (source)');
const threadSrc = readFileSync(resolve(ROOT, 'src/components/comments/Thread.tsx'), 'utf8');
const composerSrc = readFileSync(resolve(ROOT, 'src/components/comments/Composer.tsx'), 'utf8');
const helpersSrc = readFileSync(resolve(ROOT, 'src/components/comments/helpers.tsx'), 'utf8');
assertTrue(/role="list"/.test(threadSrc), 'role="list" present');
assertTrue(/role="listitem"/.test(threadSrc), 'role="listitem" present');
assertTrue(/data-testid="comment-bubble"/.test(threadSrc), 'data-testid="comment-bubble" present');
// Form testids live as conditional expressions (data-testid={isRootMode ? ...}).
// Check both literal AND string-form presence.
const hasReplyForm = /data-testid="reply-form"/.test(composerSrc) ||
  /'reply-form'/.test(composerSrc);
const hasRootForm = /data-testid="comment-root-form"/.test(composerSrc) ||
  /'comment-root-form'/.test(composerSrc);
assertTrue(hasReplyForm, 'data-testid="reply-form" present');
assertTrue(hasRootForm, 'data-testid="comment-root-form" present');
assertTrue(/data-testid="mention-dropdown"/.test(composerSrc), 'data-testid="mention-dropdown" present');
assertTrue(/data-testid="lgpd-consent"/.test(composerSrc), 'data-testid="lgpd-consent" present');
assertTrue(/required/.test(composerSrc), 'LGPD input is required');
// 44×44 lives in helpers.tsx as STYLES.primaryBtn — check there.
assertTrue(/minHeight:\s*44/.test(helpersSrc), 'mobile-first 44×44 button present (in helpers STYLES)');
assertTrue(/export function detectMentionTrigger/.test(helpersSrc), 'detectMentionTrigger exported');
assertTrue(/export function applyHandleInsertion/.test(helpersSrc), 'applyHandleInsertion exported');

// ────────────────────────────────────────────────────────────────────────────
// Summary
// ────────────────────────────────────────────────────────────────────────────

console.log(`\n═══ RESULT ═══`);
console.log(`  pass: ${pass}`);
console.log(`  fail: ${fail}`);
if (failures.length > 0) {
  console.log(`\nFailures:`);
  for (const f of failures) console.log(`  - ${f}`);
}

if (fail > 0) {
  console.error(`\nFAILED — ${fail} assertion(s) failed`);
  process.exit(1);
}
console.log(`\n✓ All ${pass} checks passed`);
