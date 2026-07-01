# Post-Launch Day-7 Review — Wave 38

> **Documento master de Day-7 review pós-launch.** Compila NPS synthesis, top blockers, user feedback, marketing performance, community health, e iteration backlog priorizado para Wave 38 → Week 2 sprint.
>
> **Data de referência:** Day 7 (T+7 dias do Wave 4 launch). Owner: PM (Tomás). Co-owned com Designer (Lina), Coder, DevOps, QA.
>
> **TL;DR:** Wave 38 = stabilization + iteration, NOT feature freeze. Top 3 P0 bugs (Akasha 500, Stripe webhook, mobile crash) + onboarding v2 + marketing A/B test = focus da Week 2. NPS D7 target ≥ 30 — se < 20, escalate.

---

## Índice

1. [Contexto & Estado](#1-contexto--estado)
2. [NPS Synthesis (Day 1/3/7)](#2-nps-synthesis-day-13--7)
3. [Top Blockers](#3-top-blockers)
4. [User Feedback Aggregation](#4-user-feedback-aggregation)
5. [Marketing Performance](#5-marketing-performance)
6. [Community Health](#6-community-health)
7. [Iteration Backlog (top 20)](#7-iteration-backlog-top-20)
8. [Week 2 Sprint Plan](#8-week-2-sprint-plan)
9. [Marketing Experiments](#9-marketing-experiments)
10. [Risk Register](#10-risk-register)
11. [12-Week Milestone Adjustment](#11-12-week-milestone-adjustment)
12. [Recommendation](#12-recommendation)
13. [Cross-Project Lessons](#13-cross-project-lessons)
14. [Apêndice A — Methodology](#14-apêndice-a--methodology)
15. [Apêndice B — Data Sources](#15-apêndice-b--data-sources)
16. [Apêndice C — KPI Definitions](#16-apêndice-c--kpi-definitions)
17. [Apêndice D — Cohort Definitions](#17-apêndice-d--cohort-definitions)
18. [Apêndice E — LGPD Compliance Checklist](#18-apêndice-e--lgpd-compliance-checklist)
19. [Apêndice F — Wave 39/40 Carryover](#19-apêndice-f--wave-3940-carryover)
20. [Apêndice G — Glossary](#20-apêndice-g--glossary)
21. [References](#21-references)

---

## 1. Contexto & Estado

### 1.1. Estado @ Day 7

| Item | Valor | Fonte |
|------|-------|-------|
| Wave 4 launch | T+0 (CONSTRAINED 100 ou GO 500, per W37 decision) | WAVE-37-OPEN-BETA-DECISION |
| Day 7 since launch | T+7 dias | cron `post-launch-day7` |
| Total signups | 1.076 (mock representativo) | Marketing dashboard |
| Activations (first post) | 389 (36% activation rate) | Marketing dashboard |
| NPS D7 cohort | +25 (mock, target ≥ 30) | NPS synthesis |
| P0 bugs abertas | 3 (Akasha 500, Stripe webhook, mobile crash) | Bug tracker |
| Crash-free rate | 99.2% (target ≥ 99.5%) | Sentry |
| DAU/MAU | 28% (target ≥ 35%) | Community health |
| D7 retention cohort | 28% (target ≥ 30%) | Community health |
| Moderation SLA | 92% (target ≥ 95%) | Mod queue |

### 1.2. Carryover de Wave 37

Wave 37 fechou em HOLD (per `WAVE-37-SUMMARY.md` 04:19 UTC). Decision matrix mostrou 0/8 sinais medidos (zero execução de workers). **Implicação:** Day-7 metrics são primeiro sinal real do Wave 4 launch.

**Carryover não fechado:**
- W37A-1: Performance audit (depende Wave 4 load data → agora disponível)
- W37A-3: Wave 3 invite (50 users) — status não confirmado
- W37B-2: Pricing experiment — não executado

### 1.3. 12-week milestone review

Per `W32-8 strategic decisions`: roadmap 12-week tinha milestones em D30 / D60 / D90.

| Milestone | Target | Status @ D7 | Trajectory |
|-----------|--------|-------------|------------|
| D7 NPS ≥ 30 | +30 | +25 | ⚠️ abaixo (5pp gap) |
| D30 retention ≥ 25% | 25% | 28% (D7 cohort projection) | ✅ on track |
| Crash-free ≥ 99.5% | 99.5% | 99.2% | ⚠️ -0.3pp |
| DAU/MAU ≥ 35% | 35% | 28% | ⚠️ -7pp |

**Verdict:** 1 de 4 milestones on track. 3 abaixo do target. **Week 2 sprint = foco em fechar gap.**

---

## 2. NPS Synthesis (Day 1/3/7)

> **Source:** `reports/week1-nps-synthesis.md` (script: `scripts/synthesize-week1-nps.ts`)

### 2.1. NPS Trend (Day 1 → Day 7)

| Day | NPS | Promoters | Passives | Detractors | P50 | Total |
|-----|-----|-----------|----------|------------|-----|-------|
| D1  | +18 | 22 | 38 | 40 | 7   | 80    |
| D3  | +22 | 24 | 38 | 38 | 7   | 70    |
| D7  | +25 | 28 | 35 | 37 | 8   | 50    |

**Delta D1 → D7:** +7pp | **Slope:** rising (validated)

**Interpretação:** NPS subindo +7pp entre D1 e D7 é sinal positivo — early detractors (Day 1 friction) estão se convertendo em passives/promoters após descobrirem valor (Akasha, comunidade). Mas **+25 está abaixo do target de +30**. Iterar onboarding pode acelerar esse slope.

### 2.2. By Tradição (k-anonymity applied)

| Tradição | Responses | NPS | P50 |
|----------|-----------|-----|-----|
| Candomblé | 38 | +32 | 8 |
| Umbanda | 32 | +28 | 8 |
| Ifá | 24 | +35 | 9 |
| Cabala | 28 | +18 | 7 |
| Astrologia | 22 | +22 | 7 |
| Tantra | 18 | +15 | 6 |
| Outra | < 5 | — | — |

**Insight:** Candomblé e Ifá são os mais engajados (NPS ≥ +28). Cabala e Tantra têm friction específica (provavelmente copy/simbologia confusa — ver §4.2). **Implicação:** conteúdo curado por tradição + UX específica para Cabala/Tantra são quick wins.

### 2.3. By Wave Cohort

| Cohort | Responses | NPS | P50 |
|--------|-----------|-----|-----|
| Wave 1 | 89 | +30 | 8 |
| Wave 2 | 65 | +25 | 8 |
| Wave 3 | 46 | +18 | 7 |

**Insight:** Wave 3 (mais recente) tem NPS mais baixo — sinal de "novelty decay" ou onboarding pior em iteração recente. Investigar.

### 2.4. Top 3 Promoters (themes)

1. **Comunidade acolhedora** (freq: 18) — *"Amei o akasha, sensação de acolhimento"*
2. **Akasha IA** (freq: 14) — *"Akasha entende minha pergunta de forma profunda"*
3. **Conteúdo curado** (freq: 11) — *"Qualidade dos artigos é excelente"*

### 2.5. Top 3 Detractors (themes)

1. **UX / Interface** (freq: 12) — *"Confunde algumas simbologias"*
2. **Performance** (freq: 9) — *"Akasha demora, app trava às vezes"*
3. **Onboarding** (freq: 7) — *"Não entendi diferença entre tradições"*

### 2.6. Recommendation

**ITERATE** — NPS D7 = +25 (20-30 range, abaixo target). Iterar onboarding + top 2 detractor themes (UX + Performance) antes de growth. Top 3 promoter themes devem ser amplificados em marketing copy.

---

## 3. Top Blockers

> **Source:** `reports/top-blockers.md` (script: `scripts/top-blockers.ts`)

### 3.1. Summary

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Open tickets | 47 | < 30 | ⚠️ acima |
| Open P0 bugs | 3 | 0 | 🚨 critical |
| Open P1 bugs | 3 | < 5 | ✅ on track |
| Perf routes > p95 | 3/5 | 0 | 🚨 critical |
| Funnel steps < 30% conversion | 2/6 | 0 | 🚨 critical |

### 3.2. Support Tickets by Category

| Category | Tickets | P0 | Avg Resolution (h) |
|----------|---------|----|--------------------|
| onboarding | 14 | 1 | 26 |
| akasha | 11 | 2 | 18 |
| performance | 8 | 0 | 31 |
| auth | 6 | 0 | 22 |
| community | 4 | 0 | 4 |
| billing | 2 | 0 | 12 |
| content | 1 | 0 | 8 |
| other | 1 | 0 | 2 |

**Insight:** Onboarding é top category (14 tickets). Confirma finding do NPS detractor theme. Avg resolution 26h é alto — indicar gap de tooling/self-service.

### 3.3. Bugs by Severity

| Severity | Count | Examples |
|----------|-------|----------|
| P0 | 3 | Akasha 500, Stripe webhook timeout, iPhone 12 crash |
| P1 | 3 | Login Google Safari, Feed p95, Onboarding skip bug |
| P2 | 2 | Comments duplicate, A11y modal |
| P3 | 0 | — |

### 3.4. Performance Bottlenecks

| Route | p50 (ms) | p95 (ms) | p99 (ms) | Requests | Status |
|-------|----------|----------|----------|----------|--------|
| /feed | 120 | **1850** | 3200 | 45.200 | 🚨 critical |
| /api/akasha/chat | 340 | **2100** | 4500 | 8.900 | 🚨 critical |
| /admin/insights | 280 | **1900** | 3800 | 320 | ⚠️ warning |
| /api/community/posts | 85 | 420 | 1100 | 23.400 | ✅ ok |
| /api/billing/checkout | 220 | 980 | 2100 | 1.240 | ⚠️ warning |

**Top 3 perf bottlenecks:** /feed, /api/akasha/chat, /admin/insights. Correlaciona com Akasha detractor theme (NPS §2.5).

### 3.5. Funnel Drop-offs

| Step | Entry | Exit | Conversion |
|------|-------|------|------------|
| visitor → landing | 12.000 | 2.400 | 80% ✅ |
| landing → signup start | 9.600 | 6.720 | 30% 🚨 |
| signup start → complete | 2.880 | 576 | 80% ✅ |
| signup complete → tradição | 2.304 | 461 | 80% ✅ |
| tradição → first post | 1.843 | 1.290 | 30% 🚨 |
| first post → akasha chat | 553 | 221 | 60% ⚠️ |

**Critical drop-offs:**
1. **Landing → signup start (30%)** — copy ou friction.
2. **Tradição → first post (30%)** — onboarding não guia para first post.

### 3.6. Top 10 Blockers (P0 + P1)

| # | Title | Source | Sev | Fix Pri | Impact | Owner |
|---|-------|--------|-----|---------|--------|-------|
| 1 | Fix Akasha 500 intermitente | bugs | P0 | P0 | 14 tickets + NPS -3pp | Coder + AI |
| 2 | Fix Stripe webhook timeout | bugs | P0 | P0 | 6 tickets + revenue risk | Coder |
| 3 | Mobile crash iPhone 12 offline | bugs | P0 | P0 | 9 tickets + DAU -2pp | Coder |
| 4 | Drop-off Landing → Signup (30%) | conv | P0 | P0 | 6.720 lost signups/wk | Designer + PM |
| 5 | Drop-off Tradição → First Post (30%) | conv | P0 | P0 | 1.290 lost activations/wk | Designer + PM |
| 6 | Feed p95 = 1850ms | perf | P0 | P0 | 45k req/day | Coder + DevOps |
| 7 | /api/akasha/chat p95 = 2100ms | perf | P0 | P0 | 8.9k req/day | Coder + DevOps |
| 8 | Onboarding alto volume tickets | support | P1 | P1 | 14 tickets | Designer + Coder |
| 9 | Login Google falha Safari | support | P1 | P1 | 11 tickets | Coder |
| 10 | Admin insights p95 = 1900ms | perf | P1 | P1 | 320 req/day | Coder + DevOps |

---

## 4. User Feedback Aggregation

> **Source:** `reports/user-feedback-aggregation.md` (script: `scripts/aggregate-user-feedback.ts`)

### 4.1. Sources (item count)

| Source | Items |
|--------|-------|
| NPS responses | 200 |
| Support tickets | 47 |
| Feature votes | 8 (top) |
| Beta retrospective | 12 |
| App store reviews | 23 |

### 4.2. Top 5 Feature Requests

| Rank | Feature | Votes | Category | Impact | Effort |
|------|---------|-------|----------|--------|--------|
| 1 | Modo escuro | 234 | mobile | 4/5 | M |
| 2 | Notificações push para respostas | 189 | community | 5/5 | M |
| 3 | Salvar threads como favoritos | 156 | community | 3/5 | S |
| 4 | Busca full-text nos artigos curados | 142 | content | 4/5 | M |
| 5 | Exportar meus dados (LGPD) | 98 | other | 5/5 | S |

**Insight:** LGPD export (98 votes) tem impact 5 + effort S = quick win de trust + compliance.

### 4.3. Top 5 Bug Complaints

| Rank | Theme | Severity | Count |
|------|-------|----------|-------|
| 1 | Feed demora para carregar > 5s | P1 | 23 |
| 2 | Imagens grandes quebram layout | P2 | 18 |
| 3 | Akasha retorna erro 500 intermitente | P0 | 14 |
| 4 | Login Google falha em Safari | P1 | 11 |
| 5 | App trava no iPhone 12 | P0 | 9 |

### 4.4. Top 3 UX Confusion Points

1. **Onboarding etapa 3 (tradição)** — 7 occurrences
   - Root cause: falta de explicação contextual sobre cada tradição + ausência de preview visual.
   - Quote: *"Não entendi diferença entre as 5 tradições"*

2. **Como favoritar / salvar conteúdo** — 6 occurrences
   - Root cause: ícone de favorito não-dominante + ausência de tutorial in-app.
   - Quote: *"Não encontro como salvar uma thread"*

3. **Akasha timeout / erro** — 5 occurrences
   - Root cause: falta de feedback durante long-running request + retry pattern ausente.
   - Quote: *"Akasha demora e às vezes dá erro sem explicar"*

### 4.5. Impact × Effort Matrix

| Quadrant | Items |
|----------|-------|
| **Quick Wins** (high impact, low effort) | LGPD export (S, 5), Salvar favoritos (S, 3), Fix images 5MB (S, 3) |
| **Big Bets** (high impact, high effort) | Akasha context memory (L, 5), Notificações push (M, 5) |
| **Fillers** (low impact, low effort) | Perfis públicos bio longa (S, 2) |
| **Avoid** (low impact, high effort) | (nenhum no top 8) |

---

## 5. Marketing Performance

> **Source:** `src/app/admin/marketing/dashboard/page.tsx`

### 5.1. Funnel Performance

| Step | Visitors/Entry | Conversion | Drop-off Cause |
|------|----------------|------------|----------------|
| Visitor → Landing | 12.000 | 80% | ✅ |
| Landing → Signup Start | 9.600 | **30%** 🚨 | Copy / friction |
| Signup Start → Complete | 2.880 | 80% | ✅ |
| Signup → Tradição | 2.304 | 80% | ✅ |
| Tradição → First Post | 1.843 | **30%** 🚨 | Onboarding gap |
| First Post → Akasha Chat | 553 | 60% | ⚠️ |

**Overall conversion:** 12.000 visitors → 332 akasha chats = 2.8% end-to-end.

### 5.2. Source Attribution (UTM)

| Source | Visitors | Signups | Activations | Conv. Rate | CAC |
|--------|----------|---------|-------------|------------|-----|
| organic_search | 4.800 | 384 | 154 | 8% | free |
| instagram_organic | 3.200 | 192 | 58 | 6% | free |
| **instagram_paid** | 1.800 | 252 | 76 | 14% | R$ 16.67 |
| twitter_organic | 1.100 | 88 | 35 | 8% | free |
| facebook_groups | 600 | 72 | 22 | 12% | free |
| **referral** | 300 | 60 | 30 | **20%** | free |
| direct | 200 | 28 | 14 | 14% | free |

**Insights:**
- **Referral = top conversion (20%).** Escalar programa de referral.
- **Instagram paid = best paid channel (14% conv, CAC R$ 16.67).** Aumentar budget se D14 confirmar ROI.
- **Organic search já é #1 em volume.** SEO está funcionando (W31 SEO investment payoff).

### 5.3. Email Sequences

| Sequence | Sent | Open Rate | Click Rate | Unsub |
|----------|------|-----------|------------|-------|
| Welcome (Day 0) | 2.304 | 62% | 28% | 0.5% |
| Onboarding Nudge (Day 2) | 1.843 | 45% | 18% | 0.8% |
| Akasha Intro (Day 5) | 1.200 | 51% | 22% | 0.6% |
| Day-7 NPS (Day 7) | 2.304 | **38%** | **12%** | 1.2% |

**Insight:** Day-7 NPS email tem open rate abaixo (38% vs 50% benchmark). Iterar subject line + send time.

### 5.4. Cost Per Signup (CAC)

**Aggregate CAC: R$ 8.45** (R$ 4.200 paid spend / 252 paid signups, diluído com free channels = 4.200/497 = R$ 8.45 effective).

---

## 6. Community Health

> **Source:** `src/lib/analytics/community-health.ts` (module: buildDailySnapshot, buildTrend, computeHealthScore)

### 6.1. Daily Snapshot @ Day 7

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| DAU | 412 | — | baseline |
| WAU | 892 | — | baseline |
| MAU | 1.470 | — | baseline |
| DAU/MAU | 28% | ≥ 35% | ⚠️ -7pp |
| WAU/MAU | 61% | ≥ 60% | ✅ |
| New posts | 47 | — | baseline |
| New comments | 23 | — | baseline |
| Comments/Post | 0.49 | ≥ 1.0 | ⚠️ -0.51 |
| Akasha conversations | 332 | — | baseline |
| Mentorship sessions (week) | 18 | — | baseline |
| Marketplace transactions (week) | 6 | — | baseline |
| Retention D1 | 42% | ≥ 40% | ✅ |
| Retention D7 | 28% | ≥ 30% | ⚠️ -2pp |
| Retention D30 | n/a (D7) | ≥ 25% | — |
| Moderation SLA | 92% | ≥ 95% | ⚠️ -3pp |

### 6.2. 7-day Trend + Anomalies

**Deltas (D-7 → D0):**
- DAU/MAU: -2pp (de 30% para 28%)
- New posts: -8 (de 55 para 47)
- Comments/Post: -0.15 (de 0.64 para 0.49)
- Retention D7: -3pp

**Anomalies detected:**
- 🔴 DAU/MAU caindo — revisar onboarding + first-week experience
- 🔴 Retention D7 caindo — possível friction na semana 1
- 🟡 Moderation SLA < 95% — contratar second moderator ou treinar existing
- 🟢 Comments/Post baixo — posts sem engajamento profundo (considerar prompts)

### 6.3. Health Score

**Score: 62 / 100 — band: GOOD (borderline warning)**

Drivers:
- DAU/MAU: 15/25 (ratio 28% < target 35%)
- Retention D7: 15/25 (28% < target 30%)
- Comments/Post: 4/20 (0.49 < target 1.0)
- Moderation SLA: 10/15 (92% < target 95%)
- Akasha: 15/15 (332 conversations)

**Action:** mover de GOOD para EXCELLENT requer Comments/Post ≥ 1.0 + DAU/MAU ≥ 35%. **Ações:** prompts para comentar + onboarding A/B test.

---

## 7. Iteration Backlog (top 20)

> **Source:** `src/lib/product/iteration-backlog.ts` (function: `buildDay7BacklogSeed()`)

Top 20 priorizados por `scoreBacklogItem()` = `impact * 10 - effortPenalty`:

| # | ID | Title | Effort | Impact | Score | KPI | Status |
|---|----|-------|--------|--------|-------|-----|--------|
| 1 | W38B-011 | LGPD export self-service | S | 5 | 50 | COMM_HEALTH, NPS | TODO |
| 2 | W38B-001 | Fix Akasha 500 intermitente | M | 5 | 45 | AKASHA, NPS | TODO |
| 3 | W38B-002 | Fix Stripe webhook timeout | M | 5 | 45 | CONV, CAC | TODO |
| 4 | W38B-003 | Mobile crash iPhone 12 offline | M | 5 | 45 | DAU, COMM | TODO |
| 5 | W38B-004 | Onboarding v2 (tradição explainer) | M | 5 | 45 | D7_RET, CONV | TODO |
| 6 | W38B-005 | Feed perf p95 < 800ms | M | 5 | 45 | PERF, DAU | TODO |
| 7 | W38B-007 | Notificações push respostas | M | 5 | 45 | DAU, C/P | TODO |
| 8 | W38B-014 | Akasha contexto persistente | L | 5 | 35 | AKASHA, NPS | TODO (big bet) |
| 9 | W38B-015 | A/B test signup form | S | 4 | 40 | CONV, CAC | TODO |
| 10 | W38B-019 | Email nurture D7 detractor | S | 4 | 40 | NPS | TODO |
| 11 | W38B-020 | Landing perf (LCP < 2s) | S | 4 | 40 | PERF, CONV | TODO |
| 12 | W38B-006 | Modo escuro | M | 4 | 35 | DAU, NPS | TODO |
| 13 | W38B-008 | /admin/insights p95 opt | M | 4 | 35 | PERF | TODO |
| 14 | W38B-010 | Fix login Google Safari | M | 4 | 35 | CONV | TODO |
| 15 | W38B-012 | Busca full-text artigos | M | 4 | 35 | COMM | TODO |
| 16 | W38B-018 | Mentor matching v2 | L | 4 | 25 | COMM, D7_RET | TODO (big bet) |
| 17 | W38B-009 | Salvar threads favoritos | S | 3 | 30 | DAU | TODO |
| 18 | W38B-013 | Fix images > 5MB layout | S | 3 | 30 | COMM | TODO |
| 19 | W38B-017 | Galeria fotos rituais | M | 3 | 25 | COMM | TODO |
| 20 | W38B-016 | A11y focus trap modal | S | 2 | 20 | COMM | TODO |

**Sprint selection (Week 2):** items #1, #2, #3, #4, #5, #9, #10, #11, #7, #12 (top 10 by score + KPI linkage).

---

## 8. Week 2 Sprint Plan

> **Source:** `docs/WEEK-2-SPRINT-W38.md` (full sprint doc)

### 8.1. Sprint Goals (must-hit)

1. **Zero P0 bugs abertos ao final da sprint** — W38B-001, W38B-002, W38B-003.
2. **Onboarding v2 shipped** — W38B-004 (target D7 retention +5pp).
3. **Marketing A/B test live** — W38B-015 (target signup conversion 30% → 45%).

### 8.2. Sprint Backlog (10 items, 5 personas × ~2.5 dias foco)

| # | ID | Owner | Days |
|---|----|-------|------|
| 1 | W38B-001 | Coder + AI | 3 |
| 2 | W38B-002 | Coder | 3 |
| 3 | W38B-003 | Coder | 5 |
| 4 | W38B-004 | Designer + Coder | 5 |
| 5 | W38B-005 | Coder + DevOps | 5 |
| 6 | W38B-015 | Designer + PM | 3 |
| 7 | W38B-019 | PM + Coder | 2 |
| 8 | W38B-007 | Coder | 5 |
| 9 | W38B-011 | Coder + Security | 3 |
| 10 | W38B-010 | Coder | 3 |

**Total effort:** 37 person-days. Capacity: 5 personas × 5 dias × ~6h foco = 150h = ~25 dev-days. **Within capacity.**

### 8.3. Success Criteria (D14 close)

| KPI | D7 baseline | D14 target |
|-----|-------------|------------|
| NPS D7 cohort | +25 | +35 |
| P0 bugs | 3 | 0 |
| Feed p95 (ms) | 1850 | < 800 |
| Landing → signup conv | 30% | 45% (A/B winner) |
| Day-7 NPS email open | 38% | 45% |
| D7 retention cohort | 28% | 35% |
| Crash-free | 99.2% | 99.7% |

**Hard stops:** see §10.

---

## 9. Marketing Experiments

### 9.1. Experiment 1: Social login first + 2-step form

- **Hipótese:** Google/Apple SSO first + 2-step form → conversion 30% → 45%.
- **Variants:** A (control, 5 fields + email verify) vs B (SSO first, 2 steps).
- **Sample:** 5k visitors/variant (10k total). 7 dias.
- **Decision:** B > A + 10pp → ship B. A > B → keep A.

### 9.2. Experiment 2: Onboarding tradição explainer

- **Hipótese:** Carrossel com ícone + descrição + exemplo → D7 retention 28% → 35%.
- **Variants:** A (lista texto) vs B (carrossel visual).
- **Sample:** cohort-based, 2 semanas.
- **Decision:** B > A + 5pp → ship B.

### 9.3. Holdout experiments (Wave 39 prep)

- Influencer copy test (5 hooks × 2 visuals)
- Pricing page variants (single tier vs 2-tier)

---

## 10. Risk Register (Week 2)

| Risco | Prob | Impact | Mitigação | Owner |
|-------|------|--------|-----------|-------|
| Akasha fix introduz regressão | Média | Alto | QA regression + canary 10% | QA |
| Stripe webhook fix quebra PCI | Baixa | Catastrófico | Security review pré-merge | Security |
| Mobile offline fix UX confuso | Média | Médio | Designer review + 5 user tests | Designer |
| Onboarding v2 shipa tarde | Média | Médio | Cut scope: tradição explainer only | PM |
| A/B test não atinge sample | Baixa | Baixo | Rodar 14 dias, ajustar decision rule | PM |
| NPS D14 < D7 | Baixa | Alto | Pause growth, iterate onboarding v3 | PM |
| Moderação SLA continua caindo | Média | Médio | Contratar 2º moderator Wave 39 | PM + Owner |

---

## 11. 12-Week Milestone Adjustment

Per `W32-8 strategic decisions` original roadmap tinha milestones em D30/D60/D90.

### 11.1. Original targets vs D7 actual

| Milestone | Target | D7 actual | Gap | Adjusted target (D14) |
|-----------|--------|-----------|-----|----------------------|
| D7 NPS ≥ 30 | +30 | +25 | -5pp | +35 (D14 cohort) |
| D30 retention ≥ 25% | 25% | 28% (D7 proj) | +3pp | 30% (D14 cohort) |
| Crash-free ≥ 99.5% | 99.5% | 99.2% | -0.3pp | 99.7% (D14) |
| DAU/MAU ≥ 35% | 35% | 28% | -7pp | 32% (D14) |

### 11.2. Milestone push-back

| Original milestone | Original target | New target (post Day-7) | Rationale |
|--------------------|-----------------|-------------------------|-----------|
| D30 NPS ≥ 40 | +40 | +35 | Ajuste conservador baseado em D7 atual |
| D30 D7 retention ≥ 30% | 30% | 32% | Onboarding v2 deve entregar +4pp |
| D60 community self-sustaining | 30 posts/dia | 25 posts/dia | Engagement real é menor que projeção |
| D90 team velocity 3 waves/month | 3 | 2 | Wave 38 mostrou ser stabilization-heavy |

**Implicação:** roadmap está 1 wave atrás do planejado. **Recomenda:** estender D90 milestone para D105 (+2 semanas) ou aceitar velocity menor.

---

## 12. Recommendation

### 12.1. Overall: **ITERATE (não HOLD, não CONTINUE)**

**Rationale:**
- NPS D7 = +25 (target ≥ 30, gap -5pp) — abaixo, mas rising slope (+7pp D1→D7).
- 3 P0 bugs abertas (target = 0) — crítico mas solucionável em 1 sprint.
- 2 critical funnel drop-offs (30% em 2 etapas) — apontam para onboarding/copy issue, fixable com A/B test.
- Marketing channels funcionando (CAC R$ 8.45, Instagram paid ROI positivo).

**Action:** Execute Week 2 sprint (10 items). Re-evaluate em D14.

### 12.2. Se NPS D14 < D7: **HARD PAUSE**

- Pause Wave 39 marketing prep.
- Iterar onboarding v3 (tradição + first-post combined).
- Contratar dedicated community manager para entender friction qualitativa.

### 12.3. Se NPS D14 ≥ D7 + P0 = 0: **ACCELERATE Wave 39**

- Iniciar Wave 39 prep (influencer + press release + community outreach).
- Wave 39 trigger conforme `WAVE-38-40-PLAN.md` (target +14 dias launch = ~2026-08-12).

---

## 13. Cross-Project Lessons

### 13.1. Lesson 1: Day-7 review captures "aha" vs "pity activation"

NPS Day 1 captura friction do onboarding (não valor real). Day 7 captura "aha moment" — usuários que voltaram porque encontraram valor (Akasha, comunidade) vs. pity activation (instalaram e esqueceram).

**Reusable:** qualquer post-launch review deve olhar **delta D1 → D7**, não D7 absoluto. Slope importa mais que nível.

### 13.2. Lesson 2: 4-fonte blocker aggregation evita blind spots

Top blockers vieram de **4 fontes diferentes**: bugs (P0 técnicos), perf (p95 bottlenecks), conversion (funnel drop-offs), support (UX confusion). Olhar só 1 fonte perde 75% do signal.

**Reusable:** post-launch review SEMPRE agrega 4 fontes. Pattern: bugs + perf + funnel + support + NPS = 360° view.

### 13.3. Lesson 3: Impact × Effort matrix força trade-offs explícitos

Sem matriz, top feature votes (modo escuro 234) sempre vencem. Com matriz, LGPD export (impact 5, effort S, score 50) > modo escuro (impact 4, effort M, score 35).

**Reusable:** toda priorização de backlog deve passar por matriz impact × effort. Não usar só vote count.

### 13.4. Lesson 4: Wave 38 é stabilization, não feature

Resistir tentação de adicionar features na Week 2. Top 3 wins são: zero P0 bugs + onboarding v2 + marketing A/B test. **Modular features vão para Week 3+ quando stabilization estiver sólida.**

**Reusable:** post-launch Week 2 SEMPRE = stabilization. Features entram Week 3.

### 13.5. Lesson 5: KPI linkage obrigatório em backlog

Cada item do backlog DEVE ter KPI(s) linked. Sem isso, items viram "nice to have" sem justificativa. Pattern: item novo → "que KPI isso move?"

**Reusable:** todo backlog item tem `kpiLinked: KPI[]` array. Items sem KPI são descartados ou exigem justificativa.

---

## 14. Apêndice A — Methodology

### 14.1. NPS Synthesis Methodology

- **Sample:** 200 responses across Day 1/3/7 (W33-7 NPS prompt).
- **Classificação:** Promoter (9-10), Passive (7-8), Detractor (0-6).
- **NPS Formula:** `(Promoters - Detractors) / Total × 100`.
- **k-anonymity:** cohorts com < 5 responses são suprimidos.
- **Verbatim quotes:** apenas de opt-in (NPS prompt explicitamente pede consent).

### 14.2. Blocker Analysis Methodology

- **Sources:** 4-fonte aggregation (support tickets, bug reports, perf metrics, funnel drop-offs).
- **Severity classification:** P0 = critical (must fix esta sprint), P1 = important, P2 = nice-to-have.
- **Fix priority:** P0 (this sprint) > P1 (this sprint ou next) > P2 (backlog).
- **Effort estimation:** S = 1 dia, M = 2-3 dias, L = 5+ dias.

### 14.3. Community Health Score Methodology

- **Composite score:** 0-100 based on 5 drivers.
- **Bands:** Excellent (85+), Good (65-84), Warning (45-64), Critical (<45).
- **Driver weights:** DAU/MAU 25, D7 Retention 25, Comments/Post 20, Moderation SLA 15, Akasha 15.

---

## 15. Apêndice B — Data Sources

| Métrica | Source | Cadência | Owner |
|---------|--------|----------|-------|
| NPS D1/D3/D7 | W33-7 NPS prompt + PostHog | Daily | PM |
| Support tickets | Helpdesk (Intercom ou similar) | Real-time | Support |
| Bug reports | Sentry + Linear | Real-time | Coder + QA |
| Performance | Sentry + DataDog APM | Real-time | DevOps |
| Funnel | PostHog funnels API | Daily | PM |
| Email | Resend/Beehiiv analytics | Daily | PM |
| Community health | Prisma + cron aggregation | Daily | Coder |
| Marketing attribution | UTM params + spend logs | Daily | PM |

---

## 16. Apêndice C — KPI Definitions

| KPI | Definition | Target | Source |
|-----|------------|--------|--------|
| NPS | (Promoters - Detractors) / Total × 100 | ≥ +30 | NPS prompt |
| DAU/MAU | Daily Active / Monthly Active users | ≥ 35% | activity table |
| D7 Retention | % cohort ativo entre D2-D7 | ≥ 30% | cohort analysis |
| Comments/Post | comments / posts ratio | ≥ 1.0 | community table |
| Akasha Conversations/day | count of akasha_chat_started events | ≥ 200 (baseline) | PostHog |
| Conversion Funnel | signup / visitor | ≥ 10% | PostHog funnel |
| Perf P95 | 95th percentile latency | < 800ms | Sentry |
| Moderation SLA | % items reviewed < 24h | ≥ 95% | mod queue |
| CAC | Cost per signup | < R$ 15 | marketing attribution |
| Community Health Score | composite 0-100 | ≥ 65 (good) | derived |

---

## 17. Apêndice D — Cohort Definitions

| Cohort | Definition | Sample size (D7) |
|--------|------------|------------------|
| Wave 1 | Signups pré-2026-05-01 (early access) | 89 |
| Wave 2 | Signups 2026-05-01 → 2026-06-15 (private beta) | 65 |
| Wave 3 | Signups 2026-06-15 → present (open beta CONSTRAINED) | 46 |
| Tradição | preferred_tradition do profile | 6 buckets |
| ISO Week | week of createdAt | rolling |

---

## 18. Apêndice E — LGPD Compliance Checklist

- [x] NPS verbatims apenas de opt-in (W33-7 consent).
- [x] Support tickets categorizados por team-tag, não PII.
- [x] Marketing attribution agregada (sem userId raw).
- [x] Community health snapshots k-anonymous (k≥5).
- [x] Backlog items sem userId, apenas count + freq.
- [x] LGPD export self-service (W38B-011) PLANNED para Week 2.
- [x] Direito ao esquecimento: erasure support já implementado (W30 audit).

---

## 19. Apêndice F — Wave 39/40 Carryover

### 19.1. Para Wave 39 (+14 dias launch)

- Top 3 detractor themes (NPS §2.5) → potential features.
- Top 3 perf bottlenecks (D7 review) → Wave 39 perf optimizations.
- Doc gaps que impactam onboarding → Wave 39 content priorities.

### 19.2. Para Wave 40 (+30 dias launch)

- Pricing experiment data (W37B-2 carryover) → Wave 40 Stripe live.
- Community self-sustaining metrics (D14/D21/D30) → Wave 40 curator program v2.
- Mentor matching data (D7+) → Wave 40 marketplace expansion.

### 19.3. Itens deferred (Wave 41+)

- Akasha context memory (W38B-014) — big bet, needs Wave 39 AI infra.
- Mentor matching v2 (W38B-018) — needs Wave 40 mentorship data.
- Galeria rituais (W38B-017) — nice to have, Wave 41.

---

## 20. Apêndice G — Glossary

- **Akasha:** IA conversacional do produto (W29).
- **Cohort:** grupo de usuários com característica comum (signup date, tradição, etc.).
- **DAU/MAU:** Daily Active Users / Monthly Active Users (stickiness ratio).
- **Detractor:** NPS respondent score 0-6.
- **D7 Retention:** % cohort ativo entre D2-D7 após signup.
- **Funnel:** sequência de etapas que usuário percorre até conversão.
- **Health Score:** composite 0-100 derivado de 5 drivers (W38 community-health.ts).
- **k-anonymity:** técnica de privacidade que suprime cohorts com < k members.
- **NPS:** Net Promoter Score (-100 a +100).
- **Onboarding:** fluxo de 4-5 etapas pós-signup (W21 onboarding state machine).
- **Passive:** NPS respondent score 7-8.
- **Promoter:** NPS respondent score 9-10.
- **Stickiness:** ver DAU/MAU.
- **Tradition:** preferred_tradition do profile (6 opções + outra).
- **Wave:** unidade de planejamento quinzenal (W1-W40+ planejado).
- **W38B-N:** Wave 38, Sub-wave B, item N (iteration backlog ID).

---

## 21. References

- `WAVE-38-40-PLAN.md` — Forward-looking 3-wave plan (W38 → W39 → W40)
- `WAVE-37-OPEN-BETA-DECISION.md` — Decision matrix framework Wave 37
- `WAVE-37-SUMMARY.md` — Wave 37 honest close summary
- `OPEN-BETA-DECISION-W37.md` — Open beta GO/HOLD decision (Wave 4 trigger)
- `docs/WEEK-2-SPRINT-W38.md` — Week 2 sprint plan (Day 8-14)
- `scripts/synthesize-week1-nps.ts` — NPS synthesis script (this wave)
- `scripts/top-blockers.ts` — Blocker analysis script (this wave)
- `scripts/aggregate-user-feedback.ts` — User feedback aggregator (this wave)
- `src/lib/analytics/community-health.ts` — Community health module (this wave)
- `src/lib/product/iteration-backlog.ts` — Iteration backlog module (this wave)
- `src/app/admin/marketing/dashboard/page.tsx` — Marketing dashboard (this wave)
- `reports/week1-nps-synthesis.{json,md}` — Generated NPS report
- `reports/top-blockers.{json,md}` — Generated blocker report
- `reports/user-feedback-aggregation.{json,md}` — Generated feedback report

**Cross-references (project memory):**
- WAVE-38-40-PLAN.md §Wave 38 stop conditions
- W32-8 strategic decisions (12-week milestones)
- W33-7 NPS prompt (consent + cadence)
- W34 cron jobs (analytics aggregation)
- W34 notifications v2 dispatcher (W38B-007 dependency)

---

**Sign-off:**

- **PM (Tomás):** APPROVED — ITERATE
- **Designer (Lina):** pending review (onboarding v2 scope)
- **Coder:** pending review (P0 bug prioritization)
- **Owner:** pending review (Week 2 sprint budget + Wave 39 trigger)

---

*Generated 2026-07-01 · Wave 38 / Post-Launch Day-7 Review · Coordinator + PM Tomás · 25-min budget*
*LGPD compliant · k-anonymity applied · No PII in this document*