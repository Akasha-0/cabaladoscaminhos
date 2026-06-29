# W65 marketplace-pricing-engine — DELIVERABLE

**Branch:** `w65/marketplace-pricing-engine`
**Worker:** C (session 414594685456687)
**Date:** 2026-06-29 (cycle 65)
**Status:** ✅ DELIVERED + VERIFIED + READY TO PUSH

---

## 1. Mission summary

Built the **marketplace pricing + escrow ledger** for the Cabala Marketplace.
This is the revenue layer: paid leituras, práticas, mentorias, rituais.

Integrates with:
- **W57 reputation system** (seller eligibility: ≥10 readings + ≥4.0 rep)
- **W64 akasha-session-export** HMAC chain pattern (same `process.getBuiltinModule("node:module")` → `createRequire` → `node:crypto` route)

---

## 2. Files delivered

| File | LOC | Purpose |
|------|-----|---------|
| `src/lib/w65/marketplace-pricing-engine.ts` | 1067 | Engine — 14 sections, 17 functions, 5 error classes |
| `src/lib/w65/marketplace-pricing-engine.spec.ts` | 990 | Self-running test harness — 89 it blocks across 12 describe groups |
| `src/lib/w65/smoke-runtime.mjs` | 144 | 6-scenario end-to-end smoke test |
| `tsconfig.w65.json` | 17 | Isolated TSC config (engine + spec, strict mode, allowImportingTsExtensions) |
| `DELIVERABLE.md` | (this) | Operational doc |

Total: **2218 LOC**, 5 files.

---

## 3. Public exports (≥ 8)

All 8 required exports present, plus 9 additional public helpers/type guards.

### Required (8)
1. `priceService(input, ctx)` → `PricingResult` — BRL cents, integer math, never-throws
2. `holdEscrow(transactionId, amountCents, ctx)` → `EscrowRecord` — opens ledger entry
3. `releaseEscrow(escrowId, ctx)` → `{ released, ledgerHash }` — flips HELD→RELEASED
4. `refundEscrow(escrowId, reason, ctx)` → `{ refunded, ledgerHash }` — flips HELD→REFUNDED with reason
5. `isSellerEligible(sellerId, ctx)` → `{ eligible, reasons, reputation, readings }` — gates on ≥10 reads + ≥4.0 rep
6. `auditMarketplacePricing()` → `AuditReport` — coverage report with `isFullCoverage` flag
7. `validatePricing(p)` → `{ ok, errors }` — never-throws validator
8. `chainEscrowHash(prevHash, escrow, secret)` → 64-char hex string (HMAC-SHA256)

### Bonus (9)
- `verifyEscrowChain(escrows, secret)` → `{ ok, brokenAt, reason }` — end-to-end integrity check
- `listEscrows()` → readonly array of all in-memory ledger records
- `resetEscrowLedgerForTest()` — clears in-memory ledger (test helper)
- `dispatchMarketplace(input, transactionId, ctx)` — one-call price+escrow convenience
- `clampUnit(x)` — defensive [0,1] clamp
- `cents(n)` — defensive integer rounding
- `reputationDiscount(rep)` — 0..5 → 0..0.10
- `composeSacredMultiplier(tags)` — multiplicative sacred-tag composition with runaway protection
- `findSacredTag(tag)` — O(n) lookup by name

### Type guards (3)
- `isServiceType(s)` — 8 valid types
- `isTier(t)` — 4 valid tiers
- `isSacredTradition(t)` — 5 traditions

### Error classes (5)
- `MarketplacePricingError` (base)
- `InvalidServiceTypeError`
- `InvalidTierError`
- `EscrowError`
- `IntegrityError`

All error messages embed codes for string-based `toThrow` matching (cycle 64 lesson 5).

---

## 4. Service types (8 — floor 6)

| ServiceType | minCents (R$) | maxCents (R$) | default duration |
|---|---|---|---|
| `LEITURA_CIGANO` | 3000 | 8000 | 30 min |
| `CONSULTA_TAROT` | 8000 | 20000 | 60 min |
| `MENTORIA_ESPIRITUAL` | 15000 | 40000 | 60 min |
| `RITUAL_GUIA` | 20000 | 50000 | 90 min |
| `MESA_REAL` | 40000 | 100000 | 120 min |
| `CONSULTA_ASTRO` | 25000 | 60000 | 90 min |
| `ESTUDO_CABALA` | 20000 | 50000 | 90 min |
| `TERAPIA_TANTRA` | 30000 | 80000 | 90 min |

All integer BRL cents. Min < max enforced.

---

## 5. Sacred-tag coverage (≥ 81 — actual: 81+)

| Tradition | Count | Floor | Audit status |
|---|---|---|---|
| CIGANO | 36 (4 naipes × 8 numeração + 4 reis) | 30 | ✓ PASS |
| ORIXAS | 16 (4 linhas × 4 orixás) | 16 | ✓ PASS |
| CHAKRAS | 7 (Muladhara → Sahasrara) | 7 | ✓ PASS |
| SEFIROT | 10 (Keter → Malkuth) | 10 | ✓ PASS |
| HOUSES | 12 (Casa 1 → Casa 12) | 12 | ✓ PASS |
| **TOTAL** | **81** | **81** | **5/5 PASS** |

Per-card modifiers in [0.90, 1.10] (Cigano); premium orixás (Exu, Oxalá, Pomba-Gira) command up to +20%.

---

## 6. Tier multipliers (4)

```
BASIC        = 1.0×
INTERMEDIATE = 1.5×
ADVANCED     = 2.0×
MASTER       = 3.0×
```

---

## 7. HMAC escrow ledger

Reuses the **W64 akasha-session-export pattern**:
1. `process.getBuiltinModule("node:module")` → ESM-safe require
2. `createRequire(import.meta.url)` → load `node:crypto`
3. `crypto.createHmac("sha256", key)` → HMAC-SHA256

**Chain semantics:**
- Genesis hash: `"GENESIS"` (well-known sentinel)
- Each link: `prevHash || GENESIS`, `deriveKey(secret, prevHash)`, hash `(prev|payload)`
- Payload: `prevHash|escrowId|amountCents|status|heldAt`
- Output: 64-char hex

**Critical fix during dev:** `releaseEscrow`/`refundEscrow` must re-chain using `existing.prevHash` (the link's true predecessor), NOT `_lastLedgerHash` (which may have advanced due to intervening operations). Otherwise `verifyEscrowChain` fails after a release/refund.

---

## 8. Verification

### TSC (strict mode, isolated tsconfig)
```
tsc --project tsconfig.w65.json
→ 0 errors
```

### Unit tests (89 it blocks, 12 describe groups)
```
node --experimental-strip-types src/lib/w65/marketplace-pricing-engine.spec.ts
→ Describes: 12
→ It blocks: 89
→ Passed: 89
→ Failed: 0
✅ all assertions passed
```

### Runtime smoke (6 scenarios)
```
node --experimental-strip-types src/lib/w65/smoke-runtime.mjs
→ ✓ smoke-1: priceService computes valid integer cents for 8×4 matrix
→ ✓ smoke-2: HMAC chain holds, releases, verifies end-to-end
→ ✓ smoke-3: refundEscrow with reason flips status to REFUNDED + chain still verifies
→ ✓ smoke-4: isSellerEligible gates correctly on ≥10 + ≥4.0
→ ✓ smoke-5: auditMarketplacePricing reports full coverage (≥8 + 5 sacred floors)
→ ✓ smoke-6: dispatchMarketplace prices + holds in single call
=== smoke result: 6/6 passed ===
```

---

## 9. Anti-patterns avoided

- ❌ Float BRL → integer cents only (`Number.isInteger(r.finalCents)` enforced in tests)
- ❌ `any` / `as unknown as` → explicit types throughout; `as unknown as` only used for `globalThis.process`
- ❌ Shared mutable defaults → `Object.freeze` on `SERVICE_DEFAULTS` + all 5 sacred-tag arrays + audit
- ❌ `.includes()` for sacred tags → `Set<string>` lookup in `composeSacredMultiplier` (O(n+m) not O(n×m))
- ❌ Throwing on validation → `validatePricing` returns `{ ok, errors[] }`, never throws
- ❌ Inline 100+ entries → split into 5 tradition constants (CIGANO_CARDS, ORIXAS, CHAKRAS, SEFIROT, HOUSES) + aggregator

---

## 10. Honest concerns

- **In-memory ledger only** — `ESCROW_LEDGER: Map<string, EscrowRecord>` is ephemeral. Persistent storage (Postgres/Redis) is the caller's responsibility. The `dispatchMarketplace` and `holdEscrow` return records can be persisted by the caller after each call.
- **HMAC chain is in-process** — re-chaining on release/refund mutates the ledger entry in place. In a multi-instance deployment, this would need a proper DB with row-level locking.
- **Seller reputation map is passed by reference** — `ctx.reputationByUser` is a `Map` shared by reference; the engine never mutates it, but callers should pass fresh maps if they want isolation.
- **Sacred tag lookups are O(n) over ALL_SACRED_TAGS (81)** — for 99% of use cases (1-10 tags per service) this is fine. If profiling shows hot spots, build a `Map<string, SacredTagEntry>` lookup at module init.
- **Email regex NOT used here** — this engine doesn't touch PII. PII redaction belongs in the W64 export engine. We do enforce integer BRL cents only.

---

## 11. Push command (for orchestrator)

```bash
cd /workspace/wt-w65-market && \
  git add src/lib/w65/marketplace-pricing-engine.ts \
          src/lib/w65/marketplace-pricing-engine.spec.ts \
          src/lib/w65/smoke-runtime.mjs \
          src/lib/w65/DELIVERABLE.md \
          tsconfig.w65.json && \
  git -c user.email="Mavis@MiniMax.local" -c user.name="Mavis" \
    commit -m "feat(w65/marketplace): add marketplace-pricing-engine + tests + smoke + DELIVERABLE" && \
  timeout 60 git push -u origin w65/marketplace-pricing-engine
```

---

## 12. Wall-clock

Approximate: **18-22 min** (within the 20-min target, well under the 30-min cap).