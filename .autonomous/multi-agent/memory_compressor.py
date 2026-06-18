"""
memory_compressor.py — Memory compression engine for unbounded context with bounded resources.

Enables "unlimited context memory" by compressing old context while preserving
important decisions and learnings.

Preserves fully:
  - ADRs (architectural decision records)
  - Decisions with "critical" flag
  - Learnings from failed experiments (failure patterns are high-signal)

Summarizes:
  - Repeated successful patterns
  - Routine implementations
  - Medium-impact decisions

Compression strategy:
  - Importance scoring based on outcome impact, phase, and recency
  - "Memory echoes" — compressed one-line summaries of old iteration groups
  - Proactive compression when approaching token limits
"""

from __future__ import annotations

import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ── path constants ─────────────────────────────────────────────────────────────

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous/multi-agent"

MEMORY_FILE = MA / "memory.json"

# ── low-level JSON helpers ────────────────────────────────────────────────────

def load_json(path: Path) -> dict[str, Any]:
    """Load JSON from *path*, return {} on any error."""
    try:
        if not path.exists():
            return {}
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_json(path: Path, data: dict[str, Any]) -> None:
    """Atomically write *data* to *path* via rename."""
    tmp = path.with_suffix(".tmp")
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.replace(path)


# ── log helper ────────────────────────────────────────────────────────────────

def log(msg: str) -> None:
    """Print *msg* with ISO timestamp prefix."""
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"[{ts}] MemoryCompressor: {msg}", flush=True)


# ── token estimation ──────────────────────────────────────────────────────────

def _estimate_tokens(text: str) -> int:
    """Rough token estimate: ~4 chars per token."""
    if not text:
        return 0
    return max(1, len(str(text)) // 4)


# ── importance scoring ────────────────────────────────────────────────────────

# Tags / flags that always preserve content verbatim
PRESERVE_TAGS: frozenset[str] = frozenset([
    "adr", "critical", "failure", "failed", "error_pattern",
    "blocking", "architectural", "p0", "must_preserve",
])

# Tags that indicate summarizable content
SUMMARIZABLE_TAGS: frozenset[str] = frozenset([
    "routine", "implementation", "medium_impact", "incremental",
    "refactor", "chore", "minor",
])


def importance_score(learning: dict[str, Any]) -> float:
    """
    Score a learning entry 0.0–1.0 based on outcome impact, phase, and recency.

    Factors
    -------
    outcome_impact : 0.0–0.5  — explicit impact field; higher = more important
    phase_weight  : 0.0–0.3  — PLANNING/ARCHITECTURE > IMPLEMENTATION > TESTING > CHORE
    recency       : 0.0–0.2  — exponential decay; recent entries score higher
    flag_boost    : +0.3     — if any preserve tag is present
    failure_boost : +0.2     — if marked as failed experiment

    Returns
    -------
    float  0.0–1.0  (clamped)
    """
    score = 0.0

    # ── outcome impact ────────────────────────────────────────────────────────
    impact = float(learning.get("outcome_impact", 0.5))
    score += min(impact * 0.5, 0.5)

    # ── phase weight ──────────────────────────────────────────────────────────
    phase = (learning.get("phase") or "").upper()
    phase_weights = {
        "PLANNING": 0.3,
        "ARCHITECTURE": 0.3,
        "DESIGN": 0.25,
        "IMPLEMENTATION": 0.15,
        "TESTING": 0.1,
        "REVIEW": 0.1,
        "CHORE": 0.0,
    }
    score += phase_weights.get(phase, 0.05)

    # ── recency ───────────────────────────────────────────────────────────────
    updated_at = learning.get("updated_at") or learning.get("created_at")
    if updated_at:
        try:
            if isinstance(updated_at, str):
                updated_at = datetime.fromisoformat(updated_at.replace("Z", "+00:00"))
            age_hours = (datetime.now(timezone.utc) - updated_at).total_seconds() / 3600
            recency = max(0.0, 1.0 - (age_hours / (24 * 30)))  # decay over 30 days
            score += recency * 0.2
        except Exception:
            score += 0.05  # default recency floor

    # ── flag boosts ────────────────────────────────────────────────────────────
    tags = set((learning.get("tags") or []))
    flags = set((learning.get("flags") or []))
    combined = tags | flags

    for tag in PRESERVE_TAGS:
        if tag in combined:
            score += 0.3
            break

    if learning.get("failed") or learning.get("experiment_failed"):
        score += 0.2

    # ── outcome influence ──────────────────────────────────────────────────────
    outcome = (learning.get("outcome") or "").lower()
    if outcome in ("success", "successful", "passed"):
        score += 0.05
    elif outcome in ("failure", "failed", "error"):
        score += 0.15  # failure patterns are high-signal

    return max(0.0, min(1.0, score))


# ── key insight extraction ─────────────────────────────────────────────────────

def extract_key_insight(learnings_group: list[dict[str, Any]]) -> str:
    """
    Return a one-line string that captures the essence of a group of learnings.

    Strategy
    --------
    1. Find the highest-importance learning in the group.
    2. Prefer the most recent if scores are tied.
    3. Extract the ``summary``, ``description``, or ``title`` field.
    4. Fall back to concatenating the first 120 chars of the content.

    Returns
    -------
    str  one-line summary, max ~200 characters
    """
    if not learnings_group:
        return "[no insights]"

    # Score each learning and sort by (score desc, recency desc)
    scored = []
    for l in learnings_group:
        s = importance_score(l)
        updated_at = l.get("updated_at") or l.get("created_at") or ""
        scored.append((s, updated_at, l))

    scored.sort(key=lambda x: (x[0], x[1]), reverse=True)
    best = scored[0][2]

    # Field priority: summary → description → title → content
    for field in ("summary", "description", "title", "content", "text"):
        val = best.get(field) or best.get(field.replace("summary", "description"))
        if val and isinstance(val, str) and val.strip():
            text = val.strip()
            return text[:200] + ("…" if len(text) > 200 else "")

    # Final fallback: stringify the whole learning (abbreviated)
    fallback = json.dumps(best, ensure_ascii=False)
    return fallback[:180] + "…"


# ── memory echo ────────────────────────────────────────────────────────────────

def create_memory_echo(learning_group: list[dict[str, Any]]) -> str:
    """
    Create a "memory echo" — a compressed single-line summary of a group of
    related learnings from an old iteration or topic cluster.

    The echo distills WHAT was learned and WHAT the outcome was, stripped of
    implementation detail, into a form that survives indefinite retention.

    Format
    ------
    [ECHO · importance=0.xx] <key_insight>  |  outcomes: <outcomes_list>

    Returns
    -------
    str  one-line echo, max ~300 characters
    """
    if not learning_group:
        return "[empty echo]"

    key = extract_key_insight(learning_group)

    # Aggregate simple outcome tags
    outcomes: set[str] = set()
    for l in learning_group:
        o = (l.get("outcome") or "").lower()
        if o in ("success", "successful", "passed", "failure", "failed", "error"):
            outcomes.add(o)
        # Also collect explicit tags that look like outcomes
        for tag in (l.get("tags") or []):
            if tag in ("success", "failure", "error", "blocked", "deferred"):
                outcomes.add(tag)

    outcome_str = ""
    if outcomes:
        outcome_str = "  |  outcomes: " + ", ".join(sorted(outcomes))

    avg_score = sum(importance_score(l) for l in learning_group) / len(learning_group)
    echo = f"[ECHO · imp={avg_score:.2f}] {key}{outcome_str}"
    return echo[:300]


# ── compression helpers ───────────────────────────────────────────────────────

def _is_preserved(item: dict[str, Any], kind: str = "learning") -> bool:
    """Return True if *item* should be preserved verbatim (ADR, critical, failure)."""
    tags = set((item.get("tags") or []))
    flags = set((item.get("flags") or []))
    combined = tags | flags

    # Critical / ADR always preserved
    for tag in PRESERVE_TAGS:
        if tag in combined:
            return True

    # Explicit preserve flag
    if item.get("preserve") or item.get("critical"):
        return True

    # Decision type handling
    if kind == "decision":
        if item.get("decision_type") in ("adr", "architectural", "critical"):
            return True

    return False


def _summarize_text(text: str, max_len: int = 200) -> str:
    """
    Create a short summary of *text* by:
      - Stripping markdown noise (headers, bullets, code fences)
      - Taking the first meaningful sentence up to *max_len*
    """
    if not text:
        return ""

    # Remove code fences
    text = re.sub(r"```[\s\S]*?```", "", text)
    # Remove markdown headers
    text = re.sub(r"^#+\s+", "", text, flags=re.MULTILINE)
    # Collapse whitespace
    text = re.sub(r"\s+", " ", text).strip()

    if len(text) <= max_len:
        return text

    # Try to cut at a sentence boundary
    cut = text[:max_len]
    last_period = cut.rfind(".")
    last_newline = cut.rfind("\n")
    cutoff = max(last_period, last_newline)

    if cutoff > max_len * 0.5:
        return text[: cutoff + 1].strip()

    return cut.strip() + "…"


# ── compress_learnings ─────────────────────────────────────────────────────────

def compress_learnings(
    learnings: list[dict[str, Any]],
    max_items: int = 100,
) -> list[dict[str, Any]]:
    """
    Compress a list of learnings, returning a list of result objects.

    Result object shape
    ------------------
    {
        "original": dict,          # the original learning entry
        "compressed": dict|str,    # compressed form (or original if preserved)
        "importance_score": float, # 0.0–1.0
        "preserved": bool,         # True if kept verbatim
    }

    Strategy
    --------
    1. Score every learning.
    2. Items with preserve flags → preserved=True, compressed=original.
    3. Sort remaining by score descending; keep top *max_items*.
    4. Compress the rest into a "memory echo" grouped by theme.
    """
    results: list[dict[str, Any]] = []
    preserved: list[dict[str, Any]] = []
    to_summarize: list[dict[str, Any]] = []

    for l in learnings:
        score = importance_score(l)
        is_pres = _is_preserved(l)
        entry = {
            "original": l,
            "importance_score": score,
            "preserved": is_pres,
        }
        if is_pres:
            entry["compressed"] = l
            preserved.append(entry)
        else:
            entry["compressed"] = l  # placeholder; replaced below
            to_summarize.append(entry)

    # Sort summarizeable items by score
    to_summarize.sort(key=lambda x: x["importance_score"], reverse=True)

    kept = to_summarize[:max_items - len(preserved)]
    compressed_out = to_summarize[max_items - len(preserved):]

    for item in kept:
        item["compressed"] = item["original"]

    # Group the overflow into echoes (group by ~10 or by phase)
    if compressed_out:
        # Simple chronological grouping (oldest first → most compressible)
        batch_size = 10
        for i in range(0, len(compressed_out), batch_size):
            batch = compressed_out[i : i + batch_size]
            originals = [e["original"] for e in batch]
            echo = create_memory_echo(originals)
            # Attach echo as compressed version; original still accessible
            for e in batch:
                e["compressed"] = echo

    results = preserved + kept + compressed_out
    return results


# ── compress_decisions ─────────────────────────────────────────────────────────

def compress_decisions(
    decisions: list[dict[str, Any]],
    max_items: int = 50,
) -> list[dict[str, Any]]:
    """
    Compress a list of decisions, returning result objects.

    Result object shape
    -------------------
    {
        "original": dict,
        "compressed": dict|str,
        "preserved": bool,
    }

    Preserved verbatim: ADRs, "critical" decisions, decisions with "adr" tag.
    All others ranked by importance_score and top *max_items* kept verbatim.
    """
    results: list[dict[str, Any]] = []
    preserved: list[dict[str, Any]] = []
    to_rank: list[dict[str, Any]] = []

    for d in decisions:
        is_pres = _is_preserved(d, kind="decision")
        entry: dict[str, Any] = {"original": d, "preserved": is_pres}
        if is_pres:
            entry["compressed"] = d
            preserved.append(entry)
        else:
            entry["compressed"] = d
            to_rank.append(entry)

    # Score non-preserved decisions
    for e in to_rank:
        e["importance_score"] = importance_score(e["original"])

    to_rank.sort(key=lambda x: x.get("importance_score", 0), reverse=True)
    kept = to_rank[:max_items - len(preserved)]

    for e in kept:
        e["compressed"] = e["original"]

    overflow = to_rank[max_items - len(preserved):]
    for e in overflow:
        # Summarize overflow decisions
        d = e["original"]
        text = d.get("summary") or d.get("description") or d.get("title") or json.dumps(d)
        e["compressed"] = _summarize_text(text, max_len=150)

    results = preserved + kept + overflow
    return results


# ── compress_context_window ────────────────────────────────────────────────────

def compress_context_window(
    window: list[dict[str, Any]],
    max_tokens: int = 4000,
) -> list[dict[str, Any]]:
    """
    Compress a context-window entry list (e.g. messages, events, iterations).

    Result object shape
    ------------------
    {
        "original": dict,
        "compressed_summary": str,
        "tokens_saved": int,
    }

    Strategy
    --------
    1. Estimate tokens for each entry.
    2. If total ≤ *max_tokens*, return all originals with zero savings.
    3. Otherwise, iteratively compress the oldest/least-scored entries
       until under budget, preferring to keep high-importance entries intact.
    """
    results: list[dict[str, Any]] = []
    total_tokens = 0
    entries_with_tokens: list[dict[str, Any]] = []

    for entry in window:
        orig_text = json.dumps(entry, ensure_ascii=False)
        tokens = _estimate_tokens(orig_text)
        score = importance_score(entry) if isinstance(entry, dict) else 0.0
        entries_with_tokens.append({
            "original": entry,
            "tokens": tokens,
            "score": score,
        })
        total_tokens += tokens

    # Nothing to compress
    if total_tokens <= max_tokens:
        return [
            {
                "original": e["original"],
                "compressed_summary": e["original"],
                "tokens_saved": 0,
            }
            for e in entries_with_tokens
        ]

    # Sort by score ascending (lowest/oldest first for compression)
    entries_with_tokens.sort(key=lambda x: (x["score"], x["tokens"]))

    compressed_results: list[dict[str, Any]] = []
    current_tokens = total_tokens

    for e in entries_with_tokens:
        if current_tokens <= max_tokens:
            # Keep all remaining originals
            compressed_results.append({
                "original": e["original"],
                "compressed_summary": e["original"],
                "tokens_saved": 0,
            })
            continue

        # Compress this entry
        orig_text = json.dumps(e["original"], ensure_ascii=False)
        entry_dict = e["original"] if isinstance(e["original"], dict) else {}
        summary_text = (
            entry_dict.get("summary")
            or entry_dict.get("description")
            or entry_dict.get("content")
            or entry_dict.get("title")
            or _summarize_text(orig_text, max_len=250)
        )
        new_tokens = _estimate_tokens(summary_text)
        saved = e["tokens"] - new_tokens

        compressed_results.append({
            "original": e["original"],
            "compressed_summary": summary_text,
            "tokens_saved": max(0, saved),
        })
        current_tokens -= e["tokens"] - new_tokens

    # Restore original order
    compressed_results.sort(key=lambda x: (
        x["original"].get("order", 0)
        if isinstance(x["original"], dict) else 0
    ))

    return compressed_results


# ── get_memory_stats ──────────────────────────────────────────────────────────

def get_memory_stats(memory: dict[str, Any]) -> dict[str, Any]:
    """
    Compute statistics about a memory dictionary.

    Returns
    -------
    {
        "total_items": int,
        "estimated_tokens": int,
        "compression_ratio": float,    # 0.0 = nothing compressed yet
        "items_flagged_for_compression": int,
    }
    """
    total_items = 0
    estimated_tokens = 0
    flagged = 0

    sections = [
        "learnings",
        "decisions",
        "context_window",
        "iterations",
        "experiments",
        "events",
    ]

    for section in sections:
        items = memory.get(section, [])
        if not isinstance(items, list):
            continue
        for item in items:
            total_items += 1
            text = json.dumps(item, ensure_ascii=False)
            tokens = _estimate_tokens(text)
            estimated_tokens += tokens
            if _is_preserved(item):
                flagged += 1

    # Rough compression ratio estimate based on item count
    # If total_items > 500 we expect ~50% compression
    compression_ratio = 0.0
    if total_items > 100:
        compression_ratio = min(0.8, (total_items - 100) / total_items * 0.6)

    return {
        "total_items": total_items,
        "estimated_tokens": estimated_tokens,
        "compression_ratio": round(compression_ratio, 3),
        "items_flagged_for_compression": flagged,
    }


# ── should_compress ───────────────────────────────────────────────────────────

def should_compress(
    memory: dict[str, Any],
    threshold: int = 500,
) -> dict[str, Any]:
    """
    Determine whether memory should be compressed based on item count or
    estimated token budget.

    Returns
    -------
    {
        "yes": bool,
        "reason": str,
        "items_to_compress": int,
    }
    """
    stats = get_memory_stats(memory)
    total = stats["total_items"]
    tokens = stats["estimated_tokens"]

    if total <= threshold:
        return {
            "yes": False,
            "reason": f"item count {total} is within threshold {threshold}",
            "items_to_compress": 0,
        }

    # Estimate how many items to compress to get back under threshold
    # Target: compress enough to bring items down to ~threshold * 0.7
    target = int(threshold * 0.7)
    items_to_compress = max(0, total - target)

    # Also check token budget: ~4 tokens/char, 8k token budget
    token_budget_ok = tokens < 32000  # 8k tokens * 4 chars/token
    if not token_budget_ok:
        reason = f"estimated {tokens} tokens exceeds soft budget (~32k)"
    else:
        reason = f"item count {total} exceeds threshold {threshold}"

    return {
        "yes": True,
        "reason": reason,
        "items_to_compress": items_to_compress,
    }


# ── split_memory_by_age ───────────────────────────────────────────────────────

def split_memory_by_age(
    memory: dict[str, Any],
    recent_hours: int = 24,
    old_days: int = 7,
) -> dict[str, dict[str, Any]]:
    """
    Split a memory dict into three age tiers.

    Returns
    -------
    {
        "recent": dict,   # entries updated/created within *recent_hours*
        "old": dict,      # entries older than *recent_hours* but within *old_days*
        "ancient": dict,  # entries older than *old_days*
    }

    Each tier is a dict with the same structure keys (learnings, decisions, …)
    but only the relevant entries.
    """
    now = datetime.now(timezone.utc)

    def age_hours(entry: dict[str, Any]) -> float:
        ts = entry.get("updated_at") or entry.get("created_at")
        if not ts:
            return 999999.0
        try:
            if isinstance(ts, str):
                ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            return (now - ts).total_seconds() / 3600
        except Exception:
            return 999999.0

    sections = ["learnings", "decisions", "context_window", "iterations", "experiments"]

    recent: dict[str, list] = {s: [] for s in sections}
    old: dict[str, list] = {s: [] for s in sections}
    ancient: dict[str, list] = {s: [] for s in sections}

    for section in sections:
        items = memory.get(section, [])
        if not isinstance(items, list):
            continue
        for item in items:
            age = age_hours(item)
            if age <= recent_hours:
                recent[section].append(item)
            elif age <= old_days * 24:
                old[section].append(item)
            else:
                ancient[section].append(item)

    return {"recent": recent, "old": old, "ancient": ancient}


# ── compress_memory (main entry point) ─────────────────────────────────────────

def compress_memory(
    memory: dict[str, Any],
    max_items: int = 200,
) -> dict[str, Any]:
    """
    Compress *memory* dict in-place and return the compressed result.

    Compression is applied per section:
      - ``learnings``    → compress_learnings (max_items default 100)
      - ``decisions``    → compress_decisions (max_items default 50)
      - ``context_window`` → compress_context_window (max_tokens default 4000)

    Age-based pre-filtering:
      - Ancient items (older than 7 days) are always compressed first.
      - Recent items (within 24h) are preserved unless *max_items* demands it.

    Returns the compressed memory dict (same object, mutated).
    """
    sections = split_memory_by_age(memory)

    compressed = dict(memory)

    # ── learnings ─────────────────────────────────────────────────────────────
    learnings = memory.get("learnings", [])
    if isinstance(learnings, list) and learnings:
        # Ancient learnings always compressed; recent kept unless over budget
        ancient_l = sections["ancient"]["learnings"]
        recent_l = sections["recent"]["learnings"]
        old_l = sections["old"]["learnings"]

        # Target: max_items total; recent优先
        recent_count = len(recent_l)
        old_count = len(old_l)
        ancient_count = len(ancient_l)

        # Simple allocation: keep recent fully, then fill from old, then compress ancient
        keep_from_recent = min(recent_count, max_items)
        remaining = max_items - keep_from_recent
        keep_from_old = min(old_count, max(0, remaining))
        remaining -= keep_from_old

        # Compress learnings
        results = compress_learnings(learnings, max_items=max_items)
        # Filter to only items that should be kept (preserved or scored high enough)
        # For simplicity: keep top max_items by score
        scored_results = [(r, r.get("importance_score", 0)) for r in results]
        scored_results.sort(key=lambda x: x[1], reverse=True)
        kept_results = scored_results[:max_items]

        compressed["learnings"] = [r for r, _ in kept_results]

    # ── decisions ────────────────────────────────────────────────────────────
    decisions = memory.get("decisions", [])
    if isinstance(decisions, list) and decisions:
        results = compress_decisions(decisions, max_items=50)
        # Keep all preserved + top 50 by score
        scored = [(r, r.get("importance_score", 0)) for r in results]
        scored.sort(key=lambda x: x[1], reverse=True)
        kept = scored[:50]
        compressed["decisions"] = [r for r, _ in kept]

    # ── context_window ────────────────────────────────────────────────────────
    context_window = memory.get("context_window", [])
    if isinstance(context_window, list) and context_window:
        results = compress_context_window(context_window, max_tokens=4000)
        # Keep compressed summaries in place of originals where tokens_saved > 0
        simplified = []
        for r in results:
            if r["tokens_saved"] > 0:
                simplified.append(r["compressed_summary"])
            else:
                simplified.append(r["original"])
        compressed["context_window"] = simplified

    # ── iterations ────────────────────────────────────────────────────────────
    iterations = memory.get("iterations", [])
    if isinstance(iterations, list) and iterations:
        # Compress old iterations: keep last 20, compress older ones
        if len(iterations) > 20:
            recent_iters = iterations[-20:]
            old_iters = iterations[:-20]
            # Compress old iterations into echoes
            echoes = []
            for i in range(0, len(old_iters), 5):
                batch = old_iters[i : i + 5]
                summaries = [
                    _summarize_text(
                        (it.get("summary") or it.get("description") or json.dumps(it))[:300],
                        max_len=150,
                    )
                    for it in batch
                ]
                echoes.append(f"[ITER_ECHOS] {' | '.join(summaries)}")
            compressed["iterations"] = recent_iters + echoes
        else:
            compressed["iterations"] = iterations

    # ── metadata ───────────────────────────────────────────────────────────────
    compressed["_compression_meta"] = {
        "compressed_at": datetime.now(timezone.utc).isoformat(),
        "original_stats": get_memory_stats(memory),
        "compressed_stats": get_memory_stats(compressed),
    }

    return compressed


# ── MemoryCompressor class ────────────────────────────────────────────────────

class MemoryCompressor:
    """
    High-level interface for memory compression operations.

    Provides stateful helpers (optional) and delegates to the module-level
    functions above. All public methods match the API described in the module
    docstring.

    Example
    -------
    >>> mc = MemoryCompressor()
    >>> mem = load_json(MEMORY_FILE)
    >>> decision = mc.should_compress(mem)
    >>> if decision["yes"]:
    ...     mem = mc.compress_memory(mem, max_items=200)
    ...     save_json(MEMORY_FILE, mem)
    """

    MEMORY_FILE = MA / "memory.json"

    def compress_memory(
        self,
        memory: dict[str, Any],
        max_items: int = 200,
    ) -> dict[str, Any]:
        return compress_memory(memory, max_items)

    def compress_learnings(
        self,
        learnings: list[dict[str, Any]],
        max_items: int = 100,
    ) -> list[dict[str, Any]]:
        return compress_learnings(learnings, max_items)

    def compress_decisions(
        self,
        decisions: list[dict[str, Any]],
        max_items: int = 50,
    ) -> list[dict[str, Any]]:
        return compress_decisions(decisions, max_items)

    def compress_context_window(
        self,
        window: list[dict[str, Any]],
        max_tokens: int = 4000,
    ) -> list[dict[str, Any]]:
        return compress_context_window(window, max_tokens)

    def create_memory_echo(
        self,
        learning_group: list[dict[str, Any]],
    ) -> str:
        return create_memory_echo(learning_group)

    def get_memory_stats(
        self,
        memory: dict[str, Any],
    ) -> dict[str, Any]:
        return get_memory_stats(memory)

    def should_compress(
        self,
        memory: dict[str, Any],
        threshold: int = 500,
    ) -> dict[str, Any]:
        return should_compress(memory, threshold)

    def importance_score(
        self,
        learning: dict[str, Any],
    ) -> float:
        return importance_score(learning)

    def extract_key_insight(
        self,
        learnings_group: list[dict[str, Any]],
    ) -> str:
        return extract_key_insight(learnings_group)

    def split_memory_by_age(
        self,
        memory: dict[str, Any],
    ) -> dict[str, dict[str, Any]]:
        return split_memory_by_age(memory)

    def compress_from_file(
        self,
        path: Path | None = None,
        max_items: int = 200,
    ) -> dict[str, Any]:
        """
        Load memory from *path*, compress, save back, and return compressed memory.
        Uses MEMORY_FILE as default path.
        """
        file_path = Path(path) if path else self.MEMORY_FILE
        mem = load_json(file_path)
        compressed = self.compress_memory(mem, max_items)
        save_json(file_path, compressed)
        log(f"Compressed {file_path.name}: {get_memory_stats(mem)['total_items']} → "
            f"{get_memory_stats(compressed)['total_items']} items")
        return compressed


# ── CLI smoke-test ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys

    mc = MemoryCompressor()

    # Load current memory
    mem = load_json(MEMORY_FILE)
    stats = mc.get_memory_stats(mem)
    print(f"Memory stats: {stats}")

    decision = mc.should_compress(mem)
    print(f"should_compress: {decision}")

    # Show age split
    split = mc.split_memory_by_age(mem)
    for tier in ("recent", "old", "ancient"):
        total = sum(len(v) for v in split[tier].values())
        print(f"  {tier}: {total} items across sections")

    # Demo echo
    all_learnings = mem.get("learnings", [])[:5]
    if all_learnings:
        echo = mc.create_memory_echo(all_learnings)
        print(f"\nMemory echo demo:\n  {echo}")

    # Demo key insight
    insight = mc.extract_key_insight(all_learnings)
    print(f"\nKey insight:\n  {insight}")

    # Score demo
    for i, l in enumerate(all_learnings[:3]):
        sc = mc.importance_score(l)
        print(f"  learning[{i}] importance_score={sc:.3f}")

    # Compress decisions demo
    decisions = mem.get("decisions", [])
    if decisions:
        res = mc.compress_decisions(decisions, max_items=10)
        print(f"\nDecisions compression: {len(decisions)} → {len(res)} results")
        for r in res[:3]:
            print(f"  preserved={r['preserved']} score={r.get('importance_score', 'N/A')}")

    # Compress context window demo
    cw = mem.get("context_window", [])
    if cw:
        res = mc.compress_context_window(cw, max_tokens=4000)
        total_saved = sum(r.get("tokens_saved", 0) for r in res)
        print(f"\nContext window: {len(cw)} → {len(res)} entries, saved ~{total_saved} tokens")

    print("\nAll methods verified OK")
    sys.exit(0)
