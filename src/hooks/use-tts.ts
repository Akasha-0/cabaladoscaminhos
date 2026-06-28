'use client';

// ============================================================================
// useTTS — React hook para Text-to-Speech via Web Speech API (Wave 25)
// ============================================================================
// Encapsula a FSM `idle → loading → playing → error` em torno de
// `window.speechSynthesis`, com cleanup, cancel-on-respeak e SSR-safety.
//
// Por que extrair de VoiceButton (W12) → hook:
//   - Reuso em qualquer superfície que precise narrar (futuro: articles,
//     events, RSS reader, dashboard alerts).
//   - Possibilita adicionar teclado/atalhos sem acoplar ao componente.
//   - Testabilidade: o hook é puro (efeitos colaterais só no useEffect),
//     enquanto o componente vira só a UI.
//
// Trade-off conhecido: Web Speech API não permite controle fino de voz
// (pausar/resumir com pitch diferente, SSML). Quando migrarmos pra
// ElevenLabs/OpenAI TTS server-side, este hook ganha um backend alternativo
// que retorna uma URL de áudio — a interface pública não muda.
//
// SSR-safe: detecção acontece em useEffect. Em SSR `supported=true` por
// default (sem hydration mismatch), mas nada quebra porque o componente é
// client-only.
// ============================================================================

import { useCallback, useEffect, useRef, useState } from 'react';

export type TTSState = 'idle' | 'loading' | 'playing' | 'error';
export type TTSLocale = 'pt-BR' | 'en-US' | 'es-ES';

export interface UseTTSOptions {
  /** Texto a ser narrado. Vazio/desconhecido → estado permanece `idle`. */
  text?: string;
  /** BCP-47 locale. Default `pt-BR`. */
  lang?: TTSLocale | string;
  /** Velocidade 0.1–10. Default 1.0. */
  rate?: number;
  /** Tom 0–2. Default 1.0. */
  pitch?: number;
  /** Volume 0–1. Default 1.0. */
  volume?: number;
  /** Auto-falar quando `text` muda. Default false (controle manual). */
  autoPlay?: boolean;
}

export interface UseTTSReturn {
  /** Estado atual da FSM. */
  state: TTSState;
  /** `true` se `window.speechSynthesis` existe no browser. */
  supported: boolean;
  /** `true` quando há texto para narrar. */
  hasContent: boolean;
  /** Inicia a narração (cancela qualquer utterance em andamento). */
  speak: () => void;
  /** Para a narração imediatamente. */
  stop: () => void;
  /** Toggle play/stop. */
  toggle: () => void;
}

export function useTTS(options: UseTTSOptions = {}): UseTTSReturn {
  const {
    text = '',
    lang = 'pt-BR',
    rate = 1.0,
    pitch = 1.0,
    volume = 1.0,
    autoPlay = false,
  } = options;

  const [state, setState] = useState<TTSState>('idle');
  const [supported, setSupported] = useState<boolean>(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const autoPlayRef = useRef<boolean>(autoPlay);

  // ─── Detect support once on mount (SSR-safe) ────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          /* Safari throws on closed utterance — safe to ignore. */
        }
      }
    };
  }, []);

  // ─── Keep autoPlay ref fresh without re-creating speak() ───────────
  useEffect(() => {
    autoPlayRef.current = autoPlay;
  }, [autoPlay]);

  const trimmed = (text ?? '').trim();
  const hasContent = trimmed.length > 0;

  const speak = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setState('error');
      return;
    }
    if (!hasContent) return;

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      utterance.onstart = () => setState('playing');
      utterance.onend = () => setState('idle');
      utterance.onerror = () => setState('error');

      utteranceRef.current = utterance;
      setState('loading');
      window.speechSynthesis.speak(utterance);
    } catch {
      setState('error');
    }
  }, [hasContent, trimmed, lang, rate, pitch, volume]);

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
    } finally {
      setState('idle');
    }
  }, []);

  const toggle = useCallback(() => {
    if (state === 'playing' || state === 'loading') {
      stop();
    } else {
      speak();
    }
  }, [state, speak, stop]);

  // ─── Auto-play quando `text` muda (opt-in) ──────────────────────────
  // Útil para devs/testes. Em produção, manter `autoPlay: false` e expor
  // um toggle explícito nas settings (ver roadmap Voice Mode W25).
  useEffect(() => {
    if (autoPlayRef.current && hasContent && supported && state === 'idle') {
      speak();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trimmed]);

  return {
    state,
    supported,
    hasContent,
    speak,
    stop,
    toggle,
  };
}

export default useTTS;