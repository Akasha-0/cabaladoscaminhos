# Akasha Wave-Spawner — Active Blockers

> **Last updated:** 2026-06-28 19:00 UTC (cycle 18)
> **Status:** 🛑 Wave-spawner cannot self-recover. Owner intervention required.

This file tracks every structural blocker that prevents the wave-orchestrator from doing its
job (spawn workers, run TSC gate, push to remote). Each blocker has: status, root cause,
evidence, and recommended next step.

---

## B-MAVIS-1: mavis CLI not installed in sandbox ⛔ CRITICAL

**Status:** Active since cycle 17 (2026-06-28 18:30 UTC), confirmed again cycle 18.

**Root cause:** The `mavis` CLI binary is not in any of the sandbox's standard install
locations. The wave-orchestrator cannot spawn specialist workers without it.

**Evidence (cycle 18):**

```
$ command -v mavis ; echo "exit: $?"
exit: 1

$ which mavis
(empty)

$ ls /usr/local/bin/mavis /usr/bin/mavis /root/.mavis 2>&1
ls: cannot access '/usr/local/bin/mavis': No such file or directory
ls: cannot access '/usr/bin/mavis': No such file or directory
ls: cannot access '/root/.mavis': No such file or directory

$ find / -name "mavis" -type f 2>/dev/null
(empty — zero hits)

$ npm root -g && ls $(npm root -g)
/usr/local/lib/node_modules
corepack
npm
playwright
pptxgenjs
tsx
typescript
(no mavis)

$ pgrep -af mavis
(only shows the bash command itself; no actual mavis process)
```

**Impact:** Wave-orchestrator reduces to `clone + verify + document`. Cannot spawn any of
the 15 specialist worker trilhas (auth follow-up, Akasha streaming, i18n, voice, events,
mentorship, comments, notifications, audio/video, daily reflection, live streams,
moderation, reputation, marketplace, translation).

**Recommended fix (owner action):**

- **Option A (best, long-term):** Install `mavis` CLI in the sandbox base image. Add a
  setup script in the workspace init hook so every fresh sandbox has it.
- **Option B (workaround):** Add `npm install -g mavis` to the cron pre-flight hook so each
  cycle installs it on first use. Slower (~30s) per cycle but self-healing.
- **Option C (deferral):** Acknowledge wave-spawner is reduced to a status monitor; cancel
  the cron and re-enable when mavis is fixed.

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
| 19 | 2026-06-28 19:30 (planned) | depends on cron | 643 (prior) | missing | 0 | 0 | 🛑 BLOCKED (predicted) |

**Recovery conditions (any one unlocks the next cycle):**
- Mavis CLI installed → spawn specialists on TSC reduction + 15 feature trilhas
- TSC=1 (after fix recipe applied) → push gate clears → workers can land code
- Cron cadence reduced to 2-4h → wipe impact 4-8x less, persistence becomes possible
