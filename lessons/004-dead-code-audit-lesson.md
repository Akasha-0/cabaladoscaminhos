# Lesson 004 — Cycle 525

## Context
When auditing deprecated wrapper files (`interface/api/` stubs), assumed they were dead based on checking barrel/index exports. Did NOT check direct `@/` module imports in API route files.

## What happened
`health/metrics/route.ts` was importing from `@/lib/interface/api/query-params` and `@/lib/interface/api/spiritual-filters` directly — not through barrel files. TypeScript caught the broken imports on the NEXT triad run.

## The fix
Redirect `health/metrics/route.ts` to canonical sources (`@/lib/shared/query-params`, `@/lib/domain/types/spiritual-filters`). Delete deprecated wrappers.

## The rule
**Before declaring any deprecated file dead**: must check ALL `@/` module path imports in `app/api/` routes — routes import directly from `lib/` files, not through barrel indexes. Typecheck is the authoritative check.

## What this means for future audits
1. Don't trust barrel/index files as the only consumers
2. Check `app/api/**/route.ts` for direct `from '@/lib/...'` imports
3. If file has `@deprecated` JSDoc, ALWAYS run `bun run typecheck` before deleting
4. Typecheck failure = live import exists = don't delete
