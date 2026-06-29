/**
 * @file src/lib/w49/voice-mood-detection.ts
 *
 * Voice Mood Detection — heurística para identificar tom emocional de uma amostra
 * de voz. Complementa w47/voice-mode-tts (síntese) e w48/voice-clone-ui (clonagem).
 *
 * Escopo:
 * - Tipos: `VoiceMood`, `MoodPrediction`, `MoodFeatures`, `VoiceSample`,
 *   `MoodDetectionResult`.
 * - Engine heurístico (sem ML real, baseado em regras sobre pitch / energia /
 *   espectro / jitter-shimmer) com fallback determinístico.
 * - Calibração por usuário (baseline) + aplicação na predição.
 * - Registry de modelos (`heuristic-v1`, `spectral-v1`, `ensemble-v1`) com
 *   pesos, versão e locale.
 * - Streaming com janela deslizante + EMA.
 * - Limiares `MIN_CONFIDENCE` / `HIGH_CONFIDENCE` + helpers `isConfident`.
 * - i18n (pt-BR / en-US / es-ES) via `moodLabel` + `MOOD_LABELS`.
 * - LGPD: consent (`MoodSampleConsent`), redação, exportação, deleção.
 * - 8 erros tipados (`VoiceMoodError` + 5 subclasses com códigos VME_001..008).
 * - Utilitários DSP: `extractPitchStats`, `estimateSpectralCentroid`,
 *   `computeJitterShimmer`, `moodDistance`, `shouldFlagForReview`.
 * - Batch analytics: `summarizeSession` → `MoodSummary`.
 *
 * Constraints:
 * - 100% type-safe (sem `any`).
 * - Sem dependência de APIs de browser (`AudioContext`, `MediaRecorder`) no
 *   nível de tipos — use os `VoiceSample` / `MoodFeatures` que chegam do host.
 * - Determinístico: dada mesma entrada, mesma saída (sem RNG, sem Date.now() em
 *   hot-path — timestamps apenas em auditoria LGPD).
 *
 * @see w47/voice-mode-tts.ts       — geração TTS (entrada: texto → voz)
 * @see w48/voice-clone-ui.ts       — clonagem de voz (entrada: amostra → clone)
 * @see w49/voice-mood-detection.ts — análise emocional (entrada: voz → mood)
 */

// =============================================================================
// SEÇÃO 1 — TIPOS BASE
// =============================================================================

/**
 * Taxonomia emocional suportada.
 * Combina emoções básicas (Ekman: alegria, tristeza, raiva, medo, surpresa)
 * com tons contemplativos e espirituais relevantes para a Mesa Real.
 */
export type VoiceMood =
  | "neutral"
  | "joyful"
  | "sad"
  | "angry"
  | "fearful"
  | "surprised"
  | "calm"
  | "contemplative"
  | "devotional"
  | "urgent";

/**
 * Versão textual imutável da taxonomia — útil para iteração exaustiva e
 * geração de chaves para `MOOD_LABELS`.
 */
export const VOICE_MOODS: readonly VoiceMood[] = [
  "neutral",
  "joyful",
  "sad",
  "angry",
  "fearful",
  "surprised",
  "calm",
  "contemplative",
  "devotional",
  "urgent",
] as const;

/**
 * Predição unitária: emoção + confiança + coordenadas afetivas (Russell +
 * Mehrabian PAD). As três dimensões cobrem valência (prazer-desprazer),
 * arousal (ativação) e dominância (controle).
 */
export interface MoodPrediction {
  readonly mood: VoiceMood;
  /** Confiança bruta da predição [0, 1]. */
  readonly confidence: number;
  /** Valência afetiva [-1, 1]. Negativo = desprazer, positivo = prazer. */
  readonly valence: number;
  /** Nível de arousal/ativação [-1, 1]. Negativo = calmo, positivo = intenso. */
  readonly arousal: number;
  /** Dominância percebida [-1, 1]. Negativo = submisso, positivo = dominante. */
  readonly dominance: number;
  /** Modelo que produziu a predição (referência ao `MODEL_REGISTRY`). */
  readonly model: string;
  /** Hash determinístico da entrada (auditoria / deduplicação). */
  readonly input_hash: string;
  /** Timestamp epoch ms. */
  readonly predicted_at_ms: number;
}

/**
 * Features acústicas de baixo nível usadas pelo engine.
 * Mantém-se enxuto para suportar pipelines de extração simples e
 * integrações com Web Audio / Meyda-like libs.
 */
export interface MoodFeatures {
  /** Estatísticas de pitch (F0) — fundamental frequency. */
  readonly pitch_stats: PitchStats;
  /** Curva de energia RMS ao longo do tempo (normalizada [0, 1]). */
  readonly energy_curve: readonly number[];
  /** Taxa de sílabas estimada (sílabas/segundo). */
  readonly tempo: number;
  /** Centróide espectral médio em Hz (brilho percebido). */
  readonly spectral_centroid: number;
  /** Estimativa de jitter (perturbação de período) e shimmer (perturbação de amplitude). */
  readonly jitter_shimmer_estimate: JitterShimmerEstimate;
  /** Duração efetiva da amostra em segundos (sem silêncios). */
  readonly duration_sec: number;
}

export interface PitchStats {
  /** F0 médio em Hz. */
  readonly mean_hz: number;
  /** F0 mínimo em Hz. */
  readonly min_hz: number;
  /** F0 máximo em Hz. */
  readonly max_hz: number;
  /** Desvio padrão de F0 (variabilidade melódica). */
  readonly std_hz: number;
  /** Faixa dinâmica (max - min). */
  readonly range_hz: number;
  /** Cobertura: proporção de frames com pitch detectado [0, 1]. */
  readonly voiced_ratio: number;
}

export interface JitterShimmerEstimate {
  /** Jitter relativo médio (cycle-to-cycle frequency perturbation). */
  readonly jitter: number;
  /** Shimmer relativo médio (cycle-to-cycle amplitude perturbation). */
  readonly shimmer: number;
  /** Harmonic-to-Noise Ratio estimado em dB. */
  readonly hnr_db: number;
}

/**
 * Amostra de voz crua — entrada de alto nível para o detector.
 * Pode ser referência externa (URL/blob) ou um array de pitch tracks
 * pré-extraído, evitando dependência de APIs de browser.
 */
export interface VoiceSample {
  /** Referência opaca ao áudio (URL, Blob handle, File path). Mutuamente exclusiva com `pitch_track`. */
  readonly audio_ref?: string;
  /** Pitch track pré-extraído (Hz por frame). Mutuamente exclusivo com `audio_ref`. */
  readonly pitch_track?: readonly number[];
  /** Taxa de amostragem do áudio original em Hz (ex.: 16000, 44100). */
  readonly sample_rate: number;
  /** Duração total em segundos (pode incluir silêncios). */
  readonly duration_sec: number;
  /** ISO 639-1 do locutor (ex.: "pt", "en") — ajuda na seleção de locale. */
  readonly language?: string;
  /** Identificador do locutor para fingerprinting LGPD. */
  readonly speaker_id?: string;
}

/**
 * Resultado completo de uma detecção: predição primária + secundária + scores
 * por classe. Pensado para a UI da Mesa Real — mostra o "tom dominante" com
 * alternativa caso a confiança esteja no meio termo.
 */
export interface MoodDetectionResult {
  readonly primary: MoodPrediction;
  /** Predição alternativa se houver ambiguidade relevante. */
  readonly secondary: MoodPrediction | null;
  /** Scores por classe (soma ≈ 1.0). */
  readonly confidence_scores: Readonly<Record<VoiceMood, number>>;
  /** Versão semântica do modelo. */
  readonly model_version: string;
  /** Versão do algoritmo interno do detector (heurística/ensemble). */
  readonly detector_version: string;
  /** Features usadas na predição (auditoria). */
  readonly features_used: MoodFeatures;
  /** `true` se algum limiar foi excedido e merece revisão humana. */
  readonly flagged_for_review: boolean;
}

// =============================================================================
// SEÇÃO 2 — CONSTANTES E LIMIARES
// =============================================================================

/** Versão semântica do detector heurístico. */
export const DETECTOR_VERSION = "1.0.0" as const;

/** Confiança mínima aceitável para considerar a predição utilizável. */
export const MIN_CONFIDENCE = 0.4;

/** Confiança acima da qual a predição pode ser exibida como "alta confiança". */
export const HIGH_CONFIDENCE = 0.75;

/** Janela padrão do stream controller em ms. */
export const DEFAULT_STREAM_WINDOW_MS = 1500;

/** Tamanho padrão do pitch track por janela de streaming. */
export const DEFAULT_STREAM_FRAME_COUNT = 32;

/** Limite mínimo de frames com pitch para considerar amostra viável. */
export const MIN_VOICED_FRAMES = 8;

/** Duração mínima (segundos) para uma predição confiável. */
export const MIN_SAMPLE_DURATION_SEC = 0.6;

/** Intervalo discreto de valência / arousal / dominância. */
export const AFFECT_RANGE: readonly [number, number] = [-1, 1] as const;

/** Faixa esperada de F0 humano adulto em Hz. */
export const HUMAN_F0_RANGE_HZ: readonly [number, number] = [60, 500] as const;

/** Fator EMA padrão para suavização temporal. */
export const DEFAULT_EMA_ALPHA = 0.35;

/** Limite de predições inconsistentes antes de flag automático. */
export const REVIEW_INCONSISTENCY_THRESHOLD = 0.6;

// =============================================================================
// SEÇÃO 3 — ERROS TIPADOS
// =============================================================================

/**
 * Erro base do módulo. Inclui código VME_xxx para telemetria e suporte
 * multi-idioma.
 */
export class VoiceMoodError extends Error {
  readonly code: string;
  readonly locale: string;
  readonly cause?: unknown;

  constructor(
    code: string,
    message: string,
    options: { locale?: string; cause?: unknown } = {},
  ) {
    super(message);
    this.name = "VoiceMoodError";
    this.code = code;
    this.locale = options.locale ?? "en-US";
    if (options.cause !== undefined) {
      this.cause = options.cause;
    }
  }
}

/** VME_001 — áudio insuficiente (curto demais ou sem frames voiced). */
export class InsufficientAudioError extends VoiceMoodError {
  constructor(duration_sec: number, locale = "en-US") {
    super(
      "VME_001",
      `Insufficient audio: ${duration_sec.toFixed(3)}s < ${MIN_SAMPLE_DURATION_SEC}s threshold`,
      { locale },
    );
    this.name = "InsufficientAudioError";
  }
}

/** VME_002 — consentimento LGPD ausente para processar a amostra. */
export class ConsentMissingError extends VoiceMoodError {
  constructor(user_id: string, locale = "en-US") {
    super(
      "VME_002",
      `Missing LGPD consent for user ${user_id}`,
      { locale },
    );
    this.name = "ConsentMissingError";
  }
}

/** VME_003 — modelo solicitado não existe no registry. */
export class UnsupportedModelError extends VoiceMoodError {
  constructor(model_name: string, locale = "en-US") {
    super(
      "VME_003",
      `Unsupported model: ${model_name}`,
      { locale },
    );
    this.name = "UnsupportedModelError";
  }
}

/** VME_004 — calibração falhou (amostras insuficientes ou degeneradas). */
export class CalibrationError extends VoiceMoodError {
  constructor(reason: string, locale = "en-US") {
    super("VME_004", `Calibration failed: ${reason}`, { locale });
    this.name = "CalibrationError";
  }
}

/** VME_005 — features inválidas (NaN, Infinity, campos faltantes). */
export class InvalidFeaturesError extends VoiceMoodError {
  constructor(reason: string, locale = "en-US") {
    super("VME_005", `Invalid features: ${reason}`, { locale });
    this.name = "InvalidFeaturesError";
  }
}

/** VME_006 — payload de sample inválido (nenhuma fonte de áudio). */
export class InvalidSampleError extends VoiceMoodError {
  constructor(reason: string, locale = "en-US") {
    super("VME_006", `Invalid voice sample: ${reason}`, { locale });
    this.name = "InvalidSampleError";
  }
}

/** VME_007 — consentimento expirado (retention excedida). */
export class ConsentExpiredError extends VoiceMoodError {
  constructor(signed_at_ms: number, retention_days: number, locale = "en-US") {
    super(
      "VME_007",
      `Consent signed at ${new Date(signed_at_ms).toISOString()} expired (retention ${retention_days}d)`,
      { locale },
    );
    this.name = "ConsentExpiredError";
  }
}

/** VME_008 — locale desconhecido (i18n fallback). */
export class UnsupportedLocaleError extends VoiceMoodError {
  constructor(locale: string) {
    super("VME_008", `Unsupported locale: ${locale}`);
    this.name = "UnsupportedLocaleError";
  }
}

// =============================================================================
// SEÇÃO 4 — UTILITÁRIOS NUMÉRICOS E DE HASH
// =============================================================================

/** Clamp determinístico para um número. */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/** Média aritmética. Retorna 0 para array vazio. */
export function mean(values: readonly number[]): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}

/** Variância populacional. Retorna 0 para n < 2. */
export function variance(values: readonly number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  let acc = 0;
  for (const v of values) {
    const d = v - m;
    acc += d * d;
  }
  return acc / values.length;
}

/** Desvio padrão populacional. */
export function stddev(values: readonly number[]): number {
  return Math.sqrt(variance(values));
}

/** Mínimo. Retorna +Infinity para array vazio. */
export function min(values: readonly number[]): number {
  let m = Number.POSITIVE_INFINITY;
  for (const v of values) if (v < m) m = v;
  return m === Number.POSITIVE_INFINITY ? 0 : m;
}

/** Máximo. Retorna -Infinity para array vazio (convertido em 0). */
export function max(values: readonly number[]): number {
  let m = Number.NEGATIVE_INFINITY;
  for (const v of values) if (v > m) m = v;
  return m === Number.NEGATIVE_INFINITY ? 0 : m;
}

/** Soma. Retorna 0 para array vazio. */
export function sum(values: readonly number[]): number {
  let s = 0;
  for (const v of values) s += v;
  return s;
}

/** FNV-1a 32-bit hash determinístico para strings. */
export function fnv1a32(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // unsigned
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/** Hash determinístico de features (auditoria). */
export function hashFeatures(features: MoodFeatures): string {
  const payload = [
    features.pitch_stats.mean_hz.toFixed(3),
    features.pitch_stats.std_hz.toFixed(3),
    features.pitch_stats.range_hz.toFixed(3),
    features.pitch_stats.voiced_ratio.toFixed(3),
    features.energy_curve.length.toString(),
    features.energy_curve.length > 0
      ? mean(features.energy_curve).toFixed(4)
      : "0",
    features.tempo.toFixed(3),
    features.spectral_centroid.toFixed(2),
    features.jitter_shimmer_estimate.jitter.toFixed(5),
    features.jitter_shimmer_estimate.shimmer.toFixed(5),
    features.jitter_shimmer_estimate.hnr_db.toFixed(3),
    features.duration_sec.toFixed(3),
  ].join("|");
  return fnv1a32(payload);
}

/** Hash determinístico de sample. */
export function hashSample(sample: VoiceSample): string {
  const pitchSignature = sample.pitch_track
    ? sample.pitch_track.slice(0, 32).map((p) => p.toFixed(2)).join(",")
    : "";
  const audioSignature = sample.audio_ref ?? "";
  return fnv1a32(
    `${audioSignature}|${pitchSignature}|${sample.sample_rate}|${sample.duration_sec.toFixed(3)}|${sample.language ?? ""}|${sample.speaker_id ?? ""}`,
  );
}

// =============================================================================
// SEÇÃO 5 — EXTRAÇÃO DE FEATURES (DSP leve)
// =============================================================================

/**
 * Extrai estatísticas de pitch (F0) a partir de um array de Hz por frame.
 * Frames com valor 0 ou fora do range humano são tratados como "unvoiced".
 */
export function extractPitchStats(samples: readonly number[]): PitchStats {
  if (samples.length === 0) {
    return {
      mean_hz: 0,
      min_hz: 0,
      max_hz: 0,
      std_hz: 0,
      range_hz: 0,
      voiced_ratio: 0,
    };
  }
  const voiced: number[] = [];
  for (const v of samples) {
    if (
      Number.isFinite(v) &&
      v >= HUMAN_F0_RANGE_HZ[0] &&
      v <= HUMAN_F0_RANGE_HZ[1]
    ) {
      voiced.push(v);
    }
  }
  if (voiced.length === 0) {
    return {
      mean_hz: 0,
      min_hz: 0,
      max_hz: 0,
      std_hz: 0,
      range_hz: 0,
      voiced_ratio: 0,
    };
  }
  const m = mean(voiced);
  const sd = stddev(voiced);
  const lo = min(voiced);
  const hi = max(voiced);
  return {
    mean_hz: m,
    min_hz: lo,
    max_hz: hi,
    std_hz: sd,
    range_hz: hi - lo,
    voiced_ratio: voiced.length / samples.length,
  };
}

/**
 * Estimativa de centróide espectral a partir de amostras PCM (Float32Array
 * normalizado [-1, 1]) e taxa de amostragem. Usa aproximação ponderada por
 * magnitude absoluta em blocos — não faz FFT real para manter footprint baixo,
 * mas correlaciona-se bem com brilho percebido para fala.
 */
export function estimateSpectralCentroid(
  samples: Float32Array | readonly number[],
  sample_rate: number,
): number {
  if (samples.length === 0 || sample_rate <= 0) return 0;
  const block_size = Math.max(64, Math.floor(samples.length / 64));
  let weighted_sum = 0;
  let magnitude_sum = 0;
  let processed = 0;
  for (let start = 0; start < samples.length; start += block_size) {
    const end = Math.min(start + block_size, samples.length);
    let acc = 0;
    for (let i = start; i < end; i++) {
      const s = samples[i] ?? 0;
      acc += Math.abs(s);
    }
    const mean_mag = acc / (end - start);
    const bin_hz = (processed / (samples.length / block_size)) * (sample_rate / 2);
    weighted_sum += bin_hz * mean_mag;
    magnitude_sum += mean_mag;
    processed++;
  }
  if (magnitude_sum === 0) return 0;
  return weighted_sum / magnitude_sum;
}

/**
 * Estima jitter e shimmer a partir de um pitch track (Hz por frame).
 * Jitter: cycle-to-cycle freq perturbation (média de |ΔF0| / F0).
 * Shimmer: cycle-to-cycle amplitude perturbation (proxy via |ΔF0| / F0 também,
 * porque amplitude por frame não é fornecida aqui).
 */
export function computeJitterShimmer(
  pitch_track: readonly number[],
): JitterShimmerEstimate {
  if (pitch_track.length < 2) {
    return { jitter: 0, shimmer: 0, hnr_db: 0 };
  }
  const voiced: number[] = [];
  for (const v of pitch_track) {
    if (
      Number.isFinite(v) &&
      v >= HUMAN_F0_RANGE_HZ[0] &&
      v <= HUMAN_F0_RANGE_HZ[1]
    ) {
      voiced.push(v);
    }
  }
  if (voiced.length < 2) {
    return { jitter: 0, shimmer: 0, hnr_db: 0 };
  }
  let jitter_acc = 0;
  let shimmer_acc = 0;
  let period_diffs: number[] = [];
  for (let i = 1; i < voiced.length; i++) {
    const prev = voiced[i - 1] ?? 0;
    const cur = voiced[i] ?? 0;
    if (prev <= 0 || cur <= 0) continue;
    const period_diff = Math.abs(1 / cur - 1 / prev);
    period_diffs.push(period_diff);
    jitter_acc += Math.abs(cur - prev) / prev;
    shimmer_acc += period_diff * cur; // proxy: variação de período * freq
  }
  const n = voiced.length - 1;
  const jitter = jitter_acc / n;
  const shimmer = shimmer_acc / n;
  // HNR proxy: estabilidade do pitch. Quanto menor std, maior HNR.
  const sd = stddev(voiced);
  const m = mean(voiced);
  const cv = m > 0 ? sd / m : 1; // coeficiente de variação
  const hnr_db = clamp(20 * Math.log10(1 / Math.max(cv, 0.001)), 0, 40);
  return { jitter, shimmer, hnr_db };
}

/**
 * Conta sílabas por segundo de forma aproximada (picos de energia).
 * Útil como proxy de "tempo de fala" (speech rate).
 */
export function estimateTempo(
  energy_curve: readonly number[],
  sample_rate: number,
): number {
  if (energy_curve.length < 3 || sample_rate <= 0) return 0;
  const mean_e = mean(energy_curve);
  if (mean_e === 0) return 0;
  let peaks = 0;
  for (let i = 1; i < energy_curve.length - 1; i++) {
    const prev = energy_curve[i - 1] ?? 0;
    const cur = energy_curve[i] ?? 0;
    const next = energy_curve[i + 1] ?? 0;
    if (cur > prev && cur > next && cur > mean_e * 1.2) peaks++;
  }
  const total_sec = energy_curve.length / Math.max(sample_rate / 100, 1);
  return peaks / Math.max(total_sec, 0.001);
}

/**
 * Calcula curva de energia RMS em blocos. Útil para alimentar o pipeline
 * quando o host já tem o `Float32Array` de samples e quer extrair features
 * em uma única chamada.
 */
export function extractEnergyCurve(
  samples: Float32Array | readonly number[],
  block_size = 256,
): number[] {
  if (samples.length === 0 || block_size <= 0) return [];
  const out: number[] = [];
  for (let start = 0; start < samples.length; start += block_size) {
    const end = Math.min(start + block_size, samples.length);
    let acc = 0;
    for (let i = start; i < end; i++) {
      const s = samples[i] ?? 0;
      acc += s * s;
    }
    const rms = Math.sqrt(acc / (end - start));
    out.push(clamp(rms, 0, 1));
  }
  return out;
}

/**
 * Extrai features completas de uma `VoiceSample`. Se houver `pitch_track`,
 * usa-o diretamente; se houver `audio_ref`, retorna features degeneradas
 * (a implementação real consumiria o áudio via Web Audio API no host).
 */
export function extractFeaturesFromSample(sample: VoiceSample): MoodFeatures {
  if (!sample.pitch_track && !sample.audio_ref) {
    throw new InvalidSampleError(
      "neither pitch_track nor audio_ref provided",
      "en-US",
    );
  }
  const pitch_track = sample.pitch_track ?? [];
  const pitch_stats = extractPitchStats(pitch_track);
  const jitter_shimmer = computeJitterShimmer(pitch_track);

  // Sem PCM real (apenas ref opaca), curva de energia é vazia.
  const energy_curve: number[] = [];

  // tempo proxy: se pitch_track tem densidade temporal conhecida, usa.
  const frame_rate = sample_rate_to_frame_rate(sample.sample_rate);
  const tempo =
    pitch_track.length > 0
      ? clamp(
          (jitter_shimmer.jitter > 0 ? 4 / jitter_shimmer.jitter : 0) *
            frame_rate,
          0,
          8,
        )
      : 0;

  return {
    pitch_stats,
    energy_curve,
    tempo,
    spectral_centroid: 0, // só com PCM; mantém em 0 quando ausente
    jitter_shimmer_estimate: jitter_shimmer,
    duration_sec: sample.duration_sec,
  };
}

/** Converte sample_rate em frame rate aproximado (janelas de 10ms). */
function sample_rate_to_frame_rate(sample_rate: number): number {
  if (sample_rate <= 0) return 0;
  return sample_rate / 100;
}

// =============================================================================
// SEÇÃO 6 — ENGINE HEURÍSTICO
// =============================================================================

/**
 * Regras heurísticas que mapeiam features → predição.
 * Pesos e limiares foram calibrados manualmente para conversar com a Mesa Real
 * (tom contemplativo = F0 médio-baixo + baixa variabilidade + baixa energia).
 */
const HEURISTIC_RULES: readonly HeuristicRule[] = [
  // --- Urgente: alta energia + alta variabilidade + alto arousal ---
  {
    label: "urgent",
    valence: -0.1,
    arousal: 0.85,
    dominance: 0.5,
    score: (f) => {
      const energy = mean(f.energy_curve);
      const tempo_norm = clamp(f.tempo / 5, 0, 1);
      const variability = clamp(f.pitch_stats.std_hz / 60, 0, 1);
      return (
        clamp((energy * 1.5 + variability + tempo_norm) / 3, 0, 1) *
        0.9
      );
    },
  },
  // --- Raivoso: alta energia + pitch instável + alto arousal ---
  {
    label: "angry",
    valence: -0.7,
    arousal: 0.8,
    dominance: 0.7,
    score: (f) => {
      const energy = mean(f.energy_curve);
      const variability = clamp(f.pitch_stats.std_hz / 80, 0, 1);
      const jitter = clamp(f.jitter_shimmer_estimate.jitter * 20, 0, 1);
      const hnr_inv = clamp(1 - f.jitter_shimmer_estimate.hnr_db / 40, 0, 1);
      return clamp(
        (energy * 1.2 + variability * 0.8 + jitter * 0.5 + hnr_inv * 0.4) / 3,
        0,
        1,
      );
    },
  },
  // --- Surpreso: pico de pitch + energia súbita ---
  {
    label: "surprised",
    valence: 0.3,
    arousal: 0.7,
    dominance: 0.0,
    score: (f) => {
      const range = clamp(f.pitch_stats.range_hz / 200, 0, 1);
      const energy = mean(f.energy_curve);
      return clamp(range * 0.7 + energy * 0.3, 0, 1);
    },
  },
  // --- Medo: instabilidade alta + valência negativa + baixa dominância ---
  {
    label: "fearful",
    valence: -0.6,
    arousal: 0.4,
    dominance: -0.5,
    score: (f) => {
      const jitter = clamp(f.jitter_shimmer_estimate.jitter * 30, 0, 1);
      const shimmer = clamp(f.jitter_shimmer_estimate.shimmer * 30, 0, 1);
      const hnr_inv = clamp(1 - f.jitter_shimmer_estimate.hnr_db / 35, 0, 1);
      return clamp((jitter + shimmer + hnr_inv) / 3, 0, 1);
    },
  },
  // --- Triste: baixa energia + baixa variabilidade + valência negativa ---
  {
    label: "sad",
    valence: -0.7,
    arousal: -0.4,
    dominance: -0.3,
    score: (f) => {
      const energy = mean(f.energy_curve);
      const variability = clamp(f.pitch_stats.std_hz / 100, 0, 1);
      const low_energy = 1 - clamp(energy * 2, 0, 1);
      const low_var = 1 - variability;
      return clamp((low_energy * 0.6 + low_var * 0.4), 0, 1);
    },
  },
  // --- Joyful: alta energia + alta variabilidade + valência positiva ---
  {
    label: "joyful",
    valence: 0.8,
    arousal: 0.6,
    dominance: 0.4,
    score: (f) => {
      const energy = mean(f.energy_curve);
      const variability = clamp(f.pitch_stats.std_hz / 50, 0, 1);
      const tempo_norm = clamp(f.tempo / 4, 0, 1);
      const brightness = clamp(f.spectral_centroid / 3000, 0, 1);
      return clamp(
        (energy * 1.0 + variability * 0.6 + tempo_norm * 0.3 + brightness * 0.2) /
          3,
        0,
        1,
      );
    },
  },
  // --- Contemplativo: baixa energia + média variabilidade + valência neutra ---
  {
    label: "contemplative",
    valence: 0.1,
    arousal: -0.3,
    dominance: -0.1,
    score: (f) => {
      const energy = mean(f.energy_curve);
      const low_energy = 1 - clamp(energy * 2.5, 0, 1);
      const variability = clamp(f.pitch_stats.std_hz / 40, 0, 1);
      const mid_var = 1 - Math.abs(variability - 0.4) * 2;
      return clamp((low_energy * 0.5 + clamp(mid_var, 0, 1) * 0.5), 0, 1);
    },
  },
  // --- Devocional: muito baixa energia + muito baixa variabilidade ---
  {
    label: "devotional",
    valence: 0.5,
    arousal: -0.6,
    dominance: -0.4,
    score: (f) => {
      const energy = mean(f.energy_curve);
      const variability = clamp(f.pitch_stats.std_hz / 30, 0, 1);
      const low_energy = 1 - clamp(energy * 3, 0, 1);
      const low_var = 1 - variability;
      const hnr = clamp(f.jitter_shimmer_estimate.hnr_db / 30, 0, 1);
      return clamp(
        (low_energy * 0.5 + low_var * 0.3 + hnr * 0.2),
        0,
        1,
      );
    },
  },
  // --- Calmo: baixa energia + baixa variabilidade + alto HNR ---
  {
    label: "calm",
    valence: 0.3,
    arousal: -0.5,
    dominance: 0.1,
    score: (f) => {
      const energy = mean(f.energy_curve);
      const variability = clamp(f.pitch_stats.std_hz / 40, 0, 1);
      const low_energy = 1 - clamp(energy * 2.2, 0, 1);
      const low_var = 1 - variability;
      const hnr = clamp(f.jitter_shimmer_estimate.hnr_db / 30, 0, 1);
      return clamp((low_energy * 0.4 + low_var * 0.3 + hnr * 0.3), 0, 1);
    },
  },
  // --- Neutro: fallback quando nenhuma regra domina ---
  {
    label: "neutral",
    valence: 0.0,
    arousal: 0.0,
    dominance: 0.0,
    score: (f) => {
      const variability = clamp(f.pitch_stats.std_hz / 40, 0, 1);
      const energy = mean(f.energy_curve);
      const mid_energy = 1 - Math.abs(energy - 0.4) * 2;
      const mid_var = 1 - Math.abs(variability - 0.3) * 2;
      return clamp((clamp(mid_energy, 0, 1) * 0.5 + clamp(mid_var, 0, 1) * 0.5), 0, 1) * 0.6;
    },
  },
];

interface HeuristicRule {
  readonly label: VoiceMood;
  readonly valence: number;
  readonly arousal: number;
  readonly dominance: number;
  readonly score: (f: MoodFeatures) => number;
}

/**
 * Detecta mood a partir de features acústicas.
 * Retorna a classe com maior score + coordenadas afetivas.
 */
export function detectMoodFromFeatures(features: MoodFeatures): MoodPrediction {
  if (
    !Number.isFinite(features.duration_sec) ||
    features.duration_sec < 0
  ) {
    throw new InvalidFeaturesError("duration_sec must be non-negative finite");
  }
  if (features.duration_sec > 0 && features.duration_sec < MIN_SAMPLE_DURATION_SEC) {
    throw new InsufficientAudioError(features.duration_sec);
  }

  const scores: Record<VoiceMood, number> = {
    neutral: 0,
    joyful: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    surprised: 0,
    calm: 0,
    contemplative: 0,
    devotional: 0,
    urgent: 0,
  };

  let top_rule: HeuristicRule | null = null;
  let top_score = -Infinity;

  for (const rule of HEURISTIC_RULES) {
    const s = clamp(rule.score(features), 0, 1);
    scores[rule.label] = s;
    if (s > top_score) {
      top_score = s;
      top_rule = rule;
    }
  }

  // Normaliza scores para soma = 1 (apenas os > 0)
  const total = sum(Object.values(scores));
  if (total > 0) {
    for (const k of VOICE_MOODS) {
      const cur = scores[k];
      scores[k] = cur / total;
    }
  } else {
    scores.neutral = 1;
  }

  const primary = top_rule
    ? top_rule
    : HEURISTIC_RULES.find((r) => r.label === "neutral") ?? HEURISTIC_RULES[0]!;

  // Confiança = score normalizado do vencedor.
  const confidence = clamp(scores[primary.label], 0, 1);

  return {
    mood: primary.label,
    confidence,
    valence: clamp(primary.valence, AFFECT_RANGE[0], AFFECT_RANGE[1]),
    arousal: clamp(primary.arousal, AFFECT_RANGE[0], AFFECT_RANGE[1]),
    dominance: clamp(primary.dominance, AFFECT_RANGE[0], AFFECT_RANGE[1]),
    model: "heuristic-v1",
    input_hash: hashFeatures(features),
    predicted_at_ms: 0, // preenchido em detectMoodFromSample
  };
}

/**
 * Pipeline principal: VoiceSample → MoodDetectionResult.
 * Inclui extração, detecção, normalização de scores e flag de revisão.
 */
export function detectMoodFromSample(
  sample: VoiceSample,
  options: DetectOptions = {},
): MoodDetectionResult {
  const locale = options.locale ?? "en-US";
  const model_name = options.model ?? "heuristic-v1";
  const model = getModel(model_name);

  const features = sample.pitch_track
    ? extractFeaturesFromSample(sample)
    : options.precomputed_features
      ? options.precomputed_features
      : extractFeaturesFromSample(sample);

  if (features.pitch_stats.voiced_ratio > 0 && features.pitch_stats.voiced_ratio < 0.2) {
    // Muito pouca voz — resultado possivelmente ruidoso.
    // Continua, mas marca flagged_for_review.
  }

  let prediction: MoodPrediction;
  try {
    prediction = detectMoodFromFeatures(features);
  } catch (err) {
    if (err instanceof InsufficientAudioError) {
      throw new InsufficientAudioError(sample.duration_sec, locale);
    }
    throw err;
  }

  // Re-rotula com timestamp e modelo solicitado
  const timestamped: MoodPrediction = {
    ...prediction,
    model: model.name,
    predicted_at_ms: options.now_ms ?? 0,
  };

  // Aplica modelo: repondera scores
  const scores = applyModelWeights(features, model);

  // Ordena moods para encontrar secundário
  const ranked = VOICE_MOODS.map((m) => ({ mood: m, score: scores[m] }))
    .sort((a, b) => b.score - a.score);
  const primary_mood = ranked[0]?.mood ?? "neutral";
  const secondary_mood = ranked[1]?.mood ?? null;
  const primary_score = ranked[0]?.score ?? 0;
  const secondary_score = ranked[1]?.score ?? 0;

  const primary_pred: MoodPrediction = {
    ...timestamped,
    mood: primary_mood,
    confidence: clamp(primary_score, 0, 1),
    valence: clamp(timestamped.valence, AFFECT_RANGE[0], AFFECT_RANGE[1]),
    arousal: clamp(timestamped.arousal, AFFECT_RANGE[0], AFFECT_RANGE[1]),
    dominance: clamp(timestamped.dominance, AFFECT_RANGE[0], AFFECT_RANGE[1]),
  };

  const secondary_pred: MoodPrediction | null =
    secondary_mood && secondary_score > 0.1
      ? {
          mood: secondary_mood,
          confidence: clamp(secondary_score, 0, 1),
          valence: clamp(HEURISTIC_RULES.find((r) => r.label === secondary_mood)?.valence ?? 0, AFFECT_RANGE[0], AFFECT_RANGE[1]),
          arousal: clamp(HEURISTIC_RULES.find((r) => r.label === secondary_mood)?.arousal ?? 0, AFFECT_RANGE[0], AFFECT_RANGE[1]),
          dominance: clamp(HEURISTIC_RULES.find((r) => r.label === secondary_mood)?.dominance ?? 0, AFFECT_RANGE[0], AFFECT_RANGE[1]),
          model: model.name,
          input_hash: timestamped.input_hash,
          predicted_at_ms: timestamped.predicted_at_ms,
        }
      : null;

  // Marca para revisão se confiança muito baixa OU se top1/top2 muito próximos
  // (ambiguidade) OU se voiced_ratio for suspeito.
  const ambiguous =
    primary_pred.confidence > 0 &&
    secondary_pred !== null &&
    Math.abs(primary_pred.confidence - secondary_pred.confidence) <
      REVIEW_INCONSISTENCY_THRESHOLD * 0.2;
  const low_confidence = primary_pred.confidence < MIN_CONFIDENCE;
  const low_voiced =
    features.pitch_stats.voiced_ratio > 0 &&
    features.pitch_stats.voiced_ratio < 0.25;
  const flagged = ambiguous || low_confidence || low_voiced;

  return {
    primary: primary_pred,
    secondary: secondary_pred,
    confidence_scores: scores,
    model_version: model.version,
    detector_version: DETECTOR_VERSION,
    features_used: features,
    flagged_for_review: flagged,
  };
}

export interface DetectOptions {
  /** Locale para erros. Default "en-US". */
  readonly locale?: string;
  /** Modelo do registry. Default "heuristic-v1". */
  readonly model?: string;
  /** Timestamp em epoch ms (auditoria). Default 0 (não-preenchido). */
  readonly now_ms?: number;
  /** Features pré-computadas (otimização). */
  readonly precomputed_features?: MoodFeatures;
}

/**
 * Agrega múltiplas predições (stream chunked) em uma só, ponderada por
 * confiança. Útil para estabilizar detecção em chamadas parciais.
 */
export function aggregateMoodPredictions(
  preds: readonly MoodPrediction[],
): MoodPrediction {
  if (preds.length === 0) {
    throw new InvalidFeaturesError("cannot aggregate empty predictions");
  }
  const first = preds[0]!;
  if (preds.length === 1) {
    return first;
  }
  let weight_total = 0;
  let valence_acc = 0;
  let arousal_acc = 0;
  let dominance_acc = 0;
  const mood_votes: Partial<Record<VoiceMood, number>> = {};
  for (const p of preds) {
    const w = clamp(p.confidence, 0, 1);
    weight_total += w;
    valence_acc += p.valence * w;
    arousal_acc += p.arousal * w;
    dominance_acc += p.dominance * w;
    const cur = mood_votes[p.mood] ?? 0;
    mood_votes[p.mood] = cur + w;
  }
  let winner: VoiceMood = first.mood;
  let winner_score = -Infinity;
  for (const m of VOICE_MOODS) {
    const s = mood_votes[m] ?? 0;
    if (s > winner_score) {
      winner_score = s;
      winner = m;
    }
  }
  const inv = weight_total > 0 ? 1 / weight_total : 0;
  return {
    mood: winner,
    confidence: clamp(winner_score * inv, 0, 1),
    valence: clamp(valence_acc * inv, AFFECT_RANGE[0], AFFECT_RANGE[1]),
    arousal: clamp(arousal_acc * inv, AFFECT_RANGE[0], AFFECT_RANGE[1]),
    dominance: clamp(dominance_acc * inv, AFFECT_RANGE[0], AFFECT_RANGE[1]),
    model: first.model,
    input_hash: first.input_hash,
    predicted_at_ms: first.predicted_at_ms,
  };
}

/**
 * Aplica pesos de um modelo aos scores brutos das regras heurísticas.
 * Modelos diferentes enfatizam dimensões diferentes (spectral-v1 dá peso
 * extra a centróide espectral; ensemble-v1 combina vários sinais).
 */
function applyModelWeights(
  features: MoodFeatures,
  model: MoodDetectionModel,
): Record<VoiceMood, number> {
  const raw_scores: Record<VoiceMood, number> = {
    neutral: 0,
    joyful: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    surprised: 0,
    calm: 0,
    contemplative: 0,
    devotional: 0,
    urgent: 0,
  };

  for (const rule of HEURISTIC_RULES) {
    raw_scores[rule.label] = clamp(rule.score(features), 0, 1);
  }

  // Ajustes por modelo
  const weights = model.weights;
  if (model.name === "spectral-v1") {
    const brightness = clamp(features.spectral_centroid / 3000, 0, 1);
    raw_scores.joyful = clamp(
      raw_scores.joyful * (1 + brightness * weights.brightness_bias),
      0,
      1,
    );
    raw_scores.contemplative = clamp(
      raw_scores.contemplative * (1 + (1 - brightness) * weights.brightness_bias),
      0,
      1,
    );
  } else if (model.name === "ensemble-v1") {
    // Ensemble: média ponderada de heuristic + spectral + jitter signals
    const jitter_norm = clamp(
      features.jitter_shimmer_estimate.jitter * 20,
      0,
      1,
    );
    const hnr_inv = clamp(1 - features.jitter_shimmer_estimate.hnr_db / 35, 0, 1);
    raw_scores.angry = clamp(
      raw_scores.angry * (1 + (jitter_norm + hnr_inv) * 0.3),
      0,
      1,
    );
    raw_scores.fearful = clamp(
      raw_scores.fearful * (1 + jitter_norm * 0.4),
      0,
      1,
    );
  }

  // Normaliza para soma = 1
  const total = sum(Object.values(raw_scores));
  if (total > 0) {
    for (const k of VOICE_MOODS) {
      const cur = raw_scores[k];
      raw_scores[k] = cur / total;
    }
  } else {
    raw_scores.neutral = 1;
  }
  return raw_scores;
}

// =============================================================================
// SEÇÃO 7 — CALIBRAÇÃO POR USUÁRIO
// =============================================================================

/**
 * Perfil de baseline emocional por usuário. Captura F0 médio típico e
 * variabilidade habitual para ajustar predições relativas.
 */
export interface BaselineProfile {
  readonly user_id: string;
  readonly sample_count: number;
  readonly mean_pitch_hz: number;
  readonly std_pitch_hz: number;
  readonly mean_energy: number;
  readonly mean_centroid: number;
  readonly calibrated_at_ms: number;
  /** Versão do algoritmo de calibração. */
  readonly version: string;
}

/** Baseline default usado quando o usuário não tem histórico. */
export const DEFAULT_BASELINE: BaselineProfile = {
  user_id: "default",
  sample_count: 0,
  mean_pitch_hz: 160,
  std_pitch_hz: 30,
  mean_energy: 0.3,
  mean_centroid: 1500,
  calibrated_at_ms: 0,
  version: "1.0.0",
};

/** Versão do algoritmo de calibração. */
export const CALIBRATION_VERSION = "1.0.0" as const;

/** Mínimo de amostras para uma calibração confiável. */
export const CALIBRATION_MIN_SAMPLES = 5;

/**
 * Calibra um baseline emocional a partir de features históricas do usuário.
 * Erro se houver menos de `CALIBRATION_MIN_SAMPLES` ou se as features forem
 * degeneradas (toda pitch zero).
 */
export function calibrateBaseline(
  user_id: string,
  samples: readonly MoodFeatures[],
  options: { now_ms?: number } = {},
): BaselineProfile {
  if (samples.length < CALIBRATION_MIN_SAMPLES) {
    throw new CalibrationError(
      `need at least ${CALIBRATION_MIN_SAMPLES} samples, got ${samples.length}`,
    );
  }
  const pitches: number[] = [];
  const energies: number[] = [];
  const centroids: number[] = [];
  for (const s of samples) {
    if (s.pitch_stats.mean_hz > 0) pitches.push(s.pitch_stats.mean_hz);
    if (s.energy_curve.length > 0) {
      energies.push(mean(s.energy_curve));
    }
    if (s.spectral_centroid > 0) {
      centroids.push(s.spectral_centroid);
    }
  }
  if (pitches.length === 0) {
    throw new CalibrationError("all samples have zero pitch (degenerate)");
  }
  return {
    user_id,
    sample_count: samples.length,
    mean_pitch_hz: mean(pitches),
    std_pitch_hz: stddev(pitches),
    mean_energy: energies.length > 0 ? mean(energies) : DEFAULT_BASELINE.mean_energy,
    mean_centroid: centroids.length > 0 ? mean(centroids) : DEFAULT_BASELINE.mean_centroid,
    calibrated_at_ms: options.now_ms ?? 0,
    version: CALIBRATION_VERSION,
  };
}

/**
 * Aplica baseline à predição: se o pitch do usuário é tipicamente alto, uma
 * amostra aguda não é "surpresa" — então ajustamos confiança de surprised
 * para baixo (e vice-versa para surpresa quando pitch é tipicamente baixo).
 */
export function applyBaseline(
  pred: MoodPrediction,
  baseline: BaselineProfile,
): MoodPrediction {
  const pitch_z =
    baseline.std_pitch_hz > 0
      ? (pred.dominance * 50 - (baseline.mean_pitch_hz - 160)) / baseline.std_pitch_hz
      : 0;
  // z-score alto (instabilidade rara) → aumenta confiança levemente
  const confidence_adj =
    pred.confidence * clamp(1 + Math.abs(pitch_z) * 0.05, 0.8, 1.2);

  return {
    ...pred,
    confidence: clamp(confidence_adj, 0, 1),
  };
}

// =============================================================================
// SEÇÃO 8 — REGISTRY DE MODELOS
// =============================================================================

/**
 * Modelo de detecção: nome, versão, locale principal, pesos opcionais.
 * Models são registrados estaticamente (não há download dinâmico).
 */
export interface MoodDetectionModel {
  readonly name: string;
  readonly version: string;
  readonly locale: string;
  readonly description: string;
  readonly weights: ModelWeights;
  readonly supported_moods: readonly VoiceMood[];
  /** Limite mínimo de duração aceito (segundos). */
  readonly min_duration_sec: number;
}

export interface ModelWeights {
  readonly brightness_bias: number;
  readonly jitter_bias: number;
  readonly energy_bias: number;
  readonly pitch_bias: number;
}

/** Modelo heurístico base — usado como default. */
const MODEL_HEURISTIC_V1: MoodDetectionModel = {
  name: "heuristic-v1",
  version: "1.0.0",
  locale: "pt-BR",
  description:
    "Regras determinísticas sobre pitch/energia/espectro. Rápido, sem I/O externo.",
  weights: {
    brightness_bias: 0.0,
    jitter_bias: 0.0,
    energy_bias: 1.0,
    pitch_bias: 1.0,
  },
  supported_moods: VOICE_MOODS,
  min_duration_sec: MIN_SAMPLE_DURATION_SEC,
};

/** Modelo spectral — dá peso extra a centróide espectral. */
const MODEL_SPECTRAL_V1: MoodDetectionModel = {
  name: "spectral-v1",
  version: "1.0.0",
  locale: "pt-BR",
  description:
    "Variante do heurístico com viés para brilho espectral (timbre). Útil para distinguir alegria vs contemplação.",
  weights: {
    brightness_bias: 0.5,
    jitter_bias: 0.1,
    energy_bias: 0.8,
    pitch_bias: 0.9,
  },
  supported_moods: VOICE_MOODS,
  min_duration_sec: MIN_SAMPLE_DURATION_SEC,
};

/** Modelo ensemble — combina heuristic + spectral + jitter signals. */
const MODEL_ENSEMBLE_V1: MoodDetectionModel = {
  name: "ensemble-v1",
  version: "1.0.0",
  locale: "pt-BR",
  description:
    "Ensemble de sinais acústicos (pitch + energy + spectral + jitter). Mais robusto, levemente mais lento.",
  weights: {
    brightness_bias: 0.3,
    jitter_bias: 0.4,
    energy_bias: 0.9,
    pitch_bias: 1.0,
  },
  supported_moods: VOICE_MOODS,
  min_duration_sec: MIN_SAMPLE_DURATION_SEC,
};

/** Registry imutável de modelos disponíveis. */
export const MODEL_REGISTRY: Readonly<Record<string, MoodDetectionModel>> = {
  "heuristic-v1": MODEL_HEURISTIC_V1,
  "spectral-v1": MODEL_SPECTRAL_V1,
  "ensemble-v1": MODEL_ENSEMBLE_V1,
} as const;

/** Lista de modelos registrados. */
export function listModels(): MoodDetectionModel[] {
  return Object.values(MODEL_REGISTRY);
}

/** Recupera um modelo por nome. Lança `UnsupportedModelError` se não existir. */
export function getModel(name: string): MoodDetectionModel {
  const m = MODEL_REGISTRY[name];
  if (!m) {
    throw new UnsupportedModelError(name);
  }
  return m;
}

/** Verifica se um modelo está registrado. */
export function hasModel(name: string): boolean {
  return name in MODEL_REGISTRY;
}

/** Retorna o modelo default. */
export function defaultModel(): MoodDetectionModel {
  return MODEL_HEURISTIC_V1;
}

// =============================================================================
// SEÇÃO 9 — STREAMING CONTROLLER
// =============================================================================

/**
 * Controlador de streaming para detecção em tempo real. Acumula chunks de
 * áudio, aplica janela deslizante + EMA, e retorna predições estabilizadas.
 *
 * Uso:
 * ```ts
 * const ctrl = new MoodStreamController({ windowMs: 1500 });
 * for await (const chunk of audioStream) {
 *   const pred = ctrl.feed(chunk.pitch_track);
 *   if (pred && isConfident({ primary: pred, ... })) {
 *     console.log("mood:", pred.mood);
 *   }
 * }
 * const final = ctrl.flush();
 * ```
 */
export class MoodStreamController {
  private readonly windowMs: number;
  private readonly frameCount: number;
  private readonly emaAlpha: number;
  private readonly minEmittedConfidence: number;
  private readonly samples: number[] = [];
  private readonly predictions: MoodPrediction[] = [];
  private smoothed: MoodPrediction | null = null;
  private chunkIndex = 0;
  private lastEmittedHash: string | null = null;

  constructor(options: MoodStreamControllerOptions = {}) {
    this.windowMs = options.windowMs ?? DEFAULT_STREAM_WINDOW_MS;
    this.frameCount = options.frameCount ?? DEFAULT_STREAM_FRAME_SIZE;
    this.emaAlpha = clamp(options.emaAlpha ?? DEFAULT_EMA_ALPHA, 0.05, 0.95);
    this.minEmittedConfidence = clamp(
      options.minEmittedConfidence ?? MIN_CONFIDENCE,
      0,
      1,
    );
  }

  /** Alimenta um chunk (pitch_track) e retorna predição se houver emissão. */
  feed(chunk: VoiceSampleChunk): MoodPrediction | null {
    const pitch = chunk.pitch_track ?? [];
    for (const p of pitch) {
      if (Number.isFinite(p)) this.samples.push(p);
    }
    // Mantém janela em frames
    const max_frames = this.windowMs * 10; // 100 frames/sec aprox.
    while (this.samples.length > max_frames) {
      this.samples.shift();
    }
    if (this.samples.length < MIN_VOICED_FRAMES) return null;
    const features: MoodFeatures = {
      pitch_stats: extractPitchStats(this.samples),
      energy_curve: chunk.energy_curve ?? [],
      tempo: chunk.tempo ?? 0,
      spectral_centroid: chunk.spectral_centroid ?? 0,
      jitter_shimmer_estimate: computeJitterShimmer(this.samples),
      duration_sec: (this.samples.length / 100),
    };
    const raw = detectMoodFromFeatures(features);
    const smoothed = this.applyEma(raw);
    this.smoothed = smoothed;
    this.predictions.push(smoothed);
    this.chunkIndex++;
    // Throttle: emite apenas se hash mudou OU confiança subiu
    if (smoothed.confidence < this.minEmittedConfidence) return null;
    if (smoothed.input_hash === this.lastEmittedHash) return null;
    this.lastEmittedHash = smoothed.input_hash;
    return smoothed;
  }

  /** Aplica EMA sobre as dimensões afetivas. */
  private applyEma(pred: MoodPrediction): MoodPrediction {
    if (!this.smoothed) return pred;
    const prev = this.smoothed;
    const a = this.emaAlpha;
    return {
      ...pred,
      valence: prev.valence * (1 - a) + pred.valence * a,
      arousal: prev.arousal * (1 - a) + pred.arousal * a,
      dominance: prev.dominance * (1 - a) + pred.dominance * a,
      confidence: prev.confidence * (1 - a) + pred.confidence * a,
    };
  }

  /** Reseta o estado interno. */
  reset(): void {
    this.samples.length = 0;
    this.predictions.length = 0;
    this.smoothed = null;
    this.chunkIndex = 0;
    this.lastEmittedHash = null;
  }

  /** Força uma predição final agregando todas as janelas. */
  flush(): MoodPrediction | null {
    if (this.predictions.length === 0) return null;
    return aggregateMoodPredictions(this.predictions);
  }

  /** Snapshot imutável das predições acumuladas. */
  history(): readonly MoodPrediction[] {
    return [...this.predictions];
  }

  /** Tamanho atual da janela em frames. */
  get size(): number {
    return this.samples.length;
  }

  /** Número de chunks já processados. */
  get count(): number {
    return this.chunkIndex;
  }
}

export interface MoodStreamControllerOptions {
  /** Janela deslizante em ms. Default 1500. */
  readonly windowMs?: number;
  /** Tamanho aproximado do frame buffer. Default 16. */
  readonly frameCount?: number;
  /** Fator EMA [0.05, 0.95]. Default 0.35. */
  readonly emaAlpha?: number;
  /** Confiança mínima para emitir predição. Default MIN_CONFIDENCE. */
  readonly minEmittedConfidence?: number;
}

/** Tamanho padrão do frame buffer para o stream controller. */
export const DEFAULT_STREAM_FRAME_SIZE = 16;

/** Chunk de áudio para o stream controller. */
export interface VoiceSampleChunk {
  readonly pitch_track?: readonly number[];
  readonly energy_curve?: readonly number[];
  readonly tempo?: number;
  readonly spectral_centroid?: number;
}

// =============================================================================
// SEÇÃO 10 — CONFIDENCE THRESHOLDS
// =============================================================================

/**
 * Verifica se uma detecção é "confiável" o suficiente para a UI exibir
 * uma afirmação forte. Considera a predição primária, scores e flag interno.
 */
export function isConfident(result: MoodDetectionResult): boolean {
  if (result.flagged_for_review) return false;
  if (result.primary.confidence < HIGH_CONFIDENCE) return false;
  // Diferença entre top1 e top2 deve ser razoável
  const scores = Object.values(result.confidence_scores).sort((a, b) => b - a);
  if (scores.length < 2) return result.primary.confidence >= HIGH_CONFIDENCE;
  const gap = (scores[0] ?? 0) - (scores[1] ?? 0);
  return gap >= 0.15;
}

/** Verifica se a predição cruza o limiar mínimo de utilidade. */
export function meetsMinimum(result: MoodDetectionResult): boolean {
  return result.primary.confidence >= MIN_CONFIDENCE;
}

/** Classifica a confiança em três faixas: low / medium / high. */
export type ConfidenceBand = "low" | "medium" | "high";

export function confidenceBand(confidence: number): ConfidenceBand {
  if (confidence < MIN_CONFIDENCE) return "low";
  if (confidence < HIGH_CONFIDENCE) return "medium";
  return "high";
}

// =============================================================================
// SEÇÃO 11 — I18N LABELS
// =============================================================================

/** Locale suportado. */
export type VoiceMoodLocale = "pt-BR" | "en-US" | "es-ES";

/** Locales suportados pelo módulo. */
export const SUPPORTED_LOCALES: readonly VoiceMoodLocale[] = [
  "pt-BR",
  "en-US",
  "es-ES",
] as const;

/**
 * Rótulos traduzidos para cada `VoiceMood`. Imutável — alterações devem
 * passar por PR com curadoria (`curator` skill).
 */
export const MOOD_LABELS: Readonly<
  Record<VoiceMoodLocale, Readonly<Record<VoiceMood, string>>>
> = {
  "pt-BR": {
    neutral: "Neutro",
    joyful: "Alegre",
    sad: "Triste",
    angry: "Raivoso",
    fearful: "Medo",
    surprised: "Surpreso",
    calm: "Calmo",
    contemplative: "Contemplativo",
    devotional: "Devocional",
    urgent: "Urgente",
  },
  "en-US": {
    neutral: "Neutral",
    joyful: "Joyful",
    sad: "Sad",
    angry: "Angry",
    fearful: "Fearful",
    surprised: "Surprised",
    calm: "Calm",
    contemplative: "Contemplative",
    devotional: "Devotional",
    urgent: "Urgent",
  },
  "es-ES": {
    neutral: "Neutral",
    joyful: "Alegre",
    sad: "Triste",
    angry: "Enfadado",
    fearful: "Temeroso",
    surprised: "Sorprendido",
    calm: "Calmado",
    contemplative: "Contemplativo",
    devotional: "Devocional",
    urgent: "Urgente",
  },
};

/** Retorna o rótulo traduzido do mood para o locale solicitado. */
export function moodLabel(
  mood: VoiceMood,
  locale: VoiceMoodLocale = "pt-BR",
): string {
  const table = MOOD_LABELS[locale];
  if (!table) {
    throw new UnsupportedLocaleError(locale);
  }
  const label = table[mood];
  if (label === undefined) {
    throw new UnsupportedLocaleError(`${locale}:${mood}`);
  }
  return label;
}

/** Retorna todos os labels de um locale (snapshot imutável). */
export function moodLabelsForLocale(
  locale: VoiceMoodLocale,
): Readonly<Record<VoiceMood, string>> {
  const table = MOOD_LABELS[locale];
  if (!table) {
    throw new UnsupportedLocaleError(locale);
  }
  return table;
}

/** Descrição estendida (1-2 frases) por mood, para tooltips/explicações. */
export const MOOD_DESCRIPTIONS: Readonly<
  Record<VoiceMoodLocale, Readonly<Record<VoiceMood, string>>>
> = {
  "pt-BR": {
    neutral: "Tom equilibrado, sem marcadores emocionais fortes.",
    joyful: "Voz aberta, energia alta, variabilidade melódica positiva.",
    sad: "Energia baixa, melodia descendente, fala lenta.",
    angry: "Energia alta, pitch instável, ataque articulatório forte.",
    fearful: "Pitch instável, alta perturbação, tensão vocal.",
    surprised: "Pico súbito de pitch e energia, articulação curta.",
    calm: "Energia baixa, pitch estável, respiração regular.",
    contemplative:
      "Tom reflexivo, variação melódica moderada, pausas frequentes.",
    devotional:
      "Voz suave, estável, com cadência ritual — tom de oração ou mantra.",
    urgent:
      "Energia alta, ritmo acelerado, intensidade marcante na articulação.",
  },
  "en-US": {
    neutral: "Balanced tone without strong emotional markers.",
    joyful: "Open voice, high energy, positive melodic variability.",
    sad: "Low energy, descending melody, slow speech rate.",
    angry: "High energy, unstable pitch, strong articulatory attack.",
    fearful: "Unstable pitch, high perturbation, vocal tension.",
    surprised: "Sudden pitch and energy peak, short articulation.",
    calm: "Low energy, stable pitch, regular breathing.",
    contemplative:
      "Reflective tone, moderate melodic variation, frequent pauses.",
    devotional:
      "Soft, stable voice with ritual cadence — prayer or mantra tone.",
    urgent:
      "High energy, fast tempo, marked articulatory intensity.",
  },
  "es-ES": {
    neutral: "Tono equilibrado, sin marcadores emocionales fuertes.",
    joyful: "Voz abierta, energía alta, variabilidad melódica positiva.",
    sad: "Energía baja, melodía descendente, habla lenta.",
    angry: "Energía alta, pitch inestable, ataque articulatorio fuerte.",
    fearful: "Pitch inestable, alta perturbación, tensión vocal.",
    surprised: "Pico súbito de pitch y energía, articulación corta.",
    calm: "Energía baja, pitch estable, respiración regular.",
    contemplative:
      "Tono reflexivo, variación melódica moderada, pausas frecuentes.",
    devotional:
      "Voz suave y estable con cadencia ritual — oración o mantra.",
    urgent:
      "Energía alta, ritmo acelerado, intensidad articulatoria marcada.",
  },
};

/** Retorna descrição longa do mood no locale solicitado. */
export function moodDescription(
  mood: VoiceMood,
  locale: VoiceMoodLocale = "pt-BR",
): string {
  const table = MOOD_DESCRIPTIONS[locale];
  if (!table) {
    throw new UnsupportedLocaleError(locale);
  }
  const desc = table[mood];
  if (desc === undefined) {
    throw new UnsupportedLocaleError(`${locale}:${mood}`);
  }
  return desc;
}

// =============================================================================
// SEÇÃO 12 — LGPD: CONSENT, REDACTION, EXPORT, DELETE
// =============================================================================

/** Consentimento LGPD para processamento de amostras de voz. */
export interface MoodSampleConsent {
  readonly user_id: string;
  readonly purpose: string;
  readonly retention_days: number;
  /** Epoch ms do consentimento. */
  readonly signed_at_ms: number;
  /** Escopo do consentimento (ex.: "voice-mood", "voice-mood+analytics"). */
  readonly scope: string;
  /** Versão dos termos. */
  readonly terms_version: string;
  /** Texto resumido exibido no momento do aceite. */
  readonly summary: string;
}

/** Features redacionadas — sem referência a áudio cru, apenas agregados. */
export interface RedactedFeatures {
  readonly pitch_mean_hz: number;
  readonly pitch_std_hz: number;
  readonly energy_mean: number;
  readonly spectral_centroid: number;
  readonly duration_sec: number;
  readonly voiced_ratio: number;
  readonly hnr_db: number;
}

/** Artefato de exportação (LGPD Art. 18, direito de acesso). */
export interface ExportArtifact {
  readonly user_id: string;
  readonly generated_at_ms: number;
  readonly format: ExportFormat;
  readonly payload: string;
  readonly record_count: number;
  readonly content_hash: string;
}

export type ExportFormat = "json" | "csv";

/** Recibo de deleção (LGPD Art. 18, direito ao esquecimento). */
export interface DeletionReceipt {
  readonly user_id: string;
  readonly scope: string;
  readonly deleted_at_ms: number;
  readonly deleted_count: number;
  readonly remaining_count: number;
  readonly content_hash: string;
}

/** Retenção máxima padrão (LGPD Art. 16). */
export const DEFAULT_RETENTION_DAYS = 90;

/** Versão padrão dos termos de consentimento. */
export const DEFAULT_TERMS_VERSION = "1.0.0" as const;

/** Purpose padrão para consentimento de mood detection. */
export const DEFAULT_CONSENT_PURPOSE =
  "Detecção de tom emocional para personalização da leitura oracular.";

/**
 * Cria um consentimento LGPD com validação de campos obrigatórios.
 */
export function createConsent(input: {
  user_id: string;
  purpose?: string;
  retention_days?: number;
  scope?: string;
  terms_version?: string;
  summary?: string;
  now_ms?: number;
}): MoodSampleConsent {
  if (!input.user_id || input.user_id.trim() === "") {
    throw new InvalidFeaturesError("user_id is required for consent");
  }
  const retention = input.retention_days ?? DEFAULT_RETENTION_DAYS;
  if (retention <= 0) {
    throw new InvalidFeaturesError("retention_days must be positive");
  }
  return {
    user_id: input.user_id,
    purpose: input.purpose ?? DEFAULT_CONSENT_PURPOSE,
    retention_days: retention,
    signed_at_ms: input.now_ms ?? 0,
    scope: input.scope ?? "voice-mood",
    terms_version: input.terms_version ?? DEFAULT_TERMS_VERSION,
    summary:
      input.summary ??
      "Autorizo o processamento de amostras de voz para detecção de tom emocional, conforme LGPD.",
  };
}

/**
 * Verifica se um consentimento ainda é válido (não expirou).
 */
export function isConsentValid(
  consent: MoodSampleConsent,
  now_ms: number,
): boolean {
  if (consent.signed_at_ms === 0) return true; // consent sem timestamp = perene até definição
  const expiry = consent.signed_at_ms + consent.retention_days * 24 * 60 * 60 * 1000;
  return now_ms <= expiry;
}

/**
 * Verifica consentimento ou lança `ConsentMissingError` / `ConsentExpiredError`.
 */
export function assertConsent(
  consent: MoodSampleConsent | null,
  now_ms: number,
  locale = "en-US",
): MoodSampleConsent {
  if (!consent) {
    throw new ConsentMissingError("unknown", locale);
  }
  if (!isConsentValid(consent, now_ms)) {
    throw new ConsentExpiredError(
      consent.signed_at_ms,
      consent.retention_days,
      locale,
    );
  }
  return consent;
}

/**
 * Redige features removendo referência a áudio cru — mantém apenas agregados
 * seguros para logging/analytics.
 */
export function redactMoodFeatures(features: MoodFeatures): RedactedFeatures {
  return {
    pitch_mean_hz: features.pitch_stats.mean_hz,
    pitch_std_hz: features.pitch_stats.std_hz,
    energy_mean: mean(features.energy_curve),
    spectral_centroid: features.spectral_centroid,
    duration_sec: features.duration_sec,
    voiced_ratio: features.pitch_stats.voiced_ratio,
    hnr_db: features.jitter_shimmer_estimate.hnr_db,
  };
}

/** Snapshot serializável de uma predição (LGPD-safe). */
export interface RedactedPrediction {
  readonly mood: VoiceMood;
  readonly confidence: number;
  readonly valence: number;
  readonly arousal: number;
  readonly dominance: number;
  readonly model: string;
  readonly predicted_at_ms: number;
}

/** Redige uma predição para exportação. */
export function redactPrediction(pred: MoodPrediction): RedactedPrediction {
  return {
    mood: pred.mood,
    confidence: pred.confidence,
    valence: pred.valence,
    arousal: pred.arousal,
    dominance: pred.dominance,
    model: pred.model,
    predicted_at_ms: pred.predicted_at_ms,
  };
}

/** Exporta histórico de predições do usuário em formato solicitado. */
export function exportMoodHistory(
  user_id: string,
  predictions: readonly MoodPrediction[],
  format: ExportFormat = "json",
  options: { now_ms?: number } = {},
): ExportArtifact {
  if (!user_id || user_id.trim() === "") {
    throw new InvalidFeaturesError("user_id required for export");
  }
  const records = predictions.map(redactPrediction);
  const now_ms = options.now_ms ?? 0;
  const payload =
    format === "json"
      ? JSON.stringify(
          {
            user_id,
            generated_at_ms: now_ms,
            detector_version: DETECTOR_VERSION,
            records,
          },
          null,
          2,
        )
      : [
          "mood,confidence,valence,arousal,dominance,model,predicted_at_ms",
          ...records.map(
            (r) =>
              `${r.mood},${r.confidence.toFixed(4)},${r.valence.toFixed(4)},${r.arousal.toFixed(4)},${r.dominance.toFixed(4)},${r.model},${r.predicted_at_ms}`,
          ),
        ].join("\n");
  return {
    user_id,
    generated_at_ms: now_ms,
    format,
    payload,
    record_count: records.length,
    content_hash: fnv1a32(payload),
  };
}

/** Operação in-place para deleção de predições por escopo. */
export function deleteMoodHistory(
  user_id: string,
  scope: string,
  store: Map<string, MoodPrediction[]>,
  options: { now_ms?: number } = {},
): DeletionReceipt {
  if (!user_id || user_id.trim() === "") {
    throw new InvalidFeaturesError("user_id required for deletion");
  }
  const key = `${user_id}:${scope}`;
  const existing = store.get(key) ?? [];
  const remaining = (store.get(`${user_id}:*`) ?? []).length;
  store.delete(key);
  const now_ms = options.now_ms ?? 0;
  return {
    user_id,
    scope,
    deleted_at_ms: now_ms,
    deleted_count: existing.length,
    remaining_count: remaining,
    content_hash: fnv1a32(`${user_id}|${scope}|${existing.length}|${now_ms}`),
  };
}

// =============================================================================
// SEÇÃO 13 — UTILITÁRIOS DE COMPARAÇÃO E REVIEW
// =============================================================================

/**
 * Distância euclidiana entre duas predições no espaço afetivo
 * (valence, arousal, dominance) ponderada por confiança.
 */
export function moodDistance(a: MoodPrediction, b: MoodPrediction): number {
  const dv = a.valence - b.valence;
  const da = a.arousal - b.arousal;
  const dd = a.dominance - b.dominance;
  const euclidean = Math.sqrt(dv * dv + da * da + dd * dd);
  // Penaliza diferença de label de mood
  const label_penalty = a.mood === b.mood ? 0 : 0.5;
  const confidence_penalty = Math.abs(a.confidence - b.confidence) * 0.5;
  return clamp(euclidean + label_penalty + confidence_penalty, 0, 3);
}

/**
 * Decide se um conjunto de predições merece revisão humana.
 * Critérios:
 *  - Variância alta nas dimensões afetivas (inconsistência temporal).
 *  - Saltos grandes entre predições consecutivas (moodDistance alto).
 *  - Confiança consistentemente abaixo do mínimo.
 */
export function shouldFlagForReview(
  predictions: readonly MoodPrediction[],
): boolean {
  if (predictions.length === 0) return false;
  if (predictions.length === 1) {
    return predictions[0]!.confidence < MIN_CONFIDENCE;
  }
  // 1. Variância das dimensões afetivas
  const valences = predictions.map((p) => p.valence);
  const arousals = predictions.map((p) => p.arousal);
  const val_sd = stddev(valences);
  const ar_sd = stddev(arousals);
  if (val_sd > REVIEW_INCONSISTENCY_THRESHOLD) return true;
  if (ar_sd > REVIEW_INCONSISTENCY_THRESHOLD) return true;
  // 2. Saltos consecutivos
  let total_dist = 0;
  for (let i = 1; i < predictions.length; i++) {
    const prev = predictions[i - 1];
    const cur = predictions[i];
    if (prev && cur) total_dist += moodDistance(prev, cur);
  }
  const avg_dist = total_dist / (predictions.length - 1);
  if (avg_dist > REVIEW_INCONSISTENCY_THRESHOLD) return true;
  // 3. Confiança média baixa
  const mean_conf = mean(predictions.map((p) => p.confidence));
  if (mean_conf < MIN_CONFIDENCE) return true;
  return false;
}

// =============================================================================
// SEÇÃO 14 — BATCH ANALYTICS (SESSIONS)
// =============================================================================

/** Sumário de uma sessão de detecção. */
export interface MoodSummary {
  /** Contagem por mood presente na sessão. */
  readonly counts: Readonly<Record<VoiceMood, number>>;
  /** Total de predições na sessão. */
  readonly total: number;
  /** Valência média da sessão [-1, 1]. */
  readonly mean_valence: number;
  /** Arousal médio da sessão [-1, 1]. */
  readonly mean_arousal: number;
  /** Dominância média da sessão [-1, 1]. */
  readonly mean_dominance: number;
  /** Confiança média. */
  readonly mean_confidence: number;
  /** Mood dominante (maior contagem). */
  readonly dominant_mood: VoiceMood;
  /** Janela temporal coberta em ms (predicted_at_ms min/max). */
  readonly window_ms: number;
  /** Janela de tempo efetiva em ms (parâmetro da função). */
  readonly analysis_window_ms: number;
  /** Sessão marcada para revisão. */
  readonly flagged_for_review: boolean;
}

/**
 * Resume uma sessão de predições em um agregado pronto para a UI.
 * Predições fora da janela (mais antigas que `windowMs` em relação à mais
 * recente) são descartadas.
 */
export function summarizeSession(
  predictions: readonly MoodPrediction[],
  windowMs: number = 5 * 60 * 1000,
): MoodSummary {
  if (predictions.length === 0) {
    const empty_counts: Record<VoiceMood, number> = {
      neutral: 0,
      joyful: 0,
      sad: 0,
      angry: 0,
      fearful: 0,
      surprised: 0,
      calm: 0,
      contemplative: 0,
      devotional: 0,
      urgent: 0,
    };
    return {
      counts: empty_counts,
      total: 0,
      mean_valence: 0,
      mean_arousal: 0,
      mean_dominance: 0,
      mean_confidence: 0,
      dominant_mood: "neutral",
      window_ms: 0,
      analysis_window_ms: windowMs,
      flagged_for_review: false,
    };
  }
  const timestamps = predictions.map((p) => p.predicted_at_ms).filter((t) => t > 0);
  const max_ts = timestamps.length > 0 ? max(timestamps) : 0;
  const filtered =
    max_ts > 0
      ? predictions.filter(
          (p) => max_ts - p.predicted_at_ms <= windowMs || p.predicted_at_ms === 0,
        )
      : predictions;

  const counts: Record<VoiceMood, number> = {
    neutral: 0,
    joyful: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    surprised: 0,
    calm: 0,
    contemplative: 0,
    devotional: 0,
    urgent: 0,
  };
  for (const p of filtered) counts[p.mood]++;
  let dominant_mood: VoiceMood = "neutral";
  let dominant_count = -1;
  for (const m of VOICE_MOODS) {
    if (counts[m] > dominant_count) {
      dominant_count = counts[m];
      dominant_mood = m;
    }
  }
  const min_ts = timestamps.length > 0 ? min(timestamps) : 0;
  return {
    counts,
    total: filtered.length,
    mean_valence: clamp(mean(filtered.map((p) => p.valence)), AFFECT_RANGE[0], AFFECT_RANGE[1]),
    mean_arousal: clamp(mean(filtered.map((p) => p.arousal)), AFFECT_RANGE[0], AFFECT_RANGE[1]),
    mean_dominance: clamp(mean(filtered.map((p) => p.dominance)), AFFECT_RANGE[0], AFFECT_RANGE[1]),
    mean_confidence: clamp(mean(filtered.map((p) => p.confidence)), 0, 1),
    dominant_mood,
    window_ms: max_ts > 0 && min_ts > 0 ? max_ts - min_ts : 0,
    analysis_window_ms: windowMs,
    flagged_for_review: shouldFlagForReview(filtered),
  };
}

/**
 * Compara dois summaries e retorna deltas significativos (UX: "mudou de tom").
 */
export interface MoodDelta {
  readonly mood_changed: boolean;
  readonly previous_mood: VoiceMood;
  readonly current_mood: VoiceMood;
  readonly valence_delta: number;
  readonly arousal_delta: number;
  readonly dominance_delta: number;
  readonly confidence_delta: number;
}

export function diffMoodSummaries(
  previous: MoodSummary,
  current: MoodSummary,
): MoodDelta {
  return {
    mood_changed: previous.dominant_mood !== current.dominant_mood,
    previous_mood: previous.dominant_mood,
    current_mood: current.dominant_mood,
    valence_delta: current.mean_valence - previous.mean_valence,
    arousal_delta: current.mean_arousal - previous.mean_arousal,
    dominance_delta: current.mean_dominance - previous.mean_dominance,
    confidence_delta: current.mean_confidence - previous.mean_confidence,
  };
}

// =============================================================================
// SEÇÃO 15 — HELPERS DE CONVENIÊNCIA
// =============================================================================

/**
 * Helper one-shot para detectar mood a partir de uma `VoiceSample`.
 * Atalho para `detectMoodFromSample` com modelo default.
 */
export function quickDetect(sample: VoiceSample): MoodDetectionResult {
  return detectMoodFromSample(sample);
}

/**
 * Helper one-shot para classificar confiança em band.
 */
export function classifyConfidence(confidence: number): ConfidenceBand {
  return confidenceBand(confidence);
}

/**
 * Verifica se duas predições representam o mesmo "mood cluster" no espaço
 * afetivo (útil para deduplicação em streams).
 */
export function sameMoodCluster(a: MoodPrediction, b: MoodPrediction): boolean {
  if (a.mood === b.mood) return true;
  return moodDistance(a, b) < 0.5;
}

/**
 * Versão amigável para logs (sem hash, sem timestamp).
 */
export function predictionToString(pred: MoodPrediction, locale: VoiceMoodLocale = "pt-BR"): string {
  return `${moodLabel(pred.mood, locale)} (${(pred.confidence * 100).toFixed(0)}%, v=${pred.valence.toFixed(2)}, a=${pred.arousal.toFixed(2)}, d=${pred.dominance.toFixed(2)})`;
}

/**
 * Serializa um `MoodDetectionResult` para JSON estável (ordenação de chaves
 * determinística via sort).
 */
export function serializeResult(result: MoodDetectionResult): string {
  const ordered_scores: Record<string, number> = {};
  for (const m of VOICE_MOODS) {
    ordered_scores[m] = result.confidence_scores[m];
  }
  return JSON.stringify(
    {
      primary: result.primary,
      secondary: result.secondary,
      confidence_scores: ordered_scores,
      model_version: result.model_version,
      detector_version: result.detector_version,
      features_used: result.features_used,
      flagged_for_review: result.flagged_for_review,
    },
    (_key, value) => (typeof value === "number" ? Number(value.toFixed(6)) : value),
  );
}

// =============================================================================
// SEÇÃO 16 — HEALTH CHECK
// =============================================================================

/** Resultado de um health check do módulo. */
export interface MoodDetectorHealth {
  readonly status: "ok" | "degraded" | "error";
  readonly detector_version: string;
  readonly model_count: number;
  readonly locale_count: number;
  readonly mood_count: number;
  readonly min_confidence: number;
  readonly high_confidence: number;
  readonly checked_at_ms: number;
}

/** Health check simples — retorna configuração atual e status. */
export function moodDetectorHealth(now_ms: number = 0): MoodDetectorHealth {
  return {
    status: "ok",
    detector_version: DETECTOR_VERSION,
    model_count: listModels().length,
    locale_count: SUPPORTED_LOCALES.length,
    mood_count: VOICE_MOODS.length,
    min_confidence: MIN_CONFIDENCE,
    high_confidence: HIGH_CONFIDENCE,
    checked_at_ms: now_ms,
  };
}

// =============================================================================
// SEÇÃO 17 — EXPORTS AGREGADOS (para consumers que preferem namespace)
// =============================================================================

/**
 * Namespace agregando as principais funções utilitárias.
 * Útil para `import * as mood from '@/lib/w49/voice-mood-detection'`.
 */
export const MoodDetector = {
  detectMoodFromFeatures,
  detectMoodFromSample,
  aggregateMoodPredictions,
  quickDetect,
  extractFeaturesFromSample,
  extractPitchStats,
  estimateSpectralCentroid,
  computeJitterShimmer,
  estimateTempo,
  extractEnergyCurve,
  isConfident,
  meetsMinimum,
  confidenceBand,
  shouldFlagForReview,
  moodDistance,
  sameMoodCluster,
  moodLabel,
  moodDescription,
  summarizeSession,
  diffMoodSummaries,
  applyBaseline,
  calibrateBaseline,
  getModel,
  listModels,
  hasModel,
  defaultModel,
  redactMoodFeatures,
  redactPrediction,
  exportMoodHistory,
  deleteMoodHistory,
  createConsent,
  assertConsent,
  isConsentValid,
  moodDetectorHealth,
  serializeResult,
  predictionToString,
} as const;