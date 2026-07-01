'use client';

// ============================================================================
// /error — branded 5xx / runtime error boundary (Wave 36)
// ============================================================================
// Next.js convention: this file is the root-level error boundary. Captures
// uncaught errors in route segments and renders a friendly recovery page
// with retry + go-home CTAs. Sends the error to Sentry (client side) and
// offers a "report this" link prefilled with route + fingerprint hash.
// ============================================================================

import Link from 'next/link';
import { useEffect } from 'react';
import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { MysticButton } from '@/components/shared/MysticButton';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { Heading } from '@/components/design-system/Typography';
import { AlertTriangle, Home, RefreshCw, Mail, Compass } from 'lucide-react';
import { captureException } from '@/lib/monitoring/sentry';
import { fnv1a32 } from '@/lib/patches/hash';

const SPIRITUAL_MESSAGES = [
  "Mesmo nas sombras, a luz interior continua acesa.",
  "O universo às vezes precisa de uma pausa para se realinhar.",
  "Toda tempestade é seguida de bonança. Respire fundo.",
  "O caminho se reconstrói com cada passo que você dá.",
];

function detectLocale(): 'pt-BR' | 'en' {
  if (typeof navigator === 'undefined') return 'pt-BR';
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'pt-BR';
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = detectLocale();
  const message = SPIRITUAL_MESSAGES[Math.floor(Math.random() * SPIRITUAL_MESSAGES.length)] ?? SPIRITUAL_MESSAGES[0]!;
  const fingerprint = fnv1a32(`${error.name}|${error.message}|${error.digest ?? ""}`);

  useEffect(() => {
    // Report to Sentry (no-op if DSN not configured).
    try {
      captureException(error, {
        tags: { route: 'app-error-boundary', fingerprint },
        level: 'error',
      });
    } catch {
      // Sentry is best-effort; never break the error page itself.
    }
  }, [error, fingerprint]);

  const supportHref = `mailto:suporte@cabaladoscaminhos.app?subject=${encodeURIComponent(
    `[Erro] ${fingerprint.slice(0, 8)}`,
  )}&body=${encodeURIComponent(
    locale === 'en'
      ? `I encountered an error.\n\nFingerprint: ${fingerprint}\nDigest: ${error.digest ?? '—'}\nMessage: ${error.message}\n\nSteps to reproduce:\n1. \n2. \n3. `
      : `Encontrei um erro.\n\nFingerprint: ${fingerprint}\nDigest: ${error.digest ?? '—'}\nMensagem: ${error.message}\n\nPassos para reproduzir:\n1. \n2. \n3. `,
  )}`;

  return (
    <CosmicBackground variant="default">
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-red-400 rounded-full animate-twinkle opacity-60" aria-hidden="true" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-red-300 rounded-full animate-twinkle opacity-40" style={{ animationDelay: '0.5s' }} aria-hidden="true" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl" aria-hidden="true" />

        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-red-500/30 shadow-[0_0_60px_rgba(239,68,68,0.2)]">
              <AlertTriangle className="w-12 h-12 text-red-400 animate-pulse" />
            </div>
          </div>

          <div className="mb-6">
            <span className="text-[100px] sm:text-[140px] font-playfair font-bold bg-gradient-to-b from-red-400/30 to-red-600/10 bg-clip-text text-transparent leading-none select-none">
              500
            </span>
          </div>

          <div className="mb-8">
            <MysticDivider variant="bold" className="max-w-xs mx-auto" />
          </div>

          <Heading variant="display" glow="gold" className="mb-6">
            {locale === 'en' ? 'A misstep in the cosmic flow' : 'Um tropeço no fluxo cósmico'}
          </Heading>

          <p className="text-lg text-slate-400 mb-8 font-raleway leading-relaxed">
            {locale === 'en'
              ? 'Something unexpected happened while processing your request. The error has been recorded — please try again or return home.'
              : 'Algo inesperado aconteceu ao processar sua solicitação. O erro foi registrado — tente novamente ou volte para o início.'}
          </p>

          <div className="mb-12 p-6 rounded-2xl bg-white/5 border border-amber-500/20">
            <p className="text-amber-300/80 font-cormorant italic text-lg">
              &ldquo;{message}&rdquo;
            </p>
          </div>

          <div className="mb-12">
            <MysticDivider variant="subtle" className="max-w-xs mx-auto" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={reset}
              className="group flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-semibold hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all font-raleway"
            >
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              {locale === 'en' ? 'Try again' : 'Tentar novamente'}
            </button>
            <Link href="/">
              <MysticButton variant="golden" size="lg">
                <Home className="w-5 h-5 mr-2" />
                {locale === 'en' ? 'Go home' : 'Voltar ao início'}
              </MysticButton>
            </Link>
            <a
              href={supportHref}
              className="group flex items-center gap-3 px-8 py-4 rounded-xl border border-amber-500/30 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-300 font-raleway"
            >
              <Mail className="w-5 h-5" />
              <span>{locale === 'en' ? 'Report this' : 'Reportar'}</span>
            </a>
          </div>

          <div className="mt-12 pt-8 border-t border-amber-500/10">
            <p className="text-slate-500 text-xs font-raleway">
              <Compass className="w-3 h-3 inline mr-1" />
              {locale === 'en' ? 'Fingerprint' : 'Fingerprint'}:{' '}
              <code className="font-mono">{fingerprint}</code>
              {error.digest && (
                <> · digest: <code className="font-mono">{error.digest}</code></>
              )}
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-slate-600 text-xs font-raleway">
            Cabala dos Caminhos · Tecnologia Sagrada
          </p>
        </div>
      </div>
    </CosmicBackground>
  );
}