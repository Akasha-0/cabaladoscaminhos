# 🩺 Health Log — Akasha Portal

> Caderno de bordo do cron `akasha-health-check-12h`
> A cada 12h: status do git, disk, sincronia local/remote

---

## 2026-06-26 (inicial)

### Estado atual
- Working tree: **clean** (último commit em `feat/community-platform`)
- Branch tracking: `feat/community-platform → origin/feat/community-platform` (sincronizado)
- Branch `main`: **divergente** com origin (2114 commits paralelos do Akasha portal fork) — **decisão pendente**
- Disk usage: `node_modules ~500MB, .git ~50MB`
- Plano de pesquisa 10-tracks: **em execução**

### Alertas
- ⚠️ **main branch divergente** — origem tem 2114 commits que não combinam com nosso trabalho. Decisão: ignorar / merge / forçar — pendente do user.
- ✅ Build TypeScript: zero erros nos arquivos modificados
- ✅ 6 crons ativos rodando

### Próximo check
2026-06-27 00:00 UTC (12h)

---

## 2026-06-27 (atualizado) — wave-2 + wave-7 + aprendizados criticos

### Estado atual
- Working tree: modificações de wave-7 agents + ADR docs
- Branches ativos: feat/community-platform (main), feat/dashboard-redesign-2026-06-26, feat/auth-supabase (???)
- 3 planos rodando em paralelo:
  - Wave-7 (plan_d8644267): 3 tasks producing + 3 ready (foundation team)
  - Wave-2B (plan_b769356e): merge task in_progress
  - Wave-2 (plan_a83acfa6): FAILED (timeouts em 3/4 tasks)

### 🔴 DESCOBERTA CRITICA — perda de branches wave-2

**O que aconteceu:**
1. Wave-2 (plan_a83acfa6) dispatchou 4 workers em paralelo
2. Cada worker criou branch isolada (feat/auth-supabase, feat/onboarding-espiritual, feat/posts-api-real, feat/smoke-tests)
3. Workers começaram a escrever código (vi arquivos sendo criados via heartbeat)
4. 3 dos 4 workers foram killed por timeout (15min)
5. Wave-2B (plan_b769356e) tentou fazer merge → DESCOBRIU que branches NAO EXISTEM
6. Workers clonaram worktrees em /tmp; sandbox cleanup provavelmente apagou
7. Nenhum push para origin foi feito → código perdido

**Lições:**
- Workers DEVEM fazer push incremental (cada 5 min)
- Branches NUNCA devem ser locais sem backup em origin
- Worktrees em /tmp são frágeis
- Timeout de 15min é apertado demais para tasks de implementação

**Recovery:**
- Docs de SPEC existem (wave-2-auth-onboarding.yaml tem spec detalhada)
- Aceitar perda como learning
- Documentar em QUALITY-STANDARDS.md
- Próximos waves: tasks menores + push frequente

### Estado dos planos

| Plano | Status | Tasks | Notas |
|---|---|---|---|
| Wave-2 (a83acfa6) | FAILED | 4/4 (3 killed, 1 done parcial) | Auth/Onboarding/Posts código perdido |
| Wave-7 (d8644267) | RUNNING | 3/6 (3 producing, 3 ready) | Criando 6 agents + ADR + auto-trigger |
| Wave-2B (b769356e) | RUNNING | 1/2 (merge bloqueado) | Detectou perda de branches wave-2 |

### Alertas ativos

- 🔴 **Branches wave-2 perdidas** — código não chegou em origin, reflog só
- 🟡 **Sandbox 2GB saturando** com 3 workers em paralelo
- 🟡 **Tool wrapper com bug** em mavis (cron create/update, agent create)
- 🟢 **Wave-7 ainda saudável** — workers em producing, criando deliverables reais

### Próximas ações

1. Aceitar perda wave-2 (não recuperável sem retrabalho)
2. Documentar QUALITY-STANDARDS.md (feito)
3. Wave-7 vai entregar 6 agents + ADRs (alta prioridade)
4. Re-lançar wave-2 com workers +1 task (commits incrementais)
5. Reduzir max_concurrency para 2-3

### Próximo check
2026-06-27 12:00 UTC (12h)

---

## 2026-06-29 16:00 UTC — Health Check #N (cron health-check-12h)

**Cron session:** `akasha-health-check-12h` (task_id `412703456026922`)
**Executor:** session `414498569478277`

### Estado geral
- **main:** ativo. Tip `e57005d` (cycle 51 close). 23 commits em 12h (todos wave-spawner log).
- **feat/community-platform:** ativo. Tip `260efd3f` (notifications templates + 17 testes). 1 commit em 12h. **1925 commits atrasado de main / 50 ahead do merge-base** — divergencia historica controlada.
- **Total atividade (12h):** 132 commits em todas as branches.
- **Branches remotas:** 238 refs no `git ls-remote` (dependabot + feat/community-platform + main + w19..w52 + test-agent).

### Cron paralelo status
| Cron | Schedule | Last Run | Last Result | Notes |
|---|---|---|---|---|
| akasha-dev-implementation | 0 14 * * * | 2026-06-28 14:00 UTC | success | Ultimo run ok |
| akasha-evolution-daily | 0 9 * * * | 2026-06-29 09:00 UTC | success | EVOLUTION-LOG.md atualizado |
| akasha-health-check-12h | 0 */12 * * * | 2026-06-29 16:00 UTC | (este) | — |
| akasha-planning-weekly | 0 8 * * 0 | 2026-06-28 08:00 UTC | success | WEEKLY-PLAN.md |
| akasha-research-weekly | 0 10 * * 1 | 2026-06-29 10:00 UTC | success | EVIDENCE-MAP.md |
| akasha-tests-pre-release | 0 18 * * * | 2026-06-28 18:00 UTC | success | TEST-REPORT.md |
| akasha-wave-spawner | */30 * * * * | 2026-06-29 15:55 UTC | success | Cycle 52 em curso |

**Total:** **7 crons ativos** (nao 4 como mencionado no prompt original — sistema cresceu).

### Wave-spawner activity (12h)
- **Cycle 51:** 5/5 PUSHED, 12,283L, 707 exports. **B-W51-VMHE-TIMEOUT RESOLVIDO** via replacement worker (18min vs 30min cap).
- **Cycle 52 (em curso, 14:50-15:55 UTC):**
  - OK `w52/cockpit-bundle-publish-flow` (229d6e57, 2334L, 251 exports)
  - OK `w52/search-analytics-stream-realtime` (5a1c846d, 2743L, 168 exports)
  - OK `w52/voice-mood-history-anonymizer` (034b0a7f)
  - OK `w52/webhook-dead-letter-queue` (8f6e86ff)
  - EM PROGRESSO `w52/policy-export-portability` — session `414492927312139`
- **4+ w52 branches pushed** (4 confirmados, 1 in-flight). **Total wave branches: ~162** (158 pre-wave 51 + 4 w52 confirmados).
- **12 ciclos seguidos sem colisao** (40-52).

### Divergencia local vs remote
- **Workspace estava vazio no inicio da sessao** (sandbox reset entre cron runs). Clone fresh feito: `git clone --depth 50 https://github.com/Akasha-0/cabaladoscaminhos.git` (~3 min).
- **Tracking fix necessario:** `git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"` antes de `git fetch origin` para branches nao-main. **Lesson durable:** shallow clone tem refspec limitada — sempre setar fetch refspec antes do health-check.
- **Sem divergencia de codigo:** working tree limpo apos clone. Nao houve commits locais pendentes.

### Disk & recursos
- **.git:** 27MB (shallow clone — full history seria ~200MB+)
- **src/:** 4.0MB
- **docs/:** 3.1MB
- **node_modules:** nao instalado nesta sessao (nao necessario para health-check, so para TSC/lint)
- **Disco do workspace:** 968TB disponivel — sem constraint
- **Memoria do sandbox:** 2048MB total, 1978MB available — saudavel

### Alertas
- **Workspace reset entre cron sessions** — esta sessao teve que clonar fresh. Esperado (sandbox ephemeral) mas documentado. Padrao estavel ha 51 ciclos.
- **Wave-spawner throughput excelente** — 12 ciclos sem colisao, ~10-12kL/cycle.
- **feat/community-platform nao estagnada** — 1 commit em 12h + 1925 atrasado de main e o padrao de divergencia controlada.
- **Todos 7 crons rodando** — sem falhas.
- **B-W51-VMHE-TIMEOUT resolvido** — replacement-spawn pattern validado.

### Acoes
- Documentar este check no HEALTH-LOG.md (esta entrada)
- Atualizar cron memory se houver novidade relevante
- Proximo check em 12h: 2026-06-30 04:00 UTC

### Proximo check
2026-06-30 04:00 UTC (12h)
