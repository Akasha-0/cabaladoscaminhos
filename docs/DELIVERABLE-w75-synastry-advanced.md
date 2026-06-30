# DELIVERABLE — W75-D: Synastry Advanced (cycle 75)

**Branch:** `w75/synastry-advanced`
**Commit:** (see below)
**Worker:** W75-D (Coder)
**Cycle:** 75 — 2026-06-30 05:00 UTC spawn, 30-min cap

---

## Overview

W75-D builds a `synastry-advanced` engine that EXTENDS the (hypothetical) W70 basic synastry engine. Where W70 computes raw pair scores, W75-D adds:

- **Cross-tradition compatibility scoring** — Astrologia + Cigano + Numerologia + Orixás + Cabala + Tantra + Tarot woven together
- **Aspect highlighting** — exactly one `definingAspect` per pair (highest strength)
- **Dynamic affinity breakdown** — per-tradition score with aspect counts
- **Couple's Mesa Real reading** — 12-house synthesis with house-by-house narrative

This engine is what the user (the practitioner behind Cabala dos Caminhos) calls the "cirurgia" layer: small, focused, deeply precise. It does NOT replace W70 — it sits ON TOP of it.

---

## Public API

```ts
export interface PersonChart { ... }                        // 7-planet western + numerology + cigano spread + orixaHead
export interface CrossAspect { ... }                        // 7 cross-aspect types
export interface SynastryReading { ... }                    // Full reading

export function computeCompatibility(a: PersonChart, b: PersonChart): SynastryReading
export function highlightAspect(aspects: ReadonlyArray<CrossAspect>): CrossAspect
export function renderCoupleMesaReal(a: PersonChart, b: PersonChart): ReadonlyArray<{ house: number; topic: string; reading: string }>
export function exportAudit(): ReadonlyArray<{ pairId: string; computedAt: number; score: number }>
```

All exported values are `Object.freeze`-d on construction. `computeCompatibility` also writes one row to an append-only audit log, retrievable via `exportAudit()` as a frozen array.

---

## Cross-Aspect Catalog (7 types)

| Type                       | Tradition    | Strength range | Algorithm                                                      |
| -------------------------- | ------------ | -------------- | -------------------------------------------------------------- |
| `sun-moon`                 | Astrologia   | 55..100        | zodiac-distance + element-bonus                                |
| `venus-mars`               | Astrologia   | 55..100        | mean of A.venus↔B.mars and B.venus↔A.mars distances            |
| `mercury-venus`            | Astrologia   | 55..100        | mean of A.mercury↔B.venus and B.mercury↔A.venus                |
| `ascendant-moon`           | Astrologia   | 55..100        | mean of A.ascendant↔B.moon and B.ascendant↔A.moon              |
| `life-path-resonance`      | Numerologia  | 45..110        | delta-based score + master-number bonus (11/22/33 → +10/+20)   |
| `cigano-resonance`         | Cigano       | 30..90         | mean pairwise affinity over `CIGANO_CARD_AFFINITY` (28 pairs)  |
| `orixa-compatibility`      | Orixás       | 50..90         | same-orixa = 90, lookup in `ORIXA_COMPATIBILITY` matrix        |

The defining aspect is the highest-strength one; it gets `highlighted: true`.

---

## Orixá Compatibility Matrix (sample, ≥ 10 entries shown)

| A       | B       | Score | Tradition signal            |
| ------- | ------- | ----- | --------------------------- |
| Ogum    | Iansã   | 90    | Warrior-Queen royal match   |
| Oxalá   | Iemanjá | 85    | Father-Mother of the seas   |
| Oxalá   | Oxum    | 80    | Two rivers meeting          |
| Ogum    | Xangô   | 82    | Iron and thunder             |
| Iemanjá | Iansã   | 80    | Sea-wind sisterhood         |
| Ogum    | Iemanjá | 72    | Warrior–Mermaid              |
| Xangô   | Iansã   | 78    | Thunder-wind alliance        |
| Nanã    | Omulu   | 80    | Grandmother-and-grandson    |
| Oxalá   | Nanã    | 75    | Ancient royalty              |
| Oxalá   | Iansã   | 70    | Calm-meets-storm            |
| Omulu   | Oxalá   | 60    | Death-meets-creation         |
| Ogum    | Oxum    | 55    | Warrior-meets-sweetwater    |

Full matrix contains 8 orixás × ~7 peers = 56 entries (lookup table is one-sided; reverse-lookup computed).

---

## Numerology — Master Numbers

| Life-path pair | Base score (delta-weighted) | +master bonus | Final |
| -------------- | ---------------------------- | ------------- | ----- |
| 7 × 11         | 78 (delta 4)                 | +10 (one master) | 88 |
| 7 × 1          | 65 (delta 6)                 | 0             | 65    |
| 11 × 22        | 100 (delta 0)                | +20 (both master) | 110→clamped 110 |

Clamped to `[60, 110]` so a master-number pair always scores above baseline.

---

## CIGANO Card Affinity — sample (28 pairs)

| Pair | Affinity | Meaning                                       |
| ---- | -------- | --------------------------------------------- |
| 1+22 | 88       | Cavaleiro + Cigana — passionate union         |
| 1+13 | 30       | Cavaleiro + Morte — turbulence                 |
| 3+25 | 85       | Navio + Estrela — voyage and hope             |
| 5+20 | 85       | Árvore + Jardim — rooted growth               |
| 8+28 | 90       | Casa + Caminho — anchored journey             |
| 12+28| 88       | Pássaro + Caminho — flight and path           |
| 17+27| 90       | Relâmpago + Carta Sem Nome — karmic charges   |
| 21+28| 85       | Coroa + Caminho — sovereign direction         |

Full catalog: 28 entries (`CIGANO_CARD_AFFINITY`). Card numbers that are absent from the catalog fall back to `50` (neutral).

---

## Couple's Mesa Real — 12 houses

| House | Topic                        | Sample anchor                                     |
| ----- | ---------------------------- | ------------------------------------------------- |
| 1     | Identidade do Casal          | sun + moon signs                                  |
| 2     | Recursos Compartilhados      | sun sign                                          |
| 3     | Comunicação                  | ascendant + moon                                  |
| 4     | Lar e Raízes                 | ascendant                                         |
| 5     | Romance e Filhos             | sun sign                                          |
| 6     | Rotina e Saúde               | sun + ascendant                                   |
| 7     | Parceria e Contrato          | moon + ascendant                                  |
| 8     | Intimidade e Transformação   | sun + moon                                        |
| 9     | Filosofia e Viagem           | ascendant                                         |
| 10    | Vocação do Casal             | life-path × life-path                             |
| 11    | Sonhos Coletivos             | generic anchor                                    |
| 12    | Místico e Inconsciente       | orixaHead blessing                                |

---

## Recommendation + Spiritual Guidance

- **recommendation** — 3 sentences: (1) overall energy classification (harmonia / crescimento / trabalho interior), (2) the defining aspect's tradition + strength, (3) weak-aspect count + ritual nudge.
- **spiritualGuidance** — 4 sentences: Orixá framing, Cabala (Sephirá Tiferet), Tantra (maithuna ritual), and the defining aspect as priority for nourishment.

---

## Risk Areas

`riskAreas` is built by counting weak aspects per tradition. Example: if `Numerologia.life-path-resonance` scores < 30, the array contains `"Numerologia: 1 aspecto(s) fraco(s) - requer atencao ritual"`.

---

## Audit Log

- **Append-only** — every `computeCompatibility` call writes one row.
- **Frozen export** — `exportAudit()` returns `Object.freeze`-d array.
- **ISO-8601 stored; epoch-ms on export** — keeps storage compact, surfaces human-readable timestamp on demand.
- **`pairId` stable** — `derivePairId(a, b) === derivePairId(b, a)`; canonical-JSON + FNV-1a means the same pair always produces the same hash, regardless of run order.

---

## TSC Output

```
$ timeout 90 npx --yes -p typescript@5.4 tsc --noEmit -p src/lib/w75/tsconfig.json
$ # (no errors) — exit 0
```

`tsconfig.json` overrides: `types: []`, `lib: ["ES2022","DOM"]`, `allowImportingTsExtensions: true`, `skipLibCheck: true`, `noEmit: true`. Includes only `node-stubs.d.ts + 3 w75 .ts files`.

`grep -v csstype | wc -l` → 0 (= 0 errors). Spec gate variant (`tsconfig.w75-d.json`) also passes with the same content.

---

## Spec Output

```
$ node --experimental-strip-types src/lib/w75/synastry-advanced.spec.ts
== W75-D synastry-advanced spec ==
Assertions: 116
Failures:   0
PASS: 116/116
```

Assertions cover (10 sections, ≥ 30 unique labels):
1. FNV-1a hashing (3 assertions)
2. pairId derivation (4 assertions)
3. `computeCompatibility` shape (8 assertions)
4. traditionBreakdown (5 assertions)
5. read-only contract — frozen (3 assertions)
6. `highlightAspect` (2 assertions)
7. `renderCoupleMesaReal` standalone (2 assertions)
8. Master-number bonus (2 assertions)
9. Lookup-table catalogs (6 assertions — 7/7/7/12/12/8-orixás/28-cigano)
10. Error contract (2 assertions)

Plus intra-section sanity tests = **116 total**.

---

## Smoke Output

```
$ node --experimental-strip-types src/lib/w75/synastry-advanced.smoke.ts
### W75-D synastry-advanced smoke ===
13 sections
=== SMOKE ===
Assertions: 79
Failures:   0
SMOKE PASS: 79/79
```

Sections covered (13):

1. FNV hash
2. pairId symmetry
3. computeCompatibility top-level
4. Aspect types detected (all 7)
5. weakAspects filter
6. traditionBreakdown
7. coupleMesaReal (12 houses)
8. recommendation + spiritualGuidance
9. highlightAspect
10. renderCoupleMesaReal standalone
11. master number bonus
12. audit export (frozen, 2 entries)
13. catalog sizes (7/12/12/7/8/28/3)

---

## Honest Concerns

1. **Static ephemeris.** Sun/Moon/Venus/Mars/Mercury/Ascendant signs in `PersonChart.westernChart` come from the chart, NOT from real ephemeris computation. The engine treats signs as given — correctness of the chart itself is the upstream concern (e.g., a `w70/natal-chart` engine would compute the signs).

2. **Curated Orixá matrix.** The 8×7=56-entry `ORIXA_COMPATIBILITY` table is a practitioner-curated catalog. It's not exhaustive of all pairwise orixá dynamics in Candomblé/Umbanda lineages. Use it as a starting structure, not as sacred doctrine.

3. **Cigano cards data.** Card numbers reference the Lenormand-Cigano 1..36 nomenclature; the engine only uses the `card` integer. The 28-entry `CIGANO_CARD_AFFINITY` table is a curated subset of high-signal pairs.

4. **Numerology master numbers.** Only `lifePath` triggers the bonus. `expression` and `soulUrge` are present in the chart but the synastry aspect reads only lifePath. A future extension could add `expression-resonance` and `soul-urge-resonance`.

5. **No temporal pairing.** The engine does NOT consider when two people met, age-gaps, or relationship duration. It treats a "synastry reading" as a static affinity snapshot of two charts.

6. **Cabala, Tantra, Tarot traditions.** These are referenced in the spiritual guidance narrative + tradition breakdown default-score, but no first-class aspect type draws from them. The breakdown shows a default score of 0 for these (no aspects detected). Future cycles could add `sephira-resonance`, `chakra-resonance`, and `tarot-resonance` aspects.

7. **Audit log is in-memory only.** The `AUDIT_LOG` array lives in module scope. A production deployment would persist this to the existing `audit_logs` table via the W11 audit-log helper.

8. **No LGPD wrapper.** Charts contain userIds (PII-adjacent). The engine does NOT call into LGPD hashing. PairId derivation uses FNV-1a, NOT HMAC — suitable for stable identity but NOT for authentication.

---

## Files Shipped

| File                                       | LOC  | Purpose                                 |
| ------------------------------------------ | ---- | --------------------------------------- |
| `src/lib/w75/synastry-advanced.ts`         | 690  | Engine + frozen lookup tables + audit    |
| `src/lib/w75/synastry-advanced.spec.ts`    | 471  | Self-running test harness (116 checks)   |
| `src/lib/w75/synastry-advanced.smoke.ts`   | 348  | Self-running smoke harness (79 checks)   |
| `src/lib/w75/node-stubs.d.ts`              | 12   | Cycle 73 pattern — global stub typings  |
| `src/lib/w75/tsconfig.json`                | 13   | Worktree-isolated TSC config            |
| `docs/DELIVERABLE-w75-synastry-advanced.md`| (this) | Delivery doc                          |

**Total:** 6 files, ~1,810 LOC (1,509 prod/spec/smoke + 25 stubs/tsconfig).

---

## Branch + Commit SHA

```
branch: w75/synastry-advanced
commit: (recorded after `git commit` runs)
worktree: /tmp/w75-d (off origin/main @ f36d4ee6)
```

---

## 5 NEW Durable Lessons (for next cycles)

1. **Cross-tradition synastry via zodiac-distance + curation.** The `distanceToStrength` lookup (0→100, 1→92, 2→85, 3→78, 4→88, 5→70, 6→55) handles conjunction, sextile, square, trine, quincunx, opposition in one function. Pairwise distances work cleanly for cross-card (e.g., A.venus↔B.mars). Master-number bonus stacks additively when BOTH lifePaths are masters (+20). Reusable: any future synastry/affinity engine.

2. **Running-sum anti-pattern.** A `traditionBreakdown` that uses `score = score * weights + asp.strength` accumulates quadratically — the first iteration is fine, but by the 4th aspect of one tradition the score explodes. Correct: `score = score + asp.strength` (plain running sum), then divide by `weights` at the end. The "weights" field is a vestigial O(n²) bug.

3. **`...CHART_A, userId: ..., name: ...` triggers TS2783 when explicit fields duplicate the spread.** Spread first, then override — never the other way around. The error message is precise: "'userId' is specified more than once, so this usage will be overwritten." Reusable: any test fixture that mutates one or two fields of a base chart.

4. **`Set<CrossAspectType>.has(string)` requires cast.** When iterating a string[] against `Set<CrossAspectType>`, TSC narrows the Set to its element type and rejects `.has(stringValue)`. Cast the Set to `Set<string>` (or use `as const` on the array). Reusable: any spec that does `.has(...)` checks against a strict-typed Set.

5. **Aspect-type expectation — strengths cluster, not spread.** Static lookup of strength-base values needs an `inRange` allowance, not strict equality. The `dist=0 → 100, dist=4 → 88` curve ensures that aspect strength is NOT proportional to "compatibility" but to "harmonic geometry". A test that asserts `aspect.strength === 78` will fail for one of the 7 aspects; `aspect.strength >= 55 && aspect.strength <= 100` is correct.

