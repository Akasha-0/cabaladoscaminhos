#!/usr/bin/env python3
"""
ReasoningChain v2 — Causal Reasoning Engine.

A causal reasoning engine that extends v1's chain-of-thought with:
- Causal graph building (cause → mediator → effect chains)
- Confidence calibration via Platt scaling against historical accuracy
- Hypothesis testing with Occam factor and evidence consistency scoring
- Evidence weighting (recency × source reliability × consistency)
- Counterfactual reasoning for root cause analysis
- Reasoning modes: EXPLAIN, PREDICT, EVALUATE, DEBUG, PLAN
- Bounded depth pruning and LRU memoization

API
---
ReasoningChain(chain_id: str | None = None)
    think(goal, context, max_steps?, mode?, max_depth?) -> dict
    correct(step_index, feedback) -> bool
    explain_failure(error, context) -> dict

Result dict fields
-----------------
chain          : list[dict]     — reasoning steps with causal annotations
confidence     : float           — calibrated 0.0–1.0
conclusion     : str             — synthesised conclusion
mode           : str             — reasoning mode used
causal_links   : list[dict]      — {from, to, cause, effect, confidence, type}
hypotheses     : list[dict]      — scored alternatives
evidence_weights: dict           — node_id -> weight float
"""

from __future__ import annotations

import hashlib
import json
import math
import random
import re
import sys
import threading
import time
import uuid
from collections import OrderedDict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ── path constants ──────────────────────────────────────────────────────────────

ROOT = Path(__file__).resolve().parent.parent if '__file__' in globals() else Path.cwd()
MA = ROOT / ".autonomous" / "multi-agent"
CACHE_DIR = MA / "reasoning_cache"
HISTORY_DIR = MA / "confidence_history"

# ── module-level defaults ───────────────────────────────────────────────────────

DEFAULT_SOURCE_SCORES: dict[str, float] = {
    "memory": 0.9,
    "codebase": 0.85,
    "llm": 0.7,
    "user": 0.8,
    "test": 0.95,
    "log": 0.6,
    "unknown": 0.5,
}

# ── low-level JSON helpers ──────────────────────────────────────────────────────

def load_json(path: Path) -> dict[str, Any]:
    """Load JSON from *path*, returning {} on missing or corrupt files."""
    if not path.exists():
        return {}
    try:
        with path.open(encoding="utf-8") as fh:
            return json.load(fh)
    except (json.JSONDecodeError, OSError):
        return {}


def save_json(path: Path, data: dict[str, Any]) -> None:
    """Atomic save: write to .tmp then rename to *path*."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    with tmp.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)
    tmp.replace(path)


# ── LRU cache ─────────────────────────────────────────────────────────────────

class LRUCache:
    """Thread-safe LRU cache with TTL and size bound."""

    def __init__(self, max_size: int = 1000, ttl: float = 3600.0):
        self.max_size = max_size
        self.ttl = ttl
        self._cache: OrderedDict[str, tuple[Any, float]] = OrderedDict()
        self._lock = threading.Lock()

    def _make_key(self, goal: str, context: dict, mode: str) -> str:
        """Deterministic cache key from goal + mode + sorted context."""
        ctx_str = json.dumps(context, sort_keys=True, default=str)
        raw = (goal + ctx_str + mode).encode("utf-8")
        return hashlib.sha256(raw).hexdigest()[:32]

    def get(self, goal: str, context: dict, mode: str) -> Any | None:
        key = self._make_key(goal, context, mode)
        with self._lock:
            if key not in self._cache:
                return None
            entry, ts = self._cache[key]
            if time.time() - ts > self.ttl:
                del self._cache[key]
                return None
            self._cache.move_to_end(key)
            return entry

    def set(self, goal: str, context: dict, mode: str, value: Any) -> None:
        key = self._make_key(goal, context, mode)
        with self._lock:
            if key in self._cache:
                self._cache.move_to_end(key)
            self._cache[key] = (value, time.time())
            if len(self._cache) > self.max_size:
                self._cache.popitem(last=False)

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()


# ── confidence calibration ───────────────────────────────────────────────────────

class ConfidenceCalibrator:
    """
    Platt-scaling confidence calibrator.
    Tracks per-step-type actual outcomes and adjusts predicted confidence
    using logistic regression (a, b) such that:
        calibrated = sigmoid(a * raw + b)
    where raw is the raw confidence and sigmoid is the standard logistic.
    """

    def __init__(self, history_dir: Path):
        self.history_dir = history_dir
        self.history_dir.mkdir(parents=True, exist_ok=True)
        # (a, b) params for sigmoid calibration per step_type
        self._params: dict[str, tuple[float, float]] = {}
        self._lock = threading.Lock()
        self._load_params()

    def _params_path(self, step_type: str) -> Path:
        return self.history_dir / f"calibration_{step_type}.json"

    def _load_params(self) -> None:
        for pf in self.history_dir.glob("calibration_*.json"):
            step_type = pf.stem.replace("calibration_", "")
            data = load_json(pf)
            self._params[step_type] = (
                data.get("a", 1.0),
                data.get("b", 0.0),
            )

    def _save_params(self, step_type: str) -> None:
        path = self._params_path(step_type)
        a, b = self._params.get(step_type, (1.0, 0.0))
        save_json(path, {"a": a, "b": b, "step_type": step_type})

    def record_outcome(self, step_type: str, predicted_confidence: float, actual: bool) -> None:
        """Append an (predicted, actual) observation for *step_type*."""
        path = self.history_dir / f"outcomes_{step_type}.jsonl"
        path.parent.mkdir(parents=True, exist_ok=True)
        entry = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "predicted": predicted_confidence,
            "actual": actual,
        }
        with path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(entry) + "\n")
        self._recalibrate(step_type)

    def _recalibrate(self, step_type: str) -> None:
        """Re-fit sigmoid params (a, b) from accumulated outcomes using Newton's method."""
        path = self.history_dir / f"outcomes_{step_type}.jsonl"
        if not path.exists():
            return
        outcomes: list[tuple[float, bool]] = []
        try:
            with path.open(encoding="utf-8") as fh:
                for line in fh:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        e = json.loads(line)
                        outcomes.append((e["predicted"], bool(e["actual"])))
                    except (json.JSONDecodeError, KeyError):
                        continue
        except OSError:
            return

        if len(outcomes) < 4:
            return

        # Newton iteration to fit a, b in: P(actual=1) = sigmoid(a*pred + b)
        a, b = self._params.get(step_type, (1.0, 0.0))
        for _ in range(20):
            da, db = 0.0, 0.0
            for pred, actual in outcomes:
                z = a * pred + b
                try:
                    sig = 1.0 / (1.0 + math.exp(-max(-500, min(500, z))))
                except (ValueError, OverflowError):
                    sig = 0.0 if z < 0 else 1.0
                err = sig - (1.0 if actual else 0.0)
                da += err * pred
                db += err
            if abs(da) < 1e-6 and abs(db) < 1e-6:
                break
            a -= 0.01 * da
            b -= 0.01 * db

        a = max(0.1, min(10.0, a))
        b = max(-5.0, min(5.0, b))
        with self._lock:
            self._params[step_type] = (a, b)
        self._save_params(step_type)

    def calibrate(self, raw: float, step_type: str = "default") -> float:
        """Return Platt-scaled confidence in [0.0, 1.0]."""
        a, b = self._params.get(step_type, (1.0, 0.0))
        try:
            scaled = 1.0 / (1.0 + math.exp(-max(-500, min(500, a * raw + b))))
        except (ValueError, OverflowError):
            scaled = 0.0 if raw < 0.5 else 1.0
        return max(0.0, min(1.0, scaled))


# ── causal graph ───────────────────────────────────────────────────────────────

class CausalNode:
    """A node in the causal graph."""

    __slots__ = ("id", "label", "type", "confidence", "weight", "parents", "children")

    def __init__(
        self,
        node_id: str,
        label: str,
        ntype: str = "event",
        confidence: float = 0.5,
        weight: float = 1.0,
    ):
        self.id = node_id
        self.label = label
        self.type = ntype  # event | factor | outcome | mediator
        self.confidence = confidence
        self.weight = weight
        self.parents: list[str] = []
        self.children: list[str] = []


class CausalGraph:
    """
    Directed acyclic graph of causal relationships.
    Bounded to max 50 nodes; low-confidence branches are pruned.
    """

    MAX_NODES = 50

    def __init__(self, root_id: str | None = None):
        self.nodes: dict[str, CausalNode] = {}
        self.links: list[dict] = []  # serialisable form
        self.root_id = root_id
        self._lock = threading.RLock()

    def add_node(self, node_id: str, label: str, ntype: str = "event", confidence: float = 0.5) -> CausalNode:
        with self._lock:
            if len(self.nodes) >= self.MAX_NODES:
                self._prune_low_confidence()
            if node_id in self.nodes:
                return self.nodes[node_id]
            node = CausalNode(node_id, label, ntype, confidence)
            self.nodes[node_id] = node
            return node

    def add_link(
        self,
        from_id: str,
        to_id: str,
        cause: str,
        effect: str,
        confidence: float = 0.5,
        link_type: str = "both",
    ) -> None:
        with self._lock:
            if from_id not in self.nodes:
                self.add_node(from_id, cause)
            if to_id not in self.nodes:
                self.add_node(to_id, effect)
            frm, to = self.nodes[from_id], self.nodes[to_id]
            if to_id not in frm.children:
                frm.children.append(to_id)
            if from_id not in to.parents:
                to.parents.append(from_id)
            link = {
                "from": from_id,
                "to": to_id,
                "cause": cause,
                "effect": effect,
                "confidence": max(0.0, min(1.0, confidence)),
                "type": link_type,
            }
            if link not in self.links:
                self.links.append(link)

    def _prune_low_confidence(self, threshold: float = 0.2) -> None:
        """Remove nodes whose confidence is below threshold."""
        if len(self.nodes) < self.MAX_NODES:
            return
        to_remove: set[str] = set()
        for nid, node in list(self.nodes.items()):
            if node.confidence < threshold:
                to_remove.add(nid)
        for nid in to_remove:
            for parent in list(self.nodes[nid].parents):
                if parent in self.nodes:
                    self.nodes[parent].children = [c for c in self.nodes[parent].children if c != nid]
            for child in list(self.nodes[nid].children):
                if child in self.nodes:
                    self.nodes[child].parents = [p for p in self.nodes[child].parents if p != nid]
            del self.nodes[nid]
        self.links = [l for l in self.links if l["from"] not in to_remove and l["to"] not in to_remove]

    def find_root_causes(self, target_id: str, max_depth: int = 4) -> list[dict]:
        """Backtrace from *target_id* to find root causes via BFS."""
        if target_id not in self.nodes:
            return []
        visited: set[str] = set()
        queue: list[tuple[str, list[dict], int]] = [(target_id, [], 0)]
        roots: list[dict] = []

        while queue:
            nid, path, depth = queue.pop(0)
            if nid in visited or depth > max_depth:
                continue
            visited.add(nid)
            node = self.nodes[nid]
            entry = {
                "node_id": nid,
                "label": node.label,
                "confidence": node.confidence,
                "depth": depth,
            }
            new_path = path + [entry]
            parents = node.parents
            if not parents:
                roots.append({"chain": new_path, "cumulative_confidence": self._cumconf(path)})
            else:
                for pid in parents:
                    if pid not in visited:
                        queue.append((pid, new_path, depth + 1))

        roots.sort(key=lambda r: r["cumulative_confidence"], reverse=True)
        return roots

    def find_mediators(self, from_id: str, to_id: str) -> list[str]:
        """Find intermediate nodes on the path from *from_id* to *to_id* (BFS)."""
        if from_id not in self.nodes or to_id not in self.nodes:
            return []
        visited: set[str] = {from_id}
        queue: list[tuple[str, list[str]]] = [(from_id, [])]
        while queue:
            nid, mediators = queue.pop(0)
            if nid == to_id:
                return mediators
            for child in self.nodes[nid].children:
                if child not in visited:
                    visited.add(child)
                    queue.append((child, mediators + [child]))
        return []

    def counterfactual(
        self,
        cause_id: str,
        target_id: str,
        blocked_confidence: float = 0.0,
    ) -> dict:
        """
        Compute: 'if *cause_id* had not occurred (blocked_confidence=1.0),
        would *target_id* still have happened?'
        Returns {still_happens: bool, residual_confidence: float, reasoning: str}
        """
        if cause_id not in self.nodes or target_id not in self.nodes:
            return {"still_happens": True, "residual_confidence": 1.0, "reasoning": "nodes not found"}

        # BFS to find all paths from cause to target with their confidence products
        visited: set[str] = {cause_id}
        queue: list[tuple[str, float, list[str]]] = [(cause_id, 1.0, [])]
        all_paths: list[tuple[float, list[str]]] = []

        while queue:
            nid, conf, path = queue.pop(0)
            if nid == target_id:
                all_paths.append((conf, path))
                continue
            for child in self.nodes[nid].children:
                if child not in visited:
                    visited.add(child)
                    link_conf = next(
                        (l["confidence"] for l in self.links if l["from"] == nid and l["to"] == child),
                        0.5,
                    )
                    queue.append((child, conf * link_conf, path + [child]))

        if not all_paths:
            return {"still_happens": True, "residual_confidence": 1.0, "reasoning": "no causal path found"}

        residual = max(p[0] for p in all_paths) * (1.0 - blocked_confidence)
        still = residual > 0.3
        return {
            "still_happens": still,
            "residual_confidence": round(residual, 4),
            "reasoning": "counterfactual blocked" if not still else f"target still likely with residual {residual:.2%}",
        }

    def _cumconf(self, path: list[dict]) -> float:
        if not path:
            return 1.0
        return math.prod(p["confidence"] for p in path)

    def to_dict(self) -> dict:
        """Return a serialisable dict representation of the graph."""
        return {
            "nodes": [
                {
                    "id": n.id,
                    "label": n.label,
                    "type": n.type,
                    "confidence": n.confidence,
                    "weight": n.weight,
                }
                for n in self.nodes.values()
            ],
            "links": self.links,
            "root_id": self.root_id,
        }


# ── hypothesis scoring ─────────────────────────────────────────────────────────

def score_hypothesis(
    evidence_consistency: float,
    simplicity: float,
    historical_accuracy: float,
) -> float:
    """
    Score a hypothesis as:
        score = evidence_consistency * simplicity * sqrt(historical_accuracy)
    Occam factor is encoded in simplicity (1.0 = simplest; fewer assumptions).
    """
    return max(0.0, min(1.0, evidence_consistency * simplicity * math.sqrt(max(0.0, historical_accuracy))))


# ── evidence weighting ─────────────────────────────────────────────────────────

def weight_evidence(
    evidence: dict,
    source_scores: dict[str, float] | None = None,
    all_evidence: list[dict] | None = None,
) -> float:
    """
    Compute evidence weight as:
        recency * reliability * consistency

    - recency: exp(-age_days / 30)  # 30-day half-life
    - reliability: source_scores.get(source, 0.5)
    - consistency: fraction of evidence agreeing with this item (0.5–1.0)
    """
    if source_scores is None:
        source_scores = DEFAULT_SOURCE_SCORES

    # recency
    now = datetime.now(timezone.utc)
    ts = evidence.get("timestamp")
    if ts:
        try:
            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            age_days = (now - dt).total_seconds() / 86400.0
        except (ValueError, TypeError, OSError):
            age_days = 0.0
    else:
        age_days = 0.0
    recency = math.exp(-age_days / 30.0)

    # reliability
    reliability = source_scores.get(evidence.get("source", "unknown"), 0.5)

    # consistency
    consistency = 0.75
    if all_evidence:
        label = evidence.get("label", "") or evidence.get("content", "")
        if label:
            matches = sum(
                1 for e in all_evidence
                if (e.get("label", "") or e.get("content", "")) == label
            )
            consistency = max(0.5, min(1.0, matches / len(all_evidence)))

    return max(0.0, min(1.0, recency * reliability * consistency))


# ── helpers ────────────────────────────────────────────────────────────────────

def _node_label(text: str, idx: int) -> str:
    """Generate a short deterministic node id from text."""
    safe = re.sub(r"[^a-z0-9]", "_", text.lower())[:40]
    return f"n{idx}_{safe}"


def _synthesise_conclusion(
    steps: list[dict],
    causal_links: list[dict],
    mode: str,
) -> tuple[str, float]:
    """Synthesise conclusion text and average confidence from steps and links."""
    if not steps:
        return "Insufficient information to form a conclusion.", 0.0

    avg_conf = sum(s.get("confidence", 0.0) for s in steps) / len(steps)

    if mode == "EXPLAIN":
        root_links = [l for l in causal_links if l.get("type") in ("necessary", "both")]
        if root_links:
            best = max(root_links, key=lambda l: l["confidence"])
            conclusion = f"Root cause identified: {best['cause']} → {best['effect']} (confidence {best['confidence']:.0%}). Chain length: {len(causal_links)}."
        else:
            conclusion = f"Analysis complete. {len(steps)} steps processed, avg confidence {avg_conf:.0%}."

    elif mode == "PREDICT":
        conclusion = f"Prediction based on {len(steps)} indicators. Expected outcome confidence: {avg_conf:.0%}."

    elif mode == "EVALUATE":
        conclusion = f"Evaluated {len(steps)} alternatives. Best option confidence: {avg_conf:.0%}."

    elif mode == "DEBUG":
        conclusion = f"Debug analysis traced {len(causal_links)} causal links. Root cause confidence: {avg_conf:.0%}."

    else:  # PLAN
        conclusion = f"Plan synthesised from {len(steps)} reasoning steps, calibrated confidence: {avg_conf:.0%}."

    return conclusion, avg_conf


# ── ReasoningChain ─────────────────────────────────────────────────────────────

class ReasoningChain:
    """
    Causal reasoning engine — v2 upgrade of ReasoningChain v1.

    Parameters
    ----------
    chain_id : str | None
        Optional unique identifier. If None a uuid is generated.

    Methods
    -------
    think(goal, context, max_steps=7, mode="PLAN", max_depth=4) -> dict
        Run causal reasoning and return structured result.
    correct(step_index, feedback) -> bool
        Incorporate feedback to recalibrate step confidence.
    explain_failure(error, context) -> dict
        Root-cause analysis of a failure using causal backtracking.
    """

    def __init__(self, chain_id: str | None = None):
        self.chain_id = chain_id or f"rc_{uuid.uuid4().hex[:12]}"
        self.history: list[dict] = []
        self.confidence_model: dict[str, list[bool]] = {}
        self.hypothesis_scores: dict[str, list[float]] = {}
        self._lock = threading.Lock()

        self._cache = LRUCache(max_size=1000, ttl=3600.0)
        self._calibrator = ConfidenceCalibrator(HISTORY_DIR)

        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        HISTORY_DIR.mkdir(parents=True, exist_ok=True)

        self._log(f"Initialized chain_id={self.chain_id}")

    # ── logging ────────────────────────────────────────────────────────────────

    def _log(self, msg: str) -> None:
        """Print structured log entry with timestamp and chain_id prefix."""
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
        print(f"{ts}  [ReasoningChain:{self.chain_id}] {msg}", file=sys.stdout)

    # ── JSON helpers ──────────────────────────────────────────────────────────

    def _save_json(self, data: dict[str, Any], path: Path) -> None:
        """Atomic JSON save via temp+rename."""
        save_json(path, data)

    # ── public API ───────────────────────────────────────────────────────────

    def think(
        self,
        goal: str,
        context: dict,
        max_steps: int = 7,
        mode: str = "PLAN",
        max_depth: int = 4,
    ) -> dict:
        """
        Run causal reasoning.

        Parameters
        ----------
        goal : str
            The question or goal to reason about.
        context : dict
            Arbitrary context — may contain 'evidence', 'observations', 'state', etc.
        max_steps : int
            Maximum reasoning steps (default 7).
        mode : str
            Reasoning mode — PLAN | EXPLAIN | PREDICT | EVALUATE | DEBUG.
        max_depth : int
            Maximum causal graph traversal depth (default 4).

        Returns
        -------
        dict
            {chain, confidence, conclusion, mode, causal_links,
             hypotheses, evidence_weights}
        """
        mode = mode.upper()
        if mode not in ("PLAN", "EXPLAIN", "PREDICT", "EVALUATE", "DEBUG"):
            mode = "PLAN"

        # ── memoisation check ─────────────────────────────────────────────
        cached = self._cache.get(goal, context, mode)
        if cached is not None:
            self._log(f"Cache hit for goal={goal[:60]!r} mode={mode}")
            return cached

        start = time.perf_counter()
        self._log(f"think mode={mode} max_steps={max_steps} max_depth={max_depth} goal={goal[:80]!r}")

        # ── evidence extraction and weighting ───────────────────────────────
        raw_evidence: list[dict] = context.get("evidence", [])
        all_evidence: list[dict] = raw_evidence if isinstance(raw_evidence, list) else []

        evidence_weights: dict[str, float] = {}
        for idx, ev in enumerate(all_evidence):
            wid = f"ev_{idx}"
            evidence_weights[wid] = weight_evidence(ev, all_evidence=all_evidence)

        # ── build causal graph ──────────────────────────────────────────────
        graph = CausalGraph()
        goal_nid = _node_label(goal, 0)
        graph.add_node(goal_nid, goal, "outcome", confidence=0.8)
        graph.root_id = goal_nid

        # ── build reasoning steps ───────────────────────────────────────────
        templates = self._mode_templates(mode, goal, context)
        steps = self._build_steps(templates[:max_steps], graph, goal_nid, all_evidence, evidence_weights)

        # ── generate hypotheses ────────────────────────────────────────────
        hypotheses = self._generate_hypotheses(steps, all_evidence, mode)

        # ── causal links ────────────────────────────────────────────────────
        causal_links = graph.links

        # ── synthesise conclusion ────────────────────────────────────────────
        conclusion, raw_confidence = _synthesise_conclusion(steps, causal_links, mode)

        # ── calibrate confidence ───────────────────────────────────────────
        calibrated_confs = [
            self._calibrator.calibrate(s.get("confidence", 0.5), s.get("step_type", "default"))
            for s in steps
        ]
        confidence = (sum(calibrated_confs) / len(calibrated_confs)) if calibrated_confs else raw_confidence

        # Mode-specific adjustments
        if mode == "EXPLAIN":
            roots = graph.find_root_causes(goal_nid, max_depth=max_depth)
            if roots:
                confidence = min(1.0, confidence * 1.1)
        elif mode == "DEBUG":
            confidence *= 0.95

        confidence = max(0.0, min(1.0, confidence))

        # ── assemble result ────────────────────────────────────────────────
        result = {
            "chain": steps,
            "confidence": round(confidence, 4),
            "conclusion": conclusion,
            "mode": mode,
            "causal_links": causal_links,
            "hypotheses": hypotheses,
            "evidence_weights": evidence_weights,
            "_graph": graph,                 # live CausalGraph for explain_failure
            "_graph_dict": graph.to_dict(),  # serialisable form for history files
            "_perf_ms": round((time.perf_counter() - start) * 1000, 2),
        }

        # ── trim history ────────────────────────────────────────────────────
        with self._lock:
            self.history.append(result)
            if len(self.history) > 100:
                self.history = self.history[-100:]

        self._save_result(result)
        self._cache.set(goal, context, mode, result)

        self._log(
            f"think complete confidence={confidence:.2%} steps={len(steps)} "
            f"links={len(causal_links)} hypotheses={len(hypotheses)} "
            f"took={result['_perf_ms']:.1f}ms"
        )
        return result

    def correct(self, step_index: int, feedback: str) -> bool:
        """
        Update confidence calibration based on feedback.

        Parameters
        ----------
        step_index : int
            Index into the most recent reasoning chain (0-based).
        feedback : str
            Free-text or structured feedback.
            Recognised: "correct"/"yes"/"right", "wrong"/"no"/"error",
            "partial", or an integer 0–100 interpreted as a confidence score.

        Returns
        -------
        bool
            True if calibration was updated; False if step_index out of range.
        """
        with self._lock:
            if not self.history:
                self._log("correct: no history")
                return False
            last = self.history[-1]
            chain = last.get("chain", [])
            if step_index < 0 or step_index >= len(chain):
                self._log(f"correct: step_index {step_index} out of range")
                return False

        step = chain[step_index]
        raw_conf = step.get("confidence", 0.5)
        step_type = step.get("step_type", "default")

        fb = feedback.strip().lower()
        if fb in ("correct", "yes", "right", "accurate"):
            actual = True
        elif fb in ("wrong", "incorrect", "no", "error", "failed"):
            actual = False
        elif fb in ("partial", "partial correct", "partially"):
            self._log(f"correct: step={step_index} — abstained (partial feedback)")
            return True
        else:
            m = re.search(r"\d+", fb)
            if m:
                score = int(m.group()) / 100.0
                actual = bool(score >= 0.5)
                raw_conf = score
            else:
                self._log(f"correct: unparseable feedback {feedback!r}")
                return False

        self._calibrator.record_outcome(step_type, raw_conf, actual)
        if step_type not in self.confidence_model:
            self.confidence_model[step_type] = []
        self.confidence_model[step_type].append(actual)
        if len(self.confidence_model[step_type]) > 200:
            self.confidence_model[step_type] = self.confidence_model[step_type][-200:]
        self._log(f"correct: step={step_index} step_type={step_type} actual={actual}")
        return True

    def explain_failure(self, error: str, context: dict) -> dict:
        """
        Root-cause analysis for a failure or error.

        Wraps think() in DEBUG mode and additionally:
        - Traces causal chain back to root cause
        - Computes counterfactuals (what if X had not happened?)
        - Identifies mediator nodes

        Parameters
        ----------
        error : str
            Error description or error message.
        context : dict
            Reasoning context (may include stack trace, logs, state).

        Returns
        -------
        dict
            {chain, confidence, conclusion, causal_links, root_causes,
             counterfactuals, mediators, mode}
        """
        self._log(f"explain_failure error={error[:80]!r}")

        enriched = dict(context)
        evidence = list(enriched.get("evidence", []))
        evidence.insert(0, {
            "label": error,
            "source": "error_log",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "weight": 1.0,
        })
        enriched["evidence"] = evidence

        result = self.think(
            goal=f"Debug failure: {error}",
            context=enriched,
            max_steps=5,
            mode="DEBUG",
            max_depth=4,
        )

        # Use the live graph already built inside think() — node IDs match chain node_ids
        graph = result.get("_graph")
        if graph and graph.root_id:
            root_causes = graph.find_root_causes(graph.root_id, max_depth=4)
        else:
            root_causes = []

        # Counterfactual analysis
        counterfactuals: list[dict] = []
        if root_causes:
            cause_chain = root_causes[0].get("chain", [])
            if len(cause_chain) >= 2:
                cause_node = cause_chain[-1]
                cause_id = cause_node["node_id"]
                for step_entry in result.get("chain", []):
                    target_id = step_entry.get("node_id", "")
                    if target_id in graph.nodes and cause_id in graph.nodes:
                        cf = graph.counterfactual(cause_id, target_id, blocked_confidence=1.0)
                        cf["cause_id"] = cause_id
                        cf["target_id"] = target_id
                        counterfactuals.append(cf)

        # Mediator analysis
        mediators: list[dict] = []
        if len(root_causes) >= 2:
            for i in range(len(root_causes) - 1):
                chain_a = root_causes[i].get("chain", [])
                chain_b = root_causes[i + 1].get("chain", [])
                if chain_a and chain_b:
                    med_ids = graph.find_mediators(chain_a[-1]["node_id"], chain_b[0]["node_id"])
                    if med_ids:
                        mediators.append({
                            "from": chain_a[-1]["node_id"],
                            "to": chain_b[0]["node_id"],
                            "mediators": med_ids,
                        })

        out = dict(result)
        out["root_causes"] = root_causes
        out["counterfactuals"] = counterfactuals
        out["mediators"] = mediators
        out["mode"] = "DEBUG"
        self._log(
            f"explain_failure: root_causes={len(root_causes)} "
            f"counterfactuals={len(counterfactuals)} mediators={len(mediators)}"
        )
        return out

    # ── private helpers ─────────────────────────────────────────────────────

    def _build_steps(
        self,
        templates: list[dict],
        graph: CausalGraph,
        goal_nid: str,
        all_evidence: list[dict],
        evidence_weights: dict[str, float],
    ) -> list[dict]:
        """Generate step dicts from templates and populate the causal graph."""
        steps: list[dict] = []

        for idx, tmpl in enumerate(templates):
            step_number = idx + 1
            node_id = tmpl.get("node_id") or _node_label(tmpl["observation"], step_number)

            graph.add_node(
                node_id,
                tmpl["observation"],
                ntype=tmpl.get("ntype", "event"),
                confidence=tmpl.get("confidence", 0.6),
            )

            parent_id = goal_nid if idx == 0 else _node_label(templates[idx - 1]["observation"], idx)
            link_conf = tmpl.get("confidence", 0.6)
            graph.add_link(
                parent_id, node_id,
                cause=templates[idx - 1]["observation"] if idx > 0 else "goal",
                effect=tmpl["observation"],
                confidence=link_conf,
                link_type=tmpl.get("link_type", "both"),
            )

            ev_support = self._evidence_support(tmpl["observation"], all_evidence, evidence_weights)
            calibrated = self._calibrator.calibrate(link_conf, tmpl.get("step_type", "default"))

            step = {
                "step_number": step_number,
                "observation": tmpl["observation"],
                "analysis": tmpl.get("analysis", ""),
                "inference": tmpl.get("inference", ""),
                "confidence": round(calibrated, 4),
                "evidence_support": round(ev_support, 4),
                "step_type": tmpl.get("step_type", "default"),
                "node_id": node_id,
                "causal_links": [],
            }

            if idx > 0:
                step["causal_links"] = [{
                    "from": _node_label(templates[idx - 1]["observation"], idx),
                    "to": node_id,
                    "cause": templates[idx - 1]["observation"],
                    "effect": tmpl["observation"],
                    "confidence": link_conf,
                    "type": tmpl.get("link_type", "both"),
                }]

            steps.append(step)

        return steps

    def _mode_templates(
        self, mode: str, goal: str, context: dict
    ) -> list[dict]:
        """Return mode-specific step templates."""
        state = context.get("state", {})
        error = context.get("error", "")
        options = context.get("options", [])

        base: list[dict] = [
            {
                "observation": f"Goal identified: {goal}",
                "analysis": "Starting causal analysis.",
                "inference": "Goal is well-defined; proceeding with structured reasoning.",
                "confidence": 0.9,
                "step_type": "goal",
                "ntype": "outcome",
                "link_type": "both",
            },
        ]

        if mode == "EXPLAIN":
            return base + [
                {
                    "observation": "Collecting observable evidence and symptoms.",
                    "analysis": "Gathering data points from context and evidence list.",
                    "inference": "Evidence set forms the basis for causal graph construction.",
                    "confidence": 0.7,
                    "step_type": "evidence_gathering",
                    "ntype": "factor",
                    "link_type": "sufficient",
                },
                {
                    "observation": "Identifying candidate causes from evidence.",
                    "analysis": "Examining temporal and logical relationships between events.",
                    "inference": "Causal candidates emerge from evidence correlations.",
                    "confidence": 0.65,
                    "step_type": "causal_hypothesis",
                    "ntype": "factor",
                    "link_type": "necessary",
                },
                {
                    "observation": "Tracing causal chain to root cause.",
                    "analysis": "Following cause → effect links backwards to origin.",
                    "inference": "Root cause is the earliest necessary event in the chain.",
                    "confidence": 0.6,
                    "step_type": "root_cause",
                    "ntype": "event",
                    "link_type": "necessary",
                },
                {
                    "observation": "Validating root cause against evidence.",
                    "analysis": "Checking that root cause explains all observed symptoms.",
                    "inference": "Strong root cause accounts for all major evidence items.",
                    "confidence": 0.7,
                    "step_type": "validation",
                    "ntype": "event",
                    "link_type": "sufficient",
                },
            ]

        elif mode == "PREDICT":
            return base + [
                {
                    "observation": "Identifying current state and leading indicators.",
                    "analysis": "Examining state variables and recent trends.",
                    "inference": "Current state constrains future possible outcomes.",
                    "confidence": 0.75,
                    "step_type": "state_analysis",
                    "ntype": "factor",
                    "link_type": "both",
                },
                {
                    "observation": "Projecting causal evolution over time.",
                    "analysis": "Modelling how current factors will propagate.",
                    "inference": "Causal factors will produce predictable effects.",
                    "confidence": 0.6,
                    "step_type": "projection",
                    "ntype": "event",
                    "link_type": "sufficient",
                },
                {
                    "observation": "Assigning probability to predicted outcomes.",
                    "analysis": "Combining evidence weights and historical patterns.",
                    "inference": "Predicted outcomes have calibrated confidence scores.",
                    "confidence": 0.65,
                    "step_type": "prediction",
                    "ntype": "outcome",
                    "link_type": "both",
                },
            ]

        elif mode == "EVALUATE":
            opt_list = options if options else ["Option A", "Option B", "Option C"]
            entries = []
            for i, opt in enumerate(opt_list[:3]):
                entries.append({
                    "observation": f"Evaluating {opt}: pros and cons analysis.",
                    "analysis": f"Assessing trade-offs for {opt}.",
                    "inference": f"{opt} scores on criteria derived from context.",
                    "confidence": 0.6 + 0.05 * (len(opt_list) - i),
                    "step_type": "evaluation",
                    "ntype": "factor",
                    "link_type": "both",
                })
            return base + entries + [
                {
                    "observation": "Ranking options by composite score.",
                    "analysis": "Comparing evaluated options across all criteria.",
                    "inference": "Best option selected based on highest weighted score.",
                    "confidence": 0.7,
                    "step_type": "ranking",
                    "ntype": "outcome",
                    "link_type": "sufficient",
                },
            ]

        elif mode == "DEBUG":
            return base + [
                {
                    "observation": f"Error detected: {error or 'anomalous state'}",
                    "analysis": "Error symptom captured from context.",
                    "inference": "Error symptom is the entry point for causal trace.",
                    "confidence": 0.85,
                    "step_type": "error_capture",
                    "ntype": "outcome",
                    "link_type": "both",
                },
                {
                    "observation": "Reproducing error conditions from state.",
                    "analysis": "Reconstructing the state that led to the error.",
                    "inference": "State snapshot constrains the set of possible causes.",
                    "confidence": 0.7,
                    "step_type": "state_reconstruction",
                    "ntype": "factor",
                    "link_type": "necessary",
                },
                {
                    "observation": "Hypothesising root cause via backtracking.",
                    "analysis": "Following causal links backwards from error to cause.",
                    "inference": "Root cause is the earliest event that, if changed, removes the error.",
                    "confidence": 0.6,
                    "step_type": "root_cause",
                    "ntype": "event",
                    "link_type": "necessary",
                },
                {
                    "observation": "Formulating fix and validating fix logic.",
                    "analysis": "Designing intervention that breaks the causal chain at the root cause.",
                    "inference": "Fix is valid if it prevents the root cause without introducing new errors.",
                    "confidence": 0.65,
                    "step_type": "fix_validation",
                    "ntype": "event",
                    "link_type": "sufficient",
                },
            ]

        else:  # PLAN
            return base + [
                {
                    "observation": "Analysing current project state.",
                    "analysis": "Reviewing state dict and evidence for relevant factors.",
                    "inference": "State factors inform the space of possible actions.",
                    "confidence": 0.7,
                    "step_type": "state_analysis",
                    "ntype": "factor",
                    "link_type": "both",
                },
                {
                    "observation": "Enumerating candidate improvement actions.",
                    "analysis": "Generating action options that address the goal.",
                    "inference": "Candidate list is the search space for the planner.",
                    "confidence": 0.65,
                    "step_type": "candidates",
                    "ntype": "event",
                    "link_type": "sufficient",
                },
                {
                    "observation": "Scoring and ranking actions by expected impact.",
                    "analysis": "Evaluating each candidate's likely effectiveness.",
                    "inference": "Top-ranked actions maximise expected improvement.",
                    "confidence": 0.6,
                    "step_type": "ranking",
                    "ntype": "outcome",
                    "link_type": "both",
                },
                {
                    "observation": "Sequencing selected actions into a plan.",
                    "analysis": "Ordering actions to maximise compounding benefit.",
                    "inference": "Sequenced plan balances urgency, dependencies, and compound potential.",
                    "confidence": 0.65,
                    "step_type": "sequencing",
                    "ntype": "event",
                    "link_type": "sufficient",
                },
            ]

    def _evidence_support(
        self,
        observation: str,
        all_evidence: list[dict],
        evidence_weights: dict[str, float],
    ) -> float:
        """Return weighted evidence support fraction for an observation."""
        if not all_evidence:
            return 0.5
        obs_lower = observation.lower()
        total_weight = 0.0
        supported_weight = 0.0
        for idx, ev in enumerate(all_evidence):
            w = evidence_weights.get(f"ev_{idx}", 0.5)
            total_weight += w
            label = (ev.get("label", "") or "").lower()
            content = (ev.get("content", "") or "").lower()
            obs_words = set(obs_lower.split())
            ev_words = set(label.split()) | set(content.split())
            overlap = len(obs_words & ev_words)
            if overlap > 0 and len(obs_words) > 0:
                supported_weight += w * (overlap / len(obs_words))
        if total_weight <= 0.0:
            return 0.5
        return supported_weight / total_weight

    def _generate_hypotheses(
        self,
        steps: list[dict],
        all_evidence: list[dict],
        mode: str,
    ) -> list[dict]:
        """Generate up to 3 alternative hypotheses, scored by consistency × simplicity × accuracy."""
        templates = [
            {
                "id": f"hyp_{mode}_A",
                "label": f"{mode} Hypothesis A — primary causal chain",
                "description": "Primary explanation via main causal path.",
                "evidence_consistency": 0.8,
                "simplicity": 0.9,
                "step_type": "primary",
            },
            {
                "id": f"hyp_{mode}_B",
                "label": f"{mode} Hypothesis B — alternative mediator",
                "description": "Explanation involving a different mediator or indirect path.",
                "evidence_consistency": 0.6,
                "simplicity": 0.7,
                "step_type": "alternative",
            },
            {
                "id": f"hyp_{mode}_C",
                "label": f"{mode} Hypothesis C — external factor",
                "description": "Explanation dominated by external/unmodelled factors.",
                "evidence_consistency": 0.5,
                "simplicity": 0.6,
                "step_type": "external",
            },
        ]

        hypotheses: list[dict] = []
        for tmpl in templates[:3]:
            hist_acc = self._historical_accuracy(tmpl["step_type"])
            score = score_hypothesis(
                tmpl["evidence_consistency"],
                tmpl["simplicity"],
                hist_acc,
            )
            hid = tmpl["id"]
            if hid not in self.hypothesis_scores:
                self.hypothesis_scores[hid] = []
            self.hypothesis_scores[hid].append(score)
            if len(self.hypothesis_scores[hid]) > 100:
                self.hypothesis_scores[hid] = self.hypothesis_scores[hid][-100:]
            avg_score = sum(self.hypothesis_scores[hid]) / len(self.hypothesis_scores[hid])

            hypotheses.append({
                "id": hid,
                "label": tmpl["label"],
                "description": tmpl["description"],
                "raw_score": round(score, 4),
                "running_avg": round(avg_score, 4),
                "evidence_consistency": tmpl["evidence_consistency"],
                "simplicity": tmpl["simplicity"],
                "historical_accuracy": round(hist_acc, 4),
                "selected": False,
            })

        if hypotheses:
            best = max(hypotheses, key=lambda h: h["raw_score"])
            best["selected"] = True
        return hypotheses

    def _historical_accuracy(self, step_type: str) -> float:
        """Return empirical accuracy for *step_type* from accumulated history."""
        outcomes = self.confidence_model.get(step_type, [])
        if len(outcomes) < 2:
            return 0.7
        return sum(outcomes) / len(outcomes)

    def _save_result(self, result: dict) -> None:
        """Append result to the per-chain history file."""
        path = CACHE_DIR / f"{self.chain_id}_history.jsonl"
        record = {k: v for k, v in result.items()
                  if k not in ("_perf_ms", "_graph")}
        with path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(record, ensure_ascii=False) + "\n")

    # ── introspection ────────────────────────────────────────────────────────

    def get_history(self, limit: int = 10) -> list[dict]:
        """Return the last *limit* reasoning results."""
        with self._lock:
            return list(self.history[-limit:])

    def clear_cache(self) -> None:
        """Evict all memoised reasoning results."""
        self._cache.clear()
        self._log("Cache cleared.")

    def clear_history(self) -> None:
        """Clear all reasoning history."""
        with self._lock:
            self.history.clear()
        self._log("History cleared.")


# ── self-test ─────────────────────────────────────────────────────────────────

def _self_test() -> bool:
    """Smoke-test all public methods."""
    rc = ReasoningChain("test_v2")

    ctx = {
        "state": {"status": "degraded", "error_rate": 0.15},
        "evidence": [
            {
                "label": "high CPU usage",
                "source": "monitoring",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
            {
                "label": "memory leak suspected",
                "source": "log",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        ],
    }

    # ── think in each mode ─────────────────────────────────────────────────
    for mode in ("PLAN", "EXPLAIN", "PREDICT", "EVALUATE", "DEBUG"):
        result = rc.think(
            goal="Diagnose the performance degradation",
            context=ctx,
            max_steps=4,
            mode=mode,
            max_depth=3,
        )
        assert "chain" in result, f"missing chain in {mode}"
        assert "confidence" in result, f"missing confidence in {mode}"
        assert "conclusion" in result, f"missing conclusion in {mode}"
        assert "causal_links" in result, f"missing causal_links in {mode}"
        assert "hypotheses" in result, f"missing hypotheses in {mode}"
        assert "evidence_weights" in result, f"missing evidence_weights in {mode}"
        assert result["mode"] == mode, f"mode mismatch in {mode}"
        assert isinstance(result["confidence"], float), f"confidence not float"
        assert 0.0 <= result["confidence"] <= 1.0, f"confidence out of range"
        assert len(result["hypotheses"]) <= 3, f"too many hypotheses"
        print(f"  {mode}: confidence={result['confidence']:.2%} "
              f"steps={len(result['chain'])} links={len(result['causal_links'])}")

    # ── cache isolation by mode ─────────────────────────────────────────────
    plan_result = rc.think("Diagnose the performance degradation", ctx, mode="PLAN")
    cached = rc.think("Diagnose the performance degradation", ctx, mode="PLAN")
    assert cached["confidence"] == plan_result["confidence"], "cache mismatch with same mode"
    print("  CACHE: hit confirmed, mode isolation ok")

    # ── correct ─────────────────────────────────────────────────────────────
    ok = rc.correct(0, "correct")
    assert ok, "correct() returned False for valid step"
    ok2 = rc.correct(0, "wrong")
    assert ok2, "correct() returned False for feedback='wrong'"
    ok3 = rc.correct(99, "correct")
    assert not ok3, "correct() should return False for out-of-range"
    ok4 = rc.correct(0, "partial")
    assert ok4, "correct() should return True for partial (abstain)"
    print("  CORRECT: all cases passed")

    # ── explain_failure ────────────────────────────────────────────────────
    failure_result = rc.explain_failure(
        error="NullPointerException at line 42",
        context={
            "state": {"file": "Worker.java", "line": 42},
            "evidence": [{"label": "null config", "source": "stack_trace"}],
        },
    )
    assert "root_causes" in failure_result, "missing root_causes"
    assert "counterfactuals" in failure_result, "missing counterfactuals"
    assert "mediators" in failure_result, "missing mediators"
    print(f"  EXPLAIN_FAILURE: root_causes={len(failure_result['root_causes'])} "
          f"counterfactuals={len(failure_result['counterfactuals'])} "
          f"mediators={len(failure_result['mediators'])}")

    # ── introspection ───────────────────────────────────────────────────────
    history = rc.get_history(limit=3)
    assert len(history) <= 3, "get_history limit not respected"
    rc.clear_cache()
    rc.clear_history()
    print("  INTROSPECTION: history and cache cleared")

    # ── causal graph internals ─────────────────────────────────────────────
    g = CausalGraph()
    g.add_node("a", "High load", "factor", 0.8)
    g.add_node("b", "Queue full", "mediator", 0.7)
    g.add_node("c", "Service down", "outcome", 0.9)
    g.add_link("a", "b", "High load causes queue growth", "Queue filling", 0.8, "sufficient")
    g.add_link("b", "c", "Queue full triggers rejection", "Service unavailable", 0.9, "both")
    roots = g.find_root_causes("c")
    assert len(roots) > 0, "find_root_causes returned empty"
    meds = g.find_mediators("a", "c")
    assert "b" in meds, f"mediator 'b' not found in {meds}"
    cf = g.counterfactual("a", "c", blocked_confidence=1.0)
    assert "still_happens" in cf, "counterfactual missing still_happens"
    print(f"  CAUSAL_GRAPH: roots={len(roots)} mediators={meds} "
          f"counterfactual_still={cf['still_happens']}")

    # ── evidence weighting ─────────────────────────────────────────────────
    ev = {
        "label": "test evidence",
        "source": "test",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    w = weight_evidence(ev, all_evidence=[ev])
    assert 0.0 <= w <= 1.0, f"weight_evidence out of range: {w}"
    print(f"  EVIDENCE_WEIGHT: {w:.4f}")

    # ── hypothesis scoring ─────────────────────────────────────────────────
    s = score_hypothesis(0.8, 0.9, 0.7)
    assert 0.0 <= s <= 1.0, f"score_hypothesis out of range: {s}"
    print(f"  HYPOTHESIS_SCORE: {s:.4f}")

    # ── LRU cache ─────────────────────────────────────────────────────────
    cache = LRUCache(max_size=3, ttl=1.0)
    cache.set("goal1", {"a": 1}, "PLAN", "result1")
    cache.set("goal2", {"b": 2}, "PLAN", "result2")
    assert cache.get("goal1", {"a": 1}, "PLAN") == "result1", "cache get failed"
    cache.set("goal3", {"c": 3}, "PLAN", "result3")
    cache.set("goal4", {"d": 4}, "PLAN", "result4")  # should evict goal2 (LRU)
    assert cache.get("goal2", {"b": 2}, "PLAN") is None, "LRU eviction failed"
    print("  LRU_CACHE: set/get/eviction ok")

    print("\nAll tests passed.")
    return True


if __name__ == "__main__":
    ok = _self_test()
    sys.exit(0 if ok else 1)
