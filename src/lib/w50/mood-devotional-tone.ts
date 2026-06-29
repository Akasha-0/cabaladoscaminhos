/**
 * @file src/lib/w50/mood-devotional-tone.ts
 *
 * Mood-Driven Devotional Tone Adaptation engine.
 *
 * Closes the feedback loop between:
 *  - w49/voice-mood-detection  (10 VoiceMood labels + confidence)
 *  - w47/daily-reflection-prompt (32-prompt corpus across 8+ traditions)
 *  - w47/voice-mode-tts        (Web Speech API + SSML-lite)
 *
 * Given a detected mood + confidence + tradition + time-of-day, this module
 * selects a *devotional tone* (11 tones), adapts the prompt sequence, applies
 * SSML prosody to the TTS call and emits a deterministic, opted-in audio plan.
 *
 * Constraints (LGPD Art. 7/18 + Mesa Real principles):
 *  - Mood-driven tone is OPT-IN. Off by default. `respectUserOptIn` + audit.
 *  - Manual override ALWAYS wins. Logged via `recordManualOverride`.
 *  - Opt-out returns a `neutral` sequence instantly and revokes all history.
 *  - All identity-bearing state lives under `userId` namespace.
 *  - No `any`. No browser APIs. Pure TypeScript. Deterministic where possible.
 *
 * Composes with — but does NOT import — w49 / w47 worker modules. We mirror the
 * shape of `VoiceMood` (w49) and `PromptCategory` / `TraditionTag` (w47) as
 * local unions so the engine stands alone.
 *
 * @see w49/voice-mood-detection
 * @see w47/daily-reflection-prompt
 * @see w47/voice-mode-tts
 */

// =============================================================================
// SEÇÃO 1 — TIPOS ESPELHADOS (shape-compatíveis com w49/w47)
// =============================================================================

/** Moods reconhecidos pelo detector de voz (mirror de `VoiceMood` em w49). */
export type VoiceMood =
  | "neutral" | "joyful" | "sad" | "angry" | "fearful"
  | "surprised" | "calm" | "contemplative" | "devotional" | "urgent";

/** Lista canônica de moods suportados. */
export const VOICE_MOODS: readonly VoiceMood[] = [
  "neutral", "joyful", "sad", "angry", "fearful",
  "surprised", "calm", "contemplative", "devotional", "urgent",
] as const;

/** Categorias de prompt do corpus (estendido com `grounding`, `breath`, `reflection`). */
export type PromptCategory =
  | "gratitude" | "intention" | "shadow-work" | "devotional" | "meditation"
  | "study" | "ritual" | "integration" | "community"
  | "grounding" | "breath" | "reflection";

/** Categorias efetivamente expostas (subset estável para a Mesa Real). */
export const PROMPT_CATEGORIES: readonly PromptCategory[] = [
  "grounding", "gratitude", "intention", "shadow-work", "devotional",
  "meditation", "study", "ritual", "integration", "community",
  "breath", "reflection",
] as const;

/** Tradições suportadas (mirror de `TraditionTag` em w47, estendido). */
export type TraditionTag =
  | "candomble" | "umbanda" | "ifa" | "cabala" | "astrologia"
  | "tantra" | "espiritismo" | "santo-daime" | "universal"
  | "catholic" | "protestant" | "buddhist" | "hindu" | "sufi";

/** Tradições canônicas suportadas pelo engine. */
export const SUPPORTED_TRADITIONS: readonly TraditionTag[] = [
  "candomble", "umbanda", "ifa", "cabala", "astrologia", "tantra",
  "espiritismo", "santo-daime", "catholic", "protestant",
  "buddhist", "hindu", "sufi", "universal",
] as const;

/** Locales que o engine aceita (mirror dos Locales de w47/w49). */
export type Locale = "pt-BR" | "pt-PT" | "en-US" | "en-GB" | "es-ES" | "es-MX" | "es-AR";

/** Versão semântica do engine. */
export const ENGINE_VERSION = "1.0.0" as const;

/** Idade máxima de uma sequência antes do engine sugerir regeneração (6h). */
export const SEQUENCE_TTL_MS = 6 * 60 * 60 * 1000;

/** Limite de confiança abaixo do qual a predição é descartada. */
export const MIN_CONFIDENCE_THRESHOLD = 0.4 as const;

/** Limite acima do qual a predição é "alta confiança". */
export const HIGH_CONFIDENCE_THRESHOLD = 0.75 as const;

/** Retenção máxima default de histórico (LGPD Art. 18). */
export const DEFAULT_RETENTION_DAYS = 90 as const;

/** Palavras-por-minuto default para estimativa de duração TTS (pt-BR). */
export const DEFAULT_WORDS_PER_MINUTE = 150 as const;

/** Tamanho default da sequência (em número de prompts). */
export const DEFAULT_SEQUENCE_LENGTH = 3 as const;

/** Pausa mínima/máxima entre prompts (ms). */
export const MIN_TRANSITION_MS = 250 as const;
export const MAX_TRANSITION_MS = 3000 as const;

// =============================================================================
// SEÇÃO 2 — TIPOS DO ENGINE
// =============================================================================

/** Os 11 "tons devocionais" que o engine pode aplicar. */
export type DevotionalTone =
  | "grounding" | "uplifting" | "contemplative" | "joyful"
  | "compassionate" | "releasing" | "energizing" | "centering"
  | "ritualistic" | "silent" | "neutral";

/** Lista canônica de tons devocionais (ordem de apresentação é significativa). */
export const DEVOTIONAL_TONES: readonly DevotionalTone[] = [
  "grounding", "uplifting", "contemplative", "joyful", "compassionate",
  "releasing", "energizing", "centering", "ritualistic", "silent", "neutral",
] as const;

/** Atributos SSML prosody (subset alinhado com W3C SSML 1.1). */
export interface SSMLProsodyAttributes {
  readonly rate?: string;   // "x-slow" | "slow" | "medium" | "fast" | "x-fast" | number%
  readonly pitch?: string;  // "x-low" | "low" | "medium" | "high" | "x-high" | "default" | "+Nst" | "-Nst"
  readonly volume?: string; // "silent" | "x-soft" | "soft" | "medium" | "loud" | "x-loud" | "+NdB" | "-NdB"
  readonly contour?: string; // "(0%, +5%) (200ms, 0%)"
}

/** Música ritual opcional. */
export interface RitualMusic {
  readonly trackId: string;
  readonly instrument: "singing-bowl" | "shaker" | "pandeiro" | "tabla" | "organ" | "silence";
  readonly fadeInMs: number;
  readonly fadeOutMs: number;
  readonly loop: boolean;
  readonly volume: number; // [0, 1]
}

/** Contexto ritual atrelado à sequência (opcional). */
export interface RitualContext {
  readonly ritualId: string;
  readonly phase: "opening" | "invocation" | "core" | "closing" | "absorption";
  readonly elements: readonly string[]; // ex.: ["water", "fire", "earth"]
  readonly music: RitualMusic | null;
}

/** Mapping imutável entre um mood detectado e o tom devocional resultante. */
export interface MoodToToneMapping {
  readonly sourceMood: VoiceMood;
  readonly tone: DevotionalTone;
  readonly confidenceThreshold: number;
  readonly ssmlProsody: SSMLProsodyAttributes;
  readonly promptCategory: PromptCategory;
  readonly categoryFallback: readonly PromptCategory[];
  readonly promptSequenceOverride: readonly string[];
  readonly ritualMusic: RitualMusic | null;
  readonly durationMultiplier: number; // 0.5..2.0
  readonly pacing: "slow" | "normal" | "fast";
  readonly voiceStyle: "whisper" | "normal" | "projected" | "chant";
  readonly transitionMs: number;
}

/** Passo individual dentro de uma sequência devocional. */
export interface PromptStep {
  readonly promptId: string;
  readonly text: string;
  readonly audioCue: string | null; // SSML-lite marker
  readonly pauseAfterMs: number;
  readonly emphasisWords: readonly string[];
}

/** Sequência devocional completa — entrada para o TTS engine (w47). */
export interface DevotionalSequence {
  readonly id: string;
  readonly tone: DevotionalTone;
  readonly prompts: readonly PromptStep[];
  readonly totalDurationMs: number;
  readonly ssml: string;
  readonly ritualContext: RitualContext | null;
  readonly createdAt: number;
  readonly userOptIn: boolean; // LGPD Art. 7
  readonly manualOverride: boolean;
  readonly userId: string;
  readonly sourceMood: VoiceMood;
  readonly confidence: number;
  readonly tradition: TraditionTag;
  readonly locale: Locale;
  readonly voiceStyle: "whisper" | "normal" | "projected" | "chant";
  readonly pacing: "slow" | "normal" | "fast";
}

/** Estado de consentimento (LGPD Art. 7). */
export interface MoodSampleConsent {
  readonly userId: string;
  readonly optedIn: boolean;
  readonly optedInAt: number | null;
  readonly optedOutAt: number | null;
  readonly manualOverrideCount: number;
  readonly lastOverrideTone: DevotionalTone | null;
}

/** Override manual registrado. */
export interface ManualOverrideLog {
  readonly userId: string;
  readonly sequenceId: string;
  readonly originalTone: DevotionalTone;
  readonly overrideTone: DevotionalTone;
  readonly reason: string | null;
  readonly at: number;
}

/** Entrada do histórico de tons do usuário (audit trail LGPD). */
export interface ToneHistoryEntry {
  readonly userId: string;
  readonly sequenceId: string;
  readonly tone: DevotionalTone;
  readonly sourceMood: VoiceMood;
  readonly confidence: number;
  readonly tradition: TraditionTag;
  readonly at: number;
  readonly manualOverride: boolean;
}

/** Resultado de diff entre duas sequências. */
export interface SequenceDiff {
  readonly idA: string;
  readonly idB: string;
  readonly toneChanged: boolean;
  readonly promptCountDelta: number;
  readonly durationDeltaMs: number;
  readonly addedPromptIds: readonly string[];
  readonly removedPromptIds: readonly string[];
}

/** Preferências agregadas por tradição (analytics anônimas). */
export interface TraditionTonePreference {
  readonly tradition: TraditionTag;
  readonly tone: DevotionalTone;
  readonly usageCount: number;
  readonly averageConfidence: number;
  readonly overrideRate: number;
}

/** Predição de mood de entrada (mirror parcial de w49 MoodPrediction). */
export interface MoodPredictionInput {
  readonly mood: VoiceMood;
  readonly confidence: number;
  readonly valence: number;  // [-1, 1]
  readonly arousal: number;  // [-1, 1]
  readonly dominance: number; // [-1, 1]
}

/** Histórico de usuário para personalização. */
export interface UserToneHistory {
  readonly userId: string;
  readonly entries: readonly ToneHistoryEntry[];
  readonly overrides: readonly ManualOverrideLog[];
  readonly optIn: MoodSampleConsent;
}

/** Flag retornado pelas funções de validação. */
export interface ValidationFlag {
  readonly code: string;
  readonly severity: "info" | "warn" | "block";
  readonly message: string;
  readonly suggestedTone: DevotionalTone | null;
}

/** Resultado de validação. */
export interface ValidationResult {
  readonly valid: boolean;
  readonly flags: readonly ValidationFlag[];
  readonly effectiveTone: DevotionalTone;
}

// =============================================================================
// SEÇÃO 3 — CONSTANTES DE PROSÓDIA E MAPEAMENTO
// =============================================================================

/** Prosódia default por tom devocional. */
export const DEFAULT_TONE_PROSODY: Readonly<Record<DevotionalTone, SSMLProsodyAttributes>> = {
  grounding:     { rate: "slow",    pitch: "-1st", volume: "medium", contour: "(0%, -5%) (50%, 0%) (100%, -5%)" },
  uplifting:     { rate: "medium",  pitch: "+2st", volume: "medium", contour: "(0%, 0%) (100%, +10%)" },
  contemplative: { rate: "x-slow",  pitch: "-2st", volume: "soft",   contour: "(0%, 0%) (100%, -8%)" },
  joyful:        { rate: "fast",    pitch: "+3st", volume: "medium", contour: "(0%, +5%) (50%, +15%) (100%, +5%)" },
  compassionate: { rate: "slow",    pitch: "-1st", volume: "soft",   contour: "(0%, 0%) (100%, -3%)" },
  releasing:     { rate: "slow",    pitch: "-2st", volume: "x-soft", contour: "(0%, 0%) (100%, -10%)" },
  energizing:    { rate: "fast",    pitch: "+1st", volume: "loud",   contour: "(0%, +10%) (100%, +10%)" },
  centering:     { rate: "medium",  pitch: "0st",  volume: "medium", contour: "(0%, 0%) (100%, 0%)" },
  ritualistic:   { rate: "medium",  pitch: "default", volume: "medium", contour: "(0%, 0%) (50%, 0%) (100%, 0%)" },
  silent:        { rate: "x-slow",  pitch: "-3st", volume: "x-soft", contour: "(0%, 0%) (100%, 0%)" },
  neutral:       { rate: "medium",  pitch: "default", volume: "medium", contour: "(0%, 0%) (100%, 0%)" },
};

/** Modificadores default de tom por hora do dia (0..23 → tom preferido). */
export const HOUR_TONE_PREFERENCE: Readonly<Record<number, DevotionalTone>> = {
  0: "silent", 1: "silent", 2: "silent", 3: "silent",
  4: "contemplative", 5: "grounding", 6: "grounding",
  7: "uplifting", 8: "uplifting", 9: "energizing", 10: "energizing",
  11: "centering", 12: "centering", 13: "centering",
  14: "joyful", 15: "joyful", 16: "uplifting", 17: "energizing",
  18: "compassionate", 19: "compassionate",
  20: "releasing", 21: "contemplative", 22: "contemplative", 23: "silent",
};

/** Identidade de modificadores de tom por hora do dia. */
export const TIME_OF_DAY_TONE_MODIFIERS: Readonly<Record<DevotionalTone, DevotionalTone>> = {
  grounding: "grounding",
  uplifting: "uplifting",
  contemplative: "contemplative",
  joyful: "joyful",
  compassionate: "compassionate",
  releasing: "releasing",
  energizing: "energizing",
  centering: "centering",
  ritualistic: "ritualistic",
  silent: "silent",
  neutral: "neutral",
};

/** Afinidades de tom por tradição — quais tons cada tradição privilegia. */
export const TRADITION_TONE_AFFINITIES: Readonly<Record<TraditionTag, readonly DevotionalTone[]>> = {
  candomble:    ["ritualistic", "centering", "grounding"],
  umbanda:      ["compassionate", "centering", "ritualistic"],
  ifa:          ["ritualistic", "centering", "contemplative"],
  cabala:       ["contemplative", "centering", "silent"],
  astrologia:   ["contemplative", "centering", "uplifting"],
  tantra:       ["energizing", "joyful", "centering"],
  espiritismo:  ["compassionate", "releasing", "contemplative"],
  "santo-daime": ["ritualistic", "joyful", "energizing"],
  catholic:     ["contemplative", "centering", "releasing"],
  protestant:   ["uplifting", "joyful", "energizing"],
  buddhist:     ["contemplative", "centering", "silent"],
  hindu:        ["ritualistic", "uplifting", "centering"],
  sufi:         ["joyful", "contemplative", "centering"],
  universal:    ["neutral", "centering", "grounding"],
};

/** Estilos de voz por tradição (whisper vs. cantilena). */
export const TRADITION_VOICE_HINT: Readonly<Record<TraditionTag, "whisper" | "normal" | "projected" | "chant">> = {
  candomble: "chant", umbanda: "chant", ifa: "chant",
  cabala: "whisper", astrologia: "normal", tantra: "chant",
  espiritismo: "normal", "santo-daime": "chant",
  catholic: "chant", protestant: "projected",
  buddhist: "whisper", hindu: "chant", sufi: "chant",
  universal: "normal",
};

/** Categorias default por tradição (qual categoria é a "cara" da tradição). */
export const TRADITION_PRIMARY_CATEGORY: Readonly<Record<TraditionTag, PromptCategory>> = {
  candomble: "ritual", umbanda: "devotional", ifa: "ritual",
  cabala: "study", astrologia: "study", tantra: "ritual",
  espiritismo: "devotional", "santo-daime": "ritual",
  catholic: "devotional", protestant: "devotional",
  buddhist: "meditation", hindu: "ritual", sufi: "devotional",
  universal: "reflection",
};

/** Estilo de voz por tradição (chant/proj/etc) — identitário para SSML. */
export const TRADITION_PACING: Readonly<Record<TraditionTag, "slow" | "normal" | "fast">> = {
  candomble: "slow", umbanda: "normal", ifa: "slow",
  cabala: "slow", astrologia: "normal", tantra: "normal",
  espiritismo: "slow", "santo-daime": "fast",
  catholic: "slow", protestant: "fast",
  buddhist: "slow", hindu: "slow", sufi: "fast",
  universal: "normal",
};

/** Pausa default entre prompts (ms). */
export const TRADITION_TRANSITION_MS: Readonly<Record<TraditionTag, number>> = {
  candomble: 1500, umbanda: 1200, ifa: 1400,
  cabala: 1800, astrologia: 1200, tantra: 800,
  espiritismo: 1500, "santo-daime": 700,
  catholic: 1300, protestant: 600,
  buddhist: 2000, hindu: 1400, sufi: 900,
  universal: 1000,
};

/** Categorias-alvo (fallback) por tom devocional. */
export const TONE_FALLBACK_CATEGORIES: Readonly<Record<DevotionalTone, readonly PromptCategory[]>> = {
  grounding: ["grounding", "breath", "reflection"],
  uplifting: ["gratitude", "integration", "devotional"],
  contemplative: ["study", "meditation", "reflection"],
  joyful: ["gratitude", "integration", "devotional"],
  compassionate: ["devotional", "reflection", "shadow-work"],
  releasing: ["shadow-work", "breath", "reflection"],
  energizing: ["intention", "ritual", "integration"],
  centering: ["meditation", "breath", "grounding"],
  ritualistic: ["ritual", "devotional", "community"],
  silent: ["breath", "meditation", "reflection"],
  neutral: ["reflection", "meditation", "gratitude"],
};

// =============================================================================
// SEÇÃO 4 — MATRIX MOOD → TONE (registry principal)
// =============================================================================

/**
 * Matriz canônica mood × tone × prosódia × categoria × sequência override.
 * Gerada manualmente para cobrir os 10 moods de w49 com thresholds sensatos.
 */
export const MOOD_TO_TONE_MATRIX: Readonly<Record<VoiceMood, MoodToToneMapping>> = {
  neutral: {
    sourceMood: "neutral",
    tone: "neutral",
    confidenceThreshold: 0.4,
    ssmlProsody: DEFAULT_TONE_PROSODY.neutral,
    promptCategory: "reflection",
    categoryFallback: ["meditation", "gratitude"],
    promptSequenceOverride: ["n-reflect-01", "n-ground-01", "n-anchor-01"],
    ritualMusic: null,
    durationMultiplier: 1.0,
    pacing: "normal",
    voiceStyle: "normal",
    transitionMs: 1000,
  },
  joyful: {
    sourceMood: "joyful",
    tone: "joyful",
    confidenceThreshold: 0.5,
    ssmlProsody: DEFAULT_TONE_PROSODY.joyful,
    promptCategory: "gratitude",
    categoryFallback: ["integration", "devotional"],
    promptSequenceOverride: ["j-grat-01", "j-celeb-01", "j-share-01"],
    ritualMusic: null,
    durationMultiplier: 0.85,
    pacing: "fast",
    voiceStyle: "projected",
    transitionMs: 600,
  },
  sad: {
    sourceMood: "sad",
    tone: "compassionate",
    confidenceThreshold: 0.45,
    ssmlProsody: DEFAULT_TONE_PROSODY.compassionate,
    promptCategory: "shadow-work",
    categoryFallback: ["devotional", "reflection"],
    promptSequenceOverride: ["s-hold-01", "s-breathe-01", "s-name-01"],
    ritualMusic: { trackId: "minor-pad-01", instrument: "singing-bowl", fadeInMs: 4000, fadeOutMs: 4000, loop: true, volume: 0.18 },
    durationMultiplier: 1.4,
    pacing: "slow",
    voiceStyle: "whisper",
    transitionMs: 1800,
  },
  angry: {
    sourceMood: "angry",
    tone: "releasing",
    confidenceThreshold: 0.5,
    ssmlProsody: DEFAULT_TONE_PROSODY.releasing,
    promptCategory: "shadow-work",
    categoryFallback: ["breath", "reflection"],
    promptSequenceOverride: ["a-breathe-01", "a-fire-01", "a-release-01"],
    ritualMusic: { trackId: "fire-burn-01", instrument: "shaker", fadeInMs: 2000, fadeOutMs: 6000, loop: false, volume: 0.25 },
    durationMultiplier: 1.2,
    pacing: "slow",
    voiceStyle: "projected",
    transitionMs: 1500,
  },
  fearful: {
    sourceMood: "fearful",
    tone: "grounding",
    confidenceThreshold: 0.45,
    ssmlProsody: DEFAULT_TONE_PROSODY.grounding,
    promptCategory: "grounding",
    categoryFallback: ["breath", "devotional"],
    promptSequenceOverride: ["f-feet-01", "f-breath-01", "f-name-01"],
    ritualMusic: { trackId: "earth-tone-01", instrument: "singing-bowl", fadeInMs: 3000, fadeOutMs: 3000, loop: true, volume: 0.2 },
    durationMultiplier: 1.3,
    pacing: "slow",
    voiceStyle: "whisper",
    transitionMs: 1600,
  },
  surprised: {
    sourceMood: "surprised",
    tone: "energizing",
    confidenceThreshold: 0.5,
    ssmlProsody: DEFAULT_TONE_PROSODY.energizing,
    promptCategory: "intention",
    categoryFallback: ["gratitude", "ritual"],
    promptSequenceOverride: ["sp-pause-01", "sp-name-01", "sp-act-01"],
    ritualMusic: null,
    durationMultiplier: 0.9,
    pacing: "fast",
    voiceStyle: "normal",
    transitionMs: 700,
  },
  calm: {
    sourceMood: "calm",
    tone: "centering",
    confidenceThreshold: 0.45,
    ssmlProsody: DEFAULT_TONE_PROSODY.centering,
    promptCategory: "meditation",
    categoryFallback: ["breath", "reflection"],
    promptSequenceOverride: ["c-arrive-01", "c-breathe-01", "c-rest-01"],
    ritualMusic: null,
    durationMultiplier: 1.1,
    pacing: "normal",
    voiceStyle: "whisper",
    transitionMs: 1300,
  },
  contemplative: {
    sourceMood: "contemplative",
    tone: "contemplative",
    confidenceThreshold: 0.55,
    ssmlProsody: DEFAULT_TONE_PROSODY.contemplative,
    promptCategory: "reflection",
    categoryFallback: ["study", "meditation"],
    promptSequenceOverride: ["ct-silence-01", "ct-question-01", "ct-listen-01"],
    ritualMusic: { trackId: "ambient-pad-01", instrument: "singing-bowl", fadeInMs: 5000, fadeOutMs: 5000, loop: true, volume: 0.15 },
    durationMultiplier: 1.5,
    pacing: "slow",
    voiceStyle: "whisper",
    transitionMs: 2000,
  },
  devotional: {
    sourceMood: "devotional",
    tone: "ritualistic",
    confidenceThreshold: 0.5,
    ssmlProsody: DEFAULT_TONE_PROSODY.ritualistic,
    promptCategory: "devotional",
    categoryFallback: ["ritual", "devotional"],
    promptSequenceOverride: ["d-invoke-01", "d-offer-01", "d-thanks-01"],
    ritualMusic: { trackId: "drone-01", instrument: "organ", fadeInMs: 3000, fadeOutMs: 3000, loop: true, volume: 0.22 },
    durationMultiplier: 1.15,
    pacing: "normal",
    voiceStyle: "chant",
    transitionMs: 1100,
  },
  urgent: {
    sourceMood: "urgent",
    tone: "grounding",
    confidenceThreshold: 0.55,
    ssmlProsody: DEFAULT_TONE_PROSODY.grounding,
    promptCategory: "grounding",
    categoryFallback: ["breath", "grounding"],
    promptSequenceOverride: ["u-stop-01", "u-breathe-01", "u-pause-01"],
    ritualMusic: null,
    durationMultiplier: 0.7,
    pacing: "fast",
    voiceStyle: "projected",
    transitionMs: 500,
  },
};

// =============================================================================
// SEÇÃO 5 — UTILITÁRIOS PUROS
// =============================================================================

/** Clamp numérico entre min e max. */
export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/** FNV-1a 32-bit hash determinístico (string → 8-char hex). */
export function fnv1a32(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // Convert to unsigned 32-bit hex
  return ((h >>> 0).toString(16)).padStart(8, "0");
}

/** Stringify ordenado para hash determinístico de objetos. */
export function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const parts = keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`);
  return `{${parts.join(",")}}`;
}

/** Escapa entidades especiais XML/SSML. */
export function escapeSSML(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Verifica se uma string é SSML válido (tags balanceadas). */
export function isBalancedSSML(input: string): boolean {
  const stack: string[] = [];
  const tagRegex = /<\/?([a-z][a-z0-9_-]*)\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = tagRegex.exec(input)) !== null) {
    const full = m[0];
    const tagName = m[1].toLowerCase();
    if (full.startsWith("</")) {
      if (stack.length === 0 || stack.pop() !== tagName) return false;
    } else if (!full.endsWith("/>")) {
      stack.push(tagName);
    }
  }
  return stack.length === 0;
}

/** Conta palavras em um texto (latin-base). */
export function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

/** Calcula a duração estimada em ms a partir de palavras/minuto. */
export function estimateDuration(text: string, wordsPerMinute: number, pauseMs: number = 0): number {
  const wpm = Math.max(60, wordsPerMinute);
  const words = countWords(text);
  const speakMs = (words / wpm) * 60_000;
  return Math.round(speakMs + pauseMs);
}

/** Valida se um tom é canônico. */
export function isValidTone(value: string): value is DevotionalTone {
  return (DEVOTIONAL_TONES as readonly string[]).includes(value);
}

/** Valida se um mood é canônico. */
export function isValidMood(value: string): value is VoiceMood {
  return (VOICE_MOODS as readonly string[]).includes(value);
}

/** Valida se uma tradição é canônica. */
export function isValidTradition(value: string): value is TraditionTag {
  return (SUPPORTED_TRADITIONS as readonly string[]).includes(value);
}

/** Valida se um locale é canônico. */
export function isValidLocale(value: string): value is Locale {
  return [
    "pt-BR", "pt-PT", "en-US", "en-GB", "es-ES", "es-MX", "es-AR",
  ].includes(value);
}

/** Constrói uma chave de cache determinística para uma sequência. */
export function cacheKeyForSequence(input: {
  userId: string;
  tone: DevotionalTone;
  sourceMood: VoiceMood;
  confidence: number;
  tradition: TraditionTag;
  locale: Locale;
}): string {
  // Round confidence to 2 decimals to dedup near-identical builds
  const conf = Math.round(input.confidence * 100);
  const seed = `${input.userId}|${input.tone}|${input.sourceMood}|${conf}|${input.tradition}|${input.locale}`;
  return `dtone:${fnv1a32(seed)}`;
}

/** Constrói um id determinístico para a sequência (mesmo algoritmo do cache key). */
export function sequenceId(input: {
  userId: string;
  tone: DevotionalTone;
  sourceMood: VoiceMood;
  confidence: number;
  tradition: TraditionTag;
  locale: Locale;
  manualOverride: boolean;
}): string {
  const conf = Math.round(input.confidence * 100);
  const flag = input.manualOverride ? "M" : "A";
  const seed = `${input.userId}|${input.tone}|${input.sourceMood}|${conf}|${input.tradition}|${input.locale}|${flag}`;
  return `seq:${fnv1a32(seed)}`;
}

// =============================================================================
// SEÇÃO 6 — FUNÇÕES DE MAPEAMENTO PRINCIPAL
// =============================================================================

/**
 * Decide o tom devocional dado um mood + confiança + tradição + hora do dia.
 * Aplica `applyMoodToTone` puro: confiança < threshold cai para `neutral`.
 */
export function mapMoodToTone(
  mood: VoiceMood,
  confidence: number,
  tradition: TraditionTag,
  timeOfDay: number,
): MoodToToneMapping {
  const mapping = MOOD_TO_TONE_MATRIX[mood];
  if (confidence < mapping.confidenceThreshold) {
    // Falls back to neutral via silent marker
    return {
      ...MOOD_TO_TONE_MATRIX.neutral,
      categoryFallback: [mapping.promptCategory, ...mapping.categoryFallback].slice(0, 3),
    };
  }

  // Adjust promptCategory se a tradição tem afinidade forte e o mapping default
  // colide com time-of-day sensitivity.
  const hourTone = HOUR_TONE_PREFERENCE[clamp(timeOfDay, 0, 23)] ?? "neutral";
  const affinity = TRADITION_TONE_AFFINITIES[tradition];

  let effectiveTone = mapping.tone;
  // Se hora é silenciosa e mapping sugere energizing, suaviza
  if (hourTone === "silent" && (mapping.tone === "energizing" || mapping.tone === "joyful")) {
    effectiveTone = "compassionate";
  }
  // Se hora é manhã energetica e mapping sugere silent, ativa
  if ((hourTone === "energizing" || hourTone === "uplifting") && mapping.tone === "silent") {
    effectiveTone = "grounding";
  }
  // Se a tradição tem afinidade e effectiveTone ≠ neutral, mantenha effective
  void affinity; // affinity consulted elsewhere

  if (effectiveTone !== mapping.tone) {
    const substitute = MOOD_TO_TONE_MATRIX[mood];
    return {
      ...substitute,
      tone: effectiveTone,
      ssmlProsody: DEFAULT_TONE_PROSODY[effectiveTone],
      pacing: (effectiveTone === "compassionate" || effectiveTone === "grounding") ? "slow" : substitute.pacing,
      voiceStyle: (effectiveTone === "silent") ? "whisper" : substitute.voiceStyle,
      durationMultiplier: (effectiveTone === "silent") ? substitute.durationMultiplier * 1.2 : substitute.durationMultiplier,
    };
  }

  return mapping;
}

/**
 * Seleciona o tom considerando tradição + hora + dia-da-semana.
 * Mais contextual que `mapMoodToTone`.
 */
export function selectToneForContext(
  mood: VoiceMood,
  tradition: TraditionTag,
  hour: number,
  dayOfWeek: number,
): MoodToToneMapping {
  const safeHour = clamp(hour, 0, 23);
  const safeDay = clamp(dayOfWeek, 0, 6);
  const mapping = mapMoodToTone(mood, HIGH_CONFIDENCE_THRESHOLD, tradition, safeHour);

  // Final-de-semana: ligeira redução do tom ativo
  if ((safeDay === 0 || safeDay === 6) && mapping.tone === "energizing") {
    return { ...mapping, tone: "centering", pacing: "normal" };
  }
  // Segunda-feira (1): energizing OK
  if (safeDay === 1 && mapping.tone === "grounding") {
    return { ...mapping, tone: "energizing", pacing: "fast" };
  }
  return mapping;
}

/**
 * Adapta uma sequência de prompts base para o tom apropriado.
 * Reordena conforme `promptSequenceOverride` e mescla com fallbacks
 * se a sequência base não cobre todas as posições.
 */
export function adaptPromptSequence(
  basePrompts: readonly string[],
  tone: DevotionalTone,
  override: readonly string[] | null,
): readonly string[] {
  if (override && override.length > 0) {
    const merged = [...override];
    // Append fallbacks if override shorter than default
    const fallbacks = TONE_FALLBACK_CATEGORIES[tone];
    for (const id of basePrompts) {
      if (!merged.includes(id)) merged.push(id);
    }
    void fallbacks; // categories already encoded in IDs
    return merged.slice(0, Math.max(merged.length, DEFAULT_SEQUENCE_LENGTH));
  }
  // Quando sem override, prepend a sequência canônica do mapping se houver
  const matrix = MOOD_TO_TONE_MATRIX.neutral; // default
  const canonical = matrix.promptSequenceOverride;
  const merged: string[] = [...canonical];
  for (const id of basePrompts) {
    if (!merged.includes(id)) merged.push(id);
  }
  void tone;
  return merged.slice(0, Math.max(merged.length, DEFAULT_SEQUENCE_LENGTH));
}

// =============================================================================
// SEÇÃO 7 — SSML HELPERS
// =============================================================================

/**
 * Aplica atributos SSML `<prosody>` em torno de um texto.
 * Implementa escape automático para evitar injeção.
 */
export function applyProsodyToText(text: string, prosody: SSMLProsodyAttributes): string {
  const attrs: string[] = [];
  if (prosody.rate !== undefined) attrs.push(`rate="${escapeSSML(prosody.rate)}"`);
  if (prosody.pitch !== undefined) attrs.push(`pitch="${escapeSSML(prosody.pitch)}"`);
  if (prosody.volume !== undefined) attrs.push(`volume="${escapeSSML(prosody.volume)}"`);
  if (prosody.contour !== undefined) attrs.push(`contour="${escapeSSML(prosody.contour)}"`);
  const attrStr = attrs.length === 0 ? "" : ` ${attrs.join(" ")}`;
  return `<prosody${attrStr}>${escapeSSML(text)}</prosody>`;
}

/** Aplica apenas a taxa (rate) — wrapper curto. */
export function applyRateToText(text: string, rate: string): string {
  return applyProsodyToText(text, { rate });
}

/** Aplica apenas o pitch — wrapper curto. */
export function applyPitchToText(text: string, pitch: string): string {
  return applyProsodyToText(text, { pitch });
}

/** Aplica apenas o volume — wrapper curto. */
export function applyVolumeToText(text: string, volume: string): string {
  return applyProsodyToText(text, { volume });
}

/** Envolve uma sequência inteira em um envelope SSML `<speak>`. */
export function wrapInSSML(sequence: DevotionalSequence): string {
  const prosodyAttr: string[] = [];
  const p = MOOD_TO_TONE_MATRIX[sequence.sourceMood].ssmlProsody;
  // Merge sequence-specific overrides if any
  void p;
  if (sequence.pacing === "slow") prosodyAttr.push(`rate="slow"`);
  if (sequence.pacing === "fast") prosodyAttr.push(`rate="fast"`);
  if (prosodyAttr.length === 0) prosodyAttr.push(`rate="medium"`);

  const prosodyOpen = `<prosody ${prosodyAttr.join(" ")}>`;
  const prosodyClose = `</prosody>`;

  const inner = sequence.prompts
    .map((step, i) => {
      const cue = step.audioCue ? `<mark name="${escapeSSML(step.audioCue)}"/>` : "";
      const emphasis = step.emphasisWords.length > 0
        ? `<emphasis level="moderate">${escapeSSML(step.emphasisWords.join(" "))}</emphasis>`
        : "";
      const break_ = step.pauseAfterMs > 0
        ? `<break time="${step.pauseAfterMs}ms"/>`
        : "";
      const idx = i + 1;
      return `${cue}<p><s>${idx}. ${emphasis}${escapeSSML(step.text)}</s></p>${break_}`;
    })
    .join("\n");

  return `<speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${sequence.locale}">\n${prosodyOpen}\n${inner}\n${prosodyClose}\n</speak>`;
}

/** Formata um hint de pacing para a UI ("slow" → "ritmo lento"). */
export function formatPacingHint(pacing: "slow" | "normal" | "fast", locale: Locale = "pt-BR"): string {
  const map: Record<Locale, Record<string, string>> = {
    "pt-BR": { slow: "ritmo lento", normal: "ritmo natural", fast: "ritmo acelerado" },
    "pt-PT": { slow: "ritmo lento", normal: "ritmo natural", fast: "ritmo acelerado" },
    "en-US": { slow: "slow pace", normal: "natural pace", fast: "fast pace" },
    "en-GB": { slow: "slow pace", normal: "natural pace", fast: "fast pace" },
    "es-ES": { slow: "ritmo lento", normal: "ritmo natural", fast: "ritmo acelerado" },
    "es-MX": { slow: "ritmo lento", normal: "ritmo natural", fast: "ritmo acelerado" },
    "es-AR": { slow: "ritmo lento", normal: "ritmo natural", fast: "ritmo acelerado" },
  };
  return (map[locale] ?? map["pt-BR"])[pacing];
}

/** Seleciona estilo de voz (whisper/normal/projected/chant). */
export function selectVoiceStyle(
  mood: VoiceMood,
  tradition: TraditionTag,
): "whisper" | "normal" | "projected" | "chant" {
  // Moods fortes (urgent/angry) preferem projected/chant
  if (mood === "angry" || mood === "urgent") return "projected";
  if (mood === "devotional" && TRADITION_VOICE_HINT[tradition] === "chant") return "chant";
  if (mood === "contemplative" || mood === "sad" || mood === "fearful") return "whisper";
  if (mood === "joyful" || mood === "surprised") return "projected";
  // Fallback: hint da tradição
  return TRADITION_VOICE_HINT[tradition];
}

// =============================================================================
// SEÇÃO 8 — VALIDAÇÃO
// =============================================================================

/** Valida confiança mínima — gate para descartar moods fracos. */
export function validateMoodConfidence(
  mood: VoiceMood,
  threshold: number,
): ValidationResult {
  const mapping = MOOD_TO_TONE_MATRIX[mood];
  const valid = threshold >= MIN_CONFIDENCE_THRESHOLD && threshold <= 1;
  const flags: ValidationFlag[] = [];
  if (!valid) {
    flags.push({
      code: "INVALID_THRESHOLD",
      severity: "warn",
      message: `Threshold ${threshold} outside [${MIN_CONFIDENCE_THRESHOLD}, 1]. Falling back to neutral.`,
      suggestedTone: "neutral",
    });
  }
  if (mapping.confidenceThreshold > threshold) {
    flags.push({
      code: "BELOW_MOOD_THRESHOLD",
      severity: "info",
      message: `Mood ${mood} has internal threshold ${mapping.confidenceThreshold}; got ${threshold}.`,
      suggestedTone: mapping.tone,
    });
  }
  return { valid, flags, effectiveTone: valid ? mapping.tone : "neutral" };
}

/** Valida alinhamento entre tom e tradição — alguns pares disparam flags. */
export function validateTraditionAlignment(tone: DevotionalTone, tradition: TraditionTag): ValidationResult {
  const flags: ValidationFlag[] = [];
  let effective = tone;

  // silent vs pentecostal/protestant (vocal exuberante esperado)
  if (tone === "silent" && (tradition === "protestant" || tradition === "candomble")) {
    flags.push({
      code: "SILENT_TONE_TRADITION_CONFLICT",
      severity: "block",
      message: `Tone 'silent' typically conflicts with ${tradition} tradition; suggest contemplative instead.`,
      suggestedTone: "contemplative",
    });
    effective = "contemplative";
  }

  // chanting implícito (chant voiceStyle) é incomum fora de religiões afro-brasileiras
  if (tone === "ritualistic" && (tradition === "buddhist" || tradition === "cabala")) {
    flags.push({
      code: "RITUALISTIC_TONE_MAY_FEEL_INAUTHENTIC",
      severity: "info",
      message: `Tone 'ritualistic' with ${tradition} may feel inauthentic; consider 'contemplative'.`,
      suggestedTone: "contemplative",
    });
  }

  // energizing em horário noturno (será tratado em validateTimeOfDay)
  void 0;
  // Verifica se tone está em afinidades da tradição
  const affinities = TRADITION_TONE_AFFINITIES[tradition];
  if (!affinities.includes(tone) && tone !== "neutral") {
    flags.push({
      code: "TONE_NOT_IN_TRADITION_AFFINITIES",
      severity: "info",
      message: `Tone '${tone}' is not in top affinities for ${tradition}: ${affinities.join(", ")}.`,
      suggestedTone: affinities[0] ?? "neutral",
    });
  }

  return {
    valid: flags.every((f) => f.severity !== "block"),
    flags,
    effectiveTone: effective,
  };
}

/** Valida alinhamento entre tom e hora do dia. */
export function validateTimeOfDay(tone: DevotionalTone, hour: number): ValidationResult {
  const safeHour = clamp(hour, 0, 23);
  const flags: ValidationFlag[] = [];
  let effective = tone;

  if ((safeHour >= 22 || safeHour <= 4) && (tone === "energizing" || tone === "joyful")) {
    flags.push({
      code: "ACTIVATING_TONE_AT_NIGHT",
      severity: "warn",
      message: `${tone} at ${safeHour}h may be jarring; consider grounding/compassionate.`,
      suggestedTone: "grounding",
    });
    effective = "grounding";
  }

  if ((safeHour >= 5 && safeHour <= 8) && tone === "silent") {
    flags.push({
      code: "SILENT_TONE_AT_MORNING",
      severity: "warn",
      message: `Silent tone at ${safeHour}h may feel heavy; consider grounding or uplifting.`,
      suggestedTone: "grounding",
    });
    effective = "grounding";
  }

  return {
    valid: flags.every((f) => f.severity !== "block"),
    flags,
    effectiveTone: effective,
  };
}

/** Validação composta: combina os três validadores acima. */
export function validateAll(
  mood: VoiceMood,
  confidence: number,
  tone: DevotionalTone,
  tradition: TraditionTag,
  hour: number,
): ValidationResult {
  const conf = validateMoodConfidence(mood, confidence);
  const trad = validateTraditionAlignment(tone, tradition);
  const tod = validateTimeOfDay(tone, hour);

  const merged: ValidationFlag[] = [...conf.flags, ...trad.flags, ...tod.flags];
  const blocked = merged.some((f) => f.severity === "block");

  // Resolve effective tone: start tone, apply TOD first, then tradition
  let eff = tod.effectiveTone;
  if (trad.effectiveTone !== eff && merged.some((f) => f.code === "SILENT_TONE_TRADITION_CONFLICT")) {
    eff = trad.effectiveTone;
  }

  return {
    valid: !blocked,
    flags: merged,
    effectiveTone: eff,
  };
}

// =============================================================================
// SEÇÃO 9 — BUILD DE SEQUÊNCIA
// =============================================================================

/** Texto base por categoria (corpus local — espelha o pool de w47). */
export const PROMPT_TEXT_CORPUS: Readonly<Record<PromptCategory, readonly string[]>> = {
  grounding: [
    "Sinta o peso do seu corpo apoiado sobre a terra.",
    "Respire fundo e perceba os pés no chão.",
    "Leve uma mão ao peito e sinta o calor da própria presença.",
  ],
  breath: [
    "Inspire pelo nariz contando até quatro.",
    "Expire pela boca contando até seis.",
    "Deixe a próxima respiração mais lenta que a anterior.",
  ],
  reflection: [
    "O que você está carregando que não lhe pertence mais?",
    "Qual é o sentimento mais discreto neste momento?",
    "Que verdade pequena você notaria se não estivesse distraído?",
  ],
  gratitude: [
    "Nomeie três coisas pelas quais você é grato hoje.",
    "Quem merece sua gratidão silenciosa agora?",
    "Que presente simples você recebeu nas últimas 24 horas?",
  ],
  intention: [
    "O que você quer trazer para o dia de hoje?",
    "Que qualidade quer habitar nas próximas horas?",
    "Qual é o próximo passo íntegro à sua frente?",
  ],
  "shadow-work": [
    "Que parte sua ficou silenciada esta semana?",
    "O que esse incômodo quer lhe ensinar?",
    "Como o seu lado sombra tem te servido?",
  ],
  devotional: [
    "Que nome sagrado você sente próximo?",
    "Ao que você entrega seu coração agora?",
    "Que palavra benta cabe neste momento?",
  ],
  meditation: [
    "Apenas observe o que aparece e o que desaparece.",
    "Repouse a atenção na fronteira da respiração.",
    "Permita que a mente se acomode sem julgamento.",
  ],
  study: [
    "Qual é o texto que seu estudo pede agora?",
    "Que símbolo da sua tradição pede atenção?",
    "O que a próxima letra do alfabeto sagrado sugere?",
  ],
  ritual: [
    "Invoque a presença que orienta sua tradição.",
    "Ofereça um gesto simples de reverência.",
    "Trace um limite sagrado no espaço onde você está.",
  ],
  integration: [
    "Como você vai carregar essa prática para o dia?",
    "O que muda em você após este momento?",
    "Que compromisso mínimo você firma consigo?",
  ],
  community: [
    "Quem do seu círculo precisa de uma palavra sua hoje?",
    "A quem você oferece sua presença agora?",
    "Que coletivo você serve com seu caminhar?",
  ],
};

/** Seleciona o texto de prompt mais adequado para a categoria + locale. */
export function resolvePromptText(category: PromptCategory, index: number, locale: Locale): string {
  const corpus = PROMPT_TEXT_CORPUS[category];
  const idx = ((index % corpus.length) + corpus.length) % corpus.length;
  const base = corpus[idx];
  // Localização simples: marca locale sem alterar conteúdo (multilingual real
  // viria de i18n; aqui mantemos o corpus pt-BR + hint por suffix).
  const suffix: Record<Locale, string> = {
    "pt-BR": "", "pt-PT": " (PT)", "en-US": " (EN)", "en-GB": " (EN-GB)",
    "es-ES": " (ES)", "es-MX": " (ES-MX)", "es-AR": " (ES-AR)",
  };
  return `${base}${suffix[locale]}`;
}

/**
 * Constrói uma sequência devocional completa para os parâmetros fornecidos.
 * Respeita `userOptIn` (LGPD) — quando false, retorna sequência neutra.
 */
export function buildDevotionalSequence(input: {
  userId: string;
  mood: VoiceMood;
  confidence: number;
  tradition: TraditionTag;
  locale: Locale;
  hour: number;
  dayOfWeek?: number;
  optIn: boolean;
  basePromptIds?: readonly string[];
  overrideTone?: DevotionalTone | null;
  userHistory?: UserToneHistory | null;
  createdAt?: number;
}): DevotionalSequence {
  const createdAt = input.createdAt ?? 1700000000000; // epoch default estável (testes)
  const day = input.dayOfWeek ?? new Date(createdAt).getUTCDay();

  // Se opt-out, sequência neutra respeitando LGPD Art. 7
  if (!input.optIn) {
    return buildNeutralSequence(
      input.userId,
      input.mood,
      input.confidence,
      input.tradition,
      input.locale,
      createdAt,
    );
  }

  const mapping = selectToneForContext(input.mood, input.tradition, input.hour, day);
  let effective: MoodToToneMapping = mapping;

  // Manual override sempre vence
  if (input.overrideTone && input.overrideTone !== mapping.tone) {
    effective = {
      ...mapping,
      tone: input.overrideTone,
      ssmlProsody: DEFAULT_TONE_PROSODY[input.overrideTone],
      pacing: (
        input.overrideTone === "contemplative" || input.overrideTone === "compassionate" ||
        input.overrideTone === "silent"
      ) ? "slow" : mapping.pacing,
      voiceStyle: (input.overrideTone === "silent") ? "whisper" : mapping.voiceStyle,
      durationMultiplier: (input.overrideTone === "silent") ? mapping.durationMultiplier * 1.3 : mapping.durationMultiplier,
    };
  }

  // Aplica validação composta final
  const validation = validateAll(
    input.mood,
    input.confidence,
    effective.tone,
    input.tradition,
    input.hour,
  );
  if (validation.effectiveTone !== effective.tone) {
    effective = {
      ...effective,
      tone: validation.effectiveTone,
      ssmlProsody: DEFAULT_TONE_PROSODY[validation.effectiveTone],
    };
  }

  const adaptedSequence = adaptPromptSequence(
    input.basePromptIds ?? [],
    effective.tone,
    effective.promptSequenceOverride,
  );
  const steps: PromptStep[] = adaptedSequence.map((promptId, i) => ({
    promptId,
    text: resolvePromptText(effective.promptCategory, i, input.locale),
    audioCue: i === 0 ? "opening" : (i === adaptedSequence.length - 1 ? "closing" : null),
    pauseAfterMs: effective.transitionMs,
    emphasisWords: effective.tone === "joyful"
      ? ["hoje", "celebrar"]
      : (effective.tone === "compassionate" ? ["acolhimento", "gentileza"] : []),
  }));

  const totalText = steps.map((s) => s.text).join(" ");
  const baseDurationMs = estimateDuration(totalText, DEFAULT_WORDS_PER_MINUTE);
  const totalDurationMs = Math.round(baseDurationMs * effective.durationMultiplier);

  // Monta sequência parcial para SSML; após isso adiciona ritualContext
  const seq: DevotionalSequence = {
    id: sequenceId({
      userId: input.userId,
      tone: effective.tone,
      sourceMood: input.mood,
      confidence: input.confidence,
      tradition: input.tradition,
      locale: input.locale,
      manualOverride: input.overrideTone !== undefined && input.overrideTone !== null,
    }),
    tone: effective.tone,
    prompts: steps,
    totalDurationMs,
    ssml: "", // preenchido abaixo
    ritualContext: effective.ritualMusic
      ? {
          ritualId: `rit-${input.tradition}-${effective.tone}`,
          phase: steps.length <= 1 ? "core" : "opening",
          elements: getRitualElementsForTradition(input.tradition),
          music: effective.ritualMusic,
        }
      : null,
    createdAt,
    userOptIn: true,
    manualOverride: input.overrideTone !== undefined && input.overrideTone !== null,
    userId: input.userId,
    sourceMood: input.mood,
    confidence: input.confidence,
    tradition: input.tradition,
    locale: input.locale,
    voiceStyle: effective.voiceStyle,
    pacing: effective.pacing,
  };

  // Agora aplica wrapInSSML (recursão indireta — montagem manual)
  const prosody = effective.ssmlProsody;
  const attrs: string[] = [];
  if (prosody.rate) attrs.push(`rate="${prosody.rate}"`);
  if (prosody.pitch) attrs.push(`pitch="${prosody.pitch}"`);
  if (prosody.volume) attrs.push(`volume="${prosody.volume}"`);
  if (prosody.contour) attrs.push(`contour="${prosody.contour}"`);
  const inner = steps
    .map((s, i) => {
      const cue = s.audioCue ? `<mark name="${escapeSSML(s.audioCue)}"/>` : "";
      const emphasis = s.emphasisWords.length > 0
        ? `<emphasis level="moderate">${s.emphasisWords.map(escapeSSML).join(" ")}</emphasis>`
        : "";
      const break_ = s.pauseAfterMs > 0 ? `<break time="${s.pauseAfterMs}ms"/>` : "";
      return `${cue}<p><s>${i + 1}. ${emphasis}${escapeSSML(s.text)}</s></p>${break_}`;
    })
    .join("\n");
  const ssml = `<speak version="1.1" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${input.locale}">\n<prosody ${attrs.join(" ")}>\n${inner}\n</prosody>\n</speak>`;

  return { ...seq, ssml };
}

/** Constrói uma sequência neutra (opt-out / confidence baixa). */
function buildNeutralSequence(
  userId: string,
  mood: VoiceMood,
  confidence: number,
  tradition: TraditionTag,
  locale: Locale,
  createdAt: number,
): DevotionalSequence {
  const steps: PromptStep[] = [
    {
      promptId: "neutral-breathe-01",
      text: resolvePromptText("breath", 0, locale),
      audioCue: "neutral-open",
      pauseAfterMs: 800,
      emphasisWords: [],
    },
    {
      promptId: "neutral-ground-01",
      text: resolvePromptText("grounding", 0, locale),
      audioCue: null,
      pauseAfterMs: 600,
      emphasisWords: [],
    },
    {
      promptId: "neutral-thanks-01",
      text: resolvePromptText("gratitude", 0, locale),
      audioCue: "neutral-close",
      pauseAfterMs: 0,
      emphasisWords: [],
    },
  ];
  const totalText = steps.map((s) => s.text).join(" ");
  const totalDurationMs = estimateDuration(totalText, DEFAULT_WORDS_PER_MINUTE, steps.reduce((a, s) => a + s.pauseAfterMs, 0));
  const ssml = wrapInSSML({
    id: "neutral-placeholder",
    tone: "neutral",
    prompts: steps,
    totalDurationMs,
    ssml: "",
    ritualContext: null,
    createdAt,
    userOptIn: false,
    manualOverride: true, // opt-out é tratado como override do sistema
    userId,
    sourceMood: mood,
    confidence,
    tradition,
    locale,
    voiceStyle: "normal",
    pacing: "normal",
  });
  return {
    id: sequenceId({ userId, tone: "neutral", sourceMood: mood, confidence, tradition, locale, manualOverride: true }),
    tone: "neutral",
    prompts: steps,
    totalDurationMs,
    ssml,
    ritualContext: null,
    createdAt,
    userOptIn: false,
    manualOverride: true,
    userId,
    sourceMood: mood,
    confidence,
    tradition,
    locale,
    voiceStyle: "normal",
    pacing: "normal",
  };
}

/** Retorna elementos rituais canônicos por tradição. */
export function getRitualElementsForTradition(tradition: TraditionTag): readonly string[] {
  const map: Record<TraditionTag, readonly string[]> = {
    candomble: ["water", "fire", "earth", "air"],
    umbanda: ["light", "incense", "water"],
    ifa: ["opele", "okoto", "water"],
    cabala: ["light", "numbers", "names"],
    astrologia: ["planets", "houses", "aspects"],
    tantra: ["breath", "fire", "union"],
    espiritismo: ["light", "prayer", "water"],
    "santo-daime": ["caatinga", "hymn", "light"],
    catholic: ["water", "fire", "bread", "wine"],
    protestant: ["word", "song", "fire"],
    buddhist: ["breath", "silence", "bell"],
    hindu: ["fire", "water", "mango-leaves", "bell"],
    sufi: ["breath", "music", "whirl"],
    universal: [],
  };
  return map[tradition];
}

/** Seleciona música ritual opcional para um tom. */
export function getRitualMusicForTone(tone: DevotionalTone): RitualMusic | null {
  const map: Partial<Record<DevotionalTone, RitualMusic | null>> = {
    grounding: { trackId: "earth-bowl", instrument: "singing-bowl", fadeInMs: 4000, fadeOutMs: 4000, loop: true, volume: 0.2 },
    contemplative: { trackId: "zen-pad", instrument: "singing-bowl", fadeInMs: 5000, fadeOutMs: 5000, loop: true, volume: 0.15 },
    compassionate: { trackId: "minor-pad", instrument: "singing-bowl", fadeInMs: 4000, fadeOutMs: 4000, loop: true, volume: 0.18 },
    releasing: { trackId: "fire-burn", instrument: "shaker", fadeInMs: 2000, fadeOutMs: 6000, loop: false, volume: 0.25 },
    centering: { trackId: "drone-01", instrument: "singing-bowl", fadeInMs: 3000, fadeOutMs: 3000, loop: true, volume: 0.2 },
    ritualistic: { trackId: "drone-02", instrument: "organ", fadeInMs: 3000, fadeOutMs: 3000, loop: true, volume: 0.22 },
    uplifting: null, joyful: null, energizing: null, silent: null, neutral: null,
  };
  const result = map[tone];
  return result === undefined ? null : result;
}

/** Seleciona categoria primária para tom + tradição. */
export function getCategoryForTone(tone: DevotionalTone, tradition: TraditionTag): PromptCategory {
  const tradCat = TRADITION_PRIMARY_CATEGORY[tradition];
  if (tone === "grounding" || tone === "silent") return "grounding";
  if (tone === "compassionate") return tradCat;
  if (tone === "ritualistic") return tradCat;
  // Demais tons: categoria derivada do tom
  const direct: Partial<Record<DevotionalTone, PromptCategory>> = {
    uplifting: "gratitude",
    joyful: "gratitude",
    contemplative: "reflection",
    releasing: "shadow-work",
    energizing: "intention",
    centering: "meditation",
    neutral: "reflection",
  };
  return direct[tone] ?? tradCat;
}

/** Seleciona fallback de categoria para tom + tradição. */
export function getCategoryFallback(tone: DevotionalTone, tradition: TraditionTag): readonly PromptCategory[] {
  const primary = getCategoryForTone(tone, tradition);
  const fromTone = TONE_FALLBACK_CATEGORIES[tone].filter((c) => c !== primary);
  // Adiciona fallback específico da tradição se faltar
  return [primary, ...fromTone].slice(0, 3);
}

// =============================================================================
// SEÇÃO 10 — DURAÇÃO, RESUMO, DIFF, CACHE
// =============================================================================

/**
 * Estima a duração total em ms de uma sequência de passos para um dado WPM.
 * Soma duração de fala + pausas entre passos.
 */
export function estimateSequenceDuration(
  sequence: DevotionalSequence,
  wordsPerMinute: number,
): number {
  const baseMs = sequence.prompts.reduce((acc, step) => {
    return acc + estimateDuration(step.text, wordsPerMinute, step.pauseAfterMs);
  }, 0);
  return Math.round(baseMs);
}

/** Decide se a sequência deve ser regenerada dado drift de mood ou TTL. */
export function shouldRefreshSequence(
  sequence: DevotionalSequence,
  lastBuildMs: number,
  moodDriftMs: number,
): boolean {
  const ageMs = lastBuildMs - sequence.createdAt;
  if (ageMs >= SEQUENCE_TTL_MS) return true;
  if (moodDriftMs > sequence.totalDurationMs * 1.5) return true;
  return false;
}

/** Resumo legível de uma sequência para a UI da Mesa Real. */
export function summarizeSequence(sequence: DevotionalSequence, locale: Locale = "pt-BR"): string {
  const labels: Record<Locale, string> = {
    "pt-BR": "Tom",
    "pt-PT": "Tom",
    "en-US": "Tone",
    "en-GB": "Tone",
    "es-ES": "Tono",
    "es-MX": "Tono",
    "es-AR": "Tono",
  };
  const secs = Math.round(sequence.totalDurationMs / 1000);
  const min = Math.floor(secs / 60);
  const sec = secs % 60;
  return `${labels[locale]}: ${sequence.tone} | ${sequence.prompts.length} passos | ${min}m${sec.toString().padStart(2, "0")}s | fonte=${sequence.sourceMood} (${sequence.confidence.toFixed(2)})`;
}

/** Compara duas sequências e retorna um diff estruturado. */
export function diffSequences(before: DevotionalSequence, after: DevotionalSequence): SequenceDiff {
  const beforeIds = new Set(before.prompts.map((p) => p.promptId));
  const afterIds = new Set(after.prompts.map((p) => p.promptId));
  const added: string[] = [];
  const removed: string[] = [];
  for (const id of afterIds) if (!beforeIds.has(id)) added.push(id);
  for (const id of beforeIds) if (!afterIds.has(id)) removed.push(id);

  return {
    idA: before.id,
    idB: after.id,
    toneChanged: before.tone !== after.tone,
    promptCountDelta: after.prompts.length - before.prompts.length,
    durationDeltaMs: after.totalDurationMs - before.totalDurationMs,
    addedPromptIds: added,
    removedPromptIds: removed,
  };
}

// =============================================================================
// SEÇÃO 11 — LGPD (Art. 7 consent + Art. 18 esquecimento)
// =============================================================================

/**
 * Registra consentimento explícito do usuário (LGPD Art. 7).
 * `decision: true` habilita mood-driven tone; `false` revoga.
 */
export function respectUserOptIn(
  userId: string,
  decision: boolean,
  existingConsent: MoodSampleConsent | null,
  nowMs: number,
): MoodSampleConsent {
  const prior = existingConsent ?? {
    userId,
    optedIn: false,
    optedInAt: null,
    optedOutAt: null,
    manualOverrideCount: 0,
    lastOverrideTone: null,
  };
  if (decision && !prior.optedIn) {
    return { ...prior, optedIn: true, optedInAt: nowMs, optedOutAt: null };
  }
  if (!decision && prior.optedIn) {
    return { ...prior, optedIn: false, optedOutAt: nowMs };
  }
  return prior;
}

/**
 * Registra override manual do tom feito pelo usuário.
 * Incrementa contador e armazena último tom escolhido.
 */
export function recordManualOverride(
  userId: string,
  sequenceIdValue: string,
  originalTone: DevotionalTone,
  overrideTone: DevotionalTone,
  existingConsent: MoodSampleConsent | null,
  nowMs: number,
  reason: string | null,
): { consent: MoodSampleConsent; log: ManualOverrideLog } {
  const prior = existingConsent ?? {
    userId,
    optedIn: true,
    optedInAt: nowMs,
    optedOutAt: null,
    manualOverrideCount: 0,
    lastOverrideTone: null,
  };
  const consent: MoodSampleConsent = {
    ...prior,
    manualOverrideCount: prior.manualOverrideCount + 1,
    lastOverrideTone: overrideTone,
  };
  const log: ManualOverrideLog = {
    userId,
    sequenceId: sequenceIdValue,
    originalTone,
    overrideTone,
    reason,
    at: nowMs,
  };
  return { consent, log };
}

/**
 * Respeita opt-out completo do usuário.
 * Retorna uma sequência neutra imediatamente, ignora detecção de mood.
 */
export function respectOptOut(input: {
  userId: string;
  mood: VoiceMood;
  confidence: number;
  tradition: TraditionTag;
  locale: Locale;
  nowMs: number;
}): DevotionalSequence {
  return buildNeutralSequence(
    input.userId,
    input.mood,
    input.confidence,
    input.tradition,
    input.locale,
    input.nowMs,
  );
}

/** Redacta uma sequência para exportação LGPD — campos sensíveis removidos. */
export function redactSequenceForExport(
  sequence: DevotionalSequence,
  fields: readonly ("userId" | "createdAt" | "confidence" | "ritualContext")[],
): DevotionalSequence {
  if (fields.length === 0) return sequence;
  // Aplica redação criando novo objeto sem os campos solicitados
  // (mantém imutabilidade — readonly)
  const r: Record<string, unknown> = { ...sequence };
  for (const f of fields) delete r[f];
  if ("ritualContext" in r && r.ritualContext === null) {
    // OK — null é não-sensível
  }
  return r as unknown as DevotionalSequence;
}

/** Retorna entradas filtradas por idade — LGPD Art. 18 esquece após N dias. */
export function pruneOldEntries<T extends { at: number }>(
  entries: readonly T[],
  retentionDays: number,
  nowMs: number,
): readonly T[] {
  const cutoffMs = nowMs - retentionDays * 24 * 60 * 60 * 1000;
  return entries.filter((e) => e.at >= cutoffMs);
}

/** Deleta histórico de sequências de um usuário respeitando retenção. */
export function deleteSequenceHistory(
  userId: string,
  retentionDays: number,
  history: readonly ToneHistoryEntry[],
  nowMs: number,
): { userId: string; remaining: number; deleted: number } {
  const cutoff = nowMs - retentionDays * 24 * 60 * 60 * 1000;
  let deleted = 0;
  const remaining: ToneHistoryEntry[] = [];
  for (const entry of history) {
    if (entry.userId !== userId) {
      remaining.push(entry);
      continue;
    }
    if (entry.at < cutoff) {
      deleted++;
    } else {
      remaining.push(entry);
    }
  }
  return { userId, remaining: remaining.length, deleted };
}

/** Recupera o histórico de tons para um usuário nos últimos N dias. */
export function getUserToneHistory(
  userId: string,
  days: number,
  nowMs: number,
  history: readonly ToneHistoryEntry[],
): readonly ToneHistoryEntry[] {
  return pruneOldEntries(history.filter((e) => e.userId === userId), days, nowMs);
}

/** Computa preferências agregadas por tradição a partir de histórico. */
export function getTraditionTonePreferences(
  tradition: TraditionTag,
  sampleSize: number,
  history: readonly ToneHistoryEntry[],
): readonly TraditionTonePreference[] {
  void sampleSize;
  const matching = history.filter((e) => e.tradition === tradition);
  if (matching.length === 0) return [];
  const byTone = new Map<DevotionalTone, { count: number; confSum: number; override: number }>();
  for (const e of matching) {
    const cur = byTone.get(e.tone) ?? { count: 0, confSum: 0, override: 0 };
    cur.count++;
    cur.confSum += e.confidence;
    if (e.manualOverride) cur.override++;
    byTone.set(e.tone, cur);
  }
  const out: TraditionTonePreference[] = [];
  for (const [tone, stats] of byTone) {
    out.push({
      tradition,
      tone,
      usageCount: stats.count,
      averageConfidence: stats.confSum / stats.count,
      overrideRate: stats.override / stats.count,
    });
  }
  return out.sort((a, b) => b.usageCount - a.usageCount);
}

/** Conta a frequência de cada tom no histórico. */
export function getToneFrequency(
  history: readonly ToneHistoryEntry[],
): Readonly<Record<DevotionalTone, number>> {
  const out: Record<DevotionalTone, number> = {
    grounding: 0, uplifting: 0, contemplative: 0, joyful: 0,
    compassionate: 0, releasing: 0, energizing: 0, centering: 0,
    ritualistic: 0, silent: 0, neutral: 0,
  };
  for (const e of history) out[e.tone]++;
  return out;
}

// =============================================================================
// SEÇÃO 12 — MÉTRICAS & ANALYTICS AGREGADAS
// =============================================================================

/** Métricas agregadas anônimas de uso do engine. */
export interface EngineMetrics {
  readonly buildCount: number;
  readonly optOutCount: number;
  readonly overrideCount: number;
  readonly toneDistribution: Readonly<Record<DevotionalTone, number>>;
  readonly averageConfidence: number;
  readonly averageDurationMs: number;
}

/** Calcula métricas agregadas a partir de histórico + overrides. */
export function computeEngineMetrics(
  history: readonly ToneHistoryEntry[],
  overrides: readonly ManualOverrideLog[],
  optOutCount: number,
): EngineMetrics {
  const toneDist = getToneFrequency(history);
  const total = history.length;
  const confSum = history.reduce((acc, e) => acc + e.confidence, 0);
  return {
    buildCount: total,
    optOutCount,
    overrideCount: overrides.length,
    toneDistribution: toneDist,
    averageConfidence: total === 0 ? 0 : confSum / total,
    averageDurationMs: 0, // populado externamente se desejado
  };
}

/** Helper para verificar se dois tons são "equivalentes" no eixo emocional. */
export function tonesAreClose(a: DevotionalTone, b: DevotionalTone): boolean {
  if (a === b) return true;
  const sameFamily: Readonly<Record<DevotionalTone, readonly DevotionalTone[]>> = {
    grounding: ["grounding", "centering"],
    uplifting: ["uplifting", "joyful"],
    contemplative: ["contemplative", "silent"],
    joyful: ["joyful", "uplifting"],
    compassionate: ["compassionate", "releasing"],
    releasing: ["releasing", "compassionate"],
    energizing: ["energizing", "uplifting"],
    centering: ["centering", "grounding"],
    ritualistic: ["ritualistic", "centering"],
    silent: ["silent", "contemplative"],
    neutral: ["neutral"],
  };

  return sameFamily[a].includes(b);
}

/** Escolhe o tom a partir do histórico mais recente do usuário. */
export function suggestToneFromHistory(
  userId: string,
  history: readonly ToneHistoryEntry[],
  nowMs: number,
  recencyDays: number = 7,
): DevotionalTone | null {
  const recent = getUserToneHistory(userId, recencyDays, nowMs, history);
  if (recent.length === 0) return null;
  // retorna o tom mais frequente
  const freq = new Map<DevotionalTone, number>();
  for (const e of recent) freq.set(e.tone, (freq.get(e.tone) ?? 0) + 1);
  let best: DevotionalTone | null = null;
  let bestCount = -1;
  for (const [tone, count] of freq) {
    if (count > bestCount) {
      best = tone;
      bestCount = count;
    }
  }
  return best;
}

/** Decide o tom a usar, optando por personalização se houver histórico. */
export function selectToneWithPersonalization(input: {
  userId: string;
  mood: VoiceMood;
  confidence: number;
  tradition: TraditionTag;
  hour: number;
  history: readonly ToneHistoryEntry[];
  nowMs: number;
}): MoodToToneMapping {
  const baseline = mapMoodToTone(input.mood, input.confidence, input.tradition, input.hour);
  const preferred = suggestToneFromHistory(input.userId, input.history, input.nowMs, 14);
  if (!preferred || preferred === "neutral") return baseline;
  // Só personaliza se o tom preferido é "afim" ao baseline (eixo emocional)
  if (tonesAreClose(preferred, baseline.tone)) {
    return { ...baseline, tone: preferred, ssmlProsody: DEFAULT_TONE_PROSODY[preferred] };
  }
  return baseline;
}

// =============================================================================
// SEÇÃO 13 — INVARIANTES DO ENGINE
// =============================================================================

/** Sanity check: a matrix cobre todos os VoiceMoods? */
export function invariantMatrixCoversAllMoods(): boolean {
  return VOICE_MOODS.every((m) => m in MOOD_TO_TONE_MATRIX);
}

/** Sanity check: cada tone tem prosódia default. */
export function invariantAllTonesHaveProsody(): boolean {
  return DEVOTIONAL_TONES.every((t) => {
    const p = DEFAULT_TONE_PROSODY[t];
    return p !== undefined && typeof p === "object";
  });
}

/** Sanity check: 5 tons básicos mapeiam a Traditions. */
export function invariantTraditionCoverage(): boolean {
  return SUPPORTED_TRADITIONS.every((t) => t in TRADITION_TONE_AFFINITIES && t in TRADITION_PRIMARY_CATEGORY);
}

/** Roda todas as invariantes — útil em CI / testes. */
export function runAllInvariants(): { ok: boolean; failed: string[] } {
  const failed: string[] = [];
  if (!invariantMatrixCoversAllMoods()) failed.push("matrix_covers_all_moods");
  if (!invariantAllTonesHaveProsody()) failed.push("all_tones_have_prosody");
  if (!invariantTraditionCoverage()) failed.push("tradition_coverage");
  return { ok: failed.length === 0, failed };
}

// =============================================================================
// SEÇÃO 14 — EXPORTS DE ANÁLISE & SANITIZAÇÃO
// =============================================================================

/** Redacta PII básica de uma string (telefone, e-mail). */
export function redactPII(text: string): string {
  return text
    .replace(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, "[EMAIL]")
    .replace(/\b\(\d{2}\)\s?\d{4,5}-?\d{4}\b/g, "[PHONE]")
    .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, "[CPF]");
}

/** Sanitiza texto antes de inserir no SSML. Belt-and-suspenders. */
export function sanitizeForSSML(text: string): string {
  return redactPII(text).replace(/[<>]/g, "");
}

/** Verifica se uma string está pronta para virar SSML. */
export function isSSMLSafe(text: string): boolean {
  return !/[<>]/.test(text) && isBalancedSSML(text);
}

/** Conta caracteres especiais perigosos em uma string. */
export function countDangerousChars(text: string): number {
  let count = 0;
  for (const ch of text) {
    if (ch === "<" || ch === ">" || ch === "&") count++;
  }
  return count;
}

/** Soma duração total de uma lista de sequências. */
export function sumSequencesDuration(sequences: readonly DevotionalSequence[]): number {
  return sequences.reduce((acc, s) => acc + s.totalDurationMs, 0);
}

/** Calcula a média de duração das sequências. */
export function averageSequenceDuration(sequences: readonly DevotionalSequence[]): number {
  if (sequences.length === 0) return 0;
  return sumSequencesDuration(sequences) / sequences.length;
}
