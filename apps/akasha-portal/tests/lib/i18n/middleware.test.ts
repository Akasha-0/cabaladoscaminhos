import { describe, it, expect } from 'vitest';
import { defaultLocale, locales, type Locale } from '../../../src/i18n/config';

/** Mirror of the detection logic in middleware.ts (kept here to avoid
 *  importing the side-effectful middleware in the test runner). */
function detectLocale(cookieValue: string | undefined, acceptLanguage: string | undefined): Locale {
  if (cookieValue === 'en' || cookieValue === 'pt-BR') return cookieValue;
  if (acceptLanguage && acceptLanguage.toLowerCase().includes('en')) return 'en';
  return defaultLocale;
}

/** Mirror of the locale-redirect logic in middleware.ts — the part that
 *  decides whether the response should be a 307 to `/{locale}/...` or a
 *  pass-through. Kept dependency-free so we can unit-test it without
 *  spinning up Next. */
function shouldRedirect(
  pathname: string,
): { redirect: true; target: string } | { redirect: false } {
  const LOCALE_EXEMPT_PREFIXES = [
    '/_next',
    '/api',
    '/icons',
    '/fonts',
    '/sw.js',
    '/manifest.json',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/og-default.svg',
  ];
  const isLocaleExempt = LOCALE_EXEMPT_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (isLocaleExempt) return { redirect: false };

  const firstSegment = pathname.split('/')[1] ?? '';
  const hasLocalePrefix = (locales as readonly string[]).includes(firstSegment);
  if (hasLocalePrefix) return { redirect: false };

  return { redirect: true, target: pathname };
}

describe('i18n middleware locale detection (Doc 25 §9, v0.0.4-T9.14)', () => {
  it('config has pt-BR and en', () => {
    expect(locales).toEqual(['pt-BR', 'en']);
    expect(defaultLocale).toBe('pt-BR');
  });

  it('defaults to pt-BR when no cookie or Accept-Language', () => {
    expect(detectLocale(undefined, undefined)).toBe('pt-BR');
  });

  it('uses cookie NEXT_LOCALE=en when set', () => {
    expect(detectLocale('en', undefined)).toBe('en');
  });

  it('uses cookie NEXT_LOCALE=pt-BR when set', () => {
    expect(detectLocale('pt-BR', undefined)).toBe('pt-BR');
  });

  it('falls back to Accept-Language: en when no cookie', () => {
    expect(detectLocale(undefined, 'en-US,en;q=0.9')).toBe('en');
  });

  it('falls back to pt-BR when Accept-Language is pt or other', () => {
    expect(detectLocale(undefined, 'pt-BR,pt;q=0.9')).toBe('pt-BR');
  });

  it('cookie overrides Accept-Language (cookie wins)', () => {
    expect(detectLocale('pt-BR', 'en-US')).toBe('pt-BR');
  });

  it('ignores invalid cookie values (defaults to Accept-Language or pt-BR)', () => {
    expect(detectLocale('fr', 'en')).toBe('en');
    expect(detectLocale('fr', undefined)).toBe('pt-BR');
  });
});

describe('i18n middleware locale prefix redirect (Doc 25 §9, v0.0.4-T9.9)', () => {
  it('redirects root path to default locale', () => {
    const r = shouldRedirect('/');
    expect(r.redirect).toBe(true);
    expect(r.target).toBe('/');
  });

  it('redirects an unprefixed page path', () => {
    const r = shouldRedirect('/conta');
    expect(r.redirect).toBe(true);
    expect(r.target).toBe('/conta');
  });

  it('does NOT redirect an already-prefixed path', () => {
    expect(shouldRedirect('/pt-BR/conta').redirect).toBe(false);
    expect(shouldRedirect('/en/mandala').redirect).toBe(false);
    expect(shouldRedirect('/pt-BR').redirect).toBe(false);
  });

  it('does NOT redirect API routes', () => {
    expect(shouldRedirect('/api/akasha/auth/me').redirect).toBe(false);
    expect(shouldRedirect('/api/health').redirect).toBe(false);
  });

  it('does NOT redirect Next internals (/_next, /favicon.ico, etc.)', () => {
    expect(shouldRedirect('/_next/static/chunks/main.js').redirect).toBe(false);
    expect(shouldRedirect('/favicon.ico').redirect).toBe(false);
    expect(shouldRedirect('/sw.js').redirect).toBe(false);
    expect(shouldRedirect('/manifest.json').redirect).toBe(false);
  });

  it('does NOT redirect /icons or /fonts asset paths', () => {
    expect(shouldRedirect('/icons/icon-192.png').redirect).toBe(false);
    expect(shouldRedirect('/fonts/inter.woff2').redirect).toBe(false);
  });

  it('does NOT redirect /robots.txt or /sitemap.xml', () => {
    expect(shouldRedirect('/robots.txt').redirect).toBe(false);
    expect(shouldRedirect('/sitemap.xml').redirect).toBe(false);
  });

  it('does NOT infinite-loop on invalid locale prefix (only pt-BR and en count)', () => {
    // e.g. /fr/conta → first segment 'fr' is not a known locale → redirect.
    const r = shouldRedirect('/fr/conta');
    expect(r.redirect).toBe(true);
    expect(r.target).toBe('/fr/conta');
  });
});
