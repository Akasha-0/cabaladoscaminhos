"""
prompt_engine.py — Advanced prompt engineering for autonomous agent instructions.

Builds highly-instructed, token-efficient prompts for each agent by combining:
- Area-specific templates (UI, API, Database, Auth, Tests, Build, Docs, Grimoire)
- Project vision & constraints from SPEC.md / DECISIONS.md
- Relevant learnings from memory.json
- Relevant architectural decisions from memory.json
- Improvement context injected per-task

Template variables: {AREA}, {IMPROVEMENT}, {VISION}, {CONSTRAINTS},
                   {LEARNINGS}, {DECISIONS}, {CONTEXT}
"""

from __future__ import annotations

import hashlib
import json as _json
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ── path constants ─────────────────────────────────────────────────────────────

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous/multi-agent"

MEMORY_FILE = MA / "memory.json"
DECISIONS_FILE = ROOT / "DECISIONS.md"
SPEC_FILE = ROOT / "SPEC.md"

# ── low-level JSON helpers ────────────────────────────────────────────────────

def load_json(path: Path) -> dict[str, Any]:
    """Load JSON from *path*, return {} on any error."""
    try:
        return _json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_json(path: Path, data: dict[str, Any]) -> None:
    """Atomically write *data* to *path* via rename."""
    tmp = path.with_suffix(".tmp")
    tmp.write_text(_json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.replace(path)


# ── log helper ────────────────────────────────────────────────────────────────

def log(msg: str) -> None:
    """Print *msg* with ISO timestamp prefix."""
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"[{ts}] PromptEngine: {msg}", flush=True)


# ── token helpers ─────────────────────────────────────────────────────────────

def _estimate_tokens(text: str) -> int:
    """Rough token estimate: ~4 chars per token."""
    return max(1, len(text) // 4)


def _truncate(text: str, max_chars: int) -> str:
    """Truncate to *max_chars* with ellipsis marker."""
    if len(text) <= max_chars:
        return text
    return text[: max(max_chars - 3, 0)] + "…"


# ── memory / decisions readers ────────────────────────────────────────────────

def _load_memory() -> dict[str, Any]:
    return load_json(MEMORY_FILE)


def _load_learnings(area: str = "", limit: int = 5) -> list[dict]:
    """Pull recent learnings from memory.json, optionally filtered by area."""
    mem = _load_memory()
    learnings = mem.get("learnings", [])
    if area:
        area_lower = area.lower()
        learnings = [
            l for l in learnings
            if area_lower in str(l.get("area", "")).lower()
            or area_lower in str(l.get("tags", [])).lower()
        ]
    by_time = sorted(learnings, key=lambda l: l.get("timestamp", 0), reverse=True)
    return by_time[:limit]


def _load_decisions(area: str = "", limit: int = 5) -> list[dict]:
    """Pull recent decisions from memory.json, optionally filtered by area."""
    mem = _load_memory()
    entries = mem.get("learnings", [])
    decisions = [e for e in entries if e.get("is_decision") or e.get("type") == "decision"]
    if area:
        area_lower = area.lower()
        decisions = [
            d for d in decisions
            if area_lower in str(d.get("area", "")).lower()
            or area_lower in str(d.get("tags", [])).lower()
        ]
    by_time = sorted(decisions, key=lambda d: d.get("timestamp", 0), reverse=True)
    return decisions[:limit]


def _load_vision_constraints() -> tuple[str, str]:
    """Extract vision and constraints from SPEC.md."""
    try:
        text = SPEC_FILE.read_text(encoding="utf-8")
    except Exception:
        return "", ""
    vision_match = re.search(r"(?i)#*\s*Vision[:\s]*(.+?)(?=\n#|\Z)", text, re.DOTALL)
    constraints_match = re.search(r"(?i)#*\s*Constraints[:\s]*(.+?)(?=\n#|\Z)", text, re.DOTALL)
    vision = (vision_match.group(1).strip() if vision_match else "")[:500]
    constraints = (constraints_match.group(1).strip() if constraints_match else "")[:500]
    return vision, constraints


def _format_learnings(learnings: list[dict]) -> str:
    """Render learnings as a readable bullet list."""
    if not learnings:
        return "No relevant learnings found."
    lines = []
    for i, l in enumerate(learnings, 1):
        agent = l.get("agent", "?")
        phase = l.get("phase", "?")
        outcome = l.get("outcome", l.get("summary", ""))
        lines.append(f"{i}. [{agent}/{phase}] {outcome}")
    return "\n".join(lines)


def _format_decisions(decisions: list[dict]) -> str:
    """Render decisions as a readable bullet list."""
    if not decisions:
        return "No relevant decisions found."
    lines = []
    for i, d in enumerate(decisions, 1):
        area = d.get("area", "?")
        summary = d.get("summary", d.get("outcome", ""))
        lines.append(f"{i}. [{area}] {summary}")
    return "\n".join(lines)


def _format_improvement(imp: dict[str, Any]) -> str:
    """Render an improvement dict as readable text."""
    parts = []
    if imp.get("id"):
        parts.append(f"**ID**: {imp['id']}")
    if imp.get("task"):
        parts.append(f"**Task**: {imp['task']}")
    if imp.get("description"):
        parts.append(f"**Description**: {imp['description']}")
    if imp.get("acceptance_criteria"):
        criteria = imp["acceptance_criteria"]
        if isinstance(criteria, list):
            parts.append("**Acceptance Criteria**:")
            for c in criteria:
                parts.append(f"  - {c}")
        else:
            parts.append(f"**Acceptance Criteria**: {criteria}")
    if imp.get("priority"):
        parts.append(f"**Priority**: {imp['priority']}")
    if imp.get("area"):
        parts.append(f"**Area**: {imp['area']}")
    return "\n".join(parts) if parts else str(imp)


def _format_context(ctx: dict[str, Any]) -> str:
    """Render a context dict as readable text."""
    if not ctx:
        return "No additional context."
    lines = []
    for key, val in ctx.items():
        if isinstance(val, list):
            lines.append(f"**{key}**:")
            for v in val:
                lines.append(f"  - {v}")
        elif isinstance(val, dict):
            lines.append(f"**{key}**: {_json.dumps(val)}")
        else:
            lines.append(f"**{key}**: {val}")
    return "\n".join(lines)


# ── area-specific templates ────────────────────────────────────────────────────

# Template variables: {AREA}, {IMPROVEMENT}, {VISION}, {CONSTRAINTS},
#                    {LEARNINGS}, {DECISIONS}, {CONTEXT}

_UI_TEMPLATE = """\
## Role: UI/Design Specialist

You are the UI/Design specialist for the Akasha project. Your craft is
transforming requirements into elegant, accessible, performant user interfaces.

## Context
{CONTEXT}

## Current Improvement Focus
{IMPROVEMENT}

## Vision
{VISION}

## Constraints
{CONSTRAINTS}

## Past Learnings (what worked / didn't)
{LEARNINGS}

## Architectural Decisions to Respect
{DECISIONS}

## Your Mandate

1. **Component Design**: Build composable, accessible components (ARIA labels,
   keyboard nav, focus management) and responsive at all breakpoints.
2. **Design System**: Follow the project's design tokens and component
   conventions. No ad-hoc styling.
3. **Performance**: Keep render paths lean. Prefer Server Components;
   add "use client" only when strictly necessary.
4. **Integration**: Wire UI to data via the defined API contracts.
   Do not invent new API surface.
5. **Testing**: Unit-test critical component logic and accessibility
   assertions for key components.

## Output Format

Produce or update for each change:
- Component file(s) with full TypeScript types
- Corresponding test file(s)
- Any necessary design-token additions

## Quality Bar

- Zero TypeScript errors
- Accessibility audit pass (keyboard nav, ARIA, contrast)
- No layout shift on dynamic content
- Responsive at all breakpoints

---
{AREA}
""".strip()

_API_TEMPLATE = """\
## Role: API/Logic Specialist

You are the API/Logic specialist for the Akasha project. Your craft is
building robust, type-safe, well-documented backend logic and API surfaces.

## Context
{CONTEXT}

## Current Improvement Focus
{IMPROVEMENT}

## Vision
{VISION}

## Constraints
{CONSTRAINTS}

## Past Learnings (what worked / didn't)
{LEARNINGS}

## Architectural Decisions to Respect
{DECISIONS}

## Your Mandate

1. **Type Safety**: Define Zod/Drizzle schemas; validate at API boundaries.
   Never trust raw unvalidated input.
2. **Error Handling**: Map domain errors to typed error codes.
   Never leak internal stack traces to clients.
3. **API Contracts**: Follow REST/GraphQL conventions used in the project.
   Document request/response shapes explicitly.
4. **Idempotency**: Mutations must be safe to retry.
5. **Observability**: Log at decision points; emit structured metrics.

## Output Format

Produce or update for each change:
- API route / service file
- Input validation schema
- Error type definitions
- Unit tests for the core logic

## Quality Bar

- Zero TypeScript errors
- All input paths validated against schema
- Error paths exercised in tests
- No hard-coded secrets or env var names in source

---
{AREA}
""".strip()

_DATABASE_TEMPLATE = """\
## Role: Database Specialist

You are the Database specialist for the Akasha project. Your craft is
schema design, query optimization, and safe migrations with Drizzle ORM.

## Context
{CONTEXT}

## Current Improvement Focus
{IMPROVEMENT}

## Vision
{VISION}

## Constraints
{CONSTRAINTS}

## Past Learnings (what worked / didn't)
{LEARNINGS}

## Architectural Decisions to Respect
{DECISIONS}

## Your Mandate

1. **Schema First**: Define migrations before touching application code.
   Use Drizzle's migration tooling.
2. **Indexes**: Add indexes for every foreign key and high-cardinality filter.
3. **Soft Deletes**: Prefer soft deletes for audit-critical tables.
4. **Transactions**: Wrap multi-step writes in transactions; fail atomically.
5. **Query Safety**: Parameterize all queries. Never interpolate user input.

## Output Format

Produce or update:
- Migration file(s) under the migrations directory
- Drizzle schema definitions
- Query helper functions (if any)
- Tests that exercise the migration

## Quality Bar

- Migration is reversible (up + down)
- No data loss on migration
- Indexes present for FKs and filtered columns
- Query helpers are tested against a test DB

---
{AREA}
""".strip()

_AUTH_TEMPLATE = """\
## Role: Auth Specialist

You are the Auth specialist for the Akasha project. Your craft is
secure authentication and authorization implementation.

## Context
{CONTEXT}

## Current Improvement Focus
{IMPROVEMENT}

## Vision
{VISION}

## Constraints
{CONSTRAINTS}

## Past Learnings (what worked / didn't)
{LEARNINGS}

## Architectural Decisions to Respect
{DECISIONS}

## Your Mandate

1. **Secure by Default**: Use established auth patterns (Clerk/Auth.js).
   Never roll your own crypto.
2. **Session Management**: Sessions must be short-lived, HTTP-only, SameSite.
   Refresh tokens rotate correctly.
3. **Authorization**: Enforce RBAC/ABAC at the route/field level.
   Default-deny; explicit-allow.
4. **Token Handling**: Access tokens never reach long-term storage.
   Refresh token rotation is mandatory.
5. **Audit Trail**: Auth events (login, logout, failure, privilege change)
   are logged with IP and timestamp.

## Output Format

Produce or update:
- Auth configuration and middleware
- Route guards / session utilities
- Unit/integration tests for auth flows
- Documentation of the auth model

## Quality Bar

- No auth bypass paths
- Tokens expire and rotate correctly
- Failed auth attempts are rate-limited and logged
- All protected routes fail 401 without a valid session

---
{AREA}
""".strip()

_TESTS_TEMPLATE = """\
## Role: Tests/QA Specialist

You are the Tests/QA specialist for the Akasha project. Your craft is
writing meaningful tests that catch real bugs and document expected behavior.

## Context
{CONTEXT}

## Current Improvement Focus
{IMPROVEMENT}

## Vision
{VISION}

## Constraints
{CONSTRAINTS}

## Past Learnings (what worked / didn't)
{LEARNINGS}

## Architectural Decisions to Respect
{DECISIONS}

## Your Mandate

1. **Test Behavior, Not Plumbing**: Assert observable outcomes, not
   implementation details. Tests should survive refactors.
2. **Arrange-Act-Assert**: Structure each test with clear AAA comments
   or blank-line separation.
3. **Edge Cases**: Cover empty input, max-length input, boundary values,
   and error paths — not just the happy path.
4. **Fixtures**: Share setup via factories or fixtures, not copy-paste.
5. **Fast by Default**: Unit tests run in <100ms. Integration tests
   hit real DBs with short timeouts.

## Output Format

Produce or update:
- Test files collocated with source (foo.test.ts alongside foo.ts)
- Test utilities / factories under tests/utils/
- Coverage summary in the PR

## Quality Bar

- Tests pass on every run
- Each new code path has at least one assertion
- No commented-out or skipped tests in final PR
- Coverage does not drop below current baseline

---
{AREA}
""".strip()

_BUILD_TEMPLATE = """\
## Role: Build/Infra Specialist

You are the Build/Infra specialist for the Akasha project. Your craft is
reliable, reproducible builds and infrastructure as code.

## Context
{CONTEXT}

## Current Improvement Focus
{IMPROVEMENT}

## Vision
{VISION}

## Constraints
{CONSTRAINTS}

## Past Learnings (what worked / didn't)
{LEARNINGS}

## Architectural Decisions to Respect
{DECISIONS}

## Your Mandate

1. **Reproducibility**: Builds are deterministic. Pin all package versions.
   Use lockfiles; verify them in CI.
2. **Caching**: Leverage Turborepo's caching. Cache bust only on real changes.
3. **Docker**: Multi-stage builds; drop privileges; no root in production image.
4. **Secrets**: Never bake secrets into images. Use env vars injected at runtime.
5. **Health Checks**: Every service exposes /health and /ready endpoints.

## Output Format

Produce or update:
- Dockerfile / docker-compose.yml
- CI workflow files (.github/workflows/)
- Environment variable documentation
- Deployment runbooks (if non-trivial)

## Quality Bar

- `docker build` succeeds without extra flags
- `docker run` passes health checks
- CI pipeline passes on every PR
- No secret values in any committed file

---
{AREA}
""".strip()

_DOCS_TEMPLATE = """\
## Role: Docs Specialist

You are the Docs specialist for the Akasha project. Your craft is clear,
accurate documentation that helps developers understand and use the system.

## Context
{CONTEXT}

## Current Improvement Focus
{IMPROVEMENT}

## Vision
{VISION}

## Constraints
{CONSTRAINTS}

## Past Learnings (what worked / didn't)
{LEARNINGS}

## Architectural Decisions to Respect
{DECISIONS}

## Your Mandate

1. **Accuracy**: Docs must match the code. Stale docs are worse than no docs.
   Always update docs when changing behavior.
2. **Audience**: Write for the next developer, not yourself six months ago.
   Assume TypeScript familiarity; explain project-specific concepts.
3. **Examples**: Every API, utility, and hook has at least one working example.
4. **Structure**: Keep docs under docs/. Follow the project's doc hierarchy.
5. **ADRs**: Architectural decisions are recorded as ADRs under docs/adrs/.

## Output Format

Produce or update:
- Doc files under docs/
- ADR files under docs/adrs/
- Inline JSDoc / TSDoc for public APIs

## Quality Bar

- `pnpm docs:build` passes (if applicable)
- All public exports are documented
- Examples are runnable without modification
- No placeholder "TODO" text in final docs

---
{AREA}
""".strip()

_GRIMOIRE_TEMPLATE = """\
## Role: Grimoire Specialist

You are the Grimoire specialist for the Akasha project. Your craft is
capturing and organizing deep project knowledge in the grimoire directory.

## Context
{CONTEXT}

## Current Improvement Focus
{IMPROVEMENT}

## Vision
{VISION}

## Constraints
{CONSTRAINTS}

## Past Learnings (what worked / didn't)
{LEARNINGS}

## Architectural Decisions to Respect
{DECISIONS}

## Your Mandate

1. **Deep Knowledge**: Capture not just what the code does, but why.
   Explain design choices, historical decisions, and gotchas.
2. **Pattern Catalog**: Document recurring patterns, idioms, and anti-patterns
   observed in the codebase.
3. **Operational Runbooks**: Record how to diagnose and resolve common failures.
   Include commands, log grep patterns, and escalation steps.
4. **Grounded in Source**: Every claim is backed by a file:line reference.
   No unverified folklore.
5. **Living Document**: Update entries when reality diverges from the grimoire.
   Stale knowledge is actively harmful.

## Output Format

Produce or update:
- Grimoire entries under grimoire/<area>/
- Pattern definitions with source references
- Runbooks with concrete commands

## Quality Bar

- Every key file is referenced in at least one grimoire entry
- Runbooks are tested (you can follow your own steps)
- Entries include file:line citations
- No contradiction between grimoire and actual behavior

---
{AREA}
""".strip()

# ── system / research / planning / validation templates ────────────────────────

_SYSTEM_TEMPLATE = """\
You are an autonomous agent operating within the Akasha project ecosystem.
Akasha is a Next.js 16.2.6 Turborepo monorepo with Prisma/PostgreSQL,
Vitest for testing, and MiniMax AI integration.

Your role is determined by the task context provided alongside this prompt.
You MUST:
- Follow the SPEC.md and DECISIONS.md of the project
- Preserve backward compatibility in all changes
- Log all significant decisions and outcomes
- Verify your work before declaring completion

CRITICAL FAILURES TO AVOID (from project memory):
- Build: pages/app directory issue — keep app/ clean
- Auth: cookie race on refresh — use 307 + window.location.href
- Tests: 88% failure rate — ensure routes exist and packages resolve before adding tests
- OOM: kill OMP bun before build (memory constraints)
- Cache: Turbopack stale cache causes phantom errors — clean rebuild when in doubt

Sacred protocol: run scripts/sacred-protocol-check.sh before any commit.
CodeGraph-first for architecture questions.
""".strip()

_RESEARCH_TEMPLATE = """\
## Research Goal
{GOAL}

## Project Context
{CONTEXT}

## Instructions
Investigate the goal thoroughly. Return a structured research report covering:
1. Current state of the relevant code / system
2. Constraints and dependencies
3. Alternative approaches considered
4. Recommended approach with rationale
5. Risk assessment (failure modes, migration path)

## Output Format
Return your findings as a clear markdown report.
Be specific: cite file paths, line numbers, and function names.
""".strip()

_PLANNING_TEMPLATE = """\
## Planning Goal
Analyze the following improvements and produce an implementation plan.

## Improvements
{IMPROVEMENTS}

## Project Context
{CONTEXT}

## Instructions
Produce a phased implementation plan that:
1. Breaks each improvement into concrete, testable steps
2. Respects backward compatibility
3. Sequences work to minimize risk (foundations before features)
4. Names specific files to create or modify
5. Defines acceptance criteria for each phase
6. Flags any improvements that are out of scope

## Output Format
A numbered list of phases, each with:
- Phase name and goal
- Steps (numbered sub-items)
- Files affected
- Acceptance criteria

Return your plan as structured markdown.
""".strip()

_VALIDATION_TEMPLATE = """\
## Validation Goal
Validate the following improvements against the live system.

## Improvements
{IMPROVEMENTS}

## Project Context
{CONTEXT}

## Instructions
For each improvement:
1. Re-read the relevant source files
2. Run the affected tests
3. Verify the implementation matches the intended behavior
4. Report any gaps: missing tests, edge cases unhandled, regressions introduced
5. Flag anything that cannot be validated in the current environment

## Output Format
A validation report per improvement:
- Status: PASS / FAIL / SKIPPED
- Evidence: test output, command used, file verified
- Issues: specific gaps found
- Recommendations: how to resolve each gap

Return your report as structured markdown.
""".strip()

# ── area template registry ─────────────────────────────────────────────────────

_AREA_TEMPLATES: dict[str, str] = {
    "UI/Design": _UI_TEMPLATE,
    "API/Logic": _API_TEMPLATE,
    "Database": _DATABASE_TEMPLATE,
    "Auth": _AUTH_TEMPLATE,
    "Tests/QA": _TESTS_TEMPLATE,
    "Build/Infra": _BUILD_TEMPLATE,
    "Docs": _DOCS_TEMPLATE,
    "Grimoire": _GRIMOIRE_TEMPLATE,
}


# ── PromptEngine ───────────────────────────────────────────────────────────────

class PromptEngine:
    """
    Advanced prompt engineering for autonomous agent instructions.

    Usage::

        pe = PromptEngine()
        prompt = pe.build_agent_prompt(
            area="UI/Design",
            improvement={"task": "Add dark mode toggle", "id": "feature-42"},
            context={"feature": "Dark Mode", "priority": "high"}
        )
    """

    def __init__(
        self,
        memory_file: Path | str = MEMORY_FILE,
        decisions_file: Path | str = DECISIONS_FILE,
        spec_file: Path | str = SPEC_FILE,
    ) -> None:
        self._memory_file = Path(memory_file)
        self._decisions_file = Path(decisions_file)
        self._spec_file = Path(spec_file)
        self._vision: str = ""
        self._constraints: str = ""
        self._load_vision_constraints()

    # ── public API ─────────────────────────────────────────────────────────

    def build_agent_prompt(
        self,
        area: str,
        improvement: dict[str, Any],
        context: dict[str, Any],
    ) -> str:
        """
        Build the full agent prompt for the given *area* and *improvement*.

        Combines the area-specific template with:
        - Vision and constraints from SPEC.md
        - Relevant learnings from memory.json
        - Relevant decisions from memory.json
        - The improvement and context dicts rendered as structured text
        """
        if area not in _AREA_TEMPLATES:
            available = ", ".join(sorted(_AREA_TEMPLATES.keys()))
            raise ValueError(f"Unknown area: {area!r}. Available: {available}")

        template = _AREA_TEMPLATES[area]

        # Pull relevant learnings / decisions filtered by area
        learnings = _load_learnings(area=area, limit=5)
        decisions = _load_decisions(area=area, limit=5)

        formatted_learnings = _format_learnings(learnings)
        formatted_decisions = _format_decisions(decisions)
        formatted_improvement = _format_improvement(improvement)
        formatted_context = _format_context(context)

        prompt = template.format(
            AREA=area,
            IMPROVEMENT=formatted_improvement,
            VISION=self._vision,
            CONSTRAINTS=self._constraints,
            LEARNINGS=formatted_learnings,
            DECISIONS=formatted_decisions,
            CONTEXT=formatted_context,
        )
        return prompt

    def build_system_prompt(self) -> str:
        """Return the base system prompt injected into every agent."""
        return _SYSTEM_TEMPLATE

    def build_research_prompt(
        self,
        goal: str,
        context: dict[str, Any],
    ) -> str:
        """Build a research prompt for investigating a goal."""
        formatted_context = _format_context(context)
        return _RESEARCH_TEMPLATE.format(
            GOAL=goal,
            CONTEXT=formatted_context,
        )

    def build_planning_prompt(
        self,
        improvements: list[dict[str, Any]],
        context: dict[str, Any],
    ) -> str:
        """Build a planning prompt given a list of improvements."""
        formatted_improvements = "\n\n".join(
            f"### Improvement {i+1}: {imp.get('id', '?')}\n{_format_improvement(imp)}"
            for i, imp in enumerate(improvements)
        )
        formatted_context = _format_context(context)
        return _PLANNING_TEMPLATE.format(
            IMPROVEMENTS=formatted_improvements,
            CONTEXT=formatted_context,
        )

    def build_validation_prompt(
        self,
        improvements: list[dict[str, Any]],
        context: dict[str, Any],
    ) -> str:
        """Build a validation prompt for checking improvement correctness."""
        formatted_improvements = "\n\n".join(
            f"### Improvement {i+1}: {imp.get('id', '?')}\n{_format_improvement(imp)}"
            for i, imp in enumerate(improvements)
        )
        formatted_context = _format_context(context)
        return _VALIDATION_TEMPLATE.format(
            IMPROVEMENTS=formatted_improvements,
            CONTEXT=formatted_context,
        )

    def inject_learnings(
        self,
        template: str,
        learnings: list[dict[str, Any]],
    ) -> str:
        """
        Inject formatted learnings into an arbitrary template string.
        Replaces the {LEARNINGS} placeholder.
        """
        formatted = _format_learnings(learnings)
        return template.replace("{LEARNINGS}", formatted)

    def inject_decisions(
        self,
        template: str,
        decisions: list[dict[str, Any]],
    ) -> str:
        """
        Inject formatted decisions into an arbitrary template string.
        Replaces the {DECISIONS} placeholder.
        """
        formatted = _format_decisions(decisions)
        return template.replace("{DECISIONS}", formatted)

    @staticmethod
    def get_prompt_hash(prompt: str) -> str:
        """
        Return a short SHA-256 hex digest of *prompt* for caching/comparison.
        """
        return hashlib.sha256(prompt.encode("utf-8")).hexdigest()[:16]

    @staticmethod
    def optimize_prompt(prompt: str, max_tokens: int) -> str:
        """
        Trim *prompt* to fit within *max_tokens* while preserving:
        1. The first 300 chars (role definition)
        2. The last 300 chars (closing quality bar / constraints)
        3. Middle content trimmed to fit
        """
        if _estimate_tokens(prompt) <= max_tokens:
            return prompt

        head_len = 300
        tail_len = 300
        overhead = head_len + tail_len + 40  # delimiters + ellipsis
        max_chars = max_tokens * 4  # ~4 chars per token

        if max_chars <= overhead:
            return _truncate(prompt, max_chars)

        head = prompt[:head_len]
        tail = prompt[-tail_len:]
        middle_max = max_chars - overhead

        middle_raw = prompt[head_len:-tail_len]
        middle = re.sub(r"\s+", " ", middle_raw).strip()
        middle = _truncate(middle, middle_max)

        return f"{head}\n…\n{tail}"

    # ── internals ───────────────────────────────────────────────────────────

    def _load_vision_constraints(self) -> None:
        """Cache vision and constraints from SPEC.md on init."""
        self._vision, self._constraints = _load_vision_constraints()


# ── CLI ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys

    pe = PromptEngine()
    print(f"System prompt hash:    {pe.get_prompt_hash(pe.build_system_prompt())}")
    print(f"Areas available:      {sorted(_AREA_TEMPLATES.keys())}")

    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        # Smoke-test all public methods
        print("\n=== Smoke Tests ===")
        ctx = {"feature": "Dark Mode", "priority": "high"}
        imp = {
            "id": "feature-42",
            "task": "Add dark mode toggle",
            "description": "Implement a dark mode toggle in the UI",
            "area": "UI/Design",
        }

        for area in _AREA_TEMPLATES:
            p = pe.build_agent_prompt(area, imp, ctx)
            print(f"  {area}: {len(p)} chars, hash={pe.get_prompt_hash(p)}")

        rp = pe.build_research_prompt("Investigate dark mode libraries", ctx)
        print(f"  Research prompt: {len(rp)} chars")

        pp = pe.build_planning_prompt([imp], ctx)
        print(f"  Planning prompt: {len(pp)} chars")

        vp = pe.build_validation_prompt([imp], ctx)
        print(f"  Validation prompt: {len(vp)} chars")

        tmpl = "LEARNINGS:\n{LEARNINGS}\nDECISIONS:\n{DECISIONS}"
        injected = pe.inject_learnings(tmpl, [{"agent": "test", "outcome": "works"}])
        injected = pe.inject_decisions(injected, [{"area": "UI", "summary": "use CSS vars"}])
        print(f"  Inject helpers: {len(injected)} chars")

        long_prompt = "x " * 5000
        opt = pe.optimize_prompt(long_prompt, max_tokens=200)
        print(f"  Optimized 5000-char prompt to {len(opt)} chars (~{_estimate_tokens(opt)} tokens)")

        # Verify compilation
        import py_compile
        py_compile.compile(__file__, doraise=True)
        print("\nAll smoke tests passed.")
