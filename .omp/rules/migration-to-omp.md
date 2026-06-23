---
name: migration-to-omp
description: Migration map from .autonomous/multi-agent/ (legacy daemon) to OMP/ECC native. Use when picking between the two stacks or auditing leftover .autonomous/ scripts.
condition:
  - '\.autonomous/multi-agent/'
  - 'akasha-loop-daemon\.py'
  - 'agent_orchestrator\.py'
interruptMode: tool-only
level: high
priority: 3
---

## Status (2026-06-22)

- **Phase 1 (DONE, persisted commit `f0fd8e81` 2026-06-22 12:46:07)**: Move canônicos do `.autonomous/multi-agent/` para `.omp/`.
  - `scripts/harness-audit.js` → `.omp/scripts/harness-audit.js` (done; 625 LOC, rubric 2026-05-19)
  - `.omp/agents/harness-optimizer.md` callers updated (done; path `.omp/scripts/harness-audit.js`)
  - `.omp/rules/migration-to-omp.md` (this file, 6217 bytes) added (done; 22-row substitution map + 7 gaps)
  - `.gitignore` extended with 18 runtime-leak patterns + removed stale `.omp/agents/` block (done)
  - Stale `.agent-prompt-*.txt` cleaned (done; 4 leaked → 0; daemon re-leaks but gitignored)
  - **Discovered gap**: HTTP 429 from `vercel-ai-gateway` auto-thinking classification breaks `omp commit` (documented as Gap #6 + Gap #7)
- **Phase 2 (BLOCKED)**: Write `.omp/loop/akasha-mvp.ts` — TypeScript daemon substituto. **Unblock requires**: resolve 429 rate-limit (Gap #6: feature flag for auto-thinking; Gap #7: respect PI_PLAN_MODEL in classification).
- **Phase 3 (BLOCKED)**: Archive `.autonomous/multi-agent/` → `.autonomous/_archive/multi-agent-2026-06-22/`. **Unblock requires**: Phase 2 stable.

**Note on score 87→87:** O `harness-audit.js` mede categorias aplicáveis (tool coverage, context efficiency, quality gates, memory persistence, eval coverage, security guardrails, cost efficiency, github integration + deploy markers). Score mantido em 87/90 reflete que a auditoria prévia já capturou a maior parte dos pontos de housekeeping antes da extensão do `.gitignore`. O ganho real está em:
  - Prevenir regressão: 10+ novos `.agent-prompt-ta-*.txt` seriam commitados diariamente sem o fix
  - Reduzir surface area de git corruption (locks órfãos já existem; .gitignore evita futuros)
  - Documentar gaps estruturais (#1-#7) para Phase 2 com critérios de desbloqueio explícitos

## 1:1 substitution map

| Legacy (`.autonomous/multi-agent/`) | OMP/ECC replacement | Status |
|---|---|---|
| `akasha-loop-daemon.py` (96K, 6-phase machine) | `team-agent-orchestration` skill + agents OMP (researcher + coder + qa + validator) | Phase 2 |
| `agent_orchestrator.py` (32K, agent pool) | `agent-harness-construction` skill + `.omp/settings.json` worktree isolation | Phase 2 |
| `memory_manager.py` + `memory_compressor.py` (76K) | `context-budget` skill + `.omp/config.yml.compaction` (already configured) | drop |
| `context_engine.py` (28K) | `.omp/config.yml.compaction` (handoff strategy, 100k threshold) | drop |
| `prompt_engine.py` (20K) | `agent-harness-construction` §Observation Design + agents OMP | Phase 2 |
| `reasoning_chain.py` (60K) | drop — log showed 3x duplicate entries (broken dedup); replace with `deep-research` + `plan-orchestrate` | drop |
| `project_map.py` (44K, scoring 9 areas) | drop — log showed same 5 candidates infinitely; replace with `product-capability` skill | drop |
| `smart_iterator.py` (36K) | `plan-orchestrate` skill (per-step agent chain) | Phase 2 |
| `specialist_agents.py` (28K) | agents OMP (architect, coder, designer, qa, researcher, validator) | drop |
| `adaptive_pacer.py` (32K) | `.omp/config.yml.thinkingBudgets` (already configured) | drop |
| `loop_optimizer.py` (52K) | `benchmark-optimization-loop` skill | drop |
| `self_healer.py` (40K) | `safety-guard` skill + `.omp/hooks/pre/` (already 2 hooks) | drop |
| `predictive_engine.py` (20K) | `continuous-learning-v2` skill (inste-based learning) | drop |
| `skill_discoverer.py` (24K) | `skill-scout` + `configure-ecc` skill | drop |
| `continuity_manager.py` (20K) | `.omp/settings.json.compaction.handoffSaveToDisk` (already configured) | drop |
| `guardian.py` (32K, supervision) | `.omp/hooks/pre/block-destructive.ts` + `require-omp-commit.ts` (already 2) | drop |
| `telemetry.py` (16K) | `cost-tracking` skill + `.omp/scripts/harness-audit.js` scorecard | drop |
| `evals.py` + `eval-report.py` (32K) | `eval-harness` skill + `.omp/scripts/harness-audit.js` | drop |
| `run-24-7.sh` + `start-akasha-evolution.sh` | OMP CLI on-demand (`claude --model X -p "..."`) | Phase 2 |
| `akasha-evolution-loop.py` (12K) | drop — entrypoint redundante com OMP CLI | drop |
| `run-loop-supervised.sh` (8K) | drop — supervisord do daemon morto | drop |

## Gaps documented

### Gap #1 — `prompt_file.unlink()` ausente
- **Onde**: `agent_orchestrator.py:247` (escreve `.agent_script_{aid}.py`, nunca deleta).
- **Skill ECC**: `agent-harness-construction` §Error Recovery Contract (root cause hint + safe retry + explicit stop condition).
- **Status**: NÃO corrigido (Phase 2+). Mitigado pelo `.gitignore` que já cobre os paths.

### Gap #2 — Observation contract incompleto
- **Onde**: `_AGENT_SCRIPT` template (agent_orchestrator.py:155-201) retorna `{success, output, stderr, rc, files_changed, files_changed_count}`.
- **Skill ECC**: `agent-harness-construction` §Observation Design exige `{status, summary, next_actions, artifacts}`.
- **Status**: NÃO corrigido (Phase 2+). Loop "no agents, no results after 45s — going to QA" é sintoma direto.

### Gap #3 — PLANNING cards sem Kanban fields
- **Onde**: daemon `_spawn` + `task-implementation.json` emite 9 cards sem `owner`, `branch`, `worktree`, `acceptance`, `merge_gate`.
- **Skill ECC**: `team-agent-orchestration` classifica como "Board theater".
- **Sintoma**: log mostrou `[critical] FIXED: Duplicate Odu reduction algorithms` listado 3x — falta dedup.
- **Status**: NÃO corrigido (Phase 2+).

### Gap #4 — MemoryCompressor threshold arbitrário
- **Onde**: `memory_compressor.py` (não lido, presumido do log: 961873 tokens estimados vs 32k budget = 30x).
- **Skill ECC**: `agent-harness-construction` §Context Budgeting: "Compact at phase boundaries, not arbitrary token thresholds".
- **Mitigação atual**: `.omp/config.yml.compaction.thresholdTokens: 100000` com `strategy: handoff`.
- **Status**: mitigado pela config OMP nativa, não precisa de patch.

### Gap #5 — Stale git locks de agents mortos
- **Onde**: `.git/index.stash.{1057105,1059203,1064987}.lock` (0 bytes cada, PIDs dos `ta-*` agents).
- **Origem**: agentes spawnados pelo daemon em 2026-06-22 06:53 UTC; daemon morreu, locks não foram limpos.
- **Backup relacionado**: `.git.bak-1782142418/` (backup completo de `.git/` no momento da quase-corrupção).
- **Mitigação atual**: `.gitignore` cobre os paths. Locks órfãos são 0 bytes, não corrompem o índice.
- **Skill ECC aplicável**: `agent-harness-construction` §Error Recovery Contract (cleanup-stale-locks como next_action obrigatório).
- **Status**: limpo uma vez. Risco de recorrência até Phase 2 estabilizar.

### Gap #6 — OMP auto-thinking classification 429 loop
- **Onde**: `~/.omp/logs/omp.2026-06-22.log` (3.5MB; ~2367 ocorrências em 24h).
- **Sintoma**: `auto-thinking: classification failed; using fallback level` repete a cada 2-3s com erro `429 Token Plan usage limit reached`. PID 2529098 fica em loop de retry contra o provider `vercel-ai-gateway`.
- **Impact**: `omp commit` chama o auto-thinking classifier antes de gerar mensagem; enquanto o 429 durar, todo `omp commit` dá timeout. Hook `require-omp-commit.ts` força `omp commit`, então commits ficam bloqueados.
- **Skill ECC aplicável**: `agent-harness-construction` §Error Recovery Contract — feature flag para desabilitar auto-thinking em caso de rate-limit.
- **Status**: NÃO corrigido. Workaround: `OMP_COMMIT_429_BYPASS=1 git commit --no-verify -m "..."` (a implementar como exceção no hook).
- **Unblock path**: adicionar env-flag check no `.omp/hooks/pre/require-omp-commit.ts`.

### Gap #7 — Auto-thinking model hardcoded para vercel-ai-gateway/MiniMax-M2.7-highspeed
- **Onde**: `.omp/config.yml` (presumido; não lido nesta sessão).
- **Sintoma**: `PI_PLAN_MODEL=MiniMax-M3` configurado mas auto-thinking chama `vercel-ai-gateway/minimax/MiniMax-M2.7-highspeed` hardcoded → causa o HTTP 429 do Gap #6 quando provider throttles.
- **Mitigação parcial**: commit `f0fd8e81` reverteu spawn model do daemon para `MiniMax-M2.7-highspeed` historically-valid (`akasha-loop-daemon.py` linhas do revert). Mas o auto-thinking do OMP runtime continua hardcoded.
- **Status**: MITIGADO para o daemon (spawn model revertido) mas NÃO corrigido para o OMP runtime (auto-thinking).
- **Unblock path**: investigar `.omp/config.yml` → seção `autoThinking.model` se houver, e alinhar com `PI_PLAN_MODEL`.

## Next-action contract (Phase 2)

Daemon substituto em `.omp/loop/akasha-mvp.ts` deve:
1. Consumir agents OMP via `claude --model X -p "..."` (não `omp -p`).
2. Emitir `{status, summary, next_actions, artifacts}` em todo observation.
3. Em `files_changed == 0` por N iterações, emitir `status: warning` + `next_actions: [stop-loop, investigate-orchestrator]`.
4. Compaction at phase boundaries, não threshold arbitrário.
5. `prompt_file.unlink()` em todos os caminhos de saída (sucesso, falha, timeout).
6. PLANNING cards com schema `team-agent-orchestration` completo.
7. Cleanup de locks/lockfiles órfãos como parte do startup recovery.
