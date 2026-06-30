// ============================================================================
// /verify-email — entry point
// ----------------------------------------------------------------------------
// Consumes a verification token on mount, shows success/error states.
// Provides a resend button (PUT /api/auth/verify-email) with rate-limit UX.
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { authClient } from '@/lib/auth-pages/client';

type Status = 'idle' | 'verifying' | 'verified' | 'error';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') ?? '';

  const [status, setStatus] = useState<Status>(tokenFromUrl ? 'verifying' : 'idle');
  const [message, setMessage] = useState<string | null>(
    tokenFromUrl ? null : 'Acesse o link enviado por email para verificar sua conta.',
  );
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState<number>(0);

  useEffect(() => {
    if (!tokenFromUrl) return;
    let cancelled = false;
    (async () => {
      const result = await authClient.verifyEmail({ token: tokenFromUrl });
      if (cancelled) return;
      if (result.ok && result.data.verified) {
        setStatus('verified');
        setMessage('Email verificado! Você já pode entrar.');
        setTimeout(() => {
          void router.push('/login');
        }, 2500);
      } else {
        setStatus('error');
        setMessage(
          result.ok === false
            ? result.error.message
            : 'Não foi possível verificar o email.',
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tokenFromUrl, router]);

  // Resend countdown
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const id = window.setTimeout(() => {
      const next = resendCountdown - 1;
      setResendCountdown(next);
    }, 1000);
    return () => {
      window.clearTimeout(id);
    };
  }, [resendCountdown]);

  const onResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendError(null);
    if (!resendEmail.includes('@')) {
      setResendError('Email inválido');
      return;
    }
    if (resendCountdown > 0) return;
    setResendLoading(true);
    const res = await fetch('/api/auth/verify-email', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: resendEmail }),
    });
    setResendLoading(false);
    if (res.status === 429) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setResendError(data.error ?? 'Muitas tentativas. Aguarde.');
      setResendCountdown(60);
      return;
    }
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setResendError(data.error ?? 'Erro ao reenviar');
      return;
    }
    setResendSent(true);
    setResendCountdown(60);
  };

  return (
    <AuthShell
      title="Verificar Email"
      subtitle="Confirme seu email"
    >
      <div className="space-y-5" data-testid="verify-status">
        {status === 'verifying' ? (
          <div className="flex flex-col items-center gap-3 py-6 text-sm text-muted-foreground">
            <span className="inline-block h-3 w-3 rounded-full bg-[var(--spiritual-gold,#D4AF37)] animate-pulse" />
            Verificando…
          </div>
        ) : null}

        {status === 'verified' ? (
          <div className="space-y-3 text-center">
            <div
              aria-hidden="true"
              className="mx-auto w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center"
            >
              <span className="text-2xl text-emerald-300">✓</span>
            </div>
            <p className="text-sm text-foreground/90">{message}</p>
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="space-y-3 text-center">
            <div
              aria-hidden="true"
              className="mx-auto w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center"
            >
              <span className="text-2xl text-red-300">✕</span>
            </div>
            <p className="text-sm text-red-200">{message}</p>
          </div>
        ) : null}

        {status === 'idle' || status === 'error' ? (
          <form onSubmit={onResend} className="space-y-3 pt-2 border-t border-white/10">
            <p className="text-xs text-muted-foreground">
              Não recebeu o email? Solicite um novo.
            </p>
            {resendError ? (
              <div
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200"
              >
                {resendError}
              </div>
            ) : null}
            {resendSent ? (
              <div
                role="status"
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200"
              >
                Reenviado. Verifique sua caixa de entrada.
              </div>
            ) : null}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                disabled={resendLoading || resendCountdown > 0}
                className="
                  flex-1 min-h-[44px] rounded-lg
                  border border-white/10 bg-white/5
                  px-3 py-2 text-sm text-foreground
                  placeholder:text-muted-foreground
                  focus:outline-none focus:ring-2 focus:ring-[var(--spiritual-gold,#D4AF37)]/50 focus:border-[var(--spiritual-gold,#D4AF37)]
                  disabled:opacity-50
                "
              />
              <button
                type="submit"
                disabled={resendLoading || resendCountdown > 0}
                className="
                  min-h-[44px] px-4 rounded-lg
                  border border-[var(--spiritual-gold,#D4AF37)]/50
                  text-sm text-[var(--spiritual-gold,#D4AF37)]
                  hover:bg-[var(--spiritual-gold,#D4AF37)]/10
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                {resendCountdown > 0
                  ? `Aguarde ${resendCountdown}s`
                  : resendLoading
                    ? 'Enviando…'
                    : 'Reenviar'}
              </button>
            </div>
          </form>
        ) : null}

        <p className="text-center text-xs text-muted-foreground pt-2">
          <Link href="/login" className="text-[var(--spiritual-gold,#D4AF37)] hover:underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
