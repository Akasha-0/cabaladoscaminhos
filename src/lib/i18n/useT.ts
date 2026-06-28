// ============================================================================
// useT — Hook minimalista de tradução por chave (ex: useT('nav.home'))
// ============================================================================
// Wrapper fino sobre `useI18n()` que retorna SOMENTE a função `t`.
// Use este hook em componentes que só precisam de strings, não de
// trocar locale em runtime. Para troca de idioma, prefira `useI18n`.
//
// Exemplo:
//   const t = useT();
//   return <button>{t('nav.login')}</button>;
// ============================================================================

'use client';

import { useI18n } from './index';

/**
 * Retorna função `t(key, params?)` para o locale ativo.
 * Locale é resolvido pelo `useI18n()` pai (com fallback PT-BR).
 *
 * @example
 *   const t = useT();
 *   <h1>{t('feed.title')}</h1>
 */
export function useT() {
  const { t } = useI18n();
  return t;
}
