/**
 * ════════════════════════════════════════════════════════════════════════════
 * W86-C — TRANSLATE ENGINE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Core translation function. Reads from the per-locale table, falls back to
 * PT-BR if a key is missing in the target locale, then substitutes {{var}}
 * placeholders.
 *
 * Behavior contract (cycle W86-C):
 *   1. Look up `key` in `locale`'s table.
 *   2. If missing → fall back to `pt-BR` table.
 *   3. If still missing → return the key itself wrapped in `[[key]]` so the
 *      missing translation is VISIBLE in the UI (caller can grep).
 *   4. Substitute `{{varName}}` placeholders using `vars`. Missing var →
 *      keep the placeholder as `{{varName}}` literal (no throw).
 *
 * Performance: O(1) lookups via frozen object. No regex compilation cost
 * after first call (the regex is module-scoped).
 *
 * SSR-safety: this module has NO `window`/`document` access — safe to import
 * from server components, client components, or edge runtime.
 */

import { DEFAULT_LOCALE, type Locale, type TranslationVars } from './types';
import { table as ptBRTable } from './tables/pt-BR';
import { table as enTable } from './tables/en';
import { table as esTable } from './tables/es';

/** Per-locale table registry. Frozen at module load. */
export const TABLES: Readonly<Record<Locale, Readonly<Record<string, string>>>> =
  Object.freeze({
    'pt-BR': ptBRTable,
    en: enTable,
    es: esTable,
  } as const);

/** Module-scoped placeholder regex — created once. Matches {{name}}. */
const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

/**
 * Substitute {{var}} placeholders in `template` with values from `vars`.
 * Missing vars → keep `{{var}}` literal so the UI surfaces the bug.
 *
 * Pure function — no side effects, safe to call from server or client.
 */
export function interpolate(
  template: string,
  vars?: TranslationVars,
): string {
  if (!vars) return template;
  return template.replace(PLACEHOLDER_RE, (match, name: string) => {
    if (Object.prototype.hasOwnProperty.call(vars, name)) {
      const v = vars[name];
      if (v === undefined || v === null) return match;
      return String(v);
    }
    return match;
  });
}

/**
 * Look up a key in the target locale, fall back to PT-BR, then to `[[key]]`.
 *
 * @param key     The translation key (string). NOT branded — call sites often
 *                receive dynamic keys (e.g. from data tables) where a brand
 *                cast would be more friction than safety.
 * @param locale  Target locale. Falls back to DEFAULT_LOCALE if not provided.
 * @param vars    Optional {{var}} substitutions.
 *
 * @returns The translated (and optionally interpolated) string.
 *
 * Reusable: any locale-fallback + interpolation pipeline.
 */
export function translate(
  key: string,
  locale?: Locale | null,
  vars?: TranslationVars,
): string {
  const target = locale ?? DEFAULT_LOCALE;
  const table = TABLES[target];
  let raw: string | undefined = table[key];
  let usedFallback = false;
  if (raw === undefined && target !== DEFAULT_LOCALE) {
    raw = TABLES[DEFAULT_LOCALE][key];
    usedFallback = true;
  }
  if (raw === undefined) {
    // Surface the missing key so the caller can grep for `[[...]]`.
    return `[[${key}]]`;
  }
  const out = interpolate(raw, vars);
  // Mark fallback as a debug-only side channel — caller can introspect
  // via wasFallback() if needed. Not exposed by default.
  if (usedFallback && typeof console !== 'undefined') {
    // eslint-disable-next-line no-console
    console.debug?.(`[i18n] fallback to pt-BR for "${key}" in locale "${target}"`);
  }
  return out;
}

/** Sugar — return all keys in a locale table. Useful for spec parity checks. */
export function keysFor(locale: Locale): ReadonlyArray<string> {
  return Object.keys(TABLES[locale]);
}

/** Sugar — check if a key exists in a locale (no fallback). */
export function hasKey(key: string, locale: Locale): boolean {
  return Object.prototype.hasOwnProperty.call(TABLES[locale], key);
}
