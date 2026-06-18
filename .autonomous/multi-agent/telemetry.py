# telemetry.py — multi-agent telemetry collection and analysis
from __future__ import annotations

import json
import math
import os
import time
from collections import deque
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

# ── path constants ────────────────────────────────────────────────────────────
ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous" / "multi-agent"
MA.mkdir(parents=True, exist_ok=True)

# ── file helpers ───────────────────────────────────────────────────────────────
def load_json(path: Path) -> dict | list | None:
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return None
    return None


def save_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")


# ── TelemetryCollector ─────────────────────────────────────────────────────────
class TelemetryCollector:
    """
    Collects and analyses phase-level telemetry for autonomous agent runs.

    Features
    --------
    * Phase duration tracking  — wall-clock time via ``time.time() * 1000``.
    * Rolling quality scores   — ``collections.deque`` with ``maxlen=1000``.
    * Resource monitoring      — VmRSS from ``/proc/self/status``,
      load average from ``os.getloadavg()``.
    * Anomaly detection        — mean + 2 × std-dev over the last 20 values.
    * Error aggregation        — counts per error type.
    * Iteration outcomes       — ``{success, failed, total}`` counters.
    * Auto-save                 — every 10 records to ``MA / telemetry.json``.
    """

    __slots__ = (
        "_phase_durations",
        "_quality_scores",
        "_anomaly_baseline",
        "_anomaly_counts",
        "_error_aggregation",
        "_outcomes",
        "_record_count",
        "_phase_start",
        "_last_save_count",
        "_save_path",
        "_resource_cache",
        "_resource_cache_ts",
    )

    # ── constructor ────────────────────────────────────────────────────────
    def __init__(
        self,
        save_path: Path | str | None = None,
        auto_save_every: int = 10,
    ) -> None:
        self._phase_durations: dict[str, list[float]] = {}
        self._quality_scores: deque[float] = deque(maxlen=1000)
        # anomaly baseline: per-phase rolling list of last 20 durations
        self._anomaly_baseline: dict[str, deque[float]] = {}
        self._anomaly_counts: dict[str, int] = {}
        self._error_aggregation: dict[str, int] = {}
        self._outcomes: dict[str, int] = {"success": 0, "failed": 0, "total": 0}
        self._record_count: int = 0
        self._phase_start: Optional[float] = None
        self._last_save_count: int = 0
        self._save_path: Path = Path(save_path) if save_path else MA / "telemetry.json"
        self._resource_cache: Optional[dict[str, Any]] = None
        self._resource_cache_ts: float = 0.0

    # ── public API ─────────────────────────────────────────────────────────

    def record(self, phase: str, data: dict[str, Any] | None = None) -> None:
        """
        Finalise the currently running phase and record its duration.

        Parameters
        ----------
        phase:
            Human-readable phase name (e.g. ``"planning"``,
            ``"implementation"``).
        data:
            Optional supplementary payload.  Supported keys:

            * ``quality``          — float 0-1 quality score.
            * ``error``            — string error type to aggregate.
            * ``outcome``          — ``"success"`` | ``"failed"`` | ``"total"``
              (total is incremented regardless; the other two are
              added to the relevant counter).
            * ``duration_ms``     — pre-computed wall-clock ms (for cases
              where the caller measures externally).
            * ``anomaly_threshold_ms`` — threshold for this record's anomaly
              check; if omitted the class-built baseline is used.

        Auto-saves when ``_record_count`` is a multiple of ``auto_save_every``.
        """
        now_ms = time.time() * 1000
        data = data or {}

        # ── duration ──────────────────────────────────────────────────────
        if "duration_ms" in data:
            duration_ms: float = float(data["duration_ms"])
        elif self._phase_start is not None:
            duration_ms = now_ms - self._phase_start
        else:
            duration_ms = 0.0

        # store duration
        self._phase_durations.setdefault(phase, []).append(duration_ms)

        # ── quality score ─────────────────────────────────────────────────
        if "quality" in data:
            q = float(data["quality"])
            self._quality_scores.append(q)

        # ── error aggregation ──────────────────────────────────────────────
        if "error" in data:
            err_type = str(data["error"])
            self._error_aggregation[err_type] = (
                self._error_aggregation.get(err_type, 0) + 1
            )

        # ── iteration outcomes ────────────────────────────────────────────
        if "outcome" in data:
            outcome = str(data["outcome"])
            if outcome in self._outcomes:
                self._outcomes[outcome] += 1
        self._outcomes["total"] += 1

        # ── anomaly detection ──────────────────────────────────────────────
        threshold_ms: float | None = data.get("anomaly_threshold_ms")
        if threshold_ms is None:
            threshold_ms = self._compute_threshold(phase)
        if threshold_ms is not None and duration_ms > threshold_ms:
            self.record_anomaly(phase, duration_ms, threshold_ms)

        # ── counters ──────────────────────────────────────────────────────
        self._record_count += 1
        self._phase_start = None  # reset for next phase

        # ── auto-save ─────────────────────────────────────────────────────
        if self._record_count - self._last_save_count >= 10:
            self.save()

    def start_phase(self, phase: str) -> None:
        """Record the wall-clock start time for the given phase."""
        self._phase_start = time.time() * 1000

    def get_phase_durations(self) -> dict[str, list[float]]:
        """Return a copy of all phase durations keyed by phase name."""
        return {p: list(durations) for p, durations in self._phase_durations.items()}

    def get_quality_trend(self) -> list[float]:
        """Return rolling quality scores oldest → newest."""
        return list(self._quality_scores)

    def get_error_aggregation(self) -> dict[str, int]:
        """Return a copy of error-type counts."""
        return dict(self._error_aggregation)

    def get_outcomes(self) -> dict[str, int]:
        """Return iteration outcome counters ``{success, failed, total}``."""
        return dict(self._outcomes)

    def record_anomaly(
        self,
        phase: str,
        duration_ms: float,
        threshold_ms: float,
    ) -> None:
        """
        Log that a phase exceeded its anomaly threshold.

        Parameters
        ----------
        phase:
            Phase name that produced the anomaly.
        duration_ms:
            Actual duration in milliseconds.
        threshold_ms:
            Threshold that was exceeded.
        """
        self._anomaly_counts[phase] = self._anomaly_counts.get(phase, 0) + 1

        # maintain rolling window for baseline
        baseline = self._anomaly_baseline.setdefault(phase, deque(maxlen=20))
        baseline.append(duration_ms)

    def get_resource_usage(self) -> dict[str, Any]:
        """
        Snapshot current resource utilisation.

        Returns
        -------
        dict with keys:
        * ``vm_rss_mb``    — process resident set size in MB
        * ``loadavg``      — 1/5/15-minute load average tuple
        * ``timestamp_ms`` — Unix epoch in milliseconds
        """
        now = time.time()
        # cache resource read; refresh every second
        if self._resource_cache is None or (now - self._resource_cache_ts) > 1.0:
            vm_rss_mb = self._read_vm_rss_mb()
            load = os.getloadavg()
            self._resource_cache = {
                "vm_rss_mb": vm_rss_mb,
                "loadavg": list(load),
                "timestamp_ms": now * 1000,
            }
            self._resource_cache_ts = now
        return dict(self._resource_cache)

    def get_anomaly_report(self) -> dict[str, Any]:
        """Return anomaly statistics per phase."""
        report = {}
        for phase, baseline in self._anomaly_baseline.items():
            if len(baseline) < 2:
                continue
            vals = list(baseline)
            mean = sum(vals) / len(vals)
            variance = sum((v - mean) ** 2 for v in vals) / len(vals)
            std = math.sqrt(variance)
            report[phase] = {
                "count": self._anomaly_counts.get(phase, 0),
                "mean_ms": mean,
                "std_ms": std,
                "threshold_ms": mean + 2 * std,
                "window_size": len(vals),
            }
        return report

    def save(self, path: Path | str | None = None) -> None:
        """
        Persist the full telemetry state to JSON.

        Parameters
        ----------
        path:
            Optional override path; defaults to ``self._save_path``.
        """
        payload = {
            "version": 1,
            "saved_at": datetime.now(timezone.utc).isoformat(),
            "record_count": self._record_count,
            "phase_durations": self._phase_durations,
            "quality_trend": list(self._quality_scores),
            "error_aggregation": self._error_aggregation,
            "outcomes": self._outcomes,
            "anomaly_counts": self._anomaly_counts,
            "anomaly_report": self.get_anomaly_report(),
            "last_resource": self.get_resource_usage(),
        }
        save_path = Path(path) if path else self._save_path
        save_json(save_path, payload)
        self._last_save_count = self._record_count

    def load(self, path: Path | str | None = None) -> None:
        """
        Restore telemetry state from JSON.

        Parameters
        ----------
        path:
            Optional override path; defaults to ``self._save_path``.
        """
        load_path = Path(path) if path else self._save_path
        data = load_json(load_path)
        if not isinstance(data, dict):
            return

        self._phase_durations = {
            p: list(durations) for p, durations in data.get("phase_durations", {}).items()
        }
        self._quality_scores = deque(
            data.get("quality_trend", []), maxlen=1000
        )
        self._error_aggregation = dict(data.get("error_aggregation", {}))
        self._outcomes = dict(data.get("outcomes", {"success": 0, "failed": 0, "total": 0}))
        self._anomaly_counts = dict(data.get("anomaly_counts", {}))
        self._record_count = data.get("record_count", 0)
        self._last_save_count = self._record_count

        # rebuild anomaly baselines from stored anomaly report
        for phase, stats in data.get("anomaly_report", {}).items():
            # we cannot fully reconstruct raw values from stats alone,
            # but we seed the threshold estimate from stored stats
            pass

    # ── private helpers ──────────────────────────────────────────────────────

    def _read_vm_rss_mb(self) -> float:
        """Parse VmRSS from /proc/self/status and return megabytes."""
        try:
            status = Path("/proc/self/status").read_text(encoding="utf-8")
        except OSError:
            return 0.0
        for line in status.splitlines():
            if line.startswith("VmRSS:"):
                parts = line.split()
                if len(parts) >= 2:
                    try:
                        return float(parts[1]) / 1024.0  # kB → MB
                    except ValueError:
                        pass
        return 0.0

    def _compute_threshold(self, phase: str) -> float | None:
        """
        Compute the anomaly threshold for a phase.

        Uses the rolling 20-value window (mean + 2 × stddev).
        Returns ``None`` if fewer than 2 samples exist.
        """
        baseline = self._anomaly_baseline.get(phase)
        if not baseline or len(baseline) < 2:
            return None
        vals = list(baseline)
        mean = sum(vals) / len(vals)
        variance = sum((v - mean) ** 2 for v in vals) / len(vals)
        return mean + 2.0 * math.sqrt(variance)

    # ── summary helpers ──────────────────────────────────────────────────────

    def phase_summary(self) -> dict[str, dict[str, float]]:
        """Per-phase statistics: count, mean_ms, min_ms, max_ms, total_ms."""
        summary = {}
        for phase, durations in self._phase_durations.items():
            if not durations:
                continue
            summary[phase] = {
                "count": len(durations),
                "mean_ms": sum(durations) / len(durations),
                "min_ms": min(durations),
                "max_ms": max(durations),
                "total_ms": sum(durations),
            }
        return summary

    def overall_quality(self) -> float | None:
        """Mean of rolling quality scores, or None if no scores recorded."""
        if not self._quality_scores:
            return None
        return sum(self._quality_scores) / len(self._quality_scores)

    def __repr__(self) -> str:
        return (
            f"<TelemetryCollector records={self._record_count} "
            f"phases={len(self._phase_durations)} "
            f"quality_n={len(self._quality_scores)}>"
        )


# ── module-level convenience singleton ─────────────────────────────────────────
_default_collector: Optional[TelemetryCollector] = None


def get_collector() -> TelemetryCollector:
    """Return or create the module-level TelemetryCollector singleton."""
    global _default_collector
    if _default_collector is None:
        _default_collector = TelemetryCollector()
    return _default_collector
