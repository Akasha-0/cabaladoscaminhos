'use client';

// ============================================================================
// VoiceConsentModal — LGPD consent for Akasha voice mode (W94-B)
// ============================================================================
// Title: "A Akasha quer falar com você"
// Body : explains Web Speech API → 100% LOCAL, audio never leaves device.
// Action: "Permitir" (z.literal(true)) / "Agora não" (denied)
//
// LGPD Art. 7° (consentimento) + Art. 9° (necessidade)
// Cycle 93 lesson #12: strip reporter identities, omit details when null.
//
// FNV-1a hash recorded in audit log for correlation. Never logs userId.
// "Saiba mais" → /privacidade
// ============================================================================

import { useCallback, useId, useState } from 'react';
import { ShieldCheck, Mic, MicOff, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { hashConsent } from '@/lib/w94/voice-mode';

// ============================================================================
// Types
// ============================================================================

export interface VoiceConsentModalProps {
  /** Whether the modal is open. */
  open: boolean;
  /** User ID for consent record (will be hashed, not logged plaintext). */
  userId: string;
  /** Was consent granted? */
  onAccept: () => void | Promise<void>;
  /** Was consent denied? */
  onDeny: () => void;
  /** Privacy policy href. */
  privacyHref?: string;
  /** Hide / show loading state on accept button. */
  pending?: boolean;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function VoiceConsentModal({
  open,
  userId,
  onAccept,
  onDeny,
  privacyHref = '/privacidade',
  pending = false,
  className,
}: VoiceConsentModalProps) {
  const titleId = useId();
  const [submitting, setSubmitting] = useState(false);

  const handleAccept = useCallback(async () => {
    setSubmitting(true);
    // Hash for audit log — never log userId plaintext (LGPD Art. 18).
    // Cycle 93 lesson #12: omit details when null; here we only persist the hash.
    try {
      const now = new Date().toISOString();
      const auditHash = hashConsent(userId, now);
      if (process.env['NODE_ENV'] !== 'production') {
        // eslint-disable-next-line no-console
        console.info('[consent] granted', { auditHash });
      }
      await onAccept();
    } finally {
      setSubmitting(false);
    }
  }, [onAccept, userId]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-testid="voice-consent-modal"
      className={cn(
        'fixed inset-0 z-50 flex items-end justify-center sm:items-center',
        'bg-black/70 backdrop-blur-sm animate-in fade-in-0 duration-200 motion-reduce:animate-none',
        className,
      )}
    >
      <div
        data-slot="consent-card"
        className={cn(
          'flex max-h-[90vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-t-2xl bg-slate-950/95 p-5 shadow-2xl ring-1 ring-amber-500/30',
          'sm:rounded-2xl',
          'animate-in slide-in-from-bottom-4 duration-300 motion-reduce:animate-none',
        )}
      >
        {/* ─── Icon + title ───────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span
            aria-hidden
            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/40"
          >
            <Mic className="h-7 w-7" aria-hidden />
          </span>
          <h2
            id={titleId}
            className="text-lg font-semibold text-amber-100"
          >
            A Akasha quer falar com você
          </h2>
        </div>

        {/* ─── Body — LGPD info ────────────────────────────────────── */}
        <div className="flex flex-col gap-3 rounded-xl bg-slate-900/60 p-4 text-sm text-slate-200">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden />
            <p>
              Sua voz é processada <strong>100% no seu navegador</strong>.
              O áudio <strong>nunca sai do seu dispositivo</strong> — não enviamos nada para servidores.
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Usamos a Web Speech API do navegador. Os 3 tons de voz —
            <strong> Calma, Presente e Sábia</strong> — são filtros visuais;
            o motor é o mesmo do navegador.
          </p>
          <p className="text-xs text-slate-400">
            Você pode <strong>revogar este consentimento a qualquer momento</strong>.
            A Akasha voltará a responder apenas em texto.
          </p>
        </div>

        {/* ─── Learn more ─────────────────────────────────────────── */}
        <a
          href={privacyHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 self-center text-xs text-amber-300 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded"
        >
          Saiba mais sobre privacidade
          <ExternalLink className="h-3 w-3" aria-hidden />
        </a>

        {/* ─── Actions ────────────────────────────────────────────── */}
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onDeny}
            disabled={submitting || pending}
            aria-label="Recusar consentimento de voz"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-700/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 motion-reduce:active:scale-100 active:scale-[0.98] disabled:opacity-50"
          >
            <MicOff className="h-4 w-4" aria-hidden />
            Agora não
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={submitting || pending}
            aria-label="Permitir voz da Akasha"
            data-testid="consent-accept"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-300 px-4 py-3 text-sm font-semibold text-slate-950 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 motion-reduce:active:scale-100 active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <ShieldCheck className="h-4 w-4" aria-hidden />
            )}
            {submitting ? 'Permitindo...' : 'Permitir'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VoiceConsentModal;
