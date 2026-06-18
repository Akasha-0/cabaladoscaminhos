# 003-ssot-consolidation.md

## Lesson: SSOT violations accumulate silently unless audited every iteration

**Tag:** `harness`, `architecture`, `process`
**Status:** CLOSED
**Date:** 2026-06-18

---

### What happened

The autonomous loop ran 519+ iterations without a §3 SSOT audit. In that time:
- `akasha-loop-daemon-v5.py` was referenced in `AGENTS.md` but didn't exist on disk — the actual running daemon was v9
- 7 core engine modules existed as both v1 (older, larger) and v2 (newer, imported by v9 daemon) — 14 files where 7 should exist
- 5 additional v2-only artifacts (`intelligence_v2.py`, `project_scanner_v2.py`, `skill_patterns_v2/`, `intelligence_v2/`, `project_scanner_v2/`) were untracked but cluttering the tree
- `run-24-7.sh` had `ROOT="/home/skynet/cabala-dos-caminhos"` hardcoded — portability violation
- `.autonomous/multi-agent/sessions/` (runtime agent logs) were committed to git — gitignore violation
- The constitution explicitly prohibits `*-vN`, `*_v2`, `-new`, `-final` — these rules were written but never enforced

### Root cause

§3 of the constitution was never audited. The loop accumulated versioned duplicates across iterations because no iteration treated SSOT cleanup as "one thing made whole and verified." The `akasha-loop-daemon-v5.py` reference in `AGENTS.md` was the canary: when it stopped matching reality, the drift began.

### What was decided

1. **v9 = canonical daemon** (not v5): `run-24-7.sh` invokes v9, v5 never existed
2. **v2 modules = canonical** (not v1): v9 daemon imports only v2 versions; v1 modules were orphaned
3. **Renamed v2 → canonical** (dropped `_v2` suffix): `reasoning_chain.py`, `context_engine.py`, etc. — no more `_v2` in file names
4. **v2-only artifacts deleted**: `intelligence_v2/`, `project_scanner_v2/`, `skill_patterns_v2/`, `circuit-breaker-v2.json` removed; `intelligence_v2.py` and `project_scanner_v2.py` deleted (their v1 counterparts were the actual canonical files)
5. **`ROOT` made portable**: `git rev-parse --show-toplevel` instead of hardcoded path
6. **`sessions/` untracked**: removed from git, gitignored

### What to do differently

- **Every iteration must run the §3 audit** as part of "Orientar" in the autonomous chain. Not optional.
- **A referenced file that doesn't exist is a P0 signal** — it means the documentation is stale and likely other drift exists.
- **Before spawning parallel versions, consolidate first.** The temptation to "try something new" while keeping the old is exactly the pattern that created this debt.
- **SSOT consolidation is high-leverage harness work** — §9 says consolidation > addition. One pass cleaned up 31 files of versioned duplicates.

### Files changed

- `.autonomous/multi-agent/akasha-loop-daemon.py` (was v9, now canonical)
- All core engine modules: renamed v2 → canonical
- `.autonomous/multi-agent/run-24-7.sh` (portable ROOT, DAEMON not DAEMON_V9)
- `.gitignore` (sessions + v2 runtime dirs)
- `AGENTS.md` (v5 → canonical daemon reference)
- `DECISIONS.md` (3 SSOT decisions registered)
- `lessons/003-ssot-consolidation.md` (this lesson)
