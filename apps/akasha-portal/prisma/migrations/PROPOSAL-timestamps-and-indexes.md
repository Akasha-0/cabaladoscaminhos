# Migration Proposal — Focus: Missing Timestamps + Composite Index

**Status**: PROPOSAL (não aplicar sem aprovação)
**Criado**: 2026-06-20
**PR**: `feat(schema): D-041 — proposal (awaiting approval)`

---

## Resumo

Duas categorias de mudança aditivas (sem dados destrutivos):

1. **Adicionar `updatedAt` a 8 modelos que hoje só têm `createdAt`.**  
   `@updatedAt` é auto-gerenciado pelo Prisma — zero mudança de código de aplicação.  
   `GrimoireEntry` é o inverso: tem `updatedAt` mas não `createdAt` — única exceção no schema.

2. **Adicionar índice composto `[userId, snapshotDate]` em `ExerciseCompletion`**  
   Query real no endpoint `cycle/snapshot` filtra por `userId + snapshotDate >= fromDate` — sem índice dedicado hoje.

---

## Mudança 1 — `updatedAt` em 8 modelos

### Modelos afetados

| Modelo | Tem `createdAt`? | Tem `updatedAt`? |
|---|---|---|
| `CreditEntry` | ✅ | ❌ |
| `Manifesto` | ✅ | ❌ |
| `DailyReading` | ✅ | ❌ |
| `RitualCompletion` | ✅ | ❌ |
| `ChatMessage` | ✅ | ❌ |
| `Connection` | ✅ | ❌ |
| `AreaHistoryEntry` | ✅ | ❌ |
| `ExerciseCompletion` | ✅ | ❌ |

### Diff do schema

```diff
 model CreditEntry {
   id        String   @id @default(cuid())
   userId    String
   delta     Int
   reason    String
   balance   Int
   createdAt DateTime @default(now())
+  updatedAt DateTime @updatedAt
   @@index([userId])
   @@map("credit_entries")
 }
```

```diff
 model Manifesto {
   id         String   @id @default(cuid())
   userId     String   @unique
   content    Json
   pdfUrl     String?
   llmModel   String?
   tokensUsed Int?
   createdAt  DateTime @default(now())
+  updatedAt  DateTime @updatedAt
   @@map("manifestos")
 }
```

```diff
 model DailyReading {
   id           String   @id @default(cuid())
   userId       String
   date         DateTime @db.Date
   climate      String
   ritual       Json
   alert        String
   tensionPoint Json
   llmModel     String?
   hexagram      Int?
   hexagramLines Json?
   createdAt    DateTime @default(now())
+  updatedAt    DateTime @updatedAt
   @@unique([userId, date])
   @@map("daily_readings")
 }
```

```diff
 model RitualCompletion {
   id        String   @id @default(cuid())
   userId    String
   grimoireId String
   date      DateTime @default(now())
+  updatedAt DateTime @updatedAt
   @@index([userId])
   @@map("ritual_completions")
 }
```

```diff
 model ChatMessage {
   id             String       @id @default(cuid())
   role           ChatRole
   content        String
   routedPillars  String[]     @default([])
   grimoireRefs   String[]     @default([])
   creditCost     Int          @default(0)
   consultationId String
   createdAt      DateTime     @default(now())
+  updatedAt      DateTime     @updatedAt
   @@index([consultationId])
   @@map("chat_messages")
 }
```

```diff
 model Connection {
   id                String   @id @default(cuid())
   userId            String
   otherName         String
   otherBirthDate    DateTime
   otherBirthTime    String?
   otherBirthCity    String?
   romanticScore     Int
   partnershipScore  Int
   dominantType      String
   authorityMatch    String
   resultData        Json
   createdAt         DateTime @default(now())
+  updatedAt         DateTime @updatedAt
   @@index([userId])
   @@map("connections")
 }
```

```diff
 model AreaHistoryEntry {
   id               String   @id @default(cuid())
   userId           String
   date             DateTime @db.Date
   area             String
   dominantFrequency String
   intensity        Int
   # ... outros campos ritual ...
   createdAt        DateTime @default(now())
+  updatedAt        DateTime @updatedAt
   @@unique([userId, date, area])
   @@index([userId])
   @@index([userId, area])
   @@map("area_history")
 }
```

```diff
 model ExerciseCompletion {
   id              String   @id @default(cuid())
   userId          String
   exerciseId      String
   area            String
   title           String
   snapshotDate    DateTime @db.Date
   snapshotId      String?
   completed       Boolean  @default(false)
   completedAt     DateTime?
   createdAt       DateTime @default(now())
+  updatedAt       DateTime @updatedAt
   @@index([userId])
   @@index([userId, completed])
   @@index([userId, area, completed])
   @@map("exercise_completions")
 }
```

### SQL gerado (exemplo para `CreditEntry`)

```sql
ALTER TABLE "credit_entries" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
```

O padrão se repete para cada modelo: `ALTER TABLE "…" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;`

---

## Mudança 2 — `createdAt` em `GrimoireEntry`

`GrimoireEntry` é o único modelo que tem `updatedAt` mas **não** `createdAt`. Inconsistência com os demais 14 modelos.

### Diff

```diff
 model GrimoireEntry {
   id         String  @id @default(cuid())
   slug       String  @unique
   categoria  String
   biblioteca String
   metadata   Json
   conteudo   String
   embedding  Unsupported("vector(768)")?
   sourcePath String
+  createdAt  DateTime @default(now())
   updatedAt  DateTime @updatedAt
   @@index([categoria])
   @@index([biblioteca])
   @@map("grimoire")
 }
```

### SQL gerado

```sql
ALTER TABLE "grimoire" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
```

---

## Mudança 3 — Índice composto `[userId, snapshotDate]` em `ExerciseCompletion`

### Query que justifica

Em `apps/akasha-portal/src/app/api/akasha/cycle/snapshot/route.ts`:

```typescript
const exercises = await prisma.exerciseCompletion.findMany({
  where: {
    userId: user.id,
    snapshotDate: { gte: fromDate },
  },
  ...
});
```

Os índices existentes em `ExerciseCompletion`:
- `@@index([userId])` — prefixa corretamente mas varre todas as datas
- `@@index([userId, completed])` — cobre `userId` filtro mas não `snapshotDate`
- `@@index([userId, area, completed])` — mesmo problema

Nenhum índice atual atende uma query com `where: { userId, snapshotDate: { gte: X } }`.  
Um índice composto `[userId, snapshotDate]` cobre esta query **exatamente**: busca por `userId` exato + range scan em `snapshotDate`.

### Diff

```diff
 model ExerciseCompletion {
   ...
   @@index([userId])
   @@index([userId, completed])
   @@index([userId, area, completed])
+  @@index([userId, snapshotDate])
   @@map("exercise_completions")
 }
```

### SQL gerado

```sql
CREATE INDEX "exercise_completions_user_id_snapshot_date_idx"
  ON "exercise_completions"("userId", "snapshotDate");
```

---

## Justificativa Geral

### `@updatedAt` (8 modelos)

- **Audit trail**: saber *quando* um dado foi alterado pela última vez é requisito básico de observabilidade. `CreditEntry` rastreia saldo financeiro; `ChatMessage` armazena consultas do Mentor; `Manifesto` é o documento mais importante do usuário.
- **Zero custo de manutenção**: Prisma gerencia `@updatedAt` automaticamente — `ON UPDATE CURRENT_TIMESTAMP` no SQL gerado. Nenhuma linha de código de aplicação precisa mudar.
- **Risco**: Zero. Add-only column com `NOT NULL DEFAULT CURRENT_TIMESTAMP`. Não afeta queries, inserts, ou selects existentes.
- **Rollback**: `ALTER TABLE "…" DROP COLUMN "updatedAt"` (compatível com rollback de migration).

### `createdAt` em `GrimoireEntry`

- **Consistência**: Todos os 14 outros modelos têm `createdAt`; `GrimoireEntry` é a única exceção — provavelmente um lapso na criação do modelo.
- **Utilidade**: O sync do grimório faz `upsert` por slug; sem `createdAt` não há como saber quando cada entrada foi indexada pela primeira vez.
- **Risco**: Zero. Add-only.
- **Rollback**: `ALTER TABLE "grimoire" DROP COLUMN "createdAt"`.

### Índice `[userId, snapshotDate]`

- **Performance**: A query `findMany({ where: { userId, snapshotDate: { gte: X } } })` atualmente faz scan sequencial ou uso sub-ótimo do índice `[userId]`. O índice composto cobre exatamente o predicado → index-only scan.
- **Risco**: Índice add-only, não bloqueante (`CREATE INDEX CONCURRENTLY` em prod).
- **Rollback**: `DROP INDEX "exercise_completions_user_id_snapshot_date_idx"`.

---

## Plano de aplicação

```bash
# 1. Gerar migration
cd apps/akasha-portal
pnpm exec prisma migrate dev --name add_missing_timestamps_and_index

# 2. Verificar SQL gerado (deve conter apenas ALTER TABLE ADD COLUMN + CREATE INDEX)
# 3. Aplicar em dev/staging
# 4. Commitar a migration (após aprovação)
```

---

## Rollback completo

```sql
-- Reverter Mudança 1 (8 ALTERs)
ALTER TABLE "credit_entries" DROP COLUMN "updatedAt";
ALTER TABLE "manifestos" DROP COLUMN "updatedAt";
ALTER TABLE "daily_readings" DROP COLUMN "updatedAt";
ALTER TABLE "ritual_completions" DROP COLUMN "updatedAt";
ALTER TABLE "chat_messages" DROP COLUMN "updatedAt";
ALTER TABLE "connections" DROP COLUMN "updatedAt";
ALTER TABLE "area_history" DROP COLUMN "updatedAt";
ALTER TABLE "exercise_completions" DROP COLUMN "updatedAt";

-- Reverter Mudança 2
ALTER TABLE "grimoire" DROP COLUMN "createdAt";

-- Reverter Mudança 3
DROP INDEX IF EXISTS "exercise_completions_user_id_snapshot_date_idx";
```

---

## Verificação

```bash
pnpm --filter akasha-portal typecheck   # ✅ deve passar
pnpm --filter akasha-portal test:run   # ✅ suite deve passar
pnpm exec prisma validate               # ✅ schema válido
```

## Checklist de risco

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| `@updatedAt` muda comportamento de `create` | Baixa | Baixo | `@updatedAt` em modelo recém-criado = `createdAt`; idêntico ao comportamento sem o campo |
| Query `findMany` sem `orderBy` muda ordering | Baixa | Nulo | Índice novo pode mudar planos de query → testar em staging |
| Rollback complexo (9 colunas + 1 índice) | Média | Baixo | Script SQL de rollback fornecido acima — execução atômica |
