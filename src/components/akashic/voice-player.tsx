'use client';

// ============================================================================
// VoicePlayer — TTS para respostas da Akasha IA (Wave 25 — 2026-06-28)
// ============================================================================
// Player de voz construído sobre `useTTS` (extraído em Wave 25 para
// permitir reuso). Mantém paridade de UX com VoiceButton (W12), mas adiciona:
//
//   - Suporte multilíngue: pt-BR (default) / en-US / es-ES.
//   - Atalho de teclado: `Espaço` play/pause quando o botão está focado.
//   - Modo "server-side" opcional: se `endpoint` é passado, faz POST para
//     `/api/akashic/tts` e toca o áudio retornado (placeholder para futura
//     migração pra ElevenLabs/OpenAI TTS).
//   - Modo "fallback" gracioso: se Web Speech API não existe, usa o endpoint
//     server-side como backup (se fornecido).
//
// Arquitetura Web Speech API → Server-side:
//
//   ┌──────────┐   speak()    ┌──────────────┐
//   │ <button> ├─────────────►│  useTTS hook │──► window.speechSynthesis
//   └──────────┘              └──────┬───────┘
//                                   │ fallback
//                                   ▼
//                            POST /api/akashic/tts  ──► <audio> element
//
// SSR-safe: mesma estratégia do VoiceButton (detecção em useEffect).
// Mobile-first: hit-target ≥ 44×44 px (Apple HIG / WCAG 2.5.5).
// ============================================================================

import {
  Volume2,
  VolumeX,
  Square,
  Loader2,
  Globe,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { cn } from '@/lib/utils';
import { useTTS, type TTSLocale } from '@/hooks/use-tts';

// ============================================================================
// Types
// ============================================================================

export interface VoicePlayerProps {
  /** Texto completo a ser narrado. Vazio → botão disabled. */
  text: string;
  /** Locale BCP-47. Default `pt-BR`. */
  locale?: TTSLocale;
  /** Velocidade 0.1–10. Default 1.0. */
  rate?: number;
  /** Tom 0–2. Default 1.0. */
  pitch?: number;
  /** Volume 0–1. Default 1.0. */
  volume?: number;
  /** Endpoint server-side (futuro ElevenLabs/OpenAI TTS). Opcional. */
  endpoint?: string;
  /** Mostra dropdown de locale. Default false (pt-BR fixo). */
  showLocaleSwitch?: boolean;
  /** Classes extras. */
  className?: string;
  /** ID único para aria-labelledby quando usado inline com label externo. */
  labelId?: string;
}

const LOCALES: Array<{ code: TTSLocale; label: string; flag: string }> = [
  { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
  { code: 'en-US', label: 'English', flag: '🇺🇸' },
  { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
];

// ============================================================================
// Component
// ============================================================================

export function VoicePlayer({
  text,
  locale = 'pt-BR',
  rate = 1.0,
  pitch = 1.0,
  volume = 1.0,
  endpoint,
  showLocaleSwitch = false,
  className,
  labelId,
}: VoicePlayerProps) {
  // Current locale (user can switch if showLocaleSwitch).
  const [activeLocale, setActiveLocale] = useState<TTSLocale>(locale);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [serverState, setServerState] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
  const generatedId = useId();
  const ariaLabelId = labelId ?? generatedId;

  // ─── Web Speech API (primary path) ─────────────────────────────────
  const tts = useTTS({
    text,
    lang: activeLocale,
    rate,
    pitch,
    volume,
  });

  // ─── Server-side TTS fallback (optional) ────────────────────────────
  const fetchServerAudio = useCallback(async () => {
    if (!endpoint) return null;
    setServerState('loading');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, locale: activeLocale }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { audioUrl?: string };
      if (!data.audioUrl) throw new Error('audioUrl missing');
      setServerState('playing');
      return data.audioUrl;
    } catch (err) {
      console.warn('[voice-player] server-side TTS failed:', err);
      setServerState('error');
      return null;
    }
  }, [endpoint, text, activeLocale]);

  const playServerAudio = useCallback(
    async (audioUrl: string) => {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      const audio = audioRef.current;
      audio.src = audioUrl;
      audio.onended = () => setServerState('idle');
      audio.onerror = () => setServerState('error');
      try {
        await audio.play();
      } catch {
        setServerState('error');
      }
    },
    [],
  );

  const stopServerAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setServerState('idle');
  }, []);

  // ─── Cleanup server audio on unmount ────────────────────────────────
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  // ─── Main click handler: tries web speech first, falls back to server
  const trimmed = (text ?? '').trim();
  const hasContent = trimmed.length > 0;
  const webSpeechActive = tts.state === 'playing' || tts.state === 'loading';
  const serverActive = serverState === 'playing' || serverState === 'loading';
  const isActive = webSpeechActive || serverActive;
  const isError = tts.state === 'error' || serverState === 'error';

  const handleToggle = useCallback(async () => {
    if (isActive) {
      tts.stop();
      stopServerAudio();
      return;
    }
    // Try web speech first (works in 95%+ of modern browsers).
    if (tts.supported && hasContent) {
      tts.speak();
      return;
    }
    // Fallback: server-side.
    if (endpoint) {
      const url = await fetchServerAudio();
      if (url) await playServerAudio(url);
    }
  }, [isActive, tts, stopServerAudio, endpoint, hasContent, fetchServerAudio, playServerAudio]);

  // ─── Keyboard: Space toggles when button is focused ─────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle],
  );

  // ─── Unsupported fallback (no web speech AND no endpoint) ───────────
  if (!tts.supported && !endpoint) {
    return (
      <button
        type="button"
        disabled
        aria-labelledby={ariaLabelId}
        className={cn(
          'inline-flex h-11 min-h-[44px] min-w-[44px] items-center justify-center gap-1.5',
          'rounded-full bg-slate-900/40 px-3 text-xs text-slate-500 opacity-50',
          'ring-1 ring-slate-800/50 cursor-not-allowed',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60',
          className,
        )}
      >
        <VolumeX className="h-4 w-4" aria-hidden />
        <span id={ariaLabelId} className="hidden sm:inline">
          Sem áudio
        </span>
      </button>
    );
  }

  // ─── Primary button states ──────────────────────────────────────────
  const label =
    tts.state === 'error' || serverState === 'error'
      ? 'Erro ao reproduzir áudio — toque para tentar novamente'
      : isActive
        ? 'Parar leitura em voz alta'
        : 'Ouvir resposta em voz alta';

  const currentLocaleMeta = LOCALES.find((l) => l.code === activeLocale);

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={!hasContent && !isActive}
        aria-labelledby={ariaLabelId}
        aria-pressed={isActive}
        aria-live="polite"
        title={
          isError
            ? 'Erro ao reproduzir'
            : isActive
              ? 'Parar (ou pressione Espaço)'
              : 'Ouvir (ou pressione Espaço)'
        }
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
          isError && 'ring-red-700/60 text-red-300 hover:text-red-200',
        )}
      >
        {tts.state === 'loading' || serverState === 'loading' ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : isActive ? (
          <Square className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Volume2 className="h-4 w-4" aria-hidden />
        )}
        <span id={ariaLabelId} className="hidden sm:inline">
          {isError ? 'Erro' : isActive ? 'Parar' : 'Ouvir'}
        </span>
      </button>

      {showLocaleSwitch && (
        <select
          aria-label="Idioma da narração"
          value={activeLocale}
          onChange={(e) => setActiveLocale(e.target.value as TTSLocale)}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'h-11 min-h-[44px] rounded-full bg-slate-900/40 px-2 text-xs text-slate-300',
            'ring-1 ring-slate-700/50 focus:outline-none focus:ring-2 focus:ring-amber-400/60',
            'cursor-pointer hover:bg-slate-800/70',
          )}
          title={`Idioma: ${currentLocaleMeta?.label ?? activeLocale}`}
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.label}
            </option>
          ))}
        </select>
      )}

      {!showLocaleSwitch && currentLocaleMeta && (
        <span
          aria-hidden
          className="inline-flex h-7 items-center gap-1 rounded-full bg-slate-900/30 px-2 text-[10px] text-slate-400 ring-1 ring-slate-800/40"
          title={`Narrado em ${currentLocaleMeta.label}`}
        >
          <Globe className="h-3 w-3" />
          {currentLocaleMeta.flag}
        </span>
      )}
    </span>
  );
}

export default VoicePlayer;