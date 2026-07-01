# Wave 37 — Wave 3 + Open Beta Decision Framework

> Decision matrix for Wave 37 close → Wave 4 (open beta) GO/NO-GO. Combines Wave 1-3 real signals + load test + incident history + moderation capacity + pricing experiment + documentation coverage + marketplace stability.

## TL;DR

Wave 37 = **scale prep + open beta gate.** Sai de "fechar gaps Wave 35/36" (W36) e entra em "preparar volume 50 → 500 users + decidir se abre." A decisão é **baseada em 8 sinais medidos**, não em calendário.

- **8 sinais medidos:** NPS D30, D7 retention Wave 3, P0 incidents/14d, load test p99, moderação SLA, doc coverage, marketplace dispute rate, conversion free→paid
- **3 outcomes:** GO (open beta Wave 4 com 500 users), CONSTRAINED (Wave 4 = 100 users focused iteration), HOLD (Wave 38 = re-evaluate strategy)
- **5 sub-waves paralelas (A scale prep + B open beta prep) + 1 Wave 37 summary**

---

## Contexto

**Estado @ Wave 36 close (parcial):**

- main @ `f148f666` (W34 summary HEAD)
- TSC = 0 (W34 close-out, working tree tem gaps W35/W36 não comitados)
- Beta Wave 1 (10 users white-glove) enviada, NPS Day 1-7 coletado
- Beta Wave 2 (20 users intensive) PREPARADA mas convite bloqueado por W36-5 (moderação) + W36-7 (Wave 2 invite script) gaps
- Beta Wave 3 (50 users hybrid) NÃO iniciada
- Open beta Wave 4 (500 users) DECISÃO = este doc
- Carryover P0: W36-5 moderação + W36-7 Wave 2 invite + W36-2 eval + W36-4 KB content

**Wave 36 → Wave 37 gap (working tree, 2026-07-01 04:05 UTC):**

- 22 arquivos W36-novos (perf + patches + notifications-v2 + blog + specialized-prompts)
- 0 commits W36 no main (workers ainda em flight)
- Diretório `src/lib/moderation/` VAZIO (W36-5 não entregue)
- `scripts/beta/select-wave-2.ts` AUSENTE (W36-7 não entregue)

**Implicação:** Wave 37A-3 (Wave 3 invite) + Wave 37A-4 (moderação tooling) são re-spawns de carryover W36 + scale prep nova. **Wave 37 não é "Wave 36 + 1 nova feature" — é "Wave 36 gaps + Wave 36B-4/5 blockers + Wave 3 scale + Wave 4 decision."**

---

## Wave 37 plan — 8 workers paralelos

### Sub-wave 37A — Scale prep (P0)

**Objetivo:** fechar carryover W36 + preparar infra para Wave 3 (50 users) + Wave 4 (500 users).

| # | Trilha | Tipo | Output esperado | Carryover? |
|---|--------|------|-----------------|------------|
| W37A-1 | Performance audit under load | Coder + DevOps | `docs/PERFORMANCE-AUDIT-W37.md` com k6 load test 100 RPS + p99 latency < 500ms + bottlenecks identificados + Lighthouse 95+ sub-target | usa infra W36-3 perf |
| W37A-2 | Incident response playbook | DevOps | `docs/INCIDENT-RESPONSE-PLAYBOOK.md` + on-call rotation (PagerDuty) + status page (statuspage.io) + 5 tabletop scenarios | usa infra W36-1 patches |
| W37A-3 | Invite Wave 3 (50 users) | Ops | `scripts/beta/invite-wave-3.ts` (hybrid track) + cohort selector + capacity-based scaling (10/dia até 50) | **RE-SPAWN W36-7 Wave 2 aqui (consolidar)** |
| W37A-4 | Moderação tooling + hire plan | PM + Coder | `/admin/moderation/queue` UI + SLA tracking dashboard + training materials + JD para primeiro human moderator | **RE-SPAWN W36-5 aqui** |

### Sub-wave 37B — Open beta prep + decision (P1)

**Objetivo:** preparar terreno para open beta Wave 4 (500 users) baseado em sinais reais.

| # | Trilha | Tipo | Output esperado |
|---|--------|------|-----------------|
| W37B-1 | Public launch preparation | Designer + PM | landing page update + press kit + community guidelines público + blog post announcement |
| W37B-2 | Pricing experiment setup | Coder + PM | A/B test infrastructure + pricing page variants (free-beta vs freemium vs paid) + tracking + Stripe integration |
| W37B-3 | Open beta waitlist automation | Ops + Coder | waitlist → invite automático quando vaga abre (Wave 4 capacity 500) + email sequence + capacity-based throttling |
| W37B-4 | Metrics consolidation + Wave 37 summary | Coder + PM | `docs/BETA-METRICS-W35-37.md` (consolidated D1/D7/D30 + NPS breakdown + funnel analysis + cohort heatmap) + este doc + Wave 37 summary |

### Dependências

- W37A-1 → W37B-3 (load test precisa validar que aguenta open beta auto-invite)
- W37A-2 → W37B-3 (incident response precisa estar publicado antes de auto-invite Wave 4)
- W37A-3 → W37A-4 (Wave 3 convites antes de expandir moderação)
- W37B-2 → W37B-1 (pricing variant precisa existir antes do launch page)
- W37A-1 + W37A-2 + W37B-4 → Open beta gate (todos os 3 inputs precisam estar completos)

### Stop conditions Wave 37

- Se load test falha 100 RPS p99 < 500ms → HOLD W37B-3, otimizar antes
- Se on-call rotation sem voluntários → HOLD W37B-3, contratar antes
- Se A/B test infrastructure tem bug → HOLD W37B-2 launch, fix
- Se 2/8 metrics abaixo do target → CONSTRAINED beta (Wave 4 = 100 users), HOLD full open
- Se 4/8 metrics abaixo do target → HOLD Wave 4, iterate Wave 1-3

---

## Open beta decision matrix — 8 signals

**Cada signal é medido na Wave 37 close. Decisão agregada segue matriz abaixo.**

| # | Signal | Target | Real (a medir) | Se < target |
|---|--------|--------|----------------|-------------|
| 1 | **NPS Day 30 Wave 1+2** | ≥ 40 | — | Hold, iterate onboarding + Akasha RAG |
| 2 | **D7 retention Wave 3 (preview)** | ≥ 30% | — | Hold, focus on D1 activation |
| 3 | **P0 incidents últimos 14d** | 0 | — | Hold, fix root cause + post-mortem |
| 4 | **Load test 100 RPS p99** | < 500ms | — | Hold, optimize (cache, query, CDN) |
| 5 | **Moderação queue SLA** | < 24h (P1) / < 12h (P2) | — | Hire human moderator antes |
| 6 | **Documentation coverage user-facing** | > 80% (FAQ + KB + wiki + guides) | — | Hold, finish docs |
| 7 | **Marketplace escrow dispute rate** | < 5% | — | Hold, improve verification |
| 8 | **Conversion free → paid (A/B)** | ≥ 5% (Wave 1+2 pagariam por premium) | — | Hold, re-think pricing (free-beta até Wave 5?) |

### Decision matrix

| # targets atingidos | Decisão | Próximo passo |
|---------------------|---------|---------------|
| **7-8 / 8** | ✅ **GO** — open beta Wave 4 com 500 users | Disparar W37B-1 (public launch prep) + W37B-3 (waitlist automation) imediatamente |
| **5-6 / 8** | 🟡 **CONSTRAINED** — Wave 4 = 100 users focused iteration | Wave 38 = focused iteration nos 2-3 signals abaixo + Wave 4 = beta privado 100 users |
| **3-4 / 8** | 🔴 **HOLD** — Wave 38 = re-evaluate strategy | Wave 38 = decidir se itera por mais 30d ou pivota (kill switch) |
| **< 3 / 8** | 💀 **KILL SWITCH** — Wave 38 = honest re-evaluation | Owner decide se continua (com novo escopo) ou arquiva projeto |

**Default recommendation Wave 37:** **CONSTRAINED beta** (Wave 4 = 100 users) é o cenário conservador esperado dado o histórico de carryover gaps Wave 35/36. **GO só se 7-8/8 targets forem atingidos, o que depende de fechar gaps W36 carryover + Wave 3 executando bem.**

---

## Métricas de sucesso programa beta (acumulado Wave 35-37)

**Targets por wave (do W36-37-PLAN):**

| Métrica | Wave 1 (10) | Wave 2 (20) | Wave 3 (50) | Open beta Wave 4 (500) |
|---------|-------------|-------------|-------------|------------------------|
| Signup → activation D1 | ≥ 80% | ≥ 70% | ≥ 60% | ≥ 50% |
| D7 retention | ≥ 40% | ≥ 35% | ≥ 30% | ≥ 25% |
| D30 retention | ≥ 25% | ≥ 20% | TBD | TBD |
| NPS Day 7 | ≥ 35 | ≥ 35 | ≥ 35 | ≥ 30 |
| NPS Day 30 | ≥ 40 | ≥ 40 | ≥ 40 | ≥ 35 |
| P0 incidents / user-week | < 0.1 | < 0.05 | < 0.03 | < 0.02 |
| Moderação queue SLA | < 24h | < 24h | < 12h | < 12h |
| Feedback submissions/user | ≥ 2 | ≥ 1.5 | ≥ 1 | ≥ 0.5 |
| Marketplace escrow dispute rate | < 5% | < 5% | < 3% | < 3% |
| Akasha chat → marketplace conversion | ≥ 5% | ≥ 5% | ≥ 8% | ≥ 8% |

**Se métricas Wave 3 ≥ 80% dos targets → open beta Wave 4 (500 users).**
**Se < 60% → re-evaluate strategy em Wave 38.**

---

## Critical path Wave 37

```
Wave 36 gaps carryover (W36-5 moderação + W36-7 invite)
  ↓
Wave 37A (4 workers P0 — scale prep + re-spawn gaps)
  ↓
Wave 37B (4 workers P1 — open beta prep + metrics consolidation)
  ↓
8-signal measurement @ Wave 37 close
  ↓
Decision matrix: GO (7-8/8) / CONSTRAINED (5-6/8) / HOLD (3-4/8) / KILL (<3/8)
  ↓
Wave 4 trigger based on decision
```

**Sequência crítica:** Wave 37A-3 (Wave 3 invite) é blocker para Wave 3 execute. Wave 37A-4 (moderação tooling) é blocker para Wave 3 volume. Wave 37A-1 + W37A-2 são blockers para Wave 4 (load + incident response precisam validar antes de auto-invite). Wave 37B-4 (metrics consolidation) é blocker para decision.

**Cada wave tem stop conditions explícitas.** Não acumular débitos técnicos durante o beta — usuário real percebe gaps rapidamente.

---

## Risk register Wave 37

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Load test revela bottleneck não-mapeado em W36-3 perf | Média | Alto (open beta fails) | W37A-1 com 4 cenários (burst / sustained / peak / recovery) + early-exit criteria |
| On-call rotation sem voluntários (1-2 devs só) | Alta | Alto (incident SLA falha) | Contratar dedicated SRE ou usar serviço externo (e.g. OpsGenie + contractor) |
| Wave 3 invite atinge pessoas erradas (viés de seleção) | Média | Alto (comunidade hostil) | Scoring de diversidade geografia + tradição + idade + profissão + experiência espiritual |
| A/B test infrastructure vaza controle | Baixa | Médio (decisão errada) | Sample size ≥ 1000 + 2-week minimum + statistical significance check (p < 0.05) |
| Moderação queue volume > SLA (< 24h) | Média | Médio (community damage) | Hire human moderator ANTES de Wave 3, não durante |
| Marketplace escrow dispute em Wave 3 | Média | Alto (perda de dinheiro + trust) | W37B-4 metrics inclui dispute rate tracking + alert se > 3% |
| Owner review lag > 24h | Alta | Médio (atrasa sequência) | Owner reviews assíncrono com ack explícito + escalation path |
| Open beta wave 4 = 500 users, server crash | Baixa | Catastrófico (data loss + reputation) | W37A-1 load test 500 RPS (não 100) + horizontal scaling antes de GO |

---

## Decisões macro Wave 37 (D-final)

| ID | Decisão | Recomendação | Bloqueio |
|----|---------|--------------|----------|
| D5 | pricing free-beta → freemium / paid / free-beta-forever | 🟡 Wave 37B-2 A/B decide (≥ 5% conversion = freemium, < 5% = free-beta até Wave 5) | Wave 37B-2 A/B test results |
| D7 | incident response SLA final | ✅ 1h response / 4h resolve P1 / on-call rotation published | Wave 37A-2 deploy |
| D-open-beta-1 | GO/CONSTRAINED/HOLD/KILL decision | 🎯 8-signal matrix @ Wave 37 close | All 8 signals measured |
| D-open-beta-2 | capacity Wave 4 (500 vs 100 vs 0) | 🎯 function of D-open-beta-1 | D-open-beta-1 result |
| D-open-beta-3 | timing Wave 4 launch | 🎯 function of D-open-beta-1 + Wave 37B-1 landing page ready | D-open-beta-1 + W37B-1 |

---

## Owner review gate Wave 37

**Bloqueios para Wave 4 trigger (qualquer decisão):**

1. ✅ Wave 37 close committed (este doc + Wave 37 summary)
2. ✅ 8-signal measurement completo (W37B-4 metrics consolidation)
3. ✅ Owner review da decision matrix (15min review)
4. ✅ D-open-beta-1 decision (GO / CONSTRAINED / HOLD / KILL) explicit ack
5. ✅ D-open-beta-2 capacity (500 / 100 / 0) explicit ack
6. ✅ D-open-beta-3 timing (immediate / +7d / +30d) explicit ack

**Stop conditions para Wave 4 trigger:**

- Se owner review lag > 24h → escalate (Wave 4 é tempo-sensível se GO)
- Se qualquer sinal #1-#8 abaixo do target sem explicação → HOLD
- Se on-call rotation vazia → HOLD GO até contratar
- Se moderation queue SLA > 24h no preview → HOLD CONSTRAINED até hire

---

## Cross-project lesson (reusable)

**Pattern: 8-signal decision matrix é mais robusto que binary GO/NO-GO.** Em beta com humanos reais, decisão binária esconde trade-offs. **8 sinais com targets explícitos + scoring 7-8/5-6/3-4/<3 = 4 outcomes** dá nuance + permite CONSTRAINED como fallback positivo (Wave 4 = 100 users é melhor que KILL).

**Lição Wave 30 + 33 + 34 + 35 + 36 confirmada:** ondas paralelas (8 workers) batem ~50% taxa de entrega efetiva. Wave 37A deve assumir 4/8 fully delivered + 2/8 partial + 2/8 carryover. **Plan com carryover slot desde Wave 1 evita débitos técnicos ocultos.**

**Recomendação template Wave 38+:** toda wave plan deve ter (1) carryover section explícita, (2) decision matrix com 5-8 signals, (3) ≥ 3 outcomes (não binary), (4) owner review gate com time-box explícito. **Wave 36-37-PLAN + este doc = template reutilizável.**

---

## Próximo passo imediato

1. Owner revisa este doc + WAVE-36-SUMMARY
2. Owner dispara Wave 37A (4 workers P0 — scale prep + re-spawn W36 gaps)
3. Wave 37A-3 (Wave 3 invite) + W37A-4 (moderação tooling) re-spawnam W36-5 + W36-7 gaps
4. Wave 37B dispara após Wave 37A ✅ (4 workers P1 — open beta prep + metrics)
5. Wave 37B-4 (metrics consolidation) outputs 8-signal measurement
6. Decision matrix executa → D-open-beta-1/2/3
7. Wave 4 trigger baseado em decision (GO = 500 / CONSTRAINED = 100 / HOLD = iterate / KILL = archive)

**Stop:** este doc + commit. Aguarda owner ack para Wave 37A trigger.

---

**Reference:** para o plan Wave 36-37 original (com Sub-wave 36A close gaps + 36B iterate), ver `docs/WAVE-36-37-PLAN.md`. Este doc supersede o decision framework original com 8-signal matrix + 4 outcomes + explicit carryover handling.