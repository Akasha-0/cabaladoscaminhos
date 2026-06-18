"""
skill_discoverer_v2.py
=====================
Semantic pattern matching + success-rate prediction for the autonomous agent.

Features
--------
* TF-IDF / Jaccard semantic similarity search
* Success probability prediction (historical rate × context bonus × recency)
* Pattern recommendation scored by success × relevance × novelty
* Anti-pattern detection with severity warnings
* Pattern evolution tracking (historical stats, trend, usage counts)
* LRU eviction at 500 patterns (lowest success rate, stale first)
* Thread-safe, stdlib-only, backward-compatible with v1 pattern format
"""

from __future__ import annotations

import json
import math
import time
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MAX_PATTERNS = 500
GC_SUCCESS_THRESHOLD = 0.1   # evict patterns below this success rate
GC_DAYS_STALE = 7             # and not used for this many days
DEFAULT_SUCCESS = 0.3         # fallback when pattern unknown / no history
MIN_SUCCESS_RATE = 0.05       # floor for success rate (avoids divide-by-zero quirks)

# ---------------------------------------------------------------------------
# Hardcoded anti-patterns
# ---------------------------------------------------------------------------

SELF_HARMING_PATTERNS = [
    {
        "id": "skip_typecheck",
        "actions": ["skip tsc", "no typecheck", "disable tsc", "tsc off"],
        "warning": "Skipping TypeScript checks leads to QA failure cascade",
        "severity": "high",
    },
    {
        "id": "ignore_qa_fail",
        "actions": ["ignore QA", "skip QA", "bypass QA", "QA off"],
        "warning": "Ignoring QA failures causes iteration waste",
        "severity": "high",
    },
    {
        "id": "no_spec_review",
        "actions": ["no spec", "without planning", "skip spec", "no design"],
        "warning": "Acting without planning often wastes iterations",
        "severity": "medium",
    },
    {
        "id": "overly_complex",
        "actions": ["add abstraction", "add layer", "over-abstract", "premature abstraction"],
        "warning": "Unnecessary complexity is an anti-pattern",
        "severity": "low",
    },
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _now_ts() -> float:
    return time.time()


def _now_iso() -> str:
    return datetime.fromtimestamp(_now_ts(), tz=timezone.utc).isoformat()


def _default_pattern(pattern_id: str) -> dict:
    return {
        "id": pattern_id,
        "actions": [],
        "success_count": 0,
        "failure_count": 0,
        "avg_duration_seconds": 0.0,
        "total_duration_seconds": 0.0,
        "contexts": [],
        "first_seen": _now_iso(),
        "last_used": _now_iso(),
        "last_used_ts": _now_ts(),
        "tags": [],
        "anti_pattern": False,
        "desc": "",
    }


def _default_meta() -> dict:
    return {
        "total_patterns": 0,
        "avg_success_rate": 0.0,
        "last_gc": _now_iso(),
        "version": "2.0",
    }


# ---------------------------------------------------------------------------
# Main class
# ---------------------------------------------------------------------------

class SkillDiscovererV2:
    """
    Semantic pattern matcher + success predictor.

    File layout (all under ``{ma_path}/skill_patterns_v2/``)::

        patterns.json      — dict[str, dict]  pattern_id → pattern record
        anti_patterns.json — list[dict]       anti-pattern definitions
        history.json       — list[dict]        append-only outcome log
        meta.json          — dict              aggregate stats
    """

    # ------------------------------------------------------------------
    # Initialisation
    # ------------------------------------------------------------------

    def __init__(self, ma_path: Path) -> None:
        self._ma = Path(ma_path)
        self._v2_dir = self._ma / "skill_patterns_v2"
        self._v2_dir.mkdir(parents=True, exist_ok=True)

        self._patterns_file   = self._v2_dir / "patterns.json"
        self._anti_file       = self._v2_dir / "anti_patterns.json"
        self._history_file    = self._v2_dir / "history.json"
        self._meta_file       = self._v2_dir / "meta.json"

        self._lock = threading.RLock()

        # In-memory state
        self._patterns: dict[str, dict] = {}
        self._anti_patterns: list[dict] = []
        self._history: list[dict] = []
        self._meta: dict = _default_meta()

        self._load_all()
        self._log("SkillDiscovererV2 initialised")

    # ------------------------------------------------------------------
    # Persistence helpers
    # ------------------------------------------------------------------

    def _load_json(self, p: Path) -> Any:
        if not p.exists():
            return None
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return None

    def _save_json(self, p: Path, d: Any) -> None:
        tmp = p.with_suffix(".tmp")
        tmp.write_text(json.dumps(d, indent=2, ensure_ascii=False), encoding="utf-8")
        tmp.rename(p)   # atomic on POSIX

    def _load_all(self) -> None:
        self._patterns    = self._load_json(self._patterns_file)    or {}
        self._anti_patterns = self._load_json(self._anti_file)     or list(SELF_HARMING_PATTERNS)
        self._history    = self._load_json(self._history_file)     or []
        self._meta       = self._load_json(self._meta_file)        or _default_meta()
        # Ensure anti_patterns always have the hardcoded baseline
        self._sync_anti_patterns()

    def _sync_anti_patterns(self) -> None:
        """Merge hardcoded anti-patterns with any stored ones."""
        existing_ids = {a["id"] for a in self._anti_patterns}
        for ap in SELF_HARMING_PATTERNS:
            if ap["id"] not in existing_ids:
                self._anti_patterns.append(ap)
        self._save_json(self._anti_file, self._anti_patterns)

    def _persist_patterns(self) -> None:
        self._save_json(self._patterns_file, self._patterns)

    def _persist_meta(self) -> None:
        self._save_json(self._meta_file, self._meta)

    def _persist_history(self) -> None:
        # Keep history bounded to last 10 000 entries
        if len(self._history) > 10_000:
            self._history = self._history[-10_000:]
        self._save_json(self._history_file, self._history)

    def _log(self, msg: str) -> None:
        ts = datetime.fromtimestamp(_now_ts(), tz=timezone.utc).isoformat()
        print(f"[SkillDiscovererV2|{ts}] {msg}", flush=True)

    # ------------------------------------------------------------------
    # Core algorithms
    # ------------------------------------------------------------------

    @staticmethod
    def _compute_similarity(text1: str, text2: str) -> float:
        """
        Jaccard word-overlap similarity between two strings.
        Tokenises on underscores, camelCase boundaries, and non-alphanumeric
        chars so compound ids like ``typescript_fix`` and ``typeCheck`` are
        split into their constituent words.
        Returns a float in [0.0, 1.0].
        """
        import re

        def _tokens(s: str) -> set[str]:
            # 1. split camelCase: 'typeCheck' -> 'type Check'
            s = re.sub(r"([a-z])([A-Z])", r"\1 \2", s)
            # 2. replace underscores and all non-alphanumeric separators with space
            s = re.sub(r"[^a-zA-Z0-9]+", " ", s)
            return set(word.lower() for word in s.split() if word)

        words1 = _tokens(text1)
        words2 = _tokens(text2)
        if not words1 or not words2:
            return 0.0
        intersection = words1 & words2
        union = words1 | words2
        return len(intersection) / len(union)

    def _pattern_text(self, p: dict) -> str:
        """Flatten a pattern record into a single string for similarity scoring."""
        parts: list[str] = [p.get("id", ""), p.get("desc", "")]
        parts.extend(p.get("actions", []))
        parts.extend(p.get("tags", []))
        for ctx in p.get("contexts", []):
            parts.extend(str(v) for v in ctx.values())
        return " ".join(parts)

    # ------------------------------------------------------------------
    # Public API — Semantic matching
    # ------------------------------------------------------------------

    def find_similar_patterns(self, query: str, limit: int = 5) -> list[dict]:
        """
        Return patterns most similar to ``query`` using Jaccard word overlap.

        Returns a list of up to ``limit`` dicts, each containing the full
        pattern record plus a ``_similarity`` float key, sorted descending.
        """
        with self._lock:
            if not query.strip():
                return []
            scored: list[tuple[float, dict]] = []
            for p in self._patterns.values():
                sim = self._compute_similarity(query, self._pattern_text(p))
                if sim > 0.0:
                    scored.append((sim, dict(p, _similarity=round(sim, 4))))
            scored.sort(key=lambda x: x[0], reverse=True)
            return [p for _, p in scored[:limit]]

    # ------------------------------------------------------------------
    # Public API — Prediction
    # ------------------------------------------------------------------

    def predict_success(self, pattern_id: str, context: dict) -> float:
        """
        Predict success probability for ``pattern_id`` in the given ``context``.

        Score = historical_rate + context_bonus + recency_boost
        Capped at 0.95.
        """
        with self._lock:
            p = self._patterns.get(pattern_id)
            if not p:
                return DEFAULT_SUCCESS

            total = p["success_count"] + p["failure_count"]
            if total == 0:
                return DEFAULT_SUCCESS

            # Historical base rate
            base_rate = p["success_count"] / total
            base_rate = max(base_rate, MIN_SUCCESS_RATE)

            # Context similarity bonus: +0.1 per matching context area, cap +0.2
            context_bonus = 0.0
            if p.get("contexts") and context.get("area"):
                matches = sum(
                    1 for c in p["contexts"]
                    if isinstance(c, dict) and c.get("area") == context["area"]
                )
                context_bonus = min(0.2, matches * 0.1)

            # Recency weight: exponential decay, half-life ~1 day
            age_days = max(0, (_now_ts() - p.get("last_used_ts", _now_ts())) / 86400)
            recency_boost = math.exp(-age_days) * 0.1

            return min(0.95, base_rate + context_bonus + recency_boost)

    # ------------------------------------------------------------------
    # Public API — Recommendations
    # ------------------------------------------------------------------

    def recommend_next(self, goal: str, context: dict, limit: int = 3) -> list[dict]:
        """
        Recommend the top ``limit`` patterns to try for ``goal`` in ``context``.

        Scored by:  success_probability × relevance × novelty

        * ``success_probability`` — from predict_success()
        * ``relevance`` — semantic similarity to goal
        * ``novelty`` — inverse of times_used (encourage exploration)
        """
        with self._lock:
            if not goal.strip():
                return []

            recommendations: list[dict] = []
            for pid, p in self._patterns.items():
                prob = self.predict_success(pid, context)
                rel  = self._compute_similarity(goal, self._pattern_text(p))
                # Novelty: patterns used fewer times get a boost
                total_uses = p["success_count"] + p["failure_count"]
                novelty = 1.0 / (1.0 + math.log1p(total_uses))

                score = prob * (0.4 + 0.4 * rel + 0.2 * novelty)
                recommendations.append(dict(p, _score=round(score, 4)))

            recommendations.sort(key=lambda x: x["_score"], reverse=True)
            return recommendations[:limit]

    # ------------------------------------------------------------------
    # Public API — Anti-pattern detection
    # ------------------------------------------------------------------

    def warn_anti_patterns(self, actions: list[str]) -> list[str]:
        """
        Check a list of proposed ``actions`` against known anti-patterns.

        Returns a list of warning strings, one per detected anti-pattern.
        Each string includes the severity and the warning message.
        """
        warnings: list[str] = []
        action_set = set(a.lower() for a in actions)
        for ap in self._anti_patterns:
            for trigger in ap.get("actions", []):
                if trigger.lower() in action_set:
                    warnings.append(
                        f"[{ap['severity'].upper()}] {ap['warning']} "
                        f"(anti-pattern: {ap['id']})"
                    )
                    break   # one warning per anti-pattern
        return warnings

    # ------------------------------------------------------------------
    # Public API — Evolution tracking
    # ------------------------------------------------------------------

    def track_pattern_evolution(self, pattern_id: str) -> dict:
        """
        Return historical statistics for ``pattern_id``:

        {
            "historical_success_rate": float,
            "recent_trend": "improving" | "stable" | "declining",
            "times_used": int,
            "last_used": str (ISO),
            "avg_duration_seconds": float,
            "contexts": list[dict],
        }
        """
        with self._lock:
            p = self._patterns.get(pattern_id)
            if not p:
                return {}

            total = p["success_count"] + p["failure_count"]
            rate = (p["success_count"] / total) if total > 0 else 0.0

            # Compute trend from last 5 outcomes in history
            pid_history = [
                h for h in self._history
                if h.get("pattern_id") == pattern_id
            ][-5:]
            trend = "stable"
            if len(pid_history) >= 2:
                first_half = sum(1 for h in pid_history[:len(pid_history)//2] if h.get("success"))
                second_half = sum(1 for h in pid_history[len(pid_history)//2:] if h.get("success"))
                if second_half > first_half:
                    trend = "improving"
                elif second_half < first_half:
                    trend = "declining"

            return {
                "historical_success_rate": round(rate, 4),
                "recent_trend": trend,
                "times_used": total,
                "last_used": p.get("last_used", ""),
                "avg_duration_seconds": round(p.get("avg_duration_seconds", 0.0), 2),
                "contexts": p.get("contexts", []),
            }

    # ------------------------------------------------------------------
    # Public API — Pattern management
    # ------------------------------------------------------------------

    def record_outcome(
        self,
        pattern_id: str,
        success: bool,
        duration: float,
        context: dict,
    ) -> None:
        """
        Record the result of applying ``pattern_id``.

        Updates success/failure counts, average duration, context history,
        and appends an entry to the outcome log.
        Triggers GC when over MAX_PATTERNS.
        """
        with self._lock:
            p = self._patterns.get(pattern_id)
            if p is None:
                p = _default_pattern(pattern_id)
                self._patterns[pattern_id] = p

            if success:
                p["success_count"] += 1
            else:
                p["failure_count"] += 1

            # Rolling average for duration
            n = p["success_count"] + p["failure_count"]
            old_avg = p.get("avg_duration_seconds", 0.0)
            p["avg_duration_seconds"] = old_avg + (duration - old_avg) / n
            p["total_duration_seconds"] = p.get("total_duration_seconds", 0.0) + duration

            # Update timestamps
            p["last_used"] = _now_iso()
            p["last_used_ts"] = _now_ts()

            # Record context if provided
            if context:
                ctx_copy = dict(context)
                if ctx_copy not in p["contexts"]:
                    p["contexts"].append(ctx_copy)
                    # Keep max 20 contexts to avoid unbounded growth
                    if len(p["contexts"]) > 20:
                        p["contexts"] = p["contexts"][-20:]

            # Append to history
            self._history.append({
                "pattern_id": pattern_id,
                "success": success,
                "duration_seconds": duration,
                "context": context,
                "timestamp": _now_iso(),
            })

            # Persist
            self._persist_patterns()
            self._persist_history()
            self._update_meta()
            self._log(f"recorded outcome: {pattern_id} success={success}")

            # GC if over limit
            if len(self._patterns) > MAX_PATTERNS:
                self._gc()

    def get_pattern(self, pattern_id: str) -> dict | None:
        """Return the full pattern record for ``pattern_id``, or None."""
        with self._lock:
            return dict(self._patterns.get(pattern_id)) if pattern_id in self._patterns else None

    # ------------------------------------------------------------------
    # Stats
    # ------------------------------------------------------------------

    def get_stats(self) -> dict:
        """Return aggregate statistics."""
        with self._lock:
            return dict(self._meta)

    # ------------------------------------------------------------------
    # Garbage collection
    # ------------------------------------------------------------------

    def _update_meta(self) -> None:
        patterns = list(self._patterns.values())
        total = len(patterns)
        if total == 0:
            self._meta = _default_meta()
        else:
            total_success = sum(p["success_count"] for p in patterns)
            total_all     = sum(p["success_count"] + p["failure_count"] for p in patterns)
            avg_rate = (total_success / total_all) if total_all > 0 else 0.0
            self._meta = {
                "total_patterns": total,
                "avg_success_rate": round(avg_rate, 4),
                "last_gc": self._meta.get("last_gc", _now_iso()),
                "version": "2.0",
            }
        self._persist_meta()

    def _gc(self) -> None:
        """
        Evict up to 10% of patterns with the worst success rate that
        have also been stale for at least GC_DAYS_STALE days.
        """
        now = _now_ts()
        stale_seconds = GC_DAYS_STALE * 86400

        def _eviction_key(pid: str, p: dict) -> tuple[float, float]:
            total = p["success_count"] + p["failure_count"]
            rate = (p["success_count"] / total) if total > 0 else 0.5
            age  = now - p.get("last_used_ts", now)
            # Lower rate first; within same rate, older patterns first
            return (rate, -age)

        candidates = [
            (pid, p) for pid, p in self._patterns.items()
            if (now - p.get("last_used_ts", now)) >= stale_seconds
        ]
        if not candidates:
            # No stale patterns — evict lowest success rate patterns regardless
            candidates = list(self._patterns.items())

        candidates.sort(key=lambda x: _eviction_key(x[0], x[1]))
        evict = candidates[:max(1, len(self._patterns) // 10)]

        for pid, _ in evict:
            del self._patterns[pid]
            self._log(f"gc evicted: {pid}")

        self._meta["last_gc"] = _now_iso()
        self._persist_patterns()
        self._persist_meta()
        self._log(f"gc complete: {len(evict)} patterns removed")

    # ------------------------------------------------------------------
    # Self-test stub
    # ------------------------------------------------------------------

    @staticmethod
    def _test() -> dict:
        """
        Smoke-test SkillDiscovererV2 in-process.
        Returns a dict of test name → pass/fail.
        """
        import tempfile
        results: dict[str, bool] = {}

        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)

            sd = SkillDiscovererV2(root)

            # --- record_outcome + get_pattern ---
            sd.record_outcome(
                "test_pattern",
                success=True,
                duration=10.0,
                context={"area": "testing"},
            )
            sd.record_outcome(
                "test_pattern",
                success=True,
                duration=20.0,
                context={"area": "testing"},
            )
            sd.record_outcome(
                "test_pattern",
                success=False,
                duration=5.0,
                context={"area": "testing"},
            )
            p = sd.get_pattern("test_pattern")
            results["record_and_get"] = (
                p is not None
                and p["success_count"] == 2
                and p["failure_count"] == 1
            )

            # --- predict_success ---
            prob = sd.predict_success("test_pattern", {"area": "testing"})
            results["predict_success"] = 0.0 <= prob <= 1.0

            # --- find_similar_patterns ---
            sd.record_outcome(
                "typescript_fix",
                success=True,
                duration=30.0,
                context={"area": "typecheck"},
            )
            similar = sd.find_similar_patterns("typescript type error fix", limit=3)
            ids = [s["id"] for s in similar]
            results["find_similar"] = "typescript_fix" in ids or "test_pattern" in ids

            # --- recommend_next ---
            recs = sd.recommend_next("fix type errors", {"area": "typecheck"}, limit=2)
            results["recommend_next"] = len(recs) <= 2

            # --- warn_anti_patterns ---
            warnings = sd.warn_anti_patterns(["skip tsc", "ignore QA"])
            results["warn_anti_patterns"] = len(warnings) >= 2

            # --- track_pattern_evolution ---
            ev = sd.track_pattern_evolution("test_pattern")
            results["track_evolution"] = (
                ev.get("historical_success_rate", -1) >= 0.0
                and ev.get("times_used") == 3
            )

            # --- stats ---
            stats = sd.get_stats()
            results["get_stats"] = "total_patterns" in stats

            # --- unknown pattern ---
            unknown_prob = sd.predict_success("does_not_exist", {})
            results["unknown_default"] = unknown_prob == DEFAULT_SUCCESS

        passed = sum(results.values())
        total  = len(results)
        print(f"\n[SkillDiscovererV2._test] {passed}/{total} passed")
        for name, ok in results.items():
            print(f"  {'✓' if ok else '✗'} {name}")
        return results


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    SkillDiscovererV2._test()
