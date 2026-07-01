# Wave 35-37 Plan — Beta Launch Execution

> Plano tático para 3 ondas seguintes (35-37). Cada onda = batch de 4-6 workers paralelos. Decisões macro derivam de Wave 34 (hardening infra) + Wave 33 (feedback loop) + estratégia beta launch v2 (W32).

## Contexto

**Estado @ Wave 34 close:**

- main @ `8f81350b`
- TSC = 0, build OK
- Beta invite system implementado (W32)
- Stripe Connect marketplace pronto (W30)
- Akasha IA com citations + quality (W32)
- OpenAPI 3.0 spec (W33)
- i18n ES 60% (W33)
- Feedback loop + NPS (W33)
- Monitoring infra (W33)
- **Disaster Recovery + 7 cron jobs (W34)** ✨ NOVO
- **Seed database production-ready: 50 users + 100 posts + 50 articles + 48 offerings (W34)** ✨
- **SEO + Blog content layer (W34)** ✨
- **A11y final WCAG 2.2 AA (W34)** ✨
- **Security hardening (rate-limit v2, NIST password, session lockout, CSP/HSTS) (W34)** ✨
- **Analytics product (cohorts/funnels/insights) (W34)** ✨

**Gaps para beta launch (decisões D1-D8):**

| ID | Decisão | Status | Wave destino |
|----|---------|--------|--------------|
| D1 | white-glove vs intensive onboarding | 🟡 PENDENTE — owner review | W35 trigger |
| D2 | 3 curadores convidados | 🟡 PENDENTE — owner review | W35 trigger |
| D3 | NPS threshold (gate de scale-up) | 🟡 usar NPS ≥ 30 baseline (W34 funnels prontos para medir) | W35-2 |
| D4 | retention curve target (D7 ≥ 30%?) | 🟡 Wave 36 valida com dados reais | W36 |
| D5 | pricing free-beta vs freemium vs trial | 🟡 PENDENTE — converte em W37 | W37 |
| D6 | moderação modelo (auto vs human vs hybrid) | 🟡 baseline = auto + human queue | W36-5 |
| D7 | incident response SLA | 🟢 **PUBLICADO em W34** (DISASTER-RECOVERY-W34.md) | ✅ done |
| D8 | data retention LGPD policy | 🟢 **COBERTO em W34** (DR runbook §18) | ✅ done |

**Decisões pré-feitas (de W32 strategy + W30 lessons + W34 hardening):**

- Wave 1 = 10 users white-glove (D1 white-glove branch — recomendado)
- Wave 2 = 20 users intensive (D1 intensive branch)
- Wave 3 = 50 users hybrid
- Wave 4+ = open beta decision based on Wave 1-3 signals

---

## Wave 35 — Beta Launch Wave 1 (10 users white-glove)

**Tema:** destravar D1 + D2 + convidar primeiros 10 usuários com track dedicado.

**Pré-requisito:** Wave 34 ✅ (especialmente disaster recovery + security hardening + analytics + a11y final).

**Trigger:** owner approval Wave 34 + D1 decision = white-glove + D2 = 3 curadores convidados.

**Decisões macro:**

- **D1 = white-glove:** 1:1 onboarding call (30min) + WhatsApp dedicado + early access a features + ask explícito de feedback Day 1/3/7
- **D2 = 3 curadores convidados:** curadores ativos na comunidade (1 Candomblé + 1 Umbanda + 1 Ifá/Cabala) para review de conteúdo + moderação de tradição
- **D3 = NPS ≥ 30:** gate de Wave 2; se < 30, re-onboarding antes de expandir
- **D5 = free-beta:** sem cobrança durante beta (até Wave 4 open beta)

**Sub-wave 35A (4 workers, fluxo de invite):**

| # | Trilha | Tipo | Output esperado |
|---|--------|------|-----------------|
| W35-1 | Invite Wave 1 (10 users) | Ops | `scripts/invite-wave-1.ts` + email templates + cron schedule + dashboard Wave 1 |
| W35-2 | NPS Day-1 prompts scheduling | Coder | `nps-prompt` cron endpoint (já existe W34-2) + schedule for Wave 1 users + idempotência |
| W35-3 | White-glove onboarding script | Designer | `docs/ONBOARDING-WHITE-GLOVE-SCRIPT.md` (30min call roteiro) + checklist |
| W35-4 | Feedback Slack/Discord channel setup | Ops | canal #beta-wave-1 + bot para triagem + integration com `/api/feedback` (W33-7) |

**Sub-wave 35B (2 workers, curadoria + monitoring):**

| # | Trilha | Tipo | Output esperado |
|---|--------|------|-----------------|
| W35-5 | Curadores convidados onboarding | Designer + Coder | `docs/CURADORES-ONBOARDING.md` + role definitions + review queue UI + permissões |
| W35-6 | Wave 1 metrics dashboard | Coder | Grafana dashboard específico para 10 users (funnel W34-7, retention, NPS, bugs) |

**Dependências:**

- W35-1 → W35-3 (não dá pra chamar users sem script)
- W35-2 → W35-1 (prompts NPS precisam estar prontos antes do invite)
- W35-5 → W35-1 (curadores precisam estar onboarded antes de convidar Wave 1)
- W35-6 → W35-1 (dashboard precisa de IDs reais para filtrar)

**Acceptance Wave 35:**

- ✅ 10 convites enviados (1 falhou = 9 ainda OK, reporta no summary)
- ✅ NPS Day 1 prompt entregue para cada user em < 24h após signup
- ✅ Canal #beta-wave-1 ativo + triagem bot respondendo
- ✅ White-glove script testado com 1 user fake (pode ser owner)
- ✅ 3 curadores onboarded com permissões ativas
- ✅ Dashboard Wave 1 visível para owner com funnel real-time (via W34-7 analytics)

**Stop conditions:**

- Se qualquer user reportar blocking bug → fix antes de continuar Wave 1
- Se NPS Day 1 < 5 para > 2 users → pausa Wave 1, itera onboarding
- Se curador reporta issue cultural sério (ex.: uso inapropriado de termo) → fix imediato + rever material

---

## Wave 36 — Iteration + Wave 2 (20 users intensive)

**Tema:** aplicar feedback Wave 1 + escalar para 20 users com track intensive.

**Trigger:** Wave 35 ✅ + NPS Day 7 ≥ 30 (gate) + 3 curadores ativos.

**Decisões macro:**

- **D1 switch:** Wave 2 = intensive (não 1:1, mas onboarding estruturado + grupo WhatsApp + Office Hours semanais)
- **D4 validate:** D7 retention target medido de verdade com Wave 1 (via W34-7 cohorts)
- **D6 baseline:** moderação auto (AI flags) + human review queue para casos > 0.7 confidence

**Workers paralelos (5):**

| # | Trilha | Tipo | Output esperado |
|---|--------|------|-----------------|
| W36-1 | Onboarding fixes Wave 1 feedback | Designer | 3-5 melhorias de onboarding baseado em feedback real (não palpite) |
| W36-2 | Documentation updates | Tech Writer | `docs/USER-GUIDE.md` + FAQ expandido com perguntas reais Wave 1 |
| W36-3 | Monitoring dashboards Wave 2 | DevOps | Dashboard Grafana com cohort Wave 1 vs Wave 2 (W34-7 cohorts) |
| W36-4 | Invite Wave 2 (20 users) | Ops | `scripts/invite-wave-2.ts` + intensive track (sem 1:1 call) |
| W36-5 | Moderação queue + human review | Coder | `/admin/moderation/queue` + SLA tracking + escalation rules |

**Dependências:**

- W36-2 → W36-4 (FAQ precisa estar atualizado antes de convidar Wave 2)
- W36-1 → W36-4 (onboarding fixes precisam estar deployadas)
- W36-5 → W36-4 (moderação tem que estar pronta para volume maior)

**Acceptance Wave 36:**

- ✅ Pelo menos 3 melhorias de onboarding deployadas com medição antes/depois (via W34-7 funnels)
- ✅ Docs atualizados com 5+ perguntas reais dos Wave 1 users
- ✅ 20 convites Wave 2 enviados
- ✅ Moderação queue testada com casos fake + SLA < 24h
- ✅ Cohort comparison Wave 1 vs Wave 2 visível no dashboard

**Stop conditions:**

- Se D7 retention Wave 1 < 25% → pausa Wave 2, foco em retention
- Se bug crítico aparece em Wave 1 → freeze Wave 2 até fix
- Se moderação queue SLA quebra (> 24h em > 5 casos) → hire human moderator antes de Wave 3

---

## Wave 37 — Wave 3 + Open Beta Decision

**Tema:** escalar para 50 users (Wave 3) + decidir se vai para open beta.

**Trigger:** Wave 36 ✅ + NPS Day 14 Wave 1 ≥ 35 + D7 retention Wave 2 ≥ 30%.

**Decisões macro (D-final):**

- **D5 decision:** free-beta → freemium ou paid? Baseado em conversion data Wave 1+2 (via W34-7 funnels MONETIZATION)
- **D7 final:** incident response SLA já publicado em W34-1 (1h response, 4h resolve P1)
- **Open beta gate:** NPS Day 30 Wave 1+2 ≥ 40 + 0 P0 incidents in 14d + load test passa

**Workers paralelos (6):**

| # | Trilha | Tipo | Output esperado |
|---|--------|------|-----------------|
| W37-1 | Performance audit under load | Coder | `docs/PERFORMANCE-AUDIT-W37.md` com k6 load test 100 RPS + p99 latency < 500ms target |
| W37-2 | Public launch preparation | Designer | landing page update + press kit + community guidelines público |
| W37-3 | Pricing experiment setup | Coder + PM | A/B test infrastructure + pricing page variants + tracking |
| W37-4 | Open beta waitlist automation | Ops | waitlist → invite automático quando vaga abre + capacity-based scaling |
| W37-5 | DR drill execution | DevOps | Primeira execução real do `scripts/backup/disaster-recovery-drill.sh` + report de timing |
| W37-6 | Wave 37 summary + Wave 38+ plan | Coordinator | este doc equivalente para Wave 38+ (open beta + iteration) |

**Dependências:**

- W37-1 → W37-4 (load test precisa validar que aguenta open beta)
- W37-5 → W37-4 (incident response precisa estar drill-validado antes de auto-invite)
- W37-3 → W37-2 (pricing variant precisa existir antes do launch page)

**Acceptance Wave 37:**

- ✅ Load test passa 100 RPS sustained p99 < 500ms
- ✅ Public launch prep completo (landing + press kit + guidelines)
- ✅ Pricing A/B test infrastructure funcional
- ✅ Waitlist automation testada com 100 fake signups
- ✅ DR drill executado + report publicado com MTTR real
- ✅ Wave 38+ plan draft (open beta execution)

**Go/No-Go open beta decision matrix @ Wave 37 close:**

| Signal | Target | Se < target |
|--------|--------|-------------|
| NPS Day 30 Wave 1+2 | ≥ 40 | Hold, iterate onboarding |
| D7 retention Wave 3 (preview) | ≥ 30% | Hold, focus on D1 |
| P0 incidents últimos 14d | 0 | Hold, fix root cause |
| Load test 100 RPS p99 | < 500ms | Hold, optimize (cache/CDN) |
| DR drill MTTR real | ≤ 45min | Hold, optimize restore script |
| Moderação queue SLA | < 24h | Hire moderator antes |
| Documentation coverage user-facing | > 80% | Hold, finish docs |

**Se 6/7 targets atingidos → open beta Wave 4 (500 users).**
**Se < 5/7 → Wave 38 = focused iteration + re-evaluate.**

---

## Critical path

```
Wave 34 (hardening infra) ──┐
                             ├──> Wave 35 (Wave 1: 10 white-glove + 3 curadores) ──> Wave 36 (Wave 2: 20 intensive + moderação) ──> Wave 37 (Wave 3: 50 hybrid + open beta decision + DR drill)
                  D7 SLA       │
                  D8 LGPD      │
                  analytics    │
```

**Sequência crítica:** W34 (DR + security + analytics) é blocker para Wave 35. Wave 35 é blocker para Wave 36 (D7 retention data + curador feedback). Wave 36 é blocker para Wave 37 (D7 data + NPS baseline + moderação volume). Wave 37 é blocker para open beta (Wave 38+).

**Cada wave tem stop conditions explícitas.** Não acumular débitos técnicos durante o beta — usuário real percebe.

---

## Risk register Wave 35-37

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| W35 user reporta blocking bug crítico | Média | Alto (perda de user Day 1) | On-call rotation + hotfix SLA < 4h |
| W35 NPS Day 1 prompt falha | Baixa | Médio (perde sinal) | Idempotência + manual fallback no owner |
| W36 moderação SLA quebra | Média | Alto (community damage) | Curadores Wave 35 + hire human moderator antes de Wave 3 |
| W37 load test revela bottleneck | Média | Alto (open beta fails) | W34 cache + CDN + early load test em W36 |
| W37 DR drill falha restore real | Baixa | Alto (beta launch blocker) | Drill em staging primeiro + tabletop exercise |
| Owner review lag > 24h | Alta | Médio (atrasa sequência) | Owner reviews assíncrono com ack explícito |
| Curador convidado indisponível | Baixa | Médio (moderação gap) | Backup curador na Wave 35 + escalação clara |

---

## Métricas de sucesso programa beta (acumulado Wave 35-37)

| Métrica | Wave 1 (10) | Wave 2 (20) | Wave 3 (50) |
|---------|-------------|-------------|-------------|
| Signup → activation D1 | ≥ 80% | ≥ 70% | ≥ 60% |
| D7 retention | ≥ 40% | ≥ 35% | ≥ 30% |
| D30 retention | ≥ 25% | ≥ 20% | TBD |
| NPS Day 7 | ≥ 35 | ≥ 35 | ≥ 35 |
| P0 incidents / user-week | < 0.1 | < 0.05 | < 0.03 |
| Moderação queue SLA | < 24h | < 24h | < 12h |
| Feedback submissions/user | ≥ 2 | ≥ 1.5 | ≥ 1 |
| Curador review turnaround | < 48h | < 48h | < 24h |

**Se métricas Wave 3 ≥ 80% dos targets → open beta Wave 4.**
**Se < 60% → re-evaluate strategy em Wave 38.**

---

## Cross-project lesson

Padrão confirmado: **ondas sequenciais com gates explícitos > ondas paralelas sem gates**. Wave 34-37 é sequência dependente (cada wave destrava a próxima). Wave 34 entregou 100% dos deliverables (7/7) — provavelmente por ser infra isolada (cada trilha tem scope próprio, sem dependência cross-worker).

**Diferencial Wave 34:**
- W34-1 (DR) + W34-2 (cron) + W34-6 (security) = infraestrutura operacional sem overlap
- W34-3 (seed) + W34-4 (SEO) + W34-5 (a11y) + W34-7 (analytics) = conteúdo + qualidade sem dependência
- Resultado: **8 workers paralelos com 0 conflito = taxa 100%** (vs Wave 30 87.5% / Wave 33 87.5%)

**Recomendação operacional:** quando uma onda tem trilhas independentes (sem dependência cross-worker), pode paralelizar 8+ workers com risco mínimo. Quando uma onda é user-facing (Wave 35-37), quebrar em 2 sub-waves (35A + 35B) para isolar owner-dependent decisions.

---

## Próximo passo imediato

1. Owner revisa este plan + W34 SUMMARY
2. Owner decide D1 (white-glove vs intensive) — recomendação = **white-glove Wave 1 + intensive Wave 2**
3. Owner decide D2 (3 curadores convidados) — recomendação = **1 Candomblé + 1 Umbanda + 1 Ifá/Cabala**
4. Wave 35 dispara após approval
5. Wave 35 → 36 → 37 sequencial

**Stop:** este doc + commit. Aguarda owner review.