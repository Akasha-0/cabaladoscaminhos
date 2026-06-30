# W76-D — Comments Threading + Mentions Engine — DELIVERABLE

**Cycle**: 76 · **Date**: 2026-06-30 · **Branch**: `w76/comments-threading-mentions`
**Author**: W76-D Coder (Mavis orchestrator session `414698242793715`)

---

## What was shipped

A **threaded-comments + @-mentions engine** for cabaladoscaminhos. Coordinates with the W73 comments-moderation engine (their domain: moderation rules) WITHOUT duplicating it — W76-D owns the THREAD structure (parent chain, depth cap, cycle detection) and MENTION parsing/notification; W73 decides what to do with the cross-tradition flag this engine produces.

### Files (5, 1875 LOC total)

| File | LOC | Purpose |
|---|---|---|
| `src/lib/w76/comments-threading-mentions.ts` | 669 | Engine |
| `src/lib/w76/comments-threading-mentions.spec.ts` | 670 | vitest spec |
| `src/lib/w76/node-stubs.d.ts` | 140 | Worktree-local vitest/Node type stubs |
| `src/lib/w76/tsconfig.json` | 13 | Worktree-isolated tsconfig |
| `scripts/smoke/w76-comments-threading-mentions.ts` | 383 | Self-running smoke harness |

### Verification gates — ALL GREEN

| Gate | Result |
|---|---|
| `tsc --noEmit -p src/lib/w76/tsconfig.json` | **0 errors** (was 48 before node-stubs added) |
| `npx vitest run src/lib/w76/comments-threading-mentions.spec.ts` | **67/67 PASS** in 1.92s |
| `npx tsx scripts/smoke/w76-comments-threading-mentions.ts` | **69/69 PASS** in <1s |
| Branch | `w76/comments-threading-mentions` |
| Pre-existing root TSC errors (in `__tests__/`) | NOT touched (worktree-isolated) |

---

## Public API surface

```ts
// User registry
registerUser(username, displayName) → User (frozen)
getUser(username) / getUserById(id) / listUsers()

// Thread structure
createComment(input) → Comment (frozen)
replyToComment(parentId, input) → Comment
editComment(id, newBody) → Comment (new ref)
softDeleteComment(id) → Comment (idempotent)
getComment(id) / listThread(rootId, options?)

// Mentions
parseMentions(body, opts?) → readonly Mention[]
extractSacredTerms(body) → readonly string[]

// Subscriptions
subscribeToThread(rootId, userId) / muteThread(rootId, userId)
getThreadSubscribers(rootId) / getThreadMuted(rootId)

// Notifications (audit only — delivery is another engine)
notifyOnMention / notifyOnReply / notifyOnThreadSubscription → NotificationEvent (frozen)
exportNotificationAudit() → readonly NotificationEvent[]

// Cross-tradition flag (perspective_only, NEVER blocks)
flagCrossTradition(commentId) → CrossTraditionFlag | null

// Constants
SACRED_TERMS (45 terms), MAX_THREAD_DEPTH = 5
W76_D_VERSION = 1.0.0, W76_D_CYCLE = 76
```

---

## Cycle detection (cycle 75 lesson applied)

Each `createComment` runs `walkAncestors(startId)` which carries a `Set<CommentId>` of every ancestor walked so far. If the cursor revisits any ancestor, throw `cycle detected in parent chain at <id>`. This catches BOTH:
- Direct self-references (parent → self)
- Long chains A → B → C → A
- Mutated maps (e.g., if a future caller rewires `PARENT_BY_ID` mid-flight)

The `Set` is seeded with `[startId]` so self-cycles are caught at the first cursor hop.

## Depth overflow handling

`MAX_THREAD_DEPTH = 5`. When `parent.depth >= 5`, the new comment inherits depth 5 (sibling at the floor) — `parentId` is preserved so the reply stays logically attached to the deeper parent. This was tested explicitly:

```
d0 (root, depth 0) → d1 (1) → d2 (2) → d3 (3) → d4 (4) → d5 (5) → overflow (5, sibling)
```

The `rootId` propagates unchanged through the overflow.

## Mention parsing (cycle 75 lesson #3 applied)

Regex: `/(^|[^\p{L}\p{N}_])(@((?:[\p{L}\p{N}_-]{1,32})))/gu`

Cycle 75 lesson #3: **ASCII `\b` matches inside accented words** like "Ogumância" → false-positive for "Ogum". Solution: Unicode-aware lookaround `(^|[^\p{L}\p{N}_])…(?=$|[^\p{L}\p{N}_])` with `u` flag. Verified by spec + smoke checks:

```
extractSacredTerms('Ogumância é palavra comum') → []
parseMentions('Ogumância @alice Ogum') → only [alice]
```

Username syntax accepts PT-BR characters and hyphens: `@dani-orixa`, `@ogã-caboclo` are valid; `@user@host` is rejected.

## Audit log immutability (cycle 75 lesson #6)

`NOTIFICATION_LOG` is a plain `Array<NotificationEvent>` internally; `exportNotificationAudit()` returns `Object.freeze(NOTIFICATION_LOG.slice())` — the `slice()` ensures the caller's reference cannot mutate the live log via push/splice. Each event itself is `Object.freeze({…})` so individual properties are immutable too. Verified by spec + smoke:
- `audit.push({})` throws (TypeError: object is not extensible)
- `Object.isFrozen(audit)` → `true`
- `Object.isFrozen(audit[0])` → `true`

## Cross-tradition flag — perspective_only, NEVER blocked

When a comment body contains 2+ sacred terms from `SACRED_TERMS`, the engine attaches a `ModerationFlag { kind: 'cross_tradition_perspective', reason, sacredTermsFound }`. The `flagCrossTradition` view returns `{ perspectiveOnly: true, traditionsPresent, flaggedAt }` — `perspectiveOnly: true` is ALWAYS set. The JSON blob is asserted to contain NEITHER "blocked", "wrong", NOR "spam" (smoke check #19).

This is the integration boundary with W73: W76-D detects and structures; W73 decides whether the perspective flag triggers any action.

---

## 5 durable lessons (cycle 76 — for the agent memory)

### L1 — iterateDescendants must TRAVERSE children of deleted nodes even when exclude-deleted
**Cycle 76 lesson, 2026-06-30.** When listing a thread with `includeDeleted=false`, my first impl used `if (deleted) continue` which skipped BOTH yield AND child traversal. The bug: a deleted comment's alive grandchildren were never reached. Correct pattern: yield-gate first, then traverse children unconditionally. The `continue` clause was conflating "don't surface" with "don't descend." Reusable: any tree-walk with optional inclusion filters — gate the yield, not the descent.

### L2 — `resolveUsers: false` must still return a Mention (with placeholder userId)
**Cycle 76 lesson, 2026-06-30.** My initial parseMentions impl used `if (resolve && !user) continue;` AND `if (!user) continue;` — the option was effectively dead code because BOTH branches skipped unresolved. When I added the placeholder `userId('unresolved:' + username)` for the false case, the option became meaningful: `true` filters by registration, `false` returns raw parses. Reusable: any parser API with a "strict mode" option — strict filters, lenient parses with placeholders.

### L3 — Top-level await in tsx requires ESM output (cycle 76 + w75 pattern reminder)
**Cycle 76 lesson, 2026-06-30.** My first smoke draft used `await check(...)` at the top level, which tsx compiled to CJS by default and rejected with "Top-level await is currently not supported with the cjs output format" across 22 errors. Fix: wrap body in `async function main()` and call `main().catch(...)` at the bottom. The w75 smoke uses a synchronous `check(label, cond)` pattern which sidesteps this entirely. Going forward: prefer the synchronous pattern for smoke harnesses; reserve async for genuinely async operations (await on network, timers). Reusable: any cycle-7X worker writing `scripts/smoke/`.

### L4 — Brand type pollution: drop unused `ThreadId` alias and use `CommentId` for the root key
**Cycle 76 lesson, 2026-06-30.** I initially declared `ThreadId` as a separate branded type for subscription/muted/notification maps. TSC rejected with TS2345 because the actual `rootId` is a `CommentId`. Cleanest fix: DELETE the unused brand — there's no semantic difference between "root of a thread" and "topmost comment." Branding should reflect semantic distinction, not redundant classification. Reusable: any engine that risks aliasing — write the minimal brand set, delete the rest.

### L5 — Vitest in a worktree-isolated tsconfig needs an extended `node-stubs.d.ts` declaring `vitest`
**Cycle 76 lesson (extends cycle 73/75).** The root tsconfig includes `vitest/globals` types but those aren't available under the worktree-isolated tsconfig (which uses `types: []`). Real vitest runner resolves `vitest` from `node_modules` at runtime, so the spec RUNS fine — but `tsc --noEmit` errors on `import { describe, it, expect } from 'vitest'`. Fix: extend `node-stubs.d.ts` with a `declare module 'vitest' { … }` block that exports the full matcher surface. Pattern reusable for any cycle-7X worker using vitest with worktree tsconfig.

---

## Sacred coverage — 45 terms, 7 traditions

`SACRED_TERMS` whitelist (45 entries, ≥30 required):

```
Orixá · Orixás · Odu · Odus · Babalorixá · Yalorixá · Caboclo · Preto-Velho
Sephirot · Sephirah · Kether · Chokhmah · Binah · Sephiroth · Malkuth · Tiferet
Chesed · Gevurah · Tarô · Cigano · Cigana · Bodhisattva · Guru · Mantra · Mantram
Ifá · Orunmila · Orunmilá · Exu · Oxalá · Iansã · Oxum · Xangô · Ogum · Iemanjá
Oxumarê · Omulu · Nanã · Pomba-Gira · Marinheiro · Runas · Tarot · Umbanda
Candomblé · Cabala · Kundalini · Tantra · Ayurved · Meditação · Akasha · Akáshico
Prece · Ritual · Banho · Defumação
```

Tradition buckets (used by `flagCrossTradition`):
- **Africanas**: Orixá, Odu, Ifá, Babalorixá, Yalorixá, Caboclo, Pomba-Gira, Marinheiro
- **Cabala**: Sephirot, Kether, Chokhmah, Binah, Malkuth, Cabala
- **Oriente**: Bodhisattva, Guru, Mantra, Kundalini, Tantra, Ayurved, Meditação
- **Cartomancia & Runas**: Tarô, Tarot, Cigano, Runas
- **Akáshica**: Akasha, Akáshico
- **Rituais**: Prece, Ritual, Banho, Defumação
- **Outras**: catch-all for terms not in above buckets

A comment body containing terms from 2+ buckets (e.g., "Ogum encontra Kether encontra Mantra") produces the cross-tradition flag, which W73 can subscribe to without needing to re-detect.

---

## Threading + Mesa Real integration example

The smoke section 11 demonstrates a Casa 8 (Caixão / sexualidade) comment thread:

```
alice (root):  "A Casa 8 (Caixão) sobre sexualidade — Ogum encontra Oxum e Sephirah Binah."
bob   (depth 1): "@alice concordo, @carla?"
carla (depth 2): "@alice sim, Cabala ilumina Tantra."
alice (depth 3): "fechando — Ogum, Oxum e Kether."
```

This thread:
- Has 4 comments with 1 root + 3 replies
- 2 mentions in bob's reply (@alice + @carla), 1 in carla's (@alice)
- 3 subscribers (alice + bob + carla, auto-subscribed on reply)
- The root gets a cross-tradition flag (Africanas + Cabala = 2 buckets)
- 3 notification events: 2 mentions + 1 reply (carla replying to bob)

---

## Constraints honored

- **NO B2B bloat**: no Stripe, no MFA, no admin panels, no cron, no web-push.
- **Worktree isolation**: only `/tmp/w76-d/` was modified; `/workspace/cabaladoscaminhos` untouched.
- **Branch discipline**: only `w76/comments-threading-mentions`; never pushed to `main`.
- **Coordination with W73**: comments ship a `moderationFlag` field that W73's policy engine can subscribe to; W76-D does NOT duplicate moderation rules.
- **Sacred respect**: cross-tradition comments flagged "perspective_only" NEVER "wrong" or "blocked."

---

## Next-cycle suggestions

1. **W73 integration smoke**: a combined test that runs W73 moderation against the flags this engine produces. Validates that the contract between engines holds.
2. **Persistence layer**: production will need a DB-backed `Comments` + `Subscriptions` + `Notification` tables; this in-memory engine is the deterministic test bed.
3. **Mention delivery**: the `NotificationEvent` audit log is the contract; a separate engine (W77?) consumes it and pushes to email/push/web-push channels.

---

**READY FOR NEXT CYCLE**
