#!/usr/bin/env python3
"""
akasha-multi-agent-loop.py — Intelligent multi-agent autonomous loop.

6-phase state machine with exponential learning:
  RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE

Key principles:
  1. BOOTSTRAP FIRST: before ANY action, rebuild context from real sources
  2. CODEGRAPH-FIRST: architecture questions → codegraph_explore (never blind reads)
  3. HEADROOM: compress large tool outputs (>5k tokens)
  4. INTELLIGENT DECISIONS: use intelligence.py to pick tasks + decide next phase
  5. EXPONENTIAL LEARNING: memory.json grows smarter each iteration
  6. AGENTS GET FRESH CONTEXT: every agent spawn gets the latest snapshot injected

Usage:
  python3 akasha-multi-agent-loop.py --action=loop
  python3 akasha-multi-agent-loop.py --action=status
  python3 akasha-multi-agent-loop.py --action=stop
"""

import argparse
import json
import os
import sys
import subprocess
import concurrent.futures
import tempfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous/multi-agent"
MEMORY_FILE = MA / "memory.json"
SNAPSHOT_FILE = MA / "context_snapshot.json"
STATE_FILE = MA / "state.json"
LOGS_DIR = MA / "logs"
SESSION_DIR = MA / "sessions"
OMP = "/home/skynet/.bun/bin/omp"
PY_HEADROOM = ROOT / ".headroom-venv/bin/python"

os.makedirs(MA, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)
os.makedirs(SESSION_DIR, exist_ok=True)

# ─── Agent definitions ──────────────────────────────────────────────────────

AGENTS = ["researcher", "architect", "coder", "qa", "validator"]

AGENT_PROMPTS = {
    "researcher": """You are ResearcherAgent — web research, competitive analysis, external context.

RULES:
- Use web_search for external information
- Use codegraph_explore before touching codebase
- headroom_compress for outputs > 5k tokens
- Cite sources for all external claims
- Write JSON result to RESULT_FILE

OUTPUT FORMAT (write to RESULT_FILE):
{{"status": "ok|error", "summary": "...", "findings": [{{"source": "...", "claim": "...", "url": "..."}}], "files_changed": [], "tokens_saved": 0}}""",

    "architect": """You are ArchitectAgent — system design, blast-radius, isomorpisms, tradeoffs.

RULES:
- codegraph_explore is MANDATORY for all architecture questions
- Analyze blast radius of proposed changes
- Identify isomorpisms with existing patterns
- Document tradeoffs with evidence
- Write JSON result to RESULT_FILE

OUTPUT FORMAT (write to RESULT_FILE):
{{"status": "ok|error", "summary": "...", "findings": [{{"type": "architecture|isomorpism|tradeoff", "description": "..."}}], "files_changed": [], "tokens_saved": 0}}""",

    "coder": """You are CoderAgent — implementation, refactoring, triad execution, git commit.

RULES:
- codegraph_explore before touching unknown code
- Run triad AFTER every file change: typecheck → tests → lint
- NEVER commit if triad fails
- Use headroom_compress for large outputs
- Write JSON result to RESULT_FILE

OUTPUT FORMAT (write to RESULT_FILE):
{{"status": "ok|error", "summary": "...", "findings": [], "files_changed": ["path/..."], "commits": ["msg"], "tokens_saved": 0}}""",

    "qa": """You are QAAgent — test execution, quality gates, regression analysis.

RULES:
- Run full triad and report EACH tool separately
- Categorize failures: pre-existing vs introduced-by-this-change
- Use codegraph_explore to understand coverage gaps
- headroom_compress large test output
- Write JSON result to RESULT_FILE

OUTPUT FORMAT (write to RESULT_FILE):
{{"status": "ok|error", "summary": "...", "findings": [{{"test": "...", "status": "pass|fail|skipped", "category": "pre-existing|introduced"}}], "tokens_saved": 0}}""",

    "validator": """You are ValidatorAgent — meta-review, DOX compliance, backwards compat.

RULES:
- Verify AGENTS.md chain is complete for all modified paths
- Check backwards compat of API/schema changes
- Verify Plans.md is updated
- Run codegraph sync verification
- Write JSON result to RESULT_FILE

OUTPUT FORMAT (write to RESULT_FILE):
{{"status": "ok|error", "summary": "...", "findings": [{{"type": "dox|compat|plans", "description": "..."}}], "tokens_saved": 0}}""",
}

# ─── Utilities ────────────────────────────────────────────────────────────────

def log(msg: str) -> None:
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    log_file = LOGS_DIR / f"loop-{datetime.now(timezone.utc).strftime('%Y%m%d')}.log"
    with open(log_file, "a") as f:
        f.write(line + "\n")


def load_json(path: Path, default=None):
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            pass
    return default if default is not None else {}


def save_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))


def compress_text(text: str) -> tuple[str, int]:
    """Compress via headroom. Returns (compressed, tokens_saved)."""
    if len(text) < 5000:
        return text, 0
    tmp_in = tmp_out = None
    try:
        tmp_in = tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False)
        tmp_in.write(text); tmp_in.close()
        tmp_out = tmp_in.name + ".compressed"
        r = subprocess.run(
            [str(PY_HEADROOM), "-", tmp_in.name, tmp_out],
            input=(
                "import sys,os; os.environ['HEADROOM_QUIET']='1\n"
                "from headroom import compress\n"
                f"src=open('{tmp_in.name}').read()\n"
                "R=compress(messages=[{'role':'user','content':src}])\n"
                "out=R.messages[0]['content'] if R.messages else ''\n"
                f"open('{tmp_out}','w').write(out)\n"
                "print(R.tokens_saved)\n"
            ),
            capture_output=True, text=True, timeout=60
        )
        if r.returncode == 0 and os.path.exists(tmp_out):
            saved = int(r.stdout.strip() or "0")
            return open(tmp_out).read(), saved
    except Exception:
        pass
    finally:
        for f in [tmp_in.name, tmp_out]:
            try:
                os.unlink(f)
            except OSError:
                pass
    return text, 0


def cg_explore(query: str, max_lines: int = 100) -> str:
    """Run codegraph explore."""
    try:
        r = subprocess.run(
            ["codegraph", "explore", query],
            capture_output=True, text=True, timeout=45, cwd=str(ROOT)
        )
        if r.returncode == 0 and r.stdout.strip():
            lines = r.stdout.splitlines()
            return "\n".join(lines[:max_lines])
    except Exception:
        pass
    return ""


# ─── Bootstrap ───────────────────────────────────────────────────────────────

def bootstrap() -> dict:
    """
    Load ALL project context. This runs BEFORE every action.
    Returns a fresh context snapshot.
    """
    # Import here to keep module boundaries clean
    sys.path.insert(0, str(MA))
    from context_bootstrap import build_snapshot, save_snapshot, load_snapshot

    snap = build_snapshot()
    save_snapshot(snap)
    return snap


def load_memory() -> dict:
    return load_json(MEMORY_FILE, {
        "iteration": 0, "learnings": [], "task_history": [],
        "context_window": [], "decisions": [], "error_patterns": {}, "success_patterns": {},
    })


def save_memory(mem: dict) -> None:
    save_json(MEMORY_FILE, mem)


def load_state() -> dict:
    return load_json(STATE_FILE, {
        "phase": "RESEARCH", "iteration": 0, "phase_iteration": 0,
        "current_feature": None, "retry_count": 0,
    })


def save_state(state: dict) -> None:
    save_json(STATE_FILE, state)


# ─── Intelligence ────────────────────────────────────────────────────────────

def make_decision(snapshot: dict, memory: dict, current_phase: str) -> dict:
    """Use intelligence.py to make evidence-based decisions."""
    sys.path.insert(0, str(MA))
    from intelligence import (
        make_decision as intel_decide, update_context_window,
        synthesize_agent_results, add_learning, get_recent_learnings,
    )
    return intel_decide(snapshot, memory, current_phase)


# ─── Agent spawner ──────────────────────────────────────────────────────────

def spawn_agent(agent: str, feature: dict, snapshot: dict,
                timeout: int = 300) -> dict:
    """
    Spawn one OMP agent. The agent gets FRESH context (snapshot) injected
    into its system prompt so it never relies on stale information.
    """
    result_file = MA / f"result-{agent}.json"
    task_file = MA / f"task-{agent}.json"
    log_file = LOGS_DIR / f"agent-{agent}-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S')}.log"

    if result_file.exists():
        result_file.unlink()

    fid = feature.get("id", "?")
    ftitle = feature.get("title", feature.get("description", ""))[:80]

    # Build fresh context summary for this agent
    triad = snapshot.get("triad", {})
    cg = snapshot.get("codegraph", {})
    features = snapshot.get("features", {})
    plans = snapshot.get("plans", {})

    context_block = f"""
=== PROJECT CONTEXT (fresh snapshot: {snapshot.get('generated_at', '?')}) ===

VERSION: {snapshot.get('version', '?')}
FEATURES: {features.get('pending_count', 0)} pending / {features.get('done_count', 0)} done
TOP PENDING: {[f['id'] for f in features.get('top_pending', [])[:5]]}
CURRENT FEATURE: {fid} — {ftitle}
ITERATION: {snapshot.get('iteration', 0)}

CODOGRAPH STATUS:
  Files: {cg.get('stats', {}).get('files', '?')}
  Nodes: {cg.get('stats', {}).get('nodes', '?')}
  Needs sync: {cg.get('needs_sync', False)}

TRIAD STATUS:
  typecheck: {triad.get('typecheck', {}).get('pass', False)}
  tests: {triad.get('tests', {}).get('pass', False)} ({triad.get('tests', {}).get('passed', 0)} passed, {triad.get('tests', {}).get('failed', 0)} failed)
  lint: {triad.get('lint', {}).get('pass', False)}

PLANS STATUS:
  Pending: {plans.get('pending', [])[:5]}
  Done: {plans.get('done', [])[-5:]}

=== CODEGRAPH ARCHITECTURE (relevant to {fid}) ===
"""

    # Add relevant architecture from CodeGraph
    arch = cg.get("architecture", {})
    for key, val in arch.items():
        if isinstance(val, dict):
            context_block += f"\n[{key}]:\n{val.get('compressed', val)[:200]}\n"
        else:
            context_block += f"\n[{key}]:\n{str(val)[:200]}\n"

    system_prompt = f"""You are {agent.title()}Agent for the AKASHA spiritual technology project.

{AGENT_PROMPTS[agent]}

{context_block}

IMPORTANT:
- Write your JSON result to: {result_file}
- Use codegraph_explore before making architectural claims
- This is a REAL project with real code. Do not fabricate.
- Your job is to help advance feature {fid}: {ftitle}
"""

    # Write log header
    with open(log_file, "w") as f:
        f.write(f"# Agent: {agent} | Feature: {fid}\n")
        f.write(f"# Spawned: {datetime.now(timezone.utc).isoformat()}\n")
        f.write(f"# Result: {result_file}\n\n")

    # Spawn OMP agent
    env = {**os.environ, "HEADROOM_QUIET": "1",
           "ANTHROPIC_BASE_URL": "http://127.0.0.1:8787"}
    proc = subprocess.Popen(
        [
            OMP, "-p",
            "--no-lsp", "--no-rules", "--no-extensions", "--no-skills",
            "--system-prompt", system_prompt,
            "--session-dir", str(SESSION_DIR / agent),
            "--auto-approve",
            f"You are {agent}Agent. Work on feature {fid}: {ftitle}. Write JSON result to {result_file}.",
        ],
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
        cwd=str(ROOT), env=env
    )

    # Stream output to log
    for line in proc.stdout:
        with open(log_file, "a") as f:
            f.write(line)

    proc.wait()

    # Read result
    result = load_json(result_file, {"status": "error", "summary": "no result"})
    result["log_file"] = str(log_file)
    result["agent"] = agent
    result["returncode"] = proc.returncode
    return result


def spawn_all_agents(feature: dict, snapshot: dict,
                      timeout_per: int = 300) -> dict:
    """Spawn all 5 agents in parallel."""
    results = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
        futures = {
            ex.submit(spawn_agent, agent, feature, snapshot, timeout_per): agent
            for agent in AGENTS
        }
        for future in concurrent.futures.as_completed(futures, timeout=timeout_per + 60):
            agent = futures[future]
            try:
                results[agent] = future.result()
            except Exception as e:
                results[agent] = {"status": "error", "summary": str(e), "agent": agent}
            status = results[agent].get("status", "?")
            summary = results[agent].get("summary", "")[:80]
            log(f"  ← [{agent}] {status}: {summary}")

    return results


# ─── Phase executors ─────────────────────────────────────────────────────────

def phase_RESEARCH(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """Research phase: spawn all agents, synthesize findings."""
    log("PHASE: RESEARCH")
    decision = make_decision(snapshot, memory, "RESEARCH")

    if decision.get("action") == "BLOCKED":
        log(f"  BLOCKED: {decision.get('blocking_reason', '?')}")
        return state, memory, snapshot

    if decision.get("action") == "IDLE":
        log("  IDLE: No suitable task found.")
        state["phase"] = "RELEASE"
        return state, memory, snapshot

    feature = decision.get("feature")
    if not feature:
        state["phase"] = "PLANNING"
        return state, memory, snapshot

    fid = feature.get("id", "?")
    state["current_feature"] = fid
    log(f"  → Researching: {fid} — {feature.get('title', '')[:60]}")

    # Run all 5 agents in parallel
    results = spawn_all_agents(feature, snapshot, timeout_per=180)

    # Synthesize
    sys.path.insert(0, str(MA))
    from intelligence import synthesize_agent_results, add_learning

    synthesis = synthesize_agent_results(results, feature, memory)
    total_saved = sum(r.get("tokens_saved", 0) for r in results.values())

    log(f"  → Research done: {synthesis['total_findings']} findings, "
        f"{total_saved} tokens saved, {len(synthesis['errors'])} errors")

    memory["iteration"] = memory.get("iteration", 0) + 1
    save_memory(memory)

    state["phase"] = "PLANNING"
    state["phase_iteration"] = 0
    return state, memory, snapshot


def phase_PLANNING(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """Planning phase: update Plans.md with research synthesis."""
    log("PHASE: PLANNING")

    from intelligence import get_recent_learnings
    fid = state.get("current_feature", f"iter-{state['iteration']}")
    recent = get_recent_learnings(memory, n=10)

    iteration = state.get("iteration", 0)
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    ver = load_json(ROOT / ".autonomous/ralph-loop/version.json",
                    {"major": 0, "minor": 0, "patch": 0})
    ver_str = f"{ver['major']}.{ver['minor']}.{ver['patch']}"

    lines = [
        f"## cc: Ralph-loop iter {iteration} | {fid} ({ts})\n",
        f"- [~] **PLN-{iteration:03d}** — {fid} | ver {ver_str}\n",
        f"  - Phase: RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE\n",
        f"  - Recent learnings: {len(recent)}\n",
    ]
    for l in recent[-5:]:
        lines.append(f"  - [{l.get('agent', '?')}] {l.get('summary', '')[:100]}\n")

    plans_md = ROOT / "Plans.md"
    if plans_md.exists():
        content = plans_md.read_text()
        if "## cc:TODO" in content:
            content = content.replace("## cc:TODO", "".join(lines) + "\n## cc:TODO", 1)
    else:
        content = "".join(lines)
    plans_md.write_text(content)

    log(f"  → Plans.md updated (PLN-{iteration:03d})")

    state["phase"] = "IMPLEMENTATION"
    state["phase_iteration"] = 0
    return state, memory, snapshot


def phase_IMPLEMENTATION(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """Implementation phase: run coder + architect + researcher in parallel."""
    log("PHASE: IMPLEMENTATION")

    fid = state.get("current_feature", "?")
    log(f"  → Implementing: {fid}")

    # Run coder + architect + researcher
    for agent in ["coder", "architect", "researcher"]:
        task_file = MA / f"task-{agent}.json"
        if task_file.exists():
            result = spawn_agent(agent, {"id": fid, "title": fid}, snapshot, timeout=600)
            summary = result.get("summary", "")[:200]
            tokens = result.get("tokens_saved", 0)
            log(f"  → [{agent}] {result.get('status', '?')}: {summary[:100]}")
            if result.get("status") == "error":
                sys.path.insert(0, str(MA))
                from intelligence import add_learning
                add_learning(memory, agent, "IMPLEMENTATION", fid, "failure", summary)
            else:
                sys.path.insert(0, str(MA))
                from intelligence import add_learning
                add_learning(memory, agent, "IMPLEMENTATION", fid, "success", summary[:200])

    # Re-run bootstrap to get updated snapshot (triad may have changed)
    snapshot = bootstrap()

    state["phase"] = "QA"
    state["phase_iteration"] = 0
    return state, memory, snapshot


def phase_QA(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """QA phase: run QA + validator agents."""
    log("PHASE: QA")

    fid = state.get("current_feature", "?")

    for agent in ["qa", "validator"]:
        result = spawn_agent(agent, {"id": fid, "title": fid}, snapshot, timeout=300)
        summary = result.get("summary", "")[:200]
        log(f"  → [{agent}] {result.get('status', '?')}: {summary[:100]}")

        sys.path.insert(0, str(MA))
        from intelligence import add_learning
        outcome = "success" if result.get("status") == "ok" else "failure"
        add_learning(memory, agent, "QA", fid, outcome, summary[:200])

    # Check if triad is now green
    triad = snapshot.get("triad", {})
    all_green = all(t.get("pass", False) for t in triad.values() if isinstance(t, dict))

    if all_green:
        state["phase"] = "VALIDATION"
        state["retry_count"] = 0
    else:
        state["phase"] = "IMPLEMENTATION"
        state["retry_count"] = state.get("retry_count", 0) + 1
        log(f"  → Triad not green, retry #{state['retry_count']}")

    state["phase_iteration"] = 0
    return state, memory, snapshot


def phase_VALIDATION(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """Validation phase: meta-review, DOX check."""
    log("PHASE: VALIDATION")

    fid = state.get("current_feature", "?")
    result = spawn_agent("validator", {"id": fid, "title": fid}, snapshot, timeout=180)
    summary = result.get("summary", "")[:200]

    sys.path.insert(0, str(MA))
    from intelligence import add_learning, update_context_window

    outcome = "success" if result.get("status") == "ok" else "failure"
    add_learning(memory, "validator", "VALIDATION", fid, outcome, summary[:200])

    if result.get("status") == "ok":
        state["phase"] = "RELEASE"
    else:
        state["phase"] = "IMPLEMENTATION"
        log(f"  → Validation failed, retrying")

    state["phase_iteration"] = 0
    return state, memory, snapshot


def phase_RELEASE(state: dict, memory: dict, snapshot: dict) -> tuple[dict, dict, dict]:
    """Release phase: bump version, commit, tag."""
    log("PHASE: RELEASE")

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
        log(f"  → Git commit: {msg}")
        if ver["major"] > 0:
            subprocess.run(["git", "tag", "-a", tag, "-m", msg],
                          cwd=str(ROOT), capture_output=True)
            log(f"  → Git tag: {tag}")

    # Update context window
    sys.path.insert(0, str(MA))
    from intelligence import update_context_window
    decision = {"action": "RELEASE", "feature": {"id": state.get("current_feature", "?")},
                "confidence": "high", "next_phase": "RESEARCH"}
    update_context_window(memory, snapshot, decision)

    # Advance iteration
    state["iteration"] += 1
    state["phase"] = "RESEARCH"
    state["phase_iteration"] = 0
    state["current_feature"] = None
    state["retry_count"] = 0

    log(f"  → RELEASE: {tag}")
    return state, memory, snapshot


# ─── Main ─────────────────────────────────────────────────────────────────────

def action_loop() -> None:
    # 1. BOOTSTRAP: always load fresh context first
    log("═══ BOOTSTRAP: loading project context ═══")
    snapshot = bootstrap()
    memory = load_memory()
    state = load_state()

    decision = make_decision(snapshot, memory, state.get("phase", "RESEARCH"))

    log(f"  Decision: {decision.get('action', '?')} | feature={decision.get('feature', {}).get('id', '?')}")
    for r in decision.get("reasoning", []):
        log(f"    → {r}")

    # Check stop
    if (ROOT / ".autonomous/state/stop.signal").exists():
        log("⏹  Stop signal detected.")
        return

    # Save decision
    memory.setdefault("decisions", []).append({
        "ts": datetime.now(timezone.utc).isoformat(),
        "decision": decision,
        "snapshot_ts": snapshot.get("generated_at", ""),
    })
    save_memory(memory)

    iteration = state.get("iteration", 0)
    phase = state.get("phase", "RESEARCH")
    log(f"═══ iter={iteration} phase={phase} ═══")

    # 2. Route to phase executor
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

    # Final log
    mem = load_memory()
    ver = load_json(ROOT / ".autonomous/ralph-loop/version.json",
                    {"major": 0, "minor": 0, "patch": 0})
    log(f"  done | phase={state['phase']} | ver={ver['major']}.{ver['minor']}.{ver['patch']} "
        f"| iter={state['iteration']} | learnings={len(mem.get('learnings', []))} "
        f"| context_window={len(mem.get('context_window', []))}")


def action_status() -> None:
    from intelligence import format_memory_summary

    snapshot = bootstrap()
    memory = load_memory()
    state = load_state()
    ver = load_json(ROOT / ".autonomous/ralph-loop/version.json",
                    {"major": 0, "minor": 0, "patch": 0})
    features = snapshot.get("features", {})

    print("═══ AKASHA Multi-Agent Loop Status ═══")
    print(f"  Iteration:      {state.get('iteration', 0)}")
    print(f"  Phase:          {state.get('phase', '?')}")
    print(f"  Current:        {state.get('current_feature', 'none')}")
    print(f"  Retry count:   {state.get('retry_count', 0)}")
    print(f"  Version:        {ver['major']}.{ver['minor']}.{ver['patch']}")
    print(f"  Features:       {features.get('pending_count', 0)} pending / {features.get('done_count', 0)} done")
    print()
    print(f"  Context:        {snapshot.get('generated_at', '?')}")
    print(f"  Triad:          typecheck={snapshot['triad'].get('typecheck',{}).get('pass','?')} "
          f"tests={snapshot['triad'].get('tests',{}).get('pass','?')} "
          f"lint={snapshot['triad'].get('lint',{}).get('pass','?')}")
    print(f"  CodeGraph:     {snapshot['codegraph'].get('pending_files',0)} pending files")
    print(f"  Git:            {snapshot['git'].get('total',0)} changed files")
    print()
    print("  Memory:")
    print(format_memory_summary(memory))
    print()
    print("  Flow: RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE")


def action_stop() -> None:
    (ROOT / ".autonomous/state/stop.signal").write_text(
        f"stop at {datetime.now(timezone.utc).isoformat()}\n"
    )
    print("⏹  Stop signal written.")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--action", "-a",
                        choices=["loop", "status", "stop"], default="loop")
    args = parser.parse_args()

    if args.action == "loop":
        action_loop()
    elif args.action == "status":
        action_status()
    elif args.action == "stop":
        action_stop()


if __name__ == "__main__":
    main()
