/**
 * w31/voice-tts-ui
 *
 * TTS (text-to-speech) UI controller for the Akasha voice mode. Wraps
 * w27/voice-mode (the runtime session) and w28/voice-mode-player (the
 * audio player) with UI-level concerns:
 *  - play/pause/stop state machine
 *  - sentence-by-sentence highlighting
 *  - voice picker (PT-BR / EN / ES voices)
 *  - rate/pitch sliders
 *  - "Akasha fala" badge state
 *
 * PURE module: state reducer + helpers. The actual SpeechSynthesis
 * integration lives in the calling component.
 */

export type TtsLocale = "pt-BR" | "en-US" | "es-ES";

export type VoiceModeTurnRole = "user" | "akasha" | "system";

export interface VoiceModeTurn {
  id: string;
  role: VoiceModeTurnRole;
  content: string;
  audioUrl?: string;
  startedAt?: string;
  endedAt?: string;
}

export interface VoiceModeSession {
  id: string;
  startedAt: string;
  endedAt: string | null;
  currentTurnId: string | null;
  turns: VoiceModeTurn[];
  isListening: boolean;
  isSpeaking: boolean;
  transcriptBuffer: string;
}

export interface VoicePlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  positionMs: number;
  durationMs: number;
  error: string | null;
  isLoaded: boolean;
}

export interface TtsVoiceOption {
  voiceId: string;
  displayName: string;
  locale: TtsLocale;
  gender: "male" | "female" | "neutral";
  isAkasha: boolean;
}

export interface TtsUiState {
  session: VoiceModeSession;
  player: VoicePlayerState;
  isSpeaking: boolean;
  isPaused: boolean;
  currentTurnId: string | null;
  currentSentenceIndex: number;
  currentSentenceCharStart: number;
  currentSentenceCharEnd: number;
  voice: TtsVoiceOption;
  rate: number;
  pitch: number;
  volume: number;
  highlightEnabled: boolean;
  autoScrollEnabled: boolean;
}

export type TtsUiAction =
  | { type: "TICK_PLAYER"; player: VoicePlayerState }
  | { type: "SPEAK_TURN"; turn: VoiceModeTurn; voice: TtsVoiceOption }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "STOP" }
  | { type: "SET_VOICE"; voice: TtsVoiceOption }
  | { type: "SET_RATE"; rate: number }
  | { type: "SET_PITCH"; pitch: number }
  | { type: "SET_VOLUME"; volume: number }
  | { type: "SET_HIGHLIGHT"; enabled: boolean }
  | { type: "SET_AUTOSCROLL"; enabled: boolean }
  | { type: "ADVANCE_SENTENCE" };

export const DEFAULT_VOICES: TtsVoiceOption[] = [
  { voiceId: "akasha-pt-BR-female", displayName: "Akasha (pt-BR)", locale: "pt-BR", gender: "female", isAkasha: true },
  { voiceId: "akasha-pt-BR-male", displayName: "Akasha Voz Aberta (pt-BR)", locale: "pt-BR", gender: "male", isAkasha: true },
  { voiceId: "akasha-en-US-female", displayName: "Akasha (en-US)", locale: "en-US", gender: "female", isAkasha: true },
  { voiceId: "akasha-es-ES-female", displayName: "Akasha (es-ES)", locale: "es-ES", gender: "female", isAkasha: true },
];

export function defaultVoiceForLocale(locale: TtsLocale): TtsVoiceOption {
  const v = DEFAULT_VOICES.find((v) => v.locale === locale && v.isAkasha);
  return v ?? DEFAULT_VOICES[0]!;
}

export function splitSentences(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/(?<=[.!?…])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function sentenceCharRange(
  fullText: string,
  sentenceIndex: number,
): { start: number; end: number } {
  const sentences = splitSentences(fullText);
  if (sentenceIndex < 0 || sentenceIndex >= sentences.length) {
    return { start: 0, end: 0 };
  }
  const target = sentences[sentenceIndex]!;
  const start = fullText.indexOf(target);
  const end = start + target.length;
  return { start: start < 0 ? 0 : start, end: end < 0 ? 0 : end };
}

export function ttsUiReducer(state: TtsUiState, action: TtsUiAction): TtsUiState {
  switch (action.type) {
    case "TICK_PLAYER":
      return { ...state, player: action.player, isSpeaking: action.player.isPlaying, isPaused: action.player.isPaused };

    case "SPEAK_TURN": {
      const range = sentenceCharRange(action.turn.content, 0);
      return {
        ...state,
        session: { ...state.session, currentTurnId: action.turn.id },
        currentTurnId: action.turn.id,
        currentSentenceIndex: 0,
        currentSentenceCharStart: range.start,
        currentSentenceCharEnd: range.end,
        voice: action.voice,
        isSpeaking: true,
        isPaused: false,
      };
    }

    case "PAUSE":
      return { ...state, isPaused: true, isSpeaking: false };

    case "RESUME":
      return { ...state, isPaused: false, isSpeaking: true };

    case "STOP":
      return {
        ...state,
        isSpeaking: false,
        isPaused: false,
        currentTurnId: null,
        currentSentenceIndex: 0,
        currentSentenceCharStart: 0,
        currentSentenceCharEnd: 0,
      };

    case "SET_VOICE":
      return { ...state, voice: action.voice };

    case "SET_RATE":
      return { ...state, rate: clamp(action.rate, 0.5, 2.0) };

    case "SET_PITCH":
      return { ...state, pitch: clamp(action.pitch, -12, 12) };

    case "SET_VOLUME":
      return { ...state, volume: clamp(action.volume, 0, 1) };

    case "SET_HIGHLIGHT":
      return { ...state, highlightEnabled: action.enabled };

    case "SET_AUTOSCROLL":
      return { ...state, autoScrollEnabled: action.enabled };

    case "ADVANCE_SENTENCE": {
      if (!state.currentTurnId) return state;
      const turn = state.session.turns.find((t) => t.id === state.currentTurnId);
      if (!turn) return state;
      const total = splitSentences(turn.content).length;
      const next = state.currentSentenceIndex + 1;
      if (next >= total) {
        return { ...state, isSpeaking: false, isPaused: false, currentSentenceIndex: next };
      }
      const range = sentenceCharRange(turn.content, next);
      return {
        ...state,
        currentSentenceIndex: next,
        currentSentenceCharStart: range.start,
        currentSentenceCharEnd: range.end,
      };
    }

    default:
      return state;
  }
}

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

export function initialTtsUiState(session: VoiceModeSession, locale: TtsLocale = "pt-BR"): TtsUiState {
  return {
    session,
    player: { isPlaying: false, isPaused: false, positionMs: 0, durationMs: 0, error: null, isLoaded: false },
    isSpeaking: false,
    isPaused: false,
    currentTurnId: null,
    currentSentenceIndex: 0,
    currentSentenceCharStart: 0,
    currentSentenceCharEnd: 0,
    voice: defaultVoiceForLocale(locale),
    rate: 1.0,
    pitch: 0,
    volume: 1.0,
    highlightEnabled: true,
    autoScrollEnabled: true,
  };
}

export function speakingBadgeLabel(state: TtsUiState): string {
  if (!state.isSpeaking) return "Akasha pronta";
  if (state.isPaused) return "Akasha em pausa";
  return "Akasha falando…";
}
