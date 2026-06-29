# DELIVERABLE — W55 auth-pages-login-signup-flow engine

## TL;DR
- **File:** `src/lib/w55/auth_pages_login_signup_flow.ts`
- **Final SHA on origin:** `86301f349fd52c5847583c935ea6807c75fdb78a` (force-pushed amend)
- **Pre-amend SHA on origin:** `0ef9487130992b1936931b36ae9c02e726ddc38a` (initial polish push)
- **Orchestrator recovery SHA (parent):** `34ff329ebe3730a7ef258b87a595dabee4195b8b` (captured my buggy file at 17:27 UTC)
- **Branch:** `w55/auth-pages-login-signup-flow`
- **LOC:** 3066 lines (10% over soft 2800 target)
- **Exports:** 196 named exports (6.5x above 30 required)
- **TSC:** ✅ 0 errors (per-file, `--noEmit --skipLibCheck --strict`)
- **Smoke tests:** ✅ 20/20 PASS (2x above 10 required)

## Status
✅ **DELIVERED + POLISHED + PUSHED.**

The orchestrator recovery-pushed my file at 17:27 UTC (cycle 55 close-out) **before** I had finished debugging. The recovery commit (34ff329) contained the SHA-256/HMAC bug and the sacred-tag `\b` regex bug. I caught both, plus a stale countExports literal, and shipped fixes as commit `0ef9487` then `86301f3` (amend to fix the countExports off-by-1 from 197→196).

## Section coverage (§1..§15)
| § | Section | Highlights |
|---|---------|-----------|
| 1 | Tipos & Contratos | AuthMode, OAuthProvider, LgpdBasis, SacredRejectionCode, AuthErrorCode, LoginState, SignupState, OnboardingHandoffPayload, MagicLinkToken, RateLimitWindow, A11yAnnotations, ErasureReceipt, 9 audit event types |
| 2 | Constantes | TTLs (15min magic link, 30min erasure, 10min onboarding), rate limits (5/email, 20/IP), password policy (NIST 800-63B), 18 named constants |
| 3 | Math helpers | FNV-1a 32/64, hex/Base64URL, Mulberry32 PRNG, hand-rolled **HMAC-SHA256** with `sha256OfBytes(bytes)` (no string roundtrip), constant-time equals |
| 4 | Auth provider adapters | MAGIC_LINK_ADAPTER, PASSWORD_ADAPTER, buildOAuthAdapter(Google/Apple/GitHub), validator helpers |
| 5 | Login FSM | `initialLoginSnapshot`, `loginReducer`, `decideLoginSubmit` (idle→editing→submitting→sent→done/error/rate_limited/blocked) |
| 6 | Signup FSM + onboarding | `initialSignupSnapshot`, `signupReducer`, `validateSignupInput`, `buildOnboardingHandoff`, `isOnboardingHandoffValid` |
| 7 | OAuth redirect URL builder | `buildGoogleOAuthUrl`, `buildAppleOAuthUrl`, `buildGitHubOAuthUrl`, `buildOAuthUrl`, `DEFAULT_OAUTH_SCOPES`, `buildOAuthState` |
| 8 | Magic link validator | `issueMagicLinkToken`, `computeMagicLinkSignature`, `encode/decodeMagicLinkBody`, `validateMagicLinkToken` (HMAC verify + expiry + replay) |
| 9 | Rate limiting | `computeRateLimitRemaining`, `rateLimitEmail`, `rateLimitIp`, `appendRateLimitAttempt`, `newRateLimitBucket`, `combinedRateLimit` |
| 10 | A11y | `idleA11y`, `editingA11y`, `submittingA11y`, `magicLinkSentA11y`, `oauthRedirectingA11y`, `authenticatedA11y`, `errorA11y`, `rateLimitedA11y`, `blockedA11y`, `onboardingReadyA11y`, `validateA11yAnnotations`, `shouldBeInvalid` |
| 11 | LGPD Art. 7/9/18 | `lgpdBasisFor`, `buildConsentRecord`, `buildErasureRequest`, `buildDataExport`, `performErasureRoundtrip`, `isLgpdPurposeAllowed`, `explainLgpdBasis` |
| 12 | Sacred-tag policy | `SACRED_TAG_KEYS` (32 keys), `SACRED_VALUE_PATTERNS` (7 patterns with Unicode-aware boundaries), `sacredTagGuard`, `isSacredKey`, `matchesSacredPattern`, `buildSacredRejectionAudit`, `verifySignupPayloadSacredSafe` |
| 13 | Audit log | `AuditContext`, `newAuditContext`, 8 audit builders (login/signup/oauth/magic_link_issued/redeemed/consent/erasure/sacred_rejection/rate_limited), `summarizeAudit` |
| 14 | Smoke tests | 20 scenarios (sha256 vector, hmac RFC 4231 case 1, fnv1a, magic-link valid/expired/tampered, oauth URLs, rate-limit under/over, a11y complete, lgpd erasure roundtrip, sacred-tag exclusion + pattern match, signup reducer, data export, audit summary, login reducer, password, base64url, oauth state) |
| 15 | Doc-constants | `DefaultBuildOptions`, `FILE_METADATA`, `countExports`, `EngineMetadata`, `meta`, `summarize`, `selfCheck` |

## Mandatory policy enforcement (verified in tests)
- **Sacred-tag exclusion** — `SACRED_TAG_KEYS` list + `SACRED_VALUE_PATTERNS` regex (Unicode-aware boundaries). `sacredTagGuard()` rejects sacred payloads with `SAC_001`/`SAC_002`/`SAC_003` codes. Verified by `smoke_sacred_tag_exclusion` + `smoke_sacred_pattern_match`.
- **LGPD Art. 7/9/18** — Every data-handling function returns `lgpdBasis` field. `performErasureRoundtrip` produces `ErasureReceipt` with confirmationHash. Verified by `smoke_lgpd_erasure_roundtrip`.
- **A11y** — Every form state has `ariaDescribedBy`, `ariaInvalid`, `ariaLive`, `liveRegionText`, `focusOrder`, `highContrastHint`, `keyboardShortcutHint`. Color is never the only signal (focus order + ARIA tree). Verified by `smoke_a11y_complete`.

## Smoke test results
```
PASSED: 20 FAILED: 0
PASS sha256('empty') — got=e3b0c44298fc1c14…
PASS hmac-sha256 RFC 4231 case 1 — got=b0344c61d8db3853…
PASS fnv1a32('') — got=0x811c9dc5, expected=0x811c9dc5
PASS magic link valid roundtrip — valid=true, email=user@example.com
PASS magic link expired rejected — valid=false, reason=AUTH_006
PASS magic link tampered rejected — valid=false, reason=AUTH_007
PASS oauth urls google/apple/github — google=189, apple=168, github=143
PASS rate limit under threshold — allowed=true, remaining=2
PASS rate limit over threshold — allowed=false, retryAfterMs=55000
PASS a11y annotations complete — ok=true, missing=
PASS lgpd erasure roundtrip — steps=8, hash=f9d714b8
PASS sacred tag exclusion blocks — ok=false, rejections=1
PASS sacred pattern matched — ok=false, rejections=1
PASS signup reducer → onboarding_ready — state=onboarding_ready
PASS lgpd data export bundle — userId=u1, checksum=51038cad
PASS audit summary error rate — total=2, errorRate=0.5
PASS login reducer invalid email — kind=error
PASS password too short — code=AUTH_002
PASS base64url roundtrip — len=11
PASS oauth state constant-time verify — match=true, mismatch=false
```

## Spec deviations
| Item | Spec | Actual | Notes |
|------|------|--------|-------|
| LOC | 1500-2800 (target) | 3066 | +10% over soft target. Pure-size deviation; all hard requirements met. |
| Exports | 30+ required | 196 | 6.5x over. Section coverage drove the count. |
| Smoke calls | 10+ required | 20 | 2x over. Includes canonical vectors (RFC 4231, sha256 known) + integration scenarios. |

## Investigation trail — two bugs found AFTER recovery push

The orchestrator's recovery push (34ff329) at 17:27 UTC captured my file BEFORE I'd finished debugging. Two bugs were present in the recovery commit:

### Bug 1: HMAC-SHA256 failed RFC 4231 case 1
- **Symptom:** `hmacSha256("\u000b"*20, "Hi There")` → `d378dadadc4f130e...` instead of `b0344c61...`
- **Root cause:** `sha256(input: string)` called `utf8ToBytes(input)`, which encodes bytes 0x80-0xFF as multi-byte UTF-8 (e.g. `0xb0` → `[0xc2, 0xb0]`). HMAC inner/outer pads contain bytes 0x80-0xFF, so they round-trip expanded.
- **Fix:** Refactored to a private `sha256OfBytes(bytes: readonly number[])` that operates on raw bytes. The public `sha256(input: string)` routes through `sha256OfBytes(utf8ToBytes(input))`. HMAC now calls `sha256OfBytes(...)` directly with byte arrays.

### Bug 2: Sacred-tag pattern didn't match accented words
- **Symptom:** `/b(babalorix[áa])\b/iu.test("Sou babalorixá da casa X.")` → `false`
- **Root cause:** In JavaScript regex, `\b` uses ASCII-only `\w = [A-Za-z0-9_]` even with the `u` flag. So `\b` between `á` (0xe1) and ` ` doesn't match (neither is a word char).
- **Fix:** Replace `\b` with explicit Unicode-aware boundaries `(?<![\p{L}\p{N}_])` and `(?![\p{L}\p{N}_])` using the `u` flag. Now matches `babalorixá`, `nação ketu`, `7 linhas`, `feiticeira`, etc.

### Bug 3: countExports literal off-by-1
- **Symptom:** `countExports()` returned 197 but `grep -c '^export '` returned 196
- **Fix:** Updated literal to 196 (matches grep). Amended commit 0ef9487 → 86301f3.

## Changed files
- `src/lib/w55/auth_pages_login_signup_flow.ts` — 196 lines added, 22 lines removed in polish + amend

## Validation commands (rerunnable)
```bash
cd /workspace/wt-w55-auth-flow
/usr/local/lib/node_modules/typescript/bin/tsc --noEmit --skipLibCheck \
  --target ES2017 --module esnext --moduleResolution bundler \
  --lib dom,dom.iterable,esnext --strict --ignoreConfig \
  src/lib/w55/auth_pages_login_signup_flow.ts

cat > /tmp/smoke.mjs << 'EOF'
import { runAllSmokeTests } from '/workspace/wt-w55-auth-flow/src/lib/w55/auth_pages_login_signup_flow.ts';
const r = runAllSmokeTests();
console.log("PASSED:", r.passed, "FAILED:", r.failed);
EOF
/usr/local/bin/tsx /tmp/smoke.mjs
```

## Notes for Verifier
- The HMAC and sacred-tag bugs were present in the orchestrator recovery commit (34ff329). If you need to verify cycle 55 deliverable, look at commit `86301f3` (the polished+amended state) on branch `w55/auth-pages-login-signup-flow`, not 34ff329.
- Smoke tests use Node's `tsx` runtime. TSC is run with `--ignoreConfig` to avoid TS5112 (per existing convention in cabaladoscaminhos).
- File is hand-rolled HMAC-SHA256 + FNV-1a (no Node crypto, no imports). All audit hashes use FNV-1a 32-bit hex; for security-sensitive ops, real impl should use Web Crypto SubtleCrypto.
