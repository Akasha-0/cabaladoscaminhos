# Proposal D-042: Fix Duplicate `intentionProfile` Field on `User` Model

## Status: Pending Approval

## Problem

`schema.prisma` declares the field `intentionProfile` **twice** in the
`User` model (lines 36 and 37):

```prisma
36:   intentionProfile Json?
37:   intentionProfile Json? @default("{}")
```

This causes `prisma validate` to fail with error **P1012**:

```
Error: Prisma schema validation - (validate wasm)
Error code: P1012
error: Field "intentionProfile" is already defined on model "User".
  --> prisma/schema.prisma:37
```

The build pipeline (`pnpm db:generate` → `tsc`, per
`apps/akasha-portal/prisma/AGENTS.md` § "Generated client") cannot run
while the schema is invalid. This blocks:

- `pnpm exec prisma validate`
- `pnpm exec prisma migrate status`
- `pnpm exec prisma generate` (and downstream `tsc`)
- Any CI gate that depends on schema validation

## Blast Radius (codegraph-verified)

The field is actively used by:

- `apps/akasha-portal/src/app/[locale]/(akasha)/onboarding/OnboardingClient.tsx:178`
  — writes `intentionProfile` after onboarding quiz (`{ quest, energy }`).
- `apps/akasha-portal/src/app/api/webhooks/akasha-stripe/route.ts:96,98,103`
  — selects, reads, and merges into `intentionProfile` when Stripe credits
  are added.

The DB column `intentionProfile JSONB` already exists from
`migrations/20260611000000_init_akasha_v3/migration.sql:37`. Application
behavior is unchanged after the fix — both declarations resolve to the
same single column at runtime.

## Proposed Change

Remove the **first** declaration (line 36) and keep the **second** (line
37), which has the safer `@default("{}")` for new users. Result: one
canonical declaration matching the existing DB column exactly.

### Schema Diff

```diff
 model User {
   // ... existing fields (id, email, birth data, iching*, ...) ...

   // ── LGPD + onboarding payload (JSON shape, validated at app layer) ──
-  intentionProfile Json?
-  intentionProfile Json? @default("{}")
+  /// Free-form onboarding intentions stored as JSON.
+  /// Validated at the application layer (see OnboardingClient + Stripe webhook).
+  /// Default `{}` so new users satisfy the schema without a separate write.
+  intentionProfile Json? @default("{}")
   consentAt      DateTime?  // AD-T5-C: LGPD consent timestamp (min. persistence)
   // ... existing fields ...
 }
```

### Migration SQL (expected, must be hand-checked by reviewer)

```sql
-- No-op: `intentionProfile JSONB` already exists in `akasha_users`
-- (init migration line 37). Dropping the duplicate Prisma declaration
-- does NOT change the DB schema; `prisma migrate dev` should produce
-- an empty migration when the resolved schema matches the DB exactly.
```

The reviewer MUST confirm `prisma migrate dev --name d-042-dedupe-intention-profile`
produces an empty migration. If it produces a non-empty diff, the reviewer
must REJECT and re-investigate (likely the init migration differs from the
current schema in other fields — see D-040-E4 / D-040-E5 / D-041).

## Justification

1. **Unblocks the build pipeline.** `prisma validate` is a precondition for
   `prisma generate`, which runs before `tsc`. The duplicate is the single
   blocker between `pnpm typecheck` and green status (post-test-file fix).
2. **Zero data risk.** The column already exists with the correct type and
   contents. Application behavior is preserved byte-for-byte.
3. **Aligns with the established proposals workflow.** Per
   `apps/akasha-portal/prisma/AGENTS.md` § "Migrations: PROPOSAL ONLY",
   this proposal follows the prescribed schema-diff + justification +
   risks + rollback format.
4. **Resolves a known gap.** `prisma/AGENTS.md` § "Verification" lists
   `pnpm db:generate` as a precondition for `pnpm typecheck`. The duplicate
   silently violates that precondition and produces a misleading "build
   broken" signal that points at test files instead of the schema root cause.

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| `prisma migrate dev` produces a non-empty diff (e.g. unintended ALTER on `intentionProfile`) | Low | Reviewer MUST diff `prisma/migrations/<timestamp>_d-042-*/migration.sql` against `migrations/20260611000000_init_akasha_v3/migration.sql:21-44` and reject if anything other than an empty file appears. |
| Init migration drift on unrelated fields (e.g. `daily_readings.hexagram TEXT` vs `Int?`, `consultations.hexagram TEXT` vs `Int?`) | Medium — pre-existing | Out of scope for D-042. Already tracked in D-040-E4, D-040-E5, D-041. Reviewer should call out any drift exposed by the migration diff but NOT block D-042 for it. |
| Loss of the `@default("{}")` if reviewer accidentally keeps line 36 instead of line 37 | Low | Proposal explicitly designates line 37 as the survivor. AGENTS.md will mark `@default("{}")` as the canonical choice. |

## Rollback Plan

1. Revert `schema.prisma` to commit `<this-commit>` (re-adds both lines).
2. `pnpm exec prisma generate` to refresh the client.
3. **No data rollback needed** — the column is untouched.
4. Drop any migration file generated for D-042 (it is a no-op).

## Implementation Steps (to be performed by human)

1. Apply the schema diff above to `apps/akasha-portal/prisma/schema.prisma`.
2. Run `pnpm exec prisma validate` — must exit 0.
3. Run `pnpm exec prisma migrate dev --name d-042-dedupe-intention-profile`.
4. Inspect the generated migration — it MUST be empty (the column already
   exists). If not empty, reject and re-investigate.
5. Commit schema + migration together:
   `fix(schema): D-042 dedupe intentionProfile field`.
6. Re-run `pnpm db:generate` and `pnpm typecheck` — both must pass.

## References

- `apps/akasha-portal/prisma/schema.prisma:36-37` — the duplicate.
- `apps/akasha-portal/prisma/migrations/20260611000000_init_akasha_v3/migration.sql:37`
  — the existing column.
- `apps/akasha-portal/prisma/AGENTS.md` — DOX contract that prescribes
  the proposal workflow this document follows.
- D-040-E4, D-040-E5, D-041 — related proposals covering other schema
  drift; not blocked by this one, not part of its scope.
