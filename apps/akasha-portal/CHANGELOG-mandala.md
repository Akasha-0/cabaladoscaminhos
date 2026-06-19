# Changelog — Mandala Evolution Phases 1–4

All notable changes to the Mandala visualization system in this evolution cycle.

## [Unreleased] — Phase 1–4 Evolution

### Phase 1 — Layer Extraction

- **New file**: `src/components/akasha/layers/LayerStars.tsx` (24 lines)
  - 30 background star circles with CSS nth-child stagger stagger
  - Uses `STARS` from `mandala-geometry`
  - CSS class `star-twinkle` from `mandala-animations.css`

- **New file**: `src/components/akasha/layers/LayerSynergyLines.tsx` (37 lines)
  - Toroidal synergy lines from each TantricNode to center (200, 200)
  - Dash-flow animation via CSS classes (`synergy-active` / `synergy-alert`)
  - `nth-child` stagger for `animationDelay` handled by `mandala-animations.css`

- **New file**: `src/components/akasha/layers/Layer4Astrology.tsx` (196 lines)
  - Zodiac ring (12 arcs + symbols), 12 house lines + numbers
  - Planet glyphs with `aria-label` for accessibility
  - RAF-driven rotation with `prefers-reduced-motion` support
  - Props: `data`, `planetDots`, `tooltipByLayer`, `opacity`, `onLayerToggle`, `onLayerHover`, `ringPaused`, `reducedMotion`

### Phase 1 — Hook Extraction

- **New file**: `src/components/akasha/hooks/useReducedMotion.ts` (14 lines)
  - `useReducedMotion()` hook returning `boolean`
  - Listens to `matchMedia('(prefers-reduced-motion: reduce)')`
  - Updates on change via `MediaQueryList.addEventListener`

- **New file**: `src/components/akasha/hooks/useMandalaData.ts` (20 lines)
  - `useMandalaData(data: MandalaData)` hook
  - Consolidates all SVG derivations: `tooltipByLayer`, `planetDots`, `tantricNodes`, `kabVerts`, `trianglePath`, `elem`, `inactiveBodies`, `lpMeaning`, `elemGuidance`
  - All memoized with `useMemo` for performance

### Phase 2 — PWA & Performance

- PWA cache strategy for `/api/akasha/mandala`:
  - `Cache-Control: private, max-age=0, stale-while-revalidate=86400`
  - Allows SSR fresh data while caching for 24h background revalidation
- CSS animations extracted to `src/styles/mandala-animations.css` (179 lines)
  - `@keyframes pulse-ori`, `ring-rotate`, `dash-flow`, `twinkle`, `particle-blink`
  - `.mandala-pulse`, `.mandala-pulse-2`, `.mandala-pulse-3`
  - `.ring-astrological`, `.ring-astrological-paused`
  - `.synergy-active`, `.synergy-alert`
  - `.star-twinkle`, `.particle-blink`

### Phase 2 — Accessibility (WCAG 2.5.5)

- Touch targets: all layer toggle buttons meet 44×44px minimum (WCAG 2.5.5)
- Color contrast: `text-shadow` added to L1 gold (#FFD700) and L5 amber (#FF9500) layer labels for AA contrast on dark background
- Keyboard navigation: `tabIndex`, `role="button"`, `onKeyDown` added to all SVG layer `<g>` elements (Layers 1–5)
- `aria-live="polite"` region announces layer changes for screen readers
- Planet glyphs: `role="img"` + descriptive `aria-label` with planet name, sign, house, retrograde status
- Native SVG `<title>` elements provide WCAG-compliant tooltips on hover and keyboard focus via `aria-label`

### Phase 3 — MandalaContext + F-227 Authority (Session)

- **New file**: `src/lib/application/akasha/mandala-context.tsx`
  - `MandalaProvider` component wrapping `InnerMandalaChart`
  - `MandalaContextValue` interface: layer state (activeLayer, hoveredLayer, ringPaused, opacity setters) + Akasha synthesis + F-227 authority
  - `useMandalaContext()` hook consuming context for all layer state
  - AkashaAuthorityPrompt rendered when authority is non-null

- **Refactor**: `MandalaChart.tsx` restructured into two-component pattern
  - Outer `MandalaChart` wraps JSX with `<MandalaProvider>`
  - `InnerMandalaChart` consumes `useMandalaContext()` for all layer state
  - `pilares` built from MandalaData and cast through `unknown` to `Partial<PilaresDados>` (field names differ: `lifePath` vs `life_path`)

- **Fix**: `Layer2Kabala.tsx` `Layer2Props` interface restored `data: MandalaData` prop
  - Previously corrupted by bad edit (duplicate function body, missing prop in interface)
  - Layer2Kabala receives `data` prop but destructures as `_data` (unused in current render — reserved for Phase 4 Sefirot expansion)

- **Named types**: `AtmosphereIntensity`, `MandalaDerivedData` exported from `useMandalaData.ts`
  - Replaces `ReturnType<typeof ...>` patterns per project rules

### Phase 4 — Synthesis, i18n & Authority

- Unified data flow: `synthesis-engine` → `/api/akasha/mandala` → `MandalaChart` via `MandalaData` interface
- **New i18n keys** (49+ mandala keys added in `pt-BR` and `en`):
  - `mandala.*` namespace keys for layer labels, tooltips, info panels
  - Narrative labels for Kabbalah, Tantra, Astrology, I-Ching, and Odù layers
- F-227: `AkashaAuthorityPrompt` integrated into mandala page
  - Renders when `temSynthesis && authority && data.synthesis?.oneProfile`
  - Derives `PilaresParciais` from `data.kabala.lifePath` for authority computation
- `mandala/page.tsx` (467 lines):
  - Server component with auth guard (`verifyAkashaToken`)
  - `buildAuthorityPilares()` helper converts `MandalaData` → `Partial<PilaresDados>`
  - Full 5-pilar authority block rendering
  - "Saudação" time-based greeting (Bom despertar / Boa tarde / Boa noite)

### Technical Notes

- `MandalaChart.tsx` (754 lines): `MandalaData` interface exported for use by layer components and hooks
- `buildTooltipByLayer(data)` provides curated F-206 tooltip text for native `<title>` hover
- `buildAstroSegments()` computed once at module load (no recomputation per render)
- `ringPaused` derived from `activeLayer === 4` to pause zodiac ring rotation when Layer 4 is selected
