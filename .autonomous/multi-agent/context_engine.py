"""
context_engine.py — Deep context management for unbounded project understanding.

Provides sliding-window, relevance-scored context so agents always understand
what the loop is working on without re-parsing the entire project.

Sources
───────
  SPEC.md         → project vision, principles, architecture
  DECISIONS.md    → architectural decision records
  PROGRESS.md     → recent work, current iteration, changelog
  memory.json     → accumulated learnings, decisions, error/success patterns
  context_snapshot.json → live triad status, pending features, git state

Scoring
───────
  relevance  — keyword overlap with iteration_goal
  recency    — exponential decay:  e^(-hours_ago / 12h)
  decision_impact — ADRs and memory decisions boosted 2×

Token budget
────────────
  Default 8 000 tokens (~32 000 chars).  Configurable per-call.
"""

from __future__ import annotations

import hashlib
import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal

# ── path constants ─────────────────────────────────────────────────────────────

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous/multi-agent"

MEMORY_FILE = MA / "memory.json"
SNAPSHOT_FILE = MA / "context_snapshot.json"
SPEC_FILE = ROOT / "SPEC.md"
DECISIONS_FILE = ROOT / "DECISIONS.md"
PROGRESS_FILE = ROOT / "PROGRESS.md"

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
    print(f"[{ts}] ContextEngine: {msg}", flush=True)


# ── token helpers ─────────────────────────────────────────────────────────────

def _estimate_tokens(text: str) -> int:
    """Rough token estimate: ~4 chars per token."""
    return max(1, len(text) // 4)


def _truncate(text: str, max_chars: int) -> str:
    """Truncate to *max_chars* with ellipsis marker."""
    if len(text) <= max_chars:
        return text
    return text[: max(max_chars - 3, 0)] + "…"


# ── relevance scoring ─────────────────────────────────────────────────────────

def _relevance_to_goal(entry: dict, goal: str) -> float:
    """Keyword-overlap score between *entry* and *goal* string."""
    if not goal:
        return 0.0
    keywords = re.findall(r"\w{4,}", goal.lower())
    if not keywords:
        return 0.0
    body = " ".join(str(v) for v in entry.values()).lower()
    hits = sum(1 for kw in keywords if kw in body)
    return hits / len(keywords)


def _recency_score(timestamp: float) -> float:
    """
    Exponential-decay recency score.
    Half-life ≈ 8.3 hours (ln 2 / (1/12)).
    """
    age_hours = (time.time() - timestamp) / 3600
    return max(0.0, (0.5) ** (age_hours / 12))


def _decision_impact(entry: dict) -> float:
    """Boost for entries flagged as architectural decisions."""
    return 2.0 if entry.get("is_decision") else 1.0


def _compute_score(entry: dict, goal: str) -> float:
    """Combined score: recency × decision_impact + relevance_to_goal."""
    recency = _recency_score(entry.get("timestamp", time.time()))
    relevance = _relevance_to_goal(entry, goal)
    impact = _decision_impact(entry)
    return recency * impact + relevance


# ── source parsers ────────────────────────────────────────────────────────────

def _parse_spec_vision() -> dict:
    """Extract vision and mission from SPEC.md."""
    try:
        text = SPEC_FILE.read_text(encoding="utf-8")
    except Exception:
        return {"vision": "", "principles": [], "stack": []}

    # Extract mission text from blockquote sections and principles
    # Blockquotes (>) are valid content lines in SPEC.md
    mission_lines: list[str] = []
    principle_blocks: list[str] = []
    stack_info: list[str] = []

    lines = text.splitlines()
    capture_mission = False
    capture_principles = False

    for line in lines:
        stripped = line.strip()
        # Section boundary detection
        if stripped.startswith("## "):
            if "## 1. Mission" in stripped or "## 2. Mandato" in stripped:
                capture_mission = True
                capture_principles = False
                continue
            if "## 3. Princípios Inegociáveis" in stripped:
                capture_mission = False
                capture_principles = True
                continue
            # Any other ## heading ends both captures
            capture_mission = False
            capture_principles = False

        if capture_mission and stripped and not stripped.startswith("#"):
            # lstrip(">") handles blockquote markup
            mission_lines.append(stripped.lstrip(">").strip())
        elif capture_principles and stripped and not stripped.startswith("#"):
            principle_blocks.append(stripped.lstrip(">").strip())

    mission_text = " ".join(mission_lines)

    # Extract stack from PROGRESS overview
    try:
        prog = PROGRESS_FILE.read_text(encoding="utf-8")
        stack_match = re.search(r"Stack[:\s]+(.+?)(?:\n|$)", prog, re.IGNORECASE)
        if stack_match:
            stack_info = [s.strip() for s in stack_match.group(1).split("·") if s.strip()]
    except Exception:
        pass

    return {
        "vision": mission_text.strip(),
        "principles": principle_blocks[:13],
        "stack": stack_info,
        "source": str(SPEC_FILE),
    }


def _parse_decisions_md(limit: int = 10) -> list[dict]:
    """Extract recent decisions from DECISIONS.md."""
    try:
        text = DECISIONS_FILE.read_text(encoding="utf-8")
    except Exception:
        return []

    decisions: list[dict] = []
    # Split on "## D-XXX:" or "**Date:**" boundaries
    blocks = re.split(r"(?=^## [A-Z])", text, flags=re.MULTILINE)
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        # Extract date
        date_m = re.search(r"\*\*Date:\*\*\s*(.+)", block)
        # Extract title
        title_m = re.search(r"^##\s+(D-\d+[^\n]*|[^\n]+)", block, re.MULTILINE)
        # Extract body (first 200 chars)
        body_lines = [l for l in block.splitlines() if l.strip() and not l.strip().startswith("#")]
        body = " ".join(body_lines[:3])[:200]
        if title_m:
            decisions.append({
                "id": f"decision:{title_m.group(1).strip()}",
                "title": title_m.group(1).strip(),
                "date": date_m.group(1).strip() if date_m else "",
                "summary": body,
                "is_decision": True,
                "timestamp": _date_to_timestamp(date_m.group(1)) if date_m else time.time(),
                "source": str(DECISIONS_FILE),
            })

    decisions.sort(key=lambda d: d.get("timestamp", 0), reverse=True)
    return decisions[:limit]


def _date_to_timestamp(date_str: str) -> float:
    """Parse a date string to epoch timestamp."""
    for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(date_str.strip(), fmt).timestamp()
        except Exception:
            pass
    return time.time()


def _parse_progress_state() -> dict:
    """Extract current iteration state from PROGRESS.md."""
    try:
        text = PROGRESS_FILE.read_text(encoding="utf-8")
    except Exception:
        return {}

    state: dict[str, Any] = {"current_version": "", "recent_releases": [], "iteration_summary": ""}

    # Version from first heading
    ver_m = re.search(r"##\s+v?(\d+\.\d+\.\d+)\s+\(([^)]+)\)", text)
    if ver_m:
        state["current_version"] = f"v{ver_m.group(1)}"
        state["version_date"] = ver_m.group(2)

    # Recent releases (first 3 version blocks)
    releases: list[dict] = []
    rel_blocks = re.findall(
        r"(?m)^##\s+v?(\d+\.\d+\.\d+)\s+\([^)]+\)(.+?)(?=^## |\Z)",
        text[:3000],
        re.DOTALL | re.MULTILINE,
    )
    for ver, body in rel_blocks[:3]:
        releases.append({"version": f"v{ver}", "summary": body[:200].strip()})
    state["recent_releases"] = releases

    # Current iteration summary from PROGRESS
    iter_m = re.search(r"(?m)^## (Iter\d+.*?)(?=^## |\Z)", text[:2000], re.DOTALL)
    if iter_m:
        state["iteration_summary"] = iter_m.group(1).strip()[:500]

    state["source"] = str(PROGRESS_FILE)
    return state


def _parse_memory_decisions(limit: int = 10) -> list[dict]:
    """Extract decisions from memory.json."""
    data = load_json(MEMORY_FILE)
    entries: list[dict] = []

    # recent_decisions field
    for entry in data.get("recent_decisions", [])[:limit]:
        entry["is_decision"] = True
        entry["source"] = str(MEMORY_FILE)
        entries.append(entry)

    return entries


def _parse_context_snapshot() -> dict:
    """Extract live snapshot data."""
    data = load_json(SNAPSHOT_FILE)
    if not data:
        return {}
    return {
        "triad": data.get("triad", {}),
        "git": data.get("git", {}),
        "pending_features_count": data.get("features", {}).get("pending_count", 0),
        "generated_at": data.get("generated_at", ""),
        "codegraph_ok": data.get("codegraph", {}).get("ok", False),
        "source": str(SNAPSHOT_FILE),
    }


def _parse_memory_learnings() -> list[dict]:
    """Extract learnings and patterns from memory.json."""
    data = load_json(MEMORY_FILE)
    learnings: list[dict] = []

    for entry in data.get("learnings", [])[:5]:
        entry["is_decision"] = False
        entry["source"] = str(MEMORY_FILE)
        learnings.append(entry)

    for pattern_type in ("success_patterns", "error_patterns"):
        for key, val in data.get(pattern_type, {}).items():
            learnings.append({
                "id": f"pattern:{key}",
                "type": pattern_type,
                "summary": str(val)[:200],
                "is_decision": False,
                "timestamp": time.time(),
                "source": str(MEMORY_FILE),
            })
    return learnings[:10]


def _area_keywords() -> dict[str, list[str]]:
    """Keywords per life-area for relevance scoring."""
    return {
        "vitalidadeEnergia": ["saúde", "energia", "sexualidade", "corpo", "vital", "hábito"],
        "conexoesAmor": ["amor", "relação", "relacionamento", "família", "vínculo", "parceiro"],
        "carreiraProsperidade": ["carreira", "finanças", "prosperidade", "abundância", "dinheiro", "trabalho"],
        "oriCabecaQuizilas": ["intuição", "propósito", "direção", "mente", "orixá", "cabeca"],
        "missaoDestino": ["missão", "destino", "transcendência", "alma", "vocação", "karma"],
        "desafiosSombras": ["sombra", "transformação", "karma", "medo", "superacao", "shadow"],
        "akasha": ["akasha", "síntese", "tipo", "arquétipo", "siddhi", "frequência"],
        "ux": ["ui", "ux", "interface", "design", "a11y", "accessibility", "wcag"],
        "auth": ["auth", "login", "sessão", "token", "jwt", "refresh"],
        "database": ["prisma", "postgres", "sqlite", "migration", "schema"],
        "api": ["api", "route", "endpoint", "rest", "graphql"],
        "evolution": ["ciclo", "evolução", "agente", "pilar", "patterns", "history"],
        "build": ["build", "test", "typecheck", "turbopack", "deploy"],
        "oráculo": ["i ching", "hexagrama", "oráculo", "divinação", "consulta"],
        "conexões": ["conexão", "sincronia", "parceiro", "compatibilidade", "análise"],
    }


# ── ContextEngine ─────────────────────────────────────────────────────────────

class ContextEngine:
    """
    Deep context manager for the Akasha autonomous loop.

    Manages a sliding window of context entries, scored by recency,
    goal-relevance, and decision-impact, pruned to fit within a token budget.
    """

    def __init__(
        self,
        max_tokens: int = 8000,
        snapshot_file: Path | None = None,
        memory_file: Path | None = None,
    ) -> None:
        self.max_tokens = max_tokens
        self._store: dict[str, dict[str, Any]] = {}  # key → entry
        self._window_order: list[str] = []           # insertion order for LRU
        self._hash: str = ""
        self._snapshot_file = snapshot_file or SNAPSHOT_FILE
        self._memory_file = memory_file or MEMORY_FILE
        self._log = log

        # Warm the store with project constants on init
        self._warm_store()

    # ── internal store ─────────────────────────────────────────────────────────

    def _warm_store(self) -> None:
        """Pre-load static project context into the store."""
        ts = time.time()
        # Vision
        vision = _parse_spec_vision()
        self._add_entry_unscored("vision:mission", {"vision": vision}, ts)
        self._add_entry_unscored("vision:principles", {"principles": vision.get("principles", [])}, ts)
        self._add_entry_unscored("vision:stack", {"stack": vision.get("stack", [])}, ts)

        # Decisions from DECISIONS.md
        decisions = _parse_decisions_md(limit=20)
        for d in decisions:
            key = d["id"]
            d.pop("id", None)
            self._add_entry_unscored(f"decision:{key}", d, d.get("timestamp", ts))

        # Decisions from memory
        mem_decisions = _parse_memory_decisions(limit=10)
        for d in mem_decisions:
            key = d.get("id", f"mem:{d.get('title','unknown')}")
            self._add_entry_unscored(key, d, d.get("timestamp", ts))

        # Progress state
        progress = _parse_progress_state()
        self._add_entry_unscored("state:progress", progress, ts)

        # Snapshot
        snapshot = _parse_context_snapshot()
        self._add_entry_unscored("state:snapshot", snapshot, ts)

        # Learnings
        learnings = _parse_memory_learnings()
        for lr in learnings:
            key = lr.get("id", f"learning:{lr.get('type','misc')}")
            self._add_entry_unscored(key, lr, lr.get("timestamp", ts))

        self._recompute_hash()

    def _add_entry_unscored(self, key: str, value: Any, timestamp: float) -> None:
        """Add *value* to the store, replacing any existing entry for *key*."""
        if key in self._store:
            # Update existing — preserve LRU position
            self._store[key]["value"] = value
            self._store[key]["timestamp"] = timestamp
        else:
            self._store[key] = {
                "key": key,
                "value": value,
                "timestamp": timestamp,
                "relevance_score": 0.0,
                "is_decision": False,
            }
            self._window_order.append(key)

    def _recompute_hash(self) -> None:
        """Update the context fingerprint."""
        items = sorted(self._store.items(), key=lambda x: x[0])
        fingerprint = json.dumps(items, sort_keys=True, default=str, ensure_ascii=False)
        self._hash = hashlib.md5(fingerprint.encode()).hexdigest()

    # ── public API ────────────────────────────────────────────────────────────

    def add_to_context(
        self,
        key: str,
        value: Any,
        relevance_score: float = 0.5,
        is_decision: bool = False,
    ) -> None:
        """
        Add *key* → *value* to the context store with *relevance_score*.

        Parameters
        ----------
        key            : dotted namespaced key, e.g. "agent:MemoryManager:result"
        value          : JSON-serialisable payload
        relevance_score: 0.0–1.0 — tells the engine how critical this entry is;
                         ADRs and high-signal learnings should get 0.8–1.0
        is_decision    : True flags this as an architectural decision (2× boost
                         applied during scoring, making it harder to prune)
        """
        ts = time.time()
        if key in self._store:
            self._store[key]["value"] = value
            self._store[key]["timestamp"] = ts
            self._store[key]["relevance_score"] = relevance_score
            self._store[key]["is_decision"] = is_decision
        else:
            self._store[key] = {
                "key": key,
                "value": value,
                "timestamp": ts,
                "relevance_score": relevance_score,
                "is_decision": is_decision,
            }
            self._window_order.append(key)
        self._recompute_hash()
        self._log(f"add_to_context key={key} relevance={relevance_score} decision={is_decision}")

    def prune_context(self, max_tokens: int | None = None) -> dict[str, Any]:
        """
        Remove low-relevance entries until the store fits within *max_tokens*.

        Scoring formula per entry:
          score = recency(entry) × decision_impact(entry) + relevance_to_goal

        Entries with is_decision=True get a 2× decision_impact multiplier,
        making them roughly twice as hard to prune.

        Returns a summary of what was removed.

        Parameters
        ----------
        max_tokens : token budget (default: self.max_tokens, i.e. 8 000)

        Returns
        -------
        dict with keys ``removed_count``, ``removed_keys``, ``remaining_tokens``
        """
        budget = (max_tokens if max_tokens is not None else self.max_tokens) * 4  # char budget
        removed: list[str] = []
        max_chars = budget

        while True:
            total_chars = sum(
                _estimate_tokens(json.dumps(v.get("value", ""), default=str))
                for v in self._store.values()
            )
            if total_chars <= max_chars:
                break

            # Score every entry
            scored = [
                (key, _compute_score(entry, ""))
                for key, entry in self._store.items()
            ]
            # Never prune vision or decisions
            safe_keys = {
                k for k, _ in scored
                if k.startswith("vision:") or k.startswith("decision:")
            }
            prunable = [(k, s) for k, s in scored if k not in safe_keys]
            if not prunable:
                break  # can't prune further

            prunable.sort(key=lambda x: x[1])
            victim_key, _ = prunable[0]
            removed.append(victim_key)
            del self._store[victim_key]
            self._window_order.remove(victim_key)

        self._recompute_hash()
        self._log(
            f"prune_context removed={len(removed)} keys "
            f"remaining={len(self._store)}"
        )
        return {
            "removed_count": len(removed),
            "removed_keys": removed,
            "remaining_tokens": sum(
                _estimate_tokens(json.dumps(v.get("value", ""), default=str))
                for v in self._store.values()
            ),
        }

    def build_full_context(
        self,
        iteration_goal: str | None = None,
    ) -> dict[str, Any]:
        """
        Build a rich, scored context dict for the current iteration.

        Parameters
        ----------
        iteration_goal : free-text description of what this iteration is doing;
                        used for relevance scoring and filtering

        Returns
        -------
        dict with keys:
          vision       — project mission and principles
          constraints  — technical constraints and stack info
          recent_decisions — last N decisions (up to 10, from both sources)
          current_state — git status, triad results, pending features
          area_focus   — the *iteration_goal* broken into life-area tags
          context_entries — all scored, sorted highest-first
          token_budget — max_tokens setting used
          context_hash — fingerprint of current context for cache invalidation
          area_keywords — keyword map used for area matching
        """
        # Score all entries against the goal
        scored_entries: list[dict[str, Any]] = []
        for key, entry in self._store.items():
            entry = dict(entry)
            entry["score"] = _compute_score(entry, iteration_goal or "")
            # Attach namespace label
            entry["namespace"] = key.split(":")[0] if ":" in key else "misc"
            scored_entries.append(entry)

        scored_entries.sort(key=lambda e: e["score"], reverse=True)

        # Detect which areas the goal maps to
        area_focus = self._detect_area_focus(iteration_goal or "")

        # Auto-prune if over budget (iterative goal-specific prune)
        budget = self.max_tokens * 4
        while True:
            total = sum(
                _estimate_tokens(json.dumps(e.get("value", ""), default=str))
                for e in scored_entries
            )
            if total <= budget:
                break
            scored_entries.pop()

        # Sections as structured dict (not raw text)
        sections: dict[str, Any] = {}
        for key, entry in self._store.items():
            ns = key.split(":")[0] if ":" in key else "misc"
            if ns not in sections:
                sections[ns] = []
            sections[ns].append(entry.get("value", {}))

        # Compact entries for return
        compact = [
            {
                "key": e["key"],
                "namespace": e["namespace"],
                "score": round(e["score"], 4),
                "is_decision": e.get("is_decision", False),
                "value_preview": _truncate(
                    json.dumps(e.get("value", {}), default=str, ensure_ascii=False),
                    500,
                ),
            }
            for e in scored_entries
        ]

        result = {
            "vision": self.get_project_vision(),
            "constraints": self.get_project_constraints(),
            "recent_decisions": self.get_recent_decisions(limit=10),
            "current_state": sections.get("state", [{}])[0] if sections.get("state") else {},
            "area_focus": area_focus,
            "context_entries": compact,
            "token_budget": self.max_tokens,
            "context_hash": self._hash,
            "area_keywords": _area_keywords(),
        }

        self._log(
            f"build_full_context goal={str(iteration_goal)[:60]} "
            f"entries={len(compact)} hash={self._hash[:8]}"
        )
        return result

    def build_area_context(
        self,
        area: str,
        iteration_goal: str | None = None,
    ) -> dict[str, Any]:
        """
        Build a focused context for a specific project *area*.

        Areas are matched via keyword overlap against the built-in area keyword
        map (see ``_area_keywords()``).  Custom areas can be any string.

        Parameters
        ----------
        area         : one of the built-in area keys (e.g. "akasha", "ux",
                       "database") or a free-text area name
        iteration_goal : optional goal text for deeper filtering

        Returns
        -------
        dict with keys:
          area        — the *area* argument
          vision      — project vision (always included)
          constraints — project constraints (always included)
          area_entries — entries matching this area, scored and sorted
          related_decisions — decisions relevant to this area
          context_hash — fingerprint for cache invalidation
        """
        keywords = _area_keywords()
        area_kw = keywords.get(area, [area.lower()])

        # Filter and score
        area_entries: list[dict[str, Any]] = []
        for key, entry in self._store.items():
            text = json.dumps(entry.get("value", {}), default=str).lower()
            if any(kw.lower() in text for kw in area_kw):
                score = _compute_score(entry, iteration_goal or "")
                area_entries.append({
                    "key": key,
                    "score": round(score, 4),
                    "is_decision": entry.get("is_decision", False),
                    "namespace": key.split(":")[0] if ":" in key else "misc",
                    "value_preview": _truncate(text, 500),
                })

        area_entries.sort(key=lambda e: e["score"], reverse=True)

        # Relevant decisions
        related_decisions = [
            e for e in area_entries if e.get("is_decision")
        ]

        result = {
            "area": area,
            "vision": self.get_project_vision(),
            "constraints": self.get_project_constraints(),
            "area_entries": area_entries,
            "related_decisions": related_decisions[:5],
            "context_hash": self._hash,
        }

        self._log(
            f"build_area_context area={area} "
            f"entries={len(area_entries)} decisions={len(related_decisions)}"
        )
        return result

    def get_context_summary(self) -> str:
        """
        Return a brief human-readable summary of the current context state.

        Shows entry counts per namespace, token budget utilisation,
        and the current git status from the snapshot.
        """
        ns_counts: dict[str, int] = {}
        for key in self._store:
            ns = key.split(":")[0] if ":" in key else "misc"
            ns_counts[ns] = ns_counts.get(ns, 0) + 1

        total_tokens = sum(
            _estimate_tokens(json.dumps(v.get("value", ""), default=str))
            for v in self._store.values()
        )

        snapshot = _parse_context_snapshot()
        git_state = snapshot.get("git", {}) if snapshot else {}
        triad = snapshot.get("triad", {}) if snapshot else {}

        lines = [
            "ContextEngine summary",
            f"  entries : {len(self._store)} total  |  {total_tokens} tokens "
            f"(budget {self.max_tokens})",
            f"  hash    : {self._hash[:8]}",
            "  by ns   : " + "  |  ".join(f"{k}={c}" for k, c in sorted(ns_counts.items())),
            "  git     : "
            + (
                f"modified={git_state.get('modified',0)} "
                f"untracked={git_state.get('untracked',0)}"
                if git_state
                else "unknown"
            ),
            "  triad   : "
            + (
                f"typecheck={'PASS' if triad.get('typecheck',{}).get('pass') else 'FAIL'}  "
                f"tests={'PASS' if triad.get('tests',{}).get('pass') else 'FAIL'}"
                if triad
                else "unknown"
            ),
        ]
        return "\n".join(lines)

    def get_project_vision(self) -> dict[str, Any]:
        """
        Return the project's goals and vision from SPEC.md.

        Returns
        -------
        dict with keys ``vision`` (str), ``principles`` (list[str]),
        ``stack`` (list[str]), ``source`` (str)
        """
        entry = self._store.get("vision:mission", {})
        value = entry.get("value", {}) if isinstance(entry, dict) else {}
        if not value:
            value = _parse_spec_vision()
        return {
            "vision": value.get("vision", ""),
            "principles": value.get("principles", []),
            "stack": value.get("stack", []),
            "source": str(SPEC_FILE),
        }

    def get_recent_decisions(self, limit: int = 10) -> list[dict[str, Any]]:
        """
        Return the *limit* most recent architectural decisions.

        Combines DECISIONS.md entries and memory.json recent_decisions.
        Each entry carries ``title``, ``date``, ``summary``, and ``source``.

        Parameters
        ----------
        limit : max entries to return (default 10)

        Returns
        -------
        list[dict], newest first
        """
        decisions: list[dict[str, Any]] = []

        for key, entry in self._store.items():
            if not key.startswith("decision:") and not key.startswith("mem:"):
                continue
            val = entry.get("value", {})
            if not isinstance(val, dict):
                continue
            decisions.append({
                "key": key,
                "title": val.get("title", key),
                "date": val.get("date", ""),
                "summary": val.get("summary", ""),
                "is_decision": True,
                "timestamp": entry.get("timestamp", time.time()),
            })

        decisions.sort(key=lambda d: d.get("timestamp", 0), reverse=True)
        return decisions[:limit]

    def get_project_constraints(self) -> dict[str, Any]:
        """
        Return technical constraints, dependencies, and stack information.

        Pulled from SPEC.md principles, PROGRESS.md stack overview,
        and live context_snapshot.json triad status.

        Returns
        -------
        dict with keys ``stack``, ``principles``, ``quality_target``,
        ``live_status``
        """
        # Principles from vision entry
        principles: list[str] = []
        entry = self._store.get("vision:principles", {})
        val = entry.get("value", {}) if isinstance(entry, dict) else {}
        if isinstance(val, dict):
            principles = val.get("principles", [])
        if not principles:
            principles = [p for p in _parse_spec_vision().get("principles", []) if p]

        # Stack from vision entry
        stack: list[str] = []
        sentry = self._store.get("vision:stack", {})
        sval = sentry.get("value", {}) if isinstance(sentry, dict) else {}
        if isinstance(sval, dict):
            stack = sval.get("stack", [])
        if not stack:
            stack = _parse_spec_vision().get("stack", [])

        # Quality target
        quality_target = 0.91

        # Live triad status from snapshot
        snapshot = _parse_context_snapshot()
        live_status: dict[str, Any] = {}
        if snapshot:
            triad = snapshot.get("triad", {})
            if triad:
                live_status = {
                    "typecheck_pass": triad.get("typecheck", {}).get("pass", False),
                    "tests_pass": triad.get("tests", {}).get("pass", False),
                    "tests_passed": triad.get("tests", {}).get("passed", 0),
                    "tests_failed": triad.get("tests", {}).get("failed", 0),
                    "lint_pass": triad.get("lint", {}).get("pass", False),
                    "codegraph_ok": snapshot.get("codegraph_ok", False),
                }

        return {
            "stack": stack,
            "principles": principles,
            "quality_target": quality_target,
            "live_status": live_status,
            "source": str(SPEC_FILE),
        }

    def get_context_hash(self) -> str:
        """
        Return MD5 fingerprint of the current context store.

        Any change to the store (add, prune) updates this hash.
        Use it for cache invalidation.
        """
        return self._hash

    # ── helpers ──────────────────────────────────────────────────────────────

    def _detect_area_focus(self, goal: str) -> list[str]:
        """Map a goal string to matching area keys via keyword overlap."""
        goal_lower = goal.lower()
        keywords = _area_keywords()
        matched: list[tuple[str, int]] = []
        for area, kws in keywords.items():
            score = sum(1 for kw in kws if kw.lower() in goal_lower)
            if score > 0:
                matched.append((area, score))
        matched.sort(key=lambda x: x[1], reverse=True)
        return [area for area, _ in matched[:5]]


# ── CLI ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys

    engine = ContextEngine()

    if len(sys.argv) > 1 and sys.argv[1] == "--summary":
        print(engine.get_context_summary())

    elif len(sys.argv) > 1 and sys.argv[1] == "--vision":
        import json
        print(json.dumps(engine.get_project_vision(), indent=2, ensure_ascii=False))

    elif len(sys.argv) > 1 and sys.argv[1] == "--decisions":
        import json
        print(json.dumps(engine.get_recent_decisions(), indent=2, ensure_ascii=False))

    elif len(sys.argv) > 1 and sys.argv[1] == "--constraints":
        import json
        print(json.dumps(engine.get_project_constraints(), indent=2, ensure_ascii=False))

    elif len(sys.argv) > 1 and sys.argv[1] == "--hash":
        print(engine.get_context_hash())

    elif len(sys.argv) > 1 and sys.argv[1] == "--area":
        area = sys.argv[2] if len(sys.argv) > 2 else "akasha"
        import json
        print(json.dumps(engine.build_area_context(area), indent=2, ensure_ascii=False))

    elif len(sys.argv) > 1 and sys.argv[1] == "--full":
        import json
        goal = sys.argv[2] if len(sys.argv) > 2 else None
        print(json.dumps(engine.build_full_context(goal), indent=2, ensure_ascii=False))

    else:
        print("Usage: python context_engine.py [--summary|--vision|--decisions|--constraints|--hash]")
        print("               [--area <area>]")
        print("               [--full [iteration_goal_text]]")
        sys.exit(1)
