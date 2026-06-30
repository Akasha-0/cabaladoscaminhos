'use client';

// ============================================================================
// /voice — Voice Mode for Akashic readings (W86-A)
// ============================================================================
// Mobile-first bottom-sheet (≤720px) → desktop two-column (≥880px).
// Plays markdown text via the W85-A voice-mode-akasha engine. Engine is
// pure — page wires up an adapter (Web Speech API in browser, InMemory in
// tests) and renders queue/player/tradição picker UI.
//
// A11y: aria-live="polite" on status, aria-current on active queue item,
// 48px tap targets, keyboard navigation on chips & buttons.
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  VoiceEngine,
  InMemoryVoiceAdapter,
  WebSpeechVoiceAdapter,
  VOICE_PRESETS,
  ALL_KNOWN_TRADICOES,
  type VoicePreset,
  type PlaybackState,
  type TradicaoId,
  type VoiceId,
} from '@/engine/voice';
import { h } from './h';

// ---------- Constants ----------

const TRADICAO_SYMBOLS: Readonly<Record<TradicaoId, string>> = Object.freeze({
  cigano: '✦',
  candomble: '🪶',
  umbanda: '☩',
  ifa: '◈',
  cabala: '☸',
  astrologia: '☉',
  tantra: '☬',
});

const TRADICAO_LABELS: Readonly<Record<TradicaoId, string>> = Object.freeze({
  cigano: 'Cigano',
  candomble: 'Candomblé',
  umbanda: 'Umbanda',
  ifa: 'Ifá',
  cabala: 'Cabala',
  astrologia: 'Astrologia',
  tantra: 'Tantra',
});

const SAMPLE_TEXT_BY_TRADICAO: Readonly<Record<TradicaoId, string>> =
  Object.freeze({
    cigano:
      'As cartas mostram um caminho de **renovação**. Confie no seu instinto.',
    candomble:
      'A iyá traz um banho de *axé*. Respire fundo e siga com o coração aberto.',
    umbanda:
      'Pai Ogum abre os caminhos. Sua espada corta o que precisa ser cortado.',
    cabala:
      'A sephirah de hoje é *Tiferet* — equilíbrio entre misericórdia e rigor.',
    astrologia:
      'O **Sol em Leão** ilumina a casa V. Hora de brilhar com autenticidade.',
    tantra:
      'A energia criativa sobe pela coluna. Permita-se sentir sem julgamento.',
    ifa: 'Ifá em breve — tradições do merindilogun serão integradas.',
  });

const TTS_ENGINES = [
  { id: 'web-speech', label: 'Web Speech API (browser)' },
  { id: 'in-memory', label: 'In-Memory (test/deterministic)' },
] as const;

type TtsEngineId = (typeof TTS_ENGINES)[number]['id'];

// ---------- Page ----------

export default function VoicePage() {
  const [tradicao, setTradicao] = useState<TradicaoId>('cigano');
  const [ttsEngine, setTtsEngine] = useState<TtsEngineId>('web-speech');
  const [text, setText] = useState<string>(SAMPLE_TEXT_BY_TRADICAO.cigano);
  const [queue, setQueue] = useState<ReadonlyArray<PlaybackState>>([]);
  const [current, setCurrent] = useState<PlaybackState | null>(null);
  const [status, setStatus] = useState<string>('Pronto para tocar');
  const [isMobile, setIsMobile] = useState<boolean>(true);

  const engineRef = useRef<VoiceEngine | null>(null);

  // Pick voice for current tradição
  const voiceForTradicao = useMemo<VoicePreset>(() => {
    const found = VOICE_PRESETS.find((v) => v.tradicao === tradicao);
    return found ?? VOICE_PRESETS[0]!;
  }, [tradicao]);

  // Mount/unmount — pick adapter based on env
  useEffect(() => {
    const adapter =
      ttsEngine === 'in-memory'
        ? new InMemoryVoiceAdapter()
        : new WebSpeechVoiceAdapter();
    const engine = new VoiceEngine(adapter);
    engineRef.current = engine;
    setStatus(
      adapter.isSupported()
        ? `Motor pronto: ${adapter.label}`
        : `Motor indisponível: ${adapter.label} (usando stub)`,
    );
    return () => {
      void engine.cancel();
      engineRef.current = null;
    };
  }, [ttsEngine]);

  // Track viewport for mobile-first breakpoint
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(min-width: 880px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile(!e.matches);
    handler(mql);
    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
    return undefined;
  }, []);

  // When tradição changes, swap sample text
  useEffect(() => {
    setText(SAMPLE_TEXT_BY_TRADICAO[tradicao]);
  }, [tradicao]);

  const refreshState = useCallback(() => {
    const e = engineRef.current;
    if (!e) return;
    setQueue(e.getQueue());
    setCurrent(e.getCurrent());
  }, []);

  const handlePlay = useCallback(async () => {
    const e = engineRef.current;
    if (!e) return;
    try {
      await e.play({ text, voiceId: voiceForTradicao.id as VoiceId });
      setStatus(`Reproduzindo com voz ${voiceForTradicao.label}`);
      refreshState();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setStatus(`Erro: ${msg}`);
    }
  }, [text, voiceForTradicao, refreshState]);

  const handlePause = useCallback(async () => {
    const e = engineRef.current;
    if (!e) return;
    await e.pause();
    setStatus('Pausado');
    refreshState();
  }, [refreshState]);

  const handleResume = useCallback(async () => {
    const e = engineRef.current;
    if (!e) return;
    await e.resume();
    setStatus('Retomando');
    refreshState();
  }, [refreshState]);

  const handleCancel = useCallback(async () => {
    const e = engineRef.current;
    if (!e) return;
    await e.cancel();
    setStatus('Cancelado');
    refreshState();
  }, [refreshState]);

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: '#faf7f2',
        color: '#1f1a17',
        padding: isMobile ? '16px' : '32px 48px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <h1
        style={{
          fontSize: isMobile ? '22px' : '28px',
          fontWeight: 600,
          margin: '0 0 8px',
        }}
      >
        Modo Voz · Akasha
      </h1>
      <p
        style={{
          fontSize: '14px',
          color: '#7a6f68',
          margin: '0 0 24px',
        }}
      >
        Ouça a leitura em voz alta, na tradição que ressoa com você hoje.
      </p>

      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          background: '#ffffff',
          border: '1px solid #e7e0d6',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '20px',
          fontSize: '14px',
          minHeight: '44px',
        }}
      >
        {status}
      </div>

      <section
        aria-labelledby="tradicao-heading"
        style={{
          background: '#ffffff',
          border: '1px solid #e7e0d6',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
        }}
      >
        <h2
          id="tradicao-heading"
          style={{
            fontSize: '15px',
            fontWeight: 600,
            margin: '0 0 12px',
          }}
        >
          Tradição
        </h2>
        <div
          role="radiogroup"
          aria-label="Escolha a tradição"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          {ALL_KNOWN_TRADICOES.map((t) => {
            const isSelected = t === tradicao;
            const isIfa = t === 'ifa';
            return (
              <button
                key={t}
                role="radio"
                aria-checked={isSelected}
                aria-current={isSelected ? 'true' : undefined}
                aria-label={`${TRADICAO_LABELS[t]}${isIfa ? ' (em breve)' : ''}`}
                disabled={isIfa}
                onClick={() => !isIfa && setTradicao(t)}
                style={{
                  minHeight: '48px',
                  minWidth: '48px',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  border: isSelected
                    ? '2px solid #7c3aed'
                    : '1px solid #d6cfc2',
                  background: isSelected ? '#f1ebff' : '#ffffff',
                  color: '#1f1a17',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: isIfa ? 'not-allowed' : 'pointer',
                  opacity: isIfa ? 0.5 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span aria-hidden="true">{TRADICAO_SYMBOLS[t]}</span>
                <span>{TRADICAO_LABELS[t]}</span>
                {isIfa && (
                  <span style={{ fontSize: '11px', color: '#7a6f68' }}>
                    (em breve)
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="tts-heading"
        style={{
          background: '#ffffff',
          border: '1px solid #e7e0d6',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
        }}
      >
        <h2
          id="tts-heading"
          style={{
            fontSize: '15px',
            fontWeight: 600,
            margin: '0 0 12px',
          }}
        >
          Motor de TTS
        </h2>
        <div
          role="radiogroup"
          aria-label="Escolha o motor de síntese de voz"
          style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          {TTS_ENGINES.map((eng) => {
            const isSelected = eng.id === ttsEngine;
            return (
              <label
                key={eng.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  minHeight: '44px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="tts-engine"
                  value={eng.id}
                  checked={isSelected}
                  onChange={() => setTtsEngine(eng.id)}
                  style={{ width: '20px', height: '20px' }}
                />
                <span style={{ fontSize: '14px' }}>{eng.label}</span>
              </label>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="text-heading"
        style={{
          background: '#ffffff',
          border: '1px solid #e7e0d6',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
        }}
      >
        <h2
          id="text-heading"
          style={{
            fontSize: '15px',
            fontWeight: 600,
            margin: '0 0 12px',
          }}
        >
          Texto
        </h2>
        <label htmlFor="voice-text" style={{ display: 'none' }}>
          Texto para reproduzir
        </label>
        <textarea
          id="voice-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={isMobile ? 4 : 6}
          aria-label="Texto para reproduzir em voz alta"
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #d6cfc2',
            fontSize: '15px',
            fontFamily: 'inherit',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      </section>

      <section
        aria-labelledby="controls-heading"
        style={{
          background: '#ffffff',
          border: '1px solid #e7e0d6',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          position: 'sticky',
          bottom: '16px',
        }}
      >
        <h2
          id="controls-heading"
          style={{
            fontSize: '15px',
            fontWeight: 600,
            margin: '0 0 12px',
          }}
        >
          Controles
        </h2>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={handlePlay}
            aria-label="Tocar texto"
            style={controlBtnStyle('#7c3aed', '#ffffff')}
          >
            ▶ Tocar
          </button>
          <button
            type="button"
            onClick={handlePause}
            aria-label="Pausar reprodução"
            style={controlBtnStyle('#ffffff', '#1f1a17')}
          >
            ❚❚ Pausar
          </button>
          <button
            type="button"
            onClick={handleResume}
            aria-label="Retomar reprodução"
            style={controlBtnStyle('#ffffff', '#1f1a17')}
          >
            ↻ Retomar
          </button>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Cancelar reprodução"
            style={controlBtnStyle('#ffffff', '#7a2020')}
          >
            ■ Cancelar
          </button>
        </div>
        <p
          style={{
            fontSize: '13px',
            color: '#7a6f68',
            margin: '12px 0 0',
          }}
        >
          Voz: <strong>{voiceForTradicao.label}</strong> ·{' '}
          {voiceForTradicao.voiceStyle}
        </p>
      </section>

      <section
        aria-labelledby="queue-heading"
        style={{
          background: '#ffffff',
          border: '1px solid #e7e0d6',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '32px',
        }}
      >
        <h2
          id="queue-heading"
          style={{
            fontSize: '15px',
            fontWeight: 600,
            margin: '0 0 12px',
          }}
        >
          Fila
        </h2>
        {current && (
          <div
            aria-current="true"
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: '#f1ebff',
              border: '1px solid #d6c8f5',
              marginBottom: '8px',
              fontSize: '14px',
            }}
          >
            <strong>Em reprodução:</strong> {current.cueId}
            <br />
            <span style={{ color: '#7a6f68' }}>
              {current.renderedText.slice(0, 80)}
              {current.renderedText.length > 80 ? '…' : ''}
            </span>
          </div>
        )}
        {queue.length === 0 && !current && (
          <p
            style={{
              fontSize: '14px',
              color: '#7a6f68',
              margin: 0,
            }}
          >
            Fila vazia.
          </p>
        )}
        <ul
          aria-label="Itens na fila"
          style={{ listStyle: 'none', padding: 0, margin: 0 }}
        >
          {queue.map((item) => (
            <li
              key={item.cueId}
              aria-current={current?.cueId === item.cueId ? 'true' : undefined}
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                background:
                  current?.cueId === item.cueId ? '#f1ebff' : '#faf7f2',
                border: '1px solid #e7e0d6',
                marginBottom: '6px',
                fontSize: '14px',
              }}
            >
              <strong>{item.cueId}</strong>
              <br />
              <span style={{ color: '#7a6f68' }}>
                {item.renderedText.slice(0, 80)}
                {item.renderedText.length > 80 ? '…' : ''}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

// ---------- Styles ----------

function controlBtnStyle(
  bg: string,
  fg: string,
): React.CSSProperties {
  return {
    minHeight: '48px',
    minWidth: '48px',
    padding: '12px 18px',
    borderRadius: '8px',
    border: bg === '#ffffff' ? '1px solid #d6cfc2' : 'none',
    background: bg,
    color: fg,
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    flex: '1 1 auto',
  };
}
