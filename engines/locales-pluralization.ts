/**
 * locales-pluralization.ts — CLDR plural rules (pt-BR / en / es)
 *
 * W71-A: W71-A i18n engine, sub-engine 2/4.
 *
 * Plural rules (simplified CLDR):
 *   pt-BR: 0..1 -> 'one', 2+ -> 'other'  (no 'many' / 'few')
 *   en:    1     -> 'one', 0/2+ -> 'other'
 *   es:    1     -> 'one', 2+   -> 'other'  (es has 'many' for 1e6+ but skipped per spec)
 *
 * Public API:
 *   - pluralize(locale, key, count, vars?)
 *   - getPluralForm(locale, count)
 *   - PluralKey type
 *
 * Key naming: pluralize derives `key.one` / `key.other` automatically
 * from the base `key` (no need to store `.one` / `.other` in i18n-core).
 */

// ────────────────────────────────────────────────────────────────────
// Imports
// ────────────────────────────────────────────────────────────────────

import { t, type Locale, type TranslationKey, interpolate } from './i18n-core.ts';

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────

export type PluralForm = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/** Source data: a translation that has both .one and .other forms. */
export type PluralKey = {
  readonly one: string;
  readonly other: string;
};

/** Build a PluralKey literal — typed-safe. */
export const pk = (one: string, other: string): PluralKey =>
  Object.freeze({ one, other });

// ────────────────────────────────────────────────────────────────────
// CLDR plural rules (per-locale)
// ────────────────────────────────────────────────────────────────────

/**
 * Get the plural form for a given locale + count.
 * CLDR-aligned simplified rules (using truncated integer count for consistency):
 *   - pt-BR: 0..1 -> 'one', 2+ -> 'other'
 *   - en:    1     -> 'one', 0/2+ -> 'other'
 *   - es:    1     -> 'one', 2+ -> 'other'
 */
export function getPluralForm(locale: Locale, count: number): PluralForm {
  // Defensive: handle NaN / Infinity (cycle 67 lesson: JSON.stringify(NaN) === 'null')
  if (!Number.isFinite(count)) return 'other';
  const truncated = Math.trunc(count);
  switch (locale) {
    case 'pt-BR':
      return Math.abs(truncated) <= 1 ? 'one' : 'other';
    case 'en':
      return truncated === 1 ? 'one' : 'other';
    case 'es':
      return truncated === 1 ? 'one' : 'other';
    default: {
      // Exhaustiveness check
      const _exhaustive: never = locale;
      void _exhaustive;
      return 'other';
    }
  }
}

/**
 * Pick the right pluralization key for a base key.
 * Convention: `key.one` / `key.other`.
 */
export function pickPluralKey(baseKey: string, form: PluralForm): string {
  if (form === 'one' || form === 'zero') return `${baseKey}.one`;
  return `${baseKey}.other`;
}

// ────────────────────────────────────────────────────────────────────
// Pluralize (uses i18n-core t() lookup)
// ────────────────────────────────────────────────────────────────────

/**
 * Resolve a pluralized translation. Uses t() under the hood with
 * `key.one` / `key.other` derived automatically.
 *
 * If `key.one` and `key.other` are not registered, falls back to `key`.
 */
export function pluralize(
  locale: Locale,
  key: TranslationKey,
  count: number,
  vars?: Readonly<Record<string, string | number>>,
): string {
  const form = getPluralForm(locale, count);
  const pluralKey = pickPluralKey(key as string, form);
  const merged: Record<string, string | number> = { ...(vars ?? {}), count };
  const resolved = t(locale, pluralKey as TranslationKey, merged);
  // If t() returned the unresolved key (lookup miss), try the base key.
  if (resolved === pluralKey) {
    return t(locale, key, merged);
  }
  return resolved;
}

// ────────────────────────────────────────────────────────────────────
// Bulk-pluralization helper for testing
// ────────────────────────────────────────────────────────────────────

/** Count of plural forms supported by this locale (always 2 for our simplified set). */
export function pluralFormCount(locale: Locale): number {
  void locale;
  return 2;
}

/** Get all forms for a locale (for spec coverage). */
export function allFormsForLocale(locale: Locale): PluralForm[] {
  void locale;
  return ['one', 'other'];
}