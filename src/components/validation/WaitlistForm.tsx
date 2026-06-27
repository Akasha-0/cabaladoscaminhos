'use client';

// ============================================================================
// WaitlistForm — Formulário isolado para captura de email da landing /validacao
// ============================================================================
//
// - Validação client-side (HTML5 + regex simples)
// - Estado idle / submitting / success / error
// - Emite data-attribute no botão para permitir tracking de "cliques no CTA"
//   via DOM scrape (document.querySelectorAll('[data-waitlist-cta-click]'))
// - Mobile-first (single column no sm-, vira input + button inline no md+)
// ============================================================================

import * as React from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; position: number }
  | { kind: 'error'; message: string };

export function WaitlistForm() {
  const [email, setEmail] = React.useState('');
  const [state, setState] = React.useState<SubmitState>({ kind: 'idle' });
  const ctaClickCountRef = React.useRef(0);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setState({ kind: 'error', message: 'Informe um email válido.' });
      return;
    }

    setState({ kind: 'submitting' });

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source: 'validacao-landing' }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        position?: number;
        alreadyRegistered?: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        setState({
          kind: 'error',
          message: data.error ?? 'Não conseguimos te cadastrar. Tente novamente.',
        });
        return;
      }

      setState({
        kind: 'success',
        position: data.position ?? 0,
      });
      setEmail('');
    } catch (err) {
      console.error('[WaitlistForm] submit error:', err);
      setState({
        kind: 'error',
        message: 'Falha de conexão. Verifique sua internet e tente de novo.',
      });
    }
  };

  const handleCtaClick = () => {
    ctaClickCountRef.current += 1;
    // Marca o botão para que ferramentas externas de analytics
    // (Plausible / Umami scripts customizados) possam contar cliques no CTA
    // sem depender de um event tracker completo.
    if (typeof document !== 'undefined') {
      document.body.setAttribute(
        'data-waitlist-cta-clicks',
        String(ctaClickCountRef.current),
      );
    }
  };

  if (state.kind === 'success') {
    return (
      <div
        className="w-full max-w-md mx-auto p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-3" />
        <h3 className="text-lg font-semibold text-emerald-200 mb-1">
          Você está dentro.
        </h3>
        <p className="text-sm text-emerald-100/80">
          Posição #{state.position} na fila do beta. Enviaremos o convite
          assim que uma vaga abrir.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto"
      noValidate
      aria-label="Formulário de lista de espera"
    >
      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor="waitlist-email" className="sr-only">
          Seu email
        </label>
        <Input
          id="waitlist-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state.kind === 'error') setState({ kind: 'idle' });
          }}
          disabled={state.kind === 'submitting'}
          aria-invalid={state.kind === 'error'}
          aria-describedby={state.kind === 'error' ? 'waitlist-error' : undefined}
          className="h-12 px-4 text-base bg-slate-900/70 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:border-amber-400 focus-visible:ring-amber-400/40"
        />
        <Button
          type="submit"
          size="lg"
          onClick={handleCtaClick}
          disabled={state.kind === 'submitting'}
          data-waitlist-cta-click="true"
          className="h-12 px-6 bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-400 hover:to-violet-400 text-white border-0 font-semibold shadow-lg shadow-amber-500/20"
        >
          {state.kind === 'submitting' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando…
            </>
          ) : (
            <>
              Entrar na lista
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </>
          )}
        </Button>
      </div>

      {state.kind === 'error' && (
        <p
          id="waitlist-error"
          role="alert"
          className="mt-3 flex items-center justify-center gap-2 text-sm text-red-300"
        >
          <AlertCircle className="w-4 h-4" />
          {state.message}
        </p>
      )}
    </form>
  );
}