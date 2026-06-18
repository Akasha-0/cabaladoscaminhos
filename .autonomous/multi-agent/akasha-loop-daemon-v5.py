#!/usr/bin/env python3
"""
Akasha Loop Daemon v5 — Fully Integrated Autonomous Evolution Engine
===================================================================
Performance-optimized (select.poll, adaptive polling, in-memory cache,
parallel QA, agent resource limits) + all 8 subsystems + new v2 modules.

v5 adds integration with:
  - ProjectMap: project-wide area intelligence
  - ReasoningChain: chain-of-thought decision making
  - ContextEngine: deep project context management
  - Evolver: autonomous brain and self-optimizer
  - PromptEngine: engineering of agent prompts
  - AgentOrchestrator: resource-aware parallel agent management

Starts via: bash .autonomous/multi-agent/run-loop-supervised.sh
"""

from __future__ import annotations

import json, os, select, signal, socket, subprocess as _sub, sys, time, traceback
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from threading import Thread
from typing import Optional

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

_executor = ThreadPoolExecutor(max_workers=6)

# ── In-memory caches ──────────────────────────────────────────────────────────
_state_cache: Optional[dict] = None
_state_cache_time: float = 0.0
_STATE_CACHE_TTL: float = 2.0

_memory_cache: Optional[dict] = None
_memory_cache_time: float = 0.0
_MEMORY_CACHE_TTL: float = 5.0

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
    print(f"[{datetime.now().strftime('%H:%M:%S')}] DAEMON-v5: {msg}", flush=True)

def log_warn(msg: str) -> None:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] WARN: {msg}", flush=True)

def log_error(msg: str) -> None:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] ERROR: {msg}", flush=True, file=sys.stderr)

# ── Module loader ─────────────────────────────────────────────────────────────
import importlib.util

def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, str(path))
    mod = importlib.util.module_from_spec(spec)
    mod.ROOT = ROOT; mod.MA = MA
    mod.load_json = load_json; mod.save_json = save_json
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

# ── Load core modules ────────────────────────────────────────────────────────
_lm = _load("_lm", MA / "akasha-evolution-loop.py")
_bootstrap = _lm.bootstrap
_find = _lm.find_improvement_candidates
_pick = _lm.pick_best_improvements
_add_lr = _lm.add_learning
_rec_dec = _lm.record_decision

_evals = _load("_evals", MA / "evals.py")

# ── Load harness subsystems (graceful fallback) ─────────────────────────────
def _try(name: str):
    try:
        return _load(f"_{name}", MA / f"{name}.py")
    except FileNotFoundError:
        return None

_telemetry = _try("telemetry")
_adaptive_pacer = _try("adaptive_pacer")
_self_healer = _try("self_healer")
_predictive_engine = _try("predictive_engine")
_skill_discoverer = _try("skill_discoverer")
_continuity_manager = _try("continuity_manager")
_memory_manager = _try("memory_manager")
_guardian = _try("guardian")

# ── Load v2 modules (graceful fallback) ──────────────────────────────────────
_project_map = None
_reasoning_chain = None
_context_engine = None
_evolver = None
_prompt_engine = None
_agent_orchestrator = None

try:
    _pm = _load("_pm", MA / "project_map.py")
    _project_map = _pm.ProjectMap()
    log(f"ProjectMap: {len(_project_map.get_project_stats()['areas'])} areas mapped")
except Exception as e:
    log_warn(f"ProjectMap unavailable: {e}")

try:
    _rc = _load("_rc", MA / "reasoning_chain.py")
    _reasoning_chain = _rc.ReasoningChain()
    log("ReasoningChain loaded")
except Exception as e:
    log_warn(f"ReasoningChain unavailable: {e}")

try:
    _ce = _load("_ce", MA / "context_engine.py")
    _context_engine = _ce.ContextEngine()
    log("ContextEngine loaded")
except Exception as e:
    log_warn(f"ContextEngine unavailable: {e}")

try:
    _ev = _load("_ev", MA / "evolver.py")
    _evolver = _ev.Evolver()
    log("Evolver loaded")
except Exception as e:
    log_warn(f"Evolver unavailable: {e}")

try:
    _pe = _load("_pe", MA / "prompt_engine.py")
    _prompt_engine = _pe.PromptEngine()
    log("PromptEngine loaded")
except Exception as e:
    log_warn(f"PromptEngine unavailable: {e}")

try:
    _ao = _load("_ao", MA / "agent_orchestrator.py")
    _agent_orchestrator = _ao.AgentOrchestrator()
    log("AgentOrchestrator loaded")
except Exception as e:
    log_warn(f"AgentOrchestrator unavailable: {e}")

# ── Instantiate subsystem singletons ─────────────────────────────────────────
_pacer = None; _healer = None; _predictor = None
_skill_mgr = None; _continuity = None; _mem_mgr = None; _telem = None

if _adaptive_pacer:
    try:
        _pacer = _adaptive_pacer.get_pacer()
        log(f"AdaptivePacer: state={_pacer.get_pace()['state']}")
    except Exception as e:
        log_warn(f"AdaptivePacer: {e}")

if _self_healer:
    try:
        _healer = _self_healer.SelfHealer()
        log("SelfHealer loaded")
    except Exception as e:
        log_warn(f"SelfHealer: {e}")

if _predictive_engine:
    try:
        _predictor = _predictive_engine.PredictiveEngine()
        log("PredictiveEngine loaded")
    except Exception as e:
        log_warn(f"PredictiveEngine: {e}")

if _skill_discoverer:
    try:
        _skill_mgr = _skill_discoverer.SkillDiscoverer()
        log(f"SkillDiscoverer: {len(_skill_mgr.get_skills())} skills")
    except Exception as e:
        log_warn(f"SkillDiscoverer: {e}")

if _continuity_manager:
    try:
        _continuity = _continuity_manager.ContinuityManager()
        log("ContinuityManager loaded")
    except Exception as e:
        log_warn(f"ContinuityManager: {e}")

if _memory_manager:
    try:
        _mem_mgr = _memory_manager.MemoryManager()
        log("MemoryManager loaded")
    except Exception as e:
        log_warn(f"MemoryManager: {e}")

if _telemetry:
    try:
        _telem = _telemetry.TelemetryCollector()
        log("TelemetryCollector loaded")
    except Exception as e:
        log_warn(f"TelemetryCollector: {e}")

_tracker = _evals.MetricsTracker()

# ── Cached state/memory helpers ───────────────────────────────────────────────
def load_state(force=False):
    global _state_cache, _state_cache_time
    now = time.monotonic()
    if not force and _state_cache and (now - _state_cache_time) < _STATE_CACHE_TTL:
        return _state_cache
    _state_cache = load_json(STATE_FILE, {
        "phase": "RESEARCH", "iteration": 0, "running": False, "daemon_pid": None,
        "current_features": [], "quality_snapshot": 0.0
    })
    _state_cache_time = now
    return _state_cache

def save_state(state):
    global _state_cache, _state_cache_time
    save_json(STATE_FILE, state)
    _state_cache = state; _state_cache_time = time.monotonic()

def load_memory(force=False):
    global _memory_cache, _memory_cache_time
    now = time.monotonic()
    if not force and _memory_cache and (now - _memory_cache_time) < _MEMORY_CACHE_TTL:
        return _memory_cache
    _memory_cache = load_json(MEMORY_FILE, {
        "learnings": [], "decisions": [], "context_window": [], "iteration": 0
    })
    _memory_cache_time = now
    return _memory_cache

def save_memory(mem):
    global _memory_cache, _memory_cache_time
    save_json(MEMORY_FILE, mem)
    _memory_cache = mem; _memory_cache_time = time.monotonic()

def save_checkpoint(state, reason=""):
    cp = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "phase": state.get("phase"), "iteration": state.get("iteration"),
        "quality_snapshot": state.get("quality_snapshot", 0.0),
        "current_features": state.get("current_features", []),
        "daemon_pid": os.getpid(), "reason": reason,
    }
    save_json(CHECKPOINT_FILE, cp)

# ── Subsystem helpers ────────────────────────────────────────────────────────
def _health_check():
    if not _healer:
        return True, None
    try:
        h = _healer.check_health()
        if h.get("healthy"):
            return True, None
        issue = _healer.detect_issue()
        strategy = _healer.suggest_recovery(issue)
        recovered = _healer.recover(strategy)
        return recovered, strategy
    except Exception as e:
        log_error(f"Health check error: {e}")
        return True, None

def _check_pacing():
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
            return _pacer.should_proceed(pace.get("quality_ema", 90))
        action = _pacer.get_recommended_action()
        if action["action"] in ("throttle", "halt"):
            time.sleep(pace.get("min_delay_seconds", 30))
        return _pacer.should_proceed(pace.get("quality_ema", 90))
    except Exception as e:
        log_warn(f"Pacer error: {e}")
        return True

def _record_outcome(success, quality=0.0):
    if _pacer:
        try:
            _pacer.record_outcome(success)
        except Exception:
            pass
    if _telem:
        try:
            _telem.record("ITERATION", {"outcome": "success" if success else "failed",
                                         "quality_score": quality})
        except Exception:
            pass

def _run_predictive():
    if not _predictor:
        return {}
    try:
        return _predictor.analyze()
    except Exception as e:
        log_warn(f"PredictiveEngine: {e}")
        return {}

def _apply_predictions(analysis):
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
                log_warn(f"MemoryManager compact: {e}")
        elif risk.get("type") == "quality_regression" and _pacer:
            try:
                _pacer.force_state("SLOW", f"quality regression: {risk.get('description')}")
            except Exception:
                pass

def _maybe_discover_skills(iteration):
    if not _skill_mgr or iteration % 10 != 0:
        return
    try:
        new = _skill_mgr.discover()
        if new:
            log(f"SkillDiscoverer: {len(new)} new skills")
            for s in new:
                log(f"  → {s.get('name')}: {s.get('description', '')[:80]}")
    except Exception as e:
        log_warn(f"SkillDiscoverer: {e}")

def _save_session(state, reason=""):
    if _continuity:
        try:
            _continuity.save_session()
        except Exception as e:
            log_warn(f"Continuity save: {e}")
    save_checkpoint(state, reason)

def _restore_session():
    if not _continuity:
        return {}
    try:
        warm = _continuity.restore_session()
        if warm:
            log("ContinuityManager: restored from warm storage")
            return warm
    except Exception as e:
        log_warn(f"Continuity restore: {e}")
    return {}

# ── ProjectMap + ReasoningChain enhanced helpers ─────────────────────────────
def _find_with_intelligence(snapshot, memory):
    """Find improvements enhanced with ProjectMap + ReasoningChain."""
    candidates = _find(snapshot)

    if _project_map:
        try:
            neglected = _project_map.get_neglected_areas(threshold_days=30)
            high_pot = _project_map.get_high_potential_areas(top_n=3)
            for c in candidates:
                area = c.get("area", "unknown")
                if area in neglected:
                    c["area_score_boost"] = 2.0
                if any(a.get("area") == area for a in high_pot):
                    c["area_score_boost"] = (c.get("area_score_boost", 1.0) or 1.0) * 1.5
        except Exception as e:
            log_warn(f"ProjectMap: {e}")

    if _reasoning_chain and _context_engine:
        try:
            ctx = _context_engine.build_full_context(iteration_goal="find_improvements")
            for c in candidates[:10]:
                r = _reasoning_chain.reason_about(c, {"context": ctx})
                c["reasoning"] = r
        except Exception as e:
            log_warn(f"ReasoningChain: {e}")

    return candidates

def _pick_with_reasoning(candidates, memory, max_count=5):
    """Pick best improvements enhanced with reasoning scores."""
    selected = _pick(candidates, memory, max_count=max_count)
    if _reasoning_chain:
        for s in selected:
            r = s.get("reasoning", {})
            conf = r.get("confidence", 0.5)
            impact = r.get("impact", 0.5)
            compound = r.get("compound_potential", 0.5)
            s["reasoning_score"] = conf * 0.3 + impact * 0.4 + compound * 0.3
        selected.sort(key=lambda x: x.get("reasoning_score", 0.5), reverse=True)
        selected = selected[:max_count]
    return selected

# ── Phase: RESEARCH ──────────────────────────────────────────────────────────
def phase_research(state, memory):
    iteration = state.get("iteration", 0)
    log(f"=== RESEARCH v5 (iter {iteration}) ===")

    # Project state assessment
    if _evolver:
        try:
            ps = _evolver.assess_project_state()
            log(f"  Project quality: {ps.get('overall_quality', 'N/A')}")
            neglected = ps.get("neglected_areas", [])
            if neglected:
                log(f"  Neglected: {', '.join(neglected[:5])}")
        except Exception as e:
            log_warn(f"Evolver assess: {e}")

    analysis = _run_predictive()
    _apply_predictions(analysis)
    _maybe_discover_skills(iteration)

    # Build context
    ctx = {}
    if _context_engine:
        try:
            ctx = _context_engine.build_full_context(iteration_goal="research")
        except Exception as e:
            log_warn(f"ContextEngine: {e}")

    snap = _bootstrap(use_cache=True)
    candidates = _find_with_intelligence(snap, memory)
    selected = _pick_with_reasoning(candidates, memory, max_count=5)

    log(f"  {len(candidates)} candidates, {len(selected)} selected")
    for i, imp in enumerate(selected[:5]):
        area = imp.get("area", "unknown")
        log(f"  [{i+1}] [{area}] {imp.get('type')}: {imp.get('description', '')[:60]}")
        if imp.get("reasoning"):
            r = imp["reasoning"]
            log(f"      conf={r.get('confidence',0):.2f} impact={r.get('impact',0):.2f} compound={r.get('compound_potential',0):.2f}")

    if not selected:
        log("  No improvements → RELEASE")
        _rec_dec(memory, [{"type": "none", "description": "no improvement found"}])
        save_memory(memory)
        state["phase"] = "RELEASE"
        save_state(state)
        _tracker.record_research(len(candidates), 0, selection_quality=0.0,
                                no_improvement_found=True, duration_s=0.1,
                                iteration=iteration)
        _record_outcome(True, 0.0)
        return

    _rec_dec(memory, selected)
    save_json(TASK_FILE, {"improvements": selected, "iteration": iteration})
    save_json(IMPL_FILE, {"improvements": selected, "agent_count": len(selected),
                           "iteration": iteration})
    state["phase"] = "PLANNING"
    state["current_features"] = [imp.get("type") for imp in selected]
    save_state(state)
    _save_session(state, "post-research")
    _tracker.record_research(len(candidates), len(selected), selection_quality=0.0,
                             duration_s=0.1, iteration=iteration)

# ── Phase: PLANNING ─────────────────────────────────────────────────────────
def phase_planning(state):
    iteration = state.get("iteration", 0)
    log(f"=== PLANNING v5 (iter {iteration}) ===")
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])
    plans_md = ROOT / "Plans.md"
    lines = []
    for i, imp in enumerate(improvements):
        area = imp.get("area", "general")
        lines.append(f"- [~] **PLN-{iteration:03d}[{i+1}]** -- [{area}] {imp.get('type')} | {imp.get('description', '?')}\n")
    if lines:
        content = plans_md.read_text() if plans_md.exists() else ""
        for marker in ("## cc:TODO", "## cc:WIP"):
            if marker in content:
                idx = content.index(marker)
                content = content[:idx] + "".join(lines) + content[idx:]
                break
        else:
            content += "".join(lines)
        plans_md.write_text(content)
    log(f"  Plans.md updated ({len(improvements)} items)")
    state["phase"] = "IMPLEMENTATION"
    save_state(state)
    _tracker.record_planning(len(improvements), plans_detail_level=50.0,
                             plans_updated=True, duration_s=0.1, iteration=iteration)
    _save_session(state, "post-planning")

# ── Phase: IMPLEMENTATION (AgentOrchestrator if available) ────────────────────
def phase_implementation(state, memory):
    iteration = state.get("iteration", 0)
    log(f"=== IMPLEMENTATION v5 (iter {iteration}) ===")
    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])
    log(f"  {len(improvements)} improvements")

    if _agent_orchestrator and _context_engine:
        try:
            ctx = _context_engine.build_full_context(iteration_goal="implement")
            log("  Using AgentOrchestrator (parallel, resource-aware)")
            result = _agent_orchestrator.orchestrate(improvements, ctx)
            save_json(RESULTS_FILE, {"results": result.get("results", []),
                                     "summary": result.get("summary", {})})
            state["phase"] = "QA"
            save_state(state)
            _tracker.record_implementation(
                agents_spawned=len(improvements),
                results_collected=len(result.get("results", [])),
                agent_success_rate=result.get("summary", {}).get("success_rate", 0.0),
                files_changed=result.get("summary", {}).get("files_changed", 0),
                duration_s=result.get("duration_s", 0.1),
                iteration=iteration
            )
            _evals.phase_start("IMPLEMENTATION")
            return
        except Exception as e:
            log_warn(f"AgentOrchestrator error, falling back: {e}")

    # Fallback: spawn directly
    save_json(RESULTS_FILE, {"results": []})
    for f in AGENT_RESULTS_DIR.glob("result-*.json"):
        try:
            f.unlink()
        except Exception:
            pass
    if AGENT_PIDS_FILE.exists():
        AGENT_PIDS_FILE.unlink()

    def _spawn(i, imp):
        import time as _t
        agent_id = f"ta-{int(_t.time())}-{i}"
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
            preexec_fn=lambda: os.setpriority(os.PRIO_PROCESS, 0, 10),
        )
        with open(AGENT_PIDS_FILE, "a") as pf:
            pf.write(f"{agent_id}|{proc.pid}\n")
        log(f"  Spawned {agent_id} pid={proc.pid}")

    for i, imp in enumerate(improvements):
        _executor.submit(_spawn, i, imp)
    state["phase"] = "IMPLEMENTATION_WAIT"
    save_state(state)
    _evals.phase_start("IMPLEMENTATION")

# ── Phase: IMPLEMENTATION_WAIT (adaptive polling) ────────────────────────────
def wait_implementation(state, memory):
    iteration = state.get("iteration", 0)
    total = len(load_json(TASK_FILE, {}).get("improvements", []))
    poll_interval = 1.0
    max_poll = 10.0
    last_count = 0

    log(f"  WAIT: expecting {total} results")

    while True:
        time.sleep(poll_interval)

        running = []
        if AGENT_PIDS_FILE.exists():
            for line in AGENT_PIDS_FILE.read_text().strip().split("\n"):
                if not line:
                    continue
                parts = line.split("|")
                if len(parts) == 2:
                    try:
                        pid = int(parts[1])
                        os.kill(pid, 0)
                        running.append(pid)
                    except (ProcessLookupError, ValueError):
                        pass

        results = list(AGENT_RESULTS_DIR.glob("result-*.json"))
        count = len(results)

        if count > last_count:
            poll_interval = 1.0
            last_count = count
        else:
            poll_interval = min(poll_interval * 1.5, max_poll)

        log(f"  WAIT: {count}/{total} results, {len(running)} agents, next in {poll_interval:.1f}s")

        if count >= total and not running:
            break
        if not load_state().get("running", False):
            break

    all_results = []
    for rf in AGENT_RESULTS_DIR.glob("result-*.json"):
        try:
            all_results.append(load_json(rf))
        except Exception:
            pass

    total_r = len(all_results)
    success = sum(1 for r in all_results if r.get("success") or r.get("status") == "success")
    rate = success / total_r if total_r > 0 else 0.0
    files_changed = sum(r.get("files_changed", 0) for r in all_results)

    log(f"  Results: {success}/{total_r} success, rate={rate:.2f}, files={files_changed}")
    save_json(RESULTS_FILE, {"results": all_results, "summary": {
        "success": success, "total": total_r, "rate": rate, "files_changed": files_changed
    }})

    dur = _evals.phase_end("IMPLEMENTATION")
    _tracker.record_implementation(agents_spawned=total_r, results_collected=total_r,
                                   agent_success_rate=rate, files_changed=files_changed,
                                   duration_s=dur, iteration=iteration)
    state["phase"] = "QA"
    save_state(state)
    _save_session(state, "post-implementation")

# ── Phase: QA (parallel) ─────────────────────────────────────────────────────
def phase_qa(state):
    iteration = state.get("iteration", 0)
    log(f"=== QA v5 (iter {iteration}) ===")
    _evals.phase_start("QA")
    qa_results = {}

    def _run_tsc():
        rc, out, err = _run_cmd(["npx", "tsc", "--noEmit"], timeout=120)
        return "tsc", rc == 0, out, err

    def _run_tests():
        rc, out, err = _run_cmd(["npm", "run", "test:run", "--", "--reporter=json"], timeout=300)
        return "tests", rc == 0, out, err

    def _run_format():
        rc, out, err = _run_cmd(["npx", "prettier", "--check", "apps/", "packages/"], timeout=60)
        return "format", rc == 0, out, err

    futures = [_executor.submit(_run_tsc), _executor.submit(_run_tests),
               _executor.submit(_run_format)]
    for fut in as_completed(futures):
        try:
            name, ok, _, _ = fut.result()
            qa_results[name] = ok
        except Exception as e:
            qa_results["unknown"] = False
            log_warn(f"QA task error: {e}")

    tsc_ok = qa_results.get("tsc", False)
    tests_ok = qa_results.get("tests", False)
    format_ok = qa_results.get("format", True)

    pass_c = fail_c = 0
    try:
        data = json.loads((ROOT / "test-results.json").read_text())
        pass_c = data.get("numPassedTests", 0)
        fail_c = data.get("numFailedTests", 0)
    except Exception:
        pass

    log(f"  TypeScript: {'PASS' if tsc_ok else 'FAIL'}")
    log(f"  Tests: {pass_c} passed, {fail_c} failed")
    log(f"  Format: {'PASS' if format_ok else 'FAIL'}")

    improvements = load_json(TASK_FILE, {}).get("improvements", [])
    dur = _evals.phase_end("QA")
    _tracker.record_qa(typecheck_pass=tsc_ok, tests_pass=tests_ok,
                       improvements_accepted=len(improvements) if (tsc_ok and tests_ok) else 0,
                       duration_s=dur, iteration=iteration)

    if tsc_ok and tests_ok:
        state["phase"] = "VALIDATION"
        _record_outcome(True, state.get("quality_snapshot", 90.0))
    else:
        log("  QA failed → IMPLEMENTATION")
        state["phase"] = "IMPLEMENTATION"
        _record_outcome(False, 0.0)
    save_state(state)

# ── Phase: VALIDATION ───────────────────────────────────────────────────────
def phase_validation(state):
    iteration = state.get("iteration", 0)
    log(f"=== VALIDATION v5 (iter {iteration}) ===")
    _evals.phase_start("VALIDATION")

    rc_cg, _, _ = _run_cmd(["codegraph", "sync"], timeout=60)
    cg_ok = rc_cg == 0
    plans_md = ROOT / "Plans.md"
    plans_ok = plans_md.exists() and f"PLN-{iteration:03d}" in plans_md.read_text()
    summary = _tracker.summary()
    quality = summary.get("last_loop_quality", 0.0) or 90.0
    improvements = load_json(TASK_FILE, {}).get("improvements", [])

    log(f"  CodeGraph: {'OK' if cg_ok else 'FAIL'}")
    log(f"  Plans.md: {'OK' if plans_ok else 'MISSING'}")
    log(f"  Quality: {quality:.1f}")

    dur = _evals.phase_end("VALIDATION")
    _tracker.record_validation(improvements_validated=len(improvements),
                                quality_score=quality, codegraph_sync_ok=cg_ok,
                                plans_marked=plans_ok, duration_s=dur,
                                iteration=iteration)
    state["quality_snapshot"] = quality
    state["phase"] = "RELEASE"
    save_state(state)
    _save_session(state, "post-validation")

# ── Phase: RELEASE ──────────────────────────────────────────────────────────
def phase_release(state, memory):
    iteration = state.get("iteration", 0)
    log(f"=== RELEASE v5 (iter {iteration}) ===")
    _evals.phase_start("RELEASE")

    rc_git, out_git, _ = _run_cmd(["git", "status", "--porcelain"], timeout=10)
    has_changes = bool(out_git.strip())
    commit_ok = False

    if has_changes:
        rc_add, _, _ = _run_cmd(["git", "add", "-A"], timeout=30)
        msg = f"iter{iteration:03d}: autonomous evolution v5"
        rc_commit, _, _ = _run_cmd(["git", "commit", "-m", msg], timeout=30)
        commit_ok = rc_commit == 0
        if commit_ok:
            log(f"  Committed: {msg}")
    else:
        log("  No changes to commit")
        commit_ok = True

    changelog_md = ROOT / "CHANGELOG.md"
    if changelog_md.exists() and has_changes:
        improvements = load_json(TASK_FILE, {}).get("improvements", [])
        imp_list = ", ".join(i.get("type", "") for i in improvements[:3])
        entry = f"\n## v0.86.0+ (iter {iteration}) — {imp_list}\n"
        content = changelog_md.read_text()
        changelog_md.write_text(content + entry)
        log("  CHANGELOG.md updated")

    quality = state.get("quality_snapshot", 0.0)
    dur = _evals.phase_end("RELEASE")
    _tracker.record_release(release_quality=quality, commit_messages_clean=commit_ok,
                             changelog_updated=has_changes, version_bumped=False,
                             iteration_advanced=True, duration_s=dur,
                             iteration=iteration)

    state["iteration"] = iteration + 1
    state["phase"] = "RESEARCH"
    save_state(state)
    _record_outcome(True, quality)

    improvements = load_json(TASK_FILE, {}).get("improvements", [])
    for imp in improvements:
        try:
            _add_lr(memory, "daemon", "RELEASE", imp.get("type", "unknown"),
                    "implemented", imp.get("description", "")[:200],
                    {"files_changed": imp.get("files_changed", 0)})
        except Exception:
            pass
        if _mem_mgr:
            try:
                _mem_mgr.store({
                    "agent": "daemon", "phase": "RELEASE",
                    "feature_id": imp.get("type", "unknown"),
                    "outcome": "implemented",
                    "summary": imp.get("description", "")[:200],
                    "details": {"files_changed": imp.get("files_changed", 0)},
                    "iteration": iteration,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
            except Exception:
                pass
    save_memory(memory)
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
                "version": "v5",
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

        elif cmd == "evolver":
            if _evolver:
                try:
                    ps = _evolver.assess_project_state()
                    _send_json(conn, {"status": "ok", "project_state": ps})
                except Exception as e:
                    _send_json(conn, {"error": str(e)})
            else:
                _send_json(conn, {"status": "no_evolver"})
            conn.close()
            return

        elif cmd == "project-map":
            if _project_map:
                try:
                    stats = _project_map.get_project_stats()
                    neglected = _project_map.get_neglected_areas()
                    high_pot = _project_map.get_high_potential_areas()
                    _send_json(conn, {"status": "ok", "stats": stats,
                                       "neglected": neglected, "high_potential": high_pot})
                except Exception as e:
                    _send_json(conn, {"error": str(e)})
            else:
                _send_json(conn, {"status": "no_project_map"})
            conn.close()
            return

        elif cmd == "context":
            if _context_engine:
                try:
                    ctx = _context_engine.build_full_context()
                    _send_json(conn, {"status": "ok", "context": ctx})
                except Exception as e:
                    _send_json(conn, {"error": str(e)})
            else:
                _send_json(conn, {"status": "no_context_engine"})
            conn.close()
            return

        elif cmd == "reasoning":
            if _reasoning_chain:
                try:
                    r = _reasoning_chain.think("What should Akasha evolve next?",
                                                {"iteration": state.get("iteration", 0)})
                    _send_json(conn, {"status": "ok", "reasoning": {
                        "steps": len(r.reasoning_steps) if hasattr(r, 'reasoning_steps') else 0,
                        "conclusion": r.conclusion if hasattr(r, 'conclusion') else str(r),
                        "confidence": r.confidence if hasattr(r, 'confidence') else 0.0
                    }})
                except Exception as e:
                    _send_json(conn, {"error": str(e)})
            else:
                _send_json(conn, {"status": "no_reasoning_chain"})
            conn.close()
            return

        elif cmd == "predict":
            analysis = _run_predictive()
            _send_json(conn, {"status": "ok", "analysis": analysis})
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
                    ok, _ = _health_check()
                    if not ok:
                        _send_json(conn, {"status": "health_blocked"})
                        conn.close()
                        return
                    phase_research(state, mem)
                elif ph == "PLANNING":
                    phase_planning(load_state())
                elif ph == "IMPLEMENTATION":
                    phase_implementation(load_state(), mem)
                elif ph == "IMPLEMENTATION_WAIT":
                    wait_implementation(load_state(), mem)
                elif ph == "QA":
                    phase_qa(load_state())
                elif ph == "VALIDATION":
                    phase_validation(load_state())
                elif ph == "RELEASE":
                    phase_release(load_state(), mem)
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
    poll_obj = select.poll()
    poll_obj.register(sock, select.POLLIN)

    log(f"Daemon v5 started PID={os.getpid()} modules=8+{sum([_project_map is not None, _reasoning_chain is not None, _context_engine is not None, _evolver is not None, _prompt_engine is not None, _agent_orchestrator is not None])}")

    warm = _restore_session()
    if warm:
        log(f"Restored: iter={warm.get('iteration', '?')}")

    state = load_state()
    if state.get("phase") in ("IMPLEMENTATION", "IMPLEMENTATION_WAIT"):
        results = list(AGENT_RESULTS_DIR.glob("result-*.json"))
        if results:
            log(f"Startup recovery: collecting {len(results)} stale results")
            wait_implementation(state, load_memory())

    state["running"] = True
    state["daemon_pid"] = os.getpid()
    save_state(state)

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

    last_ph = None
    while load_state().get("running", False):
        events = poll_obj.poll(timeout=1000)
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
            time.sleep(1)
            continue

        log(f"MMAIN: phase={ph} iter={load_state().get('iteration', 0)}")

        ok, action = _health_check()
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
            log_error(f"Phase {ph} error: {e}\n{traceback.format_exc()}")
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
    log("Daemon v5 stopped")

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
