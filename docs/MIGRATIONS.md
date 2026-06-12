# Database Migrations — Sistema Akasha

> **Norte:** Doc 25.

> ## pgvector & Monorepo (notas do pivô Akasha)
>
> Dois fatos novos do Sistema Akasha (Doc 25) afetam as migrations:
>
> 1. **pgvector — coluna `vector` via SQL manual.** O Grimório Digital (Doc 25 §5,
>    Doc 04 §1) guarda embeddings na tabela `grimoire`. O Prisma **não tipa**
>    `vector` nativamente: a coluna fica como `embedding Unsupported("vector(768)")`
>    (ou comentada) no schema, e a coluna real + o índice (`ivfflat`/`hnsw`) são
>    criados por **migration SQL manual**. A extensão precede tudo:
>    ```sql
>    -- prisma/migrations/<ts>_grimoire_pgvector/migration.sql
>    CREATE EXTENSION IF NOT EXISTS vector;
>    ALTER TABLE "grimoire" ADD COLUMN IF NOT EXISTS "embedding" vector(768);
>    CREATE INDEX IF NOT EXISTS grimoire_embedding_idx
>      ON "grimoire" USING ivfflat ("embedding" vector_cosine_ops) WITH (lists = 100);
>    ```
>    `prisma migrate diff` ignora a coluna `Unsupported`; portanto **revise sempre**
>    o SQL gerado e garanta que a migration do pgvector exista e rode **antes** do
>    `npm run grimoire:sync` (que popula os vetores via Ollama). A dimensão `768`
>    corresponde ao `nomic-embed-text` (Doc 03 §5).
>
> 2. **Monorepo — `prisma/` compartilhado.** No monorepo (Turborepo/pnpm, Doc 25 §11),
>    o `prisma/` (schema + migrations) é **compartilhado** entre `apps/b2c-portal` e
>    outros apps que rodem no mesmo banco; os `packages/core-*` são agnósticos e
>    **não** tocam o banco. `prisma migrate deploy` roda na **raiz** do monorepo;
>    o deploy no VPS Linux (Doc 25 §10) executa-o antes de
>    `pm2 reload b2c-portal` (runbook no Doc 22 §9). O esquema canônico é o
>    B2C do Akasha (`User`/`BirthChart`/`Manifesto`/`DailyReading`/`GrimoireEntry`,
>    Doc 04).

## Status

**Migration inicial Akasha v3:** `prisma/migrations/20260611000000_init_akasha_v3/`
- Cria **11 modelos** do núcleo B2C canônico (User, BirthChart, Subscription, CreditEntry, Manifesto, DailyReading, RitualCompletion, Consultation, ChatMessage, PushSubscription, GrimoireEntry)
- Cria **4 enums** (UserRole, Plan, SubStatus, ChatRole)
- Cria **17 indexes** + **4 unique indexes** + **9 foreign keys** (todos apontando pra `akasha_users`)
- `User` mapeia pra `akasha_users` (`@@map("akasha_users")`) — separado da
  tabela `users` do Supabase Auth (GoTrue) pra evitar conflito de schema
- Ativa a extensão `vector` (pgvector) — coluna `embedding vector(768)` em
  `grimoire` é criada pelo sync script (`pnpm grimoire:sync`), não pela
  migration (Drizzle/PgVector não tipa `vector` nativamente; coluna é
  `Unsupported` no Prisma)

**Histórico:** a `20260611000000_init_akasha_v3` é a primeira migration versionada
do schema B2C. As 5 tentativas anteriores (em `20260606*` e `20260607*`) foram
removidas do diretório porque nunca foram aplicadas — o time usou
`prisma db push` no lugar, e o `_prisma_migrations` table no Supabase tinha
entradas de um schema legado (Operator/OperatorSession) que nada tinham a
ver com o B2C atual. Foi feito um reset limpo: `_prisma_migrations` dropada,
novas FKs recriadas manualmente pra apontar pra `akasha_users`, e a v3
gerada via `prisma migrate diff --from-empty --to-schema` e marcada como
aplicada com `prisma migrate resolve --applied`.

**Aviso:** `prisma db push` continua sendo perigoso — vai tentar
`DROP TABLE "users"` (Supabase Auth) e quebrar o Auth. Use `prisma migrate`
para mudanças daqui em diante.

## Workflow

### Criar nova migration (dev)

```bash
# 1. Editar prisma/schema.prisma
# 2. Gerar migration (cria SQL + aplica em dev DB)
npx prisma migrate dev --name descricao_curta

# Apenas gerar o SQL sem aplicar (não roda DB):
npx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --script > prisma/migrations/<timestamp>_nome/migration.sql
```

### Aplicar migrations em prod / CI

```bash
# Aplica todas as migrations pendentes
npx prisma migrate deploy

# Verifica status
npx prisma migrate status
```

### Resetar DB em dev (cuidado — apaga tudo)

```bash
npx prisma migrate reset
```

### Gerar Prisma Client

```bash
npm run db:generate
# ou
npx prisma generate
```

## Prisma 7 — Breaking Changes importantes

A partir do Prisma 7:

1. **URL do datasource vai em `prisma.config.ts`**, NÃO em `schema.prisma`.
   O bloco `datasource db { provider = "postgresql" }` em `schema.prisma`
   fica apenas com `provider`.

2. **`prisma migrate diff --from-empty --to-schema <path>`** gera SQL
   puro sem precisar de DB rodando. Útil para CI ou para gerar a
   migration inicial.

3. **`shadowDatabaseUrl`** é exigido em `prisma.config.ts` para
   `prisma migrate diff --from-migrations` (precisa de DB temporário
   para comparar estado das migrations contra o schema atual).

4. **`jwt-deprecated`** em Prisma 7: algumas APIs mudaram. Mantemos
   o Prisma 7.8.0 estável; atualização para 7.x.x minor é segura.

## Convenções

- **Nomes de migration**: `<14-digit-timestamp>_<snake_case_descritivo>/`
  Ex: `20260602000000_init/`
- **Dentro de cada pasta**: `migration.sql` + (opcional) `down.sql` para
  rollbacks manuais
- **Provider lock**: `migrations/migration_lock.toml` declara o provider.
  Não editar manualmente.

## Validação

Antes de commit, sempre:

```bash
npx prisma validate              # schema válido
npx prisma generate              # client gerado
# Migration nova: revisar o SQL gerado em prisma/migrations/<nova>/
```

## Estrutura atual

```
apps/akasha-portal/
├── prisma.config.ts              # Prisma 7 config (datasource URL, schema path)
├── prisma/
│   ├── schema.prisma             # Fonte canônica (11 models)
│   ├── migrations/
│   │   ├── README.md             # Histórico
│   │   ├── migration_lock.toml   # Lock do provider
│   │   └── 20260611000000_init_akasha_v3/
│   │       └── migration.sql     # ⭐ Migration inicial — 11 models B2C, akasha_users
│   └── ...
└── ...
```

## Próximas migrations (quando aplicável)

⏳ **grimoire embeddings** — coluna `embedding vector(768)` e índice
`ivfflat`/`hnsw` são criados pelo script de sync, não pela migration.
Para promover pra migration versionada: criar
`20260612000000_grimoire_pgvector/migration.sql` com `CREATE EXTENSION` +
`ALTER TABLE grimoire ADD COLUMN embedding vector(768)` + `CREATE INDEX
... USING ivfflat`.
