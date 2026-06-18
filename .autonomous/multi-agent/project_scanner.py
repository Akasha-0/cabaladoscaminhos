#!/usr/bin/env python3
"""
project_scanner_v2.py — Ultra-fast lightweight project analysis via git-aware scanning.

Replaces the slow full-glob scan (6+ seconds) with git-diff-based change detection,
a cached project map, neglected-area tracking, and fast relevance scoring.
Target: < 500 ms per call for incremental scans.
"""

from __future__ import annotations

import json
import math
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

# ── Path constants ──────────────────────────────────────────────────────────────

ROOT = Path(__file__).resolve().parent.parent if '__file__' in globals() else Path.cwd()
MA = ROOT / ".autonomous" / "multi-agent"
CACHE_FILE = MA / "project_scanner_v2" / "cache.json"
CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)

# ── Keyword index: file extension + path segment → area ────────────────────────

AREA_PATTERNS: dict[str, list[str]] = {
    "typecheck": [
        "*.ts", "*.tsx", "*.py", "*.pyw",
        "apps/*/tsconfig.json", "packages/*/tsconfig.json",
        "vitest.config.*", "jest.config.*", ".nvmrc",
    ],
    "tests": [
        "**/*.test.ts", "**/*.test.tsx", "**/*.test.js", "**/*.test.jsx",
        "**/*.spec.ts", "**/*.spec.tsx", "**/*.spec.js", "**/*.spec.jsx",
        "**/__tests__/**", "tests/**/*.ts", "tests/**/*.tsx",
        "**/vitest.setup.*",
    ],
    "coverage": [
        "coverage/**", "**/coverage/**", ".nycrc*", "codecov.yml",
    ],
    "lint": [
        ".eslintrc*", "eslint.config.*", ".prettierrc*", "prettier.config.*",
        "stylelint.config.*",
    ],
    "frontend": [
        "apps/*/src/**/*.{ts,tsx,js,jsx}",
        "apps/*/components/**", "apps/*/app/**",
        "components/**/*.{ts,tsx}", "app/**/*.{ts,tsx}",
    ],
    "backend": [
        "apps/*/api/**", "apps/*/server/**", "apps/*/routers/**",
        "packages/*/src/**/*.{ts,tsx}",
        "scripts/**/*.py", ".autonomous/**/*.py",
    ],
    "config": [
        "*.json", "*.yaml", "*.yml", "*.toml", "*.env*",
        "docker-compose*.yml", "Dockerfile", ".dockerignore",
        "turbo.json", "vitest.config.ts", "vitest.config.mts",
        "tsconfig.json", "tsconfig.base.json",
    ],
    "docs": [
        "*.md", "*.rst", "*.txt", "docs/**", "grimoire/**", "CHANGELOG.md",
        "DECISIONS.md", "ROADMAP.md", "SPEC.md", "UX-WRITING-GUIDELINES.md",
    ],
}

# Keywords for fast relevance scoring
RELEVANCE_KEYWORDS: dict[str, list[str]] = {
    "auth":      ["auth", "login", "logout", "session", "jwt", "oauth", "clerk", "password"],
    "database":  ["db", "postgres", "mysql", "sqlite", "drizzle", "prisma", "query", "migration"],
    "api":       ["api", "route", "handler", "endpoint", "rest", "graphql"],
    "frontend":  ["component", "page", "layout", "ui", "button", "modal", "form"],
    "testing":   ["test", "spec", "mock", "vitest", "jest", "coverage", "assert"],
    "performance": ["cache", "memo", "lazy", "optimistic", "debounce", "throttle", "perf"],
    "devops":    ["docker", "ci", "cd", "deploy", "github-actions", "vercel", "env"],
    "security":  ["security", "sanitize", "csrf", "xss", "cors", "rate-limit"],
    "typescript":["typescript", "type", "interface", "enum", "generic", "infer"],
    "state":     ["state", "store", "redux", "zustand", "context", "recoil"],
}

# File extensions → language hint
EXT_LANGUAGE: dict[str, str] = {
    ".ts": "typescript", ".tsx": "typescript",
    ".js": "javascript", ".jsx": "javascript",
    ".py": "python", ".pyw": "python",
    ".md": "markdown", ".rst": "rst",
    ".json": "json", ".yaml": "yaml", ".yml": "yaml",
    ".css": "css", ".scss": "scss",
}

# Keywords present in filenames that shift area classification
PATH_AREA_HINTS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"/tests?/"), "tests"),
    (re.compile(r"/__tests?__/"), "tests"),
    (re.compile(r"\.test\."), "tests"),
    (re.compile(r"\.spec\."), "tests"),
    (re.compile(r"/coverage/"), "coverage"),
    (re.compile(r"vitest|jest|mocha|chai"), "typecheck"),
    (re.compile(r"/\.autonomous/"), "backend"),
    (re.compile(r"/scripts/"), "backend"),
    (re.compile(r"docker-compose|dockerfile|\.dockerignore"), "config"),
    (re.compile(r"eslint|prettier|stylelint"), "lint"),
    (re.compile(r"tsconfig|jsconfig"), "config"),
    (re.compile(r"readme|changelog|roadmap|decisions|spec\.md|ux-"), "docs"),
]


# ── Helpers ─────────────────────────────────────────────────────────────────────


def log(msg: str, file=None) -> None:
    """Print msg with UTC timestamp prefix."""
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
    print(f"{ts}  [scanner_v2]  {msg}", file=file or sys.stdout, flush=True)


def timestamp_now() -> float:
    """Return current Unix timestamp."""
    return time.time()


def load_json(path: Path) -> dict | list | None:
    """Load JSON from file, returning None on failure."""
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, json.JSONDecodeError):
        return None


def save_json(path: Path, data: Any) -> bool:
    """Save data to JSON file atomically."""
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_suffix(".tmp")
        with open(tmp, "w", encoding="utf-8") as fh:
            json.dump(data, fh, indent=2, default=str)
        tmp.replace(path)
        return True
    except OSError:
        return False


def _run_git(cmd: list[str], cwd: Path = ROOT) -> str:
    """Run a git command, return stdout (stripped) or empty string on failure."""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=10,
        )
        return result.stdout.strip()
    except (OSError, subprocess.TimeoutExpired, subprocess.SubprocessError):
        return ""


def _mtime(path: Path) -> float:
    """Get file mtime, safely."""
    try:
        return path.stat().st_mtime
    except OSError:
        return 0.0


def _read_first_lines(path: Path, n: int = 30) -> str:
    """Read first n lines of a file for keyword extraction."""
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as fh:
            return "".join(fh.readline() for _ in range(n))
    except OSError:
        return ""


# ── Git-aware change detection ─────────────────────────────────────────────────


def get_changed_files_since(ref: str = "HEAD") -> list[str]:
    """
    Return list of file paths changed since the given git ref.
    Uses --name-only for minimal output. Falls back to empty list on error.
    """
    output = _run_git(["git", "diff", "--name-only", ref])
    if not output:
        return []
    return [line.strip() for line in output.splitlines() if line.strip()]


def get_staged_files() -> list[str]:
    """Return list of staged file paths."""
    output = _run_git(["git", "diff", "--cached", "--name-only"])
    if not output:
        return []
    return [line.strip() for line in output.splitlines() if line.strip()]


def get_all_changed() -> list[str]:
    """Return all changed files (staged + unstaged), deduped."""
    staged = set(get_staged_files())
    unstaged = set(get_changed_files_since("HEAD"))
    return list(staged | unstaged)


def is_dirty() -> bool:
    """Return True if there are any uncommitted changes."""
    return bool(get_all_changed())


# ── Area classification ────────────────────────────────────────────────────────


def get_area(file_path: str) -> str:
    """
    Classify a file path into one of the project areas.
    Checks path hints first (more specific), then extension, then glob patterns.
    """
    p = file_path.lower()

    # Path hints
    for pattern, area in PATH_AREA_HINTS:
        if pattern.search(p):
            return area

    # Extension-based fallback
    stem = Path(file_path)
    ext = stem.suffix.lower()
    if ext in EXT_LANGUAGE:
        lang = EXT_LANGUAGE[ext]
        if lang in ("typescript", "javascript"):
            if "test" in p or "spec" in p:
                return "tests"
            if "coverage" in p:
                return "coverage"
            return "frontend"
        if lang == "python":
            return "backend"
        if lang == "markdown":
            return "docs"
        if lang == "json":
            if "tsconfig" in p or "vitest" in p or "jest" in p or "prettier" in p or "eslint" in p:
                return "config"
            return "config"

    # Glob-area patterns
    for area, patterns in AREA_PATTERNS.items():
        for pattern in patterns:
            if _path_matches_glob(file_path, pattern):
                return area

    return "config"


def _path_matches_glob(path: str, pattern: str) -> bool:
    """Match a path against a glob pattern (supports ** and *)."""
    from fnmatch import fnmatch
    if "**" in pattern:
        parts = pattern.split("**")
        if len(parts) == 2:
            prefix, suffix = parts
            prefix = prefix.rstrip("/")
            # Simple suffix match after prefix
            if prefix and not path.startswith(prefix):
                return False
            return fnmatch(path, f"*{suffix}") or fnmatch(path, f"**{suffix}")
    return fnmatch(path, pattern) or fnmatch(path, f"**/{pattern}")


# ── Keyword extraction ─────────────────────────────────────────────────────────


def get_file_keywords(path: str | Path) -> set[str]:
    """
    Extract meaningful keywords from a file's content (first 30 lines).
    Used for fast relevance scoring without full parsing.
    """
    p = Path(path)
    keywords: set[str] = set()

    # Add extension-based language keywords
    ext = p.suffix.lower()
    if ext in EXT_LANGUAGE:
        keywords.add(EXT_LANGUAGE[ext])

    # Add name-derived keywords
    name = p.stem.lower()
    for kw_list in RELEVANCE_KEYWORDS.values():
        for kw in kw_list:
            if kw in name:
                keywords.add(kw)

    # Add content-derived keywords (first 30 lines only for speed)
    content = _read_first_lines(p, 30)
    content_lower = content.lower()
    for kw_list in RELEVANCE_KEYWORDS.values():
        for kw in kw_list:
            if kw in content_lower:
                keywords.add(kw)

    return keywords


# ── Project map ────────────────────────────────────────────────────────────────


class ProjectMapCache:
    """
    Cached project map updated on git-change invalidation.
    TTL: 300 s (5 minutes) as a safety net.
    """

    def __init__(self, cache_file: Path = CACHE_FILE):
        self.cache_file = cache_file
        self._cache: dict[str, Any] | None = None
        self._loaded_at: float = 0.0
        self._ttl: float = 300.0
        self._iterations: list[float] = []  # timestamps of each scan

    def get(self, force_refresh: bool = False) -> dict[str, Any]:
        """Return the cached project map, rebuilding if stale."""
        now = timestamp_now()

        if not force_refresh and self._cache is not None:
            if (now - self._loaded_at) < self._ttl:
                return self._cache

        # Check git invalidation
        if not force_refresh and self._cache is not None:
            changed = get_all_changed()
            if not changed:
                return self._cache  # still valid

        self._rebuild()
        self._loaded_at = now
        return self._cache

    def _rebuild(self) -> None:
        """Scan all files and build the project map."""
        log("building project map (full scan)")
        self._cache = self._scan_all_files()
        self._save()
        self._iterations.append(timestamp_now())

    def _scan_all_files(self) -> dict[str, Any]:
        """Walk the project tree and build per-area + per-file data."""
        areas: dict[str, dict[str, Any]] = {}
        files: dict[str, dict[str, Any]] = {}

        for path in _walk_files():
            rel = str(path.relative_to(ROOT))
            area = get_area(rel)

            # Track per-area
            if area not in areas:
                areas[area] = {
                    "files": [],
                    "last_modified": 0.0,
                    "file_count": 0,
                    "total_bytes": 0,
                }

            mtime = _mtime(path)
            areas[area]["files"].append(rel)
            areas[area]["file_count"] += 1
            areas[area]["total_bytes"] += _safe_size(path)
            if mtime > areas[area]["last_modified"]:
                areas[area]["last_modified"] = mtime

            # Track per-file
            keywords = get_file_keywords(path)
            files[rel] = {
                "area": area,
                "mtime": mtime,
                "size": _safe_size(path),
                "keywords": list(keywords),
            }

        # Add computed fields per area
        for area, data in areas.items():
            data["last_modified_iso"] = (
                datetime.fromtimestamp(data["last_modified"], tz=timezone.utc).isoformat()
                if data["last_modified"] else None
            )

        return {"areas": areas, "files": files, "scanned_at": timestamp_now()}

    def invalidate(self) -> None:
        """Force cache invalidation on next access."""
        self._cache = None

    def _save(self) -> None:
        """Persist cache to disk."""
        if self._cache is not None:
            save_json(self.cache_file, self._cache)

    def mark_iteration(self) -> None:
        """Record that a scan iteration occurred (for neglect tracking)."""
        self._iterations.append(timestamp_now())


def _walk_files() -> list[Path]:
    """Walk the project tree, yielding all tracked files."""
    # Use git ls-files for speed and correctness (honors .gitignore)
    output = _run_git(["git", "ls-files", "-z"])
    if not output:
        # Fallback: walk ROOT directly
        return _walk_fallback()

    paths: list[Path] = []
    for entry in output.split("\x00"):
        if entry:
            p = ROOT / entry
            if p.is_file():
                paths.append(p)
    return paths


def _walk_fallback() -> list[Path]:
    """Fallback walker when git ls-files fails."""
    paths: list[Path] = []
    skip_dirs = {".git", "node_modules", ".next", ".nuxt", "dist", "build", ".cache"}
    for item in ROOT.rglob("*"):
        if item.is_file():
            try:
                rel = item.relative_to(ROOT)
            except ValueError:
                continue
            if any(part in skip_dirs for part in rel.parts):
                continue
            paths.append(item)
    return paths


def _safe_size(path: Path) -> int:
    """Return file size in bytes, safely."""
    try:
        return path.stat().st_size
    except OSError:
        return 0


# ── Neglected area detection ───────────────────────────────────────────────────


def get_neglected_areas(
    min_iterations: int = 5,
    cache: ProjectMapCache | None = None,
) -> list[str]:
    """
    Return areas that have NOT been modified in the last N iterations.
    An area is 'neglected' if no files in it appear in git diffs for those iterations.
    """
    if cache is None:
        cache = _global_cache()

    data = cache.get()
    areas_data: dict[str, dict[str, Any]] = data.get("areas", {})

    # Track which areas were touched in recent iterations
    iteration_count = len(cache._iterations)
    if iteration_count < min_iterations:
        # Not enough data — return areas with oldest last_modified
        sorted_areas = sorted(
            areas_data.items(),
            key=lambda kv: kv[1].get("last_modified", 0),
        )
        return [area for area, _ in sorted_areas[:3]]

    # Get changed files for recent iterations (simplified: use recent git diff)
    recently_changed = set(get_changed_files_since("HEAD~" + str(min(iterations_for_lookup(iteration_count, min_iterations)))))

    neglected: list[str] = []
    for area, area_info in areas_data.items():
        area_files: list[str] = area_info.get("files", [])
        touched = bool(recently_changed & set(area_files))
        if not touched:
            neglected.append(area)

    return neglected


def iterations_for_lookup(total: int, min_iter: int) -> int:
    """Return how many commits back to look for changes."""
    return min(total, max(min_iter, 5))


# ── Relevance scoring ───────────────────────────────────────────────────────────


def score_files_for_goal(
    goal: str,
    max_files: int = 10,
    cache: ProjectMapCache | None = None,
) -> list[tuple[float, str]]:
    """
    Score all files by relevance to a natural-language goal.

    Score = keyword_match * recency_boost * area_boost

    - keyword_match: how many goal keywords match the file's keyword set
    - recency_boost: files modified recently score higher (max 2x)
    - area_boost: files in the most-relevant area for the goal score higher
    """
    if cache is None:
        cache = _global_cache()

    data = cache.get()
    files_data: dict[str, dict[str, Any]] = data.get("files", {})

    goal_lower = goal.lower()
    goal_keywords = _extract_goal_keywords(goal_lower)

    # Score each file
    scored: list[tuple[float, str]] = []
    now = timestamp_now()
    newest_mtime = max((f.get("mtime", 0) for f in files_data.values()), default=now)

    for rel_path, info in files_data.items():
        keywords: set[str] = set(info.get("keywords", []))
        file_keywords = {k.lower() for k in keywords}

        # Keyword match (0-1)
        if goal_keywords:
            matches = len(goal_keywords & file_keywords)
            keyword_score = matches / len(goal_keywords)
        else:
            keyword_score = 0.0

        # Recency boost (1-2)
        mtime = info.get("mtime", 0)
        if newest_mtime > 0:
            age_ratio = min(1.0, (now - mtime) / (7 * 86400))  # 7-day window
            recency_boost = 2.0 - age_ratio
        else:
            recency_boost = 1.0

        # Area boost based on goal keywords
        area_boost = _area_boost_for_goal(rel_path, goal_keywords)

        score = keyword_score * recency_boost * area_boost
        scored.append((score, rel_path))

    scored.sort(key=lambda x: x[0], reverse=True)
    return scored[:max_files]


def _extract_goal_keywords(goal: str) -> set[str]:
    """Extract meaningful keywords from a goal string."""
    # Stop words to ignore
    stop = {
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "must", "shall", "can", "need", "to", "of",
        "in", "for", "on", "with", "at", "by", "from", "as", "into", "through",
        "during", "before", "after", "above", "below", "between", "under",
        "again", "further", "then", "once", "here", "there", "when", "where",
        "why", "how", "all", "each", "few", "more", "most", "other", "some",
        "such", "no", "nor", "not", "only", "own", "same", "so", "than",
        "too", "very", "just", "and", "but", "if", "or", "because", "until",
        "while", "about", "against", "this", "that", "these", "those",
    }
    # Pull keywords from RELEVANCE_KEYWORDS that appear in goal
    all_kw: set[str] = set()
    for kw_list in RELEVANCE_KEYWORDS.values():
        all_kw.update(kw_list)

    words = re.findall(r"[a-z0-9+_#]+", goal.lower())
    return {w for w in words if len(w) > 2 and w not in stop and w in all_kw}


def _area_boost_for_goal(rel_path: str, goal_keywords: set[str]) -> float:
    """Return a 1.0-2.0 boost based on area relevance to goal keywords."""
    area_keywords: dict[str, list[str]] = {
        "auth":        RELEVANCE_KEYWORDS["auth"],
        "database":    RELEVANCE_KEYWORDS["database"],
        "api":        RELEVANCE_KEYWORDS["api"],
        "frontend":   RELEVANCE_KEYWORDS["frontend"],
        "testing":    RELEVANCE_KEYWORDS["testing"],
        "performance": RELEVANCE_KEYWORDS["performance"],
        "devops":     RELEVANCE_KEYWORDS["devops"],
        "security":   RELEVANCE_KEYWORDS["security"],
        "state":      RELEVANCE_KEYWORDS["state"],
    }
    best: float = 1.0
    for area, kw_list in area_keywords.items():
        kw_set = set(kw_list)
        if kw_set & goal_keywords:
            boost = 1.5
            if area in rel_path.lower():
                boost = 2.0
            best = max(best, boost)
    return best


# ── Parallel file scanner ──────────────────────────────────────────────────────


def parallel_scan_files(paths: list[Path], max_workers: int = 4, timeout: float = 0.1) -> dict[str, dict[str, Any]]:
    """
    Scan a list of files in parallel using ThreadPoolExecutor.
    Each file gets a quick keyword extraction + mtime + size.
    Returns {rel_path: {keywords, mtime, size, area}}.
    """
    results: dict[str, dict[str, Any]] = {}

    def _scan_one(p: Path) -> tuple[str, dict[str, Any]]:
        rel = str(p.relative_to(ROOT))
        keywords = get_file_keywords(p)
        return rel, {
            "keywords": list(keywords),
            "mtime": _mtime(p),
            "size": _safe_size(p),
            "area": get_area(rel),
        }

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(_scan_one, p): p for p in paths}
        for future in as_completed(futures, timeout=timeout * len(paths)):
            try:
                rel, info = future.result()
                results[rel] = info
            except Exception:
                pass

    return results


# ── Main scanner class ─────────────────────────────────────────────────────────


class ProjectScannerV2:
    """
    Ultra-fast project analysis scanner using git-aware change detection.

    Key methods:
      get_changed_files(ref)  → list of changed file paths since ref
      is_dirty()              → bool (any uncommitted changes?)
      get_area(file_path)     → area string for this file
      get_project_map()       → cached project map dict
      get_neglected_areas()   → list of neglected area names
      score_files_for_goal()  → top-N files scored by relevance
      invalidate_cache()      → force cache rebuild on next access
    """

    def __init__(self, root: Path = ROOT):
        self.ROOT = root
        self._cache = ProjectMapCache(cache_file=CACHE_FILE)

    # ── Git-aware change detection ───────────────────────────────────────────

    def get_changed_files(self, ref: str = "HEAD") -> list[str]:
        """Return list of files changed since git ref."""
        return get_changed_files_since(ref)

    def is_dirty(self) -> bool:
        """Return True if there are uncommitted changes."""
        return is_dirty()

    # ── Area classification ─────────────────────────────────────────────────

    def get_area(self, file_path: str) -> str:
        """Return the project area for a file path."""
        return get_area(file_path)

    # ── Project map ─────────────────────────────────────────────────────────

    def get_project_map(self, force_refresh: bool = False) -> dict[str, Any]:
        """
        Return the cached project map.

        The map is a dict with:
          areas: {area_name: {files, last_modified, file_count, total_bytes, last_modified_iso}}
          files: {rel_path: {area, mtime, size, keywords}}
          scanned_at: Unix timestamp
        """
        return self._cache.get(force_refresh=force_refresh)

    # ── Neglected area detection ────────────────────────────────────────────

    def get_neglected_areas(self, min_iterations: int = 5) -> list[str]:
        """
        Return list of area names that have not been modified recently.
        Uses git change detection to determine which areas are neglected.
        """
        return get_neglected_areas(min_iterations=min_iterations, cache=self._cache)

    # ── Relevance scoring ───────────────────────────────────────────────────

    def score_files_for_goal(self, goal: str, max_files: int = 10) -> list[tuple[float, str]]:
        """
        Score files by relevance to a goal string.
        Returns list of (score, rel_path) tuples, sorted descending.
        """
        return score_files_for_goal(goal=goal, max_files=max_files, cache=self._cache)

    # ── Cache management ─────────────────────────────────────────────────────

    def invalidate_cache(self) -> None:
        """Force cache invalidation."""
        self._cache.invalidate()

    def _build_cache(self) -> None:
        """Explicitly build/rebuild the cache now."""
        self._cache.get(force_refresh=True)

    # ── Quick scan (git-diff only) ──────────────────────────────────────────

    def quick_scan(self) -> dict[str, Any]:
        """
        Return data only for changed files (ultra-fast, < 50 ms).
        Does NOT trigger a full cache rebuild.
        Returns {changed_files: [...], staged_files: [...], areas: {area: [files]}}.
        """
        changed = get_all_changed()
        staged = get_staged_files()
        by_area: dict[str, list[str]] = {}
        for f in changed:
            area = get_area(f)
            if area not in by_area:
                by_area[area] = []
            by_area[area].append(f)

        return {
            "changed_files": changed,
            "staged_files": staged,
            "by_area": by_area,
            "is_dirty": bool(changed or staged),
        }

    # ── Single file scan ────────────────────────────────────────────────────

    def _scan_file(self, path: Path) -> dict[str, Any]:
        """
        Scan a single file and return its metadata dict.
        Returns {area, mtime, size, keywords}.
        """
        rel = str(path.relative_to(self.ROOT))
        return {
            "area": get_area(rel),
            "mtime": _mtime(path),
            "size": _safe_size(path),
            "keywords": list(get_file_keywords(path)),
        }

    # ── Parallel scan of specific files ─────────────────────────────────────


# ── Global singleton ───────────────────────────────────────────────────────────

_global_scanner: Optional[ProjectScannerV2] = None
_global_cache: "ProjectMapCache | None" = None


def _global_cache() -> ProjectMapCache:
    global _global_cache
    if _global_cache is None:
        _global_cache = ProjectMapCache()
    return _global_cache


def get_scanner() -> ProjectScannerV2:
    """Return or create the module-level ProjectScannerV2 singleton."""
    global _global_scanner
    if _global_scanner is None:
        _global_scanner = ProjectScannerV2()
    return _global_scanner


# ── CLI ───────────────────────────────────────────────────────────────────────

def _cli() -> None:
    """Simple CLI for quick inspection."""
    import argparse
    parser = argparse.ArgumentParser(description="project_scanner_v2")
    parser.add_argument("--scan", action="store_true", help="full project map")
    parser.add_argument("--quick", action="store_true", help="quick scan (changed files only)")
    parser.add_argument("--dirty", action="store_true", help="check if dirty")
    parser.add_argument("--neglected", action="store_true", help="show neglected areas")
    parser.add_argument("--goal", type=str, help="score files for a goal")
    parser.add_argument("--changed", type=str, default="HEAD", help="git ref for changed files")
    args = parser.parse_args()

    scanner = get_scanner()

    if args.dirty:
        print(f"dirty={scanner.is_dirty()}")
    elif args.quick:
        result = scanner.quick_scan()
        print(json.dumps(result, indent=2, default=str))
    elif args.neglected:
        areas = scanner.get_neglected_areas()
        print("neglected areas:", areas)
    elif args.goal:
        scored = scanner.score_files_for_goal(args.goal)
        print(f"top files for: {args.goal}")
        for score, path in scored:
            print(f"  {score:.3f}  {path}")
    elif args.changed:
        files = scanner.get_changed_files(args.changed)
        print(f"changed since {args.changed}: {len(files)} files")
        for f in files[:20]:
            print(f"  {f}")
    else:
        # Default: full scan summary
        pm = scanner.get_project_map()
        areas = pm.get("areas", {})
        print(f"project_scanner_v2 — {len(areas)} areas, scanned at {pm.get('scanned_at')}")
        for name, info in sorted(areas.items()):
            print(f"  {name}: {info.get('file_count', 0)} files, last modified {info.get('last_modified_iso', 'unknown')}")


if __name__ == "__main__":
    _cli()
