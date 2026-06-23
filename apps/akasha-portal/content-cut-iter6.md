# ContentCutIter6 Summary — Akasha Diário Iteration 6

**Theme:** Clarity + Content
**Date:** 2026-06-19
**Typecheck:** ✅ 0 errors

---

## Changes Applied

### 1. `page.tsx` — `extractFrasesFallback` removed
- **Removed:** `extractFrasesFallback()` function (was ~15 lines at bottom of file)
- **Removed:** `const frases = crise ? [] : extractFrasesFallback(mandato.redacao_bruta);`
- **Changed:** `frases={frases}` → `frases={[]}` in `<MandatoUnificado>`
- The `frases` (3 frases) section was noise — the real content is in the MandatoUnificado card body itself

### 2. `page.tsx` — Error state i18n wired
- **Before:** Hardcoded PT-BR `"Mandato indisponível"` and `"Não conseguimos calcular..."`
- **After:** Uses `t('diario.mandato.indisponivel')` + `t('diario.mandato.indisponivelDesc', { status: String(mandatoRes.status) })`
- Both keys already existed in `src/i18n/pt-BR.json` and `src/i18n/en.json`
- `getTranslations` was already imported

### 3. `SignificadoSection.tsx` — Reduced to 3 pilares
- **Filter logic (`tresPilares`):**
  - Principal is always first
  - If principal is NOT first in `ORDEM_PILARES`: show one before, principal, one after
  - If principal IS first: show principal + next two
  - Result: always exactly 3 cards
- **Color:** `CORES_POR_PILAR` removed; now uses `PILLAR_COLORS` imported from `types.ts`

### 4. `MandatoUnificado.tsx` — Fontes section removed
- **Removed:** The `<details>` block rendering `mandato.cita_fontes`
- The `diario.mandato.fontes` key remains in i18n files (no-op removal — safe to leave)

### 5. `types.ts` — `PILLAR_COLORS` consolidated
- **Added:** `export const PILLAR_COLORS: Record<Pilar, string>` (single source of truth)
- `SignificadoSection.tsx` now imports `PILLAR_COLORS` from `./types`
- `CORES_POR_PILAR` removed from `SignificadoSection.tsx`

---

## File Delta

| File | Change |
|------|--------|
| `src/components/akasha/diario/types.ts` | +1 const `PILLAR_COLORS` |
| `src/components/akasha/diario/SignificadoSection.tsx` | `CORES_POR_PILAR` removed; `PILLAR_COLORS` imported; `tresPilares` filter added |
| `src/components/akasha/diario/MandatoUnificado.tsx` | `cita_fontes` / `<details>` block removed |
| `src/app/[locale]/(akasha)/diario/page.tsx` | `extractFrasesFallback` removed (-567 bytes); `frases={[]}`; error state i18n wired |

---

## Verification
- `pnpm typecheck` → ✅ 0 errors
- No `CORES_POR_PILAR` anywhere in the codebase
- No `extractFrasesFallback` anywhere in the codebase
- No `cita_fontes` in `MandatoUnificado.tsx`
- `PILLAR_COLORS` defined exactly once in `types.ts`
