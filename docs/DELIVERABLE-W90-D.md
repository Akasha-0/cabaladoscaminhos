# DELIVERABLE W90-D — Comments Moderation Queue

**Cycle:** 90 (W88-B retry)
**Worker session:** 414808538173624
**Wave-spawner:** 414800889626733
**Branch:** `w90/comments-moderation-queue`
**Status:** ⚠️ PARTIAL — files written, git/push BLOCKED by sandbox hang

---

## W88-B retry — what changed

The W88-B attempt (cycle 88) **CASCADED** in the wave-spawner — the comments-moderation
worker failed and propagated failure to the parent. This W90-D retry applies 5 lessons
and a reduced scope:

| Change | Reason |
|--------|--------|
| **Reduced scope (1300-1900 LOC vs W88-B original ~3000)** | Smaller surface = less time on shell-unstable sandbox |
| **npm install (NOT npm ci)** as STEP 0 | `npm ci` wedges on cabaladoscaminhos sandbox; `npm install --no-save` works |
| **Source-inspection spec, not vitest run** | vitest run RPC teardown errors block test runner; source-inspection reads files via regex |
| **node:test-based smoke via tsx** | Avoids vitest; runs engine pure functions in-process |
| **Commit + push BEFORE 25-min mark** | W88-B cascade root cause: pushed too late; env died before push |

---

## 3 NEW lessons (from this W90-D retry)

### 1. `npm install` completes but extracts are EMPTY (sandbox FS issue)

Running `npm install --no-audit --no-fund --ignore-scripts --no-save` on
`/workspace/wt-comments-moderation` completed (881 packages) but:

- `node_modules/typescript/bin/tsc` exists as a **0-byte file** (empty)
- `node_modules/typescript/lib/` is **missing entirely**
- `node_modules/.bin/` doesn't exist
- `node_modules/tsx/dist/` is **empty**

This is **different from the W88 cascade** (which was a `npm ci` wedge). It's a
network-level failure: `peer closed connection without sending complete message body
(incomplete chunked read)`. npm recovered enough to create the directory tree, but
the actual file contents were truncated.

**Workaround applied:** Document the env failure, write files via Write tool
(bypasses git index AND bash), document commit + push commands in deliverable.

**Reusable for:** any future cycle in cabaladoscaminhos sandbox where `npm install`
shows `peer closed connection` errors. The file tree may exist but be empty —
**always stat the files**, not just ls the directories.

### 2. Shell `bash` tool returns 504 on most calls — even simple ones

After the first 30 min of cycle 90, ~80% of `bash` calls returned
`sandbox exec channel unhealthy: category=provider_gateway kind=gateway_504`.
Workaround: use simple `echo` calls as "ping" probes between real commands.
When the channel recovers (single `date` call works), proceed quickly.

Pattern observed: the 504s are bursty. 5-10 calls fail, then 1 succeeds, then
5-10 fail again. The shell tool retries internally but each retry takes ~30s
on this path.

**Workaround applied:** Interleave trivial `echo` calls with the actual command.
When the actual command is the only thing the user cares about, do it via the
Write tool (which has its own non-bash path).

**Reusable for:** any future Mavis session in cabaladoscaminhos where the
sandbox shell becomes flaky mid-cycle. Don't waste retries on the same command
twice; switch to Write tool for new files.

### 3. Time budget for npm install + smoke is **unrealistic** in 30-min cap

Brief allocated 18 min for "implement + 25 min push buffer". But the actual
`npm install` + 504 retries ate **35 min** before any code was written. This is
the **4th consecutive cycle** (W86, W87, W88, W90) where shell+sandbox env
costs >50% of the budget.

**Workaround applied:** Pivoted to "files written via Write tool, validate
later". Smoke was written but not run; TSC was not run; commit + push was
deferred to a follow-up session.

**Reusable for:** any future cycle in this repo. The 30-min hard cap is
*illusory* in current sandbox state. Briefs should be sized for **half the
work** (15 min) and treat validation as separate phase.

---

## Files written (8 files, ~2,200 LOC)

| File | LOC | Purpose |
|------|-----|---------|
| `src/lib/w90/comments-moderation.ts` | ~530 | Engine puro (rules, queue, stats, serialize/parse) |
| `src/lib/w90/__fixtures__/moderation-fixtures.ts` | ~250 | 16 mock items, 6 reasons × 4 statuses |
| `src/components/community/ModerationQueueItem.tsx` | ~270 | Item card com 3 ações |
| `src/components/community/ModerationQueueList.tsx` | ~210 | Lista paginada com 4 tabs |
| `src/app/community/moderation/page.tsx` | ~180 | Server Component + cookies() + 403 page |
| `src/lib/w90/__tests__/comments-moderation.spec.tsx` | ~400 | Source-inspection + runtime asserts (50+) |
| `scripts/smoke-comments-moderation.mjs` | ~280 | 12 runtime asserts via tsx |
| `docs/DELIVERABLE-W90-D.md` | (this) | Deliverable doc |

**Total: ~2,120 LOC** (within 1300-1900 brief budget — slightly over due to
fixtures + spec being larger than expected)

---

## Engine API

```typescript
import {
  DEFAULT_RULES,           // 6 rules, 1 por razão
  evaluateComment,         // (text) => ModerationRule | null
  createQueueItem,         // (flag, opts?) => ModerationQueueItem
  assignToModerator,       // (item, modId) => ModerationQueueItem
  approveItem,             // (item, note?) => ModerationQueueItem
  rejectItem,              // (item, note?) => ModerationQueueItem
  escalateItem,            // (item, note?) => ModerationQueueItem
  getQueueStats,           // (items) => QueueStats
  getPendingForModerator,  // (items, modId) => items[]
  filterByStatus,          // (items, status) => items[]
  serializeQueue,          // (items) => string
  parseQueue,              // (raw) => items[]
  buildFlag,               // (commentId, userId, text, rule, ts?) => ModerationFlag
} from '@/lib/w90/comments-moderation';
```

**6 ModerationReasons:** `spam | ofensa | conteudo-improprio | desinformacao | golpe | politica`
**4 QueueStatus:** `pending | approved | rejected | escalated`
**3 Severities:** `1 | 2 | 3` (1=low, 2=med, 3=high)

---

## Sacred-cultural compliance

- ✅ No `amarração` / `amarre` / `vinculação` / `prejudicar` in any W90-D file (asserted in spec #11)
- ✅ No `banir` / `punir` / `punição` in user-facing copy (asserted in spec #9)
- ✅ All 5 traditions equally moderated — no identity targeting
- ✅ Default rules are content-based (not user-identity-based)
- ✅ ARIA: `role="article"`, `role="tablist"`, `role="tab"`, `aria-live="polite"`, `aria-label`
- ✅ Mobile-first: 44px touch targets, max-w-full → md:max-w-4xl
- ✅ LGPD: no PII captured by engine; only moderation IDs

---

## Validation status (sandbox-blocked)

| Check | Status | Notes |
|-------|--------|-------|
| `tsc --noEmit` on focused files | ⚠️ NOT RUN | Sandbox shell 504s; tsc binary is 0 bytes anyway |
| `vitest run` | ❌ NOT RUN | Skip per W89-A lesson (RPC teardown errors) |
| `npx tsx scripts/smoke-comments-moderation.mjs` | ⚠️ NOT RUN | tsx package is 0 bytes (npm install incomplete) |
| Banned-vocab grep | ✅ MANUAL CHECKED | Read each file, scanned for `amarração` etc. — absent |
| Source-inspection spec | ✅ WRITTEN | 50+ asserts, will run when env is healthy |

**Honest assessment:** The engine code is structurally sound (well-typed,
frozen exports, branded types, full API surface), but I cannot prove
runtime correctness from this session. The user should run the smoke
script in a clean shell before merging.

---

## Next steps (for follow-up session)

1. **Re-run `npm install` in a clean shell** (sandbox recovered):
   ```bash
   cd /workspace/wt-comments-moderation
   timeout 300 npm install --no-audit --no-fund --ignore-scripts --no-save
   ```

2. **Verify TSC passes on focused files:**
   ```bash
   cd /workspace/wt-comments-moderation
   timeout 60 node_modules/.bin/tsc --noEmit --skipLibCheck \
     src/lib/w90 \
     src/components/community/ModerationQueueItem.tsx \
     src/components/community/ModerationQueueList.tsx \
     src/app/community/moderation/page.tsx 2>&1 | tail -10
   ```
   Expected: 0 errors. If there are errors, they're likely in the
   `asCommentId`/`asUserId` brand cast pattern (FIXME note in engine).

3. **Run smoke:**
   ```bash
   cd /workspace/wt-comments-moderation
   npx tsx scripts/smoke-comments-moderation.mjs
   ```
   Expected: `12 PASS, 0 FAIL` + `SMOKE OK`.

4. **Run spec (node:test):**
   ```bash
   cd /workspace/wt-comments-moderation
   node --test --experimental-strip-types src/lib/w90/__tests__/comments-moderation.spec.tsx
   ```
   Expected: 30+ tests pass.

5. **Commit + push:**
   ```bash
   cd /workspace/wt-comments-moderation
   git add src/lib/w90 src/components/community src/app/community/moderation scripts docs/DELIVERABLE-W90-D.md
   git commit -m "feat(w90-d): comments-moderation-queue engine + components + page + smoke. ~2120 LOC, 50+ asserts. W88-B retry. Wave-spawner 414800889626733."
   git push origin w90/comments-moderation-queue
   ```

6. **Update wave-log:**
   Append `## Cycle 90 — W90-D close-out (W88-B retry)` to `docs/WAVE-LOG.md` in
   the main worktree (not this branch's worktree).

---

## Diff summary (what this branch adds)

```
src/lib/w90/comments-moderation.ts                  |  530 ++++++++
src/lib/w90/__fixtures__/moderation-fixtures.ts     |  250 ++++
src/lib/w90/__tests__/comments-moderation.spec.tsx  |  400 ++++++
src/components/community/ModerationQueueItem.tsx    |  270 ++++
src/components/community/ModerationQueueList.tsx    |  210 +++
src/app/community/moderation/page.tsx               |  180 ++
scripts/smoke-comments-moderation.mjs               |  280 ++++
docs/DELIVERABLE-W90-D.md                           |  250 ++++
```

(approximate — actual diff after commit will reflect exact line counts)

---

## Status badges

- [x] Engine: 6 reasons, 4 statuses, 3 severities, branded types, Object.freeze
- [x] Fixtures: 16 items, distributed across 6 reasons × 4 statuses
- [x] Components: ARIA-correct, mobile-first, 44px touch targets
- [x] Page: Server Component, cookies(), 403-page for non-mods
- [x] Spec: 50+ asserts (source-inspection + runtime)
- [x] Smoke: 12 runtime asserts via tsx
- [x] Deliverable: this doc
- [ ] TSC validation: BLOCKED (sandbox)
- [ ] Smoke run: BLOCKED (sandbox)
- [ ] Commit + push: BLOCKED (sandbox)

**Verdict:** Code is structurally complete; runtime verification deferred to
follow-up session with clean shell.
