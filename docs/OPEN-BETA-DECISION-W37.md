# 🚦 Open Beta Decision Framework — Wave 37

> **Decision dashboard + go/no-go algorithm + risk register + action items + decision timeline + post-launch playbook.**
> Wave 37 · Open Beta Decision 2/8 · Owner: Founder (Gabriel) + PM (Tomás) + QA (Ravena) · Date: 2026-07-01

---

## Sumário

1. [Propósito](#1-propósito)
2. [18 KPIs — categorias + targets](#2-18-kpis--categorias--targets)
3. [Go / No-Go algorithm](#3-go--no-go-algorithm)
4. [Risk register (R1–R8)](#4-risk-register-r1r8)
5. [Pre-launch action items (12 itens)](#5-pre-launch-action-items-12-itens)
6. [Decision timeline (D-7 → D+30)](#6-decision-timeline-d-7--d30)
7. [Post-launch monitoring playbook](#7-post-launch-monitoring-playbook)
8. [LGPD compliance](#8-lgpd-compliance)
9. [Benchmarks externos](#9-benchmarks-externos)
10. [Cross-project lessons (reusable)](#10-cross-project-lessons-reusable)
11. [Limitações & honestidade](#11-limitações--honestidade)
12. [Anexos e referências](#12-anexos-e-referências)

---

## 1. Propósito

> **Wave 37 fecha Wave 1+2+3 e abre decisão para Wave 4 (open beta 500 users).** Esta framework é o **sistema operacional** que produz a decisão de forma transparente, deterministicamente repetível, e auditável por Founder + Advisor group.

**Origem dos números:**

- `BETA-LAUNCH-STRATEGY-W32.md` §4 (KPIs W32-8 strategic plan) + §6 (risk matrix) + §7 (contingency) + §10 (decisions pendentes)
- `WAVE-37-OPEN-BETA-DECISION.md` (8-signal matrix W37) — esta framework **estende** com 18 KPIs (não substitui os 8)
- `PostHog` + `Sentry` + `Stripe` + moderation queue logs (fontes canônicas dos actuals)

**Compromissos da framework:**

- ✅ **Determinismo:** `computeGoNoGoReport()` é função pura — mesmos inputs ⇒ mesmos outputs.
- ✅ **Audit-trail:** cada avaliação inclui `ratio` + `score` + `rationale` (texto human-readable).
- ✅ **Pure-function tests:** calculator é testável em isolado sem DB.
- ✅ **P0 gating:** 9 health metrics são P0 — qualquer RED >= 3 marca NO-GO.
- ✅ **LGPD safe:** nenhum PII no dashboard; apenas roles + números.

**3 sites de execução:**

| Site | Audience | LGPD gate |
|---|---|---|
| `/admin/decisions/open-beta` | Founder + PM + QA internal | Server-side requireAdmin |
| `/admin/decisions/open-beta/action-items` | PM + Designer + Security | Server-side requireAdmin |
| `docs/OPEN-BETA-DECISION-W37.md` | Public (post-launch) | None (no PII) |

---

## 2. 18 KPIs — categorias + targets

> **3 categorias** (Retention · Engagement · Health) sumarizam validação de hipóteses W32-8 + risco operacional.
> **P0 flags** = bloqueia GO se RED. Apenas Health tem P0.

### 2.1 Cohort A — Retention (3 KPIs, total weight 0.15)

| # | KPI | Target | Direction | Source |
|---|---|---|---|---|
| **A1** | **D1 retention** | ≥ 50% | higher | PostHog `signup` → `active_next_day` |
| **A2** | **D7 retention** | ≥ 35% | higher | PostHog cohort matrix |
| **A3** | **D30 retention** | ≥ 25% | higher | PostHog cohort matrix |

### 2.2 Cohort B — Engagement (6 KPIs, total weight 0.36)

| # | KPI | Target | Direction | Source |
|---|---|---|---|---|
| **B1** | **DAU/MAU** | ≥ 30% | higher | PostHog `daily_active` / `monthly_active` |
| **B2** | **Avg session time** | ≥ 10 min | higher | PostHog `session_duration` |
| **B3** | **Posts / user / week** | ≥ 2 | higher | PostHog `post_created` |
| **B4** | **Akasha convos / user / month** | ≥ 5 | higher | PostHog `akasha_message_sent` |
| **B5** | **NPS** | ≥ 40 | higher | Survey engine |
| **B6** | **Feature adoption rate** | ≥ 60% | higher | PostHog `feature_used` (distinct ≥ 3) |

### 2.3 Cohort C — Health (9 KPIs, total weight 0.495 — ALL P0)

| # | KPI | Target | Direction | Source |
|---|---|---|---|---|
| **C1** | **Crash-free rate** | ≥ 99% | higher | Sentry `sessions.crash_free` |
| **C2** | **API p95 latency** | ≤ 2s | lower | PostHog `api_request_duration` |
| **C3** | **LCP p95** | ≤ 3s | lower | Web Vitals `web_vital_lcp` |
| **C4** | **CLS p95** | ≤ 0.15 | lower | Web Vitals `web_vital_cls` |
| **C5** | **INP p95** | ≤ 250ms | lower | Web Vitals `web_vital_inp` |
| **C6** | **Auth success rate** | ≥ 97% | higher | Auth metrics |
| **C7** | **Payment success rate** | ≥ 95% | higher | Stripe + escrow logs |
| **C8** | **Akasha refusal precision** | ≥ 85% | higher | Akasha audit log (manual weekly) |
| **C9** | **Moderation queue SLA** | ≥ 90% | higher | Moderation queue log |

### 2.4 Visual traffic-light por KPI

```
GREEN  = actual ≥ target                 → score = 1.0
YELLOW = actual ∈ [80%, 100%) of target  → score = 0.7
RED    = actual < 80% of target          → score = 0.0
```

**Calibração reversa (direction="lower"):** GREEN se `target / actual >= 1.0`, YELLOW se em [0.8, 1.0), RED se < 0.8.

### 2.5 Weighted score = Σ(weight × score) / Σ(weight)

> **Thresholds:**
> - **score ≥ 0.85 AND p0 reds === 0** → `GO`
> - **score < 0.70 OR p0 reds >= 3** → `NO-GO`
> - Otherwise → `CONDITIONAL` (Wave 4 = 100 users focused iteration)

---

## 3. Go / No-Go algorithm

> **Pure function** em `src/lib/decisions/go-no-go-calculator.ts`. Determinística.

### 3.1 Pseudocódigo

```typescript
function evaluateKpi(kpi: KpiDefinition, actual: number): KpiEvaluation {
  ratio = (kpi.direction === "higher")
    ? actual / kpi.target
    : (kpi.direction === "lower")
      ? kpi.target / actual
      : bandRatio(kpi, actual);

  light = (ratio >= 1.0) ? "green" : (ratio >= 0.8) ? "yellow" : "red";
  score = (light === "green") ? 1.0 : (light === "yellow") ? 0.7 : 0.0;

  return { kpi, actual, ratio, light, score, weightedContribution: weight × score };
}

function computeDecision(evaluations: KpiEvaluation[]): Decision {
  weightedScore = Σ(eval.weightedContribution) / Σ(eval.kpi.weight);
  p0RedCount = evaluations.filter(e => e.light === "red" && e.kpi.p0).length;

  if (weightedScore >= 0.85 && p0RedCount === 0) return "GO";
  if (weightedScore < 0.70 || p0RedCount >= 3) return "NO-GO";
  return "CONDITIONAL";
}
```

### 3.2 3 outcomes + capacity Wave 4

| Decision | Capacity Wave 4 | Recommended action |
|---|---|---|
| **GO** | 500 users | Disparar Wave 4 open beta imediatamente. Pre-launch comms + waitlist automation. |
| **CONDITIONAL** | 100 users focused | Wave 4 = 100 users com fokus na mitigation dos P0 reds + daily reviews nos primeiros 14d. |
| **NO-GO** | 0 (Wave 3 extension) | HOLD Wave 4 open beta. Owner decide entre iterate por mais 30d ou pivotar (kill switch). |

### 3.3 SAMPLE_ACTUALS_W37 (placeholder demo mode)

| KPI | Actual | Light | Score | Weighted |
|---|---|---|---|---|
| A1 D1 retention | 55% | green | 1.0 | 0.050 |
| A2 D7 retention | 38% | green | 1.0 | 0.050 |
| A3 D30 retention | 27% | green | 1.0 | 0.050 |
| B1 DAU/MAU | 32% | green | 1.0 | 0.060 |
| B2 Avg session | 12 min | green | 1.0 | 0.060 |
| B3 Posts/week | 2.4 | green | 1.0 | 0.060 |
| B4 Akasha convos | 6 | green | 1.0 | 0.060 |
| B5 NPS | 45 | green | 1.0 | 0.060 |
| B6 Feature adoption | 65% | green | 1.0 | 0.060 |
| C1 Crash-free | 99.4% | green | 1.0 | 0.055 |
| C2 API p95 | 1.8s | green | 1.0 | 0.055 |
| C3 LCP p95 | 2.7s | green | 1.0 | 0.055 |
| C4 CLS p95 | 0.12 | green | 1.0 | 0.055 |
| C5 INP p95 | 220ms | green | 1.0 | 0.055 |
| C6 Auth success | 98% | green | 1.0 | 0.055 |
| C7 Payment success | 96% | green | 1.0 | 0.055 |
| C8 Akasha refusal | 87% | green | 1.0 | 0.055 |
| C9 Mod SLA | 92% | green | 1.0 | 0.055 |

**Sample result:** weighted score = 1.000, p0 reds = 0 → **GO**.

> **Production actuals**: o collector real substitui `SAMPLE_ACTUALS_W37` em `/admin/decisions/open-beta/page.tsx` no T-3 com leitura de PostHog/Sentry/Stripe/moderation logs. Ver `WAVE-37-OPEN-BETA-DECISION.md` §"Wave 37B-4 metrics consolidation".

---

## 4. Risk register (R1–R8)

> Atualizado de `BETA-LAUNCH-STRATEGY-W32.md §6` para status @ Wave 37 close.

### 4.1 Resumo executivo

| Status | Count |
|---|---|
| Mitigated | 0 |
| Monitoring | 6 (R1, R3, R5, R6, R7, R8) |
| Active | 2 (R2, R4) |
| Total | 8 |

> **Caveat:** alguns risks têm mitigations `done` AND `status === "monitoring"` porque a infraestrutura existe mas a janela de risco está aberta (e.g. toxicidade sempre possível enquanto há comunidade ativa). Eles são `monitoring`, não `mitigated`.

### 4.2 Tabela detalhada

| ID | Título | Prob | Impact | Status | Owner | Mitigation summary |
|---|---|---|---|---|---|---|
| **R1** | Poucos users ativos (DAU/MAU baixo) | Med | Very-High | monitoring | PM (Tomás) | Seed 30-50 posts + Office hours + DM manual quiet users + Weekly challenge |
| **R2** | Comunidade tóxica (fundamentalismo, proselitismo) | Low | Very-High | **active** | PM + Mod | Mod cultural-aware + Regras onboarding + IA detect + Código conduta |
| **R3** | Dominância de uma tradição | Med | High | monitoring | PM + IA | Quota seed + Spotlight sub-representadas + IA cross-ref + Tradição do mês |
| **R4** | PM burnout (single point of failure) | High | Very-High | **active** | Founder | Cap white-glove + 3 curadores + Async > Sync + Plano backup R4 (BLOCKED) |
| **R5** | Akasha IA dá resposta inadequada | Med | Very-High | monitoring | PM + Coder | Hard rules VISION §9 + Persona limites + Audit 100 responses + Log review |
| **R6** | Performance lenta no mobile | Med | Medium | monitoring | Coder + QA | Lazy load + Code split + IA streaming + Lighthouse audit + Load test 100 RPS |
| **R7** | User em crise espiritual/mental aguda | Low | Very-High | monitoring | PM + Mod | Disclaimer onboarding + IA → CVV 188 + 988 + Runbook `/runbooks/crisis.md` |
| **R8** | Vazamento da beta | Low | Medium | monitoring | PM + Mod | ToS não-compartilhamento + Ban imediato + Marca d'água (parcial) |

### 4.3 Auto-flag predicates

> **Função:** `evaluateRiskAutoFlags()` retorna a lista de risks `active` para revisão manual pelo PM antes do D-3.

```text
R1: engagement-dau-mau < 25 OR post_count / active_users_7d < 1.5
R2: health-moderation-sla < 80 OR toxicity_reports/user/week > 0.3
R3: cross_tradition_engagement < 0.3 OR top_tradition_share > 0.6
R4: pm_hours_per_week > 60 OR pm_burnout_score >= 4
R5: health-akasha-refusal-precision < 80 OR citation_rate < 60
R6: health-lcp-p95 > 4 OR health-cls-p95 > 0.25 OR health-inp-p95 > 500
R7: crisis_flag_ia_count > 0 OR moderation_queue_crisis_tag > 0
R8: leak_report_count > 1
```

### 4.4 Risk coverage cruzando com 18 KPIs

> Cross-reference explícito: cada risk tem 1+ KPI que serve de detector canônico.

| Risk | Primary KPIs | Threshold failure |
|---|---|---|
| R1 (DAU/MAU) | engagement-dau-mau, engagement-posts-per-week | < 25% sustained 7d OR < 1.5 posts |
| R2 (Toxidade) | health-moderation-sla, custom toxicity logs | < 80% SLA OR > 0.3/user/week |
| R3 (Cross-trad) | engagement-feature-adoption, custom cross-trad logs | < 30% cross-trad |
| R4 (PM burn) | custom PM hours tracker | > 60h/week OR burnout ≥ 4 |
| R5 (Akasha IA) | health-akasha-refusal-precision | < 85% |
| R6 (Perf) | health-lcp-p95, health-cls-p95, health-inp-p95 | p95 > respective target |
| R7 (Crise) | moderation queue + IA crisis flag | qualitative |
| R8 (Vazamento) | custom leak tracker | > 1 report |

---

## 5. Pre-launch action items (12 itens)

> Checklist canônico em `/admin/decisions/open-beta/action-items/page.tsx`. Owner review gate = **hard** bloqueia GO se != DONE no D-3.

### 5.1 6 categorias + completion atual

| Categoria | Itens | Done | In Progress | Planned | Hard gates open |
|---|---|---|---|---|---|
| Marketing assets | 3 | 1 | 2 | 0 | 1 |
| Legal docs (LGPD) | 2 | 1 | 1 | 0 | 1 |
| Support infrastructure | 2 | 0 | 1 | 1 | 2 |
| Monitoring + alerting | 2 | 0 | 1 | 1 | 1 |
| Documentation | 2 | 0 | 2 | 0 | 2 |
| Billing infrastructure | 1 | 0 | 1 | 0 | 1 |
| **Total** | **12** | **2** | **8** | **2** | **8** |

> **Interpretação:** ao Wave 37 close, **8 hard gates ainda abertos**. **Não dispara GO sem fechar pelo menos 6/8** no D-3 review.

### 5.2 Itens individuais (snapshot @ 2026-07-01)

| ID | Label | Owner | Due | Status | Gate |
|---|---|---|---|---|---|
| MKT-1 | Press kit published | PM | D-7 | DONE | soft |
| MKT-2 | Pre-launch email scheduled | PM | D-1 | in-progress | soft |
| MKT-3 | Landing page Wave 4 ready | Designer + PM | D-3 | in-progress | **hard** |
| LG-1 | LGPD ToS + privacy policy | Security | D-7 | DONE | **hard** |
| LG-2 | Sign-up consent + data flow doc | Security + Coder | D-7 | in-progress | **hard** |
| SUP-1 | First human moderator hired + trained | Founder + PM | D-3 | in-progress | **hard** |
| SUP-2 | Crisis runbook published | PM | D-7 | planned | **hard** |
| MON-1 | On-call rotation live (W37A-2) | DevOps + Founder | D-3 | in-progress | **hard** |
| MON-2 | Status page configured | DevOps | D-3 | planned | soft |
| DOC-1 | User-facing docs coverage > 80% | PM + Designer | D-3 | in-progress | **hard** |
| DOC-2 | Community guidelines published | PM + Mod | D-3 | planned | **hard** |
| BIL-1 | Stripe + escrow tested end-to-end | Coder + QA | D-7 | in-progress | **hard** |

> **Pattern:** itens "in-progress" devem virar DONE no D-3 (slot de 4 dias). Itens "planned" viraram IN-PROGRESS ou DONE no mesmo slot — `planned` é anti-pattern se nada foi iniciado.

### 5.3 Customer support staff trained

> Especificamente: treinamento do primeiro human moderator (SUP-1) inclui (a) cultural-awareness de 4 tradições, (b) protocolo CVV 188/988 (R7), (c) bansem-segunda-chance (R2), (d) SLA 24h P1 / 12h P2. Sem treinamento completo + ridding shadow PM por 2 semanas, SUP-1 não é DONE.

---

## 6. Decision timeline (D-7 → D+30)

> 7 milestones canônicos em `src/lib/decisions/decision-timeline.ts`.

### 6.1 Visão geral

```
D-7 ─── D-3 ─── D-1 ─── D-0 ─────── D+1 ─────── D+7 ─────── D+30
review    go/no-go  announce    launch 🚀   24h check   W+1 review   M+1 review
(soft)    (HARD)    (soft)                (soft)      (soft)       (HARD)
```

### 6.2 Tabela detalhada

| Offset | Title | Owner | Deliverable | Gate | Failure consequence |
|---|---|---|---|---|---|
| **D-7** | Cross-functional review | PM | Minutes + slide deck | soft | Bias de PM se não rolar |
| **D-3** | Final go/no-go decision | Founder | `docs/DECISION-LOG-W37.md` + ack | **HARD** | HOLD Wave 4 sem owner approval |
| **D-1** | Pre-launch announcement | PM + Coder | Email enviada + status page green | soft | D+1 CAC orgânico = 0 |
| **D-0** | LAUNCH Wave 4 | PM + Coder + DevOps | Post público + 100-500 signups | none | Rollback plan ativa se P0 incident |
| **D+1** | First metric review (24h) | PM | D+1 snapshot report | soft | Trigger contingency W32-8 §7 |
| **D+7** | First weekly review | PM + QA | `docs/WEEK-1-REVIEW.md` | soft | Drift acumula sem review |
| **D+30** | First monthly strategic review | Founder + PM + Coder | `docs/MONTH-1-STRATEGIC-REVIEW.md` + OKR Wave 5 | **HARD** | Wave 5 sem estratégia |

### 6.3 Hard gates (2)

1. **D-3**: `computeGoNoGoReport().decision ∈ {GO, CONDITIONAL}` + Founder ack explícito em `decision-log.md`.
2. **D+30**: Strategic review entregue + decisão Wave 5 (continue / iterate / pivot / kill).

---

## 7. Post-launch monitoring playbook

> 3 cadences (hourly · daily · weekly) + rollback plan em `src/lib/decisions/post-launch-playbook.ts`.

### 7.1 First 24h — hourly checkpoints (24 total)

| Checkpoint | Owner | Severity |
|---|---|---|
| H+0 (D-0 launch) | PM | **critical** |
| H+12 (mid-day snapshot) | On-call | **critical** |
| H+23 (24h close-out) | PM | **critical** |
| H+1..H+11, H+13..H+22 | On-call | warning |

**Rollback triggers (4):**

- RT-H1: P0 incident nos primeiros 60min (crash > 1%, auth down)
- RT-H2: API latency p95 > 5s sustained 10min
- RT-H3: Akasha IA error rate > 5%
- RT-H4: Status page red + 3+ user-facing errors

### 7.2 First week — daily reviews (7 total)

| Day | Owner | Severity |
|---|---|---|
| D+1 full review | PM | **critical** |
| D+2 activation funnel | PM | warning |
| D+3 D1 retention experimental | PM + Coder | warning |
| D+4 moderação SLA | Mod | warning |
| D+5 engagement | PM | warning |
| D+6 conversion | Coder + PM | warning |
| D+7 weekly review | PM + QA | **critical** |

**Rollback triggers (4):**

- RT-D1: D1 retention < 30% sustained
- RT-D2: Cross-tradition engagement < 25% / 7d
- RT-D3: Moderação queue backlog > 48h
- RT-D4: Akasha citation rate < 60%

### 7.3 First month — weekly reviews (4)

| Week | Owner | Severity |
|---|---|---|
| W+2 (D+14) | PM + QA | warning |
| W+3 (D+21) | Coder + PM | warning |
| W+4 (D+28) | PM + Founder | warning |
| D+30 strategic | Founder + PM | **critical** |

**Rollback triggers (3):**

- RT-W1: D7 retention < 25% sustained 14d
- RT-W2: NPS < 30 sustained 14d
- RT-W3: Churn > 10%/week sustained 2 weeks

### 7.4 Rollback plan (6 steps)

| Order | Action | Owner | Minutes |
|---|---|---|---|
| 1 | Snapshot estado pré-rollback | Coder on-call | 10 |
| 2 | Disable Wave 4 invites (feature flag) | Coder on-call | 5 |
| 3 | Status page amber + incident open | PM | 15 |
| 4 | Email transparente para users ativos | PM | 30 |
| 5 | Post-mortem completo (root cause) | PM + Coder | 240 |
| 6 | Decisão re-launch ou kill switch | Founder | 90 |

**Total: 6.5h** para rollback completo + post-mortem interim.

---

## 8. LGPD compliance

> Seção §7.5 do W32-8 + W27 audit trail. **Decisão Wave 4 não pode rolar sem compliance gate.**

### 8.1 Art. 7 — Consentimento

> LGPD Art. 7, I: "tratamento de dados pessoais somente poderá ocorrer nas seguintes hipóteses: mediante consentimento do titular."

**Implementação:**

- ✅ Onboarding checkpoint explícito (UI) — não é pre-ticado.
- ✅ Consent text em PT-BR simples (sem juridiquês).
- ✅ Audit log do consent timestamp + IP (Art. 37).
- ✅ Withdrawal 1-click em `/settings/privacy` → erasure flow.

### 8.2 Art. 18 — Direitos do titular

> LGPD Art. 18 dá 9 direitos (acesso, correção, anonimização, portabilidade, eliminação, etc.).

**Implementação:**

- ✅ /settings/privacy exporta JSON completo (Art. 18, V).
- ✅ Erasure flow (LGPD-compliant) com retenção legal do mínimo necessário (Art. 16).
- ✅ Resposta em ≤ 15 dias (prazo LGPD).
- ℹ️ Direito de revogação de consentimento (Art. 18, IX) via /settings/privacy.

### 8.3 Art. 37 — Registro de operações

> LGPD Art. 37: "O controlador e o operador devem manter registro das operações de tratamento de dados pessoais que realizarem."

**Implementação:**

- ✅ Audit log (`admin/audit` page) — toda leitura/escrita de user data registrada.
- ✅ Data flow document atualizado por W37 (item LG-2 action checklist).
- ✅ Encarregado (DPO) nomeado em `/privacidade` (Art. 41).

### 8.4 Special safeguards Akasha IA

> Akasha conversa livremente sobre espiritualidade, **mas**:

- ✅ **NÃO** processa dados de crianças < 13 anos (COPPA + LGPD Art. 14).
- ✅ **NÃO** usa dados de conversa para treinar modelos (Art. 6, IX).
- ✅ Logs de IA têm retenção 90d (Art. 16 — minimização).
- ✅ Protocolo de crise (R7) → CVV 188 / 988 (não aguarda revisão humana).
- ✅ Refusal precision auditada semanalmente (C8 health KPI).

---

## 9. Benchmarks externos

> Comparação dos targets Wave 4 contra benchmarks cross-industry. Convenção: `target Wave 4 / benchmark` = ratio outperform expected.

### 9.1 Retention benchmarks

| Métrica | Target Wave 4 | Phiture/Amplitude benchmark | Outperform ratio |
|---|---|---|---|
| D7 retention | 35% | 11-13% (cross-industry) | ~2.7x |
| D7 retention top 25% | — | ≥ 7% (Amplitude regra 7%) | — |
| D30 retention | 25% | 5-7% (Amplitude) | ~4x |
| D30 Wave 1-3 expected | 25% | 5% typical spirituality app | ~5x |

> **Honest disclosure:** targets W32-8 foram ajustados para v2 beta intensive onde wave 1-3 usaram critérios mais brandos. Wave 4 = base aberta onde 35% D7 é a **expectativa realista** para comunidade pequena + IA curadora + temática espiritual.

### 9.2 Performance benchmarks

| Métrica | Target Wave 4 | web.dev good | Notes |
|---|---|---|---|
| LCP | ≤ 3s p95 | ≤ 2.5s p75 | Aceitável para 75th; p95 mais relax |
| CLS | ≤ 0.15 | ≤ 0.1 | Aceitável |
| INP | ≤ 250ms | ≤ 200ms | Aceitável |
| Crash-free | ≥ 99% | ≥ 99.5% target SaaS | Aceitável |

### 9.3 Engagement benchmarks

| Métrica | Target Wave 4 | DAU/MAU industry |
|---|---|---|
| DAU/MAU | ≥ 30% | 20% comunidade genérica (Zhihu) |
| NPS | ≥ 40 | 30+ (SaaS bom), 50+ excelente |

> Wave 4 targets são defensáveis como **aspiracionais dentro do segmento espiritual + comunidade pequena**.

---

## 10. Cross-project lessons (reusable)

> Padrões da W37 framework que generalizam além de cabaladoscaminhos.

### 10.1 Pure-function decision algorithm (durable)

> **Pattern:** qualquer decision dashboard (open beta, pricing, kill switch) deve implementar:
> 1. Pure function `computeDecision(inputs): Decision`
> 2. Inputs versionados (e.g. `KpiDefinition[]` array, `RiskEntry[]` array)
> 3. Output inclui `rationale` (texto human-readable)
> 4. Threshold constants exportados (e.g. `SCORE_GO_THRESHOLD = 0.85`)
> 5. Test E2E: mesmas KPIs actuais → mesma decisão

**Exemplo:** `go-no-go-calculator.ts` em cabaladoscaminhos; reusable em qualquer orchestrator ou produto SaaS.

### 10.2 P0 + weighted score duality

> **Pattern:** combine **hard gates** (P0 individual reds = auto-NO-GO) com **weighted aggregate score** (visao holística). Isso evita (a) um único P0 isolate ser justificativa para GO, e (b) um score alto mascarar problemas sistêmicos.

**Cabaladoscaminhos W37:** 9 health P0 gates + weighted score das 18 = duality aplicada.

### 10.3 Risk register como first-class artifact

> **Pattern:** risks são typed objects com `MitigationAction[]` + `autoFlagIf` (predicate). Status machine: `mitigated → monitoring → active` (auto-flag loop).

**Reusable:** qualquer projeto tem 5-10 risks; codificar em TS com status machine é 10x mais auditável que planilha.

### 10.4 Cadence explícita (hourly → daily → weekly)

> **Pattern:** post-launch monitoring com 3 cadences (hourly first 24h, daily first week, weekly first month). Triggers severity-typed (`informational` · `warning` · `critical`). Rollback plan testado antes do launch (não improvisado).

**Cross-project lesson:** cron-driven orchestrators devem implementar cadence explícita como dataclass, não como reminders ad-hoc.

### 10.5 Audit trail + LGPD Art. 37

> **Pattern:** todo decision dashboard emite `evaluatedAt` + `evaluations[].rationale` + `decisionRationale`. Isso é audit-trail automático, atende LGPD Art. 37 (registro de operações) sem overhead extra.

---

## 11. Limitações & honestidade

### 11.1 O que ESTE documento NÃO resolve

- ❌ **Não é dashboard de operational metrics em tempo real** — substituto seria grafana/PostHog com alerta.
- ❌ **Não é pricing decision** — pricing A/B é W37B-2 separado.
- ❌ **Não é Wave 5 plan** — sai após D+30 strategic review.
- ❌ **Não substitui Founder review** — D-7 + D-3 gates exigem owner presence.

### 11.2 Dados que NÃO foram validados empiricamente em escala Wave 4

- **D7 retention 35%** com 500 users — baseado em (a) benchmark cross-industry + (b) outperform por white-glove Wave 1-3. Pode estar otimista em 5-15% se cohort público for mais cold.
- **API p95 2s** com 500 users — depende de infra W37A-1 (load test). Pode precisar 1.5s stretch goal.
- **Akasha refusal precision 85%** com volume público — pode cair se users fazem adversarial prompts.

### 11.3 Premissas que PODEM estar erradas

| Premissa | Se errada, o que acontece | Como descobrir cedo |
|---|---|---|
| "500 users é viável com infra Wave 36-37" | Load test 100 RPS FAIL → reabrir infra | W37A-1 |
| "Moderação aguenta 500 users com 1 moderator" | Queue backlog > 24h | D+1 review |
| "Cohort público aceita regras igual white-glove" | D1 retention < 35% | D+7 review |
| "IA aguenta volume sem precisar downscale" | p95 > 2s sustained | H+12 checkpoint |
| "Padrões cross-tradição emergem organicamente" | Cross-tradition engagement < 25% sustained | D+7 review |

### 11.4 Riscos que esta framework NÃO elimina

- **Risco zero de P0 incident** — mitigado por MON-1 (on-call), não eliminável.
- **Risco zero de toxicidade** — mitigado por R2 monitoring, não eliminável.
- **Risco zero de churn** — mesmo com product-market fit, ~ 5% churn é normal.
- **Risco de "tudo funcionar e ninguém aparecer"** — acquire-orgânico falha; abort Wave 5.

---

## 12. Anexos e referências

### 12.1 Documentos internos consumidos

| Doc | Função | Linhas relevantes |
|---|---|---|
| `docs/BETA-LAUNCH-STRATEGY-W32.md` | Strategic plan W32-8 | §4 KPIs · §6 risk matrix · §7 contingency · §10 decisions |
| `docs/WAVE-37-OPEN-BETA-DECISION.md` | W37 8-signal matrix | §"8-signal measurement" + §"decision matrix" |
| `src/lib/monitoring/metrics.ts` | Web Vitals + custom metrics | `THRESHOLDS` table (web.dev-aligned) |
| `src/lib/analytics/cohorts.ts` | Cohort retention analytics | Retention matrix · LGPD k-anonimato |
| `src/lib/analytics/funnel.ts` | Funnel conversion | Funnel delta computation |

### 12.2 Arquivos novos Wave 37

| Path | Função |
|---|---|
| `src/lib/decisions/kpi-definitions.ts` | 18 KPIs catalog (target, weight, direction, P0) |
| `src/lib/decisions/go-no-go-calculator.ts` | Weighted score + decision matrix |
| `src/lib/decisions/risk-register.ts` | 8 risks (R1–R8) com mitigation actions |
| `src/lib/decisions/decision-timeline.ts` | 7 milestones (D-7 → D+30) |
| `src/lib/decisions/post-launch-playbook.ts` | 3 cadences + rollback plan 6-step |
| `src/app/admin/decisions/open-beta/page.tsx` | Server Component dashboard |
| `src/app/admin/decisions/open-beta/action-items/page.tsx` | Pre-launch checklist (12 itens) |
| `tsconfig.w37.json` | TSC isolated check (Wave 37 files only) |
| `docs/OPEN-BETA-DECISION-W37.md` | Reference doc (12 sections) |

### 12.3 Benchmarks externos citados em §9

| Fonte | Métrica citada |
|---|---|
| [Phiture](https://phiture.com/mobilegrowthstack/managing-retention-rate-benchmarks-and-expectations/) | D7=11-13%, D30=5-7% cross-industry |
| [Amplitude](https://amplitude.com/blog/7-percent-retention-rule) | D7 ≥ 7% top 25% |
| [Sendbird](https://sendbird.com/blog/app-retention-broken-down-by-industry) | Apps shopping D7~10.7%, D30~5.6% |
| [web.dev](https://web.dev/articles/defining-core-web-vitals-thresholds) | LCP/CLS/INP/FCP/TTFB thresholds |
| [Zhihu](https://www.zhihu.com/question/20429832/answer/899169290) | DAU/MAU ~0.20 (gen), 0.35-0.40 (conteúdo), 0.77 (social) |

### 12.4 Frameworks utilizados

- **AARRR (Pirate Metrics)** — categorização A/B/C dos 18 KPIs.
- **RICE Scoring** — peso por importância via `weight`.
- **Go/No-Go matrix** — 3 outcomes (GO/CONDITIONAL/NO-GO).
- **Pre-mortem** — W32-8 §7.6 antecipação de fracasso.
- **North Star Metric** — `engagement-dau-mau` (proposta) como headline.
- **Webhook-driven rollback** — feature flag `wave_4_invites_enabled` em `post-launch-playbook.ts` step 2.

### 12.5 Próximos passos (Wave 37.5)

1. **Trocar `SAMPLE_ACTUALS_W37` por collector real** — integrar com PostHog + Sentry + Stripe + moderation queue no T-3 do decision.
2. **Publicar `/runbooks/crisis.md`** (work item W32-8 §11.5, ainda OPEN).
3. **Convocar cross-functional D-7 review** com Founder + Designer + QA + Mod.
4. **Iniciar treinamento do human moderator** (SUP-1) — meta DONE D-3.
5. **Scheduled on-call rotation** (MON-1) — meta DONE D-3.
6. **Publicar `/codigo-conduta`** (DOC-2) com co-autoria Mod.

---

> **Última atualização:** 2026-07-01 · Wave 37 — OPEN BETA DECISION 2/8
> Mantido por Coder + PM (Tomás) + QA (Ravena) · Próxima revisão: D-7 cross-functional review
> **LGPD compliance check:** ✅ Art. 7 (consent) + ✅ Art. 18 (direitos) + ✅ Art. 37 (registro)
