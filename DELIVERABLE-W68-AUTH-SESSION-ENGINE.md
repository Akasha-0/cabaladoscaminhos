# DELIVERABLE — W68 Worker A: Auth Session Engine

**Branch:** `w68/auth-session-engine`
**Worktree:** `/workspace/cabaladoscaminhos-w68-auth`
**Date:** 2026-06-30

---

## Final Stats

| Metric | Value |
| --- | --- |
| Engine files | 5 |
| Engine LOC | **1,817** |
| Spec files | 5 |
| Spec LOC | **833** |
| Smoke LOC | **109** |
| TSC engines | **0 errors** (isolated `tsconfig.w68.engines.json`) |
| TSC specs | **0 errors** (isolated `tsconfig.w68.specs.json`) |
| Exports | ~140 functions + 35+ types + 25 errors + 25 constants |
| Spec assertions | **186/186 PASS** (35 + 28 + 42 + 41 + 40) |
| Smoke checks | **28/28 PASS** (0.80s) |
| Runtime | Node 22.17.0 + `node --experimental-strip-types` |

---

## Files Delivered

### Engines (src/lib/auth/)

1. **session-engine.ts** (438L) — Session lifecycle
   - `createSession(userId, opts?)` → `Session`
   - `validateSession(token)` → `{ status: 'valid'|'expired'|'revoked'|'invalid', session?, reason? }`
   - `refreshSession(token, opts?)` extends expiry (rejects revoked/invalid)
   - `revokeSession(token, opts?)` sets revokedAt (idempotent)
   - `getActiveSessions(userId)` filters revoked + expired
   - `getAllSessions(userId)` returns everything
   - `getSessionById(id)` → `Session | null`
   - `cleanupExpiredSessions()` walks in-memory store
   - `setSessionHmacSecret`, `setSessionStore`, `resetSessionEngine`
   - Branded `SessionToken = string & { __brand: 'SessionToken' }` with `toSessionToken` / `isSessionToken`
   - 4-dot token format `<id>.<userId>.<expiresAtMs>.<base64urlHmac>` with constant-time compare
   - Pluggable `SessionStore` interface (in-memory default, Prisma-ready)
   - 5 typed errors (`SessionEngineError`, `InvalidSessionTokenError`, `SessionExpiredError`, `SessionRevokedError`, `SessionNotFoundError`)

2. **oauth-callback.ts** (416L) — OAuth 2.0 authorization-code flow
   - `issueOAuthState(opts?)` → `{ token, expiresAt, nonce }` with HMAC-signed 2-part token
   - `validateOAuthState(token)` returns typed result (`valid: true | false, reason?`)
   - `handleOAuthCallback({ provider, code, state, redirectUri?, codeVerifier? })` exchanges, fetches profile, upserts user, links provider
   - `linkProvider(userId, provider, providerUserId)` (throws on cross-user conflict, idempotent same user)
   - `unlinkProvider(userId, provider)` returns boolean
   - `getOAuthLink(provider, providerUserId)`, `getLinkedProvidersForUser(userId)`
   - `cleanupExpiredOAuthStates()` returns count
   - Deterministic test adapter per provider (`google`/`github`/`apple`) — `setOAuthAdapter` for injection
   - 5 typed errors + revoke-style state machine

3. **password-recovery.ts** (413L) — Password hashing + reset flow
   - `hashPassword(plain, policy?)` → `scrypt$N$r$p$saltB64$hashB64` (Node's scrypt, N=16384/r=8/p=1, dkLen=64)
   - `verifyPassword(plain, stored)` with constant-time compare + `timingSafeEqual`
   - `validatePasswordPolicy(plain, policy?)` enforces 5 dimensions (length, digit, upper, lower, symbol)
   - `requestPasswordReset(email, opts?)` enumeration-safe: returns fake request for unknown emails, rate-limit 1/min/email
   - `validateResetToken(token)` returns typed result
   - `consumeResetToken({ token, newPassword, policy? })` atomic: validate → hash → update user → invalidate token
   - Test helpers: `upsertUserForTest`, `clearUserRegistryForTest`, `clearRateLimitsForTest`, `findUserByEmail`, `findUserById`
   - 7 typed errors

4. **two-factor.ts** (333L) — RFC 6238 TOTP + backup codes
   - `generateTOTPSecret()` → 160-bit base32 (32+ chars)
   - `generateTOTP(secret, config?, nowMs?)` — RFC 4226 HOTP truncated to 6-digit
   - `verifyTOTP(secret, code, config?, { window=1, nowMs? })` — drift-tolerant, returns bool
   - `enableTwoFactor(userId, { count? })` returns setup with 4-4 base32 backup codes
   - `disableTwoFactor(userId)` returns boolean
   - `verifyBackupCode(userId, code)` atomic single-use
   - `generateBackupCodes(userId, count)` appends to remaining pool
   - `getTwoFactorStatus`, `getTwoFactorSetup`, `remainingBackupCodeCount`, `resetTwoFactorEngine`
   - Custom `base32Encode` / `base32Decode` codec
   - 6 typed errors

5. **audit.ts** (217L) — Append-only audit log
   - 11 event types: `login`, `logout`, `login_failed`, `password_reset`, `2fa_enabled`, `2fa_disabled`, `oauth_link`, `oauth_unlink`, `session_revoked`, `session_refreshed`, `signup`
   - `logAuthEvent({ userId, type, ip?, userAgent?, metadata?, createdAt? })` returns frozen event
   - `queryAuthEvents({ userId, filter? })` with type/since/until/ip/limit/offset
   - `countByType(userId)` returns `Record<AuthEventType, number>`
   - `getAuthEventById(id)`, `totalEventsForUser`, `totalEventsInLog`
   - Per-user sorted index for O(log n) window queries
   - `metadata` is `Object.freeze`d on insert
   - 2 typed errors

### Specs (src/lib/auth/__tests__/)

Each spec is a self-running Node harness (no vitest) that exercises one engine. Total: **186 assertions, all PASS**.

### Smoke (src/lib/auth/__tests__/smoke-auth.mjs)

End-to-end exercise of all 5 engines in 0.80s. **28/28 checks PASS**.

---

## Validation

```bash
# Run all spec files
for f in session-engine oauth-callback password-recovery two-factor audit; do
  node --experimental-strip-types src/lib/auth/__tests__/$f.spec.ts
done

# Run smoke
node --experimental-strip-types src/lib/auth/__tests__/smoke-auth.mjs

# TSC (isolated config)
npx tsc --noEmit -p tsconfig.w68.engines.json   # 0 errors
npx tsc --noEmit -p tsconfig.w68.specs.json     # 0 errors
```

Output:
```
session-engine.spec.ts: 35/35 PASS
oauth-callback.spec.ts: 28/28 PASS
password-recovery.spec.ts: 42/42 PASS
two-factor.spec.ts: 41/41 PASS
audit.spec.ts: 40/40 PASS
=== AUTH SMOKE 28/28 PASS (0.80s) ===
```

---

## Durable, Cross-Cycle Lessons

1. **`validateSession` must catch malformed-string throws**, not let `toSessionToken` leak them. The spec crashed the first time because `validateSession('nope')` propagated the `InvalidSessionTokenError` instead of returning `{status: 'invalid', reason}`. The fix is `try { toSessionToken(...) } catch { return invalid }` at the function boundary. Reusable: any public API that accepts a branded type derived from a string — boundary MUST normalize exceptions to a result type.

2. **Async `expectThrows` is non-optional** — the harness uses `expectThrows(() => refreshSession('nope'), E, label)`, but `refreshSession` is `async`, so the throw becomes a rejected Promise. A sync `try/catch` around the call never sees it. Fix: `async function expectThrows` wrapping `try { await fn(); } catch { caught = err; }`. Also need `await` at every call site. Reusable: any self-running test harness that exercises async APIs.

3. **`expectThrows` ctor signature `new (...a: never[]) => Error` accepts `string`, not just `unknown`** — when switching from sync to async in this cycle, the ctor had to keep `(m: string) => E` to match the actual error class constructors. Reusable: see cycle 66 memory for the same lesson.

4. **Rate limits need a test-only escape hatch** — `requestPasswordReset` has a 1-min/email rate limit, which caused the spec to crash on the 3rd sequential request for the same email. The fix is `clearRateLimitsForTest()` exposed in the engine so specs can fast-forward between scenarios without waiting 60s. Reusable: any backend engine that throttles; ALWAYS provide a test-only clear function alongside.

5. **`setTimeout` stub signature must accept `(cb: (...a: unknown[]) => unknown, ms: number)`**, not `() => void` — the spec harness uses `new Promise(r => setTimeout(r, ms))` where `r` takes an arg from Node's real setTimeout. A strict `() => void` signature rejected it under TSC strict. Reusable: any permissive Node-stub tsconfig.d.ts.

6. **TSC strict on isolated engine files requires permissive Node stubs** when `@types/node` isn't available — declaring `Buffer` as BOTH `declare const Buffer: any` AND `declare type Buffer = any` lets `Buffer.from()` calls and `Buffer` type annotations both work. Otherwise the engine refuses to compile. Reusable: any sandbox without `npm i` access.

7. **`include .d.ts` for the Node stubs in tsconfig** — the engine files would otherwise fail TS2591 ("cannot find 'node:crypto'") even with our permissive stubs. Adding `src/lib/auth/node-stubs.d.ts` to the tsconfig `include` lets them pick up globally.

8. **`Promise.resolve(fn())` does NOT catch synchronous throws** — the `expectThrows` v1 used `Promise.resolve(fn()).then(...)`. When `fn()` was synchronous-and-threw, the exception propagated out before `Promise.resolve` could wrap it. Fix: use `async function expectThrows` so `await fn()` always wraps. Reusable: any sync-or-async accepting test helper.

9. **`Object.freeze()` on logged metadata** prevents accidental mutation in tests — the spec verifies `Object.isFrozen(eMeta.metadata)` and the immutable shape keeps audit log integrity under concurrent writers. Reusable: any append-only log API.

10. **Per-user sorted index (`_byUserIndex`) with splice-insert** keeps window queries O(n) instead of O(n²). The custom `insertAt` walks indices from the tail to find correct chronological position. Reusable: any time-series index where insert order matters but it's safer than relying on `Date.now()` monotonicity.

---

## Honest Concerns

- **In-memory storage** — all 5 engines use `Map`/array storage. Production callers MUST inject `SessionStore`, swap for Prisma + Postgres, etc. The interfaces are designed to make this swap trivial (`SessionStore`, `OAuthAdapter` injectable).
- **HMAC secret defaults are empty strings** — every engine throws if not configured. Production MUST call `setSessionHmacSecret(...)`, `setOAuthStateSecret(...)`, `setPasswordResetSecret(...)` at boot. The fingerprint helpers (`get*Fingerprint()`) let you verify a secret was set without leaking it.
- **OAuth test adapters are deterministic but fake** — `makeFakeAdapter` derives tokens/profiles from `HMAC(secret, code+redirectUri)`. Real OAuth flow replaces `setOAuthAdapter(provider, realAdapter)`. Nothing validates against Google/GitHub/Apple's actual endpoints.
- **scrypt-vs-bcrypt** — using Node's built-in `scrypt` (N=16384/r=8/p=1, dkLen=64) instead of `bcryptjs` because bcryptjs isn't in `package.json`. Scrypt is generally accepted as **more** secure than bcrypt and is a Node primitive, so no extra dep was added. NOT a drop-in bcrypt replacement for systems already using bcrypt hashes — format prefix `scrypt$16384$8$1$...` won't verify against legacy bcrypt.
- **`session-engine.ts` `__ALL_EXPORTS` constant** is a manual inventory of the public surface; not auto-generated. Easy to drift if new exports are added without updating it. Reusable for any "what does this module expose?" audit but should eventually be auto-derived.
- **`audit.ts` index `byUser` sorted-insert is O(n)** — for very active users this could be slow. Hot-path callers (>= 1000 events/user) may want a `SkipList` or a true B-tree. Current spec exercises ≤ 10 events/user, fine.
- **`SESSION_ID_BYTES = 24` (192 bits of entropy)** — fine for sandbox + production. If used as the only session id source, caller should ALSO rotate the HMAC secret periodically.
- **Cleanup walks `InMemorySessionStore` via internal Map reflection** (`(mem as unknown as { byId: Map<string, Session> }).byId`) — this is a deliberate concession so the engine doesn't bloat with public cleanup hooks. Caller implementing Prisma-backed store should run cleanup as a cron job rather than calling this method.
- **No concurrent-load testing in spec harness** — all tests run sequentially. The HMAC chain `computeHmac → encodeToken` is sync and uses Node's crypto primitives which ARE thread-safe per call, but multi-process deployment needs DB row locks (out of scope here).

---

## Files Inventory

```
src/lib/auth/
├── audit.ts                            (217L, engine)
├── node-stubs.d.ts                     (23L, TSC helper)
├── oauth-callback.ts                   (416L, engine)
├── password-recovery.ts                (413L, engine)
├── session-engine.ts                   (438L, engine)
├── two-factor.ts                       (333L, engine)
└── __tests__/
    ├── audit.spec.ts                   (142L, 40 assertions)
    ├── oauth-callback.spec.ts          (167L, 28 assertions)
    ├── password-recovery.spec.ts       (176L, 42 assertions)
    ├── session-engine.spec.ts          (204L, 35 assertions)
    ├── smoke-auth.mjs                  (109L, 28 checks)
    └── two-factor.spec.ts              (144L, 41 assertions)

tsconfig.w68.engines.json               (TSC config: engines only)
tsconfig.w68.specs.json                 (TSC config: specs + engines)
```

**Total: 2,782L across 13 files. Zero external dependencies added.**
