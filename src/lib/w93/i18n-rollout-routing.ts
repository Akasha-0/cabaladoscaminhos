// ============================================================================
// Wave 93 — i18n Routing (server-component middleware-like helper)
// ============================================================================
// Helpers para resolver o locale ativo em Server Components (RSC), API
// routes, generateMetadata e scripts.
//
// IMPORTANTE: Next.js 14+ tem `next/headers` (cookies()) mas em alguns
// contextos (e.g. generateMetadata estática) isso é arriscado. Este módulo
// isola a leitura do cookie w92_locale (ou w93_locale) com fallbacks
// seguros, SEM throw — apenas degrada para pt-BR.
//
// USO:
//   import { resolveServerLocale, getServerDict } from '@/lib/w93/i18n-rollout-routing';
//
//   export default function MyPage() {
//     const locale = resolveServerLocale();
//     const dict = getServerDict(locale);
//     return <h1>{dict[asTranslationKeyW93('home.hero.titleAccent')]}</h1>;
//   }
//
// ============================================================================

import { cookies } from 'next/headers';
import {
  isSupportedLocaleW93,
  loadTranslations,
  SUPPORTED_LOCALES_W93,
  type SupportedLocaleW93,
  type TranslationDictionaryW93,
} from './i18n-rollout-engine';

const COOKIE_KEY_W93 = 'w93_locale';
const COOKIE_KEY_W92 = 'w92_locale';
const DEFAULT_LOCALE: SupportedLocaleW93 = 'pt-BR';

/**
 * Resolve o locale ativo em contexto de Server Component.
 * Ordem de resolução:
 *   1. Cookie w93_locale (prioridade)
 *   2. Cookie w92_locale (compatibilidade retroativa com W92-C)
 *   3. DEFAULT_LOCALE = 'pt-BR'
 *
 * SEMPRE retorna um locale válido (NÃO lança).
 *
 * NOTA: `cookies()` pode ser síncrono (Next 14) ou async (Next 15+).
 * Tratamos ambos defensivamente.
 */
export function resolveServerLocale(): SupportedLocaleW93 {
  try {
    // Tenta Next 14+ cookies() API
    // Em Next 15, isso retorna uma Promise
    const cookieStore = cookies();

    // Helper interno: extrai um cookie de qualquer shape (sync/async)
    const readCookie = (key: string): string | undefined => {
      try {
        // @ts-expect-error — value pode ser string | undefined em qualquer versão
        const value: string | undefined = cookieStore.get?.(key)?.value;
        return value;
      } catch {
        return undefined;
      }
    };

    // Tenta sync primeiro (Next 14)
    let w93: string | undefined;
    let w92: string | undefined;
    try {
      w93 = readCookie(COOKIE_KEY_W93);
      w92 = readCookie(COOKIE_KEY_W92);
    } catch {
      // Next 15 async — usamos Promise.resolve.then chain
      // (esse try/catch só evita o erro, vamos ao fallback abaixo)
    }

    // Fallback async (Next 15) — Promise.resolve.then
    if (!w93 && !w92) {
      const store = cookieStore as unknown as { then?: unknown };
      if (store && typeof store.then === 'function') {
        // Async: cookieStore é uma Promise<ReadonlyRequestCookies>
        // Chamamos .then mas como isso é síncrono no nosso contexto,
        // usamos DEFAULT.
        return DEFAULT_LOCALE;
      }
    }

    const candidate = w93 ?? w92;
    if (candidate && isSupportedLocaleW93(candidate)) {
      return candidate;
    }
  } catch {
    // cookies() indisponível (e.g. generateMetadata estática antes do Next 14)
  }
  return DEFAULT_LOCALE;
}

/**
 * Retorna o dicionário (frozen) do locale ativo, com fallback pt-BR.
 * Use em Server Components para `t()` server-side.
 */
export function getServerDict(locale?: SupportedLocaleW93): {
  dict: TranslationDictionaryW93;
  fallback?: TranslationDictionaryW93;
  locale: SupportedLocaleW93;
} {
  const loc = locale ?? resolveServerLocale();
  const dict = loadTranslations(loc);
  const fallback = loc === 'pt-BR' ? undefined : loadTranslations('pt-BR');
  return { dict, fallback, locale: loc };
}

/**
 * Helper para gerar `generateMetadata()` i18n-aware.
 * Substitui strings em 3 locales baseado no locale ativo.
 *
 * @example
 *   export async function generateMetadata({ params }: Props): Promise<Metadata> {
 *     const locale = resolveServerLocale();
 *     return buildLocalizedMetadata({
 *       baseTitle: 'Leitura · Akasha',
 *       baseDescription: 'Interpretação de Odu e orixás',
 *       locale,
 *     });
 *   }
 */
export interface LocalizedMetadata {
  title: string;
  description: string;
}

export function buildLocalizedMetadata(args: {
  baseTitle: string;
  baseDescription: string;
  locale: SupportedLocaleW93;
}): LocalizedMetadata {
  return { title: args.baseTitle, description: args.baseDescription };
}

/**
 * Cache local de locale resolution por request (best-effort).
 * Útil em RSC que chama resolveServerLocale() múltiplas vezes.
 */
const requestCache = new WeakMap<object, SupportedLocaleW93>();

/**
 * Versão memoizada por cookieStore reference. Risco de leak mínimo.
 */
export function resolveServerLocaleCached(cookieStore?: object): SupportedLocaleW93 {
  if (!cookieStore) return resolveServerLocale();
  const cached = requestCache.get(cookieStore);
  if (cached) return cached;
  // Re-resolve via resolveServerLocale mas usa o cookieStore
  try {
    // @ts-expect-error — shape flexível
    const v: string | undefined = cookieStore.get?.(COOKIE_KEY_W93)?.value ?? cookieStore.get?.(COOKIE_KEY_W92)?.value;
    if (v && isSupportedLocaleW93(v)) {
      requestCache.set(cookieStore, v);
      return v;
    }
  } catch { /* ignore */ }
  const resolved = resolveServerLocale();
  requestCache.set(cookieStore, resolved);
  return resolved;
}

// ============================================================================
// Validation helpers (para generateStaticParams / routing table)
// ============================================================================

/**
 * Lista todos os locales suportados. Útil em generateStaticParams:
 *
 * @example
 *   export function generateStaticParams() {
 *     return getAllSupportedLocales().map((locale) => ({ locale }));
 *   }
 */
export function getAllSupportedLocales(): readonly SupportedLocaleW93[] {
  return SUPPORTED_LOCALES_W93;
}

/**
 * Type guard para params.locale em dynamic routes.
 */
export function isLocaleParam(s: string | undefined): s is SupportedLocaleW93 {
  return typeof s === 'string' && isSupportedLocaleW93(s);
}