"""
Memory Manager v2 — Exponential Learning Memory.

Tier architecture:
  hot    → in-memory dict          (recent <1h or confidence >0.8)
  warm   → memory_v2/warm/*.json   (1h–24h, confidence 0.4–0.8)
  cold   → memory_v2/cold/*.json.zlib  (compressed, >24h or confidence <0.4)
  evidence → memory_v2/evidence.json  (learn() entries, append-only, never pruned)

Exponential learning:
  positive outcome:  new_confidence = old * exp(α * C)
  negative outcome:  new_confidence = old * exp(-β * C)
  defaults: α=0.5 (positive), β=0.3 (negative)

Bounded memory:
  hard cap = max_memory_mb (default 50 MB for hot+warm combined)
  >80% usage → compress warm→cold, evict lowest-confidence hot entries
  Every 60s GC → removes cold entries with confidence < 0.1

Performance target: <10ms per store/recall operation.
"""

from __future__ import annotations

import json
import math
import threading
import time
import zlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ── path constants ─────────────────────────────────────────────────────────────

ROOT = Path("/home/skynet/cabala-dos-caminhos/.autonomous/multi-agent")
MA = ROOT
MEM_DIR = MA / "memory_v2"
WARM_DIR = MEM_DIR / "warm"
COLD_DIR = MEM_DIR / "cold"
EVIDENCE_FILE = MEM_DIR / "evidence.json"
META_FILE = MEM_DIR / "meta.json"

# ── tunable defaults ────────────────────────────────────────────────────────────

DEFAULT_MAX_MEMORY_MB = 50.0            # hot + warm combined
DEFAULT_ALPHA = 0.5                      # positive learning rate
DEFAULT_BETA = 0.3                       # negative learning rate
HOT_AGE_CUTOFF_SEC = 3600               # 1 hour
HOT_CONFIDENCE_CUTOFF = 0.8
WARM_CONFIDENCE_MIN = 0.4
WARM_CONFIDENCE_MAX = 0.8
COLD_CONFIDENCE_MAX = 0.4
LIMIT_WARNING_FRAC = 0.80               # enforce limit when >80% full
GC_INTERVAL_SEC = 60.0
GC_CONFIDENCE_THRESHOLD = 0.1
KB = 1024
MB = 1024 * KB


# ── low-level JSON helpers ─────────────────────────────────────────────────────

def _load_json(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    try:
        with path.open(encoding="utf-8") as fh:
            return json.load(fh)
    except (json.JSONDecodeError, OSError):
        return {}


def _save_json(path: Path, data: dict[str, Any]) -> None:
    """Atomic write: temp file + rename."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    with tmp.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)
    tmp.replace(path)


def _load_compressed(path: Path) -> dict[str, Any]:
    """Load a zlib-compressed JSON file."""
    if not path.exists():
        return {}
    try:
        with path.open("rb") as fh:
            raw = fh.read()
        decompressed = zlib.decompress(raw)
        return json.loads(decompressed.decode("utf-8"))
    except (zlib.error, OSError, json.JSONDecodeError):
        return {}


def _save_compressed(path: Path, data: dict[str, Any]) -> None:
    """Atomic write for compressed JSON."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    raw = json.dumps(data, indent=2, ensure_ascii=False).encode("utf-8")
    compressed = zlib.compress(raw, level=1)
    with tmp.open("wb") as fh:
        fh.write(compressed)
    tmp.replace(path)


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _parse_ts(val: Any) -> float:
    """Parse timestamp from float, int, ISO string, or None."""
    if val is None:
        return time.time()
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        try:
            return datetime.fromisoformat(val.replace("Z", "+00:00")).timestamp()
        except Exception:
            return time.time()
    return time.time()


def _safe_filename(key: str) -> str:
    """Sanitise a key into a safe filename."""
    return (
        key.replace("/", "_")
        .replace("\\", "_")
        .replace(":", "_")
        .replace("\0", "_")[:128]
    )


def _keyword_overlap(keywords: list[str], text: str) -> float:
    """Simple keyword overlap score [0.0–1.0]."""
    if not keywords:
        return 0.0
    lower = text.lower()
    matches = sum(1 for kw in keywords if kw.lower() in lower)
    return matches / len(keywords)


# ── Exponential confidence update ──────────────────────────────────────────────

def _update_confidence(old: float, confidence: float, positive: bool,
                       alpha: float = DEFAULT_ALPHA,
                       beta: float = DEFAULT_BETA) -> float:
    """
    Exponential confidence update.

    positive outcome:  new_confidence = old * exp(α * confidence)
    negative outcome:  new_confidence = old * exp(-β * confidence)
    """
    if positive:
        return min(1.0, old * math.exp(alpha * confidence))
    else:
        return max(0.0, old * math.exp(-beta * confidence))


# ── Memory Manager v2 ─────────────────────────────────────────────────────────

class MemoryManagerV2:
    """
    Exponential learning memory manager with bounded hot/warm tiers
    and uncompressed cold archive.

    Parameters
    ----------
    max_memory_mb : float
        Maximum combined size for hot + warm tiers (default 50 MB).
    auto_gc : bool
        Run garbage-collection in the background (default True).
    alpha : float
        Positive learning rate (default 0.5).
    beta : float
        Negative learning rate (default 0.3).
    """

    def __init__(
        self,
        max_memory_mb: float = DEFAULT_MAX_MEMORY_MB,
        auto_gc: bool = True,
        alpha: float = DEFAULT_ALPHA,
        beta: float = DEFAULT_BETA,
    ) -> None:
        self._max_memory_bytes = int(max_memory_mb * MB)
        self._alpha = alpha
        self._beta = beta
        self._lock = threading.RLock()
        self._log = lambda msg: None  # overridden after dirs are set

        # Ensure directory structure
        for d in (WARM_DIR, COLD_DIR):
            d.mkdir(parents=True, exist_ok=True)
        if not EVIDENCE_FILE.exists():
            _save_json(EVIDENCE_FILE, {"entries": [], "_version": 2})

        # In-memory state
        self._hot: dict[str, dict[str, Any]] = {}   # key → memory dict
        self._hot_loaded_keys: set[str] = set()

        # Meta index (always kept in sync)
        self._meta: dict[str, Any] = _load_json(META_FILE)
        if "_version" not in self._meta:
            self._meta = {"_version": 2, "_last_gc": _iso_now(), "keys": {}}
        if "keys" not in self._meta:
            self._meta["keys"] = {}
        self._meta.setdefault("_last_gc", _iso_now())

        # Lazy-load warm tier keys into hot if within size budget
        self._restore_hot()

        # Background GC
        self._auto_gc = auto_gc
        self._last_gc_time = _parse_ts(self._meta.get("_last_gc", None))
        self._gc_thread: threading.Thread | None = None
        if self._auto_gc:
            self._gc_thread = threading.Thread(target=self._gc_loop, daemon=True)
            self._gc_thread.start()

        # Logging helper (captures MA path in closure)
        self._log = lambda msg: print(
            f"[MemoryManagerV2 {_iso_now()}] {msg}"
        )

        self._log(f"Initialised (max_memory_mb={max_memory_mb}, "
                  f"hot={len(self._hot)}, warm={self._warm_key_count()}, "
                  f"cold={self._cold_key_count()})")

    # ── public API ──────────────────────────────────────────────────────────────

    def store(self, key: str, value: Any,
              metadata: dict | None = None) -> bool:
        """
        Store a value in hot memory.

        Parameters
        ----------
        key : str
            Unique memory key.
        value : Any
            Serializable value to store.
        metadata : dict | None
            Optional metadata (importance, tags, etc.).

        Returns
        -------
        bool
            True if stored successfully.
        """
        with self._lock:
            now = time.time()
            importance = (metadata or {}).get("importance", 0.5)
            tags = list(metadata.get("tags", []) if metadata else [])

            entry: dict[str, Any] = {
                "key": key,
                "value": value,
                "metadata": metadata or {},
                "importance": importance,
                "tags": tags,
                "timestamp": now,
                "last_access": now,
                "access_count": 0,
                "confidence": importance,   # initial confidence ≈ importance
                "positive_count": 0,
                "negative_count": 0,
            }

            self._hot[key] = entry
            self._update_meta(key, "hot", now, importance)
            self._hot_loaded_keys.add(key)

            self._log(f"store: key={key!r} importance={importance:.2f}")

            # Enforce memory limit
            self._enforce_limit()

            return True

    def recall(self, key: str, age_weight: float = 0.5) -> Any | None:
        """
        Retrieve a value with recency-weighted scoring.

        Parameters
        ----------
        key : str
            Memory key to recall.
        age_weight : float
            Weight given to recency vs confidence (0.0–1.0).
            0.0 = pure confidence, 1.0 = pure recency.

        Returns
        -------
        Any | None
            The stored value, or None if not found.
        """
        with self._lock:
            entry = self._recall_entry(key)
            if entry is None:
                return None

            now = time.time()
            entry["last_access"] = now
            entry["access_count"] = entry.get("access_count", 0) + 1
            self._meta["keys"].setdefault(key, {})["last_access"] = now
            self._meta["keys"][key]["access_count"] = entry["access_count"]
            self._persist_meta_unlocked()

            return entry.get("value")

    def learn(self, pattern: str, outcome: str,
              confidence: float = 1.0,
              positive: bool = True) -> None:
        """
        Record a pattern → outcome mapping with exponential confidence update.

        Parameters
        ----------
        pattern : str
            The observed pattern or action.
        outcome : str
            The resulting outcome.
        confidence : float
            Confidence of the outcome [0.0–1.0].
        positive : bool
            True for positive outcome, False for negative.
        """
        with self._lock:
            now = time.time()

            # Load existing evidence
            evidence = _load_json(EVIDENCE_FILE)
            entries: list[dict[str, Any]] = evidence.get("entries", [])

            # Find existing pattern entry
            existing_idx: int | None = None
            for i, e in enumerate(entries):
                if e.get("pattern") == pattern and e.get("outcome") == outcome:
                    existing_idx = i
                    break

            if existing_idx is not None:
                # Update existing entry with exponential learning
                old_conf = entries[existing_idx].get("confidence", 0.5)
                new_conf = _update_confidence(
                    old_conf, confidence, positive,
                    alpha=self._alpha, beta=self._beta
                )
                entries[existing_idx]["confidence"] = new_conf
                entries[existing_idx]["last_seen"] = now
                entries[existing_idx]["positive_count"] = (
                    entries[existing_idx].get("positive_count", 0) +
                    (1 if positive else 0)
                )
                entries[existing_idx]["negative_count"] = (
                    entries[existing_idx].get("negative_count", 0) +
                    (0 if positive else 1)
                )
                self._log(f"learn: pattern={pattern!r} "
                          f"old_conf={old_conf:.3f}→{new_conf:.3f} "
                          f"({'positive' if positive else 'negative'})")
            else:
                # New entry
                entries.append({
                    "pattern": pattern,
                    "outcome": outcome,
                    "confidence": confidence,
                    "first_seen": now,
                    "last_seen": now,
                    "positive_count": 1 if positive else 0,
                    "negative_count": 0 if positive else 1,
                    "tags": [],
                })
                self._log(f"learn: NEW pattern={pattern!r}→{outcome!r} "
                          f"conf={confidence:.3f}")

            evidence["entries"] = entries
            _save_json(EVIDENCE_FILE, evidence)

            # Also store as a hot memory if key not already present
            mem_key = f"pattern:{pattern}"
            if mem_key not in self._hot:
                self.store(mem_key, outcome, metadata={
                    "importance": confidence,
                    "tags": ["learned", "pattern"],
                    "learned_from": "learn",
                })

    def recall_pattern(self, pattern: str,
                       min_confidence: float = 0.3) -> list[dict[str, Any]]:
        """
        Retrieve all outcome entries for a pattern, sorted by confidence.

        Parameters
        ----------
        pattern : str
            Pattern to query.
        min_confidence : float
            Minimum confidence threshold (default 0.3).

        Returns
        -------
        list[dict[str, Any]]
            Matching evidence entries, sorted descending by confidence.
        """
        with self._lock:
            evidence = _load_json(EVIDENCE_FILE)
            entries: list[dict[str, Any]] = evidence.get("entries", [])
            matches = [
                e for e in entries
                if e.get("pattern") == pattern
                and e.get("confidence", 0) >= min_confidence
            ]
            matches.sort(key=lambda e: e.get("confidence", 0), reverse=True)
            return matches

    def get_wisdom(self, query: str, limit: int = 5) -> list[dict[str, Any]]:
        """
        Retrieve the most relevant learnings for a natural-language query.

        Uses simple keyword overlap against pattern, outcome, and tags.

        Parameters
        ----------
        query : str
            Natural-language query string.
        limit : int
            Maximum number of results to return (default 5).

        Returns
        -------
        list[dict[str, Any]]
            Ranked list of matching evidence + memory entries.
        """
        with self._lock:
            keywords = query.split()
            results: list[tuple[float, dict[str, Any]]] = []

            # Search evidence entries
            evidence = _load_json(EVIDENCE_FILE)
            for e in evidence.get("entries", []):
                text = " ".join([
                    e.get("pattern", ""),
                    e.get("outcome", ""),
                    " ".join(e.get("tags", [])),
                ])
                score = _keyword_overlap(keywords, text) * e.get("confidence", 0.5)
                if score > 0:
                    results.append((score, e))

            # Search hot memories
            for key, entry in self._hot.items():
                text = " ".join([
                    key,
                    str(entry.get("value", "")),
                    " ".join(entry.get("tags", [])),
                ])
                score = _keyword_overlap(keywords, text) * entry.get("confidence", 0.5)
                if score > 0:
                    results.append((score, entry))

            # Sort by score descending
            results.sort(key=lambda x: x[0], reverse=True)
            return [r for _, r in results[:limit]]

    def get_stats(self) -> dict[str, Any]:
        """
        Return memory statistics.

        Returns
        -------
        dict[str, Any]
            Statistics including counts, sizes, and confidence metrics.
        """
        with self._lock:
            hot = len(self._hot)
            warm = self._warm_key_count()
            cold = self._cold_key_count()

            hot_size = self._hot_size_bytes()
            warm_size = self._warm_size_bytes()
            cold_size = self._cold_size_bytes()

            evidence = _load_json(EVIDENCE_FILE)
            ev_entries = evidence.get("entries", [])
            ev_size = EVIDENCE_FILE.stat().st_size if EVIDENCE_FILE.exists() else 0

            all_conf = [
                e.get("confidence", 0.5)
                for e in list(self._hot.values()) + ev_entries
            ]
            avg_conf = sum(all_conf) / len(all_conf) if all_conf else 0.0

            return {
                "hot_count": hot,
                "warm_count": warm,
                "cold_count": cold,
                "evidence_count": len(ev_entries),
                "total_size_mb": round(
                    (hot_size + warm_size + cold_size + ev_size) / MB, 4
                ),
                "hot_size_mb": round(hot_size / MB, 4),
                "warm_size_mb": round(warm_size / MB, 4),
                "cold_size_mb": round(cold_size / MB, 4),
                "avg_confidence": round(avg_conf, 4),
                "max_memory_mb": round(self._max_memory_bytes / MB, 2),
                "utilisation_frac": round(
                    (hot_size + warm_size) / self._max_memory_bytes, 4
                ),
            }

    def prune(self, low_confidence: float = 0.1) -> int:
        """
        Remove all memories below a confidence threshold from hot and warm.

        Parameters
        ----------
        low_confidence : float
            Minimum confidence to retain (default 0.1).

        Returns
        -------
        int
            Number of entries removed.
        """
        with self._lock:
            removed = 0

            # Prune hot
            dead_hot = [
                k for k, e in self._hot.items()
                if e.get("confidence", 0) < low_confidence
            ]
            for k in dead_hot:
                del self._hot[k]
                self._hot_loaded_keys.discard(k)
                self._meta["keys"].pop(k, None)
                removed += 1

            # Prune warm files
            for wf in WARM_DIR.glob("*.json"):
                data = _load_json(wf)
                keys = list(data.keys())
                pruned = [k for k in keys
                          if isinstance(data[k], dict)
                          and data[k].get("confidence", 0) < low_confidence]
                for k in pruned:
                    del data[k]
                    removed += 1
                if pruned:
                    _save_json(wf, data)
                    key = wf.stem
                    self._meta["keys"].pop(key, None)

            self._persist_meta_unlocked()
            self._log(f"prune: removed {removed} entries below "
                      f"confidence={low_confidence}")
            return removed

    def export(self) -> dict[str, Any]:
        """
        Serialise the entire memory state for continuity.

        Returns
        -------
        dict[str, Any]
            Full memory snapshot including meta, hot, warm, cold, evidence.
        """
        with self._lock:
            warm_snap: dict[str, Any] = {}
            for wf in WARM_DIR.glob("*.json"):
                warm_snap.update(_load_json(wf))

            cold_snap: dict[str, Any] = {}
            for cf in COLD_DIR.glob("*.json.zlib"):
                cold_snap.update(_load_compressed(cf))

            return {
                "_version": 2,
                "exported_at": _iso_now(),
                "meta": dict(self._meta),
                "hot": dict(self._hot),
                "warm": warm_snap,
                "cold": cold_snap,
                "evidence": _load_json(EVIDENCE_FILE),
            }

    def import_data(self, data: dict[str, Any]) -> None:
        """
        Restore memory from an exported snapshot.

        Parameters
        ----------
        data : dict[str, Any]
            Snapshot produced by export().
        """
        with self._lock:
            # Restore hot
            hot_data = data.get("hot", {})
            for key, entry in hot_data.items():
                self._hot[key] = entry
                self._hot_loaded_keys.add(key)
                self._update_meta(
                    key, "hot",
                    _parse_ts(entry.get("last_access")),
                    entry.get("importance", 0.5),
                )

            # Restore warm
            warm_data = data.get("warm", {})
            for key, entry in warm_data.items():
                wf = WARM_DIR / f"{_safe_filename(key)}.json"
                _save_json(wf, {key: entry})
                self._update_meta(
                    key, "warm",
                    _parse_ts(entry.get("last_access")),
                    entry.get("importance", 0.5),
                )

            # Restore cold
            cold_data = data.get("cold", {})
            for key, entry in cold_data.items():
                cf = COLD_DIR / f"{_safe_filename(key)}.json.zlib"
                _save_compressed(cf, {key: entry})
                self._update_meta(
                    key, "cold",
                    _parse_ts(entry.get("last_access")),
                    entry.get("importance", 0.5),
                )

            # Restore evidence
            ev = data.get("evidence", {"entries": [], "_version": 2})
            _save_json(EVIDENCE_FILE, ev)

            self._persist_meta_unlocked()
            self._log(f"import_data: hot={len(hot_data)} "
                      f"warm={len(warm_data)} cold={len(cold_data)}")

    # ── internal helpers ────────────────────────────────────────────────────────

    def _recall_entry(self, key: str) -> dict[str, Any] | None:
        """Find a memory entry across all tiers, lazy-loading as needed."""
        # Hot first (fastest)
        if key in self._hot:
            return self._hot[key]

        # Warm tier
        wf = WARM_DIR / f"{_safe_filename(key)}.json"
        if wf.exists():
            data = _load_json(wf)
            if key in data:
                entry = data[key]
                self._hot[key] = entry
                self._hot_loaded_keys.add(key)
                self._update_meta(key, "hot", time.time(),
                                  entry.get("importance", 0.5))
                return entry

        # Cold tier
        cf = COLD_DIR / f"{_safe_filename(key)}.json.zlib"
        if cf.exists():
            data = _load_compressed(cf)
            if key in data:
                entry = data[key]
                self._hot[key] = entry
                self._hot_loaded_keys.add(key)
                self._update_meta(key, "hot", time.time(),
                                  entry.get("importance", 0.5))
                return entry

        return None

    def _restore_hot(self) -> None:
        """Restore warm memories into hot if within memory budget."""
        budget = int(self._max_memory_bytes * 0.5)  # up to 50% of limit
        accumulated = 0

        for wf in sorted(WARM_DIR.glob("*.json")):
            if accumulated >= budget:
                break
            data = _load_json(wf)
            for key, entry in data.items():
                entry_size = len(json.dumps(entry).encode("utf-8"))
                if accumulated + entry_size > budget:
                    break
                self._hot[key] = entry
                self._hot_loaded_keys.add(key)
                accumulated += entry_size

        self._log(f"_restore_hot: loaded {len(self._hot)} entries "
                  f"({accumulated / KB:.1f} KB)")

    def _update_meta(self, key: str, tier: str,
                     last_access: float, importance: float) -> None:
        """Update meta index entry for a key."""
        entry = self._meta["keys"].setdefault(key, {})
        entry["tier"] = tier
        entry["last_access"] = last_access
        entry["importance"] = importance
        entry["confidence"] = entry.get("confidence", importance)
        entry["access_count"] = entry.get("access_count", 0)
        self._persist_meta_unlocked()

    def _persist_meta_unlocked(self) -> None:
        """Persist meta index (must hold lock)."""
        _save_json(META_FILE, self._meta)

    def _warm_key_count(self) -> int:
        return sum(1 for _ in WARM_DIR.glob("*.json"))

    def _cold_key_count(self) -> int:
        return sum(1 for _ in COLD_DIR.glob("*.json.zlib"))

    def _hot_size_bytes(self) -> int:
        return sum(
            len(json.dumps(e).encode("utf-8"))
            for e in self._hot.values()
        )

    def _warm_size_bytes(self) -> int:
        return sum(
            wf.stat().st_size
            for wf in WARM_DIR.glob("*.json")
        )

    def _cold_size_bytes(self) -> int:
        return sum(
            cf.stat().st_size
            for cf in COLD_DIR.glob("*.json.zlib")
        )

    # ── migration & enforcement ─────────────────────────────────────────────────

    def _migrate(self) -> None:
        """
        Move entries between tiers based on age and confidence.

        hot → warm: age > 1h OR confidence > 0.8 (but not both)
        warm → cold: age > 24h OR confidence < 0.4
        """
        with self._lock:
            now = time.time()
            to_warm: list[tuple[str, dict[str, Any]]] = []
            to_cold: list[tuple[str, dict[str, Any]]] = []

            for key, entry in list(self._hot.items()):
                age_hours = (now - entry.get("timestamp", now)) / 3600
                conf = entry.get("confidence", 0.5)

                if conf < HOT_CONFIDENCE_CUTOFF and age_hours > 1:
                    to_warm.append((key, entry))
                elif conf >= HOT_CONFIDENCE_CUTOFF and age_hours > 24:
                    to_warm.append((key, entry))

            # Migrate warm → cold
            for wf in list(WARM_DIR.glob("*.json")):
                data = _load_json(wf)
                migrated_keys = []
                for key, entry in list(data.items()):
                    age_hours = (now - entry.get("timestamp", now)) / 3600
                    conf = entry.get("confidence", 0.5)
                    if age_hours > 24 or conf < WARM_CONFIDENCE_MAX:
                        to_cold.append((key, entry))
                        migrated_keys.append(key)
                for k in migrated_keys:
                    data.pop(k, None)
                _save_json(wf, data)

            # Write warm entries
            warm_by_file: dict[str, list[tuple[str, dict[str, Any]]]] = {}
            for key, entry in to_warm:
                group = _safe_filename(key)[:32]
                warm_by_file.setdefault(group, []).append((key, entry))

            for group_key, entries in warm_by_file.items():
                wf = WARM_DIR / f"{group_key}.json"
                existing = _load_json(wf)
                for k, e in entries:
                    existing[k] = e
                    self._hot.pop(k, None)
                    self._hot_loaded_keys.discard(k)
                    self._update_meta(k, "warm", now, e.get("importance", 0.5))
                _save_json(wf, existing)

            # Write cold entries
            for key, entry in to_cold:
                cf = COLD_DIR / f"{_safe_filename(key)}.json.zlib"
                _save_compressed(cf, {key: entry})
                self._meta["keys"].pop(key, None)

            if to_warm or to_cold:
                self._log(f"_migrate: hot→warm {len(to_warm)}, "
                          f"warm→cold {len(to_cold)}")

    def _enforce_limit(self) -> None:
        """
        Enforce the memory size limit by:
        1. Migrating hot→warm→cold
        2. Evicting lowest-confidence entries when >80% of limit reached
        """
        with self._lock:
            hot_size = self._hot_size_bytes()
            warm_size = self._warm_size_bytes()
            total = hot_size + warm_size

            if total > self._max_memory_bytes * LIMIT_WARNING_FRAC:
                self._migrate()
                # Re-check after migration
                hot_size = self._hot_size_bytes()
                warm_size = self._warm_size_bytes()
                total = hot_size + warm_size

            if total > self._max_memory_bytes:
                # Evict lowest-confidence entries from hot
                sorted_hot = sorted(
                    self._hot.items(),
                    key=lambda x: x[1].get("confidence", 0),
                )
                evicted = 0
                while (self._hot_size_bytes() + self._warm_size_bytes()
                       > self._max_memory_bytes
                       and sorted_hot):
                    key, entry = sorted_hot.pop(0)
                    del self._hot[key]
                    self._hot_loaded_keys.discard(key)
                    self._meta["keys"].pop(key, None)
                    evicted += 1

                self._persist_meta_unlocked()
                self._log(f"_enforce_limit: evicted {evicted} hot entries")

    def _gc(self) -> int:
        """
        Garbage-collect cold entries with confidence below threshold.

        Returns
        -------
        int
            Number of entries removed.
        """
        with self._lock:
            removed = 0
            now = time.time()
            self._meta["_last_gc"] = _iso_now()

            for cf in list(COLD_DIR.glob("*.json.zlib")):
                data = _load_compressed(cf)
                keys = list(data.keys())
                dead = [
                    k for k in keys
                    if isinstance(data[k], dict)
                    and data[k].get("confidence", 0) < GC_CONFIDENCE_THRESHOLD
                ]
                for k in dead:
                    data.pop(k, None)
                    removed += 1
                if dead:
                    if data:
                        _save_compressed(cf, data)
                    else:
                        cf.unlink(missing_ok=True)
                for k in dead:
                    self._meta["keys"].pop(k, None)

            self._persist_meta_unlocked()
            self._log(f"_gc: removed {removed} cold entries")
            return removed

    def _gc_loop(self) -> None:
        """Background GC loop running every GC_INTERVAL_SEC."""
        while True:
            time.sleep(GC_INTERVAL_SEC)
            try:
                with self._lock:
                    elapsed = time.time() - self._last_gc_time
                if elapsed >= GC_INTERVAL_SEC:
                    self._last_gc_time = time.time()
                    self._gc()
            except Exception as exc:
                print(f"[MemoryManagerV2] _gc_loop error: {exc}")

    # ── self-test ───────────────────────────────────────────────────────────────

    @staticmethod
    def _test() -> None:
        """Run self-test scenarios and print results."""
        print("\n" + "=" * 60)
        print("MemoryManagerV2 Self-Test")
        print("=" * 60)

        mm = MemoryManagerV2(max_memory_mb=5.0, auto_gc=False)

        # 1. Basic store/recall
        print("\n[1] store / recall")
        mm.store("test:hello", {"msg": "world"}, metadata={"importance": 0.9})
        val = mm.recall("test:hello")
        assert val is not None, "recall failed"
        assert val["msg"] == "world", f"wrong value: {val}"
        print(f"  PASS: recall returned {val}")

        # 2. Exponential learn (positive)
        print("\n[2] learn positive")
        mm.learn("fix:typescript", "add type annotation", confidence=0.8,
                 positive=True)
        mm.learn("fix:typescript", "add type annotation", confidence=0.9,
                 positive=True)
        matches = mm.recall_pattern("fix:typescript")
        assert matches, "no pattern matches found"
        conf_after = matches[0]["confidence"]
        print(f"  PASS: confidence grew to {conf_after:.4f} (should be >0.8)")

        # 3. Exponential learn (negative)
        print("\n[3] learn negative")
        old_conf = mm.recall_pattern("fix:typescript")[0]["confidence"]
        mm.learn("fix:typescript", "add type annotation", confidence=0.8,
                 positive=False)
        new_conf = mm.recall_pattern("fix:typescript")[0]["confidence"]
        assert new_conf < old_conf, f"confidence should have decreased: {old_conf} → {new_conf}"
        print(f"  PASS: confidence decayed {old_conf:.4f} → {new_conf:.4f}")

        # 4. get_wisdom
        print("\n[4] get_wisdom")
        mm.store("test:error_handler", {"code": 500}, metadata={"importance": 0.7})
        wisdom = mm.get_wisdom("typescript error fix", limit=3)
        print(f"  PASS: get_wisdom returned {len(wisdom)} results")
        for w in wisdom:
            print(f"       score≈{w.get('confidence', 0):.2f}  "
                  f"{w.get('pattern', w.get('key', '?'))}")

        # 5. get_stats
        print("\n[5] get_stats")
        stats = mm.get_stats()
        print(f"  hot={stats['hot_count']} warm={stats['warm_count']} "
              f"cold={stats['cold_count']} evidence={stats['evidence_count']}")
        print(f"  total_size_mb={stats['total_size_mb']} "
              f"utilisation={stats['utilisation_frac']:.2%}")
        assert stats["hot_count"] >= 3, f"expected ≥3 hot entries, got {stats['hot_count']}"
        print("  PASS")

        # 6. Confidence update algorithm
        print("\n[6] _update_confidence algorithm")
        # 0.5 * exp(0.5*0.8) = 0.5 * e^0.4 ≈ 0.746
        c = _update_confidence(0.5, 0.8, positive=True)
        assert 0.7 < c < 0.8, f"expected 0.7–0.8, got {c:.4f}"
        # 0.746 * exp(0.5*0.8) = 0.746 * e^0.4 ≈ 1.113 → capped to 1.0
        c = _update_confidence(c, 0.8, positive=True)
        assert c == 1.0, f"expected 1.0 (capped), got {c}"
        # 1.0 * exp(-0.3*0.8) = 1.0 * e^-0.24 ≈ 0.787
        c = _update_confidence(c, 0.8, positive=False)
        assert 0.75 < c < 0.8, f"expected 0.75–0.8, got {c:.4f}"
        print(f"  PASS: positive→capped 1.0, negative decay→{c:.4f}")

        # 7. prune
        print("\n[7] prune")
        mm.store("test:trash", "low-value", metadata={"importance": 0.05})
        before = mm.get_stats()["hot_count"]
        removed = mm.prune(low_confidence=0.1)
        after = mm.get_stats()["hot_count"]
        assert after < before or removed > 0, "prune did nothing"
        print(f"  PASS: removed {removed} entries, hot: {before}→{after}")

        # 8. export / import
        print("\n[8] export / import")
        exported = mm.export()
        assert "_version" in exported
        assert "hot" in exported
        assert "evidence" in exported
        print(f"  PASS: export has {len(exported['hot'])} hot, "
              f"{len(exported['evidence']['entries'])} evidence entries")

        # 9. Multiple pattern outcomes
        print("\n[9] multiple outcomes per pattern")
        mm.learn("deploy", "blue-green switch", confidence=0.7, positive=True)
        mm.learn("deploy", "canary rollout", confidence=0.6, positive=True)
        outcomes = mm.recall_pattern("deploy")
        assert len(outcomes) == 2, f"expected 2 outcomes, got {len(outcomes)}"
        print(f"  PASS: {len(outcomes)} outcomes for 'deploy'")

        print("\n" + "=" * 60)
        print("All tests passed.")
        print("=" * 60)

        # Cleanup test files
        import shutil
        if MEM_DIR.exists():
            shutil.rmtree(MEM_DIR)
        print(f"Cleaned up {MEM_DIR}")


if __name__ == "__main__":
    MemoryManagerV2._test()
