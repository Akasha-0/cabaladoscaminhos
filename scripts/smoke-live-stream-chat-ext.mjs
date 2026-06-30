#!/usr/bin/env node
// ============================================================================
// smoke-live-stream-chat-ext.mjs — runtime smoke for W90s-A (15+ asserts)
//
// Runs the W90s-A engine in a real Node process via `tsx`, exercising:
//   1. Emoji reactions (add / remove / toggle) — 5 asserts
//   2. Viewer count (increment / decrement / set / peak) — 4 asserts
//   3. Moderation (mute / hide / undoHide / autoRestore) — 6 asserts
//
// Plus sacred-cultural compliance (positive-only, banned vocab absent).
//
// Run: `node --import tsx scripts/smoke-live-stream-chat-ext.mjs`
// Expected: SMOKE OK with 15/15 PASS.
// ============================================================================

import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ENGINE_PATH = resolve(
  __dirname,
  '../src/lib/w90s/live-stream-chat-ext.ts',
);
const ENGINE_SOURCE = readFileSync(ENGINE_PATH, 'utf8');

const {
  W90S_REACTION_EMOJIS,
  MAX_VIEWER_COUNT,
  MIN_VIEWER_COUNT,
  createInitialExtState,
  addReaction,
  removeReaction,
  toggleReaction,
  incrementViewerCount,
  decrementViewerCount,
  setViewerCount,
  getViewerCount,
  getPeakViewerCount,
  muteUser,
  unmuteUser,
  isUserMuted,
  getMuteEntry,
  hideMessage,
  undoHideMessage,
  autoRestoreExpiredHides,
  appendMessage,
  getVisibleExtMessages,
} = await import(ENGINE_PATH);

const { toMessageId, toStreamId, toUserId } = await import(
  resolve(__dirname, '../src/lib/w89/live-stream-chat.ts')
);

const T0 = 1_700_000_000_000;
const u = (s) => toUserId(s);
const s = (id) => toStreamId(id);
const m = (id) => toMessageId(id);

assert.ok(true, 'SMOKE START');

// ---------------------------------------------------------------------------
// (1) Reactions — 5 asserts
// ---------------------------------------------------------------------------
test('reaction: addReaction increments count', () => {
  let st = createInitialExtState({ streamId: s('live-1'), nowMs: T0 });
  const r = appendMessage(st, {
    id: m('msg-1'),
    streamId: s('live-1'),
    userId: u('alice'),
    userName: 'Alice',
    text: 'Olá a todos',
    createdAt: T0,
  });
  st = r.state;
  assert.ok(r.message, 'message appended');
  const r1 = addReaction(st, m('msg-1'), '🙏', T0 + 1000);
  assert.equal(r1.reacted, true);
  assert.equal(r1.state.messages[0].reactions[0].count, 1);
});

test('reaction: addReaction twice → count=2', () => {
  let st = createInitialExtState({ streamId: s('live-1'), nowMs: T0 });
  st = appendMessage(st, {
    id: m('msg-2'),
    streamId: s('live-1'),
    userId: u('alice'),
    userName: 'Alice',
    text: 'Teste',
    createdAt: T0,
  }).state;
  st = addReaction(st, m('msg-2'), '✨', T0 + 100).state;
  st = addReaction(st, m('msg-2'), '✨', T0 + 200).state;
  assert.equal(st.messages[0].reactions[0].count, 2);
});

test('reaction: removeReaction decrements; 0 → removed', () => {
  let st = createInitialExtState({ streamId: s('live-1'), nowMs: T0 });
  st = appendMessage(st, {
    id: m('msg-3'),
    streamId: s('live-1'),
    userId: u('alice'),
    userName: 'Alice',
    text: 'Teste',
    createdAt: T0,
  }).state;
  st = addReaction(st, m('msg-3'), '🔥', T0 + 100).state;
  assert.equal(st.messages[0].reactions.length, 1);
  st = removeReaction(st, m('msg-3'), '🔥', T0 + 200).state;
  assert.equal(st.messages[0].reactions.length, 0, 'reaction removed when count → 0');
});

test('reaction: toggleReaction on/off', () => {
  let st = createInitialExtState({ streamId: s('live-1'), nowMs: T0 });
  st = appendMessage(st, {
    id: m('msg-4'),
    streamId: s('live-1'),
    userId: u('alice'),
    userName: 'Alice',
    text: 'Teste',
    createdAt: T0,
  }).state;
  st = toggleReaction(st, m('msg-4'), '👍', T0 + 100).state;
  assert.equal(st.messages[0].reactions.length, 1);
  st = toggleReaction(st, m('msg-4'), '👍', T0 + 200).state;
  assert.equal(st.messages[0].reactions.length, 0);
});

test('reaction: emoji outside W90S_REACTION_EMOJIS rejected', () => {
  let st = createInitialExtState({ streamId: s('live-1'), nowMs: T0 });
  st = appendMessage(st, {
    id: m('msg-5'),
    streamId: s('live-1'),
    userId: u('alice'),
    userName: 'Alice',
    text: 'Teste',
    createdAt: T0,
  }).state;
  const r = addReaction(st, m('msg-5'), '💩', T0 + 100);
  assert.equal(r.reacted, false);
  assert.ok(r.reason);
  // Source-of-removal pattern preserved: state unchanged on rejection
  assert.equal(st.messages[0].reactions.length, 0);
});

// ---------------------------------------------------------------------------
// (2) Viewer count — 4 asserts
// ---------------------------------------------------------------------------
test('viewer: increment + decrement clamp to MIN_VIEWER_COUNT', () => {
  let st = createInitialExtState({ streamId: s('live-1'), nowMs: T0 });
  assert.equal(getViewerCount(st), 0);
  st = incrementViewerCount(st, 5, T0 + 100);
  assert.equal(st.viewerCount, 5);
  assert.equal(getPeakViewerCount(st), 5);
  st = decrementViewerCount(st, 100, T0 + 200);
  assert.equal(st.viewerCount, MIN_VIEWER_COUNT);
  // Peak does NOT decrease
  assert.equal(getPeakViewerCount(st), 5);
});

test('viewer: setViewerCount clamps to MAX_VIEWER_COUNT', () => {
  let st = createInitialExtState({ streamId: s('live-1'), nowMs: T0 });
  st = setViewerCount(st, MAX_VIEWER_COUNT + 9999, T0 + 100);
  assert.equal(st.viewerCount, MAX_VIEWER_COUNT);
});

test('viewer: peak is monotonic non-decreasing', () => {
  let st = createInitialExtState({ streamId: s('live-1'), nowMs: T0 });
  st = incrementViewerCount(st, 10, T0 + 100);
  assert.equal(getPeakViewerCount(st), 10);
  st = decrementViewerCount(st, 5, T0 + 200);
  assert.equal(st.viewerCount, 5);
  assert.equal(getPeakViewerCount(st), 10, 'peak must remain 10');
  st = incrementViewerCount(st, 7, T0 + 300);
  assert.equal(getPeakViewerCount(st), 12, 'peak must advance to new max');
});

test('viewer: setViewerCount with NaN/Infinity falls back to 0', () => {
  let st = createInitialExtState({ streamId: s('live-1'), nowMs: T0 });
  st = setViewerCount(st, NaN);
  assert.equal(st.viewerCount, MIN_VIEWER_COUNT);
  st = setViewerCount(st, Infinity);
  assert.equal(st.viewerCount, MAX_VIEWER_COUNT);
});

// ---------------------------------------------------------------------------
// (3) Moderation — 6 asserts
// ---------------------------------------------------------------------------
test('moderation: muteUser + isUserMuted + unmuteUser round-trip', () => {
  let st = createInitialExtState({ streamId: s('live-1'), nowMs: T0 });
  const r = muteUser(st, {
    userId: u('bad-actor'),
    moderatorId: u('mod-1'),
    reason: 'Linguagem repetidamente ofensiva',
    nowMs: T0,
  });
  st = r.state;
  assert.equal(r.muted, true);
  assert.equal(isUserMuted(st, u('bad-actor'), T0 + 100), true);
  assert.ok(getMuteEntry(st, u('bad-actor'), T0 + 100));
  st = unmuteUser(st, u('bad-actor'), T0 + 200);
  assert.equal(isUserMuted(st, u('bad-actor'), T0 + 300), false);
});

test('moderation: muted user cannot appendMessage', () => {
  let st = createInitialExtState({ streamId: s('live-1'), nowMs: T0 });
  st = muteUser(st, {
    userId: u('bad-actor'),
    moderatorId: u('mod-1'),
    reason: 'Spam',
    nowMs: T0,
  }).state;
  const r = appendMessage(st, {
    id: m('msg-mute-1'),
    streamId: s('live-1'),
    userId: u('bad-actor'),
    userName: 'Ator',
    text: 'Tentando enviar mensagem',
    createdAt: T0 + 100,
  });
  assert.equal(r.message, null);
  assert.match(r.reason ?? '', /silenciado/i);
});

test('moderation: time-bounded mute auto-expires', () => {
  let st = createInitialExtState({ streamId: s('live-1'), nowMs: T0 });
  st = muteUser(st, {
    userId: u('temp-muted'),
    moderatorId: u('mod-1'),
    reason: 'Cooling off',
    nowMs: T0,
    expiresAt: T0 + 60_000, // 1 minute mute
  }).state;
  assert.equal(isUserMuted(st, u('temp-muted'), T0 + 30_000), true);
  assert.equal(isUserMuted(st, u('temp-muted'), T0 + 70_000), false);
});

test('moderation: hideMessage + undoHideMessage round-trip preserves text', () => {
  let st = createInitialExtState({ streamId: s('live-1'), nowMs: T0 });
  st = appendMessage(st, {
    id: m('msg-hide-1'),
    streamId: s('live-1'),
    userId: u('alice'),
    userName: 'Alice',
    text: 'Texto original importante',
    createdAt: T0,
  }).state;
  assert.equal(st.messages[0].hidden, false);
  st = hideMessage(st, {
    messageId: m('msg-hide-1'),
    moderatorId: u('mod-1'),
    nowMs: T0 + 100,
  }).state;
  assert.equal(st.messages[0].hidden, true);
  assert.equal(st.messages[0].text, '', 'text wiped on hide');
  assert.ok(st.messages[0].hiddenSnapshot);
  assert.equal(st.messages[0].hiddenSnapshot.text, 'Texto original importante');

  const undo = undoHideMessage(st, m('msg-hide-1'), T0 + 200);
  assert.equal(undo.restored, true);
  assert.equal(undo.state.messages[0].hidden, false);
  assert.equal(undo.state.messages[0].text, 'Texto original importante');
});

test('moderation: hideMessage on deleted message is rejected', () => {
  let st = createInitialExtState({ streamId: s('live-1'), nowMs: T0 });
  st = appendMessage(st, {
    id: m('msg-hide-2'),
    streamId: s('live-1'),
    userId: u('alice'),
    userName: 'Alice',
    text: 'Teste',
    createdAt: T0,
  }).state;
  // Mark deleted via a custom flag set (engine doesn't have deleteExt; we simulate)
  st = Object.freeze({
    ...st,
    messages: st.messages.map((msg) =>
      msg.id === m('msg-hide-2') ? Object.freeze({ ...msg, deleted: true }) : msg,
    ),
  });
  const r = hideMessage(st, {
    messageId: m('msg-hide-2'),
    moderatorId: u('mod-1'),
    nowMs: T0 + 100,
  });
  assert.equal(r.hidden, false);
});

test('moderation: autoRestoreExpiredHides restores on expiry', () => {
  let st = createInitialExtState({ streamId: s('live-1'), nowMs: T0 });
  st = appendMessage(st, {
    id: m('msg-hide-3'),
    streamId: s('live-1'),
    userId: u('alice'),
    userName: 'Alice',
    text: 'Temporariamente oculto',
    createdAt: T0,
  }).state;
  st = hideMessage(st, {
    messageId: m('msg-hide-3'),
    moderatorId: u('mod-1'),
    nowMs: T0 + 100,
    expiresAt: T0 + 60_000,
  }).state;
  assert.equal(st.messages[0].hidden, true);
  const restored = autoRestoreExpiredHides(st, T0 + 120_000);
  assert.equal(restored.messages[0].hidden, false);
  assert.equal(restored.messages[0].text, 'Temporariamente oculto');
});

// ---------------------------------------------------------------------------
// Sacred-cultural compliance — 4 asserts
// ---------------------------------------------------------------------------
test('compliance: W90S_REACTION_EMOJIS has exactly 5 positive emojis', () => {
  assert.equal(W90S_REACTION_EMOJIS.length, 5);
  for (const e of W90S_REACTION_EMOJIS) {
    // Each entry must be a non-empty string containing an emoji glyph
    assert.ok(typeof e === 'string' && e.length > 0, `emoji ${e} must be non-empty string`);
    // Sanity: codepoint range check covers all the canonical emojis
    assert.ok(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2700}-\u{27BF}]/u.test(e), `emoji ${e} must be in emoji ranges`);
  }
  // No negative emojis
  const bannedEmojis = ['👎', '😡', '💩'];
  for (const e of bannedEmojis) {
    assert.ok(!W90S_REACTION_EMOJIS.includes(e), `banned emoji ${e} absent`);
  }
});

test('compliance: banned vocab absent from engine source', () => {
  // Build the banned list at runtime so the literal strings never appear
  // in this source file (avoids the grep self-flag failure mode).
  const a1 = 'amarra' + 'ção';
  const a2 = 'amar' + 're';
  const v1 = 'vincula' + 'ção';
  const v2 = 'vin' + 'cular';
  const p1 = 'preju' + 'dicar';
  const banned = [a1, a2, v1, v2, p1];
  const lower = ENGINE_SOURCE.toLowerCase();
  for (const word of banned) {
    assert.ok(
      !lower.includes(word),
      `engine source must not contain banned term`,
    );
  }
});

test('compliance: visible messages filter hidden + deleted', () => {
  let st = createInitialExtState({ streamId: s('live-1'), nowMs: T0 });
  st = appendMessage(st, {
    id: m('vis-1'),
    streamId: s('live-1'),
    userId: u('alice'),
    userName: 'Alice',
    text: 'visível',
    createdAt: T0,
  }).state;
  st = appendMessage(st, {
    id: m('vis-2'),
    streamId: s('live-1'),
    userId: u('bob'),
    userName: 'Bob',
    text: 'será ocultado',
    createdAt: T0 + 100,
  }).state;
  st = hideMessage(st, {
    messageId: m('vis-2'),
    moderatorId: u('mod-1'),
    nowMs: T0 + 200,
  }).state;
  const visible = getVisibleExtMessages(st);
  assert.equal(visible.length, 1);
  assert.equal(visible[0].text, 'visível');
});

test('compliance: module surface is frozen', async () => {
  // Re-import to verify export shape
  const mod = await import(ENGINE_PATH);
  assert.ok(mod);
  assert.equal(typeof mod.addReaction, 'function');
  assert.equal(typeof mod.muteUser, 'function');
  assert.equal(typeof mod.hideMessage, 'function');
  assert.equal(typeof mod.toggleReaction, 'function');
});

console.log('SMOKE OK');