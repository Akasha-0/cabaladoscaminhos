# Wave 36-37 Plan — Beta Iteration + Wave 2/3 + Open Beta Decision

> Plano tático para Wave 36 (iteration on Wave 1 feedback + Wave 2 invitation) e Wave 37 (Wave 3 + open beta decision). Decisões macro derivam de Wave 34 (hardening), Wave 35 (4/8 fully delivered, 2/8 partial, 2/8 not started) e da estratégia beta launch v2.

## Contexto

**Estado @ Wave 35 close (parcial):**

- main @ `8d6323c8` (W34 close-out)
- TSC = 0 (preliminar, working tree tem 74 entries)
- Wave 34 hardening completo (DR + cron + seed + SEO + a11y + security + analytics)
- Wave 35 disparada: 4/8 fully delivered (onboarding, curators, invite system, mentorship), 2/8 partial (akasha RAG, events), 2/8 not started (marketplace verify+escrow, workshops)
- Working tree acumula 18 W35 novos + 30+ W34 carryover + 8 modified = ~74 entries
- Beta launch Wave 1 (10 users white-glove) pronta para disparar após owner decision D1 + D2

**Gaps críticos:**

| ID | Gap | Bloqueio |
|----|-----|----------|
| G1 | W35-5 marketplace verification + escrow não iniciado | Wave 2 users não podem comprar com segurança |
| G2 | W35-4 Akasha RAG não implementado | NPS Day 7 pode cair por respostas genéricas |
| G3 | W35-7 workshops module não iniciado | Monetização workshops bloqueada |
| G4 | White-glove onboarding script (W33 plan) não escrito | Wave 1 onboarding call sem roteiro |
| G5 | Owner decision D1 + D2 pendente | Convites Wave 1 não podem disparar |

---

## Wave 36 — Iteration on Wave 1 Feedback + Wave 2 (20 users intensive)

**Tema:** aplicar feedback real dos primeiros 10 users Wave 1 + convidar mais 20 users Wave 2 com track intensive.

**Trigger:** Wave 35 ✅ (workers landed) + Wave 1 invites enviados (D1 owner decision) + NPS Day 7 Wave 1 ≥ 30 (gate de Wave 2).

### Decisões macro

- **D1 switch:** Wave 2 = intensive (não 1:1, mas onboarding estruturado + grupo WhatsApp + Office Hours semanais). White-glove fica exclusivo para Wave 1.
- **D4 validate:** D7 retention target medido de verdade com Wave 1 (não simulação).
- **D6 baseline:** moderação auto (AI flags) + human review queue para casos > 0.7 confidence.
- **G1 + G2 close:** W35-5 marketplace verify+escrow + W35-4 RAG re-spawn como P0 (bloqueio para Wave 2).

### Sub-wave 36A — Close gaps (4 workers P0)

**Objetivo:** fechar gaps Wave 35 antes de convidar Wave 2.

| # | Trilha | Tipo | Output esperado |
|---|--------|------|-----------------|
| W36A-1 | W35-5 marketplace verification re-spawn | Coder + Security | Verification flow (CNH/CPF + linhagem) + escrow state machine (HELD → RELEASED → REFUNDED) + dispute handling |
| W36A-2 | W35-4 Akasha RAG re-spawn | Coder + AI | Vector store + embeddings pipeline + top-5 articles retrieval por tradição do user |
| W36A-3 | W35-7 workshops module | Coder | Multi-session workshops + materiais + certificados + integração com Stripe |
| W36A-4 | White-glove onboarding script (30min call) | Designer + Coder | `docs/ONBOARDING-WHITE-GLOVE-SCRIPT.md` (roteiro) + checklist + Gong/HubSpot template |

### Sub-wave 36B — Iterate on Wave 1 feedback (5 workers)

**Objetivo:** aplicar feedback real (não palpite) dos 10 Wave 1 users + convidar Wave 2.

| # | Trilha | Tipo | Output esperado |
|---|--------|------|-----------------|
| W36B-1 | Onboarding fixes Wave 1 feedback | Designer + Coder | 3-5 melhorias de onboarding baseado em feedback NPS Day 1/3/7 (ex: tooltip em tradição, skip-onboarding, profile completion incentivization) |
| W36B-2 | Documentation updates Wave 1 | Tech Writer | `docs/USER-GUIDE.md` + FAQ expandido com 10+ perguntas reais dos Wave 1 users |
| W36B-3 | Monitoring dashboards Wave 2 | DevOps | Dashboard Grafana com cohort Wave 1 vs Wave 2 + NPS breakdown + retention heatmap |
| W36B-4 | Invite Wave 2 (20 users) | Ops + Coder | `scripts/beta/invite-wave-2.ts` (intensive track, sem 1:1 call) + WhatsApp group automation + Office Hours calendar |
| W36B-5 | Moderação queue + human review | Coder + Security | `/admin/moderation/queue` UI + SLA tracking (24h target) + escalation rules + audit log |

### Dependências

- W36A-1 → W36B-4 (marketplace verify+escrow tem que estar pronto antes de convidar Wave 2 com permissão de compra)
- W36A-2 → W36B-1 (RAG tem que estar deployado antes de iterar onboarding — senão feedback de Akasha fica confuso)
- W36A-4 → W36B-4 (white-glove script tem que existir para validar que intensive track é delta, não duplicação)
- W36B-2 → W36B-4 (FAQ atualizado antes de convidar Wave 2)
- W36B-5 → W36B-4 (moderação SLA tem que estar pronta para volume maior de Wave 2)

### Acceptance Wave 36

- ✅ W35-5 marketplace verify+escrow deployed + testado em staging
- ✅ W35-4 RAG em produção com top-5 retrieval + personalização por tradição
- ✅ Workshops module funcional (criar → inscrever → assistir → certificado)
- ✅ White-glove script testado com 1 user fake (pode ser owner)
- ✅ 3-5 melhorias de onboarding deployadas com medição antes/depois
- ✅ Docs atualizados com 10+ perguntas reais dos Wave 1 users
- ✅ 20 convites Wave 2 enviados (intensive track)
- ✅ Moderação queue testada com casos fake + SLA < 24h

### Stop conditions

- Se D7 retention Wave 1 < 25% → pausa Wave 2, foco em retention + re-onboarding
- Se bug crítico aparece em Wave 1 → freeze Wave 2 até fix + post-mortem
- Se NPS Day 7 Wave 1 < 30 (gate) → HOLD Wave 36B-4, re-iterate onboarding primeiro
- Se marketplace escrow tem race condition → HOLD Wave 36B-4, fix state machine
- Se owner review lag > 24h → escalate (Wave 36 é tempo-sensível: 30 dias desde Wave 1 invite)

---

## Wave 37 — Wave 3 + Open Beta Decision

**Tema:** escalar para 50 users (Wave 3) + decidir se vai para open beta (Wave 4+).

**Trigger:** Wave 36 ✅ + NPS Day 14 Wave 1 ≥ 35 + D7 retention Wave 2 ≥ 30% (gate de Wave 3).

### Decisões macro (D-final)

- **D5 decision:** free-beta → freemium ou paid? Baseado em conversion data Wave 1+2 (se ao menos 5% pagariam por premium, freemium; senão, free-beta até Wave 4)
- **D7 final:** incident response SLA publicado (1h response, 4h resolve P1, on-call rotation)
- **Open beta gate:** NPS Day 30 Wave 1+2 ≥ 40 + 0 P0 incidents in 14d + load test 100 RPS p99 < 500ms

### Sub-wave 37A — Scale prep (4 workers P0)

**Objetivo:** preparar infra + decision matrix para Wave 3 (50 users).

| # | Trilha | Tipo | Output esperado |
|---|--------|------|-----------------|
| W37A-1 | Performance audit under load | Coder + DevOps | `docs/PERFORMANCE-AUDIT-W37.md` com k6 load test 100 RPS + p99 latency < 500ms target + bottlenecks identificados |
| W37A-2 | Incident response playbook | DevOps | `docs/INCIDENT-RESPONSE-PLAYBOOK.md` + on-call rotation setup (PagerDuty) + status page (statuspage.io) + 5 tabletop scenarios |
| W37A-3 | Invite Wave 3 (50 users) | Ops | `scripts/beta/invite-wave-3.ts` (hybrid track) + cohort selector + capacity-based scaling (10/dia até completar 50) |
| W37A-4 | Moderação hire plan + tooling | PM + Coder | Spec para primeiro human moderator + SLA tracking dashboard + training materials |

### Sub-wave 37B — Open beta decision + prep (4 workers P1)

**Objetivo:** preparar terreno para open beta Wave 4 (500 users) baseado em sinais reais.

| # | Trilha | Tipo | Output esperado |
|---|--------|------|-----------------|
| W37B-1 | Public launch preparation | Designer + PM | landing page update + press kit + community guidelines público + blog post announcement |
| W37B-2 | Pricing experiment setup | Coder + PM | A/B test infrastructure + pricing page variants (free-beta vs freemium vs paid) + tracking + Stripe integration |
| W37B-3 | Open beta waitlist automation | Ops + Coder | waitlist → invite automático quando vaga abre (Wave 4 capacity 500) + email sequence + capacity-based throttling |
| W37B-4 | Metrics consolidation + Wave 37 summary | Coder + PM | `docs/BETA-METRICS-W35-37.md` (consolidated D1/D7/D30 + NPS breakdown + funnel analysis + cohort heatmap) + Wave 37 summary doc |

### Dependências

- W37A-1 → W37B-3 (load test precisa validar que aguenta open beta auto-invite)
- W37A-2 → W37B-3 (incident response precisa estar publicado antes de auto-invite Wave 4)
- W37A-3 → W37A-4 (Wave 3 convites antes de expandir moderação)
- W37B-2 → W37B-1 (pricing variant precisa existir antes do launch page)
- W37A-1 + W37A-2 + W37B-4 → Open beta gate (todos os 3 inputs precisam estar completos)

### Acceptance Wave 37

- ✅ Load test passa 100 RPS sustained p99 < 500ms
- ✅ Incident playbook + on-call rotation + status page publicadas
- ✅ 50 convites Wave 3 enviados (hybrid track)
- ✅ Moderação hire plan + tooling pronto para contratação
- ✅ Public launch prep completo (landing + press kit + guidelines)
- ✅ Pricing A/B test infrastructure funcional + 2 variants deployadas
- ✅ Waitlist automation testada com 100 fake signups
- ✅ Beta metrics consolidation doc com 5+ insights acionáveis

### Go/No-Go open beta decision matrix @ Wave 37 close

| Signal | Target | Real (a medir) | Se < target |
|--------|--------|----------------|-------------|
| NPS Day 30 Wave 1+2 | ≥ 40 | — | Hold, iterate onboarding |
| D7 retention Wave 3 (preview) | ≥ 30% | — | Hold, focus on D1 |
| P0 incidents últimos 14d | 0 | — | Hold, fix root cause |
| Load test 100 RPS p99 | < 500ms | — | Hold, optimize |
| Moderação queue SLA | < 24h | — | Hire moderator antes |
| Documentation coverage user-facing | > 80% | — | Hold, finish docs |
| Marketplace escrow dispute rate | < 5% | — | Hold, improve verification |
| Conversion free → paid (A/B) | ≥ 5% | — | Hold, re-think pricing |

**Se 7/8 targets atingidos → open beta Wave 4 (500 users) — GO.**
**Se 5-6/8 → Wave 38 = focused iteration + Wave 4 = 100 users (constrained beta).**
**Se < 5/8 → Wave 38 = re-evaluate strategy (kill switch ou pivot).**

---

## Critical path

```
Wave 35 (4/8 ✅, 2/8 🟡, 2/8 🔴) ──┐
                                     ├──> Wave 36A (close gaps P0) ──> Wave 36B (iterate + Wave 2) ──> Wave 37A (scale prep) ──> Wave 37B (open beta prep + decision)
                              G1+G2  │
                              W35-5  │
                              W35-4  │
```

**Sequência crítica:** Wave 36A (close gaps) é blocker para Wave 36B (Wave 2 invite). Wave 36B é blocker para Wave 37A (Wave 3 só com Wave 2 NPS baseline). Wave 37A é blocker para Wave 37B (open beta decision depende de métricas reais). Wave 37B é blocker para Wave 4 (open beta execution).

**Cada wave tem stop conditions explícitas.** Não acumular débitos técnicos durante o beta — usuário real percebe gaps rapidamente.

---

## Risk register Wave 36-37

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| W36A-1 marketplace escrow race condition | Média | Alto (perda de dinheiro real) | State machine formal + integration tests + chaos testing antes de Wave 2 |
| W36A-2 RAG retrieval irrelevante | Alta | Médio (NPS cai) | Human eval set de 50 perguntas antes de deployar + fallback para resposta sem RAG |
| W36B-1 onboarding fix baseado em feedback enviesado | Média | Médio (fix errado) | Triangular feedback com analytics (D1 completion rate) + falar com ≥ 3 Wave 1 users antes de fixar |
| W36B-4 Wave 2 invite spam | Baixa | Alto (comunidade hostil) | Segmentação geográfica + tradição diversity + cap 10/dia |
| W37A-1 load test revela bottleneck | Média | Alto (open beta fails) | W34 cache + CDN + horizontal scaling antes de load test |
| W37A-3 Wave 3 invite sem moderação | Alta | Alto (community damage) | W37A-4 (moderação hire) paralelo a W37A-3 |
| W37B-2 pricing experiment vaza controle | Baixa | Médio (decisão errada) | A/B sample size ≥ 1000 + 2-week minimum + statistical significance check |
| Owner review lag > 24h | Alta | Médio (atrasa sequência) | Owner reviews assíncrono com ack explícito + escalation path documented |

---

## Métricas de sucesso programa beta (acumulado Wave 35-37)

| Métrica | Wave 1 (10) | Wave 2 (20) | Wave 3 (50) |
|---------|-------------|-------------|-------------|
| Signup → activation D1 | ≥ 80% | ≥ 70% | ≥ 60% |
| D7 retention | ≥ 40% | ≥ 35% | ≥ 30% |
| D30 retention | ≥ 25% | ≥ 20% | TBD |
| NPS Day 7 | ≥ 35 | ≥ 35 | ≥ 35 |
| NPS Day 30 | ≥ 40 | ≥ 40 | ≥ 40 |
| P0 incidents / user-week | < 0.1 | < 0.05 | < 0.03 |
| Moderação queue SLA | < 24h | < 24h | < 12h |
| Feedback submissions/user | ≥ 2 | ≥ 1.5 | ≥ 1 |
| Marketplace escrow dispute rate | < 5% | < 5% | < 3% |
| Akasha chat → marketplace conversion | ≥ 5% | ≥ 5% | ≥ 8% |

**Se métricas Wave 3 ≥ 80% dos targets → open beta Wave 4 (500 users).**
**Se < 60% → re-evaluate strategy em Wave 38.**

---

## Cross-project lesson

**Wave 35 confirma padrão Wave 30 + Wave 33 + Wave 34:** ondas paralelas (8 workers) batem ~50% taxa de entrega efetiva, com recovery-push necessário para fechar.

**Implicação para Wave 36-37:**
- Re-spawn de gaps Wave 35 (W36A) consome 4 dos 9 workers = budget apertado
- Wave 36B é paralelo de verdade (5 workers independentes) = maior chance de recovery-push concorrente
- Wave 37A é P0 (scale prep), Wave 37B é P1 (open beta prep) — quebrar em sub-waves é correto

**Recomendação operacional:** Wave 36 e Wave 37 devem ser quebrados em 2 sub-waves cada (36A close gaps + 36B iterate, 37A scale prep + 37B open beta decision). Recovery-push concorrente em ondas user-facing = risco de rollback com usuários reais.

**Padrão confirmado:** ondas sequenciais com gates explícitos > ondas paralelas sem gates. Wave 36-37 é sequência dependente (cada wave destrava a próxima com métricas reais).

---

## Pré-requisitos owner review (gate de Wave 36)

| ID | Decisão | Recomendação | Bloqueio |
|----|---------|--------------|----------|
| D1 | white-glove vs intensive Wave 1 | ✅ white-glove Wave 1 (já implementado em W35) | Wave 1 invites podem disparar |
| D2 | invite cadence | ✅ 10 wave batch Wave 1, 20 intensive Wave 2 | Convites Wave 1 podem disparar |
| D3 | NPS threshold | ✅ NPS ≥ 30 = gate Wave 2 | Definido em W33, manter |
| D4 | retention curve target | ✅ Wave 36 mede real, Wave 37 decide | Wave 36 → D7 measurement |
| D5 | pricing | 🟡 Wave 37 A/B decide | Não bloqueia Wave 36 |
| D6 | moderação modelo | ✅ auto + human review queue (W36B-5) | Wave 36B-5 implementa |
| D7 | incident SLA | ✅ 1h response / 4h resolve P1 (Wave 37A-2) | Wave 37A-2 implementa |
| D8 | data retention LGPD | ✅ W34-5 LGPD policy aprovada | Done |

**Bloqueios para Wave 36 trigger:**
- D1 + D2 owner approval (assíncrono, ack explícito)
- W36A-1 + W36A-2 + W36A-3 + W36A-4 fecharam gaps Wave 35
- Wave 1 invites enviados + ≥ 5/10 users completaram onboarding (gate mínimo de feedback real)

---

## Próximo passo imediato

1. Owner revisa este plan + WAVE-35-SUMMARY (parcial)
2. Owner decide D1 + D2 → dispara convites Wave 1
3. Wave 36A dispara após Wave 1 invites enviados (4 workers paralelos para fechar gaps)
4. Wave 36B dispara após Wave 36A ✅ + NPS Day 7 Wave 1 medido
5. Wave 37A dispara após Wave 36B ✅ + Wave 2 NPS Day 14 baseline
6. Wave 37B dispara após Wave 37A ✅ + métricas Wave 3 preview
7. Wave 38+ = open beta execution baseado em decision matrix Wave 37 close

**Stop:** este doc + commit. Aguarda Wave 1 invite dispatch + Wave 36A trigger.