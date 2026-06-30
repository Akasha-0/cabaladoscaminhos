/**
 * W71-D: livestream-chat.spec.ts
 *
 * Self-running spec harness for livestream-chat.ts (no vitest binary needed).
 * Tests chat membership, rate limiting, slow mode, moderation, reactions,
 * subscriptions, stats, and 7-tradition emoji packs.
 */

import {
  joinChatRoom,
  leaveChatRoom,
  sendMessage,
  moderateMessage,
  addReaction,
  getRecentMessages,
  subscribeToChat,
  getChatStats,
  updateChatConfig,
  getChatConfig,
  clearAllChatRooms,
  auditChatTraditions,
  auditChatSurface,
  TRADITION_EMOJI_PACKS,
  type ChatConfig,
} from '../engines/livestream-chat.ts';

// ─── Harness ────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assertIt(cond: unknown, label: string): void {
  if (cond) passed++;
  else {
    failed++;
    failures.push(label);
  }
}

function assertEq<T>(actual: T, expected: T, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed++;
  else {
    failed++;
    failures.push(`${label}: expected ${e}, got ${a}`);
  }
}

function assertThrows(fn: () => unknown, pattern: RegExp | string, label: string): void {
  try {
    fn();
    failed++;
    failures.push(`${label}: expected throw, got none`);
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    const ok = typeof pattern === 'string' ? msg.includes(pattern) : pattern.test(msg);
    if (ok) passed++;
    else {
      failed++;
      failures.push(`${label}: throw '${msg}' did not match ${pattern}`);
    }
  }
}

function section(name: string): void {
  console.log(`  ▶ ${name}`);
}

function reset(): void {
  clearAllChatRooms();
}

// ─── Tests ──────────────────────────────────────────────────────────────────

export function runLivestreamChatSpec(): {
  passed: number;
  failed: number;
  total: number;
  failures: readonly string[];
} {
  reset();
  passed = 0;
  failed = 0;
  failures.length = 0;

  section('7-tradition emoji packs');
  assertEq(
    Object.keys(TRADITION_EMOJI_PACKS).length,
    7,
    '7 tradition emoji packs',
  );
  for (const t of Object.keys(TRADITION_EMOJI_PACKS)) {
    const pack = TRADITION_EMOJI_PACKS[t as keyof typeof TRADITION_EMOJI_PACKS];
    assertIt(pack.length > 0, `${t} has emoji`);
  }

  section('joinChatRoom / leaveChatRoom');
  const join = joinChatRoom('stream-1', 'user-1');
  assertEq(join.roomId, 'stream-1', 'roomId=stream-1');
  assertEq(join.userId, 'user-1', 'userId');
  assertIt(join.joinedAt > 0, 'joinedAt set');
  joinChatRoom('stream-1', 'user-2');
  const stats0 = getChatStats('stream-1');
  assertEq(stats0.uniqueUsers, 2, 'uniqueUsers=2');
  assertEq(stats0.peakConcurrent, 2, 'peakConcurrent=2');
  // Re-join same user shouldn't increase peak
  joinChatRoom('stream-1', 'user-1');
  const stats0b = getChatStats('stream-1');
  assertEq(stats0b.peakConcurrent, 2, 'peakConcurrent stays 2 on rejoin');
  assertEq(stats0b.uniqueUsers, 2, 'uniqueUsers stays 2 on rejoin');
  leaveChatRoom('stream-1', 'user-1');
  const stats0c = getChatStats('stream-1');
  assertEq(stats0c.uniqueUsers, 1, 'uniqueUsers=1 after leave');

  assertThrows(
    () => joinChatRoom('', 'user-1'),
    /streamId is required/,
    'empty streamId rejected',
  );
  assertThrows(
    () => joinChatRoom('stream-1', ''),
    /userId is required/,
    'empty userId rejected',
  );
  assertThrows(
    () => leaveChatRoom('stream-1', ''),
    /userId is required/,
    'leaveChatRoom empty userId rejected',
  );

  section('sendMessage — happy path');
  reset();
  joinChatRoom('stream-2', 'user-a');
  const msg = sendMessage('stream-2', 'user-a', 'Olá, cabala!', {
    userDisplayName: 'Alice',
    traditionTag: 'cigano',
  });
  assertIt(msg.id.startsWith('msg_'), 'msg id');
  assertEq(msg.body, 'Olá, cabala!', 'body');
  assertEq(msg.type, 'text', 'type=text default');
  assertEq(msg.userDisplayName, 'Alice', 'displayName');
  assertEq(msg.traditionTag, 'cigano', 'traditionTag=cigano');
  assertEq(msg.moderated, false, 'not moderated');
  assertEq(msg.pinned, false, 'not pinned');
  assertIt(msg.reactions && Object.keys(msg.reactions).length === 0, 'empty reactions');

  section('sendMessage — validation');
  assertThrows(
    () => sendMessage('', 'user', 'x'),
    /streamId is required/,
    'empty streamId rejected',
  );
  assertThrows(
    () => sendMessage('stream-2', '', 'x'),
    /userId is required/,
    'empty userId rejected',
  );
  assertThrows(
    () => sendMessage('stream-2', 'user-a', 123 as any),
    /body must be a string/,
    'non-string body rejected',
  );
  assertThrows(
    () => sendMessage('stream-2', 'user-a', ''),
    /body cannot be empty/,
    'empty body rejected',
  );
  assertThrows(
    () => sendMessage('stream-2', 'user-a', 'a'.repeat(1000)),
    /exceeds maxMessageLength/,
    'oversize body rejected',
  );
  assertThrows(
    () =>
      sendMessage('stream-2', 'user-a', 'hello', {
        type: 'invalid' as any,
      }),
    /invalid type/,
    'invalid type rejected',
  );

  section('sendMessage — tradition emoji allowlist');
  reset();
  updateChatConfig('stream-3', {
    allowedEmojis: ['🌙', '⭐', '🔮'],
  });
  joinChatRoom('stream-3', 'user-x');
  sendMessage('stream-3', 'user-x', 'Bom dia 🌙⭐');
  assertThrows(
    () => sendMessage('stream-3', 'user-x', 'Disallowed 🔥'),
    /not in allowedEmojis/,
    'disallowed emoji rejected',
  );

  section('sendMessage — moderation (lookaround regex)');
  reset();
  updateChatConfig('stream-4', {
    moderatedWords: ['spam', 'fake'],
  });
  joinChatRoom('stream-4', 'user-y');
  const m1 = sendMessage('stream-4', 'user-y', 'this is not spam');
  assertEq(m1.moderated, true, 'spam detected and moderated');
  assertEq(m1.body, '[redacted]', 'body redacted');
  const m2 = sendMessage('stream-4', 'user-y', 'totally clean message');
  assertEq(m2.moderated, false, 'clean message not moderated');
  // Word boundary check (cycle 60/65/67 lesson): should NOT match 'spammer' substring
  const m3 = sendMessage('stream-4', 'user-y', 'spammer content');
  // 'spammer' contains 'spam' so the regex would match because \b is word-boundary.
  // Wait: 'spam' followed by 'mer' — both are word chars. So \b after 'spam' would NOT match.
  // Actually \b matches transition between word/non-word. 'spam' is at start, next char 'm' is word,
  // so there is NO boundary between 'spam' and 'mer'. So the regex \bspam\b does NOT match 'spammer'.
  // But the message contains the literal word 'spam' in 'spammer' as substring.
  // Per the regex \bspam\b, no boundary after 'spam', so no match. Let me think again:
  // 'spammer' — \b before 's' (word boundary), then 'spam' matches, then 'mer' — no \b between 'm' and 'm', so NO boundary. So \bspam\b does NOT match 'spammer'.
  // Hmm wait — looking at the actual string: 'spammer' = s,p,a,m,m,e,r. After 'spam', next char is 'm'. The boundary is between 'm' (word char) and 'm' (word char) — that's NOT a boundary. So \bspam\b doesn't match 'spammer'.
  // However we have 'spam' as a word in the message. Wait: 'spammer' starts with 'spam', so 'spam' is at position 0. The regex \b(?:spam|...)\b would check if 'spam' is bounded. After 'spam' comes 'm', which is a word char. So no boundary. So no match.
  // Result: m3 should NOT be moderated.
  // Wait wait — actually 'spam' followed by 'mer' — both 'm' and 'm' are word chars, so \b doesn't match.
  // So 'spammer' should NOT trigger 'spam' boundary.
  // But wait, if we have 'I love spam!' — 'spam' is followed by '!' (non-word), so \b matches.
  // Let me verify: 'spammer' contains 'spam' as substring, but the regex \b(?:spam)\b requires a word boundary AFTER 'spam'. In 'spammer', after 'spam' is 'm' (word char), so NO boundary. Hence no match.
  // So m3 should be NOT moderated.
  assertEq(m3.moderated, false, "'spammer' doesn't trigger 'spam' boundary (lookaround lesson)");
  // Now 'I love spam!' should match
  const m4 = sendMessage('stream-4', 'user-y', 'I love spam!');
  assertEq(m4.moderated, true, 'standalone "spam" with ! triggers');

  section('sendMessage — rate limit');
  reset();
  updateChatConfig('stream-5', {
    rateLimitPerMinute: 3,
  });
  joinChatRoom('stream-5', 'user-r');
  sendMessage('stream-5', 'user-r', 'msg 1');
  sendMessage('stream-5', 'user-r', 'msg 2');
  sendMessage('stream-5', 'user-r', 'msg 3');
  assertThrows(
    () => sendMessage('stream-5', 'user-r', 'msg 4'),
    /rate limit exceeded/,
    '4th message blocked by rate limit',
  );
  // Different user not affected
  joinChatRoom('stream-5', 'user-s');
  sendMessage('stream-5', 'user-s', 'msg s1');
  // No throw → user-s can send

  section('sendMessage — slow mode');
  reset();
  updateChatConfig('stream-6', {
    slowModeSeconds: 60,
  });
  joinChatRoom('stream-6', 'user-slow');
  sendMessage('stream-6', 'user-slow', 'first');
  assertThrows(
    () => sendMessage('stream-6', 'user-slow', 'second'),
    /slow mode active/,
    'second message blocked by slow mode',
  );

  section('sendMessage — requireTraditionTag');
  reset();
  updateChatConfig('stream-7', { requireTraditionTag: true });
  joinChatRoom('stream-7', 'user-t');
  assertThrows(
    () => sendMessage('stream-7', 'user-t', 'no tag'),
    /traditionTag is required/,
    'missing traditionTag rejected when required',
  );
  sendMessage('stream-7', 'user-t', 'with tag', { traditionTag: 'tarot' });

  section('moderateMessage — redact / delete / pin / unpin');
  reset();
  joinChatRoom('stream-8', 'user-m');
  const mm = sendMessage('stream-8', 'user-m', 'hello world');
  moderateMessage(mm.id, 'mod-1', 'pin');
  const after1 = getRecentMessages('stream-8', 10).find((m) => m.id === mm.id);
  assertEq(after1?.pinned, true, 'pin sets pinned=true');
  moderateMessage(mm.id, 'mod-1', 'unpin');
  const after2 = getRecentMessages('stream-8', 10).find((m) => m.id === mm.id);
  assertEq(after2?.pinned, false, 'unpin sets pinned=false');
  moderateMessage(mm.id, 'mod-1', 'redact');
  const after3 = getRecentMessages('stream-8', 10).find((m) => m.id === mm.id);
  assertEq(after3?.body, '[redacted]', 'redact replaces body');
  assertEq(after3?.moderated, true, 'redact sets moderated=true');
  // Delete
  const mm2 = sendMessage('stream-8', 'user-m', 'to be deleted');
  moderateMessage(mm2.id, 'mod-1', 'delete');
  const after4 = getRecentMessages('stream-8', 10).find((m) => m.id === mm2.id);
  assertEq(after4, undefined, 'delete removes message');

  assertThrows(
    () => moderateMessage('', 'mod-1', 'pin'),
    /messageId is required/,
    'empty messageId rejected',
  );
  assertThrows(
    () => moderateMessage('x', '', 'pin'),
    /moderatorId is required/,
    'empty moderatorId rejected',
  );
  assertThrows(
    () => moderateMessage('x', 'm', 'invalid' as any),
    /invalid action/,
    'invalid action rejected',
  );
  assertThrows(
    () => moderateMessage('nonexistent', 'mod-1', 'pin'),
    /message not found/,
    'moderate unknown message rejected',
  );

  section('addReaction');
  reset();
  joinChatRoom('stream-9', 'user-r');
  const rm = sendMessage('stream-9', 'user-r', 'react to me');
  addReaction(rm.id, 'user-r', '🌟');
  addReaction(rm.id, 'user-r', '🌟');
  addReaction(rm.id, 'user-r', '🔥');
  const updated9 = getRecentMessages('stream-9', 10).find((m) => m.id === rm.id)!;
  assertEq(updated9.reactions['🌟'], 2, '🌟 count=2');
  assertEq(updated9.reactions['🔥'], 1, '🔥 count=1');
  assertThrows(
    () => addReaction('', 'u', '🌟'),
    /messageId is required/,
    'addReaction empty messageId rejected',
  );
  assertThrows(
    () => addReaction(rm.id, '', '🌟'),
    /userId is required/,
    'addReaction empty userId rejected',
  );
  assertThrows(
    () => addReaction(rm.id, 'u', ''),
    /emoji is required/,
    'addReaction empty emoji rejected',
  );
  assertThrows(
    () => addReaction('nonexistent', 'u', '🌟'),
    /message not found/,
    'addReaction unknown message rejected',
  );

  section('getRecentMessages — limit / since / type filter');
  reset();
  joinChatRoom('stream-10', 'user-q');
  for (let i = 0; i < 5; i++) {
    sendMessage('stream-10', 'user-q', `msg ${i}`);
  }
  const recent = getRecentMessages('stream-10', 3);
  assertEq(recent.length, 3, 'limit=3 returns 3');
  assertEq(recent[0].body, 'msg 2', 'first is msg 2');
  assertEq(recent[2].body, 'msg 4', 'last is msg 4');
  const since = Date.now() - 1000;
  const recent2 = getRecentMessages('stream-10', 10, { since });
  assertEq(recent2.length, 5, 'since=now-1s includes all');
  // System filter
  const sys = sendMessage('stream-10', 'mod-x', 'system msg', { type: 'system' });
  const sysOnly = getRecentMessages('stream-10', 10, { type: 'system' });
  assertEq(sysOnly.length, 1, 'system filter=1');
  assertEq(sysOnly[0].id, sys.id, 'system id matches');

  section('subscribeToChat — pub/sub');
  reset();
  joinChatRoom('stream-11', 'user-sub');
  const received: string[] = [];
  const unsub = subscribeToChat('stream-11', (m) => received.push(m.body));
  sendMessage('stream-11', 'user-sub', 'first message');
  sendMessage('stream-11', 'user-sub', 'second message');
  assertEq(received.length, 2, 'received 2 messages');
  assertEq(received[0], 'first message', 'first = first message');
  assertEq(received[1], 'second message', 'second = second message');
  unsub();
  sendMessage('stream-11', 'user-sub', 'third message');
  assertEq(received.length, 2, 'no more after unsub');

  assertThrows(
    () => subscribeToChat('', () => {}),
    /streamId is required/,
    'subscribe empty streamId rejected',
  );
  assertThrows(
    () => subscribeToChat('x', null as any),
    /handler must be a function/,
    'subscribe null handler rejected',
  );

  section('getChatStats');
  reset();
  joinChatRoom('stream-12', 'user-s');
  for (let i = 0; i < 10; i++) {
    sendMessage('stream-12', 'user-s', `m${i}`);
  }
  const stats = getChatStats('stream-12');
  assertEq(stats.totalMessages, 10, 'totalMessages=10');
  assertEq(stats.uniqueUsers, 1, 'uniqueUsers=1');
  assertEq(stats.peakConcurrent, 1, 'peakConcurrent=1');
  assertIt(stats.messagesPerMinute > 0, 'messagesPerMinute>0');
  assertEq(stats.topReactions.length, 0, 'no reactions yet');

  // Reaction aggregation
  const lastMsg = getRecentMessages('stream-12', 1)[0];
  addReaction(lastMsg.id, 'user-s', '🌟');
  addReaction(lastMsg.id, 'user-s', '🌟');
  addReaction(lastMsg.id, 'user-s', '🔥');
  const stats2 = getChatStats('stream-12');
  assertEq(stats2.topReactions[0].count, 2, 'top reaction count=2');

  section('auditChatTraditions / auditChatSurface');
  const auditTrad = auditChatTraditions();
  assertEq(Object.keys(auditTrad).length, 7, 'audit traditions=7');
  const auditSurf = auditChatSurface();
  assertEq(auditSurf.types.length, 5, '5 message types');
  assertEq(auditSurf.traditions.length, 7, '7 tradition tags');
  assertEq(auditSurf.ringBufferCap, 500, 'ring buffer cap=500');

  section('getChatConfig / updateChatConfig');
  reset();
  assertEq(getChatConfig('nonexistent'), null, 'no config returns null');
  const cfg: Partial<ChatConfig> = {
    maxMessageLength: 200,
    rateLimitPerMinute: 5,
    slowModeSeconds: 10,
    moderatedWords: ['bad'],
    allowedEmojis: ['🌙'],
    requireTraditionTag: true,
  };
  const updatedCfg = updateChatConfig('stream-cfg', cfg);
  assertEq(updatedCfg.maxMessageLength, 200, 'maxMessageLength=200');
  assertEq(updatedCfg.rateLimitPerMinute, 5, 'rateLimitPerMinute=5');
  assertEq(updatedCfg.slowModeSeconds, 10, 'slowModeSeconds=10');
  assertEq(updatedCfg.moderatedWords.length, 1, 'moderatedWords=1');
  assertEq(updatedCfg.allowedEmojis.length, 1, 'allowedEmojis=1');
  assertEq(updatedCfg.requireTraditionTag, true, 'requireTraditionTag=true');

  section('Ring buffer eviction (>500 messages)');
  reset();
  updateChatConfig('stream-rb', { rateLimitPerMinute: 0 });
  joinChatRoom('stream-rb', 'user-rb');
  for (let i = 0; i < 510; i++) {
    sendMessage('stream-rb', 'user-rb', `bulk ${i}`);
  }
  const all = getRecentMessages('stream-rb', 600);
  assertEq(all.length, 500, 'ring buffer caps at 500');
  assertEq(all[0].body, 'bulk 10', 'first kept is bulk 10');
  assertEq(all[499].body, 'bulk 509', 'last kept is bulk 509');

  return { passed, failed, total: passed + failed, failures };
}

// Direct execution guard
if (import.meta.url === `file://${process.argv[1]}`) {
  const r = runLivestreamChatSpec();
  console.log(`livestream-chat.spec: ${r.passed}/${r.total} passed`);
  if (r.failed > 0) {
    console.error('FAILURES:');
    for (const f of r.failures) console.error('  - ' + f);
    process.exit(1);
  }
}