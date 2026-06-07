# refactor-akasha-v2 — Checklist de verificação

> Verificação final pós-refactor. Materializado em 2026-06-06 a partir da auditoria pré-push.

## A. Schema & migrations

- [x] `prisma/schema.prisma` contém **apenas** os 10 models canônicos B2C + `PushSubscription` (Fase Q) + 4 enums
- [x] Nenhum model B2B (`Operator`, `Client`, `Reading`, `Report`)
- [x] `npx prisma validate` exit 0
- [x] `npx prisma generate` exit 0
- [x] Migrations: apenas `20260606000000_init_akasha_v2` + `20260606000001_add_user_consent_at` + `20260606000010_push_subscriptions` (16 migrations legadas removidas)
- [x] Migration init contém `CREATE EXTENSION IF NOT EXISTS "vector"` (pgvector)
- [x] Migration init contém índice `grimoire_embedding_idx` com `ivfflat` + `vector_cosine_ops`
- [x] `prisma/seed.ts` cria apenas o admin canônico (`gabriel@cabaladoscaminhos.com`) com `SEED_ADMIN_PASSWORD` + `bcrypt(..., 12)`

## B. Código

- [x] 14 rotas `src/app/api/operator/**` removidas
- [x] 4 rotas `src/app/api/admin/{operators,audit-events,dashboard,rate-limit}` removidas
- [x] `src/app/api/cron/cleanup-tokens`, `privacy/settings`, `recommendations`, `webhooks/stripe` removidas
- [x] `src/app/(auth)/**` (login legado) removido
- [x] Libs `src/lib/auth/operator-*`, `account-lockout`, `audit-service`, `password-reset`, `rate-limit` removidas
- [x] Libs `src/lib/lenormand/*`, `src/lib/pdf/dossier-pdf.ts`, `src/lib/pdf/gerarRelatorio.ts` removidas
- [x] Libs `src/lib/ai/dossier/*`, `src/lib/credits/service.ts`, `src/lib/db/{client,consultation,llm-settings,reading}-actions.ts` removidas
- [x] Libs `src/lib/divination/house-{delegation,types}.ts`, `src/lib/constants/lenormand-cards.ts` removidas
- [x] Component `src/components/ui/client-search-combobox.tsx` removido
- [x] Scripts `scripts/{cleanup-tokens,find-operators,test-llm-settings,test-settings}.ts/mjs` removidos
- [x] 6 migrations legadas `prisma/migrations/2026060[2-5]*/**` removidas
- [x] Middleware `middleware.ts` sem allowlist B2B (sem `/cockpit`, sem `/api/operator`, sem `/api/mesa-real`)
- [x] 14 rotas `src/app/api/akasha/**` usam apenas models canônicos (User/BirthChart/Subscription/CreditEntry/Manifesto/DailyReading/Consultation/ChatMessage) sem prefixo `Akasha*`
- [x] 0 referências a `prisma.akashaUser`, `prisma.akashaReading`, `prisma.akashaSubscription`, `prisma.akashaClient`, `prisma.akashaOperator` em `src/`

## C. Tests

- [x] 8 testes `tests/api/operator-*.test.ts` removidos
- [x] 5 testes `tests/api/mesa-real-*.test.ts` removidos
- [x] `tests/api/consult.test.ts`, `interpret-aspect.test.ts` removidos
- [x] 7 testes `tests/cockpit/**` removidos
- [x] 2 testes `tests/components/operator/**` removidos
- [x] Testes `tests/integration/{cockpit-*, mesa-real-*, forgot-password}` removidos
- [x] 7 testes `tests/lib/auth/operator-*` removidos
- [x] Testes `tests/lib/ai/{dossier,oracle-prompt-builder,theme-router,...}` removidos
- [x] `tests/lib/lenormand/*`, `tests/lib/mesa-real/**` removidos
- [x] 3 testes `tests/lib/divination/*` removidos
- [x] `tests/lib/credits/*`, `tests/lib/db/{consultation,reading}-actions` removidos
- [x] 22 testes novos cobrindo APIs canônicas (akasha, grimoire, PWA, push, i18n)

## D. Docs

- [x] `docs/03_architecture-spec.md` sem menção a `cockpit|legacy-cockpit|operator|mesa.real|quarentena|legado|b2b`
- [x] `docs/04_data-model.md` sem menção a `cockpit|legacy-cockpit|operator|mesa.real|quarentena|legado|b2b`
- [x] `docs/AUTH-AUDIT.md` sem menção a `cockpit|legacy-cockpit|operator|mesa.real|quarentena|legado|b2b`
- [x] `docs/MIGRATIONS.md` sem menção a `cockpit|legacy-cockpit|operator|mesa.real|quarentena|legado|b2b`
- [x] `docs/22_observabilidade-operacao.md` sem menção a `cockpit|legacy-cockpit|operator|mesa.real|quarentena|legado|b2b`

## E. Quality gates (auditados pós-push)

- [x] `npx prisma validate` → "schema is valid 🚀"
- [x] `npx prisma generate` → "Generated Prisma Client (v7.8.0)"
- [x] `npx tsc --noEmit` → exit 0
- [x] `npm run test:run` → **8113 passed, 0 failed**, 26 skipped (191 arquivos)
- [x] `npm run build` → exit 0; rotas geradas incluem apenas `/api/akasha/*`, `/api/admin/webhooks/grimoire-sync`, `/api/health/*`, `/api/search/*`, `/api/security/*`, `/api/webhooks/akasha-stripe`

## F. Auditoria pré-push (2-stage review)

- [x] **Spec compliance reviewer** → ✅ APPROVED (7/7 requisitos canônicos atendidos)
- [x] **Code quality reviewer (1º round)** → NEEDS_FIXES (1 CRITICAL + 3 HIGH + 3 MEDIUM + 3 LOW)
- [x] **Fixes aplicados** em `4b66fcd5 chore(cleanup)` + `5dbf6e94 fix(grimoire)`:
  - CRITICAL: `grimoire_entries` → `grimoire` em `src/lib/grimoire/sync.ts:146`
  - HIGH: comentário stale em `src/lib/security/ip-hash.ts`
  - HIGH: comentário stale em `src/app/api/akasha/consult/route.ts`
  - HIGH: comentário enganoso em `src/lib/grimoire/types.ts`
- [x] **Code quality reviewer (2º round)** → ✅ APPROVED
- [x] **LOW fix adicional** em `b0e5b9b fix(grimoire): InputJsonValue no create branch` (não-bloqueante, mas limpa o `as any`)

## G. Git

- [x] Branch `refactor/akasha-v2` pushada para `origin` (SHA `5dbf6e94`)
- [x] 15 commits granulares (feat/refactor/chore/docs/test)
- [x] Working tree limpo (`git status --short` retorna vazio)
- [x] PR #4 aberto: https://github.com/Akasha-0/cabaladoscaminhos/pull/4

## H. Follow-up não-bloqueante (documentado no PR)

- `src/lib/i18n/config.ts`: módulo stub sem consumidores (decisão: manter para Fase K)
- `src/app/(akasha)/onboarding`: campo `intention` ainda não é serializado (decisão de UX)
- LOWs do code review (typings `as any` no create branch — corrigido, casts em testes — pendente)

## I. Risk

- **HIGH** — quebra contrato do banco. Migração destrutiva. Backup pré-deploy obrigatório em qualquer ambiente com schema legado.
- **Médio** — Service Worker (`public/sw.js`) precisa revisão em produção para invalidação de cache.

## Resultado final

**Status: ✅ SPEC 100% ENTREGUE E VERIFICADA**

Spec materializada em: `/home/skynet/cabala-dos-caminhos/.trae/specs/refactor-akasha-v2/`
PR: https://github.com/Akasha-0/cabaladoscaminhos/pull/4
Data: 2026-06-06
