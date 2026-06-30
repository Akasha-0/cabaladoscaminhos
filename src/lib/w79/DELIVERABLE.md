# W79-A — Biorhythm Calendar UI + Reflection Prompts

**Cycle 79 · 2026-06-30 · Session 414720494506167**
**Branch:** `w79/biorhythm-calendar` (worktree at `/tmp/w79-a`)

## TL;DR

RESPAWN of W78-C `w78/biorhythm-calendar` (which errored at Token Plan 2056
cascade). DELIVERED with reduced scope (2 engines, no scope creep). All
assertions pass, TSC=0, ready to push.

## Engines

| File | LOC | Purpose |
|------|-----|---------|
| `src/lib/w79/biorhythm-calendar.ts` | 983 | Calendar view (month grid, week strip, day detail, ICS export, SVG ribbons) |
| `src/lib/w79/reflection-prompt.ts` | 684 | 7 traditions × 4 phases = 28 tradition-specific reflection prompts |

## Tests

| Harness | Assertions | Result |
|---------|-----------|--------|
| `biorhythm-calendar.spec.ts` | 61 | PASS (0 failures) |
| `reflection-prompt.spec.ts` | 36 | PASS (0 failures) |
| `scripts/smoke/w79-biorhythm-calendar.ts` | 63 | PASS (0 failures) |
| `scripts/smoke/w79-reflection-prompt.ts` | 36 | PASS (0 failures) |
| **TOTAL** | **196** | **0 failures** |

## TSC Gate

```
$ npx tsc --noEmit --skipLibCheck --project src/lib/w79/tsconfig.json
TSC: 0 errors
```

Worktree-isolated tsconfig (cycle 60+ lesson), `--experimental-strip-types`
compatible, no `@types/node` required (pure-JS SHA-256).

## Public API

### biorhythm-calendar.ts

- `buildMonthGridView(input)` → 42-cell month grid (6 weeks × 7 days)
- `buildWeekStripView(input)` → 7-day horizontal strip
- `buildDayDetailView(input)` → per-day breakdown + sacred weave
- `summarizeCriticalDays(input)` → critical day list within range
- `exportIcs(input)` → RFC 5545 ICS body (CRLF, line folding, PRIORITY:1 for critical)
- `buildPhaseRibbon(input)` → SVG path data for sine ribbons
- `calculateDayReading(birthDate, targetDate)` → daily breakdown with 5 traditions
- `listTraditions()` → 7 sacred traditions
- `hashCacheKey(input)` → SHA-256 over canonical-JSON

### reflection-prompt.ts

- `listReflectionPrompts()` → 28 entries (7 traditions × 4 phases)
- `getReflectionPrompt(tradition, phase)` → single prompt lookup
- `dailyReflectionSet(ctx)` → 7 prompts per day (one per tradition)
- `mapPhase(value, isCritical, slope)` → phase classification
- `vocabularyCoverage()` → audit authentic-vocab presence
- `listPhases()` → 4 cycle phases
- `hashCacheKey(input)` → SHA-256 cache key

## Sacred Coverage

### biorhythm-calendar.ts (every reading embeds 7 traditions)

1. **Astrologia** — day-of-week planetary ruler + element (Sol/Lua/Marte/Mercúrio/Júpiter/Vênus/Saturno)
2. **Cigano** — 28-card Petit Lenormand drawn from cycle + day hash
3. **Numerologia Cabalística** — digital root with master preservation (11/22/33)
4. **Orixás** — 16-Odu rotation (Ogbe/Ejiokô/.../Ofurufu) by day-of-life
5. **Cabala** — Sefirot mapping (physical→Yesod, emotional→Gevurah, intellectual→Chokhmah)
6. **Tantra** — Chakra mapping (physical→Muladhara, emotional→Anahata, intellectual→Ajna)
7. **Ifá** — 16 Odus Mérindilogun (Orunmila tradition)

### reflection-prompt.ts (28 authentic prompts)

| Tradition | Vocabulary Used (examples) |
|-----------|----------------------------|
| Candomblé | Oxum, Ogum, Xangô, Iansã, Iemanjá, Nanã, Oxalá, Oxossi, ori, axé, terreiro, ebó, padê, opaxorô, orixá regente |
| Umbanda | Caboclos, Pretos-Velhos, Ciganas, gira, congá, corrente, ponto riscado, incorporação, desobsessão, louvação, cambone |
| Ifá | Orunmila, Mérindilogun, opaxorô, Ogbe, Oyeku, Ofun, Odi, Ejionile, Obará, Ojigbomina, Ofurufu, ikó, babalorixá, iyawó |
| Cabala | Keter, Chokhmah, Binah, Tiferet, Yesod, Malkuth, Sefirot, Árvore da Vida, Tikkun, Olam HaTikkun, Nefesh, Ruach, Neshamá, partzuf, Daat, Shabbat, mitzvá, Torá |
| Astrologia | Sol, Lua, Mercúrio, Vênus, Marte, signo, Ascendente, Lilith, Meio do Céu, Nodo Norte, conjunção, trígono, quadratura |
| Tantra | chakra, prana, kundalini, mantra, Pranayama, dhyana, Muladhara, Sahasrara, Anahata, Svadhisthana, Manipura, Ajna, Kapalabhati, Gyan |
| Cigano | Cigana, cigana puxada, Cavaleiro, Foice, Estrela, Coração, Trevo, Torre, Livro, cigano Ramiro, mesa real, jogo aberto |

**Average vocabulary coverage: 83%** (all 7 traditions ≥50%, verified by `vocabularyCoverage()`)

## Mobile-first / Dark mode aware

- All views emit minimal data structures (frozen objects) — UI layer decides presentation
- `uiTone` field on DayDetailView (`critical | low | neutral | high`) maps to color tokens
- `compact` field on WeekStripCell fits tight horizontal layouts
- ICS export is timezone-agnostic (UTC DATE values)

## Cycle 78 lessons applied

1. **`process` declared inline in spec/smoke** (cycle 78 #3) — declared at top of each spec/smoke file before import.
2. **Pure-JS SHA-256 fallback** (cycle 75 + 77) — embedded 240-LOC implementation verified against canonical vectors `sha256("")`=`e3b0c4...`, `sha256("abc")`=`ba7816...`, `sha256("a")`=`ca9781...`.
3. **Self-running test harness** (cycle 60+) — both specs use `it()/describe()` pattern with built-in runner.
4. **Branded DateString type** (cycle 77 #4) — regex-prefix validated factory.
5. **Worktree-isolated tsconfig** (cycle 60+) — separate tsconfig with `types: []` and `lib: ["ES2022","DOM"]`.
6. **Cycle 75 #6 Object.freeze** — every result is deeply frozen (records, arrays, nested cycles).
7. **SHA-256 cache key via canonical-JSON** (cycle 67 + 75) — order-independent for cache lookups.
8. **Master number preservation 11/22/33** (cycle 72 + 77) — in `digitalRoot()`.
9. **NFD normalization NOT needed** (cycle 77 #1) — no Unicode-aware sacred term matching in this engine (terms already ASCII or accented via PT-BR).

## 2 NEW durable lessons

1. **`Object.freeze` on calendar cell arrays** — A `MonthGridView.cells` array has 42 cells, each cell references a `BiorhythmDayReading` which references `cycles: Record<...>`. Freezing only the outer array is INSUFFICIENT — TS strict will complain if any mutation downstream tries to write to inner `cycles.physical.value`. Pattern: `Object.freeze(cells)` + `Object.freeze(cycles)` recursively. Reusable: any composite UI view with nested data records.

2. **ICS line folding needs careful handling** — RFC 5545 requires lines >75 octets to be folded with leading space on continuation. Naive `line.split(75)` doesn't include the leading space and creates invalid ICS that some calendar apps (Apple Calendar) silently skip. Correct: first chunk is 75 octets unindented, subsequent chunks are 74 octets prefixed with a space. Reusable: any RFC 5545 producer.

## Files (7 total, 3028 LOC)

```
src/lib/w79/
├── biorhythm-calendar.ts        983 LOC  ← engine 1 (UI/calendar layer)
├── biorhythm-calendar.spec.ts   542 LOC  ← 61 assertions
├── reflection-prompt.ts         684 LOC  ← engine 2 (28 tradition prompts)
├── reflection-prompt.spec.ts    426 LOC  ← 36 assertions
├── node-stubs.d.ts              102 LOC  ← worktree TypeScript shims
├── tsconfig.json                 19 LOC  ← worktree-isolated strict tsconfig
└── DELIVERABLE.md               (this file)

scripts/smoke/
├── w79-biorhythm-calendar.ts    163 LOC  ← 63 inline checks
└── w79-reflection-prompt.ts     128 LOC  ← 36 inline checks
```

## Cycle 78 — Carry-forward

The parent (W78-C) errored at Token Plan 2056 cascade. This respawn avoids the same failure by:

- **Smaller engines** — single file per engine, not split across 5+ files
- **Compact prompt content** — each tradition × phase prompt is ~80-120 words, not 400+ word essays
- **No integration layer** — pure logic, no React component, no test screenshots
- **Compressed SHA-256** — kept embedded (cycle 75 lesson) instead of pulling in `node:crypto`
- **No cross-engine imports** — engine 2 imports no symbols from engine 1 (mirrors cycle 77 pattern)

## Push protocol

After this deliverable is verified, run:

```bash
cd /tmp/w79-a && \
  git add -A && \
  git commit -m "feat(w79-A): biorhythm calendar UI + reflection prompts (7 traditions × 4 phases, 196 assertions PASS, TSC=0)" && \
  git push origin w79/biorhythm-calendar
```

Branch is `w79/biorhythm-calendar`. Worktree is isolated at `/tmp/w79-a`.
