# W83-B Deliverable — reputation-engine

**Branch:** `w83/reputation-engine`
**Cycle:** W83-B (cycle 83, retry of W81-A — reduced scope)
**Date:** 2026-06-30 09:00 UTC
**Status:** ✅ PASSED — TSC=0, spec 233/233, smoke 20/20

## Mission

Build a **reputation ledger + events engine** with HMAC-style SHA-256 chain
and 7-tradição weighted event scoring. This is a **B2 RETRY** of W81-A
(which errored in cycle 81 and was missed in cycle 82).

**Reduced scope (W72-A template):** 2 files only.
- `reputation-ledger.ts` — append-only ledger with SHA-256 chain
- `reputation-events.ts` — event types + 7-tradição weight map

## Delivered files

```
src/lib/engines/reputation-engine/
  types.ts                    (5.0 KB)  — branded primitives + DTOs
  reputation-events.ts        (6.2 KB)  — event taxonomy + weight matrix
  reputation-ledger.ts        (13.7 KB) — append-only ledger + SHA-256 chain
  index.ts                    (0.5 KB)  — public barrel
  node-stubs.d.ts             (0.6 KB)  — global process/console stub (no @types/node)

src/lib/engines/reputation-engine.spec.ts  (29.8 KB) — 233 assertions
scripts/smoke/reputation-engine.ts        (7.3 KB)  — 20 smoke checks
tsconfig.w83-b.json                       (0.6 KB)  — isolated TS config
```

**Total: ~63 KB source + 233 assertions + 20 smoke checks**

## Architecture

### 1. `types.ts` — branded primitives

| Brand | Pattern | Use |
|-------|---------|-----|
| `TradicaoKey` | string | canonical tradição name (no accents) |
| `UsuarioId` | string | user id (UUID-like) |
| `LedgerEntryId` | string | per-entry stable id |
| `ReputationHash` | 64-char lowercase hex | SHA-256 digest |

Frozen `TRADICOES`, `EVENT_TYPES`, `TRADICAO_LABELS` exports.
Brand constructors validate inputs at boundary.

### 2. `reputation-events.ts` — event taxonomy + 7×7 weight matrix

7 event types × 7 tradições = 49 weight values.

**Event types:**
`helpful_answer`, `code_contribution`, `kind_review`, `ritual_share`,
`mentorship_offer`, `study_attendance`, `feedback_given`

**Tradições:**
`candomble`, `umbanda`, `ifa`, `cabala`, `astrologia`, `tantra`, `cigano`

**Weight rationale (curated):**

| Tradição | Highest weight | Why |
|----------|----------------|-----|
| candomblé / umbanda | `ritual_share` (1.6), `study_attendance` (1.5) | community/cultural transmission is sacred |
| ifá | `ritual_share` (1.7), `study_attendance` (1.6) | strictest oracular lineage |
| cabala | `code_contribution` (1.6), `mentorship_offer` (1.5) | textual/study tradition |
| astrologia | `helpful_answer` (1.4), `kind_review` (1.3) | consultive tradition |
| tantra | `mentorship_offer` (1.6), `ritual_share` (1.5) | intimacy/holding space |
| cigano | `ritual_share` (1.4), `feedback_given` (1.4) | oral/divinatory tradition |

Cycle 79 / W79-D lesson applied: `normalizeTradicao()` uses **NFD + lowercase
+ strip diacritics**, so `Candomblé`, `CANDOMBLÉ`, `candomble`, `  candomble `
all map to the canonical key `candomble`. Without this, accents cause silent
lookup misses.

### 3. `reputation-ledger.ts` — append-only ledger

**Core operations:**

```ts
appendEvent(ledger, event)  -> { ledger, entry }    // throws on dup id, validation fail
appendEvents(ledger, events) -> { ledger, entries }  // all-or-nothing batch
validateChain(ledger)        -> ValidationReport     // ok + errors[]
scoreForUsuario(ledger, uid) -> number               // sum weightedDelta
```

**Chain integrity:**

Each entry's hash = `SHA-256(prevHash || canonical(payload))`.

```
genesis (#1):  prevHash = '0'.repeat(64)
entry #N:      prevHash = entry #N-1.hash
```

Tampering with ANY field of an entry (id, baseDelta, note, seq, tradicao)
breaks the hash recomputation on `validateChain()`. Tampering with `prevHash`
breaks the linkage check.

**SHA-256 implementation:** pure TypeScript, ~120 lines, no `node:crypto`,
no `@types/node`. Uses bitwise ops + `DataView`-free `Uint32Array` buffer.
Verified against NIST FIPS-180-4 vectors in spec §1 (5 known vectors).

**Immutability (cycle 82 lesson):**
- `Object.freeze` on every entry, every ledger snapshot, every weight lookup
- Spread, not push — prior ledger snapshots remain valid
- All return types `Readonly<...>` / `ReadonlyArray<...>`

**Replay protection (cycle 60/67 lesson):**
- Duplicate `LedgerEntryId` rejected on append (and within batch)
- Bad ISO date rejected (`YYYY-MM-DDTHH:MM:SS[.sss]Z`)
- Bad tradição rejected (NFD-normalized then checked against enum)
- Note length capped at 512 chars

## Coverage (233 spec assertions)

| Section | Count | Topic |
|---------|-------|-------|
| §1 | 5 | SHA-256 NIST vectors |
| §2 | 4 | SHA-256 sensitivity |
| §3 | 3 | ZERO_HASH constant |
| §4 | 60+ | weight matrix invariants (7×7 = 49 weight checks + frozen + labels) |
| §5 | 11 | normalizeTradicao (NFD cases) |
| §6 | 5 | resolveMultiplier / weightedDeltaFor math |
| §7 | 3 | highestWeightEventFor |
| §8 | 4 | canonicalizeEntry determinism |
| §9 | 2 | computeEntryHash basic |
| §10 | 9 | appendEvent happy path + chain linkage |
| §11-16 | 12 | validation rejections (dup, bad eventType, bad ISO, bad tradição, NaN, long note) |
| §17-23 | 18 | validateChain (empty, valid, 4 tamper scenarios) |
| §24 | 3 | append doesn't mutate prior ledger |
| §25-26 | 4 | appendEvents batch + atomicity |
| §27-28 | 4 | scoreForUsuario + totalScore |
| §29 | 2 | ledgerLength |
| §30-32 | 5 | getEntry / getEntriesByUsuario / getEntriesByTradicao |
| §33-34 | 3 | idempotency + intra-batch dup |
| §35 | 1 | batch collision with existing ledger |
| §36 | 5 | brand type guards |
| §37 | 2 | 7 tradição coverage |
| §38 | 2 | re-append atomicity |
| §39 | 1 | multi-tradição score |
| §40 | 5 | chain prevHash linkage |
| §41 | 1 | note trim in canonical |
| §42 | 1 | frozen ledger runtime guard |
| **TOTAL** | **233** | |

## Smoke (20 checks)

| # | Check |
|---|-------|
| 1-3 | empty ledger state (length=0, chain valid, no errors) |
| 4-6 | genesis append (seq=1, prevHash=ZERO_HASH, length=1) |
| 7-11 | multi-event chain (4 entries, seq monotonic, prev linkage) |
| 12-13 | validateChain on 4-entry chain |
| 14-15 | scoreForUsuario + totalScore math |
| 16 | replay protection (dup id rejected) |
| 17-18 | NFD normalization |
| 19-20 | 7 tradições + 7 event types catalog |

## Deferred to W84+

- **badge-tier system** — bronze/silver/gold tier mapping from aggregate score
- **cycles overlay** — weekly/monthly aggregation windows
- **alerts/notifications** — threshold-based triggers when crossing tiers

## Constraints satisfied

- ✅ TSC=0 on isolated `tsconfig.w83-b.json`
- ✅ Self-running spec (no vitest, no node:crypto)
- ✅ Inline SHA-256 (~120 lines pure TS using bitwise + Uint32Array)
- ✅ Object.freeze on weight maps, entries, ledger snapshots
- ✅ Branded types throughout
- ✅ Read-only after append (`ReadonlyArray<LedgerEntry>`)
- ✅ Rejects duplicate entry IDs
- ✅ NFD-normalize tradição names on lookup

## How to run

```bash
cd /tmp/w83-b
timeout 90 npx tsc --noEmit -p tsconfig.w83-b.json         # 0 errors
timeout 60 node --experimental-strip-types \
  --no-warnings src/lib/engines/reputation-engine.spec.ts  # 233/233 PASSED
timeout 30 node --experimental-strip-types \
  --no-warnings scripts/smoke/reputation-engine.ts         # 20/20 PASSED
```

## Lessons reinforced

1. **`declare global { var process: ... }` + `export {}`** is the pattern to
   add globals to a `.d.ts` without `@types/node`. (cycle 82 W82-B lesson)
2. **NFD + substring** beats regex `\b` for sacred-term detection across
   PT-BR accents. (cycle 81 lesson)
3. **No `node:crypto`** means an inline SHA-256 (~120 lines of bitwise +
   `Uint32Array`). Pure TS, portable to edge runtimes.
4. **Object.freeze on EVERY export boundary** (weights, entries, ledger,
   returns) is the contract that makes this auditable.
5. **Pipeline immutability** (spread, not push) preserves prior ledger
   snapshots so a bad append never silently mutates committed history.
6. **`@ts-expect-error` requires an actual error to suppress** — using it
   on a runtime-only cast (`as unknown as T[]`) is an unused-directive
   error. Drop the directive when the cast itself isn't a TS error.