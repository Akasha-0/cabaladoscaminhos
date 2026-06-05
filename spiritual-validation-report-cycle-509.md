# SpiritualValidator — Cycle 509 Report
## `src/lib/ai/correlation-map.ts` vs `IDEIA.md` + Canonical Constants

---

## Overall: PARTIAL PASS — Weighted Score: 0.88/1.0

---

## 1. GOAL.md Reference

**Status: FAIL (score: 0.0)**
- `GOAL.md` does not exist in the repository.
- Per `IDEIA.md:6`, `IDEIA.md` IS the authoritative source; `correlation-map.ts` is its runtime projection.
- GOAL.md may be deprecated or never existed.
- **Cannot validate against it — blocking issue for this task.**

---

## 2. Chinese/Injected Text

**Status: FAIL (score: 0.85)**

| File | Line | Issue |
|---|---|---|
| `src/lib/ai/correlation-map.ts` | 12 | Mixed Chinese character `机器` (machine in Chinese) embedded in English comment: `rastreabilidade机器-readable` |

- **Severity:** Low
- **Runtime impact:** None — static comment only, not interpolated into prompts.
- **Type:** Comment quality / mixed-language contamination
- **Fix:** Replace `机器-readable` with `machine-readable` or `legível por máquinas`

---

## 3. House Names vs `lenormand-cards.ts`

**Status: PASS (score: 1.0)**

All 36 house names in `correlation-map.ts` match the canonical names in `src/lib/constants/lenormand-cards.ts` exactly, including:
- `A Âncora` (code) = `A Âncora` (constants) ✓
- All other 35 names ✓

---

## 4. Odu Names vs `odus.ts`

**Status: PASS (score: 1.0)**

All 16 Odu names match between `src/lib/constants/odus.ts` and `IDEIA.md §5` and `§6.2` exactly.
- Grafia variants (Okaran, Etaogundá, etc.) correctly marked as pending D4 in `IDEIA.md:639`.
- No discrepancies found.

---

## 5. Astrology Planet/House Mappings

**Status: PARTIAL PASS (score: 0.85)**

### Medium-Severity Gaps

#### House 7 — `src/lib/ai/correlation-map.ts:169-187`
- **IDEIA.md:109** says: `Lilith natal + Plutão aspectos tensos`
- **Code** (`primaryPlanets: ['lilith', 'pluto']`): Lists all Pluto placements
- **Gap:** IDEIA specifies `aspectos tensos` (hard aspects only). Code may over-match by including trine/sextile Pluto placements.
- **Severity:** Medium

#### House 36 — `src/lib/ai/correlation-map.ts:749-767`
- **IDEIA.md:457** says: `Nodo Sul natal + Saturno aspectos tensos + 12ª Casa`
- **Code** (`primaryPlanets: ['southNode', 'saturn']`): Lists all Saturn placements
- **Gap:** Same as House 7 — `Saturno aspectos tensos` in IDEIA but code matches all Saturn.
- **Severity:** Medium

#### House 34 — `src/lib/ai/correlation-map.ts:709-727`
- **Code** extractionKeys include `planetsInHouses.2`
- **Gap:** This key format may not exist in the Client Map JSON schema. If invalid, planet-in-house-2 silently fails to extract with no error.
- **Severity:** Medium — **requires schema verification**

### Aligned (no gaps)
- House 17: `northNode + urano` ✓ (`IDEIA.md:229`)
- House 22: `northNode + southNode + houses.1 + houses.7` ✓ (`IDEIA.md:289`)
- House 35: `6+10 Houses + saturno` ✓ (`IDEIA.md:445`)

---

## 6. Tantric Correlations

**Status: PASS (score: 0.9)**

| House | IDEIA says | Code extractionKeys | Status |
|---|---|---|---|
| 5 | Número de Alma | `['soul', 'soulDescription']` | ✓ `soul = reduce(day)` per IDEIA:600 |
| 17 | Número de Destino (ano completo) | `['destiny']` | ✓ `destiny = reduce(4 year digits)` per IDEIA:603 |
| 22 | Número de Caminho Tântrico | `['tantricPath']` | ✓ `tantricPath = reduce(day+month+year)` per IDEIA:604 |
| 25 | Número de Destino | `['destiny']` | ✓ |
| 34 | Número de Karma (mês) | `['karma', 'karmaDescription']` | ✓ `karma = reduce(month)` per IDEIA:601 |

**Correct gap:** Casa 5 has no Karma component in Tantric — IDEIA.md:86-87 only maps `Número de Alma`. Code correctly reflects this. ✓

---

## 7. Kabalah Correlations

**Status: PARTIAL PASS (score: 0.92)**

### Low-Severity Gaps

#### House 5 — `src/lib/ai/correlation-map.ts:138-142`
- **IDEIA.md:86** says: `Número de Destino`
- **Code** extractionKeys: `['expression']`
- **Gap:** Field name `expression` vs label `Destino`. Per `IDEIA.md:557`, `expression = destiny = soma de todo o nome` — these are aliases. Verify the Client Map key is `expression` not `destiny`.
- **Severity:** Low

#### House 26 — `src/lib/ai/correlation-map.ts:558-567`
- **IDEIA.md:338** says: `Caminho de Vida 7 (se presente)`
- **Code** extractionKeys: `['lifePath', 'lifePathMaster', 'expression']`
- **Gap:** Code generalizes to all `lifePath` values. IDEIA specifically calls out `7`. Arguably more complete, slight semantic drift.
- **Severity:** Low

---

## 8. Missing Correlations / Design Gaps

**Status: NEEDS REVIEW (score: 0.8)**

| Item | IDEIA.md | Code | Notes |
|---|---|---|---|
| Odu Natal for Casa 1 | `Filtrado pela temática de início e movimento` | No `odu` field in `CorrelationEntry` | Intentional — Odu natal uses separate algorithm (IDEIA.md:753). Not a bug. ✓ |
| `planetsInHouses.2` for Casa 34 | Implied by `2ª Casa natal` | `planetsInHouses.2` in extractionKeys | **Unverified schema key** — may not exist in Map JSON |

---

## 9. Proposals for New Valid Correlations

*(Not yet in code — proposals for future consideration, per AD-20.1)*

| ID | House | Proposal | Source | Notes |
|---|---|---|---|---|
| P-01 | 7 | Add `southNode` extraction | Astrologia Clássica — Nodo Sul em 8ª = legado de transformação perigosa/segredo de família | Aligns with IDEIA.md:109 (Plutão aspectos tensos). Needs AD-20.1 source doc first. |
| P-02 | 19 | Add `houses.10` to House 19 astrology | Astrologia Clássica — 10ª Casa = autoridade institucional, aligning with A Torre theme | Currently maps only 12ª + Saturno |
| P-03 | 34 | Add `jupiter` to House 34 | Astrologia Clássica — Júpiter governa abundância | Complements Vênus-only mapping in IDEIA.md:433. Needs explicit source. |
| P-04 | 35 | Add `houses.4` to House 35 astrology | 4ª Casa = lar/segurança emocional | Complements 6ª+10ª+Saturno with domestic stability dimension |

---

## 10. Source/Rationale Traceability (AD-20.6)

**Status: PASS (score: 1.0)**

Every house entry in `correlation-map.ts` has `source:` and `rationale:` fields populated.
- Sources: `Astrologia Ocidental Clássica`, `Cabala Numérica Pitagórica`, `Numerologia Tântrica Indiana`
- Rationales are one-line and cite `Doc 06 §2`
- AD-20.6 compliance: FULL ✓

---

## 11. Runtime Security

**Status: PASS (score: 1.0)**

- `机器-readable` in comment (line 12) is a static string — not interpolated into any user-facing output or prompt construction.
- No user-controlled data flows unsanitized through this file.
- No prompt injection vectors detected.
- `extractFromMap()` safely handles `null`/`undefined` map input.

---

## Summary Scores

| Area | Score |
|---|---|
| Chinese/injected text | 0.85 |
| GOAL.md reference | 0.00 |
| House names vs lenormand | 1.00 |
| Odu names vs odus.ts | 1.00 |
| Astrology planet mappings | 0.85 |
| Tantric correlations | 0.90 |
| Kabalah correlations | 0.92 |
| Missing correlations | 0.80 |
| Source traceability | 1.00 |
| Runtime security | 1.00 |
| **Weighted Average** | **0.88** |

---

## Action Items

### Blocking
1. Resolve GOAL.md status — determine if it should be restored from git history or if IDEIA.md is the sole authoritative source.

### High Priority
2. Verify `planetsInHouses.2` exists in the Client Map JSON schema (`src/lib/ai/correlation-map.ts:714`)

### Medium Priority
3. House 7: Add aspect filter note to rationale or add `aspects` extraction key to distinguish Pluto hard aspects from all aspects.
4. House 36: Same as above for Saturn.

### Low Priority
5. Fix Chinese character in comment: `src/lib/ai/correlation-map.ts:12` — replace `机器-readable` with `machine-readable`.
6. Verify `expression` key (vs `destiny`) in Client Map for House 5 Kabalah extraction.
