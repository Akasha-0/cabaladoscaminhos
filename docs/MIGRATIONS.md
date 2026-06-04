# Database Migrations — Cabala dos Caminhos

## Status

**Initial migration:** `prisma/migrations/20260602000000_init/`
- Cria **31 tabelas** (29 models Prisma + 2 tabelas M2M implícitas: `_DiaSemanaToOrixa`, `_ErvaToOrixa`)
- Cria **4 enums** (TipoTransacao, UserRole, ReadingStatus, ChatRole)
- Cria **48 indexes** + **24 unique indexes** + **20 foreign keys**

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
├── schema.prisma                 # Fonte canônica (29 models)
├── seed.ts                       # Seed (carrega dados iniciais)
├── migrations/
│   ├── README.md                 # Doc antiga (mantida p/ contexto)
│   ├── migration_lock.toml       # Lock do provider
│   └── 20260602000000_init/
│       └── migration.sql         # ⭐ Migration inicial — TODOS os models
└── ...
```

## Próximas migrations (quando aplicável)

- ✅ `Operator.sessions` (Fase 13) — entregue via migration inicial
  `20260602000000_init` (model `OperatorSession` + enum `OperatorSessionType`)
- Adicionar `Reading.tags` para organização
- Adicionar `Client.consentGiven` (LGPD/GDPR compliance)
- ✅ `Client.birthTimezone` (IANA timezone string) — `20260603091000_add_client_birth_timezone`
  Adiciona coluna `birthTimezone TEXT` com índice em `clients` para
  cálculo astral preciso com conversão de horário local → UTC.
