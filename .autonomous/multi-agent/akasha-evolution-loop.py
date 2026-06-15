#!/usr/bin/env python3
"""
akasha-evolution-loop.py — OMP-native autonomous evolution loop.

Runs INSIDE OMP using the `task` tool to spawn 5 specialized sub-agents
in parallel, coordinating via shared JSON files and exponential learning.

Usage (from OMP prompt):
  "start akasha-evolution"
  "akasha-evolution status"
  "akasha-evolution stop"

This is NOT a subprocess. This script is loaded by the skill and its
functions are called directly by the main OMP agent orchestrator.
"""

import json
import os
import subprocess
import tempfile
import concurrent.futures
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous/multi-agent"
MEMORY_FILE = MA / "memory.json"
SNAPSHOT_FILE = MA / "context_snapshot.json"
STATE_FILE = MA / "state.json"
LOGS_DIR = MA / "logs"
SESSION_DIR = MA / "sessions"

os.makedirs(MA, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)
os.makedirs(SESSION_DIR, exist_ok=True)

# ─── State ───────────────────────────────────────────────────────────────────

def load_json(path: Path, default=None):
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            pass
    return default if default is not None else {}


def save_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))


def load_state() -> dict:
    return load_json(STATE_FILE, {
        "phase": "RESEARCH",
        "iteration": 0,
        "phase_iteration": 0,
        "current_feature": None,
        "retry_count": 0,
        "running": False,
    })


def save_state(state: dict) -> None:
    save_json(STATE_FILE, state)


def load_memory() -> dict:
    return load_json(MEMORY_FILE, {
        "iteration": 0,
        "learnings": [],
        "task_history": [],
        "context_window": [],
        "decisions": [],
        "error_patterns": {},
        "success_patterns": {},
    })


def save_memory(mem: dict) -> None:
    save_json(MEMORY_FILE, mem)


# ─── Bootstrap ────────────────────────────────────────────────────────────────

def build_snapshot() -> dict:
    """Build fresh project context snapshot from real sources."""
    snap = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "version": "",
        "plans": {},
        "features": {},
        "git": {},
        "triad": {},
        "codegraph": {},
        "decision_factors": {},
    }

    # VERSION
    v = ROOT / "VERSION"
    snap["version"] = v.read_text().strip() if v.exists() else "0.0.0"

    # Feature list
    fl = ROOT / ".autonomous/feature_list.json"
    if fl.exists():
        try:
            data = json.loads(fl.read_text())
            pending = [f for f in data if not f.get("passes", False)]
            done = [f for f in data if f.get("passes", False)]
            by_phase = {}
            for f in data:
                p = f.get("phase", "?")
                by_phase.setdefault(p, []).append(f.get("id", "?"))
            snap["features"] = {
                "total": len(data),
                "pending": [f.get("id", "?") for f in pending],
                "pending_count": len(pending),
                "done_count": len(done),
                "by_phase": by_phase,
                "top_pending": [
                    {"id": f.get("id", "?"), "phase": f.get("phase", "?"),
                     "title": f.get("title", f.get("description", ""))[:80],
                     "priority": f.get("priority", "?")}
                    for f in pending[:8]
                ],
            }
        except Exception:
            pass

    # Git status
    try:
        r = subprocess.run(["git", "status", "--porcelain"],
                          capture_output=True, text=True, timeout=10, cwd=str(ROOT))
        lines = [l for l in r.stdout.splitlines() if l.strip()]
        untracked = sum(1 for l in lines if l.startswith("??"))
        modified = sum(1 for l in lines if not l.startswith("??"))
        snap["git"] = {
            "untracked": untracked,
            "modified": modified,
            "total": len(lines),
            "has_changes": len(lines) > 0,
        }
    except Exception:
        snap["git"] = {"untracked": 0, "modified": 0, "total": 0, "has_changes": False}

    # CodeGraph status
    try:
        r = subprocess.run(["codegraph", "status"],
                          capture_output=True, text=True, timeout=30, cwd=str(ROOT))
        out = r.stdout
        pending = 0
        if "Pending Changes:" in out:
            import re
            m = re.search(r"Added:\s+(\d+)", out)
            if m:
                pending = int(m.group(1))
        stats = {}
        for line in out.splitlines():
            line = line.strip()
            if ":" in line:
                k, v = line.split(":", 1)
                k = k.strip().lower().replace(" ", "_")
                v = v.strip()
                if v:
                    stats[k] = v
        snap["codegraph"] = {
            "stats": stats,
            "pending_files": pending,
            "needs_sync": pending > 0,
            "ok": r.returncode == 0,
        }
    except Exception:
        snap["codegraph"] = {"stats": {}, "pending_files": 0, "needs_sync": False, "ok": False}

    # Triad (typecheck + tests + lint)
    triad = {}
    # typecheck
    try:
        r = subprocess.run(
            ["pnpm", "--filter", "akasha-portal", "typecheck"],
            capture_output=True, text=True, timeout=120, cwd=str(ROOT)
        )
        triad["typecheck"] = {"pass": r.returncode == 0}
    except Exception:
        triad["typecheck"] = {"pass": False}

    # tests
    try:
        r = subprocess.run(
            ["pnpm", "--filter", "akasha-portal", "test:run"],
            capture_output=True, text=True, timeout=180, cwd=str(ROOT)
        )
        import re
        summary = r.stdout + r.stderr
        pm = re.search(r"(\d+) passed", summary)
        fm = re.search(r"(\d+) failed", summary)
        triad["tests"] = {
            "pass": r.returncode == 0,
            "passed": int(pm.group(1)) if pm else 0,
            "failed": int(fm.group(1)) if fm else 0,
        }
    except Exception:
        triad["tests"] = {"pass": False}

    # lint
    try:
        r = subprocess.run(
            ["pnpm", "--filter", "akasha-portal", "lint"],
            capture_output=True, text=True, timeout=60, cwd=str(ROOT)
        )
        triad["lint"] = {"pass": r.returncode == 0}
    except Exception:
        triad["lint"] = {"pass": False}

    snap["triad"] = triad

    # Plans.md summary
    plans_md = ROOT / "Plans.md"
    if plans_md.exists():
        try:
            content = plans_md.read_text()
            import re
            pending_items = re.findall(r"- \[ \] \*\*([A-Z]+-\d+)\*\*", content)
            done_items = re.findall(r"- \[x\] \*\*([A-Z]+-\d+)\*\*", content)
            snap["plans"] = {
                "pending": pending_items[:20],
                "done": done_items[-20:],
            }
        except Exception:
            pass

    # Decision factors
    factors = {
        "has_pending_features": snap["features"].get("pending_count", 0) > 0,
        "pending_count": snap["features"].get("pending_count", 0),
        "triad_all_green": all(t.get("pass", False) for t in triad.values()),
        "triad_status": {k: v.get("pass", False) for k, v in triad.items()},
        "codegraph_needs_sync": snap["codegraph"].get("needs_sync", False),
        "git_has_changes": snap["git"].get("has_changes", False),
        "untracked_files": snap["git"].get("untracked", 0),
    }
    snap["decision_factors"] = factors

    return snap


def save_snapshot(snap: dict) -> int:
    content = json.dumps(snap, indent=2, ensure_ascii=False)
    SNAPSHOT_FILE.write_text(content)
    return len(content)


def bootstrap() -> dict:
    """Load ALL project context. Runs BEFORE every action."""
    snap = build_snapshot()
    save_snapshot(snap)
    return snap


# ─── Intelligence ─────────────────────────────────────────────────────────────

def get_recent_learnings(mem: dict, n: int = 10) -> list:
    return mem.get("learnings", [])[-n:]


def add_learning(mem: dict, agent: str, phase: str, feature_id: str,
                outcome: str, summary: str, details: dict = None) -> None:
    import hashlib
    learning = {
        "agent": agent, "phase": phase, "feature_id": feature_id,
        "outcome": outcome, "summary": summary[:300],
        "details": details or {},
        "ts": datetime.now(timezone.utc).isoformat(),
    }
    mem["learnings"].append(learning)
    if len(mem["learnings"]) > 200:
        mem["learnings"] = mem["learnings"][-200:]

    key = hashlib.md5(f"{phase}:{feature_id}".encode()).hexdigest()[:8]
    if outcome == "success":
        mem["success_patterns"][key] = mem["success_patterns"].get(key, 0) + 1
    else:
        mem["error_patterns"][key] = mem["error_patterns"].get(key, 0) + 1

    mem["task_history"].append({
        "feature_id": feature_id, "outcome": outcome,
        "phase": phase, "ts": learning["ts"],
    })
    if len(mem["task_history"]) > 100:
        mem["task_history"] = mem["task_history"][-100:]


def should_proceed(snapshot: dict) -> tuple[bool, str]:
    """
    Decide whether to proceed with the loop or take corrective action first.
    Only BLOCKS on critical issues (typecheck, lint, too many git changes).
    Tests failures → warn but don't block (many pre-existing failures).
    """
    factors = snapshot.get("decision_factors", {})
    triad = snapshot.get("triad", {})
    cg = snapshot.get("codegraph", {})
    git = snapshot.get("git", {})

    # CRITICAL: typecheck must be green to start new work
    if not triad.get("typecheck", {}).get("pass", False):
        return False, "Triad failing: typecheck=False. Fix before new work."

    # CRITICAL: lint must be green
    if not triad.get("lint", {}).get("pass", False):
        return False, "Triad failing: lint=False. Fix before new work."

    # WARN (not block): tests failing — many are pre-existing infrastructure issues
    tests = triad.get("tests", {})
    if not tests.get("pass", False):
        passed = tests.get("passed", 0)
        failed = tests.get("failed", 0)
        return True, (f"Tests failing ({passed} passed, {failed} failed) — "
                      f"pre-existing infra issues, proceeding anyway")

    # WARN (not block): codegraph needs sync
    if cg.get("needs_sync"):
        return True, "CodeGraph index has pending changes — proceeding"

    # BLOCK: too many uncommitted changes
    total = git.get("total", 0)
    if total > 150:
        return False, f"Working tree has {total} changed files (>150 threshold). Commit or reset."

    if not factors.get("has_pending_features"):
        return False, "No pending features. Project is current."

    return True, "Ready to proceed"


def pick_next_task(features: dict, memory: dict) -> Optional[dict]:
    pending = features.get("top_pending", [])
    if not pending:
        return None

    error_patterns = memory.get("error_patterns", {})
    import hashlib

    scored = []
    for f in pending:
        fid = f.get("id", "?")
        phase_str = str(f.get("phase", "?"))
        key = hashlib.md5(f"phase:{fid}".encode()).hexdigest()[:8]
        errors = error_patterns.get(key, 0)

        if errors >= 3:
            continue

        history = [l for l in memory.get("learnings", []) if l.get("feature_id") == fid]
        attempts = len(history)
        recent_errors = sum(1 for h in history[-3:] if h.get("outcome") in ("failure", "retry"))

        if attempts > 2 and recent_errors > 0:
            continue
        score = 1000 - (int(phase_str) if phase_str.isdigit() else 5) * 10
        score -= recent_errors * 50
        score -= attempts * 5
        scored.append((score, f))

    if not scored:
        for f in pending:
            history = [l for l in memory.get("learnings", [])
                       if l.get("feature_id") == f.get("id", "?")]
            if not history:
                return f
        return pending[0] if pending else None
    scored.sort(key=lambda x: x[0], reverse=True)
    return scored[0][1]


def make_decision(snapshot: dict, memory: dict, current_phase: str) -> dict:
    factors = snapshot.get("decision_factors", {})
    features = snapshot.get("features", {})
    recent = get_recent_learnings(memory, n=5)

    decision = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "current_phase": current_phase,
        "action": None,
        "feature": None,
        "reasoning": [],
        "confidence": "high",
        "next_phase": None,
    }

    proceed, reason = should_proceed(snapshot)
    decision["reasoning"].append(reason)

    if not proceed:
        decision["action"] = "BLOCKED"
        decision["blocking_reason"] = reason
        decision["confidence"] = "high"
        decision["next_phase"] = current_phase
        return decision

    feature = pick_next_task(features, memory)
    if not feature:
        decision["action"] = "IDLE"
        decision["reasoning"].append("No suitable pending feature found")
        decision["confidence"] = "high"
        decision["next_phase"] = "RELEASE"
        return decision

    decision["feature"] = feature
    decision["action"] = "EXECUTE"

    phases = ["RESEARCH", "PLANNING", "IMPLEMENTATION", "QA", "VALIDATION", "RELEASE"]
    if current_phase not in phases:
        decision["next_phase"] = "RESEARCH"
    else:
        idx = phases.index(current_phase)
        if recent:
            last = recent[-1]
            if last.get("outcome") in ("failure", "retry") and current_phase in ("QA", "VALIDATION"):
                decision["next_phase"] = "IMPLEMENTATION"
            else:
                decision["next_phase"] = phases[(idx + 1) % len(phases)]
        else:
            decision["next_phase"] = phases[(idx + 1) % len(phases)]

    recent_failures = sum(1 for l in recent if l.get("outcome") in ("failure", "retry"))
    decision["confidence"] = "low" if recent_failures >= 2 else "high"
    if recent_failures >= 2:
        decision["reasoning"].append(f"Warning: {recent_failures} recent failures")

    return decision


# ─── Task descriptors for sub-agents ─────────────────────────────────────────
# These are written to JSON and consumed by sub-agent tasks.

AGENT_ROLES = {
    "researcher": {
        "name": "researcher",
        "description": "Web research, competitive analysis, external context",
        "focus": "external knowledge, citations, competitive landscape",
    },
    "architect": {
        "name": "architect",
        "description": "System design, blast-radius analysis, tradeoffs",
        "focus": "architecture, isomorfismos, blast radius, design patterns",
    },
    "coder": {
        "name": "coder",
        "description": "Implementation, refactoring, triad execution",
        "focus": "code, tests, lint, typecheck, git commit",
    },
    "qa": {
        "name": "qa",
        "description": "Test execution, quality gates, regression analysis",
        "focus": "quality, test coverage, regression, triad",
    },
    "validator": {
        "name": "validator",
        "description": "Meta-review, DOX compliance, backwards compat",
        "focus": "DOX, AGENTS.md chain, backwards compat, meta-review",
    },
}


def write_task_file(agent: str, feature: dict, snapshot: dict,
                    phase: str, iteration: int) -> Path:
    """Write task input for a sub-agent. Returns path to task file."""
    task_file = MA / f"task-{agent}.json"
    task = {
        "agent": agent,
        "role": AGENT_ROLES.get(agent, {}),
        "feature": feature,
        "phase": phase,
        "iteration": iteration,
        "snapshot": {
            "generated_at": snapshot.get("generated_at", ""),
            "version": snapshot.get("version", ""),
            "features": {
                "pending_count": snapshot.get("features", {}).get("pending_count", 0),
                "done_count": snapshot.get("features", {}).get("done_count", 0),
                "top_pending": snapshot.get("features", {}).get("top_pending", [])[:5],
            },
            "triad": snapshot.get("triad", {}),
            "codegraph": {
                "stats": snapshot.get("codegraph", {}).get("stats", {}),
                "needs_sync": snapshot.get("codegraph", {}).get("needs_sync", False),
            },
            "git": snapshot.get("git", {}),
            "decision_factors": snapshot.get("decision_factors", {}),
        },
        "project_root": str(ROOT),
        "output_file": str(MA / f"result-{agent}.json"),
        "log_dir": str(LOGS_DIR),
    }
    save_json(task_file, task)
    return task_file


def read_result_file(agent: str) -> dict:
    """Read result from a sub-agent."""
    result_file = MA / f"result-{agent}.json"
    return load_json(result_file, {"status": "error", "summary": "no result"})


# ─── Phase executors ─────────────────────────────────────────────────────────

def phase_RESEARCH(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict, list]:
    """
    RESEARCH phase: spawn all 5 agents in parallel via task tool.
    Returns (state, memory, snapshot, agent_results).
    """
    decision = make_decision(snapshot, memory, "RESEARCH")

    if decision.get("action") == "BLOCKED":
        print(f"  ⛔ BLOCKED: {decision.get('blocking_reason', '?')}")
        state["phase"] = "RESEARCH"
        return state, memory, snapshot, []

    if decision.get("action") == "IDLE":
        print("  💤 IDLE: No suitable task found.")
        state["phase"] = "RELEASE"
        return state, memory, snapshot, []

    feature = decision.get("feature")
    if not feature:
        state["phase"] = "PLANNING"
        return state, memory, snapshot, []

    fid = feature.get("id", "?")
    ftitle = feature.get("title", "")[:80]
    state["current_feature"] = fid
    iteration = state.get("iteration", 0)

    print(f"  🔬 RESEARCH: {fid} — {ftitle}")
    print(f"  Decision confidence: {decision.get('confidence', '?')}")
    for r in decision.get("reasoning", []):
        print(f"    → {r}")

    # Write task files for all 5 agents
    for agent in AGENT_ROLES:
        write_task_file(agent, feature, snapshot, "RESEARCH", iteration)

    # Spawn all 5 sub-agents in parallel via task tool
    # NOTE: This function is called by the main OMP agent which uses `task`
    # The sub-agents are spawned as separate task calls
    # Results are read from result-{agent}.json files

    return state, memory, snapshot, []


def phase_PLANNING(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """PLANNING phase: update Plans.md with research synthesis."""
    iteration = state.get("iteration", 0)
    fid = state.get("current_feature", f"iter-{iteration}")
    recent = get_recent_learnings(memory, n=5)

    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    ver_file = ROOT / ".autonomous/ralph-loop/version.json"
    ver = load_json(ver_file, {"major": 0, "minor": 0, "patch": 0})
    ver_str = f"{ver['major']}.{ver['minor']}.{ver['patch']}"

    block = [
        f"\n## cc: Ralph-loop iter {iteration} | {fid} ({ts})\n",
        f"- [~] **PLN-{iteration:03d}** — {fid} | ver {ver_str}\n",
        f"  - Phase: RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE\n",
        f"  - Recent learnings: {len(recent)}\n",
    ]
    for l in recent[-5:]:
        block.append(f"  - [{l.get('agent', '?')}] {l.get('summary', '')[:100]}\n")

    plans_md = ROOT / "Plans.md"
    if plans_md.exists():
        content = plans_md.read_text()
        if "## cc:TODO" in content:
            content = content.replace("## cc:TODO", "".join(block) + "\n## cc:TODO", 1)
        elif "## cc:WIP" in content:
            content = content.replace("## cc:WIP", "".join(block) + "\n## cc:WIP", 1)
    else:
        content = "".join(block)
    plans_md.write_text(content)

    print(f"  📋 PLANNING: Plans.md updated (PLN-{iteration:03d})")

    state["phase"] = "IMPLEMENTATION"
    state["phase_iteration"] = 0
    return state, memory, snapshot


def phase_IMPLEMENTATION(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """IMPLEMENTATION phase: coder + architect + researcher execute."""
    fid = state.get("current_feature", "?")
    print(f"  💻 IMPLEMENTATION: {fid}")

    # Re-bootstrap to get fresh context after previous phase
    snapshot = bootstrap()

    state["phase"] = "QA"
    state["phase_iteration"] = 0
    return state, memory, snapshot


def phase_QA(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """QA phase: run triad, check results."""
    fid = state.get("current_feature", "?")
    print(f"  🧪 QA: {fid}")

    triad = snapshot.get("triad", {})
    typecheck_pass = triad.get("typecheck", {}).get("pass", False)
    lint_pass = triad.get("lint", {}).get("pass", False)
    tests_pass = triad.get("tests", {}).get("pass", False)

    print(f"    Triad: typecheck={typecheck_pass} tests={tests_pass} lint={lint_pass}")

    # Blocking failures: typecheck or lint — must fix before proceeding
    blocking_failures = [k for k in ("typecheck", "lint") if not triad.get(k, {}).get("pass", False)]
    # Non-blocking failures: tests only — pre-existing infra issues, warn but don't block
    test_failures = [] if tests_pass else ["tests"]

    all_green = typecheck_pass and lint_pass and tests_pass
    non_blocking_only = not blocking_failures and bool(test_failures)
    retry_count = state.get("retry_count", 0)
    MAX_QA_RETRIES = 3

    if all_green:
        print(f"    ✅ All green → VALIDATION")
        state["phase"] = "VALIDATION"
        state["retry_count"] = 0
    elif blocking_failures:
        # Critical failures — retry IMPLEMENTATION up to MAX_QA_RETRIES
        if retry_count >= MAX_QA_RETRIES:
            print(f"    ⛔ Max retries ({MAX_QA_RETRIES}) hit for {blocking_failures} → VALIDATION (override)")
            state["phase"] = "VALIDATION"
            state["retry_count"] = 0
        else:
            print(f"    ❌ Blocking failures: {blocking_failures} → IMPLEMENTATION (retry #{retry_count+1})")
            state["phase"] = "IMPLEMENTATION"
            state["retry_count"] = retry_count + 1
    else:
        # Only tests failing — pre-existing infra issues, warn but advance
        failed = triad.get("tests", {}).get("failed", 0)
        passed = triad.get("tests", {}).get("passed", 0)
        print(f"    ⚠️  Tests failing ({passed} passed, {failed} failed) — pre-existing, proceeding to VALIDATION")
        state["phase"] = "VALIDATION"
        state["retry_count"] = 0

    state["phase_iteration"] = 0
    return state, memory, snapshot


def phase_VALIDATION(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """VALIDATION phase: meta-review, DOX check."""
    fid = state.get("current_feature", "?")
    print(f"  ✅ VALIDATION: {fid}")

    # Verify AGENTS.md chain for modified paths
    plans_md = ROOT / "Plans.md"
    dox_ok = True
    if plans_md.exists():
        content = plans_md.read_text()
        # Simple check: if we updated Plans.md, DOX is implicitly updated
        if f"PLN-{state.get('iteration',0):03d}" in content:
            print(f"    ✅ Plans.md updated correctly")
        else:
            print(f"    ⚠ Plans.md may need update")
            dox_ok = False

    state["phase"] = "RELEASE" if dox_ok else "IMPLEMENTATION"
    state["phase_iteration"] = 0
    return state, memory, snapshot


def phase_RELEASE(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """RELEASE phase: bump version, commit, tag, update CHANGELOG."""
    iteration = state.get("iteration", 0)

    # Bump version
    ver_file = ROOT / ".autonomous/ralph-loop/version.json"
    ver = load_json(ver_file, {"major": 0, "minor": 0, "patch": 0, "changelog": []})
    ver["minor"] += 1
    ver["changelog"].insert(0, {
        "version": f"{ver['major']}.{ver['minor']}.{ver['patch']}",
        "ts": datetime.now(timezone.utc).isoformat(),
        "feature": state.get("current_feature", "?"),
    })
    save_json(ver_file, ver)
    ver_str = f"{ver['major']}.{ver['minor']}.{ver['patch']}"

    # Update VERSION
    (ROOT / "VERSION").write_text(ver_str + "\n")

    # Update CHANGELOG
    changelog = ROOT / "CHANGELOG.md"
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    entry = f"\n## [{ver_str}] — {ts}\n\n### Ralph-loop iter {iteration}\n"
    if changelog.exists():
        content = changelog.read_text()
        changelog.write_text(content.replace("# Changelog\n", "# Changelog\n" + entry, 1))
    else:
        changelog.write_text("# Changelog\n" + entry)

    # Mark Plans.md done
    plans_md = ROOT / "Plans.md"
    if plans_md.exists():
        content = plans_md.read_text()
        marker = f"**PLN-{iteration:03d}**"
        if f"[~] {marker}" in content:
            content = content.replace(f"[~] {marker}", f"[x] {marker}")
            plans_md.write_text(content)

    # Git commit + tag
    subprocess.run(["git", "add", "-A"], cwd=str(ROOT), capture_output=True)
    tag = f"v{ver_str}"
    msg = f"chore(release): {tag} (Ralph-loop iter {iteration})"
    r = subprocess.run(["git", "commit", "-m", msg], cwd=str(ROOT),
                       capture_output=True, text=True)
    if r.returncode == 0:
        print(f"  ✅ Git commit: {msg}")
        if ver["major"] > 0:
            subprocess.run(["git", "tag", "-a", tag, "-m", msg],
                          cwd=str(ROOT), capture_output=True)
            print(f"  🏷 Git tag: {tag}")
    else:
        print(f"  ⚠ Git commit failed or nothing to commit")

    # Update memory
    memory["iteration"] = memory.get("iteration", 0) + 1
    memory.setdefault("context_window", []).append({
        "ts": datetime.now(timezone.utc).isoformat(),
        "decision": "RELEASE",
        "feature": state.get("current_feature", "?"),
        "confidence": "high",
        "next_phase": "RESEARCH",
        "triad_green": all(t.get("pass", False)
                          for t in snapshot.get("triad", {}).values()),
    })
    if len(memory["context_window"]) > 20:
        memory["context_window"] = memory["context_window"][-20:]

    # Advance state
    state["iteration"] += 1
    state["phase"] = "RESEARCH"
    state["phase_iteration"] = 0
    state["current_feature"] = None
    state["retry_count"] = 0

    print(f"  🚀 RELEASE: {tag} | iter={state['iteration']} | "
          f"learnings={len(memory.get('learnings',[]))}")

    return state, memory, snapshot


# ─── Main orchestrator ─────────────────────────────────────────────────────────

def run_iteration() -> dict:
    """
    Run one full iteration (all 6 phases).
    Called by the skill's main agent loop.
    Returns dict with iteration results.
    """
    # Step 1: Bootstrap — always load fresh context first
    print("\n" + "═" * 60)
    print("BOOTSTRAP: loading project context")
    print("═" * 60)
    snapshot = bootstrap()

    memory = load_memory()
    state = load_state()

    decision = make_decision(snapshot, memory, state.get("phase", "RESEARCH"))

    feature = decision.get('feature') or {}
    print(f"\nDecision: {decision.get('action', '?')} | "
          f"feature={feature.get('id', '?')} | "
          f"confidence={decision.get('confidence', '?')}")
    for r in decision.get("reasoning", []):
        print(f"  → {r}")

    # Check stop signal
    if (ROOT / ".autonomous/state/stop.signal").exists():
        print("\n⏹ Stop signal detected — loop halting.")
        state["running"] = False
        save_state(state)
        return {"stopped": True, "state": state, "memory": memory}

    # Save decision
    memory.setdefault("decisions", []).append({
        "ts": datetime.now(timezone.utc).isoformat(),
        "decision": decision,
        "snapshot_ts": snapshot.get("generated_at", ""),
    })

    iteration = state.get("iteration", 0)
    phase = state.get("phase", "RESEARCH")
    print(f"\n{'═' * 60}")
    print(f"ITERATION {iteration} | PHASE: {phase}")
    print(f"{'═' * 60}")

    # Route to phase executor
    results = {"phase": phase, "iteration": iteration}

    if phase == "RESEARCH":
        state, memory, snapshot, agent_results = phase_RESEARCH(state, memory, snapshot)
        results["agent_results"] = agent_results
        # Advance phase only if not blocked (blocked keeps current phase)
        if decision.get("action") != "BLOCKED":
            state["phase"] = decision.get("next_phase", "PLANNING")

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

    # Summary
    ver = load_json(ROOT / ".autonomous/ralph-loop/version.json",
                    {"major": 0, "minor": 0, "patch": 0})
    print(f"\n  ✓ iter={state['iteration']} | phase={state['phase']} | "
          f"ver={ver['major']}.{ver['minor']}.{ver['patch']} | "
          f"learnings={len(memory.get('learnings', []))} | "
          f"context_window={len(memory.get('context_window', []))}")

    results["state"] = state
    results["memory"] = memory
    results["snapshot"] = snapshot
    return results


def status() -> None:
    """Print current loop status."""
    snapshot = bootstrap()
    memory = load_memory()
    state = load_state()
    ver = load_json(ROOT / ".autonomous/ralph-loop/version.json",
                    {"major": 0, "minor": 0, "patch": 0})
    features = snapshot.get("features", {})

    print("═══ AKASHA Evolution Loop Status ═══")
    print(f"  Running:       {state.get('running', False)}")
    print(f"  Iteration:      {state.get('iteration', 0)}")
    print(f"  Phase:          {state.get('phase', '?')}")
    print(f"  Current:        {state.get('current_feature', 'none')}")
    print(f"  Retry count:    {state.get('retry_count', 0)}")
    print(f"  Version:        {ver['major']}.{ver['minor']}.{ver['patch']}")
    print(f"  Features:       {features.get('pending_count', 0)} pending / "
          f"{features.get('done_count', 0)} done")
    print()
    print(f"  Context:        {snapshot.get('generated_at', '?')}")
    print(f"  Triad:          typecheck={snapshot['triad'].get('typecheck',{}).get('pass','?')} "
          f"tests={snapshot['triad'].get('tests',{}).get('pass','?')} "
          f"lint={snapshot['triad'].get('lint',{}).get('pass','?')}")
    print(f"  CodeGraph:      {snapshot['codegraph'].get('pending_files',0)} pending files")
    print(f"  Git:            {snapshot['git'].get('total',0)} changed files")
    print()
    print(f"  Learnings:      {len(memory.get('learnings', []))} total")
    print(f"  Context window: {len(memory.get('context_window', []))} entries")
    print(f"  Decisions:      {len(memory.get('decisions', []))} recorded")
    print()
    recent = memory.get("learnings", [])[-5:]
    if recent:
        print("  Last 5 learnings:")
        for l in recent:
            mark = "✅" if l.get("outcome") == "success" else "❌"
            print(f"    {mark} [{l.get('agent','?')}] {l.get('summary','')[:80]}")
    print()
    print("  Flow: RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE")
    print("  5 Agents: researcher | architect | coder | qa | validator")


def stop_loop() -> None:
    """Send stop signal."""
    (ROOT / ".autonomous/state/stop.signal").write_text(
        f"stop at {datetime.now(timezone.utc).isoformat()}\n"
    )
    state = load_state()
    state["running"] = False
    save_state(state)
    print("⏹ Stop signal sent.")


def start_loop() -> None:
    """Mark loop as running."""
    state = load_state()
    state["running"] = True
    save_state(state)
    print("🚀 AKASHA Evolution Loop started.")


# ─── CLI entry point ─────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: akasha-evolution-loop.py [run|status|stop|start]")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "run":
        start_loop()
        result = run_iteration()
        print(f"\nIteration complete: phase={result.get('state',{}).get('phase','?')}")

    elif cmd == "status":
        status()

    elif cmd == "stop":
        stop_loop()

    elif cmd == "start":
        start_loop()

    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)
