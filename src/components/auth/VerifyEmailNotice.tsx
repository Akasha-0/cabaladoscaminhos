'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { cn } from '@/lib/utils';

/**
 * VerifyEmailNotice — Tela mostrada após signup quando o Supabase exige
 * confirmação de email.
 *
 * Ações:
 *  - Reenviar email (POST /api/auth/resend-verification)
 *  - Voltar para /login
 *
 * O email é opcional (lido de query string `?email=`). Se ausente, o botão
 * "reenviar" fica desabilitado (não conseguimos para qual email enviar).
 */

export function VerifyEmailNotice() {
  const [email, setEmail] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('email');
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<
    | { kind: 'success'; message: string }
    | { kind: 'error'; message: string }
    | null
  >(null);

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setFeedback({
          kind: 'error',
          message: body?.error ?? 'Não foi possível reenviar o email.',
        });
        return;
      }

      setFeedback({
        kind: 'success',
        message: 'Email reenviado! Confira sua caixa de entrada (e spam).',
      });
    } catch {
      setFeedback({
        kind: 'error',
        message: 'Erro de conexão. Tente novamente em alguns segundos.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-spiritual p-8 rounded-2xl max-w-md w-full text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-spiritual-gold/20 to-spiritual-violet/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
        <Sparkles className="w-8 h-8 text-spiritual-gold" aria-hidden="true" />
      </div>

      <div className="w-16 h-16 mx-auto rounded-full bg-spiritual-gold/10 flex items-center justify-center mb-6">
        <Mail className="w-7 h-7 text-spiritual-gold" aria-hidden="true" />
      </div>

      <h1 className="font-cinzel text-xl font-bold tracking-wider mb-2">
        Verifique seu email
      </h1>
      <p className="text-sm text-muted-foreground font-serif leading-relaxed">
        Enviamos um link de confirmação
        {email && (
          <>
            {' '}para <span className="text-spiritual-gold">{email}</span>
          </>
        )}
        . Clique no link para ativar sua conta.
      </p>

      {feedback && (
        <div
          role="alert"
          className={cn(
            'mt-6 rounded-lg p-3 text-sm border flex items-start gap-2 text-left',
            feedback.kind === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          )}
        >
          {feedback.kind === 'success' ? (
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          ) : (
            <RefreshCw className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="mt-8 space-y-3">
        <Button
          type="button"
          onClick={handleResend}
          disabled={loading || !email}
          variant="outline"
          className={cn(
            'w-full h-11 font-cinzel tracking-wide border-slate-700 bg-slate-900/80 text-foreground',
            'hover:bg-slate-800 hover:border-spiritual-gold/60',
            (!email || loading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner size="sm" variant="gold" />
              <span>Reenviando...</span>
            </span>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
              Reenviar email
            </>
          )}
        </Button>

        <Link
          href="/login"
          className="block text-sm text-muted-foreground hover:text-spiritual-gold transition-colors font-serif"
        >
          Voltar para o login
        </Link>
      </div>

      <p className="mt-6 text-xs text-slate-500 font-serif">
        Não recebeu? Confira a pasta de spam ou aguarde alguns minutos.
      </p>
    </div>
  );
}
