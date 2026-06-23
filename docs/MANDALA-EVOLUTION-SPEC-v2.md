# Mandala Evolution SPEC v2.0 — Akasha OS

**Status**: Active development  
**Branch**: `feat/mandala-evolution-phases1-4`  
**PR**: #6 (Phase 1 merged)  
**Updated**: 2026-06-18

---

## Vision

The Mandala is the primary visual interface of Akasha OS — a living, interactive map of the 5 Pilares (Cabala, Astrologia, Tantra, Odu, I Ching). It must be:
- **Accessible**: WCAG 2.1 AA, keyboard-only navigable, screen reader coherent
- **Performant**: <100ms interaction response, Suspense-ready, no layout shift
- **Synthesis-aware**: F-227 AkashaAuthority integrated, F-223 CaixaUnificada linked
- **Evolving**: Phased enhancement (Phase 1 done, Phase 2–5 in progress)

---

## Phase 1 — Done ✅ (v0.0.19)

- [x] Extract 8 layer components from 754-line MandalaChart monolith
- [x] Create useLayerState + useMandalaData + useReducedMotion hooks
- [x] WCAG contrast fix (inactive node halo 0.12 → 0.35)
- [x] Touch targets (44px minHeight, 88px minWidth)
- [x] i18n keys for mandala layer labels (pt-BR + en)
- [x] Phase 1 QA triad: TS 0 errors, lint 0 errors, tests 6 fail (pre-existing)

---

## Phase 2 — Keyboard Nav + Focus Tooltips (In Progress)

### Goal
Make every SVG layer group keyboard accessible and add focus-triggered tooltips.

### Requirements
- [ ] All 5 layer `<g>` groups get `tabIndex={0}`, `role="button"`, `aria-label`
- [ ] `onKeyDown` handler: Enter/Space activates layer toggle
- [ ] InfoPanel shows focused layer info via `aria-describedby`
- [ ] `prefers-reduced-motion: reduce` kills all CSS transitions + animations
- [ ] `transition: none !important` added to `@media (prefers-reduced-motion)`

### Files to change
- `layers/Layer1Ancestralidade.tsx`
- `layers/Layer2Kabala.tsx`
- `layers/Layer3Tantra.tsx`
- `layers/Layer4Astrology.tsx`
- `layers/Layer5Iching.tsx`
- `layers/mandala-css.ts`

### Verification
- `pnpm typecheck` → 0 errors
- `pnpm lint` → 0 errors
- Keyboard-only test: Tab through all 5 layer groups

---

## Phase 3 — Synthesis Integration

### Goal
Connect Mandala to AkashaSynthesis (F-227) + F-223 CaixaUnificada.

### Requirements
- [ ] `MandalaContext` provider wrapping `MandalaChart`
  - Provides: `activeLayer`, `hoveredLayer`, `synthesis`, `dailyContent`
  - Consumers: `InfoPanel`, `AkashaAuthorityPrompt`, `CaixaUnificada`
- [ ] F-227 `AkashaAuthorityPrompt` embedded in `MandalaChart` header
- [ ] F-227 authority (Corpo 3=paz, Corpo 4=ansiedade) shown on layer toggle
- [ ] `deriveAkashaAuthority` called from `MandalaContext`, not inside layer components
- [ ] `useAkashaSynthesis` hook used in Mandala page

### Files to create/change
- `lib/application/akasha/mandala-context.tsx` (new)
- `components/akasha/MandalaChart.tsx` (wrap with context)
- `pages/[locale]/(akasha)/dashboard/page.tsx` (add authority prompt)

### Verification
- Mandala renders `AkashaAuthorityPrompt` when synthesis is complete
- Authority changes when user toggles layer 1 or layer 4

---

## Phase 4 — Performance (Suspense + Lazy Loading)

### Goal
Zero layout shift, progressive loading, <100ms interaction response.

### Requirements
- [ ] `MandalaChart` wrapped in `<Suspense fallback={<MandalaSkeleton />}>`
- [ ] `MandalaSkeleton` matches exact Mandala SVG dimensions (400×400 viewBox)
- [ ] Layer components lazy-loaded via `React.lazy()` for code splitting
- [ ] No `useEffect` for initial render (all data passed via props)
- [ ] `router.refresh()` after mutations instead of full navigation

### Files to create/change
- `components/akasha/MandalaSkeleton.tsx` (new)
- `components/akasha/MandalaChart.tsx` (add Suspense + lazy layers)
- `pages/[locale]/(akasha)/dashboard/page.tsx` (add Suspense boundary)

---

## Phase 5 — Odu Glyphs Enhancement

### Goal
Replace Odu circles with authentic Ifá glyphs (Oldu/Ogbè, Yoruba script).

### Requirements
- [ ] Research authentic Odu Ifá glyph shapes (Ogbè, Yoruba script Unicode or SVG paths)
- [ ] Replace Layer 1 gold circles with Odu glyph SVG paths
- [ ] Each of 16 principal Odu mapped to correct glyph
- [ ] `oduName` from `data.odus.oduName` drives glyph selection
- [ ] Odu glyphs rotate with `ringPaused` state
- [ ] No invented correspondences (R-022 §4.4) — only documented Ifá tradition

### Files to change
- `layers/Layer1Ancestralidade.tsx`
- `lib/grimoire/akasha-authority.ts` (add Odu mapping if needed)

---

## Phase 6 — Full Sefirot Tree (Cabala)

### Goal
Show all 10 sefirot with authentic paths on Layer 2.

### Requirements
- [ ] Map all 10 sefirot (Keter, Chokhmah, Binah, Chesed, Gevurah, Tiferet, Netzach, Hod, Yesod, Malkut)
- [ ] Connect sefirot with 22 paths (22 Hebrew letters correspondence)
- [ ] Highlight the 3 active pillars (Chesed/Gevurah/Tiferet) based on `data.kabala`
- [ ] Master number indicators for life path
- [ ] `data. kabala.sefirot` shape: `Record<SefiraName, { active: boolean; path: [number, number][] }>`

### Files to change
- `layers/Layer2Kabala.tsx` (major rewrite)
- `lib/grimoire/synthesis/synthesizer.ts` (add sefirot derivation)

---

## Phase 7 — I Ching Lines Enhancement

### Goal
Render full 6-line hexagram with changing lines (atomic weights).

### Requirements
- [ ] Render all 6 lines of the hexagram (not just the hexagram number)
- [ ] Distinguish Yang (solid) vs Yin (broken) lines
- [ ] Highlight changing lines (atomic weight > threshold) in amber
- [ ] Position hexagram at (200, 110) with proper scale
- [ ] Use `data.iching.lines[]` (boolean array, 6 entries)

### Files to change
- `layers/Layer5Iching.tsx` (major rewrite)

---

## Phase 8 — PWA Offline + Share

### Goal
Full PWA compliance (F-228) and Web Share Target (F-240).

### Requirements
- [ ] Service worker caches Mandala SVG assets
- [ ] Mandala downloadable as SVG (share)
- [ ] Web Share Target accepts Mandala screenshots
- [ ] Offline fallback with cached last-known Mandala data
- [ ] `manifest.json` includes `screenshots`, `icons`, `share_target`

### Files to change
- `public/manifest.json`
- `public/sw.js` (update INVALIDATE_MANDALA handler)
- `components/akasha/MandalaChart.tsx` (add download handler)

---

## Open Questions (OQ)

| ID | Question | Status |
|----|----------|--------|
| OQ-1 | Odu glyphs: authenticated Ifá source for 16 Odu glyph paths? | Research pending |
| OQ-2 | Full sefirot tree: authoritative Cabala source for 10 sefirot + 22 paths? | Research pending |
| OQ-3 | I Ching lines: how to render changing lines vs static lines? | Design pending |
| OQ-4 | F-227 authority placement in Mandala: header or floating? | UX decision pending |
| OQ-5 | 3D toggle: isometric Mandala view vs flat only? | Feature gated |

---

## Quality Gates

| Gate | Target | Current |
|------|--------|---------|
| TypeScript errors | 0 | 0 ✅ |
| Lint errors | 0 | 0 ✅ |
| Test coverage (mandala) | >80% | ~60% |
| Lighthouse PWA | >90 | unknown |
| WCAG contrast (text) | AA | AA ✅ |
| Keyboard navigation | All layers | Partial (Phase 2 in progress) |
| Screen reader | NVDA/VoiceOver coherent | Not tested |

---

## Dependencies

- `@akasha/core` — MandalaData type, PILAR_COLORS, toXY, STARS
- `@akasha/mentor` — RAG for authority synthesis
- `stores/cockpit-store` — active layer state
- `messages/{en,pt-BR}.json` — i18n keys for all mandala labels
