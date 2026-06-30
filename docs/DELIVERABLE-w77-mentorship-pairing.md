# W77-A — Mentorship Pairing · DELIVERABLE

**Cycle:** 77 (respawn of W76-A which failed in cycle 76 on Token Plan 2056 cascade)
**Theme:** Mentorship pairing (peer-to-peer, NO HIERARCHY model)
**Branch:** `w77/mentorship-pairing`
**Status:** ✅ PUSHED
**Date:** 2026-06-30 (cycle 77 wave-spawner)

---

## What Shipped

A peer-to-peer mentorship pairing engine for **Cabala dos Caminhos**. Pairs
mentees with peer mentors based on affinity matrix scoring. NO guru/disciple
hierarchy — both roles are equalitarian peers at different points in their
learning journey.

### Files

| File | LOC | Purpose |
|---|---|---|
| `src/lib/w77/mentorship-pairing.ts` | ~620 | Engine: types, scoring, pairing, audit |
| `src/lib/w77/mentorship-pairing.hash.ts` | ~150 | SHA-256 + canonical-JSON helpers |
| `src/lib/w77/mentorship-pairing.spec.ts` | ~555 | Self-running ≥40 assertion spec |
| `src/lib/w77/mentorship-pairing.smoke.ts` | ~185 | Inline ≥20 check smoke harness |
| `src/lib/w77/tsconfig.json` | 19 | Worktree-isolated tsconfig (target ES2022) |
| `src/lib/w77/node-stubs.d.ts` | ~120 | `declare global` for process / crypto / setTimeout |

**Total:** ~1,650 LOC across 6 files.

### Public API

```ts
pairMentorship(input: PairInput): readonly PairResult[]
registerMentor(profile: MentorProfile): MentorId     // branded
registerMentee(profile: MenteeProfile): MenteeId     // branded
listMentorsByTradition(t: Tradition): readonly MentorSummary[]
listAllMentors(): readonly MentorSummary[]
exportAudit(): readonly PairRecord[]                // frozen log
hashCacheKey(input: PairInput): string              // SHA-256 canonical-JSON
hashCacheKeyAsync(input: PairInput): Promise<string>
sacredMatch(text, term): boolean                    // diacritic-aware
listSacredTermsMentioned(text): readonly string[]
traditionAffinityScore(a, b): number                // 0..40
domainOverlapScore(a, b): number                    // 0..30
timezoneScore(a, b): number                         // 0..10
languageScore(a, b): number                         // 0..10
availabilityScore(a, b): number                     // 0..10
sacredCoverageScore(menteeBio, mentorBio): number   // 0..5
recencyBonus(createdAtIso): number                  // 0..3
canonicalJson(value): string
sha256Hex(s): Promise<string>                       // async (WebCrypto)
sha256HexSync(s): string                            // sync (pure-JS impl)
```

### Coverage Matrix

- **Traditions (7 sacred):** Candomblé, Umbanda, Ifá, Cabala, Astrologia,
  Tantra, Cigano (Lenormand)
- **Domains (8 study areas):** tarot, cigano, odu-orixá, astrologia,
  numerologia, runas, cabala, tantra
- **Sacred terms (23):** Oxalá, Iemanjá, Oxum, Iansã, Ogum, Xangô, Exu,
  Ossain, Babalorixá, Yalorixá, Ifá, Orunmilá, Kether, Chokmah, Binah,
  Lilith, Mezuzah, Mantra, Kundalini, Cigano, Tarô, Preto-Velho,
  Pomba-Gira, Caboclo

### Scoring Algorithm

Total score 0–100, weighted sum of 7 dimensions:

| Dimension | Max | Mechanism |
|---|---|---|
| Tradition affinity | 40 | Same primary = 40, secondary = 28, closely-related family (matrix weight=2) = 18, related (weight=1) = 10 |
| Domain overlap | 30 | Jaccard similarity × 30 |
| Timezone overlap | 10 | 1h Δ=10, 2h=8, 4h=6, 6h=4, 9h=2, far=0 |
| Language overlap | 10 | pt-pt nexus = 10, partial overlap = 5 |
| Availability overlap | 10 | Sum of shared weekday × hour window, capped at 10h |
| Sacred coverage | 5 | (# matched sacred terms in mentor bio / # mentioned by mentee) × 5 |
| Recency bonus | 3 | +3 if mentor registered < 24h ago, +1 if < 7d |

All public outputs are `Object.freeze` + `ReadonlyArray<T>`.

---

## Verification

### TSC
`cd /tmp/w77-a && npx tsc --noEmit -p src/lib/w77/tsconfig.json` → **0 errors**

### Spec
`cd src/lib/w77 && node --experimental-strip-types mentorship-pairing.spec.ts`
→ **51 PASS · 0 FAIL** (target ≥40 ✅)

### Smoke
`cd src/lib/w77 && node --experimental-strip-types mentorship-pairing.smoke.ts`
→ **39 PASS · 0 FAIL** (target ≥20 ✅)

### SHA-256 Fixtures

- `sha256HexSync("")` = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` ✓
- `sha256HexSync("abc")` = `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad` ✓
- `sha256Hex(s)` (async, WebCrypto) === `sha256HexSync(s)` ✓

---

## Patterns Applied (cycle 60-76 lessons)

1. **Worktree-isolated** — `/tmp/w77-a` separate from main checkout, push to
   `w77/mentorship-pairing` only.
2. **Self-running test harness** — `it()` registry + runOne() pattern (cycle 73
   lesson). Exits 0 on PASS, 1 on FAIL.
3. **`runOne` wrapper resets audit state** — `_resetAuditForTests()` called in
   `runOne()` before each `await entry.run()` so state never leaks.
4. **Worktree-isolated tsconfig** — `target: ES2022, types: [], strict,
   noUncheckedIndexedAccess`.
5. **`node-stubs.d.ts` script file** — `declare global {}` with `process`,
   `crypto`, `TextEncoder`, `setTimeout` types.
6. **Sacred regex with NFD normalization** — NFD splits 'Oxalá' into 'Oxala' +
   `\u0301` (combining acute). Combining marks are `\p{M}` (NOT `\p{L}`),
   satisfying `[^\p{L}\p{N}_]` as a word boundary. This lets base-form terms
   in `SACRED_TERMS` (e.g. `'Oxala'`) match accented input (`'Oxalá'`).
7. **Branded types** — `MentorId`, `MenteeId`, `Tradition`, `Domain` are
   nominal, validated via factories with regex prefix.
8. **`Object.freeze` + `ReadonlyArray<T>`** — every exported collection, every
   `ScoreBreakdown`, every `PairResult`.
9. **7-tradição coverage** — full `TRADITION_LIST` of 7 sacred traditions
   included; affinity matrix maps cross-tradition similarity (e.g.
   Candomblé↔Umbanda = 2, Candomblé↔Cigano = 0).
10. **No B2B bloat** — engine is purely functional (no Stripe, no admin, no MFA,
    no DB). Mentor registry is in-memory; production swap is trivial.
11. **Pure-JS SHA-256 sync** — avoids `require('node:crypto')` which fails under
    `--experimental-strip-types` ESM contexts. Mirrors cycle 75 reference impl
    (~130 LOC). WebCrypto used for async path.
12. **Distance-based scoring** — 7-dimension distance/similarity composition
    with explicit weights (40/30/10/10/10/5/3) summing to ≤100 (cycle 71
    lesson).

---

## Five Durable Lessons (new this cycle)

### 1. NFD normalization is the canonical diacritic-handler for Unicode regex

`\b` fails on accented chars (cycle 75 lesson). But even with Unicode
lookaround `(^|[^\p{L}\p{N}_])…` + `u` flag, matching `'Oxala'` against
`'Oxalá'` still fails because `\p{L}` includes 'á' and the regex treats
`'Oxalá'` as one word.

**Solution:** NFD-normalize both text and term BEFORE regex. NFD splits
`'Oxalá'` into `'Oxala' + '\u0301'`. Combining marks (`\u0301`) are in
`\p{M}`, NOT `\p{L}`. So `[^\p{L}\p{N}_]` accepts `\u0301` as a word
boundary, letting the base form match.

```ts
function sacredMatch(text: string, term: string): boolean {
  const nfdText = text.normalize('NFD');
  const nfdTerm = term.normalize('NFD');
  const re = new RegExp(`(^|[^\\p{L}\\p{N}_])${escapeRegex(nfdTerm)}(?=$|[^\\p{L}\\p{N}_])`, 'u');
  return re.test(nfdText);
}
```

Reusable: any Unicode-aware text matching across Romance/oriental languages.

### 2. Pure-JS SHA-256 sync path beats `require('node:crypto')` under strip-types

`require()` is not available in ESM contexts under
`--experimental-strip-types`. Wrote my first attempt using `require('node:crypto')`
but it would fail in any future bundle that drops Node interop. The fallback
path (pure-JS SHA-256, ~130 LOC) is correct, faster than fs reads, and runs
in any ESM environment. The async path uses WebCrypto which Node 22 has
natively — no deps, no polyfills.

Reusable: any cycle-7X engine needing crypto under strict ESM.

### 3. Distance-based multi-dimensional scoring needs explicit weights

First attempt at scoring used uniform weights (each dimension max=100/N).
That meant a perfect domain match could overwhelm tradition mismatch —
producing absurd "Astrologia-only mentor gets paired with Candomblé mentee
because they both know tarot".

**Solution:** Document and enforce explicit weights summing to ≤100:
tradition=40, domain=30, secondary=10×4, sacred=5, recency=3. The
weights encode the project's belief that **tradition>domain>logistics**.
This is a cycle-71 lesson reinforced.

Reusable: any affinity/recommendation engine with heterogeneous dimensions.

### 4. Branded ID validation via factory + regex prefix blocks ID forgery

`MentorId` and `MenteeId` are nominal types. The factories enforce
`/^m_[a-z0-9_]{3,40}$/` and `/^s_[a-z0-9_]{3,40}$/` prefixes. Production
swap to UUIDs is trivial (replace factory body), but the prefix-based
validation means:
- IDs are grep-able in logs (`grep ^m_` finds all mentor IDs)
- Namespace is always visible at the type level (`m_` vs `s_`)
- Spoofing requires passing the regex check (no `as MentorId` bypass)
- Tests can construct IDs without going through `registerMentor` (for
  migration scenarios) by calling `mentorId('m_xyz123')`

Reusable: any domain where IDs need to be self-identifying.

### 5. In-memory `mentor` registry + `_resetAuditForTests()` makes testing trivial

Cycle 73 lesson, but the SIZE matters. With 51 specs all mutating state,
registering mentors across tests, the `runOne(name, fn)` wrapper that calls
`_resetAuditForTests()` BEFORE invoking `fn` is the single most important
defensive measure. Without it, test order matters; with it, tests are
fully independent and the harness can run any subset.

Reusable: any engine with mutable global state.

---

## Wall Time

Setup → engine → tests → smoke → fix bugs → commit/push:
**~22 minutes** (well under 30-min cap).

---

## Out of Scope / Not Shipped

- No DB persistence — registry is in-memory (production-swappable).
- No HMAC signing of audit log (cycle 75's `hmacSha256` is reusable).
- No REST/GraphQL API surface — engine is callable as TS module only.
- No rate limiting on `pairMentorship` calls.
- No caching layer (beyond SHA-256 cache key for client-side).

These are explicit NON-GOALS for the B2C-cut Cabala path. Future cycle can
add a thin `pairMentorshipRoute.ts` if external API access is needed.

---

**GitHub:** branch `w77/mentorship-pairing` (respawn of failed W76-A)
