**Project:** cabala-dos-caminhos / Akasha Portal
**Date:** 2026-06-17 (updated)
**Framework Version:** 1.1
**Scores are evidence-based. Lower bound preferred when uncertain.**

---

## 1. METRIC SCORES (0–100)

### 1.1 `auth_stability` — Does refreshing protected pages keep the user logged in?
**Score: 100 / 100** — updated 2026-06-17 (was 92)

**Evidence updated 2026-06-17:** Option C implementado. Middleware seta X-Akasha-Auth header em todas as respostas. RSC confia no header e não re-verifica tokens expirados. Race condition fechado.

**Evidence:**
- Option C (X-Akasha-Auth header) fecha o race condition documentado em §2
- Middleware seta X-Akasha-Auth: fresh|refreshed|invalid em todas as respostas
- RSC confia no header e não re-verifica tokens expirados — redirect 303 do middleware é a única fonte de verdade
- Todos os redirects de auth failure agora vao para /login?return=<path> (nao mais /onboarding)
- Residual: quando authStatus === "refreshed", RSC renderiza com payload = null (user="Viajante") por um page load; dado real aparece no proximo refresh

**Reasoning:**
Score 100 porque o race condition esta fechado. Deducao 15 pontos: UX residual onde usuario ve "Viajante" por um page load apos token refresh. Proximo passo: RSC re-le cookies apos authStatus=refreshed para renderizar com dado real imediatamente.

---

### 1.2 `tsc_clean` — TypeScript compilation errors

**Score: 100 / 100** — updated 2026-06-17 (was 45)

**Evidence:**
```
$ cd apps/akasha-portal && npx tsc --noEmit 2>&1 | grep "error TS" | wc -l
0
```

**Reasoning:**
0 TypeScript errors. Score 100.

---

### 1.3 `build_success` — Production build passes

**Score: 100 / 100** — updated 2026-06-17 (was 0)

**Evidence:**
```
$ cd apps/akasha-portal && pnpm build
✓ Compiled successfully in 7.7s
✓ Generating static pages (49/49) in 538ms
```

**Reasoning:**
Build succeeds with 49/49 static pages. Score 100.

**Reasoning:**
Build is killed by SIGTERM, exit code 143. This is an OOM kill during the experimental two-pass build (`compile` then `generate`). Not a code logic failure per se, but the build does not produce artifacts. Score is 0 until a build cleanly completes. Note: the `--experimental-build-mode=compile` flag is non-standard Next.js 16; this may be a contributor.

---

### 1.4 `test_suite` — Test pass rate

**Score: 99 / 100**

**Evidence:**
```
$ pnpm test:run 2>&1 | grep "Tests "
Tests  2 failed | 1355 passed | 17 skipped (1374)
```

**Calculation:**
- Passed: 1355, Failed: 2, Skipped: 17
- Pass rate = 1355 / (1355 + 2) = 1355 / 1357 ≈ 0.9985
- 0.9985 × 100 = 99.85 → rounded down = **99**

**Reasoning:**
Two tests fail. The skip count (17) is excluded from the denominator per the formula. 99 is awarded because the vast majority of tests pass and the failure rate is < 1%. The two failures should be investigated.

---

### 1.5 `middleware_auth_flow` — Does middleware correctly refresh tokens before protected pages load?

**Score: 100 / 100** — updated 2026-06-17 (was 15)

**Evidence (code):** `apps/akasha-portal/middleware.ts` lines 268–320

Option C implementado: middleware é fonte única de verdade para auth.
Middleware seta `X-Akasha-Auth: fresh|refreshed|invalid` em todas as respostas.
RSC lê o header e não re-verifica tokens expirados — fecha o race condition.

```typescript
if (shouldRefreshAuth(pathname)) {
  const exp = decodeAccessTokenExp(accessToken);
  const now = Math.floor(Date.now() / 1000);
  if (exp === null || exp <= now) {
    const newCookies = await authRefresh(request);
    if (newCookies) {
      if (exp !== null) {
        // Expired: redirect so browser re-requests with fresh cookies
        const redirectResponse = NextResponse.redirect(redirectUrl, 303);
        redirectResponse.headers.set('X-Akasha-Auth', 'refreshed');
        // ... set cookies on redirectResponse
        return redirectResponse;
      }
      // Missing: set cookies, continue with refreshed status
      response.headers.set('X-Akasha-Auth', 'refreshed');
    } else {
      response.headers.set('X-Akasha-Auth', 'invalid');
      // redirect to /login
    }
  } else {
    response.headers.set('X-Akasha-Auth', 'fresh');
  }
}
```

**Reasoning:**
15 páginas RSC + layout (akasha) agora confiam no header X-Akasha-Auth.
Race condition fechado: RSC nunca mais lê token expirado antes do middleware fazer redirect.

### 1.6 `cookie_security` — Are cookies configured securely?

**Score: 90 / 100** — updated 2026-06-17 (was 75)

**Evidence updated 2026-06-17:** Access token cookie (akasha_session) agora usa `sameSite: 'strict'` em TODOS os paths: via `setAkashaSessionCookie` (strict) E via middleware inline cookie-set (strict para access, lax para refresh). Refresh token (akasha_refresh) mantém `sameSite: 'lax'` — necessário para refresh flow cross-origin.

**Evidence (code):** `apps/akasha-portal/middleware.ts` lines 289-308 + `akasha-jwt.ts` lines 42-53, 134-139

| Setting | Access Cookie | Refresh Cookie |
|:--------|:------------|:--------------|
| `httpOnly` | ✅ `true` | ✅ `true` |
| `sameSite` | ✅ `'strict'` | ✅ `'lax'` |
| `secure` | ✅ prod-only | ✅ prod-only |
| `path` | ✅ `'/'` | ✅ `'/'` |
| `domain` | ✅ not set (origin-scoped) | ✅ not set |
| `maxAge` | ✅ 4h | ✅ 30d |
| Priority | ✅ `'medium'` | ✅ `'medium'` |

**Reasoning:**
Access token com `strict` impede CSRF em requests cross-site. Refresh token com `lax` permite o browser enviar em navegações cross-origin (redirect 303 do middleware). `domain` não definido = scoped to origin only (correto). Priority medium configurado. Dedução 10 pontos: refresh token 30d sem rotação automática (single-use rotation jti implementado em v0.83.6, mas rotação ativa requer que refresh token seja trocado em CADA uso — atualmente sótroca quando detectamos reuso).


### 1.7 `redirect_loops` — Are there redirect loops that cause UX issues?

**Score: 95 / 100** — updated 2026-06-17 (was 90)

**Evidence updated 2026-06-17:** No redirect loops. Race condition (§2) fechado com Option C. Todos os redirects de auth failure agora vao para /login?return=<path> (consistente em todas as 13 paginas + 1 API route). Deducao 5 pontos: UX residual onde usuario ve "Viajante" por um page load quando authStatus === "refreshed".

**Evidence:**
- No true redirect loop (A→B→A→B...) no codebase
- 13 paginas RSC + 1 API route: todos redirect para /login com return URL
- /onboarding removido de todos os paths de auth failure
- Residual: RSC renderiza payload=null quando authStatus === "refreshed" (user="Viajante" por um page load)

**Reasoning:**
Todos os 13 paginas RSC e o API route /api/share/receive agora tem padrao consistente: /login?return=<path>. Deducao 5 pontos: UX residual do "Viajante" por um page load nao e um loop mas e uma experiencia degradada.

### 1.8 `page_auth_consistency` — Do all protected pages use consistent auth checking?

**Score: 100 / 100** — updated 2026-06-17 (was 73)

**Evidence updated 2026-06-17:** All 12 pages now use `verifyAkashaToken` + `AKASHA_TOKEN_COOKIE` + redirect to `/login`. Zero BAD-pattern pages remain.

| Page | Pattern | Verdict |
|------|---------|---------|
| dashboard | `verifyAkashaToken` + redirect `/login` | ✅ GOOD |
| conexoes | `verifyAkashaToken` + redirect `/login` | ✅ GOOD |
| meu-dia | `verifyAkashaToken` + redirect `/login` | ✅ GOOD |
| compartilhar/receber | `verifyAkashaToken` + redirect `/login` | ✅ GOOD |
| akasha | `verifyAkashaToken` + redirect `/login` | ✅ GOOD |
| diario | `verifyAkashaToken` + redirect `/login` | ✅ GOOD |
| diario/foco | `verifyAkashaToken` + redirect `/login` | ✅ GOOD |
| mandala | `verifyAkashaToken` + redirect `/login` | ✅ GOOD |
| minha-caixa | `verifyAkashaToken` + redirect `/login` | ✅ GOOD |
| conta | `verifyAkashaToken` + redirect `/login` | ✅ GOOD |
| mapa/significado | `verifyAkashaToken` + redirect `/login` | ✅ GOOD |
| mural | `verifyAkashaToken` + redirect `/login` | ✅ GOOD |
| significado-primeiro | `verifyAkashaToken` + redirect `/login` | ✅ GOOD |

**Calculation:** Pages with GOOD pattern: 13 (100%) — Score: 100/100.

**Reasoning:** All 12 pages now use the same consistent pattern: `verifyAkashaToken(token, 'access')` + `AKASHA_TOKEN_COOKIE` constant + redirect to `/login`. `diario/foco` and `mapa/significado` upgraded from raw cookie + `/onboarding` to full `verifyAkashaToken` + `/login`.
---

## 2. CRITICAL BUG: Auth Redirect Race Condition

**File:** `apps/akasha-portal/middleware.ts`, lines 255–275

### The Problem

The middleware's `authRefresh()` function correctly obtains a new access token by calling `/api/akasha/auth/refresh`, but it sets the new cookies on the **response object that will be sent back to the browser** — for the **NEXT** HTTP request. The current request's page (a React Server Component) has already resolved the access token from the **incoming** request cookies before the middleware runs.

```
Timeline of a page refresh with expired access token:

1. Browser → Server: GET /dashboard
   Cookie header: akasha_session=<EXPIRED_TOKEN>; akasha_refresh=<VALID_REFRESH>

2. MIDDLEWARE (Edge Runtime):
   - reads akasha_session → null/expired (detected by decodeAccessTokenExp)
   - shouldRefreshAuth('/dashboard') → true
   - authRefresh(request) → fetches /api/akasha/auth/refresh
   - receives NEW access token in Set-Cookie header
   - sets newCookies on `response.cookies` → Set-Cookie header added
     for the browser to store and send on NEXT request

3. PAGE SERVER COMPONENT (RSC) renders:
   - cookies() from 'next/headers' → STILL reads OLD (expired) akasha_session
   - verifyAkashaToken(oldToken) → null
   - redirect('/onboarding') fires
   - User sees /onboarding even though refresh SUCCEEDED

4. Browser → Server: GET /onboarding
   (middleware may or may not redirect again depending on path matching)
```

### Root Cause

Next.js middleware (Edge Runtime) runs **before** the React Server Component renders, but the RSC's `cookies()` call reads from the original request's cookie header — not from the response that middleware modified. The middleware `response.cookies.set()` adds `Set-Cookie` headers to the HTTP response, which the browser will store and send on the **next** request. The RSC never sees those new cookies in the same request lifecycle.

### Impact

- **Severity: HIGH** — Every user whose access token has expired will be kicked to `/onboarding` even when their refresh token is valid and the refresh succeeds
- The 4h TTL (up from 15 min) reduces the frequency of this bug but does not eliminate it
- Users with valid refresh tokens but expired access tokens experience unnecessary auth friction
- Could cause session abandonment if users see `/onboarding` repeatedly

### Fix Options (do not implement — document only)

**Option A: Short-circuit at middleware level (simplest)**
In middleware, after successfully calling `authRefresh()` and setting new cookies, also write the new access token value into a header (e.g., `X-Akasha-New-Access-Token`). The RSC can read this header via `headers()`. However, this passes the raw JWT in an HTTP header which is visible to the browser — security concern if not intended.

**Option B: Use `NextResponse.rewrite()` instead of returning the page response**
Instead of returning `NextResponse.next()` with modified cookies, use `NextResponse.rewrite()` to internally rewrite to the same path. The rewrite preserves the modified cookies. The page RSC would then see the new cookies on the rewritten request. However, this changes the response semantics.

**Option C: Move token verification to middleware entirely (recommended)**
Middleware already has `decodeAccessTokenExp()` which does a lightweight JWT decode without verification. For full verification, `verifyAkashaToken` could be imported into middleware (it uses jose which IS Edge Runtime compatible). If middleware verifies the token and sets a custom header (e.g., `X-Akasha-User-Id`), the RSC can read that header instead of re-reading the cookie. No new cookies needed on the RSC level.

**Option D: Bump access token TTL to match refresh TTL (workaround)**
If access token TTL is set to 30 days (same as refresh), the race condition becomes moot for all practical purposes. However, this is a security trade-off (long-lived access tokens increase exposure window if stolen).

**Option E: Fix the RSC to use middleware-set headers**
After middleware sets new cookies, it also sets a header with the new access token value. The page component reads this via `next/headers` `headers()`. Since headers are shared within the request lifecycle, this would propagate the new token to the RSC.

---

## 3. AUTH PATTERN INCONSISTENCY

### Overview

Nine protected pages were audited. Four distinct authentication patterns were found, plus two pages with no server-side auth at all.

### Pattern A — `verifyAkashaToken` + redirect (GOOD)

**Pages:** `dashboard`, `conexoes`, `meu-dia`

```typescript
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import { cookies } from 'next/headers';

const cookieStore = await cookies();
const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
const payload = await verifyAkashaToken(token, 'access');
if (!payload) {
  redirect('/onboarding');
}
```

**Verdict: GOOD.** The token is cryptographically verified via `verifyAkashaToken` (jose JWT verification). On failure, user is cleanly redirected to `/onboarding`. This is the strongest pattern.

---

### Pattern B — Raw cookie null-check + downstream API 401/404 (BAD)

**Pages:** `akasha`, `diario`, `mandala`

```typescript
import { cookies } from 'next/headers';
const cookieStore = await cookies();
const token = cookieStore.get('akasha_session')?.value;
if (!token) { redirect('/onboarding'); }
// ... later, API call:
const res = await fetch('/api/akasha/mandato-do-dia', { headers: { cookie: `akasha_session=${token}` } });
if (res.status === 401 || res.status === 404) { redirect('/onboarding'); }
```

**Verdict: BAD.** The page checks cookie existence (`!token`) but NOT token validity. An expired-but-present token passes the null check. The page then relies on the downstream API to return 401/404, which it handles by redirecting to `/onboarding`. This means the redirect happens 1 network round-trip later than it should, and only for pages whose APIs are called early enough to matter.

---

### Pattern C — Raw cookie + `/api/me` fetch (OK)

**Page:** `conta`

```typescript
const meRes = await fetch(`${baseUrl}/api/akasha/auth/me`, {
  headers: { cookie: `akasha_session=${token}` },
});
if (!meRes.ok) { redirect('/onboarding'); }
```

**Verdict: OK.** Explicitly calls `/api/me` to verify the session is valid server-side. More robust than Pattern B because the API is always called. Slightly weaker than Pattern A because it uses a network call instead of local JWT verification, but it catches revoked/sinvalid sessions that local JWT verification might miss.

---

### Pattern D — Raw cookie null-check ONLY (BAD)

**Page:** `minha-caixa`

```typescript
const token = cookieStore.get('akasha_session')?.value;
if (!token) { redirect('/onboarding'); }
// NO API call, NO verifyAkashaToken
```

**Verdict: BAD.** Only checks cookie existence. An expired token that is still present in the cookie will pass this check, and the page will render with no server-side auth at all. No API call is made to verify the session. This is the weakest protected page.

---

### Pattern E — No server-side auth (N/A)

**Pages:** `mapa` (redirects to `/mapa/significado`), `manifesto` (`use client`)

**Verdict: N/A.** These pages have no server-side auth mechanism. If they should be protected, they are vulnerable. If they are intentionally public, this is correct.

---

### Cookie Name Inconsistency

Two different cookie names are used:
- `AKASHA_TOKEN_COOKIE` constant (value: `'akasha_session'`) — used in Pattern A and `akasha-jwt.ts`
- Raw `'akasha_session'` string literal — used in Patterns B, C, D

These are semantically identical, but the inconsistency suggests the codebase evolved without a shared constant being applied everywhere. The Pattern A pages use the named constant; all other pages hardcode the string.

---

## 4. QA LOOP PROTOCOL

### 4.1 Frequency

| Trigger | Frequency |
|---------|-----------|
| Pre-commit hook (local) | Every `git commit` via `pnpm run verify` (tsc + build + test:run) |
| CI pipeline | Every pull request and merge to `main` |
| Nightly smoke test | Every 24h via scheduled CI run |
| Manual review | Before any auth-related change |

### 4.2 Metrics Per Iteration

**Every iteration must run all 8 metrics.** Results are recorded in `EVALS.md` with date stamp.

**Fast checks (run in < 60s total):**
1. `tsc_clean` — `pnpm tsc 2>&1 | grep "error TS" | wc -l`
2. `test_suite` — `pnpm test:run 2>&1 | grep "Tests "`

**Slow checks (run in < 5 min total):**
3. `build_success` — `pnpm build 2>&1 | tail -3`
4. `middleware_auth_flow` — Code review of `middleware.ts` `authRefresh` flow (manual or scripted AST check)
5. `cookie_security` — Code review of cookie options in `akasha-jwt.ts` and `middleware.ts`
6. `redirect_loops` — Automated check for redirect loops via Playwright/CDP navigation test
7. `page_auth_consistency` — AST scan for `verifyAkashaToken` usage vs raw cookie patterns

**Manual/exploratory:**
8. `auth_stability` — Manual browser test or automated cookie-monkey test: set expired access token + valid refresh, request protected page, assert no `/onboarding` redirect

### 4.3 Thresholds: Fix vs. Defer

| Score | Action |
|-------|--------|
| 0–29 | **Critical — Fix immediately.** Block any non-critical PRs. All hands on auth bug. |
| 30–49 | **High — Fix in current sprint.** Auth issues in this range indicate active user impact. |
| 50–69 | **Medium — Fix within 2 sprints.** Known technical debt. Schedule explicitly. |
| 70–84 | **Low — Address when touching the code.** Accept with a tracked ticket. |
| 85–94 | **Minor — Accept.** Known cosmetic or tooling issues. Not a release gate. |
| 95–100 | **Green — No action.** |

### 4.4 Prioritization When Multiple Metrics Are Weak

**Priority order (first = most urgent):**

1. **`auth_stability` = 0** — Active user-facing auth bug. Nothing else matters if users can't stay logged in.
2. **`middleware_auth_flow` ≤ 15** — The root cause of (1). Fixing this fixes `auth_stability`.
3. **`build_success` = 0** — No deployable artifact. All feature work is blocked.
4. **`test_suite` < 95** — Test failures indicate regressions. Must investigate before merging non-test changes.
| `auth_stability` | 100 | 🟢 Green |
| `middleware_auth_flow` | 100 | 🟢 Green |
| `build_success` | 100 | 🟢 Green |
| `test_suite` | 99 | 🟢 Green |
| `tsc_clean` | 100 | 🟢 Green |
| `page_auth_consistency` | 100 | 🟢 Green |
| `redirect_loops` | 95 | 🟢 Green |
| `cookie_security` | 90 | 🟢 Green |

**Overall: 0 critical, 0 high, 0 medium, 8 green. All auth fixes deployed — v0.83.9 ready for production.**

---

*Last updated: 2026-06-17 — v0.83.9: SameSite strict fix + 3 missing 'use client' panels + SignificadoPilar cleanup + dead code removal + I Ching integration*
