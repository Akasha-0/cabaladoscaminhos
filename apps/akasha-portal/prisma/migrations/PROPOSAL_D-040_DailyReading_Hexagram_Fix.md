# Schema Migration Proposal: D-040-DailyReading-Hexagram-Fix

## Schema Diff
```prisma
model DailyReading {
  // ...
  // v0.0.5 T3 (Doc 14 §2): hexagrama do dia persistido no cronjob
  // `cabala-transits.service`. Estrutura binária (6 linhas) em
  // `hexagramLines` para o `MandalaChart` e o `/daily` exibirem.
-  hexagram      String?
+  hexagram      Int?
  hexagramLines Json?
  // ...
}
```

## Justification
As per `apps/akasha-portal/prisma/AGENTS.md` (item D-040, E4), `DailyReading.hexagram` is currently `String?` but the canonical range per IFA/D-044 is `Int 1-64`. This is a latent type mismatch. This change enforces the correct data type in the database.

## Risks
- Data migration: Existing string data in `hexagram` needs to be migrated to integers if it contains numeric strings. If it contains non-numeric strings, this will break.
- Application code: Any code reading this field expects a string and now will receive an integer (or null).

## Rollback Plan
- Revert schema change and apply previous migration.
- Backfill/migrate data using a data migration script if needed.
