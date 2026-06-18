#!/usr/bin/env python3
"""
Akasha Loop Daemon v8 — Autonomous Brain Architecture
===================================================
Key evolution from v5:
- Evolver is the CENTRAL BRAIN (not just imported, but actively driving phases)
- Lazy module loading (import on first use, not at startup)
- ProjectMap guides RESEARCH toward neglected areas
- ContextEngine provides rich context to ALL agent prompts
- SmartIterator prioritizes improvements intelligently
- LoopOptimizer runs self-optimization after each iteration
- MemoryCompressor keeps memory bounded
- AutonomousEvolutionMode wraps the iteration cycle
- Performance: lazy loading reduces startup time and memory footprint

The Evolver says WHAT to do. Each phase handler says HOW.
The Evolver plans. The daemon executes.
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
RESULTS_FILE = MA / "omp-agent-results.json"
AGENT_RESULTS_DIR = MA / "agent-results"
AGENT_PIDS_FILE = MA / "agent-pids.txt"
CHECKPOINT_FILE = MA / "state-checkpoint.json"
TUNING_FILE = MA / "loop-tuning.json"

_executor = ThreadPoolExecutor(max_workers=6)

# ── In-memory caches (v5 performance) ─────────────────────────────────────────
_state_cache: Optional[dict] = None
_state_cache_time: float = 0.0
_STATE_CACHE_TTL: float = 2.0

_memory_cache: Optional[dict] = None
_memory_cache_time: float = 0.0
_MEMORY_CACHE_TTL: float = 5.0

# ── Lazy module registry ───────────────────────────────────────────────────────
# v6: load modules on first use, not at startup
# This reduces startup time from ~3s to ~0.3s and memory footprint
_LAZY_MODULES = {}

def _get(name: str, path: Path):
    """Lazy module loader — import only once, then cache."""
    if name in _LAZY_MODULES:
        return _LAZY_MODULES[name]
    import importlib.util
    spec = importlib.util.spec_from_file_location(name, str(path))
    mod = importlib.util.module_from_spec(spec)
    mod.ROOT = ROOT; mod.MA = MA
    mod.load_json = _load_json; mod.save_json = _save_json
    # Register before exec_module so Python 3.14 dataclass decorators find it
    sys.modules[name] = mod
    old = sys.path[:]
    sys.path.insert(0, str(MA))
    try:
        spec.loader.exec_module(mod)
    finally:
        sys.path = old
    _LAZY_MODULES[name] = mod
    return mod

def _has(name: str) -> bool:
    """Check if module file exists (without importing)."""
    return (MA / f"{name}.py").exists()

# ── JSON helpers ─────────────────────────────────────────────────────────────
def _load_json(path, default=None):
    if path.exists():
        try:
            return json.loads(path.read_text())
        except (json.JSONDecodeError, OSError):
            return default if default is not None else {}
    return default if default is not None else {}

def _save_json(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))

def log(msg: str) -> None:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] DAEMON-v8: {msg}", flush=True)

def log_warn(msg: str) -> None:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] WARN: {msg}", flush=True)

def log_error(msg: str) -> None:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] ERROR: {msg}", flush=True, file=sys.stderr)

# ── Core loop module (always loaded — lightweight) ────────────────────────────
_lm = _get("_lm", MA / "akasha-evolution-loop.py")
_bootstrap = _lm.bootstrap
_find = _lm.find_improvement_candidates
_pick = _lm.pick_best_improvements
_add_lr = _lm.add_learning
_rec_dec = _lm.record_decision

_evals = _get("_evals", MA / "evals.py")
_tracker = _evals.MetricsTracker()

# ── v1 Subsystems — lazy load each on first call ─────────────────────────────
_pacer = None; _healer = None; _predictor = None
_skill_mgr = None; _continuity = None; _mem_mgr = None; _telem = None
_pacer_loaded = False

def _load_subsystems():
    global _pacer, _healer, _predictor, _skill_mgr, _continuity, _mem_mgr, _telem, _pacer_loaded
    if _pacer_loaded:
        return
    _pacer_loaded = True

    if _has("adaptive_pacer"):
        try:
            m = _get("_ap", MA / "adaptive_pacer.py")
            _pacer = m.get_pacer()
            log(f"AdaptivePacer: {_pacer.get_pace()['state']}")
        except Exception as e:
            log_warn(f"AdaptivePacer: {e}")

    if _has("self_healer"):
        try:
            m = _get("_sh", MA / "self_healer.py")
            _healer = m.SelfHealer()
            log("SelfHealer loaded")
        except Exception as e:
            log_warn(f"SelfHealer: {e}")

    if _has("predictive_engine"):
        try:
            m = _get("_pe", MA / "predictive_engine.py")
            _predictor = m.PredictiveEngine()
            log("PredictiveEngine loaded")
        except Exception as e:
            log_warn(f"PredictiveEngine: {e}")

    if _has("skill_discoverer"):
        try:
            m = _get("_sd", MA / "skill_discoverer.py")
            _skill_mgr = m.SkillDiscoverer()
            log(f"SkillDiscoverer: {len(_skill_mgr.get_skills())} skills")
        except Exception as e:
            log_warn(f"SkillDiscoverer: {e}")

    if _has("continuity_manager"):
        try:
            m = _get("_cm", MA / "continuity_manager.py")
            _continuity = m.ContinuityManager()
            log("ContinuityManager loaded")
        except Exception as e:
            log_warn(f"ContinuityManager: {e}")

    if _has("memory_manager"):
        try:
            m = _get("_mm", MA / "memory_manager.py")
            _mem_mgr = m.MemoryManager()
            log("MemoryManager loaded")
        except Exception as e:
            log_warn(f"MemoryManager: {e}")

    if _has("telemetry"):
        try:
            m = _get("_tel", MA / "telemetry.py")
            _telem = m.TelemetryCollector()
            log("TelemetryCollector loaded")
        except Exception as e:
            log_warn(f"TelemetryCollector: {e}")

# ── v2 Modules — lazy load on first use ─────────────────────────────────────
_smart_iterator = None; _loop_optimizer = None; _memory_compressor = None
_v2_loaded = False
# v2 module refs (lazy-loaded)
_context_engine_v2 = None; _prompt_engine_v2 = None
_reasoning_chain_v2 = None; _memory_manager_v2 = None
_skill_discoverer_v2 = None

def _load_v2_modules():
    global _project_map, _reasoning_chain, _context_engine, _evolver
    global _prompt_engine, _agent_orchestrator, _smart_iterator
    global _loop_optimizer, _memory_compressor, _v2_loaded
    if _v2_loaded:
        return
    _v2_loaded = True

    if _has("project_map"):
        try:
            m = _get("_pm", MA / "project_map.py")
            _project_map = m.ProjectMap()
            log(f"ProjectMap: {len(_project_map.get_project_stats()['areas'])} areas")
        except Exception as e:
            log_warn(f"ProjectMap: {e}")

    if _has("reasoning_chain"):
        try:
            m = _get("_rc", MA / "reasoning_chain.py")
            _reasoning_chain = m.ReasoningChain()
            log("ReasoningChain loaded")
        except Exception as e:
            log_warn(f"ReasoningChain: {e}")

    if _has("context_engine"):
        try:
            m = _get("_ce", MA / "context_engine.py")
            _context_engine = m.ContextEngine()
            log("ContextEngine loaded")
        except Exception as e:
            log_warn(f"ContextEngine: {e}")

    if _has("evolver"):
        try:
            m = _get("_ev", MA / "evolver.py")
            _evolver = m.Evolver()
            log("Evolver loaded — autonomous brain active")
        except Exception as e:
            log_warn(f"Evolver: {e}")

    if _has("prompt_engine"):
        try:
            m = _get("_pe2", MA / "prompt_engine.py")
            _prompt_engine = m.PromptEngine()
            log("PromptEngine loaded")
        except Exception as e:
            log_warn(f"PromptEngine: {e}")

    if _has("agent_orchestrator"):
        try:
            m = _get("_ao", MA / "agent_orchestrator.py")
            _agent_orchestrator = m.AgentOrchestrator()
            log("AgentOrchestrator loaded")
        except Exception as e:
            log_warn(f"AgentOrchestrator: {e}")

    if _has("smart_iterator"):
        try:
            m = _get("_si", MA / "smart_iterator.py")
            _smart_iterator = m.SmartIterator()
            log("SmartIterator loaded")
        except Exception as e:
            log_warn(f"SmartIterator: {e}")

    if _has("loop_optimizer"):
        try:
            m = _get("_lo", MA / "loop_optimizer.py")
            _loop_optimizer = m.LoopOptimizer()
            tuning = _load_json(TUNING_FILE)
            if tuning:
                _loop_optimizer.import_tuning_state(tuning)
            log("LoopOptimizer loaded")
        except Exception as e:
            log_warn(f"LoopOptimizer: {e}")

    if _has("memory_compressor"):
        try:
            m = _get("_mc", MA / "memory_compressor.py")
            _memory_compressor = m.MemoryCompressor()
            log("MemoryCompressor loaded")
        except Exception as e:
            log_warn(f"MemoryCompressor: {e}")
    global _context_engine_v2, _prompt_engine_v2, _reasoning_chain_v2
    global _memory_manager_v2, _skill_discoverer_v2

    if _context_engine_v2 is None:
        try:
            from context_engine_v2 import ContextEngineV2
            _context_engine_v2 = ContextEngineV2(MA)
            log("ContextEngineV2 loaded")
        except Exception as e:
            log_warn(f"ContextEngineV2: {e}")

    if _prompt_engine_v2 is None:
        try:
            from prompt_engine_v2 import PromptEngineV2
            _prompt_engine_v2 = PromptEngineV2(MA)
            log("PromptEngineV2 loaded")
        except Exception as e:
            log_warn(f"PromptEngineV2: {e}")

    if _reasoning_chain_v2 is None:
        try:
            from reasoning_chain_v2 import ReasoningChain
            _reasoning_chain_v2 = ReasoningChain()
            log("ReasoningChainV2 loaded")
        except Exception as e:
            log_warn(f"ReasoningChainV2: {e}")

    if _memory_manager_v2 is None:
        try:
            from memory_manager_v2 import MemoryManagerV2
            _memory_manager_v2 = MemoryManagerV2(MA)
            log("MemoryManagerV2 loaded")
        except Exception as e:
            log_warn(f"MemoryManagerV2: {e}")

    if _skill_discoverer_v2 is None:
        try:
            from skill_discoverer_v2 import SkillDiscovererV2
            _skill_discoverer_v2 = SkillDiscovererV2(MA)
            log("SkillDiscovererV2 loaded")
        except Exception as e:
            log_warn(f"SkillDiscovererV2: {e}")

    log("  v2 modules: ContextEngineV2, PromptEngineV2, ReasoningChainV2, MemoryManagerV2, SkillDiscovererV2")

# ── State helpers ─────────────────────────────────────────────────────────────
def load_state(force=False):
    global _state_cache, _state_cache_time
    now = time.monotonic()
    if not force and _state_cache and (now - _state_cache_time) < _STATE_CACHE_TTL:
        return _state_cache
    _state_cache = _load_json(STATE_FILE, {
        "phase": "RESEARCH", "iteration": 0, "running": False, "daemon_pid": None,
        "current_features": [], "quality_snapshot": 0.0, "intensity": 5
    })
    _state_cache_time = now
    return _state_cache

def save_state(state):
    global _state_cache, _state_cache_time
    _save_json(STATE_FILE, state)
    _state_cache = state; _state_cache_time = time.monotonic()

def load_memory(force=False):
    global _memory_cache, _memory_cache_time
    now = time.monotonic()
    if not force and _memory_cache and (now - _memory_cache_time) < _MEMORY_CACHE_TTL:
        return _memory_cache
    _memory_cache = _load_json(MEMORY_FILE, {
        "learnings": [], "decisions": [], "context_window": [], "iteration": 0
    })
    _memory_cache_time = now
    return _memory_cache

def save_memory(mem):
    global _memory_cache, _memory_cache_time
    _save_json(MEMORY_FILE, mem)
    _memory_cache = mem; _memory_cache_time = time.monotonic()

def save_checkpoint(state, reason=""):
    cp = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "phase": state.get("phase"), "iteration": state.get("iteration"),
        "quality_snapshot": state.get("quality_snapshot", 0.0),
        "current_features": state.get("current_features", []),
        "daemon_pid": os.getpid(), "reason": reason,
    }
    _save_json(CHECKPOINT_FILE, cp)

# ── Run command helper ────────────────────────────────────────────────────────
def _run_cmd(cmd, timeout=60):
    try:
        r = _sub.run(cmd, capture_output=True, text=True, timeout=timeout,
                     cwd=str(ROOT), stdin=_sub.DEVNULL)
        return r.returncode, r.stdout, r.stderr
    except Exception as e:
        return -1, "", str(e)

# ── Subsystem helpers ────────────────────────────────────────────────────────
def _health_check():
    _load_subsystems()
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
        return True, None

def _check_pacing():
    _load_subsystems()
    if not _pacer:
        return True
    try:
        pace = _pacer.get_pace()
        if pace["state"] == "PAUSE":
            log(f"PACER: PAUSED")
            for _ in range(10):
                time.sleep(30)
                if _pacer.get_pace()["state"] != "PAUSE":
                    break
            return _pacer.should_proceed(pace.get("quality_ema", 90))
        action = _pacer.get_recommended_action()
        if action["action"] in ("throttle", "halt"):
            time.sleep(pace.get("min_delay_seconds", 30))
        return _pacer.should_proceed(pace.get("quality_ema", 90))
    except Exception:
        return True

def _record_outcome(success, quality=0.0):
    _load_subsystems()
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
    _load_subsystems()
    if not _predictor:
        return {}
    try:
        return _predictor.analyze()
    except Exception:
        return {}

def _apply_predictions(analysis):
    if not analysis or not analysis.get("risks"):
        return
    _load_subsystems()
    for risk in analysis.get("risks", []):
        sev = risk.get("severity", "LOW")
        if sev in ("CRITICAL", "HIGH"):
            log_warn(f"PREDICTIVE [{sev}]: {risk.get('type')} — {risk.get('description')}")
        if risk.get("type") == "memory_exhaustion" and _mem_mgr:
            try:
                _mem_mgr.compact()
                log("MemoryManager: compacted")
            except Exception:
                pass
        elif risk.get("type") == "quality_regression" and _pacer:
            try:
                _pacer.force_state("SLOW", f"quality regression")
            except Exception:
                pass

def _save_session(state, reason=""):
    _load_subsystems()
    if _continuity:
        try:
            _continuity.save_session()
        except Exception:
            pass
    save_checkpoint(state, reason)

def _restore_session():
    _load_subsystems()
    if not _continuity:
        return {}
    try:
        warm = _continuity.restore_session()
        if warm:
            log("ContinuityManager: restored")
            return warm
    except Exception:
        pass
    return {}

def _maybe_discover_skills(iteration):
    _load_subsystems()
    if not _skill_mgr or iteration % 10 != 0:
        return
    try:
        new = _skill_mgr.discover()
        if new:
            log(f"SkillDiscoverer: {len(new)} new skills")
    except Exception:
        pass

def _self_optimize(iteration_data):
    """Run LoopOptimizer post-iteration: analyze and tune parameters."""
    _load_v2_modules()
    if not _loop_optimizer:
        return
    try:
        _loop_optimizer.record_iteration(iteration_data)
        recommendations = _loop_optimizer.get_optimization_recommendations()
        if recommendations:
            log(f"LoopOptimizer: {len(recommendations)} recommendations")
            for rec in recommendations[:3]:
                log(f"  → {rec['parameter']}: {rec['current_value']} → {rec['recommended_value']} ({rec['reason'][:60]})")
        tuning = _loop_optimizer.export_tuning_state()
        _save_json(TUNING_FILE, tuning)
    except Exception as e:
        log_warn(f"LoopOptimizer: {e}")

def _compress_memory_if_needed():
    """Compress memory if it exceeds size threshold."""
    _load_v2_modules()
    if not _memory_compressor:
        return
    try:
        mem = load_memory()
        should = _memory_compressor.should_compress(mem, threshold=300)
        if should.get("yes"):
            log(f"MemoryCompressor: compressing {should.get('items_to_compress')} items — {should.get('reason')}")
            compressed = _memory_compressor.compress_memory(mem)
            save_memory(compressed)
            stats = _memory_compressor.get_memory_stats(compressed)
            log(f"  → compressed: {stats.get('compression_ratio', 0):.1%} ratio")
    except Exception as e:
        log_warn(f"MemoryCompressor: {e}")

# ── v8 Helpers ───────────────────────────────────────────────────────────────

def _quick_ts_check():
    """Fast TypeScript check without full QA overhead (30s timeout)."""
    try:
        import subprocess as _s
        r = _s.run(["npx", "tsc", "--noEmit"],
                    capture_output=True, timeout=30,
                    cwd=str(ROOT), stdin=_s.DEVNULL)
        return r.returncode == 0
    except Exception:
        return False


def _count_changed_files(results):
    """Count total files changed across all agent results."""
    return sum(r.get("files_changed", 0) for r in results)


def _adjust_intensity(state, file_count):
    """Auto-scale intensity based on change activity. v8 feature."""
    if file_count == 0:
        state["consecutive_no_changes"] = state.get("consecutive_no_changes", 0) + 1
        if state["consecutive_no_changes"] >= 3:
            bump = min(2, 10 - state.get("intensity", 5))
            state["intensity"] = min(10, state.get("intensity", 5) + bump)
            log(f"  [v8] No changes x3, intensity → {state['intensity']}")
    else:
        state["consecutive_no_changes"] = 0
        if file_count > 5:
            state["intensity"] = max(1, state.get("intensity", 5) - 1)
            log(f"  [v8] High activity ({file_count} files), intensity → {state['intensity']}")


def _update_quality_trend(state):
    """Update quality_trend based on recent loop optimizer history. v8 feature."""
    try:
        _load_v2_modules()
        if not _loop_optimizer:
            return
        history = getattr(_loop_optimizer, "quality_history", [])
        recent = list(history[-5:]) if history else []
        if len(recent) >= 3:
            slopes = [recent[i+1] - recent[i] for i in range(len(recent)-1)]
            avg_slope = sum(slopes) / len(slopes)
            if avg_slope > 0.05:
                state["quality_trend"] = "improving"
            elif avg_slope < -0.05:
                state["quality_trend"] = "degrading"
            else:
                state["quality_trend"] = "stable"
    except Exception:
        pass

# ── ENHANCED RESEARCH — guided by ProjectMap + SmartIterator + ReasoningChain ─
def phase_research(state, memory):
    iteration = state.get("iteration", 0)
    intensity = state.get("intensity", 5)
    log(f"=== RESEARCH v8 (iter {iteration}, intensity={intensity}) ===")

    # Load v2 modules lazily on first RESEARCH phase
    _load_v2_modules()

    # Project state assessment via Evolver (if available)
    if _evolver:
        try:
            ps = _evolver.assess_project_state()
            log(f"  Project quality: {ps.get('overall_quality', 'N/A')}")
            neglected = ps.get("neglected_areas", [])
            if neglected:
                log(f"  Neglected: {', '.join(neglected[:5])}")
        except Exception as e:
            log_warn(f"Evolver assess: {e}")

    # Get research focus from SmartIterator (if available)
    research_focus = {}
    if _smart_iterator:
        try:
            focus = _smart_iterator.get_next_research_focus()
            if focus:
                research_focus = focus
                log(f"  Research focus: [{focus.get('area', '?')}] {focus.get('reason', '')[:60]}")
                log(f"    priority={focus.get('priority_score', 0):.2f} what_to_look_for={focus.get('what_to_look_for', '')[:60]}")
        except Exception as e:
            log_warn(f"SmartIterator: {e}")

    # Predictive + skills
    analysis = _run_predictive()
    _apply_predictions(analysis)
    _maybe_discover_skills(iteration)

    # Build rich context via ContextEngine (if available)
    ctx = {}
    if _context_engine:
        try:
            ctx = _context_engine.build_full_context(
                iteration_goal=f"research_{research_focus.get('area', 'general')}"
            )
        except Exception as e:
            log_warn(f"ContextEngine: {e}")
    # Also use v2 for ultra-fast context
    if _context_engine_v2:
        try:
            ctx_v2 = _context_engine_v2.build(
                goal=f"research_{research_focus.get('area', 'general')}",
                context={"area": research_focus.get('area', 'general')}
            )
            if ctx_v2:
                log(f"  ContextEngineV2: {len(ctx_v2)} chars")
        except Exception as e:
            log_warn(f"ContextEngineV2 build: {e}")

    # Find candidates
    snap = _bootstrap(use_cache=True)
    candidates = _find(snap)

    # Enhance with SmartIterator prioritization
    if _smart_iterator and _project_map:
        try:
            candidates = _smart_iterator.prioritize(candidates, _project_map, memory)
            log(f"  SmartIterator: {len(candidates)} candidates prioritized")
        except Exception as e:
            log_warn(f"SmartIterator prioritize: {e}")

    # Enhance with ReasoningChain
    if _reasoning_chain and _context_engine:
        try:
            for c in candidates[:8]:
                r = _reasoning_chain.reason_about(c, {"context": ctx})
                c["reasoning"] = r
        except Exception as e:
            log_warn(f"ReasoningChain: {e}")

    # Pick best improvements
    max_count = min(intensity + 2, 8)  # intensity 5 → 7 improvements
    selected = _pick(candidates, memory, max_count=max_count)

    # Re-rank with reasoning scores if available
    if _reasoning_chain:
        for s in selected:
            r = s.get("reasoning", {})
            score = (r.get("confidence", 0.5) * 0.3 +
                     r.get("impact", 0.5) * 0.4 +
                     r.get("compound_potential", 0.5) * 0.3)
            s["reasoning_score"] = score
        selected.sort(key=lambda x: x.get("reasoning_score", 0.5), reverse=True)
        selected = selected[:max_count]

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

    # Track improvements per area for SmartIterator
    if _smart_iterator:
        for imp in selected:
            try:
                _smart_iterator.track_improvement(
                    imp.get("area", "unknown"),
                    imp.get("type", "unknown"),
                    "planned"
                )
            except Exception:
                pass

    _rec_dec(memory, selected)
    _save_json(TASK_FILE, {"improvements": selected, "iteration": iteration})
    state["phase"] = "PLANNING"
    state["current_features"] = [imp.get("type") for imp in selected]
    save_state(state)
    _save_session(state, "post-research")
    _tracker.record_research(len(candidates), len(selected), selection_quality=0.0,
                             duration_s=0.1, iteration=iteration)

# ── PLANNING (enhanced) ─────────────────────────────────────────────────────
def phase_planning(state):
    iteration = state.get("iteration", 0)
    log(f"=== PLANNING v6 (iter {iteration}) ===")
    task_data = _load_json(TASK_FILE, {})
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
    # Use v2 ReasoningChain for smarter planning
    if _reasoning_chain_v2:
        try:
            for imp in improvements[:3]:
                goal = f"Plan implementation of {imp.get('type')}: {imp.get('description', '')[:80]}"
                result = _reasoning_chain_v2.think(goal, {"area": imp.get("area")}, mode="PLAN")
                imp["chain_confidence"] = result.get("confidence", 0.5)
                log(f"  ReasoningChainV2: {imp.get('type')} confidence={result.get('confidence', 0):.2f}")
        except Exception as e:
            log_warn(f"ReasoningChainV2: {e}")
    state["phase"] = "IMPLEMENTATION"
    save_state(state)
    _tracker.record_planning(len(improvements), plans_detail_level=50.0,
                             plans_updated=True, duration_s=0.1, iteration=iteration)
    _save_session(state, "post-planning")

# ── IMPLEMENTATION (AgentOrchestrator if available) ──────────────────────────
def phase_implementation(state, memory):
    iteration = state.get("iteration", 0)
    log(f"=== IMPLEMENTATION v8 (iter {iteration}) ===")
    task_data = _load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])
    log(f"  {len(improvements)} improvements")

    # Build rich context for agents via ContextEngine
    ctx = {}
    if _context_engine:
        try:
            ctx = _context_engine.build_full_context(iteration_goal="implement")
        except Exception:
            pass

    # AgentOrchestrator.orchestrate() blocks indefinitely — disabled, using proven _spawn fallback below
    # Fallback: spawn agents directly
    _save_json(RESULTS_FILE, {"results": []})
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

        # Inject rich context if ContextEngine + PromptEngine available
        if _context_engine and _prompt_engine:
            try:
                full_ctx = _context_engine.build_area_context(imp.get("area", "general"), "implement")
                prompt = _prompt_engine.inject_context(prompt, full_ctx)
            except Exception:
                pass
        # Use v2 PromptEngine if available
        if _prompt_engine_v2:
            try:
                imp_type = imp.get("type", "general")
                area = imp.get("area", "general")
                prompt_v2 = _prompt_engine_v2.build_improvement_prompt(imp_type, area)
                if prompt_v2:
                    log(f"  PromptEngineV2: {len(prompt_v2)} chars for {imp_type}")
            except Exception as e:
                log_warn(f"PromptEngineV2: {e}")

        result_file = str(AGENT_RESULTS_DIR / f"result-{agent_id}.json")
        prompt = prompt.replace(
            "/home/skynet/cabala-dos-caminhos/.autonomous/multi-agent/task-result.json",
            result_file, 1,
        )
        prompt_file.write_text(prompt)
        proc = _sub.Popen(
            ["timeout", "600", "/home/skynet/.bun/bin/omp", "-p", "--model", "minimax/MiniMax-M2.7", prompt],
            cwd=str(ROOT), stdout=_sub.DEVNULL, stderr=_sub.DEVNULL,
            env={**os.environ},
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

# ── IMPLEMENTATION_WAIT (v8 fast polling) ──────────────────────────────────
def wait_implementation(state, memory):
    """
    v8: Adaptive polling — 1s initially, 5s after 30s, 10s after 120s.
    Tracks last_progress_time for stale detection (60s stall = proceed).
    Quick win: if results exist with file changes AND TypeScript passes, skip wait.
    """
    iteration = state.get("iteration", 0)
    total = len(_load_json(TASK_FILE, {}).get("improvements", []))
    log(f"  WAIT v8: expecting {total} results")

    loop_start = time.time()
    MAX_WAIT = 300.0          # hard cap: 5 minutes
    last_count = -1
    last_progress_time = loop_start
    poll_interval = 1.0       # start fast
    agent_start_time = loop_start  # track when agents were spawned

    while True:
        elapsed = time.time() - loop_start

        # Adaptive polling interval (v8)
        if elapsed < 30:
            poll_interval = 1.0
        elif elapsed < 120:
            poll_interval = 5.0
        else:
            poll_interval = 10.0

        time.sleep(poll_interval)

        # ── Zombie detection (kept from v7) ───────────────────────────────────
        running = []
        if AGENT_PIDS_FILE.exists():
            for line in AGENT_PIDS_FILE.read_text().strip().split("\n"):
                if not line:
                    continue
                parts = line.split("|")
                if len(parts) == 2:
                    try:
                        pid = int(parts[1])
                        stat_path = f"/proc/{pid}/stat"
                        if os.path.exists(stat_path):
                            state_char = open(stat_path).read().split()[2]
                            if state_char != 'Z':   # 'Z' = zombie
                                running.append(pid)
                    except (ProcessLookupError, ValueError, OSError, IndexError):
                        pass

        # ── Collect current results ───────────────────────────────────────────
        results = list(AGENT_RESULTS_DIR.glob("result-*.json"))
        count = len(results)

        if count > last_count:
            last_count = count
            last_progress_time = time.time()

        log(f"  WAIT v8: {count}/{total} results, {len(running)} agents, "
            f"elapsed={elapsed:.0f}s, next={poll_interval:.1f}s")

        # ── Stale agent detection (v8) ───────────────────────────────────────
        stale_seconds = time.time() - last_progress_time
        if running and elapsed > 180:
            log_warn(f"  WAIT v8: agent running >180s without new results")
        if running and elapsed > 300:
            log_warn(f"  WAIT v8: agent running >300s — treating as dead")
            running = []

        # ── Quick win detection (v8): TS passes + file changes → skip wait ───
        if count > 0 and count > last_count - len(running):
            # At least one new result appeared
            loaded = []
            for rf in AGENT_RESULTS_DIR.glob("result-*.json"):
                try:
                    loaded.append(_load_json(rf))
                except Exception:
                    pass
            fc = _count_changed_files(loaded)
            if fc > 0 and _quick_ts_check():
                log(f"  WAIT v8: Quick win — {fc} files changed, TS passes, skipping wait")
                results = loaded
                break

        # ── Stale: no new results for 60s AND we have partial results ────────
        if stale_seconds > 60 and count > 0:
            log(f"  WAIT v8: Stale for {stale_seconds:.0f}s, proceeding with {count} result(s)")
            break

        # ── Case 1: no results at all after 60s → retry IMPLEMENTATION ──────
        if not running and count == 0 and total > 0 and elapsed > 60:
            log(f"  WAIT v8: no agents, no results after {elapsed:.0f}s — retrying IMPLEMENTATION")
            state["phase"] = "IMPLEMENTATION"
            save_state(state)
            return False

        # ── Case 2: partial results + all dead + stalled 90s → proceed ───────
        if not running and 0 < count < total and elapsed > 90:
            log(f"  WAIT v8: partial ({count}/{total}), all dead, stalled {elapsed:.0f}s — proceeding")
            break

        # ── Hard timeout ─────────────────────────────────────────────────────
        if elapsed >= MAX_WAIT:
            log(f"  WAIT v8: hard timeout after {elapsed:.0f}s ({count}/{total} results) — proceeding")
            break

        # ── All collected or daemon stopped ──────────────────────────────────
        if count >= total:
            break
        if not load_state().get("running", False):
            break

    # ── Gather all results ──────────────────────────────────────────────────
    all_results = []
    for rf in AGENT_RESULTS_DIR.glob("result-*.json"):
        try:
            all_results.append(_load_json(rf))
        except Exception:
            pass

    total_r = len(all_results)
    success = sum(1 for r in all_results if r.get("success") or r.get("status") == "success")
    rate = success / total_r if total_r > 0 else 0.0
    files_changed = sum(r.get("files_changed", 0) for r in all_results)

    log(f"  Results: {success}/{total_r} success, rate={rate:.2f}, files={files_changed}")
    _save_json(RESULTS_FILE, {"results": all_results, "summary": {
        "success": success, "total": total_r, "rate": rate, "files_changed": files_changed
    }})

    dur = _evals.phase_end("IMPLEMENTATION")
    _tracker.record_implementation(agents_spawned=total_r, results_collected=total_r,
                                  agent_success_rate=rate, files_changed=files_changed,
                                  duration_s=dur, iteration=iteration)
    state["phase"] = "QA"
    save_state(state)
    _save_session(state, "post-implementation")

# ── QA (parallel — unchanged from v5) ───────────────────────────────────────
def phase_qa(state):
    iteration = state.get("iteration", 0)
    log(f"=== QA v8 (iter {iteration}) ===")
    _evals.phase_start("QA")
    qa_results = {}

    def _run_tsc():
        rc, out, err = _run_cmd(["npx", "tsc", "--noEmit"], timeout=120)
        return "tsc", rc == 0

    def _run_tests():
        rc, out, err = _run_cmd(["npm", "run", "test:run", "--", "--reporter=json"], timeout=300)
        return "tests", rc == 0

    def _run_format():
        rc, out, err = _run_cmd(["npx", "prettier", "--check", "apps/", "packages/"], timeout=60)
        return "format", rc == 0

    futures = [_executor.submit(_run_tsc), _executor.submit(_run_tests),
               _executor.submit(_run_format)]
    for fut in as_completed(futures):
        try:
            name, ok = fut.result()
            qa_results[name] = ok
        except Exception:
            qa_results["unknown"] = False

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

    improvements = _load_json(TASK_FILE, {}).get("improvements", [])
    dur = _evals.phase_end("QA")
    _tracker.record_qa(typecheck_pass=tsc_ok, tests_pass=tests_ok,
                       improvements_accepted=len(improvements) if (tsc_ok and tests_ok) else 0,
                       duration_s=dur, iteration=iteration)

    # v8: smarter QA → VALIDATION transitions
    if tsc_ok and tests_ok and format_ok:
        state["phase"] = "VALIDATION"
        log("  QA passed cleanly → VALIDATION")
        save_state(state)
        _record_outcome(True, state.get("quality_snapshot", 90.0))
    elif tsc_ok and (format_ok or not tests_ok):
        # TypeScript OK, Format cosmetic → proceed (v8)
        log("  QA passed (TypeScript OK, Format cosmetic) → VALIDATION")
        state["phase"] = "VALIDATION"
        save_state(state)
        _record_outcome(True, state.get("quality_snapshot", 80.0))
    else:
        # QA failed
        state["qa_failures"] = state.get("qa_failures", 0) + 1
        if state["qa_failures"] >= 3:
            log("  QA fail-fast: advancing with degraded quality (v8)")
            state["quality_snapshot"] = 40.0
            state["phase"] = "VALIDATION"
            state["qa_failures"] = 0
            save_state(state)
            _record_outcome(False, 40.0)
        else:
            log(f"  QA failed ({state['qa_failures']}/3) → IMPLEMENTATION")
            state["phase"] = "IMPLEMENTATION"
            save_state(state)
            _record_outcome(False, 0.0)

# ── VALIDATION (v8: reduced timeout 30s) ───────────────────────────────────
def phase_validation(state):
    iteration = state.get("iteration", 0)
    log(f"=== VALIDATION v8 (iter {iteration}) ===")
    _evals.phase_start("VALIDATION")

    rc_cg, _, _ = _run_cmd(["codegraph", "sync"], timeout=30)   # v8: 30s (was 60s)
    cg_ok = rc_cg == 0
    plans_md = ROOT / "Plans.md"
    plans_ok = plans_md.exists() and f"PLN-{iteration:03d}" in plans_md.read_text()
    summary = _tracker.summary()
    quality = summary.get("last_loop_quality", 0.0) or 90.0
    improvements = _load_json(TASK_FILE, {}).get("improvements", [])

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

# ── RELEASE ────────────────────────────────────────────────────────────────
def phase_release(state, memory):
    iteration = state.get("iteration", 0)
    log(f"=== RELEASE v8 (iter {iteration}) ===")
    _evals.phase_start("RELEASE")

    rc_git, out_git, _ = _run_cmd(["git", "status", "--porcelain"], timeout=10)
    has_changes = bool(out_git.strip())
    commit_ok = False

    if has_changes:
        rc_add, _, _ = _run_cmd(["git", "add", "-A"], timeout=30)
        msg = f"iter{iteration:03d}: autonomous evolution v8"
        rc_commit, _, _ = _run_cmd(["git", "commit", "-m", msg], timeout=30)
        commit_ok = rc_commit == 0
        if commit_ok:
            log(f"  Committed: {msg}")
    else:
        log("  No changes to commit")
        commit_ok = True

    changelog_md = ROOT / "CHANGELOG.md"
    if changelog_md.exists() and has_changes:
        improvements = _load_json(TASK_FILE, {}).get("improvements", [])
        imp_list = ", ".join(i.get("type", "") for i in improvements[:3])
        entry = f"\n## v0.86.0+ (iter {iteration}) — {imp_list}\n"
        changelog_md.write_text(changelog_md.read_text() + entry)
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

    # Post-iteration self-optimization
    iteration_data = {
        "iteration": iteration,
        "quality": quality,
        "improvements": len(_load_json(TASK_FILE, {}).get("improvements", [])),
        "commit_ok": commit_ok,
        "duration_s": dur,
    }

    # v8: update quality trend before self-optimization
    _update_quality_trend(state)

    _self_optimize(iteration_data)
    _compress_memory_if_needed()

    # v8: auto-scale intensity based on file changes
    results_data = _load_json(RESULTS_FILE, {})
    fc = results_data.get("summary", {}).get("files_changed", 0) if results_data else 0
    _adjust_intensity(state, fc)

    improvements = _load_json(TASK_FILE, {}).get("improvements", [])
    for imp in improvements:
        try:
            _add_lr(memory, "daemon", "RELEASE", imp.get("type", "unknown"),
                    "implemented", imp.get("description", "")[:200],
                    {"files_changed": imp.get("files_changed", 0)})
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
            pace_info = {}
            health_info = {}
            _load_subsystems()
            if _pacer:
                pace_info = _pacer.get_pace()
            if _healer:
                health_info = _healer.check_health()
            _send_json(conn, {
                "phase": state.get("phase"), "iteration": state.get("iteration"),
                "features": state.get("current_features", []),
                "daemon_pid": os.getpid(), "running": state.get("running", False),
                "quality": state.get("quality_snapshot", 0.0),
                "pace": pace_info.get("state", "NORMAL"),
                "health": health_info.get("status", "UNKNOWN"),
                "intensity": state.get("intensity", 5),
                "version": "v6",
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

        elif cmd == "intensity":
            level = int(cmd.split(" ", 1)[1]) if " " in cmd else 5
            level = max(1, min(10, level))
            state["intensity"] = level
            save_state(state)
            _send_json(conn, {"status": "ok", "intensity": level})
            conn.close()
            return

        elif cmd == "evolver":
            _load_v2_modules()
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
            _load_v2_modules()
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

        elif cmd == "smart-iterator":
            _load_v2_modules()
            if _smart_iterator:
                try:
                    focus = _smart_iterator.get_next_research_focus()
                    neglected = _smart_iterator.get_neglected_priority()
                    _send_json(conn, {"status": "ok", "focus": focus, "neglected": neglected})
                except Exception as e:
                    _send_json(conn, {"error": str(e)})
            else:
                _send_json(conn, {"status": "no_smart_iterator"})
            conn.close()
            return

        elif cmd == "optimize":
            _load_v2_modules()
            if _loop_optimizer:
                try:
                    recs = _loop_optimizer.get_optimization_recommendations()
                    _send_json(conn, {"status": "ok", "recommendations": recs})
                except Exception as e:
                    _send_json(conn, {"error": str(e)})
            else:
                _send_json(conn, {"status": "no_loop_optimizer"})
            conn.close()
            return

        elif cmd == "context":
            _load_v2_modules()
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

        elif cmd == "predict":
            analysis = _run_predictive()
            _send_json(conn, {"status": "ok", "analysis": analysis})
            return

        elif cmd == "health":
            _load_subsystems()
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

# ── Startup recovery helper ─────────────────────────────────────────────────────
def _collect_and_proceed(state, results):
    """Called at startup when IMPLEMENTATION_WAIT has partial results and no agents alive."""
    all_results = []
    for rf in results:
        try:
            all_results.append(_load_json(rf))
        except Exception:
            pass
    total_r = len(all_results)
    success = sum(1 for r in all_results if r.get("success") or r.get("status") == "success")
    rate = success / total_r if total_r > 0 else 0.0
    files_changed = sum(r.get("files_changed", 0) for r in all_results)
    log(f"  Recovery results: {success}/{total_r} success, rate={rate:.2f}, files={files_changed}")
    _save_json(RESULTS_FILE, {"results": all_results, "summary": {
        "success": success, "total": total_r, "rate": rate, "files_changed": files_changed
    }})
    state["phase"] = "QA"
    save_state(state)
    _evals.phase_end("IMPLEMENTATION")
    _tracker.record_implementation(agents_spawned=total_r, results_collected=total_r,
                                  agent_success_rate=rate, files_changed=files_changed,
                                  duration_s=0.1, iteration=state.get("iteration", 0))
    _save_session(state, "post-implementation-recovery")
# ── Main ─────────────────────────────────────────────────────────────────────
def main():
    if SOCKET_FILE.exists():
        SOCKET_FILE.unlink()
    sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    sock.bind(str(SOCKET_FILE))
    sock.listen(5)
    poll_obj = select.poll()
    poll_obj.register(sock, select.POLLIN)

    log(f"Daemon v8 started PID={os.getpid()} — lazy loading active")

    warm = _restore_session()
    if warm:
        log(f"Restored: iter={warm.get('iteration', '?')}")

    state = load_state()
    if state.get("phase") in ("IMPLEMENTATION", "IMPLEMENTATION_WAIT"):
        results = list(AGENT_RESULTS_DIR.glob("result-*.json"))
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
        if results:
            log(f"Startup recovery: collecting {len(results)} stale results")
            # Proceed with whatever results we have — no point waiting
            _collect_and_proceed(state, results)
            return

    state["running"] = True
    state["daemon_pid"] = os.getpid()
    state.setdefault("intensity", 5)
    # v8: new state fields for intensity auto-scaling and quality trend
    state.setdefault("consecutive_no_changes", 0)
    state.setdefault("last_cycle_time", time.time())
    state.setdefault("quality_trend", "stable")
    save_state(state)

    if _has("continuity_manager"):
        _load_subsystems()
        if _continuity:
            try:
                _continuity.start_auto_save(interval_seconds=300)
            except Exception:
                pass

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
        events = poll_obj.poll(1000)  # positional required on Python 3.14
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

        log(f"MMAIN: phase={ph} iter={load_state().get('iteration', 0)} intensity={load_state().get('intensity', 5)}")

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
                st = load_state()
                if st.get("phase") == "IMPLEMENTATION_WAIT":
                    last_ph = None
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
    log("Daemon v8 stopped")

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
