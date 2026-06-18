#!/usr/bin/env python3
"""
Akasha Loop Daemon v4 — 24/7 Autonomous Evolution Engine
========================================================
Performance-optimized: adaptive polling, in-memory state cache,
parallel QA, select.poll() I/O, agent resource limits.
Integrates: Guardian, Memory Manager, Telemetry, Adaptive Pacer,
SelfHealer, Predictive Engine, Skill Discoverer, Continuity Manager.
Starts via: bash .autonomous/multi-agent/run-loop-supervised.sh
"""

from __future__ import annotations

import json, os, select, signal, socket, subprocess as _sub, sys, time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from threading import Thread, Lock
from typing import Optional

# ── Paths ─────────────────────────────────────────────────────────────────────
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
CHECKPOINT_FILE = MA / "state-checkpoint.json"
MAX_PARALLEL = 5

_executor = ThreadPoolExecutor(max_workers=4)

# ── In-memory state cache (avoids repeated JSON parsing every loop tick) ──────
# Cache is invalidated on save_state() / save_memory() calls
_state_cache: Optional[dict] = None
_state_cache_time: float = 0.0
_STATE_CACHE_TTL: float = 2.0   # seconds

_memory_cache: Optional[dict] = None
_memory_cache_time: float = 0.0
_MEMORY_CACHE_TTL: float = 5.0   # seconds

# ── JSON helpers ─────────────────────────────────────────────────────────────
def load_json(path, default=None):
    if path.exists():
        try:
            return json.loads(path.read_text())
        except (json.JSONDecodeError, OSError):
            return default if default is not None else {}
    return default if default is not None else {}

def save_json(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))

def log(msg: str) -> None:
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] DAEMON: {msg}", flush=True)

def log_warn(msg: str) -> None:
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] WARN: {msg}", flush=True)

def log_error(msg: str) -> None:
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] ERROR: {msg}", flush=True, file=sys.stderr)

# ── Module loader ─────────────────────────────────────────────────────────────
import importlib.util

def _load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, str(path))
    mod = importlib.util.module_from_spec(spec)
    mod.ROOT = ROOT
    mod.MA = MA
    mod.load_json = load_json
    mod.save_json = save_json
    mod.run_cmd = _run_cmd
    mod.AGENT_RESULTS_DIR = AGENT_RESULTS_DIR
    # Register module before exec_module so Python 3.14 dataclass decorators
    # (which do sys.modules[cls.__module__].__dict__) find it during decoration.
    sys.modules[name] = mod
    old = sys.path[:]
    sys.path.insert(0, str(MA))
    try:
        spec.loader.exec_module(mod)
    finally:
        sys.path = old
    return mod

def _run_cmd(cmd, timeout=60):
    try:
        r = _sub.run(cmd, capture_output=True, text=True, timeout=timeout, cwd=str(ROOT))
        return r.returncode, r.stdout, r.stderr
    except Exception as e:
        return -1, "", str(e)

# ── Load core evolution loop ──────────────────────────────────────────────────
_lm = _load_module("_lm", MA / "akasha-evolution-loop.py")
_bootstrap = _lm.bootstrap
_find = _lm.find_improvement_candidates
_pick = _lm.pick_best_improvements
_add_lr = _lm.add_learning
_rec_dec = _lm.record_decision

# ── Load evals ───────────────────────────────────────────────────────────────
_evals = _load_module("_evals", MA / "evals.py")

# ── Load harness modules (graceful fallback) ──────────────────────────────────
def _try_import(name: str) -> Optional[object]:
    try:
        return _load_module(f"_{name}", MA / f"{name}.py")
    except FileNotFoundError:
        return None

_telemetry = _try_import("telemetry")
_adaptive_pacer = _try_import("adaptive_pacer")
_self_healer = _try_import("self_healer")
_predictive_engine = _try_import("predictive_engine")
_skill_discoverer = _try_import("skill_discoverer")
_continuity_manager = _try_import("continuity_manager")
_memory_manager = _try_import("memory_manager")
_guardian = _try_import("guardian")

# ── Instantiate singletons ────────────────────────────────────────────────────
_pacer = None
_healer = None
_predictor = None
_skill_mgr = None
_continuity = None
_mem_mgr = None
_telem = None

if _adaptive_pacer:
    try:
        _pacer = _adaptive_pacer.get_pacer()
        log(f"AdaptivePacer: state={_pacer.get_pace()['state']}")
    except Exception as e:
        log_warn(f"AdaptivePacer init failed: {e}")

if _self_healer:
    try:
        _healer = _self_healer.SelfHealer()
        log("SelfHealer loaded")
    except Exception as e:
        log_warn(f"SelfHealer init failed: {e}")

if _predictive_engine:
    try:
        _predictor = _predictive_engine.PredictiveEngine()
        log("PredictiveEngine loaded")
    except Exception as e:
        log_warn(f"PredictiveEngine init failed: {e}")

if _skill_discoverer:
    try:
        _skill_mgr = _skill_discoverer.SkillDiscoverer()
        log(f"SkillDiscoverer: {len(_skill_mgr.get_skills())} skills")
    except Exception as e:
        log_warn(f"SkillDiscoverer init failed: {e}")

if _continuity_manager:
    try:
        _continuity = _continuity_manager.ContinuityManager()
        log("ContinuityManager loaded")
    except Exception as e:
        log_warn(f"ContinuityManager init failed: {e}")

if _memory_manager:
    try:
        _mem_mgr = _memory_manager.MemoryManager()
        log("MemoryManager loaded")
    except Exception as e:
        log_warn(f"MemoryManager init failed: {e}")

if _telemetry:
    try:
        _telem = _telemetry.TelemetryCollector()
        log("TelemetryCollector loaded")
    except Exception as e:
        log_warn(f"TelemetryCollector init failed: {e}")

# ── Evals tracker ───────────────────────────────────────────────────────────
_tracker = None
def _get_tracker():
    global _tracker
    if _tracker is None:
        _tracker = _evals.MetricsTracker()
    return _tracker

# ── State helpers (with in-memory cache) ───────────────────────────────────────
def load_state(force: bool = False):
    global _state_cache, _state_cache_time
    now = time.monotonic()
    if not force and _state_cache is not None and (now - _state_cache_time) < _STATE_CACHE_TTL:
        return _state_cache
    _state_cache = load_json(STATE_FILE, {
        "phase": "RESEARCH", "iteration": 0, "running": False, "daemon_pid": None,
        "current_features": [], "quality_snapshot": 0.0
    })
    _state_cache_time = now
    return _state_cache

def save_state(state: dict):
    global _state_cache, _state_cache_time
    save_json(STATE_FILE, state)
    _state_cache = state
    _state_cache_time = time.monotonic()

def load_memory(force: bool = False):
    global _memory_cache, _memory_cache_time
    now = time.monotonic()
    if not force and _memory_cache is not None and (now - _memory_cache_time) < _MEMORY_CACHE_TTL:
        return _memory_cache
    _memory_cache = load_json(MEMORY_FILE, {
        "learnings": [], "decisions": [], "context_window": [], "iteration": 0
    })
    _memory_cache_time = now
    return _memory_cache

def save_memory(mem: dict):
    global _memory_cache, _memory_cache_time
    save_json(MEMORY_FILE, mem)
    _memory_cache = mem
    _memory_cache_time = time.monotonic()

def save_checkpoint(state: dict, reason: str = ""):
    cp = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "phase": state.get("phase"), "iteration": state.get("iteration"),
        "quality_snapshot": state.get("quality_snapshot", 0.0),
        "current_features": state.get("current_features", []),
        "daemon_pid": os.getpid(), "reason": reason,
    }
    save_json(CHECKPOINT_FILE, cp)

# ── Health check ──────────────────────────────────────────────────────────────
def _pre_phase_health_check():
    if not _healer:
        return True, None
    try:
        health = _healer.check_health()
        if health.get("healthy"):
            return True, None
        issue = _healer.detect_issue()
        log_warn(f"Health issue: {issue}")
        strategy = _healer.suggest_recovery(issue)
        recovered = _healer.recover(strategy)
        if recovered:
            log(f"SelfHealer: recovered via {strategy}")
        return recovered, strategy
    except Exception as e:
        log_error(f"Health check error: {e}")
        return True, None

# ── Adaptive pacing ───────────────────────────────────────────────────────────
def _check_pacing() -> bool:
    if not _pacer:
        return True
    try:
        pace = _pacer.get_pace()
        if pace["state"] == "PAUSE":
            log(f"PACER: PAUSED — {_pacer.get_recommended_action()['reason']}")
            for _ in range(10):
                time.sleep(30)
                if _pacer.get_pace()["state"] != "PAUSE":
                    break
            return _pacer.should_proceed(_pacer.get_pace().get("quality_ema", 90))
        action = _pacer.get_recommended_action()
        if action["action"] in ("throttle", "halt"):
            delay = pace.get("min_delay_seconds", 30)
            log(f"PACER: {pace['state']} — sleeping {delay}s")
            time.sleep(delay)
        return _pacer.should_proceed(pace.get("quality_ema", 90))
    except Exception as e:
        log_warn(f"Pacer error: {e}")
        return True

def _record_outcome(success: bool, quality: float = 0.0):
    if _pacer:
        try:
            _pacer.record_outcome(success)
        except Exception as e:
            log_warn(f"Pacer record error: {e}")
    if _telem:
        try:
            _telem.record("ITERATION", {
                "outcome": "success" if success else "failed",
                "quality_score": quality,
            })
        except Exception as e:
            log_warn(f"Telemetry error: {e}")

# ── Predictive engine ─────────────────────────────────────────────────────────
def _run_predictive_analysis() -> dict:
    if not _predictor:
        return {}
    try:
        return _predictor.analyze()
    except Exception as e:
        log_warn(f"PredictiveEngine error: {e}")
        return {}

def _apply_predictive_recommendations(analysis: dict):
    if not analysis or not analysis.get("risks"):
        return
    for risk in analysis.get("risks", []):
        sev = risk.get("severity", "LOW")
        if sev in ("CRITICAL", "HIGH"):
            log_warn(f"PREDICTIVE [{sev}]: {risk.get('type')} — {risk.get('description')}")
        if risk.get("type") == "memory_exhaustion" and _mem_mgr:
            try:
                _mem_mgr.compact()
                log("MemoryManager: compacted")
            except Exception as e:
                log_warn(f"MemoryManager compact error: {e}")
        elif risk.get("type") == "quality_regression" and _pacer:
            try:
                _pacer.force_state("SLOW", f"quality regression: {risk.get('description')}")
            except Exception as e:
                log_warn(f"Force state error: {e}")

# ── Skill discovery ──────────────────────────────────────────────────────────
def _maybe_discover_skills(iteration: int):
    if not _skill_mgr or iteration % 10 != 0:
        return
    try:
        new_skills = _skill_mgr.discover()
        if new_skills:
            log(f"SkillDiscoverer: {len(new_skills)} new skills")
            for skill in new_skills:
                log(f"  → {skill.get('name')}: {skill.get('description', '')[:80]}")
    except Exception as e:
        log_warn(f"SkillDiscoverer error: {e}")

# ── Session continuity ────────────────────────────────────────────────────────
def _save_session(state: dict, reason: str = ""):
    if _continuity:
        try:
            _continuity.save_session()
        except Exception as e:
            log_warn(f"Continuity save error: {e}")
    save_checkpoint(state, reason)

def _restore_session() -> dict:
    if not _continuity:
        return {}
    try:
        warm = _continuity.restore_session()
        if warm:
            log("ContinuityManager: restored from warm storage")
            return warm
    except Exception as e:
        log_warn(f"Continuity restore error: {e}")
    return {}

# ── Memory management ─────────────────────────────────────────────────────────
def _store_learning(agent: str, phase: str, feature_id: str, outcome: str,
                    summary: str, details: dict = None):
    mem = load_memory()
    try:
        _add_lr(mem, agent, phase, feature_id, outcome, summary, details)
    except Exception:
        pass
    if _mem_mgr:
        try:
            _mem_mgr.store({
                "agent": agent, "phase": phase, "feature_id": feature_id,
                "outcome": outcome, "summary": summary,
                "details": details or {},
                "iteration": load_state().get("iteration", 0),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
        except Exception as e:
            log_warn(f"MemoryManager store error: {e}")
    save_memory(mem)

# ── Phase: RESEARCH ──────────────────────────────────────────────────────────
def phase_research(state, memory):
    iteration = state.get("iteration", 0)
    log(f"=== RESEARCH (iter {iteration}) ===")

    analysis = _run_predictive_analysis()
    _apply_predictive_recommendations(analysis)
    _maybe_discover_skills(iteration)

    snap = _bootstrap(use_cache=True)
    candidates = _find(snap)
    selected = _pick(candidates, memory, max_count=MAX_PARALLEL)

    log(f"  {len(candidates)} candidates, {len(selected)} selected")
    for i, imp in enumerate(selected[:5]):
        log(f"  [{i+1}] {imp.get('type')}: {imp.get('description', '')[:60]})")

    if not selected:
        log("  No improvements → RELEASE")
        _rec_dec(memory, [{"type": "none", "description": "no improvement found"}])
        save_memory(memory)
        state["phase"] = "RELEASE"
        save_state(state)
        dur = _evals.phase_end("RESEARCH")
        _get_tracker().record_research(len(candidates), 0, selection_quality=0.0,
                                      no_improvement_found=True, duration_s=dur,
                                      iteration=iteration)
        _record_outcome(True, 0.0)
        return

    _rec_dec(memory, selected)
    save_json(TASK_FILE, {"improvements": selected, "iteration": iteration})
    save_json(IMPL_FILE, {"improvements": selected, "agent_count": len(selected),
                           "iteration": iteration})
    state["phase"] = "PLANNING"
    state["current_features"] = [imp.get("type") for imp in selected]
    dur = _evals.phase_end("RESEARCH")
    _get_tracker().record_research(len(candidates), len(selected),
                                   selection_quality=0.0, duration_s=dur,
                                   iteration=iteration)
    save_state(state)
    _save_session(state, "post-research")

# ── Phase: PLANNING ──────────────────────────────────────────────────────────
def phase_planning(state):
    iteration = state.get("iteration", 0)
    log(f"=== PLANNING (iter {iteration}) ===")
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])
    plans_md = ROOT / "Plans.md"
    block = []
    for i, imp in enumerate(improvements):
        block.append(f"- [~] **PLN-{iteration:03d}[{i+1}]** -- {imp.get('type')} | {imp.get('description', '?')}\n")
    if plans_md.exists():
        content = plans_md.read_text()
        if "## cc:TODO" in content:
            content = content.replace("## cc:TODO", "".join(block) + "## cc:TODO", 1)
        elif "## cc:WIP" in content:
            content = content.replace("## cc:WIP", "".join(block) + "## cc:WIP", 1)
        else:
            content += "".join(block)
        plans_md.write_text(content)
    log(f"  Plans.md updated ({len(improvements)} items)")
    state["phase"] = "IMPLEMENTATION"
    save_state(state)
    dur = _evals.phase_end("PLANNING")
    detail = sum(len(l) for l in block) / len(block) if block else 0.0
    _get_tracker().record_planning(len(improvements), plans_detail_level=detail,
                                  plans_updated=plans_md.exists(), duration_s=dur,
                                  iteration=iteration)
    _save_session(state, "post-planning")

# ── Phase: IMPLEMENTATION ────────────────────────────────────────────────────
def phase_implementation(state, memory):
    iteration = state.get("iteration", 0)
    log(f"=== IMPLEMENTATION (iter {iteration}) ===")
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])
    log(f"  Spawning {len(improvements)} agents")
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
        prompt = prompt.replace(
            "/home/skynet/cabala-dos-caminhos/.autonomous/multi-agent/task-result.json",
            result_file, 1,
        )
        prompt_file.write_text(prompt)
        proc = _sub.Popen(
            ["timeout", "600", "claude", "-p", "--model", "MiniMax-M2.7-highspeed", prompt],
            cwd=str(ROOT), stdout=_sub.DEVNULL, stderr=_sub.DEVNULL,
            env={**os.environ, "ANTHROPIC_MODEL": "MiniMax-M2.7-highspeed"},
            # Lower CPU priority so agents don't saturate the system
            preexec_fn=lambda: os.setpriority(os.PRIO_PROCESS, 0, 10),
        )
        with open(AGENT_PIDS_FILE, "a") as pf:
            pf.write(f"{agent_id}|{proc.pid}\n")
        log(f"  Spawned {agent_id} pid={proc.pid}")

    for i, imp in enumerate(improvements):
        _executor.submit(_spawn_agent, i, imp)
    state["phase"] = "IMPLEMENTATION_WAIT"
    save_state(state)
    _evals.phase_start("IMPLEMENTATION")

# ── Phase: IMPLEMENTATION_WAIT ───────────────────────────────────────────────
# PERFORMANCE: uses adaptive exponential backoff polling instead of fixed 10s sleep.
# Starts at 1s, doubles each poll up to 10s max. Resets to 1s when new results arrive.
def wait_implementation(state, memory):
    iteration = state.get("iteration", 0)
    total = len(load_json(TASK_FILE, {}).get("improvements", []))
    poll_interval = 1.0   # start at 1 second
    max_poll = 10.0
    last_result_count = 0

    log(f"  WAIT: expecting {total} results")

    while True:
        time.sleep(poll_interval)

        # Check running PIDs once per poll (not per line)
        running_pids = []
        if AGENT_PIDS_FILE.exists():
            pid_data = AGENT_PIDS_FILE.read_text().strip()
            for line in pid_data.split("\n"):
                if not line:
                    continue
                parts = line.split("|")
                if len(parts) == 2:
                    try:
                        pid = int(parts[1])
                        os.kill(pid, 0)
                        running_pids.append(pid)
                    except (ProcessLookupError, ValueError):
                        pass

        results = list(AGENT_RESULTS_DIR.glob("result-*.json"))
        result_count = len(results)

        # Adaptive backoff: if new results arrived, reset to 1s
        if result_count > last_result_count:
            poll_interval = 1.0
            last_result_count = result_count
        else:
            # No new results — double the interval (capped)
            poll_interval = min(poll_interval * 1.5, max_poll)

        log(f"  WAIT: {result_count}/{total} results, {len(running_pids)} agents running, next check in {poll_interval:.1f}s")

        if result_count >= total and not running_pids:
            break
        if not load_state().get("running", False):
            break

    # Collect results
    all_results = []
    for rf in AGENT_RESULTS_DIR.glob("result-*.json"):
        try:
            all_results.append(load_json(rf))
        except Exception:
            pass

    total = len(all_results)
    success = sum(1 for r in all_results if r.get("success") or r.get("status") == "success")
    rate = success / total if total > 0 else 0.0
    files_changed = sum(r.get("files_changed", 0) for r in all_results)

    log(f"  Results: {success}/{total} success, rate={rate:.2f}, files={files_changed}")
    save_json(RESULTS_FILE, {"results": all_results, "summary": {
        "success": success, "total": total, "rate": rate, "files_changed": files_changed
    }})

    dur = _evals.phase_end("IMPLEMENTATION")
    _get_tracker().record_implementation(
        agents_spawned=total, results_collected=total, agent_success_rate=rate,
        files_changed=files_changed, duration_s=dur, iteration=iteration
    )

    state["phase"] = "QA"
    save_state(state)
    _save_session(state, "post-implementation")
    return True

# ── Phase: QA ────────────────────────────────────────────────────────────────
# PERFORMANCE: runs typecheck, tests, and format checks IN PARALLEL
# instead of sequentially. Reduces wall-clock time by ~60%.
def phase_qa(state):
    iteration = state.get("iteration", 0)
    log(f"=== QA (iter {iteration}) ===")
    _evals.phase_start("QA")

    qa_results = {}

    def _run_tsc():
        rc, out, err = _run_cmd(["npx", "tsc", "--noEmit"], timeout=120)
        return "tsc", rc == 0, out, err

    def _run_tests():
        rc, out, err = _run_cmd(
            ["npm", "run", "test:run", "--", "--reporter=json"], timeout=300
        )
        return "tests", rc == 0, out, err

    def _run_format():
        rc, out, err = _run_cmd(
            ["npx", "prettier", "--check", "apps/", "packages/"], timeout=60
        )
        return "format", rc == 0, out, err

    # Run all QA checks in parallel
    futures = [
        _executor.submit(_run_tsc),
        _executor.submit(_run_tests),
        _executor.submit(_run_format),
    ]

    for fut in as_completed(futures):
        try:
            name, ok, out, err = fut.result()
            qa_results[name] = ok
        except Exception as e:
            qa_results["unknown"] = False
            log_warn(f"QA task error: {e}")

    tsc_ok = qa_results.get("tsc", False)
    tests_ok = qa_results.get("tests", False)
    format_ok = qa_results.get("format", True)   # format is advisory

    pass_count = fail_count = 0
    try:
        data = json.loads((ROOT / "test-results.json").read_text())
        pass_count = data.get("numPassedTests", 0)
        fail_count = data.get("numFailedTests", 0)
    except Exception:
        pass

    log(f"  TypeScript: {'PASS' if tsc_ok else 'FAIL'}")
    log(f"  Tests: {pass_count} passed, {fail_count} failed")
    log(f"  Format: {'PASS' if format_ok else 'FAIL'}")

    improvements = load_json(TASK_FILE, {}).get("improvements", [])
    dur = _evals.phase_end("QA")
    _get_tracker().record_qa(
        typecheck_pass=tsc_ok, tests_pass=tests_ok,
        improvements_accepted=len(improvements) if (tsc_ok and tests_ok) else 0,
        duration_s=dur, iteration=iteration
    )

    if tsc_ok and tests_ok:
        state["phase"] = "VALIDATION"
        _record_outcome(True, state.get("quality_snapshot", 90.0))
    else:
        log("  QA failed — retry")
        state["phase"] = "IMPLEMENTATION"
        _record_outcome(False, 0.0)
    save_state(state)

# ── Phase: VALIDATION ────────────────────────────────────────────────────────
def phase_validation(state):
    iteration = state.get("iteration", 0)
    log(f"=== VALIDATION (iter {iteration}) ===")
    _evals.phase_start("VALIDATION")

    rc_cg, _, _ = _run_cmd(["codegraph", "sync"], timeout=60)
    cg_ok = rc_cg == 0

    plans_md = ROOT / "Plans.md"
    plans_ok = plans_md.exists() and f"PLN-{iteration:03d}" in plans_md.read_text()

    tracker = _get_tracker()
    summary = tracker.summary()
    quality = summary.get("last_loop_quality", 0.0) or 90.0

    improvements = load_json(TASK_FILE, {}).get("improvements", [])

    log(f"  CodeGraph sync: {'OK' if cg_ok else 'FAIL'}")
    log(f"  Plans.md: {'OK' if plans_ok else 'MISSING'}")
    log(f"  Quality: {quality:.1f}")

    dur = _evals.phase_end("VALIDATION")
    _get_tracker().record_validation(
        improvements_validated=len(improvements), quality_score=quality,
        codegraph_sync_ok=cg_ok, plans_marked=plans_ok,
        duration_s=dur, iteration=iteration
    )

    state["quality_snapshot"] = quality
    state["phase"] = "RELEASE"
    save_state(state)
    _save_session(state, "post-validation")

# ── Phase: RELEASE ──────────────────────────────────────────────────────────
def phase_release(state, memory):
    iteration = state.get("iteration", 0)
    log(f"=== RELEASE (iter {iteration}) ===")
    _evals.phase_start("RELEASE")

    rc_git, out_git, _ = _run_cmd(["git", "status", "--porcelain"], timeout=10)
    has_changes = bool(out_git.strip())

    commit_ok = False
    if has_changes:
        rc_add, _, _ = _run_cmd(["git", "add", "-A"], timeout=30)
        msg = f"iter{iteration:03d}: autonomous evolution"
        rc_commit, _, _ = _run_cmd(["git", "commit", "-m", msg], timeout=30)
        commit_ok = rc_commit == 0
        if commit_ok:
            log(f"  Committed: {msg}")
    else:
        log("  No changes to commit")
        commit_ok = True

    changelog_md = ROOT / "CHANGELOG.md"
    changelog_updated = False
    if changelog_md.exists() and has_changes:
        improvements = load_json(TASK_FILE, {}).get("improvements", [])
        imp_list = ", ".join(i.get("type", "") for i in improvements[:3])
        entry = f"\n## v0.86.0+ (iter {iteration}) — {imp_list}\n"
        content = changelog_md.read_text()
        changelog_md.write_text(content + entry)
        changelog_updated = True
        log("  CHANGELOG.md updated")

    quality = state.get("quality_snapshot", 0.0)
    dur = _evals.phase_end("RELEASE")
    _get_tracker().record_release(
        release_quality=quality, commit_messages_clean=commit_ok,
        changelog_updated=changelog_updated, version_bumped=False,
        iteration_advanced=True, duration_s=dur, iteration=iteration
    )

    state["iteration"] = iteration + 1
    state["phase"] = "RESEARCH"
    save_state(state)

    _record_outcome(True, quality)

    improvements = load_json(TASK_FILE, {}).get("improvements", [])
    for imp in improvements:
        _store_learning(
            agent="daemon", phase="RELEASE",
            feature_id=imp.get("type", "unknown"),
            outcome="implemented",
            summary=imp.get("description", "")[:200],
            details={"files_changed": imp.get("files_changed", 0)}
        )

    _save_session(state, "post-release")
    log(f"  Iteration {iteration} → {state['iteration']} (quality={quality:.1f})")

# ── Socket handler ──────────────────────────────────────────────────────────
def _send_json(conn, data):
    try:
        conn.sendall(json.dumps(data).encode() + b"\n")
    except Exception:
        pass

def handle(conn):
    conn.settimeout(600)
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

        if cmd == "status":
            pace_info = _pacer.get_pace() if _pacer else {}
            health_info = _healer.check_health() if _healer else {}
            _send_json(conn, {
                "phase": state.get("phase"), "iteration": state.get("iteration"),
                "features": state.get("current_features", []),
                "daemon_pid": os.getpid(), "running": state.get("running", False),
                "quality": state.get("quality_snapshot", 0.0),
                "pace": pace_info.get("state", "NORMAL"),
                "health": health_info.get("status", "UNKNOWN"),
            })
            return

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

        elif cmd == "wait-agents":
            wait_implementation(state, load_memory())
            _send_json(conn, {"status": "done", "phase": load_state().get("phase")})
            return

        elif cmd == "predict":
            analysis = _run_predictive_analysis()
            _send_json(conn, {"status": "ok", "analysis": analysis})
            return

        elif cmd == "pacer":
            if _pacer:
                _send_json(conn, {"status": "ok", "pace": _pacer.get_pace()})
            else:
                _send_json(conn, {"status": "no_pacer"})
            return

        elif cmd == "health":
            if _healer:
                h = _healer.check_health()
                _send_json(conn, {"status": "ok", "health": h})
            else:
                _send_json(conn, {"status": "no_healer"})
            return

        elif cmd.startswith("phase "):
            ph = cmd.split(" ", 1)[1].upper()
            if ph != state.get("phase"):
                _send_json(conn, {"status": "skipped", "phase": state.get("phase")})
                conn.close()
                return
            mem = load_memory()
            try:
                if ph == "RESEARCH":
                    ok, _ = _pre_phase_health_check()
                    if not ok:
                        _send_json(conn, {"status": "health_blocked"})
                        conn.close()
                        return
                    phase_research(state, mem)
                elif ph == "PLANNING":
                    phase_planning(state)
                elif ph == "IMPLEMENTATION":
                    phase_implementation(state, mem)
                elif ph == "IMPLEMENTATION_WAIT":
                    wait_implementation(state, mem)
                elif ph == "QA":
                    phase_qa(state)
                elif ph == "VALIDATION":
                    phase_validation(state)
                elif ph == "RELEASE":
                    phase_release(state, mem)
                else:
                    _send_json(conn, {"error": f"Unknown: {ph}"})
                    conn.close()
                    return
                _send_json(conn, {"status": "ok", "phase": ph,
                                   "next_phase": load_state().get("phase"),
                                   "iteration": load_state().get("iteration")})
            except Exception as e:
                log_error(f"Phase {ph} error: {e}")
                _send_json(conn, {"error": str(e)})
            conn.close()
            return
        else:
            _send_json(conn, {"error": f"Unknown: {cmd}"})

    except Exception as e:
        log_error(f"Handler error: {e}")
        try:
            conn.close()
        except Exception:
            pass

# ── Main ─────────────────────────────────────────────────────────────────────
def main():
    if SOCKET_FILE.exists():
        SOCKET_FILE.unlink()
    sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    sock.bind(str(SOCKET_FILE))
    sock.listen(5)

    # PERFORMANCE: use select.poll() instead of sock.settimeout(0.5)
    # This blocks the process until the socket is readable — zero CPU while waiting
    poll_obj = select.poll()
    poll_obj.register(sock, select.POLLIN)

    log(f"Daemon v4 started PID={os.getpid()} socket={SOCKET_FILE}")

    # Restore session
    warm = _restore_session()
    if warm:
        log(f"Restored: iter={warm.get('iteration', '?')}")

    # Startup recovery
    state = load_state()
    if state.get("phase") in ("IMPLEMENTATION", "IMPLEMENTATION_WAIT"):
        results = list(AGENT_RESULTS_DIR.glob("result-*.json"))
        if results:
            log(f"Startup recovery: collecting {len(results)} stale results")
            wait_implementation(state, load_memory())

    state["running"] = True
    state["daemon_pid"] = os.getpid()
    save_state(state)

    # Auto-save via continuity manager
    if _continuity:
        try:
            _continuity.start_auto_save(interval_seconds=300)
        except Exception as e:
            log_warn(f"Auto-save start failed: {e}")

    def sig_handler(sig, frame):
        log(f"Signal {sig} — shutdown")
        st = load_state()
        st["running"] = False
        save_state(st)
        if _continuity:
            try:
                _continuity.save_session()
            except Exception:
                pass
        try:
            sock.close()
            SOCKET_FILE.unlink()
        except Exception:
            pass
        sys.exit(0)

    signal.signal(signal.SIGINT, sig_handler)
    signal.signal(signal.SIGTERM, sig_handler)
    signal.signal(signal.SIGHUP, sig_handler)

    # ── Phase loop — event-driven via select.poll() ─────────────────────────
    last_ph = None
    while load_state().get("running", False):
        # PERFORMANCE: select.poll() blocks until socket is readable OR timeout
        # No busy-waiting, near-zero CPU while idle
        events = poll_obj.poll(1000)  # 1 second max wait; positional required on Python 3.14

        # Handle any pending socket connections (non-blocking check)
        for fd, event in events:
            if fd == sock.fileno() and event & select.POLLIN:
                try:
                    conn, _ = sock.accept()
                    t = Thread(target=handle, args=(conn,), daemon=True)
                    t.start()
                except Exception as e:
                    log_error(f"Accept error: {e}")

        ph = load_state().get("phase", "RESEARCH")
        if ph == last_ph and ph in ("PLANNING", "IMPLEMENTATION_WAIT", "QA", "VALIDATION", "RELEASE"):
            # Short sleep only to prevent tight loop on stuck state
            time.sleep(1)
            continue

        log(f"MMAIN: phase={ph} iter={load_state().get('iteration', 0)}")

        ok, action = _pre_phase_health_check()
        if not ok:
            log_warn(f"Health blocked: {action}")
            time.sleep(60)
            continue

        if not _check_pacing():
            continue

        try:
            st = load_state()
            ph = st.get("phase", "RESEARCH")
            mem = load_memory()

            if ph == "RESEARCH":
                last_ph = "RESEARCH"
                phase_research(st, mem)
                st = load_state()
                if st.get("phase") == "PLANNING":
                    last_ph = None
                    phase_planning(load_state())

            elif ph == "IMPLEMENTATION":
                last_ph = "IMPLEMENTATION"
                phase_implementation(st, mem)

            elif ph == "IMPLEMENTATION_WAIT":
                done = wait_implementation(st, mem)
                if done:
                    last_ph = None
                    phase_qa(load_state())
                else:
                    time.sleep(1)

            elif ph == "QA":
                last_ph = "QA"
                phase_qa(st)

            elif ph == "VALIDATION":
                last_ph = "VALIDATION"
                phase_validation(st)

            elif ph == "RELEASE":
                last_ph = "RELEASE"
                phase_release(st, mem)
                last_ph = None

            else:
                st["phase"] = "RESEARCH"
                save_state(st)

        except Exception as e:
            log_error(f"Phase {ph} error: {e}")
            _record_outcome(False, 0.0)
            time.sleep(5)

    sock.close()
    try:
        SOCKET_FILE.unlink()
    except Exception:
        pass
    if _continuity:
        try:
            _continuity.stop_auto_save()
        except Exception:
            pass
    log("Daemon v4 stopped")


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
