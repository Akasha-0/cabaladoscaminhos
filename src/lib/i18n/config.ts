/**
 * i18n config — stub leve para migração futura ao next-intl
 *
 * Doc 25 §11 / Onda 3.5 — Roadmap de i18n.
 *
 * Por enquanto, este módulo provê:
 * - Lista de locales suportados
 * - Detecção de locale via header Accept-Language
 * - Função `getMessages(locale)` que retorna o dicionário correto
 *
 * Para ativar next-intl 100%:
 * 1. `npm install next-intl`
 * 2. Mover `messages/` para `src/messages/` (estrutura do next-intl)
 * 3. Adicionar `createNextIntlPlugin` em `next.config.js`
 * 4. Criar `src/middleware.ts` para detectar locale via URL (`/pt-BR/...`, `/en/...`)
 * 5. Refatorar componentes para usar `useTranslations` e `getTranslations`
 *
 * Já existem os dicionários `messages/pt-BR.json` e `messages/en.json` com
 * as chaves canônicas. Esta configuração é compatível com next-intl quando
 * instalado.
 */

export const SUPPORTED_LOCALES = ['pt-BR', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'pt-BR';

/** Detecção simples de locale via Accept-Language. */
export function detectLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  // Suporta formatos: "en", "en-US", "pt-BR", "pt"
  const lower = acceptLanguage.toLowerCase();
  if (lower.includes('en') && !lower.includes('pt')) return 'en';
  return DEFAULT_LOCALE;
}

/** Carrega o dicionário de mensagens do locale solicitado. */
export function getMessages(locale: Locale): Record<string, unknown> {
  // Esta função é substituível por `getMessages` do next-intl quando instalado.
  // Usa fs.readFileSync para evitar problemas de path resolution do `require()`
  // em diferentes bundlers (jest/vitest/Next).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs') as typeof import('fs');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('path') as typeof import('path');

  const rel = locale === 'en' ? 'messages/en.json' : 'messages/pt-BR.json';
  const fullPath = path.join(process.cwd(), rel);

  try {
    const raw = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    // Fallback em memória mínima para evitar crash em build
    return { common: { appName: 'Cabala dos Caminhos' } };
  }
}

/**
 * Helper de tradução simples (use enquanto componentes não migram para
 * `useTranslations`). Aceita dot-path: `t('nav.mandala')`.
 */
export function makeT(messages: Record<string, unknown>) {
  return function t(key: string, vars?: Record<string, string | number>): string {
    const parts = key.split('.');
    let cur: unknown = messages;
    for (const part of parts) {
      if (cur && typeof cur === 'object' && part in (cur as object)) {
        cur = (cur as Record<string, unknown>)[part];
      } else {
        return key; // chave não encontrada — retorna o dot-path como fallback
      }
    }
    if (typeof cur !== 'string') return key;
    if (!vars) return cur;
    // Interpola {varName} (suporta ICU simples — não cobre plural/select)
    return cur.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`));
  };
}
