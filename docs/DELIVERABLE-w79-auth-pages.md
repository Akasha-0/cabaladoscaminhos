# DELIVERABLE — W79-B · Auth Pages (login + signup)

## Summary

Cycle 79 W79-B delivered two accessible, mobile-first auth pages (`/login` and
`/signup`) backed by a pure-validation helpers module. The pages integrate with
W68's auth-session-engine via an injectable `AuthAdapter` interface — the helper
module itself is pure-TS (no React, no Node imports) and fully testable in
isolation.

## What landed

| File | LOC | Purpose |
| --- | --- | --- |
| `src/lib/w79/auth-pages.ts` | 391 | Pure validation helpers + adapter contract + submit wrappers |
| `src/lib/w79/auth-pages.spec.ts` | 357 | Self-running spec — 126 assertions |
| `src/lib/w79/node-stubs.d.ts` | 11 | Node globals stub for spec/smoke |
| `src/lib/w79/react-stubs.d.ts` | 63 | React/Next/lucide-react stubs for pages TSC |
| `src/lib/w79/page-stubs.d.ts` | 16 | Stub declarations for pages TSC |
| `scripts/smoke/w79-auth-pages.ts` | 110 | Self-running smoke — 34 checks |
| `src/app/(auth)/login/page.tsx` | 321 | Login form (overwritten W21 placeholder) |
| `src/app/(auth)/signup/page.tsx` | 434 | Signup form (overwritten W20 placeholder) |
| `tsconfig.w79.json` | 22 | Engine TSC config |
| `tsconfig.w79.pages.json` | 24 | Pages TSC config (uses react-stubs) |
| **Total** | **1749** | 8 source + 2 config + 1 deliverable |

## Test results

```
auth-pages.spec.ts: 126/126 PASS  (self-running under --experimental-strip-types)
W79-B auth-pages smoke: 34/34 PASS in 46ms
TSC engine (tsconfig.w79.json):       0 errors
TSC pages  (tsconfig.w79.pages.json): 0 errors
```

## Architecture decisions

### 1. Adapter contract (`AuthAdapter`)
Pages don't hard-wire to Supabase or W68 session-engine. Instead, an injectable
`AuthAdapter` interface lets:
- The integrator plug W68's `signIn`/`signUp` (or any other backend) at the page
  boundary via `setDevLoginAdapter()` / `setDevSignupAdapter()`.
- The spec/smoke to stub the adapter with deterministic test doubles (no real
  Supabase / no real OAuth / no real password hashing in unit tests).
- A dev-only default adapter that simulates a deterministic success path so the
  `/signup` flow is testable end-to-end via the browser without external wiring.

### 2. Pure helpers module
`src/lib/w79/auth-pages.ts` has zero React imports and zero Node imports. It runs
under `node --experimental-strip-types` directly, making it usable both
client-side (UX validation) and server-side (trust-boundary validation in a
future server action).

### 3. Discriminated union for AuthResult
`AuthResult = AuthSuccess | AuthFailure | AuthNetworkFailure` — callers branch on
`kind` and never re-check error shapes. `errorMessage()` and `redirectFor()`
helpers centralize the display logic.

### 4. Branded types (cycle 77 lesson)
`UserId` matches `^u_[a-z0-9_]{3,40}$`; `SessionToken` enforces 8–1024 chars.
Production-swappable to UUIDs by changing the factory body.

### 5. Object.freeze at every export boundary (cycle 78 lesson #6)
Every `SubmitResult`, `LoginFormErrors`, `SignupFormErrors`, `AuthResult` and the
default `AuthPages` namespace is frozen. Internal `issues` arrays are frozen too.
This means consumers can't accidentally mutate the form state and break
subsequent validations.

### 6. A11Y (WCAG AA)
- `<label htmlFor="…">` on every input.
- `aria-invalid={Boolean(fieldErrors.X)}` on every erroring input.
- `aria-describedby` linking input → error message.
- `role="alert"` on every error paragraph + on the toast.
- `role="status"` + `aria-label` on loading skeletons.
- `aria-pressed` on password visibility toggles.
- `aria-hidden="true"` on decorative icons.

### 7. Mobile-first
- `px-4 py-8` (or `py-10` on the group layout), no horizontal scroll.
- All touch targets ≥ 44px (`min-h-[44px]`, `min-w-[44px]` on icon buttons;
  `min-h-[48px]` on the primary submit button).
- `inputMode="email"` on email fields for the right mobile keyboard.
- Stack at `sm:` breakpoint; full bleed on small screens.

### 8. LGPD consent (signup only)
- Mandatory checkbox bound to `lgpdConsent: boolean`.
- `data-lgpd-version={LGPD_VERSION}` on the checkbox for compliance audits.
- Links to `/privacy` and `/terms` open in new tab with `rel="noopener noreferrer"`.

## Cycle 78 lessons applied

| # | Lesson | How applied |
| - | - | - |
| 6 | Object.freeze at every export boundary | SubmitResult, LoginFormErrors, SignupFormErrors, AuthResult, issues arrays, default AuthPages namespace |
| 3 | Unicode lookaround for sacred terms | N/A — auth-pages has no sacred-term matching (pure form validation) |
| 1 | Process global declared in worktree-isolated node-stubs | `declare const process: any` in `node-stubs.d.ts` for spec/smoke |

## Cycle 77 lessons applied

| # | Lesson | How applied |
| - | - | - |
| Branded ID types via factory + regex prefix | `toUserId('u_…')`, `toSessionToken('tok_…')` with regex/len validation |
| `runOne(name, fn)` wrapper calling `_reset` before fn | N/A — module is stateless; pure-function tests don't need reset |

## Cycle 75 lessons applied

| # | Lesson | How applied |
| - | - | - |
| Object.freeze on every result + every record | All `AuthResult` variants + `SubmitResult` |

## Cycle 60+ patterns

- Self-running spec harness with `expectEqual / expectTrue / expectFalse / expectThrow`
- `process.exit(1)` on failure, `process.exit(0)` on success
- Sync smoke harness using `check()` + `expectThrow()` (no test runner needed)
- `import … from './auth-pages.ts'` (allowImportingTsExtensions)

## TSC strategy

Two isolated tsconfigs (matching W68's pattern):
- `tsconfig.w79.json` — engine + spec + smoke, uses `node-stubs.d.ts`
- `tsconfig.w79.pages.json` — pages + helpers, uses `react-stubs.d.ts` + `page-stubs.d.ts`

Both pass with `0 errors`. Next.js itself compiles the pages via its own
`tsconfig.json` + real `@types/react` + real `next/link` types at build time —
those types are not available in the worktree (no `node_modules`), so the
isolated stubs are the W79 verification path.

## Verification commands

```bash
# Engine + spec + smoke TSC
cd /tmp/w79-b && npx tsc --noEmit --skipLibCheck --project tsconfig.w79.json
# Pages TSC
cd /tmp/w79-b && npx tsc --noEmit --skipLibCheck --project tsconfig.w79.pages.json
# Spec
cd /tmp/w79-b && node --experimental-strip-types src/lib/w79/auth-pages.spec.ts
# Smoke
cd /tmp/w79-b && node --experimental-strip-types scripts/smoke/w79-auth-pages.ts
```

## Out of scope (not blocking)

- Real Supabase wiring: deferred to integrator (use `setDevLoginAdapter` / `setDevSignupAdapter`).
- W68 session-engine `createSession` integration: deferred to integrator; the helper `submitLogin` / `submitSignup` orchestrators already accept any `AuthAdapter`.
- Server Actions (`src/app/actions/auth.ts`): deferred — would re-use the same helpers under a server boundary.
- i18n: all strings in PT-BR (matching the rest of the auth flow); to add EN/ES later, replace the inline strings with `t('auth.email_required')` etc.

## Commit info

Branch: `w79/auth-pages`
Base: `b575c6e` (cycle 78 interim 3 commit)
Files changed: 10 (8 created + 2 tsconfigs)
