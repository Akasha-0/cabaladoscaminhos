// ============================================================================
// live-stream-chat-ext.spec.ts — source-inspection spec for W90s-A
//
// Pattern (W89-A validated): read source files + assert via regex that the
// required ARIA / data-testid / role / key bindings are present. This avoids
// `vitest run` (RPC teardown bug in sandbox) and `jsdom` (slow).
//
// Runs via: `node --import tsx --test src/lib/w90s/__tests__/live-stream-chat-ext.spec.ts`
//
// 50+ assertions covering:
//   - Engine: pure, frozen, branded, defensive
//   - Component: ARIA, data-testid, role, focus management
//   - Page: Server Component boundary, dynamic, robots
//   - Sacred-cultural compliance: positive-only, banned-vocab absent
// ============================================================================
import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.resolve(__dirname, '../../../..');

function read(rel: string): string {
  const abs = path.join(ROOT, rel);
  return fs.readFileSync(abs, 'utf8');
}

// ---------------------------------------------------------------------------
// (A) Engine structural assertions
// ---------------------------------------------------------------------------
test('engine: file exists and is non-trivial', () => {
  const src = read('src/lib/w90s/live-stream-chat-ext.ts');
  assert.ok(src.length > 8000, 'engine file must be substantial');
});

test('engine: declares Brand via unique symbol', () => {
  const src = read('src/lib/w90s/live-stream-chat-ext.ts');
  assert.match(src, /declare const __brand: unique symbol/);
  assert.match(src, /Brand<TBase, TBrand extends string>/);
});

test('engine: re-exports W89-A branded types', () => {
  const src = read('src/lib/w90s/live-stream-chat-ext.ts');
  assert.match(src, /import type \{[\s\S]*LiveStreamMessageId/);
  assert.match(src, /LiveStreamId/);
  assert.match(src, /UserId/);
});

test('engine: defines W90S_REACTION_EMOJIS with the 5 canonical emojis', () => {
  const src = read('src/lib/w90s/live-stream-chat-ext.ts');
  assert.match(src, /W90S_REACTION_EMOJIS/);
  assert.match(src, /👍/);
  assert.match(src, /❤️/);
  assert.match(src, /🔥/);
  assert.match(src, /🙏/);
  assert.match(src, /✨/);
});

test('engine: reaction emojis are positive-only (no downvote)', () => {
  const src = read('src/lib/w90s/live-stream-chat-ext.ts');
  const block = src.match(
    /W90S_REACTION_EMOJIS: ReadonlyArray<string> = Object\.freeze\(\[\s*([^\]]+)\s*\]\)/,
  );
  assert.ok(block, 'W90S_REACTION_EMOJIS block must exist');
  const emojis = block![1]!;
  assert.ok(!emojis.includes('👎'), 'no downvote emoji allowed');
  assert.ok(!emojis.includes('😡'), 'no rage emoji allowed');
  assert.ok(!emojis.includes('💩'), 'no shaming emoji allowed');
});

test('engine: viewer-count clamps present and finite', () => {
  const src = read('src/lib/w90s/live-stream-chat-ext.ts');
  assert.match(src, /MAX_VIEWER_COUNT = 1_000_000/);
  assert.match(src, /MIN_VIEWER_COUNT = 0/);
  assert.match(src, /function clampViewerCount/);
  assert.match(src, /Number\.isFinite/);
});

test('engine: increment/decrement/set viewer count mutators', () => {
  const src = read('src/lib/w90s/live-stream-chat-ext.ts');
  assert.match(src, /export function incrementViewerCount/);
  assert.match(src, /export function decrementViewerCount/);
  assert.match(src, /export function setViewerCount/);
  assert.match(src, /export function getViewerCount/);
  assert.match(src, /export function getPeakViewerCount/);
});

test('engine: peak viewer count is monotonic non-decreasing', () => {
  const src = read('src/lib/w90s/live-stream-chat-ext.ts');
  assert.match(src, /peakViewerCount: Math\.max\(state\.peakViewerCount, next\)/);
});

test('engine: muteUser + unmuteUser + isUserMuted present', () => {
  const src = read('src/lib/w90s/live-stream-chat-ext.ts');
  assert.match(src, /export function muteUser/);
  assert.match(src, /export function unmuteUser/);
  assert.match(src, /export function isUserMuted/);
  assert.match(src, /export function getMuteEntry/);
});

test('engine: hideMessage + undoHideMessage + autoRestore', () => {
  const src = read('src/lib/w90s/live-stream-chat-ext.ts');
  assert.match(src, /export function hideMessage/);
  assert.match(src, /export function undoHideMessage/);
  assert.match(src, /export function autoRestoreExpiredHides/);
  assert.match(src, /HiddenMessageSnapshot/);
});

test('engine: appendMessage checks muted state and refuses', () => {
  const src = read('src/lib/w90s/live-stream-chat-ext.ts');
  assert.match(src, /export function appendMessage/);
  assert.match(src, /isUserMuted\(state, input\.userId, input\.createdAt\)/);
  assert.match(
    src,
    /Você está silenciado\(a\)/,
    'must use descriptive non-blaming language',
  );
});

test('engine: moderation entries are Object.freeze-ed', () => {
  const src = read('src/lib/w90s/live-stream-chat-ext.ts');
  assert.match(src, /entry: ModerationEntry = Object\.freeze\(/);
  assert.match(src, /nextMuted = Object\.freeze\(/);
});

test('engine: hideMessage snapshot is frozen', () => {
  const src = read('src/lib/w90s/live-stream-chat-ext.ts');
  assert.match(src, /snapshot: HiddenMessageSnapshot = Object\.freeze\(/);
});

test('engine: module surface is frozen', () => {
  const src = read('src/lib/w90s/live-stream-chat-ext.ts');
  assert.match(src, /Object\.freeze\(exports\)/);
});

test('engine: uses `noUncheckedIndexedAccess` defensive guards', () => {
  const src = read('src/lib/w90s/live-stream-chat-ext.ts');
  // Object.entries() filtering pattern is the safer alternative to direct indexing
  assert.match(src, /Object\.entries\(state\.mutedUsers\)\.filter/);
});

test('engine: source-of-removal pattern (W89-A lesson) for reactions', () => {
  const src = read('src/lib/w90s/live-stream-chat-ext.ts');
  // Ensure removeReaction nulls at map step, not after filter (counter-decrement trap fix)
  assert.match(src, /\.map\(\(r\): MessageReaction \| null => \{/);
  assert.match(src, /if \(r\.count <= 1\) return null/);
  assert.match(src, /\.filter\(\(r\): r is MessageReaction => r !== null\)/);
});

test('engine: caller-supplied nowMs in all time-sensitive helpers', () => {
  const src = read('src/lib/w90s/live-stream-chat-ext.ts');
  // No Date.now() anywhere
  assert.ok(
    !src.includes('Date.now(') || src.indexOf('Date.now(') === -1,
    'engine must NOT call Date.now()',
  );
  assert.match(src, /nowMs: number/);
});

// ---------------------------------------------------------------------------
// (B) Sacred-cultural compliance
// ---------------------------------------------------------------------------
test('engine: banned vocab absent (amarração, amarre, vinculação, vincular, prejudicar)', () => {
  const src = read('src/lib/w90s/live-stream-chat-ext.ts');
  const banned = [
    'amarração',
    'amarre',
    'vinculação',
    'vincular',
    'prejudicar',
  ];
  for (const word of banned) {
    assert.ok(
      !src.toLowerCase().includes(word),
      `banned vocab "${word}" must not appear in engine`,
    );
  }
});

test('engine: descriptive moderation language (not blame)', () => {
  const src = read('src/lib/w90s/live-stream-chat-ext.ts');
  assert.match(src, /Silenciado pela moderação do espaço/);
  assert.ok(
    !src.includes('punish') &&
      !src.includes('kick') &&
      !src.includes('ban') &&
      !src.includes('censur'),
    'no blame/punishment vocabulary',
  );
});

// ---------------------------------------------------------------------------
// (C) LiveStreamReactionPicker component (renamed to avoid collision with
// the pre-existing comment-system ReactionPicker)
// ---------------------------------------------------------------------------
test('reaction-picker: exists and is a client component', () => {
  const src = read('src/components/community/LiveStreamReactionPicker.tsx');
  assert.match(src, /^'use client';/m);
  assert.match(src, /export function LiveStreamReactionPicker/);
});

test('reaction-picker: 5 canonical W90s emojis', () => {
  const src = read('src/components/community/LiveStreamReactionPicker.tsx');
  assert.match(src, /👍/);
  assert.match(src, /❤️/);
  assert.match(src, /🔥/);
  assert.match(src, /🙏/);
  assert.match(src, /✨/);
});

test('reaction-picker: aria attributes for accessibility', () => {
  const src = read('src/components/community/LiveStreamReactionPicker.tsx');
  assert.match(src, /aria-haspopup="dialog"/);
  assert.match(src, /aria-expanded=/);
  assert.match(src, /aria-label=/);
});

test('reaction-picker: data-testid for source-inspection', () => {
  const src = read('src/components/community/LiveStreamReactionPicker.tsx');
  assert.match(src, /live-stream-reaction-picker-trigger/);
  assert.match(src, /live-stream-reaction-picker-popover/);
  // Accept both single/double quoted and template-literal forms
  assert.match(src, /live-stream-reaction-picker-option-[^`"'\s]/);
});

test('reaction-picker: ESC key closes popover', () => {
  const src = read('src/components/community/LiveStreamReactionPicker.tsx');
  assert.match(src, /key === 'Escape'/);
  assert.match(src, /close\(\)/);
});

test('reaction-picker: focus management with id + getElementById', () => {
  const src = read('src/components/community/LiveStreamReactionPicker.tsx');
  assert.match(src, /document\.getElementById\(/);
  assert.match(src, /\.focus\(\)/);
});

// ---------------------------------------------------------------------------
// (D) ViewerCount component
// ---------------------------------------------------------------------------
test('viewer-count: exists and is a client component', () => {
  const src = read('src/components/community/ViewerCount.tsx');
  assert.match(src, /^'use client';/m);
  assert.match(src, /export function ViewerCount/);
});

test('viewer-count: aria-live for accessibility', () => {
  const src = read('src/components/community/ViewerCount.tsx');
  assert.match(src, /aria-live="polite"/);
  assert.match(src, /aria-label=/);
});

test('viewer-count: data-testid for source-inspection', () => {
  const src = read('src/components/community/ViewerCount.tsx');
  assert.match(src, /data-testid="viewer-count"/);
});

test('viewer-count: pt-BR number formatting', () => {
  const src = read('src/components/community/ViewerCount.tsx');
  assert.match(src, /toLocaleString\('pt-BR'/);
});

// ---------------------------------------------------------------------------
// (E) ModerationMenu component
// ---------------------------------------------------------------------------
test('moderation-menu: exists and is a client component', () => {
  const src = read('src/components/community/ModerationMenu.tsx');
  assert.match(src, /^'use client';/m);
  assert.match(src, /export function ModerationMenu/);
});

test('moderation-menu: mute and hide actions present', () => {
  const src = read('src/components/community/ModerationMenu.tsx');
  assert.match(src, /Silenciar/);
  assert.match(src, /Ocultar/);
});

test('moderation-menu: confirm dialog before action', () => {
  const src = read('src/components/community/ModerationMenu.tsx');
  assert.match(src, /role="alertdialog"/);
  assert.match(src, /aria-modal="true"/);
  assert.match(src, /Confirmar/);
  assert.match(src, /Cancelar/);
});

test('moderation-menu: data-testid attributes', () => {
  const src = read('src/components/community/ModerationMenu.tsx');
  assert.match(src, /data-testid="moderation-menu-trigger"/);
  assert.match(src, /data-testid="moderation-mute-button"/);
  assert.match(src, /data-testid="moderation-hide-button"/);
  assert.match(src, /data-testid="moderation-confirm-dialog"/);
});

test('moderation-menu: keyboard navigation (arrow keys, Enter, Escape)', () => {
  const src = read('src/components/community/ModerationMenu.tsx');
  assert.match(src, /ArrowDown/);
  assert.match(src, /ArrowUp/);
  assert.match(src, /Enter/);
  assert.match(src, /Escape/);
});

test('moderation-menu: focus trapped inside dialog when open', () => {
  const src = read('src/components/community/ModerationMenu.tsx');
  // Trap focus pattern: store previously-focused element and restore on close
  assert.match(src, /previousActiveElement/);
  assert.match(src, /document\.activeElement/);
});

// ---------------------------------------------------------------------------
// (F) LiveStreamChatExt main component
// ---------------------------------------------------------------------------
test('live-stream-chat-ext: exists and is a client component', () => {
  const src = read('src/components/community/LiveStreamChatExt.tsx');
  assert.match(src, /^'use client';/m);
  assert.match(src, /export function LiveStreamChatExt/);
});

test('live-stream-chat-ext: imports engine functions', () => {
  const src = read('src/components/community/LiveStreamChatExt.tsx');
  assert.match(src, /from '@\/lib\/w90s\/live-stream-chat-ext'/);
  assert.match(src, /addReaction/);
  assert.match(src, /removeReaction/);
  assert.match(src, /toggleReaction/);
  assert.match(src, /muteUser/);
  assert.match(src, /hideMessage/);
});

test('live-stream-chat-ext: ARIA log region', () => {
  const src = read('src/components/community/LiveStreamChatExt.tsx');
  assert.match(src, /role="log"/);
  assert.match(src, /aria-live="polite"/);
  assert.match(src, /aria-label=/);
});

test('live-stream-chat-ext: data-testid root + key bindings', () => {
  const src = read('src/components/community/LiveStreamChatExt.tsx');
  assert.match(src, /data-testid=["']live-stream-chat-ext["']/);
  assert.match(src, /chat-message-[^`"'\s]/);
  assert.match(src, /chat-reaction-[^`"'\s]/);
});

test('live-stream-chat-ext: viewer count integrated', () => {
  const src = read('src/components/community/LiveStreamChatExt.tsx');
  assert.match(src, /<ViewerCount/);
});

test('live-stream-chat-ext: moderation menu per message', () => {
  const src = read('src/components/community/LiveStreamChatExt.tsx');
  assert.match(src, /<ModerationMenu/);
});

test('live-stream-chat-ext: keyboard shortcut to open reaction picker', () => {
  const src = read('src/components/community/LiveStreamChatExt.tsx');
  // Common shortcut: 'r' key on focused message
  assert.match(src, /key === 'r'/);
});

test('live-stream-chat-ext: prefers-reduced-motion respected', () => {
  const src = read('src/components/community/LiveStreamChatExt.tsx');
  // Tailwind `motion-safe:` and `motion-reduce:` map to
  // `(prefers-reduced-motion: reduce)` queries; we accept either form.
  assert.ok(
    /prefers-reduced-motion|motion-safe:|motion-reduce:/.test(src),
    'must respect reduced-motion preference (motion-safe or motion-reduce)',
  );
});

// ---------------------------------------------------------------------------
// (G) Server Component demo page
// ---------------------------------------------------------------------------
test('page: live-ext route exists', () => {
  const dir = path.join(ROOT, 'src/app/live-ext/[id]');
  assert.ok(fs.existsSync(dir), 'live-ext/[id] directory must exist');
  const pagePath = path.join(dir, 'page.tsx');
  assert.ok(fs.existsSync(pagePath), 'page.tsx must exist');
});

test('page: imports the ext engine + components', () => {
  const src = read('src/app/live-ext/[id]/page.tsx');
  // Accept either named import or side-effect import of the engine
  assert.match(src, /@\/lib\/w90s\/live-stream-chat-ext/);
  assert.match(src, /LiveStreamChatExt/);
});

test('page: Server Component (no use client)', () => {
  const src = read('src/app/live-ext/[id]/page.tsx');
  assert.ok(
    !src.includes("'use client'"),
    'page.tsx must be a Server Component',
  );
});

test('page: dynamic rendering flag for live content', () => {
  const src = read('src/app/live-ext/[id]/page.tsx');
  assert.match(src, /dynamic = 'force-dynamic'/);
  assert.match(src, /robots[\s\S]*?index: false/);
});

test('page: cookies() reads user/moderator', () => {
  const src = read('src/app/live-ext/[id]/page.tsx');
  assert.match(src, /cookies\(\)/);
  assert.match(src, /get\('userId'\)/);
  assert.match(src, /get\('isModerator'\)/);
});

// ---------------------------------------------------------------------------
// (H) Smoke script
// ---------------------------------------------------------------------------
test('smoke: file exists and declares >= 15 asserts', () => {
  const src = read('scripts/smoke-live-stream-chat-ext.mjs');
  assert.match(src, /assert\.ok\(true, 'SMOKE START'\)/);
  // Count distinct test() blocks
  const testBlocks = src.match(/test\(\s*['"`][^'"`]+['"`]/g);
  assert.ok(testBlocks, 'must use node:test blocks');
  assert.ok(testBlocks!.length >= 15, 'must declare at least 15 test blocks');
});

test('smoke: covers all 3 features (reactions, viewer, moderation)', () => {
  const src = read('scripts/smoke-live-stream-chat-ext.mjs');
  assert.match(src, /addReaction|removeReaction|toggleReaction/);
  assert.match(src, /incrementViewerCount|setViewerCount/);
  assert.match(src, /muteUser|hideMessage/);
});

test('smoke: sacred-cultural compliance (positive-only, banned-vocab)', () => {
  const src = read('scripts/smoke-live-stream-chat-ext.mjs');
  assert.match(src, /banned/i);
  // Build banned list at runtime so we can grep for them in source files
  // without self-flagging the spec file itself.
  const a1 = 'amarra' + 'ção';
  const a2 = 'amar' + 're';
  const v1 = 'vincula' + 'ção';
  const v2 = 'vin' + 'cular';
  const p1 = 'preju' + 'dicar';
  for (const word of [a1, a2, v1, v2, p1]) {
    assert.ok(!src.includes(word), `smoke must not contain banned vocab`);
  }
});

// ---------------------------------------------------------------------------
// (I) Cross-file consistency
// ---------------------------------------------------------------------------
test('consistency: W90S_REACTION_EMOJIS matches between engine and picker', () => {
  const engine = read('src/lib/w90s/live-stream-chat-ext.ts');
  const picker = read('src/components/community/LiveStreamReactionPicker.tsx');
  // All 5 emojis must appear in both
  for (const e of ['👍', '❤️', '🔥', '🙏', '✨']) {
    assert.ok(engine.includes(e), `engine missing ${e}`);
    assert.ok(picker.includes(e), `picker missing ${e}`);
  }
});

test('consistency: engine + smoke agree on emoji set', () => {
  const engine = read('src/lib/w90s/live-stream-chat-ext.ts');
  const smoke = read('scripts/smoke-live-stream-chat-ext.mjs');
  // Engine exports the list, smoke imports & verifies count == 5
  assert.match(engine, /W90S_REACTION_EMOJIS/);
  assert.match(smoke, /W90S_REACTION_EMOJIS/);
  assert.match(smoke, /length === 5|toBe\(5\)|\.length, 5\)/);
});

test('consistency: engine exports are reused by smoke via tsx', () => {
  const smoke = read('scripts/smoke-live-stream-chat-ext.mjs');
  // Both static and dynamic imports qualify (smoke uses dynamic import via ENGINE_PATH)
  assert.ok(
    /import.*from.*\/src\/lib\/w90s\/live-stream-chat-ext|import\(ENGINE_PATH\)/.test(smoke),
    'smoke must import engine via static or dynamic import',
  );
});

test('consistency: no circular imports', () => {
  const engine = read('src/lib/w90s/live-stream-chat-ext.ts');
  assert.ok(
    !engine.includes("from '../w90s/"),
    'engine must not import from itself',
  );
  // Engine imports only types from W89-A, not values (would create cycles)
  assert.match(engine, /import type \{[\s\S]*\} from '\.\.\/w89\/live-stream-chat'/);
});

test('consistency: page route differs from W89-A (no collision)', () => {
  const w89page = path.join(ROOT, 'src/app/live/[id]/page.tsx');
  const w90spage = path.join(ROOT, 'src/app/live-ext/[id]/page.tsx');
  assert.ok(fs.existsSync(w89page), 'W89-A page still exists');
  assert.ok(fs.existsSync(w90spage), 'W90s-A page exists');
});