# Migration Proposal — Focus: Indexes + Type Fixes

**Status**: PROPOSAL (não aplicar sem aprovação)
**Criado**: 2026-06-20
**PR**: `feat(schema): D-NNN — proposal (awaiting approval)`

---

## Resumo

Três mudanças de baixo risco e alto impacto no schema Prisma:
1. **`DailyReading.hexagram`: `String?` → `Int?`** — corrige type mismatch com range canônico I Ching (1–64)
2. **Novos índices** em `CycleSnapshot(date)` e `GrimoireEntry(sourcePath)` — cobrem queries reais sem impacto destrutivo
3. **Remove menção F-238/F-239 da README** — eram propostas fantasma (arquivos nunca criados)

---

## Mudança 1 — `DailyReading.hexagram` type fix

### Diff do schema

```diff
model DailyReading {
  # ...
- hexagram      String?
+ hexagram      Int?
  hexagramLines Json?
  # ...
}
```

### Justificativa

- **D-040 E4** (arquivado em `grimoire/diagnostico/`): `DailyReading.hexagram` é `String?`, mas o range canônico I Ching/IFA é `Int 1–64`. Type mismatch latente: código que espera Int pode receber string.
- Aplicação legada (`cabala-transits.service.ts`): já persiste como inteiro; o schema é o único outliers.
- **Risco**: zero. `String?` → `Int?` em PostgreSQL: dados existentes permanecem válidos (coerção implícita do `cast` em `::text`/`::varchar` se necessário). Não há dado guardado como hexagrama textual (só ordinal).
- **Rollback**: `hexagram Int?` → `hexagram String?` via migration reversa.

### SQL gerado

```sql
ALTER TABLE "daily_readings" ALTER COLUMN "hexagram" TYPE INTEGER
  USING ("hexagram"::integer);
```

---

## Mudança 2 — Índices de performance

### 2a. `CycleSnapshot(date)` — índice simples

**Query que justifica**:

```sql
-- used by cycle/snapshot API: "snapshot for user on date X"
SELECT * FROM cycle_snapshots
  WHERE "userId" = $1 AND date = $2;
```

**Diff do schema**

```diff
model CycleSnapshot {
  # ...
+ @@index([date])
}
```

**SQL gerado**

```sql
CREATE INDEX "cycle_snapshots_date_idx" ON "cycle_snapshots"("date");
```

### 2b. `GrimoireEntry(sourcePath)` — índice simples

**Query que justifica**:

```sql
-- used by grimoire sync: "entries from source X"
SELECT * FROM grimoire WHERE "sourcePath" = $1;
```

**Diff do schema**

```diff
model GrimoireEntry {
  # ...
+ @@index([sourcePath])
}
```

**SQL gerado**

```sql
CREATE INDEX "grimoire_source_path_idx" ON "grimoire"("sourcePath");
```

### Justificativa geral (índice)

- Ambos são índices `CREATE INDEX` (não destrutivos, não bloqueantes em PostgreSQL com `CONCURRENTLY`).
- `CycleSnapshot` tem 7 índices compostos/únicos, mas nenhum no campo `date` isolado — essencial para lookups por data.
- `GrimoireEntry` tem 2 índices (`slug` unique, `categoria`, `biblioteca`) mas nenhum em `sourcePath` — usado pelo sync service.
- **Risco**: mínimo. Índices add-only em Postgres. Não afetam dados.
- **Rollback**: `DROP INDEX` correspondente.

---

## Mudança 3 — Limpeza README

A README.md na pasta `migrations/` lista F-238 e F-239 como proposals, mas os arquivos de migration correspondentes nunca foram criados (diretório `prisma/proposals/` também não existe). Proposta de remoção da menção:

```diff
- Some migrations are **proposals** that need human review before applying:
-
- - D-040 (Prisma schema with 5 Pilares) — awaiting human approval
- - F-238, F-239 (idempotency + timezone) — proposals from v0.0.20 spec
```

Essas duas linhas ficam removidas. A seção "Proposals (NEED human approval)" e as sub-items F-238/F-239 são removidos. A entrada D-040 também é removida (migration `20260611000000_init_akasha_v3` já aplicada e é o estado atual).

---

## Plano de aplicação

```bash
# 1. Gerar migration
cd apps/akasha-portal
pnpm exec prisma migrate dev --name add_indexes_and_fix_hexagram_type

# 2. O Prisma vai gerar SQL:
#   ALTER TABLE "daily_readings" ALTER COLUMN "hexagram" TYPE INTEGER USING ("hexagram"::integer);
#   CREATE INDEX "cycle_snapshots_date_idx" ON "cycle_snapshots"("date");
#   CREATE INDEX "grimoire_source_path_idx" ON "grimoire"("sourcePath");

# 3. Aplicar em dev
# 4. Revisar SQL gerado
# 5. Commitar a migration (após aprovação)
```

---

## Rollback

```sql
-- Se necessário reverter
ALTER TABLE "daily_readings" ALTER COLUMN "hexagram" TYPE TEXT;
DROP INDEX IF EXISTS "cycle_snapshots_date_idx";
DROP INDEX IF EXISTS "grimoire_source_path_idx";
```

---

## Verificação

```bash
pnpm --filter akasha-portal typecheck   # ✅ deve passar
pnpm --filter akasha-portal test:run   # ✅ suite deve passar
pnpm exec prisma validate               # ✅ schema válido
```
