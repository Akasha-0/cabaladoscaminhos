# Design Proposal: D-040-E5 — Consultation.hexagram Type Correction

## Context
As part of the ongoing D-040 (Pilar 5 I Ching consolidation), we identified that `Consultation.hexagram` is currently defined as `String?`, which is inconsistent with the `DailyReading.hexagram` type (`Int?`) and the canonical range IFA/D-044 (Int 1-64).

## Proposed Change

```prisma
model Consultation {
  // ...
  // v0.0.5 T3 (Doc 14 §2): hexagrama sorteado
  hexagram  Int?
  // ...
}
```

## Justification
1. **Type Consistency**: Aligns `Consultation.hexagram` with `DailyReading.hexagram`.
2. **Standard Compliance**: Enforces the canonical Int 1-64 range requirement for hexagrams as defined by the domain standard IFA/D-044.
3. **Reduced Latent Errors**: Prevents potential data mismatches and casting errors in the application layer.

## Risks
*   **Data Migration**: Existing records with string values (if any) will need to be cast to `Int` or handled during the migration process.
*   **Application Impact**: Any application code interacting with `Consultation.hexagram` expecting a string will need to be updated to expect an `Int`.

## Rollback Plan
1. Revert `schema.prisma` changes.
2. Run `pnpm exec prisma migrate dev --name <previous_migration_name>`.
3. Re-deploy application code if necessary.
