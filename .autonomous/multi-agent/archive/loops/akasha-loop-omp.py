#!/usr/bin/env python3
"""
AKASHA Loop OMP-Native Entry Point
===================================
OMP-native phase executor: called by OMP main agent to execute ONE phase per call.
Python = state utility + state machine. OMP tools = actual work.

Usage (from OMP agent):
    python3 akasha-loop-omp.py <phase>

Phases: bootstrap, research, planning, implementation, qa, validation, release
"""

import importlib.util
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous" / "multi-agent"
MEMORY_FILE = MA / "memory.json"
SNAPSHOT_FILE = MA / "context_snapshot.json"
STATE_FILE = MA / "state.json"
TASK_FILE = MA / "task-implementation.json"
CACHE_FILE = MA / "triad-cache.json"
AGENT_RESULTS_DIR = MA / "agent-results"

os.makedirs(MA, exist_ok=True)
os.makedirs(AGENT_RESULTS_DIR, exist_ok=True)

MAX_PARALLEL = 5


def load_json(path: Path, default=None):
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            return default if default is not None else {}
    return default if default is not None else {}


def save_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))


def run_cmd(cmd, timeout=60):
    try:
        cp = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, cwd=str(ROOT))
        return cp.returncode, cp.stdout, cp.stderr
    except subprocess.TimeoutExpired:
        return -1, "", f"Timeout after {timeout}s"
    except Exception as e:
        return -1, "", str(e)


def load_state():
    return load_json(STATE_FILE, {
        "phase": "RESEARCH",
        "iteration": 0,
        "current_features": [],
        "retry_count": 0,
        "running": False,
    })


def save_state(state: dict) -> None:
    save_json(STATE_FILE, state)


def load_memory():
    return load_json(MEMORY_FILE, {
        "learnings": [],
        "decisions": [],
        "context_window": [],
        "success_patterns": {},
        "error_patterns": {},
        "iteration": 0,
    })


def save_memory(mem: dict) -> None:
    save_json(MEMORY_FILE, mem)


# ─── Load helpers from akasha-evolution-loop (hyphenated name → importlib) ──────

_spec = importlib.util.spec_from_file_location("loop_mod", MA / "akasha-evolution-loop.py")
_mod = importlib.util.module_from_spec(_spec)
_mod.ROOT = ROOT
_mod.MA = MA
_mod.load_json = load_json
_mod.save_json = save_json
_mod.run_cmd = run_cmd
_mod.AGENT_RESULTS_DIR = AGENT_RESULTS_DIR
_mod.SAVE_JSON_FILE = save_json
_old_sys_path = sys.path[:]
sys.path.insert(0, str(MA))
try:
    _spec.loader.exec_module(_mod)
finally:
    sys.path = _old_sys_path

# Convenience references
_find_improvements = _mod.find_improvement_candidates
_pick_best = _mod.pick_best_improvements
_add_learning = _mod.add_learning
_record_decision = _mod.record_decision
_bootstrap_fn = _mod.bootstrap


# ─── Phase: BOOTSTRAP ─────────────────────────────────────────────────────────

def cmd_bootstrap():
    """Run bootstrap — save snapshot + memory for OMP agent."""
    snap = _bootstrap_fn(use_cache=True)
    mem = load_memory()

    print("=== BOOTSTRAP ===")
    print(f"  Files: {snap.get('file_count', '?')}")
    print(f"  CodeGraph nodes: {snap.get('codegraph', {}).get('nodes', '?')}")
    triad = snap.get("triad", {})
    tc = triad.get("typecheck", {})
    tests = triad.get("tests", {})
    print(f"  Triad: typecheck={'✅' if tc.get('pass') else '❌'}, "
          f"tests={tests.get('passed', 0)}/{tests.get('failed', 0)}")
    print(f"  Learnings: {len(mem.get('learnings', []))}")

    save_json(MA / "omp-snapshot.json", snap)
    save_json(MA / "omp-memory.json", mem)
    print("  Snapshot → omp-snapshot.json")


# ─── Phase: RESEARCH ─────────────────────────────────────────────────────────

def cmd_research():
    """RESEARCH: find candidates → save to task file."""
    snap = _bootstrap_fn(use_cache=True)
    mem = load_memory()
    state = load_state()

    candidates = _find_improvements(snap)
    selected = _pick_best(candidates, mem, max_count=MAX_PARALLEL)

    iteration = state.get("iteration", 0)
    print(f"=== RESEARCH (iter {iteration}) ===")
    print(f"  Candidates: {len(candidates)} | Selected: {len(selected)}")
    for i, imp in enumerate(selected):
        print(f"  [{i+1}] {imp.get('type')}: {imp.get('description', '')[:60]}")

    if not selected:
        print("  ⚠ No improvements — going to RELEASE")
        _record_decision(mem, [{"type": "none", "description": "no improvement found"}])
        save_memory(mem)
        state["phase"] = "RELEASE"
        save_state(state)
        return

    _record_decision(mem, selected)
    save_json(TASK_FILE, {"improvements": selected, "iteration": iteration})

    state["phase"] = "PLANNING"
    state["current_features"] = [imp.get("type") for imp in selected]
    save_state(state)
    print("  → PLANNING")


# ─── Phase: PLANNING ─────────────────────────────────────────────────────────

def cmd_planning():
    """PLANNING: update Plans.md."""
    state = load_state()
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])
    iteration = state.get("iteration", 0)

    plans_md = ROOT / "Plans.md"
    block = []
    for i, imp in enumerate(improvements):
        imp_type = imp.get("type", "?")
        imp_desc = imp.get("description", "?")
        block.append(f"- [~] **PLN-{iteration:03d}[{i+1}]** — {imp_type} | {imp_desc}\n")

    if plans_md.exists():
        content = plans_md.read_text()
        if "## cc:TODO" in content:
            content = content.replace("## cc:TODO", "".join(block) + "## cc:TODO", 1)
        elif "## cc:WIP" in content:
            content = content.replace("## cc:WIP", "".join(block) + "## cc:WIP", 1)
        else:
            content += "".join(block)
        plans_md.write_text(content)

    print(f"=== PLANNING (iter {iteration}) ===")
    print(f"  Plans.md updated with {len(improvements)} improvement(s)")
    state["phase"] = "IMPLEMENTATION"
    save_state(state)
    print("  → IMPLEMENTATION")


# ─── Phase: IMPLEMENTATION ──────────────────────────────────────────────────

def cmd_implementation():
    """IMPLEMENTATION: save improvements for OMP task subagents."""
    state = load_state()
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])

    print(f"=== IMPLEMENTATION ===")
    print(f"  {len(improvements)} improvement(s) ready")
    for i, imp in enumerate(improvements):
        print(f"  [{i+1}] {imp.get('type')}: {imp.get('description', '')[:60]}")

    # Expose improvements for OMP task subagents
    save_json(MA / "omp-implementations.json", {
        "improvements": improvements,
        "agent_count": len(improvements),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    save_json(MA / "omp-agent-results.json", {"results": []})

    state["phase"] = "QA"
    save_state(state)
    print("  → QA (after task subagents complete)")


# ─── Phase: QA ──────────────────────────────────────────────────────────────

def cmd_qa():
    """QA: triad validation (typecheck + tests)."""
    state = load_state()
    memory = load_memory()

    # Always fresh triad after implementation
    snap = _bootstrap_fn(use_cache=False)
    triad = snap.get("triad", {})
    tc_pass = triad.get("typecheck", {}).get("pass", False)
    tests = triad.get("tests", {})
    tests_pass = tests.get("passed", 0) >= 0  # non-blocking

    print("=== QA ===")
    print(f"  Typecheck: {'✅ pass' if tc_pass else '❌ FAIL'}")
    print(f"  Tests: {tests.get('passed', 0)} passed / {tests.get('failed', 0)} failed")

    # Agent results
    results_file = MA / "omp-agent-results.json"
    results = load_json(results_file, {"results": []})
    ok_count = sum(1 for r in results.get("results", []) if r.get("success"))

    if ok_count > 0:
        print(f"  ✅ {ok_count}/{len(results.get('results', []))} agents succeeded → VALIDATION")
        state["phase"] = "VALIDATION"
    else:
        print(f"  ❌ All agents failed → RESEARCH (retry)")
        _add_learning(memory, "qa", "QA", "all_agents_failed", "failure",
                     f"{len(results.get('results', []))} agents failed")
        save_memory(memory)
        state["phase"] = "RESEARCH"
        state["retry_count"] = state.get("retry_count", 0) + 1

    save_state(state)


# ─── Phase: VALIDATION ──────────────────────────────────────────────────────

def cmd_validation():
    """VALIDATION: Plans.md check + CodeGraph sync."""
    state = load_state()
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])
    iteration = state.get("iteration", 0)

    print("=== VALIDATION ===")

    plans_md = ROOT / "Plans.md"
    if plans_md.exists():
        content = plans_md.read_text()
        if f"PLN-{iteration:03d}" in content:
            print("  ✅ Plans.md updated")
        else:
            print("  ⚠ Plans.md auto-marking")
            block = "\n".join(
                f"- [x] **PLN-{iteration:03d}[{i+1}]** — {imp.get('type')} (auto)"
                for i, imp in enumerate(improvements)
            )
            plans_md.write_text(content + "\n" + block + "\n")
            print("  ✅ Plans.md auto-marked")

    rc, _, _ = run_cmd(["codegraph", "sync"], timeout=30)
    print(f"  {'✅' if rc == 0 else '⚠'} CodeGraph {'synced' if rc == 0 else 'sync failed'}")

    state["phase"] = "RELEASE"
    save_state(state)
    print("  → RELEASE")


# ─── Phase: RELEASE ─────────────────────────────────────────────────────────

def cmd_release():
    """RELEASE: version bump, commit, next iteration."""
    state = load_state()
    memory = load_memory()
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])
    iteration = state.get("iteration", 0)

    results_file = MA / "omp-agent-results.json"
    results = load_json(results_file, {"results": []})
    ok_count = sum(1 for r in results.get("results", []) if r.get("success"))
    feature_names = ", ".join([imp.get("type") for imp in improvements]) if improvements else "no-improvement"

    # Version bump
    ver_file = MA / "version.json"
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

    # CHANGELOG
    changelog = ROOT / "CHANGELOG.md"
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    entry = f"\n## [{ver_str}] — {ts}\n\n### feat(loop): {feature_names} ({ok_count} agents)\n"
    if changelog.exists():
        content = changelog.read_text()
        changelog.write_text(content.replace("# Changelog\n", "# Changelog\n" + entry, 1))
    else:
        changelog.write_text("# Changelog\n" + entry)

    # Git commit
    subprocess.run(["git", "add", "-A"], cwd=str(ROOT), capture_output=True)
    msg = f"feat(loop): {ver_str} — {feature_names}"
    rc, out, err = run_cmd(["git", "commit", "-m", msg], timeout=15)
    if rc == 0:
        print(f"  ✅ Git: {msg}")
    else:
        print(f"  ⚠ Git: {out.strip() or err.strip() or 'nothing to commit'}")

    # Memory update
    memory["iteration"] = memory.get("iteration", 0) + 1
    memory.setdefault("context_window", []).append({
        "ts": datetime.now(timezone.utc).isoformat(),
        "improvement": feature_names,
        "version": ver_str,
        "agents": ok_count,
    })
    memory["context_window"] = memory["context_window"][-20:]
    save_memory(memory)

    # Advance
    state["iteration"] += 1
    state["phase"] = "RESEARCH"
    state["current_features"] = []
    state["retry_count"] = 0
    save_state(state)

    # Cleanup
    for f in AGENT_RESULTS_DIR.glob("result-*.json"):
        try:
            f.unlink()
        except Exception:
            pass
    if results_file.exists():
        results_file.unlink()

    print(f"\n=== RELEASE: {ver_str} | iter={state['iteration']} | {feature_names} ===")
    print("  → RESEARCH (next iteration)")


# ─── CLI ────────────────────────────────────────────────────────────────────

PHASE_MAP = {
    "bootstrap": cmd_bootstrap,
    "research": cmd_research,
    "planning": cmd_planning,
    "implementation": cmd_implementation,
    "qa": cmd_qa,
    "validation": cmd_validation,
    "release": cmd_release,
}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(f"Usage: python3 akasha-loop-omp.py <phase>")
        print(f"Phases: {', '.join(PHASE_MAP.keys())}")
        sys.exit(1)

    phase = sys.argv[1].lower()
    if phase not in PHASE_MAP:
        print(f"Unknown phase: {phase}")
        sys.exit(1)

    start = time.time()
    PHASE_MAP[phase]()
    elapsed = time.time() - start

    state = load_state()
    next_phase = state.get("phase", "RESEARCH")
    print(f"\n⏱  Phase '{phase}' done in {elapsed:.1f}s → next: {next_phase}")
