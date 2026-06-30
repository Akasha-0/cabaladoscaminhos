/**
 * Translation Tooling — Translator Engine
 *
 * Public API:
 *  - `translate(key, locale, vars?)` → formatted string (fallback chain)
 *  - `getDictionary(locale)` → frozen dictionary
 *  - `pluralRule(locale, n)` → 'one' | 'other'
 *
 * Pure functions only — no I/O, no module-level state, no globals.
 *
 * Fallback chain (when a key is missing):
 *   requested locale → en → pt-BR → '[[' + key + ']]'
 *
 * Templates supported:
 *   - `{name}` simple interpolation
 *   - `{count, plural, one {...} other {...}}` ICU-lite plural form
 */
import type {
  Dictionary,
  FrozenDictionary,
  LocaleKey,
  PluralCategory,
  TranslationVars,
} from './types.ts'
import { PT_BR } from './dictionaries/pt-BR.ts'
import { EN } from './dictionaries/en.ts'
import { ES } from './dictionaries/es.ts'

// ─────────────────────────────────────────────────────────────────────────────
// Internal registry — keyed by `LocaleKey`
// ─────────────────────────────────────────────────────────────────────────────

const REGISTRY: Readonly<Record<LocaleKey, Dictionary>> = Object.freeze({
  'pt-BR': PT_BR,
  en: EN,
  es: ES,
})

// ─────────────────────────────────────────────────────────────────────────────
// Locale normalization
// ─────────────────────────────────────────────────────────────────────────────

const LOCALE_ALIASES: Readonly<Record<string, LocaleKey>> = Object.freeze({
  'pt-br': 'pt-BR',
  pt: 'pt-BR',
  'pt_br': 'pt-BR',
  'pt-br-br': 'pt-BR',
  en: 'en',
  'en-us': 'en',
  'en-gb': 'en',
  'en-au': 'en',
  es: 'es',
  'es-es': 'es',
  'es-mx': 'es',
  'es-ar': 'es',
  'es-cl': 'es',
})

/**
 * Normalize an arbitrary locale string into one of the supported `LocaleKey`s.
 * Accepts loose inputs like 'pt-br', 'EN_US', 'es-mx'.
 * Falls back to 'pt-BR' (the source-of-truth) if unrecognized.
 */
export function normalizeLocale(input: string | null | undefined): LocaleKey {
  if (typeof input !== 'string' || input.length === 0) return 'pt-BR'
  const canonical = input.trim().toLowerCase().replace(/_/g, '-')
  const aliased = LOCALE_ALIASES[canonical]
  if (aliased !== undefined) return aliased
  // Bare language match: 'pt' → 'pt-BR' (already in alias map) — fallback.
  const base = canonical.split('-')[0]
  if (base !== undefined) {
    const baseAliased = LOCALE_ALIASES[base]
    if (baseAliased !== undefined) return baseAliased
  }
  return 'pt-BR'
}

// ─────────────────────────────────────────────────────────────────────────────
// Plural rules (minimal, locale-aware, no Intl dependency)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Minimal plural rule matching the project needs (no Intl dependency).
 *  - pt-BR: 0 and 1 → 'one'; anything else → 'other'
 *  - en:    1 → 'one'; anything else → 'other'
 *  - es:    1 → 'one'; anything else → 'other'
 */
export function pluralRule(locale: LocaleKey, n: number): PluralCategory {
  const absN = Math.abs(n)
  switch (locale) {
    case 'pt-BR':
      return absN === 0 || absN === 1 ? 'one' : 'other'
    case 'en':
    case 'es':
      return absN === 1 ? 'one' : 'other'
    default:
      return absN === 1 ? 'one' : 'other'
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Template formatters
// ─────────────────────────────────────────────────────────────────────────────

/** Strip whitespace and replacement-padding inside ICU-lite plural bodies. */
function trimBraces(s: string): string {
  return s.trim()
}

/**
 * Parse and apply the `{count, plural, one {A} other {B}}` mini-pattern.
 * Returns the original template if no match is found.
 *
 * Supports `#` inside the chosen branch to mean the count value.
 */
export function formatPlural(
  template: string,
  locale: LocaleKey,
  count: number,
): string {
  const re = /\{count,\s*plural,\s*one\s*\{([^}]*)\}\s*other\s*\{([^}]*)\}\}/
  const m = re.exec(template)
  if (m === null) return template
  const oneRaw = trimBraces(m[1] ?? '')
  const otherRaw = trimBraces(m[2] ?? '')
  const category = pluralRule(locale, count)
  const chosen = category === 'one' ? oneRaw : otherRaw
  return chosen.replace(/#/g, String(count))
}

/**
 * Apply `{var}` interpolation over `template`.
 * Unknown variables are left as literal `{var}` (visible to devs).
 */
export function interpolate(
  template: string,
  vars: TranslationVars | undefined,
): string {
  if (vars === undefined) return template
  return template.replace(/\{(\w+)\}/g, (full, key: string) => {
    const v = vars[key]
    if (v === undefined) return full
    return String(v)
  })
}

/**
 * Format a template string against locale + vars (after lookup).
 * Order of operations:
 *   1. Apply plural rule (replaces the plural block)
 *   2. Apply simple interpolation
 */
export function formatTemplate(
  template: string,
  locale: LocaleKey,
  vars: TranslationVars | undefined,
): string {
  let out = template
  if (vars !== undefined && Object.prototype.hasOwnProperty.call(vars, 'count')) {
    const countVal = Number(vars['count'])
    if (Number.isFinite(countVal)) {
      out = formatPlural(out, locale, countVal)
    }
  }
  out = interpolate(out, vars)
  return out
}

// ─────────────────────────────────────────────────────────────────────────────
// Dictionary access
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Return the frozen dictionary for a (normalized) locale.
 * If the locale is unknown, returns the PT-BR dictionary.
 */
export function getDictionary(locale: LocaleKey | string): FrozenDictionary {
  const norm = normalizeLocale(locale)
  const dict = REGISTRY[norm] ?? REGISTRY['pt-BR']
  return dict
}

/**
 * Return all loaded dictionaries keyed by normalized `LocaleKey`.
 * Useful for tooling/CLI/diagnostics.
 */
export function getAllDictionaries(): Readonly<Record<LocaleKey, FrozenDictionary>> {
  return REGISTRY
}

// ─────────────────────────────────────────────────────────────────────────────
// Lookup with fallback chain
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve `key` against the fallback chain:
 *   requested locale → en → pt-BR → '[[' + key + ']]'
 *
 * The fallback iterates over an explicit chain rather than recursing so
 * we can guarantee a deterministic order and a bounded walk (≤ 4 hops).
 */
export function translate(
  key: string,
  locale: LocaleKey | string,
  vars?: TranslationVars,
): string {
  const requested = normalizeLocale(locale)
  const chain: ReadonlyArray<LocaleKey> = [requested, 'en', 'pt-BR']
  for (const loc of chain) {
    const dict = REGISTRY[loc]
    const template = dict[key]
    if (typeof template === 'string') {
      return formatTemplate(template, loc, vars)
    }
  }
  return `[[${key}]]`
}

// ─────────────────────────────────────────────────────────────────────────────
// Diagnostics — small helpers for spec / smoke / tooling
// ─────────────────────────────────────────────────────────────────────────────

/** True iff every dictionary has the same set of keys (parity check). */
export function checkParity(): {
  readonly ok: boolean
  readonly missing: ReadonlyArray<{ locale: LocaleKey; key: string }>
} {
  const reference = REGISTRY['pt-BR']
  const missing: Array<{ locale: LocaleKey; key: string }> = []
  for (const loc of ['en', 'es'] as ReadonlyArray<LocaleKey>) {
    const dict = REGISTRY[loc]
    for (const key of Object.keys(reference)) {
      if (typeof dict[key] !== 'string') {
        missing.push({ locale: loc, key })
      }
    }
  }
  return { ok: missing.length === 0, missing }
}

/** Count of keys in a dictionary (handy for assertions). */
export function sizeOf(locale: LocaleKey): number {
  return Object.keys(REGISTRY[locale]).length
}