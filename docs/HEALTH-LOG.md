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
