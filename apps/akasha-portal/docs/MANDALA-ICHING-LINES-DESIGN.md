# Mandala Phase 7 — I Ching Hexagram 6-Line SVG Rendering

**Status**: Design Document  
**Phase**: Phase 7 — Layer 5 Full Hexagram Glyph  
**Author**: IChingArchitect  
**Date**: 2026-06-19  
**Target**: `src/components/akasha/layers/Layer5Iching.tsx` and related data-flow files

---

## 1. Summary

Render the full I Ching hexagram glyph (6 lines, King Wen convention) as SVG directly in `Layer5Iching.tsx`, replacing the current single-circle placeholder at `(200, 110)`. Each line is drawn individually: solid stroke for Yang, two-segment broken stroke for Yin. Lines whose "atomic weight" (derived deterministically from the birth moment) exceeds the `CHANGING_LINE_THRESHOLD = 0.65` are highlighted with amber coloring and a small triangle indicator.

Two new fields are added to `MandalaData.iching`: `atomicWeights: number[]` (one weight per line, 0–1) and `changingLines: number[]` (0-indexed positions above threshold). These flow from the natal computation through the API route and into the component as props.

---

## 2. Current State

### 2.1 Layer5Iching.tsx (existing)

```tsx
// Key excerpt — single circle placeholder at (200, 110)
<g>
  <circle cx="200" cy="110" r="20" fill="rgba(160,118,58,0.12)" />
  <circle cx="200" cy="110" r="13" fill={available ? '#A0763A' : 'rgba(160,118,58,0.35)'} />
  <text x="200" y="110" ...>{hexagramNumber ?? '?'}</text>
  <text x="200" y="86">MUTAÇÃO DO CAMINHO</text>
</g>
```

The existing code renders a solid filled circle with the hexagram number inside — **no line glyph is drawn**.

### 2.2 Current Data Shape (`MandalaData.iching`)

```typescript
// src/components/akasha/MandalaChart.tsx
iching: {
  hexagramNumber: number | null;
  hexagramName: string | null;
  hexagramChineseName: string | null;
  upperTrigram: number | null;
  lowerTrigram: number | null;
  upperTrigramName: string | null;
  lowerTrigramName: string | null;
  lines: boolean[];           // boolean[6], index 0 = bottom, true = Yang
  algorithm: string | null;
  provisional: boolean;
  birthDate: string | null;   // 'YYYY-MM-DD'
  birthTime: string | null;    // 'HH:MM'
  available: boolean;
  error: string | null;
}
```

`lines` is `boolean[]` (6 elements, from `@akasha/core-iching`). Index 0 = line 1 (bottom, rising), index 5 = line 6 (top). `true` = Yang (solid `—`), `false` = Yin (broken `— —`).

**No `changingLines` or `atomicWeights` field exists.**

### 2.3 Data Flow

```
natal.ts buildIchingMap()
  └─► IChingMap.lines: boolean[6]
        └─► /api/akasha/mandala route
              └─► MandalaData.iching.lines: boolean[]
                    └─► Layer5Iching (props)
```

---

## 3. SVG Line Rendering

### 3.1 Coordinate System

SVG viewBox is `0 0 400 400` with origin top-left. The hexagram glyph is centered at `(200, 110)`.

### 3.2 Line Geometry Constants

| Constant | Value | Purpose |
|---|---|---|
| `CX` | `200` | Horizontal center |
| `CY` | `110` | Vertical center of glyph |
| `LINE_W` | `36` | Full width of one hexagram line |
| `LINE_H` | `4` | Stroke thickness (Yang and Yin segments) |
| `GAP_H` | `8` | Gap height between lines |
| `STEP` | `12` | `LINE_H + GAP_H` — vertical distance per line |
| `YIN_GAP` | `14` | Horizontal gap inside a Yin line (center gap) |

```
Total glyph height: 6 * LINE_H + 5 * GAP_H = 6*4 + 5*8 = 24 + 40 = 64 px
Glyph vertical range: CY ± 32  →  y = 78 (top) to y = 142 (bottom)
```

### 3.3 Line Y Positions

Line `i` (0 = bottom, 5 = top):

```
y(i) = CY + 30 − i * STEP
     = 110 + 30 − i * 12

i=0 (line 1, bottom): y = 130
i=1 (line 2):          y = 118
i=2 (line 3):          y = 106
i=3 (line 4):          y = 94
i=4 (line 5):          y = 82
i=5 (line 6, top):     y = 70
```

### 3.4 Yang Line SVG Path

**`true` at `lines[i]`** — solid horizontal stroke.

```
<line
  x1={CX − LINE_W/2}  y1={y(i)}
  x2={CX + LINE_W/2}  y2={y(i)}
  stroke={color}
  stroke-width={LINE_H}
  stroke-linecap="butt"
/>
```

Rendered as:
- `x1=182, x2=218` (full width = 36px centered at 200)
- `stroke-linecap="butt"` (sharp, no rounded ends — correct for I Ching glyphs)

### 3.5 Yin Line SVG Path

**`false` at `lines[i]`** — two horizontal segments with center gap.

```
<!-- Left segment -->
<line
  x1={CX − LINE_W/2}  y1={y(i)}
  x2={CX − YIN_GAP/2} y2={y(i)}
  stroke={color}
  stroke-width={LINE_H}
  stroke-linecap="butt"
/>
<!-- Right segment -->
<line
  x1={CX + YIN_GAP/2}  y1={y(i)}
  x2={CX + LINE_W/2}  y2={y(i)}
  stroke={color}
  stroke-width={LINE_H}
  stroke-linecap="butt"
/>
```

Rendered as:
- Left: `x1=182, x2=193` (gap center at 200, YIN_GAP=14 → half-gap=7 → 200−7=193)
- Right: `x1=207, x2=218`

### 3.6 Normal Line Colors

| State | Stroke | Reason |
|---|---|---|
| Default Yang | `#F4F5FF` (bright white) | Strong yang energy |
| Default Yin | `#C4A55A` (muted amber) | Subtle yin energy |

### 3.7 Changing Line Highlight

A line is "changing" when its atomic weight exceeds the threshold:

```
changingLines = atomicWeights
  .map((w, i) => w > CHANGING_LINE_THRESHOLD ? i : -1)
  .filter(i => i >= 0)

CHANGING_LINE_THRESHOLD = 0.65
```

Changing line visual treatment:

| Element | Value | Purpose |
|---|---|---|
| Stroke color | `#FFD700` (gold) | High-visibility highlight |
| Glow filter | `url(#glow-iching-changing)` | Amber outer glow |
| Small triangle indicator | `<polygon points="200,y−10 196,y−4 204,y−4" />` | Marks changing line above |

The glow filter is defined in `LayerDefs.tsx` (or added there):

```xml
<filter id="glow-iching-changing" x="-50%" y="-50%" width="200%" height="200%">
  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
  <feFlood flood-color="#FFD700" flood-opacity="0.8" result="color" />
  <feComposite in="color" in2="blur" operator="in" result="glow" />
  <feMerge>
    <feMergeNode in="glow" />
    <feMergeNode in="SourceGraphic" />
  </feMerge>
</filter>
```

**Animated pulse** (when `reducedMotion` is false): changing lines pulse opacity 0.8→1.0 with 2s period via CSS class `.iching-changing-pulse`.

---

## 4. Atomic Weights — Computation

### 4.1 Rationale

Traditional I Ching changing lines are determined by random (coins/yarrow). A natal hexagram is deterministic — the "changing lines" must be derived consistently from the birth moment. The **atomic weight** of a line encodes how "active" or " volatile" that position is for the individual, based on their birth timestamp.

### 4.2 Algorithm

Weights are derived from year, month, day, and hour using position-dependent modular arithmetic and sine modulation. The formula ensures each of the 6 lines gets a distinct, stable weight 0–1.

```
W(birthDate, birthTime, lineIndex) ∈ [0, 1]

// Parse birth date
year  = parseInt(birthDate.substring(0, 4))   // YYYY
month = parseInt(birthDate.substring(5, 7))  // MM
day   = parseInt(birthDate.substring(8, 10)) // DD
hour  = parseInt(birthTime?.substring(0, 2) ?? '12')  // HH or 12 if absent

// Six-component weight vector — each line gets a distinct modulation
BASE[i]    = (year % 8)       // stability component
MOD_A[i]   = (month % 7) + 1  // lunar phase modulation
MOD_B[i]   = (day % 6) + 1    // solar day modulation
MOD_C[i]   = (hour % 5) + 1   // diurnal modulation

weight[i] = |sin( BASE[i] × MOD_A[i] × (lineIndex + 1)
              + MOD_B[i] × 0.7
              + MOD_C[i] × 0.3 )|
           ∈ [0, 1]
```

**Equivalently, simplified implementation:**

```typescript
function computeAtomicWeights(
  birthDate: string | null,  // 'YYYY-MM-DD'
  birthTime: string | null,  // 'HH:MM'
  hexagramNumber: number | null
): number[] {
  if (!birthDate || !hexagramNumber) {
    return [0.5, 0.5, 0.5, 0.5, 0.5, 0.5]; // neutral fallback
  }
  const year  = parseInt(birthDate.substring(0, 4));
  const month = parseInt(birthDate.substring(5, 7));
  const day   = parseInt(birthDate.substring(8, 10));
  const hour  = birthTime ? parseInt(birthTime.substring(0, 2)) : 12;

  const base = year % 8;
  const modA = (month % 7) + 1;
  const modB = (day % 6) + 1;
  const modC = (hour % 5) + 1;

  return Array.from({ length: 6 }, (_, i) => {
    const raw = Math.sin(
      base * modA * (i + 1) * 0.4
      + modB * 0.7
      + modC * 0.3
    );
    return Math.abs(raw); // 0..1
  });
}
```

### 4.3 Threshold

```
CHANGING_LINE_THRESHOLD = 0.65
changingLines = atomicWeights
  .map((w, i) => w > 0.65 ? i : -1)
  .filter(i => i !== -1)
```

Typical result: 1–2 changing lines (out of 6). If `birthTime` is absent (`provisional: true`), all weights revert to `0.5` (no changing lines — the hexagram is shown but not marked as transforming).

---

## 5. Breaking Changes

### 5.1 Type Changes

#### `src/components/akasha/MandalaChart.tsx` — `MandalaData.iching`

Add two fields:

```typescript
iching: {
  // ... existing fields ...
  lines: boolean[];
  /** Per-line atomic weight 0..1, derived from birth timestamp. */
  atomicWeights: number[];
  /** 0-indexed line positions where atomicWeights[i] > 0.65. */
  changingLines: number[];
  // ...
}
```

#### `node_modules/@akasha/core-iching/src/types.ts` — `IChingMap`

```typescript
export interface IChingMap {
  // ... existing fields ...
  /** Per-line atomic weight 0..1. */
  atomicWeights?: number[];
  /** Computed changing lines (0-indexed). Derived, not stored. */
  changingLines?: number[];
}
```

**Note**: Marked `?:` (optional) to maintain backward compatibility with existing stored maps.

### 5.2 Data Flow Changes

| File | Change |
|---|---|
| `node_modules/@akasha/core-iching/src/natal.ts` | Add `computeAtomicWeights()` export; call it in `buildIchingMap()`; append `atomicWeights` to returned `IChingMap` |
| `src/app/api/akasha/mandala/route.ts` | Map `ichingMap.atomicWeights ?? []` to `data.iching.atomicWeights`; compute `changingLines` inline (derived, not stored) |
| `src/components/akasha/MandalaChart.tsx` | Add `atomicWeights: number[]` and `changingLines: number[]` to `MandalaData.iching` interface |
| `src/components/akasha/layers/Layer5Iching.tsx` | Add `atomicWeights` and `changingLines` to props; render 6-line SVG glyph |

### 5.3 Backward Compatibility

- If `atomicWeights` is absent (null/empty), render all lines in default colors with no highlight — no changing lines shown.
- `provisional: true` (no birth time) → all weights = 0.5 → no changing lines.
- Existing API consumers that don't read the new fields are unaffected.

---

## 6. Implementation Plan

### Phase 7A — Data Layer (prerequisite for rendering)

**Owner**: DataFlowTeam.l5  
**Files**: `natal.ts`, `route.ts`, `MandalaChart.tsx`

1. **`node_modules/@akasha/core-iching/src/natal.ts`**
   - Add `computeAtomicWeights(birthDate, birthTime, hexagramNumber): number[]` function
   - In `buildIchingMap()`, append `atomicWeights` to the returned `IChingMap`
   - Re-export `computeAtomicWeights` from `index.ts`

2. **`src/app/api/akasha/mandala/route.ts`**
   - Add `atomicWeights` field to the `iching` object: `ichingMap?.atomicWeights ?? []`
   - Inline computation of `changingLines: number[]` from `atomicWeights`
     ```typescript
     const CHANGING_THRESHOLD = 0.65;
     const atomicWeights: number[] = ichingMap?.atomicWeights ?? [];
     const changingLines: number[] = atomicWeights
       .map((w, i) => w > CHANGING_THRESHOLD ? i : -1)
       .filter(i => i >= 0);
     ```

3. **`src/components/akasha/MandalaChart.tsx`**
   - Add `atomicWeights: number[]` and `changingLines: number[]` to the `MandalaData.iching` interface
   - Verify the type is correctly propagated through `useMandalaData(data)` hook

### Phase 7B — Layer 5 Rendering

**Owner**: VisualLayerTeam.layer5  
**File**: `src/components/akasha/layers/Layer5Iching.tsx`

4. **Add props** — extend the component interface:
   ```typescript
   interface Layer5Props {
     data: MandalaData;
     tooltipByLayer: Record<Layer, string>;
     opacity: (layer: Layer) => number;
     onLayerToggle: (layer: Layer) => void;
     onLayerHover: (layer: Layer | null) => void;
     // New Phase 7:
     reducedMotion?: boolean; // forwarded from MandalaChart
   }
   ```

5. **Add constants block** (module-level):
   ```typescript
   const CX = 200;
   const CY = 110;
   const LINE_W = 36;
   const LINE_H = 4;
   const GAP_H = 8;
   const STEP = LINE_H + GAP_H; // 12
   const YIN_GAP = 14;
   const CHANGING_THRESHOLD = 0.65;

   const COLOR_YANG = '#F4F5FF';
   const COLOR_YIN  = '#C4A55A';
   const COLOR_CHG  = '#FFD700';

   function lineY(i: number) {
     return CY + 30 - i * STEP;
   }
   ```

6. **Add changing-line computation** (inside component):
   ```typescript
   const atomicWeights = data.iching.atomicWeights ?? [];
   const changingLines = atomicWeights
     .map((w, i) => w > CHANGING_THRESHOLD ? i : -1)
     .filter((i) => i >= 0);
   const isChanging = (i: number) => changingLines.includes(i);
   ```

7. **Render hexagram lines** inside the existing `<g>`:
   ```tsx
   {/* Hexagram glyph — 6 lines, bottom to top */}
   {data.iching.available && data.iching.lines.length === 6 && (
     <g aria-label={`Hexagrama ${data.iching.hexagramNumber} — ${data.iching.lines.map(l => l ? 'Yang' : 'Yin').join(', ')}`}>
       {data.iching.lines.map((isYang, i) => {
         const y = lineY(i);
         const changing = isChanging(i);
         const color = changing ? COLOR_CHG : (isYang ? COLOR_YANG : COLOR_YIN);
         const filter = changing ? 'url(#glow-iching-changing)' : undefined;
         return (
           <g key={i}>
             {isYang ? (
               <line x1={CX - LINE_W/2} y1={y} x2={CX + LINE_W/2} y2={y}
                 stroke={color} strokeWidth={LINE_H}
                 strokeLinecap="butt" filter={filter}
                 className={!reducedMotion && changing ? 'iching-changing-pulse' : undefined}
               />
             ) : (
               <>
                 <line x1={CX - LINE_W/2} y1={y} x2={CX - YIN_GAP/2} y2={y}
                   stroke={color} strokeWidth={LINE_H}
                   strokeLinecap="butt" filter={filter}
                   className={!reducedMotion && changing ? 'iching-changing-pulse' : undefined}
                 />
                 <line x1={CX + YIN_GAP/2} y1={y} x2={CX + LINE_W/2} y2={y}
                   stroke={color} strokeWidth={LINE_H}
                   strokeLinecap="butt" filter={filter}
                 />
               </>
             )}
             {/* Changing line indicator — small triangle above the line */}
             {changing && (
               <polygon
                 points={`${CX},${y - 9} ${CX - 4},${y - 4} ${CX + 4},${y - 4}`}
                 fill={COLOR_CHG}
                 aria-hidden="true"
               />
             )}
           </g>
         );
       })}
     </g>
   )}
   ```

8. **Update label position**: Move "MUTAÇÃO DO CAMINHO" text from `y=86` to `y=62` (above the top line at y=70) to prevent overlap:
   ```tsx
   <text x="200" y="62" ...>MUTAÇÃO DO CAMINHO</text>
   ```

9. **Add CSS animation** to `src/styles/mandala-animations.css`:
   ```css
   @keyframes iching-changing-pulse {
     0%, 100% { opacity: 0.75; }
     50%       { opacity: 1.0; }
   }
   .iching-changing-pulse {
     animation: iching-changing-pulse 2s ease-in-out infinite;
   }
   ```

### Phase 7C — Glow Filter

**Owner**: VisualLayerTeam  
**File**: `src/components/akasha/layers/LayerDefs.tsx`

10. Add the `glow-iching-changing` filter to `<LayerDefs />`:
    ```tsx
    <filter id="glow-iching-changing" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
      <feFlood floodColor="#FFD700" floodOpacity="0.85" result="color" />
      <feComposite in="color" in2="blur" operator="in" result="glow" />
      <feMerge>
        <feMergeNode in="glow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    ```

---

## 7. Accessibility

- `aria-label` on the `<g>` container: `"Hexagrama 27 — Yang, Yang, Yin, Yin, Yang, Yin"` (human-readable line sequence)
- Changing line triangles: `aria-hidden="true"` (decorative indicators)
- Color alone does not convey meaning — the glyph geometry (solid vs. broken) is the primary differentiator
- Changing lines also have a geometric indicator (triangle) for deuteranopia/protanopia safety
- All interactive behaviors (click, hover) preserved from Phase 1

---

## 8. Verification Criteria

| # | Criterion | Test |
|---|---|---|
| V1 | Hexagram 1 (☰ / 43 in King Wen) renders 6 solid Yang lines | Visual check: all 6 `<line>` elements, no gaps |
| V2 | Hexagram 2 (☷ / 44 in King Wen) renders 6 broken Yin lines | Visual check: 12 `<line>` elements (2 per position) |
| V3 | Hexagram with mixed lines renders correct Yang/Yin pattern | Compare glyph to `IchingInfoPanel` text glyph (`———` vs `— — —`) |
| V4 | Changing lines appear in gold (`#FFD700`) | Set breakpoint; verify gold stroke |
| V5 | Changing line triangle indicator renders above highlighted line | Visual check |
| V6 | Gold glow filter applied to changing lines | Visual check with CSS filter |
| V7 | `reducedMotion: true` suppresses pulse animation | Unit test: verify no `iching-changing-pulse` class applied |
| V8 | `provisional: true` → no changing lines highlighted | Verify all lines render in default colors |
| V9 | `atomicWeights` absent → no crash, no highlights | Unit test: empty/missing `atomicWeights` |
| V10 | `data.iching.lines.length !== 6` → glyph not rendered | Guard: `{data.iching.available && data.iching.lines.length === 6 && (<g>...</g>)}` |
| V11 | Hexagram number and label still visible | Text elements unchanged |
| V12 | TypeScript: no `any` in new code paths | Strict typing throughout |

---

## 9. Edge Cases

| Case | Behavior |
|---|---|
| `lines` is empty or not length-6 | Glyph not rendered; number/name still shown |
| `atomicWeights` is empty or absent | No changing lines highlighted; normal colors |
| All 6 lines changing (weight > 0.65) | All 6 rendered gold with indicators; acceptable |
| `birthTime` absent (`provisional: true`) | All atomic weights = 0.5; no changing lines |
| `hexagramNumber` null | `data.iching.available = false`; glyph not rendered |
| `reducedMotion = true` | Pulse animation suppressed; glow filter still applied |

---

## 10. Files to Modify

| File | Change Type |
|---|---|
| `node_modules/@akasha/core-iching/src/natal.ts` | Add `computeAtomicWeights()` and return field |
| `node_modules/@akasha/core-iching/src/types.ts` | Add optional `atomicWeights?: number[]` to `IChingMap` |
| `node_modules/@akasha/core-iching/src/index.ts` | Re-export `computeAtomicWeights` |
| `src/app/api/akasha/mandala/route.ts` | Pass `atomicWeights`; compute `changingLines` |
| `src/components/akasha/MandalaChart.tsx` | Extend `MandalaData.iching` interface |
| `src/components/akasha/layers/LayerDefs.tsx` | Add `glow-iching-changing` filter |
| `src/components/akasha/layers/Layer5Iching.tsx` | Full 6-line SVG rendering |
| `src/styles/mandala-animations.css` | Add `.iching-changing-pulse` keyframe and class |

> **Note**: Patching `node_modules/` files is acceptable for `core-iching` since it is an internal workspace package. Changes should be propagated to the canonical source in `packages/core-iching/` at next opportunity.
