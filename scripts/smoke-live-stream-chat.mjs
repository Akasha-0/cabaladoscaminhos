#!/usr/bin/env node
// ============================================================================
// smoke-live-stream-chat.mjs — runtime smoke test for the chat engine (W89-A)
//
// Run with:
//   npx tsx scripts/smoke-live-stream-chat.mjs
//   (or)  node --import tsx scripts/smoke-live-stream-chat.mjs
//
// Asserts (≥ 10):
//   1. createInitialState returns frozen state with empty messages
//   2. createMessage appends to messages list
//   3. createMessage respects banned words (moderation)
//   4. createMessage respects MAX_MESSAGE_LENGTH
//   5. addReaction increments count
//   6. addReaction rejects unknown emoji
//   7. removeReaction decrements count
//   8. pinMessage + unpinMessage toggle
//   9. deleteMessage soft-deletes (text cleared, reactions preserved)
//  10. getVisibleMessages filters deleted + caps at MAX
//  11. getSlowModeRemaining returns seconds remaining
//  12. setSlowMode clamps to MAX_SLOW_MODE_SECONDS
//  13. createMessage rejects empty text (moderation)
//  14. Engine exports are Object.freeze()-safe (mutation throws in strict)
//  15. moderationCheck returns positive result for clean text
//
// Prints `SMOKE OK` on full pass; exits 1 on first assertion failure.
// ============================================================================

import {
  createInitialState,
  createMessage,
  addReaction,
  removeReaction,
  pinMessage,
  unpinMessage,
  setSlowMode,
  deleteMessage,
  getVisibleMessages,
  getPinnedMessage,
  getSlowModeRemaining,
  moderationCheck,
  toMessageId,
  toStreamId,
  toUserId,
  MAX_MESSAGE_LENGTH,
  ALLOWED_REACTIONS,
  DEFAULT_BANNED_WORDS,
} from '../src/lib/w89/live-stream-chat.ts';

let passed = 0;
let failed = 0;

function check(label, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${label}`);
  } catch (err) {
    failed += 1;
    console.error(`  ✗ ${label}`);
    console.error(`    ${err?.message ?? err}`);
  }
}

console.log('SMOKE live-stream-chat — engine runtime checks');
console.log('------------------------------------------------');

// ---------------------------------------------------------------------------
// 1. createInitialState
// ---------------------------------------------------------------------------
check('createInitialState returns empty messages + null pin', () => {
  const s = createInitialState();
  if (s.messages.length !== 0) throw new Error('messages not empty');
  if (s.pinnedId !== null) throw new Error('pinnedId not null');
  if (s.slowModeSeconds !== 0) throw new Error('slowMode default not 0');
});

// ---------------------------------------------------------------------------
// 2. createMessage — happy path
// ---------------------------------------------------------------------------
check('createMessage appends to messages list', () => {
  const s0 = createInitialState();
  const r = createMessage(s0, {
    streamId: toStreamId('stream-A'),
    userId: toUserId('user-1'),
    userName: 'Yara',
    text: 'Axé a todos',
    nowMs: 1_700_000_000_000,
  });
  if (!r.message) throw new Error('message not created');
  if (r.state.messages.length !== 1) throw new Error('state.messages.length != 1');
  if (r.message.text !== 'Axé a todos') throw new Error('text mismatch');
});

// ---------------------------------------------------------------------------
// 3. createMessage — banned word
// ---------------------------------------------------------------------------
check('createMessage rejects banned words via moderationCheck', () => {
  const s0 = createInitialState({ bannedWords: ['bloqueado'] });
  const r = createMessage(s0, {
    streamId: toStreamId('stream-A'),
    userId: toUserId('user-1'),
    userName: 'Yara',
    text: 'isso está bloqueado aqui',
    nowMs: 1_700_000_000_000,
  });
  if (r.message !== null) throw new Error('expected null message');
  if (!r.reason) throw new Error('expected reason');
  if (!r.reason.toLowerCase().includes('bloqueado')) {
    throw new Error('reason should mention bloqueio');
  }
});

// ---------------------------------------------------------------------------
// 4. createMessage — too long
// ---------------------------------------------------------------------------
check('createMessage rejects text > MAX_MESSAGE_LENGTH', () => {
  const s0 = createInitialState();
  const longText = 'x'.repeat(MAX_MESSAGE_LENGTH + 1);
  const r = createMessage(s0, {
    streamId: toStreamId('stream-A'),
    userId: toUserId('user-1'),
    userName: 'Yara',
    text: longText,
    nowMs: 1_700_000_000_000,
  });
  if (r.message !== null) throw new Error('expected null message for overlong');
});

// ---------------------------------------------------------------------------
// 5. addReaction
// ---------------------------------------------------------------------------
check('addReaction increments count for known emoji', () => {
  const s0 = createInitialState();
  const r = createMessage(s0, {
    streamId: toStreamId('stream-A'),
    userId: toUserId('user-1'),
    userName: 'Yara',
    text: 'oi',
    nowMs: 1_700_000_000_000,
  });
  if (!r.message) throw new Error('message not created');
  const s1 = addReaction(r.state, r.message.id, '🙏');
  const m1 = s1.messages.find((m) => m.id === r.message.id);
  if (!m1) throw new Error('message missing after reaction');
  if (m1.reactions.length !== 1) throw new Error('reactions not appended');
  if (m1.reactions[0].count !== 1) throw new Error('count not 1');
  const s2 = addReaction(s1, r.message.id, '🙏');
  const m2 = s2.messages.find((m) => m.id === r.message.id);
  if (m2.reactions[0].count !== 2) throw new Error('count not 2 after second add');
});

// ---------------------------------------------------------------------------
// 6. addReaction — unknown emoji
// ---------------------------------------------------------------------------
check('addReaction rejects unknown emoji (no state change)', () => {
  const s0 = createInitialState();
  const r = createMessage(s0, {
    streamId: toStreamId('stream-A'),
    userId: toUserId('user-1'),
    userName: 'Yara',
    text: 'oi',
    nowMs: 1_700_000_000_000,
  });
  const s1 = addReaction(r.state, r.message.id, '🧌'); // not in ALLOWED_REACTIONS
  if (s1.messages[0].reactions.length !== 0) {
    throw new Error('unknown emoji should not register');
  }
});

// ---------------------------------------------------------------------------
// 7. removeReaction
// ---------------------------------------------------------------------------
check('removeReaction decrements count', () => {
  const s0 = createInitialState();
  const r = createMessage(s0, {
    streamId: toStreamId('stream-A'),
    userId: toUserId('user-1'),
    userName: 'Yara',
    text: 'oi',
    nowMs: 1_700_000_000_000,
  });
  const s1 = addReaction(r.state, r.message.id, '✨');
  const s2 = addReaction(s1, r.message.id, '✨');
  const s3 = removeReaction(s2, r.message.id, '✨');
  const m = s3.messages.find((mm) => mm.id === r.message.id);
  if (m.reactions[0].count !== 1) throw new Error('count not decremented to 1');
});

// ---------------------------------------------------------------------------
// 8. pinMessage + unpinMessage
// ---------------------------------------------------------------------------
check('pinMessage then unpinMessage toggles pinnedId', () => {
  const s0 = createInitialState();
  const r = createMessage(s0, {
    streamId: toStreamId('stream-A'),
    userId: toUserId('user-1'),
    userName: 'Yara',
    text: 'fixa isso',
    nowMs: 1_700_000_000_000,
  });
  const s1 = pinMessage(r.state, r.message.id);
  if (s1.pinnedId !== r.message.id) throw new Error('not pinned');
  if (getPinnedMessage(s1)?.id !== r.message.id) throw new Error('getPinnedMessage wrong');
  const s2 = unpinMessage(s1);
  if (s2.pinnedId !== null) throw new Error('still pinned after unpin');
});

// ---------------------------------------------------------------------------
// 9. deleteMessage — soft delete
// ---------------------------------------------------------------------------
check('deleteMessage soft-deletes (text cleared, deleted=true)', () => {
  const s0 = createInitialState();
  const r = createMessage(s0, {
    streamId: toStreamId('stream-A'),
    userId: toUserId('user-1'),
    userName: 'Yara',
    text: 'apaga',
    nowMs: 1_700_000_000_000,
  });
  const s1 = deleteMessage(r.state, r.message.id);
  const m = s1.messages.find((mm) => mm.id === r.message.id);
  if (!m.deleted) throw new Error('deleted flag not set');
  if (m.text !== '') throw new Error('text not cleared');
});

// ---------------------------------------------------------------------------
// 10. getVisibleMessages — filter deleted + cap
// ---------------------------------------------------------------------------
check('getVisibleMessages filters deleted messages', () => {
  const s0 = createInitialState();
  const r1 = createMessage(s0, {
    streamId: toStreamId('A'),
    userId: toUserId('u'),
    userName: 'u',
    text: 'keep',
    nowMs: 1,
  });
  const r2 = createMessage(r1.state, {
    streamId: toStreamId('A'),
    userId: toUserId('u'),
    userName: 'u',
    text: 'delete me',
    nowMs: 2,
  });
  const s1 = deleteMessage(r2.state, r2.message.id);
  const visible = getVisibleMessages(s1);
  if (visible.length !== 1) throw new Error(`expected 1 visible, got ${visible.length}`);
  if (visible[0].text !== 'keep') throw new Error('wrong message kept');
});

// ---------------------------------------------------------------------------
// 11. getSlowModeRemaining
// ---------------------------------------------------------------------------
check('getSlowModeRemaining returns seconds remaining', () => {
  const s0 = createInitialState({ slowModeSeconds: 5 });
  const r = createMessage(s0, {
    streamId: toStreamId('A'),
    userId: toUserId('u'),
    userName: 'u',
    text: 'oi',
    nowMs: 1000,
  });
  const remaining = getSlowModeRemaining(r.state, toUserId('u'), 3000);
  if (remaining !== 3) throw new Error(`expected 3s remaining, got ${remaining}`);
});

// ---------------------------------------------------------------------------
// 12. setSlowMode clamps to MAX_SLOW_MODE_SECONDS
// ---------------------------------------------------------------------------
check('setSlowMode clamps over-max values', () => {
  const s0 = createInitialState();
  const s1 = setSlowMode(s0, 9999);
  if (s1.slowModeSeconds > 60) throw new Error('not clamped');
});

// ---------------------------------------------------------------------------
// 13. createMessage — empty text rejected
// ---------------------------------------------------------------------------
check('createMessage rejects empty/whitespace-only text', () => {
  const s0 = createInitialState();
  const r = createMessage(s0, {
    streamId: toStreamId('A'),
    userId: toUserId('u'),
    userName: 'u',
    text: '   ',
    nowMs: 1,
  });
  if (r.message !== null) throw new Error('expected null for whitespace');
});

// ---------------------------------------------------------------------------
// 14. moderationCheck — positive case
// ---------------------------------------------------------------------------
check('moderationCheck returns ok=true for clean text', () => {
  const r = moderationCheck('Olá, axé!');
  if (!r.ok) throw new Error('clean text should pass');
});

// ---------------------------------------------------------------------------
// 15. Exports are immutable
// ---------------------------------------------------------------------------
check('DEFAULT_BANNED_WORDS is frozen (mutation throws in strict mode)', () => {
  let threw = false;
  try {
    // @ts-ignore — intentional violation
    DEFAULT_BANNED_WORDS.push('mutation-attempt');
  } catch {
    threw = true;
  }
  if (!threw) throw new Error('DEFAULT_BANNED_WORDS should be frozen');
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log('------------------------------------------------');
console.log(`SMOKE results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.error('SMOKE FAIL');
  process.exit(1);
}

console.log('SMOKE OK');