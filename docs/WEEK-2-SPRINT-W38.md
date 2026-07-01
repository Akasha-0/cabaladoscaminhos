# Week 2 Sprint Plan — Wave 38 (Post-Launch Iteration)

> **Sprint window:** Day 8 → Day 14 (post-launch). Owner: PM (Tomás). Co-owned com Designer (Lina) + Coder.
>
> **Inputs:** Day-7 NPS synthesis · Top blockers · User feedback aggregation · Community health snapshot · Marketing dashboard · Iteration backlog.
>
> **Outcome esperado:** NPS D7 ≥ 30 (target), P0 bugs = 0, perf p95 < 800ms nas top 5 rotas, marketing conversion funnel com drop-offs identificados → A/B test 2 etapas.

---

## TL;DR

| Item | Quantidade | Notas |
|------|------------|-------|
| Workers | 5 paralelos (3 P0 + 2 P1) | Coder + Designer + PM + DevOps |
| Duration | 7 dias (Day 8–14) | Daily standup às 10:00 UTC |
| Capacity total | ~12 dev-days | 5 personas × ~2.5 dias foco |
| Items no sprint | 10 de 20 do backlog | Apenas P0+P1 com KPI linkage claro |
| Success criteria | 5 métricas | Ver §4 |

---

## 1. Sprint Goals

**Primary (must-hit):**

1. **Zero P0 bugs abertos ao final da sprint.** Top 3 do backlog: W38B-001 (Akasha 500), W38B-002 (Stripe webhook), W38B-003 (mobile crash iPhone 12).
2. **Onboarding v2 shipped.** Tradição explainer + first-post nudge. Target: D7 retention +5pp (32% → 37%).
3. **Marketing funnel A/B test live.** Social login first + 2-step form vs current. Target: signup start conversion 30% → 45%.

**Secondary (nice-to-have):**

4. Feed perf p95 < 800ms (vs current 1850ms).
5. Modo escuro shipped (234 feature votes).
6. Email nurture Day 7 (detractor follow-up) live.

---

## 2. Sprint Backlog (10 items, priorizados por score)

| # | ID | Title | Effort | Impact | Score | Owner | KPI Linked | Source |
|---|----|-------|--------|--------|-------|-------|------------|--------|
| 1 | W38B-001 | Fix Akasha 500 intermitente | M | 5 | 45 | Coder + AI | NPS_D7, AKASHA | bug |
| 2 | W38B-002 | Fix Stripe webhook timeout | M | 5 | 45 | Coder | CONVERSION, CAC | bug |
| 3 | W38B-003 | Mobile crash iPhone 12 offline | M | 5 | 45 | Coder | DAU, COMM_HEALTH | bug |
| 4 | W38B-004 | Onboarding v2 (tradição explainer) | M | 5 | 45 | Designer + Coder | D7_RET, CONV | nps |
| 5 | W38B-005 | Feed perf p95 < 800ms | M | 5 | 45 | Coder + DevOps | PERF, DAU | perf |
| 6 | W38B-015 | A/B test signup form simplificado | S | 4 | 40 | Designer + PM | CONV, CAC | marketing |
| 7 | W38B-019 | Email nurture Day 7 (detractor) | S | 4 | 40 | PM + Coder | NPS_D7 | nps |
| 8 | W38B-007 | Notificações push respostas | M | 5 | 45* | Coder | DAU, C/P | feature_vote |
| 9 | W38B-011 | LGPD export self-service | S | 5 | 50 | Coder + Security | COMM_HEALTH, NPS | feature_vote |
| 10 | W38B-010 | Fix login Google Safari | M | 4 | 35 | Coder | CONV | support |

\* Big bet estratégico (W34 v2 dispatcher infra já existe).

**Items deferred para Week 3:** W38B-006 (modo escuro — effort M, pode ser split), W38B-014 (Akasha memory — effort L, big bet Wave 39), W38B-018 (mentor matching v2 — Wave 40).

---

## 3. Daily Standup Agenda Template

**Time:** 10:00 UTC daily · **Duration:** 15min · **Format:** async-friendly (Notion + Slack standup bot)

```
1. Yesterday (2min/person)
   - O que completei?
   - Blockers?

2. Today (2min/person)
   - O que vou fazer?
   - Quem depende de mim?

3. Risks & Impediments (3min collective)
   - Algum blocker externo?
   - Algum KPI em risco?

4. Decisions needed (3min)
   - Trade-offs a resolver hoje
   - Owner da decisão + deadline
```

**Async format (default):**
Postar em `#standup-w38` até 09:30 UTC:
- ✅ Done
- 🎯 Doing today
- 🚧 Blockers

PM (Tomás) compila em 1 doc às 10:30 UTC com decisões do dia.

---

## 4. Success Criteria (Week 2 close, Day 14)

| KPI | Baseline (D7) | Target (D14) | Owner |
|-----|---------------|--------------|-------|
| NPS D7 cohort | +25 (mock) | +35 | PM |
| P0 bugs abertas | 3 | 0 | Coder |
| p95 feed (ms) | 1850 | < 800 | DevOps |
| Conversion landing → signup start | 30% | 45% (A/B test winner) | PM + Designer |
| Email Day-7 NPS response rate | 38% open / 12% click | 45% open / 18% click | PM |
| D7 retention cohort Day 8–14 | 28% | 35% | PM |
| Crash-free rate | 99.2% | 99.7% | Coder |

**Hard stop conditions:**
- Se NPS D14 < D7: ESCALATE. Pausa growth, itera onboarding v3.
- Se > 2 P0 bugs abertos no D14: ROTATE Week 3 resources from features → stability.
- Se perf p95 não melhorou > 30%: REVIEW infra plan com DevOps lead.

---

## 5. Weekly Retro Template

**Time:** sexta 16:00 UTC · **Duration:** 45min · **Facilitator:** PM (Tomás)

### 5.1. Start / Stop / Continue (15min)

**Start doing:**
- O que queremos COMEÇAR a fazer?

**Stop doing:**
- O que queremos PARAR de fazer?

**Continue doing:**
- O que está funcionando, manter?

### 5.2. KPI Review (10min)

Para cada KPI da §4:
- ✅ Hit? Por quê?
- ❌ Miss? Análise root cause (5-why)?

### 5.3. Experiment Learnings (10min)

A/B tests ou mudanças com dados:
- Hipótese vs resultado
- Decision: ship / iterate / kill

### 5.4. Capacity & Velocity (5min)

- Planned vs completed items
- Effort accuracy (M era realmente M? Era L?)
- Carryover items + rationale

### 5.5. Owner Feedback (5min)

- O que precisou de mais atenção do owner?
- O que foi friction desnecessária?

**Output:** `docs/RETRO-WEEK-2-W38.md` (5 páginas max) + 3 action items priorizados.

---

## 6. Marketing Experiment Plan (Week 2)

### Experiment 1: Social login first + 2-step form

**Hipótese:** Oferecer Google/Apple login na primeira tela + reduzir form para 2 etapas aumenta conversion de Landing → Signup Start de 30% para 45%.

**Variants:**
- **Control (A):** Form atual (5 campos + email verify).
- **Variant (B):** Google/Apple SSO first + form minimal (email + password) na segunda tela.

**Success metric:** Conversion rate landing → signup start.
**Sample size:** 5.000 visitors/variant (10k total). Running 7 dias.
**Decision rule:** Se B > A + 10pp → ship B. Se A > B → manter A.

**Owner:** Designer (Lina) + Coder (implementation) + PM (análise).

### Experiment 2: Onboarding tradição explainer

**Hipótese:** Adicionar preview visual + descrição 1-linha por tradição aumenta D7 retention de 28% para 35%.

**Variants:**
- **Control (A):** Onboarding atual (lista de 6 tradições + texto).
- **Variant (B):** Carrossel com ícone + descrição + exemplo de uso.

**Success metric:** D7 retention (cohort que completou onboarding vs. cohort 7 dias antes).
**Decision rule:** Se B > A + 5pp → ship B. Tie → qualitative review.

---

## 7. Risk Register (Week 2)

| Risco | Prob | Impact | Mitigação | Owner |
|-------|------|--------|-----------|-------|
| Akasha fix introduz regressão | Média | Alto | QA regression suite + canary 10% | QA + Coder |
| Stripe webhook fix quebra PCI compliance | Baixa | Catastrófico | Security review (Caio) antes de merge | Security + Coder |
| Mobile offline fix tem UX confuso | Média | Médio | Designer review + user test 5 pessoas | Designer + PM |
| Onboarding v2 shipa tarde | Média | Médio | Cut scope: tradição explainer only, defer first-post nudge | PM |
| A/B test não atinge sample size | Baixa | Baixo | Rodar 14 dias em vez de 7, ajustar decision rule | PM |

---

## 8. Carryover para Week 3

**Conditional items (only if Week 2 ships):**

- Modo escuro (W38B-006) — effort M, ready para split em 2 mini-PRs
- Akasha context memory (W38B-014) — big bet Wave 39 prep
- Mentor matching v2 (W38B-018) — depends on Week 2 mentorship data
- Galeria rituais (W38B-017) — only if Week 2 mantém capacity

**Always-on:**

- Performance monitoring (Sentry + DataDog)
- NPS weekly prompt
- Moderação queue SLA tracking
- Marketing attribution update

---

## 9. Cadence

| Evento | Quando | Owner | Participantes |
|--------|--------|-------|---------------|
| Daily standup | 10:00 UTC | PM | Coder, Designer, DevOps |
| Mid-week check-in | Wed 14:00 UTC | PM | Owner (advisory) |
| Sprint review | Sex 15:00 UTC | PM | All + Owner |
| Retro | Sex 16:00 UTC | PM | All |
| Weekly NPS synthesis | Dom 23:00 UTC | PM script (cron) | Auto-generated |
| Wave 39 planning kickoff | D14 (next seg) | PM | All + Owner |

---

## 10. Cross-Project Lesson (reusable)

**Pattern: post-launch Week 2 sprint = stabilization + iteration, NOT feature.** Resistir tentação de adicionar features. Foco em:
1. Zero P0 bugs
2. Top 3 perf bottlenecks
3. Onboarding funnel A/B test
4. Email nurture (NPS follow-up)
5. LGPD export (compliance + trust)

**Week 3+ pode adicionar features.** Week 2 é para fix what shipped.

**Stop condition universal:** se NPS D14 < D7, NÃO avançar para Wave 39 (marketing) — re-iterate onboarding até D21.

---

**Cross-references:**
- `docs/POST-LAUNCH-DAY-7-W38.md` (master doc com Day-7 review completo)
- `reports/week1-nps-synthesis.md` (NPS raw data)
- `reports/top-blockers.md` (blocker analysis)
- `reports/user-feedback-aggregation.md` (feedback)
- `src/lib/product/iteration-backlog.ts` (full 20-item backlog)
- `WAVE-38-40-PLAN.md` (long-term wave plan)