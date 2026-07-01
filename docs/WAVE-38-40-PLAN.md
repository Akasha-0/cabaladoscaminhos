# Wave 38-40 Plan — Post-Launch Iteration

> **Plano forward-looking para Wave 38 → 39 → 40.** Assume Wave 37 executar e Wave 4 trigger acontecer (CONSTRAINED ou GO). Se Wave 4 HOLD/KILL, este plano é readaptado para re-iteration ou archive.
>
> **Escopo por wave:**
> - **Wave 38** = post-launch iteration (7 dias após Wave 4 trigger) — first retrospective + iterate on NPS feedback + performance under real load
> - **Wave 39** = Wave 4 marketing (open beta to public, +14 dias após launch) — public launch announcement + influencer + community outreach
> - **Wave 40** = full public (community self-sustaining, +30 dias) — open monetization + team velocity + ongoing cadence
>
> **Time horizon total:** ~7 semanas. **Owner reviews obrigatórios a cada wave.**

---

## TL;DR

| Wave | Quando | Tema | Workers | Outcome esperado |
|------|--------|------|---------|------------------|
| **Wave 38** | Wave 4 trigger + 7 dias | Post-launch iteration | 6 (4 P0 + 2 P1) | NPS D7 ≥ 30, perf ok, bugs P0 = 0 |
| **Wave 39** | Wave 4 trigger + 14 dias | Wave 4 marketing | 5 (3 P0 + 2 P1) | waitlist → invite conversion ≥ 10%, brand recognition +30% |
| **Wave 40** | Wave 4 trigger + 30 dias | Full public | 4 (2 P0 + 2 P1) | community self-sustaining, monetization enabled, team velocity ≥ 3 waves/month |

**Dependências críticas:**
- Wave 38 assumes Wave 4 launched (CONSTRAINED 100 ou GO 500)
- Wave 39 assumes Wave 38 ✅ (NPS feedback em mão + bugs P0 resolvidos)
- Wave 40 assumes Wave 39 ✅ (marketing engine running + community ativo)

**Stop conditions globais:**
- Wave 38: NPS D7 < 20 → PAUSE + iterate onboarding
- Wave 39: conversion < 5% → pivot marketing strategy
- Wave 40: community activity < 10 posts/day → re-evaluate "self-sustaining"

---

## Wave 38 — Post-Launch Iteration (+7 dias pós Wave 4)

### Objetivo

First retrospective of real-world beta. Coletar Day-7 NPS feedback. Resolver P0 bugs que apareceram sob real load. Otimizar performance se degradou. **NÃO é wave de feature — é wave de consolidation.**

### 6 workers paralelos (4 P0 + 2 P1)

#### Sub-wave 38A — Stabilization (P0, 4 workers)

| # | Trilha | Tipo | Output esperado | SLA |
|---|--------|------|-----------------|-----|
| W38A-1 | P0 bug triage + fixes | Coder + QA | `docs/P0-BUGS-W38.md` + 5-10 P0 bugs resolvidos + regression suite passa | 7 dias |
| W38A-2 | Day-7 NPS analysis | PM + Coder | `docs/NPS-D7-ANALYSIS-W38.md` com NPS segmentado + qualitative themes + action items por detractor | 5 dias |
| W38A-3 | Performance under real load | Coder + DevOps | `docs/PERF-REAL-LOAD-W38.md` com k6 recreating production patterns + p99 stable + CDN/DB optimization identificado | 7 dias |
| W38A-4 | Moderação review + first moderator hire | PM + Designer | moderator onboarded (se Wave 3 retainer ativo) + SLA tracking de Wave 3 → Wave 4 patterns | 7 dias |

#### Sub-wave 38B — Iteration (P1, 2 workers)

| # | Trilha | Tipo | Output esperado | SLA |
|---|--------|------|-----------------|-----|
| W38B-1 | Onboarding optimization | Designer + PM | `docs/ONBOARDING-V2-W38.md` + A/B test first-touch flow + activation rate improvement ≥ 10pp | 10 dias |
| W38B-2 | Documentation gaps from D7 feedback | Writer + PM | `docs/DOC-GAPS-W38.md` + 5-10 KB articles + FAQ update + in-app tooltips | 10 dias |

### Dependências

- W38A-1 (bug fixes) independent → spawna primeiro
- W38A-2 (NPS analysis) independent → spawna primeiro
- W38A-3 (perf) depends on Wave 7 load test data (W37A-1 output)
- W38A-4 (moderação) depends on W37A-4 (moderação tooling) ✅
- W38B-1 (onboarding v2) depends on W38A-2 (NPS analysis)
- W38B-2 (docs) depends on W38A-2 (NPS analysis)

### Stop conditions

- **Se NPS D7 < 20:** ESCALATE. Wave 38 vira "rebuild trust" mode, mantém Wave 4 trigger.
- **Se > 3 P0 bugs não resolvidos em 7 dias:** ROTATE resource from W38B → W38A.
- **Se perf p99 degradou > 50% vs W37A-1 baseline:** SCALE infra (wave-spawner triggers extra scale worker).
- **Se moderação queue SLA > 24h:** FIRE second moderator.

### Métricas de sucesso

- ✅ NPS D7 ≥ 30 (target baseline) — se < 20, escalate
- ✅ P0 bugs resolvidos = 100% (zero open P0 after Wave 38)
- ✅ p99 latency stable (< 2x W37A-1 baseline) under real load
- ✅ Moderação SLA cumprido (> 95% posts reviewed < 24h)
- ✅ Onboarding activation +10pp (relative improvement)
- ✅ Doc coverage +5% (acumulado desde W36 close)

### Carryover para Wave 39

- Top 3 detractor themes (NPS qualitative) → potential Wave 39 features
- Top 3 perf bottlenecks → potential Wave 39 optimization
- Doc gaps que impactam onboarding → high priority Wave 39

---

## Wave 39 — Wave 4 Marketing (+14 dias pós Wave 4)

### Objetivo

Do private beta (or constrained 100-user beta) to **public open beta**. Marketing engine: public launch announcement + influencer partnerships + community outreach (yoga, meditation, terreiros) + press release + SEO. **Wave 39 = growth engine.**

### 5 workers paralelos (3 P0 + 2 P1)

#### Sub-wave 39A — Public Launch (P0, 3 workers)

| # | Trilha | Tipo | Output esperado | SLA |
|---|--------|------|-----------------|-----|
| W39A-1 | Public launch announcement | Designer + PM + Writer | blog post + social media kit + email blast + landing page video + press release draft | 10 dias |
| W39A-2 | Influencer partnerships activation | PM + Designer | 5-10 influencers contracted (yoga teachers, priests, spiritual leaders) + co-branded content + tracking links | 14 dias |
| W39A-3 | SEO ranking monitoring + content | Writer + Coder | `docs/SEO-LAUNCH-W39.md` + 20 SEO-optimized articles + schema markup + Google Search Console setup | 14 dias |

#### Sub-wave 39B — Community outreach (P1, 2 workers)

| # | Trilha | Tipo | Output esperado | SLA |
|---|--------|------|-----------------|-----|
| W39B-1 | Community outreach (yoga, meditation, terreiros) | PM + Designer | 10 partnerships com studios/terreiros + community guidelines for hosts + co-hosted rituals | 21 dias |
| W39B-2 | Press release distribution | PM + Writer | press release finalized + 30 publication targets (Brazilian spirituality + tech press) + outreach log | 14 dias |

### Dependências

- W39A-1 (announcement) independent → spawna primeiro
- W39A-2 (influencer) depends on Wave 7 brand assets (W37B-1 do Wave 37 plan) ✅
- W39A-3 (SEO) independent
- W39B-1 (community) depends on W39A-1 (brand guidelines) ✅
- W39B-2 (press) depends on W39A-1 (press release draft)

### Stop conditions

- **Se waitlist growth < 100 em 14 dias:** PIVOT marketing channel. Wave 39B-2 press release escalado.
- **Se conversion waitlist → active < 5%:** RECONSIDER funnel. Wave 39A-1 messaging A/B test.
- **Se influencer engagement rate < 2%:** SWAP influencers, contract new batch.
- **Se SEO ranking pior que baseline:** PAUSE content production, audit technical SEO primeiro.

### Métricas de sucesso

- ✅ Waitlist growth ≥ 1.000 emails em 14 dias
- ✅ Waitlist → active conversion ≥ 10%
- ✅ Press release publicado em ≥ 3 high-tier publications + 10+ tier 2
- ✅ Influencer reach combinado ≥ 100K impressions
- ✅ Organic search traffic +50% vs Wave 38 baseline
- ✅ Brand awareness survey: 5% recognition in target audience

### Carryover para Wave 40

- Influencer content yang works → repurpose for paid ads Wave 40
- Best-performing press angles → replicate with new hooks
- Community partners engajados → invite to advisory board Wave 41+

---

## Wave 40 — Full Public (+30 dias pós Wave 4)

### Objetivo

Transição de "open beta with marketing engine" para **"self-sustaining public product with monetization enabled"**. Enable paid plans, scale infra para steady state, build team velocity para 3+ waves/month.

### 4 workers paralelos (2 P0 + 2 P1)

#### Sub-wave 40A — Monetization + Scale (P0, 2 workers)

| # | Trilha | Tipo | Output esperado | SLA |
|---|--------|------|-----------------|-----|
| W40A-1 | Stripe live + paid plans | Coder + DevOps | Stripe production deploy + 2 pricing tiers (premium + community patron) + billing portal + LGPD compliant invoices | 14 dias |
| W40A-2 | Infrastructure scale (auto-scale rules + monitoring) | DevOps + Coder | HPA configured + monitoring alerts (Sentry + DataDog) + DR drill run + RPO/RTO validated | 14 dias |

#### Sub-wave 40B — Community + Team Velocity (P1, 2 workers)

| # | Trilha | Tipo | Output esperado | SLA |
|---|--------|------|-----------------|-----|
| W40B-1 | Community self-sustaining mechanisms | Designer + PM | `docs/COMMUNITY-V2-W40.md` + curator program v2 (paid) + mentorship marketplace + ritual circles v2 | 21 dias |
| W40B-2 | Team velocity + cadence planning | PM | `docs/TEAM-VELOCITY-W40.md` + 3-wave rolling plan + retros established + role expansion (writer, designer, devops) | 14 dias |

### Dependências

- W40A-1 (Stripe live) depends on W37B-2 (pricing experiment) result; needs ≥ 5% conversion signal
- W40A-2 (infra scale) depends on Wave 7 infra audit (W37A-1)
- W40B-1 (community) depends on Wave 7 community features (W32 + W34)
- W40B-2 (velocity) independent → spawna primeiro

### Stop conditions

- **Se Stripe deploy falha PCI compliance:** ROLLBACK + hire专门的 PCI consultant. Recurrence = kill Wave 40 monetization.
- **Se infra scale não aguenta load (any incident > 1h):** SCALE IMMEDIATELY + reconsider auto-scale rules. Recurrence = hire dedicated SRE.
- **Se community activity < 10 posts/day após 30 dias:** INVESTIGATE why engagement dropped. Wave 41 = "rebuild engagement".
- **Se team velocity < 2 waves/month:** RESTRUCTURE team (3 → 5 personas, role specialization).

### Métricas de sucesso

- ✅ MRR ≥ R$ 5.000 (Wave 40 close) com pricing tiers validated
- ✅ Infra scale supports 5x Wave 4 load sem degradation
- ✅ Community activity ≥ 30 posts/day + 5 rituals hosted/week
- ✅ Team velocity: 3 waves/month sustained (proven por Wave 41-43 execution)
- ✅ LGPD compliance audit passing (zero data export requests > 7 dias)
- ✅ NPS ≥ 40 sustained 30 dias (cohort B)

### Carryover para Wave 41+

- Pricing elasticity data → potential Wave 41 pricing v3 (A/B test)
- Infra optimization opportunities → Wave 41 finops
- Community self-sustaining health → Wave 41 sustainability review
- Team velocity → Wave 41 hiring plan

---

## Cross-wave risks

| Risco | Prob | Impacto | Mitigação |
|-------|------|---------|-----------|
| Wave 4 NEVER launches (Wave 37 fails) | Média | Catastrófico (30+ dias de zero progress) | Hold Wave 38-40 trigger até Wave 4 launch. Se Wave 7 hold > 30d, FORCE decision. |
| P0 bug em produção Wave 38 escapa para Wave 39 | Média | Alto (PR disaster) | W38A-1 SLA 7 dias + 100% zero P0 target + 30-day soak test optional |
| Marketing conversion < 5% Wave 39 | Baixa (assuming good product) | Alto (paid budget lost) | A/B test desde Wave 38 onboarding, fallback para organic-first Wave 39B-1 |
| Stripe payment failure Wave 40A-1 | Baixa | Alto (lost revenue + legal) | PCI compliance audit FIRST, deploy SECOND. Rollback tested. |
| Team burnout em 3-wave/month cadence | Alta | Alto (attrition) | Wave 40B-2 inclui sustainability review + load balancing |
| LGPD audit failure em produção Wave 40 | Baixa | Catastrófico (R$ 50M+ fine risk) | W37 Wave 7 LGPD já compliance, mantido por Wave 38-40 |

---

## Cross-project lesson (reusable)

**Pattern: 3-wave rolling plan (post-launch → marketing → scale) é mais robusto que 1-wave mega-plan.** Separa concerns: Wave 38 = stabilize what shipped, Wave 39 = grow it, Wave 40 = make it sustainable. Cada wave tem stop conditions claras.

**Wave 38 lesson (a priori):** Day-7 NPS é o sinal mais valioso — captura "aha moment" vs "pity activation". Se Day-7 NPS < 30, o onboarding tem problema; precisa iteração antes de growth.

**Wave 39 lesson (a priori):** Influencer + press + community = 3 vetores paralelos. Press release sozinho = noisy + 3 publications. Influencer sozinho = ego-driven + low conversion. Community outreach sozinho = slow burn. **3 juntos = compounding.**

**Wave 40 lesson (a priori):** Self-sustaining community só acontece com paid curators + mentorship marketplace. Sem esses 2, community é "free-for-all" e degrada para low-quality posts. Wave 40B-1 é o unlock.

**Template Wave 41+:** toda onda pós-launch deve ser (1) measure Wave-1 outcomes (NPS, perf, engagement), (2) iterate top 3 issues, (3) prepare next growth lever, (4) sustain what's working. **3-wave rolling = o padrão.**

---

## Próximo passo

1. **Owner review este plan** (recomendado 30min, não 15min — é forward-looking macro)
2. **Wave 38 trigger prep:** Após Wave 4 launch confirmado, wave-spawner prepara 6 YAMLs W38A-1..B-2. NÃO dispara até Wave 7 close confirmado.
3. **Wave 39 trigger prep:** Idem Wave 38, preparado para +14 dias. NÃO dispara até W38 ✅.
4. **Wave 40 trigger prep:** Idem, preparado para +30 dias.

**Stop:** este doc + commit. Aguarda Wave 4 trigger (wave 37 close) antes de qualquer Wave 38 prep.

---

## Apêndice: Timeline visual (Gantt-style ASCII)

```
2026-07-01  W37 plan committed, Wave 4 = HOLD                  [HOLE]
2026-07-08  Wave 37A executa (if owner ack)                    [?]
2026-07-15  Wave 37B executa + Wave 3 inicia (50 users)        [?]
2026-07-22  Re-decisão Wave 4 trigger (likely CONSTRAINED)     [?]
2026-07-29  Wave 4 launch (CONSTRAINED 100 users)              [?]
2026-08-05  Wave 38 trigger (Day-7 retrospective)              [target]
            ├── W38A-1 P0 bugs
            ├── W38A-2 NPS analysis
            ├── W38A-3 perf real load
            ├── W38A-4 moderação review
            ├── W38B-1 onboarding v2
            └── W38B-2 doc gaps
2026-08-12  Wave 39 trigger (+14 dias launch)
            ├── W39A-1 launch announcement
            ├── W39A-2 influencer partnerships
            ├── W39A-3 SEO + content
            ├── W39B-1 community outreach
            └── W39B-2 press release
2026-08-26  Wave 40 trigger (+30 dias launch)
            ├── W40A-1 Stripe live
            ├── W40A-2 infra scale
            ├── W40B-1 community v2
            └── W40B-2 team velocity
2026-09-15  Wave 41 review (3-wave retrospective + cadence planning)
```

`?` = depende de Wave 37 execution + owner ack. Tudo entre 2026-07-08 e 2026-08-26 é conditional.

**Critical path:** Wave 37 execute → Wave 4 launch → Wave 38 → Wave 39 → Wave 40. Cada wave é blocker para a próxima. **Total Wave 7 close → Wave 40 close ≈ 8 semanas (= ~2026-08-26).**

---

**Reference:** `WAVE-37-SUMMARY.md` (Wave 37 honest summary) · `OPEN-BETA-GO-DECISION.md` (Wave 4 HOLD decision) · `WAVE-37-OPEN-BETA-DECISION.md` (decision framework) · `WAVE-36-SUMMARY.md` (Wave 36 close baseline) · `WAVE-34-SUMMARY.md` (Wave 34 close baseline cron/analytics/seed/DR).
