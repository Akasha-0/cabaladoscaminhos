# Lesson 005 — Push subscription route imported dead stub

**Tag:** `bug`, `product`

## What happened

The route `apps/akasha-portal/src/app/api/akasha/push/subscribe/route.ts` imported
`upsertPushSubscription`, `deletePushSubscription`, `getUserPushSubscriptions` from
`@/lib/push/push-subscription-service`. This resolved to the **monorepo root**
`lib/push/push-subscription-service.ts` — a 20-line stub where all three functions are
no-ops (stub body, returns `[]`). The real implementation at
`apps/akasha-portal/src/lib/application/push/push-subscription-service.ts` was in a
different `lib/` subtree and was never imported by the subscribe route.

Result: every push subscription was silently discarded. `pushEnabled` on the user
was toggled but no subscription was ever saved to PostgreSQL. The feature was
broken at the persistence layer.

## What to do differently

1. **Import path must match the actual implementation location.** When a feature
   lives in `lib/application/<domain>/`, the route must import from there — not
   from a parallel `lib/<domain>/` stub at the monorepo root. Stubs in monorepo
   root `lib/` are deprecated copy-paste artifacts.

2. **When fixing a bug, check for dead stubs at monorepo root `lib/`**. The
   monorepo root `lib/` had a parallel set of stubs that shadowed the real
   implementations. After any deletion of dead `lib/` items, verify all imports
   still resolve to live code.

3. **Test coverage is not sufficient if mocks point to the wrong module.** The
   test `tests/api/akasha/push/subscribe.test.ts` mocked the stub path
   (`@/lib/push/push-subscription-service`) — not the real implementation. Tests
   passed because the stub was a no-op. After fixing the import, the mock path
   in the test also needed updating.
