// ============================================================================
// i18n-demo — Página de demonstração do Wave 92 translation tooling
// ============================================================================
// Mostra todas as 30 strings curadas em PT-BR (server) + embed do
// LocaleSwitcher (client) para o usuário ver EN/ES ao vivo.
//
// COMO USAR:
//   1. Acesse /i18n-demo
//   2. Veja as 30 strings em PT-BR (renderizadas no server)
//   3. Clique em EN/ES no LocaleSwitcher para trocar ao vivo
//   4. As 30 strings re-renderizam no client (mesma fonte STRINGS)
// ============================================================================

import type { Metadata } from 'next';
import { LocaleSwitcher } from '@/components/i18n/LocaleSwitcher';
import {
  loadTranslations,
  t as tCore,
  asTranslationKey,
  STRINGS as _STRINGS_TYPES_ONLY,
  type SupportedLocale,
} from '@/lib/w92/translation-tooling';
import { getRegisteredKeys } from '@/lib/w92/translation-tooling';

export const metadata: Metadata = {
  title: 'i18n Demo · Akasha',
  description:
    'Demonstração do tooling de tradução W92 — 30 strings curadas em PT-BR, EN e ES com termos sagrados preservados.',
};

// Impede pre-render estático para que o cookie seja respeitado em RSC.
export const dynamic = 'force-dynamic';

const DEFAULT_LOCALE: SupportedLocale = 'pt-BR';

/**
 * Renderiza UMA string no server. Mostra a chave + valor, útil pra QA
 * visual ("qual é a string por trás de 'greeting.welcome'?").
 */
function StringRow({ k, locale, dict, fallback }: {
  k: string;
  locale: SupportedLocale;
  dict: ReturnType<typeof loadTranslations>;
  fallback?: ReturnType<typeof loadTranslations>;
}) {
  // Renderiza em todos os 3 locales (mostra a diferença lado a lado)
  const ptDict = locale === 'pt-BR' ? dict : loadTranslations('pt-BR');
  const enDict = locale === 'en' ? dict : loadTranslations('en');
  const esDict = locale === 'es' ? dict : loadTranslations('es');

  const key = asTranslationKey(k);
  const pt = tCore(key, ptDict, undefined, fallback);
  const en = tCore(key, enDict, undefined, fallback);
  const es = tCore(key, esDict, undefined, fallback);

  return (
    <div className="border-b border-border py-3 grid grid-cols-1 md:grid-cols-4 gap-2">
      <code className="text-xs text-muted-foreground font-mono break-all">{k}</code>
      <span className="text-sm">🇧🇷 {pt}</span>
      <span className="text-sm">🇺🇸 {en}</span>
      <span className="text-sm">🇪🇸 {es}</span>
    </div>
  );
}

export default function I18nDemoPage() {
  // Server-side: lê locale do cookie (se houver) ou usa default
  // NOTA: numa próxima iteração, usar `cookies()` do next/headers.
  const locale: SupportedLocale = DEFAULT_LOCALE;
  const dict = loadTranslations(locale);
  const fallback = locale === 'pt-BR' ? undefined : loadTranslations('pt-BR');

  const keys = getRegisteredKeys();

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-8 md:px-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          {tCore(asTranslationKey('greeting.welcome'), dict, undefined, fallback)}
        </h1>
        <p className="text-muted-foreground mb-4">
          Wave 92 — Translation Tooling • {keys.length} strings × 3 locales
        </p>
        <LocaleSwitcher label="Idioma ativo" />
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Tabela de strings (PT-BR fonte da verdade)</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Cada linha mostra a mesma chave nos três locales. Termos sagrados
          (orixás, axé, entidades, Odu) são preservados verbatim em todos eles.
        </p>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 border-b border-border pb-2 mb-2 text-xs font-semibold text-muted-foreground">
            <span>Key</span>
            <span>pt-BR</span>
            <span>en</span>
            <span>es</span>
          </div>
          {keys.map((k) => (
            <StringRow
              key={k}
              k={k}
              locale={locale}
              dict={dict}
              fallback={fallback}
            />
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Plurais em ação</h2>
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          {[0, 1, 2, 5, 42].map((n) => (
            <p key={n} className="text-sm">
              <span className="font-mono text-muted-foreground">n={n}:</span>{' '}
              {tCore(asTranslationKey('counter.comments'), dict, { n }, fallback)}
              {' • '}
              {tCore(asTranslationKey('counter.likes'), dict, { n }, fallback)}
              {' • '}
              {tCore(asTranslationKey('counter.unreadNotifications'), dict, { n }, fallback)}
            </p>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Termos sagrados preservados</h2>
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <p className="text-sm">
            <span className="font-mono text-muted-foreground">tradition.oduPrompt:</span>{' '}
            {tCore(asTranslationKey('tradition.oduPrompt'), dict, undefined, fallback)}
          </p>
          <p className="text-sm">
            <span className="font-mono text-muted-foreground">tradition.orixaGreeting:</span>{' '}
            {tCore(asTranslationKey('tradition.orixaGreeting'), dict, undefined, fallback)}
          </p>
          <p className="text-xs text-muted-foreground italic mt-3">
            "orixás" mantém a grafia portuguesa em todos os 3 locales.
            "axé" também. Nenhuma anglicização foi aplicada.
          </p>
        </div>
      </section>

      <footer className="text-xs text-muted-foreground mt-12 pt-6 border-t border-border">
        <p>
          W92-C • Source-of-truth: <code>src/lib/w92/translation-strings.ts</code> • Validator:{' '}
          <code>scripts/validate-translations.mjs</code>
        </p>
      </footer>
    </main>
  );
}
