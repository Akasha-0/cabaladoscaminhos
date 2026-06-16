#!/usr/bin/env python3
"""
AKASHA Loop Socket Daemon v3
============================
Fully async: all phase commands return immediately,
heavy work runs in ThreadPoolExecutor.
"""

import json, os, signal, socket, subprocess as _sub, sys, time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from threading import Thread

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous" / "multi-agent"
SOCKET_FILE = MA / "loop-daemon.sock"
STATE_FILE = MA / "state.json"
MEMORY_FILE = MA / "memory.json"
TASK_FILE = MA / "task-implementation.json"
IMPL_FILE = MA / "omp-implementations.json"
RESULTS_FILE = MA / "omp-agent-results.json"
AGENT_RESULTS_DIR = MA / "agent-results"
AGENT_PIDS_FILE = MA / "agent-pids.txt"

MAX_PARALLEL = 5

# Async executor for heavy phases
_executor = ThreadPoolExecutor(max_workers=4)


def load_json(path, default=None):
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            return default if default is not None else {}
    return default if default is not None else {}


def save_json(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))


def run_cmd(cmd, timeout=60):
    try:
        cp = _sub.run(cmd, capture_output=True, text=True, timeout=timeout, cwd=str(ROOT))
        return cp.returncode, cp.stdout, cp.stderr
    except _sub.TimeoutExpired:
        return -1, "", f"Timeout after {timeout}s"
    except Exception as e:
        return -1, "", str(e)


def log(msg):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


# ── Load akasha-evolution-loop helpers ─────────────────────────────────────────

import importlib.util
_spec = importlib.util.spec_from_file_location("_lm", str(MA / "akasha-evolution-loop.py"))
_lm = importlib.util.module_from_spec(_spec)
_lm.ROOT = ROOT
_lm.MA = MA
_lm.load_json = load_json
_lm.save_json = save_json
_lm.run_cmd = run_cmd
_lm.AGENT_RESULTS_DIR = AGENT_RESULTS_DIR
_lm.SAVE_JSON_FILE = save_json
_old_sys = sys.path[:]
sys.path.insert(0, str(MA))
try:
    _spec.loader.exec_module(_lm)
finally:
    sys.path = _old_sys

_bootstrap = _lm.bootstrap
_find = _lm.find_improvement_candidates
_pick = _lm.pick_best_improvements
_add_lr = _lm.add_learning
_rec_dec = _lm.record_decision
# ── Evals framework ───────────────────────────────────────────────────────────
import evals as _evals

_tracker = _evals.MetricsTracker()

def _record(phase: str, metrics: dict, duration_s: float = 0.0):
    _tracker.record_phase(phase, metrics, duration_s)


# ── State management ──────────────────────────────────────────────────────────

def load_state():
    return load_json(STATE_FILE, {
        "phase": "RESEARCH", "iteration": 0,
        "current_features": [], "retry_count": 0,
        "running": False, "daemon_pid": os.getpid(),
    })


def save_state(state):
    save_json(STATE_FILE, state)


def load_memory():
    return load_json(MEMORY_FILE, {"learnings": [], "decisions": [],
                                   "context_window": [], "iteration": 0})


def save_memory(mem):
    save_json(MEMORY_FILE, mem)


# ── Phase executors ───────────────────────────────────────────────────────────

def phase_research(state, memory):
    _evals.phase_start("RESEARCH")
    iteration = state.get("iteration", 0)
    snap = _bootstrap(use_cache=True)
    candidates = _find(snap)
    selected = _pick(candidates, memory, max_count=MAX_PARALLEL)
    log(f"RESEARCH (iter {iteration}): {len(candidates)} cand, {len(selected)} selected")
    for i, imp in enumerate(selected):
        log(f"  [{i+1}] {imp.get('type')}: {imp.get('description','')[:60]}")
    if not selected:
        log("  No improvements -> RELEASE")
        _rec_dec(memory, [{"type": "none", "description": "no improvement found"}])
        save_memory(memory)
        state["phase"] = "RELEASE"
        save_state(state)
        dur = _evals.phase_end("RESEARCH")
        _tracker.record_research(len(candidates), 0, selection_quality=0.0,
                                 no_improvement_found=True, duration_s=dur)
        return
    _rec_dec(memory, selected)
    save_json(TASK_FILE, {"improvements": selected, "iteration": iteration})
    save_json(IMPL_FILE, {"improvements": selected, "agent_count": len(selected),
                           "iteration": iteration})
    state["phase"] = "PLANNING"
    state["current_features"] = [imp.get("type") for imp in selected]
    save_state(state)
    dur = _evals.phase_end("RESEARCH")
    _tracker.record_research(len(candidates), len(selected),
                             selection_quality=0.0, duration_s=dur)

def phase_planning(state):
    _evals.phase_start("PLANNING")
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])
    iteration = state.get("iteration", 0)
    plans_md = ROOT / "Plans.md"
    block = []
    for i, imp in enumerate(improvements):
        block.append(f"- [~] **PLN-{iteration:03d}[{i+1}]** -- {imp.get('type')} | {imp.get('description','?')}\n")
    if plans_md.exists():
        content = plans_md.read_text()
        if "## cc:TODO" in content:
            content = content.replace("## cc:TODO", "".join(block) + "## cc:TODO", 1)
        elif "## cc:WIP" in content:
            content = content.replace("## cc:WIP", "".join(block) + "## cc:WIP", 1)
        else:
            content += "".join(block)
        plans_md.write_text(content)
    log(f"PLANNING (iter {iteration}): Plans.md updated ({len(improvements)} items)")
    state["phase"] = "IMPLEMENTATION"
    save_state(state)
    dur = _evals.phase_end("PLANNING")
    plans_md = ROOT / "Plans.md"
    detail = 0.0
    if plans_md.exists() and block:
        avg_chars = sum(len(line) for line in block) / len(block)
        detail = avg_chars
    _tracker.record_planning(len(improvements),
                              plans_detail_level=detail,
                              plans_updated=plans_md.exists(),
                              duration_s=dur)


def phase_implementation(state, memory):
    """Spawn coding agents for each improvement, then return immediately."""
    _evals.phase_start("IMPLEMENTATION")
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])
    log(f"IMPLEMENTATION: spawning {len(improvements)} agents")
    # Clean old results and PIDs for fresh start
    save_json(RESULTS_FILE, {"results": []})
    for f in AGENT_RESULTS_DIR.glob("result-*.json"):
        try:
            f.unlink()
        except Exception:
            pass
    if AGENT_PIDS_FILE.exists():
        AGENT_PIDS_FILE.unlink()

    def _spawn_agent(i, imp):
        agent_id = f"ta-{int(time.time())}-{i}"
        prompt_file = MA / f".agent-prompt-{agent_id}.txt"
        prompt = _lm._build_agent_prompt(imp)
        result_file = str(AGENT_RESULTS_DIR / f"result-{agent_id}.json")
        # Patch the result path so agents write to the per-agent file
        prompt = prompt.replace(
            "/home/skynet/cabala-dos-caminhos/.autonomous/multi-agent/task-result.json",
            result_file,
            1,
        )
        prompt_file.write_text(prompt)
        proc = _sub.Popen(
            ["timeout", "600", "claude", "-p", prompt],
            cwd=str(ROOT), stdout=_sub.DEVNULL, stderr=_sub.DEVNULL
        )
        with open(AGENT_PIDS_FILE, "a") as pf:
            pf.write(f"{agent_id}|{proc.pid}\n")
        log(f"  Spawned agent {agent_id} pid={proc.pid}")
    for i, imp in enumerate(improvements):
        _executor.submit(_spawn_agent, i, imp)
    state["phase"] = "IMPLEMENTATION_WAIT"
    save_state(state)
    dur = _evals.phase_end("IMPLEMENTATION")
    _tracker.record_implementation(
        agents_spawned=len(improvements),
        results_collected=0,
        agent_success_rate=0.0,
        files_changed=0,
        duration_s=dur,
    )

def wait_implementation(state, memory):
    # Reap any zombie children so they don't accumulate
    while True:
        try:
            pid, _ = os.waitpid(-1, os.WNOHANG)
            if pid == 0:
                break
        except ChildProcessError:
            break
        except ProcessLookupError:
            break
    alive = []
    if AGENT_PIDS_FILE.exists():
        for line in AGENT_PIDS_FILE.read_text().splitlines():
            if "|" not in line:
                continue
            parts = line.strip().split("|")
            if len(parts) != 2:
                continue
            agent_id, pid = parts
            try:
                pid_int = int(pid)
                os.kill(pid_int, 0)  # alive?
                alive.append((agent_id, pid_int))
            except (ValueError, ProcessLookupError, PermissionError):
                pass  # dead

    if alive:
        return False  # NOT done yet -- caller polls

    # All dead: collect results and advance to QA
    log("  All agents finished, collecting results")
    all_results = []
    for f in sorted(AGENT_RESULTS_DIR.glob("result-*.json")):
        try:
            all_results.append(json.loads(f.read_text()))
        except Exception:
            pass
    save_json(RESULTS_FILE, {"results": all_results})
    log(f"  Collected {len(all_results)} results")
    state["phase"] = "QA"
    save_state(state)
    return True


def phase_qa(state):
    """QA phase: collect agent results, run typecheck, decide next phase."""
    _evals.phase_start("QA")
    snap = _bootstrap(use_cache=True)
    triad = snap.get("triad", {})
    tc_pass = triad.get("typecheck", {}).get("pass", False)
    tests = triad.get("tests", {})
    log(f"QA: typecheck={'OK' if tc_pass else 'FAIL'}, tests={tests.get('passed',0)}/{tests.get('failed',0)}")
    # Collect agent results
    all_results = []
    for f in AGENT_RESULTS_DIR.glob("result-*.json"):
        try:
            all_results.append(json.loads(f.read_text()))
        except Exception:
            pass
    save_json(RESULTS_FILE, {"results": all_results})
    for r in all_results:
        _add_lr(state.get("_memory", {}), "task-agent", "IMPLEMENTATION",
                r.get("type", "?"), "success" if r.get("success") else "failure",
                r.get("message", "")[:100])
    ok = sum(1 for r in all_results if r.get("success"))
    if ok > 0:
        log(f"  {ok}/{len(all_results)} agents ok -> VALIDATION")
    else:
        log(f"  No agent results (typecheck={'OK' if tc_pass else 'FAIL'}) -> VALIDATION")
    state["phase"] = "VALIDATION"
    save_state(state)
    dur = _evals.phase_end("QA")
    _tracker.record_qa(
        typecheck_pass=tc_pass,
        tests_pass=tests.get("passed", 0) > 0 and tests.get("failed", 1) == 0,
        improvements_accepted=ok,
        duration_s=dur,
    )


def phase_validation(state):
    _evals.phase_start("VALIDATION")
    iteration = state.get("iteration", 0)
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])
    plans_md = ROOT / "Plans.md"
    if plans_md.exists():
        content = plans_md.read_text()
        if f"PLN-{iteration:03d}" in content:
            log("VALIDATION: Plans.md ok")
        else:
            block = "\n".join(
                f"- [x] **PLN-{iteration:03d}[{i+1}]** -- {imp.get('type')} (auto)"
                for i, imp in enumerate(improvements)
            )
            plans_md.write_text(content + "\n" + block + "\n")
            log("VALIDATION: Plans.md auto-marked")
    rc, _, _ = run_cmd(["codegraph", "sync"], timeout=30)
    log(f"VALIDATION: CodeGraph {'ok' if rc == 0 else 'warn'}")
    state["phase"] = "RELEASE"
    save_state(state)
    dur = _evals.phase_end("VALIDATION")
    cg_ok = (rc == 0)
    plans_marked = (f"PLN-{iteration:03d}" not in (plans_md.read_text() if plans_md.exists() else ""))
    quality = 0.5 + 0.25 * cg_ok + 0.25 * plans_marked
    _tracker.record_validation(
        improvements_validated=len(improvements),
        quality_score=quality,
        codegraph_sync_ok=cg_ok,
        plans_marked=plans_marked,
        duration_s=dur,
    )


def phase_release(state, memory):
    _evals.phase_start("RELEASE")
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])
    iteration = state.get("iteration", 0)
    results = load_json(RESULTS_FILE, {"results": []})
    ok = sum(1 for r in results.get("results", []) if r.get("success"))
    feat = ", ".join([imp.get("type") for imp in improvements]) if improvements else "no-improvement"

    ver_file = MA / "version.json"
    ver = load_json(ver_file, {"major": 0, "minor": 0, "patch": 0, "changelog": []})
    ver["minor"] += 1
    ver_str = f"{ver['major']}.{ver['minor']}.{ver['patch']}"
    ver["changelog"].insert(0, {
        "version": ver_str,
        "ts": datetime.now(timezone.utc).isoformat(),
        "improvement": feat,
        "agents": ok
    })
    save_json(ver_file, ver)
    (ROOT / "VERSION").write_text(ver_str + "\n")

    changelog = ROOT / "CHANGELOG.md"
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    entry = f"\n## [{ver_str}] -- {ts}\n\n### feat(loop): {feat} ({ok} agents)\n"
    if changelog.exists():
        c = changelog.read_text()
        changelog.write_text(c.replace("# Changelog\n", "# Changelog\n" + entry, 1))
    else:
        changelog.write_text("# Changelog\n" + entry)

    _sub.run(["git", "add", "-A"], cwd=str(ROOT), capture_output=True)
    rc, out, err = run_cmd(["git", "commit", "-m", f"feat(loop): {ver_str} -- {feat}"], timeout=15)
    log(f"RELEASE {ver_str}: Git {'ok' if rc == 0 else 'warn'} | {feat}")

    memory["iteration"] = memory.get("iteration", 0) + 1
    memory.setdefault("context_window", []).append({
        "ts": datetime.now(timezone.utc).isoformat(),
        "improvement": feat, "version": ver_str, "agents": ok,
    })
    memory["context_window"] = memory["context_window"][-20:]
    save_memory(memory)

    state["iteration"] += 1
    state["phase"] = "RESEARCH"
    state["current_features"] = []
    state["retry_count"] = 0
    save_state(state)

    for f in AGENT_RESULTS_DIR.glob("result-*.json"):
        try:
            f.unlink()
        except Exception:
            pass
    for f in [RESULTS_FILE, AGENT_PIDS_FILE]:
        if f.exists():
            f.unlink()

    # ── Evals: record full iteration outcome ──────────────────────────────────
    agents_total = len(improvements)
    agents_ok = ok
    results_list = results.get("results", [])
    success_rate = agents_ok / agents_total if agents_total > 0 else 0.0

    # Compute a release quality score (0.0–1.0)
    release_quality = (
        0.30 * success_rate +
        0.25 * (1.0 if rc == 0 else 0.0) +           # git commit ok
        0.20 * (1.0 if changelog.exists() else 0.0) + # changelog written
        0.25 * (1.0 if ver.get("minor", 0) > 0 else 0.0) # version bumped
    )

    dur = _evals.phase_end("RELEASE")
    _tracker.record_release(
        release_quality=release_quality,
        commit_messages_clean=(rc == 0),
        changelog_updated=changelog.exists(),
        version_bumped=(ver.get("minor", 0) > 0),
        iteration_advanced=True,
        duration_s=dur,
    )
    _tracker.save()

    log(f"  -> RESEARCH (iter {state['iteration']})")

# ── Socket command handler ───────────────────────────────────────────────────

def _send_json(conn, data):
    """Send JSON response over socket."""
    try:
        conn.sendall((json.dumps(data) + "\n").encode())
    except Exception:
        pass


def _send_json(conn, data):
    try:
        conn.sendall((json.dumps(data) + "\n").encode())
    except Exception:
        pass
    try:
        conn.close()
    except Exception:
        pass


def handle(conn):
    """
    Socket handler -- SYNCHRONOUS per phase.
    Each phase command blocks until completion, then sends result.
    This is safe because the daemon is single-threaded for state transitions.
    """
    conn.settimeout(600)  # 10min max per phase
    try:
        data = b""
        while True:
            chunk = conn.recv(4096)
            if not chunk:
                break
            data += chunk
            if b"\n" in data:
                break
        if not data:
            conn.close()
            return

        cmd = data.decode().strip()
        log(f"CMD: {cmd}")

        state = load_state()

        # ── status: immediate ───────────────────────────────────────
        if cmd == "status":
            _send_json(conn, {
                "phase": state.get("phase"), "iteration": state.get("iteration"),
                "features": state.get("current_features", []),
                "daemon_pid": os.getpid(), "running": state.get("running", False),
            })
            return

        # ── stop / exit: immediate ────────────────────────────────
        elif cmd == "stop":
            state["running"] = False
            save_state(state)
            _send_json(conn, {"status": "stopping"})
            return

        elif cmd == "exit":
            try:
                conn.sendall(b"__EXIT__\n")
            except Exception:
                pass
            conn.close()
            return

        # ── wait-agents: check once, non-blocking ──────────────────
        elif cmd == "wait-agents":
            mem = load_memory()
            wait_implementation(state, mem)
            _send_json(conn, {
                "status": "done" if state.get("phase") != "IMPLEMENTATION_WAIT" else "waiting",
                "phase": load_state().get("phase"),
            })
            return

        # ── run / continuous: full loop ───────────────────────────
        elif cmd == "run" or cmd == "continuous":
            # Daemon already runs continuously in main loop
            _send_json(conn, {
                "status": "running",
                "phase": state.get("phase"),
                "iteration": state.get("iteration"),
                "running": state.get("running", False),
            })
            conn.close()
            return

        # ── phase <name>: execute ONE phase synchronously ───────────
        elif cmd.startswith("phase "):
            ph = cmd.split(" ", 1)[1].upper()
            current = state.get("phase")
            mem = load_memory()

            # Only execute if this phase is current
            if ph != current:
                _send_json(conn, {
                    "status": "skipped",
                    "reason": f"current_phase={current}, requested={ph}",
                    "phase": current,
                })
                return

            # Execute the phase NOW (synchronous)
            try:
                if ph == "RESEARCH":
                    phase_research(state, mem)
                    next_ph = state.get("phase", "?")
                elif ph == "PLANNING":
                    phase_planning(state)
                    next_ph = state.get("phase", "?")
                elif ph == "IMPLEMENTATION":
                    phase_implementation(state, mem)
                    next_ph = state.get("phase", "?")
                elif ph == "IMPLEMENTATION_WAIT":
                    wait_implementation(state, mem)
                    next_ph = state.get("phase", "?")
                elif ph == "QA":
                    phase_qa(state)
                    next_ph = state.get("phase", "?")
                elif ph == "VALIDATION":
                    phase_validation(state)
                    next_ph = state.get("phase", "?")
                elif ph == "RELEASE":
                    phase_release(state, mem)
                    next_ph = state.get("phase", "?")
                else:
                    _send_json(conn, {"error": f"Unknown phase: {ph}"})
                    return

                _send_json(conn, {
                    "status": "ok", "phase": ph, "next_phase": next_ph,
                    "iteration": state.get("iteration"),
                })
                log(f"Phase {ph} -> {next_ph}")
                return

            except Exception as e:
                log(f"Phase {ph} error: {e}")
                _send_json(conn, {"error": str(e), "phase": ph})
                return

        # ── unknown ─────────────────────────────────────────────────
        else:
            _send_json(conn, {"error": f"Unknown: {cmd}"})
            return

    except Exception as e:
        log(f"Handler error: {e}")
        try:
            conn.close()
        except Exception:
            pass


def _run_full_loop():
    """Run all phases from current state (used by 'run' command)."""
    for ph, fn_args in [
        ("RESEARCH", (load_state(), load_memory())),
        ("PLANNING", (load_state(),)),
        ("IMPLEMENTATION", (load_state(), load_memory())),
        ("IMPLEMENTATION_WAIT", (load_state(), load_memory())),
        ("QA", (load_state(),)),
        ("VALIDATION", (load_state(),)),
        ("RELEASE", (load_state(), load_memory())),
    ]:
        st = load_state()
        if st.get("phase") == ph:
            fn_args = list(fn_args)
            fn_args[0] = st
            try:
                if ph == "RESEARCH": phase_research(*fn_args)
                elif ph == "PLANNING": phase_planning(*fn_args)
                elif ph == "IMPLEMENTATION": phase_implementation(*fn_args)
                elif ph == "IMPLEMENTATION_WAIT": wait_implementation(*fn_args)
                elif ph == "QA": phase_qa(*fn_args)
                elif ph == "VALIDATION": phase_validation(*fn_args)
                elif ph == "RELEASE": phase_release(*fn_args)
                log(f"Full-loop: {ph} -> {load_state().get('phase')}")
            except Exception as e:
                log(f"Full-loop phase {ph} error: {e}")


# ── Main daemon ───────────────────────────────────────────────────────────────

def main():
    if SOCKET_FILE.exists():
        SOCKET_FILE.unlink()
    sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    sock.bind(str(SOCKET_FILE))
    sock.listen(5)
    sock.settimeout(0.5)  # short timeout for responsive socket checks

    log(f"Daemon started PID={os.getpid()} socket={SOCKET_FILE}")

    # Startup recovery: collect stale agents if in IMPLEMENTATION_WAIT
    state = load_state()
    if state.get("phase") in ("IMPLEMENTATION", "IMPLEMENTATION_WAIT"):
        results = list(AGENT_RESULTS_DIR.glob("result-*.json"))
        if results:
            log(f"Startup recovery: collecting {len(results)} stale results")
            wait_implementation(state, load_memory())
            state = load_state()

    state["running"] = True
    state["daemon_pid"] = os.getpid()
    save_state(state)

    def sig_handler(sig, frame):
        log("Signal -- shutting down")
        st = load_state()
        st["running"] = False
        save_state(st)
        try:
            sock.close()
        except Exception:
            pass
        try:
            SOCKET_FILE.unlink()
        except Exception:
            pass
        sys.exit(0)

    signal.signal(signal.SIGINT, sig_handler)
    signal.signal(signal.SIGTERM, sig_handler)

    # ── Main loop: phases run synchronously, socket handled in threads ──
    while load_state().get("running", False):
        # Check socket (non-blocking, 0.5s timeout)
        try:
            conn, _ = sock.accept()
            t = Thread(target=handle, args=(conn,), daemon=True)
            t.start()
        except socket.timeout:
            pass  # no connection
        except Exception as e:
            log(f"Accept error: {e}")
            time.sleep(1)

        # Run current phase
        ph = load_state().get("phase", "RESEARCH")
        try:
            mem = load_memory()
            st = load_state()

            if ph == "RESEARCH":
                phase_research(st, mem)
            elif ph == "PLANNING":
                phase_planning(st)
            elif ph == "IMPLEMENTATION":
                phase_implementation(st, mem)
            elif ph == "IMPLEMENTATION_WAIT":
                done = wait_implementation(st, mem)
                if done:
                    phase_qa(st)
                else:
                    time.sleep(5)
            elif ph == "QA":
                phase_qa(st)
            elif ph == "VALIDATION":
                phase_validation(st)
            elif ph == "RELEASE":
                phase_release(st, mem)
            else:
                log(f"Unknown phase: {ph}, resetting to RESEARCH")
                st["phase"] = "RESEARCH"
                save_state(st)

        except Exception as e:
            log(f"Phase {ph} error: {e}")
            time.sleep(5)

    sock.close()
    try:
        SOCKET_FILE.unlink()
    except Exception:
        pass
    log("Daemon stopped")


if __name__ == "__main__":
    st = load_state()
    if st.get("running") and st.get("daemon_pid"):
        try:
            os.kill(st["daemon_pid"], 0)
            print(f"Already running PID={st['daemon_pid']}")
            sys.exit(0)
        except ProcessLookupError:
            pass
    main()
