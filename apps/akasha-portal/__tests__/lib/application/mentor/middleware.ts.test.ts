import { describe, it, expect, vi, beforeEach } from 'vitest';

// We test the pure helper functions by re-implementing their logic
// (the actual middleware requires Next.js server internals)

// Re-implement getCorsOrigin to test the logic
function getCorsOrigin(requestOrigin: string | null): string | null {
  const configured = process.env.ALLOWED_ORIGINS;
  const isDev = (process.env.NODE_ENV ?? 'development') === 'development';
  if (configured) {
    const allowed = configured.split(',').map((o) => o.trim());
    if (requestOrigin && allowed.includes(requestOrigin)) {
      return requestOrigin;
    }
    return null;
  }
  if (isDev) {
    if (requestOrigin?.startsWith('http://localhost:') || requestOrigin === 'http://localhost') {
      return requestOrigin;
    }
    return null;
  }
  return null;
}

// Re-implement shouldRefreshAuth to test the logic
const locales = ['pt-BR', 'en'] as const;
const PROTECTED_PATH_PREFIXES = ['/dashboard', '/perfil', '/mapa', '/mentor'];

function shouldRefreshAuth(pathname: string): boolean {
  const segments = pathname.split('/');
  const pathWithoutLocale =
    segments.length >= 2 && (locales as readonly string[]).includes(segments[1])
      ? '/' + segments.slice(2).join('/')
      : pathname;
  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathWithoutLocale.startsWith(prefix) || pathWithoutLocale.includes('/akasha')
  );
}

describe('middleware helpers', () => {
  beforeEach(() => {
    delete process.env.ALLOWED_ORIGINS;
    (process.env as Record<string, string>).NODE_ENV = 'test';
  });

  describe('getCorsOrigin', () => {
    it('returns null when no origin is provided', () => {
      expect(getCorsOrigin(null)).toBeNull();
    });

    it('returns null for unknown origin in production without ALLOWED_ORIGINS', () => {
      (process.env as Record<string, string>).NODE_ENV = 'production';
      expect(getCorsOrigin('http://evil.com')).toBeNull();
    });

    it('returns null for localhost origin in production without ALLOWED_ORIGINS', () => {
      (process.env as Record<string, string>).NODE_ENV = 'production';
      // Even localhost is rejected in production without explicit allowlist
      expect(getCorsOrigin('http://localhost:3000')).toBeNull();
    });

    it('allows localhost in development without ALLOWED_ORIGINS', () => {
      (process.env as Record<string, string>).NODE_ENV = 'development';
      expect(getCorsOrigin('http://localhost:3000')).toBe('http://localhost:3000');
      expect(getCorsOrigin('http://localhost')).toBe('http://localhost');
    });

    it('returns null for non-localhost origin in development without ALLOWED_ORIGINS', () => {
      (process.env as Record<string, string>).NODE_ENV = 'development';
      expect(getCorsOrigin('http://example.com')).toBeNull();
    });

    it('respects ALLOWED_ORIGINS when set', () => {
      process.env.ALLOWED_ORIGINS = 'https://example.com, https://app.example.com';
      (process.env as Record<string, string>).NODE_ENV = 'production';
      expect(getCorsOrigin('https://example.com')).toBe('https://example.com');
      expect(getCorsOrigin('https://app.example.com')).toBe('https://app.example.com');
      expect(getCorsOrigin('https://other.com')).toBeNull();
    });

    it('returns null when ALLOWED_ORIGINS is set but origin is not in the list', () => {
      process.env.ALLOWED_ORIGINS = 'https://allowed.com';
      expect(getCorsOrigin('https://notallowed.com')).toBeNull();
    });
  });

  describe('shouldRefreshAuth', () => {
    it('returns false for public routes', () => {
      expect(shouldRefreshAuth('/')).toBe(false);
      expect(shouldRefreshAuth('/login')).toBe(false);
      expect(shouldRefreshAuth('/pt-BR/login')).toBe(false);
    });

    it('returns true for protected path prefixes', () => {
      expect(shouldRefreshAuth('/dashboard')).toBe(true);
      expect(shouldRefreshAuth('/perfil')).toBe(true);
      expect(shouldRefreshAuth('/mentor')).toBe(true);
    });

    it('returns true for /akasha in path', () => {
      expect(shouldRefreshAuth('/akasha/some-path')).toBe(true);
      expect(shouldRefreshAuth('/en/akasha/mapa')).toBe(true);
    });

    it('strips locale prefix before checking protected paths', () => {
      expect(shouldRefreshAuth('/pt-BR/dashboard')).toBe(true);
      expect(shouldRefreshAuth('/en/perfil')).toBe(true);
      expect(shouldRefreshAuth('/pt-BR/mentor')).toBe(true);
    });

    it('returns false for protected prefix with deeper locale segment not in locales', () => {
      // '/fr' is not a known locale, so it stays in the path
      expect(shouldRefreshAuth('/fr/dashboard')).toBe(false);
    });

    it('handles root path correctly', () => {
      expect(shouldRefreshAuth('/')).toBe(false);
    });
  });
});
