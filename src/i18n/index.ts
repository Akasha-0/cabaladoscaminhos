/**
 * ════════════════════════════════════════════════════════════════════════════
 * W86-C — i18n PUBLIC API
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Barrel export. Single import path for consumers:
 *   import { useLocale, useT, LocaleProvider, LocaleSwitcher, translate, ... } from '@/i18n';
 *
 * Stable surface — adding new exports requires updating this barrel.
 */

export type { Locale, TranslationKey, TranslationTable, TranslationVars, LocaleModule } from './types';
export {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  LOCALE_LABELS,
  isLocale,
} from './types';

export { translate, interpolate, TABLES, keysFor, hasKey } from './translate';

export {
  LocaleProvider,
  useLocale,
  useT,
  LOCALE_STORAGE_KEY,
  type LocaleContextValue,
  type LocaleProviderProps,
} from './useLocale';

export { LocaleSwitcher, type LocaleSwitcherProps } from './LocaleSwitcher';
