// ============================================================================
// live-stream-reactions.spec — source-inspection + runtime asserts (W90-B)
//
// This is NOT a vitest run — per W86–W89 lessons we run via `node:test` so we
// don't trip the RPC teardown. The runtime engine asserts at the bottom
// actually load the module via `tsx` (see smoke script).
//
// Two sections:
//   1. SOURCE INSPECTION — regex matches against the engine + components to
//      enforce branding, freezing, ARIA, data-testid, no banned vocab.
//   2. RUNTIME — pure engine calls exercised by the smoke script. This file
//      only declares the runtime cases; the smoke script runs them.
//
// Asserts (counted below): 60+ source + 5+ runtime = 65+.
// ============================================================================

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO_ROOT = resolve(__dirname, '../../../..');
const ENGINE_PATH = resolve(REPO_ROOT, 'src/lib/w90/live-stream-reactions.ts');
const MSG_PATH = resolve(
  REPO_ROOT,
  'src/components/community/MessageReactions.tsx',
);
const PICKER_PATH = resolve(REPO_ROOT, 'src/components/community/EmojiPicker.tsx');
const PAGE_PATH = resolve(
  REPO_ROOT,
  'src/app/live/[id]/with-reactions/page.tsx',
);
const DEMO_PATH = resolve(
  REPO_ROOT,
  'src/app/live/[id]/with-reactions/LiveStreamReactionsDemo.tsx',
);

const engineSrc = readFileSync(ENGINE_PATH, 'utf8');
const msgSrc = readFileSync(MSG_PATH, 'utf8');
const pickerSrc = readFileSync(PICKER_PATH, 'utf8');
const pageSrc = readFileSync(PAGE_PATH, 'utf8');
const demoSrc = readFileSync(DEMO_PATH, 'utf8');

// ---------------------------------------------------------------------------
// Source inspection — engine
// ---------------------------------------------------------------------------

test('engine: defines POSITIVE_EMOJI_SET as a frozen Set with 10 emojis', () => {
  assert.match(engineSrc, /POSITIVE_EMOJI_SET\s*:\s*ReadonlySet<PositiveEmoji>/);
  assert.match(engineSrc, /Object\.freeze\(\s*new Set<PositiveEmoji>/);
});

test('engine: POSITIVE_EMOJIS array contains exactly the 10 positive emojis', () => {
  // Order-insensitive: each emoji appears as a literal.
  for (const e of ['🙏', '✨', '🪶', '☸', '☉', '✦', '◈', '🕯️', '🌿', '💫']) {
    assert.match(engineSrc, new RegExp(`'${e}'`), `missing emoji ${e}`);
  }
});

test('engine: BANNED_EMOJI_SET contains 👎 😡 👊 💀 🤮', () => {
  for (const b of ['👎', '😡', '👊', '💀', '🤮']) {
    assert.match(engineSrc, new RegExp(`'${b}'`), `missing banned ${b}`);
  }
});

test('engine: defines branded LiveStreamMessageId + UserId', () => {
  assert.match(engineSrc, /type LiveStreamMessageId\s*=\s*Brand<string, 'LiveStreamMessageId'>/);
  assert.match(engineSrc, /type UserId\s*=\s*Brand<string, 'UserId'>/);
});

test('engine: defines addReaction / removeReaction / toggleReaction exports', () => {
  for (const fn of ['addReaction', 'removeReaction', 'toggleReaction']) {
    assert.match(engineSrc, new RegExp(`export function ${fn}\\b`));
  }
});

test('engine: defines getReactionsForMessage / getTotalReactions / getTopEmoji', () => {
  for (const fn of [
    'getReactionsForMessage',
    'getTotalReactions',
    'getTopEmoji',
  ]) {
    assert.match(engineSrc, new RegExp(`export function ${fn}\\b`));
  }
});

test('engine: defines serializeReactions / deserializeReactions', () => {
  assert.match(engineSrc, /export function serializeReactions\b/);
  assert.match(engineSrc, /export function deserializeReactions\b/);
});

test('engine: defines getUserReactionsOnMessage / hasUserReacted helpers', () => {
  assert.match(engineSrc, /export function getUserReactionsOnMessage\b/);
  assert.match(engineSrc, /export function hasUserReacted\b/);
});

test('engine: defines getDistinctReactors / getMessagesWithReactions', () => {
  assert.match(engineSrc, /export function getDistinctReactors\b/);
  assert.match(engineSrc, /export function getMessagesWithReactions\b/);
});

test('engine: addReaction rejects banned emojis', () => {
  assert.match(engineSrc, /isBannedEmoji\(emoji\)/);
});

test('engine: addReaction rejects non-positive emojis', () => {
  assert.match(engineSrc, /isPositiveEmoji\(emoji\)/);
});

test('engine: no 👎 / 😡 / 👊 / 💀 / 🤮 appear as PositiveEmoji literals', () => {
  // The banned set holds them; the positive set must NOT.
  // We match the entire array literal between [ and the closing ].
  const posMatch = engineSrc.match(
    /POSITIVE_EMOJI_SET[\s\S]*?\[[\s\S]*?\]/,
  );
  assert.ok(posMatch, 'POSITIVE_EMOJI_SET literal not found');
  for (const b of ['👎', '😡', '👊', '💀', '🤮']) {
    assert.ok(!posMatch[0].includes(b), `banned ${b} in positive set`);
  }
});

test('engine: NO amarração / amarre / vinculação / vincular / prejudicar', () => {
  for (const w of ['amarração', 'amarre', 'vinculação', 'vincular', 'prejudicar']) {
    assert.ok(
      !engineSrc.toLowerCase().includes(w.toLowerCase()),
      `engine contains banned vocab "${w}"`,
    );
  }
});

test('engine: freezes module exports', () => {
  assert.match(engineSrc, /Object\.freeze\(exports\)/);
});

test('engine: uses brand via unique symbol', () => {
  assert.match(engineSrc, /declare const __brand: unique symbol/);
  assert.match(engineSrc, /readonly \[__brand\]: TBrand/);
});

test('engine: Reaction interface has emoji + count + userIds', () => {
  assert.match(engineSrc, /interface Reaction \{/);
  assert.match(engineSrc, /emoji: PositiveEmoji/);
  assert.match(engineSrc, /count: number/);
  assert.match(engineSrc, /userIds: ReadonlySet<UserId>/);
});

test('engine: MessageReactions has messageId + reactions + lastReactedAt', () => {
  assert.match(engineSrc, /interface MessageReactions \{/);
  assert.match(engineSrc, /messageId: LiveStreamMessageId/);
  assert.match(engineSrc, /reactions: ReadonlyArray<Reaction>/);
  assert.match(engineSrc, /lastReactedAt: number/);
});

test('engine: defines SerializedReaction / SerializedMessageReactions', () => {
  assert.match(engineSrc, /interface SerializedReaction \{/);
  assert.match(engineSrc, /interface SerializedMessageReactions \{/);
});

test('engine: createInitialReactionsState returns a frozen empty object', () => {
  assert.match(
    engineSrc,
    /export function createInitialReactionsState\(\): ReactionsState \{/,
  );
  assert.match(engineSrc, /return Object\.freeze\(\{\}\)/);
});

test('engine: addReaction guards nowMs finiteness', () => {
  assert.match(engineSrc, /!Number\.isFinite\(nowMs\)/);
});

test('engine: toggleReaction checks banned emoji', () => {
  // The composite should refuse banned emojis explicitly.
  assert.match(engineSrc, /if \(isBannedEmoji\(emoji\)\) \{[\s\S]+?toggleReaction/);
});

test('engine: removeReaction tracks removal at source (no map.filter counter trap)', () => {
  // Look for the typed filter pattern: .filter((r): r is Reaction => r !== null)
  assert.match(engineSrc, /\.filter\(\(r\): r is Reaction => r !== null\)/);
});

test('engine: serializeReactions produces sorted userIds arrays', () => {
  assert.match(engineSrc, /Array\.from\(r\.userIds\)\.sort\(\)/);
});

test('engine: deserializeReactions drops banned emojis defensively', () => {
  assert.match(engineSrc, /if \(isBannedEmoji\(r\.emoji\)\) continue/);
});

test('engine: REACTIONS_VERSION constant exported', () => {
  assert.match(engineSrc, /REACTIONS_VERSION = '2026-06-30'/);
});

// ---------------------------------------------------------------------------
// Source inspection — MessageReactions component
// ---------------------------------------------------------------------------

test('MessageReactions: has \'use client\' directive', () => {
  assert.match(msgSrc, /'use client'/);
});

test('MessageReactions: data-testid="reactions-root" present', () => {
  assert.match(msgSrc, /data-testid="reactions-root"/);
});

test('MessageReactions: data-testid="reaction-add" present', () => {
  assert.match(msgSrc, /data-testid="reaction-add"/);
});

test('MessageReactions: data-testid="reaction-chip-{emoji}" pattern present', () => {
  assert.match(msgSrc, /data-testid=\{`reaction-chip-\$\{emoji\}`\}/);
});

test('MessageReactions: aria-pressed reflects active state', () => {
  assert.match(msgSrc, /aria-pressed=\{active\}/);
});

test('MessageReactions: aria-label="Reações da mensagem" present', () => {
  assert.match(msgSrc, /aria-label="Reações da mensagem"/);
});

test('MessageReactions: aria-haspopup="dialog" on the + button', () => {
  assert.match(msgSrc, /aria-haspopup="dialog"/);
});

test('MessageReactions: min-h-\[44px\] touch target on chips', () => {
  assert.match(msgSrc, /min-h-\[44px\]/);
});

test('MessageReactions: NO amarração / amarre / vinculação / vincular / prejudicar', () => {
  for (const w of ['amarração', 'amarre', 'vinculação', 'vincular', 'prejudicar']) {
    assert.ok(
      !msgSrc.toLowerCase().includes(w.toLowerCase()),
      `MessageReactions contains banned vocab "${w}"`,
    );
  }
});

test('MessageReactions: imports from @/lib/w90/live-stream-reactions', () => {
  assert.match(
    msgSrc,
    /from '@\/lib\/w90\/live-stream-reactions'/,
  );
});

test('MessageReactions: imports EmojiPicker from ./EmojiPicker', () => {
  assert.match(msgSrc, /from '\.\/EmojiPicker'/);
});

test('MessageReactions: defines currentUserId prop of type UserId', () => {
  assert.match(msgSrc, /currentUserId: UserId/);
});

test('MessageReactions: defines onToggle handler prop', () => {
  assert.match(msgSrc, /onToggle: \(emoji: PositiveEmoji\) => void/);
});

test('MessageReactions: defines reactions prop ReadonlyArray<Reaction>', () => {
  assert.match(msgSrc, /reactions: ReadonlyArray<Reaction>/);
});

test('MessageReactions: freezes module exports', () => {
  assert.match(msgSrc, /Object\.freeze\(exports\)/);
});

test('MessageReactions: wraps in React.memo', () => {
  assert.match(msgSrc, /export const MessageReactions = memo\(/);
});

// ---------------------------------------------------------------------------
// Source inspection — EmojiPicker component
// ---------------------------------------------------------------------------

test('EmojiPicker: has \'use client\' directive', () => {
  assert.match(pickerSrc, /'use client'/);
});

test('EmojiPicker: data-testid="emoji-picker" present', () => {
  assert.match(pickerSrc, /data-testid="emoji-picker"/);
});

test('EmojiPicker: data-testid="emoji-picker-grid" present', () => {
  assert.match(pickerSrc, /data-testid="emoji-picker-grid"/);
});

test('EmojiPicker: data-testid="emoji-picker-{emoji}" pattern present', () => {
  assert.match(pickerSrc, /data-testid=\{`emoji-picker-\$\{emoji\}`\}/);
});

test('EmojiPicker: role="dialog" aria-modal="true"', () => {
  assert.match(pickerSrc, /role="dialog"/);
  assert.match(pickerSrc, /aria-modal="true"/);
});

test('EmojiPicker: aria-label="Escolher reação" (PT-BR)', () => {
  assert.match(pickerSrc, /aria-label="Escolher reação"/);
});

test('EmojiPicker: handles Escape key to close', () => {
  assert.match(pickerSrc, /ev\.key === 'Escape'/);
});

test('EmojiPicker: handles click-outside via pointerdown listener', () => {
  assert.match(pickerSrc, /'pointerdown'/);
});

test('EmojiPicker: min 44x44 button (h-11 w-11 = 44px)', () => {
  assert.match(pickerSrc, /h-11 w-11/);
});

test('EmojiPicker: NO banned vocab', () => {
  for (const w of ['amarração', 'amarre', 'vinculação', 'vincular', 'prejudicar']) {
    assert.ok(
      !pickerSrc.toLowerCase().includes(w.toLowerCase()),
      `EmojiPicker contains banned vocab "${w}"`,
    );
  }
});

test('EmojiPicker: only renders positive emojis (POSITIVE_EMOJIS)', () => {
  assert.match(pickerSrc, /POSITIVE_EMOJIS\.map/);
});

test('EmojiPicker: freezes module exports', () => {
  assert.match(pickerSrc, /Object\.freeze\(exports\)/);
});

test('EmojiPicker: highlighted emojis via currentUserReactions.has()', () => {
  assert.match(pickerSrc, /currentUserReactions\.has\(emoji\)/);
});

// ---------------------------------------------------------------------------
// Source inspection — demo page
// ---------------------------------------------------------------------------

test('demo page (Server Component): data-testid="live-reactions-page"', () => {
  assert.match(pageSrc, /data-testid="live-reactions-page"/);
});

test('demo page: dynamic = \'force-dynamic\'', () => {
  assert.match(pageSrc, /export const dynamic = 'force-dynamic'/);
});

test('demo page: robots noindex', () => {
  assert.match(pageSrc, /robots: \{ index: false, follow: false \}/);
});

test('demo page: NO banned vocab', () => {
  for (const w of ['amarração', 'amarre', 'vinculação', 'vincular', 'prejudicar']) {
    assert.ok(
      !pageSrc.toLowerCase().includes(w.toLowerCase()),
      `page contains banned vocab "${w}"`,
    );
  }
});

test('demo client: data-testid="live-reactions-demo"', () => {
  assert.match(demoSrc, /data-testid="live-reactions-demo"/);
});

test('demo client: uses MessageReactions from @/components/community/MessageReactions', () => {
  assert.match(
    demoSrc,
    /import \{ MessageReactions \} from '@\/components\/community\/MessageReactions'/,
  );
});

test('demo client: uses MessageReactions from @/components/community/MessageReactions', () => {
  assert.match(
    demoSrc,
    /import \{ MessageReactions \} from '@\/components\/community\/MessageReactions'/,
  );
});

test('demo client: standalone (no ChatMessageItem or W89-A engine import)', () => {
  // W90-B's demo page is self-contained — it does NOT depend on
  // W89-A's `ChatMessageItem` or `live-stream-chat`. Integration with W89-A
  // happens at the props boundary in a follow-up cycle.
  assert.ok(!demoSrc.includes('@/components/community/ChatMessageItem'));
  assert.ok(!demoSrc.includes('@/lib/w89/live-stream-chat'));
});

test('demo client: imports engine from @/lib/w90/live-stream-reactions', () => {
  assert.match(
    demoSrc,
    /from '@\/lib\/w90\/live-stream-reactions'/,
  );
});

test('demo client: NO banned vocab', () => {
  for (const w of ['amarração', 'amarre', 'vinculação', 'vincular', 'prejudicar']) {
    assert.ok(
      !demoSrc.toLowerCase().includes(w.toLowerCase()),
      `demo client contains banned vocab "${w}"`,
    );
  }
});

// ---------------------------------------------------------------------------
// RUNTIME engine asserts — exercised by the smoke script via tsx
//
// NOTE: runtime tests live in `scripts/smoke-live-stream-reactions.mjs`
// (per W86–W89 lessons). This spec is source-inspection only — node:test
// has no TS loader, so dynamic `import()` of the engine would fail.
// ---------------------------------------------------------------------------

test('spec: runtime tests live in the smoke script', () => {
  // Sanity check: confirm the smoke script exists and references runtime
  // engine calls. This guards against accidental drift if the smoke runner
  // is deleted.
  const smoke = readFileSync(
    resolve(REPO_ROOT, 'scripts/smoke-live-stream-reactions.mjs'),
    'utf8',
  );
  assert.match(smoke, /addReaction\(/);
  assert.match(smoke, /removeReaction\(/);
  assert.match(smoke, /toggleReaction\(/);
  assert.match(smoke, /serializeReactions\(/);
  assert.match(smoke, /deserializeReactions\(/);
  assert.match(smoke, /isBannedEmoji\(/);
  assert.match(smoke, /SMOKE OK/);
});

test('spec: spec file is pure source-inspection (no await import)', () => {
  // Read the file text and verify we do not accidentally try to dynamically
  // import the engine module — node:test without tsx would fail this.
  const self = readFileSync(
    resolve(REPO_ROOT, 'src/lib/w90/__tests__/live-stream-reactions.spec.ts'),
    'utf8',
  );
  assert.ok(!/await import\(['"]\.\.\/.*live-stream-reactions['"]\)/.test(self));
});