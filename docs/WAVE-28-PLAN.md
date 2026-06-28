# 🎯 Wave 28 — Beta Launch (per Wave 16 Plan)

> **Data:** 2026-06-28
> **Owner:** PM (Tomás) + Growth + Designer (Lina)
> **Precedentes:** W24-26 (UX + tests) · W27 (push readiness)
> **Status:** 🟢 Pronto para execução após desbloqueio W27
> **Duração alvo:** 5-7 dias úteis

---

## TL;DR

Wave 28 é o **Beta Launch controlado** — primeiros 50 usuários ativos na plataforma com onboarding white-glove e métricas baseline. Após W27 desbloquear push + deploy, W28 ativa o pipeline de aquisição escalonada em 3 waves (10 → 20 → 20 = 50 total).

**Premissa:** W27 push + deploy acontecem primeiro (ETA ~30min owner procedure). Wave 28 começa **Imediatamente** após smoke prod PASS.

---

## 📅 Cronograma Wave 28 (5-7 dias)

```text
Dia 1     2     3     4     5     6     7
|-------- W28 ---------|
  Prep   Wave 1   Wave 2   Wave 3   Monitor
  +Page  10 users 20 users 20 users Iterate
```

### Dia 1 — Preparação (owner + PM + Growth)

#### Manhã (3h)
- [ ] **Beta landing page** (`/beta`)
  - Copy per `docs/BETA-LAUNCH-PLAYBOOK.md` (Wave 16, base)
  - Hero + 3 features principais + form de signup white-glove
  - SEO meta tags + OG image
  - **Owner:** Coder (com copy review por PM Tomás)
  - **ETA:** 2h

- [ ] **Convite template final**
  - 50 emails personalizados (nome + tradição espiritual de interesse)
  - Assinatura: founder + axé
  - CTA: "/beta?token=<unique>" — magic link 7-day expiry
  - **Owner:** Growth
  - **ETA:** 1h

#### Tarde (3h)
- [ ] **Onboarding white-glove flow**
  - Manual de 14 dias (PM Tomás — `docs/ONBOARDING-WHITE-GLOVE.md`)
  - Call 30min por usuário Wave 1
  - Slack/Discord channel dedicado para feedback
  - **Owner:** PM Tomás
  - **ETA:** 2h

- [ ] **Activation metrics setup**
  - PostHog events configurados (já W18 — verificar)
  - Dashboard: D1, D7, D30 retention
  - Funnel: landing → signup → first post → first comment → 7-day return
  - **Owner:** Growth + Performance (Aki)
  - **ETA:** 1h

#### Noite (1h)
- [ ] **Pre-launch checklist**
  - [ ] Beta page live em prod
  - [ ] Magic link tokens gerados (50)
  - [ ] Dashboard PostHog testado com 1 evento fake
  - [ ] Slack/Discord pronto (5 canais: #geral, #feedback, #bugs, #sugestões, #celebrate)
  - [ ] Cron para envio escalonado configurado

### Dia 2 — Wave 1 da Beta (10 usuários)

#### Manhã (2h)
- [ ] **Envio Wave 1** — 10 convites
  - Critério seleção: rede founder + 5 amigos próximos + 4 cold leads (lista de espera W16)
  - Cron: `2026-07-02 09:00 UTC` (owner aciona)
  - **Owner:** Growth

- [ ] **Onboarding individual**
  - 30min call com cada um dos 10
  - Coletar: motivação, tradição espiritual, expectativas
  - Setup: notificações, temas, profile
  - **Owner:** PM Tomás (ou designada)
  - **ETA:** 5h (10 × 30min)

#### Tarde (2h)
- [ ] **Daily standup interno** (15min, owner + PM + Growth)
- [ ] **Monitor ativação Wave 1** (PostHog dashboard)
  - Métrica chave: D1 activation rate (target > 80%)
  - Bug triage se algum usuário reportar blocker
  - **Owner:** Growth

#### Noite (1h)
- [ ] **Feedback round-up** (Day 1)
  - Coletar TODOS os comentários/erros/sugestões
  - Triage: P0 (blocker) / P1 (UX ruim) / P2 (nice-to-have)
  - Criar issues no GitHub para qualquer P0/P1
  - **Owner:** PM Tomás

### Dia 3 — Wave 2 da Beta (+20 usuários, 30 total)

#### Manhã (1h)
- [ ] **Hotfix P0 da Wave 1** (se houver)
  - Owner aciona Coder imediatamente
  - **ETA:** max 2h para fix + deploy (Vercel auto)

- [ ] **Envio Wave 2** — 20 convites
  - Critério: comunidade online (Discord espiritualidade, grupos Telegram)
  - Cron: `2026-07-03 09:00 UTC`
  - **Owner:** Growth

#### Tarde (3h)
- [ ] **Onboarding Wave 2** (white-glove)
  - 30min × 20 = 10h → distribuir em 2-3 dias
  - Dia 3: 8 calls · Dia 4: 8 calls · Dia 5: 4 calls
  - **Owner:** PM Tomás + 2 community managers

#### Noite (1h)
- [ ] **Daily standup + monitor**
- [ ] **Métricas Wave 1+2 combined** (target: D1 > 75%)

### Dia 4 — Wave 3 da Beta (+20 usuários, 50 total)

#### Manhã (1h)
- [ ] **Envio Wave 3** — 20 convites
  - Critério: lista de espera orgânica (form `/beta` se coletamos)
  - Cron: `2026-07-04 09:00 UTC`
  - **Owner:** Growth

- [ ] **Hotfix P0 da Wave 2** (se houver)

#### Tarde (2h)
- [ ] **Onboarding Wave 3** (continuação)
- [ ] **Daily standup + monitor**

#### Noite (1h)
- [ ] **Cobertura 50/50 ativos**
  - Confirmar: 50 signups, 50 onboardings completos, 45+ ativos no D1
  - **Owner:** Growth

### Dia 5-7 — Monitor + Iterate

#### Daily
- [ ] **Daily standup 09:00 UTC** (15min)
- [ ] **Monitor métricas**
  - D1, D7 retention (target: D7 > 40%)
  - Activation events (first post, first comment, first bookmark)
  - Bug reports (target: < 5 P0 abertos)
  - **Owner:** Growth + Performance (Aki)

- [ ] **Hotfix triage** (P0 dentro de 4h, P1 dentro de 24h)
  - **Owner:** Coder on-call

#### Dia 7
- [ ] **NPS survey** (todos os 50)
  - Form: 1 pergunta NPS + 3 perguntas abertas
  - Cron: `2026-07-08 18:00 UTC`
  - **Owner:** Growth

- [ ] **Wave 28 Report** (`docs/WAVE-28-REPORT.md`)
  - Métricas: signups, activation, retention, NPS
  - Feedback consolidado (top 5 issues + top 5 praises)
  - Roadmap Wave 29 baseado em feedback
  - **Owner:** PM Tomás
  - **ETA:** 4h

---

## 📊 Métricas Baseline (24h, 7d, 30d)

### North Star Metric
- **Weekly Active Cabalists (WAC)** — usuários que postaram/comentaram pelo menos 1x na semana

### KPIs Wave 28

| KPI | Target | Critical Threshold |
|---|---|---|
| Signups completados | 50/50 | < 40 |
| D1 activation rate | > 80% | < 60% |
| D7 retention | > 40% | < 25% |
| First post em 24h | > 50% dos ativos | < 30% |
| First comment em 7d | > 70% dos ativos | < 50% |
| Bug reports P0 | < 3 | > 10 |
| NPS | > 30 | < 0 |
| Avg session duration | > 5min | < 2min |

### PostHog Events (já instrumentados W18)
- `signup_completed`
- `onboarding_step_completed`
- `post_created`
- `comment_created`
- `bookmark_added`
- `akashic_chat_started`
- `library_article_read`
- `search_performed`
- `profile_updated`
- `notification_clicked`

---

## 🎁 Benefícios Oferecidos aos Beta Testers

### White-Glove
- Onboarding 30min 1:1 com founder
- Canal direto Slack/Discord
- Acesso antecipado a features Wave 30+
- Créditos em marketplace de leituras (se aplicável)

### Reconhecimento
- Badge "Beta Pioneer" no profile
- List em `docs/BETA-THANKS.md` (público)
- Possível convite para advisory board (top 5 contribuidores)

### Retenção
- Sem custo durante beta (3 meses)
- Lock-in de preço grandfathered (se modelo freemium entrar)

---

## 💰 Budget Wave 28

| Item | Custo | Owner |
|---|---|---|
| PostHog (já W18) | $0 (free tier até 1M events) | — |
| Vercel (já W11) | $0 (hobby tier) | — |
| Domínio (já) | $0 | — |
| Magic link infra | $0 (Supabase auth built-in) | — |
| Email sender (Resend) | $0 (free tier 100 emails/dia) | — |
| Founder time | 20h × 5 dias = 100h | PM Tomás |
| Community managers | 2 × 10h = 20h | Growth |
| **TOTAL** | **~$0 cash + 120h founder time** | — |

---

## ⚠️ Riscos + Mitigações Wave 28

| Risco | Prob | Impact | Mitigação |
|---|:---:|:---:|---|
| W27 push/deploy não acontece em 24h | 🟡 Média | 🔴 W28 não começa | Owner procedure 30min + reminder |
| Beta users não engajam (D1 < 50%) | 🟡 Média | 🔴 Métricas ruins | White-glove onboarding + daily check-in PM |
| Bug crítico em produção | 🟡 Média | 🟡 Reputação | Hotfix window 4h + rollback Vercel |
| Token exposto virar incidente de segurança | 🟢 Baixa | 🔴 Crítico | BFG antes do push + revoke manual |
| Founder burnout | 🟡 Média | 🟡 W29 atrasa | Limitar 4h/dia founder + delegar PM/Growth |
| Concorrente lança feature similar | 🟢 Baixa | 🟡 Diferenciação | Foco em tradição brasileira + comunidade (não feature) |
| LGPD violation em dados de beta | 🟢 Baixa | 🔴 Crítico | LGPD compliance já W22 + double-check com Caio |
| Beta users reclamam de mock data | 🟢 Baixa | 🟡 UX ruim | W21 substituiu mocks por APIs reais |

---

## 📋 Entregáveis Wave 28

| Tipo | Arquivo | Owner |
|---|---|---|
| Beta landing | `src/app/beta/page.tsx` | Coder |
| Convite emails | `docs/beta-emails/wave-{1,2,3}.md` (50 personalizações) | Growth |
| Onboarding playbook | `docs/ONBOARDING-WHITE-GLOVE.md` | PM Tomás |
| Magic link infra | `src/app/api/beta/invite/route.ts` | Coder |
| PostHog dashboard | PostHog cloud (link no report) | Growth |
| Daily standup notes | `docs/beta-dailies/day-{1..7}.md` | PM Tomás |
| Wave 28 Report | `docs/WAVE-28-REPORT.md` | PM Tomás |
| Beta thanks list | `docs/BETA-THANKS.md` | Growth |
| Issues criadas (top feedback) | GitHub issues com label `beta-feedback` | Coder |

---

## 🚪 Exit Criteria Wave 28 → Wave 29

- [ ] 50 usuários ativos (meta: 45+ D1 activation)
- [ ] D7 retention > 40% (medido no fim do Wave 28)
- [ ] NPS > 30
- [ ] < 5 P0 bugs abertos
- [ ] `docs/WAVE-28-REPORT.md` publicado
- [ ] Roadmap Wave 29 baseado em feedback real (não assumido)
- [ ] Decisão: Public Launch go/no-go (W29)

---

## 🔀 Wave 29 — Public Launch Decision

### Opção A — Public Launch GO
- Remover beta gate (`/beta` → `/`)
- Lançar marketing (Wave 16 GTM plan)
- Abrir signups orgânicos (Meta ads, conteúdo, SEO)
- Métricas target: 500 signups em 30 dias

### Opção B — Beta Estendida
- Mais 50 usuários (total 100)
- Foco em retenção D30 antes de escalar
- Iterar features baseadas em feedback
- Public launch após D30 retention > 50%

### Opção C — Pivot
- Se NPS < 0 ou D7 < 25%, pivotar
- Wave 29 vira "Save the Beta" — entender bloqueios
- Re-pivotar produto antes de public launch

**Decisão owner-only** após ler `docs/WAVE-28-REPORT.md`.

---

## 📚 Referências

- `docs/PUSH-READINESS-W27.md` — checklist pré-push (precisa estar ✅ antes de W28)
- `docs/BETA-LAUNCH-PLAYBOOK.md` — playbook Wave 16 (base, ainda válido)
- `docs/WAVE-27-PLAN.md` — plano Wave 27 (referência temporal)
- `docs/ROADMAP-Q3-2026.md` — roadmap Q3 atualizado
- `docs/POSTHOG-EVENTS-W18.md` — eventos já instrumentados
- `docs/ONBOARDING-EXISTING.md` — onboarding atual (base para white-glove)
- `docs/LGPD-COMPLIANCE-W22.md` — compliance LGPD

---

## 👥 Owners Wave 28

| Persona | Skills | Responsabilidade |
|---|---|---|
| PM (Tomás) | pm, designer | Onboarding, daily standups, report |
| Growth | pm | Convites, magic links, NPS survey |
| Designer (Lina) | designer | Beta page UX, feedback visual review |
| Coder | coder | Hotfix window 4h, beta page impl |
| Performance (Aki) | performance | Métricas, Lighthouse monitor |
| Verifier | verifier | Audit final antes public launch |

---

## ✅ Definition of Done — Wave 28

- [ ] 50 usuários ativos com onboarding completo
- [ ] 7 dias de métricas baseline coletadas
- [ ] NPS survey aplicado e analisado
- [ ] `docs/WAVE-28-REPORT.md` publicado
- [ ] Top 10 issues criadas no GitHub
- [ ] Decisão Wave 29 (GO / Estender / Pivot) tomada pelo owner
- [ ] Equipe descansou (não-burnout) — wave de 5-7 dias úteis

**Status: 🟢 READY** — aguardando unlock W27.

---

## 🎯 Próximo Passo Imediato

**Aguardar W27 deploy live (ETA 30min owner procedure).**

Em paralelo:
1. **Coder:** scaffold `/beta/page.tsx` (2h, dry-run em preview)
2. **PM Tomás:** redigir `docs/ONBOARDING-WHITE-GLOVE.md` (3h)
3. **Growth:** preparar 50 emails personalizados (4h)

Quando W27 deploy for confirmado:
- [ ] Subir `/beta` page em prod (10min)
- [ ] Validar magic link flow (5min)
- [ ] Cron Wave 1: `2026-07-02 09:00 UTC` (configurar)

**Trigger Wave 28:** owner aciona `#launch-beta` no Slack/Discord.