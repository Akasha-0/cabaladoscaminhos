'use client';

// LocaleSwitcher — Doc 25 §9 / v0.0.4-T9.10
// Persists preference in `NEXT_LOCALE` cookie (client-readable, non-httpOnly)
// and navigates to the same route under the new locale prefix
// (e.g. /pt-BR/conta → /en/conta) using Next.js router for a smooth SPA transition.
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { defaultLocale, locales, type Locale } from '@/i18n/config';

function getCookieLocale(): Locale {
  if (typeof document === 'undefined') return defaultLocale;
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  const value = match?.[1] as Locale | undefined;
  return value && (locales as readonly string[]).includes(value) ? value : defaultLocale;
}

/**
 * Strip the leading locale segment (if any) from a pathname.
 * `/pt-BR/conta` → `/conta`
 * `/en/mandala/sub` → `/mandala/sub`
 * `/conta` → `/conta`
 * `/` → `/`
 */
function stripLocale(pathname: string): string {
  const segments = pathname.split('/');
  // segments[0] is always '' (leading slash)
  if (segments.length > 1 && (locales as readonly string[]).includes(segments[1] ?? '')) {
    return '/' + segments.slice(2).join('/');
  }
  return pathname;
}

export function LocaleSwitcher() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const router = useRouter();
  const pathname = usePathname() ?? '/';

  useEffect(() => {
    setLocale(getCookieLocale());
  }, []);

  const toggle = () => {
    const next: Locale = locale === 'pt-BR' ? 'en' : 'pt-BR';
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
    setLocale(next);
    const rest = stripLocale(pathname);
    // Normalise: root + locale must point to a real page, not just '/'
    const target = rest === '/' || rest === '' ? `/${next}` : `/${next}${rest}`;
    router.push(target);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch language (current: ${locale})`}
      data-testid="locale-switcher"
      className="px-3 py-1.5 rounded-md text-sm font-medium border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
    >
      {locale === 'pt-BR' ? 'EN' : 'PT'}
    </button>
  );
}
