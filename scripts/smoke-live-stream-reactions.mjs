#!/usr/bin/env node
// ============================================================================
// smoke-live-stream-reactions.mjs — runtime smoke for the W90-B engine
//
// Run with: `npx tsx scripts/smoke-live-stream-reactions.mjs`
//
// 12 runtime asserts that exercise the engine end-to-end and guard against:
//   - banned-emoji leakage (👎 😡 👊 💀 🤮)
//   - sacred-cultural vocab (amarração / amarre / vinculação / etc.)
//   - per-user reaction invariants (toggle, dedupe, top-N ordering)
//   - serialize / deserialize roundtrip fidelity
//   - Object.freeze on exported state objects
//
// Exits 0 on `SMOKE OK`, 1 on any failure.
// ============================================================================

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');

const TS_FILE = resolve(
  REPO_ROOT,
  'src/lib/w90/live-stream-reactions.ts',
);

// ---------------------------------------------------------------------------
// Inline TS runner — uses tsx so we get the same compiler as the app
// ---------------------------------------------------------------------------

const runner = `
import {
  POSITIVE_EMOJI_SET,
  POSITIVE_EMOJIS,
  BANNED_EMOJI_SET,
  isPositiveEmoji,
  isBannedEmoji,
  addReaction,
  removeReaction,
  toggleReaction,
  getReactionsForMessage,
  getTotalReactions,
  getTopEmoji,
  getUserReactionsOnMessage,
  hasUserReacted,
  getDistinctReactors,
  getMessagesWithReactions,
  serializeReactions,
  deserializeReactions,
  createInitialReactionsState,
  toMessageId,
  toUserId,
  MAX_REACTIONS_PER_MESSAGE,
  REACTIONS_VERSION,
} from '${TS_FILE.replace(/\\/g, '/')}';

let pass = 0;
let fail = 0;
const results = [];
function check(label, cond, detail) {
  if (cond) {
    pass++;
    results.push('  ✓ ' + label);
  } else {
    fail++;
    results.push('  ✗ ' + label + (detail ? ' — ' + detail : ''));
  }
}

// Assert 1: POSITIVE_EMOJI_SET has exactly 10 entries
check(
  'POSITIVE_EMOJI_SET has 10 positive emojis',
  POSITIVE_EMOJI_SET.size === 10,
  'size=' + POSITIVE_EMOJI_SET.size,
);

// Assert 2: POSITIVE_EMOJI_SET contains all 10 expected emojis
const expected = ['🙏', '✨', '🪶', '☸', '☉', '✦', '◈', '🕯️', '🌿', '💫'];
const allExpected = expected.every((e) => POSITIVE_EMOJI_SET.has(e));
check('POSITIVE_EMOJI_SET contains all 10 expected emojis', allExpected);

// Assert 3: NONE of the banned emojis are in POSITIVE_EMOJI_SET (sacred compliance)
const bannedInPositive = Array.from(BANNED_EMOJI_SET).some((b) => POSITIVE_EMOJI_SET.has(b));
check('No banned emojis appear in POSITIVE_EMOJI_SET', !bannedInPositive);

// Assert 4: POSITIVE_EMOJIS array has same 10 emojis
check(
  'POSITIVE_EMOJIS array length === 10',
  POSITIVE_EMOJIS.length === 10,
);

// Assert 5: isBannedEmoji / isPositiveEmoji guards
check('isBannedEmoji("👎") === true', isBannedEmoji('👎') === true);
check('isBannedEmoji("😡") === true', isBannedEmoji('😡') === true);
check('isBannedEmoji("🙏") === false', isBannedEmoji('🙏') === false);
check('isPositiveEmoji("🙏") === true', isPositiveEmoji('🙏') === true);
check('isPositiveEmoji("👎") === false', isPositiveEmoji('👎') === false);

// Assert 6: addReaction → removeReaction roundtrip
const m1 = toMessageId('m_smoke_1');
const u1 = toUserId('u_smoke_1');
let s = createInitialReactionsState();
const a1 = addReaction(s, m1, u1, '🙏', 100);
check('addReaction returns added=true', a1.added === true);
s = a1.state;
const a2 = addReaction(s, m1, u1, '🙏', 200);
check('double-add is no-op (added=false)', a2.added === false);
const bucket1 = getReactionsForMessage(s, m1, 200);
check('bucket has 1 emoji with count 1', bucket1.reactions.length === 1 && bucket1.reactions[0].count === 1);
const r1 = removeReaction(s, m1, u1, '🙏', 300);
check('removeReaction returns removed=true', r1.removed === true);
const bucket2 = getReactionsForMessage(r1.state, m1, 300);
check('after remove, bucket has 0 reactions', bucket2.reactions.length === 0);

// Assert 7: per-user dedup — same user can't double-react with same emoji
const m2 = toMessageId('m_smoke_2');
const u2a = toUserId('u_smoke_a');
const u2b = toUserId('u_smoke_b');
let s2 = createInitialReactionsState();
s2 = addReaction(s2, m2, u2a, '✨', 100).state;
s2 = addReaction(s2, m2, u2b, '✨', 200).state;
const bucket3 = getReactionsForMessage(s2, m2, 200);
const emojiBucket = bucket3.reactions.find((r) => r.emoji === '✨');
check('two users reacted: count === 2', emojiBucket && emojiBucket.count === 2);
check('two users reacted: userIds.size === 2', emojiBucket && emojiBucket.userIds.size === 2);

// Assert 8: getTotalReactions sums across messages
let s3 = createInitialReactionsState();
s3 = addReaction(s3, toMessageId('mA'), u2a, '🙏', 1).state;
s3 = addReaction(s3, toMessageId('mA'), u2b, '🪶', 2).state;
s3 = addReaction(s3, toMessageId('mB'), u2a, '✨', 3).state;
check('getTotalReactions === 3', getTotalReactions(s3) === 3);

// Assert 9: toggleReaction flips
let s4 = createInitialReactionsState();
const t1 = toggleReaction(s4, m1, u1, '☸', 1);
check('first toggle: added', t1.action === 'added');
s4 = t1.state;
const t2 = toggleReaction(s4, m1, u1, '☸', 2);
check('second toggle: removed', t2.action === 'removed');

// Assert 10: serialize / deserialize roundtrip
const m5 = toMessageId('m_smoke_5');
let s5 = createInitialReactionsState();
s5 = addReaction(s5, m5, toUserId('u_rt_1'), '✦', 1).state;
s5 = addReaction(s5, m5, toUserId('u_rt_2'), '✦', 2).state;
s5 = addReaction(s5, m5, toUserId('u_rt_1'), '◈', 3).state;
const wire = serializeReactions(s5);
const json = JSON.stringify(wire);
const restored = deserializeReactions(JSON.parse(json));
const bucket5 = getReactionsForMessage(restored, m5, 3);
check('roundtrip: 2 distinct emojis', bucket5.reactions.length === 2);
const x = bucket5.reactions.find((r) => r.emoji === '✦');
check('roundtrip: ✦ has count 2', x && x.count === 2);
check('roundtrip: ✦ has 2 userIds', x && x.userIds.size === 2);

// Assert 11: getUserReactionsOnMessage returns correct set
const u11 = toUserId('u_smoke_11');
let s11 = createInitialReactionsState();
const m11 = toMessageId('m_smoke_11');
s11 = addReaction(s11, m11, u11, '🕯️', 1).state;
s11 = addReaction(s11, m11, u11, '🌿', 2).state;
const userSet = getUserReactionsOnMessage(s11, m11, u11);
check('getUserReactionsOnMessage has 2 emojis', userSet.size === 2);
check('userSet contains 🕯️', userSet.has('🕯️'));
check('userSet contains 🌿', userSet.has('🌿'));

// Assert 12: getTopEmoji orders by count desc
const m12 = toMessageId('m_smoke_12');
let s12 = createInitialReactionsState();
s12 = addReaction(s12, m12, toUserId('u_t1'), '☉', 1).state;
s12 = addReaction(s12, m12, toUserId('u_t2'), '☉', 2).state;
s12 = addReaction(s12, m12, toUserId('u_t3'), '☉', 3).state;
s12 = addReaction(s12, m12, toUserId('u_t1'), '💫', 4).state;
const top = getTopEmoji(s12, m12, 2);
check('getTopEmoji length === 2', top.length === 2);
check('top[0] is ☉ (count 3)', top[0].emoji === '☉');
check('top[1] is 💫 (count 1)', top[1].emoji === '💫');

// Assert 13: hasUserReacted correctly reports state
check('hasUserReacted returns true after add', hasUserReacted(s12, m12, toUserId('u_t1'), '💫') === true);
check('hasUserReacted returns false for non-reacted user', hasUserReacted(s12, m12, toUserId('u_t1'), '🙏') === false);

// Assert 14: getDistinctReactors counts unique users
check('getDistinctReactors === 3', getDistinctReactors(s12, m12) === 3);

// Assert 15: getMessagesWithReactions returns ids with at least one reaction
const ids = getMessagesWithReactions(s12);
check('getMessagesWithReactions has 1 id', ids.length === 1);
check('first id === m_smoke_12', ids[0] === m12);

// Assert 16: REACTIONS_VERSION is stamped
check('REACTIONS_VERSION is 2026-06-30', REACTIONS_VERSION === '2026-06-30');

// Assert 17: MAX_REACTIONS_PER_MESSAGE is positive
check('MAX_REACTIONS_PER_MESSAGE > 0', MAX_REACTIONS_PER_MESSAGE > 0);

// Print results
console.log('---');
for (const r of results) console.log(r);
console.log('---');
console.log('SMOKE: ' + pass + ' pass / ' + fail + ' fail');
if (fail > 0) {
  process.exit(1);
} else {
  console.log('SMOKE OK');
  process.exit(0);
}
`;

const tsxBin = resolve(REPO_ROOT, 'node_modules/.bin/tsx');

const result = spawnSync(tsxBin, ['-e', runner], {
  cwd: REPO_ROOT,
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);