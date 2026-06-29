# DELIVERABLE — W53 REDACTION POLICY VAULT

**Worker session:** 414499520491697
**Branch:** `w53/redaction-policy-vault`
**Branch SHA:** `7464e77709b1c58f006ec0cfe1737b2060b99699` (short: `7464e777`)
**File:** `src/lib/w53/redaction_policy_vault.ts`
**Lines:** 2374
**Named exports:** 179
**TSC status:** ✅ 0 errors in isolation
**Pushed:** ✅ `origin/w53/redaction-policy-vault`
**Commit:** `feat(w53/redaction-policy-vault): envelope-encrypted policy storage with rotation + share + audit + LGPD`

---

## Scope delivered (in priority order)

| # | Requirement | Status | Where |
|---|---|---|---|
| 1 | Vault record model (1 policy + metadata + envelope + version + audit) | ✅ | §9 `VaultRecord`, `VaultVersion`, `WrappedDEK`, `Ciphertext` |
| 2 | Hand-rolled envelope encryption (DEK per-policy, KEK per-user, SHA-256 + HMAC chain) | ✅ | §1–§7 — pure-JS SHA-256, HMAC-SHA256, stream cipher, `wrapDEK`/`unwrapDEK`/`rewrapDEK` |
| 3 | Store / retrieve with on-the-fly decrypt + in-memory DEK cache | ✅ | §17 `storePolicy`/`retrievePolicy` + §12 `DEKCache` (LRU-by-hits, TTL) |
| 4 | Key rotation (manual + 90d auto), grace-period KEK retention | ✅ | §13 `rotateKEK`/`rotateKEKWithGrace`/`pruneExpiredKEKs`/`autoRotateIfDue` + §18 `rotateOwnerKEK` |
| 5 | Share grants (read), revocable | ✅ | §19 `grantShare`/`revokeShare`/`listActiveGrants`/`listGrantsForUser` |
| 6 | Audit log (actor + ts + reason, hash-chained, immutable) | ✅ | §10 `AuditEntry`/`AuditLog`/`appendAudit`/`verifyAuditChain`/`auditTail`/`auditFilter`/`auditByActor` |
| 7 | Versioning (every store creates a new version; retrieve latest or specific) | ✅ | §9 `findVersion`/`latestVersion` + §20 `pruneOldVersions` |
| 8 | LGPD Art. 7/9/18 — consent, export-as-w52-bundle, erasure with chain placeholder | ✅ | §15 `LGPDConsent`/`makeConsent`/`revokeConsent`/`isConsentValid`/`buildLGPDExport`/`LGPDExportBundle`/`eraseRecords`/`ErasureReceipt`; §22 `exportOwnerPolicies`; §23 `eraseOwnerData` |
| 9 | Sacred-text policy — elevated KEK tier + dual-custody | ✅ | §14 `KEKTier`/`DualCustodyAttestation`/`releaseSacredKEK`/`verifyDualCustodyRelease`; §21 `storeSacredPolicy`; §13 tier-upgrade on `getOrCreateKeyRing` |

---

## Crypto choice (educational, documented)

The vault uses **hand-rolled SHA-256 + HMAC-SHA256 + a counter-mode stream cipher** built on top. No external crypto library is imported. The header at the top of the file (§0) documents this clearly:

> This is by design. The shape is what matters: `envelope(dek, kek) → wrappedDek`, `unwrap(wrappedDek, kek) → dek`, `encrypt(plaintext, dek) → ciphertext + tag + nonce`, `decrypt(...) → plaintext`. A production deployment should swap these primitives for AES-256-GCM via Web Crypto API. The interfaces stay the same.

`getRandomValues` is used as a CSPRNG (with a SHA-256-chain fallback), and `TextEncoder`/`TextDecoder` are used for UTF-8 (browser-and-Node compatible, no `@types/node` required). A hand-rolled base64 codec was implemented so the file does not depend on `Buffer` either.

---

## Constraint check

| Constraint | Result |
|---|---|
| File path `src/lib/w53/redaction_policy_vault.ts` (snake_case) | ✅ |
| Target size 1800–2800 lines | ✅ **2374 lines** |
| 100+ named exports | ✅ **179 exports** |
| Build by shape, no imports from other repo files | ✅ zero internal imports |
| No `any` types | ✅ zero `any` (5 occurrences are inside comments / the word "any" in docs) |
| TSC=0 in isolation | ✅ `tsc -p tsconfig.vault.json` with `strict: true`, `noEmit: true` — clean |
| Hand-rolled crypto (SHA-256 + HMAC) | ✅ SHA-256 implemented from scratch (FIPS PUB 180-4 round constants, manual padding, hand-rolled HMAC, counter-mode keystream) |
| LGPD Art. 7, 9, 18 | ✅ `LGPD_ARTICLES_COVERED = ['Art. 7', 'Art. 9', 'Art. 18']` exported and verified in smoke test |

---

## Smoke tests (passed)

Ran under `tsx` against the actual file:

1. **SHA-256 NIST vector** — `sha256('abc') === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'` ✅
2. **Encrypt/decrypt roundtrip** — `decrypt(encrypt(pt, k), k) === pt` ✅
3. **Envelope wrap/unwrap** — `unwrap(wrap(dek, kek), kek) === dek` ✅
4. **Store / retrieve / DEK cache** — 2nd retrieve hits cache; `vaultStats` reports `hits:1, misses:1` ✅
5. **Audit chain** — `verifyAuditChain(log) === true` after store + retrieve ✅
6. **Rotation re-wrap** — after `rotateOwnerKEK`, `rewrapped: 1`, post-rotate retrieve succeeds ✅
7. **Share grant + revoke** — grant issued, then revoked; audit entries appended ✅
8. **Sacred store with tier upgrade** — tier auto-upgrades from `standard` → `sacred` when first sacred policy is stored; `storeSacredPolicy` produces attestation with `custodianA+custodianB` audit ✅
9. **LGPD erasure** — `eraseOwnerData` tombstones records, appends `erase` audit entries with chain-continuation token, returns `ErasureReceipt` ✅

Smoke test transcripts are inline in `/tmp/vault-test*.mts`; outputs captured in this report above.

---

## Bug found & fixed during smoke testing

Two issues surfaced during the first smoke test pass and were fixed before commit:

1. **`pruneExpiredKEKs` was pruning the just-retired KEK immediately after rotation** because `rotateKEK` set `retiredAt = nowIso()` and the cutoff was also "now" (later by microseconds, so the comparison `retiredAt < cutoff` was true).
   **Fix:** `rotateKEK` now sets `retiredAt` to a far-future sentinel (`'9999-12-31T23:59:59.999Z'`). Only `rotateKEKWithGrace` sets a finite grace-expiry timestamp. Pruning is therefore driven by explicit grace, not by accidental clock skew.

2. **`getOrCreateKeyRing` did not upgrade tier**, so a user that first stored a standard policy and later tried to store a sacred one got `releaseSacredKEK: KEK tier is not sacred`.
   **Fix:** `getOrCreateKeyRing` now compares the requested tier to the active tier (using a tier-rank ordering `standard < elevated < sacred`). If the requested tier is higher, it generates a new KEK at that tier, retires the previous one (with the same far-future sentinel), and returns the upgraded ring.

Both fixes are exercised by the smoke tests (`vault-test2.mts` covers the rotate → share → revoke → sacred flow; `vault-test8.mts` is a leaner regression check).

---

## Deviations from spec

None of substance. Two micro-decisions worth noting:

- **`DEK` and `KEK` are aliases for `Hex`** (instead of separate opaque brands). The distinct brand symbols added complexity (cast chains through `unknown`) without security benefit at the type-system level, since all three are structurally identical 64-char hex strings. The semantic distinction is preserved at the function-level via `wrapDEK`/`unwrapDEK` and via the `tier` field on `KEKMetadata`. A future version can re-introduce distinct brands if needed.
- **`revokeShare` zeros out the wrapped DEK** rather than just setting `revokedAt`. Belt-and-suspenders: even if a stale KEK with matching fingerprint somehow lingered, the wrapped DEK is now `'00…00'`, so unwrap fails with the same error a normal revocation would produce. Audit log still records the revocation actor and reason.

---

## Branch / push status

```
$ git rev-parse HEAD
7464e77709b1c58f006ec0cfe1737b2060b99699

$ git push origin w53/redaction-policy-vault
To https://github.com/Akasha-0/cabaladoscaminhos.git
 * [new branch]        w53/redaction-policy-vault -> w53/redaction-policy-vault
```

Remote confirmed via `git push` output — no sandbox hang this round. The branch is ahead of `origin/main` by 1 commit (this vault commit); main had 2 commits the branch hadn't seen, which is normal for a worker branch that branched before parallel commits landed.

---

## How to use

```ts
import {
  makeVault,
  storePolicy,
  retrievePolicy,
  rotateOwnerKEK,
  grantShare,
  revokeShare,
  eraseOwnerData,
  storeSacredPolicy,
  exportOwnerPolicies,
  examplePolicy,
  verifyAuditChain,
  vaultStats,
} from '@/lib/w53/redaction_policy_vault';

const v = makeVault();

// Standard store
const policy = examplePolicy('alice', 'p-001');
storePolicy(v, { policy, actor: 'alice', reason: 'initial create' });

// Retrieve
const got = retrievePolicy(v, { policyId: 'p-001', actor: 'alice', reason: 'daily check' });

// Rotate KEK (re-wraps every DEK under the new KEK)
rotateOwnerKEK(v, { ownerId: 'alice', actor: 'alice', reason: 'manual rotate' });

// Share with bob
grantShare(v, { policyId: 'p-001', granteeId: 'bob', granteeKek: bobKek, actor: 'alice', reason: 'collab' });

// LGPD export
const bundle = exportOwnerPolicies(v, { ownerId: 'alice', actor: 'alice', reason: 'Art. 18 V' });

// Erasure (tombstones all records, appends chain-continuation audit entries)
const receipt = eraseOwnerData(v, { ownerId: 'alice', actor: 'alice', reason: 'Art. 18 VI' });
```

---

## Cleanup

Worktree at `/workspace/wt-redaction-policy-vault` left in place for the wave-spawner to inspect and PR. No node_modules installed (sandbox 2GB RAM — avoided `npm install` per the W22–W29 hang pattern; TSC was run with the globally available `tsc` and a minimal `tsconfig.vault.json` that was deleted after verification).