# Wave 40 — Full Public Launch + Series A Prep

> **Wave 40 = go BIG or go home.** Open beta → public beta → public GA. App stores live. Marketing engine running. Series A pitch deck ready. Team scaling plan executed. **Goal: prove PMF + raise R$5–15M Series A.**

**Trigger conditions:**
- Wave 39 = 7/8 ✅ (TSC fix + Akasha prod + community health + mobile + video + API + marketing scale)
- Wave 38 disposition decided ✅
- Wave 4 = CONSTRAINED/GO ✅ (open beta ativa, ≥100 MAU)
- Owner ack Wave 40 budget
- Tração mínima: ≥1000 MAU OR ≥R$5k MRR OR ≥5000 waitlist conversion

**Stop conditions:**
- MAU growth <20% MoM por 2 meses consecutivos → PAUSE Series A, focus retention
- MRR <R$5k após 30d monetization → PAUSE Wave 40, pivot business model
- App Store / Play Store rejection permanente → ESCALATE, hire mobile consultant
- Team velocity <2 waves/month → RE-EVALUATE headcount

---

## TL;DR

| Sub-wave | Quando | Tema | Workers | Outcome esperado |
|----------|--------|------|---------|------------------|
| **Wave 40A** | Wave 39 + 14 dias | Public GA + App Stores live | 5 (4 P0 + 1 P1) | Public GA announcement, App Store + Play Store live, press coverage ≥10 outlets |
| **Wave 40B** | Wave 39 + 30 dias | Monetization at scale + Partnership activations | 4 (3 P0 + 1 P1) | MRR ≥R$15k, partnership deals ≥15, ambassador program live (20 ambassadors) |
| **Wave 40C** | Wave 39 + 45 dias | Series A prep + Team scaling | 4 (2 P0 + 2 P1) | Pitch deck final, financial model, data room, 20 VC meetings, team 8 → 14 |

**Total Wave 40 LOC budget:** 25.000–35.000 (código + docs + tests) · **Cash budget:** R$80k–150k (team hiring + marketing + legal + infra) · **Team:** 15–18 person-weeks

---

## Wave 40A — Public GA + App Stores Live (P0)

### Objetivo

Tirar a app do "open beta" e abrir para **public GA** (general availability). App stores oficialmente listados. Marketing engine em full power. PR distribuído. Primeiros 5k–10k signups orgânicos esperados.

### 5 workers paralelos (4 P0 + 1 P1)

#### W40A-1 — Public GA launch execution 🔴 P0

**Coordinator + PM + Designer + Writer**

**Outputs:**
- `docs/launch-announcement.md` (PT-BR + EN, public post + email blast)
- `marketing/launch-assets/` (hero image, video 30s, social cards)
- Press release final + distribution (50 outlets: Folha, Estadão, UOL, Carta Capital, Medium, LinkedIn, Twitter/X, Instagram, TikTok, YouTube)
- Launch day coordination (T-7d, T-1d, T-0, T+1d, T+7d cadence)
- Status page live (status.cabaladoscaminhos.com)
- Email sequence to waitlist (10k users): D-3 reminder, D-0 launch, D+3 onboarding

**SLA:** 14 dias · **Depends:** W39-2 marketing engine ✅, W39-5 mobile submission ✅

#### W40A-2 — App Store + Play Store live 🔴 P0

**Coder + Designer + DevOps**

**Outputs:**
- iOS app submitted + approved + live (App Store Connect)
- Android app submitted + approved + live (Google Play Console)
- ASO (App Store Optimization): keywords, screenshots (10 por locale), description (PT-BR + EN + ES)
- App Store reviews management (respond to reviews within 24h)
- Cross-promo: web → app, app → web
- Push notifications setup (APNs + FCM)

**SLA:** 14 dias (paralelo a W40A-1) · **Depends:** W39-5 mobile submission ready

#### W40A-3 — Public marketing amplification 🔴 P0

**PM + Designer + Writer + Influencer manager**

**Outputs:**
- Influencer wave 2 (10–20 new influencers, base expandida do W39-2)
- Paid ads scale (R$15k budget, lookalike audiences de W39-2 converters)
- Content engine: 60 articles (SEO), 30 vídeos (YouTube + TikTok + Reels), 100 social posts
- Email marketing: weekly digest to all users, re-engagement campaigns
- Community-led growth: referral program (R$10 credit por invite que converter)
- Podcast tour: 5 podcasts PT-BR spirituality + tech

**SLA:** 21 dias (rolling) · **Depends:** W40A-1 launch ✅

#### W40A-4 — Infrastructure at scale 🔴 P0

**DevOps + Coder**

**Outputs:**
- Multi-region deployment (US East + EU West + BR South)
- Database read replicas (Postgres + Redis Cluster)
- Auto-scaling rules (CPU >60% → +2 instances, queue depth >100 → +1 worker)
- Disaster recovery drill (full region failover test, RTO <30min)
- Observability v2 (Datadog ou Grafana Cloud, 90-day retention, alerting on-call rotation)
- Cost monitoring (Vercel + Supabase + Cloudflare + S3 dashboards)

**SLA:** 21 dias · **Depends:** Wave 36 perf hardening ✅

#### W40A-5 — Public docs + help center expansion 🟡 P1

**Writer + Designer + Coder**

**Outputs:**
- Public docs site (cabaladoscaminhos.com/docs, Mintlify)
- Help center v2 (search, AI chatbot, video tutorials, community forum link)
- FAQ expandida (200+ questions, SEO-optimized)
- Onboarding tour (in-app, 5 steps, <2min completion target)
- Privacy policy + Terms of Service (legal review, PT-BR + EN)

**SLA:** 14 dias · **Depends:** Wave 36 help docs ✅

### W40A — Dependencies (DAG)

```
W40A-2 (app stores) ──┐
W40A-1 (launch)      ──┼──independent─┐
W40A-3 (marketing)   ──┤              │
W40A-4 (infra)       ──┘              │
                                      ├── W40A-5 (docs/help)
                                      │
                                      ↓
                              Public GA LIVE
```

---

## Wave 40B — Monetization at Scale + Partnership Activations (P0)

### Objetivo

Converter growth em revenue. Premium subscriptions live. Practitioner marketplace live. Partnership deals ativados. **Meta: MRR ≥R$15k em 30 dias.**

### 4 workers paralelos (3 P0 + 1 P1)

#### W40B-1 — Premium subscriptions v2 🔴 P0

**Coder + PM + Designer**

**Outputs:**
- Stripe live (já preparado Wave 37, produção Wave 40)
- 3 tiers: Free / Premium (R$29/mo) / Practitioner (R$99/mo)
- Feature gates: Free = read + limited post, Premium = unlimited post + private circles + analytics, Practitioner = tudo + marketplace listing + booking
- 14-day free trial + downgrade flow (no penalty, keep data)
- Invoice + receipt (PT-BR legal compliance)
- Churn prediction model (signals: low engagement, payment failures, support tickets)
- Win-back campaigns (D+30, D+60, D+90 post-churn)

**SLA:** 21 dias · **Depends:** Wave 37 Stripe ✅, W40A-1 launch ✅

#### W40B-2 — Practitioner marketplace 🔴 P0

**Coder + PM + Designer + Curator**

**Outputs:**
- Practitioner profiles (bio, traditions, certifications, pricing, availability)
- Booking system (calendar sync Google/Apple, payment escrow)
- Reviews + ratings (2-way: client + practitioner)
- Search + filters (tradition, location, language, price, availability)
- Practitioner onboarding flow (KYC light, background check opcional)
- Practitioner support (dedicated Slack/Discord, monthly office hours)

**SLA:** 30 dias · **Depends:** Wave 35 curators invite ✅

#### W40B-3 — Partnership activations at scale 🔴 P0

**PM + Designer + Partnership manager**

**Outputs:**
- 15 partnership deals live (yoga studios, herbalists, astrologers, meditation centers, terreiros)
- Co-branded offerings (30 combined: yoga + leitura, ervas + consulta, astrologia + meditação)
- Partner dashboard (orders, revenue share, analytics)
- Partner marketing kit (co-branded templates, social media kit, email templates)
- Partner events (monthly partner meetup online, annual summit in-person)
- Revenue share settlement (monthly automated via Stripe Connect)

**SLA:** 30 dias (rolling) · **Depends:** Wave 39 marketing partnerships ✅

#### W40B-4 — Ambassador program 🟡 P1

**PM + Community manager**

**Outputs:**
- 20 ambassadors (mix of content creators, spiritual leaders, active community members)
- R$300/mo stipend + revenue share on referrals
- Ambassador playbook (how to grow community locally)
- Monthly ambassador challenges (engagement + growth metrics)
- Ambassador-only Slack/Discord channel
- Quarterly in-person retreat (1 in 2026: Salvador BA, axis of Candomblé/Umbanda)

**SLA:** 30 dias (rolling) · **Depends:** Wave 39 community programs ✅

### W40B — Dependencies (DAG)

```
W40B-1 (subscriptions) ──┐
W40B-2 (marketplace)    ──┼──independent─┐
W40B-3 (partnerships)   ──┤              │
W40B-4 (ambassadors)    ──┘              │
                                         │
                                         ↓
                              MRR ≥R$15k, 15 deals live
```

---

## Wave 40C — Series A Prep + Team Scaling (P0)

### Objetivo

Posicionar a empresa para **Series A R$5–15M** (US$1–3M). Pitch deck pronto. Data room pronto. 20 VC meetings agendados. Team scaling planejado + primeiros 6 hires executados.

### 4 workers paralelos (2 P0 + 2 P1)

#### W40C-1 — Series A pitch deck + narrative 🔴 P0

**Founder + PM + Designer**

**Outputs:**
- Pitch deck v1 (15 slides: problem, solution, market, traction, business model, GTM, team, ask)
- One-pager (executive summary, 1 page, PDF)
- Narrative doc (story: founder motivation, why now, why us, why this market)
- Demo video (3min, product walkthrough, captioned PT-BR + EN)
- Market sizing (TAM/SAM/SOM, top-down + bottom-up)
- Competitive landscape (10 competitors analyzed, positioning matrix)

**SLA:** 14 dias · **Depends:** traction data de W40A ✅, MRR data de W40B ✅

#### W40C-2 — Financial model + data room 🔴 P0

**Founder + Finance (hire ou consultant) + Coder**

**Outputs:**
- Financial model (3-year projection, monthly granularity, scenarios: base/upside/downside)
- Unit economics (CAC, LTV, payback period, gross margin, contribution margin)
- Cap table (founders, ESOP pool, prior rounds)
- Data room (DocSend ou Google Drive organized): pitch deck, financials, cap table, customer references, product demo, contracts, IP, legal
- Metrics dashboard (MRR, MAU, DAU/MAU ratio, NRR, churn, CAC, LTV, payback)
- Board deck template (monthly board update)

**SLA:** 21 dias · **Depends:** W40B-1 monetization live ✅

#### W40C-3 — Team scaling: 6 hires 🔴 P0

**Founder + HR (hire ou consultant)**

**6 hires prioritários:**

| Role | Por quê | Custo/mo (BR) | Wave start |
|------|---------|---------------|------------|
| Senior Backend Engineer (Node.js + Postgres) | unlock velocity, mentor mid-level | R$18–25k | Wave 40C start |
| Senior Mobile Engineer (React Native OR Native iOS/Android) | own mobile roadmap, ship to app stores | R$18–25k | Wave 40C start |
| DevOps/SRE | own infra, on-call rotation, cost optimization | R$15–22k | Wave 40C start |
| Community Manager | own community health, ambassador program, crisis response | R$8–12k | Wave 40C start |
| Growth Marketer | own paid + content + influencer engine | R$10–15k | Wave 40C start |
| Finance/Ops (part-time ou fractional CFO) | own financial model, board prep, investor relations | R$8–12k | Wave 40C start |

**Total new payroll:** R$77–111k/mo · **Hiring cost:** R$30–50k (recruiter fees + signing bonuses)

**SLA:** 45 dias (rolling) · **Depends:** Series A committed OR bridge funding secured

#### W40C-4 — VC outreach + investor relations 🟡 P1

**Founder**

**Outputs:**
- VC target list (50 VCs: PT-BR spirituality-adjacent, Latin American tech, social impact, Web3/community)
- Warm intro pipeline (founders network + accelerator alumni + angels)
- Cold outreach templates (3 variants: long, short, one-liner)
- 20 VC meetings booked (target: 10 first meetings, 5 second meetings, 2 term sheets)
- Investor update template (monthly, post-funding)
- Data room access tracking (who viewed what, when)
- Pitch practice (3 mock sessions with advisors/mentors)

**SLA:** 45 dias (rolling) · **Depends:** W40C-1 deck ✅, W40C-2 data room ✅

### W40C — Dependencies (DAG)

```
W40C-1 (deck)         ──┐
W40C-2 (financials)   ──┼──independent─┐
W40C-3 (hiring)       ──┤              │
W40C-4 (VC outreach)  ──┘              │
                                      │
                                      ↓
                              Series A target: R$5–15M
```

---

## Wave 40 — Resource budget

### Total LOC estimado

| Sub-wave | LOC código | LOC docs | LOC tests | Total |
|----------|-----------|----------|-----------|-------|
| Wave 40A | 6.000–8.000 | 3.000–4.000 | 3.000–4.000 | 12.000–16.000 |
| Wave 40B | 5.000–7.000 | 2.000–3.000 | 2.500–3.500 | 9.500–13.500 |
| Wave 40C | 2.000–3.000 | 4.000–5.000 | 1.000–1.500 | 7.000–9.500 |
| **Total** | **13.000–18.000** | **9.000–12.000** | **6.500–9.000** | **28.500–39.000** |

### Total cash budget

| Categoria | Wave 40A | Wave 40B | Wave 40C | Total |
|-----------|----------|----------|----------|-------|
| Influencer fees (wave 2) | R$10k–15k | R$5k–10k | R$0 | R$15k–25k |
| Paid ads scale | R$15k | R$10k | R$0 | R$25k |
| Ambassador stipends | R$0 | R$6k/mo × 1mo | ongoing | R$6k+ |
| Infra (CDN, multi-region, observability) | R$8k | R$5k | R$0 | R$13k |
| Legal (privacy, terms, partnership contracts) | R$5k | R$3k | R$0 | R$8k |
| App Store fees (dev accounts, certificates) | R$1k | R$0 | R$0 | R$1k |
| Hiring cost (recruiter + signing) | R$0 | R$0 | R$30k–50k | R$30k–50k |
| New payroll (6 hires, 1–3 meses) | R$0 | R$0 | R$77k–111k/mo × 1–3mo | R$77k–333k |
| VC outreach (travel, events, advisors) | R$0 | R$0 | R$15k–25k | R$15k–25k |
| Reserve (15%) | R$6k | R$5k | R$20k | R$31k |
| **Total** | **R$45k–50k** | **R$34k–39k** | **R$142k–246k** | **R$221k–335k** |

**Note:** payroll dominates. Se Series A não fechar em 90 dias, payroll vira burn rate insustentável. Stop condition crítica.

### Team capacity assumed

**Core team Wave 40:**
- 1 Founder/CEO (full-time)
- 1 PM (full-time)
- 2 Coders senior (full-time)
- 1 Designer (full-time)
- 1 Writer (full-time, part-time W40C)
- 1 DevOps (part-time Wave 40A, full-time W40C)
- 1 Curator (part-time W40B)
- 1 Community manager (part-time Wave 40A, full-time W40B-C)

**New hires Wave 40C:**
- 6 people (Senior Backend, Senior Mobile, DevOps/SRE, Community Manager, Growth Marketer, Finance/Ops)

**Total:** 8 (core) + 6 (new) = 14 people × 2 waves = ~28 person-weeks

---

## Wave 40 — Stop conditions

| Trigger | Action |
|---------|--------|
| Public GA conversion (visit → signup) <2% após 14d | PIVOT landing page, re-design |
| App Store rejection permanente (>3 ciclos) | ESCALATE, hire mobile consultant, paraleliza web push |
| MRR <R$5k após 30d monetization | PAUSE Wave 40B, pivot business model (free + donation? B2B? B2C?) |
| Partnership deal close rate <20% (target: 15/50) | PIVOT partnership strategy, focus top 10 |
| Hire rejection rate >50% (offers declined) | RAISE offer range 20%, expand remote OK |
| VC meetings <10 após 30d outreach | PIVOT positioning (B2B? impact? Web3?) |
| Burn rate >R$100k/mo sem Series A committed | EMERGENCY: pause hiring, cut non-essential, bridge fundraising |
| Team velocity <2 waves/month | RE-EVALUATE headcount + tooling + process |

---

## Wave 40 — Risk register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| App Store rejection (especially Apple spirituality apps) | Medium | High | Appeal process, work with Apple reviewer, prepare alt metadata |
| Series A não fecha em 6 meses | Medium | Critical | Bridge funding (R$500k–1M from angels/accelerator), reduce burn |
| Community toxicity spike com growth | High | High | Auto-mod v2 + community manager + crisis playbook |
| Infra cost explosion (Vercel + Supabase + CDN) | Medium | Medium | Cost monitoring + auto-scaling rules + reserved capacity |
| Influencer controversy (PT-BR spirituality polarizing) | Medium | High | Contract clauses (morality), diversify influencer portfolio |
| Founder burnout (faz tudo) | High | Critical | Hire COO/Head of Ops ASAP, founder focus = vision + fundraising |
| Multi-agent race condition Wave 38 recurrence | Medium | Medium | Coordination lock + per-worker branches + merge gate |

---

## Wave 40 — Success metrics

| Metric | Wave 40 start | Wave 40 mid | Wave 40 end (90d) |
|--------|---------------|-------------|--------------------|
| MAU | 500 (Wave 39 end) | 5.000 | 20.000 |
| DAU/MAU ratio | 20% | 25% | 30% |
| MRR | R$0 (pre-monetization) | R$5k | R$30k |
| Paying customers | 0 | 200 | 1.000 |
| App Store rating | n/a | 4.5+ | 4.7+ |
| App Store reviews | 0 | 100 | 500 |
| Partnership deals | 0 | 5 | 15 |
| Ambassadors | 0 | 10 | 20 |
| Team size | 8 | 10 | 14 |
| VC meetings | 0 | 10 | 20 |
| Series A committed | No | Soft commit | Yes (target) |
| Burn rate/mo | R$30k | R$80k | R$150k |
| Runway | 12mo | 18mo (post-funding) | 24mo+ |

---

## Cross-project lessons (Wave 40 antecipadas)

1. **Public launch é data-driven decision, não founder gut.** Wave 40C-1 pitch deck precisa de traction real (MAU, MRR, retention). Sem dados, VC diz no. Wave 40 foca em métricas antes de pitch.
2. **Series A em LATAM para nicho espiritual é nicho dentro de nicho.** VC universe pequeno. Mitigation: cast wide net (50 VCs), consider impact funds (Acumen, Omidyar), consider US-based LATAM-focused VCs (Monashees, Kaszek, Valor Capital).
3. **Mobile apps App Store approval é gate, não nice-to-have.** PT-BR spirituality apps podem trigger Apple/Google review extra (especialmente conteúdo gerado por user). Mitigation: prepare alt metadata, work with reviewer, have web fallback.
4. **Practitioner marketplace é o caminho para R$30k MRR.** Subscription sozinho não escala em nicho (churn alto). Marketplace take rate (15–20%) é revenue sustentável. Wave 40B-2 é o coração da business model.
5. **Team scaling é o maior risk em Wave 40.** Burn rate explode com 6 hires. Sem Series A committed em 90d, payroll vira existencial threat. Founder deve focar em fundraising 50% do tempo Wave 40C.
6. **Coordination lock + per-worker branches NÃO é opcional em Wave 40.** Wave 38 race condition carryover + 8 workers paralelos = receita para disaster. Wave 40 mantém pattern Wave 39 (file-path leases + branch-per-worker + merge gate).

---

## Wave 40 — Communication plan

### Internal (team)

- **Daily standup** (15min, async-first via Slack/Discord thread)
- **Weekly retro** (Friday, 1h, what worked / what didn't / next week focus)
- **Monthly all-hands** (2h, demo + roadmap + Q&A)
- **Quarterly OKR review** (4h, founder presents, team aligns)

### External (community)

- **Weekly community digest** (Sunday, email + in-app notification)
- **Monthly product update** (blog post + changelog + video)
- **Quarterly community survey** (NPS + feature requests + sentiment)
- **Annual in-person summit** (1 in 2026: Salvador BA, ~100 attendees)

### External (investors)

- **Pre-funding:** bi-weekly founder update (text + metrics)
- **Post-funding:** monthly investor update (board deck format)
- **Quarterly board meeting** (post-Series A)

---

## Próximo passo imediato

### Para o owner

1. **Review este plan + WAVE-39-SUMMARY.md** (~25min total)
2. **Decidir Wave 40 trigger:** Wave 39 ≥7/8 ✅ + traction signal + budget ack
3. **Ack Wave 40 budget:** R$221k–335k cash + 14 people + 90-day timeline
4. **Decidir mobile app priority:** iOS first vs Android first vs both paralelos
5. **Decidir Series A target:** R$5M (conservador) vs R$15M (agressivo)
6. **Decidir founder allocation:** 50% fundraising vs 30% produto vs 20% team
7. **Ack coordination lock infrastructure** (Wave 39 P0, deve continuar Wave 40)

### Para a wave-spawner

- Wave 40 trigger blocked por Wave 39 = 7/8 + owner ack budget
- **Pausar** auto-dispatch Wave 40 até coordination lock infrastructure validada
- Wave 40A → B → C sequencial (não paralelas), cada sub-wave sequencial após anterior
- Coordination lock: file-path leases + branch-per-worker + merge gate obrigatório
- Wave-spawner deve propor **coordination lock strategy** antes de Wave 40A dispatch

### Para o coordinator

- Aguardar owner ack antes de Wave 40 dispatch
- Compilar Wave 40A sub-plan detalhado quando trigger confirmado (~30min)
- Manter WAVE-LOG.md atualizado a cada sub-wave checkpoint

---

## Refs

- `docs/WAVE-39-SUMMARY.md` (Wave 39 deliverables + status)
- `docs/WAVE-38-SUMMARY.md` (Wave 38 honest state)
- `docs/WAVE-39-40-PLAN.md` (plan anterior, mantém como referência)
- `docs/WAVE-LOG.md` (append-only log, 1MB+, todas as waves desde W1)
- `docs/W37-OPEN-BETA-DECISION.md` (Wave 37 open beta GO decision)
- `docs/OPEN-BETA-GO-DECISION.md` (Wave 4 disposition decision, se aplicável)