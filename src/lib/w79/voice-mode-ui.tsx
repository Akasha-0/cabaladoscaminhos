// W79 voice-mode-ui — React component for "Akasha fala" voice-mode controls.
// Mobile-first, accessible (WCAG AA), with keyboard shortcuts, live region,
// voice selector dropdown, download buttons, progress bar, play/pause/stop.
// Pure React, no Next.js imports — works in any React 18+ runtime.

import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  type VoiceId, type VoicePreset, type PlaybackState, type VoiceSession,
  type SynthesisRequest, TRADITION_DISPLAY, TRADITION_IDS,
  listVoices, listVoicesByTradition, getVoice, getDefaultVoiceForTradition,
  buildSynthesisRequest, createSession, play, pause, resume, stop,
  onStateChange, getKeyboardShortcuts, getScreenReaderAnnouncement,
  buildAudioFilename, hashSynthesisRequest, isSome, _resetTTSForTests,
} from './voice-mode-tts.ts';

// =====================================================================
// PROPS
// =====================================================================

export type VoiceModeUIProps = {
  /** Text from Akasha IA response — required, must be non-empty */
  readonly text: string;
  /** Initial tradition; defaults to 'CIGANO' */
  readonly initialTradition?: typeof TRADITION_IDS[number];
  /** Optional className for layout integration */
  readonly className?: string;
  /** Optional id for test selectors */
  readonly id?: string;
  /** Optional download callback (browser builds blob; in pure-TS environments it's a no-op) */
  readonly onDownload?: (filename: string, content: string) => void;
  /** Locale for labels — defaults to pt-BR */
  readonly locale?: 'pt-BR' | 'en';
  /** Whether to start muted (LGPD-friendly default) */
  readonly defaultMuted?: boolean;
};

// =====================================================================
// CONSTANTS
// =====================================================================

const MIN_TOUCH_TARGET_PX = 44;
const DEFAULT_AUTOPLAY = false;

// =====================================================================
// MAIN COMPONENT
// =====================================================================

export function VoiceModeUI(props: VoiceModeUIProps): React.ReactElement {
  const {
    text,
    initialTradition = 'CIGANO',
    className = '',
    id = 'voice-mode-ui',
    onDownload,
    locale = 'pt-BR',
    defaultMuted = true,
  } = props;

  // --- State ---
  const [tradition, setTradition] = useState<typeof TRADITION_IDS[number]>(initialTradition);
  const [voiceId, setVoiceId] = useState<VoiceId>(getDefaultVoiceForTradition(initialTradition).id);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [muted, setMuted] = useState<boolean>(defaultMuted);
  const [autoPlayApproved, setAutoPlayApproved] = useState<boolean>(DEFAULT_AUTOPLAY);
  const [request, setRequest] = useState<SynthesisRequest | null>(null);
  const [liveMessage, setLiveMessage] = useState<string>('');
  const sessionRef = useRef<VoiceSession | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  // --- Build synthesis request when text changes ---
  useEffect(() => {
    const vOpt = getVoice(voiceId);
    if (!isSome(vOpt)) return;
    const voice = (vOpt as { kind: 'some'; value: VoicePreset }).value;
    const result = buildSynthesisRequest(text, voice);
    if (result.ok) {
      setRequest(result.value);
      setDurationMs(result.value.estimatedDurationMs);
    }
  }, [text, voiceId]);

  // --- Subscribe to session state changes ---
  useEffect(() => {
    if (!request) return;
    const vOpt = getVoice(voiceId);
    if (!isSome(vOpt)) return;
    const sessVoice = (vOpt as { kind: 'some'; value: VoicePreset }).value;
    const session = createSession(request, { autoPlayApproved });
    sessionRef.current = session;
    const unsub = onStateChange(session, (s) => {
      setPlaybackState(s);
      setLiveMessage(getScreenReaderAnnouncement(s, sessVoice.displayPt).text);
    });
    unsubRef.current = unsub;
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, [request, autoPlayApproved]);

  // --- Voice preset lookup ---
  const voice = useMemo(() => {
    const v = getVoice(voiceId);
    return v && v.kind === 'some' ? (v.value as VoicePreset) : getDefaultVoiceForTradition(tradition);
  }, [voiceId, tradition]);

  // --- Handlers ---
  const handlePlayPause = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;
    if (!autoPlayApproved) setAutoPlayApproved(true);
    let next: VoiceSession;
    if (session.state === 'playing') next = pause(session);
    else if (session.state === 'paused') next = resume(session);
    else next = play(session);
    sessionRef.current = next;
    setPlaybackState(next.state);
    if (next.state === 'playing') {
      // simulate progress
      const startPos = next.positionMs;
      const tick = window.setInterval(() => {
        setPositionMs((p) => {
          const np = p + 250;
          if (np >= durationMs) { window.clearInterval(tick); return durationMs; }
          return np;
        });
      }, 250);
      // store tick for cleanup on pause/stop
      (next as unknown as { _tick?: number })._tick = tick;
    }
  }, [autoPlayApproved, durationMs]);

  const handleStop = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;
    const next = stop(session);
    sessionRef.current = next;
    setPlaybackState(next.state);
    setPositionMs(0);
    if ((session as unknown as { _tick?: number })._tick) {
      window.clearInterval((session as unknown as { _tick: number })._tick);
    }
  }, []);

  const handleSeek = useCallback((ms: number) => {
    const session = sessionRef.current;
    if (!session) return;
    const next = play === undefined ? session : (() => {
      // reuse engine seek — but we don't import it here to keep dependencies tight
      // since seek is exported, use a dynamic lookup
      return session;
    })();
    setPositionMs(Math.max(0, Math.min(ms, durationMs)));
    void next; // engine seek not bound to UI directly; React-only update suffices for progress bar
  }, [durationMs]);

  const handleVoiceChange = useCallback((newVoiceId: string) => {
    if (handleStop) handleStop();
    setVoiceId(newVoiceId as VoiceId);
    setPositionMs(0);
  }, []);

  const handleTraditionChange = useCallback((newTradition: typeof TRADITION_IDS[number]) => {
    if (handleStop) handleStop();
    setTradition(newTradition);
    setVoiceId(getDefaultVoiceForTradition(newTradition).id);
    setPositionMs(0);
  }, []);

  const handleDownload = useCallback((format: 'wav' | 'mp3') => {
    if (!voice || !request) return;
    const filename = buildAudioFilename(voice, format);
    if (onDownload) onDownload(filename, request.id as string);
    // In browser, the actual blob download would happen via a service worker or API;
    // here we expose the filename via callback for the host app to wire up.
  }, [voice, request, onDownload]);

  const handleMuteToggle = useCallback(() => setMuted((m) => !m), []);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      const shortcuts = getKeyboardShortcuts();
      const sc = shortcuts.find((s) => s.key === e.key);
      if (!sc) return;
      // Ignore if user is typing in an input
      const tag = (e.target as HTMLElement | null)?.tagName ?? '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      switch (sc.action) {
        case 'play-pause': handlePlayPause(); break;
        case 'stop': handleStop(); break;
        case 'seek-forward': handleSeek(Math.min(durationMs, positionMs + 10000)); break;
        case 'seek-backward': handleSeek(Math.max(0, positionMs - 10000)); break;
        case 'mute': handleMuteToggle(); break;
        case 'volume-up':
        case 'volume-down':
          // No-op in this scaffold; volume is per-voice preset
          break;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); };
  }, [handlePlayPause, handleStop, handleSeek, handleMuteToggle, durationMs, positionMs]);

  // --- Derived ---
  const voiceOptions = listVoicesByTradition(tradition);
  const progressPct = durationMs > 0 ? Math.round((positionMs / durationMs) * 100) : 0;
  const sacredTerms = request?.sacredTermsDetected ?? [];
  const buttonStyle: React.CSSProperties = {
    minWidth: `${MIN_TOUCH_TARGET_PX}px`,
    minHeight: `${MIN_TOUCH_TARGET_PX}px`,
    padding: '8px 16px',
    border: '1px solid currentColor',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: '8px',
    fontSize: '16px',
    color: 'inherit',
  };

  const labelPlay = locale === 'pt-BR' ? 'Tocar' : 'Play';
  const labelPause = locale === 'pt-BR' ? 'Pausar' : 'Pause';
  const labelStop = locale === 'pt-BR' ? 'Parar' : 'Stop';
  const labelTradition = locale === 'pt-BR' ? 'Tradição' : 'Tradition';
  const labelVoice = locale === 'pt-BR' ? 'Voz' : 'Voice';
  const labelProgress = locale === 'pt-BR' ? 'Progresso da fala' : 'Speech progress';
  const labelDownloadWav = locale === 'pt-BR' ? 'Baixar .wav' : 'Download .wav';
  const labelDownloadMp3 = locale === 'pt-BR' ? 'Baixar .mp3' : 'Download .mp3';
  const labelMute = muted
    ? (locale === 'pt-BR' ? 'Ativar som' : 'Unmute')
    : (locale === 'pt-BR' ? 'Silenciar' : 'Mute');

  return (
    <div
      id={id}
      className={`voice-mode-ui ${className}`}
      role="region"
      aria-label={locale === 'pt-BR' ? 'Akasha fala — modo de voz' : 'Akasha speaks — voice mode'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        maxWidth: '480px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* === Tradition selector === */}
      <div role="group" aria-labelledby={`${id}-tradition-label`}>
        <label id={`${id}-tradition-label`} htmlFor={`${id}-tradition`} style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>
          {labelTradition}
        </label>
        <select
          id={`${id}-tradition`}
          value={tradition}
          onChange={(e) => handleTraditionChange(e.target.value as typeof TRADITION_IDS[number])}
          aria-label={labelTradition}
          style={{
            ...buttonStyle,
            width: '100%',
            textAlign: 'left',
          }}
        >
          {TRADITION_DISPLAY.map((t) => (
            <option key={t.id} value={t.id}>
              {locale === 'pt-BR' ? t.pt : t.en}
            </option>
          ))}
        </select>
      </div>

      {/* === Voice selector === */}
      <div role="group" aria-labelledby={`${id}-voice-label`}>
        <label id={`${id}-voice-label`} htmlFor={`${id}-voice`} style={{ display: 'block', fontWeight: 600, marginBottom: '4px' }}>
          {labelVoice}
        </label>
        <select
          id={`${id}-voice`}
          value={voiceId as string}
          onChange={(e) => handleVoiceChange(e.target.value)}
          aria-label={labelVoice}
          style={{
            ...buttonStyle,
            width: '100%',
            textAlign: 'left',
          }}
        >
          {voiceOptions.map((v) => (
            <option key={v.id as string} value={v.id as string}>
              {v.emoji} {locale === 'pt-BR' ? v.displayPt : v.displayEn} ({v.formality}, grav.{v.gravitas})
            </option>
          ))}
        </select>
      </div>

      {/* === Transport controls === */}
      <div role="group" aria-label={locale === 'pt-BR' ? 'Controles de reprodução' : 'Playback controls'}
        style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handlePlayPause}
          aria-label={playbackState === 'playing' ? labelPause : labelPlay}
          aria-pressed={playbackState === 'playing'}
          style={buttonStyle}
          data-testid={`${id}-play-pause`}
        >
          {playbackState === 'playing' ? `⏸ ${labelPause}` : `▶ ${labelPlay}`}
        </button>
        <button
          type="button"
          onClick={handleStop}
          aria-label={labelStop}
          style={buttonStyle}
          data-testid={`${id}-stop`}
          disabled={playbackState === 'idle'}
        >
          ⏹ {labelStop}
        </button>
        <button
          type="button"
          onClick={handleMuteToggle}
          aria-label={labelMute}
          aria-pressed={!muted}
          style={buttonStyle}
          data-testid={`${id}-mute`}
        >
          {muted ? '🔇' : '🔊'} {labelMute}
        </button>
      </div>

      {/* === Progress bar === */}
      <div role="group" aria-labelledby={`${id}-progress-label`}>
        <label id={`${id}-progress-label`} htmlFor={`${id}-progress`} style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
          {labelProgress}: {progressPct}%
        </label>
        <input
          id={`${id}-progress`}
          type="range"
          min={0}
          max={durationMs}
          value={positionMs}
          onChange={(e) => handleSeek(parseInt(e.target.value, 10))}
          aria-valuemin={0}
          aria-valuemax={durationMs}
          aria-valuenow={positionMs}
          aria-valuetext={`${Math.round(positionMs / 1000)}s de ${Math.round(durationMs / 1000)}s`}
          aria-label={labelProgress}
          style={{ width: '100%', minHeight: `${MIN_TOUCH_TARGET_PX}px` }}
        />
      </div>

      {/* === Download controls === */}
      <div role="group" aria-label={locale === 'pt-BR' ? 'Baixar áudio' : 'Download audio'}
        style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => handleDownload('wav')}
          aria-label={labelDownloadWav}
          style={buttonStyle}
          disabled={!request}
          data-testid={`${id}-download-wav`}
        >
          ⬇ {labelDownloadWav}
        </button>
        <button
          type="button"
          onClick={() => handleDownload('mp3')}
          aria-label={labelDownloadMp3}
          style={buttonStyle}
          disabled={!request}
          data-testid={`${id}-download-mp3`}
        >
          ⬇ {labelDownloadMp3}
        </button>
      </div>

      {/* === Sacred terms indicator (accessibility + transparency) === */}
      {sacredTerms.length > 0 && (
        <div
          aria-live="polite"
          aria-atomic="true"
          style={{ fontSize: '12px', opacity: 0.75 }}
          data-testid={`${id}-sacred-terms`}
        >
          {locale === 'pt-BR'
            ? `Termos sagrados detectados: ${sacredTerms.join(', ')}`
            : `Sacred terms detected: ${sacredTerms.join(', ')}`}
        </div>
      )}

      {/* === Live region for now-playing announcements === */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
        data-testid={`${id}-live-region`}
      >
        {liveMessage}
      </div>
    </div>
  );
}

// =====================================================================
// STANDALONE HOOK for engine usage in custom UIs
// =====================================================================

export type UseVoiceModeOptions = {
  readonly text: string;
  readonly initialTradition?: typeof TRADITION_IDS[number];
};

export type UseVoiceModeResult = {
  readonly voice: VoicePreset;
  readonly voiceId: VoiceId;
  readonly setVoiceId: (id: VoiceId) => void;
  readonly tradition: typeof TRADITION_IDS[number];
  readonly setTradition: (t: typeof TRADITION_IDS[number]) => void;
  readonly request: SynthesisRequest | null;
  readonly playbackState: PlaybackState;
  readonly requestHash: string | null;
};

export function useVoiceMode(opts: UseVoiceModeOptions): UseVoiceModeResult {
  const [tradition, setTradition] = useState<typeof TRADITION_IDS[number]>(opts.initialTradition ?? 'CIGANO');
  const [voiceId, setVoiceId] = useState<VoiceId>(getDefaultVoiceForTradition(tradition).id);
  const [request, setRequest] = useState<SynthesisRequest | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');

  const voice = useMemo<VoicePreset>(() => {
    const v = getVoice(voiceId);
    if (isSome(v)) return (v as { kind: 'some'; value: VoicePreset }).value;
    return getDefaultVoiceForTradition(tradition);
  }, [voiceId, tradition]);

  useEffect(() => {
    const result = buildSynthesisRequest(opts.text, voice);
    if (result.ok) {
      setRequest(result.value);
      const session = createSession(result.value, { autoPlayApproved: false });
      const unsub = onStateChange(session, setPlaybackState);
      return () => { unsub(); };
    }
    return undefined;
  }, [opts.text, voice]);

  const requestHash = request ? hashSynthesisRequest(request) : null;

  return { voice, voiceId, setVoiceId, tradition, setTradition, request, playbackState, requestHash };
}

// =====================================================================
// HELPERS exposed for app-level wiring
// =====================================================================

export function _listVoicesForUI(): ReadonlyArray<VoicePreset> {
  return listVoices();
}

export function _resetVoiceModeUIForTests(): void {
  _resetTTSForTests();
}
