/**
 * ════════════════════════════════════════════════════════════════════════════
 * W81-D — LIVESTREAM WATCH UI · SPEC
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 81 · 2026-06-30
 * Author: W81-D Coder (Mavis orchestrator session 414735487684817)
 *
 * Self-running test harness — no vitest, no node:test. We register
 * assertions through `it()` and run them sequentially at the bottom.
 *
 * Coverage targets:
 *   • Branded ID factories            (StreamId, ChatMessageId, UserId, ReactionId)
 *   • 7 sacred stream categories      (mesa, gira, prece, leitura, ritual, mantra, estudo)
 *   • Player + chat state machines    (positive + negative transitions)
 *   • Chat moderation                 (allow / soft-warn / redact / block)
 *   • Reaction debounce               (per-user 600ms floor + 60/min cap)
 *   • LGPD audio-consent gate         (gesture + opt-in)
 *   • Viewer-count formatter          (<1k, <10k, <1M, ≥1M)
 *   • A11Y shortcuts                  (Space, M, ←, →, F)
 *   • Reaction aggregation            (count + sort desc)
 *   • Schedule banner tone            (info / warn / sacred)
 *   • Frozen records                  (Object.isFrozen on every export)
 *
 * Target: ≥60 assertions. We aim for ~75 to leave headroom.
 */

// @ts-ignore — react-stubs.d.ts provides the global type definitions.
declare const process: { exit(code: number): never };

import {
  // Branded IDs
  streamId,
  chatMessageId,
  userId,
  reactionId,
  // Categories
  STREAM_CATEGORIES,
  listStreamCategories,
  getStreamCategory,
  type StreamCategory,
  // State machines
  canTransitionPlayer,
  transitionPlayer,
  canTransitionChat,
  transitionChat,
  type PlayerState,
  type ChatState,
  // Chat messages
  type ChatMessage,
  type ChatMessageKind,
  isChatMessageKind,
  chatMessageKind,
  // Moderation
  moderateChatBody,
  defaultModerationRules,
  buildModerationMessage,
  type ModerationDecision,
  // Reactions
  shouldAllowReaction,
  aggregateReactions,
  DEFAULT_REACTION_DEBOUNCE,
  type ReactionAttempt,
  // LGPD
  canAutoPlayWithAudio,
  audioConsentCta,
  // Viewer count
  formatViewerCount,
  viewerCountAriaLabel,
  // A11Y
  A11Y_SHORTCUTS,
  resolveShortcut,
  CHAT_LIVE_REGION_POLITENESS,
  PLAYER_LIVE_REGION_POLITENESS,
  TOUCH_TARGET_MIN_PX,
  type A11yShortcut,
  // Schedule
  formatStartsIn,
  buildScheduleNotice,
  // Constants
  W81_D_VERSION,
  W81_D_CYCLE,
  W81_D_SHIPPED_COMPONENTS,
  W81_D_SHIPPED_TRADITIONS,
} from './livestream-watch-engine.ts';

// ════════════════════════════════════════════════════════════════════════════
// Tiny harness
// ════════════════════════════════════════════════════════════════════════════

interface SpecEntry {
  name: string;
  run: () => void | Promise<void>;
}

const SPEC_REGISTRY: SpecEntry[] = [];

function it(name: string, run: () => void | Promise<void>): void {
  SPEC_REGISTRY.push({ name, run: () => run() });
}

function assertEqual<T>(actual: T, expected: T, label?: string): void {
  const ok = Object.is(actual, expected) || JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    throw new Error(
      `assertEqual FAIL${label ? ' (' + label + ')' : ''}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
  }
}

function assertTrue(v: unknown, label?: string): void {
  if (!v) throw new Error(`assertTrue FAIL${label ? ' (' + label + ')' : ''}: ${String(v)}`);
}

function assertFalse(v: unknown, label?: string): void {
  if (v) throw new Error(`assertFalse FAIL${label ? ' (' + label + ')' : ''}: ${String(v)}`);
}

function assertMatch(haystack: string, re: RegExp, label?: string): void {
  if (!re.test(haystack)) {
    throw new Error(
      `assertMatch FAIL${label ? ' (' + label + ')' : ''}: ${re} not in ${JSON.stringify(haystack.slice(0, 200))}`,
    );
  }
}

function assertThrows(fn: () => unknown, label?: string): void {
  let threw = false;
  try { fn(); } catch { threw = true; }
  if (!threw) throw new Error(`assertThrows FAIL${label ? ' (' + label + ')' : ''}: did not throw`);
}

// ════════════════════════════════════════════════════════════════════════════
// SPECS — Branded IDs
// ════════════════════════════════════════════════════════════════════════════

it('streamId accepts ls_<12hex> and rejects other shapes', () => {
  assertEqual(streamId('ls_abc123def456'), 'ls_abc123def456');
  assertThrows(() => streamId('cm_abc123def456'), 'wrong prefix should throw');
  assertThrows(() => streamId('ls_X'), 'too-short should throw');
  assertThrows(() => streamId('ls_INVALID-CAPS'), 'non-hex should throw');
});

it('chatMessageId accepts cm_<12hex> and rejects', () => {
  assertEqual(chatMessageId('cm_abc123def456'), 'cm_abc123def456');
  assertThrows(() => chatMessageId('ls_abc123def456'), 'wrong prefix');
  assertThrows(() => chatMessageId('cm_X'), 'too-short');
});

it('userId accepts usr_<6+hex> and rejects', () => {
  assertEqual(userId('usr_abc123'), 'usr_abc123');
  assertEqual(userId('usr_abc123def456789'), 'usr_abc123def456789');
  assertThrows(() => userId('usr_X'), 'too-short');
  assertThrows(() => userId('cm_abc123'), 'wrong prefix');
});

it('reactionId accepts rxn_<12hex> and rejects', () => {
  assertEqual(reactionId('rxn_abc123def456'), 'rxn_abc123def456');
  assertThrows(() => reactionId('ls_abc123def456'), 'wrong prefix');
});

// ════════════════════════════════════════════════════════════════════════════
// SPECS — Stream categories (7 sacred kinds)
// ════════════════════════════════════════════════════════════════════════════

it('listStreamCategories returns exactly 7 categories', () => {
  const cats = listStreamCategories();
  assertEqual(cats.length, 7);
});

it('STREAM_CATEGORIES contains mesa, gira, prece, leitura, ritual, mantra, estudo', () => {
  const expected: StreamCategory[] = ['mesa', 'gira', 'prece', 'leitura', 'ritual', 'mantra', 'estudo'];
  for (const c of expected) {
    assertTrue(STREAM_CATEGORIES[c] !== undefined, `${c} must exist`);
    assertEqual(STREAM_CATEGORIES[c].id, c);
    assertTrue(typeof STREAM_CATEGORIES[c].label === 'string');
    assertTrue(STREAM_CATEGORIES[c].label.length > 0);
    assertTrue(typeof STREAM_CATEGORIES[c].emoji === 'string');
    assertTrue(STREAM_CATEGORIES[c].accentColor.startsWith('#'));
  }
});

it('all category records are frozen (cycle 75 #6 invariant)', () => {
  for (const c of listStreamCategories()) {
    assertTrue(Object.isFrozen(STREAM_CATEGORIES[c]), `${c} must be frozen`);
    assertTrue(Object.isFrozen(STREAM_CATEGORIES[c].traditionHints), `${c} traditionHints must be frozen`);
  }
});

it('getStreamCategory returns null for unknown id', () => {
  assertEqual(getStreamCategory('unknown'), null);
  assertEqual(getStreamCategory(''), null);
});

it('getStreamCategory returns meta for mesa', () => {
  const meta = getStreamCategory('mesa');
  assertTrue(meta !== null);
  assertEqual(meta?.label, 'Mesa Real');
  assertTrue(meta!.lgpdSacredContent);
});

it('sacred categories (mesa, gira, prece, ritual, mantra) require audio consent', () => {
  for (const c of ['mesa', 'gira', 'prece', 'ritual', 'mantra'] as StreamCategory[]) {
    assertTrue(STREAM_CATEGORIES[c].lgpdSacredContent, `${c} is sacred`);
    assertTrue(STREAM_CATEGORIES[c].lgpdRequiresAudioConsent, `${c} requires audio consent`);
  }
});

it('non-sacred categories (leitura, estudo) do NOT require audio consent', () => {
  assertFalse(STREAM_CATEGORIES.leitura.lgpdSacredContent, 'leitura is not sacred');
  assertFalse(STREAM_CATEGORIES.estudo.lgpdSacredContent, 'estudo is not sacred');
  assertFalse(STREAM_CATEGORIES.estudo.lgpdRequiresAudioConsent, 'estudo does not require audio consent');
});

it('all 7 traditions appear in the union of category hints', () => {
  const allTraditions = new Set<string>();
  for (const c of listStreamCategories()) {
    for (const t of STREAM_CATEGORIES[c].traditionHints) {
      allTraditions.add(t);
    }
  }
  for (const t of ['Cigano', 'Umbanda', 'Candomblé', 'Ifá', 'Cabala', 'Astrologia', 'Tantra', 'Tarot', 'Runas', 'Numerologia']) {
    assertTrue(allTraditions.has(t), `${t} must appear in some category`);
  }
  assertTrue(allTraditions.size >= 7, `union must have ≥7 traditions, got ${allTraditions.size}`);
});

// ════════════════════════════════════════════════════════════════════════════
// SPECS — Player state machine
// ════════════════════════════════════════════════════════════════════════════

it('player transitions: IDLE only goes to BUFFERING', () => {
  assertTrue(canTransitionPlayer('IDLE', 'BUFFERING'));
  assertFalse(canTransitionPlayer('IDLE', 'PLAYING'), 'IDLE cannot jump to PLAYING');
  assertFalse(canTransitionPlayer('IDLE', 'PAUSED'));
  assertFalse(canTransitionPlayer('IDLE', 'ENDED'));
});

it('player transitions: BUFFERING → PLAYING | PAUSED | ENDED | IDLE', () => {
  for (const s of ['PLAYING', 'PAUSED', 'ENDED', 'IDLE'] as PlayerState[]) {
    assertTrue(canTransitionPlayer('BUFFERING', s), `BUFFERING → ${s} must be allowed`);
  }
  assertFalse(canTransitionPlayer('BUFFERING', 'BUFFERING'), 'self-loop not allowed');
});

it('player transitions: PLAYING ↔ PAUSED allowed', () => {
  assertTrue(canTransitionPlayer('PLAYING', 'PAUSED'));
  assertTrue(canTransitionPlayer('PAUSED', 'PLAYING'));
  assertTrue(canTransitionPlayer('PLAYING', 'ENDED'));
  assertTrue(canTransitionPlayer('PAUSED', 'ENDED'));
});

it('player transitions: ENDED goes back to IDLE or BUFFERING', () => {
  assertTrue(canTransitionPlayer('ENDED', 'IDLE'));
  assertTrue(canTransitionPlayer('ENDED', 'BUFFERING'));
  assertFalse(canTransitionPlayer('ENDED', 'PLAYING'), 'ENDED cannot go directly to PLAYING');
  assertFalse(canTransitionPlayer('ENDED', 'PAUSED'), 'ENDED cannot go directly to PAUSED');
});

it('transitionPlayer throws on invalid transition', () => {
  assertThrows(() => transitionPlayer('IDLE', 'PLAYING'));
  assertEqual(transitionPlayer('IDLE', 'BUFFERING'), 'BUFFERING');
});

// ════════════════════════════════════════════════════════════════════════════
// SPECS — Chat state machine
// ════════════════════════════════════════════════════════════════════════════

it('chat transitions: IDLE → LOADING → CONNECTED', () => {
  assertTrue(canTransitionChat('IDLE', 'LOADING'));
  assertTrue(canTransitionChat('LOADING', 'CONNECTED'));
  assertTrue(canTransitionChat('CONNECTED', 'DISCONNECTED'));
  assertTrue(canTransitionChat('DISCONNECTED', 'LOADING'));
  assertTrue(canTransitionChat('DISCONNECTED', 'IDLE'));
});

it('chat transitions: IDLE cannot jump to CONNECTED', () => {
  assertFalse(canTransitionChat('IDLE', 'CONNECTED'));
  assertFalse(canTransitionChat('IDLE', 'DISCONNECTED'));
});

it('chat transitions: CONNECTED → IDLE not allowed (must go through LOADING)', () => {
  assertFalse(canTransitionChat('CONNECTED', 'IDLE'));
});

it('transitionChat throws on invalid', () => {
  assertThrows(() => transitionChat('IDLE', 'CONNECTED'));
  assertEqual(transitionChat('IDLE', 'LOADING'), 'LOADING');
});

// ════════════════════════════════════════════════════════════════════════════
// SPECS — Chat message discriminated union
// ════════════════════════════════════════════════════════════════════════════

it('isChatMessageKind returns true for the 5 known kinds', () => {
  assertTrue(isChatMessageKind('text'));
  assertTrue(isChatMessageKind('reaction'));
  assertTrue(isChatMessageKind('system'));
  assertTrue(isChatMessageKind('moderation'));
  assertTrue(isChatMessageKind('question'));
});

it('isChatMessageKind returns false for unknown kinds', () => {
  assertFalse(isChatMessageKind('banana'));
  assertFalse(isChatMessageKind(''));
  assertFalse(isChatMessageKind('TEXT'), 'case-sensitive');
});

it('chatMessageKind returns the kind discriminator', () => {
  const m: ChatMessage = { kind: 'text', id: chatMessageId('cm_aaaaaaaaaaaa'), userId: userId('usr_aaaaaa'), displayName: 'A', body: 'oi', ts: 1 };
  assertEqual(chatMessageKind(m), 'text');
});

const u = userId('usr_aaaaaa');
const cm = chatMessageId('cm_aaaaaaaaaaaa');

it('a text message has all required fields', () => {
  const m: ChatMessage = { kind: 'text', id: cm, userId: u, displayName: 'João', body: 'oi', ts: 1700000000000 };
  assertEqual(m.kind, 'text');
  assertEqual(m.displayName, 'João');
  assertEqual(m.body, 'oi');
});

it('a reaction message has emoji + ts', () => {
  const m: ChatMessage = { kind: 'reaction', id: cm, userId: u, emoji: '🙏', ts: 1 };
  assertEqual(m.emoji, '🙏');
});

it('a system message has body (no userId)', () => {
  const m: ChatMessage = { kind: 'system', id: cm, body: 'Transmissão começou', ts: 1 };
  assertEqual(m.body, 'Transmissão começou');
});

it('a moderation message has targetUserId + reason', () => {
  const m: ChatMessage = { kind: 'moderation', id: cm, targetUserId: u, reason: 'palavrão', ts: 1 };
  assertEqual(m.reason, 'palavrão');
});

it('a question message can be pinned', () => {
  const m: ChatMessage = { kind: 'question', id: cm, userId: u, displayName: 'M', body: '?', ts: 1, pinned: true };
  assertTrue(m.pinned);
});

// ════════════════════════════════════════════════════════════════════════════
// SPECS — Chat moderation
// ════════════════════════════════════════════════════════════════════════════

it('moderateChatBody allows clean text', () => {
  const d: ModerationDecision = moderateChatBody('oi, tudo bem?');
  assertEqual(d.action, 'allow');
});

it('moderateChatBody blocks empty body', () => {
  const d: ModerationDecision = moderateChatBody('');
  assertEqual(d.action, 'block');
});

it('moderateChatBody blocks body > 500 chars', () => {
  const d: ModerationDecision = moderateChatBody('a'.repeat(501));
  assertEqual(d.action, 'block');
  assertMatch(d.reason, /> 500/);
});

it('moderateChatBody soft-warns on "idiota"', () => {
  const d: ModerationDecision = moderateChatBody('você é idiota');
  assertEqual(d.action, 'soft-warn');
});

it('moderateChatBody soft-warns on caps-lock', () => {
  const d: ModerationDecision = moderateChatBody('AAAAAAAAAAAA BBBB');
  assertEqual(d.action, 'soft-warn');
  assertMatch(d.reason, /caps/);
});

it('moderateChatBody redacts strong profanity', () => {
  const d: ModerationDecision = moderateChatBody('filho da puta');
  assertEqual(d.action, 'redact');
  if (d.action === 'redact' || d.action === 'soft-warn') {
    assertTrue(d.redactedBody.includes('[REMOVIDO]'));
  }
});

it('moderateChatBody redacts PII (e-mail)', () => {
  const d: ModerationDecision = moderateChatBody('meu email é joao@example.com');
  assertEqual(d.action, 'redact');
  if (d.action === 'redact' || d.action === 'soft-warn') {
    assertTrue(d.redactedBody.includes('[REMOVIDO]'));
    assertFalse(d.redactedBody.includes('joao@example.com'));
  }
});

it('moderateChatBody redacts PII (phone)', () => {
  const d: ModerationDecision = moderateChatBody('me liga (11) 98765-4321');
  assertEqual(d.action, 'redact');
});

it('moderateChatBody allows sacred terminology without false positives', () => {
  // Sacred words must NOT be flagged by profanity patterns
  for (const word of ['Oxum', 'Ogum', 'Iansã', 'Prece', 'Ritual', 'Mantra', 'Tarot', 'Cabala']) {
    const d: ModerationDecision = moderateChatBody(`A ${word} é sagrada`);
    assertEqual(d.action, 'allow', `sacred word "${word}" must not be moderated`);
  }
});

it('defaultModerationRules returns 6 rules (4 profanity + 2 PII)', () => {
  const rules = defaultModerationRules();
  assertEqual(rules.length, 6);
  // All rules frozen
  for (const r of rules) assertTrue(Object.isFrozen(r), `rule ${r.id} must be frozen`);
});

// ════════════════════════════════════════════════════════════════════════════
// SPECS — Reaction debounce
// ════════════════════════════════════════════════════════════════════════════

it('shouldAllowReaction allows first reaction', () => {
  const r = shouldAllowReaction([], { userId: u, emoji: '🙏', ts: 1000 });
  assertTrue(r.allowed);
  assertEqual(r.waitMs, 0);
});

it('shouldAllowReaction blocks same-user within 600ms', () => {
  const history: ReactionAttempt[] = [{ userId: u, emoji: '🙏', ts: 1000 }];
  const r = shouldAllowReaction(history, { userId: u, emoji: '🔥', ts: 1200 });
  assertFalse(r.allowed);
  assertTrue(r.waitMs > 0);
  assertTrue(r.waitMs <= 600);
});

it('shouldAllowReaction allows after 600ms+ from same user', () => {
  const history: ReactionAttempt[] = [{ userId: u, emoji: '🙏', ts: 1000 }];
  const r = shouldAllowReaction(history, { userId: u, emoji: '🔥', ts: 1700 });
  assertTrue(r.allowed);
});

it('shouldAllowReaction does NOT block other users within 600ms', () => {
  const otherUser = userId('usr_bbbbbb');
  const history: ReactionAttempt[] = [{ userId: u, emoji: '🙏', ts: 1000 }];
  const r = shouldAllowReaction(history, { userId: otherUser, emoji: '🔥', ts: 1100 });
  assertTrue(r.allowed);
});

it('shouldAllowReaction blocks emoji > 8 chars', () => {
  const r = shouldAllowReaction([], { userId: u, emoji: 'a'.repeat(9), ts: 1000 });
  assertFalse(r.allowed);
  assertMatch(r.reason, /> 8 chars/);
});

it('shouldAllowReaction blocks empty emoji', () => {
  const r = shouldAllowReaction([], { userId: u, emoji: '', ts: 1000 });
  assertFalse(r.allowed);
});

it('shouldAllowReaction blocks when > 60/min total', () => {
  const history: ReactionAttempt[] = [];
  // 60 reactions within 30s — well under the 60/min window from the attempt
  for (let i = 0; i < 60; i++) {
    history.push({ userId: u, emoji: '🙏', ts: 1_000 + i * 500 });
  }
  // Attempt 700ms after the last one — past the 600ms per-user floor
  const r = shouldAllowReaction(history, { userId: u, emoji: '🙏', ts: 31_200 });
  assertFalse(r.allowed);
  assertMatch(r.reason, /> 60/);
});

it('DEFAULT_REACTION_DEBOUNCE has 600ms floor + 60/min cap', () => {
  assertEqual(DEFAULT_REACTION_DEBOUNCE.minIntervalMs, 600);
  assertEqual(DEFAULT_REACTION_DEBOUNCE.maxReactionsPerMinute, 60);
});

// ════════════════════════════════════════════════════════════════════════════
// SPECS — LGPD audio-consent gate
// ════════════════════════════════════════════════════════════════════════════

it('canAutoPlayWithAudio blocks without user gesture (any category)', () => {
  assertFalse(canAutoPlayWithAudio({ sacredCategory: 'mesa', userGesture: false, explicitAudioOptIn: true }));
  assertFalse(canAutoPlayWithAudio({ sacredCategory: 'estudo', userGesture: false, explicitAudioOptIn: true }));
  assertFalse(canAutoPlayWithAudio({ sacredCategory: null, userGesture: false, explicitAudioOptIn: true }));
});

it('canAutoPlayWithAudio requires explicit opt-in for sacred categories', () => {
  // mesa: sacred, no opt-in → blocked
  assertFalse(canAutoPlayWithAudio({ sacredCategory: 'mesa', userGesture: true, explicitAudioOptIn: false }));
  // mesa: sacred + opt-in → allowed
  assertTrue(canAutoPlayWithAudio({ sacredCategory: 'mesa', userGesture: true, explicitAudioOptIn: true }));
});

it('canAutoPlayWithAudio allows non-sacred with just user gesture', () => {
  // estudo: not sacred + does NOT require audio consent — user gesture alone suffices
  assertTrue(canAutoPlayWithAudio({ sacredCategory: 'estudo', userGesture: true, explicitAudioOptIn: false }));
  // null: no category at all — user gesture alone suffices
  assertTrue(canAutoPlayWithAudio({ sacredCategory: null, userGesture: true, explicitAudioOptIn: false }));
});

it('audioConsentCta mentions "sagrado" for sacred categories', () => {
  const ctaMesa = audioConsentCta('mesa');
  assertMatch(ctaMesa, /sagrado/);
  const ctaEstudo = audioConsentCta('estudo');
  assertFalse(ctaEstudo.includes('sagrado'));
});

it('audioConsentCta works with null category', () => {
  const cta = audioConsentCta(null);
  assertMatch(cta, /som/);
});

// ════════════════════════════════════════════════════════════════════════════
// SPECS — Viewer count formatter
// ════════════════════════════════════════════════════════════════════════════

it('formatViewerCount: <1000 stays as integer', () => {
  assertEqual(formatViewerCount(0), '0');
  assertEqual(formatViewerCount(1), '1');
  assertEqual(formatViewerCount(999), '999');
});

it('formatViewerCount: 1k-10k uses 1 decimal', () => {
  assertEqual(formatViewerCount(1000), '1.0k');
  assertEqual(formatViewerCount(1500), '1.5k');
  assertEqual(formatViewerCount(9999), '10.0k');
});

it('formatViewerCount: 10k-1M uses integer k', () => {
  assertEqual(formatViewerCount(10000), '10k');
  assertEqual(formatViewerCount(12345), '12k');
  assertEqual(formatViewerCount(999999), '999k');
});

it('formatViewerCount: ≥1M uses 1 decimal M', () => {
  assertEqual(formatViewerCount(1_000_000), '1.0M');
  assertEqual(formatViewerCount(1_500_000), '1.5M');
});

it('formatViewerCount: NaN/negative → "0"', () => {
  assertEqual(formatViewerCount(-1), '0');
  assertEqual(formatViewerCount(NaN), '0');
  assertEqual(formatViewerCount(Infinity), '0');
});

it('viewerCountAriaLabel singular for 1, plural otherwise', () => {
  assertMatch(viewerCountAriaLabel(1), /1 pessoa/);
  assertMatch(viewerCountAriaLabel(0), /pessoas/);
  assertMatch(viewerCountAriaLabel(1500), /1\.5k/);
});

// ════════════════════════════════════════════════════════════════════════════
// SPECS — A11Y shortcuts
// ════════════════════════════════════════════════════════════════════════════

it('A11Y_SHORTCUTS has 5 entries', () => {
  assertEqual(Object.keys(A11Y_SHORTCUTS).length, 5);
});

it('A11Y_SHORTCUTS includes Space/M/←/→/F', () => {
  assertEqual(A11Y_SHORTCUTS.playPause.ariaKeyShortcuts, 'Space');
  assertEqual(A11Y_SHORTCUTS.mute.ariaKeyShortcuts, 'M');
  assertEqual(A11Y_SHORTCUTS.seekBack.ariaKeyShortcuts, 'ArrowLeft');
  assertEqual(A11Y_SHORTCUTS.seekForward.ariaKeyShortcuts, 'ArrowRight');
  assertEqual(A11Y_SHORTCUTS.fullscreen.ariaKeyShortcuts, 'F');
});

it('resolveShortcut maps keys correctly (case-insensitive)', () => {
  assertEqual(resolveShortcut(' '), 'playPause');
  assertEqual(resolveShortcut('m'), 'mute');
  assertEqual(resolveShortcut('M'), 'mute');
  assertEqual(resolveShortcut('ArrowLeft'), 'seekBack');
  assertEqual(resolveShortcut('ArrowRight'), 'seekForward');
  assertEqual(resolveShortcut('f'), 'fullscreen');
});

it('resolveShortcut returns null for unknown keys', () => {
  assertEqual(resolveShortcut('x'), null);
  assertEqual(resolveShortcut('Enter'), null);
});

it('live-region politeness constants are set', () => {
  assertEqual(CHAT_LIVE_REGION_POLITENESS, 'polite');
  assertEqual(PLAYER_LIVE_REGION_POLITENESS, 'assertive');
});

it('TOUCH_TARGET_MIN_PX is 44 (WCAG 2.5.5)', () => {
  assertEqual(TOUCH_TARGET_MIN_PX, 44);
});

// ════════════════════════════════════════════════════════════════════════════
// SPECS — Reaction aggregation
// ════════════════════════════════════════════════════════════════════════════

it('aggregateReactions counts and sorts desc', () => {
  const agg = aggregateReactions([
    { userId: u, emoji: '🙏', ts: 1 },
    { userId: u, emoji: '🙏', ts: 2 },
    { userId: u, emoji: '🔥', ts: 3 },
  ]);
  assertEqual(agg.length, 2);
  const first = agg[0];
  const second = agg[1];
  assertTrue(first !== undefined && second !== undefined, 'aggregates exist');
  assertEqual(first!.emoji, '🙏');
  assertEqual(first!.count, 2);
  assertEqual(second!.emoji, '🔥');
  assertEqual(second!.count, 1);
});

it('aggregateReactions empty input → empty array', () => {
  const agg = aggregateReactions([]);
  assertEqual(agg.length, 0);
});

it('aggregateReactions records are frozen', () => {
  const agg = aggregateReactions([{ userId: u, emoji: '🙏', ts: 1 }]);
  assertTrue(Object.isFrozen(agg));
  const first = agg[0];
  assertTrue(first !== undefined, 'first aggregate exists');
  assertTrue(Object.isFrozen(first));
});

// ════════════════════════════════════════════════════════════════════════════
// SPECS — Schedule banner
// ════════════════════════════════════════════════════════════════════════════

it('formatStartsIn: live now', () => {
  assertEqual(formatStartsIn(1000, 5000), 'ao vivo agora');
  assertEqual(formatStartsIn(5000, 5000), 'ao vivo agora');
});

it('formatStartsIn: minutes', () => {
  assertMatch(formatStartsIn(60_000, 0), /instantes|min/);
  assertMatch(formatStartsIn(5 * 60_000, 0), /5 min/);
  assertMatch(formatStartsIn(59 * 60_000, 0), /59 min/);
});

it('formatStartsIn: hours', () => {
  assertMatch(formatStartsIn(2 * 60 * 60_000, 0), /2h/);
});

it('formatStartsIn: days', () => {
  assertMatch(formatStartsIn(3 * 24 * 60 * 60_000, 0), /3d/);
});

it('buildScheduleNotice returns "sacred" tone for sacred + <5min', () => {
  const n = buildScheduleNotice('mesa', 60_000); // 1 min away
  assertEqual(n.tone, 'sacred');
});

it('buildScheduleNotice returns "info" for live (negative) on non-sacred', () => {
  const n = buildScheduleNotice('estudo', -1000);
  assertEqual(n.tone, 'info');
  assertMatch(n.message, /em andamento/);
});

it('buildScheduleNotice returns "warn" for <1h', () => {
  const n = buildScheduleNotice('mesa', 30 * 60_000);
  assertEqual(n.tone, 'warn');
});

it('buildScheduleNotice returns "info" for >1h', () => {
  const n = buildScheduleNotice('mesa', 5 * 60 * 60_000);
  assertEqual(n.tone, 'info');
});

it('buildScheduleNotice for non-sacred never returns "sacred"', () => {
  const n1 = buildScheduleNotice('estudo', 60_000);
  assertFalse(n1.tone === 'sacred', 'estudo should never be sacred');
  const n2 = buildScheduleNotice('leitura', 60_000);
  assertFalse(n2.tone === 'sacred');
});

// ════════════════════════════════════════════════════════════════════════════
// SPECS — Constants
// ════════════════════════════════════════════════════════════════════════════

it('W81_D constants are exported', () => {
  assertEqual(W81_D_VERSION, '1.0.0');
  assertEqual(W81_D_CYCLE, 81);
  assertEqual(W81_D_SHIPPED_COMPONENTS, 6);
  assertEqual(W81_D_SHIPPED_TRADITIONS, 7);
});

it('minimum 60 assertions target — verify spec length', () => {
  assertTrue(SPEC_REGISTRY.length >= 60, `registered ${SPEC_REGISTRY.length} specs, need ≥60`);
});

// ════════════════════════════════════════════════════════════════════════════
// RUNNER
// ════════════════════════════════════════════════════════════════════════════

async function runSpecs(): Promise<void> {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const entry of SPEC_REGISTRY) {
    try {
      await entry.run();
      passed++;
      console.log(`  ✓ ${entry.name}`);
    } catch (err) {
      failed++;
      const msg = err instanceof Error ? err.message : String(err);
      failures.push(`${entry.name}: ${msg}`);
      console.log(`  ✗ ${entry.name}`);
      console.log(`    ${msg}`);
    }
  }

  console.log('');
  console.log(`  RESULT: ${passed} PASS · ${failed} FAIL · ${SPEC_REGISTRY.length} total`);

  if (failed > 0) {
    console.log('');
    console.log('  Failures:');
    for (const f of failures) console.log(`    · ${f}`);
    process.exit(1);
  }
}

// Direct exec — node --experimental-strip-types livestream-watch-ui.spec.ts
runSpecs().catch((err: unknown) => {
  console.error('Fatal runner error:', err);
  process.exit(2);
});
