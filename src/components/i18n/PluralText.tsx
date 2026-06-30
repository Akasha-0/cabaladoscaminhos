// ============================================================================
// PluralText — Renderiza plural via CLDR (Intl.PluralRules) + strings i18n
// ============================================================================
// Wrapper que recebe uma chave singular + chave plural + n, e renderiza a
// string correta baseada no locale ativo.
//
// COMPORTAMENTO:
//   • Usa Intl.PluralRules (CLDR-correct) para selecionar a forma.
//   • Suporta variáveis extras via prop `vars` (merged com {n}).
//   • Hidrata no client (não quebra SSR) — renderiza com pt-BR fallback.
//   • Memoiza o plural rules instance por locale (performance).
//
// USO:
//   <PluralText
//     singularKey="counter.readings"
//     pluralKey="counter.readingsPlural"
//     n={5}
//     vars={{ orixa: 'Ogum' }}
//   />
//
// Ou com t() direto (interpolação {n}):
//   <PluralText n={5}>{t('counter.practitionersWithCount')}</PluralText>
// ============================================================================

'use client';

import { useMemo } from 'react';
import { useT } from '@/hooks/useT';
import {
  asTranslationKeyW93,
  loadTranslations,
  pluralRules,
  type SupportedLocaleW93,
  type TranslationKeyW93,
} from '@/lib/w93/i18n-rollout-engine';
import { cn } from '@/lib/utils';

export interface PluralTextProps {
  /** Chave singular (CLDR category 'one'/'zero'). */
  singularKey: TranslationKeyW93 | string;
  /** Chave plural (CLDR category 'few'/'many'/'other'). */
  pluralKey: TranslationKeyW93 | string;
  /** Contagem — base da decisão plural. */
  n: number;
  /** Variáveis adicionais (merge com {n}). */
  vars?: Readonly<Record<string, string | number>>;
  /** Classes extras. */
  className?: string;
  /** Tag HTML (default: 'span'). */
  as?: 'span' | 'p' | 'div' | 'li';
}

/**
 * Resolve a string usando CLDR rules + dicionário do locale ativo.
 */
function resolvePlural(
  singularKey: string,
  pluralKey: string,
  n: number,
  locale: SupportedLocaleW93,
  vars: Readonly<Record<string, string | number>> = {},
): string {
  const dict = loadTranslations(locale);
  const fallback = locale === 'pt-BR' ? undefined : loadTranslations('pt-BR');
  const category = pluralRules.select(n, locale);
  const key = category === 'one' || category === 'zero' ? singularKey : pluralKey;

  let template: string | undefined = dict[asTranslationKeyW93(key)];
  if (template === undefined && fallback) {
    template = fallback[asTranslationKeyW93(key)];
  }
  if (template === undefined) return key;

  // Interpolação de vars + {n}
  const merged: Record<string, string | number> = { ...vars, n };
  return template.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (match, name: string) => {
    if (Object.prototype.hasOwnProperty.call(merged, name)) {
      const v = merged[name];
      return v === undefined ? match : String(v);
    }
    return match;
  });
}

export function PluralText({
  singularKey,
  pluralKey,
  n,
  vars,
  className,
  as = 'span',
}: PluralTextProps) {
  const { locale, hydrated } = useT();

  // Memoiza a string renderizada por (locale, n, vars)
  const text = useMemo(() => {
    const activeLocale = hydrated ? locale : 'pt-BR';
    return resolvePlural(singularKey, pluralKey, n, activeLocale, vars);
  }, [locale, hydrated, singularKey, pluralKey, n, vars]);

  const Tag = as;
  return <Tag className={cn(className)}>{text}</Tag>;
}