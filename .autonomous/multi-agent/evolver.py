"""
evolver.py — Autonomous Evolution Engine for Akasha

The "brain" of the autonomous loop. Ties together:
  ProjectMap    — what areas need work
  ReasoningChain — deciding what to do
  ContextEngine — knowing the project context
  MemoryManager  — remembering everything
  AdaptivePacer  — quality-gated pacing
  TelemetryCollector — metrics
  PredictiveEngine  — risk-aware planning

Intensity levels (1-10):
  1-3  CONSERVATIVE  — sequential, thorough, low resource
  4-6  BALANCED      — moderate parallelism, standard pacing
  7-10 AGGRESSIVE    — high parallelism, fast pacing
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path
from typing import Any, Generator, TypedDict

# ── Path constants ─────────────────────────────────────────────────────────────

ROOT = Path(__file__).resolve().parent.parent if '__file__' in globals() else Path.cwd()
MA = ROOT / ".autonomous" / "multi-agent"
MEMORY_FILE = MA / "memory.json"
SNAPSHOT_FILE = MA / "context_snapshot.json"
STATE_FILE = MA / "state.json"
EVOLVER_STATE_FILE = MA / "evolver-state.json"
EVOLVER_LOG_FILE = MA / "evolver-log.json"

MA.mkdir(parents=True, exist_ok=True)

# ── Intensity mapping ───────────────────────────────────────────────────────────

# Agents spawned per intensity level (parallelism)
INTENSITY_PARALLELISM = {
    1: 1,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
    7: 6,
    8: 7,
    9: 8,
    10: 8,
}

# Base delay seconds between phases (multiplied by pacer multiplier)
INTENSITY_BASE_DELAY = {
    1: 120.0,
    2: 90.0,
    3: 60.0,
    4: 45.0,
    5: 30.0,
    6: 20.0,
    7: 15.0,
    8: 10.0,
    9: 8.0,
    10: 5.0,
}

# Pacer quality band name per intensity bucket
INTENSITY_PACER_MODE = {
    1: "conservative",
    2: "conservative",
    3: "conservative",
    4: "balanced",
    5: "balanced",
    6: "balanced",
    7: "aggressive",
    8: "aggressive",
    9: "aggressive",
    10: "aggressive",
}

# ── Phase sequence ─────────────────────────────────────────────────────────────

ALL_PHASES = ["RESEARCH", "PLANNING", "IMPLEMENTATION", "QA", "VALIDATION", "RELEASE"]

# ── Quality band thresholds ────────────────────────────────────────────────────

QUALITY_EXCELLENT = 0.95
QUALITY_GOOD = 0.85
QUALITY_FAIR = 0.70
QUALITY_POOR = 0.50

# ── Improvement type taxonomy ─────────────────────────────────────────────────

IMPROVEMENT_TYPES = [
    "bug_fix",
    "performance",
    "test_coverage",
    "typecheck",
    "docs",
    "refactor",
    "security",
    "ux_improvement",
    "dependency_update",
    "ci_improvement",
    "accessibility",
    "architecture",
    "monitoring",
    "missing_tradition",
    "api_design",
]

# ─────────────────────────────────────────────────────────────────────────────
# Typed dicts
# ─────────────────────────────────────────────────────────────────────────────


class Improvement(TypedDict):
    type: str
    area: str
    description: str
    rationale: str
    expected_impact: float  # 0.0-1.0
    risk_level: str  # "low" | "medium" | "high"


class IterationPlan(TypedDict):
    phase_sequence: list[str]
    focus_area: str
    improvements: list[Improvement]
    expected_quality: float
    confidence: float  # 0.0-1.0
    alternatives: list[Improvement]
    reasoning_steps: list[str]


class EvolutionResult(TypedDict):
    iteration: int
    improvements_made: list[Improvement]
    quality_delta: float  # +/-
    reasoning_steps: list[str]
    next_focus_area: str
    duration_s: float
    learnings_stored: int
    phase_durations: dict[str, float]
    success: bool
    error: str | None


class ProjectState(TypedDict):
    overall_quality: float
    area_scores: dict[str, float]  # area -> quality 0-1
    neglected_areas: list[str]
    high_potential: list[str]  # areas with biggest improvement opportunity


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────


def load_json(path: Path, default=None) -> dict | list:
    """Load JSON from *path*, returning *default* if the file is missing or corrupt."""
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            pass
    return default if default is not None else {}


def save_json(path: Path, data: dict | list) -> None:
    """Atomically write *data* as JSON to *path*."""
    content = json.dumps(data, indent=2, default=str, ensure_ascii=False)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(content, encoding="utf-8")
    tmp.replace(path)


def log(msg: str, file: Path | None = None) -> None:
    """Print a timestamped log line to stdout and optionally a file."""
    from datetime import datetime, timezone

    ts = datetime.now(timezone.utc).isoformat(timespec="seconds")
    line = f"[{ts}] [Evolver] {msg}"
    print(line, file=file or sys.stdout)
    if file:
        print(line, file=sys.stdout)


def _clamp(value: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, value))


def _quality_band(q: float) -> str:
    if q >= QUALITY_EXCELLENT:
        return "excellent"
    if q >= QUALITY_GOOD:
        return "good"
    if q >= QUALITY_FAIR:
        return "fair"
    if q >= QUALITY_POOR:
        return "poor"
    return "critical"


# ─────────────────────────────────────────────────────────────────────────────
# EvolverState (persistent small state for the evolver itself)
# ─────────────────────────────────────────────────────────────────────────────


class EvolverState:
    """Small persistent state for the Evolver — iteration counter, intensity, tuning."""

    def __init__(self, path: Path | None = None) -> None:
        self.path = path or EVOLVER_STATE_FILE
        self.iteration: int = 0
        self.intensity: int = 5  # balanced default
        self.total_duration_s: float = 0.0
        self.quality_history: list[float] = []  # EMA-friendly list
        self.focus_area: str = "unknown"
        self.last_plan: dict | None = None
        self.self_optimize_log: list[dict] = []
        self._load()

    def _load(self) -> None:
        data = load_json(self.path, {})
        self.iteration = int(data.get("iteration", 0))
        self.intensity = int(data.get("intensity", 5))
        self.total_duration_s = float(data.get("total_duration_s", 0.0))
        self.quality_history = list(data.get("quality_history", []))[-50:]
        self.focus_area = str(data.get("focus_area", "unknown"))
        self.last_plan = data.get("last_plan")
        self.self_optimize_log = list(data.get("self_optimize_log", []))[-20:]

    def save(self) -> None:
        data = {
            "iteration": self.iteration,
            "intensity": self.intensity,
            "total_duration_s": self.total_duration_s,
            "quality_history": self.quality_history,
            "focus_area": self.focus_area,
            "last_plan": self.last_plan,
            "self_optimize_log": self.self_optimize_log,
        }
        save_json(self.path, data)

    def bump_iteration(self) -> int:
        self.iteration += 1
        return self.iteration

    def record_quality(self, quality: float) -> None:
        self.quality_history.append(float(quality))
        if len(self.quality_history) > 200:
            self.quality_history = self.quality_history[-200:]

    def quality_ema(self, alpha: float = 0.3) -> float | None:
        """Exponential moving average of quality."""
        if not self.quality_history:
            return None
        ema = self.quality_history[0]
        for v in self.quality_history[1:]:
            ema = alpha * v + (1 - alpha) * ema
        return round(ema, 4)

    def set_intensity(self, level: int) -> int:
        self.intensity = max(1, min(10, level))
        return self.intensity

    def get_intensity(self) -> int:
        return self.intensity


# ─────────────────────────────────────────────────────────────────────────────
# ContextEngine — lightweight wrapper around context_bootstrap
# ─────────────────────────────────────────────────────────────────────────────


class ContextEngine:
    """Knows the project context via context_bootstrap snapshot."""

    def __init__(self) -> None:
        self._snapshot: dict = {}
        self._snapshot_mtime: float = 0.0

    def get_snapshot(self, force_refresh: bool = False) -> dict:
        """Return the latest project snapshot, using cache unless forced."""
        try:
            from . import context_bootstrap as cb

            if force_refresh:
                snap = cb.build_snapshot_smart(
                    iteration=0, phase="RESEARCH"
                )
                cb.save_snapshot(snap)
                self._snapshot = snap
                self._snapshot_mtime = time.time()
                return snap

            # Try to load cached snapshot
            snap = cb.load_snapshot()
            if snap:
                self._snapshot = snap
                return snap

            # Build fresh
            snap = cb.build_snapshot_smart(iteration=0, phase="RESEARCH")
            cb.save_snapshot(snap)
            self._snapshot = snap
            self._snapshot_mtime = time.time()
            return snap
        except Exception as e:
            log(f"ContextEngine.get_snapshot error: {e}")
            return self._snapshot

    def get_area_breakdown(self) -> dict[str, float]:
        """Extract area quality scores from snapshot."""
        snap = self._snapshot
        # Snapshot structure varies; extract what we can
        breakdown: dict[str, float] = {}

        # Typecheck section
        triad = snap.get("triad", {})
        if isinstance(triad, dict):
            tc = triad.get("typecheck", {})
            if isinstance(tc, dict):
                passed = tc.get("passed", 0)
                failed = tc.get("failed", 0)
                total = passed + failed
                breakdown["typecheck"] = passed / total if total > 0 else 0.0

            tests = triad.get("tests", {})
            if isinstance(tests, dict):
                passed = tests.get("passed", 0)
                failed = tests.get("failed", 0)
                total = passed + failed
                breakdown["tests"] = passed / total if total > 0 else 0.0

        # Coverage section
        coverage = snap.get("coverage", {})
        if isinstance(coverage, dict):
            cov = float(coverage.get("overall", 0))
            breakdown["coverage"] = cov / 100.0 if cov > 100 else cov

        # Git status (uncommitted = dirty = quality risk)
        git = snap.get("git", {})
        if isinstance(git, dict):
            modified = int(git.get("modified", 0))
            untracked = int(git.get("untracked", 0))
            breakdown["git_clean"] = 1.0 if (modified + untracked) == 0 else 0.5

        # Plans.md status
        plans = snap.get("plans", {})
        if isinstance(plans, dict):
            pending = int(plans.get("pending", 0))
            breakdown["plans_up_to_date"] = 1.0 if pending == 0 else max(0.0, 1.0 - pending / 10)

        return breakdown

    def find_neglected_areas(self, threshold: float = 0.6) -> list[str]:
        """Find areas scoring below threshold."""
        scores = self.get_area_breakdown()
        return [area for area, score in scores.items() if score < threshold]

    def find_high_potential_areas(self, threshold: float = 0.4) -> list[str]:
        """Find areas with low scores that have the most room to improve."""
        scores = self.get_area_breakdown()
        return sorted(scores.items(), key=lambda x: x[1])[:5]


# ─────────────────────────────────────────────────────────────────────────────
# ReasoningChain — decides what to do based on state and memory
# ─────────────────────────────────────────────────────────────────────────────


class ReasoningChain:
    """Decides what to do given project state and learnings."""

    def __init__(self, memory_manager: MemoryManager | None = None) -> None:
        self._mm = memory_manager

    def reason_about_state(self, state: ProjectState) -> list[str]:
        """Generate a list of reasoning steps explaining the current state."""
        steps: list[str] = []
        q = state["overall_quality"]
        band = _quality_band(q)
        steps.append(f"Overall quality is {q:.2f} ({band} band).")

        neglected = state["neglected_areas"]
        if neglected:
            steps.append(f"Neglected areas ({len(neglected)}): {', '.join(neglected)}.")
        else:
            steps.append("No neglected areas detected.")

        high_pot = state["high_potential"]
        if high_pot:
            if isinstance(high_pot, list) and high_pot:
                first = high_pot[0]
                if isinstance(first, tuple):
                    steps.append(f"Highest improvement potential: {first[0]} (score={first[1]:.2f}).")
                else:
                    steps.append(f"Highest improvement potential: {first}.")
            elif isinstance(high_pot, list):
                steps.append(f"High potential areas: {', '.join(str(x) for x in high_pot)}.")

        area_scores = state["area_scores"]
        if area_scores:
            worst = min(area_scores, key=lambda a: area_scores[a])
            worst_q = area_scores[worst]
            steps.append(f"Lowest-scoring area: '{worst}' at {worst_q:.2f}.")

        return steps

    def pick_focus_area(self, state: ProjectState) -> str:
        """Pick the most impactful focus area based on current state."""
        high_pot = state["high_potential"]
        if high_pot:
            if isinstance(high_pot, list) and high_pot:
                first = high_pot[0]
                if isinstance(first, tuple):
                    return str(first[0])
                return str(first)
        # Fall back to worst area
        area_scores = state["area_scores"]
        if area_scores:
            return min(area_scores, key=lambda a: area_scores[a])
        return "general"

    def generate_improvements(
        self,
        state: ProjectState,
        focus_area: str,
        intensity: int,
        recent_learnings: list[dict] | None = None,
    ) -> list[Improvement]:
        """Generate targeted improvements based on state analysis."""
        improvements: list[Improvement] = []
        area_scores = state["area_scores"]
        neglected = set(state["neglected_areas"])

        # Parallelism scales with intensity
        max_improvements = INTENSITY_PARALLELISM[intensity]

        # Build improvements from low-scoring areas
        for area, score in sorted(area_scores.items(), key=lambda x: x[1]):
            if len(improvements) >= max_improvements:
                break
            if area in neglected or score < 0.75:
                imp = self._build_improvement_for_area(area, score, state)
                if imp:
                    improvements.append(imp)

        # If we have fewer than max, add from high-potential areas
        hp = state["high_potential"]
        if isinstance(hp, list):
            for item in hp:
                if len(improvements) >= max_improvements:
                    break
                area_name = item[0] if isinstance(item, tuple) else str(item)
                if area_name not in area_scores:
                    imp = self._build_improvement_for_area(area_name, 0.3, state)
                    if imp:
                        improvements.append(imp)

        return improvements[:max_improvements]

    def _build_improvement_for_area(
        self, area: str, score: float, state: ProjectState
    ) -> Improvement | None:
        """Build an Improvement dict for a specific area."""
        type_map: dict[str, str] = {
            "typecheck": "typecheck",
            "tests": "test_coverage",
            "coverage": "test_coverage",
            "git_clean": "architecture",
            "plans_up_to_date": "docs",
            "performance": "performance",
            "security": "security",
            "accessibility": "accessibility",
            "docs": "docs",
            "refactor": "refactor",
            "dependency_update": "dependency_update",
            "ci_improvement": "ci_improvement",
            "ux_improvement": "ux_improvement",
            "architecture": "architecture",
            "monitoring": "monitoring",
            "missing_tradition": "missing_tradition",
            "api_design": "api_design",
        }
        imp_type = type_map.get(area, "refactor")
        gap = 1.0 - score
        impact = round(min(0.95, gap * 1.5), 3)
        risk = "low" if gap < 0.3 else "medium" if gap < 0.6 else "high"

        descriptions: dict[str, str] = {
            "typecheck": f"Fix typecheck errors in {area} area to raise quality from {score:.0%} to 100%",
            "tests": f"Increase test pass rate in {area} area (current {score:.0%})",
            "coverage": f"Improve code coverage in {area} area (current {score:.0%})",
            "git_clean": f"Clean up uncommitted changes in {area}",
            "plans_up_to_date": f"Update Plans.md for pending items in {area}",
            "architecture": f"Refactor {area} area for better architecture quality",
        }

        return Improvement(
            type=imp_type,
            area=area,
            description=descriptions.get(area, f"Improve {area} area quality from {score:.0%}"),
            rationale=f"Area '{area}' scores {score:.0%}, below threshold. "
            f"Improving it is expected to raise overall quality by ~{impact:.0%}.",
            expected_impact=impact,
            risk_level=risk,
        )

    def compute_confidence(self, improvements: list[Improvement], state: ProjectState) -> float:
        """Compute confidence (0-1) that this plan will succeed."""
        if not improvements:
            return 0.0
        # Base confidence on average expected impact
        avg_impact = sum(i["expected_impact"] for i in improvements) / len(improvements)
        # Reduce by risk
        risk_penalty = sum(
            {"low": 0.0, "medium": 0.1, "high": 0.25}.get(i["risk_level"], 0.15)
            for i in improvements
        ) / len(improvements)
        # Reduce by number of improvements (more things = harder)
        count_penalty = min(0.15, (len(improvements) - 1) * 0.03)
        confidence = max(0.0, min(1.0, avg_impact - risk_penalty - count_penalty))
        return round(confidence, 3)

    def reason_about_plan(self, plan: IterationPlan) -> list[str]:
        """Explain why a particular plan was chosen."""
        steps: list[str] = []
        steps.append(
            f"Plan targets '{plan['focus_area']}' with {len(plan['improvements'])} improvement(s)."
        )
        for imp in plan["improvements"]:
            steps.append(
                f"  → [{imp['type']}] {imp['description']} "
                f"(impact={imp['expected_impact']:.0%}, risk={imp['risk_level']})"
            )
        steps.append(
            f"Expected quality after: {plan['expected_quality']:.2f} "
            f"(confidence={plan['confidence']:.0%})"
        )
        if plan.get("alternatives"):
            steps.append(f"Alternative improvements not chosen: {len(plan['alternatives'])}")
        return steps


# ─────────────────────────────────────────────────────────────────────────────
# ProjectMap — maps project structure and identifies work areas
# ─────────────────────────────────────────────────────────────────────────────


class ProjectMap:
    """Understands what areas exist in the project and their current state."""

    def __init__(self) -> None:
        self._areas: dict[str, dict] = {}
        self._load()

    def _load(self) -> None:
        """Load area map from snapshot."""
        try:
            from . import context_bootstrap as cb

            snap = cb.load_snapshot()
            self._areas = self._parse_snapshot_areas(snap)
        except Exception:
            self._areas = self._get_default_areas()

    def _parse_snapshot_areas(self, snap: dict) -> dict[str, dict]:
        """Extract area information from snapshot."""
        areas: dict[str, dict] = {}

        # Packages/apps from the monorepo
        package_names = []
        try:
            pkg_file = ROOT / "package.json"
            if pkg_file.exists():
                pkg_data = json.loads(pkg_file.read_text())
                package_names = list(pkg_data.get("workspaces", {}).get("packages", []))
        except Exception:
            pass

        # Infer areas from directory structure
        src_dirs = list((ROOT / "apps").glob("*")) + list((ROOT / "packages").glob("*"))
        for d in src_dirs:
            if d.is_dir() and not d.name.startswith("."):
                areas[d.name] = {
                    "path": str(d),
                    "quality": 0.5,  # unknown
                    "last_changed": None,
                }

        # Triad areas
        triad = snap.get("triad", {})
        if isinstance(triad, dict):
            for key in ["typecheck", "tests", "lint"]:
                if key in triad:
                    areas[key] = {
                        "path": key,
                        "quality": 0.5,
                        "last_changed": None,
                    }

        return areas

    def _get_default_areas(self) -> dict[str, dict]:
        return {
            "typecheck": {"path": "triad/typecheck", "quality": 0.5, "last_changed": None},
            "tests": {"path": "triad/tests", "quality": 0.5, "last_changed": None},
            "lint": {"path": "triad/lint", "quality": 0.5, "last_changed": None},
            "coverage": {"path": "coverage", "quality": 0.5, "last_changed": None},
            "general": {"path": str(ROOT), "quality": 0.5, "last_changed": None},
        }

    def get_areas(self) -> dict[str, dict]:
        return dict(self._areas)

    def update_area_quality(self, area: str, quality: float) -> None:
        if area in self._areas:
            self._areas[area]["quality"] = _clamp(quality)
        else:
            self._areas[area] = {
                "path": area,
                "quality": _clamp(quality),
                "last_changed": time.time(),
            }

    def area_scores(self) -> dict[str, float]:
        """Return area name -> quality score mapping."""
        return {name: info["quality"] for name, info in self._areas.items()}


# ─────────────────────────────────────────────────────────────────────────────
# Evolver
# ─────────────────────────────────────────────────────────────────────────────


class Evolver:
    """
    Autonomous evolution brain.

    Orchestrates the full evolve → plan → assess → self-optimize cycle,
    integrating all subsystems.

    Parameters
    ----------
    intensity : int
        Initial intensity level 1-10 (default 5). Affects parallelism and pacing.
    """

    def __init__(self, intensity: int = 5) -> None:
        # Core subsystems
        self._state = EvolverState()
        self._state.set_intensity(intensity)
        self._ctx = ContextEngine()
        self._reasoning = ReasoningChain()
        self._project_map = ProjectMap()

        # Lazy-loaded subsystems (initialized on first use to avoid circular imports)
        self._mm: MemoryManager | None = None
        self._pacer: AdaptivePacer | None = None
        self._telemetry: TelemetryCollector | None = None
        self._predictive: PredictiveEngine | None = None

        # Phase tracking
        self._phase_start: float = 0.0
        self._current_phase: str = "idle"
        self._phase_durations: dict[str, float] = {}

        log(f"Evolver initialised at intensity={intensity}")

    # ── Subsystem lazy-accessors ───────────────────────────────────────────────

    @property
    def mm(self) -> MemoryManager:
        if self._mm is None:
            try:
                from .memory_manager import MemoryManager

                self._mm = MemoryManager()
            except Exception as e:
                log(f"MemoryManager unavailable: {e}; using in-memory fallback")
                self._mm = _MemoryManagerFallback()
        return self._mm

    @property
    def pacer(self) -> AdaptivePacer:
        if self._pacer is None:
            try:
                from .adaptive_pacer import get_pacer

                self._pacer = get_pacer()
            except Exception as e:
                log(f"AdaptivePacer unavailable: {e}; using no-op pacer")
                self._pacer = _NoopPacer()
        return self._pacer

    @property
    def telemetry(self) -> TelemetryCollector:
        if self._telemetry is None:
            try:
                from .telemetry import TelemetryCollector

                self._telemetry = TelemetryCollector()
            except Exception as e:
                log(f"TelemetryCollector unavailable: {e}; using no-op telemetry")
                self._telemetry = _NoopTelemetry()
        return self._telemetry

    @property
    def predictive(self) -> PredictiveEngine:
        if self._predictive is None:
            try:
                from .predictive_engine import PredictiveEngine

                self._predictive = PredictiveEngine()
            except Exception as e:
                log(f"PredictiveEngine unavailable: {e}; using no-op predictive")
                self._predictive = _NoopPredictive()
        return self._predictive

    # ── Intensity ─────────────────────────────────────────────────────────────

    def get_intensity(self) -> int:
        """Current evolution intensity (1-10 scale)."""
        return self._state.get_intensity()

    def set_intensity(self, level: int) -> int:
        """
        Adjust evolution intensity.

        Levels 1-3:  CONSERVATIVE — sequential, thorough, low resource
        Levels 4-6:  BALANCED    — moderate parallelism
        Levels 7-10: AGGRESSIVE  — high parallelism, fast pacing
        """
        prev = self._state.get_intensity()
        actual = self._state.set_intensity(level)
        log(f"Intensity changed: {prev} → {actual}")
        return actual

    # ── Assessment ─────────────────────────────────────────────────────────────

    def assess_project_state(self) -> ProjectState:
        """
        Assess the current state of the project across all known areas.

        Combines:
        - ContextEngine area breakdown
        - ProjectMap quality scores
        - Telemetry quality trends
        - MemoryManager recent learnings

        Returns
        -------
        ProjectState
            {overall_quality, area_scores, neglected_areas, high_potential}
        """
        # Get area breakdown from context
        area_scores = self._ctx.get_area_breakdown()

        # Merge with project map scores
        pm_scores = self._project_map.area_scores()
        for area, score in pm_scores.items():
            if area not in area_scores:
                area_scores[area] = score

        # Inject telemetry-based quality estimate
        tel_quality = self.telemetry.overall_quality()
        if tel_quality is not None:
            area_scores["telemetry_quality"] = tel_quality

        # Predict next quality from predictive engine
        try:
            pred_quality = self.predictive.predict_next_quality()
            area_scores["predicted_quality"] = pred_quality
        except Exception:
            pred_quality = None

        # Overall quality = blend of context scores + telemetry + EMA
        if area_scores:
            raw_overall = sum(area_scores.values()) / len(area_scores)
        else:
            raw_overall = 0.5

        # Blend with telemetry quality if available
        if tel_quality is not None:
            overall = 0.6 * raw_overall + 0.4 * tel_quality
        else:
            overall = raw_overall

        # Blend with predictive if available
        if pred_quality is not None:
            overall = 0.7 * overall + 0.3 * pred_quality

        # Blend with evolver state EMA
        ema_q = self._state.quality_ema()
        if ema_q is not None:
            overall = 0.5 * overall + 0.5 * ema_q

        overall = round(_clamp(overall), 4)

        # Neglected = below 60%
        neglected = [a for a, s in area_scores.items() if s < 0.6]

        # High potential = sorted by score ascending, top 5 with score < 0.8
        high_potential = sorted(
            [(a, s) for a, s in area_scores.items() if s < 0.8],
            key=lambda x: x[1],
        )[:5]

        log(
            f"assess_project_state → overall={overall:.2f}, "
            f"neglected={neglected}, high_potential={len(high_potential)} areas"
        )

        return ProjectState(
            overall_quality=overall,
            area_scores=area_scores,
            neglected_areas=neglected,
            high_potential=high_potential,
        )

    # ── Planning ───────────────────────────────────────────────────────────────

    def plan_next_iteration(self, project_state: ProjectState) -> IterationPlan:
        """
        Decide the next iteration's focus area and improvements.

        Uses:
        - ReasoningChain to generate improvements
        - PredictiveEngine to adjust for risk
        - AdaptivePacer to gate on quality

        Parameters
        ----------
        project_state : ProjectState
            Current assessed state from assess_project_state()

        Returns
        -------
        IterationPlan
        """
        intensity = self._state.get_intensity()
        reasoning_steps: list[str] = []

        # Reasoning about state
        state_reasoning = self._reasoning.reason_about_state(project_state)
        reasoning_steps.extend(state_reasoning)

        # Check predictive risks
        try:
            risk_analysis = self.predictive.analyze()
            risks = risk_analysis.get("risks", [])
            if risks:
                reasoning_steps.append(
                    f"Active risks ({len(risks)}): "
                    f"{', '.join(r['type'] for r in risks[:3])}"
                )
        except Exception as e:
            reasoning_steps.append(f"Risk analysis skipped: {e}")

        # Apply pacer quality gate
        pacer = self.pacer
        pace = pacer.get_pace()
        reasoning_steps.append(
            f"Pacer: state={pace['state']}, multiplier={pace['multiplier']:.2f}"
        )

        # If in PAUSE, still plan but warn
        if pace["state"] == "PAUSE":
            reasoning_steps.append(
                "⚠️  Pacer is PAUSED — planning only, no implementation until quality recovers."
            )

        # Pick focus area
        focus_area = self._reasoning.pick_focus_area(project_state)
        reasoning_steps.append(f"Selected focus area: '{focus_area}'")

        # Get recent learnings to avoid repeating
        try:
            recent_learnings = self.mm.retrieve(focus_area, limit=5, use_decay=False)
            recent_types = [l.learning_type for l in recent_learnings]
        except Exception:
            recent_learnings = []
            recent_types = []

        if recent_types:
            reasoning_steps.append(
                f"Recent learnings in '{focus_area}': {', '.join(set(recent_types))}"
            )

        # Generate improvements
        improvements = self._reasoning.generate_improvements(
            project_state, focus_area, intensity, recent_types
        )

        # Filter improvements already recently attempted
        if recent_types:
            filtered = [
                i for i in improvements if i["type"] not in recent_types
            ]
            if filtered:
                improvements = filtered
                reasoning_steps.append(
                    f"Filtered to {len(improvements)} improvements after dedup."
                )

        # Compute confidence
        confidence = self._reasoning.compute_confidence(improvements, project_state)
        reasoning_steps.append(f"Plan confidence: {confidence:.0%}")

        # Expected quality after improvements
        if improvements:
            avg_impact = sum(i["expected_impact"] for i in improvements) / len(improvements)
            # Adjust by confidence and pacer multiplier
            pacer_mult = pace.get("multiplier", 1.0)
            expected = project_state["overall_quality"] + avg_impact * confidence * pacer_mult
        else:
            expected = project_state["overall_quality"]

        expected = round(_clamp(expected), 4)

        # Phase sequence based on improvements and pacer state
        if pace["state"] == "PAUSE":
            phase_sequence = ["RESEARCH", "PLANNING"]  # no-op loop until quality recovers
        else:
            phase_sequence = list(ALL_PHASES)

        reasoning_steps.append(f"Phase sequence: {' → '.join(phase_sequence)}")

        # Alternatives: improvements not selected (for explainability)
        all_improvements = self._reasoning.generate_improvements(
            project_state, focus_area, intensity, recent_types
        )
        selected_ids = {(i["type"], i["area"]) for i in improvements}
        alternatives = [
            i for i in all_improvements
            if (i["type"], i["area"]) not in selected_ids
        ][:5]

        plan = IterationPlan(
            phase_sequence=phase_sequence,
            focus_area=focus_area,
            improvements=improvements,
            expected_quality=expected,
            confidence=confidence,
            alternatives=alternatives,
            reasoning_steps=reasoning_steps,
        )

        # Persist last plan
        self._state.last_plan = dict(plan)
        self._state.focus_area = focus_area
        self._state.save()

        return plan

    def explain_plan(self, plan: IterationPlan) -> str:
        """
        Return a human-readable explanation of why a plan was chosen.

        Parameters
        ----------
        plan : IterationPlan

        Returns
        -------
        str
            Multi-line explanation string.
        """
        lines: list[str] = []
        lines.append("=" * 60)
        lines.append("EVOLUTION PLAN EXPLANATION")
        lines.append("=" * 60)
        lines.append("")
        lines.append(f"Focus area : {plan['focus_area']}")
        lines.append(f"Confidence : {plan['confidence']:.0%}")
        lines.append(f"Expected quality after : {plan['expected_quality']:.2f}")
        lines.append(f"Improvements planned : {len(plan['improvements'])}")
        lines.append(f"Phase sequence : {' → '.join(plan['phase_sequence'])}")
        lines.append("")
        lines.append("Reasoning steps:")
        for step in plan.get("reasoning_steps", []):
            lines.append(f"  • {step}")
        lines.append("")
        lines.append("Improvements:")
        if plan["improvements"]:
            for i, imp in enumerate(plan["improvements"], 1):
                lines.append(
                    f"  {i}. [{imp['type']}] {imp['description']}  "
                    f"(impact={imp['expected_impact']:.0%}, risk={imp['risk_level']})"
                )
                lines.append(f"     Rationale: {imp['rationale']}")
        else:
            lines.append("  (no improvements selected — project appears healthy)")
        lines.append("")
        if plan.get("alternatives"):
            lines.append(
                f"Alternatives not chosen ({len(plan['alternatives'])}): "
                f"{', '.join(i['type'] for i in plan['alternatives'])}"
            )
        lines.append("=" * 60)
        return "\n".join(lines)

    # ── Core evolve ────────────────────────────────────────────────────────────

    def evolve(self) -> EvolutionResult:
        """
        Execute one full evolution iteration.

        The iteration runs:
          1. assess_project_state()  → ProjectState
          2. plan_next_iteration()   → IterationPlan
          3. Run phase sequence with AdaptivePacer gating
          4. Record learnings in MemoryManager
          5. Update TelemetryCollector
          6. Return EvolutionResult

        Returns
        -------
        EvolutionResult
        """
        iteration = self._state.bump_iteration()
        start_time = time.time()
        self._phase_durations = {}

        log(f"=== Evolve iteration {iteration} starting ===")

        reasoning_steps: list[str] = []
        improvements_made: list[Improvement] = []
        learnings_stored = 0
        success = True
        error: str | None = None
        prev_quality = self._state.quality_ema() or self._state.quality_history[-1] if self._state.quality_history else 0.5

        try:
            # ── Phase 1: Assess ────────────────────────────────────────────────
            self._run_phase("ASSESS", lambda: self.assess_project_state())
            project_state = self.assess_project_state()
            reasoning_steps.append(
                f"Assessed project quality={project_state['overall_quality']:.2f}"
            )

            # ── Phase 2: Plan ─────────────────────────────────────────────────
            self._run_phase("PLAN", lambda: self.plan_next_iteration(project_state))
            plan = self.plan_next_iteration(project_state)
            reasoning_steps.extend(plan.get("reasoning_steps", []))
            self._state.last_plan = dict(plan)

            # ── Phase 3: Execute improvements (IMPLEMENTATION + QA) ────────────
            if plan["improvements"] and plan["phase_sequence"]:
                pace = self.pacer.get_pace()
                if pace["state"] != "PAUSE":
                    # Execute improvements via existing evolution loop infrastructure
                    exec_result = self._execute_improvements(plan["improvements"])
                    improvements_made = exec_result["improvements_made"]
                    success = exec_result["success"]
                    error = exec_result.get("error")
                    reasoning_steps.append(exec_result.get("summary", ""))
                    if not success:
                        reasoning_steps.append(f"⚠️  Execution issue: {error}")

            # ── Phase 4: Quality gate via pacer ────────────────────────────────
            self._run_phase("QA_GATE", lambda: None)
            new_quality = project_state["overall_quality"]
            quality_delta = round(new_quality - prev_quality, 4)

            # Feed quality back to pacer
            try:
                self.pacer.record_quality(new_quality)
            except Exception as e:
                reasoning_steps.append(f"Pacer record_quality skipped: {e}")

            # Record in telemetry
            try:
                self.telemetry.record("evolve", data={"quality": new_quality})
            except Exception as e:
                reasoning_steps.append(f"Telemetry record skipped: {e}")

            # ── Phase 5: Store learnings ───────────────────────────────────────
            self._run_phase("LEARN", lambda: None)
            try:
                learnings_stored = self._store_learnings(
                    iteration, project_state, plan, improvements_made, success
                )
            except Exception as e:
                reasoning_steps.append(f"Store learnings failed: {e}")

            # ── Phase 6: Predictive analysis ─────────────────────────────────
            try:
                risk_summary = self.predictive.get_risk_summary()
                reasoning_steps.append(f"Risk posture: {risk_summary}")
            except Exception as e:
                reasoning_steps.append(f"Risk analysis skipped: {e}")

            # Record quality in evolver state
            self._state.record_quality(new_quality)
            self._state.save()

        except Exception as e:
            success = False
            error = str(e)
            reasoning_steps.append(f"Evolve iteration failed: {error}")
            log(f"Evolve iteration {iteration} ERROR: {e}")

        duration_s = round(time.time() - start_time, 2)
        self._state.total_duration_s += duration_s

        log(
            f"=== Evolve iteration {iteration} done "
            f"(success={success}, duration={duration_s:.1f}s, "
            f"learnings={learnings_stored}) ==="
        )

        return EvolutionResult(
            iteration=iteration,
            improvements_made=improvements_made,
            quality_delta=quality_delta,
            reasoning_steps=reasoning_steps,
            next_focus_area=self._state.focus_area,
            duration_s=duration_s,
            learnings_stored=learnings_stored,
            phase_durations=dict(self._phase_durations),
            success=success,
            error=error,
        )

    def _run_phase(self, phase: str, fn) -> Any:
        """Run a named phase with telemetry timing."""
        self._phase_start = time.time()
        self._current_phase = phase
        self.telemetry.start_phase(phase)
        try:
            result = fn()
            return result
        finally:
            elapsed = time.time() - self._phase_start
            self._phase_durations[phase] = round(elapsed, 3)
            self.telemetry.record(phase, data={"duration_ms": elapsed * 1000})
            self._current_phase = "idle"

    def _execute_improvements(
        self, improvements: list[Improvement]
    ) -> dict:
        """
        Execute improvements using the existing evolution loop infrastructure.

        Tries to delegate to the existing akasha-evolution-loop execute_parallel_improvements
        function, falling back to a no-op if unavailable.
        """
        try:
            from .akasha_evolution_loop import execute_parallel_improvements

            # Convert Improvement to the format expected by execute_parallel_improvements
            candidates = []
            for imp in improvements:
                candidates.append({
                    "type": imp["type"],
                    "area": imp["area"],
                    "description": imp["description"],
                    "rationale": imp["rationale"],
                    "expected_impact": imp["expected_impact"],
                    "risk": imp["risk_level"],
                })

            max_workers = INTENSITY_PARALLELISM[self._state.get_intensity()]
            all_ok, summary, results = execute_parallel_improvements(
                improvements=candidates, max_workers=max_workers
            )
            # Convert results back to Improvement format
            made: list[Improvement] = []
            for r in results:
                if r.get("status") == "success" or r.get("applied") is True:
                    made.append(
                        Improvement(
                            type=r.get("type", "unknown"),
                            area=r.get("area", "unknown"),
                            description=r.get("description", ""),
                            rationale=r.get("rationale", ""),
                            expected_impact=r.get("expected_impact", 0.0),
                            risk_level=r.get("risk", "medium"),
                        )
                    )
            return {
                "improvements_made": made,
                "success": all_ok,
                "summary": summary,
                "error": None if all_ok else summary,
            }
        except Exception as e:
            log(f"execute_parallel_improvements unavailable: {e}")
            return {
                "improvements_made": [],
                "success": False,
                "summary": "Improvements not executed (loop infrastructure unavailable)",
                "error": str(e),
            }

    def _store_learnings(
        self,
        iteration: int,
        state: ProjectState,
        plan: IterationPlan,
        improvements: list[Improvement],
        success: bool,
    ) -> int:
        """Store learnings in MemoryManager for exponential memory."""
        stored = 0
        for imp in improvements:
            try:
                self.mm.store(
                    {
                        "iteration": iteration,
                        "learning_type": imp["type"],
                        "area": imp["area"],
                        "description": imp["description"],
                        "outcome": "success" if success else "partial",
                        "quality_delta": 0.0,  # would need post-fix measurement
                        "focus_area": plan["focus_area"],
                    }
                )
                stored += 1
            except Exception as e:
                log(f"mm.store failed: {e}")
        # Store an overall iteration learning
        try:
            self.mm.store(
                {
                    "iteration": iteration,
                    "learning_type": "iteration_summary",
                    "area": plan["focus_area"],
                    "description": (
                        f"Iteration {iteration}: {len(improvements)} improvements, "
                        f"quality={state['overall_quality']:.2f}, success={success}"
                    ),
                    "outcome": "success" if success else "failed",
                    "quality_delta": state["overall_quality"],
                    "focus_area": plan["focus_area"],
                }
            )
            stored += 1
        except Exception as e:
            log(f"mm.store iteration summary failed: {e}")
        return stored

    # ── Autonomous loop ────────────────────────────────────────────────────────

    def run_autonomous_loop(
        self, num_iterations: int | None = None
    ) -> Generator[EvolutionResult, None, None]:
        """
        Run the autonomous evolution loop continuously.

        Parameters
        ----------
        num_iterations : int | None
            Number of iterations to run. None = run forever (until stopped).

        Yields
        ------
        EvolutionResult
            Result of each iteration.

        The loop:
          evolve() → record result → apply pacer delay → repeat

        Stop by breaking the generator (Ctrl-C or external signal).
        """
        iteration_count = 0
        intensity = self._state.get_intensity()
        base_delay = INTENSITY_BASE_DELAY[intensity]

        log(f"Starting autonomous loop (num_iterations={num_iterations}, intensity={intensity})")

        try:
            while True:
                iteration_count += 1

                # Check stop signal
                stop_file = ROOT / ".autonomous" / "state" / "stop.signal"
                if stop_file.exists():
                    log("Stop signal detected — exiting autonomous loop.")
                    break

                # Run one evolution iteration
                result = self.evolve()
                yield result

                # Check iteration limit
                if num_iterations is not None and iteration_count >= num_iterations:
                    log(f"Reached iteration limit ({num_iterations}) — exiting loop.")
                    break

                # Pacer delay between iterations
                if num_iterations != 1:  # No delay for single-shot
                    pace = self.pacer.get_pace()
                    mult = pace.get("multiplier", 1.0)
                    delay = base_delay * mult
                    log(
                        f"Iteration {iteration_count} complete. "
                        f"Pacing: {delay:.1f}s (mult={mult:.2f}, state={pace['state']})"
                    )
                    time.sleep(delay)

        except KeyboardInterrupt:
            log("Autonomous loop interrupted by user.")
        finally:
            self._state.save()
            self.telemetry.save()
            log(f"Autonomous loop exited after {iteration_count} iterations.")

    # ── Self-optimization ──────────────────────────────────────────────────────

    def self_optimize(self) -> dict:
        """
        Analyse own performance and adjust evolution strategy.

        Looks at:
        - Iteration duration trends
        - Quality trend (EMA slope)
        - Failure rate
        - Phase-level anomaly reports
        - Intensity vs outcome effectiveness

        Returns
        -------
        dict
            {adjustments: [str], recommended_intensity: int, insights: [str]}
        """
        insights: list[str] = []
        adjustments: list[str] = []
        current_intensity = self._state.get_intensity()

        # Quality trend analysis
        ema_q = self._state.quality_ema(alpha=0.3)
        if ema_q is not None:
            insights.append(f"Quality EMA: {ema_q:.4f} (band: {_quality_band(ema_q)})")
        else:
            insights.append("Quality EMA: insufficient data")

        # Duration analysis
        total_dur = self._state.total_duration_s
        iter_count = self._state.iteration
        if iter_count > 0:
            avg_dur = total_dur / iter_count
            insights.append(f"Avg iteration duration: {avg_dur:.1f}s (total: {total_dur:.1f}s)")

            # Flag slow iterations
            if avg_dur > 300:
                adjustments.append(
                    f"Avg iteration too slow ({avg_dur:.0f}s > 300s). "
                    "Consider reducing intensity or limiting improvement scope."
                )
        else:
            insights.append("No iterations completed yet.")

        # Phase anomaly report
        try:
            anomaly = self.telemetry.get_anomaly_report()
            if anomaly:
                slow_phases = [
                    f"{phase}: {stats['mean_ms']:.0f}ms (threshold: {stats['threshold_ms']:.0f}ms)"
                    for phase, stats in anomaly.items()
                    if stats["count"] > 0
                ]
                if slow_phases:
                    insights.append(f"Anomalous phases: {slow_phases}")
        except Exception as e:
            insights.append(f"Anomaly report unavailable: {e}")

        # Predictive risk analysis
        try:
            risk_analysis = self.predictive.analyze()
            active_risks = risk_analysis.get("risks", [])
            if active_risks:
                insights.append(
                    f"Active risks ({len(active_risks)}): "
                    f"{', '.join(r['type'] for r in active_risks)}"
                )
                # Auto-de-escalate on critical risks
                critical = [r for r in active_risks if r.get("severity") == "CRITICAL"]
                if critical and current_intensity > 3:
                    adjustments.append(
                        f"CRITICAL risk detected — reducing intensity {current_intensity} → 3 "
                        "(conservative mode until risk clears)"
                    )
                    self._state.set_intensity(3)
                    current_intensity = 3
        except Exception as e:
            insights.append(f"Risk analysis unavailable: {e}")

        # Outcomes analysis
        try:
            outcomes = self.telemetry.get_outcomes()
            total = outcomes.get("total", 0)
            if total > 0:
                success_rate = outcomes.get("success", 0) / total
                insights.append(f"Success rate: {success_rate:.0%} ({outcomes['success']}/{total})")
                if success_rate < 0.5 and current_intensity > 4:
                    adjustments.append(
                        f"Success rate low ({success_rate:.0%}) — reducing intensity "
                        f"{current_intensity} → 4 (balanced)"
                    )
                    self._state.set_intensity(4)
                    current_intensity = 4
        except Exception:
            pass

        # Pacer state awareness
        try:
            pace = self.pacer.get_pace()
            pacer_state = pace.get("state", "UNKNOWN")
            insights.append(f"Pacer state: {pacer_state}")
            if pacer_state == "PAUSE" and current_intensity > 2:
                adjustments.append(
                    "Pacer is PAUSED — auto-reducing to conservative intensity."
                )
                self._state.set_intensity(2)
                current_intensity = 2
            elif pacer_state == "FAST" and current_intensity < 7:
                adjustments.append(
                    "Pacer is FAST and quality is high — safe to increase intensity."
                )
                suggested = min(10, current_intensity + 2)
                self._state.set_intensity(suggested)
                adjustments.append(f"Increased intensity: {current_intensity} → {suggested}")
                current_intensity = suggested
        except Exception as e:
            insights.append(f"Pacer analysis unavailable: {e}")

        # Record self-optimization in state
        optimization_record = {
            "timestamp": time.time(),
            "iterations": iter_count,
            "quality_ema": ema_q,
            "avg_duration_s": total_dur / iter_count if iter_count > 0 else 0,
            "intensity_after": current_intensity,
            "adjustments": adjustments,
            "insights": insights,
        }
        self._state.self_optimize_log.append(optimization_record)
        if len(self._state.self_optimize_log) > 20:
            self._state.self_optimize_log = self._state.self_optimize_log[-20:]
        self._state.save()

        log(f"self_optimize → intensity={current_intensity}, adjustments={len(adjustments)}")

        return {
            "adjustments": adjustments,
            "recommended_intensity": current_intensity,
            "insights": insights,
            "record": optimization_record,
        }


# ─────────────────────────────────────────────────────────────────────────────
# Fallback no-op implementations for when subsystems are unavailable
# ─────────────────────────────────────────────────────────────────────────────


class _MemoryManagerFallback:
    """In-memory fallback when MemoryManager is unavailable."""

    def __init__(self) -> None:
        self._learnings: list[dict] = []
        self._iteration = 0

    @property
    def current_iteration(self) -> int:
        return self._iteration

    def store(self, learning: dict) -> dict:
        from datetime import datetime, timezone

        if "id" not in learning:
            learning["id"] = f"lrn_{len(self._learnings)}_{int(time.time()*1000)}"
        learning["timestamp"] = datetime.now(timezone.utc).isoformat()
        self._learnings.append(learning)
        return learning

    def retrieve(self, query: str, limit: int = 10, use_decay: bool = True) -> list:
        q = query.lower()
        return [
            type("L", (), d)()  # duck-type as Learning
            for d in self._learnings[-limit:]
            if q in str(d.get("description", "")).lower()
            or q in str(d.get("learning_type", "")).lower()
        ][:limit]


class _NoopPacer:
    """No-op pacer when AdaptivePacer is unavailable."""

    def get_pace(self) -> dict:
        return {"state": "NORMAL", "multiplier": 1.0, "quality_ema": 0.85}

    def record_quality(self, quality: float) -> None:
        pass


class _NoopTelemetry:
    """No-op telemetry when TelemetryCollector is unavailable."""

    def record(self, phase: str, data: dict | None = None) -> None:
        pass

    def start_phase(self, phase: str) -> None:
        pass

    def overall_quality(self) -> float | None:
        return None

    def get_outcomes(self) -> dict:
        return {"success": 0, "failed": 0, "total": 0}

    def get_anomaly_report(self) -> dict:
        return {}

    def save(self) -> None:
        pass


class _NoopPredictive:
    """No-op predictive engine when PredictiveEngine is unavailable."""

    def analyze(self) -> dict:
        return {"risks": []}

    def predict_next_quality(self) -> float:
        return 0.5

    def get_risk_summary(self) -> str:
        return "No predictive data available."


# ─────────────────────────────────────────────────────────────────────────────
# Module-level convenience API
# ─────────────────────────────────────────────────────────────────────────────

_default_evolver: Evolver | None = None


def get_evolver(intensity: int = 5) -> Evolver:
    """Return or create the module-level Evolver singleton."""
    global _default_evolver
    if _default_evolver is None:
        _default_evolver = Evolver(intensity=intensity)
    return _default_evolver


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────


def _cli() -> None:
    """Simple CLI for manual evolver inspection and control."""
    import argparse

    parser = argparse.ArgumentParser(description="Evolver CLI")
    parser.add_argument("--intensity", type=int, default=5, help="Intensity level 1-10")
    parser.add_argument("--assess", action="store_true", help="Run assess_project_state() and exit")
    parser.add_argument("--plan", action="store_true", help="Run plan_next_iteration() and exit")
    parser.add_argument("--evolve", action="store_true", help="Run one evolve() iteration and exit")
    parser.add_argument(
        "--loop", type=int, nargs="?", const=None, help="Run autonomous loop (default: infinite)"
    )
    parser.add_argument("--self-optimize", action="store_true", help="Run self_optimize() and exit")
    parser.add_argument("--explain", action="store_true", help="Explain the last plan")
    parser.add_argument("--set-intensity", type=int, help="Set intensity and exit")
    args = parser.parse_args()

    ev = get_evolver(intensity=args.intensity)

    if args.set_intensity is not None:
        actual = ev.set_intensity(args.set_intensity)
        print(f"Intensity set to {actual}")
        return

    if args.assess:
        state = ev.assess_project_state()
        print(json.dumps(state, indent=2, default=str))
        return

    if args.plan:
        state = ev.assess_project_state()
        plan = ev.plan_next_iteration(state)
        print(json.dumps(plan, indent=2, default=str))
        return

    if args.evolve:
        result = ev.evolve()
        print(json.dumps(result, indent=2, default=str))
        return

    if args.self_optimize:
        opt = ev.self_optimize()
        print(json.dumps(opt, indent=2, default=str))
        return

    if args.explain:
        state_file = EVOLVER_STATE_FILE
        plan_data = load_json(state_file, {}).get("last_plan")
        if plan_data:
            plan = IterationPlan(**plan_data)
            print(ev.explain_plan(plan))
        else:
            print("No plan to explain.")
        return

    if args.loop is not None:
        count = args.loop
        print(f"Starting autonomous loop (iterations={count}, intensity={ev.get_intensity()})")
        for result in ev.run_autonomous_loop(num_iterations=count):
            print(f"[iter {result['iteration']}] success={result['success']} "
                  f"duration={result['duration_s']:.1f}s "
                  f"improvements={len(result['improvements_made'])}")
        return

    parser.print_help()


if __name__ == "__main__":
    _cli()
