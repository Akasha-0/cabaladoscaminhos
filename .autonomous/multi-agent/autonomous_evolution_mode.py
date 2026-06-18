#!/usr/bin/env python3
"""
AutonomousEvolutionMode — continuous autonomous evolution wrapper.

Wraps the daemon's iteration cycle with pre/post hooks for self-optimization,
real-time parameter adjustment, memory bounding, and intelligent iteration guidance.

This is the "autonomous layer" that makes the daemon truly self-improving.
Integrates with: ProjectMap, ContextEngine, SmartIterator, MemoryCompressor,
LoopOptimizer.

Intensity 1-10:
  1 = conservative: single agent, slow pacing, minimal QA
  5 = balanced:    moderate parallelism, normal pacing, standard QA
  10 = aggressive: max parallelism, no artificial delays, thorough QA

API
---
run(num_iterations=None, intensity=5) -> Generator[IterationResult]
pre_iteration_hook(state, memory) -> enhanced_context
post_iteration_hook(iteration_result, state, memory) -> analysis
check_and_optimize() -> bool
compress_memory_if_needed() -> bool
get_autonomous_status() -> {running, iteration, intensity, last_optimization, memory_status}
set_intensity(level: int)
emergency_stop(reason: str)
should_continue() -> bool
"""

from __future__ import annotations

import json
import sys
import time
import traceback
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock
from typing import Any, Generator, Optional

# ── Paths ─────────────────────────────────────────────────────────────────────
ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous" / "multi-agent"
AUTONOMOUS_STATE_FILE = MA / "autonomous-evolution-state.json"
MEMORY_FILE = MA / "memory.json"
METRICS_FILE = MA / "metrics.json"
LOOP_OPTIMIZER_FILE = MA / "loop-optimizer-state.json"

MA.mkdir(parents=True, exist_ok=True)

# ── JSON helpers ──────────────────────────────────────────────────────────────
def load_json(path: Path, default=None) -> dict | list:
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            pass
    return default if default is not None else {}  # type: ignore[return-value]


def save_json(path: Path, data: dict | list) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


def log(msg: str) -> None:
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] AUTONOMOUS: {msg}", flush=True)


def log_warn(msg: str) -> None:
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] AUTONOMOUS WARN: {msg}", flush=True)


def log_error(msg: str) -> None:
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] AUTONOMOUS ERROR: {msg}", flush=True, file=sys.stderr)


# ── Module loader (graceful fallback) ─────────────────────────────────────────
def _load_module(name: str, path: Path):
    import importlib.util
    spec = importlib.util.spec_from_file_location(name, str(path))
    if spec is None or spec.loader is None:
        return None
    mod = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(mod)
        return mod
    except Exception:
        return None


# Load evolver for ProjectMap, ContextEngine, ReasoningChain, EvolverState
_evolver_mod = _load_module("_evolver", MA / "evolver.py")
# Load context_bootstrap for ContextEngine snapshot building
_context_bootstrap = _load_module("_cb", MA / "context_bootstrap.py")
# Load memory_manager
_memory_mod = _load_module("_mm", MA / "memory_manager.py")
# Load adaptive_pacer
_pacer_mod = _load_module("_pacer", MA / "adaptive_pacer.py")
# Load telemetry
_telemetry_mod = _load_module("_telem", MA / "telemetry.py")


# ── Intensity configuration ────────────────────────────────────────────────────
# Agents spawned per intensity level
INTENSITY_PARALLELISM = {
    1: 1, 2: 1, 3: 2, 4: 3, 5: 4,
    6: 5, 7: 6, 8: 7, 9: 8, 10: 10,
}

# Base delay seconds between iterations (scaled by pacer)
INTENSITY_BASE_DELAY = {
    1: 120.0, 2: 90.0, 3: 60.0, 4: 45.0, 5: 30.0,
    6: 20.0, 7: 15.0, 8: 10.0, 9: 5.0, 10: 2.0,
}

# QA thoroughness: number of extra checks beyond the minimum
INTENSITY_QA_EXTRA = {
    1: 0, 2: 0, 3: 0, 4: 1, 5: 1,
    6: 2, 7: 2, 8: 3, 9: 3, 10: 5,
}

# Memory compression thresholds (% of MAX_MEMORY_BYTES used)
MEMORY_COMPRESS_MILD = 0.70  # compress older entries
MEMORY_COMPRESS_AGGRESSIVE = 0.85  # compress aggressively + increase frequency
MEMORY_MAX_BYTES = 50 * 1024 * 1024  # 50 MB hard cap

# Self-optimization triggers
OPTIMIZE_QUALITY_DROP = 0.10  # re-optimize if quality drops >10% from EMA
OPTIMIZE_VARIANCE_SPIKE = 0.15  # re-optimize if variance >15%
OPTIMIZE_INTERVAL = 20  # always re-optimize every N iterations
OPTIMIZE_ON_STALL = 5  # re-optimize after N consecutive flat-quality iterations


# ── TypedDict schemas ──────────────────────────────────────────────────────────
class IterationResult(dict):
    """Yielded from run() each iteration."""
    iteration: int
    phase: str
    quality: float
    duration_s: float
    context: dict
    analysis: dict
    success: bool
    error: str | None
    intensity: int


# ── Fallback no-op implementations ────────────────────────────────────────────
class _NoopProjectMap:
    def __init__(self) -> None:
        self._areas: dict[str, dict] = {}

    def get_areas(self) -> dict[str, dict]:
        return self._areas

    def update_area_quality(self, area: str, quality: float) -> None:
        self._areas[area] = {"path": area, "quality": float(quality), "last_changed": time.time()}

    def area_scores(self) -> dict[str, float]:
        return {}


class _NoopContextEngine:
    def get_snapshot(self, force_refresh: bool = False) -> dict:
        return {}

    def get_area_breakdown(self) -> dict[str, float]:
        return {}

    def find_neglected_areas(self, threshold: float = 0.6) -> list[str]:
        return []

    def find_high_potential_areas(self, threshold: float = 0.4) -> list[tuple[str, float]]:
        return []


class _NoopSmartIterator:
    """Fallback when SmartIterator is unavailable."""

    def __init__(self) -> None:
        self._iterations: list[dict] = []

    def plan_iteration(self, state: dict, context: dict, intensity: int) -> dict:
        return {
            "planned_actions": [],
            "focus_area": "general",
            "expected_duration_s": 60.0,
            "reasoning": ["SmartIterator unavailable — using default plan"],
        }

    def score_iteration_outcome(self, result: dict) -> float:
        return result.get("quality", 0.5)

    def update_learning(self, iteration: int, result: dict) -> None:
        self._iterations.append({"iteration": iteration, "result": result})

    def get_learnings(self, limit: int = 10) -> list[dict]:
        return self._iterations[-limit:]


class _NoopMemoryCompressor:
    """Fallback when MemoryCompressor is unavailable."""

    def __init__(self) -> None:
        self._compressions = 0

    def compress_if_needed(self, memory: dict, threshold: float = 0.8) -> tuple[dict, bool]:
        self._compressions += 1
        return memory, False  # did_compress = False

    def compress(self, memory: dict) -> dict:
        self._compressions += 1
        return memory

    def get_stats(self) -> dict:
        return {"compressions": self._compressions, "mode": "noop"}


class _NoopLoopOptimizer:
    """Fallback when LoopOptimizer is unavailable."""

    def __init__(self) -> None:
        self._optimizations: list[dict] = []
        self._last_optimization: float = 0.0

    def record_iteration(self, iteration: int, quality: float, duration_s: float,
                         context: dict) -> None:
        pass

    def should_reoptimize(self, iteration: int, quality_ema: float | None,
                          quality_history: list[float]) -> bool:
        if not quality_history or len(quality_history) < 3:
            return False
        if iteration % OPTIMIZE_INTERVAL == 0:
            return True
        if len(quality_history) >= 3:
            recent = quality_history[-3:]
            if quality_ema and all(abs(q - quality_ema) < 0.01 for q in recent):
                return True
        return False

    def optimize(self, state: dict, learnings: list[dict]) -> dict:
        return {"applied": False, "reason": "noop"}

    def get_last_optimization(self) -> float:
        return self._last_optimization

    def get_stats(self) -> dict:
        return {"optimizations": len(self._optimizations), "last": self._last_optimization}


# ── AutonomousEvolutionMode ──────────────────────────────────────────────────
class AutonomousEvolutionMode:
    """
    Continuous autonomous evolution wrapper.

    Wraps the daemon's iteration cycle with:
    - Pre/post iteration hooks for self-optimization
    - Real-time intensity and parameter adjustment
    - Memory bounding via MemoryCompressor
    - Rich context assembly from ProjectMap + ContextEngine
    - Quality regression detection with automatic re-optimization
    - Generator-based iteration yielding for monitoring

    Parameters
    ----------
    intensity : int
        Initial intensity level 1-10 (default 5).
    daemon_module_path : Path, optional
        Path to the daemon module to wrap. Defaults to akasha-loop-daemon-v4.py.
    """

    # ── State keys stored in autonomous-evolution-state.json ────────────────────
    _STATE_KEYS = [
        "running", "iteration", "intensity", "last_optimization",
        "emergency_reason", "quality_ema", "quality_history",
        "stall_count", "total_duration_s", "last_iteration_at",
    ]

    def __init__(
        self,
        intensity: int = 5,
        daemon_module_path: Path | None = None,
    ) -> None:
        self._daemon_path = daemon_module_path or (MA / "akasha-loop-daemon-v4.py")
        self._daemon_mod: Any = None

        # Thread safety for shared state
        self._lock = Lock()

        # Load or initialise persistent state
        self._state = self._load_state()
        if intensity != self._state.get("intensity", 5):
            self._state["intensity"] = max(1, min(10, intensity))
        self._state["running"] = False
        self._state["emergency_reason"] = None
        self._save_state()

        # Core subsystems (lazy-loaded)
        self._project_map: Any = _NoopProjectMap()
        self._ctx_engine: Any = _NoopContextEngine()
        self._smart_iter: Any = _NoopSmartIterator()
        self._mem_compressor: Any = _NoopMemoryCompressor()
        self._loop_optimizer: Any = _NoopLoopOptimizer()

        # Telemetry
        self._telem_mod: Any = None
        self._telem: Any = None

        # Initialise subsystems
        self._init_subsystems()

        log(f"AutonomousEvolutionMode initialised intensity={self._state['intensity']}")

    # ── Subsystem initialisation ────────────────────────────────────────────────

    def _init_subsystems(self) -> None:
        """Load and wire all subsystems with graceful fallbacks."""
        # ProjectMap
        if _evolver_mod and hasattr(_evolver_mod, "ProjectMap"):
            try:
                self._project_map = _evolver_mod.ProjectMap()
                log("ProjectMap loaded")
            except Exception as e:
                log_warn(f"ProjectMap init failed: {e}")

        # ContextEngine
        if _evolver_mod and hasattr(_evolver_mod, "ContextEngine"):
            try:
                self._ctx_engine = _evolver_mod.ContextEngine()
                log("ContextEngine loaded")
            except Exception as e:
                log_warn(f"ContextEngine init failed: {e}")

        # SmartIterator (may not exist yet — use noop)
        try:
            si_path = MA / "smart_iterator.py"
            if si_path.exists():
                si_mod = _load_module("_si", si_path)
                if si_mod and hasattr(si_mod, "SmartIterator"):
                    self._smart_iter = si_mod.SmartIterator()
                    log("SmartIterator loaded")
        except Exception as e:
            log_warn(f"SmartIterator init failed: {e}; using noop")

        # MemoryCompressor
        try:
            mc_path = MA / "memory_compressor.py"
            if mc_path.exists():
                mc_mod = _load_module("_mc", mc_path)
                if mc_mod and hasattr(mc_mod, "MemoryCompressor"):
                    self._mem_compressor = mc_mod.MemoryCompressor()
                    log("MemoryCompressor loaded")
        except Exception as e:
            log_warn(f"MemoryCompressor init failed: {e}; using noop")

        # LoopOptimizer
        try:
            lo_path = MA / "loop_optimizer.py"
            if lo_path.exists():
                lo_mod = _load_module("_lo", lo_path)
                if lo_mod and hasattr(lo_mod, "LoopOptimizer"):
                    self._loop_optimizer = lo_mod.LoopOptimizer()
                    log("LoopOptimizer loaded")
        except Exception as e:
            log_warn(f"LoopOptimizer init failed: {e}; using noop")

        # Telemetry
        if _telemetry_mod and hasattr(_telemetry_mod, "TelemetryCollector"):
            try:
                self._telem = _telemetry_mod.TelemetryCollector()
                log("TelemetryCollector loaded")
            except Exception as e:
                log_warn(f"TelemetryCollector init failed: {e}")

        # Try to load daemon module for delegating real work
        if self._daemon_path.exists():
            self._daemon_mod = _load_module("_daemon", self._daemon_path)

    # ── Persistent state helpers ────────────────────────────────────────────────

    def _load_state(self) -> dict:
        data = load_json(AUTONOMOUS_STATE_FILE, {})
        state: dict = {k: data.get(k, 0 if k in (
            "iteration", "stall_count", "total_duration_s"
        ) else False if k in (
            "running", "emergency_reason"
        ) else 0.0 if k in (
            "quality_ema", "last_optimization", "last_iteration_at"
        ) else [] if k == "quality_history" else 5 if k == "intensity" else None)
            for k in self._STATE_KEYS}
        # Ensure quality_history is a list
        if not isinstance(state.get("quality_history"), list):
            state["quality_history"] = []
        return state

    def _save_state(self) -> None:
        save_json(AUTONOMOUS_STATE_FILE, self._state)

    def _bump_iteration(self) -> int:
        with self._lock:
            self._state["iteration"] = self._state.get("iteration", 0) + 1
            self._state["last_iteration_at"] = time.time()
            self._save_state()
            return self._state["iteration"]

    # ── Memory helpers ───────────────────────────────────────────────────────────

    def _load_memory(self) -> dict:
        return load_json(MEMORY_FILE, {})

    def _save_memory(self, mem: dict) -> None:
        save_json(MEMORY_FILE, mem)

    def _memory_usage_ratio(self) -> float:
        """Return approximate memory usage as a fraction of MAX_MEMORY_BYTES."""
        try:
            mem = self._load_memory()
            size = len(json.dumps(mem).encode("utf-8"))
            return size / MEMORY_MAX_BYTES
        except Exception:
            return 0.0

    def _memory_status(self) -> dict:
        ratio = self._memory_usage_ratio()
        return {
            "ratio": round(ratio, 4),
            "threshold_mild": MEMORY_COMPRESS_MILD,
            "threshold_aggressive": MEMORY_COMPRESS_AGGRESSIVE,
            "at_mild": ratio >= MEMORY_COMPRESS_MILD,
            "at_aggressive": ratio >= MEMORY_COMPRESS_AGGRESSIVE,
            "estimated_bytes": int(ratio * MEMORY_MAX_BYTES),
            "max_bytes": MEMORY_MAX_BYTES,
        }

    # ── Quality tracking ────────────────────────────────────────────────────────

    def _update_quality(self, quality: float) -> tuple[float, float]:
        """
        Update EMA and history. Returns (ema, variance).
        Variance is rolling std of last 5 quality values.
        """
        with self._lock:
            history = self._state.setdefault("quality_history", [])
            history.append(float(quality))
            if len(history) > 100:
                history[:] = history[-100:]

            # EMA with alpha=0.1
            ema = self._state.get("quality_ema", quality)
            ema = 0.1 * quality + 0.9 * ema
            self._state["quality_ema"] = round(ema, 4)

            # Rolling variance (last 5)
            recent = history[-5:] if len(history) >= 5 else history
            mean = sum(recent) / len(recent) if recent else 0.0
            variance = (sum((q - mean) ** 2 for q in recent) / len(recent)) if len(recent) > 1 else 0.0

            self._save_state()
            return ema, variance

    def _detect_stall(self, quality: float) -> int:
        """Increment stall count when quality hasn't improved. Returns new stall_count."""
        with self._lock:
            history = self._state.setdefault("quality_history", [])
            if len(history) >= 3:
                recent = history[-3:]
                if all(abs(q - quality) < 0.005 for q in recent):
                    self._state["stall_count"] = self._state.get("stall_count", 0) + 1
                else:
                    self._state["stall_count"] = 0
            self._save_state()
            return self._state.get("stall_count", 0)

    # ── Public API ──────────────────────────────────────────────────────────────

    def get_autonomous_status(self) -> dict:
        """
        Return current autonomous mode status.

        Returns
        -------
        dict
            {running, iteration, intensity, last_optimization,
             memory_status, quality_ema, stall_count, emergency_reason,
             quality_variance}
        """
        with self._lock:
            history = self._state.get("quality_history", [])
            recent = history[-5:] if len(history) >= 5 else history
            mean = sum(recent) / len(recent) if recent else 0.0
            variance = (sum((q - mean) ** 2 for q in recent) / len(recent)) if len(recent) > 1 else 0.0

            return {
                "running": bool(self._state.get("running", False)),
                "iteration": int(self._state.get("iteration", 0)),
                "intensity": int(self._state.get("intensity", 5)),
                "last_optimization": float(self._state.get("last_optimization", 0.0)),
                "memory_status": self._memory_status(),
                "quality_ema": float(self._state.get("quality_ema", 0.0)),
                "stall_count": int(self._state.get("stall_count", 0)),
                "emergency_reason": self._state.get("emergency_reason"),
                "quality_variance": round(variance, 6),
                "total_duration_s": round(self._state.get("total_duration_s", 0.0), 2),
            }

    def set_intensity(self, level: int) -> int:
        """
        Adjust loop aggressiveness.

        Levels 1-10:
        1-3  CONSERVATIVE  — sequential, thorough, low resource
        4-6  BALANCED      — moderate parallelism
        7-10 AGGRESSIVE    — high parallelism, fast pacing, thorough QA
        """
        with self._lock:
            actual = max(1, min(10, int(level)))
            prev = self._state.get("intensity", 5)
            self._state["intensity"] = actual
            self._save_state()
            log(f"Intensity changed: {prev} → {actual}")
            return actual

    def get_intensity(self) -> int:
        return int(self._state.get("intensity", 5))

    def should_continue(self) -> bool:
        """
        Determine whether the autonomous loop should continue.

        Returns False if:
        - emergency_stop() was called
        - Paused by pacer
        - All iterations completed (num_iterations reached)
        """
        if self._state.get("emergency_reason"):
            return False
        # Pacer pause check
        if _pacer_mod:
            try:
                pacer = _pacer_mod.get_pacer()
                pace = pacer.get_pace() if hasattr(pacer, "get_pace") else {"state": "NORMAL"}
                if pace.get("state") == "PAUSE":
                    log_warn("Pacer is PAUSED — pausing autonomous loop")
                    return False
            except Exception:
                pass
        return True

    def emergency_stop(self, reason: str) -> None:
        """Gracefully stop the autonomous loop and log the reason."""
        with self._lock:
            self._state["running"] = False
            self._state["emergency_reason"] = str(reason)
            self._save_state()
        log_error(f"EMERGENCY STOP: {reason}")

    # ── Pre-iteration hook ─────────────────────────────────────────────────────

    def pre_iteration_hook(self, state: dict, memory: dict) -> dict:
        """
        Called before each iteration. Builds rich enhanced_context.

        Integrates: ProjectMap, ContextEngine, SmartIterator, MemoryCompressor.

        Parameters
        ----------
        state : dict
            Current daemon state dict.
        memory : dict
            Current memory dict.

        Returns
        -------
        enhanced_context : dict
            Rich context dict with project state, learnings, scores, and recommendations.
        """
        iteration = self._state.get("iteration", 0)
        intensity = self._state.get("intensity", 5)

        ctx: dict[str, Any] = {
            "iteration": iteration,
            "intensity": intensity,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "daemon_state": dict(state),
            "memory_summary": {
                "keys": list(memory.keys()) if isinstance(memory, dict) else [],
                "size_bytes": len(json.dumps(memory).encode("utf-8")) if isinstance(memory, dict) else 0,
            },
            "parallelism": INTENSITY_PARALLELISM.get(intensity, 4),
            "qa_extra": INTENSITY_QA_EXTRA.get(intensity, 1),
            "base_delay_s": INTENSITY_BASE_DELAY.get(intensity, 30.0),
        }

        # ProjectMap area scores
        try:
            area_scores = self._project_map.area_scores() if hasattr(self._project_map, "area_scores") else {}
            ctx["area_scores"] = area_scores
            ctx["neglected_areas"] = [a for a, s in area_scores.items() if s < 0.6]
            ctx["high_potential_areas"] = sorted(
                [(a, s) for a, s in area_scores.items() if s < 0.8],
                key=lambda x: x[1],
            )[:5]
        except Exception as e:
            ctx["area_scores"] = {}
            ctx["neglected_areas"] = []
            ctx["high_potential_areas"] = []
            ctx["_project_map_error"] = str(e)

        # ContextEngine breakdown
        try:
            breakdown = self._ctx_engine.get_area_breakdown() if hasattr(self._ctx_engine, "get_area_breakdown") else {}
            ctx["context_breakdown"] = breakdown
            neglected = self._ctx_engine.find_neglected_areas(0.6) if hasattr(self._ctx_engine, "find_neglected_areas") else []
            ctx["neglected_areas_ce"] = neglected
            high_pot = self._ctx_engine.find_high_potential_areas(0.4) if hasattr(self._ctx_engine, "find_high_potential_areas") else []
            ctx["high_potential_areas_ce"] = high_pot
        except Exception as e:
            ctx["context_breakdown"] = {}
            ctx["_context_engine_error"] = str(e)

        # SmartIterator iteration plan
        try:
            plan = self._smart_iter.plan_iteration(state, ctx, intensity) if hasattr(self._smart_iter, "plan_iteration") else {}
            ctx["smart_plan"] = plan
        except Exception as e:
            ctx["smart_plan"] = {"error": str(e)}

        # Recent learnings from memory
        try:
            if isinstance(memory, dict):
                learnings = memory.get("learnings", [])
                if callable(getattr(self._loop_optimizer, "get_stats", None)):
                    pass  # handled below
            else:
                learnings = []
        except Exception:
            learnings = []
        ctx["recent_learnings_count"] = len(learnings)

        # Loop optimizer stats
        try:
            if hasattr(self._loop_optimizer, "get_stats"):
                ctx["loop_optimizer_stats"] = self._loop_optimizer.get_stats()
        except Exception:
            ctx["loop_optimizer_stats"] = {}

        # Telemetry quality
        if self._telem:
            try:
                ctx["telemetry_quality"] = self._telem.overall_quality()
            except Exception:
                ctx["telemetry_quality"] = None

        return ctx

    # ── Post-iteration hook ────────────────────────────────────────────────────

    def post_iteration_hook(
        self,
        iteration_result: IterationResult,
        state: dict,
        memory: dict,
    ) -> dict:
        """
        Called after each iteration completes.

        Records to LoopOptimizer, compresses memory if needed,
        triggers self-optimization when regressions are detected.

        Parameters
        ----------
        iteration_result : IterationResult
            The iteration result yielded from run().
        state : dict
            Updated daemon state dict.
        memory : dict
            Current memory dict (may be mutated in-place).

        Returns
        -------
        analysis : dict
            Post-iteration analysis including quality, recommendations.
        """
        quality = float(iteration_result.get("quality", 0.5))
        duration_s = float(iteration_result.get("duration_s", 0.0))
        iteration = int(iteration_result.get("iteration", 0))
        context = iteration_result.get("context", {})
        success = bool(iteration_result.get("success", False))
        error = iteration_result.get("error")

        # Update quality tracking
        ema, variance = self._update_quality(quality)
        stall_count = self._detect_stall(quality)

        # Accumulate total duration
        with self._lock:
            self._state["total_duration_s"] = self._state.get("total_duration_s", 0.0) + duration_s
            self._save_state()

        # Record to LoopOptimizer
        try:
            if hasattr(self._loop_optimizer, "record_iteration"):
                self._loop_optimizer.record_iteration({
                    "iteration": iteration,
                    "duration_s": duration_s,
                    "loop_quality": quality,
                    "parallel_agents": context.get("parallelism", 1),
                    "success": success,
                })
        except Exception as e:
            log_warn(f"LoopOptimizer record_iteration failed: {e}")

        # SmartIterator: score and update learning
        try:
            if hasattr(self._smart_iter, "score_iteration_outcome"):
                self._smart_iter.score_iteration_outcome(dict(iteration_result))
            if hasattr(self._smart_iter, "update_learning"):
                self._smart_iter.update_learning(iteration, dict(iteration_result))
        except Exception as e:
            log_warn(f"SmartIterator update failed: {e}")

        # Telemetry record
        if self._telem:
            try:
                self._telem.record("autonomous_iteration", {
                    "quality": quality,
                    "duration_s": duration_s,
                    "success": success,
                    "error": error,
                })
            except Exception:
                pass

        # Record learning in memory
        self._record_learning(iteration, quality, success, error, context, state, memory)

        # Build analysis
        analysis: dict[str, Any] = {
            "iteration": iteration,
            "quality": quality,
            "quality_ema": round(ema, 4),
            "quality_variance": round(variance, 6),
            "stall_count": stall_count,
            "duration_s": round(duration_s, 2),
            "total_duration_s": round(self._state.get("total_duration_s", 0.0), 2),
            "success": success,
            "error": error,
            "improvement_detected": self._detect_improvement(quality),
            "focus_area": context.get("smart_plan", {}).get("focus_area", "unknown"),
            "parallelism_used": context.get("parallelism", INTENSITY_PARALLELISM.get(self.get_intensity(), 4)),
        }

        # Check if self-optimization is warranted
        should_opt = self.check_and_optimize()
        analysis["optimization_triggered"] = should_opt

        # Memory compression if needed
        did_compress = self.compress_memory_if_needed()
        analysis["memory_compressed"] = did_compress
        analysis["memory_status"] = self._memory_status()

        return analysis

    def _detect_improvement(self, quality: float) -> bool:
        history = self._state.get("quality_history", [])
        if len(history) < 2:
            return False
        prev = history[-2] if len(history) >= 2 else history[-1]
        return quality > prev

    def _record_learning(
        self,
        iteration: int,
        quality: float,
        success: bool,
        error: str | None,
        context: dict,
        state: dict,
        memory: dict,
    ) -> None:
        """Append a learning entry to memory."""
        try:
            if not isinstance(memory, dict):
                memory = {}
            if "learnings" not in memory:
                memory["learnings"] = []
            learning = {
                "iteration": iteration,
                "quality": quality,
                "success": success,
                "error": error,
                "focus_area": context.get("smart_plan", {}).get("focus_area", "unknown"),
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            memory["learnings"].append(learning)
            # Keep only last 500 learnings
            if len(memory["learnings"]) > 500:
                memory["learnings"] = memory["learnings"][-500:]
            self._save_memory(memory)
        except Exception as e:
            log_warn(f"_record_learning failed: {e}")

    # ── Self-optimization ───────────────────────────────────────────────────────

    def check_and_optimize(self) -> bool:
        """
        Check whether self-optimization should be triggered.

        Triggers when:
        - Quality drops >OPTIMIZE_QUALITY_DROP from EMA
        - Variance spike >OPTIMIZE_VARIANCE_SPIKE
        - Every OPTIMIZE_INTERVAL iterations
        - Stall detected (quality flat for OPTIMIZE_ON_STALL iterations)

        Returns True if optimization was triggered, False otherwise.
        """
        iteration = self._state.get("iteration", 0)
        history = self._state.get("quality_history", [])
        ema = self._state.get("quality_ema", 0.5)

        if len(history) < 3:
            return False

        # Check EMA regression
        recent = history[-1]
        ema_drop = ema - recent if ema > recent else 0.0

        # Rolling variance (last 5)
        window = history[-5:]
        mean = sum(window) / len(window)
        variance = sum((q - mean) ** 2 for q in window) / len(window)

        should = False
        reason = ""

        if iteration > 0 and iteration % OPTIMIZE_INTERVAL == 0:
            should = True
            reason = f"interval_check (iteration {iteration} % {OPTIMIZE_INTERVAL} == 0)"
        elif ema_drop > OPTIMIZE_QUALITY_DROP:
            should = True
            reason = f"quality_regression (ema={ema:.3f}, recent={recent:.3f}, drop={ema_drop:.3f} > {OPTIMIZE_QUALITY_DROP})"
        elif variance > OPTIMIZE_VARIANCE_SPIKE:
            should = True
            reason = f"variance_spike (variance={variance:.4f} > {OPTIMIZE_VARIANCE_SPIKE})"
        elif self._state.get("stall_count", 0) >= OPTIMIZE_ON_STALL:
            should = True
            reason = f"stall_detected (stall_count={self._state.get('stall_count')} >= {OPTIMIZE_ON_STALL})"

        if not should:
            return False

        # Actually optimize
        log(f"Self-optimization triggered: {reason}")
        try:
            learnings = self._load_memory().get("learnings", [])[-50:]
            result = self._loop_optimizer.optimize(dict(self._state), learnings) if hasattr(
                self._loop_optimizer, "optimize"
            ) else {}
            applied = result.get("applied", False) if isinstance(result, dict) else False
            opt_reason = result.get("reason", reason) if isinstance(result, dict) else reason
        except Exception as e:
            applied = False
            opt_reason = f"fallback: {e}"

        with self._lock:
            self._state["last_optimization"] = time.time()
            self._state["stall_count"] = 0
            self._save_state()

        log(f"Self-optimization complete: applied={applied}, reason={opt_reason}")
        return True

    # ── Memory compression ──────────────────────────────────────────────────────

    def compress_memory_if_needed(self) -> bool:
        """
        Compress memory if usage exceeds thresholds.

        Mild threshold (MEMORY_COMPRESS_MILD): compress older, lower-value entries
        Aggressive threshold (MEMORY_COMPRESS_AGGRESSIVE): compress more aggressively

        Returns True if compression was performed, False otherwise.
        """
        ratio = self._memory_usage_ratio()
        did_compress = False

        if ratio < MEMORY_COMPRESS_MILD:
            return False

        memory = self._load_memory()
        mode = "mild" if ratio < MEMORY_COMPRESS_AGGRESSIVE else "aggressive"

        log(f"Memory compression triggered: ratio={ratio:.3f}, mode={mode}")

        try:
            compressed, was_compressed = self._mem_compressor.compress_if_needed(
                memory, threshold=MEMORY_COMPRESS_MILD
            ) if hasattr(self._mem_compressor, "compress_if_needed") else (
                self._mem_compressor.compress(memory) if hasattr(self._mem_compressor, "compress") else memory
            ), True

            if compressed is not memory and compressed is not None:
                self._save_memory(compressed)
                did_compress = True
                log(f"Memory compressed ({mode}), new size={len(json.dumps(compressed).encode('utf-8'))} bytes")
            elif compressed is not None:
                self._save_memory(compressed)
                did_compress = True
        except Exception as e:
            log_warn(f"Memory compression failed: {e}")
            did_compress = False

        return did_compress

    # ── Generator-based run loop ───────────────────────────────────────────────

    def run(
        self,
        num_iterations: int | None = None,
        intensity: int | None = None,
    ) -> Generator[IterationResult, None, None]:
        """
        Run the autonomous evolution loop.

        This is a generator that yields IterationResult dicts after each
        iteration completes, allowing callers to monitor progress.

        Parameters
        ----------
        num_iterations : int | None
            Maximum iterations to run. None = run until should_continue() returns False.
        intensity : int | None
            Override initial intensity. None = use current or default (5).

        Yields
        ------
        IterationResult
            {iteration, phase, quality, duration_s, context, analysis,
             success, error, intensity}

        Examples
        --------
        >>> aem = AutonomousEvolutionMode(intensity=7)
        >>> for result in aem.run(num_iterations=10):
        ...     print(result["iteration"], result["quality"])
        """
        # Apply intensity override
        if intensity is not None:
            self.set_intensity(intensity)

        with self._lock:
            if self._state.get("emergency_reason"):
                log_error(f"Cannot start: emergency_stop is active: {self._state['emergency_reason']}")
                return
            self._state["running"] = True
            self._save_state()

        log(f"Autonomous loop starting: num_iterations={num_iterations}, intensity={self.get_intensity()}")

        try:
            while True:
                # Check termination conditions
                if not self.should_continue():
                    log("should_continue() = False — stopping")
                    break

                current_iter = self._state.get("iteration", 0)
                if num_iterations is not None and current_iter >= num_iterations:
                    log(f"Reached num_iterations={num_iterations}")
                    break

                # Bump and load state for this iteration
                iteration = self._bump_iteration()
                memory = self._load_memory()

                # Build state snapshot (use daemon's state if available)
                state_snapshot: dict[str, Any] = dict(self._state)
                try:
                    daemon_state = load_json(MA / "state.json", {})
                    if daemon_state:
                        state_snapshot["daemon"] = daemon_state
                except Exception:
                    pass

                # ── Pre-iteration ─────────────────────────────────────────────
                phase = "pre_iteration"
                start_time = time.monotonic()
                context: dict[str, Any] = {}

                try:
                    context = self.pre_iteration_hook(state_snapshot, memory)
                except Exception as e:
                    log_warn(f"pre_iteration_hook failed: {e}")
                    context = {"error": str(e), "iteration": iteration}

                # ── Execute iteration via daemon ──────────────────────────────
                phase = "execution"
                execution_start = time.monotonic()
                iteration_result: IterationResult = {
                    "iteration": iteration,
                    "phase": "execution",
                    "quality": 0.5,
                    "duration_s": 0.0,
                    "context": context,
                    "analysis": {},
                    "success": False,
                    "error": None,
                    "intensity": self.get_intensity(),
                }

                try:
                    result = self._execute_iteration(iteration, state_snapshot, memory, context)
                    if isinstance(result, dict):
                        iteration_result.update(result)
                except Exception as e:
                    iteration_result["error"] = f"execution failed: {e}"
                    iteration_result["analysis"] = {"execution_error": str(e)}
                    log_error(f"Iteration {iteration} execution error: {e}")

                execution_duration = time.monotonic() - execution_start
                iteration_result["duration_s"] = round(execution_duration, 2)

                # ── Post-iteration ────────────────────────────────────────────
                phase = "post_iteration"
                try:
                    analysis = self.post_iteration_hook(iteration_result, state_snapshot, memory)
                    iteration_result["analysis"] = analysis
                except Exception as e:
                    log_warn(f"post_iteration_hook failed: {e}")
                    iteration_result["analysis"] = {"post_hook_error": str(e)}

                # Finalize quality from analysis
                if iteration_result.get("quality") == 0.5 and iteration_result["analysis"]:
                    iteration_result["quality"] = iteration_result["analysis"].get(
                        "quality", iteration_result["analysis"].get("quality_ema", 0.5)
                    )

                total_duration = time.monotonic() - start_time
                iteration_result["total_hook_duration_s"] = round(total_duration - execution_duration, 2)

                # Determine success
                iteration_result["success"] = (
                    iteration_result.get("error") is None
                    and iteration_result.get("quality", 0) > 0
                )

                # Yield the result
                yield IterationResult(iteration_result)

                # ── Pacing delay ───────────────────────────────────────────────
                intensity = self.get_intensity()
                base_delay = INTENSITY_BASE_DELAY.get(intensity, 30.0)
                # Apply pacer multiplier if available
                pacer_mult = 1.0
                if _pacer_mod:
                    try:
                        pacer = _pacer_mod.get_pacer()
                        if hasattr(pacer, "get_pace"):
                            pacer_mult = pacer.get_pace().get("multiplier", 1.0)
                    except Exception:
                        pass
                delay = base_delay * pacer_mult
                # At intensity 10, no artificial delay
                if intensity >= 10:
                    delay = 0.0

                if delay > 0 and self.should_continue():
                    time.sleep(delay)

        except GeneratorExit:
            log("Generator exited by caller")
        except Exception as e:
            log_error(f"Unexpected error in run loop: {e}\n{traceback.format_exc()}")
        finally:
            with self._lock:
                self._state["running"] = False
                self._save_state()
            log("Autonomous loop stopped")

    def _execute_iteration(
        self,
        iteration: int,
        state: dict,
        memory: dict,
        context: dict,
    ) -> dict:
        """
        Execute a single iteration, delegating to the daemon module.

        Returns a partial IterationResult dict with quality, success, error.
        """
        if self._daemon_mod is None:
            # No daemon — simulate a minimal iteration
            return self._simulate_iteration(iteration, state, memory, context)

        # Try to call the daemon's handle or main loop once
        try:
            if hasattr(self._daemon_mod, "handle"):
                # Daemon uses socket — not directly callable, simulate
                return self._simulate_iteration(iteration, state, memory, context)
            elif hasattr(self._daemon_mod, "run_one_iteration"):
                return self._daemon_mod.run_one_iteration(
                    iteration=iteration,
                    state=state,
                    memory=memory,
                    context=context,
                )
            else:
                return self._simulate_iteration(iteration, state, memory, context)
        except Exception as e:
            return {
                "quality": 0.5,
                "success": False,
                "error": f"daemon delegation failed: {e}",
                "phase": "execution",
            }

    def _simulate_iteration(
        self,
        iteration: int,
        state: dict,
        memory: dict,
        context: dict,
    ) -> dict:
        """
        Simulate an iteration when no daemon is available.

        Uses SmartIterator to produce a result for testing/demo purposes.
        """
        try:
            smart_plan = context.get("smart_plan", {})
            if not smart_plan:
                plan = self._smart_iter.plan_iteration(state, context, self.get_intensity())
                smart_plan = plan if isinstance(plan, dict) else {}

            focus_area = smart_plan.get("focus_area", "general")
            planned_actions = smart_plan.get("planned_actions", [])

            # Score outcome
            quality = self._smart_iter.score_iteration_outcome(
                {"iteration": iteration, "focus_area": focus_area, "planned_actions": planned_actions}
            ) if hasattr(self._smart_iter, "score_iteration_outcome") else 0.5

            # Blend with EMA for continuity
            ema = self._state.get("quality_ema", quality)
            quality = round(0.7 * quality + 0.3 * ema, 4)

            return {
                "iteration": iteration,
                "phase": "simulation",
                "quality": quality,
                "duration_s": 5.0,
                "success": True,
                "error": None,
                "focus_area": focus_area,
                "actions_count": len(planned_actions),
            }
        except Exception as e:
            return {
                "quality": 0.5,
                "success": False,
                "error": f"simulation failed: {e}",
                "phase": "simulation",
            }


# ── Module-level convenience API ─────────────────────────────────────────────
_default_aem: Optional[AutonomousEvolutionMode] = None


def get_autonomous_mode(intensity: int = 5) -> AutonomousEvolutionMode:
    """Return or create the module-level AutonomousEvolutionMode singleton."""
    global _default_aem
    if _default_aem is None:
        _default_aem = AutonomousEvolutionMode(intensity=intensity)
    return _default_aem


def run_autonomous(
    num_iterations: int | None = None,
    intensity: int = 5,
) -> Generator[IterationResult, None, None]:
    """
    Convenience generator: get (or create) the global AutonomousEvolutionMode
    and run it.

    Parameters
    ----------
    num_iterations : int | None
        Maximum iterations, or None for unlimited.
    intensity : int
        Initial intensity (default 5).

    Yields
    ------
    IterationResult
    """
    aem = get_autonomous_mode(intensity=intensity)
    yield from aem.run(num_iterations=num_iterations)


# ── CLI ──────────────────────────────────────────────────────────────────────
def _cli() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="AutonomousEvolutionMode CLI")
    sub = parser.add_subparsers(dest="cmd")

    run_parser = sub.add_parser("run", help="Run the autonomous loop")
    run_parser.add_argument("--iterations", "-n", type=int, default=None)
    run_parser.add_argument("--intensity", "-i", type=int, default=5)

    status_parser = sub.add_parser("status", help="Show autonomous mode status")

    stop_parser = sub.add_parser("stop", help="Emergency stop")
    stop_parser.add_argument("reason", nargs="?", default="CLI emergency stop")

    args = parser.parse_args()

    if args.cmd == "run":
        aem = get_autonomous_mode(intensity=args.intensity)
        for result in aem.run(num_iterations=args.iterations):
            print(
                f"[iter {result['iteration']}] "
                f"quality={result.get('quality', 0):.3f} "
                f"success={result.get('success')} "
                f"intensity={result.get('intensity')}"
            )
    elif args.cmd == "status":
        aem = get_autonomous_mode()
        s = aem.get_autonomous_status()
        print(json.dumps(s, indent=2, default=str))
    elif args.cmd == "stop":
        aem = get_autonomous_mode()
        aem.emergency_stop(args.reason)
        print(f"Emergency stop issued: {args.reason}")
    else:
        parser.print_help()


if __name__ == "__main__":
    _cli()
