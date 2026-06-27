'use client';

/**
 * WaitlistForm — Form de captura de email para o beta privado.
 * ----------------------------------------------------------------------------
 * Usado em /validacao. Envia para POST /api/waitlist.
 *
 * Features:
 *   - Client + server-side validation (zod schema compartilhado)
 *   - Loading state durante submit
 *   - Mensagens de erro contextuais
 *   - Honeypot anti-spam (campo `website` escondido, se preenchido = bot)
 *   - Tracking via analytics (trackEvent → PostHog quando configurado)
 *
 * Refs:
 *   - src/app/api/waitlist/route.ts (endpoint)
 *   - src/lib/analytics/events.ts (tracking)
 */

import { useState, type FormEvent } from 'react';
import { Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { events } from '@/lib/analytics/events';

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; position: number; total: number }
  | { kind: 'error'; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface WaitlistFormProps {
  /** Texto do CTA customizado. */
  ctaLabel?: string;
  /** Origem pra tracking (ex: 'homepage', 'twitter'). */
  source?: string;
  className?: string;
}

export function WaitlistForm({
  ctaLabel = 'Entrar na lista de espera',
  source = 'validacao-page',
  className,
}: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<SubmitState>({ kind: 'idle' });
  // Honeypot anti-spam
  const [website, setWebsite] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Honeypot check
    if (website) return;

    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setState({ kind: 'error', message: 'Email inválido' });
      return;
    }

    setState({ kind: 'submitting' });

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          source,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setState({
          kind: 'error',
          message: data?.error ?? 'Erro ao entrar na lista. Tente de novo.',
        });
        return;
      }

      const position = typeof data?.position === 'number' ? data.position : 0;
      const total = typeof data?.total === 'number' ? data.total : 50;

      setState({ kind: 'success', position, total });
      setEmail('');
      void events.waitlistJoined(trimmed, source);
    } catch (err) {
      setState({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Erro de rede. Tente de novo.',
      });
    }
  };

  if (state.kind === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`max-w-md mx-auto rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-center ${className ?? ''}`}
      >
        <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
        <h3 className="font-cinzel text-lg font-semibold text-emerald-300 mb-1">
          Bem-vindo à lista!
        </h3>
        <p className="text-sm text-emerald-200/80">
          Você está na posição{' '}
          <strong className="text-emerald-100">#{state.position}</strong> de{' '}
          {state.total}. Enviaremos um convite por email quando o beta abrir.
        </p>
      </div>
    );
  }

  const isSubmitting = state.kind === 'submitting';

  return (
    <form
      onSubmit={handleSubmit}
      className={`max-w-md mx-auto ${className ?? ''}`}
      noValidate
    >
      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor="waitlist-email" className="sr-only">
          Seu melhor email
        </label>
        <div className="relative flex-1">
          <Mail
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            aria-hidden
          />
          <input
            id="waitlist-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state.kind === 'error') setState({ kind: 'idle' });
            }}
            disabled={isSubmitting}
            required
            aria-invalid={state.kind === 'error'}
            aria-describedby={state.kind === 'error' ? 'waitlist-error' : undefined}
            data-waitlist-email-input
            className="w-full h-12 pl-10 pr-3 rounded-lg bg-slate-900/60 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || email.trim() === ''}
          data-waitlist-cta-click
          className="h-12 px-5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-semibold text-sm hover:from-amber-400 hover:to-amber-300 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
              Enviando...
            </>
          ) : (
            <>{ctaLabel}</>
          )}
        </button>
      </div>

      {/* Honeypot anti-spam — invisível pra usuarios reais */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        <label htmlFor="waitlist-website">Website (leave empty)</label>
        <input
          id="waitlist-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {state.kind === 'error' && (
        <p
          id="waitlist-error"
          role="alert"
          className="mt-2 flex items-center justify-center gap-1.5 text-xs text-red-400"
        >
          <AlertCircle className="w-3.5 h-3.5" aria-hidden />
          {state.message}
        </p>
      )}

      <p className="mt-3 text-xs text-slate-400 text-center">
        Sem spam. Você pode sair quando quiser.
      </p>
    </form>
  );
}