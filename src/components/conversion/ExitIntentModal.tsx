'use client';

// ============================================================================
// ExitIntentModal — captura email quando usuário tenta sair (Wave 20)
// ============================================================================
// Desktop: detecta `mouseleave` no topo da viewport (clientY < 0).
// Mobile: detecta scroll up rápido (deltaY < -50 em < 200ms).
//
// Flag gate: `exit-intent-modal` (percentage rollout).
// Throttle: 1× por sessão + 1× por 7 dias (localStorage).
// ============================================================================

import { useEffect, useRef, useState } from 'react';
import { X, Mail, Sparkles } from 'lucide-react';
import { useFlag } from '@/hooks/use-flag';
import { trackEvent } from '@/lib/analytics/events-catalog';

interface Props {
  variant: 'A' | 'B' | 'C' | 'D';
}

const STORAGE_KEY = 'exit-intent-dismissed-at';
const MIN_PAGE_TIME_MS = 30_000; // só mostra após 30s na página
const COOLDOWN_DAYS = 7;

export function ExitIntentModal({ variant }: Props) {
  const { enabled } = useFlag('exit-intent-modal');
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const dismissedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Check cooldown
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const ts = Number(raw);
        if (Number.isFinite(ts) && Date.now() - ts < COOLDOWN_DAYS * 86_400_000) {
          return;
        }
      }
    } catch {
      /* localStorage unavailable */
    }

    const startTime = Date.now();

    // Desktop: mouse leaving via top
    const handleMouseLeave = (e: MouseEvent) => {
      if (Date.now() - startTime < MIN_PAGE_TIME_MS) return;
      if (e.clientY <= 0 && !open && !done) {
        dismissedAt.current = Date.now();
        setOpen(true);
        trackEvent('page_viewed', {
          path: '/exit-intent-modal',
          query: { variant },
        });
      }
    };

    // Mobile: rapid scroll up
    let lastScrollY = window.scrollY;
    let lastScrollTime = Date.now();
    const handleScroll = () => {
      const now = Date.now();
      const dy = window.scrollY - lastScrollY;
      const dt = now - lastScrollTime;
      if (
        Date.now() - startTime >= MIN_PAGE_TIME_MS &&
        !open &&
        !done &&
        dy < -50 &&
        dt < 200
      ) {
        dismissedAt.current = Date.now();
        setOpen(true);
        trackEvent('page_viewed', {
          path: '/exit-intent-modal',
          query: { variant },
        });
      }
      lastScrollY = window.scrollY;
      lastScrollTime = now;
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, open, done, variant]);

  const handleClose = () => {
    setOpen(false);
    try {
      if (dismissedAt.current) {
        localStorage.setItem(STORAGE_KEY, String(dismissedAt.current));
      }
    } catch {
      /* ignore */
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          source: `exit-intent-${variant}`,
        }),
      });
      if (res.ok) {
        setDone(true);
        trackEvent('page_viewed', {
          path: '/exit-intent-success',
          query: { variant },
        });
        setTimeout(handleClose, 3000);
      }
    } catch {
      /* silent */
    } finally {
      setSubmitting(false);
    }
  };

  if (!enabled || !open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 shadow-2xl p-6 md:p-8">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!done ? (
          <>
            <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h2
              id="exit-intent-title"
              className="text-xl md:text-2xl font-cinzel text-center bg-gradient-to-r from-amber-300 to-violet-400 bg-clip-text text-transparent mb-2"
            >
              Espera antes de ir!
            </h2>
            <p className="text-sm text-slate-400 text-center mb-5">
              Garanta sua vaga na lista de espera e comece sua jornada
              multi-tradição. Leva 10 segundos.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-semibold text-sm hover:from-amber-400 hover:to-amber-300 transition disabled:opacity-60"
              >
                {submitting ? 'Enviando...' : 'Quero minha vaga'}
              </button>
            </form>

            <button
              type="button"
              onClick={handleClose}
              className="block w-full text-xs text-slate-500 hover:text-slate-400 mt-3"
            >
              Não, obrigado
            </button>
          </>
        ) : (
          <div className="text-center py-4">
            <Sparkles className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h2 className="text-lg font-cinzel text-emerald-300 mb-1">
              Vaga garantida!
            </h2>
            <p className="text-sm text-slate-400">
              Enviaremos o convite em breve.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
