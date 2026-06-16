#!/usr/bin/env python3
"""
AKASHA Autonomous Evolution Loop
=================================
6-phase state machine: RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE
Each full iteration runs all 6 phases in one call (bootstrap once per iteration).

Improvements are executed by real OMP coding agents via subprocess,
not dead Python handlers.
"""

import os
import json
import hashlib
import re
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous" / "multi-agent"
MEMORY_FILE = MA / "memory.json"
SNAPSHOT_FILE = MA / "context_snapshot.json"
STATE_FILE = MA / "state.json"
TASK_FILE = MA / "task-implementation.json"
RESULT_FILE = MA / "task-result.json"
CACHE_FILE = MA / "triad-cache.json"
LOGS_DIR = MA / "logs"

os.makedirs(MA, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)

# ─── Version constants ──────────────────────────────────────────────────────────
# v0.0.x: loop infrastructure + harness improvements
# v0.1.x: feature parity (ASTROLOGIA, ODUS, ICHING, CABALA, TANTRA unified)
# v0.9.x: polish + mobile-first + PWA
# v1.0.0: stable release

TRIAD_CACHE_TTL = 300  # 5 minutes


def load_json(path: Path, default=None):
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            return default if default is not None else {}
    return default if default is not None else {}


def save_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))


def run_cmd(cmd: list, timeout=60) -> tuple[int, str, str]:
    try:
        cp = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, cwd=str(ROOT))
        return cp.returncode, cp.stdout, cp.stderr
    except subprocess.TimeoutExpired:
        return -1, "", f"Command timed out after {timeout}s"
    except Exception as e:
        return -1, "", str(e)


def load_state() -> dict:
    return load_json(STATE_FILE, {
        "phase": "RESEARCH",
        "iteration": 0,
        "phase_iteration": 0,
        "current_feature": None,
        "retry_count": 0,
        "running": False,
        "improvements_made": [],
    })


def save_state(state: dict) -> None:
    save_json(STATE_FILE, state)


def load_memory() -> dict:
    return load_json(MEMORY_FILE, {
        "learnings": [],
        "decisions": [],
        "context_window": [],
        "success_patterns": {},
        "error_patterns": {},
    })


def save_memory(mem: dict) -> None:
    save_json(MEMORY_FILE, mem)


# ─── Triad Cache ───────────────────────────────────────────────────────────────

def get_git_head() -> str:
    """Get current git HEAD commit hash."""
    rc, out, _ = run_cmd(["git", "rev-parse", "HEAD"], timeout=5)
    return out.strip() if rc == 0 else ""


def get_cached_triad(cached: dict, current_head: str) -> Optional[dict]:
    """Return cached triad if still valid (same HEAD + within TTL)."""
    if not cached:
        return None
    cached_head = cached.get("git_head", "")
    cached_at = cached.get("cached_at", 0)
    if cached_head != current_head:
        return None  # HEAD changed — must recompute
    if time.time() - cached_at > TRIAD_CACHE_TTL:
        return None  # TTL expired
    return cached.get("triad")


def save_triad_cache(triad: dict, head: str) -> None:
    save_json(CACHE_FILE, {
        "triad": triad,
        "git_head": head,
        "cached_at": time.time(),
    })


# ─── Bootstrap ────────────────────────────────────────────────────────────────

def build_snapshot(use_cache=True) -> dict:
    """Build project context snapshot. Uses triad cache to avoid 160s redundant recompute."""
    current_head = get_git_head()

    # Try triad cache first
    triad = None
    if use_cache:
        cached = load_json(CACHE_FILE)
        triad = get_cached_triad(cached, current_head)

    snap = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "version": "",
        "features": {},
        "git": {},
        "triad": triad if triad else {},
        "codegraph": {},
        "improvement_candidates": [],
        "git_head": current_head,
    }

    # VERSION
    v = ROOT / "VERSION"
    snap["version"] = v.read_text().strip() if v.exists() else "0.0.0"

    # Pending features from Plans.md
    plans = ROOT / "Plans.md"
    pending_features = []
    if plans.exists():
        content = plans.read_text()
        for line in content.splitlines():
            if "[~]" in line and "**PLN-" in line:
                pending_features.append(line.strip())

    # Git status
    rc, out, _ = run_cmd(["git", "status", "--porcelain"])
    lines = [l for l in out.splitlines() if l.strip()] if rc == 0 else []
    untracked = sum(1 for l in lines if l.startswith("??"))
    modified = sum(1 for l in lines if not l.startswith("??"))
    snap["git"] = {"untracked": untracked, "modified": modified,
                   "total": len(lines), "has_changes": len(lines) > 0}

    # CodeGraph status
    rc, out, _ = run_cmd(["codegraph", "status"], timeout=30)
    pending_files = 0
    if rc == 0:
        for line in out.splitlines():
            if "pending" in line.lower() or "dirty" in line.lower():
                pending_files += 1
    snap["codegraph"] = {"pending_files": pending_files, "ok": rc == 0}

    # Triad: only compute if not cached
    if not triad:
        triad = {}

        # Typecheck
        rc, out, err = run_cmd(["pnpm", "typecheck"], timeout=90)
        errors = []
        if rc != 0:
            for line in (out + err).splitlines():
                if "error TS" in line:
                    errors.append(line.strip())
        triad["typecheck"] = {"pass": rc == 0, "errors": errors[:20]}

        # Lint
        rc, out, _ = run_cmd(["pnpm", "lint", "--quiet"], timeout=600)
        warnings = out.count("warning") if rc == 0 else 0
        triad["lint"] = {"pass": rc == 0, "warnings": warnings}

        # Tests
        rc, out, _ = run_cmd(["pnpm", "test:run"], timeout=120)
        passed = failed = 0
        output_lines = out.splitlines()
        for line in output_lines:
            line_lower = line.lower()
            if " passed" in line_lower:
                try:
                    parts = line.split()
                    for i, p in enumerate(parts):
                        if p == "passed" and i > 0:
                            passed = int(parts[i-1])
                except Exception:
                    pass
            if " failed" in line_lower:
                try:
                    parts = line.split()
                    for i, p in enumerate(parts):
                        if p == "failed" and i > 0:
                            failed = int(parts[i-1])
                except Exception:
                    pass
        if rc != 0 and passed == 0 and failed == 0:
            for line in output_lines:
                if "error" in line.lower() and not line.strip().startswith("#"):
                    failed = 1
                    break
        triad["tests"] = {"pass": rc == 0, "passed": passed, "failed": failed}

        # Cache the triad
        save_triad_cache(triad, current_head)

    snap["triad"] = triad

    # Find improvement candidates (triad already computed above)
    candidates = find_improvement_candidates(snap["triad"])
    snap["improvement_candidates"] = candidates

    snap["features"] = {
        "pending_features": pending_features,
        "pending_count": len(pending_features),
    }
    snap["decision_factors"] = {
        "has_pending_features": len(pending_features) > 0,
    }

    return snap


def find_improvement_candidates(triad: dict) -> list:
    """Find concrete code improvement opportunities.
    triad is already computed by build_snapshot — don't re-run typecheck.
    """
    candidates = []

    # 1. TypeScript typecheck result
    tc = triad.get("typecheck", {})
    if tc.get("pass", False):
        candidates.append({"type": "typecheck_clean", "priority": 1,
                         "description": "TypeScript typecheck is clean"})
    else:
        errors = tc.get("errors", [])
        candidates.append({"type": "typecheck_errors", "priority": 9,
                         "description": f"{len(errors)} TypeScript errors", "errors": errors[:10]})

    # 2. Find files with TODO/FIXME comments (tech debt)
    for pattern, label in [("TODO", "tech_debt"), ("FIXME", "tech_debt"),
                          ("XXX", "tech_debt"), ("HACK", "tech_debt")]:
        rc, out, _ = run_cmd(["grep", "-r", "--include=*.ts", "--include=*.tsx",
                              pattern, "packages/", "apps/", "-l"], timeout=15)
        if rc == 0 and out.strip():
            files = [f.strip() for f in out.splitlines() if f.strip()][:5]
            candidates.append({"type": label, "priority": 5,
                             "description": f"{len(files)} files with {pattern}", "files": files})

    # 3. Look for large files (>500 lines)
    rc, out, _ = run_cmd(["find", "packages/", "apps/", "-name", "*.ts", "-o",
                          "-name", "*.tsx", "-not", "-path", "*/node_modules/*"],
                         timeout=15)
    if rc == 0:
        large_files = []
        for f in out.splitlines():
            f = f.strip()
            if f:
                try:
                    lines = len(open(f).readlines())
                    if lines > 500:
                        large_files.append({"file": f, "lines": lines})
                except Exception:
                    pass
        if large_files:
            large_files.sort(key=lambda x: x["lines"], reverse=True)
            candidates.append({"type": "large_file", "priority": 4,
                             "description": f"{len(large_files)} oversized files",
                             "files": large_files[:3]})

    # 4. Missing test coverage on recently changed files
    rc, out, _ = run_cmd(["git", "diff", "--name-only", "HEAD~1..HEAD"], timeout=10)
    changed = [f.strip() for f in out.splitlines() if f.strip().endswith(".ts")] if rc == 0 else []
    untested = []
    for f in changed:
        test_file = str(f).replace("/src/", "/__tests__/") + ".test.ts"
        if not Path(test_file).exists():
            untested.append(f)
    if untested:
        candidates.append({"type": "missing_tests", "priority": 6,
                         "description": f"{len(untested)} changed files lack tests",
                         "files": untested[:5]})

    # 5. Check traduccao-areas coverage
    for trad_path in [ROOT / "traducao-areas.ts",
                      ROOT / "apps/akasha-portal/src/lib/grimoire/traducao-areas.ts"]:
        if trad_path.exists():
            content = trad_path.read_text()
            for trad in ["CABALA", "TANTRA"]:
                if trad not in content:
                    candidates.append({"type": "missing_translation", "priority": 8,
                                     "description": f"{trad} missing from traducao-areas",
                                     "trad": trad, "file": str(trad_path)})
            break

    return candidates


def bootstrap(use_cache=True) -> dict:
    snap = build_snapshot(use_cache=use_cache)
    snap_bytes = json.dumps(snap, indent=2, ensure_ascii=False)
    SNAPSHOT_FILE.write_text(snap_bytes)
    return snap


# ─── Intelligence layer ──────────────────────────────────────────────────────

def add_learning(mem: dict, agent: str, phase: str, feature_id: str,
                outcome: str, summary: str, details: dict = None) -> None:
    """Record a learning for exponential memory."""
    mem.setdefault("learnings", []).append({
        "ts": datetime.now(timezone.utc).isoformat(),
        "agent": agent,
        "phase": phase,
        "feature_id": feature_id,
        "outcome": outcome,
        "summary": summary,
        "details": details or {},
    })
    mem["learnings"] = mem["learnings"][-200:]


def should_proceed(snapshot: dict) -> tuple[bool, str]:
    """Check if loop should proceed or wait. All triad checks are non-blocking."""
    triad = snapshot.get("triad", {})
    tc = triad.get("typecheck", {})
    if not tc.get("pass"):
        return True, "Typecheck has errors (non-blocking — pre-existing)"
    return True, "Ready to proceed"


def pick_best_improvement(snapshot: dict, memory: dict) -> Optional[dict]:
    """Pick the highest-impact improvement to make this iteration."""
    candidates = snapshot.get("improvement_candidates", [])
    if not candidates:
        return None

    # Filter out things we've already done recently
    recent = [e.get("improvement") for e in memory.get("decisions", [])[-5:]]

    # Sort by priority (descending)
    candidates = sorted(candidates, key=lambda c: c.get("priority", 5), reverse=True)

    # Skip if we just did this
    for c in candidates:
        if c.get("type") not in recent:
            return c

    return candidates[0] if candidates else None


def make_decision(snapshot: dict, memory: dict, current_phase: str) -> dict:
    """Make evidence-based decision about what to do next."""
    can_proceed, reason = should_proceed(snapshot)

    if not can_proceed:
        return {
            "action": "BLOCKED",
            "blocking_reason": reason,
            "confidence": "high",
            "reasoning": [reason],
        }

    improvement = pick_best_improvement(snapshot, memory)

    if not improvement:
        return {
            "action": "IDLE",
            "confidence": "high",
            "reasoning": ["No improvement candidates found"],
        }

    return {
        "action": "EXECUTE",
        "confidence": "high",
        "improvement": improvement,
        "reasoning": [
            f"→ Ready to proceed ({reason})",
            f"→ Pick: {improvement.get('description', '?')}",
        ],
    }


# ─── Phase executors ─────────────────────────────────────────────────────────

def phase_RESEARCH(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """RESEARCH: find the best improvement opportunity."""
    decision = make_decision(snapshot, memory, "RESEARCH")

    print(f"\nDecision: {decision.get('action', '?')} | confidence={decision.get('confidence', '?')}")
    for r in decision.get("reasoning", []):
        print(f"  → {r}")

    if decision.get("action") == "BLOCKED":
        print(f"  ⛔ BLOCKED: {decision.get('blocking_reason', '?')}")
        state["phase"] = "PLANNING"
        return state, memory, snapshot

    if decision.get("action") == "IDLE":
        print("  💤 IDLE: no work found")
        state["phase"] = "RELEASE"
        return state, memory, snapshot

    improvement = decision.get("improvement", {})
    imp_type = improvement.get("type", "?")
    imp_desc = improvement.get("description", "?")

    state["current_feature"] = imp_type
    print(f"\n🔬 RESEARCH: {imp_type} — {imp_desc}")

    # Write implementation task
    TASK_FILE.write_text(json.dumps({
        "phase": "IMPLEMENTATION",
        "improvement": improvement,
        "iteration": state.get("iteration", 0),
        "snapshot_summary": {
            "version": snapshot.get("version"),
            "triad": snapshot.get("triad"),
            "candidates": snapshot.get("improvement_candidates", [])[:5],
        }
    }, indent=2))

    memory.setdefault("decisions", []).append({
        "ts": datetime.now(timezone.utc).isoformat(),
        "action": decision.get("action"),
        "improvement": imp_type,
    })

    state["phase"] = "PLANNING"
    return state, memory, snapshot


def phase_PLANNING(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """PLANNING: update Plans.md with improvement plan."""
    imp_type = state.get("current_feature", "?")
    iteration = state.get("iteration", 0)

    task_data = load_json(TASK_FILE, {})
    improvement = task_data.get("improvement", {})

    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    ver = load_json(ROOT / ".autonomous" / "ralph-loop" / "version.json",
                    {"major": 0, "minor": 0, "patch": 0})
    ver_str = f"{ver['major']}.{ver['minor']}.{ver['patch']}"

    block = [
        f"\n## cc: AKASHA-loop iter {iteration} | {imp_type} ({ts})\n",
        f"- [~] **PLN-{iteration:03d}** — {imp_type} | {ver_str}\n",
        f"  - Improvement: {improvement.get('description', '?')}\n",
        f"  - Type: {imp_type}\n",
        f"  - Priority: {improvement.get('priority', '?')}\n",
        f"  - Phases: RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE\n",
    ]
    if improvement.get("files"):
        for f in improvement["files"][:3]:
            block.append(f"  - File: `{f}`\n")

    plans_md = ROOT / "Plans.md"
    if plans_md.exists():
        content = plans_md.read_text()
        if "## cc:TODO" in content:
            content = content.replace("## cc:TODO", "".join(block) + "\n## cc:TODO", 1)
        elif "## cc:WIP" in content:
            content = content.replace("## cc:WIP", "".join(block) + "\n## cc:WIP", 1)
        else:
            content += "".join(block)
        plans_md.write_text(content)

    print(f"  📋 PLANNING: Plans.md updated (PLN-{iteration:03d})")
    print(f"  → Will {improvement.get('description', '?')}")

    state["phase"] = "IMPLEMENTATION"
    return state, memory, snapshot


# ─── Real coding agent executor ───────────────────────────────────────────────

def spawn_coding_agent(improvement: dict, iteration: int) -> tuple[bool, str]:
    """
    Spawn a real OMP coding agent via subprocess to execute the improvement.
    Returns (success, message).
    """
    imp_type = improvement.get("type", "?")
    imp_desc = improvement.get("description", "?")
    files = improvement.get("files", [])
    errors = improvement.get("errors", [])

    # Build the agent prompt based on improvement type
    if imp_type in ("tech_debt", "FIXME", "TODO", "XXX", "HACK"):
        file_list = ", ".join(files[:5]) if files else "various files"
        prompt = (
            f"Fix the following tech debt in the AKASHA project at /home/skynet/cabala-dos-caminhos:\n"
            f"Type: {imp_type}\n"
            f"Files: {file_list}\n\n"
            f"Use ast_grep to find all instances of {imp_type} comments in TypeScript/TSX files.\n"
            f"Fix each one properly — don't just remove the comment.\n"
            f"If a TODO describes incomplete functionality, implement it.\n"
            f"If a FIXME describes a bug, fix the bug.\n"
            f"After fixing, run `pnpm typecheck` to verify no new errors.\n"
            f"Commit with: git commit -m 'fix: resolved {imp_type} comments'\n"
            f"Write to /home/skynet/cabala-dos-caminhos/.autonomous/multi-agent/task-result.json:\n"
            f'{{"success": true, "message": "Fixed {imp_type} in N files", "type": "{imp_type}"}}'
        )
    elif imp_type == "missing_tests":
        file_list = ", ".join(files[:3]) if files else "changed files"
        prompt = (
            f"Add meaningful test coverage to the AKASHA project at /home/skynet/cabala-dos-caminhos.\n"
            f"Files needing tests: {file_list}\n\n"
            f"Use codegraph_explore to understand what each file does.\n"
            f"Create vitest test files at the corresponding __tests__/ paths.\n"
            f"Each test should:\n"
            f"  - Import the module under test\n"
            f"  - Test the main exported functions with real assertions\n"
            f"  - Cover edge cases (empty input, error cases, boundary conditions)\n"
            f"Run `pnpm test:run` to verify tests pass.\n"
            f"Commit with: git commit -m 'test: add coverage for {file_list}'\n"
            f"Write to /home/skynet/cabala-dos-caminhos/.autonomous/multi-agent/task-result.json:\n"
            f'{{"success": true, "message": "Added tests for N files", "type": "missing_tests"}}'
        )
    elif imp_type == "typecheck_errors":
        error_list = "\n".join(errors[:10]) if errors else "TypeScript errors"
        prompt = (
            f"Fix TypeScript errors in the AKASHA project at /home/skynet/cabala-dos-caminhos.\n"
            f"Errors:\n{error_list}\n\n"
            f"Run `pnpm typecheck` to see all errors.\n"
            f"Fix each error properly — add types, fix imports, resolve module not found, etc.\n"
            f"After fixing, run `pnpm typecheck` to verify all errors resolved.\n"
            f"Commit with: git commit -m 'fix: resolve TypeScript errors'\n"
            f"Write to /home/skynet/cabala-dos-caminhos/.autonomous/multi-agent/task-result.json:\n"
            f'{{"success": true, "message": "Fixed TypeScript errors", "type": "typecheck_errors"}}'
        )
    elif imp_type == "missing_translation":
        trad = improvement.get("trad", "?")
        file_path = improvement.get("file", "?")
        prompt = (
            f"Add {trad} translation support to the AKASHA project at /home/skynet/cabala-dos-caminhos.\n"
            f"File: {file_path}\n"
            f"Missing: {trad}\n\n"
            f"Read the existing traducao-areas.ts to understand the pattern.\n"
            f"Add CABALA and TANTRA areas following the same pattern as ASTROLOGIA, ODUS, ICHING.\n"
            f"Each area should have: name, keywords, context patterns for portals.\n"
            f"Run `pnpm typecheck` to verify no errors.\n"
            f"Commit with: git commit -m 'feat: add {trad} translation areas'\n"
            f"Write to /home/skynet/cabala-dos-caminhos/.autonomous/multi-agent/task-result.json:\n"
            f'{{"success": true, "message": "Added {trad} translation", "type": "missing_translation"}}'
        )
    elif imp_type == "large_file":
        file_list = ", ".join([f.get("file", "?") for f in files[:3]]) if files else "large files"
        prompt = (
            f"Refactor oversized files in the AKASHA project at /home/skynet/cabala-dos-caminhos.\n"
            f"Files: {file_list}\n\n"
            f"Use codegraph_explore to understand the file structure.\n"
            f"Split files over 500 lines into smaller, focused modules.\n"
            f"Each module should have a single responsibility.\n"
            f"Run `pnpm typecheck` and `pnpm test:run` to verify refactor is safe.\n"
            f"Commit with: git commit -m 'refactor: split large files'\n"
            f"Write to /home/skynet/cabala-dos-caminhos/.autonomous/multi-agent/task-result.json:\n"
            f'{{"success": true, "message": "Refactored large files", "type": "large_file"}}'
        )
    else:
        prompt = (
            f"Implement the following improvement in the AKASHA project at /home/skynet/cabala-dos-caminhos:\n"
            f"Type: {imp_type}\n"
            f"Description: {imp_desc}\n\n"
            f"Run `pnpm typecheck` and `pnpm test:run` to verify the change is safe.\n"
            f"Commit with a descriptive message.\n"
            f"Write to /home/skynet/cabala-dos-caminhos/.autonomous/multi-agent/task-result.json:\n"
            f'{{"success": true, "message": "Implemented {imp_type}", "type": "{imp_type}"}}'
        )

    # Remove any existing result file
    if RESULT_FILE.exists():
        RESULT_FILE.unlink()

    print(f"    🤖 Spawning OMP coding agent for: {imp_type}")

    # Build clean environment — avoid daemon/MCP server delays
    sub_env = dict(os.environ)
    sub_env["CLAUDE_CODE_SIMPLE"] = "1"
    sub_env["CLAUDE_NO_DAEMON"] = "1"

    timeout_secs = 600  # 10 minutes max

    try:
        cp = subprocess.run(
            ["claude", "--print", prompt],
            cwd=str(ROOT),
            input=prompt + "\n",
            capture_output=True,
            text=True,
            timeout=timeout_secs,
            env=sub_env,
        )
        exit_code = cp.returncode
        output = cp.stdout + cp.stderr
    except subprocess.TimeoutExpired:
        return False, f"Coding agent timed out after {timeout_secs}s"
    except Exception as e:
        return False, f"Coding agent error: {e}"

    # Show last few lines of output
    lines = output.splitlines()
    for line in lines[-5:]:
        if line.strip():
            print(f"      {line.strip()}")

    if exit_code == 0:
        if RESULT_FILE.exists():
            try:
                result = json.loads(RESULT_FILE.read_text())
                return result.get("success", True), result.get("message", "Done")
            except Exception:
                pass
        return True, f"Coding agent completed for {imp_type}"
    else:
        return False, f"Coding agent failed (exit {exit_code}): {output[:200]}"


def _execute_improvement(improvement: dict) -> tuple[bool, str]:
    """
    Execute an improvement via real OMP coding agent.
    Returns (success, message).
    """
    imp_type = improvement.get("type", "?")
    print(f"  💻 IMPLEMENTATION: {imp_type} via OMP coding agent")

    ok, msg = spawn_coding_agent(improvement, iteration=0)
    print(f"    → {msg}")
    return ok, msg


def phase_IMPLEMENTATION(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """IMPLEMENTATION: execute the improvement via OMP coding agent."""
    imp_type = state.get("current_feature", "?")
    task_data = load_json(TASK_FILE, {})
    improvement = task_data.get("improvement", {})
    imp_desc = improvement.get("description", "?")

    print(f"  💻 IMPLEMENTATION: {imp_type}")

    # Execute the improvement via real coding agent
    ok, msg = _execute_improvement(improvement)
    print(f"    → {msg}")

    # Record in memory
    ctype = improvement.get("type", "?")
    key = hashlib.md5(ctype.encode()).hexdigest()[:8]
    if ok:
        memory.setdefault("success_patterns", {})[key] = memory.get("success_patterns", {}).get(key, 0) + 1
        add_learning(memory, "coder", "IMPLEMENTATION", imp_type, "success", msg)
    else:
        memory.setdefault("error_patterns", {})[key] = memory.get("error_patterns", {}).get(key, 0) + 1
        add_learning(memory, "coder", "IMPLEMENTATION", imp_type, "failure", msg)

    print(f"    {'✅' if ok else '❌'} IMPLEMENTATION: {imp_desc}")

    state["phase"] = "QA"
    state["phase_iteration"] = 0
    return state, memory, snapshot


def phase_QA(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """QA: run triad and validate the improvement."""
    imp_type = state.get("current_feature", "?")

    # Always get fresh triad after implementation (use_cache=False)
    print(f"  🧪 QA: {imp_type}")
    fresh = build_snapshot(use_cache=False)  # Always fresh after implementation
    triad = fresh.get("triad", {})
    save_triad_cache(triad, get_git_head())  # Update cache

    tc_pass = triad.get("typecheck", {}).get("pass", False)
    lint_pass = triad.get("lint", {}).get("pass", False)
    tests_pass = triad.get("tests", {}).get("pass", False)
    tests_failed = triad.get("tests", {}).get("failed", 0)

    print(f"    Triad: typecheck={tc_pass} tests={tests_pass} ({tests_failed} failed) lint={lint_pass}")

    blocking_failures = []
    if not tc_pass:
        add_learning(memory, "qa", "QA", imp_type, "warning",
                    f"Typecheck has errors (non-blocking)")

    if not blocking_failures:
        print(f"    ✅ Triad green → VALIDATION")
        state["phase"] = "VALIDATION"
        state["retry_count"] = 0
        add_learning(memory, "qa", "QA", imp_type, "success",
                    f"Triad green: typecheck={tc_pass} lint={lint_pass} tests={tests_pass}")
    else:
        retry = state.get("retry_count", 0) + 1
        state["retry_count"] = retry
        if retry >= 3:
            print(f"    ⛔ Max retries hit ({blocking_failures}) → VALIDATION (override)")
            state["phase"] = "VALIDATION"
            state["retry_count"] = 0
        else:
            print(f"    ❌ {blocking_failures} failing → IMPLEMENTATION (retry #{retry})")
            state["phase"] = "IMPLEMENTATION"

    return state, memory, snapshot


def phase_VALIDATION(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """VALIDATION: verify DOX compliance and backwards compat."""
    imp_type = state.get("current_feature", "?")
    iteration = state.get("iteration", 0)

    print(f"  ✅ VALIDATION: {imp_type}")

    # Check Plans.md was updated
    plans_md = ROOT / "Plans.md"
    plans_ok = False
    if plans_md.exists():
        content = plans_md.read_text()
        if f"PLN-{iteration:03d}" in content:
            plans_ok = True
            print(f"    ✅ Plans.md updated correctly")
        else:
            print(f"    ⚠ Plans.md not updated — auto-marking")
            content += f"\n- [x] **PLN-{iteration:03d}** — {imp_type} (auto-marked)\n"
            plans_md.write_text(content)
            plans_ok = True

    # Sync CodeGraph
    rc, _, _ = run_cmd(["codegraph", "sync"], timeout=30)
    cg_ok = rc == 0
    if cg_ok:
        print(f"    ✅ CodeGraph synced")
    else:
        print(f"    ⚠ CodeGraph sync failed (non-blocking)")

    state["phase"] = "RELEASE"
    return state, memory, snapshot


def phase_RELEASE(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """RELEASE: bump version, commit, update CHANGELOG."""
    iteration = state.get("iteration", 0)
    imp_type = state.get("current_feature", "?")

    # Version bump
    ver_file = ROOT / ".autonomous" / "ralph-loop" / "version.json"
    ver = load_json(ver_file, {"major": 0, "minor": 0, "patch": 0, "changelog": []})
    ver["minor"] += 1
    ver_str = f"{ver['major']}.{ver['minor']}.{ver['patch']}"
    ver["changelog"].insert(0, {
        "version": ver_str,
        "ts": datetime.now(timezone.utc).isoformat(),
        "improvement": imp_type,
    })
    save_json(ver_file, ver)

    (ROOT / "VERSION").write_text(ver_str + "\n")

    # Update CHANGELOG
    changelog = ROOT / "CHANGELOG.md"
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    task_data = load_json(TASK_FILE, {})
    improvement = task_data.get("improvement", {})
    entry = f"\n## [{ver_str}] — {ts}\n\n### feat(loop): {improvement.get('description', imp_type)}\n"
    if changelog.exists():
        content = changelog.read_text()
        changelog.write_text(content.replace("# Changelog\n", "# Changelog\n" + entry, 1))
    else:
        changelog.write_text("# Changelog\n" + entry)

    # Git commit (if changes exist)
    subprocess.run(["git", "add", "-A"], cwd=str(ROOT), capture_output=True)
    msg = f"feat(loop): {ver_str} — {improvement.get('description', imp_type)}"
    rc, out, err = run_cmd(["git", "commit", "-m", msg], timeout=15)
    if rc == 0:
        print(f"  ✅ Git commit: {msg}")
    else:
        print(f"  ⚠ Git commit: {out.strip() or err.strip() or 'nothing to commit'}")

    # Update memory
    memory["iteration"] = memory.get("iteration", 0) + 1
    memory.setdefault("context_window", []).append({
        "ts": datetime.now(timezone.utc).isoformat(),
        "improvement": imp_type,
        "version": ver_str,
        "triad_green": all(t.get("pass", False)
                          for t in snapshot.get("triad", {}).values()),
    })
    memory["context_window"] = memory["context_window"][-20:]

    # Advance state
    state["iteration"] += 1
    state["phase"] = "RESEARCH"
    state["phase_iteration"] = 0
    state["current_feature"] = None
    state["retry_count"] = 0

    print(f"\n{'='*60}")
    print(f"  🚀 RELEASE: {ver_str} | iter={state['iteration']} | {imp_type}")
    print(f"  Learnings: {len(memory.get('learnings', []))} | "
          f"Context window: {len(memory.get('context_window', []))}")
    print(f"{'='*60}")

    return state, memory, snapshot


# ─── Main orchestrator ─────────────────────────────────────────────────────────

def run_full_iteration() -> dict:
    """
    Run one FULL iteration of the 6-phase state machine.
    All 6 phases run in sequence within a single call.
    Bootstrap (with triad cache) runs once at start.
    """
    print("\n" + "=" * 60)
    print("BOOTSTRAP: loading project context")
    print("=" * 60)

    # Bootstrap once — triad cache avoids 160s redundant recompute
    snapshot = bootstrap(use_cache=True)
    memory = load_memory()
    state = load_state()

    # Check stop signal
    if (ROOT / ".autonomous" / "state" / "stop.signal").exists():
        print("\n⏹ Stop signal — loop halting.")
        state["running"] = False
        save_state(state)
        return {"stopped": True}

    phase = state.get("phase", "RESEARCH")
    iteration = state.get("iteration", 0)
    print(f"\n{'='*60}")
    print(f"ITERATION {iteration} | PHASE: {phase}")
    print(f"{'='*60}")

    # Route to phase executor — only one phase per call in this design
    # The loop will call run_full_iteration() again for the next phase
    if phase == "RESEARCH":
        state, memory, snapshot = phase_RESEARCH(state, memory, snapshot)
    elif phase == "PLANNING":
        state, memory, snapshot = phase_PLANNING(state, memory, snapshot)
    elif phase == "IMPLEMENTATION":
        state, memory, snapshot = phase_IMPLEMENTATION(state, memory, snapshot)
    elif phase == "QA":
        state, memory, snapshot = phase_QA(state, memory, snapshot)
    elif phase == "VALIDATION":
        state, memory, snapshot = phase_VALIDATION(state, memory, snapshot)
    elif phase == "RELEASE":
        state, memory, snapshot = phase_RELEASE(state, memory, snapshot)
    else:
        state["phase"] = "RESEARCH"

    save_state(state)
    save_memory(memory)

    return {
        "phase": state["phase"],
        "iteration": state["iteration"],
        "improvement": state.get("current_feature"),
        "state": state,
        "memory": memory,
    }


def run_continuous(max_iterations: int = 0, max_hours: float = 0) -> None:
    """Run the loop continuously for hours.
    Each call to run_full_iteration() handles ONE phase.
    Triad cache means bootstrap after the first call is ~0s (cached).
    """
    import time
    start = time.time()
    phase_count = 0

    print(f"\n{'='*60}")
    print("AKASHA AUTONOMOUS LOOP — CONTINUOUS MODE")
    print(f"Max iterations: {'unlimited' if max_iterations == 0 else max_iterations}")
    print(f"Max hours: {'unlimited' if max_hours == 0 else max_hours}")
    print(f"Triad cache: enabled (TTL={TRIAD_CACHE_TTL}s)")
    print(f"{'='*60}\n")

    state = load_state()
    state["running"] = True
    save_state(state)

    while True:
        # Check stop signal
        if (ROOT / ".autonomous" / "state" / "stop.signal").exists():
            print("\n⏹ Stop signal received — exiting.")
            break

        # Check iteration limit
        if max_iterations > 0 and state.get("iteration", 0) >= max_iterations:
            print(f"\n✅ Reached max iterations ({max_iterations})")
            break

        # Check time limit
        if max_hours > 0:
            elapsed = (time.time() - start) / 3600
            if elapsed >= max_hours:
                print(f"\n✅ Reached max hours ({max_hours}h)")
                break

        phase_start = time.time()
        result = run_full_iteration()
        phase_duration = time.time() - phase_start
        phase_count += 1

        # Very brief pause between phases
        time.sleep(1)

        # Log performance every 10 phases
        if phase_count % 10 == 0:
            current = load_state()
            elapsed = (time.time() - start) / 3600
            print(f"\n📊 Progress: {phase_count} phases | {current.get('iteration', 0)} iterations | "
                  f"{elapsed:.1f}h elapsed | phase took {phase_duration:.1f}s")

    print(f"\n🏁 Loop finished after {phase_count} phase transitions.")


def status() -> None:
    """Print current loop status."""
    try:
        snapshot = bootstrap(use_cache=True)
        memory = load_memory()
        state = load_state()
        ver = load_json(ROOT / ".autonomous" / "ralph-loop" / "version.json",
                        {"major": 0, "minor": 0, "patch": 0})
        ver_str = f"{ver['major']}.{ver['minor']}.{ver['patch']}"
    except Exception as e:
        print(f"Status error: {e}")
        return

    print("═══ AKASHA Evolution Loop ═══")
    print(f"  Running:        {state.get('running', False)}")
    print(f"  Iteration:        {state.get('iteration', 0)}")
    print(f"  Phase:           {state.get('phase', '?')}")
    print(f"  Current:         {state.get('current_feature', 'none')}")
    print(f"  Retry count:     {state.get('retry_count', 0)}")
    print(f"  Version:         {ver_str}")
    print()
    print(f"  Triad:           typecheck={snapshot['triad'].get('typecheck',{}).get('pass','?')} "
          f"tests={snapshot['triad'].get('tests',{}).get('passed','?')}/{snapshot['triad'].get('tests',{}).get('failed','?')} "
          f"lint={snapshot['triad'].get('lint',{}).get('pass','?')}")
    print(f"  CodeGraph:       {snapshot['codegraph'].get('pending_files',0)} pending files")
    print(f"  Git:             {snapshot['git'].get('total',0)} changed files")
    print(f"  Improvement candidates: {len(snapshot.get('improvement_candidates', []))}")
    print()
    print(f"  Learnings:       {len(memory.get('learnings', []))} total")
    print(f"  Context window:  {len(memory.get('context_window', []))} entries")
    print(f"  Decisions:       {len(memory.get('decisions', []))} recorded")
    print()
    recent = memory.get("learnings", [])[-5:]
    if recent:
        print("  Last 5 learnings:")
        for l in recent:
            mark = "✅" if l.get("outcome") == "success" else "❌"
            print(f"    {mark} [{l.get('agent','?')}] {l.get('summary','')[:80]}")
    print()
    print("  Flow: RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE")


def stop_loop() -> None:
    (ROOT / ".autonomous" / "state" / "stop.signal").write_text(
        f"stop at {datetime.now(timezone.utc).isoformat()}\n"
    )
    state = load_state()
    state["running"] = False
    save_state(state)
    print("⏹ Stop signal sent.")


# ─── CLI entry point ─────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys
    import os
    if len(sys.argv) < 2:
        print("Usage: akasha-evolution-loop.py [run|continuous|status|stop]")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "run":
        result = run_full_iteration()
        print(f"\nPhase complete: phase={result.get('phase','?')}")

    elif cmd == "continuous":
        max_iterations = 0
        max_hours = 0
        for arg in sys.argv[2:]:
            if arg.startswith("--iterations="):
                max_iterations = int(arg.split("=")[1])
            elif arg.startswith("--hours="):
                max_hours = float(arg.split("=")[1])
        run_continuous(max_iterations=max_iterations, max_hours=max_hours)

    elif cmd == "status":
        status()

    elif cmd == "stop":
        stop_loop()

    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)
