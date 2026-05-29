'use client';

import { useState, useEffect } from 'react';

export type Locale = 'pt-BR' | 'en';

export const availableLocales: Locale[] = ['pt-BR', 'en'];

const translations: Record<Locale, Record<string, string>> = {
  'pt-BR': {},
  en: {},
};

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let value: unknown = obj;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return typeof value === 'string' ? value : undefined;
}

function interpolate(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

function createI18n(initialLocale: Locale) {
  let currentLocale = initialLocale;
  const listeners: Set<() => void> = new Set();

  const notify = () => listeners.forEach((fn) => fn());

  const setLocale = (locale: Locale) => {
    if (locale !== currentLocale && availableLocales.includes(locale)) {
      currentLocale = locale;
      if (typeof window !== 'undefined') {
        localStorage.setItem('locale', locale);
      }
      notify();
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const value = getNestedValue(translations[currentLocale] as unknown as Record<string, unknown>, key);
    if (value !== undefined) {
      return interpolate(value, params);
    }
    const fallback = getNestedValue(translations['pt-BR'] as unknown as Record<string, unknown>, key);
    if (fallback !== undefined) {
      return interpolate(fallback, params);
    }
    return key;
  };

  return {
    get locale() {
      return currentLocale;
    },
    setLocale,
    t,
    subscribe: (fn: () => void) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

type I18nInstance = ReturnType<typeof createI18n>;

let i18nInstance: I18nInstance | null = null;
let initializationPromise: Promise<I18nInstance> | null = null;

async function getI18n(): Promise<I18nInstance> {
  if (i18nInstance) return i18nInstance;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    let initialLocale: Locale = 'pt-BR';

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('locale') as Locale | null;
      if (stored && availableLocales.includes(stored)) {
        initialLocale = stored;
      }
    }

    const { ptBR } = await import('./locales/pt-BR');
    const { en } = await import('./locales/en');

    translations['pt-BR'] = ptBR;
    translations.en = en;

    i18nInstance = createI18n(initialLocale);
    return i18nInstance;
  })();

  return initializationPromise;
}

export function useI18n() {
  const [i18n, setI18n] = useState<I18nInstance | null>(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    getI18n().then((instance) => {
      setI18n(instance);
     instance.subscribe(() => forceUpdate(0));
    });
  }, []);

  if (!i18n) {
    return {
      locale: 'pt-BR' as Locale,
      setLocale: () => {},
      t: (key: string) => key,
      availableLocales,
    };
  }

  return {
    locale: i18n.locale,
    setLocale: i18n.setLocale,
    t: i18n.t,
    availableLocales,
  };
}

export const i18n = {
  locale: 'pt-BR' as Locale,
  setLocale: (_locale: Locale) => {},
  t: (key: string) => key,
  availableLocales,
};