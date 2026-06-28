'use client';

/**
 * useSoundEffects — feedback sonoro opcional (WebAudio API)
 * ----------------------------------------------------------------------------
 * Gera tons curtos via OscillatorNode (zero assets, zero custo de rede).
 * Toggle persistido em localStorage (`akasha.soundEnabled`).
 *
 * Defaults:
 *   - enabled = false (opt-in — respeita usuários sensíveis a som)
 *   - volume  = 0.18 (gentil, não compete com narração)
 *
 * Refs:
 *   - MDN WebAudio: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
 *   - A11y: WCAG 1.4.2 — som deve ser dispensável e ≤ 3× em 1s
 *
 * Uso:
 *   const { play: playSubmit } = useSoundEffects();
 *   <button onClick={() => { playSubmit(); submit(); }}>Enviar</button>
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type SoundName =
  | 'tap'        // click genérico — freq 880Hz, 40ms
  | 'submit'     // submit/chime — freq 660→880Hz, 120ms
  | 'success'    // confirmação — freq 880→1320Hz, 220ms
  | 'error'      // erro — freq 220Hz, 300ms (sawtooth)
  | 'notification' // notificação — two-tone 1320/1100Hz
  | 'like';      // like — bell-like 1100Hz pluck

interface ToneSpec {
  /** Frequency in Hz — single value OR sequence (each element ~50ms). */
  freq: number | number[];
  /** Duration of each tone in ms. */
  duration: number;
  /** Oscillator type. */
  type?: OscillatorType;
  /** Volume envelope (0..1). */
  gain?: number;
}

const TONE_TABLE: Record<SoundName, ToneSpec> = {
  tap:           { freq: 880,   duration: 40,  type: 'sine',     gain: 0.12 },
  submit:        { freq: [660, 880], duration: 60, type: 'sine', gain: 0.14 },
  success:       { freq: [880, 1100, 1320], duration: 80, type: 'sine', gain: 0.18 },
  error:         { freq: 220,   duration: 300, type: 'sawtooth', gain: 0.10 },
  notification:  { freq: [1320, 1100], duration: 90, type: 'sine', gain: 0.14 },
  like:          { freq: 1100,  duration: 90,  type: 'triangle', gain: 0.16 },
};

const STORAGE_KEY = 'akasha.soundEnabled';

function readStoredPreference(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === 'true';
  } catch {
    return false;
  }
}

function writeStoredPreference(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {
    // Silent — quota / private mode
  }
}

export interface UseSoundEffectsOptions {
  /** Override default volume (0..1). Default 0.18. */
  volume?: number;
  /** Override default enabled state (default = read from localStorage). */
  enabled?: boolean;
}

export interface UseSoundEffectsReturn {
  /** Current enabled state. */
  enabled: boolean;
  /** Toggle sound on/off and persist. */
  setEnabled: (next: boolean) => void;
  /** Whether WebAudio API is available. */
  isSupported: boolean;
  /** Play a named sound. */
  play: (name: SoundName) => void;
  /** Pre-bound helpers. */
  tap: () => void;
  submit: () => void;
  success: () => void;
  error: () => void;
  notification: () => void;
  like: () => void;
}

export function useSoundEffects(options: UseSoundEffectsOptions = {}): UseSoundEffectsReturn {
  const { volume = 0.18 } = options;
  const ctxRef = useRef<AudioContext | null>(null);
  const [enabled, setEnabledState] = useState<boolean>(() => {
    if (options.enabled !== undefined) return options.enabled;
    return readStoredPreference();
  });
  const [isSupported, setIsSupported] = useState<boolean>(false);

  // Detect WebAudio support (lazy — only when needed)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supported = typeof window.AudioContext !== 'undefined'
      || typeof (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext !== 'undefined';
    setIsSupported(supported);
  }, []);

  // Sync across tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue !== null) {
        setEnabledState(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    writeStoredPreference(next);
  }, []);

  const play = useCallback(
    (name: SoundName) => {
      if (!enabled) return;
      if (typeof window === 'undefined') return;

      // Lazy-init AudioContext (avoid autoplay warnings on first paint)
      if (!ctxRef.current) {
        const AC = window.AudioContext
          || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AC) return;
        try {
          ctxRef.current = new AC();
        } catch {
          return;
        }
      }
      const ctx = ctxRef.current;
      // Resume if suspended (Safari/iOS gate)
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const spec = TONE_TABLE[name];
      const freqs = Array.isArray(spec.freq) ? spec.freq : [spec.freq];
      const baseGain = spec.gain ?? 0.15;
      const masterGain = Math.min(1, baseGain / 0.18) * volume;
      const now = ctx.currentTime;

      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = spec.type ?? 'sine';
        osc.frequency.setValueAtTime(freq, now + i * (spec.duration / 1000));
        // Quick attack-decay envelope (avoids click pop)
        gain.gain.setValueAtTime(0.0001, now + i * (spec.duration / 1000));
        gain.gain.exponentialRampToValueAtTime(masterGain, now + i * (spec.duration / 1000) + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + (i + 1) * (spec.duration / 1000));
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * (spec.duration / 1000));
        osc.stop(now + (i + 1) * (spec.duration / 1000) + 0.01);
      });
    },
    [enabled, volume],
  );

  return useMemo(
    () => ({
      enabled,
      setEnabled,
      isSupported,
      play,
      tap: () => play('tap'),
      submit: () => play('submit'),
      success: () => play('success'),
      error: () => play('error'),
      notification: () => play('notification'),
      like: () => play('like'),
    }),
    [enabled, setEnabled, isSupported, play],
  );
}

export default useSoundEffects;
