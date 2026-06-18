# Akasha Evolution Skill — OMP Autonomous Loop

## Purpose
Start and manage the Akasha 24/7 autonomous evolution loop via OMP.

## Command
```
start akasha-evolution
```

## Behavior

### Pre-flight Check
1. Source `scripts/sacred-protocol-check.sh` (validates CodeGraph + Headroom)
2. Check system resources (CPU, memory, disk)
3. Verify all required modules exist
4. Check git status — warn if uncommitted changes

### Startup
Runs: `bash .autonomous/multi-agent/run-loop-supervised.sh start`

The supervisor starts the daemon v4 (akasha-loop-daemon-v4.py) which integrates all 8 subsystems.

### Subsystems (8 integrated)
1. **Guardian** — process supervision, PID alive checks, exponential backoff restart
2. **Memory Manager** — 3-tier archival (hot/warm/cold), forgetting curve
3. **Telemetry Collector** — phase timing, rolling quality metrics, anomaly detection
4. **Adaptive Pacer** — FAST/NORMAL/SLOW/PAUSE state machine, EMA quality tracking
5. **Self-Healer** — 5 recovery strategies, circuit breaker, priority: CORRECT > DEADLOCK > OOM > TIMEOUT
6. **Predictive Engine** — memory_exhaustion/quality_regression/persistent_error detection
7. **Skill Discoverer** — Apriori mining, success sequences, anti-pattern detection
8. **Continuity Manager** — atomic saves, session restore, git HEAD mismatch detection

### New v5 Engine Components
9. **ProjectMap** — maps all project areas, scores improvement potential, identifies neglected areas
10. **ReasoningChain** — multi-step chain-of-thought reasoning before decisions
11. **ContextEngine** — deep context management, token-budget-aware, relevance scoring
12. **Evolver** — autonomous brain, orchestrates all subsystems, self-optimizing
13. **PromptEngine** — engineering of agent prompts with learnings/decisions injected
14. **AgentOrchestrator** — parallel agent spawning with resource awareness

### Evolution Loop (continuous)
```
RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE
     ↑___________________________________________________________↓
```

### Intensity Levels (1-10)
- 1-3: Conservative, low resource, 1-2 agents max
- 4-6: Balanced, normal parallelism
- 7-10: Aggressive, high parallelism, fast pacing

### Quality Gates
- TypeScript must pass (npx tsc --noEmit)
- Tests must pass (npm run test:run)
- Quality score must be >= 70 before RELEASE

### Monitoring
- `bash .autonomous/multi-agent/run-24-7.sh status` — current state
- `bash .autonomous/multi-agent/run-24-7.sh health` — subsystem health
- `bash .autonomous/multi-agent/run-24-7.sh telemetry` — metrics
- `bash .autonomous/multi-agent/run-24-7.sh logs` — recent logs

### Shutdown
`bash .autonomous/multi-agent/run-24-7.sh stop`

### Exit Codes
- 0: Clean start
- 1: Preflight check failed
- 2: Already running (PID found)
- 3: Socket already exists

## Context
- ROOT: /home/skynet/cabala-dos-caminhos
- MA: .autonomous/multi-agent
- Memory: memory.json (hot), memory-warm.json (warm), memory-cold/ (cold)
- State: state.json
- Socket: loop-daemon.sock
- PID: loop-daemon.pid

## Key Files
- akasha-loop-daemon-v4.py — daemon with all integrations
- evolver.py — autonomous evolution brain
- context_engine.py — deep context management
- reasoning_chain.py — chain-of-thought reasoning
- project_map.py — project area mapping
- prompt_engine.py — prompt engineering
- agent_orchestrator.py — parallel agent management
- run-loop-supervised.sh — supervisor with pre-flight checks
- run-24-7.sh — operational commands
