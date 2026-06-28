// ============================================================================
// i18n — Server-side translation helper (W20)
// ----------------------------------------------------------------------------
// Synchronous translator for use in React Server Components and `generateMetadata`
// where the client-only `useI18n()` / `useT()` hook is NOT available.
//
// Why this file exists:
//   - /workshops (page.tsx) and /workshops/[slug] (page.tsx) are RSCs.
//     They can't import the 'use client' `useI18n` from `./index`.
//   - The original W26 page shipped a stub `t(key, fallback) => fallback` that
//     did nothing — every key was hardcoded in PT-BR inline. W20 wires the
//     same `t(key, fallback)` calls to this helper so the page actually reads
//     from the locale dictionary.
//
// Scope:
//   - Reads from the static locale dictionaries (ptBR / en / es).
//   - Locale is detected from cookie (`akasha-locale`) with fallback to pt-BR.
//   - Synchronous: dictionaries are imported eagerly. Server bundle accepts
//     ~150 KB extra (3 locales × ~50 KB each) for predictable zero-latency lookup.
//   - No dynamic import (unlike `index.ts` which dynamically imports to keep
//     the client bundle small).
//
// Future:
//   - When the W19 `src/lib/i18n/server.ts` lands on main, this file can be
//     merged or replaced — they solve the same problem with overlapping APIs.
// ============================================================================

import { cookies, headers } from 'next/headers';
import { ptBR } from './locales/pt-BR';
import { en } from './locales/en';
import { es } from './locales/es';
import type { Locale } from './index';

/**
 * Map of locale code → dictionary. Synchronously accessible (server bundle).
 * Keys are nested objects; lookup uses dot-notation paths (e.g. "events.title").
 */
const DICTIONARIES: Record<Locale, Record<string, unknown>> = {
  'pt-BR': ptBR as unknown as Record<string, unknown>,
  en: en as unknown as Record<string, unknown>,
  es: es as unknown as Record<string, unknown>,
};

/**
 * Read the active locale from the `akasha-locale` cookie (set by middleware.ts
 * in W19) with fallback to pt-BR. Synchronous because cookies() is sync in
 * Next.js 14 (async in 15 — we use the await pattern for forward-compat).
 */
export async function getServerLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get('akasha-locale')?.value;
    if (value === 'pt-BR' || value === 'en' || value === 'es') {
      return value;
    }
  } catch {
    // Outside of a request context (build, generateStaticParams, etc.)
    // — fall through to header sniffing.
  }
  // Fallback: parse Accept-Language header (best-effort, no q-sort).
  try {
    const headerStore = await headers();
    const accept = headerStore.get('accept-language') ?? '';
    if (accept.startsWith('en')) return 'en';
    if (accept.startsWith('es')) return 'es';
  } catch {
    // No headers context — keep default.
  }
  return 'pt-BR';
}

/**
 * Lookup a nested value by dot-notation path.
 * Returns `undefined` if any segment is missing or the leaf is not a string.
 */
function getNested(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let cursor: unknown = obj;
  for (const key of keys) {
    if (cursor && typeof cursor === 'object' && key in (cursor as Record<string, unknown>)) {
      cursor = (cursor as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return typeof cursor === 'string' ? cursor : undefined;
}

/**
 * Tiny placeholder interpolation: replaces `{name}` with the matching param.
 * Unknown placeholders are left intact (e.g. `{missing}` stays literal).
 */
function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, key: string) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : `{${key}}`
  );
}

/**
 * Server-side translator. Looks up the key in the active locale; falls back to
 * pt-BR if missing; falls back to `defaultValue` if still missing.
 *
 * @example
 *   const locale = await getServerLocale();
 *   const t = makeT(locale);
 *   return <h1>{t('events.title', 'Workshops, Rituais e Círculos')}</h1>;
 */
export function makeT(locale: Locale) {
  const primary = DICTIONARIES[locale];
  const fallback = DICTIONARIES['pt-BR'];
  return function t(
    key: string,
    params?: Record<string, string | number>
  ): string {
    const primaryValue = getNested(primary, key);
    if (primaryValue !== undefined) return interpolate(primaryValue, params);
    const fallbackValue = getNested(fallback, key);
    if (fallbackValue !== undefined) return interpolate(fallbackValue, params);
    // Final fallback: return the key itself so missing translations are visible.
    return key;
  };
}

/**
 * Convenience: read the locale + return a ready `t(key, params?)` function.
 *
 * @example
 *   const t = await getServerT();
 *   const title = t('events.title', { count: 5 });
 */
export async function getServerT() {
  const locale = await getServerLocale();
  return makeT(locale);
}
