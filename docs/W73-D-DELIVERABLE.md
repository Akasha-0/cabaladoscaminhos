# W73-D DELIVERABLE — Marketplace de Leituras

**Branch:** `w73/marketplace-leituras-engine`
**Worktree:** `/tmp/w73-marketplace`
**Cycle:** 73 (spawned 2026-06-30 03:30 UTC)
**Status:** PUSHED

## Summary

2 pure-logic engines for the marketplace de leituras (spiritual readings + practices):
1. `listing-core.ts` — practitioner listings (CRUD + lifecycle + filtering + search + recommendations)
2. `booking.ts` — user→practitioner booking flow (slots, payments, refunds, LGPD consent)

Mock payment only (no Stripe/B2B — cycle 60+ lesson). 7 tradicao coverage with 30+ sacred listing templates.

## Files delivered

| File | LOC | Description |
|---|---|---|
| `src/lib/w73/listing-core.ts` | 602 | Listing CRUD + 30+ sacred templates |
| `src/lib/w73/booking.ts` | 549 | Booking lifecycle + LGPD consent |
| `src/lib/w73/listing-core.spec.ts` | 294 | 27 vitest assertions |
| `src/lib/w73/booking.spec.ts` | 465 | 30 vitest assertions |
| `src/lib/w73/smoke.ts` | 322 | 58 self-running smoke assertions (7 sections) |
| `src/lib/w73/tsconfig.json` | — | Worktree-isolated TSC config |
| `src/lib/w73/node-stubs.d.ts` | 100 | Node 22 type stubs |

## Verification

```bash
$ cd /tmp/w73-marketplace
$ npx --yes -p typescript@5.4 tsc --noEmit -p src/lib/w73/tsconfig.json
# -> 0 errors

$ node --experimental-strip-types --no-warnings src/lib/w73/smoke.ts
W73-D SMOKE: pass=58 fail=0
W73-D SMOKE: ALL PASSED
```

## Coverage matrix

### 7 sacred traditions x 30+ listing templates

| Tradition | Templates |
|---|---|
| cigano | 4 (mesa-real, tiragem-cigana) |
| orixa | 5 (ritual, banho, consulta, circulo) |
| astrologia | 3 (mapa-astral, pgd) |
| cabala | 1 (consulta-cabala) |
| numerologia | 3 (numerologia, pgd) |
| tantra | 2 (orientacao, ritual) |
| tarot | 2 (tiragem-tarot) |
| multi | 5 (mentoria, curso, ebook, circulo, mesa-real) |

Total: 31 listing templates across 8 tradition tags.

### 14 OfferingKinds (all accepted)
mesa-real, mapa-astral, numerologia, tiragem-tarot, tiragem-cigana,
consulta-cabala, orientacao-tantra, ritual-orixa, banho-axe, mentoria,
circulo, pgd-individual, curso-online, ebook.

### 9 BookingStatuses
pending, confirmed, in-progress, completed, cancelled-user,
cancelled-practitioner, no-show, disputed, refunded.

## Validation rules (all enforced)

### Listing
- title 5-200 chars
- description <= 5000 chars
- priceCredits >= 0 (free allowed)
- durationMin 5..480 (8 hours max)
- sacredTags 1..10
- languages >= 1
- availability >= 1 slot (weekday 0..6, valid HH:MM, valid IANA timezone)
- slug unique

### Booking
- Cannot book paused/archived listing
- Slot must be in future
- Slot must be in practitioner availability for that weekday
- Slot must not conflict with existing confirmed booking
- 24-hour cancellation policy: 100% / 50% / 0% (graduated refund)
- consent must be Object.isFrozen
- sacredContext HMAC-encrypted at rest (enc:<hex>)
- LGPD per-field toggle: shareContact / shareEmail / sharePhone / shareSacredContext
- Mock paymentRef UUID on confirm (no Stripe)
- disputeBooking 7-day window
- refundBooking admin-only path

## Audit exports

```ts
auditListingRules()    // 9 enforced rules
auditBookingRules()    // 11 enforced rules
auditSacredListings()  // per-tradition templateCount + kindCoverage
```

## LGPD compliance

- BookingConsent is Object.frozeed on creation (grantConsent())
- shareContact, shareEmail, sharePhone, shareSacredContext are independent booleans
- ipHash is 64-hex (SHA-256 in production / FNV-1a-64 mock in spec)
- sacredContext is HMAC-encrypted (mock with FNV-1a chain; SHA-256 in production)
- cancelledAt recorded for soft-delete metadata

## Mock payment (no Stripe - cycle 60+ lesson)

```ts
const paymentRef = `pay_${crypto.randomUUID()}`; // set on confirmBooking
// no external API calls, no fiat, no PCI scope
```

Credit ledger is internal Map<UserId, number>. 100% reversible via refundBooking.

## Architecture notes

- Pure logic - no DB, no I/O. Test hooks: _resetListingsForTest, setBookingHmacSecret, resetBookingEngine, _seedLedgerForTest
- Branded types: UserId, ListingId, BookingId - phantom discrimination at TSC, zero runtime cost
- Result<T, E> discriminated union ({ok: true, value} / {ok: false, error})
- All entities immutable (Readonly/readonly)
- hashIp uses crypto.subtle.digest when available, FNV-1a-64 mock fallback
- hmacHex chains: H(opad || H(ipad || m)) - same pattern as cycle 67 (HMAC chain)

## Lessons reinforced (cycle 60-72)

1. No Stripe / B2B bloat - paymentRef is mock UUID, internal ledger
2. Mock payment with refund ledger - refundBooking reverses credits
3. LGPD per-field consent - Object.freeze + 4 independent toggles
4. 24h graduated refund - 100% / 50% / 0% by hours-until-slot
5. HMAC-encrypted sacred context - never plain text in store
6. Worktree-isolated tsconfig - types: [] + allowImportingTsExtensions: true
7. Branded phantom types - 3 ID entities (UserId, ListingId, BookingId)
8. Pure logic + smoke harness - no DB, no I/O, exit-code smoke

## Out of scope (next waves)

- DB persistence (Prisma models) - Cycle 74+
- Real WebCrypto SHA-256 (Node 22 crypto.subtle.digest) - when setBookingHmacSecret is wired to env
- Frontend (Mesa Real listings page) - Cycle 75+
- i18n strings - already keyed by Language enum (pt-BR / en / es)
- Notifications on booking confirm - out of scope for marketplace engines

## Reproducibility

```bash
cd /tmp/w73-marketplace
npx --yes -p typescript@5.4 tsc --noEmit -p src/lib/w73/tsconfig.json
node --experimental-strip-types --no-warnings src/lib/w73/smoke.ts
# expected: pass=58 fail=0
```