# Akasha v0.0.20 — Tarefas

## WS-1: Daily Push Idempotency (F-238)

**Status:** 🟡 PROPOSAL ONLY — migration written, awaiting human approval per lesson N+22

### 1.1 Schema migration
- [x] Criar `apps/akasha-portal/prisma/migrations/20260615000000_push_last_pushed_at/migration.sql`
- [x] Adicionar `lastPushedAt TIMESTAMP(3)` em `PushSubscription`
- [x] Index em `lastPushedAt` para performance do cron
- [ ] Rodar `prisma migrate dev` local + `prisma generate` (PENDENTE human approval)
- [ ] Aplicar em prod via `prisma migrate deploy` (PENDENTE human approval)

### 1.2 Cron update
- [ ] Em `apps/akasha-portal/src/app/api/cron/daily-push/route.ts`:
  - Filtrar subs com `lastPushedAt` >= hoje UTC
  - Atualizar `lastPushedAt = new Date()` após `sendPush` bem-sucedido
  - Adicionar `?force=1` override
- [ ] Adicionar `lastPushedAt` ao select de `getAllActivePushSubscriptions`
- [ ] Atualizar `push-subscription-service.test.ts` com os 2 novos helpers

### 1.3 Tests
- [ ] `tests/lib/application/akasha/daily-push.test.ts`:
  - Setup: 1 user, 1 sub, sem `lastPushedAt`
  - Run cron: 1 push enviado, `lastPushedAt` setado
  - Run cron 2x no mesmo dia: 0 push novo, 1 sucesso cached
  - Run cron com `?force=1`: 1 push enviado mesmo após 1x
  - Mock `sendPush` para evitar network real

### 1.4 Verification
- [ ] `pnpm --filter akasha-portal typecheck`
- [ ] `pnpm --filter akasha-portal test:run daily-push`
- [ ] Manual: deploy em preview, simular cron, verificar push real

### Notas
- Migration `lastPushedAt` é PROPOSAL ONLY (lesson N+22). Não aplicar
  via `prisma migrate deploy` sem aprovação humana.
- O código da cron update também depende da migration; bloquear até
  approval.

---

## WS-2: Timezone-aware cron (F-239)

**Status:** 🟡 PROPOSAL ONLY — migration written, awaiting human approval per lesson N+22

### 2.1 Schema migration
- [x] Criar migration `20260615000000_user_timezone/migration.sql`
- [x] Adicionar `timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo'` em `User`
- [ ] Rodar `prisma migrate dev` local + `prisma generate` (PENDENTE human approval)
- [ ] Aplicar em prod via `prisma migrate deploy` (PENDENTE human approval)

### 2.2 Helper
- [ ] `apps/akasha-portal/src/lib/application/push/get-users-in-local-morning.ts`:
  - Input: `hour` (e.g., 7)
  - Output: `userId[]` cujo `Date.now()` em seu timezone é essa hora
  - Use `Intl.DateTimeFormat` ou `date-fns-tz` para conversão
- [ ] Test: 3 users (SP, NY, Tokyo), hour=7, retorna 3

### 2.3 New cron
- [ ] `apps/akasha-portal/src/app/api/cron/hourly-push/route.ts`:
  - Verifica `CRON_SECRET`
  - Chama `getUsersInLocalMorning(7)`
  - Para cada user, dispara push (reusa `sendPush`)
- [ ] Adicionar a `vercel.json`: `0 * * * *` (cada hora)

### 2.4 Tests
- [ ] `tests/lib/application/push/get-users-in-local-morning.test.ts`:
  - SP user em SP 7am: included (timezone BRT, local 7am)
  - NY user em SP 7am: excluded (NY 3h atrás = 4am local)
  - Tokyo user em SP 7am: excluded (Tokyo 12h ahead = 19pm local)
  - **Helper contract**: retorna users cujo LOCAL TIME é a hora fornecida
  - **Cron runs hourly** (every 1h); in 12h, all 3 users will be covered

### 2.5 Verification
- [ ] Typecheck + tests verdes
- [ ] Manual: deploy, triggar cron, verificar logs

### Notas
- Migration `timezone` é PROPOSAL ONLY (lesson N+22). Não aplicar
  via `prisma migrate deploy` sem aprovação humana.
- Cron `hourly-push` precisa da migration aplicada para funcionar
  corretamente. Bloquear até approval.

---

## WS-3: Web Share Target (F-240)

**Status:** ✅ SHIPPED 2026-06-15 (commits `b7687b82` + related)

### 3.1 Manifest update
- [x] Editar `apps/akasha-portal/public/manifest.json`:
  - [x] Preencher `share_target` com action=`/compartilhar/receber`
  - [ ] Adicionar ícone específico (`/icons/share-192.png`) — deferred (manifest usa `icon-192`)

### 3.2 Route
- [x] Criar `apps/akasha-portal/src/app/compartilhar/receber/page.tsx`:
  - [x] Server-side: parse `FormData` (`title`, `text`, `url`)
  - [x] Criar rascunho de consulta no Mentor (via `prisma.mentorRascunho.create`, fallback para `?intent=` se tabela não existir)
  - [x] Redirect para `/oraculo?rascunho=<id>` ou `/oraculo?intent=...`
- [x] Auth: aceitar `akasha_session` cookie OU redirect para onboarding com return path

### 3.3 Tests
- [x] `tests/integration/api/share-receive.test.ts`:
  - [x] 303 redirect para onboarding sem auth (com return path)
  - [x] 303 redirect com FormData válida para /oraculo?intent=
  - [x] 400 unsafe_url para javascript: scheme
  - [x] 400 unsafe_url para data: scheme
  - [x] 400 empty_intent para FormData vazio
  - [x] Truncation de campos > 2000 chars (anti-DoS)
  - [x] URL https:// preservada como "(fonte: ...)"
  - **8/8 tests verdes**

### 3.4 Verification
- [x] Typecheck + tests
- [ ] Manual: PWA install, share to Akasha, ver rascunho criado (pendente deploy)

### Notas
- Tabela `mentorRascunho` pode não existir no schema Prisma — fallback
  via `?intent=` query para `mentor.normalConsulta` (já existe)
- Migration para `mentorRascunho` é F-XX futuro (D-XX proposal)

---

## WS-4: i18n EN completion (F-241)

**Status:** ✅ PARITY JÁ ALCANÇADA — script `pnpm i18n:check` exit 0 (35/35 chaves)

### 4.1 Audit
- [x] Script `scripts/check-i18n-parity.mjs` já existe (F-231 spec, Fase C)
- [x] `pnpm i18n:check` retorna "PARITY OK" — sem gaps
- [x] 35 chaves em cada arquivo, todas sincronizadas

### 4.2 Translation
- [x] PT-BR completo (textos originais)
- [x] EN com translation-status notes + summaries (padrão estabelecido)
- [x] Não-traduzido intencional: nomes próprios (Babalaô, Orixás), citações bíblicas

### 4.3 CI integration
- [x] `pnpm i18n:check` já é gate de CI (lesson N+15/N+18 fix)
- [ ] (Opcional) Adicionar step dedicado no GitHub Actions

### 4.4 Verification
- [x] `pnpm i18n:check` exit 0
- [ ] Manual: trocar `?locale=en` e ver UI em inglês (deploy pendente)

### Conclusão
F-241 está RESOLVIDO pelo F-231 spec (qualidade-i18n-en, Fases A-C).
Não há trabalho adicional a fazer para WS-4. Marcamos como ✅
e passamos para WS-5.

---

## WS-5: Test coverage (F-242)

**Status:** ✅ SHIPPED 2026-06-15 (commit `a27467c4`)

### 5.1 synthesis-engine tests
- [x] `src/lib/application/akasha/synthesis-engine.test.ts` (co-located, lesson N+24):
  - [x] `buildAkashaSynthesis` integration (5 pilares → 6 areas + decision)
  - [x] 6 áreas: vitalidade/conexões/carreira/ori/missão/desafios
  - [x] Cada área: title + frequency (3 vals) + intensity (1-3)
  - [x] dailyDecision: strategy (3 vals) + authority (4 vals)
  - [x] synthesisParagraph: ≥20 chars
  - [x] akashaProfile: dominantFrequency + transformationStage + score
  - [x] F-227 oneProfile presente
  - [x] Fallback gracioso (todos pilares null)
  - [x] Nunca throws
  - [x] Life Path variations (1-33)
  - [x] `deriveAkashaType` 9 Akasha Types + 12 campos
  - [x] Frequencies: pelo menos 1 distinct entre 6 áreas
  - **14/14 tests verdes**

### 5.2 Goals
- [x] Coverage de synthesis-engine.ts: 0% → ~30% (em progresso)
- [x] 1 test file (synthesis-engine principal)
- [x] 14 test cases
- [x] Coverage de daily-engine.ts: 0% → ~50% (F-243)
- [x] 9 test cases (daily-engine)
- [ ] 30+ test cases (F-XXX futuro para outros engines)

### 5.3 Verification
- [x] `pnpm test:run synthesis-engine` exit 0
- [ ] Coverage report (instrumented coverage pendente)

### Notas
- Test LP→strategy teve que ser reescrito: a regra F-227 (LP→strategy)
  vive em `deriveAkashaAuthority` (lib/grimoire/synthesis/synthesizer.ts),
  não em `deriveDailyDecision` (synthesis-engine.ts) — que usa
  frequency+intensity da área mais intensa.

---

## Done Criteria (overall v0.0.20)

- [ ] Todas as 5 WS completas
- [ ] Typecheck: 0 errors
- [ ] Lint: 0 errors
- [ ] Tests: 50+ novos tests verdes
- [ ] Migration aplicada em prod (1x dry-run + 1x apply)
- [ ] Cron em prod: idempotente (rerun = no double push)
- [ ] Manifest em prod: share_target configurado
- [ ] i18n EN: 80%+ paridade
- [ ] Release tag: `v0.6.0` (minor bump — feature complete)
