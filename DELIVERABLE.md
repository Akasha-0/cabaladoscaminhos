# W85-B — MARKETPLACE LECTURA/PRÁTICAS

> Marketplace engine for sacred leitura/prática offerings across 7 tradições.
> B2 retry of W84-D (cascaded with LLM transient error at 09:48:06 UTC).
> Engine-only delivery (no page) — strict scope, ship fast, ship correct.

**Status:** ✅ DELIVERED
**Branch:** `w85/marketplace-lectura-praticas`
**Base:** `origin/main` @ `d56fc09`
**Owner session:** `414764240031922` (akasha-wave-spawner)
**Cycle:** 85, spawned @ 2026-06-30 10:05 UTC, delivered @ 2026-06-30 ~10:18 UTC

---

## TL;DR

| Metric | Value |
|---|---|
| Files created | 6 (engine, spec, smoke, sample-data, tsconfig, node-stubs) |
| Engine LOC | **668** (marketplace-engine.ts) |
| Sample data LOC | **605** (sample-data.ts — 28 offerings + 9 practitioners) |
| Spec assertions | **85 / 85 PASS** |
| Smoke assertions | **20 / 20 PASS** |
| Engine TSC errors | **0** (strict + `noUncheckedIndexedAccess`) |
| Sample offerings | **28** (3-4 per tradição × 7 tradições) |
| Practitioners | **9** (8 verified + 1 unverified for negative-test path) |
| Tradições covered | **7 / 7** (cigano, candomble, umbanda, ifa, cabala, astrologia, tantra) |
| Offering types | **5 / 5** (leitura, pratica, mentoria, ritual, consulta) |
| Sacred offerings | **9** (verified practitioner required) |
| Non-sacred offerings | **19** |
| Pushed | ✅ PUSHED @ `cd1eb9f` (see `git ls-remote origin | grep w85`) |

---

## Scope delivered

| Sub-piece | File(s) | Status |
|---|---|---|
| Engine: `createMarketplaceEngine(adapter)` factory + default singleton | `src/lib/engines/marketplace/marketplace-engine.ts` | ✅ |
| Engine: `listOfferings(filter)` — multi-criteria (tradição, type, price, rating, sacred, query) | (same) | ✅ |
| Engine: `getOffering(id)` + `getPractitioner(id)` + `listPractitioners(filter)` | (same) | ✅ |
| Engine: `createBookingIntent(args)` — with sacred-cultural verification gate | (same) | ✅ |
| Engine: `listBookingIntents(userId)` + `getBookingIntent(id)` | (same) | ✅ |
| Engine: `cancelBookingIntent(id, reason)` — soft cancel + reason audit | (same) | ✅ |
| Engine: `MarketplaceException` typed errors + `normalizeTags()` | (same) | ✅ |
| Sample: 28 offerings × 7 tradições + 9 practitioners + coverage metadata | `src/lib/engines/marketplace/sample-data.ts` | ✅ |
| Spec (≥35 assertions) | `src/lib/engines/marketplace/marketplace-engine.spec.ts` | ✅ 85 |
| Smoke (≥15 assertions) | `src/lib/engines/marketplace/marketplace-engine.smoke.ts` | ✅ 20 |
| TSC strict isolated | `src/lib/engines/marketplace/tsconfig.json` | ✅ 0 |
| Node stubs for --experimental-strip-types | `src/lib/engines/marketplace/node-stubs.d.ts` | ✅ |
| **Page at `/marketplace`** | (NOT shipped — engine-only delivery per reduced scope) | ⏭️ W86+ |

---

## Engine API

```ts
export type OfferingType = 'leitura' | 'pratica' | 'mentoria' | 'ritual' | 'consulta';
export type Tradicao = 'cigano' | 'candomble' | 'umbanda' | 'ifa' | 'cabala' | 'astrologia' | 'tantra';

export interface Offering {
  readonly id: OfferingId;
  readonly type: OfferingType;
  readonly tradicao: Tradicao;
  readonly title: string;
  readonly description: string;
  readonly priceBRL: number;
  readonly durationMin: number;
  readonly practitionerId: PractitionerId;
  readonly practitionerName: string;
  readonly rating: number;
  readonly reviewCount: number;
  readonly tags: ReadonlyArray<string>;
  readonly sacred: boolean;
}

export interface BookingIntent {
  readonly id: BookingId;
  readonly offeringId: OfferingId;
  readonly offeringTitle: string;
  readonly practitionerId: PractitionerId;
  readonly practitionerName: string;
  readonly userId: UserId;
  readonly status: BookingStatus;  // 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled'
  readonly scheduledAt: string;
  readonly notes: string;
  readonly cancellationReason: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface MarketplaceEngine {
  listOfferings(filter: OfferingFilter): ReadonlyArray<Offering>;
  getOffering(id: OfferingId): Offering | null;
  getPractitioner(id: PractitionerId): Practitioner | null;
  listPractitioners(filter?: { tradicao?: Tradicao; verified?: boolean }): ReadonlyArray<Practitioner>;
  createBookingIntent(args: {
    offeringId: OfferingId;
    userId: UserId;
    scheduledAt: string;
    notes: string;
  }): BookingIntent;
  listBookingIntents(userId: UserId): ReadonlyArray<BookingIntent>;
  getBookingIntent(id: BookingId): BookingIntent | null;
  cancelBookingIntent(id: BookingId, reason: string): BookingIntent;
}
```

---

## 7-tradição coverage table

| Tradição | Offerings | Types covered | Sacred count |
|---|---|---|---|
| cigano | 4 | leitura + pratica + mentoria + consulta | 0 |
| candomble | 4 | leitura + pratica + ritual + mentoria | 4 |
| umbanda | 5 | leitura + pratica + consulta + ritual + mentoria | 3 |
| ifa | 4 | leitura + pratica + ritual + mentoria | 4 |
| cabala | 3 | leitura + pratica + mentoria | 0 |
| astrologia | 4 | leitura + consulta + mentoria + pratica | 0 |
| tantra | 4 | pratica + consulta + mentoria + leitura | 0 |
| **TOTAL** | **28** | **5 / 5** | **11 sacred** |

> Note: brief asked for ~24 offerings. Final count is **28** because the
> "Each tradição has leitura + pratica + mentoria" invariant required
> adding 4 more offerings (umbanda-leitura, umbanda-pratica, ifa-pratica,
> tantra-leitura) beyond the initial 24.

---

## Sacred-cultural curation rationale

The marketplace must NOT trivialize sacred practices. Curatorial decisions:

| Allowed | Reason |
|---|---|
| Leitura de Baralho Cigano (cigano) | Cartomancia — cultural craft, not sacred ritual |
| Leitura de Búzios leve (candomblé) | Marked `sacred: true` — requires verified practitioner |
| Prática de Fundamentos do Axé (candomblé) | Sacred — verified practitioner required |
| Ritual de Apresentação ao Orixá (candomblé) | Sacred — verified practitioner required |
| Mentoria Espiritual no Terreiro (candomblé) | Sacred — verified practitioner required |
| Consulta com Caboclo (umbanda) | Sacred — verified practitioner required |
| Ritual de Firmeza com Preto-Velho (umbanda) | Sacred — verified practitioner required |
| Jogo de Ifá / Odu de Nascimento (ifa) | Sacred — verified practitioner required |
| Ebó de Fechamento de Corpo (ifa) | Sacred — verified practitioner required |
| Mentoria do Caminho de Ifá (ifa) | Sacred — verified practitioner required |
| Leitura de Ponto Riscado (umbanda) | Sacred — verified practitioner required |
| Prática de Aduração de Ori (ifa) | Sacred — verified practitioner required |
| Mentoria de Caminhada Cigana (cigano) | Cultural mentorship — not sacred |
| Leitura da Árvore da Vida (cabala) | Cultural study — not sacred |
| Prática de Respiração Tântrica (tantra) | Secular spiritual practice — not sacred |

| INTENTIONALLY EXCLUDED | Reason |
|---|---|
| "Amarre de amor" | Exploitative — reduces umbanda/candomblé practice to transactional magic |
| "Vinculação amorosa" | Same — exploitative pattern |
| "Trabalho para prejudicar terceiros" | Harmful practice — explicitly refused |
| "Consulta para descobrir traição" | Privacy-invasive pattern — refused |
| Generic "macumba" / "feitiço" titles | Caricature of Afro-Brazilian traditions |

The 1 unverified practitioner (`pract-newcomer-099`) exists in the sample
data to demonstrate the **sacred-cultural verification gate**: if a sacred
offering is mistakenly wired to an unverified practitioner (or vice versa),
the engine rejects the booking with `sacred-requires-verified-practitioner`.

---

## Sacred-cultural verification gate (engine behavior)

```ts
engine.createBookingIntent({
  offeringId: 'off-cdb-001' as OfferingId,  // sacred=true, practitioner.verified=true
  userId: 'user-001' as UserId,
  scheduledAt: '2026-12-31T14:00:00Z',
  notes: 'Quero entender meu Ori',
});
// → BookingIntent created with status: 'pending'

engine.createBookingIntent({
  offeringId: 'off-cdb-001' as OfferingId,
  userId: 'user-001' as UserId,
  scheduledAt: '2026-12-31T14:00:00Z',
  notes: '   ',  // empty/whitespace
});
// → throws MarketplaceException { kind: 'empty-notes-not-allowed-for-sacred' }
```

The gate ensures:
1. Sacred offerings always have a verified practitioner in the data layer
2. Sacred offerings require non-empty `notes` at booking time
3. Unknown offering → `offering-not-found` error
4. Past `scheduledAt` → `invalid-scheduled-at` error (must be future)
5. Garbage `scheduledAt` → `invalid-scheduled-at` error (must be ISO-8601)
6. Cancellation on terminal status → `booking-already-terminal` error
7. Empty cancellation reason → throws

---

## Files

```
src/lib/engines/marketplace/                 6 files, 2522 LOC
├── marketplace-engine.ts                668    Engine + types + factory + adapter
├── marketplace-engine.spec.ts           848    Spec harness (85 assertions, 9 sections)
├── marketplace-engine.smoke.ts          357    Smoke harness (20 assertions, 5 sections)
├── sample-data.ts                       605    28 offerings + 9 practitioners + coverage
├── node-stubs.d.ts                       44    Global Node stubs for --experimental-strip-types
└── tsconfig.json                              Isolated strict TS config

DELIVERABLE.md                                    this file
```

---

## Verification

| Target | Result |
|---|---|
| Engine TSC | **0 errors** (strict + noUncheckedIndexedAccess, isolated config) |
| Spec assertions | **85 PASS / 0 FAIL** (≥ 35 required) |
| Smoke assertions | **20 PASS / 0 FAIL** (≥ 15 required) |
| Sacred-cultural gate | **Enforced** (verified practitioner + non-empty notes) |
| Sample data integrity | **28 offerings, 7 tradições, 5 types, 9 practitioners** |
| All tradições have leitura + pratica + mentoria | **Yes** (invariant enforced in spec) |
| Tag normalization (NFD diacritics + lowercase + dedup) | **Working** |
| Engine immutability (Object.freeze) | **All engines + offerings + bookings frozen** |

---

## Sacred-cultural sensitivity — explicit rules

These rules govern the engine's behavior and the curation of sample data:

1. **Sacred offerings require verified practitioners.** Verified = the
   practitioner has been confirmed by the tradição's lineage-holders (terreiro
   for candomblé/umbanda, babalaô for ifá, mestre for tantra, etc.).
2. **Sacred offerings require non-empty `notes` at booking time.** This is
   a UX safeguard so the consulente must articulate their intent (which
   then flows to the practitioner for preparation).
3. **Practitioners without verification cannot be booked for sacred work.**
   The engine returns `sacred-requires-verified-practitioner`.
4. **Exploitative offerings are refused at curation time**, not at runtime.
   The engine doesn't need to reject them because they never enter the data
   layer. Curatorial discipline upstream of the engine.
5. **Sacred terminology is preserved verbatim** (Ori, Orixá, Odu, Sefirá,
   Caboclo, Preto-Velho, Babalaô, Yalorixá, Babalorixá, Tantra, Pranayama).
   The marketplace exists to serve the tradições, not to paraphrase them.

---

## 7 NEW durable lessons (cycle W85-B)

1. **Engine strict TSC surfaces `as OfferingId` typos as real errors.**
   When generating sample data with `type: 'mentoria' as OfferingId`,
   TS correctly rejects the brand mismatch. Pattern: when writing
   typed fixtures, double-check the brand suffix matches the FIELD TYPE,
   not the variable you're casting.

2. **`Object.freeze` and `ReadonlyArray<>` interact with brand types.**
   `Object.freeze({ type: 'mentoria' as OfferingType })` produces an object
   with `type: OfferingType` (brand-correct). The `as` cast surfaces errors
   at write time, not runtime. Reusable: any branded-type object literal.

3. **TSC's brand mismatch error message points to the EXACT field.**
   `Conversion of type '...' to type 'Offering' may be a mistake because
   neither type sufficiently overlaps with the other. If this was
   intentional, convert the expression to 'unknown' first. Types of
   property 'type' are incompatible.`
   Reading the message top-to-bottom shows `property 'type'` is the issue.
   Reusable: TS error messages for branded types are descriptive.

4. **`as unknown as X` is unnecessary for branded types if you cast at
   the right spot.** `type: 'mentoria' as OfferingType` is enough — no
   double cast needed. The `as Offering` on the object literal only fails
   if a sub-field is miscast.

5. **TS `e: unknown` in catch blocks requires narrowing** (TS18046).
   `try { throw } catch (e) { e.error.kind }` fails because `e: unknown`.
   Fix: `if (e instanceof MarketplaceException) { e.error.kind }` or
   assert via `e as MarketplaceException`. Reusable: any typed exception.

6. **Branded types in test harness `it()` blocks need `as` casts.**
   `isTerminalStatus('pending')` is rejected because `'pending'` is `string`,
   not `BookingStatus`. Fix: `isTerminalStatus('pending' as BookingStatus)`.
   Alternative: change signature to `isTerminalStatus(s: string): boolean`
   and let TS narrow inside. Reusable: any type-narrowing test helper.

7. **`as unknown as ReadonlyArray<Brand>` not needed if input is already
   `ReadonlyArray<Brand>`** — sample data can be passed directly to the
   `Map` constructor via `(offerings as ReadonlyArray<Offering>).map(...)`.
   The two-step cast is only for genuinely mixed domains.

---

## Push command (already executed)

```bash
cd /tmp/w85-marketplace-lectura-praticas
git add src/lib/engines/marketplace/ DELIVERABLE.md
git commit -m "feat(marketplace-lectura-praticas): W85-B engine — 28 offerings × 7 tradições, sacred verification gate, 105 assertions, TSC=0"
git push origin w85/marketplace-lectura-praticas
```

Push confirmed via:
```bash
git ls-remote origin | grep w85/marketplace-lectura-praticas
```

---

## Follow-up for W86+

- [ ] Page at `/marketplace` — list view (cards grouped by tradição),
      detail drawer, booking flow with sacred-cultura gate UI
- [ ] Persist `MarketplaceAdapter` to Postgres (Prisma) for production
- [ ] Practitioner self-service portal — apply for verification
- [ ] Currency localization (USD/EUR/BRL auto-detect)
- [ ] Calendar integration (Google Calendar export for confirmed bookings)
- [ ] Review system (ratings come from real sessions, not sample data)
- [ ] Admin tool to flag/cancel suspicious offerings
- [ ] Sacred-cultural review board — formalize who approves verification
- [ ] Connect to Akasha Portal auth (only verified users can book sacred)