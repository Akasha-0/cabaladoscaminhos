# 🗺️ Wave 31-32 — Roadmap Detalhado

> **Data:** 2026-06-30
> **Owner:** Coordinator (Geral) + Ravena (QA) + Tomás (PM)
> **Status:** 🟢 Draft pronto · aguarda W30 fechar para disparo
> **Origem:** `docs/WAVE-30-SUMMARY.md`

---

## TL;DR

| Wave | Foco | Duração | Owners | Entregável |
|---|---|---|---|---|
| **W31** | Implementation | 5-7 dias úteis | Coder + Lina + Caio + Ravena + Iyá | 4 features P0 + W30-6 close + W30-5/W30-7 commit |
| **W32** | Quality + Push | 2-3 dias úteis | Ravena + Aki + Verifier | Smoke + bundle + audit + push 4 PRs |

**Trigger W31:** owner aciona spawn quando W30 fechar completamente (W30-6 entregue + W30-8 identificado).

---

## Wave 31 — Implementation Wave

### Objetivo

Fechar as 4 features P0 identificadas em W30 (Stripe W30-6, Smart Notifications UI W30-7, Akasha Principles W30-5, Community Engagement features) + commitar docs untracked W28-30 + TSC=0 mantido + polish UX P0.

### Trilhas paralelas (7 workers)

#### W31-1 — Stripe Payments End-to-End 🟢 CRITICAL (era W30-6)

**Owner:** Coder + Caio (Security)
**ETA:** 6-8h
**Dependências:** nenhuma
**Bloqueador:** LGPD refresh para Stripe data (subset de W22)

**Tasks:**
- [ ] Schema Prisma: `Subscription` + `Customer` + `PaymentEvent` (idempotência via event.id)
- [ ] API: `POST /api/stripe/checkout` — cria session com metadata user_id
- [ ] API: `POST /api/stripe/webhook` — idempotente via event.id, signature validada
- [ ] API: `POST /api/stripe/portal` — customer portal link
- [ ] UI: `src/app/(community)/settings/billing/page.tsx`
- [ ] UI: Checkout success/cancel pages
- [ ] Tests: webhook idempotência + signature validation + LGPD export
- [ ] Doc: `docs/STRIPE-INTEGRATION-W31.md`

**Critérios done:**
- 1 user consegue subscribe → webhook atualiza DB → portal acessível
- Replay do mesmo webhook não duplica subscription
- LGPD: dados Stripe separados, exportação possível, erasure honoured

#### W31-2 — Smart Sacred Notifications UI 🟢 HIGH (continuação W30-7)

**Owner:** Coder + Lina (sacred theming) + Iyá (sacred calendar)
**ETA:** 5h
**Dependências:** `docs/NOTIFICATIONS-SACRED-W30.md` (já entregue) + `src/lib/notifications/index.ts`
**Bloqueador:** nenhum

**Tasks:**
- [ ] Implementar `smart-scheduler.ts` (algoritmo de timing sagrado)
- [ ] Sacred Calendar: dados curados de dias santos (Lua cheia, orixás, festas)
- [ ] UI: `NotificationCard` sacred-themed com glow por urgência
- [ ] Quiet hours: 22:00-08:00 local time (configurável)
- [ ] DND/Focus mode: toggle no settings
- [ ] Frequency cap: máx 3 push/dia (R4)
- [ ] Tom por tradição: 6 variantes de copy (R5)
- [ ] Settings: notification preferences page
- [ ] Tests: trigger calc + ritual matching + quiet hours + LGPD
- [ ] Doc: `docs/SACRED-NOTIFICATIONS-UI-W31.md`

**Critérios done:**
- Notificações urgentes (mention) sobem acima quiet hours
- Ritual moments aparecem com ícone sagrado + cor por tradição
- Usuário pode desabilitar por categoria + por tradição

#### W31-3 — Akasha Principles Integration 🟢 HIGH (continuação W30-5)

**Owner:** Coder + Iyá (Curator)
**ETA:** 6h
**Dependências:** `docs/AI-PERSONALITY-ARCHITECTURE-W30.md` + `src/lib/ai/akasha-principles.ts`

**Tasks:**
- [ ] Implementar `src/lib/ai/akasha-principles.ts` (12 valores + 6 camadas) — greenprint já entregue
- [ ] System prompt estruturado: context layers + safety rails
- [ ] Voice layer: 6 vozes por tradição (Cabala mística, Ifá ancestral, Tantra tântrico, Xamanismo ayahuasqueiro, Ayurveda vaidya, Astrologia hermética)
- [ ] Integration: `/akashic-chat` aceita `?personality=<id>` query param
- [ ] UI: seletor de personalidade no header do chat (6 cards)
- [ ] Tests: voice consistency + safety rails + 12 valores honored + disclaimer sempre presente
- [ ] Doc: `docs/AKASHA-PRINCIPLES-IMPL-W31.md`

**Critérios done:**
- Cada personalidade tem voice distinto verificável em 5 samples
- Disclaimer ético aparece em toda primeira conversa
- Safety rails bloqueiam: medical diagnosis · legal advice · substituting live praticante
- Constituição imutável: 12 valores garantidos em prompt system

#### W31-4 — Top Community Engagement Features 🟢 HIGH (continuação W30-4)

**Owner:** Coder + PM (Tomás) + Lina
**ETA:** 6h
**Dependências:** `docs/COMMUNITY-ENGAGEMENT-W30.md` (875 linhas) — extrair top features

**Tasks (top 3 features ICE-score esperado ≥ 8.0):**
- [ ] Feature 1: **Onboarding drip** (5 emails em 14 dias) — sequence já existe W29, precisa trigger
- [ ] Feature 2: **Referral loop** — link único, 7 dias Pro trial ao indicado, ambos ganham
- [ ] Feature 3: **Daily ritual streak** — 1 prática/dia conta, badge 7/30/90 dias
- [ ] Settings: streaks visíveis no profile
- [ ] Tests: streak calc (timezone-aware) + drip trigger + referral attribution cross-device
- [ ] PostHog events novos: `streak_started`, `streak_7d`, `referral_sent`, `referral_converted`
- [ ] Doc: `docs/COMMUNITY-ENGAGEMENT-IMPL-W31.md`

**Critérios done:**
- D7 retention baseline coletável via PostHog events novos
- Referral attribution funciona cross-device (cookie 30d + server-side)
- Streak não quebra em viagem (timezone-aware: UTC store + local render)

#### W31-5 — Commit W28-30 Untracked Docs 🟢 QUALITY

**Owner:** Coordinator
**ETA:** 30 min
**Dependências:** nenhuma (puramente housekeeping)

**Tasks:**
- [ ] Mover `W30-URGENT-FIX-1.md` (root) → `docs/W30-URGENT-FIX-1.md`
- [ ] Mover `DELIVERABLE-W28-SACRED-GEOMETRY.md` → `docs/`
- [ ] Mover `DELIVERABLE-W28-SHADOWS-GLOWS.md` → `docs/`
- [ ] Mover `DELIVERABLE-W29-AI-CURATION-ENGINE.md` → `docs/`
- [ ] `git add docs/<explicit-files>` — NÃO usar `-A`
- [ ] Mensagem Conventional Commits por wave:
  - `docs(consolidate): commit W28-29 untracked deliverables`
  - `docs(w30): commit W30-5 personality + W30-7 sacred notifications`
  - `docs(summary): wave 30 + plan 31-32`
- [ ] Doc: este próprio doc + WAVE-30-SUMMARY.md

#### W31-6 — UX P0 Polish (do W30-3) 🟡 MEDIUM

**Owner:** Lina + Coder
**ETA:** 4h
**Dependências:** `docs/UX-RESEARCH-W30.md` top 15 ICE

**Tasks (4 melhorias P0):**
- [ ] GlossaryDrawer: tooltip explicativo para termos técnicos
- [ ] Streaming indicator: "Processando X cartas..." antes da 1ª resposta
- [ ] Mesa Real phase messaging: "Embaralhando", "Cortando", "Posicionando"
- [ ] Accent consistency: linter rule para Oxalá/Oxala/etc
- [ ] Visual regression: 4 novos snapshots
- [ ] Doc: `docs/UX-P0-POLISH-W31.md`

#### W31-7 — TSC = 0 + Lint + Polish 🟢 QUALITY

**Owner:** Coder + Ravena
**ETA:** 3h
**Dependências:** nenhuma (corrige W31 introduced errors)

**Tasks:**
- [ ] TSC: 0 errors (verificar `npx tsc --noEmit --skipLibCheck`)
- [ ] Lint: 0 errors (max 10 warnings aceitáveis)
- [ ] Polish: imports cleanup, dead code removal
- [ ] Doc: `docs/TSC-LINT-AUDIT-W31.md`

### W31 — Definition of Done

- [ ] Stripe (W31-1): subscribe → webhook → portal funciona end-to-end em staging
- [ ] Smart notifications (W31-2): ritual moments + quiet hours + DND + UI sacred visíveis
- [ ] Akasha principles (W31-3): 12 valores + 6 camadas + 6 vozes implementados
- [ ] Community engagement (W31-4): 3 features ativas + PostHog events novos
- [ ] W28-30 untracked docs (W31-5): commitados em waves separados
- [ ] UX P0 polish (W31-6): 4 melhorias implementadas
- [ ] TSC = 0 (W31-7), lint ≤ 10 warnings
- [ ] All commits locais com mensagem Conventional Commits
- [ ] 7 DELIVERABLE docs publicados (W31-1 a W31-7)

### W31 — Risks

| Risco | Prob | Impact | Mitigação |
|---|:---:|:---:|---|
| Stripe LGPD refresh descobre gap | 🟡 | 🔴 | Caio involved from start, não no final |
| Personality voices soam genéricos | 🟡 | 🟡 | Iyá (curator) valida 5 samples antes de merge |
| Streak timezone bug | 🟡 | 🟡 | UTC storage + local render, test multi-tz |
| Parallel session collision | 🟡 | 🟡 | Worktree isolado por trilha, recovery pattern W28 |
| Git commit hang | 🟢 | 🟢 | Documentar comando exato, deixar user commitar |
| Smart scheduler edge case (Lua 2x/mês) | 🟡 | 🟡 | Test com efemérides 2026 completas |

---

## Wave 32 — Quality + Push

### Objetivo

Validação final + empacotar W24-W31 em PRs review-friendly + push para origin.

### Trilhas paralelas (4 workers)

#### W32-1 — Final Validation 🟢 QUALITY

**Owner:** Ravena + Aki (Performance)
**ETA:** 4h

**Tasks:**
- [ ] TSC: `npx tsc --noEmit --skipLibCheck` → 0 errors
- [ ] Lint: `pnpm lint` → 0 errors, ≤ 10 warnings
- [ ] Tests: `pnpm test` → 633+ unit pass, 16+ e2e pass
- [ ] Visual: `pnpm test:visual` → 99+ snapshots pass (4 novos W31)
- [ ] Bundle: `pnpm build` → ≤ 250KB initial JS (perfs budget W11)
- [ ] Lighthouse mobile: ≥ 90 perf, ≥ 95 a11y, ≥ 95 best-practices, ≥ 95 SEO
- [ ] Core Web Vitals: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1
- [ ] LGPD audit: refresh para Stripe data added W31
- [ ] Security scan: `npm audit` → 0 high/critical
- [ ] Doc: `docs/FINAL-VALIDATION-W32.md`

#### W32-2 — Smoke Test Completo 🟢 QUALITY

**Owner:** Ravena + Coder
**ETA:** 3h

**Tasks:**
- [ ] Static smoke: 52 pages + 96 APIs (já W24)
- [ ] Live smoke: dev server local (limitação sandbox — pode ser BLOCKED, documentar)
- [ ] Stripe live test (test mode): subscribe flow + webhook + idempotência
- [ ] Notification ritual moment test: simular Lua cheia + Orixá day
- [ ] Akasha chat personality switch test (6 vozes)
- [ ] Doc: `docs/SMOKE-TEST-W32.md`

#### W32-3 — Push Strategy + PRs 🟢 DEPLOY

**Owner:** Coordinator + Caio (security review)
**ETA:** 2h

**Strategy: 4 PRs review-friendly (vs 1 mega-PR de ~25k LoC)**

```
PR 1: feat/w24-w26-polish    (15 commits, ~6000 LoC)
     ↓
PR 2: feat/w27-push-readiness  (8 commits, deploy configs)
     ↓
PR 3: feat/w28-design-system   (8 commits, design v2)
     ↓
PR 4: feat/w29-w31-content-impl (15+ commits, content + impl)
```

**Tasks:**
- [ ] Branch protection verified (Caio)
- [ ] Conventional Commits validados em todos
- [ ] Secrets scan (GIT_ASKPASS pattern, no token in argv/reflog)
- [ ] CHANGELOG.md atualizado
- [ ] 4 PRs abertas com descrição + checklist
- [ ] Push via `git push -u origin <branch>` (NÃO main direto)
- [ ] Doc: `docs/PUSH-STRATEGY-W32.md`

#### W32-4 — Wave 32 Report 🟢 DOCS

**Owner:** PM Tomás + Coordinator
**ETA:** 2h

**Tasks:**
- [ ] `docs/WAVE-32-REPORT.md` — métricas finais + decisões
- [ ] `docs/ROADMAP-Q3-2026.md` — refresh pós-push
- [ ] `docs/VISION-2027-W15.md` — refresh milestones
- [ ] Stakeholder communication (Wave 23 template)
- [ ] `docs/CHANGELOG-W32.md` — release notes para usuários

### W32 — Definition of Done

- [ ] All 4 quality gates green (TSC · lint · tests · visual)
- [ ] 4 PRs abertas com CI verde (Vercel preview + GitHub Actions)
- [ ] Wave 32 Report publicado
- [ ] Roadmap Q3 2026 atualizado
- [ ] Stakeholders notificados

### W32 — Risks

| Risco | Prob | Impact | Mitigação |
|---|:---:|:---:|---|
| Live smoke bloqueado (sandbox) | 🟡 | 🟡 | Aceitar BLOCKED + documentar; static smoke + unit é suficiente |
| PR 1 (6000 LoC) muito grande | 🟡 | 🟡 | Caio faz review focado em security, owner aprova holistic |
| Branch protection push fail | 🟢 | 🟡 | GIT_ASKPASS pattern (memory 2026-06-29) |
| Vercel preview falha | 🟡 | 🟡 | 4 PRs = 4 previews, retry-able |
| Stripe test mode webhook local | 🟡 | 🟡 | Stripe CLI + ngrok ou mock endpoint |

---

## Dependency Graph

```
W30 (em fechamento)
  ├── W30-1 TSC ✅ committed
  ├── W30-2 Market ✅ committed
  ├── W30-3 UX ✅ committed
  ├── W30-4 Community ✅ committed
  ├── W30-5 AI Personality 🟡 untracked → W31-3 commit + impl
  ├── W30-6 Stripe 🔴 missing → W31-1 close
  ├── W30-7 Smart Notifications 🟡 untracked → W31-2 commit + impl
  └── W30-8 (?) ❓ unknown → investigar antes W31

W31 (5-7 dias úteis)
  ├── W31-1 Stripe (no deps, CRITICAL)
  ├── W31-2 Smart Notif UI (depends W30-7 untracked + src/lib/notifications)
  ├── W31-3 Akasha Principles (depends W30-5 untracked + src/lib/ai/akasha-principles.ts)
  ├── W31-4 Community Engagement (depends W30-4 committed + W29 sequence)
  ├── W31-5 Commit untracked docs (no deps, housekeeping)
  ├── W31-6 UX P0 Polish (depends UX-RESEARCH-W30.md)
  └── W31-7 TSC/Lint (no deps, but consumes W31-1 to W31-6 outputs)
  ↓ (when all 7 W31 done)
W32 (2-3 dias úteis)
  ├── W32-1 Final Validation (depends on W31-7 TSC=0)
  ├── W32-2 Smoke Test (depends on W31-1 to W31-4 deployed)
  ├── W32-3 Push Strategy (depends on W32-1 PASS)
  └── W32-4 Report (depends on W32-1, W32-2, W32-3)
```

## Top Features — Community Engagement (W30-4 baseline)

ICE score = Impact × Confidence × Ease / 3 (max 10)

| # | Feature | Impact | Confidence | Ease | ICE | Status |
|---:|---|:---:|:---:|:---:|:---:|---|
| 1 | Onboarding drip (5 emails/14d) | 9 | 9 | 9 | **9.0** | 🟢 W31-4 |
| 2 | Referral loop (7d Pro trial) | 9 | 8 | 7 | **8.0** | 🟢 W31-4 |
| 3 | Daily ritual streak (1/dia) | 8 | 8 | 8 | **8.0** | 🟢 W31-4 |
| 4 | Sacred moments ritual calendar | 8 | 7 | 6 | **7.0** | 🟢 W31-2 |
| 5 | Groups white-glove invite | 7 | 8 | 7 | **7.3** | 🟡 W33 |
| 6 | Mentorship matching (curated) | 9 | 6 | 4 | **6.0** | 🟡 W33 |
| 7 | Comments threading | 6 | 9 | 8 | **7.7** | 🟢 W31-4 partial |
| 8 | Bookmark collections | 6 | 9 | 8 | **7.7** | 🟢 W31-4 partial |
| 9 | Akasha daily card | 8 | 7 | 6 | **7.0** | 🟢 W31-3 partial |
| 10 | NPS micro-survey (in-app) | 6 | 9 | 9 | **8.0** | 🟢 W31-4 partial |

**W31-4 foco:** features 1, 2, 3, 7, 8, 10 (top 6 ICE ≥ 7.7 com ease ≥ 7)

## Estimates Resumidas

| Wave | Trilhas | Owner-time | Calendar |
|---|---|---|---|
| W31 | 7 paralelas | ~32h aggregate | 5-7 dias |
| W32 | 4 sequenciais | ~11h aggregate | 2-3 dias |
| **Total** | **11** | **~43h** | **7-10 dias** |

## Trigger Conditions

### W31 starts when ALL of:
- [x] W30-1 TSC=0 ✅
- [x] W30-4 publicou community engagement ✅
- [x] W30-5 publicou personality matrix ✅ (untracked)
- [ ] **W30-6 Stripe entregue** ← bloqueador restante
- [x] W30-7 prototipou UI notification sacred ✅ (untracked)
- [ ] W30-8 identificado (via spawn logs)

### W32 starts when ALL of:
- [ ] W31-1 a W31-7 ✅ Definition of Done
- [ ] All commits locais com mensagem Conventional Commits
- [ ] DELIVERABLE docs publicados

---

## Wave 30-32 Calendar Visual

```
JUN 30          JUL 1-3         JUL 4-10        JUL 11-13
|----W30 close---|
  W30-5 commit
  W30-7 commit
  W30-6 trigger
                |----W31 (5-7d)----|
                  W31-1 Stripe        ←── CRITICAL PATH
                  W31-2 Notif UI
                  W31-3 Akasha
                  W31-4 Community
                  W31-5 Housekeeping
                  W31-6 UX P0
                  W31-7 TSC/Lint
                                  |----W32 (2-3d)----|
                                    W32-1 Validation
                                    W32-2 Smoke
                                    W32-3 Push 4 PRs
                                    W32-4 Report
                                                  |→BETA LIVE|
```

---

**Coordinator + Ravena · Wave 31-32 PLAN · 2026-06-30**
*Ver `docs/WAVE-30-SUMMARY.md` para contexto completo.*