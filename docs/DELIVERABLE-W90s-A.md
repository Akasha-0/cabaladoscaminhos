# W90s-A — live-stream-chat-ext (DELIVERABLE)

> Cycle 90 SIBLING worker · Session `414810458808604` · Wave-spawner `414808489394474`
> Branch: `w90s/live-stream-chat-ext` · Theme: extend W89-A `live-stream-chat`

## TL;DR

**Status:** ✅ SHIPPED + PUSHED
**Branch:** `w90s/live-stream-chat-ext`
**Commit SHA:** `1e9975e98b504941001170fdf5a5ca7ec1d5b281`
**LOC:** ~2,941 across 8 new files (+5 carried-over W89-A baseline files)
**Assertions:** 56 source-inspection + 19 runtime smoke = **75 PASS / 0 FAIL**
**Focused TSC:** 0 errors for new files
**Remote:** pushed to `origin/w90s/live-stream-chat-ext`

## Theme

Extend the W89-A `live-stream-chat` engine with:
1. **Emoji reactions** (👍 ❤️ 🔥 🙏 ✨) per message — *5-emoji canonical W90s set*
2. **Viewer count** display — increment / decrement / set / peak tracking
3. **Moderation hooks** — `muteUser` (with reason + optional expiry), `hideMessage` (reversible via `undoHideMessage`), `autoRestoreExpiredHides`

The new module lives at `src/lib/w90s/live-stream-chat-ext.ts` and re-uses W89-A's branded types (`LiveStreamId`, `UserId`, `LiveStreamMessageId`) via `import type`. No value-level cross-imports — the W90s engine is intentionally independent and shares only types.

## File structure

| Path | LOC | Purpose |
|------|-----|---------|
| `src/lib/w90s/live-stream-chat-ext.ts` | 719 | Pure engine: reactions + viewer count + mute + hide |
| `src/lib/w90s/__tests__/live-stream-chat-ext.spec.ts` | 485 | Source-inspection spec (56 asserts) |
| `src/components/community/LiveStreamReactionPicker.tsx` | 234 | Renamed from `ReactionPicker` (avoided collision with comments picker); 5-emoji popover |
| `src/components/community/ViewerCount.tsx` | 89 | Live viewer badge (aria-live, pt-BR formatting) |
| `src/components/community/ModerationMenu.tsx` | 325 | Mute + hide with role="alertdialog" confirm |
| `src/components/community/LiveStreamChatExt.tsx` | 584 | Main 'use client' chat panel |
| `src/app/live-ext/[id]/page.tsx` | 116 | Server Component demo at `/live-ext/[id]` (separate from W89-A's `/live/[id]`) |
| `scripts/smoke-live-stream-chat-ext.mjs` | 389 | Runtime smoke (19 asserts via tsx) |
| **TOTAL** | **2,941** | |

The pre-existing `src/components/community/ReactionPicker.tsx` (8 emojis, used by comments) was preserved as-is — W90s-A ships `LiveStreamReactionPicker.tsx` to avoid collision.

## Engine API surface

```ts
// Reactions
addReaction(state, messageId, emoji, nowMs) → { state, reacted, reason? }
removeReaction(state, messageId, emoji, nowMs) → { state, reacted, reason? }
toggleReaction(state, messageId, emoji, nowMs) → { state, reacted, reason? }

// Viewer count
incrementViewerCount(state, delta?, nowMs?) → state
decrementViewerCount(state, delta?, nowMs?) → state
setViewerCount(state, count, nowMs?) → state
getViewerCount(state) → number
getPeakViewerCount(state) → number  // monotonic non-decreasing

// Moderation
muteUser(state, { userId, moderatorId, reason, nowMs, expiresAt? }) → { state, muted, reason? }
unmuteUser(state, userId, nowMs?) → state
isUserMuted(state, userId, nowMs) → boolean
getMuteEntry(state, userId, nowMs) → ModerationEntry | null
hideMessage(state, { messageId, moderatorId, nowMs, expiresAt? }) → { state, hidden, reason? }
undoHideMessage(state, messageId, nowMs) → { state, restored, reason? }
autoRestoreExpiredHides(state, nowMs) → state  // periodic tick

// Append helper (mutes + length checks)
appendMessage(state, { id, streamId, userId, userName, text, createdAt }) → { state, message, reason? }
getVisibleExtMessages(state, max?) → ReadonlyArray<LiveStreamMessageExt>

// Constants
W90S_REACTION_EMOJIS = ['👍', '❤️', '🔥', '🙏', '✨']
MAX_REACTIONS_PER_MESSAGE = 5
MAX_VIEWER_COUNT = 1_000_000
MAX_MUTE_DURATION_MS = 24 * 60 * 60 * 1000
MAX_HIDE_DURATION_MS = 24 * 60 * 60 * 1000
```

## Sacred-cultural compliance

Verified by both source-inspection spec (56 asserts) and runtime smoke (4 dedicated asserts):

- **Positive-only reactions**: 👍 ❤️ 🔥 🙏 ✨ (no 👎 / 😡 / 💩 / downvote)
- **Banned vocabulary absent** from engine source: `amarração`, `amarre`, `vinculação`, `vincular`, `prejudicar` (verified by runtime string-search)
- **Descriptive non-blaming language**: "Você está silenciado(a)…", "Silenciado pela moderação do espaço"
- **Br LGPD-friendly**: no PII captured; moderation reasons are user-provided moderator text, not auto-derived from behavior
- **All exports Object.freeze-ed** at module surface (verified by spec assertion)

## Lessons learned (cycle W90s-A)

### 1. Sandbox gateway 504 errors are bursty, not persistent
During this cycle, ~30% of `bash` calls returned `sandbox exec channel unhealthy: category=provider_gateway kind=gateway_504`. Recovery is automatic — retrying 2-3s later usually succeeds. **Mitigation:** when an `npm install` or `git` op fails with 504, do NOT abandon; retry. Reusable for any sandbox session hitting 504s.

### 2. Symlink node_modules from sibling worktree to skip npm install
The `npm install --no-audit --no-fund --ignore-scripts` step was blocked by 504s, but the sibling worktree at `/workspace/cabaladoscaminhos` already had a populated `node_modules/.bin/{tsc,tsx,next}`. **Fix:** `ln -s /workspace/cabaladoscaminhos/node_modules /workspace/wt-<name>/node_modules` — saves 2-3 minutes of `npm install` time AND bypasses the 504 issue entirely. Caveat: only works if the worktree was created from the same package.json (which it always is for parallel siblings).

### 3. Next 15+ cookies() returns Promise<ReadonlyRequestCookies>
Pre-15 code: `const c = cookies(); c.get('foo')`. Next 15+: `const c = await cookies(); c.get('foo')`. Source: https://nextjs.org/docs/messages/sync-dynamic-apis. The brief's "cookies()" pattern was correct for Next 14; for Next 15+ wrap in `await Promise.resolve(cookies())` (the `Promise.resolve` adds defensive compatibility across both versions). Reusable: any future Server Component in this repo that touches cookies/headers.

### 4. `\p{Emoji}` regex doesn't match all emoji
JS regex `[\p{Emoji}]` excludes `❤️` because the heart-with-variation-selector is two codepoints. **Fix:** use a broader emoji-range regex like `[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2700}-\u{27BF}]/u`, OR (cleaner) check `String.prototype.codePointAt` for non-BMP characters. Reusable: any source-inspection spec that validates "this string is an emoji."

### 5. Object.freeze + array.filter() cannot remove items when count==1 (counter-decrement trap)
When decrementing reaction counts, removing at `.map()` time (returning `null` for `count<=1`) and then typed-filtering is safer than `.map().filter()` chains. The W89-A lesson was confirmed again in W90s-A: the `.map(r => r.count <= 1 ? null : …)` + `.filter((r): r is T => r !== null)` pattern produces the right result, while `.map(r => ({count: r.count - 1})).filter(r => r.count > 0)` strips items AFTER decrementing, which strips any item whose count was already 0 (defensive but wasteful). Reusable: any reducer pattern.

### 6. ReactionPicker collision with comments picker was a near-miss
The brief said "extend W89-A's `LiveStreamChat` with reactions" — I created `ReactionPicker.tsx` which silently overwrote the pre-existing 8-emoji comment-system picker. Caught only at `git status` (showed "modified"). **Fix:** renamed to `LiveStreamReactionPicker.tsx` and aliased the import in `LiveStreamChatExt.tsx`. Reusable: any time the brief says "extend X," always `git status` before committing to catch silent overwrites.

### 7. Top-level await in .mjs fails under tsx --test
`tsx --test scripts/foo.mjs` does NOT support top-level `await import(...)` for static declarations — they have to be inside an `async () => { ... }` test callback. The transform tsx applies makes top-level await look like a `const x = await ...` which the test loader parses as sync. **Fix:** move all `await import(...)` inside `async () =>` test bodies, OR pre-import via `await import('./path.mjs')` inside the first test. Reusable: any future smoke script in .mjs form.

### 8. Pre-existing comment ReactionPicker had hardcoded allowed-emojis list — kept it
Wave 12-23's ReactionPicker used 8 specific emojis (spiritualized: ✦ 🪶 ☸ etc.). I respected that for comments and shipped a parallel 5-emoji W90s set (👍 ❤️ 🔥 🙏 ✨) for live streams. Reusable pattern: when extending an existing UI surface, **avoid changing the visual vocabulary** of unrelated surfaces.

## Verification

```bash
$ cd /workspace/wt-w90s-live-stream-chat-ext
$ timeout 90 ./node_modules/.bin/tsc --noEmit --skipLibCheck --project tsconfig.json
$ # → 0 errors for w90s/*, live-ext/*, ModerationMenu, LiveStreamReactionPicker, ViewerCount

$ timeout 90 ./node_modules/.bin/tsx --test src/lib/w90s/__tests__/live-stream-chat-ext.spec.ts
$ # → # tests 56, # pass 56, # fail 0

$ timeout 90 ./node_modules/.bin/tsx --test scripts/smoke-live-stream-chat-ext.mjs
$ # → # tests 19, # pass 19, # fail 0, "SMOKE OK"
```

Total assertions: **75 PASS / 0 FAIL**.

## Files delivered

```
src/lib/w90s/live-stream-chat-ext.ts                       (719 LOC)
src/lib/w90s/__tests__/live-stream-chat-ext.spec.ts        (485 LOC, 56 asserts)
src/components/community/LiveStreamReactionPicker.tsx      (234 LOC)
src/components/community/ViewerCount.tsx                  ( 89 LOC)
src/components/community/ModerationMenu.tsx                (325 LOC)
src/components/community/LiveStreamChatExt.tsx             (584 LOC)
src/app/live-ext/[id]/page.tsx                             (116 LOC)
scripts/smoke-live-stream-chat-ext.mjs                     (389 LOC, 19 asserts)
docs/DELIVERABLE-W90s-A.md                                 (this file)
```

Plus the W89-A baseline files re-checked out from `origin/w89/live-stream-chat@834cb58`:
```
src/lib/w89/live-stream-chat.ts                           (carried over)
src/lib/w89/__tests__/live-stream-chat.spec.ts             (carried over)
src/components/community/LiveStreamChat.tsx                (carried over)
src/components/community/ChatMessageItem.tsx               (carried over)
src/app/live/[id]/page.tsx                                (carried over)
```

These five are tracked as `git checkout <sha> -- <files>` from the W89-A branch — they're **not W90s-A work** but needed in-tree for `import type { LiveStreamId, UserId, ... }` to resolve.

## New durable lessons (cross-project)

1. **`Promise.resolve(cookies())` for Next 14/15 dual-compat** in Server Components
2. **`npm install` can be skipped when sibling worktree already has node_modules** — `ln -s` saves 2-3 min and bypasses 504s
3. **Always `git status` before committing extended work** — silent overwrites of pre-existing files are easy
4. **Source-inspection spec regex must accept template literals** for `data-testid={\`name-\${expr}\`}` patterns
5. **Obfuscate banned-vocab strings at runtime** in self-checking scripts (e.g. `'amarra' + 'ção'`) so the spec file's own grep doesn't self-flag

## BLOCKED items

None. All deliverables are inspectable on disk and pushed to remote.

## Next-step recommendations

- W91: hook the W90s-A engine to a real SSE channel (`/api/live-ext/[id]/chat`) — engine is already pure and frozen, just needs `dispatch` wrapping
- W91+: add per-user reaction dedupe (engine currently doesn't track which user reacted with what — caller layer's responsibility)
- Migrate `ReactionPicker` (comments) to share the W90s-A focus-management pattern (stable id + getElementById)