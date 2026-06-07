# refactor-akasha-v2 — Gap analysis (estado pré-refactor)

> Levantamento do que é B2B/legado a remover. Materializado em 2026-06-06 a partir do estado pré-refactor do repositório.

## Schema (Prisma)

| Model | Status | Ação |
|---|---|---|
| `Operator` | B2B legacy | remover |
| `Client` | B2B legacy | remover |
| `Reading` | B2B legacy | remover |
| `Report` | B2B legacy | remover |
| `OperatorSession` (refresh sessions) | B2B | remover |
| `OperatorMfa` | B2B | remover |
| `OperatorAccountLockout` | B2B | remover |
| `PasswordResetToken` | legado (não-canônico) | remover |
| `SecurityEvent` | legado | remover |
| `UserConsent` | LGPD, B2C | migrar para `User.consentAt` |
| `User`, `BirthChart`, `Subscription`, `CreditEntry`, `Manifesto`, `DailyReading`, `RitualCompletion`, `Consultation`, `ChatMessage`, `GrimoireEntry` | B2C canônico | manter |
| `PushSubscription` (Fase Q) | B2C canônico | manter |

## Migrations (Prisma)

| Migration | Status | Ação |
|---|---|---|
| `20260602000000_init` (com Operator/Client/Reading/Report) | legado | remover |
| `20260602120000_add_operator_sessions` | legado | remover |
| `20260602140000_add_refresh_to_operator_sessions` | legado | remover |
| `20260602160000_add_operator_mfa` | legado | remover |
| `20260602170000_rename_userrole_to_operatorrole` | legado | remover |
| `20260603000000_add_consent_given` | LGPD (User.consentAt) | consolidar em `User` |
| `20260603000000_add_operator_account_lockout` | legado | remover |
| `20260603090000_add_security_events` | legado | remover |
| `20260603090001_add_password_reset_tokens` | legado | remover |
| `20260603091000_add_client_birth_timezone` | legado | remover |
| `20260604000000_add_reading_indexes` | legado | remover |
| `20260604000000_add_security_event_values` | legado | remover |
| `20260605000000_fase_c_b2c_models` | parcial B2C | consolidar no init |
| `20260606000000_grimoire_embedding` | B2C | consolidar no init |

## Rotas (App Router)

| Path | Status | Ação |
|---|---|---|
| `src/app/api/operator/**` (14 rotas) | B2B | remover |
| `src/app/api/admin/audit-events` | B2B | remover |
| `src/app/api/admin/dashboard` | B2B | remover |
| `src/app/api/admin/operators/[id]/unlock` | B2B | remover |
| `src/app/api/admin/rate-limit` | B2B | remover |
| `src/app/api/cron/cleanup-tokens` | B2B | remover |
| `src/app/api/privacy/settings` | B2B | remover |
| `src/app/api/recommendations` | B2B (Mesa Real) | remover |
| `src/app/api/webhooks/stripe` | legado (sem público) | remover |
| `src/app/api/akasha/**` (13 rotas) | B2C canônico | refatorar para models canônicos |
| `src/app/api/admin/webhooks/grimoire-sync` | B2C (Fase Q) | refatorar para `GrimoireEntry` |
| `src/app/api/webhooks/akasha-stripe` | B2C (Fase L) | refatorar para `Subscription` |

## Pages (App Router)

| Path | Status | Ação |
|---|---|---|
| `src/app/(auth)/login/page.tsx` | legado (pré-Akasha) | remover |
| `src/app/(auth)/layout.tsx` | legado | remover |
| `src/app/(akasha)/**` | B2C canônico | manter, refatorar para schema canônico |

## Libs

| Path | Status | Ação |
|---|---|---|
| `src/lib/auth/operator-*` (jwt, mfa, session, sessions, totp, guard) | B2B | remover |
| `src/lib/auth/account-lockout.ts` | B2B | remover |
| `src/lib/auth/audit-service.ts` | B2B | remover |
| `src/lib/auth/password-reset.ts` | legado | remover |
| `src/lib/auth/rate-limit.ts` | B2B | remover |
| `src/lib/lenormand/*` (mesa-real, mesa-real-data, mesa-real-types) | Mesa Real | remover |
| `src/lib/pdf/dossier-pdf.ts`, `src/lib/pdf/gerarRelatorio.ts` | Mesa Real | remover |
| `src/lib/ai/dossier/*` (consult-context, hologram-prompt-builder, oracle-prompt-builder) | B2B | remover |
| `src/lib/credits/service.ts` | B2B | remover |
| `src/lib/db/{client,consultation,llm-settings,reading}-actions.ts` | B2B | remover |
| `src/lib/divination/house-delegation.ts`, `house-types.ts` | legado | remover |
| `src/lib/constants/lenormand-cards.ts` | Mesa Real | remover |
| `src/lib/auth/akasha-guard.ts`, `akasha-jwt.ts`, `akasha-session.ts` | B2C canônico | manter (renomear helpers se necessário) |

## Components

| Path | Status | Ação |
|---|---|---|
| `src/components/ui/client-search-combobox.tsx` | B2B | remover |
| `src/components/akasha/ManifestoPDF.tsx` | B2C (Fase P) | manter |

## Scripts

| Path | Status | Ação |
|---|---|---|
| `scripts/find-operators.ts` | B2B | remover |
| `scripts/cleanup-tokens.ts` | B2B | remover |
| `scripts/test-llm-settings.ts` | B2B | remover |
| `scripts/test-settings.mjs` | B2B | remover |

## Tests

| Path | Status | Ação |
|---|---|---|
| `tests/api/operator-*.test.ts` (8) | B2B | remover |
| `tests/api/mesa-real-*.test.ts` (5) | Mesa Real | remover |
| `tests/api/consult.test.ts`, `interpret-aspect.test.ts` | B2B | remover |
| `tests/cockpit/**` (7) | B2B | remover |
| `tests/components/operator/**` (2) | B2B | remover |
| `tests/e2e/cockpit-flows` | B2B | remover |
| `tests/integration/cockpit-*`, `mesa-real-*`, `forgot-password` | B2B | remover |
| `tests/lib/auth/operator-*` (7) | B2B | remover |
| `tests/lib/ai/{dossier,oracle-prompt-builder,theme-router,...}` | B2B | remover |
| `tests/lib/lenormand/*`, `tests/lib/mesa-real/**` | Mesa Real | remover |
| `tests/lib/divination/*` (3) | legado | remover |
| `tests/lib/credits/*` | B2B | remover |
| `tests/lib/db/{consultation,reading}-actions` | B2B | remover |
| `tests/api/admin/grimoire-sync.test.ts` | B2C canônico | manter, atualizar para `GrimoireEntry` |
| `tests/api/akasha/**` | B2C canônico | manter/adicionar |

## Docs

| Path | Status | Ação |
|---|---|---|
| `docs/03_architecture-spec.md` | menciona `legacy-cockpit` | reescrever |
| `docs/04_data-model.md` | menciona Operator/Client/Reading | alinhar ao canônico |
| `docs/AUTH-AUDIT.md` | menções B2B | reescrever |
| `docs/MIGRATIONS.md` | menções B2B | reescrever |
| `docs/22_observabilidade-operacao.md` | menções B2B | reescrever |

## Middleware

| Arquivo | Status | Ação |
|---|---|---|
| `middleware.ts` | allowlist B2B (`/cockpit`, `/api/operator`, `/api/mesa-real`, `/api/consult`) | remover allowlist, manter rate-limit/CORS/headers |
