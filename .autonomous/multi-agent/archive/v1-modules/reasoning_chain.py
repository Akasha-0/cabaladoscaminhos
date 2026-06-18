#!/usr/bin/env python3
"""
ReasoningChain — advanced chain-of-thought reasoning for autonomous improvement selection.

Gives the evolution loop an "inner monologue": a disciplined multi-step reasoning
process before deciding what to improve next. Designed to:

1. Analyse the current project state via project_map data
2. Consider multiple improvement candidates in parallel
3. Reason about trade-offs, risks, and compounding impact
4. Plan a sequenced set of improvements that compound over time
5. Self-correct when a previous reasoning plan diverges from observed outcomes

API
---
ReasoningChain(pace_budget_ms=5000)
    think(goal: str, context: dict) -> ReasoningResult
        {reasoning_steps, conclusion, confidence, alternatives, thinking_time_ms}
    reason_about(improvement: dict, project_state: dict) -> dict
        {pros, cons, risk, impact, compound_potential}
    plan_sequence(improvements: list[dict], project_state: dict) -> list[dict]
        ordered list of improvements with rationale
    self_correct(previous_plan: list[dict], outcome: dict) -> list[dict]
        updated plan with lessons applied
    explain_reasoning() -> str
        human-readable chain of thought

ReasoningResult fields
----------------------
reasoning_steps : list[Step]
conclusion      : str
confidence      : float  (0.0 – 1.0)
alternatives    : list[str]
thinking_time_ms: float

Step fields
-----------
step_number  : int
observation  : str
analysis     : str
inference    : str
confidence   : float  (0.0 – 1.0)

Memory integration
------------------
Uses memory.json learnings to inform each step of reasoning. Past successes
and failures are weighted by recency and score, then bias the current
reasoning chain's confidence calibration.
"""

from __future__ import annotations

import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal

# ── path constants ──────────────────────────────────────────────────────────────

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous" / "multi-agent"
MEMORY_FILE = MA / "memory.json"

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


# ── log helper ──────────────────────────────────────────────────────────────────

def log(msg: str, file=None) -> None:
    """Print *msg* with a UTC timestamp prefix."""
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
    print(ts + "  [ReasoningChain] " + msg, file=file or sys.stdout)


# ── data structures ─────────────────────────────────────────────────────────────

class Step:
    """
    Single step in a chain-of-thought reasoning sequence.

    Attributes
    ----------
    step_number : int
        1-based position in the chain.
    observation : str
        Raw or quoted fact extracted from the project state or context.
    analysis    : str
        Interpretation of the observation — what it means and why it matters.
    inference   : str
        Logical consequence drawn from the analysis; may update confidence.
    confidence  : float
        Confidence in this step's inference, in [0.0, 1.0].
    """

    __slots__ = ("step_number", "observation", "analysis", "inference", "confidence")

    def __init__(
        self,
        step_number: int,
        observation: str,
        analysis: str,
        inference: str,
        confidence: float = 0.5,
    ) -> None:
        if not isinstance(step_number, int) or step_number < 1:
            raise ValueError("step_number must be a positive integer")
        if not (0.0 <= confidence <= 1.0):
            raise ValueError("confidence must be in [0.0, 1.0]")
        self.step_number = step_number
        self.observation = observation
        self.analysis = analysis
        self.inference = inference
        self.confidence = confidence

    def to_dict(self) -> dict:
        return {
            "step_number": self.step_number,
            "observation": self.observation,
            "analysis": self.analysis,
            "inference": self.inference,
            "confidence": self.confidence,
        }

    @classmethod
    def from_dict(cls, d: dict) -> Step:
        return cls(
            step_number=int(d["step_number"]),
            observation=str(d["observation"]),
            analysis=str(d["analysis"]),
            inference=str(d["inference"]),
            confidence=float(d.get("confidence", 0.5)),
        )


class ReasoningResult:
    """
    The output of a full think() pass.

    Attributes
    ----------
    reasoning_steps : list[Step]
        The 3-7 individual reasoning steps that led to the conclusion.
    conclusion       : str
        The final synthesised decision or recommendation.
    confidence       : float
        Aggregate confidence [0.0 – 1.0] across all steps.
    alternatives     : list[str]
        Alternative conclusions considered and why they were rejected.
    thinking_time_ms : float
        Wall-clock milliseconds consumed by this think() pass.
    """

    __slots__ = (
        "reasoning_steps",
        "conclusion",
        "confidence",
        "alternatives",
        "thinking_time_ms",
    )

    def __init__(
        self,
        reasoning_steps: list[Step],
        conclusion: str,
        confidence: float,
        alternatives: list[str],
        thinking_time_ms: float,
    ) -> None:
        self.reasoning_steps = reasoning_steps
        self.conclusion = conclusion
        self.confidence = confidence
        self.alternatives = alternatives
        self.thinking_time_ms = thinking_time_ms

    def to_dict(self) -> dict:
        return {
            "reasoning_steps": [s.to_dict() for s in self.reasoning_steps],
            "conclusion": self.conclusion,
            "confidence": self.confidence,
            "alternatives": self.alternatives,
            "thinking_time_ms": self.thinking_time_ms,
        }

    @classmethod
    def from_dict(cls, d: dict) -> ReasoningResult:
        return cls(
            reasoning_steps=[Step.from_dict(s) for s in d["reasoning_steps"]],
            conclusion=str(d["conclusion"]),
            confidence=float(d["confidence"]),
            alternatives=list(d.get("alternatives", [])),
            thinking_time_ms=float(d.get("thinking_time_ms", 0.0)),
        )


# ── scoring constants ────────────────────────────────────────────────────────────

# Weight for the most recent iteration when computing learning relevance.
# Higher = more recency bias.  0.97 per iteration decay is ~right for this project.
LEARNING_DECAY: float = 0.97

# Minimum confidence to consider a historical learning applicable.
LEARNING_APPLICABILITY_THRESHOLD: float = 0.30

# Confidence adjustments applied when reasoning steps corroborate or contradict
# each other.
CORROBORATION_BOOST: float = 0.05
CONTRADICTION_PENALTY: float = 0.10

# Bounds for the random number of reasoning steps (3–7).
MIN_STEPS: int = 3
MAX_STEPS: int = 7

# Risk levels as sentinel strings.
RISK_LOW: str = "low"
RISK_MEDIUM: str = "medium"
RISK_HIGH: str = "high"

# ── memory query helpers ───────────────────────────────────────────────────────

def _iterations_since(timestamp_str: str, current_iteration: int) -> int:
    """Return the iteration gap given an ISO timestamp string and current_iteration."""
    try:
        then = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        # Approximate: 1 iteration ≈ 5 minutes
        delta_seconds = (now - then).total_seconds()
        return int(delta_seconds / 300)
    except Exception:
        return current_iteration  # fall back to "current"


def query_learnings(
    memory: dict[str, Any],
    keywords: list[str],
    current_iteration: int,
    top_n: int = 5,
) -> list[dict]:
    """
    Return the *top_n* most relevant learnings from *memory* that match any
    keyword in *keywords*, scored by recency and base score.

    Scoring formula
    ---------------
    relevance = base_score * (LEARNING_DECAY ** iterations_since)

    Learnings with relevance below LEARNING_APPLICABILITY_THRESHOLD are dropped.
    """
    raw = memory.get("learnings", [])
    if not raw:
        raw = memory.get("context_window", [])

    scored: list[tuple[float, dict]] = []
    for entry in raw:
        content = str(entry.get("content", "")).lower()
        score = float(entry.get("score", 0.5))
        iteration = int(entry.get("iteration", current_iteration))
        ts = str(entry.get("timestamp", ""))
        age = _iterations_since(ts, current_iteration) if ts else (current_iteration - iteration)
        relevance = score * (LEARNING_DECAY ** age)

        # Check for keyword overlap
        keyword_matches = sum(1 for kw in keywords if kw.lower() in content)
        if keyword_matches == 0 and keywords:
            continue
        if relevance < LEARNING_APPLICABILITY_THRESHOLD:
            continue

        scored.append((relevance, entry))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [entry for _, entry in scored[:top_n]]


def query_success_patterns(
    memory: dict[str, Any],
    keywords: list[str],
    top_n: int = 5,
) -> list[str]:
    """
    Return the IDs of the most frequent successful pattern types, filtered by
    keyword presence in recent_decisons descriptions.
    """
    patterns = memory.get("success_patterns", {})
    decisions = memory.get("recent_decisions", [])

    # Map pattern id → description from recent decisions
    id_to_desc: dict[str, str] = {}
    for decision in decisions:
        dtype = str(decision.get("type", ""))
        desc = str(decision.get("description", ""))
        key = str(decision.get("id", ""))
        if key and dtype:
            id_to_desc[key] = f"{dtype}: {desc}"

    # Score by frequency * keyword relevance
    scored: list[tuple[int, str]] = []
    for pid, freq in patterns.items():
        desc = id_to_desc.get(pid, pid)
        kw_hits = sum(1 for kw in keywords if kw.lower() in desc.lower())
        scored.append((freq * (kw_hits + 1), desc))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [desc for _, desc in scored[:top_n]]


def query_error_patterns(
    memory: dict[str, Any],
    keywords: list[str],
    top_n: int = 5,
) -> list[str]:
    """
    Return the most frequent error pattern descriptions, filtered by keywords.
    """
    errors = memory.get("error_patterns", {})
    if not errors:
        return []

    scored: list[tuple[int, str]] = []
    for pattern, freq in errors.items():
        kw_hits = sum(1 for kw in keywords if kw.lower() in pattern.lower())
        scored.append((freq * (kw_hits + 1), pattern))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [p for _, p in scored[:top_n]]


# ── improvement scoring helpers ─────────────────────────────────────────────────

def _extract_keywords(improvement: dict) -> list[str]:
    """Pull meaningful keywords from an improvement descriptor."""
    fields = [
        str(improvement.get("name", "")),
        str(improvement.get("description", "")),
        str(improvement.get("type", "")),
        " ".join(improvement.get("tags", [])),
    ]
    text = " ".join(fields).lower()
    # Strip noise words and keep 3+ char tokens
    noise = {
        "the", "a", "an", "of", "and", "or", "to", "in", "for", "with",
        "on", "at", "by", "from", "is", "are", "was", "were", "be", "been",
        "this", "that", "it", "as", "has", "have", "had", "will", "would",
        "could", "should", "may", "might", "can",
    }
    tokens = re.findall(r"\b[a-z0-9_-]{3,}\b", text)
    return [t for t in tokens if t not in noise][:12]


def _assess_risk(improvement: dict, project_state: dict) -> str:
    """Classify the risk level of applying this improvement."""
    # High-risk indicators
    high_risk_tags = {"refactor", "rewrite", "migration", "destructive", "breaking"}
    safe_tags = {"test", "docs", "config", "lint", "type", "annotation"}

    tags = {t.lower() for t in improvement.get("tags", [])}
    high_risk_indicators = (
        improvement.get("risk", "") in (RISK_HIGH, "high")
        or bool(tags & high_risk_tags)
    )
    safe_indicators = bool(tags & safe_tags)

    # Check if project is in a fragile state
    build_ok = project_state.get("build_ok", True)
    test_pass_rate = project_state.get("test_pass_rate", 1.0)

    if high_risk_indicators and not (build_ok and test_pass_rate > 0.9):
        return RISK_HIGH
    if safe_indicators or (build_ok and test_pass_rate > 0.95):
        return RISK_LOW
    return RISK_MEDIUM


def _assess_impact(improvement: dict, project_state: dict) -> float:
    """Return a 0.0–1.0 impact score for this improvement."""
    # Base impact from explicit field
    base = float(improvement.get("impact_score", 0.5))

    # Boost for improvements targeting known problem areas
    error_patterns = project_state.get("error_patterns", [])
    name = str(improvement.get("name", "")).lower()
    desc = str(improvement.get("description", "")).lower()
    text = name + " " + desc
    error_hits = sum(1 for ep in error_patterns if ep.lower() in text)
    impact = min(1.0, base + 0.15 * error_hits)

    # Boost for foundational improvements (types, tests, docs)
    foundational_tags = {"types", "type-annotation", "tests", "test", "docs"}
    if foundational_tags & {t.lower() for t in improvement.get("tags", [])}:
        impact = min(1.0, impact + 0.05)

    # Penalise if project is unstable
    if not project_state.get("build_ok", True):
        impact *= 0.8

    return round(impact, 3)


def _assess_compound_potential(
    improvement: dict,
    project_state: dict,
    already_planned: list[dict],
) -> float:
    """
    Estimate how much this improvement enables or blocks future work.

    Compound potential is high when the improvement:
      - Removes a long-standing blocker
      - Is a prerequisite for several other improvements
      - Fixes an architectural issue that currently infects many files
    """
    base = float(improvement.get("compound_potential", 0.5))

    # Check how many planned improvements depend on this one
    deps = set(improvement.get("enables", []))
    blockers = set(improvement.get("blocked_by", []))
    dependents = sum(1 for ip in already_planned if improvement.get("id") in ip.get("blocked_by", []))
    prerequisite_benefit = min(1.0, 0.1 * dependents)

    # Architectural fixes compound broadly
    arch_tags = {"architecture", "refactor", "interface", "api", "types"}
    if arch_tags & {t.lower() for t in improvement.get("tags", [])}:
        prerequisite_benefit = min(1.0, prerequisite_benefit + 0.15)

    # Blockers reduce compound potential if they're frequent error patterns
    error_patterns = set(project_state.get("error_patterns", []))
    active_blockers = blockers & error_patterns
    blocker_penalty = min(0.2, 0.05 * len(active_blockers))

    return round(min(1.0, base + prerequisite_benefit - blocker_penalty), 3)


# ── step generation helpers ─────────────────────────────────────────────────────

def _build_steps_from_template(
    goal: str,
    context: dict,
    memory: dict[str, Any],
    keywords: list[str],
    num_steps: int,
) -> list[Step]:
    """
    Generate *num_steps* reasoning steps for *goal* using the provided context
    and memory learnings.

    Each step follows the O-A-I-C pattern:
      Observation → Analysis → Inference → Confidence

    Steps are written to be self-contained and to build on each other, so that
    reading them in order gives the full chain of thought.
    """
    steps: list[Step] = []
    current_confidence = 0.5

    project_state = context.get("project_state", {})
    current_iteration = int(memory.get("iteration", 0))

    # ── Step 1: Observe the current project state ───────────────────────────────
    build_ok = project_state.get("build_ok", None)
    test_rate = project_state.get("test_pass_rate", None)
    tech_debt = project_state.get("tech_debt_files", 0)
    error_count = len(project_state.get("error_patterns", []))

    obs1 = (
        f"Project state snapshot: build={'PASS' if build_ok else 'FAIL'}, "
        f"test_pass_rate={test_rate:.1%} if test_rate is not None else 'unknown', "
        f"tech_debt_files={tech_debt}, known_error_patterns={error_count}."
    )
    if error_count > 0:
        obs1 += f" Top errors: {', '.join(project_state.get('error_patterns', [])[:3])}."
    if context.get("recent_failures"):
        obs1 += f" Recent failures: {', '.join(str(f) for f in context['recent_failures'][:3])}."

    step1 = Step(
        step_number=1,
        observation=obs1,
        analysis=(
            "The project is currently in a "
            + ("healthy state." if (build_ok and (test_rate or 0) > 0.9) else "fragile state.")
            + (" A clean build and high test pass rate suggest the baseline is stable."
               if build_ok else
               " Build failures or low test coverage mean any non-trivial change carries elevated risk.")
        ),
        inference=(
            "The baseline stability informs how aggressively we can pursue improvements: "
            "stable baseline → more latitude; fragile baseline → prefer safe, incremental work."
        ),
        confidence=0.9 if build_ok else 0.6,
    )
    steps.append(step1)
    current_confidence = step1.confidence

    # ── Step 2: Query historical learnings relevant to this goal ─────────────
    learnings = query_learnings(memory, keywords, current_iteration, top_n=3)
    past_work = query_success_patterns(memory, keywords, top_n=3)
    past_errors = query_error_patterns(memory, keywords, top_n=3)

    obs2 = f"Relevant learnings from history (iteration {current_iteration}): "
    if learnings:
        obs2 += "; ".join(
            f"[score={l.get('score', 0):.2f}] {l.get('content', '')[:120]}"
            for l in learnings[:3]
        )
    else:
        obs2 += "No directly applicable learnings found in memory."

    if past_work:
        obs2 += f" | Past successes: {', '.join(past_work[:2])}."
    if past_errors:
        obs2 += f" | Known error patterns: {', '.join(past_errors[:2])}."

    step2 = Step(
        step_number=2,
        observation=obs2,
        analysis=(
            "These learnings reveal patterns: "
            + ("Previously successful approaches should be preferred." if past_work else
               "No direct past successes; lean on cautious, verifiable steps.")
            + (f" The error pattern '{past_errors[0]}' signals a recurring risk to avoid."
               if past_errors else "")
        ),
        inference=(
            "We should bias toward improvements that match past success patterns "
            "and explicitly avoid or mitigate the identified error patterns."
        ),
        confidence=0.7 if learnings else 0.5,
    )
    steps.append(step2)
    current_confidence = (current_confidence + step2.confidence) / 2

    # ── Step 3: Decompose the goal into concrete improvement targets ────────────
    improvements = context.get("candidate_improvements", [])
    if not improvements:
        improvements = context.get("improvements", [])

    obs3 = f"Goal: '{goal}'. "
    if improvements:
        names = [f"{i+1}. {imp.get('name', imp.get('id', '?'))}" for i, imp in enumerate(improvements[:6])]
        obs3 += f"Candidate improvements identified: {'; '.join(names)}."
    else:
        obs3 += "No candidate improvements provided in context — reasoning will proceed from project state alone."

    step3 = Step(
        step_number=3,
        observation=obs3,
        analysis=(
            "The goal decomposes into "
            + (f"{len(improvements)} concrete candidates." if improvements else
               "no explicit candidates, so the reasoning chain must derive priorities from raw project state.")
            + (" Each candidate must be evaluated on risk, impact, and compound potential."
               if improvements else "")
        ),
        inference=(
            "Without explicit candidates, we fall back to generic high-value targets: "
            "fix build errors first, then restore test coverage, then address tech debt."
        ),
        confidence=0.75 if improvements else 0.55,
    )
    steps.append(step3)
    current_confidence = (current_confidence * 0.6 + step3.confidence * 0.4)

    # ── Step 4: Evaluate the top candidates ────────────────────────────────────
    if improvements and len(steps) < num_steps:
        evaluated: list[str] = []
        for imp in improvements[:4]:
            name = imp.get("name", imp.get("id", "?"))
            risk = _assess_risk(imp, project_state)
            impact = _assess_impact(imp, project_state)
            comp = _assess_compound_potential(imp, project_state, improvements)
            evaluated.append(
                f"{name}: risk={risk}, impact={impact:.2f}, compound={comp:.2f}"
            )
        obs4 = "Evaluation of top candidates: " + "; ".join(evaluated) + "."
        step4 = Step(
            step_number=4,
            observation=obs4,
            analysis=(
                "Risk classification: "
                + ("High-risk candidates require a preceding stable baseline or should be deferred."
                   if any("high" in e for e in evaluated) else
                   "All candidates are low-to-medium risk — proceed with normal sequencing.")
            ),
            inference=(
                "High-impact + high-compound candidates should be prioritised, "
                "subject to the risk constraint: never apply high-risk changes to a fragile baseline."
            ),
            confidence=0.7,
        )
        steps.append(step4)
        current_confidence = (current_confidence * 0.5 + step4.confidence * 0.5)

    # ── Step 5: Consider sequencing and dependencies ───────────────────────────
    if improvements and len(steps) < num_steps:
        dep_graph: dict[str, list[str]] = {}
        for imp in improvements:
            dep_graph[imp.get("id", imp.get("name", "?"))] = imp.get("blocked_by", [])
        leaves = [k for k, v in dep_graph.items() if not v]
        roots = [k for k, v in dep_graph.items() if k not in sum(dep_graph.values(), [])]

        obs5 = (
            f"Dependency analysis: {len(dep_graph)} candidates, "
            f"{len(roots)} root(s) with no prerequisites: {roots}, "
            f"{len(leaves)} leaf(s) with no dependents: {leaves}."
        )
        step5 = Step(
            step_number=5,
            observation=obs5,
            analysis=(
                "Proper sequencing must respect dependencies: "
                + ("Roots must precede their dependents." if roots else "No strict dependencies detected.")
                + (" Leaves are safe to execute last." if leaves else "")
            ),
            inference=(
                "A safe execution order is: all roots first (level order), "
                "then remaining nodes in descending dependency order."
            ),
            confidence=0.8,
        )
        steps.append(step5)
        current_confidence = (current_confidence * 0.6 + step5.confidence * 0.4)

    # ── Step 6: Calibrate against memory learnings ──────────────────────────────
    if len(steps) < num_steps:
        obs6 = (
            "Confidence calibration from memory: "
            + (f"Past successes ({len(past_work)}) support higher confidence in "
               "approach-aligned changes." if past_work else
               "No strong past signal — default to moderate confidence.")
            + (f" Error patterns ({len(past_errors)}) suggest we should discount "
               "confidence by ~10% when working near known problem areas." if past_errors else "")
        )
        calibrated = round(min(1.0, current_confidence + (0.05 if past_work else -0.05)), 3)
        step6 = Step(
            step_number=6,
            observation=obs6,
            analysis=(
                "Confidence is calibrated by historical signal strength. "
                "Strong past successes → confidence boost; "
                "active error patterns → confidence haircut."
            ),
            inference=(
                f"Adjusted confidence for this reasoning chain: {calibrated:.2f}. "
                "Steps with corroborating evidence get a +{:.0f}% boost; "
                "contradictions get a -{:.0f}% penalty.".format(
                    CORROBORATION_BOOST * 100, CONTRADICTION_PENALTY * 100
                )
            ),
            confidence=calibrated,
        )
        steps.append(step6)
        current_confidence = calibrated

    # ── Step 7 (final): Synthesise the conclusion ──────────────────────────────
    if len(steps) < num_steps:
        remaining = num_steps - len(steps)
        for i in range(remaining):
            snum = len(steps) + 1
            # Inject a refinement step to fill the chain
            step = Step(
                step_number=snum,
                observation=f"Refinement step {snum}: further analysis of '{goal}'.",
                analysis="Additional analysis to round out the reasoning chain.",
                inference="This refinement increases the robustness of the final conclusion.",
                confidence=current_confidence,
            )
            steps.append(step)

    return steps[:num_steps]


def _synthesise_conclusion(
    steps: list[Step],
    goal: str,
    context: dict,
    improvements: list[dict],
) -> tuple[str, float, list[str]]:
    """
    Derive the final conclusion text, aggregate confidence, and alternatives
    from the populated reasoning steps.
    """
    avg_confidence = round(
        sum(s.confidence for s in steps) / len(steps), 3
    ) if steps else 0.5

    project_state = context.get("project_state", {})
    build_ok = project_state.get("build_ok", True)
    test_rate = project_state.get("test_pass_rate", 1.0)

    # Determine the primary recommendation
    if improvements:
        scored = []
        for imp in improvements:
            risk = _assess_risk(imp, project_state)
            impact = _assess_impact(imp, project_state)
            comp = _assess_compound_potential(imp, project_state, improvements)
            score = (impact * 0.4 + comp * 0.4 + (0.5 if risk == RISK_LOW else 0.0) * 0.2)
            scored.append((score, imp))

        scored.sort(key=lambda x: x[0], reverse=True)
        top_imp = scored[0][1]
        top_name = top_imp.get("name", top_imp.get("id", "?"))
        top_score = scored[0][0]

        # Build conclusion
        if not build_ok or test_rate < 0.9:
            conclusion = (
                f"PRIORITY 1 (unstable baseline): Fix build errors before any other improvement. "
                f"Recommended first action: '{top_name}' (composite score={top_score:.2f}). "
                f"All high-risk changes are deferred until build and test pass rates are >90%."
            )
            avg_confidence = min(avg_confidence, 0.65)
        else:
            conclusion = (
                f"Recommended next improvement: '{top_name}' "
                f"(composite score={top_score:.2f}, risk={_assess_risk(top_imp, project_state)}). "
                f"Full ranked sequence: "
                + ", ".join(
                    f"{imp.get('name', imp.get('id', '?'))} ({sc:.2f})"
                    for sc, imp in scored[:5]
                )
                + "."
            )
    else:
        if not build_ok:
            conclusion = (
                "CONCLUSION: Fix build errors immediately. "
                "Do not attempt additional improvements until build passes."
            )
        elif test_rate < 0.9:
            conclusion = (
                "CONCLUSION: Restore test coverage to >90% before pursuing feature work. "
                "Low test coverage means the baseline is not trustworthy for larger changes."
            )
        else:
            conclusion = (
                "CONCLUSION: Baseline is healthy. "
                "Pursue the highest-impact tech-debt or test improvement available."
            )
        avg_confidence = min(avg_confidence, 0.7)

    # Alternatives: second and third choices if improvements exist
    alternatives: list[str] = []
    if improvements and len(scored) > 1:
        second = scored[1][1]
        alternatives.append(
            f"Alternative 1: '{second.get('name', second.get('id', '?'))}' "
            f"(score={scored[1][0]:.2f}, risk={_assess_risk(second, project_state)}). "
            "Selected if the primary recommendation is blocked or fails."
        )
    if improvements and len(scored) > 2:
        third = scored[2][1]
        alternatives.append(
            f"Alternative 2: '{third.get('name', third.get('id', '?'))}' "
            f"(score={scored[2][0]:.2f}). Fallback if first two are unavailable."
        )

    # Add an error-pattern-based alternative if relevant
    error_patterns = project_state.get("error_patterns", [])
    if error_patterns:
        alternatives.append(
            f"Error-pattern mitigation: address known errors {error_patterns[:2]} first. "
            "This is a meta-improvement that improves the baseline before any other work."
        )

    return conclusion, avg_confidence, alternatives


# ── main ReasoningChain class ──────────────────────────────────────────────────

class ReasoningChain:
    """
    Advanced chain-of-thought reasoner for autonomous improvement selection.

    Parameters
    ----------
    pace_budget_ms : float, default 5000
        Soft time budget for a single think() pass.  If exceeded the current
        step is finalised and the result is returned with a warning note.

    Attributes
    ----------
    current_goal : str | None
        The goal passed to the most recent think() call.
    current_context : dict | None
        The context dict passed to the most recent think() call.
    current_steps : list[Step]
        The reasoning steps from the most recent think() pass.
    current_result : ReasoningResult | None
        The full result from the most recent think() pass.
    plan_history : list[list[dict]]
        Stacked list of previous plans (each plan is a list of improvement dicts).
    correction_history : list[dict]
        Log of self-corrections: {previous_plan, outcome, updated_plan, lessons}.
    """

    def __init__(
        self,
        pace_budget_ms: float = 5000.0,
    ) -> None:
        self.pace_budget_ms = pace_budget_ms
        self.current_goal: str | None = None
        self.current_context: dict | None = None
        self.current_steps: list[Step] = []
        self.current_result: ReasoningResult | None = None
        self.plan_history: list[list[dict]] = []
        self.correction_history: list[dict] = []

    # ── public API ───────────────────────────────────────────────────────────────

    def think(
        self,
        goal: str,
        context: dict[str, Any],
    ) -> ReasoningResult:
        """
        Run a full chain-of-thought reasoning pass toward *goal* given *context*.

        Parameters
        ----------
        goal : str
            The improvement goal to reason about.  Examples:
              "Improve test coverage from 60% to 80%"
              "Fix the authentication race condition"
              "Reduce cold-start latency by 50%"

        context : dict
            Must contain a ``project_state`` key with at least:
              - build_ok : bool
              - test_pass_rate : float | None
              - tech_debt_files : int
              - error_patterns : list[str]
            May also contain:
              - candidate_improvements : list[dict]  (preferred key)
              - improvements : list[dict]             (fallback key)
              - recent_failures : list[str]

        Returns
        -------
        ReasoningResult
            Contains reasoning_steps (3–7 Step objects), conclusion, confidence,
            alternatives, and thinking_time_ms.
        """
        t0 = time.monotonic()
        self.current_goal = goal
        self.current_context = context

        # Load memory for learning-informed reasoning
        memory = load_json(MEMORY_FILE)
        current_iteration = int(memory.get("iteration", 0))

        # Extract keywords for memory queries
        keywords = [goal] + [
            str(v) for v in context.get("project_state", {}).values()
            if isinstance(v, str) and len(v) > 3
        ][:10]

        # Determine number of steps (3–7)
        improvements = context.get("candidate_improvements", context.get("improvements", []))
        num_steps = len(improvements) if improvements else MIN_STEPS
        num_steps = max(MIN_STEPS, min(MAX_STEPS, num_steps))

        # Build the reasoning chain
        steps = _build_steps_from_template(
            goal=goal,
            context=context,
            memory=memory,
            keywords=keywords,
            num_steps=num_steps,
        )

        # Synthesise conclusion and alternatives
        conclusion, confidence, alternatives = _synthesise_conclusion(
            steps=steps,
            goal=goal,
            context=context,
            improvements=improvements,
        )

        elapsed_ms = (time.monotonic() - t0) * 1000.0
        if elapsed_ms > self.pace_budget_ms:
            conclusion += (
                f" [WARNING: think() exceeded budget {self.pace_budget_ms:.0f}ms "
                f"(took {elapsed_ms:.0f}ms)]"
            )
            log(f"think() budget exceeded: {elapsed_ms:.0f}ms > {self.pace_budget_ms:.0f}ms")

        result = ReasoningResult(
            reasoning_steps=steps,
            conclusion=conclusion,
            confidence=confidence,
            alternatives=alternatives,
            thinking_time_ms=elapsed_ms,
        )

        self.current_steps = steps
        self.current_result = result

        log(
            f"think() complete: goal='{goal[:60]}', "
            f"steps={len(steps)}, confidence={confidence:.2f}, "
            f"elapsed={elapsed_ms:.1f}ms"
        )
        return result

    def reason_about(
        self,
        improvement: dict[str, Any],
        project_state: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Analyse a single improvement candidate in depth.

        Parameters
        ----------
        improvement : dict
            Improvement descriptor.  Expected keys:
              - id or name : str
              - description : str
              - tags : list[str]
              - blocked_by : list[str]   (optional)
              - enables : list[str]      (optional)
              - impact_score : float     (optional, 0–1)
              - compound_potential : float (optional, 0–1)
              - risk : str               (optional: "low", "medium", "high")

        project_state : dict
            As documented for ``think()``.

        Returns
        -------
        dict with keys:
          - pros : list[str]
          - cons : list[str]
          - risk : str  ("low" | "medium" | "high")
          - impact : float  (0.0 – 1.0)
          - compound_potential : float  (0.0 – 1.0)
          - assessment_notes : list[str]
        """
        name = improvement.get("name", improvement.get("id", "?"))
        tags = improvement.get("tags", [])
        desc = improvement.get("description", "")

        pros: list[str] = []
        cons: list[str] = []
        assessment_notes: list[str] = []

        # ── Risk assessment ────────────────────────────────────────────────────
        risk = _assess_risk(improvement, project_state)
        if risk == RISK_LOW:
            pros.append("Low-risk change; safe to apply even to a fragile baseline")
        elif risk == RISK_HIGH:
            cons.append(
                "High-risk change; requires a stable baseline "
                "(build passing, test_rate > 90%) to proceed safely"
            )
            assessment_notes.append(
                "Defer to after baseline stabilises, or break into smaller steps"
            )

        # ── Impact assessment ───────────────────────────────────────────────────
        impact = _assess_impact(improvement, project_state)
        if impact >= 0.8:
            pros.append(f"High impact score ({impact:.2f}): addresses a significant project need")
        elif impact >= 0.5:
            pros.append(f"Moderate impact ({impact:.2f})")
        else:
            cons.append(f"Low impact ({impact:.2f}): marginal benefit")
            assessment_notes.append("Consider whether this is worth the opportunity cost")

        # ── Compound potential ──────────────────────────────────────────────────
        compound = _assess_compound_potential(
            improvement, project_state, [improvement]
        )
        if compound >= 0.7:
            pros.append(
                f"High compound potential ({compound:.2f}): "
                "enables or unblocks multiple other improvements"
            )
        elif compound <= 0.3:
            cons.append(
                f"Low compound potential ({compound:.2f}): "
                "this change is isolated with few downstream benefits"
            )

        # ── Memory-informed analysis ─────────────────────────────────────────────
        memory = load_json(MEMORY_FILE)
        current_iteration = int(memory.get("iteration", 0))
        keywords = _extract_keywords(improvement)
        learnings = query_learnings(memory, keywords, current_iteration, top_n=3)
        if learnings:
            assessment_notes.append(
                f"Found {len(learnings)} relevant historical learnings — "
                "see think() output for details"
            )
            for l in learnings[:2]:
                score = l.get("score", 0)
                content = l.get("content", "")[:100]
                assessment_notes.append(f"  Past learning [score={score:.2f}]: {content}")
        else:
            assessment_notes.append(
                "No directly relevant learnings found — reasoning is based on project state"
            )

        # ── Dependency analysis ─────────────────────────────────────────────────
        blocked_by = improvement.get("blocked_by", [])
        enables = improvement.get("enables", [])
        if blocked_by:
            cons.append(f"Blocked by: {', '.join(blocked_by)}")
            assessment_notes.append(
                "Prerequisite work must be completed before this improvement"
            )
        if enables:
            pros.append(f"Enables: {', '.join(enables)}")
            assessment_notes.append(
                "This improvement is a prerequisite for other high-value changes"
            )

        # ── Error pattern intersection ─────────────────────────────────────────
        error_patterns = project_state.get("error_patterns", [])
        error_hits = [
            ep for ep in error_patterns
            if ep.lower() in (name + " " + desc).lower()
        ]
        if error_hits:
            pros.append(
                f"Directly addresses known error pattern(s): {', '.join(error_hits)}"
            )
        else:
            assessment_notes.append(
                "No direct intersection with known error patterns"
            )

        # ── Tag-based analysis ──────────────────────────────────────────────────
        foundational = {"types", "type-annotation", "tests", "test", "docs"}
        if foundational & {t.lower() for t in tags}:
            pros.append(
                "Foundational improvement: types/tests/docs provide compounding returns "
                "across the entire codebase"
            )
        if {"architecture", "refactor"} & {t.lower() for t in tags}:
            assessment_notes.append(
                "Architectural refactor: high long-term value but short-term risk; "
                "ensure test coverage before proceeding"
            )
        if {"performance", "optimisation"} & {t.lower() for t in tags}:
            assessment_notes.append(
                "Performance work: validate before/after benchmarks; "
                "risk of regression if benchmarks are not representative"
            )

        return {
            "pros": pros,
            "cons": cons,
            "risk": risk,
            "impact": impact,
            "compound_potential": compound,
            "assessment_notes": assessment_notes,
        }

    def plan_sequence(
        self,
        improvements: list[dict[str, Any]],
        project_state: dict[str, Any],
    ) -> list[dict[str, Any]]:
        """
        Order a list of improvement candidates into a safe, high-value execution plan.

        Parameters
        ----------
        improvements : list[dict]
            List of improvement descriptors (see ``reason_about`` for schema).
        project_state : dict
            As documented for ``think()``.

        Returns
        -------
        list[dict]
            Ordered list of improvements, each enriched with:
              - original fields
              - rationale : str           — why this improvement is at this position
              - composite_score : float   — (impact * 0.4 + compound * 0.4 + safety * 0.2)
              - execution_order : int     — 1-based position
              - preconditions : list[str] — what must be true before executing
              - risk_after : str           — risk level after this step (post-state)
        """
        if not improvements:
            log("plan_sequence called with empty improvements list — returning empty plan")
            return []

        memory = load_json(MEMORY_FILE)
        current_iteration = int(memory.get("iteration", 0))

        # Score each improvement
        scored: list[tuple[float, dict]] = []
        for imp in improvements:
            risk = _assess_risk(imp, project_state)
            impact = _assess_impact(imp, project_state)
            compound = _assess_compound_potential(imp, project_state, improvements)
            safety = 1.0 if risk == RISK_LOW else 0.5 if risk == RISK_MEDIUM else 0.0
            composite = round(impact * 0.4 + compound * 0.4 + safety * 0.2, 3)
            scored.append((composite, imp))

        scored.sort(key=lambda x: x[0], reverse=True)

        # Build dependency-aware ordering
        # 1. Identify roots (no one blocks them)
        # 2. Topologically sort by blocked_by edges
        dep_map: dict[str, set[str]] = {}
        id_map: dict[str, dict] = {}
        for imp in improvements:
            eid = imp.get("id", imp.get("name", str(imp)))
            id_map[eid] = imp
            dep_map[eid] = set(imp.get("blocked_by", []))

        # Kahn's algorithm for topological sort, biased by composite score
        in_degree = {eid: len(deps) for eid, deps in dep_map.items()}
        ready = [eid for eid, deg in in_degree.items() if deg == 0]

        # Within ready set, sort by composite score descending
        score_map = {eid: sc for sc, imp in scored for eid in [imp.get("id", imp.get("name", str(imp)))]}
        ready.sort(key=lambda eid: score_map.get(eid, 0), reverse=True)

        ordered_ids: list[str] = []
        remaining = set(dep_map.keys())

        while ready:
            eid = ready.pop(0)
            ordered_ids.append(eid)
            remaining.discard(eid)
            # Decrease in-degree for dependents
            for other_eid, deps in dep_map.items():
                if eid in deps:
                    in_degree[other_eid] -= 1
                    if in_degree[other_eid] == 0 and other_eid in remaining:
                        ready.append(other_eid)
                        ready.sort(key=lambda x: score_map.get(x, 0), reverse=True)

        # Cyclic dependencies: append remaining in score order
        if remaining:
            remaining_list = sorted(remaining, key=lambda eid: score_map.get(eid, 0), reverse=True)
            ordered_ids.extend(remaining_list)
            log(f"plan_sequence: cyclic dependencies detected, appending: {remaining}")

        # Build enriched output
        plan: list[dict[str, Any]] = []
        for pos, eid in enumerate(ordered_ids, start=1):
            imp = id_map[eid]
            composite = score_map.get(eid, 0.0)
            risk = _assess_risk(imp, project_state)
            impact = _assess_impact(imp, project_state)
            compound = _assess_compound_potential(imp, project_state, improvements)
            blocked_by = imp.get("blocked_by", [])
            enables = imp.get("enables", [])

            # Rationale
            if pos == 1:
                rationale = (
                    f"Highest composite score ({composite:.2f}): "
                    f"impact={impact:.2f}, compound={compound:.2f}, risk={risk}. "
                    + ("First because it has no prerequisites and highest expected value."
                       if not blocked_by else
                       f"First because its blockers ({', '.join(blocked_by)}) are satisfied or this is a root node.")
                )
            else:
                rationale = (
                    f"Composite score={composite:.2f} (position {pos}). "
                    + (f"Unblocked by {', '.join(blocked_by)}." if blocked_by else "No prerequisites.")
                    + (f" Enables {', '.join(enables)}." if enables else "")
                )

            # Preconditions
            preconditions: list[str] = []
            if not project_state.get("build_ok", True):
                preconditions.append("Build must be passing")
            if project_state.get("test_pass_rate", 1.0) < 0.9 and risk != RISK_LOW:
                preconditions.append("Test pass rate should be > 90%")
            for blk in blocked_by:
                preconditions.append(f"Complete '{blk}' first")
            if not preconditions:
                preconditions.append("Baseline stable (build ok, test_rate > 90%)")

            plan.append({
                **imp,
                "rationale": rationale,
                "composite_score": composite,
                "execution_order": pos,
                "preconditions": preconditions,
                "risk_after": risk,
            })

        # Persist plan to history
        self.plan_history.append(list(plan))
        log(f"plan_sequence: ordered {len(plan)} improvements, top={plan[0].get('name', plan[0].get('id', '?'))}")
        return plan

    def self_correct(
        self,
        previous_plan: list[dict[str, Any]],
        outcome: dict[str, Any],
    ) -> list[dict[str, Any]]:
        """
        Revise a previously generated plan based on observed *outcome*.

        Parameters
        ----------
        previous_plan : list[dict]
            The plan originally returned by ``plan_sequence``.
        outcome : dict
            Observations after attempting part or all of *previous_plan*.
            Expected keys:
              - executed : list[str]          ids/names that were actually executed
              - skipped : list[str]           ids/names that were skipped
              - failed : list[str]            ids/names that failed
              - results : dict[str, Any]      per-improvement result data
              - new_errors : list[str]         newly introduced error patterns
              - test_rate_delta : float       change in test_pass_rate
              - build_ok_delta : bool          did build status change

        Returns
        -------
        list[dict]
            Revised plan with lessons applied.  Lessons are logged to
            ``self.correction_history``.
        """
        memory = load_json(MEMORY_FILE)
        current_iteration = int(memory.get("iteration", 0))
        executed = set(str(x) for x in outcome.get("executed", []))
        skipped = set(str(x) for x in outcome.get("skipped", []))
        failed = set(str(x) for x in outcome.get("failed", []))
        new_errors = outcome.get("new_errors", [])
        test_delta = float(outcome.get("test_rate_delta", 0.0))
        build_delta = bool(outcome.get("build_ok_delta", False))

        lessons: list[str] = []
        adjustments: list[dict[str, Any]] = []
        deferred: list[dict[str, Any]] = []
        promoted: list[dict[str, Any]] = []

        # ── Lesson 1: analyse execution outcomes ───────────────────────────────
        if failed:
            lessons.append(
                f"FAILED improvements: {', '.join(failed)}. "
                f"These must be diagnosed and either fixed or replaced before retry."
            )
            # Find failed items in plan and mark them
            for item in previous_plan:
                eid = str(item.get("id", item.get("name", "")))
                if eid in failed:
                    adjustments.append({
                        **item,
                        "status": "failed",
                        "lesson": f"Failed on execution — requires investigation",
                        "retry_recommended": False,
                    })

        if skipped:
            lessons.append(
                f"SKIPPED improvements: {', '.join(skipped)}. "
                f"Usually indicates a precondition was not met or a dependency failed."
            )
            for item in previous_plan:
                eid = str(item.get("id", item.get("name", "")))
                if eid in skipped:
                    adjustments.append({
                        **item,
                        "status": "skipped",
                        "lesson": "Skipped — precondition not met; re-evaluate preconditions",
                        "retry_recommended": True,
                    })

        # ── Lesson 2: new errors introduced ────────────────────────────────────
        if new_errors:
            lessons.append(
                f"NEW ERRORS introduced: {', '.join(new_errors)}. "
                f"This indicates the change was too aggressive for the current baseline."
            )
            # Defer remaining high-risk items
            for item in previous_plan:
                eid = str(item.get("id", item.get("name", "")))
                risk = str(item.get("risk_after", "medium"))
                if eid not in executed and risk == RISK_HIGH:
                    deferred.append({
                        **item,
                        "status": "deferred",
                        "lesson": f"Deferred due to new errors {new_errors} — safe to retry after baseline heals",
                        "retry_recommended": True,
                    })

        # ── Lesson 3: test_rate regression ────────────────────────────────────
        if test_delta < -0.05:
            lessons.append(
                f"Test pass rate dropped by {test_delta:.1%}. "
                f"Remaining test-related improvements should be paused until coverage recovers."
            )
        elif test_delta > 0.05:
            lessons.append(
                f"Test pass rate improved by {test_delta:.1%}. "
                f"Baseline is strengthening — higher-risk changes become safer now."
            )

        # ── Lesson 4: build status change ─────────────────────────────────────
        if not build_delta and not outcome.get("build_ok", True):
            lessons.append(
                "Build status degraded. All further improvements are blocked "
                "until build is restored. This supersedes all other sequencing."
            )

        # ── Build revised plan ──────────────────────────────────────────────────
        revised: list[dict[str, Any]] = []

        # Keep successful executions in place
        for item in previous_plan:
            eid = str(item.get("id", item.get("name", "")))
            if eid in executed:
                revised.append({
                    **item,
                    "status": "completed",
                    "lesson": "Successfully executed",
                    "retry_recommended": False,
                })

        # Add adjusted failed/skipped items (with retry flag cleared until fixed)
        for adj in adjustments:
            if adj.get("status") == "failed":
                revised.append(adj)  # at end, marked failed
            elif adj.get("status") == "skipped":
                revised.append(adj)

        # Promote deferred safe items that were blocked by failed items
        if not failed and deferred:
            promoted_names = [d.get("name", d.get("id", "?")) for d in deferred]
            lessons.append(
                f"No failures — promoting deferred items: {', '.join(promoted_names)}"
            )
            for d in deferred:
                d["status"] = "promoted"
                d["lesson"] = "Promoted from deferred: no failures observed, risk is now acceptable"
                revised.append(d)

        # Append still-pending low-risk items
        executed_skipped_failed = executed | skipped | failed
        for item in previous_plan:
            eid = str(item.get("id", item.get("name", "")))
            if eid not in executed_skipped_failed and item not in deferred:
                risk = str(item.get("risk_after", "medium"))
                if risk == RISK_LOW:
                    item["status"] = "pending"
                    revised.append(item)
                else:
                    deferred.append({
                        **item,
                        "status": "deferred",
                        "lesson": f"Deferred pending baseline stability (risk={risk})",
                        "retry_recommended": True,
                    })

        # Add deferred items at the end
        revised.extend(deferred)

        # Re-number execution order
        for i, item in enumerate(revised, start=1):
            item["execution_order"] = i

        # ── Record correction in memory ────────────────────────────────────────
        correction_record = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "iteration": current_iteration,
            "previous_plan_summary": [
                {"name": p.get("name", p.get("id", "?")), "order": p.get("execution_order")}
                for p in previous_plan
            ],
            "outcome": outcome,
            "lessons": lessons,
            "revised_plan_summary": [
                {"name": p.get("name", p.get("id", "?")), "status": p.get("status", "?")}
                for p in revised
            ],
        }
        self.correction_history.append(correction_record)

        # Persist lesson to memory.json learnings
        if lessons:
            updated_memory = load_json(MEMORY_FILE)
            learnings = updated_memory.get("learnings", [])
            for lesson in lessons:
                learnings.append({
                    "id": f"lesson-{current_iteration}-{len(learnings)}",
                    "content": lesson,
                    "score": 0.7,
                    "iteration": current_iteration,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "tags": ["self-correction", "reasoning-chain"],
                    "metadata": {"type": "correction_lesson"},
                })
            updated_memory["learnings"] = learnings[-100:]  # keep last 100
            save_json(MEMORY_FILE, updated_memory)

        log(
            f"self_correct: {len(lessons)} lessons, "
            f"revised_plan={len(revised)} items, "
            f"deferred={len(deferred)}, promoted={len(promoted)}"
        )
        return revised

    def explain_reasoning(self) -> str:
        """
        Return a human-readable explanation of the most recent think() chain.

        Returns
        -------
        str
            Multi-line string describing each step and the final conclusion.
            Empty string if ``think()`` has not been called yet.
        """
        if not self.current_steps:
            return (
                "No reasoning chain available. "
                "Call think(goal, context) first, then call explain_reasoning()."
            )

        lines: list[str] = [
            "=" * 70,
            "CHAIN-OF-THOUGHT REASONING CHAIN",
            "=" * 70,
            "",
            f"Goal: {self.current_goal}",
            f"Steps: {len(self.current_steps)}",
            "",
        ]

        for step in self.current_steps:
            lines.append("-" * 70)
            lines.append(f"STEP {step.step_number}  [confidence={step.confidence:.2f}]")
            lines.append("")
            lines.append(f"  OBSERVATION:")
            for frag in _wrap_text(step.observation, width=66):
                lines.append(f"    {frag}")
            lines.append("")
            lines.append(f"  ANALYSIS:")
            for frag in _wrap_text(step.analysis, width=66):
                lines.append(f"    {frag}")
            lines.append("")
            lines.append(f"  INFERENCE:")
            for frag in _wrap_text(step.inference, width=66):
                lines.append(f"    {frag}")
            lines.append("")

        if self.current_result:
            lines.append("=" * 70)
            lines.append("FINAL CONCLUSION")
            lines.append("=" * 70)
            for frag in _wrap_text(self.current_result.conclusion, width=66):
                lines.append(f"  {frag}")
            lines.append("")
            lines.append(f"  Confidence: {self.current_result.confidence:.2f}")
            lines.append(
                f"  Thinking time: {self.current_result.thinking_time_ms:.1f}ms"
            )
            if self.current_result.alternatives:
                lines.append("")
                lines.append("  ALTERNATIVES CONSIDERED:")
                for alt in self.current_result.alternatives:
                    for frag in _wrap_text(alt, width=66):
                        lines.append(f"    - {frag}")

        if self.correction_history:
            last = self.correction_history[-1]
            lines.append("")
            lines.append("=" * 70)
            lines.append("MOST RECENT SELF-CORRECTION")
            lines.append("=" * 70)
            lines.append(f"  Timestamp: {last['ts']}")
            lines.append(f"  Lessons:")
            for lesson in last.get("lessons", []):
                for frag in _wrap_text(lesson, width=66):
                    lines.append(f"    * {frag}")

        lines.append("")
        lines.append("=" * 70)
        return "\n".join(lines)

    # ── introspection ────────────────────────────────────────────────────────────

    def get_plan_history(self) -> list[list[dict[str, Any]]]:
        """Return the stacked history of all plans produced by plan_sequence."""
        return list(self.plan_history)

    def get_correction_history(self) -> list[dict[str, Any]]:
        """Return all self-correction records."""
        return list(self.correction_history)

    def get_current_result(self) -> ReasoningResult | None:
        """Return the ReasoningResult from the most recent think() call."""
        return self.current_result

    def clear_history(self) -> None:
        """Clear plan and correction history.  Useful between independent sessions."""
        self.plan_history.clear()
        self.correction_history.clear()
        log("History cleared.")


# ── text utility ────────────────────────────────────────────────────────────────

def _wrap_text(text: str, width: int = 66) -> list[str]:
    """Simple word-wrap: return *text* as a list of lines ≤ *width* chars."""
    if not text:
        return [""]
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        if not current:
            current = word
        elif len(current) + 1 + len(word) <= width:
            current += " " + word
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines if lines else [""]


# ── self-test (run with: python reasoning_chain.py) ──────────────────────────────

def _self_test() -> bool:
    """Run a minimal smoke-test of all public methods."""
    import io, sys as _sys

    log("Running self-test …")

    # ── Step 1: basic construction ────────────────────────────────────────────
    rc = ReasoningChain(pace_budget_ms=2000)
    assert rc.current_result is None
    assert rc.current_goal is None
    log("  ✓ Construction OK")

    # ── Step 2: think() ────────────────────────────────────────────────────────
    mock_context = {
        "project_state": {
            "build_ok": True,
            "test_pass_rate": 0.85,
            "tech_debt_files": 12,
            "error_patterns": ["auth_race", "memory_leak"],
        },
        "candidate_improvements": [
            {
                "id": "fix-auth-race",
                "name": "Fix authentication race condition",
                "description": "Resolve the cookie refresh race that causes 307 loops",
                "tags": ["bugfix", "auth", "high-risk"],
                "blocked_by": [],
                "enables": ["session-stability"],
                "impact_score": 0.9,
            },
            {
                "id": "add-type-annotations",
                "name": "Add TypeScript annotations to core modules",
                "description": "Improve type coverage across core-cabala and core-astrology",
                "tags": ["types", "foundation"],
                "blocked_by": [],
                "enables": ["fix-auth-race"],
                "impact_score": 0.7,
            },
            {
                "id": "expand-tests",
                "name": "Expand test coverage to 80%",
                "description": "Add integration tests for auth, iching, and botânica",
                "tags": ["tests"],
                "blocked_by": ["fix-auth-race"],
                "enables": [],
                "impact_score": 0.8,
            },
        ],
    }

    result = rc.think(
        goal="Improve project stability and test coverage",
        context=mock_context,
    )

    assert isinstance(result, ReasoningResult)
    assert 3 <= len(result.reasoning_steps) <= 7
    assert 0.0 <= result.confidence <= 1.0
    assert isinstance(result.alternatives, list)
    assert result.thinking_time_ms >= 0
    log(
        f"  ✓ think() OK — steps={len(result.reasoning_steps)}, "
        f"confidence={result.confidence:.2f}, elapsed={result.thinking_time_ms:.1f}ms"
    )

    # ── Step 3: reason_about() ─────────────────────────────────────────────────
    assessment = rc.reason_about(
        improvement=mock_context["candidate_improvements"][0],
        project_state=mock_context["project_state"],
    )
    assert "pros" in assessment
    assert "cons" in assessment
    assert "risk" in assessment
    assert "impact" in assessment
    assert "compound_potential" in assessment
    log(f"  ✓ reason_about() OK — risk={assessment['risk']}, impact={assessment['impact']}")

    # ── Step 4: plan_sequence() ────────────────────────────────────────────────
    plan = rc.plan_sequence(
        improvements=mock_context["candidate_improvements"],
        project_state=mock_context["project_state"],
    )
    assert len(plan) == 3
    assert all("execution_order" in item for item in plan)
    assert all("rationale" in item for item in plan)
    # Topological order: "add-type-annotations" (root, high compound) before "expand-tests" (blocked)
    order_names = [item.get("name", "") for item in plan]
    log(f"  ✓ plan_sequence() OK — order={order_names}")

    # ── Step 5: self_correct() ─────────────────────────────────────────────────
    mock_outcome = {
        "executed": [plan[0].get("id")],
        "skipped": [],
        "failed": [],
        "results": {plan[0].get("id"): {"ok": True}},
        "new_errors": [],
        "test_rate_delta": 0.02,
        "build_ok_delta": False,
    }
    revised = rc.self_correct(previous_plan=plan, outcome=mock_outcome)
    assert isinstance(revised, list)
    assert len(revised) >= 1  # at least the executed item
    log(f"  ✓ self_correct() OK — revised items={len(revised)}")

    # ── Step 6: explain_reasoning() ─────────────────────────────────────────────
    explanation = rc.explain_reasoning()
    assert isinstance(explanation, str)
    assert len(explanation) > 200
    assert "STEP 1" in explanation
    assert "CONCLUSION" in explanation
    log(f"  ✓ explain_reasoning() OK — {len(explanation)} chars")

    # ── Step 7: round-trip serialization ───────────────────────────────────────
    d = result.to_dict()
    restored = ReasoningResult.from_dict(d)
    assert restored.conclusion == result.conclusion
    assert len(restored.reasoning_steps) == len(result.reasoning_steps)
    log("  ✓ Serialization round-trip OK")

    # ── Step 8: Step construction ───────────────────────────────────────────────
    s = Step(step_number=1, observation="test", analysis="test", inference="test", confidence=0.8)
    assert s.to_dict()["step_number"] == 1
    assert s.to_dict()["confidence"] == 0.8
    log("  ✓ Step construction OK")

    # ── Step 9: edge cases ───────────────────────────────────────────────────────
    # Empty improvements
    empty_plan = rc.plan_sequence([], mock_context["project_state"])
    assert empty_plan == []
    log("  ✓ Empty improvements edge-case OK")

    # think() with no candidates
    bare_context = {"project_state": {"build_ok": False, "test_pass_rate": 0.5, "tech_debt_files": 0, "error_patterns": []}}
    bare_result = rc.think(goal="Test bare context", context=bare_context)
    assert bare_result.conclusion.startswith("CONCLUSION")
    log("  ✓ Bare context think() OK")

    # self_correct() with failures
    fail_outcome = {
        "executed": [],
        "skipped": [],
        "failed": [plan[0].get("id")],
        "results": {},
        "new_errors": ["regression_auth"],
        "test_rate_delta": -0.1,
        "build_ok_delta": False,
    }
    fail_revised = rc.self_correct(previous_plan=plan, outcome=fail_outcome)
    assert any(item.get("status") == "failed" for item in fail_revised)
    log("  ✓ Failure self_correct() OK")

    # ── done ─────────────────────────────────────────────────────────────────────
    log("All self-tests passed.")
    return True


if __name__ == "__main__":
    success = _self_test()
    sys.exit(0 if success else 1)
