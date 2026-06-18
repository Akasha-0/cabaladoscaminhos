#!/usr/bin/env python3
"""
loop_optimizer.py — Self-optimization Engine for the Akasha Autonomous Loop

Continuously analyses loop iteration performance and adjusts strategy to maximise
speed without sacrificing quality.  Partners with AdaptivePacer but operates at a
higher level: while AdaptivePacer gates whether to proceed, LoopOptimizer tunes
*how* the loop runs (pacing, parallelism, timeouts, quality thresholds).

Public API
----------
LoopOptimizer                               : main class
record_iteration(iteration_data)            : store and process one iteration
analyze_trends()                            : trend analysis over the rolling window
get_optimization_recommendations()          : parameter tuning suggestions
should_adjust_pacing()                      : pacing adjustment decision
should_parallelize_more()                  : parallelism decision
apply_parameter_adjustments()                : push recommendations into AdaptivePacer
get_phase_benchmark(phase)                  : per-phase duration stats
detect_anomaly(phase)                       : statistical anomaly detection
export_tuning_state()                       : serialise for persistence
import_tuning_state(state)                  : restore from serialised state
"""

from __future__ import annotations

import json
import math
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, TypedDict

# ── Path constants ──────────────────────────────────────────────────────────────

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous" / "multi-agent"
TUNING_FILE = MA / "tuning.json"
MEMORY_FILE = MA / "memory.json"

import os

os.makedirs(MA, exist_ok=True)

# ── JSON helpers (matching established project conventions) ────────────────────


def load_json(path: Path, default=None) -> dict | list:
    """Load JSON from *path*, returning *default* if the file is missing or corrupt."""
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError, OSError):
            pass
    return default if default is not None else {}


def save_json(path: Path, data: dict | list) -> None:
    """Atomically write *data* as JSON to *path* (write then rename for atomicity)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.rename(path)


def log(msg: str, file=None) -> None:
    """
    Print *msg* to *file* (default stdout) with an ISO timestamp prefix.
    The file argument accepts a Path or an open file handle.
    """
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    line = f"[{ts}] LoopOptimizer: {msg}"
    if file is None:
        print(line, flush=True)
    elif isinstance(file, (str, Path)):
        with open(str(file), "a", encoding="utf-8") as fh:
            print(line, file=fh, flush=True)
    else:
        print(line, file=file, flush=True)


# ── Type aliases ───────────────────────────────────────────────────────────────

IterationData = dict[str, Any]  # flexible input shape; see record_iteration docstring
PhaseName = str
Recommendations = list[dict[str, Any]]


# ── Constants ─────────────────────────────────────────────────────────────────

HISTORY_WINDOW = 20          # iterations to analyse for trends
PHASE_WINDOW = 20            # per-phase iteration depth
STALENESS_THRESHOLD = 3     # consecutive slow-phase iterations before flagging

# Tuning parameter bounds
PMIN, PMAX = 0.5, 2.0        # pacing_multiplier range
AMIN, AMAX = 1, 10           # parallel_agent_limit range
TMIN, TMAX = 30, 600         # phase_timeout_seconds range
QMIN, QMAX = 0.5, 1.0        # quality_threshold range

# Anomaly multipliers
ZSCORE_HIGH = 2.0            # flag phase if z-score exceeds this
ZSCORE_CRITICAL = 3.0        # critical anomaly threshold

# Trend detection
SPEED_DROP_TOLERANCE = 0.15  # allow 15 % slowdown before calling a regression
QUALITY_DROP_TOLERANCE = 0.05  # allow 5-point drop before calling degradation


# ── Internal helpers ───────────────────────────────────────────────────────────


def _mean(values: list[float]) -> float:
    return sum(values) / len(values) if values else 0.0


def _stdev(values: list[float]) -> float:
    """Population stdev of a non-empty list."""
    if len(values) < 2:
        return 0.0
    m = _mean(values)
    variance = sum((v - m) ** 2 for v in values) / len(values)
    return math.sqrt(variance)


def _zscore(value: float, values: list[float]) -> float:
    s = _stdev(values)
    if s == 0.0:
        return 0.0
    return (value - _mean(values)) / s


def _linear_trend(values: list[float]) -> float:
    """
    Simple ordinary-least-squares slope of *values* (index = x).
    Positive slope = increasing over time.
    """
    if len(values) < 2:
        return 0.0
    n = len(values)
    x_mean = (n - 1) / 2.0
    y_mean = _mean(values)
    num = sum((i - x_mean) * (v - y_mean) for i, v in enumerate(values))
    den = sum((i - x_mean) ** 2 for i in range(n))
    return num / den if den != 0.0 else 0.0


def _pct_change(values: list[float]) -> float:
    """Percentage change from first to last element."""
    if len(values) < 2:
        return 0.0
    first, last = values[0], values[-1]
    if first == 0:
        return 0.0
    return (last - first) / first


def _clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


# ── TunableParameter descriptor ───────────────────────────────────────────────


class TunableParam:
    """
    Describes one parameter that LoopOptimizer can tune.

    Attributes
    ----------
    name       : canonical parameter key
    current    : live value
    default    : factory default
    lo, hi     : hard bounds
    sensitivity: how much a unit-change in this param affects loop speed (0-1)
    """

    __slots__ = ("name", "current", "default", "lo", "hi", "sensitivity")

    def __init__(
        self,
        name: str,
        default: float,
        lo: float,
        hi: float,
        sensitivity: float = 0.5,
    ) -> None:
        self.name = name
        self.default = default
        self.lo = lo
        self.hi = hi
        self.sensitivity = sensitivity
        self.current = default

    def nudge(self, delta: float) -> None:
        """Apply *delta* (fractional, e.g. +0.1) clamped to [lo, hi]."""
        self.current = _clamp(self.current * (1 + delta), self.lo, self.hi)

    def reset(self) -> None:
        self.current = self.default

    def as_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "current": self.current,
            "default": self.default,
            "lo": self.lo,
            "hi": self.hi,
        }


# ── PhaseBenchmark ──────────────────────────────────────────────────────────────


class PhaseBenchmark:
    """
    Rolling statistics for one named phase across the last PHASE_WINDOW
    recorded executions.
    """

    __slots__ = ("name", "durations", "quality_scores", "count", "anomaly_count")

    def __init__(self, name: PhaseName) -> None:
        self.name = name
        self.durations: list[float] = []      # seconds
        self.quality_scores: list[float] = []  # 0-1
        self.count = 0
        self.anomaly_count = 0

    def push(self, duration: float, quality: float) -> None:
        self.durations.append(duration)
        self.quality_scores.append(quality)
        if len(self.durations) > PHASE_WINDOW:
            self.durations.pop(0)
            self.quality_scores.pop(0)
        self.count += 1

    @property
    def avg_duration(self) -> float:
        return _mean(self.durations)

    @property
    def min_duration(self) -> float:
        return min(self.durations) if self.durations else 0.0

    @property
    def max_duration(self) -> float:
        return max(self.durations) if self.durations else 0.0

    @property
    def consistency(self) -> float:
        """
        Returns 1 - (stdev/mean) capped to [0, 1].
        Higher = more consistent.
        """
        if len(self.durations) < 2:
            return 1.0
        m = _mean(self.durations)
        if m == 0:
            return 1.0
        s = _stdev(self.durations)
        return max(0.0, min(1.0, 1.0 - s / m))

    @property
    def quality_trend(self) -> float:
        return _linear_trend(self.quality_scores)

    @property
    def speed_trend(self) -> float:
        """OLS slope of durations — negative = getting faster."""
        return _linear_trend(self.durations)

    def to_dict(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "count": self.count,
            "anomaly_count": self.anomaly_count,
            "avg_duration": round(self.avg_duration, 4),
            "min_duration": round(self.min_duration, 4),
            "max_duration": round(self.max_duration, 4),
            "consistency": round(self.consistency, 4),
            "speed_trend": round(self.speed_trend, 6),
            "quality_trend": round(self.quality_trend, 6),
        }


# ── LoopOptimizer ──────────────────────────────────────────────────────────────


class LoopOptimizer:
    """
    Self-optimisation engine for the Akasha autonomous loop.

    Records iteration metrics, analyses performance trends, detects anomalies
    and regressions, and generates parameter-tuning recommendations.  Works
    alongside :class:`AdaptivePacer` — this class handles *parameter tuning*
    while AdaptivePacer handles *whether to proceed*.

    Parameters
    ----------
    tuning_file : Path, optional
        Path for persisting tuning state.  Defaults to ``TUNING_FILE``.
    pacer_state_file : Path, optional
        Path to the AdaptivePacer state file.  Defaults to ``PACER_STATE_FILE``.
        Pass ``None`` to disable pacer integration.

    Example
    -------
    >>> lo = LoopOptimizer()
    >>> lo.record_iteration({
    ...     "iteration": 1,
    ...     "duration_s": 45.3,
    ...     "loop_quality": 0.82,
    ...     "phase_durations": {"plan": 5.1, "implement": 28.4, "qa": 8.2, "review": 3.6},
    ...     "parallel_agents": 3,
    ...     "success": True,
    ... })
    >>> trends = lo.analyze_trends()
    >>> print(trends["bottleneck_phase"])
    implement
    """

    # Tunable parameters registry
    _PARAMS: list[str] = [
        "pacing_multiplier",
        "parallel_agent_limit",
        "phase_timeout_seconds",
        "quality_threshold",
    ]

    def __init__(
        self,
        tuning_file: Path | None = None,
        pacer_state_file: Path | None = None,
    ) -> None:
        self._tf: Path = tuning_file if tuning_file is not None else TUNING_FILE
        self._pacer_sf = pacer_state_file

        # ── Rolling iteration history ──────────────────────────────────────────
        self.iteration_history: list[IterationData] = []

        # ── Per-phase benchmarks ───────────────────────────────────────────────
        self.phase_benchmarks: dict[PhaseName, PhaseBenchmark] = {}

        # ── Tunable parameters ────────────────────────────────────────────────
        self._pacing_multiplier = TunableParam("pacing_multiplier", 1.0, PMIN, PMAX, sensitivity=0.8)
        self._parallel_agent_limit = TunableParam("parallel_agent_limit", 4, AMIN, AMAX, sensitivity=0.7)
        self._phase_timeout_seconds = TunableParam("phase_timeout_seconds", 120, TMIN, TMAX, sensitivity=0.5)
        self._quality_threshold = TunableParam("quality_threshold", 0.80, QMIN, QMAX, sensitivity=0.9)

        self._params = {
            "pacing_multiplier": self._pacing_multiplier,
            "parallel_agent_limit": self._parallel_agent_limit,
            "phase_timeout_seconds": self._phase_timeout_seconds,
            "quality_threshold": self._quality_threshold,
        }

        # ── Recommendations cache (cleared after apply_parameter_adjustments) ─
        self._cached_recommendations: list[dict[str, Any]] = []

        # ── Load persisted state ───────────────────────────────────────────────
        self._load()

    # ── Public API ─────────────────────────────────────────────────────────────

    def record_iteration(self, iteration_data: IterationData) -> None:
        """
        Store one iteration's metrics and update all rolling statistics.

        Expected fields in *iteration_data* (all optional with defaults):

        =====================  ========  =====================================
        key                    type     description
        =====================  ========  =====================================
        ``iteration``           int      iteration number
        ``ts``                 str      ISO-8601 timestamp (default: now)
        ``duration_s``         float    total wall-clock duration in seconds
        ``loop_quality``       float    composite quality score 0-1
        ``phase_durations``    dict     phase name → seconds
        ``phase_quality``     dict     phase name → quality 0-1 (optional)
        ``parallel_agents``    int      agents running in parallel
        ``cpu_percent``        float    avg CPU utilisation 0-100 (optional)
        ``memory_mb``          float    peak RSS MB (optional)
        ``success``            bool     iteration completed successfully
        =====================  ========  =====================================

        The record is appended to the rolling window (max ``HISTORY_WINDOW``).
        """
        # Normalise with defaults
        now = datetime.now(timezone.utc).isoformat()
        record: IterationData = {
            "iteration": 0,
            "ts": now,
            "duration_s": 0.0,
            "loop_quality": 0.0,
            "phase_durations": {},
            "phase_quality": {},
            "parallel_agents": 1,
            "cpu_percent": 0.0,
            "memory_mb": 0.0,
            "success": True,
        }
        record.update(iteration_data)

        self.iteration_history.append(record)
        if len(self.iteration_history) > HISTORY_WINDOW:
            self.iteration_history.pop(0)

        # Update per-phase benchmarks
        for phase, dur in record.get("phase_durations", {}).items():
            if phase not in self.phase_benchmarks:
                self.phase_benchmarks[phase] = PhaseBenchmark(phase)
            qual = record.get("phase_quality", {}).get(phase, record.get("loop_quality", 0.0))
            self.phase_benchmarks[phase].push(float(dur), float(qual))

        # Increment anomaly counts for phases that were anomalously slow
        for phase, benchmark in self.phase_benchmarks.items():
            dur = record.get("phase_durations", {}).get(phase)
            if dur is not None:
                anomaly_info = self._anomaly_for(phase, float(dur))
                if anomaly_info["is_anomaly"]:
                    benchmark.anomaly_count += 1

        self._persist()
        log(f"Recorded iteration {record.get('iteration', '?')}  "
            f"quality={record.get('loop_quality', 0):.2f}  "
            f"duration={record.get('duration_s', 0):.1f}s")

    # --------------------------------------------------------------------------

    def analyze_trends(self) -> dict[str, Any]:
        """
        Analyse the rolling ``HISTORY_WINDOW`` of iterations and return a
        structured trend report.

        Returns
        -------
        dict with keys
          ``bottleneck_phase``   — phase with the highest avg duration, or ``""``
          ``quality_trend``      — ``"improving" | "stable" | "degrading"``
          ``speed_trend``        — ``"accelerating" | "stable" | "regressing"``
          ``resource_trend``     — ``"increasing" | "stable" | "decreasing"``
          ``quality_slope``      — OLS slope of quality scores
          ``speed_slope``        — OLS slope of duration (negative = faster)
          ``resource_slope``     — OLS slope of memory usage
          ``recommendation_count`` — number of outstanding recommendations
          ``anomaly_phases``     — list of phases currently in anomaly state
          ``iterations_analyzed`` — number of iterations in the rolling window
        """
        h = self.iteration_history
        n = len(h)

        if n < 2:
            return self._empty_trends()

        # ── Quality trend ──────────────────────────────────────────────────────
        qualities = [float(x.get("loop_quality", 0.0)) for x in h]
        q_slope = _linear_trend(qualities)
        q_pct = _pct_change(qualities)
        if q_slope > 0.005:
            q_trend = "improving"
        elif q_slope < -0.01:
            q_trend = "degrading"
        else:
            q_trend = "stable"

        # ── Speed trend ───────────────────────────────────────────────────────
        durations = [float(x.get("duration_s", 0.0)) for x in h]
        d_slope = _linear_trend(durations)
        d_pct = _pct_change(durations)
        # Negative slope = getting faster
        if d_slope < -0.5:
            s_trend = "accelerating"
        elif d_slope > int(SPEED_DROP_TOLERANCE * _mean(durations) / max(n, 1)):
            s_trend = "regressing"
        else:
            s_trend = "stable"

        # Simpler speed regression detection
        if d_pct > SPEED_DROP_TOLERANCE:
            s_trend = "regressing"
        elif d_pct < -SPEED_DROP_TOLERANCE:
            s_trend = "accelerating"
        else:
            s_trend = "stable"

        # ── Resource trend ─────────────────────────────────────────────────────
        memories = [float(x.get("memory_mb", 0.0)) for x in h if x.get("memory_mb", 0) > 0]
        if len(memories) >= 2:
            m_slope = _linear_trend(memories)
            m_pct = _pct_change(memories)
            if m_pct > 0.20:
                r_trend = "increasing"
            elif m_pct < -0.10:
                r_trend = "decreasing"
            else:
                r_trend = "stable"
        else:
            m_slope = 0.0
            r_trend = "stable"

        # ── Bottleneck phase ──────────────────────────────────────────────────
        bottleneck = ""
        max_avg = 0.0
        for phase, bm in self.phase_benchmarks.items():
            avg = bm.avg_duration
            if avg > max_avg:
                max_avg = avg
                bottleneck = phase

        # ── Phases currently in anomaly ───────────────────────────────────────
        anomaly_phases = []
        if h:
            latest = h[-1]
            for phase, dur in latest.get("phase_durations", {}).items():
                info = self._anomaly_for(phase, float(dur))
                if info["is_anomaly"]:
                    anomaly_phases.append(phase)
        # ── Recommendation count (computed without calling get_optimization_recommendations) ──
        # Quick count: just run the internal logic to know how many recs would fire.
        _rec_count = 0
        if n >= 3:
            cpu_vals = [float(x.get("cpu_percent", 0)) for x in h if x.get("cpu_percent", 0) > 0]
            avg_cpu = _mean(cpu_vals) if cpu_vals else 50.0
            anomaly_phases_list = anomaly_phases  # already computed above
            # pacing_multiplier recs
            if s_trend == "regressing" and q_trend == "degrading":
                _rec_count += 1
            elif s_trend == "regressing" and q_trend in ("stable", "improving"):
                _rec_count += 1
            elif s_trend == "accelerating" and q_trend in ("stable", "improving"):
                _rec_count += 1
            elif q_trend == "degrading" and s_trend != "regressing":
                _rec_count += 1
            # parallel_agent_limit recs
            if anomaly_phases_list:
                _rec_count += 1
            elif bottleneck and self.phase_benchmarks.get(bottleneck):
                bm = self.phase_benchmarks[bottleneck]
                if bm.consistency < 0.7 and self._parallel_agent_limit.current < AMAX:
                    _rec_count += 1
            # phase_timeout_seconds recs
            if bottleneck:
                bms = self.phase_benchmarks.get(bottleneck)
                if bms and bms.max_duration > 0:
                    suggested = _clamp(bms.max_duration * 1.5, self._phase_timeout_seconds.lo, self._phase_timeout_seconds.hi)
                    if abs(suggested - self._phase_timeout_seconds.current) > self._phase_timeout_seconds.current * 0.2:
                        _rec_count += 1
            # quality_threshold recs
            if q_slope < -0.01 and self._quality_threshold.current > QMIN:
                _rec_count += 1
            elif q_slope > 0.02 and self._quality_threshold.current < QMAX:
                _rec_count += 1

        return {
            "bottleneck_phase": bottleneck,
            "quality_trend": q_trend,
            "speed_trend": s_trend,
            "resource_trend": r_trend,
            "quality_slope": round(q_slope, 6),
            "speed_slope": round(d_slope, 6),
            "resource_slope": round(m_slope, 6),
            "recommendation_count": _rec_count,
            "anomaly_phases": anomaly_phases,
            "iterations_analyzed": n,
        }


    # --------------------------------------------------------------------------

    def get_optimization_recommendations(self) -> Recommendations:
        """
        Generate parameter-tuning recommendations based on current trends.

        Recommendations are re-computed on every call and cached until the
        next ``record_iteration`` call.

        Returns
        -------
        list of dicts, each with keys
          ``parameter``       — parameter name
          ``current_value``   — current live value
          ``recommended_value`` — suggested new value
          ``reason``         — human-readable justification
        """
        if self._cached_recommendations:
            return self._cached_recommendations

        recs: Recommendations = []
        h = self.iteration_history

        if len(h) < 3:
            return recs

        # ── Inline trend computation (avoids circular call to analyze_trends) ──
        qualities = [float(x.get("loop_quality", 0.0)) for x in h]
        durations = [float(x.get("duration_s", 0.0)) for x in h]
        q_slope = _linear_trend(qualities)
        d_pct = _pct_change(durations)
        if q_slope > 0.005:
            qt = "improving"
        elif q_slope < -0.01:
            qt = "degrading"
        else:
            qt = "stable"
        if d_pct > SPEED_DROP_TOLERANCE:
            st = "regressing"
        elif d_pct < -SPEED_DROP_TOLERANCE:
            st = "accelerating"
        else:
            st = "stable"
        cpu_values = [float(x.get("cpu_percent", 0)) for x in h if x.get("cpu_percent", 0) > 0]
        avg_cpu = _mean(cpu_values) if cpu_values else 50.0
        bottleneck = ""
        max_avg = 0.0
        for phase, bm in self.phase_benchmarks.items():
            if bm.avg_duration > max_avg:
                max_avg = bm.avg_duration
                bottleneck = phase
        anomaly_phases = []
        if h:
            latest = h[-1]
            for phase, dur in latest.get("phase_durations", {}).items():
                info = self._anomaly_for(phase, float(dur))
                if info["is_anomaly"]:
                    anomaly_phases.append(phase)

        if len(h) < 3:
            return recs

        # st, qt, bottleneck, anomaly_phases, avg_cpu already set by inline trend block above
        pm = self._pacing_multiplier

        if st == "regressing" and qt == "degrading":
            # Both getting worse → slow down significantly
            recs.append({
                "parameter": "pacing_multiplier",
                "current_value": round(pm.current, 4),
                "recommended_value": round(_clamp(pm.current * 0.7, pm.lo, pm.hi), 4),
                "reason": f"Speed and quality both regressing ({st}/{qt}). "
                          "Reducing pacing to allow more careful processing.",
            })
        elif st == "regressing" and qt in ("stable", "improving"):
            # Faster isn't better → reduce speed
            recs.append({
                "parameter": "pacing_multiplier",
                "current_value": round(pm.current, 4),
                "recommended_value": round(_clamp(pm.current * 0.85, pm.lo, pm.hi), 4),
                "reason": f"Speed regressing ({st}) while quality held ({qt}). "
                          "Slight pacing reduction recommended.",
            })
        elif st == "accelerating" and qt in ("stable", "improving"):
            # We can safely go faster
            recs.append({
                "parameter": "pacing_multiplier",
                "current_value": round(pm.current, 4),
                "recommended_value": round(_clamp(pm.current * 1.1, pm.lo, pm.hi), 4),
                "reason": f"Speed improving ({st}) with stable quality ({qt}). "
                          "Modest acceleration recommended.",
            })
        elif qt == "degrading" and st != "regressing":
            # Quality dropping even if speed is fine → slow down
            recs.append({
                "parameter": "pacing_multiplier",
                "current_value": round(pm.current, 4),
                "recommended_value": round(_clamp(pm.current * 0.9, pm.lo, pm.hi), 4),
                "reason": f"Quality degrading ({qt}) — pacing reduction to improve outcomes.",
            })
        # ── parallel_agent_limit ───────────────────────────────────────────────
        al = self._parallel_agent_limit
        if anomaly_phases:
            if avg_cpu < 60:
                recs.append({
                    "parameter": "parallel_agent_limit",
                    "current_value": int(al.current),
                    "recommended_value": min(int(_clamp(al.current + 1, al.lo, al.hi)), AMAX),
                    "reason": f"Anomalies in {anomaly_phases} but CPU utilisation low "
                              f"({avg_cpu:.0f}%). Consider more parallelism.",
                })
            else:
                recs.append({
                    "parameter": "parallel_agent_limit",
                    "current_value": int(al.current),
                    "recommended_value": max(int(_clamp(al.current - 1, al.lo, al.hi)), AMIN),
                    "reason": f"Anomalies in {anomaly_phases} with high CPU ({avg_cpu:.0f}%). "
                              "Reducing parallelism to lower contention.",
                })
        elif bottleneck and self.phase_benchmarks.get(bottleneck):
            bmark = self.phase_benchmarks[bottleneck]
            if bmark.consistency < 0.7 and al.current < AMAX:
                recs.append({
                    "parameter": "parallel_agent_limit",
                    "current_value": int(al.current),
                    "recommended_value": min(int(al.current + 1), AMAX),
                    "reason": f"Bottleneck '{bottleneck}' inconsistent "
                              f"(consistency={bmark.consistency:.2f}). Extra agents may help.",
                })


        # ── phase_timeout_seconds ──────────────────────────────────────────────
        ts = self._phase_timeout_seconds
        if bottleneck:
            bm = self.phase_benchmarks.get(bottleneck)
            if bm and bm.max_duration > 0:
                # Set timeout to 1.5x the worst-case observed duration
                suggested = _clamp(bm.max_duration * 1.5, ts.lo, ts.hi)
                if abs(suggested - ts.current) > ts.current * 0.2:
                    recs.append({
                        "parameter": "phase_timeout_seconds",
                        "current_value": round(ts.current, 2),
                        "recommended_value": round(suggested, 2),
                        "reason": f"Bottleneck '{bottleneck}' worst-case={bm.max_duration:.1f}s. "
                                  f"Timeout adjusted to 1.5x for headroom.",
                    })

        # ── quality_threshold ──────────────────────────────────────────────────
        qt_param = self._quality_threshold
        if q_slope < -0.01 and qt_param.current > QMIN:
            # Quality declining — tighten threshold to enforce higher minimum bar
            new_qt = _clamp(qt_param.current * 0.97, QMIN, QMAX)
            recs.append({
                "parameter": "quality_threshold",
                "current_value": round(qt_param.current, 4),
                "recommended_value": round(new_qt, 4),
                "reason": f"Quality trend slope={q_slope:.4f} — tightening threshold "
                          "to enforce higher minimum quality bar.",
            })
        elif q_slope > 0.02 and qt_param.current < QMAX:
            # Quality improving steadily — raise the bar
            new_qt = _clamp(qt_param.current * 1.02, QMIN, QMAX)
            recs.append({
                "parameter": "quality_threshold",
                "current_value": round(qt_param.current, 4),
                "recommended_value": round(new_qt, 4),
                "reason": f"Quality trend slope={q_slope:.4f} — quality rising. "
                          "Raising threshold to lock in gains.",
            })

        self._cached_recommendations = recs
        return recs

    # --------------------------------------------------------------------------

    def should_adjust_pacing(self) -> dict[str, Any]:
        """
        Decide whether the pacing_multiplier should change based on recent trends.

        This is a higher-signal, lower-noise signal than the general recommendations
        — it directly answers whether to speed up or slow down.

        Returns
        -------
        dict with keys
          ``adjust``    — ``True`` if pacing should change, ``False`` to hold
          ``direction`` — ``"faster" | "slower" | "hold"``
          ``reason``   — concise explanation
        """
        trends = self.analyze_trends()
        h = self.iteration_history

        if len(h) < 3:
            return {"adjust": False, "direction": "hold", "reason": "Insufficient data (< 3 iterations)"}

        qt = trends["quality_trend"]
        st = trends["speed_trend"]
        anomalies = trends.get("anomaly_phases", [])

        # Strong signal: quality degrading → slow down regardless
        if qt == "degrading":
            return {
                "adjust": True,
                "direction": "slower",
                "reason": f"Quality trend is degrading. Pacing reduction recommended.",
            }

        # Strong signal: speed regressing → slow down
        if st == "regressing":
            return {
                "adjust": True,
                "direction": "slower",
                "reason": f"Speed trend regressing. Pacing reduction recommended.",
            }

        # Concurrent anomalies in bottleneck phases
        if len(anomalies) >= 2:
            return {
                "adjust": True,
                "direction": "slower",
                "reason": f"{len(anomalies)} phases in anomaly state. Slowing to stabilise.",
            }

        # Quality stable and speed stable → can accelerate slightly
        if qt == "stable" and st == "stable":
            return {
                "adjust": True,
                "direction": "faster",
                "reason": "Quality and speed both stable. Modest acceleration recommended.",
            }

        # Quality improving while speed stable → accelerate
        if qt == "improving" and st == "stable":
            return {
                "adjust": True,
                "direction": "faster",
                "reason": "Quality improving with stable speed. Acceleration recommended.",
            }

        return {"adjust": False, "direction": "hold", "reason": "No strong signal for pacing change."}

    # --------------------------------------------------------------------------

    def should_parallelize_more(self) -> dict[str, Any]:
        """
        Decide whether to increase the parallel_agent_limit.

        Returns
        -------
        dict with keys
          ``yes``   — ``True`` if parallelisation increase is recommended
          ``reason`` — human-readable justification
          ``risk``  — risk level: ``"low" | "medium" | "high"``
        """
        trends = self.analyze_trends()
        h = self.iteration_history

        if len(h) < 3:
            return {"yes": False, "reason": "Insufficient data", "risk": "low"}

        if self._parallel_agent_limit.current >= AMAX:
            return {"yes": False, "reason": "Already at maximum parallel agent limit", "risk": "low"}

        # Check CPU utilisation
        cpu_values = [float(x.get("cpu_percent", 0)) for x in h if x.get("cpu_percent", 0) > 0]
        avg_cpu = _mean(cpu_values) if cpu_values else 50.0
        anomalies = trends.get("anomaly_phases", [])
        bottleneck = trends.get("bottleneck_phase", "")

        # Low CPU + no anomalies → good candidate for more parallelism
        if avg_cpu < 50 and not anomalies:
            return {
                "yes": True,
                "reason": f"Average CPU utilisation is low ({avg_cpu:.0f}%) with no anomalies. "
                          "Additional parallel agents would be well-utilised.",
                "risk": "low",
            }

        # High CPU + bottleneck is I/O-like → more agents may help despite CPU
        if avg_cpu > 80 and bottleneck:
            bm = self.phase_benchmarks.get(bottleneck)
            if bm and bm.consistency < 0.6:
                return {
                    "yes": True,
                    "reason": f"High CPU ({avg_cpu:.0f}%) but bottleneck '{bottleneck}' "
                              "is inconsistent — may be I/O-bound. Parallelism risk: medium.",
                    "risk": "medium",
                }

        # High CPU + consistent bottleneck → risky to add more agents
        if avg_cpu > 80 and bottleneck:
            bm = self.phase_benchmarks.get(bottleneck)
            if bm and bm.consistency >= 0.8:
                return {
                    "yes": False,
                    "reason": f"CPU saturation ({avg_cpu:.0f}%) and bottleneck '{bottleneck}' "
                              "is consistent — likely CPU-bound. Parallelisation risk: high.",
                    "risk": "high",
                }

        # Active anomalies → increase agents only if CPU headroom exists
        if anomalies and avg_cpu < 70:
            return {
                "yes": True,
                "reason": f"Anomalies in {anomalies} but CPU headroom exists ({avg_cpu:.0f}% avg). "
                          "More parallel agents may resolve contention.",
                "risk": "medium",
            }

        return {"yes": False, "reason": "No compelling signal to increase parallelism.", "risk": "low"}

    # --------------------------------------------------------------------------

    def apply_parameter_adjustments(self) -> bool:
        """
        Apply the cached recommendations to the live tunable parameters.

        Also propagates relevant changes to the :class:`AdaptivePacer` instance
        via its ``force_state`` mechanism where appropriate.

        Recommendations are cleared after application to prevent double-application.

        Returns
        -------
        ``True`` if at least one parameter changed, ``False`` otherwise.
        """
        recs = self.get_optimization_recommendations()
        if not recs:
            log("No recommendations to apply.")
            return False

        changed = []
        for rec in recs:
            param_name = rec["parameter"]
            new_val = rec["recommended_value"]
            param = self._params.get(param_name)
            if param is None:
                continue

            old_val = param.current
            if param_name == "pacing_multiplier":
                param.current = float(new_val)
            elif param_name == "parallel_agent_limit":
                param.current = int(round(new_val))
            elif param_name == "phase_timeout_seconds":
                param.current = float(new_val)
            elif param_name == "quality_threshold":
                param.current = float(new_val)

            if param.current != old_val:
                changed.append(f"{param_name}: {old_val:.4g} → {param.current:.4g}")

                # Also push pacing_multiplier changes to AdaptivePacer
                if param_name == "pacing_multiplier":
                    self._push_pacer_adjustment(new_val)

        if changed:
            log(f"Applied parameter adjustments: {'; '.join(changed)}")
            self._cached_recommendations = []
            self._persist()
            return True
        return False

    # --------------------------------------------------------------------------

    def get_phase_benchmark(self, phase: PhaseName) -> dict[str, Any]:
        """
        Return duration statistics for *phase* over its rolling window.

        Returns
        -------
        dict with keys
          ``avg_duration``   — mean phase duration in seconds
          ``min_duration``   — minimum observed duration
          ``max_duration``   — maximum observed duration
          ``consistency``    — 0-1 score (higher = more consistent)
          ``count``          — total recorded executions
          ``anomaly_count``  — number of executions flagged as anomalous
        """
        bm = self.phase_benchmarks.get(phase)
        if bm is None:
            return {
                "avg_duration": 0.0,
                "min_duration": 0.0,
                "max_duration": 0.0,
                "consistency": 1.0,
                "count": 0,
                "anomaly_count": 0,
            }
        return {
            "avg_duration": round(bm.avg_duration, 4),
            "min_duration": round(bm.min_duration, 4),
            "max_duration": round(bm.max_duration, 4),
            "consistency": round(bm.consistency, 4),
            "count": bm.count,
            "anomaly_count": bm.anomaly_count,
        }

    # --------------------------------------------------------------------------

    def detect_anomaly(self, phase: PhaseName) -> dict[str, Any]:
        """
        Statistical anomaly detection for the most recent *phase* execution.

        An anomaly is flagged when the latest duration's z-score exceeds
        ``ZSCORE_HIGH`` relative to the phase's rolling history.

        Returns
        -------
        dict with keys
          ``is_anomaly``  — ``True`` if an anomaly was detected
          ``severity``   — ``"none" | "mild" | "moderate" | "critical"``
          ``description`` — human-readable description of the anomaly
        """
        h = self.iteration_history
        if not h:
            return {"is_anomaly": False, "severity": "none", "description": "No iteration data."}

        latest_dur = h[-1].get("phase_durations", {}).get(phase)
        if latest_dur is None:
            return {"is_anomaly": False, "severity": "none", "description": f"No data for phase '{phase}'."}

        return self._anomaly_for(phase, float(latest_dur))

    # --------------------------------------------------------------------------

    def export_tuning_state(self) -> dict[str, Any]:
        """
        Serialise the complete tuning state for persistence.

        Use ``import_tuning_state`` to restore it.

        Returns
        -------
        dict with keys
          ``ts``                  — ISO timestamp of export
          ``params``              — dict of all tunable parameters
          ``phase_benchmarks``    — serialised PhaseBenchmark dict
          ``iteration_history``  — list of recorded iteration dicts
          ``cached_recommendations`` — current recommendations
        """
        return {
            "ts": datetime.now(timezone.utc).isoformat(),
            "params": {name: p.as_dict() for name, p in self._params.items()},
            "phase_benchmarks": {
                name: bm.to_dict() for name, bm in self.phase_benchmarks.items()
            },
            "iteration_history": list(self.iteration_history),
            "cached_recommendations": list(self._cached_recommendations),
        }

    # --------------------------------------------------------------------------

    def import_tuning_state(self, state: dict[str, Any]) -> bool:
        """
        Restore tuning state from a dict previously returned by ``export_tuning_state``.

        Parameters that cannot be restored (e.g. unknown keys) are silently skipped.

        Returns
        -------
        ``True`` on success, ``False`` if *state* is empty or badly formed.
        """
        if not state:
            log("import_tuning_state: received empty state, skipping.")
            return False

        # Restore tunable parameters
        for name, pd in state.get("params", {}).items():
            param = self._params.get(name)
            if param is None:
                continue
            param.current = float(pd.get("current", param.default))

        # Restore per-phase benchmarks
        for phase, bd in state.get("phase_benchmarks", {}).items():
            bm = PhaseBenchmark(phase)
            bm.count = int(bd.get("count", 0))
            bm.anomaly_count = int(bd.get("anomaly_count", 0))
            # Note: durations/quuality_scores are not persisted individually
            # to avoid unbounded growth; they repopulate from new iterations
            self.phase_benchmarks[phase] = bm

        # Restore iteration history
        self.iteration_history = list(state.get("iteration_history", []))
        if len(self.iteration_history) > HISTORY_WINDOW:
            self.iteration_history = self.iteration_history[-HISTORY_WINDOW:]

        # Restore cached recommendations
        self._cached_recommendations = list(state.get("cached_recommendations", []))

        self._persist()
        log(f"import_tuning_state: restored {len(self.iteration_history)} iterations, "
            f"{len(self.phase_benchmarks)} phase benchmarks.")
        return True

    # ── Private helpers ───────────────────────────────────────────────────────

    def _anomaly_for(self, phase: PhaseName, duration: float) -> dict[str, Any]:
        """Core anomaly detection logic shared by detect_anomaly and record_iteration."""
        bm = self.phase_benchmarks.get(phase)
        if bm is None or len(bm.durations) < 3:
            return {"is_anomaly": False, "severity": "none", "description": "Insufficient phase history."}

        z = _zscore(duration, bm.durations)

        if abs(z) >= ZSCORE_CRITICAL:
            return {
                "is_anomaly": True,
                "severity": "critical",
                "description": f"Duration {duration:.2f}s is {z:+.1f}σ from mean "
                               f"({bm.avg_duration:.2f}s) — critical outlier.",
            }
        if abs(z) >= ZSCORE_HIGH:
            direction = "slower" if z > 0 else "faster"
            return {
                "is_anomaly": True,
                "severity": "moderate",
                "description": f"Duration {duration:.2f}s is {z:+.1f}σ {direction} than "
                               f"mean ({bm.avg_duration:.2f}s) — moderate anomaly.",
            }
        if abs(z) >= 1.5:
            return {
                "is_anomaly": True,
                "severity": "mild",
                "description": f"Duration {duration:.2f}s deviates {z:+.1f}σ from mean "
                               f"({bm.avg_duration:.2f}s) — mild anomaly.",
            }

        return {"is_anomaly": False, "severity": "none", "description": "Phase within normal range."}

    def _push_pacer_adjustment(self, pacing_multiplier: float) -> None:
        """
        Translate a pacing_multiplier suggestion into an AdaptivePacer state nudge.

        Maps the continuous multiplier onto the four discrete pacer states:
          ≥ 1.4  → FAST
          ≥ 0.9  → NORMAL
          ≥ 0.6  → SLOW
          < 0.6  → PAUSE
        """
        try:
            from adaptive_pacer import AdaptivePacer, get_pacer
        except ImportError:
            log("AdaptivePacer not available — skipping pacer push.")
            return

        pacer = get_pacer()
        if pacer is None:
            pacer = AdaptivePacer()

        if pacing_multiplier >= 1.4:
            pacer.force_state("FAST", reason="LoopOptimizer: high quality + accelerating")
        elif pacing_multiplier >= 0.9:
            pacer.force_state("NORMAL", reason="LoopOptimizer: stable operation")
        elif pacing_multiplier >= 0.6:
            pacer.force_state("SLOW", reason="LoopOptimizer: quality or speed concern")
        else:
            pacer.force_state("PAUSE", reason="LoopOptimizer: critical regression")

    def _empty_trends(self) -> dict[str, Any]:
        return {
            "bottleneck_phase": "",
            "quality_trend": "stable",
            "speed_trend": "stable",
            "resource_trend": "stable",
            "quality_slope": 0.0,
            "speed_slope": 0.0,
            "resource_slope": 0.0,
            "recommendation_count": 0,
            "anomaly_phases": [],
            "iterations_analyzed": 0,
        }

    # ── Persistence ───────────────────────────────────────────────────────────

    def _load(self) -> None:
        """Restore persisted tuning state from ``self._tf``."""
        raw = load_json(self._tf, default=None)
        if raw:
            self.import_tuning_state(raw)

    def _persist(self) -> None:
        """Save current tuning state to ``self._tf``."""
        try:
            save_json(self._tf, self.export_tuning_state())
        except Exception as exc:
            log(f"WARNING — failed to persist tuning state: {exc}")


# ── Module-level convenience singleton ────────────────────────────────────────

_optimizer_instance: LoopOptimizer | None = None


def get_optimizer(tuning_file: Path | None = None) -> LoopOptimizer:
    """
    Return the shared :class:`LoopOptimizer` singleton, creating it on first call.
    """
    global _optimizer_instance
    if _optimizer_instance is None:
        _optimizer_instance = LoopOptimizer(tuning_file=tuning_file)
    return _optimizer_instance


# ── CLI (useful for debugging / one-off analysis) ─────────────────────────────


def _cli() -> None:
    lo = get_optimizer()
    import argparse

    parser = argparse.ArgumentParser(description="LoopOptimizer diagnostic CLI")
    sub = parser.add_subparsers(dest="cmd")

    sub.add_parser("trends", help="Print current trend analysis")
    sub.add_parser("recs", help="Print optimisation recommendations")
    sub.add_parser("pacing", help="Should we adjust pacing?")
    sub.add_parser("parallel", help="Should we parallelise more?")
    sub.add_parser("phases", help="Print all phase benchmarks")
    sub.add_parser("state", help="Print full tuning state")

    sub.add_parser("apply", help="Apply cached recommendations")

    args = parser.parse_args()

    if args.cmd == "trends":
        print(json.dumps(lo.analyze_trends(), indent=2))
    elif args.cmd == "recs":
        print(json.dumps(lo.get_optimization_recommendations(), indent=2))
    elif args.cmd == "pacing":
        print(json.dumps(lo.should_adjust_pacing(), indent=2))
    elif args.cmd == "parallel":
        print(json.dumps(lo.should_parallelize_more(), indent=2))
    elif args.cmd == "phases":
        for phase in sorted(lo.phase_benchmarks):
            print(f"\n=== {phase} ===")
            print(json.dumps(lo.get_phase_benchmark(phase), indent=2))
    elif args.cmd == "state":
        print(json.dumps(lo.export_tuning_state(), indent=2))
    elif args.cmd == "apply":
        ok = lo.apply_parameter_adjustments()
        print(f"Applied: {ok}")
    else:
        parser.print_help()


if __name__ == "__main__":
    _cli()
