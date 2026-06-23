# SPEC-diario-iter7 — Synthesis + Integration

## Theme

**"One coherent experience."** The five diario sections are no longer five independent cards
stitched together — they form a single narrative arc. The reader enters through *Intention*
(MandatoUnificado), activates through *Activation* (RitualSection), orients through
*Decision* (DiarioAuthorityBlock), deepens through *Meaning* (SignificadoSection), and
applies through *Application* (AreasSection). Iteration 7 wires every unused DailyResponse
field so no data computed by the API sits idle on the page.

---

## Narrative thread

```
Intention ──► Activation ──► Decision ──► Meaning ──► Application
   1              2              3             4              5
```

The thread is **implicit in the section order** (already correct from iter 6).
No structural reordering is needed.

---

## Data wiring audit — what's NEW vs what already works

### Already wired (Iteration 6 — do not change)
| DailyResponse field | Wired to | Section |
|---|---|---|
| `climate` | ScrollContainer header badge | Header |
| `alert` | MandatoUnificado alert card | §1 |
| `ritual.titulo / instrucao / cor` | RitualSection | §2 |
| `tensionPoint` | DiarioAuthorityBlock tension callout | §3 |

### Intentionally unused (still out of scope)
| DailyResponse field | Reason |
|---|---|
| `hexagram` / `hexagramLines` | I Ching natal/day data; shown in Mandala |
| `cycle.snapshot` (personalDay/Month/Year, etc.) | Complex personal timing; not rendered |

---

## SPEC items (ranked)

---

### SPEC-1 · Wire `DailyResponse.synthesis` narrative text

**What**: `DailyResponse.synthesis` contains a prose string computed by the synthesis engine
from all five pilares. It is currently extracted from the API response but discarded.
The page derives `authority` from the synthesis engine (`deriveAkashaAuthority`), but the
*synthesis narrative text itself* is never shown.

**Where to add it**: A single-line banner inside `DiarioAuthorityBlock`, between the
tension-point callout (if present) and the "Sua Autoridade" heading.

**Behaviour**:
- Render only when `dailyPayload.synthesis` is truthy and a non-empty string.
- Style: small italic text, `#8A9BB8`, with a subtle left border in `#7C5CFF33`.
- No prop drilling — extract `synthesis` in `page.tsx` alongside the other
  `DailyResponse` fields and pass it as `synthesis?: string` to `DiarioAuthorityBlock`.

**Prop change** — `DiarioAuthorityBlockProps`:
```ts
/** DailyResponse.synthesis — narrative text from synthesis engine */
synthesis?: string;
```

**Edge cases**:
- `synthesis` is `null` or empty string → render nothing (no placeholder).
- `dailyRes` itself fails → `synthesis` is `undefined` (not an error).

---

### SPEC-2 · Pass `cycle.modulation` to AreasSection

**What**: `DailyResponse.cycle.modulation` is an array of per-area alignment objects
already computed by the API. `AreasSection` currently receives zero API data and renders
all eight areas identically. Passing modulation makes §5 feel *personalized*.

**Data shape** (approximate — confirm from route handler):
```ts
// Inside DailyResponse.cycle.modulation
{ area: string; alignmentScore: number; descriptor: string }
```

**Behaviour**:
- In `page.tsx`, extract `dailyPayload.cycle?.modulation` alongside other fields.
- Pass it as `modulation?: Array<{ area: string; alignmentScore: number; descriptor?: string }>`
  to `AreasSection`.
- In `AreasSection`: compute `highlighted` areas — top 2–3 by `alignmentScore` desc.
  - Render highlighted areas *open by default* (no expand toggle needed for them).
  - Remaining areas collapsed behind the existing expand button.
  - If no `modulation` provided, fall back to current all-collapsed behaviour.

**Prop change** — `AreasSectionProps`:
```ts
export interface AreasSectionProps {
  pilarPrincipal: Pilar;
  pilarInfo: { nome: string; cor: string };
  locale: string;
  /** From DailyResponse.cycle.modulation — per-area alignment scores */
  modulation?: Array<{ area: string; alignmentScore: number; descriptor?: string }>;
}
```

**Edge cases**:
- `modulation` is empty array → all areas collapsed (current behaviour).
- `modulation` has fewer than 2 items → all collapsed.
- `area` string in modulation doesn't match an `AREAS` key → skip that item silently.

---

### SPEC-3 · Loading skeleton for RitualSection during /daily fetch

**What**: When `/daily` is slow or fails, `ritual` falls back to `buildRitualFallback`.
During the in-flight window, `ritual` is `undefined` and `RitualSection` renders `null`.
Users see a blank space in §2.

**Behaviour**:
- Add a `loading?: boolean` prop to `RitualSection`.
- When `loading === true`, render a skeleton placeholder:
  same card dimensions, pulsing `#1A1D2E` bg, 3 placeholder lines.
  Do **not** render the full `RitualSection` with empty/incomplete data.
- In `page.tsx`, pass `loading={!dailyRes.ok && dailyPayload === undefined}`
  (i.e. request in flight — `dailyRes` is a Response object but not yet `.ok`).

**Prop change** — `RitualSectionProps`:
```ts
/** True when the /daily API request is still in flight */
loading?: boolean;
```

**Implementation note**: The skeleton should use the same card wrapper
(`bg-[rgba(11,14,28,0.72)] backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-4`)
so the layout does not shift when real content arrives.

**Edge cases**:
- `/daily` returns 4xx/5xx → `ritual = buildRitualFallback()` and `loading = false`
  (no skeleton shown, fallback renders immediately).
- `/daily` succeeds but `ritual` field is null → `ritual = buildRitualFallback()`,
  no skeleton.

---

### SPEC-4 · Wire `ritual.elemento` badge in RitualSection

**What**: `DailyRitualUI` already carries an optional `elemento?: string` field
(e.g. `"Fogo"`, `"Água"`, `"Ar"`, `"Terra"`). `RitualSection` currently ignores it and
always renders the hardcoded `t('diario.ritual.duracao')` badge.

**Behaviour**:
- If `ritual.elemento` is a non-empty string, render it as the first badge (replacing
  the pillar name badge for this field) — or render both: pilar badge + elemento badge.
- The `"Duração"` label (from `t('diario.ritual.duracao')`) is hardcoded with no i18n
  key for its label text. It should keep its i18n key, but the *value* it displays should
  be `ritual.elemento` when present, not a generic duration label.
- If `ritual.elemento` is absent, fall back to current behaviour.

**Current code**:
```tsx
<span className={badge('#2DD4BF')} style={{...}}>
  {t('diario.ritual.duracao')}   {/* ← always shows i18n key value */}
</span>
```

**Desired**:
```tsx
{ritual.elemento ? (
  <span className={badge(pilarInfo.cor)} style={{...}}>
    {ritual.elemento}
  </span>
) : (
  <span className={badge('#2DD4BF')} style={{...}}>
    {t('diario.ritual.duracao')}
  </span>
)}
```

**Edge cases**:
- `ritual.elemento` is an empty string or whitespace → treat as absent, show duration.
- `ritual.elemento` value is not a known element → render as-is (no validation).

---

### SPEC-5 · Remove dead `frases` prop from MandatoUnificado

**What**: `MandatoUnificado` accepts `frases: string[]` but `MandatoUnificado.tsx`
always renders it via `.map()` — and `page.tsx` always passes `frases={[]}` (empty array).
The prop is dead: no frases are ever displayed, and no frases are ever passed.

**Changes**:
1. Remove `frases: []` from the `<MandatoUnificado>` call in `page.tsx`.
2. Remove `frases: string[]` from `MandatoUnificadoProps` in `MandatoUnificado.tsx`.
3. Remove the `frases.map(...)` JSX rendering block in `MandatoUnificado.tsx`
   (the `{t('diario.mandato.tresFrasesDesc')}` description text can stay —
   it describes the three phrases as a concept without requiring data to render).

**Edge cases**: None — the prop is provably never used.

---

## Acceptance criteria

| # | Criterion | Verification |
|---|---|---|
| A1 | `DailyResponse.synthesis` narrative text is visible on the page when present | Visual check: synthesis banner appears in §3 above authority heading |
| A2 | `AreasSection` renders highlighted (open) areas when `cycle.modulation` is available | Pass `modulation` with known areas; verify top 2–3 render open |
| A3 | `RitualSection` shows element badge when `ritual.elemento` is present | Pass ritual with `elemento: "Fogo"`; verify "Fogo" badge renders |
| A4 | `MandatoUnificado` no longer accepts or receives a `frases` prop | Grep: `frases` not in MandatoUnificado.tsx props or page.tsx call |
| A5 | Loading skeleton renders for RitualSection when /daily is in-flight | Throttle/slow the /daily endpoint; verify skeleton appears |
| A6 | `pnpm typecheck` exits 0 | `pnpm typecheck` |
| A7 | `pnpm i18n:check` reports parity OK | `pnpm i18n:check` |
| A8 | `pnpm test:run` passes all diario tests | `pnpm test:run` |

---

## Scope guard — what NOT to do

- **No new API routes.** Do not create `/api/akasha/iter7-*` or any new endpoint.
- **No auth flow changes.** Do not touch `verifyAkashaToken`, cookie names, or redirect logic.
- **No changes to 5-pilar computation logic.** `deriveAkashaAuthority`, `praticaAuthorityDiaria`,
  and the significado computation remain untouched.
- **No database writes.** No Prisma writes, no `area_history` inserts.
- **No structural reordering.** The five-section order (Mandato → Ritual → Authority →
  Significado → Areas) is the narrative thread — do not reorder sections.
- **Do not add a section progress indicator.** That was listed as MEDIUM in research but
  is deferred to a future iteration (requires scroll tracking review to avoid perf issues
  on mobile).

---

## File changes summary

| File | Change |
|---|---|
| `src/app/[locale]/(akasha)/diario/page.tsx` | Extract `synthesis` and `cycle.modulation` from `DailyResponse`; pass to components; remove `frases={[]}` |
| `src/components/akasha/diario/DiarioAuthorityBlock.tsx` | Add `synthesis?: string` prop; render synthesis banner above authority heading |
| `src/components/akasha/diario/AreasSection.tsx` | Add `modulation?` prop; implement highlight logic for top 2–3 areas |
| `src/components/akasha/diario/RitualSection.tsx` | Add `loading?` prop; render skeleton when `loading===true`; wire `ritual.elemento` badge |
| `src/components/akasha/diario/MandatoUnificado.tsx` | Remove `frases` prop and its JSX rendering |
| `src/components/akasha/diario/types.ts` | Add `synthesis` and `modulation` field comments to `DailyResponse` if helpful |
| `src/i18n/pt-BR.json` | Add `diario.authority.sintese` key (synthesis banner label) if synthesis banner needs a heading |
| `src/i18n/en.json` | Add `diario.authority.sintese` key (parity) |
| `src/i18n/config.ts` | Verify `diario` namespace registered |
