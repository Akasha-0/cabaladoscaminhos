// ============================================================================
// i18n/server — Server-side translation helper (Wave 19)
// ============================================================================
// Para uso em Server Components (metadata, generateMetadata, RSC que precisam
// de strings traduzidas sem client hydration). Lê o locale do cookie
// `akasha-locale` (escrito pelo middleware) e resolve chaves em PT-BR/EN/ES.
//
// NÃO usa React hooks. NÃO toca localStorage. NÃO dispara dynamic import.
// Para client components, prefira `useT()` em `@/lib/i18n/useT`.
// ============================================================================

import { ptBR } from './locales/pt-BR';
import { en } from './locales/en';
import { es } from './locales/es';

// Server-side: avoid importing from './index' (which has 'use client'
// directive) — would create a client boundary in a server module.
// Locale union type is duplicated intentionally; kept in sync via type tests.
export type Locale = 'pt-BR' | 'en' | 'es';

const TRANSLATIONS: Record<Locale, Record<string, unknown>> = {
  'pt-BR': ptBR as unknown as Record<string, unknown>,
  en: en as unknown as Record<string, unknown>,
  es: es as unknown as Record<string, unknown>,
};

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let value: unknown = obj;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return typeof value === 'string' ? value : undefined;
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

/**
 * Resolver de chaves em server components. Fallback em cascata:
 *   1. translations[locale][key]
 *   2. translations['pt-BR'][key]
 *   3. key literal
 *
 * Uso:
 *   const t = getTranslations('en');
 *   const title = t('home.titleAkasha'); // "Akasha"
 */
export function getTranslations(locale: Locale) {
  return function t(key: string, params?: Record<string, string | number>): string {
    const value = getNestedValue(TRANSLATIONS[locale], key);
    if (value !== undefined) {
      return interpolate(value, params);
    }
    const fallback = getNestedValue(TRANSLATIONS['pt-BR'], key);
    if (fallback !== undefined) {
      return interpolate(fallback, params);
    }
    return key;
  };
}

/**
 * Lê o cookie `akasha-locale` e retorna o locale resolvido.
 * Default: pt-BR.
 */
export async function getLocaleFromCookies(): Promise<Locale> {
  // Next.js 15+ — `cookies()` é async
  const { cookies } = await import('next/headers');
  const store = await cookies();
  const raw = store.get('akasha-locale')?.value;
  if (raw === 'en' || raw === 'es' || raw === 'pt-BR') return raw;
  return 'pt-BR';
}

/**
 * Helper para generateMetadata: retorna metadata com title/description
 * traduzidos a partir do locale do cookie.
 */
export async function getServerT() {
  const locale = await getLocaleFromCookies();
  return {
    locale,
    t: getTranslations(locale),
  };
}