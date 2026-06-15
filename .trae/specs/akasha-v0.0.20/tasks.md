# Akasha v0.0.20 — Tarefas

## WS-1: Daily Push Idempotency (F-238)

### 1.1 Schema migration
- [ ] Criar `apps/akasha-portal/prisma/migrations/20260615000000_push_last_pushed_at/migration.sql`
- [ ] Adicionar `lastPushedAt DateTime?` em `pushSubscription`
- [ ] Rodar `prisma migrate dev` local + `prisma generate`
- [ ] Documentar migration em `apps/akasha-portal/prisma/AGENTS.md`

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

---

## WS-2: Timezone-aware cron (F-239)

### 2.1 Schema migration
- [ ] Criar migration `20260615000000_user_timezone`
- [ ] Adicionar `timezone String @default("America/Sao_Paulo")` em `User`
- [ ] Doc update em `apps/akasha-portal/prisma/AGENTS.md`

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
  - SP user em SP 7am: included
  - NY user em SP 7am: excluded (NY é 3h atrás = 4am)
  - Tokyo user em SP 7am: included (Tokyo é +12h = 19pm, próximo push será 7am Tokyo)

### 2.5 Verification
- [ ] Typecheck + tests verdes
- [ ] Manual: deploy, triggar cron, verificar logs

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

### 5.1 synthesis-engine tests
- [ ] `tests/lib/application/akasha/synthesis-engine.test.ts`:
  - `assessAreaFrequency`: testa shadow/gift/siddhi derivation
  - `deriveDailyDecision`: testa estratégia + authority
  - `deriveSexualArchetype`: testa 11 arquétipos
  - `buildAkashaSynthesis`: integration test (todos 5 pilares)
  - `deriveChainOfReasoning`: F-230 chain of thought

### 5.2 Goals
- [ ] Coverage de synthesis-engine.ts: 0% → 30%+
- [ ] 5+ test files
- [ ] 30+ test cases

### 5.3 Verification
- [ ] `pnpm test:run synthesis-engine` exit 0
- [ ] Coverage report (se instrumented)

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
