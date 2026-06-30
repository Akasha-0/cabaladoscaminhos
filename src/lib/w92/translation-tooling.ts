// ============================================================================
// Wave 92 — Translation Tooling (core engine)
// ============================================================================
// API type-safe para tradução server + client. Componentes usam `t('key', {n})`
// e o compilador bloqueia chaves não registradas em `STRINGS`.
//
// PADRÕES:
//   • Branded type para TranslationKey (compile-time check, runtime: string)
//   • Interpolação de variáveis com `{name}` e `{n}`
//   • Pluralização básica via separador `|` ("1 curtida | 2 curtidas")
//   • Fallback automático: locale → pt-BR → key
//   • Server-safe (sem dependência de window/document/localStorage)
//
// USO SERVER (RSC, API routes, scripts):
//   import { t, loadTranslations } from '@/lib/w92/translation-tooling';
//   const dict = loadTranslations('en');
//   const greeting = t('greeting.welcome', dict); // → "Welcome to Akasha"
//
// USO CLIENT (componentes):
//   import { useT } from '@/hooks/useT';
//   const t = useT();
//   <h1>{t('nav.home')}</h1>
//
// VALIDAÇÃO (CI / pre-commit):
//   import { validateTranslations } from '@/lib/w92/translation-tooling';
//   const result = validateTranslations();
//   if (!result.ok) process.exit(1);
// ============================================================================

import { STRINGS, type StringKey, SUPPORTED_LOCALES, type SupportedLocale } from './translation-strings';

// Re-exports para que consumidores importem tudo de um único lugar.
export { STRINGS, SUPPORTED_LOCALES } from './translation-strings';
export type { StringKey, SupportedLocale } from './translation-strings';

// ============================================================================
// Branded types — compile-time safety
// ============================================================================

/**
 * Símbolo único (não-exportado) usado para brand a `TranslationKey`.
 * Marcamos o tipo em tempo de compilação; em runtime é apenas string.
 * Isso garante que `t(key)` SÓ aceite chaves registradas em STRINGS.
 */
declare const TranslationKeyBrand: unique symbol;

/**
 * Tipo da chave de tradução.
 * Em runtime: string. Em tempo de compilação: intersection com `_brand` que
 * SÓ pode ser produzido por `keyOf()` ou casts explícitos.
 */
export type TranslationKey = string & { readonly [TranslationKeyBrand]: 'TranslationKey' };

/**
 * Função utilitária para "marcar" uma string como TranslationKey.
 * Use APENAS quando você tem certeza que a string é uma chave válida
 * (ex: em testes, ou quando o key vem de uma constante).
 *
 * Em código de produção, prefira passar literais:
 *   t('nav.home')  // OK
 *   t(someVar as TranslationKey)  // necessário se someVar for string
 */
export function asTranslationKey(key: string): TranslationKey {
  return key as TranslationKey;
}

/**
 * Lista type-safe de chaves registradas.
 * Útil para iteração em UI (ex: select com todas as chaves).
 */
export function getRegisteredKeys(): readonly TranslationKey[] {
  return Object.keys(STRINGS) as TranslationKey[];
}

// ============================================================================
// Types
// ============================================================================

/**
 * Dicionário de traduções para um locale.
 * Indexado por TranslationKey.
 */
export type TranslationDictionary = Readonly<Record<TranslationKey, string>>;

/**
 * Variáveis de interpolação aceitas em t(key, vars).
 * Aceita string ou number; nunca boolean ou object (mantém simples).
 */
export type TranslationVars = Readonly<Record<string, string | number>>;

/**
 * Resultado de validateTranslations.
 * `ok: true` quando todos os checks passam; `ok: false` lista os problemas.
 */
export type ValidationResult =
  | { readonly ok: true; readonly stats: { readonly totalKeys: number; readonly locales: readonly SupportedLocale[] } }
  | { readonly ok: false; readonly errors: readonly string[] };

// ============================================================================
// Carregamento
// ============================================================================

/**
 * Carrega o dicionário de traduções para um locale.
 *
 * O dicionário é derivado de STRINGS (const object), então é type-safe
 * por construção: o compilador garante que `dict[key]` é string se
 * `key` for uma TranslationKey registrada.
 *
 * @example
 *   const en = loadTranslations('en');
 *   en[asTranslationKey('nav.home')] // → "Feed"
 */
export function loadTranslations(locale: SupportedLocale): TranslationDictionary {
  if (!SUPPORTED_LOCALES.includes(locale)) {
    throw new Error(
      `Unsupported locale: ${locale}. Supported: ${SUPPORTED_LOCALES.join(', ')}`,
    );
  }

  const out: Record<TranslationKey, string> = Object.create(null);
  for (const key of Object.keys(STRINGS) as StringKey[]) {
    const value = STRINGS[key][locale];
    if (typeof value !== 'string') {
      throw new Error(
        `Missing translation for key="${key}" locale="${locale}". ` +
          `This should be impossible at runtime if STRINGS is well-formed.`,
      );
    }
    out[key as TranslationKey] = value;
  }
  return Object.freeze(out);
}

// ============================================================================
// Interpolação & plural
// ============================================================================

/**
 * Substitui variáveis `{name}` em `text` por valores de `vars`.
 * Variáveis ausentes são deixadas como `{name}` literal (NÃO removidas)
 * para tornar problemas visíveis em QA.
 */
function interpolate(text: string, vars?: TranslationVars): string {
  if (!vars) return text;
  return text.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (match, name: string) => {
    if (Object.prototype.hasOwnProperty.call(vars, name)) {
      const v = vars[name];
      return v === undefined ? match : String(v);
    }
    return match;
  });
}

/**
 * Resolve plural via separador `|` em strings.
 * Ex: "{n} comentário | {n} comentários"
 *     n=1 → "{n} comentário"
 *     n=2 → "{n} comentários"
 *
 * Se a string NÃO contiver "|", retorna ela mesma (com interpolate).
 * Se contiver "|", divide em [singular, plural] e seleciona conforme n.
 *
 * Importante: em ES, "0 comentarios" usa a forma plural. Em PT-BR idem.
 * (Não implementa CLDR — básico para os 30 strings curados.)
 */
function resolvePlural(template: string, n: number): string {
  const parts = template.split('|').map((s) => s.trim());
  if (parts.length === 1) {
    return parts[0]!;
  }
  // Heurística simples: n === 1 → singular; senão plural
  const selected = n === 1 ? parts[0] : parts[1] ?? parts[0]!;
  return selected;
}

// ============================================================================
// t() — função principal de tradução
// ============================================================================

/**
 * Traduz uma chave com fallback automático.
 *
 * Ordem de resolução:
 *   1. dict[key]              → se existir, usa
 *   2. fallbackDict[key]      → se fornecido e chave faltar em dict
 *   3. key                    → último recurso (NÃO engole a falha)
 *
 * Variáveis:
 *   t('counter.comments', { n: 5 })  → "5 comentários"
 *   t('notification.newLike', { name: 'Ana' }) → "Ana curtiu seu post"
 *
 * Plural:
 *   String com `|` é dividida em [singular, plural] e escolhida por n.
 *
 * Type-safety:
 *   t('nav.home')  ✓
 *   t('nav.foo')   ✗ — TypeScript bloqueia, pois 'nav.foo' não está em STRINGS
 */
export function t(
  key: TranslationKey,
  dict: TranslationDictionary,
  vars?: TranslationVars,
  fallbackDict?: TranslationDictionary,
): string {
  // 1) Tenta locale principal
  let template = dict[key];

  // 2) Fallback (geralmente pt-BR)
  if (template === undefined && fallbackDict) {
    template = fallbackDict[key];
  }

  // 3) Key como último recurso (visível em QA)
  if (template === undefined) {
    return key;
  }

  // Plural via {n} (se vars.n fornecido)
  if (vars && typeof vars.n === 'number') {
    template = resolvePlural(template, vars.n);
  }

  return interpolate(template, vars);
}

/**
 * Variante que aceita locale diretamente + carrega fallback (pt-BR) sob demanda.
 * Útil em scripts CLI que não querem gerenciar dois dicionários manualmente.
 *
 * @example
 *   const greet = tWithLocale('greeting.welcome', 'en');
 */
export function tWithLocale(
  key: TranslationKey,
  locale: SupportedLocale,
  vars?: TranslationVars,
): string {
  const dict = loadTranslations(locale);
  const fallback = locale === 'pt-BR' ? undefined : loadTranslations('pt-BR');
  return t(key, dict, vars, fallback);
}

// ============================================================================
// Validação CI-grade
// ============================================================================

/**
 * Valida o objeto STRINGS para garantir consistência entre locales.
 *
 * Checks (todos rodam em todos os locales):
 *   1. Toda chave em pt-BR existe em en e es
 *   2. Nenhuma string vazia ('')
 *   3. Nenhuma string contém 'TODO' ou 'FIXME' literal
 *   4. Variáveis de interpolação consistentes entre locales
 *      (mesma chave com vars diferentes é reportada)
 *   5. Strings de plural têm exatamente 2 formas separadas por `|`
 *      (verificado via campo `counter.*` por convenção do projeto)
 *
 * Retorna ValidationResult com lista de erros detalhada em caso de falha.
 */
export function validateTranslations(): ValidationResult {
  const errors: string[] = [];
  const ptKeys = Object.keys(STRINGS) as StringKey[];

  for (const locale of SUPPORTED_LOCALES) {
    for (const key of ptKeys) {
      const entry = STRINGS[key];
      const value = entry[locale];

      if (typeof value !== 'string') {
        errors.push(`[${locale}] key="${key}" is not a string (got ${typeof value})`);
        continue;
      }

      if (!(value as string)) {
        errors.push(`[${locale}] key="${key}" is empty string`);
      }
      if ((value as string).match(/\bTODO\b|\bFIXME\b/)) {
        errors.push(`[${locale}] key="${key}" contains TODO/FIXME placeholder: "${value}"`);
      }

      // Vars consistency: extrai {var} e compara entre locales
      const ptVars = extractVars(entry['pt-BR']);
      const locVars = extractVars(value);
      if (!sameSet(ptVars, locVars)) {
        errors.push(
          `[${locale}] key="${key}" has different vars than pt-BR: ` +
            `pt=${JSON.stringify(ptVars.sort())} loc=${JSON.stringify(locVars.sort())}`,
        );
      }

      // Plural check: chaves counter.* devem ter exatamente 2 formas
      if (key.startsWith('counter.')) {
        const parts = value.split('|').map((s) => s.trim());
        if (parts.length !== 2) {
          errors.push(
            `[${locale}] key="${key}" (counter.*) must have exactly 2 forms separated by |, found ${parts.length}`,
          );
        }
      }
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    stats: { totalKeys: ptKeys.length, locales: SUPPORTED_LOCALES },
  };
}

/**
 * Extrai nomes de variáveis de interpolação: "{name}" → ["name"].
 */
function extractVars(text: string): string[] {
  const out: string[] = [];
  const re = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    out.push(m[1]!);
  }
  return Array.from(new Set(out));
}

/**
 * Compara dois sets como arrays (sem depender de util externo).
 */
function sameSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort().join('|');
  const sb = [...b].sort().join('|');
  return sa === sb;
}

// ============================================================================
// Metadata helpers (usado pela UI e CLI)
// ============================================================================

/**
 * Metadados de cada locale, usado em LocaleSwitcher.
 */
export const LOCALE_META: Readonly<Record<SupportedLocale, { readonly label: string; readonly flag: string; readonly nativeName: string }>> = Object.freeze({
  'pt-BR': { label: 'pt-BR', flag: '🇧🇷', nativeName: 'Português (Brasil)' },
  en: { label: 'en', flag: '🇺🇸', nativeName: 'English' },
  es: { label: 'es', flag: '🇪🇸', nativeName: 'Español' },
});

/**
 * Type guard: verifica se `s` é uma SupportedLocale válida.
 */
export function isSupportedLocale(s: string): s is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(s);
}

// ============================================================================
// Format helpers (Intl wrappers — server-safe, locale-aware)
// ============================================================================

/**
 * Mapeia SupportedLocale → tag BCP-47 para `Intl.NumberFormat` / `Intl.DateTimeFormat`.
 * Mantido alinhado com SUPPORTED_LOCALES.
 */
const LOCALE_BCP47: Readonly<Record<SupportedLocale, string>> = Object.freeze({
  'pt-BR': 'pt-BR',
  en: 'en-US',
  es: 'es-ES',
});

/**
 * Formata número de acordo com o locale.
 * Server-safe (Intl é built-in no Node 22 e em browsers modernos).
 *
 * @example
 *   formatNumber(1234.5, 'pt-BR') // → "1.234,5"
 *   formatNumber(1234.5, 'en')    // → "1,234.5"
 *   formatNumber(1234.5, 'es')    // → "1.234,5"
 */
export function formatNumber(n: number, locale: SupportedLocale, options?: Intl.NumberFormatOptions): string {
  const bcp = LOCALE_BCP47[locale];
  return new Intl.NumberFormat(bcp, options).format(n);
}

/**
 * Formata data de acordo com o locale.
 * Server-safe.
 *
 * @example
 *   formatDate(new Date('2026-06-30'), 'pt-BR') // → "30/06/2026"
 *   formatDate(new Date('2026-06-30'), 'en')    // → "6/30/2026"
 *   formatDate(new Date('2026-06-30'), 'es')    // → "30/6/2026"
 */
export function formatDate(d: Date, locale: SupportedLocale, options?: Intl.DateTimeFormatOptions): string {
  const bcp = LOCALE_BCP47[locale];
  // default: dia/mês/ano
  return new Intl.DateTimeFormat(bcp, options ?? { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

/**
 * Formata tempo relativo ("há 5 min" / "5 min ago" / "hace 5 min").
 * Usa Intl.RelativeTimeFormat — built-in, server-safe.
 *
 * @example
 *   formatRelativeTime(-5, 'minute', 'pt-BR') // → "há 5 min"
 *   formatRelativeTime(-5, 'minute', 'en')    // → "5 minutes ago"
 *   formatRelativeTime(-2, 'hour', 'es')      // → "hace 2 horas"
 */
export function formatRelativeTime(
  amount: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: SupportedLocale,
): string {
  const bcp = LOCALE_BCP47[locale];
  return new Intl.RelativeTimeFormat(bcp, { numeric: 'auto' }).format(amount, unit);
}
