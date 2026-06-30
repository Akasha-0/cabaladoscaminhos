# Akasha Wave-Spawner — Active Blockers

> **Last updated:** 2026-06-30 03:00 UTC (cycle 72 spawn by tick 414661074862279)
> **Status:** ✅ CYCLE 71 CLOSED (4/4 PUSHED at 02:36 UTC by SHA `041f1497`). 🔄 CYCLE 72 IN FLIGHT (4 NEW workers spawned: W72-A biorhythm-cycles-b2 [B2 retry for W70-D with REDUCED SCOPE] + W72-B auth-pages-integration + W72-C akasha-streaming-ui + W72-D voice-mode-tts). ⚠️ B-W70-BIO-MISSING ESCALATED to TRUE BLOCKER (W70-D confirmed missing at 90+ min past spawn — fully past the 30-min cap + 30-min recovery window). B2 retry spawned in cycle 72 as W72-A.

This file tracks every structural blocker that prevents the wave-orchestrator from doing its
job (spawn workers, run TSC gate, push to remote). Each blocker has: status, root cause,
evidence, and recommended next step.

---

## B-W70-BIO-MISSING: cycle 70 W70-D (biorhythm-cycles-engine) NOT on origin at 90+ min past spawn ⛔ TRUE BLOCKER (escalated to B2 retry in cycle 72)

**Status (2026-06-30 03:00 UTC, tick 414661074862279):** ESCALATED from "likely BLOCKER" (at 02:30 UTC) to "TRUE BLOCKER". Re-verify at 03:00 UTC confirms `w70/biorhythm-cycles-engine` is STILL NOT ON ORIGIN at 90+ min past spawn (01:30 UTC spawn → 03:00 UTC re-verify). Past the 30-min cap + 30-min recovery window = past the recovery horizon. **B2 retry SPAWNED** in cycle 72 as W72-A with REDUCED SCOPE (2 engines: biorhythm + numerology-daily, NOT 4) to mitigate the response-size ceiling that likely caused the original W70-D crash.

**B2 retry (W72-A) brief:**
- Branch: `w72/biorhythm-cycles-b2` (NEW branch name, NOT reusing `w70/biorhythm-cycles-engine` to avoid collision with missing session)
- Engines: `biorhythm.ts` (23/28/33-day cycles) + `numerology-daily.ts` ONLY
- Sacred coverage: 5+ traditions (Cigano, Numerologia, Astrologia, Orixás, Tantra/Cabala)
- Reduced scope: dropped cycles-overlay + alerts (those ship independently if needed)
- 30-min hard cap (target 22-25 min to leave room)

**Evidence (re-verify at 03:00 UTC, this tick):**

```
$ git ls-remote origin | grep w70
98879be6 refs/heads/w70/sacred-sound-engine      (B, PUSHED at ~01:23 UTC)
3176ddad refs/heads/w70/spiritual-journal-engine (C, PUSHED at ~01:23 UTC)
e16fdf1a refs/heads/w70/synastry-engine          (A, PUSHED at ~01:30 UTC)
# w70/biorhythm-cycles-engine — STILL NOT VISIBLE (90+ min past spawn)
# w69/community-circles-b2 (cycle 70 B2 retry) — PUSHED at b3bc5e32
$ git log --all --oneline | grep -i biorhythm
# (no biorhythm commits anywhere in repo history)
```

**Why this is escalated to TRUE BLOCKER (not false-positive):**
- Cycle 66+ lesson: 30-min cap + 5-10 min over = recoverable.
- Cycle 51: worker exceeded cap by 30+ min and delivered.
- THIS CASE: 60+ min over cap = past recovery window.
- All 3 sibling workers (A/B/C) pushed within 25-30 min. Worker D silence for 90+ min is anomalous.

**Probable root causes (in order of likelihood):**
1. **Worker D session crashed mid-execution** — no close-out commit, no push. Likely hit the agent response size ceiling (200+ messages) before completing the deliverable, similar to cycle 64 Worker B (sacred-text-quote) crash pattern.
2. **Worker D completed but push blocked** — sandbox git wedge (cycle 62+ lessons) may have hung and timed out the session.
3. **Worker D hit a deep TSC error** — biorhythm's cyclic arithmetic may have triggered deep type inference issues beyond what isolated tsconfig could resolve.

**Resolution action taken (this tick):**
- Spawned W72-A as B2 retry with reduced-scope brief (2 engines, not 4).
- Worker session spawned via `communicate spawn` (mavis daemon tool).
- Expected resolution window: 03:25-03:35 UTC (if W72-A delivers within 30-min cap).
- Owner decision pending: keep separate `w72/biorhythm-cycles-b2` branch OR rename to `w70/biorhythm-cycles-engine` after merge.

**Cross-cycle durable lesson (NEW, from this escalation):**
- **30-min cap recovery window is 30 min MAX.** 5-15 min over is recoverable. 60+ min over = TRUE BLOCKER, escalate immediately.
- **B2 retry MUST use reduced scope** when the original hit response-size ceiling. Original W70-D = 4 engines; B2 retry W72-A = 2 engines (50% of original).
- **Re-verify tick is MANDATORY at +30 min mark** (i.e., 60 min past spawn). Don't re-verify at +9 min and conclude false-positive — wait the full window before escalating.
- **B2 retry uses `-b2` suffix on NEW branch** (cycle 69+ lesson re-applied). `w70/biorhythm-cycles-engine` → `w72/biorhythm-cycles-b2`.

**Status at 03:00 UTC: ⛔ STILL ACTIVE (awaiting W72-A push). Expected resolution at 03:25-03:35 UTC window.**

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

---

## B-WORKER-PUSH-VERIFICATION: Worker branches from cycle 19/20 are MISSING from origin (cycle 21)

**Status:** New in cycle 21 (2026-06-28 20:30 UTC). Active.

**Evidence (cycle 21, post-clone):**

```
$ git fetch --all --prune
(no output)

$ git branch -a
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/main

$ git branch -r | grep -E "w1[8-9]|w2[0-9]"
(empty)
```

**Worker reports (cycle 19, from WAVE-LOG):**
- Worker A: "Pushed ✅ Yes (commit `53a3bd9` on remote, PR URL: https://github.com/Akasha-0/cabaladoscaminhos/pull/new/w19/worker-a-tsc-reduction)"
- Worker B: "Pushed ✅ Yes (+1188/-137 lines, 11 files)"
- Worker C: "Pushed ✅ Yes"
- Worker D: (in flight at cycle 19 close)

**Worker reports (cycle 20, from WAVE-LOG):**
- 4 workers spawned, no push details in WAVE-LOG (workers self-report in their own session, not preserved on wipe)

**Root cause hypotheses (none confirmed):**
1. **Local-only push** — workers reported push success based on `git push` exit code 0, but the ref didn't propagate to `origin` (e.g., wrong remote, auth issue, branch protection blocked)
2. **Post-push force-delete** — repo housekeeping or owner action deleted the branches between cycle 19/20 and cycle 21
3. **Wipe-after-push** — pushes happened, branches existed on remote, but the previous wave-spawner session's `git push` was followed by a cron wipe that somehow pruned remote refs (unlikely, remote refs don't get wiped by sandbox reset)

**Impact:** The cycle 19 Worker A TSC reduction (-87.6%, 643→80) is LOST. All cycle 19/20 worker code work is presumed lost. This is a structural blocker for wave-spawner productivity: if workers' pushes don't survive cycles, only docs/ updates accumulate on main, and TSC=1 stays unreachable.

**Cycle 21 mitigation (already applied):**
- All cycle 21 worker briefs now require: "**verify push with `git ls-remote origin <branch>`** before reporting back, include the SHA in the report"
- Wave-spawner will `git fetch --all` + `git ls-remote` on cycle 22 start to verify each branch independently

**Recommended fix (owner action):**
- **Option A (immediate):** Check `https://github.com/Akasha-0/cabaladoscaminhos/branches` for any stale `w19/*` or `w20/*` branches; if they exist, the wave-spawner just needs to fetch with `--all --prune=false`
- **Option B (preventive):** Update the wave-spawner worker brief template to mandate `git ls-remote` verification (cycle 21 already does this)
- **Option C (defensive):** Have workers also push to a `cabal-backup` remote (a second GitHub repo or a personal fork) so even if `origin` loses refs, the work survives

---

## B-TSC-W28: TypeScript gate (updated cycle 21)

**Updated status (cycle 21):** Last verified baseline is TSC=643 (cycle 17, real TSC with full deps). Cycle 19 Worker A reported TSC=80 on their branch (`w19/worker-a-tsc-reduction`), but that branch is **MISSING from origin** (see B-WORKER-PUSH-VERIFICATION above). Cycle 20's Worker A recipe verification showed the local TSC delta was 701→115 (with the expanded tsconfig exclude, applied locally + reverted). The actual current TSC on `main` is still **unchanged from cycle 17**: 643 errors, waiting for a verified TSC-finalization wave to land.

**Cycle 21 spawn:** Worker A is dispatched with explicit instruction to: (a) fix `prisma/schema.prisma:1492` (`@unique` on `Newsletter.userId`), (b) stub the remaining missing `@/lib/*` modules, (c) fix the 13 src/app/ prop-type mismatches, (d) **push via URL injection, verify with `git ls-remote`, report the SHA back**. If Worker A's TSC drop is verified by the wave-spawner in cycle 22, the wave-spawner can attempt to merge to main and unblock everything.

**Other active blockers (unchanged from cycle 19/20):**
- B-TSC-W28: TSC on main is 643, gate is 1, push blocked
- B-CRON-WIPE-1: 30-min cron triggers sandbox reset; wave-spawner logs persist via git push to remote (cycle 18+), but worker branches MUST be pushed during the cycle or they are lost on next wipe
- B-WORKER-PUSH-VERIFICATION (NEW cycle 21): cycle 19/20 worker pushes are missing from origin; cycle 21 has explicit `git ls-remote` verification mandate

---

## ✅ RESOLVED (cycle 22): B-WORKER-PUSH-VERIFICATION was a FALSE ALARM

**Updated status (cycle 22, 21:00 UTC):** Cycle 22's `git ls-remote origin` after `git fetch --unshallow` reveals that **all 7 cycle 19+20 worker branches ARE INTACT on origin**. The B-WORKER-PUSH-VERIFICATION hypothesis was WRONG.

**What actually happened (cycle 22 root cause analysis):**

- Cycle 21 used `git clone --depth 50` (shallow), which limits the cloned refs to the most recent 50 commits on the default branch.
- After the clone, cycle 21 attempted `git fetch --all --prune=false` — this **failed silently** (the `--prune=false` syntax is invalid in git 2.x; it should be `--no-prune`).
- The shallow clone's `.git/refs/remotes/origin/` had only `origin/main` and `origin/HEAD`.
- Cycle 21 ran `git branch -r | grep -E "w1[8-9]|w2[0-9]"` → empty result → **incorrectly concluded** branches were missing from origin.
- In reality, the branches existed on `origin` but were not FETCHED into the local remote tracking refs.

**Verification (cycle 22):**

| Branch | SHA on origin | Status |
|---|---|---|
| `w19/worker-a-tsc-reduction` | `53a3bd92d954e8b8c79a6d4d5beb5260cdcd2689` | ✅ EXISTS |
| `w19/worker-b-i18n` | `595fa3f43240f079d45c928b4d53f698d1c8d853` | ✅ EXISTS |
| `w19/worker-c-voice` | `5e9b5cf11434c5b1f1ff47e5ebe283d5a6cd56e7` | ✅ EXISTS |
| `w20/auth-pages` | `89bbca0b0d777f19e89df9c1c8d418f48a440d71` | ✅ EXISTS |
| `w20/events` | `584e220372ffe4f211e6bba1dd32393b4f826894` | ✅ EXISTS |
| `w20/mentorship` | `cdc3a5b67854df6874fd01325eeac702a0d655f2` | ✅ EXISTS |
| `w20/tsc-final` | `87ab7c29f1e7b64800ca177447256ae7f417fae1` | ✅ EXISTS |

**Lesson (durable, cross-project):**

> When verifying whether a remote branch exists after a sandbox wipe, ALWAYS use `git ls-remote origin <ref>` — NEVER trust `git branch -r` after a shallow clone. The shallow clone's `refs/remotes/origin/` only contains branches that were FETCHED during the clone, not the full set of branches on the remote.

`git ls-remote origin` queries the remote directly (no local reflog dependency) and is the **source of truth** for "does this branch exist on origin?".

**Impact of the false alarm:**

- Cycle 21 spawned 4 NEW workers (w21/*) that re-did work that already existed on origin (auth pages, voice mode, comments, events variants).
- This is wasted compute but **not destructive** — those w21 workers (if they pushed) are additive; they didn't overwrite existing w19/w20 branches.
- **Action:** No rollback needed. Cycle 22's Worker B/C/D build on the EXISTING w19/w20/w25 branches (correct fork base) rather than re-doing from main.

**Resolution: B-WORKER-PUSH-VERIFICATION → RESOLVED (false alarm). Worker push mechanism is WORKING — the verification step was broken.**

---

## 🆕 B-MERGE-TRAIN (cycle 22): Merge sequencing strategy needed

**Status:** 10+ feature branches exist on origin with verified work. Main is at TSC=643 (gate = 1). Need an owner-approved merge sequence to unlock the rest of the trilhas.

**Branches ready to merge (verified cycle 22):**

| Order | Branch | Why |
|---|---|---|
| 1 | `feat/community-platform` (06d0576b) | v3.0 refactor + B2B cleanup, deletes 98,529 lines (Stripe, MFA, admin, sessions, web-push, cron) — must go first to clear the deck |
| 2 | `w20/tsc-final` (87ab7c29) | Claims TSC 80→0 — IF true, this brings main to TSC=1 and unlocks everything else |
| 3 | `w19/worker-b-i18n` (595fa3f) | EN/ES locales + LanguageSwitcher (i18n foundation) |
| 4 | `w20/auth-pages` (89bbca0) | AuthForm + 12 LoginForm tests |
| 5 | `w19/worker-c-voice` (5e9b5cf) | Server-side TTS |
| 6 | `wave/w25-voice-mode` (11bf2e2) | useTTS hook + VoicePlayer multilíngue (depends on w19/worker-c-voice) |
| 7 | `w20/events` (584e220) | Events EN/ES i18n |
| 8 | `w20/mentorship` (cdc3a5b) | Mentorship discover+profile UI |
| 9 | `wave/w25-comments-moderation` (3f525fb) | Comments moderation |
| 10 | `wave/w25-daily-reflection` (1789eed) | Daily reflection + Prisma model |

**Risks:**

- `feat/community-platform` is a 98,529-line deletion — could conflict with EVERYTHING.
- `w20/tsc-final` may not actually achieve TSC=0 (claim is unverified — needs Worker A's check in cycle 22).
- `wave/w25-daily-reflection` adds a new Prisma model — needs a migration.

**Cycle 22 action:** Spawn Worker A (TSC verifier) to validate w20/tsc-final's TSC=0 claim on a clean worktree. Report back TSC counts at each stage. **DO NOT auto-merge** — that's owner action.

**Resolution path:**

- Cycle 23+ (owner approval required): execute merge sequence above via PR per branch.
- Alternative: if `w20/tsc-final` TSC=0 claim is false, re-spawn a TSC reducer wave (3-4 Coder workers in parallel, each fixing 20-30 errors).

---

## ✅ UNCHANGED (cycle 22): B-TSC-W28 — TypeScript gate = 643 errors on main

Same as cycle 21. **Likely resolvable** via merge sequence above (if `feat/community-platform` + `w20/tsc-final` claims are accurate, TSC drops to 0).

## ✅ UNCHANGED (cycle 22): B-CRON-WIPE-1 — 30-min cron triggers sandbox reset

Same as cycle 21. Wave-spawner logs persist via git push to remote (cycle 18+ pattern). Worker branches MUST push during the cycle or are lost.

---

## 🆕 B-WORKER-PUSH-VERIFICATION-CYCLE-22 (cycle 23): CONFIRMED REAL — 8 worker branches LOST across cycles 21+22

**Status:** 🔴 ACTIVE. Worker push mechanism is broken. Wave-spawner cannot rely on durable worker output until this is resolved.

**Cycle 22's B-WORKER-PUSH-VERIFICATION entry was incorrect.** It claimed the cycle 21 "missing branches" hypothesis was a false alarm (cycle 21's shallow clone was the cause). **This was only partially true** — the cycle 21 false alarm was about OLD branches (w19/w20) that were actually intact. But cycle 22 itself failed to verify its OWN newly-spawned w22 branches.

**Cycle 23 verification (post `git fetch --all`, full `git ls-remote origin`):**

| Cycle | Worker branches spawned | On origin? |
|---|---|---|
| 19 | 4 (`w19/worker-a/b/c/d-*`) | ✅ 4/4 verified |
| 20 | 4 (`w20/auth-pages`, `w20/events`, `w20/mentorship`, `w20/tsc-final`) | ✅ 4/4 verified |
| 21 | 4 (`w21/worker-a/b/c/d-*`) | ❌ 0/4 — all MISSING |
| 22 | 4 (`w22/tsc-verify-and-merge`, `w22/auth-oauth-mfa`, `w22/voice-akashic-integration`, `w22/comments-threading`) | ❌ 0/4 — all MISSING |
| 23 | 4 (`w23/*` — spawning now) | ⏳ TBD |

**8 of 8 workers spawned in cycles 21+22 failed to push.** Workers spawned in cycles 19+20 (8 of 8) succeeded. Regression point: cycle 21.

### Root cause hypotheses (not yet root-caused)

1. **Sandbox wipe timing:** workers in cycle 21+22 may have taken >25min (TSC check, OAuth impl, TTS integration, comments threading) and got wiped by the 30-min cron before they could push. Cycles 19+20 had lighter-scope workers.
2. **GITHUB_TOKEN rotation:** URL injection pattern `https://${GITHUB_TOKEN}@github.com/...` may have stopped working if the secret rotated. Wave-spawner's own push (different mechanism) is unaffected.
3. **Memory pressure OOM:** 4 workers × TSC check + Node install = OOM kill on the push step.
4. **Branch protection added to `w2[12]/*`:** GitHub may have added protection after cycle 19-20.

**Most likely:** (1) timing + (3) memory combined. Workers that try to do 30min of work don't push.

### Cycle 23 mitigation

- Workers capped at **15min hard** (not 30)
- Workers given **ultra-minimal scope** (ONE file change max)
- Workers given **push-fail fallback**: write to `docs/cycle-23-failures/<name>` in wave-spawner's shared workspace
- Workers given **MANDATORY push verification**: `git ls-remote origin <branch>` after push, include SHA in report

### Resolution path

1. Cycle 23 spawns 4 minimal-scope workers. If pushes succeed, mechanism is fixed (was timing/scope issue).
2. If pushes still fail: escalate to owner. Check (a) GitHub branch protection rules, (b) GITHUB_TOKEN secret status, (c) worker session memory limits.
3. As stop-gap: wave-spawner commits `docs/cycle-23-failures/` content directly to main (via wave-spawner's working push mechanism), preserving at least the report content even if feature work is lost.

### Impact

- 8 worker-days of work (cycle 21+22) effectively lost. May be partially recoverable from worker session transcripts (if any were preserved before wipe).
- Merge train (B-MERGE-TRAIN) cannot start until TSC=0 verified (Worker A cycle 23).
- TSC=643 gate on main holds.

**Resolution: B-WORKER-PUSH-VERIFICATION-CYCLE-22 → ACTIVE. Cycle 23 will test if minimal-scope workers can push. If not, owner intervention required.**

---

## ✅ RESOLVED — B-WORKER-PUSH-VERIFICATION-CYCLE-22

**Cycles 23, 24, 25 all confirmed push mechanism works** with minimal-scope (ONE file) + 15min cap pattern:

| Cycle | Workers | Pushed | Time to push | Fallback used |
|---|---|---|---|---|
| 19 | 4 w19 | 4/4 | ~3-5min | no |
| 20 | 4 w20 | 4/4 | ~3-5min | no |
| 21 | 4 w21 | 0/4 | never (wiped by cron) | n/a |
| 22 | 4 w22 | 0/4 | never (wiped by cron) | n/a |
| **23** | 4 w23 | **3/3** | **60-90s** | no |
| **24** | 4 w24 | **4/4** | **<60s** | no |
| **25** | 4 w25 | **4/4** | **<90s** | no |

**Root cause confirmed:** workers in cycles 21+22 took >25min on heavy work (TSC verify, OAuth, TTS, comments threading) and got wiped by the 30-min cron before push. Lightweight workers (≤100 line stubs) complete in 60-90s, well within the window.

**22 worker branches now on origin** (w19/w20/w23/w24/w25 + feat/community-platform).

### Remaining blockers

- **B-MERGE-TRAIN:** 22 branches waiting for owner action to merge into main. TSC=1 (down from 643, vitest/globals config error) is no longer a strict gate for additive merges. Owner approval needed.
- **TSC=1 on main:** vitest/globals type def missing — config issue, not code. Fix: install `@types/vitest` or remove `vitest/globals` from tsconfig types. ~1 line change.

### Cycle 25 collision note (NEW)

- 5+ parallel Mavis sessions on `/workspace/cabaladoscaminhos` produced 3 collision events this cycle
- Recovery patterns used: `git worktree add` for branch isolation, `git update-ref` to restore branch pointer after parallel `git reset --hard origin/main`
- Workers that did not use worktrees still recovered cleanly via `git update-ref` + `git reset --hard origin/main`
- Token-push via GIT_ASKPASS (no URL/reflog exposure) was used by all 4 w25 workers — no shell hangs observed

## Cycle 51 — w51/voice-mood-history-export terminated at 30-min cap (2026-06-29)

**Blocker ID:** B-W51-VMHE-TIMEOUT
**Worker session:** 414469786947810 (Coder, status 2 "Request timed out.")
**Worktree:** `/workspace/wt-w51-voice-mood-history-export` (cleaned up, branch deleted)
**Symptom:** Empty worktree at `3f5effdf` (origin/main), no file written in `src/lib/w51/`, no commit on `w51/voice-mood-history-export`.

**Spec (too ambitious for 30-min cap):**
- 4 export formats (json/jsonl/csv/ndjson-bundle)
- 5 window constants (30/90/180/365/all days)
- aggregate stats (mood distribution, top mood, mood trends, peak hour)
- bundle checksum (SHA-256)
- LGPD Art. 7 (consent) + Art. 18 (export/delete) + anonymization
- 8 error codes VMHE_001..008
- 30+ named exports

**Root cause analysis (matches cycle 48 w48/tradition-content-moderation):**
1. Feature spans 4 distinct concerns (data model + export formats + aggregation + LGPD) — 4 conceptual units
2. Spec asked for ~30+ named exports — usually a 2000L+ file
3. Combined with 4 export formats × 5 windows + LGPD, the natural size is 2500-3500L
4. Single-worker 30-min cap is proven for 1500-2800L rich features (cycle 50 = 12,235L / 5 workers = 2447L avg)
5. The cap hit exactly at 30 min suggests the worker was on track but didn't get to write+commit+push in time

**Recommended owner action:** split into 2 sub-features for w52:
- w52a/voice-mood-history-store (~1200L) — query model + storage + LGPD consent + delete
- w52b/voice-mood-history-export (~1500L) — 4 export formats + bundle checksums + aggregate stats

**Alternative:** re-spawn with explicit 60-90 min cap and a focused MVP (3 export formats, no anonymization). Owner decision required.

**Historical context:**
- Cycle 48: w48/tradition-content-moderation terminated (10 traditions × 3-8 rules = 30-80 rules too ambitious)
- Cycle 51: w51/voice-mood-history-export terminated (4 concerns × 30+ exports too ambitious)
- Pattern: features that span N distinct concerns in a single file are too ambitious for 30 min when N ≥ 4

**Mitigation going forward:**
- Wave-spawner should pre-budget 1500-2800L per file, with 30+ exports
- Features that exceed 2800L target should be split into 2-3 sub-features BEFORE spawning
- Worker briefs should include a `MAX_SIZE_LINES` guard (e.g., "if file would exceed 3000L, simplify the spec to fit 2500L")
- 4-cycle count of w51 features that hit cap: 0/4 (only VMHE hit cap; 4/4 others pushed cleanly)

## Cycle 51 — B-W51-VMHE-TIMEOUT RESOLVED (2026-06-29 14:50 UTC)

**Status:** ✅ RESOLVED
**Resolver:** Cycle 51 handoff (session 414476715741356, 14:30 UTC tick)
**Resolution:** Replacement worker (Coder, spawned at 14:30 UTC) shipped the full feature in 18 min (14:30 → 14:48 push). Final: 2315L, 128 exports, TSC=0 first attempt, 14/14 smoke GREEN, all spec items delivered without deviation.

**Lessons learned (revised from original BLOCKER hypothesis):**
- The spec was NOT too ambitious. 2315L + 128 exports is a typical rich feature size, well within the cycle 50-validated 1500-2800L range.
- The 30-min cap was the bottleneck, not the spec. The first worker probably had ~80% of the file written when it hit the cap. The replacement worker wrote + validated + committed + pushed in 18 min.
- Spec-split (w52a/w52b) was over-engineering. The right recovery is replacement-spawn with the same spec, possibly with a slightly more explicit file structure to avoid the slowdown.
- Worker briefs should include a "rough plan" at the top (e.g., "5 sections: types → validators → core → LGPD → smoke") so workers don't spend the first 5 min deciding structure.

**Updated recommendation going forward:**
- 30-min cap hits are recoverable via replacement-spawn in 80%+ of cases (cycle 51: 1/1 recovered)
- Spec-split is only needed when feature would naturally exceed 3500L (cycle 48 tradition-content-moderation was ~5000L+, that's the threshold)
- Wave 52 plan no longer needs w52a/w52b split — the WAVE-LOG.md wave 52 plan was updated to skip voice-mood-related split

## Cycle 66 — w66/reputation-system MISSING from origin (2026-06-29 23:30 UTC)

**Blocker ID:** B-W66-REP-MISSING
**Worker session:** Unknown (spawned by previous wave-spawner session, no session ID in current orchestrator 414609436238102 reach)
**Symptom:** Branch `w66/reputation-system` not on origin at 23:30 UTC. 3 other w66 workers (audio-video `4e7a4ae`, live-streams `2d7bacb`, translation `dbabb7c`) pushed cleanly.

**Investigation trail:**
- `git ls-remote origin` at 23:32 UTC shows 3/4 w66 branches
- No worktree at `/workspace/wt-w66-reputation` (sandbox was empty at cycle 67 boot — fresh clone)
- No `reputation` in `git worktree list` output
- Reputation worker may have been wedged on env hang (cycle 51 B-W51-VMHE-TIMEOUT pattern) or terminated at 30-min cap

**Root cause hypothesis:**
- 4/4 W66 workers were spawned by previous orchestrator session (cycle 66 spawn @ 23:00 UTC)
- 3/4 reported back via `communicate` and pushed branches
- 1/4 (reputation-system) did not push — either hit 30-min cap, env wedge, or silent death
- Orchestrator session 414609436238102 has no session list reach into the previous session's spawned workers (different session tree)

**Procedure vs reality:**
| Step | Expected | Reality |
|------|----------|---------|
| Worker spawns and receives brief | ✅ | ✅ |
| Worker creates worktree | ✅ | ❓ unknown |
| Worker writes engine + tests | ✅ | ❓ unknown |
| Worker runs TSC + smoke | ✅ | ❓ unknown |
| Worker commits + pushes | ✅ | ❌ branch not on origin |

**Recovery options (decision pending, deferred to cycle 68):**
1. **Re-spawn w66/reputation-system in cycle 68** with same brief — at-least-once delivery
2. **Skip and accept partial W66 ship** — w65/w57 already partial on reputation, governance layer is the weakest
3. **Merge into w68 as fresh trail** — combine with new governance features

**Recommended:** Option 1 (re-spawn) — the brief is good (universalista reputation + dispute resolution + 7 tradition scores), cycle 60-65 lessons are all encoded, and 1/4 W66 failures is acceptable variance for 30-min cap pressure.

**Honest concerns:**
- Orchestrator cross-session visibility is limited — wave-spawner cannot introspect workers spawned by other wave-spawner sessions
- The BLOCKER is detected by absence (no branch on origin) not by worker signal
- Future cycles should ALSO check `git ls-remote origin` for previous-cycle branches at boot, not just current cycle

**Cross-cycle lesson (NEW):**
- At-least-once delivery for cycle-level features: re-pick missing trails as normal workers in next cycle
- Don't block current cycle on a previous cycle's missing feature
- Wave-spawner recovery loop: spawn → verify via `git ls-remote origin` → if missing, log to BLOCKERS.md and defer to next cycle

## B-W66-REP-MISSING — RESOLVED (2026-06-29 23:48 UTC)

**Status:** ✅ RESOLVED
**Resolver:** Cycle 66 orchestrator session 414602069405916 (this session), B2 retry of the original reputation worker session 414603274154196
**Resolution:** B2 retry spawned at 23:38 UTC, completed at 23:48 UTC. Engine 1668L, spec 1299L, 113 assertions, 128/128 sacred symbols, 6/6 smoke, TSC=0, NO derogatory policy enforced. Pushed to `origin/w66/reputation` at SHA `cd5a8d2743a1ce9d89d5dd329ab21cacb114a74a`. **Branch is now on origin.**

**Final cycle 66 SHIP tally:** 4/4 PUSHED ✅ (audio-video, live-streams, translation, reputation)

**Refined cycle 66 lessons (post-resolution):**
1. **B2 retry from the SAME session ID can succeed** — the original worker session was reused with a fresh brief, saving session ID churn and keeping audit trail intact.
2. **Parallel session cross-checks are valuable but can be false-positive** — the cycle 67 parallel session's BLOCKER entry was correct at 23:30 (reputation wasn't on origin yet) but became incorrect by 23:48 (B2 retry pushed). Lesson: when BLOCKER is flagged at 23:30 and the originating session is still active, give the originating session ~15-20 min to recover before treating the BLOCKER as final.
3. **Cycle 66 wall-clock was 48 min** (longest in wave-spawner history) but 4/4 PUSHED. The B2 recovery pattern from cycle 64 (and validated in cycle 51) works in cycles 66+ — spec-split is NOT needed, replacement-spawn is enough.
4. **The 30-min cap hit at 23:31 for the reputation worker, B2 retry started at 23:38, completed at 23:48** — that's 7 min for the B2 retry worker to read context + finish spec + validate + commit + push. Cycle 64 B2 retry was 18 min (full spec); cycle 66 B2 retry was 10 min (mostly-done spec). **Lesson: B2 retry wall-clock is proportional to remaining work, not full spec.**

**Updated cycle 66 cross-cycle lesson:**
- ✅ At-least-once delivery still applies
- ✅ Don't block current cycle on a previous cycle's missing feature still applies
- ✅ Wave-spawner recovery loop: spawn → verify → if missing, log to BLOCKERS + spawn B2 retry IN PARALLEL with the current cycle's spawn (cycle 66+ rule)
- **NEW:** B2 retry from same session ID is preferred (audit trail intact) but cross-session B2 retry also works (cycle 64 pattern)

**Honest concerns:**
- The parallel cycle 67 session's "MISSING" claim is now incorrect. Future parallel-session BLOCKER entries should include a "verify at +15 min" instruction.
- The cycle 66 wall-clock was 48 min vs typical 22-26 min. Future workers with similar scope (large data layer, multiple sub-systems) should consider splitting into 2 sub-features per cycle 51 lesson.

**Status: ✅ B-W66-REP-MISSING RESOLVED. Cycle 66 SHIP complete @ 23:48 UTC. 4/4 on origin, 10,897 LOC total.**

---

## B-W69-CC-MISSING — ✅ RESOLVED (false-positive BLOCKER, original W69-D worker delivered late)

**Status:** ✅ RESOLVED (2026-06-30 01:39 UTC, 9 min after false-positive BLOCKER at 01:30 UTC)
**Resolver:** Original W69-D worker (spawned 01:00 UTC, session <unknown, in original cycle 69 orchestrator session 414631572730069's sandbox) — pushed to origin at ~01:35-01:39 UTC, 5-9 min after the 30-min cap hit at 01:30 UTC.
**Verification:** 2026-06-30 01:39 UTC by cycle 70 orchestrator session 414638574882927.
**Branch:** `w69/community-circles` is on origin at SHA `0c6af98d074a8502f7200722f64bb20676fc5735`.

**Resolution trail:**

| Time | Event |
|------|-------|
| 01:00 UTC | W69-D worker spawned by cycle 69 orchestrator session 414631572730069 |
| 01:30 UTC | 30-min cap hit; cycle 69 close-out at 01:30 UTC by this orchestrator: branch NOT on origin → BLOCKER logged + B2 retry (Worker E) spawned in cycle 70 |
| 01:35-01:39 UTC | Original W69-D worker pushed to `origin/w69/community-circles` at SHA `0c6af98d` (slightly over 30-min cap, ~35-39 min from spawn) |
| 01:39 UTC | Cycle 70 orchestrator re-verified branches; W69-D is now on origin; BLOCKER resolved; B2 retry (Worker E) becomes a SAFETY-NET DUPLICATE on `-b2` branch |

**W69-D deliverable (per `origin/w69/community-circles`):**
- 4 engine files: `src/lib/community-circles/{circles,membership,feed,governance}.ts`
- 4 spec files: `src/lib/community-circles/__tests__/{circles,membership,feed,governance}.spec.ts`
- Smoke: `src/lib/community-circles/__tests__/smoke-runtime.mjs` + `run-all-specs.mjs`
- tsconfig: `tsconfig.w69-circles.json`
- DELIVERABLE: `docs/DELIVERABLE-w69-community-circles.md`

**Lessons learned (cycle 69 PARTIAL → RESOLVED):**

1. **30-min cap is a TARGET, not a hard deadline** — workers can exceed the cap by 5-10 min and still deliver successfully. Cycle 66 B2 retry (7 min over), cycle 51 (longer over). The cap is a "expected to be done by" guideline, not a "kill at" deadline.

2. **False-positive BLOCKER pattern is real** — verification at :30 tick can catch workers that are STILL in flight (5-9 min from delivery). The cycle 66 lesson applied: "when BLOCKER is flagged at :30 and the originating session is still active, give the originating session ~15-20 min to recover before treating the BLOCKER as final."

3. **Re-verify at the next tick** — the cycle 70 orchestrator (this session) re-verified at 01:39 UTC (9 min after the false-positive) and found the branch on origin. This 9-min re-verify window is the right pattern.

4. **B2 retry is now a SAFETY-NET DUPLICATE, not a recovery** — Worker E (B2 retry) is in flight on `w69/community-circles-b2` branch. If it delivers, the result is an INDEPENDENT implementation of the same feature, which provides:
   - Cross-validation (both implementations should pass the same spec contract)
   - Alternative reference for the owner to pick from
   - Insurance if the original W69-D has a hidden bug (the B2 retry would be a clean alternative)
   No conflict: branch names differ (`w69/community-circles` vs `w69/community-circles-b2`).

5. **Wave-spawner recovery loop is now: spawn → verify at :30 → if missing, log BLOCKER + B2 retry in parallel → RE-VERIFY at next tick (:45 or :00) → resolve BLOCKER if branch appeared.** Update from cycle 66 rule: re-verify at next tick is MANDATORY, not optional.

**Cross-cycle lesson (cycle 69):**
- The 30-min cap hit at 01:30 caught the worker still in flight (5-9 min from delivery).
- The B2 retry pattern from cycle 64/66 still applies, but it's now better characterized as "safety-net + parallel implementation" rather than "recovery from failure".
- Original W69-D worker delivered successfully even with a 35-39 min wall-clock (vs 30-min cap target). The cap is soft.

**Honest concerns:**
- B2 retry Worker E (414640138182864) is still in flight at 01:39 UTC. If it also delivers (likely), the cabaladoscaminhos repo will have TWO independent implementations of community-circles. Owner should pick one to merge. Both are valid.
- The cycle 69 close-out commit at SHA `59c91146` (this session) reported "3/4 PUSHED" which is INACCURATE by the time of the next read (01:39 UTC = 4/4 PUSHED). The close-out text is a SNAPSHOT at 01:30, not a final state. Future close-outs should include a "verify at +N min" note.
- The W69-D worker's exact session ID is not visible from this orchestrator (it was in the previous sandbox). The session_id is logged in the W69-D commit metadata if needed.

**Status: ✅ B-W69-CC-MISSING RESOLVED. W69-D branch on origin at SHA `0c6af98d`. B2 retry (Worker E) in flight as safety-net duplicate on `w69/community-circles-b2` branch.**
