# AKASHA Ralph-loop — Autonomous Evolution Engine

Ralph-style 6-phase state machine running inside OMP, integrating **CodeGraph** (code intelligence) and **Headroom** (token compression) for continuous project evolution.

## Architecture

```
OMP (MiniMax M3)
  └── /loop 5m python3 akasha-ralph-loop.py --action=loop
        ├── CodeGraph MCP  →  architecture analysis, blast-radius
        ├── Headroom MCP   →  token compression (>5k token outputs)
        └── State: .autonomous/ralph-loop/state.json
```

## 6-Phase State Machine

```
RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE
    ↑                                                          │
    └────────────────────── cycle ─────────────────────────────┘
```

| Phase | What it does |
|-------|-------------|
| **RESEARCH** | CodeGraph analysis of pending features, blast-radius, compression of large outputs |
| **PLANNING** | Updates Plans.md with new iteration block |
| **IMPLEMENTATION** | Signals harness-work for next iteration; marks plan WIP |
| **QA** | Runs triad (typecheck + tests + lint), compresses results |
| **VALIDATION** | CodeGraph sync check, DOX coverage, Plans.md compliance |
| **RELEASE** | Bumps version, commits, tags, updates CHANGELOG.md |

## Quick Start

```bash
# 1. Start infrastructure (headroom proxy + codegraph health)
./.autonomous/ralph-loop/start-ralph-loop.sh

# 2. Run ONE step manually
python3 .autonomous/ralph-loop/akasha-ralph-loop.py --action=loop

# 3. Start the continuous loop inside OMP
# (run this command inside OMP):
/loop 5m python3 .autonomous/ralph-loop/akasha-ralph-loop.py --action=loop

# 4. Check status
python3 .autonomous/ralph-loop/akasha-ralph-loop.py --action=status

# 5. Full report
python3 .autonomous/ralph-loop/akasha-ralph-loop.py --action=report

# 6. Stop the loop
python3 .autonomous/ralph-loop/akasha-ralph-loop.py --action=stop
```

## Files

| File | Purpose |
|------|---------|
| `akasha-ralph-loop.py` | Python state machine orchestrator |
| `start-ralph-loop.sh` | Boot script (headroom proxy + codegraph health) |
| `state.json` | Current state (phase, iteration, findings) |
| `version.json` | Semantic version tracker + changelog |
| `sessions/ralph-NNNN.log` | Per-iteration session logs |

## Token Optimization Strategy

### Where Headroom MCP wins (call `headroom_compress`):
- Tool outputs > 5,000 tokens (grep results, glob listings, JSON dumps)
- CodeGraph results that are > 5k tokens
- Test output batches
- Search result lists

### Where Headroom is a no-op (don't bother):
- Already-concise narrative markdown
- Single source files (AST compressor leaves code untouched)
- Pure prose with low redundancy

### CodeGraph-First Rule
**Every** architecture/dependency question MUST use `codegraph_explore` before `Read`/`Grep`/`Glob`.
This is enforced by `.trae/rules/project_rules.md`.

```python
# Inside Ralph-loop phases:
cg_result = run_codegraph(f"architecture {feature_id} {title}")
# → compressed automatically if >5k tokens
```

## Version Bumping

| Phase | Bump |
|-------|------|
| IMPLEMENTATION | major++ (0.x.y) |
| VALIDATION | minor++ |
| RELEASE | patch++ |

## Circuit Breakers

The loop respects the existing orchestrator's circuit breakers:
- `429 Token Plan` → stops after 3 consecutive hits
- `stop.signal` in `.autonomous/state/` → halts after current iteration
- Max runtime: 24h

## Existing Orchestrator vs Ralph-loop

The **bash orchestrator** (`PID 958587`, `orchestrator.sh`) runs `claude` CLI sessions and is the primary loop.
The **Ralph-loop** runs **inside OMP** as a Python state machine that uses OMP's tools.
They are **complementary** — the bash orchestrator does the heavy code generation;
Ralph-loop does micro-analysis, token optimization, and coordination.

## Integration with OMP Harness

OMP's `/loop` command schedules the Ralph-loop Python script:

```
/loop <interval> python3 .autonomous/ralph-loop/akasha-ralph-loop.py --action=loop
```

Example: `/loop 5m` runs a step every 5 minutes.
Each step = one phase transition (fast iteration, low context).
