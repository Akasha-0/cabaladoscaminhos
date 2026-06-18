"""
intelligence.py — Decision engine and learning module for the AKASHA loop.

Responsibilities:
  - Pick the best next task based on evidence (not just feature_list order)
  - Decide when to retry, skip, or escalate
  - Learn from past iterations (memory + exponential context)
  - Synthesize agent results into actionable insights
  - Build the next iteration's plan

Exponential Learning:
  Each iteration's learnings are stored in memory.json.
  Before every loop, we read the last N learnings to inform decisions.
  Over time, the loop "remembers" what worked and what didn't.
"""

import json
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous/multi-agent"
MEMORY_FILE = MA / "memory.json"
SNAPSHOT_FILE = MA / "context_snapshot.json"


# ─── Memory ─────────────────────────────────────────────────────────────────

def load_memory() -> dict:
    """Load or initialize the exponential learning memory."""
    if MEMORY_FILE.exists():
        try:
            return json.loads(MEMORY_FILE.read_text())
        except Exception:
            pass
    return {
        "iteration": 0,
        "learnings": [],         # ordered list of past learnings
        "error_patterns": {},    # error → count
        "success_patterns": {},  # pattern → count
        "task_history": [],      # {feature_id, outcome, iterations_spent}
        "context_window": [],    # last N context summaries
        "decisions": [],         # {ts, snapshot_hash, decision, reasoning}
    }


def save_memory(mem: dict) -> None:
    MEMORY_FILE.write_text(json.dumps(mem, indent=2, ensure_ascii=False))


def add_learning(mem: dict, agent: str, phase: str, feature_id: str,
                outcome: str, summary: str, details: dict = None) -> None:
    """Record a learning from an agent result."""
    learning = {
        "agent": agent,
        "phase": phase,
        "feature_id": feature_id,
        "outcome": outcome,  # "success" | "failure" | "retry" | "skip"
        "summary": summary[:300],
        "details": details or {},
        "ts": datetime.now(timezone.utc).isoformat(),
    }
    mem["learnings"].append(learning)

    # Keep last 200 learnings
    if len(mem["learnings"]) > 200:
        mem["learnings"] = mem["learnings"][-200:]

    # Update pattern counters
    if outcome == "success":
        key = hashlib.md5(f"{phase}:{agent}".encode()).hexdigest()[:8]
        mem["success_patterns"][key] = mem["success_patterns"].get(key, 0) + 1
    elif outcome in ("failure", "retry"):
        key = hashlib.md5(f"{phase}:{feature_id}".encode()).hexdigest()[:8]
        mem["error_patterns"][key] = mem["error_patterns"].get(key, 0) + 1

    # Update task history
    hist_entry = {
        "feature_id": feature_id,
        "outcome": outcome,
        "phase": phase,
        "ts": learning["ts"],
    }
    mem["task_history"].append(hist_entry)
    if len(mem["task_history"]) > 100:
        mem["task_history"] = mem["task_history"][-100:]


def get_recent_learnings(mem: dict, n: int = 10) -> list:
    """Get the N most recent learnings."""
    return mem.get("learnings", [])[-n:]


def get_feature_history(mem: dict, feature_id: str) -> list:
    """Get all learnings for a specific feature."""
    return [l for l in mem.get("learnings", []) if l.get("feature_id") == feature_id]


# ─── Task prioritization ─────────────────────────────────────────────────────

def pick_next_task(features: dict, memory: dict, snapshot: dict) -> Optional[dict]:
    """
    Pick the best next task based on EVIDENCE, not just list order.

    Priority factors (in order):
      1. Blocked features (dependencies resolved)
      2. Features already attempted (don't retry failed twice without changes)
      3. Phase ordering (respect feature phase ordering)
      4. Error patterns (avoid features that consistently fail)
      5. Triad health (don't start hard features if triad is red)
    """
    pending = features.get("top_pending", [])
    if not pending:
        return None

    triad = snapshot.get("triad", {})
    triad_green = all(t.get("pass", False) for t in triad.values() if isinstance(t, dict))
    error_patterns = memory.get("error_patterns", {})

    # Score each pending feature
    scored = []
    for f in pending:
        fid = f.get("id", "?")
        phase = f.get("phase", "?")
        title = f.get("title", "")

        # Get feature history
        history = get_feature_history(memory, fid)
        attempts = len(history)

        # Count recent errors for this feature
        recent_errors = sum(1 for h in history[-3:] if h.get("outcome") in ("failure", "retry"))

        # Skip if consistently failing (3+ recent errors)
        if recent_errors >= 3:
            continue

        # Down-prioritize if attempts > 2
        if attempts > 2 and recent_errors > 0:
            continue

        # Phase ordering: pick lowest phase number
        score = 1000 - (int(phase) if phase.isdigit() else 5) * 10
        score -= recent_errors * 50  # penalize recent failures
        score -= attempts * 5         # slight penalty for repeated attempts

        scored.append((score, f))

    if not scored:
        # Fallback: pick least-attempted
        for f in pending:
            history = get_feature_history(memory, f.get("id", "?"))
            if not history:
                return f
        return pending[0] if pending else None

    # Pick highest score
    scored.sort(reverse=True)
    return scored[0][1]


# ─── Decision engine ─────────────────────────────────────────────────────────

def should_proceed(snapshot: dict, memory: dict) -> tuple[bool, str]:
    """
    Decide whether to proceed with the loop or take corrective action first.
    Returns (proceed: bool, reason: str).
    """
    factors = snapshot.get("decision_factors", {})
    triad = snapshot.get("triad", {})
    cg = snapshot.get("codegraph", {})
    git = snapshot.get("git", {})

    # Critical: triad must be green to start new work
    triad_failing = [k for k, v in triad.items() if isinstance(v, dict) and not v.get("pass", False)]
    if triad_failing:
        return False, f"Triad failing: {triad_failing}. Fix before new work."

    # High: codegraph needs sync
    if cg.get("needs_sync"):
        return False, "CodeGraph index has pending changes. Run: codegraph sync"

    # Medium: warn if many git changes, but don't block (pre-existing changes ≠ lost work)
    # Only block if > 50 uncommitted files — risk of losing significant work
    total = git.get("total", 0)
    if total > 50:
        return False, f"Working tree has {total} changed files (>50 threshold). Commit or reset."

    # Check if there are pending features
    if not factors.get("has_pending_features"):
        return False, "No pending features. Project is current."

    return True, "Ready to proceed"


def decide_next_phase(snapshot: dict, memory: dict, current_phase: str) -> str:
    """
    Given current phase and snapshot evidence, decide the next phase.
    """
    # If there was a recent failure, retry implementation
    recent = get_recent_learnings(memory, n=5)
    if recent:
        last = recent[-1]
        if last.get("outcome") in ("failure", "retry") and current_phase in ("QA", "VALIDATION"):
            return "IMPLEMENTATION"

    # Normal flow
    phases = ["RESEARCH", "PLANNING", "IMPLEMENTATION", "QA", "VALIDATION", "RELEASE"]
    if current_phase not in phases:
        return "RESEARCH"
    idx = phases.index(current_phase)
    return phases[(idx + 1) % len(phases)]


def make_decision(snapshot: dict, memory: dict, current_phase: str) -> dict:
    """
    Main decision function. Analyzes everything and returns a decision dict:
      {action, feature, reasoning, confidence, next_phase}
    """
    factors = snapshot.get("decision_factors", {})
    features = snapshot.get("features", {})
    plans = snapshot.get("plans", {})
    triad = snapshot.get("triad", {})
    recent = get_recent_learnings(memory, n=5)

    decision = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "current_phase": current_phase,
        "action": None,
        "feature": None,
        "reasoning": [],
        "confidence": "high",
        "next_phase": None,
    }

    # Step 1: Should we proceed?
    proceed, reason = should_proceed(snapshot, memory)
    decision["reasoning"].append(reason)

    if not proceed:
        decision["action"] = "BLOCKED"
        decision["blocking_reason"] = reason
        decision["confidence"] = "high"
        decision["next_phase"] = current_phase
        return decision

    # Step 2: Pick next feature
    feature = pick_next_task(features, memory, snapshot)
    if not feature:
        decision["action"] = "IDLE"
        decision["reasoning"].append("No suitable pending feature found")
        decision["confidence"] = "high"
        decision["next_phase"] = "RELEASE"
        return decision

    decision["feature"] = feature
    decision["action"] = "EXECUTE"

    # Step 3: Determine next phase
    decision["next_phase"] = decide_next_phase(snapshot, memory, current_phase)

    # Step 4: Set confidence
    recent_failures = sum(1 for l in recent if l.get("outcome") in ("failure", "retry"))
    if recent_failures >= 2:
        decision["confidence"] = "low"
        decision["reasoning"].append(f"Warning: {recent_failures} recent failures — review carefully")
    elif recent_failures == 0:
        decision["confidence"] = "high"
        decision["reasoning"].append("No recent failures — high confidence")

    return decision


# ─── Result synthesis ────────────────────────────────────────────────────────

def synthesize_agent_results(results: dict, feature: dict,
                            memory: dict) -> dict:
    """
    Take all agent results, extract key findings, update memory,
    and return a synthesis dict.
    """
    synthesis = {
        "feature": feature.get("id", "?"),
        "total_findings": 0,
        "files_changed": [],
        "tests_added": 0,
        "tokens_saved": 0,
        "errors": [],
        "key_insight": "",
    }

    for agent, result in results.items():
        status = result.get("status", "?")
        summary = result.get("summary", "")
        findings = result.get("findings", [])
        files = result.get("files_changed", [])
        tokens = result.get("tokens_saved", 0)

        synthesis["total_findings"] += len(findings)
        synthesis["files_changed"].extend(files)
        synthesis["tokens_saved"] += tokens

        if status == "error":
            synthesis["errors"].append(f"[{agent}] {summary}")
            add_learning(memory, agent, "EXECUTE",
                         feature.get("id", "?"), "failure", summary)
        else:
            add_learning(memory, agent, "EXECUTE",
                         feature.get("id", "?"), "success", summary[:200],
                         {"findings": len(findings), "files": len(files)})

    # Key insight: most significant finding
    if results:
        for agent, result in results.items():
            if result.get("key_insight"):
                synthesis["key_insight"] = result["key_insight"]
                break

    return synthesis


# ─── Context window (exponential learning) ───────────────────────────────────

def update_context_window(mem: dict, snapshot: dict, decision: dict,
                         synthesis: dict = None) -> None:
    """
    Add current iteration's context to the sliding window.
    This is the 'exponential learning' — each iteration's context informs the next.
    """
    entry = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "decision": decision.get("action", "?"),
        "feature": decision.get("feature", {}).get("id", "?"),
        "confidence": decision.get("confidence", "?"),
        "next_phase": decision.get("next_phase", "?"),
        "triad_green": all(
            t.get("pass", False)
            for t in snapshot.get("triad", {}).values()
            if isinstance(t, dict)
        ),
    }
    if synthesis:
        entry["synthesis"] = {
            "findings": synthesis.get("total_findings", 0),
            "files": len(synthesis.get("files_changed", [])),
            "errors": len(synthesis.get("errors", [])),
        }

    mem["context_window"].append(entry)
    if len(mem["context_window"]) > 20:
        mem["context_window"] = mem["context_window"][-20:]

    mem["iteration"] = mem.get("iteration", 0) + 1


# ─── Print helpers ───────────────────────────────────────────────────────────

def format_memory_summary(mem: dict) -> str:
    """Format memory for display."""
    recent = get_recent_learnings(mem, n=5)
    lines = [
        f"  Iteration:    {mem.get('iteration', 0)}",
        f"  Learnings:    {len(mem.get('learnings', []))} total",
        f"  Task history: {len(mem.get('task_history', []))} total",
        f"  Context window: {len(mem.get('context_window', []))} entries",
    ]
    if recent:
        lines.append("  Last 5 learnings:")
        for l in recent:
            outcome_mark = "✅" if l.get("outcome") == "success" else "❌"
            lines.append(f"    {outcome_mark} [{l.get('agent', '?')}] {l.get('summary', '')[:80]}")
    return "\n".join(lines)


if __name__ == "__main__":
    # Test the intelligence module
    import sys
    sys.path.insert(0, str(Path(__file__).parent))

    from context_bootstrap import build_snapshot, save_snapshot, load_snapshot

    snapshot = load_snapshot()
    if not snapshot:
        print("No snapshot found. Run context_bootstrap.py first.")
    else:
        mem = load_memory()
        decision = make_decision(snapshot, mem, "RESEARCH")
        print(f"Decision: {json.dumps(decision, indent=2)}")
