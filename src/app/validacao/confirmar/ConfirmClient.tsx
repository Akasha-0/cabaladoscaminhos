'use client';

/**
 * ConfirmClient — chama PATCH /api/waitlist (action=confirm) e renderiza
 * o estado (loading / success / error / expired).
 *
 * Após sucesso, mostra CTA para explorar o projeto + share buttons.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertCircle, Clock, Loader2, Share2 } from 'lucide-react';
import { events } from '@/lib/analytics/events';

type ConfirmState =
  | { kind: 'loading' }
  | { kind: 'success'; position: number; totalConfirmed: number }
  | { kind: 'expired' }
  | { kind: 'invalid' }
  | { kind: 'network'; message: string };

export function ConfirmClient({ email, token }: { email: string; token: string }) {
  const [state, setState] = useState<ConfirmState>({ kind: 'loading' });
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    void events.waitlistConfirmationClicked();
    let cancelled = false;

    async function confirm() {
      try {
        const res = await fetch('/api/waitlist', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': 'self-confirm', // rota PATCH aceita isso para action=confirm
          },
          body: JSON.stringify({ action: 'confirm', email, confirmToken: token }),
        });

        if (cancelled) return;

        if (res.status === 410) {
          setState({ kind: 'expired' });
          return;
        }
        if (res.status === 400) {
          setState({ kind: 'invalid' });
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setState({ kind: 'network', message: data?.error ?? 'Erro ao confirmar.' });
          return;
        }

        const data = await res.json();
        setState({
          kind: 'success',
          position: data.score ?? 0,
          totalConfirmed: 0, // API não retorna no momento
        });
        void events.waitlistConfirmed();
        setTimeout(() => setShowShare(true), 600);
      } catch (err) {
        if (cancelled) return;
        setState({
          kind: 'network',
          message: err instanceof Error ? err.message : 'Erro de rede.',
        });
      }
    }

    void confirm();
    return () => {
      cancelled = true;
    };
  }, [email, token]);

  if (state.kind === 'loading') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center px-5 py-10">
        <div className="max-w-md text-center">
          <Loader2 className="w-12 h-12 mx-auto text-amber-400 animate-spin mb-4" aria-hidden />
          <p className="text-sm text-slate-400">Confirmando seu email...</p>
        </div>
      </main>
    );
  }

  if (state.kind === 'success') {
    const shareUrl = `https://akashaportal.com/validacao?ref=${encodeURIComponent(email)}`;
    const shareText = `Confirmei minha vaga na lista de espera do Akasha Portal — espiritualidade universalista com rigor científico.`;

    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center px-5 py-10">
        <div className="max-w-md w-full">
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center">
            <CheckCircle2 className="w-14 h-14 mx-auto text-emerald-400 mb-4" />
            <h1 className="text-2xl font-cinzel font-semibold text-emerald-300 mb-2">
              Email confirmado!
            </h1>
            <p className="text-sm text-emerald-100/90 leading-relaxed mb-4">
              Sua posição subiu na fila. Agora você está entre os confirmados —
              sua vaga está garantida para a próxima onda.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href="/validacao"
                className="inline-flex h-11 items-center justify-center px-5 rounded-lg bg-amber-500 text-slate-900 font-semibold text-sm hover:bg-amber-400 transition"
              >
                Conhecer o projeto
              </Link>
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center px-5 rounded-lg bg-slate-800 text-slate-200 font-semibold text-sm hover:bg-slate-700 transition"
              >
                Ir para a home
              </Link>
            </div>
          </div>

          {showShare && (
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 animate-[fadeIn_0.5s_ease-out]">
              <p className="text-sm text-slate-300 mb-3 flex items-center justify-center gap-1.5">
                <Share2 className="w-4 h-4 text-amber-400" aria-hidden />
                Cada amigo confirmado sobe você <strong className="text-amber-400 mx-1">+3 posições</strong>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 px-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 px-3 rounded-lg bg-slate-700 text-white text-xs font-semibold hover:bg-slate-600 transition"
                >
                  Twitter / X
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  if (state.kind === 'expired') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center px-5 py-10">
        <div className="max-w-md text-center">
          <Clock className="w-12 h-12 mx-auto text-amber-400 mb-4" aria-hidden />
          <h1 className="text-2xl font-cinzel mb-3">Link expirado</h1>
          <p className="text-sm text-slate-400 mb-6">
            Esse link de confirmação expirou (validade de 7 dias). Você pode
            entrar na fila novamente — sua posição inicial será recalculada.
          </p>
          <a
            href="/validacao"
            className="inline-flex h-11 items-center justify-center px-5 rounded-lg bg-amber-500 text-slate-900 font-semibold text-sm hover:bg-amber-400 transition"
          >
            Voltar para a landing
          </a>
        </div>
      </main>
    );
  }

  if (state.kind === 'invalid') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center px-5 py-10">
        <div className="max-w-md text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" aria-hidden />
          <h1 className="text-2xl font-cinzel mb-3">Token inválido</h1>
          <p className="text-sm text-slate-400 mb-6">
            Esse link de confirmação já foi usado ou é inválido. Se você já
            confirmou antes, pode ignorar essa mensagem.
          </p>
          <a
            href="/validacao"
            className="inline-flex h-11 items-center justify-center px-5 rounded-lg bg-amber-500 text-slate-900 font-semibold text-sm hover:bg-amber-400 transition"
          >
            Voltar para a landing
          </a>
        </div>
      </main>
    );
  }

  // network
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center px-5 py-10">
      <div className="max-w-md text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-amber-400 mb-4" aria-hidden />
        <h1 className="text-2xl font-cinzel mb-3">Algo deu errado</h1>
        <p className="text-sm text-slate-400 mb-6">{state.message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex h-11 items-center justify-center px-5 rounded-lg bg-amber-500 text-slate-900 font-semibold text-sm hover:bg-amber-400 transition"
        >
          Tentar de novo
        </button>
      </div>
    </main>
  );
}