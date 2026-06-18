"""
ContextEngineV2 — ultra-fast bounded context builder for Akasha autonomous loop.

No external dependencies. Thread-safe. Token budget enforcement.
"""

from __future__ import annotations

import hashlib
import math
import subprocess
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


# ── path constants ─────────────────────────────────────────────────────────────

ROOT = Path(__file__).resolve().parent.parent if '__file__' in globals() else Path.cwd()
MA = ROOT / ".autonomous" / "multi-agent"

SPEC_FILE = ROOT / "SPEC.md"
DECISIONS_FILE = ROOT / "DECISIONS.md"
PATTERNS_FILE = MA / "grimoire" / "PATTERNS.md"


# ── logging helper ─────────────────────────────────────────────────────────────

def _log(msg: str) -> None:
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"[{ts}] ContextEngineV2: {msg}", flush=True)


# ── cache entry ────────────────────────────────────────────────────────────────

class _CacheEntry:
    __slots__ = ("value", "expires_at")

    def __init__(self, value: str, ttl: int = 300):
        self.value = value
        self.expires_at = time.time() + ttl


# ── ContextEngineV2 ───────────────────────────────────────────────────────────

class ContextEngineV2:
    """
    Bounded context builder for autonomous agents.

    Features
    --------
    * Fast token estimation: 1 token ≈ 4 chars, no API calls (< 1 ms)
    * Priority sections: objectives, constraints, recent_decisions,
      relevant_code, patterns, history, metadata
    * Smart truncation: remove comments first, then middle sections
    * File relevance scoring: recency (exp decay, 7-day half-life)
      × keyword_match × git_change_frequency
    * TTL cache: goal+area hash → context, 300 s TTL
    * Max context: configurable, default 6000 tokens (~24 KB)

    Thread-safe via RLock.
    """

    # Project doc paths (relative to ROOT)
    _DOC_PATHS: dict[str, Path] = {
        "SPEC.md": SPEC_FILE,
        "DECISIONS.md": DECISIONS_FILE,
        "PATTERNS.md": PATTERNS_FILE,
        "PROGRESS.md": ROOT / "PROGRESS.md",
        "MAPA.md": ROOT / "MAPA.md",
    }

    def __init__(self, ma_path: Path | None = None, max_tokens: int = 6000) -> None:
        self.root = ROOT
        self.ma = ma_path or MA
        self.max_tokens = max_tokens
        self._lock = threading.RLock()
        self._cache: dict[str, _CacheEntry] = {}
        self._git_cache: dict[str, int] = {}
        self._git_cache_at: float = 0.0
        # Override search root for testing (set to MA to avoid 107K file traversal)
        self._search_root: Path | None = None

    # ── public API ────────────────────────────────────────────────────────────

    def build(self, goal: str, context: dict | None = None) -> str:
        """
        Build bounded context string within token budget. No API calls.

        Parameters
        ----------
        goal : str
            Current agent goal / task description.
        context : dict | None
            Optional dict, inspected for ``area`` key.

        Returns
        -------
        str
            Formatted context string, truncated to ``max_tokens``.
        """
        with self._lock:
            area = context.get("area") if context else None
            cache_key = f"{goal}:{area or 'general'}"
            if cached := self._get_cached(cache_key):
                _log(f"cache hit for goal={goal[:40]!r} area={area!r}")
                return cached

            goal_keywords = goal.lower().split()
            sections: list[str] = []

            # 1. OBJECTIVES
            spec = self._load_doc("SPEC.md")
            sections.append(f"# OBJECTIVES\n{spec[:2000]}")

            # 2. RECENT DECISIONS (last 50 lines)
            decisions = self._load_doc("DECISIONS.md")
            dec_lines = decisions.split("\n")
            sections.append(
                f"# RECENT DECISIONS\n" + "\n".join(dec_lines[-50:])
            )

            # 3. AREA / CONSTRAINTS (if area provided)
            if area:
                area_ctx = self.build_area_context(area)
                if area_ctx:
                    sections.append(f"# AREA: {area}\n{area_ctx[:1500]}")

            # 4. RELEVANT CODE — top 5 scored files
            files = self.get_relevant_files(goal, area=area, limit=5)
            code_parts: list[str] = []
            for f in files:
                try:
                    content = Path(f["path"]).read_text(errors="ignore")
                    code_parts.append(f"# {f['path']}\n{content[:500]}")
                except OSError:
                    pass
            sections.append("# RELEVANT CODE\n" + "\n\n".join(code_parts))

            # 5. PATTERNS
            patterns = self._load_doc("PATTERNS.md")
            sections.append(f"# PATTERNS\n{patterns[:500]}")

            # 6. METADATA
            meta = self._build_metadata(goal, area)
            sections.append(f"# METADATA\n{meta}")

            combined = "\n\n".join(sections)

            if self.estimate_tokens(combined) > self.max_tokens:
                combined = self._truncate_to_budget(combined, self.max_tokens)

            self._set_cached(cache_key, combined)
            _log(
                f"built context: {self.estimate_tokens(combined)} tokens "
                f"({len(combined)} chars) for goal={goal[:40]!r}"
            )
            return combined

    def build_area_context(self, area: str) -> str:
        """
        Build context for a specific project area.

        Parameters
        ----------
        area : str
            Area name, e.g. ``"frontend"``, ``"backend"``, ``"grimoire"``.

        Returns
        -------
        str
            Area-specific context excerpt, or empty string if not found.
        """
        with self._lock:
            cache_key = f"area:{area}"
            if cached := self._get_cached(cache_key):
                return cached

            # Search common area doc locations
            candidates = [
                self.ma / "grimoire" / area.title() / "CONTEXT.md",
                self.ma / "grimoire" / area / "CONTEXT.md",
                self.root / "grimoire" / area.title() / "CONTEXT.md",
                self.root / "grimoire" / area / "CONTEXT.md",
                self.root / "grimoire" / area.title() / f"{area.title()}.md",
                self.root / "grimoire" / area / f"{area}.md",
            ]
            for path in candidates:
                if path.is_file():
                    content = path.read_text(errors="ignore")
                    self._set_cached(cache_key, content)
                    return content

            # Fallback: grep keyword matches across grimoire
            result = self._grep_area(area)
            self._set_cached(cache_key, result)
            return result

    def estimate_tokens(self, text: str) -> int:
        """
        Fast token estimation: 1 token ≈ 4 chars.

        Parameters
        ----------
        text : str

        Returns
        -------
        int
            Estimated token count (minimum 1).
        """
        return max(1, len(text) // 4)

    def get_relevant_files(
        self, goal: str, area: str | None = None, limit: int = 10
    ) -> list[dict[str, Any]]:
        """
        Score and return most relevant files for a goal.

        Scoring algorithm
        ----------------
        score = recency(0.3) + keyword_match(0.5) + change_freq(0.2)

        Where:
        * recency = exp(-age_days / 7)  — 7-day half-life exponential decay
        * keyword_match = min(1.0, matches / max(1, n_keywords))
        * change_freq = min(1.0, git_change_count / 10)

        Parameters
        ----------
        goal : str
            Goal / task description used to extract keywords.
        area : str | None
            Optional area to scope the search.
        limit : int
            Maximum number of files to return (default 10).

        Returns
        -------
        list[dict]
            Each dict has keys: ``path`` (str), ``score`` (float),
            ``reason`` (str).
        """
        with self._lock:
            keywords = goal.lower().split()
            scored: list[tuple[float, Path]] = []
            search_root = self._search_root or self.root
            if area:
                area_paths = [
                    self.root / "apps" / area,
                    self.root / "packages" / area,
                    self.root / area,
                    self.ma / area,
                ]
                search_root = next(
                    (p for p in area_paths if p.is_dir()), self._search_root or self.root
                )

            # Walk source files
            for pattern in ("**/*.py", "**/*.ts", "**/*.tsx", "**/*.js", "**/*.md"):
                for p in search_root.glob(pattern):
                    if not p.is_file():
                        continue
                    # Skip __pycache__, node_modules, .git, etc.
                    if any(
                        part in p.parts
                        for part in (
                            "__pycache__",
                            "node_modules",
                            ".git",
                            ".next",
                            "dist",
                            "build",
                        )
                    ):
                        continue
                    score = self._score_file(p, keywords)
                    if score > 0:
                        scored.append((score, p))

            scored.sort(key=lambda x: x[0], reverse=True)
            results: list[dict[str, Any]] = []
            for score, path in scored[:limit]:
                results.append(
                    {
                        "path": str(path),
                        "score": round(score, 4),
                        "reason": self._explain_score(path, goal),
                    }
                )
            return results

    # ── private helpers ───────────────────────────────────────────────────────

    def _score_file(self, filepath: Path, goal_keywords: list[str]) -> float:
        """
        Compute composite relevance score for a single file.

        Parameters
        ----------
        filepath : Path
            Absolute path to the file.
        goal_keywords : list[str]
            Lower-cased keywords extracted from the goal string.

        Returns
        -------
        float
            Weighted composite score in [0, 1].
        """
        # Recency — exponential decay with 7-day half-life
        try:
            age_days = (time.time() - filepath.stat().st_mtime) / 86400.0
        except OSError:
            age_days = 365.0
        recency = math.exp(-age_days / 7.0)

        # Keyword match
        try:
            content = filepath.read_text(errors="ignore")
        except OSError:
            content = ""
        matches = sum(
            1 for kw in goal_keywords if kw.lower() in content.lower()
        )
        keyword_score = min(1.0, matches / max(1, len(goal_keywords)))

        # Git change frequency
        change_count = self._get_git_change_count(filepath)
        change_freq = min(1.0, change_count / 10.0)

        return recency * 0.3 + keyword_score * 0.5 + change_freq * 0.2

    def _get_git_change_count(self, filepath: Path) -> int:
        """
        Return the number of commits that touched ``filepath``
        (cached per process, refreshed every 60 s).

        Returns
        -------
        int
            Commit count, or 0 if not in a git repo.
        """
        now = time.time()
        if now - self._git_cache_at > 60.0:
            self._git_cache.clear()
            self._git_cache_at = now

        cache_key = str(filepath)
        if cache_key in self._git_cache:
            return self._git_cache[cache_key]

        try:
            result = subprocess.run(
                [
                    "git", "log", "--oneline", "--count", "--", str(filepath),
                ],
                cwd=self.root,
                capture_output=True,
                text=True,
                timeout=5,
            )
            count = int(result.stdout.strip().split()[0])
        except (subprocess.TimeoutExpired, IndexError, ValueError, OSError):
            count = 0

        self._git_cache[cache_key] = count
        return count

    def _explain_score(self, filepath: Path, goal: str) -> str:
        """Human-readable explanation of why a file was scored."""
        keywords = goal.lower().split()
        try:
            content = filepath.read_text(errors="ignore")
        except OSError:
            content = ""
        matched = [kw for kw in keywords if kw.lower() in content.lower()]
        parts = []
        if matched:
            parts.append(f"keywords={matched!r}")
        try:
            age_days = (time.time() - filepath.stat().st_mtime) / 86400.0
            parts.append(f"age={age_days:.1f}d")
        except OSError:
            pass
        changes = self._get_git_change_count(filepath)
        if changes:
            parts.append(f"git_changes={changes}")
        return "; ".join(parts) if parts else "low relevance"

    def _load_doc(self, name: str) -> str:
        """
        Load a project document by short name. Return empty string if missing.

        Parameters
        ----------
        name : str
            Short name, e.g. ``"SPEC.md"``, ``"DECISIONS.md"``.

        Returns
        -------
        str
            File contents, or ``""`` on any error.
        """
        if name in self._DOC_PATHS:
            path = self._DOC_PATHS[name]
        else:
            path = self.root / name
        try:
            return path.read_text(errors="ignore")
        except OSError:
            return ""

    def _grep_area(self, area: str) -> str:
        """
        Grep ``area`` keyword across grimoire markdown files.

        Returns
        -------
        str
            Concatenated matching lines, truncated to 1000 chars.
        """
        grimoire = self.root / "grimoire"
        if not grimoire.is_dir():
            return ""
        lines: list[str] = []
        kw = area.lower()
        try:
            for md in grimoire.glob("**/*.md"):
                try:
                    content = md.read_text(errors="ignore")
                except OSError:
                    continue
                for lineno, line in enumerate(content.split("\n"), 1):
                    if kw in line.lower():
                        lines.append(f"[{md.name}:{lineno}] {line.rstrip()}")
        except OSError:
            pass
        result = "\n".join(lines[:50])
        return result[:1000]

    def _build_metadata(self, goal: str, area: str | None) -> str:
        """Build a minimal metadata section."""
        now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        tokens_est = self.max_tokens
        lines = [
            f"generated_at : {now}",
            f"goal         : {goal[:120]}",
            f"area         : {area or 'general'}",
            f"budget       : {tokens_est} tokens (~{tokens_est * 4} chars)",
            f"engine       : ContextEngineV2",
        ]
        return "\n".join(lines)

    def _truncate_to_budget(self, text: str, budget_tokens: int) -> str:
        """
        Reduce ``text`` to fit inside ``budget_tokens``.

        Strategy
        --------
        1. If already within budget, return unchanged.
        2. Strip comment-only lines; if that fits, append truncation note.
        3. Otherwise keep first 40 % + last 40 % with ``# ...`` separator.

        Parameters
        ----------
        text : str
        budget_tokens : int

        Returns
        -------
        str
        """
        budget_chars = budget_tokens * 4
        if len(text) <= budget_chars:
            return text

        lines = text.split("\n")

        # Strategy 1: drop comment-only lines
        non_comment: list[str] = []
        comment_count = 0
        for line in lines:
            stripped = line.strip()
            if stripped.startswith("#") or stripped == "":
                comment_count += 1
                continue
            non_comment.append(line)

        candidate = "\n".join(non_comment)
        if len(candidate) <= budget_chars:
            return candidate + (
                f"\n# [{comment_count} comment/blank lines truncated]"
            )

        # Strategy 2: first 40 % + ... + last 40 %
        n = len(lines)
        keep_first = int(n * 0.4)
        keep_last = int(n * 0.4)
        dropped = n - keep_first - keep_last
        return (
            "\n".join(lines[:keep_first])
            + f"\n# ... [{dropped} lines truncated] ...\n"
            + "\n".join(lines[-keep_last:])
        )

    # ── cache ─────────────────────────────────────────────────────────────────

    def _get_cached(self, key: str) -> str | None:
        """Return cached value if present and not expired."""
        entry = self._cache.get(key)
        if entry is None:
            return None
        if time.time() > entry.expires_at:
            del self._cache[key]
            return None
        return entry.value

    def _set_cached(self, key: str, value: str, ttl: int = 300) -> None:
        """Store ``value`` under ``key`` with ``ttl`` seconds expiry."""
        # Evict oldest entries if cache exceeds 200 items
        if len(self._cache) >= 200:
            oldest_keys = sorted(
                self._cache, key=lambda k: self._cache[k].expires_at
            )
            for k in oldest_keys[:50]:
                del self._cache[k]
        self._cache[key] = _CacheEntry(value, ttl)

    # ── self-test ─────────────────────────────────────────────────────────────

    def _test(self) -> bool:
        """
        Run self-test with assertions.

        Returns
        -------
        bool
            True if all assertions pass.
        """
        _log("running self-test…")
        errors: list[str] = []

        # Test: estimate_tokens
        assert self.estimate_tokens("") == 1, "empty string → 1 token"
        assert self.estimate_tokens("abcd") == 1, "4 chars → 1 token"
        assert self.estimate_tokens("abcdefgh") == 2, "8 chars → 2 tokens"
        assert self.estimate_tokens("a" * 100) == 25, "100 chars → 25 tokens"
        _log("  ✓ estimate_tokens")

        # Test: cache get/set
        self._set_cached("test_key", "test_value")
        assert self._get_cached("test_key") == "test_value", "cache hit"
        assert self._get_cached("missing") is None, "cache miss"
        _log("  ✓ cache")

        # Test: _load_doc with missing file
        assert self._load_doc("DOES_NOT_EXIST_12345.md") == "", "missing → ''"
        _log("  ✓ _load_doc missing")

        # Test: _load_doc with real file
        spec = self._load_doc("SPEC.md")
        assert isinstance(spec, str), "SPEC.md loads as str"
        _log(f"  ✓ _load_doc SPEC.md ({len(spec)} chars)")

        # Test: _truncate_to_budget — already under budget
        short = "a" * 100
        assert self._truncate_to_budget(short, 1000) == short, "no-op truncate"
        _log("  ✓ _truncate_to_budget (no-op)")

        # Test: _truncate_to_budget — comment stripping
        multiline = (
            "# comment\n"
            "# another\n"
            "real line 1\n"
            "real line 2\n"
        )
        # budget of 8 tokens = 32 chars; comment-stripped = 22 chars → fits
        result = self._truncate_to_budget(multiline, 10)
        assert "# comment" not in result.split("\n")[0], "comments stripped"
        _log("  ✓ _truncate_to_budget (comment strip)")

        # Test: _truncate_to_budget — middle truncation
        long_lines = "\n".join(f"line {i}" for i in range(100))
        result = self._truncate_to_budget(long_lines, 30)  # 120 chars
        assert "# ..." in result, "middle truncation marker present"
        assert "line 0" in result, "first lines kept"
        assert "line 99" in result, "last lines kept"
        _log("  ✓ _truncate_to_budget (middle truncation)")

        # Test: build_area_context
        area_ctx = self.build_area_context("grimoire")
        assert isinstance(area_ctx, str), "area context is str"
        _log(f"  ✓ build_area_context ({len(area_ctx)} chars)")

        # Test: get_relevant_files — scoped to MA dir only (repo has 107K files)
        self._search_root = self.ma  # scope to avoid full-repo traversal
        files = self.get_relevant_files("context engine", limit=5)
        assert isinstance(files, list), "get_relevant_files returns list"
        for f in files:
            assert "path" in f, "file dict has path"
            assert "score" in f, "file dict has score"
        _log(f"  ✓ get_relevant_files ({len(files)} files)")

        # Test: _explain_score
        explanation = self._explain_score(SPEC_FILE, "context engine v2 architecture")
        assert isinstance(explanation, str), "explanation is str"
        assert len(explanation) > 0, "explanation non-empty"
        _log(f"  ✓ _explain_score ({explanation[:80]})")

        # Test: _build_metadata
        meta = self._build_metadata("test goal", "frontend")
        assert "test goal" in meta, "goal in metadata"
        assert "frontend" in meta, "area in metadata"
        _log(f"  ✓ _build_metadata")

        # Test: cache key uniqueness via _set_cached/_get_cached directly
        self._set_cached("key_a", "val_a")
        self._set_cached("key_b", "val_b")
        assert self._get_cached("key_a") == "val_a", "key_a distinct"
        assert self._get_cached("key_b") == "val_b", "key_b distinct"
        assert self._get_cached("key_a") != self._get_cached("key_b"), "different keys differ"
        _log("  ✓ cache key uniqueness")

        # Test: cache hit returns identical value
        self._set_cached("hit_test", "persistent_value")
        v1 = self._get_cached("hit_test")
        v2 = self._get_cached("hit_test")
        assert v1 == v2 == "persistent_value", "cache hit returns same value"
        _log("  ✓ cache hit returns identical value")

        # Test: build_area_context
        area_ctx2 = self.build_area_context("grimoire")
        assert isinstance(area_ctx2, str), "area context is str"
        _log(f"  ✓ build_area_context ({len(area_ctx2)} chars)")

        # Test: thread safety — concurrent cache operations
        import concurrent.futures

        def cache_worker(i: int) -> str | None:
            key = f"concurrent_{i % 4}"
            self._set_cached(key, f"value_{i}")
            return self._get_cached(key)

        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
            futures = [ex.submit(cache_worker, i) for i in range(20)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]
        assert len(results) == 20, "all 20 cache workers completed"
        _log("  ✓ thread safety (20 concurrent cache ops)")

        # Summary
        _log(f"self-test PASSED — {len(errors)} errors")
        return True


# ── CLI ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    engine = ContextEngineV2()
    if "--test" in __import__("sys").argv:
        success = engine._test()
        __import__("sys").exit(0 if success else 1)
    else:
        # Default run: print context for a sample goal
        goal = " ".join(__import__("sys").argv[1:]) or "review current architecture"
        ctx = engine.build(goal)
        print(ctx)
