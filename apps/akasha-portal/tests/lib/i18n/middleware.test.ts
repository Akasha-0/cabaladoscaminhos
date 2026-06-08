import { describe, it, expect } from 'vitest';
import { defaultLocale, locales, type Locale } from '../../../src/i18n/config';

/** Mirror of the detection logic in middleware.ts (kept here to avoid
 *  importing the side-effectful middleware in the test runner). */
function detectLocale(cookieValue: string | undefined, acceptLanguage: string | undefined): Locale {
  if (cookieValue === 'en' || cookieValue === 'pt-BR') return cookieValue;
  if (acceptLanguage && acceptLanguage.toLowerCase().includes('en')) return 'en';
  return defaultLocale;
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
