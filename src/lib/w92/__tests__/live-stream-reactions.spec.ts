// ============================================================================
// Live Stream Reactions — Spec (W92-B)
// ============================================================================
// node:test via `node --import tsx --test`.
// 30+ assertions covering:
//   - Reaction set curation (8 specific emoji, no random)
//   - Rate limit (1 / 2s / user / type)
//   - Debounce / cooldown
//   - Presence counting (unique users, time-window cull)
//   - SSE event shape (reaction, snapshot, presence)
//   - Aggregate bookkeeping
//   - Banned vocab (no "leaderboard", "rank", "tier", "achievement",
//     "score", "top reactor", "most reacted")
//   - Source-inspection for components (ARIA labels, 44px touch targets,
//     mobile-first, no canvas in FloatingReactions)
// ============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  LiveStreamReactionsEngine,
  REACTION_TYPES,
  REACTION_MEANINGS_PT,
  REACTION_MEANINGS_EN,
  DEFAULT_RATE_LIMIT_MS,
  DEFAULT_PRESENCE_WINDOW_MS,
  MAX_FLOATING_BUBBLES,
  SSE_EVENT_NAME,
  SSE_PRESENCE_EVENT_NAME,
  REACTION_HISTORY_MAX,
  REACTION_HISTORY_TTL_MS,
  asUserId,
  asStreamId,
  asReactionId,
  isReactionType,
  ReactionValidationError,
  ReactionRateLimitError,
  getEngine,
  _resetEngineSingleton,
  type ReactionType,
  type ReactionEvent,
  type PresenceEvent,
} from '@/lib/w92/live-stream-reactions';
import type { SSEController } from '@/lib/sse';

// ============================================================================
// SECTION 1 — Curated reaction set (sacred-cultural compliance)
// ============================================================================

test('REACTION_TYPES has exactly 8 reactions', () => {
  assert.equal(REACTION_TYPES.length, 8);
});

test('REACTION_TYPES contains the exact curated set (order matters for UI)', () => {
  const expected: ReactionType[] = ['💜', '🙏', '✨', '🌱', '🔥', '💧', '🕊', '🌟'];
  for (let i = 0; i < expected.length; i++) {
    assert.equal(REACTION_TYPES[i], expected[i], `index ${i} mismatch`);
  }
});

test('isReactionType accepts curated emoji and rejects random ones', () => {
  assert.ok(isReactionType('💜'));
  assert.ok(isReactionType('🙏'));
  assert.ok(isReactionType('🌟'));
  // NOT in the set
  assert.equal(isReactionType('😀'), false);
  assert.equal(isReactionType('❤️'), false); // heart vs purple-heart
  assert.equal(isReactionType('💯'), false);
  assert.equal(isReactionType('👍'), false);
});

test('isReactionType rejects non-strings and empty', () => {
  assert.equal(isReactionType(''), false);
  assert.equal(isReactionType(null), false);
  assert.equal(isReactionType(undefined), false);
  assert.equal(isReactionType(42), false);
  assert.equal(isReactionType({}), false);
  assert.equal(isReactionType([]), false);
});

test('PT-BR and EN meanings cover all 8 reactions', () => {
  for (const t of REACTION_TYPES) {
    assert.ok(typeof REACTION_MEANINGS_PT[t] === 'string' && REACTION_MEANINGS_PT[t].length > 0, `PT missing for ${t}`);
    assert.ok(typeof REACTION_MEANINGS_EN[t] === 'string' && REACTION_MEANINGS_EN[t].length > 0, `EN missing for ${t}`);
  }
});

// ============================================================================
// SECTION 2 — Engine: sendReaction + rate limiting
// ============================================================================

test('engine: sendReaction returns a ReactionEvent with aggregates', () => {
  const engine = new LiveStreamReactionsEngine();
  try {
    const streamId = asStreamId('stream-test-1');
    const userId = asUserId('user-A');
    const event = engine.sendReaction({ userId, streamId, type: '💜' });
    assert.equal(event.streamId, streamId);
    assert.equal(event.type, '💜');
    assert.equal(event.aggregates['💜'], 1);
    assert.equal(event.total, 1);
    assert.ok(event.timestamp > 0);
    assert.ok(typeof event.reactionId === 'string');
  } finally {
    engine.resetAll();
  }
});

test('engine: rate limit throws ReactionRateLimitError within 2s window', () => {
  const engine = new LiveStreamReactionsEngine();
  try {
    const streamId = asStreamId('stream-test-2');
    const userId = asUserId('user-B');
    const ctx = { userId, streamId, type: '🙏' as ReactionType, now: 1000 };
    engine.sendReaction(ctx);
    // Immediate retry should fail
    assert.throws(
      () => engine.sendReaction({ ...ctx, now: 1500 }),
      (err: unknown) => {
        assert.ok(err instanceof ReactionRateLimitError);
        assert.equal((err as ReactionRateLimitError).retryAfterMs, DEFAULT_RATE_LIMIT_MS - 500);
        return true;
      }
    );
  } finally {
    engine.resetAll();
  }
});

test('engine: rate limit allows retry AFTER 2s window', () => {
  const engine = new LiveStreamReactionsEngine();
  try {
    const streamId = asStreamId('stream-test-3');
    const userId = asUserId('user-C');
    engine.sendReaction({ userId, streamId, type: '✨', now: 1000 });
    // After 2000ms, allowed
    const e2 = engine.sendReaction({ userId, streamId, type: '✨', now: 3001 });
    assert.equal(e2.aggregates['✨'], 2);
  } finally {
    engine.resetAll();
  }
});

test('engine: rate limit is PER (user, type) — different types don\'t collide', () => {
  const engine = new LiveStreamReactionsEngine();
  try {
    const streamId = asStreamId('stream-test-4');
    const userId = asUserId('user-D');
    engine.sendReaction({ userId, streamId, type: '🌱', now: 1000 });
    // Same user, different type, same instant — should be allowed
    const e2 = engine.sendReaction({ userId, streamId, type: '🔥', now: 1000 });
    assert.equal(e2.aggregates['🌱'], 1);
    assert.equal(e2.aggregates['🔥'], 1);
  } finally {
    engine.resetAll();
  }
});

test('engine: rate limit is PER user — different users don\'t collide', () => {
  const engine = new LiveStreamReactionsEngine();
  try {
    const streamId = asStreamId('stream-test-5');
    const u1 = asUserId('user-E1');
    const u2 = asUserId('user-E2');
    engine.sendReaction({ userId: u1, streamId, type: '💧', now: 1000 });
    // Different user, same type, same instant — should be allowed
    const e2 = engine.sendReaction({ userId: u2, streamId, type: '💧', now: 1000 });
    assert.equal(e2.aggregates['💧'], 2);
  } finally {
    engine.resetAll();
  }
});

test('engine: invalid type throws ReactionValidationError', () => {
  const engine = new LiveStreamReactionsEngine();
  try {
    assert.throws(
      () =>
        engine.sendReaction({
          userId: asUserId('u'),
          streamId: asStreamId('s'),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: '😀' as any,
        }),
      (err: unknown) => err instanceof ReactionValidationError
    );
  } finally {
    engine.resetAll();
  }
});

test('engine: empty userId/streamId throws ReactionValidationError', () => {
  const engine = new LiveStreamReactionsEngine();
  try {
    assert.throws(
      () =>
        engine.sendReaction({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          userId: '' as any,
          streamId: asStreamId('s'),
          type: '💜',
        }),
      (err: unknown) => err instanceof ReactionValidationError
    );
    assert.throws(
      () =>
        engine.sendReaction({
          userId: asUserId('u'),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          streamId: '' as any,
          type: '💜',
        }),
      (err: unknown) => err instanceof ReactionValidationError
    );
  } finally {
    engine.resetAll();
  }
});

// ============================================================================
// SECTION 3 — Engine: aggregates + history
// ============================================================================

test('engine: aggregates sum correctly across multiple reactions', () => {
  const engine = new LiveStreamReactionsEngine();
  try {
    const streamId = asStreamId('stream-agg-1');
    engine.sendReaction({ userId: asUserId('u1'), streamId, type: '💜', now: 1000 });
    engine.sendReaction({ userId: asUserId('u2'), streamId, type: '💜', now: 3000 });
    engine.sendReaction({ userId: asUserId('u3'), streamId, type: '🙏', now: 5000 });
    const aggs = engine.getAggregates(streamId);
    assert.equal(aggs['💜'], 2);
    assert.equal(aggs['🙏'], 1);
    assert.equal(aggs['✨'], 0);
    assert.equal(engine.getTotal(streamId), 3);
  } finally {
    engine.resetAll();
  }
});

test('engine: history is bounded to REACTION_HISTORY_MAX', () => {
  // All reactions must fit within REACTION_HISTORY_TTL_MS (30s) so TTL
  // cull doesn't interfere with this test.
  const engine = new LiveStreamReactionsEngine();
  try {
    const streamId = asStreamId('stream-hist-1');
    const stride = Math.floor(REACTION_HISTORY_TTL_MS / (REACTION_HISTORY_MAX + 20));
    for (let i = 0; i < REACTION_HISTORY_MAX + 20; i++) {
      const userId = asUserId(`u-${i}`);
      engine.sendReaction({
        userId,
        streamId,
        type: '💜',
        now: 1000 + i * stride, // spread within TTL window
      });
    }
    const hist = engine.getRecentHistory(streamId, 1000);
    assert.ok(hist.length <= REACTION_HISTORY_MAX, `history over cap: ${hist.length}`);
    assert.ok(hist.length >= REACTION_HISTORY_MAX - 5);
  } finally {
    engine.resetAll();
  }
});

test('engine: history culls entries older than REACTION_HISTORY_TTL_MS', () => {
  const engine = new LiveStreamReactionsEngine();
  try {
    const streamId = asStreamId('stream-hist-2');
    engine.sendReaction({ userId: asUserId('u-old'), streamId, type: '🙏', now: 1000 });
    engine.sendReaction({ userId: asUserId('u-new'), streamId, type: '🙏', now: 1000 + REACTION_HISTORY_TTL_MS + 10_000 });
    const hist = engine.getRecentHistory(streamId, 100);
    // Only the newer one should survive
    assert.equal(hist.length, 1);
    assert.equal(hist[0]!.type, '🙏');
  } finally {
    engine.resetAll();
  }
});

// ============================================================================
// SECTION 4 — Engine: presence
// ============================================================================

test('engine: getActivePresence returns 0 for unknown stream', () => {
  const engine = new LiveStreamReactionsEngine();
  try {
    assert.equal(engine.getActivePresence(asStreamId('never-touched')), 0);
  } finally {
    engine.resetAll();
  }
});

test('engine: touchPresence is idempotent for same user', () => {
  let fakeNow = 1000;
  const engine = new LiveStreamReactionsEngine({ now: () => fakeNow });
  try {
    const streamId = asStreamId('stream-pres-1');
    const userId = asUserId('user-X');
    engine.touchPresence(streamId, userId);
    fakeNow = 2000;
    engine.touchPresence(streamId, userId);
    fakeNow = 3000;
    engine.touchPresence(streamId, userId);
    assert.equal(engine.getActivePresence(streamId), 1);
  } finally {
    engine.resetAll();
  }
});

test('engine: touchPresence counts unique users', () => {
  let fakeNow = 1000;
  const engine = new LiveStreamReactionsEngine({ now: () => fakeNow });
  try {
    const streamId = asStreamId('stream-pres-2');
    engine.touchPresence(streamId, asUserId('u1'));
    engine.touchPresence(streamId, asUserId('u2'));
    engine.touchPresence(streamId, asUserId('u3'));
    fakeNow = 2000;
    engine.touchPresence(streamId, asUserId('u1')); // duplicate
    assert.equal(engine.getActivePresence(streamId), 3);
  } finally {
    engine.resetAll();
  }
});

test('engine: presence culls users outside the window', () => {
  let fakeNow = 50_000;
  const engine = new LiveStreamReactionsEngine({
    now: () => fakeNow,
    presenceWindowMs: 10_000,
  });
  try {
    const streamId = asStreamId('stream-pres-3');
    engine.touchPresence(streamId, asUserId('u-stale'));
    fakeNow = 1000; // go backwards in time
    engine.touchPresence(streamId, asUserId('u-fresh'));
    fakeNow = 60_000; // now forward past stale
    assert.equal(engine.getActivePresence(streamId), 1);
  } finally {
    engine.resetAll();
  }
});

test('engine: leavePresence removes user immediately', () => {
  let fakeNow = 1000;
  const engine = new LiveStreamReactionsEngine({ now: () => fakeNow });
  try {
    const streamId = asStreamId('stream-pres-4');
    engine.touchPresence(streamId, asUserId('u1'));
    engine.touchPresence(streamId, asUserId('u2'));
    assert.equal(engine.getActivePresence(streamId), 2);
    engine.leavePresence(streamId, asUserId('u1'));
    assert.equal(engine.getActivePresence(streamId), 1);
  } finally {
    engine.resetAll();
  }
});

// ============================================================================
// SECTION 5 — Engine: SSE subscription
// ============================================================================

function makeFakeController(): SSEController & { sent: unknown[] } {
  const sent: unknown[] = [];
  return {
    sent,
    send: (data: unknown) => {
      sent.push(data);
    },
    close: () => {
      // no-op
    },
  };
}

test('engine: subscribeReactions sends initial snapshot', () => {
  const engine = new LiveStreamReactionsEngine();
  try {
    const streamId = asStreamId('stream-sse-1');
    engine.sendReaction({ userId: asUserId('u1'), streamId, type: '💜', now: 1000 });
    engine.sendReaction({ userId: asUserId('u2'), streamId, type: '🙏', now: 3000 });
    const ctrl = makeFakeController();
    engine.subscribeReactions(streamId, ctrl);
    assert.ok(ctrl.sent.length >= 1);
    const first = ctrl.sent[0] as { kind: string; events?: ReactionEvent[]; aggregates?: Record<ReactionType, number> };
    assert.equal(first.kind, 'snapshot');
    assert.ok(first.events && first.events.length === 2);
    assert.ok(first.aggregates && first.aggregates['💜'] === 1);
    engine.unsubscribeReactions(streamId, ctrl);
  } finally {
    engine.resetAll();
  }
});

test('engine: reaction broadcast goes to all subscribers', () => {
  const engine = new LiveStreamReactionsEngine();
  try {
    const streamId = asStreamId('stream-sse-2');
    const ctrl1 = makeFakeController();
    const ctrl2 = makeFakeController();
    engine.subscribeReactions(streamId, ctrl1);
    engine.subscribeReactions(streamId, ctrl2);
    engine.sendReaction({ userId: asUserId('u1'), streamId, type: '🕊', now: 1000 });
    // Each subscriber should have at least: snapshot + 1 reaction event
    assert.ok(ctrl1.sent.length >= 2);
    assert.ok(ctrl2.sent.length >= 2);
    const lastC1 = ctrl1.sent[ctrl1.sent.length - 1] as { kind: string; event?: ReactionEvent };
    const lastC2 = ctrl2.sent[ctrl2.sent.length - 1] as { kind: string; event?: ReactionEvent };
    assert.equal(lastC1.kind, 'reaction');
    assert.equal(lastC2.kind, 'reaction');
    assert.equal(lastC1.event?.type, '🕊');
    assert.equal(lastC2.event?.type, '🕊');
    engine.unsubscribeReactions(streamId, ctrl1);
    engine.unsubscribeReactions(streamId, ctrl2);
  } finally {
    engine.resetAll();
  }
});

test('engine: presence subscription sends snapshot', () => {
  let fakeNow = 1000;
  const engine = new LiveStreamReactionsEngine({ now: () => fakeNow });
  try {
    const streamId = asStreamId('stream-sse-pres-1');
    engine.touchPresence(streamId, asUserId('u1'));
    engine.touchPresence(streamId, asUserId('u2'));
    const ctrl = makeFakeController();
    engine.subscribePresence(streamId, ctrl);
    const snap = ctrl.sent[0] as { kind: string; count?: number };
    assert.equal(snap.kind, 'snapshot');
    assert.equal(snap.count, 2);
    engine.unsubscribePresence(streamId, ctrl);
  } finally {
    engine.resetAll();
  }
});

// ============================================================================
// SECTION 6 — Engine: introspection + cleanup
// ============================================================================

test('engine: getActiveStreamIds returns touched streams', () => {
  const engine = new LiveStreamReactionsEngine();
  try {
    const s1 = asStreamId('s-intro-1');
    const s2 = asStreamId('s-intro-2');
    engine.sendReaction({ userId: asUserId('u'), streamId: s1, type: '💜', now: 1000 });
    engine.touchPresence(s2, asUserId('u'), 1000);
    const ids = engine.getActiveStreamIds();
    assert.ok(ids.includes(s1));
    assert.ok(ids.includes(s2));
  } finally {
    engine.resetAll();
  }
});

test('engine: resetStream clears state for one stream only', () => {
  const engine = new LiveStreamReactionsEngine();
  const s1 = asStreamId('s-reset-1');
  const s2 = asStreamId('s-reset-2');
  engine.sendReaction({ userId: asUserId('u'), streamId: s1, type: '💜', now: 1000 });
  engine.sendReaction({ userId: asUserId('u'), streamId: s2, type: '🙏', now: 1000 });
  engine.resetStream(s1);
  assert.equal(engine.getAggregates(s1)['💜'], 0);
  assert.equal(engine.getAggregates(s2)['🙏'], 1);
  engine.resetAll();
});

test('engine: getRateLimitMs + getPresenceWindowMs return configured values', () => {
  const engine = new LiveStreamReactionsEngine({
    rateLimitMs: 1500,
    presenceWindowMs: 60_000,
  });
  assert.equal(engine.getRateLimitMs(), 1500);
  assert.equal(engine.getPresenceWindowMs(), 60_000);
  engine.resetAll();
});

// ============================================================================
// SECTION 7 — Branded ID helpers
// ============================================================================

test('branded ID helpers preserve the string value', () => {
  assert.equal(asUserId('u-1') as string, 'u-1');
  assert.equal(asStreamId('s-1') as string, 's-1');
  assert.equal(asReactionId('r-1') as string, 'r-1');
});

// ============================================================================
// SECTION 8 — Singleton (process-wide)
// ============================================================================

test('getEngine returns the same instance on repeated calls', () => {
  _resetEngineSingleton();
  const a = getEngine();
  const b = getEngine();
  assert.equal(a, b);
  _resetEngineSingleton();
});

// ============================================================================
// SECTION 9 — Constants sanity
// ============================================================================

test('default rate limit is 2s (human cadence, not bot)', () => {
  assert.equal(DEFAULT_RATE_LIMIT_MS, 2_000);
});

test('default presence window is 5 minutes', () => {
  assert.equal(DEFAULT_PRESENCE_WINDOW_MS, 5 * 60 * 1_000);
});

test('SSE event names are stable strings', () => {
  assert.equal(SSE_EVENT_NAME, 'reaction');
  assert.equal(SSE_PRESENCE_EVENT_NAME, 'presence');
});

test('MAX_FLOATING_BUBBLES is a sane cap', () => {
  assert.equal(MAX_FLOATING_BUBBLES, 30);
  assert.ok(MAX_FLOATING_BUBBLES > 0);
});

// ============================================================================
// SECTION 10 — Source inspection: components
// ============================================================================

const PROJECT_ROOT = resolve(__dirname, '..', '..', '..', '..');

async function readProjectFile(relPath: string): Promise<string> {
  return readFile(resolve(PROJECT_ROOT, relPath), 'utf8');
}

/**
 * Strip JS/TS comments so banned-term scans don't false-positive on
 * explanatory comments that mention terms we deliberately avoid.
 * Strips:
 *   - Single-line: // ...
 *   - Block: /* ... *\/ (multi-line)
 *   - JSX: {/* ... *\/}
 */
function stripComments(src: string): string {
  // Remove /* ... */ block comments (incl. JSX {/ * ... * /})
  let out = src.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove // line comments
  out = out
    .split('\n')
    .map((line) => {
      const idx = line.indexOf('//');
      return idx === -1 ? line : line.slice(0, idx);
    })
    .join('\n');
  return out;
}

test('components: ReactionBar imports REACTION_TYPES and uses 8 buttons', async () => {
  const src = await readProjectFile('src/components/livestream/ReactionBar.tsx');
  // The component imports the curated set rather than hardcoding emojis.
  // That's the right pattern: single source of truth for the curation.
  assert.ok(
    /import\s*\{[^}]*REACTION_TYPES[^}]*\}\s*from/.test(src),
    'ReactionBar should import REACTION_TYPES from engine'
  );
  // And renders one button per type via .map
  assert.ok(
    /REACTION_TYPES\.map/.test(src),
    'ReactionBar should map over REACTION_TYPES'
  );
  // Emoji literals may appear in comments/header for documentation
  for (const t of REACTION_TYPES) {
    assert.ok(src.includes(t), `ReactionBar.tsx missing emoji ${t} (in comment or import)`);
  }
});

test('components: ReactionBar uses 44px min touch targets (mobile-first)', async () => {
  const src = await readProjectFile('src/components/livestream/ReactionBar.tsx');
  assert.ok(/min-h-\[44px\]/.test(src), 'ReactionBar should set min-h-[44px] for touch');
  assert.ok(/min-w-\[44px\]/.test(src), 'ReactionBar should set min-w-[44px] for touch');
});

test('components: ReactionBar buttons have aria-label', async () => {
  const src = await readProjectFile('src/components/livestream/ReactionBar.tsx');
  assert.ok(/aria-label=/.test(src), 'ReactionBar must use aria-label');
  // "Enviar reação 💜 (Compaixão)" or "Send reaction 💜 (Compassion)"
  assert.ok(/Enviar reaç|Send reaction/.test(src), 'ReactionBar aria-label should localize');
});

test('components: ReactionBar has pulse keyframe (no animation library)', async () => {
  const src = await readProjectFile('src/components/livestream/ReactionBar.tsx');
  assert.ok(/@keyframes/.test(src), 'ReactionBar should define keyframes');
  assert.ok(/animation:/.test(src), 'ReactionBar should use CSS animation');
  // No external animation library import
  assert.ok(!/from ['"]framer-motion['"]/.test(src), 'should not import framer-motion');
  assert.ok(!/from ['"]react-spring['"]/.test(src), 'should not import react-spring');
});

test('components: ReactionBar uses optimistic UI (fire-and-forget fetch)', async () => {
  const src = await readProjectFile('src/components/livestream/ReactionBar.tsx');
  assert.ok(/onReactionSent/.test(src), 'should call onReactionSent for optimistic spawn');
  assert.ok(/\/api\/streams\/.+reactions/.test(src), 'should POST to reactions endpoint');
});

test('components: FloatingReactions does NOT use <canvas>', async () => {
  const src = await readProjectFile('src/components/livestream/FloatingReactions.tsx');
  // Strip comments before checking — explanatory comments may mention canvas
  const codeOnly = stripComments(src);
  assert.ok(!/<canvas/.test(codeOnly), 'FloatingReactions code should be canvas-free');
  assert.ok(/@keyframes w92-float-up/.test(src), 'should define float-up keyframe');
  assert.ok(/translateY|translate\(/.test(src) || /var\(--w92-drift/.test(src), 'should use translate animation');
});

test('components: FloatingReactions caps concurrent bubbles', async () => {
  const src = await readProjectFile('src/components/livestream/FloatingReactions.tsx');
  assert.ok(/MAX_FLOATING_BUBBLES/.test(src), 'should reference MAX_FLOATING_BUBBLES');
  assert.ok(/30/.test(src), 'should hard-cap at 30');
});

test('components: FloatingReactions is aria-hidden (visual only)', async () => {
  const src = await readProjectFile('src/components/livestream/FloatingReactions.tsx');
  assert.ok(/aria-hidden/.test(src), 'floating bubbles should be aria-hidden');
});

test('components: PresenceDot shows count ONLY (no names, no avatars)', async () => {
  const src = await readProjectFile('src/components/livestream/PresenceDot.tsx');
  const codeOnly = stripComments(src);
  assert.ok(/Intl\.NumberFormat/.test(codeOnly), 'should format count via Intl');
  assert.ok(/pessoas presentes|people present/.test(src), 'should localize the count phrase');
  // BANNED in code (comments OK): avatar, image, name list
  assert.ok(!/<img/.test(codeOnly), 'PresenceDot must not render avatars');
  assert.ok(!/avatar/i.test(codeOnly), 'PresenceDot code must not mention avatars');
  // Use word-boundary regex so `className=` doesn't trigger
  assert.ok(
    !/\b(displayName|nickname)\b/i.test(codeOnly),
    'should not render display names'
  );
});

test('components: PresenceDot has green dot with subtle pulse halo', async () => {
  const src = await readProjectFile('src/components/livestream/PresenceDot.tsx');
  assert.ok(/bg-emerald-500/.test(src), 'should use emerald-500 for the dot');
  assert.ok(/animate-ping/.test(src), 'should animate the halo with ping');
});

test('components: PresenceDot uses SSE (EventSource) for real-time updates', async () => {
  const src = await readProjectFile('src/components/livestream/PresenceDot.tsx');
  assert.ok(/EventSource/.test(src), 'should use EventSource');
  assert.ok(/\/api\/streams\/.+presence/.test(src), 'should subscribe to /presence endpoint');
});

test('page: watch page is server-rendered (no use client)', async () => {
  const src = await readProjectFile('src/app/streams/[id]/watch/page.tsx');
  assert.ok(!/^['"]use client['"];?/m.test(src), 'page.tsx should NOT be a client component');
  assert.ok(/generateMetadata/.test(src), 'page.tsx should export generateMetadata');
  assert.ok(/export default async function/.test(src), 'page.tsx should be async server component');
});

test('page: watch page embeds ReactionBar + FloatingReactions + PresenceDot', async () => {
  const src = await readProjectFile('src/app/streams/[id]/watch/page.tsx');
  assert.ok(/<ReactionBar/.test(src), 'should embed ReactionBar');
  assert.ok(/<FloatingReactions/.test(src), 'should embed FloatingReactions');
  assert.ok(/<PresenceDot/.test(src), 'should embed PresenceDot');
});

test('page: watch page uses mobile-first layout', async () => {
  const src = await readProjectFile('src/app/streams/[id]/watch/page.tsx');
  assert.ok(/max-w-/.test(src), 'should have a max-width container');
  assert.ok(/px-/.test(src), 'should have horizontal padding');
  assert.ok(/sticky bottom-0/.test(src), 'reaction bar should be sticky bottom on mobile');
});

test('page: watch page does NOT include leaderboards or rankings', async () => {
  const src = await readProjectFile('src/app/streams/[id]/watch/page.tsx');
  const banned = [
    'leaderboard',
    'top reactor',
    'most reacted',
    'ranking',
    'top 10',
    'streak',
  ];
  // Strip comments first — banned terms may legitimately appear in
  // explanatory comments that say "no leaderboard".
  const codeOnly = stripComments(src).toLowerCase();
  const hits = banned.filter((w) => codeOnly.includes(w));
  assert.equal(hits.length, 0, `banned terms in code: ${hits.join(', ')}`);
});

// ============================================================================
// SECTION 11 — Sacred-cultural compliance: banned vocab scan (all files)
// ============================================================================

test('all w92 files: no banned gamification vocab in code (comments OK)', async () => {
  const files = [
    'src/lib/w92/live-stream-reactions.ts',
    'src/components/livestream/ReactionBar.tsx',
    'src/components/livestream/FloatingReactions.tsx',
    'src/components/livestream/PresenceDot.tsx',
    'src/app/streams/[id]/watch/page.tsx',
  ];
  const banned = [
    'leaderboard',
    'top reactor',
    'most reacted',
    'ranking',
    'streak',
    'gamification',
    'achievement',
    'tier',
    'score',
    'badge',
    'amarração',
    'amarre',
    'vinculação',
  ];
  for (const f of files) {
    const src = await readProjectFile(f);
    // Strip comments first — explanatory comments that say
    // "no leaderboard" are GOOD, not bad.
    const codeOnly = stripComments(src).toLowerCase();
    for (const term of banned) {
      assert.ok(
        !codeOnly.includes(term.toLowerCase()),
        `${f} code contains banned term "${term}"`
      );
    }
  }
});

test('all w92 files: spiritual / presence framing preserved', async () => {
  const engine = await readProjectFile('src/lib/w92/live-stream-reactions.ts');
  assert.ok(/presence/i.test(engine), 'engine should frame in terms of presence');
  assert.ok(/gift|presença|presence/i.test(engine), 'engine should mention gift/presence framing');
});

test('engine: comments explain "why 8" and "why not gamified"', async () => {
  const engine = await readProjectFile('src/lib/w92/live-stream-reactions.ts');
  assert.ok(/exactly 8|Why exactly 8/.test(engine), 'should explain the 8-reaction cap rationale');
  assert.ok(/leaderboard|top reactor|most reacted/i.test(engine), 'should explicitly call out what we do NOT do');
  assert.ok(/anonymous|privacy|names/i.test(engine), 'should explain privacy stance');
});