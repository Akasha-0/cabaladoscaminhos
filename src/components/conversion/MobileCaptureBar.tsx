'use client';

// ============================================================================
// MobileCaptureBar — Bottom bar fixa para capturar email em mobile (Wave 20)
// ============================================================================
// Aparece após 8s na página (mobile only), dismissível, persistente via
// localStorage por 7 dias. Não é overlay invasivo — é uma faixa discreta
// no rodapé que respeita safe-area-inset-bottom.
//
// Flag gate: `mobile-capture-bar` (boolean, default true).
// ============================================================================

import { useEffect, useState } from 'react';
import { X, Mail, ChevronUp } from 'lucide-react';
import { useFlag } from '@/hooks/use-flag';
import { trackEvent } from '@/lib/analytics/events-catalog';

interface Props {
  variant: 'A' | 'B' | 'C' | 'D';
}

const STORAGE_KEY = 'mobile-bar-dismissed-at';
const DELAY_MS = 8_000;
const COOLDOWN_DAYS = 7;

export function MobileCaptureBar({ variant }: Props) {
  const { enabled } = useFlag('mobile-capture-bar');
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Mobile only
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) return;

    // Cooldown check
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const ts = Number(raw);
        if (Number.isFinite(ts) && Date.now() - ts < COOLDOWN_DAYS * 86_400_000) {
          return;
        }
      }
    } catch {
      /* ignore */
    }

    const timer = setTimeout(() => {
      setVisible(true);
      trackEvent('page_viewed', {
        path: '/mobile-bar-shown',
        query: { variant },
      });
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, [enabled, variant]);

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
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
          source: `mobile-bar-${variant}`,
        }),
      });
      if (res.ok) {
        setDone(true);
        trackEvent('page_viewed', {
          path: '/mobile-bar-success',
          query: { variant },
        });
        setTimeout(handleDismiss, 3000);
      }
    } catch {
      /* silent */
    } finally {
      setSubmitting(false);
    }
  };

  if (!enabled || !visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-gradient-to-t from-slate-950 via-slate-900 to-slate-900/95 border-t border-amber-500/30 backdrop-blur-sm"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      role="region"
      aria-label="Captura de email"
    >
      <div className="flex items-center gap-2 p-3">
        {!expanded && !done && (
          <>
            <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="flex-1 text-xs text-slate-200">
              <strong className="text-amber-300">Garanta sua vaga</strong> na lista de espera
            </p>
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="h-8 px-3 rounded-md bg-amber-500 text-slate-900 text-xs font-semibold flex items-center gap-1"
            >
              Entrar
              <ChevronUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Fechar"
              className="p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}

        {expanded && !done && (
          <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
            <input
              type="email"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="flex-1 h-9 px-3 rounded-md bg-slate-800 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={submitting}
              className="h-9 px-4 rounded-md bg-amber-500 text-slate-900 text-xs font-semibold disabled:opacity-60"
            >
              {submitting ? '...' : 'Entrar'}
            </button>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="Minimizar"
              className="p-1.5 text-slate-400"
            >
              <ChevronUp className="w-4 h-4 rotate-180" />
            </button>
          </form>
        )}

        {done && (
          <p className="flex-1 text-xs text-emerald-300 text-center">
            ✨ Vaga garantida! Enviaremos o convite em breve.
          </p>
        )}
      </div>
    </div>
  );
}
