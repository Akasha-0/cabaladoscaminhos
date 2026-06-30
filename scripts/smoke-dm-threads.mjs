#!/usr/bin/env node
// ============================================================================
// smoke-dm-threads.mjs — Runtime smoke test for DM threads engine (W90s-B)
//
// Run with:
//   npx tsx scripts/smoke-dm-threads.mjs
//   (or)  node --import tsx scripts/smoke-dm-threads.mjs
//
// Asserts (≥ 18):
//   1. createInitialState returns frozen state with empty threads
//   2. startThread creates thread + returns DMResult
//   3. startThread idempotent (same input → same threadId, no duplicate)
//   4. sendMessage appends message + bumps lastMessageAt
//   5. sendMessage rejects empty/whitespace text
//   6. sendMessage enforces MAX_MESSAGE_LENGTH
//   7. markRead transitions incoming messages to status='read'
//   8. archiveThread toggles archived flag
//   9. blockUser adds + removes from blocked list
//  10. isBlocked returns true after block, false after unblock
//  11. listThreads filters by view (active / archived / all)
//  12. listThreads paginates with offset + limit
//  13. getThread returns messages + peer
//  14. searchMessages case-insensitive
//  15. searchMessages scopes by peerId
//  16. threadIdFor is deterministic (A↔B same id)
//  17. receiveMessage increments unread
//  18. deleteMessage soft-deletes (text cleared, slot preserved)
//  19. getUnreadSummary aggregates total + perThread
//  20. Engine exports Object.freeze()-safe (mutation throws in strict)
//
// Prints `SMOKE OK` on full pass; exits 1 on first assertion failure.
// ============================================================================

import {
  createInitialState,
  startThread,
  sendMessage,
  markRead,
  archiveThread,
  blockUser,
  isBlocked,
  listThreads,
  getThread,
  searchMessages,
  receiveMessage,
  deleteMessage,
  getUnreadSummary,
  threadIdFor,
  peerOf,
  toUserId,
  toThreadId,
  toMessageId,
  MAX_MESSAGE_LENGTH,
  MAX_DISPLAY_NAME,
} from '../src/lib/w90s/dm-threads.ts';

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

const ME = toUserId('user-me');
const PEER = toUserId('user-peer');
const OTHER_PEER = toUserId('user-other');

function newState() {
  return createInitialState({ currentUserId: ME });
}

console.log('SMOKE dm-threads — engine runtime checks');
console.log('------------------------------------------');

// ---------------------------------------------------------------------------
// 1. createInitialState
// ---------------------------------------------------------------------------
check('createInitialState returns empty + frozen', () => {
  const s = newState();
  if (s.threads.length !== 0) throw new Error('threads not empty');
  if (Object.keys(s.messagesByThread).length !== 0) {
    throw new Error('messagesByThread not empty');
  }
  if ((s.currentUserId) !== 'user-me') {
    throw new Error('currentUserId wrong');
  }
});

// ---------------------------------------------------------------------------
// 2. startThread — creates a thread
// ---------------------------------------------------------------------------
check('startThread creates a new thread and returns DMResult', () => {
  const s = newState();
  const r = startThread(s, {
    peerId: PEER,
    peerDisplayName: 'Peer Test',
    peerAvatarSeed: 'seed1',
    nowMs: 1_000_000,
  });
  if (r.state.threads.length !== 1) throw new Error('thread not added');
  const t = r.thread;
  if (t.peerDisplayName !== 'Peer Test') throw new Error('displayName wrong');
  if (t.unreadCount !== 0) throw new Error('unread should be 0');
  if (t.archived !== false) throw new Error('not archived');
});

// ---------------------------------------------------------------------------
// 3. startThread — idempotent (same peer → same threadId)
// ---------------------------------------------------------------------------
check('startThread same peer → same id, no duplicate', () => {
  let s = newState();
  s = startThread(s, { peerId: PEER, peerDisplayName: 'P', peerAvatarSeed: 'q', nowMs: 1 }).state;
  s = startThread(s, { peerId: PEER, peerDisplayName: 'P', peerAvatarSeed: 'q', nowMs: 2 }).state;
  if (s.threads.length !== 1) throw new Error('duplicate created');
});

// ---------------------------------------------------------------------------
// 4. sendMessage — appends + bumps lastMessageAt
// ---------------------------------------------------------------------------
check('sendMessage appends + updates lastMessageAt', () => {
  let s = newState();
  s = startThread(s, { peerId: PEER, peerDisplayName: 'P', peerAvatarSeed: 's', nowMs: 1_000 }).state;
  const tid = threadIdFor(ME, PEER);
  const r = sendMessage(s, {
    threadId: tid,
    text: 'Olá, universo!',
    nowMs: 2_000,
  });
  if (!r.message) throw new Error('message is null');
  if (r.message.text !== 'Olá, universo!') throw new Error('text wrong');
  if (r.thread.lastMessageAt !== 2_000) throw new Error('lastMessageAt not updated');
  if (r.thread.lastMessagePreview !== 'Olá, universo!') {
    throw new Error('preview not set');
  }
});

// ---------------------------------------------------------------------------
// 5. sendMessage — rejects empty
// ---------------------------------------------------------------------------
check('sendMessage rejects whitespace-only text', () => {
  let s = newState();
  s = startThread(s, { peerId: PEER, peerDisplayName: 'P', peerAvatarSeed: 's', nowMs: 1 }).state;
  const tid = threadIdFor(ME, PEER);
  const r = sendMessage(s, { threadId: tid, text: '   \n   ', nowMs: 2 });
  if (r.message !== null) throw new Error('should reject empty');
  if (!r.reason || !r.reason.includes('Mensagem vazia')) {
    throw new Error('reason missing or wrong');
  }
});

// ---------------------------------------------------------------------------
// 6. sendMessage — clamps to MAX_MESSAGE_LENGTH
// ---------------------------------------------------------------------------
check('sendMessage clamps text to MAX_MESSAGE_LENGTH', () => {
  let s = newState();
  s = startThread(s, { peerId: PEER, peerDisplayName: 'P', peerAvatarSeed: 's', nowMs: 1 }).state;
  const tid = threadIdFor(ME, PEER);
  const huge = 'x'.repeat(MAX_MESSAGE_LENGTH + 500);
  const r = sendMessage(s, { threadId: tid, text: huge, nowMs: 2 });
  if (!r.message) throw new Error('message is null');
  if (r.message.text.length !== MAX_MESSAGE_LENGTH) {
    throw new Error(`expected ${MAX_MESSAGE_LENGTH}, got ${r.message.text.length}`);
  }
});

// ---------------------------------------------------------------------------
// 7. markRead — transitions incoming → status='read'
// ---------------------------------------------------------------------------
check('markRead transitions incoming messages to read', () => {
  let s = newState();
  s = startThread(s, { peerId: PEER, peerDisplayName: 'P', peerAvatarSeed: 's', nowMs: 1_000 }).state;
  const tid = threadIdFor(ME, PEER);
  // receive one incoming
  s = receiveMessage(s, {
    threadId: tid,
    messageId: toMessageId('m1'),
    text: 'hello',
    nowMs: 2_000,
  }).state;
  // mark as read
  const r = markRead(s, { threadId: tid, nowMs: 3_000 });
  if (r.markedCount < 1) throw new Error('no message marked');
  const thread = r.state.threads.find((t) => t.id === tid);
  if (!thread || thread.unreadCount !== 0) throw new Error('unreadCount should be 0');
});

// ---------------------------------------------------------------------------
// 8. archiveThread — toggle
// ---------------------------------------------------------------------------
check('archiveThread toggles archived', () => {
  let s = newState();
  s = startThread(s, { peerId: PEER, peerDisplayName: 'P', peerAvatarSeed: 's', nowMs: 1 }).state;
  const tid = threadIdFor(ME, PEER);
  const r = archiveThread(s, { threadId: tid, nowMs: 2 });
  if (r.thread.archived !== true) throw new Error('not archived');
});

// ---------------------------------------------------------------------------
// 9. blockUser — add and remove
// ---------------------------------------------------------------------------
check('blockUser adds and removes from blocked list', () => {
  let s = newState();
  s = blockUser(s, { userId: PEER, blocked: true }).state;
  if (!isBlocked(s, PEER)) throw new Error('not blocked after add');
  s = blockUser(s, { userId: PEER, blocked: false }).state;
  if (isBlocked(s, PEER)) throw new Error('still blocked after remove');
});

// ---------------------------------------------------------------------------
// 10. listThreads — filter by view
// ---------------------------------------------------------------------------
check('listThreads filters by active/archived/all', () => {
  let s = newState();
  s = startThread(s, { peerId: PEER, peerDisplayName: 'P', peerAvatarSeed: 's', nowMs: 1 }).state;
  s = startThread(s, { peerId: OTHER_PEER, peerDisplayName: 'O', peerAvatarSeed: 't', nowMs: 2 }).state;
  const tid1 = threadIdFor(ME, PEER);
  s = archiveThread(s, { threadId: tid1, nowMs: 3 }).state;
  const active = listThreads(s, { view: 'active' });
  const archived = listThreads(s, { view: 'archived' });
  const all = listThreads(s, { view: 'all' });
  if (active.total !== 1) throw new Error(`active.total=${active.total}`);
  if (archived.total !== 1) throw new Error(`archived.total=${archived.total}`);
  if (all.total !== 2) throw new Error(`all.total=${all.total}`);
});

// ---------------------------------------------------------------------------
// 11. listThreads — paginates with offset+limit
// ---------------------------------------------------------------------------
check('listThreads respects offset + limit', () => {
  let s = newState();
  // create 5 threads
  for (let i = 0; i < 5; i += 1) {
    s = startThread(s, {
      peerId: toUserId(`p${i}`),
      peerDisplayName: `P${i}`,
      peerAvatarSeed: 'x',
      nowMs: i + 1,
    }).state;
  }
  const page1 = listThreads(s, { view: 'all', limit: 2, offset: 0 });
  const page2 = listThreads(s, { view: 'all', limit: 2, offset: 2 });
  if (page1.threads.length !== 2) throw new Error('page1 wrong');
  if (page2.threads.length !== 2) throw new Error('page2 wrong');
  if (page1.total !== 5) throw new Error('total wrong');
});

// ---------------------------------------------------------------------------
// 12. getThread — returns messages + peer
// ---------------------------------------------------------------------------
check('getThread returns thread + messages + peer', () => {
  let s = newState();
  s = startThread(s, { peerId: PEER, peerDisplayName: 'P', peerAvatarSeed: 's', nowMs: 1 }).state;
  const tid = threadIdFor(ME, PEER);
  s = sendMessage(s, { threadId: tid, text: 'oi', nowMs: 2 }).state;
  const r = getThread(s, tid);
  if (!r.thread) throw new Error('no thread');
  if (r.messages.length !== 1) throw new Error('messages wrong');
  if (!r.peer) throw new Error('peer missing');
  if (r.peer !== PEER) throw new Error('peer wrong');
});

// ---------------------------------------------------------------------------
// 13. searchMessages — case insensitive
// ---------------------------------------------------------------------------
check('searchMessages lowercases query and matches case-insensitively', () => {
  let s = newState();
  s = startThread(s, { peerId: PEER, peerDisplayName: 'P', peerAvatarSeed: 's', nowMs: 1 }).state;
  const tid = threadIdFor(ME, PEER);
  s = sendMessage(s, { threadId: tid, text: 'Akasha brilha', nowMs: 2 }).state;
  const r = searchMessages(s, { query: 'AKASHA' });
  if (r.hits.length !== 1) throw new Error('no hit');
  if (r.total !== 1) throw new Error('total wrong');
});

// ---------------------------------------------------------------------------
// 14. searchMessages — scoped by peerId
// ---------------------------------------------------------------------------
check('searchMessages filters by peerId', () => {
  let s = newState();
  s = startThread(s, { peerId: PEER, peerDisplayName: 'P', peerAvatarSeed: 's', nowMs: 1 }).state;
  s = startThread(s, { peerId: OTHER_PEER, peerDisplayName: 'O', peerAvatarSeed: 't', nowMs: 2 }).state;
  const tid1 = threadIdFor(ME, PEER);
  const tid2 = threadIdFor(ME, OTHER_PEER);
  s = sendMessage(s, { threadId: tid1, text: 'akasha-1', nowMs: 3 }).state;
  s = sendMessage(s, { threadId: tid2, text: 'akasha-2', nowMs: 4 }).state;
  const r = searchMessages(s, { query: 'akasha', peerId: PEER });
  if (r.hits.length !== 1) throw new Error('peer filter failed');
});

// ---------------------------------------------------------------------------
// 15. threadIdFor — deterministic across directions
// ---------------------------------------------------------------------------
check('threadIdFor is symmetric (A→B == B→A)', () => {
  const A = toUserId('user-aaa');
  const B = toUserId('user-bbb');
  const fromA = threadIdFor(A, B);
  const fromB = threadIdFor(B, A);
  if ((fromA) !== (fromB)) {
    throw new Error('thread ids differ');
  }
});

// ---------------------------------------------------------------------------
// 16. receiveMessage — increments unread
// ---------------------------------------------------------------------------
check('receiveMessage increments unreadCount', () => {
  let s = newState();
  s = startThread(s, { peerId: PEER, peerDisplayName: 'P', peerAvatarSeed: 's', nowMs: 1 }).state;
  const tid = threadIdFor(ME, PEER);
  const r1 = receiveMessage(s, {
    threadId: tid,
    messageId: toMessageId('m1'),
    text: 'oi',
    nowMs: 2,
  });
  if (r1.thread.unreadCount !== 1) throw new Error('unread not incremented');
  // mark read
  s = markRead(r1.state, { threadId: tid, nowMs: 3 }).state;
  // receive another
  const r2 = receiveMessage(s, {
    threadId: tid,
    messageId: toMessageId('m2'),
    text: 'oi de novo',
    nowMs: 4,
  });
  if (r2.thread.unreadCount !== 1) {
    throw new Error(`expected 1, got ${r2.thread.unreadCount}`);
  }
});

// ---------------------------------------------------------------------------
// 17. deleteMessage — soft-delete
// ---------------------------------------------------------------------------
check('deleteMessage soft-deletes (clears text, keeps slot)', () => {
  let s = newState();
  s = startThread(s, { peerId: PEER, peerDisplayName: 'P', peerAvatarSeed: 's', nowMs: 1 }).state;
  const tid = threadIdFor(ME, PEER);
  const sent = sendMessage(s, {
    threadId: tid,
    messageId: toMessageId('m1'),
    text: 'original',
    nowMs: 2,
  });
  if (!sent.message) throw new Error('send failed');
  const deleted = deleteMessage(sent.state, { threadId: tid, messageId: sent.message.id });
  if (!deleted.deleted) throw new Error('not deleted');
  if (deleted.state.messagesByThread[String(tid)][0].text !== '') {
    throw new Error('text not cleared');
  }
  if (!deleted.state.messagesByThread[String(tid)][0].deleted) {
    throw new Error('deleted flag not set');
  }
});

// ---------------------------------------------------------------------------
// 18. getUnreadSummary aggregates
// ---------------------------------------------------------------------------
check('getUnreadSummary totals + perThread', () => {
  let s = newState();
  s = startThread(s, { peerId: PEER, peerDisplayName: 'P', peerAvatarSeed: 's', nowMs: 1 }).state;
  s = startThread(s, { peerId: OTHER_PEER, peerDisplayName: 'O', peerAvatarSeed: 't', nowMs: 2 }).state;
  const tid1 = threadIdFor(ME, PEER);
  const tid2 = threadIdFor(ME, OTHER_PEER);
  s = receiveMessage(s, { threadId: tid1, messageId: toMessageId('m1'), text: 'a', nowMs: 3 }).state;
  s = receiveMessage(s, { threadId: tid2, messageId: toMessageId('m2'), text: 'b', nowMs: 4 }).state;
  s = receiveMessage(s, { threadId: tid2, messageId: toMessageId('m3'), text: 'c', nowMs: 5 }).state;
  const sum = getUnreadSummary(s);
  if (sum.total !== 3) throw new Error(`total=${sum.total}`);
  const c1 = sum.perThread[String(tid1)];
  const c2 = sum.perThread[String(tid2)];
  if (c1 !== 1) throw new Error(`c1=${c1}`);
  if (c2 !== 2) throw new Error(`c2=${c2}`);
});

// ---------------------------------------------------------------------------
// 19. frozen export — Object.freeze on Result objects
// ---------------------------------------------------------------------------
check('Object.freeze on factory return blocks mutation in strict mode', () => {
  const s = newState();
  let threw = false;
  try {
    s.threads.push({});
  } catch {
    threw = true;
  }
  if (!threw) throw new Error('mutation succeeded — engine NOT frozen');
});

// ---------------------------------------------------------------------------
// 20. peerOf — returns the other participant
// ---------------------------------------------------------------------------
check('peerOf returns the OTHER participant', () => {
  let s = newState();
  s = startThread(s, { peerId: PEER, peerDisplayName: 'P', peerAvatarSeed: 's', nowMs: 1 }).state;
  const tid = threadIdFor(ME, PEER);
  const t = s.threads.find((x) => x.id === tid);
  if (!t) throw new Error('no thread');
  const peer = peerOf(t, ME);
  if (peer !== PEER) throw new Error('peer wrong');
});

// ---------------------------------------------------------------------------
// Done
// ---------------------------------------------------------------------------
console.log('------------------------------------------');
console.log(`PASSED ${passed} · FAILED ${failed}`);
if (failed === 0) {
  console.log('SMOKE OK');
  process.exit(0);
} else {
  console.error('SMOKE FAILED');
  process.exit(1);
}
