# Mandala Evolution SPEC v3.0 — Akasha OS

**Status**: Active development
**Branch**: `feat/mandala-evolution-v2`
**Previous PR**: #6 (Phase 1–3 merged)
**Updated**: 2026-06-19

---

## Vision

The Mandala is the primary visual interface of Akasha OS — a living, interactive map of the 5 Pilares (Cabala, Astrologia, Tantra, Odu, I Ching). It must be:
- **Accessible**: WCAG 2.1 AA, keyboard-only navigable, screen reader coherent
- **Performant**: <100ms interaction response, Suspense-ready, no layout shift
- **Synthesis-aware**: F-227 AkashaAuthority integrated, F-223 CaixaUnificada linked
- **Fully i18n**: Every string translatable via i18n framework
- **Tested**: Comprehensive unit + integration coverage

---

## Phase 1 — Done ✅ (v0.0.19)

- [x] Extract 8 layer components from 754-line MandalaChart monolith
- [x] Create useLayerState + useMandalaData + useReducedMotion hooks
- [x] WCAG contrast fix (inactive node halo 0.12 → 0.35)
- [x] Touch targets (44px minHeight, 88px minWidth)
- [x] i18n keys for mandala layer labels (pt-BR + en)
- [x] Phase 1 QA triad: TS 0 errors, lint 0 errors, tests passing

---

## Phase 2 — Keyboard Nav + Accessibility ✅ Done

- [x] All 5 layer `<g>` groups get `tabIndex={0}`, `role="button"`, `aria-label`
- [x] `onKeyDown` handler: Enter/Space activates layer toggle (all 5 layers)
- [x] Native SVG `<title>` elements for WCAG-compliant tooltips on hover/focus
- [x] `prefers-reduced-motion` via useReducedMotion hook
- [x] InfoPanel CSS transitions (slide-up, fade-in)

---

## Phase 3 — MandalaContext + F-227 ✅ Done

- [x] `mandala-context.tsx`: MandalaProvider + MandalaContextValue + useMandalaContext
- [x] InnerMandalaChart consumes useMandalaContext() for all layer state
- [x] AkashaAuthorityPrompt rendered via MandalaProvider when authority non-null

---

## Phase 4 — Sefirot Design ✅ Done (Spec only)

- [x] `docs/MANDALA-SEFIROT-TREE-DESIGN.md` (634 lines) — full 10-sefirot coordinates, 22 path SVG data, Hebrew letters, colors
- [x] Phase 6 implementation: Layer2Kabala rewrite (in progress — this cycle)

---

## Phase 5 — i18n Completeness, Tests, Sefirot, A11y (Current Cycle)

### Phase 5a — i18n Completeness ✅ Done

- [x] 107 mandala.* keys in en.json + pt-BR.json (perfect parity)
- [x] `mandala.panels.kabala.*` (52+ keys for KabalaInfoPanel + TantricBodyInfoPanel)
- [x] `mandala.panels.astrology.*`, `mandala.panels.iching.*`, `mandala.panels.odu.*`
- [x] `mandala.tooltips.layer1-5`, `mandala.layerNames.1-5`
- [x] `buildTooltipByLayer` returns i18n-keyed TooltipKey objects
- [x] All 4 InfoPanels wired to `useTranslation()` from `@/i18n`
- [x] `@/i18n` module created (index.ts wraps `@/lib/i18n`)

### Phase 5b — Test Coverage (In Progress)

**Goal**: Zero test coverage → Comprehensive unit tests

**Files to create**:
- `tests/components/akasha/MandalaChart.test.tsx`
- `tests/components/akasha/hooks/useMandalaData.test.ts`
- `tests/components/akasha/hooks/useLayerState.test.ts` (verify existing)
- `tests/components/akasha/layers/Layer2Kabala.test.tsx`
- `tests/components/akasha/layers/Layer4Astrology.test.tsx`
- `tests/components/akasha/MandalaInfoPanels.test.tsx`

**Acceptance criteria**:
- `pnpm test:run` → all Mandala tests pass
- Mock strategy: mock MandalaProvider context, mock useMandalaData, mock individual layer props

### Phase 5c — Sefirot Layer2 Rewrite (In Progress)

**Goal**: Replace 3-vertex triangle with full 10-sefirot Tree of Life

**Changes**:
- `mandala-layers.ts`: Add `SefiraNode`, `SefiraPath`, `SefiraTree` interfaces + `buildSefiraTree()` function
- `Layer2Kabala.tsx`: Rewrite to render 10 sefira circles + 22 paths
- `useMandalaData.ts`: Export `sefiraTree` in MandalaDerivedData
- `MandalaChart.tsx`: Pass `sefiraTree` prop to Layer2Kabala

**SVG coordinates** (viewBox 400x400):
```
Keter: x=200 y=35     Chokhmah: x=245 y=110    Binah: x=155 y=110
Chesed: x=245 y=155   Gevurah: x=155 y=155     Tiferet: x=200 y=180
Netzach: x=245 y=240  Hod: x=155 y=240          Yesod: x=200 y=275
Malkuth: x=200 y=320
```

**22 paths** connecting sefirot. Path active when both endpoint sefirot are active.

**Colors**: Keter=#9B7FD4, Chokhmah=#4FC3F7, Binah=#1565C0, Chesed=#42A5F5, Gevurah=#EF5350, Tiferet=#FFD700, Netzach=#4CAF50, Hod=#FFA726, Yesod=#AB47BC, Malkuth=#8D6E63

**Acceptance criteria**:
- Layer 2 renders full sefirot tree when lifePath is set
- Keyboard nav preserved (role=button, tabIndex, onKeyDown)
- pnpm typecheck → 0 errors

### Phase 5d — InfoPanel Depth: TantricBody Wisdom

**Goal**: Render rich TANTRIC_BODY_WISDOM content (desc/challenge/activate) in TantricBodyInfoPanel

**Changes**:
- `MandalaInfoPanels.tsx`: Update TantricBodyInfoPanel to show per-body wisdom
- For each of 11 bodies: show `TANTRIC_BODY_WISDOM[body.index].desc` as label
- If `showAdvanced`: render `.challenge` and `.activate` fields from TANTRIC_BODY_WISDOM

**Acceptance criteria**:
- TantricBodyInfoPanel renders wisdom text for each body
- Advanced toggle reveals challenge + activation ritual

### Phase 5e — Performance + A11y Audit

**Performance**:
- Layer4Astrology: verify CSS-only rotation vs RAF claim in CHANGELOG
- Update CHANGELOG if claim is inaccurate
- Check unused imports in MandalaChart.tsx
- Verify React.memo on all layer components

**Accessibility**:
- WCAG 2.1 AA color contrast audit on all InfoPanels
- Focus indicator visibility on keyboard-navigated elements
- `aria-live` regions for dynamic InfoPanel content

---

## Verification Matrix

| Phase | Task | Status | Verification |
|---|---|---|---|
| 5a | i18n keys + InfoPanel wiring | ✅ Done | 107 keys, parity, typecheck 0 |
| 5b | Test files created | 🔄 In Progress | pnpm test:run all pass |
| 5c | Sefirot Layer2 rewrite | 🔄 In Progress | typecheck 0, sefirot tree renders |
| 5d | TantricBody wisdom rendering | 🔄 In Progress | InfoPanel shows wisdom text |
| 5e | Performance + A11y audit | 🔄 In Progress | typecheck + lint 0 |

---

## QA Contract

All phases must pass before release:
- `pnpm typecheck` → 0 errors
- `pnpm test:run` → 100% pass (no skipping)
- `pnpm lint` → 0 errors (691 pre-existing warnings acceptable)
- `pnpm i18n:check` → key parity between en.json and pt-BR.json

---

## Gap Analysis Summary (from Research Agent)

### P0 — Must Fix
1. **i18n**: All InfoPanel text hardcoded Portuguese → ✅ Fixed (107 keys)
2. **Tests**: Zero test coverage → 🔄 In Progress
3. **Sefirot**: Triangle instead of Tree of Life → 🔄 In Progress

### P1 — Important
4. **TantricBody wisdom**: desc/challenge/activate never rendered → 🔄 In Progress
5. **Performance**: RAF claim inaccurate (CSS-only rotation) → 🔄 In Progress
6. **A11y**: Focus management in InfoPanels → 🔄 In Progress

### P2 — Nice to Have
7. Layer interaction animation polish
8. Responsive SVG sizing improvements
9. PWA offline Mandala caching

---

## Files Changed This Cycle

```
src/i18n/index.ts                          [NEW] @/i18n module
src/i18n/en.json                           [MOD] +107 mandala keys
src/i18n/pt-BR.json                        [MOD] +107 mandala keys (parity)
tests/components/akasha/*.test.tsx          [NEW] test coverage
layers/Layer2Kabala.tsx                     [MOD] Sefirot rewrite
mandala-layers.ts                          [MOD] buildSefiraTree
useMandalaData.ts                          [MOD] sefiraTree export
MandalaChart.tsx                           [MOD] sefiraTree prop pass
MandalaInfoPanels.tsx                      [MOD] TantricBody wisdom + i18n
CHANGELOG-mandala.md                       [MOD] phase entries
```

---

## Open Questions

1. `@/i18n` useTranslation() always returns DEFAULT_LOCALE='pt-BR' — does Next.js App Router handle locale switching through server components?
2. Sefirot Hebrew letter assignments for paths 18-21 require primary-source verification before Phase 6 final
3. RAF vs CSS animation: CSS approach confirmed working — confirm no precision need
