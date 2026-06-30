# W71-A i18n-multilang-engine — DELIVERABLE

**Branch:** w71/i18n-multilang-engine
**Worker:** W71-A
**Spawn @:** 2026-06-30 02:00 UTC
**Wall-clock:** ~16 min (write + 2 fix cycles)
**Status:** ✅ DELIVERED + PUSHED

## Engines

| Engine | Lines | Coverage |
|---|---|---|
| `i18n-core.ts` | 304 | 50+ keys × 3 locales (PT-BR / EN / ES) |
| `locales-pluralization.ts` | 122 | CLDR rules for pt-BR / en / es |
| `formatting.ts` | 173 | 6 formatters (date/time/number/currency/relative/list) |
| `namespaces.ts` | 351 | 7 sacred namespaces + 7 tradition keys (28 sacred keys) |

**Total engine LOC: 950**

## Spec assertions

| Spec | Passed | Total |
|---|---|---|
| `i18n-core.spec.ts` | 20 | 20 ✅ |
| `locales-pluralization.spec.ts` | 15 | 15 ✅ |
| `formatting.spec.ts` | 34 | 34 ✅ |
| `namespaces.spec.ts` | 21 | 21 ✅ |
| **TOTAL** | **90** | **90 ✅** |

## Smoke

`i18n-smoke.ts` — 4 spec modules aggregated, **90/90 checks PASS**, exit code 0, prints `ALL SMOKE PASS`.

## Sacred coverage

- **7/7 traditions** seeded: cigano, orixas, astrology, cabala, numerology, tarot, tantra
- **28 sacred keys** total (7 traditions × 4 terms × 3 locales)
- Each tradition covers 4 distinct concepts (e.g., cigano: mesa / baralho / jogada / consultora)
- 3 locales: PT-BR / EN / ES, all 28 keys have full parity

## Public API (all exported)

```ts
export { t, setLocale, getLocale, hasKey } from './i18n-core.js';
export { pluralize, getPluralForm } from './locales-pluralization.js';
export { formatDate, formatTime, formatNumber, formatCurrency, formatRelative, formatList } from './formatting.js';
export { useNamespace, registerNamespace, listNamespaces, getNamespaceKeys } from './namespaces.js';
export type { Locale, TranslationKey, Namespace, PluralKey };
```

## TSC: 0 ✅

`tsc --noEmit --skipLibCheck` — 0 errors. Strict mode enabled. Isolated `tsconfig.json` with `types: []` + `allowImportingTsExtensions: true` (cycle 60-68+ confirmed unlock pattern).

## NEW lessons (this worker)

1. **Internal storage vs public form: store keys WITHOUT namespace prefix.** When `useNamespace('traditions').t(tk('cigano.mesa'))` builds the public form `traditions:cigano.mesa`, the colon-split should extract ns + inner key and look up the inner key WITHOUT re-prefix. Storing the keys with the namespace prefix (e.g., `traditions.cigano.mesa`) and then looking up the inner key (`cigano.mesa`) silently misses every lookup. Reusable: any namespaced-translation engine where the public form is `ns:key` but the storage is keyed by `key`.

2. **Plural form for fractional counts: use truncated integer consistently.** The first cut had `en: count === 1` (no truncation) which gave `en(1.4) === 'other'`, but the CLDR-correct behavior is to truncate to integer first then compare. Single `Math.trunc(count)` computed once and used in all locale branches makes pt-BR / en / es behave identically and matches `getPluralForm(locale, 1.4) === 'one'` for any locale where 1 means singular. Reusable: any CLDR plural rule engine.

3. **`registerNamespace` keys are stored as the user provides them — no auto-prefix.** The `useNamespace.t(key)` form builds `ns:key` (colon), but the actual key in `tables[ns][locale]` is whatever the caller registered. So `registerNamespace('ui', {pt-BR: {'btn.go': 'Ir'}})` means `tables['ui']['pt-BR']['btn.go'] === 'Ir'`, and `useNamespace('ui').t(tk('btn.go'))` builds `ui:btn.go` → split → innerKey `btn.go` → matches. Reusable: any runtime namespace registration where the colon form is just a UX convention.

4. **`useNamespace.pluralize` must try base key BEFORE core-table fallback.** Without this, when `ns:cigano.mesa.one` and `ns:cigano.mesa.other` aren't seeded, the fallback goes to `coreT(locale, 'cigano.mesa')` which doesn't exist in the core table → returns the key string. The fix: try `ns:cigano.mesa` (no suffix) first, then core table. Reusable: any namespaced-translation engine with plural support.

5. **Worktree-isolated tsconfig (`types: []` + `allowImportingTsExtensions: true`) is the cycle 60-71 confirmed unlock.** No `@types/node` install needed; just declare the Intl / Date / process globals in `globs.d.ts`. Confirmed in cycle 71.

6. **`Intl.RelativeTimeFormat` is the canonical relative-time formatter for "X minutes ago" / "há X minutos" / "hace X" — no manual locale strings needed.** Node 22 native, zero deps.

7. **`Intl.ListFormat` handles "a, b e c" / "a, b, and c" / "a, b y c" without manual rules.** Confirmed cycle 71.

## File structure

```
cabaladoscaminhos-w71-i18n/
├── engines/
│   ├── i18n-core.ts               (304L)
│   ├── locales-pluralization.ts   (122L)
│   ├── formatting.ts              (173L)
│   └── namespaces.ts              (351L)
├── spec/
│   ├── i18n-core.spec.ts          (242L, 20 assertions)
│   ├── locales-pluralization.spec.ts (175L, 15 assertions)
│   ├── formatting.spec.ts         (267L, 34 assertions)
│   └── namespaces.spec.ts         (267L, 21 assertions)
├── smoke/
│   └── i18n-smoke.ts              (55L, aggregating runner)
├── globs.d.ts                     (40L, type-only Node globals)
├── tsconfig.json                  (18L, isolated strict)
├── package.json                   (12L, no deps)
└── DELIVERABLE.md
```

## Notes for verifier

- All engines use Node 22 native `Intl.*` — no external deps.
- Branded `TranslationKey` type prevents raw-string mistakes at TSC level.
- `setLocale(locale)` is module-scoped state; multi-tenant use requires caller-scoped instances (out-of-scope for cycle 71).
- `registerNamespace` mutations persist across the lifetime of the process; spec harness uses `resetNamespaces()` for isolation.
- `pluralize` auto-injects `{count}` into vars — caller can override by passing `{count: 99}` explicitly.
- Sacred tradition seeds use realistic terminology (e.g., `meio-do-céu` for MC, `odú de nascimento` for birth odú) — verified against cycle 70 numerology/cigano engine nomenclature.
- The smoke runner auto-imports and auto-runs each spec at module load (cycle 60+ pattern), then re-runs them in the `for` loop with fresh counters. Total assertions run: 180 (90 from auto-run + 90 from for loop), but the smoke aggregates only the for-loop run.

## Push verification

```bash
git config --global url."https://x-access-token:${GITHUB_TOKEN}@github.com/".insteadOf "https://github.com/"
git add -A
git commit -m "feat(w71): i18n-multilang-engine (PT-BR/EN/ES + plurals + formatting + 7 namespaces)"
git push origin HEAD
```

## Honest concerns

- **Branded `Locale` type at runtime**: `setLocale('fr-FR' as Locale)` throws (defensive). TypeScript catches wrong locales at compile time; runtime is defensive.
- **In-memory namespace store**: production use would back this with Prisma (cycle 60-70 pattern). Out-of-scope for cycle 71 pure-logic engine.
- **`Intl.DateTimeFormat` output varies by Node ICU build**: en-US `medium` style returns "Jun 30, 2026" on full ICU, may differ on small-icu builds. Spec uses `regex` matchers (`/jun/i.test(out)`) to be robust.
- **Locale state is module-scoped**: if multiple locale contexts are needed (e.g., per-request), the engine should be instantiated per-request. Out-of-scope for this cycle.