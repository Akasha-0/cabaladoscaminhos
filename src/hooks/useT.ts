// ============================================================================
// useT — Hook de tradução client-side para Wave 92 tooling
// ============================================================================
// Wrapper sobre `@/lib/w92/translation-tooling` que mantém o dicionário
// no estado do componente e re-renderiza quando o locale muda.
//
// COMPORTAMENTO:
//   • Estado inicial: 'pt-BR' (padrão do projeto) — re-hidrata de
//     localStorage no useEffect client-side.
//   • Fallback gracioso: se uma chave não existir no locale ativo,
//     tenta pt-BR; depois retorna a própria chave (visível em QA).
//   • 'use client' — só roda no browser.
//
// IMPORTANTE: NÃO usar este hook em Server Components. Para RSC, importe
// `t` e `loadTranslations` de `@/lib/w92/translation-tooling` direto.
//
// Exemplo de uso:
//   'use client';
//   import { useT } from '@/hooks/useT';
//
//   export function MyButton() {
//     const t = useT();
//     return <button>{t('button.publish')}</button>;
//   }
// ============================================================================

'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  t as tCore,
  loadTranslations,
  asTranslationKey,
  isSupportedLocale,
  LOCALE_META,
  type SupportedLocale,
  type TranslationKey,
  type TranslationDictionary,
  type TranslationVars,
} from '@/lib/w92/translation-tooling';

const STORAGE_KEY = 'w92.locale';
const COOKIE_KEY = 'w92_locale';
const DEFAULT_LOCALE: SupportedLocale = 'pt-BR';

/**
 * Seta/limpa um cookie client-side (best-effort, sem dependência de lib).
 * Usado para que o server possa ler o locale em RSC subsequentes.
 */
function writeCookie(locale: SupportedLocale): void {
  if (typeof document === 'undefined') return;
  // 1 ano, path=/
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${COOKIE_KEY}=${locale}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Lê locale persistido: localStorage > cookie > DEFAULT.
 * SSR-safe: retorna DEFAULT em server.
 */
function readPersistedLocale(): SupportedLocale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const fromStorage = window.localStorage.getItem(STORAGE_KEY);
    if (fromStorage && isSupportedLocale(fromStorage)) {
      return fromStorage;
    }
  } catch {
    // localStorage indisponível (modo privado, etc.) — silenciar.
  }
  // Cookie como fallback
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`));
    if (match && match[1] && isSupportedLocale(match[1])) {
      return match[1];
    }
  }
  return DEFAULT_LOCALE;
}

/**
 * Hook principal. Retorna:
 *   • `t`         — função de tradução (key, vars?) => string
 *   • `locale`    — locale ativo
 *   • `setLocale` — setter (persiste em localStorage + cookie)
 *   • `availableLocales` — array de locales suportados
 *   • `meta`      — metadados (label, flag, nativeName) por locale
 */
export function useT() {
  const [locale, setLocaleState] = useState<SupportedLocale>(DEFAULT_LOCALE);
  const [hydrated, setHydrated] = useState(false);

  // Re-hidrata locale do localStorage/cookie no mount
  useEffect(() => {
    const persisted = readPersistedLocale();
    setLocaleState(persisted);
    setHydrated(true);
  }, []);

  // Dicionários memoizados: ativo + fallback (pt-BR)
  const dict = useMemo<TranslationDictionary>(() => loadTranslations(locale), [locale]);
  const fallbackDict = useMemo<TranslationDictionary | undefined>(
    () => (locale === 'pt-BR' ? undefined : loadTranslations('pt-BR')),
    [locale],
  );

  /**
   * Setter que persiste em localStorage + cookie antes de mudar estado.
   */
  const setLocale = useCallback((next: SupportedLocale) => {
    if (!isSupportedLocale(next)) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // silenciar
    }
    writeCookie(next);
    setLocaleState(next);
  }, []);

  /**
   * Função de tradução client-side.
   * Aceita tanto TranslationKey quanto string (que será marcada).
   */
  const t = useCallback(
    (key: TranslationKey | string, vars?: TranslationVars): string => {
      const k = typeof key === 'string' ? asTranslationKey(key) : key;
      return tCore(k, dict, vars, fallbackDict);
    },
    [dict, fallbackDict],
  );

  return {
    t,
    locale,
    setLocale,
    hydrated,
    availableLocales: Object.keys(LOCALE_META) as SupportedLocale[],
    meta: LOCALE_META,
  };
}
