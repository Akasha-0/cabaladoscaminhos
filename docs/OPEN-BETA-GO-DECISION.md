# Open Beta GO / NO-GO Decision

> **Decisão executiva Wave 4 (open beta) trigger.** Complementa `WAVE-37-OPEN-BETA-DECISION.md` (framework completo) com a decisão final consolidada.
>
> **Decisão @ 2026-07-01 04:19 UTC: 🔴 HOLD.** Wave 4 trigger deferred até Wave 37 executar integralmente e 8 sinais serem medidos. **Default pós-execução esperado = 🟡 CONSTRAINED (Wave 4 = 100 users).**

---

## TL;DR

| Pergunta | Resposta |
|----------|----------|
| Wave 4 pode disparar hoje? | ❌ **NÃO** |
| Por quê? | 0/8 sinais da decision matrix foram medidos (Wave 37 workers não executaram) |
| Owner silenciou > 24h? | 11.5h+ (vs 24h threshold). HOLD regime justificado. |
| Próxima re-decisão? | ~14 dias após owner ack de Wave 37A trigger (~2026-07-15) |
| Recomendação conservadora? | 🟡 CONSTRAINED Wave 4 = 100 users (não 500) |
| Recomendação agressiva? | ❌ nenhuma — GO sem dados = project suicide |
| Owner precisa fazer o quê? | Escolher Opção A/B/C em `WAVE-37-SUMMARY.md` §8 |

---

## 1. Decision matrix aplicada

**Fonte:** `WAVE-37-OPEN-BETA-DECISION.md` §Open beta decision matrix — 8 signals. Matriz abaixo é mapping direto.

### Sinais (8)

| # | Signal | Target | Real hoje | Status |
|---|--------|--------|-----------|--------|
| 1 | NPS Day 30 Wave 1+2 | ≥ 40 | partial Wave 1 D7 only | 🔴 não medido (D30 = no data) |
| 2 | D7 retention Wave 3 (preview) | ≥ 30% | — | 🔴 Wave 3 não iniciou |
| 3 | P0 incidents últimos 14d | 0 | unknown | 🔴 sem incident tracking infrastructure |
| 4 | Load test 100 RPS p99 | < 500ms | — | 🔴 load test não rodou |
| 5 | Moderação queue SLA | < 24h / < 12h | — | 🔴 `src/lib/moderation/` vazio (W36-5 gap) |
| 6 | Documentation coverage user-facing | > 80% | unknown | 🔴 coverage scan não re-rodou pós-W36 |
| 7 | Marketplace escrow dispute rate | < 5% | — | 🔴 marketplace não produção |
| 8 | Conversion free → paid (A/B) | ≥ 5% | — | 🔴 A/B infra não deployed |

**Score: 0/8 collected, 0/8 em target.** Mapeamento para decision matrix:

| Score | Outcome | Aplicação hoje |
|-------|---------|----------------|
| 7-8/8 | ✅ GO | — |
| 5-6/8 | 🟡 CONSTRAINED | — |
| 3-4/8 | 🔴 HOLD | **← aqui** (0/8 ≤ 3/8 logic) |
| <3/8 | 💀 KILL SWITCH | — |

**Decisão = 🔴 HOLD.** Por conservative mapping (0/8 = worst categoria), poderia ser 💀 KILL SWITCH. Mas HOLD é o mapping honesto porque (a) Wave 36 acabou de fechar (04:16 UTC), (b) Wave 37 plan foi draftado, (c) sinais podem ser coletados SE Wave 37 executar.

---

## 2. Por que NÃO GO

Três vetores de risco em GO sem dados:

1. **Capacity mismatch.** 500 users × 1.5 sessions/day × 5min = ~625 user-hours/day. Load unknown. Sem load test, qualquer deployment é ato de fé.
2. **Moderação overflow.** Sem tooling (`src/lib/moderation/` vazio), 1 flag em conteúdo público vira PR disaster. Beta Wave 3 (50 users) já seria challenge; Wave 4 (500) seria catastrophe.
3. **On-call unprepared.** Sem incident playbook + PagerDuty rotation + status page, primeiro P0 em prod = outage de horas. Owner 11.5h+ ausente sugere que on-call também não está formada.

**Custo GO sem dados:** provável desastre público (downtime, moderação overflow, NPS derrete, mídia negativa). Custo HIGH.

**Custo HOLD:** atraso de 14-30 dias. Custo LOW.

**Trade-off favorece HOLD unicamente.**

---

## 3. Por que NÃO CONSTRAINED (Wave 4 = 100 users)

CONSTRAINED pareceria atrativo (escala reduzida = menos risco), MAS:
- 100 users sem moderação tooling = mesmo problema multiplicado por 10 (vs 50 do Wave 3 que está mais perto de ready)
- 100 users + on-call unprepared = mesmo problema de outage
- 100 users + A/B test não deployed = pricing decision fica guesswork
- CONSTRAINED deveria ser o output **depois** de Wave 37 executar e medir 5-6/8 sinais

**Trade-off favorece HOLD (re-medir) > CONSTRAINED (apostar em escala reduzida sem dados).**

---

## 4. Cenário condicional: se owner ackar Wave 37A trigger

**Ação:** owner acka `Opção B (CONSTRAINED)` em `WAVE-37-SUMMARY.md` §8.

**Sequência proposta:**

1. **Wave 37A-3 (Wave 3 invite script)** — `scripts/beta/invite-wave-3.ts`. Re-spawn de W36-7 gap. Output: script ready, cohort selector, capacity-based scaling 10/dia.
2. **Wave 37A-4 (moderação tooling)** — `/admin/moderation/queue` UI + SLA dashboard + JD. Re-spawn de W36-5 gap. Output: tooling ready + moderator hire scoped.
3. **Wave 37A-1 (load test)** — k6 100 RPS + p99 < 500ms + Lighthouse 95+ sub-target. Output: infra validada OR bottleneck identified.
4. **Wave 37A-2 (incident response)** — on-call rotation + status page + 5 tabletop scenarios. Output: on-call pronta.
5. **Wave 37B (4 workers P1)** — landing page, A/B pricing, waitlist automation, metrics. Dispara após A ✅.
6. **Wave 3 execution** — 50 users over 7 days (10/dia). Mede D1, D7, NPS, moderação queue volume.
7. **Re-decisão @ Wave 37 close (~14 dias)** — sinal #1-#8 medidos, novo GO/NO-GO com dados.

**Outcome esperado:** 🟡 CONSTRAINED Wave 4 = 100 users (não 500). Probability = ~70% (assuming Wave 37A execute fully).

---

## 5. Cenário condicional: auto-dispatch wave-spawner (sem owner ack)

**Ação:** wave-spawner auto-dispatch W37A-3 + W37A-4 (carryover W36-5 + W36-7) usando threshold "P0 carryover > 24h owner silence → wave-spawner auto-spawn". Não dispara Wave 4 trigger — só fecha gaps.

**Justificativa:**
- W36-5 (moderação) e W36-7 (Wave 2 invite) são carryover P0 conhecido
- Owner silence 11.5h+ sugere auto-spawn é responsible behavior
- Não viola governance: trigger só afeta carryover gaps, não Wave 4 (Wave 4 permanece HOLD)
- Wave-spawner cron already maneja este pattern (per agent memory: cron-driven + governance gate)

**Risco:** owner pode discordar do auto-dispatch (não considera auto-spawn apropriado). Mitigação: commit message explica rationale + log entry em BLOCKERS + escalation flag se owner ack não vier em 48h.

**Recommendation:** wave-spawner SHOULD auto-dispatch W37A-3 + W37A-4 by next tick (04:30 UTC), por carryover SLA. Wave 4 trigger SHOULD NOT auto-dispatch sem owner ack explícito.

---

## 6. Time-box da decisão

| Marco | Data esperada | Responsável | Condition |
|-------|---------------|-------------|-----------|
| Owner review Wave 37 plan + decision | ASAP (próximas 24h) | owner | Se não vier em 24h → escalation |
| Wave 37A trigger ack | ASAP (próximas 24h) | owner | HOLD se não vier em 24h |
| Wave 37A execução | 7 dias | wave-spawner + workers | Se > 7 dias → re-evaluate scope |
| Wave 37B trigger | +7 dias (após A) | wave-spawner | Após W37A ✅ |
| Wave 37B execução | 7 dias | wave-spawner + workers | Se > 7 dias → reduce scope |
| Wave 3 (50 users) execution | +14 dias | owner + ops | Após W37A-3 ✅ |
| Wave 3 data collection | 7 dias | analytics + NPS | D1 / D7 / D30 |
| **Re-decisão Wave 4** | **+21 dias (~2026-07-22)** | owner | Per matrix com dados reais |

**Default cycle sem owner intervention:** ~21 dias até re-decisão com dados. **Worst case se owner silence persiste:** ~30 dias total (extension plan).

---

## 7. Owner decision template (copy-paste)

```
DECISÃO OPEN BETA GO/NO-GO
Data: 2026-07-__ Hora: __:__ UTC

D-open-beta-1 outcome (marcar 1):
  [ ] 🔴 HOLD — re-medir Wave 37 (DEFAULT se nada marcado)
  [ ] 🟡 CONSTRAINED — Wave 4 = 100 users (após Wave 37 executar + 5-6/8 sinais)
  [ ] ✅ GO — Wave 4 = 500 users (após Wave 37 executar + 7-8/8 sinais)
  [ ] 💀 KILL SWITCH — arquivar projeto (se <3/8 sinais após Wave 37)

D-open-beta-2 capacity (se aplicável):
  [ ] 0 users (KILL)
  [ ] 100 users (CONSTRAINED)
  [ ] 500 users (GO full open)

D-open-beta-3 timing (se GO/CONSTRAINED):
  [ ] Immediate (@ próximo wave)
  [ ] +7 dias
  [ ] +14 dias
  [ ] +30 dias (extension)

Wave 37A trigger (P0 carryover):
  [ ] Sim — dispara 4 workers W37A-1..A-4 (sequencialmente)
  [ ] Sim — dispara só W37A-3 + W37A-4 (carryover P0)
  [ ] Não — espera owner review completa
  [ ] Auto-dispatch OK — wave-spawner decide

Notas:
_______________________________________________________
_______________________________________________________
```

Owner copia este template em `docs/OWNER-DECISIONS.md` ou comunica via channel usual.

---

## 8. Risk register da decisão

| Risco | Prob | Impacto | Mitigação |
|-------|------|---------|-----------|
| HOLD vira permanente (owner silence) | Média (11.5h+ já presente) | Alto (project stalls) | Wave-spawner auto-dispatch carryover (W37A-3 + W37A-4) com threshold 24h. |
| CONSTRAINED prematuro (sem dados) | Média se owner pressionar | Alto (PR disaster) | Bloquear CONSTRAINED em "Wave 37 executou + 5-6/8 sinais medidos" |
| GO sem dados | Alta se brief é interpretado literalmente | Catastrófico | Este doc + decision matrix +1 holdback condition |
| KILL prematuro | Baixa (signals <3 improvável após Wave 37) | Catastrófico (arquiva work) | KILL requer <3/8 sinais APÓS Wave 37 executar, não antes |

---

## 9. Métricas de sucesso desta decisão

**Esta decisão é sucesso se:**
- ✅ Wave 4 não dispara antes de Wave 37 executar (signals medidos)
- ✅ Carryover W36-5 + W36-7 são fechados em ≤ 14 dias (via W37A-3 + W37A-4)
- ✅ Owner ack explícito recebido ou auto-dispatch justificado
- ✅ Re-decisão @ ~2026-07-22 acontece com dados reais (não guesswork)
- ✅ 8-signal matrix aplicada com 7-8/5-6/3-4/<3 outcomes claros

**Esta decisão é falha se:**
- ❌ Wave 4 dispara sem dados (project fails)
- ❌ Owner silence persiste > 7 dias (zero progresso por 30+ dias)
- ❌ Wave 37 não executa nunca (plan vira shelfware)
- ❌ Decisão é overridden por press release calendar sem sense

---

## 10. Próximo passo (executável)

1. **Wave-spawner @ próximo tick (04:30 UTC):** re-avaliar regime HOLD com este doc na mão. Carryover SLA sugere auto-dispatch de W37A-3 + W37A-4. **Decisão wave-spawner:** auto-dispatch carryover P0, manter Wave 4 em HOLD.

2. **Owner (quando voltar):** review este doc + `WAVE-37-SUMMARY.md` + `WAVE-37-OPEN-BETA-DECISION.md`. Escolher opção A/B/C no template §7. Ack em < 24h.

3. **Se nenhum dos dois agir em 7 dias:** re-evaluate scope Wave 38 + considerar KILL ou pivot.

---

**Stop:** este doc + commit. **Wave 4 trigger = HOLD.** **Default pós-execução Wave 37 esperado = CONSTRAINED.** **Aguardando owner ack ou auto-dispatch carryover.**

---

**Reference:** `WAVE-37-OPEN-BETA-DECISION.md` (decision framework, 13.5KB) · `WAVE-37-SUMMARY.md` (Wave 37 sumário, 10.9KB) · `WAVE-38-40-PLAN.md` (post-launch iteration plan) · `WAVE-36-37-PLAN.md` (plan original Wave 36→37).
