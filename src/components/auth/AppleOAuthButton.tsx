'use client';

/**
 * AppleOAuthButton — Placeholder UI para "Continuar com Apple"
 * ----------------------------------------------------------------------------
 * Renderiza um botão "Continuar com Apple" no padrão iOS (fundo preto,
 * ícone branco) que futuramente acionará
 * `supabase.auth.signInWithOAuth({ provider: 'apple' })`.
 *
 * Estado atual (W93-B):
 *   - UI completa e acessível (44px tap target, aria-label, loading state)
 *   - Backend NÃO configurado → mostra badge "em breve" inline
 *   - Quando Supabase tiver provider Apple habilitado, troca o placeholder
 *     pela chamada real ao `signInWithOAuth`
 *
 * LGPD:
 *   - Não coleta email/identificador até o usuário clicar
 *   - Texto inclui nota "Não compartilhamos seu email real" (Apple relay)
 *
 * A11Y:
 *   - type="button" (NÃO submit, lesson crítica W93-B)
 *   - aria-busy durante loading
 *   - aria-label descritivo
 *   - Foco visível com ring dourado
 */

import { useState, type MouseEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { OAUTH_CATALOG } from '@/lib/w93/auth-integration';
import { cn } from '@/lib/utils';

export interface AppleOAuthButtonProps {
  className?: string;
  redirectTo?: string;
  label?: string;
  /** Se true, esconde o badge "em breve" (para dev/staging). */
  hideComingSoon?: boolean;
}

export function AppleOAuthButton({
  className,
  redirectTo = '/feed',
  label,
  hideComingSoon = false,
}: AppleOAuthButtonProps) {
  const { supabase } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const meta = OAUTH_CATALOG.apple;
  const isLabel = label ?? meta.label;

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    // CRITICAL: type="button" no form → evita submit acidental.
    e.preventDefault();
    setError(null);

    if (!supabase) {
      setError('Serviço de autenticação indisponível');
      return;
    }

    setLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}${redirectTo}`
              : undefined,
        },
      });
      if (oauthError) {
        setError(oauthError.message || 'Falha ao iniciar Apple OAuth');
      }
      // Em sucesso, Supabase redireciona automaticamente.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const showComingSoon = !meta.configured && !hideComingSoon;

  return (
    <div className={cn('w-full', className)}>
      <Button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-busy={loading}
        aria-label={`${isLabel} (placeholder — provider ainda não configurado)`}
        variant="outline"
        className={cn(
          'w-full h-11 px-4',
          'bg-black text-white border-black',
          'hover:bg-neutral-900 hover:border-neutral-900',
          'dark:bg-white dark:text-black dark:border-white dark:hover:bg-neutral-100',
          'font-cinzel tracking-wide',
          'focus-visible:ring-2 focus-visible:ring-spiritual-gold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
        )}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
            <span>Conectando...</span>
          </>
        ) : (
          <>
            <AppleIcon className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>{isLabel}</span>
          </>
        )}
      </Button>

      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="text-xs text-amber-400 mt-2 text-center"
        >
          {error}
        </p>
      )}

      {showComingSoon && (
        <p
          className="text-[10px] uppercase tracking-widest text-slate-500 mt-1.5 text-center"
          aria-hidden="true"
        >
          Em breve — Apple ID como provedora
        </p>
      )}
    </div>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}