#!/usr/bin/env python3
"""
smart_iterator.py — Intelligent iteration prioritizer for the autonomous loop.

Uses ProjectMap to guide research toward neglected areas and high-potential
improvements. Tracks iteration history to avoid re-working the same areas
repeatedly, and scores candidates based on: recency, technical debt level,
user impact, ease of implementation, and compounding effect.

Priority formula (0–100):
    score = (area_neglect × 0.30) + (potential × 0.30) + (compounding × 0.20) + (ease × 0.20)

Public API
----------
SmartIterator(intensity?)          — create (optionally pass intensity 1–10)
si.prioritize(improvements, project_map, memory) -> list
    Sort a list of improvement candidates by smart priority.
si.get_next_research_focus() -> dict | None
    Returns {area, reason, priority_score, what_to_look_for} for the top focus area.
si.should_revisit(area, memory) -> bool
    True if the area has NOT been meaningfully improved in the last 14 days.
si.suggest_improvement_types(area) -> list[dict]
    Returns ranked improvement suggestions for the area.
si.track_improvement(area, improvement_type, outcome)
    Record an improvement so it influences future prioritization.
si.get_neglected_priority() -> list[dict]
    Returns areas ranked by days_since_improvement × potential_score.
si.calculate_compounding_score(improvement) -> float
    Returns 0–1 score: does improving X make Y easier?
si.get_area_debt_score(area) -> float
    Returns 0–100 technical-debt score for an area.
si.build_focus_context(iteration_goal) -> dict
    Returns area context useful for the current iteration goal.
si.get_weighted_priority(improvement, project_map, memory) -> float
    Internal helper: compute the composite priority score.
"""

from __future__ import annotations

import json
import math
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

# ── Path constants ─────────────────────────────────────────────────────────────

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous" / "multi-agent"
MEMORY_FILE = MA / "memory.json"
HISTORY_FILE = MA / "smart_iterator_history.json"

# ── Constants ──────────────────────────────────────────────────────────────────

# Days after which an area is considered "neglected" if not improved
NEGLECT_THRESHOLD_DAYS = 30.0
# Days after which an area can be revisited even if recently touched
REVISIT_COOLDOWN_DAYS = 14.0
# Maximum days to consider for recency scoring (caps the curve)
MAX_RECENCY_DAYS = 90.0
# Minimum days between same-area improvements to count as "new" work
IMPROVEMENT_DEBOUNCE_DAYS = 7.0

# Compounding multipliers for foundational areas
FOUNDATIONAL_AREAS: dict[str, float] = {
    "Auth": 1.5,
    "Build/Infra": 1.4,
    "Database/Prisma": 1.3,
    "Autonomous loop": 1.3,
    "API/Logic": 1.2,
}

# Ease multipliers — smaller/focused work scores higher
EASE_BASE_LINES = 200          # files under this are "small"
EASE_MEDIUM_LINES = 800        # files over this are "large"
HIGH_EASE_TYPES = {"coverage", "docs", "freshness", "small_refactor", "a11y", "types"}

# Priority weights
W_NEGLECT = 0.30
W_POTENTIAL = 0.30
W_COMPOUNDING = 0.20
W_EASE = 0.20

# ── Low-level JSON helpers ─────────────────────────────────────────────────────


def load_json(path: Path) -> dict[str, Any] | None:
    """Load JSON from file, returning None on failure."""
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return None


def save_json(path: Path, data: dict[str, Any]) -> bool:
    """Atomically write data to JSON file."""
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_suffix(".tmp")
        with open(tmp, "w", encoding="utf-8") as fh:
            json.dump(data, fh, indent=2, default=str)
        tmp.replace(path)
        return True
    except (OSError, TypeError):
        return False


def log(msg: str, file=None) -> None:
    """Print msg with UTC timestamp prefix."""
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
    print(f"{ts}  [smart_iterator] {msg}", file=file or sys.stdout, flush=True)


def timestamp_now() -> float:
    """Return current Unix timestamp."""
    return datetime.now(timezone.utc).timestamp()


def days_ago(timestamp: float) -> float:
    """Return approximate days since the given Unix timestamp."""
    return (timestamp_now() - timestamp) / 86400.0


def iso_to_timestamp(iso: str) -> float:
    """Parse ISO datetime string to Unix timestamp."""
    try:
        return datetime.fromisoformat(iso.replace("Z", "+00:00")).timestamp()
    except (ValueError, AttributeError):
        return 0.0


# ── Improvement type taxonomy ───────────────────────────────────────────────────

IMPROVEMENT_TYPES = [
    "coverage",      # Add or improve tests
    "tech_debt",     # Refactor, clean up, remove dead code
    "large_file",    # Split oversized files
    "console_cleanup",  # Remove debug / leftover console.log
    "missing_tests", # No tests at all
    "a11y",          # Accessibility improvements
    "types",         # TypeScript type safety
    "docs",          # Documentation
    "perf",          # Performance improvements
    "security",      # Security hardening
    "freshness",     # Update stale content
    "small_refactor",  # Small targeted refactors
    "api",           # API design / contracts
    "error",         # Error handling
    "migration",     # Database migrations
    "ci",            # CI/CD improvements
    "docker",        # Docker / container improvements
    "build",         # Build system improvements
    "crosslink",     # Cross-referencing / linking
    "structure",     # Structural improvements
]

IMPROVEMENT_TYPE_EASE: dict[str, float] = {
    "coverage": 0.7,
    "docs": 0.8,
    "freshness": 0.8,
    "small_refactor": 0.75,
    "a11y": 0.7,
    "types": 0.65,
    "perf": 0.5,
    "security": 0.4,
    "tech_debt": 0.45,
    "large_file": 0.4,
    "console_cleanup": 0.9,
    "missing_tests": 0.6,
    "api": 0.5,
    "error": 0.6,
    "migration": 0.4,
    "ci": 0.55,
    "docker": 0.5,
    "build": 0.45,
    "crosslink": 0.8,
    "structure": 0.5,
}

# ── Iteration history ──────────────────────────────────────────────────────────


class IterationHistory:
    """
    Persistent record of improvements made per area.

    Stored in HISTORY_FILE as:
    {
      "improvements": [
        {
          "area": "UI/Design",
          "type": "coverage",
          "outcome": "success",
          "timestamp": 1234567890.0,
          "iso": "2024-01-01T00:00:00+00:00",
          "version": "0.82.0",
          "lines_changed": 150,
          "files_changed": 3,
          "quality_delta": +5.2,
        },
        ...
      ]
    }
    """

    def __init__(self, history_file: Path | None = None):
        self.history_file = history_file or HISTORY_FILE
        self._cache: dict[str, Any] | None = None

    def _load(self) -> dict[str, Any]:
        if self._cache is None:
            raw = load_json(self.history_file)
            self._cache = raw if isinstance(raw, dict) else {"improvements": []}
            if "improvements" not in self._cache:
                self._cache["improvements"] = []
        return self._cache

    def _save(self) -> None:
        if self._cache is not None:
            save_json(self.history_file, self._cache)

    def record(
        self,
        area: str,
        improvement_type: str,
        outcome: str,
        version: str = "",
        lines_changed: int = 0,
        files_changed: int = 0,
        quality_delta: float = 0.0,
    ) -> None:
        """Record an improvement to an area."""
        data = self._load()
        entry = {
            "area": area,
            "type": improvement_type,
            "outcome": outcome,
            "timestamp": timestamp_now(),
            "iso": datetime.now(timezone.utc).isoformat(),
            "version": version,
            "lines_changed": lines_changed,
            "files_changed": files_changed,
            "quality_delta": quality_delta,
        }
        data["improvements"].append(entry)
        # Keep last 500 entries to avoid unbounded growth
        if len(data["improvements"]) > 500:
            data["improvements"] = data["improvements"][-500:]
        self._save()
        log(f"tracked improvement: {area}/{improvement_type} → {outcome}")

    def last_improvement(self, area: str) -> dict[str, Any] | None:
        """Return the most recent improvement entry for an area, or None."""
        data = self._load()
        for entry in reversed(data.get("improvements", [])):
            if entry.get("area") == area:
                return entry
        return None

    def recent_areas(self, max_days: float = 14.0) -> set[str]:
        """Return area names that have been improved in the last max_days."""
        data = self._load()
        cutoff = timestamp_now() - (max_days * 86400)
        return {
            e["area"]
            for e in data.get("improvements", [])
            if e.get("timestamp", 0) >= cutoff
        }

    def improvements_in_area(self, area: str, max_entries: int = 20) -> list[dict[str, Any]]:
        """Return recent improvement entries for an area."""
        data = self._load()
        return [
            e for e in reversed(data.get("improvements", []))
            if e.get("area") == area
        ][:max_entries]

    def area_stats(self, area: str) -> dict[str, Any]:
        """Return summary stats for an area based on recorded history."""
        entries = self.improvements_in_area(area, max_entries=100)
        if not entries:
            return {
                "total_improvements": 0,
                "last_improvement": None,
                "days_since": None,
                "success_rate": None,
                "avg_quality_delta": 0.0,
            }
        last = entries[0]
        outcomes = [e.get("outcome") for e in entries]
        successes = sum(1 for o in outcomes if o == "success")
        deltas = [e.get("quality_delta", 0) for e in entries if e.get("quality_delta") is not None]
        return {
            "total_improvements": len(entries),
            "last_improvement": last.get("iso"),
            "days_since": round(days_ago(last.get("timestamp", 0)), 1),
            "success_rate": round(successes / len(outcomes), 2) if outcomes else None,
            "avg_quality_delta": round(sum(deltas) / len(deltas), 2) if deltas else 0.0,
        }


# ── SmartIterator ──────────────────────────────────────────────────────────────


class SmartIterator:
    """
    Intelligent iteration prioritizer.

    Scores improvement candidates by:
      - Area neglect  (30%): how long since this area was meaningfully improved
      - Potential     (30%): how much room for improvement the area has
      - Compounding   (20%): does improving this area unlock other improvements?
      - Ease          (20%): is this a small/focused change or a large refactor?
    """

    def __init__(self, intensity: int = 5):
        """
        Create a SmartIterator.

        Args:
            intensity: 1–10. Higher = prefer low-risk/easy changes.
                      Lower = tackle hard/structural problems.
        """
        self.intensity = max(1, min(10, intensity))
        self._history = IterationHistory()

    # ── Public API ─────────────────────────────────────────────────────────────

    def prioritize(
        self,
        improvements: list[dict[str, Any]],
        project_map: Any,
        memory: dict[str, Any],
    ) -> list[dict[str, Any]]:
        """
        Sort a list of improvement candidates by smart priority score.

        Each candidate dict should contain at least:
          - area: str
          - type: str  (improvement type, e.g. "coverage", "tech_debt")
          Optionally: files_changed, lines_changed, quality_delta, version

        Returns the same dicts, each enriched with a "priority_score" key
        and sorted descending.
        """
        scored = []
        for imp in improvements:
            score = self.get_weighted_priority(imp, project_map, memory)
            scored.append({**imp, "priority_score": round(score, 3)})

        scored.sort(key=lambda x: x["priority_score"], reverse=True)
        log(f"prioritize: ranked {len(scored)} candidates (top={scored[0]['area'] if scored else 'none'})")
        return scored

    def get_weighted_priority(
        self,
        improvement: dict[str, Any],
        project_map: Any,
        memory: dict[str, Any],
    ) -> float:
        """Compute the composite priority score for a single improvement."""
        area = improvement.get("area", "")
        imp_type = improvement.get("type", "")

        neglect = self._calc_neglect_score(area)
        potential = self._calc_potential_score(area, project_map)
        compounding = self.calculate_compounding_score(improvement)
        ease = self._calc_ease_score(improvement)

        score = (
            neglect * W_NEGLECT
            + potential * W_POTENTIAL
            + compounding * W_COMPOUNDING
            + ease * W_EASE
        )
        return min(100.0, max(0.0, score))

    def get_next_research_focus(self) -> dict[str, Any] | None:
        """
        Return the top area that deserves research attention now.

        Returns:
            dict with keys: area, reason, priority_score, what_to_look_for
            None if no valid focus area can be determined.
        """
        neglected = self.get_neglected_priority()
        if not neglected:
            return None

        top = neglected[0]
        area = top["area"]
        reason = self._build_focus_reason(area, top)

        # What to look for based on area
        what = self._research_hints(area)

        return {
            "area": area,
            "reason": reason,
            "priority_score": round(top["potential_score"] * (1 + top["days_since_improvement"] / 60)),  # enrich
            "what_to_look_for": what,
        }

    def should_revisit(self, area: str, memory: dict[str, Any]) -> bool:
        """
        Return True if the given area has NOT been meaningfully improved
        in the last REVISIT_COOLDOWN_DAYS (14 days).

        Uses iteration history to determine recency.
        """
        last = self._history.last_improvement(area)
        if last is None:
            # Never improved — definitely revisit
            return True
        days = days_ago(last.get("timestamp", 0))
        if days < REVISIT_COOLDOWN_DAYS:
            return False
        # Even within cooldown, revisit if it was a failure
        if last.get("outcome") == "failure":
            return True
        return True

    def suggest_improvement_types(self, area: str) -> list[dict[str, str]]:
        """
        Return ranked improvement suggestions for the named area.

        Returns a list of dicts: [{"type": "...", "suggestion": "...", "priority": "..."}]
        """
        # Delegate to ProjectMap's suggestion engine when available
        try:
            from project_map import SuggestionEngine, PROJECT_AREAS
            area_config = PROJECT_AREAS.get(area, {})
            area_data = {
                "quality_score": 50,
                "coverage_estimate": 0.3,
                "activity_level": "unknown",
            }
            engine = SuggestionEngine(area, area_data)
            return engine.get()
        except Exception:
            pass

        # Fallback suggestions
        return self._generic_suggestions(area)

    def track_improvement(
        self,
        area: str,
        improvement_type: str,
        outcome: str,
        version: str = "",
        lines_changed: int = 0,
        files_changed: int = 0,
        quality_delta: float = 0.0,
    ) -> None:
        """
        Record an improvement to the persistent history.

        Args:
            area: project area name (e.g. "UI/Design")
            improvement_type: one of IMPROVEMENT_TYPES
            outcome: "success" | "partial" | "failure"
            version: current version string
            lines_changed: approximate lines added/removed
            files_changed: number of files modified
            quality_delta: estimated quality score change (+/-)
        """
        self._history.record(
            area=area,
            improvement_type=improvement_type,
            outcome=outcome,
            version=version,
            lines_changed=lines_changed,
            files_changed=files_changed,
            quality_delta=quality_delta,
        )

    def get_neglected_priority(self) -> list[dict[str, Any]]:
        """
        Return all areas ranked by neglect × potential.

        Returns a list of dicts:
          [{"area": str, "days_since_improvement": float,
            "potential_score": float, "reason": str}, ...]
        """
        try:
            from project_map import get_map
            pm = get_map()
            neglected_map = pm.get_neglected_areas(threshold_days=NEGLECT_THRESHOLD_DAYS)
        except Exception as e:
            log(f"get_neglected_priority: could not load project_map: {e}")
            neglected_map = []

        result = []
        for entry in neglected_map:
            area = entry.get("area_name", entry.get("area", ""))
            days = entry.get("days_since_modified") or entry.get("days_since_improvement", 0)
            potential = entry.get("improvement_potential", entry.get("potential_score", 50))

            # Weight by historical recency
            last = self._history.last_improvement(area)
            if last:
                hist_days = days_ago(last.get("timestamp", 0))
                # Use the more recent of file-system age or history age
                days = min(days, hist_days)

            score = potential * (1 + days / 60)
            result.append({
                "area": area,
                "days_since_improvement": round(days, 1),
                "potential_score": round(potential, 1),
                "weighted_score": round(score, 2),
                "reason": f"neglected {days:.0f}d, potential={potential:.0f}",
            })

        result.sort(key=lambda x: x["weighted_score"], reverse=True)
        return result

    def calculate_compounding_score(self, improvement: dict[str, Any]) -> float:
        """
        Return 0–1 score: does improving X unlock or accelerate other improvements?

        Foundational areas (Auth, Build/Infra, Database/Prisma, Autonomous loop)
        score higher because improving them makes everything else easier.
        """
        area = improvement.get("area", "")
        imp_type = improvement.get("type", "")
        multiplier = FOUNDATIONAL_AREAS.get(area, 1.0)

        # High-impact improvement types compound better
        compounding_types = {"tech_debt", "types", "coverage", "build", "migration", "ci"}
        type_bonus = 1.2 if imp_type in compounding_types else 1.0

        # Base score: foundation areas start at 0.7
        base = 0.5
        if area in FOUNDATIONAL_AREAS:
            base = 0.7

        score = base * multiplier / 1.5 * type_bonus
        return min(1.0, round(score, 3))

    def get_area_debt_score(self, area: str) -> float:
        """
        Return 0–100 technical debt score for an area.

        Combines:
          - Low test coverage → high debt
          - Many large files → high debt
          - Activity is "neglected" → high debt
          - Few recent improvements → high debt
        """
        debt = 0.0

        # Coverage gap
        try:
            from project_map import get_map
            pm = get_map()
            scan = pm.scan()
            area_data = scan.get(area, {})
            coverage = area_data.get("coverage_estimate", 0.5)
            debt += (1.0 - coverage) * 30

            quality = area_data.get("quality_score", 50)
            debt += (100 - quality) * 0.3

            activity = area_data.get("activity_level", "unknown")
            if activity == "neglected":
                debt += 20
            elif activity == "stale":
                debt += 10

            file_count = area_data.get("file_count", 0)
            if file_count == 0:
                debt += 15
        except Exception:
            debt += 25  # assume moderate debt if we can't check

        # Historical: lots of small console_cleanup / large_file entries = debt
        entries = self._history.improvements_in_area(area, max_entries=50)
        debt += len([e for e in entries if e.get("type") in {"large_file", "tech_debt"}]) * 2

        return min(100.0, round(debt, 1))

    def build_focus_context(self, iteration_goal: str) -> dict[str, Any]:
        """
        Build a context dict for the current iteration goal.

        Args:
            iteration_goal: free-text description of what the iteration aims to achieve.

        Returns a dict with:
          - target_areas: ranked list of areas to focus on
          - suggestions: per-area improvement suggestions
          - neglected_areas: areas that have been ignored
          - high_debt_areas: areas with most technical debt
          - key_insights: text summary of what to prioritize
        """
        try:
            from project_map import get_map
            pm = get_map()
            scan = pm.scan()
        except Exception as e:
            log(f"build_focus_context: project_map unavailable: {e}")
            scan = {}

        # Determine which areas are most relevant to the goal
        goal_lower = iteration_goal.lower()
        goal_keywords: dict[str, list[str]] = {
            "UI/Design": ["ui", "design", "component", "frontend", "accessibility", "a11y"],
            "API/Logic": ["api", "logic", "business", "service", "endpoint"],
            "Database/Prisma": ["database", "prisma", "schema", "migration", "query"],
            "Auth": ["auth", "security", "session", "login", "permission"],
            "Tests/QA": ["test", "qa", "coverage", "e2e", "integration"],
            "Build/Infra": ["build", "docker", "infra", "deploy", "ci", "cd"],
            "Docs": ["doc", "readme", "spec", "decision"],
            "Grimoire": ["grimoire", "knowledge", "wisdom"],
            "Autonomous loop": ["loop", "agent", "autonomous", "evolution"],
        }

        area_scores: dict[str, float] = {}
        for area, keywords in goal_keywords.items():
            matches = sum(1 for kw in keywords if kw in goal_lower)
            area_scores[area] = matches * 20.0

        # Add neglect + potential base scores
        neglected = self.get_neglected_priority()
        neglected_set = {e["area"] for e in neglected}
        for entry in neglected:
            area_scores[entry["area"]] = area_scores.get(entry["area"], 0) + entry["weighted_score"] * 0.5

        # Rank areas for this goal
        ranked_areas = sorted(area_scores.items(), key=lambda x: x[1], reverse=True)
        target_areas = [area for area, score in ranked_areas if score > 0]

        # Suggestions per area
        suggestions: dict[str, list[dict[str, str]]] = {}
        for area in target_areas[:5]:
            suggestions[area] = self.suggest_improvement_types(area)

        # High debt areas
        debt_scores: list[tuple[str, float]] = []
        for area in set(list(scan.keys()) + list(FOUNDATIONAL_AREAS.keys())):
            debt_scores.append((area, self.get_area_debt_score(area)))
        debt_scores.sort(key=lambda x: x[1], reverse=True)
        high_debt_areas = [
            {"area": area, "debt_score": score}
            for area, score in debt_scores[:5]
        ]

        # Key insight text
        if target_areas:
            top = target_areas[0]
            top_reason = ""
            for e in neglected:
                if e["area"] == top:
                    top_reason = e["reason"]
                    break
            key_insight = (
                f"For '{iteration_goal}', prioritize {top}. "
                f"{top_reason}. "
                f"{len(target_areas)-1} other area(s) also relevant."
            )
        else:
            key_insight = f"No specific area matches '{iteration_goal}' — default to highest-potential neglected area."

        return {
            "iteration_goal": iteration_goal,
            "target_areas": target_areas,
            "suggestions": suggestions,
            "neglected_areas": neglected[:5],
            "high_debt_areas": high_debt_areas,
            "key_insight": key_insight,
            "focus_area": target_areas[0] if target_areas else None,
        }

    # ── Private helpers ───────────────────────────────────────────────────────

    def _calc_neglect_score(self, area: str) -> float:
        """
        Compute 0–1 area-neglect score.
        0 = recently touched, 1 = deeply neglected.
        """
        last = self._history.last_improvement(area)
        if last is None:
            return 1.0

        days = days_ago(last.get("timestamp", 0))
        # Log curve: 0 days → 0, 30 days → ~0.7, 90+ days → 1.0
        score = math.log1p(days) / math.log1p(MAX_RECENCY_DAYS)
        return min(1.0, round(score, 3))

    def _calc_potential_score(self, area: str, project_map: Any) -> float:
        """
        Compute 0–1 improvement-potential score from ProjectMap.
        """
        try:
            if hasattr(project_map, "scan"):
                scan = project_map.scan()
                area_data = scan.get(area, {})
                potential = area_data.get("improvement_potential", 50)
                return round(potential / 100.0, 3)
            elif isinstance(project_map, dict):
                potential = project_map.get(area, {}).get("improvement_potential", 50)
                return round(potential / 100.0, 3)
        except Exception:
            pass
        return 0.5  # neutral if unavailable

    def _calc_ease_score(self, improvement: dict[str, Any]) -> float:
        """
        Compute 0–1 ease score: smaller focused changes score higher.
        """
        imp_type = improvement.get("type", "")
        base_ease = IMPROVEMENT_TYPE_EASE.get(imp_type, 0.5)

        # Intensity modifier: high intensity → prefer easy; low intensity → tackle hard
        intensity_factor = 0.5 + (self.intensity / 10.0) * 0.5  # 0.5 at intensity 1, 1.0 at intensity 10
        ease = base_ease * intensity_factor

        # File-size modifier
        lines = improvement.get("lines_changed", 0)
        if lines > 0:
            if lines < EASE_BASE_LINES:
                ease = min(1.0, ease * 1.2)
            elif lines > EASE_MEDIUM_LINES:
                ease = ease * 0.7

        return min(1.0, round(ease, 3))

    def _build_focus_reason(self, area: str, entry: dict[str, Any]) -> str:
        """Build a human-readable reason string for focusing on an area."""
        days = entry.get("days_since_improvement", 0)
        potential = entry.get("potential_score", 0)
        debt = self.get_area_debt_score(area)
        stats = self._history.area_stats(area)

        reasons = []
        if days > 60:
            reasons.append(f" severely neglected ({days:.0f} days)")
        elif days > 30:
            reasons.append(f" neglected ({days:.0f} days)")
        if potential > 70:
            reasons.append(f" very high potential ({potential:.0f})")
        elif potential > 50:
            reasons.append(f" moderate potential ({potential:.0f})")
        if debt > 60:
            reasons.append(f" high tech debt ({debt:.0f})")
        if stats.get("success_rate") == 0 and stats.get("total_improvements", 0) > 0:
            reasons.append(" previous attempts had mixed outcomes")
        elif stats.get("success_rate", 1) >= 0.8 and stats.get("total_improvements", 0) > 2:
            reasons.append(" historically high success rate here")

        if not reasons:
            reasons.append(f" area needs attention (potential={potential:.0f})")
        return "".join(reasons).strip()

    def _research_hints(self, area: str) -> list[str]:
        """Return what to research/look for in a given area."""
        hints: dict[str, list[str]] = {
            "UI/Design": [
                "Find components without test coverage",
                "Check for accessibility violations (missing ARIA, contrast issues)",
                "Look for large files (1000+ lines) that need splitting",
                "Find non-responsive breakpoints",
            ],
            "API/Logic": [
                "Identify functions with 'any' types",
                "Find unhandled promise rejections",
                "Look for missing error boundaries",
                "Check for N+1 query patterns in service layer",
            ],
            "Database/Prisma": [
                "Review schema for missing indexes on FK columns",
                "Check for Prisma queries inside loops",
                "Find missing migration files for schema changes",
                "Look for raw SQL that could use Prisma instead",
            ],
            "Auth": [
                "Verify session refresh handles concurrent requests",
                "Check for missing CSRF protection on mutations",
                "Audit cookie settings (httpOnly, secure, sameSite)",
                "Look for missing rate limiting on auth endpoints",
            ],
            "Tests/QA": [
                "Identify the top 5 most-failed or flaky tests",
                "Find critical paths missing test coverage",
                "Check test execution time for parallelization opportunities",
                "Look for tests that depend on specific timing",
            ],
            "Build/Infra": [
                "Review Dockerfile for unnecessary layer rebuilds",
                "Check GitHub Actions for missing dependency caching",
                "Audit turbo.json for missing remote cache configuration",
                "Look for missing health-check endpoints",
            ],
            "Docs": [
                "Find documentation that contradicts current code",
                "Check for broken internal links",
                "Audit SPEC.md for outdated architectural decisions",
                "Find public functions without inline documentation",
            ],
            "Grimoire": [
                "Find entries older than 90 days that need refreshing",
                "Identify topics with no cross-references",
                "Look for missing entries for recently discovered patterns",
                "Check for inconsistent frontmatter format",
            ],
            "Autonomous loop": [
                "Review guardian dashboard for failing health checks",
                "Analyze loop restarts in the last 7 days",
                "Check memory integrity in continuity_manager",
                "Review telemetry coverage for missing events",
            ],
        }
        return hints.get(area, [
            "Scan for files over 500 lines needing refactor",
            "Check for missing test coverage",
            "Look for TypeScript 'any' types that should be explicit",
            "Find deprecated API usage",
        ])

    def _generic_suggestions(self, area: str) -> list[dict[str, str]]:
        """Fallback suggestions when ProjectMap is unavailable."""
        return [
            {"type": "coverage", "priority": "high", "suggestion": f"Add tests for the {area} area"},
            {"type": "tech_debt", "priority": "medium", "suggestion": f"Review and address technical debt in {area}"},
            {"type": "docs", "priority": "medium", "suggestion": f"Ensure {area} has adequate documentation"},
            {"type": "types", "priority": "medium", "suggestion": f"Improve TypeScript types in {area}"},
            {"type": "freshness", "priority": "low", "suggestion": f"Review {area} for stale code or dependencies"},
        ]


# ── Module-level convenience singleton ─────────────────────────────────────────

_default_iterator: Optional[SmartIterator] = None


def get_iterator(intensity: int = 5) -> SmartIterator:
    """Return or create the module-level SmartIterator singleton."""
    global _default_iterator
    if _default_iterator is None:
        _default_iterator = SmartIterator(intensity=intensity)
    return _default_iterator


# ── CLI ───────────────────────────────────────────────────────────────────────


def _cli() -> None:
    """Simple CLI for inspecting SmartIterator behavior."""
    import argparse

    parser = argparse.ArgumentParser(description="SmartIterator CLI")
    parser.add_argument("--focus", action="store_true", help="Show next research focus")
    parser.add_argument("--neglected", action="store_true", help="Show neglected areas")
    parser.add_argument("--debt", metavar="AREA", help="Show debt score for an area")
    parser.add_argument("--history", metavar="AREA", help="Show improvement history for an area")
    parser.add_argument("--intensity", type=int, default=5, help="Iterator intensity 1-10 (default 5)")
    args = parser.parse_args()

    si = SmartIterator(intensity=args.intensity)

    if args.focus:
        focus = si.get_next_research_focus()
        if focus:
            print(f"\n=== Next Research Focus ===")
            for k, v in focus.items():
                print(f"  {k}: {v}")
        else:
            print("No focus area found.")

    if args.neglected:
        neglected = si.get_neglected_priority()
        print(f"\n=== Neglected Areas ({len(neglected)} found) ===")
        for e in neglected:
            print(f"  {e['area']:30s}  days={e['days_since_improvement']:6.1f}  "
                  f"potential={e['potential_score']:5.1f}  score={e['weighted_score']:6.2f}")

    if args.debt:
        score = si.get_area_debt_score(args.debt)
        print(f"\n  Tech debt score for '{args.debt}': {score}/100")

    if args.history:
        stats = si._history.area_stats(args.history)
        print(f"\n=== History stats for '{args.history}' ===")
        for k, v in stats.items():
            print(f"  {k}: {v}")

    if not any([args.focus, args.neglected, args.debt, args.history]):
        parser.print_help()


if __name__ == "__main__":
    _cli()
