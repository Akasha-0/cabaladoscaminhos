#!/usr/bin/env node
// ============================================================================
// Smoke test — live-stream-reactions (W92-B)
// ============================================================================
// Standalone runtime smoke. Runs the engine end-to-end with realistic
// fixtures: multiple users, multiple reactions, presence with TTL,
// rate-limit collisions, SSE fan-out.
//
// Usage:
//   node --experimental-strip-types scripts/smoke-live-stream-reactions.mjs
//
// 12+ asserts covering: reaction types, debounce, presence semantics,
// SSE event shape, aggregate correctness.
// ============================================================================

import {
  LiveStreamReactionsEngine,
  REACTION_TYPES,
  REACTION_MEANINGS_PT,
  REACTION_MEANINGS_EN,
  DEFAULT_RATE_LIMIT_MS,
  DEFAULT_PRESENCE_WINDOW_MS,
  MAX_FLOATING_BUBBLES,
  asUserId,
  asStreamId,
  ReactionValidationError,
  ReactionRateLimitError,
  isReactionType,
} from '/workspace/wt-w92/live-stream-reactions/src/lib/w92/live-stream-reactions.ts';

let __pass = 0;
let __fail = 0;
const __failures = [];

function assert(label, cond, detail = '') {
  if (cond) {
    __pass += 1;
    console.log(`  ✓ ${label}`);
  } else {
    __fail += 1;
    __failures.push({ label, detail });
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

function section(name) {
  console.log(`\n[${name}]`);
}

// ============================================================================
// SECTION 1 — Curated reaction set
// ============================================================================

section('curated reaction set');

assert('REACTION_TYPES has exactly 8 entries', REACTION_TYPES.length === 8);
assert(
  'curated set is the exact 8 specified in the brief',
  JSON.stringify(REACTION_TYPES) ===
    JSON.stringify(['💜', '🙏', '✨', '🌱', '🔥', '💧', '🕊', '🌟'])
);
assert('PT-BR meanings cover all 8', REACTION_TYPES.every((t) => REACTION_MEANINGS_PT[t].length > 0));
assert('EN meanings cover all 8', REACTION_TYPES.every((t) => REACTION_MEANINGS_EN[t].length > 0));
assert('isReactionType accepts 💜', isReactionType('💜'));
assert('isReactionType rejects 😀', !isReactionType('😀'));
assert('isReactionType rejects empty string', !isReactionType(''));
assert('isReactionType rejects null', !isReactionType(null));

// ============================================================================
// SECTION 2 — Engine: send + rate limit
// ============================================================================

section('engine: sendReaction + rate limit');

const engine = new LiveStreamReactionsEngine();
const streamId = asStreamId('smoke-stream-1');
const alice = asUserId('alice');
const bob = asUserId('bob');

const e1 = engine.sendReaction({ userId: alice, streamId, type: '💜', now: 1000 });
assert('first reaction accepted', e1.type === '💜');
assert('first reaction aggregates 💜 = 1', e1.aggregates['💜'] === 1);

let threw = null;
try {
  engine.sendReaction({ userId: alice, streamId, type: '💜', now: 1500 });
} catch (err) {
  threw = err;
}
assert(
  'second reaction within 2s is rate-limited',
  threw instanceof ReactionRateLimitError && threw.retryAfterMs === 1500
);

// Different type → not rate-limited
const e2 = engine.sendReaction({ userId: alice, streamId, type: '🙏', now: 1500 });
assert('different type bypasses rate limit', e2.type === '🙏' && e2.aggregates['🙏'] === 1);

// Different user → not rate-limited
const e3 = engine.sendReaction({ userId: bob, streamId, type: '💜', now: 1500 });
assert('different user bypasses rate limit', e3.aggregates['💜'] === 2);

// After window elapses → allowed
const e4 = engine.sendReaction({ userId: alice, streamId, type: '💜', now: 3500 });
assert('reaction after 2s window allowed', e4.aggregates['💜'] === 3);

// Invalid type → validation error
let vthrew = null;
try {
  engine.sendReaction({ userId: alice, streamId, type: '😀', now: 4000 });
} catch (err) {
  vthrew = err;
}
assert('invalid type throws ReactionValidationError', vthrew instanceof ReactionValidationError);

// ============================================================================
// SECTION 3 — Engine: aggregates + total
// ============================================================================

section('engine: aggregates + total');

const aggs = engine.getAggregates(streamId);
assert('aggregates 💜 = 3', aggs['💜'] === 3);
assert('aggregates 🙏 = 1', aggs['🙏'] === 1);
assert('aggregates ✨ = 0 (untouched)', aggs['✨'] === 0);
assert('total = 4', engine.getTotal(streamId) === 4);

// ============================================================================
// SECTION 4 — Engine: presence
// ============================================================================

section('engine: presence');

let now = 10_000;
const engineP = new LiveStreamReactionsEngine({ now: () => now });
const sP = asStreamId('smoke-pres-1');

engineP.touchPresence(sP, asUserId('u1'));
engineP.touchPresence(sP, asUserId('u2'));
engineP.touchPresence(sP, asUserId('u3'));
engineP.touchPresence(sP, asUserId('u1')); // duplicate
assert('getActivePresence counts unique users only', engineP.getActivePresence(sP) === 3);

engineP.leavePresence(sP, asUserId('u1'));
assert('leavePresence removes user', engineP.getActivePresence(sP) === 2);

now = 1_000_000; // far past window
engineP.touchPresence(sP, asUserId('u-fresh'));
assert('presence culled past window, new user shown', engineP.getActivePresence(sP) === 1);

// ============================================================================
// SECTION 5 — SSE subscription
// ============================================================================

section('engine: SSE');

const sseSent = [];
const fakeCtrl = {
  send: (data) => sseSent.push(data),
  close: () => {},
};
const streamS = asStreamId('smoke-sse-1');
const engineS = new LiveStreamReactionsEngine();

engineS.sendReaction({ userId: asUserId('u1'), streamId: streamS, type: '✨', now: 1000 });
engineS.sendReaction({ userId: asUserId('u2'), streamId: streamS, type: '✨', now: 3000 });
engineS.subscribeReactions(streamS, fakeCtrl);
assert('subscribe sends snapshot', sseSent.length >= 1);
assert(
  'snapshot kind === "snapshot"',
  sseSent.some((s) => s.kind === 'snapshot')
);

const beforeBroadcast = sseSent.length;
engineS.sendReaction({ userId: asUserId('u3'), streamId: streamS, type: '🕊', now: 5000 });
const afterBroadcast = sseSent.length;
assert('reaction broadcast appended event', afterBroadcast > beforeBroadcast);
assert(
  'broadcast event type is reaction',
  sseSent.some((s) => s.kind === 'reaction' && s.event?.type === '🕊')
);

// ============================================================================
// SECTION 6 — Constants sanity
// ============================================================================

section('constants');

assert('DEFAULT_RATE_LIMIT_MS is 2000 (human cadence)', DEFAULT_RATE_LIMIT_MS === 2000);
assert('DEFAULT_PRESENCE_WINDOW_MS is 5 minutes', DEFAULT_PRESENCE_WINDOW_MS === 5 * 60 * 1000);
assert('MAX_FLOATING_BUBBLES is 30', MAX_FLOATING_BUBBLES === 30);

// ============================================================================
// Summary
// ============================================================================

console.log(`\n${'='.repeat(60)}`);
console.log(`Smoke results: ${__pass} passed, ${__fail} failed`);
if (__fail > 0) {
  console.log('FAILURES:');
  for (const { label, detail } of __failures) {
    console.log(`  - ${label}${detail ? ` (${detail})` : ''}`);
  }
  process.exit(1);
}
console.log('All smoke asserts passed.');
process.exit(0);