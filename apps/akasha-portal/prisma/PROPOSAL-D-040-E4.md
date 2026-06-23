# Proposal: D-040-E4 - DailyReading.hexagram type mismatch

## Description
The field `DailyReading.hexagram` is currently defined as `String?`.
According to `apps/akasha-portal/prisma/AGENTS.md` (D-040 E4), the canonical range is `Int` (1-64).

## Schema Diff
```prisma
model DailyReading {
  // ...
  // Change from:
  // hexagram      String?
  // Change to:
  hexagram      Int?
  // ...
}
```

## Justification
- Improves type safety and data integrity by enforcing the canonical 1-64 integer range at the database level.
- Resolves latent type mismatch identified in D-040.

## Risks
- Data migration: Existing `hexagram` values stored as strings need to be cast to integers.

## Rollback Plan
- If migration fails, revert `schema.prisma` and restore `hexagram` to `String?` using the previous migration state or by restoring the previous column type in a new migration.

## Implementation Steps (to be performed by human)
1. Ensure all `hexagram` strings are valid integers.
2. Update `schema.prisma`.
3. Run `pnpm exec prisma migrate dev --name <NNN>` (with explicit type casting in the SQL migration file).
