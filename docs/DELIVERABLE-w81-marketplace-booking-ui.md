# W81-C — Marketplace Booking UI · Delivery Summary

**Worker:** W81-C
**Cycle:** 81 (2026-06-30 08:03 UTC)
**Session:** 414735472226387 (root session)
**Branch:** `w81/marketplace-booking-ui`
**Worktree:** `/tmp/w81-c`
**Status:** ✅ DELIVERED (TSC=0 · SPEC 66/66 · SMOKE 72/72)

## TL;DR

Multi-step checkout UI for the Cabala Marketplace. 6 active steps
(`PICK_SERVICE → PICK_SLOT → REVIEW → CONSENT → PAYMENT → CONFIRMED`)
+ 2 terminal states (`FAILED | CANCELLED`), 7 offering categories,
8 service types (cycle 65 W65-C contract mirrored), LGPD v2.0.0-w81
consent gate with 4 scopes (2 required + 2 optional), HMAC-chained
in-memory ledger, mobile-first 44px touch targets, ARIA live regions.

## Files Created

```
src/lib/w81/
├── marketplace-booking-engine.ts       — pure logic (1050 LOC)
├── marketplace-booking-ui.tsx          — 7 React components (760 LOC)
├── marketplace-booking-ui.spec.ts      — 66 self-running assertions (860 LOC)
├── react-stubs.d.ts                    — Node + minimal React ambient types
└── tsconfig.json                       — isolated worktree config

scripts/smoke/
└── w81-marketplace-booking-ui.ts       — 72 inline smoke checks (520 LOC)

docs/
└── DELIVERABLE-w81-marketplace-booking-ui.md  (this file)
```

| File | LOC | Purpose |
|------|-----|---------|
| marketplace-booking-engine.ts | ~1050 | Pure logic: pricing, slots, LGPD, order lifecycle, reducer |
| marketplace-booking-ui.tsx | ~760 | 7 React components + formatters + CheckoutFlow orchestrator |
| marketplace-booking-ui.spec.ts | ~860 | 66 self-running assertions (engine + UI contracts) |
| react-stubs.d.ts | ~150 | Ambient types: node:crypto, react, react/jsx-runtime |
| tsconfig.json | ~25 | Isolated config: ES2022 + Bundler + DOM + JSX |
| w81-marketplace-booking-ui.ts (smoke) | ~520 | 72 inline checks, hermetic, no test runner |

## Verified Metrics

```
TSC:    0 errors  (tsc -p src/lib/w81/tsconfig.json)
SPEC:   66/66 PASS  (66 it() checks; ≥60 requirement met)
SMOKE:  72/72 PASS  (72 inline checks; ≥30 requirement met)
BRANCH: w81/marketplace-booking-ui
```

## Architecture

### State Machine

```
PICK_SERVICE → PICK_SLOT → REVIEW → CONSENT → PAYMENT → CONFIRMED
                                    ↘         ↘         ↘
                                     FAILED    FAILED    CANCELLED
```

Reducer-driven (no direct mutation, all returns frozen). 10 actions
defined: `SELECT_LISTING`, `SELECT_SLOT`, `GO_TO_CONSENT`, `SET_CONSENT`,
`SUBMIT_CONSENT`, `SELECT_PAYMENT`, `CONFIRM`, `CANCEL`, `FAIL`, `RESET`.

### Order Lifecycle

```
DRAFT → HELD (escrow) → CONFIRMED → COMPLETED
                          ↓
                       REFUNDED
                          ↓
                       CANCELLED
```

HMAC-style chain hash (`fnv1a(prevHash + '|' + payload)` folded twice)
threads through every state transition. In-memory ledger with
`GENESIS_BOOKING` seed.

### LGPD

4 consent scopes, 2 required (`personal_data`, `payment_data`) + 2 optional
(`sacred_preference`, `communication`). `validateLgpdConsent` is
never-throws; `SUBMIT_CONSENT` reducer blocks transition to PAYMENT when
required scopes are unset (`error: 'consent_required_scopes_missing'`).

### Sacred Coverage

5 traditions mirrored from W65-C marketplace-pricing-engine:

```
CIGANO:  8 cards   (≥ floor 8)
ORIXAS: 16 entities (≥ floor 16)
CHAKRAS: 7 entries  (≥ floor 7)
SEFIROT: 10 entries (≥ floor 10)
HOUSES:  12 entries (≥ floor 12)
TOTAL: 53 sacred entries (sample; w65 has 81 in full)
```

Note: CIGANO is sample-8 in this engine (representative spread across all
4 Naipes). The full 36-card catalog lives in
`w65/marketplace-pricing-engine` (origin SHA `01d9d92`). When w65 merges,
swap `CIGANO_CARDS` for the upstream constant — no callers change.

### Pricing Adapter

Self-contained `pricingEngine(input)` mirrors the W65-C `priceService`
contract: tier × sacred-multiplier × reputation-discount, clamped per
service range, BRL-cents integer, frozen return. This is the documented
adapter pattern — when W65 merges to main, replace the body with a direct
re-export.

## Components (7 + 1 orchestrator)

```
ServicePicker           — 5-col grid of ServiceListing cards (sacred tags + BRL)
DateSlotPicker          — bottom-sheet 14-day × 5 slots, capacity-aware
OrderSummary            — line-item <dl> + price breakdown + total live region
LgpdConsentCheckbox     — 4-scope consent panel with aria-required + describedby
PaymentMethodPicker     — PIX / CREDIT_CARD / BOLETO radio group
CheckoutButton          — 44px touch target, aria-disabled, loading state
ConfirmationScreen      — Order receipt + reset CTA
CancellationScreen      — FAILED/CANCELLED terminal
CheckoutFlow            — top-level orchestrator (wires reducer + handlers)
```

## A11Y / Mobile-First

- 44×44 px minimum touch targets on every button
- `role="navigation" aria-current="step"` on step indicator
- `aria-live="polite"` on price total
- `aria-live="assertive"` on `role="alert"` error regions
- `aria-pressed` on toggle buttons (ServicePicker, DateSlotPicker)
- `aria-required` + `aria-describedby` on consent checkboxes
- `aria-label` on every interactive control
- Mobile-first: bottom-sheet DateSlotPicker, single-column layout, sticky
  footer for CheckoutButton

## Adapter Note (Important)

The w65/marketplace-pricing-engine lives on `origin/w65/marketplace-pricing-engine`
(SHA `01d9d929602529e613f283e419147ed93467d0dd`, 929 LOC, 89/89 PASS) but
is NOT on main. This engine mirrors its contract via `pricingEngine() +
validatePricing() + escrow chain pattern`. Cycle 80 W80-C delivered
`src/components/marketplace/BookingFlow.tsx` (1200 LOC, 50/50 PASS,
SHA `2c3bfb6`); cycle 81 W81-C (this delivery) provides the **independent
re-implementation** that:
- Uses the same pricing contract
- Lives at `src/lib/w81/` (not `src/components/marketplace/`)
- Has 7 React components + a state-machine reducer that W80-C's flow
  uses as inline logic
- Includes its own LGPD gate with 4 scopes (W80-C had 5)
- Includes a `.ts` engine module separate from `.tsx` UI

When both W65-C and W80-C are merged to main, this engine is the third
implementation; consolidation can pick any.

## How to Run

```bash
cd /tmp/w81-c
# Self-running spec (66 assertions)
node --experimental-strip-types src/lib/w81/marketplace-booking-ui.spec.ts

# Self-running smoke (72 inline checks)
node --experimental-strip-types scripts/smoke/w81-marketplace-booking-ui.ts

# Type-check
tsc -p src/lib/w81/tsconfig.json
```

## Public API (16 functions + 4 type guards)

```ts
pricingEngine(input)                        → PricingResult
validatePricing(p)                          → ValidationResult (never-throws)
generateSlotCalendar(opts)                  → readonly SlotCalendarEntry[]
assertSlotAvailable(cal, slotId)            → ValidationResult
buildLgpdConsentRequest(buyerId, ...)       → LgpdConsentRequest
validateLgpdConsent(consent)                → ValidationResult
makeConsentMap(opts)                        → Readonly<Record<Scope, boolean>>
createOrderDraft(input)                     → Order
holdOrderEscrow(input)                      → Order
confirmOrder(input)                         → Order
cancelOrder(oid, reason)                    → Order
refundOrder(oid, reason)                    → Order
completeOrder(oid)                          → Order
getOrder(oid) / listOrders()                → Order | null / readonly Order[]
resetOrderStoreForTests()                   → void
buildSampleListing(input)                   → ServiceListing
buildSampleCatalog(sellerId)                → readonly ServiceListing[]
auditMarketplaceBooking(catalog)            → AuditReport
initialCheckoutState()                      → CheckoutState
advanceCheckout(state, action)              → CheckoutState
nextStepFromReview(state)                   → CheckoutStep
canCheckout(state)                          → boolean
resetOrderStoreForTests()                   → void
```

Type guards: `isServiceType`, `isTier`, `isOfferingCategory`,
`isPaymentMethod`, `isSacredTradition`.

Branded factories: `listingId`, `slotId`, `userId`, `orderId`,
`escrowId`, `priceCents` (all regex-validated, throwing on malformed).

## NEW Durable Lessons (5)

1. **JSX-intrinsic-typing trap in isolated worktrees.** When a `react-stubs.d.ts`
   file DOES NOT declare `JSX.IntrinsicElements`, TS reports TS7026 for every
   `<element>` in `.tsx` files (because `strict: true` enables `noImplicitAny`).
   The proven escape hatch (W80-C pattern): use `React.createElement(...)`
   instead of JSX literal syntax. The `.tsx` extension is preserved for
   future IDE/JSX-runtime support without giving up isolated-tsconfig
   compilation. Reusable: any future isolated React worktree.

2. **`reputationDiscount` MUST clamp to its cap, not just [0, 1].** A naive
   `clampUnit(rep/50)` returns `0.14` for `rep=7.0`, exceeding the
   `REPUTATION_DISCOUNT_CAP = 0.10`. Cap-aware clamping is a separate
   concern from unit-range clamping. Reusable: any bounded-discount
   calculation.

3. **Cancel-from-cancelled must throw.** A lifecycle that allows `cancelOrder`
   on already-CANCELLED / REFUNDED / COMPLETED orders leaks audit-trail
   entries and confuses downstream reconciliation. Always check ALL terminal
   statuses, not just the immediate rejection set. Reusable: any lifecycle
   reducer.

4. **Reducer-level guard for missing required scopes.** `SUBMIT_CONSENT`
   should reject the transition to PAYMENT when required scopes are unset,
   not just record a `state.error` after-the-fact. Cycle-60 lesson: gate
   on the transition itself, return the same `state` with `error` populated
   to keep the UI in a recoverable state. Reusable: any required-input
   state-machine guard.

5. **Backward-compatible smoke harness path** — the smoke file's relative
   import `../src/lib/w81/...` resolves wrong from `scripts/smoke/`.
   Correct is `../../src/lib/w81/...`. Smoke runs only see what its
   `process.cwd()` directory looks like, so path drift is easy. Reusable:
   any cycle-7X+ smoke that imports project sources.

## Push Command (Documented)

```bash
cd /tmp/w81-c
git add src/lib/w81/marketplace-booking-engine.ts \
        src/lib/w81/marketplace-booking-ui.tsx \
        src/lib/w81/marketplace-booking-ui.spec.ts \
        src/lib/w81/react-stubs.d.ts \
        src/lib/w81/tsconfig.json \
        scripts/smoke/w81-marketplace-booking-ui.ts \
        docs/DELIVERABLE-w81-marketplace-booking-ui.md
git commit -m "feat(w81-C): marketplace-booking-ui — 7 React components, 6-step reducer, LGPD v2.0.0-w81"
git push -u origin w81/marketplace-booking-ui
```

The push itself was not executed in-session because cabaladoscaminhos
sandbox hits intermittent `git push` / `git add` hangs (documented in
memory 2026-06-27). Run the commands above in a fresh terminal to land
the branch.
