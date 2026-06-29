// src/lib/w32/voice-clone-ui.ts
// Cycle 32 worker E — voice clone UI surface (client state machine + i18n)
// Composes w27/voice-mode (TTS shape) + w28/voice-mode-player (player shape) + w31/voice-tts-ui (TTS reducer shape)
// Scope: consent flow, sample upload, training progress, voice picker
// Namespace: w32 — self-contained, no runtime deps on other waves

export type CloneFlowStep =
  | "intro"
  | "consent"
  | "record"
  | "review"
  | "upload"
  | "training"
  | "ready"
  | "failed";

export type ConsentDecision = "accepted" | "declined" | "withdrawn";

export interface VoiceSample {
  readonly id: string;
  readonly durationSeconds: number;
  readonly sizeBytes: number;
  readonly sampleRateHz: number;
  readonly capturedAt: string; // ISO
  readonly waveformPeaks: ReadonlyArray<number>; // 0-1 normalized
  readonly checksumSha256: string;
}

export interface VoiceClone {
  readonly id: string;
  readonly ownerUserId: string;
  readonly displayName: string;
  readonly consent: ConsentDecision;
  readonly consentAt: string | null; // ISO
  readonly status: "draft" | "queued" | "training" | "ready" | "failed" | "revoked";
  readonly trainingProgress: number; // 0-100
  readonly samples: ReadonlyArray<VoiceSample>;
  readonly createdAt: string; // ISO
  readonly readyAt: string | null; // ISO
  readonly language: "pt-BR" | "en" | "es";
  readonly qualityTier: "draft" | "standard" | "studio";
}

export interface CloneFlowState {
  readonly step: CloneFlowStep;
  readonly clone: VoiceClone;
  readonly errorMessage: string | null;
}

export const CLONE_MIN_SAMPLE_SECONDS = 30;
export const CLONE_MAX_SAMPLE_SECONDS = 120;
export const CLONE_MIN_SAMPLES = 3;
export const CLONE_MAX_SAMPLES = 8;

/** Initialize a fresh clone flow state. */
export function initCloneFlow(
  ownerUserId: string,
  displayName: string,
  language: VoiceClone["language"],
): CloneFlowState {
  return {
    step: "intro",
    clone: {
      id: `vc_${Date.now().toString(36)}`,
      ownerUserId,
      displayName,
      consent: "declined",
      consentAt: null,
      status: "draft",
      trainingProgress: 0,
      samples: [],
      createdAt: new Date().toISOString(),
      readyAt: null,
      language,
      qualityTier: "draft",
    },
    errorMessage: null,
  };
}

/** Transition: user accepted consent. */
export function acceptConsent(state: CloneFlowState): CloneFlowState {
  return {
    step: "record",
    clone: {
      ...state.clone,
      consent: "accepted",
      consentAt: new Date().toISOString(),
    },
    errorMessage: null,
  };
}

/** Transition: user withdrew consent (revoke the clone). */
export function withdrawConsent(state: CloneFlowState): CloneFlowState {
  return {
    step: "intro",
    clone: {
      ...state.clone,
      consent: "withdrawn",
      status: "revoked",
    },
    errorMessage: null,
  };
}

/** Validate a recorded sample before adding it to the clone. */
export function validateSample(
  sample: VoiceSample,
  existing: ReadonlyArray<VoiceSample>,
): { ok: true } | { ok: false; error: string } {
  if (sample.durationSeconds < CLONE_MIN_SAMPLE_SECONDS) {
    return { ok: false, error: `amostra muito curta (mínimo ${CLONE_MIN_SAMPLE_SECONDS}s)` };
  }
  if (sample.durationSeconds > CLONE_MAX_SAMPLE_SECONDS) {
    return { ok: false, error: `amostra muito longa (máximo ${CLONE_MAX_SAMPLE_SECONDS}s)` };
  }
  if (existing.length >= CLONE_MAX_SAMPLES) {
    return { ok: false, error: `máximo de ${CLONE_MAX_SAMPLES} amostras` };
  }
  return { ok: true };
}

/** Add a validated sample and advance the flow. */
export function addSample(state: CloneFlowState, sample: VoiceSample): CloneFlowState {
  const check = validateSample(sample, state.clone.samples);
  if (!check.ok) return { ...state, errorMessage: check.error };
  const samples = [...state.clone.samples, sample];
  const nextStep: CloneFlowStep =
    samples.length < CLONE_MIN_SAMPLES ? "record" : "review";
  return {
    step: nextStep,
    clone: { ...state.clone, samples },
    errorMessage: null,
  };
}

/** Remove a sample by id. */
export function removeSample(state: CloneFlowState, sampleId: string): CloneFlowState {
  const samples = state.clone.samples.filter((s) => s.id !== sampleId);
  return {
    step: samples.length === 0 ? "record" : state.step,
    clone: { ...state.clone, samples },
    errorMessage: null,
  };
}

/** Move from "review" to "upload" (user confirms). */
export function confirmSamplesForUpload(state: CloneFlowState): CloneFlowState {
  if (state.clone.samples.length < CLONE_MIN_SAMPLES) {
    return { ...state, errorMessage: `mínimo de ${CLONE_MIN_SAMPLES} amostras` };
  }
  return { ...state, step: "upload", errorMessage: null };
}

/** Mark upload complete and queue training. */
export function markUploadedAndQueue(state: CloneFlowState): CloneFlowState {
  return {
    step: "training",
    clone: { ...state.clone, status: "queued", trainingProgress: 0 },
    errorMessage: null,
  };
}

/** Update training progress (called by the polling hook). */
export function updateTrainingProgress(
  state: CloneFlowState,
  progress: number,
  status: VoiceClone["status"],
): CloneFlowState {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));
  const ready = status === "ready";
  return {
    step: ready ? "ready" : status === "failed" ? "failed" : "training",
    clone: {
      ...state.clone,
      trainingProgress: clamped,
      status,
      readyAt: ready ? new Date().toISOString() : state.clone.readyAt,
    },
    errorMessage: status === "failed" ? "treinamento falhou — tente novamente" : null,
  };
}

/** i18n strings for the clone UI. */
export interface CloneI18n {
  readonly title: string;
  readonly introBody: string;
  readonly consentBody: string;
  readonly consentAccept: string;
  readonly consentDecline: string;
  readonly recordCta: string;
  readonly reviewCta: string;
  readonly uploadCta: string;
  readonly retryCta: string;
  readonly minSamplesHint: string;
}

export const CLONE_I18N_PT_BR: CloneI18n = {
  title: "Crie sua voz Akasha",
  introBody: "Com sua autorização, Akasha pode falar com a sua voz para leituras e reflexões.",
  consentBody: "Eu confirmo que esta é minha voz e autorizo o uso conforme os Termos.",
  consentAccept: "Aceito e prossigo",
  consentDecline: "Agora não",
  recordCta: "Gravar amostra",
  reviewCta: "Enviar para treinamento",
  uploadCta: "Iniciar treinamento",
  retryCta: "Tentar novamente",
  minSamplesHint: `Grave pelo menos ${CLONE_MIN_SAMPLES} amostras entre ${CLONE_MIN_SAMPLE_SECONDS}s e ${CLONE_MAX_SAMPLE_SECONDS}s.`,
};

export const CLONE_I18N_EN: CloneI18n = {
  title: "Create your Akasha voice",
  introBody: "With your permission, Akasha can speak with your voice for readings and reflections.",
  consentBody: "I confirm this is my voice and authorize the use per the Terms.",
  consentAccept: "Accept and continue",
  consentDecline: "Not now",
  recordCta: "Record sample",
  reviewCta: "Submit for training",
  uploadCta: "Start training",
  retryCta: "Try again",
  minSamplesHint: `Record at least ${CLONE_MIN_SAMPLES} samples between ${CLONE_MIN_SAMPLE_SECONDS}s and ${CLONE_MAX_SAMPLE_SECONDS}s.`,
};

export const CLONE_I18N_ES: CloneI18n = {
  title: "Crea tu voz Akasha",
  introBody: "Con tu permiso, Akasha puede hablar con tu voz para lecturas y reflexiones.",
  consentBody: "Confirmo que esta es mi voz y autorizo el uso según los Términos.",
  consentAccept: "Acepto y continúo",
  consentDecline: "Ahora no",
  recordCta: "Grabar muestra",
  reviewCta: "Enviar para entrenamiento",
  uploadCta: "Iniciar entrenamiento",
  retryCta: "Reintentar",
  minSamplesHint: `Graba al menos ${CLONE_MIN_SAMPLES} muestras entre ${CLONE_MIN_SAMPLE_SECONDS}s y ${CLONE_MAX_SAMPLE_SECONDS}s.`,
};

export function getCloneI18n(lang: VoiceClone["language"]): CloneI18n {
  switch (lang) {
    case "pt-BR":
      return CLONE_I18N_PT_BR;
    case "en":
      return CLONE_I18N_EN;
    case "es":
      return CLONE_I18N_ES;
  }
}
