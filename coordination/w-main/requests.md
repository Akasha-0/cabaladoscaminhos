# coordination/w-main/requests.md

## Escalação ao Integrador — Ciclo 526 (BLOQUEADOR CRÍTICO)

**De**: w-main (main branch, executor + integrator)
**Data**: 2026-06-12
**Ciclo**: 526

---

### AÇÃO CRÍTICA REQUERIDA: `./setup-swarm.sh`

**Blocker presente há 4 ciclos (522-525)**. Sem worktrees, nenhum worker pode implementar features.

**O que `./setup-swarm.sh` faz**:
- Cria `../cabala-dos-caminhos-w1` (branch `loop/w1`)
- Cria `../cabala-dos-caminhos-w2` (branch `loop/w2`)
- Você continua neste terminal como main/integrator
- Cada worker opera em branch isolado — sem poluir main

**Pré-requisito**: `git status` clean

**Após executar**:
- w1: P2 cross-engine.ts `_kab`/`_date` cleanup
- w2: P3 Capacitor APK
- w4: corrigir 480 test failures

**Alternativa** (sem swarm): w-main precisa de branch `loop/w-main` próprio para isolar trabalho de motor.

---

### Items pendentes por domínio (quando worktrees existirem)

| Domínio | Item | Impacto |
|---------|------|---------|
| w1 (motor) | P2 cross-engine.ts `_kab`/`_date` | Remover params órfãos — 0 chamadas externas |
| w1 (motor) | I Ching Wings | Já integrado em main (确认) |
| w2 (UI) | P3 Capacitor APK | `npx cap sync` + APK instalável |
| w4 (qualidade) | 480 test failures | Rotas ausentes + mock cookies + vitest projects |

---

## Escalação ao Integrador — Ciclo 523 (RESOLVIDO)

**De**: w-main (main branch, executor + integrator)
**Data**: 2026-06-12
**Ciclo**: 523

### AÇÕES RESOLVIDAS NESTE CICLO

| Item | Status | Ação |
|------|--------|------|
| P1 chainOfReasoning | ✅ RESOLVIDO | Confirmado em `AkashaLifeAreasDashboard.tsx:476` |
| `./setup-swarm.sh` | ✅ JÁ EXISTE | `coordination/` criado |
| feature/akasha-v0.0.12 stale | ✅ RESOLVIDO | 6 commits ja em main (ciclo 524) |
| Test failures (480 failed) | ⏳ PENDENTE | w4 não pode ser ativado sem setup-swarm |
| cross-engine _kab/_date | ⏳ PENDENTE | Domínio w1 — backlog |

### Histórico

- Ciclo 521: w2 integrado, P3 AKASHA completo
- Ciclo 522: Hygiene (Link, const, eslint), w2 requests limpos
- Ciclo 523: Qualidade + auditoria AGENTS.md + CHECKPOINT.md
