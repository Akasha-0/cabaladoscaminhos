#!/usr/bin/env python3
"""
project_map.py — Project area mapper for autonomous evolution.

Maps all areas of the project so the loop knows what to improve.
Tracks quality/activity per area, identifies neglected areas,
and suggests improvements based on file patterns.
"""

from __future__ import annotations

import json
import math
import os
import re
import sys
import time
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

# ── Path constants ──────────────────────────────────────────────────────────────

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous" / "multi-agent"
PROJECT_MAP_FILE = MA / "project_map.json"
CACHE_FILE = MA / "project_map_cache.json"

# ── Helpers ─────────────────────────────────────────────────────────────────────


def load_json(path: Path) -> dict | list | None:
    """Load JSON from file, returning None on failure."""
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return None
    return None


def save_json(path: Path, data: Any) -> bool:
    """Save data to JSON file atomically."""
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_suffix(".tmp")
        tmp.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")
        tmp.rename(path)
        return True
    except OSError:
        return False


def log(msg: str, file=None) -> None:
    """Print msg with UTC timestamp prefix."""
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
    print(f"{ts}  {msg}", file=file or sys.stdout, flush=True)


def timestamp_now() -> float:
    """Return current Unix timestamp."""
    return time.time()


def days_ago(timestamp: float) -> float:
    """Return approximate days since the given timestamp."""
    return (timestamp_now() - timestamp) / 86400.0


# ── Project Areas Configuration ─────────────────────────────────────────────────

# Each area defines: name, description, glob patterns, importance weight,
# and what "improvement potential" factors are relevant.
PROJECT_AREAS: dict[str, dict[str, Any]] = {
    "UI/Design": {
        "description": "User interface components and design system",
        "weight": 1.0,
        "patterns": [
            "apps/akasha-portal/src/components/**/*.{ts,tsx}",
            "apps/akasha-portal/src/app/**/*.{ts,tsx}",
            "apps/akasha-portal/src/styles/**/*.{css,scss}",
            "packages/ui/**/*.{ts,tsx}",
        ],
        "quality_indicators": ["test coverage", "prop coverage", "a11y compliance"],
        "improvement_factors": ["test_coverage", "prop_documentation", "a11y_score"],
    },
    "API/Logic": {
        "description": "Business logic, API routes, and core library code",
        "weight": 1.2,
        "patterns": [
            "apps/akasha-portal/src/lib/**/*.{ts,tsx}",
            "packages/akasha-core/**/*.ts",
            "packages/mentor/**/*.ts",
            "packages/*/src/**/*.ts",
        ],
        "quality_indicators": ["test coverage", "type safety", "error handling"],
        "improvement_factors": ["test_coverage", "type_coverage", "error_handling"],
    },
    "Database/Prisma": {
        "description": "Database schema, Prisma ORM, and data access",
        "weight": 1.1,
        "patterns": [
            "apps/akasha-portal/prisma/**/*.prisma",
            "apps/akasha-portal/src/app/api/**/*.ts",
            "apps/akasha-portal/src/lib/db/**/*.ts",
        ],
        "quality_indicators": ["schema coverage", "migration safety", "query efficiency"],
        "improvement_factors": ["test_coverage", "schema_coverage", "migration_safety"],
    },
    "Auth": {
        "description": "Authentication, authorization, and security",
        "weight": 1.3,
        "patterns": [
            "apps/akasha-portal/src/lib/auth/**/*.{ts,tsx}",
            "apps/akasha-portal/middleware*.{ts,js}",
            "apps/akasha-portal/src/middleware*.{ts,js}",
        ],
        "quality_indicators": ["test coverage", "session handling", "vulnerability checks"],
        "improvement_factors": ["test_coverage", "security_audit", "session_coverage"],
    },
    "Tests/QA": {
        "description": "Test suites, QA infrastructure, and test utilities",
        "weight": 1.0,
        "patterns": [
            "tests/**/*.ts",
            "tests/**/*.tsx",
            "**/*.test.{ts,tsx}",
            "**/*.spec.{ts,tsx}",
            "vitest.config.ts",
            "apps/akasha-portal/src/**/*.test.{ts,tsx}",
            "apps/akasha-portal/src/**/*.spec.{ts,tsx}",
        ],
        "quality_indicators": ["pass rate", "coverage", "flakiness"],
        "improvement_factors": ["pass_rate", "coverage_improvement", "flakiness_reduction"],
    },
    "Build/Infra": {
        "description": "Build system, Docker, deployment, and infrastructure",
        "weight": 0.9,
        "patterns": [
            "Dockerfile*",
            "docker-compose*.{yml,yaml}",
            "turbo.json",
            "package.json",
            "apps/*/package.json",
            "packages/*/package.json",
            ".github/workflows/*.{yml,yaml}",
            "apps/akasha-portal/next.config.{js,mjs,ts}",
            "apps/akasha-portal/vitest.config.ts",
            "vite.config.{ts,js}",
        ],
        "quality_indicators": ["build success", "Dockerfile best practices", "CI coverage"],
        "improvement_factors": ["build_reliability", "docker_optimization", "ci_coverage"],
    },
    "Docs": {
        "description": "Documentation files and project specifications",
        "weight": 0.7,
        "patterns": [
            "docs/**/*.{md,rst,txt}",
            "SPEC.md",
            "DECISIONS.md",
            "PROGRESS.md",
            "ROADMAP.md",
            "UX-WRITING-GUIDELINES.md",
            "UX-UI-AUDIT.md",
            "MAPA.md",
            "CHANGELOG.md",
            "EVALS.md",
            "VERSION",
            "README.md",
            "CONTRIBUTING.md",
            "*.md",
        ],
        "quality_indicators": ["coverage", "freshness", "link integrity"],
        "improvement_factors": ["doc_coverage", "doc_freshness", "link_integrity"],
    },
    "Grimoire": {
        "description": "Knowledge bases and wisdom repositories",
        "weight": 0.8,
        "patterns": [
            "grimoire/**/*.md",
            "grimoire/**/*.json",
            "grimoire/**/**/*.{md,json}",
        ],
        "quality_indicators": ["entry count", "cross-linking", "freshness"],
        "improvement_factors": ["entry_count", "cross_reference", "entry_freshness"],
    },
    "Autonomous loop": {
        "description": "Self-evolution, autonomous agents, and loop infrastructure",
        "weight": 1.0,
        "patterns": [
            ".autonomous/**/*.py",
            ".autonomous/**/*.json",
            ".autonomous/**/*.sh",
            ".autonomous/**/*.md",
        ],
        "quality_indicators": ["agent health", "loop stability", "memory integrity"],
        "improvement_factors": ["agent_health", "loop_stability", "memory_quality"],
    },
}

# Extensions to count lines of code for
CODE_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".py", ".pyw"}
DOC_EXTENSIONS = {".md", ".rst", ".txt"}


# ── Quality Scoring Helpers ────────────────────────────────────────────────────


def _file_age_score(last_modified: float) -> float:
    """Score based on file age (0=ancient, 1=fresh)."""
    age_days = days_ago(last_modified)
    if age_days < 1:
        return 1.0
    if age_days < 7:
        return 0.9
    if age_days < 30:
        return 0.7
    if age_days < 90:
        return 0.5
    if age_days < 180:
        return 0.3
    return 0.1


def _file_size_score(path: Path) -> float:
    """Score based on file size — very small files may be stubs, huge ones need splitting."""
    try:
        size = path.stat().st_size
        if size == 0:
            return 0.2
        if size < 100:
            return 0.4
        if size < 5000:
            return 0.8
        if size < 50000:
            return 1.0
        return 0.6  # large file
    except OSError:
        return 0.5


def _count_lines(path: Path) -> int:
    """Count non-empty lines in a file."""
    try:
        return sum(1 for line in path.read_text(encoding="utf-8", errors="ignore").splitlines() if line.strip())
    except OSError:
        return 0


def _extension_score(path: Path) -> float:
    """Score based on extension — code files score higher than generated docs."""
    ext = path.suffix.lower()
    if ext in CODE_EXTENSIONS:
        return 1.0
    if ext in DOC_EXTENSIONS:
        return 0.6
    if ext in {".json", ".yaml", ".yml"}:
        return 0.7
    return 0.5


def _test_coverage_estimate(files: list[Path]) -> float:
    """Estimate test coverage based on test file presence vs source files."""
    test_files = [f for f in files if _is_test_file(f)]
    source_files = [f for f in files if not _is_test_file(f) and f.suffix in CODE_EXTENSIONS]
    if not source_files:
        return 1.0
    ratio = len(test_files) / len(source_files)
    return min(1.0, ratio)


def _is_test_file(path: Path) -> bool:
    """Check if a file looks like a test file."""
    name = path.name.lower()
    return bool(re.search(r"\.?(test|spec)\.(ts|tsx|js|jsx|py)$", name))


def _activity_level_from_age(last_modified: float) -> str:
    """Categorize activity level from last modification time."""
    age_days = days_ago(last_modified)
    if age_days < 1:
        return "hot"
    if age_days < 7:
        return "active"
    if age_days < 30:
        return "stable"
    if age_days < 90:
        return "stale"
    return "neglected"


# ── Area Quality Scorer ────────────────────────────────────────────────────────


class AreaScorer:
    """Computes quality and improvement potential scores for a project area."""

    def __init__(self, area_name: str, area_config: dict[str, Any], files: list[Path]):
        self.area_name = area_name
        self.config = area_config
        self.files = files

    def quality_score(self) -> float:
        """
        Compute a 0-100 quality score for this area.
        Weights: file freshness (30%), test coverage estimate (25%),
        file size health (20%), extension mix (15%), activity consistency (10%).
        """
        if not self.files:
            return 0.0

        # 1. Freshness: average age score
        freshness_scores = []
        for f in self.files:
            try:
                mtime = f.stat().st_mtime
                freshness_scores.append(_file_age_score(mtime))
            except OSError:
                freshness_scores.append(0.5)
        freshness = sum(freshness_scores) / len(freshness_scores) if freshness_scores else 0.5

        # 2. Test coverage estimate
        coverage = _test_coverage_estimate(self.files)

        # 3. File size health
        size_scores = [_file_size_score(f) for f in self.files[:50]]  # sample
        size_health = sum(size_scores) / len(size_scores) if size_scores else 0.5

        # 4. Extension mix (preference for code files)
        ext_scores = [_extension_score(f) for f in self.files]
        ext_mix = sum(ext_scores) / len(ext_scores) if ext_scores else 0.5

        # 5. Activity consistency — files modified around the same time is healthy
        activity_scores = []
        for f in self.files:
            try:
                mtime = f.stat().st_mtime
                activity_scores.append(mtime)
            except OSError:
                pass
        if len(activity_scores) >= 2:
            # Low variance in modification times = consistent development
            mean = sum(activity_scores) / len(activity_scores)
            variance = sum((t - mean) ** 2 for t in activity_scores) / len(activity_scores)
            std_dev = math.sqrt(variance)
            # Convert to 0-1 score: low std_dev = high consistency
            # Use log scale since variance can be huge
            consistency = 1.0 / (1.0 + math.log1p(std_dev / 86400))  # std_dev in days
        else:
            consistency = 0.5

        # Weighted composite
        score = (
            freshness * 0.30
            + coverage * 0.25
            + size_health * 0.20
            + ext_mix * 0.15
            + consistency * 0.10
        )
        return round(score * 100, 1)

    def improvement_potential(self) -> float:
        """
        Estimate improvement potential (0-100).
        Higher = more room for improvement.
        Based on: file count (complexity), staleness, test coverage gaps,
        and area-specific importance weight.
        """
        weight = self.config.get("weight", 1.0)

        # File count factor — medium complexity areas have most room
        n = len(self.files)
        if n == 0:
            count_factor = 0.0
        elif n < 5:
            count_factor = 0.3 + n * 0.1
        elif n < 20:
            count_factor = 0.7
        elif n < 50:
            count_factor = 0.5
        else:
            count_factor = 0.3

        # Staleness factor — neglected areas have higher potential
        staleness_scores = []
        for f in self.files:
            try:
                mtime = f.stat().st_mtime
                staleness_scores.append(_file_age_score(mtime))
            except OSError:
                staleness_scores.append(0.5)
        staleness = 1.0 - (sum(staleness_scores) / len(staleness_scores) if staleness_scores else 0.5)

        # Coverage gap — areas with low test coverage have more potential
        coverage = _test_coverage_estimate(self.files)
        coverage_gap = 1.0 - coverage

        # Quality gap — low quality areas have more potential
        quality = self.quality_score() / 100.0
        quality_gap = 1.0 - quality

        potential = (
            count_factor * 0.20
            + staleness * 0.25
            + coverage_gap * 0.25
            + quality_gap * 0.30
        ) * weight

        return round(min(100.0, potential * 100), 1)

    def activity_level(self) -> str:
        """Get the dominant activity level for this area based on most-recent file."""
        if not self.files:
            return "unknown"
        latest_mtime = 0.0
        for f in self.files:
            try:
                mtime = f.stat().st_mtime
                if mtime > latest_mtime:
                    latest_mtime = mtime
            except OSError:
                pass
        return _activity_level_from_age(latest_mtime)

    def last_modified(self) -> float:
        """Return the Unix timestamp of the most recently modified file."""
        if not self.files:
            return 0.0
        latest = 0.0
        for f in self.files:
            try:
                mtime = f.stat().st_mtime
                if mtime > latest:
                    latest = mtime
            except OSError:
                pass
        return latest

    def total_lines(self) -> int:
        """Count total lines across all files (sampled for performance)."""
        sample = self.files[:100]
        return sum(_count_lines(f) for f in sample)

    def coverage_estimate(self) -> float:
        """Return estimated test coverage 0-1."""
        return _test_coverage_estimate(self.files)


# ── Improvement Suggestion Engine ─────────────────────────────────────────────


class SuggestionEngine:
    """Generates concrete improvement suggestions for a project area."""

    AREA_SUGGESTIONS: dict[str, list[dict[str, str]]] = {
        "UI/Design": [
            {"type": "coverage", "priority": "high", "suggestion": "Add Playwright or Vitest tests for all interactive components"},
            {"type": "a11y", "priority": "high", "suggestion": "Audit components for WCAG 2.1 AA accessibility compliance"},
            {"type": "prop", "priority": "medium", "suggestion": "Document all component props with TypeScript interfaces"},
            {"type": "design", "priority": "medium", "suggestion": "Extract design tokens (colors, spacing) into shared CSS variables"},
            {"type": "responsive", "priority": "medium", "suggestion": "Verify all pages are fully responsive at mobile breakpoints"},
            {"type": "perf", "priority": "medium", "suggestion": "Profile component render times with React DevTools Profiler"},
            {"type": "i18n", "priority": "low", "suggestion": "Internationalize hardcoded strings using next-intl or react-i18next"},
        ],
        "API/Logic": [
            {"type": "coverage", "priority": "high", "suggestion": "Add unit tests for all service-layer functions with mocked dependencies"},
            {"type": "types", "priority": "high", "suggestion": "Audit for 'any' types and replace with specific TypeScript types"},
            {"type": "error", "priority": "high", "suggestion": "Add structured error handling with custom error classes"},
            {"type": "perf", "priority": "medium", "suggestion": "Profile hot paths for N+1 query patterns and memoize where appropriate"},
            {"type": "api", "priority": "medium", "suggestion": "Validate all API route inputs with Zod schemas"},
            {"type": "perf", "priority": "low", "suggestion": "Add response caching headers for expensive read operations"},
            {"type": "types", "priority": "low", "suggestion": "Enable strict TypeScript strict mode if not already enabled"},
        ],
        "Database/Prisma": [
            {"type": "coverage", "priority": "high", "suggestion": "Add integration tests for all Prisma model CRUD operations"},
            {"type": "migration", "priority": "high", "suggestion": "Ensure all schema changes have corresponding migration files"},
            {"type": "query", "priority": "high", "suggestion": "Review Prisma queries for N+1 issues and use include/select wisely"},
            {"type": "index", "priority": "medium", "suggestion": "Add database indexes for frequently queried foreign key columns"},
            {"type": "seed", "priority": "medium", "suggestion": "Create comprehensive seed scripts for development data"},
            {"type": "types", "priority": "low", "suggestion": "Generate Prisma client after every schema change"},
        ],
        "Auth": [
            {"type": "coverage", "priority": "high", "suggestion": "Add integration tests for all auth flows (login, logout, refresh, session expiry)"},
            {"type": "security", "priority": "high", "suggestion": "Run npm audit and check for known vulnerabilities in auth dependencies"},
            {"type": "coverage", "priority": "high", "suggestion": "Test CSRF protection and secure cookie settings"},
            {"type": "session", "priority": "medium", "suggestion": "Verify session refresh handles concurrent requests correctly"},
            {"type": "security", "priority": "medium", "suggestion": "Ensure all auth routes are covered by rate limiting middleware"},
            {"type": "types", "priority": "low", "suggestion": "Add TypeScript types for session and JWT payload structures"},
        ],
        "Tests/QA": [
            {"type": "coverage", "priority": "high", "suggestion": "Increase test coverage to 80% for all critical paths"},
            {"type": "flakiness", "priority": "high", "suggestion": "Identify and fix flaky tests — they erode confidence"},
            {"type": "e2e", "priority": "medium", "suggestion": "Add Playwright E2E tests for the top 5 user journeys"},
            {"type": "perf", "priority": "medium", "suggestion": "Run tests in parallel (Vitest --parallel flag) to reduce CI time"},
            {"type": "coverage", "priority": "medium", "suggestion": "Add mutation testing (Stryker) to verify test quality"},
            {"type": "report", "priority": "low", "suggestion": "Integrate test coverage reports into CI pipeline with thresholds"},
        ],
        "Build/Infra": [
            {"type": "docker", "priority": "high", "suggestion": "Optimize Docker layers — put COPY package*.json before COPY . for better cache"},
            {"type": "ci", "priority": "high", "suggestion": "Add dependency caching to GitHub Actions workflows"},
            {"type": "build", "priority": "medium", "suggestion": "Verify Turbo build cache is working and surfaces cache hits"},
            {"type": "docker", "priority": "medium", "suggestion": "Run docker scan / trivy on the Dockerfile for known CVEs"},
            {"type": "ci", "priority": "medium", "suggestion": "Add smoke tests to the CI pipeline that deploy to a preview environment"},
            {"type": "build", "priority": "low", "suggestion": "Profile build times to identify the slowest packages"},
        ],
        "Docs": [
            {"type": "coverage", "priority": "high", "suggestion": "Audit docs/ for outdated or contradictory information vs current code"},
            {"type": "freshness", "priority": "high", "suggestion": "Update SPEC.md and DECISIONS.md after any significant architectural change"},
            {"type": "links", "priority": "medium", "suggestion": "Fix any broken internal links in markdown files (use markdown-link-check)"},
            {"type": "coverage", "priority": "medium", "suggestion": "Add inline API documentation for all public functions in core packages"},
            {"type": "i18n", "priority": "low", "suggestion": "Ensure CHANGELOG.md follows Keep a Changelog format"},
            {"type": "coverage", "priority": "low", "suggestion": "Add architecture decision records (ADRs) for major technical choices"},
        ],
        "Grimoire": [
            {"type": "crosslink", "priority": "high", "suggestion": "Cross-reference related entries to create a knowledge graph"},
            {"type": "freshness", "priority": "high", "suggestion": "Review and update stale grimoire entries (older than 90 days)"},
            {"type": "coverage", "priority": "medium", "suggestion": "Add entries for new patterns discovered during development"},
            {"type": "structure", "priority": "medium", "suggestion": "Organize entries with consistent frontmatter (tags, date, author)"},
            {"type": "search", "priority": "low", "suggestion": "Add a search index or glossary for quick topic lookup"},
        ],
        "Autonomous loop": [
            {"type": "health", "priority": "high", "suggestion": "Verify all agent health checks are passing in guardian dashboard"},
            {"type": "stability", "priority": "high", "suggestion": "Review recent loop restarts and identify root causes"},
            {"type": "memory", "priority": "high", "suggestion": "Run memory integrity checks on continuity_manager and memory_manager"},
            {"type": "health", "priority": "medium", "suggestion": "Add new agent health metrics if new agent types are introduced"},
            {"type": "stability", "priority": "medium", "suggestion": "Review and tune pacer state thresholds based on recent quality data"},
            {"type": "telemetry", "priority": "low", "suggestion": "Audit telemetry.py to ensure all critical events are being tracked"},
        ],
    }

    GENERIC_SUGGESTIONS: list[dict[str, str]] = [
        {"type": "coverage", "priority": "medium", "suggestion": "Add more tests for this area to improve coverage"},
        {"type": "types", "priority": "medium", "suggestion": "Review TypeScript types for this area — avoid 'any' leaks"},
        {"type": "perf", "priority": "medium", "suggestion": "Profile and optimize any performance bottlenecks in this area"},
        {"type": "docs", "priority": "low", "suggestion": "Document the purpose and architecture of this area"},
        {"type": "security", "priority": "high", "suggestion": "Run a security audit for this area's dependencies"},
    ]

    def __init__(self, area_name: str, area_data: dict[str, Any]):
        self.area_name = area_name
        self.area_data = area_data

    def get(self) -> list[dict[str, str]]:
        """Return ranked improvement suggestions for the area."""
        suggestions = []

        # Area-specific suggestions
        area_suggestions = self.AREA_SUGGESTIONS.get(self.area_name, [])
        suggestions.extend(area_suggestions)

        # Enrich with context from area data
        quality = self.area_data.get("quality_score", 50)
        coverage = self.area_data.get("coverage_estimate", 0)
        activity = self.area_data.get("activity_level", "unknown")

        # If quality is low, prioritize high-priority suggestions
        if quality < 40:
            suggestions = [s for s in suggestions if s.get("priority") == "high"] + suggestions

        # If coverage is low, add coverage-specific suggestions
        if coverage < 0.3:
            suggestions.insert(0, {"type": "coverage", "priority": "high",
                                   "suggestion": f"Coverage estimate is very low ({coverage:.0%}) — add tests immediately"})

        # If activity is stale or neglected, suggest a refresh
        if activity in ("stale", "neglected"):
            suggestions.insert(0, {"type": "freshness", "priority": "high",
                                   "suggestion": f"This area has been {activity} — schedule a review and update session"})

        # Add generic suggestions if we have fewer than 3
        if len(suggestions) < 3:
            suggestions.extend(self.GENERIC_SUGGESTIONS[:3 - len(suggestions)])

        # Sort by priority
        priority_order = {"high": 0, "medium": 1, "low": 2}
        suggestions.sort(key=lambda s: priority_order.get(s.get("priority", "medium"), 1))

        return suggestions[:6]  # Cap at 6 suggestions


# ── ProjectMap ─────────────────────────────────────────────────────────────────


class ProjectMap:
    """
    Maps all project areas for the autonomous evolution loop.

    Provides scanning, quality scoring, neglect detection,
    and improvement suggestions per area.
    """

    def __init__(self, cache_file: Path | None = None, map_file: Path | None = None):
        self.cache_file = cache_file or CACHE_FILE
        self.map_file = map_file or PROJECT_MAP_FILE
        self._scan_cache: dict[str, dict[str, Any]] = {}
        self._last_scan: float = 0.0
        self._scan_ttl: float = 300.0  # 5 minutes cache TTL

    # ── Scanning ───────────────────────────────────────────────────────────────

    def scan(self, force: bool = False) -> dict[str, dict[str, Any]]:
        """
        Scan the project and return a dict of {area_name: area_data}.

        area_data contains:
          - files: list of file paths (as strings)
          - last_modified: Unix timestamp of most recent file
          - quality_score: 0-100 quality score
          - activity_level: "hot" | "active" | "stable" | "stale" | "neglected" | "unknown"
          - improvement_potential: 0-100 improvement potential
          - file_count: number of files in the area
          - total_lines: estimated total lines
          - coverage_estimate: 0-1 test coverage estimate
          - description: human-readable area description
        """
        now = timestamp_now()
        if not force and (now - self._last_scan) < self._scan_ttl and self._scan_cache:
            log(f"project_map: returning cached scan ({self._last_scan})")
            return self._scan_cache

        log("project_map: starting full project scan")
        result: dict[str, dict[str, Any]] = {}

        for area_name, area_config in PROJECT_AREAS.items():
            area_data = self._scan_area(area_name, area_config)
            result[area_name] = area_data

        self._scan_cache = result
        self._last_scan = now
        self._save_map(result)
        log(f"project_map: scan complete — {len(result)} areas mapped")
        return result

    @staticmethod
    def _expand_glob_patterns(patterns: list[str]) -> list[Path]:
        """Resolve glob patterns (supporting {a,b} brace expansion) to files."""
        import re as _re
        files: list[Path] = []
        seen: set[Path] = set()
        for pattern in patterns:
            # Expand brace syntax: apps/foo/**/*.{ts,tsx} → two patterns
            expanded = []
            brace_match = _re.search(r'\{([^}]+)\}', pattern)
            if brace_match:
                variants = [v.strip() for v in brace_match.group(1).split(',')]
                for variant in variants:
                    expanded.append(pattern[:brace_match.start()] + variant + pattern[brace_match.end():])
            else:
                expanded.append(pattern)
            for p in expanded:
                if p.startswith("/"):
                    matched = ROOT.glob(p.lstrip("/"))
                else:
                    matched = ROOT.glob(p)
                for path in matched:
                    if path.is_file() and path not in seen:
                        seen.add(path)
                        files.append(path)
        return files
    def _scan_area(self, area_name: str, area_config: dict[str, Any]) -> dict[str, Any]:
        """Scan a single project area and return its data."""
        patterns = area_config.get("patterns", [])
        files = ProjectMap._expand_glob_patterns(patterns)

        # Sort by modification time (most recent first)
        files.sort(key=lambda f: self._get_mtime(f), reverse=True)

        scorer = AreaScorer(area_name, area_config, files)
        quality = scorer.quality_score()
        potential = scorer.improvement_potential()
        activity = scorer.activity_level()
        last_mod = scorer.last_modified()

        file_paths = [str(f.relative_to(ROOT)) for f in files]

        return {
            "description": area_config.get("description", ""),
            "files": file_paths,
            "file_count": len(files),
            "last_modified": last_mod,
            "last_modified_iso": datetime.fromtimestamp(last_mod, tz=timezone.utc).isoformat() if last_mod else None,
            "quality_score": quality,
            "activity_level": activity,
            "improvement_potential": potential,
            "total_lines": scorer.total_lines(),
            "coverage_estimate": scorer.coverage_estimate(),
        }

    def _get_mtime(self, path: Path) -> float:
        """Get file modification time, safely."""
        try:
            return path.stat().st_mtime
        except OSError:
            return 0.0

    def _save_map(self, data: dict[str, dict[str, Any]]) -> None:
        """Persist scan results to disk."""
        payload = {
            "scanned_at": timestamp_now(),
            "scanned_at_iso": datetime.now(timezone.utc).isoformat(),
            "areas": data,
        }
        save_json(self.map_file, payload)

    # ── Neglected Areas ─────────────────────────────────────────────────────────

    def get_neglected_areas(self, threshold_days: float = 30) -> list[dict[str, Any]]:
        """
        Return areas not meaningfully touched in threshold_days.

        Each returned dict contains: area_name, last_modified, days_since_modified,
        quality_score, activity_level.
        """
        scan_data = self.scan()
        threshold_ts = timestamp_now() - (threshold_days * 86400)
        neglected: list[dict[str, Any]] = []

        for area_name, area_data in scan_data.items():
            last_mod = area_data.get("last_modified", 0)
            if last_mod < threshold_ts:
                days = days_ago(last_mod)
                neglected.append({
                    "area_name": area_name,
                    "last_modified": last_mod,
                    "last_modified_iso": area_data.get("last_modified_iso"),
                    "days_since_modified": round(days, 1),
                    "quality_score": area_data.get("quality_score", 0),
                    "activity_level": area_data.get("activity_level", "unknown"),
                    "improvement_potential": area_data.get("improvement_potential", 0),
                })

        # Sort by days since modified (most neglected first)
        neglected.sort(key=lambda x: x["days_since_modified"], reverse=True)
        return neglected

    # ── High Potential Areas ────────────────────────────────────────────────────

    def get_high_potential_areas(self, top_n: int = 3) -> list[dict[str, Any]]:
        """
        Return the top_n areas with highest improvement potential.

        Each returned dict contains: area_name, improvement_potential,
        quality_score, activity_level, file_count.
        """
        scan_data = self.scan()
        scored: list[dict[str, Any]] = []

        for area_name, area_data in scan_data.items():
            potential = area_data.get("improvement_potential", 0)
            # Don't suggest areas with no files
            if area_data.get("file_count", 0) == 0:
                continue
            scored.append({
                "area_name": area_name,
                "improvement_potential": potential,
                "quality_score": area_data.get("quality_score", 0),
                "activity_level": area_data.get("activity_level", "unknown"),
                "file_count": area_data.get("file_count", 0),
                "last_modified_iso": area_data.get("last_modified_iso"),
            })

        # Sort by improvement potential descending
        scored.sort(key=lambda x: x["improvement_potential"], reverse=True)
        return scored[:top_n]

    # ── Suggestions ────────────────────────────────────────────────────────────

    def suggest_for_area(self, area: str) -> list[dict[str, str]]:
        """
        Return a ranked list of improvement suggestions for the named area.

        Each suggestion is a dict with: type, priority, suggestion.
        """
        scan_data = self.scan()
        area_data = scan_data.get(area)
        if not area_data:
            return [{"type": "error", "priority": "high", "suggestion": f"Area '{area}' not found in project map"}]

        engine = SuggestionEngine(area, area_data)
        return engine.get()

    # ── Activity Tracking ───────────────────────────────────────────────────────

    def update_activity(self, file_path: str | Path) -> None:
        """
        Update the scan cache to reflect a file was just modified.
        This is called when the loop touches a file, so the area
        appears fresh even if the on-disk scan cache hasn't refreshed.
        """
        path = Path(file_path)
        area_name = self._classify_file(path)
        if not area_name:
            return

        now = timestamp_now()
        if area_name in self._scan_cache:
            self._scan_cache[area_name]["last_modified"] = now
            self._scan_cache[area_name]["last_modified_iso"] = datetime.fromtimestamp(now, tz=timezone.utc).isoformat()
            self._scan_cache[area_name]["activity_level"] = "hot"
        else:
            self._scan_cache[area_name] = {
                "last_modified": now,
                "last_modified_iso": datetime.fromtimestamp(now, tz=timezone.utc).isoformat(),
                "activity_level": "hot",
                "file_count": 1,
                "files": [str(path)],
            }
        log(f"project_map: updated activity for {area_name} via {path.name}")

    def _classify_file(self, path: Path) -> str | None:
        """Classify a file path into a project area."""
        rel_path = str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path)

        for area_name, area_config in PROJECT_AREAS.items():
            for pattern in area_config.get("patterns", []):
                # Normalize pattern
                p = pattern.lstrip("/")
                if p.endswith("/**/*"):
                    prefix = p[:-5]
                    if rel_path.startswith(prefix) or self._fnmatch(rel_path, prefix + "/"):
                        return area_name
                elif self._fnmatch(rel_path, p):
                    return area_name
        return None

    def _fnmatch(self, name: str, pattern: str) -> bool:
        """Simple fnmatch-style glob for paths."""
        import fnmatch
        return fnmatch.fnmatch(name, pattern)

    # ── Area Context ───────────────────────────────────────────────────────────

    def get_area_context(self, area: str) -> dict[str, Any]:
        """
        Return a summary of what's in the named area.

        Includes: description, file list (up to 20), total lines,
        quality score, activity level, and top improvement suggestion.
        """
        scan_data = self.scan()
        area_data = scan_data.get(area)
        if not area_data:
            return {"error": f"Area '{area}' not found"}

        files = area_data.get("files", [])
        suggestions = self.suggest_for_area(area)

        return {
            "area": area,
            "description": area_data.get("description", ""),
            "file_count": area_data.get("file_count", 0),
            "files_sample": files[:20],
            "total_lines": area_data.get("total_lines", 0),
            "quality_score": area_data.get("quality_score", 0),
            "activity_level": area_data.get("activity_level", "unknown"),
            "improvement_potential": area_data.get("improvement_potential", 0),
            "last_modified_iso": area_data.get("last_modified_iso"),
            "coverage_estimate": area_data.get("coverage_estimate", 0),
            "top_suggestion": suggestions[0] if suggestions else None,
            "all_suggestions": suggestions,
        }

    # ── Project Stats ─────────────────────────────────────────────────────────

    def get_project_stats(self) -> dict[str, Any]:
        """
        Return overall project statistics across all areas.

        Includes: total files, total lines, per-area quality summary,
        overall health score, and breakdown by activity level.
        """
        scan_data = self.scan()

        total_files = 0
        total_lines = 0
        quality_scores = []
        activity_counts: dict[str, int] = defaultdict(int)
        area_summaries: list[dict[str, Any]] = []

        for area_name, area_data in sorted(scan_data.items()):
            total_files += area_data.get("file_count", 0)
            total_lines += area_data.get("total_lines", 0)
            qs = area_data.get("quality_score", 0)
            if qs > 0:
                quality_scores.append(qs)
            activity = area_data.get("activity_level", "unknown")
            activity_counts[activity] += 1
            area_summaries.append({
                "area": area_name,
                "quality_score": qs,
                "activity_level": activity,
                "improvement_potential": area_data.get("improvement_potential", 0),
                "file_count": area_data.get("file_count", 0),
                "last_modified_iso": area_data.get("last_modified_iso"),
            })

        avg_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 0

        # Overall health: weighted by quality and recency
        health_score = avg_quality * 0.7 + (
            sum(
                area_data.get("improvement_potential", 0)
                for area_data in scan_data.values()
            ) / len(scan_data) * 0.3 if scan_data else 0
        )

        return {
            "total_files": total_files,
            "total_lines": total_lines,
            "area_count": len(scan_data),
            "average_quality_score": round(avg_quality, 1),
            "health_score": round(health_score, 1),
            "activity_breakdown": dict(activity_counts),
            "neglected_count": activity_counts.get("neglected", 0) + activity_counts.get("stale", 0),
            "areas": area_summaries,
            "scanned_at_iso": datetime.fromtimestamp(self._last_scan, tz=timezone.utc).isoformat() if self._last_scan else None,
        }

    # ── Convenience ────────────────────────────────────────────────────────────

    def areas(self) -> list[str]:
        """Return list of all area names."""
        return list(PROJECT_AREAS.keys())

    def summary(self) -> str:
        """Return a human-readable one-line summary."""
        stats = self.get_project_stats()
        qs = stats["average_quality_score"]
        health = stats["health_score"]
        return (
            f"ProjectMap: {stats['area_count']} areas, "
            f"{stats['total_files']} files, avg quality {qs:.0f}/100, "
            f"health {health:.0f}/100, {stats['neglected_count']} neglected"
        )


# ── Module-level convenience singleton ─────────────────────────────────────────

_default_map: Optional[ProjectMap] = None


def get_map() -> ProjectMap:
    """Return or create the module-level ProjectMap singleton."""
    global _default_map
    if _default_map is None:
        _default_map = ProjectMap()
    return _default_map


# ── CLI ───────────────────────────────────────────────────────────────────────

def _cli() -> None:
    """Simple CLI for inspecting the project map."""
    import argparse
    parser = argparse.ArgumentParser(description="Project area mapper")
    parser.add_argument("--scan", action="store_true", help="Force a fresh scan")
    parser.add_argument("--neglected", action="store_true", help="Show neglected areas")
    parser.add_argument("--potential", action="store_true", help="Show high-potential areas")
    parser.add_argument("--stats", action="store_true", help="Show project stats")
    parser.add_argument("--area", type=str, help="Get context for a specific area")
    parser.add_argument("--suggest", type=str, help="Get suggestions for an area")
    parser.add_argument("--days", type=float, default=30, help="Neglect threshold in days")
    parser.add_argument("--top-n", type=int, default=3, help="Number of top areas to return")
    args = parser.parse_args()

    pm = ProjectMap()
    if args.scan:
        data = pm.scan(force=True)
        print(json.dumps(data, indent=2, default=str))
    elif args.neglected:
        result = pm.get_neglected_areas(threshold_days=args.days)
        print(json.dumps(result, indent=2, default=str))
    elif args.potential:
        result = pm.get_high_potential_areas(top_n=args.top_n)
        print(json.dumps(result, indent=2, default=str))
    elif args.stats:
        result = pm.get_project_stats()
        print(json.dumps(result, indent=2, default=str))
    elif args.area:
        result = pm.get_area_context(args.area)
        print(json.dumps(result, indent=2, default=str))
    elif args.suggest:
        result = pm.suggest_for_area(args.suggest)
        print(json.dumps(result, indent=2, default=str))
    else:
        print(pm.summary())


if __name__ == "__main__":
    _cli()
