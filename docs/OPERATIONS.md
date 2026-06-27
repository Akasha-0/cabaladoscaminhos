# ⚙️ Akasha Portal — Operações 24/7

> **Versão:** 1.0 | **Data:** 2026-06-26
> **Status:** Sistema rodando

Este documento descreve o **sistema automatizado** que mantém o Akasha Portal evoluindo continuamente, com time de pesquisa + desenvolvimento + monitoramento trabalhando 24/7 sem parar.

---

## TL;DR

O Akasha Portal tem **6 crons automatizados** rodando em produção, cada um com escopo claro e entregável definido. Eles cuidam de:

- **Implementação diária** (todo dia 14h)
- **Evolução e priorização** (todo dia 9h)
- **Health check** (cada 12h)
- **Pesquisa semanal** (segunda 10h)
- **Planejamento semanal** (domingo 8h)
- **Bateria de testes** (todo dia 18h)

Mais **planos em pipeline** que disparam pesquisas paralelas com 10 agents quando necessário.

---

## 🕐 Mapa de cadência (24h)

```
HORÁRIO (UTC)        EVENTO                          AGENTE
─────────────────────────────────────────────────────────────────────
00:00 ────────────  (sem ação)
06:00 ────────────  (sem ação)
08:00 domingo ────  Planning semanal                 Mavis (cron)
09:00 ────────────  Evolução + priorização           Mavis (cron)
10:00 segunda ────  Research semanal                 Mavis (cron)
12:00 ────────────  Health check                     Mavis (cron)
14:00 ────────────  Implementação diária             Mavis (cron)
18:00 ────────────  Bateria de testes                Mavis (cron)
00:00 ────────────  Health check                     Mavis (cron)

+ Planos paralelos ad-hoc quando gatilhos disparam
```

---

## 🤖 Os 6 crons ativos

### 1. `akasha-dev-implementation`
- **Schedule:** `0 14 * * *` (todo dia 14h UTC)
- **Função:** Implementa **uma feature prioritária** ou corrige **um bug pequeno**
- **Output:** Commit + push na branch `feat/community-platform`
- **Regra:** Não muda >500 linhas sem aprovação; sempre testa antes de commitar

### 2. `akasha-evolution-daily`
- **Schedule:** `0 9 * * *` (todo dia 9h UTC)
- **Função:** Identifica gaps entre planejado e implementado; prioriza tarefas
- **Output:** `docs/EVOLUTION-LOG.md` com data e itens priorizados
- **Regra:** Foco no MVP; não inventa features fora de VISION/STRATEGY

### 3. `akasha-health-check-12h`
- **Schedule:** `0 */12 * * *` (cada 12h)
- **Função:** Health check do projeto (git sync, disk, status geral)
- **Output:** `docs/HEALTH-LOG.md`
- **Regra:** Detecta divergências local/remote precocemente

### 4. `akasha-planning-weekly`
- **Schedule:** `0 8 * * 0` (domingo 8h UTC)
- **Função:** Revisão do roadmap; ajusta prioridades baseado no que foi aprendido
- **Output:** `docs/WEEKLY-PLAN.md` com plano da semana
- **Regra:** Documenta decisões e bloqueios

### 5. `akasha-research-weekly`
- **Schedule:** `0 10 * * 1` (segunda 10h UTC)
- **Função:** Mantém atualizado sobre papers, regulamentações, concorrentes
- **Output:** `docs/EVIDENCE-MAP.md` + `docs/REGULATORY-ALERTS.md` + `docs/COMPETITOR-WATCH.md`
- **Regra:** Sempre cita fontes; não inventa números

### 6. `akasha-tests-pre-release`
- **Schedule:** `0 18 * * *` (todo dia 18h UTC)
- **Função:** Roda bateria de testes (TypeScript, lint, novos testes para arquivos modificados)
- **Output:** `docs/TEST-REPORT.md` com status, cobertura, pendências
- **Regra:** Não commita código quebrado

---

## 📚 Cadernos de bordo

Os crons alimentam documentos que viram a memória do projeto:

| Documento | Alimentado por | Pra quê serve |
|---|---|---|
| `docs/EVOLUTION-LOG.md` | akasha-evolution-daily | Lista priorizada do que fazer |
| `docs/HEALTH-LOG.md` | akasha-health-check-12h | Histórico de saúde do projeto |
| `docs/DEV-LOG.md` | akasha-dev-implementation | Decisões de implementação |
| `docs/TEST-REPORT.md` | akasha-tests-pre-release | Status dos testes |
| `docs/WEEKLY-PLAN.md` | akasha-planning-weekly | Plano da semana |
| `docs/REGULATORY-ALERTS.md` | akasha-research-weekly | Alertas legais |
| `docs/COMPETITOR-WATCH.md` | akasha-research-weekly | Movimento da concorrência |

---

## 🎯 Planos paralelos (ad-hoc)

Além dos crons, **planos paralelos com 10 agents** podem ser disparados quando há necessidade de pesquisa profunda ou sprint especial. Exemplos:

- `plan_1a2cd12d` — Pesquisa e planejamento da próxima fase (MVP comunidade) — **em andamento**
- Futuros planos podem ser criados sob demanda

Cada plano tem:
- **Tasks paralelas** (até 7 simultâneas)
- **Verificação independente** (Verifier valida cada entregável)
- **Synthesis gate** que consolida achados
- **Entregável final** com specs prontas pra implementação

---

## 🧠 Princípios do sistema 24/7

1. **Trabalho contínuo, mas incremental** — uma feature por vez, não grandes refactors
2. **Sempre testar antes de commitar** — TypeScript zero errors é o mínimo
3. **Documentar tudo** — cadernos de bordo são a memória do projeto
4. **Não inventar** — pesquisa cita fontes; código compila
5. **User-in-the-loop** — decisões grandes voltam pro user; crons só decidem coisas pequenas
6. **Graceful degradation** — se um cron falha, sistema continua funcionando

---

## 🔧 Como ajustar o sistema

### Adicionar cron novo

Infelizmente o tool wrapper atual tem bug com `cron create` (recebe `undefined` nos args). Workaround: **editar o `state.json` do cron diretamente** ou **aguardar fix do wrapper**.

### Parar/pausar cron

Quando o tool wrapper voltar a funcionar:

```bash
mavis({ command: "cron update", args: { task_id: "...", enabled: false } })
```

### Disparar cron manualmente

```bash
mavis({ command: "cron trigger", args: { task_id: "..." } })
```

### Ver logs

Os logs estão em:
- `/workspace/.mavis/plans/<plan-id>/outputs/` — deliverables dos planos
- `docs/*.md` — cadernos de bordo dos crons
- Output do `mavis session list` — sessões ativas

---

## 📊 Estado atual (2026-06-26)

- **6 crons ativos** ✅
- **Plano de pesquisa em andamento** (10 tracks, ~30 min cada)
- **Branch atual:** `feat/community-platform` com 15+ commits
- **Última atividade:** 2026-06-26 22:30 UTC
- **Próximo marco:** Synthesis do plano de pesquisa + specs da próxima fase

---

> Última atualização: 2026-06-26
> Próxima revisão: a cada sprint (semanal)
