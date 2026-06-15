#!/usr/bin/env python3
"""
akasha-ralph-loop.py — Ralph-style autonomous evolution loop for AKASHA project.

6-phase state machine: RESEARCH → PLANNING → IMPLEMENTATION → QA →
                         VALIDATION → RELEASE → (back to RESEARCH)

Integrates:
  - CodeGraph (MCP)  — code intelligence, blast-radius analysis
  - Headroom (MCP)    — token compression for large tool outputs
  - OMP /loop         — schedule this script via: /loop 5m python3 akasha-ralph-loop.py --action=loop

State persisted in: .autonomous/ralph-loop/state.json
Session log:        .autonomous/ralph-loop/sessions/ralph-<iter>.log
Version tracker:     .autonomous/ralph-loop/version.json

Usage:
  python3 akasha-ralph-loop.py --action=start      # Initialize state
  python3 akasha-ralph-loop.py --action=loop      # Run ONE step
  python3 akasha-ralph-loop.py --action=status    # Show current state
  python3 akasha-ralph-loop.py --action=stop      # Write stop signal
  python3 akasha-ralph-loop.py --action=report     # Show iteration report
"""

import argparse
import json
import os
import sys
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# ─── Paths ────────────────────────────────────────────────────────────────────
ROOT = Path("/home/skynet/cabala-dos-caminhos")
STATE_FILE = ROOT / ".autonomous/ralph-loop/state.json"
VERSION_FILE = ROOT / ".autonomous/ralph-loop/version.json"
SESSIONS_DIR = ROOT / ".autonomous/ralph-loop/sessions"
LOGS_DIR = ROOT / ".autonomous/ralph-loop/logs"
FEATURE_LIST = ROOT / ".autonomous/feature_list.json"
STATE_DIR = ROOT / ".autonomous/state"
HEADROOM_VENV = ROOT / ".headroom-venv/bin/python"

os.makedirs(SESSIONS_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)

# ─── Phase definitions ────────────────────────────────────────────────────────
PHASES = ["RESEARCH", "PLANNING", "IMPLEMENTATION", "QA", "VALIDATION", "RELEASE"]

# ─── Utilities ────────────────────────────────────────────────────────────────

def load_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {
        "iteration": 0,
        "phase": "RESEARCH",
        "phase_iteration": 0,
        "version": "0.0.0",
        "pending_features": [],
        "done_features": [],
        "findings": [],
        "last_action": None,
        "last_updated": None,
        "errors": [],
        "tokens_saved_headroom": 0,
        "codegraph_queries": 0,
        "start_time": datetime.now(timezone.utc).isoformat(),
    }

def save_state(state: dict) -> None:
    state["last_updated"] = datetime.now(timezone.utc).isoformat()
    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False))

def load_version() -> dict:
    if VERSION_FILE.exists():
        return json.loads(VERSION_FILE.read_text())
    return {"major": 0, "minor": 0, "patch": 0, "changelog": []}

def save_version(ver: dict) -> None:
    VERSION_FILE.write_text(json.dumps(ver, indent=2, ensure_ascii=False))

def next_phase(current: str) -> str:
    idx = PHASES.index(current)
    return PHASES[(idx + 1) % len(PHASES)]

def bump_version(ver: dict, phase: str) -> dict:
    """Bump version based on release phase."""
    if phase == "RELEASE":
        ver["patch"] += 1
    elif phase == "VALIDATION":
        ver["minor"] += 1
        ver["patch"] = 0
    elif phase == "IMPLEMENTATION":
        ver["major"] += 1
        ver["minor"] = 0
        ver["patch"] = 0
    entry = {
        "version": f"{ver['major']}.{ver['minor']}.{ver['patch']}",
        "phase": phase,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    ver["changelog"].insert(0, entry)
    return ver

def log_session(state: dict, message: str) -> None:
    """Append to current session log."""
    session_num = state.get("session_num", state["iteration"])
    log_file = SESSIONS_DIR / f"ralph-{session_num:04d}.log"
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    line = f"[{ts}] {message}"
    with open(log_file, "a") as f:
        f.write(line + "\n")
    print(line)

def compress_text(text: str) -> tuple[str, str]:
    """
    Compress text using headroom MCP via subprocess.
    Returns (compressed_text, hash_id).
    Falls back to raw text + empty hash if headroom unavailable.
    """
    import tempfile
    tmp_in = tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False)
    tmp_in.write(text)
    tmp_in.close()
    try:
        result = __import__("subprocess").run(
            [str(HEADROOM_VENV), "-",
             tmp_in.name, tmp_in.name + ".compressed"],
            input=(
                f'import sys\n'
                f'import os\n'
                f"os.environ.setdefault('HEADROOM_QUIET', '1')\n"
                f"from headroom import compress\n"
                f"src = open('{tmp_in.name}').read()\n"
                f"result = compress(messages=[{{'role': 'user', 'content': src}}])\n"
                f"out = result.messages[0]['content'] if result.messages else ''\n"
                f"print(result.compression_ratio, result.tokens_before, result.tokens_after, result.tokens_saved, file=sys.stderr)\n"
                f"open('{tmp_in.name}.compressed', 'w').write(out)\n"
            ),
            capture_output=True, text=True, timeout=60
        )
        ratio = 0.0
        saved = 0
        if result.returncode == 0 and os.path.exists(tmp_in.name + ".compressed"):
            compressed = open(tmp_in.name + ".compressed").read()
            try:
                ratio = float(result.stderr.split()[0])
                saved = int(result.stderr.split()[3]) if len(result.stderr.split()) > 3 else 0
            except (ValueError, IndexError):
                pass
            hash_id = hashlib.md5(compressed.encode()).hexdigest()[:12]
            return compressed, hash_id
    except Exception:
        pass
    finally:
        for f in [tmp_in.name, tmp_in.name + ".compressed"]:
            try:
                os.unlink(f)
            except OSError:
                pass
    return text, ""


def run_codegraph(query: str) -> str:
    """Run codegraph explore and return result. Falls back to empty on failure."""
    try:
        result = __import__("subprocess").run(
            ["codegraph", "explore", query],
            capture_output=True, text=True, timeout=30,
            cwd=str(ROOT)
        )
        return result.stdout if result.returncode == 0 else ""
    except Exception:
        return ""

# ─── Phase executors ──────────────────────────────────────────────────────────

def do_RESEARCH(state: dict) -> dict:
    """
    RESEARCH: Analyze pending features, codegraph blast radius,
    identify blockers and opportunities.
    """
    log_session(state, "PHASE: RESEARCH")
    state["phase"] = "RESEARCH"
    state["phase_iteration"] += 1

    findings = state.get("findings", [])
    pending = load_pending_features()

    if not pending:
        state["pending_features"] = []
        state["phase"] = "PLANNING"
        state["phase_iteration"] = 0
        log_session(state, "  → No pending features. Skipping to PLANNING.")
        return state

    # Pick top priority feature
    feature = pending[0]
    fid = feature.get("id", "?")
    title = feature.get("title", feature.get("description", ""))
    log_session(state, f"  → Analyzing: {fid} — {title[:60]}")

    # Run codegraph queries for the feature
    codegraph_queries = 0

    # Query 1: what files does this feature touch?
    cg_result = run_codegraph(f"architecture {fid} {title}")
    if cg_result:
        codegraph_queries += 1
        # Compress large results
        if len(cg_result) > 5000:
            compressed, hid = compress_text(cg_result)
            findings.append({
                "feature": fid,
                "type": "codegraph_architecture",
                "summary": cg_result[:200] + "..." if len(cg_result) > 200 else cg_result,
                "compressed_id": hid,
                "ratio_estimate": f"{len(compressed)/max(len(cg_result),1):.2f}",
            })
            log_session(state, f"  → CodeGraph compressed ({hid[:6]}, ratio {len(compressed)/max(len(cg_result),1):.2f})")
        else:
            findings.append({
                "feature": fid,
                "type": "codegraph_architecture",
                "summary": cg_result[:300],
            })

    state["findings"] = findings[-50:]  # keep last 50
    state["codegraph_queries"] = state.get("codegraph_queries", 0) + codegraph_queries

    # Move to PLANNING
    state["pending_features"] = pending[1:]
    state["phase"] = "PLANNING"
    state["phase_iteration"] = 0
    log_session(state, f"  → {fid} analyzed. Moving to PLANNING.")
    return state


def do_PLANNING(state: dict) -> dict:
    """
    PLANNING: Create/update Plans.md, spec docs, task breakdown.
    """
    log_session(state, "PHASE: PLANNING")
    state["phase"] = "PLANNING"
    state["phase_iteration"] += 1

    plans_md = ROOT / "Plans.md"
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # Read current plans
    current_content = ""
    if plans_md.exists():
        current_content = plans_md.read_text()

    # Add new planning block
    iteration = state["iteration"]
    new_block = (
        f"\n## cc: Ralph-loop iter {iteration} ({ts})\n\n"
        f"- [ ] **PLN-{iteration:03d}** — Ralph-loop iteration {iteration}\n"
        f"  - Phase: {state.get('phase', '?')} → RESEARCH → ... → RELEASE\n"
        f"  - Features analyzed: {len(state.get('findings', []))}\n"
        f"  - CodeGraph queries: {state.get('codegraph_queries', 0)}\n"
        f"  - Headroom tokens saved: {state.get('tokens_saved_headroom', 0)}\n"
    )

    # Append before EOF marker
    if "## cc:TODO" in current_content:
        content = current_content.replace("## cc:TODO", new_block + "\n## cc:TODO", 1)
    else:
        content = current_content + new_block

    plans_md.write_text(content)
    log_session(state, f"  → Plans.md updated (PLN-{iteration:03d})")

    state["phase"] = "IMPLEMENTATION"
    state["phase_iteration"] = 0
    return state


def do_IMPLEMENTATION(state: dict) -> dict:
    """
    IMPLEMENTATION: Execute the feature work.
    For Ralph-loop inside OMP: marks the plan item as in-progress
    and instructs next /loop iteration to handle via harness-work.
    """
    log_session(state, "PHASE: IMPLEMENTATION")
    state["phase"] = "IMPLEMENTATION"
    state["phase_iteration"] += 1

    iteration = state["iteration"]

    # Update Plans.md — mark PLN as WIP
    plans_md = ROOT / "Plans.md"
    if plans_md.exists():
        content = plans_md.read_text()
        marker = f"**PLN-{iteration:03d}**"
        if f"[ ] {marker}" in content:
            content = content.replace(f"[ ] {marker}", f"[~] {marker}")
            plans_md.write_text(content)
            log_session(state, f"  → {marker} marked WIP in Plans.md")

    # Signal to OMP: next loop should run harness-work for this iteration
    signal_file = ROOT / ".autonomous/ralph-loop/.next_action.json"
    signal_file.write_text(json.dumps({
        "action": "implement",
        "iteration": iteration,
        "plan_id": f"PLN-{iteration:03d}",
        "phase": "IMPLEMENTATION",
        "instructions": (
            f"Execute Plans.md item PLN-{iteration:03d}. "
            "Use CodeGraph for architecture. Use Headroom for large outputs. "
            "Run triad (typecheck + tests + lint) after changes. "
            "Commit with conventional commit prefix."
        )
    }, indent=2))

    state["phase"] = "QA"
    state["phase_iteration"] = 0
    log_session(state, "  → IMPLEMENTATION signaled for next /loop iteration")
    return state


def do_QA(state: dict) -> dict:
    """
    QA: Run triad (typecheck + tests + lint) and compress results.
    """
    log_session(state, "PHASE: QA")
    state["phase"] = "QA"
    state["phase_iteration"] += 1

    iteration = state["iteration"]

    # Run typecheck
    log_session(state, "  → Running typecheck...")
    tc_result = run_cmd(["pnpm", "--filter", "akasha-portal", "typecheck"], timeout=120)
    tc_pass = tc_result.returncode == 0

    # Run tests
    log_session(state, "  → Running tests...")
    test_result = run_cmd(["pnpm", "--filter", "akasha-portal", "test:run"], timeout=180)
    test_pass = test_result.returncode == 0

    # Run lint
    log_session(state, "  → Running lint...")
    lint_result = run_cmd(["pnpm", "--filter", "akasha-portal", "lint"], timeout=60)
    lint_pass = lint_result.returncode == 0

    # Compress results if large
    for label, result in [("typecheck", tc_result), ("tests", test_result), ("lint", lint_result)]:
        if len(result.stdout) > 5000:
            compressed, hid = compress_text(result.stdout)
            log_session(state, f"  → {label} output compressed (id={hid[:6]})")
            state["tokens_saved_headroom"] = state.get("tokens_saved_headroom", 0) + (len(result.stdout) - len(compressed))

    all_pass = tc_pass and test_pass and lint_pass

    log_session(state, f"  → QA results: typecheck={'✅' if tc_pass else '❌'} tests={'✅' if test_pass else '❌'} lint={'✅' if lint_pass else '❌'}")

    if all_pass:
        state["phase"] = "VALIDATION"
    else:
        # Stay in QA — next iteration will retry
        state["phase"] = "QA"
        state.setdefault("errors", []).append({
            "iteration": iteration,
            "phase": "QA",
            "typecheck": tc_pass,
            "tests": test_pass,
            "lint": lint_pass,
        })
        log_session(state, "  → QA failed — will retry next iteration")

    state["phase_iteration"] = 0
    return state


def do_VALIDATION(state: dict) -> dict:
    """
    VALIDATION: Meta-review, DOX compliance check, backward compatibility.
    """
    log_session(state, "PHASE: VALIDATION")
    state["phase"] = "VALIDATION"
    state["phase_iteration"] += 1

    iteration = state["iteration"]

    # CodeGraph sync check
    cg_status = run_cmd(["codegraph", "status"], timeout=30)
    sync_ok = "Pending Changes: 0" in cg_status.stdout or "Already up to date" in cg_status.stdout

    # DOX check: count AGENTS.md coverage
    agents_count = len(list(ROOT.glob("**/AGENTS.md")))
    log_session(state, f"  → CodeGraph sync: {'✅' if sync_ok else '⚠️'} | AGENTS.md files: {agents_count}")

    # Check Plans.md is updated
    plans_ok = False
    plans_md = ROOT / "Plans.md"
    if plans_md.exists():
        content = plans_md.read_text()
        plans_ok = f"PLN-{iteration:03d}" in content

    if plans_ok and sync_ok:
        state["phase"] = "RELEASE"
        log_session(state, "  → VALIDATION passed. Moving to RELEASE.")
    else:
        state.setdefault("errors", []).append({
            "iteration": iteration,
            "phase": "VALIDATION",
            "sync_ok": sync_ok,
            "plans_ok": plans_ok,
        })
        log_session(state, "  → VALIDATION issues — will retry next iteration")

    state["phase_iteration"] = 0
    return state


def do_RELEASE(state: dict) -> dict:
    """
    RELEASE: Bump version, commit, tag, changelog entry.
    """
    log_session(state, "PHASE: RELEASE")
    state["phase"] = "RELEASE"
    state["phase_iteration"] += 1

    iteration = state["iteration"]
    ver = load_version()
    new_ver = bump_version(ver, "RELEASE")
    version_str = f"{new_ver['major']}.{new_ver['minor']}.{new_ver['patch']}"
    save_version(new_ver)

    log_session(state, f"  → Version: {ver['major']}.{ver['minor']}.{ver['patch']} → {version_str}")

    # Update VERSION file
    version_file = ROOT / "VERSION"
    version_file.write_text(version_str + "\n")

    # Update CHANGELOG.md
    changelog_file = ROOT / "CHANGELOG.md"
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    changelog_entry = f"\n## [{version_str}] — {ts}\n\n### Ralph-loop iter {iteration}\n\n"
    if changelog_file.exists():
        content = changelog_file.read_text()
        changelog_file.write_text(content.replace("# Changelog\n", "# Changelog\n" + changelog_entry, 1))
    else:
        changelog_file.write_text("# Changelog\n" + changelog_entry)

    # Mark Plans.md as done
    plans_md = ROOT / "Plans.md"
    if plans_md.exists():
        content = plans_md.read_text()
        marker = f"**PLN-{iteration:03d}**"
        if f"[~] {marker}" in content:
            content = content.replace(f"[~] {marker}", f"[x] {marker}")
            plans_md.write_text(content)
            log_session(state, f"  → {marker} marked DONE in Plans.md")

    # Git commit + tag
    run_cmd(["git", "add", "-A"], cwd=str(ROOT))
    tag_name = f"v{version_str}"
    commit_msg = f"chore(release): {tag_name} (Ralph-loop iter {iteration})"
    run_cmd(["git", "commit", "-m", commit_msg], cwd=str(ROOT))

    # Only tag on stable releases (not 0.x.y)
    if new_ver["major"] > 0:
        run_cmd(["git", "tag", "-a", tag_name, "-m", commit_msg], cwd=str(ROOT))
        log_session(state, f"  → Git tag created: {tag_name}")

    log_session(state, f"  → RELEASE complete: {tag_name}")

    # Advance to next iteration
    state["version"] = version_str
    state["iteration"] += 1
    state["phase"] = "RESEARCH"
    state["phase_iteration"] = 0
    return state


def run_cmd(cmd: list, timeout: int = 60, cwd: str = None) -> __import__("subprocess").CompletedProcess:
    """Run a command, return CompletedProcess."""
    return __import__("subprocess").run(
        cmd, capture_output=True, text=True, timeout=timeout,
        cwd=cwd or str(ROOT)
    )

def load_pending_features() -> list:
    """Load pending features from feature_list.json."""
    if not FEATURE_LIST.exists():
        return []
    try:
        data = json.loads(FEATURE_LIST.read_text())
        return [f for f in data if not f.get("passes", False)]
    except (json.JSONDecodeError, IOError):
        return []

# ─── Main dispatch ────────────────────────────────────────────────────────────

def action_start(state: dict) -> None:
    """Initialize or reset state."""
    state = load_state()
    state["iteration"] = 0
    state["phase"] = "RESEARCH"
    state["phase_iteration"] = 0
    state["findings"] = []
    state["errors"] = []
    state["start_time"] = datetime.now(timezone.utc).isoformat()
    save_state(state)
    print("✅ Ralph-loop state initialized.")
    print(f"   Phase: RESEARCH | Iteration: 0 | Version: {state['version']}")

def action_loop(state: dict) -> None:
    """Run one Ralph-loop step."""
    state = load_state()

    # Check stop signal
    stop_signal = STATE_DIR / "stop.signal"
    if stop_signal.exists():
        print("⏹  Stop signal detected. Ralph-loop halted.")
        print(f"   Final state: iter={state['iteration']} phase={state['phase']}")
        return

    iteration = state["iteration"]
    phase = state["phase"]
    phase_iter = state["phase_iteration"]

    print(f"→ Ralph-loop iter {iteration} | phase={phase} (#{phase_iter+1})")

    # Route to phase executor
    if phase == "RESEARCH":
        state = do_RESEARCH(state)
    elif phase == "PLANNING":
        state = do_PLANNING(state)
    elif phase == "IMPLEMENTATION":
        state = do_IMPLEMENTATION(state)
    elif phase == "QA":
        state = do_QA(state)
    elif phase == "VALIDATION":
        state = do_VALIDATION(state)
    elif phase == "RELEASE":
        state = do_RELEASE(state)
    else:
        state["phase"] = "RESEARCH"

    save_state(state)

    # Summary line
    ver = load_version()
    print(f"  done | phase={state['phase']} | ver={ver['major']}.{ver['minor']}.{ver['patch']} "
          f"| findings={len(state.get('findings', []))} "
          f"| cg_queries={state.get('codegraph_queries', 0)} "
          f"| headroom_saved={state.get('tokens_saved_headroom', 0)} tokens")

def action_status(state: dict) -> None:
    """Show current state."""
    state = load_state()
    ver = load_version()
    pending = load_pending_features()

    print("═══ AKASHA Ralph-loop Status ═══")
    print(f"  Iteration:    {state['iteration']}")
    print(f"  Phase:        {state['phase']} (phase iter #{state['phase_iteration']+1})")
    print(f"  Version:      {ver['major']}.{ver['minor']}.{ver['patch']}")
    print(f"  Pending:      {len(pending)} features")
    print(f"  Findings:     {len(state.get('findings', []))}")
    print(f"  CodeGraph:   {state.get('codegraph_queries', 0)} queries")
    print(f"  Headroom:    {state.get('tokens_saved_headroom', 0)} tokens saved")
    print(f"  Errors:      {len(state.get('errors', []))}")
    print(f"  Started:      {state.get('start_time', '?')}")
    print(f"  Last update:  {state.get('last_updated', '?')}")
    print()
    print("  Phases: RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE")
    print(f"  Current → {state['phase']}")

def action_report(state: dict) -> None:
    """Show iteration report."""
    state = load_state()
    ver = load_version()

    print("═══ AKASHA Ralph-loop Report ═══")
    print(f"  Iterations completed: {state['iteration']}")
    print(f"  Current phase:       {state['phase']}")
    print(f"  Version:             {ver['major']}.{ver['minor']}.{ver['patch']}")
    print(f"  Total findings:      {len(state.get('findings', []))}")
    print(f"  CodeGraph queries:   {state.get('codegraph_queries', 0)}")
    print(f"  Headroom tokens:     {state.get('tokens_saved_headroom', 0)}")
    print(f"  Errors:              {len(state.get('errors', []))}")
    print()

    # Last 5 findings
    findings = state.get("findings", [])
    if findings:
        print("  Last 5 findings:")
        for f in findings[-5:]:
            print(f"    [{f.get('feature','?')}] {f.get('type','?')}: {f.get('summary','')[:80]}")
    print()

    # Errors
    errors = state.get("errors", [])
    if errors:
        print(f"  Last 3 errors:")
        for e in errors[-3:]:
            print(f"    iter={e.get('iteration')} phase={e.get('phase')} → {e}")

def action_stop(state: dict) -> None:
    """Write stop signal."""
    stop_signal = STATE_DIR / "stop.signal"
    stop_signal.write_text(
        f"stop requested at {datetime.now(timezone.utc).isoformat()}\n"
    )
    print(f"⏹  Stop signal written to {stop_signal}")
    print("   The Ralph-loop will halt after the current iteration completes.")

# ─── CLI entry point ──────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="AKASHA Ralph-loop orchestrator")
    parser.add_argument("--action", "-a",
                        choices=["start", "loop", "status", "report", "stop"],
                        default="loop",
                        help="Action to perform")
    args = parser.parse_args()

    state = load_state()

    if args.action == "start":
        action_start(state)
    elif args.action == "loop":
        action_loop(state)
    elif args.action == "status":
        action_status(state)
    elif args.action == "report":
        action_report(state)
    elif args.action == "stop":
        action_stop(state)

if __name__ == "__main__":
    main()
