'use client';

/**
 * OAuthButtons — Wrapper que renderiza todos os provedores OAuth suportados
 * ----------------------------------------------------------------------------
 * Encapsula Google + Apple (e futuros providers) atrás de uma API única.
 * Usado em LoginForm e SignupForm para evitar duplicação.
 *
 * Convenções:
 *   - Cada botão tem type="button" (CRÍTICO — não submeter o form pai)
 *   - Ordem: Google (mais usado) → Apple (iOS) → outros
 *   - Cada provider renderiza um "em breve" se não configurado
 *   - 44px min tap target (mobile-first)
 *
 * A11Y:
 *   - role="group" com aria-label="Provedores de login social"
 *   - Separador místico entre OAuth e form (MysticDivider)
 *
 * LGPD:
 *   - Cada botão declara consentNote (texto explicativo)
 *   - Nenhum identificador coletado até o clique
 */

import { cn } from '@/lib/utils';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { GoogleOAuthButton } from './GoogleOAuthButton';
import { AppleOAuthButton } from './AppleOAuthButton';
import {
  OAUTH_PROVIDERS,
  type OAuthProvider,
} from '@/lib/w93/auth-integration';

export interface OAuthButtonsProps {
  className?: string;
  /** Providers a renderizar (default: ['google', 'apple']). */
  providers?: readonly OAuthProvider[];
  /** Path para redirect pós-OAuth (default: '/feed'). */
  redirectTo?: string;
  /** Rótulo customizado do divider (default: 'ou continue com'). */
  dividerLabel?: string;
  /** Layout vertical ou horizontal. Default: vertical. */
  orientation?: 'vertical' | 'horizontal';
}

export function OAuthButtons({
  className,
  providers = OAUTH_PROVIDERS.filter((p) => p === 'google' || p === 'apple'),
  redirectTo = '/feed',
  dividerLabel = 'ou continue com',
  orientation = 'vertical',
}: OAuthButtonsProps) {
  return (
    <div
      role="group"
      aria-label="Provedores de login social"
      className={cn('w-full', className)}
    >
      <MysticDivider variant="subtle" label={dividerLabel} className="my-4" />

      <div
        className={cn(
          orientation === 'vertical' ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-2'
        )}
      >
        {providers.map((id) => {
          if (id === 'google') {
            return (
              <GoogleOAuthButton
                key={id}
                redirectTo={redirectTo}
                label="Continuar com Google"
              />
            );
          }
          if (id === 'apple') {
            return (
              <AppleOAuthButton
                key={id}
                redirectTo={redirectTo}
                label="Continuar com Apple"
              />
            );
          }
          // Providers não implementados ainda (github, facebook) — placeholder
          return <OAuthPlaceholderButton key={id} providerId={id} />;
        })}
      </div>
    </div>
  );
}

function OAuthPlaceholderButton({ providerId }: { providerId: OAuthProvider }) {
  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      aria-label={`Continuar com ${providerId} (em breve)`}
      className={cn(
        'w-full h-11 px-4 rounded-lg border border-slate-700',
        'bg-slate-900/40 text-slate-500',
        'font-cinzel tracking-wide text-sm',
        'cursor-not-allowed opacity-60',
        'flex items-center justify-center gap-2'
      )}
    >
      <span aria-hidden="true">🔒</span>
      <span>Em breve</span>
    </button>
  );
}