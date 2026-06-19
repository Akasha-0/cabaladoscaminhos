# Mandala Phase 4 — Performance Design

**Author:** PerformanceArchitect  
**Date:** 2026-06-19  
**Status:** Design-only — no code written

---

## 1. Context

MandalaChart (268 lines, `'use client'`, `memo()`) renders a 5-layer toroidal SVG mandala. All layer components, InfoPanels, and MandalaAtmosphere (Three.js/WebGL) are statically imported at module evaluation time — meaning the entire bundle parses and executes before any user interaction occurs.

Phase 4 introduces lazy loading via `React.lazy()` + `Suspense` and a MandalaSkeleton placeholder so that interaction response is <100ms even on low-end devices.

---

## 2. Lazy-Loading Strategy

### 2.1 What to lazy-load and why

| Component | LOC | Weight | Rationale |
|---|---|---|---|
| `MandalaAtmosphere` | ~90 | **Heavy** — Three.js + Canvas + WebGL runtime | Visible immediately but purely decorative; WebGL init blocks main thread |
| `Layer4Astrology` | 171 | **Heaviest SVG layer** — 12 zodiac arcs + 12 house lines + 10 planet glyphs + particle dots + CSS rotation | Rotates continuously via CSS; only interactive on click. Static by default. |
| `AstrologyInfoPanel` | ~150 | **Heavy panel** — PlainEnglishPlanet loop, aspect list, elemental pills, grimoire embed | Only mounts when `activeLayer === 4` |
| `IchingInfoPanel` | ~60 | Light but code-split cleanly | Only mounts when `activeLayer === 5` |
| `KabalaInfoPanel` + `TantricBodyInfoPanel` | ~80 combined | Only mount when `activeLayer === 2|3` | |
| `OduInfoPanel` | ~40 | Only mounts when `activeLayer === 1` | |
| `Layer1Ancestralidade` | 90 | Static, no heavy math | Keep statically imported |
| `Layer2Kabala` | 97 | Static | Keep statically imported |
| `Layer3Tantra` | 101 | Static | Keep statically imported |
| `Layer5Iching` | 98 | Static | Keep statically imported |
| `LayerSynergyLines` | 37 | Static | Keep statically imported |
| `LayerDefs` | 28 | Tiny | Keep statically imported |
| `LayerStars` | 24 | Tiny | Keep statically imported |

### 2.2 Static vs dynamic import decision

```
Static import    → file is bundled, parsed, and executed at app boot.
                   Zero additional network cost; blocks main thread during parse.
                   Use for: tiny/always-visible components.

React.lazy(() => import('./Foo'))
                 → webpack creates a separate chunk. Chunk is fetched (network)
                   only when the parent Suspense boundary is first encountered.
                   Unneeded until interaction — the correct choice for L4 and panels.
                   Use for: interactive panels, large layers that aren't needed immediately.

Dynamic import (no React.lazy)
                 → manual import() call inside an effect or event handler.
                   Kicks off network fetch only on user action.
                   Best for: MandalaAtmosphere (Three.js) — never needed for first paint.
                   Use when you want the fetch to be user-gated, not Suspense-gated.
```

### 2.3 Proposed chunk structure

| Chunk | Contents | Fetch trigger |
|---|---|---|
| `mandala-chart.js` (main) | MandalaChart shell + L1/L2/L3/L5 + LayerDefs + LayerStars + LayerSynergyLines + hooks | Initial page load (unavoidable) |
| `mandala-atmosphere.js` | MandalaAtmosphere + all Three.js | `useEffect` on mount (non-blocking) |
| `mandala-l4.js` | Layer4Astrology + buildAstroSegments + ASTRO_SEGMENTS constant | `React.lazy` Suspense — renders immediately but fetches chunk |
| `mandala-panels.js` | All 5 InfoPanel components | `React.lazy` Suspense — all panels in one chunk (coarser, but panels are small) |

> **Rationale for one combined panels chunk:** All five panels are small (40–150 LOC each; ~400 LOC total). A single shared chunk avoids waterfall fetches when users navigate between layers. Splitting into five separate chunks would create 5 potential sequential network round-trips.

---

## 3. MandalaSkeleton Design

### 3.1 What it replaces during load

The skeleton replaces the entire `MandalaChart` output while any lazy chunk is being fetched (specifically the L4 chunk, which is on the critical-ish path for first meaningful paint).

### 3.2 Visual specification

```tsx
// MandalaSkeleton — rendered inside Suspense fallback
// Colocation: src/components/akasha/MandalaSkeleton.tsx

/**
 * Exact SVG geometry:
 *   viewBox="0 0 400 400"
 *   All positions derived from the real layers' constant radii:
 *     r=200  → outer boundary
 *     r=196  → L4 outer decorative ring
 *     r=183  → zodiac label ring
 *     r=170  → L4 inner ring
 *     r=152–168 → house line band
 *     r=145  → house number ring
 *     r=138  → L3 tantric ring
 *     r=110  → L5 dashed ring
 *     r=80   → L2 kabala triangle ring
 *     r=50/44/40/34 → L1 ancestor glow rings
 *     cx=200, cy=200 throughout
 */

/*
Skeleton elements (in render order matching real layering):
  1. Background circle   r=200, fill=rgba(11,14,28,0.6)
  2. L4 ring placeholder  r=196..183 band, faint pulsing violet shimmer
  3. L3 ring placeholder  r=138 dashed circle, teal shimmer
  4. L5 ring placeholder  r=110 dashed circle, amber shimmer
  5. L2 ring placeholder  r=80 circle, indigo shimmer
  6. L1 core placeholder   r=34 solid, amber, subtle pulse
  7. Central "loading" text  "Preparando a Mandala…" in Cinzel, #A7AECF, 0.65rem

All skeleton shapes use:
  background: rgba(white, 0.05)
  animation: skeleton-shimmer 1.8s ease-in-out infinite

CSS keyframe (add to mandala-css.ts MANDALA_STYLES):
  @keyframes skeleton-shimmer {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 0.8; }
  }
*/
```

**Dimensions:** `viewBox="0 0 400 400"`, `width="100%"`, `maxWidth={400}` — identical to the real SVG so layout doesn't shift.

**No layout shift guarantee:** The skeleton SVG is the exact same outer wrapper as the real mandala SVG. The browser paints the same containing `div.relative.w-full.max-w-[400px]` before the chunk loads, so the skeleton-to-real transition causes zero reflow.

**Animation budget:** All shimmer animations are `opacity`-only. No transform, no geometry changes. `prefers-reduced-motion` kills all shimmer and shows a static faded placeholder instead.

**A11y:** `role="status"` + `aria-label="Carregando Mandala Akáshica"` on the SVG. Skeleton is invisible to screen readers via `aria-hidden` on decorative layers, with only the status text exposed.

---

## 4. Suspense Boundary Placement

### 4.1 Boundary hierarchy

```
MandalaChart (shell — always static import)
  │
  ├── <Suspense fallback={<MandalaSkeleton />}>
  │     <LazyMandalaContent />          ← all layers + atmosphere
  │   </Suspense>
  │
  └── <Suspense fallback={null}>          ← Info panels, never show skeleton
        <InfoPanelArea />                ← conditionally renders lazy panels
      </Suspense>
```

### 4.2 What `LazyMandalaContent` contains

Extract a new component `MandalaContent.tsx`:

```tsx
// src/components/akasha/MandalaContent.tsx
'use client'

const Layer4Astrology = lazy(() => import('./layers/Layer4Astrology'))
// All other layers — static (no lazy needed, tiny)
```

The Suspense boundary wraps only `Layer4Astrology` inside `MandalaContent`. The fallback is `MandalaSkeleton`.

**Why not wrap the entire chart in one Suspense?**  
Because `MandalaSkeleton` is an SVG placeholder. If the outer shell (buttons, layout) is already visible, showing a skeleton for the whole chart when the user is just waiting for L4's rotation is worse than showing the partially-loaded chart. The L4 Suspense boundary is the tightest scope that still eliminates the blocking parse.

### 4.3 InfoPanel Suspense boundary

InfoPanels render inside a **second**, separate Suspense with `fallback={null}`. This means: when a user first clicks Layer 4, if the panels chunk hasn't loaded yet, nothing renders in the panel area (it stays blank/previous state). The panel appears instantly once the chunk arrives. No skeleton is shown for panels — only the absence of content.

```tsx
const AstrologyInfoPanel   = lazy(() => import('@/components/akasha/AstrologyInfoPanel'))
const IchingInfoPanel      = lazy(() => import('@/components/akasha/IchingInfoPanel'))
// etc.

function InfoPanelArea({ activeLayer, ... }) {
  return (
    <Suspense fallback={null}>
      {activeLayer === 4 && <AstrologyInfoPanel ... />}
      {activeLayer === 3 && <TantricBodyInfoPanel ... />}
      {activeLayer === 2 && <KabalaInfoPanel ... />}
      {activeLayer === 1 && <OduInfoPanel ... />}
      {activeLayer === 5 && <IchingInfoPanel ... />}
    </Suspense>
  )
}
```

### 4.4 MandalaAtmosphere — dynamic import (not React.lazy)

```tsx
// In MandalaChart.tsx body:
useEffect(() => {
  import('@/components/akasha/MandalaAtmosphere').then(({ MandalaAtmosphere }) => {
    setAtmosphereComponent(() => MandalaAtmosphere)
  })
}, [])
// Renders: {AtmosphereComponent && <AtmosphereComponent intensity={...} />}
```

This keeps Three.js entirely off the main thread until after the SVG layers have painted. The atmosphere has no impact on LCP.

---

## 5. React.lazy() vs Static Import Tradeoffs

| Scenario | Approach | Why |
|---|---|---|
| `Layer4Astrology` (171 LOC, continuous CSS animation) | `React.lazy` + Suspense with `MandalaSkeleton` fallback | Large chunk. Skeleton fallback preserves layout. Fetch starts as soon as component tree is evaluated, not on user action. |
| All InfoPanels (collectively ~400 LOC) | Single `React.lazy` wrapping all panels | One chunk = one network round-trip. Splitting into 5 causes sequential waterfalls when users quickly click between layers. |
| `MandalaAtmosphere` (Three.js, Canvas, WebGL) | `import()` inside `useEffect` | Truly optional — not needed for first paint. Blocks main thread during parse if statically imported. `useEffect` defers entirely. |
| `Layer1Ancestralidade` (90 LOC, CSS pulse animation) | Static import | Small, visible immediately. Lazy-loading saves ~5ms of parse time at the cost of a network round-trip — not worth it. |
| `Layer2Kabala`, `Layer3Tantra`, `Layer5Iching` | Static import | Same rationale. |

**`React.lazy` limitation:** `React.lazy` only works with default exports. All layer files already export both named (`export const LayerFoo`) and default (`export default LayerFoo`). The `lazy()` call uses the default export path.

---

## 6. Performance Targets

### 6.1 Interaction response (< 100ms)

**Definition:** Time from user click/tap on a layer button to the InfoPanel being visible (or layer highlight changing).

**Measurement approach:**

1. **Chrome DevTools Performance panel** — Record a click on "C4 · Movimento Celeste". Look for:
   - Input event timestamp
   - Next paint timestamp
   - Difference = interaction response

2. **`performance.measure()`** — Instrument `onClick` handlers:

   ```ts
   // Inside useLayerState or a thin wrapper
   const handleClick = (layer: Layer) => {
     performance.mark(`layer-click-${layer}`)
     setActiveLayer(prev => prev === layer ? null : layer)
     performance.mark(`layer-set-${layer}`)
     performance.measure(`layer-toggle-${layer}`, `layer-click-${layer}`, `layer-set-${layer}`)
   }
   ```

3. **Web Vitals:** `INP` (Interaction to Next Paint) in the Chrome extension captures this automatically.

**Target breakdown:**

| Operation | Budget |
|---|---|
| JS click handler execution | < 5ms |
| State update (React re-render) | < 10ms |
| Re-paint of SVG layer opacity | < 20ms |
| **InfoPanel chunk fetch (if cold)** | < 60ms |
| InfoPanel first paint | < 5ms |
| **Total** | **< 100ms** |

If the panels chunk is **warm** (already fetched from a prior interaction), the InfoPanel appears in < 15ms (pure JS + paint).

### 6.2 Bundle size targets

| Chunk | Current (static) | Target (lazy) | Delta |
|---|---|---|---|
| `mandala-chart.js` (main) | ~280 KB (est.) | ~210 KB | −70 KB |
| `mandala-atmosphere.js` | 0 (in main) | ~120 KB (Three.js) | deferred |
| `mandala-l4.js` | 0 (in main) | ~15 KB | fetched async |
| `mandala-panels.js` | 0 (in main) | ~18 KB | fetched async |

**Main bundle reduction: ~70 KB** — approximately 25% of the interactive mandala bundle eliminated from the critical path.

### 6.3 LCP note

The mandala SVG's `viewBox` and static background gradient (`#bgGrad`) paint as pure HTML/CSS immediately. The LCP element is the dark radial gradient circle at `cx=200 cy=200`. This paints in < 50ms on any device. The lazy loading does **not** affect LCP.

---

## 7. Code Change Plan

### Files to CREATE

| File | Purpose |
|---|---|
| `src/components/akasha/MandalaSkeleton.tsx` | SVG skeleton matching MandalaChart layout |
| `src/components/akasha/MandalaContent.tsx` | Shell component holding all layers; wraps L4 in Suspense |
| `src/components/akasha/InfoPanelArea.tsx` | Conditionally renders lazy-loaded InfoPanels inside Suspense |
| `docs/MANDALA-PHASE4-PERFORMANCE.md` | This document |

### Files to MODIFY

| File | Change |
|---|---|
| `src/components/akasha/MandalaChart.tsx` | Import `MandalaContent` and `InfoPanelArea` instead of individual layers; add `useEffect` for atmosphere dynamic import; remove static imports of lazy components |
| `src/components/akasha/layers/mandala-css.ts` | Add `skeleton-shimmer` keyframe to `MANDALA_STYLES` |
| `src/components/akasha/layers/Layer4Astrology.tsx` | No change — already extracted; just becomes lazy |
| `src/components/akasha/AstrologyInfoPanel.tsx` | No change — already extracted; just becomes lazy |
| `src/components/akasha/IchingInfoPanel.tsx` | No change |
| `src/components/akasha/MandalaInfoPanels.tsx` | No change |
| `src/components/akasha/OduInfoPanel.tsx` | No change |
| `src/app/[locale]/(akasha)/mandala/page.tsx` | No change — server component; MandalaChart is the integration boundary |

### Modification sequence

1. Create `MandalaSkeleton.tsx` — no risk, purely additive
2. Create `MandalaContent.tsx` — defines the Suspense boundary; `MandalaChart` is unchanged until this is wired
3. Modify `MandalaChart.tsx` to import and render `MandalaContent` instead of layer imports; add atmosphere `useEffect`
4. Create `InfoPanelArea.tsx` — second Suspense boundary
5. Modify `MandalaChart.tsx` to render `InfoPanelArea` in place of the existing panel conditional block
6. Add `skeleton-shimmer` to `MANDALA_STYLES`

---

## 8. Verification Criteria

### VC-1: No regression in visual output
- [ ] All 5 layers render identically before and after changes (snapshot test or manual cross-reference)
- [ ] Layer opacity state (active/hovered/null) works as before
- [ ] CSS animations (ring-rotate, mandala-pulse, twinkle) unchanged
- [ ] `prefers-reduced-motion` still disables all animations

### VC-2: Suspense + Skeleton
- [ ] On first mandala page visit, `MandalaSkeleton` renders instantly (SVG visible in <50ms)
- [ ] `MandalaSkeleton` uses exact same `viewBox="0 0 400 400"` and outer container as real mandala — zero layout shift
- [ ] After L4 chunk loads, `MandalaSkeleton` unmounts and real L4 layer appears
- [ ] `MandalaAtmosphere` (Three.js) does not appear in Network tab until after SVG first paint

### VC-3: InfoPanel lazy loading
- [ ] First click on Layer 4 triggers fetch of panels chunk (visible in Network tab)
- [ ] Subsequent clicks on any layer use warm cache — zero network requests
- [ ] Panel area is blank (not skeleton) while chunk loads — `fallback={null}` confirmed

### VC-4: Interaction response < 100ms
- [ ] `performance.measure` on layer toggle shows < 100ms from click to paint (warm cache)
- [ ] INP measurement via Chrome Web Vitals extension shows < 100ms for layer toggle
- [ ] No janky/stuttering during L4 CSS ring rotation

### VC-5: Bundle size
- [ ] `mandala-chart.js` main chunk reduced by ≥ 60 KB (gzipped) vs baseline
- [ ] `Three.js` / atmosphere code does not appear in main chunk bundle analysis
- [ ] L4 and panels each load as separate chunks (confirmed via `next build` output or webpack bundle analyzer)

### VC-6: Accessibility
- [ ] `MandalaSkeleton` has `role="status"` and meaningful `aria-label`
- [ ] All layer buttons retain `aria-pressed` state
- [ ] InfoPanel content reachable via keyboard (Tab through layer buttons, Enter to activate)
- [ ] Screen reader announces layer name on focus/activation

---

## Appendix A: Architecture Diagram

```
Server Component (mandala/page.tsx)
  │
  └─ MandalaChart (client shell, static import)
        │
        ├─ <MandalaSkeleton />            ← Suspense fallback (immediate)
        │
        ├─ <Suspense fallback={<MandalaSkeleton />}>
        │     MandalaContent
        │       ├─ MandalaAtmosphere      ← useEffect dynamic import (Three.js)
        │       ├─ <svg viewBox="0 0 400 400">
        │       │     ├─ LayerDefs (static)
        │       │     ├─ LayerStars (static)
        │       │     ├─ Layer5Iching (static)
        │       │     ├─ Layer4Astrology  ← React.lazy chunk
        │       │     ├─ Layer3Tantra (static)
        │       │     ├─ LayerSynergyLines (static)
        │       │     ├─ Layer2Kabala (static)
        │       │     └─ Layer1Ancestralidade (static)
        │       └─ </svg>
        │
        └─ <Suspense fallback={null}>
              InfoPanelArea
                ├─ AstrologyInfoPanel     ← lazy (same chunk as all panels)
                ├─ TantricBodyInfoPanel   ← lazy
                ├─ KabalaInfoPanel        ← lazy
                ├─ OduInfoPanel           ← lazy
                └─ IchingInfoPanel        ← lazy
```

---

## Appendix B: Key Constants (from mandala-geometry.ts)

```
SVG viewBox:        0 0 400 400
Center:             cx=200, cy=200
Outer boundary:     r=200
L4 zodiac band:     r=183
L4 house lines:     r=152–168
L3 tantric ring:    r=138
L5 dashed ring:     r=110
L2 kabala ring:     r=80
L1 glow rings:      r=50, 44, 40, 34
Layer colors:
  L1 #F0B429  L2 #5C7CFF  L3 #2DD4BF  L4 #7C5CFF  L5 #A0763A
```
