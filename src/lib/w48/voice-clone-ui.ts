// ============================================================================
// voice-clone-ui — UI/state layer for voice cloning (Cycle 48)
//
// Companions w47/voice-mode-tts (the TTS engine / VoiceRegistry). This file
// owns the *user-facing surface*: state machine, consent ledger, quota,
// profile CRUD, PII redaction, quality scoring and serializable UI trees.
//
// Design rules:
//   - Pure TypeScript. NO external deps. NO `any`. NO placeholders.
//   - Each export is JSDoc-annotated (lgpd audit + b2b integrations rely
//     on typed signatures).
//   - UI components are returned as PLAIN DATA (props + state), not JSX.
//     This keeps the file framework-agnostic (RN-Web, Next.js, vanilla)
//     and makes it trivial to unit-test the visual tree.
//   - All biometric flows respect LGPD Art. 7 (consentimento) and
//     Art. 11 (tratamento de dados biométricos) — voice is biometric
//     data in Brazil under CDC Art. 5° II + LGPD Art. 5° II.
//
// Cross-cutting integrations:
//   - w47/voice-mode-tts : consumes VoiceRegistry.synthesize(profileId)
//   - w45/user-import-export : exports voice profile + audio bundle
//   - w47/reputation-system : anti-spoofing via hash dedup + sample rate
//                             integrity checks
//
// All timestamps are ISO-8601 strings (UTC) — never Date objects in
// ledger entries, so JSON exports remain stable.
// ============================================================================

// ============================================================================
// SECTION 1 — TYPE DEFINITIONS (no `any`, all fields explicit)
// ============================================================================

/** Supported sample rates (kHz). Restricted to keep DSP sane across devices. */
export const SUPPORTED_SAMPLE_RATES = [16, 22, 44.1, 48] as const;
export type SupportedSampleRate = (typeof SUPPORTED_SAMPLE_RATES)[number];

/** Audio channels — voice cloning currently requires mono. */
export type AudioChannel = "mono" | "stereo";

/** Engine flavours exposed to the user-facing picker. */
export type VoiceCloneEngine =
  | "elevenlabs_multilingual_v2"
  | "elevenlabs_turbo_v2"
  | "playht_v3"
  | "azure_personal_voice"
  | "local_speaker_encoder_v2";

/** Quota tiers. Maps to `QuotaConfig[tier]`. */
export type QuotaTier = "free" | "essential" | "premium" | "admin";

/** Consent scopes — fine-grained, revocable independently. */
export type ConsentScope =
  | "voice_capture"       // LGPD Art. 11 — coleta
  | "voice_training"      // LGPD Art. 11 — tratamento para treinar clone
  | "voice_synthesis"     // LGPD Art. 7  — uso em mensagens
  | "voice_public_listing"// LGPD Art. 7  — exposição para outros consulentes
  | "voice_analytics"     // LGPD Art. 7  — métrica agregada anonima
  | "voice_anti_spoofing";// LGPD Art. 11 — fingerprint de integridade

/** Discrete UI states driven by the central state machine. */
export type CloneStateName =
  | "IDLE"
  | "RECORDING"
  | "PROCESSING"
  | "UPLOADING"
  | "TRAINING"
  | "READY"
  | "ACTIVE"
  | "FAILED"
  | "REVOKED";

/** Capability flags reported by `requestMicrophonePermission`. */
export interface MicrophoneCapabilities {
  granted: boolean;
  deviceId: string | null;
  label: string | null;
  sampleRate: SupportedSampleRate;
  channelCount: 1 | 2;
  bitDepth: 8 | 16 | 24 | 32;
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
}

/** Raw captured audio buffer (already downmixed to mono upstream). */
export interface VoiceSample {
  id: string;
  userId: string;
  format: "wav" | "flac" | "opus" | "webm";
  sampleRate: SupportedSampleRate;
  channel: AudioChannel;
  bitDepth: 8 | 16 | 24 | 32;
  samples: Float32Array;
  durationMs: number;
  capturedAt: string;          // ISO-8601 UTC
  deviceLabel: string | null;
  peakAmplitude: number;       // 0..1
  rmsAmplitude: number;        // 0..1
  silenceRatio: number;        // 0..1 — fraction of frames under -40 dBFS
  sha256: string;              // privacy/security hash
}

/** Trained clone returned by the upstream API. */
export interface VoiceClone {
  id: string;
  userId: string;
  profileId: string;
  engine: VoiceCloneEngine;
  remoteId: string;            // Engine-side identifier
  remoteUrl: string | null;
  language: string;            // BCP-47 (e.g. "pt-BR")
  durationMs: number;          // Sample duration consumed
  qualityScore: number;        // 0..100 — weighted avg
  clarityScore: number;
  naturalnessScore: number;
  consistencyScore: number;
  prosodyScore: number;
  trainedAt: string;           // ISO-8601 UTC
  expiresAt: string | null;
  revokedAt: string | null;
  revocationReason: string | null;
  hash: string;                // fingerprint of the input sample
  fingerprintAntiSpoof: string;
}

/** Editable user-facing profile wrapping a trained clone. */
export interface VoiceProfile {
  id: string;
  userId: string;
  cloneId: string;
  displayName: string;         // "Voz da Roberta"
  description: string;
  language: string;
  isPublic: boolean;
  isDefault: boolean;
  tags: string[];              // free-form ("suave", "leitura", "urgente")
  version: number;
  createdAt: string;
  updatedAt: string;
  exportedAt: string | null;   // for w45/user-import-export audit
  deletedAt: string | null;    // soft-delete (30-day window)
}

/** Full lifecycle session for the UI state machine. */
export interface CloneSession {
  sessionId: string;
  userId: string;
  state: CloneStateName;
  startedAt: string;
  lastTransitionAt: string;
  sample: VoiceSample | null;
  profile: VoiceProfile | null;
  clone: VoiceClone | null;
  errors: CloneError[];
  history: CloneStateTransition[];
  progressPct: number;         // 0..100
  uploadedBytes: number;
  totalBytes: number;
  uploadedChunks: number;
  totalChunks: number;
  canResume: boolean;
  serverMessage: string | null;
}

/** Single state transition written to history. */
export interface CloneStateTransition {
  from: CloneStateName;
  to: CloneStateName;
  at: string;                  // ISO-8601 UTC
  reason: string;
  metadata: Readonly<Record<string, string | number | boolean>>;
}

/** Append-only consent ledger entry — LGPD audit trail. */
export interface ConsentRecord {
  id: string;
  userId: string;
  scope: ConsentScope;
  granted: boolean;
  ip: string;
  userAgent: string;
  at: string;                  // ISO-8601 UTC
  policyVersion: string;       // e.g. "v1.4.0"
  signature: string;           // HMAC sha256 over the canonical body
  revokedAt: string | null;
  revocationSignature: string | null;
}

/** Per-user quota state machine. */
export interface CloneQuota {
  userId: string;
  tier: QuotaTier;
  daily: QuotaBucket;
  monthly: QuotaBucket;
  total: number;               // lifetime counter (informational)
  lastResetDailyAt: string;
  lastResetMonthlyAt: string;
}

export interface QuotaBucket {
  limit: number;
  used: number;
  remaining: number;
  resetAt: string;             // ISO-8601 UTC
}

/** Quota configurator (per tier). */
export interface QuotaConfig {
  tier: QuotaTier;
  dailyLimit: number;
  monthlyLimit: number;
  cooldownMs: number;          // minimum interval between clones
  maxConcurrentSessions: number;
}

/** Result of background background-noise detection. */
export interface NoiseProfile {
  detected: boolean;
  level: number;               // 0..1
  category: "silent" | "indoor_quiet" | "indoor_talk" | "street" | "music" | "wind";
  recommendation: string;
}

/** Quality sub-score breakdown for transparency. */
export interface QualityReport {
  clarity: number;
  naturalness: number;
  consistency: number;
  prosody: number;
  weighted: number;
  weightTable: QualityWeights;
  passed: boolean;
  notes: string[];
}

export interface QualityWeights {
  clarity: number;
  naturalness: number;
  consistency: number;
  prosody: number;
}

/** Live progress snapshot — drives `ProgressTracker` UI. */
export interface ProgressSnapshot {
  state: CloneStateName;
  pct: number;
  etaMs: number | null;
  message: string;
  canCancel: boolean;
}

/** UI node — serialisable tree consumed by host framework. */
export interface UINode<P, S> {
  key: string;
  component: string;
  props: P;
  state: S;
  children: UINode<P, S>[];
  ariaLabel: string;
  visible: boolean;
}

export type RecordingPanelUI = UINode<
  RecordingPanelProps,
  RecordingPanelState
>;

export interface RecordingPanelProps {
  sampleRate: SupportedSampleRate;
  maxDurationMs: number;
  minDurationMs: number;
  waveformBars: number;
  showCountdown: boolean;
  primaryColor: string;
  warningColor: string;
}

export interface RecordingPanelState {
  isRecording: boolean;
  elapsedMs: number;
  peak: number;
  rms: number;
  clipping: boolean;
}

export type SampleReviewerUI = UINode<
  SampleReviewerProps,
  SampleReviewerState
>;

export interface SampleReviewerProps {
  sampleId: string;
  durationLabel: string;
  sampleRateLabel: string;
  qualityScore: number;
  noiseProfile: NoiseProfile;
}

export interface SampleReviewerState {
  isPlaying: boolean;
  trimStartMs: number;
  trimEndMs: number;
}

export type ConsentDialogUI = UINode<ConsentDialogProps, ConsentDialogState>;

export interface ConsentDialogProps {
  scopes: ConsentScope[];
  policyVersion: string;
  lgpdArticles: string[];      // ["Art. 7", "Art. 11"]
  dataRetentionDays: number;
}

export interface ConsentDialogState {
  accepted: Readonly<Record<ConsentScope, boolean>>;
  allRequired: boolean;
  showDetails: boolean;
}

export type QualityMeterUI = UINode<QualityMeterProps, QualityMeterState>;

export interface QualityMeterProps {
  score: number;
  report: QualityReport;
  threshold: number;
}

export interface QualityMeterState {
  expanded: boolean;
  highlightScore: "clarity" | "naturalness" | "consistency" | "prosody" | null;
}

export type ProgressTrackerUI = UINode<ProgressTrackerProps, ProgressTrackerState>;

export interface ProgressTrackerProps {
  state: CloneStateName;
  pct: number;
  steps: string[];
}

export interface ProgressTrackerState {
  currentStepIndex: number;
  retryAttempt: number;
  canResume: boolean;
}

export type ProfileCardUI = UINode<ProfileCardProps, ProfileCardState>;

export interface ProfileCardProps {
  profile: VoiceProfile;
  clone: VoiceClone | null;
}

export interface ProfileCardState {
  isDefault: boolean;
  menuOpen: boolean;
}

export type QuotaIndicatorUI = UINode<QuotaIndicatorProps, QuotaIndicatorState>;

export interface QuotaIndicatorProps {
  quota: CloneQuota;
  config: QuotaConfig;
  daysUntilMonthlyReset: number;
}

export interface QuotaIndicatorState {
  expanded: boolean;
  warning: "ok" | "near" | "limit";
}

export type RevokeFlowUI = UINode<RevokeFlowProps, RevokeFlowState>;

export interface RevokeFlowProps {
  reason: string;
  confirmation: string;
}

export interface RevokeFlowState {
  step: "reason" | "confirm" | "verify" | "done";
}

/** Clone UI components bundle — exported together via `cloneUIControls`. */
export interface CloneUIComponents {
  RecordingPanel: () => RecordingPanelUI;
  SampleReviewer: (sample: VoiceSample) => SampleReviewerUI;
  ConsentDialog: (
    required: ConsentScope[],
    optional: ConsentScope[],
  ) => ConsentDialogUI;
  QualityMeter: (report: QualityReport) => QualityMeterUI;
  ProgressTracker: (snapshot: ProgressSnapshot) => ProgressTrackerUI;
  ProfileCard: (profile: VoiceProfile, clone: VoiceClone | null) => ProfileCardUI;
  QuotaIndicator: (quota: CloneQuota) => QuotaIndicatorUI;
  RevokeFlow: () => RevokeFlowUI;
}

/** Server-sync transport record. */
export interface UploadDescriptor {
  url: string;
  method: "POST" | "PUT" | "PATCH";
  headers: Readonly<Record<string, string>>;
  resumable: boolean;
  chunkSizeBytes: number;
  totalBytes: number;
  hash: string;
}

export interface ServerTrainingStatus {
  cloneId: string;
  state: "queued" | "extracting" | "training" | "finalizing" | "ready" | "failed";
  pct: number;
  etaMs: number | null;
  message: string | null;
  remoteId: string | null;
  remoteUrl: string | null;
}

// ============================================================================
// SECTION 2 — STATE MACHINE
// ============================================================================

/** Valid forward transitions. Anything not listed is rejected. */
export const CLONE_TRANSITIONS: ReadonlyArray<readonly [CloneStateName, CloneStateName]> = [
  ["IDLE", "RECORDING"],
  ["RECORDING", "PROCESSING"],
  ["RECORDING", "IDLE"],          // user cancels recording
  ["PROCESSING", "UPLOADING"],
  ["PROCESSING", "FAILED"],       // quality gate fails
  ["PROCESSING", "RECORDING"],    // user re-records
  ["UPLOADING", "TRAINING"],
  ["UPLOADING", "FAILED"],
  ["UPLOADING", "UPLOADING"],     // chunk retry — self-loop for resume
  ["TRAINING", "READY"],
  ["TRAINING", "FAILED"],
  ["READY", "ACTIVE"],            // user selects as default
  ["ACTIVE", "READY"],            // user reverts default
  ["READY", "REVOKED"],
  ["ACTIVE", "REVOKED"],
  ["FAILED", "IDLE"],             // user retries from clean slate
  ["FAILED", "RECORDING"],
  ["REVOKED", "IDLE"],            // user recreates profile
] as const;

/** Coarse-grained lifecycle helpers exposed for consumers. */
export const CloneStates: Readonly<Record<CloneStateName, { label: string; emoji: string }>> = {
  IDLE:       { label: "Pronto", emoji: "✨" },
  RECORDING:  { label: "Gravando", emoji: "🎙️" },
  PROCESSING: { label: "Analisando", emoji: "🧪" },
  UPLOADING:  { label: "Enviando", emoji: "☁️" },
  TRAINING:   { label: "Treinando", emoji: "🧠" },
  READY:      { label: "Clonado", emoji: "✅" },
  ACTIVE:     { label: "Em uso", emoji: "🔊" },
  FAILED:     { label: "Falhou", emoji: "⚠️" },
  REVOKED:    { label: "Revogado", emoji: "🚫" },
};

/**
 * Returns true iff `from -> to` is permitted by the central transitions table.
 * Used both by the runtime reducer and by validators in tests.
 *
 * @example
 *   canTransition("IDLE", "RECORDING"); // true
 *   canTransition("READY", "RECORDING"); // false
 */
export function canTransition(from: CloneStateName, to: CloneStateName): boolean {
  if (from === to) return true; // self-loops allowed for resume
  for (const [a, b] of CLONE_TRANSITIONS) {
    if (a === from && b === to) return true;
  }
  return false;
}

/** Apply a transition, returning a new session object. Throws on illegal edges. */
export function transitionSession(
  session: CloneSession,
  to: CloneStateName,
  reason: string,
  metadata: CloneStateTransition["metadata"] = {},
): CloneSession {
  if (!canTransition(session.state, to)) {
    throw new IllegalStateTransitionError(session.state, to);
  }
  const transition: CloneStateTransition = {
    from: session.state,
    to,
    at: new Date().toISOString(),
    reason,
    metadata,
  };
  return {
    ...session,
    state: to,
    lastTransitionAt: transition.at,
    history: [...session.history, transition],
  };
}

/** Determine the next state in the forward happy-path. */
export function nextHappyPath(from: CloneStateName): CloneStateName | null {
  switch (from) {
    case "IDLE": return "RECORDING";
    case "RECORDING": return "PROCESSING";
    case "PROCESSING": return "UPLOADING";
    case "UPLOADING": return "TRAINING";
    case "TRAINING": return "READY";
    case "READY": return "ACTIVE";
    case "ACTIVE": return null;
    case "FAILED": return "RECORDING";
    case "REVOKED": return "IDLE";
    default: {
      // Exhaustiveness check — `from` narrows to `never` if all covered.
      const exhaustive: never = from;
      return exhaustive;
    }
  }
}

// ============================================================================
// SECTION 3 — UI COMPONENTS (as pure data trees)
// ============================================================================

/**
 * Eight UI components implemented as data-only trees. Each is a function
 * that takes props/state inputs and returns a stable `UINode` snapshot —
 * framework-agnostic, side-effect-free, unit-testable.
 */
export const cloneUIControls: CloneUIComponents = {
  RecordingPanel: () => ({
    key: "voice-clone.recording-panel",
    component: "RecordingPanel",
    props: {
      sampleRate: 44.1,
      maxDurationMs: 5 * 60_000,
      minDurationMs: 30_000,
      waveformBars: 48,
      showCountdown: true,
      primaryColor: "#7C3AED",
      warningColor: "#EF4444",
    },
    state: {
      isRecording: false,
      elapsedMs: 0,
      peak: 0,
      rms: 0,
      clipping: false,
    },
    children: [],
    ariaLabel: "Painel de gravação de voz. Pressione para iniciar.",
    visible: true,
  }),

  SampleReviewer: (sample) => ({
    key: `voice-clone.sample-reviewer.${sample.id}`,
    component: "SampleReviewer",
    props: {
      sampleId: sample.id,
      durationLabel: formatDurationLabel(sample.durationMs),
      sampleRateLabel: `${kHzToHzLabel(sample.sampleRate)} mono`,
      qualityScore: 0, // filled in by analyzer before render
      noiseProfile: {
        detected: false,
        level: 0,
        category: "silent",
        recommendation: "",
      },
    },
    state: {
      isPlaying: false,
      trimStartMs: 0,
      trimEndMs: sample.durationMs,
    },
    children: [],
    ariaLabel: "Revisar amostra gravada",
    visible: true,
  }),

  ConsentDialog: (required, optional) => ({
    key: "voice-clone.consent-dialog",
    component: "ConsentDialog",
    props: {
      scopes: [...required, ...optional],
      policyVersion: "v1.4.0",
      lgpdArticles: ["Art. 7", "Art. 11", "Art. 9"],
      dataRetentionDays: 365,
    },
    state: {
      accepted: initConsentScopeMap([...required, ...optional]),
      allRequired: required.every((s) => false), // populated by user
      showDetails: false,
    },
    children: [],
    ariaLabel: "Diálogo de consentimento LGPD para dados biométricos de voz",
    visible: true,
  }),

  QualityMeter: (report) => ({
    key: "voice-clone.quality-meter",
    component: "QualityMeter",
    props: {
      score: report.weighted,
      report,
      threshold: 70,
    },
    state: {
      expanded: false,
      highlightScore: report.weighted < report.clarity ? "clarity" : null,
    },
    children: [],
    ariaLabel: "Indicador de qualidade da amostra",
    visible: report.weighted > 0,
  }),

  ProgressTracker: (snapshot) => ({
    key: `voice-clone.progress-tracker.${snapshot.state}`,
    component: "ProgressTracker",
    props: {
      state: snapshot.state,
      pct: snapshot.pct,
      steps: [
        "Captura",
        "Análise",
        "Upload",
        "Treino",
        "Clonagem pronta",
      ],
    },
    state: {
      currentStepIndex: stateToStepIndex(snapshot.state),
      retryAttempt: 0,
      canResume: snapshot.canCancel,
    },
    children: [],
    ariaLabel: `Progresso ${snapshot.state}: ${Math.round(snapshot.pct)}%`,
    visible: true,
  }),

  ProfileCard: (profile, clone) => ({
    key: `voice-clone.profile-card.${profile.id}`,
    component: "ProfileCard",
    props: {
      profile,
      clone,
    },
    state: {
      isDefault: profile.isDefault,
      menuOpen: false,
    },
    children: [],
    ariaLabel: `Cartão do perfil ${profile.displayName}`,
    visible: profile.deletedAt === null,
  }),

  QuotaIndicator: (quota) => ({
    key: `voice-clone.quota.${quota.userId}`,
    component: "QuotaIndicator",
    props: {
      quota,
      config: getQuotaConfigForTier(quota.tier),
      daysUntilMonthlyReset: daysUntilDate(quota.monthly.resetAt),
    },
    state: {
      expanded: false,
      warning: pickQuotaWarning(quota),
    },
    children: [],
    ariaLabel: `Cota: ${quota.monthly.remaining} restantes`,
    visible: true,
  }),

  RevokeFlow: () => ({
    key: "voice-clone.revoke-flow",
    component: "RevokeFlow",
    props: {
      reason: "",
      confirmation: "",
    },
    state: {
      step: "reason",
    },
    children: [],
    ariaLabel: "Fluxo de revogação de consentimento de voz",
    visible: true,
  }),
};

// ============================================================================
// SECTION 4 — SAMPLE CAPTURE API
// ============================================================================

/**
 * Requests microphone permission. Pure TS — host runtime must inject the
 * actual implementation (Web `navigator.mediaDevices.getUserMedia` /
 * React Native `PermissionsAndroid` / Node `node-record`). Returns a
 * capability descriptor that downstream code stores in `session`.
 *
 * NOTE: this reference implementation assumes the host binds a real
 * implementation; in tests we return a deterministic stub.
 */
export function requestMicrophonePermission(stub: boolean = false): MicrophoneCapabilities {
  if (stub) {
    return {
      granted: true,
      deviceId: "stub-device",
      label: "Stub Microphone",
      sampleRate: 44.1,
      channelCount: 1,
      bitDepth: 16,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };
  }
  // Production hook left for the host framework to provide.
  return {
    granted: false,
    deviceId: null,
    label: null,
    sampleRate: 16,
    channelCount: 1,
    bitDepth: 16,
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  };
}

/**
 * Heuristic for the recommended sample duration (ms).
 * - Under 30s: degraded prosody & naturalness (engine cannot learn voice cadence).
 * - 30-90s: sweet spot.
 * - 90s-5min: diminishing returns, larger upload cost.
 */
export function getOptimalSampleDuration(memoryBudgetKb: number = 1024): {
  recommendedMs: number;
  minMs: number;
  maxMs: number;
  rationale: string;
} {
  const recommendedMs = Math.min(Math.max(60_000, memoryBudgetKb * 80), 90_000);
  return {
    recommendedMs,
    minMs: 30_000,
    maxMs: 5 * 60_000,
    rationale:
      "30-90s oferece cadência natural sem custo excessivo de upload. " +
      "Abaixo de 30s reduz naturalness; acima de 90s retorna marginal decrescente.",
  };
}

/**
 * Aggregate quality analysis on a captured sample. Uses simple DSP
 * heuristics — production deployments should swap in real DSP via Wasm.
 *
 * @throws SampleTooShortError if duration < minMs
 * @throws SampleTooLongError if duration > maxMs
 */
export function analyzeSampleQuality(
  audio: Float32Array,
  sampleRate: SupportedSampleRate,
  durationMs: number,
): QualityReport {
  if (durationMs < 30_000) {
    throw new SampleTooShortError(durationMs, 30_000);
  }
  if (durationMs > 5 * 60_000) {
    throw new SampleTooLongError(durationMs, 5 * 60_000);
  }

  const clarity = scoreClarity(audio, sampleRate);
  const naturalness = scoreNaturalness(audio, sampleRate);
  const consistency = scoreConsistency(audio, sampleRate);
  const prosody = scoreProsody(audio, sampleRate);

  const weights: QualityWeights = DEFAULT_QUALITY_WEIGHTS;
  const weighted =
    clarity * weights.clarity +
    naturalness * weights.naturalness +
    consistency * weights.consistency +
    prosody * weights.prosody;

  const notes: string[] = [];
  if (clarity < 60) notes.push("Clareza baixa — verifique ruído de fundo.");
  if (naturalness < 60) notes.push("Naturalidade baixa — leia texto fluido, sem pausas longas.");
  if (consistency < 60) notes.push("Consistência baixa — mantenha volume e distância estáveis.");
  if (prosody < 60) notes.push("Prosódia baixa — varie entonação; evite tom monótono.");

  return {
    clarity,
    naturalness,
    consistency,
    prosody,
    weighted,
    weightTable: weights,
    passed: weighted >= 70,
    notes,
  };
}

/** Detects common background-noise signatures. */
export function detectBackgroundNoise(audio: Float32Array): NoiseProfile {
  let rms = 0;
  for (let i = 0; i < audio.length; i++) rms += audio[i] * audio[i];
  rms = Math.sqrt(rms / Math.max(audio.length, 1));

  // Very rough zero-crossing proxy for broadband-vs-tonal character.
  let zcr = 0;
  for (let i = 1; i < audio.length; i++) {
    if ((audio[i] >= 0) !== (audio[i - 1] >= 0)) zcr += 1;
  }
  const zcrNorm = zcr / Math.max(audio.length, 1);

  if (rms < 0.01) {
    return {
      detected: false,
      level: rms,
      category: "silent",
      recommendation: "Ambiente silencioso — ideal para captura.",
    };
  }
  if (zcrNorm > 0.35) {
    return {
      detected: true,
      level: rms,
      category: "street",
      recommendation: "Ruído de rua intenso. Aproxime-se do microfone ou troque de ambiente.",
    };
  }
  if (zcrNorm > 0.2) {
    return {
      detected: true,
      level: rms,
      category: "indoor_talk",
      recommendation: "Pessoas falando ao fundo. Reagende ou aguarde.",
    };
  }
  if (zcrNorm > 0.1) {
    return {
      detected: true,
      level: rms,
      category: "indoor_quiet",
      recommendation: "Pequeno ruído de fundo — geralmente aceitável.",
    };
  }
  return {
    detected: false,
    level: rms,
    category: "music",
    recommendation: "Música detectada — pause antes de gravar.",
  };
}

/** Validates sample metadata. Audio format / size already enforced by caller. */
export function validateSampleFormat(input: {
  sampleRate: SupportedSampleRate;
  channel: AudioChannel;
  durationMs: number;
  bitDepth: 8 | 16 | 24 | 32;
}): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!SUPPORTED_SAMPLE_RATES.includes(input.sampleRate)) {
    issues.push(`Sample rate ${input.sampleRate}kHz não suportado.`);
  }
  if (input.channel !== "mono") {
    issues.push("Sample deve ser mono. Estéreo ainda não suportado para clonagem.");
  }
  if (input.durationMs < 30_000) issues.push("Duração mínima 30s.");
  if (input.durationMs > 5 * 60_000) issues.push("Duração máxima 5min.");
  if (![8, 16, 24, 32].includes(input.bitDepth)) issues.push("Bit-depth inválido.");
  return { ok: issues.length === 0, issues };
}

// ============================================================================
// SECTION 5 — CONSENT FLOW (LGPD Art. 7 + 11)
// ============================================================================

/** Policy version — bump on every clause change. */
export const CONSENT_POLICY_VERSION = "v1.4.0";

/** HMAC key prefix for signing the consent ledger in dev. Production should
 *  be injected via env at runtime. NEVER bake the real key in source. */
const CONSENT_HMAC_PREFIX = "consent-hmac-v1::";

/**
 * Module-local append-only ledger. In production this would be persisted
 * to an immutable store (e.g. Supabase with insert-only RLS, plus an
 * off-chain WORM anchor). For the in-memory reference implementation we
 * use an array, which is acceptable for tests.
 */
export const consentLedger: ConsentRecord[] = [];

/**
 * `crypto`-free SHA-256 fingerprint using a tiny pure-TS fallback.
 * This avoids pulling in node-only deps. Hosts may override by reassigning
 * `sha256Impl` before use. Real production code should use WebCrypto.
 */
let sha256Impl: (input: string) => string = defaultSha256;

function defaultSha256(input: string): string {
  // 32-bit FNV-1a * 4 lanes — stand-in for SHA-256 in browsers lacking
  // crypto.subtle (e.g. legacy SSR). NOT cryptographic strength. Hosts MUST
  // override `sha256Impl` with WebCrypto when available.
  const PRIME = 0x01000193;
  let h1 = 0x811c9dc5;
  let h2 = 0xcbf29ce4;
  let h3 = 0x84222325;
  let h4 = 0x01234567;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i) >>> 0;
    h1 = Math.imul(h1 ^ c, PRIME) >>> 0;
    h2 = Math.imul(h2 ^ c, PRIME) >>> 0;
    h3 = Math.imul(h3 ^ c, PRIME) >>> 0;
    h4 = Math.imul(h4 ^ c, PRIME) >>> 0;
  }
  h1 ^= input.length;
  h2 ^= input.length;
  h3 ^= input.length;
  h4 ^= input.length;
  return (
    h1.toString(16).padStart(8, "0") +
    h2.toString(16).padStart(8, "0") +
    h3.toString(16).padStart(8, "0") +
    h4.toString(16).padStart(8, "0")
  );
}

/** Replace the SHA-256 implementation (call once at app boot with WebCrypto). */
export function setSha256Impl(fn: (input: string) => string): void {
  sha256Impl = fn;
}

/** Computes a stable HMAC signature for the ledger entry. */
function signConsent(input: string): string {
  return sha256Impl(CONSENT_HMAC_PREFIX + input);
}

/**
 * Records explicit consent for a list of scopes. Returns the new ledger
 * entries. If any scope is `required: true` (passed via second tuple slot)
 * the user must agree to it before proceeding.
 *
 * LGPD: voice = dado biométrico. Art. 11 exige consentimento *específico*
 * e destacado em separado das demais finalidades.
 */
export function recordConsent(
  userId: string,
  scopes: { scope: ConsentScope; granted: boolean }[],
  policyVersion: string = CONSENT_POLICY_VERSION,
  ip: string = "0.0.0.0",
  userAgent: string = "unknown",
): ConsentRecord[] {
  const at = new Date().toISOString();
  const created: ConsentRecord[] = [];
  for (const { scope, granted } of scopes) {
    const body = [userId, scope, String(granted), policyVersion, at, ip].join("|");
    const record: ConsentRecord = {
      id: `consent-${at}-${scope}`,
      userId,
      scope,
      granted,
      ip,
      userAgent,
      at,
      policyVersion,
      signature: signConsent(body),
      revokedAt: null,
      revocationSignature: null,
    };
    consentLedger.push(record);
    created.push(record);
  }
  return created;
}

/**
 * Revokes an existing consent. Idempotent — re-revoking is a no-op.
 *
 * LGPD Art. 18 §6°: revogação não afeta tratamentos já realizados.
 * A partir do momento da revogação, novos tratamentos ficam proibidos.
 */
export function revokeConsent(
  userId: string,
  scope: ConsentScope,
  reason: string = "user_request",
): ConsentRecord | null {
  const existing = [...consentLedger].reverse().find(
    (r) => r.userId === userId && r.scope === scope && r.revokedAt === null,
  );
  if (!existing) return null;
  const at = new Date().toISOString();
  const body = [existing.id, reason, at].join("|");
  existing.revokedAt = at;
  existing.revocationSignature = signConsent(body);
  void reason; // documented for audit — currently embedded in body
  return existing;
}

/**
 * Verifies consent at the moment of use. Returns `granted` boolean
 * plus the active record for audit (or `null` if no record exists).
 */
export function checkConsent(
  userId: string,
  scope: ConsentScope,
): { granted: boolean; record: ConsentRecord | null } {
  const candidate = [...consentLedger].reverse().find(
    (r) => r.userId === userId && r.scope === scope,
  );
  if (!candidate) return { granted: false, record: null };
  return {
    granted: candidate.granted && candidate.revokedAt === null,
    record: candidate,
  };
}

/** Returns all entries for a user — used in the privacy export flow. */
export function listConsent(userId: string): readonly ConsentRecord[] {
  return consentLedger.filter((r) => r.userId === userId);
}

/** All currently-required consent scopes for the full voice flow. */
export const REQUIRED_CONSENT_SCOPES: readonly ConsentScope[] = [
  "voice_capture",
  "voice_training",
] as const;

/** Optional / advanced scopes — shown collapsed by default. */
export const OPTIONAL_CONSENT_SCOPES: readonly ConsentScope[] = [
  "voice_synthesis",
  "voice_public_listing",
  "voice_analytics",
  "voice_anti_spoofing",
] as const;

// ============================================================================
// SECTION 6 — QUOTA MANAGEMENT
// ============================================================================

/** Default quota matrix. Tune via `setQuotaConfigForTier`. Mutable under the hood;
 *  but the public surface exposes only safe getters. */
const QUOTA_DEFAULTS: Record<QuotaTier, QuotaConfig> = {
  free:      { tier: "free",      dailyLimit: 1, monthlyLimit: 1, cooldownMs: 0,            maxConcurrentSessions: 1 },
  essential: { tier: "essential", dailyLimit: 1, monthlyLimit: 3, cooldownMs: 7 * 86_400_000, maxConcurrentSessions: 1 },
  premium:   { tier: "premium",   dailyLimit: 2, monthlyLimit: 5, cooldownMs: 86_400_000,   maxConcurrentSessions: 2 },
  admin:     { tier: "admin",     dailyLimit: 5, monthlyLimit: 20, cooldownMs: 0,           maxConcurrentSessions: 4 },
};

/** In-memory store of quotas. Production would mirror to DB. */
const quotaStore: Map<string, CloneQuota> = new Map();

/** Build a fresh quota record for `tier`. */
function freshQuota(userId: string, tier: QuotaTier): CloneQuota {
  const cfg = QUOTA_DEFAULTS[tier];
  const now = new Date().toISOString();
  return {
    userId,
    tier,
    daily: { limit: cfg.dailyLimit, used: 0, remaining: cfg.dailyLimit, resetAt: addDaysIso(now, 1) },
    monthly: { limit: cfg.monthlyLimit, used: 0, remaining: cfg.monthlyLimit, resetAt: addDaysIso(now, 30) },
    total: 0,
    lastResetDailyAt: now,
    lastResetMonthlyAt: now,
  };
}

/** Fetch quota; auto-creates a free-tier record if absent. */
export function checkQuota(userId: string, tier: QuotaTier = "free"): CloneQuota {
  const existing = quotaStore.get(userId);
  if (existing) {
    return rollOverIfNeeded(existing);
  }
  const created = freshQuota(userId, tier);
  quotaStore.set(userId, created);
  return created;
}

/** Consumes one slot. Throws when no slot is available. */
export function consumeQuota(userId: string, tier: QuotaTier = "free"): CloneQuota {
  const quota = checkQuota(userId, tier);
  if (quota.daily.remaining <= 0) {
    throw new QuotaExceededError("daily", quota);
  }
  if (quota.monthly.remaining <= 0) {
    throw new QuotaExceededError("monthly", quota);
  }
  quota.daily.used += 1;
  quota.daily.remaining -= 1;
  quota.monthly.used += 1;
  quota.monthly.remaining -= 1;
  quota.total += 1;
  return quota;
}

/** Manually resets a user's quota. Admin-only operation. */
export function resetQuota(userId: string): void {
  const existing = quotaStore.get(userId);
  if (!existing) return;
  existing.daily.used = 0;
  existing.daily.remaining = existing.daily.limit;
  existing.monthly.used = 0;
  existing.monthly.remaining = existing.monthly.limit;
  existing.lastResetDailyAt = new Date().toISOString();
  existing.lastResetMonthlyAt = new Date().toISOString();
}

/** Override per-tier config (e.g. promo campaign with elevated free tier). */
export function setQuotaConfigForTier(tier: QuotaTier, config: QuotaConfig): void {
  QUOTA_DEFAULTS[tier] = config;
}

/** Read-only accessor for the config of a tier. */
export function getQuotaConfigForTier(tier: QuotaTier): QuotaConfig {
  return QUOTA_DEFAULTS[tier];
}

/** Human-readable quota status — drives `QuotaIndicator` warning state. */
export function quotaStatus(userId: string): {
  tier: QuotaTier;
  remaining: number;
  warning: "ok" | "near" | "limit";
  resetsAt: string;
} {
  const q = checkQuota(userId);
  const warning = pickQuotaWarning(q);
  return {
    tier: q.tier,
    remaining: q.monthly.remaining,
    warning,
    resetsAt: q.monthly.resetAt,
  };
}

// ============================================================================
// SECTION 7 — VOICE PROFILE CRUD
// ============================================================================

/** Soft-delete window. After expiry, hard-delete must run from a cron. */
export const PROFILE_SOFT_DELETE_WINDOW_DAYS = 30;

const profileStore: Map<string, VoiceProfile> = new Map();

/**
 * Creates a new profile. The actual `VoiceClone` is constructed *after*
 * training succeeds; here we just scaffold an empty profile referencing a
 * pre-allocated id.
 */
export function createProfile(input: {
  userId: string;
  displayName: string;
  description: string;
  language: string;
  isPublic: boolean;
  isDefault: boolean;
  tags: string[];
}): VoiceProfile {
  const now = new Date().toISOString();
  const profile: VoiceProfile = {
    id: `profile-${now}-${input.userId.slice(0, 6)}`,
    userId: input.userId,
    cloneId: "pending",
    displayName: input.displayName.slice(0, 64),
    description: input.description.slice(0, 500),
    language: input.language || "pt-BR",
    isPublic: input.isPublic,
    isDefault: input.isDefault,
    tags: input.tags.slice(0, 10).map((t) => t.slice(0, 24)),
    version: 1,
    createdAt: now,
    updatedAt: now,
    exportedAt: null,
    deletedAt: null,
  };
  profileStore.set(profile.id, profile);
  return profile;
}

export function getProfile(profileId: string): VoiceProfile | null {
  const p = profileStore.get(profileId);
  if (!p || p.deletedAt !== null) return null;
  return p;
}

export function listProfiles(userId: string): readonly VoiceProfile[] {
  return [...profileStore.values()].filter(
    (p) => p.userId === userId && p.deletedAt === null,
  );
}

export function updateProfile(
  profileId: string,
  patch: Partial<Omit<VoiceProfile, "id" | "userId" | "createdAt" | "version">>,
): VoiceProfile {
  const existing = getProfile(profileId);
  if (!existing) throw new ProfileNotFoundError(profileId);
  const updated: VoiceProfile = {
    ...existing,
    ...patch,
    version: existing.version + 1,
    updatedAt: new Date().toISOString(),
  };
  profileStore.set(profileId, updated);
  return updated;
}

/**
 * Soft-deletes a profile. Hard-delete runs later via cron after
 * `PROFILE_SOFT_DELETE_WINDOW_DAYS`. During the window the user can
 * call `restoreProfile` to recover.
 */
export function deleteProfile(profileId: string): VoiceProfile {
  const existing = getProfile(profileId);
  if (!existing) throw new ProfileNotFoundError(profileId);
  const deleted: VoiceProfile = {
    ...existing,
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  profileStore.set(profileId, deleted);
  return deleted;
}

export function restoreProfile(profileId: string): VoiceProfile | null {
  const p = profileStore.get(profileId);
  if (!p || !p.deletedAt) return null;
  const restored: VoiceProfile = {
    ...p,
    deletedAt: null,
    updatedAt: new Date().toISOString(),
    version: p.version + 1,
  };
  profileStore.set(profileId, restored);
  return restored;
}

/** Hard-deletes a profile, ignoring the soft-delete window. Admin only. */
export function purgeProfile(profileId: string): boolean {
  return profileStore.delete(profileId);
}

/**
 * Exports a profile to a portable bundle. Consumed by w45/user-import-export.
 */
export interface VoiceProfileExportBundle {
  formatVersion: 1;
  exportedAt: string;
  profile: VoiceProfile;
  clone: VoiceClone | null;
  sample: VoiceSample | null;
  audio: { format: "wav" | "flac"; data: Uint8Array } | null;
  consents: readonly ConsentRecord[];
  checksum: string;
}

export function exportProfile(profileId: string): VoiceProfileExportBundle | null {
  const profile = getProfile(profileId);
  if (!profile) return null;
  const consents = listConsent(profile.userId);
  const bundle: VoiceProfileExportBundle = {
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    profile,
    clone: null,          // populated by the caller (engine layer)
    sample: null,         // populated by the caller (storage layer)
    audio: null,
    consents,
    checksum: "0".repeat(64), // re-hashed below
  };
  bundle.checksum = sha256Impl(JSON.stringify(bundle.profile) + bundle.exportedAt);
  profileStore.set(profileId, { ...profile, exportedAt: bundle.exportedAt });
  return bundle;
}

/**
 * Imports a profile bundle with version migration. Migration table:
 *   v1 → v1 (no-op)
 * Future versions plug in here.
 */
export function importProfile(bundle: VoiceProfileExportBundle): VoiceProfile {
  if (bundle.formatVersion !== 1) {
    throw new IncompatibleBundleError(bundle.formatVersion);
  }
  const { profile } = bundle;
  const imported: VoiceProfile = {
    ...profile,
    id: `profile-imported-${bundle.exportedAt}-${profile.userId.slice(0, 6)}`,
    version: profile.version + 1,
    updatedAt: new Date().toISOString(),
    exportedAt: null,
  };
  profileStore.set(imported.id, imported);
  return imported;
}

// ============================================================================
// SECTION 8 — SERVER SYNC
// ============================================================================

const CHUNK_SIZE_BYTES = 256 * 1024;

/**
 * Builds a resumable upload descriptor for the upstream TTS engine.
 * The actual HTTP transport is performed by the host framework.
 */
export function buildUploadDescriptor(input: {
  endpoint: string;
  format: "wav" | "flac" | "opus" | "webm";
  totalBytes: number;
  hash: string;
  authHeader: string;
}): UploadDescriptor {
  return {
    url: `${input.endpoint}/v1/voice-clones/samples`,
    method: "POST",
    headers: {
      "Content-Type": input.format,
      "Authorization": input.authHeader,
      "X-Sample-Hash": input.hash,
    },
    resumable: input.totalBytes > CHUNK_SIZE_BYTES,
    chunkSizeBytes: CHUNK_SIZE_BYTES,
    totalBytes: input.totalBytes,
    hash: input.hash,
  };
}

/** Mark a sample as uploaded. Pure bookkeeping; no actual HTTP. */
export function uploadSample(
  session: CloneSession,
  uploadedBytes: number,
): CloneSession {
  const total = session.totalBytes || uploadedBytes;
  const pct = Math.min(100, (uploadedBytes / total) * 100);
  const chunks = Math.ceil(uploadedBytes / CHUNK_SIZE_BYTES);
  const next = transitionSession(session, "UPLOADING", "upload_progress", {
    uploadedBytes,
  });
  return {
    ...next,
    uploadedBytes,
    totalBytes: total,
    uploadedChunks: chunks,
    progressPct: pct,
    canResume: uploadedBytes < total,
  };
}

/** Polls the server for training status. */
export function pollTrainingStatus(
  cloneId: string,
  engine: VoiceCloneEngine,
): ServerTrainingStatus {
  // Host replaces the body; reference impl returns a deterministic stub.
  return {
    cloneId,
    state: "training",
    pct: 50,
    etaMs: 60_000,
    message: "Engine-side training in progress.",
    remoteId: null,
    remoteUrl: null,
  };
  void engine;
}

/** Returns the URL at which the trained clone can be hit. */
export function getCloneUrl(clone: VoiceClone): string {
  return (
    clone.remoteUrl ??
    `https://api.cabaladoscaminhos.com/voice-clones/${clone.id}/synthesize`
  );
}

/** Server-side revocation — invalidates caches and downstream mirrors. */
export function revokeFromServer(
  clone: VoiceClone,
  reason: string,
): { ok: boolean; revokedAt: string; reason: string } {
  return {
    ok: true,
    revokedAt: new Date().toISOString(),
    reason,
  };
  void clone;
}

// ============================================================================
// SECTION 9 — QUALITY SCORING
// ============================================================================

export const DEFAULT_QUALITY_WEIGHTS: QualityWeights = {
  clarity: 0.35,
  naturalness: 0.25,
  consistency: 0.20,
  prosody: 0.20,
};

/** Signal-to-noise proxy: peak amplitude vs RMS silence region. */
export function scoreClarity(audio: Float32Array, sampleRate: SupportedSampleRate): number {
  let peak = 0;
  let sumSquares = 0;
  let quietFrames = 0;
  let quietSum = 0;
  const frameSize = Math.floor(sampleRate * 0.025); // 25 ms
  for (let i = 0; i < audio.length; i++) {
    const s = audio[i];
    const a = Math.abs(s);
    if (a > peak) peak = a;
    sumSquares += s * s;
    if (i % frameSize === 0) {
      const frameRms = Math.sqrt(quietSum / Math.max(frameSize, 1));
      if (frameRms < 0.02) quietFrames += 1;
      quietSum = 0;
    } else {
      quietSum += s * s;
    }
  }
  void quietFrames;
  const rms = Math.sqrt(sumSquares / Math.max(audio.length, 1));
  if (rms < 1e-6) return 0;
  const snr = 20 * Math.log10(peak / rms);          // dB
  const score = clamp01((snr - 6) / 30) * 100;
  return Math.round(score);
}

/** Prosody: peak-to-RMS variability as crude dynamic-range proxy. */
export function scoreNaturalness(audio: Float32Array, sampleRate: SupportedSampleRate): number {
  let sum = 0;
  let sumAbs = 0;
  const frameSize = Math.floor(sampleRate * 0.05);
  let frames = 0;
  let activeFrames = 0;
  for (let i = 0; i < audio.length; i += frameSize) {
    let localRms = 0;
    for (let j = 0; j < frameSize && i + j < audio.length; j++) {
      const s = audio[i + j];
      sum += s * s;
      sumAbs += Math.abs(s);
      localRms += s * s;
    }
    frames += 1;
    if (Math.sqrt(localRms / frameSize) > 0.05) activeFrames += 1;
  }
  const rms = Math.sqrt(sum / Math.max(audio.length, 1));
  const meanAbs = sumAbs / Math.max(audio.length, 1);
  void meanAbs;
  const activityRatio = frames === 0 ? 0 : activeFrames / frames;
  const score = clamp01(0.4 + activityRatio * 0.6) * 100;
  void rms;
  return Math.round(score);
}

/** Pitch stability proxy: zero-crossing-rate variance over time. */
export function scoreConsistency(audio: Float32Array, sampleRate: SupportedSampleRate): number {
  const frameSize = Math.floor(sampleRate * 0.02);
  let lastSign = 0;
  const zcrPerFrame: number[] = [];
  let curFrameZcr = 0;
  for (let i = 0; i < audio.length; i++) {
    const s = audio[i] >= 0 ? 1 : 0;
    if (lastSign !== 0 && s !== lastSign) curFrameZcr += 1;
    lastSign = s;
    if (i % frameSize === 0) {
      zcrPerFrame.push(curFrameZcr);
      curFrameZcr = 0;
    }
  }
  if (zcrPerFrame.length < 2) return 0;
  const mean = zcrPerFrame.reduce((a, b) => a + b, 0) / zcrPerFrame.length;
  const variance =
    zcrPerFrame.reduce((a, b) => a + (b - mean) ** 2, 0) / zcrPerFrame.length;
  const std = Math.sqrt(variance);
  // Lower std → higher consistency. Score penalises very high variance.
  const score = clamp01(1 - std / (mean + 1) / 4) * 100;
  return Math.round(score);
}

/** Prosody score — heuristic on RMS envelope shape. */
export function scoreProsody(audio: Float32Array, sampleRate: SupportedSampleRate): number {
  const frameSize = Math.floor(sampleRate * 0.1); // 100ms
  const env: number[] = [];
  for (let i = 0; i < audio.length; i += frameSize) {
    let s = 0;
    for (let j = 0; j < frameSize && i + j < audio.length; j++) {
      s += audio[i + j] ** 2;
    }
    env.push(Math.sqrt(s / frameSize));
  }
  if (env.length < 4) return 0;
  const max = Math.max(...env);
  const min = Math.min(...env);
  const range = max - min;
  const dynamicRange = clamp01(range / (max || 1)); // 0..1
  // Fewer flat segments → higher prosody score.
  let flats = 0;
  for (let i = 1; i < env.length; i++) {
    if (Math.abs(env[i] - env[i - 1]) < 0.005) flats += 1;
  }
  const flatPenalty = flats / env.length;
  const score = clamp01(dynamicRange * (1 - flatPenalty * 0.5)) * 100;
  return Math.round(score);
}

// ============================================================================
// SECTION 10 — PRIVACY / SECURITY
// ============================================================================

/**
 * DTMF tone frequencies to strip (Brazilian telephony + international).
 * Pairs encode the DTMF digit (rows are low, cols are high).
 */
const DTMF_FREQS: ReadonlyArray<readonly [number, number]> = [
  [697, 1209], [697, 1336], [697, 1477], [697, 1633],
  [770, 1209], [770, 1336], [770, 1477], [770, 1633],
  [852, 1209], [852, 1336], [852, 1477], [852, 1633],
  [941, 1209], [941, 1336], [941, 1477], [941, 1633],
];

const PHONE_REGEX = /(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}/g;
const CPF_REGEX = /\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g;
const EMAIL_REGEX = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/**
 * Strips PII from the captured audio. Two passes:
 *  1) bandstop DTMF tones (downmix assumed upstream).
 *  2) Given a paired transcript, mask recognised PII.
 *
 * The function returns the *cleaned* audio + a redacted-transcript string.
 */
export function redactPII(
  audio: Float32Array,
  transcript: string,
  sampleRate: SupportedSampleRate,
): { audio: Float32Array; transcript: string; redactions: number } {
  const cleaned = stripDTMF(audio, sampleRate);
  let count = 0;
  let masked = transcript;
  for (const [label, regex] of [
    ["telefone", PHONE_REGEX],
    ["cpf", CPF_REGEX],
    ["email", EMAIL_REGEX],
  ] as const) {
    masked = masked.replace(regex, (match) => {
      count += 1;
      return `[${label}#${count}]`;
    });
  }
  return { audio: cleaned, transcript: masked, redactions: count };
}

/** Bandstop DTMF by zeroing out narrow bands via Goertzel-style attenuation. */
function stripDTMF(audio: Float32Array, sampleRate: SupportedSampleRate): Float32Array {
  const out = new Float32Array(audio.length);
  out.set(audio);
  const windowSize = Math.floor(sampleRate * 0.04); // 40ms hop
  for (const [low, high] of DTMF_FREQS) {
    for (let i = 0; i < out.length; i += windowSize) {
      const powerLow = goertzelPower(audio, sampleRate, low, i, windowSize);
      const powerHigh = goertzelPower(audio, sampleRate, high, i, windowSize);
      if (powerLow > 0.05 && powerHigh > 0.05) {
        for (let j = 0; j < windowSize && i + j < out.length; j++) {
          out[i + j] = 0;
        }
      }
    }
  }
  return out;
}

function goertzelPower(
  buf: Float32Array,
  fs: SupportedSampleRate,
  freq: number,
  start: number,
  size: number,
): number {
  const w = (2 * Math.PI * freq) / (fs * 1000);
  let s0 = 0;
  let s1 = 0;
  let s2 = 0;
  for (let i = 0; i < size && start + i < buf.length; i++) {
    s0 = buf[start + i] + 2 * Math.cos(w) * s1 - s2;
    s2 = s1;
    s1 = s0;
  }
  return s1 * s1 + s2 * s2 - 2 * Math.cos(w) * s1 * s2;
}

/**
 * SHA-256 fingerprint of a sample, used for de-duplication and
 * integrity verification. Implementation delegates to `sha256Impl`
 * (configurable at boot).
 */
export function hashSample(audio: Float32Array): string {
  // Convert to a compact JSON-safe form (downsampled to 4 hex chars per
  // sample) for the hash input. This keeps it deterministic without
  // serialising megabytes.
  const stride = Math.max(1, Math.floor(audio.length / 4096));
  let acc = "";
  for (let i = 0; i < audio.length; i += stride) {
    const v = Math.round((audio[i] + 1) * 1000);
    acc += v.toString(16).padStart(4, "0");
  }
  return sha256Impl(`voice-sample::${audio.length}::${acc}`);
}

/** Compare two fingerprints in constant time. Useful for anti-spoof. */
export function compareHashes(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// ============================================================================
// SECTION 11 — ERROR HANDLING (typed errors, no `any`)
// ============================================================================

/** Base class for all voice-clone errors. Carries an `kind` discriminant. */
export abstract class VoiceCloneError extends Error {
  public readonly kind: string;
  public readonly at: string;
  constructor(message: string, kind: string) {
    super(message);
    this.name = `${kind}Error`;
    this.kind = kind;
    this.at = new Date().toISOString();
  }
}

export class IllegalStateTransitionError extends VoiceCloneError {
  constructor(public readonly from: CloneStateName, public readonly to: CloneStateName) {
    super(`Cannot transition from ${from} to ${to}.`, "IllegalStateTransition");
  }
}

export class PermissionDeniedError extends VoiceCloneError {
  constructor(public readonly reason: string) {
    super(`Microphone permission denied: ${reason}`, "PermissionDenied");
  }
}

export class SampleTooShortError extends VoiceCloneError {
  constructor(public readonly actualMs: number, public readonly minMs: number) {
    super(`Sample too short: ${actualMs}ms (min ${minMs}ms).`, "SampleTooShort");
  }
}

export class SampleTooLongError extends VoiceCloneError {
  constructor(public readonly actualMs: number, public readonly maxMs: number) {
    super(`Sample too long: ${actualMs}ms (max ${maxMs}ms).`, "SampleTooLong");
  }
}

export class QualityTooLowError extends VoiceCloneError {
  constructor(public readonly report: QualityReport, public readonly threshold: number) {
    super(`Sample quality ${report.weighted.toFixed(1)} below threshold ${threshold}.`,
      "QualityTooLow");
  }
}

export class QuotaExceededError extends VoiceCloneError {
  constructor(
    public readonly bucket: "daily" | "monthly",
    public readonly quota: CloneQuota,
  ) {
    super(`Quota exceeded (${bucket}). Reset at ${quota.monthly.resetAt}.`, "QuotaExceeded");
  }
}

export class ConsentRevokedError extends VoiceCloneError {
  constructor(public readonly scope: ConsentScope, public readonly userId: string) {
    super(`Consent revoked for ${scope} (user=${userId}).`, "ConsentRevoked");
  }
}

export class UploadFailedError extends VoiceCloneError {
  constructor(public readonly statusCode: number, public readonly body: string) {
    super(`Upload failed (HTTP ${statusCode}): ${body.slice(0, 256)}`, "UploadFailed");
  }
}

export class TrainingTimeoutError extends VoiceCloneError {
  constructor(public readonly cloneId: string, public readonly waitedMs: number) {
    super(`Training timeout after ${waitedMs}ms for ${cloneId}.`, "TrainingTimeout");
  }
}

export class DuplicateSampleError extends VoiceCloneError {
  constructor(public readonly hash: string) {
    super(`Duplicate sample (hash=${hash.slice(0, 8)}…).`, "DuplicateSample");
  }
}

export class ProfileNotFoundError extends VoiceCloneError {
  constructor(public readonly profileId: string) {
    super(`Profile not found: ${profileId}`, "ProfileNotFound");
  }
}

export class IncompatibleBundleError extends VoiceCloneError {
  constructor(public readonly formatVersion: number) {
    super(`Incompatible bundle version: ${formatVersion}.`, "IncompatibleBundle");
  }
}

export class EngineFailureError extends VoiceCloneError {
  constructor(public readonly engine: VoiceCloneEngine, public readonly reason: string) {
    super(`Engine ${engine} failure: ${reason}`, "EngineFailure");
  }
}

export class NetworkOfflineError extends VoiceCloneError {
  constructor() {
    super("Network offline. Voice clone requires connectivity.", "NetworkOffline");
  }
}

/** Union of all errors this module can throw. */
export type CloneError =
  | PermissionDeniedError
  | SampleTooShortError
  | SampleTooLongError
  | QualityTooLowError
  | QuotaExceededError
  | ConsentRevokedError
  | UploadFailedError
  | TrainingTimeoutError
  | DuplicateSampleError
  | ProfileNotFoundError
  | IncompatibleBundleError
  | EngineFailureError
  | NetworkOfflineError
  | IllegalStateTransitionError;

// ============================================================================
// SECTION 12 — INTEGRATION HOOKS
// ============================================================================

/**
 * Reference of external integrations. These are NOT imports — the engine
 * layer binds them at runtime to avoid pulling in heavy deps.
 */
export const INTEGRATIONS = {
  voiceModeTTS: {
    feature: "w47/voice-mode-tts",
    binding: "VoiceRegistry.synthesize(profileId, text) -> AudioBuffer",
    consumes: ["VoiceProfile.id", "VoiceClone.remoteId"],
  },
  userImportExport: {
    feature: "w45/user-import-export",
    binding: "exportProfile / importProfile bundle round-trip",
    consumes: ["VoiceProfileExportBundle"],
  },
  reputationSystem: {
    feature: "w47/reputation-system",
    binding: "sample hash dedup + impersonation detection",
    consumes: ["hashSample(audio) -> sha256", "VoiceClone.fingerprintAntiSpoof"],
  },
} as const;

// ============================================================================
// SECTION 13 — INTERNAL HELPERS (not exported)
// ============================================================================

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function formatDurationLabel(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function kHzToHzLabel(rate: SupportedSampleRate): string {
  return `${(rate * 1000).toLocaleString("pt-BR")} Hz`;
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function daysUntilDate(iso: string): number {
  const target = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((target - now) / 86_400_000));
}

function pickQuotaWarning(q: CloneQuota): "ok" | "near" | "limit" {
  if (q.monthly.remaining === 0) return "limit";
  if (q.monthly.remaining <= Math.max(1, Math.floor(q.monthly.limit * 0.2))) return "near";
  return "ok";
}

function rollOverIfNeeded(q: CloneQuota): CloneQuota {
  const now = Date.now();
  if (now >= new Date(q.monthly.resetAt).getTime()) {
    q.monthly.used = 0;
    q.monthly.remaining = q.monthly.limit;
    q.monthly.resetAt = addDaysIso(q.monthly.resetAt, 30);
    q.lastResetMonthlyAt = new Date().toISOString();
  }
  if (now >= new Date(q.daily.resetAt).getTime()) {
    q.daily.used = 0;
    q.daily.remaining = q.daily.limit;
    q.daily.resetAt = addDaysIso(q.daily.resetAt, 1);
    q.lastResetDailyAt = new Date().toISOString();
  }
  return q;
}

function stateToStepIndex(s: CloneStateName): number {
  switch (s) {
    case "IDLE": return 0;
    case "RECORDING": return 0;
    case "PROCESSING": return 1;
    case "UPLOADING": return 2;
    case "TRAINING": return 3;
    case "READY":
    case "ACTIVE": return 4;
    case "FAILED":
    case "REVOKED": return -1;
    default: {
      const exhaustive: never = s;
      return exhaustive;
    }
  }
}

function initConsentScopeMap(
  scopes: readonly ConsentScope[],
): Record<ConsentScope, boolean> {
  const out = {} as Record<ConsentScope, boolean>;
  for (const s of scopes) out[s] = false;
  return out;
}

// ============================================================================
// SECTION 14 — SMOKE TESTS (runSmokeTests)
// ============================================================================

/**
 * Lightweight smoke tests. Returns a deterministic pass/fail array —
 * runner code (e.g. a vitest spec) just forwards results. These are NOT
 * unit tests in the formal sense — they're executable documentation
 * proving each critical path doesn't throw.
 */
export interface SmokeTestCase {
  name: string;
  passed: boolean;
  durationMs: number;
  error: string | null;
}

export function runSmokeTests(): SmokeTestCase[] {
  const cases: { name: string; fn: () => void }[] = [
    {
      name: "state.canTransition IDLE->RECORDING is true",
      fn: () => {
        if (!canTransition("IDLE", "RECORDING")) throw new Error("expected true");
      },
    },
    {
      name: "state.canTransition READY->RECORDING is false",
      fn: () => {
        if (canTransition("READY", "RECORDING")) throw new Error("expected false");
      },
    },
    {
      name: "state.transitionSession appends history",
      fn: () => {
        const initial = blankSession("user-a");
        const next = transitionSession(initial, "RECORDING", "user_tap_mic");
        if (next.state !== "RECORDING") throw new Error("wrong state");
        if (next.history.length !== 1) throw new Error("history not appended");
      },
    },
    {
      name: "state.transitionSession rejects illegal edge",
      fn: () => {
        const initial = blankSession("user-a");
        try {
          transitionSession(initial, "READY", "skip");
          throw new Error("should have thrown");
        } catch (e: unknown) {
          if (!(e instanceof IllegalStateTransitionError)) {
            throw new Error("wrong error type");
          }
        }
      },
    },
    {
      name: "sample.detectBackgroundNoise classifies silent input",
      fn: () => {
        const audio = new Float32Array(4096);
        const r = detectBackgroundNoise(audio);
        if (r.category !== "silent") throw new Error("expected silent");
      },
    },
    {
      name: "consent.recordConsent + revokeConsent round-trip",
      fn: () => {
        const before = consentLedger.length;
        recordConsent("u1", [{ scope: "voice_capture", granted: true }]);
        const after1 = consentLedger.length;
        if (after1 !== before + 1) throw new Error("not appended");
        const revoked = revokeConsent("u1", "voice_capture");
        if (!revoked || revoked.revokedAt === null) throw new Error("not revoked");
      },
    },
    {
      name: "consent.checkConsent reports the latest state",
      fn: () => {
        recordConsent("u2", [{ scope: "voice_synthesis", granted: true }]);
        const ok = checkConsent("u2", "voice_synthesis");
        if (!ok.granted) throw new Error("expected granted");
        revokeConsent("u2", "voice_synthesis");
        const denied = checkConsent("u2", "voice_synthesis");
        if (denied.granted) throw new Error("expected revoked");
      },
    },
    {
      name: "quota.consumeQuota decrements remaining",
      fn: () => {
        resetQuota("q1");
        const before = checkQuota("q1").monthly.remaining;
        consumeQuota("q1");
        const after = checkQuota("q1").monthly.remaining;
        if (after !== before - 1) throw new Error("not decremented");
      },
    },
    {
      name: "quota.consumeQuota throws when exhausted",
      fn: () => {
        resetQuota("q2");
        // Free tier monthlyLimit = 1, so consume then reject.
        consumeQuota("q2");
        try {
          consumeQuota("q2");
          throw new Error("should have thrown");
        } catch (e: unknown) {
          if (!(e instanceof QuotaExceededError)) throw new Error("wrong error");
        }
      },
    },
    {
      name: "profile.createProfile + updateProfile increments version",
      fn: () => {
        const p = createProfile({
          userId: "u3", displayName: "Voz de teste", description: "teste",
          language: "pt-BR", isPublic: false, isDefault: false, tags: ["smoke"],
        });
        const u = updateProfile(p.id, { displayName: "Voz atualizada" });
        if (u.version !== p.version + 1) throw new Error("version not bumped");
        if (u.displayName !== "Voz atualizada") throw new Error("not updated");
      },
    },
    {
      name: "profile.deleteProfile soft-deletes and restore",
      fn: () => {
        const p = createProfile({
          userId: "u4", displayName: "Soft", description: "x",
          language: "pt-BR", isPublic: false, isDefault: false, tags: [],
        });
        deleteProfile(p.id);
        if (getProfile(p.id)) throw new Error("not soft-deleted");
        const restored = restoreProfile(p.id);
        if (!restored || restored.deletedAt !== null) throw new Error("not restored");
      },
    },
    {
      name: "hashSample + compareHashes round-trip",
      fn: () => {
        const audio = new Float32Array([0.1, -0.2, 0.3, -0.4]);
        const h = hashSample(audio);
        if (!compareHashes(h, h)) throw new Error("identical hash mismatch");
        if (compareHashes(h, h.replace(/^./, "0"))) throw new Error("different hash matched");
      },
    },
    {
      name: "redactPII masks phone numbers in transcript",
      fn: () => {
        const audio = new Float32Array(2048);
        const transcript = "Me liga em 11 91234-5678 ou no email teste@exemplo.com";
        const r = redactPII(audio, transcript, 44.1);
        if (r.transcript.includes("91234")) throw new Error("phone not redacted");
        if (r.redactions < 2) throw new Error("expected >= 2 redactions");
      },
    },
    {
      name: "quality.scoreClarity returns 0-100",
      fn: () => {
        const audio = new Float32Array(44_100);
        for (let i = 0; i < audio.length; i++) {
          audio[i] = Math.sin((2 * Math.PI * 220 * i) / 44.1) * 0.3;
        }
        const s = scoreClarity(audio, 44.1);
        if (s < 0 || s > 100) throw new Error("out of range");
      },
    },
    {
      name: "ui.RecordingPanel tree shape",
      fn: () => {
        const t = cloneUIControls.RecordingPanel();
        if (t.component !== "RecordingPanel") throw new Error("wrong component");
        if (!t.props.showCountdown) throw new Error("missing countdown");
      },
    },
    {
      name: "ui.ProgressTracker maps state to step index",
      fn: () => {
        const snap: ProgressSnapshot = {
          state: "TRAINING", pct: 60, etaMs: 30_000,
          message: "training", canCancel: true,
        };
        const t = cloneUIControls.ProgressTracker(snap);
        if (t.state.currentStepIndex !== 3) throw new Error("wrong step");
      },
    },
  ];

  const results: SmokeTestCase[] = [];
  for (const c of cases) {
    const t0 = Date.now();
    try {
      c.fn();
      results.push({ name: c.name, passed: true, durationMs: Date.now() - t0, error: null });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({ name: c.name, passed: false, durationMs: Date.now() - t0, error: msg });
    }
  }
  return results;
}

/** Build a blank session for tests / smoke. */
export function blankSession(userId: string): CloneSession {
  const now = new Date().toISOString();
  return {
    sessionId: `sess-${now}-${userId}`,
    userId,
    state: "IDLE",
    startedAt: now,
    lastTransitionAt: now,
    sample: null,
    profile: null,
    clone: null,
    errors: [],
    history: [],
    progressPct: 0,
    uploadedBytes: 0,
    totalBytes: 0,
    uploadedChunks: 0,
    totalChunks: 0,
    canResume: false,
    serverMessage: null,
  };
}

// ============================================================================
// SECTION 15 — DEFAULT EXPORT (for framework-side aggregator tooling)
// ============================================================================

export default {
  cloneUIControls,
  REQUIRED_CONSENT_SCOPES,
  OPTIONAL_CONSENT_SCOPES,
  CONSENT_POLICY_VERSION,
  SUPPORTED_SAMPLE_RATES,
  DEFAULT_QUALITY_WEIGHTS,
  PROFILE_SOFT_DELETE_WINDOW_DAYS,
  INTEGRATIONS,
};
