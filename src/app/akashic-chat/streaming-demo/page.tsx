'use client';

// ============================================================================
// Streaming Demo Page — W94-A
// ============================================================================
// Cycle 94 · 2026-06-30
// Server-component-like shell that wires up the streaming engine against
// the mock SSE endpoint at /api/mock-stream. This is the canonical
// integration reference for the Akasha IA chat.
//
// pt-BR canonical. Stubs for en/es via W92-i18n keys.
// Mobile-first: 44px tap targets, safe-area-inset padding.
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { StreamingMessage } from '@/components/akashic/StreamingMessage';
import { StreamingControls } from '@/components/akashic/StreamingControls';
import type {
  ConnectionStatus,
} from '@/components/akashic/StreamingControls';
import {
  createStreamController,
  type StreamController,
  type TokenBatch,
} from '@/lib/w94/streaming-chat';

// ============================================================================
// Constants (sacred + LGPD-safe)
// ============================================================================

const MOCK_URL = '/api/mock-stream';
const MAX_TOKENS = 200;
const ASSEMBLY_BUFFER_MAX = 50_000;

const COPY = Object.freeze({
  pageTitle: 'Streaming Akasha — Demo',
  pageSubtitle:
    'Demonstração de streaming da Akasha IA. Cadência meditativa, conexão segura, pts-BR canônico.',
  backAffordance: 'Voltar para o chat',
  startAffordance: 'Iniciar transmissão',
  traditionChip: 'Tradição: Candomblé',
  legendTitle: 'Como funciona',
  legendBody:
    'A Akasha transmite tokens em ritmo meditativo (12-40ms entre lotes). Os termos sagrados passam intactos. Conexão encriptada, LGPD respeitado.',
});

// ============================================================================
// DemoPage
// ============================================================================

export default function StreamingDemoPage() {
  const [text, setText] = useState<string>('');
  const [status, setStatus] = useState<ConnectionStatus>('ocioso' as ConnectionStatus);
  const [attempt, setAttempt] = useState<number>(0);
  const [tradition, setTradition] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const ctrlRef = useRef<StreamController | null>(null);

  // ─────────────────────────────────────────────────────────────────────
  // initial reduced-motion detection
  // ─────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // ─────────────────────────────────────────────────────────────────────
  // Stream lifecycle
  // ─────────────────────────────────────────────────────────────────────

  const stop = useCallback(() => {
    ctrlRef.current?.abort('user-abort');
    ctrlRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (ctrlRef.current !== null) {
        ctrlRef.current.abort('unmount');
        ctrlRef.current = null;
      }
    };
  }, []);

  const start = useCallback(() => {
    if (ctrlRef.current !== null) {
      ctrlRef.current.abort('restart');
      ctrlRef.current = null;
    }
    setText('');
    setTradition(null);
    const ctrl = createStreamController({
      url: MOCK_URL,
    });
    ctrlRef.current = ctrl;
    setStatus('conectando');
    let lastTokens = 0;
    let lastChars = 0;

    // Wire callbacks via the controller's history/state observation loop.
    // We poll because the controller is opaque about its internal callbacks.
    const interval = setInterval(() => {
      const s = ctrl.state();
      switch (s.kind) {
        case 'idle':
          setStatus('ocioso');
          setAttempt(0);
          break;
        case 'connecting':
          setStatus('conectando');
          setAttempt(s.attempt);
          break;
        case 'streaming':
          setStatus('transmitindo');
          setAttempt(s.attempt);
          break;
        case 'done':
          setStatus('concluído');
          setAttempt(s.attempt);
          break;
        case 'error':
          setStatus('erro');
          setAttempt(s.attempt);
          break;
        case 'aborted':
          setStatus('ocioso');
          break;
      }
      const h = ctrl.history();
      if (h.length > 0) {
        const newest = h[h.length - 1] as TokenBatch;
        if (newest.chars !== lastChars || h.length !== lastTokens) {
          lastTokens = h.length;
          lastChars = newest.chars;
          const assembled = ctrl.collect();
          setText(assembled.length > ASSEMBLY_BUFFER_MAX ? assembled.slice(-ASSEMBLY_BUFFER_MAX) : assembled);
        }
      }
    }, 50);
    (ctrl as unknown as { _wireInterval?: ReturnType<typeof setInterval> })._wireInterval = interval;

    // Trigger the actual fetch via the controller's internal connect — the
    // public API does not expose `connect`, so we rely on `forceRetry`.
    ctrl.forceRetry();
  }, []);

  // helper utilities — pause / resume / retry / wipe
  const onPause = useCallback(() => {
    ctrlRef.current?.pause();
    setStatus('pausado');
  }, []);

  const onResume = useCallback(() => {
    ctrlRef.current?.resume();
    setStatus('transmitindo');
  }, []);

  const onAbort = useCallback(() => {
    stop();
    setStatus('ocioso');
  }, [stop]);

  const onRetry = useCallback(() => {
    ctrlRef.current?.forceRetry();
  }, []);

  const onWipeHistory = useCallback(() => {
    stop();
    setText('');
    setTradition(null);
  }, [stop]);

  const buttons = useMemo(() => {
    if (status === 'ocioso') {
      return (
        <div className="flex justify-center pt-6">
          <button
            type="button"
            onClick={start}
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-full bg-amber-500 text-slate-950 font-medium hover:bg-amber-400 active:scale-95 transition"
            data-action="start"
          >
            <Sparkles aria-hidden="true" className="w-4 h-4" />
            {COPY.startAffordance}
          </button>
        </div>
      );
    }
    return null;
  }, [status, start]);

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 text-slate-100" data-page="akasha-streaming-demo">
      <header className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles aria-hidden="true" className="w-4 h-4 text-amber-400" />
            <span className="text-caps text-tiny text-amber-300">IA Curadora · Demo</span>
          </div>
          <h1 className="text-h2 text-slate-50">{COPY.pageTitle}</h1>
          <p className="text-body text-slate-400 max-w-xl mt-1">{COPY.pageSubtitle}</p>
          <Link
            href="/akashic-chat"
            className="inline-flex items-center gap-1.5 mt-3 text-body-sm text-amber-300 hover:text-amber-200"
          >
            <ArrowLeft aria-hidden="true" className="w-3.5 h-3.5" />
            {COPY.backAffordance}
          </Link>
        </div>
      </header>

      <section className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-6" aria-label="Demonstração de transmissão">
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-4 sm:p-5 mb-6">
          <h2 className="text-caps text-tiny text-amber-300 mb-1">{COPY.legendTitle}</h2>
          <p className="text-body-sm text-slate-300">{COPY.legendBody}</p>
        </div>

        <StreamingMessage
          text={text}
          streaming={status === 'conectando' || status === 'transmitindo'}
          sacredChip={tradition ?? (status === 'concluído' ? COPY.traditionChip : null)}
          reducedMotion={reducedMotion}
          onUserScrolled={() => {
            /* future: surface "scrolled away" hint */
          }}
        />

        {buttons}
      </section>

      <StreamingControls
        status={status}
        attempt={attempt}
        onPause={onPause}
        onResume={onResume}
        onAbort={onAbort}
        onRetry={onRetry}
        onWipeHistory={onWipeHistory}
      />
    </main>
  );
}

export const metadata = {
  title: 'Akasha Streaming — Demo',
  description:
    'Demonstração do streaming de respostas da Akasha IA — cadência meditativa e LGPD seguro.',
};
