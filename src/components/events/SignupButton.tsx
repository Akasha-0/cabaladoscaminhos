// ============================================================================
// SIGNUP BUTTON — CTA para inscrição em evento (W26)
// ----------------------------------------------------------------------------
// Comportamento:
//   - Não logado: mostra "Entrar para participar" → /login?next=/events/[slug]
//   - Logado + status=open: "Participar" (verde)
//   - Logado + status=waitlist: "Entrar na lista de espera"
//   - Logado + status=full: desabilitado, mostra "Lotado"
//   - Logado + status=closed: desabilitado, mostra "Inscrições fechadas"
//
// A "inscrição" em si é STUBBED — emite alert e loga no console. A integração
// real com `/api/events/[slug]/signup` entra em W27+ (precisa de schema).
// ============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Clock, Lock, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useT } from '@/lib/i18n/useT';
import { cn } from '@/lib/utils';
import type { SignupStatus } from '@/lib/events/types';

interface SignupButtonProps {
  /** Slug do evento (usado no next param se deslogado) */
  eventSlug: string;
  /** Status atual do signup (do evento) */
  status: SignupStatus;
  /** Slug atual da rota (para redirect pós-login) */
  returnTo?: string;
  /** Variante visual */
  size?: 'sm' | 'default' | 'lg';
  /** Largura total do botão (mobile-first) */
  fullWidth?: boolean;
  className?: string;
}

export function SignupButton({
  eventSlug,
  status,
  returnTo,
  size = 'default',
  fullWidth = true,
  className,
}: SignupButtonProps) {
  const { user } = useAuth();
  const t = useT();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 1. Não logado → CTA de login com redirect de volta
  if (!user) {
    const next = encodeURIComponent(returnTo ?? `/workshops/${eventSlug}`);
    const handleLogin = () => {
      router.push(`/login?next=${next}`);
    };
    return (
      <Button
        variant="golden"
        size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default'}
        className={cn(fullWidth && 'w-full', className)}
        onClick={handleLogin}
        data-testid="signup-button-login"
      >
        <LogIn className="w-4 h-4 mr-2" aria-hidden="true" />
        <span>{t('events.signup.login')}</span>
      </Button>
    );
  }

  // 2. Inscrição enviada (sucesso stub)
  if (submitted) {
    return (
      <Button
        variant="outline"
        size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default'}
        className={cn(
          fullWidth && 'w-full',
          'border-emerald-500/50 text-emerald-300 bg-emerald-500/10',
          className
        )}
        disabled
        data-testid="signup-button-success"
      >
        <Check className="w-4 h-4 mr-2" aria-hidden="true" />
        {t('events.signup.success')}
      </Button>
    );
  }

  // 3. Status fechado/lotado
  if (status === 'closed' || status === 'full') {
    const isFull = status === 'full';
    return (
      <Button
        variant="outline"
        size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default'}
        className={cn(fullWidth && 'w-full', 'opacity-70', className)}
        disabled
        data-testid="signup-button-disabled"
      >
        <Lock className="w-4 h-4 mr-2" aria-hidden="true" />
        {isFull ? t('events.signup.full') : t('events.signup.closed')}
      </Button>
    );
  }

  // 4. CTA principal (logado + open ou waitlist)
  const isWaitlist = status === 'waitlist';

  const handleClick = async () => {
    setSubmitting(true);
    // STUB — integração real fica para W27+
    // eslint-disable-next-line no-console
    console.info('[SignupButton] STUB submit', { eventSlug, userId: user.id });
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <Button
      variant={isWaitlist ? 'outline' : 'golden'}
      size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default'}
      className={cn(fullWidth && 'w-full', className)}
      onClick={handleClick}
      disabled={submitting}
      data-testid="signup-button-primary"
    >
      {submitting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
          {t('events.signup.submitting')}
        </>
      ) : isWaitlist ? (
        <>
          <Clock className="w-4 h-4 mr-2" aria-hidden="true" />
          {t('events.signup.waitlist')}
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" aria-hidden="true" />
          {t('events.signup.join')}
        </>
      )}
    </Button>
  );
}