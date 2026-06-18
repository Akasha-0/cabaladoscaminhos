"""
Memory Manager — 3-tier hot/warm/cold storage with forgetting curve.

Tier architecture:
  hot  → memory.json          (active learnings, full fidelity)
  warm → memory-warm.json      (last 50 iterations, kept for quick recall)
  cold → memory-cold/YYYY-MM.json  (monthly archives, decayed by forgetting curve)

Forgetting curve: relevance_score = score * 0.95^(iteration_age - 50)
  Learnings older than 50 iterations are penalised exponentially.
"""

from __future__ import annotations

import json
import shutil
import time
from datetime import datetime
from pathlib import Path
from typing import Any

# ── path constants ─────────────────────────────────────────────────────────────

ROOT = Path("/home/skynet/cabala-dos-caminhos/.autonomous/multi-agent")
MA = ROOT  # alias for clarity in submodules

HOT_PATH = ROOT / "memory.json"
WARM_PATH = ROOT / "memory-warm.json"
COLD_DIR = ROOT / "memory-cold"

DEFAULT_WARM_KEEP = 50          # iterations to retain in warm tier
AUTO_ARCHIVE_SIZE_BYTES = 100 * 1024  # 100 KB trigger for auto-archive
DECAY_BASE = 0.95
DECAY_WINDOW = 50               # iterations before decay kicks in

# ── low-level JSON helpers ────────────────────────────────────────────────────

def load_json(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    try:
        with path.open(encoding="utf-8") as fh:
            return json.load(fh)
    except (json.JSONDecodeError, OSError):
        return {}


def save_json(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    with tmp.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)
    tmp.replace(path)


# ── core data structures ──────────────────────────────────────────────────────

class Learning:
    """
    Single unit of stored knowledge.

    Attributes
    ----------
    id : str
        Unique identifier (UUID).
    content : str
        Human-readable description of the learning.
    score : float
        Base relevance score [0.0 – 1.0]; set at capture time.
    iteration : int
        Evolution-loop iteration when this was stored.
    timestamp : float
        Unix epoch when stored.
    tags : list[str]
        Free-form labels for retrieval.
    metadata : dict
        Arbitrary additional data.
    """

    __slots__ = ("id", "content", "score", "iteration", "timestamp", "tags", "metadata")

    def __init__(
        self,
        id: str,
        content: str,
        score: float = 0.5,
        iteration: int = 0,
        timestamp: float | None = None,
        tags: list[str] | None = None,
        metadata: dict | None = None,
    ):
        self.id = id
        self.content = content
        self.score = score
        self.iteration = iteration
        self.timestamp = timestamp if timestamp is not None else time.time()
        self.tags = tags or []
        self.metadata = metadata or {}

    def decayed_score(self, current_iteration: int) -> float:
        """
        Apply the forgetting curve decay.

        score' = score × 0.95^(iteration_age - 50)
        Returns score unchanged if iteration_age ≤ 50.
        """
        age = current_iteration - self.iteration
        if age <= DECAY_WINDOW:
            return self.score
        return self.score * (DECAY_BASE ** (age - DECAY_WINDOW))

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "content": self.content,
            "score": self.score,
            "iteration": self.iteration,
            "timestamp": self.timestamp,
            "tags": self.tags,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, d: dict) -> Learning:
        return cls(
            id=str(d["id"]),
            content=str(d["content"]),
            score=float(d.get("score", 0.5)),
            iteration=int(d.get("iteration", 0)),
            timestamp=float(d.get("timestamp", time.time())),
            tags=list(d.get("tags", [])),
            metadata=dict(d.get("metadata", {})),
        )


# ── Memory Manager ─────────────────────────────────────────────────────────────

class MemoryManager:
    """
    3-tier memory system with hot/warm/cold storage.

    All legacy keys from the original memory.json are preserved on load
    and written back unchanged on save, ensuring full backward compatibility.

    Parameters
    ----------
    hot_path : Path
        Path to the hot-tier JSON file.
    warm_path : Path
        Path to the warm-tier JSON file.
    cold_dir : Path
        Directory holding monthly cold archives.
    warm_keep : int
        Number of recent iterations to retain in the warm tier.
    """

    def __init__(
        self,
        hot_path: Path = HOT_PATH,
        warm_path: Path = WARM_PATH,
        cold_dir: Path = COLD_DIR,
        warm_keep: int = DEFAULT_WARM_KEEP,
    ):
        self.hot_path = hot_path
        self.warm_path = warm_path
        self.cold_dir = cold_dir
        self.warm_keep = warm_keep

        # runtime state
        self._hot: dict[str, Any] = {}   # hot tier raw dict
        self._warm: dict[str, Any] = {}  # warm tier raw dict
        self._learnings: list[Learning] = []

        # legacy compatibility: preserve all top-level keys from existing file
        self._legacy: dict[str, Any] = {}

        self._load()

    # ── persistence ──────────────────────────────────────────────────────────

    def _load(self) -> None:
        """Load hot and warm tiers; extract legacy keys from hot."""
        self._hot = load_json(self.hot_path)
        self._warm = load_json(self.warm_path)
        self._cold_dir_ensure()

        # Legacy keys that belong to the hot dict but are NOT internal fields
        internal = {"learnings", "iteration"}
        self._legacy = {k: v for k, v in self._hot.items() if k not in internal}

        # Reconstruct Learning objects from hot learnings list.
        # Only consume entries that look like actual learnings (have an "id" field);
        # skip any legacy structure that shares the learnings list slot.
        raw_learnings: list[dict] = self._hot.get("learnings", [])
        self._learnings = [
            Learning.from_dict(d) for d in raw_learnings
            if isinstance(d, dict) and "id" in d
        ]

    def _persist_hot(self) -> None:
        """Write hot tier, merging back all legacy keys."""
        payload = dict(self._legacy)
        payload["learnings"] = [lrn.to_dict() for lrn in self._learnings]
        payload["iteration"] = self.current_iteration
        save_json(self.hot_path, payload)

    def _persist_warm(self) -> None:
        """Write warm tier (learnings list only)."""
        save_json(self.warm_path, {"learnings": [lrn.to_dict() for lrn in self._warm_learnings()]})

    def _cold_dir_ensure(self) -> None:
        self.cold_dir.mkdir(parents=True, exist_ok=True)

    # ── public API ───────────────────────────────────────────────────────────

    @property
    def current_iteration(self) -> int:
        """Current loop iteration, defaulting to 1 if not yet set."""
        return int(self._hot.get("iteration", 0))

    # ── store ────────────────────────────────────────────────────────────────

    def store(
        self,
        learning: Learning | dict[str, Any],
        auto_archive: bool = True,
    ) -> Learning:
        """
        Add a learning to the hot tier.

        If the hot file exceeds AUTO_ARCHIVE_SIZE_BYTES and auto_archive is
        True, archive_old() is triggered before the new learning is added.

        Parameters
        ----------
        learning : Learning | dict
            Learning instance or serialisable dict.
        auto_archive : bool
            Trigger auto-archive when size threshold is exceeded.

        Returns
        -------
        Learning
            The stored learning (normalised to a Learning instance).
        """
        if isinstance(learning, dict):
            learning = Learning.from_dict(learning)

        # Auto-archive if file is oversized
        if auto_archive and self._hot_path_size() > AUTO_ARCHIVE_SIZE_BYTES:
            self.archive_old()

        self._learnings.append(learning)
        self._persist_hot()
        self._refresh_warm()
        return learning

    # ── retrieve ─────────────────────────────────────────────────────────────

    def retrieve(
        self,
        query: str,
        limit: int = 10,
        use_decay: bool = True,
    ) -> list[Learning]:
        """
        Rank-learnings by decayed relevance to the query string.

        Search is performed across content and tags. Results are scored using
        decayed_score (if use_decay=True) and returned in descending order.

        Parameters
        ----------
        query : str
            Free-text query string.
        limit : int
            Maximum number of results to return.
        use_decay : bool
            Apply forgetting-curve decay when True.

        Returns
        -------
        list[Learning]
            Up to ``limit`` learnings sorted by decayed relevance.
        """
        current = self.current_iteration
        query_lower = query.lower()

        scored: list[tuple[float, Learning]] = []
        for lrn in self._learnings:
            # Simple keyword overlap
            content_match = query_lower in lrn.content.lower()
            tag_match = any(query_lower in t.lower() for t in lrn.tags)
            keyword_score = 0.5 if content_match or tag_match else 0.0

            # Base relevance + keyword bonus
            base = lrn.decayed_score(current) if use_decay else lrn.score
            combined = min(1.0, base + keyword_score * 0.1)
            scored.append((combined, lrn))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [lrn for _, lrn in scored[:limit]]

    # ── archive_old ───────────────────────────────────────────────────────────

    def archive_old(self, age_threshold: int | None = None) -> int:
        """
        Move learnings with iteration <= current - age_threshold to cold storage.

        A monthly archive file (memory-cold/YYYY-MM.json) is created or
        appended-to. Only learnings moved are removed from the hot tier.

        Parameters
        ----------
        age_threshold : int | None
            Iterations behind current below which learnings are archived.
            Defaults to DECAY_WINDOW (50).

        Returns
        -------
        int
            Number of learnings archived.
        """
        threshold = age_threshold if age_threshold is not None else DECAY_WINDOW
        current = self.current_iteration

        to_archive: list[Learning] = []
        remaining: list[Learning] = []

        for lrn in self._learnings:
            if (current - lrn.iteration) >= threshold:
                to_archive.append(lrn)
            else:
                remaining.append(lrn)

        if not to_archive:
            return 0

        self._learnings = remaining
        self._append_to_cold(to_archive)
        self._persist_hot()
        self._refresh_warm()
        return len(to_archive)

    def _append_to_cold(self, learnings: list[Learning]) -> None:
        """Append learnings to the appropriate monthly cold archive."""
        now = datetime.utcnow()
        archive_name = f"{now.year:04d}-{now.month:02d}.json"
        archive_path = self.cold_dir / archive_name
        existing = load_json(archive_path)
        existing_learnings: list[dict] = existing.get("learnings", [])
        existing_learnings.extend(lrn.to_dict() for lrn in learnings)
        save_json(archive_path, {"learnings": existing_learnings})

    # ── compact ───────────────────────────────────────────────────────────────

    def compact(self, min_score: float = 0.0) -> int:
        """
        Remove learnings with decayed_score below min_score from hot tier.

        Low-scoring learnings are permanently dropped (not archived).

        Parameters
        ----------
        min_score : float
            Minimum decayed score required to survive compaction.

        Returns
        -------
        int
            Number of learnings removed.
        """
        current = self.current_iteration
        before = len(self._learnings)
        self._learnings = [
            lrn
            for lrn in self._learnings
            if lrn.decayed_score(current) >= min_score
        ]
        removed = before - len(self._learnings)
        if removed:
            self._persist_hot()
            self._refresh_warm()
        return removed

    # ── restore_session ───────────────────────────────────────────────────────

    def restore_session(self) -> list[Learning]:
        """
        Promote the warm tier into hot, returning the restored learnings.

        After restoration the warm tier is cleared. This is used when resuming
        a previous session to pull recent learnings back into active memory.

        Returns
        -------
        list[Learning]
            Learnings restored from the warm tier.
        """
        warm_learnings = self._warm_learnings()
        self._learnings = warm_learnings
        # Clear warm file
        save_json(self.warm_path, {"learnings": []})
        self._persist_hot()
        return warm_learnings

    # ── warm tier helpers ─────────────────────────────────────────────────────

    def _warm_learnings(self) -> list[Learning]:
        """Return learnings currently in the warm tier (as Learning objects)."""
        raw: list[dict] = self._warm.get("learnings", [])
        return [Learning.from_dict(d) for d in raw]

    def _refresh_warm(self) -> None:
        """
        Refresh the warm tier with the most recent N iterations from hot.

        The warm tier stores at most warm_keep iterations (default 50).
        """
        current = self.current_iteration
        warm: list[Learning] = []
        for lrn in reversed(self._learnings):
            if len(warm) >= self.warm_keep:
                break
            warm.insert(0, lrn)

        self._warm = {"learnings": [w.to_dict() for w in warm]}
        self._persist_warm()

    # ── iteration ─────────────────────────────────────────────────────────────

    def bump_iteration(self) -> int:
        """
        Increment the current iteration counter by 1.

        Returns
        -------
        int
            The new iteration number.
        """
        self._hot["iteration"] = self.current_iteration + 1
        self._persist_hot()
        return self.current_iteration

    # ── stats ─────────────────────────────────────────────────────────────────

    def stats(self) -> dict[str, Any]:
        """
        Return storage statistics across all three tiers.

        Returns
        -------
        dict
            hot_size_bytes, warm_size_bytes, cold_count (archived files),
            total_learnings (across hot + warm + cold).
        """
        hot_bytes = self.hot_path.stat().st_size if self.hot_path.exists() else 0
        warm_bytes = self.warm_path.stat().st_size if self.warm_path.exists() else 0
        cold_files = list(self.cold_dir.glob("*.json")) if self.cold_dir.exists() else []
        cold_count = len(cold_files)

        total = len(self._learnings) + len(self._warm_learnings())
        if self.cold_dir.exists():
            for cf in cold_files:
                data = load_json(cf)
                total += len(data.get("learnings", []))

        return {
            "hot_size_bytes": hot_bytes,
            "warm_size_bytes": warm_bytes,
            "cold_count": cold_count,
            "total_learnings": total,
        }

    # ── cold archive listing ──────────────────────────────────────────────────

    def list_cold_archives(self) -> list[dict[str, Any]]:
        """
        List all cold archive files with metadata.

        Returns
        -------
        list[dict]
            Each entry: {path: str, year: int, month: int, size_bytes: int,
                        learning_count: int, modified_ts: float}.
        """
        self._cold_dir_ensure()
        archives: list[dict[str, Any]] = []
        for path in sorted(self.cold_dir.glob("*.json")):
            data = load_json(path)
            archives.append({
                "path": str(path),
                "year": int(path.stem.split("-")[0]),
                "month": int(path.stem.split("-")[1]),
                "size_bytes": path.stat().st_size,
                "learning_count": len(data.get("learnings", [])),
                "modified_ts": path.stat().st_mtime,
            })
        return archives

    # ── internal helpers ─────────────────────────────────────────────────────

    def _hot_path_size(self) -> int:
        try:
            return self.hot_path.stat().st_size
        except OSError:
            return 0

    # ── convenience: iterate all learnings across tiers ──────────────────────

    def all_learnings(self) -> list[Learning]:
        """Hot + warm learnings (cold requires separate archive reads)."""
        return list(self._learnings)

    def __repr__(self) -> str:
        return (
            f"MemoryManager(hot={len(self._learnings)}, "
            f"warm={len(self._warm_learnings())}, "
            f"iteration={self.current_iteration})"
        )
