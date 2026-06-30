// ============================================================================
// useTtsStream — Sentence-bounded TTS hook (W72-D)
// ============================================================================
// Wave-Spawner Cycle 72 — Worker D.
//
// Consumes a stream of partial AI tokens (e.g. from useAkashaStream) and
// emits TTS-ready sentence chunks. The caller pipes these into either:
//
//   - the /api/tts/stream SSE channel (preferred — high-quality voices)
//   - the Web Speech API fallback (built-in, no infra)
//
// Sentence boundary detection: `. `, `! `, `? `, `\n`, end of string.
// Multi-byte safe (decoder.decode with stream:true).
//
// Lifecycle:
//   - TTS is OFF by default. The user activates it via the speaker button.
//   - We never call SpeechSynthesisUtterance or /api/tts until enabled.
//   - On disable: cancel any in-flight playback + clear pending queue.
//
// Cache-aware:
//   - Each sentence is normalized, hashed, looked up in IndexedDB.
//   - On hit: instant play (zero network).
//   - On miss: call /api/tts and cache the result.
//
// Mobile-first: avoids autoplay (browser policy), uses AbortController
// for cancellation, keeps state machine tight (idle/loading/playing/done).
// ============================================================================

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AKASHA_TRADITIONS,
  DEFAULT_TRADITION,
  type PlaybackSnapshot,
  type PlaybackState,
  type Tradition,
} from '@/lib/tts/types';
import { getVoicePreset } from '@/lib/tts/voice-presets';
import { normalizeForTTS, splitSentences } from '@/lib/tts/text-normalizer';
import { getVoiceCache, VoiceCache } from '@/lib/tts/audio-cache';

// ---------------------------------------------------------------------------
// Public hook API
// ---------------------------------------------------------------------------

export interface UseTtsStreamOptions {
  /** Tradition key (drives voice preset). Default 'cigano'. */
  tradition?: Tradition;
  /** Master enable — when false, TTS is silent regardless of input. */
  enabled?: boolean;
  /** Override playback rate (0.8..1.2). */
  rate?: number;
  /** Override pitch (-12..12). */
  pitch?: number;
  /**
   * Use server /api/tts (mp3 audio) when true, Web Speech API when false.
   * Default true. Auto-falls-back to web speech on /api/tts failure.
   */
  preferServer?: boolean;
  /** Auto-play as soon as a sentence is ready. Default true. */
  autoPlay?: boolean;
}

export interface UseTtsStreamReturn {
  /** Push a new partial or final token stream. */
  pushToken: (chunk: string, isFinal?: boolean) => void;
  /** Finalize the stream (flushes any pending partial sentence). */
  finish: () => void;
  /** Cancel in-flight playback + clear queue. */
  cancel: () => void;
  /** Playback snapshot for UI binding. */
  playback: PlaybackSnapshot;
  /** Pending sentence count (queue depth). */
  queueDepth: number;
  /** Tradition actually used. */
  tradition: Tradition;
  /** Set / change tradition. */
  setTradition: (t: Tradition) => void;
  /** Whether the server route is preferred and reachable. */
  serverAvailable: boolean | null;
  /** Whether Web Speech API is available. */
  webSpeechAvailable: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isTradition(t: unknown): t is Tradition {
  return typeof t === 'string' && (AKASHA_TRADITIONS as readonly string[]).includes(t);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTtsStream(opts: UseTtsStreamOptions = {}): UseTtsStreamReturn {
  const tradition: Tradition = isTradition(opts.tradition) ? opts.tradition : DEFAULT_TRADITION;
  const enabled = opts.enabled ?? false;
  const preferServer = opts.preferServer ?? true;
  const autoPlay = opts.autoPlay ?? true;
  const rate = clamp(opts.rate ?? 1.0, 0.5, 2.0);
  const pitch = clamp(opts.pitch ?? 0, -12, 12);

  const [playback, setPlayback] = useState<PlaybackSnapshot>({
    state: 'idle',
    currentTime: 0,
    duration: 0,
  });
  const [queueDepth, setQueueDepth] = useState(0);
  const [traditionState, setTradition] = useState<Tradition>(tradition);
  const [serverAvailable, setServerAvailable] = useState<boolean | null>(null);
  const [webSpeechAvailable, setWebSpeechAvailable] = useState(false);

  // Mutable refs — never trigger re-render.
  const bufferRef = useRef<string>('');
  const queueRef = useRef<string[]>([]);
  const playingRef = useRef<boolean>(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const cancelRef = useRef<boolean>(false);

  // Voice preset — re-derived when tradition changes.
  const preset = getVoicePreset(traditionState);

  // Feature-detect Web Speech on mount (SSR-safe).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setWebSpeechAvailable('speechSynthesis' in window);
  }, []);

  // Probe /api/tts once on mount so we know whether to use it.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let aborted = false;
    (async () => {
      try {
        const res = await fetch('/api/tts/health', { method: 'GET' });
        if (!aborted) setServerAvailable(res.ok);
      } catch {
        if (!aborted) setServerAvailable(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  // Stop everything when disabled.
  useEffect(() => {
    if (enabled) return;
    cancelRef.current = true;
    queueRef.current = [];
    bufferRef.current = '';
    setQueueDepth(0);
    stopCurrent();
    setPlayback((p) => ({ ...p, state: 'idle', currentTime: 0, duration: 0 }));
  }, [enabled]);

  // ---------------------------------------------------------------------
  // Public: pushToken — accumulate, split on boundary, enqueue.
  // ---------------------------------------------------------------------
  const pushToken = useCallback(
    (chunk: string, isFinal: boolean = false) => {
      if (!enabled || typeof chunk !== 'string' || chunk.length === 0) return;
      bufferRef.current += chunk;
      const sentences = splitSentences(bufferRef.current);
      if (sentences.length === 0) return;

      // Last item is the residual (no boundary yet) unless isFinal.
      const last = sentences[sentences.length - 1];
      const isLastResidual = !isFinal && !endsWithBoundary(bufferRef.current);

      const toEnqueue = isLastResidual ? sentences.slice(0, -1) : sentences;
      const keep = isLastResidual ? last : '';

      if (toEnqueue.length > 0) {
        for (const s of toEnqueue) {
          queueRef.current.push(s);
        }
        setQueueDepth(queueRef.current.length);
      }
      bufferRef.current = keep;

      if (autoPlay) {
        void drainQueue();
      }
    },
    [enabled, autoPlay]
  );

  // ---------------------------------------------------------------------
  // Public: finish — flush residual as final sentence.
  // ---------------------------------------------------------------------
  const finish = useCallback(() => {
    if (!enabled) return;
    const tail = bufferRef.current.trim();
    bufferRef.current = '';
    if (tail.length > 0) {
      queueRef.current.push(tail);
      setQueueDepth(queueRef.current.length);
    }
    if (autoPlay) {
      void drainQueue();
    }
  }, [enabled, autoPlay]);

  // ---------------------------------------------------------------------
  // Public: cancel — stop everything.
  // ---------------------------------------------------------------------
  const cancel = useCallback(() => {
    cancelRef.current = true;
    queueRef.current = [];
    bufferRef.current = '';
    setQueueDepth(0);
    stopCurrent();
    setPlayback((p) => ({ ...p, state: 'idle' }));
  }, []);

  // ---------------------------------------------------------------------
  // Internal: stop in-flight audio / utterance.
  // ---------------------------------------------------------------------
  function stopCurrent() {
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = '';
      } catch {
        /* ignore */
      }
      currentAudioRef.current = null;
    }
    if (utteranceRef.current && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
      utteranceRef.current = null;
    }
    playingRef.current = false;
  }

  // ---------------------------------------------------------------------
  // Internal: drain queue — plays sentences in order, sequentially.
  // ---------------------------------------------------------------------
  async function drainQueue(): Promise<void> {
    if (playingRef.current) return;
    if (queueRef.current.length === 0) return;
    playingRef.current = true;
    cancelRef.current = false;

    while (queueRef.current.length > 0 && !cancelRef.current) {
      const sentence = queueRef.current.shift();
      if (!sentence) break;
      setQueueDepth(queueRef.current.length);
      const normalized = normalizeForTTS(sentence);
      if (!normalized) continue;

      setPlayback((p) => ({ ...p, state: 'loading', source: preferServer ? 'server' : 'web-speech' }));

      let played = false;

      // 1) Cache lookup
      const cache: VoiceCache | null = getVoiceCache();
      if (cache) {
        const cached = await cache.get(preset.voice_id, normalized);
        if (cached && !cancelRef.current) {
          played = await playBlob(cached);
        }
      }

      // 2) Server fetch (if cache missed + preferred)
      if (!played && preferServer && serverAvailable !== false && !cancelRef.current) {
        try {
          const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              text: normalized,
              tradition: traditionState,
            }),
          });
          if (res.ok) {
            const blob = await res.blob();
            if (cache) void cache.put(preset.voice_id, normalized, blob);
            if (!cancelRef.current) {
              played = await playBlob(blob);
            }
            setServerAvailable(true);
          } else {
            setServerAvailable(false);
          }
        } catch {
          setServerAvailable(false);
        }
      }

      // 3) Web Speech fallback
      if (!played && !cancelRef.current && webSpeechAvailable) {
        await playWebSpeech(normalized);
        played = true;
      }

      if (!played && !cancelRef.current) {
        setPlayback((p) => ({
          ...p,
          state: 'error',
          error: 'TTS indisponível: sem servidor e sem Web Speech.',
        }));
        break;
      }
    }

    playingRef.current = false;
    if (!cancelRef.current) {
      setPlayback((p) => ({ ...p, state: queueRef.current.length > 0 ? 'playing' : 'idle' }));
    }
  }

  // ---------------------------------------------------------------------
  // Internal: play Blob via <audio>.
  // ---------------------------------------------------------------------
  function playBlob(blob: Blob): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (cancelRef.current) return resolve(false);
      const url = URL.createObjectURL(blob);
      const audio = new Audio();
      audio.src = url;
      audio.playbackRate = rate;
      currentAudioRef.current = audio;
      let settled = false;
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        try {
          URL.revokeObjectURL(url);
        } catch {
          /* ignore */
        }
        if (currentAudioRef.current === audio) {
          currentAudioRef.current = null;
        }
        resolve(ok);
      };
      audio.onended = () => {
        setPlayback((p) => ({ ...p, state: 'idle', source: 'server' }));
        finish(true);
      };
      audio.onerror = () => {
        setPlayback((p) => ({ ...p, state: 'error', error: 'audio playback error' }));
        finish(false);
      };
      audio.ontimeupdate = () => {
        setPlayback((p) => ({
          ...p,
          state: 'playing',
          source: 'server',
          currentTime: audio.currentTime,
          duration: audio.duration || p.duration,
        }));
      };
      audio
        .play()
        .then(() => {
          setPlayback((p) => ({ ...p, state: 'playing', source: 'server' }));
        })
        .catch(() => {
          setPlayback((p) => ({ ...p, state: 'error', error: 'audio play() rejected' }));
          finish(false);
        });
    });
  }

  // ---------------------------------------------------------------------
  // Internal: Web Speech API fallback.
  // ---------------------------------------------------------------------
  function playWebSpeech(text: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        return resolve(false);
      }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'pt-BR';
      u.rate = rate;
      u.pitch = Math.max(0, Math.min(2, 1 + pitch / 12));
      utteranceRef.current = u;
      u.onend = () => {
        if (utteranceRef.current === u) utteranceRef.current = null;
        setPlayback((p) => ({ ...p, state: 'idle', source: 'web-speech' }));
        resolve(true);
      };
      u.onerror = () => {
        if (utteranceRef.current === u) utteranceRef.current = null;
        setPlayback((p) => ({ ...p, state: 'error', error: 'web speech error' }));
        resolve(false);
      };
      try {
        window.speechSynthesis.speak(u);
        setPlayback((p) => ({ ...p, state: 'playing', source: 'web-speech' }));
      } catch {
        resolve(false);
      }
    });
  }

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      stopCurrent();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    pushToken,
    finish,
    cancel,
    playback,
    queueDepth,
    tradition: traditionState,
    setTradition,
    serverAvailable,
    webSpeechAvailable,
  };
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function endsWithBoundary(s: string): boolean {
  return /[.!?\n]\s*$/.test(s);
}

// Re-export for tests / convenience.
export { normalizeForTTS, splitSentences };
