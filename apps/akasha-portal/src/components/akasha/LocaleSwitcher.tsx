'use client';

// LocaleSwitcher — Doc 25 §9 / v0.0.4-T9
// Persists preference in `NEXT_LOCALE` httpOnly-incompatible cookie (client-readable).
// Reloads to apply since the i18n wiring is currently a stub.

import { useEffect, useState } from 'react';
import { defaultLocale, locales, type Locale } from '@/i18n/config';

function getCookieLocale(): Locale {
  if (typeof document === 'undefined') return defaultLocale;
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  const value = match?.[1] as Locale | undefined;
  return value && (locales as readonly string[]).includes(value) ? value : defaultLocale;
}

export function LocaleSwitcher() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    setLocale(getCookieLocale());
  }, []);

  const toggle = () => {
    const next: Locale = locale === 'pt-BR' ? 'en' : 'pt-BR';
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
    setLocale(next);
    if (typeof window !== 'undefined') window.location.reload();
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
