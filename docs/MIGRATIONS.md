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

**Migration inicial Akasha v2:** `prisma/migrations/20260606000000_init_akasha_v2/`
- Cria **10 modelos** do núcleo B2C canônico (User, BirthChart, Subscription, CreditEntry, Manifesto, DailyReading, RitualCompletion, Consultation, ChatMessage, GrimoireEntry)
- Cria **4 enums** (UserRole, Plan, SubStatus, ChatRole)
- Cria **12 indexes** + **4 unique indexes** + **9 foreign keys**
- **Ativa pgvector (Doc 25 §5):** `CREATE EXTENSION IF NOT EXISTS "vector"`, coluna `embedding vector(768)` em `grimoire`, índice `grimoire_embedding_idx` (`ivfflat` + `vector_cosine_ops`, `lists = 100`)
- ⚠️ Substitui qualquer esquema anterior — a migração inicial canônica do
  Akasha v2 destrói e recria as tabelas. Garanta backup antes de aplicar.

**Migration de consentimento LGPD:** `prisma/migrations/20260606000001_add_user_consent_at/`
- Adiciona coluna `consentAt DateTime?` em `users` (AD-T5-C: timestamp de consentimento LGPD)

A migration `20260606000000_init_akasha_v2` é a **fonte canônica de ativação do pgvector**: a coluna `embedding vector(768)` e o índice `ivfflat` são criados nela (não em uma migration separada). A coluna é `Unsupported` no Prisma (não tipa nativamente) — populada via `$executeRaw` por `src/lib/grimoire/sync.ts` (Ollama `nomic-embed-text`).

Esta migration **ainda não foi aplicada** — o `DATABASE_URL` configurado em
`.env` é um placeholder. Para um ambiente real, edite `.env` e rode
`npx prisma migrate deploy` (prod) ou `npx prisma migrate dev` (dev).

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
prisma/
├── schema.prisma                 # Fonte canônica (10 models)
├── seed.ts                       # Seed (carrega dados iniciais)
├── migrations/
│   ├── README.md                 # Doc antiga (mantida p/ contexto)
│   ├── migration_lock.toml       # Lock do provider
│   ├── 20260606000000_init_akasha_v2/
│   │   └── migration.sql         # ⭐ Migration inicial — 10 models B2C + pgvector
│   └── 20260606000001_add_user_consent_at/
│       └── migration.sql         # LGPD — coluna consentAt em users
└── ...
```

## Próximas migrations (quando aplicável)

- ⏳ **`grimoire` + pgvector** — model `GrimoireEntry` + **migration SQL manual** da
  coluna `embedding vector(768)` e índice `ivfflat`/`hnsw` (ver a nota do topo).
  A coluna e o índice já são criados pela `20260606000000_init_akasha_v2`; resta
  validar a rotina de sincronização Ollama (`src/lib/grimoire/sync.ts`) e a
  busca híbrida.
