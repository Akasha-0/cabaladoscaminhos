# MIGRATIONS PENDING — Wave 13+14 schema drift

**Status:** `awaiting_human_apply`
**Date:** 2026-06-25
**Branch:** `wave-17.5-schema-drift`
**Worktree:** `/home/skynet/cabala-dos-caminhos-worktrees/wave-17.5`
**Author:** Hermes subagent (wave-17.5-schema-drift)
**Refs:** `.hermes/plans/wave-17-process-2026-06-24.md` §17.5

---

## 1. Contexto

O `schema.prisma` foi modificado em **5 PRs** das Waves 13 e 14 sem que
migrations correspondentes fossem geradas (per
`apps/akasha-portal/prisma/AGENTS.md` policy: "Migrations: PROPOSAL ONLY,
never apply"). Cada Wave deixou um PROPOSAL no repositório apontando
para o schema drift.

Wave 17.5 audita esse drift e prepara as 4 migration files SQL que
`prisma migrate deploy` espera encontrar. **NÃO foi rodado `prisma
migrate dev`** — as migrations foram escritas à mão com base nos PROPOSALS
já existentes + diffs do `git log -- apps/akasha-portal/prisma/schema.prisma`.

## 2. Migrations a serem aplicadas

| # | Arquivo | Wave | Modelo/Mudança | Commit schema | PROPOSAL |
|---|---------|------|----------------|---------------|----------|
| 1 | `20260625050000_notifications/migration.sql`   | 13.3 | `Notification` + `NotificationType` enum | `fe44fff7` | `proposals/D-046-notifications-in-app.md` |
| 2 | `20260625060000_feedback/migration.sql`        | 13.5 | `FeedbackEntry` + `FeedbackRating` enum  | `ba9704ba` | (commit message) |
| 3 | `20260625070000_user_disabled/migration.sql`   | 14.2 | `User.disabled` column                   | `5f038624` | `proposals/D-047-admin-user-disabled.md` |
| 4 | `20260625080000_plans/migration.sql`           | 14.3 | `Plan` model + `SubscriptionPlanTier` enum rename + `User.planId` | `0e6e32ef` | (commit message) |

### 2.1 Sobre "export_fields" (Wave 13.4)

O plano Wave 17.5 §17.5 lista 5 migrations incluindo `export_fields`.
Auditoria do diff mostrou que **Wave 13.4 (commit `c8d3fc53` /
`1ac22d04`) NÃO tocou o schema** — só adicionou 3 API routes
(`/api/export/{manifesto,map,usage}`) e uma página
(`/conta/export`). O LGPD Art. 18 (V) export usa exclusivamente os
endpoints + response shaping, sem persistência nova.

**Decisão:** migration `export_fields` não foi criada (não há schema
change correspondente). Documentado aqui para que o plano seja fechado
completamente. Se Gabriel identificar uma coluna nova que deveria ter
sido adicionada (ex: `ExportRequest` audit), abrir uma issue separada
na Wave 19+.

## 3. Ordem de execução (constraints de dependência)

`prisma migrate deploy` aplica em ordem lexicográfica dos nomes de
diretório. O prefixo `20260625050000` → `20260625080000` garante a
ordem lógica. Cada migration é **independente em runtime** (não há
dependência direta entre tabelas), mas a ordem foi escolhida para
**minimizar o lock window** em prod:

| # | Migration | Lock footprint | Risco |
|---|-----------|---------------|-------|
| 1 | notifications   | Tabela nova (no lock em `akasha_users`)        | Baixo |
| 2 | feedback        | Tabela nova (no lock em `akasha_users`)        | Baixo |
| 3 | user_disabled   | 1 coluna + 1 índice em `akasha_users` (ACCESS EXCLUSIVE lock) | Médio (lock curto, tabela hot) |
| 4 | plans           | 1 ENUM rename + 1 tabela nova + 1 coluna + 1 FK + 3 índices | **Alto** (enum rename é catalog-level; rodar em janela de baixo tráfego) |

### 3.1 Recomendação de janela

Migration 4 (`plans`) toca o enum `SubscriptionPlanTier` (rename de `Plan`).
Postgres enum rename adquire `ACCESS EXCLUSIVE` no catalog por alguns
milissegundos — `subscriptions.plan` é hot path no checkout. **Rodar
em janela de baixo tráfego** (00:00-04:00 BRT).

Migrations 1, 2, 3 são additive (sem rename, sem type change) e podem
ser aplicadas em qualquer momento com zero downtime.

## 4. Comando único de aplicação

```bash
cd apps/akasha-portal
pnpm exec prisma migrate deploy
```

Saída esperada (resumida):

```
4 migrations found in prisma/migrations
Applying migrations...
  └─ 20260625050000_notifications ... OK
  └─ 20260625060000_feedback       ... OK
  └─ 20260625070000_user_disabled  ... OK
  └─ 20260625080000_plans          ... OK
All migrations applied successfully.
```

### 4.1 Pós-aplicação

```bash
cd apps/akasha-portal
pnpm db:generate     # regenera @prisma/client com os 4 models/columns novos
pnpm typecheck       # valida que o client gerado é compatível com código
pnpm test:run        # roda suite completa
```

### 4.2 Seed (separado)

`seed.ts` (Wave 14.3) popula 3 planos padrão (freemium/pro/enterprise).
**Não roda automaticamente** com `migrate deploy`. Para dev/staging:

```bash
cd apps/akasha-portal
pnpm exec prisma db seed
```

Em prod: seed é opcional — admin pode criar planos via `/admin/plans` UI.

## 5. Riscos por migration

### 5.1 notifications (Wave 13.3)

- **Risco:** Tabela nova. Sem dados existentes → zero risco de corromper.
- **Conflict surface:** Baixíssimo. Só conflita se a tabela `notifications`
  já existir (improvável em prod, pois era a única schema change que
  dependia de uma tabela de mesmo nome).
- **Rollback:** `DROP TABLE IF EXISTS notifications; DROP TYPE IF EXISTS "NotificationType";`

### 5.2 feedback (Wave 13.5)

- **Risco:** Tabela nova. Sem dados existentes → zero risco.
- **Conflict surface:** Baixíssimo. Idem ao anterior — só conflita se
  `feedback_entries` ou enum `FeedbackRating` já existirem.
- **Rollback:** `DROP TABLE IF EXISTS feedback_entries; DROP TYPE IF EXISTS "FeedbackRating";`

### 5.3 user_disabled (Wave 14.2)

- **Risco:** Coluna nova com `NOT NULL DEFAULT false`. Existing rows
  recebem `disabled=false` automaticamente. Zero downtime.
- **Conflict surface:** Só conflita se a coluna `disabled` já existir.
- **Lock:** ACCESS EXCLUSIVE em `akasha_users` por ~milissegundos.
  Em prod: usar `CONCURRENTLY` se a tabela for >10M rows; para tabelas
  menores, lock direto é OK.
- **Rollback:** `DROP INDEX IF EXISTS akasha_users_disabled_idx; ALTER TABLE akasha_users DROP COLUMN IF EXISTS disabled;`

### 5.4 plans (Wave 14.3)

- **Risco:** **MAIS ALTO das 4.** Combina:
  - ENUM rename (catalog-level lock, alguns ms).
  - Tabela nova `plans`.
  - Coluna nova em `akasha_users`.
  - FK constraint.
  - 3 índices.
- **Conflict surface:**
  - Enum `Plan` pode já ter sido renomeado em prod (improvável, mas
    conferir antes de aplicar).
  - Tabela `plans` pode já existir.
  - Coluna `planId` em `akasha_users` pode já existir.
- **Lock:** Multiple ACCESS EXCLUSIVE em `subscriptions` (enum rename) +
  `akasha_users` (coluna nova) + catalog.
- **Rollback (em ordem reversa):**
  ```sql
  -- 1. Drop FK
  ALTER TABLE akasha_users DROP CONSTRAINT IF EXISTS akasha_users_planId_fkey;
  -- 2. Drop coluna
  DROP INDEX IF EXISTS akasha_users_planId_idx;
  ALTER TABLE akasha_users DROP COLUMN IF EXISTS "planId";
  -- 3. Drop tabela
  DROP TABLE IF EXISTS plans;
  -- 4. Revert enum rename
  ALTER TABLE subscriptions ALTER COLUMN "plan" DROP DEFAULT;
  ALTER TABLE subscriptions
      ALTER COLUMN "plan" TYPE "Plan"
      USING "plan"::text::"Plan";
  ALTER TABLE subscriptions
      ALTER COLUMN "plan" SET DEFAULT 'FREEMIUM';
  ALTER TYPE "SubscriptionPlanTier" RENAME TO "Plan";
  ```

## 6. Verificação pós-apply

```bash
# 1. Confirma que todas as migrations aparecem em _prisma_migrations
psql $DATABASE_URL -c 'SELECT migration_name, finished_at FROM _prisma_migrations ORDER BY started_at DESC LIMIT 4;'

# 2. Confirma que as tabelas/colunas existem
psql $DATABASE_URL -c '\d notifications'
psql $DATABASE_URL -c '\d feedback_entries'
psql $DATABASE_URL -c 'SELECT column_name FROM information_schema.columns WHERE table_name = '\''akasha_users'\'' AND column_name = '\''disabled'\'';'
psql $DATABASE_URL -c '\d plans'

# 3. Smoke test: cria notificação + feedback + plano
psql $DATABASE_URL <<'EOF'
INSERT INTO plans (id, name, "displayName", "priceCents") VALUES ('plan_test_1', 'test', 'Test Plan', 0);
INSERT INTO notifications (id, "userId", type, title, body) SELECT 'notif_test_1', id, 'SYSTEM', 'test', 'test' FROM akasha_users LIMIT 1;
EOF

# 4. Cleanup
psql $DATABASE_URL <<'EOF'
DELETE FROM notifications WHERE id = 'notif_test_1';
DELETE FROM plans WHERE id = 'plan_test_1';
EOF
```

## 7. Checklist do humano (Gabriel)

- [ ] Revisar cada um dos 4 `migration.sql` files (diff contra os PROPOSALS)
- [ ] Conferir que NÃO há migration fantasma já aplicada em prod
  (`SELECT * FROM _prisma_migrations WHERE migration_name LIKE '2026062505%' OR ...;`)
- [ ] Janela de baixo tráfego (especialmente para `plans`)
- [ ] `pnpm exec prisma migrate deploy`
- [ ] `pnpm db:generate` (regenera client)
- [ ] `pnpm typecheck` (sanity)
- [ ] `pnpm test:run` (smoke)
- [ ] (dev/staging) `pnpm exec prisma db seed`
- [ ] (dev) Testar localmente: criar notificação, feedback, plano, desabilitar user
- [ ] Marcar MIGRATIONS_PENDING.md como `applied` (mover para
      `MIGRATIONS_APPLIED.md` com timestamp + git SHA)

## 8. Não-objetivos desta Wave

- **NÃO** foi rodado `prisma migrate dev` (AGENTS.md policy).
- **NÃO** foi tocado o `schema.prisma` (já está alinhado com o que
  cada migration cria).
- **NÃO** foi regenerado o `@prisma/client` (Prisma client já está
  gerando a partir do schema atual; `db:generate` é pós-apply).
- **NÃO** foi rodada a seed (decisão humana por ambiente).
- **NÃO** foi feita nenhuma alteração de application code — as 4
  migrations preparam o DB para o código que **já está em main**
  (commit até `c6ae306a`).

---

**Aguardando:** Gabriel apply + smoke test em dev/staging antes de prod.
