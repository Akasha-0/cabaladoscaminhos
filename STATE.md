# STATE.md — Akasha OS

**Versão**: v0.3.0 | **Atualização**: 2026-06-16
**Status**: AKASHA-LOOP DAEMON v3 — supervised, socket-based, with supervisor watchdog

---

## Visão (3 linhas)

- Sistema espiritual unificado: 5 tradições (Cabala, Astrologia, Tantra, Odu, I Ching) sob a linguagem toroidal do Akasha.
- Mobile-first PWA com painel consolidado (Meu Dia, Áreas da Vida, Progresso) e navegação sidebar/drawer.
- AKASHA-LOOP daemon: RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → RELEASE, supervised by watchdog.

---

## Akasha-Loop Daemon v3 (PRIMARY)

- **Daemon**: `.autonomous/multi-agent/akasha-loop-daemon.py` — async socket daemon, v3
- **Supervisor**: `run-loop-supervised.sh` — watchdog that restarts the daemon on death
- **Start**: `bash .autonomous/multi-agent/run-loop-supervised.sh`
- **Mode**: supervised daemon with supervisor watchdog (auto-restart on daemon death)
- **Socket**: `.autonomous/multi-agent/loop-daemon.sock` — IPC between supervisor and daemon
- **Log**: `.autonomous/multi-agent/loop-supervisor.log` (supervisor), `.autonomous/multi-agent/loop.log` (daemon)
- **Triad cache**: `triad-cache.json` with TTL=300s + git HEAD invalidation
- **Intelligence**: `memory.json` with exponential learning, 34 learnings, 40 decisions
- **Bootstrap**: `context_bootstrap.py` — fresh project context every iteration

---

## akasha-evolution-loop.py (LEGACY)

- **Script**: `.autonomous/multi-agent/akasha-evolution-loop.py` — Ralph-style continuous loop (legacy)
- **Mode**: continuous (8h), 5-agent parallel v2
- **Use**: fallback only; daemon v3 is the primary loop

---

## Releases (Daemon v3)

| Iter | Version | Features | Status |
|------|---------|----------|--------|
| 0 | v0.1.0 | tech_debt, large_file | ✅ Released |
| 1 | v0.2.0 | tech_debt, large_file | ✅ Released |
| 2 | v0.3.0 | missing_tests, tech_debt, large_file | ✅ Released |
| 3+ | — | — | 🔄 Active |

Time to first release: ~9 min. Three releases completed in ~30 min.

---

## Evals Framework

- **Metrics**: `.autonomous/multi-agent/metrics.json` — phase durations, quality scores
- **Report**: `.autonomous/multi-agent/eval-report.py` — baseline evaluation report
- **Evals**: `.autonomous/multi-agent/evals.py` — eval primitives and scoring
- **Iteration quality**: iter 1 = 28%, iter 2 = 40% (loop_quality trend improving)
- **QA quality**: typecheck PASSES, tests: 232 pre-existing failures (non-blocking)
- **memory.json**: 18 iterations, 34 learnings, 40 decisions

---

## Backlog Priorizado (do loop)

1. **missing_translation** (priority 8): CABALA/TANTRA areas missing from traducao-areas
2. **missing_tests** (priority 6): arquivos modificados sem teste
3. **tech_debt** (priority 5): files com comentários TODO/XXX
4. **large_file** (priority 4): files >500 LOC

---

## Swarm Status

- Triad: typecheck ✅ | lint ✅ (0 errors) | tests: 232 pre-existing failures
- origin/main: synced
- CodeGraph: indexed
- akasha-loop-daemon v3: running with supervisor PID=4112780
