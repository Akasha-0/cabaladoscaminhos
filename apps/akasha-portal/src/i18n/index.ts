/**
 * @/i18n — client-safe translation module
 *
 * Exports:
 *   useTranslation() — React hook; locale defaults to 'pt-BR' (can be extended
 *                    with a locale context provider for runtime switching).
 *   getTranslations  — re-exported from @/lib/i18n for server-component use.
 */
import { getTranslations } from '@/lib/i18n';
import { useState } from 'react';

/** Default locale used by the useTranslation hook.
 * Extend with a LocaleContext provider if runtime locale switching is needed. */
const DEFAULT_LOCALE = 'pt-BR';

/**
 * Returns a translation function `t(key, params?)` for the default locale.
 * Signature is compatible with the react-i18next `useTranslation` hook pattern:
 *   const { t } = useTranslation();
 *   t('mandala.panels.kabala.title')  // → string
 */
export function useTranslation() {
  const [locale] = useState<string>(DEFAULT_LOCALE);
  return { t: getTranslations(locale) };
}

// Re-export getTranslations for server components
export { getTranslations };
