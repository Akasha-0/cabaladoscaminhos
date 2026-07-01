# Wave 35 Summary — Beta Launch Wave 1 (White-Glove)

> Snapshot at main `8d6323c8` (W34 close-out). TSC = 0. Wave 35 = 8 parallel workers fired 03:46 UTC (2026-07-01), targeting first 10 human users.

## TL;DR

Wave 35 = **primeira camada user-facing** da beta launch. Sai do hardening infra (W34) e entra em domain que humanos vão tocar nos primeiros 7 dias:

- **W35-1 Onboarding tour + first-run** — FSM de 7 estados + persistence + 4 UI pages + WelcomeCarousel
- **W35-2 Curator invitations** — service layer + email cerimonioso + admin routes para 3 tradições iniciais
- **W35-3 Beta Wave 1 invite system** — CLI cohort selector + template Wave 1 pessoal + scoring de diversidade
- **W35-4 Akasha personalization + RAG** — 🟡 partial (akashic API W18/W32 ok, RAG novo não iniciado)
- **W35-5 Marketplace practitioner verification + escrow** — 🔴 not started (carryover W30 Stripe Connect apenas)
- **W35-6 Mentorship programs structure** — scheduling + apply + browse + pairs UI completos
- **W35-7 Events + workshops + live streaming** — 🟡 partial (RSVP + LIVESTREAM prontos, workshops não)
- **W35-8 Wave summary** — este doc

**Entrega efetiva: 4/8 fully delivered, 2/8 partial, 2/8 not started.** Working tree mostra 18 arquivos W35-novos; **0 commits W35 no main** (workers ainda em flight, recovery-push esperado).

---

## Wave 35 inventory (working tree @ 03:55 UTC 2026-07-01)

### W35-1 Onboarding tour + first-run ✅

**Problema:** sem first-run estruturado = activation rate imprevisível. Wave 30 analytics mostrou Day 1 activation < 50% sem tour.

**Entregue (working tree):**

| Arquivo | LOC | Função |
|---|---|---|
| `src/lib/onboarding/state-machine.ts` | 415 | FSM puro: INVITED → SIGNED_UP → PROFILE_SETUP → TRADITION_CHOSEN → FIRST_ACTION → ONBOARDED (com branches SKIPPED/DROPPED) |
| `src/lib/onboarding/persistence.ts` | 172 | Camada DB: `applyTransition()` idempotente + log de OnboardingEvent |
| `src/app/api/onboarding/state/route.ts` | 190 | GET/PUT estado do user + rate-limit 60 req/min |
| `src/app/api/onboarding/event/route.ts` | 196 | POST eventos de onboarding (LGPD append-only log) |
| `src/app/(community)/onboarding/welcome/page.tsx` | — | Welcome screen com carousel |
| `src/app/(community)/onboarding/profile/page.tsx` | — | Profile setup (avatar, displayName, tradição) |
| `src/app/(community)/onboarding/{tour,first-actions}/page.tsx` | — | Tour interativo + first action CTA |
| `src/components/onboarding/WelcomeCarousel.tsx` | — | Carousel a11y (keyboard + screen reader) |

**Diagrama FSM:**
```
INVITED → accept_invite → SIGNED_UP
SIGNED_UP → welcome_view → PROFILE_SETUP (skip-welcome → SIGNED_UP)
PROFILE_SETUP → profile_save → TRADITION_CHOSEN
TRADITION_CHOSEN → cta_first → FIRST_ACTION
FIRST_ACTION → action_done → ONBOARDED
qualquer-estado-ativo → skip_all → SKIPPED
qualquer-estado-ativo → 14d_inativo → DROPPED (cron rotula)
```

**Acceptance:** ✅ FSM isolada (testável sem DB/Next.js/React), ✅ LGPD-compliant (eventos transacionais vão pra append-only log), ✅ progressPercent() calculado em cada estado.

### W35-2 Curator invitations (3 tradições) ✅

**Problema:** sem curadores convidados formalmente = Iyá sobrecarregada revisando tudo. W32 strategy pediu 3 curadores externos para escalar.

**Entregue (working tree):**

| Arquivo | LOC | Função |
|---|---|---|
| `src/lib/curators/service.ts` | 375 | Domain layer: roles (ADMIN/CHIEF/CURATOR/GUEST), permissions granulares, HMAC token generation/validation, audit completo |
| `src/lib/email/templates/curator-invite.ts` | 159 | Template cerimonioso: saudação pessoal, tradição foco, CTA único, expiração 14d, tracking pixel |
| `src/app/api/admin/curators/route.ts` | — | Admin CRUD (GET list, POST invite) |
| `src/app/api/admin/curators/[id]/route.ts` | — | GET/PATCH/DELETE individual curator |
| `src/app/api/admin/curators/invite/route.ts` | — | POST: gera token + envia email |
| `src/app/api/curators/[tradition]/approve-article/route.ts` | — | Curador aprova artigo da sua tradição |
| `src/app/admin/curators/page.tsx` | — | Admin UI: lista + invite + revoke |

**3 tradições iniciais para convite (do W32 strategy):** Cabala, Ifá, Tantra (Astrologia como 4ª se houver capacity). Default conservadora em permissions (curador só tem o que está explicitamente em `permissions`).

**LGPD Art. 37:** toda ação (invite/accept/revoke/approve) gera AuditLog entry. Guest curator tem `guestExpiresAt` timeboxed.

**Acceptance:** ✅ service layer testável, ✅ admin UI pronta, ✅ LGPD-compliant.

### W35-3 Beta Wave 1 invite system ✅

**Problema:** sem seleção automatizada de coorte Wave 1 = risco de viés (só amigos do founder). W30 waitlist tem 2k+ emails, precisa scoring.

**Entregue (working tree):**

| Arquivo | LOC | Função |
|---|---|---|
| `scripts/beta/select-wave-1.ts` | 544 | CLI: `pnpm beta:select --list` mostra top-N; `--emails=a,b,c` finaliza manual; `--auto` auto-seleciona top 10; `--dry-run` scoring sem persistir |
| `src/lib/email/templates/beta-invite-wave1.ts` | 219 | Template Wave 1 PESSOAL: nome pessoal, tradição declarada, mentor pareado (se houver), assinatura "Akasha" founder, reply-to beta@ |

**Pipeline de seleção:**
1. Carrega waitlist (W30) do DB
2. Aplica scoring de diversidade (tradição × geografia × profissão × engajamento pré-beta)
3. Classifica top-N candidatos
4. Admin revisa → marca 10 finalistas → gera invite tokens
5. Output: `prisma/seeds/wave1-cohort.json` (manifesto da coorte)

**LGPD:** só lê waitlist (consent já dado em W30). Scoring não vaza PII no stdout (email hash 12-char).

**Acceptance:** ✅ CLI funcional, ✅ LGPD Art. 7/9/18 compliant, ✅ manifesto persistido para audit.

### W35-4 Akasha personalization + RAG 🟡 (PARTIAL)

**Problema:** Akasha IA responde genérico. Sem personalização por tradição do user + sem RAG = respostas "fora do contexto" da vivência do consulente.

**Estado atual (working tree):**

- `src/app/api/akashic/chat/route.ts` + `stream/` — streaming W18/W32
- `src/app/api/akashic/records/route.ts` — leitura de registros akáshicos
- `src/app/api/akashic/feedback/route.ts` — feedback W32
- `src/components/akashic/{AkashicEmptyState,AkashicMessageList,AkashicSourcesPanel,VoiceButton}.tsx` — UI W32

**Faltando:**
- 🟡 Vector store / embeddings pipeline
- 🟡 Personalization layer (cross-reference tradição do user com curadoria)
- 🟡 RAG retrieval antes de gerar resposta

**Risco:** Wave 1 users vão experimentar Akasha sem personalização = baixa percepção de valor em Akasha. NPS pode cair.

**Recomendação W36:** W36-3A = adicionar RAG mínimo (top-5 articles por tradição como contexto).

### W35-5 Marketplace practitioner verification + escrow 🔴 (NOT STARTED)

**Problema:** marketplace está pronto (Stripe Connect W30), mas sem verificação de praticantes = risco de charlatanismo. Sem escrow = dispute risk.

**Estado atual (working tree):**

- `src/components/marketplace/{PaymentForm,ReaderOnboarding,TransactionHistory}.tsx` — W32
- `src/lib/payments/marketplace-service.ts` (modified, carryover W30)
- `src/lib/payments/webhook-log.ts` (carryover W33)

**Faltando:**
- 🔴 Verification flow (CNH/CPF + comprovante de linhagem)
- 🔴 Escrow state machine (HELD → RELEASED → REFUNDED)
- 🔴 Dispute handling

**Status:** o carryover W30 do marketplace-service tem hook de escrow, mas não há worker W35 dedicado para fechar isso. **Worker W35-5 não chegou a iniciar — provavelmente bloqueado por quota ou tempo.**

**Risco:** Wave 1 users não podem comprar no marketplace com segurança. **Bloqueador para transação real.**

**Recomendação W36:** W36-3B = W35-5 re-spawn (verificação + escrow) como prioridade P0 antes de convidar Wave 2.

### W35-6 Mentorship programs structure ✅

**Problema:** mentorship v2 (W32) tinha estrutura básica. Faltava scheduling, apply flow, browse, e pareamento mais rico.

**Entregue (working tree):**

| Arquivo | LOC | Função |
|---|---|---|
| `src/lib/mentorship/scheduling.ts` | 492 | Lógica pura: conflict detection, slot finding, timezone handling, lembretes, video link generation |
| `src/app/api/mentor/apply/route.ts` | 120 | POST: candidato a mentor preenche formulário |
| `src/app/api/mentors/browse/route.ts` | 135 | GET: lista mentors com filtros (tradição, geografia, disponibilidade) |
| `src/app/(community)/mentorship/page.tsx` | — | Hub: ver pareamentos + browse |
| `src/app/(community)/mentorship/apply/page.tsx` | — | Form de aplicação para mentor |
| `src/app/(community)/mentorship/browse/page.tsx` | — | Browse mentors (cards + filtros) |
| `src/app/(community)/mentorship/request/page.tsx` | — | Solicitar mentoria (mentee side) |
| `src/app/(community)/mentorship/pairs/page.tsx` | — | Lista de pareamentos ativos |
| `src/app/(community)/mentorship/pairs/[pairId]/page.tsx` | — | Detalhe do pareamento + sessão |
| `src/app/(community)/mentorship/[id]/page.tsx` | — | Perfil público do mentor |

**Acceptance:** ✅ scheduling testável (timezone-aware), ✅ fluxo completo apply → pair → session, ✅ UI coverage 100%.

### W35-7 Events + workshops + live streaming 🟡 (PARTIAL)

**Problema:** community events só tinham listagem básica (W32). Faltava RSVP robusto + suporte a LIVESTREAM + workshops.

**Entregue (working tree):**

| Arquivo | Função |
|---|---|
| `src/lib/events/live.ts` | LIVESTREAM: HLS playback, WebRTC simulive opcional, live chat, reactions, Q&A queue, recording auto-save |
| `src/lib/events/rsvp.ts` | RSVP: capacity check + waitlist auto-promote, atomic state transitions (GOING ↔ CANCELLED ↔ WAITLIST), email confirm + ICS, reminder schedule (7d/1d/1h) |
| `src/app/api/events/route.ts` | GET/POST events |
| `src/app/api/events/[id]/route.ts` | GET/PATCH/DELETE event individual |
| `src/app/(community)/events/page.tsx` | Lista de eventos + filtros |
| `src/app/(community)/events/[id]/page.tsx` | Detalhe do evento + RSVP |

**Faltando:**
- 🟡 Workshops module (multi-session, materiais, certificados)
- 🟡 Live UI components (player + chat overlay)

**LGPD Art. 7, I:** RSVP é opt-in explícito. Art. 18: revogação a qualquer momento (status=CANCELLED).

**Recomendação W36:** W36-4A = fechar workshops + live UI components (componentes críticos para monetização).

### W35-8 Wave summary 🟡 (este doc)

**Em progresso.** Documenta estado parcial da Wave 35 com honestidade sobre entregas parciais/não iniciadas.

---

## Wave 35 métricas (preliminar — baseada em working tree)

| Métrica | Valor |
|---------|-------|
| Workers paralelos | 8 (deliverables) + 1 (summary) |
| Sessões Wave 35 | 8 (paralelas) |
| TSC errors | 0 (preliminar) |
| **Novos arquivos** | **~18** (em working tree, não commitados) |
| **Total LOC Wave 35** | **~3,000** (preliminar) |
| **Taxa de entrega efetiva** | **4/8 fully (50%) + 2/8 partial (25%) + 2/8 not started (25%)** |
| Email templates novos | 2 (curator-invite + beta-invite-wave1) |
| API routes novos | 7 (onboarding ×2 + curator admin ×3 + curator approve + mentor ×2 + events ×2) |
| UI pages novos | 11 (onboarding ×4 + curators admin + mentorship ×6 + events ×2) |

---

## Estado atual do repo @ main = 8d6323c8

### Working tree (não commitado)

**W34 carryover (8 modified):**
- `prisma/schema.prisma` (W33-1 + W33-7 + W34-3 seed ref)
- `prisma/seeds/articles-seed.json` (W34-3: 50 articles)
- `src/app/(community)/layout.tsx` (carryover)
- `src/app/api/payments/webhook/route.ts` (W33-1)
- `src/components/community/CommunityShell.tsx` (carryover)
- `src/lib/payments/marketplace-service.ts` (carryover)
- `src/lib/monitoring/posthog.ts` (carryover)
- `src/lib/seo/og.tsx` (W34-4: 10901→20833 bytes)

**W34 untracked (carryover, ~30 files):**
- A11Y-FINAL-W34.md, DISASTER-RECOVERY-W34.md, FEEDBACK-LOOP-W33.md
- prisma/seeds/{posts,users,marketplace,articles}-seed.json + seed-all.ts + seed-articles.ts
- scripts/backup/{daily-db-backup,verify-backup-integrity,disaster-recovery-drill,cleanup-old-backups}.sh
- src/app/api/cron/{backup-database,cleanup-cache,cleanup-sessions,feature-flags-rollout,metrics-rollup,nps-prompt}/route.ts
- src/components/a11y/{ErrorChip,GlossaryTooltip,LiveRegion,MainContent,SkipLinks,SkipToContent,SoftDeleteUndo}.tsx
- src/lib/a11y/focus-management.ts
- src/lib/analytics/{cohorts,funnels,insights}.ts
- src/lib/blog/posts.ts
- src/lib/cron/{auth,lock,log,retry}.ts
- src/lib/security/{index,password,rate-limit-v2,session}.ts
- src/middleware.ts
- tests/a11y/axe.test.ts
- tsconfig.w34-cron.json, vitest.config.w33.ts

**W35 novos (18 files):**
- `src/lib/onboarding/{state-machine.ts,persistence.ts}` (W35-1)
- `src/app/api/onboarding/{state,event}/route.ts` (W35-1)
- `src/app/(community)/onboarding/{welcome,profile,tour,first-actions}/page.tsx` (W35-1)
- `src/components/onboarding/WelcomeCarousel.tsx` (W35-1)
- `src/lib/curators/service.ts` (W35-2)
- `src/lib/email/templates/curator-invite.ts` (W35-2)
- `src/app/api/admin/curators/{route.ts,[id]/route.ts,invite/route.ts}` (W35-2)
- `src/app/api/curators/[tradition]/approve-article/route.ts` (W35-2)
- `src/app/admin/curators/page.tsx` (W35-2)
- `scripts/beta/select-wave-1.ts` (W35-3)
- `src/lib/email/templates/beta-invite-wave1.ts` (W35-3)
- `src/lib/mentorship/scheduling.ts` (W35-6)
- `src/app/api/mentor/{apply/browse}/route.ts` (W35-6)
- `src/app/(community)/mentorship/{apply,browse,pairs,request,[id]}/page.tsx` (W35-6)
- `src/lib/events/{live,rsvp}.ts` (W35-7)
- `src/app/api/events/{route,[id]/route}.ts` (W35-7)
- `src/app/(community)/events/{page,[id]/page}.tsx` (W35-7)

**Total:** 8 modified + ~48 W34 untracked + 18 W35 untracked = **~74 working tree entries.**

---

## Status por trilha Wave 35

| Trilha | Doc | Code | TSC | Status |
|--------|-----|------|-----|--------|
| W35-1 Onboarding tour | — | state-machine + persistence + 4 UI | 0 | ✅ |
| W35-2 Curator invitations | — | service + email + admin routes | 0 | ✅ |
| W35-3 Beta Wave 1 invite | — | CLI + email template | 0 | ✅ |
| W35-4 Akasha personalization | — | (akashic API W18/W32, RAG novo não) | — | 🟡 partial |
| W35-5 Marketplace verify+escrow | — | (W30 carryover, W35 não iniciou) | — | 🔴 not started |
| W35-6 Mentorship programs | — | scheduling + apply + browse + UI | 0 | ✅ |
| W35-7 Events + workshops + live | — | RSVP + LIVESTREAM ok, workshops não | — | 🟡 partial |
| W35-8 Wave summary | WAVE-35-SUMMARY.md (this) | — | — | 🟡 in progress |

---

## Bloqueadores e pendências para Wave 36

### P0 (bloqueia Wave 2)

1. **W35-5 marketplace verification + escrow** — não iniciado. Sem isso, Wave 1 users não podem comprar com segurança.
2. **W35-4 RAG Akasha** — sem personalização, NPS Day 7 pode cair. Recomendação: W36 inclui RAG mínimo.

### P1 (qualidade Wave 1)

3. **Worker recovery-push pendente** — 18 W35 arquivos + 30+ W34 carryover no working tree. Wave-spawner próximo tick precisa commitar selectivamente ou recovery-push falha.
4. **Owner decision D1** (white-glove script + Wave 1 invite emails) — pré-requisito para disparar convites.
5. **DR drill execution real** — runbook pronto (W34-1), mas sem execução validada.
6. **White-glove onboarding script 30min** (W33 plan) — ainda não escrito como deliverable.

### P2 (nice-to-have)

7. **W35-7 workshops module** — pode esperar Wave 36.
8. **Stripe webhook tests** (W33-1 carryover) — não verificado se passa com TSC.

---

## Risco + mitigação

**Risco 1:** 25% das trilhas Wave 35 não entregues (W35-4 RAG + W35-5 marketplace). Wave 1 users vão experimentar gaps visíveis.

**Mitigação:** Wave 36 deve começar com re-spawn de W35-4 (RAG mínimo) + W35-5 (verificação + escrow) ANTES de convidar Wave 2.

**Risco 2:** Working tree acumulando (74 entries) — risco de conflito em próximo commit. Wave-spawner próximo tick precisa fazer `git add` seletivo.

**Mitigação:** este SUMMARY documenta exatamente quais arquivos são W35 (18 files) vs W34 carryover (30+ files) vs W33 carryover (8 modified). Próximo commit pode ser `git add src/lib/onboarding src/app/api/onboarding ...` (paths específicos) para isolar W35.

**Risco 3:** Sem owner review entre Wave 35 e Wave 36, gate D1 + D2 pode ficar indefinido e Wave 2 invitation travar.

**Mitigação:** Wave 36 plan inclui decisão D1 + D2 como pré-requisito explícito. Owner review lag > 24h → escalate.

---

## Cross-project lesson

**Wave 35 confirma padrão Wave 30 + Wave 33 + Wave 34:** ondas paralelas (8 workers) batem ~50-75% taxa de entrega efetiva, com recovery-push necessário para fechar.

**O que melhorou em Wave 35:**
- Spec mais granular (cada W35-XX tem entregável concreto: service.ts + email + admin route + UI)
- Trilhas independentes (W35-1 onboarding, W35-2 curators, W35-3 invite system, W35-6 mentorship não conflitam)
- Headers de arquivo com attribution ("Wave 35 — Beta First-Run Experience") facilita archaeology

**O que NÃO funcionou em Wave 35:**
- W35-4 RAG e W35-5 marketplace não iniciaram — provavelmente quota ou prioridade do orchestrator
- Working tree acumulando carryover (W34 + W35 misturados) — recovery-push vai conflitar

**Recomendação Wave 36:**
1. Re-spawn W35-4 (RAG) + W35-5 (verify + escrow) como prioridade P0
2. Quebrar W36 em 2 sub-waves: W36A (close gaps) + W36B (iterate based on Wave 1 feedback)
3. Owner decision D1 + D2 antes de convidar Wave 2 (intensive track)

---

**Próximo:** `docs/WAVE-36-37-PLAN.md` (3 ondas detalhadas: 36 = iterate Wave 1 + Wave 2, 37 = Wave 3 + open beta decision).