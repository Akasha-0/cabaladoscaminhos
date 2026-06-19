/**
 * i18n utility — lightweight translation lookup (Doc 25 §9, v0.84.10)
 *
 * Loads translation JSON files statically and provides dot-notation lookup.
 * No async loading at runtime — JSONs are bundled at build time.
 *
 * Usage:
 *   import { getTranslations, getLocaleFromHeader } from '@/lib/i18n';
 *   const t = getTranslations(locale, 'evolution');
 *   t('areas.vitalidadeEnergia');  // → 'Vitalidade' | 'Vitality'
 *   t('areas.descricao', { nome: 'Cabala' }); // interpolation supported
 */
import en from '@/i18n/en.json';
import ptBR from '@/i18n/pt-BR.json';

export const SUPPORTED_LOCALES = ['pt-BR', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const translations: Record<SupportedLocale, Record<string, unknown>> = {
  'pt-BR': ptBR,
  en,
};

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export function getTranslations(locale: string, _namespace?: string) {
  const safeLocale = isSupportedLocale(locale) ? locale : 'pt-BR';
  const dict = translations[safeLocale];

  return function t(key: string, params?: Record<string, string | number>): string {
    const parts = key.split('.');
    let result: unknown = dict;
    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = (result as Record<string, unknown>)[part];
      } else {
        return key; // fall back to the key itself
      }
    }
    let value = typeof result === 'string' ? result : key;
    if (params) {
      value = value.replace(/\{(\w+)\}/g, (_, k) =>
        Object.prototype.hasOwnProperty.call(params, k) ? String(params[k]) : `{${k}}`
      );
    }
    return value;
  };
}
