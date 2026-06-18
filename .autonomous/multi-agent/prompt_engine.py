"""
PromptEngineV2 — fast, self-improving prompt engine for autonomous agents.

Area-specific templates, learning injection, and outcome tracking.
Target: <5ms build(), pre-loaded templates, thread-safe, self-contained.
"""

from __future__ import annotations

import json
import time
import threading
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent if '__file__' in globals() else Path.cwd()

__all__ = ["PromptEngineV2"]


# ---------------------------------------------------------------------------
# Template definitions (pre-loaded, no file I/O at query time)
# ---------------------------------------------------------------------------

AREA_TEMPLATES = {
    "typecheck": {
        "goal": "Fix TypeScript type errors",
        "hint": "Run `pnpm typecheck` first. Focus on: missing types, import conflicts, type mismatches.",
        "improvements": ["missing_types", "import_conflicts", "type_mismatches", "unused_types"],
        "anti_patterns": ["skip_tsc", "any_type_abuse"],
    },
    "tests": {
        "goal": "Add or improve tests",
        "hint": "Run existing tests first. Look for untested edge cases and error paths.",
        "improvements": ["missing_tests", "edge_cases", "error_handling", "coverage_gaps"],
        "anti_patterns": ["skip_tests", "mock_everything"],
    },
    "tech_debt": {
        "goal": "Reduce technical debt",
        "hint": "Focus on: code duplication, long functions, unclear naming, missing docs.",
        "improvements": ["duplication", "long_functions", "naming", "missing_docs"],
        "anti_patterns": ["over_engineering", "premature_optimization"],
    },
    "performance": {
        "goal": "Improve performance",
        "hint": "Profile first. Focus on: N+1 queries, missing indexes, expensive renders.",
        "improvements": ["slow_query", "expensive_render", "missing_cache", "bundle_size"],
        "anti_patterns": ["premature_optimization", "over_caching"],
    },
    "security": {
        "goal": "Improve security",
        "hint": "Check: injection risks, auth bypass, sensitive data exposure, dependency vulnerabilities.",
        "improvements": ["injection_risk", "auth_bypass", "data_exposure", "dep_vulns"],
        "anti_patterns": ["security_through_obscurity", "hardcoded_secrets"],
    },
    "ui": {
        "goal": "Improve UI/UX",
        "hint": "Focus on: accessibility, responsiveness, visual hierarchy, interaction feedback.",
        "improvements": ["a11y", "responsive", "visual_feedback", "loading_states"],
        "anti_patterns": ["over_designing", "ignoring_mobile"],
    },
    "general": {
        "goal": "General improvements",
        "hint": "Focus on high-impact, low-risk changes. Prefer refactoring over adding features.",
        "improvements": ["refactor", "docs", "cleanup", "small_fixes"],
        "anti_patterns": [],
    },
}

IMPROVEMENT_PROMPTS = {
    "missing_types": "Add proper TypeScript types. Use explicit interfaces for complex objects. Avoid `any`.",
    "import_conflicts": "Resolve import naming conflicts. Use aliased imports or rename local declarations.",
    "type_mismatches": "Fix type mismatches. Ensure compatible types on both sides of assignments.",
    "type_mismatches": "Fix type mismatches. Ensure compatible types on both sides of assignments.",
    "missing_tests": "Add tests for the changed code. Cover happy path and at least one edge case.",
    "edge_cases": "Add tests for boundary conditions, empty inputs, null values, and overflow.",
    "error_handling": "Improve error handling. Add try/catch where missing, validate inputs, return meaningful errors.",
    "coverage_gaps": "Identify untested branches and add coverage for those paths.",
    "duplication": "Extract repeated code into shared helpers or utilities. DRY principle.",
    "long_functions": "Break functions > 50 lines into smaller, focused functions.",
    "naming": "Rename variables and functions for clarity. Names should reveal intent.",
    "missing_docs": "Add JSDoc comments to public APIs and complex logic.",
    "slow_query": "Optimize the database query. Add indexes or rewrite to avoid full scans.",
    "expensive_render": "Reduce unnecessary re-renders. Memoize expensive computations.",
    "missing_cache": "Add caching for repeated expensive operations. Use memoization or Redis.",
    "bundle_size": "Reduce bundle size. Tree-shake unused code, lazy-load routes, split chunks.",
    "injection_risk": "Sanitize user input to prevent injection attacks. Use parameterized queries.",
    "auth_bypass": "Verify all auth checks are in place. Ensure endpoints are protected.",
    "data_exposure": "Ensure sensitive data is not logged or exposed in responses.",
    "dep_vulns": "Audit dependencies for known vulnerabilities. Update or replace risky packages.",
    "a11y": "Add ARIA labels, keyboard navigation, and proper contrast ratios.",
    "responsive": "Ensure layout works on mobile, tablet, and desktop.",
    "visual_feedback": "Add loading spinners, success toasts, and error messages for user actions.",
    "loading_states": "Add skeleton loaders or spinners for async content.",
    "refactor": "Refactor for clarity and maintainability. Keep the behavior exactly the same.",
    "docs": "Improve inline documentation and code comments.",
    "cleanup": "Remove dead code, unused imports, and temporary workarounds.",
    "small_fixes": "Fix typos, formatting, and minor code smells.",
}

SYSTEM_TEMPLATE = """You are an expert Akasha project engineer.

# GOAL
{goal}

# AREA HINTS
{hints}

# PROJECT CONTEXT
{context}

# LEARNINGS FROM PREVIOUS ITERATIONS
{learnings}

# RECENT DECISIONS
{decisions}

## IMPROVEMENT TYPES
{improvement_guide}

## INSTRUCTION
You are working on iteration {iteration} of an autonomous improvement loop.
Analyze the codebase, identify the best improvement to make, implement it,
and verify with `pnpm typecheck` and `pnpm test`.

If you find nothing to improve, respond: NO_OP

IMPORTANT:
- Run `pnpm typecheck` after any code change
- Keep changes minimal and focused
- Prefer fixing existing code over adding new code
- Do NOT use `any` type in TypeScript
- Commit your changes with a descriptive message
"""


# ---------------------------------------------------------------------------
# PromptEngineV2
# ---------------------------------------------------------------------------

class PromptEngineV2:
    """
    Fast, self-improving prompt engine.

    Templates are pre-loaded at __init__; no file I/O during build().
    Outcome tracking drives suggest_next_improvement() and get_best_prompt().
    """

    AREA_TEMPLATES = AREA_TEMPLATES
    IMPROVEMENT_PROMPTS = IMPROVEMENT_PROMPTS

    def __init__(self, ma_path: Path | None = None, memory=None) -> None:
        self._root = Path(__file__).resolve().parent.parent if '__file__' in globals() else Path.cwd()
        self._ma = (ma_path or self._root / ".autonomous" / "multi-agent")
        self._outcomes_file = self._ma / "prompt_engine_v2_outcomes.json"
        self._lock = threading.RLock()
        self._memory = memory  # optional memory backend for learning injection

        self._outcomes: dict[str, list[dict]] = {}
        self._load_outcomes()
        self._log(f"PromptEngineV2 ready — {len(self._outcomes)} outcome keys loaded")

    # -----------------------------------------------------------------------
    # Core builder
    # -----------------------------------------------------------------------

    def build(
        self,
        area: str,
        goal: str,
        context: str,
        learnings: list | None = None,
        decisions: list | None = None,
        iteration: int = 0,
    ) -> str:
        """Build full agent prompt for the given area and goal."""
        template = self.AREA_TEMPLATES.get(area, self.AREA_TEMPLATES["general"])

        # Build improvements guide (top 4)
        improvements = template.get("improvements", [])
        imp_guide_lines = []
        for imp in improvements[:4]:
            imp_guide_lines.append(f"- {imp}: {self.IMPROVEMENT_PROMPTS.get(imp, imp)}")
        improvement_guide = "\n".join(imp_guide_lines)

        # Format learnings
        if learnings:
            formatted = [f"  • {l}" for l in learnings[:5]]
            learnings_text = "\n".join(formatted)
        else:
            learnings_text = "No previous learnings for this area."

        # Format decisions
        if decisions:
            formatted = [f"  • {d}" for d in decisions[-5:]]
            decisions_text = "\n".join(formatted)
        else:
            decisions_text = "No recent decisions."

        # Area hint banner
        hints = template.get("hint", "")
        hints_banner = f"[{area.upper()}] {hints}"

        return SYSTEM_TEMPLATE.format(
            goal=goal,
            hints=hints_banner,
            context=context,
            learnings=learnings_text,
            decisions=decisions_text,
            improvement_guide=improvement_guide,
            iteration=iteration,
        )

    def build_improvement_prompt(
        self,
        improvement_type: str,
        area: str,
        context: str | None = None,
    ) -> str:
        """Build a focused prompt for a specific improvement type."""
        imp_text = self.IMPROVEMENT_PROMPTS.get(improvement_type, improvement_type)
        template = self.AREA_TEMPLATES.get(area, self.AREA_TEMPLATES["general"])

        prompt_lines = [
            f"You are improving [{area.upper()}] with focus on: {improvement_type}",
            "",
            f"# Improvement guidance",
            imp_text,
            "",
            "# Area hints",
            template.get("hint", ""),
            "",
        ]

        if context:
            prompt_lines.extend(["# Context", context, ""])

        prompt_lines.extend([
            "Implement the improvement, then run `pnpm typecheck` and `pnpm test`.",
            "Commit with a descriptive message.",
        ])

        return "\n".join(prompt_lines)

    def suggest_next_improvement(
        self,
        area: str,
        recent_improvements: list[str],
    ) -> str:
        """Suggest next improvement based on area templates and recent history."""
        template = self.AREA_TEMPLATES.get(area, self.AREA_TEMPLATES["general"])
        improvements = template.get("improvements", [])

        # Avoid recently tried improvements (last 5)
        recent_set = set(recent_improvements[-5:])
        candidates = [i for i in improvements if i not in recent_set]

        if candidates:
            # Pick first available candidate
            return candidates[0]

        # Fallback: cycle back if everything was recently tried
        return improvements[0] if improvements else "refactor"

    # -----------------------------------------------------------------------
    # Outcome tracking
    # -----------------------------------------------------------------------

    def record_outcome(
        self,
        area: str,
        improvement: str,
        files_changed: int,
        qa_passed: bool,
    ) -> None:
        """Record that a prompt variation led to an outcome for self-improvement."""
        key = f"{area}:{improvement}"
        outcome: dict = {
            "files_changed": files_changed,
            "qa_passed": qa_passed,
            "ts": time.time(),
        }
        with self._lock:
            if key not in self._outcomes:
                self._outcomes[key] = []
            self._outcomes[key].append(outcome)
            # Keep only last 50 outcomes per key
            self._outcomes[key] = self._outcomes[key][-50:]
        self._save_outcomes()

    def get_best_prompt(self, area: str, improvement: str) -> str | None:
        """Return improvement with highest success rate (>50%), or None."""
        key = f"{area}:{improvement}"
        with self._lock:
            outcomes = list(self._outcomes.get(key, []))

        if not outcomes:
            return None

        success_rate = sum(1 for o in outcomes if o["qa_passed"]) / len(outcomes)
        if success_rate > 0.5:
            return improvement
        return None

    def get_success_rate(self, area: str, improvement: str) -> float | None:
        """Return success rate (0.0–1.0) for a given area:improvement key."""
        key = f"{area}:{improvement}"
        with self._lock:
            outcomes = list(self._outcomes.get(key, []))
        if not outcomes:
            return None
        return sum(1 for o in outcomes if o["qa_passed"]) / len(outcomes)

    # -----------------------------------------------------------------------
    # Persistence
    # -----------------------------------------------------------------------

    def _save_outcomes(self) -> None:
        """Write outcomes to disk (thread-safe)."""
        with self._lock:
            data = self._outcomes
        try:
            self._outcomes_file.parent.mkdir(parents=True, exist_ok=True)
            tmp = self._outcomes_file.with_suffix(".tmp")
            tmp.write_text(json.dumps(data, indent=2), encoding="utf-8")
            tmp.replace(self._outcomes_file)
        except OSError as e:
            self._log(f"[WARN] _save_outcomes failed: {e}")

    def _load_outcomes(self) -> None:
        """Load outcomes from disk (idempotent)."""
        if not self._outcomes_file.exists():
            return
        try:
            data = json.loads(self._outcomes_file.read_text(encoding="utf-8"))
            with self._lock:
                self._outcomes = data
        except (OSError, json.JSONDecodeError) as e:
            self._log(f"[WARN] _load_outcomes failed: {e}")
            self._outcomes = {}

    # -----------------------------------------------------------------------
    # Logging
    # -----------------------------------------------------------------------

    @staticmethod
    def _log(msg: str) -> None:
        ts = time.strftime("%H:%M:%S")
        print(f"[PromptEngineV2 {ts}] {msg}")


# ---------------------------------------------------------------------------
# Self-test
# ---------------------------------------------------------------------------

def _test() -> None:
    """Verify all public methods work end-to-end."""
    pe = PromptEngineV2()

    # build()
    prompt = pe.build(
        area="typecheck",
        goal="Fix all type errors in src/",
        context="src/utils/helper.ts has type issues",
        learnings=["Use explicit interfaces for complex objects"],
        decisions=["Decided to avoid `any` type globally"],
    )
    assert "typecheck" in prompt.lower() or "TYPE" in prompt
    assert "src/utils/helper.ts" in prompt
    assert "explicit interfaces" in prompt
    print("✓ build()")

    # build_improvement_prompt()
    imp_prompt = pe.build_improvement_prompt("missing_types", "typecheck")
    assert "missing_types" in imp_prompt
    assert "typecheck" in imp_prompt
    print("✓ build_improvement_prompt()")

    # suggest_next_improvement()
    next_imp = pe.suggest_next_improvement("typecheck", recent_improvements=[])
    assert next_imp in AREA_TEMPLATES["typecheck"]["improvements"]
    print(f"✓ suggest_next_improvement() → {next_imp}")

    # Avoid recently tried improvements
    recent = ["missing_types", "import_conflicts", "type_mismatches"]
    next_imp2 = pe.suggest_next_improvement("typecheck", recent_improvements=recent)
    assert next_imp2 not in recent
    print(f"✓ suggest_next_improvement() avoids recent → {next_imp2}")

    # record_outcome() + get_best_prompt()
    pe.record_outcome("typecheck", "missing_types", files_changed=3, qa_passed=True)
    pe.record_outcome("typecheck", "missing_types", files_changed=2, qa_passed=False)
    pe.record_outcome("typecheck", "missing_types", files_changed=4, qa_passed=True)
    best = pe.get_best_prompt("typecheck", "missing_types")
    # 2/3 passed = 66% > 50% → should return improvement
    assert best == "missing_types", f"expected missing_types, got {best}"
    print("✓ record_outcome() + get_best_prompt()")

    # get_success_rate()
    rate = pe.get_success_rate("typecheck", "missing_types")
    assert rate is not None and 0.0 <= rate <= 1.0
    print(f"✓ get_success_rate() → {rate:.2f}")

    # Non-existent key
    assert pe.get_best_prompt("security", "auth_bypass") is None
    assert pe.get_success_rate("security", "auth_bypass") is None
    print("✓ get_best_prompt() returns None for unknown keys")

    print("\n[PromptEngineV2] All tests passed ✓")


if __name__ == "__main__":
    _test()
