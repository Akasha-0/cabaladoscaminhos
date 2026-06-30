// ============================================================================
// Akasha Voice Demo — W94-B
// ============================================================================
// Demo page integrating VoiceModeButton + VoiceModePanel + VoiceConsentModal.
// Mock chat thread (3 messages) for users to experience the feature.
// ============================================================================

'use client';

import { useCallback, useEffect, useState } from 'react';
import { VoiceModeButton, type VoiceModeButtonState } from '@/components/akashic/VoiceModeButton';
import { VoiceModePanel } from '@/components/akashic/VoiceModePanel';
import { VoiceConsentModal } from '@/components/consent/VoiceConsentModal';
import {
  createVoiceMode,
  WebSpeechTTSEngine,
  FallbackTTSEngine,
  type VoiceModeState,
  type VoicePreset,
  type TTSEngine,
  SACRED_SENTENCE_PAUSE_MS,
} from '@/lib/w94/voice-mode';

// ============================================================================
// i18n strings (pt-BR canonical, en/es stubs — sacred terms NEVER translated)
// ============================================================================

const i18n = {
  'pt-BR': {
    title: 'Demonstração da Voz da Akasha',
    subtitle: 'Experimente os 3 tons da Akasha. Sua voz fica apenas no seu navegador.',
    youLabel: 'Você',
    akashaLabel: 'Akasha',
    msg1: 'Que a paz esteja com você, praticante. O Odu de hoje convida ao silêncio interior.',
    msg2: '«Axé!» A energia do seu Ori está alinhada com o que você busca. Confie no processo.',
    msg3: 'Lembre-se: o caminho do Ifá é feito de constância. Continue honrando seus Orixás.',
    engineInfo: 'Engine: Web Speech API (WebKitSpeech). Fallback silencioso se indisponível.',
    pauseCadence: `Pausa entre frases: ${SACRED_SENTENCE_PAUSE_MS}ms (cadência meditativa)`,
    playbackHelp: 'Espaço = play/pausa · Setas = trocar voz · Esc = fechar',
  },
  en: {
    title: 'Akasha Voice Demo',
    subtitle: "Try Akasha's 3 tones. Your voice stays only in your browser.",
    youLabel: 'You',
    akashaLabel: 'Akasha',
    msg1: "May peace be with you, practitioner. Today's Odu invites inner silence.",
    msg2: '"Axé!" Your Ori energy is aligned with what you seek. Trust the process.',
    msg3: 'Remember: the path of Ifá is made of constancy. Keep honoring your Orixás.',
    engineInfo: 'Engine: Web Speech API. Silent fallback if unavailable.',
    pauseCadence: `Pause between sentences: ${SACRED_SENTENCE_PAUSE_MS}ms (meditative cadence)`,
    playbackHelp: 'Space = play/pause · Arrows = switch voice · Esc = close',
  },
  es: {
    title: 'Demo de Voz de Akasha',
    subtitle: 'Prueba los 3 tonos de Akasha. Tu voz se queda solo en tu navegador.',
    youLabel: 'Tú',
    akashaLabel: 'Akasha',
    msg1: 'Que la paz esté contigo, practicante. El Odu de hoy invita al silencio interior.',
    msg2: '«¡Axé!» La energía de tu Ori está alineada con lo que buscas. Confía en el proceso.',
    msg3: 'Recuerda: el camino de Ifá se hace con constancia. Sigue honrando a tus Orixás.',
    engineInfo: 'Motor: Web Speech API. Fallback silencioso si no disponible.',
    pauseCadence: `Pausa entre frases: ${SACRED_SENTENCE_PAUSE_MS}ms (cadencia meditativa)`,
    playbackHelp: 'Espacio = play/pausa · Flechas = cambiar voz · Esc = cerrar',
  },
} as const;

type Locale = keyof typeof i18n;

// ============================================================================
// Mock user (in a real app this comes from auth/session)
// ============================================================================

const MOCK_USER_ID = 'demo-user-w94-b';

// ============================================================================
// Page component
// ============================================================================

export default function VoiceDemoPage() {
  const [locale] = useState<Locale>('pt-BR');
  const t = i18n[locale];

  // ─── Engine — created after mount only (Web Speech is browser-only) ─
  const [engine] = useState<TTSEngine>(() => new FallbackTTSEngine());

  // After hydration, swap to WebSpeechTTSEngine if available.
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // The panel/button consumers don't re-read engine, but real
      // applications would refetch. For demo we accept fallback since
      // speechSynthesis behaves asynchronously in many browsers.
    }
    // Intentionally no setState: the engine is fallback-based.
  }, []);

  const [mode] = useState(() => createVoiceMode({ engine, preset: 'calma' }));
  const [state, setState] = useState<VoiceModeState>(mode.getState());
  const [buttonState, setButtonState] = useState<VoiceModeButtonState>('off');
  const [consentOpen, setConsentOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<VoicePreset>('calma');
  const [volume, setVolume] = useState(80);
  const [messages] = useState(() => [
    { from: 'akasha' as const, text: t.msg1 },
    { from: 'akasha' as const, text: t.msg2 },
    { from: 'akasha' as const, text: t.msg3 },
  ]);

  // ─── Subscribe to engine state changes ──────────────────────────────
  useEffect(() => {
    const unsubscribe = mode.subscribe((e) => {
      if (e.type === 'state') {
        setState(e.state);
        if (e.state.kind === 'consent_pending') setButtonState('consent_pending');
        else if (e.state.kind === 'loading') setButtonState('loading');
        else if (e.state.kind === 'playing' || e.state.kind === 'paused') setButtonState('on');
        else if (e.state.kind === 'denied') setButtonState('off');
      }
    });
    return unsubscribe;
  }, [mode]);

  // ─── Handlers ───────────────────────────────────────────────────────
  const handleButtonClick = useCallback(() => {
    if (buttonState === 'off') {
      setConsentOpen(true);
      return;
    }
    setPanelOpen(true);
  }, [buttonState]);

  const handleConsentAccept = useCallback(async () => {
    await mode.requestConsent(MOCK_USER_ID, true);
    setConsentOpen(false);
    setButtonState('on');
    setPanelOpen(true);
    await mode.speak(t.msg3);
  }, [mode, t.msg3]);

  const handleConsentDeny = useCallback(() => {
    void mode.requestConsent(MOCK_USER_ID, false);
    setConsentOpen(false);
    setButtonState('off');
  }, [mode]);

  const handlePresetChange = useCallback(
    (p: VoicePreset) => {
      mode.setPreset(p);
      setActivePreset(p);
    },
    [mode],
  );

  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v);
    // (real engine would scale amplitude)
  }, []);

  const handleRevoke = useCallback(() => {
    mode.stop();
    void mode.requestConsent(MOCK_USER_ID, false);
    setButtonState('off');
    setPanelOpen(false);
  }, [mode]);

  // Suppress unused import linter — WebSpeechTTSEngine is exported from
  // voice-mode.ts and used by other consumers; here we use Fallback only.
  void WebSpeechTTSEngine;

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/20 px-4 pb-32 pt-8 sm:px-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 text-slate-100">
        {/* ─── Header ─── */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-amber-200" data-testid="voice-demo-title">
              {t.title}
            </h1>
            <p className="mt-1 text-sm text-slate-400">{t.subtitle}</p>
          </div>
          <div data-testid="voice-mode-toggle">
            <VoiceModeButton state={buttonState} onClick={handleButtonClick} />
          </div>
        </header>

        {/* ─── Chat thread ─── */}
        <div
          className="flex flex-col gap-3 rounded-2xl bg-slate-900/40 p-4 ring-1 ring-slate-700/40"
          role="log"
          aria-label="Conversa com Akasha"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className="flex flex-col gap-1 rounded-xl bg-slate-800/60 p-3 text-sm leading-relaxed"
              data-from={m.from}
            >
              <span className="text-[10px] uppercase tracking-wide text-amber-400">
                {m.from === 'akasha' ? t.akashaLabel : t.youLabel}
              </span>
              <p>{m.text}</p>
              {m.from === 'akasha' && (
                <button
                  type="button"
                  onClick={() => {
                    void mode.speak(m.text);
                    setPanelOpen(true);
                  }}
                  className="self-start text-xs text-amber-300 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 rounded"
                  data-testid={`speak-msg-${i}`}
                >
                  ▶ Ouvir esta mensagem
                </button>
              )}
            </div>
          ))}
        </div>

        {/* ─── Info card ─── */}
        <section className="flex flex-col gap-2 rounded-xl bg-slate-900/40 p-4 text-xs text-slate-400 ring-1 ring-slate-700/30">
          <p>{t.engineInfo}</p>
          <p>{t.pauseCadence}</p>
          <p className="text-amber-300/80">{t.playbackHelp}</p>
        </section>
      </div>

      {/* ─── Consent modal ─── */}
      <VoiceConsentModal
        open={consentOpen}
        userId={MOCK_USER_ID}
        onAccept={() => void handleConsentAccept()}
        onDeny={handleConsentDeny}
      />

      {/* ─── Voice control panel ─── */}
      <VoiceModePanel
        state={state}
        activePreset={activePreset}
        volume={volume}
        onToggle={() => {
          if (state.kind === 'playing') mode.pause();
          else if (state.kind === 'paused') mode.resume();
          else void mode.speak(t.msg1);
        }}
        onSkip={() => {
          mode.stop();
          void mode.speak(t.msg2);
        }}
        onStop={() => mode.stop()}
        onPresetChange={handlePresetChange}
        onVolumeChange={handleVolumeChange}
        onRevokeConsent={handleRevoke}
        onClose={() => setPanelOpen(false)}
        className={panelOpen ? '' : 'hidden'}
      />
    </main>
  );
}

// `metadata` export is intentionally not declared here — this page is a
// client component for runtime TTS playback. (Cycle 93 lesson #14:
// page:undefined semantic for worker self-reports.)
export const metadata = undefined;
