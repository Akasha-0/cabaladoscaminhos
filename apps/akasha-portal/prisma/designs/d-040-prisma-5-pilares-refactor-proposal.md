# Proposal: D-040 Refactor Pillar 5 (I-Ching) Data Location

## Context
Currently, I-Ching related data (`ichingMap`, `ichingEnabled`) is stored in the `User` model, while other pillar maps live in the `BirthChart` model. This is inconsistent with the architectural plan to centralize all birth chart maps in `BirthChart`.

## Proposed Changes

### 1. `schema.prisma`

```prisma
model User {
  // ... existing fields
- ichingMap Json?
- ichingEnabled Boolean @default(false)
  // ... existing fields
}

model BirthChart {
  // ... existing fields
  ichingMap     Json?
+ ichingEnabled Boolean @default(false)
  // ... existing fields
}
```

### 2. Migration Plan

1. **Schema Update**: Apply changes to `schema.prisma`.
2. **Migration**:
   - `prisma migrate dev --name move_iching_to_birthchart`
   - This will need to handle data migration. Since `BirthChart` relates to `User`, we can use a data migration script.
3. **Application Update**:
   - Update `apps/akasha-portal/src/app/api/akasha/auth/me/route.ts` to read `ichingEnabled` from `BirthChart` (joining it).
   - Update `apps/akasha-portal/src/app/api/akasha/consult/route.ts` to read `ichingEnabled` from `BirthChart`.
   - Update `apps/akasha-portal/src/app/api/akasha/mandala/route.ts` to read `ichingMap` from `BirthChart`.
   - Update `apps/akasha-portal/src/lib/services/userService.ts` to manage `ichingEnabled` in `BirthChart`.

## Risk and Rollback
- **Risk**: Data loss during migration if the relationship between `User` and `BirthChart` is not handled correctly.
- **Rollback**: Restore `schema.prisma` and revert the migration. The data remains in `User` if we copy it rather than move it during the data migration step.

## Approval Required
- Need approval for this schema change before running `prisma migrate dev`.
