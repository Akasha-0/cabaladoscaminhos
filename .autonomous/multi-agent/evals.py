"""
Akasha Evolution Loop — Evals Framework
Tracks per-phase metrics, improvement quality, and iteration-over-iteration trends.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous" / "multi-agent"
METRICS_FILE = MA / "metrics.json"
MEMORY_FILE = MA / "memory.json"
STATE_FILE = MA / "state.json"
TASK_FILE = MA / "task-implementation.json"
RESULTS_FILE = MA / "omp-agent-results.json"


def _load_json(path: Path, default=None):
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            return default if default is not None else {}
    return default if default is not None else {}


def _save_json(path: Path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))


# ── Metric definitions ─────────────────────────────────────────────────────────

PHASE_METRICS: dict[str, list[str]] = {
    "RESEARCH": [
        "candidates_found",
        "candidates_selected",
        "selection_quality",     # did selected lead to completed improvements?
        "no_improvement_found",  # boolean
    ],
    "PLANNING": [
        "plans_created",
        "plans_detail_level",    # avg chars per plan line
        "plans_updated",         # boolean – did we append to Plans.md?
    ],
    "IMPLEMENTATION": [
        "agents_spawned",
        "results_collected",
        "agent_success_rate",    # 0.0–1.0
        "files_changed",
    ],
    "QA": [
        "typecheck_pass",
        "tests_pass",
        "improvements_accepted",  # number accepted by QA
    ],
    "VALIDATION": [
        "improvements_validated",
        "quality_score",           # 0.0–1.0 composite
        "codegraph_sync_ok",
        "plans_marked",
    ],
    "RELEASE": [
        "release_quality",         # 0.0–1.0
        "commit_messages_clean",
        "changelog_updated",
        "version_bumped",
        "iteration_advanced",
    ],
}

COMPOSITE_SCORES = {
    "implementation_quality": ["agent_success_rate", "files_changed"],
    "qa_quality": ["typecheck_pass", "tests_pass", "improvements_accepted"],
    "loop_quality": ["selection_quality", "release_quality"],
}


# ── Phase duration tracking ────────────────────────────────────────────────────

_phase_timers: dict[str, float] = {}   # phase -> start time (idempotent)
_active_phase: str | None = None       # one active phase at a time


def phase_start(phase: str) -> None:
    """Idempotent: only starts if no phase is currently active."""
    global _active_phase
    if _active_phase is None:
        _phase_timers[phase] = _now_ms()
        _active_phase = phase


def phase_end(phase: str) -> float:
    """
    Idempotent: only ends the phase that is currently active.
    Returns 0.0 and records nothing if no matching phase is active.
    """
    global _active_phase
    if _active_phase != phase:
        return 0.0
    start = _phase_timers.pop(phase, None)
    _active_phase = None
    if start is None:
        return 0.0
    return (_now_ms() - start) / 1000.0


def _now_ms() -> float:
    return datetime.now(timezone.utc).timestamp() * 1000


# ── Main tracker ───────────────────────────────────────────────────────────────

class MetricsTracker:
    def __init__(self, metrics_file: Path = METRICS_FILE):
        self.metrics_file = metrics_file
        self.data: dict[str, Any] = _load_json(metrics_file, {
            "version": 1,
            "history": [],        # list of iteration dicts, newest last
            "phase_history": [],  # list of phase records
        })

    # ── Persistence ────────────────────────────────────────────────────────────

    def save(self) -> None:
        _save_json(self.metrics_file, self.data)

    # ── Recording ─────────────────────────────────────────────────────────────

    def record_phase(self, phase: str, metrics: dict[str, Any],
                     duration_s: float = 0.0) -> None:
        """
        Record metrics for a single phase completion.
        """
        iteration = _load_json(STATE_FILE, {}).get("iteration", 0)

        record = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "phase": phase,
            "iteration": iteration,
            "duration_s": round(duration_s, 3),
            "metrics": metrics,
        }

        self.data.setdefault("phase_history", []).append(record)
        self.save()

    def record_research(self, candidates_found: int, candidates_selected: int,
                        selection_quality: float = 0.0,
                        no_improvement_found: bool = False,
                        duration_s: float = 0.0) -> None:
        self.record_phase("RESEARCH", {
            "candidates_found": candidates_found,
            "candidates_selected": candidates_selected,
            "selection_quality": selection_quality,
            "no_improvement_found": no_improvement_found,
        }, duration_s)

    def record_planning(self, plans_created: int,
                        plans_detail_level: float = 0.0,
                        plans_updated: bool = False,
                        duration_s: float = 0.0) -> None:
        self.record_phase("PLANNING", {
            "plans_created": plans_created,
            "plans_detail_level": round(plans_detail_level, 3),
            "plans_updated": plans_updated,
        }, duration_s)

    def record_implementation(self,
                               agents_spawned: int,
                               results_collected: int,
                               agent_success_rate: float = 0.0,
                               files_changed: int = 0,
                               duration_s: float = 0.0) -> None:
        self.record_phase("IMPLEMENTATION", {
            "agents_spawned": agents_spawned,
            "results_collected": results_collected,
            "agent_success_rate": round(agent_success_rate, 3),
            "files_changed": files_changed,
        }, duration_s)

    def record_qa(self,
                   typecheck_pass: bool,
                   tests_pass: bool,
                   improvements_accepted: int = 0,
                   duration_s: float = 0.0) -> None:
        self.record_phase("QA", {
            "typecheck_pass": typecheck_pass,
            "tests_pass": tests_pass,
            "improvements_accepted": improvements_accepted,
        }, duration_s)

    def record_validation(self,
                          improvements_validated: int,
                          quality_score: float = 0.0,
                          codegraph_sync_ok: bool = False,
                          plans_marked: bool = False,
                          duration_s: float = 0.0) -> None:
        self.record_phase("VALIDATION", {
            "improvements_validated": improvements_validated,
            "quality_score": round(quality_score, 3),
            "codegraph_sync_ok": codegraph_sync_ok,
            "plans_marked": plans_marked,
        }, duration_s)

    def record_release(self,
                        release_quality: float = 0.0,
                        commit_messages_clean: bool = True,
                        changelog_updated: bool = False,
                        version_bumped: bool = False,
                        iteration_advanced: bool = False,
                        iteration: int | None = None,
                        duration_s: float = 0.0) -> None:
        """Called at end of phase_release(). Records the full iteration outcome."""
        # Accept explicit iteration to avoid timing bug when state is incremented first
        iteration = iteration if iteration is not None else _load_json(STATE_FILE, {}).get("iteration", 0)
        # Fetch what we can from this iteration's phase_history
        iter_records = [r for r in self.data.get("phase_history", [])
                        if r.get("iteration") == iteration]

        # Compute composite scores
        impl = next((r for r in iter_records if r["phase"] == "IMPLEMENTATION"), {})
        qa   = next((r for r in iter_records if r["phase"] == "QA"), {})

        def _rate(m: dict, *keys):
            vals = [m.get("metrics", {}).get(k, 0) for k in keys]
            non_zero = [v for v in vals if v != 0]
            return sum(non_zero) / len(non_zero) if non_zero else 0.0

        impl_quality = _rate(impl, "agent_success_rate")
        qa_quality   = _rate(qa, "typecheck_pass", "tests_pass", "improvements_accepted")

        iteration_record = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "iteration": iteration,
            "duration_s": round(duration_s, 3),
            "release_quality": round(release_quality, 3),
            "impl_quality": round(impl_quality, 3),
            "qa_quality": round(qa_quality, 3),
            "loop_quality": round(
                0.4 * (release_quality or 0) +
                0.3 * impl_quality +
                0.3 * qa_quality, 3),
            "commit_messages_clean": commit_messages_clean,
            "changelog_updated": changelog_updated,
            "version_bumped": version_bumped,
            "iteration_advanced": iteration_advanced,
            "phase_count": len(iter_records),
        }

        self.data.setdefault("history", []).append(iteration_record)
        self.save()

    # ── Trend analysis ─────────────────────────────────────────────────────────

    def iter_records(self, n: int | None = None):
        """Return last n iteration records (newest last)."""
        hist = self.data.get("history", [])
        if n is None:
            return hist
        return hist[-n:] if n > 0 else hist

    def phase_records(self, phase: str, n: int | None = None):
        """Return last n phase records for a given phase."""
        recs = [r for r in self.data.get("phase_history", [])
                if r.get("phase") == phase]
        if n is None:
            return recs
        return recs[-n:] if n > 0 else recs

    def trend(self, metric: str, n: int = 10) -> list[tuple[int, Any]]:
        """
        Returns [(iteration, value), …] for the given metric across
        iteration records. Works for flat metrics inside history items.
        """
        result = []
        for rec in self.iter_records(n):
            v = rec.get(metric, None)
            if v is not None:
                result.append((rec.get("iteration", 0), v))
        return result

    def phase_trend(self, phase: str, metric: str, n: int = 10
                    ) -> list[tuple[int, float]]:
        """Returns [(iteration, value), …] for a metric inside a phase record."""
        result = []
        for rec in self.phase_records(phase, n):
            v = rec.get("metrics", {}).get(metric, None)
            if v is not None:
                result.append((rec.get("iteration", 0), v))
        return result

    def summary(self) -> dict[str, Any]:
        """Produce a human-readable summary dict for the last iteration."""
        hist = self.data.get("history", [])
        phase_hist = self.data.get("phase_history", [])
        last_iter = hist[-1] if hist else {}
        last_phase = phase_hist[-1] if phase_hist else {}

        # Aggregate trends over last 5 iterations
        recent = self.iter_records(5)
        loop_qualities = [r.get("loop_quality", 0) for r in recent]
        impl_qualities = [r.get("impl_quality", 0) for r in recent]
        qa_qualities  = [r.get("qa_quality", 0) for r in recent]

        avg = lambda lst: sum(lst) / len(lst) if lst else 0.0
        slope = lambda lst: (lst[-1] - lst[0]) / max(len(lst) - 1, 1) if len(lst) > 1 else 0.0

        return {
            "total_iterations": len(hist),
            "total_phases_recorded": len(phase_hist),
            "last_iteration": last_iter.get("iteration", "?"),
            "last_phase": last_phase.get("phase", "?"),
            "last_loop_quality": last_iter.get("loop_quality", 0.0),
            "last_impl_quality": last_iter.get("impl_quality", 0.0),
            "last_qa_quality": last_iter.get("qa_quality", 0.0),
            "avg_loop_quality_5": round(avg(loop_qualities), 3),
            "avg_impl_quality_5": round(avg(impl_qualities), 3),
            "avg_qa_quality_5": round(avg(qa_qualities), 3),
            "loop_quality_trend_5": round(slope(loop_qualities), 4),
            "impl_quality_trend_5": round(slope(impl_qualities), 4),
            "qa_quality_trend_5": round(slope(qa_qualities), 4),
            "iterations_recorded": [r.get("iteration", 0) for r in recent],
        }


# ── Singleton ─────────────────────────────────────────────────────────────────

_tracker: MetricsTracker | None = None


def get_tracker() -> MetricsTracker:
    global _tracker
    if _tracker is None:
        _tracker = MetricsTracker()
    return _tracker


def record(phase: str, metrics: dict, duration_s: float = 0.0) -> None:
    get_tracker().record_phase(phase, metrics, duration_s)
