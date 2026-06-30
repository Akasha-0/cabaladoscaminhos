# DELIVERABLE — W83-D · Translation Tooling (cycle 83)

**Branch:** `w83/translation-tooling`
**Worktree:** `/tmp/w83-d`
**Worker session:** 414750161408105
**Parent session:** 414749504057454
**Date:** 2026-06-30

---

## Status

✅ **TSC:** 0 errors (isolated `tsconfig.w83-d.json`)
✅ **Spec:** 87/87 assertions PASS (self-running, no vitest)
✅ **Smoke:** 47/47 checks PASS
✅ **Total:** 134/134

**Push status:** see "Git" section below

---

## What was built

Pure-data translation engine for `pt-BR` / `en` / `es`. No React, no Next.js, no I/O.

```
src/lib/engines/translation-tooling/
├── types.ts                        — branded types + Dictionary / LocaleKey / TranslationVars
├── translator.ts                   — translate() / getDictionary() / pluralRule() / formatPlural()
├── dictionaries/
│   ├── pt-BR.ts                    — 50 keys (source-of-truth)
│   ├── en.ts                       — 50 keys (full parity)
│   └── es.ts                       — 50 keys (full parity)
├── index.ts                        — public barrel
└── translation-tooling.spec.ts     — 87 self-running assertions

scripts/smoke/translation-tooling.ts — 47 smoke checks
tsconfig.w83-d.json                 — isolated engine-only TS config
global.d.ts                          — minimal Node globals stub (no @types/node)
```

**LOC:** 1,531 lines across 10 files

---

## API surface

```ts
import {
  translate,           // (key, locale, vars?) → string  [fallback chain]
  getDictionary,       // (locale) → frozen dict
  getAllDictionaries,  // () → { 'pt-BR': ..., en: ..., es: ... }
  pluralRule,          // (locale, n) → 'one' | 'other'
  normalizeLocale,     // ('pt-br') → 'pt-BR'
  formatPlural,        // (template, locale, n) → formatted body
  interpolate,         // (template, vars) → interpolated string
  formatTemplate,      // (template, locale, vars) → plural + interpolate
  checkParity,         // () → { ok, missing[] }
  sizeOf,              // (locale) → key count
  PT_BR, EN, ES,       // frozen dicts (debug / CLI tools)
  FALLBACK_CHAIN,      // ['pt-BR', 'en', 'es']
} from '@/lib/engines/translation-tooling'
```

### Fallback chain

```
requested → en → pt-BR → '[[' + key + ']]'
```

Bounded to 3 hops + sentinel. Missing keys are visible to devs and greppable.

### Plural rule (no `Intl`)

| Locale | `one` | `other` |
|--------|-------|---------|
| pt-BR  | n ∈ {0, 1} | otherwise |
| en     | n == 1 | otherwise |
| es     | n == 1 | otherwise |

### Template syntax

- `{name}` — simple interpolation
- `{count, plural, one {1 carta} other {# cartas}}` — ICU-lite plural, `#` = count

---

## Constraints met

| Constraint | Status |
|------------|--------|
| TSC=0 on isolated tsconfig.w83-d.json | ✅ |
| Self-running spec (no vitest, no Intl) | ✅ |
| `Object.freeze` on every dictionary (deep) | ✅ |
| Branded types | ✅ (`TranslationKey`, `LocaleTag`) |
| Pure functions only (no side effects, no I/O) | ✅ |
| Locale normalization (pt-br → pt-BR, en-us → en) | ✅ |
| Missing key → `[[key]]` sentinel | ✅ |
| ≥ 50 keys per dictionary | ✅ (exactly 50 in each) |
| ≥ 30 spec assertions | ✅ (87) |
| ≥ 15 smoke checks | ✅ (47) |

---

## Self-running spec (87 assertions)

```
[translation-tooling.spec] 87/87 assertions passed
PASS
```

Sections:
1. `normalizeLocale` — 16 cases (canonical, lowercased, underscored, bare, nullish, unknown)
2. `translate()` direct hits — 6 cases (one per locale × key)
3. `translate()` fallback chain — 3 cases (sentinel for en / es / pt-BR missing)
4. `{var}` interpolation — 5 cases
5. Plural forms end-to-end — 8 cases (en/es/pt-BR × counts)
6. `pluralRule()` direct — 8 cases (boundaries 0/1/2/-1)
7. `formatPlural` / `interpolate` / `formatTemplate` — 7 cases
8. Dictionary access + parity — 14 cases
9. `FALLBACK_CHAIN` invariant — 3 cases
10. Missing-key sentinel contract — 3 cases
11. Locale string whitespace + mixed-case — 3 cases
12. Dictionary object identity / freeze — 4 cases
13. Translate with mixed-case locales — 3 cases
14. Sacred-content keys present — 4 cases

## Smoke harness (47 checks)

```
[smoke] 47/47 checks passed
PASS
```

Sections:
1. Engine entrypoint loads (6)
2. Dictionary size + freeze (8)
3. Cross-locale parity (3)
4. `translate()` canonical keys — UI chrome (11)
5. Plural pipeline end-to-end (6)
6. Missing-key sentinel (3)
7. `FALLBACK_CHAIN` invariant (5)
8. Locale normalization (4)
9. `getDictionary` shape (3)

---

## Git

```
$ git status
On branch w83/translation-tooling
nothing to commit, working tree clean
```

(See push confirmation in next section.)

---

## Notes for the verifier

1. **Run order:**
   ```bash
   cd /tmp/w83-d
   timeout 90 npx tsc --noEmit -p tsconfig.w83-d.json      # → 0 errors
   timeout 30 node --experimental-strip-types --no-warnings \
     src/lib/engines/translation-tooling/translation-tooling.spec.ts  # → 87/87 PASS
   timeout 30 node --experimental-strip-types --no-warnings \
     scripts/smoke/translation-tooling.ts                  # → 47/47 PASS
   ```

2. **`tsconfig.w83-d.json`** is isolated — only includes files under
   `src/lib/engines/translation-tooling/**`, the smoke script, and the global
   Node-globals stub. No React / Next.js types pulled in.

3. **`global.d.ts`** is a minimal stub for `process` / `console` so we don't
   need `@types/node` in this isolated config. Node.js provides these at
   runtime; the .d.ts only feeds the type checker.

4. **Plural pattern** uses `#` (ICU-lite) inside plural bodies — never
   `{count}` — to avoid nested-brace regex ambiguity. The chosen branch is
   computed first, then `#` is substituted with the actual count, then any
   remaining `{var}` interpolations are applied.

5. **Dictionary parity** is enforced by `checkParity()` and asserted in both
   spec and smoke. The three dictionaries have identical key sets (50 keys
   each). Sacred-content keys: `trad.candomble`, `trad.umbanda`, `trad.ifa`,
   `trad.cabala`, `trad.astrologia`, `trad.tantra`, `trad.cigano`,
   `trad.numerologia`, `trad.tarot`.

6. **Engine-only scope:** no React component, no Next.js route. This is a
   pure data + function library ready to be consumed by a UI layer in a
   later wave.

---

## Limitations / future work

- No ICU `=0`, `=2`, etc. exact-equality branches (only `one` / `other`).
- No nested plural (`{count, plural, other {{gender, select, ...}}}`).
- No RTL / bidi handling (out of scope).
- No message-format compiler (we regex-parse templates; a real i18n
  pipeline would use `intl-messageformat` or similar).

These limitations match the wave's "minimal but correct" scope.