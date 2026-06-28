# Akasha Wave-Spawner — Active Blockers

> **Last updated:** 2026-06-28 19:00 UTC (cycle 18)
> **Status:** 🛑 Wave-spawner cannot self-recover. Owner intervention required.

This file tracks every structural blocker that prevents the wave-orchestrator from doing its
job (spawn workers, run TSC gate, push to remote). Each blocker has: status, root cause,
evidence, and recommended next step.

---

## B-MAVIS-1: mavis CLI not installed in sandbox ⚠️ PARTIAL (cycle 19 update: daemon tool works)

**Status:** Active since cycle 17 (2026-06-28 18:30 UTC). **PARTIALLY RESOLVED in cycle 19.**

**Cycle 19 update (2026-06-28 19:30 UTC):** The `mavis` CLI binary is STILL missing
(confirmed: `command -v mavis` exit 1, no `find` hits, npm global lacks it). However, the
**mavis daemon is reachable through the `mavis` tool** in the agent runtime. The
wave-spawner can now spawn specialist workers via `communicate spawn` (Branch sessions)
even without the CLI binary. The CLI is a thin wrapper around the daemon; the daemon is
the actual capability.

**Evidence (cycle 19):**

```
$ command -v mavis ; echo "exit: $?"
exit: 1

$ find / -name "mavis" -type f 2>/dev/null
(empty)

$ # Mavis tool (daemon):
$ mavis({ command: "agent list" })
{
  "ok": true,
  "response": {
    "agents": [
      { "agent_name": "General", ... },
      { "agent_name": "Coder", ... },
      { "agent_name": "Verifier", ... }
    ]
  }
}
```

**Impact (revised):** Wave-orchestrator can now spawn. Cycles 17 and 18's "BLOCKED" verdicts
were overly conservative — they tested CLI presence but not daemon reachability. The
correct gate is daemon reachability, not CLI presence. Cycle 19 used the `mavis` tool +
`communicate spawn` to dispatch 4 workers in parallel (Coder×2, General×2).

**Residual impact:**
- CLI-specific features (cron list/get/trigger, drive CRUD, etc.) may be unavailable from
  bash, but the spawning flow works.
- Future workers can be spawned via the daemon even on wiped sandboxes.

**Recommended fix (owner action):**

- **Option A (best, long-term):** Install `mavis` CLI in the sandbox base image for parity
  with the daemon tool. (Ergonomic, not functional.)
- **Option B (workaround):** Use the `mavis` tool + `communicate spawn` flow (cycle 19
  pattern). Already in production.
- **Option C (deferral):** Cancel only if spawning via daemon is also blocked.

---

## B-TSC-W28: TypeScript gate = 643 errors ⛔ CRITICAL (blocks all pushes)

**Status:** Active since cycle 16 (2026-06-28 18:00 UTC), confirmed again cycle 18.

**Root cause:** W27 commit `a88bc7d` (`chore(tsc): exclude orphan test dirs + apply prisma
7.x fix`) only excluded `tests/lib/*` entries from `tsconfig.json` and missed 5 other
orphan test directories. Additionally, Prisma 7.x migration in `prisma/seed/*.ts` is
incomplete (PrismaClient, ArticleType, EvidenceLevel no longer exported). Plus next.config.ts
bundle analyzer API drift, middleware production/test type comparison, and ~50 implicit-any
in test files.

**Evidence (cycle 17, real TSC with full node_modules):**

```
TSC error distribution (total = 643):
  src/         TS2307 (missing modules)              238  ( 37%)
  tests/       various                                304  ( 47%)
  prisma/seed/ TS2305 (Prisma 7.x drift)               22  (  3%)
  __tests__/   implicit-any                            17  (  3%)
  e2e/         Playwright config drift                  2  (<1%)
  misc         middleware, next.config, etc            ~60  (  9%)
```

**Top missing modules (src/):**
- `app/api/mapa/route.ts`
- `app/api/onboarding/route.ts`
- `app/api/chat/oracle/route.ts`
- `app/api/webhooks/stripe/route.ts`
- `app/api/payments/checkout/route.ts`
- `lib/credits.ts`, `lib/payments.ts`, `lib/auth-jwt.ts`, `lib/notifications.ts`
- `lib/numerologia.ts`, `lib/ifa.ts`
- 10+ correlation engines
- `lib/ai/prompt-system.ts`, `lib/ai/insights/parser.ts`, `lib/ai/tradition-mapper.ts`
- `store/cockpit-store.ts`

**Empirical validation (cycle 17, local + reverted):**
- Applied Step 1 of fix recipe (expand `tsconfig.json` exclude to cover the missing dirs)
- TSC went from **643 → 436** (saved 207 of predicted 214 errors)
- Reverted (wave-spawner doesn't commit to remote)
- The recipe IS real; TSC=1 needs more work beyond Step 1

**Fix recipe (for whoever picks this up):**

1. **Quick win (TSC=643 → 436):** Expand `tsconfig.json` `exclude` to include
   `tests/integration/`, `tests/api/`, `tests/hooks/`, `tests/app/`, `__tests__/`, `e2e/`,
   `prisma/seed/`. Empirically saves 207 errors.
2. **Remaining 436 errors:** Either implement the 238 missing modules in `src/` (real
   engineering work) OR add even more excludes (defers the problem to next upgrade).
3. **Prisma 7.x seed:** Either complete the migration to new `@prisma/client` exports OR
   add `prisma/seed/` to tsconfig exclude (blocker-workaround).
4. **next.config.ts:** Update bundle analyzer call to use the new `reportFilename` option.
5. **middleware.ts(35,9):** Fix production/test type comparison (or use a type assertion).
6. **Implicit-any:** Run `tsc --noImplicitAny` to enumerate, then add explicit types.

**Impact:** Until TSC=1, the wave-spawner cannot push (CI would fail). Even if mavis
became available, workers' code commits would fail the same TSC gate.

**Recommended fix (owner action):**
- Open a 1-2 Coder specialist session (worktree-isolated) on TSC reduction wave
- Apply Step 1 first (quick win, 207 errors off in 5 min)
- Then triage the 238 missing modules (which are real product features vs. stub files?)
- Schedule follow-up wave for remaining 200+ errors

---

## B-CRON-WIPE: 30-min cron likely triggers sandbox reset

**Status:** Suspected since 2026-06-27, not confirmed but consistent with 16+ cycles of
empty `/workspace` on every cycle.

**Evidence:** Workspace is empty at the start of every cycle (cloned with `--depth 1` in
<20s every time). The 30-min cron itself is the only recurring event that could cause this.

**Counter-evidence (cycle 16+):** `git clone` succeeds every time, so the wipe is NOT a
sandbox-level reset. It wipes the workspace but the sandbox itself is fine.

**Impact:** Wave-orchestrator cannot accumulate state between cycles. The cron is the
trigger, so the orchestrator's self-bootstrap pattern (clone + restore each cycle) is
uncomfortable but works. What it CANNOT do is persist in-memory worker tracking — every
cycle starts fresh.

**Recommended fix (owner action):**
- **Option A (best):** Reduce cron cadence from 30min to 2-4h. Reduces wipe impact 4-8x.
- **Option B:** Move wave-spawner state to a persistent location (S3, GitHub Gist,
  `/workspace/cabaladoscaminhos/docs/` committed + pushed).
- **Option C:** Diagnose sandbox runtime logs for session reset events at each 30-min mark.

---

## Cross-Project Lessons (durable, reinforced across 17 cycles)

1. **TSC checks against a checkout with missing `node_modules` are MEANINGLESS** — they pass
   at 1 because type resolution fails closed. Always verify TSC with full deps.
2. **Bash tool default cwd is `/root`, not `/workspace`** — clones/operations land in wrong
   place unless `cd /workspace &&` is explicit or files are moved.
3. **When prompt's structural prerequisites are missing (e.g., mavis CLI), the wave-spawner
   should NOT fake work to satisfy the spawn rule** — document the missing prerequisite
   honestly and degrade gracefully.
4. **Wave-spawner audit logs must be persisted to the repo's `docs/` folder AND committed,
   not to `/workspace/docs/`** — the parent dir gets wiped every cron cycle; the repo's
   docs/ survives if committed + pushed.
5. **Honest BLOCKED deliverable structure (pre-flight table + procedure-vs-reality + root
   cause + recovery options) is the canonical response** when prerequisites are missing —
   approved by the user in earlier cycles.

---

## Wave-Spawner Status Board

| Cycle | Timestamp (UTC) | Workspace | TSC | Mavis | Spawn | Push | Status |
|---:|---|---|---:|---|---|---|---|
| B-011..m | 2026-06-27 14:00 → 2026-06-28 17:00 | empty (15×) | n/a | n/a | 0 | 0 | 🛑 BLOCKED × 15 |
| 16 | 2026-06-28 18:00 | restored | 643 | missing | 0 | 0 | ⚠️ bootstrap OK, TSC fail |
| 17 | 2026-06-28 18:30 | restored | 643 | missing | 0 | 0 | 🛑 BLOCKED |
| 18 | 2026-06-28 19:00 | restored | 643 (prior) | missing | 0 | 0 | 🛑 BLOCKED |
| 19 | 2026-06-28 19:30 | restored | 643 (prior) | **daemon ✅** (CLI ❌) | **4** | 0 (docs) | ⚠️ PARTIAL — 4 workers in flight |

**Cycle 19 (this cycle) — key wins:**
- **Discovered mavis daemon works via the `mavis` tool** even without CLI binary
- Spawned 4 workers in parallel (Coder×2, General×2) on 4 trilhas
- WAVE-LOG + BLOCKERS audit trail persistent in repo (committed, will be pushed)

**Recovery conditions (any one unlocks the next cycle):**
- Mavis daemon (already ✅ via `mavis` tool) — can spawn from any sandbox, no CLI required
- **TSC=1** (after fix recipe applied) — primary remaining gate; unlocks push
- Worker A's TSC reduction wave (in flight) may drop TSC from 643 to <100
- Cron cadence reduced to 2-4h → wipe impact 4-8x less, persistence becomes easier

---

## Cycle 20 update — 2026-06-28 20:00 UTC

**Worker A's TSC reduction branch (`w19/worker-a-tsc-reduction` @ 53a3bd9) is the
biggest unlocked work item.** Local verification shows TSC 701 → 115 (-84%). The WAVE-LOG's
"80" was a slightly different filter; the count is 115 with the standard `npx tsc
--noEmit --skipLibCheck` invocation.

**Remaining 115 errors (cycle 20 worktree-verify, distribution):**
- TS2322 (16) — type not assignable
- TS2339 (10) — property doesn't exist
- TS2484 (9) — override mismatch
- TS2353 (8) — unknown property in object literal
- TS2554 (7) — argument count
- TS2345 (6) — argument type
- TS2741, TS2737, TS2323 (4 each)
- TS2307 (3) — missing module
- ... (rest)

**Spawned cycle 20 Worker A (Coder) with target TSC 115 → ≤10** on branch
`w20/tsc-final`. If it lands, the wave-spawner can merge + push, unblocking future cycles.

**Other active blockers (unchanged from cycle 19):**
- B-TSC-W28: TSC on main is 701, gate is 1, push blocked
- B-CRON-WIPE-1: 30-min cron triggers sandbox reset; wave-spawner logs persist via git
  push to remote (cycle 18+), but worker branches MUST be pushed during the cycle or
  they are lost on next wipe

**Resolved since cycle 18:**
- ✅ B-MAVIS-1 (PARTIAL): mavis daemon works, CLI is just a wrapper, spawn is functional
