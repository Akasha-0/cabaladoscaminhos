# DOX framework

- DOX is highly performant AGENTS.md hierarchy installed here
- Agent must follow DOX instructions across any edits

## Primary Rule

> **Sacred Protocol** (non-negotiable): Before ANY task — coding, design, research, planning, architecture:
> ```bash
> source scripts/sacred-protocol-check.sh   # validates CodeGraph + Headroom
> ```
> Then use `codegraph_explore` (MCP) for all code intelligence before `Read`/`Grep`/`Glob`.

> **CodeGraph-first**: before any Grep/Glob/Read for architecture, dependency, or discovery questions, use `codegraph_explore`. See `.trae/rules/project_rules.md` for the full rule and index commands.

## Core Contract

- AGENTS.md files are binding work contracts for their subtrees
- Work products, source materials, instructions, records, assets, and durable docs must stay understandable from the nearest applicable AGENTS.md plus every parent AGENTS.md above it

## CodeGraph

CodeGraph is the primary codebase exploration tool. Index is maintained at `.codegraph/`.

- Use `codegraph_explore` (MCP) for architecture questions, dependency traces, and discovery — not Grep/Glob/Read
- Use `codegraph query` for symbol searches
- Run `codegraph sync` after bulk file changes
- Full commands and index health: see `.trae/rules/project_rules.md`

## Read Before Editing

1. Read `.trae/rules/project_rules.md` (project-wide rules)
2. Read the root AGENTS.md
3. Identify every file or folder you expect to touch
4. Walk from the repository root to each target path
5. Read every AGENTS.md found along each route
6. If a parent AGENTS.md lists a child AGENTS.md whose scope contains the path, read that child and continue from there
7. Use the nearest AGENTS.md as the local contract and parent docs for repo-wide rules
8. If docs conflict, the closer doc controls local work details, but no child doc may weaken DOX

Do not rely on memory. Re-read the applicable DOX chain in the current session before editing.

## Update After Editing

Every meaningful change requires a DOX pass before the task is done.

Update the closest owning AGENTS.md when a change affects:

- purpose, scope, ownership, or responsibilities
- durable structure, contracts, workflows, or operating rules
- required inputs, outputs, permissions, constraints, side effects, or artifacts
- user preferences about behavior, communication, process, organization, or quality
- AGENTS.md creation, deletion, move, rename, or index contents

Update parent docs when parent-level structure, ownership, workflow, or child index changes. Update child docs when parent changes alter local rules. Remove stale or contradictory text immediately. Small edits that do not change behavior or contracts may leave docs unchanged, but the DOX pass still must happen.

## Hierarchy

- Root AGENTS.md is the DOX rail: project-wide instructions, global preferences, durable workflow rules, and the top-level Child DOX Index
- Child AGENTS.md files own domain-specific instructions and their own Child DOX Index
- Each parent explains what its direct children cover and what stays owned by the parent
- The closer a doc is to the work, the more specific and practical it must be

## Child Doc Shape

- Create a child AGENTS.md when a folder becomes a durable boundary with its own purpose, rules, responsibilities, workflow, materials, or quality standards
- Work Guidance must reflect the current standards of the project or user instructions; if there are no specific standards or instructions yet, leave it empty
- Verification must reflect an existing check; if no verification framework exists yet, leave it empty and update it when one exists

Default section order:
- Purpose
- Ownership
- Local Contracts
- Work Guidance
- Verification
- Child DOX Index

## Style

- Keep docs concise, current, and operational
- Document stable contracts, not diary entries
- Put broad rules in parent docs and concrete details in child docs
- Prefer direct bullets with explicit names
- Do not duplicate rules across many files unless each scope needs a local version
- Delete stale notes instead of explaining history
- Trim obvious statements, repeated rules, misplaced detail, and warnings for risks that no longer exist

## Closeout

1. Re-check changed paths against the DOX chain
2. Update nearest owning docs and any affected parents or children
3. Refresh every affected Child DOX Index
4. Remove stale or contradictory text
5. Run existing verification when relevant
6. Report any docs intentionally left unchanged and why

## User Preferences

When the user requests a durable behavior change, record it here or in the relevant child AGENTS.md

**akasha-loop-daemon-v4** (PRIMARY): 24/7 Autonomous Evolution Engine.
  Script: `.autonomous/multi-agent/akasha-loop-daemon-v4.py` (v4 event-driven).
  Start: `bash .autonomous/multi-agent/run-24-7.sh` (or `run-loop-supervised.sh`).
  Flow: RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE.
  Integrated subsystems:
    - Guardian (`guardian.py`): process supervision, exponential backoff restart
    - Memory Manager (`memory_manager.py`): 3-tier archival (hot/warm/cold)
    - Telemetry (`telemetry.py`): real-time phase metrics, anomaly detection
    - Adaptive Pacer (`adaptive_pacer.py`): quality-based speed (FAST/NORMAL/SLOW/PAUSE)
    - Self-Healer (`self_healer.py`): deadlock detection, circuit breaker
    - Predictive Engine (`predictive_engine.py`): proactive risk detection
    - Skill Discoverer (`skill_discoverer.py`): autonomous pattern learning
    - Continuity Manager (`continuity_manager.py`): cross-session state preservation
  Bootstrap: `context_bootstrap.py` v2 with smart caching (5min TTL, light triad)
  Evals: `evals.py` v2 with real-time recalculation (60s cache, weighted quality)
  Supervised by: `run-loop-supervised.sh` → `run-24-7.sh` (24/7 orchestration)
**akasha-evolution-loop** (LEGACY): Ralph-style continuous loop, 5-agent parallel v2.
  Script: `.autonomous/multi-agent/akasha-evolution-loop.py`.
  Start: `bash .autonomous/multi-agent/start-akasha-evolution.sh`.
  Use: fallback only. Primary loop is the v4 daemon above.
**Ralph-loop** (legacy/fallback): Single-agent 6-phase loop.
  Scripts: `.autonomous/ralph-loop/akasha-ralph-loop.py`.
**Headroom proxy**: Running on port 8787. All large tool outputs (>5k tokens) use Headroom compression.
**CodeGraph**: Primary exploration tool — `codegraph_explore` before Read/Grep/Glob.
**24/7 Operations**:
  Start: `bash .autonomous/multi-agent/run-24-7.sh start`
  Status: `bash .autonomous/multi-agent/run-24-7.sh detailed`
  Health: `bash .autonomous/multi-agent/run-24-7.sh health`
  Telemetry: `bash .autonomous/multi-agent/run-24-7.sh telemetry`
  Validate: `bash .autonomous/multi-agent/run-24-7.sh validate`
  Architecture: `.autonomous/multi-agent/AUTONOMOUS-EVOLUTION-BLUEPRINT.md`

## Child DOX Index

  - `multi-agent/akasha-loop-daemon-v4.py` — 24/7 autonomous daemon (PRIMARY)
  - `multi-agent/akasha-loop-daemon.py` — socket daemon v3 (legacy)
  - `multi-agent/guardian.py` — process supervisor with backoff restart
  - `multi-agent/memory_manager.py` — 3-tier memory (hot/warm/cold) + archival
  - `multi-agent/telemetry.py` — real-time metrics + anomaly detection
  - `multi-agent/adaptive_pacer.py` — quality-based iteration speed control
  - `multi-agent/self_healer.py` — deadlock detection + recovery + circuit breaker
  - `multi-agent/predictive_engine.py` — proactive risk detection + forecasting
  - `multi-agent/skill_discoverer.py` — autonomous pattern learning
  - `multi-agent/continuity_manager.py` — cross-session state preservation
  - `multi-agent/akasha-evolution-loop.py` — 5-agent parallel loop v2 (legacy, fallback)
  - `multi-agent/intelligence.py` — evidence-based decisions + exponential learning
  - `multi-agent/context_bootstrap.py` — fresh project context every iteration (v2 smart cache)
  - `multi-agent/evals.py` + `eval-report.py` — loop quality measurement (v2 real-time)
  - `multi-agent/run-24-7.sh` — 24/7 orchestration script
  - `multi-agent/AUTONOMOUS-EVOLUTION-BLUEPRINT.md` — architecture blueprint
  - `ralph-loop/` — Ralph-style 6-phase autonomous loop (fallback)
  - `skills/akasha-evolution/` — OMP skill for autonomous evolution loop
- `apps/` — aplicações do produto
- `packages/` — workspaces compartilhados e engines
- `docs/` — documentação canônica
- `grimoire/` — base de conhecimento
- `tests/` — verificações automatizadas
- `deploy/` — infraestrutura
- `scripts/` — automações
- `memory/` — histórico de ciclos
