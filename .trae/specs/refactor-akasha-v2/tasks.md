# refactor-akasha-v2 — Tasks

> Plano de execução em 7 tasks independentes, cada uma com critério verificável.

## Task 1 — Auditoria / gap list

**Output:** [`gap.md`](./gap.md) com a lista do que é B2B/legado a remover (arquivos, models, rotas, scripts, migrations).

**Verify:** `gap.md` cobre schema, rotas, libs, scripts, docs e tests.

## Task 2 — Schema canônico + 4 enums

**Output:** [`prisma/schema.prisma`](../../../prisma/schema.prisma) reescrito com 10 models canônicos (User/BirthChart/Subscription/CreditEntry/Manifesto/DailyReading/RitualCompletion/Consultation/ChatMessage/GrimoireEntry) + 4 enums (UserRole/Plan/SubStatus/ChatRole) + `PushSubscription` (Fase Q).

**Verify:** `npx prisma validate` exit 0; `grep -E "model (Operator|Client|Reading|Report)\b" prisma/schema.prisma` retorna 0 matches.

## Task 3 — Migrations destrutivas + seed

**Output:**
- `prisma/migrations/20260606000000_init_akasha_v2/migration.sql` — núcleo + pgvector + ivfflat no embedding do grimoire.
- `prisma/migrations/20260606000001_add_user_consent_at/migration.sql` — LGPD.
- `prisma/migrations/20260606000010_push_subscriptions/migration.sql` — Fase Q.
- [`prisma/seed.ts`](../../../prisma/seed.ts) reescrito: cria apenas o admin canônico (`gabriel@cabaladoscaminhos.com`) com senha via `SEED_ADMIN_PASSWORD` + `bcrypt(..., 12)`.

**Verify:**
- `ls prisma/migrations/2026060[2-5]*` retorna 0 (histórico legado apagado).
- `grep -E "CREATE EXTENSION.*vector" prisma/migrations/20260606000000_init_akasha_v2/migration.sql` retorna 1 match.
- `grep -E "ivfflat.*vector_cosine_ops" prisma/migrations/20260606000000_init_akasha_v2/migration.sql` retorna 1 match.

## Task 4 — Refatorar código para canônicos + remover B2B

**Output:**
- `src/app/api/akasha/**` operando apenas com models canônicos (sem prefixo `Akasha*` em queries Prisma).
- Remoção de:
  - 14 rotas `src/app/api/operator/**`
  - 4 rotas `src/app/api/admin/{operators,audit-events,dashboard,rate-limit}/**`
  - Páginas `src/app/(auth)/**` (login legado)
  - Libs `src/lib/auth/operator-*`, `src/lib/lenormand/*`, `src/lib/pdf/dossier-pdf.ts`, `src/lib/pdf/gerarRelatorio.ts`, `src/lib/ai/dossier/*`
  - Scripts `scripts/{cleanup-tokens,find-operators,test-llm-settings,test-settings}.ts/mjs`
  - Component `src/components/ui/client-search-combobox.tsx`
  - 6 migrations legadas `prisma/migrations/2026060[2-5]*/**`
- `middleware.ts` sem allowlist B2B (sem `/cockpit`, sem `/api/operator`).

**Verify:**
- `find src/app/api/operator -type f` retorna 0 matches.
- `grep -rE "prisma\.(akashaUser|akashaReading|akashaSubscription|akashaClient|akashaOperator)" src/` retorna 0 matches.
- `npm run build` exit 0; a lista de rotas geradas não contém `/api/operator/*` ou `/cockpit/*`.

## Task 5 — Tests/scripts

**Output:** 118 arquivos de teste B2B removidos (operator-*, mesa-real-*, cockpit-*, lenormand-*). 22 testes novos cobrindo APIs canônicas.

**Verify:** `git show --stat main..HEAD` mostra ~100 deleções em `tests/` cobrindo exatamente o que foi removido em `src/`.

## Task 6 — Docs sem "quarentena/legado"

**Output:** Reescrita de:
- [`docs/03_architecture-spec.md`](../../../docs/03_architecture-spec.md)
- [`docs/04_data-model.md`](../../../docs/04_data-model.md)
- [`docs/AUTH-AUDIT.md`](../../../docs/AUTH-AUDIT.md)
- [`docs/MIGRATIONS.md`](../../../docs/MIGRATIONS.md)
- [`docs/22_observabilidade-operacao.md`](../../../docs/22_observabilidade-operacao.md)

**Verify:** `grep -iE "cockpit|legacy-cockpit|operator|mesa.real|quarentena|legado|b2b" docs/03_architecture-spec.md docs/04_data-model.md docs/AUTH-AUDIT.md docs/MIGRATIONS.md` retorna 0 matches.

## Task 7 — Quality gates

**Verify:**
- `npx prisma validate` → "schema is valid 🚀" (exit 0)
- `npx prisma generate` → "Generated Prisma Client" (exit 0)
- `npx tsc --noEmit` → exit 0
- `npm run test:run` → 0 failed (verificar ≥ 8000 passing)
- `npm run build` → exit 0; lista de rotas inclui apenas `/api/akasha/*`, `/api/admin/webhooks/*`, `/api/health/*`, `/api/search/*`, `/api/security/*`, `/api/webhooks/akasha-stripe`.

## Resumo da execução

| Task | Commit |
|---|---|
| 1 | `82010923 chore(code): purge completo de B2B/legado` (parcial) + `23b6895b chore(specs+deploy+ops)` |
| 2 | `58d9d3d4 refactor(prisma): purge B2B legacy + consolidar schema canônico` |
| 3 | `58d9d3d4 refactor(prisma)` (mesmo commit — schema + migrations + seed) |
| 4 | `ac7db90d refactor(akasha)`, `ad786ef0 chore(config)`, `c18ff0f3 feat(akasha/pages)`, `1f75eeac feat(pwa)`, `9cf3f0c2 feat(akasha)`, `afed2aed feat(grimoire)` |
| 5 | `384c73dd chore(tests)`, `350a1c51 test(akasha)` |
| 6 | `220e61cd docs(03,04,AUTH-AUDIT,MIGRATIONS)` |
| 7 | `4b66fcd5 chore(cleanup)`, `5dbf6e94 fix(grimoire)` + auditoria pré-push |
