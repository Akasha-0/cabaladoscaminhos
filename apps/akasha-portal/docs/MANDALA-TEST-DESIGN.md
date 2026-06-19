# Mandala Phase 2–5 Test Design

**Date**: 2026-06-19
**Status**: Design — implementation pending
**Phase scope**: Phase 2 (Keyboard Nav), Phase 3 (MandalaContext), Phase 4 (Suspense + Lazy), Phase 5 (Odu Glyphs)
**Test runner**: Vitest (`pnpm test:run`)
**Environment**: `jsdom` for all component/hook tests; `node` for pure unit tests
**Vitest project**: `core-ui` (components, hooks, `src/components/**/hooks/**/*.test.ts`)

---

## 1. Test File Structure

All test files live in `tests/components/akasha/`, mirroring the component directory layout.
`tests/setup.ts` is loaded globally (provides `@testing-library/jest-dom/vitest`, auto-cleanup after each test).

```
tests/components/akasha/
├── MandalaChart.test.tsx          ← existing: smoke tests for render + data handling
├── atmosphere.test.tsx            ← existing: MandalaAtmosphere with ResizeObserver mock
├── LocaleSwitcher.test.tsx        ← existing
├── diario/                        ← existing diario integration tests
│   ├── MandatoUnificado.test.tsx
│   ├── SignificadoSection.test.tsx
│   ├── AreasSection.test.tsx
│   └── RitualSection.test.tsx
├── dashboard/                    ← existing dashboard integration tests
│   └── Dashboard.test.tsx
│
│   NEW FILES (Phase 2-5):
│
├── hooks/
│   ├── useLayerState.test.ts      ← Phase 2: keyboard/hover state machine
│   ├── useMandalaData.test.ts     ← Phase 2: all derived-data branches
│   └── useReducedMotion.test.ts   ← Phase 2: matchMedia behaviour
│
├── layers/
│   ├── Layer1Ancestralidade.test.tsx   ← Phase 2: keyboard nav (L1)
│   ├── Layer2Kabala.test.tsx           ← Phase 2: keyboard nav (L2)
│   ├── Layer3Tantra.test.tsx           ← Phase 2: keyboard nav (L3)
│   ├── Layer4Astrology.test.tsx        ← Phase 2: keyboard nav (L4) + ring pause
│   └── Layer5Iching.test.tsx           ← Phase 2: keyboard nav (L5)
│
├── context/
│   └── MandalaContext.test.tsx    ← Phase 3: provider + useMandalaContext hook
│
├── Suspense/
│   ├── MandalaSkeleton.test.tsx    ← Phase 4: skeleton dimensions + a11y
│   ├── MandalaSuspense.test.tsx    ← Phase 4: Suspense boundary integration
│   └── MandalaLazyLoading.test.tsx ← Phase 4: lazy layer code-splitting
│
├── OduGlyphs/
│   └── Layer1OduGlyphs.test.tsx   ← Phase 5: glyph selection per Odu name
│
└── integration/
    ├── MandalaKeyboardFlow.test.tsx   ← Phase 2: full Tab→Enter→Esc flow
    └── MandalaPhase2to5.test.tsx     ← Phase 2-5: end-to-end integration
```

---

## 2. Phase 2 — Keyboard Navigation

**Spec reference**: `docs/MANDALA-EVOLUTION-SPEC-v2.md §Phase 2`

### 2.1 `useLayerState` Hook Tests
**File**: `tests/components/akasha/hooks/useLayerState.test.ts`

Tests the `useLayerState` hook exported from `src/components/akasha/hooks/useLayerState.ts`.

| Test case | Behaviour tested |
|-----------|-----------------|
| `activeLayer: null → set → toggle off` | Clicking same layer toggles it back to `null` |
| `activeLayer: null → set to L1` | Setting L1 sets `activeLayer === 1` |
| `ringPaused: false by default` | `ringPaused` is `false` when `activeLayer !== 4` |
| `ringPaused: true when activeLayer === 4` | Layer 4 selection pauses the zodiac ring |
| `opacity: null active → returns 1 for all` | No active layer → all layers at full opacity |
| `opacity: L2 active → returns 1 for L2, 0.3 for others` | Non-active non-hovered layers dimmed |
| `opacity: L1 active + L3 hovered → L3 returns 1, others 0.3` | Hover overrides dimming even with active |
| `handleSetHoveredLayer: null clears hover` | Hover exit restores full opacity for all non-active |
| Multiple rapid toggles don't cause stale closures | All callbacks are stable via `useCallback` |

### 2.2 `useReducedMotion` Hook Tests
**File**: `tests/components/akasha/hooks/useReducedMotion.test.ts`

| Test case | Behaviour tested |
|-----------|-----------------|
| `prefers-reduced-motion: no-match → false` | Without matchMedia support returns `false` |
| `prefers-reduced-motion: reduce → true` | When media query matches `reduce`, returns `true` |
| Respects `addEventListener` change | Re-fires callback on media query change |

**Mock strategy**: Polyfill `window.matchMedia` with `vi.fn()` returning a mock `MediaQueryList` (see `atmosphere.test.tsx` line 12 pattern).

### 2.3 `useMandalaData` Hook Tests
**File**: `tests/components/akasha/hooks/useMandalaData.test.ts`

| Test case | Behaviour tested |
|-----------|-----------------|
| `tooltipByLayer` returns 5 entries | All layers (1–5) have a non-empty string |
| `tooltipByLayer` changes when `data.odus.oduName` changes | Memoised per `data` reference |
| `planetDots` with null `absoluteLongitude` falls back to `degree` | Phase 3 backwards-compat fallback |
| `planetDots` empty `planets[]` → empty array | No crash on empty input |
| `tantricNodes` marks inactive bodies | `active: false` bodies included with flag |
| `tantricNodes` empty `bodies[]` → empty array | No crash |
| `kabVerts` with null `lifePath` → vertices have `null` value | Handles missing data |
| `inactiveBodies` filters correctly | Only bodies where `active === false` |
| `lpMeaning` null lifePath → null | Graceful null handling |
| `elemGuidance` derives from dominant element | `dominantElement()` called correctly |

### 2.4 Layer Keyboard Nav Tests (per layer)
**Files**: `tests/components/akasha/layers/Layer{N}*.test.tsx`

All 5 layers share the same test shape; only data fixtures differ.

| Test case | Behaviour tested |
|-----------|-----------------|
| `<g>` has `role="button"` | Accessibility role set |
| `<g>` has `tabIndex={0}` | Keyboard-focusable |
| `<g>` has `aria-label` | Non-empty string describing the layer |
| `onKeyDown: Enter → calls onLayerToggle` | Enter activates the layer |
| `onKeyDown: Space → calls onLayerToggle` | Space activates the layer |
| `onKeyDown: Escape → no-op` | Escape does not toggle (propagate-free) |
| `onKeyDown: other key → no-op` | Only Enter/Space activate |
| `e.preventDefault()` called on Enter/Space | Default scroll not triggered |
| Click still works alongside keyboard | Mouse interaction not broken |
| `opacity` prop controls `<g opacity>` | Visual dimming works |
| `<title>` child renders tooltip text | Native SVG hover tooltip present |

### 2.5 Full Keyboard Flow Integration
**File**: `tests/components/akasha/integration/MandalaKeyboardFlow.test.tsx`

| Test case | Behaviour tested |
|-----------|-----------------|
| `Tab` focuses layer button group first | Layer selector buttons reachable |
| `Tab` cycles through all 5 layer `<g>` elements in order | Focus order: L5 → L4 → L3 → L2 → L1 |
| `Enter` on focused layer shows correct InfoPanel | Phase 3: InfoPanel renders for that layer |
| `Esc` closes active layer | InfoPanel unmounts, `activeLayer` → `null` |
| `aria-live="polite"` region announces layer change | Screen reader announcement |
| `aria-pressed` on layer button reflects `activeLayer` state | Button state correct |
| Focus never leaves the SVG mandala (focus trap) | Tab cycles within; Shift+Tab reverses |
| Layer button `aria-pressed` correct per active state | All 5 buttons have correct `aria-pressed` |

**Mock strategy**:
- `MandalaAtmosphere` → `vi.mock(..., () => ({ MandalaAtmosphere: () => null }))` (Three.js unavailable in jsdom)
- `useReducedMotion` → `vi.mock(..., () => ({ useReducedMotion: () => false }))`
- `matchMedia` → global mock in `beforeEach`

---

## 3. Phase 3 — MandalaContext (Synthesis Integration)

**Spec reference**: `docs/MANDALA-EVOLUTION-SPEC-v2.md §Phase 3`

### 3.1 `MandalaContext` Unit Tests
**File**: `tests/components/akasha/context/MandalaContext.test.tsx`

| Test case | Behaviour tested |
|-----------|-----------------|
| `MandalaProvider` renders children | Child components receive context |
| `useMandalaContext` throws outside provider | Error thrown when consumed outside `<MandalaProvider>` |
| `useMandalaContext` returns context inside provider | No throw, correct shape returned |
| `activeLayer` updates via `setActiveLayer` | Layer state flows from `useLayerState` through context |
| `hoveredLayer` updates via `setHoveredLayer` | Hover state flows correctly |
| `ringPaused` derived from `activeLayer === 4` | Context exposes correct `ringPaused` value |
| `opacity` function works identically to `useLayerState.opacity` | Delegation is transparent |
| `synthesis` from `useAkashaSynthesis` surfaces in context | Synthesis data in context value |
| `synthesisLoading` surfaced | Loading flag from hook propagates |
| `synthesisError` surfaced | Error object from hook propagates |
| `refetchSynthesis` callable | Refetch function exposed through context |
| `authority` derived when `synthesis.dailyDecision` present | F-227 authority computed from `dailyDecision` |
| `authority` null when no `dailyDecision` | No crash when synthesis incomplete |
| Context value is stable (no unnecessary re-renders) | Memoisation via `useMemo` in provider |

### 3.2 InfoPanel + Context Integration Tests
**File**: `tests/components/akasha/context/MandalaContext.test.tsx` (extends above)

| Test case | Behaviour tested |
|-----------|-----------------|
| `AstrologyInfoPanel` renders when `activeLayer === 4` via context | Phase 3 InfoPanel shows on layer select |
| `TantricBodyInfoPanel` renders when `activeLayer === 3` via context | Layer 3 panel shows |
| `KabalaInfoPanel` renders when `activeLayer === 2` via context | Layer 2 panel shows |
| `OduInfoPanel` renders when `activeLayer === 1` via context | Layer 1 panel shows |
| `IchingInfoPanel` renders when `activeLayer === 5` via context | Layer 5 panel shows |
| No InfoPanel renders when `activeLayer === null` | Default hint message shows |
| `AkashaAuthorityPrompt` renders when `authority !== null` | F-227 prompt appears when synthesis has dailyDecision |
| `AkashaAuthorityPrompt` absent when `authority === null` | No crash when no authority data |
| Authority changes on layer 1 / layer 4 toggle | F-227 authority updates reactively |

### 3.3 `MandalaContext` Error Boundary Tests
| Test case | Behaviour tested |
|-----------|-----------------|
| `useAkashaSynthesis` error → `synthesisError` in context | Error is caught and surfaced |
| Context consumers re-render gracefully on error | No uncaught promise rejection |
| `authority` remains `null` on error | Graceful degradation |

**Mock strategy for `MandalaContext` tests**:
```ts
vi.mock('@/components/akasha/hooks/useLayerState', () => ({
  useLayerState: () => ({
    activeLayer: null, hoveredLayer: null,
    ringPaused: false,
    opacity: (l: Layer) => 1,
    setActiveLayer: vi.fn(),
    setHoveredLayer: vi.fn(),
  }),
}));

vi.mock('@/components/akasha/dashboard/hooks/useAkashaSynthesis', () => ({
  useAkashaSynthesis: ({ userId }: { userId: string }) => ({
    data: mockDailyContent,
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));
```

---

## 4. Phase 4 — Suspense + Lazy Loading

**Spec reference**: `docs/MANDALA-EVOLUTION-SPEC-v2.md §Phase 4`

### 4.1 `MandalaSkeleton` Tests
**File**: `tests/components/akasha/Suspense/MandalaSkeleton.test.tsx`

| Test case | Behaviour tested |
|-----------|-----------------|
| `viewBox` is `0 0 400 400` | Exact match to `MandalaChart` SVG dimensions |
| `width` and `height` attributes match viewBox aspect ratio | No layout shift when replaced |
| Skeleton renders as `<svg>` (not `<div>`) | No shift from SVG → SVG swap |
| All 5 layer placeholder rings are present | 5 `<circle>` placeholders at correct radii |
| `role="status"` + `aria-label` for screen reader | Accessibility on skeleton |
| No `MandalaAtmosphere` (Three.js) in skeleton | Skeleton is pure SVG/CSS |
| CSS animation class applied to placeholder rings | Visual pulsing matches chart style |
| `prefers-reduced-motion: reduce` → animation class removed | Motion-safe skeleton |

### 4.2 Suspense Boundary Integration Tests
**File**: `tests/components/akasha/Suspense/MandalaSuspense.test.tsx`

| Test case | Behaviour tested |
|-----------|-----------------|
| `<Suspense fallback={<MandalaSkeleton />}> ` renders skeleton on load | Suspense boundary activates |
| Data resolves → skeleton replaced by `MandalaChart` | No blank flash; clean swap |
| `MandalaChart` throws promise → Suspense catches + shows skeleton | Error doesn't propagate |
| Multiple concurrent Suspense children all have own boundaries | Each lazy layer independent |
| `React.Suspense` from `react` not mocked — use real Suspense | No `vi.mock('react')` |

### 4.3 Lazy Layer Code-Splitting Tests
**File**: `tests/components/akasha/Suspense/MandalaLazyLoading.test.tsx`

| Test case | Behaviour tested |
|-----------|-----------------|
| Each layer component is `React.lazy`'d | `React.lazy` used for L1–L5 imports |
| Lazy layer component loads asynchronously | `React.Suspense` needed to render |
| `React.lazy` + `Suspense` inside `MandalaChart` tree | No prop-drilling of lazy components |
| No `useEffect` used for initial data | Data flows via props, not async side-effects |
| Error thrown for missing lazy component → boundary catches | Lazy error boundary tested |
| `React.Suspense` maxDuration not set (default) | No artificial delay |

### 4.4 No Layout Shift Tests
| Test case | Behaviour tested |
|-----------|-----------------|
| Skeleton `width`/`height` === `MandalaChart` `width`/`height` | CLS = 0 at swap |
| `max-width: 460px` consistent between skeleton and chart | Container size stable |
| Font sizes and spacing identical between skeleton and real chart | No reflow after load |
| `data.incomplete: true` adds same `<text>` element as chart | Incomplete badge has same dimensions |

---

## 5. Phase 5 — Odu Glyphs Enhancement

**Spec reference**: `docs/MANDALA-EVOLUTION-SPEC-v2.md §Phase 5`

### 5.1 Layer1 Glyph Selection Tests
**File**: `tests/components/akasha/OduGlyphs/Layer1OduGlyphs.test.tsx`

| Test case | Behaviour tested |
|-----------|-----------------|
| `Ogbe` (Odu #1) → renders correct glyph SVG path | Glyph for Ogbè is known |
| `OyEkI` (Odu #2) → renders correct glyph | Second principal Odu |
| All 16 principal Odu names → each renders its own glyph | 1:1 Odu → glyph mapping |
| Unknown `oduName` → falls back to gold circle (not glyph) | Graceful degradation per spec |
| Null `oduName` → fallback circle | `oduName === null` handled |
| Odu glyph rotates with `ringPaused` state | CSS rotation class applied to glyph `<g>` |
| `ringPaused: true` → rotation animation paused | CSS `ring-astrological-paused` class |
| No invented glyph for undocumented Odu | Only 16 documented Odu glyphs used |
| `prefers-reduced-motion` → glyph static (no rotation) | Motion-safe |
| `aria-label` on glyph `<g>` describes Odu name | Screen reader gets Odu name, not generic |

### 5.2 Odu Glyph + Layer1Ancestralidade Integration
| Test case | Behaviour tested |
|-----------|-----------------|
| `Layer1Ancestralidade` receives `oduName` prop and renders glyph | Full integration |
| Glyph `<g>` has same opacity/hover/click handlers as circle it replaces | Behaviour preserved |
| `Layer1Ancestralidade` keyboard nav unchanged by glyph swap | `tabIndex`, `role`, `onKeyDown` intact |
| Empty `orixaRegency[]` → no crash, glyph still renders | Null orixa handled |

### 5.3 OduInfoPanel + Glyph Consistency
| Test case | Behaviour tested |
|-----------|-----------------|
| `OduInfoPanel` displays `oduName` matching glyph rendered in L1 | Panel and SVG agree |
| `provisional: true` → same warning shown as Phase 1 | Provisional flag unchanged |
| `preceitos` / `quizilas` arrays render same as Phase 1 | No regressions |

---

## 6. Mock Strategy

### 6.1 Global jsdom Polyfills (in `tests/setup.ts` or per-file `beforeEach`)

```ts
// ResizeObserver — used by MandalaAtmosphere (Three.js canvas)
// Already used in atmosphere.test.tsx
class ResizeObserverMock {
  observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// matchMedia — used by useReducedMotion
vi.stubGlobal('matchMedia', (query: string) => ({
  matches: query.includes('reduce'),
  media: query,
  onchange: null,
  addListener: vi.fn(), removeListener: vi.fn(),
  addEventListener: vi.fn(), removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
```

### 6.2 MandalaAtmosphere (Three.js / WebGL)
```ts
vi.mock('@/components/akasha/MandalaAtmosphere', () => ({
  __esModule: true,
  MandalaAtmosphere: () => null,
  default: () => null,
}));
```
This is the **only** acceptable mock for Three.js in jsdom. Do NOT attempt to render `MandalaAtmosphere` in jsdom tests — WebGL is unavailable.

### 6.3 `useReducedMotion`
```ts
vi.mock('@/components/akasha/hooks/useReducedMotion', () => ({
  useReducedMotion: (): boolean => false,
}));
```
Return `true` in `prefers-reduced-motion: reduce` test cases.

### 6.4 `useAkashaSynthesis` (for Phase 3 context tests)
```ts
vi.mock('@/components/akasha/dashboard/hooks/useAkashaSynthesis', () => ({
  useAkashaSynthesis: vi.fn(({ userId }: { userId: string }) => ({
    data: mockDailyContentUI,
    loading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));
```
Override `mockUseAkashaSynthesis.mockResolvedValue(...)` in async/loading test cases.

### 6.5 `next/navigation` (used by `DiarioErrorBoundary` retry)
```ts
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  usePathname: () => '/pt-BR/mandala',
  useSearchParams: () => new URLSearchParams(),
}));
```

### 6.6 i18n
```ts
vi.mock('@/lib/i18n', () => ({
  getTranslations: () => (key: string) => key,
}));
```

### 6.7 What NOT to Mock
- **`React.Suspense`** — use real Suspense in Phase 4 tests
- **`React.lazy`** — tested with real lazy loading; mock only outer data dependencies
- **`useLayerState`** — test the real hook in `useLayerState.test.ts`; mock only in integration tests
- **`MandalaData` types** — use real fixture objects matching the `MandalaData` interface
- **`MandalaChart`** itself — only mock its direct external dependencies (Atmosphere, hooks)

---

## 7. Coverage Targets

| Phase | File / area | Target | Notes |
|-------|------------|--------|-------|
| Phase 2 | `useLayerState` | 100% | 9 branches (8 from table §2.1) |
| Phase 2 | `useReducedMotion` | 100% | 3 branches |
| Phase 2 | `useMandalaData` | 95% | All memoised derivations |
| Phase 2 | Layer keyboard nav (L1–L5) | 100% on `role/tabIndex/onKeyDown` | 5 files × 9 test cases |
| Phase 2 | Keyboard flow integration | 100% on Tab/Enter/Esc logic | Full SVG focus traversal |
| Phase 3 | `MandalaContext` provider | 100% | All context value fields |
| Phase 3 | Context consumers | 90% | InfoPanel + AuthorityPrompt rendering |
| Phase 3 | Authority derivation | 100% | `authority` null/non-null branches |
| Phase 4 | `MandalaSkeleton` | 100% | Dimensions, a11y, motion |
| Phase 4 | Suspense boundary | 100% | Suspense fallback activation |
| Phase 4 | Lazy loading | 100% | `React.lazy` + `Suspense` integration |
| Phase 4 | Layout shift | 0 CLS | Skeleton ↔ chart dimension match |
| Phase 5 | Odu glyph selection | 100% on known Odu | 16 principal Odu mapped |
| Phase 5 | Fallback for unknown Odu | 100% | Graceful degradation |
| Phase 5 | Glyph + L1 integration | 90% | Hover, click, keyboard preserved |

**Overall mandala test coverage target**: >80% (current baseline ~60% per SPEC §Quality Gates)

---

## 8. Test Execution

### Run all mandala tests
```bash
pnpm test:run --project=core-ui tests/components/akasha/
```

### Run Phase 2 only
```bash
pnpm test:run --project=core-ui tests/components/akasha/hooks/useLayerState.test.ts
pnpm test:run --project=core-ui tests/components/akasha/layers/
pnpm test:run --project=core-ui tests/components/akasha/integration/MandalaKeyboardFlow.test.tsx
```

### Run Phase 3 only
```bash
pnpm test:run --project=core-ui tests/components/akasha/context/
```

### Run Phase 4 only
```bash
pnpm test:run --project=core-ui tests/components/akasha/Suspense/
```

### Run Phase 5 only
```bash
pnpm test:run --project=core-ui tests/components/akasha/OduGlyphs/
```

### Typecheck (pre-requisite)
```bash
pnpm typecheck  # must pass before test run
```

---

## 9. Critical Implementation Notes

1. **All component tests use `@testing-library/react`**: `render`, `screen`, `fireEvent`/`userEvent`, `waitFor`. Pattern established in `atmosphere.test.tsx`, `MandatoUnificado.test.tsx`.

2. **`userEvent` preferred over `fireEvent`** for keyboard interactions: `userEvent.tab()`, `userEvent.keyboard('{Enter}')` simulate real browser keyboard events. Import from `@testing-library/user-event`.

3. **Fixtures live next to test files** or in `tests/mocks/`: use `mockMandalaData` from `MandalaChart.test.tsx` as the base fixture; extend per-phase.

4. **No snapshot tests**: Mandala SVG output is large and brittle. Test behaviour (aria attributes, presence of elements, state changes), not HTML strings.

5. **Hooks are pure unit tests**: No `render` from `@testing-library/react` needed for hook tests — use `renderHook` from `@testing-library/react`.

6. **Phase 5 Odu glyphs must not invent glyphs**: Tests for undocumented Odu must assert fallback behavior (gold circle), not a fabricated SVG path. This enforces the R-022 §4.4 invariant.

7. **`vi.useFakeTimers()` not needed**: All animations are CSS-driven and mocked at the component boundary (`useReducedMotion`). No `setInterval` / `setTimeout` in the mandala layer components.

8. **Context tests must wrap with `<MandalaProvider>`**: Use `render(<MandalaProvider><Component /></MandalaProvider>)` pattern from React 18 Testing Library context testing guidelines.

9. **Suspense tests need async utilities**: Use `waitFor` or `findBy` queries for the Suspense fallback → content swap transition.

10. **Accessibility is a first-class assertion**: Every render test must assert at least one ARIA attribute (`role`, `aria-label`, `aria-pressed`, `aria-live`). No `getByText` without an a11y co-assertion.
