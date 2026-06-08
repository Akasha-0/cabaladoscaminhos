// i18n configuration for Akasha Portal (Doc 25 §9, v0.0.4-T9)
export const locales = ['pt-BR', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'pt-BR';

export const localeLabels: Record<Locale, string> = {
  'pt-BR': 'Português (Brasil)',
  en: 'English',
};
