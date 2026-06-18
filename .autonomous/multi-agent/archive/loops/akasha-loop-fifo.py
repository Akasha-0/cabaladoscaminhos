#!/usr/bin/env python3
"""
AKASHA Loop FIFO Daemon
=======================
Long-lived Python daemon that:
1. Manages loop state machine (6 phases)
2. Spawns parallel OMP task agents for IMPLEMENTATION
3. Accepts commands via named pipe (FIFO)
4. Runs continuously for hours

Commands via FIFO:
  status       → print current state
  phase <name> → execute one phase
  run          → full iteration (all 6 phases)
  continuous   → run all phases until stop
  stop         → stop the daemon
  exit         → exit the daemon
"""

import json
import os
import select
import signal
import subprocess
import sys
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous" / "multi-agent"
FIFO_IN = MA / "loop-fifo-in"
FIFO_OUT = MA / "loop-fifo-out"
STATE_FILE = MA / "state.json"
MEMORY_FILE = MA / "memory.json"
TASK_FILE = MA / "task-implementation.json"
IMPL_FILE = MA / "omp-implementations.json"
RESULTS_FILE = MA / "omp-agent-results.json"
AGENT_RESULTS_DIR = MA / "agent-results"
AGENT_PIDS_FILE = MA / "agent-pids.txt"
PROMPT_TEMPLATE = MA / "task-agent-prompt.md"

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


def log(msg: str) -> None:
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


# ── Import helpers from akasha-evolution-loop ────────────────────────────────

import importlib.util

_spec = importlib.util.spec_from_file_location("_lm", MA / "akasha-evolution-loop.py")
_lm = importlib.util.module_from_spec(_spec)
_lm.ROOT = ROOT
_lm.MA = MA
_lm.load_json = load_json
_lm.save_json = save_json
_lm.run_cmd = run_cmd
_lm.AGENT_RESULTS_DIR = AGENT_RESULTS_DIR
_lm.SAVE_JSON_FILE = save_json
_old = sys.path[:]
sys.path.insert(0, str(MA))
try:
    _spec.loader.exec_module(_lm)
finally:
    sys.path = _old

_bootstrap = _lm.bootstrap
_find = _lm.find_improvement_candidates
_pick = _lm.pick_best_improvements
_add_lr = _lm.add_learning
_rec_dec = _lm.record_decision


# ── State management ──────────────────────────────────────────────────────────

def load_state():
    return load_json(STATE_FILE, {
        "phase": "RESEARCH",
        "iteration": 0,
        "current_features": [],
        "retry_count": 0,
        "running": False,
        "daemon_pid": os.getpid(),
    })


def save_state(state: dict) -> None:
    save_json(STATE_FILE, state)


def load_memory():
    return load_json(MEMORY_FILE, {
        "learnings": [],
        "decisions": [],
        "context_window": [],
        "iteration": 0,
    })


def save_memory(mem: dict) -> None:
    save_json(MEMORY_FILE, mem)


# ── Phase executors ───────────────────────────────────────────────────────────

def phase_research(state: dict, memory: dict):
    iteration = state.get("iteration", 0)
    snap = _bootstrap(use_cache=True)
    candidates = _find(snap)
    selected = _pick(candidates, memory, max_count=MAX_PARALLEL)

    log(f"RESEARCH (iter {iteration}): {len(candidates)} candidates, {len(selected)} selected")
    for i, imp in enumerate(selected):
        log(f"  [{i+1}] {imp.get('type')}: {imp.get('description', '')[:60]}")

    if not selected:
        log("  No improvements → RELEASE")
        _rec_dec(memory, [{"type": "none", "description": "no improvement found"}])
        save_memory(memory)
        state["phase"] = "RELEASE"
        save_state(state)
        return

    _rec_dec(memory, selected)
    save_json(TASK_FILE, {"improvements": selected, "iteration": iteration})
    state["phase"] = "PLANNING"
    state["current_features"] = [imp.get("type") for imp in selected]
    save_state(state)


def phase_planning(state: dict):
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])
    iteration = state.get("iteration", 0)

    plans_md = ROOT / "Plans.md"
    block = []
    for i, imp in enumerate(improvements):
        block.append(f"- [~] **PLN-{iteration:03d}[{i+1}]** — {imp.get('type')} | {imp.get('description', '?')}\n")

    if plans_md.exists():
        content = plans_md.read_text()
        if "## cc:TODO" in content:
            content = content.replace("## cc:TODO", "".join(block) + "## cc:TODO", 1)
        elif "## cc:WIP" in content:
            content = content.replace("## cc:WIP", "".join(block) + "## cc:WIP", 1)
        else:
            content += "".join(block)
        plans_md.write_text(content)

    log(f"PLANNING (iter {iteration}): Plans.md updated with {len(improvements)} improvement(s)")
    state["phase"] = "IMPLEMENTATION"
    save_state(state)


def phase_implementation(state: dict, memory: dict):
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])
    log(f"IMPLEMENTATION: spawning {len(improvements)} task agent(s) in parallel")

    # Save for task agents to read
    save_json(IMPL_FILE, {
        "improvements": improvements,
        "agent_count": len(improvements),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    save_json(RESULTS_FILE, {"results": []})

    # Clean up old agent results
    for f in AGENT_RESULTS_DIR.glob("result-*.json"):
        try:
            f.unlink()
        except Exception:
            pass
    if AGENT_PIDS_FILE.exists():
        AGENT_PIDS_FILE.unlink()

    # Spawn task agents in parallel
    pids = []
    for i, imp in enumerate(improvements):
        imp_type = imp.get("type", "?")
        imp_desc = imp.get("description", "") or ""
        imp_files = imp.get("files", [])
        agent_id = f"ta-{int(time.time())}-{i}"

        # Build agent prompt
        prompt = f"""You are implementing a code improvement in /home/skynet/cabala-dos-caminhos.

Type: {imp_type}
Description: {imp_desc}
Files: {json.dumps(imp_files)}

Rules:
1. Run `git status` first — if file was modified, skip
2. Use codegraph_explore before touching unknown code
3. Implement the improvement
4. Run `pnpm typecheck` after changes — must pass
5. Run `pnpm test:run` to verify
6. Write result to /home/skynet/cabala-dos-caminhos/.autonomous/multi-agent/agent-results/result-{agent_id}.json:
{{"agent_id": "{agent_id}", "type": "{imp_type}", "success": true, "message": "Fixed/implemented"}}

Be thorough. Write the result file before exiting.
"""
        # Spawn as background OMP agent
        log(f"  Spawning agent {agent_id}: {imp_type}")
        pid = subprocess.Popen(
            ["claude", "--print", prompt, "--no-input"],
            cwd=str(ROOT),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        ).pid
        pids.append((agent_id, pid))

    # Write PIDs to file for monitoring
    AGENT_PIDS_FILE.write_text("\n".join(f"{a}|{p}" for a, p in pids))

    log(f"  {len(pids)} task agent(s) spawned (PIDs: {[p for _, p in pids]})")
    log(f"  Waiting for agents to complete...")
    state["phase"] = "IMPLEMENTATION_WAIT"
    save_state(state)


def wait_implementation(state: dict, memory: dict):
    """Called after agents are spawned — wait for completion."""
    # Check if agents are still running
    pids = []
    if AGENT_PIDS_FILE.exists():
        for line in AGENT_PIDS_FILE.read_text().splitlines():
            if "|" in line:
                agent_id, pid = line.strip().split("|", 1)
                pid = int(pid)
                try:
                    os.kill(pid, 0)  # check if alive
                    pids.append((agent_id, pid))
                except ProcessLookupError:
                    pass  # dead

    if pids:
        log(f"  Still waiting for {len(pids)} agent(s): {[a for a, _ in pids]}")
        # Return False to indicate still waiting
        return False

    # All agents done — collect results
    log("  All task agents finished — collecting results")
    all_results = []
    for f in AGENT_RESULTS_DIR.glob("result-*.json"):
        try:
            d = json.loads(f.read_text())
            all_results.append(d)
        except Exception as e:
            log(f"    Failed to read {f}: {e}")

    save_json(RESULTS_FILE, {"results": all_results})
    ok_count = sum(1 for r in all_results if r.get("success"))
    log(f"  Collected {len(all_results)} results ({ok_count} successful)")

    # Record learnings
    for r in all_results:
        _add_lr(memory, "task-agent", "IMPLEMENTATION", r.get("type", "?"),
                "success" if r.get("success") else "failure",
                r.get("message", "")[:100])
    save_memory(memory)

    state["phase"] = "QA"
    save_state(state)
    return True


def phase_qa(state: dict):
    snap = _bootstrap(use_cache=False)
    triad = snap.get("triad", {})
    tc_pass = triad.get("typecheck", {}).get("pass", False)
    tests = triad.get("tests", {})

    log(f"QA: typecheck={'✅' if tc_pass else '❌'}, tests={tests.get('passed',0)}/{tests.get('failed',0)}")

    results = load_json(RESULTS_FILE, {"results": []})
    ok_count = sum(1 for r in results.get("results", []) if r.get("success"))

    if ok_count > 0:
        log(f"  {ok_count}/{len(results.get('results',[]))} agents succeeded → VALIDATION")
        state["phase"] = "VALIDATION"
    else:
        log(f"  All agents failed → RESEARCH (retry)")
        state["phase"] = "RESEARCH"
        state["retry_count"] = state.get("retry_count", 0) + 1

    save_state(state)


def phase_validation(state: dict):
    iteration = state.get("iteration", 0)
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])

    plans_md = ROOT / "Plans.md"
    if plans_md.exists():
        content = plans_md.read_text()
        if f"PLN-{iteration:03d}" in content:
            log("VALIDATION: Plans.md ✅")
        else:
            block = "\n".join(
                f"- [x] **PLN-{iteration:03d}[{i+1}]** — {imp.get('type')} (auto)"
                for i, imp in enumerate(improvements)
            )
            plans_md.write_text(content + "\n" + block + "\n")
            log("VALIDATION: Plans.md auto-marked ✅")

    rc, _, _ = run_cmd(["codegraph", "sync"], timeout=30)
    log(f"VALIDATION: CodeGraph {'✅' if rc == 0 else '⚠'}")

    state["phase"] = "RELEASE"
    save_state(state)


def phase_release(state: dict, memory: dict):
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])
    iteration = state.get("iteration", 0)
    results = load_json(RESULTS_FILE, {"results": []})
    ok_count = sum(1 for r in results.get("results", []) if r.get("success"))
    feature_names = ", ".join([imp.get("type") for imp in improvements]) if improvements else "no-improvement"

    ver_file = MA / "version.json"
    ver = load_json(ver_file, {"major": 0, "minor": 0, "patch": 0, "changelog": []})
    ver["minor"] += 1
    ver_str = f"{ver['major']}.{ver['minor']}.{ver['patch']}"
    ver["changelog"].insert(0, {
        "version": ver_str, "ts": datetime.now(timezone.utc).isoformat(),
        "improvement": feature_names, "agents": ok_count,
    })
    save_json(ver_file, ver)
    (ROOT / "VERSION").write_text(ver_str + "\n")

    changelog = ROOT / "CHANGELOG.md"
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    entry = f"\n## [{ver_str}] — {ts}\n\n### feat(loop): {feature_names} ({ok_count} agents)\n"
    if changelog.exists():
        content = changelog.read_text()
        changelog.write_text(content.replace("# Changelog\n", "# Changelog\n" + entry, 1))
    else:
        changelog.write_text("# Changelog\n" + entry)

    subprocess.run(["git", "add", "-A"], cwd=str(ROOT), capture_output=True)
    msg = f"feat(loop): {ver_str} — {feature_names}"
    rc, out, err = run_cmd(["git", "commit", "-m", msg], timeout=15)
    log(f"RELEASE {ver_str}: Git {'✅' if rc == 0 else '⚠ ' + (out.strip() or err.strip() or 'nothing')} | {feature_names}")

    memory["iteration"] = memory.get("iteration", 0) + 1
    memory.setdefault("context_window", []).append({
        "ts": datetime.now(timezone.utc).isoformat(),
        "improvement": feature_names, "version": ver_str, "agents": ok_count,
    })
    memory["context_window"] = memory["context_window"][-20:]
    save_memory(memory)

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
    if RESULTS_FILE.exists():
        RESULTS_FILE.unlink()
    if AGENT_PIDS_FILE.exists():
        AGENT_PIDS_FILE.unlink()

    log(f"  → RESEARCH (iter {state['iteration']})")


# ── FIFO command handler ──────────────────────────────────────────────────────

def handle_command(cmd: str) -> str:
    cmd = cmd.strip()
    state = load_state()
    memory = load_memory()

    if cmd == "status":
        return json.dumps({
            "phase": state.get("phase"),
            "iteration": state.get("iteration"),
            "features": state.get("current_features", []),
            "daemon_pid": os.getpid(),
            "running": state.get("running", False),
        }, indent=2)

    elif cmd == "stop":
        state["running"] = False
        save_state(state)
        return json.dumps({"status": "stopping", "phase": state.get("phase")})

    elif cmd == "exit":
        return "__EXIT__"

    elif cmd == "run" or cmd == "continuous":
        # Run all 6 phases sequentially
        phases_order = ["RESEARCH", "PLANNING", "IMPLEMENTATION", "QA", "VALIDATION", "RELEASE"]
        for ph in phases_order:
            state = load_state()
            memory = load_memory()
            current = state.get("phase")
            if current != ph:
                continue  # skip phases already done

            if ph == "RESEARCH":
                phase_research(state, memory)
            elif ph == "PLANNING":
                phase_planning(state)
            elif ph == "IMPLEMENTATION":
                phase_implementation(state, memory)
                # IMPLEMENTATION is blocking (spawns agents and waits)
                wait_implementation(state, memory)
            elif ph == "QA":
                phase_qa(state)
            elif ph == "VALIDATION":
                phase_validation(state)
            elif ph == "RELEASE":
                phase_release(state, memory)

        return json.dumps({"status": "iteration_done", "phase": state.get("phase"), "iteration": state.get("iteration")})

    elif cmd.startswith("phase "):
        ph = cmd.split(" ", 1)[1].upper()
        state = load_state()
        memory = load_memory()

        if ph == "RESEARCH":
            phase_research(state, memory)
        elif ph == "PLANNING":
            phase_planning(state)
        elif ph == "IMPLEMENTATION":
            phase_implementation(state, memory)
            return json.dumps({"status": "implementation_spawned", "phase": "IMPLEMENTATION_WAIT"})
        elif ph == "IMPLEMENTATION_WAIT":
            done = wait_implementation(state, memory)
            if not done:
                return json.dumps({"status": "waiting", "phase": "IMPLEMENTATION_WAIT"})
        elif ph == "QA":
            phase_qa(state)
        elif ph == "VALIDATION":
            phase_validation(state)
        elif ph == "RELEASE":
            phase_release(state, memory)

        return json.dumps({"status": "ok", "phase": state.get("phase")})

    elif cmd == "wait-agents":
        state = load_state()
        memory = load_memory()
        done = wait_implementation(state, memory)
        return json.dumps({"status": "done" if done else "waiting", "phase": state.get("phase")})

    else:
        return json.dumps({"error": f"Unknown command: {cmd}"})


# ── Daemon main ──────────────────────────────────────────────────────────────

def main():
    # Create FIFOs
    for f in [FIFO_IN, FIFO_OUT]:
        if f.exists():
            f.unlink()
        os.mkfifo(f)

    log(f"FIFO daemon started (PID={os.getpid()})")
    log(f"  FIFO in:  {FIFO_IN}")
    log(f"  FIFO out: {FIFO_OUT}")

    state = load_state()
    state["running"] = True
    state["daemon_pid"] = os.getpid()
    save_state(state)

    # Set up signal handlers
    def sig_handler(sig, frame):
        log("Signal received — shutting down")
        state = load_state()
        state["running"] = False
        save_state(state)
        for f in [FIFO_IN, FIFO_OUT]:
            try:
                f.unlink()
            except Exception:
                pass
        sys.exit(0)

    signal.signal(signal.SIGINT, sig_handler)
    signal.signal(signal.SIGTERM, sig_handler)

    # Main loop: read commands from FIFO
    while True:
        try:
            # Use select to wait for input on FIFO
            with open(FIFO_IN, "r") as fifo:
                # Read one line at a time with timeout
                while True:
                    ready, _, _ = select.select([fifo], [], [], 5.0)
                    if not ready:
                        # Timeout — check if still running
                        st = load_state()
                        if not st.get("running", False):
                            log("Running=False — exiting")
                            break
                        # Check on agent PIDs
                        if AGENT_PIDS_FILE.exists():
                            wait_implementation(load_state(), load_memory())
                        continue

                    cmd = fifo.readline()
                    if not cmd:
                        break

                    log(f"CMD: {cmd.strip()}")
                    result = handle_command(cmd)

                    if result == "__EXIT__":
                        log("Exit command — shutting down")
                        break

                    # Write response to out FIFO
                    try:
                        with open(FIFO_OUT, "w") as out_fifo:
                            out_fifo.write(result + "\n")
                            out_fifo.flush()
                    except Exception as e:
                        log(f"Failed to write response: {e}")

            if not load_state().get("running", False):
                break
        except Exception as e:
            log(f"Error in main loop: {e}")
            time.sleep(1)

    # Cleanup
    for f in [FIFO_IN, FIFO_OUT]:
        try:
            f.unlink()
        except Exception:
            pass
    log("FIFO daemon stopped")


if __name__ == "__main__":
    # Check if already running
    state = load_state()
    if state.get("daemon_pid") and state.get("running"):
        try:
            os.kill(state["daemon_pid"], 0)
            print(f"Daemon already running (PID={state['daemon_pid']})")
            print(f"Connect via: echo 'status' > {FIFO_IN}")
            sys.exit(0)
        except ProcessLookupError:
            pass  # dead

    main()
