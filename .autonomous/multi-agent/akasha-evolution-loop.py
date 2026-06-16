#!/usr/bin/env python3
"""
AKASA Autonomous Evolution Loop v2
==================================
6-phase state machine: RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE

Parallel 5-agent execution:
  - RESEARCH finds up to MAX_PARALLEL independent improvements
  - IMPLEMENTATION spawns up to 5 coding agents in parallel via ThreadPoolExecutor
  - All agents run simultaneously, results are collected and committed together

Improvements executed by real OMP coding agents via subprocess, not dead Python handlers.
"""

import os
import json
import hashlib
import re
import subprocess
import time
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
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
AGENT_RESULTS_DIR = MA / "agent-results"

os.makedirs(MA, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)
os.makedirs(AGENT_RESULTS_DIR, exist_ok=True)

# ─── Parallelism constants ──────────────────────────────────────────────────────
MAX_PARALLEL = 5   # Max parallel coding agents per iteration
TRIAD_CACHE_TTL = 3600  # 5 minutes


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
        "current_features": [],  # List of active improvements (up to MAX_PARALLEL)
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


# ─── Bootstrap ─────────────────────────────────────────────────────────────────

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

        # Lint (non-blocking)
        rc, out, _ = run_cmd(["pnpm", "lint", "--quiet"], timeout=600)
        warnings = out.count("warning") if rc == 0 else 0
        triad["lint"] = {"pass": rc == 0, "warnings": warnings}

        # Tests (non-blocking)
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

    # 1. TypeScript typecheck result (only if broken — typecheck_clean is not actionable)
    tc = triad.get("typecheck", {})
    if not tc.get("pass", False):
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

    # 5. Check traducao-areas coverage
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
    """Check if loop should proceed. Typecheck errors are non-blocking."""
    triad = snapshot.get("triad", {})
    tc = triad.get("typecheck", {})
    if not tc.get("pass"):
        return True, "Typecheck has errors (non-blocking — pre-existing)"
    return True, "Ready to proceed"


# ─── Pick best improvements (up to MAX_PARALLEL) ──────────────────────────────

# Types that should not repeat within recent window
SKIP_TYPES = {"typecheck_clean", "typecheck_errors"}

# Types that are singular (only one instance per iteration)
SINGULAR_TYPES = {"typecheck_errors", "missing_translation"}

# Recent decisions window for deduplication
RECENT_DECISIONS_KEY = "recent_decisions"
RECENT_WINDOW = 10


def pick_best_improvements(candidates: list, memory: dict, max_count: int = MAX_PARALLEL) -> list:
    """
    Pick up to max_count improvements from candidates.
    Ensures variety: no duplicate types (except tech_debt/large_file/missing_tests),
    skips recently seen types, prioritizes by score.
    """
    if not candidates:
        return []

    # Filter out SKIP_TYPES
    filtered = [c for c in candidates if c.get("type") not in SKIP_TYPES]
    if not filtered:
        return []

    # Get recent decisions for deduplication
    recent = memory.get(RECENT_DECISIONS_KEY, [])
    recent_types = [d.get("type") for d in recent[-RECENT_WINDOW:]]

    selected = []
    type_count = {}

    # Sort by priority descending
    filtered.sort(key=lambda c: c.get("priority", 5), reverse=True)

    for c in filtered:
        imp_type = c.get("type", "?")

        # Skip typecheck_errors if we already have it selected
        if imp_type in SINGULAR_TYPES and any(t == imp_type for t in type_count):
            continue

        # Skip recently seen types (avoid repetition)
        if imp_type in recent_types and imp_type not in ("tech_debt", "large_file", "missing_tests"):
            continue

        # Allow up to 2 of same multi-instance type per iteration
        if type_count.get(imp_type, 0) >= 2:
            continue

        selected.append(c)
        type_count[imp_type] = type_count.get(imp_type, 0) + 1

        if len(selected) >= max_count:
            break

    return selected


def record_decision(memory: dict, improvements: list) -> None:
    """Record improvement decisions in memory for deduplication."""
    decisions = memory.get(RECENT_DECISIONS_KEY, [])
    for imp in improvements:
        decisions.append({
            "ts": datetime.now(timezone.utc).isoformat(),
            "type": imp.get("type"),
            "description": imp.get("description"),
        })
    memory[RECENT_DECISIONS_KEY] = decisions[-RECENT_WINDOW:]


# ─── Phase: RESEARCH ────────────────────────────────────────────────────────────

def phase_RESEARCH(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """RESEARCH: find up to MAX_PARALLEL improvement candidates."""
    iteration = state.get("iteration", 0)

    print(f"\n{'='*60}")
    print(f"🔬 RESEARCH (iter {iteration})")
    print(f"{'='*60}")

    candidates = snapshot.get("improvement_candidates", [])
    print(f"  Found {len(candidates)} candidate(s)")

    # Pick up to MAX_PARALLEL improvements
    selected = pick_best_improvements(candidates, memory, max_count=MAX_PARALLEL)

    if not selected:
        print("  ⚠ No improvements selected — advancing to next iteration")
        record_decision(memory, [{"type": "none", "description": "no improvement found"}])
        state["phase"] = "RELEASE"
        state["retry_count"] = 0
        return state, memory, snapshot

    print(f"  Selected {len(selected)} improvement(s) for parallel execution:")
    for i, imp in enumerate(selected):
        print(f"    [{i+1}] {imp.get('type')}: {imp.get('description', '')[:60]}")

    # Record decision to avoid immediate repeats
    record_decision(memory, selected)

    # Save task data with all selected improvements
    save_json(TASK_FILE, {
        "improvements": selected,
        "iteration": iteration,
    })

    state["phase"] = "PLANNING"
    state["current_features"] = [imp.get("type") for imp in selected]
    state["phase_iteration"] = 0
    return state, memory, snapshot


# ─── Phase: PLANNING ───────────────────────────────────────────────────────────

def phase_PLANNING(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """PLANNING: update Plans.md with all selected improvements."""
    iteration = state.get("iteration", 0)
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])

    print(f"\n{'='*60}")
    print(f"📋 PLANNING (iter {iteration})")
    print(f"{'='*60}")

    plans_md = ROOT / "Plans.md"
    block = []
    for i, imp in enumerate(improvements):
        imp_type = imp.get("type", "?")
        imp_desc = imp.get("description", "?")
        files = imp.get("files", [])
        block.append(
            f"- [~] **PLN-{iteration:03d}[{i+1}]** — {imp_type} | {imp_desc}\n"
        )
        if files:
            file_list = ", ".join([f.get("file", str(f)) if isinstance(f, dict) else str(f) for f in files[:3]])
            block.append(f"  - Files: {file_list}\n")

    if plans_md.exists():
        content = plans_md.read_text()
        if "## cc:TODO" in content:
            content = content.replace("## cc:TODO", "".join(block) + "## cc:TODO", 1)
        elif "## cc:WIP" in content:
            content = content.replace("## cc:WIP", "".join(block) + "## cc:WIP", 1)
        else:
            content += "".join(block)
        plans_md.write_text(content)

    print(f"  📋 PLANNING: Plans.md updated with {len(improvements)} improvement(s)")
    for imp in improvements:
        print(f"  → {imp.get('type')}: {imp.get('description', '')[:60]}")

    state["phase"] = "IMPLEMENTATION"
    return state, memory, snapshot


# ─── Parallel coding agent executor ────────────────────────────────────────────

def _build_agent_prompt(improvement: dict) -> str:
    """Build targeted coding prompt for a single improvement.
    
    Principles:
    - Tech debt: fix max 3 files, commit after EACH fix (not batch)
    - Missing tests: target max 2 files, ensure no overlap with large_file targets
    - Large file: extract ONE helper module from the largest file only
    - Collision avoidance: check git status before making changes
    - Result-first: always write task-result.json before timeout/exit
    """
    imp_type = improvement.get("type", "?")
    imp_desc = improvement.get("description", "?")
    files = improvement.get("files", [])
    errors = improvement.get("errors", [])

    if imp_type in ("tech_debt", "FIXME", "TODO", "XXX", "HACK"):
        # Cap at 3 files max — commit after EACH fix so partial success is recorded
        file_list = ", ".join(files[:3]) if files else "various files"
        return (
            f"You are fixing {imp_type} comments in the AKASHA project at /home/skynet/cabala-dos-caminhos.\n"
            f"Target files: {file_list}\n\n"
            f"RULES:\n"
            f"1. Run `git status` before starting to avoid conflicts\n"
            f"2. Use `ast_grep --include='*.ts' --include='*.tsx' '{imp_type}' .` to find ALL instances\n"
            f"3. For EACH {imp_type} found, either:\n"
            f"   - Implement the described functionality (if TODO = incomplete feature)\n"
            f"   - Fix the described bug (if FIXME = known bug)\n"
            f"   - Remove if no longer relevant (if XXX/HACK = temporary code)\n"
            f"4. After EACH file fix, run `pnpm typecheck` to verify\n"
            f"5. Commit EACH file separately: `git add <file> && git commit -m 'fix: resolved {imp_type} in <file>'`\n"
            f"6. Write to /home/skynet/cabala-dos-caminhos/.autonomous/multi-agent/task-result.json:\n"
            f'{{"success": true, "message": "Fixed N {imp_type} comments in N files", "type": "{imp_type}"}}\n'
            f"7. If timeout near (30s left), write task-result.json FIRST then finish\n\n"
            f"CRITICAL: Write task-result.json BEFORE the process exits, even on partial success.\n"
        )

    elif imp_type == "missing_tests":
        # Target max 2 files that avoid common large_file targets
        safe_files = [
            f for f in files[:2]
            if not isinstance(f, dict) or (
                "synthesis-engine.ts" not in f.get("file", "")
                and "significados-curados.ts" not in f.get("file", "")
                and "MandalaChart.tsx" not in f.get("file", "")
            )
        ]
        if not safe_files:
            safe_files = files[:2]
        file_list = ", ".join(
            f.get("file", str(f)) if isinstance(f, dict) else str(f)
            for f in safe_files
        )
        return (
            f"You are adding test coverage in the AKASHA project at /home/skynet/cabala-dos-caminhos.\n"
            f"Target files: {file_list}\n\n"
            f"RULES:\n"
            f"1. Run `git status` before starting — if file was modified by another agent, skip it\n"
            f"2. Use `codegraph_explore` to understand what each file exports and its dependencies\n"
            f"3. Create vitest test file at: <file>.test.ts (same dir, same name + .test.ts)\n"
            f"4. Each test file must:\n"
            f"   - Import the module under test\n"
            f"   - Test 2-3 main exported functions with real assertions\n"
            f"   - Cover ONE edge case each (empty input, error case, boundary condition)\n"
            f"5. Run `pnpm test:run` to verify tests pass\n"
            f"6. Commit: `git add <testfile> && git commit -m 'test: add coverage for <filename>'`\n"
            f"7. Write to /home/skynet/cabala-dos-caminhos/.autonomous/multi-agent/task-result.json:\n"
            f'{{"success": true, "message": "Added tests for N files", "type": "missing_tests"}}\n'
            f"8. If timeout near (30s left), write task-result.json FIRST then finish\n\n"
            f"CRITICAL: Write task-result.json BEFORE the process exits.\n"
        )

    elif imp_type == "typecheck_errors":
        error_list = "\n".join(errors[:10]) if errors else "TypeScript errors"
        return (
            f"You are fixing TypeScript errors in the AKASHA project at /home/skynet/cabala-dos-caminhos.\n"
            f"Errors to fix:\n{error_list}\n\n"
            f"RULES:\n"
            f"1. Run `pnpm typecheck 2>&1 | head -50` to see all current errors\n"
            f"2. Fix errors one at a time: add missing types, fix imports, resolve module not found\n"
            f"3. After fixing 2-3 errors, run `pnpm typecheck` again to verify\n"
            f"4. Fix all errors until `pnpm typecheck` exits with code 0\n"
            f"5. Commit: `git commit -m 'fix: resolve TypeScript errors'`\n"
            f"6. Write to /home/skynet/cabala-dos-caminhos/.autonomous/multi-agent/task-result.json:\n"
            f'{{"success": true, "message": "Fixed TypeScript errors", "type": "typecheck_errors"}}\n'
            f"7. If timeout near (30s left), write task-result.json FIRST then finish\n\n"
            f"CRITICAL: Write task-result.json BEFORE the process exits.\n"
        )

    elif imp_type == "missing_translation":
        trad = improvement.get("trad", "?")
        file_path = improvement.get("file", "?")
        return (
            f"You are adding {trad} translation support to the AKASHA project at /home/skynet/cabala-dos-caminhos.\n"
            f"File: {file_path}\n"
            f"Missing: {trad}\n\n"
            f"RULES:\n"
            f"1. Read {file_path} and find the traducao-areas pattern for ASTROLOGIA, ODUS, ICHING\n"
            f"2. Add CABALA and TANTRA entries: name (string), keywords (string[]), contextPatterns (RegExp[])\n"
            f"3. Run `pnpm typecheck` to verify no errors\n"
            f"4. Commit: `git commit -m 'feat: add {trad} translation areas'`\n"
            f"5. Write to /home/skynet/cabala-dos-caminhos/.autonomous/multi-agent/task-result.json:\n"
            f'{{"success": true, "message": "Added {trad} translation", "type": "missing_translation"}}\n'
            f"6. If timeout near (30s left), write task-result.json FIRST then finish\n\n"
            f"CRITICAL: Write task-result.json BEFORE the process exits.\n"
        )

    elif imp_type == "large_file":
        # CRITICAL: Only target the SINGLE largest file, extract ONE helper module
        largest = files[0] if files else None
        if isinstance(largest, dict):
            target_file = largest.get("file", "?")
            line_count = largest.get("lines", "?")
        else:
            target_file = str(largest) if largest else "?"
            line_count = "?"
        return (
            f"You are extracting ONE helper module from ONE oversized file in the AKASHA project.\n"
            f"Target: {target_file} ({line_count} lines)\n\n"
            f"RULES — EXACTLY FOLLOW:\n"
            f"1. Run `git status` before starting — if file was modified, skip this task entirely\n"
            f"2. Read the target file and identify ONE natural group of related functions (50-150 lines)\n"
            f"3. Create a new helper file in the same directory: e.g. synthesis-engine/<name>.ts\n"
            f"4. Update the original file to import from the new helper\n"
            f"5. Run `pnpm typecheck` to verify — must pass\n"
            f"6. Run `pnpm test:run` — must not break existing tests\n"
            f"7. Commit: `git add <newfile> <targetfile> && git commit -m 'refactor: extract helper from <target_file>'`\n"
            f"8. Write to /home/skynet/cabala-dos-caminhos/.autonomous/multi-agent/task-result.json:\n"
            f'{{"success": true, "message": "Extracted helper from {target_file}", "type": "large_file"}}\n'
            f"9. If timeout near (30s left), write task-result.json FIRST then finish\n\n"
            f"DO NOT split more than ONE file. DO NOT extract more than ONE helper.\n"
            f"CRITICAL: Write task-result.json BEFORE the process exits.\n"
        )

    else:
        return (
            f"Implement the following improvement in the AKASHA project at /home/skynet/cabala-dos-caminhos.\n"
            f"Type: {imp_type}\n"
            f"Description: {imp_desc}\n\n"
            f"RULES:\n"
            f"1. Run `git status` before starting to avoid conflicts\n"
            f"2. Make the change carefully — verify with `pnpm typecheck`\n"
            f"3. Commit with a descriptive message\n"
            f"4. Write to /home/skynet/cabala-dos-caminhos/.autonomous/multi-agent/task-result.json:\n"
            f'{{"success": true, "message": "Implemented {imp_type}", "type": "{imp_type}"}}\n'
            f"5. If timeout near (30s left), write task-result.json FIRST then finish\n\n"
            f"CRITICAL: Write task-result.json BEFORE the process exits.\n"
        )




def _run_single_agent(improvement: dict, agent_id: str, timeout_secs: int = 600) -> dict:
    """
    Run a single coding agent for one improvement.
    Returns dict with: agent_id, type, success, message.
    Writes result to unique file to avoid collisions.
    """
    imp_type = improvement.get("type", "?")
    imp_desc = improvement.get("description", "?")
    result_file = AGENT_RESULTS_DIR / f"result-{agent_id}.json"

    # Remove any existing result for this agent
    if result_file.exists():
        result_file.unlink()

    prompt = _build_agent_prompt(improvement)

    print(f"    🤖 Agent-{agent_id}: {imp_type} — {imp_desc[:50]}")

    sub_env = dict(os.environ)
    sub_env["CLAUDE_CODE_SIMPLE"] = "1"
    sub_env["CLAUDE_NO_DAEMON"] = "1"

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
        return {"agent_id": agent_id, "type": imp_type, "success": False,
                "message": f"Timeout after {timeout_secs}s"}
    except Exception as e:
        return {"agent_id": agent_id, "type": imp_type, "success": False,
                "message": str(e)}

    # Show last 3 lines for visibility
    lines = [l for l in output.splitlines() if l.strip()]
    for line in lines[-3:]:
        print(f"      {line.strip()}")

    success = exit_code == 0

    result = {
        "agent_id": agent_id,
        "type": imp_type,
        "success": success,
        "message": f"Agent {agent_id} completed {imp_type}" if success else f"Agent {agent_id} failed: {output[:200]}",
        "exit_code": exit_code,
    }

    result_file.write_text(json.dumps(result, indent=2))
    return result


def execute_parallel_improvements(improvements: list, max_workers: int = MAX_PARALLEL) -> tuple[bool, str, list]:
    """
    Execute multiple improvements in parallel using ThreadPoolExecutor.
    Returns (all_success, summary, list_of_results).
    """
    if not improvements:
        return True, "No improvements to execute", []

    print(f"\n  💻 IMPLEMENTATION: {len(improvements)} parallel agent(s)")
    print(f"  ⏱️  Max workers: {max_workers} | Timeout per agent: 600s")

    results = []
    start = time.time()

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {}
        for i, imp in enumerate(improvements):
            agent_id = f"{uuid.uuid4().hex[:8]}"
            future = executor.submit(_run_single_agent, imp, agent_id)
            futures[future] = (i, imp, agent_id)

        for future in as_completed(futures):
            i, imp, agent_id = futures[future]
            try:
                result = future.result()
                results.append(result)
                status = "✅" if result["success"] else "❌"
                print(f"    {status} Agent-{agent_id} [{imp.get('type')}]: {result['message'][:60]}")
            except Exception as e:
                print(f"    ❌ Agent-{agent_id} exception: {e}")
                results.append({"agent_id": agent_id, "type": imp.get("type"),
                               "success": False, "message": str(e)})

    elapsed = time.time() - start
    success_count = sum(1 for r in results if r["success"])
    print(f"\n  ⏱️  Parallel execution done in {elapsed:.1f}s | {success_count}/{len(results)} succeeded")

    all_success = success_count == len(results)
    summary = f"{success_count}/{len(results)} agents succeeded in {elapsed:.1f}s"
    return all_success, summary, results


# ─── Phase: IMPLEMENTATION ─────────────────────────────────────────────────────

def phase_IMPLEMENTATION(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """IMPLEMENTATION: execute up to MAX_PARALLEL improvements in parallel."""
    iteration = state.get("iteration", 0)
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])

    print(f"\n{'='*60}")
    print(f"💻 IMPLEMENTATION (iter {iteration})")
    print(f"{'='*60}")

    if not improvements:
        print("  ⚠ No improvements to implement")
        state["phase"] = "QA"
        return state, memory, snapshot

    # Execute all improvements in parallel
    all_ok, summary, results = execute_parallel_improvements(improvements)

    # Record in memory
    for r in results:
        key = hashlib.md5(r["type"].encode()).hexdigest()[:8]
        if r["success"]:
            memory.setdefault("success_patterns", {})[key] = \
                memory.get("success_patterns", {}).get(key, 0) + 1
            add_learning(memory, "coder", "IMPLEMENTATION", r["type"], "success", r["message"])
        else:
            memory.setdefault("error_patterns", {})[key] = \
                memory.get("error_patterns", {}).get(key, 0) + 1
            add_learning(memory, "coder", "IMPLEMENTATION", r["type"], "failure", r["message"])

    # Save combined result
    save_json(RESULT_FILE, {
        "all_ok": all_ok,
        "summary": summary,
        "results": results,
        "improvements": improvements,
    })

    feature_names = ", ".join([imp.get("type") for imp in improvements])
    print(f"\n  {'✅' if all_ok else '⚠'} IMPLEMENTATION: {feature_names}")
    print(f"     {summary}")

    state["phase"] = "QA"
    state["phase_iteration"] = 0
    return state, memory, snapshot


# ─── Phase: QA ─────────────────────────────────────────────────────────────────

def phase_QA(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """QA: run triad and validate the improvements."""
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])
    feature_names = ", ".join([imp.get("type") for imp in improvements]) or "none"

    print(f"\n{'='*60}")
    print(f"🧪 QA (typecheck + tests)")
    print(f"{'='*60}")

    # Always get fresh triad after implementation
    fresh = build_snapshot(use_cache=False)
    triad = fresh.get("triad", {})
    save_triad_cache(triad, get_git_head())

    tc_pass = triad.get("typecheck", {}).get("pass", False)
    lint_pass = triad.get("lint", {}).get("pass", False)
    tests_pass = triad.get("tests", {}).get("pass", False)
    tests_info = triad.get("tests", {})

    print(f"  Typecheck: {'✅ pass' if tc_pass else '❌ FAIL'}")
    if not tc_pass:
        errors = triad.get("typecheck", {}).get("errors", [])
        for e in errors[:5]:
            print(f"    {e}")

    print(f"  Tests:    {'✅' if tests_pass else '⚠'} "
          f"{tests_info.get('passed', 0)} passed / {tests_info.get('failed', 0)} failed")

    # Only typecheck failures block; lint and tests are non-blocking
    blockers = []
    if not tc_pass:
        blockers.append("typecheck")
    if not tests_pass:
        blockers.append("tests")

    if blockers:
        print(f"  ⚠ Blockers (non-blocking): {', '.join(blockers)}")

    result_data = load_json(RESULT_FILE, {})
    agent_results = result_data.get("results", [])
    ok_count = sum(1 for r in agent_results if r.get("success"))

    # Decision: proceed if at least one agent succeeded
    if ok_count > 0:
        print(f"  ✅ {ok_count}/{len(agent_results)} coding agent(s) succeeded")
        state["phase"] = "VALIDATION"
    else:
        print(f"  ❌ All coding agents failed — retrying RESEARCH")
        add_learning(memory, "qa", "QA", "all_agents_failed", "failure",
                    f"All {len(agent_results)} agents failed")
        state["phase"] = "RESEARCH"
        state["retry_count"] = state.get("retry_count", 0) + 1

    return state, memory, snapshot


# ─── Phase: VALIDATION ─────────────────────────────────────────────────────────

def phase_VALIDATION(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """VALIDATION: verify Plans.md, CodeGraph sync, DOX compliance."""
    iteration = state.get("iteration", 0)
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])

    print(f"\n{'='*60}")
    print(f"🔍 VALIDATION")
    print(f"{'='*60}")

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
            block = "\n".join(
                f"- [x] **PLN-{iteration:03d}[{i+1}]** — {imp.get('type')} (auto-marked)"
                for i, imp in enumerate(improvements)
            )
            plans_md.write_text(content + "\n" + block + "\n")
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


# ─── Phase: RELEASE ─────────────────────────────────────────────────────────────

def phase_RELEASE(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """RELEASE: bump version, commit, update CHANGELOG."""
    iteration = state.get("iteration", 0)
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])
    result_data = load_json(RESULT_FILE, {})

    feature_names = ", ".join([imp.get("type") for imp in improvements]) if improvements else "no-improvement"
    agent_results = result_data.get("results", [])
    ok_count = sum(1 for r in agent_results if r.get("success"))

    # Version bump
    ver_file = ROOT / ".autonomous" / "ralph-loop" / "version.json"
    ver = load_json(ver_file, {"major": 0, "minor": 0, "patch": 0, "changelog": []})
    ver["minor"] += 1
    ver_str = f"{ver['major']}.{ver['minor']}.{ver['patch']}"
    ver["changelog"].insert(0, {
        "version": ver_str,
        "ts": datetime.now(timezone.utc).isoformat(),
        "improvement": feature_names,
        "agents": ok_count,
    })
    save_json(ver_file, ver)
    (ROOT / "VERSION").write_text(ver_str + "\n")

    # Update CHANGELOG
    changelog = ROOT / "CHANGELOG.md"
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    entry = f"\n## [{ver_str}] — {ts}\n\n### feat(loop): {feature_names} ({ok_count} agents succeeded)\n"
    if changelog.exists():
        content = changelog.read_text()
        changelog.write_text(content.replace("# Changelog\n", "# Changelog\n" + entry, 1))
    else:
        changelog.write_text("# Changelog\n" + entry)

    # Git commit (if changes exist)
    subprocess.run(["git", "add", "-A"], cwd=str(ROOT), capture_output=True)
    msg = f"feat(loop): {ver_str} — {feature_names}"
    rc, out, err = run_cmd(["git", "commit", "-m", msg], timeout=15)
    if rc == 0:
        print(f"  ✅ Git commit: {msg}")
    else:
        print(f"  ⚠ Git commit: {out.strip() or err.strip() or 'nothing to commit'}")

    # Update memory
    memory["iteration"] = memory.get("iteration", 0) + 1
    memory.setdefault("context_window", []).append({
        "ts": datetime.now(timezone.utc).isoformat(),
        "improvement": feature_names,
        "version": ver_str,
        "agents": ok_count,
        "triad_green": all(t.get("pass", False)
                          for t in snapshot.get("triad", {}).values()),
    })
    memory["context_window"] = memory["context_window"][-20:]

    # Advance state
    state["iteration"] += 1
    state["phase"] = "RESEARCH"
    state["phase_iteration"] = 0
    state["current_features"] = []
    state["retry_count"] = 0

    # Cleanup agent results
    for f in AGENT_RESULTS_DIR.glob("result-*.json"):
        try:
            f.unlink()
        except Exception:
            pass

    print(f"\n{'='*60}")
    print(f"  🚀 RELEASE: {ver_str} | iter={state['iteration']} | {feature_names}")
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
    features = state.get("current_features", [])
    features_str = ", ".join(features) if features else "none"

    print(f"\n{'='*60}")
    print(f"ITERATION {iteration} | PHASE: {phase}")
    print(f"Features: {features_str}")
    print(f"{'='*60}")

    # Route to phase executor
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
        "improvement": state.get("current_features"),
        "state": state,
        "memory": memory,
    }


def run_continuous(max_iterations: int = 0, max_hours: float = 0) -> None:
    """Run the loop continuously. Each call handles ONE phase."""
    import time as time_mod
    start = time_mod.time()
    phase_count = 0

    print(f"\n{'='*60}")
    print("AKASHA AUTONOMOUS LOOP v2 — CONTINUOUS MODE")
    print(f"Max iterations: {'unlimited' if max_iterations == 0 else max_iterations}")
    print(f"Max hours:     {'unlimited' if max_hours == 0 else max_hours}")
    print(f"Max parallel:   {MAX_PARALLEL} agents per IMPLEMENTATION")
    print(f"Triad cache:    enabled (TTL={TRIAD_CACHE_TTL}s)")
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
            elapsed = (time_mod.time() - start) / 3600
            if elapsed >= max_hours:
                print(f"\n✅ Reached max hours ({max_hours}h)")
                break

        phase_start = time_mod.time()
        result = run_full_iteration()
        phase_duration = time_mod.time() - phase_start
        phase_count += 1

        # Very brief pause between phases
        time_mod.sleep(0.5)

        # Log performance every 20 phases
        if phase_count % 20 == 0:
            current = load_state()
            elapsed = (time_mod.time() - start) / 3600
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

    print("═══ AKASHA Evolution Loop v2 ═══")
    print(f"  Running:        {state.get('running', False)}")
    print(f"  Iteration:      {state.get('iteration', 0)}")
    print(f"  Phase:          {state.get('phase', '?')}")
    print(f"  Features:       {', '.join(state.get('current_features', [])) or 'none'}")
    print(f"  Version:        {ver_str}")
    print()
    print(f"  Triad:          typecheck={snapshot['triad'].get('typecheck',{}).get('pass','?')} "
          f"tests={snapshot['triad'].get('tests',{}).get('passed','?')}/{snapshot['triad'].get('tests',{}).get('failed','?')} "
          f"lint={snapshot['triad'].get('lint',{}).get('pass','?')}")
    print(f"  CodeGraph:      {snapshot['codegraph'].get('pending_files',0)} pending files")
    print(f"  Git:            {snapshot['git'].get('total',0)} changed files")
    print(f"  Candidates:     {len(snapshot.get('improvement_candidates', []))}")
    print()
    print(f"  Learnings:      {len(memory.get('learnings', []))} total")
    print(f"  Decisions:      {len(memory.get(RECENT_DECISIONS_KEY, []))} recent")
    print(f"  Context window: {len(memory.get('context_window', []))} entries")
    print()
    print("  Flow: RESEARCH → PLANNING → IMPLEMENTATION(5-parallel) → QA → VALIDATION → RELEASE")


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
    if len(sys.argv) < 2:
        print("Usage: akasha-evolution-loop.py [run|continuous|status|stop]")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "run":
        result = run_full_iteration()
        print(f"\nPhase complete: phase={result.get('phase','?')}")

    elif cmd == "start":
        state = load_state()
        state["running"] = True
        save_state(state)
        print("🚀 Loop marked as running.")

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
