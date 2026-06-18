# Akasha Evolution Skill — OMP Autonomous Loop v8

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
3. Verify all 20 v8 modules exist
4. Check git status — warn if uncommitted changes

### Startup
Runs: `bash .autonomous/multi-agent/run-loop-supervised.sh start`

The supervisor starts daemon v7 (akasha-loop-daemon-v8.py) which integrates all 17 modules.

### v1 Subsystems (8)
1. **Guardian** — process supervision, PID alive checks, exponential backoff restart (5s→120s)
2. **Memory Manager** — 3-tier archival (hot/warm/cold), forgetting curve 0.95^(age-50), auto-archive >100KB
3. **Telemetry Collector** — phase timing (ms), rolling quality deque maxlen=1000, anomaly detection (mean+2σ)
4. **Adaptive Pacer** — FAST/NORMAL/SLOW/PAUSE, EMA alpha=0.1, quality-gated evolution
5. **Self-Healer** — 5 recovery strategies, circuit breaker (>3 retries/1800s), priority: CORRECT > DEADLOCK > OOM > TIMEOUT
6. **Predictive Engine** — memory_exhaustion/quality_regression/persistent_error/cascade_failure detection
7. **Skill Discoverer** — Apriori mining, success sequences, anti-pattern detection, 4 pattern algorithms
8. **Continuity Manager** — atomic saves (temp+rename), threading.Lock, auto-save every 300s, git HEAD mismatch detection

### v2 Engine Modules (6)
9. **ProjectMap** — 9 project areas, 2204 files, quality scoring, improvement potential, neglected area detection
10. **ReasoningChain** — multi-step chain-of-thought (3-7 steps), confidence scoring, self-correction, topological planning
11. **ContextEngine** — deep context from SPEC.md/DECISIONS.md/PROGRESS.md, token budget 8000, relevance scoring (recency×decision-impact×goal-overlap)
12. **Evolver** — autonomous brain, self-optimizing, intensity levels 1-10, orchestrates all subsystems
13. **PromptEngine** — 8 area-specific templates (UI/Design, API/Logic, Database, Auth, Tests/QA, Build/Infra, Docs, Grimoire), learnings/decisions injection
14. **AgentOrchestrator** — parallel spawning, resource monitoring via /proc, graceful degradation under low resources

### v8 Improvements
- **Fast polling**: Adaptive 1s→5s→10s intervals in IMPLEMENTATION_WAIT instead of fixed 10s
- **Quick win detection**: Skip remaining wait if TS passes + file changes exist
- **Intensity auto-scaling**: +2 intensity after 3x no changes, -1 after >5 changes (clamped 1-10)
- **Quality trend tracking**: improving/degrading/stable based on last 5 quality scores
- **Smarter QA transitions**: TS+Format PASS → immediate VALIDATION; TS PASS + cosmetic FAIL → proceed
- **Stale detection**: 60s no-progress timeout in wait loop
- **v7 fixes preserved**: Zombie detection, QA fail-fast, partial results handling

### v8 New Modules (4)
- **memory_manager_v2.py** (992L): Exponential learning memory — patterns strengthen/weakens with repetition, hot/warm/cold tiers, evidence store, bounded 50MB
- **skill_discoverer_v2.py** (632L): Semantic pattern matching with TF-IDF Jaccard similarity, success rate prediction, anti-pattern warnings
- **reasoning_chain_v2.py** (1388L): Causal reasoning engine — root cause analysis, counterfactual reasoning, hypothesis testing, confidence calibration, memoisation
- **akasha-loop-daemon-v8.py** (1441L): Fast polling daemon with intensity auto-scaling and quality tracking

### Performance Optimizations
- `select.poll()` replaces busy-wait socket polling (zero CPU idle)
- Adaptive backoff 1s→10s in wait_implementation
- In-memory state/memory cache (TTL: 2s/5s)
- Parallel QA via ThreadPoolExecutor (tsc+tests+format concurrent)
- Agent priority lowered via `os.setpriority(prio=10)`

### Evolution Loop
```
RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE
     ↑____________________________________________________________↓
```

### Intensity Levels (1-10)
- 1-3: Conservative, 1-2 agents, slow pacing
- 4-6: Balanced, normal parallelism (3-4 agents)
- 7-10: Aggressive, high parallelism (5-8 agents), fast pacing

### Quality Gates
- TypeScript must pass (`npx tsc --noEmit`)
- Tests must pass (`npm run test:run`)
- Quality score >= 70 before RELEASE

### Monitoring Commands
| Command | Description |
|---|---|
| `run-24-7.sh status` | Current PID and state |
| `run-24-7.sh detailed` | Phase, iteration, quality, pacer state, all modules |
| `run-24-7.sh health` | Subsystem health check |
| `run-24-7.sh telemetry` | Metrics summary |
| `run-24-7.sh project-map` | 9 project areas, quality scores, neglected areas |
| `run-24-7.sh reasoning` | Current reasoning chain, confidence |
| `run-24-7.sh context` | Context engine summary, hash |
| `run-24-7.sh validate` | Full validation suite |

### Shutdown
`bash .autonomous/multi-agent/run-24-7.sh stop`

### Project Areas (ProjectMap)
1. UI/Design — apps/akasha-portal/src/components/, apps/akasha-portal/src/app/
2. API/Logic — apps/akasha-portal/src/lib/, packages/akasha-core/, packages/mentor/
3. Database/Prisma — apps/akasha-portal/prisma/
4. Auth — apps/akasha-portal/src/lib/auth/, middleware
5. Tests/QA — tests/, vitest.config.ts
6. Build/Infra — Dockerfile, docker-compose, turbo.json, package.json
7. Docs — docs/, SPEC.md, DECISIONS.md, PROGRESS.md
8. Grimoire — grimoire/ (knowledge bases)
9. Autonomous Loop — .autonomous/multi-agent/

### Key Files
- `akasha-loop-daemon-v8.py` — daemon with all integrations (41KB)
- `akasha-evolution-loop-v2.py` — standalone loop using v2 modules (27KB)
- `evolver.py` — autonomous brain (62KB)
- `context_engine.py` — deep context management (35KB)
- `reasoning_chain.py` — chain-of-thought reasoning (69KB)
- `project_map.py` — project area intelligence (43KB)
- `prompt_engine.py` — prompt engineering (29KB)
- `agent_orchestrator.py` — parallel agent management (31KB)
- `run-loop-supervised.sh` — supervisor with pre-flight checks
- `run-24-7.sh` — operational commands

### Memory Architecture
- Hot: `memory.json` (recent learnings, decisions)
- Warm: `memory-warm.json` (50+ iterations)
- Cold: `memory-cold/YYYY-MM.json` (monthly archive)
- Decay: `0.95^(age-50)` forgetting curve

### Exit Codes
- 0: Clean start
- 1: Preflight check failed
- 2: Already running (PID found)
