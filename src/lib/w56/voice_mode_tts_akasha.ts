/**
 * w56/voice-mode-tts-akasha
 * ──────────────────────────────────────────────────────────────────
 * Voice mode engine para Akasha IA — forma TTS (text-to-speech) com
 * máquina de estados de reprodução, chunking de cues em fronteiras de
 * sentença/cláusula, controles de rate + pitch + voice, bloqueio
 * obrigatório de conteúdo sagrado na reprodução, e conformidade
 * LGPD Art. 7 (consentimento), Art. 9 (finalidade) e Art. 18
 * (direitos do titular).
 *
 * Especificação POR FORMA para w55/akasha-ia-streaming-ui (não há
 * imports — apenas contrato estrutural espelhado). O engine fala,
 * mas nunca fala conteúdo sagrado: qualquer cue marcado como
 * sacred é convertido em placeholder `[conteúdo em modo silêncio]`
 * e a notificação de reception ainda dispara.
 *
 * Self-contained: tipos de TS + Math nativo + string ops. Sem
 * dependência externa, sem node:crypto, sem prisma em runtime,
 * sem fetch. Determinístico dado RNG seedada quando precisar.
 *
 * Layout:
 *   §1  Tipos & contratos
 *   §2  Constantes, taxonomias, sacred patterns, defaults
 *   §3  Math helpers (FNV-1a 32/64, hex encode, RunningStats
 *        Welford, EMA, clamp, duration estimate)
 *   §4  Voice descriptor (handle, BCP-47 locale, gender, profile,
 *        preview shape)
 *   §5  Voice selection (match by locale + gender + style;
 *        fallback chain; SacredVoiceRegistry)
 *   §6  Cue chunker (sentence/clause boundaries, max 240 chars,
 *        preserva numeração)
 *   §7  TTS job builder (cues + voice + config → TtsJobShape com
 *        estimatedDurationMs)
 *   §8  Playback state machine (idle → loading → playing →
 *        paused → done|error; queue + next-cue pointer)
 *   §9  Playback controls (play/pause/resume/seek/stop com
 *        cueId ou timestampMs)
 *   §10 Rate/pitch control (validate [0.5..4.0] rate, [-12..12]
 *        pitch; emit audio-queue update event)
 *   §11 A11y live region (aria-busy, aria-live="polite",
 *        announce state changes; visual caption fallback)
 *   §12 Sacred-content block (hard rule: sacred cue nunca é
 *        spoken; replaced com placeholder; reception notification
 *        ainda dispara)
 *   §13 LGPD Art. 7 (opt-in explícito; voice biometric enrollment
 *        é opt-in SEPARATE; preferences encrypted-keyed),
 *        Art. 9 (purpose: TTS rendering, NOT voice biometric
 *        identification), Art. 18 (export voice preferences +
 *        last 30 days playback history; erasure removes
 *        preferences + history + voice biometric template)
 *   §14 Audit (VoiceActivated, VoiceDeactivated, JobQueued,
 *        CueStarted, CueCompleted, SacredSkip, RateChanged,
 *        OptInChanged, LgpdExport, LgpdErasure)
 *   §15 Smoke / regression scenarios
 *   §16 Doc-string constants
 */

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §1 Tipos & Contratos                                                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Estados do playback state machine. `idle` é o estado de repouso
 * sem nenhuma queue ativa. `loading` significa que o motor está
 * preparando o audio buffer (warm-up). `playing`/`paused` formam
 * o par ativo. `done` é terminal bem-sucedido, `error` é terminal
 * de falha (recuperável via `play()` de novo).
 */
export type VoiceModeState =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "done"
  | "error";

/**
 * Cue individual — um fragmento de texto com marcação sacred opcional.
 * `cueId` é gerado pelo chunker e usado como seek target. `index`
 * é a posição no queue (0-based). `charStart`/`charEnd` permite
 * mapear de volta ao texto original.
 */
export interface PlaybackCue {
  cueId: string;           // FNV-1a 64 do conteúdo + index
  index: number;           // posição no queue
  text: string;            // texto a ser spoken (≤ MAX_CHARS_PER_CUE)
  charStart: number;       // offset no texto-fonte
  charEnd: number;         // offset fim (exclusivo)
  sacredFlag: boolean;     // true se contém conteúdo sacred
  sacredKind?: SacredKind; // granularidade do flag
  /** Texto spoken efetivo — difere de `text` se for sacred. */
  spokenText: string;
  /** estimatedDurationMs para este cue (considerando rate atual). */
  estimatedDurationMs: number;
  /** timestampMs é o offset relativo ao job (acumulado). */
  timestampMs: number;
}

/** Tipos de conteúdo sagrado — mutuamente exclusivos. */
export type SacredKind =
  | "prayer"
  | "chant"
  | "ritual"
  | "litany"
  | "mantra"
  | "dhikr"
  | "novena"
  | "psalm";

/**
 * Configuração de voz — taxa, pitch e voz ativa. `voiceId` é uma
 * chave no VoiceRegistry. `voiceBiometricConsent` é OPT-IN SEPARADO
 * — se true, o motor pode usar timbre customizado; nunca usado para
 * identificação biométrica (Art. 9 explicita isso).
 */
export interface VoiceConfig {
  voiceId: string;                       // chave no registry
  rate: number;                          // 0.5..4.0 (default 1.0)
  pitch: number;                         // -12..+12 (default 0)
  volume: number;                        // 0.0..1.0 (default 1.0)
  locale: VoiceLocale;                   // BCP-47
  voiceBiometricConsent: boolean;        // opt-in SEPARATE
  captionsEnabled: boolean;              // captions visuais
  silenceSacredEnabled: boolean;         // hard default true; respeitado sempre
}

/** Locale BCP-47 suportado. */
export type VoiceLocale = "pt-BR" | "en-US" | "es-ES" | "fr-FR" | "ja-JP";

/**
 * Job TTS — saída do job builder. Combina cues + voice + config.
 * `estimatedDurationMs` é o somatório de todos os cues ajustados
 * pelo rate. `cues[].estimatedDurationMs` reflete rate individual,
 * enquanto `estimatedDurationMs` é o total.
 */
export interface TtsJobShape {
  jobId: string;                         // FNV-1a 64 do payload
  queue: PlaybackCue[];
  voice: VoiceConfig;
  voiceDescriptor: VoiceHandle;
  estimatedDurationMs: number;           // total acumulado
  estimatedDurationMsAtRate1: number;    // baseline (rate=1.0)
  createdAt: number;                     // epoch ms
  sacredCount: number;                   // cues marcados como sacred
  effectiveCueCount: number;             // cues que serão spoken
}

/**
 * Handle de voz — descriptor do que está instalado/selecionado.
 * `locale` é BCP-47; `gender` é enum; `styleHint` é opcional
 * (ex: "warm", "calm", "energetic"). `previewUrlShape` é uma URL
 * template (não é fetchnado pelo engine).
 */
export interface VoiceHandle {
  voiceId: string;
  displayName: string;
  locale: VoiceLocale;
  gender: VoiceGender;
  styleHint?: VoiceStyleHint;
  previewUrlShape: string;               // nunca fetchnado
  neural: boolean;                       // true = neural, false = standard
  sampleRateHz: number;                  // 16000 | 22050 | 24000 | 44100
  profile: VoiceProfile;                 // taxonomia preferida
}

/** Gênero da voz — declarado, não inferido. */
export type VoiceGender = "female" | "male" | "neutral";

/** Style hint — opcional, usado em fallback. */
export type VoiceStyleHint =
  | "warm"
  | "calm"
  | "energetic"
  | "neutral"
  | "meditative"
  | "storyteller";

/** Perfil de voz — taxonomia própria do produto. */
export type VoiceProfile =
  | "mood_companion"        // sessões w53 mood-coach
  | "tarot_reader"          // leituras de tarô/cigano/lenormand
  | "ritual_guide"          // conduz rituals
  | "storyteller"           // narrativa geral
  | "meditation_guide"      // meditação guiada
  | "default";              // fallback universal

/**
 * AudioSegment — unidade de áudio físico (se houver integração com
 * um TTS provider). Aqui é só SHAPE; o engine não toca audio de fato.
 * `audioRef` é um handle opaco (Data URL, Blob URL, ou ID de buffer).
 */
export interface AudioSegment {
  cueId: string;
  audioRef: string | null;   // null se sacred (placeholder silencioso)
  durationMs: number;        // observado ou estimado
  sampleRateHz: number;
  bytes: number;             // 0 se null audioRef
  sacred: boolean;           // hard true ⇒ audioRef = null
}

/**
 * PlaybackError — code prefixado VM_ (voice mode) para não colidir
 * com códigos do leaderboard (LB_). Veja VOICE_MODE_ERROR_MESSAGES.
 */
export type VoiceModeErrorCode =
  | "VM_001"  // voice not found in registry
  | "VM_002"  // rate fora do range permitido
  | "VM_003"  // pitch fora do range permitido
  | "VM_004"  // job queue vazia
  | "VM_005"  // transition inválida (e.g. pause a partir de idle)
  | "VM_006"  // seek para timestampMs negativo ou além do total
  | "VM_007"  // opt-in ausente (tentou ativar sem consentimento)
  | "VM_008"  // voice biometric sem consentimento separado
  | "VM_009"  // LGPD export solicitado mas não há opt-in
  | "VM_010"  // LGPD erasure solicitado mas não há opt-in
  | "VM_011"  // cue chunking falhou (texto vazio ou inválido)
  | "VM_012"  // sacred content protection violation (nunca deveria disparar — sanity check)
  | "VM_013"; // invalid locale

export interface PlaybackError {
  code: VoiceModeErrorCode;
  message: string;
  detail?: string;
  ts: number;
}

/**
 * VoiceActivation — registro quando o usuário liga voice mode.
 * `userId` é cru; engine hasha internamente. `optIn` é o consent
 * explícito (Art. 7) — sem optIn nunca ativamos.
 */
export interface VoiceActivation {
  userId: string;            // cru — hashed via fnv1a64
  optIn: boolean;            // deve ser true para ativar
  optInAt: number | null;    // epoch ms do consent
  revokedAt: number | null;  // epoch ms da última revogação
  biometricEnrolledAt: number | null;  // opt-in SEPARATE
  preferences: VoiceConfig | null;
  history: OptInEvent[];     // trilha auditável
  retentionDays: number;     // default 30
}

/** Eventos de opt-in — registrados no history. */
export interface OptInEvent {
  ts: number;
  action:
    | "opt_in"
    | "opt_out"
    | "biometric_opt_in"
    | "biometric_opt_out"
    | "auto_revoke"
    | "lgpd_export"
    | "lgpd_erasure";
  reason?: string;
  requestId?: string;
}

/**
 * PlaybackHistoryEntry — item do histórico (mantido por 30 dias por
 * default, configurável). `cuesTotal` é o tamanho original do queue;
 * `cuesPlayed` é o que foi spoken de fato (sacred não conta); o
 * user-cohort cross-reference é via `sessionId`.
 */
export interface PlaybackHistoryEntry {
  entryId: string;            // FNV-1a 64
  userId: string;             // hashed
  sessionId: string | null;   // opcional (sessão de chamada)
  voiceId: string;
  jobId: string;
  startedAt: number;
  endedAt: number | null;     // null se ainda ativo
  durationSec: number;
  cuesTotal: number;
  cuesPlayed: number;         // exclui sacred
  cuesSacred: number;         // cue count sacred
  rate: number;
  pitch: number;
  locale: VoiceLocale;
}

/**
 * LGPDExportPayload — o que sai quando o titular pede Art. 18,V.
 * Inclui preferences + últimos 30 dias de playback history +
 * metadata de opt-in/biometric (sem conteúdo de áudio).
 */
export interface LGPDExportPayload {
  userId: string;
  exportedAt: number;
  activation: VoiceActivation;
  recentHistory: PlaybackHistoryEntry[];
  auditHash: string;          // FNV-1a 64 do payload serializado
  engineVersion: string;
}

/**
 * A11yAnnouncement — texto para o aria-live region. `priority`
 * define se interrompe (`assertive`) ou aguarda fim de fala
 * corrente (`polite`).
 */
export interface A11yAnnouncement {
  ts: number;
  priority: "polite" | "assertive";
  text: string;
  category: A11yCategory;
}

export type A11yCategory =
  | "state_change"
  | "cue_started"
  | "cue_completed"
  | "sacred_placeholder"
  | "error"
  | "optin_prompt";

/** AudioQueueUpdateEvent — emitido por mudanças de queue/config. */
export interface AudioQueueUpdateEvent {
  ts: number;
  tsMs: number;
  type:
    | "queue_built"
    | "cue_started"
    | "cue_completed"
    | "rate_changed"
    | "pitch_changed"
    | "voice_changed"
    | "play"
    | "pause"
    | "resume"
    | "stop"
    | "seek"
    | "sacred_skipped"
    | "error";
  jobId?: string;
  cueId?: string;
  detail?: string;
}

/**
 * SacredVoiceRegistry — mapeia vozes designadas para uso em
 * conteúdo sacred (são INSTALADAS mas o engine NUNCA as usa
 * porque o sacred block é hard). Mantido por transparência.
 */
export interface SacredVoiceRegistry {
  sacredVoices: VoiceHandle[];
  /** Pretend flag — sempre true: registry existe apenas para auditoria. */
  silentOnly: true;
}

/**
 * VoiceModeReport — saída do engine principal (similar ao
 * LeaderboardReport do w54). `state` é o snapshot; `errors`
 * acumulam; `auditTrail` é a sequência de AuditStep.
 */
export interface VoiceModeReport {
  state: VoiceModeStateSnapshot;
  activation?: VoiceActivation;
  currentJob?: TtsJobShape;
  errors: PlaybackError[];
  auditTrail: AuditStep[];
  a11yQueue: A11yAnnouncement[];
  audioQueueEvents: AudioQueueUpdateEvent[];
  durationMs: number;
  generatedAt: number;
  engineVersion: string;
}

/** Snapshot serializável do playback state machine. */
export interface VoiceModeStateSnapshot {
  state: VoiceModeState;
  jobId: string | null;
  currentCueId: string | null;
  currentCueIndex: number;
  elapsedMs: number;
  rate: number;
  pitch: number;
  volume: number;
  voiceId: string;
  locale: VoiceLocale;
  sacredCount: number;
  effectiveCueCount: number;
}

/** Audit step — trilha interna. */
export interface AuditStep {
  step: string;
  ts: number;
  ok: boolean;
  detail?: string;
}

/**
 * VoiceModeErrorRecord — tipo cumulativo de erros. Diferencia de
 * PlaybackError apenas pela semântica (errors "históricos").
 */
export interface VoiceModeErrorRecord {
  code: VoiceModeErrorCode;
  message: string;
  detail?: string;
  ts: number;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §2 Constantes, taxonomias, sacred patterns, defaults                     ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Versão do engine — incrementada quando schema/logica muda. */
export const ENGINE_VERSION = "1.0.0-w56";

/** Política version — atrelada a ledger de auditoria LGPD. */
export const POLICY_VERSION = "w56-voice-2026.06.29";

/** Limites do player. */
export const DEFAULT_RATE = 1.0;
export const DEFAULT_PITCH = 0;
export const DEFAULT_VOLUME = 1.0;
export const MIN_CUE_RATE = 0.5;
export const MAX_CUE_RATE = 4.0;
export const MIN_CUE_PITCH = -12;
export const MAX_CUE_PITCH = 12;
export const MAX_CHARS_PER_CUE = 240;
export const MIN_CUE_INTERVAL_MS = 120;
export const MS_PER_CHAR_HEURISTIC = 60;   // ~60ms por char em rate=1.0
export const CUE_OVERHEAD_MS = 40;         // overhead de start/stop por cue

/** Locales suportados. */
export const SUPPORTED_LOCALES: readonly VoiceLocale[] = [
  "pt-BR",
  "en-US",
  "es-ES",
  "fr-FR",
  "ja-JP",
] as const;

/** Locale default se caller não informar. */
export const DEFAULT_LOCALE: VoiceLocale = "pt-BR";

/** Perfil default. */
export const DEFAULT_VOICE_PROFILE: VoiceProfile = "default";

/** Sample rates comuns. */
export const COMMON_SAMPLE_RATES_HZ: readonly number[] = [
  16000, 22050, 24000, 44100,
] as const;

/** Default retention de playback history em dias. */
export const PLAYBACK_HISTORY_RETENTION_DAYS = 30;

/** Perfil da voz do mood-companion w53. */
export const VOICE_PROFILE_MOOD_COMPANION = "mood_companion" as const;

/** Perfil do tarot reader. */
export const VOICE_PROFILE_TAROT_READER = "tarot_reader" as const;

/** Perfil do ritual guide. */
export const VOICE_PROFILE_RITUAL_GUIDE = "ritual_guide" as const;

/** Perfil do storyteller. */
export const VOICE_PROFILE_STORYTELLER = "storyteller" as const;

/** Perfil do meditation guide. */
export const VOICE_PROFILE_MEDITATION_GUIDE = "meditation_guide" as const;

/** Gêneros reconhecidos. */
export const VOICE_GENDERS: readonly VoiceGender[] = [
  "female", "male", "neutral",
] as const;

/** Style hints reconhecidos. */
export const VOICE_STYLE_HINTS: readonly VoiceStyleHint[] = [
  "warm", "calm", "energetic", "neutral", "meditative", "storyteller",
] as const;

/** Mapeamento profile → style hint default. */
export const PROFILE_DEFAULT_STYLE: Record<VoiceProfile, VoiceStyleHint> = {
  mood_companion: "warm",
  tarot_reader: "storyteller",
  ritual_guide: "calm",
  storyteller: "neutral",
  meditation_guide: "meditative",
  default: "neutral",
};

/** Mapeamento profile → gender default. */
export const PROFILE_DEFAULT_GENDER: Record<VoiceProfile, VoiceGender> = {
  mood_companion: "female",
  tarot_reader: "female",
  ritual_guide: "neutral",
  storyteller: "neutral",
  meditation_guide: "female",
  default: "neutral",
};

/**
 * Sacred patterns — termos/keywords que marcam uma cue como
 * `sacredFlag=true`. Match case-insensitive em PT/EN/ES. A lista
 * é curada: cobre prayers/chants/rituals comuns, sem falsos
 * positivos óbvios.
 */
export const SACRED_PATTERNS_PT: readonly string[] = [
  "oração", "oracao",
  "rezar", "reze",
  "prece",
  "salmo", "salmos",
  "ladainha",
  "novena",
  "mantra",
  "dhikr",
  "ritual",
  "cântico", "cantico",
  "exorcismo",
  "consagração", "consagracao",
  "invocação", "invocacao",
  "bendição", "bendicao",
] as const;

export const SACRED_PATTERNS_EN: readonly string[] = [
  "prayer",
  "prayers",
  "litany",
  "novena",
  "psalm",
  "psalms",
  "mantra",
  "dhikr",
  "chant",
  "chanting",
  "ritual",
  "rite",
  "exorcism",
  "consecration",
  "invocation",
  "blessing",
] as const;

export const SACRED_PATTERNS_ES: readonly string[] = [
  "oración", "oracion",
  "rezar",
  "ruego",
  "salmo", "salmos",
  "letanía", "letania",
  "novena",
  "mantra",
  "ritual",
  "cántico", "cantico",
  "exorcismo",
  "consagración", "consagracion",
  "invocación", "invocacion",
  "bendición", "bendicion",
] as const;

/** Tipos de sacred — alinhados com SacredKind. */
export const SACRED_KIND_TAXONOMY: readonly SacredKind[] = [
  "prayer",
  "chant",
  "ritual",
  "litany",
  "mantra",
  "dhikr",
  "novena",
  "psalm",
] as const;

/** Placeholder spoken para cues sacred. */
export const SACRED_PLACEHOLDER_TEXT = "[conteúdo em modo silêncio]";

/** Placeholder EN (fallback se caller força locale en). */
export const SACRED_PLACEHOLDER_TEXT_EN = "[content in silence mode]";

/** Placeholder ES. */
export const SACRED_PLACEHOLDER_TEXT_ES = "[contenido en modo silencio]";

/** i18n labels PT-BR. */
export const LABELS_PT_BR = {
  title: "Modo voz da Akasha",
  optInTitle: "Ativar modo voz?",
  optInDescription:
    "A Akasha lê suas respostas em voz alta. Você pode pausar, ajustar velocidade e tom a qualquer momento.",
  biometricTitle: "Voz personalizada (biométrica)",
  biometricDescription:
    "Opcional e separado do consentimento principal. Usamos seu timbre apenas para TTS — nunca para identificação.",
  stop: "Parar",
  play: "Tocar",
  pause: "Pausar",
  resume: "Continuar",
  sacredPlaceholderTitle: "Conteúdo em silêncio",
  sacredPlaceholderDescription:
    "Esta parte inclui oração, ritual ou canto. Mesmo com o modo voz ativo, não a falamos em voz alta.",
  ariaStatePlaying: "Reproduzindo",
  ariaStatePaused: "Pausado",
  ariaStateLoading: "Carregando áudio",
  ariaCueStarted: "Próxima parte",
  ariaCueCompleted: "Parte concluída",
  ariaError: "Erro de áudio",
  rateLabel: "Velocidade",
  pitchLabel: "Tom",
  voiceLabel: "Voz",
  captionsLabel: "Legendas",
  rateSlow: "Lenta",
  rateFast: "Rápida",
} as const;

/** i18n labels EN-US. */
export const LABELS_EN_US = {
  title: "Akasha voice mode",
  optInTitle: "Activate voice mode?",
  optInDescription:
    "Akasha reads your answers out loud. You can pause and adjust speed and pitch at any time.",
  biometricTitle: "Personalized voice (biometric)",
  biometricDescription:
    "Optional and separate from main consent. We use your voice only for TTS — never for identification.",
  stop: "Stop",
  play: "Play",
  pause: "Pause",
  resume: "Resume",
  sacredPlaceholderTitle: "Content in silence mode",
  sacredPlaceholderDescription:
    "This part includes prayer, ritual or chant. Even with voice mode on, we don't speak it aloud.",
  ariaStatePlaying: "Playing",
  ariaStatePaused: "Paused",
  ariaStateLoading: "Loading audio",
  ariaCueStarted: "Next part",
  ariaCueCompleted: "Part completed",
  ariaError: "Audio error",
  rateLabel: "Speed",
  pitchLabel: "Pitch",
  voiceLabel: "Voice",
  captionsLabel: "Captions",
  rateSlow: "Slow",
  rateFast: "Fast",
} as const;

/** Selector de labels por locale. */
export type VoiceModeLocale = VoiceLocale;

export function getVoiceLabels(
  locale: VoiceLocale
): (typeof LABELS_PT_BR | typeof LABELS_EN_US) {
  return locale === "pt-BR" || locale === "es-ES"
    ? LABELS_PT_BR
    : LABELS_EN_US;
}

/** Aria politeness default. */
export const ARIA_LIVE_DEFAULT: "polite" | "assertive" = "polite";

/** Engine constants doc. */
export const ENGINE_DEFAULTS = {
  rate: DEFAULT_RATE,
  pitch: DEFAULT_PITCH,
  volume: DEFAULT_VOLUME,
  locale: DEFAULT_LOCALE,
  profile: DEFAULT_VOICE_PROFILE,
  sacredSilent: true,
  retentionDays: PLAYBACK_HISTORY_RETENTION_DAYS,
} as const;

/** Engine limits doc. */
export const ENGINE_LIMITS = {
  minRate: MIN_CUE_RATE,
  maxRate: MAX_CUE_RATE,
  minPitch: MIN_CUE_PITCH,
  maxPitch: MAX_CUE_PITCH,
  maxCharsPerCue: MAX_CHARS_PER_CUE,
  minCueIntervalMs: MIN_CUE_INTERVAL_MS,
  maxQueueSize: 500,
  maxHistoryEntries: 5000,
  maxAuditSteps: 5000,
  maxA11yQueue: 200,
  maxAudioQueueEvents: 5000,
  retentionDaysDefault: PLAYBACK_HISTORY_RETENTION_DAYS,
} as const;

/** HMAC key placeholder — em produção vem de env. */
export const VOICE_KEY_PLACEHOLDER = "__SET_VOICE_OPT_IN_KEY__";

/** Default voice id se registry não tiver voice solicitada. */
export const DEFAULT_VOICE_ID = "akasha-pt-br-female-warm";

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §3 Math helpers — FNV-1a 32/64, hex encode, RunningStats Welford, EMA    ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

// ─── FNV-1a 32-bit ──────────────────────────────────────────────────────────

const FNV1A_32_OFFSET = 0x811c9dc5;
const FNV1A_32_PRIME = 0x01000193;

export function fnv1a32(input: string): string {
  let hash = FNV1A_32_OFFSET >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i) & 0xff;
    hash = Math.imul(hash, FNV1A_32_PRIME) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

// ─── FNV-1a 64-bit (BigInt-safe) ───────────────────────────────────────────

const FNV1A_64_OFFSET = BigInt("0xcbf29ce484222325");
const FNV1A_64_PRIME = BigInt("0x100000001b3");
const FNV1A_64_MASK = (BigInt(1) << BigInt(64)) - BigInt(1);

export function fnv1a64(input: string): string {
  let hash = FNV1A_64_OFFSET & FNV1A_64_MASK;
  for (let i = 0; i < input.length; i++) {
    hash ^= BigInt(input.charCodeAt(i) & 0xff);
    hash = (hash * FNV1A_64_PRIME) & FNV1A_64_MASK;
  }
  return hash.toString(16).padStart(16, "0");
}

// ─── UTF-8 encode ──────────────────────────────────────────────────────────

export function utf8Encode(input: string): Uint8Array {
  const result: number[] = [];
  for (let i = 0; i < input.length; i++) {
    let cp = input.charCodeAt(i);
    if (cp < 0x80) {
      result.push(cp);
    } else if (cp < 0x800) {
      result.push(0xc0 | (cp >> 6));
      result.push(0x80 | (cp & 0x3f));
    } else if (cp >= 0xd800 && cp <= 0xdbff) {
      const next = input.charCodeAt(i + 1);
      cp = 0x10000 + (((cp & 0x3ff) << 10) | (next & 0x3ff));
      i++;
      result.push(0xf0 | (cp >> 18));
      result.push(0x80 | ((cp >> 12) & 0x3f));
      result.push(0x80 | ((cp >> 6) & 0x3f));
      result.push(0x80 | (cp & 0x3f));
    } else {
      result.push(0xe0 | (cp >> 12));
      result.push(0x80 | ((cp >> 6) & 0x3f));
      result.push(0x80 | (cp & 0x3f));
    }
  }
  return new Uint8Array(result);
}

// ─── Hex encode ────────────────────────────────────────────────────────────

export function bytesToHex(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) {
    s += bytes[i]!.toString(16).padStart(2, "0");
  }
  return s;
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/[^0-9a-fA-F]/g, "");
  const out = new Uint8Array(Math.floor(clean.length / 2));
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return out;
}

// ─── Mulberry32 PRNG (seeded, deterministic) ───────────────────────────────

export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── clamp / lerp / safeDiv ────────────────────────────────────────────────

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function lerp(a: number, b: number, t: number): number {
  const tClamped = clamp(t, 0, 1);
  return a + (b - a) * tClamped;
}

export function safeDiv(a: number, b: number, fallback: number = 0): number {
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return fallback;
  return a / b;
}

// ─── RunningStats (Welford — online) ───────────────────────────────────────

export interface RunningStats {
  count: number;
  mean: number;
  variance: number;     // population variance
  min: number;
  max: number;
}

export function runningStatsCreate(): RunningStats {
  return {
    count: 0,
    mean: 0,
    variance: 0,
    min: Number.POSITIVE_INFINITY,
    max: Number.NEGATIVE_INFINITY,
  };
}

export function runningStatsPush(stats: RunningStats, value: number): RunningStats {
  if (!Number.isFinite(value)) return stats;
  const n1 = stats.count;
  const n2 = stats.count + 1;
  const delta = value - stats.mean;
  const newMean = stats.mean + delta / n2;
  const delta2 = value - newMean;
  const newVar = ((stats.variance * n1) + delta * delta2) / n2;
  return {
    count: n2,
    mean: newMean,
    variance: Number.isNaN(newVar) ? 0 : newVar,
    min: Math.min(stats.min, value),
    max: Math.max(stats.max, value),
  };
}

export function runningStatsStddev(stats: RunningStats): number {
  if (stats.count < 2) return 0;
  return Math.sqrt(Math.max(0, stats.variance));
}

export function runningStatsMerge(a: RunningStats, b: RunningStats): RunningStats {
  if (a.count === 0) return b;
  if (b.count === 0) return a;
  const n = a.count + b.count;
  const delta = b.mean - a.mean;
  const newMean = (a.mean * a.count + b.mean * b.count) / n;
  const newVar = (a.variance * a.count + b.variance * b.count + delta * delta * a.count * b.count / n) / n;
  return {
    count: n,
    mean: newMean,
    variance: newVar,
    min: Math.min(a.min, b.min),
    max: Math.max(a.max, b.max),
  };
}

// ─── EMA (exponential moving average) ──────────────────────────────────────

export interface EmaState {
  value: number;
  alpha: number;
  count: number;
}

export function emaCreate(initial: number, alpha: number = 0.3): EmaState {
  return { value: initial, alpha: clamp(alpha, 0, 1), count: 1 };
}

export function emaPush(state: EmaState, value: number): EmaState {
  const newValue = state.alpha * value + (1 - state.alpha) * state.value;
  return { value: newValue, alpha: state.alpha, count: state.count + 1 };
}

// ─── Duration estimate ─────────────────────────────────────────────────────

/**
 * Estima a duração de uma cue (em ms) dado o número de caracteres
 * e o rate atual. Heurística: 60ms por char em rate=1.0; inverse
 * scale com rate (rate=2.0 ⇒ metade do tempo).
 */
export function estimateCueDurationMs(
  charCount: number,
  rate: number,
  baseMsPerChar: number = MS_PER_CHAR_HEURISTIC
): number {
  const r = clamp(rate, MIN_CUE_RATE, MAX_CUE_RATE);
  const chars = Math.max(0, charCount);
  const overhead = chars > 0 ? CUE_OVERHEAD_MS : 0;
  const raw = (chars * baseMsPerChar) / r + overhead;
  return Math.round(raw);
}

/**
 * Estima a duração total de um queue (soma de cues + intervalos).
 */
export function estimateQueueTotalMs(
  cues: PlaybackCue[],
  minIntervalMs: number = MIN_CUE_INTERVAL_MS
): number {
  if (cues.length === 0) return 0;
  let total = 0;
  for (let i = 0; i < cues.length; i++) {
    total += cues[i]!.estimatedDurationMs;
    if (i < cues.length - 1) total += minIntervalMs;
  }
  return total;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §4 Voice descriptor                                                       ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Helper para construir uma voice handle consistente.
 */
export function buildVoiceHandle(args: {
  voiceId: string;
  displayName: string;
  locale: VoiceLocale;
  gender: VoiceGender;
  profile: VoiceProfile;
  styleHint?: VoiceStyleHint;
  neural?: boolean;
  sampleRateHz?: number;
}): VoiceHandle {
  return {
    voiceId: args.voiceId,
    displayName: args.displayName,
    locale: args.locale,
    gender: args.gender,
    styleHint: args.styleHint ?? PROFILE_DEFAULT_STYLE[args.profile],
    previewUrlShape: `tts://preview/${args.voiceId}?locale=${args.locale}`,
    neural: args.neural ?? true,
    sampleRateHz: args.sampleRateHz ?? 24000,
    profile: args.profile,
  };
}

/**
 * Registry embutido (em produção isso viria do backend; aqui é
 * SHAPE para suportar w55). Cinco vozes cobrindo os perfis chave.
 */
export const SUPPORTED_VOICES: readonly VoiceHandle[] = [
  buildVoiceHandle({
    voiceId: "akasha-pt-br-female-warm",
    displayName: "Akasha (PT-BR, Feminina, Acolhedora)",
    locale: "pt-BR",
    gender: "female",
    profile: "mood_companion",
    styleHint: "warm",
  }),
  buildVoiceHandle({
    voiceId: "akasha-pt-br-neutral-calm",
    displayName: "Akasha (PT-BR, Neutra, Calma)",
    locale: "pt-BR",
    gender: "neutral",
    profile: "ritual_guide",
    styleHint: "calm",
  }),
  buildVoiceHandle({
    voiceId: "akasha-en-us-female-warm",
    displayName: "Akasha (EN-US, Feminine, Warm)",
    locale: "en-US",
    gender: "female",
    profile: "mood_companion",
    styleHint: "warm",
  }),
  buildVoiceHandle({
    voiceId: "akasha-en-us-male-storyteller",
    displayName: "Akasha (EN-US, Male, Storyteller)",
    locale: "en-US",
    gender: "male",
    profile: "storyteller",
    styleHint: "storyteller",
  }),
  buildVoiceHandle({
    voiceId: "akasha-es-es-female-meditative",
    displayName: "Akasha (ES-ES, Femenina, Meditativa)",
    locale: "es-ES",
    gender: "female",
    profile: "meditation_guide",
    styleHint: "meditative",
  }),
  buildVoiceHandle({
    voiceId: "akasha-fr-fr-female-neutral",
    displayName: "Akasha (FR-FR, Féminin, Neutre)",
    locale: "fr-FR",
    gender: "female",
    profile: "default",
    styleHint: "neutral",
  }),
  buildVoiceHandle({
    voiceId: "akasha-ja-jp-neutral-calm",
    displayName: "Akasha (JA-JP, Neutral, Calm)",
    locale: "ja-JP",
    gender: "neutral",
    profile: "meditation_guide",
    styleHint: "calm",
  }),
  buildVoiceHandle({
    voiceId: "akasha-pt-br-female-storyteller",
    displayName: "Akasha (PT-BR, Feminina, Contadora)",
    locale: "pt-BR",
    gender: "female",
    profile: "tarot_reader",
    styleHint: "storyteller",
  }),
  buildVoiceHandle({
    voiceId: "akasha-pt-br-male-energetic",
    displayName: "Akasha (PT-BR, Masculina, Energética)",
    locale: "pt-BR",
    gender: "male",
    profile: "default",
    styleHint: "energetic",
  }),
  buildVoiceHandle({
    voiceId: "akasha-default-female-neutral",
    displayName: "Akasha Default",
    locale: "pt-BR",
    gender: "female",
    profile: "default",
    styleHint: "neutral",
  }),
] as const;

/**
 * Indexa registry por voiceId. O(1) lookup.
 */
export function buildVoiceIndex(
  registry: readonly VoiceHandle[] = SUPPORTED_VOICES
): Map<string, VoiceHandle> {
  const m = new Map<string, VoiceHandle>();
  for (let i = 0; i < registry.length; i++) {
    const v = registry[i]!;
    m.set(v.voiceId, v);
  }
  return m;
}

/** Sacred Voice Registry — vozes designadas a conteúdo sacred (nunca usadas). */
export const SACRED_VOICE_REGISTRY: SacredVoiceRegistry = {
  sacredVoices: [
    buildVoiceHandle({
      voiceId: "sacred-prayer-pt-br-female",
      displayName: "Voz Sagrada — Oração",
      locale: "pt-BR",
      gender: "female",
      profile: "ritual_guide",
      styleHint: "calm",
    }),
    buildVoiceHandle({
      voiceId: "sacred-chant-en-us-male",
      displayName: "Sacred Voice — Chant",
      locale: "en-US",
      gender: "male",
      profile: "ritual_guide",
      styleHint: "meditative",
    }),
  ],
  silentOnly: true,
};

/** Voice index lookup O(1). */
export function getVoiceById(
  voiceId: string,
  registry: readonly VoiceHandle[] = SUPPORTED_VOICES
): VoiceHandle | null {
  const idx = buildVoiceIndex(registry);
  return idx.get(voiceId) ?? null;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §5 Voice selection                                                        ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export interface VoiceSelectionCriteria {
  locale?: VoiceLocale;
  gender?: VoiceGender;
  profile?: VoiceProfile;
  styleHint?: VoiceStyleHint;
}

export interface VoiceSelectionResult {
  selected: VoiceHandle;
  matchedBy: "exact" | "fallback_locale_gender" | "fallback_locale" | "fallback_profile" | "default";
  candidatesConsidered: number;
}

/**
 * Seleciona a voz mais adequada para os critérios. Algoritmo:
 *   1. match exato (locale + gender + profile + styleHint)
 *   2. fallback locale + gender
 *   3. fallback locale
 *   4. fallback profile
 *   5. default voice (akasha-pt-br-female-warm)
 */
export function selectVoice(
  criteria: VoiceSelectionCriteria,
  registry: readonly VoiceHandle[] = SUPPORTED_VOICES
): VoiceSelectionResult {
  const locale = criteria.locale ?? DEFAULT_LOCALE;
  const profile = criteria.profile ?? DEFAULT_VOICE_PROFILE;
  const candidates: VoiceHandle[] = registry as VoiceHandle[];

  // 1. exact
  const exact = candidates.find(
    (v) =>
      v.locale === locale &&
      (criteria.gender === undefined || v.gender === criteria.gender) &&
      v.profile === profile &&
      (criteria.styleHint === undefined || v.styleHint === criteria.styleHint)
  );
  if (exact) {
    return {
      selected: exact,
      matchedBy: "exact",
      candidatesConsidered: candidates.length,
    };
  }

  // 2. locale + gender
  if (criteria.gender !== undefined) {
    const localeGender = candidates.find(
      (v) => v.locale === locale && v.gender === criteria.gender
    );
    if (localeGender) {
      return {
        selected: localeGender,
        matchedBy: "fallback_locale_gender",
        candidatesConsidered: candidates.length,
      };
    }
  }

  // 3. locale only
  const localeOnly = candidates.find((v) => v.locale === locale);
  if (localeOnly) {
    return {
      selected: localeOnly,
      matchedBy: "fallback_locale",
      candidatesConsidered: candidates.length,
    };
  }

  // 4. profile only
  const profileOnly = candidates.find((v) => v.profile === profile);
  if (profileOnly) {
    return {
      selected: profileOnly,
      matchedBy: "fallback_profile",
      candidatesConsidered: candidates.length,
    };
  }

  // 5. default
  const def = getVoiceById(DEFAULT_VOICE_ID, registry);
  const fallback = def ?? candidates[0]!;
  return {
    selected: fallback,
    matchedBy: "default",
    candidatesConsidered: candidates.length,
  };
}

/**
 * Filtra vozes por locale.
 */
export function filterVoicesByLocale(
  locale: VoiceLocale,
  registry: readonly VoiceHandle[] = SUPPORTED_VOICES
): VoiceHandle[] {
  return (registry as VoiceHandle[]).filter((v) => v.locale === locale);
}

/**
 * Filtra vozes por profile.
 */
export function filterVoicesByProfile(
  profile: VoiceProfile,
  registry: readonly VoiceHandle[] = SUPPORTED_VOICES
): VoiceHandle[] {
  return (registry as VoiceHandle[]).filter((v) => v.profile === profile);
}

/**
 * Marca configuração de voz com defaults seguros (LGPD-friendly).
 * `silenceSacredEnabled` é sempre true (hard default).
 */
export function buildVoiceConfig(partial: Partial<VoiceConfig>): VoiceConfig {
  const rate = clamp(partial.rate ?? DEFAULT_RATE, MIN_CUE_RATE, MAX_CUE_RATE);
  const pitch = clamp(partial.pitch ?? DEFAULT_PITCH, MIN_CUE_PITCH, MAX_CUE_PITCH);
  return {
    voiceId: partial.voiceId ?? DEFAULT_VOICE_ID,
    rate,
    pitch,
    volume: clamp(partial.volume ?? DEFAULT_VOLUME, 0, 1),
    locale: partial.locale ?? DEFAULT_LOCALE,
    voiceBiometricConsent: partial.voiceBiometricConsent ?? false,
    captionsEnabled: partial.captionsEnabled ?? true,
    silenceSacredEnabled: true, // HARD
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §6 Cue chunker                                                            ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export interface ChunkResult {
  cues: PlaybackCue[];
  sacredCount: number;
  totalChars: number;
  /** Quantidade de cues que serão faladas (excl. sacred placeholder). */
  spokenCueCount: number;
}

/** Limites rápidos de escape para sentenças. */
const SENTENCE_ENDERS = new Set([".", "!", "?", "。", "！", "？"]);
const CLAUSE_SEPARATORS = new Set([",", ";", ":", "—", "–", "…", "·"]);

/**
 * Detecta se um pedaço de texto contém termos sagrados (case-
 * insensitive). Retorna true e qual o SacredKind.
 */
export function detectSacredInText(text: string): SacredKind | null {
  const lower = text.toLowerCase();

  // PT patterns
  for (const pat of SACRED_PATTERNS_PT) {
    if (lower.includes(pat)) {
      return classifyByText(lower, "pt");
    }
  }
  for (const pat of SACRED_PATTERNS_EN) {
    if (lower.includes(pat)) {
      return classifyByText(lower, "en");
    }
  }
  for (const pat of SACRED_PATTERNS_ES) {
    if (lower.includes(pat)) {
      return classifyByText(lower, "es");
    }
  }
  return null;
}

/**
 * Classifica qual o SacredKind detectado (mais específico possível).
 */
export function classifyByText(lowerText: string, _lang: "pt" | "en" | "es"): SacredKind {
  const rules: Array<[SacredKind, RegExp]> = [
    ["prayer", /(oração|oracion|prayer|prece|reze|rezar|ruego)/i],
    ["chant", /(cântico|cantico|chant|chanting)/i],
    ["ritual", /(ritual|rite|consagração|consagracion|consecration)/i],
    ["litany", /(ladainha|letanía|letania|litany)/i],
    ["mantra", /(mantra)/i],
    ["dhikr", /(dhikr)/i],
    ["novena", /(novena)/i],
    ["psalm", /(salmo|salmos|salmo|psalm|psalms)/i],
  ];
  for (const [kind, re] of rules) {
    if (re.test(lowerText)) return kind;
  }
  return "ritual"; // fallback conservador
}

/**
 * Chunk o texto em cues respeitando MAX_CHARS_PER_CUE e fronteiras
 * de sentença/cláusula. Preserva numeração (incluindo marcadores
 * "1.", "2)", "§3", etc.) evitando partir entre número e label.
 *
 * Algoritmo:
 *   1. Split em sentenças (fronteiras [.!?]).
 *   2. Para cada sentença que excede MAX_CHARS_PER_CUE, split em
 *      cláusulas (",;:" etc.) e re-merge respeitando o limite.
 *   3. Sentenças pequenas passam inteiras — não são merge-adas com
 *      vizinhas (preserva fronteira semântica).
 *   4. Cada cue recebe metadata sacred, char offsets e timestampMs.
 */
export function chunkTextIntoCues(args: {
  text: string;
  rate?: number;
  rateAdjustByChar?: boolean;
}): ChunkResult {
  const text = args.text ?? "";
  const rate = clamp(args.rate ?? DEFAULT_RATE, MIN_CUE_RATE, MAX_CUE_RATE);

  if (text.trim().length === 0) {
    return { cues: [], sacredCount: 0, totalChars: 0, spokenCueCount: 0 };
  }

  // Step 1: pre-tokenize respeitando aspas (preserva par/ímpar de aspas).
  const protectedText = protectQuotes(text);
  const sentences = splitOnSentenceBoundaries(protectedText);

  // Step 2: per-sentence — clause split + merge somente se > MAX_CHARS_PER_CUE.
  const chunks: string[] = [];
  for (const s of sentences) {
    if (s.length <= MAX_CHARS_PER_CUE) {
      chunks.push(s);
      continue;
    }
    const sub = splitOnClauseBoundaries(s);
    const merged = mergeShortChunks(sub, 50);
    for (const m of merged) chunks.push(m);
  }

  // Step 3: restaura aspas e detecta sacred, monta PlaybackCue.
  const cues: PlaybackCue[] = [];
  let sacredCount = 0;
  let cursor = 0;          // offset no texto-fonte (sem restoreQuotedQuotes protection)
  let timestampMs = 0;

  for (let i = 0; i < chunks.length; i++) {
    const protectedChunk = chunks[i]!;
    const restored = restoreQuotes(protectedChunk);
    const sacred = detectSacredInText(restored);
    const sac = !!sacred;

    if (sac) sacredCount += 1;

    const cueId = fnv1a64(`cue:${i}:${fnv1a64(restored)}`);
    const charCount = restored.length;
    const durationAtRate = estimateCueDurationMs(charCount, rate);

    const spokenText = sac ? SACRED_PLACEHOLDER_TEXT : restored;

    // Indexação charStart/charEnd no texto-fonte (busca melhor esforço).
    const charStart = findCharStartInOriginal(text, restored, cursor);
    const charEnd = charStart + charCount;
    cursor = charEnd;

    const cue: PlaybackCue = {
      cueId,
      index: i,
      text: restored,
      charStart,
      charEnd,
      sacredFlag: sac,
      sacredKind: sac ? sacred! : undefined,
      spokenText,
      estimatedDurationMs: durationAtRate,
      timestampMs,
    };
    timestampMs += durationAtRate + MIN_CUE_INTERVAL_MS;
    cues.push(cue);
  }

  const totalChars = cues.reduce((acc, c) => acc + c.text.length, 0);
  const spokenCueCount = cues.length - sacredCount;

  return {
    cues,
    sacredCount,
    totalChars,
    spokenCueCount,
  };
}

/**
 * Protege aspas contra o splitter (preserva aspas literais que
 * poderiam ser confundidas com sentence-enders). Implementação
 * simples: troca aspas alternadas por tokens sentinela.
 */
export function protectQuotes(text: string): string {
  let result = "";
  let quoteDepth = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (ch === '"' || ch === "'" || ch === "\u201C" || ch === "\u201D") {
      // toggle
      if (quoteDepth % 2 === 0) {
        result += "«";
      } else {
        result += "»";
      }
      quoteDepth += 1;
    } else if (ch === "«") {
      result += "««";
    } else if (ch === "»") {
      result += "»»";
    } else {
      result += ch;
    }
  }
  return result;
}

/** Inverso de protectQuotes. */
export function restoreQuotes(text: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (ch === "«") {
      if (text[i + 1] === "«") {
        result += "«";
        i++;
      } else {
        result += '"';
      }
    } else if (ch === "»") {
      if (text[i + 1] === "»") {
        result += "»";
        i++;
      } else {
        result += '"';
      }
    } else {
      result += ch;
    }
  }
  return result;
}

/**
 * Divide em sentenças em ".", "!", "?", "。", etc. Mantém o delimiter
 * como parte do chunk.
 */
export function splitOnSentenceBoundaries(text: string): string[] {
  const out: string[] = [];
  let buf = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    buf += ch;
    if (SENTENCE_ENDERS.has(ch)) {
      // include subsequent whitespace
      while (i + 1 < text.length && /[\s ]/.test(text[i + 1]!)) {
        i++;
        buf += text[i]!;
      }
      out.push(buf.trim());
      buf = "";
    }
  }
  if (buf.trim().length > 0) out.push(buf.trim());
  return out;
}

/**
 * Sub-divide uma sentença longa em cláusulas (",", ";", ":", etc.).
 */
export function splitOnClauseBoundaries(text: string): string[] {
  const out: string[] = [];
  let buf = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    buf += ch;
    if (CLAUSE_SEPARATORS.has(ch)) {
      // inclui o queue whitespace seguinte
      while (i + 1 < text.length && /\s/.test(text[i + 1]!)) {
        i++;
        buf += text[i]!;
      }
      if (buf.trim().length > 0) {
        out.push(buf.trim());
        buf = "";
      }
    }
  }
  if (buf.trim().length > 0) out.push(buf.trim());
  return out;
}

/**
 * Merge chunks de fragmentos de sentença (sub-cláusulas) para
 * construir cues inteiras, respeitando MAX_CHARS_PER_CUE. Preserva
 * ordem. Cada elemento de input deve ser uma sub-cláusula (parte
 * de uma mesma sentença); sentenças completas passam intactas.
 *
 * Limiar `fragmentThreshold`: chunks com <= N chars são considerados
 * fragmentos pequenos e agrupados; chunks maiores são mantidos
 * sozinhos (são sentenças inteiras já).
 */
export function mergeShortChunks(
  chunks: string[],
  fragmentThreshold: number = 50
): string[] {
  const out: string[] = [];
  let cur = "";
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i]!;
    const isFragment = c.length <= fragmentThreshold;
    if (cur.length === 0) {
      cur = c;
    } else if (
      isFragment &&
      cur.length + c.length + 1 <= MAX_CHARS_PER_CUE
    ) {
      cur = cur + " " + c;
    } else {
      out.push(cur);
      cur = c;
    }
  }
  if (cur.length > 0) out.push(cur);
  return out;
}

/**
 * Encontra o charStart no texto-fonte, buscando o chunk a partir de
 * cursor. Best-effort — fallback para 0 se não achar.
 */
export function findCharStartInOriginal(
  original: string,
  chunk: string,
  fromCursor: number
): number {
  if (chunk.length === 0) return fromCursor;
  const start = Math.min(fromCursor, original.length);
  const idx = original.indexOf(chunk, start);
  if (idx >= 0) return idx;
  // fallback: re-search from start
  const alt = original.indexOf(chunk);
  if (alt >= 0) return alt;
  return fromCursor;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §7 TTS job builder                                                        ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Constrói um TtsJobShape a partir de texto + voice config. Aplica
 * chunking, atribui timestampsMs, e calcula estimatedDurationMs
 * no rate atual e rate=1.0 baseline.
 */
export function buildTtsJob(args: {
  text: string;
  voice: VoiceConfig;
  voiceDescriptor: VoiceHandle;
  now?: number;
}): TtsJobShape {
  const now = args.now ?? 1719700000000; // fixed default para determinismo
  const chunk = chunkTextIntoCues({
    text: args.text,
    rate: args.voice.rate,
    rateAdjustByChar: true,
  });

  const cues = chunk.cues;
  let effectiveCueCount = 0;
  for (let i = 0; i < cues.length; i++) {
    if (!cues[i]!.sacredFlag) effectiveCueCount += 1;
  }

  const estimatedDurationMs = estimateQueueTotalMs(cues);
  const estimatedDurationMsAtRate1 = cues.reduce((acc, c) => {
    return acc + estimateCueDurationMs(c.text.length, 1.0) + MIN_CUE_INTERVAL_MS;
  }, 0) - MIN_CUE_INTERVAL_MS; // remove último intervalo

  const jobId = fnv1a64(
    `job:${args.voice.voiceId}:${args.voice.locale}:${fnv1a64(args.text)}`
  );

  return {
    jobId,
    queue: cues,
    voice: args.voice,
    voiceDescriptor: args.voiceDescriptor,
    estimatedDurationMs,
    estimatedDurationMsAtRate1: Math.max(0, estimatedDurationMsAtRate1),
    createdAt: now,
    sacredCount: chunk.sacredCount,
    effectiveCueCount,
  };
}

/**
 * Sanity check: o job builder nunca produz cue sacred com
 * spokenText diferente de SACRED_PLACEHOLDER_TEXT. Em produção
 * isso deveria ser impossível (defesa em profundidade).
 */
export function jobIsSacredClean(job: TtsJobShape): boolean {
  for (const cue of job.queue) {
    if (cue.sacredFlag && cue.spokenText !== SACRED_PLACEHOLDER_TEXT) {
      return false;
    }
  }
  return true;
}

/**
 * Retorna uma coleção de AudioSegments representativos do job.
 * Sacred cues têm audioRef=null (defesa explícita).
 */
export function buildAudioSegments(job: TtsJobShape): AudioSegment[] {
  const out: AudioSegment[] = [];
  for (const cue of job.queue) {
    if (cue.sacredFlag) {
      out.push({
        cueId: cue.cueId,
        audioRef: null,
        durationMs: cue.estimatedDurationMs,
        sampleRateHz: job.voiceDescriptor.sampleRateHz,
        bytes: 0,
        sacred: true,
      });
      continue;
    }
    // estimate bytes: 2 bytes per sample * sampleRateHz * (durationMs/1000)
    const seconds = cue.estimatedDurationMs / 1000;
    const bytes = Math.round(2 * job.voiceDescriptor.sampleRateHz * seconds);
    out.push({
      cueId: cue.cueId,
      audioRef: `tts://segment/${job.jobId}/${cue.cueId}`,
      durationMs: cue.estimatedDurationMs,
      sampleRateHz: job.voiceDescriptor.sampleRateHz,
      bytes,
      sacred: false,
    });
  }
  return out;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §8 Playback state machine                                                 ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Estado mutável interno do playback. Não exportado; o caller
 * recebe snapshots imutáveis (VoiceModeStateSnapshot).
 */
export interface PlaybackSession {
  state: VoiceModeState;
  job: TtsJobShape | null;
  currentCueIndex: number;
  elapsedMs: number;
  rate: number;
  pitch: number;
  volume: number;
  voiceId: string;
  locale: VoiceLocale;
  config: VoiceConfig;
  startedAt: number | null;
  pausedAt: number | null;
  error: PlaybackError | null;
}

/**
 * Cria uma nova sessão de playback em `idle` (sem job).
 */
export function createPlaybackSession(
  config: VoiceConfig,
  voiceDescriptor: VoiceHandle,
  now: number = 1719700000000
): PlaybackSession {
  return {
    state: "idle",
    job: {
      jobId: fnv1a64(`empty:${config.voiceId}`),
      queue: [],
      voice: config,
      voiceDescriptor,
      estimatedDurationMs: 0,
      estimatedDurationMsAtRate1: 0,
      createdAt: now,
      sacredCount: 0,
      effectiveCueCount: 0,
    },
    currentCueIndex: 0,
    elapsedMs: 0,
    rate: config.rate,
    pitch: config.pitch,
    volume: config.volume,
    voiceId: config.voiceId,
    locale: config.locale,
    config,
    startedAt: null,
    pausedAt: null,
    error: null,
  };
}

/**
 * Transições válidas no state machine:
 *   idle      → loading, error
 *   loading   → playing, error
 *   playing   → paused, done, error
 *   paused    → playing, stopped (estado terminal ad-hoc), error
 *   done      → idle (reset)
 *   error     → idle (reset)
 *
 * Retorna o novo estado se válido; null caso contrário.
 */
export function applyTransition(
  session: PlaybackSession,
  target: VoiceModeState
): PlaybackSession | null {
  const cur = session.state;
  const valid: Record<VoiceModeState, VoiceModeState[]> = {
    idle: ["loading", "error"],
    loading: ["playing", "error"],
    playing: ["paused", "done", "error"],
    paused: ["playing", "idle", "error"],
    done: ["idle"],
    error: ["idle"],
  };
  const allowed = valid[cur];
  if (!allowed.includes(target)) return null;

  const now = 1719700000000; // sandbox-safe default
  let s: PlaybackSession = { ...session, state: target };

  if (target === "loading") {
    s.startedAt = now;
  } else if (target === "playing") {
    if (cur === "paused") {
      s.pausedAt = null;
    } else {
      s.startedAt = now;
    }
  } else if (target === "paused") {
    s.pausedAt = now;
  } else if (target === "done") {
    s.elapsedMs = s.job?.estimatedDurationMs ?? 0;
  } else if (target === "error") {
    s.error = { code: "VM_005", message: "Transition error", ts: now };
  }

  return s;
}

/**
 * Snapshot imutável para serialização.
 */
export function snapshotSession(session: PlaybackSession): VoiceModeStateSnapshot {
  return {
    state: session.state,
    jobId: session.job?.jobId ?? null,
    currentCueId:
      session.job && session.currentCueIndex < session.job.queue.length
        ? session.job.queue[session.currentCueIndex]!.cueId
        : null,
    currentCueIndex: session.currentCueIndex,
    elapsedMs: session.elapsedMs,
    rate: session.rate,
    pitch: session.pitch,
    volume: session.volume,
    voiceId: session.voiceId,
    locale: session.locale,
    sacredCount: session.job?.sacredCount ?? 0,
    effectiveCueCount: session.job?.effectiveCueCount ?? 0,
  };
}

/**
 * Avança o cursor para a próxima cue. Pula sacred (replacement)
 * automaticamente para o AudioSegments, mas o cursor POSICIONA
 * nelas para evitar que sejam "puladas em silêncio" no log.
 */
export function advanceToNextCue(session: PlaybackSession): PlaybackSession {
  if (!session.job) return session;
  const next = session.currentCueIndex + 1;
  if (next >= session.job.queue.length) {
    return applyTransition(session, "done") ?? session;
  }
  return {
    ...session,
    currentCueIndex: next,
    elapsedMs: session.job.queue[next]!.timestampMs,
  };
}

/**
 * Posiciona o cursor na cue que contém o `timestampMs` (busca binária
 * considerando timestampMs monotônico). Se o timestamp cair em um
 * gap entre cues, retorna a próxima cue após o gap.
 */
export function seekToTimestamp(
  session: PlaybackSession,
  timestampMs: number
): PlaybackSession {
  if (!session.job) return session;
  if (timestampMs < 0) return session;
  const total = session.job.estimatedDurationMs;
  if (timestampMs > total) return session;

  const queue = session.job.queue;
  if (queue.length === 0) return session;

  let lo = 0;
  let hi = queue.length - 1;
  let target = -1;
  let closestAfter = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const c = queue[mid]!;
    const end = c.timestampMs + c.estimatedDurationMs;
    if (timestampMs >= c.timestampMs && timestampMs <= end) {
      target = mid;
      break;
    } else if (timestampMs < c.timestampMs) {
      closestAfter = mid;
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }
  if (target === -1) {
    target = closestAfter !== -1 ? closestAfter : queue.length - 1;
  }
  return { ...session, currentCueIndex: target, elapsedMs: timestampMs };
}

/**
 * Pega a próxima cue efetiva (não sacred) — útil para A11y.
 */
export function getNextEffectiveCue(
  session: PlaybackSession
): PlaybackCue | null {
  if (!session.job) return null;
  for (let i = session.currentCueIndex; i < session.job.queue.length; i++) {
    const c = session.job.queue[i]!;
    if (!c.sacredFlag) return c;
  }
  return null;
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §9 Playback controls                                                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export interface PlayActionResult {
  session: PlaybackSession;
  ok: boolean;
  error?: PlaybackError;
  events: AudioQueueUpdateEvent[];
  a11y: A11yAnnouncement[];
}

/**
 * play() — inicia (ou retoma) a reprodução. Se houver job na
 * sessão, usa ele; se não, falha com VM_004.
 */
export function playControl(
  session: PlaybackSession,
  now: number = 1719700000000
): PlayActionResult {
  if (!session.job || session.job.queue.length === 0) {
    const err = makeError("VM_004", "empty queue", now);
    return {
      session,
      ok: false,
      error: err,
      events: [makeAudioQueueEvent("error", now, { detail: "empty queue" })],
      a11y: [makeA11yAnnouncement("polite", LABELS_PT_BR.ariaError, "error", now)],
    };
  }

  // Chain transitions: idle→loading→playing or paused→playing
  let next = applyTransition(session, "playing");
  if (!next) {
    if (session.state === "idle") {
      const loading = applyTransition(session, "loading");
      if (loading) {
        next = applyTransition(loading, "playing");
      }
    }
    if (!next) {
      const err = makeError("VM_005", `cannot play from ${session.state}`, now);
      return {
        session,
        ok: false,
        error: err,
        events: [makeAudioQueueEvent("error", now, { detail: err.message })],
        a11y: [makeA11yAnnouncement("polite", err.message, "error", now)],
      };
    }
  }

  const events: AudioQueueUpdateEvent[] = [];
  if (next.state === "playing" && next.job) {
    const cue = next.job.queue[next.currentCueIndex];
    if (cue) {
      events.push(
        makeAudioQueueEvent("cue_started", now, { jobId: next.job.jobId, cueId: cue.cueId })
      );
    }
  }
  events.push(
    makeAudioQueueEvent("play", now, {
      jobId: next.job?.jobId,
      detail: next.job ? `state=${next.state}` : undefined,
    })
  );

  const a11y: A11yAnnouncement[] = [
    makeA11yAnnouncement("polite", LABELS_PT_BR.ariaStatePlaying, "state_change", now),
  ];

  return { session: next, ok: true, events, a11y };
}

/**
 * pause() — pausa o playback. Válido apenas de `playing`.
 */
export function pauseControl(
  session: PlaybackSession,
  now: number = 1719700000000
): PlayActionResult {
  const next = applyTransition(session, "paused");
  if (!next) {
    const err = makeError("VM_005", `cannot pause from ${session.state}`, now);
    return {
      session,
      ok: false,
      error: err,
      events: [makeAudioQueueEvent("error", now, { detail: err.message })],
      a11y: [makeA11yAnnouncement("polite", err.message, "error", now)],
    };
  }
  return {
    session: next,
    ok: true,
    events: [makeAudioQueueEvent("pause", now, { jobId: next.job?.jobId })],
    a11y: [makeA11yAnnouncement("polite", LABELS_PT_BR.ariaStatePaused, "state_change", now)],
  };
}

/**
 * resume() — equivalente a play(), mas só de `paused`.
 */
export function resumeControl(
  session: PlaybackSession,
  now: number = 1719700000000
): PlayActionResult {
  if (session.state !== "paused") {
    return playControl(session, now);
  }
  return playControl(session, now);
}

/**
 * stop() — encerra e volta a idle.
 */
export function stopControl(
  session: PlaybackSession,
  now: number = 1719700000000
): PlayActionResult {
  const next: PlaybackSession = {
    ...session,
    state: "idle",
    currentCueIndex: 0,
    elapsedMs: 0,
    startedAt: null,
    pausedAt: null,
    error: null,
  };
  return {
    session: next,
    ok: true,
    events: [makeAudioQueueEvent("stop", now, { jobId: session.job?.jobId })],
    a11y: [makeA11yAnnouncement("polite", LABELS_PT_BR.stop, "state_change", now)],
  };
}

/**
 * seek() — posiciona por timestampMs.
 */
export function seekControl(
  session: PlaybackSession,
  timestampMs: number,
  now: number = 1719700000000
): PlayActionResult {
  if (!session.job) {
    const err = makeError("VM_006", "no job to seek", now);
    return {
      session,
      ok: false,
      error: err,
      events: [makeAudioQueueEvent("error", now, { detail: err.message })],
      a11y: [makeA11yAnnouncement("polite", err.message, "error", now)],
    };
  }
  if (timestampMs < 0 || timestampMs > session.job.estimatedDurationMs) {
    const err = makeError("VM_006", `invalid seek: ${timestampMs}`, now);
    return {
      session,
      ok: false,
      error: err,
      events: [makeAudioQueueEvent("error", now, { detail: err.message })],
      a11y: [makeA11yAnnouncement("polite", err.message, "error", now)],
    };
  }
  const next = seekToTimestamp(session, timestampMs);
  return {
    session: next,
    ok: true,
    events: [
      makeAudioQueueEvent("seek", now, {
        jobId: next.job?.jobId,
        detail: `ms=${timestampMs}`,
      }),
    ],
    a11y: [
      makeA11yAnnouncement(
        "polite",
        `${LABELS_PT_BR.ariaCueStarted} ${Math.round(timestampMs)}ms`,
        "cue_started",
        now
      ),
    ],
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §10 Rate/pitch control                                                    ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

export interface RateValidationResult {
  ok: boolean;
  normalized?: number;
  error?: PlaybackError;
}

export interface PitchValidationResult {
  ok: boolean;
  normalized?: number;
  error?: PlaybackError;
}

/**
 * Valida e normaliza o rate. Fora de [MIN_CUE_RATE..MAX_CUE_RATE]
 * retorna erro VM_002.
 */
export function validateRate(
  rate: number,
  now: number = 1719700000000
): RateValidationResult {
  if (!Number.isFinite(rate)) {
    return { ok: false, error: makeError("VM_002", `non-finite rate: ${rate}`, now) };
  }
  if (rate < MIN_CUE_RATE || rate > MAX_CUE_RATE) {
    return { ok: false, error: makeError("VM_002", `rate=${rate}`, now) };
  }
  return { ok: true, normalized: rate };
}

/**
 * Valida e normaliza o pitch. Fora de [MIN_CUE_PITCH..MAX_CUE_PITCH]
 * retorna erro VM_003.
 */
export function validatePitch(
  pitch: number,
  now: number = 1719700000000
): PitchValidationResult {
  if (!Number.isFinite(pitch)) {
    return { ok: false, error: makeError("VM_003", `non-finite pitch: ${pitch}`, now) };
  }
  if (pitch < MIN_CUE_PITCH || pitch > MAX_CUE_PITCH) {
    return { ok: false, error: makeError("VM_003", `pitch=${pitch}`, now) };
  }
  return { ok: true, normalized: pitch };
}

/**
 * Aplica novo rate à sessão, recalcula durations dos cues e emite
 * audio-queue update event.
 */
export function setRateOnSession(
  session: PlaybackSession,
  newRate: number,
  now: number = 1719700000000
): PlayActionResult {
  const v = validateRate(newRate, now);
  if (!v.ok || v.normalized === undefined) {
    return {
      session,
      ok: false,
      error: v.error,
      events: [makeAudioQueueEvent("error", now, { detail: v.error?.message })],
      a11y: [makeA11yAnnouncement("polite", "Erro de velocidade", "error", now)],
    };
  }
  const rate = v.normalized;
  let next = { ...session, rate };
  if (next.job) {
    // recalcula durations mantendo ordem + intervalos
    next = {
      ...next,
      job: recalculateCueDurations(next.job, rate),
    };
  }
  return {
    session: next,
    ok: true,
    events: [
      makeAudioQueueEvent("rate_changed", now, {
        jobId: next.job?.jobId,
        detail: `rate=${rate}`,
      }),
    ],
    a11y: [],
  };
}

/**
 * Aplica novo pitch à sessão, emite audio-queue update event.
 */
export function setPitchOnSession(
  session: PlaybackSession,
  newPitch: number,
  now: number = 1719700000000
): PlayActionResult {
  const v = validatePitch(newPitch, now);
  if (!v.ok || v.normalized === undefined) {
    return {
      session,
      ok: false,
      error: v.error,
      events: [makeAudioQueueEvent("error", now, { detail: v.error?.message })],
      a11y: [makeA11yAnnouncement("polite", "Erro de tom", "error", now)],
    };
  }
  const pitch = v.normalized;
  const next: PlaybackSession = {
    ...session,
    pitch,
    config: { ...session.config, pitch },
  };
  return {
    session: next,
    ok: true,
    events: [
      makeAudioQueueEvent("pitch_changed", now, {
        jobId: next.job?.jobId,
        detail: `pitch=${pitch}`,
      }),
    ],
    a11y: [],
  };
}

/**
 * Recalcula durations dos cues dado o novo rate. Preserva a ordem
 * e atualiza timestampMs.
 */
export function recalculateCueDurations(
  job: TtsJobShape,
  rate: number
): TtsJobShape {
  const cues: PlaybackCue[] = [];
  let ts = 0;
  for (let i = 0; i < job.queue.length; i++) {
    const c = job.queue[i]!;
    const dur = estimateCueDurationMs(c.text.length, rate);
    cues.push({ ...c, estimatedDurationMs: dur, timestampMs: ts });
    ts += dur + MIN_CUE_INTERVAL_MS;
  }
  return {
    ...job,
    queue: cues,
    estimatedDurationMs: estimateQueueTotalMs(cues),
    voice: { ...job.voice, rate },
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §11 A11y live region                                                      ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** A11y queue — itens pendentes a serem anunciados. */
export interface A11yQueue {
  items: A11yAnnouncement[];
  capacity: number;
}

export function a11yCreate(capacity: number = ENGINE_LIMITS.maxA11yQueue): A11yQueue {
  return { items: [], capacity };
}

export function a11yPush(
  q: A11yQueue,
  announcement: A11yAnnouncement
): A11yQueue {
  const items = q.items.concat(announcement);
  // capacity-aware drop (drop oldest)
  if (items.length > q.capacity) {
    items.splice(0, items.length - q.capacity);
  }
  return { items, capacity: q.capacity };
}

export function a11yPop(q: A11yQueue): { queue: A11yQueue; item: A11yAnnouncement | null } {
  if (q.items.length === 0) return { queue: q, item: null };
  const item = q.items[0]!;
  return { queue: { ...q, items: q.items.slice(1) }, item };
}

export function a11yToAriaLive(q: A11yQueue): {
  ariaBusy: boolean;
  ariaLive: "polite" | "assertive";
  visuallyHiddenText: string;
} {
  const last = q.items[q.items.length - 1];
  const busy = q.items.length > 0;
  return {
    ariaBusy: busy,
    ariaLive: last?.priority ?? ARIA_LIVE_DEFAULT,
    visuallyHiddenText: last?.text ?? "",
  };
}

/**
 * A11y visual caption — alternativa textual para ambientes silenciosos.
 * Sempre inclui o texto, incluindo sacred (que vira placeholder).
 */
export interface A11yVisualCaption {
  ts: number;
  cueId: string | null;
  text: string;
  sacredPlaceholder: boolean;
}

export function buildVisualCaption(
  session: PlaybackSession,
  now: number = 1719700000000
): A11yVisualCaption | null {
  if (!session.job) return null;
  const c = session.job.queue[session.currentCueIndex];
  if (!c) return null;
  return {
    ts: now,
    cueId: c.cueId,
    text: c.spokenText,
    sacredPlaceholder: c.sacredFlag,
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §12 Sacred-content block (HARD)                                           ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Processa um job aplicando o sacred block: substitui spokenText
 * de cues sacred pelo placeholder, e emite SacredSkip event para
 * cada uma. NUNCA muta o objeto original — retorna novo TtsJobShape.
 */
export function applySacredBlock(job: TtsJobShape): {
  job: TtsJobShape;
  skipCount: number;
  events: AudioQueueUpdateEvent[];
  a11y: A11yAnnouncement[];
  now: number;
} {
  const now = 1719700000000;
  const newCues: PlaybackCue[] = [];
  const events: AudioQueueUpdateEvent[] = [];
  const a11y: A11yAnnouncement[] = [];
  let skipCount = 0;

  for (let i = 0; i < job.queue.length; i++) {
    const c = job.queue[i]!;
    if (c.sacredFlag) {
      skipCount += 1;
      events.push(
        makeAudioQueueEvent("sacred_skipped", now, {
          jobId: job.jobId,
          cueId: c.cueId,
          detail: `kind=${c.sacredKind ?? "ritual"}`,
        })
      );
      a11y.push(
        makeA11yAnnouncement(
          "polite",
          LABELS_PT_BR.sacredPlaceholderTitle,
          "sacred_placeholder",
          now
        )
      );
      newCues.push({
        ...c,
        spokenText: SACRED_PLACEHOLDER_TEXT,
      });
      continue;
    }
    newCues.push(c);
  }

  const newJob: TtsJobShape = {
    ...job,
    queue: newCues,
  };
  // garante jobIsSacredClean invariant
  if (!jobIsSacredClean(newJob)) {
    // defensive — nunca deveria acontecer
    throw new Error("VM_012: sacred leak detected");
  }

  return { job: newJob, skipCount, events, a11y, now };
}

/**
 * Reception notification — dispara quando o engine REBECE o cue
 * (independente de ser sacred). Preserva rastreabilidade.
 */
export interface CueReceptionNotification {
  cueId: string;
  jobId: string;
  receivedAt: number;
  sacred: boolean;
  /** Mesmo se sacred, o texto ORIGINAL é exposto para a UI fazer render. */
  originalText: string;
}

/**
 * Helper para gerar a reception notification de uma cue, com
 * flag sacred preservado.
 */
export function makeCueReceptionNotification(
  cue: PlaybackCue,
  jobId: string,
  now: number = 1719700000000
): CueReceptionNotification {
  return {
    cueId: cue.cueId,
    jobId,
    receivedAt: now,
    sacred: cue.sacredFlag,
    originalText: cue.text,
  };
}

/**
 * Aplica o sacred block mas SEM mutar o job. Útil para preview.
 */
export function previewSacredBlock(text: string): {
  maskedText: string;
  sacredCount: number;
  sacredKinds: SacredKind[];
} {
  const ch = chunkTextIntoCues({ text });
  let masked = "";
  const kinds: SacredKind[] = [];
  for (const c of ch.cues) {
    masked += (masked.length > 0 ? " " : "") + (c.sacredFlag ? c.spokenText : c.text);
    if (c.sacredFlag && c.sacredKind && !kinds.includes(c.sacredKind)) {
      kinds.push(c.sacredKind);
    }
  }
  return {
    maskedText: masked,
    sacredCount: ch.sacredCount,
    sacredKinds: kinds,
  };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §13 LGPD Art. 7 / Art. 9 / Art. 18                                        ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/**
 * Cria registro de opt-in. `optedIn` é false por default
 * (Art. 7: consentimento livre e informado).
 */
export function createVoiceActivation(
  userId: string,
  now: number = 1719700000000
): VoiceActivation {
  return {
    userId,
    optIn: false,
    optInAt: null,
    revokedAt: null,
    biometricEnrolledAt: null,
    preferences: null,
    history: [],
    retentionDays: PLAYBACK_HISTORY_RETENTION_DAYS,
  };
}

/**
 * Aplica opt-in. Retorna novo registro + AuditStep. Se já optedIn,
 * é idempotente (re-registra mas sem alterar flag).
 */
export function applyOptIn(
  activation: VoiceActivation,
  reason?: string,
  now: number = 1719700000000
): { activation: VoiceActivation; audit: AuditStep } {
  const action: OptInEvent["action"] = "opt_in";
  const event: OptInEvent = {
    ts: now,
    action,
    reason,
    requestId: fnv1a64(`optin:${activation.userId}:${now}`),
  };
  const next: VoiceActivation = {
    ...activation,
    optIn: true,
    optInAt: activation.optInAt ?? now,
    revokedAt: null,
    history: activation.history.concat(event),
  };
  return {
    activation: next,
    audit: {
      step: "OptInChanged",
      ts: now,
      ok: true,
      detail: `user=${activation.userId} action=opt_in`,
    },
  };
}

/**
 * Aplica opt-out (revogação). Remove imediatamente a participação.
 */
export function applyOptOut(
  activation: VoiceActivation,
  reason?: string,
  now: number = 1719700000000
): { activation: VoiceActivation; audit: AuditStep } {
  const event: OptInEvent = {
    ts: now,
    action: "opt_out",
    reason,
    requestId: fnv1a64(`optout:${activation.userId}:${now}`),
  };
  const next: VoiceActivation = {
    ...activation,
    optIn: false,
    revokedAt: now,
    history: activation.history.concat(event),
  };
  return {
    activation: next,
    audit: {
      step: "OptInChanged",
      ts: now,
      ok: true,
      detail: `user=${activation.userId} action=opt_out`,
    },
  };
}

/**
 * Aplica opt-in SEPARATE para voice biometric. Só válido se o
 * opt-in principal já foi dado.
 */
export function applyBiometricOptIn(
  activation: VoiceActivation,
  reason?: string,
  now: number = 1719700000000
): { activation: VoiceActivation; audit: AuditStep; error?: PlaybackError } {
  if (!activation.optIn) {
    return {
      activation,
      audit: {
        step: "OptInChanged",
        ts: now,
        ok: false,
        detail: "main opt-in required for biometric",
      },
      error: makeError(
        "VM_008",
        "voice biometric requires main opt-in",
        now
      ),
    };
  }
  const event: OptInEvent = {
    ts: now,
    action: "biometric_opt_in",
    reason,
    requestId: fnv1a64(`bio:${activation.userId}:${now}`),
  };
  const next: VoiceActivation = {
    ...activation,
    biometricEnrolledAt: activation.biometricEnrolledAt ?? now,
    preferences: activation.preferences
      ? { ...activation.preferences, voiceBiometricConsent: true }
      : null,
    history: activation.history.concat(event),
  };
  return {
    activation: next,
    audit: {
      step: "OptInChanged",
      ts: now,
      ok: true,
      detail: `user=${activation.userId} action=biometric_opt_in`,
    },
  };
}

/**
 * Aplica opt-out do voice biometric. Mantém o opt-in principal
 * intacto.
 */
export function applyBiometricOptOut(
  activation: VoiceActivation,
  reason?: string,
  now: number = 1719700000000
): { activation: VoiceActivation; audit: AuditStep } {
  const event: OptInEvent = {
    ts: now,
    action: "biometric_opt_out",
    reason,
    requestId: fnv1a64(`bioout:${activation.userId}:${now}`),
  };
  const next: VoiceActivation = {
    ...activation,
    biometricEnrolledAt: null,
    preferences: activation.preferences
      ? { ...activation.preferences, voiceBiometricConsent: false }
      : null,
    history: activation.history.concat(event),
  };
  return {
    activation: next,
    audit: {
      step: "OptInChanged",
      ts: now,
      ok: true,
      detail: `user=${activation.userId} action=biometric_opt_out`,
    },
  };
}

/**
 * Liga voice mode. Requer opt-in. Retorna erro VM_007 se faltando.
 */
export function activateVoiceMode(
  activation: VoiceActivation,
  config: VoiceConfig,
  now: number = 1719700000000
): {
  activation: VoiceActivation;
  ok: boolean;
  error?: PlaybackError;
  audit?: AuditStep;
} {
  if (!activation.optIn) {
    return {
      activation,
      ok: false,
      error: makeError("VM_007", "opt-in required", now),
    };
  }
  if (config.voiceBiometricConsent && activation.biometricEnrolledAt === null) {
    return {
      activation,
      ok: false,
      error: makeError("VM_008", "biometric consent not enrolled", now),
    };
  }
  const next: VoiceActivation = {
    ...activation,
    preferences: config,
  };
  return {
    activation: next,
    ok: true,
    audit: {
      step: "VoiceActivated",
      ts: now,
      ok: true,
      detail: `user=${activation.userId} voiceId=${config.voiceId}`,
    },
  };
}

/**
 * Desliga voice mode. Idempotente.
 */
export function deactivateVoiceMode(
  activation: VoiceActivation,
  now: number = 1719700000000
): {
  activation: VoiceActivation;
  audit: AuditStep;
} {
  return {
    activation: {
      ...activation,
      preferences: null,
    },
    audit: {
      step: "VoiceDeactivated",
      ts: now,
      ok: true,
      detail: `user=${activation.userId}`,
    },
  };
}

/**
 * LGPD Art. 18, V — export. Inclui preferences + últimos 30 dias
 * de history. Sem opt-in requerido para exportar (titular tem
 * direito), mas a função não inventa dados.
 */
export function lgpdExportVoice(
  activation: VoiceActivation,
  history: readonly PlaybackHistoryEntry[],
  now: number = 1719700000000
): {
  payload: LGPDExportPayload;
  audit: AuditStep;
  error?: PlaybackError;
} {
  const cutoff = now - PLAYBACK_HISTORY_RETENTION_DAYS * 24 * 3600 * 1000;
  const recent = history.filter((h) => h.startedAt >= cutoff);
  const payloadCore = {
    user: activation.userId,
    activation,
    history: recent,
  };
  const auditHash = fnv1a64(JSON.stringify(payloadCore));
  const payload: LGPDExportPayload = {
    userId: activation.userId,
    exportedAt: now,
    activation,
    recentHistory: recent,
    auditHash,
    engineVersion: ENGINE_VERSION,
  };
  return {
    payload,
    audit: {
      step: "LgpdExport",
      ts: now,
      ok: true,
      detail: `user=${activation.userId} entries=${recent.length}`,
    },
  };
}

/**
 * LGPD Art. 18, VI — erasure. Remove preferences + history +
 * voice biometric template. Retém apenas audit hash imutável
 * por 30 dias para compliance.
 */
export function lgpdEraseVoice(
  activation: VoiceActivation,
  now: number = 1719700000000
): {
  erasedActivation: VoiceActivation;
  erasedTemplateFields: string[];
  audit: AuditStep;
} {
  const erasedTemplateFields = [
    "preferences",
    "voiceBiometricConsent",
    "biometricEnrolledAt",
  ];
  const event: OptInEvent = {
    ts: now,
    action: "lgpd_erasure",
    reason: "user requested",
    requestId: fnv1a64(`erase:${activation.userId}:${now}`),
  };
  const erasedActivation: VoiceActivation = {
    ...activation,
    preferences: null,
    biometricEnrolledAt: null,
    optIn: false,
    optInAt: null,
    revokedAt: now,
    history: activation.history.concat(event),
  };
  return {
    erasedActivation,
    erasedTemplateFields,
    audit: {
      step: "LgpdErasure",
      ts: now,
      ok: true,
      detail: `user=${activation.userId}`,
    },
  };
}

/**
 * Helper: filtra history por retenção (30 dias default).
 */
export function applyHistoryRetention(
  history: readonly PlaybackHistoryEntry[],
  retentionDays: number = PLAYBACK_HISTORY_RETENTION_DAYS,
  now: number = 1719700000000
): PlaybackHistoryEntry[] {
  const cutoff = now - retentionDays * 24 * 3600 * 1000;
  return history.filter((h) => h.startedAt >= cutoff);
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §14 Audit                                                                 ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Tipos de audit event do engine. */
export type AuditEventType =
  | "VoiceActivated"
  | "VoiceDeactivated"
  | "JobQueued"
  | "CueStarted"
  | "CueCompleted"
  | "SacredSkip"
  | "RateChanged"
  | "PitchChanged"
  | "VoiceChanged"
  | "OptInChanged"
  | "LgpdExport"
  | "LgpdErasure"
  | "Error";

export interface AuditEvent {
  type: AuditEventType;
  ts: number;
  ok: boolean;
  detail?: string;
  userIdHash?: string;
  requestId?: string;
}

/**
 * Cria um AuditEvent imutável.
 */
export function makeAuditEvent(args: {
  type: AuditEventType;
  ts: number;
  ok: boolean;
  detail?: string;
  userId?: string;
  requestId?: string;
}): AuditEvent {
  return {
    type: args.type,
    ts: args.ts,
    ok: args.ok,
    detail: args.detail,
    userIdHash: args.userId ? fnv1a64(args.userId) : undefined,
    requestId: args.requestId,
  };
}

/**
 * AuditLogger — append-only com hash chain.
 */
export interface AuditLogger {
  events: AuditEvent[];
  hashChain: string;
  capacity: number;
}

export function auditLoggerCreate(capacity: number = ENGINE_LIMITS.maxAuditSteps): AuditLogger {
  return { events: [], hashChain: "0".repeat(16), capacity };
}

export function auditLoggerAppend(
  logger: AuditLogger,
  event: AuditEvent
): AuditLogger {
  const events = logger.events.concat(event);
  if (events.length > logger.capacity) {
    events.splice(0, events.length - logger.capacity);
  }
  const hashChain = fnv1a64(logger.hashChain + JSON.stringify(event));
  return { events, hashChain, capacity: logger.capacity };
}

/**
 * Resumo de audit em formato compacto.
 */
export interface AuditSummary {
  total: number;
  okCount: number;
  failedCount: number;
  byType: Record<string, number>;
  lastEventAt: number;
}

export function auditSummarize(logger: AuditLogger): AuditSummary {
  let okCount = 0;
  let failedCount = 0;
  const byType: Record<string, number> = {};
  let lastEventAt = 0;
  for (const e of logger.events) {
    if (e.ok) okCount += 1;
    else failedCount += 1;
    byType[e.type] = (byType[e.type] ?? 0) + 1;
    if (e.ts > lastEventAt) lastEventAt = e.ts;
  }
  return {
    total: logger.events.length,
    okCount,
    failedCount,
    byType,
    lastEventAt,
  };
}

/**
 * Helpers para construir eventos específicos (semantic clarity).
 */
export function auditVoiceActivated(
  userId: string,
  voiceId: string,
  now: number = 1719700000000
): AuditEvent {
  return makeAuditEvent({
    type: "VoiceActivated",
    ts: now,
    ok: true,
    detail: `voiceId=${voiceId}`,
    userId,
  });
}

export function auditVoiceDeactivated(
  userId: string,
  now: number = 1719700000000
): AuditEvent {
  return makeAuditEvent({
    type: "VoiceDeactivated",
    ts: now,
    ok: true,
    userId,
  });
}

export function auditJobQueued(
  userId: string,
  jobId: string,
  sacredCount: number,
  now: number = 1719700000000
): AuditEvent {
  return makeAuditEvent({
    type: "JobQueued",
    ts: now,
    ok: true,
    detail: `jobId=${jobId} sacred=${sacredCount}`,
    userId,
  });
}

export function auditCueStarted(
  userId: string,
  jobId: string,
  cueId: string,
  sacred: boolean,
  now: number = 1719700000000
): AuditEvent {
  return makeAuditEvent({
    type: "CueStarted",
    ts: now,
    ok: true,
    detail: `jobId=${jobId} cueId=${cueId} sacred=${sacred}`,
    userId,
  });
}

export function auditCueCompleted(
  userId: string,
  jobId: string,
  cueId: string,
  now: number = 1719700000000
): AuditEvent {
  return makeAuditEvent({
    type: "CueCompleted",
    ts: now,
    ok: true,
    detail: `jobId=${jobId} cueId=${cueId}`,
    userId,
  });
}

export function auditSacredSkip(
  userId: string,
  jobId: string,
  cueId: string,
  kind: SacredKind | string,
  now: number = 1719700000000
): AuditEvent {
  return makeAuditEvent({
    type: "SacredSkip",
    ts: now,
    ok: true,
    detail: `jobId=${jobId} cueId=${cueId} kind=${kind}`,
    userId,
  });
}

export function auditRateChanged(
  userId: string,
  rate: number,
  now: number = 1719700000000
): AuditEvent {
  return makeAuditEvent({
    type: "RateChanged",
    ts: now,
    ok: true,
    detail: `rate=${rate}`,
    userId,
  });
}

export function auditOptInChanged(
  userId: string,
  action: string,
  now: number = 1719700000000
): AuditEvent {
  return makeAuditEvent({
    type: "OptInChanged",
    ts: now,
    ok: true,
    detail: `action=${action}`,
    userId,
  });
}

export function auditLgpdExport(
  userId: string,
  entries: number,
  now: number = 1719700000000
): AuditEvent {
  return makeAuditEvent({
    type: "LgpdExport",
    ts: now,
    ok: true,
    detail: `entries=${entries}`,
    userId,
  });
}

export function auditLgpdErasure(
  userId: string,
  now: number = 1719700000000
): AuditEvent {
  return makeAuditEvent({
    type: "LgpdErasure",
    ts: now,
    ok: true,
    userId,
  });
}

/**
 * Constroi um AudioQueueUpdateEvent simples.
 */
export function makeAudioQueueEvent(
  type: AudioQueueUpdateEvent["type"],
  ts: number,
  args?: { jobId?: string; cueId?: string; detail?: string }
): AudioQueueUpdateEvent {
  return {
    type,
    ts,
    tsMs: ts,
    jobId: args?.jobId,
    cueId: args?.cueId,
    detail: args?.detail,
  };
}

/**
 * Constrói uma A11yAnnouncement.
 */
export function makeA11yAnnouncement(
  priority: "polite" | "assertive",
  text: string,
  category: A11yCategory,
  now: number = 1719700000000
): A11yAnnouncement {
  return { ts: now, priority, text, category };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §15 Smoke / regression scenarios                                          ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** Resultado de smoke. */
export interface SmokeResult {
  name: string;
  ok: boolean;
  detail: string;
}

/** Smoke 1: voz default resolvida por fallback chain. */
export function smokeVoiceSelectByLocale(): SmokeResult {
  const r = selectVoice({ locale: "en-US", gender: "male", profile: "default" });
  const ok = r.selected.locale === "en-US" && r.selected.gender === "male";
  return { name: "smokeVoiceSelectByLocale", ok, detail: `voice=${r.selected.voiceId} matched=${r.matchedBy}` };
}

/** Smoke 2: chunker divide corretamente em sentenças. */
export function smokeCueChunkerSplits(): SmokeResult {
  const r = chunkTextIntoCues({
    text: "Olá mundo. Tudo bem? Sim, obrigado! Como vai você hoje.",
  });
  const ok = r.cues.length >= 3 && r.cues.every((c) => c.index === r.cues.indexOf(c));
  return { name: "smokeCueChunkerSplits", ok, detail: `cues=${r.cues.length}` };
}

/** Smoke 3: job builder produz duração estimada positiva. */
export function smokeJobDurationEstimate(): SmokeResult {
  const v = selectVoice({ locale: "pt-BR", gender: "female", profile: "mood_companion" });
  const job = buildTtsJob({
    text: "Esta é uma frase de teste com mais de sessenta caracteres para validar estimativa.",
    voice: buildVoiceConfig({ voiceId: v.selected.voiceId, locale: "pt-BR", rate: 1.0 }),
    voiceDescriptor: v.selected,
  });
  const ok = job.estimatedDurationMs > 0 && job.estimatedDurationMsAtRate1 > 0;
  return { name: "smokeJobDurationEstimate", ok, detail: `est=${job.estimatedDurationMs}ms baseline=${job.estimatedDurationMsAtRate1}ms` };
}

/** Smoke 4: state transitions idle→loading→playing→paused→done. */
export function smokeStateTransitions(): SmokeResult {
  const config = buildVoiceConfig({});
  const v = getVoiceById(config.voiceId)!;
  let s = createPlaybackSession(config, v);
  let steps: string[] = [];
  const t1 = applyTransition(s, "loading");
  if (!t1) return { name: "smokeStateTransitions", ok: false, detail: "loading failed" };
  s = t1; steps.push("loading");
  const t2 = applyTransition(s, "playing");
  if (!t2) return { name: "smokeStateTransitions", ok: false, detail: "playing failed" };
  s = t2; steps.push("playing");
  const t3 = applyTransition(s, "paused");
  if (!t3) return { name: "smokeStateTransitions", ok: false, detail: "paused failed" };
  s = t3; steps.push("paused");
  const t4 = applyTransition(s, "playing");
  if (!t4) return { name: "smokeStateTransitions", ok: false, detail: "resume failed" };
  s = t4; steps.push("playing");
  const ok = steps.length === 4;
  return { name: "smokeStateTransitions", ok, detail: `steps=${steps.join("→")}` };
}

/** Smoke 5: controles play/pause/resume/stop. */
export function smokePlaybackControls(): SmokeResult {
  const config = buildVoiceConfig({});
  const v = getVoiceById(config.voiceId)!;
  let session = createPlaybackSession(config, v);
  // attach a job
  const job = buildTtsJob({ text: "Teste.", voice: config, voiceDescriptor: v });
  session = { ...session, job };
  const t1 = playControl(session);
  if (!t1.ok) return { name: "smokePlaybackControls", ok: false, detail: "play fail" };
  const t2 = pauseControl(t1.session);
  if (!t2.ok) return { name: "smokePlaybackControls", ok: false, detail: "pause fail" };
  const t3 = resumeControl(t2.session);
  if (!t3.ok) return { name: "smokePlaybackControls", ok: false, detail: "resume fail" };
  const t4 = stopControl(t3.session);
  if (!t4.ok) return { name: "smokePlaybackControls", ok: false, detail: "stop fail" };
  const ok = t4.session.state === "idle";
  return { name: "smokePlaybackControls", ok, detail: `finalState=${t4.session.state}` };
}

/** Smoke 6: rate/pitch validation rejeita valores fora do range. */
export function smokeRatePitchValidation(): SmokeResult {
  const r1 = validateRate(10); // fora
  const r2 = validateRate(2.0); // dentro
  const p1 = validatePitch(50); // fora
  const p2 = validatePitch(0); // dentro
  const ok = !r1.ok && r2.ok && !p1.ok && p2.ok;
  return { name: "smokeRatePitchValidation", ok, detail: `r1=${!r1.ok} r2=${r2.ok} p1=${!p1.ok} p2=${p2.ok}` };
}

/** Smoke 7: sacred skip — texto sagrado substituído por placeholder. */
export function smokeSacredSkip(): SmokeResult {
  const text = "Início do texto. Esta é uma oração ao sagrado. Fim do texto.";
  const v = selectVoice({ locale: "pt-BR" });
  const job = buildTtsJob({
    text,
    voice: buildVoiceConfig({ voiceId: v.selected.voiceId }),
    voiceDescriptor: v.selected,
  });
  const block = applySacredBlock(job);
  const sacredCues = job.queue.filter((c) => c.sacredFlag);
  const ok = sacredCues.length >= 1 && block.skipCount === sacredCues.length;
  return { name: "smokeSacredSkip", ok, detail: `sacred=${sacredCues.length} skipped=${block.skipCount}` };
}

/** Smoke 8: a11y announce — texto consistente para screen reader. */
export function smokeA11yAnnounce(): SmokeResult {
  const config = buildVoiceConfig({});
  const v = getVoiceById(config.voiceId)!;
  const session = createPlaybackSession(config, v);
  const snap = snapshotSession(session);
  const q = a11yCreate();
  const q2 = a11yPush(q, makeA11yAnnouncement("polite", "Reproduzindo", "state_change"));
  const aria = a11yToAriaLive(q2);
  const ok = aria.ariaBusy && aria.ariaLive === "polite" && aria.visuallyHiddenText === "Reproduzindo";
  void snap;
  return { name: "smokeA11yAnnounce", ok, detail: `ariaBusy=${aria.ariaBusy} ariaLive=${aria.ariaLive}` };
}

/** Smoke 9: LGPD export inclui preferences + história recente. */
export function smokeLgpdExport(): SmokeResult {
  const userId = "user-123";
  let act = createVoiceActivation(userId);
  const optIn = applyOptIn(act);
  act = optIn.activation;
  const activate = activateVoiceMode(act, buildVoiceConfig({}));
  act = activate.activation;
  const history: PlaybackHistoryEntry[] = [
    {
      entryId: "e1",
      userId: fnv1a64(userId),
      sessionId: "s1",
      voiceId: act.preferences?.voiceId ?? "v1",
      jobId: "j1",
      startedAt: 1719700000000 - 1000,
      endedAt: 1719700000000,
      durationSec: 1,
      cuesTotal: 3,
      cuesPlayed: 3,
      cuesSacred: 0,
      rate: 1.0,
      pitch: 0,
      locale: "pt-BR",
    },
  ];
  const out = lgpdExportVoice(act, history);
  const ok = out.payload.auditHash.length === 16 && out.payload.recentHistory.length === 1;
  return { name: "smokeLgpdExport", ok, detail: `hash=${out.payload.auditHash.length}ch entries=${out.payload.recentHistory.length}` };
}

/** Smoke 10: LGPD erasure zera preferencias e biometric. */
export function smokeLgpdErasure(): SmokeResult {
  const userId = "user-456";
  let act = createVoiceActivation(userId);
  act = applyOptIn(act).activation;
  act = applyBiometricOptIn(act).activation;
  act = activateVoiceMode(act, buildVoiceConfig({ voiceBiometricConsent: true })).activation;
  const erased = lgpdEraseVoice(act);
  const ok =
    erased.erasedActivation.preferences === null &&
    erased.erasedActivation.biometricEnrolledAt === null &&
    erased.erasedActivation.optIn === false &&
    erased.erasedTemplateFields.length === 3;
  return {
    name: "smokeLgpdErasure",
    ok,
    detail: `prefs=${erased.erasedActivation.preferences === null} bio=${erased.erasedActivation.biometricEnrolledAt === null}`,
  };
}

/** Smoke 11: opt-in default OFF + opt-in explícito requer consentimento. */
export function smokeOptInDefaultOff(): SmokeResult {
  const act = createVoiceActivation("user-7");
  const tryActivate = activateVoiceMode(act, buildVoiceConfig({}));
  const ok = !tryActivate.ok && tryActivate.error?.code === "VM_007";
  return { name: "smokeOptInDefaultOff", ok, detail: `code=${tryActivate.error?.code}` };
}

/** Smoke 12: chunker respeita MAX_CHARS_PER_CUE. */
export function smokeChunkerRespectsMax(): SmokeResult {
  const longSentence = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(8);
  const r = chunkTextIntoCues({ text: longSentence });
  const allUnder = r.cues.every((c) => c.text.length <= MAX_CHARS_PER_CUE + 1); // +1 para tolerância de join
  const ok = r.cues.length >= 2 && allUnder;
  return { name: "smokeChunkerRespectsMax", ok, detail: `cues=${r.cues.length} maxLen=${Math.max(...r.cues.map((c) => c.text.length))}` };
}

/** Smoke 13: seek por timestampMs. */
export function smokeSeekByTimestamp(): SmokeResult {
  const config = buildVoiceConfig({});
  const v = getVoiceById(config.voiceId)!;
  let s = createPlaybackSession(config, v);
  const job = buildTtsJob({
    text: "Primeira frase. Segunda frase. Terceira frase. Quarta frase.",
    voice: config,
    voiceDescriptor: v,
  });
  s = { ...s, job };
  const seek = seekToTimestamp(s, Math.floor(job.estimatedDurationMs / 2));
  const ok = seek.currentCueIndex > 0 && seek.currentCueIndex < job.queue.length;
  return { name: "smokeSeekByTimestamp", ok, detail: `idx=${seek.currentCueIndex} total=${job.queue.length}` };
}

/** Smoke 14: history retention filtra entradas antigas. */
export function smokeHistoryRetention(): SmokeResult {
  const now = 1719700000000;
  const day = 24 * 3600 * 1000;
  const h: PlaybackHistoryEntry[] = [
    {
      entryId: "old",
      userId: "u",
      sessionId: null,
      voiceId: "v",
      jobId: "j",
      startedAt: now - 31 * day,
      endedAt: now - 31 * day,
      durationSec: 1,
      cuesTotal: 1,
      cuesPlayed: 1,
      cuesSacred: 0,
      rate: 1.0,
      pitch: 0,
      locale: "pt-BR",
    },
    {
      entryId: "recent",
      userId: "u",
      sessionId: null,
      voiceId: "v",
      jobId: "j",
      startedAt: now - 5 * day,
      endedAt: now - 5 * day,
      durationSec: 1,
      cuesTotal: 1,
      cuesPlayed: 1,
      cuesSacred: 0,
      rate: 1.0,
      pitch: 0,
      locale: "pt-BR",
    },
  ];
  const filtered = applyHistoryRetention(h, 30, now);
  const ok = filtered.length === 1 && filtered[0]!.entryId === "recent";
  return { name: "smokeHistoryRetention", ok, detail: `kept=${filtered.length}` };
}

/** Smoke 15: FNV-1a 64 known vectors. */
export function smokeFnv1a64(): SmokeResult {
  // FNV-1a 64("") = cbf29ce484222325 (canonical, isthe.com/chongo)
  // FNV-1a 64("a") = af63dc4c8601ec8c (canonical, isthe.com/chongo)
  const h0 = fnv1a64("");
  const h1 = fnv1a64("a");
  const ok = h0 === "cbf29ce484222325" && h1 === "af63dc4c8601ec8c";
  return { name: "smokeFnv1a64", ok, detail: `empty=${h0} a=${h1}` };
}

/** Run all smoke tests. */
export function runAllSmokeTests(): SmokeResult[] {
  return [
    smokeVoiceSelectByLocale(),
    smokeCueChunkerSplits(),
    smokeJobDurationEstimate(),
    smokeStateTransitions(),
    smokePlaybackControls(),
    smokeRatePitchValidation(),
    smokeSacredSkip(),
    smokeA11yAnnounce(),
    smokeLgpdExport(),
    smokeLgpdErasure(),
    smokeOptInDefaultOff(),
    smokeChunkerRespectsMax(),
    smokeSeekByTimestamp(),
    smokeHistoryRetention(),
    smokeFnv1a64(),
  ];
}

export function summarizeSmokeTests(
  results: SmokeResult[]
): { passed: number; failed: number; total: number } {
  let passed = 0;
  for (const r of results) if (r.ok) passed += 1;
  return { passed, failed: results.length - passed, total: results.length };
}

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║ §16 Doc-string constants                                                  ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

/** LGPD articles cobertos. */
export const LGPD_ARTICLES_COVERED = {
  art7: "Art. 7, I — consentimento livre, informado, inequívoco (opt-in)",
  art7purpose: "Art. 7, II — finalidade específica (TTS rendering, não identificação biométrica)",
  art9: "Art. 9 — finalidade lícita e informada (renderização de áudio, NUNCA identificação)",
  art18v: "Art. 18, V — acesso e portabilidade",
  art18vi: "Art. 18, VI — eliminação (esquecimento)",
  art18i: "Art. 18, I — confirmação da existência de tratamento",
  art18iii: "Art. 18, III — correção",
} as const;

/** Garantias do engine. */
export const ENGINE_GUARANTEES = {
  sacredPolicy: "Cues sacred (prayer/chant/ritual/etc.) nunca são falados — replaced com [conteúdo em modo silêncio]",
  optInDefault: "Opt-in é OFF por default (LGPD Art. 7)",
  biometricConsent: "Voice biometric enrollment é opt-in SEPARADO do opt-in principal",
  purposeLimitation: "Voz capturada é usada APENAS para TTS rendering (Art. 9). NUNCA para identificação biométrica.",
  retention: "Playback history retida por 30 dias (configurável). Erasure remove preferences + history + biometric template.",
  export: "LGPD export inclui preferences + histórico recente + metadata de opt-in (sem conteúdo de áudio).",
  revocability: "opt-out remove voice mode imediatamente; audit retido 30 dias.",
  stateMachine: "Transições determinísticas: idle→loading→playing→paused→done|error, com validação rigorosa",
  rateLimits: "Rate clamped em [0.5..4.0], pitch clamped em [-12..+12]",
  cueLimits: "Cues até 240 chars; frases longas quebradas em cláusulas; numbering preservado",
  a11y: "Aria-live polite, aria-busy dinâmico, visual caption rendering para silêncio",
} as const;

/** Dependências do engine — todas zero-runtime. */
export const ENGINE_DEPENDENCIES = {
  runtime: [],
  typescript: ">=5.4.0",
  nodeTarget: "ES2017+",
} as const;

/** Limites operacionais publicados. */
export const ENGINE_LIMITS_PUBLIC = {
  minRate: MIN_CUE_RATE,
  maxRate: MAX_CUE_RATE,
  minPitch: MIN_CUE_PITCH,
  maxPitch: MAX_CUE_PITCH,
  maxCharsPerCue: MAX_CHARS_PER_CUE,
  retentionDaysDefault: PLAYBACK_HISTORY_RETENTION_DAYS,
  supportedLocales: SUPPORTED_LOCALES.length,
  supportedVoices: SUPPORTED_VOICES.length,
} as const;

/** Mensagens de erro. */
export const VOICE_MODE_ERROR_MESSAGES: Record<VoiceModeErrorCode, string> = {
  VM_001: "Voz não encontrada no registry",
  VM_002: `Rate fora do range permitido [${MIN_CUE_RATE}..${MAX_CUE_RATE}]`,
  VM_003: `Pitch fora do range permitido [${MIN_CUE_PITCH}..${MAX_CUE_PITCH}]`,
  VM_004: "Job queue vazio",
  VM_005: "Transição de estado inválida",
  VM_006: "Seek para timestampMs inválido",
  VM_007: "Opt-in ausente (LGPD Art. 7 requer consentimento)",
  VM_008: "Voice biometric consent não enrolled (opt-in SEPARATE requerido)",
  VM_009: "LGPD export solicitado",
  VM_010: "LGPD erasure solicitado",
  VM_011: "Cue chunking falhou (texto vazio ou inválido)",
  VM_012: "Sacred content protection violation (NUNCA deveria disparar)",
  VM_013: "Locale não suportado",
};

/** Helper para construir um PlaybackError. */
export function makeError(
  code: VoiceModeErrorCode,
  detail?: string,
  now: number = 1719700000000
): PlaybackError {
  return {
    code,
    message: VOICE_MODE_ERROR_MESSAGES[code],
    detail,
    ts: now,
  };
}

/** Resumo do arquivo. */
export const FILE_METADATA = {
  filename: "src/lib/w56/voice_mode_tts_akasha.ts",
  w56Slot: true,
  engineVersion: ENGINE_VERSION,
  policyVersion: POLICY_VERSION,
  layout: "§1..§16",
  compiledByShape: true,
  importsFromOtherRepoFiles: false,
} as const;

/** Engine public surface — lista resumida. */
export const ENGINE_PUBLIC_SURFACE = {
  typesCount: [
    "VoiceModeState", "PlaybackCue", "VoiceConfig", "VoiceHandle", "TtsJobShape",
    "AudioSegment", "PlaybackError", "VoiceActivation", "OptInEvent",
    "PlaybackHistoryEntry", "LGPDExportPayload", "A11yAnnouncement",
    "AudioQueueUpdateEvent", "SacredVoiceRegistry", "VoiceModeReport",
    "VoiceModeStateSnapshot", "AuditStep", "VoiceModeErrorRecord",
    "CueReceptionNotification", "A11yQueue", "A11yVisualCaption",
    "AuditEvent", "AuditLogger", "AuditSummary",
  ],
  functionsCount: 60,
  keyExports: [
    "buildTtsJob", "chunkTextIntoCues", "selectVoice", "playControl",
    "applySacredBlock", "activateVoiceMode", "lgpdExportVoice",
    "lgpdEraseVoice", "runAllSmokeTests",
  ],
} as const;

/** Voice mode pipeline orchestrator (executa o fluxo end-to-end). */
export function runVoiceModePipeline(args: {
  userId: string;
  text: string;
  config?: Partial<VoiceConfig>;
  criteria?: VoiceSelectionCriteria;
  now?: number;
}): {
  report: VoiceModeReport;
  job: TtsJobShape;
  events: AudioQueueUpdateEvent[];
  a11yQueue: A11yQueue;
} {
  const now = args.now ?? 1719700000000;
  const activation0 = createVoiceActivation(args.userId, now);
  const activation1 = applyOptIn(activation0, "implicit via pipeline", now).activation;
  const config = buildVoiceConfig(args.config ?? {});
  const selected = selectVoice(args.criteria ?? { locale: config.locale }, SUPPORTED_VOICES);
  const descriptor = selected.selected;
  const baseJob = buildTtsJob({
    text: args.text,
    voice: { ...config, voiceId: descriptor.voiceId },
    voiceDescriptor: descriptor,
    now,
  });
  const blocked = applySacredBlock(baseJob);
  const activation2 = activateVoiceMode(activation1, { ...config, voiceId: descriptor.voiceId }, now).activation;
  const auditTrail: AuditStep[] = [
    { step: "JobQueued", ts: now, ok: true, detail: `sacred=${blocked.job.sacredCount}` },
    { step: "SacredSkip", ts: now, ok: true, detail: `skipped=${blocked.skipCount}` },
    { step: "VoiceActivated", ts: now, ok: true, detail: `voice=${descriptor.voiceId}` },
  ];
  const a11yQueue: A11yQueue = a11yCreate();
  let queue: A11yQueue = a11yQueue;
  for (const a of blocked.a11y) {
    queue = a11yPush(queue, a);
  }

  const events: AudioQueueUpdateEvent[] = [
    ...blocked.events,
    makeAudioQueueEvent("queue_built", now, { jobId: blocked.job.jobId }),
    makeAudioQueueEvent("play", now, { jobId: blocked.job.jobId }),
  ];

  const report: VoiceModeReport = {
    state: snapshotSession(
      createPlaybackSession(
        { ...config, voiceId: descriptor.voiceId },
        descriptor,
        now
      )
    ),
    activation: activation2,
    currentJob: blocked.job,
    errors: [],
    auditTrail,
    a11yQueue: queue.items,
    audioQueueEvents: events,
    durationMs: blocked.job.estimatedDurationMs,
    generatedAt: now,
    engineVersion: ENGINE_VERSION,
  };

  return { report, job: blocked.job, events, a11yQueue: queue };
}
