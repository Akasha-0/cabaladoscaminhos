/**
 * ════════════════════════════════════════════════════════════════════════════
 * W86-C — i18n TYPES
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Canonical type definitions for the Cabala dos Caminhos i18n engine.
 *
 * Sacred-cultural sensitivity (cycle W86-C):
 *   - The Locale union is intentionally narrow (PT-BR/EN/ES) — adding a
 *     new locale REQUIRES creating a full table under src/i18n/tables/<locale>.ts.
 *   - TranslationKey is a branded string type so typos at call sites are
 *     caught at compile time (the brand vanishes at runtime).
 *   - TranslationTable is keyed by string and frozen via Object.freeze at
 *     every export boundary (cycle 68 pattern).
 *
 * Reusable: any i18n engine that wants compile-time key safety + runtime
 * immutability, plus a discriminator-friendly table shape.
 */

/** All supported locales in Cabala dos Caminhos. */
export type Locale = 'pt-BR' | 'en' | 'es';

/** Ordered list — used by the LocaleSwitcher to render options in order. */
export const SUPPORTED_LOCALES: ReadonlyArray<Locale> = Object.freeze([
  'pt-BR',
  'en',
  'es',
] as const);

/** Default locale — used as fallback when a key is missing in target locale. */
export const DEFAULT_LOCALE: Locale = 'pt-BR';

/**
 * Human-readable display label for each locale.
 * Used by LocaleSwitcher. Sacred terms preserved as-is.
 */
export const LOCALE_LABELS: Readonly<Record<Locale, { readonly native: string; readonly flag: string; readonly aria: string }>> =
  Object.freeze({
    'pt-BR': Object.freeze({
      native: 'Portugues (Brasil)',
      flag: 'BR',
      aria: 'Portugues do Brasil',
    }),
    en: Object.freeze({
      native: 'English',
      flag: 'US',
      aria: 'English (United States)',
    }),
    es: Object.freeze({
      native: 'Espanol',
      flag: 'ES',
      aria: 'Espanol (Espana)',
    }),
  } as const);

/**
 * Branded TranslationKey — prevents accidental string concatenation at call
 * sites. Use `as TranslationKey` cast when the key is built dynamically.
 */
export type TranslationKey = string & { readonly __translationKeyBrand: unique symbol };

/**
 * The shape of a translation table. Every locale exports a TranslationTable.
 *
 * Values may contain {{var}} placeholders. The translate() function
 * substitutes them with values from vars (Record<string, string | number>).
 */
export type TranslationTable = Readonly<Record<string, string>>;

/** Optional variables passed to translate() for {{name}}-style interpolation. */
export type TranslationVars = Readonly<Record<string, string | number>>;

/**
 * Contract enforced by every locale module:
 *   - Each module MUST export a locale: Locale literal
 *   - Each module MUST export a table: TranslationTable
 *   - Each module MUST export a name: string for diagnostics
 */
export interface LocaleModule {
  readonly locale: Locale;
  readonly name: string;
  readonly table: TranslationTable;
}

/** Type guard — isLocale(x) narrows unknown to Locale. */
export function isLocale(x: unknown): x is Locale {
  return typeof x === 'string' && (SUPPORTED_LOCALES as ReadonlyArray<string>).includes(x);
}
