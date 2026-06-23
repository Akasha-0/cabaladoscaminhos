# Proposal: D-040 Refactor Pillar 5 (I-Ching) Data Location

## Context

Currently, I-Ching related data lives in **two separate models**:

- **`ichingMap`** is in `BirthChart` (consolidated with other pillar maps)
- **`ichingEnabled`** is in `User` (an opt-in LGPD flag)

This is inconsistent. `ichingMap` (a birth chart map like `astrologyMap`, `kabalisticMap`, `tantricMap`, `oduBirth`) **already lives in `BirthChart`** — `ichingEnabled` (the opt-in LGPD flag for the I-Ching system) **should live there too**, alongside its corresponding pillar map.

The original D-040 proposal (43 lines, written earlier in 2026) covered moving both fields together. That premise is now stale: **`ichingMap` was already moved to `BirthChart`** in a prior schema iteration (visible at `schema.prisma:85`). The remaining work is narrower: **move only `ichingEnabled`** from `User` to `BirthChart`.

## Scope (revised 2026-06-23)

**In scope:**
- Move `ichingEnabled Boolean @default(false)` from `User` → `BirthChart`
- Update 4 read sites + 2 write sites + 1 test
- Copy-don't-move migration in 2 steps (D-040 now, D-040b after 1 release)

**Out of scope:**
- `ichingMap` is already in `BirthChart` (D-040's original `ichingMap` move is a no-op)
- LGPD retention policy (ADR 0002) is a separate concern — see "Open Dependencies" below

## Proposed Changes

### 1. `schema.prisma` — 1 field move

```prisma
model User {
  // ... existing fields
- ichingEnabled Boolean @default(false)
  // ... existing fields
}

model BirthChart {
  // ... existing fields
  ichingMap     Json?
+ ichingEnabled Boolean @default(false)  // D-040: opt-in flag for I-Ching (Pilar 5)
  // ... existing fields
}
```

### 2. Migration Plan (copy-don't-move, 2 steps)

**Migration `040_iching_enabled_to_birthchart` (apply now):**

1. **Schema update** — add `ichingEnabled Boolean @default(false)` to `BirthChart`
2. **Copy data** — `UPDATE birth_charts SET "ichingEnabled" = u."ichingEnabled" FROM akasha_users u WHERE birth_charts."userId" = u.id`
3. **Don't drop yet** — `User.ichingEnabled` stays
4. **App update** — all 6 call sites below read/write `BirthChart.ichingEnabled`
5. **App deploy** — after deploy, write `User.ichingEnabled` is no longer needed but still works (compatibility)

**Migration `040b_drop_user_iching_enabled` (apply 1 release later):**

1. Drop `User.ichingEnabled` column (single SQL line)
2. Drop `User.ichingEnabled` from Prisma schema

### 3. Call sites to update (6 total)

**Reads (4 sites):**
- `apps/akasha-portal/src/app/api/akasha/auth/me/route.ts` (lines 19, 36) — GET /me returns `ichingEnabled`
- `apps/akasha-portal/src/app/api/akasha/oraculo/iching/route.ts` (lines 45, 47) — gate I-Ching oráculo on `user.ichingEnabled`

**Writes (2 sites):**
- `apps/akasha-portal/src/lib/services/userService.ts` (`updateUserIchingEnabled`) — join to `BirthChart` for the update
- `apps/akasha-portal/src/app/api/akasha/auth/me/route.ts` (lines 46–68) — PATCH /me writes `ichingEnabled`

**Tests (1 file):**
- `apps/akasha-portal/src/lib/services/__tests__/userService.test.ts` — 2 tests cover `updateUserIchingEnabled`

**Strategy:** update all 6 sites in the same PR (per the grill decision: "atualizar tudo de uma vez no mesmo PR, sem feature flag, typecheck como gate").

## Architectural Decisions (inline)

| # | Decision | Justification | Reversibility |
|---|---|---|---|
| D-040.1 | Move only `ichingEnabled` (not `ichingMap`) | `ichingMap` already in `BirthChart` | Trivial — no change needed |
| D-040.2 | Copy-don't-move in 2 migrations | Same pattern as D-048 LGPD (ADR 0002); rollback = revert deploy only | Trivial — `git revert` |
| D-040.3 | **No new ADR** | D-040 alone fails 2 of 3 ADR criteria: not hard-to-reverse (2-line migration rollback) and not surprising (already discussed in 4+ commits) | — |
| D-040.4 | Update all 6 call sites in 1 PR | TypeScript catches missing reads; `prisma validate` catches missing writes | Trivial — per-site revert |

### Why no ADR (clarification)

The original `domain-modeling` skill criteria for an ADR require **all 3 simultaneously**:

1. **Hard to reverse** — D-040 is **not**: rollback = revert deploy + 1-line migration revert. Cheaper than most features.
2. **Surprising without context** — D-040 is **not**: the architectural pattern (pillar maps in `BirthChart`) is documented in `CONTEXT.md`. Future readers will understand from the existing convention.
3. **Result of a real trade-off** — D-040 has **weak** trade-offs: the alternatives (don't move / partial move / different model) are all visibly worse.

**Decision:** document inline in this proposal + AGENTS.md index entry. Skip ADR.

> **Note:** ADR 0002 (LGPD retention) was the **complementary concern** that originally justified D-040 with LGPD framing. ADR 0002 was **lost in a merge conflict resolution** (working dir stash apply) and never made it to main. If/when LGPD retention is re-proposed, **consider promoting D-040 + D-048 together into a combined ADR**.

## Open Dependencies

- **D-041** (Caminhante + Caminhada) — already applied (2026-06-22). No impact on D-040.
- **D-042/D-043** (MandalaSnapshot / Jogo) — both proposals, awaiting merge. **Independent of D-040**.
- **D-048** (LGPD retention) — proposed but ADR 0002 lost. If re-proposed, coordinate with D-040 because `ichingEnabled` is an LGPD opt-in flag and its location matters for retention/redaction policy.
- **No migrations depend on D-040** — D-040 is purely additive + 1 column move (copy-don't-move).

## Migration Plan (concrete steps)

1. **Update proposal** (this file) — ✅ done 2026-06-23 (scoped to `ichingEnabled` only)
2. **Update AGENTS.md** at repo root — 1-line index entry
3. **Update Hermes memory** — durable fact about the decision
4. **Worktree** — `git worktree add -b grill/d-040-iching-enabled-to-birthchart origin/main .worktrees/d-040`
5. **Apply schema changes** — add `ichingEnabled` to `BirthChart`
6. **Apply migration files** — `migrations/20260624XXXXX_040_iching_enabled_to_bc/migration.sql` + `migration_lock.toml` update
7. **Update 6 call sites** — read sites + write sites + test
8. **Verify** — `pnpm --filter akasha-portal typecheck` + `prisma validate`
9. **Commit on worktree branch** — single commit with detailed message
10. **Deliver to Gabriel** — diff + summary + `git checkout grill/d-040-...` for review
11. **NEVER apply migration** — Gabriel applies manually after review (per `prisma/AGENTS.md:69-82` rule)

## Risk and Rollback

- **Risk:** migration aditiva (additive) — no data loss. Backward compat OK during 1-release window (User.ichingEnabled coexists with BirthChart.ichingEnabled).
- **Risk:** LGPD — `ichingEnabled` is an opt-in flag (LGPD Art. 7, §4 — explicit consent). Moving it to BirthChart aligns with the "birth data" semantic (the flag is for the I-Ching **natal** system). No LGPD policy change.
- **Risk:** Prisma drift — same drift documented in `prisma/AGENTS.md:25-30` (D-041 used SQL-direct + manual `_prisma_migrations` insert). D-040 may need the same fallback: `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` + INSERT manual.
- **Rollback:** `git revert <sha>` of the PR. If migration was applied, run `prisma migrate resolve --rolled-back` + manual `ALTER TABLE birth_charts DROP COLUMN "ichingEnabled"`. Since data was copied (not moved), no data loss.

## Verification

- `pnpm exec prisma validate` passes
- `pnpm db:generate` regenerates client without error
- `pnpm --filter akasha-portal typecheck` 0 errors
- `pnpm test:run` passes (esp. `userService.test.ts` — 2 tests for `updateUserIchingEnabled`)
- **Smoke test manual:**
  1. Set `User.ichingEnabled = true` directly in DB
  2. GET /api/akasha/auth/me → returns `ichingEnabled: true`
  3. PATCH /api/akasha/auth/me with `{ichingEnabled: false}` → updates BirthChart
  4. GET /api/akasha/auth/me → returns `ichingEnabled: false`
  5. POST /api/akasha/oraculo/iching → 200 (was 403 before)
  6. Verify `User.ichingEnabled` still has the original value (copy-don't-move)

## Approval Required

Aprovação humana antes de `pnpm exec prisma migrate dev --name 040_iching_enabled_to_birthchart`.

---

**Author:** sessão 4 (grilling + domain-modeling), updated 2026-06-23 after scoping review.
**Anchors:** `CONTEXT.md` (5 Pilares — Pilar 5 I-Ching opt-in), `apps/akasha-portal/prisma/AGENTS.md:69-82` (migration protocol), `prisma/AGENTS.md:25-30` (drift workaround).
**Open:** re-coordination with D-048 (LGPD retention) if/when re-proposed.
