'use client';

// ============================================================================
// InlineEmailCapture — Componente de captura de email inline (Wave 20)
// ============================================================================
// Versão leve do WaitlistForm — cabe em qualquer página (home, about,
// manifesto). Dispara evento `email_capture_inline` para o funil.
// ============================================================================

import { useState, type FormEvent } from 'react';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics/events-catalog';

interface Props {
  /** Origem para tracking (ex: 'home', 'about', 'manifesto') */
  source: string;
  /** Texto do CTA */
  ctaLabel?: string;
  /** Variante visual */
  variant?: 'amber' | 'violet' | 'emerald';
  className?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InlineEmailCapture({
  source,
  ctaLabel = 'Entrar na lista',
  variant = 'amber',
  className,
}: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const gradient = {
    amber: 'from-amber-500 to-amber-400',
    violet: 'from-violet-500 to-violet-400',
    emerald: 'from-emerald-500 to-emerald-400',
  }[variant];

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setError('Email inválido');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setError(null);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
        trackEvent('page_viewed', {
          path: '/inline-email-capture-success',
          query: { source },
        });
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? 'Erro ao enviar');
        setStatus('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de rede');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div
        className={`flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 ${className ?? ''}`}
        role="status"
      >
        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <p className="text-sm text-emerald-200">
          Pronto! Você está na lista. Enviaremos um convite em breve.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col sm:flex-row gap-2 ${className ?? ''}`}
      noValidate
    >
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') {
              setStatus('idle');
              setError(null);
            }
          }}
          disabled={status === 'submitting'}
          required
          aria-invalid={status === 'error'}
          className="w-full h-11 pl-10 pr-3 rounded-lg bg-slate-900/60 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition disabled:opacity-60 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'submitting' || email.trim() === ''}
        className={`h-11 px-5 rounded-lg bg-gradient-to-r ${gradient} text-slate-900 font-semibold text-sm hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]`}
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enviando...
          </>
        ) : (
          ctaLabel
        )}
      </button>
      {status === 'error' && error && (
        <p role="alert" className="text-xs text-red-400 sm:basis-full mt-1">
          {error}
        </p>
      )}
    </form>
  );
}
