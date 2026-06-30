# W90s-D — Comments Mention Autocomplete — Deliverable

**Session:** 414810875400448
**Branch:** `w90s/comments-mention-autocomplete`
**Wave:** 90 (cycle 90 SIBLING — wave-spawner 414808489394474)
**Worker:** W90s-D
**Theme:** `@mention` autocomplete inside the comment composer

---

## TL;DR

A pure, side-effect-free engine + React component pair that powers a
@mention autocomplete popover in the comment composer. The engine detects
the active `@trigger` in textarea text, ranks user suggestions using a
5-tier scoring algorithm (exact / prefix / substring / initials /
bigram-fuzzy), and replaces the partial handle with the full @username
when the user picks a suggestion. Sacred-cultural compliance: positive-only
vocabulary, 7 tradição symbols preserved verbatim (✦ 🪶 ☩ ◈ ☸ ☉ ☬), no
banned terms (amarração, amarre, vinculação, vincular, prejudicar).

- **Files:** 7 (~2,200 LOC total)
- **Smoke:** 25 / 25 PASS
- **Source-inspection spec:** 77 / 77 PASS
- **Focused TSC:** 0 errors

---

## File map

| Path | LOC | Purpose |
| --- | ---: | --- |
| `src/lib/w90s/comments-mention-autocomplete.ts` | 612 | Pure engine: trigger detection + search + insertion + state machine |
| `src/lib/w90s/__tests__/comments-mention-autocomplete.spec.ts` | 521 | Source-inspection spec (77 asserts across engine + components + page) |
| `src/components/community/MentionAutocomplete.tsx` | 292 | ARIA combobox popover with keyboard nav |
| `src/components/community/CommentComposerWithMentions.tsx` | 424 | Comment composer wrapping textarea + mention autocomplete |
| `src/app/posts/[id]/comment-with-mentions/page.tsx` | 255 | Server Component demo page |
| `scripts/smoke-comments-mention-autocomplete.mjs` | 386 | Runtime smoke (25 asserts, tsx-driven) |
| `docs/DELIVERABLE-W90s-D.md` | (this file) | Deliverable documentation |
| **Total** | **~2,490** | |

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                  CommentComposerWithMentions                       │
│  (useReducer; useEffect; tracks textarea text + selection)         │
│                                                                    │
│   ┌──────────────────────────────────────────────────────────┐     │
│   │ <textarea>  → onChange/onSelect/onKeyUp/onClick          │     │
│   │     ↓                                                     │     │
│   │ mentionEngine.computeAutocompleteState(text, cursor,     │     │
│   │                                       users, nowMs)      │     │
│   └──────────────────────────────────────────────────────────┘     │
│                                                                    │
│   ┌──────────────────────────────────────────────────────────┐     │
│   │ <MentionAutocomplete                                    │     │
│   │   state={acState}                                        │     │
│   │   onPick={user => insertMention(...)}                    │     │
│   │   onClose={() => reset}                                  │     │
│   │ />                                                       │     │
│   └──────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────┘

Pure engine API (lib/w90s/comments-mention-autocomplete.ts):
  - findActiveTrigger(text, cursorPos)   → MentionTrigger | null
  - searchUsers(users, query, { limit }) → ReadonlyArray<MentionSuggestion>
  - insertMention(text, trigger, user)   → { nextText, nextCursorPos }
  - validateMention(token, knownHandles?) → { valid, handle?, reason? }
  - parseMentions(text)                  → ReadonlyArray<MentionHandle>
  - computeAutocompleteState(prev, text, cursor, users, opts?)
                                          → MentionAutocompleteState
  - moveActive(state, delta)             → MentionAutocompleteState
  - setActive(state, index)              → MentionAutocompleteState
  - createInitialState(opts?)            → MentionAutocompleteState
  - createMentionEngine()                → frozen MentionEngine
```

### Sacred-cultural compliance (per cabaladoscaminhos charter)

- **Positive-only signals**: no downvote / shame language in any copy
  (e.g. "Sugestões de menção" instead of "lista de bloqueio").
- **7 tradição symbols verbatim**: ✦ cigano · 🪶 umbanda · ☩ candomblé ·
  ◈ cabala · ☸ tantra · ☉ astrologia · ☬ ifá — rendered in both
  `MentionAutocomplete` chips and the legend at the bottom of the demo
  page.
- **Sacred terms preserved**: Orixá, Caboclo, Babalaô, Yalorixá, Axé,
  Sefirá — appear verbatim in user copy without sanitization.
- **Banned vocabulary ABSENT**: `amarração`, `amarre`, `vinculação`,
  `vincular`, `prejudicar` — asserted absent in source-inspection spec
  (F1 + J4) and smoke does not generate them.

### Branded types

```ts
declare const __brand: unique symbol;
export type Brand<TBase, TBrand extends string> = TBase & {
  readonly [__brand]: TBrand;
};

export type UserId              = Brand<string, 'UserId'>;
export type MentionHandle       = Brand<string, 'MentionHandle'>;
export type MentionToken        = Brand<string, 'MentionToken'>;
export type AutocompleteStateId = Brand<string, 'AutocompleteStateId'>;
```

Constructors `toUserId`, `toMentionHandle`, `toMentionToken`,
`toAutocompleteStateId` exist for ergonomic casting. TS rejects
cross-mixing at compile time.

### Search ranking

| Score constant | Value | Triggered when |
| --- | --- | --- |
| `SCORE_EXACT_PREFIX` | 0 | query equals handle exactly |
| `SCORE_PREFIX` | 10 | handle (or displayName) starts with query |
| `SCORE_SUBSTRING` | 50 | handle (or displayName) contains query |
| `SCORE_INITIALS` | 80 | initials of displayName start with query |
| `SCORE_FUZZY` | 120 | bigram overlap ≥ 30% |

Suggestions are sorted by score (asc), with handle (asc) tiebreaker.
Limit defaults to `MAX_SUGGESTIONS = 8`.

### Trigger model

`MentionTrigger.startIndex` is the position **OF** the `@` symbol itself
(inclusive). `endIndex` is the position **after** the last handle char
(exclusive). This makes `insertMention` trivial:

```ts
const before = text.slice(0, trigger.startIndex);
const after  = text.slice(trigger.endIndex);
const nextText     = before + `@${user.handle} ` + after;
const nextCursorPos = before.length + replacement.length;
```

This convention was adopted after W87-C lessons flagged the
"startIndex = position-after-@" footgun, which double-inserted `@` when
the trigger's `@` was already part of `before`.

---

## Spec & smoke results

### Source-inspection spec (`comments-mention-autocomplete.spec.ts`)

```
$ node --test --import tsx src/lib/w90s/__tests__/comments-mention-autocomplete.spec.ts
…
# tests 77
# pass 77
# fail 0
```

77 asserts across 11 sections:

- **A** Engine source structure (9)
- **B** Pure helpers — source-inspection (10)
- **C** searchUsers / insertMention / validateMention / parseMentions (10)
- **D** State machine (5)
- **E** Factory + ergonomic surface (5)
- **F** Sacred-cultural compliance + purity invariants (4)
- **G** MentionAutocomplete.tsx — ARIA combobox (11)
- **H** CommentComposerWithMentions.tsx (10)
- **I** Demo page source-inspection (6)
- **J** Cross-component invariants (5)
- **K** Self-validation (2)

### Runtime smoke (`scripts/smoke-comments-mention-autocomplete.mjs`)

```
$ node scripts/smoke-comments-mention-autocomplete.mjs
…
Result: 25/25 passed.
SMOKE OK
```

25 asserts covering:
- A. findActiveTrigger (3) — start / mid / no-@ / email-excluded
- B. searchUsers (4) — prefix / initials / empty dataset / no-match
- C. insertMention (2) — mid / start
- D. validateMention (4) — valid / short / knownHandles yes / knownHandles no
- E. parseMentions (3) — dedup / email-excluded / start-of-text
- F. computeAutocompleteState (2) — open / closed
- G. moveActive + setActive (2) — clamp
- H. scoreUser (1) — null for unrelated query
- I. factory + tradição surface (3) — engine_keys / mentionEngine_keys / tradição_keys
- J. scoreUser exact (1)

### Focused TSC

```
$ npx tsc --noEmit --skipLibCheck src/lib/w90s/comments-mention-autocomplete.ts
$ echo $?
0
```

0 errors on the engine file. The full project TSC has pre-existing errors
(Prisma client / web-push typings), all unrelated to W90s-D files.

---

## Lessons learned (5 durable, cross-project)

### 1. Trigger-model convention: `startIndex` is **inclusive** of `@`

> **Applies to:** any future autocomplete / token-replace engine.

W87-C's `format-mention.tsx` uses the convention where the token start
points **past** the trigger character. That's correct for *parsing* (you
already have a complete `@handle`), but it's a footgun for *insertion*,
where you replace `[start..end)` and re-emit a fresh `@`.

For autocomplete, `startIndex = position OF @` (inclusive) is cleaner
because:

```ts
text.slice(0, trigger.startIndex) + '@' + user.handle + ' ' + text.slice(trigger.endIndex)
```

…is obviously correct. With `startIndex = position after @`, you have
`text.slice(0, startIndex)` already includes `@`, and you accidentally
double-insert.

**Decision:** W90s-D adopts the inclusive convention and documents it
inline. Smoke test C1 + C2 assert exactly this behavior.

### 2. Word-boundary `\b` for banned-vocab scans

> **Applies to:** any source-inspection spec scanning for banned
> vocabulary.

A naive `.includes('amarra')` will false-positive on `'amarração'`
(within `amarração`). The header docstring listing banned words is
itself a source of false positives.

Three-layer defense:

1. Strip comment lines (regex `/^\s*\/\//`) before scanning.
2. Use word-boundary `\b...\b` regex with `new RegExp(...)` (not
   literal) so each banned term is matched atomically.
3. Test with a single banned word per assertion so failures don't
   cascade.

**Reusable:** any source-inspection spec that asserts banned vocabulary.

### 3. Smoke via tsx subprocess + bench file inside the worktree

> **Applies to:** any worker that needs runtime smoke without
> vitest+jsdom.

W89-A's pattern: spawn `npx tsx` as a subprocess to evaluate a tiny
test bench that imports the engine + emits JSON. Capture stdout, parse
the JSON line, assert.

W90s-D addition: write the bench **inside the worktree**
(`<worktree>/.smoke-tmp/bench.ts`), not `/tmp`, because:

- `/tmp` may not be readable from the same context that runs tsx in
  some sandboxes (memory 2026-06-28: /tmp worktrees permanently
  unreachable).
- relative imports from the bench file (`from '../src/...'`) need to
  resolve against the bench file's directory.

**Reusable:** any runtime smoke that imports `.ts` from a
sandbox-restricted environment.

### 4. ARIA combobox source-inspection — regex on testids + roles

> **Applies to:** any worker validating React component accessibility
> without jsdom.

Per WAI-ARIA 1.2 §3.11 (combobox pattern), a compliant autocomplete
popover must include:

- `role="listbox"` on the popover container
- `role="option"` on each item
- `aria-activedescendant` on the combobox input
- `aria-selected` on each option
- data-testid per item for testability

Source-inspection spec with regex matches against the source file
catches all 5 invariants without rendering. ~10x cheaper than
`@testing-library/react` + jsdom, and works in sandbox.

**Reusable:** any next.js worker validating accessibility without a
browser harness.

### 5. The `assert.match(...) || assert.match(...)` trap

> **Applies to:** any source-inspection spec author who writes
> `assert.match` like `assert.equal`.

`assert.match(...)` returns **void** (not boolean). So:

```ts
assert.match(a, /x/) || assert.match(a, /y/);   // TS error: void in ||
```

Always use `RegExp.test(...)` for boolean checks before passing to
`assert.ok`:

```ts
const dynamicSet = /.../.test(page);
const usesParams = /params/.test(page);
assert.ok(dynamicSet || usesParams, '...');
```

Caught by focused TSC at cycle W90s-D; will be reused in future
source-inspection specs.

---

## Operational notes

### Files outside the strict w90s/ namespace

The brief specified `src/lib/w90s/` for engine + spec. The
components and demo page live in `src/components/community/` and
`src/app/posts/[id]/comment-with-mentions/` respectively, which is
the natural location for the cabaladoscaminhos monorepo (other
cycle workers followed the same convention).

### Cross-references to existing code

- **`src/lib/utils/format-mention.tsx`** — the existing
  `tokenizeMentions` helper is reused by the composer to highlight
  finalized @mentions in the preview strip below the textarea. This
  keeps the engine + composer + existing render layer consistent.
- **`@/components/ui/button.tsx`** + **`@/components/ui/textarea.tsx`**
  — the shared shadcn-style primitives are reused (per W89-A lesson:
  primitives don't forward refs; composer uses stable id + setSelectionRange
  instead of focus management).
- **`lucide-react`** icons: `AtSign`, `ArrowUp`, `ArrowDown`,
  `CornerDownLeft`, `Send`, `AlertCircle`, `Loader2`, `ArrowLeft`.

### What is NOT in scope

- Network fetch of `/api/users/search` — the composer receives
  `users` as a prop. Wiring to a real endpoint is left to whoever
  integrates this into the live composer (likely W87-C retry or W91+).
- Persistence of finalized comments — the composer's `onSubmit` is a
  callback prop. The demo page logs to console only.
- Notification dispatch when a comment mentions a user — that's a
  backend concern; the engine exposes `parseMentions(text)` for the
  caller to extract handles for downstream notification.
- WCAG AAA / keyboard-only deep review — we cover the ARIA combobox
  pattern + 44px touch targets, but a full a11y audit (focus traps,
  screen-reader announcement order) is reserved for cycle 91+.

---

## Reproducibility

```bash
# 1. Worktree
cd /workspace/cabaladoscaminhos
git worktree add /workspace/wt-w90s-comments-mention-autocomplete \
  origin/main -b w90s/comments-mention-autocomplete

# 2. Install (NOT npm ci — broken in this sandbox; use npm install)
cd /workspace/wt-w90s-comments-mention-autocomplete
timeout 300 npm install --no-audit --no-fund --ignore-scripts

# 3. Focused TSC
timeout 60 npx tsc --noEmit --skipLibCheck \
  src/lib/w90s/comments-mention-autocomplete.ts
# Expected: 0 errors

# 4. Source-inspection spec
timeout 60 node --test --import tsx \
  src/lib/w90s/__tests__/comments-mention-autocomplete.spec.ts
# Expected: 77 pass / 0 fail

# 5. Runtime smoke
timeout 120 node scripts/smoke-comments-mention-autocomplete.mjs
# Expected: 25/25 passed, SMOKE OK

# 6. Cleanup
rm -rf .smoke-tmp
```

---

## Status: ✅ SHIPPED + PUSHED

All deliverables on `w90s/comments-mention-autocomplete`. See commit
SHA in the parent-session handoff message.