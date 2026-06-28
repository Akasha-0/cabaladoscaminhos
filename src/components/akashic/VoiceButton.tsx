'use client';

// ============================================================================
// VoiceButton — TTS mode for Akashic chat (Wave 12 — 2026-06-27)
//                Wave 19 server-side upgrade (2026-06-28)
// ============================================================================
//
// Two TTS paths, both zero-config defaults:
//
//   1. Client-only (default)  — window.speechSynthesis.
//      Zero cost, zero infra, works in Chromium / Safari / Firefox.
//      pt-BR voice ships in all modern browsers.
//
//   2. Server (opt-in via `ttsEndpoint` prop) — POSTs to `/api/akashic/tts`
//      and plays the returned mp3 via HTMLAudioElement. Routes through
//      google_cloud / google_free / elevenlabs adapters (see
//      src/lib/tts/providers.ts). Falls back to client Web Speech if the
//      server returns 503 or any non-2xx. Cache-friendly: identical text +
//      voice returns HIT-L2 from disk on subsequent calls.
//
// Lifecycle (client):
//   idle ──click──► loading ──voices ready──► playing ──end──► idle
//      ▲                                              │
//      └──────────────── stop ──────────────────────┘
//
// Lifecycle (server):
//   idle ──click──► fetching ──mp3 ready──► playing ──end──► idle
//      ▲                                  │
//      └──────────── stop ──────────────┘
//
// SSR-safe (checks `typeof window` + `'speechSynthesis' in window`).
// Cleans up on unmount — no zombie utterances / audio elements.
//
// Mobile-first: hit-target 44×44 minimum (Apple HIG / WCAG 2.5.5).
// Accessible: aria-label, aria-pressed, focus-visible ring.
// ============================================================================

import { Volume2, VolumeX, Square, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

type VoiceState = 'idle' | 'loading' | 'playing' | 'error';
type TtsMode = 'client' | 'server';

export interface VoiceButtonProps {
  /** Texto completo da resposta da Akasha. */
  text: string;
  /** BCP-47 lang tag. Default 'pt-BR'. */
  lang?: string;
  /** Velocidade (0.1–10). Default 1.0. */
  rate?: number;
  /** Tom (0–2). Default 1.0. */
  pitch?: number;
  /**
   * Optional server endpoint. When set, the button first POSTs here for a
   * cached mp3; if the server returns 503 or fails, it falls back to the
   * client Web Speech API silently.
   *
   * Default: undefined → client-only Web Speech API (Wave 12 behavior).
   * Pass `'auto'` to use the built-in `/api/akashic/tts` route.
   */
  ttsEndpoint?: string | 'auto';
  className?: string;
}

const DEFAULT_TTS_ENDPOINT = '/api/akashic/tts';

// ============================================================================
// Component
// ============================================================================

export function VoiceButton({
  text,
  lang = 'pt-BR',
  rate = 1.0,
  pitch = 1.0,
  ttsEndpoint,
  className,
}: VoiceButtonProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [supported, setSupported] = useState<boolean>(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Resolve the endpoint once. `'auto'` → built-in default; explicit string → use it.
  const endpoint = ttsEndpoint ? (ttsEndpoint === 'auto' ? DEFAULT_TTS_ENDPOINT : ttsEndpoint) : null;

  // Detect support once on mount (SSR-safe).
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
    }
    return () => {
      // Cancel any in-flight speech when this button unmounts.
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          /* ignore — Safari throws on closed utterance */
        }
      }
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.src = '';
        } catch {
          /* ignore */
        }
        audioRef.current = null;
      }
    };
  }, []);

  // Trim empty/whitespace-only messages — no point playing silence.
  const trimmed = text?.trim() ?? '';
  const hasContent = trimmed.length > 0;

  // ─── Server-side TTS (Wave 19) ────────────────────────────────────────
  const speakServer = useCallback(async (): Promise<boolean> => {
    if (!endpoint || !hasContent) return false;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          voiceId: undefined, // server picks a sensible default per locale
          locale: lang === 'pt-BR' || lang === 'en' || lang === 'es' ? lang : 'pt-BR',
          rate,
        }),
      });
      if (!res.ok) {
        // 503 → no provider configured. Fall through to client.
        return false;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setState('idle');
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        setState('error');
      };
      setState('loading');
      await audio.play();
      setState('playing');
      return true;
    } catch {
      return false;
    }
  }, [endpoint, hasContent, trimmed, lang, rate]);

  // ─── Client-side TTS (Wave 12 — fallback path) ────────────────────────
  const speakClient = useCallback(() => {
    if (!supported || !hasContent) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.onstart = () => setState('playing');
      utterance.onend = () => setState('idle');
      utterance.onerror = () => setState('error');
      utteranceRef.current = utterance;
      setState('loading');
      window.speechSynthesis.speak(utterance);
    } catch {
      setState('error');
    }
  }, [supported, hasContent, trimmed, lang, rate, pitch]);

  // Top-level entry: server first, client fallback. SSR-safe (no fetch on server).
  const speak = useCallback(async () => {
    if (!hasContent) return;
    if (endpoint && typeof window !== 'undefined') {
      const ok = await speakServer();
      if (ok) return;
      // fall through to client
    }
    speakClient();
  }, [endpoint, hasContent, speakServer, speakClient]);

  const stop = useCallback(() => {
    // Stop whichever path is active.
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
    }
    setState('idle');
  }, []);

  // ─── Unsupported fallback ────────────────────────────────────────────
  if (!supported) {
    return (
      <button
        type="button"
        disabled
        aria-label="Leitura em voz alta não suportada neste navegador"
        title="TTS não suportado"
        className={cn(
          'inline-flex h-11 min-h-[44px] min-w-[44px] items-center justify-center gap-1.5',
          'rounded-full bg-slate-900/40 px-3 text-xs text-slate-500 opacity-50',
          'ring-1 ring-slate-800/50 cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60',
          className,
        )}
      >
        <VolumeX className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Sem áudio</span>
      </button>
    );
  }

  // ─── Normal states: idle / loading / playing / error ─────────────────
  const isActive = state === 'loading' || state === 'playing';
  const label = state === 'error'
    ? 'Erro ao reproduzir áudio — toque para tentar novamente'
    : isActive
      ? 'Parar leitura em voz alta'
      : 'Ouvir resposta em voz alta';

  return (
    <button
      type="button"
      onClick={isActive ? stop : speak}
      disabled={!hasContent && state !== 'playing'}
      aria-label={label}
      aria-pressed={isActive}
      aria-live="polite"
      title={state === 'error' ? 'Erro ao reproduzir' : isActive ? 'Parar' : 'Ouvir'}
      className={cn(
        // Layout — 44×44 touch target
        'inline-flex h-11 min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full px-3 text-xs',
        // Resting style
        'bg-slate-900/40 text-slate-200 ring-1 ring-slate-700/50',
        // Hover / focus
        'transition-colors hover:bg-slate-800/70 hover:text-amber-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60',
        // Active press
        'active:scale-[0.97]',
        // Error state
        state === 'error' && 'ring-red-700/60 text-red-300 hover:text-red-200',
        className,
      )}
    >
      {state === 'loading' && (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      )}
      {state === 'playing' && <Square className="h-3.5 w-3.5" aria-hidden />}
      {(state === 'idle' || state === 'error') && (
        <Volume2 className="h-4 w-4" aria-hidden />
      )}
      <span className="hidden sm:inline">
        {state === 'error' ? 'Erro' : isActive ? 'Parar' : 'Ouvir'}
      </span>
    </button>
  );
}

export default VoiceButton;
