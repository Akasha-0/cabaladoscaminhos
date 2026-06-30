# W91s-B — Reputation Leaderboard UI · DELIVERABLE

**Branch:** `w91s/reputation-leaderboard-ui`
**Status:** ✅ SHIPPED + PUSHED
**Date:** 2026-06-30 14:21 UTC
**Worker:** W91s-B Coder (Mavis session 414826520948878)
**Parent wave-spawner:** 414815374045425 (sibling-prefix steer applied at 14:15 UTC — see "SIBLING COLLISION" section below)

---

## What shipped

A complete reputation-leaderboard widget + page, with a pure scoring engine,
two React components, a server-rendered page, source-inspection specs, and a
tsxruntime smoke. All written **from scratch** in cycle 91 (the main branch
had no `reputation.ts`; w25/w29 branches were never merged).

The framing is **universalista** — cross-tradition contribution to the house,
not competitive ranking between traditions.

---

## File layout (NEW files only)

| File | LOC | Purpose |
|---|---|---|
| `src/lib/w91/reputation-leaderboard-engine.ts` | 428 | Pure engine: scoring, sort, filter, paginate |
| `src/lib/w91/reputation-leaderboard-engine.spec.ts` | 533 | Source-inspection + runtime spec (41 assertions) |
| `src/components/community/leaderboard/LeaderboardWidget.tsx` | 222 | Top-N widget (sidebar, mobile-first) |
| `src/components/community/leaderboard/LeaderboardTable.tsx` | 503 | Full sortable, paginated table |
| `src/components/community/leaderboard/LeaderboardWidget.spec.tsx` | 361 | Source-inspection spec (39 assertions) |
| `src/app/(community)/community/leaderboard/page.tsx` | 347 | Server Component page at `/community/leaderboard` |
| `scripts/smoke-reputation-leaderboard.mjs` | 186 | tsx-runtime smoke (33 runtime assertions) |
| `tsconfig.w91s.json` | 35 | Per-file TSC config (paths + jsx + strict) |
| **Total** | **2,615 LOC** | 8 files |

(Plus the delivery file = 2941 total — discrepancy is doc rendering.)

---

## Test results

| Suite | Assertions | Result |
|---|---|---|
| `reputation-leaderboard-engine.spec.ts` | **41** | ✅ 41/41 PASS |
| `LeaderboardWidget.spec.tsx` (engine + table + page cross-file) | **39** | ✅ 39/39 PASS |
| `smoke-reputation-leaderboard.mjs` (tsxruntime) | **33** | ✅ 33/33 PASS |
| Per-file TSC (`tsc -p tsconfig.w91s.json`) | — | ✅ 0 errors |

**Total: 113 assertions, all green.**

---

## Engine API surface (cycle 91 contract)

```ts
import {
  calculateUniversalistaScore,   // base + breadth bonus
  scoreEntry,                    // attach score + breadth to entry
  sortByScoreDesc,               // stable desc sort
  applyFilters,                  // by tradition + minBreadth + minScore
  paginate,                      // slice the sorted array
  buildLeaderboard,              // top-level orchestrator
  topN,                          // convenience for widget
  DEFAULT_WEIGHTS,               // {posts:1, hr:2, ctr:3, m:5}
  TRADICAO_LABELS,               // verbatim PT-BR
  TRADICAO_BADGES,               // with sacred symbols (✦ 🪶 ☩ ◈ ☸)
  TRADICAO_ACCENT_CLASSES,       // Tailwind class fragments
  TRADITION_IDS,                 // 5 canonical ids
  reputationLeaderboardEngine,   // frozen container export
} from '@/lib/w91/reputation-leaderboard-engine';
```

### Scoring formula

```
base = posts × 1 + helpfulReactions × 2 + crossTraditionReads × 3 + mentorshipGiven × 5
breadthBonus = (traditionsActive.length - 1) × 3
score = base + breadthBonus   (capped at 5 traditions)
```

The breadth bonus is the **universalista differentiator** — it rewards
cross-tradition contribution WITHOUT punishing single-tradition depth.

---

## Sacred-cultural compliance

- 5 traditions rendered as **badges** (never ranks): Candomblé, Umbanda,
  Ifá, Cabala, Astrologia — verbatim PT-BR labels
- Sacred terms preserved (Babalaô, Oyá, Ialá, Mestra, Obá)
- Sacred symbols: ✦ Candomblé · 🪶 Umbanda · ☩ Ifá · ◈ Cabala · ☸ Astrologia
- **No** negative-binding vocabulary (amarração / amarre / vinculação)
  — verified by source-inspection regex with `\b...\b` word boundaries
- Positive framing throughout: "Reconhecimento universalista", "Contribuição",
  "Mérito", "Curiosidade"
- The methodology footer explicitly says merit is "nunca em disputa entre
  caminhos" — never a dispute between paths

---

## Component architecture

### `LeaderboardWidget.tsx` (top-10)
- `'use client'`, mobile-first (max-w-full → sm:max-w-md)
- 44px touch targets on every interactive element
- `role="region"`, `aria-label="Reconhecimento universalista"`
- Each row has `data-testid="leaderboard-widget-row-N"`
- Crown icon for rank 1, numeric for others
- Tradition badge colored per-tradition (Tailwind classes)
- "breadth" sub-text shows `N tradições` when breadth > 1
- Empty state: "Ainda sem contribuições reconhecidas. Sua jornada pode ser a próxima ✨"

### `LeaderboardTable.tsx` (full table)
- `'use client'`, responsive (mobile cards below sm, table above)
- Sortable columns via 7 sort keys, with `aria-sort="ascending|descending|none"`
- Tradition filter as `role="tablist"` with `aria-selected`
- Pagination via `<nav aria-label="Paginação">` with prev/next + page info
- All metric columns present: posts, helpfulReactions, crossTraditionReads, mentorshipGiven
- Tradition breadth column + computed score column
- Mobile cards collapse to stacked `<dl>` with `<dt>/<dd>` semantics

### `page.tsx` (server)
- `dynamic = 'force-dynamic'`, `revalidate = 0`
- Reads from `loadLeaderboardEntries()` (currently seed data, marked as
  integration seam for cycle 92's real Prisma query)
- Header with sparkles icon + 5-tradition chain + h1 with gradient text
- Methodology footer explaining the scoring formula
- LGPD notice: "Você pode solicitar a remoção da sua conta da listagem a qualquer momento"

---

## Source-inspection pattern

Both specs use the cycle 68/73/86/89/90s source-inspection harness — no
vitest, no jsdom. They:

1. Read the source file via `readFileSync`
2. Assert via regex on the source (structural invariants)
3. Import + exercise the engine at runtime (math correctness)
4. Run a self-execution loop, exit 0 on full PASS

Cycle 90s lesson applied: word-boundary regex (`\b...\b`) for banned-vocab
scans; strip comment lines to allow JSDoc policy references; obfuscate
banned-vocab strings so the spec doesn't self-flag.

---

## SIBLING COLLISION (cycle 91 lesson)

At 14:15 UTC, parent wave-spawner 414815374045425 detected a sibling collision
on `w91/reputation-leaderboard-ui` (another wave-spawner spawned its own W91-B
worker ~6 min earlier on the same branch). Per the steer:

- **Switched branch prefix** from `w91/` to `w91s/` to avoid the race
- Created new worktree `/workspace/wt-w91s-reputation-leaderboard-ui` from
  `origin/main @ 1d1a8701`
- Symlinked `node_modules` from parent to skip `npm install`
- Continued work in isolation, no code collisions

This is the same pattern that worked for W90s-A, W90s-D — and is now a
**durable lesson** for cycle 91+ workers in this repo: when a wave-spawner
siblings-flag collision, switch to `w91s/` prefix immediately, even if it
means ~2 min of worktree setup cost.

---

## Verification commands

```bash
# Per-file TSC (0 errors expected)
npx tsc --noEmit --skipLibCheck -p tsconfig.w91s.json

# Runtime smoke
npx tsx scripts/smoke-reputation-leaderboard.mjs

# Engine spec (41 assertions)
npx tsx src/lib/w91/reputation-leaderboard-engine.spec.ts

# Widget/table/page spec (39 assertions)
npx tsx src/components/community/leaderboard/LeaderboardWidget.spec.tsx
```

---

## Time tracking

| Phase | Time |
|---|---|
| Pre-flight + steer + worktree switch | ~3 min |
| Engine (1 file) | ~10 min |
| Widget + Table + Page (3 files) | ~10 min |
| Specs + smoke (3 files) | ~5 min |
| Debug, fix, re-validate | ~3 min |
| **Total** | **~31 min** |

Pushed at 14:21 UTC, within the 30-min cap (effective cap = 14:23 UTC
from spawn time of 13:53 UTC).

---

## Next-step recommendations (cycle 92+)

1. **Real data source** — replace `loadLeaderboardEntries()` seed data with
   the actual Prisma query joining `User`, `Post`, `Reaction`, `Mentorship`,
   and `TraditionActivity` tables. The DTO type already matches.
2. **Cache layer** — current page is `dynamic = 'force-dynamic'`. Once data
   shape is stable, switch to `revalidate = 300` with on-demand
   revalidation via Prisma hook.
3. **OPT-OUT endpoint** — the LGPD footer references user opt-out; ship
   `/api/community/leaderboard/opt-out` route + user toggle in settings.
4. **PII hashing** — `userId` is exposed; cycle 92 should hash to short
   opaque IDs before returning in `LeaderboardEntryDto` to comply with
   the LGPD minimal-disclosure principle.
5. **i18n** — current copy is PT-BR hardcoded; the codebase has
   `useT()` from `@/lib/i18n/useT`. Cycle 92 wires this up.

---

**SHIP. PUSH. REPORT. WAIT FOR NEXT WAVE.**