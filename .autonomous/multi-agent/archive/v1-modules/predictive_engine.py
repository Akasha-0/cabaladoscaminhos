"""
PredictiveEngine — forecasts failure modes and quality trajectory
for the Akasha autonomous loop.

Looks at:
  - failure_rate trend  (from metrics.json history)
  - memory growth rate   (from memory.json context_window sizes)
  - quality EMA         (from metrics.json loop_quality / release_quality)

Risk types: memory_exhaustion, quality_regression, persistent_error,
            cascade_failure

Severity thresholds:
  CRITICAL  > 70 % probability  + severe impact
  HIGH      > 50 % probability
  MEDIUM    > 30 % probability
  LOW       everything else
"""

from __future__ import annotations

import json
import math
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, TypedDict

# ─── Paths ────────────────────────────────────────────────────────────────────

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous" / "multi-agent"
MEMORY_FILE = MA / "memory.json"
METRICS_FILE = MA / "metrics.json"
STATE_FILE = MA / "state.json"

# ─── Helpers ─────────────────────────────────────────────────────────────────

def load_json(path: Path, default=None) -> dict | list:
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            return default if default is not None else {}
    return default if default is not None else {}


def _ema(values: list[float], alpha: float = 0.3) -> float | None:
    """Exponential moving average — returns None when not enough data."""
    if not values:
        return None
    ema_val = values[0]
    for v in values[1:]:
        ema_val = alpha * v + (1 - alpha) * ema_val
    return ema_val


def _slope(values: list[float]) -> float | None:
    """Simple linear regression slope (last → first direction)."""
    n = len(values)
    if n < 2:
        return None
    # Use most-recent window of up to 10 points
    window = values[-10:] if n > 10 else values
    wn = len(window)
    indices = list(range(wn))
    mean_x = sum(indices) / wn
    mean_y = sum(window) / wn
    num = sum((indices[i] - mean_x) * (window[i] - mean_y) for i in range(wn))
    den = sum((indices[i] - mean_x) ** 2 for i in range(wn))
    if den == 0:
        return 0.0
    return num / den


def _windowed_mean(values: list[float], n: int = 5) -> float | None:
    """Mean of the last n values."""
    if not values:
        return None
    return sum(values[-n:]) / min(n, len(values))


# ─── Data shapes ─────────────────────────────────────────────────────────────

class Risk(TypedDict):
    type: str
    severity: str  # CRITICAL | HIGH | MEDIUM | LOW
    probability: float
    description: str
    mitigation: str


class AnalysisResult(TypedDict):
    risks: list[Risk]


# ─── Severity helpers ─────────────────────────────────────────────────────────

SEVERITY_THRESHOLDS = {
    "CRITICAL": 0.70,
    "HIGH": 0.50,
    "MEDIUM": 0.30,
    "LOW": 0.0,
}


def _severity(prob: float, impact: str = "medium") -> str:
    """Map probability + impact to a severity tier."""
    if prob > 0.70 and impact == "severe":
        return "CRITICAL"
    if prob > 0.50:
        return "HIGH"
    if prob > 0.30:
        return "MEDIUM"
    return "LOW"


# ─── Metric extraction helpers ───────────────────────────────────────────────

def _failure_rate_series(history: list[dict]) -> list[float]:
    """Extract failure_rate per iteration: 1 - loop_quality."""
    return [1.0 - max(0.0, min(1.0, entry.get("loop_quality", 0.4)))
            for entry in history]


def _quality_series(history: list[dict]) -> list[float]:
    """Extract release_quality series (0..1)."""
    return [max(0.0, min(1.0, entry.get("release_quality", 0.0)))
            for entry in history]


def _memory_growth_series(memory: dict) -> list[float]:
    """
    Approximate memory growth from the size of recent context_window entries.
    Each context_window entry is roughly proportional to memory usage.
    """
    cw = memory.get("context_window", [])
    if not cw:
        return []
    # Size of each context entry (character count as proxy)
    return [len(json.dumps(e)) for e in cw[-20:]]


# ─── Core analysis methods ───────────────────────────────────────────────────

class PredictiveEngine:
    """
    Predictive engine for the Akasha autonomous loop.

    Public API
    ----------
    analyze() -> AnalysisResult
        Returns a dict with a `risks` key listing all detected risks.
    predict_next_quality() -> float
        Predicted quality score (0..1) for the next iteration.
    get_risk_summary() -> str
        Human-readable one-line summary of the current risk posture.
    """

    def __init__(self) -> None:
        self.memory = load_json(MEMORY_FILE, {})
        self.metrics = load_json(METRICS_FILE, {"version": 1, "history": [], "phase_history": []})
        self.state = load_json(STATE_FILE, {})

    # ── public ────────────────────────────────────────────────────────────────

    def analyze(self) -> AnalysisResult:
        """Return all detected risks with severity, probability, and mitigation."""
        risks: list[Risk] = []

        # 1. failure_rate trend → persistent_error risk
        risks.append(self._analyze_failure_rate_trend())

        # 2. memory growth → memory_exhaustion risk
        risks.append(self._analyze_memory_growth())

        # 3. quality EMA trajectory → quality_regression risk
        risks.append(self._analyze_quality_regression())

        # 4. cascade_failure — cross-signal composite
        risks.append(self._analyze_cascade_failure(risks))

        # Filter out LOW-severity risks from the default output
        # (keep all but LOW to reduce noise; callers can filter)
        active_risks = [r for r in risks if r["severity"] != "LOW"]

        return {"risks": active_risks}

    def predict_next_quality(self) -> float:
        """
        Forecast the next iteration's release_quality using EMA + slope
        extrapolation. Returns a float in [0.0, 1.0].
        """
        history = self.metrics.get("history", [])
        if len(history) < 2:
            return 0.5  # neutral default

        qual_series = _quality_series(history)
        if not qual_series:
            return 0.5

        # EMA as baseline
        ema_q = _ema(qual_series, alpha=0.3) or 0.5

        # Slope gives direction
        slope_q = _slope(qual_series) or 0.0

        # Normalise slope to [-1, 1] range (10-iteration window)
        norm_slope = max(-1.0, min(1.0, slope_q * 5))

        # Blend EMA with a dampened slope correction
        predicted = ema_q + norm_slope * 0.05
        return round(max(0.0, min(1.0, predicted)), 4)

    def get_risk_summary(self) -> str:
        """
        One-line human-readable risk posture string.
        Example: "⚠ HIGH  persistent_error (67%) | ⚠ MEDIUM  memory_exhaustion (41%)"
        """
        analysis = self.analyze()
        risks = analysis["risks"]

        if not risks:
            return "✅ All clear — no active risks detected."

        parts = []
        for r in risks:
            icon = {
                "CRITICAL": "🔴",
                "HIGH": "⚠️ ",
                "MEDIUM": "⚡",
                "LOW": "  ",
            }.get(r["severity"], "? ")
            parts.append(f'{icon}{r["severity"]:8s}  {r["type"]} ({r["probability"]:0.0%})')

        return " | ".join(parts)

    # ── private: individual risk analysers ──────────────────────────────────

    def _analyze_failure_rate_trend(self) -> Risk:
        """
        Persistent error risk: rising failure_rate across recent iterations
        suggests errors are not being resolved.
        """
        history = self.metrics.get("history", [])
        if len(history) < 3:
            return self._make_risk(
                "persistent_error",
                0.25,
                "medium",
                "Insufficient history to establish failure trend.",
                "Continue monitoring — need at least 3 iterations.",
            )

        fail_series = _failure_rate_series(history)
        recent = fail_series[-6:]          # last 6 iterations
        earlier = fail_series[-12:-6] if len(fail_series) >= 12 else fail_series[:6]

        # Probability: how often failures occur now + trend
        current_fail_rate = _windowed_mean(recent, 5) or _ema(recent) or 0.25
        slope_f = _slope(fail_series[-10:]) or 0.0

        # Rising slope increases probability
        trend_factor = max(0.0, slope_f * 10)  # scale slope to [0,1] roughly
        probability = min(1.0, current_fail_rate + trend_factor * 0.2)

        # Earlier period mean as sanity check
        earlier_mean = _windowed_mean(earlier, 5) if earlier else 0.0
        is_persistent = (earlier_mean > 0.1 and current_fail_rate > earlier_mean)

        if is_persistent:
            probability = min(1.0, probability + 0.15)

        severity = _severity(probability)
        description = (
            f"Failure rate trend is {'rising' if slope_f > 0.02 else 'stable'}; "
            f"current ≈{current_fail_rate:.0%}, earlier ≈{earlier_mean:.0%}."
        )
        mitigation = (
            "Audit recent error_patterns in memory.json. "
            "Identify root-cause hash clusters (error_patterns dict). "
            "Prioritise fixes for high-count error hashes."
        )

        return self._make_risk("persistent_error", probability, "medium" if severity != "CRITICAL" else "severe",
                                description, mitigation)

    def _analyze_memory_growth(self) -> Risk:
        """
        Memory exhaustion risk: context_window sizes are trending upward,
        suggesting unbounded memory growth.
        """
        mem_series = _memory_growth_series(self.memory)
        if len(mem_series) < 4:
            return self._make_risk(
                "memory_exhaustion",
                0.15,
                "low",
                "Insufficient context_window history to detect growth trend.",
                "Continue monitoring — context_window is still building.",
            )

        slope_m = _slope(mem_series) or 0.0

        # Current size relative to earliest recorded
        initial = mem_series[0] if mem_series else 1
        current = mem_series[-1] if mem_series else 1
        growth_ratio = current / max(initial, 1)

        # Strong growth: ratio > 2× in 20 entries or steep positive slope
        if growth_ratio > 3.0 or slope_m > initial * 0.1:
            probability = 0.75
            impact = "severe"
        elif growth_ratio > 2.0 or slope_m > initial * 0.05:
            probability = 0.55
            impact = "medium"
        elif slope_m > initial * 0.02:
            probability = 0.35
            impact = "medium"
        else:
            probability = 0.15
            impact = "low"

        severity = _severity(probability, impact)
        description = (
            f"Context window size trending {'upward' if slope_m > 0 else 'stable/down'}; "
            f"current {current:.0f} chars vs initial {initial:.0f} (×{growth_ratio:.1f})."
        )
        mitigation = (
            "Consider compacting context_window (summarise or prune old entries). "
            "Check if memory.json context_window is being trimmed between iterations. "
            "Monitor RSS of the running process."
        )

        return self._make_risk("memory_exhaustion", probability, impact,
                                description, mitigation)

    def _analyze_quality_regression(self) -> Risk:
        """
        Quality regression risk: quality EMA is declining or below threshold.
        """
        history = self.metrics.get("history", [])
        if len(history) < 3:
            return self._make_risk(
                "quality_regression",
                0.20,
                "low",
                "Insufficient history to establish quality trend.",
                "Continue monitoring.",
            )

        qual_series = _quality_series(history)
        ema_q = _ema(qual_series, alpha=0.3) or 0.5
        slope_q = _slope(qual_series[-10:]) or 0.0

        # Quality threshold: below 0.5 is concerning
        below_threshold = ema_q < 0.5
        declining = slope_q < -0.02

        if below_threshold and declining:
            probability = 0.75
            impact = "severe"
        elif below_threshold or declining:
            probability = 0.50
            impact = "medium"
        else:
            probability = 0.20
            impact = "low"

        # Predicted next quality as auxiliary signal
        next_q = self.predict_next_quality()
        if next_q < 0.3:
            probability = min(1.0, probability + 0.15)

        severity = _severity(probability, impact)
        description = (
            f"Quality EMA ≈{ema_q:.2f}, slope {'+' if slope_q >= 0 else ''}{slope_q:.3f}. "
            f"Predicted next quality ≈{next_q:.2f}."
        )
        mitigation = (
            "Review recent low-quality iterations in metrics.json history. "
            "Focus on impl_quality and qa_quality scores. "
            "Consider adding regression tests or tightening the review gate."
        )

        return self._make_risk("quality_regression", probability, impact,
                                description, mitigation)

    def _analyze_cascade_failure(self, risks: list[Risk]) -> Risk:
        """
        Cascade failure: when multiple HIGH/CRITICAL risks co-occur,
        the chance of a cascade (one failure triggering another) rises.
        """
        if len(risks) < 2:
            return self._make_risk(
                "cascade_failure",
                0.05,
                "low",
                "No compounding risks detected.",
                "None — system is healthy.",
            )

        high_count = sum(1 for r in risks if r["severity"] in ("CRITICAL", "HIGH"))
        total_count = len(risks)

        # Cascade probability rises with number of concurrent high-severity risks
        if high_count >= 3:
            probability = 0.80
            impact = "severe"
        elif high_count == 2:
            probability = 0.55
            impact = "medium"
        elif high_count == 1 and total_count >= 3:
            probability = 0.35
            impact = "medium"
        else:
            probability = 0.10
            impact = "low"

        severity = _severity(probability, impact)
        high_types = [r["type"] for r in risks if r["severity"] in ("CRITICAL", "HIGH")]
        description = (
            f"{high_count} high-severity risk(s) detected: {', '.join(high_types)}. "
            "Co-occurring risks increase the chance of cascading failures."
        )
        mitigation = (
            "Address HIGH/CRITICAL risks in order of severity. "
            "Consider pausing the loop to perform remediation if cascade probability > 60%. "
            "Introduce circuit-breaker logic to halt the loop when cascade risk is CRITICAL."
        )

        return self._make_risk("cascade_failure", probability, impact,
                                description, mitigation)

    # ── factory ─────────────────────────────────────────────────────────────

    @staticmethod
    def _make_risk(
        risk_type: str,
        probability: float,
        impact: str,
        description: str,
        mitigation: str,
    ) -> Risk:
        return Risk(
            type=risk_type,
            severity=_severity(probability, impact),
            probability=round(probability, 4),
            description=description,
            mitigation=mitigation,
        )


# ─── Entry-point (optional CLI) ───────────────────────────────────────────────

if __name__ == "__main__":
    import pprint

    pe = PredictiveEngine()
    print("=== Risk Summary ===")
    print(pe.get_risk_summary())
    print()
    print("=== Full Analysis ===")
    pprint.pprint(pe.analyze(), width=120)
    print()
    print(f"Predicted next quality: {pe.predict_next_quality():.4f}")
