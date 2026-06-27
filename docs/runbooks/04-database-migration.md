# Runbook 04 — Database Migration

> **Quando usar:** Antes de mudar `prisma/schema.prisma` em produção. **Toda
> mudança de schema exige migration explícita + teste em staging.**

---

## Workflow seguro

```
1. Desenvolver localmente (schema.prisma + db:migrate dev)
2. Commitar migration em PR separado do código de aplicação
3. Testar em staging (Supabase branch)
4. Revisão por 2 devs (ou Gabriel se solo)
5. Merge em main → aplicar em prod em horário de baixo tráfego
6. Monitorar 30 min (erros 5xx, queries lentas)
```

> ⚠️ **NUNCA** rodar `prisma db push` em prod — ele faz ALTER direto sem migration. **Sempre** `prisma migrate deploy`.

---

## Cenários comuns

### A) Adicionar coluna nullable (low risk)

```prisma
// schema.prisma
model Post {
  // ...existing fields
  publishedAt DateTime?  // ← novo, nullable
}
```

```bash
# Local
pnpm prisma migrate dev --name add_post_published_at
# Cria: prisma/migrations/20260627_add_post_published_at/migration.sql

# Staging
DATABASE_URL=$STAGING_DATABASE_URL pnpm prisma migrate deploy

# Prod (CI roda automaticamente no deploy, OU manual):
DATABASE_URL=$PROD_DATABASE_URL pnpm prisma migrate deploy
```

**Risco:** baixo. Não trava tabela (Postgres 11+ adiciona coluna nullable sem lock).

---

### B) Adicionar coluna NOT NULL sem default (HIGH RISK)

```prisma
model User {
  emailConfirmedAt DateTime  // NOT NULL implícito
}
```

**Problema:** em tabela com 100k+ rows, isso faz `ALTER TABLE` com rewrite completa da tabela (lock longo).

**Soluções:**

**Opção 1 — adicionar nullable, popular, depois NOT NULL:**

```sql
-- Migration 1: adicionar nullable
ALTER TABLE "User" ADD COLUMN "emailConfirmedAt" TIMESTAMP;

-- Migration 2 (em deploy separado): popular dados
UPDATE "User" SET "emailConfirmedAt" = NOW() WHERE "emailConfirmedAt" IS NULL;

-- Migration 3: NOT NULL
ALTER TABLE "User" ALTER COLUMN "emailConfirmedAt" SET NOT NULL;
```

**Opção 2 — default + NOT NULL desde o início:**

```prisma
emailConfirmedAt DateTime @default(now())
```

Postgres 11+ otimiza isso (não rewrite se default for constante).

---

### C) Renomear coluna (BREAKING)

```prisma
// Antes
model User {
  nomeCompleto String
}

// Depois
model User {
  nomeCompleto String  // ← renomear para displayName
  displayName  String  // ← novo
}
```

**Migration segura:**

```sql
-- 1. Adicionar coluna nova (sem lock)
ALTER TABLE "User" ADD COLUMN "displayName" TEXT;

-- 2. Backfill em batch (evitar UPDATE gigante)
DO $$
DECLARE
  batch_size INT := 1000;
  last_id TEXT;
BEGIN
  LOOP
    UPDATE "User" SET "displayName" = "nomeCompleto"
    WHERE "displayName" IS NULL
      AND id > COALESCE(last_id, '')
    ORDER BY id LIMIT batch_size;
    GET DIAGNOSTICS last_id = ROW_COUNT;
    EXIT WHEN last_id = 0;
    PERFORM pg_sleep(0.1);  -- não saturar
  END LOOP;
END $$;

-- 3. Aplicação já lê de displayName e escreve em ambos (dual-write)
-- 4. Validar 100% migração (COUNT onde displayName IS NULL deve ser 0)

-- 5. Próxima migration: dropar coluna antiga
ALTER TABLE "User" DROP COLUMN "nomeCompleto";
```

---

### D) Adicionar índice (cuidado com CONCURRENTLY)

```prisma
model Post {
  authorId String
  
  @@index([authorId])  // ← novo
}
```

Migration gerada:
```sql
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");
```

**Problema:** `CREATE INDEX` em tabela grande trava writes por minutos.

**Solução:** usar `CONCURRENTLY` (não bloqueia writes, mas demora mais):

```sql
-- Criar migration manualmente em prisma/migrations/<name>/migration.sql
CREATE INDEX CONCURRENTLY "Post_authorId_idx" ON "Post"("authorId");
```

> ⚠️ `CREATE INDEX CONCURRENTLY` não roda dentro de transação. Remover `BEGIN; ... COMMIT;` do arquivo migration gerado.

---

### E) Mudar tipo de coluna

```prisma
// Antes
body String  // sem limite explícito
// Depois
body String  // @db.VarChar(5000)
```

**Risco:** alto — pode truncar dados existentes.

**Solução:**

```sql
-- 1. Adicionar coluna nova
ALTER TABLE "Post" ADD COLUMN "body_new" VARCHAR(5000);

-- 2. Truncar/tranformar dados
UPDATE "Post" SET "body_new" = LEFT("body", 5000);

-- 3. Validar (count de truncados)
SELECT COUNT(*) FROM "Post" WHERE LENGTH("body") > 5000;

-- 4. Trocar (em janela de manutenção curta)
BEGIN;
ALTER TABLE "Post" DROP COLUMN "body";
ALTER TABLE "Post" RENAME COLUMN "body_new" TO "body";
COMMIT;
```

---

### F) Deletar tabela (irreversível!)

**NUNCA** dropar tabela diretamente. Workflow:

1. Renomear para `_deprecated_<table>_<data>`
2. Deploy, monitorar 30 dias
3. Confirmar que ninguém referencia (grep no código)
4. **Dropar com backup antes** (ver runbook 05)

```bash
# 1. Backup
pg_dump -t '"User_deprecated_20260627"' $PROD_DATABASE_URL > /tmp/backup.sql

# 2. Drop
psql $PROD_DATABASE_URL -c 'DROP TABLE "User_deprecated_20260627";'
```

---

## Staging environment

### Criar Supabase branch

```bash
# Supabase CLI
supabase branches create feat-nova-migration --main

# Output: Branch URL + DATABASE_URL_STAGING
```

### Configurar Vercel Preview

```bash
# Vercel → Project → Settings → Environment Variables
# Preview: DATABASE_URL = Supabase branch URL
```

### Testar migration

```bash
# Apontar para staging
export DATABASE_URL=$DATABASE_URL_STAGING

# Aplicar
pnpm prisma migrate deploy

# Rodar tests
pnpm test:run

# Rodar e2e contra staging
NEXT_PUBLIC_APP_URL=$STAGING_URL pnpm e2e:smoke
```

---

## Comandos essenciais

```bash
# Criar nova migration (dev)
pnpm prisma migrate dev --name <slug-descritivo>

# Aplicar migrations pendentes (staging/prod)
pnpm prisma migrate deploy

# Ver status (quais migrations já aplicadas)
pnpm prisma migrate status

# Reverter última migration (DEV ONLY)
pnpm prisma migrate reset  # ⚠️ APAGA TODOS OS DADOS

# Marcar migration como aplicada manualmente (recovery)
pnpm prisma migrate resolve --applied <migration_name>

# Marcar como rolled back (se aplicou errado)
pnpm prisma migrate resolve --rolled-back <migration_name>

# Gerar Prisma Client (depois de mudar schema)
pnpm db:generate

# Studio (visualizar dados)
pnpm db:studio
```

---

## Quando a migration dá errado em prod

### Sintomas

- Erros 500 em massa logo após deploy
- `PrismaClientKnownRequestError` em logs
- Schema mismatch (coluna esperada não existe)

### Resposta

1. **Rollback o deploy** (Vercel → Promote deployment anterior)
2. **Investigar** o que falhou (logs Vercel + Sentry)
3. **Aplicar migration manual** se necessário:
   ```bash
   # Conectar direto
   psql $DATABASE_URL
   
   # Ver estado atual
   \dt  # listar tabelas
   SELECT * FROM _prisma_migrations ORDER BY started_at DESC LIMIT 5;
   ```
4. **Marcar como aplicada** ou **rolled back** dependendo do caso
5. **Fix** no schema + nova migration
6. **Redeploy**

---

## Checklist pré-migration

Antes de mergear PR com mudança de schema:

- [ ] `pnpm prisma migrate dev` rodou sem erro
- [ ] Migration SQL revisada manualmente (não confiar 100% no Prisma)
- [ ] Testada em staging (Supabase branch)
- [ ] `pnpm test:run` passa
- [ ] Sem raw SQL no código que dependa de coluna nova antes da migration aplicar
- [ ] Se drop/rename: backup criado (runbook 05)
- [ ] Se índice grande: usar `CONCURRENTLY`
- [ ] PR description explica risco + plano de rollback
- [ ] Deploy em horário de baixo tráfego (madrugada BR)

---

## Referências

- [Prisma — Migrations](https://www.prisma.io/docs/orm/prisma-migrate)
- [Postgres — ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [Supabase — Database branching](https://supabase.com/docs/guides/platform/branching)
- [PgHero — diagnosing bloat](https://github.com/ankane/pghero)
- `docs/SECURITY-AUDIT.md` — RLS + migrations sensíveis
- `docs/TROUBLESHOOTING.md` — erros comuns de Prisma