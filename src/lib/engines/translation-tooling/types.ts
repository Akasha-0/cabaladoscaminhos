/**
 * Translation Tooling — Type Definitions
 *
 * Pure type layer. Defines:
 *  - LocaleKey: union of supported locales
 *  - TranslationVars: shape for {var} interpolation values
 *  - Dictionary: deep-frozen record of key -> ICU-like template strings
 *  - PluralCategory: minimal plural form buckets (one | other)
 *  - Branded primitives: TranslationKey, LocaleTag
 *
 * Conventions:
 *  - All export values are deeply frozen via `Object.freeze` (called by callers).
 *  - Branded types prevent accidental mixing of string IDs across domains.
 *  - Keep this file free of runtime logic — types only.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Branded primitive types (zero-runtime cost)
// ─────────────────────────────────────────────────────────────────────────────

declare const __brand: unique symbol
export type Brand<TBase, TBrand extends string> = TBase & {
  readonly [__brand]: TBrand
}

/** Translation key — opaque to consumers, validated against the dictionary. */
export type TranslationKey = Brand<string, 'TranslationKey'>

/** Locale tag — must match one of the supported `LocaleKey` values after normalization. */
export type LocaleTag = Brand<string, 'LocaleTag'>

// ─────────────────────────────────────────────────────────────────────────────
// Locale types
// ─────────────────────────────────────────────────────────────────────────────

/** The set of locales with full native dictionaries. */
export type LocaleKey = 'pt-BR' | 'en' | 'es'

/** The fallback chain order. `pt-BR` is the source-of-truth. */
export const FALLBACK_CHAIN: ReadonlyArray<LocaleKey> = Object.freeze(['pt-BR', 'en', 'es'])

/** Plural categories — minimal impl (we only support `one` and `other`). */
export type PluralCategory = 'one' | 'other'

// ─────────────────────────────────────────────────────────────────────────────
// Dictionary shape
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Interpolation variables. Values are coerced via `String(v)` at format time.
 * Numbers are supported because pluralization requires numeric `count`.
 */
export type TranslationVars = Readonly<Record<string, string | number>>

/**
 * A dictionary is a flat record of translation-key → template string.
 * Templates may contain:
 *   - `{name}` simple interpolation
 *   - `{count, plural, one {...} other {...}}` ICU-lite plural form
 */
export type Dictionary = Readonly<Record<string, string>>

/** Result returned by `getDictionary`. Always frozen. */
export type FrozenDictionary = Readonly<Record<string, string>>

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers (types only, logic in translator.ts)
// ─────────────────────────────────────────────────────────────────────────────

/** Pattern matched by the mini plural-form parser. */
export interface PluralMatch {
  readonly one: string
  readonly other: string
}

/** Outcome of `translate()`. The `usedLocale` field exposes which locale served the value. */
export interface TranslateResult {
  readonly value: string
  readonly usedLocale: LocaleKey | null
  readonly missing: boolean
}