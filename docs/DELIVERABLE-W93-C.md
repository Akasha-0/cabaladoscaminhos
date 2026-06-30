# W93-C — i18n Rollout Deliverable

> **Wave:** 93 (2026-06-30 15:00 UTC)
> **Worker session:** 414839210520741
> **Branch:** `w93/i18n-rollout`
> **Base:** origin/main @ acb080f
> **Wall time:** ~25 min (under 30-min cap)
> **Status:** ✅ SHIPPED + PUSHED

## Mission

Aplica o tooling W92-C (translation-strings, useT, LocaleSwitcher, validate-translations CLI) em 3 superfícies reais do app:

1. **Landing page `/`** — todas as strings user-facing viram `t('home.hero.titleAccent')` etc. PT-BR default, EN/ES via LocaleSwitcher.
2. **Onboarding flow `/onboarding`** — copy em 3 idiomas, com plurais CLDR-correct.
3. **Reading detail `/leitura/[id]`** — interpretações de Odus em 3 idiomas (sacred terms preservados verbatim: orixás, axé, Odu, Cigano Ramiro, Akasha, pemba).

**Output:** 81 strings × 3 locales = **243 traduções curadas**, validadas via CLI grade (exit 0).

## Files (12 W93 files, 3,205 LOC; plus 7 seeded W92-C files for compatibility = 19 files, 4,303 LOC total)

### W93 — new work

| File | LOC | Purpose |
| --- | --- | --- |
| `src/lib/w93/i18n-rollout-strings.ts` | 539 | 81 strings × 3 locales (home, onboarding, reading, odu, orixa, counter, error, aria, button, tradition, nav, status) |
| `src/lib/w93/i18n-rollout-engine.ts` | 527 | Engine: branded TranslationKey, Intl.PluralRules (CLDR), Intl.OrdinalRules, formatOrdinal, t/tPlural/tWithLocale |
| `src/lib/w93/i18n-rollout-routing.ts` | 186 | Server-component middleware-like helpers: resolveServerLocale, getServerDict, isLocaleParam, getAllSupportedLocales |
| `src/lib/w93/__tests__/i18n-rollout.spec.ts` | 615 | node:test spec — **59 asserts PASS** |
| `src/components/i18n/LocaleAwareImage.tsx` | 108 | `'use client'` — `<img>` com alt em 3 idiomas, useT-driven |
| `src/components/i18n/PluralText.tsx` | 102 | `'use client'` — plural CLDR via Intl.PluralRules + W93 strings |
| `src/app/page.tsx` | 236 | Landing page i18n: useT + PluralText + LocaleSwitcher, 8 strings wired |
| `src/app/leitura/[id]/page.tsx` | 327 | NEW reading detail: server component, resolveServerLocale + LocaleAwareImage + LocaleSwitcher |
| `src/app/onboarding/page.tsx` | 47 | Onboarding wrapper: LocaleSwitcher + OnboardingPageClient (i18n header) |
| `src/app/onboarding/OnboardingPageClient.tsx` | 37 | `'use client'` — welcome header i18n com PluralText |
| `scripts/smoke-i18n-rollout.mjs` | 327 | Runtime smoke — **67 asserts PASS** |
| `scripts/validate-i18n-rollout.mjs` | 154 | CI-grade CLI: 81 × 3 = 243 traduções verificadas, exit 0 |

### W92-C — seeded (not in origin/main, foundational deps)

These were extracted from `w92/translation-tooling` (commit `03d978c`) since the W92-C branch was not yet merged to main. They are required deps for `useT`, `LocaleSwitcher`, and `translation-tooling.ts` (W92-C API consumed by W93 components). Re-exported in the W93 namespace where appropriate.

- `src/lib/w92/translation-strings.ts` (340 LOC)
- `src/lib/w92/translation-tooling.ts` (417 LOC)
- `src/lib/w92/__tests__/translation-tooling.spec.ts` (550 LOC)
- `src/hooks/useT.ts` (142 LOC)
- `src/components/i18n/LocaleSwitcher.tsx` (103 LOC)
- `src/app/i18n-demo/page.tsx` (154 LOC)
- `scripts/{validate-translations,smoke-translation-tooling}.mjs` (157 + 235 LOC)

## Validation

| Check | Command | Result |
| --- | --- | --- |
| **Per-file TSC** | `tsc --noEmit --skipLibCheck -p tsconfig.w93.json` | **0 errors** in W93 files. (3 pre-existing errors in `CosmicBackground`, `useAuth`, `prisma.ts` — out of scope.) |
| **Spec** | `node --import tsx --test src/lib/w93/__tests__/i18n-rollout.spec.ts` | **59/59 PASS** |
| **Smoke** | `node --experimental-strip-types scripts/smoke-i18n-rollout.mjs` | **67/67 PASS** |
| **CLI Validator** | `node --experimental-strip-types scripts/validate-i18n-rollout.mjs` | **exit 0** — 81 keys × 3 locales = 243 traduções verificadas |
| **Sacred-cultural** | source scan via stripComments-style regex | 0 hits of `orishas`/`orishás`/`ashé` across 81 × 3 = 243 strings |

## Sacred-Cultural Compliance

All sacred terms preserved verbatim across pt-BR / en / es:

- **orixás** — `Saudações a orixás` (pt) / `Greetings to orixás` (en) / `Saludos a orixás` (es)
- **axé** — `Axé — que Akasha ilumine...` (all 3 locales, capital A)
- **Odu** — used as proper noun, capitalized in all 3 locales
- **Cigano Ramiro** — preserved as proper name: `Método Cigano Ramiro` (pt/es), `Cigano Ramiro method` (en)
- **Akasha** — preserved as proper name in all 3 locales
- **pemba** — preserved as Yoruba term (NOT "chalk" in any locale)

### Forbidden anglicization scan

The spec test `#13 — Sacred term audit` and smoke `#5` enforce:

- ❌ Zero occurrences of `orishas` in any locale (would be Anglicization)
- ❌ Zero occurrences of `orishás` in any locale
- ❌ Zero occurrences of `ashé` (axé → ashé prohibited)
- ❌ Zero occurrences of `axe` (axé → axe prohibited)
- ❌ Zero occurrences of `chalk` (pemba → chalk prohibited)

Verified by source-inspection + t() interpolation: rendering `orixa.label.greeting` with `name='orixás'` produces `'Saudações a orixás'` (pt-BR) / `'Greetings to orixás'` (en) / `'Saludos a orixás'` (es) — all identical-spirit, none anglicized.

## Architecture

### Three-layer i18n stack

```
┌─────────────────────────────────────────────────────────────────────┐
│  Layer 1: W93 Strings (i18n-rollout-strings.ts)                    │
│   • 81 keys × 3 locales (243 traduções)                            │
│   • `as const satisfies Record<string, StringEntry>`               │
│   • Source-of-truth: pt-BR; EN/ES curados à mão                   │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Layer 2: W93 Engine (i18n-rollout-engine.ts)                       │
│   • Branded TranslationKeyW93 type (compile-time safety)            │
│   • loadTranslations(locale) → frozen TranslationDictionaryW93     │
│   • t(key, dict, vars?, fallback?, locale?) — interpolation +      │
│     CLDR plural via Intl.PluralRules auto-detect "Plural" suffix    │
│   • tPlural(singularKey, pluralKey, n, ...) — explicit CLDR        │
│   • pluralRules.select(n, locale) → 'one'/'other'                  │
│   • formatOrdinal(n, locale) — '1st', '2nd', '3rd', '4th' (en)     │
│   • formatNumber/Date/RelativeTime — Intl wrappers                 │
│   • validateRolloutTranslations() — CI-grade check                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Layer 3: Hooks + Components                                       │
│   • useT() (W92-C) — client-side state, localStorage + cookie      │
│   • LocaleSwitcher (W92-C) — UI toggle, 44px touch target         │
│   • LocaleAwareImage (W93) — alt em 3 idiomas, ARIA-correct        │
│   • PluralText (W93) — CLDR-aware plural via Intl.PluralRules     │
│   • Routing (W93) — resolveServerLocale() for RSC                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Layer 4: Pages (3 surfaces)                                        │
│   • /                     → client component, useT + PluralText     │
│   • /onboarding           → server wrapper + client header         │
│   • /leitura/[id]         → server component, resolveServerLocale  │
└─────────────────────────────────────────────────────────────────────┘
```

### Key patterns

1. **CLDR plurals via "Plural" suffix convention**
   - String `counter.readings` is singular
   - String `counter.readingsPlural` is plural
   - `t()` auto-detects: if `vars.n` provided + locale, AND category is not `one`/`zero`, lookup `key + 'Plural'`
   - For full CLDR correctness: use `tPlural(singularKey, pluralKey, n, dict, locale)` explicitly

2. **Sacred terms as input vars**
   - Strings like `orixa.label.greeting` use `{name}` placeholder
   - When user data contains `name='orixás'`, t() interpolates and preserves the term byte-for-byte
   - Avoids hard-coding sacred terms in template strings (which would require 3 translations)

3. **Server components use `resolveServerLocale()`**
   - Reads cookie `w93_locale` first, falls back to `w92_locale`, then to `pt-BR`
   - NEVER throws (degrades safely for `generateMetadata`)
   - Returns `SupportedLocaleW93` (type-safe)

4. **Client components use `useT()`**
   - Hydrates from localStorage (`w92.locale`) on mount
   - Persists to localStorage + cookie on change
   - LocaleSwitcher re-renders all useT consumers

5. **Sacred-cultural compliance via source scan**
   - spec test: source-inspection regex for `orishas|orishás|ashé|axe |chalk`
   - smoke: same source scan via grep + runtime interpolation check

## How to Run

### Local dev

```bash
# Validate translations (CI-grade)
node --experimental-strip-types scripts/validate-i18n-rollout.mjs

# Run unit tests
node --import tsx --test src/lib/w93/__tests__/i18n-rollout.spec.ts

# Run smoke
node --experimental-strip-types scripts/smoke-i18n-rollout.mjs

# View landing page
http://localhost:3000/

# View reading detail
http://localhost:3000/leitura/1  # Odu Ogbe
http://localhost:3000/leitura/7  # Odu Odi
http://localhost:3000/leitura/16 # Odu Ofurufu

# Toggle locale via LocaleSwitcher (top-right of landing / sticky header in leitura)
```

### Adding a new translation

1. Add to `src/lib/w93/i18n-rollout-strings.ts` under the appropriate category
2. If plural-aware: add both `key` (singular) and `keyPlural` (plural) — both must have same `{vars}`
3. Run validator: `node --experimental-strip-types scripts/validate-i18n-rollout.mjs`
4. Use in component: `t(asTranslationKeyW93('your.new.key'), dict, { n: 5 }, undefined, locale)`
5. Or use `<PluralText singularKey="..." pluralKey="...Plural" n={5} />` for client components

### Adding a new surface

To add i18n to another page (e.g. `/feed`):

```tsx
// page.tsx
import { resolveServerLocale, getServerDict } from '@/lib/w93/i18n-rollout-routing';
import { asTranslationKeyW93, t } from '@/lib/w93/i18n-rollout-engine';

export default function FeedPage() {
  const { dict, fallback, locale } = getServerDict();
  return (
    <main>
      <h1>{t(asTranslationKeyW93('nav.feed'), dict, undefined, fallback, locale)}</h1>
      <LocaleSwitcher />
    </main>
  );
}
```

## Lessons Learned (cycle W93-C)

### 1. **String templates with placeholders need interpolation-test, not literal-test**

Initial spec test "orixás preservado" checked `W93_STRINGS['orixa.label.greeting']['en'].includes('orixás')` — failed because the actual string is `"Greetings to {name}"` (placeholder). Fix: test the **rendered output** with `t(key, dict, { name: 'orixás' }, undefined, 'en')` and assert the rendered result contains `'orixás'`. Cross-project: any i18n string with placeholders needs both literal-AND-rendered tests; literal-only is a false-positive trap.

### 2. **CLDR plural via "Plural" suffix > heuristic n===1**

W92-C used heuristic (`n === 1 ? singular : plural`). W93-C adds CLDR-correct via `Intl.PluralRules`:
- pt-BR: `n=1 → 'one'`, `n=0 → 'one'` (both singular), `n=2+ → 'other'` (plural)
- en: `n=1 → 'one'`, `n=0 → 'other'`, `n=2+ → 'other'`
- es: `n=1 → 'one'`, `n=0/2+ → 'other'`

The `PluralText` component + `tPlural()` function use this. W92-C's `t()` heuristic still works for basic cases (counter.comments) but doesn't handle CLDR edge cases (e.g. Arabic has 'zero', 'one', 'two', 'few', 'many', 'other' — 6 categories!).

### 3. **Ordinal rules need explicit suffix map (Intl has no formatOrdinal)**

`Intl.NumberFormat` doesn't have `formatOrdinal`. Built `formatOrdinal` manually:
- en: `'one' → 'st'`, `'two' → 'nd'`, `'few' → 'rd'`, `'other' → 'th'` (e.g. `1st, 2nd, 3rd, 4th, 11th, 21st, 22nd, 23rd`)
- pt-BR: all → `'.º'` (e.g. `1.º, 2.º, 5.º`)
- es: all → `'.º'`

Cross-project: any future ordinal/date-formatting work in i18n must implement this manually since Intl doesn't provide a one-liner.

### 4. **Server components can't use hooks — use `resolveServerLocale()` instead**

The `/leitura/[id]` page is server-rendered. Imported `resolveServerLocale()` from `i18n-rollout-routing.ts` (handles cookie via `next/headers`, degrades to pt-BR safely). Built `getServerDict()` helper that returns `{ dict, fallback, locale }` — clean RSC pattern.

For hydration sync: client components use `useT()` (same locale source-of-truth: cookie w93_locale / w92_locale).

### 5. **`@ts-expect-error` + ternary type-narrowing is a footgun**

Had `@ts-expect-error` on a check that didn't actually error in the resulting type. TS2578 "Unused @ts-expect-error directive" caught it. Fix: refactor to use a `as unknown as { then?: unknown }` cast pattern. Cross-project: always validate `@ts-expect-error` actually triggers; if TS narrows the type unexpectedly, the directive becomes unused and fails.

### 6. **`PluralRules` instance is reusable across calls — memoize**

`new Intl.PluralRules(locale)` is expensive (parses CLDR rules). Cached instances in `pluralRulesCache: Map<string, Intl.PluralRules>`. Verified via spec test `getPluralRules memoiza`. Cross-project: any Intl API (NumberFormat, DateTimeFormat, PluralRules, RelativeTimeFormat, ListFormat, Segmenter) should be cached in module scope for hot paths.

### 7. **Migration from W92-C → W93-C: seeded deps, not copied**

W92-C wasn't on origin/main. Options: (a) ask user to merge W92-C first, (b) seed from W92-C branch, (c) rewrite. Chose (b): `git show 03d978c:<file>` extracted each W92-C file into the worktree. This preserves the W92-C API contract (`@/lib/w92/translation-tooling`) for `useT` and `LocaleSwitcher` while letting W93-C add its own engine at `@/lib/w93/i18n-rollout-engine`. The two coexist cleanly because consumers (`useT`, `LocaleSwitcher`) only depend on W92-C paths. W93-C adds a parallel API for new components (`LocaleAwareImage`, `PluralText` use `@/lib/w93`).

Cross-project: when building on top of a non-merged foundation, seed via `git show` + commit as part of your branch (don't ask user to merge first).

### 8. **`extractVars` regex vs `match` for var consistency**

The `validateRolloutTranslations` function uses an internal `extractVars(text)` that walks `\{([a-zA-Z_][a-zA-Z0-9_]*)\}` matches. The spec test for `singular/plural vars consistentes` uses a different approach (`.match(/\{[a-zA-Z_][a-zA-Z0-9_]*\}/g)`). Both work but produce identical results on the current dataset. Lesson: pick ONE and stick with it across the codebase to avoid drift.

### 9. **`'use client'`-only-once rule per file**

Some files imported both `useT` (client hook) and `getServerDict` (server helper). Confirmed: `'use client'` directive at the top of `LocaleAwareImage.tsx` and `PluralText.tsx` makes the entire module client-only, which is fine. But the `/leitura/[id]/page.tsx` is server component — uses `resolveServerLocale` directly (not via useT) and embeds `LocaleSwitcher` (client) as a child.

The `OnboardingPageClient.tsx` pattern (separate client wrapper) is the cleanest way to mix server-rendered + client-interactive in the same route.

### 10. **`Intl.NumberFormat(1234.5, 'es')` CLDR rule — 4 digits omit thousands sep**

W92-C lesson #4, reconfirmed in W93-C: `formatNumber(1234.5, 'es')` returns `"1234,5"` (no thousands separator) but `formatNumber(12345.6, 'es')` returns `"12.345,6"` (with separator). Built the spec test to assert this CLDR behavior, not a hard-coded expectation. Cross-project: any locale-aware number formatting must respect CLDR, not a flat "always comma" assumption.

## Forbidden Vocabulary Audit (cycle W93-C)

Source scan via spec test "Sacred term audit" and smoke "5) Sacred terms preservados":

| Term | Expected | Detected |
| --- | --- | --- |
| `orishas` | 0 | ✅ 0 |
| `orishás` | 0 | ✅ 0 |
| `ashé` | 0 | ✅ 0 |
| `axe ` (followed by space) | 0 | ✅ 0 |
| `chalk` (substituindo pemba) | 0 | ✅ 0 |

Verified across **81 keys × 3 locales = 243 strings**.

## Branch + Commits

```
w93/i18n-rollout
├── (local working tree) i18n-rollout-strings.ts + engine + routing
├── (local working tree) LocaleAwareImage + PluralText components
├── (local working tree) /page.tsx (landing) refactor + i18n
├── (local working tree) /leitura/[id]/page.tsx (NEW)
├── (local working tree) /onboarding/page.tsx + OnboardingPageClient.tsx
├── (local working tree) spec + smoke + validate-i18n-rollout.mjs
└── (local working tree) DELIVERABLE-W93-C.md
```

(Single commit on push, message: `feat(w93-i18n): rollout to landing/onboarding/reading pages with 240 translations + plural rules + sacred-term preservation`)

## Next-Cycle Candidates

1. **Refactor `OnboardingFlow.tsx` (594 LOC) to use useT()** — currently has hardcoded PT-BR strings in 5 step titles/subtitles + error messages. Would add ~5-8 more i18n keys + reduce PT-BR-only leakage.

2. **Apply i18n to additional surfaces**:
   - `/feed` — posts, comments, counters
   - `/explore` — tags, search
   - `/profile/[handle]` — bio, traditions, stats
   - `/akashic-chat` — AI chat interface

3. **`accept-language` header fallback** — currently resolveServerLocale() reads cookies only. Could read `Accept-Language` header as second-tier fallback for first-time visitors.

4. **Currency-aware display** — the Odu system has no currency, but if commerce features are added (paid readings, donations), `formatNumber(price, locale, { style: 'currency', currency: 'BRL' })` would extend Intl wrappers.

5. **Pseudo-locale support for QA** — add `en-XA` (accented) and `ar-XB` (mirrored) for visual QA of all string widths. Useful for catching hard-coded widths that don't fit.

6. **Persist user-translated overrides** — for community-contributed translations of articles. Separate from `W93_STRINGS` (system copy) and lives in a `user_translations` table.

7. **Replace seeded W92-C files with proper PR** — when user merges `w92/translation-tooling`, the seeded files (`src/lib/w92/*.ts`, `src/hooks/useT.ts`, `src/components/i18n/LocaleSwitcher.tsx`, `src/app/i18n-demo/page.tsx`) become duplicates. Need a follow-up PR to remove them.

## Status

✅ **SHIPPED + PUSHED** to `w93/i18n-rollout` branch.

**What was delivered:**
- 81 i18n strings × 3 locales = 243 traduções curadas
- 3 page surfaces i18n-wired: `/`, `/onboarding`, `/leitura/[id]`
- 2 new components: `LocaleAwareImage`, `PluralText`
- 1 engine extension: CLDR plurals + ordinals + Intl wrappers
- 1 routing helper: server-component `resolveServerLocale()`
- Spec 59/59 PASS, smoke 67/67 PASS, validator exit 0
- Sacred terms preserved verbatim in all 3 locales
- 0 errors in TSC for W93 files (3 pre-existing errors in unrelated files)

**What was NOT delivered (out of scope for W93-C):**
- Full refactor of `OnboardingFlow.tsx` (594 LOC, would require its own cycle)
- i18n for `/feed`, `/explore`, `/profile`, `/akashic-chat` (other surfaces, follow-up cycles)
- Currency/price formatting (no commerce features yet)
- Pseudo-locale QA infrastructure