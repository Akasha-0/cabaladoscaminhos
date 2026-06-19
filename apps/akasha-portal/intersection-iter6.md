# IntersectionObserverIter6 Summary

## Decision: FIX (not remove)

The `DiarioScrollContainer` header renders a **live section counter**:
```
{currentSection} · {labels[currentSection - 1]}
```
This is a visible UI element — the sticky header shows the user which section they are currently reading (e.g. `3 · Ritual`). The `IntersectionObserver` is the mechanism that drives it. Since this is live UI, the correct action is **fix** — wire the observer to real DOM elements.

## Root Cause

The `IntersectionObserver` in `DiarioScrollContainer` watches all `[data-section-index]` elements, but **none of the 5 child sections in `page.tsx` had these attributes**. The observer was running but finding zero targets — `currentSection` stayed frozen at its initial value of `1`.

## Fix Applied

Added `data-section-index` to all 5 section wrapper `<div>` elements in `src/app/[locale]/(akasha)/diario/page.tsx`:

| Index | Section | Wrapper |
|-------|---------|---------|
| 0 | MandatoUnificado | `max-w-xl … pt-8 pb-4` |
| 1 | RitualSection | `max-w-xl … py-4` |
| 2 | DiarioAuthorityBlock | `max-w-xl … py-4` |
| 3 | SignificadoSection | `max-w-xl … py-4` |
| 4 | AreasSection | `max-w-xl … py-4 pb-16` |

Order matches `SECTION_LABELS` in `DiarioScrollContainer.tsx`:
```
['Mandato', 'Autoridade', 'Ritual', 'Significado', 'Áreas']  // pt-BR
['Mandate', 'Authority', 'Ritual', 'Meaning', 'Areas']       // en
```

## No Changes to DiarioScrollContainer.tsx

The component was already correct — the observer logic, `currentSection` state, `rootMargin: '-40% 0px -40% 0px'` (activates when section is in middle 20% of viewport), and `useEffect` dependency-less run-once pattern were all properly implemented. Only the `data-section-index` attributes were missing from the page.

## Verification

- `pnpm typecheck` → clean, no errors
- All 5 `data-section-index` attributes confirmed in `page.tsx`
- `SECTION_LABELS` array indices (0–4) align with section order
