/**
 * ════════════════════════════════════════════════════════════════════════════
 * W86-C — LOCALE CONTEXT, PROVIDER & HOOK
 * ════════════════════════════════════════════════════════════════════════════
 *
 * React Context-based locale state. Wraps the translate() engine and exposes:
 *   - <LocaleProvider>      — top-level provider; reads localStorage at mount
 *   - useLocale()           — returns { locale, setLocale, t }
 *   - useT()                — convenience: just the t() function
 *
 * SSR-safety:
 *   - No top-level window/document access.
 *   - localStorage read happens inside useEffect (client-only).
 *   - On the server, the provider returns DEFAULT_LOCALE.
 *   - hydrate mismatch is handled by rendering DEFAULT_LOCALE first, then
 *     updating after mount — UI stays consistent.
 *
 * Persistence:
 *   - localStorage key = "cabala_locale".
 *   - Setter validates against isLocale() — invalid values are ignored.
 *   - Cross-tab sync via the `storage` event (cycle W76 pattern).
 *
 * Reusable: any client-side locale state with localStorage + cross-tab sync.
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { ReactElement } from 'react';
import { DEFAULT_LOCALE, isLocale, type Locale, type TranslationVars } from './types';
import { translate as translateImpl } from './translate';

const STORAGE_KEY = 'cabala_locale';

export interface LocaleContextValue {
  /** Current active locale. */
  locale: Locale;
  /** Imperative setter. Validates input; falls back to DEFAULT_LOCALE on bad input. */
  setLocale: (next: Locale) => void;
  /** Translation function — bound to current locale. */
  t: (key: string, vars?: TranslationVars) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export interface LocaleProviderProps {
  children: ReactNode;
  /** Optional default locale override. Mostly used in tests. */
  initial?: Locale;
}

/**
 * <LocaleProvider> — read localStorage ONCE on mount, then propagate via
 * context. Renders children immediately with DEFAULT_LOCALE to avoid SSR
 * mismatch; updates after hydration.
 */
export function LocaleProvider(props: LocaleProviderProps): ReactElement {
  const { children, initial } = props;
  const [locale, setLocaleState] = useState<Locale>(initial ?? DEFAULT_LOCALE);

  // Mount: read localStorage (browser only).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage?.getItem(STORAGE_KEY);
      if (raw && isLocale(raw)) {
        setLocaleState(raw);
      }
    } catch {
      // localStorage can throw in private mode — swallow silently.
    }
  }, []);

  // Cross-tab sync via `storage` event.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (e: StorageEvent): void => {
      if (e.key !== STORAGE_KEY) return;
      if (e.newValue && isLocale(e.newValue)) {
        setLocaleState(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setLocale = useCallback((next: Locale): void => {
    if (!isLocale(next)) return;
    setLocaleState(next);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage?.setItem(STORAGE_KEY, next);
      } catch {
        // private mode / quota — swallow.
      }
    }
  }, []);

  const t = useCallback(
    (key: string, vars?: TranslationVars): string => translateImpl(key, locale, vars),
    [locale],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/**
 * useLocale() — returns the locale context. Throws if used outside the
 * provider so devs catch the wiring bug at render time.
 */
export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale() called outside <LocaleProvider>');
  }
  return ctx;
}

/**
 * useT() — sugar for components that only need the translate function.
 */
export function useT(): (key: string, vars?: TranslationVars) => string {
  return useLocale().t;
}

/** Storage key export — used by LocaleSwitcher to clear on demand. */
export const LOCALE_STORAGE_KEY = STORAGE_KEY;
