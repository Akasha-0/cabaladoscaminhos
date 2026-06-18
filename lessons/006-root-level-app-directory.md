# Lesson 006 — Root-level `app/` directory had duplicate routes with wrong imports

**Tag:** `architecture`, `bug`

## What happened

After removing the dead push stub at `lib/push/`, TypeScript still errored on
`@/lib/push/push-subscription-service`. The root tsconfig (`baseUrl: "."`, `@/* →
./apps/akasha-portal/src/*`) includes `**/*.ts` — including a parallel `app/`
directory at the monorepo root (`app/api/akasha/push/subscribe/route.ts`) that
contained the OLD import.

The root-level `app/` was a pre-portal API layer. When the portal was created at
`apps/akasha-portal/src/`, the old root-level routes were left in place but
never updated. They now silently shadowed nothing (since `@/` always resolves to
`apps/.../src/`). The subscribe route had `@/lib/push/push-subscription-service`
pointing to the deleted stub.

Also: `apps/akasha-portal/src/lib/auth/akasha-guard.ts` and
`apps/akasha-portal/src/lib/push/` (2 files) were dead stubs with zero callers,
parallel to live implementations in `lib/application/`.

## What to do differently

1. **When cleaning dead stubs in `lib/`**, audit ALL places that import from that
   module path — including root-level `app/` routes. The root tsconfig
   `include: ["**/*.ts"]` picks up both `apps/.../src/app/` and `app/` (monorepo
   root). A dead stub in `lib/` can silently poison root-level API routes.

2. **Delete dead portal stubs too.** `apps/akasha-portal/src/lib/push/` and
   `apps/akasha-portal/src/lib/auth/akasha-guard.ts` were dead even though the
   portal tsconfig's `@/*` would have resolved to them. They duplicated live code
   in `lib/application/`.

3. **Test files for dead stubs must also be deleted.** `tests/lib/push/` had
   tests for the dead stub implementations. After removing stubs, run the test
   suite — failing tests that reference missing modules reveal orphaned test files.
