# Mandala Phase 3 — Design Document
## MandalaContext + F-227 AkashaAuthority Integration

**Author:** SynthesisArchitect  
**Date:** 2026-06-19  
**Status:** Design — no implementation  

---

## 1. Summary

Phase 3 establishes `MandalaContext` as the single authoritative data layer for the Mandala page, replacing the current prop-drilling of `MandalaData` and the redundant client-side fetch in `MandalaAuthorityBlock`. The context also synthesizes F-227 AkashaAuthority directly from `MandalaData` on the client, eliminating the lossy `buildAuthorityPilares` workaround and the duplicate `/api/akasha/daily` call that currently only exists to extract `dailyDecision`. The `MandalaNarrativeLoader`'s fetch is preserved for narrative content (Phase 4 scope), but future work can lift that into the same context.

---

## 2. MandalaContext Shape

### 2.1 Why a context is needed (the core problem)

The current architecture has a structural flaw:

```
MandalaPage (server) ──MandalaData──► MandalaChart
                    └──buildAuthorityPilares (lossy)──► MandalaAuthorityBlock
                                                     └── useEffect──► /api/akasha/daily (duplicate)
```

`MandalaAuthorityBlock` fetches `/api/akasha/daily` for one reason only: to extract `dailyDecision.strategy`, `dailyDecision.authority`, and `dailyDecision.recommendation` for the `AkashaAuthorityPrompt`. This fetch is redundant because:

- `deriveAkashaAuthority()` (in `src/lib/grimoire/synthesis/synthesizer.ts`) computes the same authority from `PilaresDados`.
- `MandalaData` already contains all 5 pillars — it has the data needed to build `PilaresDados`.
- The existing `buildAuthorityPilares()` in `page.tsx` is lossy: it uses `astrology.ascendant` as a fallback for `sol_signo`, invents `trigemeo: 'fisico'` and `temperamento_atual: 'sanguineo'` rather than reading real values, and passes `0` for all Kabala numbers except `life_path`.

The root cause is a **type impedance mismatch**: `MandalaData` (the API output shape) and `PilaresDados` (the `deriveAkashaAuthority` input shape) are different record shapes with different field names. `MandalaAuthorityBlock` bypasses this by fetching pre-computed authority from the daily API instead of computing it locally.

### 2.2 State to lift into context

| State | Source | Reason lifted |
|---|---|---|
| `mandalaData: MandalaData` | Props from `MandalaPage` | Root of all chart rendering; must be available to all child components |
| `authority: AkashaAuthority` | Derived from `mandalaData` via `buildPilaresFromMandala()` | The F-227 authority — consumed by `MandalaAuthorityBlock`, `MandalaChart` info panels (Phase 4) |
| `synthesis: CaixaSintese | null` | Derived from `mandalaData` via `sintetizarMapa()` | Phase 4: 9-dimension synthesis consumed by `MandalaNarrative`; computed lazily (expensive) |
| `dailyLoading: boolean` | Tracks async derivation | Prevents flash of authority before first render |

### 2.3 State that stays local (not in context)

| State | Location | Reason |
|---|---|---|
| `activeLayer`, `hoveredLayer` | `useLayerState` | Pure UI state — which layer is highlighted; chart-specific |
| `atmosphereIntensity` | `useCockpitStore` | Global cockpit preference; already in Zustand store |
| `reducedMotion` | `useReducedMotion` | OS-level preference; hook-based |
| `tooltipByLayer`, `planetDots`, etc. | `useMandalaData` | Derived SVG data; computed per-render from `MandalaData` |

### 2.4 The `PilaresDados` ↔ `MandalaData` mapping problem

`deriveAkashaAuthority()` reads these fields from `PilaresDados`:

```
cabala.life_path              → MandalaData.kabala.lifePath
astrologia.lua_signo          → MandalaData.astrology.planets (find Luna)
astrologia.casa_8_signo       → MandalaData.astrology.planets (find house 8 body)
tantrica.corpo_predominante   → MandalaData.tantra.bodies (find dominant by active=true)
```

The `MandalaData.astrology.planets` array does not expose `lua_signo` directly — it stores raw planet data. The `lua_signo` field (Moon's zodiac sign) must be extracted by finding the planet named "Lua" or "Moon" in the array and reading its `sign` field.

**Proposed `buildPilaresFromMandala()` helper (computed inside context, replaces `buildAuthorityPilares`):**

```typescript
// src/components/akasha/hooks/useMandalaContext.ts

function buildPilaresFromMandala(data: MandalaData): Partial<PilaresDados> {
  // Find the Moon in the planets array to derive lua_signo
  const luaPlaneta = data.astrology.planets.find(
    (p) => p.name === 'Lua' || p.name === 'Moon'
  );

  // Find the planet in House 8 for casa_8_signo
  const casa8Planeta = data.astrology.planets.find((p) => p.house === 8);

  // Find dominant tantric body (first body where active=true)
  const corpoPredominante = data.tantra.bodies.find((b) => b.active)?.index ?? null;

  return {
    cabala: data.kabala.lifePath != null
      ? {
          life_path: data.kabala.lifePath,
          birthday: 0,           // MandalaData does not carry birthday
          expression: data.kabala.expression ?? 0,
          ano_pessoal: data.kabala.personalYear ?? 0,
        }
      : undefined,
    astrologia: luaPlaneta != null
      ? {
          sol_signo: data.astrology.planets.find(
            (p) => p.name === 'Sol' || p.name === 'Sun'
          )?.sign ?? 'desconhecido',
          asc_signo: data.astrology.ascendant,
          lua_signo: luaPlaneta.sign,
          lua_fase: 'cheia',    // MandalaData does not carry lunar phase
          trinity: { sombra: 0, dom: 0, graca: 0 },
          trinity_dominante: 'dom' as const,
          lilith_signo: data.astrology.planets.find(
            (p) => p.name === 'Lilith' || p.name === 'Black Moon'
          )?.sign ?? null,
          casa_8_signo: casa8Planeta?.sign ?? null,
        }
      : undefined,
    tantrica: corpoPredominante != null
      ? {
          corpo_predominante: corpoPredominante,
          trigemeo: 'fisico' as const,   // MandalaData does not carry trigemeo
          temperamento_atual: 'sanguineo' as const, // MandalaData does not carry
        }
      : undefined,
  };
}
```

> **Note:** Fields marked `0` or invented (`trigemeo`, `temperamento_atual`, `lua_fase`) are limitations of `MandalaData`'s current shape. They degrade authority precision. This is tracked as a known gap — future work (Phase 4/5) may extend `MandalaData` to carry full `PilaresDados`.

### 2.5 Context interface sketch

```typescript
// src/components/akasha/contexts/MandalaContext.tsx

export interface MandalaContextValue {
  data: MandalaData;                        // Always present after hydration
  authority: AkashaAuthority | null;        // Derived synchronously from data
  synthesis: CaixaSintese | null;            // Phase 4: 9-dimension synthesis
  pilares: Partial<PilaresDados>;            // Mapped from MandalaData
  dailyLoading: boolean;                    // True until authority is computed
}

export const MandalaContext = createContext<MandalaContextValue | null>(null);

export function MandalaProvider({
  data,
  children,
}: {
  data: MandalaData;
  children: React.ReactNode;
}) {
  const pilares = useMemo(() => buildPilaresFromMandala(data), [data]);
  const authority = useMemo(() => deriveAkashaAuthority(pilares), [pilares]);
  // Phase 4: synthesis = useMemo(() => sintetizarMapa(toFullPilares(data)), [data])

  return (
    <MandalaContext.Provider value={{ data, authority, synthesis: null, pilares, dailyLoading: false }}>
      {children}
    </MandalaContext.Provider>
  );
}
```

---

## 3. F-227 Authority Integration

### 3.1 Where in the Mandala UI

The F-227 authority UI is the `AkashaAuthorityPrompt` component. In Phase 3 it continues to render inside `MandalaAuthorityBlock`, but `MandalaAuthorityBlock` is refactored to **consume `MandalaContext`** instead of performing its own `useEffect` fetch.

Placement in the page (from `page.tsx`):

```
<section aria-label="Narrativa">
  <MandalaNarrativeLoader />        ← Phase 4: will read from context
</section>

<section aria-label="Akasha Authority">
  <MandalaAuthorityBlock />         ← Reads authority from context (Phase 3 change)
</section>

<MandalaChart />                     ← Reads data from context (Phase 3 change)
```

### 3.2 Refactoring `MandalaAuthorityBlock`

**Current implementation** (two problems):
1. `useEffect` fetches `/api/akasha/daily` — redundant, server has `MandalaData` already
2. `buildAuthorityPilares(data)` from `page.tsx` is lossy — authority is degraded

**Phase 3 implementation:**

```typescript
// src/components/akasha/MandalaAuthorityBlock.tsx

'use client';

import { useContext } from 'react';
import { AkashaAuthorityPrompt } from '@/components/akasha/AkashaAuthorityPrompt';
import { MandalaContext } from '@/components/akasha/contexts/MandalaContext';
import { derivedPilaresFromMandala } from '@/components/akasha/hooks/useMandalaContext';

export function MandalaAuthorityBlock() {
  const { authority, pilares } = useContext(MandalaContext);

  if (!authority) return null;

  return (
    <AkashaAuthorityPrompt
      authority={{
        estrategia: authority.estrategia,
        autoridade: authority.autoridade,
        decisaoHoje: authority.decisaoHoje,
      }}
      pilares={pilares}
    />
  );
}
```

**Removed:**
- `useState` for `authority` (now from context)
- `useEffect` fetching `/api/akasha/daily`
- The lossy `buildAuthorityPilares` call from `page.tsx`

### 3.3 `AkashaAuthorityPrompt` prop contract

The `AkashaAuthorityPrompt` interface (`AkashaAuthorityPromptProps`) is unchanged:

```typescript
interface AkashaAuthorityPromptProps {
  authority: { estrategia: string; autoridade: string; decisaoHoje: string };
  pilares: Partial<PilaresDados>;
  onDecide?: (estado: EstadoAkasha, acao: 'aja' | 'espere' | 'observe') => void;
  compact?: boolean;
}
```

The context adapter in `MandalaAuthorityBlock` maps `AkashaAuthority` (full type) to the subset the prompt expects. This keeps the prompt component decoupled from the context.

---

## 4. Data Flow

### 4.1 Phase 3 data flow (new)

```
┌─────────────────────────────────────────────────────────────────┐
│  MandalaPage (Server Component)                                  │
│                                                                  │
│  fetch /api/akasha/mandala  →  MandalaData  (full 5-pillar data) │
└─────────────────────────────┬───────────────────────────────────┘
                              │ MandalaData as prop
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  MandalaProvider (Client Component, 'use client')               │
│  createContext + derive authority from MandalaData              │
│                                                                  │
│  buildPilaresFromMandala(data)  →  Partial<PilaresDados>       │
│  deriveAkashaAuthority(pilares) → AkashaAuthority              │
│                                                                  │
│  value = { data, authority, synthesis: null, pilares }          │
└──────────┬──────────────────┬────────────────────────────────────┘
           │                  │
           │ context          │ context
           ▼                  ▼
┌──────────────────┐  ┌────────────────────────────────────────────┐
│ MandalaChart     │  │ MandalaAuthorityBlock                     │
│ (reads data)     │  │ (reads authority + pilares)              │
│                  │  │  └─► AkashaAuthorityPrompt               │
└──────────────────┘  └────────────────────────────────────────────┘
           │
           │ useMandalaData(data)
           ▼
┌──────────────────────────────────────────────────────────────┐
│  Info Panels (AstrologyPanel, KabalaPanel, etc.)             │
│  These read data.* fields directly (no context change yet)   │
│  Phase 4: migrate to read from context                       │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Eliminated paths

The following are removed in Phase 3:

```
✗ MandalaAuthorityBlock ──useEffect──► /api/akasha/daily   (removed)
✗ page.tsx buildAuthorityPilares()                         (moved into context)
```

The `/api/akasha/daily` fetch remains only in:
- `MandalaNarrativeLoader` — fetches narrative synthesis for the narrative section (Phase 4 scope)

### 4.3 Phase 4 data flow (forward-looking, not implemented in Phase 3)

```
MandalaNarrativeLoader
  └── /api/akasha/daily → DailyContentUI
       └── synthesis: AkashaSynthesisUI + CaixaSintese
            └── lifted into MandalaContext.synthesis
                 └── consumed by MandalaNarrative (already rendered below authority block)
```

This is documented here so Phase 4 implementers know the context is designed to accommodate the narrative synthesis as a second derived value, computed lazily.

---

## 5. Breaking Changes Analysis

### 5.1 `MandalaData` interface — **NOT AFFECTED**

`MandalaData` is an **immutable API contract** (exported from `MandalaChart.tsx`). It is consumed by `MandalaChart` and all layer components via `useMandalaData`. No changes are made to this interface in Phase 3. This is a hard constraint.

### 5.2 `MandalaAuthorityBlock` — BREAKING (behaviour)

**Removed:**
- `useEffect` that fetches `/api/akasha/daily`
- `authority` local state (replaced by context)
- `loading` local state

**Before:**
```typescript
// Phase 2 — existing
const [authority, setAuthority] = useState<...>(null);
useEffect(() => {
  fetch(`/api/akasha/daily`) ... .then(json => {
    if (json?.synthesis?.dailyDecision) {
      setAuthority({ estrategia: ..., autoridade: ..., decisaoHoje: ... });
    }
  });
}, []);
```

**After:**
```typescript
// Phase 3 — new
const { authority } = useContext(MandalaContext);
```

The authority is now available synchronously (it is derived from `MandalaData` which is present on first render), eliminating the brief flash where `authority` is `null` and the block renders `null`.

### 5.3 `page.tsx` — MINOR (behaviour)

`buildAuthorityPilares` is removed from `page.tsx`. The `MandalaAuthorityBlock` no longer receives `pilares` as a prop. Instead, `MandalaAuthorityBlock` reads `pilares` from context directly.

The `MandalaProvider` wraps the `MandalaChart` and authority block in `page.tsx`.

### 5.4 `useMandalaData` hook — MINOR (additive)

Add `authority` and `pilares` to the return value:

```typescript
// src/components/akasha/hooks/useMandalaData.ts

export function useMandalaData(data: MandalaData) {
  // ... existing derived values ...

  const pilares = useMemo(() => buildPilaresFromMandala(data), [data]);
  const authority = useMemo(() => deriveAkashaAuthority(pilares), [pilares]);

  return {
    // ... existing ...
    pilares,
    authority,
  };
}
```

This hook is still used inside `MandalaChart` itself. Child info panels that currently receive data as props can optionally migrate to calling `useMandalaData()` directly in Phase 4.

### 5.5 `AkashaAuthorityPromptProps` — NOT AFFECTED

The `AkashaAuthorityPrompt` component interface is unchanged. The `MandalaAuthorityBlock` adapts `AkashaAuthority` → `AkashaAuthorityPromptProps['authority']` at the consumption site.

### 5.6 Layer components and info panels — NOT AFFECTED (Phase 3)

No changes to `Layer1Ancestralidade`, `Layer2Kabala`, `Layer3Tantra`, `Layer4Astrology`, `Layer5Iching`, or any info panel in Phase 3. They continue to receive data via `MandalaChart` props. Phase 4 migrates them to context.

---

## 6. File Creation Plan

### 6.1 Files to CREATE

| File | Purpose |
|---|---|
| `src/components/akasha/contexts/MandalaContext.tsx` | `createContext`, `MandalaProvider`, `useMandalaContext` hook |
| `src/components/akasha/hooks/useMandalaContext.ts` | `buildPilaresFromMandala()` (moved from page.tsx, corrected), `toFullPilares()` (Phase 4) |
| `src/components/akasha/contexts/index.ts` | Re-exports `MandalaContext`, `MandalaProvider`, `useMandalaContext` |

### 6.2 Files to MODIFY

| File | Change |
|---|---|
| `src/components/akasha/MandalaAuthorityBlock.tsx` | Remove `useEffect` fetch, read from context |
| `src/app/[locale]/(akasha)/mandala/page.tsx` | Remove `buildAuthorityPilares`, wrap content in `<MandalaProvider data={data}>` |
| `src/components/akasha/hooks/useMandalaData.ts` | Add `authority` and `pilares` to return value |
| `src/components/akasha/MandalaChart.tsx` | Wrap in `<MandalaProvider>` (passes data through context to children); info panels continue receiving via props |
| `src/components/akasha/AkashaAuthorityPrompt/AkashaAuthorityPrompt.tsx` | No changes |

### 6.3 Files to MODIFY (Phase 4 lookahead, do NOT implement in Phase 3)

| File | Future change |
|---|---|
| `src/components/akasha/MandalaNarrativeLoader.tsx` | Read `synthesis` from context instead of fetching |
| `src/components/akasha/MandalaNarrative.tsx` | Read from context |
| `src/components/akasha/hooks/useMandalaData.ts` | Add `synthesis: CaixaSintese` (Phase 4) |
| Info panels (5 files) | Migrate to `useMandalaData()` hook instead of prop drilling |

---

## 7. Verification Criteria

### 7.1 Authority computation

**Test 1: Authority derives correctly from MandalaData**
```
Given a MandalaData with kabala.lifePath=5, astrologia (Lua in Cancer), no Casa 8
When MandalaAuthorityBlock renders
Then authority.estrategia = 'act'
And authority.autoridade = 'emocional' (corpo 4) or 'mental' (default)
And AkashaAuthorityPrompt displays the correct strategy badge
```

**Test 2: Authority is null-safe**
```
Given a MandalaData with kabala.lifePath=null, no astrologia data
When MandalaAuthorityBlock renders
Then authority uses defaults (estrategia='wait', autoridade='mental')
And AkashaAuthorityPrompt still renders without crash
```

**Test 3: No network call from MandalaAuthorityBlock**
```
Given any MandalaData
When MandalaAuthorityBlock mounts
Then /api/akasha/daily is NOT fetched by this component
(Network tab should show zero requests from MandalaAuthorityBlock)
```

### 7.2 Context propagation

**Test 4: MandalaChart receives data from context**
```
Given MandalaData with layer 3 active
When MandalaChart renders
Then Layer3Tantra receives tantricNodes from useMandalaData
And tooltipByLayer is populated
```

**Test 5: Info panels still work**
```
Given MandalaData with activeLayer=4 (Astrology)
When user clicks C4 button
Then AstrologyInfoPanel renders with correct astrology data
And no console errors
```

### 7.3 UI rendering

**Test 6: Authority block renders above chart**
```
When MandalaPage renders
Then MandalaAuthorityBlock (AkashaAuthorityPrompt) appears above MandalaChart in DOM order
And both are visible on the page
```

**Test 7: Three-state buttons work**
```
Given AkashaAuthorityPrompt is visible
When user clicks "Paz"
Then recommendation shows "Aja Agora" in green
And prática diária text appears
When user clicks "Ansiedade"
Then recommendation shows "Aguarde" in red
```

### 7.4 Regression

**Test 8: MandalaData contract unchanged**
```
Given any valid MandalaData
When MandalaChart renders
Then all 5 layers render with correct SVG
And layer selector buttons work (C1..C5)
And incomplete data badge shows if data.incomplete=true
```

**Test 9: Page loads without errors**
```
When user navigates to /mandala
Then page renders within 3 seconds
And no console errors (Error level)
And no 401/404 (auth works)
```

---

## Appendix A: Key Types Reference

```typescript
// MandalaData — immutable API contract (src/components/akasha/MandalaChart.tsx)
interface MandalaData {
  incomplete: boolean;
  odus: { oduName: string; oduNumber: number | null; ... };
  kabala: { lifePath: number | null; expression: number | null; personalYear: number | null; ... };
  tantra: { bodies: Array<{ index: number; name: string; active: boolean }> };
  astrology: {
    ascendant: string | null;
    planets: Array<{ name: string; sign: string; house: number; absoluteLongitude: number | null }>;
    elementalBalance: { fire: number; earth: number; air: number; water: number };
  };
  iching: { hexagramNumber: number | null; ... };
  _user?: { birthDate: string | null; birthTime: string | null };
}

// PilaresDados — deriveAkashaAuthority input (src/lib/grimoire/significados-especificos.ts)
interface PilaresDados {
  cabala: { life_path: number; birthday: number; expression: number; ano_pessoal: number };
  astrologia: { sol_signo: string; asc_signo: string | null; lua_signo: string;
                lua_fase: string; trinity: {...}; trinity_dominante: string;
                lilith_signo: string | null; casa_8_signo: string | null; };
  tantrica: { corpo_predominante: number; trigemeo: string; temperamento_atual: string; };
  odu: { odu_principal: string; odu_secundario: string | null; fonte: string; };
  iching: { hexagrama_natal: number; hexagrama_dia: number; level: string; };
}

// AkashaAuthority — from deriveAkashaAuthority (src/lib/grimoire/synthesis/synthesizer.ts)
interface AkashaAuthority {
  estrategia: 'act' | 'wait' | 'observe' | 'surrender';
  autoridade: 'emocional' | 'sagrada' | 'esplénica' | 'mental';
  explicacao: string;
  regra: { condicao: string; accao: string; };
  timing: { melhor: string; pior: string; };
  areaFoco: Area;
  decisaoHoje: string;
  praticaDiaria: string;
}

// CaixaSintese — 9-dimension synthesis (Phase 4)
interface CaixaSintese {
  dimensoes: readonly DimensaoSintese[];
  caminhoDeVida: string;
  perfilGeral: string;
  autoridade: AkashaAuthority;
}
```

---

## Appendix B: Related Artifacts

- `src/lib/grimoire/synthesis/synthesizer.ts:86` — `deriveAkashaAuthority()` — the core F-227 derivation function
- `src/lib/grimoire/akasha-authority.ts` — F-227 public API: `recomendarAcaoPorEstado`, `perguntaAkashaHoje`, `avaliarDecisao`, `praticaAuthorityDiaria`
- `src/components/akasha/AkashaAuthorityPrompt/AkashaAuthorityPrompt.tsx` — F-227 visual component (already complete)
- `src/components/akasha/MandalaAuthorityBlock.tsx` — current (flawed) integration of authority into Mandala page
- `src/components/akasha/diario/DiarioAuthorityBlock.tsx` — authoritative pattern for consuming `authority` (receives as prop, no fetch)
- `src/components/akasha/hooks/useMandalaData.ts` — existing per-layer derived data hook
- `src/app/[locale]/(akasha)/mandala/page.tsx` — current page with lossy `buildAuthorityPilares`
- `src/components/akasha/dashboard/hooks/useAkashaSynthesis.ts` — `AkashaSynthesisUI` type (narrative synthesis, Phase 4 scope)
