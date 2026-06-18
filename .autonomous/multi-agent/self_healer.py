"""
SelfHealerV2 — automatic error recovery with circuit breaker patterns.

Circuit Breaker States:
  CLOSED  → normal operation; failures tracked
  OPEN    → >50% failure rate over 10 calls; fallback used immediately
  HALF_OPEN → 60s cooldown elapsed; allow one trial call

Error Categories:
  TRANSIENT  → retry immediately up to 3 times
  PERSISTENT → skip phase, log error, continue loop
  FATAL      → log critical, halt loop, set running=False

Graceful Degradation:
  Per-subsystem fallback strategies ensure the daemon never crashes.
  Degraded subsystems are tracked in state.json.

Subsystems monitored:
  AdaptivePacer, MemoryManager, ContextEngine, SkillDiscoverer,
  ReasoningChain, AgentOrchestrator, PromptEngine, Telemetry,
  PredictiveEngine, Guardian

Healing Strategies (per subsystem):
  AdaptivePacer  → reset to NORMAL state, reduce intensity
  MemoryManager  → clear warm/cold cache, restart fresh
  ContextEngine  → fall back to simple string context
  SkillDiscoverer → disable pattern warnings, log only
  ReasoningChain → disable reasoning enhancement, continue without
  AgentOrchestrator → restart orchestrator, re-register agents
  PromptEngine   → reset template cache, use defaults
  Telemetry      → reset metrics buffers, continue without
  PredictiveEngine → disable predictions, use static fallback
  Guardian       → restart guardian, reload state
"""

from __future__ import annotations

import json
import os
import subprocess
import threading
import time
from datetime import datetime
from enum import Enum, auto
from pathlib import Path
from typing import Any, Callable, Optional

# --------------------------------------------------------------------------- #
# Constants
# --------------------------------------------------------------------------- #

ROOT: Path = Path("/home/skynet/cabala-dos-caminhos")
MA: Path = ROOT / ".autonomous" / "multi-agent"

STATE_FILE: Path = MA / "state.json"
CB_FILE: Path = MA / "circuit-breaker-v2.json"
DEGRADED_FILE: Path = MA / "degraded-subsystems.json"
HEAL_LOG: Path = MA / "self-healer-v2.log"

# Circuit breaker thresholds
CB_WINDOW_CALLS: int = 10       # rolling window size
CB_FAILURE_RATE: float = 0.50   # >50% failures triggers OPEN
CB_COOLDOWN_S: float = 60.0     # seconds before HALF_OPEN transition
CB_HALF_OPEN_MAX: int = 1      # allow 1 trial call in HALF_OPEN

# Retry defaults
DEFAULT_MAX_ATTEMPTS: int = 3
DEFAULT_BASE_DELAY: float = 2.0

# Self-heal trigger interval
HEAL_INTERVAL_S: float = 60.0

# Subsystem list
SUBSYSTEMS: list[str] = [
    "AdaptivePacer",
    "MemoryManager",
    "ContextEngine",
    "SkillDiscoverer",
    "ReasoningChain",
    "AgentOrchestrator",
    "PromptEngine",
    "Telemetry",
    "PredictiveEngine",
    "Guardian",
]

# --------------------------------------------------------------------------- #
# Error category enum
# --------------------------------------------------------------------------- #

class ErrorCategory(Enum):
    TRANSIENT = auto()   # retry immediately, up to 3 times
    PERSISTENT = auto() # skip phase, log error, continue loop
    FATAL = auto()       # halt loop, set running=False


# --------------------------------------------------------------------------- #
# Circuit breaker state enum
# --------------------------------------------------------------------------- #

class CircuitState(Enum):
    CLOSED = auto()    # normal operation
    OPEN = auto()      # fallback active, no calls permitted
    HALF_OPEN = auto() # cooldown elapsed, one trial call allowed


# --------------------------------------------------------------------------- #
# JSON helpers
# --------------------------------------------------------------------------- #

def _load_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def _save_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.replace(path)


# --------------------------------------------------------------------------- #
# Logging
# --------------------------------------------------------------------------- #

def log(msg: str) -> None:
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] SELF-HEALER-V2: {msg}"
    print(line, flush=True)
    try:
        HEAL_LOG.parent.mkdir(parents=True, exist_ok=True)
        HEAL_LOG.append_text(line + "\n")
    except Exception:
        pass


def log_heal(subsystem: str, action: str, before: Any, after: Any) -> None:
    log(f"HEAL [{subsystem}] {action}  before={before!r}  after={after!r}")


# --------------------------------------------------------------------------- #
# CircuitBreaker — per-subsystem failure tracker
# --------------------------------------------------------------------------- #

class CircuitBreaker:
    """
    Tracks the failure rate for one subsystem within a rolling window.

    State machine:
      CLOSED  → failure rate in window > CB_FAILURE_RATE → OPEN
      OPEN    → CB_COOLDOWN_S elapsed                    → HALF_OPEN
      HALF_OPEN → 1 trial call succeeds                  → CLOSED
      HALF_OPEN → 1 trial call fails                     → OPEN (cooldown restarts)
    """

    __slots__ = ("subsystem", "_state", "_calls", "_failures",
                 "_last_failure_ts", "_opened_at", "_lock")

    def __init__(self, subsystem: str) -> None:
        self.subsystem: str = subsystem
        self._state: CircuitState = CircuitState.CLOSED
        self._calls: list[float] = []        # timestamps of calls
        self._failures: list[float] = []     # timestamps of failures
        self._last_failure_ts: float = 0.0
        self._opened_at: float = 0.0
        self._lock = threading.RLock()

    # ------------------------------------------------------------------ #
    # Public API
    # ------------------------------------------------------------------ #

    def state(self) -> CircuitState:
        with self._lock:
            self._check_transitions_unlocked()
            return self._state

    def record_call(self, success: bool) -> bool:
        """
        Record a call outcome.

        Returns True if the call is allowed to proceed,
        False if the circuit is OPEN (fallback must be used).
        """
        with self._lock:
            self._check_transitions_unlocked()

            if self._state == CircuitState.OPEN:
                return False

            now = time.time()
            self._calls.append(now)
            self._prune_unlocked(now)

            if success:
                self._handle_success_unlocked(now)
            else:
                self._handle_failure_unlocked(now)

            return True

    def is_open(self) -> bool:
        return self.state() == CircuitState.OPEN

    def failure_rate(self) -> float:
        with self._lock:
            self._prune_unlocked(time.time())
            if not self._calls:
                return 0.0
            return len(self._failures) / len(self._calls)

    def reset(self) -> None:
        with self._lock:
            self._calls.clear()
            self._failures.clear()
            self._state = CircuitState.CLOSED
            self._opened_at = 0.0

    def snapshot(self) -> dict[str, Any]:
        with self._lock:
            return {
                "subsystem": self.subsystem,
                "state": self._state.name,
                "calls": len(self._calls),
                "failures": len(self._failures),
                "failure_rate": round(self.failure_rate(), 3),
                "opened_at": self._opened_at,
            }

    # ------------------------------------------------------------------ #
    # Internal — no lock held on entry (callers must hold _lock)
    # ------------------------------------------------------------------ #

    def _check_transitions_unlocked(self) -> None:
        if self._state == CircuitState.OPEN:
            if time.time() - self._opened_at >= CB_COOLDOWN_S:
                self._state = CircuitState.HALF_OPEN
                log(f"Circuit [{self.subsystem}] HALF_OPEN (cooldown elapsed)")

    def _handle_success_unlocked(self, now: float) -> None:
        if self._state == CircuitState.HALF_OPEN:
            self._state = CircuitState.CLOSED
            self._calls.clear()
            self._failures.clear()
            log(f"Circuit [{self.subsystem}] CLOSED (trial success)")

    def _handle_failure_unlocked(self, now: float) -> None:
        self._failures.append(now)
        self._last_failure_ts = now
        self._prune_unlocked(now)

        if self._state == CircuitState.HALF_OPEN:
            self._opened_at = now
            self._state = CircuitState.OPEN
            log(f"Circuit [{self.subsystem}] OPEN (half_open trial failed)")
        elif len(self._failures) / max(len(self._calls), 1) > CB_FAILURE_RATE:
            if self._state != CircuitState.OPEN:
                self._opened_at = now
                self._state = CircuitState.OPEN
                log(f"Circuit [{self.subsystem}] OPEN (>{CB_FAILURE_RATE*100:.0f}% failure rate)")

    def _prune_unlocked(self, now: float) -> None:
        window = CB_WINDOW_CALLS
        self._calls = self._calls[-window:]
        self._failures = [f for f in self._failures if f in self._calls[-window:]]


# --------------------------------------------------------------------------- #
# Fallback implementations — no-op or minimal safe versions
# --------------------------------------------------------------------------- #

def _fallback_context() -> str:
    """Safe fallback for ContextEngine — returns empty string."""
    return ""


def _fallback_pacer() -> dict[str, Any]:
    """Safe fallback for AdaptivePacer — returns a minimal NORMAL state."""
    return {"state": "NORMAL", "intensity": 3, "phase": "IDLE"}


def _fallback_memory() -> dict[str, Any]:
    """Safe fallback for MemoryManager — returns empty warm/cold stores."""
    return {"warm": {}, "cold": {}, "compressed": {}}


def _fallback_reasoning() -> dict[str, Any]:
    """Safe fallback for ReasoningChain — returns empty reasoning."""
    return {"chain": [], "enabled": False, "confidence": 0.0}


def _fallback_skill() -> dict[str, Any]:
    """Safe fallback for SkillDiscoverer — returns empty patterns."""
    return {"patterns": [], "warnings_enabled": False}


def _fallback_orchestrator() -> dict[str, Any]:
    """Safe fallback for AgentOrchestrator — returns empty agent list."""
    return {"agents": [], "running": False}


def _fallback_prompt() -> dict[str, Any]:
    """Safe fallback for PromptEngine — returns default template."""
    return {"templates": {}, "default": "Working...", "cache_size": 0}


def _fallback_telemetry() -> dict[str, Any]:
    """Safe fallback for Telemetry — returns zeroed metrics."""
    return {"metrics": {}, "buffer": []}


def _fallback_predictive() -> dict[str, Any]:
    """Safe fallback for PredictiveEngine — returns empty forecasts."""
    return {"forecasts": [], "enabled": False}


def _fallback_guardian() -> dict[str, Any]:
    """Safe fallback for Guardian — returns DEGRADED state."""
    return {"state": "DEGRADED", "health_score": 0.0}


FALLBACKS: dict[str, Callable[[], Any]] = {
    "ContextEngine": _fallback_context,
    "AdaptivePacer": _fallback_pacer,
    "MemoryManager": _fallback_memory,
    "ReasoningChain": _fallback_reasoning,
    "SkillDiscoverer": _fallback_skill,
    "AgentOrchestrator": _fallback_orchestrator,
    "PromptEngine": _fallback_prompt,
    "Telemetry": _fallback_telemetry,
    "PredictiveEngine": _fallback_predictive,
    "Guardian": _fallback_guardian,
}


# --------------------------------------------------------------------------- #
# SelfHealerV2
# --------------------------------------------------------------------------- #

class SelfHealerV2:
    """
    Automatic error recovery system with circuit breaker patterns,
    graceful degradation, retry with exponential backoff, and
    self-healing triggers.

    Parameters
    ----------
    MA : Path
        Path to the .autonomous/multi-agent directory.
    """

    def __init__(self, MA: Path = MA) -> None:
        self.MA: Path = Path(MA)
        self._lock = threading.RLock()
        self._breakers: dict[str, CircuitBreaker] = {
            s: CircuitBreaker(s) for s in SUBSYSTEMS
        }
        self._degraded: set[str] = set()
        self._last_heal_ts: float = 0.0
        self._load_degraded()
        log("SelfHealerV2 initialised")

    # ------------------------------------------------------------------ #
    # Circuit breaker API
    # ------------------------------------------------------------------ #

    def get_circuit_state(self, subsystem: str) -> str:
        """Return the circuit state for a subsystem as a string."""
        if subsystem not in self._breakers:
            return "UNKNOWN"
        return self._breakers[subsystem].state().name

    def record_success(self, subsystem: str) -> None:
        """Record a successful call for a subsystem."""
        with self._lock:
            if subsystem in self._breakers:
                self._breakers[subsystem].record_call(success=True)
                if subsystem in self._degraded and self.get_circuit_state(subsystem) == "CLOSED":
                    self._degraded.discard(subsystem)
                    self._save_degraded()
                    log(f"Subsystem [{subsystem}] recovered to healthy")

    def record_failure(self, subsystem: str, error: Exception) -> None:
        """Record a failed call for a subsystem and log the exception."""
        with self._lock:
            if subsystem in self._breakers:
                self._breakers[subsystem].record_call(success=False)
                if self.get_circuit_state(subsystem) == "OPEN":
                    self._mark_degraded(subsystem)
            log(f"FAILURE [{subsystem}] {type(error).__name__}: {error}")

    # ------------------------------------------------------------------ #
    # Health check
    # ------------------------------------------------------------------ #

    def check_health(self) -> dict[str, Any]:
        """
        Run a lightweight health check across all subsystems.

        Returns
        -------
        dict with keys:
          healthy   : bool  — True if no subsystems are degraded or OPEN
          issues    : list  — list of str issue descriptions
          degraded  : list  — list of currently degraded subsystem names
          circuits  : dict  — per-subsystem circuit state snapshot
        """
        issues: list[str] = []
        degraded: list[str] = []
        circuits: dict[str, dict[str, Any]] = {}

        with self._lock:
            for subsystem in SUBSYSTEMS:
                br = self._breakers[subsystem]
                snap = br.snapshot()
                circuits[subsystem] = snap
                state = snap["state"]

                if state == "OPEN":
                    degraded.append(subsystem)
                    issues.append(f"Circuit OPEN for [{subsystem}]")

                rate = snap["failure_rate"]
                if rate > CB_FAILURE_RATE:
                    issues.append(
                        f"High failure rate [{subsystem}]: {rate:.0%} "
                        f"({snap['failures']}/{snap['calls']} calls)"
                    )

        healthy = len(issues) == 0
        return {
            "healthy": healthy,
            "issues": issues,
            "degraded": degraded,
            "circuits": circuits,
        }

    # ------------------------------------------------------------------ #
    # Issue detection
    # ------------------------------------------------------------------ #

    def detect_issue(self) -> dict[str, Any] | None:
        """
        Scan system state and circuit breakers to detect active issues.

        Returns None when no issue is found; otherwise a dict with keys:
          type       : str  — issue category name
          subsystem  : str  — affected subsystem (or "system")
          detail     : str  — human-readable description
          category    : ErrorCategory
        """
        health = self.check_health()

        if health["healthy"]:
            return None

        for subsystem in health["degraded"]:
            state = self.get_circuit_state(subsystem)
            return {
                "type": "CIRCUIT_OPEN",
                "subsystem": subsystem,
                "detail": f"Circuit breaker OPEN for [{subsystem}] — using fallback",
                "category": ErrorCategory.PERSISTENT,
            }

        for issue in health["issues"]:
            return {
                "type": "HIGH_FAILURE_RATE",
                "subsystem": "system",
                "detail": issue,
                "category": ErrorCategory.PERSISTENT,
            }

        return None

    # ------------------------------------------------------------------ #
    # Recovery strategy selection
    # ------------------------------------------------------------------ #

    def suggest_recovery(self, issue: dict[str, Any] | None) -> str:
        """
        Given a detected issue, return the name of the recommended
        recovery strategy (a method name on SelfHealerV2).
        """
        if issue is None:
            return "no-op"

        subsystem = issue.get("subsystem", "")
        issue_type = issue.get("type", "")

        strategy_map: dict[str, dict[str, str]] = {
            "AdaptivePacer": {
                "CIRCUIT_OPEN": "_heal_adaptive_pacer",
                "HIGH_FAILURE_RATE": "_heal_adaptive_pacer",
            },
            "MemoryManager": {
                "CIRCUIT_OPEN": "_heal_memory_manager",
                "HIGH_FAILURE_RATE": "_heal_memory_manager",
            },
            "ContextEngine": {
                "CIRCUIT_OPEN": "_heal_context_engine",
                "HIGH_FAILURE_RATE": "_heal_context_engine",
            },
            "SkillDiscoverer": {
                "CIRCUIT_OPEN": "_heal_skill_discoverer",
                "HIGH_FAILURE_RATE": "_heal_skill_discoverer",
            },
            "ReasoningChain": {
                "CIRCUIT_OPEN": "_heal_reasoning_chain",
                "HIGH_FAILURE_RATE": "_heal_reasoning_chain",
            },
            "AgentOrchestrator": {
                "CIRCUIT_OPEN": "_heal_agent_orchestrator",
                "HIGH_FAILURE_RATE": "_heal_agent_orchestrator",
            },
            "PromptEngine": {
                "CIRCUIT_OPEN": "_heal_prompt_engine",
                "HIGH_FAILURE_RATE": "_heal_prompt_engine",
            },
            "Telemetry": {
                "CIRCUIT_OPEN": "_heal_telemetry",
                "HIGH_FAILURE_RATE": "_heal_telemetry",
            },
            "PredictiveEngine": {
                "CIRCUIT_OPEN": "_heal_predictive_engine",
                "HIGH_FAILURE_RATE": "_heal_predictive_engine",
            },
            "Guardian": {
                "CIRCUIT_OPEN": "_heal_guardian",
                "HIGH_FAILURE_RATE": "_heal_guardian",
            },
        }

        if subsystem in strategy_map and issue_type in strategy_map[subsystem]:
            return strategy_map[subsystem][issue_type]

        if subsystem == "system":
            return "_heal_system_wide"

        return "no-op"

    # ------------------------------------------------------------------ #
    # Recovery execution
    # ------------------------------------------------------------------ #

    def recover(self, strategy: str) -> bool:
        """
        Execute the named recovery strategy.

        Each strategy is retried up to 3 times with exponential backoff.
        Returns True if the recovery succeeded, False otherwise.
        """
        if strategy == "no-op":
            return True

        method_name = f"_heal_{strategy}" if not strategy.startswith("_heal_") else strategy

        with self._lock:
            if not hasattr(self, method_name):
                log(f"Unknown recovery strategy: {strategy}")
                return False

            method = getattr(self, method_name)

        try:
            result = self._retry(method, max_attempts=3, base_delay=2.0)
            return bool(result)
        except Exception as e:
            log(f"Recovery [{strategy}] failed: {e}")
            return False

    # ------------------------------------------------------------------ #
    # Subsystem-specific healing strategies
    # ------------------------------------------------------------------ #

    def _heal_adaptive_pacer(self) -> bool:
        """
        Heal AdaptivePacer: reset circuit, reduce intensity, clear state file.
        """
        br = self._breakers["AdaptivePacer"]
        before = {"state": br.state().name, "rate": br.failure_rate()}
        br.reset()

        state = _load_json(STATE_FILE)
        old_intensity = state.get("intensity", 5)
        new_intensity = max(1, old_intensity - 1)
        state["intensity"] = new_intensity
        _save_json(STATE_FILE, state)

        after = {"state": "CLOSED", "rate": 0.0, "intensity": new_intensity}
        log_heal("AdaptivePacer", "reset + intensity reduction", before, after)
        return True

    def _heal_memory_manager(self) -> bool:
        """
        Heal MemoryManager: clear warm/cold cache files, reset circuit.
        """
        br = self._breakers["MemoryManager"]
        before = {"state": br.state().name}
        br.reset()

        warm_cache = self.MA / "memory-warm.json"
        cold_cache = self.MA / "memory-cold"
        state_cache = self.MA / "memory.json"

        for path in [warm_cache, state_cache]:
            try:
                if path.exists():
                    path.unlink()
                    log(f"Cleared cache file: {path.name}")
            except Exception as e:
                log(f"Could not clear {path}: {e}")

        try:
            if cold_cache.exists() and cold_cache.is_dir():
                for child in cold_cache.iterdir():
                    try:
                        child.unlink()
                    except Exception:
                        pass
                log("Cleared memory-cold/ directory")
        except Exception as e:
            log(f"Could not clear memory-cold/: {e}")

        log_heal("MemoryManager", "cache cleared, circuit reset", before, {"state": "CLOSED"})
        return True

    def _heal_context_engine(self) -> bool:
        """
        Heal ContextEngine: reset circuit, clear snapshot files, use fallback.
        """
        br = self._breakers["ContextEngine"]
        before = {"state": br.state().name}
        br.reset()

        snapshots = [
            self.MA / "context_snapshot.json",
            self.MA / "prev_context_snapshot.json",
            self.MA / "context_bootstrap.py",
        ]

        for path in snapshots:
            try:
                if path.exists():
                    path.unlink()
                    log(f"Cleared context file: {path.name}")
            except Exception as e:
                log(f"Could not clear {path}: {e}")

        log_heal("ContextEngine", "snapshot cleared, circuit reset", before, {"state": "CLOSED"})
        return True

    def _heal_skill_discoverer(self) -> bool:
        """
        Heal SkillDiscoverer: reset circuit, disable pattern warnings.
        """
        br = self._breakers["SkillDiscoverer"]
        before = {"state": br.state().name}
        br.reset()

        skills_file = self.MA / "skills.json"
        patterns_file = self.MA / "skill_patterns_v2" / "patterns.json"

        try:
            if skills_file.exists():
                data = _load_json(skills_file)
                if isinstance(data, dict):
                    data.setdefault("flags", {})["warnings_enabled"] = False
                    _save_json(skills_file, data)
                    log("Disabled pattern warnings in skills.json")
                else:
                    log(f"skills.json is a {type(data).__name__}, skipping dict update")
        except Exception as e:
            log(f"Could not update skills.json: {e}")

        try:
            if patterns_file.exists():
                data = _load_json(patterns_file)
                data.setdefault("meta", {})["warnings_enabled"] = False
                _save_json(patterns_file, data)
                log("Disabled pattern warnings in patterns.json")
        except Exception as e:
            log(f"Could not update patterns.json: {e}")

        log_heal("SkillDiscoverer", "warnings disabled, circuit reset", before, {"state": "CLOSED"})
        return True

    def _heal_reasoning_chain(self) -> bool:
        """
        Heal ReasoningChain: reset circuit, clear reasoning cache, disable enhancement.
        """
        br = self._breakers["ReasoningChain"]
        before = {"state": br.state().name}
        br.reset()

        rc_history = self.MA / "reasoning_cache"
        try:
            if rc_history.exists() and rc_history.is_dir():
                for child in rc_history.iterdir():
                    if child.suffix == ".jsonl":
                        try:
                            child.unlink()
                        except Exception:
                            pass
                log("Cleared reasoning_cache/ .jsonl files")
        except Exception as e:
            log(f"Could not clear reasoning cache: {e}")

        state = _load_json(STATE_FILE)
        state["reasoning_enabled"] = False
        _save_json(STATE_FILE, state)

        log_heal("ReasoningChain", "cache cleared, reasoning disabled", before, {"state": "CLOSED"})
        return True

    def _heal_agent_orchestrator(self) -> bool:
        """
        Heal AgentOrchestrator: reset circuit, mark orchestrator for restart.
        """
        br = self._breakers["AgentOrchestrator"]
        before = {"state": br.state().name}
        br.reset()

        state = _load_json(STATE_FILE)
        state["orchestrator_restart"] = True
        _save_json(STATE_FILE, state)

        log_heal("AgentOrchestrator", "orchestrator restart flag set", before, {"state": "CLOSED"})
        return True

    def _heal_prompt_engine(self) -> bool:
        """
        Heal PromptEngine: reset circuit, clear prompt cache outcomes.
        """
        br = self._breakers["PromptEngine"]
        before = {"state": br.state().name}
        br.reset()

        outcomes = self.MA / "prompt_engine_v2_outcomes.json"
        try:
            if outcomes.exists():
                outcomes.unlink()
                log("Cleared prompt_engine_v2_outcomes.json")
        except Exception as e:
            log(f"Could not clear outcomes file: {e}")

        log_heal("PromptEngine", "outcomes cleared, circuit reset", before, {"state": "CLOSED"})
        return True

    def _heal_telemetry(self) -> bool:
        """
        Heal Telemetry: reset circuit, clear metrics buffer.
        """
        br = self._breakers["Telemetry"]
        before = {"state": br.state().name}
        br.reset()

        metrics_file = self.MA / "metrics.json"
        try:
            if metrics_file.exists():
                data = _load_json(metrics_file)
                if isinstance(data, dict) and "buffer" in data:
                    data["buffer"] = []
                    _save_json(metrics_file, data)
                    log("Cleared metrics buffer")
        except Exception as e:
            log(f"Could not clear metrics buffer: {e}")

        log_heal("Telemetry", "metrics buffer cleared, circuit reset", before, {"state": "CLOSED"})
        return True

    def _heal_predictive_engine(self) -> bool:
        """
        Heal PredictiveEngine: reset circuit, disable predictions.
        """
        br = self._breakers["PredictiveEngine"]
        before = {"state": br.state().name}
        br.reset()

        state = _load_json(STATE_FILE)
        state["predictions_enabled"] = False
        _save_json(STATE_FILE, state)

        log_heal("PredictiveEngine", "predictions disabled, circuit reset", before, {"state": "CLOSED"})
        return True

    def _heal_guardian(self) -> bool:
        """
        Heal Guardian: reset circuit, request guardian state reload.
        """
        br = self._breakers["Guardian"]
        before = {"state": br.state().name}
        br.reset()

        gstate = MA / "guardian-state.json"
        try:
            if gstate.exists():
                data = _load_json(gstate)
                data["_reload_requested"] = time.time()
                _save_json(gstate, data)
                log("Guardian reload requested")
        except Exception as e:
            log(f"Could not request guardian reload: {e}")

        log_heal("Guardian", "reload requested, circuit reset", before, {"state": "CLOSED"})
        return True

    def _heal_system_wide(self) -> bool:
        """
        System-wide healing: reset all circuits, clear degraded list.
        """
        before = {s: self._breakers[s].state().name for s in SUBSYSTEMS}

        for subsystem in SUBSYSTEMS:
            self._breakers[subsystem].reset()

        self._degraded.clear()
        self._save_degraded()

        log_heal("system", "all circuits reset, degraded list cleared", before, {"all": "CLOSED"})
        return True

    # ------------------------------------------------------------------ #
    # Retry with exponential backoff
    # ------------------------------------------------------------------ #

    def _retry(
        self,
        fn: Callable[..., Any],
        *args: Any,
        max_attempts: int = DEFAULT_MAX_ATTEMPTS,
        base_delay: float = DEFAULT_BASE_DELAY,
        **kwargs: Any,
    ) -> Any:
        """
        Retry *fn(*args, **kwargs) up to *max_attempts* times.

        On exception: wait base_delay * 2^(attempt-1) seconds, then retry.
        Logs each retry attempt.
        Raises the last exception if all attempts fail.
        """
        last_exc: Exception | None = None
        for attempt in range(1, max_attempts + 1):
            try:
                return fn(*args, **kwargs)
            except Exception as exc:  # noqa: BLE001
                last_exc = exc
                if attempt == max_attempts:
                    break
                delay = base_delay * (2 ** (attempt - 1))
                log(f"Retry [{fn.__name__}] attempt {attempt}/{max_attempts} "
                    f"failed ({type(exc).__name__}), "
                    f"waiting {delay:.1f}s before retry...")
                time.sleep(delay)

        if last_exc is not None:
            raise last_exc
        return None

    # ------------------------------------------------------------------ #
    # Self-healing trigger
    # ------------------------------------------------------------------ #

    def should_heal(self) -> bool:
        """Return True if a self-heal check should run (every HEAL_INTERVAL_S)."""
        return time.time() - self._last_heal_ts >= HEAL_INTERVAL_S

    def trigger_self_heal(self) -> dict[str, Any]:
        """
        Run the self-healing check and apply recovery if needed.

        This method is non-blocking by design — it runs quickly and
        returns a summary dict.

        Returns
        -------
        dict with keys:
          performed : bool       — whether a recovery was attempted
          issue     : dict|None  — the issue that was detected
          strategy  : str        — recovery strategy applied
          success   : bool      — whether recovery succeeded
          elapsed_s : float     — time taken for the heal operation
        """
        start = time.time()
        self._last_heal_ts = start

        issue = self.detect_issue()
        if issue is None:
            return {
                "performed": False,
                "issue": None,
                "strategy": "no-op",
                "success": True,
                "elapsed_s": time.time() - start,
            }

        strategy = self.suggest_recovery(issue)
        log(f"Self-heal triggered: {issue['type']} on [{issue.get('subsystem')}] "
            f"→ strategy={strategy}")

        success = self.recover(strategy)
        return {
            "performed": True,
            "issue": issue,
            "strategy": strategy,
            "success": success,
            "elapsed_s": round(time.time() - start, 3),
        }

    # ------------------------------------------------------------------ #
    # Degraded subsystem management
    # ------------------------------------------------------------------ #

    def _mark_degraded(self, subsystem: str) -> None:
        """Mark a subsystem as degraded and persist to disk."""
        self._degraded.add(subsystem)
        self._save_degraded()

    def get_degraded(self) -> list[str]:
        """Return the list of currently degraded subsystems."""
        with self._lock:
            return sorted(self._degraded)

    def _load_degraded(self) -> None:
        """Load degraded subsystems list from disk."""
        data = _load_json(DEGRADED_FILE)
        degraded = data.get("degraded", [])
        if isinstance(degraded, list):
            self._degraded = set(degraded)

    def _save_degraded(self) -> None:
        """Persist the degraded subsystems list to disk."""
        _save_json(DEGRADED_FILE, {"degraded": sorted(self._degraded)})

    # ------------------------------------------------------------------ #
    # State persistence helpers
    # ------------------------------------------------------------------ #

    def persist_circuit_state(self) -> None:
        """Write circuit breaker snapshot for all subsystems to disk."""
        data = {s: self._breakers[s].snapshot() for s in SUBSYSTEMS}
        _save_json(CB_FILE, data)

    def load_circuit_state(self) -> dict[str, Any]:
        """Load circuit breaker state from disk (used for cross-process sync)."""
        return _load_json(CB_FILE)

    # ------------------------------------------------------------------ #
    # Public convenience — run self-heal cycle
    # ------------------------------------------------------------------ #

    def run_heal_cycle(self) -> dict[str, Any]:
        """
        Convenience method: check if a heal should run, run it if so,
        and return the result.

        This is the primary entry point for the daemon loop.
        """
        if not self.should_heal():
            return {"skipped": True, "reason": "too_soon"}

        result = self.trigger_self_heal()
        self.persist_circuit_state()
        return result

    # ------------------------------------------------------------------ #
    # Categorise an exception for retry decisions
    # ------------------------------------------------------------------ #

    @staticmethod
    def categorise_error(exc: Exception) -> ErrorCategory:
        """
        Classify an exception into TRANSIENT / PERSISTENT / FATAL.

        TRANSIENT  — network timeout, temporary I/O error
        PERSISTENT — malformed data, missing file, value error
        FATAL      — keyboard interrupt, system exit, broken pipe
        """
        transient_keywords = (
            "timeout", "timed out", "temporary", "connection refused",
            "network", "eagain", "resource temporarily unavailable",
        )
        fatal_keywords = (
            "keyboard interrupt", "system exit", "broken pipe",
            "connection reset by peer", "operation cancelled",
        )
        # Check exception class name directly for FATAL types (some have no message)
        fatal_classes = {"KeyboardInterrupt", "SystemExit", "BrokenPipeError",
                         "ConnectionResetError", "OperationCancelledError"}

        msg = str(exc).lower()

        if any(k in msg for k in fatal_keywords) or type(exc).__name__ in fatal_classes:
            return ErrorCategory.FATAL

        if any(k in msg for k in transient_keywords):
            return ErrorCategory.TRANSIENT

        # Default to PERSISTENT — the safe default for unknown errors
        return ErrorCategory.PERSISTENT

    # ------------------------------------------------------------------ #
    # Call-with-circuit-breaker wrapper
    # ------------------------------------------------------------------ #

    def with_circuit(
        self,
        subsystem: str,
        fn: Callable[..., Any],
        *args: Any,
        **kwargs: Any,
    ) -> tuple[Any, bool]:
        """
        Call *fn(*args, **kwargs) with circuit breaker protection.

        Parameters
        ----------
        subsystem : str
            Name of the subsystem (must be in SUBSYSTEMS).
        fn : callable
            The function to call.
        *args, **kwargs
            Forwarded to *fn*.

        Returns
        -------
        (result, used_fallback)
            result          — the function return, or the subsystem fallback
            used_fallback   — True if the circuit was OPEN and fallback was used
        """
        if subsystem not in self._breakers:
            # Unknown subsystem — call directly without circuit protection
            return fn(*args, **kwargs), False

        br = self._breakers[subsystem]

        if br.is_open():
            fallback = FALLBACKS.get(subsystem, lambda: None)
            return fallback(), True

        try:
            result = self._retry(fn, *args, max_attempts=3, base_delay=2.0)
            br.record_call(success=True)
            return result, False
        except Exception as exc:  # noqa: BLE001
            br.record_call(success=False)
            self.record_failure(subsystem, exc)

            category = self.categorise_error(exc)
            if category == ErrorCategory.FATAL:
                # FATAL — halt immediately
                log(f"FATAL error in [{subsystem}]: {exc}")
                state = _load_json(STATE_FILE)
                state["running"] = False
                _save_json(STATE_FILE, state)
                raise

            # PERSISTENT / TRANSIENT — use fallback, continue
            fallback = FALLBACKS.get(subsystem, lambda: None)
            return fallback(), True

    # ------------------------------------------------------------------ #
    # Snapshot / debug
    # ------------------------------------------------------------------ #

    def full_snapshot(self) -> dict[str, Any]:
        """Return a complete snapshot of all health and circuit data."""
        health = self.check_health()
        circuits = {s: self._breakers[s].snapshot() for s in SUBSYSTEMS}
        return {
            "healthy": health["healthy"],
            "issues": health["issues"],
            "degraded": self.get_degraded(),
            "circuits": circuits,
            "last_heal_ts": self._last_heal_ts,
        }
