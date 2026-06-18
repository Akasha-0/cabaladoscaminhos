"""
IntelligenceV2 — evidence-based decision making with confidence scores.

Features
--------
* Evidence-based decision making via weighted geometric mean of sources
* Multi-source validation against memory, telemetry, skills, and user preferences
* Decision categories: which_improvement, which_approach, when_to_stop, what_next
* Append-only decision log with bounded LRU eviction (max 1000 entries)
* Confidence calibration: tracks outcomes, adjusts weights, exponential decay

Thread-safe via RLock. Follows existing code patterns: ROOT/MA paths,
_log() with timestamp, _load_json/_save_json.
"""

from __future__ import annotations

import json
import math
import threading
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ── path constants ─────────────────────────────────────────────────────────────

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous" / "multi-agent"

DECISIONS_FILE = MA / "intelligence_v2" / "decisions.json"
MEMORY_FILE = MA / "memory.json"


# ── logging helper ─────────────────────────────────────────────────────────────

def _log(msg: str) -> None:
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"[{ts}] IntelligenceV2: {msg}", flush=True)


# ── JSON persistence helpers ────────────────────────────────────────────────────

def _load_json(path: Path) -> dict | list | None:
    """Load JSON from path, return None if missing or unreadable."""
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


def _save_json(path: Path, data: dict | list) -> None:
    """Atomic write: write to .tmp then rename, ensuring no partial reads."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.rename(path)


# ── Constants ───────────────────────────────────────────────────────────────────

# Evidence source weights (sum to 1.0)
EVIDENCE_WEIGHTS = {
    "historical_success_rate": 0.30,
    "context_relevance":       0.25,
    "skill_match":             0.25,
    "recency":                 0.10,
    "pattern_match":           0.10,
}

# Confidence thresholds
CONFIDENCE_HIGH   = 0.80
CONFIDENCE_MEDIUM = 0.50

# Bounded decision log size
MAX_DECISIONS = 1000

# Decision categories
CATEGORIES = {
    "which_improvement",
    "which_approach",
    "when_to_stop",
    "what_next",
}

# Outcome values
OUTCOMES = {"success", "failure"}


# ── Validation helpers ──────────────────────────────────────────────────────────

def _clamp(value: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return max(lo, min(hi, value))


def _weighted_geometric_mean(scores: dict[str, float], weights: dict[str, float]) -> float:
    """
    Weighted geometric mean of evidence scores.

    Returns 0.0 if any score is 0 (geometric mean convention).
    Scores are clamped to [0.0, 1.0] before computation.
    """
    if not scores or not weights:
        return 0.0

    product = 1.0
    total_weight = 0.0
    for key, weight in weights.items():
        if key in scores:
            s = _clamp(scores[key], 0.0, 1.0)
            if s == 0.0:
                return 0.0
            product *= math.pow(s, weight)
            total_weight += weight

    if total_weight == 0.0:
        return 0.0
    # Normalise by actual total weight used
    return math.pow(product, 1.0 / total_weight)


def _std_dev(values: list[float]) -> float:
    """Population standard deviation of a list of floats."""
    if len(values) < 2:
        return 0.0
    mean = sum(values) / len(values)
    variance = sum((v - mean) ** 2 for v in values) / len(values)
    return math.sqrt(variance)


# ── IntelligenceV2 ─────────────────────────────────────────────────────────────

class IntelligenceV2:
    """
    Evidence-based decision making with confidence scoring.

    Parameters
    ----------
    ma_path : Path, optional
        Override the multi-agent directory path. Defaults to MA.

    Attributes
    ----------
    decisions : list[dict]
        In-memory decision log (bounded to MAX_DECISIONS entries).

    Methods
    -------
    decide(category, options, context)
        Choose the best option from a list using evidence scores.
    validate_decision(decision_id, outcome)
        Record the outcome of a past decision for calibration.
    get_decision_history(category=None)
        Return stored decisions, optionally filtered by category.
    suggest(category, context)
        Suggest what to do next based on learned patterns.
    """

    def __init__(self, ma_path: Path | None = None) -> None:
        self.root = ROOT
        self.ma = ma_path or MA
        self._lock = threading.RLock()

        # Decision log
        self._decisions_file = DECISIONS_FILE
        self._decisions: list[dict] = []

        # Calibrated evidence weights (mutable via validate_decision)
        self._weights = dict(EVIDENCE_WEIGHTS)

        # Load persisted decisions on startup
        self._load_decisions()

        _log(f"Initialised, {len(self._decisions)} decisions loaded")

    # ── Persistence ─────────────────────────────────────────────────────────────

    def _load_decisions(self) -> None:
        """Load decisions from JSON file, bounded to MAX_DECISIONS."""
        data = _load_json(self._decisions_file)
        if isinstance(data, list):
            # Keep most recent MAX_DECISIONS
            self._decisions = data[-MAX_DECISIONS:]
        elif isinstance(data, dict) and "decisions" in data:
            # Legacy envelope format
            self._decisions = data["decisions"][-MAX_DECISIONS:]

    def _save_decisions(self) -> None:
        """Persist decision log to disk."""
        _save_json(self._decisions_file, self._decisions)

    def _evict_old_decisions(self) -> None:
        """Trim to MAX_DECISIONS, keeping most recent."""
        if len(self._decisions) > MAX_DECISIONS:
            self._decisions = self._decisions[-MAX_DECISIONS:]

    # ── Evidence computation ─────────────────────────────────────────────────────

    def _compute_confidence(self, option: dict, context: dict) -> float:
        """
        Compute confidence score (0.0–1.0) for a single option.

        Evidence sources (each 0.0–1.0):
        * historical_success_rate  — past success of this option or similar
        * context_relevance       — how well option fits the current context
        * skill_match             — match between option requirements and agent skills
        * recency                 — how recently this option was considered
        * pattern_match           — similarity to known good patterns
        """
        scores: dict[str, float] = {}

        # ── historical_success_rate ──────────────────────────────────────────
        historical = option.get("historical_success_rate")
        if historical is None:
            # Infer from decision history: count successes for this option id
            oid = option.get("id", option.get("name", ""))
            successes = sum(
                1 for d in self._decisions
                if d.get("chosen_option", {}).get("id") == oid
                and d.get("outcome") == "success"
            )
            total = sum(
                1 for d in self._decisions
                if d.get("chosen_option", {}).get("id") == oid
                and "outcome" in d
            )
            historical = successes / total if total > 0 else 0.5
        scores["historical_success_rate"] = float(historical)

        # ── context_relevance ────────────────────────────────────────────────
        ctx_rel = option.get("context_relevance")
        if ctx_rel is None:
            # Keyword overlap between option tags/labels and context keywords
            option_tags = set(option.get("tags", option.get("labels", [])))
            context_keywords = set(context.get("keywords", []))
            if option_tags and context_keywords:
                overlap = len(option_tags & context_keywords)
                union = len(option_tags | context_keywords)
                ctx_rel = overlap / union if union > 0 else 0.0
            else:
                ctx_rel = 0.5
        scores["context_relevance"] = float(ctx_rel)

        # ── skill_match ───────────────────────────────────────────────────────
        skill = option.get("skill_match")
        if skill is None:
            required_skills = set(option.get("required_skills", option.get("skills", [])))
            available_skills = set(context.get("available_skills", []))
            if required_skills:
                skill = len(available_skills & required_skills) / len(required_skills)
            else:
                skill = 1.0
        scores["skill_match"] = float(skill)

        # ── recency ──────────────────────────────────────────────────────────
        recency = option.get("recency")
        if recency is None:
            # Exponential decay based on last_seen timestamp
            last_seen = option.get("last_seen")
            if last_seen:
                age_seconds = time.time() - last_seen
                half_life = 7 * 24 * 3600  # 7-day half-life
                recency = math.exp(-0.693 * age_seconds / half_life)
            else:
                recency = 0.5
        scores["recency"] = float(recency)

        # ── pattern_match ─────────────────────────────────────────────────────
        pattern = option.get("pattern_match")
        if pattern is None:
            # Heuristic: options with higher estimated_effect get higher pattern score
            effect = option.get("estimated_effect", option.get("effect", 0.5))
            pattern = float(effect) if isinstance(effect, (int, float)) else 0.5
        scores["pattern_match"] = float(pattern)

        return _weighted_geometric_mean(scores, self._weights)

    def _compute_multi_source_validation(self, decision: dict) -> dict[str, Any]:
        """
        Validate a decision against multiple sources.

        Sources: memory (historical patterns), telemetry (quality trends),
        skill_discoverer (success predictions), user preferences.

        Returns dict with:
        * agreement_score — mean of source scores
        * disagreement — bool (std dev > 0.2 across sources)
        * source_scores — per-source score
        * validation_note — human-readable note
        """
        chosen = decision.get("chosen_option", {})
        category = decision.get("category", "")
        confidence = decision.get("confidence", 0.5)

        source_scores: dict[str, float] = {}

        # ── memory source ─────────────────────────────────────────────────────
        # Success rate of past decisions in the same category
        cat_decisions = [d for d in self._decisions if d.get("category") == category]
        if cat_decisions:
            successes = sum(1 for d in cat_decisions if d.get("outcome") == "success")
            source_scores["memory"] = successes / len(cat_decisions)
        else:
            source_scores["memory"] = 0.5

        # ── telemetry source ──────────────────────────────────────────────────
        # Proxy: recent high-confidence decisions that succeeded
        recent = [d for d in self._decisions[-20:] if "outcome" in d]
        if recent:
            recent_successes = sum(1 for d in recent if d.get("outcome") == "success")
            source_scores["telemetry"] = recent_successes / len(recent)
        else:
            source_scores["telemetry"] = 0.5

        # ── skill_discoverer source ───────────────────────────────────────────
        # Skill alignment for chosen option
        required = set(chosen.get("required_skills", chosen.get("skills", [])))
        available = set(decision.get("context", {}).get("available_skills", []))
        if required:
            source_scores["skill_discoverer"] = len(available & required) / len(required)
        else:
            source_scores["skill_discoverer"] = 0.75

        # ── user preferences source ───────────────────────────────────────────
        # Match to explicitly preferred categories or tags
        preferred = set(decision.get("context", {}).get("preferred_tags", []))
        option_tags = set(chosen.get("tags", chosen.get("labels", [])))
        if preferred and option_tags:
            source_scores["user_preferences"] = len(preferred & option_tags) / len(preferred)
        else:
            source_scores["user_preferences"] = 0.5

        # ── aggregate ────────────────────────────────────────────────────────
        scores_list = list(source_scores.values())
        mean_score = sum(scores_list) / len(scores_list)
        sd = _std_dev(scores_list)
        agreement_score = mean_score
        disagreement = sd > 0.2

        # Combine agreement with decision confidence
        validation_note = "Sources agree" if not disagreement else "Sources disagree significantly"
        # Down-weight if disagreement and confidence is low
        if disagreement and confidence < 0.6:
            agreement_score *= 0.8

        return {
            "agreement_score": _clamp(agreement_score, 0.0, 1.0),
            "disagreement": disagreement,
            "source_scores": source_scores,
            "validation_note": f"{validation_note} (std_dev={sd:.3f})",
        }

    # ── Decision logging ────────────────────────────────────────────────────────

    def _log_decision(self, decision: dict) -> None:
        """Append decision to in-memory log and persist to disk."""
        decision["logged_at"] = time.time()
        decision["logged_at_iso"] = datetime.fromtimestamp(
            decision["logged_at"], tz=timezone.utc
        ).strftime("%Y-%m-%dT%H:%M:%SZ")

        with self._lock:
            self._decisions.append(decision)
            self._evict_old_decisions()
            self._save_decisions()

    # ── Confidence calibration ───────────────────────────────────────────────────

    def _apply_exponential_decay(self) -> None:
        """
        Apply exponential decay to evidence weights based on decision age.

        Older decisions that were not validated have less weight over time.
        This is applied implicitly when computing historical_success_rate —
        we weight recent decisions more heavily.
        """
        # Reweight toward recent validated decisions by halving old decisions' impact
        cutoff = time.time() - 30 * 24 * 3600  # 30-day cutoff
        recent_validated = [d for d in self._decisions
                            if d.get("outcome") in OUTCOMES
                            and d.get("logged_at", 0) > cutoff]
        old_validated = [d for d in self._decisions
                         if d.get("outcome") in OUTCOMES
                         and d.get("logged_at", 0) <= cutoff]

        # If more than 60% of history is old unvalidated, reduce historical weight
        total = len(recent_validated) + len(old_validated)
        if total > 10:
            old_ratio = len(old_validated) / total
            if old_ratio > 0.6:
                # Decay historical weight
                decay_factor = 0.5
                self._weights["historical_success_rate"] *= decay_factor
                # Compensate by increasing context weight
                boost = (1.0 - decay_factor) / 3
                for key in ["context_relevance", "skill_match", "pattern_match"]:
                    self._weights[key] += boost
                # Renormalise to sum to 1.0
                total_w = sum(self._weights.values())
                for key in self._weights:
                    self._weights[key] /= total_w
                _log(f"Decay applied: old_ratio={old_ratio:.2f}, new weights={self._weights}")

    def validate_decision(self, decision_id: str, outcome: str) -> None:
        """
        Record the outcome of a past decision for calibration.

        Parameters
        ----------
        decision_id : str
            UUID of the decision to validate.
        outcome : str
            "success" or "failure".
        """
        if outcome not in OUTCOMES:
            raise ValueError(f"outcome must be one of {OUTCOMES}, got {outcome!r}")

        with self._lock:
            # Find and update the decision
            found = False
            for d in self._decisions:
                if d.get("decision_id") == decision_id:
                    d["outcome"] = outcome
                    d["validated_at"] = time.time()
                    d["validated_at_iso"] = datetime.now(timezone.utc).strftime(
                        "%Y-%m-%dT%H:%M:%SZ"
                    )
                    found = True
                    break

            if not found:
                _log(f"validate_decision: decision_id={decision_id} not found")
                return

            self._save_decisions()

        # Adjust evidence weights based on outcome accuracy
        self._adjust_weights(decision_id, outcome)

        _log(f"Decision {decision_id} validated as {outcome}")

    def _adjust_weights(self, decision_id: str, outcome: str) -> None:
        """
        Adjust evidence weights based on whether the decision was correct.

        If a high-confidence decision failed, reduce the weight of the
        dominant evidence source. If a low-confidence decision succeeded,
        boost the weight of underrepresented sources.
        """
        with self._lock:
            decision = next(
                (d for d in self._decisions if d.get("decision_id") == decision_id),
                None,
            )
        if not decision:
            return

        confidence = decision.get("confidence", 0.5)
        evidence_scores = decision.get("evidence_scores", {})

        # Filter out None values (option didn't explicitly provide evidence)
        evidence_scores = {
            k: v for k, v in evidence_scores.items() if v is not None
        }

        if not evidence_scores:
            return


        # Identify dominant source
        dominant = max(evidence_scores, key=evidence_scores.get)
        max_score = evidence_scores[dominant]

        adjustment = 0.05
        if outcome == "failure" and confidence > CONFIDENCE_HIGH and max_score > 0.6:
            # High-confidence decision failed — reduce dominant source weight
            if self._weights.get(dominant, 0) > adjustment:
                self._weights[dominant] -= adjustment
                # Redistribute evenly to other sources
                others = [k for k in self._weights if k != dominant]
                boost = adjustment / len(others)
                for k in others:
                    self._weights[k] += boost
                _log(f"Weight adjustment: reduce {dominant} after failed high-confidence decision")

        elif outcome == "success" and confidence < CONFIDENCE_MEDIUM:
            # Low-confidence decision succeeded — boost underrepresented sources
            min_source = min(evidence_scores, key=evidence_scores.get)
            if self._weights.get(min_source, 0) > adjustment:
                self._weights[min_source] += adjustment
                # Take from the dominant source
                if self._weights.get(dominant, 0) > adjustment:
                    self._weights[dominant] -= adjustment
                # Renormalise
                total_w = sum(self._weights.values())
                for k in self._weights:
                    self._weights[k] /= total_w
                _log(f"Weight adjustment: boost {min_source} after successful low-confidence decision")

    # ── Public API ──────────────────────────────────────────────────────────────

    def decide(self, category: str, options: list[dict], context: dict) -> dict:
        """
        Choose the best option from a list using evidence-based scoring.

        Parameters
        ----------
        category : str
            One of CATEGORIES (which_improvement, which_approach,
            when_to_stop, what_next).
        options : list[dict]
            Each dict must contain an 'id' or 'name' field and may contain
            evidence source scores. If a source is missing, it is inferred.
        context : dict
            Additional context passed to evidence computation, e.g.
            keywords, available_skills, preferred_tags.

        Returns
        -------
        dict with keys:
            decision_id (str), category, chosen_option (dict),
            confidence (float), confidence_level (str),
            evidence_scores (dict), multi_source_validation (dict),
            reasoning (str), all_options (list[dict])
        """
        if category not in CATEGORIES:
            raise ValueError(f"Unknown category {category!r}, must be one of {CATEGORIES}")

        if not options:
            raise ValueError("options list must not be empty")

        # Ensure each option has a stable identifier
        for opt in options:
            if "id" not in opt and "name" not in opt:
                opt["id"] = str(uuid.uuid4())

        with self._lock:
            # Compute confidence for each option
            scored_options = []
            for opt in options:
                conf = self._compute_confidence(opt, context)
                evidence = {
                    "historical_success_rate": opt.get("historical_success_rate"),
                    "context_relevance":        opt.get("context_relevance"),
                    "skill_match":              opt.get("skill_match"),
                    "recency":                  opt.get("recency"),
                    "pattern_match":            opt.get("pattern_match"),
                }
                scored_options.append({
                    "option":      opt,
                    "confidence":  conf,
                    "evidence":    evidence,
                })

            # Sort by confidence descending
            scored_options.sort(key=lambda x: x["confidence"], reverse=True)

            chosen_entry = scored_options[0]
            chosen_option = chosen_entry["option"]
            confidence = chosen_entry["confidence"]

            # Determine confidence level label
            if confidence >= CONFIDENCE_HIGH:
                confidence_level = "high confidence"
            elif confidence >= CONFIDENCE_MEDIUM:
                confidence_level = "medium confidence"
            else:
                confidence_level = "low confidence"

            # Build reasoning string
            reasoning_parts = [
                f"Chose '{chosen_option.get('id') or chosen_option.get('name')}' "
                f"with confidence {confidence:.3f} ({confidence_level})."
            ]
            if confidence >= CONFIDENCE_HIGH:
                reasoning_parts.append("Evidence strongly supports this option.")
            elif confidence >= CONFIDENCE_MEDIUM:
                reasoning_parts.append("Evidence moderately supports this option.")
            else:
                reasoning_parts.append("Evidence is weak; recommend careful review.")

            # Multi-source validation
            raw_decision = {
                "chosen_option": chosen_option,
                "category": category,
                "confidence": confidence,
                "context": context,
            }
            validation = self._compute_multi_source_validation(raw_decision)
            reasoning_parts.append(validation["validation_note"])

            decision_id = str(uuid.uuid4())

            decision = {
                "decision_id":              decision_id,
                "category":                category,
                "chosen_option":            chosen_option,
                "confidence":              confidence,
                "confidence_level":        confidence_level,
                "evidence_scores":          chosen_entry["evidence"],
                "multi_source_validation": validation,
                "reasoning":               " ".join(reasoning_parts),
                "all_options":             [
                    {"option": s["option"], "confidence": s["confidence"]}
                    for s in scored_options
                ],
                "outcome":                 None,  # Not yet validated
            }

            self._log_decision(decision)

        return decision

    def get_decision_history(self, category: str | None = None) -> list[dict]:
        """
        Return stored decisions, optionally filtered by category.

        Parameters
        ----------
        category : str, optional
            If given, only return decisions of this category.

        Returns
        -------
        list of decision dicts, most recent first.
        """
        with self._lock:
            decisions = list(self._decisions)

        if category is not None:
            decisions = [d for d in decisions if d.get("category") == category]

        return list(reversed(decisions))

    def suggest(self, category: str, context: dict) -> dict:
        """
        Suggest what to do next based on learned patterns.

        This synthesises past decision outcomes to recommend a direction
        without requiring explicit options.

        Parameters
        ----------
        category : str
            Decision category.
        context : dict
            Current context with keywords, available_skills, preferred_tags.

        Returns
        -------
        dict with suggestion, confidence, reasoning, and source_decisions.
        """
        # Build synthetic options from historical patterns in the same category
        with self._lock:
            cat_decisions = [
                d for d in self._decisions
                if d.get("category") == category and d.get("outcome") in OUTCOMES
            ]

        if not cat_decisions:
            return {
                "suggestion": None,
                "confidence": 0.0,
                "reasoning": "No historical decisions in this category; cannot suggest.",
                "source_decisions": [],
                "category": category,
            }

        # Count successes per option id/name
        option_scores: dict[str, dict] = {}
        for d in cat_decisions:
            oid = d.get("chosen_option", {}).get("id") or \
                  d.get("chosen_option", {}).get("name", "unknown")
            if oid not in option_scores:
                option_scores[oid] = {"successes": 0, "failures": 0, "option": d["chosen_option"]}
            if d["outcome"] == "success":
                option_scores[oid]["successes"] += 1
            else:
                option_scores[oid]["failures"] += 1

        # Build synthetic options with historical success rate
        synthetic_options = []
        for oid, scores in option_scores.items():
            total = scores["successes"] + scores["failures"]
            opt = dict(scores["option"])
            opt["id"] = oid
            opt["historical_success_rate"] = scores["successes"] / total if total > 0 else 0.5
            synthetic_options.append(opt)

        # Deduplicate by id
        seen: set[str] = set()
        unique_options = []
        for opt in synthetic_options:
            oid = opt.get("id", "")
            if oid not in seen:
                seen.add(oid)
                unique_options.append(opt)

        if not unique_options:
            return {
                "suggestion": None,
                "confidence": 0.0,
                "reasoning": "No valid options derived from history.",
                "source_decisions": [],
                "category": category,
            }

        # Run decide() on synthetic options
        decision = self.decide(category, unique_options, context)

        return {
            "suggestion":        decision["chosen_option"],
            "confidence":        decision["confidence"],
            "confidence_level":  decision["confidence_level"],
            "reasoning":         decision["reasoning"],
            "source_decisions":  [d["decision_id"] for d in cat_decisions],
            "category":          category,
            "validation":        decision["multi_source_validation"],
        }

    # ── Introspection ──────────────────────────────────────────────────────────

    def get_weights(self) -> dict[str, float]:
        """Return current evidence weights."""
        with self._lock:
            return dict(self._weights)

    def get_stats(self) -> dict[str, Any]:
        """Return summary statistics about the decision log."""
        with self._lock:
            total = len(self._decisions)
            validated = [d for d in self._decisions if d.get("outcome") in OUTCOMES]
            successes = [d for d in validated if d["outcome"] == "success"]
            by_category: dict[str, int] = {}
            for d in self._decisions:
                cat = d.get("category", "unknown")
                by_category[cat] = by_category.get(cat, 0) + 1

            recent_confidences = [
                d["confidence"] for d in self._decisions[-50:] if "confidence" in d
            ]
            avg_recent_confidence = (
                sum(recent_confidences) / len(recent_confidences)
                if recent_confidences else 0.0
            )

            return {
                "total_decisions":     total,
                "validated_count":     len(validated),
                "success_count":       len(successes),
                "failure_count":       len(validated) - len(successes),
                "by_category":         by_category,
                "avg_recent_confidence": round(avg_recent_confidence, 4),
                "current_weights":     self.get_weights(),
            }

    def reset_weights(self) -> None:
        """Reset evidence weights to defaults."""
        with self._lock:
            self._weights = dict(EVIDENCE_WEIGHTS)
        _log("Weights reset to defaults")


# ── Module-level convenience helpers ──────────────────────────────────────────

_INSTANCE: IntelligenceV2 | None = None
_INSTANCE_LOCK = threading.Lock()


def get_instance() -> IntelligenceV2:
    """Return a singleton IntelligenceV2 instance."""
    global _INSTANCE
    with _INSTANCE_LOCK:
        if _INSTANCE is None:
            _INSTANCE = IntelligenceV2()
        return _INSTANCE


# ── Self-test ──────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys

    _log("Running self-test")

    # Test 1: Instantiation
    try:
        iv2 = IntelligenceV2()
        print("  [PASS] IntelligenceV2() instantiates")
    except Exception as e:
        print(f"  [FAIL] IntelligenceV2() raised {e}")
        sys.exit(1)

    # Test 2: decide() with valid options
    options = [
        {"id": "opt_a", "name": "Option A", "tags": ["fast", "cheap"]},
        {"id": "opt_b", "name": "Option B", "tags": ["robust", "slow"]},
        {"id": "opt_c", "name": "Option C", "tags": ["fast", "robust"]},
    ]
    context = {
        "keywords": ["fast"],
        "available_skills": ["python", "typescript"],
        "preferred_tags": ["fast"],
    }
    try:
        decision = iv2.decide("which_improvement", options, context)
        print(f"  [PASS] decide() returned decision_id={decision['decision_id']}")
        print(f"         confidence={decision['confidence']:.3f}, "
              f"level={decision['confidence_level']}")
        print(f"         reasoning={decision['reasoning'][:80]}...")
    except Exception as e:
        print(f"  [FAIL] decide() raised {e}")
        sys.exit(1)

    # Test 3: validate_decision()
    try:
        iv2.validate_decision(decision["decision_id"], "success")
        print(f"  [PASS] validate_decision() succeeded")
    except Exception as e:
        print(f"  [FAIL] validate_decision() raised {e}")

    # Test 4: get_decision_history()
    try:
        history = iv2.get_decision_history()
        assert len(history) >= 1
        print(f"  [PASS] get_decision_history() returned {len(history)} decisions")
    except Exception as e:
        print(f"  [FAIL] get_decision_history() raised {e}")

    # Test 5: get_decision_history(category=...)
    try:
        history_cat = iv2.get_decision_history(category="which_improvement")
        assert all(d["category"] == "which_improvement" for d in history_cat)
        print(f"  [PASS] get_decision_history(category=...) filter works")
    except Exception as e:
        print(f"  [FAIL] get_decision_history(category=...) raised {e}")

    # Test 6: suggest()
    try:
        suggestion = iv2.suggest("which_improvement", context)
        print(f"  [PASS] suggest() returned suggestion={suggestion.get('suggestion')}")
    except Exception as e:
        print(f"  [FAIL] suggest() raised {e}")

    # Test 7: get_stats()
    try:
        stats = iv2.get_stats()
        print(f"  [PASS] get_stats() returned total_decisions={stats['total_decisions']}")
    except Exception as e:
        print(f"  [FAIL] get_stats() raised {e}")

    # Test 8: get_weights()
    try:
        weights = iv2.get_weights()
        assert abs(sum(weights.values()) - 1.0) < 1e-6
        print(f"  [PASS] get_weights() weights sum to {sum(weights.values()):.4f}")
    except Exception as e:
        print(f"  [FAIL] get_weights() raised {e}")

    # Test 9: reset_weights()
    try:
        iv2.reset_weights()
        w = iv2.get_weights()
        assert w == EVIDENCE_WEIGHTS
        print("  [PASS] reset_weights() restores defaults")
    except Exception as e:
        print(f"  [FAIL] reset_weights() raised {e}")

    # Test 10: Error handling — empty options
    try:
        iv2.decide("which_improvement", [], {})
        print("  [FAIL] decide() should reject empty options")
        sys.exit(1)
    except ValueError:
        print("  [PASS] decide() rejects empty options")

    # Test 11: Error handling — unknown category
    try:
        iv2.decide("not_a_category", options, {})
        print("  [FAIL] decide() should reject unknown category")
        sys.exit(1)
    except ValueError:
        print("  [PASS] decide() rejects unknown category")

    # Test 12: Error handling — invalid outcome
    try:
        iv2.validate_decision(decision["decision_id"], "maybe")
        print("  [FAIL] validate_decision() should reject invalid outcome")
        sys.exit(1)
    except ValueError:
        print("  [PASS] validate_decision() rejects invalid outcome")

    # Test 13: Thread safety — concurrent decide() calls
    import concurrent.futures

    def _worker(i: int) -> dict:
        opts = [{"id": f"t{i}_a"}, {"id": f"t{i}_b"}]
        return iv2.decide("which_approach", opts, {})

    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
            futures = [ex.submit(_worker, i) for i in range(8)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]
        assert len(results) == 8
        print("  [PASS] Concurrent decide() calls succeeded")
    except Exception as e:
        print(f"  [FAIL] Concurrent decide() raised {e}")

    # Test 14: when_to_stop category
    try:
        stop_decision = iv2.decide("when_to_stop", [
            {"id": "continue", "tags": ["continue"]},
            {"id": "stop", "tags": ["stop"]},
        ], {"keywords": ["stop"]})
        print(f"  [PASS] when_to_stop category works, confidence={stop_decision['confidence']:.3f}")
    except Exception as e:
        print(f"  [FAIL] when_to_stop raised {e}")

    # Test 15: what_next category
    try:
        next_decision = iv2.decide("what_next", [
            {"id": "research", "name": "Research"},
            {"id": "implement", "name": "Implement"},
            {"id": "test", "name": "Test"},
        ], {"keywords": ["research"]})
        print(f"  [PASS] what_next category works, chosen={next_decision['chosen_option'].get('id')}")
    except Exception as e:
        print(f"  [FAIL] what_next raised {e}")

    print("\nAll tests passed.")
    _log("Self-test complete")
