'use client';

import { useState, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';

const languages = [
  { code: 'pt-BR' as const, label: 'Português', flag: '🇧🇷' },
  { code: 'en' as const, label: 'English', flag: '🇺🇸' },
];

type Locale = 'pt-BR' | 'en';

export function LanguageSwitcher() {
  const [locale, setLocale] = useState<Locale>('pt-BR');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('locale') as Locale | null;
      if (stored === 'en' || stored === 'pt-BR') setLocale(stored);
    }
  }, []);

  const switchTo = (code: Locale) => {
    setLocale(code);
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', code);
    }
    setOpen(false);
  };

  const current = languages.find((l) => l.code === locale) ?? languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:text-amber-400 transition-colors"
        aria-label="Change language"
      >
        <Globe className="h-4 w-4" />
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-40 rounded-md border border-zinc-800 bg-zinc-900 py-1 shadow-lg z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchTo(lang.code)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <span>{lang.flag}</span>
                <span className="flex-1 text-left">{lang.label}</span>
                {locale === lang.code && <Check className="h-3.5 w-3.5 text-amber-400" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}