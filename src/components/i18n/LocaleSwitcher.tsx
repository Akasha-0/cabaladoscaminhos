// ============================================================================
// LocaleSwitcher — Toggle PT/EN/ES para Wave 92 i18n
// ============================================================================
// 3 botões grandes (mobile-first 44px), persistência dupla
// (localStorage + cookie), ARIA correto (`aria-current`).
//
// COMPORTAMENTO:
//   • Hidrata no client (não quebra SSR) — renderiza estado neutro
//     antes do useEffect.
//   • Trocar locale: persiste em localStorage + cookie + re-renderiza
//     componentes que usam useT (mesma instância via módulo).
//   • `aria-current="true"` APENAS no botão ativo.
//   • `aria-label` internacionalizado via aria.currentLocale.
//
// PROPS:
//   • `variant`: 'segmented' (default) ou 'inline' — visual.
//   • `label`: rótulo visível opcional acima do toggle.
// ============================================================================

'use client';

import { useT } from '@/hooks/useT';
import { LOCALE_META, type SupportedLocale } from '@/lib/w92/translation-tooling';
import { cn } from '@/lib/utils';

export interface LocaleSwitcherProps {
  /** Variante visual: 'segmented' (default) ou 'inline'. */
  variant?: 'segmented' | 'inline';
  /** Rótulo visível acima do toggle (opcional). */
  label?: string;
  /** Classes extras no container. */
  className?: string;
}

/**
 * Componente de troca de idioma. Hidrata localStorage no client.
 * Até a hidratação, renderiza APENAS o label "Idioma" (PT-BR visível
 * como ativo) — evita flash de conteúdo errado.
 */
export function LocaleSwitcher({ variant = 'segmented', label, className }: LocaleSwitcherProps) {
  const { locale, setLocale, hydrated, meta, t } = useT();

  // Antes de hidratar, default = pt-BR (não pisca)
  const current = hydrated ? locale : ('pt-BR' as SupportedLocale);

  const locales = (Object.keys(LOCALE_META) as SupportedLocale[]);

  return (
    <div
      role="group"
      aria-label={label ?? 'Idioma'}
      className={cn(
        'inline-flex flex-col gap-2',
        variant === 'inline' && 'flex-row items-center',
        className,
      )}
    >
      {label && (
        <span className="text-sm text-muted-foreground" aria-hidden="true">
          {label}
        </span>
      )}

      <div
        className={cn(
          'inline-flex rounded-lg border border-border bg-card p-1',
          variant === 'inline' && 'p-0.5',
        )}
        data-testid="locale-switcher"
      >
        {locales.map((loc) => {
          const isActive = current === loc;
          const m = (LOCALE_META as Record<SupportedLocale, { label: string; flag: string; nativeName: string }>)[loc];
          return (
            <button
              key={loc}
              type="button"
              onClick={() => setLocale(loc)}
              aria-current={isActive ? 'true' : undefined}
              aria-label={t('aria.currentLocale', { locale: m.nativeName })}
              data-locale={loc}
              data-active={isActive}
              className={cn(
                // Mobile-first: 44px touch target
                'min-h-[44px] min-w-[44px] px-3 py-2 text-sm font-medium rounded-md',
                'transition-colors duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
            >
              <span aria-hidden="true" className="mr-1">
                {m.flag}
              </span>
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
