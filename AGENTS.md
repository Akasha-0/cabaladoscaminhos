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

**akasha-loop-daemon** (PRIMARY): 24/7 Autonomous Evolution Engine (canonical).
  Script: `.autonomous/multi-agent/akasha-loop-daemon.py` (v9, portable).
  Start: `bash .autonomous/multi-agent/run-24-7.sh start` (or `run-loop-supervised.sh`).
  Flow: RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE.
  Modules (portable, no hardcoded paths): Guardian, MemoryManager, Telemetry,
    AdaptivePacer, SelfHealer, PredictiveEngine, SkillDiscoverer, ContinuityManager,
    ProjectMap, ReasoningChain, ContextEngine, Evolver, PromptEngine,
    AgentOrchestrator.
  Performance: select.poll() (zero CPU idle), adaptive polling 1s→10s,
    in-memory state cache (TTL 2s), parallel QA via ThreadPoolExecutor.
  Skill: `.autonomous/multi-agent/skills/akasha-evolution/SKILL.md`.
**Headroom proxy**: Running on port 8787 (systemd user service: `systemctl --user status headroom-proxy`). Auto-restart on failure, persists across logout (linger enabled).
- **Auto-compress (mandatory)**: ALWAYS use `mcp__headroom__headroom_compress` on any tool output >2k tokens (logs, search results, JSON dumps, code listings, file contents). Don't read large outputs raw — compress first, then expand `[CCR:hash]` via `mcp__headroom__headroom_retrieve` only if a detail is actually needed.
- **Output shaper is ON** (`HEADROOM_OUTPUT_SHAPER=1`, `HEADROOM_OUTPUT_HOLDOUT=0.1`): keep replies terse, skip restating context the user already has, no preamble phrases like "Great question" / "Let me help" / "Sure!". 10% of turns are unshaped as a control group for measurement.
- **Check before relying**: `curl -s http://127.0.0.1:8787/health` → `status:"healthy"`. If unhealthy, surface the error instead of silently retrying — the systemd service will auto-recover in ~5s.
- **Savings**: `curl -s http://127.0.0.1:8787/stats | jq '.persistent_savings.lifetime'` shows tokens saved across all sessions.
**CodeGraph**: Primary exploration tool — `codegraph_explore` before Read/Grep/Glob.
**24/7 Operations**:
  Start: `bash .autonomous/multi-agent/run-24-7.sh start`
  Status: `bash .autonomous/multi-agent/run-24-7.sh detailed`
  Health: `bash .autonomous/multi-agent/run-24-7.sh health`
  Telemetry: `bash .autonomous/multi-agent/run-24-7.sh telemetry`
  ProjectMap: `bash .autonomous/multi-agent/run-24-7.sh project-map`
  Reasoning: `bash .autonomous/multi-agent/run-24-7.sh reasoning`
  Context: `bash .autonomous/multi-agent/run-24-7.sh context`
  Validate: `bash .autonomous/multi-agent/run-24-7.sh validate`
  Architecture: `.autonomous/multi-agent/AUTONOMOUS-EVOLUTION-BLUEPRINT.md`

## Child DOX Index

  - `multi-agent/akasha-loop-daemon.py` — 24/7 autonomous daemon (canonical)
  - `multi-agent/guardian.py` — process supervisor with exponential backoff restart
  - `multi-agent/memory_manager.py` — 3-tier memory (hot/warm/cold) + forgetting curve
  - `multi-agent/telemetry.py` — real-time metrics + anomaly detection (mean+2σ)
  - `multi-agent/adaptive_pacer.py` — quality-based speed (FAST/NORMAL/SLOW/PAUSE)
  - `multi-agent/self_healer.py` — 5 recovery strategies + circuit breaker
  - `multi-agent/predictive_engine.py` — proactive risk detection (memory/quality/error)
  - `multi-agent/skill_discoverer.py` — Apriori mining + success sequences + anti-patterns
  - `multi-agent/continuity_manager.py` — atomic saves + session restore + git HEAD detection
  - `multi-agent/project_map.py` — 9 project areas, 2204 files, quality + potential scoring
  - `multi-agent/reasoning_chain.py` — chain-of-thought reasoning (3-7 steps) + self-correction
  - `multi-agent/context_engine.py` — deep context (8000 tokens), recency×decision-impact scoring
  - `multi-agent/evolver.py` — autonomous brain, self-optimizing, intensity 1-10
  - `multi-agent/prompt_engine.py` — 8 area templates, learnings/decisions injection
  - `multi-agent/agent_orchestrator.py` — parallel spawning + /proc resource monitoring
  - `multi-agent/loop_optimizer.py` — self-optimization engine: tunes pacing, parallelism, timeouts, quality thresholds
  - `multi-agent/smart_iterator.py` — intelligent iteration prioritizer using ProjectMap; scores by neglect×0.30 + potential×0.30 + compounding×0.20 + ease×0.20
  - `multi-agent/memory_compressor.py` — memory compression for unbounded context with bounded resources; preserves ADRs, critical decisions, failure learnings
  - `multi-agent/evals.py` + `eval-report.py` — loop quality measurement
  - `multi-agent/run-24-7.sh` — 24/7 operational commands (start/stop/health/validate)
  - `multi-agent/AUTONOMOUS-EVOLUTION-BLUEPRINT.md` — architecture blueprint
  - `skills/akasha-evolution/` — OMP skill: start akasha-evolution
- `apps/` — aplicações do produto
- `packages/` — workspaces compartilhados e engines
- `docs/` — documentação canônica
- `grimoire/` — base de conhecimento
- `tests/` — verificações automatizadas
- `deploy/` — infraestrutura
- `scripts/` — automações
- `memory/` — histórico de ciclos
